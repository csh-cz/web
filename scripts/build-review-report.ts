/**
 * build-review-report.ts — generuje apps/hodinarium-eu/src/data/_review.json
 *
 * Sken content/ pro karty/články/medailony co potřebují review:
 *   - karty bez typového tagu
 *   - karty bez thumbnail
 *   - karty bez vyrobce / umisteni
 *   - karty s "[K doplnění]" placeholder titulkem
 *   - krátké články (<200 slov)
 *   - články s legacy /clanky/ inline odkazy
 *   - krátké medailony hodinářů
 *   - hodináři bez portrétu
 *   - kronika gap roky
 *   - macOS Finder duplicates
 *
 * Stránka /redakce/ načte JSON a vyrendere admin dashboard.
 *
 * Spouští se před `astro build` (viz package.json — `prebuild` hook
 * nebo zahrnut v `build` scriptu).
 *
 * Usage: tsx scripts/build-review-report.ts
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, basename, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// tsx@4 transpiluje na CJS → `import.meta.dirname` je undefined; fileURLToPath
// na `import.meta.url` funguje v ESM i CJS-via-tsx.
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONTENT_HE = join(ROOT, 'content', 'hodinarium-eu');
const CONTENT_HOD = join(ROOT, 'content', 'hodinari');
const CONTENT_KRO = join(ROOT, 'content', 'kronika');
const OUT = join(ROOT, 'apps', 'hodinarium-eu', 'src', 'data', '_review.json');

const EXISTING_TYPY = new Set([
  'vezni','kapesni','naramkove','nastenne','stolni','slunecni','vodni',
  'pisecne','kvetinove','decimalka','atomove','budik','sitovky',
  'jednotny-cas','pichacky','digi',
]);

function listFiles(dir: string, exts: string[]): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => exts.includes(extname(f)));
}

function readFM(path: string): { fm: string; body: string } | null {
  const text = readFileSync(path, 'utf-8');
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return null;
  return { fm: m[1], body: text.slice(m[0].length) };
}

function fmField(fm: string, key: string): string {
  const m = fm.match(new RegExp(`^${key}:\\s*["']?(.*?)["']?\\s*$`, 'm'));
  return m ? m[1].trim() : '';
}

function fmTags(fm: string): string[] {
  const m = fm.match(/^tags:\n((?:\s*-\s+\S+\n)+)/m);
  if (!m) return [];
  return [...m[1].matchAll(/-\s+(\S+)/g)].map((x) => x[1]);
}

function fmKartaField(fm: string, field: string): string {
  const blockMatch = fm.match(/^karta:\n((?:\s+.*\n)+?)(?=^\S|\Z)/m);
  if (!blockMatch) return '';
  const m = blockMatch[1].match(new RegExp(`^\\s+${field}:\\s*["']?(.*?)["']?\\s*$`, 'm'));
  return m ? m[1].trim() : '';
}

interface Item {
  slug: string;
  title: string;
  category?: string;
  editUrl: string;
  wordCount?: number;
  legacyCount?: number;
}
interface DupItem {
  path: string;
  note: string;
}

const karty_no_typ: Item[] = [];
const karty_no_thumb: Item[] = [];
const karty_no_vyrobce: Item[] = [];
const karty_placeholder_title: Item[] = [];
const karty_no_umisteni: Item[] = [];
// Stub flagy napříč collections — sjednocený dashboard
const stubs_karty: Item[] = [];
const stubs_clanky: Item[] = [];
const stubs_hodinari: Item[] = [];
const stubs_soupis: Item[] = [];

let kartyTotal = 0;
for (const f of listFiles(CONTENT_HE, ['.md', '.mdx'])) {
  if (!f.startsWith('inv-')) continue;
  kartyTotal++;
  const path = join(CONTENT_HE, f);
  const parsed = readFM(path);
  if (!parsed) continue;
  const { fm } = parsed;
  const slug = basename(f, extname(f));
  const title = fmField(fm, 'title');
  const item: Item = { slug, title, editUrl: `/admin/#/collections/karty/entries/${slug}` };

  const tags = new Set(fmTags(fm));
  const hasTyp = [...EXISTING_TYPY].some((t) => tags.has(t));
  if (!hasTyp) karty_no_typ.push(item);

  if (!/^thumbnail:/m.test(fm)) karty_no_thumb.push(item);
  if (!fmKartaField(fm, 'vyrobce')) karty_no_vyrobce.push(item);
  if (!fmKartaField(fm, 'umisteni')) karty_no_umisteni.push(item);

  if (title.startsWith('[K doplnění]') || title.startsWith('K doplnění')) {
    karty_placeholder_title.push(item);
  }

  if (/^isStub:\s*true\s*$/m.test(fm)) stubs_karty.push(item);
}

const clanky_no_tldr: Item[] = [];
const clanky_short: Item[] = [];
const clanky_legacy_links: Item[] = [];

for (const f of listFiles(CONTENT_HE, ['.md', '.mdx'])) {
  if (f.startsWith('inv-')) continue;
  const path = join(CONTENT_HE, f);
  const parsed = readFM(path);
  if (!parsed) continue;
  const { fm, body } = parsed;
  // Skip karty (podsekce: karta)
  if (/podsekce:\s*["']?karta["']?/.test(fm)) continue;

  const slug = basename(f, extname(f));
  const title = fmField(fm, 'title');
  const cat = fmField(fm, 'category');
  if (!cat) continue;

  const item: Item = {
    slug, title, category: cat,
    editUrl: `/admin/#/collections/clanky/entries/${slug}`,
  };

  if (!/^tldr:/m.test(fm)) clanky_no_tldr.push(item);

  const wordCount = body.trim().split(/\s+/).length;
  if (wordCount < 200) clanky_short.push({ ...item, wordCount });

  const legacyCount = (body.match(/\]\(\/clanky\/[^)]+\)/g) || []).length;
  if (legacyCount > 0) clanky_legacy_links.push({ ...item, legacyCount });

  if (/^isStub:\s*true\s*$/m.test(fm)) stubs_clanky.push(item);
}

const hodinari_short: Item[] = [];
const hodinari_no_portret: Item[] = [];
let hodinariTotal = 0;
for (const f of listFiles(CONTENT_HOD, ['.mdx'])) {
  hodinariTotal++;
  const path = join(CONTENT_HOD, f);
  const parsed = readFM(path);
  if (!parsed) continue;
  const { fm, body } = parsed;
  const slug = basename(f, extname(f));
  const title = fmField(fm, 'title');
  const item: Item = { slug, title, editUrl: `/admin/#/collections/hodinari/entries/${slug}` };

  const wordCount = body.trim().split(/\s+/).length;
  if (wordCount < 200) hodinari_short.push({ ...item, wordCount });
  if (!/^portret:/m.test(fm)) hodinari_no_portret.push(item);

  if (/^isStub:\s*true\s*$/m.test(fm)) stubs_hodinari.push(item);
}

// Soupis věžních hodin — nový stub scan
const CONTENT_SVH = join(ROOT, 'content', 'soupis-veznich-hodin');
let soupisTotal = 0;
for (const f of listFiles(CONTENT_SVH, ['.md', '.mdx'])) {
  soupisTotal++;
  const parsed = readFM(join(CONTENT_SVH, f));
  if (!parsed) continue;
  const { fm } = parsed;
  const slug = basename(f, extname(f));
  const title = fmField(fm, 'title') || slug;
  if (/^isStub:\s*true\s*$/m.test(fm)) {
    stubs_soupis.push({
      slug, title,
      editUrl: `/admin/#/collections/soupis-veznich-hodin/entries/${slug}`,
    });
  }
}

// Kronika
const kronikaYears = new Set<number>();
for (const f of listFiles(CONTENT_KRO, ['.md', '.mdx'])) {
  const parsed = readFM(join(CONTENT_KRO, f));
  if (!parsed) continue;
  const rok = fmField(parsed.fm, 'rok');
  const n = parseInt(rok, 10);
  if (!isNaN(n)) kronikaYears.add(n);
}
const thisYear = new Date().getFullYear();
const kronikaGapYears: number[] = [];
for (let y = 2009; y <= thisYear; y++) {
  if (!kronikaYears.has(y)) kronikaGapYears.push(y);
}

// Duplicities — Finder pattern (`* 2.md`, `* 3.mdx`)
const duplicates: DupItem[] = [];
function scanDup(dir: string): void {
  if (!existsSync(dir)) return;
  for (const f of readdirSync(dir)) {
    if (/\s\d+\.(md|mdx)$/.test(f)) {
      duplicates.push({
        path: 'content/' + dir.split('/content/')[1] + '/' + f,
        note: 'macOS Finder duplikát — pravděpodobně k odstranění',
      });
    }
  }
}
scanDup(CONTENT_HE);
scanDup(CONTENT_HOD);
scanDup(CONTENT_KRO);

const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    kartyTotal,
    kartyNoTyp: karty_no_typ.length,
    kartyNoThumb: karty_no_thumb.length,
    kartyNoVyrobce: karty_no_vyrobce.length,
    kartyNoUmisteni: karty_no_umisteni.length,
    kartyPlaceholderTitle: karty_placeholder_title.length,
    clankyNoTldr: clanky_no_tldr.length,
    clankyShort: clanky_short.length,
    clankyLegacyLinks: clanky_legacy_links.length,
    hodinariTotal,
    hodinariShort: hodinari_short.length,
    hodinariNoPortret: hodinari_no_portret.length,
    soupisTotal,
    stubsKarty: stubs_karty.length,
    stubsClanky: stubs_clanky.length,
    stubsHodinari: stubs_hodinari.length,
    stubsSoupis: stubs_soupis.length,
    kronikaYears: [...kronikaYears].sort((a, b) => a - b),
    kronikaGapYears,
    duplicates: duplicates.length,
  },
  sections: {
    kartyNoTyp: karty_no_typ,
    kartyNoThumb: karty_no_thumb,
    kartyNoVyrobce: karty_no_vyrobce,
    kartyPlaceholderTitle: karty_placeholder_title,
    kartyNoUmisteni: karty_no_umisteni,
    clankyNoTldr: clanky_no_tldr,
    clankyShort: clanky_short,
    clankyLegacyLinks: clanky_legacy_links,
    hodinariShort: hodinari_short,
    hodinariNoPortret: hodinari_no_portret,
    stubsKarty: stubs_karty,
    stubsClanky: stubs_clanky,
    stubsHodinari: stubs_hodinari,
    stubsSoupis: stubs_soupis,
    duplicates,
  },
};

writeFileSync(OUT, JSON.stringify(report, null, 2));
console.log(`[review] generated ${OUT}`);
console.log(`[review] ${kartyTotal} karet, ${hodinariTotal} hodinářů, ${duplicates.length} duplicit`);
console.log(`[review] issues per section:`,
  Object.fromEntries(
    Object.entries(report.sections).map(([k, v]) => [k, v.length])
  )
);
