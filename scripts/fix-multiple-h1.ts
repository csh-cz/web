/**
 * Articles render their <h1> from the frontmatter `title`. When the markdown
 * body also contains a top-level `# Heading`, the page ends up with multiple
 * H1s — bad for accessibility and SEO. Demote markdown `# ` to `## `.
 *
 * If the frontmatter title is the generic placeholder
 * "Hodinárium Děčín - expozice časoměrných strojů" and the markdown body opens
 * with a real `# Heading`, promote that heading into the frontmatter title
 * and delete the markdown line entirely.
 *
 * Skip files with `manualEdit: true`. Idempotent.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const CONTENT = join(ROOT, 'content', 'hodinarium-eu');

const GENERIC_TITLE = 'Hodinárium Děčín - expozice časoměrných strojů';

interface Stats {
  filesScanned: number;
  filesUpdated: number;
  promotedToTitle: number;
  demotedToH2: number;
}

function processFile(content: string, stats: Stats): string {
  const m = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return content;
  let frontmatter = m[1];
  let body = m[2];

  if (/^manualEdit:\s*true/m.test(frontmatter)) return content;

  const h1Lines = body.match(/^# (?!#)(.+)$/gm) ?? [];
  if (h1Lines.length === 0) return content;

  const titleMatch = frontmatter.match(/^title:\s*"(.*?)"\s*$/m);
  const currentTitle = titleMatch?.[1] ?? '';

  // Pokud je frontmatter title generic a v body je první H1 = nahradit
  const firstH1 = h1Lines[0];
  const firstH1Text = firstH1.replace(/^# /, '').trim();

  if (currentTitle === GENERIC_TITLE && firstH1Text) {
    frontmatter = frontmatter.replace(
      /^title:\s*"(.*?)"\s*$/m,
      `title: ${JSON.stringify(firstH1Text)}`,
    );
    body = body.replace(firstH1 + '\n', '').replace(firstH1, '');
    stats.promotedToTitle++;
  }

  // Zbylé H1 → H2
  const beforeDemote = body;
  body = body.replace(/^# (?!#)/gm, '## ');
  if (body !== beforeDemote) {
    stats.demotedToH2 += (beforeDemote.match(/^# (?!#)/gm) ?? []).length;
  }

  stats.filesUpdated++;
  return `---\n${frontmatter}\n---\n${body}`;
}

async function main() {
  const files = (await readdir(CONTENT)).filter((f) => f.endsWith('.md'));
  const stats: Stats = {
    filesScanned: 0,
    filesUpdated: 0,
    promotedToTitle: 0,
    demotedToH2: 0,
  };

  for (const file of files) {
    const path = join(CONTENT, file);
    const content = await readFile(path, 'utf-8');
    stats.filesScanned++;
    const updated = processFile(content, stats);
    if (updated !== content) {
      await writeFile(path, updated, 'utf-8');
      console.log(`  ${file}`);
    }
  }

  console.log('\n=== Multiple H1 fix ===');
  console.log(`Scanned:                ${stats.filesScanned}`);
  console.log(`Updated:                ${stats.filesUpdated}`);
  console.log(`Promoted to title:      ${stats.promotedToTitle}`);
  console.log(`Demoted # → ##:         ${stats.demotedToH2}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
