#!/usr/bin/env node
/**
 * Audit hero / full-width obrázků v hodinarium-eu — najdou všechny
 * obrázky s "hero" rolí a změří jejich rozlišení. Cílové rozlišení
 * pro full-width display na desktopu (~960-1200 px content) je min.
 * 1600 px width (s rezervou pro retina + lightbox).
 *
 * Hero/full-width zdroje:
 *   - kroky/*.mdx — frontmatter `hero: { src, alt, caption, credit }`
 *   - soupis-veznich-hodin/*.mdx — foto[0] (zobrazuje se jako hero
 *     v karta detail kontextu, single-photo grid je full-width po
 *     auto-fit oprava 5a3e221)
 *   - clanky/*.mdx — frontmatter `thumbnail` + `ogImage` + první
 *     `<Photo>` v body s `align="hero"` nebo bez align (defaultně
 *     full-width při dostatečné šířce)
 */
import { readFile, readdir } from 'node:fs/promises';
import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import yaml from 'yaml';

const ROOT = process.cwd();
const PUBLIC_IMG = join(ROOT, 'apps/hodinarium-eu/public');
// Threshold: pro full-width hero na desktopu (1200 px container, retina
// 2× = 2400 px, dovedeme na 1600 px JPEG q85 ~ 750 KB). Pod tímto
// thresholdem hero vypadá rozmazaně.
const HERO_MIN_WIDTH = 1600;
// Threshold pro hero "OK ale lépe by bylo víc". Poslední hero/full
// foto by měl mít aspoň 1200 px.
const HERO_MIN_USABLE = 1200;

async function getImageSize(path) {
  try {
    const m = await sharp(path).metadata();
    return { w: m.width || 0, h: m.height || 0 };
  } catch (e) {
    return null;
  }
}

function parseFrontmatter(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  try { return yaml.parse(m[1]); } catch { return null; }
}

function pageUrl(slug, kind) {
  switch (kind) {
    case 'kroky': return `/kroky/${slug}/`;
    case 'soupis': return `/soupis-veznich-hodin/${slug}/`;
    case 'clanky': return null; // map z frontmatter category
    case 'karta': return `/sbirka/karta/${slug}/`;
    case 'hodinari': return `/hodinari/${slug}/`;
    default: return `/${slug}/`;
  }
}

async function* walk(dir) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.isFile() && (p.endsWith('.md') || p.endsWith('.mdx'))) yield p;
  }
}

async function checkImage(src) {
  if (!src || !src.startsWith('/')) return null;
  const path = join(PUBLIC_IMG, src);
  return await getImageSize(path);
}

const findings = [];

// 1) kroky/*.mdx — hero field
for await (const file of walk(join(ROOT, 'content/kroky'))) {
  const content = await readFile(file, 'utf-8');
  const fm = parseFrontmatter(content);
  if (!fm?.hero?.src) continue;
  const size = await checkImage(fm.hero.src);
  const status = size === null ? 'MISSING' :
    size.w < HERO_MIN_USABLE ? 'TOO_SMALL' :
    size.w < HERO_MIN_WIDTH ? 'BORDERLINE' : 'OK';
  if (status !== 'OK') {
    findings.push({
      kind: 'kroky',
      slug: fm.slug,
      title: fm.title,
      url: pageUrl(fm.slug, 'kroky'),
      file: fm.hero.src,
      width: size?.w,
      height: size?.h,
      status,
      role: 'hero (kroky frontmatter)',
    });
  }
}

// 2) soupis-veznich-hodin/*.mdx — foto[0]
for await (const file of walk(join(ROOT, 'content/soupis-veznich-hodin'))) {
  const content = await readFile(file, 'utf-8');
  const fm = parseFrontmatter(content);
  const fotos = fm?.foto;
  if (!Array.isArray(fotos) || fotos.length === 0) continue;
  const f0 = fotos[0];
  if (!f0?.src) continue;
  const size = await checkImage(f0.src);
  const status = size === null ? 'MISSING' :
    size.w < HERO_MIN_USABLE ? 'TOO_SMALL' :
    size.w < HERO_MIN_WIDTH ? 'BORDERLINE' : 'OK';
  if (status !== 'OK') {
    const obec = fm?.puvodniMisto?.obec || '?';
    const budova = fm?.puvodniMisto?.budova || '';
    const title = `${obec}${budova ? ' — ' + budova : ''} (${fm.rok})`;
    findings.push({
      kind: 'soupis',
      slug: fm.slug,
      title,
      url: pageUrl(fm.slug, 'soupis'),
      file: f0.src,
      width: size?.w,
      height: size?.h,
      status,
      role: `foto[0] typ=${f0.typ || '?'} (single-photo full-width)`,
    });
  }
}

// 3) hodinari/*.mdx — portret field
for await (const file of walk(join(ROOT, 'content/hodinari'))) {
  const content = await readFile(file, 'utf-8');
  const fm = parseFrontmatter(content);
  if (!fm?.portret) continue;
  const size = await checkImage(fm.portret);
  // Portrét je typically smaller (head shot), threshold lower (800 px)
  const PORTRET_MIN = 800;
  const status = size === null ? 'MISSING' :
    size.w < 600 ? 'TOO_SMALL' :
    size.w < PORTRET_MIN ? 'BORDERLINE' : 'OK';
  if (status !== 'OK') {
    findings.push({
      kind: 'hodinari',
      slug: fm.slug,
      title: fm.title,
      url: pageUrl(fm.slug, 'hodinari'),
      file: fm.portret,
      width: size?.w,
      height: size?.h,
      status,
      role: `portret hodináře (sub-1200 OK pro head shot, ale <600 problem)`,
    });
  }
}

// 4) Article body — první obrázek (markdown ![](src) nebo <Photo src=...>)
//    Article render typicky umístí první obrázek nahoře přes celou
//    šířku jako de-facto hero. Audituji oba způsoby zápisu.
for await (const file of walk(join(ROOT, 'content/hodinarium-eu'))) {
  const content = await readFile(file, 'utf-8');
  const fm = parseFrontmatter(content);
  if (!fm?.slug) continue;

  // Najdi první obrázek v body (po frontmatteru). Heuristika "hero":
  // image musí být v prvních ~400 znacích body (po případných imports
  // nebo úvodním odstavci s textem). Inline obrázky uvnitř článku jsou
  // jen ilustrace, ne hero, a ty audit vynechává — generovaly by velký
  // šum (~150 false positives napříč legacy clanky).
  const fmEnd = content.indexOf('\n---\n');
  const body = fmEnd >= 0 ? content.slice(fmEnd + 5) : content;
  // Skip leading import statements (MDX) — Photo/Markdown image
  // by měl následovat hned za nimi.
  const afterImports = body.replace(/^(import\s+[^\n]+\n+)+/, '');
  const HERO_BUDGET = 400;
  const photoRe = /<Photo\b([^>]*)>/;
  const mdImgRe = /!\[[^\]]*\]\(([^)]+)\)/;
  const photoM = afterImports.match(photoRe);
  const mdM = afterImports.match(mdImgRe);

  let src = null;
  let role = '';
  if (photoM && photoM.index < HERO_BUDGET && (mdM === null || photoM.index < mdM.index)) {
    const srcMatch = photoM[1].match(/src=["']([^"']+)["']/);
    src = srcMatch?.[1];
    role = `<Photo> v body (hero — prvních ${HERO_BUDGET} znaků)`;
  } else if (mdM && mdM.index < HERO_BUDGET) {
    src = mdM[1].trim().split(/\s+/)[0]; // kvůli ![](src "title")
    role = `markdown ![](src) v body (hero — prvních ${HERO_BUDGET} znaků)`;
  }
  if (!src || !src.startsWith('/')) continue;

  const size = await checkImage(src);
  const status = size === null ? 'MISSING' :
    size.w < HERO_MIN_USABLE ? 'TOO_SMALL' :
    size.w < HERO_MIN_WIDTH ? 'BORDERLINE' : 'OK';
  if (status !== 'OK') {
    const url = fm.category ? `/${fm.category}/${fm.slug}/` : `/${fm.slug}/`;
    const isKarta = fm.podsekce === 'karta';
    findings.push({
      kind: isKarta ? 'karta' : 'clanky',
      slug: fm.slug,
      title: fm.title,
      url: isKarta ? `/sbirka/karta/${fm.slug}/` : url,
      file: src,
      width: size?.w,
      height: size?.h,
      status,
      role,
    });
  }
}

// Sort: TOO_SMALL > MISSING > BORDERLINE; pak podle kind
const orderStatus = { TOO_SMALL: 0, MISSING: 1, BORDERLINE: 2 };
findings.sort((a, b) => {
  const so = orderStatus[a.status] - orderStatus[b.status];
  if (so !== 0) return so;
  return a.kind.localeCompare(b.kind);
});

console.log(`Total findings: ${findings.length}`);
console.log(`  TOO_SMALL: ${findings.filter(f => f.status === 'TOO_SMALL').length}`);
console.log(`  BORDERLINE: ${findings.filter(f => f.status === 'BORDERLINE').length}`);
console.log(`  MISSING: ${findings.filter(f => f.status === 'MISSING').length}`);
console.log('');
console.log(JSON.stringify(findings, null, 2));
