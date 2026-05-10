#!/usr/bin/env node
/**
 * D6 Slug standardizace — DRY-RUN preview.
 *
 * Vyjede mapping starý slug → nový kebab-case, bez jakékoli změny.
 * Output: docs/d6-slug-rename-preview.md s tabulkou + statistikami.
 *
 * Po review uživatelem se pustí ostrá verze (separátní skript).
 *
 * Konvenze nového slugu:
 *   - lowercase
 *   - underscore + camelCase boundary → pomlčka
 *   - sekvence číslic se zachová (PRS10 → prs10, NE prs-10)
 *   - sekvence velkých písmen se rozdělí podle CamelCase (NTPH → ntph)
 */
import { readdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..');
const OUT_PATH = join(ROOT, 'docs/d6-slug-rename-preview.md');

const COLLECTIONS = [
  { name: 'hodinarium-eu', folder: 'content/hodinarium-eu' },
  { name: 'kronika', folder: 'content/kronika' },
];

/** Convert any slug-like string to kebab-case lowercase ASCII.
 *
 *  Rules:
 *  - underscore → pomlčka
 *  - mezery → pomlčka
 *  - CamelCase boundary (lower→Upper) → pomlčka mezi
 *  - sekvence Upper followed by lower (TWOWords) → split (T-W-O-Words? ne, TwoWords → two-words)
 *  - vše lowercase
 *  - více pomlček dohromady → jedna
 */
function kebabize(s) {
  return s
    // CamelCase: insert pomlčka mezi lower→Upper
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    // ALLCAPS sequence followed by lower: TimSlider → Tim-Slider (matched výše),
    //   ale GPSSakul → GPS-Sakul, dále zpracuje druhý regex
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    // underscore + space → pomlčka
    .replace(/[_\s]+/g, '-')
    // multiple pomlčky → jedna
    .replace(/-+/g, '-')
    // trim okrajové pomlčky
    .replace(/^-|-$/g, '')
    // lowercase + ASCII fold
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function isKebab(s) {
  return /^[a-z0-9-]+$/.test(s) && !s.includes('--') && !s.startsWith('-') && !s.endsWith('-');
}

const proposed = []; // { collection, oldId, newId, fileName, conflict?: 'duplicate' | 'no-change' }
const seen = new Map(); // newId → first oldId per collection

for (const col of COLLECTIONS) {
  const dir = join(ROOT, col.folder);
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    continue;
  }
  const collectionSeen = new Map();
  for (const e of entries) {
    if (!e.isFile()) continue;
    if (!e.name.endsWith('.md') && !e.name.endsWith('.mdx')) continue;
    if (e.name.startsWith('_')) continue; // skip drafts/test fixtures (_test-draft-article)
    const ext = e.name.endsWith('.mdx') ? '.mdx' : '.md';
    const oldId = e.name.slice(0, -ext.length);
    if (isKebab(oldId)) continue; // already kebab, skip
    const newId = kebabize(oldId);
    let conflict;
    if (oldId === newId) {
      conflict = 'no-change'; // shouldn't happen kvůli isKebab check
    } else if (collectionSeen.has(newId)) {
      conflict = `duplicate-with-${collectionSeen.get(newId)}`;
    } else {
      collectionSeen.set(newId, oldId);
    }
    proposed.push({ collection: col.name, oldId, newId, fileName: e.name, ext, conflict });
  }
}

// Také zachytit case-only changes (Arduino → arduino) — kebab regex neprošlo
const stats = {
  totalProposed: proposed.length,
  conflicts: proposed.filter((p) => p.conflict?.startsWith('duplicate')).length,
  noChange: proposed.filter((p) => p.conflict === 'no-change').length,
  caseFold: proposed.filter((p) => p.oldId.toLowerCase() === p.newId).length,
  underscoreOrCamel: proposed.filter((p) => p.oldId.toLowerCase() !== p.newId).length,
};

let out = `# D6 Slug rename — dry-run preview

**Generated:** ${new Date().toISOString()}

## Souhrn

- **Soubory navržené k přejmenování:** ${stats.totalProposed}
- **Konflikty (duplicate target):** ${stats.conflicts}
- **Pouze case-fold** (Arduino → arduino): ${stats.caseFold}
- **Underscore / CamelCase rozpad** (Arduino_IBM → arduino-ibm): ${stats.underscoreOrCamel - stats.caseFold}

## Postup po schválení

Pro každý řádek v tabulce níže ostrá verze udělá:

1. \`git mv content/<col>/<oldId>.<ext> content/<col>/<newId>.<ext>\`
2. Update \`slug:\` pole ve frontmatteru souboru
3. Přidá redirect \`/<old-url> /<new-url> 301\` do \`scripts/build-redirects.ts\`
   - Specifické pro non-karta články: \`/clanky/<oldId>\` a \`/<kategorie>/<oldId>\`
   - Karty (sbirka/karta/inv-*): glob už existuje, jen rename file
4. Grep všech inline markdown odkazů \`[text](/clanky/<old>)\` napříč repo + replace
5. Catalog.json se přepočítá automaticky při \`pnpm build\`
6. Sveltia config: \`slug pattern hint\` už existuje (= editor info)

## Konflikty (vyžadují manual override)

`;

const conflicts = proposed.filter((p) => p.conflict?.startsWith('duplicate'));
if (conflicts.length === 0) {
  out += '_Žádné konflikty._\n\n';
} else {
  out += '| Collection | Old ID | New ID | Conflict |\n|---|---|---|---|\n';
  for (const p of conflicts) {
    out += `| ${p.collection} | \`${p.oldId}\` | \`${p.newId}\` | ${p.conflict} |\n`;
  }
  out += '\n_Pro každý konflikt potřeba zvolit jiný target slug (např. přidat suffix `-1`, `-2`)._\n\n';
}

// Per collection
for (const col of COLLECTIONS) {
  const items = proposed.filter((p) => p.collection === col.name && !p.conflict);
  if (items.length === 0) continue;
  out += `## ${col.name} (${items.length} souborů)\n\n`;
  out += '| Starý slug | Nový slug |\n|---|---|\n';
  for (const p of items) {
    out += `| \`${p.oldId}\` | \`${p.newId}\` |\n`;
  }
  out += '\n';
}

await writeFile(OUT_PATH, out, 'utf-8');
console.log(`✓ ${OUT_PATH.replace(`${ROOT}/`, '')}`);
console.log(`  ${stats.totalProposed} souborů navržených, ${stats.conflicts} konfliktů`);
