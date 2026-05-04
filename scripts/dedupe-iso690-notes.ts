/**
 * Cleanup pass: 93 items have 2 ISO 690 child notes due to broken
 * findIso690NoteKey in earlier run.
 *
 * For each parent in CSH/Hodinárium:
 *   1. Find all child notes containing "Citace dle ČSN ISO 690"
 *   2. Keep the one matching the FRESHLY-RENDERED canonical content
 *      (update [0] with correct content)
 *   3. Update notes [1..N] with a small DUPLICATE marker so user can
 *      easily identify and bulk-trash them in Zotero UI
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const COLLECTION_KEY = '453QY6LQ';
const TODAY = new Date().toISOString().slice(0, 10);
const DUPLICATE_MARKER = `<p><b>⚠ DUPLIKÁT — prosím smaž ručně.</b></p><p>Vznikl chybou skriptu při hromadné aktualizaci ${TODAY}. Kanonická citace ISO 690 zůstává v jiném potomkovi téhož záznamu.</p>`;

interface RefV2 {
  id: string;
  title: string;
  type: string;
  year: string;
  authors: string[];
  topUrl: string;
  canonicalNote: string;
  perFileNotes: { file: string; note: string }[];
  parsed: Record<string, string | boolean | undefined>;
}

const TYPE_MAP_ZOTERO: Record<string, string> = {
  clanek: 'journalArticle',
  article: 'journalArticle',
  kniha: 'book',
  book: 'book',
  web: 'webpage',
  webpage: 'webpage',
  diplomka: 'thesis',
  thesis: 'thesis',
  patent: 'patent',
  archiv: 'manuscript',
  manuscript: 'manuscript',
  zprava: 'report',
  report: 'report',
  mapa: 'map',
  map: 'map',
};

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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function normTitle(t: string): string {
  return t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatAuthor(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return `<b>${escapeHtml(parts[0].toUpperCase())}.</b>`;
  const surname = parts[parts.length - 1];
  const given = parts.slice(0, -1).join(' ');
  return `<b>${escapeHtml(surname.toUpperCase())}, ${escapeHtml(given)}.</b>`;
}

function extractCommentary(note: string): string {
  const idx = note.lastIndexOf(' — ');
  if (idx === -1) return '';
  return note.slice(idx + 3).trim();
}

function buildIso690Html(ref: RefV2): string {
  const p = ref.parsed as {
    publicationTitle?: string;
    volume?: string;
    issue?: string;
    pages?: string;
    place?: string;
    publisher?: string;
    ISBN?: string;
    ISSN?: string;
    DOI?: string;
    URL?: string;
    isOnline?: boolean;
    edition?: string;
  };
  const isOnline = !!p.isOnline || /^https?:\/\//.test(p.URL || '');
  const itemType = TYPE_MAP_ZOTERO[ref.type] || 'document';
  const isBook = itemType === 'book' || itemType === 'thesis';
  const isWeb = itemType === 'webpage';

  const parts: string[] = [];

  if (ref.authors.length) {
    parts.push(ref.authors.map(formatAuthor).join(' '));
  }

  if (isBook) {
    parts.push(`<i>${escapeHtml(ref.title)}</i>${isOnline ? ' [online]' : ''}.`);
  } else if (isWeb) {
    parts.push(`${escapeHtml(ref.title)} [online].`);
  } else {
    parts.push(`${escapeHtml(ref.title)}.`);
    if (p.publicationTitle) {
      parts.push(`<i>${escapeHtml(p.publicationTitle)}</i>${isOnline ? ' [online]' : ''}.`);
    }
  }

  if (p.edition && isBook) parts.push(`${escapeHtml(p.edition)}. vyd.`);

  if (isBook) {
    const pp = [p.place, p.publisher].filter(Boolean).join(': ');
    const yr = ref.year || '';
    if (pp && yr) parts.push(`${escapeHtml(pp)}, ${escapeHtml(yr)}.`);
    else if (pp) parts.push(`${escapeHtml(pp)}.`);
    else if (yr) parts.push(`${escapeHtml(yr)}.`);
  } else if (isWeb) {
    if (ref.year) parts.push(`${escapeHtml(ref.year)}.`);
  } else {
    const segs: string[] = [];
    if (ref.year) segs.push(escapeHtml(ref.year));
    if (p.volume) segs.push(`roč. ${escapeHtml(p.volume)}`);
    if (p.issue) segs.push(`č. ${escapeHtml(p.issue)}`);
    if (p.pages) segs.push(`s. ${escapeHtml(p.pages)}`);
    if (segs.length) parts.push(segs.join(', ') + (isOnline ? '' : '.'));
  }

  if (isOnline) parts.push(`[cit. ${TODAY}].`);

  if (p.ISSN) parts.push(`ISSN ${escapeHtml(p.ISSN)}.`);
  if (p.ISBN) parts.push(`ISBN ${escapeHtml(p.ISBN)}.`);

  if (p.URL) {
    parts.push(`Dostupné z: <a href="${escapeHtml(p.URL)}">${escapeHtml(p.URL)}</a>`);
  } else if (p.DOI) {
    const doiUrl = `https://doi.org/${p.DOI}`;
    parts.push(`Dostupné z: <a href="${escapeHtml(doiUrl)}">${escapeHtml(doiUrl)}</a>`);
  }

  return `<p>${parts.join(' ')}</p>`;
}

function buildChildNote(ref: RefV2): string {
  const iso690 = buildIso690Html(ref);
  const commentaries = new Map<string, string[]>();
  for (const { file, note } of ref.perFileNotes) {
    const c = extractCommentary(note);
    if (c) {
      const list = commentaries.get(c) || [];
      list.push(file);
      commentaries.set(c, list);
    }
  }
  let commentSection = '';
  if (commentaries.size) {
    const items: string[] = [];
    for (const [c, files] of commentaries) {
      const fileList = files.map((f) => `<code>${escapeHtml(f)}</code>`).join(', ');
      items.push(`<li>${escapeHtml(c)} <span style="color:#888;">(${fileList})</span></li>`);
    }
    commentSection = `<h3>Kontext citace v článcích</h3><ul>${items.join('')}</ul>`;
  }
  const allFiles = Array.from(new Set(ref.perFileNotes.map((p) => p.file)));
  const sourcesSection = allFiles.length
    ? `<h3>Zdrojové soubory v repu CSH</h3><ul>${allFiles.map((f) => `<li><code>${escapeHtml(f)}</code></li>`).join('')}</ul>`
    : '';
  return `<h2>Citace dle ČSN ISO 690</h2>${iso690}${commentSection}${sourcesSection}`;
}

interface ChildNote {
  key: string;
  body: string;
  dateAdded: string;
}

async function getIso690Notes(itemKey: string): Promise<ChildNote[]> {
  const r = await fetch(
    `http://127.0.0.1:23119/api/users/1916830/items/${itemKey}/children?format=json&limit=50`,
  );
  if (!r.ok) return [];
  const children = (await r.json()) as { key: string; data: { itemType?: string; note?: string; dateAdded: string } }[];
  return children
    .filter((c) => c.data.itemType === 'note' && (c.data.note || '').includes('Citace dle ČSN ISO 690'))
    .map((c) => ({ key: c.key, body: c.data.note || '', dateAdded: c.data.dateAdded }))
    .sort((a, b) => a.dateAdded.localeCompare(b.dateAdded));
}

async function main() {
  const refs: RefV2[] = JSON.parse(
    readFileSync(join(process.cwd(), 'tmp/csh-references-v2.json'), 'utf-8'),
  );

  const items = (await mcp('get_collection_items', {
    collectionKey: COLLECTION_KEY,
    limit: 200,
  })) as { key: string; title: string }[];

  const byTitle = new Map<string, string>();
  for (const it of items) byTitle.set(normTitle(it.title), it.key);

  let canonicalUpdated = 0;
  let dupesMarked = 0;
  let canonicalCreated = 0;
  let unmatched = 0;

  for (let i = 0; i < refs.length; i++) {
    const ref = refs[i];
    const itemKey = byTitle.get(normTitle(ref.title));
    if (!itemKey) {
      unmatched++;
      continue;
    }
    const correctHtml = buildChildNote(ref);
    const notes = await getIso690Notes(itemKey);

    if (notes.length === 0) {
      // No iso690 note → create
      await mcp('write_note', {
        action: 'create',
        parentKey: itemKey,
        content: correctHtml,
        tags: ['CSH-citace-ISO690'],
      });
      canonicalCreated++;
    } else {
      // Update [0] with correct content; mark [1..] as duplicates
      await mcp('write_note', {
        action: 'update',
        noteKey: notes[0].key,
        content: correctHtml,
      });
      canonicalUpdated++;

      for (const dup of notes.slice(1)) {
        await mcp('write_note', {
          action: 'update',
          noteKey: dup.key,
          content: DUPLICATE_MARKER,
        });
        dupesMarked++;
      }
    }

    if ((i + 1) % 10 === 0) console.log(`  ${i + 1}/${refs.length} processed`);
    await new Promise((r) => setTimeout(r, 80));
  }

  console.log(`\nCanonical updated: ${canonicalUpdated}`);
  console.log(`Canonical created (new): ${canonicalCreated}`);
  console.log(`Duplicates marked:  ${dupesMarked}`);
  console.log(`Unmatched refs:     ${unmatched}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
