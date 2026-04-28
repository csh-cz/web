/**
 * Regrese: /akce — Leaflet "L is not defined" (commit b400a26).
 *
 * Mapa míst konání akcí spolku. Před opravou bylo `<script src="...leaflet.js">`
 * bez `is:inline`, takže ho Astro bundloval jako modul a globální `L`
 * nezískal smysl. Teď je `is:inline`.
 */
import { test, expect } from 'playwright/test';

test('/akce: mapa Leafletu se vykreslí, žádný "L is not defined"', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/akce');

  // Mapa container existuje a vykreslila aspoň jeden <canvas>/<img> tile
  const map = page.locator('#akce-mapa');
  await expect(map).toBeVisible();

  // Po načtení leaflet vytvoří .leaflet-container uvnitř #akce-mapa
  await expect(page.locator('#akce-mapa.leaflet-container')).toBeVisible({ timeout: 10_000 });

  // Pin/marker se objevil
  await expect(page.locator('.leaflet-marker-icon').first()).toBeVisible();

  // Žádné JS chyby od Leafletu
  const leafletErrors = errors.filter((e) => /\bL\b|Leaflet|leaflet/i.test(e));
  expect(leafletErrors, `na /akce je chyba s L/Leaflet:\n${leafletErrors.join('\n')}`).toHaveLength(0);
});
