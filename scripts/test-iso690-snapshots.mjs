#!/usr/bin/env node
/**
 * Snapshot test ISO 690 výstupu citeproc-js.
 *
 * Pro 12 reprezentativních bibKeys (jeden per nejčastější CSL type)
 * renderuje formatCite() a porovná s uloženými snapshoty v
 * `tests/iso690-snapshots.json`.
 *
 * Cíl: zachytit regresi výstupu po:
 *   - upgrade citeproc-js library
 *   - úpravě iso690-author-date-cs.csl stylu
 *   - úmyslná i náhodná změna metadata v references.json
 *
 * Použití:
 *   node scripts/test-iso690-snapshots.mjs           # test (failne při drift)
 *   node scripts/test-iso690-snapshots.mjs --update  # přepiš snapshoty
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const require = createRequire(import.meta.url);

// Sample bibKeys — jeden per nejčastější CSL type. Aktualizuj pokud
// repo přejmenuje refs (sync-zotero-refs.mjs --check ti řekne).
const SAMPLE_KEYS = [
  'knesplCastIronTower2024',                    // paper-conference
  'kinsnerAstronomischeUhr1894',                // book / patent
  'edmundkinsnerAstronomischeUhr1894',          // patent (deutsch)
  'nekutHvezdarskyOrloj1898',                   // article-journal
  'hartmanChlumeckemVynalezciOrloje1987a',      // article-journal
  'BilaVezHradec',                              // entry-encyclopedia (Wikipedia)
  'wurzbachDavidVomKajetan1858',                // chapter
  'kreutzbergBerichtBeurtheilungsCommissionUeber1833', // book (historic)
  'rosenbaumGegosseneThurmUhren1810',           // article-journal (historic)
  'devaulxPremieresOEuvresJACQUES1583',         // manuscript
  'JanProkes1891',                              // article-journal (anonymous)
  'knesplProgressTraditionTraditional2024',     // paper-conference
];

const SNAPSHOT_PATH = join(root, 'tests/iso690-snapshots.json');
const update = process.argv.includes('--update');

// Inline reimplementace cite.ts — neimportujeme z app/ kvůli Astro/Vite
// ?raw modifier. Načteme references + style + locale jako file content.
async function loadCiteproc() {
  // citeproc je CommonJS, navíc není v root package — pnpm ho má pod
  // hodinarium-eu app. Resolve přes app's node_modules.
  const citeprocPath = join(root, 'node_modules/.pnpm/citeproc@2.4.63/node_modules/citeproc/citeproc_commonjs.js');
  const CSL = require(citeprocPath);
  const refs = JSON.parse(
    readFileSync(join(root, 'apps/hodinarium-eu/src/data/references.json'), 'utf8'),
  );
  const cslStyle = readFileSync(
    join(root, 'apps/hodinarium-eu/src/data/iso690-author-date-cs.csl'),
    'utf8',
  );
  const cslLocale = readFileSync(
    join(root, 'apps/hodinarium-eu/src/data/csl-locale-cs-CZ.xml'),
    'utf8',
  );

  const byKey = new Map();
  for (const r of refs) {
    const k = r['citation-key'] || r.id;
    if (k) byKey.set(k, r);
  }

  const sys = {
    retrieveLocale: () => cslLocale,
    retrieveItem: (id) => {
      const item = byKey.get(id);
      if (!item) return { id, type: 'document', title: `[neznámá: ${id}]` };
      return { ...item, id };
    },
  };
  const engine = new CSL.Engine(sys, cslStyle, 'cs-CZ');

  function format(bibKey) {
    if (!byKey.has(bibKey)) return null;
    engine.updateItems([bibKey]);
    const result = engine.makeBibliography();
    if (!result || !result[1] || !result[1][0]) return null;
    return result[1][0]
      .replace(/^<div[^>]*>([\s\S]*)<\/div>\s*$/m, '$1')
      .trim();
  }

  return { format, byKey };
}

async function main() {
  const { format, byKey } = await loadCiteproc();

  const current = {};
  let missing = 0;
  for (const key of SAMPLE_KEYS) {
    if (!byKey.has(key)) {
      console.warn(`⚠ bibKey '${key}' v references.json neexistuje — snapshot přeskočen.`);
      missing++;
      continue;
    }
    current[key] = format(key);
  }

  if (update) {
    if (!existsSync(dirname(SNAPSHOT_PATH))) mkdirSync(dirname(SNAPSHOT_PATH), { recursive: true });
    writeFileSync(SNAPSHOT_PATH, JSON.stringify(current, null, 2) + '\n');
    console.log(`✓ Snapshoty zapsány (${Object.keys(current).length} entries) → ${SNAPSHOT_PATH}`);
    process.exit(0);
  }

  if (!existsSync(SNAPSHOT_PATH)) {
    console.error(`✗ Snapshot file ${SNAPSHOT_PATH} neexistuje — spusť s --update pro inicializaci.`);
    process.exit(1);
  }

  const expected = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8'));
  const drifted = [];
  const newKeys = [];

  for (const [key, html] of Object.entries(current)) {
    if (!(key in expected)) {
      newKeys.push(key);
      continue;
    }
    if (expected[key] !== html) {
      drifted.push({ key, expected: expected[key], actual: html });
    }
  }

  const removedKeys = Object.keys(expected).filter((k) => !(k in current));

  console.log(`Tested ${Object.keys(current).length} bibKeys (${missing} chybí v Zotero).`);
  if (newKeys.length > 0) console.log(`ℹ  Nové bibKeys (přidat snapshot --update):  ${newKeys.length}`);
  if (removedKeys.length > 0) console.log(`ℹ  Odstraněné z source: ${removedKeys.length}`);

  if (drifted.length === 0) {
    console.log('✓ Všechny snapshoty se shodují.');
    process.exit(0);
  }

  console.log('');
  console.error(`✗ Drift detekován u ${drifted.length} bibKeys:`);
  console.log('');
  for (const d of drifted) {
    console.log(`### ${d.key}`);
    console.log(`  Expected: ${d.expected}`);
    console.log(`  Actual:   ${d.actual}`);
    console.log('');
  }
  console.log('Pokud je změna zamýšlená, spusť: node scripts/test-iso690-snapshots.mjs --update');
  process.exit(1);
}

main().catch((err) => {
  console.error('✗', err.message, err.stack);
  process.exit(2);
});
