#!/usr/bin/env node
/**
 * Aplikuje návrhy z tmp/wiki-church-proposals.json do soupisu věžních hodin.
 * Bezpečnostní pravidla:
 *   - jen REFINE: wiki souřadnice do 4 km od stávající souřadnice záznamu
 *     (= ověřená správná shoda; vzdálené = špatný kostel, přeskočit)
 *   - souřadnice přepíše JEN když jsou stávající přibližné (souradnicePribl:true)
 *   - foto přidá JEN když záznam ještě žádné foto nemá a licence je volná (CC/PD)
 *
 *   node scripts/wiki-church-apply.mjs            # dry-run
 *   node scripts/wiki-church-apply.mjs --write    # zapíše + stáhne fotky
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const DIR = 'content/soupis-veznich-hodin';
const IMGROOT = 'apps/hodinarium-eu/public/img/vez';
const UA = 'CSH-Hodinarium/1.0 (admin@horologie.cz)';
const WRITE = process.argv.includes('--write');
const DOCOORDS = !process.argv.includes('--photos');
const DOPHOTOS = !process.argv.includes('--coords');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MAXKM = 4;
// foto bereme jen když je z článku evidentně o kostele (název souboru),
// jinak hrozí krajinná/obecní fotka místo kostela
const CHURCHIMG = /kostel|church|chr[aá]m|kaple|kirche|bazilik|rotunda|cerkov/i;

const slugify = (s) => s.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,50);
function hav(a,b){const R=6371,[la1,lo1,la2,lo2]=[a[0],a[1],b[0],b[1]].map(x=>x*Math.PI/180);const d=Math.sin((la2-la1)/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin((lo2-lo1)/2)**2;return 2*R*Math.asin(Math.sqrt(d));}

const props = JSON.parse(readFileSync('tmp/wiki-church-proposals.json','utf-8'));
let nCoord=0,nPhoto=0,skipConflict=0,skipPrecise=0,skipHasFoto=0,skipNoFree=0;
const report=[];

for (const o of props) {
  if (!o.lat || !o.slug) continue;
  const path = join(DIR, o.slug + '.mdx');
  if (!existsSync(path)) continue;
  let t = readFileSync(path,'utf-8');
  const cm = t.match(/^souradnice:\s*\[\s*(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/m);
  const cur = cm ? [parseFloat(cm[1]),parseFloat(cm[2])] : null;
  const pribl = /^souradnicePribl:\s*true/m.test(t);
  const hasFoto = /^foto:/m.test(t);
  if (cur) { const d=hav(cur,[o.lat,o.lon]); if (d>MAXKM){skipConflict++;continue;} }

  let changed=false;
  const churchArticle = /^(kostel|chrám|chram|kaple|bazilik|rotunda|sbor)/i.test(o.wikiTitle||'');
  // 1) souřadnice — jen pokud stávající přibližné, nebo žádné
  if (DOCOORDS && (!cur || pribl)) {
    const line = `souradnice: [${o.lat}, ${o.lon}]`;
    if (cur) t = t.replace(/^souradnice:\s*\[[^\]]*\]\s*$/m, line);
    else t = t.replace(/^(stav:\s*)/m, line+'\n$1');
    if (churchArticle) t = t.replace(/^souradnicePribl:\s*true\s*\n/m, ''); // přesné (článek o kostele)
    else if (!/^souradnicePribl:/m.test(t)) t = t.replace(/^souradnice:.*$/m, (m)=>m+'\nsouradnicePribl: true');
    changed=true; nCoord++;
  } else if (DOCOORDS) { skipPrecise++; }

  // 2) foto — jen volná licence, evidentně kostel (název souboru), jen pokud žádné foto
  if (DOPHOTOS && o.image && o.free && !hasFoto && CHURCHIMG.test(o.image)) {
    const obecSlug = slugify(o.obec);
    const fname = slugify(o.image.replace(/\.(jpe?g|png|gif)$/i,'')) + (o.image.match(/\.(jpe?g|png|gif)$/i)?.[0]||'.jpg').toLowerCase();
    const rel = `/img/vez/${obecSlug}/${fname}`;
    const credit = `Foto ${o.author||'?'} (Wikimedia Commons). Licence ${o.license}. Zdroj: https://commons.wikimedia.org/wiki/File:${encodeURIComponent(o.image)}`;
    const block = `foto:\n  - src: "${rel}"\n    alt: "${o.bud} — ${o.obec}"\n    credit: "${credit.replace(/"/g,'\\"')}"\n    typ: "budova"\n`;
    if (WRITE) {
      const dir = join(IMGROOT, obecSlug); if(!existsSync(dir)) mkdirSync(dir,{recursive:true});
      const dest = join(dir, fname);
      if (!existsSync(dest)) {
        const r = await fetch(o.imageUrl, { headers:{'User-Agent':UA} });
        if (r.ok){ const buf=Buffer.from(await r.arrayBuffer()); writeFileSync(dest,buf); await sleep(200);}
      }
    }
    // vlož foto blok před závěrečné --- frontmatteru
    const parts = t.split(/^---\s*$/m);
    if (parts.length>=3){ parts[1] = parts[1].replace(/\n*$/,'\n') + block; t = parts[0]+'---'+parts[1]+'---'+parts.slice(2).join('---'); }
    changed=true; nPhoto++; report.push(`FOTO ${o.slug} ← ${rel} (${o.license})`);
  } else if (o.image && !o.free && !hasFoto) skipNoFree++;
  else if (hasFoto) skipHasFoto++;

  if (changed && WRITE) writeFileSync(path, t);
  if (changed && !WRITE) report.push(`${o.slug}: coord=${(!cur||pribl)?'YES':'-'} foto=${(o.image&&o.free&&!hasFoto)?'YES':'-'}`);
}
console.log(`${WRITE?'WRITE':'DRY-RUN'}: coords=${nCoord} foto=${nPhoto}`);
console.log(`  skip: conflict(>${MAXKM}km)=${skipConflict} již-přesné=${skipPrecise} už-má-foto=${skipHasFoto} nevolná-licence=${skipNoFree}`);
report.slice(0,12).forEach(r=>console.log('  '+r));
