#!/usr/bin/env node
/**
 * Druhé kolo migrace partial/fragment refs na bibKey.
 *
 * Strategie:
 *   1. Re-parse titles s ISO 690 patternem "LASTNAME, FirstName, Year. Title…"
 *      → extract structured author/year/cleanTitle.
 *   2. Pro každý parsed entry:
 *      a) Search v references.json (existing Zotero) — match podle title +
 *         lastName + year. Pokud match ≥0.85, vrátí bibKey.
 *      b) Pokud no match a má lastName + year + title → add to Zotero
 *         přes MCP write_item.
 *      c) Fragment bez metadata → log do manual review.
 *   3. Re-export references.json (pokud něco bylo přidáno).
 *
 * Po dokončení druhé kolo `migrate-refs-to-bibkey.mjs` můžeme spustit
 * znovu pro aktualizaci MDX souborů.
 *
 * Použití:
 *   node scripts/resolve-remaining-refs.mjs           # dry-run
 *   node scripts/resolve-remaining-refs.mjs --apply   # apply (Zotero writes)
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const apply = process.argv.includes('--apply');
const root = process.cwd();

const refs = JSON.parse(readFileSync(
  join(root, 'apps/hodinarium-eu/src/data/references.json'), 'utf8',
));
const remaining = JSON.parse(readFileSync(
  join(root, 'tmp/zotero-export/remaining-parsed.json'), 'utf8',
));

console.log(`References v Zoteru:    ${refs.length}`);
console.log(`Remaining k vyřešení:   ${remaining.length}`);
console.log('');

// === Fuzzy match na references.json ===
function normalize(s) {
  return (s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function titleSimilarity(a, b) {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  // Substring containment (one is prefix of the other)
  const longer = na.length > nb.length ? na : nb;
  const shorter = na.length > nb.length ? nb : na;
  if (shorter.length >= 12 && longer.includes(shorter)) {
    return shorter.length / longer.length;
  }
  // Word overlap
  const wa = new Set(na.split(/\s+/).filter((w) => w.length >= 3));
  const wb = new Set(nb.split(/\s+/).filter((w) => w.length >= 3));
  const inter = [...wa].filter((w) => wb.has(w)).length;
  const union = new Set([...wa, ...wb]).size;
  return union > 0 ? inter / union : 0;
}

function findInZotero(parsed) {
  if (!parsed.cleanTitle) return null;
  const candidates = [];
  for (const r of refs) {
    const titleSim = titleSimilarity(r.title, parsed.cleanTitle);
    if (titleSim < 0.5) continue;
    let score = titleSim * 0.7;
    // Author bonus
    if (parsed.lastName && r.author) {
      const lastNorm = normalize(parsed.lastName);
      const matchAuthor = r.author.some((a) =>
        normalize(a.family || '').includes(lastNorm) ||
        normalize(a.literal || '').includes(lastNorm)
      );
      if (matchAuthor) score += 0.2;
    }
    // Year bonus
    if (parsed.year && r.issued?.['date-parts']?.[0]?.[0]) {
      if (parseInt(parsed.year) === r.issued['date-parts'][0][0]) score += 0.1;
    }
    if (score > 0.5) candidates.push({ score, ref: r });
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0] || null;
}

const matched = [];
const toAdd = [];
const fragments = [];

for (const p of remaining) {
  if (p.lastName && p.cleanTitle) {
    const m = findInZotero(p);
    if (m && m.score >= 0.85) {
      matched.push({ ...p, bibKey: m.ref['citation-key'], score: m.score });
      continue;
    }
    if (p.year) {
      // Has enough data to add to Zotero
      toAdd.push(p);
    } else {
      fragments.push(p);
    }
  } else {
    fragments.push(p);
  }
}

console.log('=== Klasifikace ===');
console.log(`  Match v existing Zotero:   ${matched.length}`);
console.log(`  K přidání do Zotera:       ${toAdd.length}`);
console.log(`  Fragment (manual review):  ${fragments.length}`);
console.log('');

if (matched.length > 0) {
  console.log('=== Matched (≥0.85) ===');
  for (const m of matched.slice(0, 20)) {
    console.log(`  [${m.score.toFixed(2)}] ${m.lastName} ${m.year}  →  ${m.bibKey}`);
  }
  if (matched.length > 20) console.log(`  … +${matched.length - 20} dalších`);
}

if (toAdd.length > 0) {
  console.log('');
  console.log('=== K přidání do Zotera ===');
  for (const p of toAdd.slice(0, 10)) {
    console.log(`  ${p.lastName}, ${p.firstName || '?'}, ${p.year}: ${p.cleanTitle.slice(0, 60)}`);
  }
  if (toAdd.length > 10) console.log(`  … +${toAdd.length - 10} dalších`);
}

writeFileSync(join(root, 'tmp/zotero-export/round3-matched.json'), JSON.stringify(matched, null, 2));
writeFileSync(join(root, 'tmp/zotero-export/round3-toAdd.json'), JSON.stringify(toAdd, null, 2));
writeFileSync(join(root, 'tmp/zotero-export/round3-fragments.json'), JSON.stringify(fragments, null, 2));

console.log('');
console.log(`Saved tmp/zotero-export/round3-{matched,toAdd,fragments}.json`);

if (!apply) {
  console.log('');
  console.log('Dry-run. Pro Zotero writes spusť s --apply.');
  process.exit(0);
}

// === Apply: add to Zotero přes MCP ===
async function callMcp(tool, args) {
  const res = await fetch('http://127.0.0.1:23120/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Math.random().toString(36).slice(2),
      method: 'tools/call',
      params: { name: tool, arguments: args },
    }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message || JSON.stringify(json.error));
  return json.result;
}

const adds = [];
const fails = [];
for (let i = 0; i < toAdd.length; i++) {
  const p = toAdd[i];
  // Detect type heuristicky
  const t = p.cleanTitle.toLowerCase();
  let itemType = 'book';
  if (/časopis|noviny|sborník|zpravodaj|revue|listy|journal/i.test(p.origTitle)) itemType = 'journalArticle';
  if (/prezentace|conference|poster/i.test(p.origTitle)) itemType = 'conferencePaper';
  if (/manuscript|rukopis|archiv/i.test(p.origTitle)) itemType = 'manuscript';
  if (/zpráva|report/i.test(p.origTitle)) itemType = 'report';

  const fields = { title: p.cleanTitle };
  if (p.year) fields.date = String(p.year);
  const creators = [];
  if (p.lastName) {
    if (p.firstName) creators.push({ creatorType: 'author', firstName: p.firstName.replace(/\.$/, ''), lastName: p.lastName });
    else creators.push({ creatorType: 'author', name: p.lastName });
  }

  try {
    const r = await callMcp('write_item', {
      action: 'create',
      itemType,
      fields,
      creators,
      tags: [{ tag: 'csh-auto-import-round3' }, { tag: 'orlojWeb' }],
    });
    const text = r?.content?.[0]?.text || '';
    const itemKey = (text.match(/[A-Z0-9]{8}/) || [])[0];
    console.log(`✓ [${i + 1}/${toAdd.length}] ${p.lastName} ${p.year} → ${itemKey || '(no key)'}`);
    adds.push({ ...p, itemKey });
  } catch (err) {
    console.log(`✗ [${i + 1}/${toAdd.length}] ${p.lastName} ${p.year}: ${err.message}`);
    fails.push({ ...p, error: err.message });
  }
  await new Promise((r) => setTimeout(r, 100));
}

console.log('');
console.log(`Added: ${adds.length}, failed: ${fails.length}`);
writeFileSync(
  join(root, 'tmp/zotero-export/round3-results.json'),
  JSON.stringify({ matched, adds, fails, fragments }, null, 2),
);
