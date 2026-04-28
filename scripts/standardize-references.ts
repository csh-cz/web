/**
 * Standardize the "references / external links" section heading across
 * all articles. Many variants exist:
 *   "Hlavní použité zdroje:", "Zajímavé odkazy", "Další odkazy",
 *   "Odkazy na další použití", "Odkazy:", …
 *
 * All become a single canonical:  ## Odkazy
 *
 * Skip files with manualEdit: true. Idempotent.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const DIRS = [
  join(ROOT, 'content', 'hodinarium-eu'),
  join(ROOT, 'content', 'horologie-cz'),
];

// Patterns that match heading lines we want to rename.
// Order matters — more specific before generic.
const PATTERNS: Array<[RegExp, string]> = [
  // "## Hlavní použité zdroje" / "## Použité zdroje" / "## Použité prameny"
  [/^##\s+(Hlavní\s+)?(Použité|Hlavní)\s+(zdroje|prameny)\s*:?\s*$/i, '## Odkazy'],
  // "## Zajímavé odkazy", "## Externí odkazy", "## Další odkazy"
  [/^##\s+(Zajímavé|Externí|Další)\s+odkazy\s*:?\s*$/i, '## Odkazy'],
  // "## Odkazy na X" / "## Odkazy a podklady" / "## Odkazy na další použití"
  [/^##\s+Odkazy\b.*$/i, '## Odkazy'],
  // "## Bibliografie" / "## Literatura"
  [/^##\s+(Bibliografie|Literatura)\s*:?\s*$/i, '## Odkazy'],
  // "## Jiné pneumatické systémy a zajímavé odkazy" → too topical, leave alone
  // (matches /Zajímavé odkazy/ above only as standalone)
];

interface Stats {
  filesScanned: number;
  filesUpdated: number;
  headingsRenamed: number;
}

function processFile(content: string, stats: Stats): string {
  if (/^manualEdit:\s*true/m.test(content)) return content;
  const lines = content.split('\n');
  let inFrontmatter = false;
  let frontmatterDelims = 0;
  const out: string[] = [];
  let renamed = 0;
  for (const line of lines) {
    if (line === '---') {
      frontmatterDelims++;
      inFrontmatter = frontmatterDelims === 1;
      out.push(line);
      continue;
    }
    if (inFrontmatter || frontmatterDelims < 2) {
      out.push(line);
      continue;
    }
    let newLine = line;
    for (const [re, replacement] of PATTERNS) {
      if (re.test(line)) {
        newLine = replacement;
        renamed++;
        break;
      }
    }
    out.push(newLine);
  }
  if (renamed === 0) return content;
  stats.headingsRenamed += renamed;
  return out.join('\n');
}

async function main() {
  const stats: Stats = { filesScanned: 0, filesUpdated: 0, headingsRenamed: 0 };

  for (const dir of DIRS) {
    const files = (await readdir(dir)).filter((f) => f.endsWith('.md'));
    for (const file of files) {
      const path = join(dir, file);
      const content = await readFile(path, 'utf-8');
      stats.filesScanned++;
      const updated = processFile(content, stats);
      if (updated !== content) {
        await writeFile(path, updated, 'utf-8');
        stats.filesUpdated++;
        console.log(`  ${file}`);
      }
    }
  }

  console.log('\n=== Standardize references heading ===');
  console.log(`Scanned:           ${stats.filesScanned}`);
  console.log(`Updated:           ${stats.filesUpdated}`);
  console.log(`Headings renamed:  ${stats.headingsRenamed}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
