#!/usr/bin/env node
/**
 * Round 2: pro kostelní záznamy s PŘIBLIŽNÝMI souřadnicemi (souradnicePribl)
 * zkusí najít na cs.wikipedii samostatný článek O KOSTELE (ne o obci),
 * z něj vezme přesné souřadnice budovy + krátký popis (extract) + foto.
 * Také doplní chybějící foto z dřívějších proposals.
 *
 *   node scripts/wiki-church-round2.mjs           # dry-run
 *   node scripts/wiki-church-round2.mjs --write
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
const WRITE = process.argv.includes('--write');
const DIR = 'content/soupis-veznich-hodin', PUB='apps/hodinarium-eu/public';
const UA='CSH-Hodinarium/1.0 (admin@horologie.cz)';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const slugify=s=>s.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,50);
const FREE=/cc[\s-]?by|cc0|public domain|pd-/i;
const CHURCHTITLE=/^(kostel|chr[áa]m|kaple|bazilik|rotunda|sbor)/i;
const CHURCHIMG=/kostel|church|chr[aá]m|kaple|kirche|bazilik|rotunda|cerkov/i;
async function api(base,p){const r=await fetch(`${base}?${new URLSearchParams({format:'json',...p})}`,{headers:{'User-Agent':UA}});if(!r.ok)throw new Error(r.status);return r.json();}
const WP='https://cs.wikipedia.org/w/api.php', CM='https://commons.wikimedia.org/w/api.php';
const strip=h=>(h?.value||'').replace(/<[^>]+>/g,'').trim();

function fm(t){const m=t.match(/^---\n([\s\S]*?)\n---/);return m?m[1]:'';}
function pm(f,k){const b=(f.match(/puvodniMisto:\s*\n((?:[ ]{2}.*\n)+)/)||[,''])[1];const r=b.match(new RegExp(`${k}:\\s*["']?([^"'\\n]+)`));return r?r[1].trim():'';}

async function churchArticle(budova,obec){
  for(const q of [`${budova} ${obec}`,`Kostel ${obec}`]){
    const d=await api(WP,{action:'query',list:'search',srsearch:q,srlimit:'5'});await sleep(250);
    for(const h of (d?.query?.search||[])){ if(CHURCHTITLE.test(h.title)) return h.title; }
  }
  return null;
}
async function pageInfo(title){
  const d=await api(WP,{action:'query',prop:'coordinates|pageimages|extracts',titles:title,piprop:'name',coprimary:'primary',exintro:'1',explaintext:'1',exsentences:'2'});await sleep(250);
  const p=Object.values(d?.query?.pages||{})[0]||{};const co=p.coordinates?.[0];
  return {lat:co?.lat,lon:co?.lon,image:p.pageimage,extract:(p.extract||'').trim()};
}
function dedic(s){return s.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/kostel|chram|kaple|bazilika|rotunda|sbor|filialni|farni|rimskokatolicky|svateho|svate|svatych|sv\b|vez|kostelni|byvaly|stary|novy|nove|nove?mestska|panny|marie/g,' ').split(/\W+/).filter(w=>w.length>2);}
function dedicationMatch(budova,title){const b=dedic(budova),t=new Set(dedic(title));if(b.length===0)return true;/* generic "Kostel" → nelze rozlišit, povol */ if(/evangelick|husit|ceskobratr/i.test(budova)&&!/evangelick|husit|ceskobratr|vzkriseni|pokoje/i.test(title))return false;return b.some(w=>t.has(w));}
function hav(a,b){const R=6371,[la1,lo1,la2,lo2]=[a[0],a[1],b[0],b[1]].map(x=>x*Math.PI/180);const d=Math.sin((la2-la1)/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin((lo2-lo1)/2)**2;return 2*R*Math.asin(Math.sqrt(d));}
async function commons(file){if(!file)return{};const d=await api(CM,{action:'query',titles:`File:${file}`,prop:'imageinfo',iiprop:'url|extmetadata'});await sleep(250);const ii=Object.values(d?.query?.pages||{})[0]?.imageinfo?.[0];if(!ii)return{};const m=ii.extmetadata||{};return{url:ii.url,license:strip(m.LicenseShortName),author:strip(m.Artist)};}

const proposals=Object.fromEntries(JSON.parse(readFileSync('tmp/wiki-church-proposals.json','utf-8')).map(o=>[o.slug,o]));
let nCoord=0,nFoto=0,nInfo=0,rep=[];
for(const file of readdirSync(DIR).filter(f=>f.endsWith('.mdx'))){
  const path=join(DIR,file); let t=readFileSync(path,'utf-8'); const F=fm(t);
  const slug=(F.match(/slug:\s*"([^"]+)"/)||[])[1]; if(!slug)continue;
  const budova=pm(F,'budova'), obec=pm(F,'obec');
  const cm=F.match(/souradnice:\s*\[\s*(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/); const cur=cm?[parseFloat(cm[1]),parseFloat(cm[2])]:null;
  if(!/kostel|chr|kaple|bazilik|sbor/i.test(budova))continue;
  const pribl=/^souradnicePribl:\s*true/m.test(F);
  const hasFoto=/^foto:/m.test(t);
  const hasInfo=/## (Budova|O budově|O kostele|Kostel)/i.test(t);
  if(!pribl && hasFoto && hasInfo) continue;          // nic netřeba

  let changed=false, log=[slug];
  // 1) přesné souřadnice z článku o kostele (jen u přibližných)
  if(pribl){
    try{
      const title=await churchArticle(budova,obec);
      if(title && !dedicationMatch(budova,title)){ log.push(`REJECT-patrocinium «${budova}» × «${title}»`); }
      else if(title){ const pi=await pageInfo(title);
        if(pi.lat && cur && hav(cur,[pi.lat,pi.lon])>4){ log.push(`REJECT ${hav(cur,[pi.lat,pi.lon]).toFixed(0)}km ${title}`); }
        else if(pi.lat){ t=t.replace(/^souradnice:\s*\[[^\]]*\]\s*$/m,`souradnice: [${pi.lat}, ${pi.lon}]`).replace(/^souradnicePribl:\s*true\s*\n/m,'');
          changed=true;nCoord++;log.push(`coord→${pi.lat},${pi.lon} (${title})`);
          // info z článku o kostele
          if(!hasInfo && pi.extract){ const note=`\n## Budova\n\n${pi.extract}\n`;
            t=t.replace(/\n*$/,'\n')+note; changed=true;nInfo++;log.push('info+'); }
          // foto z článku o kostele
          if(!hasFoto && pi.image){ const ci=await commons(pi.image);
            if(ci.url && FREE.test(ci.license||'') && CHURCHIMG.test(pi.image)){
              const fn=slugify(pi.image.replace(/\.(jpe?g|png|gif)$/i,''))+(pi.image.match(/\.(jpe?g|png|gif)$/i)?.[0]||'.jpg').toLowerCase();
              const rel=`/img/vez/${slugify(obec)}/${fn}`;
              if(WRITE){const dest=join(PUB,rel);if(!existsSync(dest)){mkdirSync(dirname(dest),{recursive:true});const r=await fetch(ci.url,{headers:{'User-Agent':UA}});if(r.ok){writeFileSync(dest,Buffer.from(await r.arrayBuffer()));try{execSync(`sips -Z 2000 "${dest}"`,{stdio:'ignore'});}catch{}}await sleep(1200);}}
              const cr=`Foto ${ci.author||'?'} (Wikimedia Commons). Licence ${ci.license}. Zdroj: https://commons.wikimedia.org/wiki/File:${encodeURIComponent(pi.image)}`;
              const blk=`foto:\n  - src: "${rel}"\n    alt: "${budova} — ${obec}"\n    credit: "${cr.replace(/"/g,'\\"')}"\n    typ: "budova"\n`;
              const parts=t.split(/^---\s*$/m); parts[1]=parts[1].replace(/\n*$/,'\n')+blk; t=parts[0]+'---'+parts[1]+'---'+parts.slice(2).join('---');
              changed=true;nFoto++;log.push('foto+(kostel-článek)');
            }
          }
        }
      }
    }catch(e){log.push('ERR '+e.message);}
  }
  // 2) chybějící foto z dřívějších proposals (i bez přibližnosti)
  if(!hasFoto && !log.some(x=>x.startsWith('foto'))){
    const o=proposals[slug];
    if(o?.image && o.free && CHURCHIMG.test(o.image) && o.imageUrl && cur && o.lat && hav(cur,[o.lat,o.lon])<=4){
      const fn=slugify(o.image.replace(/\.(jpe?g|png|gif)$/i,''))+(o.image.match(/\.(jpe?g|png|gif)$/i)?.[0]||'.jpg').toLowerCase();
      const rel=`/img/vez/${slugify(obec)}/${fn}`;
      if(WRITE){const dest=join(PUB,rel);if(!existsSync(dest)){mkdirSync(dirname(dest),{recursive:true});const r=await fetch(o.imageUrl,{headers:{'User-Agent':UA}});if(r.ok){writeFileSync(dest,Buffer.from(await r.arrayBuffer()));try{execSync(`sips -Z 2000 "${dest}"`,{stdio:'ignore'});}catch{}}await sleep(1200);}}
      const cr=`Foto ${o.author||'?'} (Wikimedia Commons). Licence ${o.license}. Zdroj: https://commons.wikimedia.org/wiki/File:${encodeURIComponent(o.image)}`;
      const blk=`foto:\n  - src: "${rel}"\n    alt: "${budova} — ${obec}"\n    credit: "${cr.replace(/"/g,'\\"')}"\n    typ: "budova"\n`;
      const parts=t.split(/^---\s*$/m); parts[1]=parts[1].replace(/\n*$/,'\n')+blk; t=parts[0]+'---'+parts[1]+'---'+parts.slice(2).join('---');
      changed=true;nFoto++;log.push('foto+(proposals)');
    }
  }
  if(changed){ if(WRITE)writeFileSync(path,t); rep.push(log.join(' | ')); }
  process.stderr.write('.');
}
process.stderr.write('\n');
console.log(`${WRITE?'WRITE':'DRY-RUN'}: coords=${nCoord} foto=${nFoto} info=${nInfo}`);
rep.slice(0,40).forEach(r=>console.log('  '+r));
