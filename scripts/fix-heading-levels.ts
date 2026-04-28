/**
 * Víceúrovňové členění nadpisů.
 *
 * Detekuje články, kde H2 obsahuje pouze rok (např. "## 2018"),
 * a všechny ostatní H2 ve stejné rok-sekci převede na H3.
 *
 * - "## 2018"           → ponecháno jako H2 (úroveň: rok)
 * - "## 2017 - 2018"    → ponecháno jako H2
 * - "## Krečmer"        → převedeno na H3 (úroveň: jednotlivá hodina)
 * - "## leden 2019"     → ponecháno jako H2 (není čistý rok)
 *
 * Skip souborů s manualEdit: true.
 * Idempotentní — opakovaný běh nemění už upravené soubory.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const CONTENT = join(ROOT, 'content', 'hodinarium-eu');

const YEAR_HEADING_RE = /^##\s+(\d{4})(\s*[-–]\s*\d{4})?\s*$/;

interface Stats {
  filesScanned: number;
  filesChanged: number;
  yearArticles: number;
  promotedToH3: number;
}

function fix(md: string, stats: Stats): { out: string; changed: boolean } {
  const lines = md.split('\n');

  // Detekce: existuje aspoň jeden ## YYYY?
  const hasYearHeadings = lines.some((l) => YEAR_HEADING_RE.test(l));
  if (!hasYearHeadings) return { out: md, changed: false };

  stats.yearArticles++;

  // Pozn.: chceme být v "uvnitř roku" jen po prvním rok-nadpisu.
  // Ostatní H2 mezi roky nebo po roku převedeme na H3.
  let inYearSection = false;
  let inFrontmatter = false;
  let inCodeBlock = false;
  let frontmatterDelims = 0;
  let promoted = 0;

  const out = lines.map((line) => {
    // Frontmatter detection: --- na začátku, druhý --- = konec
    if (line === '---' && !inCodeBlock) {
      frontmatterDelims++;
      inFrontmatter = frontmatterDelims === 1;
      return line;
    }
    if (frontmatterDelims < 2) return line;

    // Code blocks
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      return line;
    }
    if (inCodeBlock) return line;

    // Year heading?
    if (YEAR_HEADING_RE.test(line)) {
      inYearSection = true;
      return line;
    }

    // Jiný H2 uvnitř year section → povýšit hloubku na H3
    if (inYearSection && /^##\s+\S/.test(line) && !line.startsWith('###')) {
      promoted++;
      return line.replace(/^##\s+/, '### ');
    }

    return line;
  });

  if (promoted === 0) return { out: md, changed: false };
  stats.promotedToH3 += promoted;
  return { out: out.join('\n'), changed: true };
}

async function main() {
  const files = (await readdir(CONTENT)).filter((f) => f.endsWith('.md'));
  const stats: Stats = {
    filesScanned: 0,
    filesChanged: 0,
    yearArticles: 0,
    promotedToH3: 0,
  };

  for (const file of files) {
    const path = join(CONTENT, file);
    const md = await readFile(path, 'utf-8');
    stats.filesScanned++;

    if (/^manualEdit:\s*true/m.test(md)) continue;

    const { out, changed } = fix(md, stats);
    if (changed) {
      await writeFile(path, out, 'utf-8');
      stats.filesChanged++;
      console.log(`  upraveno: ${file}`);
    }
  }

  console.log('\n=== Hierarchie nadpisů ===');
  console.log(`Souborů zkontrolováno:  ${stats.filesScanned}`);
  console.log(`Souborů s rok-nadpisy:  ${stats.yearArticles}`);
  console.log(`Souborů upraveno:       ${stats.filesChanged}`);
  console.log(`H2 → H3 povýšení:       ${stats.promotedToH3}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
