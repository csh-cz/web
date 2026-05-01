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
    slug: 'sebastian-londensperger',
    jmeno: 'Sebastian Londensperger',
    aliasy: ['Londensperger', 'S. Londensperger', 'Sebastian Londensperger'],
    typ: 'osoba',
    obdobi: '1732–1776',
    mesto: 'Praha',
    zeme: 'CZ',
    shrnuti:
      'Pražský hodinář s titulem Königlicher Hofuhrmacher (Královský dvorní hodinář). Jeho věžní stroj z roku 1764 patří mezi cenné doklady české hodinářské produkce barokní doby.',
    relatedSlugs: ['akvizice-2015-2025', 'zidovske'],
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
