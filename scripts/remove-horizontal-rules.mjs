#!/usr/bin/env node
// Odstraňuje markdown horizontal rules (`* * *`, `---` v body) ze všech mdx/md
// souborů v content/. **NEMAZAT** YAML frontmatter delimitery (první/poslední `---`).
//
// Strategie:
//   1. Najít YAML frontmatter (řádky `^---$` na pozici 0 a první další řádek)
//   2. V body části mazat řádky tvaru `^---$`, `^* * *$`, `^---+$`, `^***+$`
//   3. Pokud po smazání zůstane víc prázdných řádků za sebou, redukovat na max 1

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

const HR_RE = /^(?:-{3,}|\*\s*\*\s*\*\s*\*?|\*{3,})\s*$/;

let totalRemoved = 0;
let filesChanged = 0;
const examples = [];

for (const fp of files) {
  const src = fs.readFileSync(fp, 'utf8');
  const lines = src.split('\n');

  // Najít YAML frontmatter: řádek 0 musí být `---`, najít další `---`
  let fmEnd = -1;
  if (lines[0] === '---') {
    for (let i = 1; i < lines.length; i++) {
      if (lines[i] === '---') { fmEnd = i; break; }
    }
  }

  const out = [];
  let removed = 0;
  for (let i = 0; i < lines.length; i++) {
    // Zachovat YAML frontmatter delimitery
    if (i === 0 && fmEnd > 0) { out.push(lines[i]); continue; }
    if (i === fmEnd) { out.push(lines[i]); continue; }
    // V body části: pokud je řádek HR, smazat
    if (i > fmEnd && HR_RE.test(lines[i])) {
      removed++;
      if (examples.length < 8) examples.push(`${path.relative(ROOT, fp)}:${i + 1}  ${lines[i]}`);
      continue;
    }
    out.push(lines[i]);
  }

  // Sjednoť několik prázdných řádků za sebou na max 1
  const compacted = [];
  let prevEmpty = false;
  for (const l of out) {
    if (l.trim() === '') {
      if (prevEmpty) continue;
      prevEmpty = true;
    } else {
      prevEmpty = false;
    }
    compacted.push(l);
  }

  if (removed > 0) {
    if (!dryRun) fs.writeFileSync(fp, compacted.join('\n'), 'utf8');
    totalRemoved += removed;
    filesChanged++;
  }
}

console.log(`\n${dryRun ? '[DRY-RUN] ' : ''}Removed ${totalRemoved} horizontal rules from ${filesChanged} files.`);
console.log('\nFirst few examples:');
for (const ex of examples) console.log(`  ${ex}`);
