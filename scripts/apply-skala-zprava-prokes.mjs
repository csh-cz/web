#!/usr/bin/env node
// Integrate Skála's „Závěrečná zpráva o provedení soupisu historicky cenných věžních
// hodinových strojů ve středočeském regionu" (Sadská, prosinec 2004) into matching
// Prokeš cards in content/soupis-veznich-hodin/.
//
// For each mapped card:
//   1. Append a Skála 2004 pramen entry to `prameny:` (creates list if absent).
//   2. Append a `## Hodnocení v Skálově zprávě 2004` section to the body.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '..');
const DIR = path.join(ROOT, 'content', 'soupis-veznich-hodin');

// (filename, docYear, label-in-zpráva, class, lokalita)
const ENTRIES = [
  ['1873-bakov-nad-jizerou-prokes', 2001, 'Jan Prokeš malý', 3, 'Bakov, kostel sv. Bartoloměje'],
  ['1887-bosin-prokes',             1996, 'Jan Prokeš 1887',  2, 'Bošín, evangelický kostel'],
  ['1868-bychory-prokes',           1998, 'Jan Prokeš, zvonicí stroj 1868', 2, 'Býchory, zámek'],
  ['1869-dymokury-prokes',          1998, 'Jan Prokeš 1869',  3, 'Dymokury, zámek'],
  ['nedatovano-chotetov-prokes',    1998, 'Jan Prokeš 2. pol. 19. stol.', 3, 'Chotětov, kostel sv. Ondřeje'],
  ['1891-chroustov-prokes-jr',      2003, 'Jan Prokeš 1891',  4, 'Chroustov, kostel Nanebevzetí Panny Marie'],
  ['1855-katusice-prokes',          2003, 'Jan Prokeš 1855',  3, 'Katusice, kostel Nanebevzetí Panny Marie'],
  ['nedatovano-kourim-prokes',      1997, 'Jan Prokeš (elektrifikovaný)', 5, 'Kouřim, zvonice'],
  ['1876-ondrejov-prokes',          2004, 'Jan Prokeš, Sobotka 1876', 4, 'Ondřejov, kostel sv. Šimona a Judy'],
  ['1857-skalsko-prokes',           2003, 'Jan Prokeš, Sobotka 1857', 4, 'Skalsko, kostel sv. Havla'],
  ['1883-zdetin-prokes-josef',      2003, 'Jan Prokeš, Sobotka', 3, 'Zdětín, kostel Všech Svatých'],
  ['nedatovano-zitovlice-prokes',   1999, 'J. Prokeš (přestavěn B. Proňkem)', 5, 'Žitovlice, kostel sv. Václava'],
];

const SKALA_CITACE = `SKÁLA, Petr. *Závěrečná zpráva o provedení soupisu historicky cenných věžních hodinových strojů ve středočeském regionu*. Sadská, prosinec 2004. — Rukopis (MS Word 9.0, 16 607 znaků), archiv atelieru veznihodiny.cz. Soupis 138 strojů zdokumentovaných v letech 1996–2004 s klasifikací 1–5 (priorita ochrany; 1 = nejvyšší historická hodnota).`;

const SKALA_PRAMEN_BLOCK = `  - citace: |
      ${SKALA_CITACE}
    type: zprava
`;

function classDescription(c) {
  switch (c) {
    case 1: return '**Třída 1** — nejvyšší hodnocení v rámci celého soupisu (138 strojů); priorita pro památkovou ochranu.';
    case 2: return '**Třída 2** — vysoce hodnotný stroj; uveden ve výběru navrženém k památkové ochraně.';
    case 3: return '**Třída 3** — historicky cenný stroj.';
    case 4: return '**Třída 4** — zajímavý a hodnotný stroj.';
    case 5: return '**Třída 5** — zajímavá a cenná technická památka, byť relativně nižší priorita ochrany.';
    default: return `**Třída ${c}**.`;
  }
}

let updated = 0, skipped = 0;
for (const [name, docYear, label, klass, lokalita] of ENTRIES) {
  const fp = path.join(DIR, `${name}.mdx`);
  if (!fs.existsSync(fp)) {
    console.warn(`MISSING file: ${name}.mdx`);
    continue;
  }
  let src = fs.readFileSync(fp, 'utf8');
  if (src.includes('Závěrečná zpráva o provedení soupisu')) {
    console.log(`SKIP ${name} (already references Skála 2004)`);
    skipped++;
    continue;
  }

  // Split frontmatter / body
  const m = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) { console.warn(`BAD FORMAT: ${name}`); continue; }
  let fm = m[1], body = m[2];

  // Add pramen entry. If `prameny:` already exists, append our entry; otherwise insert before `zdrojDat:` or at end.
  if (/^prameny:\s*$/m.test(fm) || /^prameny:\s*\n\s+- /m.test(fm)) {
    // Append at end of prameny list — find last prameny item, insert after it
    const lines = fm.split('\n');
    let i = lines.findIndex(l => /^prameny:\s*$/.test(l));
    if (i === -1) i = lines.findIndex(l => /^prameny:/.test(l));
    // Find end of prameny list
    let j = i + 1;
    while (j < lines.length && (/^\s+/.test(lines[j]) || /^\s*$/.test(lines[j]))) {
      if (/^[a-zA-Z_]/.test(lines[j])) break;
      j++;
    }
    // Insert our entry before line j
    const insert = SKALA_PRAMEN_BLOCK.split('\n');
    while (insert.length && insert[insert.length-1] === '') insert.pop();
    lines.splice(j, 0, ...insert);
    fm = lines.join('\n');
  } else {
    // No prameny block — add one before zdrojDat or at end
    const block = `prameny:\n${SKALA_PRAMEN_BLOCK}`;
    if (/^zdrojDat:/m.test(fm)) {
      fm = fm.replace(/^zdrojDat:/m, block + 'zdrojDat:');
    } else {
      fm = fm.trimEnd() + '\n' + block;
    }
  }

  // Append body section
  const section = `\n## Hodnocení v Skálově zprávě 2004\n\nVěžní hodiny v lokalitě **${lokalita}** byly zdokumentovány **[Petrem Skálou](/hodinari/petr-skala)** v roce **${docYear}** (popis stroje: „${label}"). V závěrečném soupisu Skály z prosince 2004 dostal stroj klasifikaci **${klass}** (rozsah 1–5, kde 1 je nejvyšší). ${classDescription(klass)}\n\n*Pramen: SKÁLA, Petr. Závěrečná zpráva o provedení soupisu historicky cenných věžních hodinových strojů ve středočeském regionu. Sadská, prosinec 2004 — viz prameny.*\n`;
  body = body.trimEnd() + '\n' + section;

  const out = `---\n${fm}\n---\n${body}`;
  fs.writeFileSync(fp, out, 'utf8');
  console.log(`UPDATED ${name} (doc ${docYear}, class ${klass})`);
  updated++;
}
console.log(`\nTotal: ${updated} updated, ${skipped} skipped.`);
