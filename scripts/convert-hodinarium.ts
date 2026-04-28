/**
 * Konvertuje raw/hodinarium-eu/pages/*.html → content/hodinarium-eu/*.md
 *
 * - Vyextrahuje hlavní obsah z <div class="hlavni"> ... </div>
 * - Odstraní pozůstatky AI exportů (data-start, data-end), inline styles, deprecated atributy
 * - Převede HTML → Markdown přes turndown
 * - Vygeneruje frontmatter (title, slug, originalUrl, lastModified, charset)
 * - Přepíše interní .htm odkazy na nové slugy bez přípony
 * - Logy báze pro auditní tabulku
 */
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import TurndownService from 'turndown';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const RAW_DIR = join(ROOT, 'raw', 'hodinarium-eu');
const PAGES_DIR = join(RAW_DIR, 'pages');
const INDEX_PATH = join(RAW_DIR, '_index.json');
const OUT_DIR = join(ROOT, 'content', 'hodinarium-eu');

interface PageMeta {
  url: string;
  slug: string;
  title: string | null;
  lastModified: string | null;
  charset: string;
  contentLength: number;
  linksOut: string[];
  scrapedAt: string;
}

interface Index {
  scrapedAt: string;
  pages: Record<string, PageMeta>;
}

function extractMain(html: string): string {
  // Hlavní obsah je v <div ... class="hlavni" ...>...</div> (před patičkou).
  // Patička je v <div class="pata">. Atribut class může být na libovolné
  // pozici (některé staré stránky mají nejdřív style="..." a class až za ním).
  const m = html.match(/<div\b[^>]*\bclass=["'][^"']*\bhlavni\b[^"']*["'][^>]*>([\s\S]*?)<div\b[^>]*\bclass=["'][^"']*\bpata\b[^"']*["']/);
  if (m) return m[1];
  // Fallback: vezmi <body> a doufej
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/);
  return body ? body[1] : html;
}

function extractFirstH1(html: string): string | null {
  const main = extractMain(html);
  const m = main.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  if (!m) return null;
  return m[1]
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || null;
}

function cleanHtml(html: string): string {
  return html
    // AI export artefakty
    .replace(/\sdata-start=["']\d+["']/g, '')
    .replace(/\sdata-end=["']\d+["']/g, '')
    // FrontPage / WYSIWYG balast
    .replace(/<o:p\s*\/?>(<\/o:p>)?/g, '')
    .replace(/\sclass=["']MsoNormal["']/g, '')
    // <font> tagy
    .replace(/<\/?font[^>]*>/g, '')
    // <center> → div s alignem ve stylu, raději vyhodit
    .replace(/<center>/g, '<div>')
    .replace(/<\/center>/g, '</div>')
    // <big>, <small> jako tagy přebalit do <strong>/<span>
    .replace(/<big>/g, '<strong>')
    .replace(/<\/big>/g, '</strong>')
    // Highslide a ActiveX skripty
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/g, '')
    // Komentáře
    .replace(/<!--[\s\S]*?-->/g, '')
    // Inline styles - většina je estetický balast
    .replace(/\sstyle=["'][^"']*["']/g, '')
    // file:/// odkazy (Petrovy lokální cesty)
    .replace(/href=["']file:\/\/\/[^"']*["']/g, 'href="#"')
    // Linky vedoucí na obrázek loga zpátky na sebe samé
    .replace(/<a href="#"><img/g, '<img')
    // hspace, vspace, border atributy
    .replace(/\s(hspace|vspace|border|cellspacing|cellpadding|align)=["']?[^"'\s>]*["']?/gi, '')
    // Nadbytečné &nbsp; mezi slovy
    .replace(/&nbsp;/g, ' ')
    // TOPlist a W3C badge
    .replace(/<a[^>]*toplist\.cz[^>]*>[\s\S]*?<\/a>/gi, '')
    .replace(/<a[^>]*validator\.w3\.org[^>]*>[\s\S]*?<\/a>/gi, '')
    // Konsolidace whitespace
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><');
}

function fixUri(uri: string): string {
  if (!uri.includes('%')) return uri;
  try {
    decodeURI(uri);
    return uri; // už validní UTF-8
  } catch {
    // Kódování je windows-1250 (původní web) — dekódovat byte-po-byte přes cp1250 a re-enkódovat UTF-8
    const bytes = Buffer.from(
      uri.replace(/%([0-9a-fA-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16))),
      'latin1',
    );
    const decoded = new TextDecoder('windows-1250').decode(bytes);
    return encodeURI(decoded);
  }
}

const ORIGIN = 'https://hodinarium.eu';
const PUBLIC_DIR = join(__dirname, '..', 'apps', 'hodinarium-eu', 'public');

function absolutizeAssetUri(uri: string): string {
  // Vnější odkazy ponechat
  if (/^https?:\/\//i.test(uri)) {
    // Pokud je to hodinarium.eu/img/... a máme to lokálně → přepiš na /img/...
    if (uri.startsWith(ORIGIN + '/')) {
      const path = uri.slice(ORIGIN.length).split('?')[0];
      const local = join(PUBLIC_DIR, path.replace(/^\//, ''));
      if (existsSync(local)) return path;
    }
    return uri;
  }
  if (uri.startsWith('#') || uri.startsWith('mailto:') || uri === '/' || uri === '#') return uri;
  // Lokální asset (např. img/...) — pokud je lokálně, dej absolutní lokální cestu
  if (/\.(jpg|jpeg|png|gif|webp|svg|ico|pdf|zip|mp4|webm|mp3)(\?|#|$)/i.test(uri)) {
    const path = uri.startsWith('/') ? uri : `/${uri}`;
    const local = join(PUBLIC_DIR, path.replace(/^\//, '').split('?')[0]);
    if (existsSync(local)) return path;
    // Fallback: proxy přes původní hodinarium.eu
    return `${ORIGIN}${path}`;
  }
  return uri;
}

function fixImageUris(md: string): string {
  // ![alt](uri) i [![alt](uri)](uri2)
  return md.replace(/(!?\[[^\]]*\])\(([^)]+)\)/g, (_, label, uri) => {
    const fixed = fixUri(uri);
    const absolutized = absolutizeAssetUri(fixed);
    return `${label}(${absolutized})`;
  });
}

function cleanMarkdownArtifacts(md: string): string {
  return md
    // Highslide JS alt texty — vyhodit
    .replace(/!\[Highslide JS\]/g, '![]')
    // Generické alt texty z původního webu
    .replace(/!\[(menu|grafika|grafika3b|grafika 7b|naspis|počitadla|TOPlist|facebook)\]/g, '![]')
    // [![](thumb)](full) — Highslide pattern: link s thumbnail-image, tak je
    // Konsekutivní obrázky na jednom řádku — oddělit dvojitým newline pro markdown gallery
    .replace(/(\[?!\[[^\]]*\]\([^)]+\)\]?(?:\([^)]+\))?)(\[?!\[)/g, '$1\n\n$2')
    // Odstranit prázdné odkazy [](...)
    .replace(/\[\]\([^)]+\)/g, '')
    // Linky bez href: [text](#) → text
    .replace(/\[([^\]]+)\]\(#\)/g, '$1')
    // Vyhodit pořád zbytečné `<br />` na koncích řádků
    .replace(/\s*<br\s*\/?>\s*/g, '\n')
    // Konsolidovat whitespace
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
}

function rewriteInternalLinks(md: string, allSlugs: Set<string>): string {
  // Markdown link [text](old.htm) → [text](/new-slug)
  return md.replace(/\]\(([\w./-]+)\.html?\)/g, (match, path: string) => {
    const slug = path.replace(/^\//, '').replace(/\.html?$/, '').replace(/[^\w.-]/g, '_');
    if (allSlugs.has(slug)) {
      return `](/clanky/${slug})`;
    }
    return match;
  });
}

function categorizeSlug(slug: string, title: string | null): string {
  const t = (title ?? '').toLowerCase();
  const s = slug.toLowerCase();

  // Spolek — formální spolková agenda. POZOR: tyhle soubory patří do
  // content/horologie-cz/, NE do hodinarium-eu. Converter na hodinarium
  // tedy musí takové slugy ignorovat (vrátit speciální 'spolek' string,
  // ale main loop je vyfiltrovat z výstupu).
  if (
    /^(spolek|stanovy|sponsor|kontakt|usneseni|zapis|hledej)/i.test(slug) ||
    s.includes('hospodareni') ||
    s.includes('cleny') ||
    s === 'novinky' || s === 'novinky2'
  ) return 'spolek';

  // Hodinárium Děčín
  if (s.startsWith('decin') || s.startsWith('sezona') || s.includes('hodinarium') || s === 'kostky' || s === 'nonsens2015' || s === 'dernisaz2013' || s.startsWith('vernisaz')) return 'decin';

  // Věžní hodiny — věže, zvony, věžní stroje
  if (
    s.startsWith('vez') || s.startsWith('sobeslav') || s.startsWith('bychory') ||
    s.startsWith('rozmberk') || s.includes('zikmund') ||
    s.startsWith('janovice') || s.startsWith('kardasova') || s.startsWith('budislav') ||
    s.includes('zvon') || s === 'tabor' || s === 'litomysl' || s === 'olomouc' ||
    s === 'prostejov' || s === 'mindelheim' || s === 'schaffhausen' || s === 'venecia' ||
    s === 'mantova' || s === 'lubeck' || s === 'stralsund' || s === 'novo_orloj' ||
    s === 'nostic' || s === 'orloje_1' || s === 'orloje_2' || s === 'orloje_3' ||
    s === 'orloje_cz' || s === 'radosov1420' || s === 'ostrava_brno' || s === 'hansa' ||
    s.startsWith('sobeslav')
  ) return 'vezni-hodiny';

  // DIY projekty — elektronika, mikroprocesory, NTP, GPS, propeller clock
  if (
    s.startsWith('arduino') || /esp|ntp/i.test(slug) || s.startsWith('astro') ||
    s.includes('sakul') || s.includes('dcf77') || s.includes('propeller') ||
    s === 'mobil' || s === 'lantime_m100' || s === 'prs10' || s === 'kappa' ||
    s.startsWith('cas_internet') || s === 'cas_pasma' || s === 'casova_pasma' ||
    s === 'casovy_zamek' || s === 'pichacky' || s === 'pneumatika' ||
    s === 'pneumatika2' || s === 'settopbox' || s === 'skymaster_ghost' ||
    s === 'fake_atomove_hodiny' || s === 'atomove_kapesni' || s === 'datumatik' ||
    s === 'eureka' || s === 'mereni_casu' || s === 'rimskedigi' || s === 'rimskedigi2' ||
    s === 'jednotnycas' || s === 'normalni' || s === 'synchron_bici' ||
    s === 'synchronizace_hodin' || s === 'rizeni_kyvadla' || s.startsWith('elektromag') ||
    s === 'segmentovky_s_prekladem' || s === 'flying_pendulum' || s === 'line_kyvadlo' ||
    s === 'matematicke' || s === 'maregraf' || s === 'time_slider' ||
    s.toLowerCase() === 'timeslider' || s === 'timometer' || s === 'mluvici1895' ||
    s === 'radiotelegraficke_signaly' || s === 'alzbeta' || s === 'gobelin' ||
    s === 'svetlonos' || s === 'orient' || s === '12_24' || s === '4ruce' ||
    s === 'ato' || s === 'esv3' || s === 'edgecombe' || s === 'ferramo' ||
    s === 'staiger' || s === 'ctwagner' || s === 'rickstanley' || s === 'timhunkin' ||
    s === 'betrisey' || s === 'vlachynsky' || s === 'mazan' || s === 'kavalir'
  ) return 'projekty';

  // Sbírka — všechno ostatní z fyzické sbírky
  if (
    s.startsWith('svarcvald') || s.includes('comtoaz') ||
    s.startsWith('vodni') || s.startsWith('slunecni') || s.startsWith('kvetinove') ||
    s.startsWith('podebrady') || s === 'jezdecke' || s.startsWith('zidov') ||
    s === 'decimalky' || s.startsWith('rimsk') || s === 'mystery' ||
    s === 'lahvace' || s === 'papir' || s === 'kostky' || s === 'kulicky' ||
    s === 'motorky' || s === 'zapekane' || s === 'spinka' || s === 'sestka' ||
    s === 'lenzkirch' || s === 'pragotron1' || s === 'mobatime' ||
    s === 'kapesni_orloj' || s === 'kuriozity1' || s === 'merkur' ||
    s === 'budiky1' || s === 'budiky2' || s === 'pulsynetic' || s === 'brillie' ||
    s === 'bulle' || s === 'svitici' || s === 'razitka' || s === 'sitovky' ||
    s === 'pilovky' || s === 'listkove_kohler' || s === 'podruzne_sekundove' ||
    s === 'svarcvaldky_hraci' || s === 'svarcvaldky_stroje' ||
    s === 'svarcvaldky_stroje_polodrev' || s === 'svarcvaldky_stroje2' ||
    s === 'svarcvaldky_surrerwerk' || s === 'astronomicke_sauter' ||
    s.toLowerCase() === 'astronomicke_sauter' || s === 'electricke1' ||
    s.toLowerCase().startsWith('elektrick') || s === 'kvetinovehodiny_chomutov' ||
    s.toLowerCase() === 'kvetinovehodiny_nmnm' || s === 'kalendar_rimsky' ||
    s === 'nocturnal' || s === 'perpetum_mobile' || s === 'prestavby' ||
    s === 'prehled_zvonu' || s === 'ukazatele' || s === 'uspirku' ||
    s === 'orloj_drevene_sochy' || s === 'kulicky' || s === 'gobelin' ||
    s === 'literatura' || s === 'youtube' || s === 'inspirace' ||
    s === 'hinspirace' || s === 'humor1866' || s === 'mereni_casu' ||
    s === 'muzea_cr' || s === 'paichl_knihy_hodiny_hodiny_slovnik_slovnik' ||
    s === 'ohlednuti2011' || s === 'ruzne' || s === 'orloj_jici' ||
    s === 'orloj_kovarske' || s === 'co_pisi_jini' || s === 'mapa' ||
    s === 'vezni_muzejicko' || s === 'vezni_muzejicko_evropa' || s === 'vezni2021' ||
    s === 'fauna' || s === 'faust' || s === 'zmizele' || s === 'steampunk' ||
    s === 'carokodky' || s === 'ntph' || s.toLowerCase() === 'ntph_st' ||
    s === 'plzen'
  ) return 'sbirka';

  return 'ostatni';
}

function makeFrontmatter(meta: PageMeta, category: string, originalSlug: string): string {
  const fm = {
    title: meta.title ?? originalSlug,
    slug: originalSlug,
    category,
    originalUrl: meta.url,
    lastModified: meta.lastModified ?? null,
    sourceCharset: meta.charset,
    scrapedAt: meta.scrapedAt,
  };
  const lines = ['---'];
  for (const [k, v] of Object.entries(fm)) {
    if (v === null || v === undefined) {
      lines.push(`${k}: null`);
    } else if (typeof v === 'string') {
      lines.push(`${k}: ${JSON.stringify(v)}`);
    } else {
      lines.push(`${k}: ${v}`);
    }
  }
  lines.push('---', '');
  return lines.join('\n');
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  if (!existsSync(INDEX_PATH)) {
    console.error(`Chybí index ${INDEX_PATH}. Spusť nejprve scrape:hodinarium.`);
    process.exit(1);
  }
  const index: Index = JSON.parse(await readFile(INDEX_PATH, 'utf-8'));
  const slugs = new Set(Object.values(index.pages).map((p) => p.slug));

  const turndown = new TurndownService({
    headingStyle: 'atx',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
    linkStyle: 'inlined',
  });
  // Necháme obrázky zatím v původních src cestách (přesun assetů řešíme později)
  turndown.addRule('preserveImg', {
    filter: 'img',
    replacement: (_content, node) => {
      const el = node as HTMLElement;
      const alt = el.getAttribute('alt') ?? '';
      const src = el.getAttribute('src') ?? '';
      if (!src) return '';
      return `![${alt}](${src})`;
    },
  });

  const stats = { ok: 0, skipped: 0, failed: 0 };
  const audit: { slug: string; category: string; title: string; words: number; oldUrl: string }[] = [];

  for (const [path, meta] of Object.entries(index.pages)) {
    const inputPath = join(PAGES_DIR, `${meta.slug}.html`);
    if (!existsSync(inputPath)) {
      stats.skipped++;
      continue;
    }
    try {
      const html = await readFile(inputPath, 'utf-8');
      const realTitle = extractFirstH1(html) ?? meta.title ?? meta.slug;
      const main = extractMain(html);
      const clean = cleanHtml(main);
      let md = turndown.turndown(clean);
      md = fixImageUris(md);
      md = rewriteInternalLinks(md, slugs);
      md = cleanMarkdownArtifacts(md);
      // Smazat první H1 z těla — ale zachovat obrázky uvnitř něj
      md = md.replace(/^#\s+(.*)$/m, (_match, h1content: string) => {
        // Vyextrahuj obrázky z H1, postav je jako samostatné řádky
        const imgs = [...h1content.matchAll(/!\[[^\]]*\]\([^)]+\)/g)].map((m) => m[0]);
        return imgs.length > 0 ? imgs.join('\n\n') : '';
      });
      // Smazat H2/H3 řádek, který má obrázek + text slepený dohromady (## ![alt](url)Text)
      // → rozdělit na: ![alt](url)\n\n## Text
      md = md.replace(/^(##+)\s+(!\[[^\]]*\]\([^)]+\))(.+)$/gm, (_match, hashes, img, rest) => {
        return `${img}\n\n${hashes} ${rest.trim()}`;
      });
      // Strip vícenásobné prázdné řádky
      md = md.replace(/\n{3,}/g, '\n\n').trim();

      const category = categorizeSlug(meta.slug, realTitle);

      // Spolkové články patří na horologie.cz, ne hodinarium.eu — přeskočit
      if (category === 'spolek') {
        stats.skipped++;
        continue;
      }

      const realMeta = { ...meta, title: realTitle };
      const fm = makeFrontmatter(realMeta, category, meta.slug);

      const outPath = join(OUT_DIR, `${meta.slug}.md`);

      // Ochrana před přepsáním ručně editovaných souborů.
      // Pokud existující soubor má `manualEdit: true` ve frontmatteru,
      // přepiš jen frontmatter (kategorie, lastModified, title), nech tělo.
      if (existsSync(outPath)) {
        const existing = await readFile(outPath, 'utf-8');
        if (/^manualEdit:\s*true/m.test(existing)) {
          // Přepiš jen frontmatter, zachovej tělo
          const bodyMatch = existing.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
          if (bodyMatch) {
            const newFm = makeFrontmatter({ ...realMeta }, category, meta.slug)
              .replace(/^---$/m, '---\nmanualEdit: true');
            await writeFile(outPath, newFm + bodyMatch[1], 'utf-8');
            stats.ok++;
            audit.push({
              slug: meta.slug, category,
              title: realTitle,
              words: bodyMatch[1].split(/\s+/).filter(Boolean).length,
              oldUrl: meta.url,
            });
            continue;
          }
        }
      }

      await writeFile(outPath, fm + md + '\n', 'utf-8');

      const words = md.split(/\s+/).filter(Boolean).length;
      audit.push({
        slug: meta.slug,
        category,
        title: meta.title ?? meta.slug,
        words,
        oldUrl: meta.url,
      });
      stats.ok++;
    } catch (err) {
      stats.failed++;
      console.error(`! ${path} -> ${(err as Error).message}`);
    }
  }

  // Audit jako CSV
  const csv = [
    'slug,category,words,title,old_url',
    ...audit
      .sort((a, b) => a.category.localeCompare(b.category) || a.slug.localeCompare(b.slug))
      .map((r) => [r.slug, r.category, r.words, JSON.stringify(r.title), r.oldUrl].join(',')),
  ].join('\n');
  await writeFile(join(OUT_DIR, '_audit.csv'), csv, 'utf-8');

  console.log(`\n=== Konverze hotová ===`);
  console.log(`Konvertováno: ${stats.ok}`);
  console.log(`Přeskočeno:   ${stats.skipped}`);
  console.log(`Chyby:        ${stats.failed}`);
  console.log(`Audit:        ${join(OUT_DIR, '_audit.csv')}`);

  // Per-kategorie souhrn
  const byCategory = audit.reduce<Record<string, { count: number; words: number }>>((acc, r) => {
    acc[r.category] ??= { count: 0, words: 0 };
    acc[r.category].count++;
    acc[r.category].words += r.words;
    return acc;
  }, {});
  console.log('\nKategorie:');
  for (const [cat, s] of Object.entries(byCategory).sort((a, b) => b[1].count - a[1].count)) {
    console.log(`  ${cat.padEnd(15)} ${s.count.toString().padStart(4)} článků  ${s.words.toString().padStart(7)} slov`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
