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

- [x] **H1 — 15 stub medailonů hodinářů z Jubilejní výstavy 1891**
      — hotov 2026-05-18. Vytvořeno všech 15 stubů s isStub: true +
      editorNotes.todo navádějící na dohledání primárních pramenů.
      Každý stub má dobovou citaci z katalogu 1891 (Google Books `S9tvQy_8o8EC`,
      s. 587), kontextový komentář k exponátu (technické detaily, dobová
      terminologie) a strukturovaný popis sortimentu.

      Vytvořené medailony:
        - karel-suchy-a-synove (Praha, dvorní dodavatelé)
        - bartolomej-stepanovsky (Kolín, astronomické hodiny)
        - v-cerveny-plzen (Plzeň, elektrické hodiny + sokolské)
        - jindrich-havlicek (Praha, opakovací hodiny)
        - frantisek-donat-nymburk (Nymburk, period-revival)
        - ferdinand-diepold (Mšec, 2-letý nátah)
        - otakar-stastny (Praha, jumping-hour)
        - hajny-patera (Jičín, hodinář+truhlář kooperace)
        - ladislav-plny (Kolín, roční hodiny)
        - g-becker-broumov (Broumov, atribuce nejistá)
        - cenek-acht (Chomutov, chronometr)
        - frantisek-krivanek (Žižkov, pendlovky)
        - jan-dusek-zasmuky (Zásmuky, nestandardní ciferník)
        - vaclav-stastny-pouzdrar (Praha, pouzdrář)
        - vaclav-hrdy-nova-paka (Nová Paka, model orloje)

      Všichni jsou současně doplněni do `data/hodinari.ts` s display name,
      aliasy, era 19stol, relatedSlugs → jubilejní výstava článek.
      Cross-refs: 341 → 356 hodinari refs absorbováno.

      **Follow-up (continuous):** postupně dohledat životopisná data z:
        - matriční záznamy obcí
        - regionální muzea + archivy
        - Schematismus Království Českého 1890s
        - Adresář kr. hlavního města Prahy 1890s (pro pražské)
        - dochované signatury (aukční databáze: Dorotheum, Hejtmánek)
        - Hellichův soupis věžních hodin v Polabí (1917) — kontext

- [x] **SL7 — `krok` Bureš 1965 dělení** — hotov 2026-05-17.
      PDF Bureš 1965 doplněno do Zotero (`G8KJDSAC`) + OCR text
      `~/Zotero/storage/G8KJDSAC/Bureš - 1965 - Hodinové stroje I.PDF.ocr.txt`.
      Do `content/slovnik/krok.md` doplněna sekce „Rozdělení kroků (Bureš 1965)"
      s tabulkou 3 základních skupin (vratné/klidové/volné) podle Bureše s.97
      + dlouhá citace v Reference sekci.

      **Pro rebuild semantic index:** spustit `pnpm search:rebuild` aby
      Bureš 1965 byl dostupný v `mcp__zotero-mcp__semantic_search` výsledcích
      (dnes zatím není indexován vektorově, jen filesystem OCR).

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

- [ ] **A.25 Sjednocený image systém + náhrada Highslide** (~3 dny,
      navrženo 2026-05-17). Plný návrh v memory note
      `feedback_image_system.md` + skill `obrazky/SKILL.md`. Krátce:
      sjednotit 4 dnešní renderingové cesty (články, sbírkové karty,
      soupis, hodinari) do jednoho systému se sdíleným lightboxem,
      galerií a credit overlay. Nahradit Highslide ze staré stránky
      (z 2007, neudržovaný od 2012). Plán emailu pro Petra:
      `audit-pro-petra.md` nebo v memory.

      **Vrstvy:**
      - L2 normalizace: jeden `ImageData` typ pro markdown `![]()`,
        direktivu `::photo`, schema `foto[]` i `portret`.
      - L3 komponenty: `<ResponsivePicture/>` (už máme části přes
        R2 variants, viz `R2 image variants pipeline` níže —
        `imgvariants:build` + `cdnBase`), `<ImageCard/>` (overlay
        credit z `Photo`, tone-aware), `<Gallery/>` (grid + sdílený
        `<dialog>` lightbox všude, klávesnice + swipe + ESC).
      - L4 layout: `ArticleImageBehavior` zúžit na ~250 řádků
        (z dnešních 618), oddělit `CollectionFotoGrid` a
        `ThumbnailList` pro non-article kontexty.

      **Migrace markdown:** remark plugin v build pipeline transformuje
      `![]()` na `<ResponsivePicture/>` server-side — autoři dál píší
      obyčejný markdown, ale browser dostane `<picture>` se všemi
      variantami. Nula práce pro editora.

      **Highslide phase-out:** v legacy PHP webu `hodinarium.eu` je
      Highslide ~80 KB JS + CSS, draggable popupy, na mobilu nepoužitelný,
      bez a11y. Nový lightbox je native `<dialog>`, ~3 KB JS, mobile-first,
      ARIA labels.

      **Závislosti:**
      - A.9 DNS switch (potom přejmenovat R2 cdnBase z `pub-…r2.dev`
        na `imgcdn.<doména>`)
      - bez závislosti na A.26 (XMP migrace) — tu lze dělat paralelně

- [ ] **A.26 Plná migrace všech fotek na R2 + XMP metadata** (~2 dny,
      navrženo 2026-05-17). Dnes je v R2 jen `csh-imgvariants` bucket
      s AVIF/WebP varianty (367 MB), originální JPG jsou stále v gitu
      v `public/img/` (2 822 souborů, stovky MB). Cíl: přesunout
      originály do druhého R2 bucketu (`csh-images` nebo do stejného)
      + zapsat XMP metadata do binárních souborů.

      **Free tier R2 (ověřeno 2026-05-17):** 10 GB úložiště měsíčně
      zdarma, 1M Class A + 10M Class B operations zdarma, **egress vždy
      úplně zdarma** (i nad limit). Naše ~400 MB je 25× pod limit.
      Cena nad limit: $0.015/GB-měsíc (symbolické).

      **Kroky:**
      1. Build script `migrate-originals-to-r2.ts` — upload `public/img/*`
         do R2 s `x-amz-meta-*` headers (author, license, source URL,
         checksum). Idempotent.
      2. Před uploadem: pro každý soubor zavolat `exiftool` a zapsat
         XMP do binárky (autor, licence, zdroj, rok). Helper script
         `embed-xmp-from-frontmatter.ts` — čte credit z `foto[]` /
         `Photo` direktiv / hodinari `portret` + propojené credit.
      3. `<ResponsivePicture/>` přepnout originály na R2 URL přes
         existing `cdnBase` config (žádný nový kód).
      4. Po validaci (1 měsíc dual-running) → `git rm -r public/img/`.
         Repo zhubne o stovky MB; clone bude rychlejší o ~30 s.
      5. Sveltia CMS upload widget: přepnout z git-commit binárek
         na R2 signed URL upload (custom CMS widget, ~1 den práce).

      **Metadata strategie trojvrstvě:** XMP v binárce (čte Photoshop /
      Lightroom + náš build pipeline přes `exifr`), R2 custom metadata
      (rychlý lookup bez stahování), frontmatter `alt`/`caption`
      (povinný pro a11y, kontext-specific).

      **Akce pro Davida:** schválit přesun bucketu (eventuálně použít
      `csh-imgvariants` jako single bucket pro vše místo dvou).
      Připravit `imgcdn.<doména>` DNS po A.9.

---

### Slovník — rozšíření modelu (návrh 2026-05-17)

Sada inkrementálních rozšíření slovníkového schématu motivovaná
ChatGPT návrhem na plnohodnotný lexikografický model (LemmaEntry +
Sense + Concept + Term + Translation + CrossRef + Attestation
+ PostgreSQL + OpenSearch + Neo4j + MCP). Po kritickém review jsme
plný refactor zamítli (overkill pro 153 hesel, 3 nové deployment
surfaces, vendor lock-in, ztráta Sveltia compat) a místo toho
zvolili **5 menších kroků**, které řeší konkrétní pain points
a zachovávají Astro MDX content collections jako source of truth.

Volby Davida (2026-05-17):
- Jazyky: pouze cs hesla dnes, conceptId opt-in jako příprava pro V2
- MCP: hybrid (JSON export teď, MCP po stabilizaci A.25/A.26 — sjednotí s A.12)
- Multi-sense: středně (5–20 hesel, opt-in `vyznamy[]` schema)
- Atestace: strukturovaná `atestace[]` jen kde má smysl (historické změny)

Plný design + zamítnutí ChatGPT návrhu v session transcriptu
2026-05-17.

- [ ] **A.27 Slovník — multi-sense schema `vyznamy[]`** (~4 h).
      Schema rozšířit o optional pole:
      ```yaml
      vyznamy:
        - kontext: "v hodinařině"
          definice: "Vnější indikační plocha hodin..."
          kategorie: mechanika
        - kontext: "obecně"
          definice: "Číslovaná tabule (silnice, sport)..."
          kategorie: jine
      ```
      Backward compat: `definice` zachovat, pokud má heslo 1 význam.
      Render v `pages/slovnik/[slug].astro`: pokud `vyznamy[]` →
      render jednotlivé sense bloky s kontextovým nadpisem; jinak
      současný `definice`.

      **Kandidáti k migraci** (5–20 hesel s polysémií v hodinařině):
      ručka, balanc, lihýř, vlásek, vidlice, krok, hřídel, ciferník,
      ramenko, soukolí (často 1 cs slovo = více technických rolí).

- [ ] **A.28 Slovník — varianty se status field** (~6 h). Dnes
      `varianty: ["X", "Y", "Z"]` flat array bez kontextu — uživatel
      nevidí, která je preferovaná a která archaická. Vylepšit:
      ```yaml
      varianty:
        - term: číselník
          status: preferred
        - term: ciferník
          status: archaic
          note: "Kalk z DE Zifferblatt, v 19. století běžný"
          doloženo: "Špatný 1882, s. 23"
        - term: cifrák
          status: erroneous
          note: "Lidové, v odborném textu nepoužívat"
      ```
      Status enum: `preferred | admitted | archaic | erroneous | ocr-variant | historical`.
      Schema přijme oboje (string i objekt) — incremental migrace.
      Render: status badge u každé varianty (zelený preferred, šedý
      archaic, červený erroneous, ...).

      **Konkrétní akce:**
      1. Schema rozšířit v `content.config.ts` o union (string | object)
      2. Render `[slug].astro` — badge komponenta pro každou variantu
      3. CSS pro status badges (sjednoceno s ostatními badges v projektu)
      4. Migrovat 5 hesel s nejvíce variantami jako pilot

- [ ] **A.29 Slovník — atestace[] array pro historické hesla** (~6 h).
      Pro hesla s významnou terminologickou proměnou napříč staletími
      (např. `rafije` → `ručka`, `ciferník` → `číselník`, `vlasová
      pružinka` → `vlásek`) přidat strukturované atestace:
      ```yaml
      atestace:
        - rok: 1851
          pramen: "Šumavský"
          forma: rafije
        - rok: 1882
          pramen: "Špatný"
          forma: rafije
          citace: "..rafije jest šipka.."
        - rok: 1947
          pramen: "Sladkovský"
          forma: ručka
          note: "Sladkovský sjednotil terminologii na ručka"
      ```
      Render: timeline UI s formami v různých dobách (vlnovková
      grafika 1850→2020, jednotlivé prameny jako body).

      **Kandidáti** (~10 hesel kde má smysl): rafije/ručka,
      ciferník/číselník, vlasová pružinka/vlásek, vřetenový krok,
      lihýř, balanc/setrvačka, foliot.

      **Zdroje** (už máme indexované): Šumavský 1851, Špatný 1882,
      Sušický 1900, Sladkovský 1947, Hajn 1953, Michal 1980, Bureš 1965
      (Bureš OCR cache poškozený, viz SL7 v A.1).

- [ ] **A.30 Slovník — conceptId infrastructure pro V2 vícejazyčný**
      (~3 h). Schema přidat optional `conceptId: string` (format
      `HORO-<TOPIC>-<NN>`, např. `HORO-DIAL-001`, `HORO-HAND-001`).
      Concept **neexistuje jako separátní stránka** — je to jen klíč
      pro group/lookup.

      Build script v `scripts/build-concept-index.ts` postaví mapu
      `conceptId → [slug1, slug2, ...]` napříč všemi hesly. Render
      v `[slug].astro`: pokud heslo má conceptId a existují další
      hesla se stejným conceptId (např. budoucí en/de/fr varianty),
      zobrazit „Související koncepty" sekci s odkazy.

      **Dnes:** vyplnit conceptId u ~10 pilotních hesel (číselník,
      ručka, krok, kotva, kyvadlo, setrvačka, vlásek, krokové kolo,
      soukolí, ciferník). Bez immediate UI changes.

      **V2 (až bude potřeba):** založit en/de/fr varianty hesel
      (`content/slovnik/en/dial.md`, …) → automatic cross-language
      nav přes conceptId. Wiktionary-like bez separátní Concept
      entity.

      **Důležité:** žádné `/slovnik/concept/<id>` stránky — concept
      je metadata, ne entity s vlastním lifecycle.

- [ ] **A.31 Slovník — JSON export pro AI agents** (~3 h). Build
      script `scripts/build-dictionary-index.ts` generuje
      `apps/hodinarium-eu/public/dictionary-index.json` (~50 KB
      odhadem pro 153 hesel). Schema per slug:
      ```json
      {
        "ciselnik": {
          "lemma": "číselník",
          "lang": "cs",
          "conceptId": "HORO-DIAL-001",
          "kategorie": "mechanika",
          "varianty": [
            {"term": "číselník", "status": "preferred"},
            {"term": "ciferník", "status": "archaic", "note": "..."}
          ],
          "translations": {
            "de": [{"term": "Zifferblatt", "genus": "n"}],
            "en": [{"term": "dial"}, {"term": "clock face"}],
            "fr": [{"term": "cadran", "genus": "m"}]
          },
          "definice": "...",
          "vyznamy": [...],         // pokud A.27 implementováno
          "isStub": false,
          "redirectTo": null
        }
      }
      ```
      Expose přes `/dictionary-index.json` (static, Cloudflare CDN
      cache). Pro AI translation agent / external consumers / budoucí
      MCP V2. **Bez API server** — jen statický JSON, cache-friendly.

      **Závislosti:** ideálně po A.28 (status field) a A.27 (vyznamy[])
      aby export obsahoval kompletní strukturu.

- [ ] **A.32 MCP server pro slovník + Zotero** (V2, ~4 dny po A.31).
      Sjednoceno s **A.12 (`@csh-cz/mcp-horologie`)** — plný design
      v `docs/design-mcp-horologie-2026-05-09.md` (11 PBI ticketů).
      Implementaci pustit **až po A.25/A.26 stabilizaci** (image
      systém + R2 migrace) a A.27–A.31 (slovník schema rozšíření).

      Tools (V1 read-only):
      - `search_entries(query, lang?, kategorie?)`
      - `get_entry(slug)`
      - `translate_term(term, src_lang, target_lang, context?)`
      - `suggest_glossary_for_text(text, src_lang, target_lang)`
      - `check_translation_consistency(src_text, target_text, ...)`
      - `get_attestation_history(term, lang)` — využije A.29 atestace[]
      - `find_concept_synonyms(slug)` — využije A.30 conceptId
      - `cite_term(term, lang)` — vrátí ISO 690 citaci z Zotero refs

      **Stack:** stdio MCP server, ~200–300 řádků TypeScript, čte
      `dictionary-index.json` z A.31 + Zotero `references.json`.
      Žádná DB. Distribuovat jako `npx @csh-cz/mcp-horologie`.

      **Write capabilities (V2):** `add_or_update_entry`,
      `add_translation` — generují PR drafty pro git commit, ne
      přímý write. Zachovává validation + review workflow.

## A.7 — Tech dluh (větší)

- [x] **D2 Pre-push CI check** — hotov 2026-05-18 po druhé sérii Sveltia
      null deploy fails (\~7 commitů stuck od françzek-moravus do
      sveltiaCleanNulls fix `f3301c3a`).

      Workflow `.github/workflows/content-validate.yml` spouští na push
      do main i na PR:
      1. `pnpm validate:content` — broken refs, duplicate keys, slug mismatch
      2. `node scripts/build-cross-refs.mjs --strict` — cross-collection refs
      3. `pnpm test:unit` — Vitest (10 tests, D1)
      4. `pnpm --filter hodinarium-eu astro check` — TS + schema
      5. `pnpm --filter horologie-cz astro check` — TS + schema
      6. `pnpm --filter hodinarium-eu build` — plný build
      7. `pnpm --filter horologie-cz build` — plný build

      Concurrency group cancel-in-progress (Sveltia auto-commits přijdou
      v rychlém sledu — bez tohoto by se queue plnila). `paths:` filter
      ignoruje editaci docs/TODO/BUGS aby se neutrácely CI minuty.
      Failure summary v GH Step Summary s diagnostikou nejčastějších
      příčin (Sveltia null, broken slug, TS error).

      Bonus: workflow běží i na PR — pull requests dostávají červený X
      předtím než je merge možný.

- [partial] **D1 Test coverage** — V1 hotov 2026-05-17 (commit 8629ecdc):
      Vitest 3.2.4 setup, 10 testů v `scripts/__tests__/build-dictionary-index.test.ts`
      (parseFrontmatter, normalizeVarianta), `pnpm test:unit` + `pnpm test:unit:watch`.

      **V2 follow-up:** snapshot testy pro layouty + testy pro
      další build scripts (parse-soupis, build-redirects, apply-popisy,
      migrate-renumbering, audit-dead-links). Cílit na ~60 % coverage
      pro `scripts/` (dnes ~10 %). Bonus: hookat do D2 CI workflow.
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

- [x] **REF1 — 66 bibKey-only odkazů bez Zotero match ani fallback dat**
      — hotovo 2026-05-18. Zpracováno ve 4 fázích:
      1. **Phase A (KartaInv\*)** — 10 hodinari medailonů odstranilo
         bibKey reference; sbírková karta je auto-linkována přes
         existující `relatedSlugs[]` v `data/hodinari.ts` (pro michael-christ
         doplněno `inv-6-vezni-michael-christ`).
      2. **Phase B (muzeum stuby)** — 18 souborů `content/hodinarium-eu/muzeum-*.md`
         dostalo strukturované ad-hoc `title + url` reference s oficiální
         URL muzea (Furtwangen, Glashütte, MIH, Wien Museum, RMG, Patek,
         Aschau, Beyer, Chemnitz, Pillichsdorf, Klementinum, Jindřišská,
         Kadaň, Prostějov, Ostravské, Týniště, Olomouc, Gdaňsk).
      3. **Phase C (slunecni.mdx)** — 10 URL recovered z legacy
         `https://hodinarium.eu/slunecni.htm` přes `curl + iconv`;
         doplněn i cs Wikipedia link a oprava placeholderu
         `frantisekNarodniTechnickeMuzeum` na NMM Greenwich (správný zdroj).
      4. **Phase D (24 jednotlivých)** — 18 souborů, mix:
         - **Wikipedia placeholdery**: `JunghansWikipedia`, `HebrejskaAbeceda`
           → ad-hoc wiki refs.
         - **Atelier Skála placeholdery**: `AtelierRestaurovaniVeznich(a)`,
           `StrojZidovskychHodin` → `http://www.veznihodiny.cz/`.
         - **Webové stránky** s URL recovered z legacy: `Anatomievarhancz`,
           `AntikhovorkaczPrimlandclanky`, `MuseoDellorologeriaPesarina`,
           `SolariDiUdine`, `FachkreisTurmuhrenHistorische`.
         - **Dobové prameny** (článkové): `104RokuHodinarstvi1940`,
           `JanProkes1891`, `paukertJanProkesVynikajici1909`,
           `OddeleniModernihoPrumyslu1895a`, `UspechCeskePrace1897a`,
           `BrozuraOkresniVystave1911` → ad-hoc s rokem + note
           (Zotero entry pro tyto pramene by byla dobrá long-term, ale
           nyní renderuje s plnou bibliografickou citací).
         - **Knihy s ISBN**: `kuceraJosefRomualdRosalia2017a`,
           `martinekDejinyCeskoslovenskehoHodinarskeho2009a` → ad-hoc
           title + author + ISBN.
         - **Internal links**: `Akvizice20152025` → `/clanky/akvizice-2015-2025/`.
         - **Sborník**: `HodinariSamotiiskach1996` → URL na samotisky.cz PDF.
         - **Wenzel Mellner**: `BarokniStrojZnaceny` → archivní záznam
           (depozitář ČSH, atribuce nejistá).

      Některé suffix-`a` klíče (`UmelecHodinarsky1882a`, `krecmerHodinarstvi1878a`,
      `InzeratKrecmer1876a`) byly auto-remapnuté na neyysuffixované Zotero
      verze pomocí post-sync suffix-strip scriptu.

      **Verifikace**: `npx tsx scripts/audit-bibkey.ts` reportuje
      `Problematic: 0 entries, 0 files` (předtím 66 entries, 44 souborů).

## A.11 — Alt text audit (continuous, 24 článků)

Issue #24 root cause: legacy import z hodinarium.eu měl všechny `<img>`
s `alt="Highslide JS"` (default lightbox alt), tedy turndown → markdown
dostalo generické `![Fotografie N](…)` patterny. To kazí a11y, SEO i
asociaci text/image.

**Stav 2026-05-19:** 24 souborů s `![Fotografie N]` pattern v
`content/hodinarium-eu/`. **vez-kli.md** opraven (8 obrázků s popisnými
alt texty na základě kontextu článku).

**Zbývá projít** (priorita podle čtenosti):
- bychory-prokes1, decin-flatbed, decin-patek, decin-jednotny-cas,
  decin-wenzel-mellner, decin-velika-ves, decin-zamek, kardasova-recice,
  kvetinovehodiny-nove-mesto-nad-metuji, janovice, … (přesný seznam
  `grep -lE '!\[Fotografie [0-9]+\]' content/hodinarium-eu/*.md`)

**Postup:** při dotyku článku v Sveltia editor přepsat alt texty
na základě kontextu odstavce, který obrázek doprovází. Nepoužívat
generická slova „Fotografie", „Obrázek" — vždy popis (např.
„Detail krokového ústrojí", „Pohled na věž s ciferníkem", …).

Continuous — nepatří do jednoho batche.

## A.12 — WCAG 2.2 manual gaps audit (2026-05-19)

Doplnění k existujícím axe-core suitám (`axe-a11y` + `axe-wcag22`,
oba 22/22 pass, 0 violations). Tři nové Playwright testy pokrývají
kritéria, která axe nedokáže měřit bez reálné layout introspekce —
target size, focus order, focus visibility.

**Stav 2026-05-19:** Všech 33 nových testů passed. Findings:

- **2.5.8 Target Size (Minimum) — 7 violations napříč 2 stránkami:**
  - `apps/hodinarium-eu/src/pages/index.astro` — 2× section CTA
    „Procházet podle tagu →" (`:63`) a „Procházet vše →" (`:120`)
    mají height 21 px (< 24 px). Jsou v `<header>` blocích, ne v
    `<p>`, takže nepokrývá inline-link exemption WCAG spec.
  - `apps/hodinarium-eu/src/pages/soupis-veznich-hodin/index.astro:244`
    — 5× native checkbox 13×13 px (filter Stav). UA-styled, technicky
    má „Essential" výjimku, ale doporučení je explicit upscale.
- **2.4.3 Focus Order — 0 issues**. Všech 9 zachycených stránek 15/15
  unikátních tab kroků, žádné cykly ani trapy. (Race condition v JSON
  append zapsala 9 z 11 stránek; stdout potvrzuje všech 11 = pass.)
- **2.4.7 + 2.4.13 Focus Visible — 0 issues** po vyloučení disabled
  controls. Žádná komponenta nepoužívá `:focus { outline: none }` bez
  náhradního indikátoru.

**Strukturovaný výstup:** `apps/hodinarium-eu/src/data/_a11y_findings.json`
(audit summary + per-finding source + fix recommendation).

### Akční položky

- [ ] **P2 — section CTA target size** v `apps/hodinarium-eu/src/pages/index.astro`
      (řádky 63 a 120). Fix: přidat `min-height: 24px` (nebo
      `padding-block: 0.25rem`) na `.text-sm` linky uvnitř sekčních
      `<header>` blocích. Lze řešit jedním společným utility classem
      (např. `.cta-end`) pro budoucí konzistenci.
- [ ] **P3 — soupis checkbox upscale** v
      `apps/hodinarium-eu/src/pages/soupis-veznich-hodin/index.astro:244`.
      Fix: `.stav-checkbox input { width: 1.25rem; height: 1.25rem; cursor: pointer; }`.
      Klik na celý `<label>` už funguje (touch zone > 24×24), ale
      explicit upscale je čistší pro pointer/keyboard accuracy.

### Continuous monitoring

Po každé větší UI změně spustit:

```bash
pnpm exec playwright test tests/smoke/a11y-*.hodinarium.spec.ts \
  --project=hodinarium-chromium --reporter=list
```

Output: `test-results/a11y-*-findings.json` (3 soubory). Diff proti
předchozímu runu odhalí regrese (nové fialové linky bez padding,
focus state odstraněný omylem v reset CSS, atp.).

Pokud nějaká nová UI komponenta:
- přidá disabled-by-default tlačítka, ověř `:focus-visible` style i pro
  aktivní state (test je vyloučí, ale lidská validace pomůže);
- přidá custom-styled checkbox/radio (zaškrtávátka „přepínače"), nech
  bounding box ≥ 24×24 px.

## A.10 — Bug fixes z GH issues (audit 2026-05-19)

Triáž 10 open issues v `csh-cz/web` z hlášení editorů od 2026-04-28 do
2026-05-13. Stav po analýze (commitech z 2026-05-13–2026-05-18) +
verifikace souborového stavu.

### Pravděpodobně už vyřízené (zavřít po manuální verifikaci na live)

- [ ] **#33** „pole hodinář v soupisu — neuvádět restaurátora, sjednotit
      jména, 'neznámý' bez vysvětlení" — pravděpodobně vyřízeno řadou
      commitů 2026-05-17/18:
      - `46b520d8` restaurátor extrahován do samostatného sloupce + slug
      - `ad89c932` hodinář pole čisté jméno
      - `812bf7ca` hodinarText sjednocen na „neznámý" (CES standard)
      - `7c086344` display „Příjmení, Jméno"

      **Verify na live:** otevřít https://hodinarium-eu.pages.dev/soupis-veznich-hodin/
      a zkontrolovat sloupec Hodinář. Pak `gh issue close 33 -R csh-cz/web`.

- [ ] **#32 (část 2)** „v štítku stavu nebuď 'stav neznámý' ale jen 'neznámý'"
      — pravděpodobně vyřízeno `db5f4636` (text změněn na „neověřeno").
      **Verify:** chip v tabulce už říká „neověřeno" místo „stav neznámý"?
      Pak `gh issue close 32 -R csh-cz/web` s comment že část 1 (reload
      button) je nově sledována jako #32a níže.

### Vyřízené v batchi 2026-05-19 (čeká na push + close)

- [x] **#26** broken link `/hodinarium-eu/kinsner-...` v `dondi.mdx` →
      `/clanky/kinsner-astronomicke-hodiny` (commit `9642d8fd`).
- [x] **#25** tagy/jednotny-cas → 404 u sbírkových karet — `clanekHref`
      respektuje `podsekce: 'karta'` → `/sbirka/karta/<slug>`. Helper +
      catalog-types + 4 callery (commit `ef03c632`).
- [x] **#34** klikání na celý řádek soupisu — `<tr class="row-link"
      data-href tabindex>` + JS click/auxclick/keydown handler.
      `.cell-link-escape` (jméno hodináře) zachovává své anchor přes
      z-index (commit `652e42ef`).
- [x] **#32a** reset filter button icon-only (2×2rem čtverec s badge)
      — commit `652e42ef`.
- [x] **#36** „Upravit" FAB renderuje server-side z ReportIssueModal
      přes prop `cmsEditUrl` — žádný race s `/api/admin-session-status`
      (commit `481ece43`).
- [x] **#27** kronika/vez1 patička přes galerii — `.article-gallery`,
      `.article-byline`, `.prose-content::after` mají teď `clear: both`
      (commit `26b17edd`).
- [x] **#21** flying_pendulum nelze opravovat — CF Pages trailing-slash
      mismatch v D6 redirectech. `build-redirects.ts` teď generuje pár
      pro každý D6 rename (s i bez `/`). Commit `0f747817`.
- [x] **#24** sbirka vez-kli alt texty (1 z 24) — popisné alt texty pro
      8 obrázků v `vez-kli.md`. Zbývajících 23 článků v A.11 continuous
      (commit `0f747817`).
- [x] **#18** iframe recovery — 7 z 13 článků dohledáno přes
      `scripts/recover-iframes.mjs` (idempotent, ::youtube{} dedupe).
      arduino-ibm, prs10, fake-atomove-hodiny, hodinky-12-24-ciferniku,
      cas-internet2, segmentovky-s-prekladem, kronika/sezona2013.
      3 zbývají manual (tabor + sezona2012 — raw chybí; timeslider — md
      neexistuje). Commit `5965c55b`.

### Po deployi spustit close

```bash
gh issue close 18 26 27 32a 34 36 -R csh-cz/web
gh issue close 21 24 25 -R csh-cz/web
```

(Note: #32a není reálný GH issue, byl follow-up k #32 který je už zavřený.
Reálné closes: 18, 21, 24, 25, 26, 27, 34, 36.)

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
