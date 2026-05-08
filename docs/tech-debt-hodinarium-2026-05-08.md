# Tech-debt inventář: hodinarium-eu

**Datum:** 2026-05-08
**Auditor:** Claude (FU7 z `docs/design-followups-hodinarium-2026-05-08.md`)
**Scope:** apps/hodinarium-eu (read-only inventář, žádné edity)
**Branch:** `claude/epic-bhaskara-36b09d` @ `31e01be`

---

## Summary

Audit pokryl 6 hot spotů ze specifikace. Reálné položky: **8 dluhových
kandidátů**. Žádný blokuje produkci, ale 2 z nich (TD1, TD2) mají dopad
na další refaktory (a11y M7, plánovaný SearchModal aria refaktor).

**Pozitivní zjištění:**
- Inline JSDoc napříč komponentami je adekvátní (Base.astro, Photo.astro,
  Article.astro, content.config.ts všechny mají vyčerpávající dokumentaci)
- Content collections schémata fungují, validace běží přes Zod refine
- Žádné circular importy v `src/data/*.ts`
- Žádný dead code v `src/components/` (každá komponenta je použitá)

---

## TD1 — Inline `style="border-bottom: none"` na linkech v mapách

**Kategorie:** Přímý a11y dluh (souvisí s a11y M7 v TODO A.9)
**Priorita:** 🟡 Medium
**Effort:** ~15 min
**Files:**

- `apps/hodinarium-eu/src/pages/mapa.astro:66, 96, 109` (3×)
- `apps/hodinarium-eu/src/pages/mapa-horologie.astro:150, 152` (2×)

**Stav:** 5 inline výskytů. **Žádné jiné** v src — `border-bottom: none`
v `<style>` blocích a `global.css` jsou legitimní component styles
(např. `.lokace-list a` reset).

**Doporučení:** Refaktor na CSS class (`.link-bare` nebo podobné) v
`global.css` + odstranit inline atributy. **Bundlovat s a11y M7**
(WCAG 1.4.1 fix vyžaduje stejně rozhodnout o vizuálním indikátoru —
buď underline, dotted, nebo non-color signal).

**Dopad pokud nedělat:** WCAG 1.4.1 fail (use of color) v map sekcích,
viditelný pro color-blind/low-vision uživatele.

---

## TD2 — Dialog handler duplicity (SearchModal × ReportIssueModal)

**Kategorie:** Reálná code duplikace
**Priorita:** 🟡 Medium
**Effort:** ~30 min
**Files:**

- `apps/hodinarium-eu/src/components/SearchModal.astro:590-628`
- `apps/hodinarium-eu/src/components/ReportIssueModal.astro:365-447`

**Duplicitní logika:**
1. **`openModal()` / `closeModal()` wrappery** kolem `dialog.showModal()`
   / `dialog.close()` — identický pattern
2. **Click-outside handler** — `dialog.addEventListener('click', e => if (e.target === dialog) closeModal())`
   — **byte-for-byte identický**
3. **Escape key handler** — `document.addEventListener('keydown', e =>
   if (e.key === 'Escape' && dialog.open) closeModal())` — také identický

**Doporučení:** Extrahovat do `apps/hodinarium-eu/src/utils/dialog-controls.ts`:

```ts
export function attachDialogControls(
  dialog: HTMLDialogElement,
  opts: { trigger?: HTMLElement; closeBtns?: HTMLElement[]; onOpen?: () => void; onClose?: () => void }
): { open: () => void; close: () => void };
```

Vrátit `{ open, close }` pro callers, kteří potřebují ovládat dialog
mimo standard handlery (SearchModal volá `open()` z keyboard shortcutu).

**Bonus:** Při refaktoru přidat focus restoration (`dialog.returnValue`
+ `previouslyFocused`) — řeší to současně část a11y debt.

**Bundling s plánovaným SearchModal aria refaktorem (C3+C4+M2):**
- Pokud se C3+C4+M2 dělá samostatně, **udělat TD2 první**, aby refaktor
  stavěl na čistém helperu.
- Alternativně bundle TD2 + C3/C4/M2 do jedné session.

**Dopad pokud nedělat:** Kosmetický (~70 řádků zbytečně duplicitního JS),
ale každá další úprava (focus restoration, custom Esc behavior, atd.)
musí být na 2 místech.

---

## TD3 — Reference shape drift napříč collections

**Kategorie:** Schema inkonzistence
**Priorita:** 🟢 Low
**Effort:** ~1 h (s migration)
**Files:** `apps/hodinarium-eu/src/content.config.ts`

**Tři různé `reference` shapes:**

| Field | `reference` (clanky/hodinari/kronika/kroky) | `slovnikReference` (slovnik) | `veznihodinaPramen` (soupis-veznich-hodin) |
|---|---|---|---|
| bibKey | ✓ | ✓ | ✓ |
| title | ✓ | ✓ | ✓ |
| url | ✓ | — | ✓ |
| author | ✓ | — | `autor` (cs!) |
| year | ✓ (`year`) | — | `rok` (cs!) |
| type | ✓ | — | ✓ |
| pages | ✓ | ✓ | ✓ |
| note / poznamka | `note` | `note` | `poznamka` (cs!) |
| citace | — | ✓ | ✓ |

**Drift:**
- `note` (en) × `poznamka` (cs) — stejný účel, různé jméno
- `author` × `autor` — stejný účel, jazykově nekonzistentní
- `year` × `rok` — stejný účel, jazykově nekonzistentní
- `citace` field je v 2 ze 3 shapes, ale s jiným významem:
  - `slovnikReference.citace` = doslovný citát
  - `veznihodinaPramen.citace` = ISO 690 plain text fallback

**Doporučení:**
1. Přejmenovat `autor`/`rok`/`poznamka` ve `veznihodinaPramen` na
   `author`/`year`/`note` (sjednotit s majority)
2. Promote `citace` do master `reference` shape jako optional doslovný
   citát (slovnik use case)
3. Migration script: rename keys v existujících MDX frontmatter
   `content/soupis-veznich-hodin/*.md`

**Dopad pokud nedělat:** Konzumenti referencí (Article.astro, slug pages,
formatCite) musí znát všechny 3 shapes nebo napsat normalizační vrstvu.
**Funkčně nic neblokuje**, ale každý nový reference-related feature je
3× složitější.

---

## TD4 — Quasi-Article layouts: mírná duplikace headeru/footeru

**Kategorie:** Možná duplikace, ale nikoli akutní
**Priorita:** 🟢 Low (zatím)
**Effort:** ~2-3 h (s migrací)
**Files:**

| Page | Layout | Lines | Komentář |
|---|---|---|---|
| `[kategorie]/[slug].astro` | `Article.astro` | (Article 571 ř.) | Plný layout |
| `o-hodinariu.astro` | `Article.astro` | — | Plný layout |
| `sbirka/karta/[slug].astro` | `Base.astro` (vlastní header/footer) | 401 | Karta pattern |
| `hodinari/[slug].astro` | `Base.astro` (vlastní) | 682 | Largest, complex |
| `kronika/[slug].astro` | `Base.astro` (vlastní) | 175 | Smallest |
| `soupis-veznich-hodin/[slug].astro` | `Base.astro` (vlastní) | 436 | |
| `kroky/[slug].astro` | `Base.astro` (vlastní) | 412 | |
| `slovnik/[slug].astro` | `Base.astro` (vlastní) | 410 | Just-built |

**Stav:** 6 z 8 slug pages nepoužívá `Article.astro`, ale duplikuje patterns:
- `<Breadcrumbs>` (✓ shared component, OK)
- Header s eyebrow + h1 + meta dl (částečně duplikováno per-page styly)
- `prose-content` wrapper kolem MDX (✓ shared via global.css)
- Article byline footer (každá page má vlastní `.article-byline` block)

**Reálné překryvy:**
- `.article-byline` style block (~10 řádků CSS) opakovaný v každé slug
  page se mírně odlišnou class — slovnik (`.article-byline`),
  kroky (`.article-byline`), hodinari (různé varianty)
- Reference rendering logic (Branch 1: bibKey + citeproc, Branch 2: title
  fallback) — opakováno v `Article.astro:references-list`,
  `kroky/[slug].astro:130-167`, jinak v `slovnik/[slug].astro` jen MDX body

**Doporučení (až bude reálná potřeba):**
1. Extrahovat `<ArticleHeader>` Astro komponentu (eyebrow, title, meta dl)
2. Extrahovat `<ArticleByline>` Astro komponentu
3. Extrahovat `<ReferenceList>` komponentu (sjednotit bullet+numbered render)

**NEDOPORUČUJI:** Forsovat Article.astro na všechny slug pages. Karta,
hodinari, slovnik mají legitimně odlišné info hierarchy (karta box,
medailon meta, překlady tabulka). Sjednocení by ublížilo specifickému UX.

**Dopad pokud nedělat:** Drobný — každá nová slug page kopíruje 30-50
řádků boilerplate. 6 stávajících pages neporostou, takže bližší
estimaci než „budoucí náklad" ne.

---

## TD5 — Inline script v Base.astro (~190 řádků CMS hydrace)

**Kategorie:** Čitelnost, ne výkonnostní
**Priorita:** 🟢 Low
**Effort:** ~30 min
**File:** `apps/hodinarium-eu/src/layouts/Base.astro:496-685`

**Stav:**
- 1× JSON-LD inline script (8 řádků, `:307`) — OK, schema.org organization
- 1× Cloudflare Web Analytics beacon (1 řádek, `:310`) — OK
- 1× **CMS hydration script** (`:496-685`, ~190 řádků) — kandidát

**Co script dělá:**
- `window.__csh.inferSourceFileFromUrl()` — odvodí MDX path z URL routy
- `window.__csh.resolveEditorNote(ev)` — async handler pro editor mode
  (klik na editor note → mark resolved + commit přes /api/cms/...)
- IIFE init: připojí klikací handlery na `aside.editor-note` a `<button data-resolve>`

**Doporučení:** Extrahovat do `apps/hodinarium-eu/src/utils/cms-hydration.client.ts`
a importovat jako `<script>` v Base.astro:

```astro
<script>
  import { initCmsHydration } from '../utils/cms-hydration.client';
  initCmsHydration({ githubRepo: import.meta.env.PUBLIC_GITHUB_REPO });
</script>
```

**Trade-off:**
- ✓ Lepší editor experience (TS types, vite HMR během dev, ESLint)
- ✓ Testovatelné mimo browser
- ✗ Ztrácí se `define:vars` možnost — `githubRepo` musí jít přes
  `import.meta.env.PUBLIC_*` (Astro public env vars)
- ✗ Potřeba TS deklarace pro `window.__csh`

**Dopad pokud nedělat:** Žádný funkční. Editor experience pro tu
jednu komponentu zůstane suboptimal (žádné types, žádné HMR uvnitř
inline scriptu), ale práce na ní je řídká.

---

## TD6 — `src/data/*.ts` bez index.ts barrel

**Kategorie:** Ergonomika, low impact
**Priorita:** 🟢 Low (skip)
**Effort:** ~10 min, ale **NEDOPORUČUJI**
**Files:** `apps/hodinarium-eu/src/data/` (11 .ts + 6 .json)

**Stav:** Žádný `index.ts`, každý konzument importuje konkrétní path:

```ts
import { kroky } from '../../data/kroky';
import catalog from '../../data/catalog.json';
import { clanekHref } from '../../data/url-helpers';
```

**Proč skip:**
- Astro a Vite nedělají tree-shake přes barrel files úplně reliable —
  může to přidat dead-code do bundle při SSR
- Konkrétní importy jsou self-documenting (čtenář vidí, na co se sahá)
- Žádný cross-module circular import (ověřeno greppem)
- Refactor cost > benefit

**Pokud někdy:** Index.ts s explicit re-exports (`export { kroky } from
'./kroky'`) je bezpečný, barrel `export * from './kroky'` ne.

---

## TD7 — Tailwind class string duplicities v inline `style=`

**Kategorie:** Konzistence, kosmetika
**Priorita:** 🟢 Low
**Effort:** ~20 min
**Files:** 44 inline style atributů v src/pages + components

**Vzorové duplicity:**
- `style="margin-top: 0;"` na h2 nadpisech (~12 výskytů) —
  index.astro, [kategorie]/index.astro, mapa.astro, og-preview.astro,
  hodinari/index.astro, sbirka/index.astro
- `style="font-size: clamp(2.5rem, 6vw, 4.5rem);"` na hero h1 (~7×) —
  mapa.astro, casova-osa.astro, mapa-horologie.astro, kroky/index.astro,
  expozice.astro, hodinari/index.astro, slovnik/index.astro
- `style="font-size: 0.95rem;"` na intro paragraphs (~3×)

**Doporučení:** Vytvořit utility class v `global.css`:

```css
.h2-flush { margin-top: 0; }
.hero-title-clamp { font-size: clamp(2.5rem, 6vw, 4.5rem); }
.intro-text { font-size: 0.95rem; }
```

A find-and-replace inline style → class. **Bonus:** lze pak measure
a doladit pevnou velikost na různých breakpointech.

**Dopad pokud nedělat:** Drobný. Inline styly fungují, ale brání globální
kontrole typografického rytmu (změna h2 spacingu vyžaduje 12 editů).

---

## TD8 — Stránka `og-preview.astro` — dev artefakt v produkci?

**Kategorie:** Dead code candidate
**Priorita:** 🟢 Low (verify)
**Effort:** 5 min (verify) + 5 min (cleanup pokud)
**File:** `apps/hodinarium-eu/src/pages/og-preview.astro`

**Stav:** Stránka je pravděpodobně dev/preview tool pro OG image
template iteraci, ale je **public route** → renderuje se na produkci.

**Doporučení:**
1. Ověřit, jestli ji někdo aktivně používá (audit referer logs po DNS switch?)
2. Pokud ne: přesunout do `dev/` mimo pages, nebo přidat noindex meta
3. `Disallow: /og-preview` už je v `robots.txt` (DEV STATE blok) — po
   DNS switch zůstane v `Disallow` permanentně

**Dopad:** Nulový aktuálně (Disallow blokuje crawl). Pravděpodobně
dead pro běžného uživatele.

---

## Prioritizovaný akční plán

| # | Item | Priorita | Effort | Triggers |
|---|---|---|---|---|
| 1 | **TD1** inline `border-bottom: none` v mapách | 🟡 Medium | ~15 min | Bundle s a11y M7 |
| 2 | **TD2** dialog handler extrakce | 🟡 Medium | ~30 min | Před SearchModal aria refaktorem (C3+C4+M2) |
| 3 | **TD3** reference shape sjednocení | 🟢 Low | ~1 h | Při dalším schema dotyku |
| 4 | **TD4** Article patterns extrakce | 🟢 Low | ~2-3 h | Při tvorbě 7. slug page (zatím 6) |
| 5 | **TD5** Base.astro inline script extrakce | 🟢 Low | ~30 min | Při dalším CMS feature dotyku |
| 6 | **TD7** inline style duplicity | 🟢 Low | ~20 min | Při typografickém refaktoru |
| 7 | **TD8** og-preview verify | 🟢 Low | ~5 min | Po DNS switch |
| **skip** | **TD6** data/index.ts barrel | — | — | Nedělat (Vite tree-shake) |

---

## Nezahrnuto v auditu (out of scope)

- **MDX content kvalita** (legacy import artefakty) — viz B2 evergreen
  v TODO A.4
- **Slug standardizace** (114 souborů non-kebab) — viz D6 v TODO A.2
- **Test coverage gap** — viz D1 v TODO A.2
- **OG images chybějící** — viz D7 v TODO A.2
- **Apps/horologie-cz** — out of scope (FU5 cross-site audit zvlášť)

---

## Vstup pro další FU úlohy

**FU3 (soupis design-critique):** Ví o TD3 reference shape drift
v `veznihodinaPramen`. UX rozhodnutí o reference rendering by mělo
vyplynout z FU3 a teprve pak udělat TD3 migration.

**FU4 (karta design-critique):** Ví o TD4 quasi-Article layouts.
Karta layout je jeden z hlavních driverů (`KartaSbirky` komponenta +
karta-specific header). Pokud FU4 navrhne sjednocení, koordinovat s TD4.

**FU6 (README):** Bude profitovat z popisu architecture v sekci
„Layout strategy" (Article.astro pro [kategorie]/[slug] + o-hodinariu,
Base.astro + custom layout pro typed slug pages).
