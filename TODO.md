# TODO

Otevřené úkoly pro CSH Web (hodinarium.eu, horologie.cz).
Rozděleno podle toho, kdo může s úkolem hnout — **Claude autonomně** vs **lidský vstup**.

---

# 🤖 Část A — Claude autonomně

Programování, automatické opravy, generování obsahu z primárních pramenů.
Lze pustit bez čekání na vstup od Davida/Petra.

## 🎯 Doporučený další krok — Top 5

Curated z níže uvedených sekcí. Výběr podle **value-per-hour** + nepřítomnost
blokátorů:

| # | Úloha | Sekce | Odhad | Proč |
|---|---|---|---|---|
| 1 | ~~**FU1 UX copy audit**~~ ✅ hotovo | A.10 | ~20 min | 6 rewritů: stub note, draft placeholder, search hints, fallback, 404, report hint + `stavLabel()` utility. |
| 2 | ~~**TD1 + a11y M7 bundle**~~ ✅ hotovo | A.9 + tech-debt | ~30 min | Sjednoceno na `.link-bare` class. WCAG 1.4.1 vyřešeno. |
| 3 | ~~**SL8 Cross-link kroky → slovnik**~~ ✅ hotovo | A.6 | ~1–2 h | 306 auto-linků v 174 souborech + cross-link sekce na každé krok detail page. |
| 4 | ~~**FU6 README pro hodinarium-eu**~~ ✅ hotovo | A.10 | ~30 min | apps/hodinarium-eu/README.md přepsán (410 ř.) — architektura, 6 collections, CMS pipeline, semantic search, deployment. |
| 5 | ~~**TD2 dialog handler extrakce**~~ ✅ částečně | tech-debt | ~30 min | ReportIssueModal refaktorováno na `attachDialogControls()` helper. SearchModal čeká na bundle s C3+C4+M2 (define:vars blokuje ESM import). |

**Většinu lze pustit nezávisle.** Jediný měkký řetěz: FU7 inventář může změnit
prioritizaci ostatních FU (typicky odhalí redundance).

---

## A.1 — Tech & funkcionalita (features)

- [ ] **T4 Lighthouse CI / Web Vitals** — `lhci/cli` v GitHub Actions
      s baseline + threshold. Žádné performance budgety, není jasné Core
      Web Vitals skóre (~2 h).
- [ ] **T7 Network graph hodinařů** — `/hodinari/index.astro` jako
      force-directed graph (Vis.js / D3) — vazby učitel-žák, otec-syn,
      dílny, převzaté firmy mezi 81 hodináři (~6 h).
- [ ] **T10 Dark / light mode** — hodinarium-eu používá brass dark téma
      (default), není přepínač. CSS custom properties + toggle (~3 h).
- [ ] **Live ciferník na titulce** — SVG zobrazující aktuální stav
      astrolábu (sun/moon position).

## A.2 — Tech dluh / kvalita

- [ ] **D1 Test coverage** — Vitest setup pro `scripts/*.ts`
      (parse-soupis, build-redirects, apply-popisy, migrate-renumbering),
      snapshot testy pro layouty (~3 h).
- [ ] **D2 BUGS.md aktualizace** — rerun `pnpm test:e2e`, fix nebo doc
      (crawl 2026-04-28: 54 no-h1, 21 JS error, 20 HTTP error). Většina
      no-h1 už ok po /img/ refactoru (~2 h).
- [ ] **D5 Konsolidace _redirects** — 776 řádků, CF limit 2 000. Regroup
      pomocí glob patterns.
- [ ] **D6 Slug standardizace na kebab-case** — 114 souborů
      v `content/hodinarium-eu/` má non-kebab slugy (`Arduino`, `astro2_NTP`,
      `decin_jednotny_cas`, …). 114 file renames + 114 redirectů + grep
      všech inline odkazů + SEO reindex. Citlivá ale čistě technická.
- [ ] **D7 Chybějící OG images** — ~493 článků/karet, OG jen pro některé.
      Build-time check, který vypíše chybějící (~30 min).
- [ ] **`Article.astro` byline `<time>`** — vykresluje `Invalid Date`
      pro většinu článků (chyba v parsování `lastModified` z frontmatteru).
- [ ] **OG images do CI** — generuje se ručně přes `pnpm og:build`.
- [ ] **`build-og-images.ts` cleanup** — stále vyrábí OG pro vyhozené
      spolkové slugy (`spolek`, `sponsor`, `stanovy`).
- [ ] **`strip-dead-refs.ts` cleanup** — už ne aktuální, smazat.
- [ ] **`raw/.DS_Store` gitignore** — měl by být v gitignore.
- [ ] **`build-image-index.ts` pro horologie-cz** — zatím jen
      hodinarium-eu; rozšířit na ~63 obrázků horologie-cz.
- [ ] **`rehype-picture` `wrapInPicture: true`** — zapnout až po
      `pnpm imgvariants:build` a commitu .avif/.webp variant.
- [ ] **CI cleanup** — staré Cloudflare Pages preview deployments smazat
      (kvóta).

## A.3 — Standardy

- [ ] **S1 a11y audit — automatizace** — `@axe-core/playwright` v existujících
      e2e jako CI gate (~2 h). První ruční audit už proběhl —
      `docs/a11y-audit-hodinarium-2026-05-08.md` (17 nálezů, 6 quick-wins
      vyřešeno, viz A.9 zbývající).
- [ ] **S3 `docs/CONTRIBUTING.md`** — runbook „jak edituji článek" pro
      nové přispěvatele (~1 h).
- [ ] **README pro nové členy** — jak se zapojit, jak commitnout, koho
      kontaktovat.

## A.4 — Obsah (automatizace)

- [ ] **B2 Revize obsahu (evergreen)** — průběžná kontrola legacy článků:
      OCR artefakty (`**X**slovo`, duplicity `* * *`), atribuce → `author:`
      frontmatter, wiki/mapa odkazy → `references:`, `<Photo>` místo
      `![]()` u obrázků s creditem. Pravidla v skill `clanky-konvence`
      sekce 18. Postupně při dotyku článku.
- [ ] **Skript pro auto-import fotek z ZIP** — rozzipovat → přejmenovat
      → doplnit data file. Naprogramovat až bude první ZIP.
- [ ] **D5 datace + B5/D4 audit** — vygenerovat report 14 podezřelých
      roků < 1500 (heuristika z lastModified vs filename rok), předat
      Davidovi/Petrovi k ručnímu rozhodnutí (Claude nemůže rozhodnout
      bez kontextu, ale může připravit analýzu).

## A.5 — Slovník: rozšíření obsahu (z primárních pramenů)

Postup metodou jako MVP — Zotero MCP semantic search + verbatim grep
v plaintextech (Šumavský 1851, Špatný 1882, Sušický 1900, Sladkovský 1947).

- [ ] **SL3 Hodinky kapesní/náramkové** (~10 hesel) — kalibr, werk,
      korunka, sklíčko, pouzdro, signatura, automatic, chronograf,
      fly-back, GMT
- [ ] **SL4 Profese a hodinářské školy** — hodinář, pouzdrář, regionální
      školy (pražská, švarcvaldská, vídeňská, anglická, francouzská,
      švýcarská)
- [ ] **SL5 Bicí mechanismy detail** — Westminster chime, čtvrťové bití,
      repetice, opakovačka, Grande sonnerie 1859
- [ ] **SL6 Šumavský 1851 — neuvedené termíny** (~60) — kalendář,
      dialektismy: kolisadlo, závěšadlo, krokvička, kyvák; časoměrné
      systémy: pršící, komítací
- [ ] **SL7 Rozšíření existujících hesel:**
      - `krok` — Bureš 1965 dělení na soukolí I/II/III
      - `setrvačka` — moderní Nivarox / Glucydur slitiny
      - `vlásek` — detail Phillipsovy matematiky (3 podmínky)

## A.6 — Slovník: tech / integrace

- ~~**SL8 Cross-link kroky → slovnik**~~ ✅ Hotovo. Dvě části:
      - `scripts/auto-link-slovnik.mjs` (paralelně s `auto-link-kroky.mjs`):
        24 hesel × 100 aliasů, **306 linků v 174 souborech**. Whitelist
        obecných termínů (kyvadlo: 106, soukolí: 40, bicí stroj: 36,
        větrník: 29, …). Kroky priorita: skip pokud line obsahuje
        `/kroky/` link. `pnpm slovnik:auto-link` + `--dry-run`.
      - Cross-link sekce v `pages/kroky/[slug].astro`: pro každý krok
        zobrazí 4 obecná slovníková hesla (krok, kotva, krokové kolo,
        paleta) jako cards pod „Související slovníková hesla".
- [ ] **SL9 Search index** — zařadit slovnik hesla do Fuse.js corpusu
      (`scripts/extract-search-corpus.mjs`).
- [ ] **SL11 CMS widget pro Sveltia** — frontmatter editor pro slovnik
      collection (překlady, varianty, definice, příbuzné slugy).
- [ ] **SL12 /slovnik/ filter/search box** — při 50+ heslech přidat
      live filter (de/en/fr term, cs heslo, varianta).
- [ ] **SL13 Reference IDs s anchorlinkováním** — `[Zotero \`KEY\`]`
      v citacích v body propojit na `references.json` (CSL render přes
      citeproc-js stejně jako u kroku detailu).

## A.7 — Tooling

- [ ] **TL1 Zotero MCP `find_similar` bug — issue draft** — Claude může
      sepsat reproducer + GitHub issue text. Filing samotného issue
      vyžaduje GitHub identitu Davida. Vrací nesouvisející matche
      (např. Limax slug pro hodinářský článek). Workaround zatím:
      `semantic_search` s textem místo `find_similar` s ID.

## A.8 — Připraveno k nasazení po DNS switch

Až se přepne DNS (viz Část B), Claude provede:

- [ ] `apps/hodinarium-eu/src/layouts/Base.astro` → smazat
      `<meta name="robots/googlebot">` bloky (DEV STATE komentáře jsou
      waypointy)
- [ ] `apps/horologie-cz/src/layouts/Base.astro` → totéž
- [ ] `apps/hodinarium-eu/public/robots.txt` → vrátit `Allow: /`
      + `Disallow: /og-preview /og/ /podklady/`
- [ ] `apps/horologie-cz/public/robots.txt` → vrátit `Allow: /`
      + `Disallow: /og/`
- [ ] Submitnout sitemapy do Google Search Console

## A.9 — A11y audit 2026-05-08 — odložené nálezy

První ruční audit hodinarium-eu (`docs/a11y-audit-hodinarium-2026-05-08.md`)
identifikoval 17 nálezů. **Quick-wins (C1, C2, M1, M3, M4, M5) vyřešeny**
v této větvi. Zbývají položky vyžadující větší refaktor nebo bundling:

- [ ] **C3 + C4 + M2 + TD2-část-2: SearchModal aria pattern refaktor** —
      combobox/listbox pattern s `aria-activedescendant` na výsledcích,
      status `aria-live` oddělený od listu, ArrowUp/Down přesouvá
      programatický focus, ArrowLeft/Right pro tabs. Při tom **přesunout
      data injection** z `define:vars` na `<script type="application/json">`
      data island, čímž se umožní ESM import a vyřeší se i TD2-část-2
      (`attachDialogControls()` helper). Nejnáročnější — ~1–2 h. Ideálně
      po VoiceOver test. Komponenta: `apps/hodinarium-eu/src/components/SearchModal.astro`.
- [ ] **M6: Report form `<input readonly tabindex="-1">` → `<output>`**
      — readonly+tabindex je OK funkčně, ale SR čte „form input"; lepší
      `<output>` element. `ReportIssueModal.astro:57`.
- ~~**M7: Inline `style="border-bottom: none;"` na linkech v mapě**~~ ✅
      Sjednoceno na `.link-bare` class v global.css se subtle dotted underline
      (non-color signal pro WCAG 1.4.1). 5 výskytů v mapa.astro × 3 +
      mapa-horologie.astro × 2 nahrazeno. Bundle s tech-debt TD1.
- [ ] **M8: Mobile hamburger aria-label toggle** — `<details>` má implicitní
      aria-expanded, ale label dál říká „Otevřít menu" i když je menu otevřené.
      Malý JS handler v `Base.astro`.
- [ ] **N1–N4 hygienické fixy (bundle)** — `aria-modal="true"` na `<dialog>`,
      `aria-live` na `.report-counter`, `role="alert"` v error stavu
      `.report-status`, `<h4>` v map popup → `<strong>` (heading hierarchy).

## A.10 — Design / engineering follow-ups z auditu 2026-05-08

Vyplynulo z accessibility auditu — kompletní specs v
`docs/design-followups-hodinarium-2026-05-08.md` (skill `design:*` /
`engineering:*`). Každá úloha má trigger string, file:line refy, plánovaný
výstup. **Nepouštět batch-em** — uživatel chce mezi nimi rozhodovat.

### 🔴 High priority

- ~~**FU1 UX copy audit**~~ ✅ Hotovo. Aplikováno 6 rewritů:
      - Stub note hodináře — „čeká na svůj příběh" + mailto link
      - Draft placeholder — „rozepsaný" místo „rozpracovaný"
      - SearchModal hints (3 místa: default, dynamic per-mode, fallback)
      - 404 lede — em-dash zlepšuje rytmus
      - ReportIssueModal hint — strip „User-Agent" / „repu" jargon
      - Stav badges — `stavLabel()` utility v `data/labels.ts` místo
        `replace(/_/g, ' ')` quick hack. Adjektivní formy sjednocené
        se soupisem (`ztracené`, `zničené`, `stav neznámý`).
      Footer micro-copy a hero CTA ponechány (formálně nutné resp.
      čeká B3 audit od Petra).

### 🟡 Medium priority

- [ ] **FU2 Design critique — hero/index** (~15 min, `design:design-critique`)
      — `index.astro` pro 3 audience segmenty (návštěvník muzea Děčín / cs
      amatér / EN enthusiast). Hero text register, CTA (chybí „Naplánuj
      návštěvu"?), featured grid × random Atlas, scroll fatigue, mobile
      320px clamp().
- [ ] **FU3 Design critique — soupis věžních hodin** (~15 min) —
      `/soupis-veznich-hodin/` index/detail/mapa. Use case: „Hledám hodiny
      v severních Čechách / od konkrétního hodináře". Index ↔ mapa
      duplikace, stav badges scanability, mobile column hide.
- [ ] **FU4 Design critique — sbírková karta** (~20 min) —
      `/sbirka/karta/[slug]` + KartaSbirky komponenta. Audience: badatel
      cituje × laik × kurátor. 12+ field density, citation export linky
      v `<head>` neviditelné, vztah karta ↔ medailon hodináře přes
      `vyrobce` matching, print stylesheet check.
- ~~**FU7 Tech-debt inventář**~~ ✅ **Hotovo** —
      report v `docs/tech-debt-hodinarium-2026-05-08.md`. Identifikováno
      8 položek (TD1–TD8), 2 medium-priority (TD1 inline border-bottom
      bundle s a11y M7, TD2 dialog handler extrakce před SearchModal
      aria refaktorem), 5 low + 1 skip (TD6 data/index.ts).

### 🟢 Low priority

- ~~**FU6 Top-level README pro apps/hodinarium-eu**~~ ✅ Hotovo —
      `apps/hodinarium-eu/README.md` přepsaný (410 řádků). Pokrývá:
      stack, build velikost (1174 stran, 1.1 GB), 6 content collections,
      routing & layouts, draft mode variant A, Pages Functions API surface,
      Sveltia CMS pipeline, semantic search Workers AI, content authoring
      konvence (frontmatter, ISO 690, Photo, image variants, tags),
      skripty, Cloudflare Pages deployment, audit reporty + skill cross-links.
- [ ] **FU5 Design system audit (cross-site)** (~40 min, `design:design-system`)
      — drift hodinarium-eu × horologie-cz: tokeny, komponenty (Card),
      footer patterns, button styles. **Pustit až po stabilizaci obou
      webů** (a11y bundle B + případné slovník expansion), jinak rebuilduje
      pohyblivý cíl. Migration plan: které tokeny/komponenty do shared
      `packages/ui`, které jsou legitimně site-specific.

---

# 👤 Část B — Vyžaduje lidský vstup

Rozhodnutí, externí data, přístupy, expertní znalosti.
Claude se zatím nepustí, dokud nedojde input.

## B.1 — Audit (čeká na Petra)

- [ ] **B3 Vybrané exponáty per sekce** — Claude dal výběr 4×4, Petr
      potvrdí/změní
- [ ] **B5 Datace článků** — opravit ručně 14 podezřelých roků < 1500.
      Claude může připravit analýzu (viz A.4), David/Petr rozhodne každý
      případ.
- [ ] **B7 Kategorizace 124 nezařazených** — sporných ~30 článků
      vyžaduje ruční review kategorie (D3 = duplikát).
- [ ] **C2 Logo** — soutěž v plénu, nebo nechat textové (rozhodnutí
      výboru).

## B.2 — Obsah od Petra / Davida

- [ ] **Akce — fotografie** z Google Photos drop-zone do
      `apps/horologie-cz/public/img/akce/<slug>/`. 5 akcí už má složky,
      zbytek postupně.
- [ ] **Příspěvky na členských schůzích** — Petr dodá PDF / přepisy /
      audio.

## B.3 — DNS přesun (David)

- [ ] **`hodinarium.eu`** přesměrovat na Cloudflare Pages
      (nyní `hodinarium-eu.pages.dev`)
- [ ] **`horologie.cz`** přesměrovat na Cloudflare Pages
      (nyní `horologie-cz.pages.dev`)

DNS přesun, TLS Let's Encrypt zdarma. ~30 min každá doména. Po přepnutí
Claude provede odblokování indexace (viz A.8).

## B.4 — Slovník (vyžaduje experta / akvizici)

- [ ] **SL1 Obrázky pro hesla** — všech 35 hesel má placeholder. Claude
      umí najít a vyparsovat z public-domain pramenů (Dietzschold 1894
      Tafel 4, Saunier 1887, Sladkovský 1947), ale **vlastní foto
      z Hodinária** (kladívko, cymbál, větrník, posůvka, srdcovka)
      vyžaduje David.
- [ ] **SL2 Verifikace u experta** — 10 termínů v `reference/k-overeni.md`
      čeká na verifikaci (Knespl / Skála): koláčkový vs kolíčkový krok,
      krok přezmenový etymologie, cinkař obor 60. let, rejdovka/pisárka
      OCR, vypouštěč, stupník vs stupní kolečko, kotvička dvojramenná
      pravopis, remontoirní vs remontoár, Hippův přerušovač atribuce.
- [ ] **SL10 Slovník v hlavní navigaci** — zatím jen z `/vice`. Po
      dosažení ~50 hesel rozhodnout přesun do hlavního navu (David).
- [ ] **INV1** — `inv-251` duplikát s jiným záznamem (rozhodnout který
      smazat).
- [ ] **INV2** — `inv-65/67/68` discrepancy: Petřín × Lissner × Skála
      × Kavalír × Sluneční × Model orloje (čeká: ujasnění od Petra/Skály).

## B.5 — Strategická rozhodnutí

### 🤖 AI funkce — čeká na zelenou + reálnou poptávku

A1 (licence CC BY 4.0) je hotová. Zbývá vybrat, zda a kdy aktivovat:

- [ ] **TL;DR generator** — Gemini Flash, free tier
- [ ] **Sémantické vyhledávání** — Transformers.js v browseru (cesta A,
      doporučená), Cloudflare Vectorize (cesta B), nebo Pagefind +
      synonyma (cesta C, nejmenší krok)
- [ ] **Zeptej se Hodinária** — RAG chatbot přes Cloudflare Workers AI
      (free tier 10k Neuronů/den)
- [ ] **AI překlad CS → EN** — glosář horologických termínů

#### Sémantické vyhledávání — návrh tří cest

**A. Transformers.js v prohlížeči (doporučeno)** — embed při buildu
(`@xenova/transformers`), runtime model `Xenova/multilingual-e5-small`
(~120 MB, do cache). Provoz 0 Kč navždy. ~4–6 h práce.

**B. Cloudflare Workers AI + Vectorize** — embed do Vectorize indexu,
Worker dotaz. Free tier 10k Neuronů/den. ~6–8 h práce.

**C. Pagefind + synonyma** — současný Pagefind doplnit o ručně psaný
slovník (švarcvald = Schwarzwald = lesní hodiny). ~1–2 h. Není sémantika,
ale laciné a obratem užitečné.

Implementace lze postupovat C → A. C je vždy výhra; A se zapne až po
DNS přesunu (kvůli velikosti indexu chce ostré HTTP/2 + Brotli).

### 🔒 Decap CMS / web admin — odložené

Až bude potřeba (Petr/další chce sám editovat):

1. **Cloudflare Access** pro `/admin/*` URL — magic-link, Allow list
2. **Decap CMS** ([decapcms.org](https://decapcms.org)) nebo modernější
   **Sveltia CMS** — single-page app, commit do gitu přes GitHub API
3. Editorial workflow — každá editace jako PR
4. CF Pages preview pro každý PR

Odhad práce: ~3 h setup, jednorázově.

### 🌐 Migrace orloj.eu — odložené

~200 stránek, stejný pipeline. Petr explicitně řekl „zatím nedělat".

### 🎨 Design — vyžaduje data / kontent

- [ ] **T11 / 3D modely** vybraných hodin — vyžaduje fotogrammetrii nebo
      manuální modeling.
- [ ] **Audio nahrávky** úderů věžních hodin — až bude content (David
      v Hodináriu).

### 📊 Integrace — strategické rozhodnutí

- [ ] **I2 Sentry / error tracking** — pro klientské JS errory. Free
      tier 5k events/měsíc. Rozhodnutí: zda nasadit.
- [ ] **I3 Plausible / Posthog** — behavior návštěvníků. Plausible
      self-hosted v CF Workers ~zdarma. Posthog free tier 1M events.
      (Cloudflare Web Analytics už běží.) Rozhodnutí: která služba.
- [ ] **I4 Newsletter (Buttondown / EmailOctopus)** — pro spolek
      horologie-cz, sezónní newsletter o akcích. Buttondown free do 100
      odběratelů. Rozhodnutí: zda spustit a kdo bude redaktor.

### 💾 Provoz

- [ ] **Zálohy** — repo na GitHubu je primární. Zvážit periodické
      archivy do ADO?
- [ ] **D8 Backup strategie pro `zdroje/`** — kritická data (Soupis 3.xls,
      Popisy 2.docx, panely OCR JPG) jen na 1 disku. Git LFS nebo
      Cloudflare R2 sync (~2 h). Strategické rozhodnutí: kam.

### 💬 Komunita

- [ ] **T12 Comments / Disqus** — žádné komentáře ke článkům. Spolek
      malý → přínos nízký, ale e-mail kontakt by stačil. Rozhodnutí:
      potřebujeme to vůbec.
