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
// --files a/b/c — zpracuj jen tyto soubory (CI diff-mode nebo cílený test).
// Položka matchuje, pokud je substringem cesty souboru (relPath i app path).
const filesArgIdx = process.argv.indexOf('--files');
const ONLY_FILES = filesArgIdx >= 0 && process.argv[filesArgIdx + 1]
  ? process.argv[filesArgIdx + 1].split(',').map((s) => s.trim()).filter(Boolean)
  : null;

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

// --- Licenční konstanty + resolver (pravidlo: skill obrazky §6.1/§6.1.1) ---
const SITE_DEFAULT_LABEL = 'CC BY 4.0';
const SITE_DEFAULT_URL = 'https://creativecommons.org/licenses/by/4.0/';
const SPOLEK = 'Český spolek horologický z. s.';
const SPOLEK_URL = 'https://hodinarium.eu';
const OWN_DOMAIN_RE = /(?:hodinarium\.(?:eu|cz)|horologie\.cz|orloj\.eu)/i;

// Vytáhne čistý CC label ze stringu („…CC BY-SA 4.0 (Wikimedia…)" → „CC BY-SA 4.0")
function extractCcLabel(text) {
  if (!text) return null;
  if (/CC0/i.test(text)) return 'CC0 1.0';
  const m = text.match(/CC\s+(BY(?:-(?:SA|NC|ND|NC-SA|NC-ND))?)\s+(\d\.\d)(\s*CZ)?/i);
  if (!m) return null;
  return `CC ${m[1].toUpperCase()} ${m[2]}${m[3] ? ' CZ' : ''}`;
}
// CC label → deed URL (generický, zvládne libovolnou verzi/jurisdikci)
function ccLabelToUrl(label) {
  if (!label) return null;
  if (/CC0/i.test(label)) return 'https://creativecommons.org/publicdomain/zero/1.0/';
  const m = label.match(/CC\s+(BY(?:-(?:SA|NC|ND|NC-SA|NC-ND))?)\s+(\d\.\d)(\s*CZ)?/i);
  if (!m) return null;
  const variant = m[1].toLowerCase();
  const ver = m[2];
  const juris = m[3] ? 'cz/' : '';
  return `https://creativecommons.org/licenses/${variant}/${ver}/${juris}`;
}

/**
 * Z credit objektu sestaví PLNÝ set exiftool tagů (XMP + IPTC) podle pravidla:
 *   1) explicitní CC licence (::photo license= nebo derived Wiki/NPÚ) → ta licence
 *   2) externí zdroj bez CC licence → „se svolením" (NEclaimovat CC)
 *   3) jinak (originál / vlastní obsah) → site default CC BY 4.0
 * Vrací { args, kind }.
 */
function licenseFields(credit) {
  const author = cleanAuthor(credit.author || '').trim();
  const args = [];
  const push = (k, v) => { if (v) args.push(`-${k}=${v}`); };
  const ccLabel = extractCcLabel(credit.license);
  const sourceExternal = credit.sourceUrl && !OWN_DOMAIN_RE.test(credit.sourceUrl);
  let kind;

  if (ccLabel) {
    // (1) explicitní CC licence
    const url = credit.licenseUrl || ccLabelToUrl(ccLabel);
    kind = `licence:${ccLabel}`;
    push('XMP-dc:Creator', author);
    push('IPTC:By-line', author);
    push('XMP-xmpRights:Marked', 'True');
    push('XMP-xmpRights:UsageTerms', url ? `${ccLabel}. ${url}` : ccLabel);
    push('XMP-xmpRights:WebStatement', url);
    push('XMP-cc:license', url);
    push('XMP-cc:attributionName', author || credit.sourceUrl);
    push('XMP-cc:attributionURL', credit.sourceUrl || SPOLEK_URL);
    push('XMP-dc:Rights', `© ${author || 'autor neznámý'}. ${ccLabel}.`);
    push('IPTC:CopyrightNotice', `© ${author || 'autor neznámý'}. ${ccLabel}.`);
    push('XMP-dc:Source', credit.sourceUrl);
  } else if (sourceExternal) {
    // (2) externí, bez CC → se svolením, all rights reserved
    kind = 'se-svolením';
    push('XMP-dc:Creator', author);
    push('IPTC:By-line', author);
    push('XMP-xmpRights:Marked', 'True');
    push('XMP-xmpRights:UsageTerms', 'Used with permission. All rights reserved by the author.');
    push('XMP-dc:Rights', `© ${author || 'autor neznámý'}. Použito se svolením / Used with permission.`);
    push('IPTC:CopyrightNotice', `© ${author || 'autor neznámý'}. Used with permission.`);
    push('XMP-dc:Source', credit.sourceUrl);
  } else {
    // (3) originál / vlastní obsah → site default CC BY 4.0
    kind = `default:${SITE_DEFAULT_LABEL}`;
    const who = author || SPOLEK;
    const rights = `© ${who} / ${SPOLEK} — ${SITE_DEFAULT_LABEL}`;
    push('XMP-dc:Creator', who);
    push('IPTC:By-line', who);
    push('XMP-xmpRights:Marked', 'True');
    push('XMP-xmpRights:UsageTerms', `This work is licensed under the Creative Commons Attribution 4.0 International License (${SITE_DEFAULT_LABEL}). ${SITE_DEFAULT_URL}`);
    push('XMP-xmpRights:WebStatement', SITE_DEFAULT_URL);
    push('XMP-cc:license', SITE_DEFAULT_URL);
    push('XMP-cc:attributionName', who);
    push('XMP-cc:attributionURL', SPOLEK_URL);
    push('XMP-dc:Rights', rights);
    push('IPTC:CopyrightNotice', rights);
    push('IPTC:Credit', SPOLEK);
    push('XMP-dc:Source', credit.sourceUrl || SPOLEK_URL);
  }
  if (credit.articleTitle) push('XMP-dc:Subject', credit.articleTitle);
  return { args, kind };
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

// --- Heuristika autora z názvu souboru: `… (foto Skála).jpg` → „Petr Skála" ---
// Memory reference_csh_fotografi.md: detekce z `(foto X)` patternu + NFD-fold
// (jinak `marušák` po toLowerCase nematchuje `marusak`). Vyžaduje token `foto`
// v názvu, aby místní názvy (Skalná, Kralupy…) nedělaly false-positive.
const FILENAME_PHOTOGRAPHERS = [
  [/\bskala\b/, 'Petr Skála'],
  [/\bmarusak\b/, 'S. Marušák'],
  [/\bmarek\b/, 'Marek'],
  [/\bkral\b/, 'P. Král'],
  [/\bctiborova\b/, 'M. Ctiborová'],
];
function authorFromFilename(file) {
  const base = file.split('/').pop() || '';
  const ascii = base.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  if (!/foto/.test(ascii)) return null; // jen záměrný credit marker
  for (const [re, name] of FILENAME_PHOTOGRAPHERS) if (re.test(ascii)) return name;
  return null;
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

  // Rekurzivně přes CELÉ content/ — ne jen content/<app>/. ::photo a foto[]
  // žijí i v content/hodinari, /soupis-veznich-hodin, /kronika atd.; bez
  // rekurze by ty obrázky spadly na default místo svého reálného creditu.
  const files = [];
  try {
    for await (const f of walk(contentDir)) {
      if (f.endsWith('.md') || f.endsWith('.mdx')) files.push(f);
    }
  } catch {
    return imageCredits;
  }

  for (const abs of files) {
    let text;
    try {
      text = await readFile(abs, 'utf-8');
    } catch {
      continue;
    }
    const fm = parseFrontmatter(text);
    const slug = fm.slug || (abs.split('/').pop() || '').replace(/\.(md|mdx)$/, '');
    const title = fm.title || slug;
    const author = fm.author || '';
    const originalUrl = fm.originalUrl || '';
    articleFallback.set(slug, { author, originalUrl, title });

    // ::photo{} direktivy — per-image override
    const photoMap = parsePhotoDirectives(text);
    for (const [src, attrs] of photoMap) {
      imageCredits.set(src, {
        author: cleanAuthor(attrs.author) || author || 'Archiv ČSH',
        authorUrl: attrs.authorUrl || '',
        authorExplicit: Boolean(cleanAuthor(attrs.author)),
        license: attrs.license || deriveRights(attrs.sourceUrl || originalUrl, attrs.author || author),
        licenseUrl: attrs.licenseUrl || '',
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
        authorExplicit: false,
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

// Sourozenecké AVIF/WebP varianty (sharp je generuje BEZ metadat → embed i tam,
// jinak by R2 servíroval varianty bez licence).
function variantSiblings(file) {
  const base = file.slice(0, file.length - extname(file).length);
  return ['.avif', '.webp'].map((v) => base + v).filter((p) => existsSync(p));
}

async function writeXmp(file, credit) {
  const { args: tagArgs, kind } = licenseFields(credit);
  const baseArgs = ['-overwrite_original', '-charset', 'utf8', '-charset', 'iptc=utf8'];
  // Originál + obě varianty dostanou identickou licenci (self-describing soubor).
  for (const target of [file, ...variantSiblings(file)]) {
    await execFile('exiftool', [...baseArgs, ...tagArgs, target]);
  }
  return kind;
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
  scanned: 0, written: 0, skipped: 0, noCredit: 0, failed: 0, byKind: {},
};
const failures = [];

async function processOne(file, app, imageCredits) {
  const ext = extname(file);
  if (!JPG_EXT.has(ext)) return;

  const relPath = '/' + relative(join(ROOT, 'apps', app, 'public'), file).replace(/\\/g, '/');
  // --files filtr (CI diff-mode / cílený test): substring match proti cestě.
  if (ONLY_FILES && !ONLY_FILES.some((f) => relPath.includes(f) || file.includes(f))) return;

  stats.scanned++;
  if (stats.scanned > LIMIT) return;

  const credit = imageCredits.get(relPath);

  // Idempotence: pokud už XMP existuje, skip (pokud --force).
  if (!FORCE) {
    const existing = await readExistingXmp(file);
    if (existing && existing.length > 0) {
      stats.skipped++;
      return;
    }
  }

  const baseCredit = credit ?? {
    author: 'Archiv ČSH',
    license: 'autor neznámý',
    sourceUrl: '',
    articleTitle: '',
    articleSlug: '',
    source: 'default',
  };
  if (!credit) stats.noCredit++;

  // Heuristika autora (priorita): explicitní ::photo autor > `(foto X)` v názvu
  // souboru > článkový autor / Archiv ČSH. Filename detekce přebíjí jen
  // ne-explicitní (default/frontmatter) autora — nikdy explicitní ::photo.
  let effectiveCredit = baseCredit;
  if (!baseCredit.authorExplicit) {
    const fromName = authorFromFilename(file);
    if (fromName) {
      effectiveCredit = { ...baseCredit, author: fromName };
      stats.byFilenameAuthor = (stats.byFilenameAuthor || 0) + 1;
    }
  }

  if (DRY_RUN) {
    const { kind } = licenseFields(effectiveCredit);
    stats.byKind[kind] = (stats.byKind[kind] || 0) + 1;
    stats.written++;
    if (stats.scanned <= 12) {
      console.log(`  [dry] ${relPath} ← [${kind}] author=${cleanAuthor(effectiveCredit.author)}`);
    }
    return;
  }

  try {
    const kind = await writeXmp(file, effectiveCredit);
    stats.byKind[kind] = (stats.byKind[kind] || 0) + 1;
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

// Jeden sdílený credit index z CELÉHO content/ (klíče /img/ jsou sdílené
// napříč apps i kolekcemi). Recursive → pokryje hodinarium-eu, horologie-cz,
// hodinari, soupis-veznich-hodin, kronika, slovnik, kroky…
console.log(`▸ Building credit index from ${relative(ROOT, join(ROOT, 'content'))}/ (recursive)…`);
const imageCredits = await buildCreditIndex(join(ROOT, 'content'));
{
  const photoDirectiveCount = [...imageCredits.values()].filter((c) => c.source === 'photo-directive').length;
  const frontmatterCount = [...imageCredits.values()].filter((c) => c.source === 'frontmatter').length;
  console.log(`  ${imageCredits.size} credit entries (${photoDirectiveCount} z ::photo direktiv, ${frontmatterCount} z frontmatter/markdown fallback)`);
}

for (const app of APPS) {
  console.log(`\n=== ${app} ===`);
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
console.log(`Bez explicitního credit dat (→ default CC BY 4.0 / ČSH): ${stats.noCredit}`);
console.log(`Podle typu licence:         ${JSON.stringify(stats.byKind)}`);
console.log(`Autor z názvu (foto X):     ${stats.byFilenameAuthor || 0}`);
if (stats.failed) {
  console.log(`Chyb:                       ${stats.failed}`);
  if (failures.length > 5) console.log(`  …a ${failures.length - 5} dalších (jen prvních 5 logováno).`);
}
