/**
 * Parser Popisy strojů 2.docx → /tmp/Popisy strojů 2.txt (přes soffice).
 *
 * Format dokumentu (Popisy strojů 2.docx, 2026-05-01):
 *   <inv-cislo>  ← line s číslem (právým tabulátorem) = inv. č. ze Soupisu 3
 *   <Title>      ← další line = title strojek
 *   <body>       ← lines až do dalšího section marker
 *
 * Důležité: číslo na začátku každého bloku JE přímo inv. č. ze Soupisu 3.xls
 * (od 2026-05-01 user přečísloval položky tak, aby Popisy 2 = Soupis 3).
 * Mapping je tedy deterministický 1:1, NE fuzzy.
 *
 * Output: tmp/popisy-stroju-parsed.json
 *
 * Run: pnpm popisy:parse
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const DOC_PATH = join(ROOT, 'zdroje', 'katalog exponátů', 'Popisy strojů 2.docx');
const TMP_TXT = '/tmp/Popisy strojů 2.txt';
const OUT_PATH = join(ROOT, 'tmp', 'popisy-stroju-parsed.json');

interface Stroj {
  invCislo: number;      // inv. č. ze Soupisu (přímo z markeru v dokumentu)
  docOrder: number;      // pořadí výskytu v dokumentu (pro debug)
  title: string;
  body: string;          // celý text body (joined paragraphs)
  bodyParagraphs: string[];
}

async function main() {
  // Ensure fresh conversion z .doc
  try {
    execSync(`soffice --headless --convert-to txt --outdir /tmp "${DOC_PATH}"`, { stdio: 'pipe' });
  } catch (e) {
    console.error('soffice conversion failed; používám existující /tmp/Popisy strojů.txt');
  }

  const txt = await readFile(TMP_TXT, 'utf-8');
  const lines = txt.split('\n').map((l) => l.replace(/ /g, ' ').trim());

  const stroje: Stroj[] = [];
  let i = 0;
  let docOrder = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Section marker: jen číslo na samostatné řádce
    const numMatch = line.match(/^(\d{1,3})$/);
    if (!numMatch) { i++; continue; }

    const invCislo = parseInt(numMatch[1], 10);
    // Next non-empty line = title
    let j = i + 1;
    while (j < lines.length && !lines[j]) j++;
    if (j >= lines.length) break;
    const title = lines[j];
    j++;

    // Body lines until další section marker:
    //   - "NN" (čistě inv. č. — další stroj)
    //   - "NN/B", "NN/3B" apod. (sekce panelu/místnosti) — body končí, ale
    //     nezačíná nový stroj; následuje samostatný popis komponenty bez inv. č.
    const bodyParagraphs: string[] = [];
    while (j < lines.length) {
      const l = lines[j];
      if (/^\d{1,3}$/.test(l)) break;  // další stroj
      if (/^\d{1,3}\s*\/[0-9]?[A-Z]$/.test(l)) break;  // sekční marker (4/B, 25/B, 35/3B)
      if (l) bodyParagraphs.push(l);
      j++;
    }

    docOrder++;
    stroje.push({
      invCislo,
      docOrder,
      title,
      body: bodyParagraphs.join('\n\n'),
      bodyParagraphs,
    });

    i = j;
  }

  await mkdir(join(ROOT, 'tmp'), { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(stroje, null, 2), 'utf-8');

  // Detekce duplicit inv. č. (nemělo by se stávat, ale pro jistotu)
  const seen = new Map<number, number>();
  const duplicates: number[] = [];
  for (const s of stroje) {
    const prev = seen.get(s.invCislo);
    if (prev) duplicates.push(s.invCislo);
    else seen.set(s.invCislo, s.docOrder);
  }

  console.log('=== Popisy strojů 2 — parser (.docx) ===');
  console.log(`Stroje extracted:  ${stroje.length}`);
  console.log(`Unique inv. č.:    ${seen.size}`);
  if (duplicates.length) console.log(`!! DUPLICITY inv.: ${duplicates.join(', ')}`);
  console.log(`Avg body paras:    ${(stroje.reduce((s, e) => s + e.bodyParagraphs.length, 0) / stroje.length).toFixed(1)}`);
  console.log(`Output:            ${OUT_PATH}`);
  console.log();
  console.log('All titles (sorted by inv. č.):');
  const sorted = [...stroje].sort((a, b) => a.invCislo - b.invCislo);
  for (const s of sorted) {
    console.log(`  inv. ${String(s.invCislo).padStart(3)} [doc#${s.docOrder}] ${s.title} (${s.bodyParagraphs.length} para)`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
