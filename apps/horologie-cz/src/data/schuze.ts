/**
 * Členské schůze ČSH — kompletní seznam od založení (2021-09 → současnost).
 *
 * ZDROJ DAT:
 *   Patrik Pařízek poskytl 2026-06-06 PDF se zápisy programů + docházky.
 *   Strukturované zde do polí, jmenná docházka VYNECHANA (GDPR — interní list).
 *
 * KONVENCE:
 *   - `datum` jako ISO YYYY-MM-DD pro řazení; `datumText` pro zobrazení.
 *   - `misto` defaultně "Clock Gallery Praha, Jungmannova 748/30" (~30 z 35
 *     schůzí), výjimky explicitně uvedeny.
 *   - `program` — pole bodů programu z hlavičky zápisu, případně se zkratkou
 *     referenta (PK = Petr Král, PS = P. Skála, MB = Mirek Baudisch,
 *     RH = Radim Himmler, DK = David Knespl, atd.).
 *   - `referenti` — slovník zkratek pro tooltip / legenda.
 *   - `pocetUcastniku` — počet lidí v docházce (členové + hosté, bez omluvených).
 *   - `format` — 'prezenční' | 'zoom' | 'výjezd'. Zoom v 2021-2022 covid doznívání.
 *
 * Klíčový kontext: Clock Gallery Praha (Jungmannova 748/30) je dlouhodobé
 * domácí místo schůzí — viz `/sponzoring#clock-gallery`.
 */

export type SchuzeFormat = 'prezencni' | 'zoom' | 'vyjezd';

export interface SchuzeProgramItem {
  text: string;
  referent?: string;   // zkratka nebo plné jméno
}

export interface Schuze {
  slug: string;          // /schuze#<slug>
  datum: string;         // ISO YYYY-MM-DD
  datumText: string;     // např. "29. května 2026"
  misto: string;         // popisek místa
  format: SchuzeFormat;
  program: SchuzeProgramItem[];
  pocetUcastniku: number;
  poznamka?: string;
}

/**
 * Slovník zkratek referentů — pro tooltip/legendu na /schuze.
 * Iniciály v zápisech historicky proměnlivé, zde sjednoceno.
 */
export const referenti: Record<string, string> = {
  PK: 'Ing. Petr Král (předseda)',
  PS: 'Petr Skála (restaurátor)',
  MB: 'Mirek Baudisch',
  RH: 'Radim Himmler',
  DK: 'David Knespl',
  JH: 'Jiří Havlíček',
  JF: 'Jan Fišer',
  Tg: 'Jaroslav Traugott',
  Zdík: 'Zdeněk Šíma',
  PP: 'Patrik Pařízek',
};

/**
 * Seznam schůzí od září 2021 — řazeno chronologicky (nejnovější první v UI).
 */
export const schuze: Schuze[] = [
  // ─── 2026 ───
  {
    slug: 'schuze-2026-05-29',
    datum: '2026-05-29',
    datumText: '29. května 2026',
    misto: 'Clock Gallery Praha, Jungmannova 748/30',
    format: 'prezencni',
    program: [
      { text: 'Digitální sluneční hodiny Hines a polární sluneční hodiny s mechanickým světelným filtrem', referent: 'PK' },
      { text: 'Síťové služby CESNET', referent: 'host Smotlacha' },
      { text: 'Příprava nové verze našich webů', referent: 'DK' },
    ],
    pocetUcastniku: 8,
  },
  {
    slug: 'schuze-2026-04-24',
    datum: '2026-04-24',
    datumText: '24. dubna 2026',
    misto: 'Clock Gallery Praha, Jungmannova 748/30',
    format: 'prezencni',
    program: [
      { text: 'Jak na vlastní číselník?', referent: 'JF' },
      { text: 'Prezentace', referent: 'host: Jan Tomek +1' },
      { text: 'Jak provozovat americké synchronní hodiny 110 V / 60 Hz', referent: 'PK' },
      { text: 'Hodinárium — diskuze' },
      { text: 'Natahovadla', referent: 'Jarda' },
    ],
    pocetUcastniku: 8,
  },
  {
    slug: 'schuze-2026-03-20',
    datum: '2026-03-20',
    datumText: '20. března 2026',
    misto: 'Clock Gallery Praha, Jungmannova 748/30',
    format: 'prezencni',
    program: [
      { text: 'Johannes dictus Ruz', referent: 'PK' },
      { text: 'Kalendáře', referent: 'Zdík' },
      { text: 'Souvislost vzniku kalendáře Léta Páně a Velikonoc', referent: 'PK' },
      { text: 'Orloj v Cedar Rapids', referent: 'RH' },
      { text: 'Zpráva o hospodaření 2025, přírůstky v Hodináriu', referent: 'MB' },
    ],
    pocetUcastniku: 13,
  },
  {
    slug: 'schuze-2026-02-13',
    datum: '2026-02-13',
    datumText: '13. února 2026',
    misto: 'Staroměstská radnice, pokladní hala',
    format: 'vyjezd',
    program: [
      { text: 'Prohlídka digitálního modelu ve Staroměstské radnici (sraz u pokladen ve 14:00)' },
      { text: 'Posezení U Špirků' },
      { text: 'Bohuslav' },
    ],
    pocetUcastniku: 14,
    poznamka: 'Sraz u pokladen Staroměstské radnice, navazující posezení v restauraci U Špirků.',
  },

  // ─── 2025 ───
  {
    slug: 'schuze-2025-12-12',
    datum: '2025-12-12',
    datumText: '12. prosince 2025',
    misto: 'Clock Gallery Praha, Jungmannova 748/30',
    format: 'prezencni',
    program: [
      { text: 'Hodiny Comtoise', referent: 'JH' },
      { text: 'Recyklace témat o orloji — Kdy se hřeben přitrefí?', referent: 'PK' },
      { text: 'Projekt databáze on-line zdrojů o Pražském orloji (diskuze)', referent: 'PK' },
      { text: 'Videa z restaurování hodin, oprava hodin sv. Víta v roce 1930', referent: 'PS' },
      { text: 'Události: Svoboda, muzeumhodin.cz, Facebook, komentovaná prohlídka digitálního orloje na radnici, překlad orloj.eu', referent: 'PK' },
      { text: 'Johannes dictus Ruz', referent: 'PK' },
    ],
    pocetUcastniku: 8,
  },
  {
    slug: 'schuze-2025-11-14',
    datum: '2025-11-14',
    datumText: '14. listopadu 2025',
    misto: 'Clock Gallery Praha, Jungmannova 748/30',
    format: 'prezencni',
    program: [
      { text: 'Novinky v Hodináriu — nový exponát: americké časové razítko po roce 1903', referent: 'PK + MB' },
      { text: 'Vysílač Krašov, aka „největší sluneční hodiny" v Česku neřkuli na světě', referent: 'Tg' },
      { text: 'Hodiny Kienzle', referent: 'MB' },
      { text: 'Web orloj.eu od roku 2010 — nutné změny, překlady, Macháček', referent: 'PK' },
      { text: 'OT: „Chceš vidět polární záři?…"', referent: 'Tg' },
      { text: 'Krátká zpráva o problémech s natahováním orloje od 15. století do včerejška', referent: 'PS' },
      { text: 'Videa z restaurování hodin, oprava hodin sv. Víta v roce 1930', referent: 'PS' },
      { text: 'Odraz času na prvních daguerrotypiích (z cyklu „co právě dělám")', referent: 'PP' },
      { text: 'Hodiny Comtoise', referent: 'JH' },
    ],
    pocetUcastniku: 10,
  },
  {
    slug: 'schuze-2025-10-17',
    datum: '2025-10-17',
    datumText: '17. října 2025',
    misto: 'Clock Gallery Praha, Jungmannova 748/30',
    format: 'prezencni',
    program: [
      { text: 'Zajímavosti řešení internetu v Hodináriu — Monitor Hodinária', referent: 'PK' },
      { text: 'Orloj v Messině', referent: 'DK' },
      { text: 'Hodinářské unikáty z dílny Vladimíra Dvořáka (nikoli konferenciéra, ale hodináře)', referent: 'RH' },
      { text: 'Pokus o implementaci AI do průvodkyně webem Pražského orloje (Chat Hanuša?)', referent: 'PK' },
      { text: 'Jak na staré a poškozené číselníky?', referent: 'JF' },
    ],
    pocetUcastniku: 10,
  },
  {
    slug: 'schuze-2025-09-20',
    datum: '2025-09-20',
    datumText: '20. září 2025',
    misto: 'Hodinárium Děčín (výjezdní zasedání)',
    format: 'vyjezd',
    program: [
      { text: 'Krátké seznámení s novinkami v Hodináriu, komentovaná prohlídka', referent: 'Mirek' },
    ],
    pocetUcastniku: 7,
    poznamka: 'Výjezdní zasedání v expozici Hodinária na zámku Děčín.',
  },
  {
    slug: 'schuze-2025-06-13',
    datum: '2025-06-13',
    datumText: '13. června 2025',
    misto: 'Clock Gallery Praha, Jungmannova 748/30',
    format: 'prezencni',
    program: [
      { text: 'Novinky v Hodináriu', referent: 'MB' },
      { text: 'Novinky na webu — Jak přesný je čas v televizi?', referent: 'PK' },
      { text: 'Digitálně řízené kyvadlo s automatickou regulací ESP8266-12F', referent: 'PK' },
      { text: 'KAPPA — výrobce námořních hodin master-slave + řízení ESP8266-12F', referent: 'PK' },
      { text: 'Staré video o restaurování hezkých hodin + opravený Winnerl z Hodinária', referent: 'PS' },
    ],
    pocetUcastniku: 11,
  },
  {
    slug: 'schuze-2025-03-28',
    datum: '2025-03-28',
    datumText: '28. března 2025',
    misto: 'Clock Gallery Praha, Jungmannova 748/30',
    format: 'prezencni',
    program: [
      { text: 'Naplánování termínů schůzí na půl roku' },
      { text: 'Ukázka rozpracovaných atomových hodin', referent: 'PK' },
      { text: 'Upravíme heslo orloj v WIKI? Budeme spolupracovat s hvězdárnou v Sezimově Ústí na mapě orlojů?' },
      { text: 'Steinichův orloj(e)?', referent: 'PK' },
      { text: 'Sovětské matiční hodiny', referent: 'MB' },
      { text: 'Chceme cimbál cca 200 kg za cca 20 tisíc?? (diskuze)' },
      { text: 'Přestavba hodinářského soustruhu pro digitální odčítání os XY' },
    ],
    pocetUcastniku: 7,
  },
  {
    slug: 'schuze-2025-02-07',
    datum: '2025-02-07',
    datumText: '7. února 2025',
    misto: 'Clock Gallery Praha, Jungmannova 748/30',
    format: 'prezencni',
    program: [
      { text: 'Zahájení, vynucená migrace webů', referent: 'PK' },
      { text: 'Hospodaření spolku 2024', referent: 'MB' },
      { text: 'Přírůstky Hodinárium 2024', referent: 'MB' },
      { text: 'František Planička — historické doklady upřesňující život a dílo', referent: 'RH' },
      { text: 'Restaurování Planičkova velkého salonního orloje v roce 2012', referent: 'PS' },
      { text: 'Zajímavé sovětské matiční hodiny', referent: 'MB' },
      { text: 'Opakování: geocentrické planetárium Rockenhausen??', referent: 'PK' },
    ],
    pocetUcastniku: 8,
  },

  // ─── 2024 ───
  {
    slug: 'schuze-2024-11-29',
    datum: '2024-11-29',
    datumText: '29. listopadu 2024',
    misto: 'Clock Gallery Praha, Jungmannova 748/30',
    format: 'prezencni',
    program: [
      { text: 'Oprava čínských hodin', referent: 'MB' },
      { text: 'Atomové hodiny nejsou prakticky radioaktivní, není to atomová bomba — postavme si je!', referent: 'PK' },
      { text: 'Filmové dokumenty z restaurování hodin zámku Měšice (S. Londensperger 1774) a další', referent: 'PS' },
    ],
    pocetUcastniku: 14,
  },
  {
    slug: 'schuze-2024-06-21',
    datum: '2024-06-21',
    datumText: '21. června 2024',
    misto: 'Clock Gallery Praha, Jungmannova 748/30',
    format: 'prezencni',
    program: [
      { text: 'Prodleva v zakoupení cimbálu', referent: 'PK' },
      { text: 'O exponátu Hodinária — 3D hodiny Time Slider', referent: 'PK' },
      { text: 'Noční hodiny — replika', referent: 'MB' },
      { text: 'Krásné barokní hodiny, ale v šíleném stavu, od včerejška u nás v ateliéru' },
      { text: 'Průběžné info o konstrukci a výrobě domácího orloje (možná už i funkční vzorek)' },
      { text: 'Výlet do Hojsovy Stráže a Rakouska, Ledeč, Třebíč…' },
    ],
    pocetUcastniku: 9,
  },
  {
    slug: 'vyjezdni-zasedani-hojsova-straz-jahrsdorf-2024',
    datum: '2024-05-01',
    datumText: 'jaro 2024',
    misto: 'Hojsova Stráž — Jahrsdorf (výjezdní zasedání)',
    format: 'vyjezd',
    program: [
      { text: 'Vjezdní zasedání spolku — Hojsova Stráž a Jahrsdorf' },
    ],
    pocetUcastniku: 7,
    poznamka: 'Plánovací list bez detailního programu — preferované termíny a ubytování členů.',
  },
  {
    slug: 'schuze-2024-04-19',
    datum: '2024-04-19',
    datumText: '19. dubna 2024',
    misto: 'Clock Gallery Praha, Jungmannova 748/30',
    format: 'prezencni',
    program: [
      { text: 'O hodinách na hradě, Dondím atd.', referent: 'DK' },
      { text: 'Info o Bozkových a Luzových „seriově" vyráběných věžních hodinách', referent: 'DK' },
      { text: 'Něco vymyslím, nevím, jestli jsem už povídal o hodinách na věži katedrály — videa stará i současná', referent: 'PS' },
      { text: 'Bicí stroj, který by odbíjel nestejné hodiny (kresba principu vypouštění bicího stroje, který nikdy neexistoval)', referent: 'PS' },
      { text: 'Distribuce Zpravodaje SPSH', referent: 'RH' },
      { text: 'Průběžné info o konstrukci a výrobě domácího orloje (možná už i funkční vzorek)' },
      { text: 'Výlet do Hojsovy Stráže a Rakouska' },
      { text: 'Krátká zpráva o dvou věžních strojích', referent: 'MB' },
      { text: 'Domluvit návštěvu olomouckého orloje přes magistrát (pan Šustr orloj nevlastní)', referent: 'PS' },
    ],
    pocetUcastniku: 15,
  },
  {
    slug: 'schuze-2024-03-15',
    datum: '2024-03-15',
    datumText: '15. března 2024',
    misto: 'Clock Gallery Praha, Jungmannova 748/30',
    format: 'prezencni',
    program: [
      { text: 'Nově objevené hodiny LAPLACE pro využití v elektrárnách', referent: 'PK' },
      { text: 'Nové poznatky o autorovi Linduškova orloje z Muzea Kroměřížska', referent: 'RH' },
      { text: 'Oprava Bulle hodin', referent: 'MB' },
      { text: 'Rádiové časové signály podle prof. Schneidera', referent: 'PK' },
    ],
    pocetUcastniku: 9,
  },
  {
    slug: 'schuze-2024-02-16',
    datum: '2024-02-16',
    datumText: '16. února 2024',
    misto: 'Clock Gallery Praha, Jungmannova 748/30',
    format: 'prezencni',
    program: [
      { text: 'Co přinesl Ježíšek' },
      { text: 'Stínidla lamp a hodinky', referent: 'JF' },
      { text: 'Něco málo o DCF 77', referent: 'PK' },
      { text: 'Hospodaření 2023', referent: 'MB' },
      { text: 'Horoskop a astroláb', referent: 'Bohuslav' },
    ],
    pocetUcastniku: 7,
  },

  // ─── 2023 ───
  {
    slug: 'schuze-2023-12-15',
    datum: '2023-12-15',
    datumText: '15. prosince 2023',
    misto: 'Clock Gallery Praha, Jungmannova 748/30',
    format: 'prezencni',
    program: [
      { text: '3D NTP hodiny — předvedení, prodej', referent: 'JH + PK' },
      { text: 'Přínesu Kavalírův astroláb, co je v Hodináriu', referent: 'MB' },
      { text: 'Planetní hodiny a astrologické domy na našem orloji a jak vidím co astrolog užití astrolábu dle Křišťana z Prachatic', referent: 'Bohuslav' },
      { text: 'Přínesu ukázat sborník z loňského symposia v Rostocku', referent: 'PS' },
    ],
    pocetUcastniku: 8,
  },
  {
    slug: 'schuze-2023-11-03',
    datum: '2023-11-03',
    datumText: '3. listopadu 2023',
    misto: 'Clock Gallery Praha, Jungmannova 748/30',
    format: 'prezencni',
    program: [
      { text: 'Hodiny strážní', referent: 'Karel Mucha' },
      { text: 'Orloj — záhada ciferníku na straně k Týnu', referent: 'PS' },
      { text: 'O hodinách se setrvačkou a natahováním Ferrarisovým motorkem', referent: 'MB' },
      { text: 'Výjezdní zasedání Třebíč??', referent: 'Jarda' },
      { text: 'Sluneční hodiny Jinonice', referent: 'Zdík' },
      { text: 'Předvedení zakoupených věžních hodin', referent: 'M. Klikar' },
    ],
    pocetUcastniku: 16,
  },
  {
    slug: 'schuze-2023-10-06',
    datum: '2023-10-06',
    datumText: '6. října 2023',
    misto: 'Clock Gallery Praha, Jungmannova 748/30 + návštěva NTM',
    format: 'prezencni',
    program: [
      { text: 'Nové poznatky o výrobci věžních hodin z Moravského Berouna F. X. Beitelovi', referent: 'RH' },
      { text: 'Restaurování stroje Lissner', referent: 'MB' },
      { text: 'Nabídka informací o hodinách Magneta + od 17:00 v NTM', referent: 'PK + Hamr' },
      { text: 'Doplněná orlojní kniha (http://orloj.eu/download/orlojni_kniha.pdf)' },
      { text: 'Vyprodaná čísla zpravodaje na Google Books?', referent: 'PP' },
    ],
    pocetUcastniku: 11,
    poznamka: 'Po schůzi navazující návštěva expozice hodin v Národním technickém muzeu (od 17:00).',
  },
  {
    slug: 'setkani-tocna-2023-08-26',
    datum: '2023-08-26',
    datumText: '26. srpna 2023',
    misto: 'Praha-Točná, Starý lis 269 — U Havlíčků',
    format: 'vyjezd',
    program: [
      { text: 'Setkání u Jiřího Havlíčka v Točné — prohlídka jeho vlastnoručně postaveného astronomického orloje (viz článek na Hodináriu)' },
    ],
    pocetUcastniku: 7,
    poznamka: 'Neformální setkání s prohlídkou točenského orloje. Viz článek o orloji v sekci Projekty na Hodináriu.',
  },
  {
    slug: 'schuze-2023-06-23',
    datum: '2023-06-23',
    datumText: '23. června 2023',
    misto: 'Clock Gallery Praha, Jungmannova 748/30',
    format: 'prezencni',
    program: [
      { text: 'Amantův versus Lepautův versus Mannhardtův versus Kavalírův krok???' },
      { text: 'Výstava a Mánesova deska???' },
      { text: 'Hodiny Kratochvíle', referent: 'Volf' },
      { text: 'Hodiny na platformě Divoom Pixoo 16×16 Pixel Art LED', referent: 'PK' },
      { text: 'Božkův chronometr??' },
    ],
    pocetUcastniku: 9,
  },
  {
    slug: 'schuze-2023-05-19',
    datum: '2023-05-19',
    datumText: '19. května 2023',
    misto: 'Clock Gallery Praha, Jungmannova 748/30',
    format: 'prezencni',
    program: [
      { text: 'Distribuce Zpravodaje SPSH', referent: 'PP' },
      { text: 'Astroláb na straně Týna', referent: 'DK' },
      { text: 'Externí regulátor', referent: 'DK' },
      { text: 'Restaurování Planičkova orloje a barokních hodin v Jičíně, malá ale zřejmě neznámá chyba na orloji z roku 1865', referent: 'PS' },
      { text: 'Informace z německé návštěvy a z Olomouce', referent: 'DK' },
      { text: 'Podružný strojek s kývavou kotvou', referent: 'PK' },
      { text: 'Zapůjčení artefaktů z orloje?' },
      { text: 'Vznik Kojetických apoštolů', referent: 'DK' },
    ],
    pocetUcastniku: 16,
  },
  {
    slug: 'schuze-2023-02-17',
    datum: '2023-02-17',
    datumText: '17. února 2023',
    misto: 'Clock Gallery Praha, Jungmannova 748/30',
    format: 'prezencni',
    program: [
      { text: 'Návštěva Dr. Machacka', referent: 'DK' },
      { text: 'Němý dokument z roku 1930 — montáž hodinového stroje do věže katedrály', referent: 'PS' },
      { text: 'Dokument o restaurování hodin katedrály cca 30 m', referent: 'PS' },
      { text: 'Dění v Hodináriu', referent: 'PK (info od Mirka)' },
    ],
    pocetUcastniku: 13,
  },
  {
    slug: 'schuze-2023-01-13',
    datum: '2023-01-13',
    datumText: '13. ledna 2023',
    misto: 'Clock Gallery Praha, Jungmannova 748/30',
    format: 'prezencni',
    program: [
      { text: 'Hospodaření, novinky v Hodináriu', referent: 'MB' },
      { text: 'Pneumatické hodiny v Paříži', referent: 'PK' },
      { text: '3D tisk komponentů', referent: 'Jirka' },
      { text: 'Co přinesl Ježíšek', referent: 'všichni' },
      { text: 'Zajímavost — Astronomical Clock shop (tourist information, clocks, watches)', referent: 'PP' },
    ],
    pocetUcastniku: 10,
  },

  // ─── 2022 ───
  {
    slug: 'schuze-2022-12-02',
    datum: '2022-12-02',
    datumText: '2. prosince 2022',
    misto: 'Clock Gallery Praha, Jungmannova 748/30 + U Balbínů',
    format: 'prezencni',
    program: [
      { text: 'Volba výboru a předsedy', referent: 'PK' },
      { text: 'Nová historie Pražského orloje', referent: 'PS' },
      { text: 'Stolní podružné hodiny, ukázka šičkové DCF techniky', referent: 'PK' },
      { text: 'Seznam hodin Jana Prokeše a jeho žáků', referent: 'DK' },
      { text: 'Přírustky hodinária', referent: 'MB' },
      { text: 'Metronom v Praze na Letné', referent: 'Tg' },
      { text: 'Konzumace' },
    ],
    pocetUcastniku: 15,
    poznamka: 'Volební schůze. Po schůzi konzumace U Balbínů.',
  },
  {
    slug: 'schuze-2022-11-11',
    datum: '2022-11-11',
    datumText: '11. listopadu 2022',
    misto: 'Clock Gallery Praha, Jungmannova 748/30',
    format: 'prezencni',
    program: [
      { text: 'Otevření Expozice času ve Šternberku 11. listopadu', referent: 'StanM' },
      { text: 'Vzpomínka na Věžní muzejíčko od 2009', referent: 'PK' },
      { text: 'Přírůstky v Hodináriu', referent: 'MB' },
      { text: 'Hodinova ústředna plánky', referent: 'PP' },
    ],
    pocetUcastniku: 11,
  },
  {
    slug: 'schuze-2022-09-30',
    datum: '2022-09-30',
    datumText: '30. září 2022',
    misto: 'Hodinárium Děčín (výjezdní zasedání)',
    format: 'vyjezd',
    program: [
      { text: 'Prohlídka Hodinária' },
    ],
    pocetUcastniku: 12,
    poznamka: 'Výjezdní zasedání v expozici Hodinária na zámku Děčín.',
  },
  {
    slug: 'schuze-2022-06-10',
    datum: '2022-06-10',
    datumText: '10. června 2022',
    misto: 'Clock Gallery Praha, Jungmannova 748/30',
    format: 'prezencni',
    program: [
      { text: 'Nový člen Jan Kyncl — hlasování' },
      { text: 'Orloje v NTM?' },
      { text: 'Křeslo pro hosta tentokrát se vztahem ke kalendáři Pražského orloje' },
      { text: 'Reflexe semináře, příprava výstavy v NTM + závěry z jednání v Elektročasu' },
      { text: 'Jiný termín výletu…' },
    ],
    pocetUcastniku: 14,
  },
  {
    slug: 'schuze-2022-05-13',
    datum: '2022-05-13',
    datumText: '13. května 2022',
    misto: 'Clock Gallery Praha, Jungmannova 748/30',
    format: 'prezencni',
    program: [
      { text: 'Křeslo pro hosta — Ivo Procházka, beseda: čas v TV' },
    ],
    pocetUcastniku: 11,
  },
  {
    slug: 'schuze-2022-04-08',
    datum: '2022-04-08',
    datumText: '8. dubna 2022',
    misto: 'Clock Gallery Praha, Jungmannova 748/30',
    format: 'prezencni',
    program: [
      { text: 'Novinky Hodinárium', referent: 'MB' },
      { text: 'Novinky webu — zdražení, ESP266 pro Solari, nový člen Ruda Kepert + Radka Bauerová, simulátor od Kerry Shetline', referent: 'PK' },
      { text: 'Akce Rostock', referent: 'PS' },
      { text: '? (téma neuvedeno)', referent: 'DK' },
      { text: 'Ukázka astrolábu 1:10 z 3D tiskárny', referent: 'Ruda' },
      { text: 'Distribuce Zpravodaje SPSH 37/2022' },
    ],
    pocetUcastniku: 17,
  },
  {
    slug: 'schuze-2022-01-14',
    datum: '2022-01-14',
    datumText: '14. ledna 2022',
    misto: 'Online (Zoom)',
    format: 'zoom',
    program: [
      { text: 'Geneze Pražského orloje aneb všechno bylo poněkud jinak', referent: 'PS' },
      { text: 'Co je nového a co komu přinesl Ježíšek (Ježich je větší Ježíšek, který unese i věžní hodiny)' },
    ],
    pocetUcastniku: 6,
    poznamka: 'Online schůze v době covidového doznívání.',
  },

  // ─── 2021 ───
  {
    slug: 'schuze-2021-12-10',
    datum: '2021-12-10',
    datumText: '10. prosince 2021',
    misto: 'Online (Zoom)',
    format: 'zoom',
    program: [
      { text: 'Vytyčení místního poledníku s použitím soudobé technologie', referent: 'Jindra T.' },
      { text: 'Co nejpřesnější čas s Arduinem?', referent: 'PK' },
      { text: 'Co nového v Hodináriu??', referent: 'MB' },
    ],
    pocetUcastniku: 4,
    poznamka: 'Online schůze v 18:00 (posunutý čas).',
  },
  {
    slug: 'schuze-2021-11-12',
    datum: '2021-11-12',
    datumText: '12. listopadu 2021',
    misto: 'Online (Zoom)',
    format: 'zoom',
    program: [
      { text: 'P. Skála: Stavitelé Pražského orloje aneb všechno bylo poněkud jinak — cca půl hodiny', referent: 'PS' },
      { text: 'Bude-li čas a zájem, závěrečná část prezentace z kongresu SIC v červenci, část o astrolábu (v češtině)', referent: 'PS' },
      { text: 'Barokní figurální orloj na zámku Mnichovo Hradiště — 13 min', referent: 'PS' },
    ],
    pocetUcastniku: 8,
  },
  {
    slug: 'schuze-2021-10-08',
    datum: '2021-10-08',
    datumText: '8. října 2021',
    misto: 'Clock Gallery Praha, Jungmannova 748/30',
    format: 'prezencni',
    program: [
      { text: 'Pamětníci n.p. Klenoty — reportážní projekt', referent: 'Aleš P.' },
      { text: 'Uspořádání semináře pro veřejnost — návrh', referent: 'PP' },
      { text: 'Římské digitálky', referent: 'PK' },
      { text: 'Vkládání přestupného dne 24.2.???', referent: 'PK' },
      { text: 'Duše plná koleček — pozvánka na výstavu', referent: 'PP' },
    ],
    pocetUcastniku: 10,
  },
  {
    slug: 'schuze-2021-09-10',
    datum: '2021-09-10',
    datumText: '10. září 2021',
    misto: 'Clock Gallery Praha, Jungmannova 748/30',
    format: 'prezencni',
    program: [
      { text: 'Přírůstky Hodinárium', referent: 'MB + PK' },
      { text: 'Arduino NTP impulzéry', referent: 'PK' },
      { text: 'Pokusy se zpracováním PPS = sekundového pulzu z GPS', referent: 'PK' },
      { text: 'Workshop měření slunečními hodinami v Polné', referent: 'PP + Jindra' },
      { text: 'CD na slunícko a obrazce jsem na něm honil', referent: 'PK + Jindra' },
      { text: 'Dráha Země jako excentr, ekvant a elipsa', referent: 'Jindra' },
    ],
    pocetUcastniku: 8,
    poznamka: 'První zaznamenaná schůze v dochovaném programovém PDF.',
  },
];

/**
 * Schůze řazené nejnovější první (pro hlavní výpis).
 */
export const schuzeChronologicky = [...schuze].sort((a, b) => b.datum.localeCompare(a.datum));

/**
 * Schůze seskupené po rocích.
 */
export function schuzePoRoce(): Map<number, Schuze[]> {
  const m = new Map<number, Schuze[]>();
  for (const s of schuzeChronologicky) {
    const rok = parseInt(s.datum.slice(0, 4), 10);
    if (!m.has(rok)) m.set(rok, []);
    m.get(rok)!.push(s);
  }
  return m;
}

/**
 * Statistiky pro hlavičku stránky.
 */
export const schuzeStatistiky = {
  pocetCelkem: schuze.length,
  pocetPrezencnich: schuze.filter((s) => s.format === 'prezencni').length,
  pocetZoom: schuze.filter((s) => s.format === 'zoom').length,
  pocetVyjezdnich: schuze.filter((s) => s.format === 'vyjezd').length,
  prvniSchuze: schuze.reduce((a, b) => (a.datum < b.datum ? a : b)).datum,
  posledniSchuze: schuze.reduce((a, b) => (a.datum > b.datum ? a : b)).datum,
  prumernaUcast: Math.round(
    schuze.reduce((sum, s) => sum + s.pocetUcastniku, 0) / schuze.length
  ),
  celkemBoduProgramu: schuze.reduce((sum, s) => sum + s.program.length, 0),
};
