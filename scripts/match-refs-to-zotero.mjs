#!/usr/bin/env node
/**
 * Pro každý unikátní ref v repo (extrahovaný z references[] / prameny[])
 * najde nejlepší match v Zotero exportu (tmp/zotero-export/library-full.json)
 * a zapíše seznam do `tmp/zotero-export/refs-match.json`.
 *
 * Heuristika:
 *   1. Title fuzzy match (SequenceMatcher equivalent přes Levenshtein)
 *   2. Bonus za shodu autora (last name)
 *   3. Bonus za shodu roku
 *   4. Threshold:  combinedScore >= 0.65 → accept
 *
 * Output:
 *   {
 *     match: [{ refKey, file, title, citationKey, score, reasons[] }],
 *     noMatch: [{ refKey, file, title, author, year, bestCand?, bestScore }],
 *   }
 *
 * Usage:
 *   node scripts/match-refs-to-zotero.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { walk, splitFrontmatter } from './_lib.mjs';

const root = process.cwd();
const ZOT_PATH = join(root, 'tmp', 'zotero-export', 'library-full.json');
const OUT_PATH = join(root, 'tmp', 'zotero-export', 'refs-match.json');

const zot = JSON.parse(readFileSync(ZOT_PATH, 'utf8'));

function normalize(s) {
  if (!s) return '';
  return s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\W+/g, ' ')
    .trim();
}

// Levenshtein distance ratio (Python SequenceMatcher equivalent close enough)
function similarity(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  if (longer.length === 0) return 1;
  const distance = levenshtein(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshtein(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr.push(Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost));
    }
    prev = curr;
  }
  return prev[b.length];
}

// Index Zotero items
const zotByTitlePrefix = new Map();
for (const it of zot) {
  const title = normalize(it.title || '');
  if (!title) continue;
  const key = title.slice(0, 12);
  if (!zotByTitlePrefix.has(key)) zotByTitlePrefix.set(key, []);
  zotByTitlePrefix.get(key).push(it);
}

function authorMatchScore(refAuthor, item) {
  if (!refAuthor) return 0;
  const refLast = normalize(refAuthor).split(/[\s,]+/).pop();
  if (!refLast) return 0;
  const creators = item.author || [];
  for (const c of creators) {
    const last = normalize(c.family || c.literal || '');
    if (last === refLast) return 1;
    if (last.includes(refLast) || refLast.includes(last)) return 0.6;
  }
  return 0;
}

function yearMatchScore(refYear, item) {
  if (!refYear) return 0;
  const refY = String(refYear).match(/\d{4}/);
  const itY = JSON.stringify(item.issued || '').match(/\d{4}/);
  if (!refY || !itY) return 0;
  return refY[0] === itY[0] ? 1 : 0;
}

function findBestMatch(title, author, year) {
  const tNorm = normalize(title);
  if (!tNorm) return null;
  const candidates = new Set();
  // Look up by title prefix bucket + nearby
  for (const offset of [0, 1, 2]) {
    const k = tNorm.slice(offset, offset + 12);
    if (zotByTitlePrefix.has(k)) {
      for (const c of zotByTitlePrefix.get(k)) candidates.add(c);
    }
  }
  // Also brute-force first-word match (small, OK for 3k items)
  const firstWord = tNorm.split(' ')[0];
  if (firstWord.length >= 4) {
    for (const it of zot) {
      const itTitle = normalize(it.title || '');
      if (itTitle.startsWith(firstWord)) candidates.add(it);
    }
  }

  let best = null, bestCombined = 0;
  for (const cand of candidates) {
    const ts = similarity(tNorm, normalize(cand.title || ''));
    const as_ = authorMatchScore(author, cand);
    const ys = yearMatchScore(year, cand);
    const combined = ts * 0.7 + as_ * 0.2 + ys * 0.1;
    if (combined > bestCombined) {
      bestCombined = combined;
      best = { item: cand, titleScore: ts, authorScore: as_, yearScore: ys, combined };
    }
  }
  return best;
}

// Extract repo references
const contentDirs = ['hodinarium-eu', 'hodinari', 'soupis-veznich-hodin'].map((d) => join(root, 'content', d));

function* extractRefs() {
  for (const d of contentDirs) {
    let files = [];
    try { files = walk(d); } catch { continue; }
    for (const f of files) {
      const txt = readFileSync(f, 'utf8');
      const split = splitFrontmatter(txt);
      if (!split) continue;

      // YAML uvnitř fm — najdi - title:/citace: + author/year/url v následujících řádcích
      // Block scalar | / > nepodporujeme striktně; používáme substring na items.
      const refsM = split.fm.match(/(?:^references:|^prameny:)\s*\n((?:^[ \t]+.*\n)+)/m);
      if (!refsM) continue;
      const block = refsM[1];

      // Split by leading "- "
      const items = block.split(/\n(?=\s*-\s)/);
      for (const item of items) {
        if (!/^\s*-\s/.test(item)) continue;
        const titleM = item.match(/(?:title|citace):\s*(.+?)(?:\n|$)/);
        if (!titleM) continue;
        let title = titleM[1].trim().replace(/^["']|["']$/g, '').replace(/^\|\s*/, '');
        if (!title || title === '|') continue;
        const authorM = item.match(/(?:author|autor):\s*(.+?)(?:\n|$)/);
        const yearM = item.match(/(?:year|rok):\s*(.+?)(?:\n|$)/);
        const urlM = item.match(/url:\s*(.+?)(?:\n|$)/);
        const author = authorM ? authorM[1].trim().replace(/^["']|["']$/g, '') : '';
        const year = yearM ? yearM[1].trim().replace(/^["']|["']$/g, '') : '';
        const url = urlM ? urlM[1].trim().replace(/^["']|["']$/g, '') : '';
        yield { file: f.replace(root + '/', ''), title, author, year, url };
      }
    }
  }
}

const seen = new Map();
for (const r of extractRefs()) {
  const k = `${r.title.slice(0, 80).toLowerCase()}|${r.year}`;
  if (!seen.has(k)) seen.set(k, { ...r, count: 0, files: new Set() });
  seen.get(k).count++;
  seen.get(k).files.add(r.file);
}

const uniq = [...seen.values()].map((r) => ({ ...r, files: [...r.files] }));
console.log(`Unique repo refs: ${uniq.length}`);

const result = { matches: [], noMatch: [] };
let strong = 0, fuzzy = 0;
for (const ref of uniq) {
  const best = findBestMatch(ref.title, ref.author, ref.year);
  if (best && best.combined >= 0.65) {
    const reasons = [];
    if (best.titleScore >= 0.95) reasons.push('strong-title');
    else if (best.titleScore >= 0.7) reasons.push('fuzzy-title');
    if (best.authorScore >= 1) reasons.push('exact-author');
    else if (best.authorScore > 0) reasons.push('partial-author');
    if (best.yearScore >= 1) reasons.push('exact-year');
    if (best.combined >= 0.85) strong++;
    else fuzzy++;
    result.matches.push({
      title: ref.title,
      author: ref.author,
      year: ref.year,
      url: ref.url,
      files: ref.files,
      count: ref.count,
      citationKey: best.item['citation-key'] || best.item.id,
      zoteroTitle: best.item.title,
      score: Math.round(best.combined * 100) / 100,
      reasons,
    });
  } else {
    result.noMatch.push({
      title: ref.title,
      author: ref.author,
      year: ref.year,
      url: ref.url,
      files: ref.files,
      count: ref.count,
      bestCand: best ? best.item.title : null,
      bestScore: best ? Math.round(best.combined * 100) / 100 : 0,
    });
  }
}

writeFileSync(OUT_PATH, JSON.stringify(result, null, 2));
console.log(`\n📊 Match: ${result.matches.length}/${uniq.length}`);
console.log(`   strong (≥0.85): ${strong}`);
console.log(`   fuzzy  (≥0.65): ${fuzzy}`);
console.log(`   no match: ${result.noMatch.length}`);
console.log(`\nSaved to ${OUT_PATH.replace(root + '/', '')}`);
