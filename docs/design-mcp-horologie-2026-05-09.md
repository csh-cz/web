# MCP server pro hodinářskou terminologii — design + PBI

**Datum:** 2026-05-09
**Status:** návrh, **zatím neimplementovat** (uloženo do backlogu)
**Cíl:** umožnit LLM klientům (Claude Desktop, Cursor, Continue, …)
generovat a překládat hodinářské texty s respektem k terminologii
a faktickým datům, která Hodinárium udržuje.

## Motivace

CSH má bohatý znalostní korpus:

| Zdroj | Stav (2026-05-09) | Použití |
|---|---|---|
| `content/slovnik/*.md` | 57 hesel | cs ↔ de/en/fr překlady + definice + příbuzné termíny |
| `content/hodinari/*.mdx` | 104 medailonů | biografie hodinářů + datace + města |
| `content/soupis-veznich-hodin/*.mdx` | 396 záznamů | dochované/ztracené stroje + GPS + datace |
| `content/hodinarium-eu/*.md{x}` | 491 článků | technické články, sbírkové karty |
| `apps/hodinarium-eu/src/data/references.json` | ~1100 Zotero items | bibliografie, ISO 690 |
| `apps/hodinarium-eu/src/data/semantic-index.json` | ~1100 vektorů (bge-m3) | sémantický search |
| `skills/horologicka-terminologie/reference/slovnik.md` | SSOT slovníku + k-overeni.md | autoritativní cs forma |

Aktuální využití: skill `horologicka-terminologie` v Claude (loaded jen
v projektu), `slovnik:auto-link` skripty (build-time), Workers AI
sémantický search (runtime API). **Není to dostupné napříč jinými
LLM klienty** (Cursor, Continue, Claude Desktop, ChatGPT desktop, …).

MCP server tu mezeru zaplní — standardní protokol, který kterýkoli
klient s MCP podporou (od ~poloviny 2024) umí konzumovat.

## Use cases

**UC-1: Překlad odborného textu cs → de**
*„Krokové kolo s 30 zuby zabírá s kotvou Grahamova kroku."* →
`Steigrad mit 30 Zähnen greift mit dem Anker des Grahamhemmungs.`

Server zajistí, že:
- „krokové kolo" se přeloží jako Steigrad (ne Triebrad), protože
  slovník má `krokove-kolo.prekladyDe[].term = "Steigrad"`.
- „Grahamův krok" → Grahamhemmung (z heslové k-overeni reference).
- Referenční odkaz na `/slovnik/krokove-kolo` v citaci.

**UC-2: Generování popisku karty z evidence**
Vstup: inv. č. 19 (Amant 1898) + foto.
Výstup: 4 odstavce o stroji — ráme, kotvě, signatuře, datace,
restaurování. Generuje se z `karta` frontmatteru + slovníkového
kontextu pro každý termín.

**UC-3: Lektorace článku autora-laika**
Petr napíše článek o věžních hodinách → MCP server projde a označí:
- Použité termíny mimo slovník („balanc" → správně „setrvačka", odkaz)
- Faktické chyby („Robertův krok 1860" → patent 1852, viz
  `/kroky/robertuv-krok`)
- Citace bez bibKey (návrh konkrétního Zotero záznamu z
  references.json přes embedding match)

**UC-4: Sémantický lookup nad korpusem**
Klient se ptá „jaké zdroje mám o vídeňské hodinářské škole 19. století"
→ server vrátí relevantní úryvky z článků + medailonů + slovníku
seřazené podle sémantické blízkosti.

**UC-5: Citace v ISO 690**
Klient: „dej mi ISO 690 citaci pro Bureš 1965 stranu 87".
Server: `BUREŠ, Vladimír, 1965. ...` přes existing
`scripts/build-references.ts` pipeline + Zotero CSL.

## Architektura

```
┌─────────────────────────────────┐
│ MCP Client                      │
│ (Claude Desktop / Cursor / …)   │
└────────────┬────────────────────┘
             │ stdio / SSE / HTTP
             │
┌────────────▼────────────────────┐
│ csh-mcp-horologie (Node)        │
│  ├─ Tools (translate, generate, │
│  │   lookup, lint, cite)        │
│  ├─ Resources (slovník, …)      │
│  └─ Prompts (šablony)           │
└────────────┬────────────────────┘
             │
   ┌─────────┴─────────────┐
   │                       │
┌──▼────────┐    ┌─────────▼────────┐
│ Repo data │    │ Embedding cache  │
│ (slovník, │    │ (bge-m3 ze       │
│  references│    │  semantic-index) │
│ , …)      │    │                  │
└───────────┘    └──────────────────┘
```

**Implementační volby:**

- **Runtime:** Node.js + TypeScript (`@modelcontextprotocol/sdk`),
  navazuje na existing tooling (Astro, scripty `scripts/*.ts`).
- **Distribuce:** ESM package, lokálně přes `pnpm dlx csh-mcp` nebo
  npm registry. Klienti zaregistrují přes config:
  ```json
  { "mcpServers": { "csh-horologie": {
    "command": "pnpm", "args": ["dlx", "@csh-cz/mcp-horologie"]
  }}}
  ```
- **Data source:** read-only ze stávajícího repu (clone nebo
  bundled snapshot). Server **negeneruje** — vystavuje data jako
  context pro LLM klient, který už má vlastní generation/translation
  schopnosti.
- **Update strategy:** snapshot rebuilduje se v CI, publikuje na npm
  s `version: 0.1.YYYYMMDD`. Klient updatuje sám.
- **No external API calls** (zachovat offline-friendly).

## MCP Tools (návrh)

Tools jsou strukturované funkce volatelné LLM klientem.

### `slovnik_lookup`

Najde heslo / přeloží termín.

```json
{
  "name": "slovnik_lookup",
  "description": "Najde hodinářský termín ve slovníku Hodinária. Vrátí definici, překlady (de/en/fr) a příbuzné termíny.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "term": { "type": "string", "description": "Český termín, alias, nebo slug (např. „setrvačka\", „balanc\", „setrvacka\")" },
      "language": { "enum": ["cs", "de", "en", "fr"], "default": "cs" }
    },
    "required": ["term"]
  }
}
```

Návratová struktura: `{ slug, title, definice, prekladyDe[], prekladyEn[],
prekladyFr[], pribuzne[], references[] }`.

### `slovnik_search_semantic`

Sémantický search nad slovníkem (najde i hesla bez exact match termu).

```json
{
  "name": "slovnik_search_semantic",
  "description": "Sémantický search nad 57 hesly slovníku. Pro intent typu „regulátor pro chronometr\" najde lihýř, regulátor, chronometr, isochronismus.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": { "type": "string" },
      "limit": { "type": "integer", "default": 5 }
    }
  }
}
```

Použije bge-m3 embeddings z `semantic-index.json` (subset entries
s collection=slovnik). Cosine similarity proti query embedding
(generated via local sentence-transformer nebo Workers AI proxy).

### `terminology_lint`

Lektoruje text — najde nesprávně použité termíny.

```json
{
  "name": "terminology_lint",
  "description": "Projde text a navrhne změny — neslovníkový termín → kanonická forma. Příklad: „balanc\" → „setrvačka\". Jen návrhy, žádné automatické úpravy.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "text": { "type": "string" },
      "language": { "enum": ["cs", "de", "en", "fr"], "default": "cs" }
    }
  }
}
```

Logic: tokenize text → match proti `aliasy[]` z hodinari + slovník
non-canonical formy (např. „balanc", „vlasová pružinka", „silentium").
Vrátí `{ position, found, suggested, slug }`.

### `hodinar_lookup`

Najde medailon hodináře.

```json
{
  "name": "hodinar_lookup",
  "description": "Najde hodináře/firmu podle jména, slugu nebo aliasu. Vrátí životopisná data, město působení, hlavní práce.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "name": { "type": "string", "description": "Václav Krečmer / krecmer / Wenzel Kretschmer" }
    }
  }
}
```

Wraps `findHodinarFromVyrobce` + plná data z `hodinari.ts` + body
z MDX entry (pokud existuje).

### `vezni_hodiny_search`

Search nad soupisem věžních hodin (filtry: hodinář, lokace, rok, stav).

```json
{
  "name": "vezni_hodiny_search",
  "inputSchema": {
    "type": "object",
    "properties": {
      "hodinar": { "type": "string" },
      "obec": { "type": "string" },
      "kraj": { "type": "string" },
      "yearFrom": { "type": "integer" },
      "yearTo": { "type": "integer" },
      "stav": { "enum": ["in_situ", "preneseno", "ztracene", "znicene", "neznamy"] },
      "limit": { "type": "integer", "default": 20 }
    }
  }
}
```

### `cite_iso690`

Generuje ISO 690 citaci z Zotero bibKey.

```json
{
  "name": "cite_iso690",
  "description": "Vytvoří ISO 690 citaci v cs lokalizaci pro Zotero bibKey z Hodinária. Volitelně přidá pages.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "bibKey": { "type": "string", "description": "Zotero citation-key, např. „buresKonstrukceMechanickychHodin1965\"" },
      "pages": { "type": "string", "description": "„87\" nebo „87–92\"" }
    },
    "required": ["bibKey"]
  }
}
```

Wraps existing `apps/hodinarium-eu/src/utils/cite.ts` `formatCite()`.

### `corpus_search_semantic`

Cross-collection sémantický search.

```json
{
  "name": "corpus_search_semantic",
  "description": "Sémantický search napříč články, medailony, slovníkem, soupis. Užitečné pro „dej mi všechny zdroje o vídeňské škole 19. století\".",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": { "type": "string" },
      "collections": {
        "type": "array",
        "items": { "enum": ["clanky", "hodinari", "slovnik", "soupis-veznich-hodin", "kroky", "kronika"] }
      },
      "limit": { "type": "integer", "default": 10 }
    }
  }
}
```

## MCP Resources (návrh)

Resources jsou statické zdroje, které klient může číst (`resources/list`,
`resources/read`).

| URI | Popis |
|---|---|
| `csh://slovnik/index` | Seznam všech 57 hesel s slug + title + kategorie |
| `csh://slovnik/{slug}` | Plné heslo (definice + překlady + reference) |
| `csh://slovnik/cs-de.tsv` | Tabulka cs → de pro všechna hesla (rychlý překladový dictionary) |
| `csh://slovnik/cs-en.tsv` | cs → en |
| `csh://slovnik/cs-fr.tsv` | cs → fr |
| `csh://hodinari/index` | Seznam hodinářů (slug + jméno + období + město) |
| `csh://hodinari/{slug}` | Plný medailon |
| `csh://references/{bibKey}` | Zotero CSL JSON pro single bibKey |
| `csh://style-guide` | Stylistické konvence z `clanky-konvence` skillu (cz mainly, ne MD) |

## MCP Prompts (návrh)

Prompts jsou předdefinované šablony, které klient může vyvolat (`prompts/list`).

### `prompt: write_medailon_skeleton`

Generuje skeleton medailonu hodináře pro editora.

Vstup: `name: string`, `years?: string`, `mesto?: string`.
Výstup: MDX skeleton s frontmatter + sekce „Život", „Dílo", „Reference".

### `prompt: review_terminology`

Review článku pro terminologickou konzistenci.

Vstup: `text: string`.
Výstup: prompt template, který instruuje LLM:
1. Najít každý hodinářský termín
2. Pro každý zavolat `terminology_lint` (server tool)
3. Sumarizovat nalezené odchylky + navrhnout opravy

### `prompt: translate_horology_text`

Překlad odborného textu z cs do {de,en,fr}.

Vstup: `text: string`, `targetLang: enum`.
Výstup: prompt instruující LLM aby:
1. Identifikoval hodinářské termíny v cs
2. Pro každý zavolal `slovnik_lookup` → najít překlad
3. Aplikoval překlady + zachoval syntaktickou strukturu cs
4. Označil termíny bez slovníkového překladu (TODO)

## Roadmap (PBI)

PBI = Product Backlog Items. Pořadí navržené pro inkrementální dodávku.

### MCP-1: Bootstrap projektu (~4 h)

**As a maintainer**, chci základní strukturu MCP serveru, abych mohl
přidávat tools.

- Nový adresář `packages/mcp-horologie/` v monorepo (pnpm workspace).
- `package.json` s `@modelcontextprotocol/sdk` deps.
- TypeScript config + ESM build.
- Hello-world MCP server (jeden no-op tool, listuje resources).
- README s install/usage instrukcemi.

Acceptance: `pnpm dlx @csh-cz/mcp-horologie` spustí, klient
(Claude Desktop) ho registruje, `tools/list` vrátí 1 tool.

### MCP-2: `slovnik_lookup` tool (~2 h)

Implementuje `slovnik_lookup` tool. Reads `content/slovnik/*.md`
(snapshot bundled při buildu).

- Parser pro slovník MD frontmatter + body
- Funkce `lookupBySlug` + `lookupByTerm` (alias resolution)
- Tool definition + JSON schema validation
- Integration test: query „balanc" → vrátí setrvačka

### MCP-3: `slovnik_resources` (~1 h)

Resources `csh://slovnik/index`, `csh://slovnik/{slug}`, TSV exporty.

- `resources/list` handler
- `resources/read` handler (URI → content)
- TSV generator pro překladové páry

### MCP-4: `cite_iso690` tool (~2 h)

Wraps `formatCite()` ze stávajícího `cite.ts`. Loaduje
`references.json` z app data dir.

- Bundled `references.json` snapshot
- citeproc-js init (může být velký bundle — zvážit lazy load)
- Test: bibKey „buresKonstrukceMechanickychHodin1965" → ISO 690 cs

### MCP-5: `hodinar_lookup` + resources (~3 h)

Wraps `findHodinarFromVyrobce` + bundled `hodinari.ts` data.

- Parser pro hodinari.ts (TS modul → načíst přes dynamic import nebo
  re-export jako JSON v build)
- Tool: name → slug + jmeno + obdobi + mesto + práce
- Resource `csh://hodinari/index` + `csh://hodinari/{slug}`

### MCP-6: `vezni_hodiny_search` tool (~3 h)

Strukturovaný search nad soupisem.

- Parser pro `content/soupis-veznich-hodin/*.mdx`
- Filter logic (hodinař, obec, kraj, year range, stav)
- Tool: vrátí matching records s odkazem na detail page

### MCP-7: `terminology_lint` tool (~4 h)

Lint text proti slovníku — najde non-canonical termíny.

- Whitelist non-canonical → canonical mapování (z aliasů +
  k-overeni.md non-preferovaných forem)
- Tokenization + position tracking
- Návrhy s confidence score
- Integration test: text s „balanc" → suggest „setrvačka"

### MCP-8: Sémantický search (~5 h)

`slovnik_search_semantic` + `corpus_search_semantic`.

- Bundled subset `semantic-index.json` (pouze relevant collections)
- Embedding lokálně (sentence-transformers / fastembed) **nebo**
  via Cloudflare Workers AI proxy (vyžaduje URL/auth config — opt-in)
- Cosine similarity ranking

### MCP-9: Prompts API (~2 h)

3 prompts: `write_medailon_skeleton`, `review_terminology`,
`translate_horology_text`.

- prompts/list + prompts/get handlers
- Šablony s placeholder substitucí

### MCP-10: CI + publishing (~3 h)

- GitHub Action: na push do main rebuild + publish na npm s
  `version: 0.1.YYYYMMDD` (snapshot tagging).
- Trusted publishing (npm provenance).
- README badge s aktuální verzí.

### MCP-11: Dokumentace + onboarding (~2 h)

- `docs/mcp-quickstart.md` — jak zaregistrovat v Claude Desktop /
  Cursor / Continue
- Příklady (transcript): překlad, lint, write_medailon
- `mcp-horologie.example.com` (volitelně) — public landing page

**Total estimated effort:** ~31 h ≈ 4 working days

## Otevřené otázky

1. **Embedding model** — Lokální fastembed (~100 MB, slower init,
   zero cost) nebo Workers AI proxy (rychlý, vyžaduje auth/billing,
   ~$0.01 / 1k queries)? Pro on-demand klient default fastembed,
   Workers AI jako advanced opt-in.
2. **Update strategy** — Daily snapshot? Weekly? Při každém pushe?
   Vlastní release proces nebo součást existing CF Pages deploy?
3. **Privacy / telemetry** — MCP server běží lokálně u klienta,
   žádný telemetry default. Volitelně: opt-in usage stats.
4. **Multi-jazyk slovník** — Aktuálně cs primary + de/en/fr
   překlady jako pole. MCP může reverse map (de → cs?). Zatím
   jednosměrný (cs ↔ X), bidirektivní jako follow-up.
5. **Authentication** — MCP servery běží lokálně, ale pokud
   přidáme write tools (např. „push návrhu medailonu jako PR
   draft"), potřebuje GitHub auth. Pro V1 read-only.
6. **Coexistence se skillem** — `horologicka-terminologie` skill
   v Claude má slovník v markdown. Po deploy MCP může skill
   skip slovník (nebo zachovat oba — skill rychlejší pro Claude
   Code, MCP pro ostatní klienty).

## Kontext / odkazy

- Anthropic MCP spec: <https://spec.modelcontextprotocol.io/>
- TypeScript SDK: <https://github.com/modelcontextprotocol/typescript-sdk>
- Claude Desktop config: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Cursor MCP: Settings → Features → MCP
- Continue.dev MCP: <https://docs.continue.dev/customize/deep-dives/mcp>

---

**Implementace nezačne, dokud uživatel nezadá explicit signál.** Tento
dokument slouží jako blueprint pro budoucí vlnu — až bude prostor po
větších DPR (DNS switch, Sveltia MDX migrace A.11, network graph T7),
PBI lze rozdělit a pustit MCP-1 → MCP-11 inkrementálně.
