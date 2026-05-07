#!/usr/bin/env node
// Sanity validation pro content/ — doplněk k astro check, který lapí
// vyšší vrstvy konzistence:
//
//   1) Duplicate frontmatter keys (např. dva `posledniOvereni:` v jednom souboru)
//   2) Broken hodinar slugs v soupis-veznich-hodin (hodinar: "X" → /hodinari/X.mdx)
//   3) Broken markdown links na /soupis-veznich-hodin/, /hodinari/
//   4) Slug konzistence (frontmatter `slug:` ?= filename)
//   5) Orphan relatedSlugs v hodinari.ts
//
// Exit kód: 0 = OK, 1 = found errors. Použij v CI nebo prebuild.
//
// Spuštění: `node scripts/validate-content.mjs` z root repa

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = path.join(ROOT, 'content');

let errors = 0;
const issues = { duplicateKeys: [], brokenHodinari: [], brokenLinks: [], slugMismatch: [], orphanRelated: [] };

// ── helper: list mdx/md files ──
function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (/\.(mdx|md)$/.test(entry.name)) out.push(p);
  }
  return out;
}

const allFiles = walk(CONTENT);

// ── all known slugs (filename-based) ──
const slugs = {
  soupis: new Set(fs.readdirSync(path.join(CONTENT, 'soupis-veznich-hodin')).filter(f => f.endsWith('.mdx')).map(f => f.replace(/\.mdx$/, ''))),
  hodinari: new Set(fs.readdirSync(path.join(CONTENT, 'hodinari')).filter(f => f.endsWith('.mdx')).map(f => f.replace(/\.mdx$/, ''))),
  articles: new Set(),
  kronika: new Set(fs.existsSync(path.join(CONTENT, 'kronika')) ? fs.readdirSync(path.join(CONTENT, 'kronika')).filter(f => /\.(mdx|md)$/.test(f)).map(f => f.replace(/\.(mdx|md)$/, '')) : []),
};
for (const dir of ['hodinarium-eu', 'horologie-cz']) {
  const d = path.join(CONTENT, dir);
  if (fs.existsSync(d)) {
    for (const f of walk(d)) slugs.articles.add(path.basename(f).replace(/\.(mdx|md)$/, ''));
  }
}

// Dynamicky načti slugy hodinových kroků z kroky.ts (single source of truth).
// Bez tohoto dynamic loadu by validace zlobila pokaždé když se přidá nový krok.
const krokySlugs = (() => {
  const krokyPath = path.join(ROOT, 'apps/hodinarium-eu/src/data/kroky.ts');
  if (!fs.existsSync(krokyPath)) return new Set(['index']);
  const txt = fs.readFileSync(krokyPath, 'utf8');
  const matches = [...txt.matchAll(/^\s*slug:\s*['"]([^'"]+)['"]/gm)];
  return new Set(['index', ...matches.map((m) => m[1])]);
})();

// Astro routes that aren't files
const validRoutes = {
  soupis: new Set(['mapa', 'index']),
  hodinari: new Set(['index']),
  articles: new Set(['katalog', 'index', 'mapa']),
  sbirka: new Set(['katalog', 'index']),
  kategorie: new Set(['index']),
  kroky: krokySlugs,
};

// ── 1) Duplicate frontmatter keys ──
function parseFrontmatterKeys(src, filePath) {
  const m = src.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return;
  const lines = m[1].split('\n');
  const seen = new Map();
  for (let i = 0; i < lines.length; i++) {
    const km = lines[i].match(/^([a-zA-Z][\w]*):/);
    if (km) {
      const key = km[1];
      if (seen.has(key)) {
        issues.duplicateKeys.push(`${filePath} duplicate key "${key}" at lines ${seen.get(key) + 2} and ${i + 2}`);
      } else {
        seen.set(key, i);
      }
    }
  }
}

// ── 2) Broken hodinar slugs ──
function checkHodinarRefs(src, filePath) {
  const m = src.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return;
  const fm = m[1];
  const hm = fm.match(/^hodinar:\s*"([\w-]+)"/m);
  if (hm) {
    const slug = hm[1];
    if (!slugs.hodinari.has(slug)) {
      issues.brokenHodinari.push(`${filePath} → hodinar: "${slug}" (chybí /hodinari/${slug}.mdx)`);
    }
  }
}

// ── 3) Broken markdown links ──
function checkLinks(src, filePath) {
  // Pattern A: /sbirka/karta/<slug> — explicit karta route
  // Pattern B: /<kategorie>/<slug> — dynamic kategorie route (sbirka, konstrukce, projekty, …)
  // Pattern C: /soupis-veznich-hodin/<slug>, /hodinari/<slug>, /kroky/<slug>
  const reA = /\]\(\/(soupis-veznich-hodin|hodinari|kroky)\/([\w-]+)\/?\)/g;
  const reB = /\]\(\/sbirka\/karta\/([\w-]+)\/?\)/g;
  const reC = /\]\(\/(sbirka|konstrukce|projekty|virtualni-muzeum|muzea|zajimavosti|hodinari|clanky)\/([\w-]+)\/?\)/g;
  for (const re of [reA]) {
    let mm;
    while ((mm = re.exec(src)) !== null) {
      const collection = mm[1];
      const slug = mm[2];
      let exists = false;
      if (collection === 'soupis-veznich-hodin') exists = slugs.soupis.has(slug) || validRoutes.soupis.has(slug);
      else if (collection === 'hodinari') exists = slugs.hodinari.has(slug) || validRoutes.hodinari.has(slug);
      else if (collection === 'kroky') exists = validRoutes.kroky.has(slug);
      if (!exists) {
        const lineNum = src.substring(0, mm.index).split('\n').length;
        issues.brokenLinks.push(`${filePath}:${lineNum} → /${collection}/${slug}`);
      }
    }
  }
  // Pattern B: /sbirka/karta/<slug>
  let mm2;
  reB.lastIndex = 0;
  while ((mm2 = reB.exec(src)) !== null) {
    const slug = mm2[1];
    if (!slugs.articles.has(slug)) {
      const lineNum = src.substring(0, mm2.index).split('\n').length;
      issues.brokenLinks.push(`${filePath}:${lineNum} → /sbirka/karta/${slug}`);
    }
  }
  // Pattern C: kategorie/<slug>
  reC.lastIndex = 0;
  let mm3;
  while ((mm3 = reC.exec(src)) !== null) {
    // Skip if matches sbirka/karta — handled above
    if (src.substring(mm3.index, mm3.index + 14) === '](/sbirka/karta') continue;
    const collection = mm3[1];
    const slug = mm3[2];
    if (collection === 'hodinari') continue; // handled by reA
    let exists = slugs.articles.has(slug);
    // Routes that aren't files
    if (collection === 'sbirka' && validRoutes.sbirka.has(slug)) exists = true;
    if (!exists) {
      const lineNum = src.substring(0, mm3.index).split('\n').length;
      issues.brokenLinks.push(`${filePath}:${lineNum} → /${collection}/${slug}`);
    }
  }
}

// ── 4) Slug konzistence ──
function checkSlugConsistency(src, filePath) {
  const m = src.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return;
  const sm = m[1].match(/^slug:\s*"([\w-]+)"/m);
  if (!sm) return;
  const slugInFm = sm[1];
  const slugFromName = path.basename(filePath).replace(/\.(mdx|md)$/, '');
  if (slugInFm !== slugFromName) {
    issues.slugMismatch.push(`${filePath} slug:"${slugInFm}" vs filename:"${slugFromName}"`);
  }
}

// Run checks
for (const f of allFiles) {
  const src = fs.readFileSync(f, 'utf8');
  const rel = path.relative(ROOT, f);
  parseFrontmatterKeys(src, rel);
  checkSlugConsistency(src, rel);
  if (rel.startsWith('content/soupis-veznich-hodin/')) checkHodinarRefs(src, rel);
  checkLinks(src, rel);
}

// ── 5) Orphan relatedSlugs in hodinari.ts ──
const tsFile = path.join(ROOT, 'apps/hodinarium-eu/src/data/hodinari.ts');
if (fs.existsSync(tsFile)) {
  const ts = fs.readFileSync(tsFile, 'utf8');
  const allValid = new Set([...slugs.articles, ...slugs.soupis, ...slugs.hodinari, ...slugs.kronika, ...validRoutes.kroky, 'mapa', 'katalog']);
  const entries = [...ts.matchAll(/\{\s*slug:\s*'([\w-]+)'(.*?)\n  \},/gs)];
  for (const [, slug, body] of entries) {
    const rsM = body.match(/relatedSlugs:\s*\[(.*?)\]/s);
    if (!rsM) continue;
    const refs = [...rsM[1].matchAll(/'([^']+)'/g)].map(m => m[1]);
    for (const ref of refs) {
      if (!allValid.has(ref)) {
        issues.orphanRelated.push(`hodinari.ts: ${slug} → '${ref}'`);
      }
    }
  }
}

// ── Report ──
const sections = [
  ['Duplicate frontmatter keys', issues.duplicateKeys],
  ['Broken hodinar slugs (hodinar: "X" → /hodinari/X.mdx chybí)', issues.brokenHodinari],
  ['Broken markdown links', issues.brokenLinks],
  ['Slug mismatch (frontmatter vs filename)', issues.slugMismatch],
  ['Orphan relatedSlugs v hodinari.ts', issues.orphanRelated],
];

const allBrokenLinksLegacy = issues.brokenLinks.filter(l => l.includes('/clanky/'));
const realBrokenLinks = issues.brokenLinks.filter(l => !l.includes('/clanky/'));

console.log('\n=== CONTENT VALIDATION REPORT ===\n');
for (const [name, list] of sections) {
  if (name === 'Broken markdown links') {
    console.log(`${name}: ${realBrokenLinks.length} (real) + ${allBrokenLinksLegacy.length} (legacy /clanky/* — z migrace)`);
    if (realBrokenLinks.length > 0) {
      for (const item of realBrokenLinks.slice(0, 30)) console.log(`  ${item}`);
      if (realBrokenLinks.length > 30) console.log(`  ... ${realBrokenLinks.length - 30} more`);
      errors += realBrokenLinks.length;
    }
  } else {
    console.log(`${name}: ${list.length}`);
    for (const item of list.slice(0, 30)) console.log(`  ${item}`);
    if (list.length > 30) console.log(`  ... ${list.length - 30} more`);
    if (name !== 'Broken markdown links') errors += list.length;
  }
  console.log();
}

if (errors > 0) {
  console.log(`❌ ${errors} issues found.\n`);
  process.exit(1);
} else {
  console.log(`✅ Content validation passed.\n`);
  process.exit(0);
}
