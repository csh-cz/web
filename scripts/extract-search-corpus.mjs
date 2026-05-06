#!/usr/bin/env node
/**
 * extract-search-corpus.mjs
 *
 * Sjednocený extract všech content collections do jednoho korpusu pro
 * semantic search index.
 *
 * Vstup:
 *   content/hodinarium-eu/  — články + sbírkové karty (~497)
 *   content/hodinari/       — medailony hodinářů      (~99)
 *   content/soupis-veznich-hodin/ — záznamy věží      (~391)
 *   content/kronika/        — kronika                 (~23)
 *
 * Výstup:
 *   apps/hodinarium-eu/.semantic-corpus.json
 *
 *   Array<{
 *     id: string;          // unique stable identifier (collection:slug)
 *     url: string;         // canonical path on site (např. /sbirka/karta/inv-2-…)
 *     collection: 'clanek' | 'karta' | 'hodinar' | 'soupis' | 'kronika';
 *     category?: string;   // sub-category u clanky (sbirka, konstrukce, …)
 *     title: string;
 *     summary: string;     // perex / shrnuti / krátký abstract
 *     body: string;        // plain text body, MDX/markdown odstripované
 *     tags: string[];      // keywords pro hybrid keyword+semantic ranking
 *     year?: number;       // pro chronologické filtry
 *     thumbnail?: string;  // pro UI render
 *   }>
 *
 * Cíl: každý dokument má jasný `text` field použitelný pro embedding.
 * Body je truncated na ~3000 znaků (~750 tokens) — bge-m3 zvládne 8k,
 * ale pro většinu článků to je dost a šetří API calls.
 *
 * Tenhle skript je side-effect-free čtení + JSON write. Spouští se ručně
 * nebo z build pipeline před `build-semantic-index.mjs`. Output je
 * gitignored (rebuilduje se z aktuálního content/).
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { walk, splitFrontmatter } from './_lib.mjs';
import yaml from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'apps/hodinarium-eu/.semantic-corpus.json');

const MAX_BODY_CHARS = 3000;

/** Strip MDX/markdown na plain text. Naivní ale dostačující pro embedding. */
function stripMarkdown(s) {
  return (
    s
      // Strip MDX import statements (top-level)
      .replace(/^import\s+[^;]+;?\s*$/gm, '')
      // Strip MDX components <Photo />, <Ref n=N />, <YouTube … />
      .replace(/<[A-Z][a-zA-Z]*[^>]*\/>/g, '')
      .replace(/<[A-Z][a-zA-Z]*[^>]*>[\s\S]*?<\/[A-Z][a-zA-Z]*>/g, '')
      // HTML komentáře
      .replace(/<!--[\s\S]*?-->/g, '')
      // Code fences
      .replace(/```[\s\S]*?```/g, '')
      // Inline code
      .replace(/`([^`]+)`/g, '$1')
      // Image syntax ![alt](src)
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
      // Link syntax [text](url) — keep text, drop url
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Heading markers
      .replace(/^#{1,6}\s+/gm, '')
      // Bold/italic markers
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      // Multiple newlines → single space
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/** Parse YAML frontmatter robustně přes yaml@2. Vrací prázdný objekt
 *  pokud frontmatter chybí nebo je nevalidní. */
function parseFm(fm) {
  try {
    return yaml.parse(fm) ?? {};
  } catch {
    return {};
  }
}

/** Sestaví URL pro daný entry podle kolekce. */
function buildUrl(collection, slug, data) {
  if (collection === 'hodinari') return `/hodinari/${slug}`;
  if (collection === 'soupis') return `/soupis-veznich-hodin/${slug}`;
  if (collection === 'kronika') return `/kronika/${slug}`;
  // 'clanky' kolekce — záleží na category + podsekce
  if (data.category === 'sbirka' && data.podsekce === 'karta') {
    return `/sbirka/karta/${slug}`;
  }
  // Standardní /<kategorie>/<slug>, fallback /clanky/<slug> pro legacy
  const newCats = ['sbirka', 'konstrukce', 'projekty', 'virtualni-muzeum', 'muzea', 'zajimavosti'];
  if (newCats.includes(data.category)) return `/${data.category}/${slug}`;
  return `/clanky/${slug}`;
}

/** Vytáhne summary podle kolekce — jiná pole pro různé schémata. */
function extractSummary(collection, data) {
  if (collection === 'hodinari') return data.shrnuti ?? '';
  if (collection === 'soupis') return data.poznamka ?? '';
  if (collection === 'kronika') return data.title ?? '';
  // clanky: tldr fallback na excerpt z body (TODO: build-time excerpt v catalog.json)
  return data.tldr ?? '';
}

/** Vytáhne tags podle kolekce. */
function extractTags(collection, data) {
  const tags = [];
  if (data.tags) tags.push(...data.tags);
  if (collection === 'hodinari') {
    if (data.aliasy) tags.push(...data.aliasy);
    if (data.mesto) tags.push(data.mesto);
    if (data.obdobi) tags.push(data.obdobi);
  }
  if (collection === 'soupis') {
    if (data.puvodniMisto?.obec) tags.push(data.puvodniMisto.obec);
    if (data.puvodniMisto?.budova) tags.push(data.puvodniMisto.budova);
    if (data.puvodniMisto?.kraj) tags.push(data.puvodniMisto.kraj);
    if (data.krok) tags.push(data.krok.split(/[\s,;()]/)[0]);
    if (data.hodinar) tags.push(data.hodinar);
    if (data.hodinarText) tags.push(data.hodinarText);
  }
  if (collection === 'kronika') {
    if (data.misto) tags.push(data.misto);
    if (data.typ) tags.push(data.typ);
  }
  if (data.category === 'sbirka' && data.podsekce === 'karta' && data.karta) {
    if (data.karta.vyrobce) tags.push(data.karta.vyrobce);
    if (data.karta.umisteni) tags.push(data.karta.umisteni);
    if (data.karta.inventarniCislo) tags.push(`inv. č. ${data.karta.inventarniCislo}`);
    if (data.karta.materialy) {
      const m = Array.isArray(data.karta.materialy) ? data.karta.materialy : [data.karta.materialy];
      tags.push(...m);
    }
  }
  return Array.from(new Set(tags.map((t) => String(t).trim()).filter(Boolean)));
}

/** Extract year — pro chronologické filtry / sort tie-break. */
function extractYear(collection, data) {
  if (collection === 'soupis') {
    return typeof data.rok === 'number' ? data.rok : undefined;
  }
  if (collection === 'kronika') {
    return typeof data.rok === 'number' ? data.rok : undefined;
  }
  if (data.karta?.datace) {
    const m = String(data.karta.datace).match(/\b(1[0-9]{3}|20[0-9]{2})\b/);
    if (m) return Number(m[1]);
  }
  if (data.lastModified) {
    const m = String(data.lastModified).match(/^(\d{4})/);
    if (m) return Number(m[1]);
  }
  return undefined;
}

function processCollection(collection, dirRel) {
  const dir = join(ROOT, dirRel);
  const files = walk(dir);
  const out = [];
  for (const path of files) {
    const txt = readFileSync(path, 'utf8');
    const split = splitFrontmatter(txt);
    if (!split) continue;
    const data = parseFm(split.fm);
    if (!data || !data.slug) continue;
    if (data.draft === true) continue;
    const slug = String(data.slug);
    const title = String(data.title ?? slug);
    const body = stripMarkdown(split.body).slice(0, MAX_BODY_CHARS);
    const url = buildUrl(collection, slug, data);
    const summary = extractSummary(collection, data);
    const tags = extractTags(collection, data);
    const year = extractYear(collection, data);
    const id = `${collection}:${slug}`;
    out.push({
      id,
      url,
      collection: collection === 'clanky'
        ? (data.category === 'sbirka' && data.podsekce === 'karta' ? 'karta' : 'clanek')
        : (collection === 'hodinari' ? 'hodinar' : (collection === 'soupis' ? 'soupis' : 'kronika')),
      category: data.category,
      title,
      summary,
      body,
      tags,
      year,
      thumbnail: data.thumbnail,
    });
  }
  return out;
}

function main() {
  const records = [
    ...processCollection('clanky', 'content/hodinarium-eu'),
    ...processCollection('hodinari', 'content/hodinari'),
    ...processCollection('soupis', 'content/soupis-veznich-hodin'),
    ...processCollection('kronika', 'content/kronika'),
  ];

  // Stats per collection
  const byColl = records.reduce((acc, r) => {
    acc[r.collection] = (acc[r.collection] ?? 0) + 1;
    return acc;
  }, {});
  console.log('Corpus stats:');
  for (const [k, v] of Object.entries(byColl).sort()) {
    console.log(`  ${k.padEnd(10)} ${v.toString().padStart(4)}`);
  }
  console.log(`  ${'TOTAL'.padEnd(10)} ${records.length.toString().padStart(4)}`);

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(records, null, 2));
  const sizeKB = Math.round(JSON.stringify(records).length / 1024);
  console.log(`\nWritten: ${OUT}`);
  console.log(`Size: ${sizeKB} KB (${records.length} records)`);
}

main();
