# Design critique — Sbírková karta

**Datum:** 2026-05-09
**Rozsah:** `/sbirka/karta/[slug]` + `KartaSbirky.astro` komponenta
**Autor:** Claude (FU4 z TODO A.4)

3 typy návštěvníka: **badatel** (cituje), **laik** (pochopit
co to je), **kurátor** (eviduje, restauruje).

## Kontext

- 268 sbírkových karet (`content/hodinarium-eu/inv-*-*.md`)
- KartaSbirky komponenta = `<dl>` s 18 standardních fields + `extra[]`
- Detail page: `[slug].astro` (401 ř.)
  + JSON-LD CreativeWork
  + Citation export (RIS, BibTeX, CSL JSON, IIIF)
  + DC.* + Highwire meta tags v `<head>`
  + komplet (sub-položky), vázané články

## Audience A: badatel cituje

**Path:** Hledá konkrétní stroj → najde kartu → potřebuje citovat
v odborné práci.

**Friction:**

- **P3 — citation export linky neviditelné v `<head>`.** TODO bod
  „citation export linky v `<head>` neviditelné". Reálně:
  `alternateLinks` v Base.astro citation prop generuje `<link
  rel="alternate" type="application/x-bibtex" href=".../citation.bib"
  title="Citace BibTeX">` v `<head>`. Zotero connector to umí
  detekovat, ale **uživatel sám neví že to tam je**.
  - **Akce:** Karta má sekci „Citovat tento předmět" s viditelnými
    download tlačítky (RIS / BibTeX / CSL JSON / IIIF). To **stačí**.
    P3 = nice-to-have: přidat krátkou poznámku „Pro Zotero stačí
    přidat tuto stránku přes konektor — meta tagy jsou v hlavičce."
    Vzdělávací moment.

- **P2 — `vyrobce: "Jan Prokeš v Sobotce, 1868"` není linkovaný.**
  V `KartaSbirky.astro` je vyrobce vyrendrován jako plain string.
  V `apps/hodinarium-eu/src/utils/findHodinarFromVyrobce.ts` existuje
  utility pro slug matching, ale komponenta ji nepoužívá. Když je
  v repu medailon `jan-prokes`, badatel by čekal automatický link.
  - **Akce:** V KartaSbirky pro field `vyrobce` zkusit
    `findHodinarFromVyrobce(value)` → pokud match, render `<a
    href="/hodinari/<slug>">vyrobce text</a>`. Bonus: `<meta
    itemprop="creator">` v `<a>` aby microdata držela.

- **P3 — `datace` field konflikt s catalog heuristikou.** Karta má
  explicit `datace: "1868"` ve frontmatteru, ale `catalog.json`
  generation v `build-catalog.ts` používá `extractYear()` z titulku +
  body (heuristika). Pro některé karty mohou být odlišné. Bonus z
  předchozí sezóny (commit 7098ed7): build-catalog už respektuje
  explicit `year:` ve frontmatteru — ale `karta.datace` není mapped.
  - **Akce:** V `build-catalog.ts` po načtení frontmatteru zkusit
    parsovat `karta.datace` (může být `"1868"`, `"kolem 1850"`,
    `"přelom 17. a 18. století"`) — extract first 4-digit number,
    použít jako default pro `year` field, pokud `fm.year` není
    explicit set.

## Audience B: laik

**Path:** Náhodou klikne na kartu z mapy / Atlasu → chce pochopit
co je to „čtvrťový stroj" / „Grahamův krok" / „klecový rám z pásnic".

**Friction:**

- **P1 — odborná terminologie bez vysvětlení.** Karta má 18 fields,
  většina v terminologii: „rám stroje: klecový z ocelových pásnic",
  „krok jdoucího stroje: Grahamův krok", „bicí stroje: čtvrťový a
  hodinový", „kyvadlo: délka cca 235 cm". Laik narazí na termín a
  nemá kam kliknout.
  - **Akce:** Slovník (auto-link skript SL8 — `pnpm slovnik:auto-link`)
    běží na clanky body, ale **ne na KartaSbirky komponentě**. Stejně
    by měla termíny v `<dd>` linkovat na slovník. Implementace: postprocess
    v komponentě — pro každou hodnotu projít `slovnikSlugs`, nahradit
    první výskyt za `<a href="/slovnik/<slug>">` (1 link / heslo /
    hodnota, ne každý výskyt). Same logic jako v auto-link-slovnik.mjs.

- **P2 — drop-cap u `prose-content`.** Detail karty má `drop-cap`
  class na `<div class="prose-content drop-cap">`. Když je tělo karty
  prázdné nebo začíná seznamem, drop-cap visí mezi karta a nic. Pokud
  body začíná `<h2>`, drop-cap se neaplikuje, OK.
  - **Akce:** Conditional drop-cap class — jen pokud body má `<p>` jako
    první element s textem ≥ N znaků.

- **P3 — chybějící overview pro laika.** „Komplet obsahuje" + „Vážící
  se články" + „Citovat" + sama karta = mnoho aside boxů kolem
  hlavního textu. Laik se ztratí. Mohlo by jít o sticky TOC v sidebar
  na desktopu, ale to už je větší layout refaktor.

## Audience C: kurátor

**Path:** Eviduje nový předmět / restauruje stávající → potřebuje
data + restaurační historii.

**Friction:**

- **P2 — restaurování field je single string.** Když má stroj
  několik restaurací různých let, `restaurovani: "..."` to musí
  spojit do jedné věty. Pro evidenci by se hodil **timeline**:
  pole `restauratorskeZasahy[]` se `{ rok, kdo, popis, fotokopie? }`.
  - **Akce:** Přidat schema field + render. Postupná migrace dat.
    Backward compat: pokud `restaurovani` plain string → render
    jako jeden záznam.

- **P3 — `pridanoDoSbirky: 2018` bez kontextu.** Číslo bez popisu.
  Bylo to při akvizici? Donaci? Ze zápůjčky → trvalé? Aktuálně
  nečitelné. Mohlo by být `pridanoDoSbirky: { rok: 2018, zpusob:
  "donace", od: "Petr Král" }` — strukturované. Ale to vyžaduje
  ručního zásahu napříč 268 kartami.

- **P2 — print stylesheet pro evidenci.** Test `@media print`
  v `global.css:1333`:
  - ✓ Bílé pozadí, černý text, font 11pt
  - ✓ Skryté: site-header, site-footer, fab, mobile-menu, details
  - ✓ External links zobrazí URL
  - ✓ Drop-cap fix
  - ✗ KartaSbirky `<dl>` **nemá explicit print rules**. `display:
    grid; grid-template-columns: max-content 1fr` v print prostředí
    někdy zlomí (Chrome OK, Firefox různě). Pro tisk možná lepší
    explicit `display: table` + `dt/dd` jako buňky.
  - ✗ Foto-grid neoptimalizovaný — multi-column grid vrací neuspořádané
    obrázky na print page.
  - ✗ Karta-cite block (citation export) — pro tisk redundantní,
    schovat? Nebo render jako "BibTeX dostupný online: <URL>"?
  - **Akce:** Per-component `@media print` rules. Specifický fix:
    KartaSbirky `display: block` + `dt: float: left` na print.

## Vztah karta ↔ medailon hodináře

Klíčová cross-link, ale aktuálně asymmetric:
- Medailon → karty: ano (`/hodinari/<slug>` má sekci „Soupis prací").
- Karta → medailon: jen pokud editor explicitly napíše
  `[Jan Prokeš](/hodinari/jan-prokes)` v body. KartaSbirky komponenta
  nelinkuje vyrobce automaticky (viz P2 výše).

**Akce:** Implementovat auto-match v KartaSbirky.astro (viz výše).

## 12+ field density

Aktuálně 18 standardních fields + nested `puvodniUmisteni` + `extra[]`.
Ne všechny jsou vždy vyplněné, ale vizuálně dl-grid může vypadat dlouhý.

**Friction:**

- **P3 — sekce fieldů** v komponentě jsou logické (Identifikace →
  Konstrukce → Spolková evidence) ale **vizuálně nerozdělené**.
  - **Akce:** Přidat tenké subhead linky:
    ```html
    <p class="karta-section">Konstrukce</p>
    ```
    nebo group separator:
    ```html
    <hr class="karta-divider" />
    ```
    Kurátor + badatel snadněji najde co hledá.

## Implementační priorita (návrh)

1. **P1 — Auto-link slovníkových termínů v KartaSbirky** (laik
   pochopí terminologii)
2. **P2 — Auto-link `vyrobce` na medailon hodináře**
   (badatel + cross-discoverability)
3. **P2 — `karta.datace` jako fallback do build-catalog year**
   (consistency napříč timeline)
4. **P2 — Restaurátorské zásahy timeline** (kurátor evidence)
5. **P2 — Print stylesheet pro KartaSbirky komponentu**
6. **P3 — Section subheads** v dl-listu (Identifikace / Konstrukce /
   Spolková evidence visually rozdělené)
7. **P3 — Conditional drop-cap** (jen když body má vhodný 1. odstavec)

## Out of scope (samostatná témata)

- IIIF viewer integrace (manifest URL je v citation, ale není inline
  viewer — vyžaduje IIIF JS lib)
- Hi-res foto download s license attribution baked-in
- Karta history / changelog (kdo / kdy editoval)
- Vázání karet do souborů („Komplet" už je, ale chybí inverzní —
  „Tato karta je součástí kompletu X")
