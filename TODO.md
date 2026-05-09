# TODO

Otevřené úkoly pro CSH Web (hodinarium.eu, horologie.cz).
Rozděleno podle toho, kdo může s úkolem hnout — **Claude autonomně** vs **lidský vstup**.

---

# 🤖 Část A — Claude autonomně

Programování, automatické opravy, generování obsahu z primárních pramenů.
Lze pustit bez čekání na vstup od Davida/Petra.

## A.1 — Quick wins (≤ 1 h, vysoký poměr dopadu k práci)

*(prázdná po dnešní session — všechny 3 původní položky vyřešeny)*

A.1.1 `<time>` bug v Article.astro byl už dříve opraven v commitu
db336c1 (TODO entry byla outdate). A.1.2 + A.1.3 (`docs/PRO-CLENY.md`
+ `docs/CONTRIBUTING.md`) vytvořeny + cross-link z root README.

## A.2 — Slovník: rozšíření obsahu

Vysoká content value, bounded scope — pokračování slovník MVP (35 hesel)
metodou Zotero MCP semantic search + verbatim grep v plaintextech
(Šumavský 1851, Špatný 1882, Sušický 1900, Sladkovský 1947).

- ~~**SL3 Hodinky kapesní/náramkové**~~ ✅ Hotovo. 10 hesel
      (kalibr, werk, korunka, sklíčko, pouzdro, signatura, opakovací
      hodinky, chronograf, automatic, GMT) přidáno do slovník SSOT
      z primárních pramenů (Špatný 1882, Sladkovský 1947, Himmler 2006,
      Knespl 2014/2023). Slovník teď 45 hesel napříč 5 kategoriemi.
      Pipeline: `slovnik:build` → 45 MDX, `auto-link-slovnik` → 125
      nových linků v 100 souborech, `search:corpus` → 1058 records
      (heslo: 45). Build 1184 stran.
- ~~**SL4 Profese a hodinářské školy**~~ ✅ Hotovo. 8 hesel
      (hodinář, pouzdrář, pražská, švarcvaldská, vídeňská, anglická,
      francouzská, švýcarská škola) z primárních pramenů (Špatný
      1882 podtitul „pro hodináře a pouzdráře hodinářské", Sladkovský
      1947 — celá jedna sekce učebnice). Slovník nyní 53 hesel přes
      6 kategorií (mechanika 15 + bicí 11 + astronomické 4 + materiály
      5 + hodinky 10 + profese 8). Build 1192 stran, search corpus
      1066 records.
- ~~**SL5 Bicí mechanismy detail**~~ ✅ Hotovo. 3 hesla:
      čtvrťové bití (Špatný 1882 12× kompozit Viertel– + Sladkovský
      1947 detail čtvrťového stroje), Westminster chime (Sladkovský
      1947 — 4-leg gravitational krok pro Big Ben 1859 + melodická
      Cambridge 1794 atribuce), petite a grande sonnerie (Sladkovský
      1947 + provozní rozdíl + energetická náročnost). Slovník nyní
      56 hesel. Auto-link +15 linků (ctvrtove-biti: 13, vetrnik: 1).
      Repetice + opakovačka pokryta heslem opakovaci-hodinky (SL3),
      Grande sonnerie cross-link.
- ~~**SL6 Šumavský 1851 — neuvedené termíny**~~ ✅ Hotovo. Místo
      60 mini-hesel **přehledové meta-heslo** „Šumavský 1851 —
      historické české hodinářské termíny" v kategorii `jine`. Tabulka
      36 archaismů (cs → moderní cs → de) z `glosar.yaml`, plus 3
      kuriozity v plné formě (časoměr, kolostroj, pršící hodiny).
      Cross-link na `glosar.yaml` jako kompletní strukturovaný inventář.
      Insight: z 36 termínů se v moderní cs udrželo jen 2 (rafika/rafije,
      hodinařit). Slovník nyní 57 hesel..
- ~~**SL7 Rozšíření existujících hesel**~~ ✅ Z větší části hotovo:
      - `vlásek` — Phillipsova matematika 3 podmínek + Immichova
        praktická křivka (Sladkovský 1947 obr. 99 a 100)
      - `setrvačka` — moderní materiály (Invar/Elinvar, Glucydur,
        Nivarox + Nivachoc, silikon Spiromax/Syloxi/Si14, experimentální
        carbon)
      - ~~`krok` — Bureš 1965 dělení~~ ⚠ Bureš 1965 OCR cache
        poškozený (audit FU7), řádné citace nedostupné. Ponecháno
        v `k-overeni.md` jako TODO — vyžaduje rescan PDF nebo manuální
        kontrolu.

Po každé etapě spustit `pnpm slovnik:auto-link` (přibyly hesla → znovu
prosvítit články) a `pnpm search:rebuild` (corpus + embed).

## A.3 — Slovník: tech / integrace

- [ ] **SL11 CMS widget pro Sveltia** — frontmatter editor pro slovnik
      collection (překlady, varianty, definice, příbuzné slugy). Až bude
      Petrova editace přes web UI relevantní (viz B.5 Decap CMS).
- [ ] **SL12 /slovnik/ filter/search box** — při 50+ heslech přidat
      live filter (de/en/fr term, cs heslo, varianta).
- [ ] **SL13 Reference IDs s anchorlinkováním** — `[Zotero \`KEY\`]`
      v citacích v body propojit na `references.json` (CSL render přes
      citeproc-js stejně jako u kroku detailu).

## A.4 — Audit follow-ups (read-only, drive další work)

Read-only kritiky — produkují prioritizovaná doporučení, sama nic nemění.
Užitečné jako vstup pro další konkrétní fixy.

- [ ] **FU2 Design critique — hero/index** (~15 min) — `index.astro`
      pro 3 audience segmenty (návštěvník muzea Děčín / cs amatér /
      EN enthusiast). Hero text register, CTA (chybí „Naplánuj
      návštěvu"?), featured grid × random Atlas, scroll fatigue,
      mobile 320px clamp().
- ~~**FU3 Design critique — soupis věžních hodin**~~ ✅ Hotovo
      (commit pending). Report `docs/design-critique-soupis-veznich-hodin-2026-05-09.md`.
      P1 mobile column hide **rovnou implementováno**: progresivní
      breakpoint hierarchie (760 px skryje krok, 600 px skryje
      kraj/stát, 480 px skryje budovu + thumb). Zachované: rok,
      hodinář, místo, stav. Ostatní P1/P2/P3 doporučení (shared
      filter state, empty state, citation meta) zůstávají v auditu
      jako follow-up.
- ~~**FU4 Design critique — sbírková karta**~~ ✅ Hotovo
      (commit pending). Report `docs/design-critique-sbirkova-karta-2026-05-09.md`.
      **P1 (slovník auto-link)** + **P2 (vyrobce auto-link na medailon
      hodináře)** rovnou implementovány. Nový `utils/slovnik-link.ts`
      s 25+ termíny + integrace `findHodinarFromVyrobce` do KartaSbirky
      pro `vyrobce` a `signatura` fields. Karty teď linkují
      slovníkové termíny (kyvadlo, čtvrťové bití, invar, …) i jméno
      hodináře na medailon. Ostatní P2/P3 (datace fallback, timeline,
      print stylesheet) zůstávají v auditu jako follow-up.
- [ ] **FU5 Design system audit (cross-site)** (~40 min) — drift
      hodinarium-eu × horologie-cz: tokeny, komponenty (Card), footer
      patterns, button styles. **Pustit až po stabilizaci obou webů**
      (po a11y bundle A.5, případné slovník expansion), jinak rebuilduje
      pohyblivý cíl. Migration plan: které tokeny/komponenty do shared
      `packages/ui`, které jsou legitimně site-specific.

## A.5 — A11y odložené nálezy z auditu 2026-05-08

Z 17 nálezů 6 quick-wins + M7 + M8 vyřešeno. Zbývá:

- [ ] **C3 + C4 + M2 + TD2-část-2: SearchModal aria pattern refaktor** —
      combobox/listbox pattern s `aria-activedescendant` na výsledcích,
      status `aria-live` oddělený od listu, ArrowUp/Down přesouvá
      programatický focus, ArrowLeft/Right pro tabs. Při tom **přesunout
      data injection** z `define:vars` na `<script type="application/json">`
      data island, čímž se umožní ESM import a vyřeší se i TD2-část-2
      (`attachDialogControls()` helper). Nejnáročnější — ~1–2 h.
      Ideálně po VoiceOver test. Komponenta:
      `apps/hodinarium-eu/src/components/SearchModal.astro`.
- ~~**M6: Report form `<input readonly tabindex="-1">` → `<output>`**~~
      ✅ Hotovo (commit e519e7e). `ReportIssueModal.astro` page-info
      field je nyní `<output>` element s `role="status"` implicit.
- ~~**N1–N4 hygienické fixy (bundle)**~~ ✅ Hotovo (commit e519e7e).
      N1: aria-modal="true" na 3 dialog elementech (search + report
      v hodinarium-eu, lightbox v horologie-cz akce). N2: aria-live
      polite + aria-atomic na #report-counter. N3: dynamický role
      mezi status/alert v .report-status (helper setStatus). N4:
      `<h4>` → `<strong>` v map popups (mapa-horologie + horologie-cz
      akce cluster), CSS migrace `.popup-name`.

## A.6 — Tech features (větší práce)

- [ ] **A.11 MDX → Markdown s remark-directive shortcodes** (~1 d)
      Sveltia CMS markdown editor padá při Save na `clanky` článcích
      uložených jako `.mdx` (Petr Král, 2026-05-09: PRS10 článek,
      „spadlo v půlce, Enter not found"). Příčina: `import` + JSX
      uvnitř markdown body, Sveltia parser to neumí. Krátkodobě skryt
      edit FAB pro 15 MDX souborů (`cms-mdx-blocklist.ts`).

      **Plán:** zavést `remark-directive` shortcode-style syntax
      v markdown body, místo MDX:
      ```md
      ::youtube{id="abc" title="Demo" align="right"}

      ::prs10-live
      ```
      Custom remark plugin převede direktivy na Astro komponenty
      při buildu. Konvertovat 15 souborů (.mdx → .md), smazat
      `import` + JSX tagy, parametry zachovat v direktivě. Pak
      smazat `cms-mdx-blocklist.ts`.

      Soubory + komponenty (audit 2026-05-09):
      - **bez JSX** (jen rename .mdx→.md): kinsner-astronomicke-hodiny,
        litinove-vezni-hodiny
      - **zero-arg widget**: PRS10 + fake_atomove_hodiny (PRS10Live),
        mystery + normalni (CasSlovem), segmentovky_s_prekladem
        (CasSegmentovky), slunecni + slunecni_filler (Slunecni…),
        tabor (TaborOrloj), zidovske (ZidovskeHodiny)
      - **s parametry**: Arduino + mindelheim + TimeSlider (YouTube
        id+title+align+ratio), kostky (PdfPager src+title+pages)

      Plus: Sveltia config — `clanky` collection může zůstat
      `extension: md`, žádný split.

- [ ] **A.12 MCP server pro hodinářskou terminologii a překlady**
      (~4 working days, blueprint hotový — implementace odložená).
      Standalone MCP server (`@csh-cz/mcp-horologie`), který vystaví
      slovník + medailony + soupis + Zotero references jako tools
      pro libovolného MCP klienta (Claude Desktop, Cursor, Continue).
      Use cases: cs ↔ de/en/fr překlady s respektem k slovníkové
      terminologii, generování skeletonu medailonu, terminology
      lint článků autora-laika, sémantický corpus search, ISO 690
      citace ze Zotera. **Kompletní design + 11 PBI ticketů** v
      `docs/design-mcp-horologie-2026-05-09.md`. Implementaci pustit
      až po stabilizaci hlavních DPR (DNS switch, A.11 MDX migrace,
      T7 network graph). Read-only V1, write capabilities (PR draft
      generation) jako V2.

- ⚠ **A.13 Browser-side spell-checker pro Sveltia editor**
      ~~(~1.5–2 dny)~~ **V1 implementováno (commit pending), čeká
      na uživatelské testování v živé Sveltia.**
      Inject nspell knihovnu do Sveltia admin/index.html
      s **cs_CZ base dictionary** (Hunspell cs_CZ se skloňováním —
      kyvadlu / kyvadlem / kyvadly atd. pro plnou českou morfologii)
      + custom CSH slovníkem (1242 slov ze slovníku + hodinari +
      soupis obcí). Real-time check v editoru, žádný API call
      (privacy + 0 Kč). Hook do `<textarea>` / contenteditable
      elementů, visual underline overlay pro non-matching tokeny.

      **Primární cílový jazyk: čeština.** Custom dict drží jen cs
      formy + historicky/citačně validní cizí jména (17 německých
      jmen jako Schöpperle, Thöndel, München, Glashütte; žádné
      překlady ze `prekladyEn`/`prekladyDe`/`prekladyFr` — ty patří
      jen do překladového kontextu, ne do cs textu obecně).

      **Hotovo:** dictionary builder skript
      `scripts/build-cs-spell-dictionary.mjs` →
      `apps/hodinarium-eu/public/admin/csh-spell-dict.json` (1242
      unique slov, deterministic sort, regenerable přes
      `pnpm spelldict:build`). Sources: 57 slovníkových hesel +
      104 medailonů hodinářů + 104 entries v hodinari.ts +
      396 záznamů soupisu (obec + budova + kraj).

      **Zbývá implementovat:**
      1. Inject script v admin/index.html (lazy-load při otevření
         editor, ~5 MB cs_CZ Hunspell .dic+.aff + ~700 KB hunspell-wasm
         + ~50 KB CSH custom dict)
      2. Hook do Sveltia editor textarea (MutationObserver pattern
         podobně jako existing helper-banner script)
      3. Tokenize cs body + check (hunspell.spell + custom dict
         fallback) + visual underline overlay (CSS class `csh-misspelled`)
      4. Right-click suggestion menu (volitelně, V2)
      5. CI workflow: rebuild dictionary při každém content commitu
         (žádný drift mezi repo daty a dictionary)

      Sister projekt: `terminology_lint` tool z A.12 MCP serveru
      sdílí logiku „canonical form lookup" — postupně migrovat
      do shared TS modulu po implementaci obou.

- ⚠ **A.14 AI našeptávač pro Sveltia editor** ~~(~4 working days)~~
      **V1 inline auto-complete implementováno (commit pending),
      čeká na uživatelské testování + Workers AI binding v Pages
      dashboardu.** Inline auto-complete
      (Copilot-style) + sidebar chat + post-save terminology lint
      + citation suggester. Modely: V1 Workers AI Llama 3.1 8B
      (zdarma, omezená cs kvalita) → V2 Anthropic Sonnet 4.5
      (~$3–5/měsíc = 75–125 Kč/měsíc) přes Cloudflare AI Gateway
      (caching + rate limit).

      Use cases: UC-A inline auto-complete, UC-B sidebar chat
      („napiš perex"), UC-C terminology review po save (vedle A.13
      hunspell — kontextová grammatika a fakta), UC-D generování
      skeletonu medailonu, UC-E citation suggestion ze Zotera.

      System prompt cached (~3K tokens): slovník + hodinari aliasy
      + style guide + soupis index. Cost calculation pro 5 editorů ×
      50 calls/měsíc = ~$1.50–3/měsíc po AI Gateway cache.

      **Kompletní design + 9 PBI ticketů (AI-1 až AI-9)** v
      `docs/design-ai-naseptavac-2026-05-10.md`. Implementaci pustit
      po A.13 (hunspell) — různé layery, doplňky.

      Privacy poznámka: text jde Anthropic API, vyžaduje disclosure
      v editor handbook + opt-out per-editor preference.

- ~~**T4 Lighthouse CI / Web Vitals**~~ ✅ Hotovo (commit pending).
      `@lhci/cli` v devDeps, `lighthouserc.json` config (8 URL napříč
      content typy), `.github/workflows/lighthouse.yml` post-deploy
      gate. Thresholdy: perf ≥ 0.85 (warn), a11y ≥ 0.95 (error),
      bp ≥ 0.7 (warn — kvůli third-party cookies/scripts mimo naši
      kontrolu), seo ≥ 0.95 (error). Skip `is-crawlable` (intentional
      noindex před DNS switch — viz A.9). Baseline: home má perf
      0.94, a11y 0.96, bp 0.74, seo 0.95+ (po skip).
- ~~**S1 a11y audit — automatizace**~~ ✅ Hotovo (commit pending).
      `@axe-core/playwright` přidán; nový test
      `tests/smoke/axe-a11y.hodinarium.spec.ts` skenuje 11 reprezentativních
      URL napříč všemi content typy (home, sbírka karta, hodinář medailon,
      soupis karta, slovník heslo, kroky detail, …) na critical+serious
      WCAG 2 AA violations. Auto-spuštění v existing test:e2e workflow.
      Nalezené violations při baseline scanu opraveny (color-contrast
      `--color-copper` na `.hodinari-box-label` → `--color-brass`,
      `.stav-znicene` text `#b04848` → `#d97070` ve dvou souborech).
      DISABLED rule `aria-required-attr` čeká na C3+C4+M2 SearchModal
      refactor.
- [ ] **T10 Dark / light mode** — hodinarium-eu používá brass dark téma
      (default), není přepínač. CSS custom properties + toggle (~3 h).
- [ ] **T7 Network graph hodinařů** — `/hodinari/index.astro` jako
      force-directed graph (Vis.js / D3) — vazby učitel-žák, otec-syn,
      dílny, převzaté firmy mezi 81 hodináři (~6 h).
- [ ] **Live ciferník na titulce** — SVG zobrazující aktuální stav
      astrolábu (sun/moon position).

## A.7 — Tech dluh (větší)

- [ ] **D2 BUGS.md aktualizace** — rerun `pnpm test:e2e`, fix nebo doc
      (crawl 2026-04-28: 54 no-h1, 21 JS error, 20 HTTP error). Většina
      no-h1 už ok po /img/ refactoru (~2 h).
- [ ] **D6 Slug standardizace na kebab-case** — 114 souborů v
      `content/hodinarium-eu/` má non-kebab slugy (`Arduino`, `astro2_NTP`,
      `decin_jednotny_cas`, …). 114 file renames + 114 redirectů + grep
      všech inline odkazů + SEO reindex. Citlivá ale čistě technická.
- [ ] **D5 Konsolidace _redirects** — 776 řádků, CF limit 2 000.
      Regroup pomocí glob patterns.
- [ ] **D1 Test coverage** — Vitest setup pro `scripts/*.ts`
      (parse-soupis, build-redirects, apply-popisy, migrate-renumbering),
      snapshot testy pro layouty (~3 h).
- ~~**OG images per-collection generation**~~ ✅ Hotovo (commit cfe898f
      + dnes Base.astro patch). Coverage 18.4 % → **100 %** (1095/1095).
      Loaders pro hodinari (104), soupis-veznich-hodin (396), slovnik
      (57), kroky (1), kronika (23). Bonus 1: pruneStaleOg odstranil
      47 stale souborů z M2 taxonomy refactoru 2026-04. Bonus 2:
      hodinář display name z hodinari.ts lookupu (s diakritikou).
      **Bonus 3 (FU3 follow-up):** Base.astro `ogSlugFromPath` opraveno —
      detail pages teď používají per-stránka OG (předtím všechny
      detail v `/hodinari/X` měly default `/og/hodinari.png`,
      ne per-osobu).
- ~~**OG images do CI**~~ ✅ Hotovo (commit 0a85ecd). Workflow
      `og-coverage.yml` + `--ci` flag v `check-og-coverage.mjs`.
- ~~**`build-image-index.ts` pro horologie-cz**~~ ✅ Hotovo (audit
      2026-05-09). Skript už spouští obě apps — `image-sizes.json`
      existuje pro hodinarium-eu (240 KB) i horologie-cz (10 KB,
      112 entries). TODO entry byl outdated.
- [ ] **`rehype-picture` `wrapInPicture: true`** — zapnout až po
      `pnpm imgvariants:build` a commitu .avif/.webp variant.
- [ ] **CI cleanup** — staré Cloudflare Pages preview deployments smazat
      (kvóta).

## A.8 — Obsah (automatizace)

- [ ] **B2 Revize obsahu (evergreen)** — průběžná kontrola legacy
      článků: OCR artefakty (`**X**slovo`, duplicity `* * *`), atribuce
      → `author:` frontmatter, wiki/mapa odkazy → `references:`,
      `<Photo>` místo `![]()` u obrázků s creditem. Pravidla v skill
      `clanky-konvence` sekce 18. Postupně při dotyku článku.
- ~~**D5 datace + B5/D4 audit script**~~ ✅ Hotovo (commit pending).
      Report `docs/audit-datace-2026-05-09.md` — 11 podezřelých článků
      s `year < 1500` (catalog.json heuristic). Pro každý: kontext kde
      se rok objevuje, předběžné Claude doporučení (3 OK, 7 FIX, 1
      REMOVE) k revizi. Bonus: `build-catalog.ts` respektuje explicit
      `year:` field z frontmatteru → David/Petr může FIX prostě přidat
      `year: 1492` (pro zvon) nebo `year: null` (pro literatura) bez
      úpravy textu. Předáno Davidovi/Petrovi k rozhodnutí (B5).
- [ ] **Skript pro auto-import fotek z ZIP** — rozzipovat → přejmenovat
      → doplnit data file. Naprogramovat až bude první ZIP od Petra.

## A.9 — Připraveno k nasazení po DNS switch

Až se přepne DNS (viz B.3), Claude provede:

- [ ] `apps/hodinarium-eu/src/layouts/Base.astro` → smazat
      `<meta name="robots/googlebot">` bloky (DEV STATE komentáře jsou
      waypointy)
- [ ] `apps/horologie-cz/src/layouts/Base.astro` → totéž
- [ ] `apps/hodinarium-eu/public/robots.txt` → vrátit `Allow: /`
      + `Disallow: /og-preview /og/ /podklady/`
- [ ] `apps/horologie-cz/public/robots.txt` → vrátit `Allow: /`
      + `Disallow: /og/`
- [ ] `astro.config.mjs` → `site: 'https://hodinarium.eu'`
- [ ] Submitnout sitemapy do Google Search Console

---

# 👤 Část B — Vyžaduje lidský vstup

Rozhodnutí, externí data, přístupy, expertní znalosti.
Claude se zatím nepustí, dokud nedojde input.

## B.1 — Audit (čeká na Petra)

- [ ] **B3 Vybrané exponáty per sekce** — Claude dal výběr 4×4, Petr
      potvrdí/změní.
- [ ] **B5 Datace článků** — opravit ručně 14 podezřelých roků < 1500.
      Claude může připravit analýzu (viz A.8 datace audit script),
      David/Petr rozhodne každý případ.
- [ ] **B7 Kategorizace 124 nezařazených** — sporných ~30 článků
      vyžaduje ruční review kategorie.
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
      (nyní `hodinarium-eu.pages.dev`).
- [ ] **`horologie.cz`** přesměrovat na Cloudflare Pages
      (nyní `horologie-cz.pages.dev`).

DNS přesun, TLS Let's Encrypt zdarma. ~30 min každá doména. Po přepnutí
Claude provede odblokování indexace (viz A.9).

## B.4 — Slovník (vyžaduje experta / akvizici)

- [ ] **SL1 Obrázky pro hesla** — všech 35 hesel má placeholder. Claude
      umí najít a vyparsovat z public-domain pramenů (Dietzschold 1894
      Tafel 4, Saunier 1887, Sladkovský 1947), ale **vlastní foto z
      Hodinária** (kladívko, cymbál, větrník, posůvka, srdcovka)
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
- [ ] **INV2** — `inv-65/67/68` discrepancy: Petřín × Lissner × Skála ×
      Kavalír × Sluneční × Model orloje (čeká: ujasnění od Petra/Skály).

## B.5 — Strategická rozhodnutí (zelená/poptávka)

### 🤖 AI funkce — čeká na zelenou + reálnou poptávku

A1 (licence CC BY 4.0) je hotová. Zbývá vybrat, zda a kdy aktivovat:

- [ ] **TL;DR generator** — Gemini Flash, free tier.
- [ ] **Sémantické vyhledávání** — Transformers.js v browseru (cesta A,
      doporučená), Cloudflare Vectorize (cesta B), nebo Pagefind +
      synonyma (cesta C, nejmenší krok).
- [ ] **Zeptej se Hodinária** — RAG chatbot přes Cloudflare Workers AI
      (free tier 10k Neuronů/den).
- [ ] **AI překlad CS → EN** — glosář horologických termínů.

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

1. **Cloudflare Access** pro `/admin/*` URL — magic-link, Allow list.
2. **Decap CMS** ([decapcms.org](https://decapcms.org)) nebo modernější
   **Sveltia CMS** — single-page app, commit do gitu přes GitHub API.
3. Editorial workflow — každá editace jako PR.
4. CF Pages preview pro každý PR.

Odhad práce: ~3 h setup, jednorázově.

### 🌐 Migrace orloj.eu — odložené

~200 stránek, stejný pipeline. Petr explicitně řekl „zatím nedělat".

### 🎨 Design — vyžaduje data / kontent

- [ ] **T11 / 3D modely** vybraných hodin — vyžaduje fotogrammetrii
      nebo manuální modeling.
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
- [ ] **D8 Backup strategie pro `zdroje/`** — kritická data
      (Soupis 3.xls, Popisy 2.docx, panely OCR JPG) jen na 1 disku.
      Git LFS nebo Cloudflare R2 sync (~2 h). Strategické rozhodnutí:
      kam.

### 💬 Komunita

- [ ] **T12 Comments / Disqus** — žádné komentáře ke článkům. Spolek
      malý → přínos nízký, ale e-mail kontakt by stačil. Rozhodnutí:
      potřebujeme to vůbec.
