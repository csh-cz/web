/**
 * Import tmp/csh-references.csl.json into Zotero via local connector endpoint.
 *
 * - Each item gets tag `CSH-Hodinarium` and collection key 453QY6LQ
 * - Maps CSL types → Zotero item types
 * - Maps `note` field → Zotero `extra`
 *
 * Usage: pnpm tsx scripts/import-references-to-zotero.ts
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const COLLECTION_KEY = '453QY6LQ'; // Hodinárium under CSH
const TAG = 'CSH-Hodinarium';

interface CSLItem {
  id: string;
  type: string;
  title: string;
  author?: { family?: string; given?: string; literal?: string }[];
  issued?: { 'date-parts': number[][] };
  'container-title'?: string;
  URL?: string;
  ISBN?: string;
  ISSN?: string;
  DOI?: string;
  note?: string;
}

const TYPE_MAP: Record<string, string> = {
  'article-journal': 'journalArticle',
  book: 'book',
  thesis: 'thesis',
  patent: 'patent',
  manuscript: 'manuscript',
  report: 'report',
  webpage: 'webpage',
  map: 'map',
  standard: 'document',
};

async function main() {
const cslItems: CSLItem[] = JSON.parse(
  readFileSync(join(process.cwd(), 'tmp/csh-references.csl.json'), 'utf-8'),
);

console.log(`Loaded ${cslItems.length} CSL items`);

let ok = 0;
let fail = 0;
const failures: { title: string; error: string }[] = [];

for (let i = 0; i < cslItems.length; i++) {
  const csl = cslItems[i];
  const itemType = TYPE_MAP[csl.type] || 'document';

  const creators = (csl.author || []).map((a) => {
    if (a.literal) {
      return { creatorType: 'author', name: a.literal };
    }
    return {
      creatorType: 'author',
      firstName: a.given || '',
      lastName: a.family || '',
    };
  });

  const date = csl.issued?.['date-parts']?.[0]?.[0]
    ? String(csl.issued['date-parts'][0][0])
    : '';

  // Map container-title to the right Zotero field per type
  const containerField =
    itemType === 'journalArticle'
      ? 'publicationTitle'
      : itemType === 'book' || itemType === 'thesis'
        ? 'series'
        : 'publicationTitle';

  const item: Record<string, unknown> = {
    itemType,
    title: csl.title,
    creators,
    date,
    tags: [{ tag: TAG }],
    collections: [COLLECTION_KEY],
  };

  if (csl['container-title']) {
    item[containerField] = csl['container-title'];
  }
  if (csl.URL) item.url = csl.URL;
  if (csl.ISBN) item.ISBN = csl.ISBN;
  if (csl.ISSN) item.ISSN = csl.ISSN;
  if (csl.DOI) item.DOI = csl.DOI;
  if (csl.note) item.extra = csl.note;

  // Type-specific quirks: 'map' uses 'date' but Zotero web map type wants 'date'
  // 'webpage' uses 'websiteTitle' instead of publicationTitle
  if (itemType === 'webpage' && csl['container-title']) {
    item.websiteTitle = csl['container-title'];
    delete item[containerField];
  }

  const body = JSON.stringify({
    items: [item],
    uri: `csh-import://${csl.id}`,
  });

  try {
    const r = await fetch('http://127.0.0.1:23119/connector/saveItems', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Zotero-Connector-API-Version': '3',
      },
      body,
    });
    if (r.status === 201) {
      ok++;
      if ((i + 1) % 10 === 0) {
        console.log(`  ${i + 1}/${cslItems.length}: ${csl.title.slice(0, 60)}`);
      }
    } else {
      const text = await r.text();
      fail++;
      failures.push({ title: csl.title, error: `${r.status}: ${text.slice(0, 200)}` });
    }
  } catch (e) {
    fail++;
    failures.push({ title: csl.title, error: String(e).slice(0, 200) });
  }

  // Light throttle: don't hammer Zotero
  await new Promise((res) => setTimeout(res, 50));
}

console.log(`\nDone: ${ok} OK / ${fail} failed (of ${cslItems.length})`);
if (failures.length) {
  console.log('\nFailures:');
  for (const f of failures) {
    console.log(`  - ${f.title.slice(0, 80)}: ${f.error}`);
  }
}
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
