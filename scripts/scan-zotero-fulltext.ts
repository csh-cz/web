/**
 * Pass 1 of full Zotero PDF scanner: pull OCR'd text via Zotero's get_content
 * for every item in CSH/Hodinárium, scan for clock mentions, dump results.
 *
 * For items where get_content returns substantial OCR text (>1 KB), we know
 * Zotero's local plugin (Tesseract-based) already OCR'd them.
 *
 * For items returning short/empty text, Pass 2 (docling) will be needed —
 * those will be logged to tmp/zotero-no-ocr.txt for follow-up.
 *
 * Output:
 *   tmp/zotero-fulltext-mentions.json — clock mentions extracted
 *   tmp/zotero-no-ocr.txt             — items needing docling OCR
 *   tmp/zotero-ocr-summary.tsv        — per-item content length stats
 */
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';

const COLLECTION_KEY = '453QY6LQ';

interface ZoteroItem {
  key: string;
  title: string;
  creators?: string;
  date?: string;
  attachments?: { key: string; filename?: string; contentType?: string }[];
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

interface Mention {
  zoteroKey: string;
  itemTitle: string;
  obec: string;
  budova?: string;
  rok?: string;
  cena?: string;
  rawMatch: string;
}

function extractPlaceYear(text: string, key: string, title: string): Mention[] {
  const out: Mention[] = [];
  // Same regex as scan-clock-mentions.ts
  const re = /([A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][a-zá-žA-ZÁ-Ž\s\.\-]{2,40}?)\s*\((\d{4}(?:[\-–]\d{2,4})?)(?:[,;]\s*([^)]{0,200}))?\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const [raw, place, year, rest] = m;
    const cleanPlace = place.trim().replace(/^(roku|v|na|u|do|od)\s+/i, '');
    if (cleanPlace.length < 3) continue;
    if (/\b(Knespl|Hartman|Nekut|Fischer|Vlach|Paukert|Steinich|Schwabi|Karpetes|Kindner|Knespla|Nekuta|Pampusch|Erhard)\b/.test(cleanPlace)) continue;
    if (/^(kostel|kaple|kapitola|sekce|díl|str|s\.|fig|obr|tab|pozn|page|note|chapter|nr|č|cislo|čís)\b/i.test(cleanPlace)) continue;
    let budova: string | undefined;
    let cena: string | undefined;
    if (rest) {
      const restTrim = rest.trim();
      const bm = restTrim.match(/(kostel|kaple|kostelík|radnice|zámek|škola|zvonice|věž|továrna|kasárna|hřbitov|chrám|katedrála|synagoga|úřad|nádraží|ústav)\s+[^,]+/i);
      if (bm) budova = bm[0];
      const cm = restTrim.match(/(\d+\s*(zl|K|Kč|tolarů|zlatých))/i);
      if (cm) cena = cm[0];
    }
    out.push({
      zoteroKey: key,
      itemTitle: title.slice(0, 80),
      obec: cleanPlace,
      budova,
      rok: year,
      cena,
      rawMatch: raw.slice(0, 150),
    });
  }
  return out;
}

async function main() {
  const items = (await mcp('get_collection_items', {
    collectionKey: COLLECTION_KEY,
    limit: 200,
  })) as ZoteroItem[];

  console.log(`Items in CSH/Hodinárium: ${items.length}`);
  console.log(`Trying get_content (mode=complete) for each...`);

  const allMentions: Mention[] = [];
  const noOcr: { key: string; title: string }[] = [];
  const summary: { key: string; title: string; chars: number; mentions: number }[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    let text = '';
    try {
      const resp = (await mcp('get_content', {
        itemKey: item.key,
        mode: 'complete',
        format: 'text',
      })) as unknown;
      text = String(resp);
    } catch {
      noOcr.push({ key: item.key, title: item.title });
      summary.push({ key: item.key, title: item.title, chars: 0, mentions: 0 });
      continue;
    }

    if (text.length < 1024) {
      noOcr.push({ key: item.key, title: item.title });
      summary.push({ key: item.key, title: item.title, chars: text.length, mentions: 0 });
      continue;
    }

    const mentions = extractPlaceYear(text, item.key, item.title);
    allMentions.push(...mentions);
    summary.push({ key: item.key, title: item.title, chars: text.length, mentions: mentions.length });

    if ((i + 1) % 10 === 0) {
      console.log(`  ${i + 1}/${items.length} | last: "${item.title.slice(0, 50)}" — ${text.length} chars, ${mentions.length} mentions`);
    }
  }

  // Output
  if (!existsSync('tmp')) mkdirSync('tmp', { recursive: true });

  // Mentions JSON
  const sorted = allMentions.sort((a, b) => {
    const ya = parseInt(a.rok || '0', 10);
    const yb = parseInt(b.rok || '0', 10);
    if (ya !== yb) return ya - yb;
    return a.obec.localeCompare(b.obec, 'cs');
  });
  writeFileSync('tmp/zotero-fulltext-mentions.json', JSON.stringify(sorted, null, 2));

  // No-OCR list (for docling pass 2)
  writeFileSync(
    'tmp/zotero-no-ocr.txt',
    noOcr.map((n) => `${n.key}\t${n.title}`).join('\n') + '\n',
  );

  // Per-item summary
  const tsv = ['key\tchars\tmentions\ttitle']
    .concat(summary.sort((a, b) => b.chars - a.chars).map((s) => `${s.key}\t${s.chars}\t${s.mentions}\t${s.title.replace(/\t/g, ' ')}`))
    .join('\n');
  writeFileSync('tmp/zotero-ocr-summary.tsv', tsv);

  // Stats
  const withOcr = summary.filter((s) => s.chars >= 1024).length;
  const withoutOcr = summary.length - withOcr;
  const totalChars = summary.reduce((sum, s) => sum + s.chars, 0);
  const totalMentions = summary.reduce((sum, s) => sum + s.mentions, 0);

  console.log(`\nProcessed: ${items.length}`);
  console.log(`  with OCR text (≥1 KB): ${withOcr}`);
  console.log(`  without (need docling): ${withoutOcr}`);
  console.log(`Total chars scanned: ${(totalChars / 1024).toFixed(0)} KB`);
  console.log(`Mentions extracted: ${totalMentions}`);
  console.log(`\nWritten:`);
  console.log(`  tmp/zotero-fulltext-mentions.json`);
  console.log(`  tmp/zotero-no-ocr.txt (${withoutOcr} items)`);
  console.log(`  tmp/zotero-ocr-summary.tsv`);
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
