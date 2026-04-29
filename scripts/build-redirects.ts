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
}

const NEW_CATEGORIES = new Set([
  'sbirka', 'konstrukce', 'projekty', 'virtualni-muzeum', 'muzea', 'zajimavosti',
]);

/** Pro slug vrátí novou URL podle kategorie nebo kronika collection. */
function newHref(slug: string, catalog: CatalogEntry[], kronikaSlugs: Set<string>): string {
  if (kronikaSlugs.has(slug)) return `/kronika/${slug}`;
  const e = catalog.find((c) => c.slug === slug);
  if (e && NEW_CATEGORIES.has(e.category)) {
    return `/${e.category}/${e.slug}`;
  }
  return `/clanky/${slug}`;
}

const SPECIAL: Record<string, string> = {
  '/index.htm': '/',
  '/mapa.htm': '/atlas',
  // Spolková identita patří na sister site horologie-cz, ne do hodinarium-eu
  // (M5 cleanup — /spolek/ stránka v hodinarium-eu byla redundantní orphan).
  '/spolek.htm': 'https://horologie-cz.pages.dev/',
  '/kontakt.htm': 'https://horologie-cz.pages.dev/kontakt',
  '/spolek': 'https://horologie-cz.pages.dev/',
  '/hledej.htm': '/atlas',
  '/novinky.htm': '/',
  '/decin_zamek.htm': '/expozice',
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
  lines.push('', '# Taxonomie 2026-04: /clanky/<slug> → /<kategorie>/<slug>');
  let migratedCount = 0;
  for (const e of catalog) {
    if (NEW_CATEGORIES.has(e.category)) {
      lines.push(`/clanky/${e.slug} /${e.category}/${e.slug} 301`);
      migratedCount += 1;
    }
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
