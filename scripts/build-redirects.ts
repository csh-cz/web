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

  const lines: string[] = [
    '# Cloudflare Pages redirects — auto-generated, nereeditovat ručně.',
    '# Generuje scripts/build-redirects.ts z raw/_index.json + catalog.json.',
    '# Format: <source> <destination> <status>',
    '',
    '# Specifické přesměrovky (root pages legacy hodinarium.eu)',
  ];
  for (const [src, dst] of Object.entries(SPECIAL)) {
    lines.push(`${src} ${dst} 301`);
  }

  // 1. Legacy *.htm → nová URL podle kategorie / kroniky
  lines.push('', '# Legacy *.htm → nová URL podle kategorie článku / kroniky');
  const seen = new Set<string>(Object.keys(SPECIAL));
  for (const [path, meta] of Object.entries(index.pages)) {
    if (seen.has(path)) continue;
    if (!path.endsWith('.htm')) continue;
    seen.add(path);
    lines.push(`${path} ${newHref(meta.slug, catalog, kronikaSlugs)} 301`);
  }

  // 2. /clanky/<slug> → /<kategorie>/<slug> pro články v nových kategoriích.
  // Sbírka má dvě subkategorie — evidenční karty jdou na /sbirka/karta/<slug>.
  //
  // Optimalizace 2026-05: evidenční karty (sbirka/karta) mají uniform
  // prefix `inv-` — místo 290 explicit řádků jeden glob.
  // Audit: katalog scan potvrzuje, že `inv-*` ⟺ sbirka/karta exkluzivně
  // (žádný non-karta článek nezačíná `inv-`, žádná karta nezačíná jinak).
  lines.push('', '# Taxonomie 2026-04: /clanky/<slug> → /<kategorie>/<slug>');
  // Override pro renamed karty MUSÍ být před glob — first-match-wins,
  // glob `/clanky/inv-*` by jinak chytl old slug a redirektnul na neexistující URL.
  lines.push('# Renamed karta slugs (override před glob):');
  for (const [oldSlug, newSlug] of Object.entries(KARTY_SLUG_RENAMES)) {
    lines.push(`/clanky/${oldSlug} /sbirka/karta/${newSlug} 301`);
  }
  lines.push('# Karty (290 záznamů, glob pattern):');
  lines.push('/clanky/inv-* /sbirka/karta/inv-:splat 301');
  // Non-karta články — per-entry, slugy nemají uniform prefix per kategorie
  let migratedCount = 0;
  for (const e of catalog) {
    if (!NEW_CATEGORIES.has(e.category)) continue;
    if (e.category === 'sbirka' && e.podsekce === 'karta') continue; // glob výše
    lines.push(`/clanky/${e.slug} ${categoryHref(e)} 301`);
    migratedCount += 1;
  }

  // 3. /clanky/<slug> → /kronika/<slug> pro přesunuté efemérní články (M4)
  lines.push('', '# M4 Kronika: /clanky/<slug> → /kronika/<slug>');
  let kronikaCount = 0;
  for (const slug of kronikaSlugs) {
    lines.push(`/clanky/${slug} /kronika/${slug} 301`);
    kronikaCount += 1;
  }

  // 4. Cross-category přesuny (článek byl přeřazen mezi kategoriemi)
  lines.push('', '# Cross-category přesuny článků');
  for (const [src, dst] of Object.entries(CATEGORY_MOVES)) {
    lines.push(`${src} ${dst} 301`);
  }

  // 4b. Konsolidace článků — staré /clanky/<slug> přesměrovat na anchor evergreen
  lines.push('', '# Konsolidace článků (M5.1+) — staré slugy → anchor v evergreen');
  for (const [slug, dst] of Object.entries(MERGED_INTO)) {
    lines.push(`/clanky/${slug} ${dst} 301`);
  }

  // 4c. Přejmenování slugů v /hodinari/ — stabilní URL po renamu medailonu
  lines.push('', '# Přejmenování medailonů hodinářů (M5.3+)');
  for (const [oldSlug, newSlug] of Object.entries(HODINARI_SLUG_RENAMES)) {
    lines.push(`/hodinari/${oldSlug} /hodinari/${newSlug} 301`);
  }

  // 4d. Přejmenování slugů sbírkových karet — stabilní URL po opravě názvu/inv. č.
  // /clanky/<old> variant je už v sekci 2 (před glob, aby override fungoval).
  lines.push('', '# Přejmenování sbírkových karet');
  for (const [oldSlug, newSlug] of Object.entries(KARTY_SLUG_RENAMES)) {
    lines.push(`/sbirka/karta/${oldSlug} /sbirka/karta/${newSlug} 301`);
    lines.push(`/sbirka/karta/${oldSlug}/ /sbirka/karta/${newSlug}/ 301`);
  }

  // 5. Fallback
  lines.push('', '# Fallback — neznámé .htm cesty', '/*.htm /404 404');

  const out = lines.join('\n') + '\n';
  await writeFile(OUT_PATH, out, 'utf-8');

  console.log(`=== _redirects vyrobeno ===`);
  console.log(`Legacy htm pravidel:       ${seen.size}`);
  console.log(`Migrace clanky→kateg.:     ${migratedCount}`);
  console.log(`Migrace clanky→kronika:    ${kronikaCount}`);
  console.log(`Cross-category přesuny:    ${Object.keys(CATEGORY_MOVES).length}`);
  console.log(`Výstup:                    ${OUT_PATH}`);
  console.log(`Velikost:                  ${out.length} bytů`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
