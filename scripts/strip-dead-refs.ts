/**
 * Vyhodí mrtvé image refs (URL, které vrací 404 i přímo na hodinarium.eu).
 * Před spuštěním ověří dostupnost přes HEAD request.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const CONTENT_DIR = join(ROOT, 'content', 'hodinarium-eu');

async function urlAlive(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  const files = (await readdir(CONTENT_DIR)).filter((f) => f.endsWith('.md'));
  const stripped: { file: string; url: string }[] = [];
  const kept: { file: string; url: string }[] = [];

  for (const file of files) {
    const path = join(CONTENT_DIR, file);
    let md = await readFile(path, 'utf-8');
    const urls = [...new Set(
      [...md.matchAll(/https:\/\/hodinarium\.eu\/[^\s)]+\.(?:jpg|jpeg|png|gif|webp)/gi)].map((m) => m[0]),
    )];
    if (urls.length === 0) continue;

    let changed = false;
    for (const url of urls) {
      const alive = await urlAlive(url);
      if (alive) {
        kept.push({ file, url });
        continue;
      }
      // Vyhodit: ![alt](DEAD), [![alt](DEAD)](DEAD2), atd.
      const before = md;
      // 1. [![alt](DEAD)](anything) → smazat celý
      md = md.replace(new RegExp(`\\[!\\[[^\\]]*\\]\\(${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)\\]\\([^)]*\\)`, 'g'), '');
      // 2. ![alt](DEAD) → smazat
      md = md.replace(new RegExp(`!\\[[^\\]]*\\]\\(${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g'), '');
      // 3. # ![alt](DEAD)Text → # Text
      md = md.replace(/^#+\s*[*\s]*$/gm, '');
      if (md !== before) {
        stripped.push({ file, url });
        changed = true;
      }
    }
    if (changed) {
      // Cleanup nadbytečných whitespace
      md = md.replace(/\n{3,}/g, '\n\n').replace(/[ \t]+\n/g, '\n');
      await writeFile(path, md, 'utf-8');
    }
  }

  console.log(`Strippoval ${stripped.length} mrtvých refs:`);
  stripped.forEach((s) => console.log(`  ${s.file}: ${s.url.slice(-60)}`));
  console.log(`Zachovalo ${kept.length} validních refs.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
