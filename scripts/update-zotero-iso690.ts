/**
 * Update all 94 references in CSH/Hodinárium collection to ISO 690 standard.
 *
 * For each ref:
 *  1. Match Zotero item by title
 *  2. write_metadata: publicationTitle, volume, issue, pages, place, publisher,
 *                    ISBN, ISSN, DOI, url, edition + cleanup of `extra`
 *  3. write_note: child note with HTML-formatted canonical ISO 690 citation
 *                 (bold surnames, italic journal/book titles, working URL link)
 *                 + per-file commentary section
 *
 * Idempotent-ish: re-runs will overwrite metadata and create new notes
 * (we don't try to find existing csh-iso690 notes, so re-running creates dupes).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const COLLECTION_KEY = '453QY6LQ';
const TODAY = new Date().toISOString().slice(0, 10);

interface RefV2 {
  id: string;
  title: string;
  type: string;
  year: string;
  authors: string[];
  topUrl: string;
  canonicalNote: string;
  perFileNotes: { file: string; note: string }[];
  parsed: {
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
}

interface ZoteroItem {
  key: string;
  title: string;
  itemType?: string;
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

async function mcp(method: string, args: Record<string, unknown>): Promise<unknown> {
  const r = await fetch('http://127.0.0.1:23120/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: { name: method, arguments: args },
    }),
  });
  const j = (await r.json()) as Record<string, unknown>;
  if ((j as { error?: unknown }).error) throw new Error(JSON.stringify((j as { error: unknown }).error));
  const result = j.result as { content: { text: string }[] };
  return JSON.parse(result.content[0].text);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Normalize title for matching (strip diacritics, lowercase, collapse whitespace) */
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
  // "David Knespl" → "<b>KNESPL, David.</b>"
  // "J. A. Paukert" → "<b>PAUKERT, J. A.</b>"
  // "Miroslav Vlach" → "<b>VLACH, Miroslav.</b>"
  // "Karel von Habsburg" → "<b>HABSBURG, Karel von</b>" (best effort)
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return `<b>${escapeHtml(parts[0].toUpperCase())}.</b>`;
  const surname = parts[parts.length - 1];
  const given = parts.slice(0, -1).join(' ');
  return `<b>${escapeHtml(surname.toUpperCase())}, ${escapeHtml(given)}.</b>`;
}

/** Extract commentary from a note (text after " — " em-dash separator).
 *  Only em-dash (—) U+2014 is treated as commentary separator;
 *  en-dash (–) is reserved for page ranges and word breaks ("tradition – traditional"). */
function extractCommentary(note: string): string {
  // Find LAST occurrence of " — " (em-dash with surrounding spaces)
  const idx = note.lastIndexOf(' — ');
  if (idx === -1) return '';
  return note.slice(idx + 3).trim();
}

/** Build canonical ISO 690 HTML citation for a reference. */
function buildIso690Html(ref: RefV2): string {
  const p = ref.parsed;
  const isOnline = p.isOnline || /^https?:\/\//.test(p.URL || '');
  const itemType = TYPE_MAP_ZOTERO[ref.type] || 'document';
  const isBook = itemType === 'book' || itemType === 'thesis';
  const isWeb = itemType === 'webpage';

  const parts: string[] = [];

  // Authors: <b>SURNAME, Given. SURNAME2, Given2.</b>
  if (ref.authors.length) {
    parts.push(ref.authors.map(formatAuthor).join(' '));
  }

  // Title
  if (isBook) {
    // Book/thesis — title in italic
    parts.push(
      `<i>${escapeHtml(ref.title)}</i>${isOnline ? ' [online]' : ''}.`,
    );
  } else if (isWeb) {
    parts.push(`${escapeHtml(ref.title)} [online].`);
  } else {
    // Article — title plain, then journal in italic
    parts.push(`${escapeHtml(ref.title)}.`);
    if (p.publicationTitle) {
      parts.push(`<i>${escapeHtml(p.publicationTitle)}</i>${isOnline ? ' [online]' : ''}.`);
    }
  }

  // Edition (book)
  if (p.edition && isBook) {
    parts.push(`${escapeHtml(p.edition)}. vyd.`);
  }

  // Place: Publisher, Year (book/web)
  if (isBook) {
    const pp = [p.place, p.publisher].filter(Boolean).join(': ');
    const yr = ref.year || '';
    if (pp && yr) parts.push(`${escapeHtml(pp)}, ${escapeHtml(yr)}.`);
    else if (pp) parts.push(`${escapeHtml(pp)}.`);
    else if (yr) parts.push(`${escapeHtml(yr)}.`);
  } else if (isWeb) {
    if (ref.year) parts.push(`${escapeHtml(ref.year)}.`);
  } else {
    // Article: Year, roč. V, č. I, s. P-P.
    const segs: string[] = [];
    if (ref.year) segs.push(escapeHtml(ref.year));
    if (p.volume) segs.push(`roč. ${escapeHtml(p.volume)}`);
    if (p.issue) segs.push(`č. ${escapeHtml(p.issue)}`);
    if (p.pages) segs.push(`s. ${escapeHtml(p.pages)}`);
    // For online sources, [cit.] follows directly without trailing period on segs
    if (segs.length) {
      parts.push(segs.join(', ') + (isOnline ? '' : '.'));
    }
  }

  // [cit.] for online sources
  if (isOnline) {
    parts.push(`[cit. ${TODAY}].`);
  }

  // Identifiers
  if (p.ISSN) parts.push(`ISSN ${escapeHtml(p.ISSN)}.`);
  if (p.ISBN) parts.push(`ISBN ${escapeHtml(p.ISBN)}.`);

  // URL with link
  if (p.URL) {
    parts.push(`Dostupné z: <a href="${escapeHtml(p.URL)}">${escapeHtml(p.URL)}</a>`);
  } else if (p.DOI) {
    const doiUrl = `https://doi.org/${p.DOI}`;
    parts.push(`Dostupné z: <a href="${escapeHtml(doiUrl)}">${escapeHtml(doiUrl)}</a>`);
  }

  return `<p>${parts.join(' ')}</p>`;
}

/** Build child note: ISO 690 + per-file commentary. */
function buildChildNote(ref: RefV2): string {
  const iso690 = buildIso690Html(ref);

  // Per-file commentary: collect distinct commentary texts
  const commentaries = new Map<string, string[]>(); // commentary text → [files]
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

  // List of all source MDX files (even if no commentary)
  const allFiles = Array.from(new Set(ref.perFileNotes.map((p) => p.file)));
  let sourcesSection = '';
  if (allFiles.length) {
    sourcesSection = `<h3>Zdrojové soubory v repu CSH</h3><ul>${allFiles.map((f) => `<li><code>${escapeHtml(f)}</code></li>`).join('')}</ul>`;
  }

  return `<h2>Citace dle ČSN ISO 690</h2>${iso690}${commentSection}${sourcesSection}`;
}

/** Build write_metadata fields payload. */
function buildMetadataFields(ref: RefV2): Record<string, string> {
  const p = ref.parsed;
  const fields: Record<string, string> = {};
  if (p.publicationTitle) fields.publicationTitle = p.publicationTitle;
  if (p.volume) fields.volume = p.volume;
  if (p.issue) fields.issue = p.issue;
  if (p.pages) fields.pages = p.pages;
  if (p.place) fields.place = p.place;
  if (p.publisher) fields.publisher = p.publisher;
  if (p.ISBN) fields.ISBN = p.ISBN;
  if (p.ISSN) fields.ISSN = p.ISSN;
  if (p.DOI) fields.DOI = p.DOI;
  if (p.URL) fields.url = p.URL;
  if (p.edition) fields.edition = p.edition;

  // Set extra to a clean line listing CSH source files (replaces previous polluted extra)
  // The full canonical ISO 690 citation lives in the child note
  return fields;
}

async function main() {
  const DRY_RUN = process.argv.includes('--dry-run');
  const LIMIT = process.argv.includes('--limit') ? parseInt(process.argv[process.argv.indexOf('--limit') + 1], 10) : Infinity;

  const refs: RefV2[] = JSON.parse(
    readFileSync(join(process.cwd(), 'tmp/csh-references-v2.json'), 'utf-8'),
  );

  if (DRY_RUN) {
    console.log('=== DRY RUN — no changes will be written ===\n');
    const sample = refs.slice(0, Math.min(LIMIT, 5));
    for (const ref of sample) {
      console.log(`\n## ${ref.title.slice(0, 80)}`);
      console.log('Type:', ref.type);
      console.log('Authors:', ref.authors);
      console.log('Parsed fields:', ref.parsed);
      const fields = buildMetadataFields(ref);
      console.log('write_metadata payload:', fields);
      const note = buildChildNote(ref);
      console.log('write_note HTML:');
      console.log(note);
    }
    return;
  }

  // Get current Zotero items in collection
  const itemsResp = (await mcp('get_collection_items', {
    collectionKey: COLLECTION_KEY,
    limit: 200,
  })) as ZoteroItem[];
  console.log(`Collection has ${itemsResp.length} items`);

  // Build title→key map
  const byTitle = new Map<string, string>();
  for (const it of itemsResp) {
    byTitle.set(normTitle(it.title), it.key);
  }

  // Pre-fetch child notes per item: find existing CSH-citace-ISO690 notes via direct API
  // (the local /api/users/.../items/<key>/children endpoint returns full note bodies)
  // We use the bookmark `<h2>Citace dle ČSN ISO 690</h2>` to identify OUR notes.
  async function findIso690NoteKey(itemKey: string): Promise<string | null> {
    const r = await fetch(
      `http://127.0.0.1:23119/api/users/1916830/items/${itemKey}/children?format=json`,
    );
    if (!r.ok) return null;
    const children = (await r.json()) as { key: string; itemType: string; note?: string }[];
    for (const c of children) {
      if (c.itemType === 'note' && c.note && c.note.includes('Citace dle ČSN ISO 690')) {
        return c.key;
      }
    }
    return null;
  }

  let metaOk = 0;
  let metaSkip = 0;
  let metaFail = 0;
  let noteOk = 0;
  let noteFail = 0;
  const unmatched: string[] = [];

  for (let i = 0; i < refs.length; i++) {
    const ref = refs[i];
    const key = byTitle.get(normTitle(ref.title));
    if (!key) {
      unmatched.push(ref.title);
      continue;
    }

    const fields = buildMetadataFields(ref);
    if (Object.keys(fields).length > 0) {
      try {
        await mcp('write_metadata', { itemKey: key, fields });
        metaOk++;
      } catch (e) {
        console.error(`  meta FAIL ${key}: ${ref.title.slice(0, 50)} — ${String(e).slice(0, 100)}`);
        metaFail++;
      }
    } else {
      metaSkip++;
    }

    // Build/update formatted child note. If existing CSH-citace-ISO690 note found → update; else create.
    const noteHtml = buildChildNote(ref);
    const existingNoteKey = await findIso690NoteKey(key);
    try {
      if (existingNoteKey) {
        await mcp('write_note', {
          action: 'update',
          noteKey: existingNoteKey,
          content: noteHtml,
        });
      } else {
        await mcp('write_note', {
          action: 'create',
          parentKey: key,
          content: noteHtml,
          tags: ['CSH-citace-ISO690'],
        });
      }
      noteOk++;
    } catch (e) {
      console.error(`  note FAIL ${key}: ${ref.title.slice(0, 50)} — ${String(e).slice(0, 100)}`);
      noteFail++;
    }

    if ((i + 1) % 10 === 0) {
      console.log(`  ${i + 1}/${refs.length} processed`);
    }
    // Throttle to avoid overwhelming Zotero
    await new Promise((r) => setTimeout(r, 80));
  }

  console.log(`\nMetadata: ${metaOk} ok, ${metaSkip} skipped (no parsed fields), ${metaFail} failed`);
  console.log(`Notes:    ${noteOk} ok, ${noteFail} failed`);
  if (unmatched.length) {
    console.log(`\nUnmatched titles (${unmatched.length}):`);
    for (const t of unmatched) console.log(`  - ${t.slice(0, 80)}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
