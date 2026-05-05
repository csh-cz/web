#!/usr/bin/env node
// Aktualizace karet Krečmerových strojů podle:
//   1) Krečmerovy soupisové dokumentace (docx „Věžní hodiny kREČMER Průhonice.docx",
//      autor Petr Skála, atelier veznihodiny.cz; obsahuje 7 lokalit dokumentovaných
//      mezi 1997–2004)
//   2) Skálovy „Závěrečné zprávy o provedení soupisu historicky cenných věžních
//      hodinových strojů ve středočeském regionu" (Sadská, prosinec 2004)
//
// Pro každou kartu se:
//   - Přepíše frontmatter (zachová slug; opraví rok dle signatury; doplní krok,
//     pohon, signaturu, rozměry, ciferniky, stav, restaurator)
//   - Doplní 1–2 prameny (Krečmer dokumentace + Skála 2004 zpráva)
//   - Příjme strukturované tělo (popis stroje, ciferníky, stav, hodnocení 2004)

import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve(new URL('.', import.meta.url).pathname, '..', 'content', 'soupis-veznich-hodin');

const KRECMER_PRAMEN = `  - citace: |
      SKÁLA, Petr. *Věžní hodiny — Krečmerovy stroje (soupisová dokumentace)*. Atelier veznihodiny.cz, archiv Hodinária. — Rukopis (docx, 32 743 znaků), zpracováno v letech 1997–2004; obsahuje 7 lokalit (Libušín, Přerov nad Labem, Votice, Vrchotovy Janovice, Unhošť, Trhový Štěpánov, Rudná-Dušníky).
    type: zprava
    author: "Petr Skála"`;

const SKALA_2004_PRAMEN = `  - citace: |
      SKÁLA, Petr. *Závěrečná zpráva o provedení soupisu historicky cenných věžních hodinových strojů ve středočeském regionu*. Sadská, prosinec 2004. — Rukopis (MS Word 9.0, 16 607 znaků), archiv atelieru veznihodiny.cz. Soupis 138 strojů zdokumentovaných v letech 1996–2004 s klasifikací 1–5 (priorita ochrany; 1 = nejvyšší historická hodnota).
    type: zprava
    author: "Petr Skála"`;

function classDescription(c) {
  switch (c) {
    case 1: return '**Třída 1** — nejvyšší hodnocení.';
    case 2: return '**Třída 2** — vysoce hodnotný stroj.';
    case 3: return '**Třída 3** — historicky cenný stroj.';
    case 4: return '**Třída 4** — zajímavý a hodnotný stroj.';
    case 5: return '**Třída 5** — zajímavá a cenná technická památka.';
    default: return '';
  }
}

const ENTRIES = [
  {
    file: '1895-libusin-krecmer.mdx',
    obec: 'Libušín', okres: 'Kladno', kraj: 'Středočeský',
    budova: 'Kostel sv. Prokopa',
    rok: 1898, slug: '1895-libusin-krecmer',
    signatura: 'W. Kretschmer, Praha 1898',
    krok: 'Amantův',
    pohon: 'závaží přes kladkostroj na lanovém bubnu (Harrisonův vyrovnávač tahové síly)',
    pocetCifernik: 4,
    rozmery: 'rám 60 × 40 × 40 cm; kyvadlo cca 175 cm',
    docDate: '29. 9. 1997',
    skala2004: { docYear: 1997, label: 'V. Krečmer 1898', klass: 3 },
    stav: 'in_situ', chod: 'v_chodu',
    mainText: `Stroj **zvláštní konstrukce** signovaný výrobcem (W. Kretschmer, Praha) i pořizovatelem. Jicí stroj má **pouze dvě hřídele** — hřídel s lanovým bubnem a hřídel s krokovým kolem. Na hřídeli lanového bubnu je osazen **Harrisonův vyrovnávač tahové síly** během natahování závaží. Závaží je zavěšeno přes kladkostroj.

Bicí stroj rovněž poháněný závažím přes kladkostroj. Otáčky regulovány větrníkem se svislou hřídelí (otáčen ozubením na lanovém bubnu šnekovým převodem). Pastorek na hřídeli lanového bubnu otáčí **oboustranným závěrkovým kolem**, jehož jedna strana ovládá hodinové bití a druhá strana čtvrťové. Kontrolní ciferníček ukazuje pouze minuty; hodiny lze odečíst na závěrkovém kole proti pevné ručce.

**Závaží litinová**, čočka kyvadla **litinová na dřevěné kyvadlové tyči**.`,
    cifText: `**Čtyři ciferníky** s římskými ciframi, ručky a cifry bílé.`,
    odbText: `Na **jeden ocelový cimbál** a **jeden bronzový cimbál ⌀ 63 cm** přenesený do věže odjinud, signovaný **„Franz Joseph Kühner 1814"**.`,
    stavText: `Stav stroje ke dni **29. 9. 1997**: **dobrý**. Funkce bicího stroje je chybná pro poruchu přeřazování hodinové a čtvrťové bicí páky do dráhy bicích kolíků. Harrisonův vyrovnávač tahové síly je nefunkční.`,
    vlast: 'Kostel ve vlastnictví **Římskokatolické církve**.',
  },
  {
    file: '1904-prerov-nad-labem-krecmer.mdx',
    obec: 'Přerov nad Labem', okres: 'Nymburk', kraj: 'Středočeský',
    budova: 'Kostel sv. Vojtěcha',
    rok: 1905, slug: '1904-prerov-nad-labem-krecmer',
    signatura: 'V. Krečmer K. Vinohrady 1905 (vytvořeno přímo v litinovém odlitku rámu)',
    krok: 'Amantův s Lepautovou úpravou',
    pohon: 'závaží na ocelových lanech přes volné kladky (Harrisonův vyrovnávač)',
    pocetCifernik: 4,
    rozmery: 'rám 72 × 39 × 33 cm; kyvadlo cca 170 cm',
    docDate: '29. 11. 1999',
    skala2004: { docYear: 1999, label: 'Václav Krečmer 1905', klass: 5 },
    stav: 'in_situ', chod: 'v_chodu',
    restaurator: 'Petr Skála',
    mainText: `Věžní hodinový stroj neobvyklé konstrukce. Jicí stroj má **pouze dvě hřídele** — hřídel lanového bubnu s hlavním (minutovým) kolem a hřídel krokového kola. Vybaven **Harrisonovým vyrovnávačem tahové síly**. **Kyvadlová čočka litinová**, kyvadlová tyč dřevěná. Regulační šroub rychlosti chodu je umístěn na horním kování kyvadlové tyče nesoucí palety kotvy.

Bicí stroj rovněž dvouhřídelový — na hřídeli lanového bubnu osazené šnekové kolo zabírá do hnaného šneku na svislé hřídeli větrníku. Bicí stroj odbíjí v půl jeden úder a v celou hodinu tolik úderů, kolik je hodin.

Hodinový stroj signován na rámu na straně kyvadla; nápis **„V. Krečmer k. Vinohrady 1905"** je vytvořen v litinovém odlitku rámu.

Původní závaží tvořena **ocelovými nádobami naplněnými zátěží**, zavěšena na ocelových lanech přes volné kladky.`,
    cifText: `**Čtyři ocelové ciferníky** s ocelovým rámem na lícové straně. Oválná okénka. Plocha natřena černou barvou; **bílé malované římské cifry**, bílé ručky.`,
    odbText: `Pravděpodobně na zvon. Paličkový stroj se ve věži nedochoval (byl pravděpodobně odstraněn při elektrifikaci zvonů).`,
    stavText: `Stav stroje ke dni **29. 11. 1999**: jicí stroj udržován v provozu, ale zaolejován a znečištěn. **Bicí stroj odstaven z provozu**, závaží pohonu položeno na podlaze.`,
    vlast: '**Římskokatolická farnost Přerov nad Labem**.',
  },
  {
    file: '1894-votice-krecmer.mdx',
    obec: 'Votice', okres: 'Benešov', kraj: 'Středočeský',
    budova: 'Kostel sv. Václava',
    rok: 1895, slug: '1894-votice-krecmer',
    signatura: 'V. Kretschmer Praha 1895 (na straně kyvadla); „Nákladem občanů votických 1895" (na straně kontrolního ciferníčku)',
    krok: 'Amantův kolíčkový krok s Lepautovou úpravou (s půlenými kolíčky)',
    pohon: 'závaží přes volné kladky',
    pocetCifernik: 4,
    rozmery: 'rám 80 × 39 × 43 cm; kyvadlo cca 285 cm',
    docDate: '2000',
    skala2004: { docYear: 1999, label: 'V. Krečmer', klass: 3, klassNote: 'x?' },
    stav: 'in_situ', chod: 'nefunkcni',
    mainText: `Litinový rám stroje je černý, **zdobený zlatými linkami**. Na straně kyvadla je v odlitku rámu vytvořen nápis *„V. Kretschmer Praha 1895"*, na straně kontrolního ciferníčku a závěrkového kola stejnou technikou *„Nákladem občanů votických 1895"*.

**Jicí stroj** má pouze dvě hřídele s ozubenými koly. Hlavní kolo na hřídeli lanového bubnu otáčí prostřednictvím ozubeného převodu s velkým převodovým poměrem hřídelí, která nese velké krokové kolo s **půlenými kolíčky** — součást **Amantova kolíčkového kroku s Lepautovou úpravou**. Palety kotvy jsou osazeny na mosazné části kyvadlové tyče.

**Zvláštnost** — stroj má obdobu *remontoiru*, kde namísto malého závaží je použito **plochého pera**. Pero poskytuje po dobu jedné minuty na krokové kolo prakticky konstantní tah, **oddělený od proměnlivých odporů** v mechanickém systému hodin (od závažového pohonu po ručky ciferníků). Po uplynutí minuty se změnou polohy krokového kola uvolní pootočení lanového bubnu, závaží posune ručky o jednu minutu dopředu a současně natáhne pero remontoiru. Jako omezovač rychlosti pohybu soukolí při uvolnění slouží litinový kotouč brzděný třením o ocelovou pružinu.

**Kontrolní ciferníček** ukazuje pouze minuty. Je koncipován **opačně** — ručka je nehybná, otáčí se ciferníček. Aretační šroub slouží pro seřizování polohy ručiček na cifernících (vyšroubovat, otočit ciferníčkem do správné polohy, šroub zašroubovat do jednoho ze tří závitových otvorů).

**Bicí stroj** ovládá dva paličkové stroje, které odbíjely čtvrtě a celé hodiny pravděpodobně na dva zvony. Bicí páky osazeny na společné hřídeli, která osovým pohybem přesouvá do záběru střídavě bicí páky čtvrťového nebo hodinového bití.`,
    cifText: `**Čtyři čtvercové ciferníky** na věži, celodřevěné, potažené plechem. Cifry bílé římské, zhotovené z plechu.`,
    odbText: `Původně snad na zvony. Nyní paličkové stroje odbíjejí na **malý zvonek a jeden cimbál**.`,
    stavText: `**Votice 2000.** Hodinový stroj je uzavřen v dřevěné hodinové skříni přestavěné při opravě a přestavbě na elektrický nátah. Původní části skříně odloženy ve věži v patře s hodinovým strojem. **Bicí stroj nefunkční** pro závadu na přesouvání bicích pák do záběru kolíků; jeho natažení záměrně znemožněno (drátem zajištěná spojka).`,
  },
  {
    file: '1887-vrchotovy-janovice-krecmer.mdx',
    obec: 'Vrchotovy Janovice', okres: 'Benešov', kraj: 'Středočeský',
    budova: 'Kostel sv. Martina',
    rok: 1889, slug: '1887-vrchotovy-janovice-krecmer',
    signatura: 'V. Kretschmer Praha (na straně kyvadla); „Daroval far. p. Frant. Vojáček L.P. 1889" (na straně kontrolního ciferníčku)',
    krok: 'Denisonův krok',
    pohon: 'závaží na ocelových lanech přes volné kladky',
    pocetCifernik: 3,
    rozmery: 'rám 80 × 38 × 43 cm; kyvadlo cca 310 cm',
    docDate: '3. 12. 1999',
    skala2004: { docYear: 1999, label: 'V. Krečmer', klass: 3 },
    stav: 'in_situ', chod: 'nefunkcni',
    mainText: `Věžní hodinový stroj zhotovil **V. Kretschmer** (později signován Krečmer), výrobce věžních hodin z Prahy-Vinohrad. Krečmerovy věžní stroje vynikají původními důmyslnými konstrukčními řešeními — **stavba každého nového stroje byla pro Krečmera příležitostí k experimentu**, proto je téměř každý hodinový stroj vyšlý z jeho dílny v něčem originální. Základní konstrukce je však vždy podobná — **dvouhřídelový stroj bicí se šnekovým převodem** a rovněž **dvouhřídelový stroj jicí se zubovým převodem** s velkým převodovým poměrem.

Litinový rám je **černý, zdobený linkami malovanými bronzovým pozlátkem**. Nese nápis *„Daroval far. p. Frant. Vojáček L.P. 1889"* (na straně kontrolního ciferníčku) a *„V. Kretschmer Praha"* (na straně kyvadla).

**Jicí stroj** vybaven **Denisonovým krokem** a **Harrisonovým vyrovnávačem tahové síly**. **Popudná raménka**, která udílejí kyvadlu gravitační popudy, jsou **výrazně dekorativně zpracována**. Kyvadlová tyč dřevěná, litinová čočka kulového tvaru.

**Bicí stroj** ovládá dva paličkové stroje a odbíjí čtvrtě i celé hodiny zvlášť na dva různé zvony.`,
    cifText: `**Tři kruhové ciferníky** na věži, celodřevěné, potažené plechem. Cifry bílé římské. Současné ciferníky byly **rekonstruovány** (nový dřevěný podklad a oplechování); ručky mají původní tvar.`,
    odbText: `Na zvony.`,
    stavText: `Stav stroje ke dni **3. 12. 1999**: jicí stroj přestavěn na **elektrický nátah** (necitlivě), v současnosti nefunkční zřejmě pro závadu na mechanismu. Bicí stroj ponechán v původním stavu, závaží trvale spuštěno na dno závažové šachty. Druhý zvon je z věže odstraněn, takže odbíjení by bylo možné provádět pouze na jeden zvon. Lanový buben jicího stroje při přestavbě demontován a uložen i s natahovací klikou u stěny věže. **Hodinový stroj lze uvést do původního stavu** navrácením lanového bubnu po odstranění elektrického natahování.`,
    vlast: '**Římskokatolická farnost Vrchotovy Janovice**.',
  },
  {
    file: '1886-unhost-krecmer.mdx',
    obec: 'Unhošť', okres: 'Kladno', kraj: 'Středočeský',
    budova: 'Kostel sv. Petra a Pavla',
    rok: 1887, slug: '1886-unhost-krecmer',
    signatura: 'V. Kretschmer Praha L.P. 1887',
    krok: 'kolíčkový Lepautův',
    pohon: 'závaží (1969 přestavba na elektrický samonatahovací pohon Elektročas — řetězové rozety)',
    pocetCifernik: 1,
    rozmery: 'rám 75 × 40 × 38 cm; kyvadlo cca 175 cm',
    docDate: '19. 1. 2004',
    skala2004: { docYear: 2003, label: 'V. Kretschmer', klass: 4 },
    stav: 'in_situ', chod: 'nefunkcni',
    mainText: `Hodinový stroj **Václava Kretschmera** z Prahy-Vinohrad **má vlastní, u jiných Krečmerových strojů již podruhé nezopakovanou koncepci**. Vybaven **dvěma samostatnými bicími stroji** (čtvrťovým a hodinovým). Rychlost odbíjení regulují **větrníky se svislou osou otáčení** roztáčené šnekovým převodem do rychla. Jicí stroj má kontrolní ciferníček indikující pouze minuty.

**Tvar rámu i konstrukčních detailů** (horní část kyvadlové tyče, závěrkové kolo bicího stroje hodinového, výpustná páka bicího stroje čtvrťového) **svědčí o opuštění historizujících forem** a dokládá snahu o vytváření nového estetického názoru na ztvárnění konstrukčních prvků. Tento detail řadí stroj mezi modernější Kretschmerovy práce.`,
    cifText: `Jeden **čtvercový ciferník** o straně cca 210 cm, celoželezný. **Současný ciferník nepůvodní** — zhotovila jej spolu s elektronickým hodinovým strojem firma Elektročas s.r.o. (Pragotron).`,
    odbText: `Bronzové cimbály ⌀ cca 35 a 50 cm v lucerně věže.`,
    stavText: `Stav hodin ke dni **19. 1. 2004**: **hodinový stroj v roce 1969 přestavěn na elektrický samonatahovací pohon národním podnikem Elektročas**. Lanové bubny odstraněny, na jejich místo namontovány řetězové rozety se závažími. Původní lanové bubny se nedochovaly. Stroj osazen do nové skříně. Při přestavbě byly rovněž **vyměněny palety kotvy** za palety jiného tvaru. Větrníky pravděpodobně z doby přestavby (jednoduchý tvar nestyl s ostatním provedením stroje).

Hodinový stroj je ve **funkčním stavu**, ale **odpojen** od systému převodu točivého momentu k ciferníkům, úhlový převodový strojek demontován. Ve věži osazeny elektronické hodiny.`,
    vlast: '**Město Unhošť**.',
  },
  {
    file: '1882-trhovy-stepanov-krecmer.mdx',
    obec: 'Trhový Štěpánov', okres: 'Benešov', kraj: 'Středočeský',
    budova: 'Kostel sv. Bartoloměje',
    rok: 1882, slug: '1882-trhovy-stepanov-krecmer',
    signatura: '1882 V. Kretschmer Praha; „Nákladem občanů Štěpánova"',
    krok: 'Amantův s půlenými kolíčky (Lepautova úprava)',
    pohon: 'závaží (později elektrický pohon — řetězová kola na dřevěných lanových bubnech)',
    pocetCifernik: 3,
    rozmery: 'rám 95 × 56 × 48 cm; kyvadlo cca 350 cm (dvouvteřinové)',
    docDate: '7. 7. 2003',
    skala2004: { docYear: 2003, label: 'V. Krečmer 1882', klass: 5 },
    stav: 'in_situ', chod: 'nefunkcni',
    mainText: `Stroj datován a signován na litinovém rámu **„1882 V. Kretschmer Praha"** s nápisem *„Nákladem občanů Štěpánova"*. Vybaven systémem, který byl **Kretschmerovou specialitou** — odbíjí čtvrtě i celé hodiny **jediným bicím strojem** s **dvojitým závěrkovým kolem**, které ovládá jak zástavné rameno bicího stroje, tak přesouvání střídavě bicí páky čtvrťové nebo hodinové do dráhy bicích kolíků.

Rychlost otáčení lanového bubnu bicího stroje je omezována velkým **čtyřlopatkovým větrníkem** se svislou osou otáčení; spojení s lanovým bubnem **šnekovým převodem** (s hnaným šnekem). **Jicí stroj konstrukčně jednoduchý, dvouhřídelový.** Krokové kolo má velký počet kolíčků, kyvadlo je **dvouvteřinové**. Jicí stroj vybaven **zpružinovým vyrovnávačem tahové síly** (náhradní tah na soukolí při natahování). Kyvadlová tyč dřevěná, čočka litinová kulového tvaru.`,
    cifText: `**Tři kruhové ciferníky** ⌀ cca 140 cm. Na **černé ploše zlacené římské cifry**, zlacené ručky charakteristického tvaru pro hodiny V. Krečmera. Ciferníky byly opraveny a nově pozlaceny ve II. polovině 20. století podnikem **Umělecká řemesla**.`,
    odbText: `Na zvony.`,
    stavText: `Stav hodin ke dni **7. 7. 2003**: hodinový stroj **demontován z původního místa** i s hodinovou skříní a odložen na podlaze vedle původního stanoviště. Uloženy jsou i ostatní díly — strojek rozvodu točivého momentu a závaží (jedno **kamenné závaží** snad pochází ještě od předchozího stroje, odstraněného koncem 19. století). Stroj byl dříve přestavěn na elektrický pohon, **úprava bez poškození původního stroje a je odstranitelná**. Kyvadlová tyč přelomena, uložena i s čočkou dole u vchodu do věže. Paličkové stroje demontovány a uloženy u zvonů. Ručkami ciferníků dnes otáčí elektronické hodiny firmy Elektročas; odbíjení nefunkční.`,
  },
  {
    file: 'nedatovano-rudna-krecmer.mdx',
    obec: 'Rudná', cast: 'Dušníky', okres: 'Praha-západ', kraj: 'Středočeský',
    budova: 'Kostel sv. Jiří',
    rok: 1910, slug: 'nedatovano-rudna-krecmer',
    signatura: 'V. Krečmer, Královské Vinohrady 1910 (rok 1909 v rozích čtvercového rámování ciferníků)',
    krok: 'Amantův (Lepautův — s půlenými kolíčky)',
    pohon: 'závaží',
    pocetCifernik: 2,
    rozmery: 'rám 70 × 42 × 35 cm; kyvadlo cca 162 cm',
    docDate: '28. 12. 2002',
    skala2004: { docYear: 2002, label: 'V. Krečmer', klass: 4 },
    stav: 'in_situ', chod: 'nefunkcni',
    souradniceFix: [50.038, 14.236],
    mainText: `Věžní hodinový stroj Václava Krečmera **obdivuhodně jednoduché konstrukce**, v tomto provedení také s **elegantním tvarem litinového rámu**. V rámu je osazen dvouhřídelový jicí stroj s velkým převodovým poměrem mezi hlavním kolem a kolem krokovým, na němž je osazen **velký počet kolíčků**. Krokový mechanismus **Amantův (Lepautův — s půlenými kolíčky)**, palety kotvy osazeny na horní mosazné části kyvadlové tyče. Spodní část kyvadlové tyče dřevěná. Na spojení mosazné a dřevěné části systém pro úpravu délky kyvadla a tedy seřizování chodu.

**Bicí stroj jen jeden, hodinový** — odbíjí celé hodiny a jedním úderem také půlhodiny. Rovněž dvouhřídelový, převod z hlavního kola na hřídel s větrníkem **šnekový**.`,
    cifText: `**Dva kruhové železné ciferníky**, **zlacené plastické arabské cifry** a zlacené ručky charakteristického tvaru pro hodiny Václava Krečmera. V rozích čtvercového rámování ciferníků **letopočet 1909**.`,
    odbText: `Na malý zvon ve věži.`,
    stavText: `Stav hodin ke dni **28. 12. 2002**: hodinový stroj není dlouho udržován v provozu. Je v původním stavu, **velmi znečištěn a povrchově zkorodován**. Jedno závaží chybí, chybí klíč od zamčených zadních prosklených dvířek skříně. Skříň zpředu otevřena, dvířka odložena vedle. **Ciferníky vzácně dochovány** pravděpodobně v původním stavu včetně zlacení. Paličkový stroj u zvonu nefunkční.`,
    vlast: '**Římskokatolická farnost Rudná-Hořelice**.',
  },
  {
    file: 'nedatovano-pruhonice-krecmer.mdx',
    obec: 'Průhonice', okres: 'Praha-západ', kraj: 'Středočeský',
    budova: 'Zámek',
    rok: '?', slug: 'nedatovano-pruhonice-krecmer',
    signatura: '(zatím nezdokumentováno)',
    krok: '?',
    pohon: 'závaží',
    skala2004: { docYear: 2003, label: 'V. Krečmer', klass: 4 },
    stav: 'in_situ', chod: 'v_chodu',
    restaurator: 'Petr Skála',
    skipKrecmerDoc: true,
    mainText: `Věžní hodiny zámku **Průhonice** — dílo **[Václava Krečmera](/hodinari/vaclav-krecmer)** z Prahy-Vinohrad. Stroj byl restaurován **[Petrem Skálou](/hodinari/petr-skala)**.`,
    cifText: `Detailní popis ciferníků zatím nezpracován.`,
    odbText: `Detailní popis odbíjení zatím nezpracován.`,
    stavText: `Stroj je v provozu. Detailní restaurátorská zpráva zatím v archivu Hodinária neleží — dokumentace bude doplněna při dalším setkání s Petrem Skálou.`,
  },
];

function buildCard(e) {
  const lines = [];
  lines.push('---');
  lines.push(`slug: "${e.slug}"`);
  lines.push(`rok: ${typeof e.rok === 'number' ? e.rok : `"${e.rok}"`}`);
  lines.push(`hodinar: "vaclav-krecmer"`);
  lines.push('puvodniMisto:');
  lines.push(`  obec: "${e.obec}"`);
  if (e.cast) lines.push(`  cast: "${e.cast}"`);
  lines.push(`  budova: "${e.budova}"`);
  if (e.okres) lines.push(`  okres: "${e.okres}"`);
  if (e.kraj) lines.push(`  kraj: "${e.kraj}"`);
  lines.push('  zeme: "CZ"');
  if (e.souradniceFix) {
    lines.push(`souradnice: [${e.souradniceFix[0]}, ${e.souradniceFix[1]}]`);
    lines.push('souradnicePribl: true');
  }
  lines.push(`stav: "${e.stav}"`);
  lines.push(`chod: "${e.chod}"`);
  if (e.krok && e.krok !== '?') lines.push(`krok: "${e.krok}"`);
  if (e.pohon) lines.push(`pohon: "${e.pohon}"`);
  if (e.pocetCifernik) lines.push(`pocetCifernik: ${e.pocetCifernik}`);
  if (e.rozmery) lines.push(`rozmery: "${e.rozmery}"`);
  if (e.signatura && e.signatura !== '(zatím nezdokumentováno)') {
    lines.push(`signatura: "${e.signatura.replace(/"/g, '\\"')}"`);
  }
  if (e.restaurator) lines.push(`restaurator: "${e.restaurator}"`);
  // Prameny
  lines.push('prameny:');
  if (!e.skipKrecmerDoc) lines.push(KRECMER_PRAMEN);
  if (e.skala2004) lines.push(SKALA_2004_PRAMEN);
  // Other source data
  lines.push(`zdrojDat: "krecmer_dokumentace + skala_zprava_2004"`);
  lines.push('posledniOvereni: "2026-05-05"');
  lines.push('---');
  lines.push('');
  // Body
  lines.push('## Stroj');
  lines.push('');
  lines.push(e.mainText);
  lines.push('');
  if (e.cifText) {
    lines.push('## Ciferníky');
    lines.push('');
    lines.push(e.cifText);
    lines.push('');
  }
  if (e.odbText) {
    lines.push('## Způsob odbíjení');
    lines.push('');
    lines.push(e.odbText);
    lines.push('');
  }
  if (e.stavText) {
    lines.push('## Stav');
    lines.push('');
    lines.push(e.stavText);
    lines.push('');
  }
  if (e.vlast) {
    lines.push('## Vlastnictví');
    lines.push('');
    lines.push(e.vlast);
    lines.push('');
  }
  if (e.skala2004) {
    lines.push('## Hodnocení v Skálově zprávě 2004');
    lines.push('');
    const klassNote = e.skala2004.klassNote ? ` (s poznámkou „${e.skala2004.klassNote}" — stroj možná již není na svém místě)` : '';
    lines.push(`Stroj byl zdokumentován **[Petrem Skálou](/hodinari/petr-skala)** v roce **${e.skala2004.docYear}** (popis: „${e.skala2004.label}"). V závěrečném soupisu Skály z prosince 2004 dostal **klasifikaci ${e.skala2004.klass}**${klassNote} (rozsah 1–5, kde 1 je nejvyšší). ${classDescription(e.skala2004.klass)}`);
    lines.push('');
  }
  lines.push('* * *');
  lines.push('');
  if (e.skipKrecmerDoc) {
    lines.push('*Karta vychází ze Skálovy závěrečné zprávy soupisu středočeského regionu (2004). Detailní restaurátorská dokumentace zatím v archivu Hodinária není zpracována.*');
  } else {
    lines.push(`*Karta vychází z Krečmerovy soupisové dokumentace (Petr Skála, atelier veznihodiny.cz, dokumentováno **${e.docDate}**) a ze Skálovy závěrečné zprávy soupisu středočeského regionu (Sadská, prosinec 2004).*`);
  }
  return lines.join('\n');
}

let updated = 0;
for (const e of ENTRIES) {
  const fp = path.join(DIR, e.file);
  if (!fs.existsSync(fp)) {
    console.warn(`MISSING: ${e.file}`);
    continue;
  }
  fs.writeFileSync(fp, buildCard(e), 'utf8');
  console.log(`UPDATED: ${e.file} (rok ${e.rok}${e.skala2004 ? `, klas. ${e.skala2004.klass}` : ''})`);
  updated++;
}
console.log(`\nTotal: ${updated} cards updated.`);
