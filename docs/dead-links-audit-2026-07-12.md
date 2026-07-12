# Dead-link audit — 2026-07-12

Vygenerováno skriptem `scripts/audit-dead-links.mjs` 2026-07-12T06:28:22Z.

## Souhrn

- **Skenované adresáře:** 7 (content/hodinarium-eu, content/hodinari, content/kroky, content/slovnik, content/soupis-veznich-hodin, content/kronika, content/horologie-cz)
- **Unikátních URL:** 737
- **Funkční (2xx/3xx):** 699
- **Mrtvé / nedostupné (HTTP 4xx):** 4
- **Neověřené (5xx / timeout / blokace):** 34
- **Z toho s Wayback Machine snapshotem:** 2

## Pro editora

Pro každý mrtvý odkaz níže vyberte:

- **REPLACE → Wayback** — nahradit URL za Wayback Machine snapshot (pokud existuje a obsah je zachován)
- **REPLACE → ekvivalent** — najít aktuální zdroj se stejným obsahem (např. archived → původní web v nové struktuře)
- **REMOVE** — odstranit odkaz (jeho obsah už není relevantní)

---

## Mrtvé odkazy (4 unikátních URL ve 4 souborech)

### `content/hodinarium-eu/cas-internet2.md`

- **HTTP 403** — http://cs.thetimenow.com/clock/czech_republic/sob%c4%9bslav?t=n&amp;embed=1&amp;text=12&amp;textdate=15&amp;format=24&amp;digitalclock=30&amp;analogclock=60&amp;letter_spacing=-2&amp;bordersize=1&amp;bordercolor=BCE2F7&amp;bgcolor=EBF8FF&amp;colorloc=000000&amp;colordigital=2C8EBF&amp;colordate=000000&amp;styleloc=normal&amp;styledigital=normal&amp;styledate=normal&amp;right=0
  - Pole: `body:bare`
  - Kontext: …rchive.org/web/20150920012926/http://cs.thetimenow.com/clock/czech_republic/sob%c4%9bslav?t=n&amp;embed=1&amp;text=12&am…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/kuriozity1.md`

- **HTTP 403** — http://www.digitron.cz/
  - Pole: `body:link`
  - Kontext: …/english/gallery/index.php) - [české stránky o digitronkách](http://www.digitron.cz/) - [a ještě](http://www.elect…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20260404154046/http://www.digitron.cz/ (20260404154046)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/lahvace.md`

- **HTTP 403** — http://www.digitron.cz/
  - Pole: `body:link`
  - Kontext: …g/papiraky/sklojohn.jpg) Web [**www.digitron.cz**](http://www.digitron.cz/) má novou grafiku a určitě st…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20260404154046/http://www.digitron.cz/ (20260404154046)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 403** — http://www.digitron.cz/rekl_hodiny.htm
  - Pole: `body:link`
  - Kontext: …věly miniaturní lodě. Na webu [**digitron.cz**](http://www.digitron.cz/rekl_hodiny.htm) jsou k vidění reklamní hodin…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20250913133427/http://www.digitron.cz/rekl_hodiny.htm (20250913133427)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/nocturnal.md`

- **HTTP 403** — https://www.lh-shop.cz/index.php?page=shop.product_details&product_id=3519&category_id=134&flypage=trh_flypage.tpl&option=com_virtuemart&Itemid=5&lang=cs
  - Pole: `body:link`
  - Kontext: …a se nocturnal vyrábí dodnes; [koupit lze třeba zde.](https://www.lh-shop.cz/index.php?page=shop.product_details&product…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_


---

## Neověřené (5xx / timeout / blokace, 34)

Tyto URL nešly automaticky ověřit:

- **status 0** — network error / timeout / blokace bota
- **5xx** — server-side problém (přetížení, anti-bot challenge, vyžaduje session/JS)

Často jsou **živé** — ověřit ručně v prohlížeči, NEoznačovat automaticky markerem.

- http://saluspopulae.co.uk/synclock/content/IMG\_0083\_large.html _(fetch failed)_
- http://www.ens-lyon.fr/RELIE/Cadrans/ _(fetch failed)_
- http://www.ikaros.cz/node/5382 _(fetch failed)_
- http://www.lothar-frerking.de/ _(fetch failed)_
- http://www.marcdatabase.com/~lemur/dm-gitton.html _(timeout)_
- http://www.mjakub.cz/?idc=1308 _(fetch failed)_
- http://www.reserv-a-rt.de _(fetch failed)_
- http://www.sbirkajara.cz/ _(fetch failed)_
- http://www.technicalmuseum.cz/ _(fetch failed)_
- http://www.trebino.it/Objects/Pagina.asp?ID=5&T=Museo%20orologi _(fetch failed)_
- https://christies.com/en/lot/lot-4973414 _(timeout)_
- https://dml.cz/bitstream/handle/10338.dmlcz/138777/PokrokyMFA_25-1980-3_4.pdf _(HTTP 503)_
- https://microsemi.com/product-directory/embedded-clocks-frequency-references/5570-miniature-atomic-clock-mac-sa5x _(timeout)_
- https://perso.orange.fr/cadrans.solaires/cadrans/Cadran-clepsydre.html _(fetch failed)_
- https://static.bodet-time.com/images/stories/Pdfs/EN/Manuals/Distribution/606547D%20NTP%20AFNOR%20interface%20instructions.pdf _(fetch failed)_
- https://web.archive.org/web/20130618212643/http://uv201.com:80/Clock_Pages/mystery_clocks.htm _(fetch failed)_
- https://web.archive.org/web/20151009214629/http://www.novinky.cz/cestovani/tipy-na-vylety/380344-decinska-expozice-ukaze-jak-nasi-predkove-merili-cas.html _(fetch failed)_
- https://web.archive.org/web/20151221142525/http://www.novinky.cz:80/cestovani/tipy-na-vylety/385676-decinsky-zamek-vystavuje-mechanicke-hodiny-nechybi-ani-bizarni-kousky.html _(fetch failed)_
- https://web.archive.org/web/20180927230843/http://www.mojeurlopy.pl/gdansk/atrakcje-turystyczne/1906 _(fetch failed)_
- https://web.archive.org/web/20231209024504/http://www.koprivahodinar.cz/ _(fetch failed)_
- https://web.archive.org/web/20250323212554/https://digilander.libero.it/orologi.solari/ _(fetch failed)_
- https://web.archive.org/web/20250612154618/https://www.astroama.com/ _(fetch failed)_
- https://web.archive.org/web/20260207035738/https://indico.fjfi.cvut.cz/event/127/contributions/2868/ _(fetch failed)_
- https://web.archive.org/web/20260207035738/https://indico.fjfi.cvut.cz/event/127/contributions/2868/attachments/966/1332/Astronomicke_funkce_a_umeleckohistoricka_analyza_planetaria_P._Engelberta_Seige_1792_ve_sbirkach_Narodniho_technickeho_muzea_v_Praze.pdf _(fetch failed)_
- https://www.cdsh.cz/ _(fetch failed)_
- https://www.fachkreis-turmuhren.de/ _(fetch failed)_
- https://www.hautehorlogerie.org/zh/watches-and-culture/watchmaking-knowledge/encyclopedia/roman-numeral-iiii-on-dials _(timeout)_
- https://www.hodinarstvi-marek.cz/ _(fetch failed)_
- https://www.hodinarstvi-marek.cz/cs/27-hodinove-stroje-jana-janaty-z-podebrad _(fetch failed)_
- https://www.hojsova-straz.cz _(fetch failed)_
- https://www.litomysl.cz/atraktivity/litomyslsky_orloj _(fetch failed)_
- https://www.museodellorologeria.com/ _(fetch failed)_
- https://www.orloje.eu/sekce/prostejovsky-orloj/ _(fetch failed)_
- https://www.veznihodiny.cz/ _(fetch failed)_