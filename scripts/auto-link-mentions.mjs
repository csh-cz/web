#!/usr/bin/env node
/**
 * Auto-link zmínek hodinářů a sbírkových karet v MDX/MD body textech.
 *
 * Strategie:
 *   1. Pro každý MDX/MD soubor v content/ projde body (NE frontmatter)
 *   2. Pro každý zmíněný entity (hodinář / karta / soupis record) najde
 *      PRVNÍ výskyt celého jména a obalí ho markdown linkem.
 *   3. Konzervativní heuristika:
 *      - Jen plné jméno (jmeno field), žádné aliasy / příjmení samo
 *      - Word boundary (Unicode regex)
 *      - Skip pokud už je inside [...]( ... ) link
 *      - Skip pokud uvnitř code blocku (```...``` nebo `inline`)
 *      - Skip pokud target je tatáž stránka (žádné self-linky)
 *   4. Každý unique entity max 1× per soubor (linkujeme první zmínku)
 *
 * Použití:
 *   node scripts/auto-link-mentions.mjs        # dry-run + report
 *   node scripts/auto-link-mentions.mjs --apply
 *   node scripts/auto-link-mentions.mjs --apply --only hodinari   # jen hodináři
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { walk, splitFrontmatter } from './_lib.mjs';

const apply = process.argv.includes('--apply');
const onlyArg = process.argv.find((a) => a.startsWith('--only='))?.split('=')[1];
const root = process.cwd();

// === Načti hodinaře z hodinari.ts ===
function loadHodinari() {
  const tsPath = join(root, 'apps/hodinarium-eu/src/data/hodinari.ts');
  const src = readFileSync(tsPath, 'utf8');
  const records = [];
  const blockRe = /\{\s*slug:\s*'([^']+)'[\s\S]*?jmeno:\s*'([^']+)'[\s\S]*?(?:aliasy:\s*\[([^\]]*)\][\s\S]*?)?(?=\n\s*\}|\n\s*era:)/g;
  for (const m of src.matchAll(blockRe)) {
    const slug = m[1];
    const jmeno = m[2];
    records.push({ slug, jmeno, url: `/hodinari/${slug}` });
  }
  return records;
}

// === Načti sbírkové karty ===
function loadKarty() {
  const dir = join(root, 'content/hodinarium-eu');
  const files = walk(dir).filter((f) => /\/inv-[\w-]+\.md$/.test(f));
  const karty = [];
  for (const f of files) {
    const txt = readFileSync(f, 'utf8');
    const split = splitFrontmatter(txt);
    if (!split) continue;
    const titleM = split.fm.match(/^title:\s*["']?([^"'\n]+)/m);
    const slugM = split.fm.match(/^slug:\s*["']?([^"'\n]+)/m);
    if (!titleM || !slugM) continue;
    karty.push({
      slug: slugM[1].trim(),
      title: titleM[1].trim(),
      url: `/sbirka/karta/${slugM[1].trim()}/`,
    });
  }
  return karty;
}

// === Načti soupis ===
function loadSoupis() {
  const dir = join(root, 'content/soupis-veznich-hodin');
  const files = walk(dir);
  const records = [];
  for (const f of files) {
    const txt = readFileSync(f, 'utf8');
    const split = splitFrontmatter(txt);
    if (!split) continue;
    const slugM = split.fm.match(/^slug:\s*["']?([^"'\n]+)/m);
    const obecM = split.fm.match(/^\s+obec:\s*["']?([^"'\n]+)/m);
    const rokM = split.fm.match(/^rok:\s*([^\n]+)/m);
    if (!slugM || !obecM) continue;
    records.push({
      slug: slugM[1].trim(),
      obec: obecM[1].trim(),
      rok: rokM ? rokM[1].trim().replace(/^["']|["']$/g, '') : '',
      url: `/soupis-veznich-hodin/${slugM[1].trim()}/`,
    });
  }
  return records;
}

const hodinari = loadHodinari();
const karty = loadKarty();
const soupis = loadSoupis();

console.log(`Loaded:`);
console.log(`  hodinari: ${hodinari.length}`);
console.log(`  karty:    ${karty.length}`);
console.log(`  soupis:   ${soupis.length}`);
console.log('');

// === Najdi první výskyt patternu mimo links / code blocks ===
function findFirstMention(body, name) {
  // Escape pro RegExp — pozor: pod /u flag NESMÍ být `-` escapnutý (mimo
  // character class je `-` literál; escapnutý je SyntaxError).
  const escaped = name.replace(/[/\\^$*+?.()|[\]{}]/g, '\\$&');
  // Word boundary unicode-aware: před a po matchi nesmí být písmeno/číslice.
  // V /u musíme `-` napsat na okraj character class, aby byl literální.
  const re = new RegExp(`(?<![\\p{L}\\p{N}_])${escaped}(?![\\p{L}\\p{N}_])`, 'u');

  // Skenuj řádek po řádku, vynech code-block fences a inline code
  const lines = body.split('\n');
  let inCode = false;
  let charOffset = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^```/.test(line.trim())) { inCode = !inCode; charOffset += line.length + 1; continue; }
    if (inCode) { charOffset += line.length + 1; continue; }
    if (/^\s{4,}\S/.test(line)) { charOffset += line.length + 1; continue; } // indented code blocks

    // Skip headers (don't link in headings — keeps them clean for navigation)
    if (/^#{1,6}\s/.test(line)) { charOffset += line.length + 1; continue; }

    const m = line.match(re);
    if (!m) { charOffset += line.length + 1; continue; }
    const matchPos = m.index;

    // Check if uvnitř existing markdown link [...](...) — najdi ohraničení
    // Najdi všechny [text](url) v line, viz jestli matchPos je uvnitř
    let insideLink = false;
    const linkRe = /\[([^\]]*)\]\([^)]*\)/g;
    for (const lm of line.matchAll(linkRe)) {
      const start = lm.index;
      const end = start + lm[0].length;
      if (matchPos >= start && matchPos < end) { insideLink = true; break; }
    }
    if (insideLink) { charOffset += line.length + 1; continue; }

    // Check if uvnitř inline code `...`
    let insideCode = false;
    const codeRe = /`[^`]+`/g;
    for (const cm of line.matchAll(codeRe)) {
      const start = cm.index;
      const end = start + cm[0].length;
      if (matchPos >= start && matchPos < end) { insideCode = true; break; }
    }
    if (insideCode) { charOffset += line.length + 1; continue; }

    return { lineIdx: i, lineMatchPos: matchPos, length: m[0].length, absPos: charOffset + matchPos };
  }

  return null;
}

// === Main scan ===
const allFiles = walk(join(root, 'content'));

let totalLinks = 0;
const fileStats = new Map();

for (const f of allFiles) {
  const relPath = f.replace(root + '/', '');
  const txt = readFileSync(f, 'utf8');
  const split = splitFrontmatter(txt);
  if (!split) continue;
  let body = split.body;

  // Self-link guard: zjisti slug + url této stránky
  const selfSlugM = split.fm.match(/^slug:\s*["']?([^"'\n]+)/m);
  const selfSlug = selfSlugM ? selfSlugM[1].trim() : null;
  const isHodinar = relPath.startsWith('content/hodinari/');
  const isKarta = /\/inv-[\w-]+\.md$/.test(f);
  const isSoupis = relPath.startsWith('content/soupis-veznich-hodin/');

  // Prepare list of entity candidates (priority: hodinari → karty → soupis)
  const candidates = [];
  if (!onlyArg || onlyArg === 'hodinari') {
    for (const h of hodinari) {
      if (isHodinar && h.slug === selfSlug) continue; // no self-link
      // Conservative: only multi-word names (e.g., "Jan Janata", not bare "Janata")
      if (h.jmeno.split(/\s+/).length < 2) continue;
      candidates.push({ kind: 'hodinar', name: h.jmeno, url: h.url });
    }
  }
  if (!onlyArg || onlyArg === 'karty') {
    for (const k of karty) {
      if (isKarta && k.slug === selfSlug) continue;
      // Only if title is distinctive (>= 12 chars + multi-word)
      if (k.title.length < 12 || k.title.split(/\s+/).length < 2) continue;
      candidates.push({ kind: 'karta', name: k.title, url: k.url });
    }
  }
  if (!onlyArg || onlyArg === 'soupis') {
    for (const s of soupis) {
      if (isSoupis && s.slug === selfSlug) continue;
      // Soupis link je riskantní (obec sama o sobě je generic) — vynecháme
      // pro auto-link, editor může přidat ručně
    }
  }

  // Sort by length desc — longer matches preferred (e.g., "Jan Janata Senior" before "Jan Janata")
  candidates.sort((a, b) => b.name.length - a.name.length);

  // Track which entity slugs we've linked (jen 1× per kategorie+url)
  const linked = new Set();
  let changes = 0;

  for (const c of candidates) {
    if (linked.has(c.url)) continue;
    const m = findFirstMention(body, c.name);
    if (!m) continue;

    // Wrap: replace at absPos
    const before = body.slice(0, m.absPos);
    const after = body.slice(m.absPos + m.length);
    body = `${before}[${c.name}](${c.url})${after}`;
    linked.add(c.url);
    changes++;
    totalLinks++;
  }

  if (changes > 0) {
    fileStats.set(relPath, changes);
    if (apply) {
      const newTxt = `---\n${split.fm}\n---\n${body}`;
      writeFileSync(f, newTxt);
    }
  }
}

console.log(`Files modified: ${fileStats.size}`);
console.log(`Total links inserted: ${totalLinks}`);
console.log('');

// Top 10 souborů s nejvíc linky
const top = [...fileStats.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);
console.log(`Top files (linky):`);
for (const [f, n] of top) console.log(`  +${n}  ${f}`);

if (!apply) console.log('\nDry-run. Pro aplikaci spusť s --apply.');
