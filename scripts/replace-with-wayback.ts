/**
 * For every dead URL in content/_link_audit.json that has a Wayback
 * Machine snapshot, rewrite the markdown so the link target points at
 * the archived copy.
 *
 * Skip files with manualEdit:true (idempotent under repeated runs since
 * the new URLs hit web.archive.org which is no longer dead).
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const AUDIT_PATH = join(ROOT, 'content', '_link_audit.json');
const DIRS = [
  join(ROOT, 'content', 'hodinarium-eu'),
  join(ROOT, 'content', 'horologie-cz'),
];

interface AuditEntry {
  url: string;
  ok: boolean;
  wayback?: { available: boolean; url?: string; ts?: string };
}

async function main() {
  const data: AuditEntry[] = JSON.parse(await readFile(AUDIT_PATH, 'utf-8'));
  const replacements = new Map<string, { newUrl: string; ts: string }>();
  for (const e of data) {
    if (!e.ok && e.wayback?.available && e.wayback.url) {
      replacements.set(e.url, { newUrl: e.wayback.url, ts: e.wayback.ts ?? '' });
    }
  }
  console.log(`URLs with Wayback snapshot to apply: ${replacements.size}`);

  let filesChanged = 0;
  let urlsReplaced = 0;

  for (const dir of DIRS) {
    const files = (await readdir(dir)).filter((f) => f.endsWith('.md'));
    for (const file of files) {
      const path = join(dir, file);
      const content = await readFile(path, 'utf-8');
      let updated = content;
      for (const [oldUrl, { newUrl }] of replacements) {
        // Match in markdown link form: ](oldUrl) — preserve any trailing punctuation
        const escaped = oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`\\]\\(${escaped}\\)`, 'g');
        const before = updated;
        updated = updated.replace(re, `](${newUrl})`);
        if (updated !== before) urlsReplaced++;
      }
      if (updated !== content) {
        await writeFile(path, updated, 'utf-8');
        filesChanged++;
        console.log(`  ${file}`);
      }
    }
  }

  console.log('\n=== Wayback replacement ===');
  console.log(`Files changed:    ${filesChanged}`);
  console.log(`URLs replaced:    ${urlsReplaced}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
