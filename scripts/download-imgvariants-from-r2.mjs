#!/usr/bin/env node
/**
 * Stáhne AVIF/WebP varianty (a volitelně originály) z R2 bucketu zpět do
 * public/img/. Slouží k METADATA BACKFILLU: varianty nejsou v gitu (jen na R2),
 * a jejich regenerace přes sharp je u tisíců souborů moc pomalá (avif encoding
 * → CI timeout). Stažení je naopak rychlé (R2 egress zdarma). Po stažení se
 * spustí `write-xmp-metadata.mjs --force` (embed do originálu i variant) a
 * `upload-imgvariants-to-r2.mjs` (re-upload s metadaty).
 *
 * Každý variant se uloží VEDLE odpovídajícího originálu — do té app, kde
 * originál (`.jpg/.jpeg/.png`) existuje (klíče R2 = `img/...`, sdílené napříč
 * apps, proto routing podle existence originálu).
 *
 * Použití:
 *   node scripts/download-imgvariants-from-r2.mjs              # avif+webp
 *   node scripts/download-imgvariants-from-r2.mjs --ext avif,webp,jpg
 *   node scripts/download-imgvariants-from-r2.mjs --dry-run
 *
 * Creds (.dev.vars nebo env): R2_ACCOUNT_ID / R2_ACCESS_KEY_ID /
 *   R2_SECRET_ACCESS_KEY / R2_BUCKET (default csh-imgvariants).
 */
import { mkdir, readFile, stat } from 'node:fs/promises';
import { existsSync, createWriteStream } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';
import { S3Client, ListObjectsV2Command, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..');

// --- .dev.vars loader (stejný jako upload skript) ---
async function loadDevVarsAsync() {
  try {
    const txt = await readFile(join(ROOT, '.dev.vars'), 'utf-8');
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      if (process.env[m[1]] === undefined) {
        let v = m[2];
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
        process.env[m[1]] = v;
      }
    }
  } catch { /* no .dev.vars */ }
}
await loadDevVarsAsync();

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY = process.env.R2_ACCESS_KEY_ID;
const SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET = process.env.R2_BUCKET ?? 'csh-imgvariants';
if (!ACCOUNT_ID || !ACCESS_KEY || !SECRET_KEY) {
  console.error('✗ Chybí R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY.');
  process.exit(1);
}

const DRY_RUN = process.argv.includes('--dry-run');
const extIdx = process.argv.indexOf('--ext');
const EXTS = extIdx >= 0 && process.argv[extIdx + 1]
  ? process.argv[extIdx + 1].split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
  : ['avif', 'webp'];
const APPS = ['hodinarium-eu', 'horologie-cz'];
const ORIG_EXTS = ['.jpg', '.jpeg', '.png'];

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
});

// --- 1. List R2 objektů ---
console.log(`▸ Listing R2 bucket "${BUCKET}"…`);
const keys = [];
let token;
do {
  const res = await r2.send(new ListObjectsV2Command({ Bucket: BUCKET, ContinuationToken: token }));
  for (const o of res.Contents ?? []) keys.push(o.Key);
  token = res.NextContinuationToken;
} while (token);
console.log(`  ${keys.length} objektů na R2`);

// --- 2. Vyber varianty + namapuj na app(y) s originálem ---
function originalExistsInApp(app, variantKey) {
  const base = variantKey.replace(/\.(avif|webp)$/i, '');
  return ORIG_EXTS.some((e) => existsSync(join(ROOT, 'apps', app, 'public', base + e)));
}

const targets = []; // { key, dest }
for (const key of keys) {
  const ext = key.slice(key.lastIndexOf('.') + 1).toLowerCase();
  if (!EXTS.includes(ext)) continue;
  if (!key.startsWith('img/')) continue;
  for (const app of APPS) {
    // varianty routujeme tam, kde je originál; jpg/png přímo (mají originál = ony samy)
    const isVariant = ext === 'avif' || ext === 'webp';
    const dest = join(ROOT, 'apps', app, 'public', key);
    if (isVariant ? originalExistsInApp(app, key) : existsSync(dest)) {
      targets.push({ key, dest });
    }
  }
}
console.log(`  ${targets.length} souborů ke stažení (ext: ${EXTS.join(', ')})`);
if (DRY_RUN) { console.log('(dry-run) konec.'); process.exit(0); }

// --- 3. Download s concurrency poolem ---
const stats = { downloaded: 0, skipped: 0, failed: 0, bytes: 0 };
const startedAt = Date.now();
const timer = setInterval(() => {
  const mb = (stats.bytes / 1048576).toFixed(1);
  const s = ((Date.now() - startedAt) / 1000).toFixed(0);
  process.stdout.write(`  [${s}s] downloaded ${stats.downloaded} (${mb} MB), skipped ${stats.skipped}, failed ${stats.failed}\n`);
}, 5000);

async function downloadOne({ key, dest }) {
  try {
    // Idempotence: skip, pokud lokálně existuje se stejnou velikostí (HEAD, ne GET).
    if (existsSync(dest)) {
      const head = await r2.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
      const local = (await stat(dest)).size;
      if (head.ContentLength != null && local === head.ContentLength) {
        stats.skipped++;
        return;
      }
    }
    const obj = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    await mkdir(dirname(dest), { recursive: true });
    await pipeline(obj.Body, createWriteStream(dest));
    stats.downloaded++;
    stats.bytes += obj.ContentLength ?? 0;
  } catch (e) {
    stats.failed++;
    if (stats.failed <= 5) console.error(`  ✗ ${key}: ${e.message}`);
  }
}

const CONCURRENCY = 16;
let idx = 0;
async function worker() { while (idx < targets.length) { const my = idx++; await downloadOne(targets[my]); } }
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
clearInterval(timer);

const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
console.log(`\n=== Hotovo za ${elapsed}s ===`);
console.log(`Staženo: ${stats.downloaded} (${(stats.bytes / 1048576).toFixed(1)} MB), skip ${stats.skipped}, chyb ${stats.failed}`);
