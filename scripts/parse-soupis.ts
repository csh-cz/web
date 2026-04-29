/**
 * Parser Soupisu exponátů (interní xls Davidova spolku) → JSON katalog.
 *
 * Vstup: zdroje/katalog exponátů/Soupis exponátů můj .xls
 *        konverze přes soffice --headless --convert-to csv (pre-step)
 * Výstup: apps/hodinarium-eu/src/data/soupis-exponatu.json
 *
 * Strukturuje:
 *   - každý exponát s inv.č., popisem, výrobcem, lokací (panel/vitrína/sál)
 *   - section tracking — sleduje aktuální Vitrínu / Panel / Místnost
 *
 * Run: pnpm soupis:parse
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const XLS_PATH = join(ROOT, 'zdroje', 'katalog exponátů', 'Soupis exponátů můj .xls');
const TMP_CSV = '/tmp/soupis-parsed.csv';
const OUT_PATH = join(ROOT, 'apps', 'hodinarium-eu', 'src', 'data', 'soupis-exponatu.json');

interface Exponat {
  invCislo: string;     // "1", "2", … nebo "x1", "x2" pro položky bez inv. v xls
  invCisloNumeric: number | null;  // pro řazení (null pro x-prefix)
  popis: string;
  typ: string;
  vyrobce: string;
  rok: string;
  majitel: string;
  stav: string;
  vztah: string;
  poznamka: string;
  lokace: string;       // "hlavni-sal" | "panel-1" | "vitrina-1-room1" | …
  lokaceHuman: string;  // "Hlavní sál" | "Panel 1" | "Vitrína 1 (hlavní sál)" | …
  sekceCislo: number | null;  // local number within section (1, 2, …)
  mistnost: string;     // "hlavni" | "vedlejsi"
}

interface Section {
  jmeno: string;       // "Hlavní sál" | "Vitrína 1" | "Panel 1"
  lokaceTag: string;   // tag-friendly slug
  mistnost: string;
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else { cell += c; }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { cur.push(cell); cell = ''; }
      else if (c === '\n') { cur.push(cell); rows.push(cur); cur = []; cell = ''; }
      else if (c === '\r') {} // ignore
      else cell += c;
    }
  }
  if (cell || cur.length) { cur.push(cell); rows.push(cur); }
  return rows;
}

function classifySection(label: string, mistnost: string): { tag: string; jmeno: string } {
  const l = label.toLowerCase();
  if (l.startsWith('hlavní')) return { tag: 'hlavni-sal', jmeno: 'Hlavní sál' };
  if (l.startsWith('panel')) {
    const m = label.match(/panel\s*(\d+)/i);
    return { tag: m ? `panel-${m[1]}` : 'panel', jmeno: label };
  }
  if (l.includes('rohová')) {
    return { tag: `rohova-vitrina-${mistnost}`, jmeno: `Rohová vitrína (${mistnost === 'hlavni' ? 'hlavní' : 'vedlejší'} místnost)` };
  }
  if (l.startsWith('vitrína')) {
    const m = label.match(/vitrína\s*(\d+)/i);
    const n = m?.[1] ?? '';
    return {
      tag: `vitrina-${n}-${mistnost}`,
      jmeno: `Vitrína ${n} (${mistnost === 'hlavni' ? 'hlavní' : 'vedlejší'} místnost)`,
    };
  }
  return { tag: `lokace-${l.replace(/\s+/g, '-')}`, jmeno: label };
}

async function main() {
  // Convert XLS → CSV
  execSync(`soffice --headless --convert-to csv --outdir /tmp "${XLS_PATH}" && mv "/tmp/Soupis exponátů můj .csv" ${TMP_CSV}`, { stdio: 'pipe' });
  const text = await readFile(TMP_CSV, 'utf-8');
  const rows = parseCSV(text);

  const exponaty: Exponat[] = [];
  let currentSection: Section = { jmeno: 'Hlavní sál', lokaceTag: 'hlavni-sal', mistnost: 'hlavni' };
  let currentMistnost = 'hlavni';
  let seenFirstVitrina = false;
  let lastSectionRow = 0;
  let xCounter = 0;  // průběžné číslování pro položky bez inv. č. v XLS

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (r.every((c) => !c.trim())) continue;

    // Section header detection — najdi nějaký buňku se "Vitrína" / "Panel" / "Hlavní"
    const sectionCell = r.find((c) => /^(Vitrína|Panel|Hlavní|Rohová|Místnost)/i.test(c.trim()));
    if (sectionCell) {
      const trimmed = sectionCell.trim();
      // Detekce přechodu do druhé místnosti — opakovaná "Vitrína 1" znamená novou místnost
      if (/^Vitrína\s*1\b/i.test(trimmed)) {
        if (seenFirstVitrina) currentMistnost = 'vedlejsi';
        seenFirstVitrina = true;
      }
      const { tag, jmeno } = classifySection(trimmed, currentMistnost);
      currentSection = { jmeno, lokaceTag: tag, mistnost: currentMistnost };
      lastSectionRow = i;
      continue;
    }

    // Heading row "Smlouva, Číslo, Popis, ..." — pomineme
    if (r.some((c) => c.trim() === 'Smlouva' || c.trim() === 'Číslo')) continue;

    // Datová řádka — sloupce dle CSV inspekce:
    //   col 1: Smlouva (ano|prázdné)
    //   col 2: lokální číslo v sekci
    //   col 3: rok přírůstku
    //   col 4: Popis
    //   col 5: Typ
    //   col 6: Majitel
    //   col 7: Stav
    //   col 8: Vztah
    //   col 9: Cena
    //   col 10: Odhad
    //   col 11: Poznámka
    //   col 12: GLOBÁLNÍ inv. č.
    const sekceCislo = parseInt(r[2] ?? '', 10);
    const rok = (r[3] ?? '').trim();
    const popis = (r[4] ?? '').trim();
    const typ = (r[5] ?? '').trim();
    const majitel = (r[6] ?? '').trim();
    const stav = (r[7] ?? '').trim();
    const vztah = (r[8] ?? '').trim();
    const poznamka = (r[11] ?? '').trim();
    const invStr = (r[12] ?? '').trim();
    const invCisloN = parseInt(invStr, 10);

    if (!popis) continue;

    let invCislo: string;
    let invCisloNumeric: number | null;
    if (isFinite(invCisloN)) {
      invCislo = String(invCisloN);
      invCisloNumeric = invCisloN;
    } else {
      // Položka bez inv. č. v XLS — průběžné x-číslování
      xCounter++;
      invCislo = `x${xCounter}`;
      invCisloNumeric = null;
    }

    exponaty.push({
      invCislo,
      invCisloNumeric,
      popis,
      typ,
      vyrobce: '',  // XLS nemá explicit "výrobce" — z popisu lze někdy parsnout, prozatím prázdné
      rok,
      majitel,
      stav,
      vztah,
      poznamka,
      lokace: currentSection.lokaceTag,
      lokaceHuman: currentSection.jmeno,
      sekceCislo: isFinite(sekceCislo) ? sekceCislo : null,
      mistnost: currentSection.mistnost,
    });
  }

  // Sort: nejdřív numerické inv. č. vzestupně, pak x-prefix items
  exponaty.sort((a, b) => {
    if (a.invCisloNumeric !== null && b.invCisloNumeric !== null) return a.invCisloNumeric - b.invCisloNumeric;
    if (a.invCisloNumeric !== null) return -1;
    if (b.invCisloNumeric !== null) return 1;
    return a.invCislo.localeCompare(b.invCislo);
  });

  await writeFile(OUT_PATH, JSON.stringify(exponaty, null, 2), 'utf-8');

  // Report
  const byLokace: Record<string, number> = {};
  for (const e of exponaty) byLokace[e.lokaceHuman] = (byLokace[e.lokaceHuman] ?? 0) + 1;
  const xItems = exponaty.filter((e) => e.invCisloNumeric === null);
  const numItems = exponaty.filter((e) => e.invCisloNumeric !== null);
  console.log('=== Parser Soupisu exponátů ===');
  console.log(`Celkem exponátů:        ${exponaty.length}`);
  console.log(`S inv. č. v XLS:        ${numItems.length} (max ${numItems[numItems.length - 1]?.invCislo})`);
  console.log(`Bez inv. č. (x-prefix): ${xItems.length}`);
  console.log('Per lokace:');
  for (const [l, n] of Object.entries(byLokace).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${l.padEnd(40)} ${n}`);
  }
  console.log(`\nVýstup: ${OUT_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
