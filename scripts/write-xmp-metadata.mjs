#!/usr/bin/env node
/**
 * Zapíše XMP metadata (XMP-dc:Creator, XMP-dc:Rights, XMP-dc:Source,
 * XMP-dc:Subject) do binárních JPG souborů v apps/{hodinarium-eu,horologie-cz}/public/img/.
 *
 * Zdroj credit dat:
 *   1) `::photo{src="..." author="..." license="..." sourceUrl="..."}`
 *      direktivy v content/{hodinarium-eu,horologie-cz}/*.{md,mdx}
 *      (per-image, nejpřesnější — má prioritu).
 *   2) Per-article fallback z frontmatteru:
 *      - `author` field → Creator
 *      - `originalUrl` (npu.cz, commons.wikimedia.org, …) odvozuje
 *        Rights heuristikou
 *      - `originalUrl` → Source
 *      - `title` → Subject
 *   3) Default fallback: Creator="Archiv ČSH", Rights="autor neznámý".
 *
 * Idempotence:
 *   - Pro každý JPG zkontrolujeme přes `exiftool` současné XMP-dc:Creator.
 *   - Pokud je nastaveno (ne prázdné), skip — respektujeme hand-edited credit.
 *   - Nikdy nepřepíšeme existující hodnotu.
 *
 * Použití:
 *   pnpm xmp:write                          # všechny apps
 *   node scripts/write-xmp-metadata.mjs --apps hodinarium-eu
 *   node scripts/write-xmp-metadata.mjs --dry-run
 *   node scripts/write-xmp-metadata.mjs --limit 50    # první 50 souborů (debug)
 *   node scripts/write-xmp-metadata.mjs --force       # přepiš i existující XMP
 *
 * Závislosti:
 *   - exiftool (Homebrew: `brew install exiftool`)
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile as execFileCb, spawn } from 'node:child_process';
import { promisify } from 'node:util';

const execFile = promisify(execFileCb);
const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..');

// --- CLI args ---
const ALL_APPS = ['hodinarium-eu', 'horologie-cz'];
const appsArgIdx = process.argv.indexOf('--apps');
const APPS = appsArgIdx >= 0 && process.argv[appsArgIdx + 1]
  ? process.argv[appsArgIdx + 1].split(',').map((s) => s.trim()).filter(Boolean)
  : ALL_APPS;
const DRY_RUN = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');
const limitIdx = process.argv.indexOf('--limit');
const LIMIT = limitIdx >= 0 && process.argv[limitIdx + 1]
  ? parseInt(process.argv[limitIdx + 1], 10)
  : Infinity;

// --- Pre-flight ---
try {
  await execFile('exiftool', ['-ver']);
} catch {
  console.error('✗ Chybí `exiftool`. Nainstaluj: brew install exiftool');
  process.exit(1);
}

// --- Heuristika rights z originalUrl ---
function deriveRights(originalUrl, author) {
  if (!originalUrl) {
    if (author && author !== 'Archiv ČSH') return 'autor uveden, licence neuvedena';
    return 'autor neznámý';
  }
  const u = originalUrl.toLowerCase();
  // NPÚ MIS
  if (u.includes('iispp.npu.cz') || u.includes('npu.cz/mis')) {
    return 'CC BY-NC-ND 3.0 CZ — NPÚ MIS';
  }
  // Wikimedia Commons — licence per file, default-em označíme CC BY-SA 4.0,
  // ale `::photo` direktiva s explicitní `license=` má vždy přednost.
  if (u.includes('commons.wikimedia.org') || u.includes('upload.wikimedia.org')) {
    return 'CC BY-SA 4.0 (Wikimedia Commons — ověř per-file licenci)';
  }
  // Hodinarium.eu / horologie.cz spolkový obsah
  if (u.includes('hodinarium.eu') || u.includes('horologie.cz') || u.includes('orloj.eu')) {
    return 'Archiv ČSH, použito s povolením';
  }
  return 'autor neznámý';
}

// --- Parser frontmatter (jen základ — nepotřebujeme plný YAML) ---
function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const fm = {};
  const lines = m[1].split(/\r?\n/);
  for (const line of lines) {
    // jen prosté `key: value` páry na top level
    const km = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/);
    if (!km) continue;
    let v = km[2].trim();
    // Strip surrounding quotes
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    fm[km[1]] = v;
  }
  return fm;
}

// --- Parser ::photo{...} direktiv ---
// Vrací mapu: src → { author, license, sourceUrl }
function parsePhotoDirectives(text) {
  const out = new Map();
  // remark-directive syntax: `::photo{attr=value attr="value with space" ...}`
  const re = /::photo\{([^}]*)\}/g;
  let m;
  while ((m = re.exec(text))) {
    const attrs = parseAttrs(m[1]);
    if (!attrs.src) continue;
    out.set(attrs.src, attrs);
  }
  return out;
}

function parseAttrs(s) {
  const out = {};
  // attr="value" | attr='value' | attr=value
  const re = /([a-zA-Z_][\w-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g;
  let m;
  while ((m = re.exec(s))) {
    out[m[1]] = m[2] ?? m[3] ?? m[4] ?? '';
  }
  return out;
}

// --- Strip Markdown wrapping z author hodnoty ---
// `author="[Petr Skála](/hodinari/petr-skala)"` → `Petr Skála`
function cleanAuthor(s) {
  if (!s) return s;
  const md = s.match(/^\[([^\]]+)\]\([^)]*\)$/);
  return md ? md[1] : s;
}

// --- Build credit index z content/*.{md,mdx} ---
async function buildCreditIndex(contentDir) {
  /**
   * imageCredits: Map<imgPath, {
   *   author, license, sourceUrl, articleSlug, articleTitle, source: 'photo-directive' | 'frontmatter'
   * }>
   */
  const imageCredits = new Map();
  const articleFallback = new Map(); // slug → { author, originalUrl, title }

  let files;
  try {
    files = (await readdir(contentDir)).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
  } catch {
    return imageCredits;
  }

  for (const file of files) {
    const abs = join(contentDir, file);
    let text;
    try {
      text = await readFile(abs, 'utf-8');
    } catch {
      continue;
    }
    const fm = parseFrontmatter(text);
    const slug = fm.slug || file.replace(/\.(md|mdx)$/, '');
    const title = fm.title || slug;
    const author = fm.author || '';
    const originalUrl = fm.originalUrl || '';
    articleFallback.set(slug, { author, originalUrl, title });

    // ::photo{} direktivy — per-image override
    const photoMap = parsePhotoDirectives(text);
    for (const [src, attrs] of photoMap) {
      imageCredits.set(src, {
        author: cleanAuthor(attrs.author) || author || 'Archiv ČSH',
        license: attrs.license || deriveRights(attrs.sourceUrl || originalUrl, attrs.author || author),
        sourceUrl: attrs.sourceUrl || originalUrl,
        articleTitle: title,
        articleSlug: slug,
        source: 'photo-directive',
      });
    }

    // Plain markdown `![alt](/img/path.jpg)` — fallback na frontmatter credit
    const mdImg = /!\[([^\]]*)\]\((\/img\/[^)\s]+)/g;
    let m;
    while ((m = mdImg.exec(text))) {
      const src = m[2];
      // Frontmatter override už existuje (z ::photo) — neztrácíme přesnější data
      if (imageCredits.has(src)) continue;
      imageCredits.set(src, {
        author: cleanAuthor(author) || 'Archiv ČSH',
        license: deriveRights(originalUrl, author),
        sourceUrl: originalUrl,
        articleTitle: title,
        articleSlug: slug,
        source: 'frontmatter',
      });
    }
  }
  return imageCredits;
}

// --- exiftool helpers ---
async function readExistingXmp(file) {
  try {
    const { stdout } = await execFile('exiftool', [
      '-XMP-dc:Creator', '-XMP-dc:Rights', '-XMP-dc:Source', '-XMP-dc:Subject',
      '-s', '-s', '-s', // suppress tag names, just values
      file,
    ]);
    return stdout.trim();
  } catch {
    return '';
  }
}

async function writeXmp(file, credit) {
  const args = [
    '-overwrite_original',
    '-codedcharacterset=utf8',
    `-XMP-dc:Creator=${credit.author}`,
    `-XMP-dc:Rights=${credit.license}`,
    `-XMP-dc:Subject=${credit.articleTitle}`,
  ];
  if (credit.sourceUrl) args.push(`-XMP-dc:Source=${credit.sourceUrl}`);
  args.push(file);
  await execFile('exiftool', args);
}

// --- Walk file tree ---
async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.isFile()) yield p;
  }
}

const JPG_EXT = new Set(['.jpg', '.jpeg', '.JPG', '.JPEG']);

const stats = {
  scanned: 0, written: 0, skipped: 0, noCredit: 0, failed: 0,
};
const failures = [];

async function processOne(file, app, imageCredits) {
  const ext = extname(file);
  if (!JPG_EXT.has(ext)) return;
  stats.scanned++;
  if (stats.scanned > LIMIT) return;

  const relPath = '/' + relative(join(ROOT, 'apps', app, 'public'), file).replace(/\\/g, '/');
  const credit = imageCredits.get(relPath);

  // Idempotence: pokud už XMP existuje, skip (pokud --force).
  if (!FORCE) {
    const existing = await readExistingXmp(file);
    if (existing && existing.length > 0) {
      stats.skipped++;
      return;
    }
  }

  const effectiveCredit = credit ?? {
    author: 'Archiv ČSH',
    license: 'autor neznámý',
    sourceUrl: '',
    articleTitle: '',
    articleSlug: '',
    source: 'default',
  };
  if (!credit) stats.noCredit++;

  if (DRY_RUN) {
    stats.written++;
    if (stats.scanned <= 10) {
      console.log(`  [dry] ${relPath} ← ${effectiveCredit.author} / ${effectiveCredit.license}`);
    }
    return;
  }

  try {
    await writeXmp(file, effectiveCredit);
    stats.written++;
  } catch (e) {
    stats.failed++;
    failures.push({ file: relPath, error: e.message });
    if (failures.length <= 5) console.error(`  ✗ ${relPath}: ${e.message}`);
  }
}

// Concurrency — exiftool je single-threaded per invocation, ale můžeme
// pustit více souběžných instancí. 8 paralelně je rozumný balanc CPU vs RAM.
const concIdx = process.argv.indexOf('--concurrency');
const CONCURRENCY = concIdx >= 0 && process.argv[concIdx + 1]
  ? Math.max(1, parseInt(process.argv[concIdx + 1], 10))
  : 8;

const startedAt = Date.now();
const progressTimer = setInterval(() => {
  const elapsedS = ((Date.now() - startedAt) / 1000).toFixed(0);
  process.stdout.write(`  [${elapsedS}s] scanned ${stats.scanned}, written ${stats.written}, skipped ${stats.skipped} (already had XMP), no-credit ${stats.noCredit}, failed ${stats.failed}\n`);
}, 5000);

for (const app of APPS) {
  const contentDir = join(ROOT, 'content', app);
  console.log(`\n=== ${app} ===`);
  console.log(`▸ Building credit index from ${relative(ROOT, contentDir)}…`);
  const imageCredits = await buildCreditIndex(contentDir);
  const photoDirectiveCount = [...imageCredits.values()].filter((c) => c.source === 'photo-directive').length;
  const frontmatterCount = [...imageCredits.values()].filter((c) => c.source === 'frontmatter').length;
  console.log(`  ${imageCredits.size} credit entries (${photoDirectiveCount} z ::photo direktiv, ${frontmatterCount} z frontmatter fallback)`);

  const publicImg = join(ROOT, 'apps', app, 'public', 'img');
  if (!existsSync(publicImg)) {
    console.log(`  ⚠ ${relative(ROOT, publicImg)} neexistuje, skip.`);
    continue;
  }

  console.log(`▸ Walking ${relative(ROOT, publicImg)}…`);
  const files = [];
  for await (const f of walk(publicImg)) {
    if (JPG_EXT.has(extname(f))) files.push(f);
  }
  console.log(`  ${files.length} JPG souborů k zpracování (concurrency ${CONCURRENCY})`);

  let idx = 0;
  async function worker() {
    while (idx < files.length && stats.scanned < LIMIT) {
      const my = idx++;
      await processOne(files[my], app, imageCredits);
    }
  }
  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);
}

clearInterval(progressTimer);

const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
console.log(`\n=== Hotovo za ${elapsed}s ===`);
console.log(`Scanováno:                  ${stats.scanned}`);
console.log(`XMP zapsáno:                ${stats.written}${DRY_RUN ? ' (dry-run)' : ''}`);
console.log(`Skipnuto (XMP už existoval): ${stats.skipped}`);
console.log(`Bez credit dat (default Archiv ČSH / autor neznámý): ${stats.noCredit}`);
if (stats.failed) {
  console.log(`Chyb:                       ${stats.failed}`);
  if (failures.length > 5) console.log(`  …a ${failures.length - 5} dalších (jen prvních 5 logováno).`);
}
