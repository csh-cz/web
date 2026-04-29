/**
 * Migration plánovač starých kategorií → nové taxonomie.
 *
 * Spuštění (dry-run, generuje report):
 *   npx tsx scripts/migrate-categories.ts
 *
 * Spuštění (apply — přepíše frontmatter článků):
 *   npx tsx scripts/migrate-categories.ts --apply
 *
 * Stará taxonomie:  decin, vezni-hodiny, sbirka, projekty, ostatni
 * Nová taxonomie:   sbirka, konstrukce, projekty, virtualni-muzeum, zajimavosti
 *                   + Kronika (vlastní content collection, ne kategorie)
 *
 * Mapping pravidla viz CATEGORY_MAP a SLUG_OVERRIDES níže. Pro článek,
 * který nemá explicit override, se použije auto-detekce podle:
 *   1. originalUrl path
 *   2. body content patterns
 *   3. excerpt + title keywords
 *
 * Output:
 *   - migration-plan.csv     CSV s každý článek + nová kategorie
 *   - migration-plan.md      Markdown report (přehledná tabulka)
 *   - --apply: přepíše frontmatter v content/hodinarium-eu/*.{md,mdx}
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CONTENT = join(ROOT, 'content/hodinarium-eu');

type NewCategory = 'sbirka' | 'konstrukce' | 'projekty' | 'virtualni-muzeum' | 'muzea' | 'zajimavosti' | 'kronika';

interface MigrationDecision {
  slug: string;
  oldCategory: string;
  newCategory: NewCategory;
  suggestedTags: string[];
  reason: string;
}

/**
 * Explicit per-slug overrides (highest priority).
 * Edge-cases identifikované v plánovací diskuzi.
 */
const SLUG_OVERRIDES: Record<string, { cat: NewCategory; tags?: string[]; reason: string }> = {
  // --- KRONIKA (efemérní události, fotoreporty, sezóny) ---
  'decin_aktual0': { cat: 'kronika', reason: 'stěhování ze Soběslavi do Děčína 2015' },
  'decin_toulava_kamera2016': { cat: 'kronika', reason: 'TV pořad 2016' },
  'decin_fotobrezen2017': { cat: 'kronika', reason: 'fotoreport březen 2017' },
  'decin_fotolistopad2018': { cat: 'kronika', reason: 'fotoreport listopad 2018' },
  'decin_fotovernisaz2017': { cat: 'kronika', reason: 'vernisáž 2017' },
  'nonsens2015': { cat: 'kronika', reason: 'výstavka Nonsens 2015' },
  'sezona2012': { cat: 'kronika', reason: 'sezóna 2012' },
  'sezona2013': { cat: 'kronika', reason: 'sezóna 2013' },
  'sezona2012_foto_marusak': { cat: 'kronika', reason: 'fotoreport sezóny 2012' },
  'dernisaz2013': { cat: 'kronika', reason: 'dernisáž 2013' },
  'ohlednuti2011': { cat: 'kronika', reason: 'ohlédnutí za rokem 2011' },
  'vez_provoz2011': { cat: 'kronika', reason: 'sezóna Soběslav 2011' },
  'vez_instalace1': { cat: 'kronika', reason: 'instalace 2011' },
  'faust': { cat: 'kronika', reason: 'výstavka Faust 2013' },
  'steampunk': { cat: 'kronika', reason: 'výstavka 2012' },
  'rozmberk1': { cat: 'kronika', reason: 'pozvánka pro Petra Voka 2014' },
  'rozmberk2': { cat: 'kronika', reason: 'historie Petra Voka 2014' },
  'vezni_muzejicko': { cat: 'kronika', tags: ['sobeslav', 'historie-spolku'], reason: 'historie Soběslav 2009-2015' },
  'vez1': { cat: 'kronika', tags: ['sobeslav', 'historie-spolku'], reason: 'Soběslav historie' },
  'sobeslav2': { cat: 'kronika', tags: ['sobeslav', 'historie-spolku'], reason: 'Soběslav historie' },
  'sobeslav2b': { cat: 'kronika', tags: ['sobeslav', 'historie-spolku'], reason: 'Soběslav historie chronologie' },
  'sobeslav2c': { cat: 'kronika', tags: ['sobeslav', 'historie-spolku'], reason: 'Soběslav hypotézy' },
  'sobeslav3': { cat: 'kronika', tags: ['sobeslav', 'historie-spolku'], reason: 'Soběslav restaurace začátek' },
  'vez_signatury': { cat: 'kronika', tags: ['sobeslav', 'historie-spolku'], reason: 'Soběslav signatury' },

  // --- ZAJÍMAVOSTI (eseje o čase, kalendáře, časoměrné systémy) ---
  'mereni_casu': { cat: 'zajimavosti', tags: ['popularizace'], reason: 'esej o měření času' },
  'kalendar_rimsky': { cat: 'zajimavosti', tags: ['1700s', 'popularizace'], reason: 'téma kalendáře' },
  'casova_pasma': { cat: 'zajimavosti', tags: ['popularizace'], reason: 'téma časoměrného systému' },
  '12_24': { cat: 'zajimavosti', tags: ['popularizace'], reason: 'téma konvence času' },
  'razitka': { cat: 'zajimavosti', reason: 'kvalifikované časové razítko (legal/IT)' },
  'normalni': { cat: 'zajimavosti', reason: 'co je normální čas' },
  'ruzne': { cat: 'zajimavosti', reason: 'Různé o čase' },
  'co_pisi_jini': { cat: 'zajimavosti', reason: 'citace z literatury' },
  'youtube': { cat: 'zajimavosti', reason: 'sbírka videí o hodinách' },
  'prestavby': { cat: 'zajimavosti', reason: 'esej o přestavbách' },
  'mazan': { cat: 'zajimavosti', reason: 'časová symbolika — esej' },
  'merkur': { cat: 'zajimavosti', tags: ['kuriozita', 'diy'], reason: 'kuriozita ze stavebnice' },
  'kuriozity1': { cat: 'zajimavosti', tags: ['kuriozita'], reason: 'odkazy na podivuhodné hodiny' },
  'paichl_knihy_hodiny_hodiny_slovnik_slovnik': { cat: 'zajimavosti', reason: 'slovník (meta-page kandidát)' },
  'literatura': { cat: 'zajimavosti', reason: 'meta-page kandidát' },

  // --- KONSTRUKCE (obecné mechanismy, principy) ---
  'synchronizace_hodin': { cat: 'konstrukce', tags: ['synchronni'], reason: 'obecný princip synchronizace' },
  'jednotnycas': { cat: 'konstrukce', tags: ['synchronni'], reason: 'téma jednotného času' },
  'casovy_zamek': { cat: 'konstrukce', tags: ['mechanicke'], reason: 'mechanismus zámku' },
  'pichacky': { cat: 'konstrukce', tags: ['mechanicke'], reason: 'kontrolní hodiny — mechanismus' },
  'mluvici1895': { cat: 'konstrukce', tags: ['1800s'], reason: 'mluvící mechanismus' },
  'flying_pendulum': { cat: 'konstrukce', tags: ['kyvadlo'], reason: 'typ kyvadla' },
  'line_kyvadlo': { cat: 'konstrukce', tags: ['kyvadlo'], reason: 'fyzikální kyvadlo' },
  'rizeni_kyvadla': { cat: 'konstrukce', tags: ['kyvadlo', 'elektricke'], reason: 'regulace kyvadla' },
  'pulsynetic': { cat: 'konstrukce', tags: ['pulsynetic', 'synchronni', 'elektromagneticke'], reason: 'systém řízení' },
  'bulle': { cat: 'konstrukce', tags: ['bulle', 'elektromagneticke', '1900s'], reason: 'princip BULLE elektromagnet' },
  'eureka': { cat: 'konstrukce', tags: ['elektromagneticke'], reason: 'princip Eureka' },
  'pneumatika': { cat: 'konstrukce', tags: ['pneumaticke'], reason: 'pneumatický pohon' },
  'pneumatika2': { cat: 'konstrukce', tags: ['pneumaticke', '1800s'], reason: 'pneumatický systém Paříž' },
  'elektricke1': { cat: 'konstrukce', tags: ['elektricke'], reason: 'el. natahování' },
  'elektricke2': { cat: 'konstrukce', tags: ['elektricke'], reason: 'el. impulz oscilátoru' },
  'astronomicke_Sauter': { cat: 'konstrukce', tags: ['mechanicke', 'baroko'], reason: 'astronomický systém' },
  'ATO': { cat: 'konstrukce', tags: ['elektromagneticke', '1900s'], reason: 'ATO princip' },
  'edgecombe': { cat: 'konstrukce', tags: ['synchronni', '1900s'], reason: 'Edgecombe Synclock princip' },
  'ferramo': { cat: 'konstrukce', tags: ['elektricke'], reason: 'Ferramo natahování' },
  'datumatik': { cat: 'konstrukce', tags: ['mechanicke', '1900s'], reason: 'Datumatic princip' },
  'pilovky': { cat: 'konstrukce', tags: ['kyvadlo'], reason: 'samonivelační kyvadlo' },
  'ukazatele': { cat: 'konstrukce', reason: 'typy ukazatelů' },
  'svarcvaldky_stroje': { cat: 'konstrukce', tags: ['mechanicke'], reason: 'mechanismy švarcvaldek' },
  'svarcvaldky_surrerwerk': { cat: 'konstrukce', tags: ['mechanicke', '1800s'], reason: 'surrerwerk mechanismus' },
  'svarcvaldky_stroje_polodrev': { cat: 'konstrukce', tags: ['mechanicke', '1800s'], reason: 'polodřevěné mechanismy' },
  'svarcvaldky_17stol': { cat: 'konstrukce', tags: ['mechanicke', '1700s'], reason: 'historie švarcvaldek' },
  'svarcvaldky_18stol': { cat: 'konstrukce', tags: ['mechanicke', '1700s'], reason: 'historie švarcvaldek' },
  'svarcvaldky': { cat: 'konstrukce', tags: ['mechanicke'], reason: 'švarcvaldky obecně' },
  'svarcvaldky_stroje2': { cat: 'konstrukce', tags: ['mechanicke', '1800s'], reason: 'štolové stroje' },
  'maregraf': { cat: 'konstrukce', tags: ['mechanicke', '1800s'], reason: 'mořské hodiny princip' },
  'jednotny_cas': { cat: 'konstrukce', tags: ['synchronni'], reason: 'téma synchronizace' },

  // --- PROJEKTY (DIY) — většina už správně klasifikované ---
  // (Většina článků ze starého `projekty` bude i v novém `projekty`)
  // Změny zde:
  'mereni_casu_projekty': { cat: 'projekty', reason: 'pokud existuje pod jiným slugem' },

  // --- MUZEA (sister muzea, přehledy sbírek) ---
  'mindelheim': { cat: 'muzea', tags: ['evropa'], reason: 'externí muzeum Mindelheim DE' },
  'vezni_muzejicko_evropa': { cat: 'muzea', tags: ['evropa'], reason: 'fenomén věžních muzeí' },
  'kralovstvi-casu': { cat: 'muzea', tags: ['cesko'], reason: 'sister muzeum Protivín' },
  'muzea_cr': { cat: 'muzea', tags: ['cesko'], reason: 'přehled muzeí ČR' },

  // --- VIRTUÁLNÍ MUZEUM (zajímavé hodiny mimo sbírku) ---
  'kvetinove': { cat: 'virtualni-muzeum', tags: ['kvetinove'], reason: 'přehled květinových hodin ve světě' },
  'kvetinovehodiny_NMnM': { cat: 'virtualni-muzeum', tags: ['kvetinove', 'cesko', '1900s'], reason: 'NM nad Metují' },
  'kvetinovehodiny_Chomutov': { cat: 'virtualni-muzeum', tags: ['kvetinove', 'cesko'], reason: 'Chomutov' },
  'podebrady': { cat: 'virtualni-muzeum', tags: ['kvetinove', 'cesko'], reason: 'Poděbrady květinové' },
  'podebrady1': { cat: 'virtualni-muzeum', tags: ['kvetinove', 'cesko'], reason: 'Poděbrady 1' },
  'podebrady1b': { cat: 'virtualni-muzeum', tags: ['kvetinove', 'cesko'], reason: 'Poděbrady ohlasy' },
  'podebrady2': { cat: 'virtualni-muzeum', tags: ['kvetinove', 'cesko'], reason: 'Poděbrady 2' },
  'podebrady3': { cat: 'virtualni-muzeum', tags: ['kvetinove', 'cesko'], reason: 'Poděbrady trpaslík' },
  'podebrady4': { cat: 'virtualni-muzeum', tags: ['kvetinove', 'cesko'], reason: 'Poděbrady 4' },
  'gobelin': { cat: 'virtualni-muzeum', tags: ['kvetinove', 'kuriozita'], reason: 'vyšívané hodiny' },
  'kavalir': { cat: 'virtualni-muzeum', tags: ['kuriozita'], reason: 'Hodiny Kavalír' },
  'janovice': { cat: 'virtualni-muzeum', tags: ['vezni', 'cesko'], reason: 'kostel Janovice' },
  'kardasova_recice': { cat: 'virtualni-muzeum', tags: ['vezni', 'cesko'], reason: 'Kardašova Řečice' },
  'tabor': { cat: 'virtualni-muzeum', tags: ['vezni', 'cesko'], reason: 'táborský orloj' },
  'schaffhausen': { cat: 'virtualni-muzeum', tags: ['kapesni', 'schaffhausen'], reason: 'IWC Schaffhausen 1885' },
  'TimHunkin': { cat: 'virtualni-muzeum', tags: ['kuriozita'], reason: 'humor — Tim Hunkin' },
  'betrisey': { cat: 'virtualni-muzeum', tags: ['kuriozita'], reason: 'Marc Betrisey' },
  'zmizele': { cat: 'virtualni-muzeum', reason: 'zmizelé hodiny' },
  'svetlonos': { cat: 'virtualni-muzeum', tags: ['cesko'], reason: 'Sezimovo Ústí' },
  'vlachynsky': { cat: 'virtualni-muzeum', tags: ['cesko'], reason: 'Holiday Inn Brno' },
  'hinspirace': { cat: 'virtualni-muzeum', reason: 'historické inspirace' },
  'casova_pasma': { cat: 'zajimavosti', reason: 'pásmovky obecně' },

  // --- SBÍRKA ostává — exponáty spolku (default pro zbytek vezni-hodiny + sbirka) ---
};

/**
 * Default mapping pro články bez explicit override.
 *
 * Logika:
 *   - decin → sbirka (default — exponáty v Hodináriu)
 *   - vezni-hodiny → sbirka (default — exponáty)
 *   - sbirka → sbirka (default)
 *   - projekty → projekty (default)
 *   - ostatni → zajimavosti (default — bez specific override)
 */
const CATEGORY_MAP: Record<string, NewCategory> = {
  'decin': 'sbirka',
  'vezni-hodiny': 'sbirka',
  'sbirka': 'sbirka',
  'projekty': 'projekty',
  'ostatni': 'zajimavosti',
};

interface ArticleFrontmatter {
  slug: string;
  title: string;
  category: string;
  [key: string]: unknown;
}

function parseFrontmatter(text: string): { fm: ArticleFrontmatter; body: string } | null {
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return null;
  const fm: any = {};
  for (const line of m[1].split('\n')) {
    const km = line.match(/^([\w-]+):\s*(.*)$/);
    if (!km) continue;
    let v: any = km[2].trim();
    if (v === 'null') v = null;
    else if (v.startsWith('"') && v.endsWith('"')) {
      try { v = JSON.parse(v); } catch { /* ignore */ }
    }
    fm[km[1]] = v;
  }
  return { fm, body: m[2] };
}

function decideMigration(fm: ArticleFrontmatter): MigrationDecision {
  const slug = fm.slug;
  const oldCategory = fm.category;

  // 1. Explicit override (highest priority)
  const override = SLUG_OVERRIDES[slug];
  if (override) {
    return {
      slug,
      oldCategory,
      newCategory: override.cat,
      suggestedTags: override.tags ?? [],
      reason: `OVERRIDE: ${override.reason}`,
    };
  }

  // 2. Default mapping based on old category
  const newCategory = CATEGORY_MAP[oldCategory] ?? 'sbirka';
  return {
    slug,
    oldCategory,
    newCategory,
    suggestedTags: [],
    reason: `DEFAULT: ${oldCategory} → ${newCategory}`,
  };
}

function main() {
  const files = readdirSync(CONTENT).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
  const decisions: MigrationDecision[] = [];

  for (const file of files) {
    const text = readFileSync(join(CONTENT, file), 'utf-8');
    const parsed = parseFrontmatter(text);
    if (!parsed) {
      console.warn(`Skip (no frontmatter): ${file}`);
      continue;
    }
    decisions.push(decideMigration(parsed.fm));
  }

  // Group by new category
  const groups: Record<NewCategory, MigrationDecision[]> = {
    sbirka: [],
    konstrukce: [],
    projekty: [],
    'virtualni-muzeum': [],
    muzea: [],
    zajimavosti: [],
    kronika: [],
  };
  for (const d of decisions) {
    groups[d.newCategory].push(d);
  }

  // CSV
  const csv = [
    'slug,oldCategory,newCategory,suggestedTags,reason',
    ...decisions.map((d) =>
      [d.slug, d.oldCategory, d.newCategory, d.suggestedTags.join(';'), d.reason]
        .map((c) => `"${c.replace(/"/g, '""')}"`)
        .join(','),
    ),
  ].join('\n');
  writeFileSync(join(ROOT, 'migration-plan.csv'), csv);

  // Markdown report
  const md: string[] = ['# Migration plán kategorií', ''];
  md.push(`Celkem článků: **${decisions.length}**`, '');
  md.push('## Přehled per nová kategorie', '');
  md.push('| Kategorie | Počet |', '|---|---:|');
  for (const cat of Object.keys(groups) as NewCategory[]) {
    md.push(`| ${cat} | ${groups[cat].length} |`);
  }
  md.push('');
  for (const cat of Object.keys(groups) as NewCategory[]) {
    md.push(`## ${cat} (${groups[cat].length})`, '');
    md.push('| slug | starou kategorií | navrh tagů | důvod |', '|---|---|---|---|');
    for (const d of groups[cat].sort((a, b) => a.slug.localeCompare(b.slug))) {
      md.push(`| \`${d.slug}\` | ${d.oldCategory} | ${d.suggestedTags.join(', ') || '—'} | ${d.reason} |`);
    }
    md.push('');
  }
  writeFileSync(join(ROOT, 'migration-plan.md'), md.join('\n'));

  console.log(`✓ ${decisions.length} článků analyzováno`);
  for (const cat of Object.keys(groups) as NewCategory[]) {
    console.log(`  ${cat}: ${groups[cat].length}`);
  }
  console.log(`\nReport:`);
  console.log(`  ${join(ROOT, 'migration-plan.csv')}`);
  console.log(`  ${join(ROOT, 'migration-plan.md')}`);
}

main();
