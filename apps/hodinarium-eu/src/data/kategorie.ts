/**
 * Kurátorská metadata pro každou kategorii — intro, featured slugy, doplňkové odkazy.
 *
 * Taxonomie 2026-04 (6 hlavních + Kronika jako vlastní collection):
 *   sbirka            — exponáty spolku
 *   konstrukce        — mechanismy a principy hodin obecně
 *   projekty          — DIY autorské konstrukce
 *   virtualni-muzeum  — zajímavé hodiny mimo sbírku
 *   muzea             — sister muzea, přehledy sbírek
 *   zajimavosti       — eseje o čase, kalendáře, časoměrné systémy
 *
 * Kronika má vlastní landing /kronika/index.astro (chronologický feed).
 * Hodináři jsou cross-cut na /hodinari/.
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
    podnadpis: 'Exponáty Hodinária — vystavené i depozit',
    intro:
      'Konkrétní hodiny ve sbírce spolku — vystavené v Hodináriu na zámku Děčín nebo v depozitáři. ' +
      'Věžní stroje, mateční hodiny, restaurované, švarcvaldky, sběratelské kuriozity. Každý článek = jeden exponát.',
    featuredSlugs: ['akvizice-2015-2025', 'bychory_prokes1', 'brillie', 'svarcvaldky'],
    doplnky: [
      { jmeno: 'Mapa expozice', href: '/mapa', ikona: 'mapa' },
      { jmeno: 'Zámek Děčín', href: 'https://www.zamekdecin.cz/vystavy/vystava-decinske-hodinarium', ikona: 'sluzba' },
    ],
  },
  konstrukce: {
    slug: 'konstrukce',
    jmeno: 'Konstrukce',
    podnadpis: 'Mechanismy, principy a fungování hodin',
    intro:
      'Jak hodiny fungují. Kroky, kyvadla, soukolí, pohony (závaží, péro, elektřina, pneumatika), regulátory, ' +
      'synchronizace, časoměrné systémy. Obecná pojednání napříč více hodinami, ne o konkrétním exempláři.',
    featuredSlugs: ['synchronizace_hodin', 'pulsynetic', 'flying_pendulum', 'svarcvaldky_stroje'],
  },
  projekty: {
    slug: 'projekty',
    jmeno: 'Projekty',
    podnadpis: 'DIY autorské konstrukce spolku',
    intro:
      'Vlastní konstrukce — NTP servery na ESP8266, atomovky pro Hodinárium, GPS synchronizace, ' +
      'JS simulátory historických hodin. Pro maker komunitu i pro výklad expozice.',
    featuredSlugs: ['astro2_NTP', 'Arduino', 'GPS_Sakul', 'PRS10'],
  },
  'virtualni-muzeum': {
    slug: 'virtualni-muzeum',
    jmeno: 'Virtuální muzeum',
    podnadpis: 'Zajímavé hodiny mimo sbírku spolku',
    intro:
      'Hodiny, které nemáme ve sbírce, ale stojí za ukázku — světově významné, kuriózní, historicky důležité. ' +
      'Janovický kostel, květinové hodiny ve Světě, Tim Hunkin, Marc Betrisey, hodiny zmizelé.',
    featuredSlugs: ['janovice', 'kvetinove', 'tabor', 'TimHunkin'],
  },
  muzea: {
    slug: 'muzea',
    jmeno: 'Muzea',
    podnadpis: 'Muzea hodin a přehledy sbírek',
    intro:
      'Hodinářská muzea v Česku i ve světě. Mindelheim, Greenwich Maritime, Království času Protivín, ' +
      'a přehled českých sbírek a webů.',
    featuredSlugs: ['mindelheim', 'kralovstvi-casu', 'muzea_cr', 'vezni_muzejicko_evropa'],
    doplnky: [
      { jmeno: 'Mapa míst', href: '/mapa', ikona: 'mapa' },
    ],
  },
  zajimavosti: {
    slug: 'zajimavosti',
    jmeno: 'Zajímavosti',
    podnadpis: 'Eseje o čase, kalendáře, časoměrné systémy',
    intro:
      'Téma času. Římský kalendář, časová pásma, 12 vs 24 hodinové dělení dne, kvalifikované časové razítko, ' +
      'literatura. Co je čas a jak ho měříme.',
    featuredSlugs: ['mereni_casu', 'kalendar_rimsky', 'casova_pasma', '12_24'],
  },
};
