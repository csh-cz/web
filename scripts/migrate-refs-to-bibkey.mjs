#!/usr/bin/env node
/**
 * Mass-migrace existujících `references[]` / `prameny[]` v MDX/MD souborech
 * na `bibKey:` form. Zdrojem matches je `tmp/zotero-export/auto-migrate.json`
 * (filtrované z refs-match.json — pouze high-confidence, viz match-refs script).
 *
 * Pro každý match:
 *   1. Najdi v každém z `files[]` blok reference, který odpovídá tomuto title.
 *   2. Rewrite YAML blok na:
 *        - bibKey: "..."
 *          [note: "..." pokud původní note byla editorský kontext, ne jen citace]
 *          [pages: "..." pokud bylo v původním]
 *   3. Zachová type pokud je v původním (citeproc by jinak inferoval z CSL type).
 *
 * Heuristika pro keepNote:
 *   - Note obsahuje hledané fráze ("primární pramen", "viz", "podle", "podrobně",
 *     "doslovný", "pouze fragment", "kompletní text", …) → KEEP
 *   - Note je v podstatě reformat citace (LASTNAME, Jméno. Titul.) → DROP
 *
 * Použití:
 *   node scripts/migrate-refs-to-bibkey.mjs           # dry-run
 *   node scripts/migrate-refs-to-bibkey.mjs --apply
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const apply = process.argv.includes('--apply');
const root = process.cwd();
const matches = JSON.parse(
  readFileSync(join(root, 'tmp/zotero-export/auto-migrate.json'), 'utf8'),
);

console.log(`Loaded ${matches.length} auto-migrate matches.`);

// Heuristika: editor's contextual note vs. citation duplicate
const KEEP_PHRASES = [
  'primární pramen', 'klíčový', 'podle ', 'viz ', 'podle něj', 'podrobně',
  'doslovný přepis', 'pouze fragment', 'kompletní text', 's podrobnos', 'doplněk',
  'použito s', 'svolením', 'dostupné v Zotero', 'sekundární', 'rev. v',
  'dochovaný', 'výňatek', 'překlad', 'novější vydání', 'starší vydání',
  'restaurátorská', 'archivní', 'in extenso',
];
function shouldKeepNote(note) {
  if (!note) return false;
  const trimmed = note.trim();
  if (trimmed.length < 5) return false;
  const lower = trimmed.toLowerCase();
  // Pokud začíná LASTNAME, FirstName. Title — jde o přepis citace, drop.
  if (/^[A-ZÁ-Ž]{3,},\s+[A-ZÁ-Ž]/.test(trimmed)) return false;
  // Pokud obsahuje keep-phrase, keep.
  for (const p of KEEP_PHRASES) {
    if (lower.includes(p.toLowerCase())) return true;
  }
  // Heuristika délky: < 80 znaků a žádný přímý citation marker → asi context
  if (trimmed.length < 80 && !/\d{4}\..*\d/.test(trimmed)) return true;
  // Default: drop (lépe ztratit pár editor-context note než spamovat citace)
  return false;
}

// Build a Map: file → list of (oldRefBlock, newRefBlock) replacements
// We need to identify ref block in YAML. Strategy:
//   - Frontmatter section "references:" or "prameny:"
//   - Inside, items start with "  - title:" or "  - citace:"
//   - Block ends at next item or end of frontmatter

function findRefBlock(text, refTitle) {
  // Find references: or prameny: section
  const sectionMatch = text.match(/^(references|prameny):\s*\n([\s\S]*?)(?=^\w|\n---)/m);
  if (!sectionMatch) return null;

  const sectionStart = sectionMatch.index;
  const sectionBody = sectionMatch[2];
  const sectionBodyOffset = sectionMatch.index + sectionMatch[0].indexOf(sectionMatch[2]);

  // Split items by leading "  - ":
  //   - "  - field: value\n" — dash followed by space + content (běžné)
  //   - "  -\n    field: value\n" — dash s newline, content na další řádce (alt YAML form)
  // V druhém případě potřebujeme normalizovat indent na "  - " (4 chars), aby
  // newBlock měl správný indent pro field rows (4 spaces).
  const itemStarts = [];
  const lineRegex = /^(\s+-)(?:[ \t]|\n)/gm;
  let lm;
  while ((lm = lineRegex.exec(sectionBody)) !== null) {
    // Normalize indent: chceme "  - " ne "  -\n"
    const dashPart = lm[1];               // "  -"
    const indent = dashPart + ' ';        // "  - "
    itemStarts.push({ idx: lm.index, indent });
  }
  const items = [];
  for (let i = 0; i < itemStarts.length; i++) {
    const start = itemStarts[i].idx;
    const end = i + 1 < itemStarts.length ? itemStarts[i + 1].idx : sectionBody.length;
    const raw = sectionBody.slice(start, end);
    items.push({
      start: sectionBodyOffset + start,
      end: sectionBodyOffset + end,
      raw,
      indent: itemStarts[i].indent,
      content: raw.slice(itemStarts[i].indent.length),
    });
  }

  const refTitleNorm = refTitle.replace(/\s+/g, ' ').trim().toLowerCase();
  for (const it of items) {
    // Look for title: or citace: matching refTitle
    const titleM = it.content.match(/(?:title|citace):\s*(.+?)(?:\n|$)/);
    if (!titleM) continue;
    let foundTitle = titleM[1].trim();
    // Strip quotes
    foundTitle = foundTitle.replace(/^["']|["']$/g, '').replace(/^\|\s*/, '');
    const foundNorm = foundTitle.replace(/\s+/g, ' ').trim().toLowerCase();
    if (foundNorm.startsWith(refTitleNorm.slice(0, 50)) || refTitleNorm.startsWith(foundNorm.slice(0, 50))) {
      return it;
    }
  }
  return null;
}

function buildNewBlock(indent, citationKey, oldContent, isPrameny) {
  // Extract optional fields from old content
  const noteM = oldContent.match(/(?:note|poznamka):\s*([\s\S]+?)(?=\n\s+\w+:|\n\s*-|$)/);
  const pagesM = oldContent.match(/pages:\s*(.+?)(?:\n|$)/);
  const typeM = oldContent.match(/type:\s*(.+?)(?:\n|$)/);

  const noteRaw = noteM ? noteM[1].trim() : '';
  // Strip wrapping quotes/block indicators (incl. multi-line `|`)
  let note = noteRaw.replace(/^\|\s*\n?/, '').replace(/^["']|["']$/g, '').trim();
  // Pokud má `|` block scalar, hodnota by mohla obsahovat odsazení uvnitř — zploštit do single line
  note = note.replace(/\n\s+/g, ' ');
  const pages = pagesM ? pagesM[1].trim().replace(/^["']|["']$/g, '') : '';
  const type = typeM ? typeM[1].trim().replace(/^["']|["']$/g, '') : '';

  // Indent pro field rows uvnitř - item: indent.length znaků mezer
  // (např. indent="  - " (length 4) → field rows začínají na 4 mezerách).
  const fieldIndent = ' '.repeat(indent.length);

  const lines = [];
  lines.push(`${indent}bibKey: '${citationKey}'`);
  if (type) lines.push(`${fieldIndent}type: ${type}`);
  if (pages) lines.push(`${fieldIndent}pages: '${pages}'`);
  if (note && shouldKeepNote(note)) {
    const noteFmt = note.includes('"') || note.includes('\n')
      ? `'${note.replace(/'/g, "''")}'`
      : `"${note}"`;
    const noteKey = isPrameny ? 'poznamka' : 'note';
    lines.push(`${fieldIndent}${noteKey}: ${noteFmt}`);
  }

  return lines.join('\n') + '\n';
}

// Stats
const stats = {
  filesScanned: new Set(),
  filesModified: new Set(),
  refsReplaced: 0,
  refsNotFound: 0,
  noteDropped: 0,
  noteKept: 0,
};

// Group matches by file
const fileToMatches = new Map();
for (const m of matches) {
  for (const f of m.files) {
    if (!fileToMatches.has(f)) fileToMatches.set(f, []);
    fileToMatches.get(f).push(m);
  }
}

console.log(`\nProcessing ${fileToMatches.size} files...\n`);

for (const [file, fileMatches] of fileToMatches) {
  const fullPath = join(root, file);
  let txt;
  try { txt = readFileSync(fullPath, 'utf8'); } catch { continue; }
  stats.filesScanned.add(file);

  const isPrameny = file.startsWith('content/soupis-veznich-hodin/');

  // Apply replacements one at a time, top-down (since YAML blocks shift)
  let modified = false;
  for (const m of fileMatches) {
    // Find and replace in current txt
    const block = findRefBlock(txt, m.title);
    if (!block) { stats.refsNotFound++; continue; }

    const newBlock = buildNewBlock(block.indent, m.citationKey, block.content, isPrameny);

    // Check if note was kept or dropped
    const hadNote = /(?:note|poznamka):/.test(block.content);
    const keptNote = /(?:note|poznamka):/.test(newBlock);
    if (hadNote && !keptNote) stats.noteDropped++;
    else if (hadNote && keptNote) stats.noteKept++;

    // Replace block.raw with newBlock in txt
    const before = txt.slice(0, block.start);
    const after = txt.slice(block.end);
    txt = before + newBlock + after;
    modified = true;
    stats.refsReplaced++;
  }

  if (modified) {
    stats.filesModified.add(file);
    if (apply) writeFileSync(fullPath, txt);
  }
}

console.log(`\nFiles scanned:  ${stats.filesScanned.size}`);
console.log(`Files modified: ${stats.filesModified.size}`);
console.log(`Refs replaced:  ${stats.refsReplaced}`);
console.log(`Refs not found in YAML (skipped): ${stats.refsNotFound}`);
console.log(`Notes kept (editor context):      ${stats.noteKept}`);
console.log(`Notes dropped (citation dupes):   ${stats.noteDropped}`);

if (!apply) console.log(`\nDry-run. Pro aplikaci spusť s --apply.`);
