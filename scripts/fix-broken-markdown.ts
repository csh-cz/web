/**
 * Globální cleanup ošklivých markdown patternů, které vznikly z konverze
 * Highslide / WYSIWYG HTML.
 *
 * 1. [!](url)  →  ![](url)
 *    (broken Highslide pattern: link s alt="!" místo image)
 * 2. **YYYY** v samostatném řádku  →  ## YYYY  (heading místo bold)
 * 3. * * *  na začátku článku → smazat (separator předtím, než cokoli začne)
 * 4. Více po sobě jdoucích * * * → konsolidovat na jeden
 *
 * Idempotentní — lze pouštět opakovaně.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const CONTENT = join(ROOT, 'content', 'hodinarium-eu');

interface Stats {
  brokenImages: number;
  yearHeadings: number;
  leadingHr: number;
  filesChanged: number;
  filesScanned: number;
}

function fix(md: string, stats: Stats): string {
  let out = md;

  // 1. [!](url) → ![](url)  — Highslide leftover
  const brokenImg = /\[!\]\(([^)]+)\)/g;
  const before1 = (out.match(brokenImg) ?? []).length;
  out = out.replace(brokenImg, (_, url) => `![](${url})`);
  stats.brokenImages += before1;

  // 2. **YYYY**  na samostatném řádku → ## YYYY
  const yearHeading = /^\*\*((?:1[3-9]|20)\d{2})\*\*\s*$/gm;
  const before2 = (out.match(yearHeading) ?? []).length;
  out = out.replace(yearHeading, '## $1');
  stats.yearHeadings += before2;

  // 3. Leading *** na úplném začátku těla (po frontmatter)
  // Frontmatter je oddělený `---\n...\n---\n` — najdi konec, vyčisti začátek těla
  const fmEnd = out.indexOf('\n---\n');
  if (fmEnd !== -1) {
    const fm = out.slice(0, fmEnd + 5);
    let body = out.slice(fmEnd + 5);
    const beforeBody = body;
    // Vyhodit leading hr separator(y) + prázdné řádky
    body = body.replace(/^(?:\s*\*\s*\*\s*\*\s*\n+)+/, '');
    if (body !== beforeBody) stats.leadingHr++;
    out = fm + body;
  }

  return out;
}

async function main() {
  const files = (await readdir(CONTENT)).filter((f) => f.endsWith('.md'));
  const stats: Stats = {
    brokenImages: 0, yearHeadings: 0, leadingHr: 0,
    filesChanged: 0, filesScanned: 0,
  };

  for (const file of files) {
    const path = join(CONTENT, file);
    const md = await readFile(path, 'utf-8');
    const fixed = fix(md, stats);
    stats.filesScanned++;
    if (fixed !== md) {
      await writeFile(path, fixed, 'utf-8');
      stats.filesChanged++;
    }
  }

  console.log('=== Cleanup hotov ===');
  console.log(`Souborů zkontrolováno: ${stats.filesScanned}`);
  console.log(`Souborů upraveno:      ${stats.filesChanged}`);
  console.log(`[!](url) → ![](url):   ${stats.brokenImages}`);
  console.log(`**YYYY** → ## YYYY:    ${stats.yearHeadings}`);
  console.log(`Leading *** odstraněn: ${stats.leadingHr}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
