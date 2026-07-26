# Dead-link audit — 2026-07-26

Vygenerováno skriptem `scripts/audit-dead-links.mjs` 2026-07-26T06:31:32Z.

## Souhrn

- **Skenované adresáře:** 7 (content/hodinarium-eu, content/hodinari, content/kroky, content/slovnik, content/soupis-veznich-hodin, content/kronika, content/horologie-cz)
- **Unikátních URL:** 737
- **Funkční (2xx/3xx):** 703
- **Mrtvé / nedostupné (HTTP 4xx):** 5
- **Neověřené (5xx / timeout / blokace):** 29
- **Z toho s Wayback Machine snapshotem:** 3

## Pro editora

Pro každý mrtvý odkaz níže vyberte:

- **REPLACE → Wayback** — nahradit URL za Wayback Machine snapshot (pokud existuje a obsah je zachován)
- **REPLACE → ekvivalent** — najít aktuální zdroj se stejným obsahem (např. archived → původní web v nové struktuře)
- **REMOVE** — odstranit odkaz (jeho obsah už není relevantní)

---

## Mrtvé odkazy (5 unikátních URL ve 4 souborech)

### `content/hodinarium-eu/arduino.mdx`

- **HTTP 403** — https://dratek.cz/arduino/877-arduino-h-mustek-pro-krokovy-motor-l298n-dual-h-most-dc.html
  - Pole: `body:link`
  - Kontext: … Root.cz. [cit. 2026-04-28] - [H můstek ... eshop](https://dratek.cz/arduino/877-arduino-h-mustek-pro-krokovy-motor-l298…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20250812201028/https://dratek.cz/arduino/877-arduino-h-mustek-pro-krokovy-motor-l298n-dual-h-most-dc.html (20250812201028)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

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


---

## Neověřené (5xx / timeout / blokace, 29)

Tyto URL nešly automaticky ověřit:

- **status 0** — network error / timeout / blokace bota
- **5xx** — server-side problém (přetížení, anti-bot challenge, vyžaduje session/JS)

Často jsou **živé** — ověřit ručně v prohlížeči, NEoznačovat automaticky markerem.

- http://osel.cz/index.php?clanek=1458 _(fetch failed)_
- http://saluspopulae.co.uk/synclock/content/IMG\_0083\_large.html _(fetch failed)_
- http://www.expozicecasu.cz/ _(fetch failed)_
- http://www.hibrno.cz/ _(fetch failed)_
- http://www.husitskemuzeum.cz/zizkovo-namesti-v-promenach-casu-i/ _(fetch failed)_
- http://www.marcdatabase.com/~lemur/dm-gitton.html _(timeout)_
- http://www.mjakub.cz/?idc=1308 _(fetch failed)_
- http://www.sbirkajara.cz/ _(fetch failed)_
- http://www.technicalmuseum.cz/ _(fetch failed)_
- http://www.trebino.it/Objects/Pagina.asp?ID=5&T=Museo%20orologi _(fetch failed)_
- https://christies.com/en/lot/lot-4973414 _(timeout)_
- https://interval.cz/clanky/elektronicke-casove-razitko-doplnek-elektronickeho-podpisu/ _(fetch failed)_
- https://microsemi.com/product-directory/embedded-clocks-frequency-references/5570-miniature-atomic-clock-mac-sa5x _(timeout)_
- https://perso.orange.fr/cadrans.solaires/cadrans/Cadran-clepsydre.html _(fetch failed)_
- https://static.bodet-time.com/images/stories/Pdfs/EN/Manuals/Distribution/606547D%20NTP%20AFNOR%20interface%20instructions.pdf _(fetch failed)_
- https://web.archive.org/web/20130618212643/http://uv201.com:80/Clock_Pages/mystery_clocks.htm _(fetch failed)_
- https://web.archive.org/web/20231003224950/http://www.nixieclocks.de/english/gallery/index.php _(fetch failed)_
- https://web.archive.org/web/20250323212554/https://digilander.libero.it/orologi.solari/ _(fetch failed)_
- https://web.archive.org/web/20250402055629/https://www.academia.edu/35888544/Orologi_pubblici_pneumatici_a_Parigi _(fetch failed)_
- https://www.cdsh.cz/ _(fetch failed)_
- https://www.fachkreis-turmuhren.de/ _(fetch failed)_
- https://www.hodinarstvi-marek.cz/ _(fetch failed)_
- https://www.hodinarstvi-marek.cz/cs/27-hodinove-stroje-jana-janaty-z-podebrad _(fetch failed)_
- https://www.hojsova-straz.cz _(fetch failed)_
- https://www.litomysl.cz/atraktivity/litomyslsky_orloj _(fetch failed)_
- https://www.museodellorologeria.com/ _(fetch failed)_
- https://www.orloje.eu/sekce/prostejovsky-orloj/ _(fetch failed)_
- https://www.osel.cz/3225-presnost-atomovych-hodin-gps-a-teorie-relativity.html _(fetch failed)_
- https://www.veznihodiny.cz/ _(fetch failed)_