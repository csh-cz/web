#!/usr/bin/env node
// Odstraňuje editorské instrukce z public stránek:
//   1) `## Stub karty` sekce (instrukce pro editora po automatické generaci)
//      včetně všech řádků až do konce souboru nebo dalšího ## headingu
//   2) `*Fotky byly auto-detekovány...*` paragraf (auto-attribution photo note)
//   3) `## Po vyplnění odstraňte tuto poznámku` headings
//   4) `## Detailní popis hodinového stroje` IF only contains placeholder text
//
// Obsah o subjektu (např. „patent se nedohledal") zachován.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dryRun = process.argv.includes('--dry');

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (/\.(mdx|md)$/.test(e.name)) out.push(p);
  }
  return out;
}

const files = walk(path.join(ROOT, 'content')).filter(f =>
  !f.includes('/_link_audit') && !f.includes('/_dead_links') && !f.includes('/_redirect_candidates')
);

const STUB_HEADING_RE = /^## (?:Stub karty|Stub:|Po vyplnění)/;
const PHOTO_AUTO_RE = /^\*Fotky byly auto-detekovány/;

let totalRemovedSections = 0;
let filesChanged = 0;
const examples = [];

for (const fp of files) {
  const src = fs.readFileSync(fp, 'utf8');
  const lines = src.split('\n');
  const out = [];
  let removed = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Stub heading — remove až do konce souboru nebo dalšího H1/H2 (ne H3)
    if (STUB_HEADING_RE.test(line)) {
      const startIdx = i;
      i++;
      while (i < lines.length) {
        // Stop on next H1 or H2 heading — but ne H3 nebo víc
        if (/^#{1,2} /.test(lines[i]) && !/^### /.test(lines[i])) break;
        i++;
      }
      removed++;
      if (examples.length < 8) examples.push(`${path.relative(ROOT, fp)}:${startIdx + 1}  ${line.slice(0, 60)}`);
      continue;
    }

    // *Fotky byly auto-detekovány* paragraf
    if (PHOTO_AUTO_RE.test(line)) {
      // Find end of paragraph
      const startIdx = i;
      while (i < lines.length && !/^\s*$/.test(lines[i])) i++;
      removed++;
      if (examples.length < 8) examples.push(`${path.relative(ROOT, fp)}:${startIdx + 1}  *Fotky byly auto-detekovány...`);
      continue;
    }

    out.push(line);
    i++;
  }

  // Compact double blank
  const compacted = [];
  let prevBlank = false;
  for (const l of out) {
    if (/^\s*$/.test(l)) {
      if (prevBlank) continue;
      prevBlank = true;
    } else {
      prevBlank = false;
    }
    compacted.push(l);
  }
  // Remove trailing blanks (jen jeden newline na konec)
  while (compacted.length > 1 && /^\s*$/.test(compacted[compacted.length - 1])) {
    compacted.pop();
  }

  if (removed > 0) {
    if (!dryRun) fs.writeFileSync(fp, compacted.join('\n') + '\n', 'utf8');
    totalRemovedSections += removed;
    filesChanged++;
  }
}

console.log(`\n${dryRun ? '[DRY-RUN] ' : ''}Removed ${totalRemovedSections} stub sections / photo-auto notes from ${filesChanged} files.`);
console.log('\nExamples:');
for (const ex of examples) console.log(`  ${ex}`);
