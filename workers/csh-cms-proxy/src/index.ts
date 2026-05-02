/**
 * csh-cms-proxy — Cloudflare Worker proxy mezi Sveltia/Decap CMS a GitHub API.
 *
 * Architektura:
 *
 *   Editor browser
 *     ├─ Cloudflare Access (Google OAuth) chrání /admin/* → vstup do CMS
 *     └─ Sveltia CMS UI (statický /admin/index.html)
 *           ↓ requesty na api_root (= URL tohoto Workeru)
 *   Worker (tady)
 *     ├─ ověří CF Access JWT z headeru `Cf-Access-Jwt-Assertion` (volitelně)
 *     ├─ čte identitu editora z `Cf-Access-Authenticated-User-Email`
 *     ├─ přepíše Authorization header na bot PAT
 *     ├─ pro PUT /repos/.../contents/... (= commit) injectuje commit
 *     │   message s editorovým mailem + author = bot
 *     └─ proxy na api.github.com
 *
 * Frontmatter `author:` field článku je editovaný editorem v UI — Worker
 * do něj NEzasahuje. Identita editora se objeví jen v commit message
 * (audit trail v gitu).
 *
 * Deploy:
 *   cd workers/csh-cms-proxy
 *   wrangler secret put GITHUB_BOT_PAT
 *   wrangler secret put ALLOWED_ORIGINS  # JSON array
 *   wrangler deploy
 */

interface Env {
  GITHUB_BOT_PAT: string;
  ALLOWED_ORIGINS: string;       // JSON array
  GITHUB_REPO: string;
  GITHUB_DEFAULT_BRANCH: string;
  BOT_AUTHOR_NAME: string;
  BOT_AUTHOR_EMAIL: string;
}

const GITHUB_API = 'https://api.github.com';

function corsHeaders(origin: string | null, allowed: string[]): HeadersInit {
  const allow = origin && allowed.includes(origin) ? origin : allowed[0] ?? '*';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, If-Match, If-None-Match',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Expose-Headers': 'ETag, Link, X-RateLimit-Remaining',
    'Vary': 'Origin',
  };
}

function getEditorEmail(req: Request): string | null {
  // CF Access injectuje tyhle headery na chráněné requesty.
  // Bez Access (např. dev mimo CF Access) → null = anonymous.
  return (
    req.headers.get('Cf-Access-Authenticated-User-Email') ??
    req.headers.get('cf-access-authenticated-user-email') ??
    null
  );
}

/**
 * Pro REST `PUT /repos/.../contents/<path>` přepíše:
 *   message:   připojí `[editor: foo@bar]`
 *   committer: bot
 *   author:    bot
 */
function rewriteRestCommitBody(
  method: string,
  pathname: string,
  bodyText: string,
  editorEmail: string | null,
  env: Env,
): string | null {
  if (method !== 'PUT') return null;
  if (!/^(?:\/api\/v3)?\/repos\/[^/]+\/[^/]+\/contents\//.test(pathname)) return null;

  let payload: Record<string, unknown>;
  try { payload = JSON.parse(bodyText); } catch { return null; }

  const original = (payload.message as string) ?? 'Edit';
  const tag = editorEmail ? ` [editor: ${editorEmail}]` : ' [editor: anonymous]';
  payload.message = original.endsWith(tag) ? original : `${original}${tag}`;
  payload.committer = { name: env.BOT_AUTHOR_NAME, email: env.BOT_AUTHOR_EMAIL };
  payload.author = { name: env.BOT_AUTHOR_NAME, email: env.BOT_AUTHOR_EMAIL };

  return JSON.stringify(payload);
}

/**
 * Pro GraphQL `createCommitOnBranch` mutation přepíše ve `variables.input.message.headline`
 * editor suffix. GitHub GraphQL committer/author jsou auto-derivované z PAT tokena
 * (= cshbot), takže nemusíme přepisovat. Audit trail editora jde do message.
 */
function rewriteGraphqlCommitBody(
  method: string,
  pathname: string,
  bodyText: string,
  editorEmail: string | null,
): string | null {
  if (method !== 'POST') return null;
  if (!/^(?:\/api)?\/graphql$/.test(pathname)) return null;

  let payload: Record<string, unknown>;
  try { payload = JSON.parse(bodyText); } catch { return null; }
  const query = (payload.query as string) ?? '';
  if (!query.includes('createCommitOnBranch')) return null;

  const tag = editorEmail ? ` [editor: ${editorEmail}]` : ' [editor: anonymous]';
  const variables = payload.variables as { input?: { message?: { headline?: string; body?: string } } } | undefined;
  const headline = variables?.input?.message?.headline;
  if (typeof headline === 'string' && !headline.endsWith(tag)) {
    variables!.input!.message!.headline = `${headline}${tag}`;
  }
  return JSON.stringify(payload);
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const origin = req.headers.get('Origin');
    let allowed: string[] = [];
    try {
      allowed = JSON.parse(env.ALLOWED_ORIGINS);
    } catch {
      allowed = [];
    }
    const cors = corsHeaders(origin, allowed);

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(req.url);

    // Health check
    if (url.pathname === '/' || url.pathname === '/health') {
      return new Response(JSON.stringify({
        ok: true,
        repo: env.GITHUB_REPO,
        editor: getEditorEmail(req),
      }), { headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    // Auth endpoint pro Sveltia/Decap auth_endpoint flow.
    // Sveltia otevře popup na <api_root>/auth?provider=github&site_id=...
    // Worker tady ověří CF Access (přes Cf-Access-Authenticated-User-Email
    // header — vyžaduje CF Access policy na Worker URL!) a vrátí HTML
    // s postMessage zpátky do opener okna s tokenem. Sveltia ho přijme a
    // uloží jako session — žádný GitHub OAuth dance, žádný PAT prompt.
    //
    // Token je placeholder — Worker ho na všech API requestech přepíše na
    // bot PAT. Editor token nikdy neuvidí.
    if (url.pathname === '/auth' || url.pathname === '/auth/') {
      const editorEmail = getEditorEmail(req);
      if (!editorEmail) {
        // Bez CF Access JWT odmítnout — buď CF Access není zapnutý na Workeru,
        // nebo session vypršela. Editor uvidí chybu, ne tichou anonymizaci.
        return new Response(
          '<!doctype html><meta charset="utf-8"><title>Auth chyba</title>' +
          '<body style="font-family:sans-serif;padding:2rem">' +
          '<h1>Přihlášení selhalo</h1>' +
          '<p>Worker nedostal CF Access JWT. Zkontroluj že je nasazena ' +
          'Cloudflare Access Application na <code>csh-cms-proxy.<i>account</i>.workers.dev</code> ' +
          'se stejnou allow-list policy jako pro <code>/admin/*</code>.</p>' +
          '<p>Po nastavení zavři toto okno a zkus přihlášení znovu.</p>' +
          '</body>',
          { status: 401, headers: { ...cors, 'Content-Type': 'text/html; charset=utf-8' } },
        );
      }

      // Editor je authenticated. Pošli token zpět do Sveltia popup.opener.
      // Format: 'authorization:<provider>:success:<json>' — kompatibilita
      // s Decap CMS / Netlify Identity widgetem.
      const provider = url.searchParams.get('provider') ?? 'github';
      const tokenPayload = {
        token: `cf-access:${editorEmail}`,  // placeholder; Worker ho v API requestech přepíše na bot PAT
        provider,
      };
      const html = `<!doctype html><meta charset="utf-8"><title>Přihlašuji…</title>
<body style="font-family:sans-serif;padding:2rem">
  <p>Přihlašuji <strong>${editorEmail}</strong> do CMS…</p>
  <script>
    (function () {
      function send() {
        if (!window.opener) {
          document.body.innerHTML = '<p>Přihlášení proběhlo, ale chybí opener okno. Zavři tohle a zkus znovu.</p>';
          return;
        }
        window.opener.postMessage(
          'authorization:${provider}:success:' + ${JSON.stringify(JSON.stringify(tokenPayload))},
          '*'
        );
        setTimeout(function () { window.close(); }, 200);
      }
      // Decap waits for "authorizing:<provider>" handshake from opener first.
      window.addEventListener('message', function (e) {
        if (typeof e.data === 'string' && e.data === 'authorizing:${provider}') send();
      });
      // Také poslat hned (Sveltia / novější Decap rovnou poslouchá).
      send();
    })();
  </script>
</body>`;
      return new Response(html, {
        status: 200,
        headers: { ...cors, 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // Endpoint na user identity — vrací editora podle CF Access JWT.
    // Lze použít z /admin/ JS pro zobrazení „přihlášen jako …" v UI.
    if (url.pathname === '/api/auth/user' || url.pathname === '/auth/user') {
      const editorEmail = getEditorEmail(req);
      return new Response(
        JSON.stringify({
          email: editorEmail,
          login: editorEmail ? editorEmail.split('@')[0] : null,
          authenticated: !!editorEmail,
        }),
        { headers: { ...cors, 'Content-Type': 'application/json' } },
      );
    }

    // Pre-flight: ověření CF Access (volitelně, závisí na deploy konfiguraci).
    // Strict mode: pokud Cf-Access-Jwt-Assertion chybí, odmítnout.
    // Dev mode: povolit (CF Access ještě není přepnutý).
    const editorEmail = getEditorEmail(req);
    if (!editorEmail && !url.searchParams.has('dev')) {
      // Odkomentovat pro strict mode po nasazení CF Access:
      // return new Response('Unauthorized — CF Access required', { status: 401, headers: cors });
    }

    // Build target GitHub URL.
    // Sveltia (a Decap CMS) s custom api_root prefixuje:
    //   /api/v3/...    pro REST API (GitHub Enterprise konvence)
    //   /api/graphql   pro GraphQL API
    // Reálný api.github.com REST nemá /api/v3 a GraphQL je na /graphql.
    // Strip "/api/v3" i "/api" prefix → mapping na api.github.com paths.
    const target = new URL(GITHUB_API);
    target.pathname = url.pathname
      .replace(/^\/api\/v3/, '')        // REST: /api/v3/repos/... → /repos/...
      .replace(/^\/api\/graphql/, '/graphql');  // GraphQL: /api/graphql → /graphql
    target.search = url.search;

    // Rewrite headers
    const headers = new Headers(req.headers);
    headers.delete('Authorization');
    headers.set('Authorization', `Bearer ${env.GITHUB_BOT_PAT}`);
    headers.set('User-Agent', 'csh-cms-proxy/1.0');
    headers.set('Accept', headers.get('Accept') ?? 'application/vnd.github+json');
    headers.delete('Host');

    // Read body once (pokud má request body), rewrite REST nebo GraphQL commit.
    // Drop Content-Length aby fetch ho znovu vypočítal (rewrite mění délku).
    let body: BodyInit | null | undefined = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const bodyText = await req.text();
      body = bodyText;
      const rest = rewriteRestCommitBody(req.method, url.pathname, bodyText, editorEmail, env);
      if (rest !== null) body = rest;
      else {
        const gql = rewriteGraphqlCommitBody(req.method, url.pathname, bodyText, editorEmail);
        if (gql !== null) body = gql;
      }
      headers.delete('Content-Length');
    }

    const upstream = await fetch(target.toString(), {
      method: req.method,
      headers,
      body,
      redirect: 'follow',
    });

    // Pass-through response with CORS
    const respHeaders = new Headers(upstream.headers);
    for (const [k, v] of Object.entries(cors)) respHeaders.set(k, v as string);

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: respHeaders,
    });
  },
};
