/**
 * Kurátorská metadata pro každou kategorii — intro, featured slugy, doplňkové odkazy.
 */

export interface KategorieMeta {
  slug: string;
  jmeno: string;
  podnadpis: string;
  intro: string;
  featuredSlugs?: string[];
  doplnky?: { jmeno: string; href: string; ikona: 'mapa' | 'osa' | 'sluzba' | 'orloj' }[];
}

export const kategorie: Record<string, KategorieMeta> = {
  sbirka: {
    slug: 'sbirka',
    jmeno: 'Sbírka',
    podnadpis: 'Hodiny napříč staletími a typy',
    intro:
      'Tematické sbírky — od švarcvaldek z Černého lesa přes francouzské comtoázky a vodní hodiny ' +
      'po naprosto netradiční konstrukce: hodiny v lahvi, jezdecké, židovské či květinové.',
    featuredSlugs: ['svarcvaldky', 'vodni', 'kvetinove', 'rimskedigi'],
  },
  projekty: {
    slug: 'projekty',
    jmeno: 'Projekty',
    podnadpis: 'DIY hodiny a experimentální konstrukce',
    intro:
      'Vlastní konstrukce — Arduino, ESP8266, NTP synchronizace, sluneční hodiny v digitální podobě, ' +
      'propeller clock i astronomické hodiny řízené mikroprocesorem. Pro maker komunitu.',
    featuredSlugs: ['astro2_NTP', 'Arduino', 'GPS_Sakul', 'propeller_clock'],
    doplnky: [
      { jmeno: 'Časová osa projektů', href: '/casova-osa', ikona: 'osa' },
    ],
  },
  decin: {
    slug: 'decin',
    jmeno: 'Hodinárium Děčín',
    podnadpis: 'Fyzická expozice na zámku Děčín',
    intro:
      'Stálá expozice Českého spolku horologického na zámku Děčín. Otevřeno od roku 2015. ' +
      'Mechanické, elektrické i digitální hodiny, věžní stroje, restaurátorské reportáže.',
    featuredSlugs: ['decin_koncepce', 'decin_zamek', 'decin_aktual0', 'decin_dalsi_stroje'],
    doplnky: [
      { jmeno: 'Mapa expozice', href: '/mapa', ikona: 'mapa' },
      { jmeno: 'Web zámku Děčín', href: 'https://www.zamekdecin.cz/program/vystava-decinske-hodinarium', ikona: 'sluzba' },
    ],
  },
  'vezni-hodiny': {
    slug: 'vezni-hodiny',
    jmeno: 'Věžní hodiny',
    podnadpis: 'Stroje z kostelních a městských věží',
    intro:
      'Věžní hodiny napříč Českem — od možná nejstaršího dochovaného stroje v Soběslavi (1484?) ' +
      'přes Bychory, Janovice, Rožmberk a věže Krušnohoří. Dokumentované nálezy, restaurování, instalace.',
    featuredSlugs: ['sobeslav3', 'bychory_zvonici_stroj', 'rozmberk1', 'janovice'],
    doplnky: [
      { jmeno: 'Mapa věží', href: '/mapa', ikona: 'mapa' },
      { jmeno: 'Časová osa', href: '/casova-osa', ikona: 'osa' },
    ],
  },
};
