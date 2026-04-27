# Hodinárium — webová expozice

Astro projekt sesterský k [orloj.eu](https://orloj.eu). Webová expozice
Českého spolku horologického — sbírka, projekty, expozice v Děčíně.

## Vývoj

```bash
pnpm install
pnpm dev      # http://localhost:4321 (nebo 4322 pokud 4321 obsazený)
```

## Build a deploy

```bash
pnpm build    # produkční build do dist/
pnpm preview  # lokální preview produkčního buildu
```

Build čas: ~12 s (228 stránek). Velikost dist: ~117 MB (z toho 71 MB obrázky).

## Cloudflare Pages deploy

Předpoklady:
1. Repo na GitHubu (recommended) nebo GitLabu, napojené na Cloudflare účet.
2. V Cloudflare dashboardu **Workers & Pages → Create → Pages → Connect to Git**.

Build settings:
- **Framework preset**: Astro
- **Build command**: `pnpm install && pnpm --filter hodinarium-eu build`
- **Build output directory**: `apps/hodinarium-eu/dist`
- **Root directory**: `/` (monorepo root)
- **Environment variables**: `NODE_VERSION=22`

Po prvním deploy dostaneš URL `hodinarium-eu.pages.dev`. Custom doménu
`hodinarium.eu` napojíš v **Custom domains** → Cloudflare DNS přepojí
automaticky.

## Co je kde

```
src/
├── styles/global.css           — design systém (paleta, fonty, layouty)
├── layouts/
│   ├── Base.astro              — header, footer, search modal
│   └── Article.astro           — detail článku se sidebarem (object number, related)
├── components/
│   ├── Card.astro              — atlas karta s thumbnailem
│   └── SearchModal.astro       — Cmd+K fuzzy search (fuse.js)
├── data/
│   ├── catalog.json            — generovaný katalog (z scripts/build-catalog.ts)
│   ├── lokace.ts               — souřadnice 26 lokací pro mapu
│   ├── milniky.ts              — 17 milníků pro časovou osu
│   └── kategorie.ts            — kurátorská metadata sekcí
└── pages/
    ├── index.astro             — homepage s hero, statistikami, featured
    ├── atlas.astro             — vizuální mřížka 218 článků s filtry
    ├── mapa.astro              — Leaflet + OpenStreetMap, sépiové dlaždice
    ├── casova-osa.astro        — vertikální časová osa
    ├── 404.astro               — vlastní 404
    ├── [kategorie].astro       — generická landing pages (sbírka, projekty, …)
    ├── spolek/index.astro      — formální landing spolku (výbor, dokumenty)
    └── clanky/
        ├── index.astro         — index všech článků seskupený podle kategorie
        └── [slug].astro        — detail článku (z content collection)

public/
├── img/                        — 1579 obrázků stažených z hodinarium.eu (71 MB)
├── _redirects                  — 218 mapping starých .htm URL → nové slugy
├── _headers                    — security & caching pro Cloudflare Pages
├── robots.txt
└── (sitemap-index.xml + sitemap-0.xml se generují při buildu)
```

Zdroj obsahu článků: `../../content/hodinarium-eu/*.md` (sdílené s
`apps/orloj-eu` v budoucnu).

## Funkce

### Pro návštěvníka
- **Atlas** vizuálního katalogu 218 hodin s filtry per kategorie
- **Mapa** 26 věží a expozic (Leaflet + sépiové OSM dlaždice)
- **Časová osa** 17 milníků 1410–2025
- **Search** — Cmd+K / Ctrl+K / `/` modal, fuse.js fuzzy search
- **Detail** s muzejním sidebar (object number, kategorie, datace, vystaveno…)
- **Související exponáty** + cross-references na mapu/osu
- **Lightbox galerie** s ←→ ESC ovládáním
- **Drop cap** na první písmeno článku
- **Light/dark mode** automatický podle OS preferencí

### Pro spolek
- **Vlastní /spolek landing** — formální dokumentový vzhled
- **Výbor**, **stanovy**, **hospodaření 2016–2019**, **zápisy ze schůzí**
- **Footer s 4-sloupcovou navigací** (Muzeum / Spolek / Externě / Kontakt)

### Technické
- Plně **statický build** (Cloudflare Pages, neomezený traffic zdarma)
- **Sitemap** automaticky generovaný (218 URL)
- **301 redirecty** ze starých `.htm` URL
- **Open Graph + Twitter Card** meta na každé stránce
- **A11y**: skip-link, ARIA landmarks, sémantické HTML5, focus-visible
- **Print stylesheet** s academic citation odkazy
- **`prefers-reduced-motion`** + **`forced-colors`** podpora
- **Mobile**: hamburger menu, touch targets ≥ 44 px, safe-area-inset

## Skripty (v root monorepo)

```bash
pnpm scrape:hodinarium    # stahne 219 stránek z hodinarium.eu
pnpm convert:hodinarium   # HTML → Markdown s frontmatterem
pnpm catalog:hodinarium   # postaví catalog.json (thumbnails, excerpty, roky)
```

A samostatně:

```bash
pnpm exec tsx scripts/download-assets.ts    # stáhne obrázky lokálně
pnpm exec tsx scripts/build-redirects.ts    # vyrobí _redirects ze scrape indexu
```

## Stack

- **[Astro 5](https://astro.build)** — statický generátor
- **[Tailwind CSS 4](https://tailwindcss.com)** — styling
- **[fuse.js](https://fusejs.io)** — client-side fuzzy search
- **[Leaflet](https://leafletjs.com) + OpenStreetMap** — mapa
- **[Spectral](https://fonts.google.com/specimen/Spectral)** — single typografický rod
- **TypeScript strict mode**
