import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import rehypePicture from '../../packages/rehype-picture/index.mjs';
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
    rehypePlugins: [
      [rehypePicture, {
        imageSizes,
        wrapInPicture: true,
        // DEV stage URL — po DNS switch nahradit za imgcdn.<doména>.cz.
        cdnBase: 'https://pub-e96bd8c658664b38af73a48cb8872b60.r2.dev',
      }],
    ],
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => {
        // /redakce/* je gated pro editory — z indexace ven.
        if (page.includes('/redakce/')) return false;
        // /admin/* (Sveltia CMS) — taky ne.
        if (page.includes('/admin/')) return false;
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
