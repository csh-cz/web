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
 * - bibKey (preferred) — citation-key ze Zotera (Better BibTeX), např. "knesplProgressVersusTradition2024".
 *   Když je nastaven, render použije citeproc-js + ISO 690 CSL stylesheet
 *   nad `apps/hodinarium-eu/src/data/references.json` (SSOT export Zotera).
 *   Title/author/year/url se ignorují (data tečou ze SSOT).
 * - title (legacy) — povinný pro reference, které nejsou v Zoteru. Ručně psaná
 *   citace, autor + year + url volitelně. Postupně migrujeme na bibKey.
 * - note — vlastní kontext editora (např. „primární pramen tohoto článku"),
 *   render ho zobrazí za citací. Zachovává se i u bibKey-driven references.
 * - pages — override pro citaci jen části (kapitola, stránky).
 * - type ovlivní ikonku/řazení (kniha, článek, PDF, web odkaz, wiki, mapa, patent, archiv).
 */
const reference = z.object({
  bibKey: z.string().optional(),
  title: z.string().optional(),
  url: z.string().url().optional(),
  author: z.string().optional(),
  year: z.union([z.number(), z.string()]).optional(),
  type: z.enum(['kniha', 'clanek', 'pdf', 'odkaz', 'wiki', 'mapa', 'patent', 'archiv', 'zprava']).optional(),
  pages: z.string().optional(),
  note: z.string().optional(),
}).refine((d) => d.bibKey || d.title, {
  message: 'reference: musí mít bibKey (Zotero) nebo title (ad-hoc).',
});

/**
 * Editor-only poznámka k článku/kartě/medailonu. Renderuje se jen pro
 * přihlášené editory (CSS `aside.editor-note { display: none }` s
 * override `body[data-editor-mode] aside.editor-note { display: block }`).
 *
 * Předtím se psala jako `<aside class="editor-note">…</aside>` přímo
 * do těla MDX/MD textu — to však znamenalo, že editor v CMS musel
 * v rich-text editoru řešit raw HTML blok. Nyní samostatné frontmatter
 * pole, CMS formulář bude mít list widget.
 *
 * Levels (visual + sémantika):
 *   - info  ✎  — neutrální poznámka, kontext pro editora
 *   - warn  ⚠  — varování o nejistotě / potřebě ověření
 *   - todo  ☐  — úkol k dořešení (stub, doplnit prameny, …)
 */
const editorNote = z.object({
  level: z.enum(['info', 'warn', 'todo']).default('info'),
  title: z.string().optional(),
  text: z.string(),
  noteKey: z.string().optional(),  // pro click-to-resolve mechanismus
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
    /**
     * Draft mode — true = článek je rozpracovaný, viditelný jen pro
     * editory. Pro běžné návštěvníky se zobrazí placeholder „Tento obsah
     * ještě není zveřejněn". Sitemap, RSS, search index, kategorie/tag
     * indexy a related-karty list tyto články vynechají. Robot meta
     * obsahuje noindex, nofollow.
     *
     * Workflow: nový článek nasazený s `draft: true` v PR/commitu.
     * Editor článek prohlédne na produkci (přihlášený přes Sveltia CMS)
     * a buď nastaví `draft: false` (publish) nebo upraví obsah.
     */
    draft: z.boolean().optional(),
    /** Custom path (e.g. /img/...) to override the default template-based OG image. */
    ogImage: z.string().optional(),
    /** Custom thumbnail for atlas / katalog karet — přebíjí prvni-image z těla. */
    thumbnail: z.string().optional(),
    /** Autor článku (např. "Petr Král"). Footer ho zobrazí jako "P. Král". */
    author: z.string().optional(),
    /** Literatura a odkazy renderované v sekci pod článkem. */
    references: z.array(reference).optional(),
    /** Editorské poznámky (TODO, varování o nejistotě, kontext) — viditelné
        jen po loginu editora, anonymní návštěvník nic nevidí. */
    editorNotes: z.array(editorNote).optional(),
    /** True = článek/karta je stub — frontmatter i body čekají na editorovu
        práci. Veřejně se zobrazuje jen základní info; editor v /redakce/
        dashboard vidí seznam stubů napříč collections. */
    isStub: z.boolean().optional(),
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
        // === Materiály a multimediální zdroje ===
        // Materiály z čeho je předmět vyroben — string ("ocelové pásnice")
        // nebo array (multi-select v CMS: ["ocel", "litina", "mosaz"]).
        // Renderer normalizuje na array. Použito v JSON-LD `material` a v
        // citaci jako keywords.
        materialy: z.union([z.string(), z.array(z.string())]).optional(),
        // URL na PDF katalogového listu (např. scan archivního formuláře
        // nebo plné restaurátorské zprávy). Zobrazí se jako ikon-link
        // v karta detailu a propaguje se do citation_pdf_url meta tagu
        // i CSL JSON / BibTeX.
        catalogPdfUrl: z.string().optional(),
        // IIIF Presentation API manifest URL — datový model je připravený
        // do budoucna (tilíhle institucionální IIIF servery typu UDU/MZK).
        // Zatím se jen render link „IIIF manifest" + image v JSON-LD.
        iiifManifestUrl: z.string().url().optional(),
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
    /**
     * Skrytá synonyma a alternativní pravopisy/termíny pro vyhledávání.
     * NEzobrazuje se na stránce, jen v search indexu (Fuse.js).
     *
     * Použití:
     *   - cizí ekvivalenty českých termínů ("foliot" pro "lihýř",
     *     "Spindel" pro "vřeteno")
     *   - alternativní pravopisy obcí/jmen ("Bychory" / "Býchory",
     *     "Maresch" pro "Mareš")
     *   - historické termíny, žargon
     *   - chybové překlepy které lidi často píší
     *
     * Free-text array bez whitelistu — synonyma jsou per-article specifická.
     * Pokud opakovaně přidáváš stejný keyword víc článkům, zvaž zda nemá
     * patřit do tags whitelistu (data/tags.json).
     */
    searchKeywords: z.array(z.string()).optional(),
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
    /** True = MDX existuje jen kvůli CMS (frontmatter dat z whitelist),
        ale rozšířený medailon zatím není napsán. Stránka pak zobrazí
        veřejnou „profil je stub" hlášku stejně jako kdyby MDX neexistoval. */
    isStub: z.boolean().optional(),
    portret: z.string().optional(),
    portretCredit: z.string().optional(),
    // CMS posílá prázdný string `''` když editor pole nevyplní → coerce na undefined.
    portretSource: z.preprocess((v) => (v === '' ? undefined : v), z.string().url().optional()),
    references: z.array(reference).optional(),
    /** Editorské poznámky (TODO, varování o nejistotě, kontext). */
    editorNotes: z.array(editorNote).optional(),
    /** Skrytá synonyma pro vyhledávání — viz dokumentace u clanky.searchKeywords.
     *  Pro medailony hodinářů typicky alternativní pravopisy jména (Maresch /
     *  Mareš), zkratky firem, lokality kde hodinář pracoval a které lidé znají. */
    searchKeywords: z.array(z.string()).optional(),
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
    /** Editorské poznámky (TODO, varování o nejistotě, kontext). */
    editorNotes: z.array(editorNote).optional(),
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
  // Preferred: bibKey ze Zotera (citation-key v Better BibTeX). Když je
  // nastaven, render použije citeproc + ISO 690 CSL ze SSOT.
  bibKey: z.string().optional(),
  // Legacy ad-hoc fields. Postupně migrujeme na bibKey.
  title: z.string().optional(),
  url: z.string().url().optional(),
  citace: z.string().optional(),                    // ISO 690 plain text
  autor: z.string().optional(),
  rok: z.union([z.number(), z.string()]).optional(),
  type: z.enum(['kniha', 'clanek', 'pdf', 'odkaz', 'wiki', 'mapa', 'patent', 'archiv', 'zprava']).optional(),
  pages: z.string().optional(),
  poznamka: z.string().optional(),                  // editor's free-form context
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

    /**
     * Památkový katalog NPÚ (Národní památkový ústav) — strukturovaný
     * odkaz pro budovy zapsané v Ústředním seznamu kulturních památek.
     *
     * `id`     — numerický identifikátor v URL (`https://www.pamatkovykatalog.cz/<slug>-<id>`)
     * `slug`   — slugovaná část URL (volitelné, pro auto-konstrukci linku)
     *
     * URL pattern: `https://www.pamatkovykatalog.cz/<slug>-<id>`
     * Příklad: id="3122498", slug="budova-celni-expozitury"
     *          → https://www.pamatkovykatalog.cz/budova-celni-expozitury-3122498
     */
    pamatkovyKatalog: z.object({
      id: z.string(),
      slug: z.string().optional(),
    }).optional(),

    /** Volný text (pro krátké poznámky; delší narativ jde do MDX body). */
    poznamka: z.string().optional(),

    /** Editorské poznámky (TODO, varování o nejistotě, kontext). */
    editorNotes: z.array(editorNote).optional(),

    /** True = záznam je stub — minimální data (typicky bulk import z
        Hellichova seznamu nebo z OSM-import), čeká na manuální dopnění
        budovy / roku / krok / restaurátor / fotky. Editor v /redakce/
        dashboard vidí seznam stubů. */
    isStub: z.boolean().optional(),

    /** Meta. */
    posledniOvereni: dateString.optional(),
    zdrojDat: z.string().optional(),                // 'tabulka_krecmer' / 'tabulka_landesbergerove' / 'manual' / 'osm-import' / ...
  }),
});

/**
 * Hodinové kroky — rozšířené technické články o jednotlivých krocích.
 *
 * Paralelní pattern jako hodinari: kroky.ts drží registry (slug, jméno,
 * datum, vynálezce, related, …) — primárně pro lookup z článků a sidebar.
 * MDX entries v content/kroky/<slug>.mdx přidávají plný text pro karty,
 * které mají dost materiálu (Robertův krok, později Graham, Amant, …).
 *
 * Stránka /kroky/<slug> načte MDX entry pokud existuje, jinak renderuje
 * jen `charakteristika` z kroky.ts (stub mode).
 */
const krokyDetaily = defineCollection({
  loader: glob({
    base: '../../content/kroky',
    pattern: '**/*.{md,mdx}',
  }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    /** Hero obrázek — ilustrativní fotka exempláře nebo historický výkres. */
    hero: z.object({
      src: z.string(),
      alt: z.string(),
      caption: z.string().optional(),
      /** Autor / zdroj / licence — povinný (pravidlo „vždy zdroj a copyright"). */
      credit: z.string(),
    }).optional(),
    /** Krátký lead pod nadpisem (1–3 věty). */
    perex: z.string().optional(),
    references: z.array(reference).optional(),
    editorNotes: z.array(editorNote).optional(),
  }),
});

/**
 * ─── Hodinářský výkladový a překladový slovník ─────────────────────
 *
 * Hesla z primárních pramenů (Šumavský 1851, Špatný 1882, Sušický 1900,
 * Sladkovský 1947, Bureš 1965, Saunier 1887, Gros 1913, Dietzschold 1894).
 * Každé heslo: cs heslo + překlady de/en/fr (+ zdroj překladu) + krátká
 * definice + výklad (MDX body) + příbuzné termíny (cross-links na další
 * hesla) + reference s doslovnými citacemi.
 *
 * Redakční SSOT pro slovník je v user-scope skillu
 *   ~/.claude/skills/horologicka-terminologie/reference/slovnik.md
 *
 * Migration do content collection probíhá scriptem `scripts/build-slovnik.mjs`
 * (jednorázový sync; po commitu jsou MDX soubory autoritativní).
 */
const slovnikPreklad = z.object({
  term: z.string(),
  zdroj: z.string().optional(),                    // Špatný 1882, Šumavský 1851, …
});

const slovnikReference = z.object({
  bibKey: z.string().optional(),
  title: z.string().optional(),
  citace: z.string().optional(),                   // doslovný citát z pramene
  pages: z.string().optional(),
  note: z.string().optional(),
}).refine((r) => r.bibKey || r.title || r.citace, {
  message: 'slovnik reference: musí mít bibKey, title nebo citace.',
});

const slovnik = defineCollection({
  loader: glob({
    base: '../../content/slovnik',
    pattern: '**/*.{md,mdx}',
  }),
  schema: z.object({
    title: z.string(),                              // cs heslo (lowercase typicky: "krok", "kotva")
    slug: z.string(),                               // slugified ("kolo-zaverkove", "casova-rovnice")

    /** Tematická kategorie pro řazení v indexu. */
    kategorie: z.enum([
      'mechanika',          // krok, soukolí, kyvadlo, setrvačka, …
      'bici',               // bicí stroj, kladívko, cymbál, početník, …
      'astronomicke',       // sluneční hodiny, gnómon, časová rovnice, kvadrant
      'materialy',          // invar, rubínový kámen, isochronismus, …
      'hodinky',            // kalibr, werk, korunka, pouzdro, chronograf, automatic, GMT, …
      'profese',            // hodinář, pouzdrář, hodinářské školy (rezerva pro budoucnost)
      'jine',
    ]),

    /** Překlady do dalších jazyků s informací o zdroji terminologie. */
    prekladyDe: z.array(slovnikPreklad).optional(),
    prekladyEn: z.array(slovnikPreklad).optional(),
    prekladyFr: z.array(slovnikPreklad).optional(),

    /** Alternativní české tvary, archaické varianty, dialektismy. */
    varianty: z.array(z.string()).optional(),

    /** Krátká definice (1–2 věty) — renderuje se v indexu jako náhled
     *  a v detailu jako lead pod nadpisem. */
    definice: z.string(),

    /** Slugy příbuzných hesel — vyrenderují se jako cross-link list. */
    pribuzne: z.array(z.string()).optional(),

    /** Reference s doslovnými citacemi z primárních pramenů. */
    references: z.array(slovnikReference).optional(),

    /** Volitelný hero obrázek heslá (schéma, fotka exempláře, výkres). */
    obrazek: z.object({
      src: z.string(),
      alt: z.string(),
      caption: z.string().optional(),
      credit: z.string(),
    }).optional(),

    /** True = heslo je stub — výklad v MDX body čeká na doplnění. */
    isStub: z.boolean().optional(),

    /** Editorské poznámky (TODO, varování o nejistotě). */
    editorNotes: z.array(editorNote).optional(),

    /** Datum poslední revize hesla (kdy byly citace ověřeny v pramenech). */
    poslednRevize: dateString.optional(),
  }),
});

export const collections = {
  clanky,
  hodinari: hodinariMedailony,
  kronika,
  kroky: krokyDetaily,
  'soupis-veznich-hodin': soupisVeznichHodin,
  slovnik,
};
