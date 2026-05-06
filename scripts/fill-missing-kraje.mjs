#!/usr/bin/env node
/**
 * Pro CZ záznamy v content/soupis-veznich-hodin/ s chybějícím
 * `puvodniMisto.kraj` použije reverse-geocode (Nominatim) k dohledání
 * a vepíše ho do frontmatteru.
 *
 * Strategie:
 *   1. Pro záznamy se `souradnice: [lat, lon]` → reverse geocode
 *      `https://nominatim.openstreetmap.org/reverse?lat=&lon=&format=jsonv2&accept-language=cs&zoom=8`
 *      → response.address.state je název kraje
 *   2. Pro záznamy bez souradnic → forward search:
 *      `/search?q=<obec>,Czechia&format=jsonv2&accept-language=cs&limit=1`
 *      → result[0].address.state
 *
 * Rate limit: Nominatim free tier vyžaduje 1 req/sec + custom User-Agent.
 *
 * Cache v tmp/kraj-cache.json — idempotent, opakované běhy nedotazují
 * Nominatim na již získané hodnoty.
 *
 * Použití:
 *   node scripts/fill-missing-kraje.mjs        # dry-run (resolve + ulož cache, needitovat MDX)
 *   node scripts/fill-missing-kraje.mjs --apply
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const apply = process.argv.includes('--apply');
const root = process.cwd();
const NOMINATIM = 'https://nominatim.openstreetmap.org';
const UA = 'csh-orlojWeb-kraj-filler/1.0 (https://hodinarium-eu.pages.dev; contact: info@orloj.eu)';
const RATE_MS = 2200; // 2.2s — Nominatim měl 429 už při 1.1s, pojďme spolehlivější

const cachePath = join(root, 'tmp/kraj-cache.json');
const cache = existsSync(cachePath)
  ? JSON.parse(readFileSync(cachePath, 'utf8'))
  : {};

const missing = JSON.parse(readFileSync(join(root, 'tmp/missing-kraje.json'), 'utf8'));

console.log(`Records bez kraje: ${missing.length}`);
console.log(`Cache hit pre-run: ${Object.keys(cache).length}`);
console.log('');

async function reverseGeocode(lat, lon) {
  const url = `${NOMINATIM}/reverse?lat=${lat}&lon=${lon}&format=jsonv2&accept-language=cs&zoom=8`;
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`Nominatim ${r.status}`);
  return r.json();
}

async function forwardSearch(obec) {
  const q = encodeURIComponent(`${obec},Czechia`);
  const url = `${NOMINATIM}/search?q=${q}&format=jsonv2&accept-language=cs&limit=1`;
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`Nominatim ${r.status}`);
  const data = await r.json();
  if (!data.length) return null;
  // Forward search neposkytuje address detail v jsonv2 default — extract z display_name
  // Lépe: použít reverse na vrácených lat/lon
  const lat = parseFloat(data[0].lat);
  const lon = parseFloat(data[0].lon);
  return reverseGeocode(lat, lon);
}

function extractKraj(nominatim) {
  if (!nominatim || !nominatim.address) return null;
  // Nominatim CZ address levels: country, state (= kraj), county (= okres), …
  // Praha: state = "Hlavní město Praha"
  return nominatim.address.state || null;
}

const results = {};
let cached = 0;
let resolved = 0;
let failed = 0;

for (let i = 0; i < missing.length; i++) {
  const m = missing[i];
  const cacheKey = m.lat ? `${m.lat},${m.lon}` : `obec:${m.obec}`;
  if (cache[cacheKey] !== undefined) {
    results[m.file] = cache[cacheKey];
    cached++;
    continue;
  }

  console.log(`[${i + 1}/${missing.length}] ${m.obec || '?'} (${m.lat ? `${m.lat},${m.lon}` : 'no coords'})`);
  try {
    let data;
    if (m.lat && m.lon) data = await reverseGeocode(m.lat, m.lon);
    else if (m.obec) data = await forwardSearch(m.obec);
    else { failed++; continue; }

    const kraj = extractKraj(data);
    cache[cacheKey] = kraj;
    results[m.file] = kraj;
    if (kraj) resolved++;
    else failed++;
    console.log(`  → ${kraj || '(no kraj found)'}`);
  } catch (err) {
    console.log(`  ✗ ${err.message}`);
    failed++;
  }

  // Polite rate-limit
  await new Promise((r) => setTimeout(r, RATE_MS));

  // Save cache periodically
  if ((i + 1) % 10 === 0) {
    writeFileSync(cachePath, JSON.stringify(cache, null, 2));
  }
}

writeFileSync(cachePath, JSON.stringify(cache, null, 2));

console.log('');
console.log(`Cached:   ${cached}`);
console.log(`Resolved: ${resolved}`);
console.log(`Failed:   ${failed}`);
console.log('');

// === Apply do MDX ===
if (!apply) {
  console.log('Dry-run. Pro zápis do MDX spusť s --apply.');
  process.exit(0);
}

let written = 0;
for (const [file, kraj] of Object.entries(results)) {
  if (!kraj) continue;
  const fullPath = join(root, file);
  let txt;
  try { txt = readFileSync(fullPath, 'utf8'); } catch { continue; }

  // Najdi puvodniMisto blok a vlož `kraj: ...` před `zeme:` (nebo na konec bloku)
  // Pattern: puvodniMisto:\n  obec: ...\n  cast: ...\n  ... \n  zeme: ...
  const pmMatch = txt.match(/^(puvodniMisto:\n)((?:  \w+:[^\n]*\n)+)/m);
  if (!pmMatch) {
    console.log(`SKIP (no puvodniMisto): ${file}`);
    continue;
  }
  const block = pmMatch[2];
  if (/^  kraj:/m.test(block)) {
    // Už tam je (nemělo by být — ale safety)
    continue;
  }

  // Vlož `  kraj: '...'` před `  zeme:` line, nebo na konec bloku
  const safeKraj = kraj.replace(/'/g, "''");
  let newBlock;
  if (/^  zeme:/m.test(block)) {
    newBlock = block.replace(/^(  zeme:[^\n]*\n)/m, `  kraj: '${safeKraj}'\n$1`);
  } else {
    newBlock = block + `  kraj: '${safeKraj}'\n`;
  }

  const newTxt = txt.replace(pmMatch[0], pmMatch[1] + newBlock);
  writeFileSync(fullPath, newTxt);
  written++;
}

console.log(`Written: ${written} files`);
