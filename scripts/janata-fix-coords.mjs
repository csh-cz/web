#!/usr/bin/env node
// Fix missing coords for Janata Hellich import - simpler queries
import fs from 'node:fs';
import path from 'node:path';

const fixes = [
  // [slug_basename, simpler_query, country]
  ['hellich-knezice-janata', 'Kněžice okres Jičín', 'cz'],
  ['hellich-velezice-janata', null, null], // can't identify reliably
  ['hellich-kartouzy-janata', 'Valdice', 'cz'],
  ['hellich-kostelec-nad-orlici-janata', 'Kostelec nad Orlicí', 'cz'],
  ['hellich-polna-janata', 'Polná', 'cz'],
  ['hellich-chotebor-janata', 'Chotěboř', 'cz'],
  ['hellich-jindrichov-janata', 'Jindřichov Šumperk', 'cz'],
  ['hellich-bystrice-janata', 'Bystřice u Sobotky', 'cz'],
  ['hellich-lipany-janata', 'Lipany Kostelec', 'cz'],
  ['hellich-pilna-janata', 'Pilná', 'cz'],
  ['hellich-blazim-janata', 'Blažim', 'cz'],
  ['hellich-nymburk-janata', 'Nymburk', 'cz'],
  ['hellich-lviv-janata', 'Lviv', 'ua'],
  ['hellich-svitnyky-janata', null, null],
  ['hellich-chernivtsi-janata', 'Chernivtsi', 'ua'],
];

async function nominatim(query, country) {
  if (!query) return null;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1${country ? `&countrycodes=${country}` : ''}`;
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Hodinarium-CSH-Janata-fix/1.0' } });
    const d = await r.json();
    if (d.length > 0) return [parseFloat(d[0].lat), parseFloat(d[0].lon)];
  } catch (e) {
    console.error(`  err: ${e.message}`);
  }
  return null;
}

const OUT = path.resolve('content/soupis-veznich-hodin');

for (const [slug, query, country] of fixes) {
  const fp = path.join(OUT, `${slug}.mdx`);
  if (!fs.existsSync(fp)) continue;
  const content = fs.readFileSync(fp, 'utf8');
  if (content.includes('souradnice:')) {
    console.log(`SKIP (already has coords): ${slug}`);
    continue;
  }
  if (!query) {
    console.log(`SKIP (no query): ${slug}`);
    continue;
  }
  const c = await nominatim(query, country);
  await new Promise(r => setTimeout(r, 1100));
  if (!c) {
    console.log(`MISS: ${slug} (${query})`);
    continue;
  }
  // insert souradnice line before "stav:"
  const lat = Math.round(c[0]*1e6)/1e6;
  const lon = Math.round(c[1]*1e6)/1e6;
  const newContent = content.replace(/^(stav: )/m, `souradnice: [${lat}, ${lon}]\nsouradnicePribl: true\n$1`);
  fs.writeFileSync(fp, newContent);
  console.log(`OK ${slug} -> ${lat}, ${lon}`);
}
