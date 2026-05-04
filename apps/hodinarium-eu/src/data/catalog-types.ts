/**
 * Sdílené typy pro `data/catalog.json` — výstup `scripts/build-catalog.ts`.
 *
 * Před tímto modulem byl `interface Entry` duplikovaný 10× v různých
 * stránkách (SearchModal, Article, og-preview, kroky/[slug], hodinari/[slug],
 * mapa-horologie, tagy/[tag], index, [kategorie]/index, sbirka/index)
 * s mírně odlišnými poli — drift při změně shape catalog.json.
 *
 * Source of truth: scripts/build-catalog.ts → catalog.json → tento soubor.
 */

/**
 * Jeden záznam v catalog.json — denormalizovaný pohled na článek/kartu
 * pro rychlé renderování listingů (homepage, kategorie, atlas, tagy).
 */
export interface CatalogEntry {
  /** Slug bez extension (např. "bychory_prokes1" nebo "inv-1-vezni-hiemann-1884"). */
  slug: string;
  /** Title z frontmatteru. */
  title: string;
  /** Kategorie — sbirka / konstrukce / projekty / virtualni-muzeum / muzea / zajimavosti. */
  category: string;
  /** Cesta k thumbnail obrázku, nebo null pokud chybí. */
  thumbnail: string | null;
  /** Krátký výpis (auto z body — typicky první ~200 znaků). */
  excerpt: string;
  /** Rok extrahovaný z datace nebo body, nebo null. */
  year: number | null;
  /** ISO timestamp poslední modifikace, nebo null. */
  lastModified: string | null;
  /** Počet obrázků v body. */
  imageCount: number;
  /** Počet slov v body. */
  wordCount: number;
}
