/**
 * Rejstřík hodinářů a hodinářských firem zmíněných napříč články.
 *
 * Tohle je první verze — stuby pro budoucí životopisné články.
 * Doplňuj postupně podle dohledávání v archivech / publikacích.
 *
 * Konvence:
 *   - typ: 'osoba' = jednotlivý hodinář; 'firma' = firma / atelier / značka
 *   - aliasy: varianty pro fulltextové hledání ve článcích
 *   - relatedSlugs: slugy článků, kde je hodinář zmíněn nebo jím vyrobený stroj
 *   - obdobi: životní data nebo doba aktivity ("1869–1955" / "akt. ~1880–1920")
 *   - shrnuti: 1–3 věty pro stub stránku
 */
export interface Hodinar {
  slug: string;
  jmeno: string;
  aliasy: string[];
  typ: 'osoba' | 'firma';
  obdobi: string | null;
  mesto: string | null;
  zeme: string;
  shrnuti: string;
  relatedSlugs: string[];
  /** Kategorie pro řazení v indexu */
  era: 'baroko' | '19stol' | 'prelom' | '20stol' | 'soucasnost';
}

export const hodinari: Hodinar[] = [
  // === Osobnosti ===
  {
    slug: 'jan-prokes',
    jmeno: 'Jan Prokeš',
    aliasy: ['Prokeš', 'Prokes', 'Jan Prokeš'],
    typ: 'osoba',
    obdobi: 'akt. 1860–1900',
    mesto: 'Sobotka',
    zeme: 'CZ',
    shrnuti:
      'Sobotský hodinářský mistr 19. století. Tvůrce velkého věžního strojového kompletu z roku 1868 ze zámku Býchory s unikátním zvonícím strojem. V roce 1865 dodal modelové návrhy pro Pražský orloj.',
    relatedSlugs: [
      'bychory_cimbaly',
      'bychory_restaurovani_napis',
      'bychory_prokes1',
      'bychory_zvonici_stroj',
      'bychory_dalsi_kola',
      'decin_bici_stroje',
      'decin_koncepce',
      'ohlednuti2011',
      'sezona2013',
      'vez_provoz2011',
      'svarcvaldky_surrerwerk',
    ],
    era: '19stol',
  },
  {
    slug: 'ludvik-hainz',
    jmeno: 'Ludvík Hainz',
    aliasy: ['Hainz', 'Heinz', 'L. Hainz', 'L.Hainz', 'Ludwig Hainz', 'LOUIS HAINZ'],
    typ: 'osoba',
    obdobi: '1843–1909',
    mesto: 'Praha',
    zeme: 'CZ',
    shrnuti:
      'Zakladatel pražské hodinářské firmy L. Hainz (1840), z níž vzešla pozdější výrobní linie Jednotný čas a Elektročas. Mimo věžních hodinových strojů se firma zasloužila o bezklíčový natahovací mechanizmus a o distribuci a údržbu městských hodin.',
    relatedSlugs: [
      'hainz_natahovani',
      'tabor',
      'vez1',
      'jednotnycas',
      'vez_elektrocas1959',
      'vez_Budislav',
      'zidovske',
      'akvizice-2015-2025',
      'decin_jednotny_cas',
    ],
    era: 'prelom',
  },
  {
    slug: 'richard-liebing',
    jmeno: 'Richard Liebing',
    aliasy: ['Liebing', 'R. Liebing', 'Richard Liebing'],
    typ: 'osoba',
    obdobi: 'akt. 1890–1930',
    mesto: 'Vídeň',
    zeme: 'AT',
    shrnuti:
      'Vídeňský hodinář působící v XIII. okresu (Speising). Jeho stroje se vyznačují úsporným převodem na brzdící větrníky — bicí stroj má jen jedno kolo zabírající do šneku větrníku.',
    relatedSlugs: ['akvizice-2015-2025', 'janovice'],
    era: 'prelom',
  },
  {
    slug: 'frantisek-x-beitel',
    jmeno: 'František X. Beitel',
    aliasy: ['Beitel', 'F. X. Beitel', 'F.X. Beitel', 'František Beitel'],
    typ: 'osoba',
    obdobi: 'akt. 1920–1945',
    mesto: 'Moravský Beroun',
    zeme: 'CZ',
    shrnuti:
      'Moravský výrobce věžních hodin z meziválečného období. Mezi nejstaršími na Moravě, kdo doplňoval své stroje elektrickým nátahem. Jeho hodiny najdeme v kostelech v Brně, Bruntálu i na Slovensku.',
    relatedSlugs: ['akvizice-2015-2025'],
    era: '20stol',
  },
  {
    slug: 'vaclav-krecmer',
    jmeno: 'Václav Krečmer',
    aliasy: ['Krečmer', 'Krecmer', 'V. Krečmer', 'Václav Krečmer'],
    typ: 'osoba',
    obdobi: 'akt. 1890–1920',
    mesto: 'Královské Vinohrady (Praha)',
    zeme: 'CZ',
    shrnuti:
      'Vinohradský hodinář přelomu 19. a 20. století. Stroje se vyznačují pečlivým provedením, typickým způsobem zavěšení kyvadla s paletami Amantova kroku.',
    relatedSlugs: ['akvizice-2015-2025'],
    era: 'prelom',
  },
  {
    slug: 'josef-achrer',
    jmeno: 'Josef Achrer',
    aliasy: ['Achrer', 'J. Achrer', 'Josef Achrer'],
    typ: 'osoba',
    obdobi: '1927–1988',
    mesto: 'Praha',
    zeme: 'CZ',
    shrnuti:
      'Pražský hodinář a řezbář. V roce 1985 vyrobil pozoruhodné hodiny s vícenásobným ciferníkem pro restauraci Českých drah v Holešovicích.',
    relatedSlugs: ['decin_aktual0', 'decin_galerie', 'decin_koncepce'],
    era: '20stol',
  },
  {
    slug: 'wenzel-mellner',
    jmeno: 'Wenzel Mellner',
    aliasy: ['Mellner', 'W. Mellner', 'Wenzel Mellner', 'Václav Mellner'],
    typ: 'osoba',
    obdobi: 'akt. 18. století',
    mesto: null,
    zeme: 'CZ',
    shrnuti:
      'Hodinář působící v barokní době, jehož signaturu nesou některé restaurátorské zásahy na starších věžních strojích. Spíše reparátor než původní konstruktér.',
    relatedSlugs: ['decin_Wenzel_Mellner', 'decin_fotobrezen2017', 'mapa'],
    era: 'baroko',
  },
  {
    slug: 'sebastian-landesberger',
    jmeno: 'Sebastian Landesberger',
    aliasy: [
      'Landesberger',
      'Sebastian Landesberger',
      'Sebastian Landesperger',
      'Sebastian Londensperger',
      'Sebastian Londensberger',
      'Sebastian Londesperger',
      'Johannes Sebastian Landesberger',
      'Sebastian Landsperger',
    ],
    typ: 'osoba',
    obdobi: '1698–1776',
    mesto: 'Praha',
    zeme: 'CZ',
    shrnuti:
      'Pražský hodinář s titulem Königlicher Hofuhrmacher (Královský dvorní hodinář), narozený 1698 v Řezně. Správce svatovítského hodinového stroje (1733–1776), první v Čechách použil Clémentův kotvový krok. Jeho věžní stroj na pražské Židovské radnici (1764) je dodnes v provozu.',
    relatedSlugs: ['akvizice-2015-2025', 'zidovske'],
    era: 'baroko',
  },
  {
    slug: 'ferdinand-landesberger',
    jmeno: 'Ferdinand Elias Landesberger',
    aliasy: [
      'Ferdinand Landesberger',
      'Ferdinand Elias Landesberger',
      'Ferdinand Landesperger',
      'Ferdinand Londensberger',
      'F. Landesberger',
    ],
    typ: 'osoba',
    obdobi: '1745–1811',
    mesto: 'Praha',
    zeme: 'CZ',
    shrnuti:
      'Syn [Sebastiana Landesbergera](/hodinari/sebastian-landesberger), pražský hodinář druhé poloviny 18. století. Autor desítek věžních hodin (Žatec 1768, Pražská staroměstská radnice 1787, Dobříš 1791) a — především — skutečný opravář pražského orloje 1787–1791, jehož role byla v dosavadní historiografii dlouho mylně připisována jiným osobám.',
    relatedSlugs: [],
    era: 'baroko',
  },
  {
    slug: 'friedrich-moritz-bassler',
    jmeno: 'Friedrich Moritz Bassler',
    aliasy: ['Bassler', 'F. M. Bassler', 'Friedrich Moritz Bassler'],
    typ: 'osoba',
    obdobi: '1835–~1920',
    mesto: 'Bad Düben (Sasko)',
    zeme: 'DE',
    shrnuti:
      'Saský zámečník a výrobce věžních hodin. Vyrobil pouze přibližně 17 strojů, což z dochovaných exemplářů činí poměrně vzácné objekty.',
    relatedSlugs: ['akvizice-2015-2025'],
    era: '19stol',
  },
  {
    slug: 'paul-zieux',
    jmeno: 'Paul Zieux',
    aliasy: ['Zieux', 'P. Zieux', 'Paul Zieux'],
    typ: 'osoba',
    obdobi: 'akt. ~1750–1850',
    mesto: null,
    zeme: 'FR',
    shrnuti:
      'Francouzský hodinář, autor věžního stroje s charakteristickým „flatbed" rámem (cca 1770). Jeho dílo dokládá francouzskou tradici hodinářství v pozdně barokní formě.',
    relatedSlugs: ['decin_flatbed', 'decin_fotobrezen2017'],
    era: 'baroko',
  },
  {
    slug: 'peter-fridrich',
    jmeno: 'Peter Fridrich',
    aliasy: ['Peter Fridrich', 'P. Fridrich'],
    typ: 'osoba',
    obdobi: '*~1950',
    mesto: 'Hodruša-Hámre',
    zeme: 'SK',
    shrnuti:
      'Současný slovenský hodinář a řezbář. V roce 2015 vyrobil repliku dřevěných věžních hodin — kola, hřídele i části kroku jsou ze dřeva, ozubení tvoří ocelové věnce.',
    relatedSlugs: ['akvizice-2015-2025'],
    era: 'soucasnost',
  },
  {
    slug: 'hodinarska-rodina-manesova',
    jmeno: 'Mánesovi (rod)',
    aliasy: ['Mánes', 'Manes'],
    typ: 'osoba',
    obdobi: '19. století',
    mesto: 'Praha',
    zeme: 'CZ',
    shrnuti:
      'Hodinářský rod, jehož členové signovali stroje a fasádní hodiny v 19. století — mj. v Kardašově Řečici. Rod je nutno odlišit od slavnější malířské rodiny Mánesů.',
    relatedSlugs: ['decin_galerie', 'kardasova_recice'],
    era: '19stol',
  },

  // === Firmy / atelliéry ===
  {
    slug: 'l-hainz',
    jmeno: 'L. Hainz (firma)',
    aliasy: ['L. Hainz', 'Hainz Praha', 'Hainz a syn'],
    typ: 'firma',
    obdobi: '1840–1949',
    mesto: 'Praha',
    zeme: 'CZ',
    shrnuti:
      'Pražská hodinářská firma založená Ludvíkem Hainzem. V průběhu téměř století dodávala věžní hodiny do celého Rakouska-Uherska a později ČSR. V roce 1949 byla po znárodnění začleněna do podniku Jednotný čas.',
    relatedSlugs: [
      'hainz_natahovani',
      'tabor',
      'vez1',
      'jednotnycas',
      'vez_elektrocas1959',
      'decin_jednotny_cas',
    ],
    era: 'prelom',
  },
  {
    slug: 'jednotny-cas',
    jmeno: 'Jednotný čas',
    aliasy: ['Jednotný čas', 'Jednotny cas'],
    typ: 'firma',
    obdobi: '1923–1949',
    mesto: 'Praha',
    zeme: 'CZ',
    shrnuti:
      'Pražská firma zabývající se prodejem, pronájmem a instalací elektrických hodinových sítí. Po roce 1949 byla rozšířena o zestátněnou výrobu L. Hainz a stala se předchůdcem podniku Elektročas.',
    relatedSlugs: ['jednotnycas', 'decin_jednotny_cas'],
    era: '20stol',
  },
  {
    slug: 'elektrocas',
    jmeno: 'Elektročas',
    aliasy: ['Elektročas', 'Elektrocas'],
    typ: 'firma',
    obdobi: '1949–1990',
    mesto: 'Praha',
    zeme: 'CZ',
    shrnuti:
      'Národní podnik Elektročas vznikl spojením firmy Jednotný čas se znárodněnou hodinářskou firmou L. Hainz. Vyráběl věžní hodinové stroje, zejména modely 1959 a 1969, a zajišťoval centrální časové sítě v ČSSR.',
    relatedSlugs: [
      'jednotnycas',
      'vez_elektrocas1959',
      'vez1',
      'tabor',
      'vez_Budislav',
    ],
    era: '20stol',
  },
  {
    slug: 'pragotron',
    jmeno: 'Pragotron',
    aliasy: ['Pragotron'],
    typ: 'firma',
    obdobi: '1953–1990',
    mesto: 'Praha',
    zeme: 'CZ',
    shrnuti:
      'Národní podnik Pragotron vyráběl docházkové (píchací) hodiny, kontrolní hodiny a později také digitální časové displeje. Spolu s Elektročasem reprezentoval československou poválečnou hodinářskou výrobu.',
    relatedSlugs: ['pichacky', 'kontrolni_zlin', 'kontrolni_jicin'],
    era: '20stol',
  },
  {
    slug: 'thondel',
    jmeno: 'Thöndel',
    aliasy: ['Thöndel', 'Thondel', 'Thöndel Rud.'],
    typ: 'firma',
    obdobi: 'akt. 1880–1950',
    mesto: 'Mährisch Neustadt (Uničov)',
    zeme: 'CZ',
    shrnuti:
      'Tradiční výrobce věžních hodin z Uničova (něm. Mährisch Neustadt). V Hodináriu Děčín je torzo hořelo padlého stroje, doplněné o stejný typ ze sbírek Vlastivědného muzea v Olomouci.',
    relatedSlugs: ['akvizice-2015-2025'],
    era: 'prelom',
  },
  {
    slug: 'kohlert',
    jmeno: 'Kohlert',
    aliasy: ['Kohlert'],
    typ: 'firma',
    obdobi: 'akt. 1900–1950',
    mesto: 'Kraslice',
    zeme: 'CZ',
    shrnuti:
      'Hodinářská firma z Kraslic, jejíž věžní hodinový stroj byl 29. 8. 2016 zapůjčen do Hodinária v Děčíně.',
    relatedSlugs: ['akvizice-2015-2025'],
    era: 'prelom',
  },
  {
    slug: 'junghans',
    jmeno: 'Junghans',
    aliasy: ['Junghans'],
    typ: 'firma',
    obdobi: '1861–dosud',
    mesto: 'Schramberg',
    zeme: 'DE',
    shrnuti:
      'Slavná německá hodinářská firma ze Schwarzwaldu. V meziválečné době byla dočasně největším výrobcem hodin na světě. Její elektrické a synchronizační systémy se objevovaly i v Československu.',
    relatedSlugs: [
      'ATO',
      'elektricke1',
      'lenzkirch',
      'pneumatika',
      'synchronizace_hodin',
    ],
    era: '20stol',
  },
  {
    slug: 'solari-udine',
    jmeno: 'Solari (Udine)',
    aliasy: ['Solari', 'Solari Udine'],
    typ: 'firma',
    obdobi: '1725–dosud',
    mesto: 'Pesariis / Udine',
    zeme: 'IT',
    shrnuti:
      'Italský výrobce věžních a nástěnných hodin, později proslulý klapacími „split-flap" displeji na nádražích a letištích. Sbírka Hodinária obsahuje několik příkladů jejich starších věžních strojů.',
    relatedSlugs: [],
    era: '20stol',
  },
  {
    slug: 'datumatic',
    jmeno: 'Datumatic',
    aliasy: ['Datumatic'],
    typ: 'firma',
    obdobi: '1930–1952',
    mesto: 'Praha',
    zeme: 'CZ',
    shrnuti:
      'Pražská firma zakladatelů Ing. Jiskry a Františka Kocmánka, vyráběla kalendářní hodiny s automatickým postupem data — řešení nadčasové i v dnešním kontextu.',
    relatedSlugs: [],
    era: '20stol',
  },

  // === Doplnění (2026-05) podle článků a Knespla 2024/2025 ===
  {
    slug: 'petr-skala',
    jmeno: 'Petr Skála',
    aliasy: ['Petr Skála', 'P. Skála', 'ak. soch. Petr Skála', 'Skálov'],
    typ: 'osoba',
    obdobi: '*1948',
    mesto: 'Praha',
    zeme: 'CZ',
    shrnuti:
      'Akademický sochař, restaurátor věžních hodin a dlouholetý orlojník Pražského orloje. Spolu s manželkou Melanií provozuje Atelier restaurování věžních hodin (veznihodiny.cz), který má za sebou desítky restaurátorských zásahů včetně stroje na pražské Židovské radnici (1995) a řady barokních strojů z Hodinária Děčín.',
    relatedSlugs: ['bychory_prokes1', 'zidovske', 'orloj-eu'],
    era: 'soucasnost',
  },
  {
    slug: 'michael-christ',
    jmeno: 'Michael Christ',
    aliasy: ['Michael Christ', 'M. Christ'],
    typ: 'osoba',
    obdobi: 'akt. první čtvrtina 19. století',
    mesto: 'Šluknov',
    zeme: 'CZ',
    shrnuti:
      'Severočeský hodinář působící v první čtvrtině 19. století ve Šluknově. Podle stylu rámu a ozdobných motivů je mu připisován věžní stroj z kostela sv. Petra a Pavla v Horním Prysku, dnes v expozici Hodinária Děčín ([inv. 6](/sbirka/karta/inv-6-vezni-michael-christ/)).',
    relatedSlugs: [],
    era: '19stol',
  },
  {
    slug: 'josef-bozek',
    jmeno: 'Josef Božek',
    aliasy: ['Josef Božek', 'J. Božek', 'Bozek'],
    typ: 'osoba',
    obdobi: '1782–1835',
    mesto: 'Praha',
    zeme: 'CZ',
    shrnuti:
      'Mechanik pražského Polytechnického ústavu pod vedením F. J. Gerstnera. Vyrobil přes 40 různých modelů hodinových kroků a několik vlastních nových konstrukcí. V roce 1810 vedl průkopnický evropský pokus o sériovou výrobu litinových věžních hodin v komárovských železárnách. Otec Romualda Božka.',
    relatedSlugs: [],
    era: '19stol',
  },
  {
    slug: 'romuald-bozek',
    jmeno: 'Romuald Božek',
    aliasy: ['Romuald Božek', 'R. Božek'],
    typ: 'osoba',
    obdobi: '1814–1899',
    mesto: 'Praha',
    zeme: 'CZ',
    shrnuti:
      'Český vynálezce a konstruktér, mladší syn Josefa Božka. Studoval pražskou polytechniku. Vodárenský odborník a divadelní mechanik. V hodinářství se věnoval spíše teorii než praxi — je mu připisován návrh externího chronometru Pražského orloje s Denisonovým gravitačním krokem (oprava 1865–1866). Autor rukopisných spisů „Über Uhren und Uhrmeister" a „Die neue Stadtuhr" (NTM Praha).',
    relatedSlugs: [],
    era: '19stol',
  },
  {
    slug: 'frantisek-summerecker',
    jmeno: 'František Summerecker',
    aliasy: ['Summerecker', 'Sumerecker', 'Franz Sumerecker', 'František Summerrecker'],
    typ: 'osoba',
    obdobi: '1802–1891',
    mesto: 'Praha',
    zeme: 'CZ',
    shrnuti:
      'Pražský hodinář, do roku 1859 vyrobil přes 100 věžních hodin. Bydlel a pracoval na Malé Straně poblíž Chotkova paláce. Mezi jeho díla patří hodiny na věži Staroměstské vodárny (1858), na kostele sv. Mikuláše v Horní Brusnici, na Klárově ústavu pro slepé nebo na kostele sv. Petra a Pavla v Březně u Chomutova. Vstoupil do známého „duelu v tisku" (1857) s Romualdem Božkem o kvalitě jeho návrhů. Jeho dílnu později převzala firma Dvořák a Pštross.',
    relatedSlugs: [],
    era: '19stol',
  },
  {
    slug: 'jan-holub',
    jmeno: 'Jan Holub',
    aliasy: ['Jan Holub', 'J. Holub'],
    typ: 'osoba',
    obdobi: 'akt. 1865–1880',
    mesto: 'Praha → Vídeň',
    zeme: 'CZ',
    shrnuti:
      'Mechanik a hodinář, do Prahy přišel z Liberce v roce 1865 jako uznávaný odborník při opravě Pražského orloje. Spolu s Čeňkem Daňkem provedl opravu orloje (1865–1866) včetně konstrukce nového externího chronometru s Denisonovým gravitačním krokem. Plánovali sériovou výrobu věžních hodin, ale jediným výstupem byl stroj pro kostel sv. Cyrila a Metoděje v Karlíně (1866). Po prusko-rakouské válce odešel s bratrem Eduardem do Vídně, kde se věnovali výrobě šicích strojů.',
    relatedSlugs: [],
    era: '19stol',
  },
  {
    slug: 'cenek-danek',
    jmeno: 'Čeněk Daněk',
    aliasy: ['Čeněk Daněk', 'Č. Daněk', 'Cenek Danek', 'Vincenc Daněk'],
    typ: 'osoba',
    obdobi: '1818–1893',
    mesto: 'Praha (Karlín)',
    zeme: 'CZ',
    shrnuti:
      'Český strojírenský průmyslník, zakladatel pražské strojní továrny v Karlíně. Spolu s Janem Holubem provedl 1865–1866 mechanickou opravu Pražského orloje. Stroj pro kostel sv. Cyrila a Metoděje v Karlíně (1866) je dnes (2024) stále v půdě kostela jako rozebraný, ale pravděpodobně kompletní celek.',
    relatedSlugs: [],
    era: '19stol',
  },
  {
    slug: 'josef-kosek',
    jmeno: 'Josef Kosek',
    aliasy: ['Josef Kosek', 'Josef Kossek', 'J. Kosek'],
    typ: 'osoba',
    obdobi: '1780–1858',
    mesto: 'Praha',
    zeme: 'CZ',
    shrnuti:
      'Český hodinář, žák Josefa Božka. Od roku 1825 hodinář Astronomické observatoře v Klementinu. Vyrobil přesné kyvadlové hodiny pro astronomická pozorování — první v českých zemích, kdo použil drahokamová ložiska a bimetalové kompenzační kyvadlo. Od roku 1814 měl díky přímluvě hraběte Františka Libšteinského z Kolovrat povolení pracovat jako samostatný hodinář mimo cech.',
    relatedSlugs: [],
    era: '19stol',
  },
  {
    slug: 'frantisek-spatny',
    jmeno: 'František Špatný',
    aliasy: ['František Špatný', 'F. Špatný', 'F. Spatny'],
    typ: 'osoba',
    obdobi: '1814–1883',
    mesto: 'Praha',
    zeme: 'CZ',
    shrnuti:
      'Český lexikograf a spisovatel, autor specializovaných slovníků a textů z oblasti lesnictví, myslivosti, zemědělství a řemesel. Ve spolupráci s [Václavem Krečmerem](/hodinari/vaclav-krecmer) vydal v roce 1882 první německo-český hodinářský slovník (Společenstvo hodinářské, Praha).',
    relatedSlugs: [],
    era: '19stol',
  },
  {
    slug: 'mannhardt',
    jmeno: 'Mannhardt (firma)',
    aliasy: ['Mannhardt', 'Mannhardt München'],
    typ: 'firma',
    obdobi: '1841–dosud',
    mesto: 'Mnichov',
    zeme: 'DE',
    shrnuti:
      'Mnichovská hodinářská firma založená Johannem Mannhardtem (1798–1878). Specializovala se na věžní hodiny vysoké přesnosti — mj. zhotovila hodiny na Bavorské státní opeře a na pinakotekách. Ve sbírce Hodinária Děčín je z roku 1864 jeden z mannhardtovských strojů s **Winnerlovým krokem** ([inv. 35](/sbirka/karta/inv-35-vezni-mikulasovice/)) z kostela sv. Mikuláše v Mikulášovicích.',
    relatedSlugs: [],
    era: '19stol',
  },
  {
    slug: 'johann-lissner',
    jmeno: 'Johann Lissner',
    aliasy: ['Johann Lissner', 'Joh. Lissner', 'Lissner'],
    typ: 'osoba',
    obdobi: 'akt. 2. polovina 19. století',
    mesto: 'Mikulášovice (Nixdorf)',
    zeme: 'CZ',
    shrnuti:
      'Hodinář působící ve druhé polovině 19. století v Mikulášovicích (něm. Nixdorf) na Šluknovsku. Pravděpodobný autor věžních hodin pro mikulášovickou školu (1881) a pro Severní (Hilgersdorf) v okrese Děčín. Jeho stroje se vyznačují masivní konstrukcí s Grahamovým krokem, dřevěnou kyvadlovou tyčí a litinovou čočkou.',
    relatedSlugs: [],
    era: '19stol',
  },
  {
    slug: 'joseph-winnerl',
    jmeno: 'Joseph Thaddeus Winnerl',
    aliasy: ['Winnerl', 'Joseph Winnerl', 'J. Winnerl'],
    typ: 'osoba',
    obdobi: '1799–1886',
    mesto: 'Mureck → Paříž',
    zeme: 'AT',
    shrnuti:
      'Vynikající hodinář rakouského původu (Mureck v Štýrsku), od roku 1832 v Paříži. Autor věhlasných námořních chronometrů a vynálezce raritního „Winnerlova kroku" (1836), používaného při stavbě přesných astronomických hodin. Tento krok je k vidění na Mannhardtově věžním stroji z roku 1864 ve sbírce Hodinária Děčín ([inv. 35](/sbirka/karta/inv-35-vezni-mikulasovice/)).',
    relatedSlugs: [],
    era: '19stol',
  },
];

export const hodinariBySlug = new Map(hodinari.map((h) => [h.slug, h]));

/** Vrátí seznam hodinářů zmíněných v daném článku (přes relatedSlugs). */
export function hodinariProClanek(clanekSlug: string): Hodinar[] {
  return hodinari.filter((h) => h.relatedSlugs.includes(clanekSlug));
}

export const eraLabel: Record<Hodinar['era'], string> = {
  baroko: 'Baroko (do 1800)',
  '19stol': '19. století',
  prelom: 'Přelom 19./20. století',
  '20stol': '20. století',
  soucasnost: 'Současnost',
};
