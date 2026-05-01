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
const IGNORE_FUZZY = args.includes('--ignore-fuzzy');

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
  photoFolder: string | null;    // /img/<path>/ if auto-detected
  photoFiles: string[];          // jpg/png filenames in folder
  isXPrefix: boolean;
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

/** Mapa detekce výrobce — regex → [tag, displayName] pro karta.vyrobce field */
const VYROBCE_MAP: Array<[RegExp, string, string]> = [
  [/prokeš/i, 'prokes', 'Jan Prokeš'],
  [/elektroča?s/i, 'elektrocas', 'Elektročas'],
  [/brillié|brillie/i, 'brillie', 'Brillié'],
  [/lenzkirch/i, 'lenzkirch', 'Lenzkirch'],
  [/wenzel mellner|w\. mellner/i, 'wenzel-mellner', 'Wenzel Mellner'],
  [/schaffhausen/i, 'schaffhausen', 'Schaffhausen'],
  [/bodet/i, 'bodet', 'Bodet'],
  [/pragotron/i, 'pragotron', 'Pragotron'],
  [/pulsynetic/i, 'pulsynetic', 'Pulsynetic'],
  [/bulle/i, 'bulle', 'Bulle'],
  [/iwc\b/i, 'iwc', 'IWC'],
  [/mobatime/i, 'mobatime', 'Mobatime'],
  [/meinberg/i, 'meinberg', 'Meinberg'],
  [/hainz/i, 'hainz', 'Hainz'],
  [/hiemann/i, 'hiemann', 'Hiemann'],
  [/michael christ/i, 'michael-christ', 'Michael Christ'],
  [/beitel/i, 'beitel', 'F. X. Beitel'],
  [/r\. liebing|liebing/i, 'liebing', 'Richard Liebing'],
  [/thöndel|thondel/i, 'thondel', 'Thöndel'],
  [/rochlitz/i, 'rochlitz', 'Rochlitz'],
  [/paul zieux|zieux/i, 'paul-zieux', 'Paul Zieux'],
  [/kohlert/i, 'kohlert', 'Kohlert'],
  [/krečmer|krecmer/i, 'krecmer', 'Krečmer'],
  [/achrer/i, 'achrer', 'Josef Achrer'],
  [/bassler/i, 'bassler', 'Friedrich Moritz Bassler'],
  [/junghans/i, 'junghans', 'Junghans'],
  [/hipp\b/i, 'hipp', 'Hipp'],
  [/wagner/i, 'wagner', 'Wagner'],
  [/kienzle/i, 'kienzle', 'Kienzle'],
  [/jednotn[íý] čas|jednotn[íý] cas/i, 'jednotny-cas', 'Jednotný čas'],
  [/manesov|maneš/i, 'manesova', 'Hodinářská rodina Manesova'],
  [/datumatic/i, 'datumatic', 'Datumatic'],
  [/solari/i, 'solari-udine', 'Solari Udine'],
];

/** Detekce vyrobce-tagu z popisu (extrahuje známá jména) */
function detectVyrobce(popis: string): string[] {
  const tags: string[] = [];
  for (const [re, tag] of VYROBCE_MAP) if (re.test(popis)) tags.push(tag);
  return tags;
}

/** Detekce display name výrobce (první match z VYROBCE_MAP) */
function detectVyrobceDisplay(popis: string): string | null {
  for (const [re, , display] of VYROBCE_MAP) if (re.test(popis)) return display;
  return null;
}

async function listExistingSlugs(): Promise<Set<string>> {
  const { readdirSync } = await import('node:fs');
  const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
  return new Set(files.map((f) => f.replace(/\.(md|mdx)$/, '')));
}

const PUBLIC_IMG = join(ROOT, 'apps', 'hodinarium-eu', 'public', 'img');

/** Pre-walk public/img/ rekurzivně, vrátí mapu folderPath → list image souborů. */
async function buildImageFolderIndex(): Promise<Map<string, string[]>> {
  const { readdirSync, statSync } = await import('node:fs');
  const index = new Map<string, string[]>();
  function walk(dir: string, relPath: string) {
    let entries: string[];
    try { entries = readdirSync(dir); } catch { return; }
    const images: string[] = [];
    for (const e of entries) {
      const full = join(dir, e);
      let stat;
      try { stat = statSync(full); } catch { continue; }
      if (stat.isDirectory()) walk(full, relPath ? `${relPath}/${e}` : e);
      else if (/\.(jpe?g|png|webp)$/i.test(e)) images.push(e);
    }
    if (images.length > 0) index.set(relPath, images);
  }
  walk(PUBLIC_IMG, '');
  return index;
}

/**
 * Heuristika: pokus o nalezení folderu s fotkami exponátu na základě
 * klíčových slov z popisu/výrobce. Vrátí nejlépe matchující folder
 * (s nejvíce slovy v cestě) nebo null.
 *
 * Stop-words: vezni, hodiny, stroj, ks (generické, nematch).
 */
const STOP_WORDS = new Set(['vezni', 'hodiny', 'hodinovy', 'stroj', 'ks',
  'malé', 'male', 'velké', 'velke', 'véžní', 'vezni', 'malou', 'a', 'i', 's', 'z']);
function detectPhotoFolder(
  popisSlug: string,
  vyrobceTag: string | null,
  index: Map<string, string[]>,
): { path: string; files: string[] } | null {
  const words = popisSlug.split('-').filter((w) => w.length >= 4 && !STOP_WORDS.has(w));
  if (vyrobceTag) words.unshift(vyrobceTag.split('-')[0]); // priorita pro výrobce
  if (words.length === 0) return null;

  let bestPath: string | null = null;
  let bestScore = 0;
  for (const [path, files] of index) {
    const lc = path.toLowerCase();
    let score = 0;
    for (const w of words) if (lc.includes(w)) score++;
    if (score >= 2 && score > bestScore) {
      bestScore = score;
      bestPath = path;
    }
  }
  if (!bestPath) return null;
  const files = (index.get(bestPath) ?? []).slice(0, 6);
  return { path: bestPath, files };
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
  const imageIndex = await buildImageFolderIndex();
  let withPhotos = 0;

  const proposed: ProposedAction[] = [];
  const allNewTags = new Set<string>();
  let conflicts = 0;
  let exists = 0;

  for (const e of items) {
    const popisSlug = slugify(e.popis);
    const proposedSlug = `inv-${e.invCislo}-${popisSlug}`;
    // X-prefix items (bez inv. č. v XLS) — title dostane prefix indikující
    // že je dočasná karta a vyžaduje doplnění. Pro standardní items zůstává
    // popis čistý.
    const isXPrefix = e.invCislo.startsWith('x');
    const titleForFm = isXPrefix
      ? `[K doplnění] ${e.popis} (inv. ${e.invCislo})`
      : e.popis;

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

    // Karta sbirky — direct named fields (přímé atributy místo extra[])
    const karta: Record<string, unknown> = {
      inventarniCislo: e.invCislo,
      umisteni: e.lokaceHuman,
    };
    // Datace — extract z popisu, hledá 4-digit year v plausibilním rozsahu
    // 1500–2029. Pokud nalezen, použijeme jako prostou string ("1884").
    // User může později upřesnit na širší období ("polovina 18. století").
    const rokMatch = e.popis.match(/\b(1[5-9]\d{2}|20[0-2]\d)\b/);
    if (rokMatch) karta.datace = rokMatch[1];
    // Výrobce — display name z VYROBCE_MAP
    const vyrobceDisplay = detectVyrobceDisplay(e.popis);
    if (vyrobceDisplay) karta.vyrobce = vyrobceDisplay;
    // Rok přírůstku do spolku (z XLS sloupce Rok)
    if (e.rok) karta.pridanoDoSbirky = e.rok;
    if (e.majitel) karta.majitel = e.majitel;
    if (e.vztah) karta.vztahKeSbirce = e.vztah;
    if (e.stav) karta.stav = e.stav;
    // Pole, která vyplní user ručně z Popisů strojů.doc:
    //   - datace (širší období, např. "polovina 18. století")
    //   - vyrobce (z popisu — ale popis je často "věžní Hiemann 1884" tj. název+rok)
    //   - signatura, provenience, puvodniUmisteni
    //   - konstrukční detaily (ram, krok, biciStroje, rozmery, kyvadlo, …)
    //   - darceZapujcitel (ne vždy = majitel)
    //   - restaurovani, adaptaceProVystavu
    //
    // Poznámku z XLS (typ. lokalita exponátu před koupí, vrácení atd.)
    // dáme do extra[] — není to standardní karta atribut.
    if (e.poznamka) {
      karta.extra = [{ label: 'Poznámka', value: e.poznamka }];
    }

    // Photo auto-detect — heuristika přes inverzní index public/img/
    const vyrobceTag = detectVyrobce(e.popis)[0] ?? null;
    const photoMatch = detectPhotoFolder(popisSlug, vyrobceTag, imageIndex);
    if (photoMatch) withPhotos++;

    const fm: Record<string, unknown> = {
      title: titleForFm,
      slug: proposedSlug,
      category: 'sbirka',
      podsekce: 'karta',  // discriminator → routes na /sbirka/karta/<slug>/
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
      photoFolder: photoMatch ? photoMatch.path : null,
      photoFiles: photoMatch ? photoMatch.files : [],
      isXPrefix,
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
  console.log(`S auto-detekovanou fotkou: ${withPhotos}`);
  console.log(`\nReport: ${OUT_REPORT}`);
  console.log(`Preview JSON: ${OUT_PREVIEW}`);

  if (APPLY) {
    console.log('\n=== --apply mode: skutečný zápis ===');
    let written = 0;
    let skipped = 0;
    let blocked = 0;
    for (const p of proposed) {
      if (p.exists) { skipped++; continue; }
      if (!IGNORE_FUZZY && p.conflicts.length > 0) { blocked++; continue; }
      // Reject pokud má nové tagy mimo whitelist (build by pak failnul)
      if (p.suggestedTagsNew.length > 0) { blocked++; continue; }

      const fmYaml = serializeFrontmatter(p.frontmatter);
      const body = buildStubBody(p);
      const content = `---\n${fmYaml}---\n${body}`;
      await writeFile(join(CONTENT_DIR, p.proposedFilename), content, 'utf-8');
      written++;
    }
    console.log(`Zapsáno:    ${written}`);
    console.log(`Přeskočeno (exists):  ${skipped}`);
    console.log(`Blokováno (konflikt nebo mimo-whitelist tagy): ${blocked}`);
  }
}

/**
 * Sestaví body stub karty:
 *   - hero photo + galerie (pokud nalezeny ve photo folderu) + warning
 *     o autodetekci
 *   - stub status text + TODO list polí k doplnění z Popisu strojů.doc
 */
function buildStubBody(p: ProposedAction): string {
  const lines: string[] = [];
  lines.push('');
  if (p.photoFiles.length > 0) {
    // První obrázek hero (auto-promote v JS), zbytek do galerie
    for (const f of p.photoFiles) {
      lines.push(`![](/img/${p.photoFolder}/${f})`);
      lines.push('');
    }
    lines.push(`*Fotky byly auto-detekovány z \`/img/${p.photoFolder}/\` na základě názvu exponátu. **Foto: archiv Českého spolku horologického**, není-li u konkrétního snímku uvedeno jinak. **Potvrďte, že jde o správné fotky tohoto exponátu, nebo je nahraďte; pokud znáte konkrétního autora fotografie, prosíme o doplnění atribuce.***`);
    lines.push('');
    lines.push('* * *');
    lines.push('');
  }
  lines.push('## Stub karty');
  lines.push('');
  if (p.isXPrefix) {
    lines.push(`Tato karta byla vyrobena ze Soupisu exponátů, ale chybí jí inventární číslo (XLS sloupec prázdný). Přiřaďte řádné inv. č. v Soupisu a re-generujte.`);
  } else {
    lines.push(`Tato karta byla **automaticky vygenerována ze Soupisu exponátů**. Obsahuje jen základní strojová data — vyplňte ručně z dokumentu \`zdroje/katalog exponátů/Popisy strojů.doc\`:`);
    lines.push('');
    lines.push('- `karta.datace` — širší období, pokud rok výroby není přesně doložen');
    lines.push('- `karta.signatura` — text signatury výrobce');
    lines.push('- `karta.puvodniUmisteni` — kostel / radnice / továrna kde byl stroj původně');
    lines.push('- `karta.ram`, `karta.krokJicihoStroje`, `karta.biciStroje`, `karta.rozmery`, `karta.kyvadlo`, `karta.ciselnik`, `karta.pohon` — konstrukční detaily');
    lines.push('- `karta.darceZapujcitel` — pokud nás stroj dosáhl přes jinou osobu/instituci než majitele');
    lines.push('- `karta.restaurovani` — kdy a kdo restauroval');
    lines.push('- `karta.adaptaceProVystavu` — co bylo upraveno pro expozici');
    lines.push('');
    lines.push('Po vyplnění odstraňte tuto poznámku a změňte `manualEdit: true` v frontmatteru.');
  }
  lines.push('');
  return lines.join('\n');
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
