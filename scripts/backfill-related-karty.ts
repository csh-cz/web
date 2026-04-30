/**
 * Backfill `relatedKarty` FK ve stávajících článcích /sbirka/<slug>/.
 *
 * Heuristický match: pro každý článek (podsekce !== 'karta') zkusí
 * najít odpovídající karty podle:
 *   - Substring match v body článku na inv-NNN-slug components
 *   - Match přes vyrobce + rok výroby (např. článek "Bychory komplet"
 *     obsahuje "Prokeš 1868" → karta inv-2-vezni-prokes-1868-soubor)
 *
 * Default: dry-run (jen report, žádný file write).
 * --apply: skutečně doplní `relatedKarty: [...]` do frontmatteru článků.
 *
 * Run:
 *   pnpm sbirka:relate              # dry-run
 *   pnpm sbirka:relate -- --apply
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const CONTENT_DIR = join(ROOT, 'content', 'hodinarium-eu');

const APPLY = process.argv.includes('--apply');

interface ArticleInfo {
  slug: string;
  filename: string;
  body: string;
  frontmatter: string;
  podsekce: string | null;
  category: string | null;
  existingRelated: string[];
}

interface KartaInfo {
  slug: string;
  popis: string;        // z title v frontmatteru
  vyrobce: string | null;
  datace: string | null;
}

/** Crude YAML frontmatter extractor (přesný parser není potřeba — jen string fields). */
function parseFm(content: string): { frontmatter: string; body: string; fields: Record<string, string | string[]> } {
  const m = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { frontmatter: '', body: content, fields: {} };
  const fm = m[1];
  const body = m[2];
  const fields: Record<string, string | string[]> = {};
  // Single-line scalars: key: "value" nebo key: value
  for (const line of fm.split('\n')) {
    const sm = line.match(/^(\w+):\s*"([^"]*)"$/);
    if (sm) { fields[sm[1]] = sm[2]; continue; }
    const sm2 = line.match(/^(\w+):\s*([^\s"][^\n]*)$/);
    if (sm2) { fields[sm2[1]] = sm2[2].trim(); continue; }
  }
  // relatedKarty array (jednoduchý parse — předpokládá YAML list inline nebo jednoduchý multiline)
  const rkInline = fm.match(/^relatedKarty:\s*\[([^\]]*)\]/m);
  if (rkInline) {
    fields.relatedKarty = rkInline[1].split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
  } else {
    const rkMulti = fm.match(/^relatedKarty:\n((?:\s*-\s*[^\n]+\n?)+)/m);
    if (rkMulti) {
      fields.relatedKarty = rkMulti[1].split('\n').map((l) => l.replace(/^\s*-\s*/, '').trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    }
  }
  return { frontmatter: fm, body, fields };
}

async function loadArticles(): Promise<ArticleInfo[]> {
  const files = await readdir(CONTENT_DIR);
  const result: ArticleInfo[] = [];
  for (const f of files) {
    if (!/\.(md|mdx)$/.test(f)) continue;
    const slug = f.replace(/\.(md|mdx)$/, '');
    const content = await readFile(join(CONTENT_DIR, f), 'utf-8');
    const { frontmatter, body, fields } = parseFm(content);
    result.push({
      slug,
      filename: f,
      body,
      frontmatter,
      podsekce: typeof fields.podsekce === 'string' ? fields.podsekce : null,
      category: typeof fields.category === 'string' ? fields.category : null,
      existingRelated: Array.isArray(fields.relatedKarty) ? fields.relatedKarty : [],
    });
  }
  return result;
}

/** Z karty vytáhnout popis + vyrobce + datace (z karta nested fields ve fm). */
async function loadKartyInfo(allArticles: ArticleInfo[]): Promise<KartaInfo[]> {
  const result: KartaInfo[] = [];
  for (const a of allArticles) {
    if (a.podsekce !== 'karta') continue;
    const content = await readFile(join(CONTENT_DIR, a.filename), 'utf-8');
    const titleM = content.match(/^title:\s*"([^"]+)"/m);
    const vyrobceM = content.match(/^\s+vyrobce:\s*"([^"]+)"/m);
    const dataceM = content.match(/^\s+datace:\s*"([^"]+)"/m);
    result.push({
      slug: a.slug,
      popis: titleM?.[1] ?? a.slug,
      vyrobce: vyrobceM?.[1] ?? null,
      datace: dataceM?.[1] ?? null,
    });
  }
  return result;
}

/** Match score: jak moc se článek (popis + body) shoduje s kartou. */
function scoreMatch(article: ArticleInfo, karta: KartaInfo): number {
  let score = 0;
  const articleSlug = article.slug.toLowerCase();
  const articleBody = article.body.toLowerCase();
  const articleFm = article.frontmatter.toLowerCase();
  const haystack = `${articleSlug} ${articleBody} ${articleFm}`;

  // Match na klíčová slova z karta popisu
  const popisWords = karta.popis.toLowerCase()
    .replace(/[^a-zá-ž0-9]+/gi, ' ')
    .split(' ')
    .filter((w) => w.length >= 4 && !['vezni', 'vezni', 'hodiny', 'hodinovy', 'stroj'].includes(w));
  for (const w of popisWords) {
    if (haystack.includes(w)) score += 1;
  }

  // Vyrobce (pokud znám) — silný signál
  if (karta.vyrobce) {
    const vy = karta.vyrobce.toLowerCase();
    if (haystack.includes(vy)) score += 3;
  }

  // Datace (rok) — silný signál pokud unikátní
  if (karta.datace && /^\d{4}$/.test(karta.datace)) {
    if (haystack.includes(karta.datace)) score += 2;
  }

  return score;
}

async function main() {
  const all = await loadArticles();
  const karty = await loadKartyInfo(all);
  const sbirkaArticles = all.filter((a) => a.category === 'sbirka' && a.podsekce !== 'karta');

  console.log(`=== Sbírka: backfill relatedKarty ===`);
  console.log(`Karet:    ${karty.length}`);
  console.log(`Článků:   ${sbirkaArticles.length}`);
  console.log();

  const proposals: Array<{ article: string; existing: string[]; suggested: string[]; scores: Map<string, number> }> = [];

  for (const article of sbirkaArticles) {
    const scores = new Map<string, number>();
    for (const karta of karty) {
      const s = scoreMatch(article, karta);
      if (s >= 3) scores.set(karta.slug, s);
    }
    // Sort by score desc, take top 5
    const suggested = [...scores.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([s]) => s);
    if (suggested.length > 0) {
      proposals.push({
        article: article.slug,
        existing: article.existingRelated,
        suggested,
        scores,
      });
    }
  }

  console.log(`Articles s navrženými relatedKarty: ${proposals.length} z ${sbirkaArticles.length}`);
  console.log();

  // Print top proposals
  console.log('--- Top návrhy (score, suggested karty) ---');
  for (const p of proposals.slice(0, 30)) {
    const top = [...p.scores.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
    const topStr = top.map(([s, sc]) => `${s} (${sc})`).join(', ');
    console.log(`  ${p.article}`);
    console.log(`    → ${topStr}`);
    if (p.existing.length > 0) console.log(`    EXISTING: ${p.existing.join(', ')}`);
  }
  if (proposals.length > 30) console.log(`  … plus ${proposals.length - 30} dalších`);

  if (APPLY) {
    console.log('\n=== --apply mode: skutečný zápis ===');
    let written = 0;
    let skipped = 0;
    for (const p of proposals) {
      const article = sbirkaArticles.find((a) => a.slug === p.article)!;
      // Pokud už má nějaké relatedKarty, neměnit (manuální editor má prioritu)
      if (article.existingRelated.length > 0) { skipped++; continue; }
      // Vezmeme jen TOP 1 návrh (vyšší score = vyšší jistota)
      // — víc návrhů by spamovaly false positives
      const topMatch = p.suggested[0];
      if (!topMatch) continue;

      // Zapíšeme relatedKarty: [topMatch] do frontmatteru
      const content = await readFile(join(CONTENT_DIR, article.filename), 'utf-8');
      // Insert pod existující line; pokud schema nemá relatedKarty, přidat před závěrečné ---
      let newContent: string;
      if (content.includes('\nrelatedKarty:')) {
        // shouldn't happen — existing was empty filter — ale safety
        skipped++;
        continue;
      } else {
        newContent = content.replace(
          /^---\n([\s\S]*?)\n---\n/,
          (m, fm) => `---\n${fm}\nrelatedKarty:\n  - ${topMatch}\n---\n`,
        );
      }
      await writeFile(join(CONTENT_DIR, article.filename), newContent, 'utf-8');
      written++;
    }
    console.log(`Zapsáno:    ${written}`);
    console.log(`Přeskočeno: ${skipped}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
