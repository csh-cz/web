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

/**
 * @param {{
 *   imageSizes?: Record<string, { w: number, h: number }>,
 *   wrapInPicture?: boolean,
 *   cdnBase?: string,
 * }} [opts]
 */
export default function rehypePicture(opts = {}) {
  const sizes = opts.imageSizes ?? {};
  const wrap = opts.wrapInPicture === true;
  const cdnBase = (opts.cdnBase ?? '').replace(/\/+$/, '');

  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
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
      if (!RASTER_RE.test(src)) return;

      const base = src.replace(RASTER_RE, '');
      // <source> i fallback <img> ukazují na R2 CDN (pokud nastaveno).
      // JPG zdroj v gitu už neukládáme; po Sveltia uploadu Action zdroj
      // přesune na R2 a smaže z repo. Fallback <img> tedy odkazuje na R2,
      // ne na CF Pages.
      const variantBase = cdnBase ? `${cdnBase}${base}` : base;
      if (cdnBase) {
        // Přepiš <img src> na R2 URL (zachová original ext).
        const origExt = src.match(RASTER_RE)?.[0] ?? '';
        node.properties.src = `${cdnBase}${base}${origExt.replace(/\?.*$/, '')}`;
      }
      const picture = {
        type: 'element',
        tagName: 'picture',
        properties: {},
        children: [
          {
            type: 'element',
            tagName: 'source',
            properties: { type: 'image/avif', srcset: `${variantBase}.avif` },
            children: [],
          },
          {
            type: 'element',
            tagName: 'source',
            properties: { type: 'image/webp', srcset: `${variantBase}.webp` },
            children: [],
          },
          node,
        ],
      };

      parent.children[index] = picture;
    });
  };
}
