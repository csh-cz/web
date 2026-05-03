/**
 * /api/cms/* — Cloudflare Pages Function proxy mezi Sveltia CMS a GitHub API.
 *
 * NÁHRADA za samostatný Worker `csh-cms-proxy`. Důvod migrace: Worker byl
 * cross-origin vůči /admin/ → Sveltia fetch bez `credentials:'include'` →
 * CF Access cookie pro Worker URL se neposílala → CF Access intercept
 * vrátil 302 redirect → CORS policy blokovala response (žádný
 * Access-Control-Allow-Origin v 302). Tím Sveltia "Failed to fetch"
 * po úspěšném /auth handshake.
 *
 * Pages Function běží na **stejném origin** (hodinarium-eu.pages.dev),
 * takže Sveltia volá same-origin → CF Access cookie automatically →
 * žádný CORS dance. Jeden CF Access app pokrývá `/admin/*` i `/api/cms/*`.
 *
 * Architektura:
 *
 *   Editor browser
 *     ├─ Cloudflare Access OTP chrání /admin/* + /api/cms/*
 *     └─ Sveltia CMS UI (statický /admin/index.html)
 *           ↓ requesty na /api/cms/* (= base_url + api_root v config.yml)
 *   Pages Function (tady)
 *     ├─ čte editora z `Cf-Access-Authenticated-User-Email`
 *     ├─ /api/cms/auth → postMessage HTML pro Sveltia popup
 *     ├─ /api/cms/api/v3/* → REST proxy na api.github.com s bot PAT
 *     ├─ /api/cms/api/graphql → GraphQL proxy
 *     └─ commit message injectuje [editor: <email>] + author=cshbot
 *
 * Secret: GITHUB_BOT_PAT (přes `wrangler pages secret put`).
 */

interface Env {
  GITHUB_BOT_PAT: string;
  GITHUB_REPO?: string;
  GITHUB_DEFAULT_BRANCH?: string;
  BOT_AUTHOR_NAME?: string;
  BOT_AUTHOR_EMAIL?: string;
}

const GITHUB_API = 'https://api.github.com';
const DEFAULT_BOT_NAME = 'cshbot';
const DEFAULT_BOT_EMAIL = 'cshbot@users.noreply.github.com';

function getEditorEmail(req: Request): string | null {
  return (
    req.headers.get('Cf-Access-Authenticated-User-Email') ??
    req.headers.get('cf-access-authenticated-user-email') ??
    null
  );
}

/**
 * Pro REST PUT /repos/.../contents/<path> přepíše commit message + author/committer.
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
  payload.committer = {
    name: env.BOT_AUTHOR_NAME ?? DEFAULT_BOT_NAME,
    email: env.BOT_AUTHOR_EMAIL ?? DEFAULT_BOT_EMAIL,
  };
  payload.author = {
    name: env.BOT_AUTHOR_NAME ?? DEFAULT_BOT_NAME,
    email: env.BOT_AUTHOR_EMAIL ?? DEFAULT_BOT_EMAIL,
  };

  return JSON.stringify(payload);
}

/**
 * Pro GraphQL createCommitOnBranch přepíše headline (committer/author derive z PAT).
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

/**
 * Pages Function entry — handle vše pod /api/cms/*.
 * Path uvnitř bude např. `/api/cms/auth` nebo `/api/cms/api/v3/repos/...`.
 * Stripneme `/api/cms` prefix, zbytek přemapujeme na github.com paths.
 */
export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);

  // Strip /api/cms prefix → vnitřní path (např. /auth, /api/v3/repos/...)
  const internalPath = url.pathname.replace(/^\/api\/cms/, '') || '/';

  // ── Auth flow (Sveltia popup target) ──
  // Sveltia volá <base_url>/auth?provider=github&site_id=...&scope=repo,user
  // Aliasy: /oauth/authorize (alt Sveltia path).
  const isAuthPath =
    internalPath === '/auth' ||
    internalPath === '/auth/' ||
    internalPath === '/oauth/authorize' ||
    internalPath === '/oauth/authorize/';
  const isCallbackPath =
    internalPath === '/callback' ||
    internalPath === '/callback/' ||
    internalPath === '/oauth/redirect' ||
    internalPath === '/oauth/redirect/';

  if (isAuthPath || isCallbackPath) {
    const editorEmail = getEditorEmail(request);
    if (!editorEmail) {
      return new Response(
        '<!doctype html><meta charset="utf-8"><title>Auth chyba</title>' +
        '<body style="font-family:sans-serif;padding:2rem">' +
        '<h1>Přihlášení selhalo</h1>' +
        '<p>Pages Function nedostala <code>Cf-Access-Authenticated-User-Email</code> header. ' +
        'Cloudflare Access Application možná nepokrývá <code>/api/cms/*</code>, ' +
        'nebo session vypršela.</p></body>',
        { status: 401, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
      );
    }

    const provider = url.searchParams.get('provider') ?? 'github';
    const content = {
      provider,
      token: `cf-access:${editorEmail}`,
    };
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Přihlašuji…</title></head>
<body style="font-family:sans-serif;padding:2rem">
  <p>Přihlašuji <strong>${editorEmail}</strong> do CMS…</p>
  <script>
    (function () {
      var provider = ${JSON.stringify(provider)};
      var content = ${JSON.stringify(content)};
      var msg = 'authorization:' + provider + ':success:' + JSON.stringify(content);
      function sendTo(targetOrigin) {
        if (!window.opener) {
          document.body.innerHTML = '<p>Opener okno chybí. Zavři tohle a zkus znovu.</p>';
          return;
        }
        try { window.opener.postMessage(msg, targetOrigin); } catch (e) {}
      }
      window.addEventListener('message', function (e) {
        if (typeof e.data === 'string' && e.data === 'authorizing:' + provider) {
          sendTo(e.origin);
          setTimeout(function () { window.close(); }, 300);
        }
      });
      try { window.opener && window.opener.postMessage('authorizing:' + provider, '*'); } catch (e) {}
      setTimeout(function () { sendTo('*'); setTimeout(function () { window.close(); }, 300); }, 2000);
    })();
  </script>
</body></html>`;
    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // ── User identity endpoint ──
  if (internalPath === '/api/auth/user' || internalPath === '/auth/user') {
    const editorEmail = getEditorEmail(request);
    return new Response(
      JSON.stringify({
        email: editorEmail,
        login: editorEmail ? editorEmail.split('@')[0] : null,
        authenticated: !!editorEmail,
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  }

  // ── Health check ──
  if (internalPath === '/' || internalPath === '/health') {
    return new Response(JSON.stringify({
      ok: true,
      repo: env.GITHUB_REPO ?? '(unset)',
      editor: getEditorEmail(request),
      runtime: 'pages-function',
    }), { headers: { 'Content-Type': 'application/json' } });
  }

  // ── GitHub API proxy (REST + GraphQL) ──
  // Sveltia s api_root='https://hodinarium-eu.pages.dev/api/cms' volá:
  //   /api/cms/api/v3/repos/...      → strip /api/cms → /api/v3/repos/... → /repos/...
  //   /api/cms/api/graphql           → strip /api/cms → /api/graphql → /graphql
  const editorEmail = getEditorEmail(request);
  const target = new URL(GITHUB_API);
  target.pathname = internalPath
    .replace(/^\/api\/v3/, '')
    .replace(/^\/api\/graphql/, '/graphql');
  target.search = url.search;

  const headers = new Headers(request.headers);
  headers.delete('Authorization');
  headers.set('Authorization', `Bearer ${env.GITHUB_BOT_PAT}`);
  headers.set('User-Agent', 'csh-cms-pages-function/1.0');
  headers.set('Accept', headers.get('Accept') ?? 'application/vnd.github+json');
  headers.delete('Host');
  headers.delete('Cookie');  // bot PAT je v Authorization, cookies zbytečné

  let body: BodyInit | null | undefined = undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const bodyText = await request.text();
    body = bodyText;
    const rest = rewriteRestCommitBody(request.method, internalPath, bodyText, editorEmail, env);
    if (rest !== null) body = rest;
    else {
      const gql = rewriteGraphqlCommitBody(request.method, internalPath, bodyText, editorEmail);
      if (gql !== null) body = gql;
    }
    headers.delete('Content-Length');
  }

  const upstream = await fetch(target.toString(), {
    method: request.method,
    headers,
    body,
    redirect: 'follow',
  });

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: upstream.headers,
  });
};
