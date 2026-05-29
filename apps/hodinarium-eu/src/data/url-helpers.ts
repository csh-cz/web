/**
 * Helpery pro generování URL k článkům podle kategorie.
 *
 * Po taxonomii 2026-04 se články přestěhovaly z /clanky/<slug> na
 * /<kategorie>/<slug> (M2 URL refactor). Deprecated články (decin /
 * vezni-hodiny / ostatni — zatím čekající na migraci do Kroniky M4)
 * mají URL pořád /clanky/<slug>, dokud se nepřesunou.
 *
 * Pro CF Pages 301 redirect /clanky/<slug> → /<kategorie>/<slug> viz
 * scripts/build-redirects.ts (generuje public/_redirects z catalog.json).
 *
 * **Sbírkové evidenční karty** (`category: 'sbirka'` + `podsekce: 'karta'`)
 * mají vlastní router `pages/sbirka/karta/[slug].astro` → URL
 * `/sbirka/karta/<slug>`. `clanekHref` to honoruje, pokud volající
 * předá `podsekce` field.
 */

export const NEW_CATEGORIES = new Set([
  'sbirka',
  'konstrukce',
  'projekty',
  'virtualni-muzeum',
  'muzea',
  'zajimavosti',
  'zvony',
  'edice',
]);

/** True pokud kategorie je v nové taxonomii (= článek má URL podle kat.). */
export function isNewCategory(category: string): boolean {
  return NEW_CATEGORIES.has(category);
}

/**
 * URL k detailu článku/karty.
 *
 * - `/sbirka/karta/<slug>` — sbírkové evidenční karty (podsekce='karta')
 * - `/<kat>/<slug>`         — ostatní články v nové taxonomii
 * - `/clanky/<slug>`        — deprecated kategorie (decin, vezni-hodiny, ostatni)
 */
export function clanekHref(entry: {
  slug: string;
  category: string;
  podsekce?: string | undefined;
}): string {
  if (entry.category === 'sbirka' && entry.podsekce === 'karta') {
    return `/sbirka/karta/${entry.slug}`;
  }
  if (NEW_CATEGORIES.has(entry.category)) {
    return `/${entry.category}/${entry.slug}`;
  }
  return `/clanky/${entry.slug}`;
}

/** Pro místa, kde známe jen slug (lokace, věžní místa atd.) — resolve z catalogu. */
export function clanekHrefFromSlug(
  slug: string,
  catalog: { slug: string; category: string; podsekce?: string | undefined }[],
): string {
  const entry = catalog.find((e) => e.slug === slug);
  return entry ? clanekHref(entry) : `/clanky/${slug}`;
}
