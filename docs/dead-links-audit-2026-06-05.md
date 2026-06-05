# Dead-link audit — 2026-06-05

Vygenerováno skriptem `scripts/audit-dead-links.mjs` 2026-06-05T10:13:11Z.

## Souhrn

- **Skenované adresáře:** 7 (content/hodinarium-eu, content/hodinari, content/kroky, content/slovnik, content/soupis-veznich-hodin, content/kronika, content/horologie-cz)
- **Unikátních URL:** 723
- **Funkční (2xx/3xx):** 699
- **Mrtvé / nedostupné:** 9
- **Z toho s Wayback Machine snapshotem:** 0

## Pro editora

Pro každý mrtvý odkaz níže vyberte:

- **REPLACE → Wayback** — nahradit URL za Wayback Machine snapshot (pokud existuje a obsah je zachován)
- **REPLACE → ekvivalent** — najít aktuální zdroj se stejným obsahem (např. archived → původní web v nové struktuře)
- **REMOVE** — odstranit odkaz (jeho obsah už není relevantní)

---

## Mrtvé odkazy (9 unikátních URL ve 9 souborech)

### `content/hodinari/robert-drozda.mdx`

- **HTTP 400** — https://www.marianskatynice.cz/e_download.php?file=data/editor/124cs_4.pdf
  - Pole: `fm:references[7]:url`
  - Kontext: …https://www.marianskatynice.cz/e_download.php?file=data/editor/124cs_4.pdf…
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/laplace.md`

- **HTTP 502** — https://www.entsoe.eu/news/2018/03/06/press-release-continuing-frequency-deviation-in-the-continental-european-power-system-originating-in-serbia-kosovo-political-solution-urgently-needed-in-addition-to-technical/
  - Pole: `body:link`
  - Kontext: …iDNES.cz. [cit. 2026-04-28] - [Continuing frequency deviation in the Continental European Power System originating in Se…
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/litinove-vezni-hodiny.md`

- **HTTP 404** — https://radioeng.cz/poster.htm
  - Pole: `fm:originalUrl`
  - Kontext: …https://radioeng.cz/poster.htm…
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/muzeum-kadan-orloj.md`

- **HTTP 404** — https://www.mesto-kadan.cz/orloj/d-1006
  - Pole: `fm:references[0]:url`
  - Kontext: …https://www.mesto-kadan.cz/orloj/d-1006…
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/muzeum-pillichsdorf.md`

- **HTTP 404** — https://www.weinviertel.at/a-pfarrkirche-st-vitus-pillichsdorf
  - Pole: `fm:references[0]:url`
  - Kontext: …https://www.weinviertel.at/a-pfarrkirche-st-vitus-pillichsdorf…
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/zidovske.mdx`

- **HTTP 404** — https://www.mapy.cz/s/kcyO
  - Pole: `body:link`
  - Kontext: …vské hodiny najdete přibližně [zde](https://www.mapy.cz/s/kcyO). Obrázek ukazuje Staronovou …
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/soupis-veznich-hodin/1876-police-nad-metuji-radnice-janata.mdx`

- **HTTP 400** — https://www.policenm.cz/e_download.php?file=data/editor/88cs_173.pdf
  - Pole: `fm:prameny[1]:citace:embedded`
  - Kontext: …Polická muzejní revue (PM18-01), Městské muzeum a galerie Police nad Metují. Onl…
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 400** — https://www.policenm.cz/e_download.php?file=data/editor/88cs_173.pdf
  - Pole: `fm:prameny[1]:url`
  - Kontext: …https://www.policenm.cz/e_download.php?file=data/editor/88cs_173.pdf…
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/soupis-veznich-hodin/1898-paichl-krecmer.mdx`

- **HTTP 404** — http://paichl.cz/knihy/hodiny/hodiny_vezni/Krecmer_Vaclav_Praha/Krecmer_11.jpg
  - Pole: `fm:prameny[0]:note:embedded`
  - Kontext: …Původní URL http://paichl.cz/knihy/hodiny/hodiny_vezni/Krecmer_Vaclav_Praha/Krec…
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/soupis-veznich-hodin/nedatovano-nezname-krecmer.mdx`

- **HTTP 404** — http://paichl.cz/knihy/hodiny/hodiny_vezni/Krecmer_Vaclav_Praha/Beroun/Krecmer_Vaclav_Vinohrady_vezni_hodiny_0001.JPG
  - Pole: `fm:prameny[0]:note:embedded`
  - Kontext: …Původní URL http://paichl.cz/knihy/hodiny/hodiny_vezni/Krecmer_Vaclav_Praha/Bero…
  - Rozhodnutí: _REPLACE / REMOVE — doplň_


---

## Neověřené (status 0 — síť/timeout/blokace, 15)

Tyto URL neodpověděly (network error / timeout / blokace bota). Často jsou
**živé** — ověřit ručně v prohlížeči, NEoznačovat automaticky markerem.

- http://saluspopulae.co.uk/synclock/content/IMG\_0083\_large.html _(fetch failed)_
- http://web.archive.org/web/20160327202644/https://dominanty.cz/pamatky-velka-chmelistna.php _(fetch failed)_
- http://web.archive.org/web/20170924202604/http://spsh.cz/ _(fetch failed)_
- http://web.archive.org/web/20260317054855/https://www.jindrisskavez.cz/index.php/cs/ _(fetch failed)_
- https://christies.com/en/lot/lot-4973414 _(timeout)_
- https://klementinum.com/ _(fetch failed)_
- https://microsemi.com/product-directory/embedded-clocks-frequency-references/5570-miniature-atomic-clock-mac-sa5x _(timeout)_
- https://www.cdsh.cz/ _(fetch failed)_
- https://www.fachkreis-turmuhren.de/ _(fetch failed)_
- https://www.hodinarstvi-marek.cz/ _(fetch failed)_
- https://www.hodinarstvi-marek.cz/cs/27-hodinove-stroje-jana-janaty-z-podebrad _(fetch failed)_
- https://www.jiskra-benesov.cz/clanek/proc-lenka-filipova-nabidla-pomoc-nezvonicim-zvonum-a-vezni-hodiny-zase-obijeji-cas-7976 _(timeout)_
- https://www.museodellorologeria.com/ _(fetch failed)_
- https://www.orloje.eu/sekce/prostejovsky-orloj/ _(fetch failed)_
- https://www.veznihodiny.cz/ _(fetch failed)_