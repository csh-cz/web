#!/usr/bin/env node
/**
 * audit-citation-style.mjs — najde porušení konvence „autor–datum v body
 * + plná citace v Reference sekci frontmatter".
 *
 * Anti-patterny:
 *   1. ISBN/ISSN/DOI string v body článku (ne ve frontmatter)
 *      → typicky znamená plnou citaci vsazenou inline
 *   2. Citation-like pattern: AUTOR. *Title*. Místo: Vydavatel, RRRR.
 *   3. Velký název publikace v CAPS v body (např. STUDIA RUDOLPHINA)
 *   4. Inline `[Long bibliographic text](URL)` link kde text vypadá jako citace
 *
 * Co-OK patterny (ne porušení):
 *   - `[Knespl 2024](#ref-knespl-2024)` — autor–datum hyperlink na anchor
 *   - `[Krátký titul](/interní/slug)` — wikilink
 *   - Frontmatter `references:` block (= správné místo)
 *
 * Použití:
 *   node scripts/audit-citation-style.mjs                  # full report
 *   node scripts/audit-citation-style.mjs --collection hodinari
 *   node scripts/audit-citation-style.mjs --top 20         # nejvíce postižené
 */

import { readFile } from 'node:fs/promises';
import { glob } from 'node:fs/promises';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = join(ROOT, 'content');

const args = process.argv.slice(2);
function flagArg(name) {
  const i = args.indexOf(name);
  return i === -1 ? '' : (args[i + 1] || '');
}
const collection = flagArg('--collection');
const topN = parseInt(flagArg('--top'), 10) || 0;

function splitFrontmatter(md) {
  const m = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(md);
  if (!m) return { frontmatter: '', body: md };
  return { frontmatter: m[1], body: m[2] };
}

function findViolations(body) {
  const lines = body.split('\n');
  const violations = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNo = i + 1;
    // Skip code blocks (heuristika — řádek začíná 4+ mezerami nebo je v ``` blocku)
    if (line.startsWith('    ') || line.startsWith('\t')) continue;

    // Pattern 1: ISBN/ISSN/DOI v body
    if (/\bISBN\s+[\d-]{10,}|\bISSN\s+\d{4}-\d{3,4}|\b10\.\d{4,}\/\S+/.test(line)) {
      violations.push({ lineNo, type: 'isbn-in-body', sample: line.trim().slice(0, 120) });
    }

    // Pattern 2: Plná bibliografická citace AUTOR. *Title*. Místo: Vydavatel, RRRR.
    // Heuristika: CAPS slovo následované tečkou + *italic* (markdown bold/italic)
    if (/[A-ZÁ-Ž]{2,}[A-ZÁ-Ž,\s]*\.\s+\*[A-ZÁ-Ž]/.test(line)) {
      violations.push({ lineNo, type: 'full-citation', sample: line.trim().slice(0, 120) });
    }

    // Pattern 3: Inline italic *Title* (Místo Rok, …) plná citace v parenthesis
    // Heuristika: `*Title text* (Slovo Slovo, RRRR, ...)` kde RRRR je 4-digit rok
    if (/\*[A-Z][^*]{3,}\*\s*\([^)]*\b(19|20)\d{2}[^)]*\)/.test(line)) {
      violations.push({ lineNo, type: 'italic-title-paren', sample: line.trim().slice(0, 120) });
    }

    // Pattern 4: Inline link s long bibliographic text
    // Heuristika: [text >40 chars containing dots + caps](URL)
    const inlineLinks = [...line.matchAll(/\[([^\]]{40,})\]\(([^)]+)\)/g)];
    for (const m of inlineLinks) {
      const text = m[1];
      if (/[A-Z]{3,}/.test(text) && /\./.test(text)) {
        violations.push({ lineNo, type: 'long-inline-link', sample: text.slice(0, 100) });
      }
    }
  }
  return violations;
}

async function main() {
  const stats = { totalFiles: 0, violationFiles: 0, totalViolations: 0 };
  const perFile = [];

  // Node fs.glob vyžaduje relative path z cwd; brace expansion není reliable.
  process.chdir(ROOT);
  const base = collection ? `content/${collection}` : 'content';
  const allPaths = [];
  for await (const p of glob(`${base}/**/*.md`)) allPaths.push(p);
  for await (const p of glob(`${base}/**/*.mdx`)) allPaths.push(p);
  for (const path of allPaths) {
    stats.totalFiles++;
    const md = await readFile(path, 'utf-8');
    const { body } = splitFrontmatter(md);
    const violations = findViolations(body);
    if (violations.length === 0) continue;
    stats.violationFiles++;
    stats.totalViolations += violations.length;
    perFile.push({ path: relative(ROOT, path), violations });
  }

  // Sort by violation count desc.
  perFile.sort((a, b) => b.violations.length - a.violations.length);
  const limited = topN > 0 ? perFile.slice(0, topN) : perFile;

  console.log(`# Citation style audit\n`);
  console.log(`Scanned: ${stats.totalFiles} files`);
  console.log(`With violations: ${stats.violationFiles} files`);
  console.log(`Total violations: ${stats.totalViolations}\n`);

  // Aggregate by type
  const byType = {};
  for (const f of perFile) {
    for (const v of f.violations) {
      byType[v.type] = (byType[v.type] || 0) + 1;
    }
  }
  console.log('## By type');
  for (const [type, count] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${type.padEnd(24)} ${count}`);
  }

  console.log(`\n## Per file (${topN > 0 ? `top ${topN}` : 'all'})\n`);
  for (const f of limited) {
    console.log(`### ${f.path} (${f.violations.length})`);
    for (const v of f.violations.slice(0, 3)) {
      console.log(`  L${v.lineNo} [${v.type}] ${v.sample}`);
    }
    if (f.violations.length > 3) console.log(`  … +${f.violations.length - 3}`);
    console.log();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
