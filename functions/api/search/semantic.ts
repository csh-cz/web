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

/** Embed query přes Workers AI bge-m3. Vrací 1024-dim Float32Array. */
async function embedQuery(env: Env, q: string): Promise<Float32Array> {
  const out = await env.AI.run('@cf/baai/bge-m3', { text: q });
  if (!out.data || !out.data[0]) {
    throw new Error('Embedding response missing data');
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
      JSON.stringify({ query: q, took_ms: 0, total: 0, results: [] } satisfies SearchResponse),
      { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } },
    );
  }

  try {
    // Parallel: load index + embed query (oba potřebné, nezávislé).
    const [{ records, generatedAt }, qVec] = await Promise.all([
      loadIndex(context.env, context.request),
      embedQuery(context.env, q),
    ]);

    // Skóre + filter + sort. Pro 1000 records je to <10ms — neoptimalizujeme.
    const scored: SearchResult[] = [];
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
    const results = scored.slice(0, limit);

    const body: SearchResponse = {
      query: q,
      took_ms: Date.now() - t0,
      total: scored.length,
      results,
    };

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        // Stejný query → stejný výsledek (dokud se nezmění index). 5 min
        // browser cache + edge cache.
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        'X-Index-Generated-At': generatedAt,
      },
    });
  } catch (err) {
    console.error('semantic search error', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } },
    );
  }
};
