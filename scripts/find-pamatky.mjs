#!/usr/bin/env node
/**
 * Hledá NPÚ Památkový katalog ID pro budovy v `content/soupis-veznich-hodin/`
 * přes Wikidata (P4075 = Czech Monument Catalogue Number).
 *
 * Postup:
 *  1. Inventář unikátních obcí ze soupisu
 *  2. Pro každou obec wbsearchentities → Q-id
 *  3. Pro každé Q-id SPARQL: ?item wdt:P4075 ?npu ; wdt:P131 <obec_q>
 *  4. Match building name z soupisu s itemLabel z Wikidata (fuzzy)
 *  5. Output:
 *     - tmp/pamatky-matched.json   (vysokopravděpodobné páry)
 *     - tmp/pamatky-todo.md        (zbytek pro ruční rozhodnutí)
 *
 * Rate limit: ~1 req/s (Wikidata public limit). Pro 324 obcí ~5–10 minut.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..');
const SOUPIS_DIR = join(ROOT, 'content/soupis-veznich-hodin');
const OUT_DIR = join(ROOT, 'tmp');

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const UA = 'csh-web/1.0 (info@orloj.eu) MonumentCatalogueLookup';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// === Extract records ===
const records = [];
for (const f of readdirSync(SOUPIS_DIR)) {
  if (!f.endsWith('.mdx')) continue;
  const txt = readFileSync(join(SOUPIS_DIR, f), 'utf8');
  const obec = txt.match(/\bobec:\s*"([^"]+)"/)?.[1];
  if (!obec) continue;
  const budova = txt.match(/\bbudova:\s*"([^"]+)"/)?.[1] ?? '';
  const cast = txt.match(/\bcast:\s*"([^"]+)"/)?.[1] ?? '';
  const hasPk = /pamatkovyKatalog:/.test(txt);
  records.push({
    slug: f.replace('.mdx', ''),
    obec,
    cast,
    budova,
    hasPk,
  });
}
console.log(`Loaded ${records.length} records.`);

// === Group by obec ===
const byObec = new Map();
for (const r of records) {
  if (!byObec.has(r.obec)) byObec.set(r.obec, []);
  byObec.get(r.obec).push(r);
}
console.log(`Unique obce: ${byObec.size}`);

const args = process.argv.slice(2);
const LIMIT = args.includes('--limit')
  ? Number(args[args.indexOf('--limit') + 1])
  : Infinity;
const SKIP_OBCE = new Set(['Neznámé', 'neznámé', '?']);

let totalChecked = 0;
const matched = []; // strong matches
const candidates = []; // weak matches (need user review)
const noResult = []; // obce with no Wikidata results
const noQId = []; // obce we couldn't even resolve to Q-id

// Helper: normalize string for fuzzy match
function norm(s) {
  return s.toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper: keyword overlap score (0..1)
function overlapScore(a, b) {
  const ta = new Set(norm(a).split(/\s+/).filter((w) => w.length > 2));
  const tb = new Set(norm(b).split(/\s+/).filter((w) => w.length > 2));
  if (!ta.size || !tb.size) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return inter / Math.min(ta.size, tb.size);
}

async function findQId(obecLabel) {
  const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(obecLabel)}&language=cs&type=item&format=json&limit=5`;
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) return null;
  const data = await r.json();
  // Prefer "village", "municipality", "town", "obec", "městys", "město"
  const cityLike = data.search?.find((s) =>
    /village|municipality|town|m[ěe]stys|m[ěe]sto|obec|hlavn[íi]/i.test(s.description || '')
  );
  if (cityLike) return cityLike.id;
  return data.search?.[0]?.id ?? null;
}

async function getMonumentsInObec(obecQId) {
  // SPARQL: monuments with P4075 located in (P131) the obec
  const sparql = `SELECT ?item ?itemLabel ?npuId ?coord WHERE {
  ?item wdt:P4075 ?npuId .
  ?item wdt:P131 wd:${obecQId} .
  OPTIONAL { ?item wdt:P625 ?coord }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "cs,en" }
} LIMIT 50`;
  const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparql)}`;
  const r = await fetch(url, {
    headers: { Accept: 'application/sparql-results+json', 'User-Agent': UA },
  });
  if (!r.ok) return [];
  const data = await r.json();
  return data.results.bindings.map((b) => ({
    qid: b.item.value.split('/').pop(),
    label: b.itemLabel?.value ?? '',
    npuId: b.npuId.value,
    coord: b.coord?.value ?? null, // "Point(lon lat)"
  }));
}

const obceList = [...byObec.keys()];
let processed = 0;

for (const obec of obceList) {
  if (totalChecked >= LIMIT) break;
  if (SKIP_OBCE.has(obec)) continue;
  totalChecked++;
  processed++;

  const obecRecords = byObec.get(obec).filter((r) => !r.hasPk);
  if (!obecRecords.length) continue; // already done

  process.stdout.write(`[${processed}/${obceList.length}] ${obec.padEnd(30)} `);

  const qid = await findQId(obec);
  if (!qid) {
    console.log(`✗ no Q-id`);
    for (const r of obecRecords) noQId.push({ ...r, reason: 'no Q-id' });
    await sleep(500);
    continue;
  }

  const monuments = await getMonumentsInObec(qid);
  if (!monuments.length) {
    console.log(`Q${qid.slice(1)} → 0 monuments`);
    for (const r of obecRecords) noResult.push({ ...r, qid });
    await sleep(800);
    continue;
  }

  console.log(`Q${qid.slice(1)} → ${monuments.length} monuments`);

  // Match each record's budova
  for (const rec of obecRecords) {
    if (!rec.budova) {
      candidates.push({ ...rec, qid, monuments: monuments.slice(0, 5) });
      continue;
    }
    const scored = monuments
      .map((m) => ({ ...m, score: overlapScore(rec.budova, m.label) }))
      .sort((a, b) => b.score - a.score);
    const best = scored[0];
    if (best && best.score >= 0.6) {
      matched.push({
        slug: rec.slug,
        obec: rec.obec,
        cast: rec.cast,
        budova: rec.budova,
        match: {
          qid: best.qid,
          label: best.label,
          npuId: best.npuId,
          coord: best.coord,
          score: best.score,
        },
      });
    } else {
      candidates.push({
        slug: rec.slug,
        obec: rec.obec,
        cast: rec.cast,
        budova: rec.budova,
        qid,
        candidates: scored.slice(0, 5).map((s) => ({
          qid: s.qid,
          label: s.label,
          npuId: s.npuId,
          coord: s.coord,
          score: s.score,
        })),
      });
    }
  }

  await sleep(800); // be nice to Wikidata
}

// === Write outputs ===
const matchedPath = join(OUT_DIR, 'pamatky-matched.json');
const candidatesPath = join(OUT_DIR, 'pamatky-candidates.json');
const noresultPath = join(OUT_DIR, 'pamatky-no-result.json');
const todoPath = join(OUT_DIR, 'pamatky-todo.md');

writeFileSync(matchedPath, JSON.stringify(matched, null, 2));
writeFileSync(candidatesPath, JSON.stringify(candidates, null, 2));
writeFileSync(noresultPath, JSON.stringify({ noResult, noQId }, null, 2));

// Markdown report
const md = [
  `# Památkový katalog — kandidáti k doplnění`,
  ``,
  `Generováno: ${new Date().toISOString()}`,
  `Soupis: ${records.length} záznamů, ${byObec.size} obcí`,
  ``,
  `## Auto-matched (overlap ≥ 0.6) — ${matched.length}`,
  ``,
  matched.map((m) =>
    `- **${m.slug}** — \`${m.obec}\` / \`${m.budova}\` → [${m.match.label}](https://www.pamatkovykatalog.cz/?id=${m.match.npuId}) (score ${m.match.score.toFixed(2)}, NPÚ ${m.match.npuId})`
  ).join('\n'),
  ``,
  `## Kandidáti (potřeba ruční výběr) — ${candidates.length}`,
  ``,
  candidates.slice(0, 50).map((c) =>
    `- **${c.slug}** — \`${c.obec}\` / \`${c.budova || '(no budova)'}\`\n` +
    (c.candidates ? c.candidates.map((cc) =>
      `  - [${cc.label}](https://www.pamatkovykatalog.cz/?id=${cc.npuId}) (score ${cc.score.toFixed(2)}, NPÚ ${cc.npuId})`
    ).join('\n') : (c.monuments ? c.monuments.map((m) =>
      `  - [${m.label}](https://www.pamatkovykatalog.cz/?id=${m.npuId}) (NPÚ ${m.npuId})`
    ).join('\n') : ''))
  ).join('\n\n'),
  ``,
  `## Bez výsledku Wikidata (${noResult.length})`,
  ``,
  noResult.slice(0, 30).map((r) => `- ${r.slug} (${r.obec}, Q${r.qid?.slice(1)})`).join('\n'),
  ``,
  `## Nelze najít Q-ID obce (${noQId.length})`,
  ``,
  noQId.slice(0, 30).map((r) => `- ${r.slug} (${r.obec})`).join('\n'),
].join('\n');

writeFileSync(todoPath, md);

console.log(`\n=== Output ===`);
console.log(`Matched (auto):  ${matched.length} → ${matchedPath.replace(ROOT + '/', '')}`);
console.log(`Candidates:      ${candidates.length} → ${candidatesPath.replace(ROOT + '/', '')}`);
console.log(`No result:       ${noResult.length} → ${noresultPath.replace(ROOT + '/', '')}`);
console.log(`No Q-id:         ${noQId.length}`);
console.log(`Markdown report: ${todoPath.replace(ROOT + '/', '')}`);
