#!/usr/bin/env node
// Odstraňuje meta-poznámky o tvorbě obsahu (process notes) z public textu.
// Zachovává obsah o subjektu (např. „patent se v archivech nepodařilo dohledat"
// ZŮSTÁVÁ — to je informace o subjektu, ne o tvorbě stránky).
//
// Cílové vzory (vždy MUSÍ začínat charakteristickým prefixem, aby nedošlo
// k false-positive odstranění legitimního textu):
//
//   1) `*Životopisný stub.` / `*Stránka je stub.` / `*Stub karta` italic paragraph
//   2) `*Karta vychází ze [zdroj]. Pokud máte ... prosíme o kontakt*`
//   3) `> **Poznámka k portrétní fotografii:**` blockquote
//   4) `> **Pozn. k tvorbě:**` etc.
//
// Spuštění: `node scripts/remove-meta-notes.mjs [--dry]`

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

// Charakteristické prefixy meta-poznámek
const META_PARAGRAPH_PATTERNS = [
  /^\*[Žž]ivotopisný\s+stub\b/,             // *Životopisný stub. ...*
  /^\*[Žž]ivotopis\s+stub\b/,
  /^\*Stránka\s+je\s+stub\b/,
  /^\*Stránka\s+stub\b/,
  /^\*Stub\s+karta\b/,
  /^\*Karta\s+je\s+stub\b/,
];

// Blockquote začínající meta-poznámkou
const META_BLOCKQUOTE_PATTERNS = [
  /^>\s*\*\*Poznámka\s+k\s+portrétní/i,
  /^>\s*\*\*Pozn\.\s+k\s+tvorbě/i,
  /^>\s*\*\*Pozn\.\s+k\s+podkladům/i,
];

// Určení zda paragraf končí — tj. řádek je prázdný
function isBlank(line) { return /^\s*$/.test(line); }

let totalRemovedBlocks = 0;
let filesChanged = 0;
const examples = [];

for (const fp of files) {
  const src = fs.readFileSync(fp, 'utf8');
  const lines = src.split('\n');
  const out = [];
  let removedHere = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // META PARAGRAPH (italic, on single line or multi-line until blank)
    if (META_PARAGRAPH_PATTERNS.some(re => re.test(line))) {
      // Find end of paragraph (next blank line)
      let j = i;
      while (j < lines.length && !isBlank(lines[j])) j++;
      // Removed lines [i..j-1]
      removedHere++;
      if (examples.length < 8) {
        examples.push(`${path.relative(ROOT, fp)}:${i + 1}  ${line.slice(0, 80)}`);
      }
      i = j; // skip to blank, will be added to output
      // But add the blank line after — only if previous output line is not blank
      if (out.length > 0 && !isBlank(out[out.length - 1])) {
        // Skip the trailing blank to avoid double blank
      }
      continue;
    }

    // META BLOCKQUOTE
    if (META_BLOCKQUOTE_PATTERNS.some(re => re.test(line))) {
      // Najít konec blockquote — řádky začínající `>` nebo prázdné? Žádné — blockquote končí prázdným řádkem.
      let j = i;
      while (j < lines.length && /^>/.test(lines[j])) j++;
      removedHere++;
      if (examples.length < 8) {
        examples.push(`${path.relative(ROOT, fp)}:${i + 1}  ${line.slice(0, 80)}`);
      }
      i = j - 1; // continue past blockquote
      continue;
    }

    out.push(line);
  }

  // Compact double blank lines
  const compacted = [];
  let prevBlank = false;
  for (const l of out) {
    if (isBlank(l)) {
      if (prevBlank) continue;
      prevBlank = true;
    } else {
      prevBlank = false;
    }
    compacted.push(l);
  }

  if (removedHere > 0) {
    if (!dryRun) fs.writeFileSync(fp, compacted.join('\n'), 'utf8');
    totalRemovedBlocks += removedHere;
    filesChanged++;
  }
}

console.log(`\n${dryRun ? '[DRY-RUN] ' : ''}Removed ${totalRemovedBlocks} meta-note blocks from ${filesChanged} files.`);
console.log('\nExamples:');
for (const ex of examples) console.log(`  ${ex}`);
