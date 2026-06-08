/**
 * Rehype plugin pro vylepšení <img> v markdown obsahu:
 *
 * 1. Doplní `loading="lazy"` a `decoding="async"` na všechny <img>
 *    bez explicitní hodnoty.
 * 2. Doplní intrinsickou `width`/`height` z mapy `imageSizes`
 *    (CLS prevence).
 * 3. Pokud volající dodá `wrapInPicture: true` a obrázek je raster
 *    (jpg/png), zabalí ho do <picture> s AVIF a WebP `<source>`
 *    elementy. **Předpoklad**: vedle .jpg/.png existuje .avif a .webp
 *    sourozenec — generuje je `scripts/generate-image-formats.ts`.
 *
 * Default `wrapInPicture: false` — bezpečně se nasadí dřív, než se
 * vygenerují varianty. Po jejich nasazení flipne uživatel volbu na true.
 *
 * Use:
 *   import rehypePicture from '@csh/rehype-picture';
 *   import imageSizes from './src/data/image-sizes.json' with {type:'json'};
 *   ...
 *   markdown: { rehypePlugins: [[rehypePicture, { imageSizes, wrapInPicture: true }]] }
 */
import { visit } from 'unist-util-visit';

const RASTER_RE = /\.(jpe?g|png)(\?.*)?$/i;

// A.34 — multi-width srcset. MUSÍ se shodovat s generátorem
// (scripts/generate-image-formats.ts): width varianty `{base}-{bp}w.{fmt}`
// existují jen pro zdroje šířky >= 1024 a breakpointy MENŠÍ než šířka zdroje.
const SRCSET_BREAKPOINTS = [480, 1024, 1920];
const SRCSET_MIN_SOURCE_WIDTH = 1024;
const SRCSET_SIZES = '(max-width: 768px) 100vw, 760px';

/**
 * Sestaví srcset string. Pokud je zdroj dost široký (>= 1024), vrátí
 * width-descriptor srcset s vygenerovanými variantami; jinak jednoduchý
 * srcset s plnou variantou (žádné width varianty neexistují).
 * @param {string} variantBase  base URL bez extense (vč. CDN)
 * @param {'avif'|'webp'} fmt
 * @param {number} w  šířka zdroje (z image-sizes.json)
 * @param {string} cb  cache-bust query (`?v=hash`) nebo '' (z image-hashes.json)
 */
function buildSrcset(variantBase, fmt, w, cb = '') {
  if (!w || w < SRCSET_MIN_SOURCE_WIDTH) return `${variantBase}.${fmt}${cb}`;
  const parts = [];
  for (const bp of SRCSET_BREAKPOINTS) {
    if (bp < w) parts.push(`${variantBase}-${bp}w.${fmt}${cb} ${bp}w`);
  }
  // Plné-res jako největší descriptor jen do 1920 px; větší zdroje strop
  // na 1920w variantě (nechceme servírovat 4000px originál přes srcset).
  if (w <= 1920) parts.push(`${variantBase}.${fmt}${cb} ${w}w`);
  return parts.join(', ');
}

/**
 * @param {{
 *   imageSizes?: Record<string, { w: number, h: number }>,
 *   wrapInPicture?: boolean,
 *   cdnBase?: string,
 * }} [opts]
 */
export default function rehypePicture(opts = {}) {
  const sizes = opts.imageSizes ?? {};
  const hashes = opts.imageHashes ?? {};
  const wrap = opts.wrapInPicture === true;
  const cdnBase = (opts.cdnBase ?? '').replace(/\/+$/, '');

  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      // Linkované obrázky `[![]()](/img/x.jpg)` — <img> src se přepíše níže,
      // ale wrapping <a href="/img/…"> by zůstal lokální → po `git rm public/img/`
      // (A.26) by klik na zoom 404. Přepiš i href na R2 CDN.
      if (node.tagName === 'a') {
        const href = node.properties && node.properties.href;
        if (cdnBase && typeof href === 'string' && href.startsWith('/img/')) {
          node.properties.href = `${cdnBase}${href}`;
        }
        return;
      }
      if (
        node.tagName !== 'img' ||
        !parent ||
        parent.type !== 'element' ||
        index === undefined ||
        index === null
      ) {
        return;
      }

      // Už zabalený? (rerun protection)
      if (parent.tagName === 'picture') return;

      const src = node.properties && node.properties.src;
      if (typeof src !== 'string') return;

      // Cache-bust query (`?v=hash`) z image-hashes.json — viz Photo.astro.
      // R2 servíruje rastry immutable/1 rok; bez busted URL by změna obsahu
      // pod stejným názvem nedorazila. Prázdné, když hash chybí.
      const cb = hashes[src] ? `?v=${hashes[src]}` : '';

      // Doplň width/height (intrinsic, CLS), pokud chybí a máme z indexu.
      const dim = sizes[src];
      if (dim) {
        node.properties = node.properties || {};
        if (!node.properties.width) node.properties.width = dim.w;
        if (!node.properties.height) node.properties.height = dim.h;
      }

      // Doplň lazy/async hints (idempotentně).
      node.properties = node.properties || {};
      if (!node.properties.loading) node.properties.loading = 'lazy';
      if (!node.properties.decoding) node.properties.decoding = 'async';

      // <picture> wrapping — jen pokud volající explicitně povolil
      // a src je raster.
      if (!wrap) return;
      if (!src.startsWith('/img/')) return;
      if (!RASTER_RE.test(src)) {
        // Non-raster (gif, svg, …) — nemá AVIF/WebP varianty, tedy žádný
        // <picture> wrap; jen přepiš src na R2 CDN, ať se po `git rm public/img/`
        // (A.26) servíruje z R2 jako vše ostatní.
        if (cdnBase) node.properties.src = `${cdnBase}${src}${cb}`;
        return;
      }

      const base = src.replace(RASTER_RE, '');
      // <source> i fallback <img> ukazují na R2 CDN (pokud nastaveno).
      // JPG zdroj v gitu už neukládáme; po Sveltia uploadu Action zdroj
      // přesune na R2 a smaže z repo. Fallback <img> tedy odkazuje na R2,
      // ne na CF Pages.
      const variantBase = cdnBase ? `${cdnBase}${base}` : base;
      if (cdnBase) {
        // Přepiš <img src> na R2 URL (zachová original ext).
        const origExt = src.match(RASTER_RE)?.[0] ?? '';
        node.properties.src = `${cdnBase}${base}${origExt.replace(/\?.*$/, '')}${cb}`;
      }
      // A.34 — width descriptors pro dost velké zdroje (jinak single srcset).
      const w = dim && typeof dim.w === 'number' ? dim.w : 0;
      const eligible = w >= SRCSET_MIN_SOURCE_WIDTH;
      const avifProps = { type: 'image/avif', srcset: buildSrcset(variantBase, 'avif', w, cb) };
      const webpProps = { type: 'image/webp', srcset: buildSrcset(variantBase, 'webp', w, cb) };
      if (eligible) {
        avifProps.sizes = SRCSET_SIZES;
        webpProps.sizes = SRCSET_SIZES;
      }
      const picture = {
        type: 'element',
        tagName: 'picture',
        properties: {},
        children: [
          { type: 'element', tagName: 'source', properties: avifProps, children: [] },
          { type: 'element', tagName: 'source', properties: webpProps, children: [] },
          node,
        ],
      };

      parent.children[index] = picture;
    });
  };
}
