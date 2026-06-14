# Dead-link audit — 2026-06-14

Vygenerováno skriptem `scripts/audit-dead-links.mjs` 2026-06-14T08:11:14Z.

## Souhrn

- **Skenované adresáře:** 7 (content/hodinarium-eu, content/hodinari, content/kroky, content/slovnik, content/soupis-veznich-hodin, content/kronika, content/horologie-cz)
- **Unikátních URL:** 736
- **Funkční (2xx/3xx):** 694
- **Mrtvé / nedostupné (HTTP 4xx):** 10
- **Neověřené (5xx / timeout / blokace):** 32
- **Z toho s Wayback Machine snapshotem:** 5

## Pro editora

Pro každý mrtvý odkaz níže vyberte:

- **REPLACE → Wayback** — nahradit URL za Wayback Machine snapshot (pokud existuje a obsah je zachován)
- **REPLACE → ekvivalent** — najít aktuální zdroj se stejným obsahem (např. archived → původní web v nové struktuře)
- **REMOVE** — odstranit odkaz (jeho obsah už není relevantní)

---

## Mrtvé odkazy (10 unikátních URL ve 9 souborech)

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

### `content/hodinarium-eu/pneumatika.md`

- **HTTP 404** — https://junghansarchiv.de/uploads/1928_01_full_de1508c12e.pdf
  - Pole: `body:link`
  - Kontext: …odružné hodiny ### Odkazy - [Katalog Junghans](https://junghansarchiv.de/uploads/1928_01_full_de1508c12e.pdf) - [Histori…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/slunecni-polarizacni.md`

- **HTTP 415** — http://www.polarization.com/viking/viking.html
  - Pole: `body:link`
  - Kontext: …yž Vikingové o tom možná něco [tušili](http://www.polarization.com/viking/viking.html).) ## Konstrukce slunečních …
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/slunecni.mdx`

- **HTTP 410** — http://digilander.libero.it/orologi.solari/
  - Pole: `fm:references[4]:url`
  - Kontext: …http://digilander.libero.it/orologi.solari/…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/spinka.md`

- **HTTP 415** — http://www.lisaboyer.com/Claytonsite/Claytonsite1.htm
  - Pole: `body:link`
  - Kontext: … na dalších odkazech..** - **[Clayton Boyer Clock Designs](http://www.lisaboyer.com/Claytonsite/Claytonsite1.htm)** - **…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20260508152104/https://www.lisaboyer.com/Claytonsite/Claytonsite1.htm (20260508152104)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/vez-elektrocas1959.md`

- **HTTP 415** — http://www.my-time-machines.net/index.htm
  - Pole: `body:link`
  - Kontext: …ránky úžasných věžních strojů [**www.my-time-machines.net**](http://www.my-time-machines.net/index.htm), kde jsou k vidě…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20260214191441/http://www.my-time-machines.net/index.htm (20260214191441)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/vezni-muzejicko-evropa.md`

- **HTTP 415** — http://www.my-time-machines.net/
  - Pole: `body:link`
  - Kontext: …ého restaurátora Marka Franka [www.my-time-machines.net](http://www.my-time-machines.net/) Je jen škoda, že internetové…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20260307033936/https://www.my-time-machines.net/ (20260307033936)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 403** — http://www.mojeurlopy.pl/gdansk/atrakcje-turystyczne/1906
  - Pole: `body:link`
  - Kontext: …prezentaci. Nalezené odkazy: [www.mojeurlopy.pl/gdansk/atrakcje-turystyczne/1906](http://www.mojeurlopy.pl/gdansk/atrakc…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20180927230843/http://www.mojeurlopy.pl:80/gdansk/atrakcje-turystyczne/1906 (20180927230843)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/kronika/vezni-muzejicko.md`

- **HTTP 415** — http://www.trebino.it/Objects/Pagina.asp?ID=5&T=Museo%20orologi
  - Pole: `body:link`
  - Kontext: …kenem.de. [cit. 2026-04-28] - [Museo dell'orologio da torre | Uscio, Genova](http://www.trebino.it/Objects/Pagina.asp?ID…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20250112041817/http://www.trebino.it/Objects/Pagina.asp?ID=5&T=Museo%20orologi (20250112041817)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_


---

## Neověřené (5xx / timeout / blokace, 32)

Tyto URL nešly automaticky ověřit:

- **status 0** — network error / timeout / blokace bota
- **5xx** — server-side problém (přetížení, anti-bot challenge, vyžaduje session/JS)

Často jsou **živé** — ověřit ručně v prohlížeči, NEoznačovat automaticky markerem.

- http://is.muni.cz/th/143076/fi_m/thesis.pdf _(timeout)_
- http://osel.cz/index.php?clanek=1458 _(fetch failed)_
- http://saluspopulae.co.uk/synclock/content/IMG\_0083\_large.html _(fetch failed)_
- http://www.aldebaran.cz/bulletin/2004_43_nah.html _(fetch failed)_
- http://www.clockguy.com/SiteRelated/SiteReferencePages/LenzkirchHistory.html _(timeout)_
- http://www.ens-lyon.fr/RELIE/Cadrans/ _(fetch failed)_
- http://www.expozicecasu.cz/ _(fetch failed)_
- http://www.marcdatabase.com/~lemur/dm-gitton.html _(timeout)_
- https://christies.com/en/lot/lot-4973414 _(timeout)_
- https://interval.cz/clanky/elektronicke-casove-razitko-doplnek-elektronickeho-podpisu/ _(fetch failed)_
- https://klementinum.com/ _(fetch failed)_
- https://microsemi.com/product-directory/embedded-clocks-frequency-references/5570-miniature-atomic-clock-mac-sa5x _(timeout)_
- https://perso.orange.fr/cadrans.solaires/cadrans/Cadran-clepsydre.html _(fetch failed)_
- https://saaz.info/index.php/die-stadt/regionalmuseum-fur-geschichte/ _(fetch failed)_
- https://srebrnykruk.pl/do-pobrania/05-Zegarmistrzostwo-Wawrzyniec-Podwapin%CC%81ski.pdf _(fetch failed)_
- https://theses.cz/id/i6oavl _(fetch failed)_
- https://web.archive.org/web/20130618212643/http://uv201.com:80/Clock_Pages/mystery_clocks.htm _(fetch failed)_
- https://web.archive.org/web/20260207035738/https://indico.fjfi.cvut.cz/event/127/contributions/2868/attachments/966/1332/Astronomicke_funkce_a_umeleckohistoricka_analyza_planetaria_P._Engelberta_Seige_1792_ve_sbirkach_Narodniho_technickeho_muzea_v_Praze.pdf _(fetch failed)_
- https://www.cdsh.cz/ _(fetch failed)_
- https://www.fachkreis-turmuhren.de/ _(fetch failed)_
- https://www.hodinarstvi-marek.cz/ _(fetch failed)_
- https://www.hodinarstvi-marek.cz/cs/27-hodinove-stroje-jana-janaty-z-podebrad _(fetch failed)_
- https://www.hojsova-straz.cz _(fetch failed)_
- https://www.jiskra-benesov.cz/clanek/proc-lenka-filipova-nabidla-pomoc-nezvonicim-zvonum-a-vezni-hodiny-zase-obijeji-cas-7976 _(timeout)_
- https://www.museodellorologeria.com/ _(fetch failed)_
- https://www.orloje.eu/sekce/prostejovsky-orloj/ _(fetch failed)_
- https://www.ptb.de/cms/en/ptb/fachabteilungen/abt4/fb-44/ag-442/dissemination-of-legal-time/dcf77.html _(fetch failed)_
- https://www.samotisky.cz/assets/File.ashx?id_org=14603&id_dokumenty=1005 _(fetch failed)_
- https://www.taborcz.eu/obnova-stare-radnice-prispeje-k-oslavam-zalozeni-mesta/d-66966 _(fetch failed)_
- https://www.unicov.cz/assets/File.ashx?id_org=17450&id_dokumenty=1645 _(fetch failed)_
- https://www.usti.cz/images/turistum/tiskoviny/2007_Usti-nad-Labem-historie-a-pamatky.pdf _(fetch failed)_
- https://www.veznihodiny.cz/ _(fetch failed)_