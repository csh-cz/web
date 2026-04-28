/**
 * Read content/_link_audit.json and emit:
 *   - content/_dead_links.md  — per-article report of dead/broken links
 *
 * Optionally checks Wayback Machine for archived snapshots and notes
 * which dead URLs have a usable archive copy.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const AUDIT_PATH = join(ROOT, 'content', '_link_audit.json');
const REPORT_PATH = join(ROOT, 'content', '_dead_links.md');

interface AuditEntry {
  url: string;
  hostname: string;
  status: number | null;
  ok: boolean;
  title: string | null;
  ogTitle: string | null;
  siteName: string | null;
  error: string | null;
  articles: string[];
  checkedAt: string;
  wayback?: { available: boolean; url?: string; ts?: string };
}

const FETCH_TIMEOUT_MS = 8000;
const args = process.argv.slice(2);
const CHECK_WAYBACK = args.includes('--wayback');

async function checkWayback(url: string): Promise<{ available: boolean; url?: string; ts?: string }> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(`http://archive.org/wayback/available?url=${encodeURIComponent(url)}`, {
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return { available: false };
    const data = await res.json() as {
      archived_snapshots?: { closest?: { available: boolean; url: string; timestamp: string } }
    };
    const snap = data.archived_snapshots?.closest;
    if (snap?.available) return { available: true, url: snap.url, ts: snap.timestamp };
    return { available: false };
  } catch {
    return { available: false };
  }
}

async function main() {
  const data: AuditEntry[] = JSON.parse(await readFile(AUDIT_PATH, 'utf-8'));
  const dead = data.filter((e) => !e.ok);

  console.log(`Dead links: ${dead.length} of ${data.length} (${(dead.length / data.length * 100).toFixed(1)} %)`);

  if (CHECK_WAYBACK) {
    console.log('Checking Wayback Machine for snapshots…');
    let i = 0;
    for (const e of dead) {
      e.wayback = await checkWayback(e.url);
      i++;
      if (i % 20 === 0) console.log(`  [${i}/${dead.length}]`);
    }
    // save back with wayback info
    await writeFile(AUDIT_PATH, JSON.stringify(data, null, 2), 'utf-8');
  }

  // Group by article
  const byArticle = new Map<string, AuditEntry[]>();
  for (const e of dead) {
    for (const a of e.articles) {
      if (!byArticle.has(a)) byArticle.set(a, []);
      byArticle.get(a)!.push(e);
    }
  }

  // Sort articles by dead-link count
  const articleList = [...byArticle.entries()].sort((a, b) => b[1].length - a[1].length);

  let md = `# Dead links report\n\n`;
  md += `Generováno: ${new Date().toISOString().slice(0, 10)}\n`;
  md += `Audit dat: \`content/_link_audit.json\` (${data.length} unikátních URL).\n\n`;
  md += `**${dead.length} mrtvých linků** (404, DNS fail, timeout, 5xx) napříč ${byArticle.size} články.\n\n`;
  if (CHECK_WAYBACK) {
    const withWayback = dead.filter((e) => e.wayback?.available).length;
    md += `Wayback Machine: ${withWayback} z ${dead.length} (${(withWayback / dead.length * 100).toFixed(0)} %) má archivovaný snapshot.\n\n`;
  }

  // Top hosts
  const hostCount: Record<string, number> = {};
  for (const e of dead) hostCount[e.hostname] = (hostCount[e.hostname] ?? 0) + 1;
  md += `## Top hosty s mrtvými linky\n\n`;
  md += `| Host | Mrtvých |\n|---|---|\n`;
  for (const [h, n] of Object.entries(hostCount).sort((a, b) => b[1] - a[1]).slice(0, 20)) {
    md += `| ${h} | ${n} |\n`;
  }
  md += `\n`;

  // Per-article
  md += `## Mrtvé linky podle článku\n\n`;
  for (const [slug, links] of articleList) {
    md += `### ${slug} (${links.length})\n\n`;
    for (const e of links) {
      const status = e.error ? `ERR ${e.error}` : `HTTP ${e.status}`;
      const wb = e.wayback?.available
        ? ` · [archiv ${e.wayback.ts?.slice(0, 4)}](${e.wayback.url})`
        : '';
      md += `- ${status} — \`${e.url}\`${wb}\n`;
    }
    md += `\n`;
  }

  await writeFile(REPORT_PATH, md, 'utf-8');
  console.log(`\nReport: ${REPORT_PATH}`);
  console.log(`Articles affected: ${byArticle.size}`);
  console.log(`Dead total:        ${dead.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
