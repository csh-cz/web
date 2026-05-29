/**
 * Nejstarší hodiny v českých zemích — rejstřík z pramenů.
 *
 * Soupis nejstarších doložených městských (a několika hradních) hodin
 * a orlojů v zemích Koruny české, vytěžený z autorovy Zotero kolekce
 * „Nejstarší hodiny v českých zemích". Každé město = nejstarší doložený
 * záznam o hodinách; u velkých center (Praha, Olomouc) i více datapointů.
 *
 * `presnost` rozlišuje sílu dokladu:
 *   - 'dolozeno'  — přímý datovaný pramen o hodinách/orloji
 *   - 'ante-quem' — datum je terminus ante quem (např. rok zániku),
 *                   vznik je tedy starší, ale přesně nedoložený
 *   - 'neprime'   — datum z nepřímé souvislosti (oprava kostela, stavba
 *                   radnice), přímá zmínka hodin až později
 *
 * `milnikId` váže záznam na milník Časové osy (/casova-osa#milnik-<id>).
 * `zoteroKey` je editorský odkaz do autorovy knihovny (nerenderuje se).
 */

export type Region = 'cechy' | 'morava' | 'slezsko' | 'luzice';
export type Presnost = 'dolozeno' | 'ante-quem' | 'neprime';

export interface NejstarsiHodiny {
  rok: number;
  rokText: string;
  mesto: string;
  region: Region;
  /** Krátký popis dokladu (co je k roku doloženo). */
  doklad: string;
  presnost: Presnost;
  /** Krátká citace pramene („Autor rok — Titul" nebo „rkp." u archivní pozn.). */
  pramen: string;
  /** Lokální Zotero item key (editorský, nerenderuje se). */
  zoteroKey?: string;
  /** Id milníku v Časové ose, pokud tam záznam je. */
  milnikId?: string;
}

export const regionLabel: Record<Region, string> = {
  cechy: 'Čechy',
  morava: 'Morava',
  slezsko: 'Slezsko',
  luzice: 'Lužice',
};

export const presnostLabel: Record<Presnost, string> = {
  dolozeno: 'doloženo',
  'ante-quem': 'před tímto rokem',
  neprime: 'nepřímý doklad',
};

export const nejstarsiHodiny: NejstarsiHodiny[] = [
  {
    rok: 1368,
    rokText: '1368',
    mesto: 'Opava',
    region: 'slezsko',
    doklad: 'Městský orloj a hodinář povolaný k jeho stavbě z Vratislavi (Wrocław). Nepřímý doklad ustálené vratislavské hodinářské dílny v 60. letech 14. století. Opava patřila k Opavskému knížectví v rámci Slezska, součásti Zemí koruny české od r. 1335 do r. 1742 (postoupení Prusku).',
    presnost: 'dolozeno',
    pramen: 'Šigut 1961 — K dějinám opavského městského orloje',
    zoteroKey: 'MY7TMGR2',
    milnikId: 'opava-1368',
  },
  {
    rok: 1375,
    rokText: '1375',
    mesto: 'Kutná Hora',
    region: 'cechy',
    doklad: 'Účet za opravu střechy nad orlojem — orloj byl tehdy už v provozu.',
    presnost: 'dolozeno',
    pramen: 'Leminger 1926 — Umělecké řemeslo v Kutné Hoře',
    zoteroKey: 'L5R5XBM3',
    milnikId: 'kutna-hora-1375',
  },
  {
    rok: 1377,
    rokText: '1377',
    mesto: 'Zhořelec',
    region: 'luzice',
    doklad: 'Zmínka „domus Orleyste" v radních účtech; roku 1381 první výslovné „horologium". Zhořelec patřil k Horní Lužici, součásti Zemí koruny české od r. 1319/1329 (Jan Lucemburský) do bitvy na Bílé hoře, resp. Pražského míru 1635, kdy byla Lužice postoupena Sasku.',
    presnost: 'dolozeno',
    pramen: 'Jecht 1910 — Codex diplomaticus Lusatiae Superioris',
    zoteroKey: 'N4BXBQSK',
    milnikId: 'zhorelec-1377',
  },
  {
    rok: 1361,
    rokText: '1361–1403',
    mesto: 'Praha',
    region: 'cechy',
    doklad: 'Nejstarší jmenovitě doložený pražský hodinář — Martin „horologista, orlogiator, magister orlogii", titulovaný „Orologiator imperatoris" (dvorní hodinář Karla IV.). 1361 koupil dům 39/I + dům v Plathnergasse od malíře Jaxy. 1379 doložen ve sporu s kanovníkem Janem Tostem. † před 1403.',
    presnost: 'dolozeno',
    pramen: 'Tomek — Základy starého místopisu Pražského, Rejstřík osobních jmen, s. 92; Tadra 1896 — Soudní akta III, s. 343; Fischer 1966',
    zoteroKey: 'CGCLGE2L',
    milnikId: 'praha-martin-1361',
  },
  {
    rok: 1387,
    rokText: '1387',
    mesto: 'České Budějovice',
    region: 'cechy',
    doklad: 'Listina o městském orloji — nejstarší doklad měření času v jižních Čechách.',
    presnost: 'dolozeno',
    pramen: 'Köpl 1901 — Urkundenbuch der Stadt Budweis I, s. 235',
    zoteroKey: 'CCQDVM86',
    milnikId: 'ceske-budejovice-1387',
  },
  {
    rok: 1392,
    rokText: '1392',
    mesto: 'Olomouc',
    region: 'morava',
    doklad: '„Rector orologii" Mikuláš — raný správce městských hodin na Moravě.',
    presnost: 'dolozeno',
    pramen: 'Drábek 1957 — Olomoucký orloj',
    zoteroKey: 'WXVBZHNE',
    milnikId: 'olomouc-rector-1392',
  },
  {
    rok: 1397,
    rokText: '1397',
    mesto: 'Znojmo',
    region: 'morava',
    doklad: 'Připomínán orlojník (orloysta) Hanuš.',
    presnost: 'dolozeno',
    pramen: 'Polesný 1928 — Rejstřík r. 1397 města Znojma',
    zoteroKey: 'NBBB3L6Q',
    milnikId: 'znojmo-1397',
  },
  {
    rok: 1397,
    rokText: '1397',
    mesto: 'Lipnice (hrad)',
    region: 'cechy',
    doklad: 'Hodiny v hradní kapli — vzácný doklad hodin mimo městské prostředí.',
    presnost: 'dolozeno',
    pramen: 'Borový–Podlaha 1875 — Libri erectionum, s. 12',
    zoteroKey: 'YGLJAWGR',
    milnikId: 'lipnice-1397',
  },
  {
    rok: 1410,
    rokText: '1410',
    mesto: 'Praha — Staroměstský orloj',
    region: 'cechy',
    doklad: 'Orloj Mikuláše z Kadaně dle propočtů Jana Šindela — nejstarší orloj na světě stále v chodu.',
    presnost: 'dolozeno',
    pramen: 'Skála 2016 — Nový pohled na hypotézu o účasti Jana Šindela',
    zoteroKey: 'XRH6Z8SX',
    milnikId: 'prazsky-orloj-1410',
  },
  {
    rok: 1414,
    rokText: '1414',
    mesto: 'Vyšehrad',
    region: 'cechy',
    doklad: 'Orloj na Vyšehradě — orlojník odvádí dvě kopy grošů na daních.',
    presnost: 'dolozeno',
    pramen: 'Emler 1872 — Pozůstatky desk zemských II (k 31. 12. 1414)',
    zoteroKey: 'TJFIMDUK',
  },
  {
    rok: 1420,
    rokText: '1420',
    mesto: 'Jihlava',
    region: 'morava',
    doklad: 'Notář Ondřej Czlewinger pamatuje v závěti na orloj u kostela sv. Kříže.',
    presnost: 'dolozeno',
    pramen: 'Neumann 1930 — Nové prameny k dějinám husitství na Moravě, s. 213',
    zoteroKey: 'B83MDE9K',
    milnikId: 'jihlava-1420',
  },
  {
    rok: 1445,
    rokText: '1445',
    mesto: 'Náchod',
    region: 'cechy',
    doklad: 'Zámečník Matěj správcem hodin; stroj snad z Hradce nad Labem.',
    presnost: 'dolozeno',
    pramen: 'Hraše 1895 — Dějiny Náchoda',
    zoteroKey: '6Z7P4RRX',
  },
  {
    rok: 1469,
    rokText: '1469',
    mesto: 'Slaný',
    region: 'cechy',
    doklad: 'Zmínka o hodinách v panských počtech města.',
    presnost: 'dolozeno',
    pramen: 'Lacina — Paměti král. města Slaného',
    zoteroKey: '939CM3PV',
  },
  {
    rok: 1493,
    rokText: '1493',
    mesto: 'Jindřichův Hradec',
    region: 'cechy',
    doklad: 'Hodiny zhotovil mistr Hanuš z Prahy.',
    presnost: 'dolozeno',
    pramen: 'Registra purkmistrovská m. Jindřichova Hradce, 1493 (SOkA Jindřichův Hradec)',
    zoteroKey: 'FPYIR79N',
  },
  {
    rok: 1494,
    rokText: '1494',
    mesto: 'Kolín nad Labem',
    region: 'cechy',
    doklad: 'Smlouva o opravě poškozené kostelní klenby v souvislosti s věžními hodinami.',
    presnost: 'neprime',
    pramen: 'Vávra 1888 — Dějiny Královského města Kolína nad Labem',
    zoteroKey: 'CTNITCM9',
  },
  {
    rok: 1509,
    rokText: '1509',
    mesto: 'Kaňk (Kutná Hora)',
    region: 'cechy',
    doklad: 'U kostela sv. Vavřince doloženi hodinář Balzar a mistr Kunrát.',
    presnost: 'dolozeno',
    pramen: 'Braniš — Method 6',
    zoteroKey: 'MFPL4XBS',
    milnikId: 'kank-1509',
  },
  {
    rok: 1517,
    rokText: '1517',
    mesto: 'Louny',
    region: 'cechy',
    doklad: 'Obnova kostela po požáru; přímá zmínka hodin až později.',
    presnost: 'neprime',
    pramen: 'Antl 1876 — Příspěvek k stavbě Lounského kostela',
    zoteroKey: 'IZWZELX9',
  },
  {
    rok: 1519,
    rokText: '1519',
    mesto: 'Olomouc — radniční orloj',
    region: 'morava',
    doklad: 'První písemná zmínka o orloji na radnici; stroj vznikl patrně na přelomu 15. a 16. století.',
    presnost: 'dolozeno',
    pramen: 'Drábek 1957 — Olomoucký orloj',
    zoteroKey: 'WXVBZHNE',
    milnikId: 'olomoucky-orloj',
  },
  {
    rok: 1520,
    rokText: '1520',
    mesto: 'Budyně nad Ohří',
    region: 'cechy',
    doklad: 'Orloj na věži se připomíná již roku 1520.',
    presnost: 'dolozeno',
    pramen: 'Matějka 1898 — Soupis památek okresu roudnického, s. 22',
    zoteroKey: 'D4NR74T7',
  },
  {
    rok: 1550,
    rokText: '1550',
    mesto: 'Mladá Boleslav',
    region: 'cechy',
    doklad: 'Orloj na radnici dle kroniky Kezelia Bydžovského; hodinář Jan Péce.',
    presnost: 'dolozeno',
    pramen: 'Kezelius Bydžovský — Kronika mladoboleslavská',
    zoteroKey: 'RGIW62SZ',
  },
  {
    rok: 1559,
    rokText: '1559',
    mesto: 'Klatovy',
    region: 'cechy',
    doklad: 'Staročeský orloj přemístěný ze štítu radnice na Černou věž (stavěnou 1559).',
    presnost: 'dolozeno',
    pramen: 'Archivní zmínka (rkp.)',
    zoteroKey: '48XVU977',
  },
  {
    rok: 1591,
    rokText: '1591–1614 — † 1846',
    mesto: 'Ústí nad Labem',
    region: 'cechy',
    doklad: 'Astronomický orloj na renesanční ústecké radnici (dokončení 1591 dle Sonnewenda, stržená 1846): bití na čtvrti, figurální automat (pohyb rukou a úst), ukazatel planet a Měsíce. Tichtenbaum (1614) jej zařazuje k „českým hodinám" (24hodinové počítání po staroměstském způsobu), na rozdíl od „německých" hodin na domě bratrstva Božího Těla (1613). Sonnewend (1855) zaznamenává na fasádě radnice letopočty 1591 (se zkratkou G. W., patrně pobožná invokace „Gott walte") a 1774 (J. J. N. Anno = In Iesu Nomine, „Ve jménu Ježíšově") — vážou se k zhotovení a opravě budovy. Autor stroje neznámý.',
    presnost: 'dolozeno',
    pramen: 'Tichtenbaum 1614 — Usta ad Albim delineata, cit. Marian 1903 (Alt-Aussig), s. 9; Sonnewend 1855 (Geschichte der königlichen Freistadt Aussig, 2. vyd.), s. 190–191',
    zoteroKey: 'PINZU39Z',
    milnikId: 'usti-orloj-1591',
  },
  {
    rok: 1575,
    rokText: '1575–1598',
    mesto: 'Litoměřice',
    region: 'cechy',
    doklad: 'Smlouva ve středu po sv. Lucii 1575 mezi purkmistrem a Pavlem Frejlichem na orloj „jako v Praze na Starým Městě a ještě mnohem nad pražský způsobnější", za 400 kop míšenských. Stroj 1578 dodán, ale neinstalován; starší syn Vavřinec přijel zkontrolovat, ale záhy zemřel a k dokončení nedošlo. Roku 1598 zakázku na dokončení převzal mladší syn Adam Frejlich. Orloj sloužil ještě ve 30. letech 19. století, dnes nedochován.',
    presnost: 'dolozeno',
    pramen: 'Archiv města Litoměřice, Pamětní kniha městských písařů 1570–1612, sig. I V B 1 a, fol. 48; Knespl 2024 (SOkA Litoměřice, IV D 2:3.5.1)',
    zoteroKey: '92N69QIX',
    milnikId: 'litomericky-orloj-1578',
  },
  {
    rok: 1578,
    rokText: '1578',
    mesto: 'Most (Brüx)',
    region: 'cechy',
    doklad: 'Sbírka na obnovu pohořelého orloje.',
    presnost: 'dolozeno',
    pramen: 'AHMP — sbírka na obnovu mosteckého orloje, 1578, fol. 313r–314r',
    zoteroKey: '63Q9AXDD',
  },
  {
    rok: 1581,
    rokText: '1581',
    mesto: 'Hradec Králové',
    region: 'cechy',
    doklad: 'Hodiny na Bílé věži (1585); hodinář Vavřinec (1591).',
    presnost: 'dolozeno',
    pramen: 'Památky archaeologické a místopisné IV, 1858, s. 183',
    zoteroKey: 'MN2WTGNU',
  },
  {
    rok: 1589,
    rokText: '1589',
    mesto: 'Jičín',
    region: 'cechy',
    doklad: 'Požár zničil orloj na velké věži — doklad jeho existence před tímto rokem.',
    presnost: 'dolozeno',
    pramen: 'Archivní zmínka (rkp.)',
    zoteroKey: 'TRDSSNMK',
  },
  {
    rok: 1656,
    rokText: '1656',
    mesto: 'Tábor',
    region: 'cechy',
    doklad: 'Vyobrazení orloje na radnici (ikonografický doklad).',
    presnost: 'dolozeno',
    pramen: 'Thir 1895 — Hradiště hory Tábor',
    zoteroKey: 'RCG9MCDC',
  },
  {
    rok: 1747,
    rokText: 'před 1747',
    mesto: 'Domažlice',
    region: 'cechy',
    doklad: 'Staročeský orloj na věži, zničený při požáru roku 1747.',
    presnost: 'ante-quem',
    pramen: 'Lehner 1895 — Domažlice',
    zoteroKey: 'EZ2QT5HZ',
  },
  {
    rok: 1791,
    rokText: 'před 1791',
    mesto: 'Dvůr Králové n. L.',
    region: 'cechy',
    doklad: 'Staročeský orloj na Šindelářské bráně, ukazující a bijící 24 hodin; roku 1791 sundán.',
    presnost: 'ante-quem',
    pramen: 'Světozor 1867 — roč. I, č. 10, s. 96',
    zoteroKey: 'YUA932QP',
  },
];

/** Města zmíněná v pramenech, ale bez jednoznačného data hodin. */
export const nedolozenaMesta = [
  'Litomyšl',
  'Havlíčkův (Německý) Brod',
  'Rakovník',
  'Vratislav (Wrocław)',
];

/** Zastřešující přehledové prameny ke kolekci. */
export const prehledovePrameny = [
  {
    text: 'ŠOLC, Jindřich. Zaniklé orloje v Čechách. 2009.',
    zoteroKey: '9KKXJCBM',
  },
  {
    text: 'Nejstarší hodiny a hodináři v českých městech (souhrnná studie).',
    zoteroKey: '5GABPFQ6',
  },
];
