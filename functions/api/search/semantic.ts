/**
 * GET /api/search/semantic?q=<text>&limit=10&collection=karta,clanek
 *
 * Sémantické vyhledávání nad statickým bge-m3 indexem.
 *
 * Pipeline:
 *   1. Query string → embedding přes env.AI Workers AI binding (bge-m3).
 *   2. Načte static index `/search/semantic-index.json` (cached v isolate).
 *   3. Spočítá dot product (bge-m3 vrací L2-normalized vektory → dot ≡ cos).
 *   4. Top-N s threshold filtering, volitelný collection filter.
 *
 * Response: { query, took_ms, total, results: Array<{...}> }
 *
 * Cache:
 *   - Index načten 1× per V8 isolate (in-memory cache `INDEX_CACHE`).
 *   - Cloudflare Cache API se nepoužívá pro response — query embeddings
 *     mají vysokou variabilitu, cache hit-rate by byl nízký.
 *   - Možné rozšíření: KV-cached query → results pro top 100 dotazů.
 */

interface IndexRecord {
  id: string;
  u: string;        // url
  c: string;        // collection
  cat?: string;     // category (clanky podsekce)
  t: string;        // title
  s: string;        // summary (truncated to 200ch)
  g: string[];      // tags
  y?: number;       // year
  th?: string;      // thumbnail
  h: string;        // text hash
  v: string;        // base64-packed Float32Array (1024 dims)
}

interface IndexFile {
  model: string;
  dim: number;
  generatedAt: string;
  records: IndexRecord[];
}

interface ParsedRecord {
  id: string;
  url: string;
  collection: string;
  category?: string;
  title: string;
  summary: string;
  tags: string[];
  year?: number;
  thumbnail?: string;
  vec: Float32Array;
}

interface Env {
  AI: {
    run(model: string, input: { text: string | string[] }): Promise<{ data?: number[][]; shape?: number[] }>;
  };
  ASSETS: { fetch(req: Request): Promise<Response> };
}

// In-memory cache index per V8 isolate. Cloudflare Workers V8 isolates
// jsou drženy mezi requesty na warm — index načteme 1× a držíme dokud
// není evicted. Cold start = 1 fetch + 1 parse (~200ms pro 4 MB JSON).
let INDEX_CACHE: { records: ParsedRecord[]; generatedAt: string } | null = null;

/** Decode base64 → Float32Array. atob v workers runtime + nový Float32Array buffer. */
function unpackVector(b64: string, dim: number): Float32Array {
  const bin = atob(b64);
  const buf = new ArrayBuffer(bin.length);
  const u8 = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return new Float32Array(buf, 0, dim);
}

async function loadIndex(env: Env, request: Request): Promise<{ records: ParsedRecord[]; generatedAt: string }> {
  if (INDEX_CACHE) return INDEX_CACHE;

  // Načteme přes ASSETS binding — tj. ze stejné Pages site, ne z externu.
  // URL musí být absolutní v rámci site domény. Use request.url origin.
  const origin = new URL(request.url).origin;
  const r = await fetch(`${origin}/search/semantic-index.json`, {
    cf: { cacheEverything: true, cacheTtl: 3600 },
  });
  if (!r.ok) {
    throw new Error(`Index fetch failed: ${r.status}`);
  }
  const idx = (await r.json()) as IndexFile;
  const dim = idx.dim ?? 1024;
  const parsed: ParsedRecord[] = idx.records.map((r) => ({
    id: r.id,
    url: r.u,
    collection: r.c,
    category: r.cat,
    title: r.t,
    summary: r.s,
    tags: r.g ?? [],
    year: r.y,
    thumbnail: r.th,
    vec: unpackVector(r.v, dim),
  }));
  INDEX_CACHE = { records: parsed, generatedAt: idx.generatedAt };
  return INDEX_CACHE;
}

/** Typed error pro situace, kdy semantic flow nemůže pokračovat,
 *  ale fulltext fallback dává smysl. Zahrnuje:
 *   - 'quota'    — Workers AI vrátil 429 / kvóta exhausted (3036/3040/7003)
 *   - 'binding'  — env.AI binding není v Pages projektu nakonfigurovaný
 *                  (admin musí přidat AI binding v dashboardu)
 *   - 'unknown'  — jiná Workers AI chyba (network, internal)
 *
 *  Volající (handler) catchne tuto třídu a spadne na fulltext s
 *  human-friendly bannerem podle .reason.
 */
class AIFallbackError extends Error {
  readonly reason: 'quota' | 'binding' | 'unknown';
  constructor(reason: 'quota' | 'binding' | 'unknown', msg: string) {
    super(msg);
    this.reason = reason;
  }
}

async function embedQuery(env: Env, q: string): Promise<Float32Array> {
  // Když AI binding není v Pages config (admin nepřidal v dashboardu),
  // env.AI je undefined → `env.AI.run` by hodil "Cannot read properties
  // of undefined". Catchni preventivně pro lepší error reporting.
  if (!env.AI || typeof env.AI.run !== 'function') {
    throw new AIFallbackError('binding',
      'env.AI binding chybí — přidej v Pages dashboard: Settings → Functions → Bindings → AI');
  }

  let out;
  try {
    out = await env.AI.run('@cf/baai/bge-m3', { text: q });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/429|rate.?limit|quota|exhaust|neuron|3036|3040|7003/i.test(msg)) {
      throw new AIFallbackError('quota', `AI quota: ${msg}`);
    }
    throw new AIFallbackError('unknown', msg);
  }
  if (!out.data || !out.data[0]) {
    throw new AIFallbackError('unknown', 'Embedding response missing data');
  }
  return new Float32Array(out.data[0]);
}

/** Dot product Float32Array × Float32Array. Pro L2-normalized vektory
 *  je to ekvivalent cosine similarity (rychlejší — bez sqrt). */
function dot(a: Float32Array, b: Float32Array): number {
  let s = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) s += a[i] * b[i];
  return s;
}

// ─── Fulltext fallback ────────────────────────────────────────────────
// Když Workers AI selže (429 / kvóta), spadneme na server-side keyword
// term scoring nad indexem v paměti. Není to BM25 ani semantic, ale
// pokrývá scénář „aspoň něco vrátit než ukázat 500".
//
// Strategie:
//   1. NFD-normalizovaná query → tokeny (≥2 chars, lowercase, bez diakritiky)
//   2. Pro každý record stejně NFD-normalizuj title + tags + summary
//   3. Score = Σ (title_hits × 3 + tag_hits × 2 + summary_hits × 1)
//   4. Bonus za exact phrase match v titulu (+5)
//   5. Sort, vrátit top N (bez minScore — fulltext threshold je 1+)
//
// Pro češtinu: NFD strip-uje diakritiku ("Prokeš" → "prokes"), takže
// query bez háčků najde i diakritizovaný obsah a naopak.

/** NFD strip + lowercase. */
function fold(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Extrahuje ≥2-znak tokeny. Strip-uje interpunkci, čísla zachovává
 *  (jména typu „1868" jsou validní search term). */
function tokenize(s: string): string[] {
  return fold(s)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2);
}

/** Spočítá kolikrát se každý token z `queryTokens` vyskytuje v `text`. */
function countMatches(textFolded: string, queryTokens: string[]): number {
  let n = 0;
  for (const t of queryTokens) {
    // Whole-word match (boundary). Rychlejší než regex per-iteration.
    let from = 0;
    while (true) {
      const idx = textFolded.indexOf(t, from);
      if (idx < 0) break;
      const before = idx === 0 || !/[a-z0-9]/.test(textFolded[idx - 1]);
      const after = idx + t.length === textFolded.length || !/[a-z0-9]/.test(textFolded[idx + t.length]);
      if (before && after) n++;
      from = idx + t.length;
    }
  }
  return n;
}

function fulltextSearch(records: ParsedRecord[], q: string): SearchResult[] {
  const tokens = tokenize(q);
  if (tokens.length === 0) return [];
  const qFolded = fold(q.trim());

  const scored: SearchResult[] = [];
  for (const r of records) {
    const titleFolded = fold(r.title);
    const tagsFolded = r.tags.length ? fold(r.tags.join(' ')) : '';
    const summaryFolded = r.summary ? fold(r.summary) : '';

    const titleHits = countMatches(titleFolded, tokens);
    const tagHits = tagsFolded ? countMatches(tagsFolded, tokens) : 0;
    const summaryHits = summaryFolded ? countMatches(summaryFolded, tokens) : 0;
    let score = titleHits * 3 + tagHits * 2 + summaryHits;
    if (score === 0) continue;
    // Phrase bonus: exact query string v titulu.
    if (qFolded.length >= 4 && titleFolded.includes(qFolded)) score += 5;

    scored.push({
      id: r.id,
      url: r.url,
      collection: r.collection,
      category: r.category,
      title: r.title,
      summary: r.summary,
      tags: r.tags,
      year: r.year,
      thumbnail: r.thumbnail,
      score,
    });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored;
}

interface SearchResult {
  id: string;
  url: string;
  collection: string;
  category?: string;
  title: string;
  summary: string;
  tags: string[];
  year?: number;
  thumbnail?: string;
  score: number;
}

interface SearchResponse {
  query: string;
  /** Skutečný režim, kterým se výsledky získaly:
   *  - 'semantic' (default) — Workers AI bge-m3 + cosine similarity
   *  - 'fulltext' — fallback po vyčerpání AI quota (429) nebo jiné AI chybě.
   *    Score se mění významem: dot product vs term-match count. */
  mode: 'semantic' | 'fulltext';
  /** Když mode='fulltext', volitelný human-readable důvod fallbacku.
   *  Frontend ho může zobrazit jako informativní banner. */
  fallback_reason?: string;
  took_ms: number;
  total: number;
  results: SearchResult[];
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const t0 = Date.now();
  const url = new URL(context.request.url);
  const q = (url.searchParams.get('q') ?? '').trim();
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit') ?? 10)));
  const collectionFilter = url.searchParams.get('collection');
  const allowedCollections = collectionFilter
    ? new Set(collectionFilter.split(',').map((s) => s.trim()))
    : null;
  const minScore = Number(url.searchParams.get('min_score') ?? 0.45);

  if (!q || q.length < 2) {
    return new Response(
      JSON.stringify({ query: q, mode: 'semantic', took_ms: 0, total: 0, results: [] } satisfies SearchResponse),
      { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } },
    );
  }

  // Index potřebujeme vždy (pro semantic i pro fulltext fallback).
  let indexBundle;
  try {
    indexBundle = await loadIndex(context.env, context.request);
  } catch (err) {
    console.error('index load failed', err);
    return new Response(
      JSON.stringify({ error: 'Index nedostupný — pravděpodobně neproběhl `pnpm search:rebuild`.' }),
      { status: 503, headers: { 'Content-Type': 'application/json; charset=utf-8' } },
    );
  }
  const { records, generatedAt } = indexBundle;

  // Pokus 1: sémantické vyhledávání. Když Workers AI 429 / quota chyba,
  // spadneme na fulltext nad stejným indexem (records jsou už načtené).
  let mode: 'semantic' | 'fulltext' = 'semantic';
  let fallbackReason: string | undefined;
  let scored: SearchResult[] = [];

  try {
    const qVec = await embedQuery(context.env, q);
    for (const r of records) {
      if (allowedCollections && !allowedCollections.has(r.collection)) continue;
      const score = dot(qVec, r.vec);
      if (score < minScore) continue;
      scored.push({
        id: r.id,
        url: r.url,
        collection: r.collection,
        category: r.category,
        title: r.title,
        summary: r.summary,
        tags: r.tags,
        year: r.year,
        thumbnail: r.thumbnail,
        score,
      });
    }
    scored.sort((a, b) => b.score - a.score);
  } catch (err) {
    if (err instanceof AIFallbackError) {
      // Známý fail → spadni do fulltext bez 5xx, s reason-specific bannerem.
      console.warn(`AI fallback (${err.reason}):`, err.message);
      mode = 'fulltext';
      switch (err.reason) {
        case 'binding':
          fallbackReason = 'Sémantické vyhledávání zatím není zprovozněné — používám fulltext.';
          break;
        case 'quota':
          fallbackReason = 'AI měsíční kvóta vyčerpaná — používám fulltext vyhledávání.';
          break;
        default:
          fallbackReason = 'Sémantické vyhledávání dočasně nedostupné — používám fulltext.';
      }
      const filtered = allowedCollections
        ? records.filter((r) => allowedCollections.has(r.collection))
        : records;
      scored = fulltextSearch(filtered, q);
    } else {
      console.error('semantic search error', err);
      return new Response(
        JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
        { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } },
      );
    }
  }

  const results = scored.slice(0, limit);
  const body: SearchResponse = {
    query: q,
    mode,
    fallback_reason: fallbackReason,
    took_ms: Date.now() - t0,
    total: scored.length,
    results,
  };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // Stejný query → stejný výsledek (dokud se nezmění index). 5 min
      // browser/edge cache. U fulltext fallbacku snížená TTL — kvóta se
      // může za hodinu obnovit, nechceme držet fallback výsledky dlouho.
      'Cache-Control': mode === 'fulltext'
        ? 'public, max-age=60, s-maxage=60'
        : 'public, max-age=300, s-maxage=300',
      'X-Index-Generated-At': generatedAt,
      'X-Search-Mode': mode,
    },
  });
};
