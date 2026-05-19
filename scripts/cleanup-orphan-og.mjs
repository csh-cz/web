#!/usr/bin/env node
/**
 * cleanup-orphan-og.mjs — smaže orphan OG PNG soubory.
 *
 * Orphan = `apps/hodinarium-eu/public/og/<slug>.png` existuje, ale žádný
 * odpovídající článek/karta/medailon/heslo/top-level route nemá tento slug
 * (typicky pozůstatek po renamingu kolekce nebo smazaném contentu).
 *
 * Mirror logika z check-og-coverage.mjs — pokud měníš jedno, sjednoť obě.
 *
 * Použití:
 *   node scripts/cleanup-orphan-og.mjs            # dry-run (jen výpis)
 *   node scripts/cleanup-orphan-og.mjs --apply    # skutečně smaže
 *
 * Volá se v `.github/workflows/og-coverage.yml` po `og:build` na push do main.
 */
import { readFileSync, readdirSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..');
const APPLY = process.argv.includes('--apply');

const OG_DIR = join(ROOT, 'apps/hodinarium-eu/public/og');

// === STEP 1: existing OG files ===
const existingOg = new Set();
try {
  for (const f of readdirSync(OG_DIR)) {
    if (f.endsWith('.png')) existingOg.add(f.replace(/\.png$/, ''));
  }
} catch (e) {
  console.error(`OG directory not found: ${OG_DIR}`);
  process.exit(1);
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

function parseEntry(file) {
  const txt = readFileSync(file, 'utf8');
  const fmMatch = txt.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return null;
  const fm = fmMatch[1];

  // drafty + stuby NEodfiltrováváme z required setu (i pro ně PNG existovat může).
  // Cílem orphan cleanup je smazat OBSAHEM nepokryté slugy, ne drafty.
  const slugMatch = fm.match(/^slug:\s*['"]?([^'"\n]+?)['"]?\s*$/m);
  if (slugMatch) return { slug: slugMatch[1].trim() };

  const filename = file.split('/').pop().replace(/\.(md|mdx)$/, '');
  return { slug: filename };
}

const allRequired = new Set();

for (const [, dir] of Object.entries(collections)) {
  const fullDir = join(ROOT, dir);
  try {
    for (const f of readdirSync(fullDir)) {
      if (!/\.(md|mdx)$/.test(f)) continue;
      const filePath = join(fullDir, f);
      const entry = parseEntry(filePath);
      if (entry?.slug) allRequired.add(entry.slug);
    }
  } catch (e) {
    console.error(`Failed to read ${dir}: ${e.message}`);
  }
}

// Top-level routes (kopie z check-og-coverage.mjs).
const TOP_LEVEL_ROUTES = [
  'home', 'clanky',
  'sbirka', 'konstrukce', 'projekty', 'virtualni-muzeum', 'muzea', 'zajimavosti',
  'hodinari', 'kronika', 'tagy', 'mapa', 'mapa-horologie', 'expozice', 'kroky',
  'casova-osa', 'pro-navstevniky', 'vice', 'podpora', 'licence', 'en',
  'soupis-veznich-hodin', 'slovnik', 'o-hodinariu',
  // Deprecated kategorie, které ještě mohou mít OG (postupná migrace):
  'decin', 'vezni-hodiny', 'ostatni',
];
for (const slug of TOP_LEVEL_ROUTES) allRequired.add(slug);

// === STEP 3: diff ===
const orphans = [];
for (const slug of existingOg) {
  if (!allRequired.has(slug)) orphans.push(slug);
}
orphans.sort();

// === STEP 4: report + (apply) ===
console.log(`# Cleanup orphan OG — ${APPLY ? 'APPLY' : 'DRY-RUN'}\n`);
console.log(`Existing OG: ${existingOg.size}`);
console.log(`Required:    ${allRequired.size}`);
console.log(`Orphans:     ${orphans.length}\n`);

if (orphans.length === 0) {
  console.log('✓ Žádné orphan PNG ke smazání.');
  process.exit(0);
}

let deleted = 0;
let failed = 0;
for (const slug of orphans) {
  const path = join(OG_DIR, `${slug}.png`);
  if (APPLY) {
    try {
      unlinkSync(path);
      console.log(`  rm ${slug}.png`);
      deleted++;
    } catch (e) {
      console.error(`  FAILED ${slug}.png: ${e.message}`);
      failed++;
    }
  } else {
    console.log(`  would rm ${slug}.png`);
  }
}

if (APPLY) {
  console.log(`\n✓ Smazáno ${deleted} orphan PNG${failed > 0 ? ` (${failed} selhalo)` : ''}.`);
  process.exit(failed > 0 ? 1 : 0);
} else {
  console.log(`\n(dry-run) — spusť s --apply pro skutečné smazání.`);
}
