#!/usr/bin/env node
// Redakce osobních údajů vlastníků/zápůjčitelů ze sbírkových karet.
//
// Public web nesmí zveřejňovat jména konkrétních fyzických osob jakožto vlastníků
// vystavených exponátů. Tento skript:
//
//   1) Z každé karty content/hodinarium-eu/inv-*.md uloží do
//      `local/vlastnici.json` (gitignored) původní hodnoty `karta.majitel` a
//      `karta.darceZapujcitel` spolu s `inventarniCislo` a slugem.
//   2) V kartě nahradí `karta.majitel`:
//        - "ČSH" → "ČSH" (ponecháno; spolek je veřejný subjekt)
//        - cokoli jiného → "zápůjčka"
//   3) V kartě vyprázdní `karta.darceZapujcitel: ""` (původní hodnota uložena lokálně).
//
// Spuštění z root repa: `node scripts/redact-vlastnici.mjs`
// Idempotentní: druhé spuštění pole už neredaktuje (kontroluje, jestli majitel
// je už jen "ČSH" / "zápůjčka").

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'content', 'hodinarium-eu');
const LOCAL_DIR = path.join(ROOT, 'local');
const LOCAL_FILE = path.join(LOCAL_DIR, 'vlastnici.json');

if (!fs.existsSync(LOCAL_DIR)) fs.mkdirSync(LOCAL_DIR, { recursive: true });

// Načíst případnou předchozí mapu (idempotence — neztrácet historické záznamy)
let mapping = {};
if (fs.existsSync(LOCAL_FILE)) {
  try { mapping = JSON.parse(fs.readFileSync(LOCAL_FILE, 'utf8')); } catch {}
}

const files = fs.readdirSync(DIR).filter(f => /^inv-.*\.md$/.test(f));

let redacted = 0, alreadyClean = 0, noOwner = 0;
for (const file of files) {
  const fp = path.join(DIR, file);
  let src = fs.readFileSync(fp, 'utf8');

  // Parse minimálního frontmatteru pro kartu — najdeme `karta.inventarniCislo`,
  // `karta.majitel`, `karta.darceZapujcitel`. Neparsujeme YAML, jen řádkově
  // (YAML inden 4 pro nested klíče, vidíme ve sample kartách).
  const slug = file.replace(/\.md$/, '');
  const invMatch = src.match(/^\s+inventarniCislo:\s*"?([^"\n]+)"?$/m);
  const majMatch = src.match(/^(\s+)majitel:\s*("([^"]*)"|([^\n]*))$/m);
  const darceMatch = src.match(/^(\s+)darceZapujcitel:\s*("([^"]*)"|([^\n]*))$/m);

  if (!majMatch && !darceMatch) {
    noOwner++;
    continue;
  }

  const invCislo = invMatch ? invMatch[1].trim() : '?';
  const origMajitel = majMatch ? (majMatch[3] !== undefined ? majMatch[3] : majMatch[4]).trim() : null;
  const origDarce = darceMatch ? (darceMatch[3] !== undefined ? darceMatch[3] : darceMatch[4]).trim() : null;

  // Kontrola idempotence
  const isCleanMajitel = !origMajitel || origMajitel === 'ČSH' || origMajitel === 'zápůjčka';
  const isCleanDarce = !origDarce || origDarce === '' || origDarce === "''";

  if (isCleanMajitel && isCleanDarce) {
    alreadyClean++;
    continue;
  }

  // Save originál
  mapping[slug] = mapping[slug] || {};
  mapping[slug].inventarniCislo = invCislo;
  if (origMajitel && origMajitel !== 'ČSH' && origMajitel !== 'zápůjčka') {
    mapping[slug].original_majitel = origMajitel;
  }
  if (origDarce && origDarce !== '' && origDarce !== "''") {
    mapping[slug].original_darceZapujcitel = origDarce;
  }

  // Redact
  if (majMatch) {
    const newValue = origMajitel === 'ČSH' ? '"ČSH"' : '"zápůjčka"';
    src = src.replace(majMatch[0], `${majMatch[1]}majitel: ${newValue}`);
  }
  if (darceMatch && origDarce) {
    src = src.replace(darceMatch[0], `${darceMatch[1]}darceZapujcitel: ""`);
  }

  fs.writeFileSync(fp, src, 'utf8');
  redacted++;
}

// Save mapping
fs.writeFileSync(LOCAL_FILE, JSON.stringify(mapping, null, 2) + '\n', 'utf8');

console.log('\n=== Redakce vlastníků sbírkových karet ===');
console.log(`Redacted:      ${redacted}`);
console.log(`Already clean: ${alreadyClean}`);
console.log(`No owner:      ${noOwner}`);
console.log(`Mapping saved: ${path.relative(ROOT, LOCAL_FILE)} (${Object.keys(mapping).length} entries)`);
