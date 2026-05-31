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
  /** Cesta k hero obrázku (/img/…) — u edic se vsadí do bočního panelu OG. */
  thumbnail?: string | null;
}

/** R2 CDN base (symetrie s rehype-picture / Photo.astro / remark-csh-directives). */
const CDN_BASE = 'https://pub-e96bd8c658664b38af73a48cb8872b60.r2.dev';

/**
 * Stáhne rasterový obrázek z R2 a vrátí ho jako `data:` URI pro embed do SVG
 * (resvg neumí vzdálené href, jen embedded data nebo lokální soubor). Vrací
 * null při chybě → generate() spadne zpět na čistě textovou kartu.
 */
async function fetchImageDataUri(imgPath: string): Promise<string | null> {
  try {
    const url = imgPath.startsWith('/img/') ? CDN_BASE + imgPath : imgPath;
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const ct = (res.headers.get('content-type') || '').toLowerCase();
    const mime = ct.includes('png') ? 'image/png' : 'image/jpeg';
    return `data:${mime};base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
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
  // Per-collection eyebrows (z A.7 OG coverage rozšíření 2026-05-09):
  hodinari: 'Medailon hodináře',
  hodinari_firma: 'Hodinářská firma',
  'soupis-veznich-hodin': 'Soupis věžních hodin',
  slovnik: 'Hodinářský slovník',
  kroky: 'Hodinový krok',
  kronika: 'Kronika Hodinária',
  edice: 'Edice pramenů',
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
  /** `data:` URI hero skenu — když je, vykreslí se vpravo boční panel (edice). */
  image?: string;
}

function buildSvg(opts: RenderOpts): string {
  const c = COLORS[opts.variant];
  const hasImage = Boolean(opts.image);

  // S bočním panelem (pravých ~40 %) je text úžeji zalomený do levých ~60 %.
  const titleLines = wrapText(opts.title, hasImage ? 17 : 28, 3);
  const excerptLines = opts.excerpt ? wrapText(opts.excerpt, hasImage ? 34 : 60, 2) : [];

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
    <clipPath id="ogPanel"><rect x="744" y="0" width="456" height="630" /></clipPath>
    <linearGradient id="panelShade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${c.bg}" stop-opacity="0.85" />
      <stop offset="18%" stop-color="${c.bg}" stop-opacity="0" />
    </linearGradient>
  </defs>

  <!-- Pozadí -->
  <rect width="1200" height="630" fill="url(#bg)" />

  <!-- Brass left border (mosazný pruh) -->
  <rect x="0" y="0" width="20" height="630" fill="url(#brass)" />
${hasImage ? `
  <!-- Boční panel: sken první stránky pramene (cover-crop, zarovnaný nahoru
       aby byl vidět titul/incipit). Tmavý gradient na levé hraně oddělí text. -->
  <image x="744" y="0" width="456" height="630" href="${opts.image}"
         preserveAspectRatio="xMidYMin slice" clip-path="url(#ogPanel)" />
  <rect x="744" y="0" width="456" height="630" fill="url(#panelShade)" clip-path="url(#ogPanel)" />
  <rect x="740" y="0" width="4" height="630" fill="url(#brass)" />` : `
  <!-- Decentní fleuron ornament v rohu -->
  <text x="1130" y="60" font-family="Georgia, serif" font-size="36" fill="${c.border}" opacity="0.4" text-anchor="end">❦</text>`}

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
  // Edice pramenů: hero sken první stránky do bočního panelu (fetch z R2).
  let image: string | undefined;
  if (variant === 'hodinarium' && page.category === 'edice' && page.thumbnail) {
    image = (await fetchImageDataUri(page.thumbnail)) ?? undefined;
  }
  const svg = buildSvg({
    title: page.title,
    eyebrow,
    excerpt: page.description,
    domain: variant === 'hodinarium' ? 'hodinarium.eu' : 'horologie.cz',
    variant,
    image,
  });
  const png = renderPng(svg);
  await writeFile(join(outDir, `${page.slug}.png`), png);
}

interface CatalogEntry {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  thumbnail?: string | null;
}

/**
 * Velmi jednoduchý YAML frontmatter parser — extrahuje top-level
 * scalar fields (`key: value`) a multi-line block (`key: |`) ze
 * začátku MDX/MD souboru. Nedělá nested objekty ani arrays — pro
 * OG generation potřebujeme jen plochá fields (title, slug, shrnuti,
 * perex, definice, …).
 */
function parseFrontmatter(content: string): Record<string, string> {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const fm: Record<string, string> = {};
  const lines = m[1].split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Match `key: value` na začátku (no leading spaces — ignoruje nested)
    const kv = line.match(/^([a-zA-Z][a-zA-Z0-9_]*):\s*(.*)$/);
    if (!kv) { i++; continue; }
    const [, key, rawValue] = kv;
    if (rawValue === '|' || rawValue === '|-' || rawValue === '>') {
      // Multi-line block. Sbírej následující odsazené řádky.
      const blockLines: string[] = [];
      i++;
      while (i < lines.length && /^\s+/.test(lines[i])) {
        blockLines.push(lines[i].replace(/^\s+/, ''));
        i++;
      }
      fm[key] = blockLines.join(' ').trim();
      continue;
    }
    // Single-line scalar — strip quotes
    let v = rawValue.trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    fm[key] = v;
    i++;
  }
  return fm;
}

/** Strip markdown formatting (bold, links, code) for OG description text. */
function stripMarkdown(s: string): string {
  return s
    .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
    .replace(/\*([^*]+)\*/g, '$1')      // italic
    .replace(/`([^`]+)`/g, '$1')        // code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/\s+/g, ' ')
    .trim();
}

async function loadHodinari(): Promise<OgPage[]> {
  const dir = join(ROOT, 'content', 'hodinari');
  const files = (await readdir(dir)).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
  const pages: OgPage[] = [];
  for (const file of files) {
    const content = await readFile(join(dir, file), 'utf-8');
    const fm = parseFrontmatter(content);
    if (!fm.title || !fm.slug) continue;
    const obdobi = fm.obdobi ? ` (${fm.obdobi})` : '';
    const mesto = fm.mesto ? `${fm.mesto}` : '';
    const description = stripMarkdown(fm.shrnuti || '').slice(0, 220) +
      (mesto && !fm.shrnuti?.includes(mesto) ? ` · ${mesto}` : '');
    pages.push({
      slug: fm.slug,
      title: fm.title + obdobi,
      description: description || mesto || undefined,
      category: fm.typ === 'firma' ? 'hodinari_firma' : 'hodinari',
      siteLabel: 'Hodinárium',
    });
  }
  return pages;
}

async function loadSoupis(): Promise<OgPage[]> {
  const dir = join(ROOT, 'content', 'soupis-veznich-hodin');
  const files = (await readdir(dir)).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));

  // Lookup pro slug → jméno hodináře (z hodinari.ts) pro display.
  // Naivní regex parser hodinari.ts entries (slug + jmeno).
  const hodinariTs = await readFile(join(ROOT, 'apps', 'hodinarium-eu', 'src', 'data', 'hodinari.ts'), 'utf-8');
  const hodinariMap = new Map<string, string>();
  const re = /slug:\s*'([^']+)',\s*\n\s*jmeno:\s*'([^']+)'/g;
  let mm: RegExpExecArray | null;
  while ((mm = re.exec(hodinariTs)) !== null) {
    hodinariMap.set(mm[1], mm[2]);
  }

  const pages: OgPage[] = [];
  for (const file of files) {
    const content = await readFile(join(dir, file), 'utf-8');
    const fm = parseFrontmatter(content);
    if (!fm.slug) continue;
    // Title je v souboru v puvodniMisto (nested) — nemůžeme z naivního parseru
    // dostat. Použijeme heuristiku z slug: `<rok>-<obec>-<hodinar?>`.
    // Ale pro krásu zkusíme extrahovat 'budova' řádku ručně.
    const budovaMatch = content.match(/^\s+budova:\s*"?([^"\n]+?)"?\s*$/m);
    const obecMatch = content.match(/^\s+obec:\s*"?([^"\n]+?)"?\s*$/m);
    const castMatch = content.match(/^\s+cast:\s*"?([^"\n]+?)"?\s*$/m);
    const budova = budovaMatch?.[1]?.trim();
    const obec = obecMatch?.[1]?.trim() || '';
    const cast = castMatch?.[1]?.trim() || '';
    const rok = fm.rok || '?';
    const lokace = [obec, cast].filter(Boolean).join(' – ');
    const titleParts = [budova, lokace].filter(Boolean);
    const title = titleParts.length > 0 ? titleParts.join(', ') : fm.slug;
    const yearLabel = rok && rok !== '?' ? `Rok ${rok}` : 'Datace neznámá';
    const hodinarName = fm.hodinar ? hodinariMap.get(fm.hodinar) || fm.hodinar : '';
    const hodinarLine = hodinarName ? `, ${hodinarName}` : (fm.hodinarText ? `, ${fm.hodinarText}` : '');
    pages.push({
      slug: fm.slug,
      title: title.slice(0, 100),
      description: `${yearLabel}${hodinarLine}`.slice(0, 200),
      category: 'soupis-veznich-hodin',
      siteLabel: 'Hodinárium',
    });
  }
  return pages;
}

async function loadSlovnik(): Promise<OgPage[]> {
  const dir = join(ROOT, 'content', 'slovnik');
  const files = (await readdir(dir)).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
  const pages: OgPage[] = [];
  for (const file of files) {
    const content = await readFile(join(dir, file), 'utf-8');
    const fm = parseFrontmatter(content);
    if (!fm.title || !fm.slug) continue;
    pages.push({
      slug: fm.slug,
      title: fm.title,
      description: stripMarkdown(fm.definice || '').slice(0, 220),
      category: 'slovnik',
      siteLabel: 'Hodinárium',
    });
  }
  return pages;
}

async function loadKronika(): Promise<OgPage[]> {
  const dir = join(ROOT, 'content', 'kronika');
  const files = (await readdir(dir)).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
  const pages: OgPage[] = [];
  for (const file of files) {
    const content = await readFile(join(dir, file), 'utf-8');
    const fm = parseFrontmatter(content);
    if (!fm.title || !fm.slug) continue;
    const datum = fm.date || fm.rok || '';
    const misto = fm.misto || '';
    const descParts = [datum, misto, fm.typ].filter(Boolean);
    pages.push({
      slug: fm.slug,
      title: fm.title,
      description: descParts.join(' · ').slice(0, 220),
      category: 'kronika',
      siteLabel: 'Hodinárium',
    });
  }
  return pages;
}

async function loadKroky(): Promise<OgPage[]> {
  const dir = join(ROOT, 'content', 'kroky');
  const files = (await readdir(dir)).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
  const pages: OgPage[] = [];
  const seen = new Set<string>();
  for (const file of files) {
    const content = await readFile(join(dir, file), 'utf-8');
    const fm = parseFrontmatter(content);
    if (!fm.title || !fm.slug) continue;
    seen.add(fm.slug);
    pages.push({
      slug: fm.slug,
      title: fm.title,
      description: stripMarkdown(fm.perex || '').slice(0, 220),
      category: 'kroky',
      siteLabel: 'Hodinárium',
    });
  }
  // Doplnit slugy z TS rejstříku `src/data/kroky.ts`. Některé kroky jsou
  // jen stuby (žádný MDX), ale `/kroky/[slug].astro` page existuje a
  // rendruje z TS rejstříku — bez OG by HTML meta tag ukázal na 404.png.
  // Naivní regex parser (slug + jmeno + shrnuti).
  try {
    const krokyTs = await readFile(
      join(ROOT, 'apps', 'hodinarium-eu', 'src', 'data', 'kroky.ts'),
      'utf-8'
    );
    const re = /slug:\s*'([^']+)',[\s\S]*?jmeno:\s*'([^']+)'[\s\S]*?shrnuti:\s*'([^']*)'/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(krokyTs)) !== null) {
      const [, slug, jmeno, shrnuti] = m;
      if (seen.has(slug)) continue;
      pages.push({
        slug,
        title: jmeno,
        description: stripMarkdown(shrnuti).slice(0, 220),
        category: 'kroky',
        siteLabel: 'Hodinárium',
      });
    }
  } catch { /* TS rejstřík chybí — fallback jen na MDX */ }
  return pages;
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
    // `/sbirka/katalog` = subsekce sbírky (atlas-style mřížka karet). Base.astro
    // ogSlugFromPath odvodí slug `katalog` (poslední segment), takže OG musí
    // existovat pod tímto názvem.
    { slug: 'katalog', title: 'Katalog sbírkových předmětů', description: 'Atlas exponátů Hodinária — mřížka karet sbírky', siteLabel: 'Hodinárium' },
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

  // Per článek (clanky collection — `content/hodinarium-eu/`)
  for (const entry of catalog) {
    hodinariumPages.push({
      slug: entry.slug,
      title: entry.title,
      description: entry.excerpt,
      category: entry.category,
      siteLabel: 'Hodinárium',
      thumbnail: entry.thumbnail,
    });
  }

  // Per medailon hodináře / firmy (`content/hodinari/`)
  const hodinariPages = await loadHodinari();
  hodinariumPages.push(...hodinariPages);
  console.log(`  + ${hodinariPages.length} medailonů z content/hodinari/`);

  // Per karta soupisu věžních hodin (`content/soupis-veznich-hodin/`)
  const soupisPages = await loadSoupis();
  hodinariumPages.push(...soupisPages);
  console.log(`  + ${soupisPages.length} karet z content/soupis-veznich-hodin/`);

  // Per heslo slovníku (`content/slovnik/`)
  const slovnikPages = await loadSlovnik();
  hodinariumPages.push(...slovnikPages);
  console.log(`  + ${slovnikPages.length} hesel z content/slovnik/`);

  // Per detail hodinového kroku (`content/kroky/`)
  const krokyPages = await loadKroky();
  hodinariumPages.push(...krokyPages);
  console.log(`  + ${krokyPages.length} detailů z content/kroky/`);

  // Per záznam v kronice (`content/kronika/`)
  const kronikaPages = await loadKronika();
  hodinariumPages.push(...kronikaPages);
  console.log(`  + ${kronikaPages.length} záznamů z content/kronika/`);

  // Sanity check — duplicate slug detection (top-level vs catalog vs collections).
  // Při kolizi by `pruneStaleOg` smazalo "duplikát" v dalším runu.
  const seen = new Set<string>();
  const duplicates: string[] = [];
  for (const p of hodinariumPages) {
    if (seen.has(p.slug)) duplicates.push(p.slug);
    seen.add(p.slug);
  }
  if (duplicates.length > 0) {
    console.warn(`  ⚠ Duplicitní slugy (poslední vyhrává): ${duplicates.join(', ')}`);
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
