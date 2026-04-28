/**
 * Sync chybějících obrázků z hodinarium-eu/public/img/ do horologie-cz/public/img/.
 *
 * Spolek a hodinárium sdílejí historický fond obrázků z hodinarium.eu.
 * Když migrujeme článek o spolku do horologie-cz a v něm jsou /img/... refs,
 * obrázek je dosud jen v hodinarium-eu/public/img/. Tenhle skript zkopíruje
 * chybějící.
 *
 * Idempotentní — neopisuje to, co už existuje.
 */
import { readFile, readdir, copyFile, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const CONTENT = join(ROOT, 'content', 'horologie-cz');
const SOURCE = join(ROOT, 'apps', 'hodinarium-eu', 'public');
const TARGET = join(ROOT, 'apps', 'horologie-cz', 'public');

interface Stats {
  filesScanned: number;
  refsFound: number;
  copied: number;
  alreadyExisted: number;
  notFoundInSource: number;
}

function extractImagePaths(md: string): Set<string> {
  const set = new Set<string>();
  const re = /!\[[^\]]*\]\((\/img\/[^)\s]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) set.add(m[1]);
  // Také odkazy s [text](/img/...) — třeba galerie thumbnaily
  const re2 = /\[[^\]]*\]\((\/img\/[^)\s]+)\)/g;
  while ((m = re2.exec(md)) !== null) set.add(m[1]);
  return set;
}

async function main() {
  const files = (await readdir(CONTENT)).filter((f) => f.endsWith('.md'));
  const stats: Stats = {
    filesScanned: 0,
    refsFound: 0,
    copied: 0,
    alreadyExisted: 0,
    notFoundInSource: 0,
  };

  const allRefs = new Set<string>();
  for (const file of files) {
    stats.filesScanned++;
    const md = await readFile(join(CONTENT, file), 'utf-8');
    for (const ref of extractImagePaths(md)) allRefs.add(ref);
  }
  stats.refsFound = allRefs.size;

  for (const ref of allRefs) {
    const targetPath = join(TARGET, ref.replace(/^\//, ''));
    if (existsSync(targetPath)) {
      stats.alreadyExisted++;
      continue;
    }
    const sourcePath = join(SOURCE, ref.replace(/^\//, ''));
    if (!existsSync(sourcePath)) {
      stats.notFoundInSource++;
      console.log(`  CHYBÍ ve zdroji: ${ref}`);
      continue;
    }
    await mkdir(dirname(targetPath), { recursive: true });
    await copyFile(sourcePath, targetPath);
    stats.copied++;
    console.log(`  copy: ${ref}`);
  }

  console.log('\n=== Sync obrázků ===');
  console.log(`Souborů zkontrolováno:    ${stats.filesScanned}`);
  console.log(`Unikátních ref:           ${stats.refsFound}`);
  console.log(`Zkopírováno:              ${stats.copied}`);
  console.log(`Už existovalo v cíli:     ${stats.alreadyExisted}`);
  console.log(`Chybí i ve zdroji:        ${stats.notFoundInSource}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
