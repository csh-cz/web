#!/usr/bin/env node
/**
 * Dohledá pro kostelní záznamy v content/soupis-veznich-hodin/ na české
 * Wikipedii: (1) GPS souřadnice, (2) hlavní fotku z Wikimedia Commons včetně
 * licence + autora. Pouze DRY-RUN report do tmp/wiki-church-proposals.tsv
 * (a .json). Nic nezapisuje do soupisu — aplikace je samostatný krok.
 *
 *   node scripts/wiki-church-lookup.mjs [--all]
 *      bez --all: jen budova ~ kostel/chrám/sbor
 */
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  const fm = m ? m[1] : '';
  const get = (k) => { const r = fm.match(new RegExp(`^${k}:\\s*["']?([^"'\\n]+)`, 'm')); return r ? r[1].trim() : ''; };
  const pmBlock = (fm.match(/puvodniMisto:\s*\n((?:[ ]{2}.*\n)+)/) || [,''])[1];
  const pmGet = (k) => { const r = pmBlock.match(new RegExp(`${k}:\\s*["']?([^"'\\n]+)`)); return r ? r[1].trim() : ''; };
  return {
    slug: get('slug'),
    puvodniMisto: { budova: pmGet('budova'), obec: pmGet('obec') },
    souradnice: /^souradnice:\s*\[/m.test(fm),
    souradnicePribl: /^souradnicePribl:\s*true/m.test(fm),
  };
}

const DIR = 'content/soupis-veznich-hodin';
const UA = 'CSH-Hodinarium/1.0 (admin@horologie.cz)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ALL = process.argv.includes('--all');

async function api(base, params) {
  const u = `${base}?${new URLSearchParams({ format: 'json', ...params })}`;
  const r = await fetch(u, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`${r.status} ${u}`);
  return r.json();
}
const WP = 'https://cs.wikipedia.org/w/api.php';
const CM = 'https://commons.wikimedia.org/w/api.php';

function norm(s){return (s||'').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();}

async function findPage(budova, obec) {
  // try a couple search variants, prefer titles containing obec
  const queries = [`${budova} (${obec})`, `${budova} ${obec}`];
  for (const q of queries) {
    const d = await api(WP, { action:'query', list:'search', srsearch:q, srlimit:'5' });
    await sleep(300);
    const hits = d?.query?.search || [];
    // prefer a title that mentions the obec and "kostel"
    const obn = norm(obec);
    let best = hits.find(h => norm(h.title).includes(obn));
    if (!best) best = hits[0];
    if (best) return best.title;
  }
  return null;
}

async function pageData(title) {
  const d = await api(WP, { action:'query', prop:'coordinates|pageimages', titles:title, piprop:'name', coprimary:'primary' });
  await sleep(300);
  const pages = d?.query?.pages || {};
  const p = Object.values(pages)[0] || {};
  const co = p.coordinates?.[0];
  return { lat: co?.lat, lon: co?.lon, image: p.pageimage };
}

async function commonsInfo(file) {
  if (!file) return {};
  const d = await api(CM, { action:'query', titles:`File:${file}`, prop:'imageinfo', iiprop:'url|extmetadata' });
  await sleep(300);
  const p = Object.values(d?.query?.pages || {})[0] || {};
  const ii = p.imageinfo?.[0]; if (!ii) return {};
  const m = ii.extmetadata || {};
  const strip = (h)=> (h?.value||'').replace(/<[^>]+>/g,'').trim();
  return { url: ii.url, license: strip(m.LicenseShortName), author: strip(m.Artist), credit: strip(m.Credit) };
}

const FREE = /cc[\s-]?by|cc0|public domain|pd-/i;

const files = readdirSync(DIR).filter(f=>f.endsWith('.mdx'));
const out = [];
for (const f of files) {
  const t = readFileSync(join(DIR,f),'utf-8');
  const fm = frontmatter(t);
  const pm = fm?.puvodniMisto || {}; const bud = pm.budova||''; const obec = pm.obec||'';
  const isChurch = /kostel|chrám|chram|sbor|kaple|kaplič/i.test(bud);
  if (!obec || (!isChurch && !ALL)) continue;
  if (/soukr|nezn/i.test(obec)) continue;
  try {
    const title = await findPage(bud, obec);
    if (!title) { out.push({slug:fm.slug,obec,bud,note:'wiki:nenalezeno'}); continue; }
    const pd = await pageData(title);
    const ci = await commonsInfo(pd.image);
    out.push({ slug:fm.slug, obec, bud, hasCoord:!!fm.souradnice, pribl:!!fm.souradnicePribl,
      wikiTitle:title, lat:pd.lat, lon:pd.lon,
      image:pd.image, license:ci.license, author:ci.author, imageUrl:ci.url,
      free: ci.license? FREE.test(ci.license): false });
  } catch(e){ out.push({slug:fm.slug,obec,bud,note:'ERR '+e.message}); }
  process.stderr.write('.');
}
process.stderr.write('\n');
writeFileSync('tmp/wiki-church-proposals.json', JSON.stringify(out,null,1));
const tsv = ['slug\tobec\tbudova\twikiTitle\tlat\tlon\timage\tlicense\tfree\tauthor',
  ...out.map(o=>[o.slug,o.obec,o.bud,o.wikiTitle||o.note||'',o.lat??'',o.lon??'',o.image||'',o.license||'',o.free?'FREE':'',o.author||''].join('\t'))];
writeFileSync('tmp/wiki-church-proposals.tsv', tsv.join('\n'));
console.log(`Hotovo: ${out.length} záznamů → tmp/wiki-church-proposals.{json,tsv}`);
console.log(`  s coords: ${out.filter(o=>o.lat).length} | s CC foto: ${out.filter(o=>o.free&&o.image).length} | nenalezeno: ${out.filter(o=>o.note).length}`);
