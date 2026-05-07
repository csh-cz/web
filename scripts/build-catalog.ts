/**
 * Vyrobí katalog z content/hodinarium-eu/*.md.
 * Pro každý článek vyextrahuje:
 *   - title, slug, category
 *   - thumbnail (první image v body)
 *   - excerpt (první větu / odstavec, max 200 znaků)
 *   - year (heuristicky — najde 4místné číslo 1300-2030 v textu)
 *   - imageCount
 *
 * Výstup: content/hodinarium-eu/_catalog.json
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as yamlParse } from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const CONTENT_DIR = join(ROOT, 'content', 'hodinarium-eu');
const OUT_PATH = join(CONTENT_DIR, '_catalog.json');

interface CatalogEntry {
  slug: string;
  title: string;
  category: string;
  /** 'karta' = evidenční karta sbírky (router /sbirka/karta/<slug>),
   *  'clanek' nebo undefined = standardní článek (router /<category>/<slug>) */
  podsekce?: string;
  thumbnail: string | null;
  excerpt: string;
  year: number | null;
  lastModified: string | null;
  imageCount: number;
  wordCount: number;
  vyrobce?: string;
  tags?: string[];
  searchKeywords?: string[];
}

function parseFrontmatter(content: string): { fm: Record<string, unknown>; body: string } {
  const m = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { fm: {}, body: content };
  // Použij plnotextový YAML parser — naïve line-based parsing nepodporuje
  // nested struktury (karta: { vyrobce: ... }), block scalars, multi-line
  // arrays atd. yaml@2 je již v node_modules (dependency Astro).
  let fm: Record<string, unknown> = {};
  try {
    // Lazy ESM import — async ale tady chceme sync. Naštěstí js-yaml má
    // synchronní API. Ale yaml@2 má stejné. Zkusíme yaml.
    // Static import top-of-file way:
    fm = yamlParse(m[1]);
  } catch {
    // Tichá chyba — pokud parser failne (corrupted YAML), vrátíme prázdný
    // frontmatter; build-catalog je advisory, ne strict validátor.
  }
  return { fm, body: m[2] };
}

/**
 * Najde první rasterový obrázek v těle článku, který může být použit
 * jako thumbnail pro atlas/karty. Pravidla:
 *   - URL musí začínat /img/ — odmítáme ![](/clanky/...) a podobné
 *     polokomické artefakty z turndown konverze.
 *   - Přípona musí být raster (jpg/jpeg/png/gif/webp/avif). SVG ne.
 *   - První takový kandidát se vrací.
 */
function extractFirstImage(body: string): string | null {
  // Hledej v pořadí ve kterém v body figurují (markdown i Photo komponenta).
  // Pattern A: ![alt](/img/...)
  // Pattern B: <Photo src="/img/..." …> (multi-line, atributy v jakémkoli pořadí)
  // Pattern C: <img src="/img/..." …> (raw HTML)
  const candidates: { idx: number; url: string }[] = [];
  const rasterRe = /\.(?:jpe?g|png|gif|webp|avif)$/i;

  const reMd = /!\[[^\]]*\]\((\/img\/[^)\s]+)\)/g;
  for (const m of body.matchAll(reMd)) {
    if (rasterRe.test(m[1])) candidates.push({ idx: m.index!, url: m[1] });
  }

  const rePhoto = /<Photo\b[\s\S]*?\bsrc=["'](\/img\/[^"']+)["'][\s\S]*?\/?>/g;
  for (const m of body.matchAll(rePhoto)) {
    if (rasterRe.test(m[1])) candidates.push({ idx: m.index!, url: m[1] });
  }

  const reImg = /<img\b[\s\S]*?\bsrc=["'](\/img\/[^"']+)["']/g;
  for (const m of body.matchAll(reImg)) {
    if (rasterRe.test(m[1])) candidates.push({ idx: m.index!, url: m[1] });
  }

  candidates.sort((a, b) => a.idx - b.idx);
  return candidates[0]?.url ?? null;
}

function countImages(body: string): number {
  return (body.match(/!\[[^\]]*\]\(/g) ?? []).length;
}

function extractExcerpt(body: string): string {
  // Strip multi-line JSX/component bloky <Photo … />, <ZidovskeHodiny />, …
  // (uppercase první písmeno = MDX component, ne HTML tag).
  let cleaned = body.replace(/<[A-Z][\w]*\b[^>]*\/>/g, '');                                  // self-closing
  cleaned = cleaned.replace(/<[A-Z][\w]*\b[\s\S]*?\/>/g, '');                               // self-closing s breaky
  cleaned = cleaned.replace(/<[A-Z][\w]*\b[\s\S]*?>[\s\S]*?<\/[A-Z][\w]*>/g, '');           // párový

  // Vezmi první nenulový odstavec
  const lines = cleaned.split('\n');
  const paras: string[] = [];
  let buf: string[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (t === '') {
      if (buf.length) {
        paras.push(buf.join(' '));
        buf = [];
      }
    } else if (
      !t.startsWith('#') &&            // headings
      !t.startsWith('!') &&            // markdown image
      !t.startsWith('[!') &&           // image link
      !/^[\-\*]\s/.test(t) &&          // list item ("- " or "* ") — bold "**X**" zachytit
      !t.startsWith('<') &&            // raw HTML / JSX (Photo, ZidovskeHodiny, …)
      !/^import\s/.test(t) &&          // MDX import statementy
      !/^export\s/.test(t)             // MDX export
    ) {
      buf.push(t);
    }
  }
  if (buf.length) paras.push(buf.join(' '));
  const first = paras.find((p) => p.length > 50) ?? paras[0] ?? '';
  // Strip Markdown odkazy [text](url) → text
  const stripped = first.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_`]/g, '');
  return stripped.length > 220 ? stripped.slice(0, 217) + '…' : stripped;
}

function extractYear(title: string, body: string): number | null {
  const text = `${title} ${body.slice(0, 2000)}`;
  // Prioritizuj 4-místná čísla v rozumném rozmezí
  const matches = [...text.matchAll(/\b(1[3-9]\d\d|20[0-3]\d)\b/g)].map((m) => parseInt(m[1], 10));
  if (matches.length === 0) return null;
  // Nejdřívější rok = nejpravděpodobněji historický kontext
  return Math.min(...matches);
}

function countWords(body: string): number {
  return body.replace(/!\[[^\]]*\]\([^)]+\)/g, '').split(/\s+/).filter(Boolean).length;
}

async function main() {
  const files = (await readdir(CONTENT_DIR)).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
  const catalog: CatalogEntry[] = [];

  for (const file of files) {
    const path = join(CONTENT_DIR, file);
    const content = await readFile(path, 'utf-8');
    const { fm, body } = parseFrontmatter(content);

    const lastModifiedRaw = (fm.lastModified as string) ?? null;
    const lastModifiedISO = lastModifiedRaw
      ? (() => {
          const d = new Date(lastModifiedRaw);
          return Number.isNaN(d.getTime()) ? null : d.toISOString();
        })()
      : null;

    // Thumbnail: explicitní override z frontmatteru (pokud je) má přednost,
    // jinak vezme první vhodný obrázek z těla.
    const fmThumb = typeof fm.thumbnail === 'string' && fm.thumbnail.startsWith('/img/')
      ? (fm.thumbnail as string)
      : null;

    // Extract karta.vyrobce pokud existuje (typicky u sbírkových karet
    // s podsekce: 'karta'). Renderuje se jako kurzíva pod titulem v Card.
    const kartaObj = (fm.karta as { vyrobce?: string } | undefined) ?? undefined;
    const vyrobce =
      typeof kartaObj?.vyrobce === 'string' && kartaObj.vyrobce.trim().length > 0
        ? kartaObj.vyrobce.trim()
        : undefined;

    // Tagy a searchKeywords pro Fuse.js fuzzy search.
    // Tagy: existující whitelist v `data/tags.json` — articles už jsou
    // nataggované, jen nebyly v search indexu. SearchKeywords: nový
    // optional field pro synonyma / alternativní pravopisy (např. cizí
    // termíny "lihýř/foliot/wagonka", varianty pravopisu "Bychory/Býchory").
    const tags = Array.isArray(fm.tags)
      ? (fm.tags as unknown[]).filter((t): t is string => typeof t === 'string' && t.length > 0)
      : undefined;
    const searchKeywords = Array.isArray(fm.searchKeywords)
      ? (fm.searchKeywords as unknown[]).filter((t): t is string => typeof t === 'string' && t.length > 0)
      : undefined;

    const podsekce = typeof fm.podsekce === 'string' ? fm.podsekce : undefined;

    catalog.push({
      slug: (fm.slug as string) ?? file.replace(/\.(md|mdx)$/, ''),
      title: (fm.title as string) ?? file,
      category: (fm.category as string) ?? 'ostatni',
      ...(podsekce ? { podsekce } : {}),
      thumbnail: fmThumb ?? extractFirstImage(body),
      excerpt: extractExcerpt(body),
      year: extractYear((fm.title as string) ?? '', body),
      lastModified: lastModifiedISO,
      imageCount: countImages(body),
      wordCount: countWords(body),
      ...(vyrobce ? { vyrobce } : {}),
      ...(tags && tags.length ? { tags } : {}),
      ...(searchKeywords && searchKeywords.length ? { searchKeywords } : {}),
    });
  }

  catalog.sort((a, b) => a.title.localeCompare(b.title, 'cs'));

  await writeFile(OUT_PATH, JSON.stringify(catalog, null, 2), 'utf-8');

  // Mirror do src/data/ pro Astro import
  const ASTRO_DATA = join(ROOT, 'apps', 'hodinarium-eu', 'src', 'data', 'catalog.json');
  await writeFile(ASTRO_DATA, JSON.stringify(catalog, null, 2), 'utf-8');

  console.log(`=== Katalog vyroben ===`);
  console.log(`Záznamů:    ${catalog.length}`);
  console.log(`S obrázkem: ${catalog.filter((c) => c.thumbnail).length}`);
  console.log(`S rokem:    ${catalog.filter((c) => c.year).length}`);
  console.log(`Výstup:     ${OUT_PATH}`);

  // Distribuce per kategorie
  const byCat = catalog.reduce<Record<string, number>>((acc, c) => {
    acc[c.category] = (acc[c.category] ?? 0) + 1;
    return acc;
  }, {});
  console.log('\nKategorie:');
  for (const [cat, n] of Object.entries(byCat).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat.padEnd(15)} ${n}`);
  }

  // Distribuce per dekáda
  const byDecade = catalog
    .filter((c) => c.year)
    .reduce<Record<string, number>>((acc, c) => {
      const dec = Math.floor((c.year as number) / 10) * 10;
      acc[`${dec}s`] = (acc[`${dec}s`] ?? 0) + 1;
      return acc;
    }, {});
  console.log('\nDekády (top 10):');
  Object.entries(byDecade).sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([d, n]) => {
    console.log(`  ${d.padEnd(10)} ${n}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
