#!/usr/bin/env node
/**
 * Audit `_redirects` souborů — pro každý 301 redirect ověř, že target
 * existuje v `dist/`. Detekuje "zombie redirecty" — staré linky z migrace,
 * jejichž cíl byl mezitím smazán nebo přejmenován.
 *
 * Vstup:
 *   - apps/hodinarium-eu/public/_redirects
 *   - apps/horologie-cz/public/_redirects (pokud existuje)
 *
 * Předpoklad: build už proběhl (`pnpm --filter ... build`), takže
 * `apps/<app>/dist/` obsahuje finální HTML.
 *
 * Exit kódy:
 *   0 = vše OK
 *   1 = nalezeny zombie redirecty (CI gate)
 *
 * CLI:
 *   --warn   exit 0 i při nálezech (audit, ne gate)
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..');
const APPS = ['hodinarium-eu', 'horologie-cz'];
const WARN_ONLY = process.argv.includes('--warn');

function parseRedirects(text) {
  const out = [];
  let lineNo = 0;
  for (const raw of text.split('\n')) {
    lineNo++;
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    // Format: SOURCE TARGET [STATUS]
    const parts = line.split(/\s+/);
    if (parts.length < 2) continue;
    const [source, target, statusStr] = parts;
    const status = statusStr ? parseInt(statusStr, 10) : 301;
    if (Number.isNaN(status)) continue;
    out.push({ source, target, status, lineNo });
  }
  return out;
}

function targetExists(distDir, target) {
  // External redirect — cannot verify
  if (/^https?:\/\//.test(target)) return 'external';

  // Splash params (?foo, #bar)
  const cleanTarget = target.split('#')[0].split('?')[0];

  // Direct file: /foo.html
  let candidate = join(distDir, cleanTarget);
  if (existsSync(candidate)) return true;

  // Directory route (Astro `directory` mode): /foo → /foo/index.html
  candidate = join(distDir, cleanTarget, 'index.html');
  if (existsSync(candidate)) return true;

  // Astro 404 page se generuje jako 404.html (ne 404/index.html) — povolit /404
  candidate = join(distDir, `${cleanTarget.replace(/^\//, '')}.html`);
  if (existsSync(candidate)) return true;

  // Trailing slash variant
  if (cleanTarget.endsWith('/')) {
    candidate = join(distDir, cleanTarget.slice(0, -1));
    if (existsSync(candidate)) return true;
  }

  // Wildcard target (Cloudflare splat) — předpokládejme OK
  if (target.includes(':') || target.includes('*')) return 'wildcard';

  return false;
}

function audit() {
  let totalChecked = 0;
  let totalZombie = 0;
  let totalExternal = 0;
  let totalWildcard = 0;
  const zombies = [];

  for (const app of APPS) {
    const redirectsPath = join(ROOT, 'apps', app, 'public', '_redirects');
    if (!existsSync(redirectsPath)) continue;

    const distDir = join(ROOT, 'apps', app, 'dist');
    if (!existsSync(distDir)) {
      console.error(`✗ ${app}: dist/ neexistuje — spusť \`pnpm --filter ${app} build\` před auditem`);
      process.exit(2);
    }

    const text = readFileSync(redirectsPath, 'utf8');
    const redirects = parseRedirects(text);
    console.log(`\n=== ${app} ===`);
    console.log(`Redirectů: ${redirects.length}`);

    for (const r of redirects) {
      totalChecked++;
      const status = targetExists(distDir, r.target);
      if (status === true) continue;
      if (status === 'external') { totalExternal++; continue; }
      if (status === 'wildcard') { totalWildcard++; continue; }
      // Target neexistuje
      totalZombie++;
      zombies.push({ app, ...r });
    }
  }

  console.log(`\n=== Souhrn ===`);
  console.log(`Redirectů zkontrolováno: ${totalChecked}`);
  console.log(`Externí (přes http/https): ${totalExternal}`);
  console.log(`Wildcard / splat: ${totalWildcard}`);
  console.log(`Zombie (target neexistuje): ${totalZombie}`);

  if (zombies.length) {
    console.log(`\n--- Zombie redirecty ---`);
    for (const z of zombies.slice(0, 30)) {
      console.log(`  [${z.app}:${z.lineNo}]  ${z.source} → ${z.target} (${z.status})`);
    }
    if (zombies.length > 30) {
      console.log(`  … +${zombies.length - 30} dalších`);
    }
  }

  if (zombies.length && !WARN_ONLY) {
    console.error(`\n✗ Audit failed: ${zombies.length} zombie redirectů. Použij --warn pro non-gate audit.`);
    process.exit(1);
  } else if (zombies.length) {
    console.log(`\n⚠ Audit (warn-only): ${zombies.length} zombie redirectů.`);
  } else {
    console.log(`\n✓ Audit passed.`);
  }
}

audit();
