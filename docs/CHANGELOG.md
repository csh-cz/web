# Changelog

Archiv hotových položek z TODO.md. Chronologicky reverse, group by topic.
Plná historie se najde v `git log` — toto je rychlý přehled milníků.

---

## 2026-05-10 — editor pomocníci V1 + editorial workflow + audit

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
