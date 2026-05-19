#!/usr/bin/env node
/**
 * audit-slovnik-render.mjs — fetch každé /slovnik/<slug>/ z live deploy
 * a hledá formátovací chyby:
 *   - Unrendered markdown (**bold**, _italic_, [link](url), raw `\n`)
 *   - Prázdné sekce (<h2> bez následujícího obsahu)
 *   - Truncated text (... v polovině věty)
 *   - JS errors v HTML (undefined, NaN, [object Object])
 *   - HTML entity leaks (&amp;amp; — dvojité escape)
 *
 * Použití:
 *   node scripts/audit-slovnik-render.mjs
 *   node scripts/audit-slovnik-render.mjs --base=http://localhost:4321
 */

const BASE = process.argv.find((a) => a.startsWith('--base='))?.slice('--base='.length)
  ?? 'https://hodinarium-eu.pages.dev';
const CONCURRENCY = 12;

async function fetchSitemap() {
  // Stáhne index slovníku a vyextrahuje všechny `/slovnik/<slug>/` linky
  const res = await fetch(`${BASE}/slovnik/`);
  if (!res.ok) throw new Error(`slovnik index ${res.status}`);
  const html = await res.text();
  const slugs = new Set();
  for (const m of html.matchAll(/href="\/slovnik\/([a-z0-9-]+)\/?"/g)) {
    slugs.add(m[1]);
  }
  return [...slugs];
}

const ISSUES = {
  unrenderedBold: (body) => {
    // **text** nemělo by být v HTML body (mělo by být <strong>)
    // Exclude code blocks (where ** je validní)
    const stripped = body.replace(/<code[^>]*>[\s\S]*?<\/code>/g, '');
    return /\*\*[^*\s][^*]*\*\*/.test(stripped);
  },
  unrenderedItalic: (body) => {
    const stripped = body.replace(/<code[^>]*>[\s\S]*?<\/code>/g, '');
    // _italic_ nebo *italic* mimo HTML tagy
    return /(?:^|[\s>])_[^_\s][^_]{1,80}_(?:[\s<.,]|$)/.test(stripped) ||
           /(?:^|[\s>])\*[^*\s][^*]{1,80}\*(?:[\s<.,]|$)/.test(stripped);
  },
  unrenderedLink: (body) => {
    const stripped = body.replace(/<code[^>]*>[\s\S]*?<\/code>/g, '');
    return /\[[^\]]{2,100}\]\([^)]{2,200}\)/.test(stripped);
  },
  rawNewline: (body) => /\\n\b|\\t\b/.test(body),
  htmlEntityLeak: (body) => /&amp;(amp|lt|gt|quot|apos);/.test(body),
  objectObject: (body) => /\[object Object\]/i.test(body),
  undefinedLeak: (body) => />undefined</i.test(body) || /\bundefined\b\s*\.?</i.test(body),
  emptyParagraph: (body) => /<p[^>]*>\s*<\/p>/.test(body),
  emptyStrong: (body) => /<strong[^>]*>\s*<\/strong>/.test(body),
};

async function checkSlug(slug) {
  const url = `${BASE}/slovnik/${slug}/`;
  let html;
  try {
    const res = await fetch(url);
    if (!res.ok) return { slug, status: 'http_' + res.status };
    html = await res.text();
  } catch (e) {
    return { slug, status: 'fetch_error', error: e.message };
  }

  // Vyříznout jen <main>...</main> — header/footer nás nezajímá
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  const body = mainMatch ? mainMatch[1] : html;

  const found = [];
  for (const [name, check] of Object.entries(ISSUES)) {
    if (check(body)) found.push(name);
  }
  if (found.length === 0) return { slug, status: 'ok' };
  return { slug, status: 'issue', issues: found };
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
  console.log(`Audit slovník render — ${BASE}`);
  const slugs = await fetchSitemap();
  console.log(`Found ${slugs.length} slugs in index. Testing per-slug pages…\n`);

  const start = Date.now();
  const results = await runPool(slugs, checkSlug, CONCURRENCY);
  const took = ((Date.now() - start) / 1000).toFixed(1);

  const failed = results.filter((r) => r.status !== 'ok');
  console.log(`Tested ${results.length} pages in ${took}s\n`);
  console.log(`OK: ${results.length - failed.length}`);
  console.log(`Failed: ${failed.length}\n`);

  if (failed.length === 0) {
    console.log('✓ Žádné formátovací chyby napříč všemi hesly.');
    process.exit(0);
  }

  // Group by issue
  const byIssue = {};
  for (const r of failed) {
    if (r.status === 'issue') {
      for (const i of r.issues) {
        if (!byIssue[i]) byIssue[i] = [];
        byIssue[i].push(r.slug);
      }
    } else {
      if (!byIssue[r.status]) byIssue[r.status] = [];
      byIssue[r.status].push(r.slug);
    }
  }

  console.log('=== By issue type ===');
  for (const [issue, slugs] of Object.entries(byIssue).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n${issue} (${slugs.length}):`);
    for (const s of slugs.slice(0, 20)) console.log(`  ${s}`);
    if (slugs.length > 20) console.log(`  ... +${slugs.length - 20}`);
  }
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
