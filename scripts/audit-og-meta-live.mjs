#!/usr/bin/env node
/**
 * audit-og-meta-live.mjs — sahá na live deploy a verifikuje že každá
 * stránka má funkční `<meta og:image>` (PNG vrací HTTP 200, ne 404
 * fallback).
 *
 * Doplňuje `check-og-coverage.mjs` o pravdivý end-to-end audit, který
 * chytí gapy v `Base.astro ogSlugFromPath()` logice — situace, kdy se
 * OG slug odvodí nesprávně (např. `/sbirka/katalog` → og/katalog.png
 * který neexistuje, protože `katalog` je page route, ne content slug).
 *
 * Použití:
 *   node scripts/audit-og-meta-live.mjs                         # default base
 *   node scripts/audit-og-meta-live.mjs --base=https://my.url
 *   node scripts/audit-og-meta-live.mjs --concurrency=8
 *   node scripts/audit-og-meta-live.mjs --limit=50              # sample
 */

const BASE = process.argv.find((a) => a.startsWith('--base='))?.slice('--base='.length)
  ?? 'https://hodinarium-eu.pages.dev';
const CONCURRENCY = Number(
  process.argv.find((a) => a.startsWith('--concurrency='))?.slice('--concurrency='.length) ?? 16
);
const LIMIT = Number(
  process.argv.find((a) => a.startsWith('--limit='))?.slice('--limit='.length) ?? 0
);

async function fetchSitemap() {
  const res = await fetch(`${BASE}/sitemap-0.xml`);
  if (!res.ok) throw new Error(`sitemap fetch ${res.status}`);
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  return urls.filter((u) => {
    if (u === BASE || u === BASE + '/') return false; // home special-cased
    if (u.includes('/tagy/')) return false;
    if (u.includes('/page/')) return false;
    return true;
  });
}

async function fetchHead(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return res.status;
  } catch {
    return 0;
  }
}

async function checkUrl(url) {
  const html = await fetch(url + (url.endsWith('/') ? '' : '/'), { redirect: 'follow' })
    .then((r) => r.text())
    .catch(() => '');
  const m = html.match(/<meta property="og:image" content="([^"]+)"/);
  if (!m) return { url, status: 'no_meta' };
  const ogUrl = m[1];
  const slug = ogUrl.split('/').pop().replace(/\.png$/, '');
  if (slug === '404') return { url, status: 'fallback_404', ogUrl };
  const code = await fetchHead(ogUrl);
  if (code !== 200) return { url, status: `og_http_${code}`, ogUrl, slug };
  return { url, status: 'ok', ogUrl, slug };
}

async function runPool(items, fn, concurrency) {
  const results = [];
  let i = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx]);
    }
  });
  await Promise.all(workers);
  return results;
}

async function main() {
  console.log(`Audit OG meta live — ${BASE}`);
  console.log(`Fetching sitemap…`);
  let urls = await fetchSitemap();
  if (LIMIT > 0) urls = urls.slice(0, LIMIT);
  console.log(`Testing ${urls.length} URLs s concurrency=${CONCURRENCY}…\n`);

  const start = Date.now();
  let done = 0;
  const reportInterval = setInterval(() => {
    process.stderr.write(`\r  progress: ${done}/${urls.length}`);
  }, 1000);

  const wrapped = async (u) => {
    const r = await checkUrl(u);
    done++;
    return r;
  };
  const results = await runPool(urls, wrapped, CONCURRENCY);
  clearInterval(reportInterval);
  process.stderr.write(`\r  progress: ${done}/${urls.length}  (${((Date.now() - start) / 1000).toFixed(1)}s)\n\n`);

  const fails = results.filter((r) => r.status !== 'ok');
  const byStatus = {};
  for (const r of fails) byStatus[r.status] = (byStatus[r.status] || 0) + 1;

  console.log(`=== Summary ===`);
  console.log(`Total tested: ${urls.length}`);
  console.log(`OK:           ${urls.length - fails.length}`);
  console.log(`Failures:     ${fails.length}`);
  if (fails.length) {
    console.log(`\nBy status:`);
    for (const [s, n] of Object.entries(byStatus).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${s.padEnd(20)} ${n}`);
    }
    console.log(`\n=== Fail list ===`);
    for (const r of fails) {
      console.log(`  ${r.status.padEnd(18)} ${r.url}  → ${r.ogUrl || '(no og)'}`);
    }
    process.exit(1);
  }
  console.log(`\n✓ Všechny stránky mají funkční og:image.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
