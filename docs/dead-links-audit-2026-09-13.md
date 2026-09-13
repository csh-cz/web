# Dead-link audit — 2026-09-13

Vygenerováno skriptem `scripts/audit-dead-links.mjs` 2026-09-13T08:40:09Z.

## Souhrn

- **Skenované adresáře:** 7 (content/hodinarium-eu, content/hodinari, content/kroky, content/slovnik, content/soupis-veznich-hodin, content/kronika, content/horologie-cz)
- **Unikátních URL:** 737
- **Funkční (2xx/3xx):** 684
- **Mrtvé / nedostupné (HTTP 4xx):** 10
- **Neověřené (5xx / timeout / blokace):** 43
- **Z toho s Wayback Machine snapshotem:** 5

## Pro editora

Pro každý mrtvý odkaz níže vyberte:

- **REPLACE → Wayback** — nahradit URL za Wayback Machine snapshot (pokud existuje a obsah je zachován)
- **REPLACE → ekvivalent** — najít aktuální zdroj se stejným obsahem (např. archived → původní web v nové struktuře)
- **REMOVE** — odstranit odkaz (jeho obsah už není relevantní)

---

## Mrtvé odkazy (10 unikátních URL ve 9 souborech)

### `content/hodinari/milos-flossmann.mdx`

- **HTTP 404** — https://www.propamatky.cz/katalog-sluzeb/subjekty/dokumenty/cl_1283_clanek-oprava-hodin-v-pomezi-nad-ohri.pdf
  - Pole: `fm:references[0]:url`
  - Kontext: …https://www.propamatky.cz/katalog-sluzeb/subjekty/dokumenty/cl_1283_clanek-oprav…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
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
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
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


---

## Neověřené (5xx / timeout / blokace, 43)

Tyto URL nešly automaticky ověřit:

- **status 0** — network error / timeout / blokace bota
- **5xx** — server-side problém (přetížení, anti-bot challenge, vyžaduje session/JS)

Často jsou **živé** — ověřit ručně v prohlížeči, NEoznačovat automaticky markerem.

- http://osel.cz/index.php?clanek=1458 _(fetch failed)_
- http://saluspopulae.co.uk/synclock/content/IMG\_0083\_large.html _(fetch failed)_
- http://www.digitron.cz/ _(fetch failed)_
- http://www.digitron.cz/rekl_hodiny.htm _(fetch failed)_
- http://www.ens-lyon.fr/RELIE/Cadrans/ _(fetch failed)_
- http://www.hibrno.cz/ _(fetch failed)_
- http://www.marcdatabase.com/~lemur/dm-gitton.html _(timeout)_
- http://www.turmtechnik.com/zabreh/seite2.html _(HTTP 503)_
- http://www.turmtechnik.com/zabreh/zabreh/ _(HTTP 503)_
- https://christies.com/en/lot/lot-4973414 _(timeout)_
- https://dspace.vutbr.cz/bitstream/handle/11012/39582/final-thesis.pdf?sequence=-1 _(fetch failed)_
- https://forum.sakul.cz/viewtopic.php?p=1512#p1512 _(fetch failed)_
- https://interval.cz/clanky/elektronicke-casove-razitko-doplnek-elektronickeho-podpisu/ _(fetch failed)_
- https://klementinum.com/ _(timeout)_
- https://microsemi.com/product-directory/embedded-clocks-frequency-references/5570-miniature-atomic-clock-mac-sa5x _(timeout)_
- https://perso.orange.fr/cadrans.solaires/cadrans/Cadran-clepsydre.html _(fetch failed)_
- https://static.bodet-time.com/images/stories/Pdfs/EN/Manuals/Distribution/606547D%20NTP%20AFNOR%20interface%20instructions.pdf _(fetch failed)_
- https://web.archive.org/web/20130618212643/http://uv201.com:80/Clock_Pages/mystery_clocks.htm _(fetch failed)_
- https://web.archive.org/web/20151009214629/http://www.novinky.cz/cestovani/tipy-na-vylety/380344-decinska-expozice-ukaze-jak-nasi-predkove-merili-cas.html _(fetch failed)_
- https://web.archive.org/web/20180927230843/http://www.mojeurlopy.pl/gdansk/atrakcje-turystyczne/1906 _(fetch failed)_
- https://web.archive.org/web/20231209024504/http://www.koprivahodinar.cz/ _(fetch failed)_
- https://web.archive.org/web/20250323212554/https://digilander.libero.it/orologi.solari/ _(fetch failed)_
- https://web.archive.org/web/20250402055629/https://www.academia.edu/35888544/Orologi_pubblici_pneumatici_a_Parigi _(fetch failed)_
- https://web.archive.org/web/20250612154618/https://www.astroama.com/ _(fetch failed)_
- https://web.archive.org/web/20260207035738/https://indico.fjfi.cvut.cz/event/127/contributions/2868/ _(fetch failed)_
- https://web.archive.org/web/20260207035738/https://indico.fjfi.cvut.cz/event/127/contributions/2868/attachments/966/1332/Astronomicke_funkce_a_umeleckohistoricka_analyza_planetaria_P._Engelberta_Seige_1792_ve_sbirkach_Narodniho_technickeho_muzea_v_Praze.pdf _(fetch failed)_
- https://www.cdsh.cz/ _(fetch failed)_
- https://www.fachkreis-turmuhren.de/ _(fetch failed)_
- https://www.hodinarstvi-marek.cz/ _(fetch failed)_
- https://www.hodinarstvi-marek.cz/cs/27-hodinove-stroje-jana-janaty-z-podebrad _(fetch failed)_
- https://www.hojsova-straz.cz _(fetch failed)_
- https://www.jiskra-benesov.cz/clanek/proc-lenka-filipova-nabidla-pomoc-nezvonicim-zvonum-a-vezni-hodiny-zase-obijeji-cas-7976 _(fetch failed)_
- https://www.marianskatynice.cz/e_download.php?file=data/editor/124cs_4.pdf&original=Nov%C3%BD%20VLSB%204_2019_k%20tisku19122019.pdf _(fetch failed)_
- https://www.museodellorologeria.com/ _(fetch failed)_
- https://www.obeckunratice.cz/obec/financni-sbirka/budiz-v-poradku-zas-kostel-i-cas-26cs.html _(fetch failed)_
- https://www.orloje.eu/sekce/prostejovsky-orloj/ _(fetch failed)_
- https://www.osel.cz/3225-presnost-atomovych-hodin-gps-a-teorie-relativity.html _(fetch failed)_
- https://www.policenm.cz/e_download.php?file=data/editor/88cs_173.pdf&original=PM_18_01.pdf _(fetch failed)_
- https://www.policenm.cz/zivot-ve-meste/historie-mesta/cteni-o-stare-polici/radnicni-hodiny-/ _(fetch failed)_
- https://www.rozdalovice.eu/mesto/historie/co-skryva-radnicni-vezicka/ _(fetch failed)_
- https://www.sakul.cz/gps-hodiny-v2-pe2-2015/n/ _(fetch failed)_
- https://www.sakul.cz/stopky-pro-hasice-smd/n _(fetch failed)_
- https://www.veznihodiny.cz/ _(fetch failed)_