/**
 * Cleanup obrázkových referencí v markdown:
 *
 * 1. Odstranit reference na obrázky, které neexistují lokálně (broken).
 * 2. Doplnit alt text/caption u prázdných alt podle filename.
 *
 * Idempotentní.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const CONTENT = join(ROOT, 'content', 'hodinarium-eu');
const PUBLIC = join(ROOT, 'apps', 'hodinarium-eu', 'public');

interface Stats {
  brokenRemoved: number;
  altFilled: number;
  filesChanged: number;
  filesScanned: number;
}

function captionFromFilename(filename: string): string {
  // foto_0001.jpg → "Fotografie 1"
  // Krecmer_foto1.jpg → "Krecmer foto 1"
  // foto-0042.jpg → "Fotografie 42"
  const base = filename.replace(/\.(jpe?g|png|gif|webp)$/i, '');

  // Číslo na konci?
  const numMatch = base.match(/^(.+?)[_-]?(\d+)$/);
  if (numMatch) {
    let prefix = numMatch[1].replace(/[_-]+/g, ' ').trim();
    const num = parseInt(numMatch[2], 10);
    // foto / image / pic = "Fotografie"
    if (/^(foto|image|img|pic|fotka)s?$/i.test(prefix)) prefix = 'Fotografie';
    return prefix ? `${prefix} ${num}` : `Fotografie ${num}`;
  }
  // Bez čísla — vrať jen jméno
  return base.replace(/[_-]+/g, ' ').trim();
}

function fix(md: string, stats: Stats): string {
  let out = md;

  // Pattern: ![alt](path)
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt: string, url: string) => {
    // Externí URL — zachovat (nemůžeme zkontrolovat lokálně)
    if (/^https?:\/\//.test(url)) return match;

    // Lokální /img/... cesta — zkontroluj existenci
    if (url.startsWith('/img/')) {
      const local = join(PUBLIC, url.replace(/^\//, ''));
      if (!existsSync(local)) {
        // Reference na neexistující obrázek → odstranit
        stats.brokenRemoved++;
        return '';
      }
      // Existuje — pokud alt prázdný, doplň z filename
      if (alt.trim() === '') {
        const filename = basename(url);
        const caption = captionFromFilename(filename);
        if (caption) {
          stats.altFilled++;
          return `![${caption}](${url})`;
        }
      }
    }
    return match;
  });

  // Vyčistit prázdné odstavce, které vznikly po odebrání broken refs
  out = out.replace(/\n{3,}/g, '\n\n');
  out = out.replace(/^\n+/, '');

  return out;
}

async function main() {
  const files = (await readdir(CONTENT)).filter((f) => f.endsWith('.md'));
  const stats: Stats = {
    brokenRemoved: 0,
    altFilled: 0,
    filesChanged: 0,
    filesScanned: 0,
  };

  for (const file of files) {
    const path = join(CONTENT, file);
    const md = await readFile(path, 'utf-8');
    // Skip ručně editované
    if (/^manualEdit:\s*true/m.test(md)) {
      stats.filesScanned++;
      continue;
    }
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
  console.log(`Broken refs odstraněno: ${stats.brokenRemoved}`);
  console.log(`Alt text doplněn:       ${stats.altFilled}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
