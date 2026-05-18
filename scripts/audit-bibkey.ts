/**
 * Audit bibKey usage napříč content/ vs references.json (Zotero SSOT).
 *
 * Reportuje:
 *   1. bibKey-only refs s NO Zotero match a NO fallback (title/url/citace)
 *      → UI zobrazí bare key string místo ISO 690 citace
 *   2. Souhrn: total used, present, missing, files affected
 *
 * Použití:
 *   npx tsx scripts/audit-bibkey.ts
 *   npx tsx scripts/audit-bibkey.ts --json   # JSON output pro tooling
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

const refs = JSON.parse(readFileSync('apps/hodinarium-eu/src/data/references.json', 'utf-8')) as any[];
const known = new Set(refs.map((r) => r['citation-key']).filter(Boolean));
const asJson = process.argv.includes('--json');

const dirs = [
  'content/hodinari', 'content/clanky', 'content/karty',
  'content/soupis-veznich-hodin', 'content/kroky', 'content/slovnik',
  'content/hodinarium-eu', 'content/kronika',
];

interface Problem { file: string; field: string; bibKey: string; note?: string; }
const problematic: Problem[] = [];
const allUsed = new Set<string>();
const allMissing = new Set<string>();

function walk(dir: string) {
  try { statSync(dir); } catch { return; }
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (name.endsWith('.md') || name.endsWith('.mdx')) {
      const txt = readFileSync(p, 'utf-8');
      const m = txt.match(/^---\n([\s\S]+?)\n---/);
      if (!m) continue;
      let fm: any;
      try { fm = yaml.load(m[1]); } catch { continue; }
      for (const fieldName of ['references', 'prameny']) {
        const arr = fm?.[fieldName];
        if (!Array.isArray(arr)) continue;
        for (const r of arr) {
          if (r?.bibKey) {
            allUsed.add(r.bibKey);
            if (!known.has(r.bibKey)) {
              allMissing.add(r.bibKey);
              const hasFallback = r.title || r.url || r.citace || r.author || r.autor;
              if (!hasFallback) problematic.push({ file: p, field: fieldName, bibKey: r.bibKey, note: r.note });
            }
          }
        }
      }
    }
  }
}
for (const d of dirs) walk(d);

if (asJson) {
  console.log(JSON.stringify({
    summary: {
      totalUsed: allUsed.size,
      present: allUsed.size - allMissing.size,
      missing: allMissing.size,
      problematic: problematic.length,
      files: new Set(problematic.map((p) => p.file)).size,
    },
    missing: [...allMissing].sort(),
    problematic,
  }, null, 2));
} else {
  console.log('=== bibKey audit ===');
  console.log('Unique bibKeys used:', allUsed.size);
  console.log('Present in references.json:', allUsed.size - allMissing.size);
  console.log('Missing from references.json:', allMissing.size);
  console.log();
  console.log('=== Problematic: bibKey-only with NO Zotero match AND NO fallback (real UI problem) ===');
  console.log('Total entries:', problematic.length);
  const byFile = new Map<string, Problem[]>();
  for (const p of problematic) {
    if (!byFile.has(p.file)) byFile.set(p.file, []);
    byFile.get(p.file)!.push(p);
  }
  console.log('Files:', byFile.size);
  console.log();
  for (const [f, entries] of [...byFile.entries()].sort((a, b) => b[1].length - a[1].length)) {
    console.log(f);
    for (const e of entries) console.log('   →', e.bibKey, e.note ? ('  // note: ' + e.note.slice(0, 60)) : '');
  }
}
