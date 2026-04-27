/**
 * Souřadnice věžních hodin a dalších lokací zmíněných na webu.
 * Kdykoli najdeš nový orloj nebo věž, doplň ji sem.
 */

export interface Lokace {
  slug: string;
  jmeno: string;
  zeme: 'CZ' | 'DE' | 'IT' | 'SK' | 'AT' | 'CH' | 'KR' | 'FR' | 'BE' | 'ES';
  lat: number;
  lon: number;
  rok?: number | string;
  popis?: string;
  expozice?: boolean;
}

export const lokace: Lokace[] = [
  // Hodinárium samo
  {
    slug: 'decin_zamek',
    jmeno: 'Hodinárium Děčín',
    zeme: 'CZ',
    lat: 50.7807,
    lon: 14.2155,
    popis: 'Fyzická expozice na zámku Děčín',
    expozice: true,
  },

  // České věžní hodiny
  { slug: 'sobeslav3', jmeno: 'Soběslav — věžní stroj', zeme: 'CZ', lat: 49.2599, lon: 14.7195, rok: '~1484', popis: 'Možná nejstarší dochovaný věžní stroj v Čechách' },
  { slug: 'bychory_zvonici_stroj', jmeno: 'Bychory', zeme: 'CZ', lat: 50.0436, lon: 15.2628, popis: 'Věžní stroj z Bychor' },
  { slug: 'janovice', jmeno: 'Janovice', zeme: 'CZ', lat: 49.4214, lon: 13.2453, popis: 'Věžní hodiny' },
  { slug: 'rozmberk1', jmeno: 'Rožmberk nad Vltavou', zeme: 'CZ', lat: 48.6553, lon: 14.4119, popis: 'Věžní hodiny' },
  { slug: 'vez_Budislav', jmeno: 'Budislav', zeme: 'CZ', lat: 49.7569, lon: 16.2400, popis: 'Věžní hodiny' },
  { slug: 'vez_Kli', jmeno: 'Klí', zeme: 'CZ', lat: 50.7567, lon: 14.6028, popis: 'Věžní hodiny Krušnohoří' },
  { slug: 'vez_Prysk', jmeno: 'Prysk', zeme: 'CZ', lat: 50.7833, lon: 14.5167, popis: 'Věžní hodiny' },
  { slug: 'vez_Zlate_Hory', jmeno: 'Zlaté Hory', zeme: 'CZ', lat: 50.2611, lon: 17.3950, popis: 'Věžní hodiny' },
  { slug: 'tabor', jmeno: 'Tábor — orloj', zeme: 'CZ', lat: 49.4144, lon: 14.6578, popis: 'Orloj v Táboře' },
  { slug: 'litomysl', jmeno: 'Litomyšl — orloj', zeme: 'CZ', lat: 49.8722, lon: 16.3133, popis: 'Litomyšlský orloj' },
  { slug: 'olomouc', jmeno: 'Olomouc — orloj', zeme: 'CZ', lat: 49.5933, lon: 17.2508, popis: 'Olomoucký orloj' },
  { slug: 'prostejov', jmeno: 'Prostějov — orloj', zeme: 'CZ', lat: 49.4719, lon: 17.1117, popis: 'Prostějovský orloj' },
  { slug: 'novo_orloj', jmeno: 'Praha — Novoměstský orloj', zeme: 'CZ', lat: 50.0830, lon: 14.4214, popis: 'Novoměstský orloj' },
  { slug: 'nostic', jmeno: 'Praha — Nosticův palác', zeme: 'CZ', lat: 50.0879, lon: 14.4040, popis: 'Salónní orloj' },
  { slug: 'kardasova_recice', jmeno: 'Kardašova Řečice', zeme: 'CZ', lat: 49.1858, lon: 14.8533, popis: 'Věžní hodiny' },
  { slug: 'podebrady', jmeno: 'Poděbrady', zeme: 'CZ', lat: 50.1430, lon: 15.1186, popis: 'Věžní a fasádní hodiny' },

  // Praha
  { slug: 'orloj-praha', jmeno: 'Praha — Pražský orloj', zeme: 'CZ', lat: 50.0870, lon: 14.4208, rok: 1410, popis: 'Sesterský web orloj.eu', expozice: true },

  // Zahraniční orloje
  { slug: 'lubeck', jmeno: 'Lübeck', zeme: 'DE', lat: 53.8655, lon: 10.6866, popis: 'Hansovní město' },
  { slug: 'stralsund', jmeno: 'Stralsund', zeme: 'DE', lat: 54.3098, lon: 13.0824, popis: 'Hansovní město' },
  { slug: 'venecia', jmeno: 'Benátky — Torre dell\'Orologio', zeme: 'IT', lat: 45.4368, lon: 12.3389, rok: 1499, popis: 'Benátský orloj' },
  { slug: 'mantova', jmeno: 'Mantova — orloj', zeme: 'IT', lat: 45.1564, lon: 10.7914, popis: 'Mantovský orloj' },
  { slug: 'mindelheim', jmeno: 'Mindelheim', zeme: 'DE', lat: 48.0436, lon: 10.4856, popis: 'Hodiny Mindelheim' },
  { slug: 'schaffhausen', jmeno: 'Schaffhausen', zeme: 'CH', lat: 47.6970, lon: 8.6339, popis: 'Hodiny Schaffhausen' },

  // Slovensko
  { slug: 'orloje_2', jmeno: 'Slovensko — orloje', zeme: 'SK', lat: 48.7500, lon: 19.1500, popis: 'Slovenské orloje' },
];
