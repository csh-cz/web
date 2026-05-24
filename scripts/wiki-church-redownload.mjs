#!/usr/bin/env node
// Dotáhne chybějící kostelní fotky (foto blok přidán, ale obrázek se kvůli
// rate-limitu nestáhl). Throttle 1.5 s + retry na 429/5xx.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
const UA='CSH-Hodinarium/1.0 (admin@horologie.cz)';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const slugify=s=>s.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,50);
const DIR='content/soupis-veznich-hodin', PUB='apps/hodinarium-eu/public';
const props=JSON.parse(readFileSync('tmp/wiki-church-proposals.json','utf-8'));
let ok=0,miss=0,already=0,fail=[];
for(const o of props){
  if(!o.image||!o.imageUrl) continue;
  const fname=slugify(o.image.replace(/\.(jpe?g|png|gif)$/i,''))+(o.image.match(/\.(jpe?g|png|gif)$/i)?.[0]||'.jpg').toLowerCase();
  const rel=`/img/vez/${slugify(o.obec)}/${fname}`;
  // jen pokud má daný záznam tento foto blok
  const mdx=join(DIR,o.slug+'.mdx'); if(!existsSync(mdx)) continue;
  if(!readFileSync(mdx,'utf-8').includes(rel)) continue;
  const dest=join(PUB,rel);
  if(existsSync(dest)){already++;continue;}
  mkdirSync(dirname(dest),{recursive:true});
  let done=false;
  for(let attempt=1;attempt<=3 && !done;attempt++){
    try{
      const r=await fetch(o.imageUrl,{headers:{'User-Agent':UA}});
      if(r.ok){const b=Buffer.from(await r.arrayBuffer());writeFileSync(dest,b);
        try{execSync(`sips -Z 2000 "${dest}"`,{stdio:'ignore'});}catch{}
        ok++;done=true;}
      else{await sleep(2000*attempt);}
    }catch(e){await sleep(2000*attempt);}
  }
  if(!done){miss++;fail.push(o.slug);}
  await sleep(1500);
  process.stderr.write(done?'.':'x');
}
process.stderr.write('\n');
console.log(`staženo nově: ${ok} | už existovalo: ${already} | NEPODAŘILO: ${miss}`);
if(fail.length) console.log('  fail:',fail.join(', '));
