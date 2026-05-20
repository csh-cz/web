/**
 * Regrese: iframes / Astro komponenty na článcích.
 *
 * Pokrývá:
 *   - Kappa: live monitor iframe na orloj.eu/arduino2_polarizace
 *     (commit b400a26).
 *   - slunecni_filler: SlunecniHodinyKlementinum komponent místo
 *     původního iframu (commit a1a2e2c).
 *   - zidovske: ZidovskeHodiny komponent + tabulky vykreslené jako
 *     proper HTML grid místo "vše v jednom sloupci" (commit a1a2e2c).
 *   - slunecni_polarizacni / vodni_B_Gitton: žádný HOME/Mapa/Kontakt
 *     sidebar boilerplate.
 *
 * Po taxonomy refactoru M2 (2026-04-29): direkt URLs `/<kategorie>/<slug>`
 * místo legacy `/clanky/<slug>` (redirect funguje, ale na mobile profilu
 * občas hit timeout).
 */
import { test, expect } from 'playwright/test';

test('Kappa: live monitor iframe je přítomný a směřuje na orloj.eu', async ({ page }) => {
  await page.goto('/projekty/kappa');
  const iframe = page.locator('iframe.live-monitor');
  await expect(iframe).toBeVisible();
  const src = await iframe.getAttribute('src');
  expect(src).toMatch(/orloj\.eu\/arduino2_polarizace\.php\?MAC=NTPi-/);
});

test('slunecni_filler: Klementinum komponent místo iframu', async ({ page }) => {
  await page.goto('/sbirka/slunecni-filler');
  await expect(page.locator('iframe.filler-clock')).toHaveCount(0);
  await expect(page.locator('figure.klementinum')).toBeVisible();
  // Čas se vyplnil JS hookem
  const time = await page.locator('[data-solar-time]').textContent();
  expect(time).toMatch(/^\d{2}:\d{2}$/);
});

test('zidovske: ZidovskeHodiny komponent — čas v 24-h formátu', async ({ page }) => {
  await page.goto('/virtualni-muzeum/zidovske');
  await expect(page.locator('figure.zidovske-hodiny')).toBeVisible();
  const time = await page.locator('[data-clock-time]').textContent();
  expect(time).toMatch(/^\d{2}:\d{2}$/);
});

test('zidovske: 3 ciferníky vedle sebe (CSS grid, ne sloupec)', async ({ page }) => {
  await page.goto('/virtualni-muzeum/zidovske');
  const grid = page.locator('.zidovske-ciferniky');
  await expect(grid).toBeVisible();
  // 3 figures uvnitř — Normální / Převrácený / Hebrejský
  await expect(grid.locator('figure')).toHaveCount(3);
  // Hebrejský ciferník má lang="he"
  await expect(grid.locator('.zidovske-cifernik[lang="he"]')).toHaveCount(1);
});

test('zidovske: hebrejská abeceda jako řádná tabulka', async ({ page }) => {
  await page.goto('/virtualni-muzeum/zidovske');
  const table = page.locator('table.zidovske-abeceda');
  await expect(table).toBeVisible();
  // 10 řádků (Alef—Jod)
  await expect(table.locator('tbody tr')).toHaveCount(10);
});

test('slunecni_polarizacni: žádný HOME/Mapa/Kontakt sidebar', async ({ page }) => {
  await page.goto('/sbirka/slunecni-polarizacni');
  await expect(page.locator('main a[href="/clanky/index"]')).toHaveCount(0);
  await expect(page.locator('main a[href="/clanky/novinky"]')).toHaveCount(0);
});

test('slunecni_polarizacni: filtr1—4 fotky v těle článku', async ({ page }) => {
  await page.goto('/sbirka/slunecni-polarizacni');
  for (const n of [1, 2, 3, 4]) {
    await expect(page.locator(`main img[src$="filtr${n}.jpg"]`)).toBeVisible();
  }
});

test('vodni_B_Gitton: žádný HOME/Mapa/Kontakt sidebar', async ({ page }) => {
  await page.goto('/sbirka/vodni-b-gitton');
  await expect(page.locator('main a[href="/clanky/index"]')).toHaveCount(0);
});
