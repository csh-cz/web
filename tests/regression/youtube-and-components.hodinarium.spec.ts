/**
 * Regrese: YouTube lite-embed + JS clock komponenty (commit po f36b691).
 *
 * Před tímto commitem byly iframy buď úplně ztracené (turndown bug) nebo
 * čistě externí. Teď máme:
 *   - <YouTube> komponent — thumbnail + play, žádný iframe dokud uživatel
 *     neklikne. Žádné YT cookies dokud nezahraje.
 *   - <CasSlovem> — port normalnicas.js, slovní vyjádření času.
 *   - <CasSegmentovky> — port segmentovky_prg.htm, "placka pendrek" vtípek.
 */
import { test, expect } from 'playwright/test';

test.describe('YouTube lite-embed', () => {
  // Přímé nové URLs po taxonomy refactoru M2 (2026-04-29). Předtím
  // /clanky/<slug>; redirect funguje, ale na mobile profilu (slow CPU)
  // hit občas 30s timeout — direkt URL je deterministický a rychlejší.
  // Kategorie z catalog.json: Arduino + TimeSlider → projekty, mindelheim → muzea.
  const cases = [
    { url: '/projekty/arduino', id: 'RMyYnnAPIV8' },
    { url: '/projekty/time-slider', id: 'VBpDQtAcoWc' },
    { url: '/muzea/mindelheim', id: 'slDssMuXSz4' },
  ];

  for (const c of cases) {
    test(`${c.url} — <YouTube id="${c.id}"> má thumbnail, žádný iframe`, async ({ page }) => {
      await page.goto(c.url);
      const embed = page.locator(`.yt-embed[data-yt-id="${c.id}"]`);
      await expect(embed).toBeVisible();
      // Před kliknutím nesmí být iframe (privacy/perf)
      await expect(embed.locator('iframe')).toHaveCount(0);
      // Thumbnail je vidět
      await expect(embed.locator('img.yt-thumb')).toBeVisible();
      // Po kliknutí se iframe injektne
      await embed.click();
      await expect(embed.locator('iframe')).toHaveCount(1);
      await expect(embed).toHaveClass(/yt-active/);
      // youtube-nocookie domain (privacy)
      const src = await embed.locator('iframe').getAttribute('src');
      expect(src).toContain('youtube-nocookie.com');
      expect(src).toContain(c.id);
    });
  }
});

test('/zajimavosti/normalni — CasSlovem komponent vyplní slovní čas', async ({ page }) => {
  await page.goto('/zajimavosti/normalni');
  const cas = page.locator('[data-cas-slovem]');
  await expect(cas).toBeVisible();
  // JS hook by měl vyplnit text. Ověříme že to není default placeholder.
  await expect(cas).not.toHaveText(/tolik hodin, kolik právě je/);
  // Musí obsahovat aspoň jedno z očekávaných slov (hodin / čtvrt / půl)
  const text = await cas.textContent();
  expect(text, `obsah: ${text}`).toMatch(/hodin|čtvrt|půl|sekund/);
});

test('/projekty/segmentovky-s-prekladem — segmentovky formát + slovní překlad', async ({ page }) => {
  await page.goto('/projekty/segmentovky-s-prekladem');
  const cas = page.locator('[data-seg-cas]');
  const pre = page.locator('[data-seg-prelozeno]');
  await expect(cas).toBeVisible();
  await expect(pre).toBeVisible();
  // HH:MM:SS formát (po hooknutí JS — ne defaultní 00:00:00 placeholder)
  const text = await cas.textContent();
  expect(text).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  // Překlad musí obsahovat alespoň jedno ze slov ze slovníku
  const preText = await pre.textContent();
  expect(preText, `překlad: ${preText}`).toMatch(/placka|pendrek|zatáčka|ňadra|židlička|koule|švestka|motyka|sněhulák|plácačka/);
});

test('/kronika/sezona2012 — návštěvní kniha inline', async ({ page }) => {
  await page.goto('/kronika/sezona2012');
  // Konkrétní citát z guestbooku
  await expect(page.getByText(/Krásná místnost plná ztraceného/)).toBeVisible();
});
