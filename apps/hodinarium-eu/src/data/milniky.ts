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
  /**
   * Better BibTeX citation-key v references.json → render ISO 690 přes
   * citeproc (utils/cite.ts). Když je nastaven a nalezen, Časová osa
   * zobrazí formátovanou citaci; jinak fallback na `zdroj`.
   */
  bibKey?: string;
  /** Krátká citace zobrazená u milníku, fallback když chybí bibKey („Autor rok — Titul"). */
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
    bibKey: 'englundAdministrativeTimekeepingAncient1988',
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
    bibKey: 'bickelRamessidischeSonnenuhrIm2014',
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
    bibKey: 'brittenOldClocksWatches1922',
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
    bibKey: 'lepschyFeedbackControlAncient1992',
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
    bibKey: 'freethModelCosmosAncient2021',
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
    bibKey: 'auberLorologioAnaforicoDi2014',
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
    bibKey: 'aspreyClockworkHeavens1973',
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
    bibKey: 'hill+ToledoWaterClocks10751994',
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
    bibKey: 'aspreyClockworkHeavens1973',
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
    bibKey: 'snyderKingsTreasuryCould2021',
    zoteroKey: 'NLQ5CVJL',
  },
  {
    id: 'libros-del-saber-1276',
    rok: 1276,
    rokText: '1276',
    epocha: 'stredovek',
    oblast: 'svet',
    kategorie: 'vynalez',
    ikona: 'gears',
    titulek: 'Rtuťové hodiny v Libros del Saber de Astronomia',
    popis:
      'Alfonso X. nechal v Toledu sepsat kompendium „Libros del Saber de Astronomia" (1276–1277); ' +
      'čtvrtá kniha popisuje hybridní stroj se závažím a regulátorem z rtuťových komůrek — most mezi ' +
      'antickými vodními hodinami a prvními evropskými lihýřovými hodinami, které se objeví o pár let později.',
    bibKey: 'dohrn-vanrossumHistoryHourClocks1996',
    zdroj: 'Dohrn-van Rossum 1996 — History of the Hour',
  },
  {
    id: 'paris-condemnation-1277',
    rok: 1277,
    rokText: '1277',
    epocha: 'stredovek',
    oblast: 'svet',
    kategorie: 'system',
    ikona: 'gavel',
    titulek: 'Pařížské odsouzení a nové pojetí času',
    popis:
      'Pařížský biskup Étienne Tempier zakázal 7. března 1277 vyučovat na pařížské univerzitě 219 ' +
      'aristotelských tezí. Polemika kolem nich vedla Buridana a Oresma k objevu impetu (pohybu ' +
      'setrvačností) a otevřela nový pohled na čas, prostor a pohyb — koncepční půdu, na níž o pár let ' +
      'později vyrostly mechanické hodiny.',
    clanek: 'mereni-casu',
    bibKey: 'nosonovskyEarlyRenaissanceConcepts2024',
    zdroj: 'Nosonovsky 2024 — Early Renaissance Concepts of Time and the Invention of Mechanical Clocks',
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
    bibKey: 'blumenthalFrictionDynamicsVerge2020',
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
      'počátek éry věžního hodinářství. Snahu sestrojit takové „kolo, které by se pohybovalo přesně ' +
      'podle nebeské sféry", zaznamenal už roku 1271 anglický astronom Robertus Anglicus v komentáři ' +
      'ke Sacroboscovu De sphera.',
    krok: 'vretenovy-krok',
    zdroj: 'Nosonovsky 2024 — Early Renaissance Concepts of Time and the Invention of Mechanical Clocks',
    bibKey: 'nosonovskyEarlyRenaissanceConcepts2024',
    zoteroKey: 'RHHYLVK9',
  },
  {
    id: 'orvieto-1307',
    rok: 1307,
    rokText: '1307–1308',
    epocha: 'stredovek',
    oblast: 'svet',
    kategorie: 'monument',
    ikona: 'clock',
    titulek: 'Orvieto — nejstarší doložené městské hodiny',
    popis:
      'Riformagioni (zápisy městské rady) z let 1307–1308 ukládají daň na opravu „ariolagium sive ' +
      'campanile" v radniční věži a roku 1308 najímají správce hodin. Podle Dohrna nejstarší doložená ' +
      'městská veřejná hodina v Evropě — předchůdce vlny italských věžních strojů poloviny 14. století.',
    slovnik: 'bici-stroj',
    bibKey: 'dohrn-vanrossumHistoryHourClocks1996',
    zdroj: 'Dohrn-van Rossum 1996 — History of the Hour',
  },
  {
    id: 'wallingford-1330',
    rok: 1330,
    rokText: 'kolem 1330',
    epocha: 'stredovek',
    oblast: 'svet',
    kategorie: 'osobnost',
    titulek: 'Richard z Wallingfordu',
    popis:
      'Opat kláštera v St Albans navrhl kolem roku 1330 jeden z nejsložitějších astronomických orlojů ' +
      'středověku — s astrolábovým číselníkem, ukazatelem mořského přílivu a vlastním krokem — a popsal ' +
      'jej v traktátu Tractatus Horologii Astronomici.',
    slovnik: 'orloj',
    bibKey: 'northGodsClockmakerRichard2005',
    zdroj: 'North 2005 — God’s Clockmaker: Richard of Wallingford and the Invention of Time',
  },
  {
    id: 'milan-1336',
    rok: 1336,
    rokText: '1336',
    epocha: 'stredovek',
    oblast: 'svet',
    kategorie: 'monument',
    ikona: 'bell',
    titulek: 'Milánské bicí hodiny u San Gottardo',
    popis:
      'Kronikář Galvano Fiamma popsal roku 1336 u kostela San Gottardo v Miláně věžní hodiny, jejichž ' +
      'velké kladivo odbíjelo na zvon 24× podle 24 rovných hodin dne i noci — nejstarší písemná zmínka ' +
      'o veřejných bicích hodinách. Starší milánský bicí stroj „da maglio" u Sant’Eustorgia (1309) ještě ' +
      'neměl ciferník.',
    slovnik: 'bici-stroj',
    bibKey: 'arnaldiOreItalianeOrigine2006',
    zdroj: 'Arnaldi 2006 — Le ore italiane (I)',
  },
  {
    id: 'presypaci-hodiny-1338',
    rok: 1338,
    rokText: '1338',
    epocha: 'stredovek',
    oblast: 'svet',
    kategorie: 'vynalez',
    ikona: 'hourglass-half',
    titulek: 'Přesýpací hodiny v Lorenzettiho fresce',
    popis:
      'Nejstarší středověký doklad přesýpacích hodin: žena s velkou sklenicí písku se objevuje ' +
      've fresce Ambrogia Lorenzettiho „Allegoria del Buon Governo" (Siena, 1338) jako symbol ' +
      'Umírněnosti. Druhý raný doklad přidává Tomaso da Modena, jehož freska kardinála Williama ' +
      'z Anglie v dominikánské kapitulní síni v Trevisu (1352) ukazuje přesýpací hodiny na polici ' +
      'u stolu — znamení, že už byly v polovině 14. století běžnou pomůckou souběžně s mechanickými hodinami.',
    clanek: 'mereni-casu',
    bibKey: 'nosonovskyEarlyRenaissanceConcepts2024',
    zdroj: 'Nosonovsky 2024 — Early Renaissance Concepts of Time and the Invention of Mechanical Clocks',
  },
  {
    id: 'buridan-oresme-impetus',
    rok: 1340,
    rokText: 'kolem 1340',
    epocha: 'stredovek',
    oblast: 'svet',
    kategorie: 'osobnost',
    titulek: 'Buridan a Oresme: teorie impetu',
    popis:
      'Pařížští scholastikové Jean Buridan (1301–1362) a Nicole Oresme (1320–1382) v polemice ' +
      's aristotelským pojetím pohybu rozvinuli teorii impetu — pohybu setrvačností bez stále ' +
      'působící síly. Pro hodinařinu znamenala přijetí myšlenky periodického pohybu, který se sám ' +
      'uchovává; o tři staletí později z ní Galileo a Newton odvodili princip setrvačnosti.',
    clanek: 'mereni-casu',
    bibKey: 'nosonovskyEarlyRenaissanceConcepts2024',
    zdroj: 'Nosonovsky 2024 — Early Renaissance Concepts of Time and the Invention of Mechanical Clocks',
  },
  {
    id: 'jacopo-dondi-1344',
    rok: 1344,
    rokText: '1344',
    epocha: 'stredovek',
    oblast: 'svet',
    kategorie: 'monument',
    titulek: 'Jacopo de\' Dondi — orloj v Padově',
    popis:
      'Padovský lékař a astronom Jacopo de\' Dondi (1290–1359) sestrojil věžní orloj instalovaný ' +
      'roku 1344 v Torre dei Signori paláce Palazzo del Capitanio v Padově; podle něj získala ' +
      'rodina přídomek „dall\'Orologio". Jeho syn Giovanni o dvacet let později navázal slavným astrariem.',
    slovnik: 'orloj',
    bibKey: 'nosonovskyEarlyRenaissanceConcepts2024',
    zdroj: 'Nosonovsky 2024 — Early Renaissance Concepts of Time and the Invention of Mechanical Clocks',
  },
  {
    id: 'rovne-hodiny',
    rok: 1350,
    rokText: '14. století',
    epocha: 'stredovek',
    oblast: 'svet',
    kategorie: 'system',
    ikona: 'clock',
    titulek: 'Od nerovných hodin k rovným',
    popis:
      'S nástupem mechanických hodin ustupují nerovné (temporální) hodiny, kdy se den i noc dělily na ' +
      'dvanáct dílů proměnlivé délky podle ročního období, hodinám rovným o stálé délce — stroj totiž ' +
      'přirozeně odměřuje stejně dlouhé hodiny a mění tak vnímání času v celé Evropě.',
    clanek: 'mereni-casu',
    slovnik: 'hodiny-planetni',
    bibKey: 'knesplOdHodinNerovnych2021',
    zdroj: 'Knespl 2021 — Od hodin nerovných k hodinám rovným',
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
    bibKey: 'oestmannAstronomicalClockStrasbourg2020',
    zoteroKey: 'KPB743UX',
  },
  {
    id: 'praha-mansionari',
    rok: 1354,
    rokText: '1352–1355',
    epocha: 'stredovek',
    oblast: 'ceske-zeme',
    kategorie: 'monument',
    titulek: 'První pražské hodiny — stanovy mansionářů Arnošta z Pardubic',
    popis:
      'Statuta kapituly mansionářů u sv. Víta, která jí dal arcibiskup Arnošt z Pardubic (po jejím ' +
      'založení Karlem IV.), obsahují první pražskou zmínku o mechanických hodinách: kdo z mansionářů ' +
      'by „post secundum pulsum horologii" (po druhém bití hodin na zvon) byl mimo dům, neměl být ' +
      'v noci vpuštěn. Statuta jsou zachycena v Regestech bohemicko-moravských V/4 (1352–1355) ' +
      'a edici Menčíka 1882. Italský způsob počítání hodin vede k Padově — Arnošt tam 14 let studoval, ' +
      'mezitím Jacopo Dondi sestrojil 1344 padovský radniční orloj. K roku 1358 je v Praze doložena ' +
      'vdova po neznámém staršímu mistru hodin („uxor quondam magistri horologii"), od 1361 i dvorní ' +
      'hodinář Karla IV. Martin. Praha měla mechanické hodiny už generaci před staroměstským orlojem.',
    slovnik: 'orlojnik',
    bibKey: 'blahovaHistorickaChronologie2001',
    zdroj: 'Bláhová 2001 — Historická chronologie, s. 312',
  },
  {
    id: 'aire-sur-lys-1355',
    rok: 1355,
    rokText: '1355',
    epocha: 'stredovek',
    oblast: 'svet',
    kategorie: 'system',
    ikona: 'bell',
    titulek: 'Aire-sur-la-Lys — pracovní zvon (Werkglocke)',
    popis:
      'Roku 1355 získali měšťané Aire-sur-la-Lys povolení k instalaci pracovního zvonu (Werkglocke), ' +
      'který by ohlašoval začátek a konec práce textilních dělníků odděleně od kanonických hodin církve. ' +
      'U Jacquese Le Goffa proslulý doklad „měšťanského času" — měřeného a sekulárního, oddělujícího se ' +
      'od „církevního času".',
    slovnik: 'odbijeni',
    bibKey: 'dohrn-vanrossumHistoryHourClocks1996',
    zdroj: 'Dohrn-van Rossum 1996 — History of the Hour',
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
    bibKey: 'bediniMechanicalUniverseAstrarium1966',
    zoteroKey: 'H868QUKS',
  },
  {
    id: 'henri-de-vick-1370',
    rok: 1370,
    rokText: '1370',
    epocha: 'stredovek',
    oblast: 'svet',
    kategorie: 'monument',
    titulek: 'Henri de Vick — orloj královského paláce v Paříži',
    popis:
      'Karel V. Francouzský pověřil hodináře Henriho de Vicka, aby roku 1370 vystavěl pro pařížský ' +
      'královský palác věžní hodiny s lihýřovým krokem („Horloge du Palais") — součást širokého ' +
      'panovnického programu, do kterého patří i hodiny ve Vincennes (1359), Sens (1375), Avignon ' +
      '(1374–75), Beauté-sur-Marne (1377) či Montargis (1380). Pravidelný úder Vickových hodin ' +
      'inspiroval kolem roku 1380 Froissartovu alegorii „Orloge amoureus".',
    krok: 'vretenovy-krok',
    bibKey: 'nosonovskyEarlyRenaissanceConcepts2024',
    zdroj: 'Nosonovsky 2024 — Early Renaissance Concepts of Time and the Invention of Mechanical Clocks',
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
    bibKey: 'mckayTurretClockKeepers1999',
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
    bibKey: 'brayMakingClocks2001',
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
    bibKey: 'sigutDejinamOpavskehoMestskeho1961',
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
    bibKey: 'lemingerUmeleckeRemesloKutne1926',
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
    bibKey: 'richardjechtCodexDiplomaticusLusatiae1910',
    zoteroKey: 'SC8D299S',
  },
  {
    id: 'praha-martin-1379',
    rok: 1379,
    rokText: '1379',
    epocha: 'stredovek',
    oblast: 'ceske-zeme',
    kategorie: 'osobnost',
    titulek: 'Pražský hodinář Martin',
    popis:
      'Soudní akt pražské konsistoře z roku 1379 zachycuje spor hodináře (orlogisty) Martina s kanovníkem ' +
      'Janem Tostem — nejstarší jmenovitě doložený pražský hodinář.',
    zdroj: 'Tadra 1896 — Soudní akta konsistoře pražské III, s. 343',
    bibKey: 'tadraSoudniAktaKonsistore',
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
    bibKey: 'drabekOlomouckyOrloj1957',
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
    bibKey: 'polesnyRejstrik1397Obnoveny1928',
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
    bibKey: 'borovyLibriErectionumArchidioecesis1875',
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
    bibKey: 'skalaNovyPohledNa2016',
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
    bibKey: 'simaZaTajemstvimPrazskeho',
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
      'Norimberský zámečník Peter Henlein (~1485–1542), doložený 1509 v cechu zámečníků, patřil ' +
      'k prvním výrobcům malých pérových hodin přenosných na osobě. Mýtus o Henleinovi jako vynálezci ' +
      '„Norimberského vejce" je filologické nedorozumění z Fischartova překladu Rabelaise (1571); ' +
      'pružinový pohon s usňovkou byl totiž zdokonalen už kolem roku 1430 („Burgundské hodiny" ' +
      'v Germánském národním muzeu).',
    zdroj: 'Dietzschold 1905 — Die Hemmungen der Uhren',
    bibKey: 'dietzscholdHemmungenUhrenIhre1905',
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
    bibKey: 'drabekOlomouckyOrloj1957',
    zoteroKey: 'WXVBZHNE',
  },
  {
    id: 'jakub-cech-1525',
    rok: 1525,
    rokText: '1525',
    epocha: 'novovek',
    oblast: 'ceske-zeme',
    kategorie: 'monument',
    ikona: 'clock',
    titulek: 'Hodiny Jakuba Čecha',
    popis:
      'Pražský hodinář Jakub Čech (Iacob Zech, †1540), správce staroměstského orloje, zhotovil roku 1525 ' +
      'bohatě zdobené astrologické stolní hodiny s pérovým pohonem a stěžejníkem — patří k nejstarším ' +
      'dochovaným přenosným hodinám na světě (dnes British Museum).',
    slovnik: 'pero',
    bibKey: 'davidknesplNejstarsiDochovanePrenosne2025',
    zdroj: 'Knespl 2025 — Nejstarší dochované přenosné hodiny Jakuba Čecha',
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
    bibKey: 'wellingtingahtanGOTTALLEINEHRE2001',
    zoteroKey: '983ZF928',
  },
  {
    id: 'taborsky-1570',
    rok: 1570,
    rokText: '1570',
    epocha: 'novovek',
    oblast: 'ceske-zeme',
    kategorie: 'osobnost',
    titulek: 'Jan Táborský: Zpráva o pražském orloji',
    popis:
      'Pražský orlojník Jan Táborský z Klokotské Hory sepsal roku 1570 obšírnou „Zprávu o orloji ' +
      'pražském" — nejstarší český detailní popis stroje staroměstského orloje a klíčový pramen ' +
      'jeho dějin. V edici Josefa Teigeho vyšla teprve roku 1901.',
    slovnik: 'orlojnik',
    externalUrl: 'https://orloj.eu',
    bibKey: 'teigeJanaTaborskehoKlokotske1901',
    zdroj: 'Teige 1901 — Jana Táborského z Klokotské Hory zpráva o orloji staroměstském',
  },
  {
    id: 'pavel-frejlich-1571',
    rok: 1571,
    rokText: '1571',
    epocha: 'novovek',
    oblast: 'ceske-zeme',
    kategorie: 'osobnost',
    titulek: 'Pavel Frejlich z Litomyšle',
    popis:
      'U litomyšlského renesančního hodináře Pavla Frejlicha si roku 1571 objednal arcivévoda Ferdinand II. ' +
      'Tyrolský astronomický orloj pro sbírky na zámku Ambras — jediné dochované Frejlichovo dílo; jeho ' +
      'věžní hodiny pro Bílou věž Pražského hradu, Moravskou Třebovou či Kadaň zanikly. Řemeslo po něm ' +
      'převzal syn Vavřinec, hodinář a zvonař.',
    hodinar: 'pavel-frejlich',
    slovnik: 'orloj',
    bibKey: 'knesplAstronomicalClockArchduke2024',
    zdroj: 'Knespl 2024 — The Astronomical Clock of Archduke Ferdinand II of Austria',
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
    bibKey: 'wallisBedeReckoningTime1999',
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
    bibKey: 'clarkJostBurgisAritmetische2015',
    zoteroKey: 'SUF28IY2',
  },
  {
    id: 'galileo-kyvadlo',
    rok: 1588,
    rokText: '1588 (publ. 1602)',
    epocha: 'novovek',
    oblast: 'svet',
    kategorie: 'osobnost',
    titulek: 'Galileo a izochronie kyvadla',
    popis:
      'Galileo Galilei začal roku 1588 zkoumat izochronii malých kmitů kyvadla a výsledky publikoval ' +
      'roku 1602 — tím připravil cestu k jeho použití jako regulátoru hodin.',
    slovnik: 'kyvadlo',
    zdroj: 'Newton 2004 — Galileo’s Pendulum',
    bibKey: 'newtonGalileosPendulumRhythm2004',
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
    bibKey: 'rosickyStaromestskyOrlojPraze1923',
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
    bibKey: 'emmersonThingsAreSeldom2015',
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
    bibKey: 'stoimenovEvolutionClockEscapement2012',
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
    bibKey: 'duMechanicsMechanicalWatches2013',
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
    bibKey: 'frankEvolutionTowerClock2013',
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
    bibKey: 'schmidtEnglischenPendeluhrenZwar1856a',
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
    bibKey: 'andreagabrielteicherBeschreibungKunstreichenUhrWercks1735',
    zoteroKey: 'T9HYRTRH',
  },
  {
    id: 'amantuv-krok-1741',
    rok: 1741,
    rokText: 'kolem 1741',
    epocha: 'novovek',
    oblast: 'svet',
    kategorie: 'vynalez',
    titulek: 'Amantův kolíčkový krok',
    popis:
      'Francouzský hodinář Amant zavedl kolem roku 1741 kolíčkový klidový krok pro věžní hodiny; spolu ' +
      's pozdější Lepautovou úpravou (1753) se stal nejrozšířenějším krokem věžních strojů.',
    krok: 'amantuv-krok',
    bibKey: 'frankEvolutionTowerClock2013',
    zdroj: 'Frank 2013 — The Evolution of Tower Clock Movements',
  },
  {
    id: 'pater-klein-1750',
    rok: 1750,
    rokText: 'kolem 1750',
    epocha: 'novovek',
    oblast: 'ceske-zeme',
    kategorie: 'osobnost',
    titulek: 'Páter Klein z Klementina',
    popis:
      'Jezuita Jan (Johann) Klein (1684–1762), astronom a mechanik pražského Klementina, sestrojil čtvery ' +
      'astronomické hodiny včetně koperníkovských demonstračních a v polovině 18. století se ujal i ' +
      'zchátralého staroměstského orloje.',
    slovnik: 'orloj',
    bibKey: 'svejdaPristrojePomuckyKlementina2019',
    zdroj: 'Švejda 2019 — Přístroje a pomůcky z Klementina',
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
    bibKey: 'bartkySellingTrueTime2000',
    zoteroKey: 'WLBGVUN7',
  },
  {
    id: 'detentovy-krok-1783',
    rok: 1783,
    rokText: '1748–1783',
    epocha: 'prumysl',
    oblast: 'svet',
    kategorie: 'vynalez',
    ikona: 'compass',
    titulek: 'Detentový krok — chronometr v sérii',
    popis:
      'Detentní (chronometrický) krok pro setrvačku zavedl roku 1748 Pierre Le Roy a roku 1783 jej do ' +
      'podoby pružinové detenty dovedl Thomas Earnshaw — teprve tím vznikl spolehlivě reprodukovatelný ' +
      'a sériově vyrobitelný námořní chronometr.',
    slovnik: 'chronometr',
    bibKey: 'duMechanicsMechanicalWatches2013',
    zdroj: 'Du & Xie 2013 — The Mechanics of Mechanical Watches and Clocks',
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
    bibKey: 'erbenZpravaStarobylemOrloji2016',
    zoteroKey: '5EPYPG78',
  },
  {
    id: 'prazska-polytechnika-1806',
    rok: 1806,
    rokText: '1806',
    epocha: 'prumysl',
    oblast: 'ceske-zeme',
    kategorie: 'instituce',
    ikona: 'graduation-cap',
    titulek: 'Pražská polytechnika',
    popis:
      'V čele s Františkem Josefem Gerstnerem zahájilo roku 1806 v Praze činnost Královské stavovské ' +
      'polytechnické učiliště — první polytechnika ve střední Evropě a předchůdce dnešního ČVUT. ' +
      'Z jejích dílen vzešel mj. Josef Božek i celá zdejší tradice průmyslové výroby věžních hodin.',
    hodinar: 'josef-bozek',
    bibKey: 'knesplCastIronTower2024',
    zdroj: 'Knespl & Husník 2024 — Cast Iron Tower Clockworks Manufacturing and the Role of Prague Polytechnic',
  },
  {
    id: 'litinove-hodiny-1810',
    rok: 1810,
    rokText: '1809–1834',
    epocha: 'prumysl',
    oblast: 'ceske-zeme',
    kategorie: 'vynalez',
    ikona: 'industry',
    titulek: 'Litinové věžní hodiny — pokus o sériovou výrobu',
    popis:
      'Hořovická slévárna hraběte Rudolfa z Vrbna začala roku 1810 nabízet litinové věžní stroje ' +
      's Grahamovým krokem za 600 zlatých — modely zhotovené na pražské polytechnice. Roku 1834 ' +
      'navázal Heinrich Alexander Luz vlastní litinovou konstrukcí ze šlapanické huti u Brna. ' +
      'Šlo o první české pokusy o průmyslovou (sériovou) výrobu věžních hodin — proti tradičnímu řemeslu.',
    clanek: 'litinove-vezni-hodiny',
    krok: 'grahamuv-krok',
    hodinar: 'josef-bozek',
    bibKey: 'knesplProgressTraditionTraditional2024',
    zdroj: 'Knespl 2024 — Progress versus tradition (industrial tower clock production in the Czech lands)',
  },
  {
    id: 'josef-bozek-1824',
    rok: 1824,
    rokText: '1824',
    epocha: 'prumysl',
    oblast: 'ceske-zeme',
    kategorie: 'osobnost',
    titulek: 'Josef Božek — mechanik polytechniky',
    popis:
      'Mechanik pražské polytechniky a hodinář Josef Božek (1782–1835) sestrojil v Čechách první ' +
      'použitelné parní stroje a věnoval se i věžnímu hodinářství: roku 1824 dodal hodiny pro Karlínskou ' +
      'invalidovnu (později i pro Bílou věž v Hradci Králové, 1829). Jako jeden z prvních u nás zavedl ' +
      'Grahamův a Lepauteho krok; v řemesle pokračoval jeho syn Romuald.',
    hodinar: 'josef-bozek',
    bibKey: 'kuceraBozkoveVeSbirkach2011a',
    zdroj: 'Kučera 2011 — Božkové ve sbírkách Národního technického muzea v Praze',
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
    bibKey: 'maroszovaJednotaKuPovzbuzeni2023',
    zoteroKey: 'VJQVX3DT',
  },
  {
    id: 'hippuv-prerusovac-1843',
    rok: 1843,
    rokText: '1843',
    epocha: 'prumysl',
    oblast: 'svet',
    kategorie: 'vynalez',
    titulek: 'Hippův přerušovač',
    popis:
      'Matthäus Hipp sestrojil elektromechanický přerušovač, který udílí kyvadlu hlavních hodin impuls ' +
      'až tehdy, když jeho výkyv klesne pod nastavenou mez — základ přesných elektrických hodinových sítí.',
    krok: 'hippuv-prerusovac',
    bibKey: 'sladkovskyUcebniceOdborneNauky1947',
    zdroj: 'Sladkovský 1947 — Učebnice odborné nauky hodinářské',
  },
  {
    id: 'robertuv-krok-1852',
    rok: 1852,
    rokText: '1852',
    epocha: 'prumysl',
    oblast: 'svet',
    kategorie: 'vynalez',
    titulek: 'Robertův krok',
    popis:
      'Kolíčkový kotvový krok se středovou kotvou si nechal Léon Émile Adolphe Robert patentovat roku ' +
      '1852 v Paříži; v Čechách jej výhradně používal Jan Prokeš ze Sobotky — nejstarší dochovaný kus ' +
      'pochází ze zámku Býchory (1868).',
    krok: 'robertuv-krok',
    hodinar: 'jan-prokes',
    bibKey: 'knesplRobertuvKrokOprava2023',
    zdroj: 'Knespl 2023 — Robertův krok (oprava chybného označení)',
  },
  {
    id: 'l-hainz-1836',
    rok: 1836,
    rokText: '1836',
    epocha: 'prumysl',
    oblast: 'ceske-zeme',
    kategorie: 'instituce',
    ikona: 'shop',
    titulek: 'Založení firmy L. Hainz',
    popis:
      'Ludvík Hainz st. (1815–1875) si roku 1836 otevřel hodinářský krám na Staroměstském náměstí ' +
      'pod podloubím proti pražskému orloji; firma postupně přerostla v jednu z nejvýznamnějších ' +
      'českých hodinářských firem a po opravě orloje 1864–65 získala trvalou funkci jeho orlojníka.',
    hodinar: 'ludvik-hainz',
    bibKey: 'martinekFirmaLudvikHainz2009',
    zdroj: 'Martínek 2009 — Firma Ludvík Hainz, Praha',
  },
  {
    id: 'jan-prokes-1839',
    rok: 1839,
    rokText: '1839',
    epocha: 'prumysl',
    oblast: 'ceske-zeme',
    kategorie: 'osobnost',
    titulek: 'Jan Prokeš — sobotecká dílna',
    popis:
      'Jan Prokeš (1818–1890) se po vyučení roku 1839 osamostatnil v Sobotce jako hodinář; vyrobil ' +
      '200–400 věžních strojů (první roku 1848 pro kostel v Loukově), proslul kolíčkovým (Robertovým) ' +
      'krokem a své stroje vyvážel až do banátské Vingy.',
    clanek: 'sobotecka-dilna-prokesova-robertuv-krok',
    hodinar: 'jan-prokes',
    krok: 'robertuv-krok',
    bibKey: 'knesplJanProkesHodinar2018',
    zdroj: 'Knespl 2018 — Jan Prokeš, hodinář ze Sobotky',
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
    bibKey: 'mckayBigBenGreat2010',
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
      'Při velké obnově 1865–66 zhotovil nový stroj hodinář Jan Holub v Daňkově strojírně v Karlíně ' +
      '(na opravě se podílel i Ludvík Hainz ml. a začínající Václav Krečmer), Josef Mánes namaloval ' +
      'kalendářní desku a Eduard Veselý vyřezal nové apoštoly; orloj byl zprovozněn 1. ledna 1866.',
    hodinar: 'l-hainz',
    externalUrl: 'https://orloj.eu',
    zdroj: 'Černá 2012 — Přehled výzkumu k obnově orloje 1864–1865',
    bibKey: 'cernaPrehledVyzkumuObnove2012a',
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
    bibKey: 'kallusDopisPrumysloveJednote1874',
    zoteroKey: 'BDMW3GD4',
  },
  {
    id: 'vaclav-krecmer-1865',
    rok: 1865,
    rokText: '1865',
    epocha: 'prumysl',
    oblast: 'ceske-zeme',
    kategorie: 'osobnost',
    titulek: 'Václav Krečmer — debut na opravě orloje',
    popis:
      'Pražský hodinář Václav Krečmer (1844–1918) se prvně objevuje při obnově staroměstského orloje ' +
      '1865–66, kdy pracoval v Daňkově karlínské strojírně pod vedením Jana Holuba. Po studiích ve ' +
      'Švýcarsku a ve Francii si roku 1869 založil vlastní dílnu, programovou statí „O hodinářství" 1878 ' +
      'vstoupil do oborové diskuze, roku 1891 dodal pro Jubilejní výstavu samočinný hybostroj petřínské ' +
      'panoramy (cena 1892) a roku 1910 soutěžil s Hainzem o pražské elektrické hodiny.',
    hodinar: 'vaclav-krecmer',
    bibKey: 'knesplVaclavKrecmerHodinar2026',
    zdroj: 'Knespl 2026 — Václav Krečmer — hodinář inovátor',
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
    bibKey: 'nedbalStaromestskyOrlojApostolove',
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
    bibKey: 'susickyHodinarstviProPraktickou1900',
    zoteroKey: 'M2MD5J34',
  },
  {
    id: 'pneumaticke-hodiny-1880',
    rok: 1880,
    rokText: 'kolem 1880',
    epocha: 'prumysl',
    oblast: 'svet',
    kategorie: 'vynalez',
    ikona: 'wind',
    titulek: 'Pneumatické hodiny v Paříži',
    popis:
      'Victor Popp vybudoval v Paříži od roku 1880 veřejnou síť pneumatických hodin: stlačený vzduch ' +
      'rozváděný kilometry potrubí posouval jediným impulzem ručky stovek číselníků po celém městě.',
    clanek: 'pneumatika2',
    bibKey: 'readPneumaticClocks2005',
    zdroj: 'Read 2005 — Pneumatic Clocks',
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
    bibKey: 'hamrTransferMasterClock2024',
    zoteroKey: 'KNKG36A7',
  },
  {
    id: 'greenwich-1884',
    rok: 1884,
    rokText: '1884',
    epocha: 'moderni',
    oblast: 'svet',
    kategorie: 'system',
    ikona: 'globe',
    titulek: 'Washingtonská meridiánská konference — světový čas',
    popis:
      'Mezinárodní meridiánská konference svolaná v říjnu 1884 do Washingtonu přijala Greenwich jako ' +
      'nultý poledník a navrhla rozdělení Země na 24 hodinových pásem. Železniční rozvrhy už dříve ' +
      'donutily státy sjednotit čas v rámci území — teď se synchronizoval celý svět.',
    clanek: 'casova-pasma',
    bibKey: 'dohrn-vanrossumHistoryHourClocks1996',
    zdroj: 'Dohrn-van Rossum 1996 — History of the Hour',
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
    bibKey: 'katzirTimeStandardsTwentieth2017',
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
    bibKey: 'skalaVyvojPodobyAstrolabu2016',
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
    bibKey: 'skalaAlegorieCtnostiNeresti2015',
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
