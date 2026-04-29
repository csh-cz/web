/**
 * Build favicon assets z apps/horologie-cz/public/img/logo-csh.svg.
 *
 * Generuje:
 *   public/favicon.svg          — theme-aware SVG (prefers-color-scheme dark/light)
 *   public/favicon-16.png       — fallback 16×16
 *   public/favicon-32.png       — fallback 32×32
 *   public/apple-touch-icon.png — 180×180 Apple touch
 *
 * Originální SVG má #ffffff ve <style> blocích uvnitř (.C1/C2 stroke,
 * .C3 fill). Tady ji přebarvíme na brass-bright (#6e4d1d light /
 * #c8a877 dark) pomocí prefers-color-scheme media query v SVG style.
 *
 * PNG je rasterizováno přes @resvg/resvg-js (čistý Rust SVG → PNG,
 * neumí @media, takže rastruje light variantu jako default — drtivá
 * většina prohlížečů dnes ukazuje světlé tab pozadí, tmavá zlatá
 * #6e4d1d je čitelná).
 *
 * Spusť: tsx scripts/build-favicon.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const APP_PUBLIC = resolve(ROOT, 'apps/horologie-cz/public');

const COLOR_LIGHT = '#6e4d1d'; // brass-bright na light theme — kontrast s bílým tab pozadím
const COLOR_DARK  = '#c8a877'; // brass-bright na dark theme

async function main() {
console.log('→ Build favicon z logo-csh.svg');

const sourceSvg = readFileSync(resolve(APP_PUBLIC, 'img/logo-csh.svg'), 'utf-8');

/**
 * SVG verze pro browser favicon — theme-aware via prefers-color-scheme.
 * Browsery, které favicon SVG renderují (Chrome, Firefox, Safari, Edge),
 * respektují @media query uvnitř <style>.
 */
const themedSvg = sourceSvg
  .replace(/^<\?xml[^>]*\?>\s*/, '')
  .replace(
    /<style>\.C1 \{[^<]*<\/style>/,
    `<style>.C1{stroke:${COLOR_LIGHT};stroke-width:164;fill:none}@media(prefers-color-scheme:dark){.C1{stroke:${COLOR_DARK}}}</style>`,
  )
  .replace(
    /<style>\.C2 \{[^<]*<\/style>/,
    `<style>.C2{stroke:${COLOR_LIGHT};stroke-width:273;fill:none}@media(prefers-color-scheme:dark){.C2{stroke:${COLOR_DARK}}}</style>`,
  )
  .replace(
    /<style>\.C3 \{[^<]*<\/style>/,
    `<style>.C3{fill:${COLOR_LIGHT}}@media(prefers-color-scheme:dark){.C3{fill:${COLOR_DARK}}}</style>`,
  );

writeFileSync(resolve(APP_PUBLIC, 'favicon.svg'), themedSvg);
console.log(`  ✓ favicon.svg (${themedSvg.length} B)`);

/**
 * Pro PNG raster: resvg neumí @media query, použij flat light variantu.
 */
const flatSvg = themedSvg.replace(/@media\(prefers-color-scheme:dark\)\{[^}]+\}/g, '');

/**
 * Standardní browser favicon (transparentní, full-bleed logo).
 * 16/32 — desktop browser tab; 180 — Apple touch (iOS homescreen);
 * 192/512 — Android Chrome homescreen (declared in webmanifest).
 */
const sizes = [
  { size: 16,  name: 'favicon-16.png' },
  { size: 32,  name: 'favicon-32.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
];

for (const { size, name } of sizes) {
  const resvg = new Resvg(flatSvg, {
    fitTo: { mode: 'width', value: size },
    background: 'rgba(255,255,255,0)',
  });
  const png = resvg.render().asPng();
  writeFileSync(resolve(APP_PUBLIC, name), png);
  console.log(`  ✓ ${name} (${png.length} B)`);
}

/**
 * Maskable ikona pro Android Adaptive Icons — vyžaduje "safe zone"
 * (logo je v centrálních ~80%, kolem padding). Android pak ikonu
 * maskuje různými tvary (kruh, squircle, …). Bez safe zone se logo
 * ořízne. Background je opaque (aby ikona neměla průhledné rohy
 * po maskování).
 */
const MASKABLE_SIZE = 512;
const safeFraction = 0.7;  // logo zabírá 70% plochy → 15% padding kolem
const innerSize = Math.round(MASKABLE_SIZE * safeFraction);
const offset = Math.round((MASKABLE_SIZE - innerSize) / 2);

const innerResvg = new Resvg(flatSvg, {
  fitTo: { mode: 'width', value: innerSize },
  background: 'rgba(255,255,255,0)',
});
const innerPng = innerResvg.render().asPng();

// Slož maskable přes sharp: opaque pozadí + logo uprostřed.
const maskablePng = await sharp({
  create: {
    width: MASKABLE_SIZE,
    height: MASKABLE_SIZE,
    channels: 4,
    background: { r: 240, g: 231, b: 210, alpha: 1 }, // brass-light pozadí (#f0e7d2)
  },
})
  .composite([{ input: innerPng, top: offset, left: offset }])
  .png()
  .toBuffer();
writeFileSync(resolve(APP_PUBLIC, 'icon-maskable-512.png'), maskablePng);
console.log(`  ✓ icon-maskable-512.png (${maskablePng.length} B)`);

/**
 * Web manifest — PWA / Android homescreen.
 * iOS používá apple-touch-icon (deklarovaný v <link>), nikoli manifest.
 */
const manifest = {
  name: 'Český spolek horologický',
  short_name: 'ČSH',
  description: 'Sdružení obdivovatelů hodin, restaurátorů a tvůrců',
  start_url: '/',
  display: 'standalone',
  background_color: '#f0e7d2',
  theme_color: '#6e4d1d',
  icons: [
    { src: '/favicon.svg',           sizes: 'any',    type: 'image/svg+xml' },
    { src: '/icon-192.png',          sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png',          sizes: '512x512', type: 'image/png' },
    { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
};
writeFileSync(
  resolve(APP_PUBLIC, 'manifest.webmanifest'),
  JSON.stringify(manifest, null, 2),
);
console.log('  ✓ manifest.webmanifest');

console.log('Hotovo.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
