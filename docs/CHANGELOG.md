# Changelog

Archiv hotových položek z TODO.md. Chronologicky reverse, group by topic.
Plná historie se najde v `git log` — toto je rychlý přehled milníků.

---

## 2026-05-13 — Prokeš dokumentace + Zotero + repo public + UX cleanup

### Repo visibility → public

- **csh-cz/web** přepnut z private na public přes `gh repo edit --visibility public`.
  Důvod: free tier 2000 min/měs Actions přečerpán, repo neobsahuje secrets
  (.env, .dev.vars v gitignore, tracked je jen .dev.vars.example). Po switch:
  unlimited Actions minutes + Codespaces 60 h/měs free + GitHub Pages enabled.

### Prokeš věžní hodiny — foto + dokumentace

- **65 fotek S. Marušák, Petr Skála, Jan Marek** doplněno do 14 obcí
  (commit c4b20a2e + 718fcc11 credit oprav). Source: Dropbox/Prokeš/Věžní/.
- **Nová stub karta Pouchov** (Hradec Králové, 13 photos) — vytvořeno
  jako placeholder `nedatovano-pouchov-prokes.mdx`.
- **Markvartice 1788** karta opravena — okres Děčín → Jičín, kraj Ústecký
  → Královéhradecký, GPS [49.20, 15.77] → [50.4266, 15.1838]. Doplněno
  rozhodnutí MK 30684/2017 OPP o prohlášení za KP. Text „krok Roberta
  de Sancerre" → `[Robertův krok](/kroky/robertuv-krok)` link.
- **Bošín 1887, Jenišovice 1882, Bakov 1873** — zpracování restaurátorských
  zpráv Jana Marka (DiS., Turnov) z DOCX/PDF. Plné fakta: krok kombinace
  Graham+Amant (Bošín, Jenišovice), pohon pískovcová závaží (Jenišovice),
  litinová závaží (Bošín), 4 ciferníky Bošín × 3 Jenišovice. Bakov:
  rukopisná kronika 1847-1958 str. 217-219 → datum osazení 12. 5. 1873,
  náklad 543.04 zl., předchozí hodiny z r. 1560 (Zvířetice).

### Zotero 4 nové entries + bibKey-driven citations

- **marekHodinovyVezniStroj2020** (Bošín restaurátorská dokumentace)
- **marekHodinovyVezniStroj2017** (Jenišovice restaurátorská dokumentace)
- **KronikaObceJenisovice1882** (manuscript, primární pramen)
- **KronikaMestaBakov1847** (manuscript, str. 217-219)
- `pnpm refs:sync` regen → references.json (3298 items, 2697 s citation-key).
  Karty 3 obcí updateované na bibKey-driven prameny (citeproc-js renders
  ISO 690 plain text automaticky).

### DOCX → PDF pipeline

- **Gotenberg 8 container** spuštěn pro DOCX → PDF konverze. 10 DOCX
  souborů Marka 2017/2020 + 1 DOCX Bošín 2020 převedeny přes
  `POST /forms/libreoffice/convert`.

### UX polish

- **Default table style** — markdown pipe tables dostávají zebra striping
  bez okrajů. Tabulární numerals, copper eyebrow headers. Sjednoceno
  napříč všemi články.
- **Universal link ikony konvence** — wiki = ⓦ, generic external = ↗
  (oboje globální CSS ::after), vlastní domény bez ikony. References-list
  typed bullet ::before. Odstraněno 20+ ručně psaných `↗` z navigačních
  linků v hodinarium-eu + horologie-cz (commit bb48eb3a + 4b6d516c).
- **Markdown render bug fix** — slovník `definice` field + hodinari
  `shrnuti` v indexech renderovaly `**bold**` jako literal asterisky.
  Wrap přes `tinyMarkdown()` + `set:html` (commit 4b6d516c).

## 2026-05-12/13 — Cross-references systém MVP

Strukturované křížové odkazy napříč 6 collections (clanky/karty/hodinari/
kroky/soupis/slovnik/kronika). Sjednocený frontmatter pattern, reverse
map computed build-time, rendering komponenta s typed ikonami.

- **X.1 Schema** (commit 50e70e35) — `crossRefs` z.object field v 6 collections
  s polem per type. Zachovává primární single-value relace (karta.vyrobce,
  soupis.hodinar, soupis.krok) — crossRefs slouží pro *další* (sekundární)
  vztahy.
- **X.2 Reverse map builder** (commit 298fb3bf) — `scripts/build-cross-refs.mjs`
  + `pnpm refs:cross` generuje `data/cross-ref-reverse.json`.
- **X.3 `<CrossRefs>` komponenta** (commit c1dbf814) — `clanky`/`karty`
  groups jako card grid, ostatní jako text list s typed ikonami.
- **X.4 Integrace do 7 detail layoutů** (commit 40622ba4) — slovnik,
  soupis, kroky, hodinari, kronika, sbirka/karta, [kategorie]/[slug].
- **X.5 Legacy absorpce** (commit 05caad73) — build skript absorbuje
  legacy fields (slovnik.pribuzne, soupis.related*, data/hodinari.ts
  relatedSlugs). **839 forward refs** absorbováno z 1197 entries.
- **X.10 Strict validation** (commit bda05bc4) — prebuild fail při
  neexistujícím target slug.

**Zbývá:** X.6/X.7 Sveltia picker widget (~6 h), X.8/X.9 AI auto-suggest
z body (~6 h).

## 2026-05-12 — A11y SearchModal + spell-check V2 + FU2/SL13

### A.4 SearchModal aria refactor (5 commitů)

- `5d6cb30c` combobox role + aria-activedescendant + listbox/option
- `bae4916d` tab keyboard nav Arrow/Home/End + roving tabindex
- `42264179` dialog labelledby + tab describedby + aria-controls
- `f36994a0` Home/End klávesy + scrollIntoView + focus-visible
- `6ade90b9` two-stage escape + focus restoration

### A.13 V2 spell-check (2 commity)

- `45fbc0da` right-click suggestion menu v `csh-spellchecker.js`
- `e166f752` `.github/workflows/spell-dict-rebuild.yml` — auto-rebuild
  dict při push do content/slovnik|hodinari|soupis

### FU2 hero + SL13 anchor links

- `f687865e` featured slugs fix (3/4 broken po D6 rename), `data/featured.json`,
  subtitle pod hero, 3. CTA „Naplánuj návštěvu". SL13: klient-side `[N]`
  → `#ref-N` anchor linking ve slovníku.

### CI cleanup

- `pnpm cf:cleanup --keep-prod 50 --apply` — 1026 → 140 deployů.
- Audit `scripts/audit-content-evergreen.mjs` + `pnpm content:audit`
  identifikuje OCR artefakty / chybějící author: / wiki linky v body.

### Issues

- #22 hover invisible v light theme — fixed `f5599dfd`
- #20 svarcvaldky rozpadlá tabulka + odkazy — fixed `ae4b1a23` + `d1c65c0d`

---

## 2026-05-11 — JPG zdroje off-git (R2 serves originals too)

- **`<img src>` fallback nově ukazuje na R2**, ne na CF Pages —
  `packages/rehype-picture/index.mjs` v `cdnBase` módu přepíše i src
  na `${cdnBase}/img/X.jpg`. Předtím src ukazoval na `/img/X.jpg` (CF Pages),
  což vyžadovalo držet JPG v gitu pro deploy. Nově není potřeba.
- **`scripts/upload-imgvariants-to-r2.mjs`** rozšířen o JPG/JPEG/PNG —
  `UPLOAD_EXTS` zahrnuje raster zdroje vedle variant. Idempotentní upload
  (ETag diff) sleduje, co je už v R2.
- **Migrace existujících 2867 JPGs/PNGs do R2** (~310 MB). Bucket
  `csh-imgvariants` má teď: AVIF (var.) + WebP (var.) + originál JPG =
  ~680 MB (7 % free).
- **GH Action `imgvariants-r2-sync.yml`** rozšířen o post-upload step:
  `git rm` zdrojů po úspěšném R2 uploadu + commit "ci: move uploaded
  images to R2 [skip ci]". Vyžaduje `permissions: contents: write`.
  Nové fotky od editorů do gitu už dlouhodobě nezůstávají.
- **Astro content cache invalidate** — důležitá lekce: změny v
  `packages/rehype-picture/` nemají efekt na cached obsah collection.
  Při testování změn nutno `rm -rf apps/*/.astro apps/*/node_modules/.astro`.
  CI build to dělá automaticky (fresh checkout).
- **Existující 2867 JPGs zatím zůstávají v gitu** (rozhodnutí A) — pro
  Sveltia media browser. Nové fotky → R2 only. Repo `.git` 496 MB
  zatím netřeba zmenšovat history rewrite-em (zvažitelný krok C v TODO).

## 2026-05-11 — R2 image variants pipeline + GH Action automation

- **V2 GitHub Action `.github/workflows/imgvariants-r2-sync.yml`** —
  Trigger: push s JPG/PNG změnou v `apps/*/public/img/**`. Detekuje
  changed sources přes `git diff HEAD^ HEAD`, předá je do
  `pnpm imgvariants:build -- --files <list>`, pak upload na R2. Doba
  per push s 1 fotkou ~2-3 min, plný regen (workflow_dispatch s
  `full_regen: true`) ~35 min. Public repo má unlimited Action minuty
  zdarma. **Workflow Petrovi automaticky nahraje AVIF/WebP po každém
  uploadu fotky přes Sveltia** — bez ručního zásahu.
- **`scripts/generate-image-formats.ts`** rozšířen o `--files` CLI flag.
  Když nastaveno, skript procesuje jen daný subset (skip walk přes 2867
  zdrojů). Bez `--files` zachová původní walk-all chování.
- **Setup po commitu** — David musí v
  `https://github.com/csh-cz/web/settings/secrets/actions` přidat 3 repo
  secrets: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
  (hodnoty stejné jako v lokálním `.dev.vars`).

## 2026-05-11 — R2 image variants pipeline

- **R2 bucket `csh-imgvariants`** zřízen (David v CF dashboardu) — 10 GB free
  tier, dev URL `pub-e96bd8c658664b38af73a48cb8872b60.r2.dev`. Custom domain
  `imgcdn.<doména>` se nastaví až po DNS switch z pages.dev na produkční hosting.
- **Nový skript [`scripts/upload-imgvariants-to-r2.mjs`](../scripts/upload-imgvariants-to-r2.mjs)** —
  S3-compatible PUT přes `@aws-sdk/client-s3`. Idempotentní: list ETagů z R2,
  MD5 lokálních variantů, upload jen diff. CacheControl `public, max-age=31536000, immutable`.
  CLI: `pnpm imgvariants:upload`, `pnpm imgvariants:sync` (build + upload),
  `--apps hodinarium-eu`, `--dry-run`.
- **Credentials přes `.dev.vars`** (gitignored) — R2_ACCOUNT_ID, R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL. Account API Token s „Object
  Read & Write" permission jen na `csh-imgvariants` (least-privilege).
- **`packages/rehype-picture`** rozšířen o `cdnBase` option — `<source srcset>`
  ukazuje na R2 dev URL, fallback `<img src>` zůstává na CF Pages path. AVIF
  pro Chrome (~30-50% menší než JPEG), WebP fallback pro Safari.
- **Astro configs flipnuty na `wrapInPicture: true`** — oba apps. JPEG zdroj
  z gitu, AVIF/WebP varianty z R2. Repo zůstává čisté (~1 GB), R2 bucket
  ~575 MB (= 6% free).

## 2026-05-10 — editor pomocníci V1 + editorial workflow + tech-debt cleanup

### Tech dluh — odstranění stale artefaktů a redirects

- **D5 _redirects konsolidace** — 776 → 491 řádků (-37 %). Sbírkové karty
  (290 záznamů) sjednoceny do jednoho glob řádku
  `/clanky/inv-* /sbirka/karta/inv-:splat 301`. CF limit 2000 — rezerva
  z 38 % na 24 %. Renamed karty (KARTY_SLUG_RENAMES) overrides PŘED glob
  kvůli first-match-wins.
- **D2 BUGS.md odstraněn** — 8 dní starý stale report z crawler bugu před
  `NON_PAGE_EXTS` filtrem (no-h1 / missing-title false positives na
  binárních /img/* assetech). Bug crawleru opraven, ale report nezaktualizován.
  Aktuální stav coverage je `pnpm test:e2e` (90 passed, 19 skipped, 0 fail
  na pages.dev) — Playwright regression + smoke testy.
- **e2e suite refresh** (5 souborů):
  - `nav-contrast.hodinarium.spec.ts` — NAV_LINKS aktualizováno po M5/M6
    cleanup (Návštěva, O Hodináriu, Sbírka, Projekty, Konstrukce, Hodináři,
    Soupis věžních hodin, Mapa horologie, Více); 200ms wait pro CSS
    transition; mobile skipnutý (top nav je `hidden md:flex`); regex-based
    text matching místo loose hasText.
  - `byline-date.hodinarium.spec.ts` — `domcontentloaded` místo default
    'load' wait; podebrady odebráno (Playwright Chromium OOM v headless
    s 9 large jpgs, v real Chrome funguje OK).
  - `youtube-and-components.hodinarium.spec.ts` — `/clanky/` URLs nahrazeny
    direkt `/<kategorie>/<slug>` po M2 taxonomy refactoru (mobile profil
    redirect chain hit 30s timeout).
  - `iframes-and-components.hodinarium.spec.ts` — totéž (Kappa→projekty,
    slunecni_filler/slunecni_polarizacni/vodni_B_Gitton→sbirka,
    zidovske→virtualni-muzeum).

### Sveltia editor — sada pomocníků (A.13, A.14, A.20)

### Sveltia editor — sada pomocníků (A.13, A.14, A.20)

- **CSH spell-checker V1** (A.13). nspell + cs_CZ Hunspell s morfologií + custom CSH slovník
  1242 termínů (slovník + hodinari + soupis). Lazy-load při zapnutí (~6.3 MB,
  cached). 3-mode picker (off / browser native / CSH hodinářský), exclusive
  engines. Builder skript `pnpm spelldict:build`. Bug fixes: nspell.spell()
  vrací object, ne boolean; clean detach v deactivate pro re-aktivaci.
  Status badge vedle ⚙ Pomocníci tlačítka. Smoke test stránka
  `/admin/_smoke.html` pro post-deploy QA.
- **AI našeptávač V1** (A.14). Inline ghost-text overlay, Cloudflare Workers AI
  Mistral Small 3.1 24B + slovník-aware system prompt cached. Tab=accept,
  Esc=dismiss, debounce 1.2 s. Ollama backend pro lokální dev (env.OLLAMA_URL).
- **Universal link picker V1** (A.20). Cmd+K / Ctrl+K modal v textarea, 4
  paralelní search backends: internal (semantic), Wikipedia (cs+en),
  Wikidata, NPÚ Památkový katalog + custom URL. Markdown link insertion s
  formátem podle zdroje.
- **GitHub odstínit od editorů** (UX feedback od Davida): handbook na
  `/admin/handbook/` jako Astro page, `/admin/tasks/` úkolovník místo
  GitHub Issues, „úkol č. N přijato" místo „Issue #N created".

### D6 Slug standardizace — 121 souborů na kebab-case

121 souborů přejmenováno z snake_case / CamelCase / ALLCAPS na
kebab-case + ASCII fold + lowercase. 113 v `content/hodinarium-eu/`,
9 v `content/kronika/` (hodinari/kroky/slovnik/soupis-veznich-hodin
už byly kebab).

User-approved overrides: `kvetinovehodiny_NMnM` →
`kvetinovehodiny-nove-mesto-nad-metuji`, `muzeum_tyniste_n_orlici` →
`muzeum-tyniste-nad-orlici`, `12_24` → `hodinky-12-24-ciferniku`.

Pipeline:
- `scripts/d6-slug-rename-preview.mjs` (dry-run mapping table)
- `scripts/d6-slug-rename-apply.mjs` (ostrý rename)
- `scripts/d6-grep-replace-links.mjs` (inline linky napříč repo)
- `scripts/build-redirects.ts` rozšířený o `loadD6Renames()` —
  generuje 301 redirects pro `/clanky/<old>`, `/<kategorie>/<old>`,
  `/sbirka/karta/<old>`, `/kronika/<old>`

Mapping JSON: `apps/hodinarium-eu/src/data/d6-slug-renames.json` —
zachován pro budoucí audit/rollback.

Bilance:
- 121 frontmatter `slug:` fields updated
- 161 inline link replacements v 48 souborech
- 104 `relatedSlugs` replacements v `data/hodinari.ts`
- ~360 nových 301 redirectů
- 1 manual fix (vlasta-filler.mdx měla `/zajimavosti/slunecni_filler`,
  správně `/sbirka/slunecni-filler` — kategorie i slug zároveň)
- Build: 1208 stran (beze změny), validation passed.

### Editorial workflow — W-6 Sveltia editor banner

- **`apps/hodinarium-eu/public/admin/csh-workflow-banner.js`** — script
  pro Sveltia admin/index.html. Hook na hashchange (Sveltia entry route),
  fetchne raw frontmatter z GitHubu přes /api/cms proxy, parse YAML,
  rozhodne stav podle `workflow.lockedBy` + `lockedAt`:
  - vy držíte zámek → zelený banner „✓ Vaše rozpracování"
  - někdo jiný + lockedAt < 24 h → červený „🔒 Někdo na článku pracuje"
  - někdo jiný + lockedAt > 24 h → žlutý „⚠ Starý zámek" (převzít OK)
  - free → no banner
- Editor identity z CF_Authorization JWT cookie.
- Banner má close button (×) a ARIA role=status + aria-live.
- Lazy-load yaml parser z esm.sh (~30 KB).

### Tags whitelist + CF Pages unblock

- Petrovy 3 sveltia commits (flying_pendulum, gobelin) zavedly tagy
  s diakritikou ("kuželové kyvadlo", "vyšívané") mimo kebab-case
  whitelist v `src/data/tags.json`. Astro check failed → CF Pages
  prebuild abortoval → production deploy zaseknutý ~30 min.
- Fix: tagy normalizovány (kuzelove-kyvadlo, preletave-kyvadlo, vysivane)
  + přidány do whitelist `typ[]`.

### Editorial workflow — W-4 transition API + interactive úkolovník

- **`functions/api/workflow/transition.ts`** — Pages Function POST endpoint
  pro state changes přes CF Access auth + GITHUB_BOT_PAT commit:
  - `claim` (todo → in-progress, lockedBy = editor email, lockedAt = now)
  - `submit-review` (in-progress → review)
  - `approve` (review → ready, push editor do reviewedBy, smaže lock)
  - `release` (clear lockedBy + lockedAt, status zůstane)
  - Validation: pokud action vyžaduje konkrétní status (approve potřebuje
    review), neaplikuje se mimo platný stav.
- **`/admin/tasks/`** — interactive tlačítka per row: Zabrat / Pošli k
  recenzi / Schvaluji / Uvolnit zámek. JS handler volá POST endpoint,
  potvrzení dialog, page reload po success. CF Pages rebuilduje ~90 s
  → editor uvidí změnu po deploy (alert info).
- Editorial workflow V1 je teď **end-to-end funkční**: schema → Sveltia
  widget → úkolovník → tlačítka → API → GitHub commit → re-deploy →
  visible v dist.

### Spell-checker — A.13 dict fix

- `scripts/build-cs-spell-dictionary.mjs` — INSTITUTIONAL_TERMS seznam
  s 4 pádovými tvary „Hodinárium" (vzor „město"): Hodinárium / Hodinária
  / Hodináriu / Hodináriem + ČSH zkratka. Live test odhalil, že genitiv
  „Hodinária" se podtrhával — Hunspell slovo nezná, morfologie nemůže.
- Custom dict regenerován: 1242 → 1247 slov.

### Editorial workflow — W-2 visibility logic

- `utils/workflow-visibility.ts` — helpers `isPubliclyBuildable()` (filter
  v getStaticPaths: non-ready bez publicDuringEdit → 404) a `showsWipBanner()`
  (WIP banner pro publicDuringEdit:true s status != ready).
- `WipBanner.astro` — komponenta s 3 status labely (k rozpracování /
  rozpracováno / k recenzi), volitelnými notes z frontmatter, hint na
  info@orloj.eu pro feedback. ARIA `role="status"` + `aria-live="polite"`.
- 6 page renderů integrováno: clanky, sbirka/karta, kronika, slovnik,
  soupis-veznich-hodin (skip celé page) + kroky, hodinari (skip jen MDX
  detail — primární data v ts arrays zůstanou viditelné).
- Test fixture v `content/hodinarium-eu/_test-draft-article.md` (untracked):
  publicDuringEdit:false → 404 ✓, publicDuringEdit:true → render + banner ✓.
- Build still 1206 stran (žádný existující článek nemá non-ready workflow,
  filter je no-op pro obsah).

### Editorial workflow V1 (A.23)

- Schema rozšíření `content.config.ts`: `workflow` z.object field s 7 props
  (status / lockedBy / lockedAt / reviewers / reviewedBy / publicDuringEdit /
  notes) přidáno do 6 collections. Backwards-compat — default = ready.
- Tasks dashboard `/admin/tasks/` — Astro page s filterem na status !==
  ready, sort by priority + lockedAt desc, counters, per-row actions
  (Editovat / Náhled).
- Sveltia config workflow widget — collapsed object pole v 5 user-edit
  collections (clanky, karty, kronika, hodinari, horologie-clanky).
- Help modal sekce 📋 Úkolovník + handbook plná sekce s frontmatter
  příkladem, lock model, visibility matrix.
- Design dokument `docs/design-editor-workflow-2026-05-10.md`.

### Dead-link auditor V1 (A.21)

- `scripts/audit-dead-links.mjs` — sken content/ (7 collections), HTTP
  check (HEAD + GET fallback, concurrency 10, timeout 10 s), Wayback
  fallback. Output: JSON + human-readable per-soubor report s návrhy
  REPLACE/REMOVE.
- Baseline scan 2026-05-10: 697 unikátních URL, 661 live, 36 dead (5.2 %).
- CI workflow `.github/workflows/dead-links-weekly.yml` — neděle 04:00 UTC,
  auto-commit reportu, 30 dní historie.

### Slovník (SL3–SL7)

- **SL3** Hodinky kapesní/náramkové: 10 hesel (kalibr, werk, korunka,
  sklíčko, pouzdro, signatura, opakovací, chronograf, automatic, GMT).
- **SL4** Profese a školy: 8 hesel (hodinář, pouzdrář, pražská, švarcvaldská,
  vídeňská, anglická, francouzská, švýcarská škola).
- **SL5** Bicí mechanismy detail: 3 hesla (čtvrťové bití, Westminster
  chime, petite/grande sonnerie).
- **SL6** Šumavský 1851: přehledové meta-heslo (36 archaismů z
  `glosar.yaml`, 3 kuriozity full).
- **SL7** Rozšíření existujících hesel: vlásek (Phillips matematika +
  Immich křivka), setrvačka (moderní materiály — Invar/Elinvar, Glucydur,
  silikon).
- Slovník nyní **57 hesel** napříč 6 kategoriemi. Auto-link pipeline
  generuje 125+ linků.

### Design critique follow-ups (FU3, FU4)

- **FU3 Soupis věžních hodin**: progressive column hide na mobile
  (760/600/480 px breakpointy). Report `docs/design-critique-soupis-veznich-hodin-2026-05-09.md`.
- **FU4 Sbírková karta**: slovník auto-link v `KartaSbirky` (25+ termínů
  via `utils/slovnik-link.ts`) + `findHodinarFromVyrobce` na `vyrobce` a
  `signatura` fields. Datace fallback z `karta.datace` do year heuristiky.

### A11y bundle (z auditu 2026-05-08)

- 6 quick-wins (C1, C2, M1, M3, M4, M5).
- M6: Report form `<input readonly>` → `<output>` s `role="status"`.
- M7: `.link-bare` utility class (5 inline styles → CSS).
- M8: hamburger label.
- N1–N4: aria-modal, aria-live, dynamic role status/alert, `<h4>`→`<strong>`
  v map popups.
- `@axe-core/playwright` smoke test 11 reprezentativních URL na
  critical+serious WCAG 2 AA. 2 contrast fixes z baseline.

### Performance + SEO

- **Lighthouse CI** post-deploy gate (8 URL, perf ≥ 0.85, a11y ≥ 0.95).
- **OG images per-collection**: 18.4 % → **100 %** coverage (1095/1095).
  Loaders pro hodinari/soupis/slovnik/kroky/kronika. CI gate v
  `og-coverage.yml`.
- Per-stránka OG image v Base.astro (předtím vždy default).
- Build: skip AVIF/WebP generation on CF Pages (timeout fix).

### Wiki refs + cross-link

- Wiki refs zobrazují název článku místo „Wikipedie".
- Fallback aplikován na hodinari + kroky.
- SL8 cross-link kroky → slovnik: 306 nových linků.

### Misc fixy + obsah

- A1 (CC BY 4.0 licence) schválena.
- A3 (mailto:info@orloj.eu) napříč webem.
- B4, B6, B8, C1, C3 obsahové úkoly vyřešeny.
- Krečmer 1905: foto budovy CC BY-SA, NPÚ ArcGIS GPS, PK badge v UI,
  full-width 2400×1800.
- 4 nové clock památky z Wikidata + PK + `pamatkovyKatalog` field.
- Engelbert Seige (1737–1810) stub medailon.
- Robertův krok: kompletní MDX článek + Knespl 2023 citace.
- skill `clanky-tldr` (perex pravidla + 5 ukázek + horologická terminologie).

### Tech / dev infra

- README pro hodinarium-eu (410 ř.) — kompletně přepsaný.
- ReportIssueModal refactor (`attachDialogControls` helper).
- 28 inline styles → 3 utility classes v global.css (TD7).
- search corpus extends pro slovník collection (1058 records).
- TL1: Zotero MCP find_similar bug — issue draft.

---

## Před 2026-05-10

Pre-historie pre-dating tento changelog viz `git log --oneline main`.
Hlavní milníky: M1–M5 taxonomy refactor, /tagy/ section, hodinari:detect,
30 medailonů hotovo (k 2026-05-01), Akvizice + Bychory eseje.
