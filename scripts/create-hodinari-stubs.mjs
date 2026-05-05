#!/usr/bin/env node
/**
 * Vytvoří chybějící MDX stuby pro hodináře, kteří jsou definovaní v
 * `apps/hodinarium-eu/src/data/hodinari.ts` (whitelist), ale nemají
 * vlastní soubor v `content/hodinari/<slug>.mdx`.
 *
 * Důvod: bez MDX souboru CMS edit URL
 * (`/admin/#/collections/hodinari/entries/<slug>`) hodí 404, protože
 * Sveltia hledá soubor v repu. S prázdným stubem CMS otevře editor
 * a editor může doplnit medailon, references, portret, body text.
 *
 * Stub kopíruje meta z hodinari.ts (jmeno, typ, obdobi, mesto, zeme,
 * aliasy, shrnuti). Body zůstává prázdný — bude doplněn editorem.
 *
 * Použití:
 *   node scripts/create-hodinari-stubs.mjs       # dry-run
 *   node scripts/create-hodinari-stubs.mjs --apply
 */

import { readFileSync, existsSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const apply = process.argv.includes('--apply');
const root = process.cwd();
const tsPath = join(root, 'apps/hodinarium-eu/src/data/hodinari.ts');
const mdxDir = join(root, 'content/hodinari');

// --- Parse hodinari.ts ---
// Tahle parserová strategie je primitivní (regex ne-AST), ale data jsou
// strict-shaped a stabilní. Pro 100 položek je to OK; pokud se schéma
// hodinari.ts změní zásadně, tento skript je třeba upravit.

const src = readFileSync(tsPath, 'utf8');

/** Vyčte hodnotu jednoduchého stringového klíče z bloku objektu. */
function pickStr(block, key) {
  const re = new RegExp(`${key}:\\s*'((?:[^'\\\\]|\\\\.)*)'`, 's');
  const m = block.match(re);
  if (!m) return null;
  return m[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\');
}

/** Vyčte multiline string s běžnými JS unicode escapy. */
function pickStrAny(block, key) {
  // Match either single or double quoted, multi-line
  const re = new RegExp(`${key}:\\s*(?:'((?:[^'\\\\]|\\\\.)*)'|"((?:[^"\\\\]|\\\\.)*)")`, 's');
  const m = block.match(re);
  if (!m) return null;
  return (m[1] ?? m[2]).replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
}

/** Vyčte array of strings (např. aliasy). */
function pickStrArray(block, key) {
  const re = new RegExp(`${key}:\\s*\\[((?:[^\\]]|\\][^,])*)\\]`, 's');
  const m = block.match(re);
  if (!m) return null;
  const items = [...m[1].matchAll(/'((?:[^'\\\\]|\\\\.)*)'/g)].map((mm) => mm[1]);
  return items.length ? items : null;
}

// Rozdělíme src na bloky pro každý záznam — najdeme `slug: '...'` a
// začneme od předchozí `{`.
const records = [];
let depth = 0;
let recStart = -1;
for (let i = 0; i < src.length; i++) {
  const c = src[i];
  if (c === '{') {
    if (depth === 0) recStart = i;
    depth++;
  } else if (c === '}') {
    depth--;
    if (depth === 0 && recStart >= 0) {
      records.push(src.slice(recStart, i + 1));
      recStart = -1;
    }
  }
}

const allEntries = records
  .map((block) => {
    const slug = pickStr(block, 'slug');
    if (!slug) return null;
    return {
      slug,
      jmeno: pickStrAny(block, 'jmeno') ?? slug,
      typ: pickStr(block, 'typ') ?? 'osoba',
      obdobi: pickStrAny(block, 'obdobi'),
      mesto: pickStrAny(block, 'mesto'),
      zeme: pickStrAny(block, 'zeme'),
      aliasy: pickStrArray(block, 'aliasy'),
      shrnuti: pickStrAny(block, 'shrnuti') ?? '',
      block,
    };
  })
  .filter(Boolean);

// --- Find missing MDX files ---
const existingMdx = new Set(
  readdirSync(mdxDir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.slice(0, -4)),
);

const missing = allEntries.filter((e) => !existingMdx.has(e.slug));

console.log(`Hodináři v hodinari.ts: ${allEntries.length}`);
console.log(`MDX souborů: ${existingMdx.size}`);
console.log(`Chybějící MDX: ${missing.length}`);
console.log('');

// --- YAML escape helpers ---
function yamlString(s) {
  if (!s) return '""';
  // Pokud obsahuje newline nebo apostrof komplikovaný, použij block scalar
  if (s.includes('\n')) {
    return '|\n  ' + s.replace(/\n/g, '\n  ');
  }
  // Apostrof v shrnuti: zdvojit
  if (s.includes("'")) {
    return `"${s.replace(/"/g, '\\"')}"`;
  }
  return `'${s}'`;
}

function yamlArray(arr) {
  if (!arr || !arr.length) return null;
  return arr.map((s) => `  - ${yamlString(s)}`).join('\n');
}

// --- Generate stubs ---
let written = 0;
for (const e of missing) {
  const dest = join(mdxDir, `${e.slug}.mdx`);
  if (existsSync(dest)) continue;

  const lines = [];
  lines.push('---');
  lines.push(`title: ${yamlString(e.jmeno)}`);
  lines.push(`slug: '${e.slug}'`);
  lines.push(`typ: ${e.typ}`);
  if (e.obdobi) lines.push(`obdobi: ${yamlString(e.obdobi)}`);
  if (e.mesto) lines.push(`mesto: ${yamlString(e.mesto)}`);
  if (e.zeme) lines.push(`zeme: '${e.zeme}'`);
  if (e.aliasy) {
    lines.push('aliasy:');
    lines.push(yamlArray(e.aliasy));
  }
  lines.push(`shrnuti: ${yamlString(e.shrnuti)}`);
  lines.push('isStub: true');
  lines.push('---');
  lines.push('');
  lines.push("import EditorNote from '../../apps/hodinarium-eu/src/components/EditorNote.astro';");
  lines.push('');
  lines.push('<EditorNote level="todo" title="Medailon je stub">');
  lines.push('  Doplň: životopis (vyučení, dílna, geografický rozsah práce), primární prameny,');
  lines.push('  references, portrétní fotku. Frontmatter `isStub` po doplnění odeber, ať se');
  lines.push('  veřejná „profil je stub" hláška skryje.');
  lines.push('</EditorNote>');
  lines.push('');

  const out = lines.join('\n');
  if (apply) {
    writeFileSync(dest, out);
    written++;
  }
  console.log((apply ? '✓ ' : '○ ') + `${e.slug}.mdx  (${e.jmeno})`);
}

console.log('');
if (apply) {
  console.log(`Hotovo. Vytvořeno ${written} stubů.`);
} else {
  console.log(`Dry-run. Pro vytvoření spusť s --apply.`);
}
