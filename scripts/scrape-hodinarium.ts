/**
 * Scraper pro hodinarium.eu.
 *
 * - Začne na mapa.htm (kompletní mapa serveru).
 * - Vyextrahuje všechny interní .htm odkazy.
 * - Stáhne je, dekóduje z windows-1250 nebo UTF-8 (auto-detekce dle meta charset).
 * - Uloží raw HTML do raw/hodinarium-eu/pages/<slug>.html (UTF-8).
 * - Uloží metadata (URL, last-modified, title, links-out) do raw/hodinarium-eu/_index.json.
 *
 * Idempotentní: pokud soubor existuje a remote Last-Modified se nezměnilo, přeskočí.
 */
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'raw', 'hodinarium-eu');
const PAGES_DIR = join(OUT_DIR, 'pages');
const INDEX_PATH = join(OUT_DIR, '_index.json');

const BASE = 'https://hodinarium.eu';
const ENTRY = `${BASE}/mapa.htm`;
const USER_AGENT = 'Mozilla/5.0 (compatible; CSH-Web-Migration/0.1; +https://hodinarium.eu)';
const DELAY_MS = 200; // šetrnost vůči WEDOS

interface PageMeta {
  url: string;
  slug: string;
  title: string | null;
  lastModified: string | null;
  charset: string;
  contentLength: number;
  linksOut: string[];
  scrapedAt: string;
}

interface Index {
  scrapedAt: string;
  pages: Record<string, PageMeta>;
}

async function loadIndex(): Promise<Index> {
  if (existsSync(INDEX_PATH)) {
    return JSON.parse(await readFile(INDEX_PATH, 'utf-8'));
  }
  return { scrapedAt: new Date().toISOString(), pages: {} };
}

async function saveIndex(index: Index): Promise<void> {
  index.scrapedAt = new Date().toISOString();
  await writeFile(INDEX_PATH, JSON.stringify(index, null, 2), 'utf-8');
}

function detectCharset(buf: Buffer): string {
  const head = buf.subarray(0, Math.min(2048, buf.length)).toString('latin1');
  const m = head.match(/charset=["']?([\w-]+)/i);
  return (m?.[1] ?? 'windows-1250').toLowerCase();
}

function decode(buf: Buffer, charset: string): string {
  if (charset === 'utf-8' || charset === 'utf8') {
    return buf.toString('utf-8');
  }
  // windows-1250 → UTF-8 přes TextDecoder
  return new TextDecoder(charset, { fatal: false }).decode(buf);
}

function extractTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].replace(/\s+/g, ' ').trim() : null;
}

function extractInternalLinks(html: string): string[] {
  const links = new Set<string>();
  const re = /href=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    let href = m[1];
    if (!href) continue;
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('javascript:')) continue;
    if (href.startsWith('http://') || href.startsWith('https://')) {
      if (!href.includes('hodinarium.eu') && !href.includes('muzeumhodin.info')) continue;
      // Strip protocol + host
      href = href.replace(/^https?:\/\/(www\.)?(hodinarium\.eu|muzeumhodin\.info)/, '');
      if (!href) href = '/';
    }
    // Drop fragment & query
    href = href.split('#')[0].split('?')[0];
    if (!href) continue;
    if (!href.endsWith('.htm') && !href.endsWith('.html') && href !== '/') continue;
    // Normalize leading slash
    if (!href.startsWith('/')) href = '/' + href;
    links.add(href);
  }
  return [...links];
}

function pathToSlug(path: string): string {
  return path
    .replace(/^\//, '')
    .replace(/\.html?$/, '')
    .replace(/[^\w.-]/g, '_') || 'index';
}

async function fetchPage(path: string, prevLastModified: string | null): Promise<{ skipped: boolean; meta?: PageMeta; html?: string }> {
  const url = `${BASE}${path}`;
  const headers: Record<string, string> = { 'User-Agent': USER_AGENT };
  if (prevLastModified) headers['If-Modified-Since'] = prevLastModified;

  const res = await fetch(url, { headers });
  if (res.status === 304) {
    return { skipped: true };
  }
  if (!res.ok) {
    throw new Error(`${url} -> HTTP ${res.status}`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  const charset = detectCharset(buf);
  const html = decode(buf, charset);
  const lastModified = res.headers.get('last-modified');

  const meta: PageMeta = {
    url,
    slug: pathToSlug(path),
    title: extractTitle(html),
    lastModified,
    charset,
    contentLength: buf.byteLength,
    linksOut: extractInternalLinks(html),
    scrapedAt: new Date().toISOString(),
  };

  return { skipped: false, meta, html };
}

async function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  await mkdir(PAGES_DIR, { recursive: true });
  const index = await loadIndex();

  // BFS od mapa.htm
  const queue: string[] = ['/mapa.htm', '/index.htm'];
  const visited = new Set<string>();
  let stats = { fetched: 0, skipped: 0, failed: 0, queued: 2 };

  while (queue.length > 0) {
    const path = queue.shift()!;
    if (visited.has(path)) continue;
    visited.add(path);

    const slug = pathToSlug(path);
    const filePath = join(PAGES_DIR, `${slug}.html`);
    const prev = index.pages[path];

    try {
      const result = await fetchPage(path, prev?.lastModified ?? null);
      if (result.skipped) {
        stats.skipped++;
        process.stdout.write(`. ${path} (304)\n`);
        // Stále načteme linky z uloženého souboru
        if (existsSync(filePath)) {
          const cached = await readFile(filePath, 'utf-8');
          for (const link of extractInternalLinks(cached)) {
            if (!visited.has(link) && !queue.includes(link)) {
              queue.push(link);
              stats.queued++;
            }
          }
        }
        continue;
      }

      await writeFile(filePath, result.html!, 'utf-8');
      index.pages[path] = result.meta!;
      stats.fetched++;
      process.stdout.write(`+ ${path} (${result.meta!.charset}, ${(result.meta!.contentLength / 1024).toFixed(1)} KB, ${result.meta!.linksOut.length} links)\n`);

      for (const link of result.meta!.linksOut) {
        if (!visited.has(link) && !queue.includes(link)) {
          queue.push(link);
          stats.queued++;
        }
      }

      // Saveindex průběžně každých 20 stránek
      if (stats.fetched % 20 === 0) {
        await saveIndex(index);
      }
      await delay(DELAY_MS);
    } catch (err) {
      stats.failed++;
      process.stderr.write(`! ${path} - ${(err as Error).message}\n`);
    }
  }

  await saveIndex(index);
  console.log(`\n=== Hotovo ===`);
  console.log(`Stažené:    ${stats.fetched}`);
  console.log(`Beze změny: ${stats.skipped}`);
  console.log(`Chyby:      ${stats.failed}`);
  console.log(`Frontou:    ${stats.queued} (visited ${visited.size})`);
  console.log(`Index:      ${INDEX_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
