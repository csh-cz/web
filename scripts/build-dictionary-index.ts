/**
 * Generuje JSON export slovníku pro AI agenty, MCP server a externí konzumenty.
 *
 * Výstup:
 *   - apps/hodinarium-eu/public/dictionary-index.json
 *
 * Schema per slug:
 *   {
 *     "ciselnik": {
 *       "lemma": "číselník",
 *       "lang": "cs",
 *       "conceptId": "HORO-DIAL-001",
 *       "kategorie": "mechanika",
 *       "varianty": [
 *         {"term": "číselník", "status": "preferred"},
 *         {"term": "ciferník", "status": "archaic", "note": "..."}
 *       ],
 *       "translations": {
 *         "de": [{"term": "Zifferblatt", "genus": "n"}],
 *         "en": [{"term": "dial"}, {"term": "clock face"}],
 *         "fr": [{"term": "cadran", "genus": "m"}]
 *       },
 *       "definice": "...",
 *       "vyznamy": [...] | null,
 *       "atestace": [...] | null,
 *       "isStub": false,
 *       "redirectTo": null,
 *       "pribuzne": ["hridelik-orloje", "ramenko"]
 *     }
 *   }
 *
 * Statický JSON v `public/` se servuje přes Cloudflare CDN cache na
 * `https://hodinarium-eu.pages.dev/dictionary-index.json`. Použití:
 * AI translation agent, MCP server (V2), terminology lint v jiných
 * tooling.
 *
 * Spouštět: `pnpm dict:build` (přidat do package.json scripts).
 * Idempotent — projde celý content/slovnik/ adresář a zapíše vždy.
 *
 * A.31 v TODO.md (návrh 2026-05-17).
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

/** Minimální frontmatter parser bez extra deps — split na ---/--- a YAML parse. */
export function parseFrontmatter(raw: string): Record<string, unknown> {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  return parseYaml(m[1]) as Record<string, unknown>;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const SLOVNIK_DIR = join(ROOT, 'content', 'slovnik');
const OUT = join(ROOT, 'apps', 'hodinarium-eu', 'public', 'dictionary-index.json');

export interface VariantaStruct {
  term: string;
  status: string;
  note?: string;
  doloženo?: string;
}

interface DictionaryEntry {
  lemma: string;
  lang: string;
  conceptId: string | null;
  kategorie: string;
  varianty: VariantaStruct[];
  translations: {
    de?: Array<Record<string, unknown>>;
    en?: Array<Record<string, unknown>>;
    fr?: Array<Record<string, unknown>>;
  };
  definice: string;
  vyznamy: Array<Record<string, unknown>> | null;
  atestace: Array<Record<string, unknown>> | null;
  pribuzne: string[];
  isStub: boolean;
  redirectTo: string | null;
}

/** Normalizuje varianta na strukturovaný formát (i z legacy string array). */
export function normalizeVarianta(v: unknown): VariantaStruct {
  if (typeof v === 'string') {
    return { term: v, status: 'admitted' };  // legacy default: admitted (nikoli preferred — preferred musí být explicit)
  }
  if (typeof v === 'object' && v !== null) {
    const obj = v as Record<string, unknown>;
    return {
      term: String(obj.term),
      status: String(obj.status),
      ...(obj.note ? { note: String(obj.note) } : {}),
      ...(obj['doloženo'] ? { 'doloženo': String(obj['doloženo']) } : {}),
    };
  }
  return { term: String(v), status: 'admitted' };
}

/** Spuštění jen pokud byl skript spuštěn přímo (ne importován z testů). */
const isMain = import.meta.url === `file://${process.argv[1]}`;

async function main() {
  const files = await readdir(SLOVNIK_DIR);
  const mdFiles = files.filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));

  const index: Record<string, DictionaryEntry> = {};
  let stubs = 0;
  let redirects = 0;
  let withConcept = 0;
  let withVyznamy = 0;
  let withAtestace = 0;

  for (const file of mdFiles) {
    const slug = file.replace(/\.(md|mdx)$/, '');
    const fullPath = join(SLOVNIK_DIR, file);
    const raw = await readFile(fullPath, 'utf-8');
    const data = parseFrontmatter(raw) as Record<string, unknown> & {
      title: string;
      kategorie: string;
      definice: string;
      conceptId?: string;
      varianty?: unknown[];
      prekladyDe?: Array<Record<string, unknown>>;
      prekladyEn?: Array<Record<string, unknown>>;
      prekladyFr?: Array<Record<string, unknown>>;
      vyznamy?: Array<Record<string, unknown>>;
      atestace?: Array<Record<string, unknown>>;
      pribuzne?: string[];
      isStub?: boolean;
      redirectTo?: string;
    };

    const varianty = (data.varianty ?? []).map(normalizeVarianta);
    const translations: DictionaryEntry['translations'] = {};
    if (data.prekladyDe) translations.de = data.prekladyDe;
    if (data.prekladyEn) translations.en = data.prekladyEn;
    if (data.prekladyFr) translations.fr = data.prekladyFr;

    const entry: DictionaryEntry = {
      lemma: data.title,
      lang: 'cs',
      conceptId: data.conceptId ?? null,
      kategorie: data.kategorie,
      varianty,
      translations,
      definice: data.definice,
      vyznamy: data.vyznamy ?? null,
      atestace: data.atestace ?? null,
      pribuzne: data.pribuzne ?? [],
      isStub: data.isStub === true,
      redirectTo: data.redirectTo ?? null,
    };

    index[slug] = entry;

    if (entry.isStub) stubs++;
    if (entry.redirectTo) redirects++;
    if (entry.conceptId) withConcept++;
    if (entry.vyznamy) withVyznamy++;
    if (entry.atestace) withAtestace++;
  }

  // Output: dictionary-index.json with meta
  const output = {
    _meta: {
      generated: new Date().toISOString(),
      count: Object.keys(index).length,
      stubs,
      redirects,
      withConceptId: withConcept,
      withVyznamy,
      withAtestace,
      schema_version: '1.0',
      description: 'Slovník hodinářské terminologie — Hodinárium. Pro AI agenty, MCP server, terminology lint.',
    },
    entries: index,
  };

  if (!existsSync(dirname(OUT))) {
    await mkdir(dirname(OUT), { recursive: true });
  }
  await writeFile(OUT, JSON.stringify(output, null, 2));
  const sizeKB = (JSON.stringify(output).length / 1024).toFixed(1);
  console.log(`✓ dictionary-index.json: ${Object.keys(index).length} hesel (${sizeKB} KB)`);
  console.log(`  stubs: ${stubs}, redirects: ${redirects}, conceptId: ${withConcept}, vyznamy: ${withVyznamy}, atestace: ${withAtestace}`);
}

if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
