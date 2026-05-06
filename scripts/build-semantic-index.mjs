#!/usr/bin/env node
/**
 * build-semantic-index.mjs
 *
 * Pro každý záznam v `.semantic-corpus.json` vyrobí embedding přes
 * Cloudflare Workers AI (REST API) a uloží sjednocený index do
 * `apps/hodinarium-eu/public/search/semantic-index.json`.
 *
 * Model: @cf/baai/bge-m3
 *   - 1024 dims, multi-lingual (incl. CS)
 *   - max input 8192 tokens
 *   - vrací unit-normalized vektory → lze použít prostý dot-product místo
 *     full cosine similarity
 *
 * Vstup ENV:
 *   CLOUDFLARE_API_TOKEN  — Workers AI scoped token (Read AI runs)
 *   CLOUDFLARE_ACCOUNT_ID — account id (32-hex)
 *
 * Výstup struktur:
 *   {
 *     model: '@cf/baai/bge-m3',
 *     dim: 1024,
 *     records: Array<{
 *       id, url, collection, category, title, summary, tags, year, thumbnail,
 *       v: Float32Array packed jako base64 (1024 * 4 = 4096 bytes → 5460 base64 chars)
 *     }>
 *   }
 *
 * Float32 → base64 packing šetří 70% velikosti vůči JSON čísla
 * (1024 čísel à ~9 chars = 9KB / record vs 5KB / record packed).
 *
 * Inkrementální cache: pokud existuje předchozí index, znovu nepoužije
 * embedding pro záznamy, které mají stejný `text` hash. Ušetří API
 * volání při běžných editech (přidání 1 článku → 1 nový embedding,
 * 1007 cached).
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CORPUS_PATH = join(ROOT, 'apps/hodinarium-eu/.semantic-corpus.json');
const OUT_DIR = join(ROOT, 'apps/hodinarium-eu/public/search');
const OUT_PATH = join(OUT_DIR, 'semantic-index.json');

const MODEL = '@cf/baai/bge-m3';
const DIM = 1024;
const BATCH_SIZE = 50; // CF API limit per request

const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;

if (!TOKEN || !ACCOUNT_ID) {
  console.error('CLOUDFLARE_API_TOKEN a CLOUDFLARE_ACCOUNT_ID musí být nastaveny.');
  console.error('Token: https://dash.cloudflare.com/profile/api-tokens — scope "Workers AI: Read".');
  console.error('Account ID: dash → Workers & Pages → Overview (sidebar).');
  process.exit(1);
}

const API_URL = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${MODEL}`;

/** Sestaví text pro embedding ze záznamu. Pořadí: title (důraz na vstup),
 *  tags (boost matching), summary, body. Limit ~6000 char (~1500 token). */
function buildText(rec) {
  const parts = [
    rec.title,
    rec.tags?.length ? `Tagy: ${rec.tags.join(', ')}` : '',
    rec.summary,
    rec.body,
  ].filter(Boolean);
  return parts.join('\n\n').slice(0, 6000);
}

/** Stable text hash pro inkrementální cache. */
function textHash(s) {
  return createHash('sha256').update(s).digest('base64').slice(0, 16);
}

/** Float32Array → base64 (Node Buffer). */
function packVector(arr) {
  const f32 = new Float32Array(arr);
  return Buffer.from(f32.buffer).toString('base64');
}

/** Načte předchozí index pokud existuje (cache). */
function loadCache() {
  if (!existsSync(OUT_PATH)) return new Map();
  try {
    const prev = JSON.parse(readFileSync(OUT_PATH, 'utf8'));
    if (prev.model !== MODEL) return new Map();
    const map = new Map();
    for (const r of prev.records ?? []) {
      if (r.id && r.h && r.v) map.set(r.id, { hash: r.h, v: r.v });
    }
    return map;
  } catch {
    return new Map();
  }
}

/** Volá CF Workers AI batch — vrací Array<number[]> embeddings. */
async function embedBatch(texts) {
  const r = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: texts }),
  });
  if (!r.ok) {
    const body = await r.text().catch(() => '');
    throw new Error(`CF AI ${r.status}: ${body.slice(0, 500)}`);
  }
  const j = await r.json();
  if (!j.success) {
    throw new Error(`CF AI failed: ${JSON.stringify(j.errors)}`);
  }
  // Response shape: { result: { shape: [n, 1024], data: [[...1024], ...] } }
  return j.result.data;
}

async function main() {
  if (!existsSync(CORPUS_PATH)) {
    console.error(`Korpus nenalezen — spusť nejdřív 'node scripts/extract-search-corpus.mjs'.`);
    process.exit(1);
  }

  const corpus = JSON.parse(readFileSync(CORPUS_PATH, 'utf8'));
  const cache = loadCache();
  console.log(`Načteno ${corpus.length} záznamů, ${cache.size} v cache.`);

  // Příprava: pro každý záznam si připravíme text + hash, rozdělíme na cached/todo.
  const items = corpus.map((rec) => {
    const text = buildText(rec);
    const hash = textHash(text);
    const cached = cache.get(rec.id);
    return {
      rec,
      text,
      hash,
      cachedV: cached && cached.hash === hash ? cached.v : null,
    };
  });

  const todo = items.filter((i) => !i.cachedV);
  console.log(`Cache hit: ${items.length - todo.length}/${items.length}.`);
  console.log(`Embedding ${todo.length} nových/změněných záznamů…`);

  // Batch embed
  let done = 0;
  for (let i = 0; i < todo.length; i += BATCH_SIZE) {
    const batch = todo.slice(i, i + BATCH_SIZE);
    const texts = batch.map((b) => b.text);
    let vectors;
    try {
      vectors = await embedBatch(texts);
    } catch (err) {
      console.error(`Batch ${i / BATCH_SIZE + 1} failed:`, err.message);
      throw err;
    }
    for (let j = 0; j < batch.length; j++) {
      batch[j].cachedV = packVector(vectors[j]);
    }
    done += batch.length;
    process.stdout.write(`\r  Progress: ${done}/${todo.length}`);
  }
  if (todo.length) process.stdout.write('\n');

  // Sestavit final index
  const records = items.map(({ rec, hash, cachedV }) => ({
    id: rec.id,
    u: rec.url,
    c: rec.collection,
    cat: rec.category,
    t: rec.title,
    s: rec.summary?.slice(0, 200) ?? '',
    g: rec.tags ?? [],
    y: rec.year,
    th: rec.thumbnail,
    h: hash,
    v: cachedV,
  }));

  const out = {
    model: MODEL,
    dim: DIM,
    generatedAt: new Date().toISOString(),
    records,
  };

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(out));
  const sizeKB = Math.round(JSON.stringify(out).length / 1024);
  console.log(`\nWritten: ${OUT_PATH}`);
  console.log(`Size: ${sizeKB} KB (${records.length} records, ${DIM}-dim float32 base64-packed)`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
