import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import tagsWhitelist from './data/tags.json';

/**
 * Schéma jednoho odkazu / literatury pod článkem.
 * - title povinný; ostatní volitelné
 * - type ovlivní ikonku/řazení (kniha, článek, PDF, web odkaz, wiki, mapa)
 */
const reference = z.object({
  title: z.string(),
  url: z.string().url().optional(),
  author: z.string().optional(),
  year: z.union([z.number(), z.string()]).optional(),
  type: z.enum(['kniha', 'clanek', 'pdf', 'odkaz', 'wiki', 'mapa']).optional(),
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
    lastModified: z.string().nullable(),
    sourceCharset: z.string(),
    scrapedAt: z.string(),
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
        provenience: z.string().optional(),
        // Původní umístění před zařazením do sbírky (např. kostelní věž
        // odkud byl stroj vyzdvižen). Strukturované: objekt + typ + obec
        // + detail. Všechna pole optional — vyplní se co je k dispozici.
        puvodniUmisteni: z
          .object({
            objekt: z.string().optional(),     // "kostel sv. Jakuba"
            typObjektu: z.string().optional(), // "kostel" / "radnice" / "továrna"
            obec: z.string().optional(),       // "Kutná Hora"
            detail: z.string().optional(),     // "věž – jižní strana"
          })
          .optional(),
        // === Konstrukce ===
        ram: z.string().optional(),
        krokJicihoStroje: z.string().optional(),
        biciStroje: z.string().optional(),
        rozmery: z.string().optional(),
        kyvadlo: z.string().optional(),
        ciselnik: z.string().optional(),
        pohon: z.string().optional(),
        // === Spolková evidence ===
        umisteni: z.string().optional(),                    // současné umístění v Hodináriu
        majitel: z.string().optional(),                     // kdo exponát vlastní
        darceZapujcitel: z.string().optional(),             // od koho jsme dostali (často ≠ majitel)
        vztahKeSbirce: z.string().optional(),               // zápůjčka / dar / koupě / montáž
        pridanoDoSbirky: z.string().optional(),             // rok přírůstku do spolku
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
    date: z.string(),
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

export const collections = { clanky, hodinari: hodinariMedailony, kronika };
