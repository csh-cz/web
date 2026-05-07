#!/usr/bin/env node
/**
 * One-shot oprava `_redirects` zombiu, kde target ukazuje na neexistující
 * `/sbirka/<slug>` místo `/sbirka/karta/<slug>` pro evidenční karty.
 *
 * Bug v `build-redirects.ts` (od roku 2026-04 taxonomy refactor): generoval
 * `/clanky/<slug> /<category>/<slug>` pro všechny články, ale evidenční
 * karty (`podsekce: 'karta'`) ve sbírce mají router `/sbirka/karta/<slug>`,
 * ne `/sbirka/<slug>`.
 *
 * Skript:
 *   1. Načte stávající `apps/hodinarium-eu/public/_redirects`.
 *   2. Načte `apps/hodinarium-eu/src/data/catalog.json` (po regen už obsahuje
 *      `podsekce` field).
 *   3. Pro každý řádek typu `/<...>/<slug> /sbirka/<slug>` (target neobsahuje
 *      `/karta/`) — pokud je `slug` v catalogu jako karta, oprav target.
 *   4. Zapíše opravený `_redirects`.
 *
 * Po této opravě by audit-redirects měl skončit 0 zombiů (kromě skutečně
 * mrtvých legacy htm cest, které je potřeba řešit jinak).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..');
const REDIRECTS = join(ROOT, 'apps/hodinarium-eu/public/_redirects');
const CATALOG = join(ROOT, 'apps/hodinarium-eu/src/data/catalog.json');

const catalog = JSON.parse(readFileSync(CATALOG, 'utf8'));
const kartySlugs = new Set(
  catalog.filter((e) => e.category === 'sbirka' && e.podsekce === 'karta').map((e) => e.slug),
);

console.log(`Karet v catalogu: ${kartySlugs.size}`);

const text = readFileSync(REDIRECTS, 'utf8');
let fixed = 0;
const lines = text.split('\n').map((line) => {
  // Match: <source> /sbirka/<slug> [301]
  // (target NEMÁ /karta/, ale jen /sbirka/<slug>)
  const m = line.match(/^(\S+)\s+\/sbirka\/([a-zA-Z0-9_-]+?)(\/?)\s+(\d+)\s*$/);
  if (!m) return line;
  const [, source, slug, trailingSlash, status] = m;
  // Skip pokud target už má /karta/ (ošetřeno)
  if (slug.startsWith('karta/')) return line;
  // Skip pokud cesta už správně míří na flat /sbirka/<slug> (=článek, ne karta)
  if (!kartySlugs.has(slug)) return line;
  // Karta — oprav cíl
  fixed++;
  return `${source} /sbirka/karta/${slug}${trailingSlash} ${status}`;
});

writeFileSync(REDIRECTS, lines.join('\n'), 'utf8');
console.log(`Opravených redirectů: ${fixed}`);
