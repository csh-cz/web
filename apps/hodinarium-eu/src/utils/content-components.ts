/**
 * Sdílený export Astro komponent dostupných v Markdown / MDX content
 * collections přes `<Content components={...}>`.
 *
 * Pattern (po migraci A.11 z MDX import + JSX na markdown direktivy):
 *   - Content soubory (.mdx, .md) nepoužívají `import` statements
 *   - Místo `<Component />` JSX volání používají direktivy `::name{attr}`
 *   - Plugin `@csh/remark-csh-directives` převede direktivy na JSX AST nodes
 *   - Layout detail page předává tyto komponenty jako `components` prop
 *     do `<Content components={CSH_CONTENT_COMPONENTS} />`
 *   - Astro MDX runtime resolve neimportované JSX tags z components map
 *
 * Sveltia CMS workflow:
 *   - Otevře `.mdx` / `.md` jako plain markdown text
 *   - Direktivy `::name{...}` jsou pro Sveltia jen text — neparse je jako JSX
 *   - Editor může klidně upravit textový obsah okolo direktiv
 *   - Save = commit bez problémů (žádný `import` statement v souboru = žádný crash)
 */
import PRS10Live from '../components/PRS10Live.astro';
import CasSlovem from '../components/CasSlovem.astro';
import CasSegmentovky from '../components/CasSegmentovky.astro';
import SlunecniHodinyKlementinum from '../components/SlunecniHodinyKlementinum.astro';
import TaborOrloj from '../components/TaborOrloj.astro';
import ZidovskeHodiny from '../components/ZidovskeHodiny.astro';
import YouTube from '../components/YouTube.astro';
import PdfPager from '../components/PdfPager.astro';
import Photo from '../components/Photo.astro';

export const CSH_CONTENT_COMPONENTS = {
  PRS10Live,
  CasSlovem,
  CasSegmentovky,
  SlunecniHodinyKlementinum,
  TaborOrloj,
  ZidovskeHodiny,
  YouTube,
  PdfPager,
  Photo,
};
