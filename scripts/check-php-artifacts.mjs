#!/usr/bin/env node
// Audit zbytkových PHP / HTML artefaktů v content/.
//
// Hledá:
//   1) HTML entity (&nbsp;, &amp;, &quot;, &#NNN;, &shy; ...)
//   2) Stray HTML tagy mimo MDX komponenty (<br>, <p>, <strong>, atd.)
//   3) PHP/WP shortcuty `<?`, `?>`, `[shortcode]`
//   4) Encoding artefakty (Windows-1250 zbytky, mojibake)
//   5) Backlash escape sekvence (`\\-`, `\---`)
//   6) WordPress legacy URL params (`?p=`, `?attachment_id=`)
//   7) Smart-quote variants z různého kódování
//   8) Soft hyphens (U+00AD)
//
// Spuštění: `node scripts/check-php-artifacts.mjs [--fix]`

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

const files = walk(path.join(ROOT, 'content')).filter(f =>
  !f.includes('/_link_audit') && !f.includes('/_dead_links') && !f.includes('/_redirect_candidates')
);

const issues = {
  htmlEntities: [],     // &nbsp; &amp; &quot; &#NNN;
  strayHtml: [],        // <br> <p> <strong> bez MDX kontextu
  phpTags: [],          // <?php, ?>, [shortcode]
  mojibake: [],         // Windows-1250 → UTF-8 chyby
  backslashEscape: [],  // \--- \& \!
  wpUrls: [],           // ?p=N, ?attachment_id=N
  softHyphen: [],       // U+00AD
  weirdSpaces: [],      // U+00A0 (NBSP) NB. legitimní pro typografii
  oldQuotes: [],        // U+201C English left jako Czech close
};

const FIX_APPLIED = { count: 0, files: 0 };

function checkFile(rel, src) {
  const lines = src.split('\n');
  let inCode = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    if (/^```/.test(line)) { inCode = !inCode; continue; }
    if (inCode) continue;

    // 1) HTML entity (kromě běžných v YAML jako &nbsp;)
    const entRe = /&(?:[a-zA-Z]{2,8}|#\d{2,5}|#x[0-9a-fA-F]{2,4});/g;
    let m;
    while ((m = entRe.exec(line)) !== null) {
      issues.htmlEntities.push({ rel, lineNum, snippet: line.slice(Math.max(0, m.index - 15), m.index + 30) });
    }

    // 2) Stray HTML tagy (mimo schválené MDX komponenty)
    // Allow: <Photo, <Ref, <YouTube, <JsonLd, <KartaSbirky, etc. (PascalCase)
    // Allow: <br/> <hr/> <img standardně
    const tagRe = /<(\/?[a-z][a-z0-9]*)\b[^>]*>/g;
    while ((m = tagRe.exec(line)) !== null) {
      const tag = m[1].replace(/^\//, '').toLowerCase();
      // Skip běžné komponenty MDX a inline HTML, které je v markdown OK
      if (['br', 'hr', 'img', 'a', 'span', 'div', 'sub', 'sup', 'ins', 'del', 'mark', 's', 'u', 'iframe', 'cite', 'em', 'strong', 'small', 'code', 'kbd', 'pre', 'blockquote', 'figure', 'figcaption', 'video', 'source', 'audio', 'picture', 'time', 'abbr', 'dfn', 'q', 'samp', 'var', 'wbr'].includes(tag)) {
        // Ale pokud má div nebo span class="something" tak je to pravděpodobně PHP zbytek
        // Pro audit reportujeme všechny tagy v body — uživatel posoudí
        if (['div', 'span', 'p'].includes(tag)) {
          issues.strayHtml.push({ rel, lineNum, snippet: m[0].slice(0, 80) });
        }
        continue;
      }
      // Velká písmena = MDX komponenta → OK
      if (/^[A-Z]/.test(m[1].replace(/^\//, ''))) continue;
      issues.strayHtml.push({ rel, lineNum, snippet: m[0].slice(0, 80) });
    }

    // 3) PHP zbytky
    if (/<\?(?:php)?|\?>/.test(line)) {
      issues.phpTags.push({ rel, lineNum, snippet: line.trim().slice(0, 80) });
    }
    // Wordpress shortcodes
    const wpShortRe = /\[(?:caption|gallery|embed|video|audio|playlist|wp_caption)\b[^\]]*\]/g;
    while ((m = wpShortRe.exec(line)) !== null) {
      issues.phpTags.push({ rel, lineNum, snippet: m[0].slice(0, 80) });
    }

    // 4) Mojibake — typické Windows-1250 → UTF-8 chyby
    // Patterns:
    //   "Â\u00xx" (latin1 dvojité dekódování)
    //   "Ã" + non-ASCII (cp1250 dvojité)
    //   "â€™" (UTF-8 quote interpretovaný jako Latin-1)
    //   "â€œ" / "â€" (smart quote chyby)
    if (/â€™|â€œ|â€|Ã[-¿]|Â /.test(line)) {
      issues.mojibake.push({ rel, lineNum, snippet: line.trim().slice(0, 80) });
    }

    // 5) Backslash escape mimo standardní markdown
    // Markdown legitimní: \* \_ \[ \] \( \) \{ \} \# \! \. \>
    // Suspicious: \--- \&shy; \~ \&
    const slashRe = /\\(?:[-]{2,3}|&\w+;|~|`|=)/g;
    while ((m = slashRe.exec(line)) !== null) {
      issues.backslashEscape.push({ rel, lineNum, snippet: line.slice(Math.max(0, m.index - 10), m.index + 20) });
    }

    // 6) WordPress URL params — only in URL context
    if (/\?(?:p|attachment_id|page_id|cat|tag)=\d+/.test(line)) {
      issues.wpUrls.push({ rel, lineNum, snippet: line.trim().slice(0, 80) });
    }

    // 7) Soft hyphen (U+00AD)
    if (/­/.test(line)) {
      issues.softHyphen.push({ rel, lineNum, snippet: line.trim().slice(0, 80) });
    }

    // 8) English left curly quote „“ použitý jako Czech close
    // (toto už řeší typography fix, ale pro úplnost reportujeme)
    if (/„[^„"”\n]+“/.test(line)) {
      issues.oldQuotes.push({ rel, lineNum, snippet: line.trim().slice(0, 80) });
    }
  }
}

for (const fp of files) {
  const rel = path.relative(ROOT, fp);
  const src = fs.readFileSync(fp, 'utf8');
  checkFile(rel, src);
}

function printSection(name, list, limit = 12) {
  console.log(`\n## ${name}: ${list.length}`);
  if (!list.length) return;
  for (const it of list.slice(0, limit)) {
    console.log(`  ${it.rel}:${it.lineNum}  ${it.snippet.replace(/\n/g, '\\n')}`);
  }
  if (list.length > limit) console.log(`  ... ${list.length - limit} more`);
}

console.log('=== AUDIT PHP/HTML ARTEFAKTŮ ===');
console.log(`Files scanned: ${files.length}\n`);

printSection('1) HTML entity (&nbsp;, &amp;, &quot;, &#NNN; ...)', issues.htmlEntities);
printSection('2) Stray HTML tagy (<div>, <p>, <span> apod. v body)', issues.strayHtml);
printSection('3) PHP zbytky (<? ?>) a WordPress shortcodes', issues.phpTags);
printSection('4) Mojibake (Windows-1250 ↔ UTF-8 chyby)', issues.mojibake);
printSection('5) Suspicious backslash escape (\\--- \\&; ...)', issues.backslashEscape);
printSection('6) WordPress URL params (?p= ?attachment_id=)', issues.wpUrls);
printSection('7) Soft hyphen (U+00AD)', issues.softHyphen);
printSection('8) English left quote „X" jako Czech close', issues.oldQuotes);

const total = Object.values(issues).reduce((s, l) => s + l.length, 0);
console.log(`\n=== TOTAL: ${total} issues ===`);

if (fix) {
  console.log('\n=== APPLYING FIXES (safe categories) ===');
  // HTML entity decoding map (jen běžné)
  const entityMap = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&quot;': '"',
    '&apos;': "'",
    '&lt;': '<',
    '&gt;': '>',
    '&hellip;': '…',
    '&mdash;': '—',
    '&ndash;': '–',
    '&laquo;': '«',
    '&raquo;': '»',
    '&bdquo;': '„',
    '&rdquo;': '”',
    '&ldquo;': '“',
    '&lsquo;': '‘',
    '&rsquo;': '’',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
    '&shy;': '',  // soft hyphen — odstranit
    '&middot;': '·',
    '&para;': '¶',
    '&deg;': '°',
    '&plusmn;': '±',
    '&times;': '×',
    '&divide;': '÷',
    '&euro;': '€',
    '&pound;': '£',
    '&yen;': '¥',
    '&cent;': '¢',
    '&sect;': '§',
  };

  for (const fp of files) {
    let src = fs.readFileSync(fp, 'utf8');
    const orig = src;

    // Decode named entities
    for (const [ent, ch] of Object.entries(entityMap)) {
      src = src.replaceAll(ent, ch);
    }
    // Decode numeric entities (&#NNN;) — for printable chars
    src = src.replace(/&#(\d{2,5});/g, (full, n) => {
      const code = parseInt(n, 10);
      if (code >= 32 && code < 0x10000) return String.fromCodePoint(code);
      return full;
    });
    src = src.replace(/&#x([0-9a-fA-F]{2,4});/g, (full, n) => {
      const code = parseInt(n, 16);
      if (code >= 32 && code < 0x10000) return String.fromCodePoint(code);
      return full;
    });

    // Remove soft hyphens
    src = src.replace(/­/g, '');

    if (src !== orig) {
      fs.writeFileSync(fp, src, 'utf8');
      FIX_APPLIED.files++;
      // Approx count of changes
      FIX_APPLIED.count += (orig.match(/&\w+;|&#\d+;|­/g) || []).length;
    }
  }
  console.log(`Fixed ${FIX_APPLIED.files} files (~${FIX_APPLIED.count} replacements).`);
  console.log('NEPROVEDENO automaticky: stray HTML tagy a backslash escape — vyžadují ruční review.');
}
