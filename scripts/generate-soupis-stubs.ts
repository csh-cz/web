/**
 * Generátor stubů /sbirka/inv-NNN-<slug>/ z parsed Soupisu exponátů.
 *
 * Modes:
 *   default (dry-run): pouze report — co by se stalo, neplatí žádný file write
 *   --apply:           skutečně zapíše .md soubory + report o konfliktech
 *   --tags-only:       jen vytiskne navržené nové tagy do whitelistu
 *
 * Vstup:  apps/hodinarium-eu/src/data/soupis-exponatu.json (z pnpm soupis:parse)
 * Výstup (dry-run):
 *   tmp/soupis-stuby-preview.json  — proposed actions per item
 *   tmp/soupis-stuby-report.md     — markdown report pro review
 *
 * Run:
 *   pnpm soupis:stuby              # dry-run
 *   pnpm soupis:stuby -- --apply   # actually write files
 */
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const SOUPIS_PATH = join(ROOT, 'apps', 'hodinarium-eu', 'src', 'data', 'soupis-exponatu.json');
const TAGS_PATH = join(ROOT, 'apps', 'hodinarium-eu', 'src', 'data', 'tags.json');
const CONTENT_DIR = join(ROOT, 'content', 'hodinarium-eu');
const OUT_PREVIEW = join(ROOT, 'tmp', 'soupis-stuby-preview.json');
const OUT_REPORT = join(ROOT, 'tmp', 'soupis-stuby-report.md');

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');

interface Exponat {
  invCislo: string;
  invCisloNumeric: number | null;
  popis: string;
  typ: string;
  rok: string;
  majitel: string;
  stav: string;
  vztah: string;
  poznamka: string;
  lokace: string;
  lokaceHuman: string;
  mistnost: string;
}

interface ProposedAction {
  inv: string;
  popis: string;
  proposedSlug: string;
  proposedFilename: string;
  conflicts: string[];           // existing slugs that look related
  exists: boolean;               // exact filename match
  frontmatter: Record<string, unknown>;
  suggestedTagsWhitelisted: string[];
  suggestedTagsNew: string[];    // need whitelist add
}

function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** Detekce typ-tagu z popisu */
function detectTyp(popis: string): string[] {
  const tags: string[] = [];
  const lc = popis.toLowerCase();
  const map: Array<[RegExp, string]> = [
    [/\bvěžn[íý]/, 'vezni'],
    [/\bkapesn[íý]/, 'kapesni'],
    [/\bnáramkov[éý]/, 'naramkove'],
    [/\bnástěnn[éý]/, 'nastenne'],
    [/\bstoln[íý]/, 'stolni'],
    [/\bsluneční/, 'slunecni'],
    [/\bvodní/, 'vodni'],
    [/\bpísečn[íý]/, 'pisecne'],
    [/\bkvětinov[éý]/, 'kvetinove'],
    [/\bdecimáln[íý]|decimal/, 'decimalka'],
    [/\batomov[éý]/, 'atomove'],
    [/\bbudík/, 'budik'],
  ];
  for (const [re, tag] of map) if (re.test(lc)) tags.push(tag);
  return tags;
}

/** Detekce stav-tagu (z XLS sloupce + popisu) */
function detectStav(stavCol: string, popis: string): string[] {
  const tags: string[] = [];
  const lc = (stavCol + ' ' + popis).toLowerCase();
  if (/\bfunkčn[íý]/.test(lc)) tags.push('funkcni');
  else if (/\bnefunkčn[íý]/.test(lc)) tags.push('nefunkcni');
  if (/\btorzo\b/.test(lc)) tags.push('torzo');
  if (/\brepliky?\b|\brepliků?/.test(lc)) tags.push('replika');
  if (/\brestaurován/.test(lc)) tags.push('restaurovane');
  if (/\bnálezov[éý]/.test(lc)) tags.push('nalezovy');
  if (/\bpřed restaurován/.test(lc)) tags.push('pred-restaurovanim');
  return tags;
}

/** Detekce krok-tagu z XLS Typ col */
function detectKrok(typCol: string): string[] {
  const tags: string[] = [];
  const lc = typCol.toLowerCase();
  const map: Array<[RegExp, string]> = [
    [/graham/, 'krok-graham'],
    [/amant/, 'krok-amant'],
    [/špindl|spindl|vřeten|vreten/, 'krok-vreteno'],
    [/clement|clément/, 'krok-clement'],
    [/hipp/, 'krok-hipp'],
    [/winnerl/, 'krok-winnerl'],
    [/kotvov/, 'krok-kotva'],
    [/benoit.+robert|benoît.+robert/, 'krok-benoit-robert'],
    [/kolíčk|kolick/, 'krok-kolicek'],
    [/lihýř|lihyr/, 'krok-lihyr'],
  ];
  for (const [re, tag] of map) if (re.test(lc)) tags.push(tag);
  return tags;
}

/** Detekce vyrobce-tagu z popisu (extrahuje známá jména) */
function detectVyrobce(popis: string): string[] {
  const tags: string[] = [];
  const lc = popis.toLowerCase();
  const map: Array<[RegExp, string]> = [
    [/prokeš/, 'prokes'],
    [/elektroča?s/, 'elektrocas'],
    [/brillié|brillie/, 'brillie'],
    [/lenzkirch/, 'lenzkirch'],
    [/wenzel mellner|w\. mellner/, 'wenzel-mellner'],
    [/schaffhausen/, 'schaffhausen'],
    [/bodet/, 'bodet'],
    [/pragotron/, 'pragotron'],
    [/pulsynetic/, 'pulsynetic'],
    [/bulle/, 'bulle'],
    [/iwc\b/, 'iwc'],
    [/mobatime/, 'mobatime'],
    [/meinberg/, 'meinberg'],
    [/hainz/, 'hainz'],
    [/hiemann/, 'hiemann'],
    [/michael christ/, 'michael-christ'],
    [/beitel/, 'beitel'],
    [/r\. liebing|liebing/, 'liebing'],
    [/thöndel|thondel/, 'thondel'],
    [/rochlitz/, 'rochlitz'],
    [/paul zieux|zieux/, 'paul-zieux'],
    [/kohlert/, 'kohlert'],
    [/krečmer|krecmer/, 'krecmer'],
    [/achrer/, 'achrer'],
    [/bassler/, 'bassler'],
    [/junghans/, 'junghans'],
    [/hipp\b/, 'hipp'],
    [/wagner/, 'wagner'],
    [/kienzle/, 'kienzle'],
    [/jednotn[íý] čas|jednotn[íý] cas/, 'jednotny-cas'],
    [/manesov|maneš/, 'manesova'],
    [/datumatic/, 'datumatic'],
    [/solari/, 'solari-udine'],
  ];
  for (const [re, tag] of map) if (re.test(lc)) tags.push(tag);
  return tags;
}

async function listExistingSlugs(): Promise<Set<string>> {
  const { readdirSync } = await import('node:fs');
  const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
  return new Set(files.map((f) => f.replace(/\.(md|mdx)$/, '')));
}

async function main() {
  const items = JSON.parse(await readFile(SOUPIS_PATH, 'utf-8')) as Exponat[];
  const tagsWl = JSON.parse(await readFile(TAGS_PATH, 'utf-8')) as Record<string, string[] | unknown>;
  const allWhitelist = new Set<string>();
  for (const [k, v] of Object.entries(tagsWl)) {
    if (k === '_meta') continue;
    if (Array.isArray(v)) for (const t of v) allWhitelist.add(t);
  }
  const existingSlugs = await listExistingSlugs();

  const proposed: ProposedAction[] = [];
  const allNewTags = new Set<string>();
  let conflicts = 0;
  let exists = 0;

  for (const e of items) {
    const popisSlug = slugify(e.popis);
    const proposedSlug = `inv-${e.invCislo}-${popisSlug}`;

    // Detekce existujícího článku — exact slug match v content/
    const existsExact = existingSlugs.has(proposedSlug);

    // Fuzzy match — popis-only slug (without inv prefix) might already exist
    const fuzzyMatches: string[] = [];
    for (const exSlug of existingSlugs) {
      // Skip overly short matches
      if (exSlug.length < 5) continue;
      // Match if existing slug contains main words from popis or vice-versa
      const exSlugLc = exSlug.toLowerCase();
      const words = popisSlug.split('-').filter((w) => w.length > 4);
      const matches = words.filter((w) => exSlugLc.includes(w));
      if (matches.length >= Math.min(2, words.length)) {
        fuzzyMatches.push(exSlug);
      }
    }

    const allTags = [
      e.lokace,
      ...detectTyp(e.popis),
      ...detectStav(e.stav, e.popis),
      ...detectKrok(e.typ),
      ...detectVyrobce(e.popis),
    ];
    const uniqueTags = [...new Set(allTags)];
    const inWhitelist = uniqueTags.filter((t) => allWhitelist.has(t));
    const newTags = uniqueTags.filter((t) => !allWhitelist.has(t));
    for (const t of newTags) allNewTags.add(t);

    // Karta sbirky — co dáme do frontmatteru
    const karta: Record<string, unknown> = {};
    if (e.rok) karta.datace = e.rok;
    if (e.poznamka) karta.poznamka = e.poznamka;
    karta.extra = [
      { label: 'Inventární číslo', value: e.invCislo },
      { label: 'Lokace', value: e.lokaceHuman },
      ...(e.majitel ? [{ label: 'Majitel', value: e.majitel }] : []),
      ...(e.vztah ? [{ label: 'Vztah ke sbírce', value: e.vztah }] : []),
      ...(e.stav ? [{ label: 'Stav', value: e.stav }] : []),
    ];

    const fm: Record<string, unknown> = {
      title: e.popis,
      slug: proposedSlug,
      category: 'sbirka',
      originalUrl: 'https://hodinarium-eu.pages.dev/sbirka/katalog',
      lastModified: null,
      sourceCharset: 'utf-8',
      scrapedAt: new Date().toISOString(),
      manualEdit: false,
      author: 'Český spolek horologický',
      tags: inWhitelist,
      karta,
    };

    if (existsExact) exists++;
    if (fuzzyMatches.length > 0) conflicts++;

    proposed.push({
      inv: e.invCislo,
      popis: e.popis,
      proposedSlug,
      proposedFilename: `${proposedSlug}.md`,
      conflicts: fuzzyMatches,
      exists: existsExact,
      frontmatter: fm,
      suggestedTagsWhitelisted: inWhitelist,
      suggestedTagsNew: newTags,
    });
  }

  await mkdir(join(ROOT, 'tmp'), { recursive: true });
  await writeFile(OUT_PREVIEW, JSON.stringify(proposed, null, 2), 'utf-8');

  // Markdown report
  const lines: string[] = [];
  lines.push('# Soupis exponátů — návrh stubů (dry-run)');
  lines.push('');
  lines.push(`Celkem položek: ${proposed.length}`);
  lines.push(`Slug-exact match s existující kartou: **${exists}**`);
  lines.push(`Pravděpodobný fuzzy konflikt s existující kartou: **${conflicts}**`);
  lines.push(`Položek bez konfliktů (ke generaci): **${proposed.length - exists - conflicts}** (přibližně)`);
  lines.push('');
  lines.push('## Tagy navrhované, které NEjsou ve whitelistu');
  lines.push('');
  lines.push('Tyhle musí editor přidat do `apps/hodinarium-eu/src/data/tags.json` před `--apply`:');
  lines.push('');
  for (const t of [...allNewTags].sort()) {
    lines.push(`- \`${t}\``);
  }
  lines.push('');
  lines.push('## Položky s pravděpodobnými konflikty (existující karty)');
  lines.push('');
  lines.push('| inv. č. | Popis | Existující slug(y) |');
  lines.push('|---|---|---|');
  for (const p of proposed.filter((p) => p.conflicts.length > 0)) {
    lines.push(`| ${p.inv} | ${p.popis} | ${p.conflicts.map((c) => `\`${c}\``).join(', ')} |`);
  }
  lines.push('');
  lines.push('## Sample preview — prvních 20 stubů');
  lines.push('');
  for (const p of proposed.slice(0, 20)) {
    lines.push(`### inv. ${p.inv} — ${p.popis}`);
    lines.push('');
    lines.push(`Soubor: \`content/hodinarium-eu/${p.proposedFilename}\``);
    if (p.exists) lines.push('⚠ **Soubor již existuje — bude přeskočen.**');
    if (p.conflicts.length > 0) lines.push(`⚠ Možný konflikt s: ${p.conflicts.map((c) => `\`${c}\``).join(', ')}`);
    lines.push('');
    lines.push('```yaml');
    lines.push('---');
    for (const [k, v] of Object.entries(p.frontmatter)) {
      if (typeof v === 'string') lines.push(`${k}: "${v}"`);
      else if (Array.isArray(v)) {
        lines.push(`${k}:`);
        for (const item of v) lines.push(`  - ${typeof item === 'string' ? item : JSON.stringify(item)}`);
      } else if (v && typeof v === 'object') {
        lines.push(`${k}:`);
        for (const [k2, v2] of Object.entries(v)) {
          if (Array.isArray(v2)) {
            lines.push(`  ${k2}:`);
            for (const item of v2) lines.push(`    - ${JSON.stringify(item)}`);
          } else {
            lines.push(`  ${k2}: ${JSON.stringify(v2)}`);
          }
        }
      } else {
        lines.push(`${k}: ${JSON.stringify(v)}`);
      }
    }
    lines.push('---');
    lines.push('```');
    lines.push('');
  }

  await writeFile(OUT_REPORT, lines.join('\n'), 'utf-8');

  console.log(`=== Dry-run report ===`);
  console.log(`Položek celkem:            ${proposed.length}`);
  console.log(`Exact slug match (skip):   ${exists}`);
  console.log(`Fuzzy konflikt:            ${conflicts}`);
  console.log(`Nové tagy potřebné:        ${allNewTags.size}`);
  console.log(`\nReport: ${OUT_REPORT}`);
  console.log(`Preview JSON: ${OUT_PREVIEW}`);

  if (APPLY) {
    console.log('\n=== --apply mode: skutečný zápis ===');
    let written = 0;
    let skipped = 0;
    let blocked = 0;
    for (const p of proposed) {
      if (p.exists) { skipped++; continue; }
      if (p.conflicts.length > 0) { blocked++; continue; }
      // Reject pokud má nové tagy mimo whitelist (build by pak failnul)
      if (p.suggestedTagsNew.length > 0) { blocked++; continue; }

      const fmYaml = serializeFrontmatter(p.frontmatter);
      const body = `\n*Stub vyrobený ze Soupisu exponátů (${new Date().toISOString().slice(0, 10)}). Doplňte popis ručně z původních článků nebo z dokumentu \`zdroje/katalog exponátů/Popisy strojů.doc\`.*\n`;
      const content = `---\n${fmYaml}---\n${body}`;
      await writeFile(join(CONTENT_DIR, p.proposedFilename), content, 'utf-8');
      written++;
    }
    console.log(`Zapsáno:    ${written}`);
    console.log(`Přeskočeno (exists):  ${skipped}`);
    console.log(`Blokováno (konflikt nebo mimo-whitelist tagy): ${blocked}`);
  }
}

function serializeFrontmatter(fm: Record<string, unknown>): string {
  const lines: string[] = [];
  for (const [k, v] of Object.entries(fm)) {
    if (v === null) lines.push(`${k}: null`);
    else if (typeof v === 'string') lines.push(`${k}: ${JSON.stringify(v)}`);
    else if (typeof v === 'boolean' || typeof v === 'number') lines.push(`${k}: ${v}`);
    else if (Array.isArray(v)) {
      if (v.length === 0) lines.push(`${k}: []`);
      else {
        lines.push(`${k}:`);
        for (const item of v) {
          if (typeof item === 'string') lines.push(`  - ${item}`);
          else if (item && typeof item === 'object') {
            const entries = Object.entries(item);
            if (entries.length === 0) continue;
            lines.push(`  - ${entries.map(([k2, v2]) => `${k2}: ${JSON.stringify(v2)}`).join(', ')}`);
          }
        }
      }
    } else if (v && typeof v === 'object') {
      lines.push(`${k}:`);
      for (const [k2, v2] of Object.entries(v)) {
        if (Array.isArray(v2)) {
          lines.push(`  ${k2}:`);
          for (const item of v2) {
            if (item && typeof item === 'object') {
              const entries = Object.entries(item);
              lines.push(`    - { ${entries.map(([k3, v3]) => `${k3}: ${JSON.stringify(v3)}`).join(', ')} }`);
            }
          }
        } else {
          lines.push(`  ${k2}: ${JSON.stringify(v2)}`);
        }
      }
    }
  }
  return lines.join('\n') + '\n';
}

main().catch((e) => { console.error(e); process.exit(1); });
