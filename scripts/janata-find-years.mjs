#!/usr/bin/env node
// Search cs.wiki obec pages + general web for Janata + year mentions
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'content/soupis-veznich-hodin';
const files = fs.readdirSync(DIR).filter(f => f.startsWith('hellich-') && f.endsWith('-janata.mdx'));

function getObec(content) {
  const m = content.match(/^\s*obec:\s*"([^"]+)"/m);
  return m ? m[1].split(/[(\(]/)[0].trim() : null;
}
function getRok(content) {
  const m = content.match(/^rok:\s*"?(\??[^"\n]*?)"?$/m);
  return m ? m[1] : null;
}

async function fetchCsWiki(obec) {
  // Try main page
  const variants = [
    obec.replace(/ /g, '_'),
    obec.replace(/ /g, '_') + '_(město)',
  ];
  for (const v of variants) {
    try {
      const url = `https://cs.wikipedia.org/wiki/${encodeURIComponent(v)}`;
      const r = await fetch(url, { headers: { 'User-Agent': 'Janata-research/1.0' }, redirect: 'follow' });
      if (!r.ok) continue;
      const html = await r.text();
      return html;
    } catch (e) {}
  }
  return null;
}

function findJanataYear(html, obec) {
  // Strip HTML tags
  const text = html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ');
  // Look for "Janata" + nearby year
  const re = /.{80}Janat[a-zíáé]?.{300}/g;
  const matches = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    const ctx = m[0];
    const yearMatch = ctx.match(/\b18[0-7][0-9]\b/);
    if (yearMatch) {
      matches.push({ year: yearMatch[0], context: ctx });
    }
  }
  return matches;
}

async function main() {
  const stubs = [];
  for (const f of files) {
    const fp = path.join(DIR, f);
    const c = fs.readFileSync(fp, 'utf-8');
    if (!c.match(/^rok:\s*"\?"/m)) continue;
    const obec = getObec(c);
    if (!obec) continue;
    stubs.push({ file: f, obec });
  }
  console.log(`Stubs to research: ${stubs.length}`);

  const found = [];
  for (const s of stubs) {
    process.stdout.write('.');
    const html = await fetchCsWiki(s.obec);
    if (!html) continue;
    const matches = findJanataYear(html, s.obec);
    if (matches.length > 0) {
      found.push({ ...s, matches });
    }
    await new Promise(r => setTimeout(r, 500));
  }
  process.stdout.write('\n');

  console.log(`\n=== Found Janata + year mentions in ${found.length} obecí: ===\n`);
  for (const f of found) {
    console.log(`${f.file}: obec=${f.obec}`);
    for (const m of f.matches) {
      console.log(`  ${m.year}: ${m.context.replace(/\s+/g, ' ').slice(0, 250)}`);
    }
    console.log();
  }

  fs.writeFileSync('tmp/janata-year-research.json', JSON.stringify(found, null, 2));
  console.log('Output: tmp/janata-year-research.json');
}

main().catch(e => { console.error(e); process.exit(1); });
