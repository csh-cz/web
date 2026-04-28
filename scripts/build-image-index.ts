/**
 * Generuje JSON index s rozměry všech obrázků v public/img/.
 *
 * Výstup: apps/hodinarium-eu/src/data/image-sizes.json
 *
 * Klient potom načte přes import a rozhodne, jak obrázek prezentovat:
 *   - small (<250 px)   → float v textu, žádný lightbox
 *   - medium (250-599)  → standalone, žádný lightbox
 *   - large (>=600 px)  → standalone, lightbox při kliknutí
 */
import { readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const PUBLIC_IMG = join(ROOT, 'apps', 'hodinarium-eu', 'public', 'img');
const OUT = join(ROOT, 'apps', 'hodinarium-eu', 'src', 'data', 'image-sizes.json');

interface ImageSize {
  w: number;
  h: number;
  /** kategorie: small / medium / large / tall (úzký vysoký = portrétní velký obrázek, který by jako "large" zabral nepříjemně mnoho místa) */
  size: 'small' | 'medium' | 'large' | 'tall';
}

async function walk(dir: string, base = dir): Promise<string[]> {
  const result: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...(await walk(full, base)));
    } else if (/\.(jpe?g|png|gif|webp)$/i.test(entry.name)) {
      result.push('/' + full.slice(base.length - 'img'.length).replace(/^\/+/, ''));
    }
  }
  return result;
}

function classify(w: number, h: number): ImageSize['size'] {
  const max = Math.max(w, h);
  if (max < 250) return 'small';
  if (max < 600) return 'medium';
  // Úzký vysoký (portrét) by jako "large" zabral celou stránku na výšku — float jako medium.
  if (h >= 600 && w < 400 && h / w > 1.8) return 'tall';
  return 'large';
}

function sipsDimensions(absPath: string): { w: number; h: number } | null {
  try {
    const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', absPath], {
      encoding: 'utf-8',
      timeout: 5000,
    });
    let w = 0, h = 0;
    for (const line of out.split('\n')) {
      const m = line.trim();
      if (m.startsWith('pixelWidth:')) w = parseInt(m.split(':')[1].trim(), 10);
      if (m.startsWith('pixelHeight:')) h = parseInt(m.split(':')[1].trim(), 10);
    }
    return w && h ? { w, h } : null;
  } catch {
    return null;
  }
}

async function main() {
  if (!existsSync(PUBLIC_IMG)) {
    console.error(`Adresář ${PUBLIC_IMG} neexistuje.`);
    process.exit(1);
  }

  const files = await walk(PUBLIC_IMG);
  console.log(`Skenuji ${files.length} obrázků…`);

  const index: Record<string, ImageSize> = {};
  let small = 0, medium = 0, large = 0, tall = 0, skipped = 0;

  for (const rel of files) {
    const abs = join(ROOT, 'apps', 'hodinarium-eu', 'public', rel);
    const dim = sipsDimensions(abs);
    if (!dim) {
      skipped++;
      continue;
    }
    const size = classify(dim.w, dim.h);
    index[rel] = { ...dim, size };
    if (size === 'small') small++;
    else if (size === 'medium') medium++;
    else if (size === 'tall') tall++;
    else large++;
  }

  await writeFile(OUT, JSON.stringify(index, null, 0), 'utf-8');

  console.log(`\n=== Hotovo ===`);
  console.log(`Index obrázků: ${OUT}`);
  console.log(`Velikost JSON: ${(JSON.stringify(index).length / 1024).toFixed(1)} KB`);
  console.log(`\nKlasifikace:`);
  console.log(`  small  (<250 px):     ${small}`);
  console.log(`  medium (250-599):     ${medium}`);
  console.log(`  large  (>=600 px):    ${large}`);
  console.log(`  tall   (úzký vysoký): ${tall}`);
  console.log(`  přeskočeno:           ${skipped}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
