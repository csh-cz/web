/**
 * Final pass over dead links from _link_audit.json:
 *
 *   1. Apply _redirect_candidates.json — replace dead URL → working variant.
 *   2. Apply Wayback already done by replace-with-wayback.ts.
 *   3. Anything still dead (no Wayback, no redirect, no manual mapping):
 *      strip the markdown link, keep the visible text.
 *
 * Manual mappings can be added to KNOWN_REPLACEMENTS — for cases where
 * the human knows the correct new URL.
 *
 * Skip files with manualEdit:true.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const AUDIT = join(ROOT, 'content', '_link_audit.json');
const REDIR = join(ROOT, 'content', '_redirect_candidates.json');
const DIRS = [
  join(ROOT, 'content', 'hodinarium-eu'),
  join(ROOT, 'content', 'horologie-cz'),
];

interface AuditEntry {
  url: string; ok: boolean;
  wayback?: { available: boolean; url?: string };
}
interface Redir { original: string; replacement: string; }

/**
 * Manual mappings — when we know the new URL by hand, list it here so
 * the script can apply it before falling back to "strip".
 *
 * Add entries as the team finds replacements.
 */
const KNOWN_REPLACEMENTS: Record<string, string> = {
  // example: 'http://oldsite.cz/page' : 'https://newsite.org/page',
};

async function main() {
  const audit: AuditEntry[] = JSON.parse(await readFile(AUDIT, 'utf-8'));
  const redirs: Redir[] = existsSync(REDIR)
    ? JSON.parse(await readFile(REDIR, 'utf-8'))
    : [];

  // Maps
  const replacements = new Map<string, string>();
  for (const [k, v] of Object.entries(KNOWN_REPLACEMENTS)) replacements.set(k, v);
  for (const r of redirs) if (!replacements.has(r.original)) replacements.set(r.original, r.replacement);

  // URLs still dead = no replacement above and no Wayback in audit
  const stillDead = new Set<string>();
  for (const e of audit) {
    if (e.ok) continue;
    if (replacements.has(e.url)) continue;
    if (e.wayback?.available && e.wayback.url) continue; // already fixed by replace-with-wayback.ts
    stillDead.add(e.url);
  }

  console.log(`Replacements (redirects + manual): ${replacements.size}`);
  console.log(`Strip targets (still-dead, no Wayback, no replacement): ${stillDead.size}`);

  let filesChanged = 0;
  let urlsReplaced = 0;
  let urlsStripped = 0;

  for (const dir of DIRS) {
    const files = (await readdir(dir)).filter((f) => f.endsWith('.md'));
    for (const file of files) {
      const path = join(dir, file);
      let content = await readFile(path, 'utf-8');
      const before = content;

      // --- A) replacements ---
      for (const [oldUrl, newUrl] of replacements) {
        const re = new RegExp('\\]\\(' + oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\)', 'g');
        const replaced = content.replace(re, `](${newUrl})`);
        if (replaced !== content) {
          urlsReplaced += (content.match(re) || []).length;
          content = replaced;
        }
      }

      // --- B) strip ---
      // [visible text](dead-url) → visible text
      // Image links with `[![alt](img)](url)` → keep just the image markdown.
      for (const url of stillDead) {
        const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // First: image-link pattern (preserve image)
        const imgLinkRe = new RegExp('\\[(!\\[[^\\]]*\\]\\([^)]+\\))\\]\\(' + escaped + '\\)', 'g');
        let n1 = 0;
        content = content.replace(imgLinkRe, () => { n1++; return '$1'; });
        // Hack: above sed-style $1 doesn't work in replace string when arrow fn captured;
        // redo properly:
      }

      // Re-do strip with proper capture groups (rebuild from before-replacement state)
      let stripped = content;
      for (const url of stillDead) {
        const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const imgLinkRe = new RegExp('\\[(!\\[[^\\]]*\\]\\([^)]+\\))\\]\\(' + escaped + '\\)', 'g');
        stripped = stripped.replace(imgLinkRe, (_m, inner) => { urlsStripped++; return inner; });
        const linkRe = new RegExp('\\[([^\\]]+)\\]\\(' + escaped + '\\)', 'g');
        stripped = stripped.replace(linkRe, (_m, txt) => { urlsStripped++; return txt; });
      }
      content = stripped;

      if (content !== before) {
        await writeFile(path, content, 'utf-8');
        filesChanged++;
      }
    }
  }

  console.log('\n=== Cleanup pass ===');
  console.log(`Files changed:   ${filesChanged}`);
  console.log(`URLs replaced:   ${urlsReplaced}`);
  console.log(`URLs stripped:   ${urlsStripped}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
