# TODO

Otevřené úkoly a odložená rozhodnutí pro CSH Web (hodinarium.eu, horologie.cz).

## Vysoká priorita — čeká na Petrovu odpověď z auditu

Plný audit: [`audit-pro-petra.txt`](audit-pro-petra.txt). Petr odpoví, pak doplníme.

- [ ] **A1 Licence obsahu** — schválit CC BY 4.0 (zatím nasazeno default)
- [ ] **A2 Hospodaření 2020–2025** — chce Petr na webu? Pokud ano, dodá PDF
- [ ] **A3 Maskovaná emailová adresa** — souhlasí Petr s nahrazením `info (kyselá ryba)` za `mailto:`?
- [ ] **B1 Časová osa** — ~~Petr odsouhlasil zrušit, smazáno~~ ✅ hotovo
- [ ] **B2 ASTRO2 ESP01S vs ESP10S** — překlep v textu? Petr ujasní
- [ ] **B3 Vybrané exponáty per sekce** — můj výběr 4×4, Petr potvrdí/změní
- [ ] **B4 Otazníky v titulcích** — opravdu musí být 2?
- [ ] **B5 Datace článků** — opravit ručně 14 podezřelých roků < 1500
- [ ] **B6 Aktuální info Hodinária Děčín** — sezóna 2026, otevírací doba, vstupné
- [ ] **B7 Kategorizace 124 nezařazených** — sporných ~30 článků k ručnímu zařazení
- [ ] **B8 NTPH a NTPH_st** — sloučit / vyhodit duplicity?
- [ ] **C1 Titulní obrázek** — Petr vybere foto pro hero
- [ ] **C2 Logo** — soutěž v plénu, nebo nechat textové
- [ ] **C3 Sponzoři** — patří do hodinaria nebo spolku?

## Střední priorita — naplnit obsah

- [ ] **Akce — fotografie** z Google Photos drop-zone do `apps/horologie-cz/public/img/akce/<slug>/`,
      pak doplnit `fotky: []` v `src/data/akce.ts`. Petr/David postupně.
- [ ] **Skript pro auto-import fotek z ZIP** — rozzipovat → přejmenovat → doplnit data file.
      Až bude první ZIP, naprogramuju.
- [ ] **Hospodaření 2020–2025** v `/dokumenty` — doplnit `href` v tabulce, jakmile dorazí PDF
- [ ] **Transparentní účet** v `/sponzoring` a `/dokumenty` — doplnit číslo účtu a banku
- [ ] **Příspěvky na členských schůzích** — Petr dodá PDF / přepisy / audio
- [ ] **Stanovy** — ~~plný text z PDF~~ ✅ hotovo

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

### 📊 Analytics

- [ ] **Cloudflare Web Analytics** (free, GDPR-friendly, žádné cookies, žádný banner)
- [ ] Server-side metriky — kolik návštěv, odkud, které články nejvíc čtené

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

# Tech & funkcionalita — revize 2026-05-02

Revize napříč oběma weby (hodinarium-eu + horologie-cz) z hlediska technologie,
funkcionality, kvality a integrace. Doplňuje obsahový backlog výše.

## Stav stacku k 2026-05-02

| Vrstva | Hodinarium | Horologie |
|---|---|---|
| Astro 5 + MDX | ✓ | ✓ |
| Tailwind 4 (beta) | ✓ | ✓ |
| Sitemap | ✓ | ✓ |
| OG images (astro-og-canvas) | ✓ | ✓ |
| Search (Fuse.js) | jen modal | — |
| PWA / manifest | — | ✓ |
| Playwright (smoke + regression) | 1 + 4 | 1 + 0 |
| GitHub Actions CI | ✓ (deploy test) | ✓ |
| Cloudflare Pages | ✓ | ✓ |
| Image variants (sharp) | ✓ | ✓ |
| _redirects | 766 řádků | — |

## 🔴 Vysoká priorita (UX gap / SEO blokátor)

- [ ] **T1 Sémantické / fulltext vyhledávání** — Fuse index dnes obsahuje jen
      catalog.json (~360 sbírkových karet). Chybí: 38 medailonů hodinařů,
      65 článků v zajimavosti/konstrukce/projekty/muzea, 23 záznamů kroniky.
      Quick win = rozšířit Fuse na všechny 3 collection (~30 min).
      Větší krok = Pagefind / Transformers.js (návrh existuje výše).
- [ ] **T2 Schema.org JSON-LD** — žádná strukturovaná data, Google neindexuje
      karty/medailony/články jako entity. Kandidáti: `Person` na medailonech,
      `Museum` / `CollectionPage` na sbírce, `Article`, `Place` na lokacích,
      `Event` na akcích. `<script type="application/ld+json">` v base layoutu (~3 h).
- [ ] **T3 RSS feed** — žádný RSS pro články / kroniku. Členové nemají jak
      sledovat aktualizace bez návštěvy webu. `@astrojs/rss` na `/rss.xml`
      pro `kronika` collection + `clanky` (~1 h).
- [ ] **T4 Lighthouse CI / Web Vitals** — žádné performance budgety. Není
      jasné, jaké je skóre Core Web Vitals. `lhci/cli` v GitHub Actions
      s baseline + threshold (~2 h). Alternativa = Cloudflare Web Analytics
      pro RUM monitoring (5 min nasazení, viz I1).

## 🟡 Střední priorita (UX / discovery)

- [ ] **T5 Mapa exponátů (interaktivní)** — `mapa.astro` je dnes textový
      tree-list. Sbírka má 287 karet po Sálech a Vitrínách. SVG floor-plan
      Hodinária Děčín (Sál věžních + Sál elektro), klikatelné lokace → karty (~6 h).
- [ ] **T6 Filter & sort UI pro `/sbirka/katalog`** — máme filter chips
      per lokace, ale chybí filter podle krok/pohon/regulátor, podle období
      (1700–2025 timeline slider), sort podle inv. č. / data přírůstku /
      abecedy. Rozšíření `katalog.astro` (~3 h).
- [ ] **T7 Network graph hodinařů** — mezi 81 hodináři jsou bohaté vazby
      (učitel-žák, otec-syn, dílny, převzaté firmy). Vizualizovat v
      `/hodinari/index.astro` jako force-directed graph (Vis.js / D3, ~6 h).
- [ ] **T8 Časová osa hodinářství** — TBD, dříve B1 v TODO smazáno.
      Užitečné kontextové vodítko pro 14.–21. století
      (Henlein 1511 → Huygens 1657 → Graham 1720 → Harrison 1761 → Hipp 1850
      → ATO → quartz → atom → GPS).
- [ ] **T9 Print stylesheet** — karty sbírky a medailony hodinařů jako
      tisknutelný fact-sheet pro publikace muzea. `@media print` (~2 h).
- [ ] **T10 Dark / light mode** — hodinarium-eu používá brass dark téma
      (default), není přepínač. CSS custom properties + toggle (~3 h).

## 🟢 Nízká priorita (nice-to-have)

- [ ] **T11 3D modely klíčových exponátů** — orloj-modely (inv. 47 Skála,
      inv. 53 Praha, inv. 65 Kavalír, inv. 68 Sklep). Vyžaduje
      fotogrammetrii nebo manuální modeling.
- [ ] **T12 Comments / Disqus** — žádné komentáře ke článkům. Spolek je
      malý → přínos nízký, ale e-mail kontakt by stačil.
- [ ] **T13 AI features** — návrhy už existují výše (TL;DR generator,
      sémantické vyhledávání, RAG chatbot, AI překlad CS → EN).
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
- [ ] **D6 Slug standardizace na kebab-case** — 114 souborů v
      `content/hodinarium-eu/` má non-kebab slugy: `Arduino`, `astro2_NTP`,
      `decin_jednotny_cas`, `bychory_prokes1`, `Lantime_M100`, atd.
      Mix snake_case + camelCase + underscore vyčnívá vedle kebab-case
      `inv-99-podruzne-hodiny-male-4x` v jedné URL prostoru. Plus
      v `content/kronika/` (sezona2012, sobeslav2c) podobně.
      Zásah: 114 file renames + 114 redirectů v _redirects + grep všech
      inline odkazů `/clanky/<slug>` a `/<kategorie>/<slug>` v body MDX +
      SEO reindex (Google bude muset projet znovu). Je to čistá kosmetická
      operace ale citlivá — odložené po dokončení obsahu (cesta B+).
- [ ] **D5 Konsolidace _redirects** — 766 řádků v
      `apps/hodinarium-eu/public/_redirects`. CF má limit 2 000 řádků na
      free tier; zatím ok, ale narůstá (M5.1 + M5.2 + slug rename přidaly
      cca 30). Zvážit regroup pomocí glob patterns.
- [ ] **D6 Verzování dat (CHANGELOG)** — `soupis-exponatu.json`, `tags.json`,
      `hodinari.ts` se mění organicky. `data/CHANGELOG.md` s ručními
      poznámkami při velkých změnách. Inv. č. byla naposledy renumberovaná
      2026-05-01 — to by se hodilo log někam zachytit (~5 min).
- [ ] **D7 Doplnění chybějících OG images** — ~493 článků/karet, OG images
      jen pro některé. Build-time check, který vypíše chybějící (~30 min).
- [ ] **D8 Backup strategie pro `zdroje/`** — kritická data (Soupis 3.xls,
      Popisy 2.docx, panely OCR JPG) jsou jen na 1 disku. Git LFS nebo
      Cloudflare R2 sync (~2 h). Repo na GitHub je primary, ale `zdroje/`
      jsou v `.gitignore`.

## 🔌 Integrace

- [ ] **I1 Cloudflare Web Analytics** — bezplatný, GDPR-friendly, žádné
      cookie. ~5 min nasazení (skript v base layout).
- [ ] **I2 Sentry / error tracking** — pro klientské JS errory
      (Photo.astro lazy loading, SearchModal). Free tier 5k events/měsíc.
- [ ] **I3 Plausible / Posthog** — pro behavior návštěvníků. Plausible
      self-hosted v Cloudflare Workers ~zdarma. Posthog free tier 1M events.
- [ ] **I4 Newsletter (Buttondown / EmailOctopus)** — pro spolek
      horologie-cz, sezónní newsletter o akcích. Buttondown free do 100
      odběratelů.

## 📐 Standardy

- [ ] **S1 a11y audit** — žádný axe-core test. Cíl: WCAG 2.1 AA.
      `@axe-core/playwright` v existujících e2e (~2 h).
- [ ] **S2 Hreflang / i18n** — `en.astro` placeholder, bez
      `<link rel="alternate" hreflang>`. Rozhodnout: buď reálná EN
      lokalizace (velká práce), nebo `en.astro` smazat (~10 min).
- [ ] **S3 `docs/CONTRIBUTING.md`** — pokud někdo z spolku přijde a chce
      přispět, není runbook „jak edituji článek". Skill `clanky-konvence`
      existuje, ale jen pro Claudovu session (~1 h).

---

## Doporučená 30-day roadmap

**Týden 1 — quick wins (½ dne celkem):**
- T3 RSS feed (1 h)
- T2 Schema.org JSON-LD (3 h)
- I1 Cloudflare Web Analytics (5 min)
- D6 `data/CHANGELOG.md` (10 min)
- S2 hreflang nebo smazat en.astro (10 min)

**Týden 2 — UX upgrade (½–1 den):**
- T1 rozšíření Fuse vyhledávání o medailony + články + kroniku (1 h)
- T6 filter & sort katalog (3 h)
- T9 print stylesheet (2 h)

**Týden 3 — robustnost (½ dne):**
- T4 Lighthouse CI (2 h)
- D2 rerun crawl + fix BUGS.md (2 h)
- S1 a11y axe-core (2 h)

**Týden 4 — long-tail:**
- T5 interaktivní mapa Hodinária (6 h)
- D8 backup strategie (2 h)
- T7 hodinaři network graph (6 h, optional)
