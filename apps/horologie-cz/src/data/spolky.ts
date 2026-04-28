/**
 * Horologické spolky a profesní organizace, se kterými udržujeme
 * kontakt nebo na něž odkazujeme.
 */
export interface Spolek {
  slug: string;
  jmeno: string;
  zeme: 'CZ' | 'DE' | 'AT' | 'CH' | 'IT' | 'FR' | 'GB' | 'NL' | 'BE' | 'PL' | 'SK' | 'US';
  /** Krátký popis */
  popis: string;
  web?: string;
  email?: string;
  /** Kategorie pro grouping */
  typ: 'spolek' | 'akademie' | 'muzeum' | 'cech';
  /** Máme s nimi navázanou aktivní spolupráci? */
  spoluprace?: boolean;
}

export const spolky: Spolek[] = [
  // ─── Česko ───
  {
    slug: 'csh',
    jmeno: 'Český spolek horologický',
    zeme: 'CZ',
    popis:
      'Tato organizace — sdružení obdivovatelů hodin, restaurátorů a tvůrců. '
      + 'Provozuje Hodinárium v Děčíně, web hodinarium.eu a orloj.eu.',
    web: 'https://horologie-cz.pages.dev/',
    email: 'info@orloj.eu',
    typ: 'spolek',
  },

  // ─── Německo ───
  {
    slug: 'dgc',
    jmeno: 'Deutsche Gesellschaft für Chronometrie',
    zeme: 'DE',
    popis:
      'Tradiční německá společnost pro chronometrii (založena 1942). '
      + 'Vydává odborný časopis a pořádá konference. S CSH navázána spolupráce '
      + 'na symposiu v Rostocku 2022.',
    web: 'https://www.dg-chrono.de',
    typ: 'spolek',
    spoluprace: true,
  },
  {
    slug: 'astronomische-uhr-rostock',
    jmeno: 'Astronomische Uhr Rostock von 1472 e.V.',
    zeme: 'DE',
    popis:
      'Spolek pečující o astronomický orloj v rostockém Mariánském kostele. '
      + 'Pořadatel mezinárodních symposií „Mittelalterliche astronomische Großuhren".',
    web: 'http://www.astronomischeuhr.de/',
    typ: 'spolek',
    spoluprace: true,
  },
  {
    slug: 'deutsches-uhrenmuseum',
    jmeno: 'Deutsches Uhrenmuseum Furtwangen',
    zeme: 'DE',
    popis:
      'Schwarzwaldské muzeum hodin — kolébka kukačkových hodin, jedna '
      + 'z nejvýznamnějších evropských sbírek mechanického hodinářství.',
    web: 'https://www.deutsches-uhrenmuseum.de/',
    typ: 'muzeum',
  },
  {
    slug: 'mindelheim',
    jmeno: 'Mindelheimer Turmuhrenmuseum',
    zeme: 'DE',
    popis:
      'Bavorské muzeum věžních hodin v Mindelheimu — specializovaná sbírka '
      + 'středověkých a barokních věžních strojů.',
    web: 'https://www.mindelheim.de/leben-erleben/freizeit-und-sport/sehenswuerdigkeiten/turmuhrenmuseum',
    typ: 'muzeum',
  },
  {
    slug: 'glashutte',
    jmeno: 'Deutsches Uhrenmuseum Glashütte',
    zeme: 'DE',
    popis:
      'Saské hodinářské muzeum v centru německé hodinářské tradice (Glashütte). '
      + 'Sbírka mechanických hodin a hodinek od 19. století po současnost.',
    web: 'https://www.uhrenmuseum-glashuette.com/',
    typ: 'muzeum',
  },

  // ─── Švýcarsko ───
  {
    slug: 'mih',
    jmeno: 'Musée International d\'Horlogerie (MIH)',
    zeme: 'CH',
    popis:
      'Mezinárodní muzeum hodinařství v La Chaux-de-Fonds — vrcholná světová '
      + 'sbírka, restaurátorské pracoviště a referenční institut hodinářské vědy.',
    web: 'https://www.chaux-de-fonds.ch/musees/mih',
    typ: 'muzeum',
  },

  // ─── Rakousko ───
  {
    slug: 'wien-uhrenmuseum',
    jmeno: 'Wien Museum Uhrenmuseum',
    zeme: 'AT',
    popis:
      'Vídeňské muzeum hodin v paláci Obizzi — sbírka přes 700 hodin '
      + 'od gotiky po 20. století.',
    web: 'https://www.wienmuseum.at/de/standorte/uhrenmuseum',
    typ: 'muzeum',
  },

  // ─── Velká Británie ───
  {
    slug: 'royal-observatory',
    jmeno: 'Royal Observatory Greenwich',
    zeme: 'GB',
    popis:
      'Královská observatoř — Harrisonovy mořské chronometry H1—H4, nultý '
      + 'poledník, GMT. Klíčová instituce pro historii navigace a měření času.',
    web: 'https://www.rmg.co.uk/royal-observatory',
    typ: 'muzeum',
  },
  {
    slug: 'bhi',
    jmeno: 'British Horological Institute',
    zeme: 'GB',
    popis:
      'Britská hodinářská společnost (založena 1858). Vydává časopis '
      + 'Horological Journal, provozuje muzeum Upton Hall.',
    web: 'https://bhi.co.uk/',
    typ: 'spolek',
  },
  {
    slug: 'ahs',
    jmeno: 'Antiquarian Horological Society',
    zeme: 'GB',
    popis:
      'Britská společnost pro studium a sběratelství historických hodin '
      + 'a hodinek (založena 1953). Vydává časopis Antiquarian Horology.',
    web: 'https://www.ahsoc.org/',
    typ: 'spolek',
  },

  // ─── Spojené státy ───
  {
    slug: 'nawcc',
    jmeno: 'National Association of Watch and Clock Collectors',
    zeme: 'US',
    popis:
      'Největší světový sběratelský spolek (založen 1943). Vlastní muzeum '
      + 'v Columbii (PA) a knihovnu, vydává časopis Watch & Clock Bulletin.',
    web: 'https://www.nawcc.org/',
    typ: 'spolek',
  },

  // ─── Francie ───
  {
    slug: 'afaha',
    jmeno: 'Association Française des Amateurs d\'Horlogerie Ancienne',
    zeme: 'FR',
    popis:
      'Francouzská společnost milovníků starého hodinářství. Pořádá '
      + 'srazy, výstavy a vydává bulletin.',
    web: 'https://www.afaha.com/',
    typ: 'spolek',
  },

  // ─── Polsko ───
  {
    slug: 'gdansk-marien',
    jmeno: 'Astronomický orloj v Mariackém kostele v Gdaňsku',
    zeme: 'PL',
    popis:
      'Středověký orloj v gdaňské Bazilice Nanebevzetí Panny Marie. '
      + 'V kontextu rostockého symposia 2022 představil prof. A. Januszajtis.',
    typ: 'muzeum',
  },

  {
    slug: 'vmo',
    jmeno: 'Vlastivědné muzeum v Olomouci',
    zeme: 'CZ',
    popis:
      'Olomoucké muzeum eviduje téměř dva miliony sbírkových předmětů, '
      + 'mezi nimi unikátně dochovaný soubor originálních součástek olomouckého '
      + 'orloje. V roce 2019 hostilo výstavu k 500. výročí první zmínky o orloji '
      + '(kurátor Radim Himmler).',
    web: 'https://www.vmo.cz/',
    typ: 'muzeum',
    spoluprace: true,
  },

  // ─── Slovensko ───
  {
    slug: 'slovenske-orloje',
    jmeno: 'Stará Bystrica — orloj',
    zeme: 'SK',
    popis:
      'Slovenský orloj ve Staré Bystrici (otevřen 2009) — největší dřevěná '
      + 'socha Sedembolestnej Panny Marie. Současné dílo navazující '
      + 'na orlojovou tradici.',
    typ: 'muzeum',
  },
];

export const zemeLabel: Record<Spolek['zeme'], string> = {
  CZ: 'Česko',
  DE: 'Německo',
  AT: 'Rakousko',
  CH: 'Švýcarsko',
  IT: 'Itálie',
  FR: 'Francie',
  GB: 'Velká Británie',
  NL: 'Nizozemsko',
  BE: 'Belgie',
  PL: 'Polsko',
  SK: 'Slovensko',
  US: 'USA',
};

export const typLabel: Record<Spolek['typ'], string> = {
  spolek: 'Spolek',
  akademie: 'Akademie',
  muzeum: 'Muzeum',
  cech: 'Cech',
};

/**
 * Záznam o vzájemných kontaktech — kdy nás kdo navštívil, kdy jsme my
 * přednášeli u nich, společné výstavy, výpravy.
 */
export interface KontaktUdalost {
  datum: string;          // ISO RRRR-MM-DD nebo textový rozsah ("2022-10-28 — 2022-10-30")
  rok: number;
  smer: 'k-nim' | 'k-nam' | 'spolecne';
  partner: string;        // jméno spolku/instituce
  partnerSlug?: string;   // odkazuje do spolky[]
  popis: string;
  /** Slug naší akce v /akce/ */
  akceSlug?: string;
}

export const kontakty: KontaktUdalost[] = [
  {
    datum: '2022-10-28 — 2022-10-30',
    rok: 2022,
    smer: 'k-nim',
    partner: 'Astronomische Uhr Rostock von 1472 e.V. & Deutsche Gesellschaft für Chronometrie',
    partnerSlug: 'astronomische-uhr-rostock',
    popis:
      'Účast čtyř členů spolku (Knespl, Baudisch, Skála, Himmler) na VII. mezinárodním '
      + 'symposiu „Mittelalterliche astronomische Großuhren" v rostocké St.-Marien-Kirche. '
      + 'David Knespl tam přednesl referát Petra Skály o Pražském orloji. Při této příležitosti '
      + 'jsme navázali plodné přátelství s Deutsche Gesellschaft für Chronometrie.',
    akceSlug: 'rostock-2022',
  },
  {
    datum: '2022-08-19 — 2022-08-20',
    rok: 2022,
    smer: 'k-nim',
    partner: 'Království času Protivín (pan Kubelka)',
    popis:
      'Spolková výprava do Protivína. Na programu byla návštěva pivovaru a hlavně '
      + 'prohlídka soukromé hodinářské sbírky Království času pana Kubelky. '
      + 'Druhý den návštěva Jihočeského muzea v Č. Budějovicích a výstavy Zvuk času.',
    akceSlug: 'protivin-2022',
  },
  {
    datum: '2019-10-04 — 2020-01-05',
    rok: 2019,
    smer: 'spolecne',
    partner: 'Vlastivědné muzeum v Olomouci',
    popis:
      'Výstava „Olomoucký orloj — 500 let od první písemné zmínky". Radim Himmler '
      + 'byl kurátorem výstavy, členové spolku se aktivně podíleli na přípravě '
      + 'exponátů; David Knespl je spoluautorem (s Martinem Šimkem) repliky '
      + 'číselníkového patra olomouckého orloje, prezentované na výstavě.',
    akceSlug: 'olomoucky-orloj-2019',
  },
];

export const smerLabel: Record<KontaktUdalost['smer'], string> = {
  'k-nim': 'My u nich',
  'k-nam': 'Oni u nás',
  'spolecne': 'Společná akce',
};
