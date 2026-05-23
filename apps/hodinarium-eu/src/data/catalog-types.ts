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
  /** Slug bez extension (např. "bychory_prokes1" nebo "inv-A001-vezni-hiemann-1884"). */
  slug: string;
  /** Title z frontmatteru. */
  title: string;
  /** Kategorie — sbirka / konstrukce / projekty / virtualni-muzeum / muzea / zajimavosti. */
  category: string;
  /** Podsekce u sbírkových evidenčních karet — `'karta'`. URL je pak
      `/sbirka/karta/<slug>` (vlastní router `pages/sbirka/karta/[slug].astro`),
      ne `/sbirka/<slug>`. Pro běžné články undefined. Viz `clanekHref()`
      v `url-helpers.ts`. */
  podsekce?: 'karta';
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
  /** Jméno hodináře / výrobce (z karta.vyrobce u sbírkových karet).
      Zobrazí se jako kurzíva pod titulem v Card preview. */
  vyrobce?: string;
  /** Tagy z frontmatter `tags: [...]`. Whitelist v `data/tags.json`.
      Používá Fuse.js pro keyword search — najde článek i když tag není
      v titulu/perexu (např. "krok-benoit-robert" přes hledání "kolíčkový"). */
  tags?: string[];
  /** Editorem vyplněná synonyma a alternativní pravopisy/termíny pro
      vyhledávání. Free-text array, NEzobrazuje se na stránce, jen v
      Fuse.js search index. Příklady: ["lihýř", "foliot", "wagonka",
      "Bychory", "Maresch"]. */
  searchKeywords?: string[];
}
