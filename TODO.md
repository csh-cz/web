# TODO

Otevřené úkoly pro CSH Web (hodinarium.eu, horologie.cz).
Rozděleno podle toho, kdo může s úkolem hnout — **Claude autonomně** vs **lidský vstup**.

Hotové položky archivovány v [docs/CHANGELOG.md](docs/CHANGELOG.md).
Plnou historii viz `git log`.

---

# 🤖 Část A — Claude autonomně

Programování, automatické opravy, generování obsahu z primárních pramenů.
Lze pustit bez čekání na vstup od Davida/Petra.

## A.1 — Slovník: rozšíření obsahu (continuous)

Pokračování slovník MVP (57 hesel) metodou Zotero MCP semantic search +
verbatim grep v plaintextech (Šumavský 1851, Špatný 1882, Sušický 1900,
Sladkovský 1947).

- [ ] **SL7 — `krok` Bureš 1965 dělení** ⚠ Bureš 1965 OCR cache poškozený
      (audit FU7), řádné citace nedostupné. V `k-overeni.md` jako TODO —
      vyžaduje rescan PDF nebo manuální kontrolu.

Po každé etapě spustit `pnpm slovnik:auto-link` (přibyly hesla → znovu
prosvítit články) a `pnpm search:rebuild` (corpus + embed).

## A.2 — Slovník: tech / integrace

- [ ] **SL11 CMS widget pro Sveltia** — frontmatter editor pro slovnik
      collection (překlady, varianty, definice, příbuzné slugy).
- [ ] **SL12 /slovnik/ filter/search box** — při 50+ heslech přidat
      live filter (de/en/fr term, cs heslo, varianta).
- [ ] **SL13 Reference IDs s anchorlinkováním** — `[Zotero \`KEY\`]`
      v citacích v body propojit na `references.json` (CSL render přes
      citeproc-js stejně jako u kroku detailu).

## A.3 — Audit follow-ups (read-only)

- [ ] **FU2 Design critique — hero/index** (~15 min) — `index.astro`
      pro 3 audience segmenty (návštěvník muzea Děčín / cs amatér /
      EN enthusiast). Hero text register, CTA (chybí „Naplánuj
      návštěvu"?), featured grid × random Atlas, scroll fatigue,
      mobile 320px clamp().
- [ ] **FU5 Design system audit (cross-site)** (~40 min) — drift
      hodinarium-eu × horologie-cz: tokeny, komponenty (Card), footer
      patterns, button styles. **Pustit až po stabilizaci obou webů**
      (po a11y bundle A.4, případné slovník expansion). Migration plan:
      které tokeny/komponenty do shared `packages/ui`, které jsou
      legitimně site-specific.

## A.4 — A11y odložené nálezy z auditu 2026-05-08

- [ ] **C3 + C4 + M2 + TD2-část-2: SearchModal aria pattern refaktor** —
      combobox/listbox pattern s `aria-activedescendant` na výsledcích,
      status `aria-live` oddělený od listu, ArrowUp/Down přesouvá
      programatický focus, ArrowLeft/Right pro tabs. Při tom **přesunout
      data injection** z `define:vars` na `<script type="application/json">`
      data island, čímž se umožní ESM import a vyřeší se i TD2-část-2
      (`attachDialogControls()` helper). Nejnáročnější — ~1–2 h.
      Ideálně po VoiceOver test. Komponenta:
      `apps/hodinarium-eu/src/components/SearchModal.astro`.

## A.5 — Editor pomocníci — V2 follow-ups

V1 série hotová ([CHANGELOG 2026-05-10](docs/CHANGELOG.md)). V2 polish:

- [ ] **A.21 V2 dead-link auditor follow-ups** (~3 h):
      tlačítko v Sveltia editoru „Zkontroluj odkazy v tomto článku" (per-article
      on-demand check), GitHub Issue auto-creation pro nové dead links od
      posledního runu (diff vs předchozí JSON), auto-PR návrh:
      replace dead URL na Wayback snapshot pokud existuje.
- [ ] **A.13 V2 spell-check** — right-click suggestion menu, CI workflow
      pro rebuild dictionary při každém content commitu (žádný drift
      mezi repo daty a dictionary).
- [ ] **A.20 V2 link picker — auto-detect mode** (~5 h) — AI scanuje text
      za entity (jména, místa, díla), tečkovaný podtisk pod nelinkovanými.
      Hover → tooltip „Vložit odkaz?".
- [ ] **A.23 workflow V2** — real-time lock check přes Cloudflare KV,
      email notifications reviewerům, history timeline per článek, bulk
      actions, Slack/Discord webhook integrace.

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

- [ ] **A.15.1 Citation picker** (~5–7 h, V2 +2 h pro „chybějící citace"
      flow). Důležitá poznámka: editor (Petr, ostatní) **nepotřebuje
      Zotero account**. Picker pracuje jen nad lokálním snapshotem
      `apps/hodinarium-eu/src/data/references.json` (~1100 položek),
      který se sync z Davidova Zotera přes `pnpm refs:sync`. Editor
      je read-only konzument.

      Funkce:
      - Search nad references.json (autor, rok, klíčová slova,
        title): „Bureš 1965", „věžní hodiny", „Sušický".
      - Klik vloží `<Ref bibKey="..." />` (numbered) nebo
        `[Bureš 1965, s. 87]` (author-date podle `referenceStyle`).
      - Auto-doplní frontmatter `references[]` entry (idempotentní).
      - Bonus: tlačítko „🤖 Najdi citaci pro tento odstavec" →
        embed selection → semantic search bge-m3 nad references-only
        subset → AI rerank top 5 + ISO 690 preview.

      **V2 — když chybí reference:** modal section „Citace nenalezena?
      Pošli návrh do Zotera". Submit → vytvoří GitHub Issue Davidovi.
      David v Zotero přidá → příští `pnpm refs:sync` přinese.

- [ ] **A.16 Foto upload + alt + credit validator** (~6 h). Sveltia
      drag-drop má, ale nevyžaduje povinný `alt` (a11y) ani `credit`
      (CSH konvence). Pre-save intercept hook v Sveltia validate
      callback + AI vision (`@cf/llava-1.5-7b-hf` nebo similar) auto-
      generuje alt suggestion z obrázku. Editor schválí/upraví. Plus
      varování pokud `credit` field je prázdný.

- [ ] **A.17 Inv-N karta + soupis picker** (~5 h). Stejný pattern jako
      universal link picker. Specializovaný flow: type-ahead nad 268
      sbírkových karet a 396 záznamů soupisu. Vloží link
      `[karta-title](/sbirka/karta/inv-N-slug/)` nebo
      `[soupis-title](/soupis-veznich-hodin/SLUG/)`.

- [ ] **A.18 Frontmatter wizard pro nové karty/medailony** (~8 h). Když
      Sveltia vytvoří novou entry, AI wizard nabídne auto-fill přes
      existing helpers: NPÚ Památkový katalog lookup (GPS + KatCislo),
      Wikidata Qid (přes existing search), hodinař match (jméno →
      medailon link), datace heuristika.

- [ ] **A.19 Live preview cs ↔ de ↔ en** (~10 h). Editor píše v cs,
      sidebar zobrazuje AI překlad do DE/EN real-time. Pro spolupráci
      s neangloruštěným/německy mluvícím čtenářem. Použije slovník-aware
      Mistral nebo Sonnet (V2). Privacy disclosure (text jde do AI).

- [ ] **A.22 CSH browser extension** (~2-3 dny). Současné editor
      pomocníky fungují jen v `/admin/` Sveltia — když editor píše
      jinde (GitHub web editor, Notion, Confluence, generic forms),
      pomocníci nejsou.

      **Návrh:** WebExtension (cross-Chrome+Firefox, single codebase).
      Funguje na všech webech kde editor píše do `<textarea>` nebo
      `[contenteditable]`.

      **Funkce:**
      - Spell-check: stejný cs Hunspell + custom dict (~6.3 MB)
        bundlovaný v extension package, žádné runtime stahování
      - AI našeptávač: volá existing `/api/ai/suggest` na pages.dev
        (CORS allow rule pro extension origin)
      - Link picker: ⌘K na libovolné stránce
      - **Right-click „Přidat do CSH slovníku"** — editor manuálně
        flag-uje neznámé slovo, vytvoří GitHub Issue pro Davida

      **Distribuce:** Chrome Web Store ($5 publish fee), Firefox Add-ons
      (zdarma). Effort: ~2-3 dny (manifest, content scripts, store).

- [ ] **T10 Dark / light mode** — hodinarium-eu používá brass dark téma
      (default), není přepínač. CSS custom properties + toggle (~3 h).
- [ ] **T7 Network graph hodinařů** — `/hodinari/index.astro` jako
      force-directed graph (Vis.js / D3) — vazby učitel-žák, otec-syn,
      dílny, převzaté firmy mezi 81 hodináři (~6 h).
- [ ] **Live ciferník na titulce** — SVG zobrazující aktuální stav
      astrolábu (sun/moon position).

## A.7 — Tech dluh (větší)

- [ ] **D1 Test coverage** — Vitest setup pro `scripts/*.ts`
      (parse-soupis, build-redirects, apply-popisy, migrate-renumbering),
      snapshot testy pro layouty (~3 h).
- [ ] **R2 image variants pipeline** (~3 h, blokátor: user musí zřídit R2)
      Cesta C zvolená 2026-05-10: AVIF/WebP varianty na Cloudflare R2,
      JPEG zdroje zůstávají v gitu (Varianta A v zápisku z 2026-05-10).
      Důvod: GitHub free tier doporučuje repo < 1 GB (commit ~800 MB
      variant by zvedl repo na 1.9 GB); R2 free tier 10 GB + neomezený
      egress přes CF.

      **Krok 1 — User setup (čeká na Davida):**
      - Zřídit R2 bucket `csh-imgvariants` v CF dashboardu
      - Public access + custom domain `imgcdn.<doména>.cz`
      - API token s R2 Edit permission
      - Podrobný návod: viz chat 2026-05-10

      **Krok 2 — Claude implementace (autonomně po setup):**
      - [ ] `scripts/upload-imgvariants-to-r2.mjs` — sync skript přes
        wrangler / R2 S3 API. Diff lokálně vs R2 (ETag), upload jen
        nové. Idempotentní (skip-existing). Output: stat (uploaded,
        skipped, errors).
      - [ ] `package.json` workflow scripts:
        - `imgvariants:build` — generate lokálně (existuje, jen smazat
          CF_PAGES guard z `scripts/generate-image-formats.ts`)
        - `imgvariants:upload` — sync na R2
        - `imgvariants:sync` — `build && upload` (one-stop)
      - [ ] `packages/rehype-picture/index.mjs` — extend o `cdnBase`
        option. Pro raster `<img src="/img/X.jpg">`:
        ```html
        <picture>
          <source type="image/avif" srcset="<cdnBase>/img/X.avif">
          <source type="image/webp" srcset="<cdnBase>/img/X.webp">
          <img src="/img/X.jpg" ...>  <!-- fallback z CF Pages -->
        </picture>
        ```
      - [ ] `apps/*/astro.config.mjs` — flip `wrapInPicture: true`
        + `cdnBase: 'https://imgcdn.<doména>.cz'`
      - [ ] Build verify + live test přes Chrome DevTools network
        (ověřit AVIF served pro Chrome, JPEG fallback pro Safari/IE)
      - [ ] Doc v `docs/CHANGELOG.md` + krátký runbook
        `docs/imgvariants-r2-pipeline.md`

      **Krok 3 — Volitelné automation (V2):**
      - [ ] GitHub Action `.github/workflows/imgvariants-r2-sync.yml` —
        auto-trigger při push na main, kdy se změnilo
        `apps/*/public/img/**/*.{jpg,png}`. Generuje + uploadne (žádný
        manual step, ale ~5-10 min build per push).
- [ ] **CI cleanup** — staré Cloudflare Pages preview deployments smazat
      (kvóta).

## A.8 — Obsah (automatizace)

- [ ] **B2 Revize obsahu (evergreen)** — průběžná kontrola legacy
      článků: OCR artefakty (`**X**slovo`, duplicity `* * *`), atribuce
      → `author:` frontmatter, wiki/mapa odkazy → `references:`,
      `<Photo>` místo `![]()` u obrázků s creditem. Pravidla v skill
      `clanky-konvence` sekce 18. Postupně při dotyku článku.
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
      Analýza připravená v `docs/audit-datace-2026-05-09.md` (3 OK,
      7 FIX, 1 REMOVE doporučení). David/Petr rozhodne každý případ.
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
