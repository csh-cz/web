#!/usr/bin/env node
/**
 * Audit `tldr` polí ve frontmatteru hodinarium-eu článků.
 * Heuristika hledá tldr, která:
 *   - opakují >= 60 % obsahu titulku (zbytečné, čtenář to už viděl)
 *   - jsou příliš dlouhá (> 250 znaků)
 *   - jsou utnutá výpustkou (auto-generated stub z migrace)
 *   - obsahují meta-zmínku „V tomto článku…"
 *
 * Output: tmp/tldr-audit.json + zhuštěný markdown report.
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function walk(d) {
  const out = [];
  for (const f of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, f.name);
    if (f.isDirectory()) out.push(...walk(p));
    else if (/\.(md|mdx)$/.test(f.name)) out.push(p);
  }
  return out;
}

function parseFmField(fm, key) {
  // Match key: "..." nebo key: '...' nebo key: ... (jednořádkové)
  const re = new RegExp(`^${key}:\\s*(['"])([\\s\\S]*?)\\1\\s*$`, 'm');
  const m = fm.match(re);
  if (m) return m[2];
  // Bez quotes — k dalšímu řádku, který začíná malým písmenem (= další klíč)
  const re2 = new RegExp(`^${key}:\\s*(.+?)$`, 'm');
  const m2 = fm.match(re2);
  return m2 ? m2[1].trim() : null;
}

const files = walk(join(ROOT, 'content/hodinarium-eu'));
let total = 0;
let withTldr = 0;
const problematic = [];
const okEntries = [];

for (const f of files) {
  total++;
  const txt = readFileSync(f, 'utf8');
  const fmMatch = txt.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) continue;
  const fm = fmMatch[1];

  const title = parseFmField(fm, 'title') || '';
  const tldr = parseFmField(fm, 'tldr');
  if (!tldr) continue;
  withTldr++;

  const issues = [];

  // 1. Overlap s titulkem (slovní)
  const stopWords = new Set(['a', 'i', 'na', 'do', 'ze', 'se', 'je', 'ale', 'to', 'pro', 'po', 'od', 'v', 've', 'k', 'ke']);
  const titleWords = new Set(
    title.toLowerCase().split(/\s+/).filter((w) => w.length >= 4 && !stopWords.has(w)),
  );
  const tldrLower = tldr.toLowerCase();
  let hits = 0;
  for (const w of titleWords) if (tldrLower.includes(w)) hits++;
  const overlapPct = titleWords.size > 0 ? hits / titleWords.size : 0;
  if (overlapPct >= 0.6) issues.push(`opakuje-titulek-${Math.round(overlapPct * 100)}%`);

  // 2. Příliš dlouhé
  if (tldr.length > 250) issues.push(`dlouhe-${tldr.length}znaku`);

  // 3. Utnuté výpustkou
  if (/[…]\s*$/.test(tldr) || /\.\.\.\s*$/.test(tldr)) issues.push('utnute');

  // 4. Meta-zmínka
  if (/v\s+tomto\s+článku|tento\s+článek\s+(popisuje|se\s+zabývá|pojednává)/i.test(tldr)) {
    issues.push('meta-zminka');
  }

  // 5. „Stručně:" prefix (artefakt po refactoru — pokud se náhodou dostal do tldr pole)
  if (/^stručně:?\s*/i.test(tldr)) issues.push('strucne-prefix');

  const entry = { file: relative(ROOT, f), title, tldr, len: tldr.length, overlapPct: Math.round(overlapPct * 100), issues };
  if (issues.length > 0) problematic.push(entry);
  else okEntries.push(entry);
}

const tmpDir = join(ROOT, 'tmp');
try { mkdirSync(tmpDir); } catch {}
writeFileSync(join(tmpDir, 'tldr-audit.json'), JSON.stringify({ total, withTldr, problematic, okEntries }, null, 2), 'utf8');

console.log('=== TLDR audit ===');
console.log(`Soubory hodinarium-eu:  ${total}`);
console.log(`S tldr:                  ${withTldr}`);
console.log(`Problematických:         ${problematic.length}`);
console.log(`OK:                      ${okEntries.length}`);
console.log('');

const byIssue = {};
for (const p of problematic) for (const i of p.issues) byIssue[i] = (byIssue[i] || 0) + 1;
console.log('Per kategorie:');
for (const [k, v] of Object.entries(byIssue).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(30)} ${v}`);
}

console.log('\nNáhodný vzorek 10 problematických:');
const sample = problematic.sort(() => Math.random() - 0.5).slice(0, 10);
for (const p of sample) {
  console.log('---');
  console.log(`  ${p.file}`);
  console.log(`  issues: ${p.issues.join(', ')}`);
  console.log(`  title:  ${p.title}`);
  console.log(`  tldr:   ${p.tldr.slice(0, 200)}${p.tldr.length > 200 ? '…' : ''}`);
}
