#!/usr/bin/env node
/**
 * Build cross-reference reverse map z forward crossRefs frontmatter.
 *
 * Naskenuje 6 content collections, vyextrahuje pole `crossRefs.<typ>` z
 * frontmatteru každého entry, a otočí směr: pro každý cíl ulož kdo na něj
 * odkazuje. Output: `apps/hodinarium-eu/src/data/cross-ref-reverse.json`.
 *
 * Struktura output:
 *   {
 *     "kroky": {
 *       "grahamuv-krok": {
 *         "karty": ["inv-42-svarcvald"],
 *         "soupis": ["1868-bychory-prokes"],
 *         "clanky": ["historie-graham"],
 *         "hodinari": ["vaclav-krecmer"]
 *       }
 *     },
 *     "hodinari": { ... },
 *     ...
 *   }
 *
 * Pre-build krok — pustí se před `astro build` přes pnpm prebuild (X.10 hook).
 * Lokálně manuálně: `pnpm refs:cross`.
 *
 * Validation (PBI X.10 zatím soft):
 *   - Warning pokud forward ref odkazuje na neexistující slug — log do
 *     stderr, ale build nezhasne. Strict mode (--strict) → exit 1.
 *
 * Single-value relace (soupis.hodinar, soupis.krok, karta.vyrobce) NEjsou
 * v reverse map — tu drží jen `crossRefs.*`. (Tyto se případně mergují
 * v renderingu, ale autoritativní reverse pochází z explicit crossRefs.)
 */
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..');

const STRICT = process.argv.includes('--strict');

/**
 * Mapping collection → directory + classifier function. Classifier
 * decides "type" — protože content/hodinarium-eu/ má jak karty tak články
 * (rozliš přes frontmatter.podsekce).
 */
const COLLECTIONS = [
  {
    name: 'hodinarium-eu',
    dir: 'content/hodinarium-eu',
    /** Returns 'karty' | 'clanky' podle frontmatter.podsekce, default 'clanky'. */
    classify: (fm) => (fm.podsekce === 'karta' ? 'karty' : 'clanky'),
  },
  {
    name: 'hodinari',
    dir: 'content/hodinari',
    classify: () => 'hodinari',
  },
  {
    name: 'kronika',
    dir: 'content/kronika',
    classify: () => 'kronika',
  },
  {
    name: 'soupis-veznich-hodin',
    dir: 'content/soupis-veznich-hodin',
    classify: () => 'soupis',
  },
  {
    name: 'kroky',
    dir: 'content/kroky',
    classify: () => 'kroky',
  },
  {
    name: 'slovnik',
    dir: 'content/slovnik',
    classify: () => 'slovnik',
  },
];

const REF_TYPES = ['kroky', 'hodinari', 'karty', 'clanky', 'soupis', 'slovnik', 'kronika'];

const OUT_PATH = join(ROOT, 'apps/hodinarium-eu/src/data/cross-ref-reverse.json');

/** Strip frontmatter z md/mdx, parse YAML, return { fm, body }. */
async function parseFrontmatter(filePath) {
  const txt = await readFile(filePath, 'utf-8');
  const m = txt.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return { fm: null, body: txt };
  try {
    const fm = parseYaml(m[1]);
    return { fm: fm ?? {}, body: txt.slice(m[0].length) };
  } catch (e) {
    console.warn(`[refs:cross] YAML parse error ${filePath}: ${e.message}`);
    return { fm: null, body: '' };
  }
}

/** Najdi všechny .md/.mdx soubory v adresáři. Vrací {slug, file, type, fm} per entry. */
async function loadCollection(coll) {
  const dir = join(ROOT, coll.dir);
  let entries;
  try {
    entries = await readdir(dir);
  } catch {
    console.warn(`[refs:cross] dir not found: ${coll.dir}, skip`);
    return [];
  }
  const out = [];
  for (const entry of entries) {
    const ext = extname(entry).toLowerCase();
    if (ext !== '.md' && ext !== '.mdx') continue;
    const file = join(dir, entry);
    const { fm } = await parseFrontmatter(file);
    if (!fm) continue;
    const slug = fm.slug ?? basename(entry, ext);
    const type = coll.classify(fm);
    out.push({ slug, file, type, fm });
  }
  return out;
}

async function main() {
  // 1) Load all entries z všech collections
  const allEntries = [];
  for (const coll of COLLECTIONS) {
    const entries = await loadCollection(coll);
    console.log(`[refs:cross] ${coll.name}: ${entries.length} entries`);
    allEntries.push(...entries);
  }

  // 2) Index slugs per type — pro validation existence
  const existingSlugs = {};
  for (const t of REF_TYPES) existingSlugs[t] = new Set();
  for (const e of allEntries) {
    existingSlugs[e.type].add(e.slug);
  }

  // 3) Build reverse map
  /** type → slug → { type → [sourceSlug, ...] } */
  const reverse = {};
  for (const t of REF_TYPES) reverse[t] = {};

  let warnings = 0;

  for (const src of allEntries) {
    const refs = src.fm.crossRefs;
    if (!refs || typeof refs !== 'object') continue;
    for (const targetType of REF_TYPES) {
      const targetSlugs = refs[targetType];
      if (!Array.isArray(targetSlugs)) continue;
      for (const targetSlug of targetSlugs) {
        if (typeof targetSlug !== 'string') continue;
        // Validation: target slug musí existovat
        if (!existingSlugs[targetType].has(targetSlug)) {
          console.warn(
            `[refs:cross] ⚠ ${src.type}/${src.slug} → ${targetType}/${targetSlug} (neexistuje)`
          );
          warnings++;
          continue; // Ne zařazuj do reverse mapy
        }
        // Insert: reverse[targetType][targetSlug][src.type] ⊇ src.slug
        const bucket = (reverse[targetType][targetSlug] ??= {});
        const list = (bucket[src.type] ??= []);
        if (!list.includes(src.slug)) list.push(src.slug);
      }
    }
  }

  // 4) Sort slug arrays for deterministic output (smaller diffs)
  for (const t of REF_TYPES) {
    for (const slug of Object.keys(reverse[t])) {
      for (const srcType of Object.keys(reverse[t][slug])) {
        reverse[t][slug][srcType].sort();
      }
    }
  }

  // 5) Write JSON
  await mkdir(dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(reverse, null, 2) + '\n');

  // 6) Summary
  let totalRefs = 0;
  const perType = {};
  for (const t of REF_TYPES) {
    perType[t] = Object.keys(reverse[t]).length;
    for (const slug of Object.keys(reverse[t])) {
      for (const srcType of Object.keys(reverse[t][slug])) {
        totalRefs += reverse[t][slug][srcType].length;
      }
    }
  }

  console.log('');
  console.log(`✓ Cross-ref reverse map: ${OUT_PATH.replace(ROOT + '/', '')}`);
  console.log(`  ${totalRefs} forward refs across ${allEntries.length} entries`);
  console.log(`  Targets s aspoň 1 reverse ref: ${Object.entries(perType).map(([t, n]) => `${t}=${n}`).join(', ')}`);
  if (warnings > 0) {
    console.warn(`  ⚠ ${warnings} warnings (refs na neexistující slug)`);
    if (STRICT) {
      console.error('  --strict → exit 1');
      process.exit(1);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
