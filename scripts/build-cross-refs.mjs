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

/**
 * Parse `apps/hodinarium-eu/src/data/hodinari.ts` a vyextrahuje
 * `{ slug, relatedSlugs[] }` pairs přes regex. Primary registry pro
 * hodináře žije v TS (ne v MDX), takže ho musíme zpracovat odtud.
 *
 * relatedSlugs[] obsahují slugy článků (clanky/karty mixed), které
 * o hodináři pojednávají. Rozliš target type podle existingSlugs.
 *
 * Žije venku z main() pro testovatelnost.
 */
async function absorbHodinariRelatedSlugs(allEntries, existingSlugs, addRef) {
  const tsPath = join(ROOT, 'apps/hodinarium-eu/src/data/hodinari.ts');
  let txt;
  try {
    txt = await readFile(tsPath, 'utf-8');
  } catch {
    console.warn('[refs:cross] data/hodinari.ts nenalezen, skip relatedSlugs absorpce');
    return;
  }
  // Each entry: { slug: '...', ..., relatedSlugs: [...], ... }
  // Match block za blockem: hledej `slug:` + nejbližší `relatedSlugs:` před uzávěrem `},`.
  // Pattern je deterministic díky konsistentnímu formátování souboru.
  const entryRe = /\{\s*slug:\s*['"`]([^'"`]+)['"`][\s\S]*?relatedSlugs:\s*\[([^\]]*)\][\s\S]*?\}/g;
  let m;
  let count = 0;
  while ((m = entryRe.exec(txt)) !== null) {
    const hodinarSlug = m[1];
    const arrayContent = m[2].trim();
    if (!arrayContent) continue;
    // Parse array items: ['slug-1', 'slug-2', ...] — split podle quote+comma
    const items = [...arrayContent.matchAll(/['"`]([^'"`]+)['"`]/g)].map((mm) => mm[1]);
    if (!items.length) continue;
    for (const target of items) {
      // Target může být v libovolné collection (clanky / karty / hodinari /
      // kroky / soupis / slovnik / kronika). Probeh REF_TYPES priority order
      // (karty první, protože sbírkový předmět má konkrétnější vazbu).
      const lookupOrder = ['karty', 'clanky', 'hodinari', 'kroky', 'soupis', 'slovnik', 'kronika'];
      const targetType = lookupOrder.find((t) => existingSlugs[t]?.has(target));
      if (!targetType) {
        // Tichá heuristika — relatedSlugs často obsahují historical slugy,
        // které byly přejmenovány v D6. Nelámej build, jen logging.
        console.warn(
          `[refs:cross] ⚠ hodinari/${hodinarSlug} → ${target} (nenalezen v žádné collection; D6 rename?)`
        );
        continue;
      }
      addRef('hodinari', hodinarSlug, targetType, target, 'data/hodinari.ts');
      count++;
    }
  }
  console.log(`[refs:cross] absorbováno ${count} hodinari→clanky/karty refs z data/hodinari.ts`);
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

  let strictWarnings = 0;   // From explicit `crossRefs` — strict mode triggers exit 1
  let legacyWarnings = 0;   // From legacy fields (data/hodinari.ts, soupis.related*, slovnik.pribuzne) — log only

  /** Bezpečné vložení forward ref → reverse mapy. Validace existence,
   *  deduplikace, warning při missing.
   *
   *  `strictSource` rozlišuje:
   *    true  — z explicit `crossRefs` frontmatter (editor explicit deklaroval) →
   *            missing target = strict failure (build break v --strict mode)
   *    false — z legacy field (existing data, pre-X.1) → log only, žádný
   *            build break (D6 renames apod. by lámaly produkci) */
  function addRef(srcType, srcSlug, targetType, targetSlug, label, strictSource = false) {
    if (!targetSlug || typeof targetSlug !== 'string') return;
    if (!existingSlugs[targetType]?.has(targetSlug)) {
      console.warn(
        `[refs:cross] ⚠ ${srcType}/${srcSlug} → ${targetType}/${targetSlug} (neexistuje, zdroj=${label})`
      );
      if (strictSource) strictWarnings++;
      else legacyWarnings++;
      return;
    }
    const bucket = (reverse[targetType][targetSlug] ??= {});
    const list = (bucket[srcType] ??= []);
    if (!list.includes(srcSlug)) list.push(srcSlug);
  }

  for (const src of allEntries) {
    // 3a) Explicit crossRefs frontmatter pole (PBI X.1)
    const refs = src.fm.crossRefs;
    if (refs && typeof refs === 'object') {
      for (const targetType of REF_TYPES) {
        const targetSlugs = refs[targetType];
        if (!Array.isArray(targetSlugs)) continue;
        for (const targetSlug of targetSlugs) {
          addRef(src.type, src.slug, targetType, targetSlug, 'crossRefs', true /* strict */);
        }
      }
    }

    // 3b) Legacy fields → absorbováno do reverse map bez frontmatter migrace.
    //    Stejné slugy se v reverse seznamu deduplikují (set-like list).
    //    Zachováno backwards-compat: existing fields zůstávají, jen reverse
    //    map zahrnuje obě cesty.

    // slovnik.pribuzne[] → slovnik
    if (src.type === 'slovnik' && Array.isArray(src.fm.pribuzne)) {
      for (const t of src.fm.pribuzne) {
        addRef(src.type, src.slug, 'slovnik', t, 'slovnik.pribuzne');
      }
    }

    // soupis.relatedKarty[] → karty, soupis.relatedClanky[] → clanky
    if (src.type === 'soupis') {
      if (Array.isArray(src.fm.relatedKarty)) {
        for (const t of src.fm.relatedKarty) {
          addRef(src.type, src.slug, 'karty', t, 'soupis.relatedKarty');
        }
      }
      if (Array.isArray(src.fm.relatedClanky)) {
        for (const t of src.fm.relatedClanky) {
          addRef(src.type, src.slug, 'clanky', t, 'soupis.relatedClanky');
        }
      }
      // soupis.hodinar (string) — primary autor. Pokud je to validní hodinari slug,
      // přidej i jako reverse ref (medailon hodináře pak uvidí "věže, které vyrobil").
      // Tichá heuristika: zkontroluj v existingSlugs.hodinari, ne console.warn pokud
      // mismatch — `hodinar` legitimně může být i free text ("anonymní", "připisováno X").
      if (typeof src.fm.hodinar === 'string' && existingSlugs.hodinari.has(src.fm.hodinar)) {
        addRef(src.type, src.slug, 'hodinari', src.fm.hodinar, 'soupis.hodinar');
      }
      // soupis.krok (string) — primary mechanism. Free text typicky ('graham', 'kotvový'),
      // jen pokud match na existing krok slug → ref. Žádný warning na free-text.
      if (typeof src.fm.krok === 'string' && existingSlugs.kroky.has(src.fm.krok)) {
        addRef(src.type, src.slug, 'kroky', src.fm.krok, 'soupis.krok');
      }
    }
  }

  // 3c) data/hodinari.ts relatedSlugs — ne v MDX frontmatteru, žije v
  //    primárním TS registry. Parse via regex (struktura je deterministic).
  await absorbHodinariRelatedSlugs(allEntries, existingSlugs, addRef);

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
  if (strictWarnings > 0 || legacyWarnings > 0) {
    console.warn(`  ⚠ ${strictWarnings} strict warnings (explicit crossRefs missing target)`);
    console.warn(`  ⚠ ${legacyWarnings} legacy warnings (data/hodinari.ts, soupis.related*, …)`);
    if (STRICT && strictWarnings > 0) {
      console.error('  --strict + strictWarnings > 0 → exit 1');
      process.exit(1);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
