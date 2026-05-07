/**
 * Rejstřík hodinových kroků (escapements) zmíněných napříč články.
 *
 * Krok je mechanismus, který přerušuje pohyb soukolí v pravidelných intervalech
 * a předává energii oscilátoru (kyvadlo, balanc). Definuje přesnost hodin.
 *
 * Toto jsou stuby pro budoucí podrobné technické články.
 */
export interface Krok {
  slug: string;
  jmeno: string;
  aliasy: string[];
  vynalezce: string | null;
  rok: string | null;
  shrnuti: string;
  charakteristika: string;
  relatedSlugs: string[];
  /** Skupina pro řazení v indexu */
  skupina: 'rane' | 'klasicke' | 'presne' | 'volne' | 'elektricke' | 'elektronicke';
}

export const kroky: Krok[] = [
  {
    slug: 'vretenovy-krok',
    jmeno: 'Vřetenový krok',
    aliasy: ['vřetenový krok', 'vřetenového kroku', 'vřetenem', 'vřeteno', 'verge'],
    vynalezce: 'středověk (anonymně)',
    rok: '~13. století',
    shrnuti:
      'Nejstarší dochovaný hodinový krok. Svislé vřeteno s dvěma protilehlými paletami zabírá do korunového kola. Bylo používáno od 13. do počátku 19. století — zejména u věžních hodin a později u kapesních cibulí.',
    charakteristika:
      'Velký rejdový moment, hluboký rejd, výrazná závislost chodu na pohonné síle. Pro přesné hodiny nevhodný, ale mechanicky robustní a snadno udržovatelný.',
    relatedSlugs: [
      'budiky1',
      'o-hodinariu',
      'akvizice-2015-2025',
      'kardasova_recice',
      'ohlednuti2011',
      'muzea_cr',
      'pilovky',
      'sezona2013',
      'svarcvaldky_17stol',
      'svarcvaldky_18stol',
      'vez_Kli',
      'vez1',
      'vez_Budislav',
      'vezni_muzejicko_evropa',
    ],
    skupina: 'rane',
  },
  {
    slug: 'kotvovy-krok',
    jmeno: 'Kotvový krok',
    aliasy: ['kotvový krok', 'kotvového kroku', 'kotva', 'kotvou', 'recoil', 'anchor'],
    vynalezce: 'Robert Hooke / William Clement',
    rok: '~1670',
    shrnuti:
      'Kyvadlový krok s kotvou, která zabírá do horizontálního krokového kola. Funkčně podstatně přesnější než vřetenový krok a umožnil přechod na dlouhá kyvadla. Pojmenován podle tvaru kotvy podobné lodní.',
    charakteristika:
      'Při klidu kotvy dochází k mírnému zpětnému pohybu krokového kola — odtud anglický název "recoil". Pro běžné věžní stroje 18.–20. století zcela dominantní řešení.',
    relatedSlugs: [
      'akvizice-2015-2025',
      'o-hodinariu',
      'hinspirace',
      'sobeslav3',
      'sobeslav2c',
      'vez_Prysk',
      'vez1',
    ],
    skupina: 'klasicke',
  },
  {
    slug: 'grahamuv-krok',
    jmeno: 'Grahamův krok',
    aliasy: ['Grahamův', 'Grahamova', 'Graham', 'deadbeat'],
    vynalezce: 'George Graham',
    rok: '1715',
    shrnuti:
      'Vylepšený kotvový krok bez zpětného pohybu krokového kola — odtud anglický název "deadbeat" (mrtvý úder). Ramena kotvy mají speciálně tvarované klidové plochy soustředné s osou rotace, takže během klidu kyvadla se kolo nepohybuje.',
    charakteristika:
      'Vyšší přesnost než klasický kotvový krok. Standardní řešení pro pendlovky a regulátory 18.–19. století, dnes typické pro kvalitní věžní stroje.',
    relatedSlugs: ['akvizice-2015-2025', 'vez_decin'],
    skupina: 'presne',
  },
  {
    slug: 'amantuv-krok',
    jmeno: 'Amantův krok',
    aliasy: ['Amantův', 'Amantova', 'Amantovým', 'Amant'],
    vynalezce: 'Pierre Amant',
    rok: '~1741',
    shrnuti:
      'Francouzský volný kotvový krok s palácovými výřezy v krokovém kole. Klidové plochy jsou tvořeny přímo zuby krokového kola, palety jsou jen úzké pruhy. Charakteristický pro francouzskou školu věžního hodinářství.',
    charakteristika:
      'Nižší tření než Graham díky menšímu kontaktu mezi paletou a kolem. Časté u pražských a francouzských věžních strojů, mj. u stroje Václava Krečmera.',
    relatedSlugs: ['akvizice-2015-2025', 'decin_flatbed'],
    skupina: 'presne',
  },
  {
    slug: 'hippuv-prerusovac',
    jmeno: 'Hippův přerušovač',
    aliasy: ['Hipp', 'Hippův', 'Hippova', 'Hipp-Toggle'],
    vynalezce: 'Matthäus Hipp',
    rok: '1843',
    shrnuti:
      'Elektromechanický oscilátor využívaný v master-clock systémech. Kyvadlo má vlastní pohon přes elektromagnet, který se sepne pouze když amplituda kyvu klesne pod práh — odtud anglické "toggle". Princip umožňoval staveb extrémně přesných centrálních hodin.',
    charakteristika:
      'Energie do oscilátoru jen když je třeba, mezi tím kyvadlo kmitá volně. Doménou systémů Pulsynetic, Bürk a dalších elektrických hodinových sítí.',
    relatedSlugs: ['elektricke2', 'pulsynetic'],
    skupina: 'elektricke',
  },
  {
    slug: 'retrogradni-zobrazovani',
    jmeno: 'Retrográdní zobrazování',
    aliasy: ['retrográdní', 'retrográd', 'retrograde'],
    vynalezce: '— (zobrazovací technika)',
    rok: '17.–18. století',
    shrnuti:
      'Není to krok v užším slova smyslu, ale charakteristický mechanizmus zobrazení času — ručička přejíždí oblouk, na konci se vrací na začátek. V kombinaci s elektronickým ovládáním (Chronulator) umožňuje zajímavé zobrazení času.',
    charakteristika:
      'Vyžaduje rychlý vratný pohyb, často řešený pružinou nebo magneticky. V mechanických hodinách je realizován přes pero spojené s vačkou.',
    relatedSlugs: ['decin_chronulator'],
    skupina: 'volne',
  },
  {
    slug: 'elektronicky-krok',
    jmeno: 'Elektronický krok',
    aliasy: ['elektronický krok', 'elektronický', 'quartz krok', 'krystalový krok', 'piezoelektrický oscilátor'],
    vynalezce: 'více vývojových linií',
    rok: '~1960–1970',
    shrnuti:
      'Bezkontaktní krok řízený polovodičovou elektronikou. Oscilátor je typicky piezoelektrický krystal (quartz) na frekvenci 32 768 Hz, jejíž signál se děliči dělí na sekundový impuls. Ten ovládá krokový motorek (stepper) nebo Lavet motor pohánějící ručky. U hodin tohoto typu zaniká klasický mechanický krok — funkci přerušování energie přebírá tranzistor.',
    charakteristika:
      'Mnohem vyšší přesnost než mechanika (typicky ±15 s/měsíc bez kompenzace). Žádné tření paletek, žádný dohled na vyzbrojení. Doména náramkových quartz hodinek 1970+ a věžních strojů Pragotron / Hipp-Favarger 1960+. Bez mikroprocesoru, jen analogová / TTL elektronika.',
    relatedSlugs: [],
    skupina: 'elektronicke',
  },
  {
    slug: 'elektronicky-mikroprocesorovy-krok',
    jmeno: 'Elektronický krok s mikroprocesorem',
    aliasy: ['mikroprocesorový krok', 'elektronický s mikroprocesorem', 'MCU krok', 'řízený mikroprocesorem'],
    vynalezce: 'více vývojových linií',
    rok: '~1985–dosud',
    shrnuti:
      'Rozšíření elektronického kroku o mikroprocesor (MCU), který přebírá řízení motorku a může synchronizovat čas s externím etalonem (DCF77 dlouhovlnný signál, GPS, NTP přes síť). Umožňuje automatickou korekci letního/zimního času, kompenzaci teploty, samočinnou diagnostiku a remote management.',
    charakteristika:
      'Přesnost řádově ±1 s/rok díky externí synchronizaci. Mobatime, Bodet, Bürk Mobatime moderní řady. U sítí veřejných hodin nezbytné — bez MCU by každý ciferník vyžadoval ruční nastavení po výpadku napájení.',
    relatedSlugs: [],
    skupina: 'elektronicke',
  },
];

export const krokyBySlug = new Map(kroky.map((k) => [k.slug, k]));

/** Vrátí seznam kroků zmíněných v daném článku. */
export function krokyProClanek(clanekSlug: string): Krok[] {
  return kroky.filter((k) => k.relatedSlugs.includes(clanekSlug));
}

export const skupinaLabel: Record<Krok['skupina'], string> = {
  rane: 'Rané kroky (do 17. století)',
  klasicke: 'Klasické kyvadlové kroky',
  presne: 'Přesné kroky',
  volne: 'Volné a zobrazovací',
  elektricke: 'Elektromechanické',
  elektronicke: 'Elektronické a digitální',
};
