/**
 * Regression: chybějící obrázky v content/hodinarium-eu/*.
 *
 * Po R2 migraci (commit 36f33223, A.26) jsou obrázky servírovány z R2 CDN
 * (`pub-e96bd8c658664b38af73a48cb8872b60.r2.dev`), ne z `apps/hodinarium-eu/public/img/`.
 * rehype-picture (packages/rehype-picture) přepisuje `<img src="/img/...">` na
 * absolutní R2 URL při buildu + zabaluje do `<picture>` s AVIF/WebP variants.
 *
 * **Tento test**:
 * 1. **Známé regrese** (KNOWN_REGRESSIONS) — manuálně udržovaný seznam obrázků,
 *    které historicky chyběly a byly doplněné. Kontrola: existuje v DOMu + 200 na R2.
 * 2. **Comprehensive R2 audit** — loaduje `tests/regression/img-refs.json`
 *    (generovaný `pnpm imgs:refs:build`) se všemi /img/ ref z content/.
 *    Paralelně HEAD všech URL na R2 a hlásí kompletní 404 seznam.
 *
 * Při fail v comprehensive: doplnit chybějící obrázky do R2 přes
 *   pnpm imgvariants:upload   # nahraje vše z apps/* /public/img/ do R2
 * nebo regenerovat (jeden chybějící src):
 *   curl -o apps/hodinarium-eu/public/img/PATH https://hodinarium.eu/img/PATH
 *   pnpm imgvariants:build && pnpm imgvariants:upload
 */
import { test, expect } from 'playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const R2_BASE = 'https://pub-e96bd8c658664b38af73a48cb8872b60.r2.dev';

/** Helper: HEAD na R2 absolute URL. */
async function headR2(request: import('playwright/test').APIRequestContext, imgPath: string) {
  const r2Url = `${R2_BASE}${imgPath}`;
  const res = await request.head(r2Url);
  return { url: r2Url, status: res.status() };
}

// ─────────────────────────────────────────────────────────────────
// PART 1: Známé regrese — manuálně udržovaný seznam
// ─────────────────────────────────────────────────────────────────
//
// Tyto obrázky historicky chyběly v R2/public/img a byly individuálně
// doplněné. Zachováváme jako sentinely — fail napoví regrese.

const KNOWN_REGRESSIONS: Array<{ url: string; img: string }> = [
  { url: '/sbirka/zvony-vyroba',  img: '/img/vez/zvony/pruzez_zvonem.gif' },
  { url: '/sbirka/uspirku',       img: '/img/vezni/praha/uspirku1.JPG' },
  { url: '/sbirka/uspirku',       img: '/img/vezni/praha/uspirku2.JPG' },
  { url: '/sbirka/uspirku',       img: '/img/vezni/praha/uspirku3.jpg' },
  { url: '/sbirka/uspirku',       img: '/img/vezni/praha/uspirku4.jpg' },
  { url: '/projekty/kappa',       img: '/img/elektrika/Kappa/svorkovnice_SSC-MQI.jpg' },
];

for (const c of KNOWN_REGRESSIONS) {
  test(`regrese: ${c.url} — img ${c.img} (DOM + R2 200)`, async ({ page, request }) => {
    await page.goto(c.url);
    // Img src je absolutní R2 URL po rehype-picture; matchujeme přes suffix
    await expect(page.locator(`img[src$="${c.img}"]`).first()).toBeVisible();

    const { url, status } = await headR2(request, c.img);
    expect(status, `${url} musí servírovat 200`).toBe(200);
  });
}

// ─────────────────────────────────────────────────────────────────
// PART 2: Žid. ZidovskeHodiny komponenta — clock asset endpoint
// ─────────────────────────────────────────────────────────────────

test('zidovske: ZidovskeHodiny clock assets — všechny 200', async ({ request }) => {
  for (const path of [
    '/img/zidovske/clock/podklad.jpg',
    '/img/zidovske/clock/hodinova.gif',
    '/img/zidovske/clock/minutova.gif',
  ]) {
    const { url, status } = await headR2(request, path);
    expect(status, `${url} musí servírovat 200`).toBe(200);
  }
});

// ─────────────────────────────────────────────────────────────────
// PART 3: Comprehensive R2 audit — všechny /img/ ref z content/
// ─────────────────────────────────────────────────────────────────
//
// Loaduje generovaný seznam z `tests/regression/img-refs.json`
// (regenerovat: `pnpm imgs:refs:build`). Paralelně HEAD na R2 a hlásí
// úplný seznam 404. Jeden test = běh ~30 s při concurrency 16.

test('comprehensive: všechny /img/ ref v content/hodinarium-eu/ — 200 na R2', async ({ request }) => {
  test.setTimeout(300_000); // 5 min cap (1011 imgs × ~0.2s + retry overhead)

  const refsPath = join(__dirname, 'img-refs.json');
  const refs: string[] = JSON.parse(readFileSync(refsPath, 'utf8'));
  expect(refs.length, 'img-refs.json must list at least 100 image refs').toBeGreaterThan(100);

  // Concurrency 6 — R2 rate limity (429) při větších paralelismech.
  // Retry s exponential backoff zachytí přechodné 429.
  const CONCURRENCY = 6;
  const MAX_RETRIES = 4;

  const missing: Array<{ img: string; status: number }> = [];

  async function checkWithRetry(img: string): Promise<number> {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const { status } = await headR2(request, img);
        if (status === 429) {
          // Rate limit — exp backoff (250 ms, 500, 1000, 2000)
          await new Promise((r) => setTimeout(r, 250 * 2 ** attempt));
          continue;
        }
        return status;
      } catch (e) {
        await new Promise((r) => setTimeout(r, 250));
      }
    }
    return 429; // Final fallback
  }

  let cursor = 0;
  async function worker() {
    while (cursor < refs.length) {
      const idx = cursor++;
      const img = refs[idx];
      const status = await checkWithRetry(img);
      if (status !== 200) {
        missing.push({ img, status });
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  if (missing.length > 0) {
    const report = missing
      .map((m) => `  ${m.status} ${R2_BASE}${m.img}`)
      .join('\n');
    expect(
      missing.length,
      `Z ${refs.length} obrázků v content/ je ${missing.length} 404/error na R2:\n${report}\n\nFix:\n  1) Stáhnout chybějící z legacy hodinarium.eu:\n     curl -o apps/hodinarium-eu/public/img/PATH https://hodinarium.eu/img/PATH\n  2) pnpm imgvariants:build && pnpm imgvariants:upload`,
    ).toBe(0);
  }
});

// ─────────────────────────────────────────────────────────────────
// PART 4: %20 URL regrese (escape v cestě)
// ─────────────────────────────────────────────────────────────────

test('Kappa: zidovske marusak_rad_1.jpg — žádné %20 v URL', async ({ request }) => {
  // Stará verze měla literál %20 v jméně souboru → po renamu nesmí
  // zůstat refy na původní /img/zidovske/marusak_rad%201.jpg
  const res = await request.head(`${R2_BASE}/img/zidovske/marusak_rad%201.jpg`);
  // 404 je očekávané — soubor s tím přesným jménem už neexistuje
  expect([404, 308]).toContain(res.status());
});
