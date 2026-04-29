/**
 * Auto-detect zmínek hodinářů v článcích (M5.4).
 *
 * Pro každého hodináře z data/hodinari.ts (jmeno + aliasy) prohledá
 * obsah všech článků v content/hodinarium-eu/*.{md,mdx} regex matchem
 * a vygeneruje doporučený seznam relatedSlugs.
 *
 * Defaultně dry-run: vypíše diff (current vs. proposed) per hodinář.
 * S `--json` vypíše JSON do stdout pro programatický přečet.
 *
 * Run:  pnpm hodinari:detect
 *       pnpm hodinari:detect -- --json > tmp.json
 *
 * Pozn.: hodinari.ts needitujeme automaticky — soubor obsahuje rich
 * shrnuti text + ručně připravené relatedSlugs. Skript je advisor;
 * editor uvidí kandidáty a rozhodne, které doplnit.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const CONTENT_DIR = join(ROOT, 'content', 'hodinarium-eu');
const HODINARI_TS = join(ROOT, 'apps', 'hodinarium-eu', 'src', 'data', 'hodinari.ts');

const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');

interface Hodinar {
  slug: string;
  jmeno: string;
  aliasy: string[];
  relatedSlugs: string[];
}

/**
 * Naivní extract `hodinari` array z hodinari.ts. Místo full TS parser
 * stačí regex přes JSON-like části (slug, jmeno, aliasy, relatedSlugs).
 * Funkční pro current strukturu — pokud někdy přejdeme na JSON, zjednoduší se.
 */
async function loadHodinari(): Promise<Hodinar[]> {
  const src = await readFile(HODINARI_TS, 'utf-8');
  // Najdi začátek pole `export const hodinari: Hodinar[] = [`
  const arrStart = src.indexOf('export const hodinari');
  if (arrStart < 0) throw new Error('Cannot find `export const hodinari` in hodinari.ts');
  const body = src.slice(arrStart);

  const result: Hodinar[] = [];
  // Greedy match objektů { ... } na top level. Naivně rozdělíme přes
  // "  {" na začátku řádky a "  }" na konci.
  const objectRe = /\{\s*slug:\s*'([^']+)'[\s\S]*?relatedSlugs:\s*\[([\s\S]*?)\][\s\S]*?\},?/g;
  for (const m of body.matchAll(objectRe)) {
    const block = m[0];
    const slug = m[1];
    const relSlugs = (m[2].match(/'([^']+)'/g) ?? []).map((s) => s.slice(1, -1));
    const jmenoMatch = block.match(/jmeno:\s*'([^']+)'/);
    const aliasyBlock = block.match(/aliasy:\s*\[([\s\S]*?)\]/);
    const aliasy = aliasyBlock ? (aliasyBlock[1].match(/'([^']+)'/g) ?? []).map((s) => s.slice(1, -1)) : [];
    result.push({
      slug,
      jmeno: jmenoMatch?.[1] ?? slug,
      aliasy,
      relatedSlugs: relSlugs,
    });
  }
  return result;
}

async function loadArticles(): Promise<Map<string, string>> {
  const files = await readdir(CONTENT_DIR);
  const map = new Map<string, string>();
  for (const f of files) {
    if (!/\.(md|mdx)$/i.test(f)) continue;
    const slug = basename(f, extname(f));
    const content = await readFile(join(CONTENT_DIR, f), 'utf-8');
    // Strip frontmatter — chceme detect jen v body, ne v slug field apod.
    const stripped = content.replace(/^---[\s\S]*?\n---\n/, '');
    map.set(slug, stripped);
  }
  return map;
}

/**
 * Vyrobí regex pro hledání jména/aliasů jako celé slovo (word boundary).
 * Escapuje regex speciální znaky. Case-insensitive.
 */
function buildPattern(terms: string[]): RegExp {
  const escaped = terms
    .filter((t) => t.length >= 3) // krátké aliasy (B., R.) by matchovaly všechno
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (escaped.length === 0) return /(?!.*)/; // never matches
  return new RegExp(`(^|[^A-Za-zÁ-Žá-ž])(${escaped.join('|')})(?![A-Za-zÁ-Žá-ž])`, 'i');
}

interface DiffResult {
  hodinar: string;
  jmeno: string;
  current: string[];
  detected: string[];
  added: string[];
  removed: string[];
}

async function main() {
  const hodinari = await loadHodinari();
  const articles = await loadArticles();

  const results: DiffResult[] = [];

  for (const h of hodinari) {
    const terms = [h.jmeno, ...h.aliasy];
    const pattern = buildPattern(terms);
    const detected: string[] = [];
    for (const [slug, body] of articles) {
      if (pattern.test(body)) detected.push(slug);
    }
    detected.sort();
    const currentSet = new Set(h.relatedSlugs);
    const detectedSet = new Set(detected);
    const added = detected.filter((s) => !currentSet.has(s));
    const removed = h.relatedSlugs.filter((s) => !detectedSet.has(s));
    results.push({
      hodinar: h.slug,
      jmeno: h.jmeno,
      current: h.relatedSlugs,
      detected,
      added,
      removed,
    });
  }

  if (jsonOutput) {
    process.stdout.write(JSON.stringify(results, null, 2) + '\n');
    return;
  }

  // Pretty report
  console.log(`=== Auto-detect zmínek hodinářů ===`);
  console.log(`Hodinářů: ${hodinari.length}, článků: ${articles.size}\n`);

  for (const r of results) {
    const status = r.added.length === 0 && r.removed.length === 0 ? '✓' : '⚠';
    console.log(`${status} ${r.jmeno} (${r.hodinar})`);
    console.log(`   current  ${r.current.length}: ${r.current.join(', ') || '—'}`);
    console.log(`   detected ${r.detected.length}: ${r.detected.join(', ') || '—'}`);
    if (r.added.length > 0) console.log(`   + ADD:    ${r.added.join(', ')}`);
    if (r.removed.length > 0) console.log(`   − ZBYTNÉ: ${r.removed.join(', ')} (current ale ne detected — možná false positive nebo manuální cross-link)`);
    console.log();
  }

  const totalAdd = results.reduce((s, r) => s + r.added.length, 0);
  const totalRemove = results.reduce((s, r) => s + r.removed.length, 0);
  console.log(`=== Souhrn ===`);
  console.log(`Doporučeno přidat:  ${totalAdd}`);
  console.log(`Možná zbytečné:     ${totalRemove}`);
  console.log(`\nNávrh: editor projde hodinari.ts a doplní suggested ADD do`);
  console.log(`relatedSlugs[]. Skript hodinari.ts needituje — manuální review`);
  console.log(`je důležitý kvůli false positives (alias matchuje jiný kontext).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
