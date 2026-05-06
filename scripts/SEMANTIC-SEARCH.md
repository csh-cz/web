# Sémantické vyhledávání — setup a provoz

## Architektura

```
content/{hodinarium-eu,hodinari,soupis-veznich-hodin,kronika}
    ↓ extract-search-corpus.mjs
.semantic-corpus.json (1008 docs, 1.1 MB, gitignored)
    ↓ build-semantic-index.mjs (CF Workers AI bge-m3, batch=50)
public/search/semantic-index.json (1024-dim float32 base64, ~5 MB)
    ↓ deploy
[user query] → /api/search/semantic?q=… (Pages Function)
    ↓ env.AI.run('@cf/baai/bge-m3', { text: q })
    ↓ in-memory cosine similarity nad indexem (cached v V8 isolate)
[top N results] → SearchModal.astro „Sémanticky" tab
```

**Model:** `@cf/baai/bge-m3`

- Multilingvální (silná podpora češtiny vč. flexí)
- 1024 dim, L2-normalized output → dot product ≡ cosine
- Max input 8192 tokens; my používáme ~1500 tokens / dokument
- Free tier 10 000 neuron-actions / day — pro nás dost

**Index velikost:** 1008 docs × 1024 dims × 4 bytes (float32, base64-packed)
≈ 5 MB. Static asset v `public/search/`. Pages Function ho fetchne přes
fetch s `cf: { cacheEverything: true }` a drží v V8 isolate (cold start
~200 ms, warm <1 ms).

## Setup (jednorázový)

1. **Cloudflare API token** — v dashu → My Profile → API Tokens →
   Create Token → Custom token:
   - Permission: `Workers AI: Read`
   - Account scope: tvůj Cloudflare account
   - TTL: 1 rok (nebo bez expirace pro dev)
2. **Account ID** — dash → Workers & Pages → Overview → sidebar.
3. **Lokálně:**
   ```bash
   export CLOUDFLARE_API_TOKEN=...
   export CLOUDFLARE_ACCOUNT_ID=...
   pnpm search:rebuild  # extract + embed
   ```
4. **Cloudflare Pages** — dash → Pages → hodinarium-eu → Settings →
   Functions → Bindings → AI → binding name: `AI`. (`wrangler.toml`
   už má `[ai]` blok pro lokální `wrangler pages dev` flow.)

## Workflow

**Po nové akvizici / přepsání článku:**

```bash
pnpm search:rebuild
git add apps/hodinarium-eu/public/search/semantic-index.json
git commit -m "search: rebuild semantic index"
```

`build-semantic-index.mjs` má cache podle text-hash. Re-run po malé
změně (přidání 1 článku) udělá 1 API call místo 1008. Při změně modelu
nebo struktury textu se cache invaliduje automaticky.

**Náklady:**

- Workers AI free tier: 10k neuron-actions/day. Jeden bge-m3 embedding
  ≈ 1 neuron-action. Plný rebuild = 1008 calls = vejde se s rezervou.
- Query traffic: každý dotaz = 1 neuron-action. 1000 dotazů/den je free.

**Limity:**

- Max input 8192 tokens — náš `MAX_BODY_CHARS = 3000` znaků (~750 tokens)
  s velkou rezervou. Pro články s plnotextovým fulltext mohu zvýšit.
- Index recompile při každé úpravě textu — pokud chceme inkrementální
  s commit hooks, lze přidat do `validate:content` pipeline.

## Troubleshooting

**"CF AI 401: Authentication error"**
→ Token expiroval / je špatně scoped. Token musí mít `Workers AI: Read`.

**"Index fetch failed: 404" v Pages Function**
→ `public/search/semantic-index.json` nebyl commitnutý / nedeploynutý.
   Zkontroluj `git ls-files | grep semantic-index`.

**Sémantické výsledky vypadají podivně / nesouvisí**
→ Zkus `min_score=0.55` v query (default 0.45). Nebo se reindexuj
   (rebuild po změně textu).

**„Workers AI binding not found" v Pages Function**
→ V dashu chybí AI binding. Settings → Functions → Bindings → Add → AI.

## Future work

- **Cloudflare Vectorize** místo static JSON: rychlejší pro >10k
  dokumentů, ale prohne setup. Free tier 30M dim/month.
- **Hybrid ranking**: sémantické skóre + BM25 keyword skóre kombinovat
  pro lepší recall na exact-match dotazy (jména, inv. č.).
- **Chunking**: aktuálně 1 vector / dokument. Pro články >3000 chars by
  pomohlo rozdělit na 500-token chunky a hledat na úrovni passage.
