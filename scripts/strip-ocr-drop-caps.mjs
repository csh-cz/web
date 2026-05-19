#!/usr/bin/env node
/**
 * strip-ocr-drop-caps.mjs — odstraní legacy OCR drop-cap artefakty
 * v body článků.
 *
 * Pattern: `**X**slovo` (jednopísmenné bold prilepené bez mezery k textu).
 * Per memory `clanky-konvence` sekce 2.5:
 *   „První písmena dalších odstavců NEZVÝRAZŇOVAT. `**X**a první pohled`
 *    per-paragraph je legacy noise z původního HTML stylingu. Strip
 *    manuální `**X**slovo` na začátku paragrafu — CSS drop-cap
 *    pokrývá jen první paragraf."
 *
 * Auto-fix strategie:
 *   Pattern A — `**[1 znak]**[a-z]` na začátku slova (= drop-cap):
 *               → strip bold, ponech text  (`**N**a` → `Na`)
 *   Pattern B — `**[2+ znaků]**[a-z]` (= prilepený bold s víc znaky):
 *               LOG, nedělej auto-fix; vyžaduje human review
 *               (`**Praha**1564` může být `**Praha** 1564` nebo `Praha 1564`)
 *
 * Použití:
 *   node scripts/strip-ocr-drop-caps.mjs              # dry-run
 *   node scripts/strip-ocr-drop-caps.mjs --apply
 *   node scripts/strip-ocr-drop-caps.mjs --log-b       # vypsat pattern B nálezy
 */

import { readFile, writeFile, glob } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const apply = process.argv.includes('--apply');
const logB = process.argv.includes('--log-b');

function splitFrontmatter(md) {
  const m = /^(---\n[\s\S]*?\n---\n)([\s\S]*)$/.exec(md);
  if (!m) return { header: '', body: md };
  return { header: m[1], body: m[2] };
}

/**
 * Pattern A — `**X**y` kde X je 1 znak (písmeno). Strip bold.
 * Regex matches: `**X**y` na začátku slova nebo paragrafu.
 */
const PATTERN_A = /\*\*([A-ZÁ-ŽĚŠČŘŽÝÁÍÉÚŮÓŇŤĎ])\*\*([a-zá-žěščřžýáíéúůóňťď])/g;

/**
 * Pattern B — `**Slovo**slovo` kde slovo uvnitř bold neobsahuje mezeru
 * ani interpunkci (= jediné slovo, opravdu slepené s následujícím slovem).
 * Tighter než A: vyžaduje single word uvnitř + word char hned za `**`.
 * Eliminuje false positives jako `**bold konec**, **nový bold**` kde
 * regex jinak chytí fragment „** konec**, **nový **" jako pattern B.
 */
const PATTERN_B = /\*\*([A-Za-zÁ-Žá-žĚŠČŘŽÝÁÍÉÚŮÓŇŤĎěščřžýáíéúůóňťď]{2,30})\*\*(?=[A-Za-zÁ-Žá-žĚŠČŘŽÝÁÍÉÚŮÓŇŤĎěščřžýáíéúůóňťď])/g;

function processBody(body) {
  // First strip Pattern A (drop-caps)
  const aMatches = [...body.matchAll(PATTERN_A)];
  const bodyAfterA = body.replace(PATTERN_A, '$1$2');
  // Then find remaining Pattern B (those that don't match A)
  const bMatches = [...bodyAfterA.matchAll(PATTERN_B)];
  return { bodyAfterA, aMatches, bMatches };
}

async function main() {
  process.chdir(ROOT);
  const paths = [];
  for await (const p of glob('content/**/*.md')) paths.push(p);
  for await (const p of glob('content/**/*.mdx')) paths.push(p);

  let touchedFiles = 0;
  let totalStripped = 0;
  let totalLeftB = 0;
  const log = [];

  for (const path of paths) {
    const md = await readFile(path, 'utf-8');
    const { header, body } = splitFrontmatter(md);
    const { bodyAfterA, aMatches, bMatches } = processBody(body);
    if (aMatches.length === 0 && bMatches.length === 0) continue;
    totalStripped += aMatches.length;
    totalLeftB += bMatches.length;
    if (aMatches.length > 0) {
      touchedFiles++;
      log.push({ path, a: aMatches.length, b: bMatches.length });
      if (apply) {
        await writeFile(path, header + bodyAfterA);
      }
    } else if (logB && bMatches.length > 0) {
      log.push({ path, a: 0, b: bMatches.length, bSamples: bMatches.slice(0, 3).map((m) => m[0]) });
    }
  }

  log.sort((a, b) => b.a - a.a);

  console.log(`# Strip OCR drop-caps — ${apply ? 'APPLY' : 'DRY-RUN'}\n`);
  console.log(`Touched (pattern A): ${touchedFiles} files`);
  console.log(`Pattern A stripped:  ${totalStripped}`);
  console.log(`Pattern B remaining: ${totalLeftB} (needs human review)\n`);

  console.log('## Top 20 affected:');
  for (const e of log.slice(0, 20)) {
    const samples = e.bSamples ? `  [B: ${e.bSamples.join(', ').slice(0, 70)}]` : '';
    console.log(`  A=${String(e.a).padStart(3)} B=${String(e.b).padStart(2)}  ${e.path}${samples}`);
  }
  if (log.length > 20) console.log(`  … +${log.length - 20} dalších`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
