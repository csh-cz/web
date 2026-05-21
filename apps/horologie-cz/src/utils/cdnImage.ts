/**
 * R2 CDN URL helper — symetrie s rehype-picture (packages/rehype-picture)
 * a hodinarium-eu/src/utils/cdnImage.ts.
 *
 * Cíl A.26: žádné `<img src="/img/...">` v live HTML — všechno přes R2 CDN,
 * aby šlo `public/img/` po validation week odstranit z gitu.
 *
 * TODO: po DNS switch nahradit hardcoded R2 dev URL za `imgcdn.<doména>`
 * a sjednotit cdnBase napříč apps (dnes hardcoded i v astro.config.mjs).
 */
const CDN_BASE = 'https://pub-e96bd8c658664b38af73a48cb8872b60.r2.dev';

/** Přepíše `/img/...` URL na R2 CDN; externí/jinou URL nechá netknutou. */
export function cdnUrl(src: string | undefined | null): string {
  if (!src) return '';
  return src.startsWith('/img/') ? `${CDN_BASE}${src}` : src;
}
