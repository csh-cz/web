---
name: clanky-konvence
description: Konvence pro psaní a editaci článků v Astro monorepu orlojWeb (hodinarium-eu, horologie-cz). Aktivuje se při editaci .md/.mdx v content/hodinarium-eu/ nebo content/horologie-cz/, při tvorbě/úpravě komponent v apps/*/src/components/, při psaní frontmatteru (perex/tldr, author, references), při vkládání obrázků s creditem, při formátování odkazů (wiki, mapy, PDF), při řešení layoutu článku (hero, float images, mezititulky, single * * *) a při kontrole deploymentu na Cloudflare Pages.
---

# Konvence článků a layoutu — hodinarium-eu / horologie-cz

Tenhle skill drží všechna pravidla, na kterých se s Davidem dohodli pro Astro články spolku ČSH. Default platí pro **hodinarium-eu** (větší archiv, MDX-ready); kde je rozdíl, je explicitně označený jako "horologie-cz" / "hodinarium-eu".

## 1. Frontmatter článku

Aktuální schema (z `apps/hodinarium-eu/src/content.config.ts`):

```yaml
---
title: "..."                    # POVINNÝ; bez **markdown** — frontmatter neparsuje markdown
slug: "..."
category: "decin" | "vezni-hodiny" | "sbirka" | "projekty" | "ostatni"
originalUrl: "https://hodinarium.eu/...htm"   # legacy zdroj (POVINNÝ)
lastModified: "RFC date | null"
sourceCharset: "windows-1250"
scrapedAt: "ISO timestamp"

tldr: "Stručné shrnutí pro perex"  # OPT — pokud chybí a článek má ≥300 slov,
                                     # auto z catalog.excerpt jako kurzívní úvod

author: "Petr Král"             # OPT — byline ho zobrazí jako "P. Král"
                                  # (helper formatAuthor strip "Ing./Dr./Mgr./…")

references:                     # OPT — sekce "Literatura a odkazy" pod článkem
  - title: "Název"
    url: "https://..."          # OPT — bez = jen text
    author: "Autor díla"        # OPT
    year: 2014                  # OPT — number nebo string
    type: kniha | clanek | pdf | odkaz | wiki | mapa   # OPT — default odkaz
    note: "doplňující text"     # OPT

ogImage: "/img/..."             # OPT — přepíše default OG template
thumbnail: "/img/..."           # OPT — přepíše první-image v atlas/katalog

manualEdit: true                # OPT — flag že článek byl ručně editován
---
```

**Schéma je shared mezi všemi články.** Měnit ho znamená update `content.config.ts` plus migrovat existující články. Před přidáním nového field zkontroluj, jestli ho opravdu chceš mít versioned across všechny stávající.

## 2. Hero obrázek

**Pravidlo:** první `<img>` v článku se automaticky stane hero (full šířka 72ch sloupce, žádný float, margin-bottom 2.25rem). Logika je v `apps/hodinarium-eu/src/pages/clanky/[slug].astro` (script `setup()`).

- Auto-promote přidá class `img-hero` jen pokud první img **nemá** žádnou z manuálních class: `img-hero` | `img-full` | `img-standalone` | `img-skip-hero`.
- Markdown `![alt](src)` jako první obrázek = automatic hero. **Preferovaný způsob.**
- Pokud chceš první img přeskočit jako hero (např. malou ikonku), přidej `class="img-skip-hero"`.

**Post-hero guard:** za hero MUSÍ následovat text. Skript automaticky:
- Zjistí, zda hned po hero přijde block obsahující jen velký obrázek (img-large/full/standalone/hero) bez textu.
- Pokud ano, **přesune ho** za první následující paragraf s textem (>50 znaků).
- Tj. v MDX můžeš mít dva `![]()` po sobě, JS to vyřeší — nicméně pro stabilitu ideálně **piš v pořadí: hero → text → další obrázek**.

## 3. Obrázky v textu

| Velikost (z image-sizes.json) | CSS chování | Kdy |
|---|---|---|
| `img-small` (≤ ~200px) | float — alternuje pravo/levo | drobné obrázky v textu |
| `img-medium` (~320px) | float — alternuje pravo/levo | běžné fotky |
| `img-tall` (úzké vysoké) | float — alternuje pravo/levo | portréty, schémata |
| `img-large` (široké) | standalone block, na střed | dokumenty, panoramata |
| `img-full` | standalone, plná šířka článku | manuální override |
| `img-standalone` | standalone, max 480px | manuální override |
| `img-hero` | full šířka článku, no margin top | první obrázek (auto) |

**Rytmus floatable obrázků:** JS counter střídá `img-float-right` / `img-float-left` deterministicky. Photo komponenta (figure.photo) je z rytmu vyloučena — zůstává standalone.

**Mobile (≤600px):** vše standalone — float vypnutý vždy.

## 4. Photo komponenta — preferovaný způsob

Cesta: `apps/hodinarium-eu/src/components/Photo.astro`.

**Pravidlo:** **Pro nové obrázky** používat `<Photo />` místo markdown `![alt](src)`. Důvody:
- Konzistentní místo pro credit/copyright caption (`.img-credit` styl)
- Bez credit polí se chová jako prostý `<img>` — caption se nerenderuje
- `class` prop se propaguje na `<img>` (img-hero, img-large, atd.)
- Snadno se v budoucnu doplní credit u obrázku, který ho zatím nemá

```mdx
import Photo from '../../apps/hodinarium-eu/src/components/Photo.astro';

<Photo
  src="/img/cesta/foo.jpg"
  alt="Popis pro screen readery"
  class="img-hero"          // OPT — jakákoliv článková class
  author="Øyvind Holmstad"  // OPT
  authorUrl="https://..."   // OPT
  license="CC BY-SA 3.0"    // OPT
  licenseUrl="https://..."  // OPT
  sourceUrl="https://..."   // OPT (Commons file page)
  year={2014}               // OPT
/>
```

Pokud `class="img-hero"` nedáš a Photo je první v článku, JS auto-promote ho udělá hero stejně. Manuální `class="img-hero"` je explicit a ani slug.astro skript ho nepřepíše.

## 5. Wikipedia / Wikimedia Commons odkazy

**Pravidlo:** wiki/commons odkazy primárně do `references:` v frontmatter s `type: wiki`. V textu jen tehdy, když věta organicky odkazuje na pojem (např. „[Hebrejská abeceda](wiki) má specifický číselný systém").

**„Dovětkový" link** (závorka „více ve wiki", „další info na wiki") **vždy** pryč z textu do references.

CSS automaticky přidá drobnou měděnou ⓦ ikonku za každý wiki/commons link v `.prose-content` i v `.references-list` — selektor URL pattern `wikipedia.org/wiki/` a `wikimedia.org/wiki/`.

## 6. Odkazy na mapy

**Pravidlo:** odkazy na mapové služby (mapy.cz, google.com/maps, openstreetmap.org, goo.gl/maps) dostávají automatic pin ikonku za textem (CSS mask trick, copper barva). Aplikuje se v textu i v references.

V `references` použij `type: mapa` — v references-list dostane pin ikonu místo default tečky.

## 7. PDF embed — PdfPager komponenta

Pro PDF brožury / dokumenty v článku **NE iframe** ale `<PdfPager>`:

```mdx
import PdfPager from '../../apps/hodinarium-eu/src/components/PdfPager.astro';

<PdfPager
  src="/download/foo.pdf"
  title="Název dokumentu"
  pages={76}                 // OPT — initial label, finální dotahá z PDF.js
/>
```

PDF.js z jsDelivr CDN, page-by-page navigace, fit-to-width (žádné šedé okraje). Fallback link na stažení/otevření v novém okně, pokud CDN selže nebo JS nepoběží.

## 8. Mezititulky a struktura

- **Mezititulky → markdown `## Heading` (h2) nebo `### Subheading` (h3)**, **nikdy** `**bold paragraph**`. Globální `global.css` h2/h3 styly poskytují jednotný design.
- h2 = serif 500, copper subtle underscore vlevo dole
- h3 = brass 600, menší
- **Sekvenční mezititulek se zachová auto-anchor `id` z slugu nadpisu**

## 9. Horizontální oddělovače

Pravidlo: **vždy jen jeden** `* * *` mezi sekcemi. Vícenásobné `* * *` po sobě (legacy import často) **collapse na jeden**.

Skript `scripts/build-favicon.ts` je příklad; pro hromadný cleanup HRs napříč všemi články použij Python script (frontmatter-aware: ignoruje opening/closing `---` YAML delimiteru).

## 10. Autor v byline

`author: "Petr Král"` v frontmatter → byline pod článkem ukáže **„P. Král"** (helper `formatAuthor` v `Article.astro`):

- Strip `Ing.|Dr.|Mgr.|MUDr.|RNDr.|JUDr.|PaedDr.|MgA.|prof.|doc.`
- Vezme první písmeno křestního jména (uppercase) + `". "` + příjmení
- Pokud je první část už iniciála („P." nebo „P"), normalizuje
- Příklady: `Petr Král` → `P. Král`, `Ing. Petr Král` → `P. Král`, `P. Král` → `P. Král`

**Atribuci nedávat do textu článku** (typicky na konci „Petr Král"). Patří do `author:` ve frontmatter, byline ji zobrazí pod článkem. Při refactoru existujícího článku strip atribuci z těla.

## 11. Perex / abstract

- `tldr: "..."` v frontmatter → vyrenderuje s prefixem **„Stručně: ..."**
- Pokud `tldr` chybí a článek má ≥300 slov (z `catalog.json` `wordCount`), auto-perex z `excerpt` (~200 znaků z prvního paragrafu) jako kurzívní úvod **bez prefixu**
- Krátké články (<300 slov) zůstávají bez perexu

Pro vlastnoručně psaný perex preferuj `tldr` ve frontmatter — auto-extract není vždy informativní.

## 12. Title nesmí obsahovat markdown

Frontmatter neparsuje markdown. `title: "**X**"` se vyrenderuje literálně s hvězdičkami v `<h1>`. Strip vždy.

## 13. Hodinarium-eu deployment URL

Ke dnešku **2026-04-29** nový Astro web žije na `https://hodinarium-eu.pages.dev`. Doména `hodinarium.eu` je **stále legacy PHP** (Petrovy programy `PRS2.php`, `PRS10_text.php`, `arduino2_polarizace.php`, /download/...).

**Při psaní zpráv pro spolupracovníky:**
- Test URL nového webu → `hodinarium-eu.pages.dev`
- Petrovy legacy PHP endpointy → `hodinarium.eu` nebo `www.orloj.eu`

Po DNS přepnutí tento bod aktualizovat.

## 14. Build a deploy

**Cloudflare Pages** spouští `pnpm build` (= `astro check && astro build`). Pokud `astro check` selže (jakákoliv ts chyba), **deploy nedoběhne** a všechny commity od posledního zelené buildu visí.

**Lokálně** vždy `pnpm build` (NE `npx astro build` — ten skipuje `astro check` a propustí ts chyby, které pak rozbijí CF deploy).

Když CF zaseknutý: zkontroluj `Cloudflare dashboard → Pages → hodinarium-eu/horologie-cz → Deployments` na poslední failed build a chybu.

## 15. Migrace existujících článků

Hromadná migrace 200+ legacy `.md` → MDX a strukturní pravidla = velký job. **Nedělat hromadně** — postupně při editaci článku doplnit:
- `author: "..."` ve frontmatter (a strip atribuci z těla)
- `references:` s wiki/mapa/pdf odkazy z těla
- Markdown `![alt](src)` → `<Photo>` u obrázků s atribucí
- `**bold subhead**` → `## subhead`
- Single `* * *` (collapse duplicit)

## 16. Odkazy užitečné pro práci s repem

- Skript `scripts/build-image-index.ts` — regeneruje `image-sizes.json` po přidání obrázku do public/img/
- Skript `scripts/build-favicon.ts` (`pnpm favicon:build`) — favicon a homescreen ikony z logo-csh.svg
- `scripts/build-catalog.ts` — generuje `catalog.json` (excerpt, wordCount, year, …)
- Skript pro hromadný cleanup HRs — viz Python inline v conversation history (frontmatter-aware HR collapse)

## 17. Kdy spawnovat `cestina` skill

Při delším českém textu článku (popis, perex, references title, sekce) je užitečné nechat ho zkontrolovat skillem **cestina** — odstraní AI-tells, slovakismy, anglicismy a opravu české typografie (uvozovky, pomlčky, mezery u jednotek).

Triggery: psaní `tldr`, `note` v references, dlouhé sekce v `<Photo>` alt textu, věty s technickým názvoslovím, kde Claude může klouznout do anglicismů.
