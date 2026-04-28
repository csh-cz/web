# Iframe analýza — co je v iframech a jak je nahradit

Stav k 2026-04-28. Kontext: GitHub Issue [#18 — Iframe ztracený při HTML→MD konverzi](https://github.com/csh-cz/web/issues/18).

22 článků v `hodinarium-eu` mělo v původním scrape `<iframe>`. Při HTML→Markdown konverzi je turndown defaultně zahodil. Část už opravena (dvojí strategií — inline obsah / Astro komponent / iframe-only fallback), zbytek čeká na rozhodnutí.

Cíle analýzy:

1. **Co skutečně bylo za iframem** — pro každý URL stáhnu zdrojový obsah, zjistím jeho povahu (PDF, JS app, statická tabulka, video).
2. **Návrh náhrady bez iframu** — Astro komponent, inline obsah, web component, externí proxy přes Cloudflare Worker.
3. **Priorita a odhad práce**.

## Inventura

| Slug | Iframe src | Stav | Kategorie |
|---|---|---|---|
| `Kappa` | `orloj.eu/arduino2_polarizace.php?MAC=NTPi-C234` | Iframe vrácen [b400a26] | E. Live PHP same-org |
| `slunecni_filler` | `slunecni2.htm` | **Komponent SlunecniHodinyKlementinum** [a1a2e2c] | D. Lokální JS app |
| `zidovske` | `zidovske/zid.php` | **Komponent ZidovskeHodiny** [a1a2e2c] | E. Live PHP same-org |
| `stanovy` (horologie) | `download/STANOVY_spolek.pdf` | **Plný text inline + odkaz na PDF** | B. PDF |
| `kostky` | `download/brozura_miniatury.pdf` | PDF iframe lokální [db336c1] | B. PDF |
| `zapis20190118` (horologie) | `download/Z%E1pisVolebniSchuze.pdf` | PDF iframe lokální [db336c1] | B. PDF |
| `zapis20200110` (horologie) | `download/Zapis20200110.pdf` | PDF iframe lokální [db336c1] | B. PDF |
| `Arduino` | `youtube.com/embed/RMyYnnAPIV8` | Otevřené | C. YouTube |
| `TimeSlider` | `youtube.com/embed/VBpDQtAcoWc` | Otevřené | C. YouTube |
| `mindelheim` | `youtube.com/embed/slDssMuXSz4` | Otevřené | C. YouTube |
| `mystery` | `mystery_prg.htm` | Otevřené | D. Lokální JS app |
| `normalni` | `normalni_prg.htm` | Otevřené | D. Lokální JS app |
| `segmentovky_s_prekladem` | `segmentovky_prg.htm` | Otevřené | D. Lokální JS app |
| `sezona2012` | `kniha_vez.htm` | Otevřené | D. Statický HTML (guestbook) |
| `sezona2013` | `kniha_vez.htm` | Otevřené | D. Statický HTML (guestbook) |
| `hledej` | `search.htm` | Otevřené | D. Search form |
| `Arduino_IBM` | `hodinarium.eu/arduino2_IBM2.php?MAC=EFFC` | **Broken na origin** (PHP error) | E. Live PHP — broken |
| `PRS10` | `hodinarium.eu/PRS2.php` | Otevřené | E. Live PHP same-org |
| `fake_atomove_hodiny` | `orloj.eu/PRS2.php` | Otevřené | E. Live PHP same-org |
| `cas_internet2` | `cs.thetimenow.com/clock/...` | Otevřené | F. Externí widget |
| `12_24` | `muzeumhodin.info/tabor/tab.php` | **Server odešel** (404) | F. Externí widget — dead |
| `tabor` | `muzeumhodin.info/tabor/tab.php` | **Server odešel** (404) | F. Externí widget — dead |

Hotovo: 7 / 22. Otevřeno: 15.

## A. Co se v iframech nachází (per kategorie)

### B. PDF dokumenty
- 4 PDFs: STANOVY_spolek, ZapisVolebniSchuze, Zapis20200110, brozura_miniatury.
- Všechny 200 OK na origin, mirror v `apps/*/public/{download,dokumenty}/`.

**Bez iframu:**
- **Volba 1 — `<object data="x.pdf" type="application/pdf">`**: nativní browser PDF viewer, fallback na `<a>` link uvnitř pro neexistující plugin. Není iframe formálně, ale z UX pohledu se chová podobně.
- **Volba 2 — pouze odkaz + thumbnail**: nejlehčí. Pro většinu use casů stačí; uživatel klikne, prohlížeč otevře v nové záložce. Žádná závislost.
- **Volba 3 — pdf.js inline render**: knihovna ~300 KB, render canvas. Hezké pro náhled na desktop, na mobil bolí.

**Doporučení:** Volba 2 (odkaz + případně thumbnail z první stránky generovaný přes `pdftoppm` při buildu). Aktuální PDF iframy jsou ok pro mezidobí, ale Cloudflare Pages servíruje s `Content-Disposition: attachment` na některých prohlížečích, takže iframe nemusí renderovat — Volba 2 je robustnější.

### C. YouTube embedy (3 videa)

| ID | Titul | Autor | Stav |
|---|---|---|---|
| `RMyYnnAPIV8` | podruzny strojek s kyvavou kotvou | Petr Kral | dostupné |
| `VBpDQtAcoWc` | Time Slider — digital clock | Hans Andersson | dostupné |
| `slDssMuXSz4` | (oembed 403, video page 200) | (?) | nejisté — video může být hidden/age-restricted |

**Bez iframu:**
- **Volba 1 — `lite-youtube` web component** (paulirish/lite-youtube-embed, ~3 KB): zobrazí thumbnail s play tlačítkem, klik vyvolá iframe až tehdy. Velký perf/privacy zisk (žádný YouTube tracking ani cookies dokud uživatel neklikne), žádný npm dep — copy custom element + CSS.
- **Volba 2 — statický thumbnail link**: ještě lehčí. `<a href="youtube.com/watch?v=…"><img src="i.ytimg.com/vi/…/hqdefault.jpg"></a>`. Klik otvírá YouTube v nové záložce — neztratíte vizitkový thumbnail.
- **Volba 3 — vlastní `<video>` re-host**: licenční noční můra, nepoužitelné.

**Doporučení:** Volba 1 (lite-youtube). 30 min práce, jeden Astro komponent `<YouTube id="..." title="...">`, použitelný v MDX. Pro `slDssMuXSz4` doplnit fallback popisek ("video se nenačetlo, otevřít přímo na YouTube").

### D. Lokální JS aplikace (5 sub-pages)

#### `normalnicas.js` + `mystery_prg.htm` + `normalni_prg.htm`

Skript `normalnicas(h, m)` (105 řádků JS) převádí čas na slovní vyjádření: "tři čtvrtě na šest", "čtvrt po desáté" atd. Volá se v intervalu 1 s a aktualizuje `<span id="caskr">`.

```javascript
// normalnicas.js — extract
function normalnicas(h, m) {
  // → "X minut po Y", "půl Z", "X minut do Z" atd.
}
```

#### `segmentovky_prg.htm`

Vtipný script: HH:MM:SS každou číslici převede na česká slova podle vizuální podoby — `0=placka, 1=pendrek, 2=zatáčka, 3=ňadra, 4=židlička, 5=koule, 6=švestka, 7=motyka, 8=sněhulák, 9=plácačka`. Pro 12:34:56 vyjde *"pendrek zatáčka : ňadra židlička : koule švestka"*. Self-contained 50 řádků JS, refresh každou sekundu.

#### `kniha_vez.htm`

Statický HTML guestbook — 25+ paragrafů s citacemi návštěvníků Věžního muzejíčka v Soběslavi. **Žádné dynamické chování** kromě jediné inline reference `scrollpage.js` (asi auto-scroll, lze ignorovat).

#### `search.htm`

Malý formulář na fulltext search — 561 bytů. Náš web má vlastní Pagefind v `<SearchModal>` komponentu, takže iframe na orloj.eu/search.htm je redundantní.

**Bez iframu:**

| Sub-page | Návrh | Náročnost |
|---|---|---|
| `normalnicas.js` (mystery_prg, normalni_prg) | `<CasSlovem.astro>` — port JS do TS (~30 řádků), přidá `setInterval(1000)`, žádný iframe | 1 h |
| `segmentovky_prg.htm` | `<CasSegmentovky.astro>` — totéž, ještě jednodušší (50 řádků JS) | 30 min |
| `kniha_vez.htm` | Inline blockquote sekce v markdownu článků sezona2012 / sezona2013 | 15 min |
| `search.htm` | Tlačítko `data-search-trigger` (existuje) místo iframu | 5 min |

### E. Live PHP — same-organization (3 endpointy)

#### `arduino2_polarizace.php?MAC=NTPi-C234` (Kappa)
Server-rendered HTML s daty z NTP jednotky. `cache-control: max-age=10`, refresh každých ~10 s. Nemá CORS hlavičky — client-side fetch z pages.dev je blokovaný.

#### `PRS2.php` (PRS10, fake_atomove_hodiny — same content)
Strukturovaná HTML tabulka ~60 řádků s parametry Stanford Research Systems PRS10 rubidiového oscilátoru: SD0—SD7, R/N/A/SF/SS/MO/MR atd., AD1—AD19, PPS Control. `cache-control: max-age=300`, `<meta http-equiv="refresh" content="60">`. Nemá CORS.

#### `arduino2_IBM2.php?MAC=EFFC` (Arduino_IBM) — **broken**
PHP errory: `filectime() failed for linka/EFFC.IBM`, `fopen failed: No such file or directory`. Datový soubor chybí. Stejný problém je nezávislý na našem webu.

**Bez iframu — 3 cesty:**

##### 1. Cloudflare Worker proxy (krátkodobě, ~30 min každá)
```ts
// functions/api/live/[type]/[mac].ts
export const onRequest: PagesFunction = async ({ params }) => {
  const { type, mac } = params; // 'polarizace' | 'prs10' | 'ibm', 'NTPi-C234'
  const upstream = `https://www.orloj.eu/arduino2_${type}.php?MAC=${mac}`;
  const res = await fetch(upstream, { cf: { cacheTtl: 30 } });
  const html = await res.text();
  // Parse HTML → JSON (cherry-pick rows from table)
  return new Response(JSON.stringify(extractData(html)), {
    headers: { 'content-type': 'application/json', 'cache-control': 'max-age=30' },
  });
};
```
Klient pak `fetch('/api/live/polarizace/NTPi-C234')`, render přes Astro komponent. Plus: žádný cross-origin iframe, plné UI control.
Mínus: Cloudflare Pages má 100k requestů/den free, ale fetch z Workeru se počítá. Při minutovém polling × 24 h × N návštěvníků → spotřeba.

##### 2. Domluvit s Petrem JSON endpoint na orloj.eu (cleanest, ~1 h Petr-side)
```php
// orloj.eu/arduino2_polarizace.json.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: max-age=10');
echo json_encode(parsedData());
```
Klient přímý `fetch('https://orloj.eu/arduino2_polarizace.json.php?MAC=...')` — žádný proxy. Plus: jednoduchost. Mínus: vyžaduje koordinaci s Petrem.

##### 3. Build-time snapshot (degenerate)
Při Cloudflare Pages buildu fetchnout PHP, parsovat, vyrenderovat statický HTML "stav k poslednímu deploy". Vhodné pokud data nejsou kriticky live (např. dev/debug status). Pro Kappa NTP monitor nedostatečné.

**Doporučení:**
- **Kappa** — Volba 2 nejdřív (Petr může endpoint dodat rychle), iframe jako mezikrok.
- **PRS10 / fake_atomove_hodiny** — Volba 2 (jeden JSON endpoint, dvě stránky ho čtou).
- **Arduino_IBM** — pre-condition: Petr opraví chybějící data soubor `linka/EFFC.IBM`. Do té doby skrýt sekci s placeholder ("data dočasně nedostupná").

### F. Externí widgety (3, různě dostupné)

#### `thetimenow.com` (cas_internet2)
URL: `cs.thetimenow.com/clock/czech_republic/sob%c4%9bslav?embed=1&...` s 15+ query parametry pro barvy a layout.
Stav: 302 redirect, embed může již nefungovat. Účel: ukázka jak vypadá embed třetí strany u článku o internetových časových serverech.

**Bez iframu:** Statický screenshot widgetu jako obrázek + textový popis ("ukázka embed widgetu thetimenow.com — služba již nemusí fungovat"). Article je o **historii** těchto služeb, ne o jejich aktuálním stavu.

#### `muzeumhodin.info/tabor/tab.php` (12_24, tabor) — **dead**
Server vrací 404. **Server odešel.**

**Bez iframu:** 
- **`tabor`** — článek o táborském orloji, místo iframu vložit obrázek ciferníku (mám statické fotky v `/img/orloje/tabor/`?) + odkaz na článek o orloji v Táboře.
- **`12_24`** — iframe byl asi výplňový. Smazat referenci, ponechat jen článek o 12 vs 24 hodinových ciferníkách.

## B. Tabulka rozhodnutí

| Kategorie | Volba | Náročnost | Dopad |
|---|---|---|---|
| **B. PDF** (4 hotové) | Iframe + odkaz | hotovo | uživatel vidí dokument inline, fallback na download |
| **C. YouTube** (3) | `<YouTube>` Astro komponent à la lite-youtube | 30—60 min jednorázově | privacy + perf (žádný YT tracking dokud klik) |
| **D. mystery/normalni** (2) | `<CasSlovem>` Astro komponent | 1 h | dynamický slovní čas, žádný iframe |
| **D. segmentovky** (1) | `<CasSegmentovky>` Astro komponent | 30 min | totéž |
| **D. kniha_vez** (sezona2012/13) | inline blockquote v md | 15 min | statický text, jednoduché |
| **D. search** (hledej) | redirect na SearchModal trigger | 5 min | využití existující funkcionality |
| **E. Kappa, PRS10, fake_atomove** | JSON endpoint na orloj.eu (Volba 2) + Astro komponent | 1—2 h Petr-side, 1 h Astro | live data, 0 iframe, plný styling |
| **E. Arduino_IBM** | placeholder "dočasně nedostupné" | 5 min, čeká na Petra | žádné PHP errory ve sloupci |
| **F. thetimenow** | statický screenshot + textový popis | 15 min | edukativní, deprivační varování |
| **F. tabor** | obrázek ciferníku + odkaz | 15 min, vyžaduje obrázek | nahrazení deadlinku |
| **F. 12_24** | smazat referenci | 5 min | čistší článek |

**Souhrn práce**: ~5—7 hodin vlastní práce + 1—2 hodiny koordinace s Petrem. Plus ~2 h pro Astro komponenty (`<YouTube>`, `<CasSlovem>`, `<CasSegmentovky>`, `<LiveOrlojData>`).

## C. Doporučené pořadí implementace

1. **Quick wins (~1 h)** — sezona2012/13 inline kniha_vez, hledej → SearchModal trigger, smazat 12_24 widget reference, statický náhrad pro thetimenow + tabor.
2. **YouTube komponent (~30 min)** — odemyká 3 články.
3. **Astro komponenty `<CasSlovem>` + `<CasSegmentovky>` (~1.5 h)** — odemyká 3 články.
4. **Petr-side JSON endpoint (~1 h koordinace)** — odemyká 3 articles s live PHP daty (Kappa, PRS10, fake_atomove).
5. **`<LiveOrlojData>` Astro komponent (~1 h)** — generický client-fetch + render.
6. **Arduino_IBM placeholder (~5 min)** — okamžitě.

Po těchto krocích: **0 iframů zbývá**. Celkem ~5—7 h aktivní práce + Petr-side endpoint.

## D. Úkoly v repu

- [ ] [#18](https://github.com/csh-cz/web/issues/18) — sledovací issue, sub-issues vytvořit pro každou kategorii
- [ ] `packages/youtube-embed` — workspace package pro `<YouTube>` lite component
- [ ] `apps/hodinarium-eu/src/components/CasSlovem.astro`
- [ ] `apps/hodinarium-eu/src/components/CasSegmentovky.astro`
- [ ] `apps/hodinarium-eu/src/components/LiveOrlojData.astro`
- [ ] `functions/api/live/[type]/[mac].ts` (Cloudflare Pages Functions, jako fallback bez Petr-side endpointu)
- [ ] Per-article markdown patches (zaměnit zbylé iframe za komponenty)
