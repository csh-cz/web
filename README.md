# CSH Web — Monorepo

Webové projekty Českého spolku horologického z. s.

| Aplikace | Doména | Stav |
|---|---|---|
| [`apps/hodinarium-eu`](apps/hodinarium-eu/) | [hodinarium.eu](https://hodinarium.eu) | webová expozice, 218 článků, atlas, mapa, časová osa |
| [`apps/horologie-cz`](apps/horologie-cz/) | [horologie.cz](https://horologie.cz) | spolková agenda, stanovy, akce, dokumenty, sponzoring |

## Stack

- **[Astro 5](https://astro.build)** — statický generátor
- **Tailwind CSS 4** — styly
- **TypeScript strict** — typová bezpečnost
- **pnpm 10 workspace** — monorepo
- **Cloudflare Pages** — hosting (zdarma)

## Struktura monorepa

```
.
├── apps/
│   ├── hodinarium-eu/       Astro app pro hodinarium.eu
│   └── horologie-cz/        Astro app pro horologie.cz
├── content/                 Sdílený obsah (Markdown články)
│   ├── hodinarium-eu/       — 218 článků o hodinařině
│   └── horologie-cz/        — 10 článků spolkové agendy
├── scripts/                 Build a migrační skripty (TypeScript)
│   ├── scrape-hodinarium.ts — scrape ze starého webu
│   ├── convert-hodinarium.ts— HTML → Markdown s frontmatterem
│   ├── build-catalog.ts     — generuje thumbnaily, excerpts, roky
│   ├── download-assets.ts   — stáhne obrázky lokálně
│   ├── build-redirects.ts   — _redirects pro Cloudflare Pages
│   ├── build-og-images.ts   — 235 OG images per article
│   └── upgrade-thumbnails.ts— nahradí náhledy velkými verzemi
├── packages/                Shared (zatím prázdné)
└── zdroje/                  Originální PDF, dokumenty mimo git
```

## Lokální vývoj

```bash
# Instalace závislostí (jednou)
pnpm install

# Dev server hodinarium.eu (dynamic port, viz log)
pnpm dev:hodinarium

# Dev server horologie.cz
pnpm --filter horologie-cz dev
# (běží na portu 4400)

# Production build
pnpm build:hodinarium
pnpm --filter horologie-cz build

# Lokální preview produkčního buildu
pnpm preview:hodinarium
```

## Migrační pipeline (jednorázové)

```bash
# Stáhnout starý web hodinarium.eu (~200 stránek)
pnpm scrape:hodinarium

# Konvertovat HTML → Markdown s frontmatterem
pnpm convert:hodinarium

# Postavit katalog (thumbnaily, excerpty, roky)
pnpm catalog:hodinarium

# Stáhnout obrázky lokálně (~1500 souborů, 60 MB)
pnpm download:hodinarium

# Vyrobit _redirects mapu pro Cloudflare Pages
pnpm redirects:hodinarium

# Vyrobit OG images (235 PNG)
pnpm og:build

# Nebo všechno najednou:
pnpm pipeline:hodinarium
```

## Deploy na Cloudflare Pages

### Přes git (doporučeno)

1. Push tohoto repa na GitHub
2. V Cloudflare dashboardu **Workers & Pages** → **Create** → **Pages**
   → **Connect to Git**
3. Pro **každou aplikaci** zvlášť vytvoř Pages projekt:

   **hodinarium-eu**:
   - Build command: `pnpm install && pnpm --filter hodinarium-eu build`
   - Build output: `apps/hodinarium-eu/dist`
   - Root directory: `/`
   - Environment: `NODE_VERSION=22`

   **horologie-cz**:
   - Build command: `pnpm install && pnpm --filter horologie-cz build`
   - Build output: `apps/horologie-cz/dist`
   - Root directory: `/`

4. Custom domény napojíš v **Custom domains** v každém projektu.

### Přes wrangler CLI (alternativa)

```bash
pnpm dlx wrangler pages deploy apps/hodinarium-eu/dist --project-name=hodinarium-eu
pnpm dlx wrangler pages deploy apps/horologie-cz/dist  --project-name=horologie-cz
```

## Členové výboru CSH (pro kontext)

- **Petr Král** (předseda) — hlavní autor obsahu
- **Miroslav Baudisch** (pokladník)
- **David Knespl** (člen výboru) — tento rewrite

## Licence

Texty a obsah pod [Creative Commons Attribution 4.0 International (CC BY 4.0)](LICENSE).

Software (kód aplikací, skripty) — viz `package.json` jednotlivých balíčků.

Logo Českého spolku horologického — použití pouze s výslovným souhlasem
spolku (info@orloj.eu).
