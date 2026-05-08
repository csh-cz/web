/**
 * Sdílené label slovníky pro kategorie + typy.
 *
 * Před tímto modulem byly slovníky `categoryLabels` definované 4× v
 * Card.astro / SearchModal.astro / Article.astro / casova-osa.astro
 * — pokaždé s mírně odlišnými klíči (deprecated `decin` / `vezni-hodiny`
 * / `spolek` / `ostatni` na různých místech, různé délky labelů, drift
 * při přidávání nové kategorie).
 *
 * Source of truth: tento soubor. Komponenty volají `categoryLabel(cat,
 * 'short' | 'long')` nebo `kronikaTypLabel(typ)`.
 */

/**
 * Kategorie článků/karet v `content/hodinarium-eu/`.
 *
 * Aktuální taxonomie po M2 (2026-04):
 *   sbirka / konstrukce / projekty / virtualni-muzeum / muzea / zajimavosti
 *
 * Deprecated (zachované jen pro backward-compat při náhodném výskytu):
 *   decin, vezni-hodiny, ostatni — z původní hodinarium.eu PHP éry.
 *   Schema enum je stále podporuje, ale nový obsah nepoužívá.
 */
export type CategoryKey =
  | 'sbirka'
  | 'konstrukce'
  | 'projekty'
  | 'virtualni-muzeum'
  | 'muzea'
  | 'zajimavosti'
  // deprecated
  | 'decin'
  | 'vezni-hodiny'
  | 'ostatni'
  | 'spolek';

/** Krátké labely pro Card komponenty (eyebrow, max 12 znaků). */
const CATEGORY_LABELS_SHORT: Record<CategoryKey, string> = {
  sbirka: 'Sbírka',
  konstrukce: 'Konstrukce',
  projekty: 'Projekt',
  'virtualni-muzeum': 'Virt. muzeum',
  muzea: 'Muzeum',
  zajimavosti: 'Zajímavost',
  // deprecated
  decin: 'Děčín',
  'vezni-hodiny': 'Věžní',
  ostatni: '',
  spolek: 'Spolek',
};

/** Plné labely pro article header / breadcrumbs / meta tags. */
const CATEGORY_LABELS_LONG: Record<CategoryKey, string> = {
  sbirka: 'Sbírka',
  konstrukce: 'Konstrukce',
  projekty: 'Projekty',
  'virtualni-muzeum': 'Virtuální muzeum',
  muzea: 'Muzea',
  zajimavosti: 'Zajímavosti',
  // deprecated
  decin: 'Hodinárium Děčín',
  'vezni-hodiny': 'Věžní hodiny',
  ostatni: 'Hodinárium',
  spolek: 'Spolek',
};

/**
 * Vrátí label kategorie. Variant `'short'` (default) pro Card eyebrow,
 * `'long'` pro article header / breadcrumbs.
 *
 * Pokud kategorie není v slovníku, vrátí prázdný string (Card neukáže
 * eyebrow) nebo `null` u long verze (volající rozhoduje fallback).
 */
export function categoryLabel(
  category: string | undefined,
  variant: 'short' | 'long' = 'short',
): string {
  if (!category) return '';
  const map = variant === 'long' ? CATEGORY_LABELS_LONG : CATEGORY_LABELS_SHORT;
  return map[category as CategoryKey] ?? category;
}

/**
 * Pevné labely pro `casova-osa.astro` — tyhle kategorie pocházejí
 * z `data/milniky.ts` a patří jen do milníkové timeline (ne do
 * obsahových kategorií). Necháváme je oddělené pro klaritu.
 */
const KATEGORIE_LABELS_MILNIKY: Record<string, string> = {
  orloj: 'Pražský orloj',
  vez: 'Věžní hodiny',
  objev: 'Bádání',
  sbirka: 'Sbírka',
  projekty: 'Projekty',
  spolek: 'Spolek',
};

export function milnikLabel(kategorie: string): string {
  return KATEGORIE_LABELS_MILNIKY[kategorie] ?? kategorie;
}

/**
 * Labely typů kronikových záznamů — z `kronika` collection enum.
 */
const KRONIKA_TYP_LABELS: Record<string, string> = {
  vernisaz: 'Vernisáž',
  fotoreport: 'Fotoreport',
  sezona: 'Sezóna',
  akvizice: 'Akvizice',
  tisk: 'Tisk',
  tv: 'TV',
  restaurace: 'Restaurování',
  'historie-spolku': 'Historie spolku',
  'tematicka-vystava': 'Tematická výstava',
  jine: 'Jiné',
};

export function kronikaTypLabel(typ: string | undefined): string {
  if (!typ) return '';
  return KRONIKA_TYP_LABELS[typ] ?? typ;
}

/**
 * Labely stavu věžních hodin (`soupis-veznich-hodin` schema enum).
 *
 * Schema používá technické slugy kvůli stabilitě URL filtrů a JSON
 * exportu. UI label musí být čitelný — ne `replace(/_/g, ' ')` quick
 * hack (ten `znicene` zobrazoval doslova jako „znicene", nikoli „zničeno").
 *
 * Audit: docs/design-followups-hodinarium-2026-05-08.md FU1.4.
 *
 * - `in situ` ponecháno jako terminus technicus (kunsthistorie)
 * - ostatní stavy mají cs ekvivalent
 */
const STAV_LABELS: Record<string, string> = {
  in_situ: 'in situ',
  preneseno: 'přeneseno',
  ztracene: 'ztracené',
  znicene: 'zničené',
  neznamy: 'stav neznámý',
};

export function stavLabel(stav: string | undefined): string {
  if (!stav) return '';
  return STAV_LABELS[stav] ?? stav.replace(/_/g, ' ');
}
