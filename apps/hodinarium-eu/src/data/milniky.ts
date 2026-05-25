/**
 * Milníky dějin měření času a vývoje hodinařiny — pro Časovou osu.
 *
 * Koncept „Řeka času": dva proudy událostí kolem centrální osy.
 *   - oblast: 'svet'        → světový kontext (levý proud)
 *   - oblast: 'ceske-zeme'  → české země (pravý proud)
 * Český proud se „připojuje" až od konce 14. století (Zhořelec 1377,
 * pražský orloj 1410) — divák vidí, jak se domácí hodinářství zapojuje
 * do světového příběhu.
 *
 * Většina událostí je podložena pramenem z autorovy Zotero knihovny
 * (`zoteroKey` = lokální item key, editorský odkaz; `zdroj` = krátká
 * citace pro zobrazení). Křížové odkazy (`clanek`/`krok`/`hodinar`/
 * `slovnik`/`kronika`/`externalUrl`) vážou milník na existující obsah webu.
 */

export type Epocha = 'starovek' | 'stredovek' | 'novovek' | 'prumysl' | 'moderni';
export type Oblast = 'svet' | 'ceske-zeme';
export type MilnikKategorie =
  | 'vynalez' // vynález, mechanismus, technický princip
  | 'osobnost' // hodinář, vynálezce, učenec
  | 'monument' // konkrétní hodiny / orloj / stavba
  | 'system' // časoměrný systém, kalendář, etalon
  | 'instituce'; // cech, škola, spolek, sdružení

export interface Milnik {
  /** Stabilní slug pro anchor (#milnik-<id>). */
  id: string;
  /** Řadicí rok (záporný = př. n. l.). */
  rok: number;
  /** Lidský zápis roku (např. „kolem 1300", „3. tis. př. n. l."). */
  rokText?: string;
  epocha: Epocha;
  oblast: Oblast;
  kategorie: MilnikKategorie;
  titulek: string;
  /** 1–2 věty. Smí obsahovat &nbsp; entity. */
  popis: string;

  // ── Křížové odkazy na obsah webu (vše volitelné) ──
  /** Slug článku/karty (resolve přes catalog.json). */
  clanek?: string;
  /** Slug hodinového kroku → /kroky/<slug>. */
  krok?: string;
  /** Slug medailonu hodináře → /hodinari/<slug>. */
  hodinar?: string;
  /** Slug slovníkového hesla → /slovnik/<slug>. */
  slovnik?: string;
  /** Slug záznamu kroniky → /kronika/<slug>. */
  kronika?: string;
  /** Externí odkaz (absolutní URL). */
  externalUrl?: string;

  // ── Pramen ──
  /** Krátká citace zobrazená u milníku („Autor rok — Titul"). */
  zdroj?: string;
  /** Lokální Zotero item key (editorský, nerenderuje se). */
  zoteroKey?: string;

  /** Override Font Awesome ikony (bez prefixu, např. „sun"). Default dle kategorie. */
  ikona?: string;
}

/** Epochy v pořadí — celošířkové pásy s perexem. */
export interface EpochaMeta {
  key: Epocha;
  jmeno: string;
  rozsah: string;
  perex: string;
}

export const epochy: EpochaMeta[] = [
  {
    key: 'starovek',
    jmeno: 'Starověk',
    rozsah: 'do roku 500',
    perex:
      'Čas se nejdřív čte z nebe a z vody. Gnómon vrhá stín, klepsydra odkapává hodiny noci. ' +
      'Z antického Středomoří pochází i první složité soukolí — Antikythérský mechanismus.',
  },
  {
    key: 'stredovek',
    jmeno: 'Středověk',
    rozsah: '500–1500',
    perex:
      'Islámský a čínský svět dovádí vodní hodiny k dokonalosti, než se na latinském Západě kolem ' +
      'roku 1300 zrodí mechanický stroj s lihýřem. Hodiny mizí z klášterů na městské věže — a koncem ' +
      '14. století se k příběhu připojují i české země.',
  },
  {
    key: 'novovek',
    jmeno: 'Raný novověk',
    rozsah: '1500–1750',
    perex:
      'Pružina zmenšuje hodiny na přenosné a kyvadlo s vláskem je proměňuje v přesný přístroj. ' +
      'V rudolfínské Praze pracuje Jošt Bürgi, na Staroměstské radnici tiká orloj.',
  },
  {
    key: 'prumysl',
    jmeno: 'Průmyslový věk',
    rozsah: '1750–1900',
    perex:
      'Harrisonův chronometr dobývá oceán, Big Ben odbíjí nad parlamentem. Hodinařina se ' +
      'industrializuje, vznikají cechy, odborné školy a první sítě veřejných hodin.',
  },
  {
    key: 'moderni',
    jmeno: 'Moderní doba',
    rozsah: '1900–dnes',
    perex:
      'Křemen a césium posouvají přesnost za hranice představ. Orloj přežívá válku i obnovu a ' +
      'měření času se stěhuje do satelitů, sítí a mikroprocesorů.',
  },
];

export const oblastLabel: Record<Oblast, string> = {
  svet: 'Svět',
  'ceske-zeme': 'České země',
};

export const kategorieLabel: Record<MilnikKategorie, string> = {
  vynalez: 'Vynález',
  osobnost: 'Osobnost',
  monument: 'Stavba a stroj',
  system: 'Časový systém',
  instituce: 'Instituce',
};

/** Default Font Awesome ikona (fa-solid) podle kategorie. */
export const kategorieIkona: Record<MilnikKategorie, string> = {
  vynalez: 'gear',
  osobnost: 'user',
  monument: 'landmark',
  system: 'calendar-days',
  instituce: 'building-columns',
};

export const milniky: Milnik[] = [
  // ───────────────────────── STAROVĚK ─────────────────────────
  {
    id: 'mezopotamie-pocitani-casu',
    rok: -2000,
    rokText: '2. tis. př. n. l.',
    epocha: 'starovek',
    oblast: 'svet',
    kategorie: 'system',
    titulek: 'Počítání času v Mezopotámii',
    popis:
      'Sumerské a babylonské správní texty dělí den a noc na úseky a zavádějí nejstarší doložené ' +
      'účetní měření času pro evidenci práce.',
    slovnik: 'slunecni-hodiny',
    zdroj: 'Englund 1988 — Administrative Timekeeping in Ancient Mesopotamia',
    zoteroKey: 'TTJWSQDI',
  },
  {
    id: 'egyptske-slunecni-hodiny',
    rok: -1500,
    rokText: 'kolem 1500 př. n. l.',
    epocha: 'starovek',
    oblast: 'svet',
    kategorie: 'vynalez',
    ikona: 'sun',
    titulek: 'Egyptské sluneční hodiny',
    popis:
      'Vápencový ostrakon z Údolí králů s namalovaným ciferníkem patří k nejstarším doloženým ' +
      'slunečním hodinám s jistou provenancí.',
    slovnik: 'gnomon',
    zdroj: 'Bickel & Gautschy 2014 — Eine ramessidische Sonnenuhr im Tal der Könige',
    zoteroKey: 'YEU3EC5L',
  },
  {
    id: 'klepsydra',
    rok: -1400,
    rokText: 'kolem 1400 př. n. l.',
    epocha: 'starovek',
    oblast: 'svet',
    kategorie: 'vynalez',
    ikona: 'droplet',
    titulek: 'Vodní hodiny — klepsydra',
    popis:
      'Egyptská a babylonská klepsydra měří nestejné noční hodiny tam, kde sluneční hodiny selhávají, ' +
      'a šíří se celým Předním východem.',
    clanek: 'vodni',
    zdroj: 'Britten 1922 — Old Clocks and Watches & Their Makers',
    zoteroKey: 'JHML26AN',
  },
  {
    id: 'ktesibios',
    rok: -250,
    rokText: 'kolem 250 př. n. l.',
    epocha: 'starovek',
    oblast: 'svet',
    kategorie: 'osobnost',
    titulek: 'Ktésibiova samočinná klepsydra',
    popis:
      'Alexandrijský mechanik Ktésibios zdokonalil vodní hodiny plovákovou regulací průtoku a ' +
      'ukazatelem hodin — jedno z prvních zpětnovazebních řízení v dějinách.',
    clanek: 'vodni',
    zdroj: 'Lepschy, Mian & Viaro 1992 — Feedback Control in Ancient Water and Mechanical Clocks',
    zoteroKey: 'YVSYLCP9',
  },
  {
    id: 'antikythera',
    rok: -150,
    rokText: 'kolem 150–80 př. n. l.',
    epocha: 'starovek',
    oblast: 'svet',
    kategorie: 'monument',
    ikona: 'gears',
    titulek: 'Antikythérský mechanismus',
    popis:
      'Řecký bronzový soukolový kalkulátor modeloval pohyby Slunce, Měsíce a planet — nejstarší ' +
      'dochované složité soukolí na světě.',
    zdroj: 'Freeth et al. 2021 — A Model of the Cosmos in the Antikythera Mechanism',
    zoteroKey: 'PVZW9GU5',
  },
  {
    id: 'anaforicke-hodiny',
    rok: 150,
    rokText: '2. století n. l.',
    epocha: 'starovek',
    oblast: 'svet',
    kategorie: 'vynalez',
    titulek: 'Anaforické hodiny a Věž větrů',
    popis:
      'Vitruviem popsané anaforické vodní hodiny s otáčejícím se hvězdným kotoučem; dochované úlomky ' +
      'pocházejí ze Salcburku a z Grand ve Francii.',
    zdroj: "Auber 2014 — L'orologio anaforico di Vitruvio",
    zoteroKey: '9HDFQYVI',
  },

  // ───────────────────────── STŘEDOVĚK ─────────────────────────
  {
    id: 'i-sing-cinsky-krok',
    rok: 725,
    rokText: 'kolem 725',
    epocha: 'stredovek',
    oblast: 'svet',
    kategorie: 'vynalez',
    titulek: 'Čínský vodní regulátor I-Singa',
    popis:
      'Tantrický mnich I-Sing sestrojil vodou poháněný regulační mechanismus — vzdálený předchůdce ' +
      'kroku — pohánějící armilární modely oblohy.',
    zdroj: 'Asprey 1973 — The Clockwork of the Heavens',
    zoteroKey: 'NN4LFV9R',
  },
  {
    id: 'toledske-vodni-hodiny',
    rok: 1075,
    rokText: 'kolem 1075',
    epocha: 'stredovek',
    oblast: 'svet',
    kategorie: 'monument',
    ikona: 'droplet',
    titulek: 'Toledské vodní hodiny',
    popis:
      'Monumentální andaluské vodní hodiny dokládají vrchol islámské hydromechaniky v maurském Španělsku.',
    clanek: 'vodni',
    zdroj: 'Hill 1994 — The Toledo Water-Clocks of c. 1075',
    zoteroKey: '8VR82XEM',
  },
  {
    id: 'su-song',
    rok: 1090,
    rokText: '1090',
    epocha: 'stredovek',
    oblast: 'svet',
    kategorie: 'monument',
    titulek: 'Hvězdářská věž Su Songa',
    popis:
      'Čínská vodou poháněná hvězdářská věž s řetězovým pohonem a článkovým regulátorem — vrchol ' +
      'předmechanické horologie.',
    zdroj: 'Asprey 1973 — The Clockwork of the Heavens',
    zoteroKey: 'NN4LFV9R',
  },
  {
    id: 'al-dzazari',
    rok: 1206,
    rokText: '1206',
    epocha: 'stredovek',
    oblast: 'svet',
    kategorie: 'osobnost',
    titulek: 'al-Džazarího Kniha důmyslných zařízení',
    popis:
      'al-Džazarí sepsal ilustrovaný traktát o vodních hodinách a automatech (sloní hodiny), který ' +
      'předal antickou mechanickou tradici Evropě.',
    zdroj: 'Snyder 2021 — al-Jazari, The Book of Knowledge of Ingenious Mechanical Devices',
    zoteroKey: 'NLQ5CVJL',
  },
  {
    id: 'vretenovy-krok-vynalez',
    rok: 1280,
    rokText: 'konec 13. století',
    epocha: 'stredovek',
    oblast: 'svet',
    kategorie: 'vynalez',
    titulek: 'Vynález lihýřového kroku',
    popis:
      'Lihýř s vahadlem (vřetenový krok) je klíčová novinka, jež oddělila mechanické hodiny od ' +
      'klepsydry a dala vzniknout celé evropské hodinařině.',
    krok: 'vretenovy-krok',
    zdroj: 'Blumenthal & Nosonovsky 2020 — Friction and Dynamics of Verge and Foliot',
    zoteroKey: 'GFCIRZL3',
  },
  {
    id: 'dunstable',
    rok: 1283,
    rokText: '1283',
    epocha: 'stredovek',
    oblast: 'svet',
    kategorie: 'monument',
    titulek: 'První mechanické věžní hodiny',
    popis:
      'V anglickém Dunstable vznikly patrně první mechanické věžní hodiny s lihýřem a vahadlem — ' +
      'počátek éry věžního hodinářství.',
    krok: 'vretenovy-krok',
    zdroj: 'Nosonovsky 2024 — Early Renaissance Concepts of Time and the Invention of Mechanical Clocks',
    zoteroKey: 'RHHYLVK9',
  },
  {
    id: 'strasbourg-orloj-1',
    rok: 1352,
    rokText: '1352–1354',
    epocha: 'stredovek',
    oblast: 'svet',
    kategorie: 'monument',
    titulek: 'První štrasburský orloj',
    popis:
      'Ve štrasburské katedrále vznikl první ze tří slavných orlojů — kosmologický model s ' +
      'astrolábovým ciferníkem a mechanickým kohoutem.',
    slovnik: 'orloj',
    zdroj: 'Oestmann 2020 — The Astronomical Clock of Strasbourg Cathedral',
    zoteroKey: 'KPB743UX',
  },
  {
    id: 'dondi-astrarium',
    rok: 1364,
    rokText: '1364',
    epocha: 'stredovek',
    oblast: 'svet',
    kategorie: 'monument',
    ikona: 'gears',
    titulek: 'Astrarium Giovanniho de’ Dondi',
    popis:
      'Padovský lékař Dondi dokončil planetární astrarium popsané v traktátu Tractatus astrarii — ' +
      'nejsložitější soukolí své doby.',
    zdroj: 'Bedini & Maddison 1966 — Mechanical Universe: The Astrarium of Giovanni de’ Dondi',
    zoteroKey: 'H868QUKS',
  },
  {
    id: 'salisbury',
    rok: 1386,
    rokText: '1386',
    epocha: 'stredovek',
    oblast: 'svet',
    kategorie: 'monument',
    titulek: 'Hodiny katedrály v Salisbury',
    popis:
      'Doložené a snad dochované věžní hodiny v Salisbury patří k nejstarším dochovaným mechanickým ' +
      'strojům Evropy.',
    krok: 'vretenovy-krok',
    zdroj: 'McKay 1999 — The Turret Clock Keeper’s Handbook',
    zoteroKey: '6CWV6YDW',
  },
  {
    id: 'pohon-perem',
    rok: 1450,
    rokText: 'kolem 1450',
    epocha: 'stredovek',
    oblast: 'svet',
    kategorie: 'vynalez',
    titulek: 'Pohon perem (pružinou)',
    popis:
      'Nahrazení závaží nataženou pružinou umožnilo zmenšit hodinový stroj a otevřelo cestu k ' +
      'přenosným hodinám.',
    zdroj: 'Bray 2001 — Making Clocks',
    zoteroKey: 'H4LB9KDX',
  },

  // české země — připojení proudu
  {
    id: 'opava-1368',
    rok: 1368,
    rokText: '1368',
    epocha: 'stredovek',
    oblast: 'ceske-zeme',
    kategorie: 'monument',
    titulek: 'Opavský městský orloj',
    popis:
      'K roku 1368 je v Opavě doložen městský orloj i hodinář povolaný z Vratislavi — nejstarší ' +
      'dosud doložená zmínka o orloji v zemích Koruny české.',
    slovnik: 'orloj',
    zdroj: 'Šigut 1961 — K dějinám opavského městského orloje',
    zoteroKey: 'MY7TMGR2',
  },
  {
    id: 'kutna-hora-1375',
    rok: 1375,
    rokText: '1375',
    epocha: 'stredovek',
    oblast: 'ceske-zeme',
    kategorie: 'monument',
    titulek: 'Orloj v Kutné Hoře',
    popis:
      'Účet za opravu střechy nad orlojem z roku 1375 dokládá, že kutnohorský orloj byl v té době ' +
      'už v provozu.',
    slovnik: 'orloj',
    zdroj: 'Leminger 1926 — Umělecké řemeslo v Kutné Hoře',
    zoteroKey: 'L5R5XBM3',
  },
  {
    id: 'zhorelec-1377',
    rok: 1377,
    rokText: '1377',
    epocha: 'stredovek',
    oblast: 'ceske-zeme',
    kategorie: 'monument',
    titulek: 'Nejstarší zmínka o orloji ve Zhořelci',
    popis:
      'Zhořelecké radní účty z července 1377 zmiňují „domus Orleyste" — jedna z nejstarších ' +
      'dochovaných zmínek o věžních hodinách v zemích Koruny české. Roku 1381 následuje zápis o jejich opravě.',
    zdroj: 'Görlitzer Ratsrechnungen (ed. Jecht 1910)',
    zoteroKey: 'SC8D299S',
  },
  {
    id: 'vysehrad-1379',
    rok: 1379,
    rokText: '1379',
    epocha: 'stredovek',
    oblast: 'ceske-zeme',
    kategorie: 'osobnost',
    titulek: 'Hodináři na Vyšehradě',
    popis:
      'Spor Johanna Tosta z roku 1379 dokládá ranou přítomnost hodinářského řemesla v pražské aglomeraci.',
    zdroj: 'Tadra 1896 — Soudní akta konsistoře pražské III, s. 343',
    zoteroKey: 'CGCLGE2L',
  },
  {
    id: 'ceske-budejovice-1387',
    rok: 1387,
    rokText: '1387',
    epocha: 'stredovek',
    oblast: 'ceske-zeme',
    kategorie: 'monument',
    titulek: 'Listina o budějovickém orloji',
    popis:
      'Listina z roku 1387 dokládá městský orloj v Českých Budějovicích — nejstarší doklad měření ' +
      'času v jižních Čechách.',
    slovnik: 'orloj',
    zdroj: 'Köpl 1901 — Urkundenbuch der Stadt Budweis I, s. 235',
    zoteroKey: 'CCQDVM86',
  },
  {
    id: 'olomouc-rector-1392',
    rok: 1392,
    rokText: '1392',
    epocha: 'stredovek',
    oblast: 'ceske-zeme',
    kategorie: 'osobnost',
    titulek: 'Olomoucký „rector orologii" Mikuláš',
    popis:
      'K roku 1392 se v Olomouci uvádí „rector orologii Mikuláš" — raný správce městských hodin na Moravě.',
    slovnik: 'orlojnik',
    zdroj: 'Drábek 1957 — Olomoucký orloj',
    zoteroKey: 'WXVBZHNE',
  },
  {
    id: 'znojmo-1397',
    rok: 1397,
    rokText: '1397',
    epocha: 'stredovek',
    oblast: 'ceske-zeme',
    kategorie: 'osobnost',
    titulek: 'Znojemský orlojník Hanuš',
    popis:
      'K roku 1397 se ve Znojmě připomíná orlojník (orloysta) Hanuš — raný doklad hodinářské péče ' +
      'o městský orloj na jihu Moravy.',
    slovnik: 'orlojnik',
    zdroj: 'Polesný 1928 — Rejstřík r. 1397 města Znojma',
    zoteroKey: 'NBBB3L6Q',
  },
  {
    id: 'lipnice-1397',
    rok: 1397,
    rokText: '1397',
    epocha: 'stredovek',
    oblast: 'ceske-zeme',
    kategorie: 'monument',
    titulek: 'Hodiny na hradě Lipnici',
    popis:
      'K roku 1397 jsou doloženy hodiny v hradní kapli na Lipnici — vzácný doklad hodin mimo ' +
      'městské prostředí.',
    slovnik: 'orloj',
    zdroj: 'Borový–Podlaha 1875 — Libri erectionum, s. 12',
    zoteroKey: 'YGLJAWGR',
  },
  {
    id: 'prazsky-orloj-1410',
    rok: 1410,
    rokText: '1410',
    epocha: 'stredovek',
    oblast: 'ceske-zeme',
    kategorie: 'monument',
    ikona: 'star',
    titulek: 'Vznik staroměstského orloje',
    popis:
      'Pražský orloj sestrojil roku 1410 hodinář Mikuláš z Kadaně podle astronomických propočtů mistra ' +
      'Jana Šindela — nejstarší orloj na světě, který je dodnes v chodu.',
    clanek: 'muzeum-kadan-orloj',
    slovnik: 'orloj',
    externalUrl: 'https://orloj.eu',
    zdroj: 'Skála 2016 — Nový pohled na hypotézu o účasti Jana Šindela',
    zoteroKey: 'XRH6Z8SX',
  },
  {
    id: 'jihlava-1420',
    rok: 1420,
    rokText: '1420',
    epocha: 'stredovek',
    oblast: 'ceske-zeme',
    kategorie: 'monument',
    titulek: 'Jihlavský orloj u sv. Kříže',
    popis:
      'Notář Ondřej Czlewinger ve své závěti z roku 1420 pamatuje na orloj u kostela sv. Kříže v Jihlavě.',
    slovnik: 'orloj',
    zdroj: 'Neumann 1930 — Nové prameny k dějinám husitství na Moravě, s. 213',
    zoteroKey: 'B83MDE9K',
  },
  {
    id: 'mistr-hanus-1490',
    rok: 1490,
    rokText: 'kolem 1490',
    epocha: 'stredovek',
    oblast: 'ceske-zeme',
    kategorie: 'osobnost',
    titulek: 'Mistr Hanuš (Jan Růže) obnovuje orloj',
    popis:
      'Orlojník Jan Růže zvaný mistr Hanuš přestavěl staroměstský orloj a doplnil kalendáriovou desku; ' +
      's jeho jménem je spjata pověst o oslepení tvůrce.',
    externalUrl: 'https://orloj.eu',
    zdroj: 'Šíma 2009 — Za tajemstvím pražského orloje',
    zoteroKey: 'PQCDTXFW',
  },

  // ───────────────────────── RANÝ NOVOVĚK ─────────────────────────
  {
    id: 'kank-1509',
    rok: 1509,
    rokText: '1509',
    epocha: 'novovek',
    oblast: 'ceske-zeme',
    kategorie: 'monument',
    titulek: 'Orloj u sv. Vavřince na Kaňku',
    popis:
      'Roku 1509 zhotovili Balzar Hodinář a mistr Kunrát orloj pro kostel sv. Vavřince na Kaňku u Kutné Hory.',
    zdroj: 'Kaňk — místní prameny (rkp.)',
    zoteroKey: 'MFPL4XBS',
  },
  {
    id: 'norimberske-vejce',
    rok: 1510,
    rokText: 'kolem 1500–1510',
    epocha: 'novovek',
    oblast: 'svet',
    kategorie: 'osobnost',
    titulek: 'Norimberské vejce Petra Henleina',
    popis:
      'Norimberský zámečník Henlein sestrojil rané přenosné hodinky poháněné pružinou — „Nürnberger Ei".',
    zdroj: 'Dietzschold 1905 — Die Hemmungen der Uhren',
    zoteroKey: '3BFA92ND',
  },
  {
    id: 'olomoucky-orloj',
    rok: 1519,
    rokText: 'přelom 15./16. století',
    epocha: 'novovek',
    oblast: 'ceske-zeme',
    kategorie: 'monument',
    titulek: 'Olomoucký orloj',
    popis:
      'První písemná zmínka o olomouckém orloji je z roku 1519; stroj vznikl patrně na přelomu 15. a ' +
      '16. století na radnici v Olomouci.',
    slovnik: 'orloj',
    zdroj: 'Drábek 1957 — Olomoucký orloj',
    zoteroKey: 'WXVBZHNE',
  },
  {
    id: 'melanchthon-1530',
    rok: 1530,
    rokText: '1530',
    epocha: 'novovek',
    oblast: 'svet',
    kategorie: 'monument',
    titulek: 'Melanchthonovy kulové hodinky',
    popis:
      'Datované sférické hodinky filozofa Filipa Melanchthona patří k nejstarším dochovaným přenosným hodinkám.',
    zdroj: 'Wellington Gahtan 2001 — Gott allein die Ehre: Melanchthon’s Watch of 1530',
    zoteroKey: '983ZF928',
  },
  {
    id: 'strasbourg-orloj-2',
    rok: 1574,
    rokText: '1571–1574',
    epocha: 'novovek',
    oblast: 'svet',
    kategorie: 'monument',
    titulek: 'Druhý štrasburský orloj (Dasypodius)',
    popis:
      'Renesanční přestavba štrasburského orloje jako kosmologický model 16. století s automaty, ' +
      'kalendářem a planetárním ciferníkem.',
    slovnik: 'orloj',
    zdroj: 'Oestmann 1993 — Die astronomische Uhr des Straßburger Münsters',
    zoteroKey: 'V8392TC2',
  },
  {
    id: 'gregoriansky-kalendar',
    rok: 1582,
    rokText: '1582',
    epocha: 'novovek',
    oblast: 'svet',
    kategorie: 'system',
    titulek: 'Gregoriánská reforma kalendáře',
    popis:
      'Papež Řehoř XIII. zavedl gregoriánský kalendář a opravil odchylku juliánského roku — dodnes ' +
      'platný celosvětový časový systém.',
    clanek: 'kalendar-rimsky',
    zdroj: 'Wallis & Bede 1999 — Bede, The Reckoning of Time',
    zoteroKey: 'CNJ7TTKL',
  },
  {
    id: 'jost-burgi-1604',
    rok: 1604,
    rokText: '1604',
    epocha: 'novovek',
    oblast: 'ceske-zeme',
    kategorie: 'osobnost',
    titulek: 'Jošt Bürgi císařským hodinářem',
    popis:
      'V prosinci 1604 byl Jošt Bürgi jmenován dvorním hodinářem Rudolfa II.; v Praze pracoval u ' +
      'alchymistické laboratoře, vynálezce křížového kroku a první minutové ručky.',
    zdroj: 'Clark 2015 — Jost Bürgi’s Progreß Tabulen',
    zoteroKey: 'SUF28IY2',
  },
  {
    id: 'galileo-kyvadlo',
    rok: 1610,
    rokText: 'kolem 1602–1610',
    epocha: 'novovek',
    oblast: 'svet',
    kategorie: 'osobnost',
    titulek: 'Galileo a izochronie kyvadla',
    popis:
      'Galileo Galilei objevil přibližnou izochronii kyvadla, čímž připravil cestu k jeho použití ' +
      'jako regulátoru hodin.',
    slovnik: 'kyvadlo',
    zdroj: 'Newton 2004 — Galileo’s Pendulum',
    zoteroKey: 'JD34U7YN',
  },
  {
    id: 'orloj-1629',
    rok: 1629,
    rokText: '1629',
    epocha: 'novovek',
    oblast: 'ceske-zeme',
    kategorie: 'monument',
    titulek: 'Barokní obnova staroměstského orloje',
    popis:
      'Roku 1629 dala městská rada orloj po letech nečinnosti opravit; nápis „Senatus Populusque ' +
      'Pragensis horologium hoc renovatum" zdobil průčelí až do roku 1787.',
    externalUrl: 'https://orloj.eu',
    zdroj: 'Rosický 1923 — Staroměstský Orloj v Praze',
    zoteroKey: '7MXHCXS6',
  },
  {
    id: 'huygens-kyvadlo-1656',
    rok: 1656,
    rokText: '1656',
    epocha: 'novovek',
    oblast: 'svet',
    kategorie: 'vynalez',
    titulek: 'Huygensovy kyvadlové hodiny',
    popis:
      'Christiaan Huygens sestrojil první kyvadlové hodiny a cykloidními lícnicemi zlepšil jejich ' +
      'přesnost asi třicetkrát.',
    hodinar: 'christiaan-huygens',
    slovnik: 'kyvadlo',
    zdroj: 'Emmerson 2015 — Christiaan Huygens, the Pendulum and the Cycloid',
    zoteroKey: 'F684HW28',
  },
  {
    id: 'kotvovy-krok-1670',
    rok: 1670,
    rokText: 'kolem 1670',
    epocha: 'novovek',
    oblast: 'svet',
    kategorie: 'vynalez',
    titulek: 'Kotvový krok',
    popis:
      'Kotvový krok umožnil dlouhé sekundové kyvadlo s malým rozkmitem a stal se základem přesných ' +
      'stojacích hodin na další dvě staletí.',
    krok: 'kotvovy-krok',
    slovnik: 'kotva',
    zdroj: 'Stoimenov et al. 2012 — Evolution of Clock Escapement Mechanisms',
    zoteroKey: '85N3NAW6',
  },
  {
    id: 'vlasek-1675',
    rok: 1675,
    rokText: '1674–1675',
    epocha: 'novovek',
    oblast: 'svet',
    kategorie: 'vynalez',
    titulek: 'Setrvačka s vláskem',
    popis:
      'Huygens (a souběžně Robert Hooke) zavedli spirálový vlásek u setrvačky, čímž zpřesnili kapesní ' +
      'hodinky a umožnili vznik moderních hodinek.',
    hodinar: 'christiaan-huygens',
    slovnik: 'vlasek',
    zdroj: 'Du & Xie 2013 — The Mechanics of Mechanical Watches and Clocks',
    zoteroKey: 'HGJDZDL6',
  },
  {
    id: 'grahamuv-krok-1715',
    rok: 1715,
    rokText: '1715',
    epocha: 'novovek',
    oblast: 'svet',
    kategorie: 'vynalez',
    titulek: 'Grahamův klidový krok',
    popis:
      'George Graham zdokonalil klidový krok (deadbeat) a rtuťové kompenzační kyvadlo — standard ' +
      'přesných regulátorů 18. a 19. století.',
    krok: 'grahamuv-krok',
    hodinar: 'george-graham',
    zdroj: 'Frank 2013 — The Evolution of Tower Clock Movements',
    zoteroKey: 'HLAQ5V8P',
  },
  {
    id: 'prazsky-cech-1705',
    rok: 1705,
    rokText: '1705',
    epocha: 'novovek',
    oblast: 'ceske-zeme',
    kategorie: 'instituce',
    ikona: 'people-group',
    titulek: 'Pražský hodinářský cech',
    popis:
      'Pražští hodináři získali vlastní samostatný cech až roku 1705, po desetiletích sporů uvnitř ' +
      'smíšených řemeslných organizací.',
    zdroj: 'Schmidt — k dějinám pražského hodinářského cechu',
    zoteroKey: '87HPR85L',
  },
  {
    id: 'teicher-1735',
    rok: 1735,
    rokText: '1735',
    epocha: 'novovek',
    oblast: 'ceske-zeme',
    kategorie: 'monument',
    titulek: 'První tištěný popis pražského orloje',
    popis:
      'Andreas Gabriel Teicher vydal roku 1735 v němčině podrobný popis a návod k řízení staroměstského orloje.',
    externalUrl: 'https://orloj.eu',
    zdroj: 'Teicher 1735 — Beschreibung des Kunst-reichen Uhr-Wercks',
    zoteroKey: 'T9HYRTRH',
  },

  // ───────────────────────── PRŮMYSLOVÝ VĚK ─────────────────────────
  {
    id: 'harrison-h4-1761',
    rok: 1761,
    rokText: '1761',
    epocha: 'prumysl',
    oblast: 'svet',
    kategorie: 'osobnost',
    ikona: 'compass',
    titulek: 'Harrisonův lodní chronometr H4',
    popis:
      'John Harrison vyřešil problém zeměpisné délky na moři: chronometr H4 ztratil při plavbě na ' +
      'Barbados jen několik vteřin.',
    hodinar: 'john-harrison',
    slovnik: 'chronometr',
    zdroj: 'Bartky 2000 — Selling the True Time',
    zoteroKey: 'WLBGVUN7',
  },
  {
    id: 'landesperger-1787',
    rok: 1787,
    rokText: '1787',
    epocha: 'prumysl',
    oblast: 'ceske-zeme',
    kategorie: 'monument',
    titulek: 'Landespergerova oprava orloje',
    popis:
      'Hodinář Jan Landesperger opravil roku 1787 zchátralý staroměstský orloj nákladem 795 zlatých; ' +
      'roku 1791 následovaly další úpravy, stroj však záhy znovu utichl.',
    externalUrl: 'https://orloj.eu',
    zdroj: 'Erben 2016 — Zpráva o starobylém orloji',
    zoteroKey: '5EPYPG78',
  },
  {
    id: 'jednota-prumysl-1833',
    rok: 1833,
    rokText: '1833',
    epocha: 'prumysl',
    oblast: 'ceske-zeme',
    kategorie: 'instituce',
    titulek: 'Jednota ku povzbuzení průmyslu v Čechách',
    popis:
      'Roku 1833 vznikla v Praze Jednota ku povzbuzení průmyslu, která podporovala rozvoj řemesel ' +
      'včetně hodinářství a později i návrhy hodinářských škol.',
    zdroj: 'Maroszová 2023 — Jednota ku povzbuzení průmyslu v Čechách',
    zoteroKey: 'VJQVX3DT',
  },
  {
    id: 'big-ben-1859',
    rok: 1859,
    rokText: '1859',
    epocha: 'prumysl',
    oblast: 'svet',
    kategorie: 'monument',
    titulek: 'Big Ben a Grimthorpeův gravitační krok',
    popis:
      'Westminsterské věžní hodiny Edmunda Becketta (lorda Grimthorpe) s gravitačním krokem se staly ' +
      'technickým vrcholem věžní horologie.',
    clanek: 'big-ben-denisonuv-gravitacni-krok',
    krok: 'denisonuv-gravitacni-krok',
    zdroj: 'McKay 2010 — Big Ben: The Great Clock and the Bells at Westminster',
    zoteroKey: 'ICQ73E3Q',
  },
  {
    id: 'orloj-1865-manes',
    rok: 1865,
    rokText: '1865–1866',
    epocha: 'prumysl',
    oblast: 'ceske-zeme',
    kategorie: 'monument',
    titulek: 'Generální obnova orloje a Mánesův kalendář',
    popis:
      'Při velké obnově 1865–66 zhotovil hodinář Romuald Božek nový stroj, Josef Mánes namaloval ' +
      'kalendářní desku a Eduard Veselý vyřezal nové apoštoly; orloj byl zprovozněn 1. ledna 1866.',
    hodinar: 'romuald-bozek',
    externalUrl: 'https://orloj.eu',
    zdroj: 'Černá 2012 — Přehled výzkumu k obnově orloje 1864–1865',
    zoteroKey: 'TDWEVEBB',
  },
  {
    id: 'hodinarska-skola-1874',
    rok: 1874,
    rokText: '1874',
    epocha: 'prumysl',
    oblast: 'ceske-zeme',
    kategorie: 'instituce',
    ikona: 'graduation-cap',
    titulek: 'Návrh na zřízení hodinářské školy',
    popis:
      'Roku 1874 podal Kalluš Průmyslové jednotě návrh na zřízení odborné hodinářské školy — raný ' +
      'impuls k institucionalizaci výuky hodinářů v Čechách.',
    zdroj: 'Kalluš 1874 — Dopis Průmyslové jednotě o zřízení hodinářské školy',
    zoteroKey: 'BDMW3GD4',
  },
  {
    id: 'orloj-apostolove-1882',
    rok: 1882,
    rokText: '1882',
    epocha: 'prumysl',
    oblast: 'ceske-zeme',
    kategorie: 'monument',
    titulek: 'Pohyblivé figury apoštolů',
    popis:
      'O půlnoci 31. prosince 1882 byl orloj uveden do chodu s nově oživeným průvodem apoštolů a kohoutem.',
    externalUrl: 'https://orloj.eu',
    zdroj: 'Nedbal — Staroměstský orloj, apoštolové',
    zoteroKey: 'Z82UFNH6',
  },
  {
    id: 'susicky-ucebnice-1900',
    rok: 1900,
    rokText: '1900',
    epocha: 'prumysl',
    oblast: 'ceske-zeme',
    kategorie: 'system',
    ikona: 'book',
    titulek: 'Sušického učebnice hodinářství',
    popis:
      'Roku 1900 vyšla Sušického příručka „Hodinářství. Pro praktickou potřebu hodinářů a škol ' +
      'odborných" — odborná literatura pro vznikající hodinářské školství.',
    slovnik: 'krok',
    zdroj: 'Sušický 1900 — Hodinářství',
    zoteroKey: 'M2MD5J34',
  },

  // ───────────────────────── MODERNÍ DOBA ─────────────────────────
  {
    id: 'mater-clock-1923',
    rok: 1923,
    rokText: '1923',
    epocha: 'moderni',
    oblast: 'ceske-zeme',
    kategorie: 'system',
    titulek: 'Sítě mateřských hodin v Československu',
    popis:
      'Od roku 1923 přicházela do Československa technologie sítí centrálních (mateřských) hodin s ' +
      'německými kořeny — počátek elektrického měření času v zemi.',
    clanek: 'elektrina-ve-sluzbach-casu',
    zdroj: 'Hamr 2024 — Transfer of Master Clock Network Technology to Czechoslovakia',
    zoteroKey: 'KNKG36A7',
  },
  {
    id: 'kremen-cesium-1930',
    rok: 1930,
    rokText: '20. století',
    epocha: 'moderni',
    oblast: 'svet',
    kategorie: 'vynalez',
    ikona: 'atom',
    titulek: 'Křemenné a atomové hodiny',
    popis:
      'Křemenné hodiny s kmitajícím krystalem a později césiové atomové hodiny posunuly přesnost ' +
      'měření času k dříve nepředstavitelným hodnotám.',
    krok: 'elektronicky-krok',
    clanek: 'elektrina-ve-sluzbach-casu',
    zdroj: 'Katzir 2017 — Time Standards for the Twentieth Century: The Quartz Clock',
    zoteroKey: 'BNXNMLN7',
  },
  {
    id: 'orloj-1945',
    rok: 1945,
    rokText: '8. května 1945',
    epocha: 'moderni',
    oblast: 'ceske-zeme',
    kategorie: 'monument',
    ikona: 'fire',
    titulek: 'Zničení orloje za Pražského povstání',
    popis:
      '8. května 1945 zasáhla astroláb orloje dělostřelecká střela a následný požár zničil stroj i ' +
      'sochy apoštolů — největší škoda v dějinách orloje.',
    externalUrl: 'https://orloj.eu',
    zdroj: 'Skála 2016 — Vývoj podoby astrolábu Pražského orloje',
    zoteroKey: '9CFVGIR7',
  },
  {
    id: 'orloj-sucharda-1948',
    rok: 1948,
    rokText: '1945–1948',
    epocha: 'moderni',
    oblast: 'ceske-zeme',
    kategorie: 'osobnost',
    titulek: 'Suchardova poválečná obnova',
    popis:
      'V letech 1945–48 obnovil orloj řezbář Vojtěch Sucharda, který odmítl pouhé kopie a vyřezal ' +
      'zcela nové sochy apoštolů z lipového dřeva.',
    externalUrl: 'https://orloj.eu',
    zdroj: 'Skála 2015 — Alegorie ctností a neřestí na pražském orloji',
    zoteroKey: 'YKDAJKQN',
  },
  {
    id: 'hodinarium-decin-2015',
    rok: 2015,
    rokText: '2015',
    epocha: 'moderni',
    oblast: 'ceske-zeme',
    kategorie: 'instituce',
    titulek: 'Otevření Hodinária v Děčíně',
    popis:
      'Sbírka Českého spolku horologického se přestěhovala z Věžního muzejíčka v Soběslavi na zámek ' +
      'Děčín, kde se 4. září 2015 otevřela expozice časoměrných strojů.',
    kronika: 'decin-aktual0',
    zdroj: 'Archiv ČSH',
  },
  {
    id: 'astro2-2025',
    rok: 2025,
    rokText: '2025',
    epocha: 'moderni',
    oblast: 'ceske-zeme',
    kategorie: 'vynalez',
    ikona: 'microchip',
    titulek: 'ASTRO2 — astronomické hodiny na ESP01S',
    popis:
      'Autorská DIY konstrukce s NTP synchronizací a výpočty dle Computu, naprogramovaná s pomocí ' +
      'umělé inteligence — pomyslné spojení šesti století hodinařiny s mikroprocesorem.',
    clanek: 'astro2-ntp',
    krok: 'elektronicky-mikroprocesorovy-krok',
    zdroj: 'Projekt ČSH',
  },
];

/** Milníky seřazené chronologicky. */
export const milnikyChronologicky = [...milniky].sort((a, b) => a.rok - b.rok);

/** Milníky seskupené po epochách (v pořadí `epochy`). */
export function milnikyDleEpochy(): { epocha: EpochaMeta; polozky: Milnik[] }[] {
  return epochy.map((e) => ({
    epocha: e,
    polozky: milnikyChronologicky.filter((m) => m.epocha === e.key),
  }));
}
