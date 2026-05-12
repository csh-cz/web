/**
 * POST /api/report-issue
 *
 * Editor-only endpoint: vytvoří GitHub Issue v repu webu z reportu chyby
 * vyplněného editorem v `<ReportIssueModal>`.
 *
 * Identita editora: čte `Cf-Access-Authenticated-User-Email` header, který
 * Cloudflare Access nastaví pro autentikované requesty. Cesta `/api/report-issue`
 * musí být v Access app coverage (stejná policy jako `/admin/*` + `/api/cms/*`).
 * Anonymní návštěvník dostane 401 — nikdy se nedostane na GitHub call.
 *
 * GitHub volání: REST API `POST /repos/{owner}/{repo}/issues` s Bearer PAT.
 * Token žije jen na serveru (env.GITHUB_TOKEN s fallbackem na GITHUB_BOT_PAT,
 * který už používá CMS proxy). Klient ho nikdy nevidí.
 *
 * Anti-spam:
 *   - honeypot pole `_url` (skryté CSS) — botům často vyplní all fields,
 *     human ho nechá prázdné
 *   - per-isolate rate limit (1 report / 30 s / editor email) — omezuje
 *     omylem dvojkliky a primitivní spam, není to defense-in-depth proti
 *     coordinated abuse (V8 isolaty se mohou rotovat)
 *   - placeholder pro Cloudflare Turnstile, viz TURNSTILE_SECRET_KEY
 *     komentář níže — pokud nasadíme, frontend pošle `cf-turnstile-response`
 *     a tady se ověří
 *
 * Validace vstupů:
 *   - description: required, 5–2000 znaků
 *   - problemType: jen z allowlistu PROBLEM_TYPES
 *   - url: max 500 znaků, musí být validní URL
 *   - pageTitle: max 200 znaků (volitelný)
 *   - userAgent: max 500 znaků (volitelný, pro debugging)
 *
 * Response:
 *   200 { ok: true, issue: { number, url } }
 *   400 { ok: false, error: 'human-friendly Czech message' }
 *   401 { ok: false, error: 'Vyžaduje přihlášení editora.' }
 *   429 { ok: false, error: 'Příliš mnoho zpráv …' }
 *   502 { ok: false, error: 'GitHub momentálně nedostupný.' }
 */

interface Env {
  /** Primary token name dle specifikace. Pokud není set, fallbackne na
   *  GITHUB_BOT_PAT (= stejný PAT používaný CMS proxy v /api/cms). */
  GITHUB_TOKEN?: string;
  GITHUB_BOT_PAT?: string;
  /** Owner part GitHub repu, např. "csh-cz". Default: parse z GITHUB_REPO. */
  GITHUB_OWNER?: string;
  /** "owner/repo" nebo jen "repo" (kombinuje s GITHUB_OWNER). Default: "csh-cz/web". */
  GITHUB_REPO?: string;
  /** Comma-separated labels pro každé issue. Default: "web-bug,editor-report". */
  GITHUB_DEFAULT_LABELS?: string;
  /** Volitelně: Cloudflare Turnstile secret. Pokud set, validujeme captcha. */
  TURNSTILE_SECRET_KEY?: string;
}

interface ReportPayload {
  url?: string;
  pageTitle?: string;
  problemType?: string;
  description?: string;
  /** Honeypot — musí být prázdné string, jinak je to bot. */
  _url?: string;
  /** Volitelný captcha token, pokud nasadíme Turnstile. */
  turnstileToken?: string;
}

const PROBLEM_TYPES: Record<string, string> = {
  'preklep': 'překlep / typografická chyba',
  'chybejici-info': 'chybějící nebo neúplná informace',
  'spatny-obrazek': 'špatný / chybějící obrázek',
  'technicka-chyba': 'technická chyba (rozbité odkazy, layout, …)',
  'metadata': 'chybná metadata (datum, autor, kategorie)',
  'duplicita': 'duplicita / sloučit s jiným záznamem',
  'dict-word': 'návrh do CSH spell-check slovníku (z context menu editoru)',
  'jine': 'jiné',
};

const MAX_DESC_LEN = 2000;
const MAX_URL_LEN = 500;
const MAX_TITLE_LEN = 200;
const MAX_UA_LEN = 500;
const MIN_DESC_LEN = 5;

// Per-isolate rate limit — nejprostší ochrana. V8 isolate má memory
// drženou mezi requesty, takže Map persistuje. Limit 30s mezi reporty
// per editor email. Není to silný anti-abuse (isolaty se rotují),
// ale pokrývá runaway klientské scripty / dvojkliky.
const RATE_LIMIT: Map<string, number> = new Map();
const RATE_LIMIT_MS = 30_000;

function getEditorEmailFromHeader(req: Request): string | null {
  return (
    req.headers.get('Cf-Access-Authenticated-User-Email') ??
    req.headers.get('cf-access-authenticated-user-email') ??
    null
  );
}

/**
 * Resolve editor email z requestu. Strategie:
 *
 *   1. Fast path: `Cf-Access-Authenticated-User-Email` header — funguje
 *      pokud `/api/report-issue` je v CF Access policy coverage.
 *   2. Fallback: proxy fetch /api/cms/auth/user s forward-nutými cookies.
 *      `/api/cms/*` je v Access policy → CMS proxy získá email z headeru
 *      a vrátí ho jako JSON. Tahle cesta NEvyžaduje, aby admin přidával
 *      /api/report-issue do Access app paths.
 *
 * Limit: jeden extra HTTP roundtrip per report (~50ms) když fast path
 * nezafunguje. Při běžném dashboard setupu (Access pokrývá oba paths)
 * fallback se nikdy nevolá.
 */
async function resolveEditorEmail(req: Request): Promise<string | null> {
  const direct = getEditorEmailFromHeader(req);
  if (direct) return direct;

  const cookie = req.headers.get('Cookie');
  if (!cookie) return null; // Žádné cookies = žádná CF Access session
  try {
    const origin = new URL(req.url).origin;
    const r = await fetch(`${origin}/api/cms/auth/user`, {
      headers: { Cookie: cookie, 'User-Agent': 'hodinarium-eu-report-flow' },
      redirect: 'manual', // CF Access by jinak 302 na login screen
    });
    if (r.status !== 200) return null;
    const ct = r.headers.get('content-type') || '';
    if (!ct.includes('json')) return null;
    const data = (await r.json()) as { authenticated?: boolean; email?: string };
    return data.authenticated && data.email ? data.email : null;
  } catch {
    return null;
  }
}

function clientIp(req: Request): string {
  return req.headers.get('CF-Connecting-IP') ?? req.headers.get('x-forwarded-for') ?? 'unknown';
}

function clamp(s: unknown, max: number): string {
  if (typeof s !== 'string') return '';
  return s.slice(0, max).trim();
}

function isHttpUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

/** Vyřeší owner/repo z env. Akceptuje:
 *    - GITHUB_OWNER + GITHUB_REPO ("repo" or "owner/repo")
 *    - jen GITHUB_REPO ve tvaru "owner/repo"
 *    - default "csh-cz/web" pokud nic není set */
function resolveRepo(env: Env): { owner: string; repo: string } {
  const raw = env.GITHUB_REPO ?? 'csh-cz/web';
  if (raw.includes('/')) {
    const [owner, repo] = raw.split('/');
    return { owner: env.GITHUB_OWNER || owner, repo };
  }
  return { owner: env.GITHUB_OWNER || 'csh-cz', repo: raw };
}

function resolveLabels(env: Env): string[] {
  const raw = env.GITHUB_DEFAULT_LABELS ?? 'web-bug,editor-report';
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

/** Volitelná Turnstile validace. Když TURNSTILE_SECRET_KEY není v env,
 *  skip silently (Turnstile není nasazený). Když je, ale klient nepošle
 *  token nebo CF API to odmítne, vrať false. */
async function verifyTurnstile(secret: string | undefined, token: string | undefined, ip: string): Promise<boolean> {
  if (!secret) return true; // Turnstile není nasazený
  if (!token) return false;
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }).toString(),
    });
    const j = (await r.json()) as { success?: boolean };
    return Boolean(j.success);
  } catch {
    return false;
  }
}

interface IssueResponse {
  ok: boolean;
  issue?: { number: number; url: string };
  error?: string;
}

function jsonResponse(body: IssueResponse, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // Ne-cachovat. Editor by mohl dostat starou response.
      'Cache-Control': 'no-store',
    },
  });
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // 1. Editor identity check (header fast-path, /api/cms/auth/user fallback)
  const email = await resolveEditorEmail(request);
  if (!email) {
    return jsonResponse(
      { ok: false, error: 'Přihlášení editora vypršelo nebo není aktivní. Obnov stránku a zkus znovu.' },
      401,
    );
  }

  // 2. Token check (server-side, klient ho nesmí vidět)
  const token = env.GITHUB_TOKEN || env.GITHUB_BOT_PAT;
  if (!token) {
    console.error('GITHUB_TOKEN ani GITHUB_BOT_PAT není nastavený v env.');
    return jsonResponse(
      { ok: false, error: 'Server není správně nakonfigurován. Kontaktuj správce.' },
      500,
    );
  }

  // 3. Parse + validate body
  let payload: ReportPayload;
  try {
    payload = (await request.json()) as ReportPayload;
  } catch {
    return jsonResponse({ ok: false, error: 'Neplatný formát požadavku.' }, 400);
  }

  // Honeypot — bot fills `_url`. Real form má ho prázdný (CSS-hidden).
  if (payload._url && payload._url.length > 0) {
    // Loguj minimum (jen IP), žádný PII.
    console.warn('Report honeypot triggered, IP:', clientIp(request));
    // Tvařme se jako úspěch — nedáme botu signál, že zafungoval.
    return jsonResponse({ ok: true, issue: { number: 0, url: '' } }, 200);
  }

  const description = clamp(payload.description, MAX_DESC_LEN);
  if (description.length < MIN_DESC_LEN) {
    return jsonResponse({ ok: false, error: 'Popis problému je povinný (alespoň 5 znaků).' }, 400);
  }

  const problemType = clamp(payload.problemType, 50);
  if (!PROBLEM_TYPES[problemType]) {
    return jsonResponse({ ok: false, error: 'Neznámý typ problému.' }, 400);
  }

  const url = clamp(payload.url, MAX_URL_LEN);
  if (url && !isHttpUrl(url)) {
    return jsonResponse({ ok: false, error: 'Neplatná URL stránky.' }, 400);
  }

  const pageTitle = clamp(payload.pageTitle, MAX_TITLE_LEN);
  const userAgent = clamp(request.headers.get('User-Agent') ?? '', MAX_UA_LEN);

  // 4. Optional Turnstile
  const turnstileOk = await verifyTurnstile(env.TURNSTILE_SECRET_KEY, payload.turnstileToken, clientIp(request));
  if (!turnstileOk) {
    return jsonResponse({ ok: false, error: 'Ověření, že nejsi robot, selhalo. Zkus to znovu.' }, 400);
  }

  // 5. Rate limit per editor (per V8 isolate — best-effort)
  const now = Date.now();
  const last = RATE_LIMIT.get(email) ?? 0;
  if (now - last < RATE_LIMIT_MS) {
    const wait = Math.ceil((RATE_LIMIT_MS - (now - last)) / 1000);
    return jsonResponse(
      { ok: false, error: `Příliš mnoho zpráv. Počkej ${wait} s a zkus to znovu.` },
      429,
    );
  }

  // 6. Build GitHub Issue
  const { owner, repo } = resolveRepo(env);
  const labels = resolveLabels(env);

  // Title: krátký popis s prefixem [Web bug]. Bereme prvních 80 znaků
  // popisu nebo pageTitle pokud popis začíná „a" / je extrémně krátký.
  const titleCore = pageTitle && description.length < 30
    ? pageTitle
    : description.replace(/\s+/g, ' ').slice(0, 80) + (description.length > 80 ? '…' : '');
  const issueTitle = `[Web bug] ${titleCore}`;

  // Body: strukturovaný markdown. NEPOSÍLÁME cookies, headers, ani interní
  // tokeny. Jen explicitně viditelná data + UA pro reproduction debug.
  const issueBody = [
    '## Hlášení od editora',
    '',
    `- **URL:** ${url ? `<${url}>` : '_(neznámá)_'}`,
    `- **Název stránky:** ${pageTitle || '_(neznámá)_'}`,
    `- **Typ problému:** ${PROBLEM_TYPES[problemType]} (\`${problemType}\`)`,
    `- **Hlásí:** ${email}`,
    `- **Datum a čas:** ${new Date().toISOString()}`,
    userAgent ? `- **User-Agent:** \`${userAgent.replace(/`/g, '\\`')}\`` : '',
    '',
    '## Popis problému',
    '',
    description,
    '',
    '---',
    '',
    '_Automaticky vytvořeno přes editorský report flow (`/api/report-issue`)._',
  ].filter(Boolean).join('\n');

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/issues`;
  let ghResponse: Response;
  try {
    // GitHub REST API v3 — POST /repos/:owner/:repo/issues
    // Auth: Bearer <PAT>. PAT musí mít `repo` scope (private) nebo
    // `public_repo` scope (public).
    // Doc: https://docs.github.com/en/rest/issues/issues#create-an-issue
    ghResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
        'User-Agent': 'hodinarium-eu-report-flow',
      },
      body: JSON.stringify({
        title: issueTitle,
        body: issueBody,
        labels,
      }),
    });
  } catch (err) {
    console.error('GitHub API network error', err);
    return jsonResponse({ ok: false, error: 'GitHub momentálně nedostupný. Zkus později.' }, 502);
  }

  if (!ghResponse.ok) {
    // Neukazuj raw GitHub error klientovi — jen log + generic message.
    const txt = await ghResponse.text().catch(() => '');
    console.error(`GitHub API ${ghResponse.status}:`, txt.slice(0, 500));
    if (ghResponse.status === 401 || ghResponse.status === 403) {
      return jsonResponse(
        { ok: false, error: 'Server nemá oprávnění vytvořit issue. Kontaktuj správce.' },
        500,
      );
    }
    return jsonResponse(
      { ok: false, error: 'GitHub odmítl vytvořit issue. Zkus později nebo kontaktuj správce.' },
      502,
    );
  }

  const issue = (await ghResponse.json()) as { number: number; html_url: string };

  // Rate-limit označit až po success — failed pokus znova hned.
  RATE_LIMIT.set(email, now);

  return jsonResponse(
    { ok: true, issue: { number: issue.number, url: issue.html_url } },
    200,
  );
};
