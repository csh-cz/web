/**
 * Smoke a11y test napříč klíčovými typy stránek hodinarium-eu pomocí
 * axe-core. Validuje WCAG 2.1 A + AA.
 *
 * Strategie:
 *   - Volíme reprezentativní URL z každé content collection + globální
 *     stránky. Pokud naroste violation v některé kategorii, ostatní
 *     stejného typu jsou pravděpodobně postižené také.
 *   - Detekujeme jen `critical` + `serious` impact (moderate/minor jsou
 *     často styling debaty, ne blocker).
 *   - Známé výjimky a TODO odložené z auditu 2026-05-08 (C3+C4+M2 v
 *     SearchModal aria pattern) přidány jako disabled rules — když se
 *     vyřeší v separátním ticketu, stačí enable + restart test.
 *
 * Pokud test fail:
 *   1. Otevři Playwright report: `pnpm exec playwright show-report`
 *   2. Najdi violation, klikni na URL → otevře se v browseru
 *   3. Spusť axe DevTools v prohlížeči, najdi konkrétní element
 *   4. Oprav v komponentě nebo přidej do exclude rules s vysvětlením
 */
import { test, expect } from 'playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES: Array<{ url: string; name: string }> = [
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

// Pravidla disabled jako TODO (separate tickety):
const DISABLED_RULES = [
  // C3+C4+M2: SearchModal aria pattern refactor (TODO A.5).
  // listbox/combobox je composed dynamicky JS-em, axe heuristika v
  // dialog elementu narazí na chybějící aria-activedescendant. Test
  // zatím neřeší — rule se znovu aktivuje až bude SearchModal hotový.
  'aria-required-attr',
];

for (const { url, name } of PAGES) {
  test(`axe: ${name} (${url}) — žádné critical/serious violations`, async ({ page }) => {
    await page.goto(url);
    // Počkej na hlavní obsah (Astro hydration může drobně přidávat aria)
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(DISABLED_RULES)
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );

    if (blocking.length > 0) {
      // Verbose report do test outputu pro debugging
      const summary = blocking
        .map((v) => `  [${v.impact}] ${v.id}: ${v.help}\n    ${v.nodes.length} nodes; první: ${v.nodes[0]?.target?.join(' > ')}`)
        .join('\n');
      console.error(`\n${name} violations:\n${summary}\n`);
    }

    expect(blocking, `Critical/serious WCAG violations on ${url}`).toHaveLength(0);
  });
}
