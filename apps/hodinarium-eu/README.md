# Hodinarium-eu — webová expozice

Astro web Českého spolku horologického z. s. (ČSH). Sbírka, expozice
v Děčíně, články o hodinařině, hodináři, soupis věžních hodin, kronika,
hodinové kroky, hodinářský slovník.

**Sesterský web:** [`apps/horologie-cz`](../horologie-cz/) — spolková
identita, dokumenty, akce, sponzoring (oddělená codebase, sdílené Astro
patterny).

**Aktuální URL:** `https://hodinarium-eu.pages.dev` (po DNS přesunu →
`https://hodinarium.eu`).

---

## Stack

- **[Astro 5](https://astro.build)** + MDX + Tailwind CSS 4
- **TypeScript strict mode**
- **pnpm 10** workspace (monorepo)
- **Cloudflare Pages** + **Pages Functions** + **Workers AI**
  + **CF Access** + **R2** (asset storage)

## Build velikost

- **38 page routes** v `src/pages/` → **1174 stránek** static output
- **dist/ ≈ 1.1 GB** (z toho ~95 % image variants — AVIF/WebP/JPEG)
- **Content:** 1058 entries napříč 6 collections

---

## Local development

```bash
# Z root monorepa
pnpm install
pnpm --filter hodinarium-eu dev      # http://localhost:4321
pnpm --filter hodinarium-eu build    # → dist/, ~12–14 s
pnpm --filter hodinarium-eu preview  # statický preview
```

**Build pipeline (běží před `astro build`):**

1. `validate-content.mjs` — Zod schema validace všech collections
2. `build-review-report.ts` — agreguje editor notes + isStub flagy do
   `_review.json` pro `/redakce/` panel
3. `generate-image-formats.ts` — sharp převede public/img/* na
   AVIF + WebP variants (slouží `rehype-picture`)
4. `astro check && astro build` — TS + Astro

**Cloudflare Pages CI** spouští `pnpm build`. TS chyba v `astro check`
zablokuje deploy. Lokálně proto **vždy `pnpm build`**, nikoli
`npx astro build` (ten skipuje check).

---

## Content collections (6)

Definované v [`src/content.config.ts`](src/content.config.ts), Zod schema
+ glob loadery z `../../content/<collection>/`:

| Collection | Entries | URL pattern | Účel |
|---|---:|---|---|
| `clanky` | 495 | `/<kategorie>/<slug>` | Hlavní článková báze (kategorie: sbirka, konstrukce, projekty, virtualni-muzeum, muzea, zajimavosti) |
| `hodinari` | 103 | `/hodinari/<slug>` | Medailony hodinářů a hodinářských firem (osoba/firma) |
| `kronika` | 23 | `/kronika/<slug>` | Vernisáže, fotoreporty, sezóny, akvizice — chronologický feed událostí |
| `kroky` | 10 (reg.) + 1 MDX | `/kroky/<slug>` | Hodinové kroky (escapements). Hybrid: registry v `data/kroky.ts` + volitelný MDX v `content/kroky/` |
| `soupis-veznich-hodin` | 392 | `/soupis-veznich-hodin/<slug>` | Soupis existujících i ztracených věžních hodin v ČR |
| `slovnik` | 35 | `/slovnik/<slug>` | Hodinářský výkladový a překladový slovník (cs / de / en / fr s primárními prameny) |

**Hybrid pattern (kroky):** `data/kroky.ts` drží stable registry (slug,
jméno, datum, vynálezce, related). MDX entry v `content/kroky/<slug>.mdx`
přidává plný technický článek; pokud chybí, page fallbackuje na
charakteristiku z registry.

**SSOT pro slovník:** `~/.claude/skills/horologicka-terminologie/reference/slovnik.md`
v user-scope skillu. Sync přes [`pnpm slovnik:build`](../../scripts/build-slovnik.mjs).

---

## Routing & layouts

```
src/pages/
├── index.astro              — homepage (hero, vybrané exponáty, atlas, mapa, kronika)
├── 404.astro
├── vice.astro               — rozcestník sekundárních sekcí
├── o-hodinariu.astro        — about page (Article.astro layout)
├── pro-navstevniky.astro    — návštěvnické info (otevírací doba, doprava)
├── licence.astro
├── en.astro                 — anglické summary
├── og-preview.astro         — interní preview OG image templates
├── rss.xml.ts               — RSS feed pro kroniku + články
│
├── [kategorie]/             — generická kategoriální landing + slug pages (clanky)
│   ├── index.astro
│   └── [slug].astro         — přes Article.astro layout
├── sbirka/
│   ├── index.astro          — sbírka landing
│   ├── katalog.astro        — filterovatelný katalog s thumbnaily
│   └── karta/[slug].astro   — evidenční karta (KartaSbirky komponenta)
├── hodinari/{index,[slug]}.astro
├── soupis-veznich-hodin/
│   ├── index.astro          — tabulka s filtry
│   ├── mapa.astro           — Leaflet mapa lokalit
│   └── [slug].astro
├── kronika/[slug].astro
├── kroky/{index,[slug]}.astro
├── slovnik/{index,[slug]}.astro
├── tagy/{index,[tag]}.astro — tag-based discovery
├── mapa.astro               — mapa původu exponátů + expozice
├── mapa-horologie.astro     — Evropa-wide horologická mapa
├── casova-osa.astro         — milníky 600 let hodinařiny
├── expozice.astro           — seznam expozic + orloje
└── redakce/                 — editor-only dashboards (CMS, drafty, reports)
```

**Layouts:**

- [`layouts/Base.astro`](src/layouts/Base.astro) — head, nav, footer,
  search modal, JSON-LD organization, Schema.org breadcrumbs, robots
  meta (DEV STATE noindex pre-DNS-switch)
- [`layouts/Article.astro`](src/layouts/Article.astro) — universal
  článková wrapper (eyebrow, title, byline, hero, prose-content,
  references, related). Užívá `[kategorie]/[slug]` a `o-hodinariu`.
  Karta/hodinari/kronika/soupis/kroky/slovnik mají vlastní layouty
  s odlišnou info hierarchy (`KartaSbirky` komponenta, překlady tabulka,
  …) — viz tech-debt TD4 pro analýzu duplicity.

**Draft mode (varianta A — client-side hide):** Frontmatter
`draft: true` u článků v `clanky` collection. CSS rule
`article[data-draft="true"] > *:not(.draft-placeholder) { display: none }`
schová obsah pro anonymního návštěvníka. Editor mode
(`body[data-editor-mode]`) reveal odkrývá. Sitemap, RSS, search index
a kategorie/tag indexy drafty filtrují.

---

## API surface — Pages Functions

V [`functions/api/`](../../functions/) (root monorepa, sdílené):

| Endpoint | Účel | Auth |
|---|---|---|
| `POST /api/report-issue` | Modal „Nahlásit problém" → vytvoří GitHub issue přes Octokit | CF Access cookie |
| `GET /api/admin/reports` | Editor dashboard `/redakce/` agregace issues | CF Access cookie |
| `GET /api/search/semantic` | Sémantické vyhledávání přes Workers AI embeddings | Public |
| `ALL /api/cms/[[path]]` | Sveltia CMS proxy (auth, GitHub commits) | CF Access cookie |

CF Access policy chrání `/api/cms/*` a `/api/admin/*` (allow-list emailů
v dashboardu). `Cf-Access-Authenticated-User-Email` header je SSOT
identity v handlerech.

---

## Sveltia CMS pipeline

Editor flow:

1. Editor jde na `/admin/` → CF Access magic-link na e-mail
2. Sveltia CMS (single-page app) běží v prohlížeči, fetchuje
   `/api/cms/auth/user` → identifikuje editora
3. Edit MDX → form submit → `POST /api/cms/api/v...` → server commituje
   přes Octokit do GitHub repu (master branch)
4. CF Pages CI rebuilduje a deployuje (~30 s)

**Editor mode** se aktivuje, pokud `/api/cms/auth/user` vrátí 200
(authenticated). Inline script v `Base.astro` nastaví
`body[data-editor-mode="true"]` → CSS reveal:

- Editor notes (`.editor-note`) jsou viditelné
- FAB stack vpravo dole (Upravit, Nahlásit problém)
- Draft articles plně viditelné

Anonymní návštěvník nic z editor toolingu nevidí.

---

## Semantic search (Workers AI)

**Model:** `@cf/baai/bge-m3` (multilingual, 768-dim embeddings, query
latency <100 ms).

**Build pipeline:**

1. [`scripts/extract-search-corpus.mjs`](../../scripts/extract-search-corpus.mjs)
   → korpus všech collections (clanky, karty, hodinari, soupis, kronika)
   do `data/search-corpus.json`
2. [`scripts/build-semantic-index.mjs`](../../scripts/build-semantic-index.mjs)
   → embedduje korpus, vyrábí `public/search/semantic-index.json`,
   deploy s assets
3. Runtime [`functions/api/search/semantic.ts`](../../functions/api/search/semantic.ts)
   embedduje query přes Workers AI, počítá cosine similarity proti
   indexu, vrací top-N

**Free tier:** 10 000 neuron-actions/den (≈ 100 000 embeddings) —
pro ČSH dost s rezervou. Při překročení: 503 + auto-fallback v
`SearchModal` na keyword (Fuse.js).

**Wrangler binding:** [`wrangler.toml`](wrangler.toml)
`[ai] binding = "AI"`. Lokální `wrangler pages dev` vyžaduje `--ai`
flag; v produkci binding přes Cloudflare dashboard.

---

## Content authoring

### Frontmatter konvence

Plná schémata v [`src/content.config.ts`](src/content.config.ts). Hlavní
patterny v [`.claude/skills/clanky-konvence/SKILL.md`](../../.claude/skills/clanky-konvence/SKILL.md):

```yaml
---
title: "Bez markdown"
slug: "kebab-case"
category: "sbirka" | "konstrukce" | "projekty" | …
tldr: "Stručně 1–2 věty"          # OPT, vyrenderuje rámeček
author: "Petr Král"                # OPT
tags: [vezni, restaurovane, …]     # whitelist v data/tags.json
references:
  - bibKey: "knesplProgressVersusTradition2024"   # → ISO 690 přes citeproc-js
  - title: "Ad-hoc reference"      # fallback bez Zotero
    url: "https://..."
    type: kniha | clanek | pdf | odkaz | wiki | mapa | patent | archiv
draft: true                        # OPT — varianta A draft mode
---
```

### References ISO 690

Bibliografické citace přes [citeproc-js](https://citeproc-js.readthedocs.io/)
+ `iso690-author-date-cs.csl` stylesheet. SSOT v
[`data/references.json`](src/data/references.json) (export ze Zotero
přes [`pnpm refs:sync`](../../scripts/sync-zotero-refs.mjs)).

V článku stačí `bibKey` (citation-key z Better BibTeX) — render se
postará o plné formátování.

### Photo komponenta

Pro nové obrázky použít `<Photo>` místo markdown `![]()`:

```mdx
import Photo from '../../apps/hodinarium-eu/src/components/Photo.astro';

<Photo
  src="/img/cesta/foo.jpg"
  alt="Popis pro screen readery"
  author="Øyvind Holmstad"      // OPT
  license="CC BY-SA 3.0"        // OPT
  sourceUrl="https://..."       // OPT (Commons file page)
  year={2014}                   // OPT
/>
```

Caption se renderuje jako overlay v pravém dolním rohu obrázku se
semi-transparentním pozadím a textovým stínem (auto-tone detected
build-time z BR rohu obrázku).

**Pravidlo:** vždy zdroj a copyright. Pokud autor neznámý, použij
`author="autor neznámý"` nebo `author="Z archivu ČSH"`.

### Image variants

`rehype-picture` plugin (`packages/rehype-picture/`) automaticky obaluje
markdown `![]()` do `<picture>` s AVIF + WebP + JPEG fallback. Variants
generuje `pnpm imgvariants:build` (sharp), gitignored, regeneruje se
v prebuild.

### Tagy

Whitelist v [`data/tags.json`](src/data/tags.json). Zod refine validuje
každý tag — typo failne build. Přidání nového tagu: PR commit do
`tags.json`.

---

## Skripty (root monorepo)

```bash
# Pipeline (jednorázové, content updaty)
pnpm catalog:hodinarium     # → data/catalog.json (excerpt, year, thumbnail)
pnpm hodinari:detect        # cross-ref hodinářů ve článcích
pnpm sbirka:relate          # backfill relatedKarty na karty

# Sync
pnpm refs:sync              # Zotero → references.json
pnpm slovnik:build          # SSOT skill → content/slovnik/*.md

# Build assets
pnpm imgindex:build         # → image-sizes.json (sharp metadata)
pnpm imgvariants:build      # AVIF/WebP variants (~3 min pro 2700 img)
pnpm og:build               # OG card templates → public/og/
pnpm favicon:build          # favicon + homescreen ikony

# Search
pnpm search:rebuild         # search:corpus + search:embed (semantic index)

# Validate
pnpm validate:content       # Zod schema validation (běží i v build)

# E2E
pnpm test:e2e               # Playwright (smoke + regression)
```

---

## Co je kde

```
apps/hodinarium-eu/
├── README.md               — tenhle soubor
├── astro.config.mjs        — Astro + integrations + draft sitemap filter
├── wrangler.toml           — CF Pages + Workers AI binding
├── package.json            — pnpm workspace member, dev/build/preview
├── tsconfig.json
├── public/
│   ├── img/                — 2700+ obrázků, AVIF/WebP variants gitignored
│   ├── _redirects          — 776 řádků 301 redirectů (legacy .htm + slug renames)
│   ├── _headers            — security + caching pro CF Pages
│   ├── robots.txt          — DEV STATE Disallow / pre-DNS-switch
│   ├── manifest.webmanifest, favicon, apple-touch-icon
│   └── search/semantic-index.json   — embeddings (gitignored, build artifact)
└── src/
    ├── content.config.ts   — Zod schémata všech 6 collections
    ├── styles/global.css   — design tokens, layout primitives, components
    ├── layouts/
    │   ├── Base.astro      — head, nav, footer, search modal, CMS hydration
    │   └── Article.astro   — universal článek wrapper
    ├── components/         — Card, Photo, Breadcrumbs, KartaSbirky, JsonLd, …
    ├── data/
    │   ├── catalog.json    — generovaný (1058 entries: title, excerpt, year, …)
    │   ├── hodinari.ts     — 103 medailonových stubů
    │   ├── kroky.ts        — 10 escapement záznamů
    │   ├── lokace.ts, milniky.ts, kategorie.ts
    │   ├── tags.json       — whitelist (PR-driven)
    │   ├── references.json — Zotero export (CSL JSON)
    │   ├── labels.ts       — categoryLabel(), kronikaTypLabel(), stavLabel()
    │   ├── url-helpers.ts  — clanekHref(), clanekHrefFromSlug()
    │   └── image-sizes.json— sharp metadata (intrinsic w/h pro lazy load)
    ├── utils/
    │   ├── cite.ts         — citeproc-js wrapper, formatCite(bibKey)
    │   ├── dialog-controls.ts  — attachDialogControls() helper
    │   ├── tinyMarkdown.ts — bezpečný inline markdown parser
    │   └── findHodinarFromVyrobce.ts
    └── pages/              — 38 routes (viz Routing výše)
```

**Sdílené v root monorepa:**

- `content/<collection>/` — MDX entries (mimo apps, čtené přes glob loader)
- `functions/api/` — CF Pages Functions (server endpoints)
- `scripts/` — build pipeline + content migration (TypeScript)
- `packages/rehype-picture/` — picture wrapper plugin

---

## Cloudflare Pages deployment

**Build settings:**

- Framework preset: **Astro**
- Build command: `pnpm install && pnpm --filter hodinarium-eu build`
- Build output directory: `apps/hodinarium-eu/dist`
- Root directory: `/` (monorepo root)
- Environment: `NODE_VERSION=22`, `PNPM_VERSION=10`

**Bindings (Cloudflare dashboard → Pages → hodinarium-eu → Settings):**

- `AI` (Workers AI) — semantic search
- (Pages Functions automaticky)

**CF Access** policy pro `/admin/*`, `/api/cms/*`, `/api/admin/*` —
allow-list editorských e-mailů (Petr, David, výbor).

Po DNS přepnutí (`hodinarium.eu` na CF Pages) vrátit:

- `astro.config.mjs` → `site: 'https://hodinarium.eu'`
- `Base.astro` → smazat DEV STATE `<meta name="robots">` bloky
- `public/robots.txt` → vrátit `Allow: /` + `Disallow: /og/ /podklady/ /redakce/ /admin/`
- Submitnout sitemapy do Google Search Console

---

## Audit reporty (v `docs/`)

- [`docs/a11y-audit-hodinarium-2026-05-08.md`](../../docs/a11y-audit-hodinarium-2026-05-08.md)
  — WCAG 2.1 AA audit, 17 nálezů. 6 quick-wins implementováno;
  zbývající v TODO A.9.
- [`docs/design-followups-hodinarium-2026-05-08.md`](../../docs/design-followups-hodinarium-2026-05-08.md)
  — 7 design / engineering follow-ups (FU1–FU7) navazujících na audit.
- [`docs/tech-debt-hodinarium-2026-05-08.md`](../../docs/tech-debt-hodinarium-2026-05-08.md)
  — TD1–TD8 inventář, prioritizovaný se file:line refy.

## Editorial konvence

- [`.claude/skills/clanky-konvence/SKILL.md`](../../.claude/skills/clanky-konvence/SKILL.md)
  — frontmatter, hero, drop cap, atribuce, references, Photo komponenta,
  legacy import patterns, deploy gotchas. **Hlavní reference pro
  authoring.**
- [`.claude/skills/clanky-tldr/SKILL.md`](../../.claude/skills/clanky-tldr/SKILL.md)
  — pravidla pro `tldr:` field (perex / abstract).
- `~/.claude/skills/horologicka-terminologie/` (user-scope)
  — primární horologická terminologie + slovník SSOT.

## TODO

[`TODO.md`](../../TODO.md) v root monorepa — strukturováno na **Část A**
(Claude autonomně) vs **Část B** (lidský vstup).
