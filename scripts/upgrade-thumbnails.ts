/**
 * Nahradí náhledové obrázky velkými verzemi v markdown souborech.
 *
 * Petr ve starém webu používal několik konvencí:
 *   - foto_i.jpg / foto.jpg     — `_i` suffix = thumb, root = full
 *   - foto_min.jpg / foto.jpg   — `_min` suffix = thumb
 *   - foto_n.jpg / foto.jpg     — `_n` suffix = thumb
 *   - foto_s.jpg / foto.jpg     — `_s` suffix = thumb
 *   - path/foto.jpg / path/f/foto.jpg — `f/` subdirectory = full
 *
 * Skript:
 *   1. Projde všechny ![alt](path) v markdownu.
 *   2. Pokud cesta vypadá jako thumbnail a existuje plná verze, nahradí.
 *   3. Pokud byl obrázek v `[![thumb](thumb)](full)` struktuře, zachová
 *      odkaz na full a obrázek nahradí za větší verzi.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const CONTENT_DIR = join(ROOT, 'content', 'hodinarium-eu');
const PUBLIC_DIR = join(ROOT, 'apps', 'hodinarium-eu', 'public');

function tryUpgrade(uri: string): string {
  if (!uri.startsWith('/img/')) return uri;
  const path = uri.split('?')[0].split('#')[0];
  const ext = path.match(/\.(jpg|jpeg|png|gif|webp)$/i)?.[0];
  if (!ext) return uri;

  const base = path.slice(0, -ext.length);
  const candidates: string[] = [];

  // 1. _i / _min / _n / _s suffix → bez suffixu (např. foto_i.jpg → foto.jpg)
  for (const suffix of ['_i', '_min', '_n', '_s']) {
    if (base.endsWith(suffix)) {
      candidates.push(base.slice(0, -suffix.length) + ext);
    }
  }

  // 2. path/foto.jpg → path/f/foto.jpg (full subdirectory)
  const dir = dirname(path);
  const file = basename(path);
  if (!dir.endsWith('/f')) {
    candidates.push(`${dir}/f/${file}`);
  }

  // 3. Pokud již je v `f/` subdirectory, nelze upgradovat
  for (const candidate of candidates) {
    const local = join(PUBLIC_DIR, candidate.replace(/^\//, ''));
    if (existsSync(local)) return candidate;
  }
  return uri;
}

async function main() {
  const files = (await readdir(CONTENT_DIR)).filter((f) => f.endsWith('.md'));
  let totalUpgraded = 0;
  let totalChecked = 0;
  const filesUpdated: string[] = [];

  for (const file of files) {
    const path = join(CONTENT_DIR, file);
    const md = await readFile(path, 'utf-8');

    // Skip ručně editované soubory
    if (/^manualEdit:\s*true/m.test(md)) continue;

    let updated = md;
    let count = 0;

    // ![alt](url) i [![alt](thumb_url)](full_url)
    updated = updated.replace(
      /(!\[[^\]]*\])\(([^)]+)\)/g,
      (_match, label, uri) => {
        totalChecked++;
        const upgraded = tryUpgrade(uri);
        if (upgraded !== uri) {
          count++;
          totalUpgraded++;
          return `${label}(${upgraded})`;
        }
        return `${label}(${uri})`;
      },
    );

    // Pokud byly link-wrapped jako [![thumb](thumb_url)](full_url),
    // lze zjednodušit: pokud thumb_url nyní == full_url po upgrade, zachovat jen ![alt](url)
    updated = updated.replace(
      /\[(!\[[^\]]*\]\(([^)]+)\))\]\(([^)]+)\)/g,
      (match, imgPart, thumbUrl, linkUrl) => {
        if (thumbUrl === linkUrl) return imgPart;
        return match;
      },
    );

    if (count > 0) {
      await writeFile(path, updated, 'utf-8');
      filesUpdated.push(`${file} (${count} upgrades)`);
    }
  }

  console.log(`=== Thumbnail upgrade ===`);
  console.log(`Zkontrolováno odkazů:  ${totalChecked}`);
  console.log(`Upgradováno:           ${totalUpgraded}`);
  console.log(`Souborů změněno:       ${filesUpdated.length}`);
  console.log('\nPrvních 10:');
  filesUpdated.slice(0, 10).forEach((s) => console.log(`  ${s}`));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
