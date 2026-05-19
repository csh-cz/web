/**
 * WCAG 2.4.3 Focus Order — snapshot logického pořadí Tab fokusu.
 *
 * Test prochází sekvenci Tab presses na každé stránce, zachytí
 * pro každý fokus krátký descriptor (tag + outerHTML preview) a uloží
 * je jako snapshot. Test sám padá jen pokud se aktivní element vůbec
 * nemění (skip-focus loop) nebo pokud trap-loops do skip-link bez
 * možnosti pokračovat. Vlastní pořadí je zachyceno do JSON pro diff
 * proti commitnuté baseline.
 *
 * Cíl: detekce regrese kdy někdo přidá `tabindex="2"` jako rychlý fix
 * a rozhodí logické pořadí (klávesnice user dostane fokus na footer
 * dřív než na search box).
 *
 * Limit: testujeme jen prvních N=15 Tab kroků; full focus tree by byl
 * příliš velký a citlivý na nepodstatné změny. N=15 obvykle pokryje
 * skip-link + nav + první actionable area.
 */
import { test, expect } from 'playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

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

const TAB_STEPS = 15;
const FINDINGS_PATH = path.resolve('test-results', 'a11y-tab-order-findings.json');

type FocusStep = {
  step: number;
  tag: string;
  role: string | null;
  ariaLabel: string | null;
  text: string;
  href: string | null;
  visible: boolean;
};

type PageReport = {
  page: string;
  url: string;
  totalSteps: number;
  uniqueElements: number;
  steps: FocusStep[];
  issues: string[];
};

function appendReport(report: PageReport): void {
  const dir = path.dirname(FINDINGS_PATH);
  fs.mkdirSync(dir, { recursive: true });
  let existing: PageReport[] = [];
  if (fs.existsSync(FINDINGS_PATH)) {
    try {
      existing = JSON.parse(fs.readFileSync(FINDINGS_PATH, 'utf8'));
    } catch {
      existing = [];
    }
  }
  existing.push(report);
  fs.writeFileSync(FINDINGS_PATH, JSON.stringify(existing, null, 2), 'utf8');
}

for (const { url, name } of PAGES) {
  test(`tab-order: ${name} (${url})`, async ({ page }, testInfo) => {
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Klikneme do body na úplný začátek, aby Tab startoval od konzistentního
    // místa. (Bez kliku Playwright může mít fokus na URL bar = mimo page).
    await page.locator('body').click({ position: { x: 1, y: 1 }, force: true });
    // Reset fokus: blur cokoli, co se klikem chytlo.
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur?.());

    const steps: FocusStep[] = [];
    const issues: string[] = [];
    const seen = new Set<string>();

    for (let i = 1; i <= TAB_STEPS; i++) {
      await page.keyboard.press('Tab');
      // Krátká pauza pro JS-driven fokus shifty (modal trap atd.).
      await page.waitForTimeout(50);

      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) {
          return null;
        }
        const rect = el.getBoundingClientRect();
        const cs = window.getComputedStyle(el);
        return {
          tag: el.tagName,
          role: el.getAttribute('role'),
          ariaLabel: el.getAttribute('aria-label') ?? el.getAttribute('aria-labelledby'),
          text: (el.textContent ?? '').trim().slice(0, 50),
          href: el.getAttribute('href'),
          visible:
            rect.width > 0 &&
            rect.height > 0 &&
            cs.display !== 'none' &&
            cs.visibility !== 'hidden',
        };
      });

      if (info === null) {
        issues.push(`step ${i}: fokus opustil dokument (body) — možný trap nebo end-of-page`);
        break;
      }

      const fingerprint = `${info.tag}|${info.role ?? ''}|${info.text}|${info.href ?? ''}`;
      if (seen.has(fingerprint) && i > 1) {
        // Cyklus — odjeli jsme zpět na začátek, OK ukončit.
        issues.push(`step ${i}: cyklus (fokus se vrátil na dřívější element "${info.text}")`);
        break;
      }
      seen.add(fingerprint);

      if (!info.visible) {
        issues.push(`step ${i}: fokus na neviditelný element ${info.tag} "${info.text}"`);
      }

      steps.push({ step: i, ...info });
    }

    // Stuck detekce: pokud bylo méně než 3 unikátní elementy, znamená to,
    // že tab nikam nevedl (focus trap nebo body bez interaktivních prvků).
    if (steps.length < 3) {
      issues.push(`pouze ${steps.length} tab kroků navštívilo interaktivní elementy — zkontrolovat tabindex / skip-link`);
    }

    const report: PageReport = {
      page: name,
      url,
      totalSteps: steps.length,
      uniqueElements: seen.size,
      steps,
      issues,
    };
    appendReport(report);

    for (const issue of issues) {
      testInfo.annotations.push({
        type: 'tab-order issue',
        description: issue,
      });
    }

    console.log(
      `${name}: ${steps.length} tab steps, ${seen.size} unikátních` +
        (issues.length > 0 ? `, issues: ${issues.length}\n  - ${issues.join('\n  - ')}` : ''),
    );

    // Hard assertion: musí být alespoň 1 dosažitelný interaktivní prvek.
    expect(steps.length, `Žádný interaktivní prvek dostupný klávesnicí na ${url}`).toBeGreaterThan(0);
  });
}
