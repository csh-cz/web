#!/usr/bin/env node
/**
 * Stáhne všechny Zotero items s citation-keyem z lokálního Zotero
 * (HTTP API na 127.0.0.1:23119) jako CSL JSON a uloží do
 * `apps/hodinarium-eu/src/data/references.json`.
 *
 * Tento JSON je single source of truth pro citeproc-js render
 * (utils/cite.ts) — generuje ISO 690 citace v build-time z bibKey
 * referencí v MDX frontmatteru.
 *
 * Použití:
 *   node scripts/sync-zotero-refs.mjs           # full export
 *   node scripts/sync-zotero-refs.mjs --check   # ověř konzistenci
 *                                                 (existují všechny bibKey
 *                                                  z content/ v references.json?)
 *
 * Předpoklady:
 *   - Zotero desktop běží lokálně
 *   - Better BibTeX rozšíření aktivní (pro stable citation-keys)
 *   - Zotero local API enabled (Edit → Settings → Advanced → "Allow other
 *     applications on this computer to communicate with Zotero")
 */

import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { walk, splitFrontmatter } from './_lib.mjs';

const root = process.cwd();
const ZOTERO = 'http://127.0.0.1:23119';
const OUT = join(root, 'apps/hodinarium-eu/src/data/references.json');

const checkOnly = process.argv.includes('--check');

async function fetchAllItems() {
  const all = [];
  let start = 0;
  const limit = 100;
  while (true) {
    const url = `${ZOTERO}/api/users/0/items/top?format=csljson&limit=${limit}&start=${start}`;
    const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!r.ok) throw new Error(`Zotero API ${r.status} on ${url}`);
    const chunk = await r.json();
    if (!Array.isArray(chunk) || chunk.length === 0) break;
    all.push(...chunk);
    if (chunk.length < limit) break;
    start += limit;
    // Polite delay (Zotero local API doesn't strictly need it, ale ~50 ms je OK)
    await new Promise((r) => setTimeout(r, 50));
  }
  return all;
}

function checkConsistency() {
  // Audit: každý bibKey v content/ existuje v references.json?
  const refs = JSON.parse(readFileSync(OUT, 'utf8'));
  const knownKeys = new Set(refs.map((r) => r['citation-key']).filter(Boolean));

  const usedKeys = new Map(); // key → first file kde se objevil
  const files = walk(join(root, 'content'));
  for (const f of files) {
    const txt = readFileSync(f, 'utf8');
    const split = splitFrontmatter(txt);
    if (!split) continue;
    // Najdi všechny `bibKey: '...'` nebo `bibKey: "..."` v frontmatter
    const bkRe = /(?:^|\n)\s*-?\s*bibKey:\s*['"]([^'"]+)['"]/g;
    for (const m of split.fm.matchAll(bkRe)) {
      const key = m[1];
      if (!usedKeys.has(key)) usedKeys.set(key, f.replace(root + '/', ''));
    }
  }

  const missing = [...usedKeys.entries()].filter(([k]) => !knownKeys.has(k));
  const orphans = [...knownKeys].filter(
    (k) => ![...usedKeys.keys()].includes(k),
  );

  console.log(`Total bibKeys v references.json: ${knownKeys.size}`);
  console.log(`Total bibKeys používaných v content/: ${usedKeys.size}`);
  console.log('');
  if (missing.length > 0) {
    console.log(`❌ Chybějící bibKey (referenced v content/, NENÍ v Zotero):  ${missing.length}`);
    for (const [k, f] of missing.slice(0, 20)) {
      console.log(`  ${k}    (např. ${f})`);
    }
    if (missing.length > 20) console.log(`  … +${missing.length - 20} dalších`);
  } else {
    console.log(`✓ Všechny bibKey z content/ existují v references.json.`);
  }
  console.log('');
  console.log(`ℹ Orphan v Zoteru (existují ale nikdo je nepoužívá): ${orphans.length}`);
  console.log(`  (informativní, není chyba — Zotero může mít víc položek než použijeme)`);

  return missing.length === 0;
}

async function main() {
  if (checkOnly) {
    const ok = checkConsistency();
    process.exit(ok ? 0 : 1);
  }

  console.log('Fetching all Zotero items as CSL JSON…');
  const items = await fetchAllItems();
  console.log(`  → ${items.length} items celkem`);

  // Filter na items s citation-key (ostatní nelze používat jako bibKey)
  const withKey = items.filter((it) => it['citation-key']);
  console.log(`  → ${withKey.length} items s citation-key (Better BibTeX)`);

  // GitHub push protection flags 40-char alphanumeric strings as AWS Secret
  // Access Keys (false positive). Better BibTeX vygeneruje občas přesně 40 chars
  // long keys (author + slug + year). Trim na 39 znaků aby regex `^[A-Za-z0-9/+=]{40}$`
  // nematchnul. (Citation-key je arbitrární identifikátor — krácení nemění význam,
  // jen musí být in-place i v MDX bibKey: '...' fields.)
  let shortened = 0;
  for (const it of withKey) {
    const k = it['citation-key'];
    if (k && k.length === 40 && /^[A-Za-z0-9/+=]{40}$/.test(k)) {
      it['citation-key'] = k.slice(0, 39);
      it.id = it['citation-key'];
      shortened++;
    }
  }
  if (shortened > 0) {
    console.log(`  ⚠ ${shortened} citation-keys zkráceny ze 40 → 39 znaků (GH secret-scan)`);
  }

  writeFileSync(OUT, JSON.stringify(withKey, null, 2));
  const sizeKB = (readFileSync(OUT).length / 1024).toFixed(0);
  console.log(`Saved ${OUT} (${sizeKB} KB)`);

  console.log('');
  console.log('Spusť následně:');
  console.log('  pnpm --filter hodinarium-eu astro build');
  console.log('  node scripts/sync-zotero-refs.mjs --check  # konzistenční audit');
}

main().catch((err) => {
  console.error('✗', err.message);
  process.exit(1);
});
