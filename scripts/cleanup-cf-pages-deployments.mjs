#!/usr/bin/env node
/**
 * Cleanup starých Cloudflare Pages preview deployments.
 *
 * CF Pages free tier ukládá historii deployů bez explicitního limitu, ale
 * dashboard zpomaluje (a kvóta na storage objektů taky roste). Tento skript
 * smaže preview deployments starší než N dní pro oba projekty, nechá
 * production deployments (na main branch) netknuté.
 *
 * Použití:
 *   node scripts/cleanup-cf-pages-deployments.mjs --days 30           # dry-run
 *   node scripts/cleanup-cf-pages-deployments.mjs --days 30 --apply   # ostrý běh
 *   node scripts/cleanup-cf-pages-deployments.mjs --project hodinarium-eu --days 60
 *
 * Credentials z .dev.vars (gitignored) nebo z env:
 *   CF_ACCOUNT_ID         — Cloudflare Account ID (stejný jako R2_ACCOUNT_ID)
 *   CF_API_TOKEN          — CF API token s "Pages: Edit" oprávněním
 *                           (NE R2 token; tento je samostatný)
 *
 * Pokud CF_API_TOKEN chybí, skript vypíše instrukce, jak ho vytvořit.
 */
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..');

// --- .dev.vars loader ---
async function loadDevVars() {
  try {
    const txt = await readFile(join(ROOT, '.dev.vars'), 'utf-8');
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!m || process.env[m[1]] !== undefined) continue;
      let v = m[2];
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      process.env[m[1]] = v;
    }
  } catch { /* no .dev.vars, OK */ }
}
await loadDevVars();

// --- CLI args ---
const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const daysIdx = args.indexOf('--days');
const DAYS = daysIdx >= 0 && args[daysIdx + 1] ? parseInt(args[daysIdx + 1], 10) : 30;
const projectIdx = args.indexOf('--project');
const PROJECT_FILTER = projectIdx >= 0 ? args[projectIdx + 1] : null;

const ACCOUNT_ID = process.env.CF_ACCOUNT_ID || process.env.R2_ACCOUNT_ID;
const API_TOKEN = process.env.CF_API_TOKEN;

if (!ACCOUNT_ID || !API_TOKEN) {
  console.error('✗ Chybí CF_ACCOUNT_ID a/nebo CF_API_TOKEN.');
  console.error('');
  console.error('Nastavení (jednou):');
  console.error('  1. https://dash.cloudflare.com/profile/api-tokens → „Create Token"');
  console.error('  2. Custom token s permission: Account → Cloudflare Pages → Edit');
  console.error('  3. Account Resources: include current account');
  console.error('  4. Token zkopírovat (CF ho zobrazí jen jednou)');
  console.error('  5. Přidat do .dev.vars: CF_API_TOKEN=<token>');
  console.error('     (CF_ACCOUNT_ID už máš jako R2_ACCOUNT_ID, použije se automaticky)');
  process.exit(1);
}

const PROJECTS = PROJECT_FILTER ? [PROJECT_FILTER] : ['hodinarium-eu', 'horologie-cz'];
const CUTOFF = Date.now() - DAYS * 24 * 60 * 60 * 1000;

console.log(`▸ Cleanup preview deploys starší než ${DAYS} dní`);
console.log(`▸ Cutoff: ${new Date(CUTOFF).toISOString()}`);
console.log(`▸ Mode: ${APPLY ? 'APPLY (delete)' : 'DRY-RUN (preview only)'}`);
console.log('');

async function cfFetch(path, init = {}) {
  const url = `https://api.cloudflare.com/client/v4${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`CF API ${res.status} on ${path}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

async function listDeployments(project) {
  const all = [];
  let page = 1;
  while (true) {
    const data = await cfFetch(
      `/accounts/${ACCOUNT_ID}/pages/projects/${project}/deployments?page=${page}&per_page=100`
    );
    if (!data.success) {
      console.error(`✗ ${project}: ${JSON.stringify(data.errors)}`);
      return [];
    }
    all.push(...data.result);
    if (data.result.length < 100) break;
    page++;
    if (page > 50) {
      console.warn(`  ⚠ list page limit (50) — některé starší deploys nelze prozkoumat`);
      break;
    }
  }
  return all;
}

async function deleteDeployment(project, deployId) {
  await cfFetch(
    `/accounts/${ACCOUNT_ID}/pages/projects/${project}/deployments/${deployId}`,
    { method: 'DELETE' }
  );
}

let totalSeen = 0;
let totalCandidates = 0;
let totalDeleted = 0;
let totalErrors = 0;

for (const project of PROJECTS) {
  console.log(`=== ${project} ===`);
  let deployments;
  try {
    deployments = await listDeployments(project);
  } catch (e) {
    console.error(`  ✗ list selhal: ${e.message}`);
    continue;
  }
  console.log(`  ${deployments.length} deployments celkem`);
  totalSeen += deployments.length;

  // Group: production (main branch) vs preview (PR/feature branches)
  const production = deployments.filter((d) => d.environment === 'production');
  const previews = deployments.filter((d) => d.environment === 'preview');
  console.log(`  ${production.length} production, ${previews.length} preview`);

  // Find old preview candidates
  const candidates = previews.filter((d) => {
    const created = new Date(d.created_on).getTime();
    return created < CUTOFF;
  });
  console.log(`  ${candidates.length} preview deploys starších než ${DAYS} dní → kandidáti na smazání`);
  totalCandidates += candidates.length;

  if (candidates.length === 0) continue;

  // Display top 10
  for (const d of candidates.slice(0, 10)) {
    const date = new Date(d.created_on).toISOString().slice(0, 10);
    const branch = d.deployment_trigger?.metadata?.branch ?? '?';
    console.log(`    ${date}  ${d.id.slice(0, 8)}  branch=${branch}  ${d.url}`);
  }
  if (candidates.length > 10) console.log(`    ... +${candidates.length - 10} dalších`);

  if (!APPLY) {
    console.log(`  (dry-run, nic se nesmazalo)`);
    continue;
  }

  // Delete
  console.log(`  ▸ Mazání ${candidates.length} deploys…`);
  let deleted = 0;
  let errors = 0;
  for (const d of candidates) {
    try {
      await deleteDeployment(project, d.id);
      deleted++;
      if (deleted % 10 === 0) {
        process.stdout.write(`    deleted ${deleted}/${candidates.length}\n`);
      }
    } catch (e) {
      errors++;
      console.error(`    ✗ ${d.id.slice(0, 8)}: ${e.message}`);
    }
  }
  console.log(`  ✓ Smazáno ${deleted}, chyb ${errors}`);
  totalDeleted += deleted;
  totalErrors += errors;
}

console.log('');
console.log(`=== Souhrn ===`);
console.log(`Deployments scanováno: ${totalSeen}`);
console.log(`Kandidátů ke smazání:  ${totalCandidates}`);
if (APPLY) {
  console.log(`Smazáno:               ${totalDeleted}`);
  if (totalErrors) console.log(`Chyb:                  ${totalErrors}`);
} else {
  console.log(`Pro reálné smazání:    spusť znovu s flagem --apply`);
}
