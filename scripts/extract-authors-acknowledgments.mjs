#!/usr/bin/env node
/**
 * extract-authors-acknowledgments.mjs — najde body patterns a přesune
 * do frontmatter:
 *   - `*Foto: X*` (na samostatné řádce, případně poslední řádek)
 *     → frontmatter `photoAuthor: X`
 *   - `## Poděkování` heading + následující obsah až do dalšího heading
 *     → frontmatter `acknowledgments: <content>`
 *
 * Per user feedback: 'Sjednotit sekci Poděkování a Autoři. Do Autorů
 * dát vždy Text: a Foto:. Jména zkracovat — iniciála křestního, plné
 * příjmení. Pokud je poděkování v textu, přesunout do sekce.'
 *
 * Použití:
 *   node scripts/extract-authors-acknowledgments.mjs            # dry-run
 *   node scripts/extract-authors-acknowledgments.mjs --apply
 */

import { readFile, writeFile, glob } from 'node:fs/promises';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const apply = process.argv.includes('--apply');

function splitFrontmatter(md) {
  const m = /^---\n([\s\S]*?\n)---\n([\s\S]*)$/.exec(md);
  if (!m) return null;
  return {
    rawHeader: '---\n' + m[1] + '---\n',
    frontmatter: m[1],
    body: m[2],
  };
}

/**
 * Extract `*Foto: X*` z body. Vrací { photoAuthor, body }.
 * Pattern hledá samostatný italic blok s prefix Foto:.
 */
function extractPhotoAuthor(body) {
  // `*Foto: ...*` na samostatné řádce (typicky na konci článku)
  const re = /^\*Foto:\s+([^*]+)\*$/gm;
  const matches = [...body.matchAll(re)];
  if (matches.length === 0) return { photoAuthor: null, body };
  // Vezmi první nález; pokud je víc, sloučí je (rare case)
  const photoAuthor = matches.map((m) => m[1].trim()).join('; ');
  // Strip všech matches z body
  const cleaned = body.replace(re, '').replace(/\n{3,}/g, '\n\n');
  return { photoAuthor, body: cleaned };
}

/**
 * Extract `## Poděkování` section z body.
 */
function extractAcknowledgments(body) {
  // Najdi ## / ### / #### Poděkování, vezmi content až do dalšího heading.
  const re = /^(#{2,4})\s+Poděkování\s*\n([\s\S]*?)(?=\n#{1,4}\s|\n*$)/m;
  const m = re.exec(body);
  if (!m) return { acknowledgments: null, body };
  const content = m[2].trim();
  if (!content) return { acknowledgments: null, body };
  // Strip whole section (including heading + content)
  const start = m.index;
  const end = m.index + m[0].length;
  const cleaned = (body.slice(0, start) + body.slice(end)).replace(/\n{3,}/g, '\n\n');
  return { acknowledgments: content, body: cleaned };
}

/**
 * Inject nové YAML fields do frontmatter (pokud neexistují).
 * Pro multiline acknowledgments použij block scalar `|`.
 */
function injectFrontmatter(fm, fields) {
  let out = fm;
  // Smaž existující empty fields (např. `photoAuthor: ''`)
  const insertions = [];
  for (const [k, v] of Object.entries(fields)) {
    if (v == null || v === '') continue;
    const exists = new RegExp(`^${k}:\\s+\\S`, 'm').test(out);
    if (exists) continue;
    if (v.includes('\n')) {
      // Multiline (acknowledgments)
      const indented = v.split('\n').map((l) => '  ' + l).join('\n');
      insertions.push(`${k}: |\n${indented}\n`);
    } else {
      // Single-line — YAML-quote pokud má speciální znaky včetně markdown
      // [link](...) syntax (YAML interpretuje `[` jako flow sequence).
      const needsQuote = /[:#&*?{}[\]|>'"%@`]|^\s|\s$/.test(v);
      const value = needsQuote ? `"${v.replace(/"/g, '\\"')}"` : v;
      insertions.push(`${k}: ${value}\n`);
    }
  }
  if (insertions.length === 0) return out;
  // Append na konec frontmatteru
  return out.trimEnd() + '\n' + insertions.join('');
}

async function processFile(path) {
  const md = await readFile(path, 'utf-8');
  const split = splitFrontmatter(md);
  if (!split) return null;

  const { rawHeader, frontmatter, body } = split;

  // Extract Foto + Poděkování
  const { photoAuthor, body: bodyAfterFoto } = extractPhotoAuthor(body);
  const { acknowledgments, body: bodyAfterAck } = extractAcknowledgments(bodyAfterFoto);

  if (!photoAuthor && !acknowledgments) return null;

  const newFm = injectFrontmatter(frontmatter, {
    photoAuthor,
    acknowledgments,
  });
  const newHeader = '---\n' + newFm + '---\n';

  if (apply) {
    await writeFile(path, newHeader + bodyAfterAck);
  }
  return { photoAuthor, acknowledgments: acknowledgments?.slice(0, 60) };
}

async function main() {
  process.chdir(ROOT);
  const paths = [];
  for await (const p of glob('content/**/*.md')) paths.push(p);
  for await (const p of glob('content/**/*.mdx')) paths.push(p);

  let touched = 0;
  let foto = 0;
  let pod = 0;
  const log = [];
  for (const path of paths) {
    const r = await processFile(path);
    if (!r) continue;
    touched++;
    if (r.photoAuthor) foto++;
    if (r.acknowledgments) pod++;
    log.push({ path, ...r });
  }

  console.log(`# Extract authors + acknowledgments — ${apply ? 'APPLY' : 'DRY-RUN'}\n`);
  console.log(`Touched: ${touched} files (foto=${foto}, pod=${pod})\n`);
  for (const e of log.slice(0, 30)) {
    const parts = [];
    if (e.photoAuthor) parts.push(`foto="${e.photoAuthor.slice(0, 50)}"`);
    if (e.acknowledgments) parts.push(`pod="${e.acknowledgments.slice(0, 40)}..."`);
    console.log(`  ${e.path}  ${parts.join(' ')}`);
  }
  if (log.length > 30) console.log(`  … +${log.length - 30}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
