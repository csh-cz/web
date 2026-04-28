import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import rehypePicture from '../../packages/rehype-picture/index.mjs';
import imageSizes from './src/data/image-sizes.json' with { type: 'json' };

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
      [rehypePicture, { imageSizes }],
    ],
  },
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
