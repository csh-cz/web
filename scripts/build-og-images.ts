/**
 * Vyrobí OG image (1200×630 PNG) pro každý článek a navigační stránku
 * obou webů — hodinarium.eu i horologie.cz.
 *
 * - Statické (homepage, /atlas, /mapa, /casova-osa, /sbirka, /projekty, /decin, /vezni-hodiny, /clanky)
 * - Per-článek (218 článků hodinarium + 10 článků horologie)
 *
 * Výstup:
 *   apps/hodinarium-eu/public/og/<slug>.png
 *   apps/horologie-cz/public/og/<slug>.png
 */
import { readFile, writeFile, mkdir, readdir, unlink } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

interface OgPage {
  slug: string;
  title: string;
  description?: string;
  category?: string;
  siteLabel: string;
}

const HODINARIUM_OG = join(ROOT, 'apps', 'hodinarium-eu', 'public', 'og');
const HOROLOGIE_OG = join(ROOT, 'apps', 'horologie-cz', 'public', 'og');

const COLORS = {
  hodinarium: {
    bg: '#14100c',
    bgInner: '#1f1814',
    border: '#b8924a',           // brass
    title: '#e8c574',            // brass-bright
    eyebrow: '#a85a3c',          // copper
    excerpt: '#d4c5a8',          // text-soft
    domain: '#8a8275',           // text-muted
  },
  horologie: {
    bg: '#14110c',
    bgInner: '#1e1a14',
    border: '#a89060',           // tlumený brass
    title: '#c8a877',
    eyebrow: '#8b6d3a',
    excerpt: '#cebd9b',
    domain: '#968971',
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  decin: 'Hodinárium Děčín',
  'vezni-hodiny': 'Věžní hodiny',
  sbirka: 'Sbírka',
  projekty: 'DIY projekty',
  ostatni: 'Hodinárium',
};

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Wrap text na řádky podle max chars per line.
 * Velmi zjednodušené — počítá s monospace, ale pro display účely OK.
 */
function wrapText(text: string, maxCharsPerLine: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if (current.length === 0) {
      current = word;
    } else if (current.length + 1 + word.length <= maxCharsPerLine) {
      current += ' ' + word;
    } else {
      lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) {
        // poslední řádka — nech zbytek do ní + ellipsis
        const rest = [word, ...words.slice(words.indexOf(word) + 1)].join(' ');
        if (rest.length > maxCharsPerLine) {
          lines.push(rest.slice(0, maxCharsPerLine - 1) + '…');
        } else {
          lines.push(rest);
        }
        return lines;
      }
    }
  }
  if (current) lines.push(current);
  return lines;
}

interface RenderOpts {
  title: string;
  eyebrow: string;
  excerpt?: string;
  domain: string;
  variant: 'hodinarium' | 'horologie';
}

function buildSvg(opts: RenderOpts): string {
  const c = COLORS[opts.variant];

  // Title — rozlož na max 3 řádky
  const titleLines = wrapText(opts.title, 28, 3);
  // Excerpt — max 2 řádky
  const excerptLines = opts.excerpt ? wrapText(opts.excerpt, 60, 2) : [];

  // Vertical layout — eyebrow nahoře, title pod ním, excerpt zespodu, domain úplně dole
  const eyebrowY = 130;
  const titleStartY = 240;            // pevná pozice, žádný překryv s eyebrow
  const titleLineHeight = 95;
  const titleEndY = titleStartY + (titleLines.length - 1) * titleLineHeight;
  const excerptStartY = Math.max(titleEndY + 75, 470);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c.bg}" />
      <stop offset="100%" stop-color="${c.bgInner}" />
    </linearGradient>
    <linearGradient id="brass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${c.border}" stop-opacity="0.9" />
      <stop offset="100%" stop-color="${c.border}" stop-opacity="0.5" />
    </linearGradient>
  </defs>

  <!-- Pozadí -->
  <rect width="1200" height="630" fill="url(#bg)" />

  <!-- Brass left border (mosazný pruh) -->
  <rect x="0" y="0" width="20" height="630" fill="url(#brass)" />

  <!-- Decentní fleuron ornament v rohu -->
  <text x="1130" y="60" font-family="Georgia, serif" font-size="36" fill="${c.border}" opacity="0.4" text-anchor="end">❦</text>

  <!-- Eyebrow (kategorie / web) -->
  <text x="80" y="${eyebrowY}"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="26"
        fill="${c.eyebrow}"
        font-weight="500"
        letter-spacing="6">
    ${escapeXml(opts.eyebrow.toUpperCase())}
  </text>

  <!-- Titulek (max 3 řádky) -->
  ${titleLines
    .map(
      (line, i) => `
  <text x="80" y="${titleStartY + i * titleLineHeight}"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="${titleLines.length >= 3 ? 64 : 76}"
        fill="${c.title}"
        font-weight="500">
    ${escapeXml(line)}
  </text>`,
    )
    .join('')}

  <!-- Excerpt (max 2 řádky) -->
  ${excerptLines
    .map(
      (line, i) => `
  <text x="80" y="${excerptStartY + i * 38}"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="26"
        fill="${c.excerpt}"
        font-style="italic">
    ${escapeXml(line)}
  </text>`,
    )
    .join('')}

  <!-- Doména v patičce -->
  <line x1="80" y1="555" x2="200" y2="555" stroke="${c.border}" stroke-width="1" opacity="0.5" />
  <text x="80" y="585"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="22"
        fill="${c.domain}"
        font-weight="500"
        letter-spacing="4">
    ${escapeXml(opts.domain.toUpperCase())}
  </text>
</svg>`;
}

function renderPng(svg: string): Buffer {
  const resvg = new Resvg(svg, {
    background: COLORS.hodinarium.bg,
    fitTo: { mode: 'width', value: 1200 },
    font: {
      // resvg.js má vestavěné fallback fonty; pro Spectral bychom potřebovali
      // .ttf path. Zatím serif fallback (Georgia) je dostatečně blízko.
      defaultFontFamily: 'Georgia',
      loadSystemFonts: true,
    },
  });
  return resvg.render().asPng();
}

async function generate(outDir: string, page: OgPage, variant: 'hodinarium' | 'horologie') {
  await mkdir(outDir, { recursive: true });
  const eyebrow = page.category
    ? CATEGORY_LABELS[page.category] ?? page.siteLabel
    : page.siteLabel;
  const svg = buildSvg({
    title: page.title,
    eyebrow,
    excerpt: page.description,
    domain: variant === 'hodinarium' ? 'hodinarium.eu' : 'horologie.cz',
    variant,
  });
  const png = renderPng(svg);
  await writeFile(join(outDir, `${page.slug}.png`), png);
}

interface CatalogEntry {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
}

/**
 * Smaže OG soubory pro slugy, které už neexistují v aktuální sadě
 * (např. po smazání článku). Idempotentní — nedělá nic, pokud
 * složka neexistuje nebo už je čistá.
 */
async function pruneStaleOg(outDir: string, validSlugs: string[]): Promise<void> {
  const valid = new Set(validSlugs);
  let entries: string[];
  try {
    entries = await readdir(outDir);
  } catch {
    return;
  }
  for (const f of entries) {
    if (!f.endsWith('.png')) continue;
    const slug = f.slice(0, -'.png'.length);
    if (!valid.has(slug)) {
      await unlink(join(outDir, f));
      console.log(`  🗑  smazán stale: ${f}`);
    }
  }
}

async function main() {
  // ── HODINÁRIUM ──
  const catalogPath = join(ROOT, 'content', 'hodinarium-eu', '_catalog.json');
  const catalog: CatalogEntry[] = JSON.parse(await readFile(catalogPath, 'utf-8'));

  // Top-level routes na hodinarium-eu. Po taxonomy refactoru (M2, 2026-04)
  // jsou kategoriová URL `/sbirka`, `/konstrukce`, `/projekty`,
  // `/virtualni-muzeum`, `/muzea`, `/zajimavosti`. Stará `/atlas`, `/decin`,
  // `/vezni-hodiny` byla rebrandovaná / smazaná.
  const hodinariumPages: OgPage[] = [
    { slug: 'home', title: 'Hodinárium', description: 'Webová expozice Českého spolku horologického', siteLabel: 'Hodinárium', category: undefined },
    { slug: 'mapa', title: 'Mapa', description: 'Mapa exponátů Hodinária + horologické zajímavosti v Evropě', siteLabel: 'Hodinárium' },
    { slug: 'mapa-horologie', title: 'Mapa horologie', description: 'Orloje, muzea, výrobci a zajímavosti po Evropě i ve světě', siteLabel: 'Hodinárium' },
    { slug: 'sbirka', title: 'Sbírka', description: 'Evidenční karty exponátů Hodinária Děčín', siteLabel: 'Hodinárium' },
    { slug: 'konstrukce', title: 'Konstrukce', description: 'Mechanismy a principy hodin', siteLabel: 'Hodinárium' },
    { slug: 'projekty', title: 'Projekty', description: 'DIY hodiny a experimentální konstrukce spolku', siteLabel: 'Hodinárium' },
    { slug: 'virtualni-muzeum', title: 'Virtuální muzeum', description: 'Cizí hodiny mimo fyzickou sbírku — zajímavé exponáty z celého světa', siteLabel: 'Hodinárium' },
    { slug: 'muzea', title: 'Hodinářská muzea', description: 'Sister muzea a hodinářské expozice po celém světě', siteLabel: 'Hodinárium' },
    { slug: 'zajimavosti', title: 'Zajímavosti', description: 'Eseje o čase, časoměrných systémech, historii hodin', siteLabel: 'Hodinárium' },
    { slug: 'hodinari', title: 'Hodináři', description: 'Medailony hodinářů a hodinářských firem', siteLabel: 'Hodinárium' },
    { slug: 'kronika', title: 'Kronika Hodinária', description: 'Vernisáže, akvizice, restaurování — chronologický feed', siteLabel: 'Hodinárium' },
    { slug: 'kroky', title: 'Hodinové kroky', description: 'Technický rejstřík typů hodinového kroku', siteLabel: 'Hodinárium' },
    { slug: 'slovnik', title: 'Hodinářský slovník', description: 'Výkladový a překladový slovník z primárních pramenů', siteLabel: 'Hodinárium' },
    { slug: 'soupis-veznich-hodin', title: 'Soupis věžních hodin', description: 'Existující i ztracené věžní hodiny v Česku', siteLabel: 'Hodinárium' },
    { slug: 'casova-osa', title: 'Časová osa', description: '600 let hodinařiny v milnících', siteLabel: 'Hodinárium' },
    { slug: 'expozice', title: 'Expozice', description: 'Hodinářské expozice a slavné orloje', siteLabel: 'Hodinárium' },
    { slug: 'tagy', title: 'Tagy', description: 'Křížové filtry — období, výrobci, pohon, regulátor, lokace', siteLabel: 'Hodinárium' },
    { slug: 'pro-navstevniky', title: 'Pro návštěvníky', description: 'Otevírací doba, doprava, vstupné Hodinária Děčín', siteLabel: 'Hodinárium' },
    { slug: 'o-hodinariu', title: 'O Hodináriu', description: 'Koncepce a historie webové expozice', siteLabel: 'Hodinárium' },
    { slug: 'vice', title: 'Více', description: 'Rozcestník sekundárních sekcí Hodinária', siteLabel: 'Hodinárium' },
    { slug: 'podpora', title: 'Podpora', description: 'Jak podpořit činnost spolku', siteLabel: 'Hodinárium' },
    { slug: 'clanky', title: 'Všechny články', description: 'Plný archiv článků o hodinařině', siteLabel: 'Hodinárium' },
    { slug: 'licence', title: 'Licence obsahu', description: 'CC BY 4.0 — můžeš sdílet, upravovat, použít komerčně', siteLabel: 'Hodinárium' },
    { slug: 'en', title: 'About Hodinárium', description: 'English summary — Czech Horological Society webová expozice', siteLabel: 'Hodinárium' },
  ];

  // Per článek
  for (const entry of catalog) {
    hodinariumPages.push({
      slug: entry.slug,
      title: entry.title,
      description: entry.excerpt,
      category: entry.category,
      siteLabel: 'Hodinárium',
    });
  }

  console.log(`Generuji OG image pro Hodinárium (${hodinariumPages.length} stránek)…`);
  for (const page of hodinariumPages) {
    await generate(HODINARIUM_OG, page, 'hodinarium');
  }
  await pruneStaleOg(HODINARIUM_OG, hodinariumPages.map((p) => p.slug));
  console.log(`  ✅ ${hodinariumPages.length} OG images uloženo do ${HODINARIUM_OG}`);

  // ── HOROLOGIE ──
  const horologiePath = join(ROOT, 'content', 'horologie-cz');
  const horologieFiles = (await readdir(horologiePath)).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));

  const horologiePages: OgPage[] = [
    { slug: 'home', title: 'Český spolek horologický', description: 'IČO 26573008 · Sdružení obdivovatelů hodin', siteLabel: 'horologie.cz' },
    { slug: 'akce', title: 'Akce spolku', description: 'Vernisáže, výstavy, restaurátorské reportáže a setkání', siteLabel: 'horologie.cz' },
    { slug: 'prispevky', title: 'Příspěvky na členských schůzích', description: 'Prezentace, přednášky a referáty členů spolku', siteLabel: 'horologie.cz' },
    { slug: 'dokumenty', title: 'Dokumenty', description: 'Stanovy, hospodaření, zápisy ze schůzí', siteLabel: 'horologie.cz' },
    { slug: 'sponzoring', title: 'Sponzoring', description: 'Podpořte Český spolek horologický a Hodinárium Děčín', siteLabel: 'horologie.cz' },
    { slug: 'kontakt', title: 'Kontakt', description: 'Kontaktní údaje Českého spolku horologického', siteLabel: 'horologie.cz' },
    { slug: 'licence', title: 'Licence obsahu', description: 'CC BY 4.0 — sdílet, upravovat, použít komerčně', siteLabel: 'horologie.cz' },
  ];

  for (const file of horologieFiles) {
    const content = await readFile(join(horologiePath, file), 'utf-8');
    const titleMatch = content.match(/^title:\s*"([^"]+)"/m);
    const slug = file.replace(/\.(md|mdx)$/, '');
    if (titleMatch) {
      horologiePages.push({
        slug,
        title: titleMatch[1],
        description: 'Dokument Českého spolku horologického',
        siteLabel: 'horologie.cz',
      });
    }
  }

  console.log(`Generuji OG image pro Horologie.cz (${horologiePages.length} stránek)…`);
  for (const page of horologiePages) {
    await generate(HOROLOGIE_OG, page, 'horologie');
  }
  await pruneStaleOg(HOROLOGIE_OG, horologiePages.map((p) => p.slug));
  console.log(`  ✅ ${horologiePages.length} OG images uloženo do ${HOROLOGIE_OG}`);

  console.log(`\n=== Hotovo ===`);
  console.log(`Hodinárium: ${hodinariumPages.length} OG`);
  console.log(`Horologie:  ${horologiePages.length} OG`);
  console.log(`Celkem:     ${hodinariumPages.length + horologiePages.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
