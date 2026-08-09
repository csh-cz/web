# Dead-link audit — 2026-08-09

Vygenerováno skriptem `scripts/audit-dead-links.mjs` 2026-08-09T04:58:59Z.

## Souhrn

- **Skenované adresáře:** 7 (content/hodinarium-eu, content/hodinari, content/kroky, content/slovnik, content/soupis-veznich-hodin, content/kronika, content/horologie-cz)
- **Unikátních URL:** 737
- **Funkční (2xx/3xx):** 683
- **Mrtvé / nedostupné (HTTP 4xx):** 5
- **Neověřené (5xx / timeout / blokace):** 49
- **Z toho s Wayback Machine snapshotem:** 2

## Pro editora

Pro každý mrtvý odkaz níže vyberte:

- **REPLACE → Wayback** — nahradit URL za Wayback Machine snapshot (pokud existuje a obsah je zachován)
- **REPLACE → ekvivalent** — najít aktuální zdroj se stejným obsahem (např. archived → původní web v nové struktuře)
- **REMOVE** — odstranit odkaz (jeho obsah už není relevantní)

---

## Mrtvé odkazy (5 unikátních URL ve 4 souborech)

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

## Neověřené (5xx / timeout / blokace, 49)

Tyto URL nešly automaticky ověřit:

- **status 0** — network error / timeout / blokace bota
- **5xx** — server-side problém (přetížení, anti-bot challenge, vyžaduje session/JS)

Často jsou **živé** — ověřit ručně v prohlížeči, NEoznačovat automaticky markerem.

- http://astro.mff.cuni.cz/mira/sh/sh.php _(fetch failed)_
- http://astro.mff.cuni.cz/mira/sh/sh.php?rec=18315 _(fetch failed)_
- http://astro.mff.cuni.cz/mira/sh/sh.php?type=exif&img=images/0_01_01_11-KOCI-201108221032-Klementinum_Hosp_dvur_13_2.jpg&rec=20853 _(fetch failed)_
- http://reseneulohy.cz/cs/fyzika/mechanika _(fetch failed)_
- http://saluspopulae.co.uk/synclock/content/IMG\_0083\_large.html _(fetch failed)_
- http://www.aldebaran.cz/bulletin/2004_43_nah.html _(fetch failed)_
- http://www.betrisey.ch/ _(fetch failed)_
- http://www.digitron.cz/ _(fetch failed)_
- http://www.digitron.cz/rekl_hodiny.htm _(fetch failed)_
- http://www.electricstuff.co.uk/nixclock.html _(fetch failed)_
- http://www.ens-lyon.fr/RELIE/Cadrans/ _(fetch failed)_
- http://www.freepatentsonline.com/6856303.html _(fetch failed)_
- http://www.hibrno.cz/ _(fetch failed)_
- http://www.lhainz.cz/ _(fetch failed)_
- http://www.marcdatabase.com/~lemur/dm-gitton.html _(timeout)_
- http://www.mikrolisk.de/show.php/280/letter_F _(fetch failed)_
- http://www.mjakub.cz/?idc=1308 _(fetch failed)_
- http://www.muzeum-nmnm.cz/index.php/cz/expozice/hodinarska-expozice _(fetch failed)_
- http://www.sbirkajara.cz/ _(fetch failed)_
- http://www.technicalmuseum.cz/ _(fetch failed)_
- http://www.trebino.it/Objects/Pagina.asp?ID=5&T=Museo%20orologi _(timeout)_
- http://www.turmtechnik.com/zabreh/seite2.html _(HTTP 503)_
- http://www.turmtechnik.com/zabreh/zabreh/ _(HTTP 503)_
- https://christies.com/en/lot/lot-4973414 _(timeout)_
- https://lhainz.cz/ _(fetch failed)_
- https://lhainz.cz/o-nas/ _(fetch failed)_
- https://microsemi.com/product-directory/embedded-clocks-frequency-references/5570-miniature-atomic-clock-mac-sa5x _(timeout)_
- https://perso.orange.fr/cadrans.solaires/cadrans/Cadran-clepsydre.html _(fetch failed)_
- https://srebrnykruk.pl/do-pobrania/05-Zegarmistrzostwo-Wawrzyniec-Podwapin%CC%81ski.pdf _(fetch failed)_
- https://static.bodet-time.com/images/stories/Pdfs/EN/Manuals/Distribution/606547D%20NTP%20AFNOR%20interface%20instructions.pdf _(fetch failed)_
- https://web.archive.org/web/20130618212643/http://uv201.com:80/Clock_Pages/mystery_clocks.htm _(fetch failed)_
- https://web.archive.org/web/20231003224950/http://www.nixieclocks.de/english/gallery/index.php _(fetch failed)_
- https://web.archive.org/web/20250323212554/https://digilander.libero.it/orologi.solari/ _(fetch failed)_
- https://web.archive.org/web/20250402055629/https://www.academia.edu/35888544/Orologi_pubblici_pneumatici_a_Parigi _(fetch failed)_
- https://web.archive.org/web/20250612154618/https://www.astroama.com/ _(fetch failed)_
- https://www.beyer-ch.com/uhrenmuseum/ _(fetch failed)_
- https://www.cdsh.cz/ _(fetch failed)_
- https://www.daliborfarny.com/story/ _(fetch failed)_
- https://www.fachkreis-turmuhren.de/ _(fetch failed)_
- https://www.hautehorlogerie.org/zh/watches-and-culture/watchmaking-knowledge/encyclopedia/roman-numeral-iiii-on-dials _(timeout)_
- https://www.hodinarstvi-marek.cz/ _(fetch failed)_
- https://www.hodinarstvi-marek.cz/cs/27-hodinove-stroje-jana-janaty-z-podebrad _(fetch failed)_
- https://www.hojsova-straz.cz _(fetch failed)_
- https://www.jiskra-benesov.cz/clanek/proc-lenka-filipova-nabidla-pomoc-nezvonicim-zvonum-a-vezni-hodiny-zase-obijeji-cas-7976 _(timeout)_
- https://www.litomysl.cz/atraktivity/litomyslsky_orloj _(fetch failed)_
- https://www.muenchen.de/en/sights/munich-glockenspiel _(HTTP 503)_
- https://www.museodellorologeria.com/ _(fetch failed)_
- https://www.orloje.eu/sekce/prostejovsky-orloj/ _(fetch failed)_
- https://www.veznihodiny.cz/ _(fetch failed)_