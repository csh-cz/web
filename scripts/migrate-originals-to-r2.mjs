#!/usr/bin/env node
/**
 * Bulk migrace ~3 000 originálních JPG z apps/{hodinarium-eu,horologie-cz}/public/img/
 * do Cloudflare R2 bucketu `csh-imgvariants` (single-bucket strategie, viz TODO A.26).
 *
 * Rozdíl oproti `upload-imgvariants-to-r2.mjs`:
 *   1) Tento skript zapisuje navíc **R2 custom-metadata headers**:
 *        x-amz-meta-creator   = autor (z ::photo direktivy / frontmatter / default)
 *        x-amz-meta-license   = licence (CC BY-SA / CC BY-NC-ND / "Archiv ČSH" / …)
 *        x-amz-meta-source    = source URL (sourceUrl z ::photo nebo originalUrl)
 *        x-amz-meta-article   = slug článku
 *        x-amz-meta-md5       = hex MD5 lokálního souboru (debug verify)
 *      Custom metadata umožňují rychlý lookup credit dat bez stahování binárky.
 *   2) Pre-flight (volitelně): zavolá `write-xmp-metadata.mjs` aby byl
 *      XMP zapsán do binárky PŘED uploadem na R2. Bez `--skip-xmp` projde
 *      celý XMP pipeline jako součást upload.
 *   3) Plný regen — projde všechny JPG, ne jen diff vs HEAD^.
 *
 * Idempotence:
 *   - List ETagů z R2 (MD5 hash).
 *   - Per soubor: lokální MD5 == R2 ETag? Pokud ano, ověř custom-metadata
 *     match (HeadObject). Pokud metadata také match, skip; jinak reupload
 *     (PUT s aktualizovaným metadata — R2 PUT je atomický).
 *
 * Použití:
 *   pnpm migrate:originals                    # vše, sériový XMP pre-flight, paralelní upload
 *   node scripts/migrate-originals-to-r2.mjs --apps hodinarium-eu
 *   node scripts/migrate-originals-to-r2.mjs --dry-run
 *   node scripts/migrate-originals-to-r2.mjs --skip-xmp           # XMP pre-flight přeskoč
 *   node scripts/migrate-originals-to-r2.mjs --limit 50           # první 50 (debug)
 *   node scripts/migrate-originals-to-r2.mjs --concurrency 32     # default 16
 *
 * Credentials se čtou z .dev.vars (gitignored) nebo z env:
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
 *   R2_BUCKET (default: csh-imgvariants)
 *
 * Po dokončení (validation week, viz TODO A.26):
 *   - Až David schválí → samostatný commit `git rm -r apps/<app>/public/img/`.
 *     NEDĚLÁ tento skript.
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import { createReadStream, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile as execFileCb, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';

const execFile = promisify(execFileCb);
const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..');

// --- .dev.vars loader (sdílíme formát s upload-imgvariants-to-r2.mjs) ---
async function loadDevVarsAsync() {
  const file = join(ROOT, '.dev.vars');
  try {
    const txt = await readFile(file, 'utf-8');
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      if (process.env[m[1]] === undefined) {
        let v = m[2];
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
          v = v.slice(1, -1);
        }
        process.env[m[1]] = v;
      }
    }
  } catch { /* no .dev.vars, OK */ }
}

await loadDevVarsAsync();

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY = process.env.R2_ACCESS_KEY_ID;
const SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET = process.env.R2_BUCKET ?? 'csh-imgvariants';

// Sanity check — placeholder hodnoty z .dev.vars příkladu nejdou použít.
const isPlaceholder = (v) => !v || /^[<].*[>]$/.test(v.trim()) || v.startsWith('<') || v.length < 16;
if (isPlaceholder(SECRET_KEY) || isPlaceholder(ACCESS_KEY) || !ACCOUNT_ID) {
  console.error('✗ R2 credentials nejsou nastavené (vypadají jako placeholder).');
  console.error('  Vyžadováno: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY');
  console.error('  Nastav v .dev.vars (root repa) nebo jako env vars před spuštěním.');
  console.error('  GH Actions: secrets repository → settings → Actions.');
  process.exit(1);
}

// --- CLI args ---
const ALL_APPS = ['hodinarium-eu', 'horologie-cz'];
const appsArgIdx = process.argv.indexOf('--apps');
const APPS = appsArgIdx >= 0 && process.argv[appsArgIdx + 1]
  ? process.argv[appsArgIdx + 1].split(',').map((s) => s.trim()).filter(Boolean)
  : ALL_APPS;
const DRY_RUN = process.argv.includes('--dry-run');
const SKIP_XMP = process.argv.includes('--skip-xmp');
const limitIdx = process.argv.indexOf('--limit');
const LIMIT = limitIdx >= 0 && process.argv[limitIdx + 1]
  ? parseInt(process.argv[limitIdx + 1], 10)
  : Infinity;
const concIdx = process.argv.indexOf('--concurrency');
const CONCURRENCY = concIdx >= 0 && process.argv[concIdx + 1]
  ? Math.max(1, parseInt(process.argv[concIdx + 1], 10))
  : 16;

const JPG_EXT = new Set(['.jpg', '.jpeg', '.JPG', '.JPEG']);

// --- 0. XMP pre-flight (volitelně) ---
if (!SKIP_XMP && !DRY_RUN) {
  console.log('▸ XMP pre-flight: spouštím scripts/write-xmp-metadata.mjs…');
  console.log('  (skip přes --skip-xmp, pokud už byly XMP zapsané)\n');
  const xmpScript = join(ROOT, 'scripts', 'write-xmp-metadata.mjs');
  const xmpArgs = ['--apps', APPS.join(',')];
  if (LIMIT !== Infinity) xmpArgs.push('--limit', String(LIMIT));
  await new Promise((resolve, reject) => {
    const p = spawn('node', [xmpScript, ...xmpArgs], { stdio: 'inherit' });
    p.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`XMP writer exit ${code}`)));
  });
  console.log('');
}

// --- Re-use credit index pro R2 custom-metadata ---
// (Stejný parser jako write-xmp-metadata.mjs, copy-paste pro single-file
// distribuci. Pokud začnou divergovat, refaktoruj do _lib.mjs.)
function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const km = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/);
    if (!km) continue;
    let v = km[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    fm[km[1]] = v;
  }
  return fm;
}

function parseAttrs(s) {
  const out = {};
  const re = /([a-zA-Z_][\w-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g;
  let m;
  while ((m = re.exec(s))) {
    out[m[1]] = m[2] ?? m[3] ?? m[4] ?? '';
  }
  return out;
}

function cleanAuthor(s) {
  if (!s) return s;
  const md = s.match(/^\[([^\]]+)\]\([^)]*\)$/);
  return md ? md[1] : s;
}

function deriveRights(originalUrl, author) {
  if (!originalUrl) return author && author !== 'Archiv ČSH' ? 'autor uveden' : 'autor neznámý';
  const u = originalUrl.toLowerCase();
  if (u.includes('iispp.npu.cz') || u.includes('npu.cz/mis')) return 'CC BY-NC-ND 3.0 CZ — NPÚ MIS';
  if (u.includes('commons.wikimedia.org') || u.includes('upload.wikimedia.org')) return 'CC BY-SA 4.0 (Wikimedia)';
  if (u.includes('hodinarium.eu') || u.includes('horologie.cz') || u.includes('orloj.eu')) return 'Archiv ČSH, použito s povolením';
  return 'autor neznámý';
}

async function buildCreditIndex(contentDir) {
  const out = new Map();
  let files;
  try {
    files = (await readdir(contentDir)).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
  } catch {
    return out;
  }
  for (const file of files) {
    let text;
    try { text = await readFile(join(contentDir, file), 'utf-8'); } catch { continue; }
    const fm = parseFrontmatter(text);
    const slug = fm.slug || file.replace(/\.(md|mdx)$/, '');
    const title = fm.title || slug;
    const author = fm.author || '';
    const photoAuthor = cleanAuthor(fm.photoAuthor || '');
    const photoLicense = fm.photoLicense || '';
    const originalUrl = fm.originalUrl || '';

    // ::photo direktivy
    const reP = /::photo\{([^}]*)\}/g;
    let m;
    while ((m = reP.exec(text))) {
      const attrs = parseAttrs(m[1]);
      if (!attrs.src) continue;
      out.set(attrs.src, {
        author: cleanAuthor(attrs.author) || author || 'Archiv ČSH',
        license: attrs.license || deriveRights(attrs.sourceUrl || originalUrl, attrs.author || author),
        sourceUrl: attrs.sourceUrl || originalUrl,
        articleSlug: slug,
        articleTitle: title,
        source: 'photo-directive',
      });
    }

    // Plain markdown image
    const reI = /!\[([^\]]*)\]\((\/img\/[^)\s]+)/g;
    while ((m = reI.exec(text))) {
      const src = m[2];
      if (out.has(src)) continue;
      // Fotoreport (kronika): photoAuthor = fotograf, photoLicense = licence.
      out.set(src, {
        author: photoAuthor || cleanAuthor(author) || 'Archiv ČSH',
        license: photoLicense || deriveRights(originalUrl, author),
        sourceUrl: originalUrl,
        articleSlug: slug,
        articleTitle: title,
        source: photoAuthor ? 'frontmatter-photo' : 'frontmatter',
      });
    }
  }
  return out;
}

// --- S3 client ---
const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
});

// --- 1. List existujících R2 objektů (ETags) ---
console.log(`▸ Listing R2 bucket "${BUCKET}"…`);
const existing = new Map(); // key → etag
let token, pages = 0;
do {
  const res = await r2.send(new ListObjectsV2Command({
    Bucket: BUCKET,
    ContinuationToken: token,
  }));
  for (const obj of res.Contents ?? []) {
    const etag = (obj.ETag ?? '').replace(/^"|"$/g, '');
    existing.set(obj.Key, etag);
  }
  token = res.NextContinuationToken;
  pages++;
} while (token);
console.log(`  ${existing.size} existujících objektů (${pages} stránek)\n`);

// --- 2. MD5 helper ---
function md5File(p) {
  return new Promise((resolve, reject) => {
    const h = createHash('md5');
    const s = createReadStream(p);
    s.on('data', (c) => h.update(c));
    s.on('end', () => resolve(h.digest('hex')));
    s.on('error', reject);
  });
}

// --- 3. Walk + upload ---
async function* walk(dir) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.isFile()) yield p;
  }
}

// R2 custom-metadata: musí být ASCII (HTTP header limit). Pro UTF-8 autory
// (Øyvind Holmstad, Petr Skála) převedeme přes URI percent-encoding.
function encodeMetadataValue(s) {
  if (s === null || s === undefined) return '';
  // Zkrátit na 256 chars (R2 limit per metadata value cca 2 KB total, hraj
  // konzervativně). Encode přes encodeURIComponent zachová UTF-8 ASCII-safe.
  return encodeURIComponent(String(s)).slice(0, 256);
}

const stats = { scanned: 0, uploaded: 0, skippedMatch: 0, metadataUpdated: 0, noCredit: 0, failed: 0, bytes: 0 };
const failures = [];
const startedAt = Date.now();

async function uploadOne(file, app, imageCredits) {
  const ext = extname(file);
  if (!JPG_EXT.has(ext)) return;
  stats.scanned++;
  if (stats.scanned > LIMIT) return;

  const relPath = relative(join(ROOT, 'apps', app, 'public'), file).replace(/\\/g, '/');
  const key = relPath;

  let localEtag;
  try {
    localEtag = await md5File(file);
  } catch (e) {
    stats.failed++;
    failures.push({ key, error: `md5: ${e.message}` });
    return;
  }

  const credit = imageCredits.get('/' + relPath);
  if (!credit) stats.noCredit++;
  const effective = credit ?? {
    author: 'Archiv ČSH',
    license: 'autor neznámý',
    sourceUrl: '',
    articleSlug: '',
    articleTitle: '',
    source: 'default',
  };

  const metadata = {
    creator: encodeMetadataValue(effective.author),
    license: encodeMetadataValue(effective.license),
    source: encodeMetadataValue(effective.sourceUrl),
    article: encodeMetadataValue(effective.articleSlug),
    md5: localEtag,
  };

  // Idempotence — pokud ETag match, ověř metadata (HeadObject).
  if (existing.get(key) === localEtag) {
    if (DRY_RUN) {
      stats.skippedMatch++;
      return;
    }
    try {
      const head = await r2.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
      const remote = head.Metadata ?? {};
      const metadataMatches =
        remote.creator === metadata.creator &&
        remote.license === metadata.license &&
        remote.source === metadata.source &&
        remote.article === metadata.article;
      if (metadataMatches) {
        stats.skippedMatch++;
        return;
      }
      // Metadata mismatch — reupload (R2 nemá copy-object pro metadata patch
      // s zachovaným content; PUT s tělem je nejjednodušší).
    } catch (e) {
      // HeadObject selhal — fall-through k upload.
      failures.push({ key, error: `head: ${e.message}` });
    }
  }

  if (DRY_RUN) {
    stats.uploaded++;
    return;
  }

  try {
    const size = (await stat(file)).size;
    await r2.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: createReadStream(file),
      ContentType: 'image/jpeg',
      CacheControl: 'public, max-age=31536000, immutable',
      ContentLength: size,
      Metadata: metadata,
    }));
    if (existing.get(key) === localEtag) {
      stats.metadataUpdated++;
    } else {
      stats.uploaded++;
      stats.bytes += size;
    }
  } catch (e) {
    stats.failed++;
    failures.push({ key, error: e.message });
    if (failures.length <= 5) console.error(`  ✗ upload ${key}: ${e.message}`);
  }
}

const progressTimer = setInterval(() => {
  const mb = (stats.bytes / 1024 / 1024).toFixed(1);
  const elapsedS = ((Date.now() - startedAt) / 1000).toFixed(0);
  process.stdout.write(
    `  [${elapsedS}s] uploaded ${stats.uploaded} (${mb} MB), metadata-update ${stats.metadataUpdated}, ` +
    `skipped ${stats.skippedMatch}, no-credit ${stats.noCredit}, failed ${stats.failed}\n`
  );
}, 5000);

for (const app of APPS) {
  const contentDir = join(ROOT, 'content', app);
  console.log(`=== ${app} ===`);
  console.log(`▸ Building credit index z ${relative(ROOT, contentDir)}…`);
  const imageCredits = await buildCreditIndex(contentDir);
  console.log(`  ${imageCredits.size} credit entries\n`);

  const publicImg = join(ROOT, 'apps', app, 'public', 'img');
  if (!existsSync(publicImg)) {
    console.log(`  ⚠ ${relative(ROOT, publicImg)} neexistuje, skip.`);
    continue;
  }

  const files = [];
  for await (const f of walk(publicImg)) {
    if (JPG_EXT.has(extname(f))) files.push(f);
  }
  console.log(`▸ ${files.length} JPG souborů, concurrency ${CONCURRENCY}, dry-run=${DRY_RUN}`);

  let idx = 0;
  async function worker() {
    while (idx < files.length && stats.scanned < LIMIT) {
      const my = idx++;
      await uploadOne(files[my], app, imageCredits);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
}

clearInterval(progressTimer);

const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
const mb = (stats.bytes / 1024 / 1024).toFixed(1);
console.log(`\n=== Hotovo za ${elapsed}s ===`);
console.log(`Scanováno:                  ${stats.scanned}`);
console.log(`Uploadnuto (nový obsah):     ${stats.uploaded} (${mb} MB)${DRY_RUN ? ' (dry-run)' : ''}`);
console.log(`Pouze metadata reupload:     ${stats.metadataUpdated}`);
console.log(`Skipnuto (vše match):        ${stats.skippedMatch}`);
console.log(`Bez credit dat (default):    ${stats.noCredit}`);
if (stats.failed) {
  console.log(`Chyb:                       ${stats.failed}`);
  if (failures.length > 5) console.log(`  …a ${failures.length - 5} dalších.`);
}
console.log('');
console.log('Další kroky:');
console.log('  1) Verify R2: curl -I https://pub-e96bd8c658664b38af73a48cb8872b60.r2.dev/img/...');
console.log('     → ověř `x-amz-meta-creator`, `x-amz-meta-license` headers');
console.log('  2) Validation week — sleduj prod traffic, žádné chybějící obrázky');
console.log('  3) Až David schválí → samostatný commit `git rm -r apps/*/public/img/`');
