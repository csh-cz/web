#!/usr/bin/env node
/**
 * D6 Slug standardizace — grep & replace všech inline odkazů.
 *
 * Po renamu souborů (scripts/d6-slug-rename-apply.mjs) je třeba projít
 * existující odkazy v markdown body, frontmatteru (relatedKarty, refs),
 * Astro src/, scripts/, data/ a doc/ a nahradit je novými slugy.
 *
 * Mapping je v `apps/hodinarium-eu/src/data/d6-slug-renames.json`.
 *
 * Patterns hledané:
 *   - markdown link: `](/clanky/<old>)`, `](/<kategorie>/<old>)`,
 *     `](/kronika/<old>)`, `](/sbirka/karta/<old>)`
 *   - bare URL: `https://hodinarium-eu.pages.dev/<kat>/<old>` (rare)
 *   - Astro / TS: `slug === '<old>'`, `slug: '<old>'` (jen v src/data/*.ts)
 *
 * Idempotentní (= replace existing → existing skip-no-change).
 */
import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { join, dirname, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..');

const data = JSON.parse(await readFile(join(ROOT, 'apps/hodinarium-eu/src/data/d6-slug-renames.json'), 'utf-8'));
const catalog = JSON.parse(await readFile(join(ROOT, 'apps/hodinarium-eu/src/data/catalog.json'), 'utf-8'));

// Build slug → kategorie map pro znovu-resolve (pro old slug to není v catalog,
// ale newId tam být musí)
const slugCat = new Map();
for (const e of catalog) slugCat.set(e.slug, { category: e.category, isKarta: e.podsekce === 'karta' });

// Build replace pairs
const replacements = []; // { from: RegExp, to: string }
for (const r of data.renames) {
  const cat = slugCat.get(r.newId);
  // Pro hodinarium-eu collection: build URL podle kategorie
  if (r.collection === 'hodinarium-eu') {
    if (!cat) continue;
    const newPath = cat.isKarta ? `/sbirka/karta/${r.newId}` : `/${cat.category}/${r.newId}`;
    const oldPaths = [
      `/clanky/${r.oldId}`,
      `/${cat.category}/${r.oldId}`,
    ];
    if (cat.isKarta) oldPaths.push(`/sbirka/karta/${r.oldId}`);
    for (const oldPath of oldPaths) {
      // Match ](path) nebo ](path/) nebo ](path#anchor) — escape regex special chars
      const escaped = oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      replacements.push({
        from: new RegExp(`(\\]\\()(${escaped})(/?)([)#?])`, 'g'),
        to: `$1${newPath}$3$4`,
      });
    }
  } else if (r.collection === 'kronika') {
    const oldPaths = [`/kronika/${r.oldId}`, `/clanky/${r.oldId}`];
    const newPath = `/kronika/${r.newId}`;
    for (const oldPath of oldPaths) {
      const escaped = oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      replacements.push({
        from: new RegExp(`(\\]\\()(${escaped})(/?)([)#?])`, 'g'),
        to: `$1${newPath}$3$4`,
      });
    }
  }
}

const SCAN_DIRS = [
  'content',
  'apps/hodinarium-eu/src',
  'apps/horologie-cz/src',
  'docs',
  'scripts',
];

const SKIP_DIRS = new Set(['node_modules', 'dist', '.astro', '_review', 'd6-slug-rename-preview.md']);
const TEXT_EXTS = new Set(['.md', '.mdx', '.ts', '.astro', '.json', '.mjs', '.js']);

let scanned = 0;
let changed = 0;
let totalReplaces = 0;

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.isFile() && TEXT_EXTS.has(extname(e.name))) yield p;
  }
}

for (const dir of SCAN_DIRS) {
  for await (const file of walk(join(ROOT, dir))) {
    scanned++;
    let content;
    try {
      content = await readFile(file, 'utf-8');
    } catch {
      continue;
    }
    let updated = content;
    let fileReplaces = 0;
    for (const { from, to } of replacements) {
      const before = updated;
      updated = updated.replace(from, to);
      if (updated !== before) {
        fileReplaces += (before.match(from) || []).length;
      }
    }
    if (fileReplaces > 0) {
      await writeFile(file, updated, 'utf-8');
      changed++;
      totalReplaces += fileReplaces;
      console.log(`  ${relative(ROOT, file)} (${fileReplaces} náhrad)`);
    }
  }
}

console.log('');
console.log(`✓ Scanned ${scanned} files`);
console.log(`✓ Changed ${changed} files`);
console.log(`✓ Total replacements: ${totalReplaces}`);
