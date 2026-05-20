/**
 * Regrese: byline "Aktualizováno Invalid Date" (commit po a20fdea).
 *
 * Kořen: [slug].astro parsoval lastModified na český string a posílal
 * dál do Article.astro, který ho znova parsoval (selhalo, "Invalid
 * Date"). Teď se předává raw a Article.astro má jediný parser.
 */
import { test, expect } from 'playwright/test';

// Po taxonomii M2 (2026-04-29) se články přesunuly z /clanky/<slug> na
// /<kategorie>/<slug>. Cloudflare _redirects přesměruje staré URL,
// ale page.goto + waitForLoad může na 301 redirect někdy timeout.
// Test používá rovnou nové URL.
//
// /virtualni-muzeum/podebrady byl odebrán ze SAMPLES — Playwright headless
// Chromium na něm občas crashne (Page crashed) ve verifikaci 2026-05-10.
// V normálním Chrome stránka renderuje bez chyb (byline OK, 7 imgs).
// Asi OOM v headless renderer s large JPEG paletou. Coverage byline logiky
// pro virtualni-muzeum kategorii pokryje jiný článek po doplnění.
const SAMPLES = [
  '/projekty/kappa',
  '/virtualni-muzeum/zidovske',
  '/sbirka/slunecni-filler',
  '/sbirka/brillie',
];

for (const url of SAMPLES) {
  test(`${url} — byline má validní datum, ne "Invalid Date"`, async ({ page }) => {
    // domcontentloaded namísto default 'load' — některé stránky s mnoha
    // obrázky (např. /virtualni-muzeum/podebrady s 9 large jpgs) občas
    // page crashly na plný load wait. Byline se rendruje server-side,
    // image load není pro test podstatný.
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const byline = page.locator('.article-byline .byline-date').first();
    await expect(byline).toBeVisible();

    const text = (await byline.textContent()) ?? '';
    expect(text).not.toMatch(/Invalid Date/i);
    // Pokud je datum k dispozici, mělo by mít čitelný formát "X. <měsíc> YYYY"
    if (/Aktualizováno/i.test(text)) {
      expect(text).toMatch(/\d{1,2}\.\s+\S+\s+\d{4}/);
    }

    // <time datetime="..."> musí být validní ISO
    const time = byline.locator('time').first();
    if (await time.count()) {
      const dt = await time.getAttribute('datetime');
      if (dt) {
        const parsed = new Date(dt);
        expect(Number.isNaN(parsed.getTime()), `datetime "${dt}" musí být validní`).toBe(false);
      }
    }
  });
}
