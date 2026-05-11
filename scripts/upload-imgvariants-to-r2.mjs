#!/usr/bin/env node
/**
 * Sync AVIF/WebP variant souborů z apps/{hodinarium-eu,horologie-cz}/public/img
 * do Cloudflare R2 bucketu (`csh-imgvariants`).
 *
 * Idempotentní:
 *   - List ETagů existujících objektů v R2.
 *   - MD5 každého lokálního variantu → porovnání s ETagem.
 *   - PUT jen co se změnilo / chybí.
 *
 * Použití:
 *   pnpm imgvariants:upload                # sync všeho
 *   pnpm imgvariants:upload --apps hodinarium-eu
 *   pnpm imgvariants:upload --dry-run      # jen log
 *
 * Credentials se čtou z .dev.vars (gitignored) nebo z env. Vyžadované:
 *   R2_ACCOUNT_ID
 *   R2_ACCESS_KEY_ID
 *   R2_SECRET_ACCESS_KEY
 *   R2_BUCKET                              # default: csh-imgvariants
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import { createReadStream, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..');

// --- .dev.vars loader (KEY=VALUE per řádek) ---
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

if (!ACCOUNT_ID || !ACCESS_KEY || !SECRET_KEY) {
  console.error('✗ Chybí R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY (v .dev.vars nebo env).');
  process.exit(1);
}

// --- CLI args ---
const ALL_APPS = ['hodinarium-eu', 'horologie-cz'];
const appsArgIdx = process.argv.indexOf('--apps');
const APPS = appsArgIdx >= 0 && process.argv[appsArgIdx + 1]
  ? process.argv[appsArgIdx + 1].split(',').map((s) => s.trim()).filter(Boolean)
  : ALL_APPS;
const DRY_RUN = process.argv.includes('--dry-run');

const VARIANT_EXTS = new Set(['.avif', '.webp']);
const MIME = { '.avif': 'image/avif', '.webp': 'image/webp' };

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
});

// --- 1. List existujících R2 objektů (ETags) ---
console.log(`▸ Listing R2 bucket "${BUCKET}"…`);
const existing = new Map(); // key → etag (bez quotes)
let token;
let pages = 0;
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
console.log(`  ${existing.size} existujících objektů (${pages} stránek)`);

// --- 2. Walk lokální AVIF/WebP varianty ---
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

async function md5File(p) {
  return new Promise((resolve, reject) => {
    const h = createHash('md5');
    const s = createReadStream(p);
    s.on('data', (c) => h.update(c));
    s.on('end', () => resolve(h.digest('hex')));
    s.on('error', reject);
  });
}

const stats = { scanned: 0, uploaded: 0, skipped: 0, failed: 0, bytes: 0 };
const startedAt = Date.now();

// Concurrency pool — R2 zvládá paralelismus, sériový upload byl ~50/min
// = 2h na 5756 souborů. S poolem ~16 paralelních PUT je realistický
// throughput ~10×.
const concArgIdx = process.argv.indexOf('--concurrency');
const CONCURRENCY = concArgIdx >= 0 && process.argv[concArgIdx + 1]
  ? Math.max(1, parseInt(process.argv[concArgIdx + 1], 10))
  : 16;

async function uploadOne(file, app) {
  const ext = extname(file).toLowerCase();
  if (!VARIANT_EXTS.has(ext)) return;
  stats.scanned++;

  const relPath = relative(join(ROOT, 'apps', app, 'public'), file).replace(/\\/g, '/');
  const key = relPath;

  let localEtag;
  try {
    localEtag = await md5File(file);
  } catch (e) {
    stats.failed++;
    console.error(`  ✗ md5 ${relPath}: ${e.message}`);
    return;
  }

  if (existing.get(key) === localEtag) {
    stats.skipped++;
    return;
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
      ContentType: MIME[ext],
      CacheControl: 'public, max-age=31536000, immutable',
      ContentLength: size,
    }));
    stats.uploaded++;
    stats.bytes += size;
  } catch (e) {
    stats.failed++;
    console.error(`  ✗ upload ${key}: ${e.message}`);
  }
}

// Progress reporter každých 5s
const progressTimer = setInterval(() => {
  const mb = (stats.bytes / 1024 / 1024).toFixed(1);
  const elapsedS = ((Date.now() - startedAt) / 1000).toFixed(0);
  process.stdout.write(`  [${elapsedS}s] uploaded ${stats.uploaded} (${mb} MB), skipped ${stats.skipped}, failed ${stats.failed}\n`);
}, 5000);

for (const app of APPS) {
  const root = join(ROOT, 'apps', app, 'public', 'img');
  console.log(`\n=== ${app} (concurrency ${CONCURRENCY}) ===`);
  // Načti všechny soubory najednou (5756 paths je v paměti zanedbatelné).
  const files = [];
  for await (const f of walk(root)) files.push(f);

  // Worker pool
  let idx = 0;
  async function worker() {
    while (idx < files.length) {
      const my = idx++;
      await uploadOne(files[my], app);
    }
  }
  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);
  console.log(`  scanned ${files.length} souborů (z toho ${VARIANT_EXTS.size} variant typů)`);
}

clearInterval(progressTimer);

const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
const mb = (stats.bytes / 1024 / 1024).toFixed(1);
console.log(`\n=== Hotovo za ${elapsed}s ===`);
console.log(`Variantů scanováno: ${stats.scanned}`);
console.log(`Uploadnuto:         ${stats.uploaded} (${mb} MB)`);
console.log(`Skipnuto (=match):  ${stats.skipped}`);
if (stats.failed) console.log(`Chyb:               ${stats.failed}`);
