/**
 * Obnoví `lastModified` ve frontmatteru každého článku z HTTP Last-Modified
 * hlavičky původního webu hodinarium.eu.
 *
 * Server hodinarium.eu (WEDOS Apache) vrací u statických .htm souborů
 * skutečný file mtime jako Last-Modified, takže to je nejspolehlivější
 * zdroj data aktualizace.
 *
 * Idempotentní — modifikuje frontmatter jen když se hodnota liší.
 * Skip souborů s manualEdit: true.
 *
 * Šetrnost: HEAD requesty (žádné body), nízká paralelita, drobná pauza.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const CONTENT = join(ROOT, 'content', 'hodinarium-eu');

const USER_AGENT = 'Mozilla/5.0 (compatible; CSH-Migration/0.1)';
const CONCURRENCY = 4;
const DELAY_MS = 100;

interface Stats {
  filesScanned: number;
  filesUpdated: number;
  filesUnchanged: number;
  fetchFailed: number;
  noOriginalUrl: number;
}

async function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function parseFrontmatter(content: string): { fm: Record<string, string>; rest: string } | null {
  const m = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return null;
  const fm: Record<string, string> = {};
  for (const line of m[1].split('\n')) {
    const km = line.match(/^([\w-]+):\s*(.*)$/);
    if (!km) continue;
    fm[km[1]] = km[2];
  }
  return { fm, rest: m[2] };
}

async function fetchLastModified(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) return null;
    return res.headers.get('last-modified');
  } catch {
    return null;
  }
}

async function processFile(file: string, stats: Stats): Promise<void> {
  const path = join(CONTENT, file);
  const content = await readFile(path, 'utf-8');
  stats.filesScanned++;

  if (/^manualEdit:\s*true/m.test(content)) return;

  const parsed = parseFrontmatter(content);
  if (!parsed) return;

  const originalUrlRaw = parsed.fm.originalUrl;
  if (!originalUrlRaw) {
    stats.noOriginalUrl++;
    return;
  }
  const originalUrl = originalUrlRaw.replace(/^"(.*)"$/, '$1');

  const remote = await fetchLastModified(originalUrl);
  if (!remote) {
    stats.fetchFailed++;
    return;
  }

  const currentRaw = parsed.fm.lastModified ?? '';
  const current = currentRaw.replace(/^"(.*)"$/, '$1');

  if (current === remote) {
    stats.filesUnchanged++;
    return;
  }

  const newLine = `lastModified: "${remote}"`;
  const updated = parsed.fm.lastModified !== undefined
    ? content.replace(/^lastModified:\s*.*$/m, newLine)
    : content.replace(/^---\n/, `---\n${newLine}\n`);

  await writeFile(path, updated, 'utf-8');
  stats.filesUpdated++;
  console.log(`  ${file}: ${current || '(none)'} → ${remote}`);
}

async function main() {
  const files = (await readdir(CONTENT)).filter((f) => f.endsWith('.md'));
  const stats: Stats = {
    filesScanned: 0,
    filesUpdated: 0,
    filesUnchanged: 0,
    fetchFailed: 0,
    noOriginalUrl: 0,
  };

  let idx = 0;
  async function worker() {
    while (idx < files.length) {
      const i = idx++;
      await processFile(files[i], stats);
      await delay(DELAY_MS);
    }
  }
  await Promise.all(Array(CONCURRENCY).fill(0).map(() => worker()));

  console.log('\n=== Refresh lastModified ===');
  console.log(`Souborů zkontrolováno:   ${stats.filesScanned}`);
  console.log(`Souborů aktualizováno:   ${stats.filesUpdated}`);
  console.log(`Beze změny:              ${stats.filesUnchanged}`);
  console.log(`Bez originalUrl:         ${stats.noOriginalUrl}`);
  console.log(`Selhalo (HEAD failed):   ${stats.fetchFailed}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
