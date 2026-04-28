/**
 * For dead URLs in _link_audit.json (no Wayback snapshot), try common
 * URL variants that often resolve when the original 404s:
 *
 *   http://www.X     →  https://www.X, https://X
 *   https://www.X    →  https://X
 *   trailing slash flip
 *   /index.html / .htm dropped
 *
 * If a variant returns 2xx, mark it for replacement. Output:
 *   content/_redirect_candidates.json
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const AUDIT = join(ROOT, 'content', '_link_audit.json');
const OUT = join(ROOT, 'content', '_redirect_candidates.json');

const TIMEOUT = 8000;
const UA = 'Mozilla/5.0 (compatible; CSH-LinkAudit/1.0)';

interface AuditEntry {
  url: string; ok: boolean; status: number | null; error: string | null;
  wayback?: { available: boolean; url?: string };
}

function variants(orig: string): string[] {
  const out = new Set<string>();
  let url = orig;
  // protocol flips
  out.add(url.replace(/^http:/, 'https:'));
  out.add(url.replace(/^https:/, 'http:'));
  // www flips
  out.add(url.replace(/^(https?:\/\/)www\./, '$1'));
  out.add(url.replace(/^(https?:\/\/)(?!www\.)/, '$1www.'));
  // trailing slash
  out.add(url.endsWith('/') ? url.slice(0, -1) : url + '/');
  // strip /index.html / .htm at end
  out.add(url.replace(/\/index\.html?$/i, '/'));
  out.add(url.replace(/\.htm$/i, '.html'));
  out.add(url.replace(/\.html$/i, '.htm'));
  // combine protocol + www
  for (const v of [...out]) {
    out.add(v.replace(/^http:/, 'https:'));
    out.add(v.replace(/^(https?:\/\/)www\./, '$1'));
  }
  out.delete(orig);
  return [...out];
}

async function probe(url: string): Promise<{ ok: boolean; status: number; finalUrl: string }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    let res = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': UA }, redirect: 'follow', signal: ctrl.signal });
    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, { method: 'GET', headers: { 'User-Agent': UA }, redirect: 'follow', signal: ctrl.signal });
    }
    return { ok: res.ok, status: res.status, finalUrl: res.url };
  } catch {
    return { ok: false, status: 0, finalUrl: url };
  } finally {
    clearTimeout(t);
  }
}

async function main() {
  const data: AuditEntry[] = JSON.parse(await readFile(AUDIT, 'utf-8'));
  const dead = data.filter((e) => !e.ok && !(e.wayback?.available));
  console.log(`Probing ${dead.length} dead URLs for redirects/variants…`);

  const candidates: Array<{ original: string; replacement: string; finalStatus: number }> = [];
  let i = 0;
  for (const e of dead) {
    i++;
    for (const v of variants(e.url)) {
      const r = await probe(v);
      if (r.ok && r.status >= 200 && r.status < 300) {
        candidates.push({ original: e.url, replacement: r.finalUrl, finalStatus: r.status });
        console.log(`  [${i}/${dead.length}] ${e.url.slice(0, 60)} → ${r.finalUrl}`);
        break;
      }
    }
  }

  await writeFile(OUT, JSON.stringify(candidates, null, 2), 'utf-8');
  console.log(`\nFound ${candidates.length} working variants of ${dead.length} dead URLs.`);
  console.log(`Output: ${OUT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
