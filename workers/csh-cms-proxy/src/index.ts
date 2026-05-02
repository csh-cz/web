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
async function rewriteRestCommitBody(
  req: Request,
  editorEmail: string | null,
  env: Env,
): Promise<BodyInit | null> {
  if (req.method !== 'PUT') return null;
  const url = new URL(req.url);
  if (!/^(?:\/api\/v3)?\/repos\/[^/]+\/[^/]+\/contents\//.test(url.pathname)) return null;

  let payload: Record<string, unknown>;
  try {
    payload = await req.clone().json() as Record<string, unknown>;
  } catch {
    return null;
  }

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
 *
 * Sveltia commits přes tento mechanismus (ne přes REST /contents/).
 */
async function rewriteGraphqlCommitBody(
  req: Request,
  editorEmail: string | null,
): Promise<BodyInit | null> {
  if (req.method !== 'POST') return null;
  const url = new URL(req.url);
  if (!/^(?:\/api)?\/graphql$/.test(url.pathname)) return null;

  let payload: Record<string, unknown>;
  try {
    payload = await req.clone().json() as Record<string, unknown>;
  } catch {
    return null;
  }
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

    // Optionally rewrite commit body — REST nebo GraphQL.
    let body: BodyInit | null | undefined = req.body;
    const rest = await rewriteRestCommitBody(req, editorEmail, env);
    if (rest !== null) {
      body = rest;
    } else {
      const gql = await rewriteGraphqlCommitBody(req, editorEmail);
      if (gql !== null) body = gql;
    }

    const upstream = await fetch(target.toString(), {
      method: req.method,
      headers,
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : body,
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
