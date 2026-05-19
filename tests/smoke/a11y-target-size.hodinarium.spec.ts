/**
 * WCAG 2.2 AA — 2.5.8 Target Size (Minimum).
 *
 * Manuální gap, který axe-core neumí spolehlivě měřit (potřebuje
 * skutečný layout/bounding box, ne jen DOM/CSS introspekci). Tento
 * test zjistí bounding box každého interaktivního elementu a flagne
 * ty, které jsou pod 24×24 CSS px.
 *
 * Výjimky podle WCAG 2.5.8:
 *   - Inline links uvnitř text containers (<p>, <li>, <span>, <td>) —
 *     spec je výslovně vylučuje, protože by jinak rozbilo psaní textu.
 *   - UA-styled native controls bez explicit CSS (axe-core to taky
 *     ignoruje). Heuristika: pokud element nemá ani width/height ani
 *     padding přes inline/computed style, považujeme za UA default.
 *   - "Equivalent" alternative — typicky icon button vedle text labelu;
 *     v naší codebase pokud jsou _oba_ pod 24px, ale dohromady tvoří
 *     touch zone, pořád flagneme (autor musí explicit verify).
 *
 * Output: testInfo.annotations s detaily violation + JSON nalezený
 * agregovaný v test-results/a11y-target-size-findings.json (mergováno
 * mezi page runs přes afterAll hook).
 *
 * Test je informativní (žádný expect), aby fail nezablokoval CI.
 * Pokud chceš strict variant pro release gate, přidej:
 *   expect(violations).toHaveLength(0);
 * na konec.
 */
import { test } from 'playwright/test';
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

const MIN_SIZE = 24; // CSS px per WCAG 2.5.8

type Violation = {
  page: string;
  url: string;
  tag: string;
  text: string;
  selector: string;
  width: number;
  height: number;
  parentTag: string | null;
  href: string | null;
  category: 'sub-24' | 'native-checkradio';
};

// Inline kontext, kde podle spec target size nemusí splňovat 24px:
// SUP/SUB jsou typicky footnote markery — generované GFM footnotes
// extension, vždy inline v textu.
const INLINE_PARENTS = new Set(['P', 'LI', 'SPAN', 'TD', 'TH', 'CITE', 'EM', 'STRONG', 'I', 'B', 'BLOCKQUOTE', 'FIGCAPTION', 'SUP', 'SUB']);

const FINDINGS_PATH = path.resolve('test-results', 'a11y-target-size-findings.json');

// Reset findings on every test run start (Playwright spawns multiple
// workers, takže používáme append-only s lockem přes náhodný suffix
// a final merge v separátním skriptu — pro jednoduchost zde overwrite
// při prvním zápisu v daném run + appendF do existujícího souboru).
function appendFindings(violations: Violation[]): void {
  const dir = path.dirname(FINDINGS_PATH);
  fs.mkdirSync(dir, { recursive: true });
  let existing: Violation[] = [];
  if (fs.existsSync(FINDINGS_PATH)) {
    try {
      existing = JSON.parse(fs.readFileSync(FINDINGS_PATH, 'utf8'));
    } catch {
      existing = [];
    }
  }
  existing.push(...violations);
  fs.writeFileSync(FINDINGS_PATH, JSON.stringify(existing, null, 2), 'utf8');
}

for (const { url, name } of PAGES) {
  test(`target-size: ${name} (${url})`, async ({ page }, testInfo) => {
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    // Drobná pauza pro web fonty a layout shift po hydration.
    await page.waitForTimeout(500);

    // V browseru extract všech interaktivních elementů + jejich bounding
    // box + kontext (parent tag, computed display) — jeden JS roundtrip.
    const candidates = await page.evaluate(({ minSize, inlineParents }) => {
      const selectors = [
        'button',
        'a[href]',
        'input:not([type="hidden"])',
        'select',
        'textarea',
        '[role="button"]',
        '[role="link"]',
        '[role="menuitem"]',
        '[role="tab"]',
        '[role="checkbox"]',
        '[role="radio"]',
        '[role="switch"]',
        '[tabindex]:not([tabindex="-1"])',
      ];
      const elements = Array.from(document.querySelectorAll(selectors.join(',')));

      const results: Array<{
        tag: string;
        text: string;
        selector: string;
        width: number;
        height: number;
        parentTag: string | null;
        href: string | null;
        isVisible: boolean;
        isInlineContext: boolean;
        isNativeCheckRadio: boolean;
      }> = [];

      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        const cs = window.getComputedStyle(el);
        // Skip hidden — nemá smysl pro a11y target size.
        const isVisible =
          rect.width > 0 &&
          rect.height > 0 &&
          cs.display !== 'none' &&
          cs.visibility !== 'hidden' &&
          cs.opacity !== '0';
        if (!isVisible) continue;

        // Skip explicit display: contents (wrapper bez vlastního boxu).
        if (cs.display === 'contents') continue;

        // Inline kontext detekce: pokud element samotný je inline a jeho
        // parent je textový blok ze seznamu.
        const parentTag = el.parentElement?.tagName ?? null;
        const isInlineContext =
          (cs.display === 'inline' || cs.display === 'inline-block' || cs.display === 'inline-flex') &&
          parentTag !== null &&
          inlineParents.includes(parentTag);

        // Jen pokud porušuje min size, posíláme zpět (úspora payload).
        if (rect.width >= minSize && rect.height >= minSize) continue;

        const selector = (() => {
          if (el.id) return `#${el.id}`;
          const cls = (el.getAttribute('class') ?? '').trim().split(/\s+/).filter(Boolean).slice(0, 2).join('.');
          return cls ? `${el.tagName.toLowerCase()}.${cls}` : el.tagName.toLowerCase();
        })();

        // Native checkbox/radio bez explicitního stylingu = UA default
        // (~13×13 px). WCAG 2.5.8 má pro UA-styled controls výjimku
        // ("Essential"). Označíme zvlášť, ale počítáme jako violation
        // pro reporting (autor by měl explicit verify nebo upscale).
        const isNativeCheckRadio =
          el.tagName === 'INPUT' &&
          ((el as HTMLInputElement).type === 'checkbox' || (el as HTMLInputElement).type === 'radio');

        results.push({
          tag: el.tagName,
          text: (el.textContent ?? '').trim().slice(0, 60),
          selector,
          width: Math.round(rect.width * 10) / 10,
          height: Math.round(rect.height * 10) / 10,
          parentTag,
          href: el.getAttribute('href'),
          isVisible,
          isInlineContext,
          isNativeCheckRadio,
        });
      }

      return results;
    }, { minSize: MIN_SIZE, inlineParents: Array.from(INLINE_PARENTS) });

    // Filter inline-context violations (WCAG-spec exception).
    const violations: Violation[] = candidates
      .filter((c) => !c.isInlineContext)
      .map((c) => ({
        page: name,
        url,
        tag: c.tag,
        text: c.text,
        selector: c.selector,
        width: c.width,
        height: c.height,
        parentTag: c.parentTag,
        href: c.href,
        category: c.isNativeCheckRadio ? ('native-checkradio' as const) : ('sub-24' as const),
      }));

    appendFindings(violations);

    for (const v of violations.slice(0, 20)) {
      testInfo.annotations.push({
        type: 'target-size violation',
        description: `${v.tag} "${v.text}" — ${v.width}×${v.height}px (parent: ${v.parentTag}) [${v.selector}]`,
      });
    }

    const inlineExcluded = candidates.length - violations.length;
    console.log(
      `${name}: ${violations.length} target-size violations` +
        (inlineExcluded > 0 ? ` (+ ${inlineExcluded} inline-context exemptions)` : '') +
        (violations.length > 0
          ? '\n  - ' +
            violations
              .slice(0, 10)
              .map((v) => `${v.tag} ${v.width}×${v.height}: "${v.text}" [${v.selector}]`)
              .join('\n  - ')
          : ''),
    );
  });
}
