#!/usr/bin/env node
/**
 * D6 Slug standardizace — APPLY (ostrá verze).
 *
 * Pro každý non-kebab soubor v content/{hodinarium-eu,kronika}/:
 *   1. Read file content + parse frontmatter slug
 *   2. Compute new slug (override map nebo kebabize)
 *   3. Write content na nový path s updated `slug:` field
 *   4. Delete starý soubor
 *   5. Collect mapping pro redirect generation
 *
 * Output:
 *   - Renamed files
 *   - apps/hodinarium-eu/src/data/d6-slug-renames.json — mapping pro
 *     scripts/build-redirects.ts (nutné pro 301 redirects)
 *   - Console summary (counts, errors)
 *
 * Po dokončení skriptu uživatel:
 *   - Pustí build-redirects (regen redirects)
 *   - Pustí inline link grep + replace (separátní krok)
 *   - Build verify + commit + push
 */
import { readFile, writeFile, unlink, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..');

/** User-approved overrides for ambiguous slugs (zkratky, descriptive renames). */
const OVERRIDES = {
  'kvetinovehodiny_NMnM': 'kvetinovehodiny-nove-mesto-nad-metuji',
  'muzeum_tyniste_n_orlici': 'muzeum-tyniste-nad-orlici',
  '12_24': 'hodinky-12-24-ciferniku',
};

const COLLECTIONS = [
  { name: 'hodinarium-eu', folder: 'content/hodinarium-eu' },
  { name: 'kronika', folder: 'content/kronika' },
];

function kebabize(s) {
  return s
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function isKebab(s) {
  return /^[a-z0-9-]+$/.test(s) && !s.includes('--') && !s.startsWith('-') && !s.endsWith('-');
}

/** Replace `slug: "<old>"` (or unquoted, single-quoted) v YAML frontmatteru. */
function updateFrontmatterSlug(content, newSlug) {
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) return content; // bez FM, nepatřičné
  const fmRaw = fmMatch[1];
  // Match: slug: "...", slug: '...', slug: ...  (s/bez quotes)
  const newFm = fmRaw.replace(/^(\s*slug:\s*)(["']?)([^"'\r\n]+)\2/m, `$1"${newSlug}"`);
  return content.replace(fmRaw, newFm);
}

const renamed = []; // { collection, oldId, newId, oldFile, newFile }
const errors = [];

for (const col of COLLECTIONS) {
  const dir = join(ROOT, col.folder);
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    continue;
  }
  for (const e of entries) {
    if (!e.isFile()) continue;
    if (!e.name.endsWith('.md') && !e.name.endsWith('.mdx')) continue;
    if (e.name.startsWith('_')) continue; // skip drafts/test fixtures
    const ext = e.name.endsWith('.mdx') ? '.mdx' : '.md';
    const oldId = e.name.slice(0, -ext.length);
    if (isKebab(oldId)) continue;
    const newId = OVERRIDES[oldId] ?? kebabize(oldId);
    if (oldId === newId) continue; // bez změny

    const oldFile = join(dir, e.name);
    const newFile = join(dir, `${newId}${ext}`);

    if (existsSync(newFile)) {
      errors.push({ oldId, newId, reason: 'target file exists' });
      continue;
    }

    try {
      const content = await readFile(oldFile, 'utf-8');
      const updated = updateFrontmatterSlug(content, newId);
      await writeFile(newFile, updated, 'utf-8');
      await unlink(oldFile);
      renamed.push({
        collection: col.name,
        oldId,
        newId,
        oldFile: oldFile.replace(`${ROOT}/`, ''),
        newFile: newFile.replace(`${ROOT}/`, ''),
      });
    } catch (err) {
      errors.push({ oldId, newId, reason: String(err) });
    }
  }
}

// Save mapping pro redirect generation
const mappingPath = join(ROOT, 'apps/hodinarium-eu/src/data/d6-slug-renames.json');
await writeFile(mappingPath, JSON.stringify({
  generatedAt: new Date().toISOString(),
  count: renamed.length,
  renames: renamed.map((r) => ({ collection: r.collection, oldId: r.oldId, newId: r.newId })),
}, null, 2) + '\n', 'utf-8');

console.log(`✓ Renamed ${renamed.length} files`);
console.log(`✓ Mapping → ${mappingPath.replace(`${ROOT}/`, '')}`);
if (errors.length > 0) {
  console.log(`✗ ${errors.length} errors:`);
  for (const e of errors) console.log(`  ${e.oldId} → ${e.newId}: ${e.reason}`);
}
