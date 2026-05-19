#!/usr/bin/env node
/**
 * recover-iframes.mjs — najde iframe tagy v raw/hodinarium-eu/pages/*.html
 * které chybí v content/hodinarium-eu/<slug>.md a vypíše plán patche.
 *
 * Issue #18 follow-up. Turndown defaultně vyhazuje <iframe> při HTML→MD
 * konverzi (`scripts/convert-hodinarium.ts` má teď preserveIframe rule —
 * budoucí re-konverze už nenastane, ale historické články jsou bez iframů).
 *
 * Použití:
 *   node scripts/recover-iframes.mjs               # report (read-only)
 *   node scripts/recover-iframes.mjs --apply       # provede patch (idempotent)
 *
 * Patch strategy:
 *   - Pokud raw HTML obsahuje <iframe …src="…"> a markdown ne, vloží iframe
 *     blok na konec markdownu jako MDX raw HTML (`<iframe …>`).
 *   - YouTube embedy → <iframe>, ne <Video src=…> komponent (jednodušší).
 *   - Pokud src je relativní (např. zid.php), nechá to být — uživatel
 *     musí ručně rozhodnout zda komponentizovat nebo zrcadlit do /public.
 *
 * SEZNAM cílových slugů z issue #18 / komentu maintainera.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RAW_DIR = join(ROOT, 'raw/hodinarium-eu/pages');
const CONTENT_DIR = join(ROOT, 'content/hodinarium-eu');

// Slug = raw HTML basename, markdown filename = slug + .md.
// Některé legacy slugy mají snake_case nebo CamelCase, markdown je teď kebab-case
// (po D6 2026-05-10) → mapping potřeba.
// Mapping. `mdDir` defaultně CONTENT_DIR; pro Kroniky / jiné collections override.
// Slugy po D6 standardizaci (2026-05) — kebab-case + occasional .mdx extension.
const TARGETS = [
  { raw: 'Arduino',                md: 'arduino',                ext: 'mdx' },
  { raw: 'Arduino_IBM',            md: 'arduino-ibm',            ext: 'md' },
  { raw: 'PRS10',                  md: 'prs10',                  ext: 'mdx' },
  { raw: 'TimeSlider',             md: 'timeslider',             ext: null }, // chybí — vytvořit?
  { raw: 'fake_atomove_hodiny',    md: 'fake-atomove-hodiny',    ext: 'mdx' },
  { raw: 'mindelheim',             md: 'mindelheim',             ext: 'mdx' },
  { raw: '12_24',                  md: 'hodinky-12-24-ciferniku', ext: 'md' },
  { raw: 'cas_internet2',          md: 'cas-internet2',          ext: 'md' },
  { raw: 'segmentovky_s_prekladem', md: 'segmentovky-s-prekladem', ext: 'mdx' },
  { raw: 'tabor',                  md: 'tabor',                  ext: 'mdx' },
  { raw: 'sezona2012',             md: 'sezona2012',             ext: 'md', mdDir: 'content/kronika' },
  { raw: 'sezona2013',             md: 'sezona2013',             ext: 'md', mdDir: 'content/kronika' },
];

const apply = process.argv.includes('--apply');

function extractIframes(html) {
  const out = [];
  // <iframe ...>...</iframe>  nebo  <iframe ... />
  const re = /<iframe\b[^>]*?(?:\s*\/>|>[\s\S]*?<\/iframe>)/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    out.push(m[0]);
  }
  return out;
}

function normalizeIframe(raw) {
  // Drop title-bar attributes / inline styles legacy; ponech src + width/height.
  const src = /\bsrc=["']([^"']+)["']/i.exec(raw)?.[1];
  const width = /\bwidth=["']?(\d+)/i.exec(raw)?.[1];
  const height = /\bheight=["']?(\d+)/i.exec(raw)?.[1];
  if (!src) return raw;
  const parts = [`<iframe src="${src}"`];
  if (width) parts.push(`width="${width}"`);
  if (height) parts.push(`height="${height}"`);
  parts.push(`loading="lazy"`, `allowfullscreen></iframe>`);
  return parts.join(' ');
}

async function processOne({ raw, md, ext, mdDir }) {
  if (!ext) {
    return { slug: md, status: 'skipped_no_md_yet' };
  }
  const rawPath = join(RAW_DIR, `${raw}.html`);
  const mdPath = join(ROOT, mdDir ?? 'content/hodinarium-eu', `${md}.${ext}`);
  let rawHtml, markdown;
  try {
    rawHtml = await readFile(rawPath, 'utf-8');
  } catch {
    return { slug: md, status: 'raw_missing', detail: rawPath };
  }
  try {
    markdown = await readFile(mdPath, 'utf-8');
  } catch {
    return { slug: md, status: 'md_missing', detail: mdPath };
  }

  const rawIframes = extractIframes(rawHtml);
  if (rawIframes.length === 0) {
    return { slug: md, status: 'no_iframe_in_raw', count: 0 };
  }
  // Filter out chrome iframes (analytics, social) + about:blank placeholdery.
  const relevant = rawIframes.filter((f) => {
    const src = /\bsrc=["']([^"']+)["']/i.exec(f)?.[1] ?? '';
    if (!src || src === 'about:blank') return false;
    return !/google-analytics|facebook|tagmanager|doubleclick/i.test(src);
  });
  if (relevant.length === 0) {
    return { slug: md, status: 'only_tracking_iframes', count: rawIframes.length };
  }

  const mdIframeCount = (markdown.match(/<iframe\b/g) || []).length;
  if (mdIframeCount >= relevant.length) {
    return { slug: md, status: 'already_has_iframes', md: mdIframeCount, raw: relevant.length };
  }

  // Vyber iframey k vložení — ty které markdown ještě nemá (path match).
  // Plus skip YouTube embedy, pro něž je v markdownu ::youtube{id="…"} direktiv
  // (vyřeší duplikáty na mindelheim, arduino).
  const mdSrcs = new Set(
    [...markdown.matchAll(/<iframe[^>]*\bsrc=["']([^"']+)["']/gi)].map((m) => m[1])
  );
  const mdYoutubeIds = new Set(
    [...markdown.matchAll(/::youtube\{[^}]*\bid=["']([^"']+)["']/gi)].map((m) => m[1])
  );
  function extractYoutubeId(src) {
    const m = /youtube\.com\/embed\/([^?&"']+)/i.exec(src);
    return m ? m[1] : null;
  }
  const toAdd = relevant.filter((f) => {
    const src = /\bsrc=["']([^"']+)["']/i.exec(f)?.[1] ?? '';
    if (mdSrcs.has(src)) return false;
    const ytid = extractYoutubeId(src);
    if (ytid && mdYoutubeIds.has(ytid)) return false;
    return true;
  });

  if (toAdd.length === 0) {
    return { slug: md, status: 'already_complete', md: mdIframeCount, raw: relevant.length };
  }

  if (!apply) {
    return {
      slug: md,
      status: 'would_add',
      count: toAdd.length,
      iframes: toAdd.map(normalizeIframe),
    };
  }

  // Vlož iframy na konec markdownu jako vlastní sekce.
  const normalized = toAdd.map(normalizeIframe);
  const block = `\n\n## Vložené komponenty\n\n${normalized.join('\n\n')}\n`;
  await writeFile(mdPath, markdown.trimEnd() + block + '\n');
  return { slug: md, status: 'patched', count: toAdd.length };
}

async function main() {
  console.log(apply ? '## Apply mode\n' : '## Dry-run (use --apply to patch)\n');
  let patched = 0;
  let needsManual = 0;
  for (const t of TARGETS) {
    const r = await processOne(t);
    const summary = r.iframes ? `${r.status} (${r.count}: ${r.iframes.map((i) => i.slice(0, 60)).join(', …')})` : r.status;
    console.log(`  ${r.slug.padEnd(28)} → ${summary}`);
    if (r.status === 'patched' || r.status === 'would_add') patched++;
    if (r.status === 'raw_missing' || r.status === 'md_missing') needsManual++;
  }
  console.log(`\nHotovo: ${patched} patchovat${apply ? 'eno' : 'ných'}, ${needsManual} vyžaduje manuální dohledání souborů.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
