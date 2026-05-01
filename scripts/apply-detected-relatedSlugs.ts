/**
 * Aplikuje výstup `pnpm hodinari:detect -- --json` do hodinari.ts —
 * doplňuje detekované slugy do relatedSlugs[] pro každého hodináře,
 * přitom zachovává existující slugy (nepřepisuje je).
 *
 * Run: pnpm hodinari:detect -- --json | tsx scripts/apply-detected-relatedSlugs.ts
 *      pnpm hodinari:detect -- --json > tmp/h.json && tsx scripts/apply-detected-relatedSlugs.ts tmp/h.json
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const HODINARI_TS = join(ROOT, 'apps', 'hodinarium-eu', 'src', 'data', 'hodinari.ts');

interface Detection {
  hodinar: string;
  jmeno: string;
  current: string[];
  detected: string[];
  added: string[];
  removed: string[];
}

async function main() {
  // Read JSON either from stdin or argv[2]
  let raw: string;
  const argFile = process.argv[2];
  if (argFile && argFile !== '-') {
    raw = await readFile(argFile, 'utf-8');
  } else {
    raw = readFileSync(0, 'utf-8');
  }
  // Strip pnpm preamble
  const jsonStart = raw.indexOf('[');
  if (jsonStart < 0) throw new Error('No JSON array found');
  const detections: Detection[] = JSON.parse(raw.slice(jsonStart));

  let src = await readFile(HODINARI_TS, 'utf-8');
  let totalAdded = 0;
  let entriesModified = 0;

  for (const d of detections) {
    if (d.added.length === 0) continue;

    // Build merged list: union of current + detected (deduplicated, sorted)
    const merged = [...new Set([...d.current, ...d.added])].sort();
    const oldList = d.current;

    // Find the entry block by slug, then find its relatedSlugs and replace
    const slugRegex = new RegExp(`(slug:\\s*'${d.hodinar}'[\\s\\S]*?relatedSlugs:\\s*)\\[([^\\]]*)\\]`);
    const m = src.match(slugRegex);
    if (!m) {
      console.warn(`!! Skipping ${d.hodinar} — couldn't find relatedSlugs in source`);
      continue;
    }

    // Build new array literal — single line if short, multi-line if long
    let newArr: string;
    const totalLen = merged.reduce((s, x) => s + x.length + 4, 4);
    if (merged.length === 0) {
      newArr = '[]';
    } else if (totalLen < 80) {
      newArr = `[${merged.map((x) => `'${x}'`).join(', ')}]`;
    } else {
      newArr = `[\n      ${merged.map((x) => `'${x}'`).join(",\n      ")},\n    ]`;
    }

    src = src.replace(slugRegex, `$1${newArr}`);
    totalAdded += d.added.length;
    entriesModified++;
    console.log(`✓ ${d.hodinar}: +${d.added.length} (${oldList.length} → ${merged.length})`);
  }

  await writeFile(HODINARI_TS, src, 'utf-8');
  console.log(`\nVýsledek: ${entriesModified} entries upraveno, +${totalAdded} relatedSlugs.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
