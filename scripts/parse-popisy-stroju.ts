/**
 * Parser Popisy strojů.doc → /tmp/Popisy strojů.txt (přes soffice).
 *
 * Format dokumentu (zjištěné experimentálně):
 *   N            ← line s pouhým 1-3 číslem = section marker
 *   <Title>      ← další line = title strojek
 *   <body>       ← lines až do dalšího section marker
 *
 * Number N je interní pořadové číslo strojek v dokumentu (NE inv. č. ze
 * Soupisu — pro matching karet je třeba fuzzy match titulu na popis
 * z XLS).
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
const DOC_PATH = join(ROOT, 'zdroje', 'katalog exponátů', 'Popisy strojů.doc');
const TMP_TXT = '/tmp/Popisy strojů.txt';
const OUT_PATH = join(ROOT, 'tmp', 'popisy-stroju-parsed.json');

interface Stroj {
  docPosition: number;   // číslo z markeru (N)
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
  while (i < lines.length) {
    const line = lines[i];
    // Section marker: jen číslo na samostatné řádce
    const numMatch = line.match(/^(\d{1,3})$/);
    if (!numMatch) { i++; continue; }

    const docPosition = parseInt(numMatch[1], 10);
    // Next non-empty line = title
    let j = i + 1;
    while (j < lines.length && !lines[j]) j++;
    if (j >= lines.length) break;
    const title = lines[j];
    j++;

    // Body lines until next number-only line (or EOF)
    const bodyParagraphs: string[] = [];
    while (j < lines.length) {
      const l = lines[j];
      if (/^\d{1,3}$/.test(l)) break;  // další section marker
      if (l) bodyParagraphs.push(l);
      j++;
    }

    stroje.push({
      docPosition,
      title,
      body: bodyParagraphs.join('\n\n'),
      bodyParagraphs,
    });

    i = j;
  }

  await mkdir(join(ROOT, 'tmp'), { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(stroje, null, 2), 'utf-8');

  console.log('=== Popisy strojů — parser (.doc) ===');
  console.log(`Stroje extracted:  ${stroje.length}`);
  console.log(`Avg body paras:    ${(stroje.reduce((s, e) => s + e.bodyParagraphs.length, 0) / stroje.length).toFixed(1)}`);
  console.log(`Output:            ${OUT_PATH}`);
  console.log();
  console.log('All titles:');
  for (const s of stroje) {
    console.log(`  [doc#${s.docPosition}] ${s.title} (${s.bodyParagraphs.length} para)`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
