#!/usr/bin/env node
/**
 * Vytvoří custom slovník pro spell-checker (Hunspell / nspell / browser
 * extension) z repo dat:
 *
 *   - content/slovnik/*.md   → cs heslo + cs aliasy (z searchKeywords)
 *   - content/hodinari/*.mdx → jméno + aliasy (Krečmer, Krecmer, Kretschmer…)
 *   - content/soupis-veznich-hodin/*.mdx → obec + budova
 *   - apps/hodinarium-eu/src/data/hodinari.ts → fallback pokud
 *     content/hodinari/<slug>.mdx neexistuje (stub-only hodináři)
 *
 * Kanonické cs formy + běžné anglické/německé varianty jmen (aliases).
 * Skloněné formy ze slovníku (kyvadlo / kyvadla / kyvadlu / kyvadlem)
 * jsou v `searchKeywords` a aliasech.
 *
 * Output:
 *   apps/hodinarium-eu/public/admin/csh-spell-dict.json
 *     { version, generatedAt, sources, words: string[] }
 *
 * Spell-checker (browser-side) loaduje tento JSON, mergne s base cs_CZ
 * Hunspell dictionary, výsledek = kompletní cs slovník + CSH terminologie
 * + hodinařské aliasy.
 *
 * Idempotentní: pořadí slov je deterministické (sorted), commit diff
 * jen když data v repu skutečně změněna.
 */
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..');
const OUT_PATH = join(ROOT, 'apps/hodinarium-eu/public/admin/csh-spell-dict.json');

const sources = {
  slovnik: 0,
  hodinari: 0,
  hodinariTs: 0,
  soupis: 0,
};

/** Set kanonických slov, deduplikované case-sensitive (Krečmer ≠ krečmer). */
const words = new Set();

/** Krátké/služební cs+en stop words — bez lexikálního obsahu, pro
 *  spell-checker nemají hodnotu (browser native dict je má všechny). */
const STOPWORDS = new Set([
  // cs
  'ale', 'aby', 'asi', 'atd', 'cca', 'jen', 'tak', 'pro', 'při', 'při',
  'což', 'též', 'též',
  // en (z mixed cs+en titlů jako "Brillie Frères", "Patek Philippe Star Caliber")
  'and', 'the', 'for', 'with', 'from', 'into', 'over', 'this', 'that',
  // de (z "Schwarzwälder Uhrenfabrik" apod.)
  'der', 'die', 'das', 'und', 'mit', 'für', 'von', 'bei',
]);

function addWord(w) {
  if (!w) return;
  const t = String(w).trim();
  // Skip prázdné, čísla samotné, single chars, URL fragmenty
  if (t.length < 3) return;
  if (/^\d+$/.test(t)) return;
  if (/^https?:/.test(t)) return;
  // Multi-word: rozdělit a přidat každé slovo zvlášť
  // (např. "Václav Krečmer" → "Václav" + "Krečmer", "kyvadlové soukolí"
  // → "kyvadlové" + "soukolí"). Spell-checker validuje per-token, ne
  // per-fráze.
  const tokens = t.split(/[\s\-—–\/(),;:!?\.]+/).filter(Boolean);
  for (const tok of tokens) {
    if (tok.length < 3) continue;
    if (/^\d+$/.test(tok)) continue;
    if (STOPWORDS.has(tok.toLowerCase())) continue;
    words.add(tok);
  }
}

async function* walkMd(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walkMd(p);
    else if (e.isFile() && (p.endsWith('.md') || p.endsWith('.mdx'))) yield p;
  }
}

function parseFrontmatter(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  try {
    return yaml.parse(m[1]);
  } catch {
    return null;
  }
}

// 1) Slovník — kanonický cs term + searchKeywords (skloněné formy)
for await (const file of walkMd(join(ROOT, 'content/slovnik'))) {
  const content = await readFile(file, 'utf-8');
  const fm = parseFrontmatter(content);
  if (!fm?.title) continue;
  addWord(fm.title);
  if (Array.isArray(fm.searchKeywords)) {
    fm.searchKeywords.forEach(addWord);
  }
  // pribuzne — taky validní cs hesla
  if (Array.isArray(fm.pribuzne)) {
    fm.pribuzne.forEach(addWord);
  }
  sources.slovnik++;
}

// 2) Hodináři — content/hodinari/*.mdx (medailony s body)
for await (const file of walkMd(join(ROOT, 'content/hodinari'))) {
  const content = await readFile(file, 'utf-8');
  const fm = parseFrontmatter(content);
  if (!fm?.title) continue;
  addWord(fm.title);
  if (Array.isArray(fm.aliasy)) fm.aliasy.forEach(addWord);
  if (fm.mesto) addWord(fm.mesto);
  if (Array.isArray(fm.searchKeywords)) fm.searchKeywords.forEach(addWord);
  sources.hodinari++;
}

// 3) Hodinari.ts — TypeScript registry (stub hodináři bez MDX)
{
  const file = join(ROOT, 'apps/hodinarium-eu/src/data/hodinari.ts');
  const content = await readFile(file, 'utf-8');
  // Naivní regex parser — entries mají formát:
  //   { slug: '...', jmeno: '...', aliasy: ['...', '...'], ... }
  const entryRe = /jmeno:\s*'([^']+)'(?:[\s\S]*?aliasy:\s*\[([^\]]*)\])?/g;
  let m;
  while ((m = entryRe.exec(content)) !== null) {
    addWord(m[1]);
    if (m[2]) {
      const aliases = m[2].match(/'([^']+)'/g) || [];
      aliases.forEach((a) => addWord(a.slice(1, -1)));
    }
    sources.hodinariTs++;
  }
}

// 4) Soupis věžních hodin — obec, budova, kraj
for await (const file of walkMd(join(ROOT, 'content/soupis-veznich-hodin'))) {
  const content = await readFile(file, 'utf-8');
  const fm = parseFrontmatter(content);
  if (!fm?.puvodniMisto) continue;
  const p = fm.puvodniMisto;
  if (p.obec) addWord(p.obec);
  if (p.cast) addWord(p.cast);
  if (p.budova) addWord(p.budova);
  if (p.kraj) addWord(p.kraj);
  sources.soupis++;
}

const sorted = [...words].sort((a, b) => a.localeCompare(b, 'cs'));
const out = {
  version: 1,
  generatedAt: new Date().toISOString(),
  description:
    'Custom slovník pro CSH spell-checker. Kanonické cs formy + jména hodinářů + ' +
    'aliasy (de/en variant). Mergne se s base cs_CZ Hunspell dict v browseru.',
  sources,
  count: sorted.length,
  words: sorted,
};

await mkdir(dirname(OUT_PATH), { recursive: true });
await writeFile(OUT_PATH, JSON.stringify(out, null, 2) + '\n');

console.log(`✓ ${OUT_PATH.replace(`${ROOT}/`, '')}`);
console.log(`  ${sorted.length} unique words`);
console.log(`  Sources: ${JSON.stringify(sources)}`);
console.log('');
console.log('Vzorek (prvních 20):');
for (const w of sorted.slice(0, 20)) console.log(`  ${w}`);
