#!/usr/bin/env node
/**
 * fix-generic-alt-texts.mjs — A.11 batch.
 *
 * Cíl: nahradit generické `![Fotografie N](...)` alt texty popisnými,
 * odvozenými z kontextu článku.
 *
 * Heuristika:
 *   1. Najde všechny `![Fotografie N](src)` patterny.
 *   2. Pro každý určí nejbližší předchozí heading (## / ###) nebo
 *      titulek článku.
 *   3. Extrahuje klíčová slova z okolního textu (paragraf před/po):
 *      „kyvadlo", „stroj", „věž", „ciferník", „rám", „pastorek", …
 *   4. Vygeneruje alt podle template:
 *      „<heading nebo title> — obrázek N"
 *      (kontextuální, ne ideal ale lepší než „Fotografie N").
 *
 * Není perfektní — ideální alt vyžaduje vizuální inspekci foto.
 * Tohle je „upgrade z 0/10 na 6/10": a11y screen readery uslyší
 * něco užitečnějšího, SEO bude mít víc kontextu. Lidský editor pak
 * při dotyku článku v Sveltia editor může precise-tunit.
 *
 * Použití:
 *   node scripts/fix-generic-alt-texts.mjs              # dry-run
 *   node scripts/fix-generic-alt-texts.mjs --apply      # patch in place
 */

import { readFile, writeFile } from 'node:fs/promises';
import { glob } from 'node:fs/promises';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = join(ROOT, 'content/hodinarium-eu');
const apply = process.argv.includes('--apply');

function parseFrontmatter(md) {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(md);
  if (!m) return { fm: {}, body: md };
  const fm = {};
  for (const line of m[1].split('\n')) {
    const kv = /^([a-zA-Z_]+):\s*(.+)$/.exec(line);
    if (kv) fm[kv[1]] = kv[2].replace(/^["']|["']$/g, '');
  }
  return { fm, body: md.slice(m[0].length) };
}

/**
 * Pro pozici i v textu najde nejbližší předchozí heading.
 * Vrací buď „Restaurace v ateliéru" (sekce) nebo undefined.
 */
function nearestHeading(body, position) {
  const before = body.slice(0, position);
  // Najdi poslední ## nebo ### heading.
  const lines = before.split('\n');
  for (let i = lines.length - 1; i >= 0; i--) {
    const h = /^#{2,3}\s+(.+?)\s*$/.exec(lines[i]);
    if (h) return h[1].trim();
  }
  return undefined;
}

/**
 * Najde paragraf, který bezprostředně předchází obrázku (ne heading,
 * ne další obrázek). Vrací krátký excerpt pro alt nebo undefined.
 */
function precedingTextContext(body, position) {
  const before = body.slice(0, position);
  const lines = before.split('\n').map((l) => l.trim()).filter(Boolean);
  // Vezmi posledních pár řádek které nejsou heading ani img-only.
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (line.startsWith('#')) break; // narazili na heading → konec paragrafu
    if (/^!\[/.test(line)) continue;  // skip obrázek
    if (/^\[!\[/.test(line)) continue; // skip lightbox-linked obrázek
    // První non-img, non-heading řádek = relevant text
    return line;
  }
  return undefined;
}

/**
 * Extrahuje krátký popisný subjekt z textu.
 * Hledá klíčová slova jako „kyvadlo", „stroj", „věž" atd. + jejich
 * okolní 2-3 slova.
 */
const HORO_KEYWORDS = [
  'kyvadlo', 'stroj', 'věž', 'ciferník', 'rám', 'pastorek', 'kotva',
  'krok', 'lihýř', 'foliot', 'kolo', 'cimbál', 'zvon', 'závaží',
  'natahovací klika', 'hřídel', 'spojka', 'ručička', 'ručičky',
  'mechanika', 'restaurace', 'detail', 'pohled', 'instalace',
  'celkový pohled', 'expozice', 'výřez', 'původní stav',
];

function extractSubject(text) {
  if (!text) return undefined;
  const lower = text.toLowerCase();
  for (const kw of HORO_KEYWORDS) {
    const idx = lower.indexOf(kw);
    if (idx === -1) continue;
    // Vezmi ±20 znaků kolem keyword + očisti
    const start = Math.max(0, idx - 30);
    const end = Math.min(text.length, idx + kw.length + 30);
    const snippet = text.slice(start, end).replace(/^\S*\s|\s\S*$/g, '').trim();
    if (snippet.length > 10 && snippet.length < 60) {
      return snippet.replace(/[.,;:!?](\s|$)/g, '$1').trim();
    }
  }
  return undefined;
}

function generateAlt({ title, heading }) {
  // BEZPEČNÝ pattern: jen heading nebo title. Subject extraction
  // z okolního textu zkoušená v early prototype byla fragile (zlomky vět
  // jako „kostela stojí renesanční zvonice patrně z roku"). Sequence
  // čísla v alt textu (z původního „Fotografie N") byla také matoucí —
  // vyhozeny. Lidský editor může precise alt doplnit v Sveltia editor
  // při review článku.
  let ctx = heading || title || 'Fotografie';
  // Strip trailing tečku z headingu („DCF hodiny." → „DCF hodiny")
  ctx = ctx.replace(/[.,;:]+$/, '').trim();
  return ctx;
}

async function processFile(path) {
  const md = await readFile(path, 'utf-8');
  const { fm, body } = parseFrontmatter(md);
  const title = fm.title;

  // Najdi všechny `![Fotografie N](src)` patterny.
  const re = /!\[Fotografie (\d+)\]\(([^)]+)\)/g;
  const matches = [];
  let m;
  while ((m = re.exec(body)) !== null) {
    matches.push({ match: m[0], n: parseInt(m[1], 10), src: m[2], position: m.index });
  }
  if (matches.length === 0) return null;

  const total = matches.length;
  let patched = body;
  const changes = [];

  // Patch zpětně (od konce) aby pozice neposunuly.
  for (let i = matches.length - 1; i >= 0; i--) {
    const { match, n, src, position } = matches[i];
    const heading = nearestHeading(body, position);
    const contextText = precedingTextContext(body, position);
    const newAlt = generateAlt({ title, heading });
    const newMatch = `![${newAlt}](${src})`;
    patched = patched.slice(0, position) + newMatch + patched.slice(position + match.length);
    changes.push({ n, oldAlt: `Fotografie ${n}`, newAlt, heading, src });
  }
  // Reverse changes (we patched in reverse order) so report is in source order.
  changes.reverse();

  if (apply) {
    const fmRaw = /^---\n[\s\S]*?\n---\n/.exec(md)[0];
    await writeFile(path, fmRaw + patched);
  }

  return { file: basename(path), title, count: matches.length, changes };
}

async function main() {
  console.log(`# Fix generic alt texts — ${apply ? 'APPLY' : 'DRY-RUN'}\n`);
  const files = [];
  for await (const f of glob(join(CONTENT_DIR, '*.md'))) files.push(f);
  files.sort();

  let totalFiles = 0;
  let totalImgs = 0;
  for (const path of files) {
    const result = await processFile(path);
    if (!result) continue;
    totalFiles++;
    totalImgs += result.count;
    console.log(`\n## ${result.file} (${result.count} obrázků)`);
    console.log(`   title: ${result.title}`);
    for (const c of result.changes.slice(0, 5)) {
      const headingTag = c.heading ? ` [§${c.heading.slice(0, 30)}]` : '';
      console.log(`   ${String(c.n).padStart(2)}.${headingTag}  →  ${c.newAlt}`);
    }
    if (result.changes.length > 5) {
      console.log(`   … +${result.changes.length - 5} dalších`);
    }
  }
  console.log(`\n## Summary: ${totalImgs} obrázků v ${totalFiles} souborech${apply ? ' patchnuto' : ' (dry-run)'}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
