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
import imageHashes from '../data/image-hashes.json';

const CDN_BASE = 'https://pub-e96bd8c658664b38af73a48cb8872b60.r2.dev';

/** Cache-bust query pro `/img/...` zdroj se známým content-hashem
 *  (image-hashes.json, plněno CI při R2-move). Prázdné, když hash chybí.
 *  Důvod: R2 servíruje rastry `Cache-Control: immutable, max-age=1 rok` —
 *  bez busted URL by změna obsahu pod stejným názvem nedorazila do prohlížeče. */
function cacheBust(src: string): string {
  const h = (imageHashes as Record<string, string>)[src];
  return h ? `?v=${h}` : '';
}

/** Přepíše `/img/...` URL na R2 CDN; externí/jinou URL nechá netknutou. */
export function cdnUrl(src: string | undefined | null): string {
  if (!src) return '';
  return src.startsWith('/img/') ? `${CDN_BASE}${src}${cacheBust(src)}` : src;
}
