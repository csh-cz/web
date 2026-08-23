# Dead-link audit — 2026-08-23

Vygenerováno skriptem `scripts/audit-dead-links.mjs` 2026-08-23T04:30:28Z.

## Souhrn

- **Skenované adresáře:** 7 (content/hodinarium-eu, content/hodinari, content/kroky, content/slovnik, content/soupis-veznich-hodin, content/kronika, content/horologie-cz)
- **Unikátních URL:** 737
- **Funkční (2xx/3xx):** 692
- **Mrtvé / nedostupné (HTTP 4xx):** 6
- **Neověřené (5xx / timeout / blokace):** 39
- **Z toho s Wayback Machine snapshotem:** 2

## Pro editora

Pro každý mrtvý odkaz níže vyberte:

- **REPLACE → Wayback** — nahradit URL za Wayback Machine snapshot (pokud existuje a obsah je zachován)
- **REPLACE → ekvivalent** — najít aktuální zdroj se stejným obsahem (např. archived → původní web v nové struktuře)
- **REMOVE** — odstranit odkaz (jeho obsah už není relevantní)

---

## Mrtvé odkazy (6 unikátních URL ve 5 souborech)

### `content/hodinarium-eu/cas-internet2.md`

- **HTTP 403** — http://cs.thetimenow.com/clock/czech_republic/sob%c4%9bslav?t=n&amp;embed=1&amp;text=12&amp;textdate=15&amp;format=24&amp;digitalclock=30&amp;analogclock=60&amp;letter_spacing=-2&amp;bordersize=1&amp;bordercolor=BCE2F7&amp;bgcolor=EBF8FF&amp;colorloc=000000&amp;colordigital=2C8EBF&amp;colordate=000000&amp;styleloc=normal&amp;styledigital=normal&amp;styledate=normal&amp;right=0
  - Pole: `body:bare`
  - Kontext: …rchive.org/web/20150920012926/http://cs.thetimenow.com/clock/czech_republic/sob%c4%9bslav?t=n&amp;embed=1&amp;text=12&am…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/gps-sakul.md`

- **HTTP 404** — https://www.sakul.cz/gps-hodiny-v2-pe2-2015/n/
  - Pole: `body:link`
  - Kontext: …žice. Jde o hodiny popsané na [webu sakul.cz](https://www.sakul.cz/gps-hodiny-v2-pe2-2015/n/) včetně podrobné dokumentac…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20240814140749/https://www.sakul.cz/gps-hodiny-v2-pe2-2015/n (20240814140749)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://www.sakul.cz/gps-hodiny-v2-pe2-2015/n/
  - Pole: `body:link`
  - Kontext: …akul2.jpg) Popis je čerpán z [webu autora](https://www.sakul.cz/gps-hodiny-v2-pe2-2015/n/). Autor pro základ hodin pou…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20240814140749/https://www.sakul.cz/gps-hodiny-v2-pe2-2015/n (20240814140749)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://www.sakul.cz/gps-hodiny-v2-pe2-2015/n/
  - Pole: `body:link`
  - Kontext: … ### Odkazy - podrobný popis [gps-hodiny-v2-pe2-2015/n/](https://www.sakul.cz/gps-hodiny-v2-pe2-2015/n/) - Komponenty [f…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20240814140749/https://www.sakul.cz/gps-hodiny-v2-pe2-2015/n (20240814140749)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://www.sakul.cz/stopky-pro-hasice-smd/n
  - Pole: `body:link`
  - Kontext: …konstrukce autora - například [stopky nejen pro hasiče](https://www.sakul.cz/stopky-pro-hasice-smd/n) - *GNSS — Wikipedi…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20241107102502/https://sakul.cz/stopky-pro-hasice-smd/n/ (20241107102502)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/muzea-cr.md`

- **HTTP 429** — http://www.muzeum-nmnm.cz/index.php/cz/expozice/hodinarska-expozice
  - Pole: `body:link`
  - Kontext: …d=700)** a na stránkách muzea [**www.muzeum-nmnm.cz**](http://www.muzeum-nmnm.cz/index.php/cz/expozice/hodinarska-expozi…
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


---

## Neověřené (5xx / timeout / blokace, 39)

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
- http://www.marcdatabase.com/~lemur/dm-gitton.html _(timeout)_
- http://www.muzeum-teplice.cz/historicke-hodiny/ _(fetch failed)_
- http://www.timhunkin.com/ _(fetch failed)_
- http://www.timhunkin.com/26_public_clocks1.htm _(fetch failed)_
- http://www.timhunkin.com/27_domestic_clocks.htm _(fetch failed)_
- http://www.timhunkin.com/31_giant_steam_clock2.htm _(fetch failed)_
- http://www.timhunkin.com/62_chelsea_flower_show.htm _(fetch failed)_
- http://www.timhunkin.com/63_southwold_water_clock.htm _(fetch failed)_
- http://www.timhunkin.com/a136_zoo-clock.htm _(fetch failed)_
- http://www.turmtechnik.com/zabreh/seite2.html _(HTTP 503)_
- http://www.turmtechnik.com/zabreh/zabreh/ _(HTTP 503)_
- https://christies.com/en/lot/lot-4973414 _(timeout)_
- https://microsemi.com/product-directory/embedded-clocks-frequency-references/5570-miniature-atomic-clock-mac-sa5x _(timeout)_
- https://perso.orange.fr/cadrans.solaires/cadrans/Cadran-clepsydre.html _(fetch failed)_
- https://static.bodet-time.com/images/stories/Pdfs/EN/Manuals/Distribution/606547D%20NTP%20AFNOR%20interface%20instructions.pdf _(fetch failed)_
- https://web.archive.org/web/20130618212643/http://uv201.com:80/Clock_Pages/mystery_clocks.htm _(fetch failed)_
- https://web.archive.org/web/20231003224950/http://www.nixieclocks.de/english/gallery/index.php _(fetch failed)_
- https://web.archive.org/web/20250323212554/https://digilander.libero.it/orologi.solari/ _(fetch failed)_
- https://web.archive.org/web/20250402055629/https://www.academia.edu/35888544/Orologi_pubblici_pneumatici_a_Parigi _(fetch failed)_
- https://www.cdsh.cz/ _(fetch failed)_
- https://www.fachkreis-turmuhren.de/ _(fetch failed)_
- https://www.hautehorlogerie.org/zh/watches-and-culture/watchmaking-knowledge/encyclopedia/roman-numeral-iiii-on-dials _(timeout)_
- https://www.hodinarstvi-marek.cz/ _(fetch failed)_
- https://www.hodinarstvi-marek.cz/cs/27-hodinove-stroje-jana-janaty-z-podebrad _(fetch failed)_
- https://www.hojsova-straz.cz _(fetch failed)_
- https://www.jiskra-benesov.cz/clanek/proc-lenka-filipova-nabidla-pomoc-nezvonicim-zvonum-a-vezni-hodiny-zase-obijeji-cas-7976 _(timeout)_
- https://www.museodellorologeria.com/ _(fetch failed)_
- https://www.nonseum.at/ _(fetch failed)_
- https://www.orloje.eu/sekce/prostejovsky-orloj/ _(fetch failed)_
- https://www.sothebys.com/en/auctions/ecatalogue/2012/george-daniels-so-l12313/lot.130.html _(HTTP 503)_
- https://www.sothebys.com/en/auctions/ecatalogue/2012/george-daniels-so-l12313/lot.131.html _(HTTP 503)_
- https://www.sothebys.com/en/auctions/ecatalogue/2013/treasures-princely-taste-l13303/lot.12.html _(HTTP 503)_
- https://www.veznihodiny.cz/ _(fetch failed)_