#!/usr/bin/env node
/**
 * Auto-link první zmínky vybraných slovníkových hesel v MD/MDX těle
 * článku na příslušnou kartu /slovnik/<slug>.
 *
 * Paralelní pattern s `auto-link-kroky.mjs`, ale s:
 *   - Hardcoded **whitelist** hesel (ne všech 35 — některé by spamovaly
 *     nebo kolidovaly s kroky:auto-link, viz SLOVNIK_BLACKLIST níže)
 *   - **Kroky:auto-link priorita** — pokud line obsahuje `/kroky/` link,
 *     na témže řádku slovnik nelinkuje (vyhne se duplikaci u "kotvový krok"
 *     nebo "Grahamovým krokem")
 *   - Per-slug + per-file limit: jen první výskyt
 *
 * Použití:
 *   node scripts/auto-link-slovnik.mjs --dry-run    # report bez změn
 *   node scripts/auto-link-slovnik.mjs              # apply
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..');
const DRY_RUN = process.argv.includes('--dry-run');

/**
 * Whitelist hesel, která auto-linkujeme. Vybráno tak, aby:
 *  1. Termín měl jednoznačný hodinářský význam (nemůže matchnut nejmenší
 *     předlohu — např. „pero" by matchlo „pero v ruce", proto vyloučeno)
 *  2. Termín se nepřekrývá s `auto-link-kroky` aliasy (krok, kotva, paleta,
 *     krokové kolo — všechny ve `kroky.ts`, drží je auto-link-kroky)
 *  3. Termín má dostatečný „karta value" pro čtenáře (rozšířený výklad
 *     se etymologií, primárními prameny — je důvod tam kliknout)
 *
 * Klíč = slug v content/slovnik/. Hodnoty = aliasy (case-sensitive,
 * word-boundary). První výskyt v souboru se zlinkuje.
 */
const SLOVNIK_AUTO_LINK = {
  // Mechanika času (nekrokové) — termíny, které se vyskytují napříč
  // články o hodinách obecně:
  'kyvadlo': ['kyvadlo', 'kyvadla', 'kyvadlu', 'kyvadlem', 'kyvadlové'],
  'setrvacka': ['setrvačka', 'setrvačky', 'setrvačku', 'setrvačkou', 'setrvačkové'],
  'vlasek': ['vlásek', 'vlásku', 'vláskem', 'vláskové', 'vlásky'],
  'soukoli': ['soukolí', 'soukolím'],
  'perovnik': ['perovník', 'perovníku', 'perovníky', 'perovníkem'],
  'snek': ['šnek', 'šneku', 'šnekem', 'šnekový závitek', 'šnekový'],
  'chronometr': ['chronometr', 'chronometru', 'chronometry', 'chronometrem',
                 'chronometrický', 'chronometrový krok'],
  'lihyr': ['lihýř', 'lihýře', 'lihýřem', 'lihýřový', 'foliot'],
  'regulator': ['regulátor', 'regulátoru', 'regulátorem', 'regulátory',
                'regulátorové'],

  // Bicí mechanismy — specifické názvy, dobré vzdělávací linky:
  'bici-stroj': ['bicí stroj', 'bicím strojem', 'bicího stroje',
                 'bicí soukolí'],
  'cymbal': ['cymbál', 'cymbály', 'cymbálu', 'cymbálem'],
  'kladivko': ['kladívko', 'kladívka', 'kladívkem', 'kladívek'],
  'pocetnik': ['početník', 'početníku', 'početníkem'],
  'srdcovka': ['srdcovka', 'srdcovky', 'srdcovkou'],
  'vetrnik': ['větrník', 'větrníku', 'větrníkem', 'větrníky'],

  // Sluneční / astronomické:
  'slunecni-hodiny': ['sluneční hodiny', 'slunečních hodin',
                      'slunečními hodinami', 'sluneční hodinky'],
  'gnomon': ['gnómon', 'gnómonu', 'gnómony', 'gnómonem'],
  'casova-rovnice': ['časová rovnice', 'časové rovnice', 'rovnice času',
                     'aequace času'],
  'kvadrant': ['kvadrant', 'kvadrantu', 'kvadranty', 'kvadrantem'],

  // Materiály a vlastnosti:
  'isochronismus': ['isochronismus', 'isochronní', 'isochronický',
                    'isochronnost'],
  'kompenzace-teplotni': ['teplotní kompenzace', 'teplotní kompensace',
                          'kompenzační kyvadlo', 'kompensační kyvadlo'],
  'invar': ['invar', 'invaru', 'invarem'],
  'rubinovy-kamen': ['rubínový kámen', 'rubínový ložisko', 'rubínových kamenů',
                     'rubínovým kamenem'],
  'vlaskova-krivka': ['vlásková křivka', 'Breguetův vlásek', 'Breguetova spirála',
                      'Phillipsova křivka', 'terminální křivka'],
};

/**
 * Hesla VYNECHANÁ (vědomě nelinkujeme):
 *  - krok, kotva, paleta, krokové kolo, pero/tažné péro, závaží, posůvka,
 *    stupnice, spoušť, raménko
 *  - Důvody: kolize s auto-link-kroky (krok, kotva, paleta, kolo) nebo
 *    příliš obecné slovo (pero, závaží — vyskytují se v cizích kontextech,
 *    riziko false-positive)
 */

// Soubory ke kontrole
const dirs = ['content/hodinarium-eu', 'content/hodinari',
              'content/soupis-veznich-hodin', 'content/kronika',
              'content/kroky'];
const files = [];
for (const d of dirs) {
  const full = join(ROOT, d);
  try {
    for (const f of readdirSync(full)) {
      if (/\.(md|mdx)$/.test(f)) files.push(join(full, f));
    }
  } catch { /* missing dir */ }
}
console.log(`Soubory ke kontrole: ${files.length}`);
console.log(`Slovníkových hesel: ${Object.keys(SLOVNIK_AUTO_LINK).length}`);
console.log(`Aliasů celkem: ${Object.values(SLOVNIK_AUTO_LINK).flat().length}\n`);

// Heuristika: oddělit frontmatter (pokud je) od body
function splitFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { fm: '', body: text };
  return { fm: m[0], body: text.slice(m[0].length) };
}

// Kontrola, zda pozice není v linku, code blocku, nadpisu.
function isInProtectedContext(body, idx) {
  const around = body.slice(Math.max(0, idx - 200), idx + 200);
  const pos = idx - Math.max(0, idx - 200);
  // Inside markdown link `(...)` part
  const beforeOpenParen = around.lastIndexOf('](', pos);
  const beforeCloseParen = around.lastIndexOf(')', pos);
  if (beforeOpenParen > beforeCloseParen) return true;
  // Inside link text [...]
  const beforeOpenBracket = around.lastIndexOf('[', pos);
  const beforeCloseBracket = around.lastIndexOf(']', pos);
  const afterCloseBracket = around.indexOf(']', pos);
  if (beforeOpenBracket > beforeCloseBracket && afterCloseBracket > pos) return true;
  // Inside code block ``` or inline `code`
  const beforeText = body.slice(0, idx);
  const blockOpens = (beforeText.match(/```/g) || []).length;
  if (blockOpens % 2 === 1) return true;
  const singleBackticks = (beforeText.match(/(?<!`)`(?!`)/g) || []).length;
  if (singleBackticks % 2 === 1) return true;
  // Heading
  const lineStart = body.lastIndexOf('\n', idx) + 1;
  const lineSlice = body.slice(lineStart, idx);
  if (/^#{1,6}\s/.test(lineSlice)) return true;
  return false;
}

// Build prioritized alias list — delší aliasy první (víceslovní fráze
// před jednotlivými slovy).
const aliases = [];
for (const [slug, aliasList] of Object.entries(SLOVNIK_AUTO_LINK)) {
  for (const alias of aliasList) {
    aliases.push({ slug, alias, len: alias.length });
  }
}
aliases.sort((a, b) => b.len - a.len);

// Apply per-file
let totalLinks = 0;
let filesModified = 0;
const report = [];

for (const file of files) {
  const orig = readFileSync(file, 'utf8');
  const { fm, body } = splitFrontmatter(orig);
  let workBody = body;
  const linkedSlugs = new Set();

  for (const { slug, alias } of aliases) {
    if (linkedSlugs.has(slug)) continue;
    const escapedAlias = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(?<![\\p{L}\\p{N}_])${escapedAlias}(?![\\p{L}\\p{N}_])`, 'u');
    const m = re.exec(workBody);
    if (!m) continue;
    const idx = m.index;
    if (isInProtectedContext(workBody, idx)) continue;

    // Kroky priorita: pokud na témže řádku už je `/kroky/` link, slovnik
    // nelinkuje (vyhne se duplikaci typu "[kotvový krok](/kroky/kotvovy-krok)
    // s [kotvou](/slovnik/kotva)" — kotva nelinkujeme stejně, ale obecný
    // princip drží i u jiných hesel).
    const lineStart = workBody.lastIndexOf('\n', idx) + 1;
    const lineEnd = workBody.indexOf('\n', idx);
    const line = workBody.slice(lineStart, lineEnd === -1 ? workBody.length : lineEnd);
    if (line.includes('/kroky/')) continue;

    // Zabal do markdown linku. 3 případy stejné jako u kroky:
    //  (1) **alias** tight bold → [alias](url) zachová bold okolo
    //  (2) Inside existing bold range → plain [alias](url) (bez wrapu)
    //  (3) Plain text → **[alias](url)** přidá bold
    const before = workBody.slice(Math.max(0, idx - 2), idx);
    const after = workBody.slice(idx + alias.length, idx + alias.length + 2);
    const beforeText = workBody.slice(0, idx);
    const boldsBeforeIdx = (beforeText.match(/\*\*/g) || []).length;
    const insideExistingBold = boldsBeforeIdx % 2 === 1;
    let replacement;
    if (before === '**' && after === '**') {
      replacement = `[${alias}](/slovnik/${slug})`;
    } else if (insideExistingBold) {
      replacement = `[${alias}](/slovnik/${slug})`;
    } else {
      replacement = `[${alias}](/slovnik/${slug})`;
      // Pozn: u kroky:auto-link se bold přidává (`**[alias](url)**`), ale
      // pro slovnik to bylo by moc — slovník je doplňující info, ne
      // hlavní důraz článku. Plain link.
    }
    workBody = workBody.slice(0, idx) + replacement + workBody.slice(idx + alias.length);
    linkedSlugs.add(slug);
    totalLinks++;
    const lineNumber = body.slice(0, idx).split('\n').length;
    report.push({ file: file.replace(`${ROOT}/`, ''), line: lineNumber, slug, alias });
  }

  if (workBody !== body) {
    filesModified++;
    if (!DRY_RUN) {
      writeFileSync(file, fm + workBody, 'utf8');
    }
  }
}

console.log(`\n=== Výsledek ${DRY_RUN ? '(DRY RUN)' : '(APPLIED)'} ===`);
console.log(`Souborů upraveno: ${filesModified}`);
console.log(`Linků přidáno:    ${totalLinks}\n`);

// Per-slug rozpis
const bySlug = {};
for (const r of report) {
  bySlug[r.slug] = (bySlug[r.slug] || 0) + 1;
}
for (const [slug, n] of Object.entries(bySlug).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${slug.padEnd(28)} ${n}`);
}

if (process.argv.includes('-v') || DRY_RUN) {
  console.log('\nDetail:');
  for (const r of report.slice(0, 80)) {
    console.log(`  ${r.file}:${r.line}  →  /slovnik/${r.slug}  ("${r.alias}")`);
  }
  if (report.length > 80) console.log(`  ... +${report.length - 80} dalších`);
}

if (DRY_RUN) {
  console.log('\nDry run — žádné změny zapsány. Run bez --dry-run pro apply.');
}
