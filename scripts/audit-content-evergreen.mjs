#!/usr/bin/env node
/**
 * Audit evergreen content quality — content/hodinarium-eu/*.md{,x}
 *
 * Hledá indikátory legacy OCR / nedokončené migrace:
 *   1. OCR artefakty   — `**X**slovo` (bold prilepený bez mezery k textu)
 *                      — `* * *` (asterisk dividers z PDF)
 *                      — vícenásobné mezery uvnitř slov
 *   2. Plain markdown image v MDX souborech, kde by mohl být <Photo>
 *      (s alt textem obsahujícím "foto", "autor", credit-like patterns)
 *   3. Chybějící `author:` frontmatter
 *   4. Wiki/mapa odkazy v body, které by patřily do `references:`
 *      (cs.wikipedia.org, www.openstreetmap.org, mapy.cz/cz)
 *
 * Pravidla původ: skill `clanky-konvence` sekce 18 (Evergreen revize).
 *
 * Použití:
 *   pnpm content:audit                  # všech ~498 článků
 *   pnpm content:audit --top 20         # jen 20 nejproblémovějších
 *   pnpm content:audit --json           # JSON output pro CI
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..');
const CONTENT_DIR = join(ROOT, 'content', 'hodinarium-eu');

const args = process.argv.slice(2);
const TOP_IDX = args.indexOf('--top');
const TOP = TOP_IDX >= 0 && args[TOP_IDX + 1] ? parseInt(args[TOP_IDX + 1], 10) : Infinity;
const JSON_OUT = args.includes('--json');

const RULES = [
  {
    id: 'ocr-bold-attached',
    name: 'OCR: tučné slepené s textem (**X**y)',
    re: /\*\*[^*\s][^*]{0,40}\*\*(?=\w)/g,
    weight: 3,
    example: '`**Praha**1564` → typicky chyba turndown OCR; zkontroluj jestli má být `**Praha** 1564` nebo prostě `Praha 1564`',
  },
  {
    id: 'ocr-asterisk-divider',
    name: 'OCR: hvězdičkový divider `* * *`',
    re: /^\s*\*\s+\*\s+\*\s*$/gm,
    weight: 2,
    example: 'PDF→MD oddělovač paragrafů. Smazat nebo nahradit `---`.',
  },
  {
    id: 'ocr-multi-space',
    name: 'OCR: vícenásobné mezery uvnitř slov',
    re: /[a-zá-ž]  [a-zá-ž]/g,
    weight: 1,
    example: '"k l a v í r" — typický OCR rozpadly text. Verify ručně.',
  },
  {
    id: 'ocr-typo-prefix-hyphen',
    name: 'OCR: zalomené slovo s pomlčkou (e.g. "po-     krok")',
    re: /\b\w+-\s+\w+\b/g,
    weight: 2,
    example: '"po-  krok" → spojit na "pokrok". Pozor: některé jsou legitimní (např. německé řetězené slova).',
  },
  {
    id: 'wiki-link-body',
    name: 'Wiki/mapa odkaz v body (patří do references:)',
    re: /\bhttps?:\/\/(?:cs|en|de)\.wikipedia\.org\/|www\.openstreetmap\.org\/|mapy\.cz\/|maps\.google\.com\//g,
    weight: 2,
    example: 'Wiki/mapa link v textu článku — přesunout do frontmatter `references:` s typem `wiki` nebo `mapa`.',
  },
  {
    id: 'photo-credit-in-md',
    name: '![]() v MDX kde by mohl být <Photo>',
    re: /!\[[^\]]{0,200}\]\([^)]+\)/g,
    weight: 1,
    fileFilter: (path) => path.endsWith('.mdx'),
    contextCheck: (match, content) => {
      // Heuristic: photo with credit-like text after it
      const idx = content.indexOf(match);
      const next = content.slice(idx + match.length, idx + match.length + 200);
      return /foto|autor|credit|©|\(c\)|cc by|public domain/i.test(next);
    },
    example: 'MDX umožňuje `<Photo>` komponentu s explicit credit/license. Pro foto s creditem preferovat.',
  },
];

async function auditFile(file) {
  let txt;
  try {
    txt = await readFile(file, 'utf-8');
  } catch {
    return null;
  }
  const findings = [];

  // 1. Frontmatter parsing
  const fmMatch = txt.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fm = fmMatch ? fmMatch[1] : '';
  const body = fmMatch ? txt.slice(fmMatch[0].length) : txt;

  // 2. Frontmatter checks
  const hasAuthor = /^author:\s*[^\s]/m.test(fm);
  const hasDraft = /^draft:\s*true/m.test(fm);
  const hasIsStub = /^isStub:\s*true/m.test(fm);
  if (!hasAuthor && !hasDraft && !hasIsStub) {
    findings.push({
      ruleId: 'missing-author',
      ruleName: 'Chybí `author:` frontmatter',
      weight: 1,
      count: 1,
    });
  }

  // 3. Body checks
  for (const rule of RULES) {
    if (rule.fileFilter && !rule.fileFilter(file)) continue;
    const matches = [...body.matchAll(rule.re)];
    if (rule.contextCheck) {
      const filtered = matches.filter((m) => rule.contextCheck(m[0], body));
      if (filtered.length === 0) continue;
      findings.push({ ruleId: rule.id, ruleName: rule.name, weight: rule.weight, count: filtered.length, samples: filtered.slice(0, 2).map((m) => m[0].slice(0, 60)) });
    } else {
      if (matches.length === 0) continue;
      findings.push({ ruleId: rule.id, ruleName: rule.name, weight: rule.weight, count: matches.length, samples: matches.slice(0, 2).map((m) => m[0].slice(0, 60)) });
    }
  }

  if (findings.length === 0) return null;
  const score = findings.reduce((s, f) => s + f.weight * f.count, 0);
  return { file: file.replace(`${ROOT}/`, ''), score, findings };
}

async function main() {
  const entries = await readdir(CONTENT_DIR);
  const results = [];
  for (const entry of entries) {
    if (!entry.endsWith('.md') && !entry.endsWith('.mdx')) continue;
    const file = join(CONTENT_DIR, entry);
    const audit = await auditFile(file);
    if (audit) results.push(audit);
  }
  results.sort((a, b) => b.score - a.score);

  const top = results.slice(0, Math.min(TOP, results.length));

  if (JSON_OUT) {
    console.log(JSON.stringify({ total: results.length, top }, null, 2));
    return;
  }

  console.log(`\n=== Content evergreen audit — ${CONTENT_DIR.replace(`${ROOT}/`, '')} ===\n`);
  console.log(`${results.length} článků s ≥ 1 nálezem (z ${entries.filter((e) => e.endsWith('.md') || e.endsWith('.mdx')).length} celkem).\n`);

  console.log(`Top ${top.length} podle prioritního skóre (váha × výskyt):\n`);
  for (const r of top) {
    console.log(`  ${r.score.toString().padStart(3)}  ${r.file.replace('content/hodinarium-eu/', '')}`);
    for (const f of r.findings) {
      console.log(`         ${f.weight}× ${f.count.toString().padStart(2)}× ${f.ruleName}`);
      if (f.samples && f.samples.length) {
        for (const s of f.samples) console.log(`              ↪ ${s.replace(/\n/g, '⏎').slice(0, 80)}`);
      }
    }
    console.log('');
  }

  // Rule frequency summary
  const ruleStats = new Map();
  for (const r of results) {
    for (const f of r.findings) {
      const cur = ruleStats.get(f.ruleId) ?? { name: f.ruleName, files: 0, count: 0 };
      cur.files += 1;
      cur.count += f.count;
      ruleStats.set(f.ruleId, cur);
    }
  }
  console.log(`\nFrekvence pravidel (na kolik souborech × kolik výskytů):\n`);
  for (const [id, s] of [...ruleStats.entries()].sort((a, b) => b[1].count - a[1].count)) {
    console.log(`  ${s.files.toString().padStart(4)} souborech  ${s.count.toString().padStart(5)} výskytů  ${s.name}`);
  }

  console.log(`\nNávod:`);
  console.log(`  Otevři top kandidáty v Sveltia (/admin/) nebo lokálně,`);
  console.log(`  oprav podle příkladu výše. Pravidla viz`);
  console.log(`  ~/.claude/skills/clanky-konvence/SKILL.md sekce 18 (Evergreen revize).`);
  console.log(`  Run znovu po dotyku: chybový skóre by mělo klesnout.\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
