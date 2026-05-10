/**
 * POST /api/workflow/transition — change article workflow status.
 *
 * Body (JSON):
 *   {
 *     collection: 'clanky' | 'hodinari' | 'kroky' | 'slovnik' | 'soupis-veznich-hodin',
 *     id: string,                   // Astro entry id (filename without extension)
 *     action: 'claim'               // todo → in-progress, set lockedBy + lockedAt
 *           | 'release'             // clear lockedBy + lockedAt (status zůstane)
 *           | 'submit-review'       // in-progress → review
 *           | 'approve',            // review → ready (= odeber z úkolovníku); push email do reviewedBy
 *     notes?: string                // volitelná poznámka, append do workflow.notes
 *   }
 *
 * Response:
 *   200 { ok: true, status, commit_sha }
 *   400 { error, reason }
 *   401 { error: 'not authenticated' }   — žádný CF Access header
 *   404 { error: 'file not found' }
 *   500 { error, reason }
 *
 * Authorization: CF Access OTP (sdílí policy s /admin/* a /api/cms/*).
 *
 * Implementation:
 *   1. Read file via GitHub Contents API (need `sha` for PUT)
 *   2. Parse frontmatter YAML
 *   3. Update `workflow.*` fields per action
 *   4. PUT file with new content (= commit) — author = cshbot, message
 *      includes [editor: email] + [workflow: action]
 *   5. Vrátí new commit sha
 */
import { parse as yamlParse, stringify as yamlStringify } from 'yaml';

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

interface CollectionConfig {
  /** Collection content folder relative to repo root. */
  folder: string;
  /** Default file extension; PUT will probe both .md and .mdx if needed. */
  extensions: string[];
}

const COLLECTIONS: Record<string, CollectionConfig> = {
  clanky: { folder: 'content/hodinarium-eu', extensions: ['.md', '.mdx'] },
  hodinari: { folder: 'content/hodinari', extensions: ['.mdx', '.md'] },
  kroky: { folder: 'content/kroky', extensions: ['.mdx', '.md'] },
  slovnik: { folder: 'content/slovnik', extensions: ['.md', '.mdx'] },
  'soupis-veznich-hodin': { folder: 'content/soupis-veznich-hodin', extensions: ['.mdx', '.md'] },
};

type Action = 'claim' | 'release' | 'submit-review' | 'approve';
type Status = 'todo' | 'in-progress' | 'review' | 'ready';

interface WorkflowFields {
  status?: Status;
  lockedBy?: string;
  lockedAt?: string;
  reviewers?: string[];
  reviewedBy?: string[];
  publicDuringEdit?: boolean;
  notes?: string;
}

function getEditorEmail(req: Request): string | null {
  return (
    req.headers.get('Cf-Access-Authenticated-User-Email') ??
    req.headers.get('cf-access-authenticated-user-email') ??
    null
  );
}

function decodeBase64Utf8(b64: string): string {
  const binary = atob(b64.replace(/\n/g, ''));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder('utf-8').decode(bytes);
}

function encodeBase64Utf8(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

/** Aplikuje action na current workflow state, vrátí nový. */
function applyAction(current: WorkflowFields, action: Action, editor: string, notes?: string): {
  next: WorkflowFields;
  newStatus: Status;
} {
  const nowIso = new Date().toISOString();
  const next: WorkflowFields = { ...current };
  let newStatus: Status;

  switch (action) {
    case 'claim':
      newStatus = 'in-progress';
      next.status = newStatus;
      next.lockedBy = editor;
      next.lockedAt = nowIso;
      break;
    case 'release':
      // status zůstane, jen smazat lock
      newStatus = (next.status as Status) ?? 'todo';
      delete next.lockedBy;
      delete next.lockedAt;
      break;
    case 'submit-review':
      newStatus = 'review';
      next.status = newStatus;
      next.lockedAt = nowIso; // refresh
      break;
    case 'approve': {
      newStatus = 'ready';
      next.status = newStatus;
      const reviewedBy = next.reviewedBy ?? [];
      if (!reviewedBy.includes(editor)) reviewedBy.push(editor);
      next.reviewedBy = reviewedBy;
      // Po publikaci vyčistit lock — článek je ready, nikdo na něm není
      delete next.lockedBy;
      delete next.lockedAt;
      break;
    }
    default:
      throw new Error(`unknown action: ${action}`);
  }

  if (notes) {
    const prefix = next.notes ? `${next.notes}\n` : '';
    next.notes = `${prefix}${nowIso} [${editor}] ${action}: ${notes}`;
  }

  return { next, newStatus };
}

/** Update YAML frontmatter v markdown souboru — replace `workflow:` block.
 *  Pokud `workflow:` neexistuje, vloží na konec frontmatteru. */
function updateFrontmatterWorkflow(content: string, workflow: WorkflowFields): string {
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) {
    throw new Error('No frontmatter found');
  }
  const fmRaw = fmMatch[1];
  const fmStart = fmMatch.index!;
  const fmEnd = fmStart + fmMatch[0].length;

  // Parse, update, serialize
  const data = yamlParse(fmRaw) ?? {};
  // Empty workflow → odstranit fieldy bez hodnot, aby YAML nezůstal
  // s "workflow: {}" nebo bezvalue keys
  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(workflow)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v) && v.length === 0) continue;
    cleaned[k] = v;
  }
  if (Object.keys(cleaned).length > 0) {
    data.workflow = cleaned;
  } else {
    delete data.workflow;
  }
  const newFm = yamlStringify(data, { lineWidth: 0 }).trimEnd();
  return content.slice(0, fmStart) + `---\n${newFm}\n---` + content.slice(fmEnd);
}

async function ghFetch(env: Env, path: string, init?: RequestInit): Promise<Response> {
  const repo = env.GITHUB_REPO ?? 'csh-cz/web';
  const url = `${GITHUB_API}/repos/${repo}${path}`;
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${env.GITHUB_BOT_PAT}`);
  headers.set('Accept', 'application/vnd.github+json');
  headers.set('User-Agent', 'csh-cz-workflow-transition');
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(url, { ...init, headers });
}

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  // Stejné Access policy jako /admin/* — Cloudflare už vrátil JWT before us.
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', Allow: 'POST' },
    });
  }

  const editor = getEditorEmail(request);
  if (!editor) {
    return new Response(JSON.stringify({ error: 'not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { collection?: string; id?: string; action?: Action; notes?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { collection, id, action, notes } = body;
  if (!collection || !COLLECTIONS[collection]) {
    return new Response(JSON.stringify({ error: 'invalid collection', valid: Object.keys(COLLECTIONS) }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (!id || !/^[\w-]+$/.test(id)) {
    return new Response(JSON.stringify({ error: 'invalid id (alfanumerické + dash + underscore only)' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (!action || !['claim', 'release', 'submit-review', 'approve'].includes(action)) {
    return new Response(JSON.stringify({ error: 'invalid action', valid: ['claim', 'release', 'submit-review', 'approve'] }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const cfg = COLLECTIONS[collection];
  const branch = env.GITHUB_DEFAULT_BRANCH ?? 'main';

  // Probe extensions, find which file exists.
  let path: string | null = null;
  let sha: string | null = null;
  let currentContent: string | null = null;
  for (const ext of cfg.extensions) {
    const p = `${cfg.folder}/${id}${ext}`;
    const res = await ghFetch(env, `/contents/${encodeURIComponent(p)}?ref=${branch}`);
    if (res.ok) {
      const json = (await res.json()) as { content: string; sha: string };
      path = p;
      sha = json.sha;
      currentContent = decodeBase64Utf8(json.content);
      break;
    }
  }
  if (!path || !currentContent || !sha) {
    return new Response(JSON.stringify({ error: 'file not found', tried: cfg.extensions.map((e) => `${cfg.folder}/${id}${e}`) }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Parse current workflow
  const fmMatch = currentContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) {
    return new Response(JSON.stringify({ error: 'no frontmatter in file' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  let currentWorkflow: WorkflowFields = {};
  try {
    const fmData = yamlParse(fmMatch[1]) as { workflow?: WorkflowFields };
    currentWorkflow = fmData?.workflow ?? {};
  } catch (e) {
    return new Response(JSON.stringify({ error: 'frontmatter parse error', reason: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate transition: simple rules. V1 nezakazuje cross-state moves
  // pro flexibility, jen některé combinations vrátí warn (ale projdou).
  if (action === 'approve' && currentWorkflow.status !== 'review') {
    return new Response(JSON.stringify({
      error: 'invalid transition',
      reason: `approve vyžaduje status='review' (current: ${currentWorkflow.status ?? 'undefined'})`,
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (action === 'submit-review' && currentWorkflow.status !== 'in-progress') {
    return new Response(JSON.stringify({
      error: 'invalid transition',
      reason: `submit-review vyžaduje status='in-progress' (current: ${currentWorkflow.status ?? 'undefined'})`,
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Apply action
  const { next, newStatus } = applyAction(currentWorkflow, action, editor, notes);
  const newContent = updateFrontmatterWorkflow(currentContent, next);

  // PUT file = commit
  const commitMessage = `chore(workflow): ${action} ${collection}/${id} [editor: ${editor}]`;
  const putRes = await ghFetch(env, `/contents/${encodeURIComponent(path)}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: commitMessage,
      content: encodeBase64Utf8(newContent),
      sha,
      branch,
      author: {
        name: env.BOT_AUTHOR_NAME ?? DEFAULT_BOT_NAME,
        email: env.BOT_AUTHOR_EMAIL ?? DEFAULT_BOT_EMAIL,
      },
    }),
  });

  if (!putRes.ok) {
    const txt = await putRes.text();
    return new Response(JSON.stringify({
      error: 'github commit failed',
      status: putRes.status,
      reason: txt.slice(0, 500),
    }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const putJson = (await putRes.json()) as { commit: { sha: string } };
  return new Response(JSON.stringify({
    ok: true,
    status: newStatus,
    action,
    commit_sha: putJson.commit.sha,
    editor,
    path,
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
