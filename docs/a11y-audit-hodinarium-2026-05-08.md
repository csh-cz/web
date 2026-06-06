# Accessibility Audit: hodinarium-eu

**Standard:** WCAG 2.1 AA
**Datum auditu:** 2026-05-08
**Auditor:** Claude (skill `design:accessibility-review`, sonnet 4.5 v sister session)
**Rozsah:** Base layout, Photo, SearchModal, ReportIssueModal, mapa, hodináři (index + detail), tagy, globální tokeny v `apps/hodinarium-eu/src/styles/global.css`
**Branch při auditu:** `main` @ `206e929`

**Status remediace (2026-06-06):**

Critical (všechny hotové):

- **C1** (copper kontrast 3.84:1) ✅ — token posunut na `#c47049` (4.7:1) v `global.css:30`
- **C2** (stav-znicene 3.27:1) ✅ — `#d97070` v `hodinari/[slug].astro:767` a `soupis-veznich-hodin/[slug].astro:419`
- **C3** (SearchModal aria-live na full results) ✅ — separátní `#search-status` visually-hidden node + `announceCount()` funkce, listbox bez aria-live
- **C4** (SearchModal ArrowUp/Down focus) ✅ — `aria-activedescendant` pattern (preferred WCAG) v `syncCombobox()`, focus zůstává na input

Major (všechny hotové):

- **M1** (Leaflet `role="application"`) ✅ — `grep` v repo nenachází, refaktor proběhl dříve
- **M2** (`role="tab"` keyboard nav) ✅ — ArrowLeft/Right/Home/End + roving tabindex v `SearchModal.astro:635–659`
- **M3** (focus-visible globálně pro `<button>`) ✅ — `global.css:189–196` pokrývá `a, button, summary, [role="button"]`
- **M4** (`.report-form-close` touch target) ✅ — `min-width/height: 44px` v `ReportIssueModal.astro:178`
- **M5** (Photo credit overlay halo) ✅ — komponenta refaktorována, credit už NENÍ overlay, ale renderuje se mimo obrázek (caption pod / svisle vpravo dle aspect ratio)
- **M6** (`<input readonly>` v report formu) ✅ — refaktor na `<output>` v `ReportIssueModal.astro:73`
- **M7** (`style="border-bottom: none"` v mapě) ✅ — refaktor na `class="link-bare"` (`mapa.astro`)
- **M8** (mobile hamburger aria-label nemění) ✅ — toggle listener v `Base.astro:557–559`

Minor (3/4 hotové):

- **N1** (aria-modal na `<dialog>`) ✅ — explicit `aria-modal="true"` na obou dialogs
- **N2** (`.report-counter` aria-live) ✅ — `aria-live="polite" aria-atomic="true"` na `ReportIssueModal.astro:100`
- **N3** (`.report-status` role="alert" v error) ✅ — `setStatus()` dynamicky switchuje `role` (`ReportIssueModal.astro:376–392`)
- **N4** (`<h4>` v mapa popup) ✅ — refaktor na `<p class="popup-title"><strong>` v `mapa.astro:248` (+ stejné v `mapa-horologie.astro`, `soupis-veznich-hodin/mapa.astro`)

**Souhrn:** 17/17 nálezů uzavřeno. Audit z 2026-05-08 plně remediován.

---

## Summary

**Celkem nálezů:** 17 — 🔴 Critical: 4 · 🟡 Major: 9 · 🟢 Minor: 4

**Pozitivní zjištění** (žádný fix nepotřeba):

- Skip link `apps/hodinarium-eu/src/layouts/Base.astro:314` + `<main tabindex="-1" id="hlavni-obsah">` na řádku 421 — vzorová implementace
- Nav landmarky (`role="banner"`, `role="main"`, `role="contentinfo"`, `aria-label="Hlavní navigace"`) — kompletní
- Body text `--color-text` (#f5ecd9) na `--color-bg` — **16.2:1** (excellent)
- Brass-bright nadpisy na bg — **9.6:1**
- `<details>` mobile menu má min 44×44 touch target díky `summary { min-height: 44px; min-width: 44px }` v `global.css:202`
- `prefers-reduced-motion` ošetřeno v `global.css:1166`
- `<dialog>` modaly používají native `showModal()` → implicitní inert + Esc

---

## 🔴 Critical findings

### C1 — Token `--color-copper` má kontrast jen 3.84:1 (FAIL AA)

**Soubor:** `apps/hodinarium-eu/src/styles/global.css:14` (dark) + `:1186` (light variant)
**WCAG:** 1.4.3 Contrast (Minimum)

`#a85a3c` na dark bg = **3.84:1**, na light bg = **3.87:1**. Používá se globálně pro:

- `.eyebrow` (0.78rem)
- `.footer-h` (0.8rem)
- `.hodinar-meta` (0.8rem)
- `.hodinar-era-label` (0.78rem)
- `.hodinar-detail-meta dt` (0.7rem)
- `.search-result-meta` (0.75rem)
- `.tagy-dim-h::before` separator
- `.references-list` ref-author atd.

Všude je text < 14pt → fail AA pro normal text (4.5:1 required).

**Fix:** Posunout token na ~`#c47049` (≈ 4.7:1) **nebo** přemap copper jen na **dekoraci** (separator `›`, ★ pin, gradient hr) a pro text používat `var(--color-brass)` (#b8924a — **6.6:1** ✅, už ověřeno).

### C2 — `.stav-znicene` červený badge má 3.27:1 (FAIL AA)

**Soubor:** `apps/hodinarium-eu/src/pages/hodinari/[slug].astro:651`
**WCAG:** 1.4.3

`#b04848` na bg-elevated `#1f1814` = 3.27:1, font 0.72rem. Renderuje se v tabulce strojů u záznamů „zničené".

**Fix:** Změnit barvu na `#d97070` (jak má `.editor-note-todo` head v `global.css:728`) — **5.4:1** ✅.

### C3 — SearchModal: `aria-live="polite"` na full results region

**Soubor:** `apps/hodinarium-eu/src/components/SearchModal.astro:56`
**WCAG:** 4.1.3 Status Messages

Při každém keystroku se přehraje screen readeru až 12 result HTML bloků (titulek + meta + excerpt + skóre). Pro SR uživatele je to nepoužitelné — zaplaví je announcementy.

**Fix:** Oddělit visually-hidden status node se shrnutím („8 výsledků") s `aria-live="polite"` od samotného listu (přesunout list mimo live region). Použít ARIA combobox/listbox pattern s `aria-activedescendant`.

### C4 — SearchModal: ArrowUp/ArrowDown nepřesouvají skutečný focus

**Soubor:** `apps/hodinarium-eu/src/components/SearchModal.astro:577-584`
**WCAG:** 2.4.7 Focus Visible, 4.1.2 Name, Role, Value

Proměnná `activeIdx` mění jen CSS class `.is-active`, ale focus zůstává na inputu. SR uživatel neslyší, který výsledek je „vybrán", a `Enter` přesto vede na něj — diskonekt mezi vizuálním a programatickým focusem.

**Fix:** Buď přesouvat focus na `.search-result[data-idx="N"]` při šipkách (a vrátit zpět při dalším psaní), **nebo** implementovat `aria-activedescendant` se stable IDs na výsledcích a `role="combobox"`/`role="listbox"` na inputu/výsledkovém listu.

---

## 🟡 Major findings

### M1 — `role="application"` na Leaflet kontejnerech

**Soubor:** `apps/hodinarium-eu/src/pages/mapa.astro:59,86`
**WCAG:** 4.1.2

Switchne SR do raw input módu, uživatel přijde o standardní navigaci. Leaflet má vlastní keyboard support, ale `role="application"` je tu zbytečně agresivní.

**Fix:** Změnit na `role="region"` (s aria-label, který už je) nebo role smazat — `<div>` s aria-label zafunguje jako landmark přes label.

> Pozn.: stejný issue je pravděpodobně i v `mapa-horologie.astro` a `soupis-veznich-hodin/mapa.astro` — neauditováno, ale grep za `role="application"` doporučuji.

### M2 — `role="tab"` tabs bez keyboard navigace

**Soubor:** `apps/hodinarium-eu/src/components/SearchModal.astro:45,50`
**WCAG:** 2.1.1 Keyboard

ARIA tab pattern vyžaduje šipky vlevo/vpravo pro přepínání mezi tabs. Zde funguje jen click. SR uživateli announce „tab", ale nezvládne ho aktivovat klávesnicí v očekávané formě.

**Fix:** Přidat `keydown` handler na `[role="tab"]` element pro `ArrowLeft`/`ArrowRight` se shifte focusu + clickem; nebo přemapovat na obyčejné `<button>` (drop role="tablist"/"tab").

### M3 — Tlačítka bez explicitního `:focus-visible`

**Soubor:** `apps/hodinarium-eu/src/styles/global.css` (chybí globální rule); konkrétní komponenty bez focus stylu: `.search-mode-tab`, `.report-form-close`, `.report-form-cancel`, `.report-form-submit`, `.nav-search-btn`, `.editor-note-resolve`, `.fab`, `summary` (kromě min-size)
**WCAG:** 2.4.7

Globální `a:focus-visible` (`global.css:159`) se na `<button>` nedědí. Browser default outline je v dark theme často neviditelný.

**Fix:** Přidat globálně do `global.css`:

```css
button:focus-visible,
summary:focus-visible {
  outline: 2px solid var(--color-brass-bright);
  outline-offset: 3px;
  border-radius: 1px;
}
```

### M4 — `.report-form-close` `×` button: touch target ~24×24 px

**Soubor:** `apps/hodinarium-eu/src/components/ReportIssueModal.astro:47`
**WCAG:** 2.5.5 Target Size

`padding: 0 0.5rem; font-size: 1.5rem`, žádný `min-height`. Pod 44×44.

**Fix:** Přidat `min-width: 44px; min-height: 44px;` (nebo zvětšit padding) na `.report-form-close`.

### M5 — `Photo` credit overlay nemá pozadí

**Soubor:** `apps/hodinarium-eu/src/components/Photo.astro:98-130`
**WCAG:** 1.4.3

Text se vyhmatuje jen barvou (#000 nebo #fff) bez halo / shadow / semi-transparent BG. `tone` je auto-detekováno z pravého dolního rohu obrázku, ale rohy bývají nehomogenní (krajka detail, gradient). U mnoha fotek caption nebude splňovat 4.5:1 — fail bez ohledu na výpočet, neověřitelné.

> Pozn.: Komentář v souboru zmiňuje „halo", ale style ho aktuálně nemá.

**Fix:** Vrátit subtilní textový stín nebo poloprůhledné pozadí:

```css
.img-credit-overlay {
  background: rgba(0, 0, 0, 0.55);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.6);
}
.img-credit-overlay.credit-tone-dark {
  background: rgba(255, 255, 255, 0.55);
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.6);
}
```

### M6 — `<input readonly tabindex="-1">` v report formu

**Soubor:** `apps/hodinarium-eu/src/components/ReportIssueModal.astro:57`
**WCAG:** 1.3.1 Info and Relationships

Readonly + skip via Tab je OK, ale value („Title · URL") je obsah jen pro vizuál; SR ho přečte se „Stránka: text edit, [hodnota]". Vhodnější by bylo `<output>` nebo prosté `<p>` se `<span class="report-label">`. Funkčně OK, ale označení jako form input mate.

**Fix:** Přemapovat na `<output>` element (nebo `<dl><dt><dd>`) — neformulářový display.

### M7 — Inline `style="border-bottom: none;"` na linkech v lokace-list a popup

**Soubor:** `apps/hodinarium-eu/src/pages/mapa.astro:66,96,109,110`
**WCAG:** 1.4.1 Use of Color

Odstraňuje vizuální indikátor odkazu. Linky jsou jen barevně odlišené (brass-bright vs text-soft) v textu, kde nic jiného nesignalizuje interaktivitu. Hover/focus přidá underline, ale default state ho nemá.

**Fix:** Buď zachovat default `border-bottom` (faint dotted z globálního `a`), nebo doplnit underline na `:hover, :focus-visible` + zvážit `text-decoration: underline dotted` jako nenápadný indicator.

### M8 — Mobile hamburger summary aria-label se nemění

**Soubor:** `apps/hodinarium-eu/src/layouts/Base.astro:386`
**WCAG:** 4.1.2

Když je menu otevřené, label dál říká „Otevřít menu". Native `<details>` má implicitní `aria-expanded`, ale label by měl reflektovat stav.

**Fix:** Toggle aria-label v scriptu:

```js
details.addEventListener('toggle', () => {
  summary.setAttribute('aria-label', details.open ? 'Zavřít menu' : 'Otevřít menu');
});
```

---

## 🟢 Minor findings

### N1 — `<dialog>` modaly nemají explicit `aria-modal="true"`

**Soubor:** `SearchModal.astro:30`, `ReportIssueModal.astro:43`
**WCAG:** 4.1.2

Moderní browsery nastaví implicitně přes `showModal()`, ale starší VoiceOver/JAWS verze ne.

**Fix:** Přidat `aria-modal="true"` na `<dialog>`.

### N2 — `.report-counter` (znaková limit 0/2000) bez `aria-live`

**Soubor:** `ReportIssueModal.astro:84`
**WCAG:** 4.1.3

SR uživatel necítí přibližování limitu.

**Fix:** `aria-live="polite"` + `aria-atomic="true"` na `.report-counter`.

### N3 — `.report-status` v error stavu by měl `role="alert"`

**Soubor:** `ReportIssueModal.astro:97`
**WCAG:** 3.3.1

Aktuálně `role="status"` + `aria-live="polite"` ✅, ale chybový stav by ideálně měl `role="alert"` (assertive) — chyby jsou priority.

**Fix:** Při error switchnout `role` dynamicky, nebo nechat `aria-live="assertive"` v error stavu.

### N4 — Mapa popup HTML používá `<h4>` mimo h3 sekci

**Soubor:** `mapa.astro:244` (`buildPopupHtml`)
**WCAG:** 1.3.1

Heading hierarchy hop (h2 sekce → popup `<h4>` bez `<h3>`). Většinou neviditelné, ale outline tools to flag.

**Fix:** Změnit na `<strong>` nebo `<p class="popup-title">`.

---

## Color Contrast Check (tokeny — dark mode default)

| Element | Foreground | Background | Ratio | Required | Pass? |
|---|---|---|---|---|---|
| Body text | `#f5ecd9` | `#14100c` | **16.2:1** | 4.5 | ✅ |
| Headings (brass-bright) | `#d9b274` | `#14100c` | **9.6:1** | 4.5 | ✅ |
| `--color-brass` | `#b8924a` | `#14100c` | **6.6:1** | 4.5 | ✅ |
| `--color-text-soft` | `#d4c5a8` | `#14100c` | **11.2:1** | 4.5 | ✅ |
| `--color-text-muted` | `#9a8c75` | `#14100c` | **5.8:1** | 4.5 | ✅ |
| **`--color-copper`** (C1) | `#a85a3c` | `#14100c` | **3.84:1** | 4.5 | ❌ |
| `--color-copper` (light, C1) | `#a85a3c` | `#efe3c8` | **3.87:1** | 4.5 | ❌ |
| **`.stav-znicene`** (C2) | `#b04848` | `#1f1814` | **3.27:1** | 4.5 | ❌ |
| `.stav-in_situ` | `#4caf50` | `#1f1814` | **6.3:1** | 4.5 | ✅ |
| `.stav-preneseno` | `#5b9dd9` | `#1f1814` | **6.0:1** | 4.5 | ✅ |
| `.stav-ztracene` | `#d9a05b` | `#1f1814` | **7.6:1** | 4.5 | ✅ |
| Search placeholder | `#9a8c75` | `#0a0807` | **6.1:1** | 4.5 | ✅ |

---

## Priority Fixes (akční seznam — pořadí návratu hodnoty)

1. **C1: Posunout `--color-copper`** na ~`#c47049` (nebo úplně přemapovat textové použití na `--color-brass`). Nejvíc viditelný dopad — copper se objevuje na **každé** stránce. **Touch:** `apps/hodinarium-eu/src/styles/global.css:14` + `:1186`. **Diff:** ~2 řádky.
2. **M3: Globální `button:focus-visible`** v `global.css`. **Touch:** 1 nový rule v `global.css`. **Diff:** ~5 řádků. Jednorázový fix pro 6+ komponent.
3. **C2: Zvýšit kontrast `.stav-znicene`** na `#d97070`. **Touch:** `hodinari/[slug].astro:651`. **Diff:** 1 řádek.
4. **M1: Smazat `role="application"`** z mapa kontejnerů. **Touch:** `mapa.astro:59,86` (+ pravděpodobně `mapa-horologie.astro`, `soupis-veznich-hodin/mapa.astro` — ověřit greppem). **Diff:** 2–6 řádků.
5. **M5: Vrátit semi-transparent BG** na Photo credit overlay. **Touch:** `Photo.astro:98-130`. **Diff:** ~6 řádků CSS.
6. **M4: Touch target** na `.report-form-close`. **Touch:** `ReportIssueModal.astro:153`. **Diff:** 2 řádky.
7. **M8: Mobile hamburger label toggle.** Vyžaduje malý JS handler. **Diff:** ~5 řádků v Base.astro inline scriptu.
8. **C3 + C4: Refaktor SearchModal aria pattern** — listbox + activedescendant. Nejtěžší — odhad 1–2 hodiny práce. Doporučuji jako samostatný commit.
9. **M2: Keyboard tabs šipky** v SearchModalu. Společně s C3/C4 — stejná komponenta.
10. **N1–N4 hygienické fixy** — bundle do jednoho commitu.

---

## Co audit NEMOHL ověřit (bez browseru)

- **Real screen reader announcement** — VoiceOver/NVDA testing vyžaduje fyzické spuštění; doporučuju manuálně ověřit C3/C4 po fixu.
- **Photo overlay contrast** — protože caption je nad obrázkem s arbitrary pozadím, statická analýza neumí říct, kdy konkrétně fail. M5 fix to obejde.
- **Skutečný keyboard tab order** — `<dialog>` modaly tabují přes shadow DOM browseru, vyžaduje runtime ověření.
- **200% zoom layout reflow** [WCAG 1.4.10] — jen otevření v browseru ukáže, jestli něco horizontálně teče.
- **`prefers-color-scheme: light` real-world rendering** — token recompute proběhl korektně, ale UI nálezy se mohou lišit.

Doporučuji po implementaci C1–C4 + M1/M3/M4 spustit ještě jednou Lighthouse a11y audit (do `astro dev` browseru) — chytí cca 30 % zbylých issues a podpoří manuální VoiceOver průchod.

---

## Závěr

Web má **silný základ**:

- Skip link, landmarks, focus-visible na linkech, reduced-motion, native dialogy, dobrý baseline kontrast textů.

Hlavní dluh je:

1. **Token `copper`** (vyfailí v textovém použití napříč webem)
2. **Search modal pattern** (nepoužitelný pro screen reader)

Zbytek jsou drobné hygienické fixy, většina z nich < 5 řádků diff.
