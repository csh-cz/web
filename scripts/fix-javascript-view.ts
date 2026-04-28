/**
 * Fix Highslide javascript:view() image references in markdown.
 *
 * Pattern v původních článcích z hodinarium.eu:
 *   ![](<javascript:view\('img/vezni/maregraf1.jpg', 600, 499\)>)
 *   [text](<javascript:view\('img/foo.jpg', W, H\)>)
 *
 * Cíl:
 *   ![](/img/vezni/maregraf1.jpg)
 *   [text](/img/foo.jpg)
 *
 * Pak je třeba spustit `pnpm download:hodinarium`, aby se stáhly chybějící.
 * Skip souborů s manualEdit: true.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const CONTENT = join(ROOT, 'content', 'hodinarium-eu');

interface Stats {
  filesScanned: number;
  filesChanged: number;
  refsFixed: number;
}

// Match jak `<javascript:view\('img/...', W, H\)>` tak `javascript:view('img/...', W, H)`
// uvnitř markdown odkazu nebo image src.
// Eskejpované backslashe zachovává.
const PATTERN = /<?javascript:view\\?\('([^']+)',\s*\d+,\s*\d+\\?\)>?/g;

function fix(md: string, stats: Stats): { out: string; changed: boolean } {
  let count = 0;
  const out = md.replace(PATTERN, (_match, path: string) => {
    count++;
    return path.startsWith('/') ? path : '/' + path;
  });
  if (count === 0) return { out: md, changed: false };
  stats.refsFixed += count;
  return { out, changed: true };
}

async function main() {
  const files = (await readdir(CONTENT)).filter((f) => f.endsWith('.md'));
  const stats: Stats = { filesScanned: 0, filesChanged: 0, refsFixed: 0 };

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

  console.log('\n=== Fix javascript:view ===');
  console.log(`Souborů zkontrolováno: ${stats.filesScanned}`);
  console.log(`Souborů upraveno:      ${stats.filesChanged}`);
  console.log(`Refs opraveno:         ${stats.refsFixed}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
