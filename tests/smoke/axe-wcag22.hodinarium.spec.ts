/**
 * WCAG 2.2 AA upgrade test. Spouští axe-core jen s tagy které jsou
 * specifické pro WCAG 2.2 (9 nových success criteria oproti 2.1 AA).
 *
 * Důležité: existující `axe-a11y.hodinarium.spec.ts` ověřuje WCAG 2.1 AA
 * jako baseline; tento test je dodatkový, izolovaný report pro upgrade.
 *
 * WCAG 2.2 nové AA kritéria axe-core kontroluje:
 *   - 2.4.11 Focus Not Obscured (Minimum)
 *   - 2.4.13 Focus Appearance (AAA, ale axe ho má v wcag22a tag)
 *   - 2.5.7 Dragging Movements
 *   - 2.5.8 Target Size (Minimum) — interaktivní elementy ≥ 24×24 CSS px
 *   - 3.2.6 Consistent Help
 *   - 3.3.7 Redundant Entry
 *   - 3.3.8 Accessible Authentication (Minimum)
 *
 * Axe-core má pro WCAG 2.2 dvě tag families: `wcag22a` + `wcag22aa`.
 */
import { test } from 'playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = [
  { url: '/', name: 'home' },
  { url: '/sbirka/', name: 'sbirka-index' },
  { url: '/sbirka/karta/inv-1-vezni-hiemann-1884/', name: 'sbirka-karta' },
  { url: '/hodinari/', name: 'hodinari-index' },
  { url: '/hodinari/jan-janata/', name: 'hodinari-medailon' },
  { url: '/soupis-veznich-hodin/', name: 'soupis-index' },
  { url: '/soupis-veznich-hodin/1905-praha-krecmer/', name: 'soupis-karta' },
  { url: '/slovnik/', name: 'slovnik-index' },
  { url: '/slovnik/setrvacka/', name: 'slovnik-heslo' },
  { url: '/kroky/robertuv-krok/', name: 'kroky-detail' },
  { url: '/o-hodinariu/', name: 'o-hodinariu' },
];

for (const { url, name } of PAGES) {
  test(`wcag22aa: ${name} (${url})`, async ({ page }, testInfo) => {
    await page.goto(url);
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag22a', 'wcag22aa'])
      .analyze();

    // Nehází chybu — test je informativní (report). Critical/serious
    // se logují do testInfo annotations pro inspekci.
    for (const v of results.violations) {
      testInfo.annotations.push({
        type: `wcag22 ${v.impact}`,
        description: `${v.id}: ${v.description} (${v.nodes.length}× na stránce). Help: ${v.helpUrl}`,
      });
    }

    console.log(
      `${name}: ${results.violations.length} violations` +
      (results.violations.length > 0
        ? '\n  - ' + results.violations.map((v) => `${v.id} (${v.impact}, ${v.nodes.length}×)`).join('\n  - ')
        : '')
    );
  });
}
