/**
 * Články uložené jako .mdx (s `import` + JSX komponentami).
 *
 * Sveltia CMS s `extension: md` v collection `clanky` neumí tyto
 * soubory bezpečně editovat — markdown editor narazí na JSX/import
 * a parser spadne (Petr Král, 2026-05-09: „Editor v půlce spadl…").
 *
 * Krátkodobě skrýváme „Upravit" FAB pro tyto články — pokud editor
 * potřebuje něco změnit, hlásí přes „Nahlásit problém" tlačítko
 * (založí GitHub Issue), maintainer opraví ručně.
 *
 * Dlouhodobě plán: konvertovat MDX → MD s remark-directive shortcodes
 * (TODO A.11 — viz TODO.md). Až bude hotovo, tento blocklist se smaže.
 *
 * Slug = filename bez extenze (= entry.id v astro:content).
 */
export const CMS_MDX_BLOCKLIST: ReadonlySet<string> = new Set([
  'Arduino',
  'PRS10',
  'TimeSlider',
  'fake_atomove_hodiny',
  'kinsner-astronomicke-hodiny',
  'kostky',
  'litinove-vezni-hodiny',
  'mindelheim',
  'mystery',
  'normalni',
  'segmentovky_s_prekladem',
  'slunecni',
  'slunecni_filler',
  'tabor',
  'zidovske',
]);
