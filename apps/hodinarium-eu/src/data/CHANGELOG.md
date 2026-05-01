# Hodinárium · CHANGELOG datasetů

Strukturované záznamy o tom, co se kdy v datech (`hodinari.ts`,
`soupis-exponatu.json`, `tags.json`, evidenční karty, články)
změnilo. Páteřní dokument pro budoucí sessions a re-exporty.

Formát: ISO datum, dotčený dataset, stručný popis, commit hash.

---

## 2026-05-02 · TODO revize tech & funkcionalita

- **TODO.md** — +154 řádků: 30 úkolů napříč prioritami (tech foundation,
  obsah, M5 follow-up) + 30-day roadmap; sekce „Tech & funkcionalita revize 2026-05-02".
  → `be1c3b0`

## 2026-05-01 · Medailony hodinářů — z 26 na 81 entries (100 % coverage)

- **`hodinari.ts`** — z 26 entries (M5 startovní stav) na **81 entries**.
  Přírůstky postupně:
  - +5 osob z auditu (Spáčil, Bechler, Bellmann + 2 stuby na detail) → `7552720`, `ab9730b`
  - **+13 výrobců** z auditu karet — pole `vyrobce:` nyní pokrývá 100 %
    z 287 karet sbírky → `980242b`
  - **+9 firem** z auditu textů článků (Brillie, Lenzkirch, Junghans, …) → `93ea297`
  - **+16 entries ze Sladkovského 1947** (cizí klasici i čeští) → `4bf1f1b`
- **Plné medailony (`content/hodinari/*.mdx`)**:
  - Edmund Kinšner — kompletní přepis z Hartmana 1987 + patent + portrét → `379d083`, `1694234`, `1494a11`, `e4d5500`
  - Kosek — doplnění z Sladkovského 1947 (Zotero fulltext cache) → `c0a2a4d`
  - 2 nové mdx ze Sladkovského → `4bf1f1b`
- **Aktuální stav:** 81 entries v ts, 40 plných mdx, 41 stubů (entry bez mdx).

## 2026-05-01 · Sbírka — konsolidace evergreen článků

- **Bychory** — 4 chronologické články → 1 evergreen (`bychory-konsolidace`) → `93cb838`
- **Akvizice 2015–2025** — 4 chronologické články → 1 evergreen (`akvizice-2015-2025`) → `fd23a05`

## 2026-05-01 · OCR panelových textů (Hodinárium 2017)

- **+1 longread + 3 panel articles + 7 karet** ze starých výstavních
  panelů Hodinária Děčín 2017 (OCR fulltext). → `7c8fa4a`

## 2026-04-30 · Renumber 289 karet · velký zlom

- **`soupis-exponatu.json`** — renumber 289 karet (Soupis 3 + Popisy 2),
  deterministic match XLS ↔ existující karty, 35 nových karet,
  10 přejmenování x-prefix → permanentní inv. čísla. → `1400199`
- **Rozdělení `sbirka` na podsekce** — `karta` (evidenční záznam,
  /sbirka/karta/<slug>) vs `clanek` (vázaný článek, /sbirka/<slug>);
  schema diskriminátor `podsekce:` v content.config. → `b398880`
- **255 evidenčních karet apply** ze Soupisu exponátů (.xls) → `32628e4`
- **Backfill `relatedKarty:`** ve 34 stávajících článcích → `0858c42`
- **5 named atributů karty** + auto-extract z XLS popisu → `96c1616`
- **Komplety** + room labels + popisy parser/apply → `029b87c`
- **Strukturovaná pole** ze stávajících článků → karty (script) → `c825263`
- **Generátor stubů** ze Soupisu (dry-run + apply) → `6adab0d`
- **Soupis exponátů .xls import** + /sbirka/katalog/ stránka → `dc91725`

## 2026-04-29 · M1–M6 taxonomie migrace · největší refactor

- **M1 — taxonomie kategorií**: 6 hlavních kategorií místo 3 starých
  (sbirka, konstrukce, projekty, virtualni-muzeum, muzea, zajimavosti).
  → `7fce9d8`, `e992bf8`, `534e471`
- **M2 — URL refactor**: `/clanky/<slug>` → `/<kategorie>/<slug>`. → `2eab194`
- **M3 — Hodináři collection**: `content/hodinari/` jako plnohodnotná
  collection s vlastním schema + 26 medailonů → `99e0be9`, `f9274f6`
- **M3.5 — muzea**: přesun z horologie-cz/spolky do hodinarium-eu/muzea
  + 8 nových karet věžních hodinářských muzeí → `73b2510`, `97af181`
- **M4 — Kronika collection**: vlastní schema (date, typ, related, …),
  23 článků přesunuto. → `35ee6b0`
- **M5.3 — `/tagy/<tag>`** filter stránka + index. → `4f588e0`
- **M5.4 — auto-detect zmínek hodinářů** v článcích → relatedSlugs. → `45d8e0c`
- **M6 — cleanup**: smazat orphan `/spolek/`, `/clanky/index.astro`. → `7e621aa`, `f2c8e87`
- **Tags whitelist** (`tags.json`) — řízeně rozšiřovatelný, Zod refine
  validuje proti whitelistu (typo failne build). → `7fce9d8`

## 2026-04-29 · Photo komponenta + karta exponátu

- **Photo credit overlay s auto-tone** — sharp build-time analýza
  jasu BR rohu, světlý/tmavý text bez halo. → `3ac97df`
- **Photo umí floatovat** + credit overlay bez halo → `6c298b4`
- **Karta sbírkového předmětu** — frontmatter `karta:` field,
  definition list pod hero. → `33ae1aa`
- **Galerie**: ≥2 konsekutivní img-large → auto grid + lightbox. → `9c9819b`
- **Iniciála (drop cap)** na začátku článku — CSS ::first-letter,
  serif brass-bright. → `617f4d3`
- **Horologická mapa Evropy** + 6 nových muzeum karet (KML import). → `d56a4b2`, `15e06a3`

## 2026-04-28 · Velký cleanup + obsahová pass

- **JSON-LD + hreflang alternates** — Organization/Museum schema na
  home obou webů, hreflang `cs`/`en`/`x-default`. → `bf3fbae`
- **ISO 690-light reference** — formátování v `references:` field
  s ISBN/ISSN/URL. → `79c92d4`
- **Lightbox** pro všechny photo galerie. → `8e171ec`
- **De-iframe**: nahrazení iframe vlastními komponentami
  (Zidovske, Klementinum, CasSlovem, Segmentovky, YouTube lite-embed). → `98342bf`, `a1a2e2c`
- **rehype-picture plugin** — lazy load, intrinsic w/h, optional AVIF/WebP. → `272b1a2`
- **Akce horologie-cz**: nová evidence akcí spolku — Protivín 2022,
  Rostock 2022, Olomoucký orloj 2019, Schwarzwald 2019, Vídeň-Aschau 2015,
  Karlštejn DHK. → `54b5689`, `e283169`, `61658f3`, `5b4f728`, `10e5ed6`, `d1c573e`

## 2026-04-27 · Initial commit

- **`973fcf1`** — hodinarium.eu + horologie.cz monorepo bootstrap.
  Scrape z legacy hodinarium.eu (HTML → markdown přes turndown),
  cca 200 článků, base Astro + Cloudflare Pages setup.

---

## Konvence pro budoucí záznamy

- **Pište zpětně** po větších commit batches (ne po každém commitu);
  hromadné renumbery, schema změny, dataset milestones.
- **Dataset deltas** — uvádět konkrétní čísla (z 26 na 81 entries),
  ne jen „přidáno více položek".
- **Commit hash** je primární odkaz; PR/issue číslo doplňujte jen pokud
  existuje (zatím nepoužíváme).
- **Schema změny** v `content.config.ts` zaznamenávat zvlášť — nový field,
  nový diskriminátor, nový enum value (může vyžadovat data migration).
- **Renumbery / mass renames** vždy zachytit (audit trail pro pozdější
  re-link nebo wayback srovnání).
