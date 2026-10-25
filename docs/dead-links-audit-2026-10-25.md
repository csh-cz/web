# Dead-link audit — 2026-10-25

Vygenerováno skriptem `scripts/audit-dead-links.mjs` 2026-10-25T08:51:22Z.

## Souhrn

- **Skenované adresáře:** 7 (content/hodinarium-eu, content/hodinari, content/kroky, content/slovnik, content/soupis-veznich-hodin, content/kronika, content/horologie-cz)
- **Unikátních URL:** 737
- **Funkční (2xx/3xx):** 666
- **Mrtvé / nedostupné (HTTP 4xx):** 33
- **Neověřené (5xx / timeout / blokace):** 38
- **Z toho s Wayback Machine snapshotem:** 15

## Pro editora

Pro každý mrtvý odkaz níže vyberte:

- **REPLACE → Wayback** — nahradit URL za Wayback Machine snapshot (pokud existuje a obsah je zachován)
- **REPLACE → ekvivalent** — najít aktuální zdroj se stejným obsahem (např. archived → původní web v nové struktuře)
- **REMOVE** — odstranit odkaz (jeho obsah už není relevantní)

---

## Mrtvé odkazy (33 unikátních URL ve 32 souborech)

### `content/hodinari/milos-flossmann.mdx`

- **HTTP 404** — https://www.propamatky.cz/katalog-sluzeb/subjekty/dokumenty/cl_1283_clanek-oprava-hodin-v-pomezi-nad-ohri.pdf
  - Pole: `fm:references[0]:url`
  - Kontext: …https://www.propamatky.cz/katalog-sluzeb/subjekty/dokumenty/cl_1283_clanek-oprav…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/ato.md`

- **HTTP 404** — http://www.faszination.ch/e_einz_e.htm
  - Pole: `body:link`
  - Kontext: … CLOCK** - Virtuální galerie [**Elektrické hodiny**](http://www.faszination.ch/e_einz_e.htm) - Virtuální galerie **Elect…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20260306000003/https://faszination.ch/e_einz_e.htm (20260306000003)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/cas-internet2.md`

- **HTTP 403** — http://cs.thetimenow.com/clock/czech_republic/sob%c4%9bslav?t=n&amp;embed=1&amp;text=12&amp;textdate=15&amp;format=24&amp;digitalclock=30&amp;analogclock=60&amp;letter_spacing=-2&amp;bordersize=1&amp;bordercolor=BCE2F7&amp;bgcolor=EBF8FF&amp;colorloc=000000&amp;colordigital=2C8EBF&amp;colordate=000000&amp;styleloc=normal&amp;styledigital=normal&amp;styledate=normal&amp;right=0
  - Pole: `body:bare`
  - Kontext: …rchive.org/web/20150920012926/http://cs.thetimenow.com/clock/czech_republic/sob%c4%9bslav?t=n&amp;embed=1&amp;text=12&am…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/decin-ntp.md`

- **HTTP 403** — http://www.gpsntp.com/
  - Pole: `body:link`
  - Kontext: … osel.cz. [cit. 2026-04-28] - [www.gpsntp.com](http://www.gpsntp.com/) — gpsntp.com. [cit. 2026-04-…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20260606035653/https://gpsntp.com/ (20260606035653)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/kulicky.md`

- **HTTP 403** — http://www.philohome.com/kojima_clock/ball_clock.htm
  - Pole: `body:link`
  - Kontext: …jimw/ballclks.html) a ještě - [Bob Kojima's rolling ball clock](http://www.philohome.com/kojima_clock/ball_clock.htm) - …
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20260414092700/https://www.philohome.com/kojima_clock/ball_clock.htm (20260414092700)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/lenzkirch.md`

- **HTTP 403** — http://www.lenzkirchclocks.com/lenzkirch-serial-numbers.shtml
  - Pole: `body:link`
  - Kontext: …již nedostupný). Na stránkách [Lenzkirch clock](http://www.lenzkirchclocks.com/lenzkirch-serial-numbers.shtml) je ale uv…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20250622073658/http://www.lenzkirchclocks.com/lenzkirch-serial-numbers.shtml (20250622073658)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 403** — http://www.lenzkirchclocks.com/lenzkirch-trade-symbols.shtml
  - Pole: `body:link`
  - Kontext: …2 Million** . Více o značkách [zde.](http://www.lenzkirchclocks.com/lenzkirch-trade-symbols.shtml) ![krbové hodiny Lenzk…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20260414183111/http://www.lenzkirchclocks.com/lenzkirch-trade-symbols.shtml (20260414183111)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 403** — http://www.lenzkirchclocks.com/
  - Pole: `body:link`
  - Kontext: …z2894bv3.jpg) **Odkazy:** - [**Lenzkirch clock**](http://www.lenzkirchclocks.com/)Rozsáhlé stránky **Lenzkirch …
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20260613220839/https://lenzkirchclocks.com/ (20260613220839)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/muzea-cr.md`

- **HTTP 403** — http://www.radio.cz/cz/clanek/50301
  - Pole: `body:link`
  - Kontext: …troje. Další informace také v [článku Radio Praha](http://www.radio.cz/cz/clanek/50301). Muzeum určitě nevynechat vi…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/muzeum-gdansk-zegarow-wiezowych.md`

- **HTTP 403** — https://trojmiasto.tv/Muzeum-Zegarow-Wiezowych-Gdansk-22030.html
  - Pole: `fm:references[1]:url`
  - Kontext: …https://trojmiasto.tv/Muzeum-Zegarow-Wiezowych-Gdansk-22030.html…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/nocturnal.md`

- **HTTP 403** — https://www.lh-shop.cz/index.php?page=shop.product_details&product_id=3519&category_id=134&flypage=trh_flypage.tpl&option=com_virtuemart&Itemid=5&lang=cs
  - Pole: `body:link`
  - Kontext: …a se nocturnal vyrábí dodnes; [koupit lze třeba zde.](https://www.lh-shop.cz/index.php?page=shop.product_details&product…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/pneumatika.md`

- **HTTP 404** — https://junghansarchiv.de/uploads/1928_01_full_de1508c12e.pdf
  - Pole: `body:link`
  - Kontext: …odružné hodiny ### Odkazy - [Katalog Junghans](https://junghansarchiv.de/uploads/1928_01_full_de1508c12e.pdf) - [Histori…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/propeller-clock.md`

- **HTTP 403** — http://www.freepatentsonline.com/6856303.html
  - Pole: `body:link`
  - Kontext: …stem** - chráněn patentem USA [6856303](http://www.freepatentsonline.com/6856303.html). ![Podobně vypadající hodin…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20220118042501/https://www.freepatentsonline.com/6856303.html (20220118042501)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/svarcvaldky-18stol.md`

- **HTTP 403** — http://www.aukro.cz/
  - Pole: `body:link`
  - Kontext: …ět nádherné hodiny z aukce na [www.aukro.cz](http://www.aukro.cz/), údajně z roku 1771. Prodejc…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20261024111606/https://aukro.cz/ (20261024111606)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/vezni-muzejicko-evropa.md`

- **HTTP 403** — https://trojmiasto.tv/Muzeum-Zegarow-Wiezowych-5893.html
  - Pole: `body:link`
  - Kontext: …sk/atrakcje-turystyczne/1906) [trojmiasto.tv/Muzeum-Zegarow-Wiezowych-5893.html](https://trojmiasto.tv/Muzeum-Zegarow-Wi…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20191023035203/https://trojmiasto.tv/Muzeum-Zegarow-Wiezowych-5893.html (20191023035203)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/kronika/vezni-muzejicko.md`

- **HTTP 403** — http://theclockworks.org/
  - Pole: `body:link`
  - Kontext: …iDNES.cz. [cit. 2026-04-28] - [The Clockworks – Museum | Workshop](http://theclockworks.org/) — theclockworks.org. [cit.…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20260904042845/https://theclockworks.org/ (20260904042845)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/soupis-veznich-hodin/1700-pomezi-nad-ohri-jakub-vetsi.mdx`

- **HTTP 404** — https://www.propamatky.cz/katalog-sluzeb/subjekty/dokumenty/cl_1283_clanek-oprava-hodin-v-pomezi-nad-ohri.pdf
  - Pole: `fm:prameny[0]:url`
  - Kontext: …https://www.propamatky.cz/katalog-sluzeb/subjekty/dokumenty/cl_1283_clanek-oprav…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://www.propamatky.cz/katalog-sluzeb/subjekty/dokumenty/cl_1283_clanek-oprava-hodin-v-pomezi-nad-ohri.pdf
  - Pole: `body:link`
  - Kontext: …expozici). PDF skenu článku: [propamatky.cz](https://www.propamatky.cz/katalog-sluzeb/subjekty/dokumenty/cl_1283_clanek-…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/soupis-veznich-hodin/1753-pecka-sv-bartolomej.mdx`

- **HTTP 403** — https://iispp.npu.cz/mis_public/documentDetail.htm?id=1220477
  - Pole: `fm:prameny[0]:url`
  - Kontext: …https://iispp.npu.cz/mis_public/documentDetail.htm?id=1220477…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/soupis-veznich-hodin/1767-borotin-zamek.mdx`

- **HTTP 403** — https://iispp.npu.cz/mis_public/documentDetail.htm?id=349596
  - Pole: `fm:prameny[0]:url`
  - Kontext: …https://iispp.npu.cz/mis_public/documentDetail.htm?id=349596…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 403** — https://iispp.npu.cz/mis_public/documentDetail.htm?id=349596
  - Pole: `body:link`
  - Kontext: …čení stavby zámku. Detail viz [stavebně historický průzkum NPÚ](https://iispp.npu.cz/mis_public/documentDetail.htm?id=34…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/soupis-veznich-hodin/1788-markvartice-prokes.mdx`

- **HTTP 403** — https://iispp.npu.cz/mis_public/documentDetail.htm?id=1281585
  - Pole: `fm:prameny[0]:url`
  - Kontext: …https://iispp.npu.cz/mis_public/documentDetail.htm?id=1281585…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/soupis-veznich-hodin/1836-blovice-radnice-wollmann.mdx`

- **HTTP 403** — https://iispp.npu.cz/mis_public/documentDetail.htm?id=746231
  - Pole: `fm:prameny[0]:url`
  - Kontext: …https://iispp.npu.cz/mis_public/documentDetail.htm?id=746231…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/soupis-veznich-hodin/1882-trebovice-ve-slezsku-kostel.mdx`

- **HTTP 403** — https://iispp.npu.cz/mis_public/documentDetail.htm?id=727746
  - Pole: `fm:prameny[0]:url`
  - Kontext: …https://iispp.npu.cz/mis_public/documentDetail.htm?id=727746…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20210128141839/https://iispp.npu.cz/mis_public/documentDetail.htm?id=727746 (20210128141839)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 403** — https://iispp.npu.cz/mis_public/documentDetail.htm?id=727746
  - Pole: `body:link`
  - Kontext: …prostřed hřbitova. Detail viz [rozhodnutí Ministerstva kultury (NPÚ MIS 727746)](https://iispp.npu.cz/mis_public/documen…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20210128141839/https://iispp.npu.cz/mis_public/documentDetail.htm?id=727746 (20210128141839)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/soupis-veznich-hodin/1888-kraslice-radnice.mdx`

- **HTTP 403** — https://iispp.npu.cz/mis_public/documentDetail.htm?id=1737614
  - Pole: `fm:prameny[0]:url`
  - Kontext: …https://iispp.npu.cz/mis_public/documentDetail.htm?id=1737614…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 403** — https://iispp.npu.cz/mis_public/documentDetail.htm?id=1737614
  - Pole: `body:link`
  - Kontext: …lezeny jen zbytky. Detail viz [návrh NPÚ na prohlášení za kulturní památku](https://iispp.npu.cz/mis_public/documentDeta…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/soupis-veznich-hodin/1893-domazlice-hainz.mdx`

- **HTTP 403** — https://iispp.npu.cz/mis_public/documentDetail.htm?id=1292106
  - Pole: `fm:prameny[0]:url`
  - Kontext: …https://iispp.npu.cz/mis_public/documentDetail.htm?id=1292106…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20210128035014/https://iispp.npu.cz/mis_public/documentDetail.htm?id=1292106 (20210128035014)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 403** — https://iispp.npu.cz/mis_public/documentDetail.htm?id=1292106
  - Pole: `body:link`
  - Kontext: …MK ČR 15. 6. 2017; detail viz [rozhodnutí v NPÚ MIS](https://iispp.npu.cz/mis_public/documentDetail.htm?id=1292106) a pu…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20210128035014/https://iispp.npu.cz/mis_public/documentDetail.htm?id=1292106 (20210128035014)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/soupis-veznich-hodin/1901-hradek-nad-nisou-chram-pokoje.mdx`

- **HTTP 403** — https://iispp.npu.cz/mis_public/documentDetail.htm?id=1454971
  - Pole: `fm:prameny[0]:url`
  - Kontext: …https://iispp.npu.cz/mis_public/documentDetail.htm?id=1454971…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 403** — https://iispp.npu.cz/mis_public/documentDetail.htm?id=1454971
  - Pole: `body:link`
  - Kontext: …původního vzoru**. Detail viz [návrh NPÚ na prohlášení za kulturní památku](https://iispp.npu.cz/mis_public/documentDeta…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/soupis-veznich-hodin/1903-krnov-evangelicky-kostel.mdx`

- **HTTP 403** — https://iispp.npu.cz/mis_public/documentDetail.htm?id=1694802
  - Pole: `fm:prameny[0]:url`
  - Kontext: …https://iispp.npu.cz/mis_public/documentDetail.htm?id=1694802…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 403** — https://iispp.npu.cz/mis_public/documentDetail.htm?id=1694802
  - Pole: `body:link`
  - Kontext: …Gebrüder Rieger**. Detail viz [návrh NPÚ na prohlášení za kulturní památku](https://iispp.npu.cz/mis_public/documentDeta…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/soupis-veznich-hodin/1913-bilovice-nad-svitavou-cyril-metodej.mdx`

- **HTTP 403** — https://iispp.npu.cz/mis_public/documentDetail.htm?id=1938708
  - Pole: `fm:prameny[0]:url`
  - Kontext: …https://iispp.npu.cz/mis_public/documentDetail.htm?id=1938708…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/soupis-veznich-hodin/1935-velenice-svata-anezka.mdx`

- **HTTP 403** — https://iispp.npu.cz/mis_public/documentDetail.htm?id=1386677
  - Pole: `fm:prameny[0]:url`
  - Kontext: …https://iispp.npu.cz/mis_public/documentDetail.htm?id=1386677…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20210128114345/https://iispp.npu.cz/mis_public/documentDetail.htm?id=1386677 (20210128114345)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 403** — https://iispp.npu.cz/mis_public/documentDetail.htm?id=1386677
  - Pole: `body:link`
  - Kontext: …ým Anežce České**. Detail viz [návrh NPÚ na prohlášení za kulturní památku](https://iispp.npu.cz/mis_public/documentDeta…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20210128114345/https://iispp.npu.cz/mis_public/documentDetail.htm?id=1386677 (20210128114345)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/soupis-veznich-hodin/kristianov-liberec-zakladni-skola.mdx`

- **HTTP 403** — https://iispp.npu.cz/mis_public/documentDetail.htm?id=1737276
  - Pole: `fm:prameny[0]:url`
  - Kontext: …https://iispp.npu.cz/mis_public/documentDetail.htm?id=1737276…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 403** — https://iispp.npu.cz/mis_public/documentDetail.htm?id=1737276
  - Pole: `body:link`
  - Kontext: … autorské moderny. Detail viz [rozhodnutí Ministerstva kultury (NPÚ MIS 1737276)](https://iispp.npu.cz/mis_public/docume…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/soupis-veznich-hodin/nedatovano-decin-rozbelesy-sv-vaclav.mdx`

- **HTTP 403** — https://iispp.npu.cz/mis_public/documentDetail.htm?id=432624
  - Pole: `fm:prameny[0]:url`
  - Kontext: …https://iispp.npu.cz/mis_public/documentDetail.htm?id=432624…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/soupis-veznich-hodin/nedatovano-lidman-narozeni-pm.mdx`

- **HTTP 403** — https://iispp.npu.cz/mis_public/documentDetail.htm?id=163717
  - Pole: `fm:prameny[0]:url`
  - Kontext: …https://iispp.npu.cz/mis_public/documentDetail.htm?id=163717…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/soupis-veznich-hodin/nedatovano-lounovice-pod-blanikem-kostel.mdx`

- **HTTP 403** — https://iispp.npu.cz/mis_public/documentDetail.htm?id=378357
  - Pole: `fm:prameny[0]:url`
  - Kontext: …https://iispp.npu.cz/mis_public/documentDetail.htm?id=378357…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20250122002651/https://iispp.npu.cz/mis_public/documentDetail.htm?id=378357 (20250122002651)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/soupis-veznich-hodin/nedatovano-nepomysl-sv-mikulas.mdx`

- **HTTP 403** — https://iispp.npu.cz/mis_public/documentDetail.htm?id=432812
  - Pole: `fm:prameny[0]:url`
  - Kontext: …https://iispp.npu.cz/mis_public/documentDetail.htm?id=432812…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20210128211344/https://iispp.npu.cz/mis_public/documentDetail.htm?id=432812 (20210128211344)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/soupis-veznich-hodin/skala-realizace-jicin-svaty-ignac.mdx`

- **HTTP 403** — https://iispp.npu.cz/mis_public/documentDetail.htm?id=1271963
  - Pole: `fm:prameny[0]:url`
  - Kontext: …https://iispp.npu.cz/mis_public/documentDetail.htm?id=1271963…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 403** — https://iispp.npu.cz/mis_public/documentDetail.htm?id=1271963
  - Pole: `body:link`
  - Kontext: …ní popis konstrukce vychází z [návrhu NPÚ na prohlášení strojů za kulturní památku](https://iispp.npu.cz/mis_public/docu…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_


---

## Neověřené (5xx / timeout / blokace, 38)

Tyto URL nešly automaticky ověřit:

- **status 0** — network error / timeout / blokace bota
- **5xx** — server-side problém (přetížení, anti-bot challenge, vyžaduje session/JS)

Často jsou **živé** — ověřit ručně v prohlížeči, NEoznačovat automaticky markerem.

- http://saluspopulae.co.uk/synclock/content/IMG\_0083\_large.html _(fetch failed)_
- http://www.hibrno.cz/ _(fetch failed)_
- http://www.marcdatabase.com/~lemur/dm-gitton.html _(timeout)_
- http://www.turmtechnik.com/zabreh/seite2.html _(HTTP 503)_
- http://www.turmtechnik.com/zabreh/zabreh/ _(HTTP 503)_
- http://www.wooden-clockworks.com/ _(fetch failed)_
- https://christies.com/en/lot/lot-4973414 _(timeout)_
- https://doi.org/10.14311/AP.2024.64.0237 _(fetch failed)_
- https://forum.sakul.cz/viewtopic.php?p=1512#p1512 _(fetch failed)_
- https://microsemi.com/product-directory/embedded-clocks-frequency-references/5570-miniature-atomic-clock-mac-sa5x _(timeout)_
- https://perso.orange.fr/cadrans.solaires/cadrans/Cadran-clepsydre.html _(fetch failed)_
- https://static.bodet-time.com/images/stories/Pdfs/EN/Manuals/Distribution/606547D%20NTP%20AFNOR%20interface%20instructions.pdf _(fetch failed)_
- https://web.archive.org/web/20260207035738/https://indico.fjfi.cvut.cz/event/127/contributions/2868/ _(fetch failed)_
- https://www.cdsh.cz/ _(fetch failed)_
- https://www.digitalniknihovna.cz/mzk/uuid/uuid:07c7d0d0-7730-11e6-bb23-005056827e51 _(fetch failed)_
- https://www.fachkreis-turmuhren.de/ _(fetch failed)_
- https://www.hodinarstvi-marek.cz/ _(fetch failed)_
- https://www.hodinarstvi-marek.cz/cs/27-hodinove-stroje-jana-janaty-z-podebrad _(fetch failed)_
- https://www.hojsova-straz.cz _(fetch failed)_
- https://www.jiskra-benesov.cz/clanek/proc-lenka-filipova-nabidla-pomoc-nezvonicim-zvonum-a-vezni-hodiny-zase-obijeji-cas-7976 _(timeout)_
- https://www.litomysl.cz/atraktivity/litomyslsky_orloj _(fetch failed)_
- https://www.museodellorologeria.com/ _(fetch failed)_
- https://www.orloje.eu/sekce/prostejovsky-orloj/ _(fetch failed)_
- https://www.pamatkovykatalog.cz/?id=1000149307 _(HTTP 503)_
- https://www.pamatkovykatalog.cz/?id=1000151672_0005 _(HTTP 503)_
- https://www.pamatkovykatalog.cz/?id=1725889992 _(HTTP 503)_
- https://www.pamatkovykatalog.cz/?id=2000006297 _(HTTP 503)_
- https://www.pamatkovykatalog.cz/?presenter=LegalStatesResults&action=legalState&legalState=145205 _(HTTP 503)_
- https://www.pamatkovykatalog.cz/budova-celni-expozitury-3122498 _(HTTP 503)_
- https://www.pamatkovykatalog.cz/byvale-jezuitske-gymnazium-13403715 _(HTTP 503)_
- https://www.pamatkovykatalog.cz/evangelicky-kostel-sv-bartolomeje-2168350 _(HTTP 503)_
- https://www.pamatkovykatalog.cz/radnice-a-budova-byvaleho-berniho-uradu-a-soudu-18557631 _(HTTP 503)_
- https://www.sakul.cz/gps-hodiny-v2-pe2-2015/n/ _(fetch failed)_
- https://www.sakul.cz/stopky-pro-hasice-smd/n _(fetch failed)_
- https://www.samotisky.cz/assets/File.ashx?id_org=14603&id_dokumenty=1005 _(fetch failed)_
- https://www.taborcz.eu/obnova-stare-radnice-prispeje-k-oslavam-zalozeni-mesta/d-66966 _(fetch failed)_
- https://www.unicov.cz/assets/File.ashx?id_org=17450&id_dokumenty=1645 _(fetch failed)_
- https://www.veznihodiny.cz/ _(fetch failed)_