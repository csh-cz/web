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
  /** Bibliografické reference. Vykreslí se v /kroky/<slug> jako sekce
   *  „Literatura a odkazy".
   *  - `bibKey` → CSL položka v Zotero (preferováno) → ISO 690 přes citeproc-js
   *  - `title` (+ `url`/`note`) fallback pro položky mimo Zotero
   *    (historické patenty, aukční katalogy, …)  */
  references?: Array<{
    bibKey?: string;
    title?: string;
    url?: string;
    pages?: string;
    note?: string;
  }>;
  /** Obrazové prameny — historické výkresy, patenty, fotky exemplářů.
   *  Zobrazí se v /kroky/<slug> v sekci „Obrazové prameny" pod
   *  charakteristikou. Každý obrázek MUSÍ mít credit (autor/zdroj/licence). */
  images?: Array<{
    src: string;
    alt: string;
    caption?: string;
    /** Autor / zdroj / licence — povinný. Pravidlo „vždy zdroj a copyright". */
    credit: string;
  }>;
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
    slug: 'robertuv-krok',
    jmeno: 'Robertův krok',
    aliasy: [
      'Robertův krok',
      'Robertova kroku',
      'Robertovým krokem',
      'krok Adolphe Roberta',
      'krok Roberta de Sancerre',
      'Roberta de Sancerre',
      'kolíčkový kotvový krok se středovou kotvou',
    ],
    vynalezce: 'Léon Émile Adolphe Robert (Sancerre)',
    rok: '1852',
    shrnuti:
      'Klidový kotvový krok s kolíčkovým krokovým kolem a se středově umístěnou kotvou — kombinace Grahamova kroku (kotva) a kolíčkového kroku (kolíčky místo zubů). Patent 1852, představen 1855 na pařížské světové výstavě.',
    charakteristika:
      'V dobové francouzské literatuře (Gros, Saunier, Revue chronométrique) kritizován jako kompromis, který spojuje slabiny obou výchozích řešení — kotva je stejně náročná na výrobu jako Grahamova, kolíčkové kolo více práce než ploché kolo, kolíky špatně drží olej. Existuje i převrácená varianta od A.-L. Vérité (1806–1887). V Čechách krok výhradně používal Jan Prokeš ze Sobotky od roku 1868 (po vypršení patentu) — pravděpodobně se s ním seznámil na pařížské výstavě 1867. Nejstarší dochovaný exemplář pochází ze zámku Býchory (1868), dnes vystavený v expozici Hodinária. V odborné literatuře dříve označován jako „krok Roberta de Sancerre" — Sancerre je však místo původu, ne příjmení; správně Robertův krok podle Léona Émile Adolphe Roberta ze Sancerre. Otázka původu je nicméně otevřená: Curt Dietzschold ho v knize Die Turmuhren (1894) označuje jako „Älterer Stiftengang" (starší kolíčkový krok) a v práci Simona Stampfera o věžních hodinách na radnici ve Lvově je týž mechanismus zobrazen už roku 1839, tedy 13 let před Robertovým patentem. V principu jde o kombinaci Grahamova kroku (kotva) a Amantova kolíčkového kroku, oba dostupné už v první polovině 18. století — Robertův patent z 1852 možná jen formálně registroval konstrukci, kterou hodináři používali nezávisle už dříve. Hlavní praktický problém: kolíčky musí být v krokovém kole absolutně rovnoměrně osazené, jinak se mění dopad na pravou a levou paletu — typický příklad obtížného ladění je věžní stroj L. Prokeše z Jičína (1905) na zámku Milíčeves, kde výrobce řešil nepřesnost vrtání individuálním zeslabováním palet a opilováním kolíčků.',
    relatedSlugs: [
      'bychory_prokes1',
      'inv-2-vezni-prokes-1868-soubor',
      'akvizice-2015-2025',
      'inv-31-vezni-francie',
    ],
    skupina: 'klasicke',
    /**
     * Reference z autorské studie Knespl 2023 (Zpravodaj SPSH 38, s. 10–13).
     * Ten článek je primární zdroj nápravy zavádějícího názvu „krok Roberta
     * de Sancerre" a jeho poznámkový aparát mapuje historické prameny:
     * patent 1852, dobové kritiky (Gros 1913, Saunier 1887, Revue chronométrique
     * 1857), Michalovu kompilaci 1980/1987 která chybu zavedla do české
     * literatury, plus české kontexty (Klementinum, Frič Paměti, Raabs).
     */
    references: [
      { bibKey: 'knesplRobertuvKrokOprava2023' },
      { bibKey: 'knesplJanProkesHodinar2018a', note: 'Pozn. 1 — biografie Jana Prokeše ze Sobotky (1818–1890), hlavního českého uživatele kroku.' },
      { bibKey: 'michalHodinyOdGnomonu1980', pages: '87', note: 'Pozn. 2 — první vydání, zde poprvé v češtině označení „krok Roberta de Sancerre" (chybné).' },
      { bibKey: 'michalHodinyOdGnomonu1987a', pages: '78', note: 'Pozn. 3 — druhé vydání, chyba převzata.' },
      { bibKey: 'grosEchappementsDhorlogesMontres1913', pages: '70–71', note: 'Pozn. 4–5 — primární popis kroku z roku 1913, zdroj francouzského „Robert de Sancerre".' },
      { bibKey: 'saunierTreatiseModernHorology1887', pages: '564', note: 'Pozn. 6 — anglická kritika kroku, autor neuveden („provincial clockmaker").' },
      {
        title: 'BENOIT, François Célestin a Léon Émile Adolphe ROBERT. Échappements de pendules. Patent č. 1BB13653. Paříž, 22. července 1852.',
        url: 'http://bases-brevets19e.inpi.fr/Thot/FrmFicheDoc.asp?idfiche=71127&refFiche=39321&baseCindoc=THOTDESC',
        note: 'Pozn. 7 — původní francouzský patent (15letá ochrana). Mimo Zotero.',
      },
      { bibKey: 'RevueChronometrique1857', pages: '153', note: 'Pozn. 8 — dobová francouzská kritika kroku (1857).' },
      { bibKey: 'kavkovaVezniHodinyAstronomicke2001', note: 'Pozn. 9 — Klementinské hodiny s Robertovým krokem (Praha).' },
      { bibKey: 'fricPametiIII1963', pages: '283', note: 'Pozn. 10 — vzpomínka na hodináře Prokeše ve spolku Česká beseda v Paříži (možná návštěva 1867).' },
      { bibKey: 'himmlerHradRaabsUhrenmuseum2019', pages: '29–31', note: 'Pozn. 11 — věžní stroj s Robertovým krokem na rakouském hradě Raabs.' },
      {
        title: 'Aukce Antikvity Praha, s.r.o., 38. aukce — Historické zbraně, stará technika a užité umění, 2022, položka 9414.',
        url: 'https://eaukce.antiques-auctions.eu/cz/archivDetail/59/0/9414-vezni-hodiny/',
        note: 'Pozn. 12 — nesignovaný věžní stroj získaný v aukci 2022 (dnes Hodinárium Děčín, inv. č. 31).',
      },
      { bibKey: 'bonninDescriptionVilleSancerre1999', note: 'Pozn. 13 — kronika města Sancerre, údaje o Robertovi (zemřel před 1876).' },
      // Doplňkové prameny k otázce „Älterer Stiftengang" (mimo poznámkový aparát Knespl 2023)
      { bibKey: 'dietzscholdTurmuhrenMitEinschluss1984', note: 'Tafel 4, Fig. 51 — krok zde popsán jako „Älterer Stiftengang" (starší kolíčkový krok); 1984 reprint německého originálu z Weimaru 1894.' },
      { bibKey: 'dietzscholdHemmungenUhrenIhre1905', note: 'Standardní práce o hodinových krocích, dostupná na Internet Archive.' },
      {
        title: 'STAMPFER, Simon. Pojednání o vylepšení věžních hodin a nových hodinách na radnici ve Lvově. 1839.',
        note: 'Detailní výkres stroje zobrazuje týž mechanismus jako Robertův krok (kotva nad kolíčkovým kolem se středovou kotvou) — 13 let před patentem 1852. Mimo Zotero.',
      },
    ],
    images: [
      {
        src: '/img/kroky/robertuv-krok/dietzschold-1894-fig51.png',
        alt: 'Dietzschold 1894, Tafel 4, Fig. 51 — výkres označený „Älterer Stiftengang"',
        caption: 'Curt Dietzschold v knize Die Turmuhren (1894) označuje tento krok jako „Älterer Stiftengang" — starší kolíčkový krok. Tabule IV, obr. 51.',
        credit: 'Reprodukce: DIETZSCHOLD, Curt. Die Turmuhren. Weimar 1894 (repr. Leipzig 1984), Tafel 4, Fig. 51. Public domain (autor † 1916).',
      },
      {
        src: '/img/kroky/robertuv-krok/stampfer-1839-lvov.png',
        alt: 'Stampfer 1839 — výkres věžního stroje na radnici ve Lvově s kolíčkovým krokem',
        caption: 'Simon Stampfer (1839) popisuje věžní hodiny na radnici ve Lvově s týmž mechanismem — kotva (A) nad kolíčkovým krokovým kolem (R), kyvadlo (V), tyč (P). 13 let před Robertovým patentem.',
        credit: 'Reprodukce: STAMPFER, Simon. O věžních hodinách na radnici ve Lvově. 1839. Public domain (autor † 1864).',
      },
      {
        src: '/img/kroky/robertuv-krok/patent-fr-1852.jpg',
        alt: 'Originální patentní výkres Benoita & Roberta z 18. května 1852',
        caption: 'Faksimile francouzského patentu č. 1BB13653 z 18. května 1852. Patent zahrnoval několik různých hodinových kroků; Robertův klidový kotvový krok s kolíčkovým kolem byl jen jedním z nich.',
        credit: 'Reprodukce: BENOIT, F. C. a L. É. A. ROBERT. Patent FR 1BB13653, Paříž 18. května 1852. Archiv INPI Paris, public domain (státní archiv).',
      },
    ],
  },
  {
    slug: 'denisonuv-gravitacni-krok',
    jmeno: 'Denisonův gravitační krok',
    aliasy: [
      'Denisonův krok',
      'gravitační krok',
      'Big Ben krok',
      'double three-legged gravity escapement',
      'Grimthorpe escapement',
    ],
    vynalezce: 'Edmund Beckett Denison (Lord Grimthorpe)',
    rok: '1852',
    shrnuti:
      'Dvojitý třícípý gravitační krok (double three-legged gravity escapement), použitý ve Westminster Great Clock (Big Ben) 1854. Kyvadlo dostává impuls vždy ze stejné výšky od malé gravitační páky, kterou krokové kolo pouze zvedá — odstraňuje slabinu předchozích kroků (citlivost na kolísání pohonné síly).',
    charakteristika:
      'Kombinovaný oscilátor + remontoár v jediné jednotce. Standardem pro nejpřesnější věžní hodiny 2. poloviny 19. století. V Čechách aplikoval Romuald Božek 1864 (Karlínská strojírna Daněk + Holub) pro kostel sv. Cyrila a Metoděje v Praze-Karlíně.',
    relatedSlugs: [],
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
