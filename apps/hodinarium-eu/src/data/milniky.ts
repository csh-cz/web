/**
 * Milníky historie hodinařiny — pro Časovou osu.
 * Doplnit / opravit, jak se najde víc dat v textech.
 */

export interface Milnik {
  rok: number;
  rokText?: string;
  titulek: string;
  popis: string;
  slug?: string;
  externalUrl?: string;
  kategorie: 'orloj' | 'vez' | 'objev' | 'sbirka' | 'projekty' | 'spolek';
}

export const milniky: Milnik[] = [
  {
    rok: 1410,
    titulek: 'Pražský orloj — Mikuláš z Kadaně',
    popis: 'Astrolabium na Staroměstské radnici — jedna z nejstarších dochovaných astronomických hodin Evropy.',
    externalUrl: 'https://orloj.eu',
    kategorie: 'orloj',
  },
  {
    rok: 1484,
    rokText: '~1484?',
    titulek: 'Soběslav — věžní stroj',
    popis: 'Stroj věžních hodin s rámem možná z 15. století, restaurovaný spolkem CSH.',
    slug: 'sobeslav3',
    kategorie: 'vez',
  },
  {
    rok: 1490,
    titulek: 'Mistr Hanuš (Jan Růže)',
    popis: 'Doplnění kalendáriového ciferníku Pražského orloje.',
    externalUrl: 'https://orloj.eu',
    kategorie: 'orloj',
  },
  {
    rok: 1499,
    titulek: 'Torre dell\'Orologio — Benátky',
    popis: 'Benátský orloj na náměstí svatého Marka.',
    slug: 'venecia',
    kategorie: 'orloj',
  },
  {
    rok: 1570,
    titulek: 'Jan Táborský — zpráva o orloji',
    popis: 'První detailní popis pražského stroje.',
    externalUrl: 'https://orloj.eu',
    kategorie: 'objev',
  },
  {
    rok: 1700,
    titulek: 'Vznik švarcvaldek',
    popis: 'Tradice dřevěných hodin z Černého lesa — počátek lidové hodinářské tradice.',
    slug: 'svarcvaldky',
    kategorie: 'sbirka',
  },
  {
    rok: 1857,
    titulek: 'Prokešův model orloje',
    popis: 'Detailní model pražského orloje od Jana Prokeše.',
    externalUrl: 'https://orloj.eu',
    kategorie: 'sbirka',
  },
  {
    rok: 1865,
    titulek: 'Mánesovy desky',
    popis: 'Velká oprava pražského orloje, doplnění kalendária Josefa Mánesa.',
    externalUrl: 'https://orloj.eu',
    kategorie: 'orloj',
  },
  {
    rok: 1911,
    titulek: 'Steinich-Hassenteufel model',
    popis: 'Vědecký model orloje od firmy Steinich a Hassenteufel.',
    externalUrl: 'https://orloj.eu',
    kategorie: 'sbirka',
  },
  {
    rok: 1930,
    titulek: 'Generální oprava orloje',
    popis: 'Velká oprava pražského orloje v meziválečném období.',
    externalUrl: 'https://orloj.eu',
    kategorie: 'orloj',
  },
  {
    rok: 1948,
    titulek: 'Poválečná rekonstrukce orloje',
    popis: 'Po požáru radnice v květnu 1945 — rekonstrukce kalendária Vojtěchem Suchardou.',
    externalUrl: 'https://orloj.eu',
    kategorie: 'orloj',
  },
  {
    rok: 2009,
    titulek: 'Vznik Virtuálního muzea hodin o.s.',
    popis: 'Občanské sdružení, předchůdce Českého spolku horologického.',
    slug: 'spolek',
    kategorie: 'spolek',
  },
  {
    rok: 2011,
    titulek: 'Oprava 2011 — kohout ožívá',
    popis: 'Restaurování figury kohouta Pražského orloje.',
    externalUrl: 'https://orloj.eu',
    kategorie: 'orloj',
  },
  {
    rok: 2014,
    titulek: 'Český spolek horologický',
    popis: 'Přeměna občanského sdružení na zapsaný spolek.',
    slug: 'spolek',
    kategorie: 'spolek',
  },
  {
    rok: 2015,
    titulek: 'Hodinárium Děčín — otevření',
    popis: 'Stěhování expozice na zámek Děčín, otevření 4.&nbsp;9.&nbsp;2015.',
    slug: 'decin_aktual0',
    kategorie: 'spolek',
  },
  {
    rok: 2018,
    titulek: 'Generální oprava Pražského orloje',
    popis: 'Velká rekonstrukce, návrat ciferníku k historickému stavu.',
    externalUrl: 'https://orloj.eu',
    kategorie: 'orloj',
  },
  {
    rok: 2025,
    titulek: 'ASTRO2 — astronomické hodiny ESP01S',
    popis: 'DIY hodiny s NTP synchronizací a výpočty dle Computu, naprogramované s pomocí AI.',
    slug: 'astro2_NTP',
    kategorie: 'projekty',
  },
];
