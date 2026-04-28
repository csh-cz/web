import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Dočasně pages.dev — ostrá doména horologie.cz zatím neběží.
  // Po DNS switch změnit zpět na 'https://horologie.cz'.
  site: 'https://horologie-cz.pages.dev',
  trailingSlash: 'never',
  build: {
    format: 'directory',
  },
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
