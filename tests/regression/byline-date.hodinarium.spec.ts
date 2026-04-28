/**
 * Regrese: byline "Aktualizováno Invalid Date" (commit po a20fdea).
 *
 * Kořen: [slug].astro parsoval lastModified na český string a posílal
 * dál do Article.astro, který ho znova parsoval (selhalo, "Invalid
 * Date"). Teď se předává raw a Article.astro má jediný parser.
 */
import { test, expect } from 'playwright/test';

const SAMPLES = [
  '/clanky/Kappa',
  '/clanky/zidovske',
  '/clanky/slunecni_filler',
  '/clanky/brillie',
  '/clanky/podebrady',
];

for (const url of SAMPLES) {
  test(`${url} — byline má validní datum, ne "Invalid Date"`, async ({ page }) => {
    await page.goto(url);
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
