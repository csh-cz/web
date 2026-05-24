/**
 * remark plugin: CSH custom directives → Astro components.
 *
 * Allows editors to invoke Astro components from plain Markdown (.md) files
 * without needing MDX + JSX import statements. This solves the problem that
 * Sveltia CMS markdown editor doesn't parse MDX (crashes on `import` + JSX).
 *
 * Syntax (remark-directive containerDirective / leafDirective):
 *
 *   ::prs10-live                      → <PRS10Live />
 *   ::cas-slovem                      → <CasSlovem />
 *   ::cas-segmentovky                 → <CasSegmentovky />
 *   ::slunecni-klementinum            → <SlunecniHodinyKlementinum />
 *   ::tabor-orloj                     → <TaborOrloj />
 *   ::zidovske-hodiny                 → <ZidovskeHodiny />
 *
 *   ::youtube{id="abc" title="X" align="right" ratio="16/9"}
 *                                     → <YouTube id="abc" title="X" align="right" ratio="16/9" />
 *
 *   ::pdf-pager{src="/d.pdf" title="T" pages="76"}
 *                                     → <PdfPager src="/d.pdf" title="T" pages={76} />
 *
 *   ::photo{src="..." alt="..." class="img-hero" author="X" license="..."
 *           authorUrl="..." licenseUrl="..." sourceUrl="..." year="2014"}
 *                                     → <Photo {...attrs} />
 *
 * How it works:
 *   1. remark-directive plugin (must be loaded BEFORE this one) parses
 *      `::name{attr=value}` syntax into directive AST nodes.
 *   2. This plugin transforms directive nodes into hast `html` raw nodes
 *      containing Astro JSX syntax. At MDX/HTML render time Astro picks
 *      up the components via auto-imports (configured in astro.config.mjs).
 *
 * Auto-import note:
 *   Astro 5 does NOT auto-import JSX from Markdown files. Therefore we
 *   emit the components via raw HTML pass-through, and Astro's Markdown
 *   rendering pipeline preserves them. The components are pre-registered
 *   in the `components` prop passed to <Content components={...}/> in
 *   the page layout, OR via a global registration helper.
 *
 *   PRACTICAL FALLBACK: emit raw HTML `<csh-comp data-name="...">` and
 *   let a small client-side hydration script swap them. But this loses
 *   SSR benefits. Better path: have the layout pass components.
 *
 * Implementation choice (V1): we emit Astro JSX as `mdxJsxFlowElement`
 * AST nodes. This works because:
 *   - .md files in Astro 5 still go through MDX-style component pipeline
 *     IF an `<Content components={...}>` is used.
 *   - Without that, we'd need .mdx files. The whole point of this
 *     migration is to use .md so Sveltia can edit them, so we accept
 *     the constraint: page layouts that render content collections MUST
 *     pass components via the `<Content components={{...}}/>` prop.
 */
import { visit } from 'unist-util-visit';

/**
 * R2 CDN base — symetrie s rehype-picture (packages/rehype-picture/index.mjs)
 * a Photo.astro (apps/hodinarium-eu/src/components/Photo.astro). Hardcoded na
 * třech místech (TODO: shared const po A.9 DNS switchi z pub-…r2.dev na
 * imgcdn.<doména>).
 */
const CDN_BASE = 'https://pub-e96bd8c658664b38af73a48cb8872b60.r2.dev';
const RASTER_RE = /\.(jpe?g|png)(\?.*)?$/i;

/** Minimal HTML-attribute escape pro raw `html` mdast node. */
function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Soběstačný `<figure class="photo">` markup pro `::photo` v **.md** souborech.
 *
 * Proč ne `<Photo>` komponenta: `.md` (na rozdíl od `.mdx`) nejde přes MDX
 * kompilátor, takže `mdxJsxFlowElement` uzly se tiše zahodí. Emitujeme proto
 * rovnou HTML — VČETNĚ R2 URL + `<picture>` avif/webp (nečekáme na
 * rehype-picture, ať jsme nezávislí na pořadí rehype-raw × rehype-picture).
 * Styling zajišťuje `.photo` / `.img-credit` v global.css (dřív `is:global`
 * v Photo.astro, přesunuto aby fungovalo i bez komponenty).
 *
 * Credit (TASL) z explicitních atributů; XMP fallback tu nemáme (originály
 * po A.26 nejsou lokálně) — `.md` karty stejně uvádějí `author` přímo.
 */
function photoHtml(p) {
  const src = p.src || '';
  const cdnSrc = src.startsWith('/img/') ? CDN_BASE + src : src;
  const isRaster = src.startsWith('/img/') && RASTER_RE.test(src);
  const variantBase = isRaster ? CDN_BASE + src.replace(RASTER_RE, '') : '';
  const imgClass = p.class ? ` class="${esc(p.class)}"` : '';
  const imgTag =
    `<img src="${esc(cdnSrc)}" alt="${esc(p.alt)}"${imgClass} loading="lazy" decoding="async">`;
  const media = isRaster
    ? `<picture>` +
      `<source type="image/avif" srcset="${esc(variantBase)}.avif">` +
      `<source type="image/webp" srcset="${esc(variantBase)}.webp">` +
      imgTag +
      `</picture>`
    : imgTag;

  const showCredit = Boolean(p.author || p.license || p.sourceUrl);
  let caption = '';
  if (showCredit) {
    const parts = [];
    if (p.author) {
      const name = p.authorUrl
        ? `<a href="${esc(p.authorUrl)}" rel="noopener" target="_blank">${esc(p.author)}</a>`
        : esc(p.author);
      parts.push(`Foto:&nbsp;${name}${p.year ? ` (${esc(p.year)})` : ''}`);
    }
    if (p.license) {
      parts.push(
        p.licenseUrl
          ? `<a href="${esc(p.licenseUrl)}" rel="noopener nofollow" target="_blank">${esc(p.license)}</a>`
          : `<span>${esc(p.license)}</span>`,
      );
    }
    if (p.sourceUrl) {
      parts.push(`<a href="${esc(p.sourceUrl)}" rel="noopener" target="_blank">zdroj</a>`);
    }
    caption = `<figcaption class="img-credit">${parts.join(' · ')}</figcaption>`;
  } else if (p.caption) {
    caption = `<figcaption class="img-caption-below">${esc(p.caption)}</figcaption>`;
  }

  return `<figure class="photo">${media}${caption}</figure>`;
}

/**
 * Directive name → { component: PascalCase tag, parse: (attrs) => normalized props }
 *
 * `parse` lets us coerce attribute strings into the types each component
 * expects (e.g. pages: number for PdfPager, year: number for Photo).
 */
const DIRECTIVES = {
  // Zero-arg widgets
  'prs10-live':        { component: 'PRS10Live' },
  'cas-slovem':        { component: 'CasSlovem' },
  'cas-segmentovky':   { component: 'CasSegmentovky' },
  'slunecni-klementinum': { component: 'SlunecniHodinyKlementinum' },
  'tabor-orloj':       { component: 'TaborOrloj' },
  'zidovske-hodiny':   { component: 'ZidovskeHodiny' },

  // With parameters
  'youtube': {
    component: 'YouTube',
    parse: (a) => ({
      id: a.id,
      title: a.title,
      align: a.align,
      ratio: a.ratio,
    }),
  },
  'pdf-pager': {
    component: 'PdfPager',
    parse: (a) => ({
      src: a.src,
      title: a.title,
      pages: a.pages ? Number(a.pages) : undefined,
    }),
  },
  'photo': {
    component: 'Photo',
    parse: (a) => ({
      src: a.src,
      alt: a.alt,
      class: a.class,
      caption: a.caption,
      author: a.author,
      authorUrl: a.authorUrl,
      license: a.license,
      licenseUrl: a.licenseUrl,
      sourceUrl: a.sourceUrl,
      year: a.year ? Number(a.year) : undefined,
    }),
  },
};

/**
 * Build an `mdxJsxFlowElement` AST node compatible with Astro's MDX parser.
 *
 * VŠECHNY hodnoty atributů jako string. Důvod: `mdxJsxAttributeValueExpression`
 * (pro `prop={76}` style JS výrazy) vyžaduje pre-parsed `data.estree`. Bez něj
 * rollup/esbuild při kompilaci .mdx → JSX zhavaruje s "Expression expected".
 * Akceptovatelný trade-off: Astro komponenty (PdfPager `pages: number` apod.)
 * dostanou string `"76"` místo numeric `76`. Buď coerce v komponentě
 * (`Number(pages)`) nebo nech být — template-level rendering string i číslo
 * vykreslí stejně.
 */
function jsxNode(componentName, props) {
  const attributes = Object.entries(props)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([name, value]) => ({
      type: 'mdxJsxAttribute',
      name,
      value: String(value),
    }));

  return {
    type: 'mdxJsxFlowElement',
    name: componentName,
    attributes,
    children: [],
  };
}

/**
 * Reconstructs the original source text for a directive node, so we can
 * emit it as plain text when the directive isn't one we know about.
 *
 * Text directives (single colon `:name`) are extremely greedy — `12:00`,
 * `0:00`, `:SS` in YAML examples etc. all get parsed as text directives.
 * We never use `:name` syntax, so all text directives are unintentional
 * and must be rendered back as text.
 */
function reconstructText(node) {
  const sigil = node.type === 'containerDirective'
    ? ':::'
    : node.type === 'leafDirective'
    ? '::'
    : ':';
  let s = sigil + node.name;
  if (node.attributes && Object.keys(node.attributes).length) {
    const attrs = Object.entries(node.attributes)
      .map(([k, v]) => v === '' ? k : `${k}="${v}"`)
      .join(' ');
    s += `{${attrs}}`;
  }
  return s;
}

export default function remarkCshDirectives() {
  return (tree, file) => {
    // `.md` (na rozdíl od `.mdx`) nejde přes MDX kompilátor → `mdxJsxFlowElement`
    // uzly se zahodí. Pro `::photo` v `.md` emitujeme proto raw HTML (photoHtml).
    const isMd =
      typeof file?.path === 'string' && /\.md$/i.test(file.path) && !/\.mdx$/i.test(file.path);
    visit(tree, (node, index, parent) => {
      if (
        node.type !== 'containerDirective' &&
        node.type !== 'leafDirective' &&
        node.type !== 'textDirective'
      ) {
        return;
      }
      // Text directives (`:name`) are never intentional — they catch
      // `12:00`, `:SS` etc. Always restore to plain text.
      if (node.type === 'textDirective') {
        if (parent && typeof index === 'number') {
          parent.children[index] = { type: 'text', value: reconstructText(node) };
        }
        return;
      }
      const spec = DIRECTIVES[node.name];
      if (!spec) {
        // Unknown leaf/container directive — emit as plain text so MDX compiler
        // doesn't error out. Log once per file.
        const fp = file?.path || '<unknown>';
        console.warn(`[remark-csh-directives] Unknown directive "::${node.name}" in ${fp} — emit as plain text`);
        if (parent && typeof index === 'number') {
          parent.children[index] = { type: 'text', value: reconstructText(node) };
        }
        return;
      }
      const rawAttrs = node.attributes || {};
      const props = spec.parse ? spec.parse(rawAttrs) : {};
      // `.md` + `::photo` → soběstačný raw HTML <figure> (MDX komponenta by se
      // v non-MDX pipeline zahodila). Ostatní direktivy jsou jen v `.mdx`.
      if (isMd && node.name === 'photo') {
        if (parent && typeof index === 'number') {
          parent.children[index] = { type: 'html', value: photoHtml(props) };
        }
        return;
      }
      const replacement = jsxNode(spec.component, props);
      if (parent && typeof index === 'number') {
        parent.children[index] = replacement;
      }
    });
  };
}

/** Exported list of registered component names — for layout to pass to <Content components={...}>. */
export const REGISTERED_COMPONENTS = Object.values(DIRECTIVES).map((d) => d.component);
