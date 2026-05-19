#!/usr/bin/env node
/**
 * strip-tldr-markdown.mjs — odstraní markdown z `tldr` frontmatter pole.
 *
 * Per user feedback: „V tldr máme markdown artefakty `**`, `[]()` atp.
 * Dejme to jen jako plaintext, tedy mažme veškerý markdown."
 *
 * Stripping rules:
 *   - `**bold**`  / `__bold__`   → bold
 *   - `*italic*`  / `_italic_`   → italic
 *   - `` `code` ``               → code
 *   - `[text](url)`              → text
 *   - `![alt](url)`              → alt
 *   - `> quote`                  → quote
 *   - `#### heading`             → heading
 *
 * Použití:
 *   node scripts/strip-tldr-markdown.mjs                  # dry-run
 *   node scripts/strip-tldr-markdown.mjs --apply
 */

import { readFile, writeFile, glob } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const apply = process.argv.includes('--apply');

function stripMarkdown(text) {
  return text
    // Image `![alt](url)` (před link, kvůli `!`)
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    // Link `[text](url)`
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Bold `**x**` / `__x__`
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    // Italic `*x*` / `_x_` (single, ne uvnitř slov)
    .replace(/(?<![*\w])\*([^*\n]+)\*(?!\*)/g, '$1')
    .replace(/(?<![_\w])_([^_\n]+)_(?!_)/g, '$1')
    // Inline code `` `x` ``
    .replace(/`([^`]+)`/g, '$1')
    // Headings `#### x` na začátku řádku
    .replace(/^#+\s+/gm, '')
    // Blockquote `> x` na začátku řádku
    .replace(/^>\s+/gm, '')
    // Cleanup vícenásobné mezery
    .replace(/  +/g, ' ')
    .trim();
}

/**
 * Find tldr block in frontmatter — vrací { matchStart, matchEnd, valueText, replace(newValue) }.
 * Podporuje 3 YAML formáty:
 *   1. tldr: 'one line'
 *   2. tldr: "one line"
 *   3. tldr: |   (multi-line block scalar)
 *        line 1
 *        line 2
 */
function findTldrBlock(fmRaw) {
  // Single-line quoted variants
  const singleQuoted = /^(tldr:\s*)('([^']*(?:''[^']*)*)'|"([^"\\]*(?:\\.[^"\\]*)*)")\s*$/m.exec(fmRaw);
  if (singleQuoted) {
    const value = singleQuoted[3] !== undefined
      ? singleQuoted[3].replace(/''/g, "'")
      : singleQuoted[4].replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    return {
      matchStart: singleQuoted.index,
      matchEnd: singleQuoted.index + singleQuoted[0].length,
      value,
      replace: (newValue) => {
        // Re-quote — preferuj single quote pokud neobsahuje single quote.
        const escaped = newValue.includes("'") && !newValue.includes('"')
          ? `"${newValue.replace(/"/g, '\\"')}"`
          : `'${newValue.replace(/'/g, "''")}'`;
        return `${singleQuoted[1]}${escaped}`;
      },
    };
  }
  // Block scalar `tldr: |` nebo `tldr: >`
  const blockScalar = /^(tldr:\s*[|>][+-]?)\s*\n((?:[ \t]+.*\n)+)/m.exec(fmRaw);
  if (blockScalar) {
    const indent = /^([ \t]+)/.exec(blockScalar[2])?.[1] || '  ';
    // Join lines, strip per-line indent.
    const lines = blockScalar[2].split('\n').filter(Boolean).map((l) => l.slice(indent.length));
    const value = lines.join(' ').replace(/  +/g, ' ').trim();
    return {
      matchStart: blockScalar.index,
      matchEnd: blockScalar.index + blockScalar[0].length,
      value,
      replace: (newValue) => {
        // Re-render jako single-line (po stripu už není multi-line).
        const needsDouble = newValue.includes("'");
        const escaped = needsDouble
          ? `"${newValue.replace(/"/g, '\\"')}"`
          : `'${newValue.replace(/'/g, "''")}'`;
        return `tldr: ${escaped}\n`;
      },
    };
  }
  // Bare (no quotes) — risky, skip.
  return null;
}

async function processFile(path) {
  const md = await readFile(path, 'utf-8');
  const m = /^(---\n)([\s\S]*?\n)(---\n)([\s\S]*)$/.exec(md);
  if (!m) return null;
  const [, openMarker, fmRaw, closeMarker, body] = m;
  const tldr = findTldrBlock(fmRaw);
  if (!tldr) return null;
  const original = tldr.value;
  const stripped = stripMarkdown(original);
  if (stripped === original) return null;
  const newFmRaw =
    fmRaw.slice(0, tldr.matchStart) +
    tldr.replace(stripped) +
    fmRaw.slice(tldr.matchEnd);
  if (apply) {
    await writeFile(path, openMarker + newFmRaw + closeMarker + body);
  }
  return { path, original: original.slice(0, 80), stripped: stripped.slice(0, 80) };
}

async function main() {
  process.chdir(ROOT);
  const paths = [];
  for await (const p of glob('content/**/*.md')) paths.push(p);
  for await (const p of glob('content/**/*.mdx')) paths.push(p);
  let count = 0;
  const log = [];
  for (const path of paths) {
    const r = await processFile(path);
    if (r) {
      count++;
      log.push(r);
    }
  }
  console.log(`# Strip tldr markdown — ${apply ? 'APPLY' : 'DRY-RUN'}\n`);
  console.log(`Touched: ${count} files\n`);
  for (const e of log.slice(0, 25)) {
    console.log(`  ${e.path}`);
    console.log(`    before: ${e.original}`);
    console.log(`    after:  ${e.stripped}`);
  }
  if (log.length > 25) console.log(`  … +${log.length - 25}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
