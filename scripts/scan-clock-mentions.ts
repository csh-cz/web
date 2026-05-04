/**
 * Scan repo + Zotero CSH/Hodinárium for mentions of specific tower clocks.
 *
 * Sources scanned:
 *   1. content/hodinari/*.mdx body — places mentioned with years
 *   2. content/sbirka/*.mdx body
 *   3. Zotero attachments (PDFs already OCR'd) for the CSH/Hodinárium collection
 *
 * Patterns matched (Czech academic style):
 *   - "Place (year, info)" — e.g. "Bychory (1868, 900 zl.)"
 *   - "Place rok N" — e.g. "Bychory rok 1868"
 *   - List sequences separated by commas/semicolons
 *
 * Output:
 *   tmp/clock-mentions-mdx.tsv     — from MDX bodies
 *   tmp/clock-mentions-zotero.tsv  — from Zotero attachments + extras
 *   tmp/clock-mentions-merged.json — deduplicated, scored, ready for review
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const MDX_ROOTS = ['content/hodinari', 'content/sbirka', 'content/hodinarium-eu'];

interface Mention {
  source: 'mdx' | 'zotero';
  sourceId: string;        // file path or zotero key
  hodinar?: string;        // inferred from path or content
  obec: string;
  budova?: string;
  rok?: string;
  cena?: string;
  poznamka?: string;
  rawMatch: string;
}

async function main() {
// ─── 1. Scan MDX bodies ─────────────────────────────────────────────────

function* walkMdx(dir: string): Generator<string> {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) yield* walkMdx(p);
    else if (e.endsWith('.mdx') || e.endsWith('.md')) yield p;
  }
}

function getBody(text: string): string {
  if (!text.startsWith('---')) return text;
  const end = text.indexOf('\n---', 3);
  return end < 0 ? text : text.slice(end + 4);
}

/** Regex for "Place (year, optional-info)" patterns. */
function extractPlaceYear(text: string, sourceId: string, hodinar?: string): Mention[] {
  const out: Mention[] = [];

  // Czech place name = capital letter (with diacritics) + lowercase letters/spaces/dashes
  // Year = 4 digits, optionally hyphenated range
  // Match captures: place, year, rest (in parens)
  const re = /([A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][a-zá-žA-ZÁ-Ž\s\.\-]{2,40}?)\s*\((\d{4}(?:[\-–]\d{2,4})?)(?:[,;]\s*([^)]{0,200}))?\)/g;

  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const [raw, place, year, rest] = m;
    // Filter: the "place" must look like an actual place — strip leading/trailing common particles
    const cleanPlace = place.trim().replace(/^(roku|v|na|u|do|od)\s+/i, '');
    if (cleanPlace.length < 3) continue;
    // Skip if it's a person name pattern (contains "Knespl", "Hartman" etc — common authors)
    if (/\b(Knespl|Hartman|Nekut|Fischer|Vlach|Paukert|Steinich|Schwabi|Karpetes|Kindner)\b/.test(cleanPlace)) continue;
    // Skip "kostel", "kapitola" etc as primary token (those are types, not places)
    if (/^(kostel|kaple|kapitola|sekce|díl|str|s\.|fig|obr|tab)\b/i.test(cleanPlace)) continue;

    // Try to detect budova in `rest`
    let budova: string | undefined;
    let cena: string | undefined;
    let poznamka: string | undefined;
    if (rest) {
      const restTrim = rest.trim();
      // Common building keywords
      const bm = restTrim.match(/(kostel|kaple|kostelík|radnice|zámek|škola|zvonice|věž|továrna|kasárna|hřbitov|chrám|katedrála|synagoga|úřad|nádraží)\s+[^,]+/i);
      if (bm) budova = bm[0];
      // Price
      const cm = restTrim.match(/(\d+\s*(zl|K|Kč|tolarů))/);
      if (cm) cena = cm[0];
      poznamka = restTrim.slice(0, 100);
    }

    out.push({
      source: 'mdx',
      sourceId,
      hodinar,
      obec: cleanPlace,
      budova,
      rok: year,
      cena,
      poznamka,
      rawMatch: raw,
    });
  }
  return out;
}

const mdxMentions: Mention[] = [];
for (const root of MDX_ROOTS) {
  for (const path of walkMdx(root)) {
    const text = readFileSync(path, 'utf-8');
    const body = getBody(text);
    const slug = path.replace(/^.*\//, '').replace(/\.mdx?$/, '');
    // hodinář inference: if file is in content/hodinari/, slug = hodinář-slug
    const hodinarSlug = path.includes('/hodinari/') ? slug : undefined;
    const found = extractPlaceYear(body, path, hodinarSlug);
    mdxMentions.push(...found);
  }
}

// Dedupe by (obec normalized + year)
function norm(s: string) {
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}
const dedupeKey = (m: Mention) => `${norm(m.obec)}|${m.rok || ''}|${m.hodinar || ''}`;

const merged = new Map<string, Mention>();
for (const m of mdxMentions) {
  const k = dedupeKey(m);
  const existing = merged.get(k);
  if (!existing) {
    merged.set(k, m);
  } else {
    // Prefer record with budova/cena/poznamka info
    if (!existing.budova && m.budova) existing.budova = m.budova;
    if (!existing.cena && m.cena) existing.cena = m.cena;
    if (!existing.poznamka && m.poznamka) existing.poznamka = m.poznamka;
  }
}

console.log(`MDX scan: ${mdxMentions.length} raw mentions, ${merged.size} after dedup`);

// ─── 2. Scan Zotero attachments + extras ────────────────────────────────

interface ZoteroSearch {
  result: { content: { text: string }[] };
}

interface ZoteroItem {
  key: string;
  title: string;
  data?: {
    extra?: string;
    abstractNote?: string;
    title?: string;
  };
}

async function fetchZoteroCollection(): Promise<ZoteroItem[]> {
  // Use MCP get_collection_items
  const r = await fetch('http://127.0.0.1:23120/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: { name: 'get_collection_items', arguments: { collectionKey: '453QY6LQ', limit: 200 } },
    }),
  });
  const j = (await r.json()) as ZoteroSearch;
  return JSON.parse(j.result.content[0].text);
}

async function fetchZoteroExtra(key: string): Promise<string> {
  const r = await fetch(`http://127.0.0.1:23119/api/users/1916830/items/${key}?format=json`);
  if (!r.ok) return '';
  const d = (await r.json()) as { data?: { extra?: string; abstractNote?: string; title?: string } };
  const data = d.data || {};
  return [data.title, data.extra, data.abstractNote].filter(Boolean).join('\n');
}

async function fetchZoteroFullContent(key: string): Promise<string> {
  // Get full content (PDF OCR + notes)
  try {
    const r = await fetch('http://127.0.0.1:23120/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: { name: 'get_content', arguments: { itemKey: key, mode: 'preview', format: 'text' } },
      }),
    });
    const j = (await r.json()) as ZoteroSearch;
    return j.result.content[0].text || '';
  } catch {
    return '';
  }
}

console.log('\nFetching Zotero collection...');
const items = await fetchZoteroCollection();
console.log(`Got ${items.length} Zotero items`);

const zoteroMentions: Mention[] = [];
for (let i = 0; i < items.length; i++) {
  const item = items[i];
  const extra = await fetchZoteroExtra(item.key);
  // Skip if extra is too short (no real content)
  if (extra.length < 50) continue;
  const found = extractPlaceYear(extra, `zotero/${item.key}`);
  zoteroMentions.push(...found);
  if ((i + 1) % 20 === 0) console.log(`  ${i + 1}/${items.length} processed`);
}

console.log(`Zotero scan: ${zoteroMentions.length} raw mentions`);

// Merge zotero mentions with mdx
for (const m of zoteroMentions) {
  const k = dedupeKey(m);
  const existing = merged.get(k);
  if (!existing) {
    merged.set(k, m);
  } else {
    // Prefer mdx record; just track that zotero also mentions
    if (!existing.poznamka && m.poznamka) existing.poznamka = m.poznamka;
  }
}

// ─── Output ─────────────────────────────────────────────────────────────

if (!existsSync('tmp')) mkdirSync('tmp', { recursive: true });

// MDX-only TSV
const mdxTsv = ['source\tsourceId\thodinar\tobec\tbudova\trok\tcena\trawMatch']
  .concat(
    mdxMentions.map((m) =>
      [m.source, m.sourceId, m.hodinar || '', m.obec, m.budova || '', m.rok || '', m.cena || '', m.rawMatch.replace(/\t/g, ' ')].join('\t'),
    ),
  )
  .join('\n');
writeFileSync('tmp/clock-mentions-mdx.tsv', mdxTsv);

// Zotero-only TSV
const zotTsv = ['source\tsourceId\thodinar\tobec\tbudova\trok\tcena\trawMatch']
  .concat(
    zoteroMentions.map((m) =>
      [m.source, m.sourceId, m.hodinar || '', m.obec, m.budova || '', m.rok || '', m.cena || '', m.rawMatch.replace(/\t/g, ' ')].join('\t'),
    ),
  )
  .join('\n');
writeFileSync('tmp/clock-mentions-zotero.tsv', zotTsv);

// Merged JSON
const mergedArr = Array.from(merged.values()).sort((a, b) => {
  const ya = parseInt(a.rok || '0', 10);
  const yb = parseInt(b.rok || '0', 10);
  if (ya !== yb) return ya - yb;
  return a.obec.localeCompare(b.obec, 'cs');
});
writeFileSync('tmp/clock-mentions-merged.json', JSON.stringify(mergedArr, null, 2));

// Stats
const byHodinar = new Map<string, number>();
for (const m of mergedArr) {
  const h = m.hodinar || '(neznámý)';
  byHodinar.set(h, (byHodinar.get(h) || 0) + 1);
}
console.log(`\nDeduped total: ${mergedArr.length}`);
console.log(`By hodinář source:`);
for (const [h, n] of [...byHodinar.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${h.padEnd(40)} ${n}`);
}

// Top obce
const byObec = new Map<string, number>();
for (const m of mergedArr) {
  byObec.set(m.obec, (byObec.get(m.obec) || 0) + 1);
}
console.log(`\nTop obce (>= 2 mentions):`);
for (const [o, n] of [...byObec.entries()].filter(([_, n]) => n >= 2).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${o.padEnd(40)} ${n}`);
}

console.log(`\nWritten:`);
console.log(`  tmp/clock-mentions-mdx.tsv     (${mdxMentions.length} rows)`);
console.log(`  tmp/clock-mentions-zotero.tsv  (${zoteroMentions.length} rows)`);
console.log(`  tmp/clock-mentions-merged.json (${mergedArr.length} dedup'd)`);
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
