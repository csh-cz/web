/**
 * Pre-generuje AVIF a WebP varianty pro všechny rastrové obrázky
 * v public/img/ obou apps. Idempotentní — přeskakuje, pokud variant
 * existuje a je novější než zdroj.
 *
 * Spouštět buď ručně přes `pnpm imgvariants:build`, nebo přidat do
 * pipeline před `pnpm build` v Cloudflare Pages.
 *
 * Output:
 *   public/img/foo.jpg  → public/img/foo.avif + public/img/foo.webp
 *   public/img/bar.png  → public/img/bar.avif + public/img/bar.webp
 *
 * Skip: SVG (vektor), GIF (animace), už existující AVIF/WebP.
 */
import { readdir, stat } from 'node:fs/promises';
import { join, dirname, parse } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const ALL_APPS = ['hodinarium-eu', 'horologie-cz'];
// CLI: --apps hodinarium-eu  (nebo `--apps a,b`); default = obě.
const appsArgIdx = process.argv.indexOf('--apps');
const APPS = appsArgIdx >= 0 && process.argv[appsArgIdx + 1]
  ? process.argv[appsArgIdx + 1].split(',').map((s) => s.trim()).filter(Boolean)
  : ALL_APPS;
const RASTER_EXTS = new Set(['.jpg', '.jpeg', '.png']); // GIF skip — animace
const SKIP_NAMES = new Set(['nadpis_hodinarium1.gif']); // ikony, sprite atd.

interface Stats {
  scanned: number;
  generated: number;
  skipped: number;
  failed: number;
}

async function* walk(dir: string): AsyncGenerator<string> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      yield* walk(p);
    } else if (e.isFile()) {
      yield p;
    }
  }
}

async function shouldRegenerate(target: string, sourceMtime: Date): Promise<boolean> {
  try {
    const s = await stat(target);
    return s.mtime < sourceMtime;
  } catch {
    return true; // missing → generate
  }
}

async function processFile(file: string, stats: Stats): Promise<void> {
  const ext = parse(file).ext.toLowerCase();
  if (!RASTER_EXTS.has(ext)) return;
  if (SKIP_NAMES.has(parse(file).base)) return;

  stats.scanned++;
  const baseFile = file.slice(0, file.length - ext.length);
  const avifFile = `${baseFile}.avif`;
  const webpFile = `${baseFile}.webp`;

  let sourceMtime: Date;
  try {
    sourceMtime = (await stat(file)).mtime;
  } catch {
    return;
  }

  const targets: Array<{ path: string; fmt: 'avif' | 'webp' }> = [
    { path: avifFile, fmt: 'avif' },
    { path: webpFile, fmt: 'webp' },
  ];

  for (const t of targets) {
    if (!(await shouldRegenerate(t.path, sourceMtime))) {
      stats.skipped++;
      continue;
    }
    try {
      const img = sharp(file, { failOn: 'truncated' });
      if (t.fmt === 'avif') {
        // q60 + effort 4 → solidní kompromis (effort 9 by byl 5× pomalejší)
        await img.avif({ quality: 60, effort: 4 }).toFile(t.path);
      } else {
        await img.webp({ quality: 80 }).toFile(t.path);
      }
      stats.generated++;
    } catch (e) {
      stats.failed++;
      const rel = file.replace(`${ROOT}/`, '');
      console.error(`✗ ${rel} → ${t.fmt}: ${(e as Error).message}`);
    }
  }
}

async function main() {
  const stats: Stats = { scanned: 0, generated: 0, skipped: 0, failed: 0 };
  const startedAt = Date.now();

  for (const app of APPS) {
    const root = join(ROOT, 'apps', app, 'public', 'img');
    console.log(`\n=== ${app} ===`);
    let count = 0;
    for await (const file of walk(root)) {
      await processFile(file, stats);
      count++;
      if (count % 200 === 0) {
        process.stdout.write(`  [${count}] generated ${stats.generated}, skipped ${stats.skipped}, failed ${stats.failed}\n`);
      }
    }
    console.log(`  scanned ${count} files`);
  }

  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log(`\n=== Hotovo za ${elapsed}s ===`);
  console.log(`Rastrových obrázků:   ${stats.scanned}`);
  console.log(`Variant vygenerováno: ${stats.generated}`);
  console.log(`Variant přeskočeno:   ${stats.skipped} (existuje a je novější než zdroj)`);
  if (stats.failed) console.log(`Chyb:                 ${stats.failed}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
