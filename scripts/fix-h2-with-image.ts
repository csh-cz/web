/**
 * Original site frequently rendered an image inside a heading:
 *   ## ![alt](url)
 *   ### [![alt](thumb)](href) Some heading text
 *
 * Both produce <h2><img></h2> after markdown render — accessibility
 * fail, multiple-h1/no-h1 and floats break.
 *
 * Strategy:
 *   - "## ![alt](url)" with no other text → drop the heading wrapper,
 *     keep image as its own paragraph (it's a caption-only block).
 *   - "## [![alt](thumb)](href) Heading text" → split into proper
 *     heading + linked thumbnail on its own line.
 *   - "## Heading text![alt](url)" or any heading mixing text with image →
 *     same: split heading from image.
 *
 * Skip files with manualEdit:true. Idempotent.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const DIRS = [
  join(ROOT, 'content', 'hodinarium-eu'),
  join(ROOT, 'content', 'horologie-cz'),
];

interface Stats {
  filesScanned: number;
  filesUpdated: number;
  imagesExtracted: number;
}

const HEADING_RE = /^(#{2,6})\s+(.*)$/;
const IMG_RE = /!\[[^\]]*\]\([^)]+\)/g;
const LINK_IMG_RE = /\[!\[[^\]]*\]\([^)]+\)\]\([^)]+\)/g;

function processFile(content: string, stats: Stats): string {
  if (/^manualEdit:\s*true/m.test(content)) return content;
  const lines = content.split('\n');
  const out: string[] = [];
  let inFM = false, fmDone = 0;
  let inCode = false;
  let extracted = 0;

  for (const line of lines) {
    if (line === '---') { fmDone++; inFM = fmDone === 1; out.push(line); continue; }
    if (fmDone < 2) { out.push(line); continue; }
    if (line.startsWith('```')) { inCode = !inCode; out.push(line); continue; }
    if (inCode) { out.push(line); continue; }

    const m = line.match(HEADING_RE);
    if (!m) { out.push(line); continue; }
    const level = m[1];
    let body = m[2];

    // Pull every image / linked image out of body
    const imgs: string[] = [];
    body = body.replace(LINK_IMG_RE, (m0) => { imgs.push(m0); return ''; });
    body = body.replace(IMG_RE, (m0) => { imgs.push(m0); return ''; });
    body = body.trim();

    if (imgs.length === 0) {
      out.push(line);
      continue;
    }

    // If heading text remains: emit heading + blank + images
    // If heading is now empty: emit just images (drop heading wrapper)
    if (body.length > 0) {
      out.push(`${level} ${body}`);
      out.push('');
      for (const img of imgs) out.push(img);
    } else {
      for (const img of imgs) out.push(img);
    }
    extracted += imgs.length;
  }

  if (extracted === 0) return content;
  stats.imagesExtracted += extracted;
  // Collapse 3+ blank lines that may have been introduced
  return out.join('\n').replace(/\n{3,}/g, '\n\n');
}

async function main() {
  const stats: Stats = { filesScanned: 0, filesUpdated: 0, imagesExtracted: 0 };
  for (const dir of DIRS) {
    const files = (await readdir(dir)).filter((f) => f.endsWith('.md'));
    for (const file of files) {
      const path = join(dir, file);
      const content = await readFile(path, 'utf-8');
      stats.filesScanned++;
      const updated = processFile(content, stats);
      if (updated !== content) {
        await writeFile(path, updated, 'utf-8');
        stats.filesUpdated++;
        console.log(`  ${file}`);
      }
    }
  }
  console.log('\n=== Fix H2 with embedded image ===');
  console.log(`Scanned:           ${stats.filesScanned}`);
  console.log(`Files updated:     ${stats.filesUpdated}`);
  console.log(`Images extracted:  ${stats.imagesExtracted}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
