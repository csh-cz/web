# ContentTODO — vytěžování Zotero pro tvorbu obsahu

Strukturovaný backlog **content generation** úkolů, které využívají indexovanou Zotero knihovnu (1889 položek / 104 967 vektorů přes bge-m3 semantic search).

Stav indexace: 2026-05-13. Doplňované při sessionech, hotové položky strip-nout. Pro technické TODO viz [TODO.md](TODO.md).

---

## 🚀 Quick wins (1–2 h každá, vysoký ROI)

### A1. Slovník — 8–10 tower-clock termínů

Doplnit zbývající termíny ze série, kterou jsem začal 2026-05-13 (5 hesel: klečový rám, nátahový buben, ukazovací stroj, ciferník, kolíčkový krok, remontoir). Každé heslo: 2–3 primary source citace s Zotero `bibKey`, plus DE/FR genus per konvence (Špatný 1882 styl m./f./n.).

| Heslo | Kategorie | Klíčové zdroje |
|---|---|---|
| **vidlice** (jicí ↔ ukazovací převod) | mechanika | Himmler 2006 `BB7EQHPE`, Hajn 1953 `9MK4QIHS` TOC „Vidlice" str. 278 |
| **ručka / rafije** (existuje jen `ruka-orloje`) | mechanika | Jičín NPÚ `E8NULF2Z`, Špatný 1882 *Zeiger* `D2A35XU2` |
| **plné bití / jednoduché bití hodin** | bici | Sladkovský 1947 `VIBRCUZT` |
| **kovářská práce / kovaný stroj** (typologie) | mechanika | Himmler 2006 explicit citace |
| **brzdný (lopatkový) větrník** | bici | sub-heslo k existující `vetrnik`, Himmler 2006 detail |
| **Robertův krok** | mechanika | stub v slovníku → link na existující `kroky/robertuv-krok.mdx` + Knespl 2018 `35DKG7WY` + 2023 |
| **gravitační krok / Denisonův krok** (Big Ben) | mechanika | Denison 1850 `983BSK34` + Grimthorpe 1903 `4UW7HPWB` |
| **synchronní motor + centrální převodovka** | mechanika | Velenice 2009 NPÚ MIS 1386677 + Frank 2013 `HLAQ5V8P` |
| **trojlístek** (tvar ručky, baroko) | mechanika | Jičín NPÚ `E8NULF2Z` |
| **kovové táhlo** | mechanika | Kraslice NPÚ MIS 1737614 |

→ Dvojnásobí tower-clock pokrytí slovníku. Batch jako [`53df39f5`](https://github.com/csh-cz/web/commit/53df39f5).

---

### A2. Cross-references — slovník ↔ soupis ↔ hodinari ↔ kroky

Současný stav: slovník hesla referencují primární prameny, ale chybí `crossRefs.soupis` / `crossRefs.clanky` / `crossRefs.hodinari` na konkrétní výskyty na webu.

**Příklad:** heslo `kolickovy-krok` by mělo linkovat:
- `crossRefs.soupis: [1788-markvartice-prokes, ...]` (objekty s tímto krokem)
- `crossRefs.hodinari: [jan-prokes, ...]`
- `crossRefs.kroky: [robertuv-krok]`

**Workflow:**
1. Skript projde 140 slovník hesel + matchne s 414 soupis + 50 hodinari na klíčové termíny (krok type, hodinář atribuce)
2. Auto-generuje initial `crossRefs` draft do MDX frontmatter
3. Manuální review + publish

Vysoký navigační value pro čtenáře.

---

### A3. Enrich hodinari medailony klíčovými citacemi

Z indexace vidím bohaté materiály o hodinařích v Zoteru, které do `content/hodinari/` zatím nejsou kompletně přepsány:

| Medailon | Klíčové zdroje | Pokrytí v Zoteru |
|---|---|---|
| **jan-prokes** | Knespl 2018 *200 let* `35DKG7WY`, Knespl 2024 EN `IDRANSBM` | 60+ chunků s detaily dílny + zákazníků |
| **romuald-bozek** | Knespl 2024 *Die neue Stadtuhr* `99WRKNS4` + Božek 1897 rukopis `USQS6PZN` | **152 chunků** — autoritativní |
| **engelbert-seige** | stub — zkontrolovat Zotero pro materiál | ? |
| **vaclav-krecmer** | Knespl publikace + soupis-veznich-hodin reference | ? |
| **frantisek-lang** | Himmler 2006 (Olomouc VMO + Uherské Hradiště 1734) | Himmler `BB7EQHPE` |
| **summerecker** | Knespl 2024 EN `IDRANSBM`, multiple soupis entries | bohaté |
| **mannhardt** | Munich tower clockmaker — možná v Zoteru ale ne medailon | ? |
| **mares** (Libice 1895 evangelický) | NPÚ MIS — krátký kontext | mini |

**Workflow per medailon:** semantic search „<jméno> + hodinář + dílna", extract klíčové citace, doplnit do MDX s primary source reference (ISO 690 dle [feedback memory](file:///Users/dknespl/.claude/projects/-Users-dknespl-Documents-orlojWeb/memory/feedback_iso690_reference.md)). **~10–15 medailonů × 30 min/each.**

---

## 🎯 Středně náročné (3–6 h každá, vysoká hodnota)

### B1. Tematický článek „Vývoj věžních hodin v Čechách"

Komplet z mapy:
- Středověk: Pražský orloj, Olomoucký orloj
- 17.–18. století: barokní strojek (Jičín, Borotín, Markvartice prototypy)
- 19. století: Prokešova dílna, Krečmer, Hainz, Janata (Knespl 2018, 2024)
- 20. století: tovární výroba (Chronotechna), modernizace (Velenice 2009)

Zdroje napříč knihovnou + 119 NPÚ dokumentů. **~300–400 řádků** plný-feature článek.

### B2. Article „Robertův krok a sobotecká dílna Prokešova"

- Adolphe Robert 1852 původní vynález (FR)
- Cesta do Čech (Prokeš asi přes Vídeň?)
- Sobotecká dílna 1839–1890, ~400 ks strojů
- Konkrétní instance v existujících soupis entries (~50)
- Modern restaurování Skálou (po 2000)

Zdroje: Knespl 2018 `35DKG7WY` + 2023 + 2024 EN, Markvartice NPÚ, kroky/robertuv-krok.mdx, soupis Prokeš entries.

### B3. Article „Cs hodinářské učebnice 19.–20. století"

Synthesa: Sušický 1900 `M2MD5J34`, Sladkovský 1947 `VIBRCUZT`, Hajn 1953 `9MK4QIHS`, Martínek/Řehoř 1964 `LXZWE6KE`, Bureš 1974 `WDDY29VD`, Boukal 1958 `KQVUX5CB`. Vývoj terminologie + pedagogický kontext (cech → hodinářské školy → Chronotechna). Citace přes Zotero bibKey, ISO 690.

### B4. Article „Berthoudovo *Essai sur l'horlogerie* 1763 — francouzský canon"

Nově indexovaných 152 chunků FR kanonické literatury. Glossář FR-EN-CS termínů (str. 295 alphabetical „Explication abrégée") + význam pro cs terminologii.

### B5. Article „Pražský orloj — restaurování 2018"

Skála zpráva `NKIEQQ6E` jako primary source. Detail technického postupu — uvolnění mezilehlého kola jicího stroje, regulace záběru ozubení ukazovacího stroje, raménko apoštolského stroje. Kontextualizovat historicky (Rosický 1923 *Staroměstský orloj v Praze*, Černá 2012 *Přehled výzkumu k obnově 1864–1865* `HFLZIA85`).

### B6. Article „Big Ben a Edmund Beckett Denison — gravity escapement"

Denison 1850 `983BSK34` (nově s PDF + OCR text) + Grimthorpe 1903 `4UW7HPWB` (151 chunků). Westminster clock design + double three-legged gravity escapement (1854).

### B7. Article „Modernizace věžních hodin — synchronní motory, centrální převodovky"

Frank 2013 `HLAQ5V8P` jako foundation + Velenice 2009 NPÚ + Skálovy zprávy. Pro/proti retrofit; sociotechnický kontext (zánik stálé hodinářské péče po 1950).

---

## 🏗 Velké projekty (1–3 dny, transformativní)

### C1. „TOC mining" — strukturované generování slovník hesel

Vytáhnout TOC Hajn 1953 (Kroky pro kyvadlo: Krok kotvový, Grahamův, Brocotův, kolíčkové; Kroky pro setrvačku: válcový, duplexní, chronometrové; Pohon: závaží, péro, šnek, remontoir; …). **Každá entry TOC = potenciální slovník heslo.**

**Skript:**
1. Parse TOC z LXZWE6KE (Hajn) + Bureš + Boukal (cached content v plug DB)
2. Map proti existujícím 140 slovník hesel
3. Filter na non-existing termíny
4. Pro každý: semantic search za primary source citaci
5. Auto-generate stub MDX s frontmatter + 1 referencí + genus
6. Manuální review + publish

**Očekávaný výsledek:** ~50–100 nových slovník hesel.

### C2. NPÚ MIS → soupis enrichment

Aktuálně ~50 soupis stubů s minimem dat. 119 NPÚ MIS dokumentů obsahuje **detailní popisy konstrukce** konkrétních strojů (analogicky jako Jičín, Markvartice z naší slovník práce).

**Workflow:**
1. Pro každý NPÚ dokument (indexed): extract structured data — rok výroby, autor, krok, ciferníky, restaurátor
2. Match proti existujícímu soupisu (slug heuristic)
3. Enrich existing entry nebo create new
4. **Důsledek:** ~50–80 soupis entries zařadí ze stub do plnou kartu

### C3. Multilingvální slovník z Berthouda

Berthoud 1763 + 1802 mají kompletní glossář FR termínů. Spojit s Saunier 1887 (EN), Špatný 1882 (DE), našimi CS termíny → **rozšířený 4-jazyčný slovník** s FR canonickou base. Audit chyb v existujících FR překladech v slovníku (potenciálně).

---

## 💡 Aktivní plán k dotazu

Doporučení sortováno podle ROI:

1. **A1** (8–10 slovník hesel) + **A2** (cross-references) — dohromady ~3–4 h, zdvojnásobí hloubku slovníku
2. **B1 nebo B2** — ucelený technický článek s vysokou reader value
3. **C2** (NPÚ MIS soupis enrichment) — největší dopad na kompletnost soupisu

---

## 📝 Konvence pro content sessions

- **Primary source citation povinná** — každý netriviální fakt s Zotero `bibKey` reference, ISO 690 formát citací (viz [feedback memory](file:///Users/dknespl/.claude/projects/-Users-dknespl-Documents-orlojWeb/memory/feedback_iso690_reference.md))
- **Slovník:** povinné DE/FR genus (Špatný styl m./f./n.), schema v `apps/hodinarium-eu/src/content.config.ts` `slovnikPreklad`
- **Cross-refs:** povinné `crossRefs.<collection>` v frontmatter, validace v build (PBI X.10)
- **Foto:** vždy zdroj a copyright (viz [feedback memory](file:///Users/dknespl/.claude/projects/-Users-dknespl-Documents-orlojWeb/memory/feedback_foto_atribuce.md)) — neznámý autor = explicitně „autor neznámý"
- **Skill aktivace:** `clanky-konvence` (project-scope) + `horologicka-terminologie` (user-scope) drží konvence
- **Validace:** `pnpm --filter hodinarium-eu astro check` před commitem (0 errors required)

---

## TODO follow-ups

- **Schema enum `veznihodinaFoto.typ`** — hodnota `cifernik` je archaická forma, mělo by se přejmenovat na `ciselnik` per moderní cs úzus. Breaking change ve `content.config.ts` (apps/hodinarium-eu/src/content.config.ts) + retrofit ~všech soupis entries užívajících `typ: cifernik` v `foto:` blocích. Skript via grep + sed je rovnost. Plus update komentářů v soupis-veznich-hodin/index.astro.

## Hotové (archiv)

- 2026-05-14: **Slovník heslo `cifernik` → `ciselnik`** (přejmenováno: archaismus → moderní cs termín číselník) + doplněno o sekci „Teorie čitelnosti dle Romualda Božka" s 6 zásadami funkcionalismu 19. století + citacemi z Die neue Stadtuhr 1859 ed. Knespl 2024 [`99WRKNS4`], Über astronomische Uhren 1894 [`53MNBESG`], Dolenský 1935 [`ZK5ARYU9`]
- 2026-05-13: **5 tower-clock slovník hesel** — klečový rám, nátahový buben, ukazovací stroj, ciferník, kolíčkový krok, remontoir (commit [`53df39f5`](https://github.com/csh-cz/web/commit/53df39f5))
- 2026-05-13: **schema rozšíření pro DE/FR genus** + retrofit 37 existujících hesel + skill docs (commit [`f5517680`](https://github.com/csh-cz/web/commit/f5517680))
- 2026-05-13: **6 TIER 1/2 NPÚ stubs** — Borotín 1767, Domažlice 1893, Velenice 1935, Kraslice 1888, Hrádek 1901, Krnov 1903, Kristiánov Liberec, Třebovice ve Slezsku (s opravou Prokeš false-positive)
- 2026-05-13: **3 PD knihy importované** — Glasgow 1885, Denison 1850, Berthoud 1763 + OCR Dietzschold 1905 (commit přes JS attach + reindex)
- 2026-05-13: **2 references doplněny do existujících** — Frank 2013 do Velenice, Knespl 2018 do Markvartice
