#!/usr/bin/env node
/**
 * Vygeneruje seznam všech `/img/...` referencí z content/hodinarium-eu/*.md(x)
 * pro test `tests/regression/missing-images.hodinarium.spec.ts`.
 *
 * Output: tests/regression/img-refs.json (sorted, unique)
 *
 * Použití:
 *   pnpm imgs:refs:build       # regeneruje JSON
 */
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..');

const CONTENT_DIR = join(ROOT, 'content/hodinarium-eu');
const OUTPUT = join(ROOT, 'tests/regression/img-refs.json');

const IMG_RE = /\/img\/[^\)\"' \n\t<>]+\.(?:jpg|JPG|jpeg|png|gif|svg)/g;

/** Recursive walk md/mdx files. */
async function walk(dir) {
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await walk(full)));
    } else if (/\.(md|mdx)$/.test(e.name)) {
      out.push(full);
    }
  }
  return out;
}

const files = await walk(CONTENT_DIR);
console.log(`▸ Scan ${files.length} content files in ${CONTENT_DIR}`);

const images = new Set();
for (const f of files) {
  const txt = await readFile(f, 'utf8');
  for (const m of txt.matchAll(IMG_RE)) {
    images.add(m[0]);
  }
}

const sorted = [...images].sort();
await writeFile(OUTPUT, JSON.stringify(sorted, null, 2) + '\n', 'utf8');
console.log(`▸ Wrote ${sorted.length} unique image refs to ${OUTPUT}`);
