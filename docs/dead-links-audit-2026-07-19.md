# Dead-link audit — 2026-07-19

Vygenerováno skriptem `scripts/audit-dead-links.mjs` 2026-07-19T06:26:52Z.

## Souhrn

- **Skenované adresáře:** 7 (content/hodinarium-eu, content/hodinari, content/kroky, content/slovnik, content/soupis-veznich-hodin, content/kronika, content/horologie-cz)
- **Unikátních URL:** 737
- **Funkční (2xx/3xx):** 672
- **Mrtvé / nedostupné (HTTP 4xx):** 2
- **Neověřené (5xx / timeout / blokace):** 63
- **Z toho s Wayback Machine snapshotem:** 0

## Pro editora

Pro každý mrtvý odkaz níže vyberte:

- **REPLACE → Wayback** — nahradit URL za Wayback Machine snapshot (pokud existuje a obsah je zachován)
- **REPLACE → ekvivalent** — najít aktuální zdroj se stejným obsahem (např. archived → původní web v nové struktuře)
- **REMOVE** — odstranit odkaz (jeho obsah už není relevantní)

---

## Mrtvé odkazy (2 unikátních URL ve 2 souborech)

### `content/hodinarium-eu/cas-internet2.md`

- **HTTP 403** — http://cs.thetimenow.com/clock/czech_republic/sob%c4%9bslav?t=n&amp;embed=1&amp;text=12&amp;textdate=15&amp;format=24&amp;digitalclock=30&amp;analogclock=60&amp;letter_spacing=-2&amp;bordersize=1&amp;bordercolor=BCE2F7&amp;bgcolor=EBF8FF&amp;colorloc=000000&amp;colordigital=2C8EBF&amp;colordate=000000&amp;styleloc=normal&amp;styledigital=normal&amp;styledate=normal&amp;right=0
  - Pole: `body:bare`
  - Kontext: …rchive.org/web/20150920012926/http://cs.thetimenow.com/clock/czech_republic/sob%c4%9bslav?t=n&amp;embed=1&amp;text=12&am…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/nocturnal.md`

- **HTTP 403** — https://www.lh-shop.cz/index.php?page=shop.product_details&product_id=3519&category_id=134&flypage=trh_flypage.tpl&option=com_virtuemart&Itemid=5&lang=cs
  - Pole: `body:link`
  - Kontext: …a se nocturnal vyrábí dodnes; [koupit lze třeba zde.](https://www.lh-shop.cz/index.php?page=shop.product_details&product…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_


---

## Neověřené (5xx / timeout / blokace, 63)

Tyto URL nešly automaticky ověřit:

- **status 0** — network error / timeout / blokace bota
- **5xx** — server-side problém (přetížení, anti-bot challenge, vyžaduje session/JS)

Často jsou **živé** — ověřit ručně v prohlížeči, NEoznačovat automaticky markerem.

- http://saluspopulae.co.uk/synclock/content/IMG\_0083\_large.html _(fetch failed)_
- http://web.archive.org/web/20090716164838/http://www.zemepis.eu:80/stranka/mereni-casu _(timeout)_
- http://web.archive.org/web/20100514052728/http://www.thisisit.ca:80/worldclock2001/ _(timeout)_
- http://web.archive.org/web/20130524065953/http://www.swatch.com:80/xx_en/internettime.html _(timeout)_
- http://web.archive.org/web/20160327202644/https://dominanty.cz/pamatky-velka-chmelistna.php _(timeout)_
- http://web.archive.org/web/20170117010318/http://www.usboomers.com:80/clockothers.htm _(fetch failed)_
- http://web.archive.org/web/20170627153127/http://www.giovannisoft.cz/ _(timeout)_
- http://web.archive.org/web/20170924202604/http://spsh.cz/ _(fetch failed)_
- http://web.archive.org/web/20180829235111/http://dorfmuseum-guetenbach.de/de/dorfmuseum.htm _(fetch failed)_
- http://web.archive.org/web/20191122123049/http://www.antiquity.in/brillie-1.html _(timeout)_
- http://web.archive.org/web/20230311150443/http://www.veznihodiny.cz/ _(timeout)_
- http://web.archive.org/web/20230929035107/https://regulateurbrillie.monsite-orange.fr/ _(timeout)_
- http://web.archive.org/web/20250408182125/https://www.vlastafiller.wz.cz/ _(fetch failed)_
- http://web.archive.org/web/20250711210346/https://dratek.cz/arduino/832-eses-krokovy-motor-driver-pro-jednodeskove-pocitace.html _(HTTP 503)_
- http://web.archive.org/web/20250820205158/https://dratek.cz/arduino/1457-esp8266-esp-12e-ota-wemos-d1-ch340-wifi.html _(fetch failed)_
- http://web.archive.org/web/20250916221237/https://dratek.cz/arduino/1570-iic-i2c-display-lcd-1602-16x2-znaku-lcd-modul-modry.html _(fetch failed)_
- http://web.archive.org/web/20250927014458/https://www.sestka.com/ _(timeout)_
- http://web.archive.org/web/20251115182513/https://workclocks.co.uk/index.html _(fetch failed)_
- http://web.archive.org/web/20260119010907/https://forum.arduino.cc/t/ntp-time-server/192816/ _(timeout)_
- http://web.archive.org/web/20260214135546/https://www.uhrenstube-aschau.at/ _(timeout)_
- http://web.archive.org/web/20260215101033/https://thingpulse.com/ _(timeout)_
- http://web.archive.org/web/20260309004348/https://www.impuls.cz/regiony/jihocesky-kraj/stara-radnice-tabor-krov-jan-zizka-600-let.A200821_123202_imp-jihocesky_kov/ _(fetch failed)_
- http://web.archive.org/web/20260317054855/https://www.jindrisskavez.cz/index.php/cs/ _(fetch failed)_
- http://www.atelier90.cz/ _(fetch failed)_
- http://www.expozicecasu.cz/ _(fetch failed)_
- http://www.marcdatabase.com/~lemur/dm-gitton.html _(timeout)_
- http://www.reserv-a-rt.de _(fetch failed)_
- http://www.stirling.cz/ _(fetch failed)_
- https://archive.org/details/djinykrlovskhom00vvgoog _(fetch failed)_
- https://christies.com/en/lot/lot-4973414 _(timeout)_
- https://microsemi.com/product-directory/embedded-clocks-frequency-references/5570-miniature-atomic-clock-mac-sa5x _(timeout)_
- https://perso.orange.fr/cadrans.solaires/cadrans/Cadran-clepsydre.html _(fetch failed)_
- https://radiozurnal.rozhlas.cz/casova-znameni-10-dil-ceska-republika-6303408 _(timeout)_
- https://static.bodet-time.com/images/stories/Pdfs/EN/Manuals/Distribution/606547D%20NTP%20AFNOR%20interface%20instructions.pdf _(fetch failed)_
- https://web.archive.org/web/20120201013404/http://www.hodiny-spel.cz/atypicka_vyroba.php _(HTTP 503)_
- https://web.archive.org/web/20130524065953/http://www.swatch.com:80/xx_en/internettime.html _(HTTP 503)_
- https://web.archive.org/web/20130618212643/http://uv201.com:80/Clock_Pages/mystery_clocks.htm _(fetch failed)_
- https://web.archive.org/web/20150920012926/http://cs.thetimenow.com/clock/ _(HTTP 503)_
- https://web.archive.org/web/20151009214629/http://www.novinky.cz/cestovani/tipy-na-vylety/380344-decinska-expozice-ukaze-jak-nasi-predkove-merili-cas.html _(HTTP 503)_
- https://web.archive.org/web/20151221142525/http://www.novinky.cz:80/cestovani/tipy-na-vylety/385676-decinsky-zamek-vystavuje-mechanicke-hodiny-nechybi-ani-bizarni-kousky.html _(HTTP 503)_
- https://web.archive.org/web/20180927230843/http://www.mojeurlopy.pl/gdansk/atrakcje-turystyczne/1906 _(fetch failed)_
- https://web.archive.org/web/20210302045040/https://www.soselectronic.cz/articles/no-name/displej-citelny-za-kazdych-svetelnych-podminek-916 _(timeout)_
- https://web.archive.org/web/20210705205120/https://cdn.sos.sk/productdata/c0/63/d407ac85/h-715-yellow.pdf _(fetch failed)_
- https://web.archive.org/web/20231003224950/http://www.nixieclocks.de/english/gallery/index.php _(timeout)_
- https://web.archive.org/web/20231209024504/http://www.koprivahodinar.cz/ _(fetch failed)_
- https://web.archive.org/web/20240528072022/https://clockhistory.com/telechron/products/typea/index.html _(fetch failed)_
- https://web.archive.org/web/20250323212554/https://digilander.libero.it/orologi.solari/ _(fetch failed)_
- https://web.archive.org/web/20250402055629/https://www.academia.edu/35888544/Orologi_pubblici_pneumatici_a_Parigi _(fetch failed)_
- https://web.archive.org/web/20250612154618/https://www.astroama.com/ _(fetch failed)_
- https://web.archive.org/web/20250907175819/https://martinuvzivot.cz/konfigurace-ntp-serveru/ _(HTTP 503)_
- https://web.archive.org/web/20260207035738/https://indico.fjfi.cvut.cz/event/127/contributions/2868/ _(fetch failed)_
- https://web.archive.org/web/20260207035738/https://indico.fjfi.cvut.cz/event/127/contributions/2868/attachments/966/1332/Astronomicke_funkce_a_umeleckohistoricka_analyza_planetaria_P._Engelberta_Seige_1792_ve_sbirkach_Narodniho_technickeho_muzea_v_Praze.pdf _(fetch failed)_
- https://www.cdsh.cz/ _(fetch failed)_
- https://www.fachkreis-turmuhren.de/ _(fetch failed)_
- https://www.hodinarstvi-marek.cz/ _(fetch failed)_
- https://www.hodinarstvi-marek.cz/cs/27-hodinove-stroje-jana-janaty-z-podebrad _(fetch failed)_
- https://www.hojsova-straz.cz _(fetch failed)_
- https://www.jiskra-benesov.cz/clanek/proc-lenka-filipova-nabidla-pomoc-nezvonicim-zvonum-a-vezni-hodiny-zase-obijeji-cas-7976 _(timeout)_
- https://www.litomysl.cz/atraktivity/litomyslsky_orloj _(fetch failed)_
- https://www.museodellorologeria.com/ _(fetch failed)_
- https://www.orloje.eu/sekce/prostejovsky-orloj/ _(fetch failed)_
- https://www.veznihodiny.cz/ _(fetch failed)_
- https://zlin.rozhlas.cz/strazce-a-symbol-mesta-cerny-janek-zvoni-v-uherskem-brode-minutu-pred-celou-7445468 _(timeout)_