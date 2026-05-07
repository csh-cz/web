#!/usr/bin/env node
/**
 * Audit fotografických atribucí v MD/MDX obsahu.
 *
 * Pravidlo (z user feedback memory): „Vždy uvádět autora foto + licenci/copyright.
 * Pokud neznámé, nepublikovat nebo explicitně označit 'zdroj neznámý'."
 *
 * Skript:
 *   - Najde všechny `![alt](/img/...)` (Markdown image) a `<Photo src="...">` (Astro)
 *   - Pro každý obrázek zkontroluje, zda v okolí ±150 znaků (nebo ve frontmatteru)
 *     existuje credit keyword: foto, zdroj, autor, credit, ©, CC BY, CC-BY,
 *     veřejné domény, public domain, Wikimedia, Photo by, „Použito se svolením".
 *   - Skip pro Photo komponentu s atributem `credit=` nebo `autor=`.
 *
 * Output: JSON do tmp/photo-credits-audit.json + Markdown do tmp/photo-credits-audit.md.
 *         Exit code 0 vždy (audit, ne gate).
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..');

const SCAN_DIRS = [
  'content/hodinari',
  'content/hodinarium-eu',
  'content/horologie-cz',
  'content/kronika',
];

const CREDIT_RE = /(foto|zdroj|autor|credit|©|CC\s*BY|CC-BY|public\s*domain|veřejné\s*domény|veřejná\s*doména|wikimedia|photo\s*by|Použito\s*se\s*svolením|wikipedia|archiv|sbírka)/i;

function walk(dir) {
  const out = [];
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, f.name);
    if (f.isDirectory()) out.push(...walk(p));
    else if (/\.(md|mdx)$/.test(f.name)) out.push(p);
  }
  return out;
}

function hasNearbyCredit(text, idx, radius = 200) {
  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + radius);
  return CREDIT_RE.test(text.slice(start, end));
}

function frontmatterHasCreditKey(fm) {
  // Frontmatter pole jako `credit:`, `foto:`, `autor:`, `zdrojFoto:`
  return /^(credit|autor|fotograf|zdrojFoto|imageCredit|foto):/m.test(fm);
}

function extractFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  return m ? m[1] : '';
}

function isFrontmatterImage(text, imgIdx) {
  // Photo v frontmatteru se neaudituje — credit se řeší jinde (v hero komponente)
  const fmEnd = text.indexOf('\n---\n');
  return fmEnd > 0 && imgIdx < fmEnd;
}

function audit() {
  const findings = [];
  let totalImages = 0;
  let totalFiles = 0;
  let filesWithMissing = 0;

  for (const subdir of SCAN_DIRS) {
    const abs = join(ROOT, subdir);
    let files;
    try { files = walk(abs); } catch { continue; }
    for (const f of files) {
      const text = readFileSync(f, 'utf8');
      const fm = extractFrontmatter(text);
      const fmHasCredit = frontmatterHasCreditKey(fm);
      const rel = relative(ROOT, f);
      totalFiles++;

      const fileFindings = [];

      // Markdown images: ![alt](path)
      const mdRe = /!\[([^\]]*)\]\(([^)\s]+)/g;
      let m;
      while ((m = mdRe.exec(text))) {
        if (isFrontmatterImage(text, m.index)) continue;
        const src = m[2];
        // Ignore externí (non-/img/) — nemůžeme audit
        if (!src.startsWith('/img/') && !src.startsWith('img/')) continue;
        totalImages++;
        const ok = fmHasCredit || hasNearbyCredit(text, m.index);
        if (!ok) {
          fileFindings.push({ kind: 'md-image', src, alt: m[1], offset: m.index });
        }
      }

      // <Photo src="..."> komponenta
      const photoRe = /<Photo\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*\/?>/g;
      while ((m = photoRe.exec(text))) {
        const fullTag = m[0];
        // Photo s explicitním credit/autor atributem: OK
        if (/\b(credit|autor|copyright|licence|src_credit)\s*=/i.test(fullTag)) continue;
        const src = m[1];
        if (!src.startsWith('/img/') && !src.startsWith('img/')) continue;
        totalImages++;
        const ok = fmHasCredit || hasNearbyCredit(text, m.index);
        if (!ok) {
          fileFindings.push({ kind: 'photo-component', src, offset: m.index });
        }
      }

      if (fileFindings.length) {
        filesWithMissing++;
        findings.push({ file: rel, count: fileFindings.length, items: fileFindings });
      }
    }
  }

  // Sort: nejvíc nálezů první
  findings.sort((a, b) => b.count - a.count);

  return { totalFiles, totalImages, filesWithMissing, findings };
}

function writeOutput(report) {
  const tmpDir = join(ROOT, 'tmp');
  try { mkdirSync(tmpDir); } catch {}

  writeFileSync(
    join(tmpDir, 'photo-credits-audit.json'),
    JSON.stringify(report, null, 2),
    'utf8'
  );

  let md = `# Photo Credits Audit\n\n`;
  md += `Generováno: ${new Date().toISOString().slice(0, 10)}\n\n`;
  md += `| Metrika | Hodnota |\n|---|---:|\n`;
  md += `| MD/MDX souborů | ${report.totalFiles} |\n`;
  md += `| Obrázků celkem (interní /img/) | ${report.totalImages} |\n`;
  md += `| Souborů bez creditů | ${report.filesWithMissing} |\n`;
  md += `| Nálezů (obrázků bez credit) | ${report.findings.reduce((s, f) => s + f.count, 0)} |\n\n`;

  md += `Heuristika: pro každý obrázek hledá v ±200 znacích keyword: foto, zdroj, autor, credit, ©, CC BY, CC-BY, public domain, Wikimedia, photo by, „Použito se svolením", wikipedia, archiv, sbírka. Frontmatter klíče: credit, autor, fotograf, zdrojFoto, imageCredit, foto. Photo komponenty s \`credit=\` / \`autor=\` jsou OK.\n\n`;

  md += `## Soubory bez kreditů\n\n`;
  for (const f of report.findings) {
    md += `### ${f.file} (${f.count})\n\n`;
    for (const item of f.items.slice(0, 10)) {
      md += `- \`${item.src}\` (${item.kind})\n`;
    }
    if (f.items.length > 10) md += `- … +${f.items.length - 10}\n`;
    md += `\n`;
  }

  writeFileSync(join(tmpDir, 'photo-credits-audit.md'), md, 'utf8');
  console.log(`Výstup: tmp/photo-credits-audit.{json,md}`);
}

const report = audit();
console.log(`\n=== Photo credits audit ===`);
console.log(`Soubory: ${report.totalFiles}`);
console.log(`Obrázků: ${report.totalImages}`);
console.log(`Souborů bez kreditů: ${report.filesWithMissing}`);
console.log(`Obrázků bez kreditů: ${report.findings.reduce((s, f) => s + f.count, 0)}`);
writeOutput(report);
