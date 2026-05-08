# TODO

Otevřené úkoly a odložená rozhodnutí pro CSH Web (hodinarium.eu, horologie.cz).

## Vysoká priorita — čeká na Petrovu odpověď z auditu

Plný audit: [`audit-pro-petra.txt`](audit-pro-petra.txt). Petr odpoví, pak doplníme.

- [ ] **B2 Revize obsahu (evergreen)** — průběžná kontrola legacy článků:
      překlepy, OCR artefakty (`**X**slovo` patterns, `* * *` duplicity),
      atribuce v body → `author:` frontmatter, wiki/mapa odkazy → `references:`,
      `<Photo>` místo `![]()` u obrázků s creditem. Pravidla v skill
      `clanky-konvence` sekce 18. Postupně při dotyku článku.
- [ ] **B3 Vybrané exponáty per sekce** — můj výběr 4×4, Petr potvrdí/změní
- [ ] **B5 Datace článků** — opravit ručně 14 podezřelých roků < 1500
- [ ] **B7 Kategorizace 124 nezařazených** — sporných ~30 článků k ručnímu zařazení
- [ ] **B8 NTPH a NTPH_st** — sloučit / vyhodit duplicity?
- [ ] **C1 Titulní obrázek** — Petr vybere foto pro hero
- [ ] **C2 Logo** — soutěž v plénu, nebo nechat textové
- [ ] **C3 Sponzoři** — patří do hodinaria nebo spolku?

## Střední priorita — naplnit obsah

- [ ] **Akce — fotografie** z Google Photos drop-zone do `apps/horologie-cz/public/img/akce/<slug>/`,
      pak doplnit `fotky: []` v `src/data/akce.ts`. 5 akcí už má složky, zbytek postupně.
- [ ] **Skript pro auto-import fotek z ZIP** — rozzipovat → přejmenovat → doplnit data file.
      Až bude první ZIP, naprogramuju.
- [ ] **Příspěvky na členských schůzích** — Petr dodá PDF / přepisy / audio

## Nízká priorita — Až bude reálná potřeba

### 🔒 Decap CMS / administrátorské rozhraní (odložené)

**Co**: Web admin pro Petra (nebo další členy) — drag-drop editace článků, fotek, dokumentů
bez nutnosti znalosti Markdownu/gitu.

**Status**: Odložené. Aktuálně edituje David přímo v gitu, Petr posílá podklady mailem.

**Až bude potřeba** (Petr/další chce sám editovat):

1. **Cloudflare Access** pro `/admin/*` URL — magic-link přes email
   - Allow list: `petr@…`, `david@…`, případně další z výboru
   - Free do 50 uživatelů
2. **Decap CMS** ([decapcms.org](https://decapcms.org)) nebo modernější **Sveltia CMS**
   - Single-page app, žádný backend
   - Pod kapotou commituje do gitu přes GitHub API
3. **Editorial workflow** — každá editace jako PR, schvaluje David před mergem
4. **Cloudflare Pages preview** automaticky pro každý PR

**Odhad práce**: ~3 hodiny setup, jednorázově.

### 🌐 Migrace orloj.eu

Po dokončení hodinaria + horologie pustit **stejný pipeline na orloj.eu**:
- Scrape (cca 200 stránek)
- Convert
- Build catalog
- Download assets
- Deploy

Petr explicitně řekl "zatím nedělat" — počkáme.

### 🤖 AI funkce

Připraveno, čeká na zelenou:

- **TL;DR generator** — pro každý článek 2-3 věty stručného shrnutí (Gemini Flash, free tier)
- **Sémantické vyhledávání** — embeddings při buildu, prohledávání přes Transformers.js v browseru (zdarma navždy). Návrh viz níže.
- **Zeptej se Hodinária** — RAG chatbot přes Cloudflare Workers AI (free tier 10k Neuronů/den)
- **AI překlad CS → EN** — Claude/Gemini, glosář horologických termínů

Vyžaduje:
- Schválení licence A1 (kvůli odvozeným dílům z AI)
- Reálná poptávka (zatím čistě česky stačí)

#### Sémantické vyhledávání — návrh tří cest

Jako vodítko před implementací. Doporučuju **A** kvůli nulovým provozním
nákladům a kompletní statice — ladí s aktuální Cloudflare Pages architekturou.

**A. Transformers.js v prohlížeči (doporučeno)**
- Build: `@xenova/transformers` v Node embedduje title + excerpt každého
  článku, výstup `apps/hodinarium-eu/public/search-index.json` (~250 KB,
  256-dim × 200 článků).
- Runtime: `/hledat` stránka načte JSON + model `Xenova/multilingual-e5-small`
  (~120 MB, jednorázově do cache), embedduje dotaz a počítá kosinovou
  podobnost. Fallback na Pagefind keyword pro krátké dotazy.
- Provoz: 0 Kč navždy. První návštěva /hledat má ~3—5 s startovní latenci.
- Práce: ~4—6 h. Čistě v repu.

**B. Cloudflare Workers AI + Vectorize**
- Build: stejný embed, ale uload do Vectorize indexu pomocí Wrangler.
- Runtime: Worker přijímá dotazy, embedduje přes Workers AI a dotazuje
  Vectorize. Bez frontend modelu — dotazy se načtou okamžitě.
- Provoz: free tier 10k Neuronů/den a 30M dotazů/měsíc. Vystačí.
- Práce: ~6—8 h. Vyžaduje `wrangler.toml`, Workers AI binding
  a build-time Vectorize upload.

**C. Pagefind + synonyma (nejmenší krok)**
- Současný Pagefind doplnit o ručně psaný slovník horologických synonym
  (švarcvald = Schwarzwald = lesní hodiny atd.).
- Není sémantika, ale velmi laciné a obratem užitečné.
- Práce: ~1—2 h.

Implementačně lze postupovat C → A. C je vždycky výhra; A se zapne až
po doménovém přesunu (kvůli velikosti indexu chce ostré HTTP/2 + Brotli).

### 🎨 Design pokračování

- [ ] **Live ciferník na titulce** — SVG zobrazující aktuální stav astrolábu (sun/moon position)
- [ ] **3D modely** vybraných hodin (až bude content)
- [ ] **Audio nahrávky** úderů věžních hodin (až bude content)

### 🌍 Vlastní domény

- [ ] **`hodinarium.eu`** přesměrovat na Cloudflare Pages (nyní `hodinarium-eu.pages.dev`)
- [ ] **`horologie.cz`** přesměrovat na Cloudflare Pages (nyní `horologie-cz.pages.dev`)

DNS přesun, TLS certifikát Let's Encrypt zdarma. ~30 minut každá doména.

#### Po DNS switch — odblokovat indexaci

Aktuálně blokovaná, ať Google neposílá lidi na `*.pages.dev` (commit 42eb32c, 2026-05-02). Po DNS switch vrátit:

- [ ] `apps/hodinarium-eu/src/layouts/Base.astro` → smazat oba `<meta name="robots/googlebot">` bloky (DEV STATE komentáře v souboru fungují jako waypointy)
- [ ] `apps/horologie-cz/src/layouts/Base.astro` → totéž
- [ ] `apps/hodinarium-eu/public/robots.txt` → vrátit `Allow: /` + `Disallow: /og-preview /og/ /podklady/`
- [ ] `apps/horologie-cz/public/robots.txt` → vrátit `Allow: /` + `Disallow: /og/`
- [ ] Po pushi a deployi submitnout sitemapy do Google Search Console

**Pro vlastní testování stačí HTTP fetch (Lighthouse, Pagefind, link audit, scrapery) — `meta noindex` neblokuje fetch, jen Google indexaci.** Pokud chceš testovat Google Rich Results, dočasně zakomentuj 2 řádky meta tagů v Base.astro (popsáno v skill `clanky-konvence` sekce 13).

## Provoz

- [ ] **Zálohy** — repo na GitHubu je primární. Zvážit periodické archivy do ADO?
- [ ] **CI cleanup** — staré Cloudflare Pages preview deployments smazat (aby neplnily kvótu)
- [ ] **README pro nové členy** — jak se zapojit, jak commitnout, koho kontaktovat

## Technický dluh

- [ ] **OG images** — generuje se ručně přes `pnpm og:build`. Přidat do CI?
- [ ] **`build-og-images.ts`** stále vyrábí OG pro vyhozené spolkové slugy
      (`spolek`, `sponsor`, `stanovy` atd.) na hodinarium-eu — vyčistit
- [ ] **Cleanup unused script** `strip-dead-refs.ts` — už ne aktuální
- [ ] **`raw/`** soubor `.DS_Store` — měl by být v gitignore (i když celá složka je)
- [ ] **`build-image-index.ts`** zatím jen pro hodinarium-eu; rozšířit
      i na horologie-cz (~63 obrázků), aby `rehype-picture` mohl doplnit
      intrinsic w/h i tam.
- [ ] **`rehype-picture` opt `wrapInPicture: true`** — zapnout až po
      `pnpm imgvariants:build` a commitu .avif/.webp variant. Pozor na
      Cloudflare Pages limit 20k souborů (2700 zdrojů × 3 formáty = 8100
      img + ~250 stránek = pohodlně pod limitem).
- [ ] **`Article.astro` byline `<time>`** — vykresluje `Invalid Date`
      pro většinu článků (chyba v parsování `lastModified` z frontmatteru,
      nesouvisí s last-modified opravou commitu fa298a7).

---

# Tech & funkcionalita — otevřené položky

## 🔴 Vysoká priorita

- [ ] **T4 Lighthouse CI / Web Vitals** — žádné performance budgety. Není
      jasné, jaké je skóre Core Web Vitals. `lhci/cli` v GitHub Actions
      s baseline + threshold (~2 h).

## 🟡 Střední priorita

- [ ] **T7 Network graph hodinařů** — mezi 81 hodináři jsou bohaté vazby
      (učitel-žák, otec-syn, dílny, převzaté firmy). Vizualizovat v
      `/hodinari/index.astro` jako force-directed graph (Vis.js / D3, ~6 h).
- [ ] **T10 Dark / light mode** — hodinarium-eu používá brass dark téma
      (default), není přepínač. CSS custom properties + toggle (~3 h).

## 🟢 Nízká priorita (nice-to-have)

- [ ] **T11 3D modely klíčových exponátů** — orloj-modely (inv. 47 Skála,
      inv. 53 Praha, inv. 65 Kavalír, inv. 68 Sklep). Vyžaduje
      fotogrammetrii nebo manuální modeling.
- [ ] **T12 Comments / Disqus** — žádné komentáře ke článkům. Spolek je
      malý → přínos nízký, ale e-mail kontakt by stačil.
- [ ] **T13 AI features** — viz „🤖 AI funkce" výše.
- [ ] **T14 Decap CMS / web admin** — viz výše, odložen.
- [ ] **T15 Migrace orloj.eu** — ~200 stránek, stejný pipeline. Petr
      explicitně řekl „zatím nedělat".

## ⚙️ Tech debt / kvalita

- [ ] **D1 Test coverage** — smoke testy: 1× hodinarium (`nav-contrast`),
      1× horologie (`akce-mapa`). Regression: 4× hodinarium. Chybí unit
      testy pro skripty (`parse-soupis`, `build-redirects`, `apply-popisy`,
      `migrate-renumbering`), snapshot testy pro layouty. Vitest setup pro
      `scripts/*.ts` (~3 h).
- [ ] **D2 BUGS.md aktualizace** — crawl z 2026-04-28 (54 no-h1, 21 JS
      error, 20 HTTP error, 13 failed request, 6 broken image). Většina
      no-h1 jsou /img/ stránky — možná už ok po /img/ refactoru. Rerun
      `pnpm test:e2e` → fix nebo doc (~2 h).
- [ ] **D3 124 nezařazených článků** (B7 výše) — ~30 sporných potřebuje
      ruční review kategorie.
- [ ] **D4 Datace článků** (B5 výše) — 14 článků má rok < 1500 (nesmysl).
- [ ] **D5 Konsolidace _redirects** — 776 řádků v
      `apps/hodinarium-eu/public/_redirects`. CF má limit 2 000 řádků na
      free tier; zatím ok, ale narůstá. Zvážit regroup pomocí glob patterns.
- [ ] **D6 Slug standardizace na kebab-case** — 114 souborů v
      `content/hodinarium-eu/` má non-kebab slugy: `Arduino`, `astro2_NTP`,
      `decin_jednotny_cas`, `bychory_prokes1`, `Lantime_M100`, atd.
      Mix snake_case + camelCase + underscore vyčnívá vedle kebab-case
      `inv-99-podruzne-hodiny-male-4x` v jedné URL prostoru. Plus
      v `content/kronika/` (sezona2012, sobeslav2c) podobně.
      Zásah: 114 file renames + 114 redirectů v _redirects + grep všech
      inline odkazů `/clanky/<slug>` a `/<kategorie>/<slug>` v body MDX +
      SEO reindex. Citlivá kosmetická operace — odložené po dokončení obsahu.
- [ ] **D7 Doplnění chybějících OG images** — ~493 článků/karet, OG images
      jen pro některé. Build-time check, který vypíše chybějící (~30 min).
- [ ] **D8 Backup strategie pro `zdroje/`** — kritická data (Soupis 3.xls,
      Popisy 2.docx, panely OCR JPG) jsou jen na 1 disku. Git LFS nebo
      Cloudflare R2 sync (~2 h). Repo na GitHub je primary, ale `zdroje/`
      jsou v `.gitignore`.

## 🔌 Integrace

- [ ] **I2 Sentry / error tracking** — pro klientské JS errory
      (Photo.astro lazy loading, SearchModal). Free tier 5k events/měsíc.
- [ ] **I3 Plausible / Posthog** — pro behavior návštěvníků. Plausible
      self-hosted v Cloudflare Workers ~zdarma. Posthog free tier 1M events.
      (Cloudflare Web Analytics už běží — viz I1 hotovo.)
- [ ] **I4 Newsletter (Buttondown / EmailOctopus)** — pro spolek
      horologie-cz, sezónní newsletter o akcích. Buttondown free do 100
      odběratelů.

## 📐 Standardy

- [ ] **S1 a11y audit** — žádný axe-core test. Cíl: WCAG 2.1 AA.
      `@axe-core/playwright` v existujících e2e (~2 h).
- [ ] **S3 `docs/CONTRIBUTING.md`** — pokud někdo z spolku přijde a chce
      přispět, není runbook „jak edituji článek". Skill `clanky-konvence`
      existuje, ale jen pro Claudovu session (~1 h).

---

## 📚 Slovník hodinářských termínů

Sekce `/slovnik/` (commit 9fe2825, 35 hesel) je MVP. Obsah generován ze SSOT
v user-scope skillu `~/.claude/skills/horologicka-terminologie/reference/slovnik.md`,
sync přes `pnpm slovnik:build`.

### 🔴 Vysoká priorita

- [ ] **SL1 Obrázky pro hesla** — všech 35 hesel má placeholder „*(zatím chybí)*"
      v sekci Obrázky. Postupně doplnit z primárních pramenů:
      - Dietzschold 1894 *Die Turmuhren*, Tafel 4 (krok, kotva, krokové kolo)
      - Saunier 1887 *Treatise on Modern Horology* (paleta, vlásek, Breguet)
      - Sladkovský 1947 (schéma bicího stroje, roštové kyvadlo, Phillipsova křivka)
      - Vlastní foto z Hodinária (kladívko, cymbál, větrník, posůvka, srdcovka)
      - Konvence v `~/.claude/skills/horologicka-terminologie/reference/slovnik/img/README.md`
- [ ] **SL2 Verifikace u experta** — 10 termínů v `reference/k-overeni.md` čeká
      na verifikaci (Knespl / Skála): koláčkový vs kolíčkový krok, krok přezmenový
      etymologie, cinkař obor 60. let, rejdovka/pisárka OCR, vypouštěč, stupník
      vs stupní kolečko, kotvička dvojramenná pravopis, remontoirní vs remontoár,
      Hippův přerušovač atribuce.

### 🟡 Střední priorita — rozšíření obsahu

- [ ] **SL3 Hodinky kapesní/náramkové** — kalibr, werk, korunka, sklíčko,
      pouzdro, signatura, automatic, chronograf, fly-back, GMT (~10 hesel)
- [ ] **SL4 Profese a hodinářské školy** — hodinář, pouzdrář, regionální
      školy (pražská, švarcvaldská, vídeňská, anglická, francouzská, švýcarská)
- [ ] **SL5 Bicí mechanismy detail** — Westminster chime, čtvrťové bití,
      repetice, opakovačka, Grande sonnerie 1859 (rozšířit existující hesla)
- [ ] **SL6 Šumavský 1851 — neuvedené termíny** — ~60 hodinářských termínů
      vyextrahovaných ale dosud nezpracovaných (kalendář, dialektismy: kolisadlo,
      závěšadlo, krokvička, kyvák; časoměrné systémy: pršící, komítací)
- [ ] **SL7 Rozšíření existujících hesel:**
      - `krok` — Bureš 1965 dělení na soukolí I/II/III
      - `setrvačka` — moderní Nivarox / Glucydur slitiny
      - `vlásek` — detail Phillipsovy matematiky (3 podmínky)

### 🟢 Nízká priorita — tech / integrace

- [ ] **SL8 Cross-link kroky → slovnik** — v kroky.ts kartě linkovat heslo
      `krok` na `/slovnik/krok` (a podobně v textech článků). Případně skript
      `slovnik:auto-link` paralelně s `kroky:auto-link`.
- [ ] **SL9 Search index** — zařadit slovnik hesla do Fuse.js corpusu
      (`scripts/extract-search-corpus.mjs`), aby se hesla našla globálním
      search modálem.
- [ ] **SL10 Slovník v hlavní navigaci** — zatím dostupný jen z `/vice`.
      Po dosažení ~50 hesel zvážit zařazení do hlavního navu (vedle Mapa
      horologie / Hodináři).
- [ ] **SL11 CMS widget pro Sveltia** — frontmatter editor pro slovnik
      collection (překlady, varianty, definice, příbuzné slugy). Až bude
      Petrova editace přes web UI relevantní (viz odložené Decap CMS výše).
- [ ] **SL12 /slovnik/ filter/search box** — při 50+ heslech přidat live
      filter (de/en/fr term, cs heslo, varianta) jako u `/tagy/`.
- [ ] **SL13 Reference IDs s anchorlinkováním** — `[Zotero `KEY`]` v citacích
      v body propojit na references.json (CSL render přes citeproc-js stejně
      jako u kroku detailu).

### Open issues z širší inventury (čekají na external input — neřešit autonomně)

- [ ] **INV1** — `inv-251` duplikát s jiným záznamem (čeká: rozhodnout který smazat)
- [ ] **INV2** — `inv-65/67/68` discrepancy: Petřín × Lissner × Skála × Kavalír ×
      Sluneční × Model orloje (čeká: ujasnění od Petra/Skály co kam patří)

### 🔧 Tooling

- [ ] **TL1 Zotero MCP `find_similar` bug** — vrací nesouvisející matche
      (např. Limax slug pro hodinářský článek). Workaround: používat
      `semantic_search` s textem místo `find_similar` s ID. Nahlásit
      upstream issue.
