/**
 * Format the entries in every "## Odkazy" section into a consistent
 * ISO 690-light shape:
 *
 *   - [Název článku](URL) — Web. [cit. 2026-04-28]
 *
 * Inputs:
 *   - content/_link_audit.json — fetched <title>, og:title, og:site_name,
 *     hostname and checkedAt for every URL
 *
 * Behaviour per link in an "## Odkazy" bullet:
 *   - If the current caption is generic (a host, "zde", "tady", "link",
 *     just the URL, "wikipedia"…), replace it with the fetched title.
 *   - Append " — <Web>. [cit. RRRR-MM-DD]" if not already present.
 *   - Leave the URL alone.
 *   - Skip if the link target is internal (/clanky/..., /img/...) or
 *     mailto:/tel:/.
 *   - Skip if the bullet already ends with "[cit. " (idempotent re-run).
 *
 * Site name preference: og:site_name → cleaned hostname (drop www.).
 *
 * Skips files with manualEdit:true? — NO. Formatting is purely cosmetic
 * and we want every article's references to look the same.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const AUDIT = join(ROOT, 'content', '_link_audit.json');
const DIRS = [
  join(ROOT, 'content', 'hodinarium-eu'),
  join(ROOT, 'content', 'horologie-cz'),
];

interface AuditEntry {
  url: string;
  hostname: string;
  status: number | null;
  ok: boolean;
  title: string | null;
  ogTitle: string | null;
  siteName: string | null;
  error: string | null;
  checkedAt: string;
}

const GENERIC_CAPTIONS = new Set([
  'zde', 'tady', 'tam', 'tu', 'link', 'odkaz', 'webu', 'webová stránka',
  'wikipedia', 'wikipedie', 'cs.wikipedia.org', 'en.wikipedia.org',
  'home', 'homepage', 'domovská stránka',
]);

function isGenericCaption(text: string, url: string): boolean {
  const t = text.trim().toLowerCase();
  if (t.length === 0) return true;
  if (GENERIC_CAPTIONS.has(t)) return true;
  // Caption is just the URL itself (or part of it)
  if (url.toLowerCase().includes(t) && t.length < url.length / 2) return true;
  // Caption is a hostname-like string
  if (/^[\w-]+\.[\w.-]+$/.test(t)) return true;
  // Caption contains URL fragments
  if (t.startsWith('http') || t.startsWith('www.')) return true;
  return false;
}

function cleanTitle(raw: string): string {
  // Strip a common trailing " | Site Name" / " - Site Name" suffix.
  return raw.replace(/\s*[|–—-]\s*[^|]+$/, '').trim().slice(0, 120);
}

function siteLabel(entry: AuditEntry): string {
  if (entry.siteName) return entry.siteName.trim().slice(0, 60);
  return entry.hostname.replace(/^www\./, '');
}

function pickTitle(entry: AuditEntry): string | null {
  const candidates = [entry.title, entry.ogTitle].filter(Boolean) as string[];
  for (const raw of candidates) {
    const cleaned = cleanTitle(raw);
    if (cleaned.length >= 4) return cleaned;
  }
  return null;
}

interface Stats {
  filesScanned: number;
  filesUpdated: number;
  bulletsRewritten: number;
  bulletsCaptionFilled: number;
  bulletsAlreadyOk: number;
  bulletsNoAuditEntry: number;
}

function processFile(content: string, audit: Map<string, AuditEntry>, stats: Stats): string {
  // Find each "## Odkazy" section and operate on its bullet list
  const lines = content.split('\n');
  let inOdkazy = false;
  let inFM = false;
  let fmDone = 0;
  const out: string[] = [];

  for (const line of lines) {
    if (line === '---') { fmDone++; inFM = fmDone === 1; out.push(line); continue; }
    if (fmDone < 2) { out.push(line); continue; }

    // Detect heading transitions
    if (/^##\s+Odkazy\s*$/.test(line)) {
      inOdkazy = true;
      out.push(line);
      continue;
    }
    if (/^#{1,6}\s/.test(line) && inOdkazy) {
      inOdkazy = false;
    }

    if (!inOdkazy) {
      out.push(line);
      continue;
    }

    // We're inside "## Odkazy". Try to format bullet lines.
    const bullet = line.match(/^(\s*-\s+)(.*)$/);
    if (!bullet) { out.push(line); continue; }

    const [, prefix, body] = bullet;

    // Find first markdown link in body
    const linkMatch = body.match(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/);
    if (!linkMatch) { out.push(line); continue; }

    const [, captionRaw, url] = linkMatch;
    const audited = audit.get(url) || audit.get(url.replace(/\/$/, '')) || audit.get(url + '/');

    // Skip if already formatted (contains [cit. )
    if (/\[cit\.\s+\d{4}-\d{2}-\d{2}\]/.test(body)) {
      stats.bulletsAlreadyOk++;
      out.push(line);
      continue;
    }

    if (!audited) {
      stats.bulletsNoAuditEntry++;
      out.push(line);
      continue;
    }

    let newCaption = captionRaw;
    if (isGenericCaption(captionRaw, url)) {
      const fetchedTitle = pickTitle(audited);
      if (fetchedTitle) {
        newCaption = fetchedTitle;
        stats.bulletsCaptionFilled++;
      }
    }

    const site = siteLabel(audited);
    const cit = (audited.checkedAt ?? '').slice(0, 10) || new Date().toISOString().slice(0, 10);

    // Reconstruct the bullet:
    // - [Caption](url) — Web. [cit. 2026-04-28]
    const newBullet = `${prefix}[${newCaption}](${url}) — ${site}. [cit. ${cit}]`;
    if (newBullet !== line) {
      stats.bulletsRewritten++;
      out.push(newBullet);
    } else {
      out.push(line);
    }
  }

  return out.join('\n');
}

async function main() {
  const auditArr: AuditEntry[] = JSON.parse(await readFile(AUDIT, 'utf-8'));
  const audit = new Map<string, AuditEntry>();
  for (const e of auditArr) audit.set(e.url, e);

  const stats: Stats = {
    filesScanned: 0,
    filesUpdated: 0,
    bulletsRewritten: 0,
    bulletsCaptionFilled: 0,
    bulletsAlreadyOk: 0,
    bulletsNoAuditEntry: 0,
  };

  for (const dir of DIRS) {
    const files = (await readdir(dir)).filter((f) => f.endsWith('.md'));
    for (const file of files) {
      const path = join(dir, file);
      const content = await readFile(path, 'utf-8');
      stats.filesScanned++;
      const updated = processFile(content, audit, stats);
      if (updated !== content) {
        await writeFile(path, updated, 'utf-8');
        stats.filesUpdated++;
        console.log(`  ${file}`);
      }
    }
  }

  console.log('\n=== Format references ===');
  console.log(`Files scanned:           ${stats.filesScanned}`);
  console.log(`Files updated:           ${stats.filesUpdated}`);
  console.log(`Bullets rewritten:       ${stats.bulletsRewritten}`);
  console.log(`Captions filled:         ${stats.bulletsCaptionFilled}`);
  console.log(`Already formatted:       ${stats.bulletsAlreadyOk}`);
  console.log(`No audit entry:          ${stats.bulletsNoAuditEntry}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
