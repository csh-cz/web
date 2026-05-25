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
    doklad: 'Městský orloj a hodinář povolaný z Vratislavi.',
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
    doklad: 'Zmínka „domus Orleyste" v radních účtech; roku 1381 první výslovné „horologium".',
    presnost: 'dolozeno',
    pramen: 'Jecht 1910 — Codex diplomaticus Lusatiae Superioris',
    zoteroKey: 'N4BXBQSK',
    milnikId: 'zhorelec-1377',
  },
  {
    rok: 1379,
    rokText: '1379',
    mesto: 'Praha',
    region: 'cechy',
    doklad: 'Hodinář Martin doložen ve sporu s Johannem Tostem — nejstarší pražský hodinář.',
    presnost: 'dolozeno',
    pramen: 'Vyšehrad — městské knihy (rkp.)',
    zoteroKey: 'CGCLGE2L',
    milnikId: 'vysehrad-1379',
  },
  {
    rok: 1387,
    rokText: '1387',
    mesto: 'České Budějovice',
    region: 'cechy',
    doklad: 'Listina o městském orloji — nejstarší doklad měření času v jižních Čechách.',
    presnost: 'dolozeno',
    pramen: 'Listina, 1387 (Nejstarší hodiny v českých zemích)',
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
    pramen: 'Archivní zmínka (rkp.)',
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
    pramen: 'Záznam o hodinách na hradě Lipnici (rkp.)',
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
    pramen: 'Vyšehrad — městské knihy (rkp.)',
    zoteroKey: 'TJFIMDUK',
  },
  {
    rok: 1420,
    rokText: '1420',
    mesto: 'Jihlava',
    region: 'morava',
    doklad: 'Notář Ondřej Czlewinger pamatuje v závěti na orloj u kostela sv. Kříže.',
    presnost: 'dolozeno',
    pramen: 'Závěť notáře Czlewingera (rkp.)',
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
    pramen: 'Nejstarší hodiny v českých zemích (rkp.)',
    zoteroKey: 'FPYIR79N',
  },
  {
    rok: 1494,
    rokText: '1494',
    mesto: 'Kolín nad Labem',
    region: 'cechy',
    doklad: 'Smlouva o opravě poškozené kostelní klenby v souvislosti s věžními hodinami.',
    presnost: 'neprime',
    pramen: 'Nejstarší hodiny v českých zemích (rkp.)',
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
    pramen: 'Archivní zmínka (rkp.)',
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
    rok: 1570,
    rokText: '1570',
    mesto: 'Ústí nad Labem',
    region: 'cechy',
    doklad: 'Renesanční radnice (stržena 1846); orloj doložen nepřímo.',
    presnost: 'neprime',
    pramen: 'Nejstarší hodiny v českých zemích (rkp.)',
    zoteroKey: '9ICDCNYK',
  },
  {
    rok: 1575,
    rokText: '1575',
    mesto: 'Litoměřice',
    region: 'cechy',
    doklad: 'Smlouva s hodinářem Pavlem na orloj „jako v Praze"; postaven roku 1578.',
    presnost: 'dolozeno',
    pramen: 'Český sever 1886 — Denní kronika',
    zoteroKey: '92N69QIX',
  },
  {
    rok: 1578,
    rokText: '1578',
    mesto: 'Most (Brüx)',
    region: 'cechy',
    doklad: 'Sbírka na obnovu pohořelého orloje.',
    presnost: 'dolozeno',
    pramen: 'Archivní zmínka, fol. 313r–314r (rkp.)',
    zoteroKey: '63Q9AXDD',
  },
  {
    rok: 1581,
    rokText: '1581',
    mesto: 'Hradec Králové',
    region: 'cechy',
    doklad: 'Hodiny na Bílé věži (1585); hodinář Vavřinec (1591).',
    presnost: 'dolozeno',
    pramen: 'Archivní zmínka (rkp.)',
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
    pramen: 'Archivní zmínka (rkp.)',
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
