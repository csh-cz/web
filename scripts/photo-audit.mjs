#!/usr/bin/env node
/**
 * Fáze 0: Audit fotografií napříč repem — kde jsou, jak jsou referencovány,
 * kolik z nich má strukturovanou atribuci (credit/author/license).
 *
 * Run: node scripts/photo-audit.mjs [--json] [--verbose]
 * Output:
 *   - Lidsky čitelný markdown report do stdout
 *   - JSON do /tmp/photo-audit.json (s --json flagem)
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');

const VERBOSE = process.argv.includes('--verbose');
const JSON_OUTPUT = process.argv.includes('--json');

// =====================================================================
// 1. Glob filesystem — všechny image soubory v public/img/
// =====================================================================

function walkSync(dir, exts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']) {
  const results = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      results.push(...walkSync(full, exts));
    } else if (e.isFile()) {
      const lower = e.name.toLowerCase();
      if (exts.some((ext) => lower.endsWith(ext))) {
        results.push(full);
      }
    }
  }
  return results;
}

const filesystemImages = {};
for (const app of ['hodinarium-eu', 'horologie-cz']) {
  const imgDir = join(REPO_ROOT, 'apps', app, 'public', 'img');
  const files = walkSync(imgDir);
  for (const f of files) {
    // Klíč = path tak jak by se odkazoval v MDX (relative to public/, with leading /)
    const rel = '/img/' + relative(imgDir, f);
    if (!filesystemImages[rel]) filesystemImages[rel] = { apps: new Set(), absolute: f, sizeBytes: 0 };
    filesystemImages[rel].apps.add(app);
    try {
      filesystemImages[rel].sizeBytes = statSync(f).size;
    } catch {}
  }
}

const totalFsImages = Object.keys(filesystemImages).length;

// =====================================================================
// 2. Glob content/ — najít všechny image reference
// =====================================================================

const references = {
  inline: [],         // ![alt](src)
  frontmatterFoto: [],// foto: [{ src, alt, credit, ... }]
  frontmatterPortret: [], // portret: '/img/...'
  frontmatterHero: [],    // hero: { src, alt, caption, credit }
  frontmatterObrazek: [], // obrazek: { src, alt, caption, credit }
  frontmatterOg: [],      // ogImage, thumbnail
};

function listMarkdownFiles(dir) {
  const results = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      results.push(...listMarkdownFiles(full));
    } else if (e.isFile() && (e.name.endsWith('.md') || e.name.endsWith('.mdx'))) {
      results.push(full);
    }
  }
  return results;
}

const contentDir = join(REPO_ROOT, 'content');
const contentFiles = listMarkdownFiles(contentDir);

const INLINE_IMG_RE = /!\[([^\]]*)\]\((\/img\/[^)\s]+)(?:\s+"([^"]*)")?\)/g;
const FOTO_BLOCK_START = /^foto:\s*$/m;

function splitFrontmatter(content) {
  if (!content.startsWith('---\n')) return { fm: null, body: content };
  const end = content.indexOf('\n---', 4);
  if (end < 0) return { fm: null, body: content };
  return { fm: content.slice(4, end), body: content.slice(end + 4) };
}

for (const file of contentFiles) {
  let text;
  try {
    text = readFileSync(file, 'utf-8');
  } catch {
    continue;
  }
  const relFile = relative(REPO_ROOT, file);
  const { fm, body } = splitFrontmatter(text);

  // 2.a — Inline markdown images v body
  let m;
  while ((m = INLINE_IMG_RE.exec(body)) !== null) {
    references.inline.push({
      file: relFile,
      alt: m[1],
      src: m[2],
      title: m[3] ?? null,
    });
  }

  if (!fm) continue;

  // 2.b — frontmatter foto: list (typically v soupis-veznich-hodin)
  // Velmi naivní parse: hledáme `foto:` start a podsekvenční bloky `- src: ...`
  const fotoBlockMatch = fm.match(/^foto:\s*\n((?:[ \t]+-?[ \t]+.+\n?)+)/m);
  if (fotoBlockMatch) {
    const block = fotoBlockMatch[1];
    // Rozdělit na entries (každý začíná `- src:` nebo `  - src:`)
    const entries = block.split(/\n(?=\s*-\s+src:)/);
    for (const entry of entries) {
      const srcMatch = entry.match(/src:\s*["']?([^"'\n]+)["']?/);
      const altMatch = entry.match(/alt:\s*["']?([^"'\n]+)["']?/);
      const creditMatch = entry.match(/credit:\s*["']?([^"'\n]+)["']?/);
      const typMatch = entry.match(/typ:\s*["']?([^"'\n]+)["']?/);
      if (srcMatch) {
        references.frontmatterFoto.push({
          file: relFile,
          src: srcMatch[1].trim(),
          alt: altMatch?.[1]?.trim() ?? null,
          credit: creditMatch?.[1]?.trim() ?? null,
          typ: typMatch?.[1]?.trim() ?? null,
        });
      }
    }
  }

  // 2.c — portret: '/img/...' (hodinari)
  const portretMatch = fm.match(/^portret:\s*["']?([^"'\n]+)["']?/m);
  if (portretMatch) {
    const credit = fm.match(/^portretCredit:\s*["']?([^"'\n]+)["']?/m)?.[1]?.trim() ?? null;
    const source = fm.match(/^portretSource:\s*["']?([^"'\n]+)["']?/m)?.[1]?.trim() ?? null;
    references.frontmatterPortret.push({
      file: relFile,
      src: portretMatch[1].trim(),
      credit,
      source,
    });
  }

  // 2.d — hero: { src, alt, caption, credit }
  const heroSrcMatch = fm.match(/^hero:[\s\S]*?\n[ \t]+src:\s*["']?([^"'\n]+)["']?/m);
  if (heroSrcMatch) {
    const credit = fm.match(/^hero:[\s\S]*?\n[ \t]+credit:\s*["']?([^"'\n]+)["']?/m)?.[1]?.trim() ?? null;
    references.frontmatterHero.push({
      file: relFile,
      src: heroSrcMatch[1].trim(),
      credit,
    });
  }

  // 2.e — obrazek: { ... } (slovnik)
  const obrazekSrcMatch = fm.match(/^obrazek:[\s\S]*?\n[ \t]+src:\s*["']?([^"'\n]+)["']?/m);
  if (obrazekSrcMatch) {
    const credit = fm.match(/^obrazek:[\s\S]*?\n[ \t]+credit:\s*["']?([^"'\n]+)["']?/m)?.[1]?.trim() ?? null;
    references.frontmatterObrazek.push({
      file: relFile,
      src: obrazekSrcMatch[1].trim(),
      credit,
    });
  }

  // 2.f — ogImage / thumbnail
  const ogMatch = fm.match(/^ogImage:\s*["']?([^"'\n]+)["']?/m);
  const thumbMatch = fm.match(/^thumbnail:\s*["']?([^"'\n]+)["']?/m);
  if (ogMatch) {
    references.frontmatterOg.push({ file: relFile, src: ogMatch[1].trim(), field: 'ogImage' });
  }
  if (thumbMatch) {
    references.frontmatterOg.push({ file: relFile, src: thumbMatch[1].trim(), field: 'thumbnail' });
  }
}

// =====================================================================
// 3. Cross-correlate — který image je referencován kde, který má credit
// =====================================================================

const allRefs = [
  ...references.inline.map((r) => ({ ...r, _type: 'inline-markdown', _hasCredit: false })),
  ...references.frontmatterFoto.map((r) => ({ ...r, _type: 'fm-foto', _hasCredit: !!r.credit })),
  ...references.frontmatterPortret.map((r) => ({ ...r, _type: 'fm-portret', _hasCredit: !!r.credit })),
  ...references.frontmatterHero.map((r) => ({ ...r, _type: 'fm-hero', _hasCredit: !!r.credit })),
  ...references.frontmatterObrazek.map((r) => ({ ...r, _type: 'fm-obrazek', _hasCredit: !!r.credit })),
  ...references.frontmatterOg.map((r) => ({ ...r, _type: 'fm-og-thumb', _hasCredit: false })),
];

// Decode URL-encoded paths (some markdown uses %20 for space)
function normalizeSrc(s) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

// Map: src → list of references
const refsBySrc = {};
for (const ref of allRefs) {
  const src = normalizeSrc(ref.src);
  if (!refsBySrc[src]) refsBySrc[src] = [];
  refsBySrc[src].push(ref);
}

const referencedSrcs = new Set(Object.keys(refsBySrc));

// Cross-check: file present in fs?
const orphanFs = [];        // soubor existuje, není v žádném MDX
const brokenRefs = [];      // MDX odkazuje na neexistující soubor
const refsWithCredit = [];
const refsWithoutCredit = [];

for (const src of referencedSrcs) {
  if (!filesystemImages[src]) {
    brokenRefs.push({ src, refs: refsBySrc[src] });
  }
  for (const ref of refsBySrc[src]) {
    if (ref._hasCredit) refsWithCredit.push(ref);
    else refsWithoutCredit.push(ref);
  }
}

for (const fsImg of Object.keys(filesystemImages)) {
  if (!referencedSrcs.has(fsImg)) {
    orphanFs.push(fsImg);
  }
}

// =====================================================================
// 4. Per-directory breakdown
// =====================================================================

function topLevelDir(src) {
  const m = src.match(/^\/img\/([^/]+)/);
  return m ? m[1] : '_root';
}

const fsImagesByDir = {};
for (const src of Object.keys(filesystemImages)) {
  const d = topLevelDir(src);
  fsImagesByDir[d] = (fsImagesByDir[d] || 0) + 1;
}

const refsByDir = {};
const creditByDir = {};
for (const src of referencedSrcs) {
  const d = topLevelDir(src);
  refsByDir[d] = (refsByDir[d] || 0) + 1;
  const hasCredit = refsBySrc[src].some((r) => r._hasCredit);
  if (hasCredit) creditByDir[d] = (creditByDir[d] || 0) + 1;
}

// =====================================================================
// 5. Report
// =====================================================================

const report = [];
report.push('# Photo Audit — Fáze 0\n');
report.push(`Date: ${new Date().toISOString()}\n`);
report.push('## Souhrn\n');
const tick = '`';
const fotoCol = references.frontmatterFoto.filter((r) => r.credit).length;
const portretCol = references.frontmatterPortret.filter((r) => r.credit).length;
const heroCol = references.frontmatterHero.filter((r) => r.credit).length;
const refsAnyCredit = Object.keys(refsBySrc).filter((s) => refsBySrc[s].some((r) => r._hasCredit)).length;
const refsOnlyInline = Object.keys(refsBySrc).filter((s) => refsBySrc[s].every((r) => r._type === 'inline-markdown')).length;

report.push('| Metrika | Hodnota |');
report.push('|---|---|');
report.push('| Fotek ve ' + tick + 'public/img/' + tick + ' | **' + totalFsImages + '** |');
report.push('| Markdown content souborů projet | ' + contentFiles.length + ' |');
report.push('| Refs inline markdown ' + tick + '![alt](src)' + tick + ' | ' + references.inline.length + ' |');
report.push('| Refs frontmatter ' + tick + 'foto:' + tick + ' blok | ' + references.frontmatterFoto.length + ' (s ' + tick + 'credit:' + tick + ' ' + fotoCol + ') |');
report.push('| Refs frontmatter ' + tick + 'portret:' + tick + ' | ' + references.frontmatterPortret.length + ' (s ' + tick + 'portretCredit:' + tick + ' ' + portretCol + ') |');
report.push('| Refs frontmatter ' + tick + 'hero:' + tick + ' | ' + references.frontmatterHero.length + ' (s ' + tick + 'credit:' + tick + ' ' + heroCol + ') |');
report.push('| Refs frontmatter ' + tick + 'ogImage/thumb' + tick + ' | ' + references.frontmatterOg.length + ' (atribuce N/A) |');
report.push('');
report.push('| **Unique image srcs referenced** | **' + referencedSrcs.size + '** |');
report.push('| z toho s credit info kdekoliv | ' + refsAnyCredit + ' |');
report.push('| z toho jen inline markdown (no credit) | ' + refsOnlyInline + ' |');
report.push('');
report.push('| **Orphan files** (v ' + tick + 'public/img/' + tick + ', ne v MDX) | **' + orphanFs.length + '** |');
report.push('| **Broken refs** (MDX odkazuje, soubor chybí) | **' + brokenRefs.length + '** |');
report.push('');

report.push('## Pokrytí atribucí podle adresáře\n');
report.push('| Adresář v /img/ | Files | Referenced | s credit | % atribuce |');
report.push('|---|---|---|---|---|');
const allDirs = new Set([...Object.keys(fsImagesByDir), ...Object.keys(refsByDir)]);
const dirRows = [...allDirs].sort();
for (const d of dirRows) {
  const fs = fsImagesByDir[d] || 0;
  const refs = refsByDir[d] || 0;
  const credit = creditByDir[d] || 0;
  const pct = refs > 0 ? Math.round((credit / refs) * 100) : 0;
  report.push(`| ${d} | ${fs} | ${refs} | ${credit} | ${pct}% |`);
}
report.push('');

report.push('## Distribuce typů referencí\n');
const typeCount = {};
for (const r of allRefs) {
  typeCount[r._type] = (typeCount[r._type] || 0) + 1;
}
for (const [t, c] of Object.entries(typeCount).sort((a, b) => b[1] - a[1])) {
  report.push(`- **${t}**: ${c}`);
}
report.push('');

if (brokenRefs.length > 0) {
  report.push('## Broken references (top 20)\n');
  for (const br of brokenRefs.slice(0, 20)) {
    report.push('- ' + tick + br.src + tick + ' — references in: ' + br.refs.map((r) => basename(r.file)).join(', '));
  }
  if (brokenRefs.length > 20) {
    report.push('- … +' + (brokenRefs.length - 20) + ' dalších');
  }
  report.push('');
}

if (orphanFs.length > 0) {
  report.push('## Orphan soubory (top 30 dle velikosti)\n');
  const topOrphans = orphanFs
    .map((s) => ({ src: s, size: filesystemImages[s].sizeBytes }))
    .sort((a, b) => b.size - a.size)
    .slice(0, 30);
  for (const o of topOrphans) {
    report.push('- ' + tick + o.src + tick + ' (' + (o.size / 1024).toFixed(0) + ' KB)');
  }
  report.push('');
}

report.push('## Doporučení\n');
const totalReferenced = referencedSrcs.size;
const totalWithCredit = Object.keys(refsBySrc).filter((s) => refsBySrc[s].some((r) => r._hasCredit)).length;
const creditCoverage = totalReferenced > 0 ? Math.round((totalWithCredit / totalReferenced) * 100) : 0;
report.push('- Atribuce coverage: **' + creditCoverage + '%** referencovaných fotek má strukturovanou credit info.');
report.push('- Markdown inline obrázků **' + references.inline.length + '** — žádná strukturovaná atribuce, jen alt text. To je hlavní problém k řešení.');
report.push('- Orphan soubory: **' + orphanFs.length + '** v ' + tick + 'public/img/' + tick + ' neexistují v MDX → kandidáty na archivaci nebo doplnění do MDX.');
report.push('- Broken refs: **' + brokenRefs.length + '** MDX referencí ukazuje na neexistující soubor → fix nutný.');
report.push('');

const finalReport = report.join('\n');
console.log(finalReport);

if (JSON_OUTPUT || process.env.PHOTO_AUDIT_JSON) {
  const jsonPath = '/tmp/photo-audit.json';
  const jsonData = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalFsImages,
      contentFilesScanned: contentFiles.length,
      uniqueReferencedSrcs: referencedSrcs.size,
      orphanFsCount: orphanFs.length,
      brokenRefsCount: brokenRefs.length,
      creditCoveragePercent: creditCoverage,
    },
    byType: typeCount,
    byDir: dirRows.map((d) => ({
      dir: d,
      files: fsImagesByDir[d] || 0,
      referenced: refsByDir[d] || 0,
      withCredit: creditByDir[d] || 0,
    })),
    brokenRefs,
    orphanFs,
    refsByType: references,
  };
  writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf-8');
  console.error(`\nJSON: ${jsonPath}`);
}
