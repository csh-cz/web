#!/usr/bin/env node
/**
 * Bulk-doplnění výchozí fotografické atribuce do frontmatteru článků.
 *
 * Vstup: tmp/photo-credits-audit.json (vygeneruje `scripts/audit-photo-credits.mjs`).
 *
 * Strategie:
 *   - Pro článek BEZ vlastních per-image credit overlay (Photo komponenta /
 *     ::photo direktiv) doplníme frontmatter pole `imageCredit:` s default
 *     atribucí, kterou render pipeline použije jako fallback caption pod
 *     markdown `![]()` obrázky bez explicitního creditu.
 *   - Heuristika výchozího kreditu:
 *       1. `author: "Petr Král"` + originalUrl hodinarium.eu →
 *          credit: "Archiv Petra Krále (hodinarium.eu)"
 *       2. `author: "Český spolek horologický"` → "Archiv ČSH"
 *       3. `author: ""` + originalUrl hodinarium.eu → "Archiv Petra Krále (hodinarium.eu)"
 *          (P. Král byl autor původního webu hodinarium.eu, jeho sbírka)
 *       4. content/kronika/* → "Archiv ČSH"
 *       5. konkrétní autor (David Knespl, JIndřiška Bumerlová atd.) → použít autor
 *       6. ostatní → "autor neznámý" + editor note s žádostí o doplnění
 *
 * Idempotence:
 *   - Skript NEpřepíše existující `imageCredit:` pole (ručně doplněný credit
 *     respektuje).
 *   - Skript NEpřepíše per-image `<Photo ... credit=>` / `::photo{credit=}` výskyty.
 *   - Skript NEpřepíše body článku (žádná konverze `![]()` → `::photo`).
 *
 * Bezpečnost:
 *   - Frontmatter parser respektuje stávající ordering polí (vloží
 *     `imageCredit:` před `originalUrl:` nebo na konec, podle toho co dřív).
 *   - YAML quotování stringů s diakritikou přes uvozovky.
 *
 * Pozn.: `imageCredit:` pole je momentálně AUDIT-LEVEL marker. Pro skutečný
 * render captionu pod obrázkem je potřeba rozšířit rehype-picture nebo
 * Photo komponentu (mimo scope tohoto skriptu, viz docs/TODO.md A.25).
 * Audit `scripts/audit-photo-credits.mjs` ho už nyní akceptuje (regex
 * `^(credit|autor|fotograf|zdrojFoto|imageCredit|foto):` ve frontmatteru).
 *
 * Run:
 *   node scripts/add-photo-credits.mjs                # apply
 *   node scripts/add-photo-credits.mjs --dry          # only print plan
 *   node scripts/add-photo-credits.mjs --files X,Y    # subset
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..');
const DRY = process.argv.includes('--dry');
const filesArg = process.argv.find((a) => a.startsWith('--files='));
const filesFilter = filesArg ? filesArg.slice('--files='.length).split(',') : null;

function loadAudit() {
  const auditPath = join(ROOT, 'tmp', 'photo-credits-audit.json');
  return JSON.parse(readFileSync(auditPath, 'utf8'));
}

function extractFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return null;
  return { raw: m[0], body: m[1], end: m[0].length };
}

function getYamlField(yaml, key) {
  // Plain top-level key: regex pro `key: value` nebo `key:` na začátku řádku.
  // Hodnota je trimovaný zbytek do konce řádku, bez okolních uvozovek.
  const re = new RegExp(`^${key}:\\s*(.*)$`, 'm');
  const m = yaml.match(re);
  if (!m) return null;
  let v = m[1].trim();
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
  else if (v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1);
  return v;
}

function hasYamlField(yaml, key) {
  return new RegExp(`^${key}:`, 'm').test(yaml);
}

/**
 * Rozhodnutí default kreditu podle metadat článku.
 * Vrací { credit, needsReview, reason } — credit je YAML string (bez uvozovek),
 * needsReview = true pokud heuristika spoléhá na fallback a měla by se
 * ručně ověřit (otevře editor note).
 */
function decideCredit({ relPath, author, originalUrl }) {
  const isKronika = relPath.startsWith('content/kronika/');
  const fromHodinarium = (originalUrl ?? '').includes('hodinarium.eu');
  const fromHodinariumEuPages = (originalUrl ?? '').includes('hodinarium-eu.pages.dev');
  const a = (author ?? '').trim();

  if (isKronika) {
    return {
      credit: 'Archiv ČSH (Český spolek horologický)',
      needsReview: false,
      reason: 'kronika → ČSH archiv',
    };
  }
  if (a === 'Petr Král') {
    return {
      credit: 'Archiv Petra Krále (hodinarium.eu)',
      needsReview: false,
      reason: 'author Petr Král + hodinarium.eu',
    };
  }
  if (a === 'Český spolek horologický') {
    return {
      credit: 'Archiv ČSH (Český spolek horologický)',
      needsReview: false,
      reason: 'author ČSH',
    };
  }
  if (a === 'David Knespl') {
    return {
      credit: 'David Knespl',
      needsReview: false,
      reason: 'author David Knespl',
    };
  }
  if (a && a !== '' && a !== "''") {
    // Konkrétní jiný autor (Bumerlová atd.) → použít jejich jméno jako default
    return {
      credit: a,
      needsReview: false,
      reason: `author ${a}`,
    };
  }
  if (fromHodinarium) {
    // Bez frontmatter author, ale legacy hodinarium.eu článek → P. Král byl
    // autor původního webu hodinarium.eu, fotky jsou téměř jistě z jeho sbírky
    return {
      credit: 'Archiv Petra Krále (hodinarium.eu)',
      needsReview: false,
      reason: 'legacy hodinarium.eu článek, P. Král default',
    };
  }
  if (fromHodinariumEuPages) {
    return {
      credit: 'Archiv ČSH (Český spolek horologický)',
      needsReview: false,
      reason: 'hodinarium-eu.pages.dev → ČSH spolkový obsah',
    };
  }
  return {
    credit: 'autor neznámý — Archiv ČSH',
    needsReview: true,
    reason: 'fallback: neidentifikovaný zdroj',
  };
}

/**
 * Vloží `imageCredit: "..."` do frontmatter YAML.
 * Strategie umístění:
 *   - před prvním z polí ['originalUrl', 'lastModified', 'scrapedAt'] (legacy auto-pole na konci)
 *   - jinak na konec
 * Idempotence: pokud `imageCredit:` už existuje, vrací null (no-op).
 */
function injectImageCredit(yamlBody, credit) {
  if (hasYamlField(yamlBody, 'imageCredit')) return null;
  // Escape uvozovek v credit hodnotě
  const escaped = credit.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const line = `imageCredit: "${escaped}"`;

  const lines = yamlBody.split('\n');
  // Najdi index první z anchor polí
  const ANCHORS = ['originalUrl', 'lastModified', 'scrapedAt', 'sourceCharset'];
  let insertIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trimStart();
    for (const a of ANCHORS) {
      if (trimmed.startsWith(`${a}:`)) {
        insertIdx = i;
        break;
      }
    }
    if (insertIdx >= 0) break;
  }
  if (insertIdx >= 0) {
    lines.splice(insertIdx, 0, line);
  } else {
    lines.push(line);
  }
  return lines.join('\n');
}

/**
 * Přidat editor note pro manuální review. Pokud editorNotes blok neexistuje,
 * založit nový.
 * Idempotence: pokud nota se stejným noteKey už existuje, no-op.
 */
function ensureEditorNote(yamlBody, noteKey, title, text) {
  const re = new RegExp(`noteKey:\\s*["']?${noteKey}["']?`);
  if (re.test(yamlBody)) return null; // already present

  // Najdi blok `editorNotes:` (případně doplnit nový na konec FM)
  const lines = yamlBody.split('\n');
  let enIdx = lines.findIndex((l) => /^editorNotes:\s*$/.test(l) || /^editorNotes:\s*\[\]/.test(l));
  const noteBlock = [
    `  - title: "${title}"`,
    `    noteKey: "${noteKey}"`,
    `    text: "${text.replace(/"/g, '\\"')}"`,
  ];
  if (enIdx >= 0) {
    // Pokud `editorNotes: []` nahradit na sekvenci
    if (/editorNotes:\s*\[\]/.test(lines[enIdx])) {
      lines[enIdx] = 'editorNotes:';
    }
    // Vlož noteBlock hned za editorNotes řádek (před případnými dalšími poli)
    // Najdi konec stávajícího editorNotes seznamu — řádek, který nezačíná
    // alespoň dvěma mezerami (nebo `-`).
    let endIdx = enIdx + 1;
    while (endIdx < lines.length && (lines[endIdx].startsWith('  ') || lines[endIdx] === '')) {
      endIdx++;
    }
    lines.splice(endIdx, 0, ...noteBlock);
  } else {
    // Nový editorNotes blok na konec FM
    lines.push('editorNotes:');
    lines.push(...noteBlock);
  }
  return lines.join('\n');
}

function processFile(relPath, dry) {
  const abs = join(ROOT, relPath);
  let text;
  try { text = readFileSync(abs, 'utf8'); }
  catch (e) {
    return { relPath, skipped: true, reason: 'read fail: ' + e.message };
  }
  const fm = extractFrontmatter(text);
  if (!fm) return { relPath, skipped: true, reason: 'no frontmatter' };

  const author = getYamlField(fm.body, 'author');
  const originalUrl = getYamlField(fm.body, 'originalUrl');
  const decision = decideCredit({ relPath, author, originalUrl });

  // Pokud `imageCredit:` už existuje → idempotent, no-op
  if (hasYamlField(fm.body, 'imageCredit')) {
    return { relPath, skipped: true, reason: 'imageCredit already set' };
  }

  let newBody = injectImageCredit(fm.body, decision.credit);
  if (!newBody) return { relPath, skipped: true, reason: 'inject no-op' };

  // Pokud heuristika je nejistá, doplnit editor note
  if (decision.needsReview) {
    const updated = ensureEditorNote(
      newBody,
      'photo-credits-needs-review',
      'Foto kredity — ověřit autora',
      `Default 'autor neznámý — Archiv ČSH' aplikován automatem. Ověřit původ fotografií a doplnit konkrétního autora pokud je znám.`
    );
    if (updated) newBody = updated;
  }

  const newText = `---\n${newBody}\n---\n` + text.slice(fm.end);
  if (!dry) writeFileSync(abs, newText, 'utf8');
  return {
    relPath,
    patched: true,
    credit: decision.credit,
    reason: decision.reason,
    needsReview: decision.needsReview,
  };
}

function main() {
  const audit = loadAudit();
  const files = (filesFilter
    ? audit.findings.filter((f) => filesFilter.includes(f.file))
    : audit.findings).map((f) => f.file);

  console.log(`\n=== Add photo credits ===`);
  console.log(`Mode: ${DRY ? 'DRY (no writes)' : 'APPLY'}`);
  console.log(`Files to process: ${files.length}\n`);

  const results = [];
  for (const f of files) {
    results.push(processFile(f, DRY));
  }

  const patched = results.filter((r) => r.patched);
  const skipped = results.filter((r) => r.skipped);
  const needsReview = patched.filter((r) => r.needsReview);

  console.log(`\nPatched: ${patched.length}`);
  console.log(`Skipped: ${skipped.length}`);
  console.log(`Needs manual review: ${needsReview.length}\n`);

  // Breakdown by credit source
  const byCredit = {};
  for (const r of patched) {
    byCredit[r.credit] = (byCredit[r.credit] ?? 0) + 1;
  }
  console.log(`Credit distribution:`);
  for (const [c, n] of Object.entries(byCredit).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${n.toString().padStart(3)}  ${c}`);
  }

  if (needsReview.length) {
    console.log(`\nFiles needing manual review (editorNotes added):`);
    for (const r of needsReview.slice(0, 30)) {
      console.log(`  - ${r.relPath}`);
    }
    if (needsReview.length > 30) console.log(`  … +${needsReview.length - 30} more`);
  }
}

main();
