/**
 * Stahne obrazky z hodinarium.eu lokalne do apps/hodinarium-eu/public/img/.
 *
 * - Prochazi vsechny markdowny v content/hodinarium-eu
 * - Vyextrahuje vsechny URL na *.jpg/png/gif/webp/svg z hodinarium.eu
 * - Stahne, ulozi do public/img/<original-path>
 * - Prepise odkazy v markdownu z https://hodinarium.eu/img/... na /img/...
 * - Idempotentni: pokud soubor uz existuje, preskoci
 */
import { readFile, writeFile, readdir, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const CONTENT_DIR = join(ROOT, 'content', 'hodinarium-eu');
const PUBLIC_DIR = join(ROOT, 'apps', 'hodinarium-eu', 'public');
const IMG_DIR = join(PUBLIC_DIR, 'img');

const ORIGIN = 'https://hodinarium.eu';
const USER_AGENT = 'Mozilla/5.0 (compatible; CSH-Migration/0.1)';
const CONCURRENCY = 6;
const DELAY_MS = 80; // šetrnost vůči WEDOS

async function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

async function downloadOne(url: string, localPath: string): Promise<{ ok: boolean; bytes: number; cached: boolean }> {
  if (existsSync(localPath)) {
    const s = await stat(localPath);
    if (s.size > 0) return { ok: true, bytes: s.size, cached: true };
  }
  await ensureDir(dirname(localPath));
  try {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) return { ok: false, bytes: 0, cached: false };
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(localPath, buf);
    return { ok: true, bytes: buf.byteLength, cached: false };
  } catch (e) {
    return { ok: false, bytes: 0, cached: false };
  }
}

function extractAssetUrls(md: string): Set<string> {
  const urls = new Set<string>();
  const re = /\(([^)\s]+\.(?:jpg|jpeg|png|gif|webp|svg|ico|pdf)(?:\?[^)]*)?)\)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) {
    const u = m[1];
    if (u.startsWith(ORIGIN) || u.startsWith('/img/')) {
      urls.add(u);
    }
  }
  return urls;
}

function urlToLocal(url: string): string {
  let path = url.startsWith(ORIGIN) ? url.slice(ORIGIN.length) : url;
  // strip query
  path = path.split('?')[0];
  // remove leading /
  if (path.startsWith('/')) path = path.slice(1);
  return join(PUBLIC_DIR, path);
}

function urlToPublicPath(url: string): string {
  let path = url.startsWith(ORIGIN) ? url.slice(ORIGIN.length) : url;
  path = path.split('?')[0];
  if (!path.startsWith('/')) path = '/' + path;
  return path;
}

async function main() {
  await ensureDir(IMG_DIR);

  // Krok 1: posbírej všechny unikátní URL napříč všemi MD soubory
  const files = (await readdir(CONTENT_DIR)).filter((f) => f.endsWith('.md'));
  const allUrls = new Set<string>();
  const fileToUrls = new Map<string, Set<string>>();

  for (const file of files) {
    const md = await readFile(join(CONTENT_DIR, file), 'utf-8');
    const urls = extractAssetUrls(md);
    fileToUrls.set(file, urls);
    for (const u of urls) allUrls.add(u);
  }

  console.log(`Soubory:        ${files.length}`);
  console.log(`Unikátní URLs:  ${allUrls.size}\n`);

  // Krok 2: stáhni všechny v batche
  const urlList = [...allUrls];
  const stats = { ok: 0, cached: 0, failed: 0, totalBytes: 0 };
  const failedUrls: string[] = [];

  let idx = 0;
  async function worker() {
    while (idx < urlList.length) {
      const i = idx++;
      const url = urlList[i];
      const local = urlToLocal(url);
      // Konstrukce absolutní URL — pokud URL začíná /img/..., přidej origin
      const fullUrl = url.startsWith('http') ? url : `${ORIGIN}${url}`;
      const r = await downloadOne(fullUrl, local);
      if (r.ok) {
        if (r.cached) stats.cached++;
        else stats.ok++;
        stats.totalBytes += r.bytes;
        if (!r.cached && (i % 20 === 0 || i === urlList.length - 1)) {
          process.stdout.write(`  [${i + 1}/${urlList.length}] ${url.slice(-60)}\n`);
        }
      } else {
        stats.failed++;
        failedUrls.push(url);
      }
      await delay(DELAY_MS);
    }
  }

  await Promise.all(Array(CONCURRENCY).fill(0).map(() => worker()));

  console.log(`\n=== Stažení hotovo ===`);
  console.log(`Stažené:    ${stats.ok}`);
  console.log(`Cache hit:  ${stats.cached}`);
  console.log(`Selhalo:    ${stats.failed}`);
  console.log(`Velikost:   ${(stats.totalBytes / 1024 / 1024).toFixed(1)} MB`);
  if (failedUrls.length > 0 && failedUrls.length <= 30) {
    console.log(`\nSelhané URL:`);
    failedUrls.forEach((u) => console.log(`  ${u}`));
  } else if (failedUrls.length > 30) {
    console.log(`\nSelhalo ${failedUrls.length} URL, prvních 10:`);
    failedUrls.slice(0, 10).forEach((u) => console.log(`  ${u}`));
  }

  // Krok 3: přepiš odkazy v MD z https://hodinarium.eu/img/... na /img/...
  let rewrittenFiles = 0;
  let rewrittenUrls = 0;
  for (const [file, urls] of fileToUrls) {
    if (urls.size === 0) continue;
    const path = join(CONTENT_DIR, file);
    let md = await readFile(path, 'utf-8');
    let changed = false;
    for (const u of urls) {
      const localExists = existsSync(urlToLocal(u));
      if (!localExists) continue;
      const newRef = urlToPublicPath(u);
      if (md.includes(u)) {
        md = md.split(u).join(newRef);
        changed = true;
        rewrittenUrls++;
      }
    }
    if (changed) {
      await writeFile(path, md, 'utf-8');
      rewrittenFiles++;
    }
  }
  console.log(`\nPřepsáno odkazů: ${rewrittenUrls} v ${rewrittenFiles} souborech`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
