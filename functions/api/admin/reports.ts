/**
 * GET /api/admin/reports
 *
 * Editor-only endpoint: vrátí seznam open GitHub Issues s labelem `web-bug`
 * (= reporty od editorů přes /api/report-issue) pro zobrazení v
 * `/redakce/` dashboardu.
 *
 * Authentikace:
 *   - Stejná dvojí strategie jako /api/report-issue:
 *     1. Fast path — `Cf-Access-Authenticated-User-Email` header
 *     2. Fallback — proxy fetch /api/cms/auth/user s forward-nutými cookies
 *   - Anonymní = 401 (nikdy nedostane GitHub data)
 *
 * GitHub volání: GET /repos/{owner}/{repo}/issues?labels=web-bug&state=open
 * s Bearer GITHUB_TOKEN (s fallbackem na GITHUB_BOT_PAT).
 *
 * Cache:
 *   - 60 s edge cache — issues seznam se nemění každou vteřinu, ale chceme
 *     rychlejší refresh než 5 min (=editor něco fixne, chce vidět updated)
 *
 * Response:
 *   200 { reports: Array<ReportSummary>, total, fetchedAt }
 *   401 { error: 'Vyžaduje přihlášení editora' }
 *   502 { error: 'GitHub momentálně nedostupný' }
 *
 * Z GitHub Issue body parsujeme strukturovaná pole, která tam náš
 * /api/report-issue zapisuje:
 *   - URL stránky
 *   - Název stránky
 *   - Typ problému
 *   - Hlásí (editor email)
 *   - Datum a čas
 *   - Popis problému (volný text)
 */

interface Env {
  GITHUB_TOKEN?: string;
  GITHUB_BOT_PAT?: string;
  GITHUB_OWNER?: string;
  GITHUB_REPO?: string;
}

interface GHIssue {
  number: number;
  title: string;
  state: 'open' | 'closed';
  html_url: string;
  body: string | null;
  created_at: string;
  updated_at: string;
  user: { login: string; avatar_url: string };
  labels: Array<{ name: string; color: string }>;
  comments: number;
}

interface ReportSummary {
  number: number;
  title: string;
  state: 'open' | 'closed';
  htmlUrl: string;
  createdAt: string;
  updatedAt: string;
  comments: number;
  /** Plnou body z issue uchováme — frontend ho může collapse/expand. */
  bodyRaw: string;
  /** Parsované strukturované fieldy (best-effort z markdown body). */
  parsed: {
    url?: string;
    pageTitle?: string;
    problemType?: string;
    reporter?: string;
    timestamp?: string;
    description?: string;
  };
  /** Štítky (kromě web-bug / editor-report). Užitečné pro further triage. */
  extraLabels: Array<{ name: string; color: string }>;
}

function getEditorEmailFromHeader(req: Request): string | null {
  return (
    req.headers.get('Cf-Access-Authenticated-User-Email') ??
    req.headers.get('cf-access-authenticated-user-email') ??
    null
  );
}

/** Stejná strategie jako v /api/report-issue. */
async function resolveEditorEmail(req: Request): Promise<string | null> {
  const direct = getEditorEmailFromHeader(req);
  if (direct) return direct;

  const cookie = req.headers.get('Cookie');
  if (!cookie) return null;
  try {
    const origin = new URL(req.url).origin;
    const r = await fetch(`${origin}/api/cms/auth/user`, {
      headers: { Cookie: cookie, 'User-Agent': 'hodinarium-eu-admin-reports' },
      redirect: 'manual',
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

function resolveRepo(env: Env): { owner: string; repo: string } {
  const raw = env.GITHUB_REPO ?? 'csh-cz/web';
  if (raw.includes('/')) {
    const [owner, repo] = raw.split('/');
    return { owner: env.GITHUB_OWNER || owner, repo };
  }
  return { owner: env.GITHUB_OWNER || 'csh-cz', repo: raw };
}

/** Best-effort parse strukturovaných fieldů z issue body.
 *  Náš /api/report-issue body formátuje takto:
 *
 *    ## Hlášení od editora
 *
 *    - **URL:** <https://...>
 *    - **Název stránky:** ...
 *    - **Typ problému:** překlep / typografická chyba (`preklep`)
 *    - **Hlásí:** editor@example.com
 *    - **Datum a čas:** 2026-05-07T...
 *    - **User-Agent:** `Mozilla/...`
 *
 *    ## Popis problému
 *
 *    <free text>
 *
 *  Když body neobsahuje očekávaný formát (issue ručně vytvořené),
 *  fields zůstanou undefined a frontend zobrazí jen `bodyRaw`. */
function parseIssueBody(body: string | null): ReportSummary['parsed'] {
  if (!body) return {};
  const lines = body.split('\n');
  const parsed: ReportSummary['parsed'] = {};

  for (const line of lines) {
    const m = line.match(/^- \*\*([^:*]+):\*\*\s+(.+?)$/);
    if (!m) continue;
    const key = m[1].trim().toLowerCase();
    let value = m[2].trim();
    // Strip <https://...> markdown autolink + backticks
    value = value.replace(/^<(.+)>$/, '$1').replace(/^`(.+)`$/, '$1');
    // Strip "_(neznámá)_" placeholder
    if (/_\(.+\)_/.test(value)) value = '';
    if (!value) continue;
    if (/^url$/.test(key)) parsed.url = value;
    else if (/název stránky|nazev stranky/.test(key)) parsed.pageTitle = value;
    else if (/^typ problému|typ problemu/.test(key)) parsed.problemType = value;
    else if (/^hlásí|hlasi/.test(key)) parsed.reporter = value;
    else if (/^datum/.test(key)) parsed.timestamp = value;
  }

  // Description = vše po "## Popis problému" do "---" nebo end
  const descMatch = body.match(/##\s*Popis problému\s*\n+([\s\S]*?)(?:\n---\n|$)/i);
  if (descMatch) parsed.description = descMatch[1].trim();

  return parsed;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Auth check
  const email = await resolveEditorEmail(request);
  if (!email) {
    return new Response(
      JSON.stringify({ error: 'Vyžaduje přihlášení editora.' }),
      { status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8' } },
    );
  }

  const token = env.GITHUB_TOKEN || env.GITHUB_BOT_PAT;
  if (!token) {
    return new Response(
      JSON.stringify({ error: 'Server není nakonfigurován (GITHUB_TOKEN/PAT chybí).' }),
      { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } },
    );
  }

  const url = new URL(request.url);
  const state = (url.searchParams.get('state') ?? 'open') as 'open' | 'closed' | 'all';
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit') ?? 30)));

  const { owner, repo } = resolveRepo(env);

  // GitHub REST API: GET /repos/:owner/:repo/issues
  // Filter podle labelu web-bug (= náš report flow). State = open by default.
  // Sort: created desc (=nejnovější první).
  // Doc: https://docs.github.com/en/rest/issues/issues#list-repository-issues
  const ghUrl = `https://api.github.com/repos/${owner}/${repo}/issues` +
    `?labels=web-bug&state=${state}&sort=created&direction=desc&per_page=${limit}`;

  let ghResponse: Response;
  try {
    ghResponse = await fetch(ghUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'hodinarium-eu-admin-reports',
      },
      cf: { cacheEverything: true, cacheTtl: 60 },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: 'GitHub momentálně nedostupný.' }),
      { status: 502, headers: { 'Content-Type': 'application/json; charset=utf-8' } },
    );
  }

  if (!ghResponse.ok) {
    return new Response(
      JSON.stringify({ error: `GitHub vrátil ${ghResponse.status}.` }),
      { status: 502, headers: { 'Content-Type': 'application/json; charset=utf-8' } },
    );
  }

  const issues = (await ghResponse.json()) as GHIssue[];

  const reports: ReportSummary[] = issues.map((iss) => ({
    number: iss.number,
    title: iss.title,
    state: iss.state,
    htmlUrl: iss.html_url,
    createdAt: iss.created_at,
    updatedAt: iss.updated_at,
    comments: iss.comments,
    bodyRaw: iss.body ?? '',
    parsed: parseIssueBody(iss.body),
    // Vyfiltrovat web-bug + editor-report — ty jsou implicit (filter dotazu)
    extraLabels: iss.labels.filter((l) => l.name !== 'web-bug' && l.name !== 'editor-report'),
  }));

  return new Response(
    JSON.stringify({
      reports,
      total: reports.length,
      fetchedAt: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'private, max-age=60',
      },
    },
  );
};
