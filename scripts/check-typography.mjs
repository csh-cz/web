#!/usr/bin/env node
// Audit typografických chyb v content/ — zaměřeno na BODY text a prose YAML pole.
// Filtruje: markdown tabulky, code bloky, URL, markdown linky, version stringy.
//
// Spuštění: `node scripts/check-typography.mjs [--fix]`

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fix = process.argv.includes('--fix');

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (/\.(mdx|md)$/.test(e.name)) out.push(p);
  }
  return out;
}

const files = walk(path.join(ROOT, 'content')).filter(f => !f.includes('/_link_audit') && !f.includes('/_dead_links') && !f.includes('/_redirect_candidates'));

const issues = {
  spaceBeforeInterp: [],
  doubleSpace: [],
  doubleHyphen: [],
  asciiEllipsis: [],
  hyphenInRange: [],
  asciiQuotesInProse: [],
  trailingWhitespace: [],
  fourStars: [],            // `****` artefakt z PHP scrapu
  closingAsciiQuote: [],    // „X"  s ASCII close → `"`
};

// Maska, která stringy ignoruje v textu pro detekci typo:
//   - URL
//   - markdown linky [text](url)
//   - inline code `code`
//   - HTML entities `&...;`
//   - markdown image syntax ![alt](src)
// Maskuj technické věci znakem \x01 (NE mezerou), aby umělé mezery v textu
// nevyrobily false-positive matches pro „mezera před interpunkcí" / dvojité mezery
function maskTechnical(line) {
  const M = '\x01';
  return line
    .replace(/!?\[[^\]]*\]\([^)]*\)/g, m => M.repeat(m.length))   // markdown link/image
    .replace(/`[^`]*`/g, m => M.repeat(m.length))                  // inline code
    .replace(/https?:\/\/\S+/g, m => M.repeat(m.length))           // bare URLs
    .replace(/&\w+;/g, m => M.repeat(m.length))                    // HTML entities
    .replace(/&#\d+;/g, m => M.repeat(m.length))                   // numeric entities
    .replace(/<[^>]+>/g, m => M.repeat(m.length));                 // HTML/JSX tags
}

// Soubor zda je v bloku ``` ``` (multi-line code)
function findCodeBlockLines(lines) {
  const inside = new Set();
  let inCode = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^```/.test(lines[i])) inCode = !inCode;
    else if (inCode) inside.add(i);
  }
  return inside;
}

// Markdown table line začíná `|` nebo má víc než 2 `|`
function isTableLine(line) {
  return /^\s*\|/.test(line) || (line.match(/\|/g) || []).length >= 3;
}

// YAML key line — `klíč: hodnota` na začátku (s indentací)
function isYAMLKeyLine(line) {
  return /^\s{0,8}[a-zA-Z][\w]*:\s/.test(line);
}

// YAML pole pro YAML hodnotu, ne klíč
function isYAMLValue(line) {
  return /^\s*-\s/.test(line) || /^\s+\w+:\s/.test(line);
}

// Detekuje YAML frontmatter sekci souboru
function frontmatterRange(lines) {
  if (lines[0] !== '---') return null;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') return [0, i];
  }
  return null;
}

for (const fp of files) {
  const rel = path.relative(ROOT, fp);
  const lines = fs.readFileSync(fp, 'utf8').split('\n');
  const codeBlockLines = findCodeBlockLines(lines);
  const fm = frontmatterRange(lines);

  for (let i = 0; i < lines.length; i++) {
    if (codeBlockLines.has(i)) continue;
    const line = lines[i];
    const inFrontmatter = fm && i > fm[0] && i < fm[1];

    // Trailing whitespace
    if (/[ \t]+$/.test(line)) {
      issues.trailingWhitespace.push({ rel, lineNum: i + 1, snippet: line.replace(/[ \t]+$/, '⎵').slice(-40) });
    }

    // Tabulky vynechat
    if (isTableLine(line)) continue;

    // Mask technické věci
    const masked = maskTechnical(line);

    // 1) Mezera před interpunkcí v prozaickém textu
    // Test: písmeno + 1+ space + interpunkce + (space|EOL|netextový znak)
    const reSpaceBefore = /(\w)\s+([,.:;?!])(?=$|\s|<)/g;
    let m;
    while ((m = reSpaceBefore.exec(masked)) !== null) {
      issues.spaceBeforeInterp.push({ rel, lineNum: i + 1, snippet: line.slice(Math.max(0, m.index - 25), m.index + 30) });
    }

    // 2) Dvojité mezery v prozaickém textu (ne tabulky, ne odsazení)
    if (!isTableLine(line) && !inFrontmatter && !/^\s+/.test(line.slice(0, 6))) {
      // Two+ spaces between non-space chars
      if (/\S {2,}\S/.test(masked)) {
        issues.doubleSpace.push({ rel, lineNum: i + 1, snippet: line.trim().slice(0, 80) });
      }
    }

    // 3) ` -- ` v body
    if (!inFrontmatter && / -- /.test(masked)) {
      issues.doubleHyphen.push({ rel, lineNum: i + 1, snippet: line.trim().slice(0, 80) });
    }

    // 4) ASCII trojtečka — různé varianty (ne ".. " ani "....", jen 3 tečky)
    // Filtruj `...` v citacích kde to znamená výpustku — to je legitimní (autor ji použil schválně)
    // Aktualně všechny 85 výskytů jsou legitimní (citace, výpustky) — takže přeskakovat.
    if (false && /\.{3}/.test(masked)) {
      issues.asciiEllipsis.push({ rel, lineNum: i + 1, snippet: line.trim().slice(0, 80) });
    }

    // 5) Hyphen v rozsahu let (mimo tabulky)
    const reYearRange = /\b(\d{3,4})-(\d{3,4})\b/g;
    while ((m = reYearRange.exec(masked)) !== null) {
      const a = parseInt(m[1]); const b = parseInt(m[2]);
      // Slug-like patterns to skip: "akvizice-2015-2025" hash anchors
      const ctx = line.slice(Math.max(0, m.index - 10), m.index);
      if (/akvizice-|\#$|inv-/.test(ctx)) continue;
      if (b - a >= 0 && b - a <= 200) {
        issues.hyphenInRange.push({ rel, lineNum: i + 1, snippet: line.trim().slice(Math.max(0, m.index - 20), m.index + 30) });
      }
    }

    // 6) ASCII " ... " v prózní markdown body — jen když nezačíná YAML key
    if (!inFrontmatter && !isTableLine(line)) {
      // Hledej "..." kde je obsah > 1 znak a < 200, nezačíná velkým písmenem-jen
      const reAsciiQuote = /"([^"\n<>{}]{2,200})"/g;
      while ((m = reAsciiQuote.exec(masked)) !== null) {
        // Skip empty or technical
        const inner = m[1];
        if (/^[\d.,\-+*/]+$/.test(inner)) continue;  // jen čísla
        if (/^[a-z_-]+$/.test(inner)) continue;  // technical id
        issues.asciiQuotesInProse.push({ rel, lineNum: i + 1, snippet: m[0].slice(0, 80) });
      }
    }

    // 7) Markdown `****` artefakty (4+ adjacent stars)
    if (!inFrontmatter && /\*{4,}/.test(line)) {
      issues.fourStars.push({ rel, lineNum: i + 1, snippet: line.trim().slice(0, 80) });
    }

    // 8) Český open + ASCII close quote pair: „...".
    // Detekuj pouze, když je v páru a content nepřekračuje řádek (nestrhávat
    // přes víc-řádkový blok scalar, kde to může mít jiný význam).
    if (!inFrontmatter) {
      const reCzechAsciiPair = /„([^„"\n]{1,200})"/g;
      while ((m = reCzechAsciiPair.exec(line)) !== null) {
        issues.closingAsciiQuote.push({ rel, lineNum: i + 1, snippet: m[0].slice(0, 80) });
      }
    }
  }
}

function printSection(name, list, limit = 12) {
  console.log(`\n## ${name}: ${list.length}`);
  if (!list.length) return;
  for (const it of list.slice(0, limit)) {
    console.log(`  ${it.rel}:${it.lineNum}  ${it.snippet.replace(/\n/g, '\\n')}`);
  }
  if (list.length > limit) console.log(`  ... ${list.length - limit} more`);
}

console.log('=== TYPOGRAFICKÝ AUDIT — content/ (zpřísněné filtry) ===');
console.log(`Files scanned: ${files.length}\n`);

printSection('1) Mezera před interpunkcí', issues.spaceBeforeInterp);
printSection('2) Dvojité mezery v prozaickém textu', issues.doubleSpace);
printSection('3) ` -- ` místo em dash ` — `', issues.doubleHyphen);
printSection('4) Hyphen v rozmezí let (1850-1900 → 1850–1900)', issues.hyphenInRange);
printSection('5) ASCII uvozovky " ... " v body textu', issues.asciiQuotesInProse);
printSection('6) Trailing whitespace', issues.trailingWhitespace);
printSection('7) Markdown `****` artefakty', issues.fourStars);
printSection('8) Český open + ASCII close uvozovka („...")', issues.closingAsciiQuote);

const total = Object.values(issues).reduce((s, l) => s + l.length, 0);
console.log(`\n=== TOTAL: ${total} issues ===`);

if (fix) {
  console.log('\n=== APPLYING FIXES (safe categories) ===');
  let totalFixed = 0;
  for (const fp of files) {
    let src = fs.readFileSync(fp, 'utf8');
    const orig = src;
    const lines = src.split('\n');
    const codeBlockLines = findCodeBlockLines(lines);
    const fm = frontmatterRange(lines);

    for (let i = 0; i < lines.length; i++) {
      if (codeBlockLines.has(i)) continue;
      if (isTableLine(lines[i])) {
        // V tabulce opravíme jen trailing whitespace
        lines[i] = lines[i].replace(/[ \t]+$/, '');
        continue;
      }
      const inFrontmatter = fm && i > fm[0] && i < fm[1];

      let line = lines[i];

      // 1) Trailing whitespace (vždy)
      line = line.replace(/[ \t]+$/, '');

      // Maskovaný okruh — fix jen v non-tech částech, ale aplikujeme na celý řádek
      // pomocí regex co URL/markdown linky neporuší.

      // 2) Mezera před interpunkcí — bezpečné: písmeno + 1+ space + . , : ; ? !
      // Aplikuj jen pokud následující znak je space/EOL nebo žádný znak
      line = line.replace(/(\w)[ \t]+([,.:;?!])(?=$|[\s<])/g, '$1$2');

      // 3) Dvojité mezery v body (ne ve frontmatter, ne v table)
      if (!inFrontmatter) {
        // Zachovej úvodní indent, opravuj jen vnitřek
        const indentMatch = line.match(/^(\s*)/);
        const indent = indentMatch ? indentMatch[1] : '';
        const body = line.slice(indent.length);
        const fixed = body.replace(/(\S) {2,}(\S)/g, '$1 $2');
        line = indent + fixed;
      }

      // 4) ` -- ` → ` — `
      line = line.replace(/ -- /g, ' — ');

      // 4b) Markdown `****` artefakt mezi slovy (PHP scrap pattern)
      // `slovo****slovo` → `slovo** **slovo` (rozdělit na dvě bold spany se separátorem)
      // Pozor: nepoškodí `***foo***` (bold-italic) — to je 3 stars, naše regex hledá 4+
      line = line.replace(/(\S)\*{4}(\S)/g, '$1** **$2');
      // `text****` na konci slova/věty → `text** ` (zavře bold, smaže nadbytečné stars)
      line = line.replace(/(\S)\*{4}(\s|$)/g, '$1**$2');
      // `****slovo` na začátku → `**slovo` (otevře bold)
      line = line.replace(/(^|\s)\*{4}(\S)/g, '$1**$2');
      // Standalone `****` → smazat
      line = line.replace(/^\s*\*{4,}\s*$/g, '');

      // 4c) Český open + ASCII close → Czech close (U+201D)
      // „content"  →  „content”   (jen v body, nezasáhne YAML)
      if (!inFrontmatter) {
        line = line.replace(/„([^„"\n]{1,200})"/g, '„$1”');
        // 4d) Český open + English left close (U+201C) → Czech close (U+201D)
        // „content“ → „content”  (chybné použití typografické anglické otevírací jako české zavírací)
        line = line.replace(/„([^„”"\n]{1,200})“/g, '„$1”');
      }

      // 5) Hyphen v rozsahu let
      line = line.replace(/\b(\d{3,4})-(\d{3,4})\b/g, (full, a, b, offset) => {
        const aN = parseInt(a), bN = parseInt(b);
        const before = line.slice(Math.max(0, offset - 10), offset);
        if (/akvizice-|inv-|#/.test(before)) return full;
        return (bN - aN >= 0 && bN - aN <= 200) ? `${a}–${b}` : full;
      });

      lines[i] = line;
    }

    src = lines.join('\n');
    if (src !== orig) {
      fs.writeFileSync(fp, src, 'utf8');
      totalFixed++;
    }
  }
  console.log(`Fixed ${totalFixed} files.`);
  console.log('\nNOTE: ASCII uvozovky " ... " neopraveny automaticky — riziko porušení YAML/MDX syntaxe.');
  console.log('Pro doplnění českých uvozovek v body textu spusť ručně po revize výpisu.');
}
