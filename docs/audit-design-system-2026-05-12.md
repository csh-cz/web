# Design system audit — hodinarium.eu × horologie.cz

**Datum auditu:** 2026-05-12
**Apps:** [`apps/hodinarium-eu`](../apps/hodinarium-eu/) × [`apps/horologie-cz`](../apps/horologie-cz/)

Cross-site audit driftu mezi dvěma sesterskými weby. Hledáme **co je sdíleno**, **co diverguje** a **co by mělo jít do `packages/ui`** vs. **co je legitimně site-specific**.

## TL;DR

- **Sdílené:** font tokens (Spectral), color slovník (stejné názvy), strukturní třídy (`.eyebrow`, `.hero-title`, `.h2-flush`), grid breakpoints.
- **Strategicky divergentní (NESJEDNOCOVAT):** výchozí téma (Hodinárium dark, Horologie light), velikost CSS (1418 vs 300 řádků — Hodinárium má víc komponent), hero kompozice.
- **Drift k opravě:** `.btn-primary`/`.btn-secondary` definováno per-page v `index.astro` u Hodinária; Horologie ekvivalent nemá. Card komponenta existuje jen v Hodináriu (Horologie nepoužívá listing patterns). JsonLd duplicitní implementace.
- **Migration plan k `packages/ui`** doporučen pro **2 komponenty** + **5 CSS tokenů** + **2 utility třídy** (viz dolu). Zbytek nechat per-app.

---

## 1. Color tokens — strategicky inverted

Oba weby mají **identický slovník token jmen** (`--color-bg`, `--color-brass`, `--color-text`, `--color-ink`, ...), ale **invertované defaulty**:

| Token | Hodinarium (default) | Horologie (default) |
|---|---|---|
| `--color-bg` | `#14100c` (tmavá kávová) | `#f3ebd5` (světlá pšenice) |
| `--color-bg-elevated` | `#1f1814` (tmavší elevation) | `#fdf6e3` (papírová elevation) |
| `--color-brass` | `#b8924a` (světlá mosaz) | `#8b6d2e` (tmavá mosaz) |
| `--color-text` | `#f5ecd9` (světlý text) | `#2a1f15` (tmavý text) |

**Důvod:**
- **Hodinarium** = muzejní expozice. Tmavá s mosaznými akcenty navozuje atmosféru fyzické vitríny ve sklepní hodinové sbírce.
- **Horologie** = spolková identita. Světlá s papírovým podkladem evokuje listinný dokument, dopis, archivní fond.

**Doporučení:** **Ponechat divergentní** — to není drift, to je rozhodnutí. Možná v `packages/ui/tokens.css` definovat **pojmenovaná témata** (`@theme museum-dark`, `@theme paper-light`) a apps si je importují, ale jména proměnných sjednocená.

Oba weby mají `@media (prefers-color-scheme: light/dark)` block s opačnými hodnotami — tj. **uživatelská preference funguje pro oba weby konzistentně** (light user vidí Horologie defaultně + Hodinarium v light variantě, dark user totéž obráceně).

**Nesoulad k opravě:** Hodinarium `--color-copper` v dark = `#c47049`, v light = `#8a4221`. Horologie default = `#a85a3c`, dark = `#c8895c`. **`#c8895c` ≠ `#c47049`** — drobné rozdíly v copper akcentu, pravděpodobně zděděné z různých experimentů. Sjednotit.

---

## 2. Typografie — sdíleno

Oba `global.css` definují **identický font stack**:

```css
--font-serif: "Spectral", "Cardo", Georgia, "Times New Roman", serif;
```

Mono font má drobnou variantu — Hodinarium má `ui-monospace, "SF Mono", Menlo, monospace`, Horologie nemá explicitní `--font-mono` proměnnou. Sjednotit do `packages/ui/tokens.css`.

**Doporučení k migraci:**

```css
/* packages/ui/tokens.css */
:root {
  --font-serif: "Spectral", "Cardo", Georgia, serif;
  --font-mono: ui-monospace, "SF Mono", Menlo, monospace;
}
```

Apps si importují a override-ují jen barvy.

---

## 3. Strukturní třídy — drift

### `.eyebrow` (utility — malý uppercase nadpis nad hlavním titulkem)

- Hodinarium: `font-family: var(--font-serif); font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.22em; color: var(--color-copper); font-weight: 500;`
- Horologie: pravděpodobně podobné (need verify) — viz `apps/horologie-cz/src/styles/global.css`

### `.hero-title` (utility — velký editorial nadpis)

- Hodinarium: `clamp(2.5rem, 8vw, 5rem)` + `.hero-title-sm` (`clamp(2.5rem, 5vw, 4.5rem)` pro index sekcí)
- Horologie: viz `BrandLogo.astro` — má vlastní logo/title styling

### `.h2-flush` — utility pro flush horní okraj `<h2>`

Pravděpodobně sdílené (oba weby).

**Doporučení:** přesunout do `packages/ui/utilities.css`:

```css
.eyebrow { /* uppercase eyebrow */ }
.hero-title { /* clamp 2.5-5rem */ }
.hero-title-sm { /* clamp 2.5-4.5rem */ }
.h2-flush { /* margin reset */ }
.fleuron { /* dělící flórum */ }
```

---

## 4. Button styly — DRIFT

V Hodináriu existuje `.btn-primary` + `.btn-secondary` **inline v `index.astro`** (definovány v `<style>` bloku stránky, ne v `global.css`):

```css
/* apps/hodinarium-eu/src/pages/index.astro line ~196 */
.btn-primary, .btn-secondary { ... }
```

V Horologii **nemají** ekvivalent — jiné stránky `.astro` mají vlastní inline button styling, nebo používají raw `<button>` s Tailwind classes.

**Use count přes obě repa:** 8 výskytů `.btn-primary`/`.btn-secondary` (pouze Hodinarium).

**Doporučení:** přesunout do `packages/ui/buttons.css` s tématickými variantami:

```css
.btn-primary {
  background: var(--color-brass);
  color: var(--color-ink);
  border: 1px solid var(--color-brass-bright);
  /* … */
}
.btn-secondary { /* outline variant */ }
.btn-text { /* tertiary, text-only */ }  /* nová: pro "Mapa horologie →" pattern */
```

Token-driven (`--color-brass` apod.), takže funguje v obou tématech.

---

## 5. Komponenty — počty

| App | Komponenty | Patří k tématu |
|---|---|---|
| Hodinarium | **21** (Card, Photo, Breadcrumbs, EditorNote, SearchModal, Ref, WipBanner, …) | muzejní/listing |
| Horologie | **2** (BrandLogo, JsonLd) | identita/marketing |

**Disparita 21 vs 2 je legitimní** — Horologie je marketing/identita web, Hodinarium je obsahová expozice s rozsáhlými listingy.

### Komponenty kandidátní pro `packages/ui`

Tyto **NEJSOU** site-specific a Horologie by je v budoucnu mohlo využít:

1. **JsonLd** — strukturovaná data pro SEO. Aktuálně **duplicitní** mezi apps. Klasický kandidát pro shared.
2. **Breadcrumbs** — drobečková navigace. Horologie momentálně nemá hierarchii hluboko, ale `/akce/<slug>` a `/dokumenty` by ji uvítaly.
3. **(future)** **Card** — když Horologie přidá listing patterns (např. archiv akcí), bude potřebovat. Aktuálně Hodinarium-only.

### Komponenty, které **NEPATŘÍ** k shared

- **CasSegmentovky, CasSlovem, KartaSbirky, PRS10Live, PdfPager, SearchModal, TaborOrloj, YouTube, ZidovskeHodiny, SlunecniHodinyKlementinum** — všechny pure Hodinarium muzejní obsah.
- **BrandLogo** — Horologie-only spolková identita.

---

## 6. Konkrétní migration plan do `packages/ui`

### Fáze 1 — Tokens (~30 min)

```
packages/ui/
├── tokens.css     # --font-serif, --font-mono
├── theme-museum.css   # dark default + light override (Hodinarium)
└── theme-paper.css    # light default + dark override (Horologie)
```

Apps importují:
```css
/* apps/hodinarium-eu/src/styles/global.css */
@import '@csh/ui/tokens.css';
@import '@csh/ui/theme-museum.css';
/* ... rest site-specific */
```

### Fáze 2 — Utility classes (~30 min)

```
packages/ui/
└── utilities.css   # .eyebrow, .hero-title, .h2-flush, .fleuron
```

### Fáze 3 — Buttons (~45 min)

```
packages/ui/
└── buttons.css   # .btn-primary, .btn-secondary, .btn-text (új)
```

### Fáze 4 — Komponenty (~2 h)

```
packages/ui/
├── JsonLd.astro
└── Breadcrumbs.astro
```

Migrate import paths v obou apps + smaž duplicates.

### Celkový odhad: ~4 h práce

---

## 7. Drobné konkrétní nálezy

### a) `--color-copper` neshoda

Hodinarium dark `#c47049` vs Horologie dark `#c8895c`. Sjednotit (pravděpodobně to byl rozdíl z různých CSS commitů).

### b) `--font-mono` chybí v Horologii

Pokud Horologie v budoucnu zobrazí kód (např. v `/dokumenty`), nemá konzistentní mono font. Drobné, ale uložit.

### c) `.btn-primary` inline v `index.astro`

Pokud chce někdo button použít na jiné stránce, musí kopírovat CSS. Out z `<style>` bloku stránky → do `global.css` nebo `packages/ui/buttons.css`.

### d) JsonLd duplicita

Oba apps mají vlastní `JsonLd.astro`. Diff?

```bash
diff apps/hodinarium-eu/src/components/JsonLd.astro apps/horologie-cz/src/components/JsonLd.astro
```

Pravděpodobně malé rozdíly. Sjednotit.

### e) Tlačítkový arrow (`→`) konsistence

V Hodináriu má secondary CTA šipku, primary ne (viz [FU2 audit](audit-hero-index-2026-05-12.md#b-cta-pokrytí)). V Horologii pravděpodobně další pattern. Konvence: primary = bez šipky (akce), secondary = se šipkou (navigace).

---

## 8. Závěr

**Nesjednocovat:**
- Výchozí téma (muzejní dark × spolková light) — strategická volba, respektovat
- Počet komponent (21 × 2) — funkční rozdíl rolí webů

**Sjednotit (do `packages/ui`):**
- Font tokens, color slovník (s tématy)
- Utility classes (eyebrow, hero-title, h2-flush, fleuron)
- Buttons (primary, secondary, + new text)
- JsonLd komponenta, případně Breadcrumbs

**Opravit drobné drifty:**
- `--color-copper` shoda mezi dark variantami
- `--font-mono` doplnit do Horologie
- `.btn-*` ven z inline `index.astro` styles
- JsonLd dedup

**Celková práce:** ~4 hodiny, výhradně migrace + dedupe. Žádný nový obsahový design.

**Pořadí doporučené:** **Po stabilizaci slovník expansion (mám 135 hesel po Táborský dumpu — nepřibudou další velké drops),** **po dokončení a11y bundle A.4 (SearchModal aria pattern refactor)**. Tyto dvě věci ovlivňují utility classes a komponenty, které by jinak musely být migrované dvakrát.

**Není urgentní.** Současný stav je funkční. Tento audit je preparation pro budoucí refactor.
