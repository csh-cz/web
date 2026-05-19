import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import rehypePicture from '../../packages/rehype-picture/index.mjs';
import remarkDirective from 'remark-directive';
import remarkCshDirectives from '../../packages/remark-csh-directives/index.mjs';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import imageSizes from './src/data/image-sizes.json' with { type: 'json' };

// Build-time discovery draft articles (frontmatter `draft: true`).
// Sitemap je vygenerován z rendered pages, takže draft articles by tam
// jinak skončily. Vyřezáváme je tady — vedle catalog filtr (build-catalog.ts
// drafty skip) tvoří kompletní pipeline pro draft hide.
const __dirname = dirname(fileURLToPath(import.meta.url));
const contentDir = join(__dirname, '../../content/hodinarium-eu');
const draftSlugs = new Set();
try {
  for (const f of readdirSync(contentDir)) {
    if (!f.endsWith('.md') && !f.endsWith('.mdx')) continue;
    const txt = readFileSync(join(contentDir, f), 'utf8');
    if (/^draft:\s*true\s*$/m.test(txt)) {
      draftSlugs.add(f.replace(/\.(md|mdx)$/, ''));
    }
  }
} catch { /* missing content/, OK */ }

export default defineConfig({
  // Dočasně pages.dev — ostrá doména hodinarium.eu zatím neběží.
  // Po DNS switch změnit zpět na 'https://hodinarium.eu'.
  site: 'https://hodinarium-eu.pages.dev',
  trailingSlash: 'never',
  build: {
    format: 'directory',
  },
  markdown: {
    remarkPlugins: [
      // remark-directive parsuje `::name{attr=value}` syntax do AST.
      // Musí být PŘED remarkCshDirectives, který tyto direktivy mapuje na komponenty.
      remarkDirective,
      remarkCshDirectives,
      // remark-math: `$inline$` a `$$display$$` LaTeX matematické výrazy
      remarkMath,
    ],
    rehypePlugins: [
      [rehypePicture, {
        imageSizes,
        wrapInPicture: true,
        // DEV stage URL — po DNS switch nahradit za imgcdn.<doména>.cz.
        cdnBase: 'https://pub-e96bd8c658664b38af73a48cb8872b60.r2.dev',
      }],
      // rehype-katex: převede math AST nodes (z remark-math) na HTML.
      // Vyžaduje KaTeX CSS v Base.astro (https://katex.org/docs/font.html).
      rehypeKatex,
    ],
  },
  integrations: [
    // mdx() integrace MUSÍ dostat directive plugins explicitně.
    // Default `extendMarkdownConfig: true` přebírá plugins z markdown
    // config, ale micromark-extension-directive (registrovaný přes
    // remark-directive) se musí inicializovat v MDX parseru SPECIFICKY,
    // aby `::name{...}` syntax fungovala v .mdx souborech.
    mdx({
      remarkPlugins: [remarkDirective, remarkCshDirectives, remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
    sitemap({
      filter: (page) => {
        // /redakce a /redakce/* je gated pro editory — z indexace ven.
        // Pozor: `/redakce` (bez trailing) by `/redakce/` includes nezachytil,
        // proto explicit endsWith check.
        if (page.includes('/redakce/') || page.endsWith('/redakce')) return false;
        // /admin/* (Sveltia CMS) — taky ne.
        if (page.includes('/admin/')) return false;
        // /og-preview — interní dev page (preview OG karet pro design review).
        if (page.endsWith('/og-preview') || page.endsWith('/og-preview/')) return false;
        // Draft articles — vyloučit z sitemap.
        for (const slug of draftSlugs) {
          if (page.includes(`/${slug}`)) return false;
        }
        return true;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
