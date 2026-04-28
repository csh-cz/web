/**
 * Souřadnice věžních hodin a dalších lokací zmíněných na webu.
 *
 * Typy:
 *   - 'puvod'      = místo, odkud pochází stroj nebo exponát v Hodináriu
 *                    (např. soběslavský stroj v expozici Děčín → Soběslav)
 *   - 'expozice'   = veřejně přístupná hodinářská expozice nebo slavný orloj
 *                    (Hodinárium Děčín, Pražský orloj, Lübeck, …)
 *   - 'zajimavost' = horologická zajímavost mimo úzkou kategorii expozic
 *                    (muzea, věžní hodiny ve veřejném prostoru, výrobní lokality)
 *
 * Některé lokace mají dva typy (např. Pražský orloj = expozice + zajímavost).
 * Pro mapu se primární typ vybírá podle pole `typ`.
 */

export interface Lokace {
  slug: string;
  jmeno: string;
  zeme: 'CZ' | 'DE' | 'IT' | 'SK' | 'AT' | 'CH' | 'KR' | 'FR' | 'BE' | 'ES';
  lat: number;
  lon: number;
  rok?: number | string;
  popis?: string;
  /** Hlavní expozice — má vlastní pin styl. */
  expozice?: boolean;
  typ: 'puvod' | 'expozice' | 'zajimavost';
  /** Oficiální web muzea / instituce (pro /expozice katalog). */
  web?: string;
}

export const lokace: Lokace[] = [
  // ─── Hodinárium samo ───
  {
    slug: 'decin_zamek',
    jmeno: 'Hodinárium Děčín',
    zeme: 'CZ',
    lat: 50.7807,
    lon: 14.2155,
    popis: 'Fyzická expozice Českého spolku horologického na zámku Děčín — věžní stroje, švarcvaldky, elektrické a mechanické hodiny',
    expozice: true,
    typ: 'expozice',
    web: 'https://www.zamekdecin.cz/program/vystava-decinske-hodinarium',
  },

  // ─── Původ věžních strojů v Hodináriu ───
  { slug: 'sobeslav3', jmeno: 'Soběslav — věžní stroj', zeme: 'CZ', lat: 49.2599, lon: 14.7195, rok: '~1484', popis: 'Možná nejstarší dochovaný věžní stroj v Čechách', typ: 'puvod' },
  { slug: 'bychory_zvonici_stroj', jmeno: 'Bychory', zeme: 'CZ', lat: 50.0436, lon: 15.2628, popis: 'Věžní stroj z Bychor (Jan Prokeš, 1868)', typ: 'puvod' },
  { slug: 'janovice', jmeno: 'Janovice', zeme: 'CZ', lat: 49.4214, lon: 13.2453, rok: 1899, popis: 'Věžní hodinový stroj kostela sv. Josefa (Liebing)', typ: 'puvod' },
  { slug: 'rozmberk1', jmeno: 'Rožmberk nad Vltavou', zeme: 'CZ', lat: 48.6553, lon: 14.4119, popis: 'Věžní hodiny', typ: 'puvod' },
  { slug: 'vez_Budislav', jmeno: 'Budislav', zeme: 'CZ', lat: 49.7569, lon: 16.2400, popis: 'Věžní hodiny', typ: 'puvod' },
  { slug: 'vez_Kli', jmeno: 'Klí', zeme: 'CZ', lat: 50.7567, lon: 14.6028, popis: 'Věžní hodiny Krušnohoří', typ: 'puvod' },
  { slug: 'vez_Prysk', jmeno: 'Prysk', zeme: 'CZ', lat: 50.7833, lon: 14.5167, popis: 'Věžní hodiny', typ: 'puvod' },
  { slug: 'vez_Zlate_Hory', jmeno: 'Zlaté Hory', zeme: 'CZ', lat: 50.2611, lon: 17.3950, popis: 'Věžní hodiny', typ: 'puvod' },
  { slug: 'kardasova_recice', jmeno: 'Kardašova Řečice', zeme: 'CZ', lat: 49.1858, lon: 14.8533, popis: 'Věžní hodiny — rod Mánesů', typ: 'puvod' },
  { slug: 'podebrady', jmeno: 'Poděbrady', zeme: 'CZ', lat: 50.1430, lon: 15.1186, popis: 'Věžní a fasádní hodiny', typ: 'puvod' },

  // ─── České orloje a hodinářské expozice ───
  { slug: 'orloj-praha', jmeno: 'Praha — Pražský orloj', zeme: 'CZ', lat: 50.0870, lon: 14.4208, rok: 1410, popis: 'Sesterský web orloj.eu', expozice: true, typ: 'expozice' },
  { slug: 'tabor', jmeno: 'Tábor — orloj', zeme: 'CZ', lat: 49.4144, lon: 14.6578, popis: 'Orloj v Táboře', typ: 'expozice' },
  { slug: 'litomysl', jmeno: 'Litomyšl — orloj', zeme: 'CZ', lat: 49.8722, lon: 16.3133, popis: 'Litomyšlský orloj — Karel Adamec, 1907', typ: 'expozice' },
  { slug: 'olomouc', jmeno: 'Olomouc — orloj', zeme: 'CZ', lat: 49.5933, lon: 17.2508, popis: 'Olomoucký orloj', typ: 'expozice' },
  { slug: 'prostejov', jmeno: 'Prostějov — orloj', zeme: 'CZ', lat: 49.4719, lon: 17.1117, popis: 'Prostějovský orloj', typ: 'expozice' },
  { slug: 'novo_orloj', jmeno: 'Praha — Novoměstský orloj', zeme: 'CZ', lat: 50.0830, lon: 14.4214, popis: 'Novoměstský orloj', typ: 'expozice' },
  { slug: 'nostic', jmeno: 'Praha — Nosticův palác', zeme: 'CZ', lat: 50.0879, lon: 14.4040, popis: 'Salónní orloj', typ: 'expozice' },

  // ─── Zahraniční expozice a orloje ───
  { slug: 'lubeck', jmeno: 'Lübeck', zeme: 'DE', lat: 53.8655, lon: 10.6866, popis: 'Hansovní město — astronomický orloj v Mariánském kostele', typ: 'expozice' },
  { slug: 'stralsund', jmeno: 'Stralsund', zeme: 'DE', lat: 54.3098, lon: 13.0824, popis: 'Hansovní město — orloj v Mariánském kostele', typ: 'expozice' },
  { slug: 'venecia', jmeno: 'Benátky — Torre dell\'Orologio', zeme: 'IT', lat: 45.4368, lon: 12.3389, rok: 1499, popis: 'Benátský orloj na náměstí sv. Marka', typ: 'expozice' },
  { slug: 'mantova', jmeno: 'Mantova — orloj', zeme: 'IT', lat: 45.1564, lon: 10.7914, popis: 'Mantovský orloj na Palazzo della Ragione', typ: 'expozice' },
  { slug: 'mindelheim', jmeno: 'Mindelheim — Turmuhrenmuseum', zeme: 'DE', lat: 48.0436, lon: 10.4856, popis: 'Bavorské muzeum věžních hodin', typ: 'expozice', web: 'https://www.mindelheim.de/leben-erleben/freizeit-und-sport/sehenswuerdigkeiten/turmuhrenmuseum' },
  { slug: 'schaffhausen', jmeno: 'Schaffhausen', zeme: 'CH', lat: 47.6970, lon: 8.6339, popis: 'IWC Schaffhausen Museum a věžní hodiny v pevnosti Munot', typ: 'expozice', web: 'https://www.iwc.com/en/iwc-museum.html' },
  { slug: 'orloje_2', jmeno: 'Slovensko — orloje', zeme: 'SK', lat: 48.7500, lon: 19.1500, popis: 'Slovenské orloje (Stará Bystrica, Banská Bystrica, …)', typ: 'expozice' },
  { slug: 'kralovstvi-casu', jmeno: 'Protivín — Království času', zeme: 'CZ', lat: 49.1992, lon: 14.2153, popis: 'Soukromá hodinářská expozice v secesní vile z roku 1907 — přes 1200 exponátů, dětský prostor a kavárna', typ: 'expozice', web: 'https://kralovstvicasu.cz/' },

  // ─── Další horologické zajímavosti ───
  { slug: 'glashutte', jmeno: 'Glashütte — Deutsches Uhrenmuseum', zeme: 'DE', lat: 50.8499, lon: 13.7820, popis: 'Saské hodinářské centrum — A. Lange & Söhne, Glashütte Original a německé hodinářské muzeum', typ: 'zajimavost', web: 'https://www.uhrenmuseum-glashuette.com/' },
  { slug: 'la-chaux-de-fonds', jmeno: 'La Chaux-de-Fonds — MIH', zeme: 'CH', lat: 47.0996, lon: 6.8267, popis: 'Musée International d\'Horlogerie — vrcholná světová sbírka v hodinářské kolébce Švýcarska', typ: 'zajimavost', web: 'https://www.chaux-de-fonds.ch/musees/mih' },
  { slug: 'greenwich', jmeno: 'Greenwich — Royal Observatory', zeme: 'DE', lat: 51.4779, lon: 0.0015, popis: 'Královská observatoř, Harrisonovy mořské chronometry H1—H4, nultý poledník GMT', typ: 'zajimavost', web: 'https://www.rmg.co.uk/royal-observatory' },
  { slug: 'wien-uhrenmuseum', jmeno: 'Wien — Uhrenmuseum', zeme: 'AT', lat: 48.2104, lon: 16.3677, popis: 'Vídeňské muzeum hodin v paláci Obizzi (Wien Museum)', typ: 'zajimavost', web: 'https://www.wienmuseum.at/de/standorte/uhrenmuseum' },
  { slug: 'furtwangen', jmeno: 'Furtwangen — Deutsches Uhrenmuseum', zeme: 'DE', lat: 48.0531, lon: 8.2092, popis: 'Schwarzwaldské muzeum hodin — kolébka kukačkových hodin a komplexní expozice mechanického hodinářství', typ: 'zajimavost', web: 'https://www.deutsches-uhrenmuseum.de/' },
];
