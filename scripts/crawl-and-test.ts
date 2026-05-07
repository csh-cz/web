/**
 * Komplexní test obou webů přes Playwright headless Chromium.
 *
 * Pro každou stránku:
 *   - Otevři v headless Chrome
 *   - Sleduj síťové požadavky → zaznamenej 4xx/5xx
 *   - Sleduj console → JS errors
 *   - Najdi <a href="..."> → otestuj všechny cílové URL
 *   - Najdi <img src="..."> → otestuj jestli loadují
 *   - Vyhodnoť page.title (chybí?), <h1> (víc než jeden? žádný?)
 *
 * Výstup: BUGS.md s nálezy, seskupené per stránka.
 */
import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const BUGS_PATH = join(ROOT, 'BUGS.md');

const SITES = [
  { name: 'hodinarium-eu', url: 'https://hodinarium-eu.pages.dev' },
  { name: 'horologie-cz',  url: 'https://horologie-cz.pages.dev' },
];

interface Bug {
  url: string;
  type: 'broken-image' | 'broken-link' | 'js-error' | 'failed-request' | 'no-h1' | 'multiple-h1' | 'missing-title' | 'http-error' | 'page-404';
  detail: string;
}

// URL koncovky které NIKDY nejsou stránky — crawler je nesmí navštěvovat
// jako page.goto(), protože pak zaznamená "no-h1" / "missing-title" pro
// statické assety, což je false positive (viz BUGS.md 2026-04-28).
const NON_PAGE_EXTS = /\.(jpg|jpeg|png|gif|webp|avif|svg|ico|pdf|zip|mp3|mp4|webm|woff2?|ttf|eot|css|js|json|xml|txt)(\?|$)/i;

function isPageUrl(url: string): boolean {
  return !NON_PAGE_EXTS.test(url);
}

async function discoverPages(base: string, maxPages = 500): Promise<string[]> {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const found = new Set<string>([base + '/']);
  const queue = [base + '/'];
  const visited = new Set<string>();

  while (queue.length && visited.size < maxPages) {
    const url = queue.shift()!;
    if (visited.has(url)) continue;
    visited.add(url);

    try {
      const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      if (!res || !res.ok()) continue;
      const links = await page.$$eval('a[href]', (els) =>
        els.map((a) => (a as HTMLAnchorElement).href)
      );
      for (const link of links) {
        if (!link.startsWith(base)) continue;
        const cleanUrl = link.split('#')[0];
        if (!isPageUrl(cleanUrl)) continue; // skip statické assety
        if (!found.has(cleanUrl) && cleanUrl.length < 200) {
          found.add(cleanUrl);
          queue.push(cleanUrl);
        }
      }
    } catch {
      // skip
    }
  }
  await browser.close();
  return [...found];
}

async function testPage(url: string, base: string): Promise<Bug[]> {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const bugs: Bug[] = [];
  const seenFailedReqs = new Set<string>(); // dedup per page

  // Console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (text.includes('favicon')) return;
      // Suppress „Failed to load resource: 404" — already captured by response handler
      if (/failed to load resource.*40[34]/i.test(text)) return;
      bugs.push({ url, type: 'js-error', detail: text.slice(0, 200) });
    }
  });

  page.on('pageerror', (err) => {
    bugs.push({ url, type: 'js-error', detail: err.message.slice(0, 200) });
  });

  // Network failures (sub-resources). Skip 3xx (Playwright follows redirects).
  page.on('response', (res) => {
    const status = res.status();
    if (status < 400 || status >= 600) return;
    if (res.url() === url) return; // top-level handled below
    const u = res.url().replace(base, '');
    if (seenFailedReqs.has(u)) return; // dedup
    seenFailedReqs.add(u);
    const isImg = /\.(jpg|jpeg|png|gif|webp|avif|svg)/i.test(u);
    bugs.push({
      url,
      type: isImg ? 'broken-image' : 'failed-request',
      detail: `${status} ${u}`,
    });
  });

  try {
    const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    if (!res) {
      bugs.push({ url, type: 'http-error', detail: 'no response' });
      return bugs;
    }
    const finalStatus = res.status();
    if (finalStatus === 404) {
      // 404 stránka — žádný smysl kontrolovat title/h1 (404 layout je validní bez h1)
      bugs.push({ url, type: 'page-404', detail: `${finalStatus} ${res.url().replace(base, '')}` });
      return bugs;
    }
    if (finalStatus >= 400) {
      bugs.push({ url, type: 'http-error', detail: `HTTP ${finalStatus}` });
      return bugs;
    }

    // Title
    const title = await page.title();
    if (!title || title === 'Error') {
      bugs.push({ url, type: 'missing-title', detail: 'page má prázdný/Error title' });
    }

    // H1 count
    const h1count = await page.$$eval('h1', (els) => els.length);
    if (h1count === 0) {
      bugs.push({ url, type: 'no-h1', detail: '0× <h1>' });
    } else if (h1count > 1) {
      bugs.push({ url, type: 'multiple-h1', detail: `${h1count}× <h1>` });
    }
  } catch (e) {
    bugs.push({ url, type: 'http-error', detail: (e as Error).message.slice(0, 150) });
  } finally {
    await browser.close();
  }
  return bugs;
}

async function main() {
  const allBugs: Bug[] = [];
  const stats: Record<string, number> = { tested: 0 };

  for (const site of SITES) {
    console.log(`\n=== ${site.name} ===`);
    console.log(`Discover URLs from ${site.url}…`);
    const pages = await discoverPages(site.url);
    console.log(`Nalezeno ${pages.length} stránek`);

    for (let i = 0; i < pages.length; i++) {
      const url = pages[i];
      const bugs = await testPage(url, site.url);
      stats.tested++;
      if (bugs.length > 0) {
        allBugs.push(...bugs);
        process.stdout.write(`! `);
      } else {
        process.stdout.write(`. `);
      }
      if ((i + 1) % 25 === 0) process.stdout.write(`\n  [${i + 1}/${pages.length}] `);
    }
    console.log('\n');
  }

  console.log(`\n=== Souhrn ===`);
  console.log(`Stránek otestováno: ${stats.tested}`);
  console.log(`Bugs celkem: ${allBugs.length}`);

  // Group by type
  const byType: Record<string, Bug[]> = {};
  for (const b of allBugs) {
    byType[b.type] ??= [];
    byType[b.type].push(b);
  }
  console.log('\nPer typ:');
  for (const [type, list] of Object.entries(byType).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${type.padEnd(20)} ${list.length}`);
  }

  // Write BUGS.md
  const date = new Date().toISOString().slice(0, 10);
  let md = `# BUGS\n\n`;
  md += `Automatický crawl Playwrightem dne ${date}.\n`;
  md += `Otestováno ${stats.tested} stránek napříč hodinarium-eu.pages.dev a horologie-cz.pages.dev.\n\n`;
  md += `## Souhrn\n\n`;
  md += `| Typ chyby | Počet |\n|---|---|\n`;
  for (const [type, list] of Object.entries(byType).sort((a, b) => b[1].length - a[1].length)) {
    md += `| ${type} | ${list.length} |\n`;
  }
  md += `\n**Celkem ${allBugs.length} nálezů.**\n\n`;

  // Per-type sections
  for (const [type, list] of Object.entries(byType).sort((a, b) => b[1].length - a[1].length)) {
    md += `\n## ${type} (${list.length})\n\n`;
    // Group by URL
    const byUrl: Record<string, Bug[]> = {};
    for (const b of list) {
      byUrl[b.url] ??= [];
      byUrl[b.url].push(b);
    }
    for (const [url, bugs] of Object.entries(byUrl).slice(0, 50)) {
      md += `### ${url.replace(/^https?:\/\/[^/]+/, '')}\n\n`;
      for (const b of bugs.slice(0, 20)) {
        md += `- ${b.detail}\n`;
      }
      if (bugs.length > 20) md += `- ... +${bugs.length - 20} dalších\n`;
      md += `\n`;
    }
    if (Object.keys(byUrl).length > 50) {
      md += `\n*… +${Object.keys(byUrl).length - 50} dalších stránek s tímto typem chyby*\n`;
    }
  }

  await writeFile(BUGS_PATH, md, 'utf-8');
  console.log(`\nVýstup: ${BUGS_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
