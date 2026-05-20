# Photo credit layout — návrh (2026-05-20)

Řešení zobrazování fotografických creditů u obrázků. **Portrait obrázek
s delším creditem** → credit svisle po pravé straně. **Velký portrait**
→ centrovaný na šířku textu.

## Otevřít demo

```bash
open docs/photo-credit-layout-2026-05-20/demo.html
```

Demo ukazuje 4 scénáře na reálných R2 obrázcích (Janata fotky).

## Klíčové designové principy

1. **Žádné JS runtime měření** — orientation (portrait/landscape) je
   build-time známé z `image-sizes.json` (`w`/`h`). Layout se volí
   class modifikátorem.
2. **CSS Grid + `writing-mode`** — žádné absolutní pozicování.
3. **`width: fit-content`** — figure se zúží na šířku obrázku
   (ne přes celou šířku sloupce).
4. **Responsive** — na úzkém viewportu (≤ 34 rem) se vertical caption
   vždy degraduje zpět pod obrázek (vertikální text je na mobilu
   nepraktický).

## Layout matrix

| Stav | Class | Caption |
|---|---|---|
| Landscape / malý portrait | `photo` | pod obrázkem (grid řádek) |
| Portrait + krátký credit | `photo is-portrait` | pod obrázkem |
| Portrait + delší credit | `photo is-portrait layout-side` | **svisle vpravo** (`writing-mode: vertical-rl`) |
| Velký portrait | `photo is-portrait is-large` | pod obrázkem, **figure centrovaný** (`margin-inline: auto`) |

## HTML struktura

```html
<figure class="photo is-portrait layout-side">
  <picture>
    <source type="image/avif" srcset="….avif">
    <source type="image/webp" srcset="….webp">
    <img src="….jpg" alt="…">
  </picture>
  <figcaption>
    <span class="credit-author">Foto: Petr Skála</span> (2021) · © Petr Skála, 2021
  </figcaption>
</figure>
```

Grid areas: `img` + `cap`. Default `"img" / "cap"` (sloupec), side layout
`"img cap"` (řádek) s `grid-template-columns: auto min-content`.

## Rozhodovací logika pro Photo.astro

```ts
// Z image-sizes.json (build-time)
const sizeInfo = imageSizes[src];  // { w, h, size, tone }
const w = sizeInfo?.w ?? 0;
const h = sizeInfo?.h ?? 0;

const isPortrait = h > w * 1.15;          // výrazně na výšku (tolerance 15%)
const isLarge    = w >= 900 || h >= 1200; // velký obrázek

// Délka creditu pro rozhodnutí side vs below
const creditText = [author, license, sourceUrl && 'zdroj']
  .filter(Boolean).join(' · ');
const creditLong = creditText.length > 24;

const layoutClass = [
  'photo',
  isPortrait && 'is-portrait',
  isLarge && 'is-large',
  // Svisle vpravo JEN když: portrait + delší credit + NE velký (ten se centruje)
  (isPortrait && !isLarge && creditLong && showCredit) && 'layout-side',
].filter(Boolean).join(' ');
```

## Migrace z dnešního overlay řešení

**Současný stav** (`Photo.astro`): credit je **overlay v pravém dolním
rohu obrázku** (`.img-credit-overlay`, absolutní pozicování, tone-aware
barva textu). Funguje, ale:

- Na portrait fotkách overlay zabírá cenné místo přes motiv
- Dlouhý credit (autor + licence + zdroj) se na úzké portrait fotce zalomí

**Tento návrh** je alternativa — credit **vedle/pod obrázkem**, ne přes něj.
Dvě cesty:

### Cesta A — nahradit overlay novým layoutem (větší změna)
Smazat `.img-credit-overlay` + tone detection; figcaption vždy mimo
obrázek. Čistší, ale ztratí se „filmový" overlay dojem na landscape
fotkách.

### Cesta B — hybrid (doporučeno)
- **Landscape** → zachovat overlay v rohu (současné chování)
- **Portrait + delší credit** → vertical side caption (nový layout)

Hybrid znamená v `Photo.astro` switch:
```ts
const useOverlay = !isPortrait || !creditLong;
```
Overlay pro landscape (dnešní), side caption pro problematické portraity.

## Edge cases ošetřené v CSS

- **Caption delší než výška obrázku** (vertical) → `overflow: hidden;
  text-overflow: ellipsis` + `max-height: 100%` ořízne. (Pro krátké
  credity „Foto: Petr Skála" se to nestane.)
- **Mobil** → media query degraduje na horizontal pod obrázkem.
- **Bez creditu** → `figcaption` se nerenderuje, grid má jen `img`.

## Co rozhodnout

1. **Cesta A vs B** — nahradit overlay úplně, nebo hybrid?
2. **Threshold `creditLong > 24`** — vyladit podle reálných creditů
   (většina je „Foto: Petr Skála" = 16 znaků → below; s licencí +
   zdrojem ~40 znaků → side).
3. **`is-large` centrování** — aplikovat i na landscape velké fotky,
   nebo jen portrait? (Návrh: jen portrait; velký landscape stejně
   vyplní šířku sloupce.)
