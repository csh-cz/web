# Dead-link audit — 2026-06-28

Vygenerováno skriptem `scripts/audit-dead-links.mjs` 2026-06-28T07:46:07Z.

## Souhrn

- **Skenované adresáře:** 7 (content/hodinarium-eu, content/hodinari, content/kroky, content/slovnik, content/soupis-veznich-hodin, content/kronika, content/horologie-cz)
- **Unikátních URL:** 736
- **Funkční (2xx/3xx):** 700
- **Mrtvé / nedostupné (HTTP 4xx):** 5
- **Neověřené (5xx / timeout / blokace):** 31
- **Z toho s Wayback Machine snapshotem:** 1

## Pro editora

Pro každý mrtvý odkaz níže vyberte:

- **REPLACE → Wayback** — nahradit URL za Wayback Machine snapshot (pokud existuje a obsah je zachován)
- **REPLACE → ekvivalent** — najít aktuální zdroj se stejným obsahem (např. archived → původní web v nové struktuře)
- **REMOVE** — odstranit odkaz (jeho obsah už není relevantní)

---

## Mrtvé odkazy (5 unikátních URL ve 5 souborech)

### `content/hodinarium-eu/cas-internet2.md`

- **HTTP 403** — http://cs.thetimenow.com/clock/czech_republic/sob%c4%9bslav?t=n&amp;embed=1&amp;text=12&amp;textdate=15&amp;format=24&amp;digitalclock=30&amp;analogclock=60&amp;letter_spacing=-2&amp;bordersize=1&amp;bordercolor=BCE2F7&amp;bgcolor=EBF8FF&amp;colorloc=000000&amp;colordigital=2C8EBF&amp;colordate=000000&amp;styleloc=normal&amp;styledigital=normal&amp;styledate=normal&amp;right=0
  - Pole: `body:bare`
  - Kontext: …rchive.org/web/20150920012926/http://cs.thetimenow.com/clock/czech_republic/sob%c4%9bslav?t=n&amp;embed=1&amp;text=12&am…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/lenzkirch.md`

- **HTTP 404** — http://www.clockguy.com/SiteRelated/SiteReferencePages/LenzkirchHistory.html
  - Pole: `body:link`
  - Kontext: …Zpracováno původně dle tránek [Na Lenzkirch Story](http://www.clockguy.com/SiteRelated/SiteReferencePages/LenzkirchHisto…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — http://www.clockguy.com/SiteRelated/SiteReferencePages/LenzkirchHistory.html
  - Pole: `body:link`
  - Kontext: …noha dalšími informacemi. - **[Na Lenzkirch Story](http://www.clockguy.com/SiteRelated/SiteReferencePages/LenzkirchHisto…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/nocturnal.md`

- **HTTP 403** — https://www.lh-shop.cz/index.php?page=shop.product_details&product_id=3519&category_id=134&flypage=trh_flypage.tpl&option=com_virtuemart&Itemid=5&lang=cs
  - Pole: `body:link`
  - Kontext: …a se nocturnal vyrábí dodnes; [koupit lze třeba zde.](https://www.lh-shop.cz/index.php?page=shop.product_details&product…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/slunecni.mdx`

- **HTTP 410** — http://digilander.libero.it/orologi.solari/
  - Pole: `fm:references[4]:url`
  - Kontext: …http://digilander.libero.it/orologi.solari/…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20250323212554/https://digilander.libero.it/orologi.solari/ (20250323212554)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/vezni-muzejicko-evropa.md`

- **HTTP 403** — http://www.mojeurlopy.pl/gdansk/atrakcje-turystyczne/1906
  - Pole: `body:link`
  - Kontext: …prezentaci. Nalezené odkazy: [www.mojeurlopy.pl/gdansk/atrakcje-turystyczne/1906](http://www.mojeurlopy.pl/gdansk/atrakc…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_


---

## Neověřené (5xx / timeout / blokace, 31)

Tyto URL nešly automaticky ověřit:

- **status 0** — network error / timeout / blokace bota
- **5xx** — server-side problém (přetížení, anti-bot challenge, vyžaduje session/JS)

Často jsou **živé** — ověřit ručně v prohlížeči, NEoznačovat automaticky markerem.

- http://saluspopulae.co.uk/synclock/content/IMG\_0083\_large.html _(fetch failed)_
- http://www.ens-lyon.fr/RELIE/Cadrans/ _(fetch failed)_
- http://www.expozicecasu.cz/ _(fetch failed)_
- http://www.marcdatabase.com/~lemur/dm-gitton.html _(timeout)_
- http://www.mjakub.cz/?idc=1308 _(fetch failed)_
- http://www.muzeum-nmnm.cz/index.php/cz/expozice/hodinarska-expozice _(fetch failed)_
- http://www.reserv-a-rt.de _(fetch failed)_
- http://www.sbirkajara.cz/ _(fetch failed)_
- http://www.technicalmuseum.cz/ _(fetch failed)_
- http://www.trebino.it/Objects/Pagina.asp?ID=5&T=Museo%20orologi _(fetch failed)_
- https://christies.com/en/lot/lot-4973414 _(timeout)_
- https://klementinum.com/ _(fetch failed)_
- https://microsemi.com/product-directory/embedded-clocks-frequency-references/5570-miniature-atomic-clock-mac-sa5x _(timeout)_
- https://perso.orange.fr/cadrans.solaires/cadrans/Cadran-clepsydre.html _(fetch failed)_
- https://srebrnykruk.pl/do-pobrania/05-Zegarmistrzostwo-Wawrzyniec-Podwapin%CC%81ski.pdf _(fetch failed)_
- https://web.archive.org/web/20130618212643/http://uv201.com:80/Clock_Pages/mystery_clocks.htm _(fetch failed)_
- https://web.archive.org/web/20231003224950/http://www.nixieclocks.de/english/gallery/index.php _(fetch failed)_
- https://web.archive.org/web/20231209024504/http://www.koprivahodinar.cz/ _(fetch failed)_
- https://web.archive.org/web/20250402055629/https://www.academia.edu/35888544/Orologi_pubblici_pneumatici_a_Parigi _(fetch failed)_
- https://web.archive.org/web/20250612154618/https://www.astroama.com/ _(fetch failed)_
- https://www.cdsh.cz/ _(fetch failed)_
- https://www.fachkreis-turmuhren.de/ _(fetch failed)_
- https://www.hodinarstvi-marek.cz/ _(fetch failed)_
- https://www.hodinarstvi-marek.cz/cs/27-hodinove-stroje-jana-janaty-z-podebrad _(fetch failed)_
- https://www.hojsova-straz.cz _(fetch failed)_
- https://www.jiskra-benesov.cz/clanek/proc-lenka-filipova-nabidla-pomoc-nezvonicim-zvonum-a-vezni-hodiny-zase-obijeji-cas-7976 _(timeout)_
- https://www.kmp.cz/ _(fetch failed)_
- https://www.litomysl.cz/atraktivity/litomyslsky_orloj _(fetch failed)_
- https://www.museodellorologeria.com/ _(fetch failed)_
- https://www.orloje.eu/sekce/prostejovsky-orloj/ _(fetch failed)_
- https://www.veznihodiny.cz/ _(fetch failed)_