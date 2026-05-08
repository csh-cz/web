# Design follow-ups: hodinarium-eu

**Datum vytvoření:** 2026-05-08
**Kontext:** Vyplývá z accessibility auditu (`docs/a11y-audit-hodinarium-2026-05-08.md`). Po dokončení a11y fixů spouštět jednotlivé úlohy postupně, nebatch-em.
**Skill plugin:** `design:*` (Claude Design)
**Důležité:** Každá úloha = samostatný dílčí task. Uživatel chce mezi nimi rozhodovat; **NEspouštěj víc úloh najednou bez explicitního pokynu**.

---

## Pořadí úloh

| # | Skill | Priorita | Odhad | Závislost |
|---|---|---|---|---|
| 1 | `design:ux-copy` | High | ~20 min | Po a11y fixech |
| 2 | `design:design-critique` — hero/index | Medium | ~15 min | Žádná |
| 3 | `design:design-critique` — soupis věžních hodin | Medium | ~15 min | Žádná |
| 4 | `design:design-critique` — sbírková karta | Medium | ~20 min | Žádná |
| 5 | `design:design-system` (cross-site audit) | Low-medium | ~40 min | Po stabilizaci obou sesterských webů |
| 6 | `engineering:documentation` — top-level README | Low | ~30 min | Žádná |
| 7 | `engineering:tech-debt` — inventář | Low | ~45 min | Žádná |

---

## Úloha 1 — UX copy audit

**Skill:** `design:ux-copy`
**Cíl:** Najít microcopy v hodinarium-eu, která je generická, nesedí s časopiseckým tónem („Hodinárium" jako odborná webová expozice ČSH), nebo má UX dluh.

**Konkrétní místa k auditu:**

- Stub note hodináře: `apps/hodinarium-eu/src/pages/hodinari/[slug].astro:226-235` (text začínající „Životopisný profil je zatím stub.")
- Draft placeholder: `apps/hodinarium-eu/src/styles/global.css:1316-1336` + použití v `Article.astro` a karta layoutech
- Search hints: `apps/hodinarium-eu/src/components/SearchModal.astro:57-61` + `:381-383` (dynamic v render funkci)
- AI fallback banner: `SearchModal.astro:395-399` — *„AI kvóta vyčerpaná — fallback na fulltext."*
- Empty search state: `SearchModal.astro:387` — *„Žádný výsledek pro [query]"*
- Stav badges (in_situ / preneseno / ztracene / znicene): `apps/hodinarium-eu/src/pages/hodinari/[slug].astro:302` (CSS underscore replace) + zda v UI nedávat čitelnější labely (např. „v původním místě", „přeneseno do…", „ztraceno", „zničeno")
- 404 page: `apps/hodinarium-eu/src/pages/404.astro` (přečíst, posoudit)
- Form copy v ReportIssueModal: `apps/hodinarium-eu/src/components/ReportIssueModal.astro:62-72` (problem types) + hint na řádku 50-53
- Footer micro-copy: `Base.astro:474-481` (IČO, telefonní formátování, CC BY rámeček)
- Hero CTA: `apps/hodinarium-eu/src/pages/index.astro:38-41` — *„Procházet sbírku" / „Mapa horologie →"*
- „Stojí za prohlídku" / „Najdi si svoji cestu" — `index.astro:53,77` (jsou to klišé?)

**Trigger pro skill:**

```
/design:ux-copy Audit microcopy v apps/hodinarium-eu se zaměřením na časopisecký tone-of-voice (web Českého spolku horologického, audience: hodinářští nadšenci + návštěvníci muzea v Děčíně). Konkrétní místa jsou v docs/design-followups-hodinarium-2026-05-08.md, úloha 1. Výstupem buď seznam nálezů s file:line + návrhem rewriteu, prioritizováno podle viditelnosti. Pozor: skill `cestina` má precedenci nad ux-copy, pokud se týká české jazykové stylistiky — nezasahuj do termínů, které autor (David Knespl) zvolil cíleně, jen do generické šablonovité copy.
```

**Pozn. pro reviewera:** Stub note pro hodináře je teď delší a mírně apologetický — možná to chce kratší/sebevědomější tón. Stav labely jsou funkční slugy přepracované přes `replace(/_/g, ' ')` — to je quick hack, ne kvalitní UX.

---

## Úloha 2 — Design critique: Hero + index page

**Skill:** `design:design-critique`
**Cíl:** Posoudit, jestli hlavní stránka funguje jako první dotek pro tři distinct audience (návštěvník muzea v Děčíně / český horolog-amatér / mezinárodní enthusiast přes EN summary).

**Soubor:** `apps/hodinarium-eu/src/pages/index.astro` (1-80 + Card komponenta)
**Live URL:** https://hodinarium-eu.pages.dev (canonical zatím pages.dev, hodinarium.eu legacy PHP)

**Co posoudit:**

- Hero text: *„Sbírka, expozice a projekty obdivovatelů hodinařiny — od věžních strojů 15. století přes švarcvaldky až po astroláby řízené mikroprocesorem."* — funguje to jako one-liner pro nezasvěceného návštěvníka? Slovo „obdivovatelů" je správný register?
- Hero CTA: pouze 2 tlačítka („Procházet sbírku", „Mapa horologie →"). Chybí třetí dotek typu „Naplánuj návštěvu" pro fyzické návštěvníky muzea?
- Featured grid (4 hand-picked exponáty) vs. random Atlas (4 random) — je to zřejmé z UI rozdílu?
- Visual hierarchy: hero, fleuron divider, featured, dvojice atlas/mapa, …  — scroll-fatigue?
- Mobile UX: hero na 320px viewport — funguje clamp() tipografie?

**Trigger:**

```
/design:design-critique Posuď visual hierarchy a scanability hlavní stránky hodinarium-eu (apps/hodinarium-eu/src/pages/index.astro a Card komponenta). Audience: 3 segmenty (návštěvník muzea Děčín / český horolog-amatér / mezinárodní enthusiast přes EN summary). Soubor + Card.astro + relevantní global.css tokeny. Detaily v docs/design-followups-hodinarium-2026-05-08.md, úloha 2. Pokud chceš screenshot, řekni — uživatel ho dodá z https://hodinarium-eu.pages.dev.
```

---

## Úloha 3 — Design critique: Soupis věžních hodin

**Skill:** `design:design-critique`
**Cíl:** Tabulka soupisu (`/soupis-veznich-hodin/`) je hutná — 5 sloupců + thumbnaily, mobile hide budovu/dataci. Posoudit, zda struktura snese typický browse use case („Hledám hodiny v severních Čechách").

**Soubory:**

- `apps/hodinarium-eu/src/pages/soupis-veznich-hodin/index.astro`
- `apps/hodinarium-eu/src/pages/soupis-veznich-hodin/[slug].astro`
- `apps/hodinarium-eu/src/pages/soupis-veznich-hodin/mapa.astro`

**Co posoudit:**

- Index — kolik záznamů a jak jsou seřazené? Existuje filtr (kraj / stav / hodinář)?
- Detail (`[slug]`) — info hierarchie (lokalita / hodinář / datace / fotky / popis / odkazy)
- Vztah index ↔ mapa — duplikace nebo komplementarita?
- Stav badges (in_situ / preneseno / ztracene / znicene) — vidím to z přehledu na první pohled?
- Mobile: hide sloupců je akceptabilní trade-off?

**Trigger:**

```
/design:design-critique Posuď usability a hierarchii sekce /soupis-veznich-hodin v hodinarium-eu — index, detail, mapa view. Use case: „Hledám zachované věžní hodiny od konkrétního hodináře / v konkrétním kraji". Soubory v docs/design-followups-hodinarium-2026-05-08.md, úloha 3.
```

---

## Úloha 4 — Design critique: Sbírková karta

**Skill:** `design:design-critique`
**Cíl:** Sbírková karta (`/sbirka/karta/[slug]`) je informačně nejhutnější stránka — `KartaSbirky` komponenta zobrazuje katalogová pole (inv. č., výrobce, datace, ram, krok, soukolí, ciselnik, pohon, signatura, stav, rozměry, kyvadlo, extra). Posoudit, jestli to čte odborník i laik.

**Soubory:**

- `apps/hodinarium-eu/src/pages/sbirka/karta/[slug].astro`
- `apps/hodinarium-eu/src/components/KartaSbirky.astro`
- `apps/hodinarium-eu/src/layouts/Article.astro` (karta-prop interface)

**Co posoudit:**

- Hierarchie: hero foto → title → byline → karta box → article body → references. Je karta box dobře umístěn?
- Density of fields (12+ field) — je to scanovatelné, nebo to potřebuje progressive disclosure (collapsed sections)?
- Citation export linky (BibTeX, RIS, JSON) v `<head>` jsou neviditelné — měly by mít UI?
- Vztah karta ↔ medailon hodináře (přes `vyrobce` matching) — vede karta čitelně k medailonu?
- Print stylesheet (`global.css:1280`) — karta print-friendly?

**Trigger:**

```
/design:design-critique Posuď UX sbírkové karty v hodinarium-eu — apps/hodinarium-eu/src/pages/sbirka/karta/[slug].astro + KartaSbirky komponenta + Article.astro layout. Audience: badatel (cituje), laik (browser), kurátor (overview). Detaily v docs/design-followups-hodinarium-2026-05-08.md, úloha 4.
```

---

## Úloha 5 — Design system audit (cross-site)

**Skill:** `design:design-system`
**Cíl:** Najít konzistenční drift mezi sesterskými weby `hodinarium-eu` a `horologie-cz`. Předpoklad: oba sdílí brand language (Český spolek horologický), ale jsou v monorepu vyvíjené nezávisle a tokeny / komponenty se rozjely.

**Soubory:**

- `apps/hodinarium-eu/src/styles/global.css` (~1370 řádků, design tokeny + komponenty)
- `apps/horologie-cz/src/styles/global.css` (předpokládaná struktura — ověř)
- `apps/*/src/components/Card.astro` (sdílený pattern?)
- Footer patterns (oba weby mají vlastní Footer s téměř identickým layoutem)
- Button styles (`.btn-primary`, `.btn-secondary` v index.astro hodinária — jsou jinde, jsou v horologii?)
- Color tokeny (`--color-brass`, `--color-copper`, `--color-bg`, …)
- Typography (Spectral font na obou)

**Co produkovat:**

1. Inventář drift — kde se stejná věc dělá jinak (s file:line referencema)
2. Doporučení: které tokeny/komponenty vytáhnout do shared `packages/ui` (pokud existuje), které jsou legitimně site-specific
3. Migration plan — ne všechno najednou, prioritizovat podle viditelnosti driftu

**Trigger:**

```
/design:design-system Audit konzistence design systemu mezi apps/hodinarium-eu a apps/horologie-cz (sesterské weby Českého spolku horologického v jednom monorepu). Cíl: najít drift v tokenech, komponentách, footer patternech a button stylech. Vyrobit migration plan podle docs/design-followups-hodinarium-2026-05-08.md, úloha 5. Pozor: ne všechen rozdíl je špatně — některé jsou záměrné (sister, ne identical twin); skill ať to flagne, ale neforsí sjednocování bez jasného důvodu.
```

**Pozn. — pusť až po stabilizaci obou webů.** Jinak rebuilduješ bouřlivý cíl.

---

## Úloha 6 — Top-level README pro apps/hodinarium-eu

**Skill:** `engineering:documentation`
**Cíl:** Vytvořit README v `apps/hodinarium-eu/` s architekturou — content collections, MDX → Astro pages, draft mode (variant A client-side), Sveltia CMS pipeline (CF Access + GitHub commits), Cloudflare Pages deployment, Pages Functions API surface, semantic search Workers AI integration.

**Existující dokumentace:** Inline JSDoc v `Base.astro`, `Photo.astro`, `Breadcrumbs.astro` atd. — kvalitní, ale roztroušená. Top-level README chybí.

**Trigger:**

```
/engineering:documentation Napiš README.md pro apps/hodinarium-eu — Astro web Českého spolku horologického. Pokrýt: architecture overview (content collections / MDX / Astro routing / draft mode variant A), CMS pipeline (Sveltia + CF Access + /api/cms/* Pages Functions + GitHub commits přes Octokit), deployment (CF Pages, sister deployment s horologie-cz), semantic search (Workers AI 768-dim embeddings + R2 index), local dev workflow (pnpm dev, build, preview), content authoring (frontmatter conventions, references ISO 690, Photo komponenta credit overlay). Přečti CLAUDE.md a inline JSDoc v src/layouts/Base.astro a src/components/*.astro pro kontext.
```

---

## Úloha 7 — Tech debt inventory

**Skill:** `engineering:tech-debt`
**Cíl:** Inventář dluhu v hodinarium-eu (a případně shared codu). Po nedávném auditu redirect zombies, breadcrumbs konsolidaci a auto-link kroků je repo relativně čistý, ale pravděpodobně sedí další duplicity.

**Hot spots k auditu:**

- Inline `style="border-bottom: none;"` (zmíněno v a11y auditu M7) — kolik míst?
- Duplicitní handler patterny mezi SearchModal a ReportIssueModal (oba hydrované scripty s dialog open/close + Esc + click-outside)
- `Article.astro` vs. `karta/[slug].astro` vs. `hodinari/[slug].astro` vs. `kronika/[slug].astro` — kolik se chovají jak quasi-Article ale mají vlastní layout
- Astro content collections schémata: `clanky`, `hodinari`, `soupis-veznich-hodin`, `kronika` — sjednocené `editorNotes` interface? `references` interface? `tldr` field?
- Inline scripts v `Base.astro` (CMS hydrace, ~200 řádků) — extrakce do `src/utils/` modulu by zlepšila čitelnost
- `apps/hodinarium-eu/src/data/*.ts` — hodinari, kroky, lokace, milniky, kategorie, sites, labels, url-helpers, catalog-types — všechny static data; chybí indexový soubor / sjednocený export

**Trigger:**

```
/engineering:tech-debt Inventář tech debt v apps/hodinarium-eu. Hot spots v docs/design-followups-hodinarium-2026-05-08.md, úloha 7. Cíl: prioritizovaný seznam s file:line referencema, ne abstraktní doporučení. Skip stuff: inline JSDoc je adekvátní, MDX content collections fungují, deploy pipeline funguje. Hledej jen reálnou duplikaci a out-of-date code.
```

---

## Workflow doporučení pro druhou session

1. Tento doc načti, **zkopíruj seznam úloh do TodoWrite** s `status: pending`
2. Spusť **postupně, jednu po druhé** — po každé úloze počkej na user feedback nebo explicitní *„pokračuj na další"*
3. Pokud úloha vygeneruje další follow-ups (typicky tech-debt audit najde další refactoring tasky), přidej je jako nové TodoWrite items, ne jako tichý drift
4. **Pozor na konflikty s a11y auditem** (`docs/a11y-audit-hodinarium-2026-05-08.md`):
   - Úloha 1 (ux-copy) může chtít upravovat copy v `ReportIssueModal.astro` — pokud a11y fix M4 ještě běží, počkej
   - Úloha 7 (tech-debt) prostá inventář, write zatím netřeba
5. **Vše ostatní = bezpečné spustit nezávisle.**
