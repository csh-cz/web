/**
 * V2 extractor: prefers LONGEST note when deduplicating references and
 * preserves per-file commentary so we can render rich Zotero notes.
 *
 * Output: tmp/csh-references-v2.json — array of:
 *   {
 *     id, title, type, year, authors[],
 *     canonicalNote,       // longest note across files
 *     perFileNotes[{file, note}],
 *     parsed: {publicationTitle, volume, issue, pages, place, publisher,
 *              ISBN, ISSN, DOI, URL, isOnline}
 *   }
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

interface Parsed {
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
}

interface Aggregated {
  id: string;
  title: string;
  type: string;
  year: string;
  authors: string[];
  topUrl: string;
  canonicalNote: string;
  perFileNotes: { file: string; note: string }[];
  parsed: Parsed;
}

function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (e.endsWith('.mdx') || e.endsWith('.md')) out.push(p);
  }
  return out;
}

function parseFM(text: string): Record<string, unknown> | null {
  if (!text.startsWith('---')) return null;
  const end = text.indexOf('\n---', 3);
  if (end < 0) return null;
  try {
    return yaml.load(text.slice(3, end)) as Record<string, unknown>;
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

/**
 * Parse a Czech ISO 690 style citation in plain text into structured fields.
 * Handles: ISSN, ISBN, DOI, URL, roč./č./s., place: publisher, [online], edition.
 */
function parseCitation(note: string, type: string, hintUrl?: string): Parsed {
  const p: Parsed = {};

  // ISSN
  const issnM = note.match(/ISSN\s+(\d{4}-\d{3}[\dX])/i);
  if (issnM) p.ISSN = issnM[1];

  // ISBN — accepts hyphens/spaces, 10 or 13 digits
  const isbnM = note.match(/ISBN[\s:]+([\d][\d\s-]{8,17}[\dX])/i);
  if (isbnM) p.ISBN = isbnM[1].replace(/\s+/g, '').trim();

  // DOI — match anywhere; strip trailing punctuation
  const doiM = note.match(/\b(10\.\d{4,9}\/\S+)/);
  if (doiM) p.DOI = doiM[1].replace(/[.,;)\]]+$/, '');

  // URL — last URL wins (typically "Dostupné z: URL")
  const urlMatches = Array.from(note.matchAll(/https?:\/\/[^\s,)<>"]+/g));
  if (urlMatches.length) p.URL = urlMatches[urlMatches.length - 1][0].replace(/[.,)]+$/, '');
  else if (hintUrl) p.URL = hintUrl;

  // [online]
  if (/\[online\]/i.test(note)) p.isOnline = true;

  // Volume / issue / pages (Czech: roč., č., s.)
  const rocM = note.match(/\broč\.?\s*([IVXLCDM]+|\d+)/i);
  if (rocM) p.volume = rocM[1];
  // issue: must be `č.` NOT preceded by "ro" (avoid roč.)
  const cisloM = note.match(/(?<!ro)(?:^|[,;\s])č\.?\s*(\d+(?:[-–]\d+)?)/);
  if (cisloM) p.issue = cisloM[1];
  const stranyM = note.match(/(?:^|[,;\s])s\.?\s*(\d+(?:[-–—]\d+)?)/);
  if (stranyM) p.pages = stranyM[1].replace(/[—–]/g, '–');

  // German equivalents
  if (!p.volume) {
    const jgM = note.match(/\b(?:Jg\.|Jahrgang)\s*(\d+)/);
    if (jgM) p.volume = jgM[1];
  }
  if (!p.issue) {
    const heftM = note.match(/\b(?:Heft|H\.|Nr\.)\s*(\d+)/);
    if (heftM) p.issue = heftM[1];
  }
  if (!p.pages) {
    const sM = note.match(/\bS\.\s*(\d+(?:[-–—]\d+)?)/);
    if (sM) p.pages = sM[1].replace(/[—–]/g, '–');
  }

  // Edition (Czech: "2. vyd." or "vyd. 2." or "1. vydání")
  const edM = note.match(/(\d+)\.\s*(?:vyd(?:\.|ání)|edition|Auflage)/i);
  if (edM) p.edition = edM[1];

  // Place: Publisher, Year   (typical for books, e.g. "Praha: Academia, 2010")
  // Strategy: split note into sentences, search each for the strict pattern.
  // This avoids greedy matches like "Hodiny: od gnómonu... Praha: SNTL, 1987".
  if (type === 'book' || type === 'thesis') {
    const sentences = note.split(/\.\s+/);
    let bestMatch: RegExpMatchArray | null = null;
    for (const s of sentences) {
      // Strict: "Place: Publisher, YYYY"  — Place has no comma/period, Publisher has no comma/period
      const m = s.match(
        /^([A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][^.,:]*?):\s+([^.,]+?),\s+(\d{4})/,
      );
      if (m) bestMatch = m; // last wins
    }
    if (bestMatch) {
      p.place = bestMatch[1].trim();
      p.publisher = bestMatch[2].trim();
    }
  }

  // PublicationTitle for journal articles
  // Heuristic: pattern is "AUTHOR. Title of article. <Journal>. <date/year>..."
  // We look for: capitalized phrase between sentences, ending before [online] or year
  if (type === 'article-journal' || type === 'clanek' || type === 'article') {
    // Try: "...<title>. <Journal> [online]." or "...<title>. <Journal>. <year>"
    let mt = note.match(/\.\s+([A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][^.]+?)\s+\[online\]/);
    if (!mt) mt = note.match(/\.\s+([A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][^.]+?)\.\s+\d{4}/);
    if (!mt) mt = note.match(/\.\s+([A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][^.]+?)\.\s+[Vv]ol\./);
    if (mt) p.publicationTitle = mt[1].trim();
  }

  return p;
}

const ROOT = process.cwd();
const CONTENT = join(ROOT, 'content');
const files = walk(CONTENT);

const acc = new Map<string, Aggregated>();
for (const file of files) {
  const text = readFileSync(file, 'utf-8');
  const fm = parseFM(text);
  if (!fm || !Array.isArray(fm.references)) continue;
  const rel = file.replace(ROOT + '/', '');

  for (const ref of fm.references as Ref[]) {
    if (!ref || typeof ref !== 'object') continue;
    if (!ref.title && !ref.note) continue;
    const key = refKey(ref);
    const note = ref.note || '';
    const authors = Array.isArray(ref.author) ? ref.author : ref.author ? [ref.author] : [];

    let entry = acc.get(key);
    if (!entry) {
      entry = {
        id: `csh-${acc.size + 1}`,
        title: ref.title || '(bez názvu)',
        type: String(ref.type || ''),
        year: String(ref.year ?? ''),
        authors,
        topUrl: ref.url || '',
        canonicalNote: note,
        perFileNotes: note ? [{ file: rel, note }] : [],
        parsed: {},
      };
      acc.set(key, entry);
    } else {
      // Pick longest note as canonical
      if (note.length > entry.canonicalNote.length) entry.canonicalNote = note;
      if (note) entry.perFileNotes.push({ file: rel, note });
      // Merge authors (in case of variation)
      for (const a of authors) if (!entry.authors.includes(a)) entry.authors.push(a);
      if (!entry.topUrl && ref.url) entry.topUrl = ref.url;
    }
  }
}

// Parse canonical citations
for (const e of acc.values()) {
  const cslType =
    e.type === 'kniha' || e.type === 'book'
      ? 'book'
      : e.type === 'web' || e.type === 'webpage'
        ? 'webpage'
        : e.type === 'mapa' || e.type === 'map'
          ? 'map'
          : 'article-journal';
  e.parsed = parseCitation(e.canonicalNote, cslType, e.topUrl);
  // Override URL/DOI from frontmatter if not parsed
  if (!e.parsed.URL && e.topUrl) e.parsed.URL = e.topUrl;
}

const out = Array.from(acc.values());
writeFileSync(join(ROOT, 'tmp/csh-references-v2.json'), JSON.stringify(out, null, 2), 'utf-8');

console.log(`Unique refs: ${out.length}`);

const fieldStats = {
  publicationTitle: 0,
  volume: 0,
  issue: 0,
  pages: 0,
  ISBN: 0,
  ISSN: 0,
  DOI: 0,
  URL: 0,
  place: 0,
  publisher: 0,
};
for (const e of out) {
  for (const k of Object.keys(fieldStats) as (keyof typeof fieldStats)[]) {
    if (e.parsed[k]) fieldStats[k]++;
  }
}
console.log('Parsed-field coverage:');
for (const [k, n] of Object.entries(fieldStats)) {
  console.log(`  ${k}: ${n}/${out.length}`);
}

// Show a few samples
console.log('\nSample (first 3):');
for (const e of out.slice(0, 3)) {
  console.log(`\n--- ${e.title.slice(0, 70)}`);
  console.log('  authors:', e.authors);
  console.log('  parsed:', e.parsed);
  console.log('  files:', e.perFileNotes.length, 'note variants');
}
