#!/usr/bin/env node
/**
 * strip-zotero-keys.mjs — odstraní `[Zotero `KEY`]` mentions z body článků.
 *
 * Per user feedback: „Zotero key neuváděj, pro uživatele není k ničemu,
 * Zotero je moje lokální, na serveru máme bibtex. Všechny citace by měly
 * být převedené do bibtextu. Pokud potřebujeme referenci na původní Zotero
 * záznam tak ho dávejme do skrytého pole."
 *
 * Strategie:
 *   1. Najít všechna `[Zotero `KEY`]` v body (po frontmatter ---).
 *   2. Pro každý KEY:
 *      a. Pokud frontmatter `references[]` nebo `prameny[]` má bibKey
 *         odpovídající KEY → nahradit body za autor–datum ref (TODO complex).
 *      b. Jinak prostě **odstranit** (`[Zotero KEY]` → `''`).
 *   3. Pokud řádek je „> — AUTOR. *Title*. [Zotero KEY]" attribution,
 *      ponechat attribution ale strip [Zotero KEY].
 *
 * Skutečnost: většina KEYs nemá frontmatter entry (jsou jen inline
 * pomocné odkazy autora pro vlastní Zotero). Strip je nejvíc bezpečné.
 *
 * Použití:
 *   node scripts/strip-zotero-keys.mjs                     # dry-run report
 *   node scripts/strip-zotero-keys.mjs --apply             # provede strip
 */

import { readFile, writeFile, glob } from 'node:fs/promises';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const apply = process.argv.includes('--apply');

function splitFrontmatter(md) {
  const m = /^---\n([\s\S]*?\n)---\n([\s\S]*)$/.exec(md);
  if (!m) return { header: '', frontmatter: '', body: md };
  return { header: '---\n' + m[1] + '---\n', frontmatter: m[1], body: m[2] };
}

/**
 * Stripping patterns (pořadí: nejvíc specifické první):
 *
 * 1. `, [Zotero `KEY`]`  →  ``  (comma + space + bracket)
 * 2. `. [Zotero `KEY`]`  →  `.` (tečka + space + bracket)
 * 3. ` ([Zotero `KEY`])` →  ``  (space + paren-bracket)
 * 4. `[Zotero `KEY`]`    →  ``  (bare, last resort)
 *
 * Pak compact double spaces, fix trailing spaces in lines.
 */
function stripZoteroKeys(body) {
  let out = body;
  const before = out;
  // Generický `[Zotero …]` (multi-key, slash/comma/space oddělovače, BBT keys
  // jako `knesplJanProkes2018` i Zotero internal keys `IVSGJLYL`).
  // Catch-all pro `[Zotero `KEY1`, `KEY2`]`, `[Zotero `KEY1` / `KEY2`]` atd.
  const ZOTERO_PAT = /\[Zotero(?:\s+`[A-Za-z0-9_]+`[,/\s]*)+\]/g;
  // Greedy strip first (parenthesized form)
  out = out.replace(new RegExp(`\\s*\\(${ZOTERO_PAT.source}\\)`, 'g'), '');
  out = out.replace(new RegExp(`,\\s+${ZOTERO_PAT.source}`, 'g'), '');
  out = out.replace(new RegExp(`\\.\\s+${ZOTERO_PAT.source}`, 'g'), '.');
  out = out.replace(new RegExp(`\\s+${ZOTERO_PAT.source}`, 'g'), '');
  // Bare bracket fallback (na začátku řádku, blockquote, …)
  out = out.replace(ZOTERO_PAT, '');
  // Italic-wrapped form `*— citováno v Knespl 2018, *` → strip excess punct
  out = out.replace(/\*[—\s]*citováno v [^*]+\*$/gm, '');
  // Cleanup double spaces + trailing commas/spaces in lines
  out = out
    .split('\n')
    .map((line) =>
      line
        .replace(/  +/g, ' ')
        .replace(/,\s*$/, '') // trailing comma after strip
        .replace(/\s+\.\s*$/, '.') // floating period
        .replace(/ +$/, ''),
    )
    .join('\n');
  const matches = (before.match(/\[Zotero[\s`A-Za-z0-9_,/]*\]/g) || []).length;
  return { out, stripped: matches };
}

async function main() {
  process.chdir(ROOT);
  const paths = [];
  for await (const p of glob('content/**/*.md')) paths.push(p);
  for await (const p of glob('content/**/*.mdx')) paths.push(p);

  let totalFiles = 0;
  let touchedFiles = 0;
  let totalStripped = 0;
  const perFile = [];

  for (const path of paths) {
    totalFiles++;
    const md = await readFile(path, 'utf-8');
    const { header, body } = splitFrontmatter(md);
    const { out, stripped } = stripZoteroKeys(body);
    if (stripped === 0) continue;
    touchedFiles++;
    totalStripped += stripped;
    perFile.push({ path, count: stripped });
    if (apply) {
      await writeFile(path, header + out);
    }
  }

  perFile.sort((a, b) => b.count - a.count);
  console.log(`# Strip Zotero keys — ${apply ? 'APPLY' : 'DRY-RUN'}\n`);
  console.log(`Scanned: ${totalFiles} files`);
  console.log(`Touched: ${touchedFiles} files`);
  console.log(`Stripped: ${totalStripped} [Zotero KEY] mentions\n`);
  console.log('## Per file (top 20):');
  for (const f of perFile.slice(0, 20)) {
    console.log(`  ${f.count.toString().padStart(3)}  ${f.path}`);
  }
  if (perFile.length > 20) console.log(`  … +${perFile.length - 20} dalších`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
