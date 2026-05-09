# AI našeptávač pro Sveltia editor — design + PBI

**Datum:** 2026-05-10
**Status:** návrh, **zatím neimplementovat** (uloženo do backlogu jako A.14)
**Cíl:** AI asistent integrovaný do Sveltia editoru, který editorovi
(Petr, David, …) pomáhá psát/překládat texty s respektem k slovníku
a faktickým datům Hodinária.

## Use cases (priorita)

### UC-A: Inline auto-complete (Copilot-style)

Editor píše: `Krokové kolo s 30 zuby zabírá s kotvou ` → AI navrhne
ghost-text: `Grahamova kroku, který je nejstarším volně oscilujícím
typem.` Tab přijme, Esc odmítne, dál psaní reset.

Klíčový rozdíl od ChatGPT: **zná hodinářskou terminologii ze slovníku**
+ **zná uvedené hodináře/místa** + **zná stylistické konvence CSH**
ze skill `clanky-konvence`.

### UC-B: Sidebar chat („Napiš mi…")

Vedle editoru panel s chat oknem:
- *„Napiš mi 3-věty perex pro tento článek"*
- *„Přelož tento odstavec do němčiny"*
- *„Najdi mi v Zoteru zdroj k této tezi"*
- *„Zkontroluj fakta v tomto odstavci proti soupisu"*

Multi-turn s plným kontextem editovaného souboru + repo dat.

### UC-C: Terminologický review (post-write)

Po Save AI projde text a v sidebar vrátí seznam:
- *„Použité „balanc" — slovník doporučuje „setrvačka"."* (link na heslo)
- *„„Krek" — možná „Krok" v 3. p. j. č.?"*
- *„„Robertův krok 1860" — patent 1852, Sancerre"* (factcheck)

Navazuje na A.13 spell-checker, ale kontextově (gramatika, terminologie,
faktická data), ne čistě pravopisně.

### UC-D: Generování skeletonu

*„Vytvoř skeleton medailonu pro nového hodináře"* → frontmatter
+ sekce „Život", „Dílo", „Reference" s šablonou ze stávajících
medailonů. Editor pak doplní data.

### UC-E: Citace návrh

Po napsání odstavce: *„Tato věta o Robertově kroku je tvrzena —
chceš citaci?"* AI dělá semantic search nad references.json
(Zotero), navrhne 1–3 nejpravděpodobnější bibKey + stranu.
Editor schválí, formátuje se přes existující ISO 690 pipeline.

## Architektonická volba

### Možnosti modelů

| Model | Pricing | cs kvalita | Latence | Pro CSH |
|---|---|---|---|---|
| Workers AI Llama 3.1 8B | **0 Kč** (10k neuron-actions/den) | průměrná | ~500 ms | V1 free tier |
| Workers AI Llama 3.3 70B | $0.50–1 / 1k actions | dobrá | ~2 s | drahá |
| Anthropic **Sonnet 4.5** | $3/$15 per M tokens | **výborná** | ~1 s streaming | V2 paid |
| Anthropic Haiku 4.5 | $0.80/$4 per M tokens | dobrá | ~500 ms | rychlé lookups |
| OpenAI GPT-4o-mini | $0.15/$0.60 per M | dobrá (slabší cs) | ~600 ms | nedoporučeno |
| Lokální Phi-4 (transformers.js + WebGPU) | 0 Kč (~3 GB stažení) | nízká cs | ~30 tok/s | V3 experimental |

### Doporučená cesta: dvě úrovně

**V1 (free, MVP):** Workers AI Llama 3.1 8B přes existing Cloudflare Pages Function.
- 0 Kč
- Pokrývá UC-C (lint), UC-E (citace) — krátké lookups, žádné generování
- Zatím neumí UC-A (auto-complete) v dobré kvalitě cs
- Ne UC-B (multi-turn chat — bere context, kontext window 8k tokens je tight)

**V2 (paid, plný value):** Anthropic Sonnet 4.5 přes Cloudflare AI Gateway.
- ~$3–10/měsíc (= 75–250 Kč) pro CSH typický traffic
- Plný value: UC-A, UC-B, UC-C, UC-D, UC-E
- AI Gateway: caching (7-day TTL → repeat queries free), rate limiting,
  logging, fallback na Haiku při outage

**V3 (long-term):** local inference (transformers.js, llama.cpp WASM)
když lokální models doženou cs kvalitu Sonneta. Privacy max + 0 Kč.

### Cost calculation (V2)

Předpoklad CSH typical use: **5 editorů × 50 calls/měsíc × průměr 2K tokens/call**
= 500K tokens/měsíc.

- **System prompt** (slovník + style guide, cached): ~3K tokens.
  Při 250 calls × 3K = 750K cached reads × $0.30/M = **$0.23/měsíc**
- **User prompt** (kontext + intent): ~500 tokens × 250 calls
  = 125K tokens × $3/M = **$0.38/měsíc**
- **Output** (suggestion text): ~500 tokens × 250 = 125K tokens
  × $15/M = **$1.88/měsíc**

**Total: ~$2.50–5/měsíc**, podle skutečného use intensity.

S AI Gateway 7-day cache: typicky 30–50 % queries je cache hit
(repeat editor refining same text) → reálně **~$1.50–3/měsíc**.

Pro NGO rozumné.

## Architektura

```
┌─────────────────────────────────┐
│ Sveltia editor (admin/index.html) │
│  ├─ Inline ghost-text widget     │
│  ├─ Sidebar chat panel           │
│  └─ Status bar (loading/error)   │
└────────────┬────────────────────┘
             │ POST /api/ai/{action}
             │ stream: SSE
             ▼
┌─────────────────────────────────┐
│ Cloudflare Pages Functions       │
│  /api/ai/suggest                 │
│  /api/ai/chat                    │
│  /api/ai/lint                    │
│  /api/ai/citation-suggest        │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ Cloudflare AI Gateway            │
│  ├─ Cache (7-day TTL)            │
│  ├─ Rate limit (per IP)          │
│  ├─ Auth gate (CF Access)        │
│  └─ Telemetry                    │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ Anthropic API (Sonnet 4.5)       │
│  + system prompt cached:         │
│    - slovník (57 hesel)          │
│    - hodinari aliasy (104)       │
│    - style guide (clanky-konvence)│
│    - soupis index (396 obcí)     │
└─────────────────────────────────┘
```

### Auth: Cloudflare Access (already in place)

Sveltia admin je už chráněný CF Access (OTP email). Editor musí být
v allow-list groupě. Stejná auth gate platí pro `/api/ai/*` — bez
session se nepustíš ke kvótě.

### System prompt struktura

```
Jsi AI asistent Hodinária — webové expozice Českého spolku
horologického.

[CSH stylistický manuál — 200 tokens, ze skill clanky-konvence]
- Píšeš formálně cs, vyhýbáš se anglicismům.
- "balanc" → "setrvačka", "vlasová pružinka" → "vlásek".
- Citace přes Zotero bibKey.
- ...

[Slovník — 1500 tokens, kompaktní cs/de/en/fr tabulka]
| cs slug | cs heslo | de | en | fr | definice (1 věta) |
| setrvacka | setrvačka | Unruhe | balance wheel | balancier | ... |
| ...

[Hodinari aliasy — 1000 tokens]
| slug | jméno | obdobi | aliasy |
| vaclav-krecmer | Václav Krečmer | 1850–1903 | Krečmer, Krecmer, Wenzel Kretschmer |
| ...

[Soupis index — 500 tokens, jen obce s počtem záznamů]
Praha (24), Sušice (3), Vimperk (2), ...
```

Total system prompt: **~3K tokens**, cached → opakované volání levně.

## PBI roadmap

### AI-1: Cloudflare AI Gateway setup (~2 h)

- Vytvořit AI Gateway v CF dashboardu (zdarma)
- Konfigurace: 7-day cache, rate limit 60/min/IP, fallback Sonnet→Haiku
- Test echo přes `wrangler` z localu

### AI-2: System prompt builder (~3 h)

- Skript `scripts/build-ai-system-prompt.mjs`
- Output: `apps/hodinarium-eu/src/data/ai-system-prompt.txt`
- Sources: slovnik + hodinari + skill `clanky-konvence` + soupis obcí
- Idempotentní rebuild při content commit (CI workflow)

### AI-3: API endpoints (~5 h)

Cloudflare Pages Functions:
- `/api/ai/suggest` (auto-complete, streaming SSE)
- `/api/ai/chat` (multi-turn, SSE)
- `/api/ai/lint` (terminologie, JSON response)
- `/api/ai/citation-suggest` (semantic search nad references)

Common: AI Gateway proxy, system prompt injection, CF Access auth check.

### AI-4: Sveltia inline auto-complete widget (~6 h)

- Inject script v `admin/index.html`
- Hook do textarea / contenteditable, debounce 800 ms
- Ghost-text overlay (CSS `::after` s sub-rgba color)
- Tab/Esc keybindings
- Loading indicator

### AI-5: Sveltia sidebar chat panel (~5 h)

- Floating panel vpravo, collapsible
- Multi-turn UI (markdown render výstupů)
- Quick-action chips: „přelož do DE", „zkontroluj fakta", „napiš perex"

### AI-6: Lint integration (~3 h)

- Po Save (Sveltia event hook) zavolat `/api/ai/lint`
- Sidebar widget s warnings + diff preview
- „Přijmout všechny" / „Odmítnout" tlačítka

### AI-7: Citation suggester (~4 h)

- Po napsání odstavce → embed query → semantic search nad
  references.json (existing endpoint `/api/search/semantic`) →
  AI rerank top 5 → návrh
- Integrace s existing ISO 690 pipeline

### AI-8: Cost monitoring + rate limiting per editor (~2 h)

- AI Gateway telemetrie
- Dashboard widget pro maintainera (kdo kolik calls / měsíc)
- Per-editor rate limit (např. 200 calls/měsíc, opt-in víc)

### AI-9: Dokumentace pro editory (~2 h)

- `docs/cms-editor-handbook.md` rozšíření
- Screenshoty UI
- Privacy poznámka (data jdou Anthropic — disclosure)

**Total estimated effort:** ~32 h ≈ 4 working days

## Otevřené otázky

1. **Anthropic API key handling** — secret v Cloudflare Pages env
   vars, **nikdy v repu**. Rotace: ručně každých 90 dní.
2. **Privacy** — editorův text jde Anthropic. Disclosure v editor
   handbook + opt-out flag (per-editor preference: „NE-používej AI").
3. **Model versioning** — kdy upgradovat z Sonnet 4.5 → 5.0? Drift
   v promptech, regression testing? Volitelně: snapshot test (pin
   modelu na konkrétní verzi do `.env`).
4. **Coexistence se A.13 hunspell** — spell-checker je per-token
   pravopis, AI lint je kontextový. Doplňky, ne overlap. Hunspell
   inline real-time, AI async po pause psaní (~800 ms debounce).
5. **Cache invalidace** — když se mění slovník, cached suggestions
   z předchozí verze jsou stale. AI Gateway cache key obsahuje
   prompt hash → změna system prompt = automatický cache miss.
   Acceptable.
6. **Response time SLA** — pro inline UC-A musí být < 1 s end-to-end
   (jinak editor přestal psát). Streaming SSE první token < 500 ms
   (Anthropic typicky ~300 ms). AI Gateway přidá ~50 ms.

## Migrace V1 → V2

Inkrementální:

1. V1: Workers AI Llama 8B, jen `/api/ai/lint` + `/api/ai/citation-suggest`.
   Frontend identický (Sveltia widget). 0 Kč.
2. V2 add-on: `/api/ai/suggest` + `/api/ai/chat` přes Sonnet 4.5.
   Backend swap behind same API, frontend beze změny.

Žádný hard cut — V1 endpointy zůstávají Workers AI dokud V2 quality
nepřebije.

## Kontext / odkazy

- Cloudflare AI Gateway: <https://developers.cloudflare.com/ai-gateway/>
- Anthropic prompt caching: <https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching>
- Workers AI models: <https://developers.cloudflare.com/workers-ai/models/>
- Existing semantic search: `/api/search/semantic` v hodinarium-eu
  (already uses Workers AI bge-m3)

---

**Implementace nezačne, dokud uživatel nezadá explicit signál.**
Sister projekty: A.12 (MCP server) sdílí systém prompt + slovník
context, A.13 (hunspell spell-checker) je doplněk, ne overlap.
Pořadí pustit: nejdřív A.13 (zdarma, samostatný value), pak A.14
(přidaný value, ale paid).
