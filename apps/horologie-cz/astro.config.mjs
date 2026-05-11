import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import rehypePicture from '../../packages/rehype-picture/index.mjs';
import imageSizes from './src/data/image-sizes.json' with { type: 'json' };

export default defineConfig({
  // Dočasně pages.dev — ostrá doména horologie.cz zatím neběží.
  // Po DNS switch změnit zpět na 'https://horologie.cz'.
  site: 'https://horologie-cz.pages.dev',
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
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
