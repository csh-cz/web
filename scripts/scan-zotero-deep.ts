/**
 * Deep scan: walk relevant Zotero collections recursively, pull OCR'd
 * text from every item via get_content, extract clock mentions.
 *
 * Target collections (root + all sub-collections):
 *   - L4WSJ2RP  Věžní hodiny (27 + sub)
 *   - V6W3ENFV  Katalogizace věžních hodin (25)
 *   - LJ4HEUDZ  Hodináři (10 + 31 sub-cols per maker)
 *   - 88GE5DW5  Nejstarší hodiny v českých zemích (9 + 29 sub)
 *   - 2ZA9ZFM7  Čeští hodináři (31)
 *
 * Filter: regex matches "Place (year, info)" but excludes person-name
 * patterns (year-year) where date span > 15 years (likely birth-death).
 *
 * Output: tmp/zotero-deep-mentions.json — sorted, dedup'd
 *         tmp/zotero-deep-stats.tsv — per-collection coverage
 *
 * Note: read-only. Does NOT write to Zotero.
 */
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';

const ROOT_COLLECTIONS = [
  { key: 'L4WSJ2RP', name: 'Věžní hodiny' },
  { key: 'V6W3ENFV', name: 'Katalogizace věžních hodin' },
  { key: 'LJ4HEUDZ', name: 'Hodináři' },
  { key: '88GE5DW5', name: 'Nejstarší hodiny v českých zemích' },
  { key: '2ZA9ZFM7', name: 'Čeští hodináři' },
];

interface ZoteroItem {
  key: string;
  title: string;
  date?: string;
  attachments?: { key: string; filename?: string; contentType?: string }[];
}

interface CollectionItem {
  key: string;
  name: string;
  path: string;
  parentCollection?: string | false;
}

interface Mention {
  zoteroKey: string;
  itemTitle: string;
  collection: string;
  obec: string;
  budova?: string;
  rok?: string;
  cena?: string;
  rawMatch: string;
}

async function mcp(name: string, args: Record<string, unknown>): Promise<unknown> {
  const r = await fetch('http://127.0.0.1:23120/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: { name, arguments: args },
    }),
  });
  const j = (await r.json()) as { result?: { content: { text: string }[] }; error?: unknown };
  if (j.error) throw new Error(JSON.stringify(j.error));
  return JSON.parse(j.result!.content[0].text);
}

async function getSubcollections(rootKey: string): Promise<CollectionItem[]> {
  try {
    const subs = (await mcp('get_subcollections', {
      collectionKey: rootKey,
      recursive: true,
    })) as CollectionItem[] | { subcollections?: CollectionItem[] };
    return Array.isArray(subs) ? subs : (subs.subcollections || []);
  } catch {
    return [];
  }
}

async function getItems(collectionKey: string): Promise<ZoteroItem[]> {
  try {
    return (await mcp('get_collection_items', {
      collectionKey,
      limit: 200,
    })) as ZoteroItem[];
  } catch {
    return [];
  }
}

function extractMentions(
  text: string,
  itemKey: string,
  itemTitle: string,
  collection: string,
): Mention[] {
  const out: Mention[] = [];
  const re = /([A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][a-zá-žA-ZÁ-Ž\s\.\-]{2,40}?)\s*\((\d{4}(?:[\-–]\d{2,4})?)(?:[,;]\s*([^)]{0,200}))?\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const [raw, place, year, rest] = m;
    const cleanPlace = place.trim().replace(/^(roku|v|na|u|do|od)\s+/i, '');
    if (cleanPlace.length < 3) continue;

    // Skip year ranges that look like birth-death (>15 year span)
    const yrMatch = year.match(/^(\d{4})[\-–](\d{2,4})$/);
    if (yrMatch) {
      const a = parseInt(yrMatch[1], 10);
      let b = parseInt(yrMatch[2], 10);
      if (b < 100) b = a - (a % 100) + b;     // "1881-82" → 1882
      const span = Math.abs(b - a);
      if (span > 15) continue;                 // looks like birth-death
    }

    // Skip person-name patterns
    if (/\b(Knespl|Hartman|Nekut|Fischer|Vlach|Paukert|Steinich|Schwabi|Karpetes|Kindner|Knespla|Nekuta|Pampusch|Erhard|Chotek|Vrbn|Kolovrat|Bruntálsk|Gerstner|Špatný|Dietzschold|Božek|Bozek|Karpeles|Schmid|Bell|Romuald|Josef|Rosalia|Clessin|Reinhardt|Wendt|Frauenfeld|Bielzia|Heynemann|Westerlund|Boettger|Andrae|Jetschin|Patskov|Mossbasch|Helix|Limax|Vitrina|Hyalina|Daudebardia|Amalia|Patula|Arion)\b/i.test(cleanPlace)) continue;
    if (/^(kostel|kaple|kostelík|kapitola|sekce|díl|str|s\.|fig|obr|tab|pozn|page|note|chapter|nr|č|cislo|čís|tel|hod|kr|book|art|chap|kniha|číslo|table|abb)\b/i.test(cleanPlace)) continue;

    // Multi-word placename: probably good
    let budova: string | undefined;
    let cena: string | undefined;
    if (rest) {
      const restTrim = rest.trim();
      const bm = restTrim.match(/(kostel|kaple|kostelík|radnice|zámek|škola|zvonice|věž|továrna|kasárna|hřbitov|chrám|katedrála|synagoga|úřad|nádraží|ústav|hvězdárna|observatoř|klášter)\s+[^,]+/i);
      if (bm) budova = bm[0];
      const cm = restTrim.match(/(\d+\s*(zl|K|Kč|tolarů|zlatých))/i);
      if (cm) cena = cm[0];
    }
    out.push({
      zoteroKey: itemKey,
      itemTitle: itemTitle.slice(0, 80),
      collection,
      obec: cleanPlace,
      budova,
      rok: year,
      cena,
      rawMatch: raw.slice(0, 200),
    });
  }
  return out;
}

async function main() {
  // Build full collection list (roots + recursive subs)
  const allColls: { key: string; name: string; path: string }[] = [];
  for (const root of ROOT_COLLECTIONS) {
    allColls.push({ key: root.key, name: root.name, path: root.name });
    const subs = await getSubcollections(root.key);
    function flatten(arr: CollectionItem[], parentPath: string) {
      for (const c of arr || []) {
        allColls.push({ key: c.key, name: c.name, path: `${parentPath} > ${c.name}` });
        const inner = (c as { subcollections?: CollectionItem[] }).subcollections;
        if (Array.isArray(inner)) flatten(inner, `${parentPath} > ${c.name}`);
      }
    }
    flatten(subs as CollectionItem[], root.name);
  }
  console.log(`Total collections to scan: ${allColls.length}`);

  // Collect unique items across all collections
  const seen = new Set<string>();
  const items: { item: ZoteroItem; collection: string }[] = [];
  for (const c of allColls) {
    const its = await getItems(c.key);
    for (const it of its) {
      if (seen.has(it.key)) continue;
      seen.add(it.key);
      items.push({ item: it, collection: c.path });
    }
  }
  console.log(`Total unique items: ${items.length}`);

  // Scan each item via get_content
  const stats: { key: string; coll: string; chars: number; mentions: number; title: string }[] = [];
  const allMentions: Mention[] = [];
  let processed = 0;
  for (const { item, collection } of items) {
    processed++;
    let text = '';
    try {
      const resp = (await mcp('get_content', {
        itemKey: item.key,
        mode: 'complete',
        format: 'text',
      })) as unknown;
      text = String(resp);
    } catch {
      // Skip
    }
    const mentions = text.length >= 1024 ? extractMentions(text, item.key, item.title, collection) : [];
    allMentions.push(...mentions);
    stats.push({ key: item.key, coll: collection, chars: text.length, mentions: mentions.length, title: item.title });
    if (processed % 25 === 0) {
      console.log(`  ${processed}/${items.length} | last: "${item.title.slice(0, 50)}" — ${text.length} chars, ${mentions.length} mentions`);
    }
  }

  // Output
  if (!existsSync('tmp')) mkdirSync('tmp', { recursive: true });

  // Dedupe by (obec normalized + year)
  function norm(s: string) {
    return s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  }
  const dedupe = new Map<string, Mention>();
  for (const m of allMentions) {
    const k = `${norm(m.obec)}|${m.rok || ''}`;
    const existing = dedupe.get(k);
    if (!existing) {
      dedupe.set(k, m);
    } else {
      if (!existing.budova && m.budova) existing.budova = m.budova;
      if (!existing.cena && m.cena) existing.cena = m.cena;
    }
  }
  const sorted = Array.from(dedupe.values()).sort((a, b) => {
    const ya = parseInt(a.rok || '0', 10);
    const yb = parseInt(b.rok || '0', 10);
    if (ya !== yb) return ya - yb;
    return a.obec.localeCompare(b.obec, 'cs');
  });

  writeFileSync('tmp/zotero-deep-mentions.json', JSON.stringify(sorted, null, 2));
  writeFileSync(
    'tmp/zotero-deep-stats.tsv',
    'key\tcollection\tchars\tmentions\ttitle\n' +
      stats.sort((a, b) => b.chars - a.chars).map((s) => `${s.key}\t${s.coll}\t${s.chars}\t${s.mentions}\t${s.title.replace(/\t/g, ' ')}`).join('\n'),
  );

  // Stats
  const withOcr = stats.filter((s) => s.chars >= 1024).length;
  const totalChars = stats.reduce((s, x) => s + x.chars, 0);

  console.log(`\nDone.`);
  console.log(`  Items: ${items.length} (${withOcr} with OCR text)`);
  console.log(`  Total OCR text scanned: ${(totalChars / 1024 / 1024).toFixed(1)} MB`);
  console.log(`  Raw mentions: ${allMentions.length}`);
  console.log(`  Unique mentions: ${sorted.length}`);
  console.log(`\nWritten:`);
  console.log(`  tmp/zotero-deep-mentions.json`);
  console.log(`  tmp/zotero-deep-stats.tsv`);
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
