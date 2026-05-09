/**
 * POST /api/ai/suggest — AI inline auto-complete pro Sveltia editor.
 *
 * Body:
 *   {
 *     text: string,         // celý kontext (cca posledních 500 znaků před kurzorem)
 *     mode?: 'continue'     // default — navrhne pokračování věty/odstavce
 *           | 'rewrite',    // přepíše vybranou pasáž (V2)
 *     limit?: number        // max tokens output (default 80)
 *   }
 *
 * Response: { suggestion: string, model: string, took_ms: number }
 *           Status 503 + { error, reason } pokud AI quota / binding fail.
 *
 * Auth: Cloudflare Access — admin/* je už chráněný (OTP email allow-list).
 *       Stejný Access policy pokrývá /api/ai/* (pages projekt level).
 *
 * Backend detection (priorita):
 *   1. **Ollama** — pokud `env.OLLAMA_URL` set (typicky lokální dev,
 *      `.dev.vars: OLLAMA_URL=http://localhost:11434`). Volá Ollama
 *      OpenAI-compatible `/v1/chat/completions` endpoint.
 *      Model: env.OLLAMA_MODEL ?? 'llama3.2:3b'.
 *   2. **Workers AI** — production fallback, env.AI binding.
 *      Model: @cf/mistralai/mistral-small-3.1-24b-instruct (cs OK,
 *      ~$0.11/M input, 10k neurons/day free = ~280 calls/day).
 *
 * Lokální dev s Ollama:
 *   - `brew install ollama` (mac) nebo https://ollama.com
 *   - `ollama pull llama3.2:3b` (~2 GB) nebo `ollama pull qwen2.5:7b`
 *   - `ollama serve` (default localhost:11434)
 *   - Repo root `.dev.vars`: OLLAMA_URL=http://localhost:11434
 *   - `pnpm exec wrangler pages dev apps/hodinarium-eu/dist`
 *   → 0 Kč, 0 latence sítě, plná privacy.
 *
 * System prompt: minimal slovník (top 30 hesel) + style guide. Plný
 *        slovník (~3K tokens) by zabral 60 % kontext window — zatím
 *        bez. AI Gateway prompt cache by mohl pomoci.
 */

interface Env {
  AI: {
    run(model: string, input: unknown): Promise<{ response?: string; result?: { response?: string } }>;
  };
  /** Lokální dev override — pokud nastaveno, volá Ollama API místo Workers AI.
   *  Typicky `http://localhost:11434` (default Ollama port). */
  OLLAMA_URL?: string;
  /** Ollama model name (default `llama3.2:3b`). Doporučeno pro češtinu:
   *  llama3.2:3b (rychlý), qwen2.5:7b (lepší cs), mistral-nemo:12b (nejlepší). */
  OLLAMA_MODEL?: string;
}

interface SuggestRequest {
  text?: string;
  mode?: 'continue' | 'rewrite';
  limit?: number;
}

interface SuggestResponse {
  suggestion: string;
  model: string;
  took_ms: number;
}

/** System prompt — kompaktní, pod 1K tokens. Plný slovník je v MCP
 *  serveru (A.12); tady jen klíčové hodinářské termíny + style. */
const SYSTEM_PROMPT = `Jsi pomocník editora hodinářského webu Hodinárium.

Tvůj úkol: navrhni krátké pokračování textu (1–3 věty, max 80 slov).

Pravidla:
1. Píšeš formálně česky, vyhýbáš se anglicismům.
2. Hodinářská terminologie:
   - „balanc" → „setrvačka"
   - „vlasová pružinka" → „vlásek"
   - „kotvový krok" je OK, „escapement" ne
   - „krokové kolo" (Hemmrad), ne „kotvové kolo"
3. Zachováváš tón originálu (formální popis, narativ, technický výklad).
4. Když si nejsi jistý faktem, neuváděj konkrétní datum/jméno/místo.
5. Vrátíš JEN navrhované pokračování textu. Bez úvodu, bez vysvětlení,
   bez kódových bloků, bez stejných úvodních slov.

Příklad:
Vstup: „Krokové kolo s 30 zuby zabírá s kotvou Grahamova kroku, "
Výstup: „což je nejstarší volně oscilující typ úniku používaný v přesných hodinách 18. století."`;

const WORKERS_AI_MODEL = '@cf/mistralai/mistral-small-3.1-24b-instruct';
const OLLAMA_DEFAULT_MODEL = 'llama3.2:3b';

class AIFallbackError extends Error {
  readonly reason: 'quota' | 'binding' | 'unknown';
  constructor(reason: 'quota' | 'binding' | 'unknown', msg: string) {
    super(msg);
    this.reason = reason;
  }
}

/** Ollama OpenAI-compatible chat completion call. */
async function generateOllama(env: Env, text: string, limit: number): Promise<{ suggestion: string; model: string }> {
  const baseUrl = env.OLLAMA_URL!.replace(/\/+$/, '');
  const model = env.OLLAMA_MODEL ?? OLLAMA_DEFAULT_MODEL;
  const userPrompt = `Pokračování tohoto textu (jen samotné pokračování, bez úvodu, max ${limit} slov):

${text}`;
  const r = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: limit,
      temperature: 0.4,
      stream: false,
    }),
  });
  if (!r.ok) {
    const body = await r.text().catch(() => '');
    throw new AIFallbackError('unknown', `Ollama HTTP ${r.status}: ${body.slice(0, 200)}`);
  }
  const data = (await r.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const suggestion = data.choices?.[0]?.message?.content?.trim() ?? '';
  if (!suggestion) {
    throw new AIFallbackError('unknown', 'Ollama vrátila prázdnou response');
  }
  return { suggestion, model: `ollama:${model}` };
}

/** Cloudflare Workers AI call. */
async function generateWorkersAI(env: Env, text: string, limit: number): Promise<{ suggestion: string; model: string }> {
  if (!env.AI || typeof env.AI.run !== 'function') {
    throw new AIFallbackError('binding',
      'env.AI binding chybí — přidej v Pages dashboard: Settings → Functions → Bindings → AI. ' +
      'Nebo nastav OLLAMA_URL pro lokální dev.');
  }

  const userPrompt = `Pokračování tohoto textu (jen samotné pokračování, bez úvodu, max ${limit} slov):

${text}`;

  try {
    const out = await env.AI.run(WORKERS_AI_MODEL, {
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: limit,
      temperature: 0.4,
    });
    const suggestion = (out.response ?? out.result?.response ?? '').trim();
    if (!suggestion) {
      throw new AIFallbackError('unknown', 'Workers AI vrátila prázdnou response');
    }
    return { suggestion, model: WORKERS_AI_MODEL };
  } catch (err) {
    if (err instanceof AIFallbackError) throw err;
    const msg = err instanceof Error ? err.message : String(err);
    if (/429|rate.?limit|quota|exhaust|neuron|3036|3040|7003/i.test(msg)) {
      throw new AIFallbackError('quota', msg);
    }
    throw new AIFallbackError('unknown', msg);
  }
}

async function generateSuggestion(env: Env, text: string, limit: number): Promise<{ suggestion: string; model: string }> {
  // Prio: Ollama (lokálně) > Workers AI (prod)
  if (env.OLLAMA_URL) {
    return generateOllama(env, text, limit);
  }
  return generateWorkersAI(env, text, limit);
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const t0 = Date.now();
  let body: SuggestRequest;
  try {
    body = (await request.json()) as SuggestRequest;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }

  const text = (body.text ?? '').trim();
  if (text.length < 20) {
    return new Response(JSON.stringify({ error: 'Text too short (min 20 chars)' }), {
      status: 400,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }
  if (text.length > 4000) {
    return new Response(JSON.stringify({ error: 'Text too long (max 4000 chars)' }), {
      status: 400,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }

  const limit = Math.max(20, Math.min(200, body.limit ?? 80));

  try {
    const { suggestion, model } = await generateSuggestion(env, text, limit);
    const resp: SuggestResponse = {
      suggestion,
      model,
      took_ms: Date.now() - t0,
    };
    return new Response(JSON.stringify(resp), {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
      },
    });
  } catch (err) {
    if (err instanceof AIFallbackError) {
      return new Response(
        JSON.stringify({ error: err.message, reason: err.reason }),
        {
          status: 503,
          headers: { 'content-type': 'application/json; charset=utf-8' },
        },
      );
    }
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }
};

// Reject jiných metod
export const onRequest: PagesFunction = async () =>
  new Response(JSON.stringify({ error: 'Use POST' }), {
    status: 405,
    headers: { 'content-type': 'application/json; charset=utf-8', allow: 'POST' },
  });
