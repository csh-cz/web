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
- [x] **SL12 /slovnik/ filter/search box** — hotov (2026-05-11). Live filter
      v `apps/hodinarium-eu/src/pages/slovnik/index.astro`: hledá v cs heslu,
      variantách i překladech (de/en/fr). Diakritika-insenzitivní fold přes
      NFD normalizaci. Tokenizovaný (více slov = AND match). Skrývá prázdné
      kategorie, ukazuje "žádné výsledky" banner. URL param `?q=…` pro deep link.
      Clear button (×) + ESC keybind. Pre-fold cached při loadu (rychlost
      pro 135 cards).
- [partial] **SL13 Reference IDs s anchorlinkováním**:
      - [x] Část 1 (2026-05-11): render `references` frontmatter sekce na
        slovnik/[slug] (commit f311126). ISO 690 přes citeproc-js z
        references.json, citace v blockquote, note + pages podpora.
        id="ref-N" připravený pro budoucí anchor link z body.
      - [ ] Část 2: rehype plugin pro `[Zotero \`KEY\`]` v body MDX →
        auto-convert na `<a href="#ref-N">[Zotero KEY]</a>`. Plugin
        bude potřebovat lookup bibKey → position in frontmatter.references
        nebo přejít na id="ref-bibKey-KEY" schema (změna 78+ entries).

## A.3 — Audit follow-ups (read-only)

- [x] **FU2 Design critique — hero/index** — hotov 2026-05-12, výstup
      `docs/audit-hero-index-2026-05-12.md`. Klíčový nález: featured grid
      ukazuje jen 1 ze 4 karet (3 hardcoded slugs neexistují v catalog
      po D6 rename). Quick fix: opravit `featuredSlugs` v index.astro.
      Plus doporučení pro CTA „Naplánuj návštěvu", subtitle pod hero title.
- [x] **FU5 Design system audit (cross-site)** — hotov 2026-05-12, výstup
      `docs/audit-design-system-2026-05-12.md`. Klíčové závěry:
      - Strategicky NEsjednocovat: defaultní téma (museum-dark × paper-light),
        počet komponent (21 × 2)
      - Sjednotit do `packages/ui` (~4 h): font tokens, utility classes,
        button styles, JsonLd, Breadcrumbs
      - Drift k opravě: `--color-copper` mezi dark variantami, chybějící
        `--font-mono` v Horologii, `.btn-*` inline v `index.astro`.

## A.4 — A11y odložené nálezy z auditu 2026-05-08

- [x] **C3 + C4 + M2: SearchModal aria pattern refaktor** — hotov 2026-05-12
      (5 commitů: 5d6cb30c combobox role + aria-activedescendant + listbox/option,
      bae4916d tab keyboard nav Arrow/Home/End + roving tabindex, 42264179
      dialog labelledby + tab describedby + aria-controls, f36994a0 Home/End
      klávesy + scrollIntoView + focus-visible, 6ade90b9 two-stage escape
      + focus restoration). Komponenta `apps/hodinarium-eu/src/components/SearchModal.astro`.
      TD2-část-2 (`attachDialogControls()` helper, ESM data island) ne refaktorováno,
      ale a11y pattern kompletní bez něj.

## A.5 — Editor pomocníci — V2 follow-ups

V1 série hotová ([CHANGELOG 2026-05-10](docs/CHANGELOG.md)). V2 polish:

- [ ] **A.21 V2 dead-link auditor follow-ups** (~3 h):
      tlačítko v Sveltia editoru „Zkontroluj odkazy v tomto článku" (per-article
      on-demand check), GitHub Issue auto-creation pro nové dead links od
      posledního runu (diff vs předchozí JSON), auto-PR návrh:
      replace dead URL na Wayback snapshot pokud existuje.
- [x] **A.13 V2 spell-check** — hotov 2026-05-12 (commit 45fbc0da right-click
      suggestion menu v `csh-spellchecker.js` s top-5 nspell suggestions +
      „Přidat do CSH slovníku" → GH Issue přes problemType `dict-word` +
      „Ignorovat zde" per-session; commit e166f752 CI workflow
      `.github/workflows/spell-dict-rebuild.yml` auto-rebuild při push na
      content/slovnik|hodinari|soupis a data/hodinari.ts). A.13.3 mode
      persistence už hotová ve V1 (localStorage `csh-editor-settings`).
- [ ] **A.20 V2 link picker — auto-detect mode** (~5 h) — AI scanuje text
      za entity (jména, místa, díla), tečkovaný podtisk pod nelinkovanými.
      Hover → tooltip „Vložit odkaz?".
- [ ] **A.23 workflow V2** — real-time lock check přes Cloudflare KV,
      email notifications reviewerům, history timeline per článek, bulk
      actions, Slack/Discord webhook integrace.

## A.6 — Tech features (větší práce)

- [x] **A.11 MDX → Markdown s remark-directive shortcodes** — hotov 2026-05-13
      (commit cdd233b8). Plugin `@csh/remark-csh-directives`
      (`packages/remark-csh-directives/index.mjs`) převádí direktivy
      `::name{attr="val"}` na Astro komponenty přes `<Content components>`
      prop. 15 souborů migrováno (kostky, arduino, prs10, mystery,
      normalni, segmentovky, slunecni×2, tabor, zidovske, mindelheim,
      time-slider, fake-atomove + kinsner/litinove → .md bez direktiv).
      `cms-mdx-blocklist.ts` smazán, `isMdxArticle` flow v Article.astro
      odstraněn — editorský FAB viditelný pro všech 15 dřív blokovaných
      článků. Sveltia neměnitelné direktivy vidí jen jako text → nepadá.
      Handbook (`docs/cms-editor-pomocnici.md`) má novou sekci
      „Vkládání interaktivních prvků — direktivy".

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

- [x] **A.15.1 Citation picker V1** — hotov 2026-05-13.
      `apps/hodinarium-eu/public/admin/csh-citation-picker.js` (16.7 KB) +
      endpoint `/data/references.json.ts`. Cmd+Shift+R (Ctrl+Shift+R) v
      textarea otevře modal, search nad 2697 CSL entries (substring AND
      multi-token na author/year/title/citation-key), klik vloží
      `[Autor Rok, s. X]` na pozici kurzoru + zkopíruje YAML snippet pro
      frontmatter `references[]` do schránky. Toggle v ⚙ Pomocníci panelu.

      **V1 omezení:** insert je inline markdown text (ne `<Ref bibKey="..."/>`
      komponenta — vyžaduje frontmatter `referenceStyle: numbered`, detekce
      v V2). Auto-edit frontmatter `references[]` zatím není — editor musí
      ručně paste ze schránky pod `references:` block.

      **Zbývá pro V2 (~3 h):**
      - Detekce `referenceStyle` z frontmatter → numbered → `<Ref bibKey/>`
      - Auto-append do frontmatter `references[]` přes Sveltia store
      - „Citace nenalezena?" modal sekce → POST /api/report-issue
        problemType `zotero-add`
      - „🤖 Najdi citaci pro tento odstavec" → embed selection → semantic
        search bge-m3 nad references-only subset

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
- [x] **R2 image variants pipeline** (hotovo 2026-05-11)
      Krok 1+2+V2 hotov. R2 bucket `csh-imgvariants` naplněn (5684 variant,
      367 MB = 4% free), `<picture>` wrap aktivní v obou apps s
      `cdnBase: pub-e96bd8c…r2.dev`. Po DNS switch (A.9) nahradit za
      `imgcdn.<doména>`. GH Action automatizuje regen + upload po každém
      pushi s novou fotkou. Runbook: `docs/imgvariants-r2-pipeline.md`.

      **Akce pro Davida:** přidat 3 repo secrets v
      https://github.com/csh-cz/web/settings/secrets/actions
      (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`).
- [x] **CI cleanup** — hotov 2026-05-12. `scripts/cleanup-cf-pages-deployments.mjs`
      + `pnpm cf:cleanup` s `--days N` (preview cutoff) a `--keep-prod N`
      (production retention). User vytvořil CF API token + spustil `--apply`:
      **1026 → 140 deployů** (450 hodinarium-eu prod + 436 horologie-cz prod
      smazáno, top 50 prod + 20 preview na app zachováno).

## A.8 — Obsah (automatizace)

- [partial] **B2 Revize obsahu (evergreen)** — průběžná kontrola legacy
      článků. Hotovo 2026-05-12:
      - [x] Audit skript `scripts/audit-content-evergreen.mjs` + `pnpm content:audit`
        — detekuje OCR artefakty (`**X**y`, `* * *`, vícenásobné mezery),
        chybějící `author:` frontmatter, wiki/mapa odkazy v body, plain
        `![]()` v MDX s credit-like textem. Skóre podle závažnosti.
      - Současný stav: 307 OCR slepeného boldu na 85 souborech,
        162 souborů bez author:, 16 souborů s wiki/mapa link v body.
      - [ ] Petr/David: postupně při dotyku článku v Sveltia opravit
        podle prioritního seznamu (`pnpm content:audit --top 20`).
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
- [ ] `astro.config.mjs` → `site: 'https://hodinarium.eu'` (oba apps)
- [ ] `astro.config.mjs` → `cdnBase` z R2 dev URL na `https://imgcdn.<doména>`
      (oba apps) + custom domain attach v R2 dashboardu (Settings → Custom Domains)
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
