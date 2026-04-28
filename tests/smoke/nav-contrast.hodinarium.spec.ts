/**
 * Regrese: header menu visibility na tmavém podkladu (b400a26).
 *
 * Zajištění, že nav linky mají dostatečný kontrast a hover/focus
 * stav přepíná na brass-bright. Pokud někdo CSS přepíše a default
 * spadne zpátky na #d9b274 (brass-bright) na tmavém pozadí, ten
 * test selže.
 */
import { test, expect } from 'playwright/test';

const NAV_LINKS = ['Atlas', 'Mapa', 'Expozice', 'Sbírka', 'Hodináři', 'Podpora'];

for (const label of NAV_LINKS) {
  test(`nav: '${label}' — defaultní text je světlý (--color-text)`, async ({ page }) => {
    await page.goto('/');
    const link = page.locator('header.site-header nav a', { hasText: label }).first();
    await expect(link).toBeVisible();

    const color = await link.evaluate((el) => getComputedStyle(el).color);
    // --color-text = #f5ecd9 → rgb(245, 236, 217)
    expect(color).toBe('rgb(245, 236, 217)');
  });

  test(`nav: '${label}' — hover přepíná na brass-bright`, async ({ page }) => {
    await page.goto('/');
    const link = page.locator('header.site-header nav a', { hasText: label }).first();
    await link.hover();

    const color = await link.evaluate((el) => getComputedStyle(el).color);
    // --color-brass-bright = #d9b274 → rgb(217, 178, 116)
    expect(color).toBe('rgb(217, 178, 116)');
  });
}

test('nav: žádný odkaz nemizí — barva se neshoduje s pozadím', async ({ page }) => {
  await page.goto('/podpora');

  const links = page.locator('header.site-header nav a');
  const n = await links.count();

  for (let i = 0; i < n; i++) {
    const link = links.nth(i);
    const text = (await link.textContent())?.trim() ?? '';
    if (!text) continue;

    const colors = await link.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        text: cs.color,
        bg: getComputedStyle(document.querySelector('header.site-header')!).backgroundColor,
      };
    });

    // Strong invariant: text barva nesmí být shodná s bg, jinak text "zmizí".
    expect(colors.text, `link "${text}" má text barvu shodnou s pozadím hlavičky`).not.toBe(
      colors.bg,
    );
  }
});
