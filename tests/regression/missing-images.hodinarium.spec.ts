/**
 * Regrese: chybějící obrázky obnovené v commitu a1a2e2c.
 *
 * Turndown při HTML→Markdown převodu nechal na pár místech jen
 * holé "!" místo `![](src)`. Tyto články byly opravené ručně,
 * test ověřuje že tam obrázky pořád jsou a server je servuje 200.
 */
import { test, expect } from 'playwright/test';

const CASES: Array<{ url: string; img: string }> = [
  { url: '/clanky/zvony_vyroba',  img: '/img/vez/zvony/pruzez_zvonem.gif' },
  { url: '/clanky/uspirku',       img: '/img/vezni/praha/uspirku1.JPG' },
  { url: '/clanky/uspirku',       img: '/img/vezni/praha/uspirku2.JPG' },
  { url: '/clanky/Kappa',         img: '/img/elektrika/Kappa/svorkovnice_SSC-MQI.jpg' },
  // marusak_rad_1.jpg už není vázaný v zidovske.mdx (commit a1a2e2c
  // ho nahradil ZidovskeHodiny komponentem s podklad.jpg). Test
  // přesouváme na asset endpoint.
];

test('zidovske: ZidovskeHodiny clock assets — všechny 200', async ({ request }) => {
  for (const path of [
    '/img/zidovske/clock/podklad.jpg',
    '/img/zidovske/clock/hodinova.gif',
    '/img/zidovske/clock/minutova.gif',
  ]) {
    const res = await request.head(path);
    expect(res.status(), `${path} musí servírovat 200`).toBe(200);
  }
});

for (const c of CASES) {
  test(`${c.url} — img ${c.img} je v DOMu i 200`, async ({ page, request }) => {
    await page.goto(c.url);
    await expect(page.locator(`img[src="${c.img}"]`).first()).toBeVisible();

    const res = await request.head(c.img);
    expect(res.status(), `${c.img} musí servírovat 200`).toBe(200);
  });
}

test('Kappa: zidovske marusak_rad_1.jpg — žádné %20 v URL', async ({ request }) => {
  // Stará verze měla literál %20 v jméně souboru → po renamu nesmí
  // zůstat refy na původní /img/zidovske/marusak_rad%201.jpg
  const res = await request.head('/img/zidovske/marusak_rad%201.jpg');
  // 404 je očekávané — soubor s tím přesným jménem už neexistuje
  expect([404, 308]).toContain(res.status());
});
