/**
 * R2 CDN URL helper — symetrie s rehype-picture (packages/rehype-picture/index.mjs)
 * a Photo.astro (apps/hodinarium-eu/src/components/Photo.astro).
 *
 * Použít všude, kde Astro template rendruje `<img src={...}>` z dat
 * (např. thumbnail v tabulkách hodinari medailonů, kde nejde Photo komponenta
 * kvůli table cell layoutu).
 *
 * **Cíl A.26**: žádné `<img src="/img/...">` v live HTML — všechny img
 * směřují na R2 CDN. Po validation week se `git rm -r public/img/` a
 * lokální `/img/` URL přestane existovat.
 *
 * TODO: extrahovat cdnBase do shared config (astro.config.mjs, Photo.astro,
 * cdnImage.ts dnes všechny hardcoded — symptomy proč to dělat až po DNS switch
 * kdy se i tak změní z `pub-...r2.dev` na `imgcdn.<doména>`).
 */

const CDN_BASE = 'https://pub-e96bd8c658664b38af73a48cb8872b60.r2.dev';

/** Přepíše `/img/...` URL na R2 CDN; externí URL nechá netknutou. */
export function cdnUrl(src: string | undefined | null): string {
  if (!src) return '';
  return src.startsWith('/img/') ? `${CDN_BASE}${src}` : src;
}

/** Pro `<picture>` s AVIF/WebP variantami vrátí base URL bez extense.
 *  Vrací `null` pokud src není raster image v `/img/...`. */
export function cdnVariantBase(src: string | undefined | null): string | null {
  if (!src || !src.startsWith('/img/')) return null;
  const m = /\.(jpe?g|png)(\?.*)?$/i.exec(src);
  if (!m) return null;
  return `${CDN_BASE}${src.slice(0, -m[0].length)}`;
}
