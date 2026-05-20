---
name: obrazky
description: Pravidla pro zobrazování obrázků, fotek, diagramů, skenů a galerií v Astro monorepu orlojWeb (hodinarium-eu, horologie-cz). Aktivuje se při vkládání obrázků do .md/.mdx článků, při tvorbě nové komponenty pracující s obrázky, při řešení atribuce/copyrightu/licence fotek, při tvorbě galerií nebo fotoreportů, při work with `foto[]` pole v frontmatteru sbírky/soupisu/medailonů, při řešení lightboxu/zoom/náhledů, při migraci obrázků (R2, formáty AVIF/WebP), při psaní alt textů pro a11y. Pokrývá: výběr způsobu vložení (markdown vs direktiva vs schema), atribuci dle licencí (NPÚ CC BY-NC-ND, Wikimedia CC BY-SA, vlastní), build pipeline `imgindex:build` + `imgvariants:build`, Photo.astro komponentu + ::photo direktivu, Highslide phase-out, R2 plán.
---

# Obrázky — konvence pro orlojWeb

Pravidla pro vkládání, zobrazování a údržbu obrázků v `apps/hodinarium-eu` a `apps/horologie-cz`. Vychází z auditu 2026-05-17 (commit ab9abf81 + návrh A.25/A.26 v TODO.md).

## 1. Tři způsoby vložení obrázku — kdy co použít

| Způsob | Syntaxe | Kdy použít |
|---|---|---|
| **Markdown** | `![alt](/img/foo.jpg)` | běžné fotky v article body bez kreditu (vlastní fotka spolku, public domain, kresba autora) |
| **Direktiva `::photo`** | `::photo{src="…" alt="…" author="…" license="…" sourceUrl="…"}` | fotky s povinnou atribucí (Wikimedia, NPÚ, profesionální fotograf), kdykoliv potřebujeme credit overlay |
| **Schema `foto[]` / `portret`** | `foto: [{src, alt, credit, typ}]` ve frontmatteru | strukturovaná data — sbírkové karty (`/sbirka/karta/`), soupis věžních hodin, hodinářské medailony |

**Nikdy nepoužívat** raw `<img>` nebo `<figure>` tagy v body MDX (jen 14 + 6 zbylých legacy výskytů; postupně migrovat).

## 2. Photo komponenta (`apps/hodinarium-eu/src/components/Photo.astro`)

Direktiva `::photo{}` v MDX se renderuje touto komponentou. Klíčové vlastnosti:

- **Auto-čtení XMP build-time** přes knihovnu `exifr` — pokud má soubor zapsaný credit v XMP (autor, licence, zdroj), komponenta ho automaticky použije i bez explicitních props (fallback).
- **Credit overlay** v pravém dolním rohu obrázku (ne pod ním).
- **Tone-aware barva textu** — z `image-sizes.json` pole `tone` (light/dark), automaticky vybírá čitelnou barvu podle jasu BR rohu (build-time).
- **Bez credit polí** se chová jako prostý `<img>` — caption se nerenderuje.
- **`class` prop** se propaguje na `<img>` (img-hero, img-large, ...).
- **Mobile ≤600 px**: overlay se vrátí pod obrázek.

**Použití v MDX** (direktiva, žádný `import` v content/):

```mdx
::photo{src="/img/foo.jpg" alt="Popis" author="Øyvind Holmstad" authorUrl="https://commons.wikimedia.org/wiki/User:Holmstad" license="CC BY-SA 3.0" licenseUrl="https://creativecommons.org/licenses/by-sa/3.0/" sourceUrl="https://commons.wikimedia.org/wiki/File:..." year=2014}
```

## 3. Schema-driven obrázky ve frontmatteru

### 3.1 `foto[]` v soupis-veznich-hodin

```yaml
foto:
  - src: /img/vez/dymokury/stroj.jpg
    alt: Detail krokového kola stroje Jana Prokeše v Dymokurech
    credit: "© Petr Skála (atelier veznihodiny.cz). Použito se svolením."
    typ: stroj  # stroj | budova | cifernik | detail | historicke | plan | jine
```

Render priority pro hero thumb v index tabulce: `stroj > budova > cifernik > historicke > detail > first`.

### 3.2 `portret` v hodinari medailonech

```yaml
portret: /img/hodinari/jan-prokes.jpg
portretCredit: "Zlatá Praha 1891, č. 51, s. 611 — rytinový portrét. Public domain (>130 let)."
portretSource: "https://commons.wikimedia.org/wiki/File:..."
```

### 3.3 `hero` v kroky/

```yaml
hero:
  src: /img/kroky/robertuv-krok/milicevsi-prokes-l-1905.jpg
  alt: Detail Robertova kroku
  caption: "Robertův krok ve věžním stroji L. Prokeše, zámek Milíčeves (1905)."
  credit: "Foto: Petr Skála (orloj.eu), 2023. Použito se svolením."
```

## 4. Velikostní třídy + chování v článku

Třídy se přiřazují **automaticky** přes `ArticleImageBehavior.astro` po DOM mountu, na základě `image-sizes.json`:

| Třída | Šířka původního JPG | Chování |
|---|---|---|
| `img-hero` | první obrázek v článku | full šířka 72ch sloupce, no float, margin-bottom |
| `img-small` | ≤ ~200 px | float (alternuje pravo/levo přes JS counter) |
| `img-medium` | ~200–500 px | float (alternuje) |
| `img-tall` | úzký + vysoký (portrét) | float (alternuje) |
| `img-large` | ≥ 600 px | standalone block, na střed, **klik = lightbox** |
| `img-full` | (manuální) | full šířka článku |
| `img-standalone` | (manuální) | standalone, max 480 px |
| `img-skip-hero` | (manuální) | první obrázek NENÍ hero |

**Galerie auto-grouping**: ≥2 konsekutivní `img-large` s krátkými captiony se seskupí do `.article-gallery` (CSS grid 200 px sloupce, 4:3 cover, sepia hover, lightbox).

## 5. Build pipeline

### 5.1 `pnpm imgindex:build` — image-sizes.json

`scripts/build-image-index.ts` projde všechny obrázky v `public/img/` obou apps, použije `sharp` pro:

- rozměry (width, height)
- klasifikaci size (small / medium / large / tall)
- tone detection v BR rohu (~30 % × 30 %, threshold 140/255 → light/dark)

Výstup: `apps/{hodinarium-eu,horologie-cz}/src/data/image-sizes.json` (~240 KB, 2796 entries).

**Kdy spustit:** po každém přidání nového obrázku do `public/img/`.

### 5.2 `pnpm imgvariants:build` — AVIF + WebP

`scripts/generate-image-formats.ts` pre-generuje variant formátů (`foo.jpg → foo.avif + foo.webp`) přes `sharp`. Idempotent — přeskakuje existující & up-to-date.

**Output:** vedle původního souboru v `public/img/`.

**Důležité:** dnes jsou variants v R2 bucketu `csh-imgvariants` (367 MB, 5684 souborů); `<picture>` wrap aktivní v obou apps s `cdnBase: pub-e96bd8c…r2.dev`.

### 5.3 Další skripty (méně časté)

- `audit-hero-images.mjs` — audit fotek bez hero
- `cleanup-images.ts` — orphan detection
- `fix-h2-with-image.ts` — autofix h2 + image konflikty
- `sync-images-horologie.ts` — sync mezi apps

## 6. Pravidla atribuce (licence, autor, zdroj)

Memory: `feedback_foto_licence_pravidlo.md` (default + per-foto), `feedback_foto_atribuce.md`, `feedback_npu_foto_licence.md`.

### 6.1 Default licence webu = CC BY 4.0 — PRAVIDLO (2026-05-21)

Celý web je pod **CC BY 4.0** — deklarováno site-wide v `Base.astro`
(`<link rel="license" href="https://creativecommons.org/licenses/by/4.0/">`
+ `dcterms.rights` „© Český spolek horologický z. s. — CC BY 4.0") a na
stránce `/licence`. Z toho plyne per-foto konvence:

| Typ fotky | `author` | `license` | `sourceUrl` (zdroj) |
|---|---|---|---|
| **Originál pro web / spolkový** (default CC BY 4.0) | ANO (vždy) | NE — dědí se z webu | NE |
| **Jiná licence** (NPÚ, Wikimedia CC BY-SA, NC/ND…) | ANO | ANO (+`licenseUrl`) | jen u převzatých |
| **Převzaté** (Wikimedia, se svolením z cizího webu) | ANO | ANO (+`licenseUrl`) | ANO (`sourceUrl`) |

Pravidla:
1. **Default = CC BY 4.0**, uvedená jednou pro celý web. U fotky se `license`
   uvádí **jen když se liší** od defaultu.
2. **Autor se uvádí VŽDY** (CC BY = atribuce povinná). Neznámý → `"autor
   neznámý"` / `"Z archivu ČSH"`, jinak nepublikovat.
3. **Zdroj (`sourceUrl` / „zdroj") jen u převzatých fotek** — Wikimedia nebo
   se svolením z jiného webu. U originálu pro web se NEUVÁDÍ (zdroj jsme my);
   volitelně `authorUrl` jako backlink na autora.
4. „© Jméno" zvlášť **jen když autor ≠ držitel práv** (fotograf × instituce).
   Jméno se v creditu nikdy nezdvojuje.

Foto vyrobené přímo pro web s volným užitím za podmínky atribuce = přesně
CC BY 4.0 (= default) → stačí `author` (+ volitelně `authorUrl`), žádná
`license` ani `sourceUrl`. Pokud autor chce užší rozsah (NC/ND, nebo jen pro
ČSH) → uvést konkrétní licenci, resp. „použito se svolením" (NE CC štítek,
ten by veřejně udělil práva, která autor nezamýšlel).

Příklady `::photo`:
```mdx
<!-- originál pro web (default CC BY 4.0) -->
::photo{src="/img/…/foto.jpg" alt="…" author="Jméno Autora" authorUrl="https://autoruv-web.cz" year=2026}
<!-- převzaté z Wikimedie (jiná licence + zdroj) -->
::photo{src="/img/…/foto.jpg" alt="…" author="Autor" authorUrl="https://commons.wikimedia.org/wiki/User:…" license="CC BY-SA 3.0" licenseUrl="https://creativecommons.org/licenses/by-sa/3.0/" sourceUrl="https://commons.wikimedia.org/wiki/File:…" year=2014}
```

### 6.1.1 Dvě vrstvy — zobrazený credit × metadata souboru (DŮLEŽITÉ)

Rozlišuj **co zobrazíme na webu** od **co zapíšeme do souboru**:

| Vrstva | Kde | Licence |
|---|---|---|
| **Zobrazený credit** | caption na webu (`Photo.astro`) | smí se opřít o site-wide default → u originálu stačí `author` |
| **Metadata souboru** | XMP/IPTC v binárce na R2 | **VŽDY celá licence** |

Důvod: soubor na R2 je samostatný artefakt — může se sdílet i **mimo web**, kde žádný „default webu" neplatí. Proto musí být **self-describing**: každý soubor (originál i AVIF/WebP varianta) nese kompletní licenci v XMP/IPTC, i když je on-page credit terse.

Pole pro originál pod default CC BY 4.0 (exiftool):
- `XMP-dc:Creator` = autor (nebo „Český spolek horologický z. s.")
- `XMP-xmpRights:Marked=True`
- `XMP-xmpRights:UsageTerms` = „This work is licensed under CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/"
- `XMP-xmpRights:WebStatement` = `https://creativecommons.org/licenses/by/4.0/`
- `XMP-cc:license` = `https://creativecommons.org/licenses/by/4.0/`
- `XMP-cc:attributionName` / `XMP-cc:attributionURL`
- `XMP-dc:Rights` = „© [rok] [autor] / ČSH — CC BY 4.0"
- `XMP-dc:Source` / `XMP-dc:Identifier` = kanonická URL fotky na webu
- IPTC mirror: `By-line`, `CopyrightNotice`, `Credit`, `Source`

Převzaté foto → do metadat se zapíše **jeho vlastní** licence (Wikimedia CC BY-SA 3.0, NPÚ CC BY-NC-ND 3.0 CZ…) + autor + zdroj, NE náš default.

**Stav implementace:** zatím NEautomatizováno v obecné pipeline. Vzor: `scripts/photo-embed-npu.mjs` (exiftool embed pro NPÚ soubory). Pozor: `sharp` v `generate-image-formats.ts` metadata **stripuje** → varianty XMP nemají; embed musí běžet po generování variant (nebo na všech 3 formátech), případně `sharp().withMetadata()` + doplnění zbytku exiftoolem. TODO: obecný embed krok v R2 pipeline (viz §9 / A.26).

### 6.2 Specifické zdroje
- **NPÚ MIS fotky** — default CC BY-NC-ND 3.0 CZ, ČSH = nekomerční (OK). Nikdy nezasahovat do obsahu (cropovat/retušovat), resize pro web OK. Atribuce `"[Autor] / NPÚ MIS"` (ne jen „NPÚ") u externích autorů restaurátorských zpráv.
- **Wikimedia Commons** — vždy `author + authorUrl + license + licenseUrl + sourceUrl` (CC BY-SA vyžaduje plnou attribution chain).
- **Se svolením z cizího webu** — `author` + zdroj (`sourceUrl`) + licence/„použito se svolením"; NE náš CC BY 4.0 default.
- **CSH fotografové** (memory `reference_csh_fotografi.md`): S. Marušák (NE M.), Petr Skála, Marek (first name neznámý). Detekce z filename `(foto X)` patternu, NFD-fold před regex match.
- Pozn.: `author` je vždy čistý text + `authorUrl` zvlášť — NIKDY markdown `[Jméno](url)` v poli `author` (vyrenderuje se doslova).

## 7. Storage konvence

```
public/img/
├── hodinari/          jan-prokes.jpg, petr-skala.jpg, ...
├── sbirka/            inv-N-slug/foto-1.jpg, ...
├── vez/<lokalita>/    stroj.jpg, detail-1.jpg, cifernik.jpg, ...
├── kroky/<krok>/      schema.png, foto-aplikace.jpg, ...
└── <kategorie>/       (clanky, kronika, og, …)
```

**Konvence názvů:**
- Lowercase, kebab-case
- ASCII fold (žádná diakritika v cestě — `decin` ne `děčín`)
- Suffix `_i` pro thumbnail varianty (např. `foo.jpg` + `foo_i.jpg`)
- Suffix `.avif` / `.webp` — generované varianty

## 8. Plán A.25 — sjednocený image systém (návrh 2026-05-17)

Aktuálně máme 4 nekonzistentní renderingové cesty. Plánovaný refactoring:

**4 vrstvy s jasnou separací:**
1. **L1 vstup** — markdown / direktiva / schema (jak dnes)
2. **L2 normalizace** — jeden `ImageData` typ, helper `normalizeImage()`
3. **L3 komponenty** — `<ResponsivePicture/>` (AVIF+WebP+JPG `<picture>`), `<ImageCard/>` (overlay credit), `<Gallery/>` (grid + sdílený lightbox)
4. **L4 layout** — `ArticleImageBehavior` zúžený (~250 ř.), `CollectionFotoGrid` pro non-article, `ThumbnailList`

**Benefity:**
- Lightbox všude (dnes jen v article body)
- AVIF/WebP konečně doručené prohlížeči (dnes jsou v R2 ale stránky pošlou plný JPG)
- Credit overlay konzistentně všude
- Highslide z legacy phase-out (2007 lib, 80 KB → nativní `<dialog>` 3 KB)

**Status:** navrženo, čeká na schválení Petrem. Email koncept: `audit-pro-petra.md`.

## 9. Plán A.26 — R2 plná migrace (návrh 2026-05-17)

Dnes je v R2 jen `csh-imgvariants` bucket (variants). Originály jsou v gitu (`public/img/`, 2 822 souborů, ~stovky MB).

**Plán:**
1. Upload originálů do R2 + zápis `x-amz-meta-*` headers (author, license, source URL)
2. Před uploadem: zapsat XMP do binárky (autor, licence, zdroj, rok) přes `exiftool`
3. `<ResponsivePicture/>` přepnout přes existing `cdnBase` config
4. Po 1 měsíci validace → `git rm -r public/img/`
5. Sveltia CMS upload widget → R2 signed URL upload

**Free tier R2:** 10 GB úložiště + 10M čtení + neomezený egress. Náš odhad: ~400 MB → **25× pod limit, navždy zdarma**. Cena nad limit symbolických $0.015/GB.

## 10. Lightbox / fullscreen

**Současný stav:** ArticleImageBehavior.astro má global `<dialog id="lightbox">` — aktivace klik na `img-large`, navigace ←/→, ESC, klik mimo zavře.

**Plán:** přesunout do `<Gallery/>` komponenty (L3) jako sdílený dialog dostupný i v sbirka/soupis/hodinari kontextech. Mobile: swipe gesto pro prev/next.

**NIKDY** nepoužívat externí lib (Highslide, Fancybox, PhotoSwipe, Lightbox.js, Magnific Popup, …). Native `<dialog>` má všechno, co potřebujeme.

## 11. Konkrétní akce při běžných úkolech

### „Doplnit obrázek do článku"

1. Soubor do `public/img/<kategorie>/...jpg`
2. Spustit `pnpm imgindex:build` (regeneruje image-sizes.json)
3. Spustit `pnpm imgvariants:build` (AVIF + WebP varianty)
4. V MDX použít:
   - bez creditu: `![popis](/img/cesta/foo.jpg)`
   - s creditem: `::photo{src="/img/cesta/foo.jpg" alt="popis" author="…" license="…" sourceUrl="…"}`

### „Doplnit fotku stroje do sbírkové karty / soupisu"

V frontmatteru `foto:` array:
```yaml
foto:
  - src: /img/vez/<lokalita>/stroj.jpg
    alt: Detailní popis pro nevidomé
    credit: "© [Autor]. Použito se svolením."
    typ: stroj
```

### „Vytvořit galerii / fotoreport"

V MDX dát ≥2 `::photo{}` (nebo `![]()` pokud bez creditu) za sebou. **Krátké caption paragrafy < 120 znaků** mezi nimi NEPŘERUŠÍ sekvenci — naopak se připojí jako `<figcaption>`. JS to autoseskupí do gridu.

### „Pridát stub medailon hodináře s portrétem"

V hodinari/<slug>.mdx:
```yaml
portret: /img/hodinari/<slug>.jpg
portretCredit: "Zdroj + licence."
portretSource: "URL"
```

A nezapomenout entry do `apps/hodinarium-eu/src/data/hodinari.ts` se sloupcem `jmeno` (display name, viz memory `feedback_display_name_hodinari.md`).
