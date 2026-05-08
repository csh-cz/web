#!/usr/bin/env node
/**
 * Audit pokrytí OG images napříč hodinarium-eu.
 *
 * Co reportuje:
 *   1. **Chybějící OG** — published článek/karta/medailon/heslo existuje,
 *      ale `public/og/<slug>.png` není
 *   2. **Orphan OG** — `public/og/<slug>.png` existuje, ale žádný
 *      odpovídající článek (zbylé po renamingu / smazání)
 *   3. **Statistiky per-collection** — kolik článků má pokrytí
 *
 * Output:
 *   - Stdout summary
 *   - tmp/og-coverage-report.json — strukturovaný report pro pipeline
 *
 * Použití:
 *   node scripts/check-og-coverage.mjs
 *   node scripts/check-og-coverage.mjs --json    # jen JSON na stdout
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..');
const JSON_ONLY = process.argv.includes('--json');

const OG_DIR = join(ROOT, 'apps/hodinarium-eu/public/og');

// === STEP 1: existing OG files ===
const existingOg = new Set();
try {
  for (const f of readdirSync(OG_DIR)) {
    if (f.endsWith('.png')) existingOg.add(f.replace(/\.png$/, ''));
  }
} catch {
  if (!JSON_ONLY) console.error(`OG directory not found: ${OG_DIR}`);
}

// === STEP 2: discover content slugs per collection ===
const collections = {
  clanky: 'content/hodinarium-eu',
  hodinari: 'content/hodinari',
  kronika: 'content/kronika',
  kroky: 'content/kroky',
  slovnik: 'content/slovnik',
  'soupis-veznich-hodin': 'content/soupis-veznich-hodin',
};

/**
 * Extract slug + draft state z frontmatter. Slug může být explicitně v
 * frontmatter (`slug: "..."`) — pokud chybí, použije se filename bez ext.
 * Drafty (frontmatter `draft: true`) skip-ujeme — ty OG nepotřebují.
 */
function parseEntry(file) {
  const txt = readFileSync(file, 'utf8');
  const fmMatch = txt.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return null;
  const fm = fmMatch[1];

  // draft check
  if (/^draft:\s*true\s*$/m.test(fm)) return { slug: null, draft: true };

  // explicit slug
  const slugMatch = fm.match(/^slug:\s*['"]?([^'"\n]+?)['"]?\s*$/m);
  if (slugMatch) return { slug: slugMatch[1].trim(), draft: false };

  // fallback: filename
  const filename = file.split('/').pop().replace(/\.(md|mdx)$/, '');
  return { slug: filename, draft: false };
}

const allRequired = new Map(); // slug → { collection, file }
const skippedDrafts = [];

for (const [colName, dir] of Object.entries(collections)) {
  const fullDir = join(ROOT, dir);
  try {
    for (const f of readdirSync(fullDir)) {
      if (!/\.(md|mdx)$/.test(f)) continue;
      const filePath = join(fullDir, f);
      const entry = parseEntry(filePath);
      if (!entry) continue;
      if (entry.draft) {
        skippedDrafts.push(`${colName}/${f}`);
        continue;
      }
      if (entry.slug) {
        allRequired.set(entry.slug, { collection: colName, file: `${dir}/${f}` });
      }
    }
  } catch (e) {
    if (!JSON_ONLY) console.error(`Failed to read ${dir}: ${e.message}`);
  }
}

// === STEP 3: top-level routes — co Base.astro `ogSlugFromPath` produkuje ===
// Tyhle slugy musí mít OG, aby /sbirka, /mapa, /tagy atd. měly social card.
const TOP_LEVEL_ROUTES = [
  'home', 'clanky',
  // Kategorie:
  'sbirka', 'konstrukce', 'projekty', 'virtualni-muzeum', 'muzea', 'zajimavosti',
  // Strukturní:
  'hodinari', 'kronika', 'tagy', 'mapa', 'mapa-horologie', 'expozice', 'kroky',
  'casova-osa', 'pro-navstevniky', 'vice', 'podpora', 'licence', 'en',
  'soupis-veznich-hodin', 'slovnik', 'o-hodinariu',
];
for (const slug of TOP_LEVEL_ROUTES) {
  if (!allRequired.has(slug)) {
    allRequired.set(slug, { collection: 'top-level', file: '(route)' });
  }
}

// === STEP 4: diff ===
const missing = [];
const orphans = [];

for (const [slug, info] of allRequired.entries()) {
  if (!existingOg.has(slug)) {
    missing.push({ slug, ...info });
  }
}
const requiredSet = new Set(allRequired.keys());
for (const slug of existingOg) {
  if (!requiredSet.has(slug)) {
    orphans.push(slug);
  }
}

// === STEP 5: per-collection stats ===
const stats = {};
for (const [, info] of allRequired) {
  const c = info.collection;
  if (!stats[c]) stats[c] = { total: 0, withOg: 0, missingOg: 0 };
  stats[c].total++;
}
for (const [slug, info] of allRequired) {
  if (existingOg.has(slug)) stats[info.collection].withOg++;
  else stats[info.collection].missingOg++;
}

const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    requiredTotal: allRequired.size,
    existingOgTotal: existingOg.size,
    missingCount: missing.length,
    orphanCount: orphans.length,
    skippedDraftsCount: skippedDrafts.length,
    coveragePct: Math.round((1 - missing.length / allRequired.size) * 1000) / 10,
  },
  perCollection: stats,
  missing: missing.slice().sort((a, b) => a.collection.localeCompare(b.collection) || a.slug.localeCompare(b.slug)),
  orphans: orphans.slice().sort(),
  skippedDrafts: skippedDrafts.slice().sort(),
};

// Write JSON
const tmpDir = join(ROOT, 'tmp');
if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });
const outPath = join(tmpDir, 'og-coverage-report.json');
writeFileSync(outPath, JSON.stringify(report, null, 2));

if (JSON_ONLY) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

// Stdout summary
console.log('=== OG image coverage audit ===');
console.log(`Requested:        ${report.summary.requiredTotal}`);
console.log(`Existing OG:      ${report.summary.existingOgTotal}`);
console.log(`Missing OG:       ${report.summary.missingCount}`);
console.log(`Orphan OG:        ${report.summary.orphanCount}`);
console.log(`Skipped (draft):  ${report.summary.skippedDraftsCount}`);
console.log(`Coverage:         ${report.summary.coveragePct} %`);
console.log('');
console.log('Per collection:');
for (const [col, s] of Object.entries(stats).sort()) {
  console.log(`  ${col.padEnd(28)} ${String(s.withOg).padStart(4)} / ${String(s.total).padStart(4)}  (missing ${s.missingOg})`);
}

if (missing.length > 0) {
  console.log('\nMissing — top 30 (collection / slug / file):');
  for (const m of missing.slice(0, 30)) {
    console.log(`  ${m.collection.padEnd(24)} ${m.slug.padEnd(40)} ${m.file}`);
  }
  if (missing.length > 30) {
    console.log(`  ... +${missing.length - 30} dalších (full list v ${outPath})`);
  }
}

if (orphans.length > 0) {
  console.log('\nOrphan OG (PNG existuje, ale článek/route nenalezen):');
  for (const o of orphans.slice(0, 20)) {
    console.log(`  ${o}.png`);
  }
  if (orphans.length > 20) {
    console.log(`  ... +${orphans.length - 20} dalších`);
  }
}

console.log(`\nFull JSON report: ${outPath.replace(`${ROOT}/`, '')}`);

// Exit kód: 0 always (read-only audit, ne CI gate)
process.exit(0);
