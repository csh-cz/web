# Dead-link audit — 2026-09-06

Vygenerováno skriptem `scripts/audit-dead-links.mjs` 2026-09-06T08:15:30Z.

## Souhrn

- **Skenované adresáře:** 7 (content/hodinarium-eu, content/hodinari, content/kroky, content/slovnik, content/soupis-veznich-hodin, content/kronika, content/horologie-cz)
- **Unikátních URL:** 737
- **Funkční (2xx/3xx):** 694
- **Mrtvé / nedostupné (HTTP 4xx):** 7
- **Neověřené (5xx / timeout / blokace):** 36
- **Z toho s Wayback Machine snapshotem:** 3

## Pro editora

Pro každý mrtvý odkaz níže vyberte:

- **REPLACE → Wayback** — nahradit URL za Wayback Machine snapshot (pokud existuje a obsah je zachován)
- **REPLACE → ekvivalent** — najít aktuální zdroj se stejným obsahem (např. archived → původní web v nové struktuře)
- **REMOVE** — odstranit odkaz (jeho obsah už není relevantní)

---

## Mrtvé odkazy (7 unikátních URL ve 5 souborech)

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
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
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


---

## Neověřené (5xx / timeout / blokace, 36)

Tyto URL nešly automaticky ověřit:

- **status 0** — network error / timeout / blokace bota
- **5xx** — server-side problém (přetížení, anti-bot challenge, vyžaduje session/JS)

Často jsou **živé** — ověřit ručně v prohlížeči, NEoznačovat automaticky markerem.

- http://digifolio.rvp.cz/user/view.php?id=1411 _(timeout)_
- http://saluspopulae.co.uk/synclock/content/IMG\_0083\_large.html _(fetch failed)_
- http://www.digitron.cz/ _(fetch failed)_
- http://www.digitron.cz/rekl_hodiny.htm _(fetch failed)_
- http://www.ens-lyon.fr/RELIE/Cadrans/ _(fetch failed)_
- http://www.hibrno.cz/ _(fetch failed)_
- http://www.lhainz.cz/ _(fetch failed)_
- http://www.marcdatabase.com/~lemur/dm-gitton.html _(timeout)_
- http://www.turmtechnik.com/zabreh/seite2.html _(HTTP 503)_
- http://www.turmtechnik.com/zabreh/zabreh/ _(HTTP 503)_
- https://christies.com/en/lot/lot-4973414 _(timeout)_
- https://dspace.vutbr.cz/bitstream/handle/11012/39582/final-thesis.pdf?sequence=-1 _(fetch failed)_
- https://forum.sakul.cz/viewtopic.php?p=1512#p1512 _(fetch failed)_
- https://interval.cz/clanky/elektronicke-casove-razitko-doplnek-elektronickeho-podpisu/ _(fetch failed)_
- https://lhainz.cz/ _(fetch failed)_
- https://lhainz.cz/o-nas/ _(fetch failed)_
- https://microsemi.com/product-directory/embedded-clocks-frequency-references/5570-miniature-atomic-clock-mac-sa5x _(timeout)_
- https://perso.orange.fr/cadrans.solaires/cadrans/Cadran-clepsydre.html _(fetch failed)_
- https://static.bodet-time.com/images/stories/Pdfs/EN/Manuals/Distribution/606547D%20NTP%20AFNOR%20interface%20instructions.pdf _(fetch failed)_
- https://web.archive.org/web/20130618212643/http://uv201.com:80/Clock_Pages/mystery_clocks.htm _(fetch failed)_
- https://web.archive.org/web/20180927230843/http://www.mojeurlopy.pl/gdansk/atrakcje-turystyczne/1906 _(fetch failed)_
- https://web.archive.org/web/20231003224950/http://www.nixieclocks.de/english/gallery/index.php _(fetch failed)_
- https://web.archive.org/web/20250323212554/https://digilander.libero.it/orologi.solari/ _(fetch failed)_
- https://web.archive.org/web/20250402055629/https://www.academia.edu/35888544/Orologi_pubblici_pneumatici_a_Parigi _(fetch failed)_
- https://web.archive.org/web/20260207035738/https://indico.fjfi.cvut.cz/event/127/contributions/2868/ _(fetch failed)_
- https://www.cdsh.cz/ _(fetch failed)_
- https://www.fachkreis-turmuhren.de/ _(fetch failed)_
- https://www.hodinarstvi-marek.cz/ _(fetch failed)_
- https://www.hodinarstvi-marek.cz/cs/27-hodinove-stroje-jana-janaty-z-podebrad _(fetch failed)_
- https://www.hojsova-straz.cz _(fetch failed)_
- https://www.jiskra-benesov.cz/clanek/proc-lenka-filipova-nabidla-pomoc-nezvonicim-zvonum-a-vezni-hodiny-zase-obijeji-cas-7976 _(timeout)_
- https://www.museodellorologeria.com/ _(fetch failed)_
- https://www.orloje.eu/sekce/prostejovsky-orloj/ _(fetch failed)_
- https://www.sakul.cz/gps-hodiny-v2-pe2-2015/n/ _(fetch failed)_
- https://www.sakul.cz/stopky-pro-hasice-smd/n _(fetch failed)_
- https://www.veznihodiny.cz/ _(fetch failed)_