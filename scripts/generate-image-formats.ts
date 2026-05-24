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

// SKIP_IMG_GEN=1 — bypass úplně (CI validation, ne deploy build).
// Sharp processing 2700+ obrázků trvá ~10 min na GH Actions cold cache;
// pro D2 content-validate workflow nepotřebné — varianty jsou cached
// v repo a CF Pages je nepotřebuje regenerovat při každém content pushi.
// Plný regen běží přes imgvariants-r2-sync.yml workflow.
if (process.env.SKIP_IMG_GEN === '1' || process.env.SKIP_IMG_GEN === 'true') {
  console.log('[imgvariants] SKIP_IMG_GEN=1 — image variant generation skipped');
  process.exit(0);
}

const ALL_APPS = ['hodinarium-eu', 'horologie-cz'];
// CLI: --apps hodinarium-eu  (nebo `--apps a,b`); default = obě.
const appsArgIdx = process.argv.indexOf('--apps');
const APPS = appsArgIdx >= 0 && process.argv[appsArgIdx + 1]
  ? process.argv[appsArgIdx + 1].split(',').map((s) => s.trim()).filter(Boolean)
  : ALL_APPS;
// CLI: --files <path1>,<path2>,...  (paths repo-relativní k root nebo absolutní).
// Když nastaveno, procesujeme JEN tyto soubory (skip walk). Užitečné v CI,
// kde chceme regenerovat varianty jen pro soubory změněné v pushi
// (`git diff --name-only HEAD^ HEAD`), ne plný regen 5756 souborů.
const filesArgIdx = process.argv.indexOf('--files');
const FILES_OVERRIDE: string[] | null = filesArgIdx >= 0 && process.argv[filesArgIdx + 1]
  ? process.argv[filesArgIdx + 1].split(',').map((s) => s.trim()).filter(Boolean)
  : null;
const RASTER_EXTS = new Set(['.jpg', '.jpeg', '.png']); // GIF skip — animace
const SKIP_NAMES = new Set(['nadpis_hodinarium1.gif']); // ikony, sprite atd.

// A.34 — multi-width responsive varianty. Pro zdroje aspoň SRCSET_MIN_SOURCE_WIDTH
// široké vygenerujeme zmenšené `{base}-{w}w.avif/webp` pro každý breakpoint
// MENŠÍ než šířka zdroje (skip upscale). Plné-res `{base}.avif/webp` zůstává jako
// největší fallback. Render (rehype-picture + Photo.astro) MUSÍ použít stejné
// pravidlo (breakpoint < zdrojová šířka z image-sizes.json), jinak by srcset
// odkazoval na neexistující soubor → 404.
const SRCSET_BREAKPOINTS = [480, 1024, 1920];
const SRCSET_MIN_SOURCE_WIDTH = 1024;

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

  // A.34 — multi-width varianty pro dost velké zdroje.
  let srcWidth = 0;
  try {
    srcWidth = (await sharp(file).metadata()).width ?? 0;
  } catch {
    srcWidth = 0;
  }
  if (srcWidth >= SRCSET_MIN_SOURCE_WIDTH) {
    for (const bp of SRCSET_BREAKPOINTS) {
      if (bp >= srcWidth) continue; // skip upscale — plné-res pokrývá ≥ srcWidth
      for (const fmt of ['avif', 'webp'] as const) {
        const target = `${baseFile}-${bp}w.${fmt}`;
        if (!(await shouldRegenerate(target, sourceMtime))) {
          stats.skipped++;
          continue;
        }
        try {
          const img = sharp(file, { failOn: 'truncated' }).resize({ width: bp, withoutEnlargement: true });
          if (fmt === 'avif') {
            await img.avif({ quality: 60, effort: 4 }).toFile(target);
          } else {
            await img.webp({ quality: 80 }).toFile(target);
          }
          stats.generated++;
        } catch (e) {
          stats.failed++;
          const rel = file.replace(`${ROOT}/`, '');
          console.error(`✗ ${rel} → ${bp}w ${fmt}: ${(e as Error).message}`);
        }
      }
    }
  }
}

async function main() {
  // Cloudflare Pages free tier má 20min build limit. Plný regen pro
  // ~7000 obrázků trvá 30+ min a build padá na timeout. Generujeme
  // tedy lokálně (commit varianty do gitu nebo do R2) a v CF Pages
  // přeskakujeme. Override: SKIP_IMAGE_VARIANTS=0.
  if (
    process.env.SKIP_IMAGE_VARIANTS !== '0' &&
    (process.env.CF_PAGES === '1' || process.env.SKIP_IMAGE_VARIANTS === '1')
  ) {
    console.log('CF Pages / SKIP_IMAGE_VARIANTS detected — skipping AVIF/WebP generation.');
    console.log('(Generuj varianty lokálně přes `pnpm imgvariants:build` a commit do gitu.)');
    return;
  }

  const stats: Stats = { scanned: 0, generated: 0, skipped: 0, failed: 0 };
  const startedAt = Date.now();

  if (FILES_OVERRIDE) {
    console.log(`\n=== --files mode: ${FILES_OVERRIDE.length} cílový soubor(ů) ===`);
    for (const rel of FILES_OVERRIDE) {
      const abs = rel.startsWith('/') ? rel : join(ROOT, rel);
      await processFile(abs, stats);
    }
  } else {
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
