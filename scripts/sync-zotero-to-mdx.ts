/**
 * Sync Zotero CSH/Hodinárium → MDX `references:` blocks.
 *
 * Reverse of `extract-references-v2.ts`: pulls cleaned Zotero items and
 * rewrites the `references:` block in each MDX, preserving:
 *   - original ordering of references in MDX
 *   - per-file commentary (text after " — " em-dash in current MDX note)
 *   - any references in MDX that don't exist in Zotero (manually added)
 *
 * Each Zotero item's `extra` field contains:
 *   CSH-Sources: content/foo.mdx; content/bar.mdx
 *   Original-Type: clanek
 *
 * which drives the file-level routing.
 *
 * Usage:
 *   pnpm tsx scripts/sync-zotero-to-mdx.ts            # dry-run, prints diff per file
 *   pnpm tsx scripts/sync-zotero-to-mdx.ts --write    # actually write changes
 *   pnpm tsx scripts/sync-zotero-to-mdx.ts --file content/hodinari/jan-prokes.mdx
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const COLLECTION_KEY = '453QY6LQ';
const ZOTERO_USER_ID = '1916830';
const ZOTERO_API = `http://127.0.0.1:23119/api/users/${ZOTERO_USER_ID}`;
const TODAY = new Date().toISOString().slice(0, 10);

// ─── Types ──────────────────────────────────────────────────────────────

interface ZoteroCreator {
  creatorType: string;
  firstName?: string;
  lastName?: string;
  name?: string;
}

interface ZoteroItem {
  key: string;
  data: {
    key: string;
    itemType: string;
    title: string;
    date?: string;
    creators?: ZoteroCreator[];
    publicationTitle?: string;
    volume?: string;
    issue?: string;
    pages?: string;
    place?: string;
    publisher?: string;
    edition?: string;
    series?: string;
    ISBN?: string;
    ISSN?: string;
    DOI?: string;
    url?: string;
    extra?: string;
    bookTitle?: string;
  };
}

interface MdxRef {
  title?: string;
  author?: string | string[];
  year?: string | number;
  type?: string;
  url?: string;
  note?: string;
}

// Map Zotero itemType → MDX type vocabulary
const TYPE_BACK: Record<string, string> = {
  journalArticle: 'clanek',
  magazineArticle: 'clanek',
  newspaperArticle: 'clanek',
  book: 'kniha',
  bookSection: 'kniha',
  thesis: 'diplomka',
  patent: 'patent',
  manuscript: 'archiv',
  report: 'zprava',
  webpage: 'web',
  map: 'mapa',
  document: 'clanek', // generic fallback
  conferencePaper: 'clanek',
  preprint: 'clanek',
};

// ─── Helpers ────────────────────────────────────────────────────────────

function escapeYamlDouble(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function yamlString(s: string): string {
  // Always use double quotes for strings — safe default for unicode + special chars
  return '"' + escapeYamlDouble(s) + '"';
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

function parseExtra(extra: string): { sources: string[]; originalType?: string; cleanText: string } {
  const lines = extra.split('\n');
  const sources: string[] = [];
  let originalType: string | undefined;
  const otherLines: string[] = [];
  for (const line of lines) {
    const sM = line.match(/^CSH-Sources:\s*(.+)$/);
    if (sM) {
      sources.push(...sM[1].split(';').map((s) => s.trim()).filter(Boolean));
      continue;
    }
    const oM = line.match(/^Original-Type:\s*(.+)$/);
    if (oM) {
      originalType = oM[1].trim();
      continue;
    }
    otherLines.push(line);
  }
  return { sources, originalType, cleanText: otherLines.join('\n').trim() };
}

function authorString(c: ZoteroCreator): string {
  if (c.name) return c.name;
  return [c.firstName, c.lastName].filter(Boolean).join(' ');
}

function authorsToMdx(creators: ZoteroCreator[]): string | string[] | undefined {
  const names = creators.filter((c) => c.creatorType === 'author').map(authorString).filter(Boolean);
  if (names.length === 0) return undefined;
  if (names.length === 1) return names[0];
  return names;
}

function authorIso690(c: ZoteroCreator): string {
  if (c.name) return c.name.toUpperCase();
  if (!c.lastName) return c.firstName || '';
  if (!c.firstName) return c.lastName.toUpperCase();
  return `${c.lastName.toUpperCase()}, ${c.firstName}`;
}

/** Build canonical ISO 690 plaintext citation from Zotero structured fields. */
function buildIso690Plaintext(data: ZoteroItem['data'], commentary: string): string {
  const it = data.itemType;
  const isBook = it === 'book' || it === 'thesis' || it === 'bookSection';
  const isWeb = it === 'webpage';
  const url = data.url || (data.DOI ? `https://doi.org/${data.DOI}` : '');
  const isOnline = !!url;
  const year = (data.date || '').match(/\d{4}/)?.[0] || data.date || '';

  const parts: string[] = [];

  // Authors
  const authors = (data.creators || []).filter((c) => c.creatorType === 'author');
  if (authors.length) {
    const formatted = authors.map((c, i) =>
      i === 0 ? authorIso690(c) : authorIso690(c).split(',').reverse().map((s) => s.trim()).join(' '),
    );
    parts.push(formatted.join(', ') + '.');
  }

  // Title
  if (isBook) {
    parts.push(`${data.title}${isOnline ? ' [online]' : ''}.`);
  } else if (isWeb) {
    parts.push(`${data.title} [online].`);
  } else {
    parts.push(`${data.title}.`);
    if (data.publicationTitle) {
      parts.push(`${data.publicationTitle}${isOnline ? ' [online]' : ''}.`);
    }
  }

  // Edition
  if (data.edition && isBook) parts.push(`${data.edition}. vyd.`);

  // Place: Publisher, Year (book/web)
  if (isBook) {
    const pp = [data.place, data.publisher].filter(Boolean).join(': ');
    if (pp && year) parts.push(`${pp}, ${year}.`);
    else if (pp) parts.push(`${pp}.`);
    else if (year) parts.push(`${year}.`);
  } else if (isWeb) {
    if (year) parts.push(`${year}.`);
  } else {
    // Article: Year, roč. V, č. I, s. P-P.
    const segs: string[] = [];
    if (year) segs.push(year);
    if (data.volume) segs.push(`roč. ${data.volume}`);
    if (data.issue) segs.push(`č. ${data.issue}`);
    if (data.pages) segs.push(`s. ${data.pages}`);
    if (segs.length) parts.push(segs.join(', ') + (isOnline ? '' : '.'));
  }

  if (isOnline) parts.push(`[cit. ${TODAY}].`);
  if (data.ISSN) parts.push(`ISSN ${data.ISSN}.`);
  if (data.ISBN) parts.push(`ISBN ${data.ISBN}.`);
  if (url) parts.push(`Dostupné z: ${url}`);

  let citation = parts.join(' ').replace(/\s+\./g, '.').replace(/\s{2,}/g, ' ').trim();
  if (commentary) citation += ` — ${commentary}`;
  return citation;
}

/** Extract per-file commentary from a current MDX `note` (text after " — "). */
function extractMdxCommentary(note: string): string {
  const idx = note.lastIndexOf(' — ');
  if (idx === -1) return '';
  return note.slice(idx + 3).trim();
}

/** Render a reference object as YAML lines (block style, double-quoted strings). */
function refToYamlBlock(ref: MdxRef): string[] {
  const out: string[] = [];
  out.push(`  - title: ${yamlString(ref.title || '')}`);
  if (ref.author !== undefined) {
    if (Array.isArray(ref.author)) {
      out.push(`    author:`);
      for (const a of ref.author) out.push(`      - ${yamlString(a)}`);
    } else {
      out.push(`    author: ${yamlString(ref.author)}`);
    }
  }
  if (ref.year !== undefined && ref.year !== '') {
    const y = String(ref.year);
    if (/^\d{1,4}$/.test(y)) {
      out.push(`    year: ${y}`);
    } else {
      out.push(`    year: ${yamlString(y)}`);
    }
  }
  if (ref.type) out.push(`    type: ${ref.type}`);
  if (ref.url) out.push(`    url: ${yamlString(ref.url)}`);
  if (ref.note) out.push(`    note: ${yamlString(ref.note)}`);
  return out;
}

// ─── Frontmatter parser (minimal, regex-based, preserves untouched parts) ───

interface Frontmatter {
  raw: string;          // full frontmatter text (without --- delimiters)
  parsed: Record<string, unknown>;
  refsBlockStart: number;  // 0-based line index of `references:` line
  refsBlockEnd: number;    // exclusive end (next top-level key, or end of frontmatter)
}

function parseMdxFile(fileText: string): { fm: Frontmatter | null; bodyAfter: string; bodyBefore: string } {
  if (!fileText.startsWith('---\n') && !fileText.startsWith('---\r\n')) {
    return { fm: null, bodyAfter: '', bodyBefore: fileText };
  }
  const end = fileText.indexOf('\n---', 4);
  if (end < 0) return { fm: null, bodyAfter: '', bodyBefore: fileText };
  const fmText = fileText.slice(4, end);
  const bodyAfter = fileText.slice(end);
  const bodyBefore = '---\n';

  const lines = fmText.split('\n');
  let refsStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^references\s*:\s*$/.test(lines[i])) {
      refsStart = i;
      break;
    }
  }

  // Parse YAML for the references block (we still rely on js-yaml or our own parser)
  // We'll dynamically import js-yaml since it's a pnpm-managed dep.
  // For simplicity, use a synchronous require pattern; if not available, fall back.
  let parsed: Record<string, unknown> = {};
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const yaml = require('js-yaml');
    parsed = (yaml.load(fmText) as Record<string, unknown>) || {};
  } catch {
    parsed = {};
  }

  let refsEnd = lines.length;
  if (refsStart >= 0) {
    for (let i = refsStart + 1; i < lines.length; i++) {
      const l = lines[i];
      if (l === '') continue;
      // Top-level key starts with non-whitespace and contains ':'
      if (/^[A-Za-z_]/.test(l) && /:/.test(l)) {
        refsEnd = i;
        break;
      }
    }
  }

  return {
    fm: { raw: fmText, parsed, refsBlockStart: refsStart, refsBlockEnd: refsEnd },
    bodyAfter,
    bodyBefore,
  };
}

function rebuildMdxFile(fileText: string, newRefsBlock: string[] | null): string {
  const { fm, bodyAfter, bodyBefore } = parseMdxFile(fileText);
  if (!fm) return fileText;
  const lines = fm.raw.split('\n');

  let newLines: string[];
  if (fm.refsBlockStart === -1) {
    // No references in original — append at end of frontmatter (only if we have new refs)
    if (!newRefsBlock || newRefsBlock.length === 0) return fileText;
    newLines = [...lines, 'references:', ...newRefsBlock];
  } else if (!newRefsBlock || newRefsBlock.length === 0) {
    // Remove references block entirely (keep header? — better keep header as empty `references: []`?)
    // Safer: just leave existing references untouched
    return fileText;
  } else {
    newLines = [
      ...lines.slice(0, fm.refsBlockStart),
      'references:',
      ...newRefsBlock,
      ...lines.slice(fm.refsBlockEnd),
    ];
  }

  return bodyBefore + newLines.join('\n') + bodyAfter;
}

// ─── Main sync logic ───────────────────────────────────────────────────

interface ProcessedItem {
  zoteroKey: string;
  title: string;
  author?: string | string[];
  year?: string;
  type: string;
  url?: string;
  citation: string;       // canonical plaintext ISO 690 (without commentary)
  sources: string[];      // CSH-Sources files
}

function processItem(item: ZoteroItem): ProcessedItem | null {
  const d = item.data;
  if (!d.title) return null;
  const { sources, originalType } = parseExtra(d.extra || '');
  const type = originalType || TYPE_BACK[d.itemType] || 'clanek';
  const author = authorsToMdx(d.creators || []);
  const year = (d.date || '').match(/\d{4}/)?.[0] || d.date;
  const url = d.url || (d.DOI ? `https://doi.org/${d.DOI}` : undefined);
  const citationNoCommentary = buildIso690Plaintext(d, '');

  return {
    zoteroKey: d.key,
    title: d.title,
    author,
    year,
    type,
    url,
    citation: citationNoCommentary,
    sources,
  };
}

async function fetchAllItems(): Promise<ZoteroItem[]> {
  // Step 1: get parent item keys via MCP (returns top-level items only, no child notes)
  const mcpResp = await fetch('http://127.0.0.1:23120/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'get_collection_items',
        arguments: { collectionKey: COLLECTION_KEY, limit: 200 },
      },
    }),
  });
  const j = (await mcpResp.json()) as { result: { content: { text: string }[] } };
  const parentList = JSON.parse(j.result.content[0].text) as { key: string }[];

  // Step 2: fetch full data for each parent in parallel batches
  const items: ZoteroItem[] = [];
  const BATCH = 10;
  for (let i = 0; i < parentList.length; i += BATCH) {
    const slice = parentList.slice(i, i + BATCH);
    const fetched = await Promise.all(
      slice.map((p) =>
        fetch(`${ZOTERO_API}/items/${p.key}?format=json`).then((r) => r.json() as Promise<ZoteroItem>),
      ),
    );
    items.push(...fetched);
  }
  return items;
}

function diffSummary(oldText: string, newText: string): string {
  if (oldText === newText) return '(no change)';
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  // simple summary: count added/removed
  const added = newLines.length - oldLines.length;
  const sign = added > 0 ? '+' : added < 0 ? '' : '±';
  return `${sign}${added} lines (${oldLines.length} → ${newLines.length})`;
}

async function main() {
  const args = process.argv.slice(2);
  const WRITE = args.includes('--write');
  const FILE_FILTER = args.includes('--file') ? args[args.indexOf('--file') + 1] : null;
  const SHOW_DIFF = args.includes('--show-diff');
  // By default we DON'T overwrite the natural-language `note:` field — it often
  // contains rich detail (specific dates, conference info, archival signatures)
  // that doesn't map to Zotero structured fields. Pass --rebuild-notes to
  // regenerate `note:` from Zotero ISO 690 fields wherever Zotero is rich enough.
  const REBUILD_NOTES = args.includes('--rebuild-notes');

  console.log(`Mode: ${WRITE ? 'WRITE' : 'DRY-RUN'}${FILE_FILTER ? ' (filter: ' + FILE_FILTER + ')' : ''}${REBUILD_NOTES ? ' (rebuild-notes)' : ' (preserve-notes)'}`);

  const items = await fetchAllItems();
  console.log(`Fetched ${items.length} Zotero items from CSH/Hodinárium\n`);

  // Build per-file map: file → ProcessedItem[]
  const byFile = new Map<string, ProcessedItem[]>();
  let itemsWithoutSources = 0;
  for (const item of items) {
    const p = processItem(item);
    if (!p) continue;
    if (p.sources.length === 0) {
      itemsWithoutSources++;
      continue;
    }
    for (const f of p.sources) {
      const list = byFile.get(f) || [];
      list.push(p);
      byFile.set(f, list);
    }
  }

  console.log(`Files with Zotero refs: ${byFile.size}`);
  if (itemsWithoutSources > 0) {
    console.log(`(${itemsWithoutSources} Zotero items had no CSH-Sources tracking and will be skipped)`);
  }
  console.log();

  let filesChanged = 0;
  let filesUnchanged = 0;
  let filesError = 0;

  for (const [file, zItems] of [...byFile.entries()].sort()) {
    if (FILE_FILTER && !file.includes(FILE_FILTER)) continue;

    const fullPath = join(process.cwd(), file);
    let original: string;
    try {
      original = readFileSync(fullPath, 'utf-8');
    } catch {
      console.log(`SKIP ${file} (file not found)`);
      filesError++;
      continue;
    }

    const { fm } = parseMdxFile(original);
    const currentRefs = (fm?.parsed?.references as MdxRef[] | undefined) || [];

    // Match Zotero items to current MDX refs by normalized title
    const usedZoteroKeys = new Set<string>();
    const newRefs: MdxRef[] = [];

    for (const cur of currentRefs) {
      const nT = normTitle(cur.title || '');
      const match = zItems.find((z) => normTitle(z.title) === nT && !usedZoteroKeys.has(z.zoteroKey));
      if (match) {
        usedZoteroKeys.add(match.zoteroKey);
        // Decide on note field policy
        let newNote: string | undefined = cur.note;
        if (REBUILD_NOTES) {
          const commentary = cur.note ? extractMdxCommentary(cur.note) : '';
          // Only rebuild if Zotero version is at least as long as current
          // (avoids data loss when Zotero metadata is sparse)
          const candidate = commentary ? `${match.citation} — ${commentary}` : match.citation;
          if (!cur.note || candidate.length >= cur.note.length * 0.85) {
            newNote = candidate;
          }
        }
        const newRef: MdxRef = {
          title: match.title,
          author: match.author,
          year: match.year,
          type: match.type,
          url: match.url ?? cur.url,
          note: newNote,
        };
        newRefs.push(newRef);
      } else {
        // Unmatched MDX ref — keep as-is (manually added or not in Zotero)
        newRefs.push(cur);
      }
    }

    // Append Zotero items that weren't matched to any existing MDX ref
    for (const z of zItems) {
      if (!usedZoteroKeys.has(z.zoteroKey)) {
        newRefs.push({
          title: z.title,
          author: z.author,
          year: z.year,
          type: z.type,
          url: z.url,
          note: z.citation,
        });
      }
    }

    const newRefsBlock = newRefs.flatMap(refToYamlBlock);
    const updated = rebuildMdxFile(original, newRefsBlock);

    if (updated === original) {
      filesUnchanged++;
      console.log(`= ${file} (${zItems.length} refs, no changes)`);
    } else {
      filesChanged++;
      console.log(
        `${WRITE ? '✓' : '~'} ${file} — ${zItems.length} Zotero refs, ${currentRefs.length} → ${newRefs.length} MDX refs, ${diffSummary(original, updated)}`,
      );
      if (SHOW_DIFF) {
        // Print first/last lines of references blocks for visual inspection
        const oldRefsText = original.split('\n').slice(parseMdxFile(original).fm?.refsBlockStart ?? 0, parseMdxFile(original).fm?.refsBlockEnd).join('\n');
        const newRefsText = updated.split('\n').slice(parseMdxFile(updated).fm?.refsBlockStart ?? 0, parseMdxFile(updated).fm?.refsBlockEnd).join('\n');
        console.log('  --- BEFORE ---');
        console.log(oldRefsText.split('\n').slice(0, 8).map((l) => '    ' + l).join('\n'));
        console.log('  --- AFTER ---');
        console.log(newRefsText.split('\n').slice(0, 8).map((l) => '    ' + l).join('\n'));
      }
      if (WRITE) {
        writeFileSync(fullPath, updated, 'utf-8');
      }
    }
  }

  console.log(`\n${WRITE ? 'Wrote' : 'Would write'}: ${filesChanged} files`);
  console.log(`Unchanged: ${filesUnchanged} files`);
  if (filesError) console.log(`Errors: ${filesError} files`);
  if (!WRITE) console.log(`\nRun with --write to apply, or --file <path-fragment> to limit scope, or --show-diff to inspect.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
