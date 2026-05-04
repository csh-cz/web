import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import tagsWhitelist from './data/tags.json';

/**
 * String schema co toleruje YAML Date object.
 *
 * Sveltia CMS při edit přepíše YAML frontmatter a strip-uje uvozovky
 * kolem hodnot vypadajících jako datum (`date: 2014-06-01` místo
 * `date: "2014-06-01"`). YAML 1.1 parser pak vrací Date objekt místo
 * stringu → z.string() validation fail → Pages CI build fail.
 *
 * Tenhle helper přijímá obojí: Date object transformuje na YYYY-MM-DD
 * ISO string, string nechá projít. Konzumenti (RSS, sort, render) tak
 * dostanou konzistentní string type bez ohledu na to, zda CMS uvozovky
 * stripnul.
 */
const dateString = z.preprocess(
  (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v),
  z.string(),
);

/**
 * Schéma jednoho odkazu / literatury pod článkem.
 * - title povinný; ostatní volitelné
 * - type ovlivní ikonku/řazení (kniha, článek, PDF, web odkaz, wiki, mapa, patent, archiv)
 */
const reference = z.object({
  title: z.string(),
  url: z.string().url().optional(),
  author: z.string().optional(),
  year: z.union([z.number(), z.string()]).optional(),
  type: z.enum(['kniha', 'clanek', 'pdf', 'odkaz', 'wiki', 'mapa', 'patent', 'archiv', 'zprava']).optional(),
  note: z.string().optional(),
});

/**
 * Tags whitelist — sloučení všech polí (kromě _meta) z data/tags.json.
 * Refine validuje, že každý tag je ve whitelistu — typo failne build.
 * Rozšiřování PR commitem do data/tags.json.
 */
const allTags = new Set(
  Object.entries(tagsWhitelist)
    .filter(([k]) => k !== '_meta')
    .flatMap(([, v]) => v as string[])
);

const clanky = defineCollection({
  loader: glob({
    base: '../../content/hodinarium-eu',
    pattern: '**/*.{md,mdx}',
  }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    /**
     * Kategorie článku. Nové (po taxonomii 2026-04):
     *   - sbirka            — exponáty spolku (vystavené i depozitář)
     *   - konstrukce        — mechanismy a principy hodin obecně
     *   - projekty          — DIY autorské konstrukce spolku
     *   - virtualni-muzeum  — zajímavé hodiny mimo sbírku spolku
     *   - muzea             — sister muzea, přehledy sbírek (Mindelheim, Protivín, …)
     *   - zajimavosti       — eseje o čase, kalendáře, časoměrné systémy
     *
     * Stará schema (pre-2026-04, postupná migrace):
     *   - decin, vezni-hodiny, ostatni — deprecated, mapping v
     *     scripts/migrate-categories.ts
     */
    category: z.enum([
      // nové
      'sbirka', 'konstrukce', 'projekty', 'virtualni-muzeum', 'muzea', 'zajimavosti',
      // staré (deprecated, ponechané kvůli postupné migraci)
      'decin', 'vezni-hodiny', 'ostatni',
    ]),
    originalUrl: z.string().url(),
    lastModified: dateString.nullable(),
    sourceCharset: z.string(),
    scrapedAt: dateString,
    tldr: z.string().optional(),
    manualEdit: z.boolean().optional(),
    /** Custom path (e.g. /img/...) to override the default template-based OG image. */
    ogImage: z.string().optional(),
    /** Custom thumbnail for atlas / katalog karet — přebíjí prvni-image z těla. */
    thumbnail: z.string().optional(),
    /** Autor článku (např. "Petr Král"). Footer ho zobrazí jako "P. Král". */
    author: z.string().optional(),
    /** Literatura a odkazy renderované v sekci pod článkem. */
    references: z.array(reference).optional(),
    /** Styl seznamu referencí: 'bullet' (default — type-icon) nebo 'numbered'
     *  ([1], [2] …, vhodné pro články s přímými citacemi přes <Ref n={N}>). */
    referenceStyle: z.enum(['bullet', 'numbered']).optional(),
    /**
     * Tagy — řízený whitelist v data/tags.json. Rozšiřování PR commitem.
     * Validace: každý tag musí být ve whitelistu, jinak build failne
     * (typo / neznámý tag se neproklouzne).
     */
    /**
     * Diskriminátor podsekce v rámci kategorie `sbirka`:
     *   - 'karta'  = evidenční karta sbírkového předmětu (1:1 z XLS soupisu),
     *                URL /sbirka/karta/<slug>, generated stub
     *   - 'clanek' = vázaný článek o jednom nebo více předmětech
     *                (restaurování, příběh, historie), URL /sbirka/<slug>
     *
     * Pro ostatní kategorie (konstrukce, projekty, …) se nepoužívá —
     * default 'clanek' když chybí.
     */
    podsekce: z.enum(['karta', 'clanek']).optional(),
    /**
     * FK na evidenční karty, ke kterým se článek vztahuje. Slugy karet
     * (inv-NNN-*). Reverse lookup probíhá v /sbirka/karta/<slug>/ pro
     * vykreslení sekce "Vážící se články".
     */
    relatedKarty: z.array(z.string()).optional(),
    /**
     * Popisná karta exponátu (typicky pro `category: sbirka` články
     * o konkrétním sbírkovém předmětu). Renderuje se jako definition
     * list pod hero obrázkem na začátku článku.
     *
     * Všechna pole volitelná. Pole `extra` umožní libovolný klíč/hodnota
     * pro nestandardní atributy (signatura, čísla v inventáři, …).
     */
    karta: z
      .object({
        // === Identifikace exponátu ===
        inventarniCislo: z.string().optional(),
        datace: z.string().optional(),          // rok výroby nebo širší období ("1884", "polovina 18. století", "1868–1872")
        vyrobce: z.string().optional(),
        signatura: z.string().optional(),
        // Původní umístění před zařazením do sbírky — strukturovaně.
        // Pokrývá historii vlastnictví (puvodní `provenience` field zrušen
        // jako duplicitní s tímto strukturovaným záznamem).
        puvodniUmisteni: z
          .object({
            objekt: z.string().optional(),     // "kostel sv. Jakuba"
            typObjektu: z.string().optional(), // "kostel" / "radnice" / "továrna"
            obec: z.string().optional(),       // "Kutná Hora"
            detail: z.string().optional(),     // "věž – jižní strana"
          })
          .optional(),
        // Komplety — pokud karta reprezentuje soubor (např. "věžní Prokeš
        // 1868 soubor" obsahuje hodinový + bicí + zvonící stroj + cimbály),
        // zde slugy souvisejících článků nebo sub-karet, které popisují
        // jednotlivé komponenty. Vyrenderuje se jako "Komplet obsahuje:"
        // navigation grid v karta detail page.
        komponenty: z.array(z.string()).optional(),
        // === Konstrukce ===
        ram: z.string().optional(),
        krokJicihoStroje: z.string().optional(),
        // Bicí stroje může být string ("hodinové") nebo array (multi-select
        // z CMS: ["čtvrťové", "hodinové"]). Renderer normalizuje na array.
        biciStroje: z.union([z.string(), z.array(z.string())]).optional(),
        rozmery: z.string().optional(),
        kyvadlo: z.string().optional(),
        ciselnik: z.string().optional(),
        pohon: z.string().optional(),
        pohonDetail: z.string().optional(),  // volitelné upřesnění pohon
        // === Spolková evidence ===
        umisteni: z.string().optional(),                    // současné umístění v Hodináriu
        majitel: z.string().optional(),                     // kdo exponát vlastní
        darceZapujcitel: z.string().optional(),             // od koho jsme dostali (často ≠ majitel)
        vztahKeSbirce: z.string().optional(),               // zápůjčka / dar / koupě / montáž / spolek
        // Rok přírůstku — CMS nabízí number widget, ale historicky string.
        // Tolerujeme oboje a normalizujeme na string v rendereru.
        pridanoDoSbirky: z.union([z.string(), z.number()]).optional(),
        stav: z.string().optional(),
        restaurovani: z.string().optional(),                // kdy + kdo + co
        adaptaceProVystavu: z.string().optional(),          // co bylo upraveno pro expozici
        // === Cokoli ostatní (rare/specific) ===
        extra: z
          .array(z.object({ label: z.string(), value: z.string() }))
          .optional(),
      })
      .optional(),
    tags: z
      .array(z.string())
      .optional()
      .refine(
        (tags) => !tags || tags.every((t) => allTags.has(t)),
        (tags) => ({
          message: `Neznámý tag — přidej do data/tags.json: ${
            (tags ?? []).filter((t) => !allTags.has(t)).join(', ')
          }`,
        }),
      ),
  }),
});

/**
 * Plnohodnotné medailony hodinářů (delší životopisy s archivními prameny,
 * fotkami, odkazy). Pro každého hodináře, který má v data/hodinari.ts
 * stub, lze vytvořit content/hodinari/<slug>.mdx — page potom rendruje
 * dlouhý text místo stubu.
 *
 * Auto-detect zmínek hodináře v článcích zatím přes manuální relatedSlugs
 * v data/hodinari.ts; v M3.b doplníme regex skenování těla článků.
 */
const hodinariMedailony = defineCollection({
  loader: glob({
    base: '../../content/hodinari',
    pattern: '**/*.{md,mdx}',
  }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    typ: z.enum(['osoba', 'firma']),
    obdobi: z.string().optional(),
    mesto: z.string().optional(),
    zeme: z.string().default('CZ'),
    aliasy: z.array(z.string()).optional(),
    shrnuti: z.string(),
    portret: z.string().optional(),
    portretCredit: z.string().optional(),
    portretSource: z.string().url().optional(),
    references: z.array(reference).optional(),
  }),
});

/**
 * Kronika — chronologický feed událostí spolku.
 *
 * Vernisáže, fotoreporty, sezóny, akvizice, TV pořady, výstavky,
 * historie spolku v Soběslavi (2009–2015). Každý záznam má `date:`
 * ISO datum a `typ:` klasifikaci. Renderuje se chronologicky descending
 * v /kronika/ feedu plus na hlavní stránce posledních N položek.
 */
const kronika = defineCollection({
  loader: glob({
    base: '../../content/kronika',
    pattern: '**/*.{md,mdx}',
  }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    /** ISO datum YYYY-MM-DD (případně rozsah "YYYY-MM-DD — YYYY-MM-DD"). */
    date: dateString,
    /** Rok pro chronologii (může se lišit od date u rozsahů). */
    rok: z.number(),
    typ: z.enum([
      'vernisaz', 'fotoreport', 'sezona', 'akvizice', 'tisk', 'tv',
      'restaurace', 'historie-spolku', 'tematicka-vystava', 'jine',
    ]).optional(),
    misto: z.string().optional(),
    /** Cross-link na exponáty / projekty / hodináře. */
    related: z.array(z.object({
      slug: z.string(),
      kategorie: z.enum([
        'sbirka', 'konstrukce', 'projekty', 'virtualni-muzeum',
        'muzea', 'zajimavosti', 'hodinari',
      ]).optional(),
    })).optional(),
    photos: z.array(z.string()).optional(),
    author: z.string().optional(),
    references: z.array(reference).optional(),
    /** Pro legacy import z hodinarium.eu (zachováme původní URL). */
    originalUrl: z.string().url().optional(),
  }),
});

/**
 * ─── Soupis věžních hodin ─────────────────────────────────────────
 *
 * Komplexní dataset existujících i ztracených věžních hodin v ČR
 * (a okolí), identifikovaných in situ i z pramenů. Zdroje:
 *  - Tabulky hodinářů (Krečmer, Landesbergerové, Prokeš, …)
 *  - Hodinárium evidence (sbírkové karty)
 *  - NPÚ pamatkový katalog, kramerius, regionální archivy
 *  - OSM POI (cross-validace názvů + koordinátů)
 *
 * Hybridní storage: 1 MDX soubor = 1 hodiny. Frontmatter nese plnou
 * strukturu (často jen pár polí vyplněných); volitelné body MDX pro
 * narativ (typicky u Hodinárium kusů a slavných případů).
 *
 * URL:
 *   /soupis-veznich-hodin/             — list s filtry
 *   /soupis-veznich-hodin/mapa/        — interaktivní Leaflet mapa
 *   /soupis-veznich-hodin/<slug>/      — detail
 *
 * Schema je záměrně permissivní — kromě slug/rok/puvodni_misto.obec
 * jsou všechna pole optional. Cílem je inkrementální datafikace:
 * začíná se „máme jen rok+obec" a postupně se doplňuje krok, signatura,
 * fotky, prameny.
 */
const veznihodinaFoto = z.object({
  src: z.string(),                                  // /img/...
  alt: z.string().optional(),
  credit: z.string().optional(),
  typ: z.enum(['stroj', 'budova', 'cifernik', 'detail', 'historicke', 'plan', 'jine']).optional(),
});

const veznihodinaPramen = z.object({
  title: z.string().optional(),
  url: z.string().url().optional(),
  citace: z.string().optional(),                    // ISO 690 plain text
  autor: z.string().optional(),
  rok: z.union([z.number(), z.string()]).optional(),
});

const soupisVeznichHodin = defineCollection({
  loader: glob({
    base: '../../content/soupis-veznich-hodin',
    pattern: '**/*.{md,mdx}',
  }),
  schema: z.object({
    /** Stabilní slug — typicky <rok>-<misto>-<hodinar>, např. 1868-bychory-prokes. */
    slug: z.string(),

    /** Rok výroby. Číslo (1868), string pro rozsahy ("1850–1855") nebo neznámý ("?", "po 1880"). */
    rok: z.union([z.number(), z.string()]),

    /** Hodinář — slug medailionu v content/hodinari/, nebo free text pokud bez medailionu. */
    hodinar: z.string().optional(),
    hodinarText: z.string().optional(),             // např. "připisováno Prokešovi" / "anonymní"

    /** Původní místo a budova — jediné polopovinné pole. Obec povinná (kvůli vyhledávání). */
    puvodniMisto: z.object({
      obec: z.string(),
      cast: z.string().optional(),                  // městská část / čtvrť
      budova: z.string().optional(),                // kostel sv. X / radnice / zámek / továrna ...
      okres: z.string().optional(),
      kraj: z.string().optional(),
      zeme: z.string().default('CZ'),
    }),

    /** Souřadnice [lat, lon] WGS84. Vyplněno geocoding skriptem. */
    souradnice: z.tuple([z.number(), z.number()]).optional(),
    souradnicePribl: z.boolean().optional(),        // true = jen úroveň obce, ne přesně budovy

    /** Stav hodin. */
    stav: z.enum(['in_situ', 'preneseno', 'ztracene', 'znicene', 'neznamy']).default('neznamy'),

    /** Při preneseno: kam a kdy. */
    prenos: z.object({
      do: z.string(),                               // "Hodinárium Děčín" / "soukr. sbírka, Švýcarsko" / "NTM Praha"
      rok: z.union([z.number(), z.string()]).optional(),
      poznamka: z.string().optional(),
    }).optional(),

    /** Aktuální chod (rozhodující pro mapové zobrazení). */
    chod: z.enum(['v_chodu', 'nefunkcni', 'restaurovano', 'pred_restaurovanim', 'znicene', 'neznamy']).optional(),

    /** Technická charakteristika — všechno optional. */
    krok: z.string().optional(),                    // 'graham', 'denison', '4-leg-denison', 'mannhardt-lepaut', 'amant-lepaut', 'kotvovy', ... (free text, nikoli enum, kvůli historickým variantám)
    pohon: z.string().optional(),                   // 'zavazi', 'pero', 'elektricky', ...
    pocetCifernik: z.number().optional(),
    rozmery: z.string().optional(),                 // "ráfek 1200 mm" / "stroj 800 × 600 × 400 mm"
    signatura: z.string().optional(),
    cenaDobova: z.string().optional(),              // "900 zl." / "1125 K"

    /** Restaurování. */
    restaurator: z.string().optional(),
    rokRestaurovani: z.union([z.number(), z.string()]).optional(),

    /** Fotografie (pole — stroj, budova, ciferník, ...). */
    foto: z.array(veznihodinaFoto).optional(),

    /** Prameny (literatura, archivy, URL). */
    prameny: z.array(veznihodinaPramen).optional(),

    /** Cross-ref na evidenční karty Hodinária a vázaní články. */
    relatedKarty: z.array(z.string()).optional(),
    relatedClanky: z.array(z.string()).optional(),

    /** OSM cross-ref po validaci. */
    osmId: z.string().optional(),                   // např. "way/123456789"
    wikidataId: z.string().optional(),              // např. "Q12345"

    /** Volný text (pro krátké poznámky; delší narativ jde do MDX body). */
    poznamka: z.string().optional(),

    /** Meta. */
    posledniOvereni: dateString.optional(),
    zdrojDat: z.string().optional(),                // 'tabulka_krecmer' / 'tabulka_landesbergerove' / 'manual' / 'osm-import' / ...
  }),
});

export const collections = {
  clanky,
  hodinari: hodinariMedailony,
  kronika,
  'soupis-veznich-hodin': soupisVeznichHodin,
};
