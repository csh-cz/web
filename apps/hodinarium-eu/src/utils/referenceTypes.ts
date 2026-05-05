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
  clanek: 'Časopisecký nebo encyklopedický článek (§)',
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
