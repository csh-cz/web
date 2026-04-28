import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import rehypePicture from '../../packages/rehype-picture/index.mjs';

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
      // Bez imageSizes — horologie-cz má málo obrázků, intrinsic w/h
      // není kritické (CLS se uplatní hlavně u dlouhých článků).
      rehypePicture,
    ],
  },
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
