#!/usr/bin/env node
// Audit potenciálních úniků jmen privátních vlastníků/zápůjčitelů ve veřejném
// obsahu. Hledá výskyty 21 jmen ze `local/vlastnici.json` v `content/` a
// kategorizuje je podle kontextu na:
//
//   ✅ LEGITIMATE — OK kontexty (author, restaurator, citace, foto credit, ...)
//   ⚠️ AMBIGUOUS  — vyžaduje ruční review (neutrální zmínka v body textu)
//   ❌ OWNERSHIP_LEAK — jasný únik (formulace „majetek X", „vlastník", „od X
//      jsme dostali", „X zapůjčil"), pole `darceZapujcitel` mimo redakci atd.
//
// Spuštění: `node scripts/audit-vlastnici-leaks.mjs`
// Nepushuje, jen reportuje. Lokální `local/vlastnici.json` musí existovat.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOCAL = path.join(ROOT, 'local', 'vlastnici.json');

if (!fs.existsSync(LOCAL)) {
  console.error('local/vlastnici.json not found — run scripts/redact-vlastnici.mjs first.');
  process.exit(1);
}

// Privátní jména — vše z `local/vlastnici.json` minus veřejné instituce/firmy
const data = JSON.parse(fs.readFileSync(LOCAL, 'utf8'));
const PUBLIC_ORGS = new Set([
  'ČSH', 'zápůjčka', 'Muzeum Děčín', 'Biskupství litoměřické',
  'Arcibiskupství pražské', 'MÚ Benešov', 'Hvězdárna Petřín',
  'Farnost Mikulášovice', 'Budislav', 'Elekon', 'Sakul',
  'Římskokatolickou farností Odolena Voda', 'Litoměřické diecéze',
  'Kalista Kredum',
]);
const names = new Set();
for (const e of Object.values(data)) {
  for (const f of [e.original_majitel, e.original_darceZapujcitel]) {
    if (!f) continue;
    for (const part of f.replace('+', ',').split(',')) {
      const n = part.trim();
      if (n && !PUBLIC_ORGS.has(n) && n.length >= 3) names.add(n);
    }
  }
}

// Sort by length DESC — match "Petr Král" before "Král" to avoid double-count
const sorted = [...names].sort((a, b) => b.length - a.length);

// Walk content
function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (/\.(mdx|md)$/.test(e.name)) out.push(p);
  }
  return out;
}
const files = walk(path.join(ROOT, 'content'));

// Heuristika kategorizace kontextu — slova kolem matche
const OWNERSHIP_TERMS = [
  /\bmajetek\b/i, /\bvlastník\w*/i, /\bvlastní(t||m|me)\b/i,
  /\bzapůjčil\w*/i, /\bzapůjč(itel|en)\w*/i, /\bdárce\b/i, /\bdaroval\w*/i,
  /\b(od|díky)\s+\w*$/i,  // „od X" / „díky X"
  /\bmajitel\w*/i, /\bvystavovat\w*/i, /\bvlastnictv[ií]\w*/i,
  /\bod jeho/i, /\bod jejího/i, /\bz jeho/i, /\bze sbírky/i,
  /převzato/i, /získali jsme/i, /získáno od/i,
];
const LEGITIMATE_FIELDS = [
  'author:', 'autor:', 'restaurator:', 'restauratorka:', 'credit:',
  'photographer:', 'editor:', 'note:', 'citace:', 'kontakt:',
];
const LEGITIMATE_BODY_TERMS = [
  /\b(akademický |ak\. )?soch\w*/i, /\brestaurátor\w*/i, /\brestaurátorka\b/i,
  /\bautor\w*/i, /\beditor\w*/i, /\bfotografoval\w*/i, /\b\(foto/i,
  /\bkomunikace\b/i, /\bkonzultac\w*/i, /\b(podle|dle)\s+\w*\s*(\d{4})/i,
];
// Per-name legitimate patterns — výstup "<Name> YYYY" nebo "<Name> & YYYY"
const PUBLICATION_CITATION = /\b(Knespl|Hartman|Sladkovský|Strnad|Riegger|Michal|Skála|Halata|Líbal|Zahradník|Kynčl|Kavková)\s*(20\d{2}|19\d{2}|&|\(20|\(19|—|—)/;
// Author/text creator pattern: "Text/foto/autor/program/SW/text: Name"
const AUTHOR_BYLINE = /^(Text|Foto|Autor\w*|Program|SW|Konstrukce|Editor)[a-zé,\s]*:\s*[A-ZŠČŘŽÝÁÍÉĚŇÚ]/;
// Public business name pattern — "kovářství X", "firma X", "ateliér X & Y"
const PUBLIC_BUSINESS = /\b(kovářství|firma|spole[čc]nost|atel[íi]e[rř]|hodinářský|restaurátorský|ateliér)\b/i;

const issues = { ownership: [], ambiguous: [], legitimate: 0 };

for (const fp of files) {
  const src = fs.readFileSync(fp, 'utf8');
  const rel = path.relative(ROOT, fp);
  // Skip the local mapping itself if scanning local/
  if (rel.startsWith('local/')) continue;

  const lines = src.split('\n');
  const hits = []; // [{lineIdx, name, context}]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let lineRemain = line;
    for (const name of sorted) {
      const idx = lineRemain.indexOf(name);
      if (idx === -1) continue;
      // Whole-word boundary kontrola — neuznat 'Knespl' uvnitř delšího slova
      const before = idx === 0 ? '' : lineRemain[idx - 1];
      const after = idx + name.length < lineRemain.length ? lineRemain[idx + name.length] : '';
      if (/\w/.test(before) || /\w/.test(after)) continue;
      hits.push({ lineIdx: i, name, line });
    }
  }

  for (const h of hits) {
    const lineLower = h.line.toLowerCase();
    const ctxBefore = h.lineIdx > 0 ? lines[h.lineIdx - 1] : '';
    const ctxAfter = h.lineIdx < lines.length - 1 ? lines[h.lineIdx + 1] : '';
    const fullCtx = `${ctxBefore}\n${h.line}\n${ctxAfter}`.toLowerCase();

    // Test 1: ownership leak
    let ownership = false;
    for (const term of OWNERSHIP_TERMS) {
      if (term.test(h.line) || term.test(ctxBefore) || term.test(ctxAfter)) {
        ownership = true;
        break;
      }
    }
    // Speciální: pole `majitel:` nebo `darceZapujcitel:` v YAML frontmatteru
    if (/^\s*(majitel|darceZapujcitel|vlastnik):/i.test(h.line)) ownership = true;

    // Test 2: legitimate context
    let legitimate = false;
    for (const fld of LEGITIMATE_FIELDS) {
      if (h.line.startsWith(fld) || h.line.includes(`  ${fld}`)) { legitimate = true; break; }
    }
    if (!legitimate) {
      for (const term of LEGITIMATE_BODY_TERMS) {
        if (term.test(fullCtx)) { legitimate = true; break; }
      }
    }
    // Test 2b: "Name YYYY" publication citation
    if (!legitimate && PUBLICATION_CITATION.test(h.line)) legitimate = true;
    // Test 2c: "Knesplov*" derived adjective ("Knesplův komentář")
    if (!legitimate && /Knesplov\w*\s+(komentář|edice|rozbor|verze|článek|citace)/i.test(h.line)) legitimate = true;
    // Test 2d: byline-style author line "Text: Name", "Foto: Name"
    if (!legitimate && AUTHOR_BYLINE.test(h.line.trim())) legitimate = true;
    // Test 2e: public business name nearby (kovářství/firma/ateliér)
    if (!legitimate && PUBLIC_BUSINESS.test(h.line)) legitimate = true;

    const lineNum = h.lineIdx + 1;
    const trimmed = h.line.trim().substring(0, 200);
    if (ownership) {
      issues.ownership.push(`${rel}:${lineNum} [${h.name}]  ${trimmed}`);
    } else if (legitimate) {
      issues.legitimate++;
    } else {
      issues.ambiguous.push(`${rel}:${lineNum} [${h.name}]  ${trimmed}`);
    }
  }
}

// Report
console.log('\n=== AUDIT VLASTNÍKŮ — ÚNIKY VE VEŘEJNÉM OBSAHU ===\n');
console.log(`Searching for ${sorted.length} private names: ${sorted.slice(0, 5).join(', ')}, ...`);
console.log(`Searched ${files.length} content files\n`);

console.log(`✅ Legitimate context (autor/restaurátor/foto/citace): ${issues.legitimate}`);
console.log(`⚠️  Ambiguous (k ručnímu review): ${issues.ambiguous.length}`);
console.log(`❌ OWNERSHIP LEAK: ${issues.ownership.length}\n`);

if (issues.ownership.length > 0) {
  console.log('--- ❌ OWNERSHIP LEAKS ---');
  for (const i of issues.ownership.slice(0, 50)) console.log(`  ${i}`);
  if (issues.ownership.length > 50) console.log(`  ... ${issues.ownership.length - 50} more`);
  console.log();
}

if (issues.ambiguous.length > 0) {
  console.log('--- ⚠️  AMBIGUOUS (top 30) ---');
  for (const i of issues.ambiguous.slice(0, 30)) console.log(`  ${i}`);
  if (issues.ambiguous.length > 30) console.log(`  ... ${issues.ambiguous.length - 30} more`);
}
