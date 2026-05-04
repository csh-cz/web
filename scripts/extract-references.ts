/**
 * Scan all MDX/MD files in content/ for `references:` arrays in frontmatter
 * and emit a deduplicated CSL-JSON file for Zotero import.
 *
 * Usage: pnpm tsx scripts/extract-references.ts
 * Output: tmp/csh-references.csl.json + tmp/csh-references.bib
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';

interface Ref {
  title?: string;
  author?: string | string[];
  year?: string | number;
  type?: string;
  url?: string;
  note?: string;
  isbn?: string;
  issn?: string;
  doi?: string;
}

interface Source {
  ref: Ref;
  files: string[];
}

const TYPE_MAP: Record<string, string> = {
  kniha: 'book',
  book: 'book',
  clanek: 'article-journal',
  article: 'article-journal',
  web: 'webpage',
  webpage: 'webpage',
  diplomka: 'thesis',
  thesis: 'thesis',
  zaverecna_prace: 'thesis',
  patent: 'patent',
  archiv: 'manuscript',
  manuscript: 'manuscript',
  zprava: 'report',
  report: 'report',
  norma: 'standard',
  mapa: 'map',
};

function walkContent(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) walkContent(p, out);
    else if (e.endsWith('.mdx') || e.endsWith('.md')) out.push(p);
  }
  return out;
}

function parseFrontmatter(text: string): Record<string, unknown> | null {
  if (!text.startsWith('---')) return null;
  const end = text.indexOf('\n---', 3);
  if (end < 0) return null;
  const fm = text.slice(3, end).trim();
  try {
    return yaml.load(fm) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function refKey(r: Ref): string {
  const t = (r.title || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const y = String(r.year ?? '').trim();
  const a = Array.isArray(r.author) ? r.author.join('|') : (r.author || '');
  return `${t}|${y}|${a}`;
}

function extractISBN(note?: string): string | undefined {
  if (!note) return undefined;
  const m = note.match(/ISBN[:\s]+([\d-]+X?)/i);
  return m?.[1];
}
function extractISSN(note?: string): string | undefined {
  if (!note) return undefined;
  const m = note.match(/ISSN[:\s]+(\d{4}-\d{3}[\dX])/i);
  return m?.[1];
}
function extractDOI(note?: string, url?: string): string | undefined {
  for (const s of [note, url]) {
    if (!s) continue;
    const m = s.match(/10\.\d{4,9}\/[^\s,]+/);
    if (m) return m[0];
  }
  return undefined;
}

const ROOT = process.cwd();
const CONTENT = join(ROOT, 'content');
const files = walkContent(CONTENT);

const sources = new Map<string, Source>();
let withRefs = 0;
let totalRefs = 0;

for (const file of files) {
  const text = readFileSync(file, 'utf-8');
  const fm = parseFrontmatter(text);
  if (!fm || !Array.isArray(fm.references)) continue;
  withRefs++;
  const rel = file.replace(ROOT + '/', '');
  for (const ref of fm.references as Ref[]) {
    if (!ref || typeof ref !== 'object') continue;
    if (!ref.title && !ref.note) continue;
    totalRefs++;
    const key = refKey(ref);
    const existing = sources.get(key);
    if (existing) {
      if (!existing.files.includes(rel)) existing.files.push(rel);
    } else {
      sources.set(key, { ref, files: [rel] });
    }
  }
}

console.log(`Files with references: ${withRefs}`);
console.log(`Total references: ${totalRefs}`);
console.log(`Unique references: ${sources.size}`);

// CSL-JSON output
const cslItems = Array.from(sources.values()).map(({ ref, files }, i) => {
  const cslType = TYPE_MAP[String(ref.type || '').toLowerCase()] || 'article-journal';
  const authors = Array.isArray(ref.author) ? ref.author : ref.author ? [ref.author] : [];
  const authorObjs = authors.map((a) => {
    const parts = a.trim().split(/\s+/);
    if (parts.length === 1) return { literal: a };
    const family = parts[parts.length - 1];
    const given = parts.slice(0, -1).join(' ');
    return { family, given };
  });

  const yearStr = String(ref.year ?? '').trim();
  const yearMatch = yearStr.match(/(\d{4})/);
  const issued = yearMatch ? { 'date-parts': [[parseInt(yearMatch[1], 10)]] } : undefined;

  const isbn = extractISBN(ref.note) || ref.isbn;
  const issn = extractISSN(ref.note) || ref.issn;
  const doi = extractDOI(ref.note, ref.url) || ref.doi;

  // pull container-title (journal/book series) from note for article types
  let containerTitle: string | undefined;
  if (cslType === 'article-journal' && ref.note) {
    // pattern: ". <Container>." or "<Container>. <Year>"
    const m = ref.note.match(/\.\s+([A-ZČŠŘŽÝÁÍÉÚŮŇŤĎÓ][^.]+?)\.\s+\d{4}/);
    if (m) containerTitle = m[1].trim();
  }

  const item: Record<string, unknown> = {
    id: `csh-${i + 1}`,
    type: cslType,
    title: ref.title || '(bez názvu)',
  };
  if (authorObjs.length) item.author = authorObjs;
  if (issued) item.issued = issued;
  if (containerTitle) item['container-title'] = containerTitle;
  if (ref.url) item.URL = ref.url;
  if (isbn) item.ISBN = isbn;
  if (issn) item.ISSN = issn;
  if (doi) item.DOI = doi;
  if (ref.note) item.note = ref.note;
  // custom field for source tracking (Zotero "Extra")
  const extra: string[] = [];
  if (ref.type) extra.push(`Original-Type: ${ref.type}`);
  extra.push(`CSH-Sources: ${files.join('; ')}`);
  item.note = (item.note ? item.note + '\n\n' : '') + extra.join('\n');

  return item;
});

const outDir = join(ROOT, 'tmp');
writeFileSync(join(outDir, 'csh-references.csl.json'), JSON.stringify(cslItems, null, 2), 'utf-8');
console.log(`\nCSL-JSON written: tmp/csh-references.csl.json (${cslItems.length} items)`);

// Quick stats
const byType: Record<string, number> = {};
for (const it of cslItems) {
  const t = String(it.type);
  byType[t] = (byType[t] || 0) + 1;
}
console.log('\nBy CSL type:');
for (const [t, n] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${t}: ${n}`);
}
