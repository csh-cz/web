/**
 * WCAG 2.4.7 Focus Visible (A) + 2.4.13 Focus Appearance (AA, WCAG 2.2).
 *
 * Tab fokus musí mít vizuálně rozlišitelný indikátor proti default state.
 * Test pro každý key interaktivní element porovná computed style před
 * a po `.focus()`: pokud jsou outline-width, outline-style, box-shadow
 * a border identické a outline-style je 'none' nebo width 0, je to
 * "focus-removed" antipattern (typicky `*:focus { outline: none }`).
 *
 * Heuristika není dokonalá:
 *   - Sass framework může přepsat outline a doplnit jiný indikátor
 *     (např. background-color shift, ::after pseudo). Tyto případy
 *     vyžadují manuální verify; test flagne jako "warning" nikoliv
 *     hard fail.
 *   - Skip-link a sr-only elementy se cíleně neukazují bez fokusu
 *     (transform: translateY(-100%)). Detekujeme přes initial position
 *     a vyloučíme z analýzy.
 *
 * Cíl: detekovat regrese kdy někdo přidá `outline: none` na :focus state
 * bez náhradního indikátoru.
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

const FINDINGS_PATH = path.resolve('test-results', 'a11y-focus-visible-findings.json');

type Finding = {
  page: string;
  url: string;
  tag: string;
  text: string;
  selector: string;
  default: StyleSnapshot;
  focused: StyleSnapshot;
  reason: string;
};

type StyleSnapshot = {
  outlineWidth: string;
  outlineStyle: string;
  outlineColor: string;
  boxShadow: string;
  borderColor: string;
  backgroundColor: string;
  color: string;
};

function appendFindings(findings: Finding[]): void {
  const dir = path.dirname(FINDINGS_PATH);
  fs.mkdirSync(dir, { recursive: true });
  let existing: Finding[] = [];
  if (fs.existsSync(FINDINGS_PATH)) {
    try {
      existing = JSON.parse(fs.readFileSync(FINDINGS_PATH, 'utf8'));
    } catch {
      existing = [];
    }
  }
  existing.push(...findings);
  fs.writeFileSync(FINDINGS_PATH, JSON.stringify(existing, null, 2), 'utf8');
}

for (const { url, name } of PAGES) {
  test(`focus-visible: ${name} (${url})`, async ({ page }, testInfo) => {
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const findings: Finding[] = await page.evaluate(() => {
      type StyleSnapshot = {
        outlineWidth: string;
        outlineStyle: string;
        outlineColor: string;
        boxShadow: string;
        borderColor: string;
        backgroundColor: string;
        color: string;
      };
      function snapshot(el: Element): StyleSnapshot {
        const cs = window.getComputedStyle(el);
        return {
          outlineWidth: cs.outlineWidth,
          outlineStyle: cs.outlineStyle,
          outlineColor: cs.outlineColor,
          boxShadow: cs.boxShadow,
          borderColor: cs.borderColor,
          backgroundColor: cs.backgroundColor,
          color: cs.color,
        };
      }
      function sameVisuals(a: StyleSnapshot, b: StyleSnapshot): boolean {
        return (
          a.outlineWidth === b.outlineWidth &&
          a.outlineStyle === b.outlineStyle &&
          a.outlineColor === b.outlineColor &&
          a.boxShadow === b.boxShadow &&
          a.borderColor === b.borderColor &&
          a.backgroundColor === b.backgroundColor &&
          a.color === b.color
        );
      }
      function hasIndicator(focused: StyleSnapshot): boolean {
        // Outline width > 0 a style ne 'none' = native indikátor.
        if (focused.outlineStyle !== 'none' && parseFloat(focused.outlineWidth) > 0) return true;
        // box-shadow ne 'none' = custom indikátor (typicky inset shadow).
        if (focused.boxShadow !== 'none' && focused.boxShadow.trim() !== '') return true;
        return false;
      }

      const selectors = 'button, a[href], input:not([type="hidden"]), select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])';
      const elements = Array.from(document.querySelectorAll(selectors));
      const out: Array<{
        page: string;
        url: string;
        tag: string;
        text: string;
        selector: string;
        default: StyleSnapshot;
        focused: StyleSnapshot;
        reason: string;
      }> = [];

      // Limit per page — kdyby každá karta měla 50 linků, output by byl masivní.
      // Soupis stránka má cca 200+ řádků; testujeme prvních 50 plus unikátní
      // class-signaturu (1 violation per komponenta stačí).
      const seenSelectorSig = new Set<string>();
      let processed = 0;

      for (const el of elements) {
        if (processed > 50) break;

        const rect = el.getBoundingClientRect();
        // Skip neviditelné a skip-linky (off-screen positioning).
        if (rect.width === 0 || rect.height === 0) continue;
        if (rect.top < -50 || rect.left < -50) continue;

        const cs = window.getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') continue;
        // Skip disabled controls — keyboard fokus je neumístí (browser je
        // vynechá v Tab pořadí), takže focus-visible regule se na ně
        // nevztahuje. WCAG 2.4.7 mluví o "components that receive focus".
        if ((el as HTMLButtonElement).disabled) continue;
        if (el.getAttribute('aria-disabled') === 'true') continue;

        const selector = (() => {
          if (el.id) return `#${el.id}`;
          const cls = (el.getAttribute('class') ?? '').trim().split(/\s+/).filter(Boolean).slice(0, 2).join('.');
          return cls ? `${el.tagName.toLowerCase()}.${cls}` : el.tagName.toLowerCase();
        })();

        // Dedupe podle (tag + první 2 class) — jedna violation per komponenta.
        if (seenSelectorSig.has(selector)) continue;

        const before = snapshot(el);
        try {
          (el as HTMLElement).focus({ preventScroll: true });
        } catch {
          continue;
        }
        // Force :focus-visible pomocí re-render via offsetHeight read.
        // (focus() alone často nestačí, browser potřebuje frame.)
        void (el as HTMLElement).offsetHeight;
        const after = snapshot(el);

        const visuallyIdentical = sameVisuals(before, after);
        const indicatorPresent = hasIndicator(after);

        if (visuallyIdentical && !indicatorPresent) {
          out.push({
            page: '',
            url: '',
            tag: el.tagName,
            text: (el.textContent ?? '').trim().slice(0, 60),
            selector,
            default: before,
            focused: after,
            reason: 'fokus nezmění žádný viditelný styl a chybí outline + box-shadow',
          });
          seenSelectorSig.add(selector);
        } else if (!indicatorPresent && visuallyIdentical) {
          // Redundantní větev, ale pro jistotu.
          seenSelectorSig.add(selector);
        } else {
          // Element má indikátor — zaznamenat selektor, abychom ho neopakovali.
          seenSelectorSig.add(selector);
        }
        (el as HTMLElement).blur();
        processed++;
      }

      return out;
    });

    // Doplnit page + url (evaluate kontext nezná).
    const annotated: Finding[] = findings.map((f) => ({ ...f, page: name, url }));
    appendFindings(annotated);

    for (const f of annotated.slice(0, 10)) {
      testInfo.annotations.push({
        type: 'focus-visible issue',
        description: `${f.tag} "${f.text}" — ${f.reason} [${f.selector}]`,
      });
    }

    console.log(
      `${name}: ${annotated.length} focus-visible issues` +
        (annotated.length > 0
          ? '\n  - ' +
            annotated
              .slice(0, 5)
              .map((f) => `${f.tag} [${f.selector}]: "${f.text}" — ${f.reason}`)
              .join('\n  - ')
          : ''),
    );
  });
}
