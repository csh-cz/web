/**
 * Audit external links across all articles.
 *
 * For each article in content/hodinarium-eu and content/horologie-cz:
 *   1. Extract every http/https link target (markdown [text](url) form).
 *   2. HEAD request → status. If 405 fallback to GET.
 *   3. If 2xx, fetch page <title> + Open Graph title for citation.
 *   4. Emit content/_link_audit.json with:
 *      { url, status, hostname, title, ogTitle, articles: [slug,…] }
 *
 * Usage:
 *   pnpm tsx scripts/audit-external-links.ts                # full run
 *   pnpm tsx scripts/audit-external-links.ts --resume       # skip already-audited
 *   pnpm tsx scripts/audit-external-links.ts --limit 50     # debug small batch
 *
 * The output file is meant for human review or later transformation —
 * we don't auto-rewrite link captions, that needs editorial judgment.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const DIRS = [
  join(ROOT, 'content', 'hodinarium-eu'),
  join(ROOT, 'content', 'horologie-cz'),
];
const OUT_PATH = join(ROOT, 'content', '_link_audit.json');

const USER_AGENT = 'Mozilla/5.0 (compatible; CSH-LinkAudit/1.0)';
const FETCH_TIMEOUT_MS = 12000;
const CONCURRENCY = 6;

interface AuditEntry {
  url: string;
  hostname: string;
  status: number | null;
  ok: boolean;
  /** HTML <title> if fetched */
  title: string | null;
  /** og:title if present */
  ogTitle: string | null;
  /** og:site_name */
  siteName: string | null;
  /** error string (timeout, DNS, …) */
  error: string | null;
  /** which articles use this URL */
  articles: string[];
  checkedAt: string;
}

const args = process.argv.slice(2);
const RESUME = args.includes('--resume');
const limitArg = args.find((a) => a.startsWith('--limit='));
const LIMIT = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;

function extractLinks(md: string): Set<string> {
  const links = new Set<string>();
  const re = /\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) {
    let url = m[1].trim();
    // strip trailing punctuation that's likely not part of URL
    url = url.replace(/[.,)\]]+$/, '');
    links.add(url);
  }
  return links;
}

async function fetchWithTimeout(url: string, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT, ...(init.headers ?? {}) },
      redirect: 'follow',
    });
  } finally {
    clearTimeout(timer);
  }
}

function extractTitleFromHtml(html: string): { title: string | null; ogTitle: string | null; siteName: string | null } {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? decodeEntities(titleMatch[1]).trim().slice(0, 250) : null;
  const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  const ogTitle = ogTitleMatch ? decodeEntities(ogTitleMatch[1]).trim().slice(0, 250) : null;
  const siteNameMatch = html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i);
  const siteName = siteNameMatch ? decodeEntities(siteNameMatch[1]).trim().slice(0, 100) : null;
  return { title, ogTitle, siteName };
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

async function auditOne(url: string, articles: string[]): Promise<AuditEntry> {
  const entry: AuditEntry = {
    url,
    hostname: new URL(url).hostname,
    status: null,
    ok: false,
    title: null,
    ogTitle: null,
    siteName: null,
    error: null,
    articles,
    checkedAt: new Date().toISOString(),
  };

  try {
    // HEAD first; some servers reply 405 → GET fallback
    let res = await fetchWithTimeout(url, { method: 'HEAD' });
    if (res.status === 405 || res.status === 501) {
      res = await fetchWithTimeout(url, { method: 'GET' });
    }
    entry.status = res.status;
    entry.ok = res.ok;
    if (res.ok && res.headers.get('content-type')?.includes('text/html')) {
      // Re-fetch as GET if HEAD succeeded (no body in HEAD)
      const get = res.bodyUsed || (res.body == null) ? await fetchWithTimeout(url) : res;
      const html = await get.text();
      const meta = extractTitleFromHtml(html.slice(0, 50_000));
      entry.title = meta.title;
      entry.ogTitle = meta.ogTitle;
      entry.siteName = meta.siteName;
    }
  } catch (e: unknown) {
    entry.error = (e as Error).name === 'AbortError' ? 'timeout' : (e as Error).message.slice(0, 120);
  }
  return entry;
}

async function main() {
  // Index URL → articles
  const urlToArticles = new Map<string, Set<string>>();
  for (const dir of DIRS) {
    const files = (await readdir(dir)).filter((f) => f.endsWith('.md'));
    for (const file of files) {
      const md = await readFile(join(dir, file), 'utf-8');
      const links = extractLinks(md);
      for (const url of links) {
        if (!urlToArticles.has(url)) urlToArticles.set(url, new Set());
        urlToArticles.get(url)!.add(file.replace(/\.md$/, ''));
      }
    }
  }

  const all = [...urlToArticles.entries()].map(([url, slugs]) => ({ url, slugs: [...slugs] }));
  console.log(`Found ${all.length} unique external URLs across ${DIRS.length} content dirs.`);

  // Resume mode: keep already-audited entries
  let existing: Record<string, AuditEntry> = {};
  if (RESUME && existsSync(OUT_PATH)) {
    const raw = JSON.parse(await readFile(OUT_PATH, 'utf-8')) as AuditEntry[];
    for (const e of raw) existing[e.url] = e;
    console.log(`Resume: ${Object.keys(existing).length} entries already audited.`);
  }

  const todo = all.filter(({ url }) => !existing[url]).slice(0, LIMIT);
  console.log(`To audit now: ${todo.length}`);

  const results: AuditEntry[] = Object.values(existing);
  let done = 0;

  async function worker() {
    while (todo.length) {
      const item = todo.shift();
      if (!item) return;
      const e = await auditOne(item.url, item.slugs);
      results.push(e);
      done++;
      if (done % 20 === 0 || done === 1) {
        console.log(`  [${done}] ${e.status ?? 'ERR'} ${e.url.slice(0, 80)}`);
        // periodic save
        await writeFile(OUT_PATH, JSON.stringify(results, null, 2), 'utf-8');
      }
    }
  }

  await Promise.all(Array(CONCURRENCY).fill(0).map(() => worker()));

  await writeFile(OUT_PATH, JSON.stringify(results, null, 2), 'utf-8');

  // Summary
  const byStatus: Record<string, number> = {};
  for (const e of results) {
    const k = e.error ? `ERR ${e.error.slice(0, 30)}` : String(e.status);
    byStatus[k] = (byStatus[k] ?? 0) + 1;
  }
  console.log('\n=== Audit summary ===');
  console.log(`Total entries: ${results.length}`);
  console.log(`Output:        ${OUT_PATH}`);
  console.log('\nBy status:');
  for (const [k, n] of Object.entries(byStatus).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k.padEnd(40)} ${n}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
