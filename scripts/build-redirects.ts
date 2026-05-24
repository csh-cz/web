/**
 * Vyrobí _redirects soubor pro Cloudflare Pages.
 *
 * Dva typy přesměrovek:
 *   1. Legacy hodinarium.eu *.htm → nová URL podle kategorie článku
 *   2. Po taxonomii 2026-04: /clanky/<slug> → /<kategorie>/<slug>
 *      (pro články, které byly přesunuty do nových kategorií)
 *
 * Vstup:
 *   - raw/hodinarium-eu/_index.json (z scrape skriptu)
 *   - apps/hodinarium-eu/src/data/catalog.json (s aktuální category)
 * Výstup: apps/hodinarium-eu/public/_redirects
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const INDEX_PATH = join(ROOT, 'raw', 'hodinarium-eu', '_index.json');
const CATALOG_PATH = join(ROOT, 'apps', 'hodinarium-eu', 'src', 'data', 'catalog.json');
const OUT_PATH = join(ROOT, 'apps', 'hodinarium-eu', 'public', '_redirects');

interface Index {
  pages: Record<string, { url: string; slug: string; title: string | null }>;
}

interface CatalogEntry {
  slug: string;
  category: string;
  /** 'karta' = evidenční karta sbírky → /sbirka/karta/<slug>;
   *  jinak (undefined / 'clanek') → /<category>/<slug> */
  podsekce?: string;
}

/**
 * URL pro článek (NOT pro `/clanky/<slug>` legacy zdroj — pro nový taxonomický cíl).
 * Sbírka má dva subroutery:
 *   - /sbirka/karta/<slug>  — evidenční karty (`podsekce: 'karta'`)
 *   - /sbirka/<slug>        — texty o sbírce (články, ne karty)
 * Ostatní kategorie (konstrukce, projekty, …) jsou flat: /<kat>/<slug>.
 */
function categoryHref(e: CatalogEntry): string {
  if (e.category === 'sbirka' && e.podsekce === 'karta') {
    return `/sbirka/karta/${e.slug}`;
  }
  return `/${e.category}/${e.slug}`;
}

const NEW_CATEGORIES = new Set([
  'sbirka', 'konstrukce', 'projekty', 'virtualni-muzeum', 'muzea', 'zajimavosti',
]);

/** Pro slug vrátí novou URL podle kategorie nebo kronika collection. */
function newHref(slug: string, catalog: CatalogEntry[], kronikaSlugs: Set<string>): string {
  if (slug in MERGED_INTO) return MERGED_INTO[slug];
  if (kronikaSlugs.has(slug)) return `/kronika/${slug}`;
  const e = catalog.find((c) => c.slug === slug);
  if (e && NEW_CATEGORIES.has(e.category)) {
    return categoryHref(e);
  }
  return `/clanky/${slug}`;
}

const SPECIAL: Record<string, string> = {
  '/index.htm': '/',
  '/mapa.htm': '/mapa',
  // Spolková identita patří na sister site horologie-cz, ne do hodinarium-eu
  // (M5 cleanup — /spolek/ stránka v hodinarium-eu byla redundantní orphan).
  '/spolek.htm': 'https://horologie-cz.pages.dev/',
  '/kontakt.htm': 'https://horologie-cz.pages.dev/kontakt',
  '/spolek': 'https://horologie-cz.pages.dev/',
  // /atlas overview byl smazán — /sbirka jako default landing pro browsing,
  // /tagy pro cross-cut filter podle vlastností
  '/atlas': '/sbirka',
  // /clanky/ overview byl smazán (M5.6) → /sbirka (dříve /atlas, teď taky pryč)
  '/clanky': '/sbirka',
  '/hledej.htm': '/sbirka',
  '/novinky.htm': '/',
  '/decin_zamek.htm': '/expozice',
  // M6 (2026-05): „Koncepce Hodinária" promo na top-level about page
  // (přesunuto ze /sbirka/decin_koncepce na samostatný router /o-hodinariu).
  // Editor report #19 — článek byl mezi sbírkovými kartami špatně nalezitelný.
  '/sbirka/decin_koncepce': '/o-hodinariu',
  '/sbirka/o-hodinariu': '/o-hodinariu',
  '/decin_koncepce.htm': '/o-hodinariu',
};

/**
 * Cross-category přesuny článků (po M2 už mají články URL `/<kategorie>/<slug>`,
 * ale občas se jeden přeřadí — typicky když se článek zařadil do `sbirka` a
 * pak se zjistilo, že patří spíš do `virtualni-muzeum`).
 *
 * Format: `/<stara-kategorie>/<slug>` → `/<nova-kategorie>/<slug>`. Aktuální
 * kategorie v catalog.json je zdroj pravdy; tady je jen historie přesunů.
 */
const CATEGORY_MOVES: Record<string, string> = {
  '/sbirka/zidovske': '/virtualni-muzeum/zidovske',
};

/**
 * Konsolidace článků (M5.1+) — když se více článků sloučí do jednoho evergreen,
 * staré slugy přesměrovat na anchor v novém článku.
 *
 * Format: starý slug → cílová URL (s anchor).
 * Vyrobí redirect pro `/clanky/<slug>` i pro legacy `<slug>.htm` cestu.
 */
const MERGED_INTO: Record<string, string> = {
  // M5.1 Bychory konsolidace (2026-05): 3 článků sloučeno do bychory_prokes1
  bychory_zvonici_stroj: '/sbirka/bychory_prokes1#zvonici-stroj-kuriozita-kompletu',
  bychory_cimbaly: '/sbirka/bychory_prokes1#cimbaly-bellmannova-slevarna-1868',
  bychory_restaurovani_napis: '/sbirka/bychory_prokes1#restaurovani-od-nalezu-k-expozici',
  // M5.2 Akvizice konsolidace (2026-05): 4 chronologické články sloučeny do akvizice-2015-2025
  decin_dalsi_stroje: '/sbirka/akvizice-2015-2025#2015-2018',
  decin_stroje2019: '/sbirka/akvizice-2015-2025#2019',
  decin_stroje2020: '/sbirka/akvizice-2015-2025#2020',
  vezni2021: '/sbirka/akvizice-2015-2025#2021',
};

/**
 * Přejmenování slugů (M5.3+) — pro stabilní URL po renamu medailonu.
 * Format: starý slug v /hodinari/ → nový slug v /hodinari/.
 */
const HODINARI_SLUG_RENAMES: Record<string, string> = {
  // 2026-05: oprava akademického jména na základě Knespla 2025
  'sebastian-londensperger': 'sebastian-landesberger',
};

/**
 * D6 Slug standardizace 2026-05-10 — 121 souborů přejmenováno z
 * snake_case / CamelCase na kebab-case. Mapping je v
 * `apps/hodinarium-eu/src/data/d6-slug-renames.json` (auto-generated
 * při `pnpm d6:rename`).
 *
 * Build-redirects čte mapping a vyrobí 301 redirects:
 *   /clanky/<oldId> → /<kategorie>/<newId>      (legacy /clanky/* path)
 *   /<kategorie>/<oldId> → /<kategorie>/<newId> (přímý starý URL)
 *   /kronika/<oldId> → /kronika/<newId>         (kronika collection)
 */
async function loadD6Renames(): Promise<Array<{ oldUrl: string; newUrl: string }>> {
  const mappingPath = join(ROOT, 'apps/hodinarium-eu/src/data/d6-slug-renames.json');
  let data: { renames: Array<{ collection: string; oldId: string; newId: string }> };
  try {
    data = JSON.parse(await readFile(mappingPath, 'utf-8'));
  } catch {
    return [];
  }
  // M7 (2026-05-20): VŠECHNY /clanky/<oldId> → kanonická URL redirecty řeší teď
  // catch-all route `pages/clanky/[slug].astro` (CF _redirects honoruje jen ~258
  // pravidel, /clanky jich bylo ~230+ s různými cílovými kategoriemi → nešly
  // globovat ani vměstnat). Tady zůstává jen přímý /kronika/<old> → /kronika/<new>
  // rename (mimo /clanky schéma, levný a low-count).
  const out: Array<{ oldUrl: string; newUrl: string }> = [];
  for (const r of data.renames) {
    if (r.collection === 'kronika') {
      out.push({ oldUrl: `/kronika/${r.oldId}`, newUrl: `/kronika/${r.newId}` });
    }
  }
  return out;
}

/**
 * Přejmenování slugů sbírkových karet (`/sbirka/karta/<slug>`).
 * Format: starý slug → nový slug.
 */
const KARTY_SLUG_RENAMES: Record<string, string> = {
  // 2026-05-06: title omylem zaznamenán pod nesprávným slugem (inv-53 byl historicky
  // 'Model Pražského orloje', editor opravil na 'Orloj Hvězdárna Petřín' — slug
  // dotažen aby seděl s titulem. Plus odstraněn duplikátní auto-import
  // 'inv-67-orloj-hvezdarna-petrin' (inv-67 patří Lissnerovým hodinám).
  'inv-53-model-prazskeho-orloje': 'inv-53-orloj-hvezdarna-petrin',
  'inv-67-orloj-hvezdarna-petrin': 'inv-53-orloj-hvezdarna-petrin',
  // 2026-05-24: „Zvonění Kavalír" (dříve inv-243, krátce přečíslováno na A263)
  // je dle kurátora (M. Baudisch) totéž jako „Elektronicky řízené odbíjení",
  // inv. č. 185 (vitrína 4). A263 byl duplikát → sloučeno do A185.
  'inv-243-zvoneni-kavalir': 'inv-A185-elektronicky-rizene-odbijeni',
  'inv-A263-zvoneni-kavalir': 'inv-A185-elektronicky-rizene-odbijeni',
};

/** Načti slugy z content/kronika/ — tyto články byly přesunuty z /clanky/. */
async function loadKronikaSlugs(): Promise<Set<string>> {
  const { readdirSync } = await import('node:fs');
  const dir = join(ROOT, 'content/kronika');
  try {
    return new Set(
      readdirSync(dir)
        .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
        .map((f) => f.replace(/\.(md|mdx)$/, '')),
    );
  } catch {
    return new Set();
  }
}

async function main() {
  const raw = await readFile(INDEX_PATH, 'utf-8');
  const index: Index = JSON.parse(raw);
  const catalog: CatalogEntry[] = JSON.parse(await readFile(CATALOG_PATH, 'utf-8'));
  const kronikaSlugs = await loadKronikaSlugs();
  const d6Renames = await loadD6Renames();

  // CF Pages limit: rules za cca 600 řádky CF tiše ignoruje (empiricky
  // ověřeno 2026-05-20: rule #600 funguje, #632 už 404). Proto jsou rules
  // seřazeny **podle priority** od nejdůležitějších (SEO-kritické) po méně
  // kritické (legacy hodnota) a M7 trim (2026-05-20) zrušil low-value
  // varianty (D6 /<kat>/<old> + trailing-slash duplikáty), aby se celý
  // soubor (~555 rules) vešel pod limit a žádný redirect se neztrácel.
  const lines: string[] = [
    '# Cloudflare Pages redirects — auto-generated, nereeditovat ručně.',
    '# Generuje scripts/build-redirects.ts z raw/_index.json + catalog.json.',
    '# Format: <source> <destination> <status>',
    '#',
    '# CF Pages parsuje zhora dolů a ignoruje rules za limitem (~600).',
    '# Rules jsou **seřazené podle priority** od kritických (SEO,',
    '# rename overrides) po legacy (HTM z původního PHP webu).',
  ];

  // ────────────────────────────────────────────────────────────────
  // PRIORITA 1 — SEO-kritické rename overrides (musí přežít CF limit)
  // ────────────────────────────────────────────────────────────────

  // POZN. (M7, 2026-05-20): VŠECHNY per-article `/clanky/<slug>` redirecty
  // (karty, články, kronika, konsolidace MERGED_INTO, D6 staré slugy) řeší teď
  // catch-all route `pages/clanky/[slug].astro` — meta-refresh na kanonickou
  // URL podle catalog.json + d6-rename mapy. Důvod: CF Pages honoruje jen ~258
  // pravidel v _redirects (empiricky: rule #258 OK, #259 → 404) a /clanky jich
  // bylo ~230+ s RŮZNOU cílovou kategorií per slug → nešly globovat (jeden
  // splat neumí mapovat laplace→zajimavosti, kostky→sbirka) ani vměstnat.
  // V _redirects proto zůstávají JEN ne-/clanky 301 (přímé karta cesty, kronika
  // rename, hodinaři, cross-category, root pages, legacy *.htm).

  // Renamed karta slugs — přímá /sbirka/karta/<old> cesta (/clanky/<old> = route).
  lines.push('', '# === PRIORITA 1: rename overrides (SEO kritické) ===');
  lines.push('# Renamed karta slugs (přímá karta cesta):');
  for (const [oldSlug, newSlug] of Object.entries(KARTY_SLUG_RENAMES)) {
    lines.push(`/sbirka/karta/${oldSlug} /sbirka/karta/${newSlug} 301`);
    lines.push(`/sbirka/karta/${oldSlug}/ /sbirka/karta/${newSlug}/ 301`);
  }

  // D6 — pouze /kronika/<old> → /kronika/<new> (kronika rename mimo /clanky).
  lines.push('', `# D6 kronika rename: ${d6Renames.length} redirects`);
  for (const r of d6Renames) {
    lines.push(`${r.oldUrl} ${r.newUrl} 301`);
  }

  // Přejmenování hodinářů
  lines.push('', '# Přejmenování medailonů hodinářů (M5.3+)');
  for (const [oldSlug, newSlug] of Object.entries(HODINARI_SLUG_RENAMES)) {
    lines.push(`/hodinari/${oldSlug} /hodinari/${newSlug} 301`);
  }

  // Cross-category přesuny
  lines.push('', '# Cross-category přesuny (článek přeřazen mezi kategoriemi)');
  for (const [src, dst] of Object.entries(CATEGORY_MOVES)) {
    lines.push(`${src} ${dst} 301`);
  }

  // ────────────────────────────────────────────────────────────────
  // PRIORITA 2 — Specifické root pages
  // ────────────────────────────────────────────────────────────────

  lines.push('', '# === PRIORITA 2: root pages ===');
  lines.push('# Specifické přesměrovky (root pages legacy hodinarium.eu)');
  for (const [src, dst] of Object.entries(SPECIAL)) {
    lines.push(`${src} ${dst} 301`);
  }

  // ────────────────────────────────────────────────────────────────
  // Legacy *.htm → 404.
  // M8 (2026-05-20): per-article .htm redirecty ZRUŠENY. Web není live, mění
  // se doména → žádná SEO kontinuita ze staré PHP domény se neřeší. Interní
  // .htm odkazy v contentu jsou přepsané na kanonické cesty. /clanky/* už
  // taky neřešíme přes route (interní odkazy kanonické). Zůstává jen pár
  // root-page přesměrovek (SPECIAL) + slug-rename overrides výše.
  // ────────────────────────────────────────────────────────────────
  lines.push('', '# === Legacy *.htm → 404 (pre-launch, žádná SEO kontinuita) ===', '/*.htm /404 404');

  const out = lines.join('\n') + '\n';
  await writeFile(OUT_PATH, out, 'utf-8');

  const activeRules = lines.filter((l) => l && !l.startsWith('#')).length;
  console.log(`=== _redirects vyrobeno ===`);
  console.log(`Cross-category přesuny:    ${Object.keys(CATEGORY_MOVES).length}`);
  console.log(`D6 kronika rename:         ${d6Renames.length}`);
  console.log(`Aktivních pravidel celkem: ${activeRules}`);
  console.log(`Výstup:                    ${OUT_PATH}`);
  console.log(`Velikost:                  ${out.length} bytů`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
