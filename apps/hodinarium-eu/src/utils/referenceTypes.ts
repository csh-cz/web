/**
 * Slovní vysvětlení typů pramene/reference — používá se jako tooltip
 * (`title` atribut) na `<li class="reference reference-${type}">` v
 * `references-list` (Article.astro) i v `prameny` (soupis-veznich-hodin
 * detail page). Ikonky `::before` na li jsou pro vidící, tooltip je pro
 * kontext: na hover/focus se vysvětlí, co bullet znamená.
 *
 * Drží se konzistentně s typy ve schématu (`content.config.ts`):
 *   kniha | clanek | pdf | odkaz | wiki | mapa | patent | archiv | zprava
 */
export const referenceTooltip: Record<string, string> = {
  kniha: 'Tištěný pramen — kniha, monografie, sborník (📖)',
  clanek: 'Článek v časopise / sborníku / novinách (📰)',
  pdf: 'Soubor PDF — zpráva, článek, dokumentace ke stažení (⤓)',
  odkaz: 'Webový odkaz',
  wiki: 'Heslo na Wikipedii / Wikimedia Commons (ⓦ)',
  mapa: 'Mapa nebo poloha v mapové službě (📍)',
  patent: 'Patentový spis nebo patentová přihláška (⚙)',
  archiv: 'Archivní fond, kronika, rukopis (⛁)',
  zprava: 'Restaurátorská / odborná zpráva (✎)',
};

export function pramenTooltip(type: string | undefined | null): string {
  if (!type) return referenceTooltip.odkaz;
  return referenceTooltip[type] ?? referenceTooltip.odkaz;
}

/**
 * Z URL na Wikipedii / Wikimedia Commons / Wikidata vytáhne čitelný
 * název hesla — prostor v podtržítkách dekóduje, %-encoding rozbalí.
 *   https://cs.wikipedia.org/wiki/Hole%C5%A1ovick%C3%BD_p%C5%99%C3%ADstav
 *     → "Holešovický přístav"
 *   https://commons.wikimedia.org/wiki/File:Foo.jpg → "File:Foo.jpg"
 *   https://www.wikidata.org/wiki/Q12019992 → "Q12019992"
 * Pokud URL neodpovídá vzoru `/wiki/<slug>`, vrací null.
 */
export function extractWikiTitle(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(/\/wiki\/([^?#]+)/);
  if (!m) return null;
  try {
    return decodeURIComponent(m[1]).replace(/_/g, ' ');
  } catch {
    return m[1].replace(/_/g, ' ');
  }
}
