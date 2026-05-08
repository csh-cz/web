# Contributing — CSH Web

Technický runbook pro přispěvatele do `csh-cz/web` (hodinarium.eu +
horologie.cz). Pokud nemáš zájem o git/kód, viz
[**PRO-CLENY.md**](PRO-CLENY.md).

## Předpoklady

- Git + GitHub účet (přístup k repu `csh-cz/web` — David přidá)
- Node.js 22+
- pnpm 10+
- Editor (VS Code recommended, ale stačí cokoli)

## Setup

```bash
git clone git@github.com:csh-cz/web.git
cd web
pnpm install
pnpm --filter hodinarium-eu dev   # http://localhost:4321
```

Build vyzkoušíš lokálně `pnpm --filter hodinarium-eu build` (pokud
selže `astro check`, deploy by failoval taky — fix lokálně).

## Workflow

```bash
git checkout -b moje-zmena            # větvi z main
# ... edit ...
pnpm --filter hodinarium-eu build     # ověř TS + build
git add . && git commit               # commit
git push origin moje-zmena            # push
gh pr create                          # PR (gh CLI) nebo přes web GitHubu
```

Po merge do `main` se Cloudflare Pages automaticky deployne (~30 s
build, ~1 min hot na CDN).

## Co kde editovat

### Články o hodinách → `content/hodinarium-eu/<slug>.md`

Standardní MDX s frontmatterem:

```yaml
---
title: "Název článku"            # bez markdown
slug: "kebab-case-slug"
category: "sbirka"               # nebo: konstrukce, projekty,
                                 # virtualni-muzeum, muzea, zajimavosti
originalUrl: "https://hodinarium.eu/<slug>.htm"
lastModified: "2024-03-15T12:00:00.000Z"
sourceCharset: "windows-1250"
scrapedAt: "2026-04-29T10:00:00.000Z"

# Volitelné, často používané:
tldr: "Stručně 1–2 věty perex"      # vyrenderuje rámeček
author: "Petr Král"                  # byline „P. Král"
tags: [vezni, restaurovane, 1900s]   # whitelist v data/tags.json
references:
  - bibKey: "knesplProgressVersusTradition2024"   # Zotero (preferred)
  - title: "Ad-hoc reference"
    url: "https://..."
    type: kniha | clanek | pdf | odkaz | wiki | mapa | patent
draft: true                          # variant A draft mode
---
```

### Hodináři → `content/hodinari/<slug>.mdx`

Pro každý medailon. Frontmatter má `typ: 'osoba' | 'firma'`, `obdobi`,
`mesto`, `aliasy`, `shrnuti`, atd. — viz
[`apps/hodinarium-eu/src/content.config.ts`](../apps/hodinarium-eu/src/content.config.ts).

### Soupis věžních hodin → `content/soupis-veznich-hodin/<slug>.md`

Strukturované záznamy lokality. Slug typicky `<rok>-<misto>-<hodinar>`.
Pole jako `puvodniMisto`, `souradnice`, `stav`, `chod`, `prameny`.

### Slovník → `content/slovnik/<slug>.md`

Sync z user-scope skillu `~/.claude/skills/horologicka-terminologie/`
přes `pnpm slovnik:build`. **Ručně needituj** — změny se přepíšou při
re-syncu. Místo toho edituj source v skillu.

## Konvence pro psaní (klíčové)

### 1. Title bez markdown

`title: "**X**"` se vyrenderuje literálně. Strip vždy.

### 2. Hero obrázek

První `<img>` v článku se automaticky stane hero (full šířka, no float).
Markdown `![alt](src)` jako první obrázek = automatic hero. Preferovaný
způsob.

### 3. `<Photo>` komponenta s creditem

Pro obrázky s kreditem (autorský zdroj, licence) **používej `<Photo>`**
místo `![]()`:

```mdx
import Photo from '../../apps/hodinarium-eu/src/components/Photo.astro';

<Photo
  src="/img/cesta/foo.jpg"
  alt="Popis pro screen readery"
  author="Øyvind Holmstad"
  license="CC BY-SA 3.0"
  sourceUrl="https://commons.wikimedia.org/wiki/File:..."
  year={2014}
/>
```

**Pravidlo:** vždy zdroj a copyright. Pokud autor neznámý:
`author="autor neznámý"` nebo `author="Z archivu ČSH"`.

### 4. Wiki/mapa odkazy → `references:`

Wikipedia, mapy.cz, Google Maps, OpenStreetMap odkazy patří do
`references:` ve frontmatteru, ne do textu (kromě případů, kde věta
organicky odkazuje na pojem). „Více ve wiki" v závorkách = pryč
z textu.

### 5. Mezititulky

Vždy `## Heading` (h2) nebo `### Subheading` (h3). **Nikdy** `**bold
paragraph**` jako pseudo-nadpis.

### 6. Horizontální oddělovače

Jen jeden `* * *` mezi sekcemi. Vícenásobné `* * *` po sobě jsou legacy
import artefakt — collapse na jeden.

### 7. Atribuce

Ne v textu článku. Místo toho:

- **Autor článku** → `author:` ve frontmatteru
- **Citace zdroje** → `references:` + ev. atribuce paragraf na konci
  (`*Text byl převzat se souhlasem z [foo](url) — za poskytnutí
  děkujeme.*`)
- **Poděkování** → atribuce paragraf na konci (`*Za informace
  děkujeme A. Paříkovi.*`)

Iniciála + příjmení (jako u byline): „P. Skála", „A. Pařík".

### 8. Tagy

Whitelist v
[`data/tags.json`](../apps/hodinarium-eu/src/data/tags.json). Typo →
build fail. Nový tag = PR commit do `tags.json`.

### 9. Čeština

Texty editovat v češtině. AI překlady do EN řešíme samostatně (zatím
jen `en.astro` summary). Pro typografii (uvozovky, pomlčky, mezery
u jednotek) sáhneme po skill `cestina` přes Claude Code, není ručně
povinné.

## Build pipeline (proč to skipovat)

Před `astro build` běží:

1. `validate-content.mjs` — Zod validace všech 6 collections
2. `build-review-report.ts` — review JSON pro `/redakce/`
3. `generate-image-formats.ts` — AVIF/WebP variants

**Pokud TS nebo Zod selže, deploy nepoběží.** Lokálně proto vždy
`pnpm --filter hodinarium-eu build`, ne `npx astro build` (ten skipuje
check).

## Časté skripty

```bash
pnpm catalog:hodinarium     # rebuild data/catalog.json
pnpm refs:sync              # Zotero → references.json
pnpm slovnik:build          # SSOT skill → content/slovnik/
pnpm slovnik:auto-link      # auto-link slovník v MD/MDX
pnpm hodinari:detect        # cross-ref hodinářů
pnpm imgvariants:build      # AVIF/WebP variants (3 min)
pnpm og:check               # audit OG coverage (read-only)
pnpm search:rebuild         # corpus + embed (semantic search)
```

## Cloudflare Pages — co dělat když se zasekne

CF Pages CI spouští `pnpm install && pnpm --filter <app> build`. Pokud:

- **Build failne** → otevři Cloudflare dashboard → Pages → hodinarium-eu
  → Deployments → najdi failed → klik na Build log
- **TS/Astro check error** → fix lokálně, push, CI retryuje
- **Pages limit přerušen** → 500 builds/měsíc free tier; lze pauzovat
  nebo upgrade

## Audit reporty (pro orientaci)

- [`docs/a11y-audit-hodinarium-2026-05-08.md`](a11y-audit-hodinarium-2026-05-08.md)
  — WCAG 2.1 AA audit
- [`docs/design-followups-hodinarium-2026-05-08.md`](design-followups-hodinarium-2026-05-08.md)
  — design / engineering follow-ups
- [`docs/tech-debt-hodinarium-2026-05-08.md`](tech-debt-hodinarium-2026-05-08.md)
  — tech-debt inventář (8 položek)

## Plný runbook pro Astro projekty

Detailní architektura, content collections, CMS pipeline, semantic
search, deployment:
[`apps/hodinarium-eu/README.md`](../apps/hodinarium-eu/README.md)
(410 řádků).

## Otevřený TODO

[`TODO.md`](../TODO.md) v rootu — strukturováno na **Část A** (autonomně
proveditelné) vs **Část B** (čeká na input).

## Kontakt

- **Maintainer:** David Knespl ([info@orloj.eu](mailto:info@orloj.eu))
- **Obsahový kurátor:** Petr Král
- **GitHub:** [csh-cz/web](https://github.com/csh-cz/web)
