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

/** Pro slug vrátí novou URL podle kategorie z catalogu (nebo /clanky/<slug>). */
function newHref(slug: string, catalog: CatalogEntry[]): string {
  const e = catalog.find((c) => c.slug === slug);
  if (e && NEW_CATEGORIES.has(e.category)) {
    return `/${e.category}/${e.slug}`;
  }
  return `/clanky/${slug}`;
}

const SPECIAL: Record<string, string> = {
  '/index.htm': '/',
  '/mapa.htm': '/atlas',
  '/spolek.htm': '/spolek',
  '/kontakt.htm': '/spolek#kontakt',
  '/hledej.htm': '/atlas',
  '/novinky.htm': '/',
  '/decin_zamek.htm': '/expozice',
};

async function main() {
  const raw = await readFile(INDEX_PATH, 'utf-8');
  const index: Index = JSON.parse(raw);
  const catalog: CatalogEntry[] = JSON.parse(await readFile(CATALOG_PATH, 'utf-8'));

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

  // 1. Legacy *.htm → nová URL podle kategorie
  lines.push('', '# Legacy *.htm → nová URL podle kategorie článku');
  const seen = new Set<string>(Object.keys(SPECIAL));
  for (const [path, meta] of Object.entries(index.pages)) {
    if (seen.has(path)) continue;
    if (!path.endsWith('.htm')) continue;
    seen.add(path);
    lines.push(`${path} ${newHref(meta.slug, catalog)} 301`);
  }

  // 2. /clanky/<slug> → /<kategorie>/<slug> pro články v nových kategoriích.
  //    Pro deprecated (decin/vezni-hodiny/ostatni) ponechá /clanky/<slug> (článek
  //    tam ještě fyzicky existuje až do M4 Kronika migration).
  lines.push('', '# Taxonomie 2026-04: /clanky/<slug> → /<kategorie>/<slug>');
  let migratedCount = 0;
  for (const e of catalog) {
    if (NEW_CATEGORIES.has(e.category)) {
      lines.push(`/clanky/${e.slug} /${e.category}/${e.slug} 301`);
      migratedCount += 1;
    }
  }

  // 3. Fallback
  lines.push('', '# Fallback — neznámé .htm cesty', '/*.htm /404 404');

  const out = lines.join('\n') + '\n';
  await writeFile(OUT_PATH, out, 'utf-8');

  console.log(`=== _redirects vyrobeno ===`);
  console.log(`Legacy htm pravidel:    ${seen.size}`);
  console.log(`Migrace clanky→kateg.:  ${migratedCount}`);
  console.log(`Výstup:                 ${OUT_PATH}`);
  console.log(`Velikost:               ${out.length} bytů`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
