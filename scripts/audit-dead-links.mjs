#!/usr/bin/env node
/**
 * Audit dead-links napříč content/ — najde externí URL ve všech
 * markdown souborech, ověří HTTP status, pokud je dead pošle dotaz
 * na Internet Archive Wayback Machine pro nejbližší snapshot.
 *
 * Použití:
 *   pnpm deadlinks:audit                # full scan
 *   pnpm deadlinks:audit --limit 50     # max 50 URLs (debug)
 *   pnpm deadlinks:audit --skip-wbm     # přeskočit Wayback Machine lookup
 *   pnpm deadlinks:audit --json         # jen JSON do stdout (pro pipeline)
 *
 * Output:
 *   tmp/dead-links-{YYYY-MM-DD}.json   — strukturovaný report
 *   docs/dead-links-audit-{YYYY-MM-DD}.md  — human-readable report
 *
 * Cíl: editor (David/Petr) projde report, pro každý dead link
 * rozhodne:
 *   - **REPLACE** na Wayback Machine archive (pokud existuje)
 *   - **REPLACE** na ekvivalentní současný zdroj
 *   - **REMOVE** odkaz (pokud není relevantní)
 *
 * Strategie:
 *   - Tokenize markdown → najdi `[text](url)`, `<url>` a `url:` ve frontmatteru
 *   - Filter: jen externí http(s) URL (skip mailto:, tel:, internal /...)
 *   - Concurrent HEAD requests (limit 10), timeout 10 s, 1 retry pro network err
 *   - HEAD fail s 405/501 → fallback GET (některé servery neumí HEAD)
 *   - Status: live (2xx, 3xx s OK final), redirect-loop, dead (4xx, 5xx, network err)
 *   - Pro dead → query Wayback Machine API: archive.org/wayback/available
 */
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..');

const args = process.argv.slice(2);
const LIMIT = (() => {
  const i = args.indexOf('--limit');
  return i >= 0 ? parseInt(args[i + 1], 10) : 0;
})();
const SKIP_WBM = args.includes('--skip-wbm');
const JSON_ONLY = args.includes('--json');

const CONCURRENCY = 10;
const TIMEOUT_MS = 15_000;
const SKIP_DOMAINS = new Set([
  'localhost',
  'example.com',
  'example.org',
  // Vlastní domény — interní odkazy ověřuje validate-content / build, ne tenhle
  // externí audit (a /clanky/* řeší redirect route, takže by jen falešně padaly).
  'hodinarium-eu.pages.dev',
  'horologie-cz.pages.dev',
  'hodinarium.eu',
  'www.hodinarium.eu',
  'horologie.cz',
  'www.horologie.cz',
  'orloj.eu',
  'www.orloj.eu',
]);
/** RFC 1918 private IPs — skip (typicky lokální config v dev articles
 *  o Arduino/ESP, např. http://192.168.4.1 pro WiFi access point). */
const PRIVATE_IP_RE = /^(?:127\.|10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/;

// ── Step 1: Collect URLs ─────────────────────────────────────────

// Source struct: { file, context, field } — kde byl URL nalezen.
// urlMap: Map<url, { sources: Array<Source> }>
const urlMap = new Map();

function addUrl(url, file, context, field) {
  // Normalize: trim, lowercase host, strip fragments
  let normalized = url.trim();
  if (!/^https?:\/\//i.test(normalized)) return;
  // Skip query strings v dedup keyu (často tracking) — ale zachováme původní URL pro display
  let displayUrl = normalized;
  // Strip trailing SENTENCE punctuation (bare URLs často končí větným znaménkem).
  displayUrl = displayUrl.replace(/[.,;:!?]+$/, '');
  // Trailing ) nebo ] uřízni JEN když je nevyvážená (markdown bare-URL artefakt).
  // NESMÍ uříznout balanced závorku, která je součástí URL (Wikipedia hesla typu
  // …/Ostrov_(okres_Karlovy_Vary)) — extractMarkdownLinkUrls je vrací správně.
  while (/[)\]]$/.test(displayUrl)) {
    const opens = (displayUrl.match(/[([]/g) || []).length;
    const closes = (displayUrl.match(/[)\]]/g) || []).length;
    if (closes > opens) displayUrl = displayUrl.slice(0, -1);
    else break;
  }
  try {
    const u = new URL(displayUrl);
    if (SKIP_DOMAINS.has(u.hostname)) return;
    if (u.hostname.endsWith('.local')) return;
    if (PRIVATE_IP_RE.test(u.hostname)) return;
  } catch {
    return;
  }
  if (!urlMap.has(displayUrl)) {
    urlMap.set(displayUrl, { sources: [] });
  }
  urlMap.get(displayUrl).sources.push({ file, context, field });
}

async function* walkMd(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (e.name.startsWith('.') || e.name.startsWith('_')) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walkMd(p);
    else if (e.isFile() && (p.endsWith('.md') || p.endsWith('.mdx'))) yield p;
  }
}

function parseFrontmatter(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return { fm: null, body: content };
  try {
    return { fm: yaml.parse(m[1]), body: m[2] };
  } catch {
    return { fm: null, body: m[2] };
  }
}

/** Extract URL z markdown linku `[text](url)` s podporou vnořených
 *  závorek v URL části (např. Wikipedia heslo
 *  `[Ostrov](https://cs.wikipedia.org/wiki/Ostrov_(okres_Karlovy_Vary))`).
 *  Counter-balanced paren matching: každá `(` v URL musí být balanced
 *  s `)`, jinak je to closing paren markdown linku. */
function extractMarkdownLinkUrls(body, file) {
  let i = 0;
  while (i < body.length) {
    const start = body.indexOf('](', i);
    if (start < 0) break;
    // Najdi začátek `[text]` (zpětně, max 200 chars)
    let textStart = start - 1;
    let depth = 1;
    while (textStart >= 0 && depth > 0) {
      if (body[textStart] === ']') depth++;
      else if (body[textStart] === '[') depth--;
      if (depth === 0) break;
      textStart--;
    }
    if (textStart < 0) { i = start + 2; continue; }
    // URL začíná za `](`
    const urlStart = start + 2;
    let urlEnd = urlStart;
    let parens = 0;
    while (urlEnd < body.length) {
      const c = body[urlEnd];
      if (c === '(') parens++;
      else if (c === ')') {
        if (parens === 0) break;
        parens--;
      } else if (c === '\n' || c === ' ') break;
      urlEnd++;
    }
    const url = body.slice(urlStart, urlEnd);
    if (/^https?:\/\//i.test(url)) {
      const ctx = body.slice(Math.max(0, textStart - 30), urlEnd + 30).replace(/\s+/g, ' ');
      addUrl(url, file, ctx, 'body:link');
    }
    i = urlEnd + 1;
  }
}

function extractBodyUrls(body, file) {
  extractMarkdownLinkUrls(body, file);
  let m;
  // <url>
  const re2 = /<(https?:\/\/[^>\s]+)>/g;
  while ((m = re2.exec(body)) !== null) {
    const ctx = body.slice(Math.max(0, m.index - 30), m.index + m[0].length + 30).replace(/\s+/g, ' ');
    addUrl(m[1], file, ctx, 'body:autolink');
  }
  // bare URLs (after `Dostupné z:` etc.) — match http(s)://... až po whitespace/punct
  const re3 = /(?<![("[<])(https?:\/\/[^\s)<>"]+)/g;
  while ((m = re3.exec(body)) !== null) {
    // Skip if it's already inside a markdown link (rough heuristic)
    const before = body.slice(Math.max(0, m.index - 5), m.index);
    if (/]\s*\($/.test(before) || /<$/.test(before)) continue;
    const ctx = body.slice(Math.max(0, m.index - 30), m.index + m[0].length + 30).replace(/\s+/g, ' ');
    addUrl(m[1], file, ctx, 'body:bare');
  }
}

function extractFrontmatterUrls(fm, file, prefix = 'fm') {
  if (!fm) return;
  for (const [key, val] of Object.entries(fm)) {
    const path = `${prefix}:${key}`;
    if (typeof val === 'string') {
      if (/^https?:\/\//i.test(val)) addUrl(val, file, val.slice(0, 80), path);
    } else if (Array.isArray(val)) {
      val.forEach((item, idx) => {
        if (typeof item === 'string' && /^https?:\/\//i.test(item)) {
          addUrl(item, file, item.slice(0, 80), `${path}[${idx}]`);
        } else if (item && typeof item === 'object') {
          extractFrontmatterUrls(item, file, `${path}[${idx}]`);
        }
      });
    } else if (val && typeof val === 'object') {
      extractFrontmatterUrls(val, file, path);
    }
  }
}

console.error('Scanning content/ for URLs…');
const dirs = ['content/hodinarium-eu', 'content/hodinari', 'content/kroky', 'content/slovnik', 'content/soupis-veznich-hodin', 'content/kronika', 'content/horologie-cz'];
for (const dir of dirs) {
  for await (const file of walkMd(join(ROOT, dir))) {
    const rel = relative(ROOT, file);
    const content = await readFile(file, 'utf-8');
    const { fm, body } = parseFrontmatter(content);
    if (fm) extractFrontmatterUrls(fm, rel);
    extractBodyUrls(body, rel);
  }
}

let allUrls = [...urlMap.keys()];
console.error(`Found ${allUrls.length} unique URLs in ${dirs.length} content dirs.`);
if (LIMIT > 0) {
  allUrls = allUrls.slice(0, LIMIT);
  console.error(`(limited to first ${LIMIT})`);
}

// ── Step 2: HTTP check (concurrent, throttled) ───────────────────

async function checkUrl(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    let r = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { 'User-Agent': 'CSH-deadlink-audit/1.0 (https://hodinarium.eu)' },
    });
    // Some servers don't support HEAD — fallback to GET
    if (r.status === 405 || r.status === 501) {
      r = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: ctrl.signal,
        headers: { 'User-Agent': 'CSH-deadlink-audit/1.0 (https://hodinarium.eu)' },
      });
    }
    clearTimeout(timer);
    return { ok: r.status < 400, status: r.status, finalUrl: r.url };
  } catch (e) {
    clearTimeout(timer);
    return { ok: false, status: 0, error: e.name === 'AbortError' ? 'timeout' : e.message };
  }
}

async function checkUrlWithRetry(url) {
  let r = await checkUrl(url);
  if (r.ok) return r;
  // Network errors (status 0 = fetch threw / timeout / bot-block) jsou často
  // FALSE-POSITIVE u živých webů (pomalá odezva, blokace UA). Zkus 2× navíc
  // s prodlevou, ať se status-0 nehlásí jako dead zbytečně.
  for (let attempt = 0; attempt < 2 && r.status === 0; attempt++) {
    await new Promise((res) => setTimeout(res, 800 * (attempt + 1)));
    r = await checkUrl(url);
    if (r.ok) return r;
  }
  return r;
}

async function processInBatches(items, fn, concurrency) {
  const results = new Array(items.length);
  let idx = 0;
  let done = 0;
  async function worker() {
    while (true) {
      const i = idx++;
      if (i >= items.length) return;
      results[i] = await fn(items[i]);
      done++;
      if (done % 25 === 0 || done === items.length) {
        process.stderr.write(`\r  Checked ${done}/${items.length}…`);
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  process.stderr.write('\n');
  return results;
}

console.error('Checking HTTP status (concurrency 10)…');
const checkResults = await processInBatches(allUrls, checkUrlWithRetry, CONCURRENCY);

// ── Step 3: Wayback Machine fallback for dead URLs ───────────────

async function checkWayback(url) {
  if (SKIP_WBM) return null;
  const api = `https://archive.org/wayback/available?url=${encodeURIComponent(url)}`;
  try {
    const r = await fetch(api, { signal: AbortSignal.timeout(15_000) });
    if (!r.ok) return null;
    const data = await r.json();
    const closest = data.archived_snapshots?.closest;
    if (!closest?.available) return null;
    return {
      url: closest.url,
      timestamp: closest.timestamp,
      status: closest.status,
    };
  } catch (e) {
    return null;
  }
}

const findings = [];
const deadUrls = [];        // genuine 4xx/5xx — kandidáti na ⚠ marker
const unverifiedUrls = [];  // status 0 (network/timeout/bot-block) — NEoznačovat

allUrls.forEach((url, i) => {
  const r = checkResults[i];
  const sources = urlMap.get(url).sources;
  const finding = {
    url,
    status: r.status,
    error: r.error,
    finalUrl: r.finalUrl,
    ok: r.ok,
    sources,
    wayback: null,
  };
  findings.push(finding);
  if (r.ok) return;
  // Jen skutečný HTTP error (4xx/5xx) = dead k označení. Status 0 (síťová chyba,
  // timeout, blokace bota) je často FALSE-POSITIVE u živých webů → "unverified",
  // hlásí se zvlášť k ručnímu ověření, NEoznačuje se markerem.
  if (r.status >= 400) deadUrls.push(finding);
  else unverifiedUrls.push(finding);
});

console.error(`Live: ${findings.filter((f) => f.ok).length}, Dead (4xx/5xx): ${deadUrls.length}, Unverified (status 0): ${unverifiedUrls.length}`);

if (deadUrls.length > 0 && !SKIP_WBM) {
  console.error('Querying Wayback Machine for dead URLs…');
  const wbm = await processInBatches(
    deadUrls.map((f) => f.url),
    checkWayback,
    5,
  );
  deadUrls.forEach((f, i) => { f.wayback = wbm[i]; });
}

// ── Step 4: Output reports ───────────────────────────────────────

const today = new Date().toISOString().slice(0, 10);
await mkdir(join(ROOT, 'tmp'), { recursive: true });
const jsonPath = join(ROOT, 'tmp', `dead-links-${today}.json`);

const summary = {
  generatedAt: new Date().toISOString(),
  scannedDirs: dirs,
  totalUrls: allUrls.length,
  liveCount: findings.filter((f) => f.ok).length,
  deadCount: deadUrls.length,
  unverifiedCount: unverifiedUrls.length,
  withWaybackCount: deadUrls.filter((f) => f.wayback).length,
  unverifiedUrls: unverifiedUrls.map((f) => ({ url: f.url, error: f.error, sources: f.sources })),
  findings,
};

await writeFile(jsonPath, JSON.stringify(summary, null, 2) + '\n');
console.error(`✓ JSON report: ${relative(ROOT, jsonPath)}`);

/**
 * Pro Sveltia editor (A.21 V2 follow-up): kompaktní index dead links
 * per file path, načtený přes `csh-dead-links.js` widget v editoru.
 *
 * Pouze dead URLs (ne full findings), seskupené per source file.
 * Lehčí než full JSON (filter pro per-article view).
 */
const editorIndexPath = join(ROOT, 'apps/hodinarium-eu/public/admin/dead-links-latest.json');
await mkdir(dirname(editorIndexPath), { recursive: true });
const byFileIndex = {};
for (const f of deadUrls) {
  for (const s of f.sources) {
    if (!byFileIndex[s.file]) byFileIndex[s.file] = [];
    byFileIndex[s.file].push({
      url: f.url,
      status: f.status,
      error: f.error,
      context: s.context,
      field: s.field,
      wayback: f.wayback,
    });
  }
}
const editorIndex = {
  generatedAt: summary.generatedAt,
  deadCount: summary.deadCount,
  withWaybackCount: summary.withWaybackCount,
  byFile: byFileIndex,
};
await writeFile(editorIndexPath, JSON.stringify(editorIndex, null, 2) + '\n');
console.error(`✓ Sveltia editor index: ${relative(ROOT, editorIndexPath)} (${Object.keys(byFileIndex).length} souborů s dead links)`);

// Marker input pro rehype-deadlink (body odkazy) + Article.astro (references):
// JEN genuine dead (HTTP 4xx/5xx). Status-0 (unverified) se NEoznačuje — bývá
// false-positive u živých webů (viz report). Hand-curaci REPLACE/REMOVE řeší
// editor zvlášť; tenhle soubor jen vizuálně flagne ⚠.
const markerPath = join(ROOT, 'apps/hodinarium-eu/src/data/dead-links.json');
const markerData = {
  _meta: {
    generated: today,
    count: deadUrls.length,
    description:
      'Genuine dead (HTTP 4xx/5xx) externí odkazy z auditu scripts/audit-dead-links.mjs. '
      + 'Vyloučeno: vlastní domény, status-0 (unverified — viz docs/dead-links-audit-*.md), '
      + 'web.archive.org. Rehype-deadlink (body) + Article.astro (references) flagnou ⚠. '
      + 'Po opravě/odstranění odkazu re-run `pnpm deadlinks:audit`.',
  },
  urls: deadUrls.map((f) => f.url).sort((a, b) => a.localeCompare(b)),
};
await writeFile(markerPath, JSON.stringify(markerData, null, 2) + '\n');
console.error(`✓ Marker input: ${relative(ROOT, markerPath)} (${deadUrls.length} dead URLs)`);

if (JSON_ONLY) {
  console.log(JSON.stringify(summary, null, 2));
  process.exit(0);
}

// Markdown report
const mdLines = [
  `# Dead-link audit — ${today}`,
  '',
  `Vygenerováno skriptem \`scripts/audit-dead-links.mjs\` ${new Date().toISOString().replace(/\.\d+Z$/, 'Z')}.`,
  '',
  '## Souhrn',
  '',
  `- **Skenované adresáře:** ${dirs.length} (${dirs.join(', ')})`,
  `- **Unikátních URL:** ${allUrls.length}`,
  `- **Funkční (2xx/3xx):** ${summary.liveCount}`,
  `- **Mrtvé / nedostupné:** ${summary.deadCount}`,
  `- **Z toho s Wayback Machine snapshotem:** ${summary.withWaybackCount}`,
  '',
  '## Pro editora',
  '',
  'Pro každý mrtvý odkaz níže vyberte:',
  '',
  '- **REPLACE → Wayback** — nahradit URL za Wayback Machine snapshot (pokud existuje a obsah je zachován)',
  '- **REPLACE → ekvivalent** — najít aktuální zdroj se stejným obsahem (např. archived → původní web v nové struktuře)',
  '- **REMOVE** — odstranit odkaz (jeho obsah už není relevantní)',
  '',
  '---',
  '',
];

if (deadUrls.length === 0) {
  mdLines.push('🎉 **Žádné mrtvé odkazy nenalezeny.** Všechny external URLs vrací 2xx/3xx.');
} else {
  // Group by source file
  const byFile = new Map();
  for (const f of deadUrls) {
    for (const s of f.sources) {
      if (!byFile.has(s.file)) byFile.set(s.file, []);
      byFile.get(s.file).push({ ...f, source: s });
    }
  }
  mdLines.push(`## Mrtvé odkazy (${deadUrls.length} unikátních URL ve ${byFile.size} souborech)`);
  mdLines.push('');

  const sortedFiles = [...byFile.keys()].sort();
  for (const file of sortedFiles) {
    const items = byFile.get(file);
    mdLines.push(`### \`${file}\``);
    mdLines.push('');
    for (const it of items) {
      const statusLabel = it.status === 0 ? `network error: ${it.error}` : `HTTP ${it.status}`;
      mdLines.push(`- **${statusLabel}** — ${it.url}`);
      mdLines.push(`  - Pole: \`${it.source.field}\``);
      if (it.source.context) {
        mdLines.push(`  - Kontext: …${it.source.context.slice(0, 120).replace(/`/g, '')}…`);
      }
      if (it.wayback) {
        mdLines.push(`  - 📦 **Wayback Machine snapshot:** ${it.wayback.url} (${it.wayback.timestamp})`);
      } else if (!SKIP_WBM) {
        mdLines.push(`  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE`);
      }
      mdLines.push(`  - Rozhodnutí: _REPLACE / REMOVE — doplň_`);
      mdLines.push('');
    }
  }
}

// Unverified (status 0) — neoznačovat, ale dát editorovi k ručnímu ověření.
if (unverifiedUrls.length > 0) {
  mdLines.push('', '---', '');
  mdLines.push(`## Neověřené (status 0 — síť/timeout/blokace, ${unverifiedUrls.length})`);
  mdLines.push('');
  mdLines.push('Tyto URL neodpověděly (network error / timeout / blokace bota). Často jsou');
  mdLines.push('**živé** — ověřit ručně v prohlížeči, NEoznačovat automaticky markerem.');
  mdLines.push('');
  for (const f of unverifiedUrls.sort((a, b) => a.url.localeCompare(b.url))) {
    mdLines.push(`- ${f.url} _(${f.error || 'network error'})_`);
  }
}

await mkdir(join(ROOT, 'docs'), { recursive: true });
const mdPath = join(ROOT, 'docs', `dead-links-audit-${today}.md`);
await writeFile(mdPath, mdLines.join('\n'));
console.error(`✓ Markdown report: ${relative(ROOT, mdPath)}`);

console.error('');
console.error(`Hotovo. ${summary.deadCount} mrtvých (4xx/5xx) + ${summary.unverifiedCount} neověřených (status 0) z ${allUrls.length} URL.`);
