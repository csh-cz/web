# Dead-link audit — 2026-05-20

Vygenerováno skriptem `scripts/audit-dead-links.mjs` 2026-05-20T12:43:31Z.

## Souhrn

- **Skenované adresáře:** 7 (content/hodinarium-eu, content/hodinari, content/kroky, content/slovnik, content/soupis-veznich-hodin, content/kronika, content/horologie-cz)
- **Unikátních URL:** 897
- **Funkční (2xx/3xx):** 809
- **Mrtvé / nedostupné:** 88
- **Z toho s Wayback Machine snapshotem:** 15

## Pro editora

Pro každý mrtvý odkaz níže vyberte:

- **REPLACE → Wayback** — nahradit URL za Wayback Machine snapshot (pokud existuje a obsah je zachován)
- **REPLACE → ekvivalent** — najít aktuální zdroj se stejným obsahem (např. archived → původní web v nové struktuře)
- **REMOVE** — odstranit odkaz (jeho obsah už není relevantní)

---

## Mrtvé odkazy (88 unikátních URL ve 46 souborech)

### `content/hodinari/edmund-kinsner.mdx`

- **HTTP 403** — http://spsh.cz/
  - Pole: `body:bare`
  - Kontext: …rchive.org/web/20170924202604/http://spsh.cz/) (Zpravodaj SPSH 33).* …
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20170924202604/http://spsh.cz/ (20170924202604)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinari/engelbert-seige.mdx`

- **HTTP 404** — https://indico.fjfi.cvut.cz/event/127/contributions/2868attachments/966/1332/Astronomicke_funkce_a_umeleckohistoricka_analyza_planetaria_P._Engelberta_Seige_1792_ve_sbirkach_Narodniho_technickeho_muzea_v_Praze.pdf
  - Pole: `fm:references[0]:url`
  - Kontext: …https://indico.fjfi.cvut.cz/event/127/contributions/2868attachments/966/1332/Ast…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 400** — https://indico.fjfi.cvut.cz/event/127/contributions/2868
  - Pole: `body:link`
  - Kontext: …a **kovový model** (popsané v [diplomové práci L. Hrůšové, 2020](https://indico.fjfi.cvut.cz/event/127/contributions/286…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://cs.wikipedia.org/wiki/Jan_Klein_(hodin%C3%A1%C5%99
  - Pole: `body:link`
  - Kontext: …vskými soudobými stroji: - **[Jan Klein](https://cs.wikipedia.org/wiki/Jan_Klein_(hodin%C3%A1%C5%99))** (1684–1762, Prah…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinari/friedrich-moritz-bassler.mdx`

- **network error: fetch failed** — https://www.fachkreis-turmuhren.de/
  - Pole: `fm:references[0]:url`
  - Kontext: …https://www.fachkreis-turmuhren.de/…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinari/jan-mares.mdx`

- **network error: fetch failed** — https://www.hodinarstvi-marek.cz/cs/27-hodinove-stroje-jana-janaty-z-podebrad
  - Pole: `fm:references[1]:url`
  - Kontext: …https://www.hodinarstvi-marek.cz/cs/27-hodinove-stroje-jana-janaty-z-podebrad…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 403** — https://www.researchgate.net/
  - Pole: `body:link`
  - Kontext: …res)** — evangelický kostel | [Skála 2005](https://www.researchgate.net/) | | 1896 | **[Kostomlátky](/…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20260520095744/https://www.researchgate.net/ (20260520095744)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 403** — https://www.researchgate.net/
  - Pole: `body:link`
  - Kontext: …any)** — evangelický kostel | [Skála 2005](https://www.researchgate.net/) | | nedat. | **[Veleliby](/s…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20260520095744/https://www.researchgate.net/ (20260520095744)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinari/junghans.mdx`

- **HTTP 404** — https://cs.wikipedia.org/wiki/Junghans
  - Pole: `fm:references[0]:url`
  - Kontext: …https://cs.wikipedia.org/wiki/Junghans…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinari/mannhardt.mdx`

- **HTTP 404** — https://de.wikipedia.org/wiki/Matth%C3%A4uskirche_(M%C3%BCnchen
  - Pole: `body:link`
  - Kontext: …33** dodal věžní hodiny pro **[evangelický kostel sv. Matěje](https://de.wikipedia.org/wiki/Matth%C3%A4uskirche_(M%C3%BC…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://de.wikipedia.org/wiki/Philipp_H%C3%B6rz
  - Pole: `body:link`
  - Kontext: …skou továrnou na věžní hodiny [Philipp Hörz](https://de.wikipedia.org/wiki/Philipp_H%C3%B6rz)**, čímž skončila 84letá sa…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinari/milos-flossmann.mdx`

- **HTTP 404** — https://cs.wikipedia.org/wiki/Ostrov_(okres_Karlovy_Vary
  - Pole: `body:link`
  - Kontext: …átor věžních hodin působící v [Ostrově](https://cs.wikipedia.org/wiki/Ostrov_(okres_Karlovy_Vary)) (okres Karlovy Vary, …
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinari/robert-drozda.mdx`

- **HTTP 400** — https://www.marianskatynice.cz/e_download.php?file=data/editor/124cs_4.pdf
  - Pole: `fm:references[7]:url`
  - Kontext: …https://www.marianskatynice.cz/e_download.php?file=data/editor/124cs_4.pdf…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinari/solari-udine.mdx`

- **network error: fetch failed** — https://www.museodellorologeria.com/
  - Pole: `fm:references[0]:url`
  - Kontext: …https://www.museodellorologeria.com/…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/akvizice-2015-2025.md`

- **HTTP 403** — https://dominanty.cz/pamatky-velka-chmelistna.php
  - Pole: `body:bare`
  - Kontext: …rchive.org/web/20160327202644/https://dominanty.cz/pamatky-velka-chmelistna.php). ![kostel sv. Bartoloměje V…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/atomove-kapesni.md`

- **network error: timeout** — https://microsemi.com/product-directory/embedded-clocks-frequency-references/5570-miniature-atomic-clock-mac-sa5x
  - Pole: `body:link`
  - Kontext: …turního čipu atomových hodin: [MAC-SA5X](https://microsemi.com/product-directory/embedded-clocks-frequency-references/55…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20240127044531/https://www.microsemi.com/product-directory/embedded-clocks-frequency-references/5570-miniature-atomic-clock-mac-sa5x (20240127044531)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **network error: timeout** — https://microsemi.com/images/gallery/new_products/EvalKit%20Cartoon.png
  - Pole: `body:link`
  - Kontext: …kačních pinů rs232 nebo USB. [Obrázek vývojového kitu](https://microsemi.com/images/gallery/new_products/EvalKit%20Carto…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20210910023747/https://www.microsemi.com/images/gallery/new_products/EvalKit%20Cartoon.png (20210910023747)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/brillie.md`

- **network error: fetch failed** — https://regulateurbrillie.monsite-orange.fr/
  - Pole: `body:bare`
  - Kontext: …rchive.org/web/20230929035107/https://regulateurbrillie.monsite-orange.fr/) - [Stránky Electrisal Horolo…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20230929035107/https://regulateurbrillie.monsite-orange.fr/ (20230929035107)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — http://www.antiquity.in/brillie-1.html
  - Pole: `body:bare`
  - Kontext: …rchive.org/web/20191122123049/http://www.antiquity.in/brillie-1.html) - [O synchronizaci hodin Bri…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20191122123049/http://www.antiquity.in/brillie-1.html (20191122123049)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/casova-pasma.md`

- **HTTP 404** — http://www.hodiny-spel.cz/atypicka_vyroba.php
  - Pole: `body:link`
  - Kontext: …[![Hodiny „SVĚTOVÝ ČAS”, analogové v kombinaci s datumem, broušený a leštěný nerez](/img/elektrika/svetovy_cas1.jpg)](ht…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20120201013404/http://www.hodiny-spel.cz/atypicka_vyroba.php (20120201013404)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — http://www.thisisit.ca:80/worldclock2001/
  - Pole: `body:bare`
  - Kontext: …rchive.org/web/20100514052728/http://www.thisisit.ca:80/worldclock2001/)si je můžete prohlédnout i v …
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20100514052728/http://www.thisisit.ca:80/worldclock2001/ (20100514052728)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/decimalky.md`

- **HTTP 404** — http://www.swatch.com:80/xx_en/internettime.html
  - Pole: `body:bare`
  - Kontext: …rchive.org/web/20130524065953/http://www.swatch.com:80/xx_en/internettime.html) také používá decimální dělen…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20130524065953/http://www.swatch.com:80/xx_en/internettime.html (20130524065953)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/download.md`

- **network error: fetch failed** — http://www.giovannisoft.cz/
  - Pole: `body:bare`
  - Kontext: …rchive.org/web/20170627153127/http://www.giovannisoft.cz/) [Stáhnout](download/pckukac…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20170627153127/http://www.giovannisoft.cz/ (20170627153127)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/edgecombe.md`

- **network error: fetch failed** — http://saluspopulae.co.uk/synclock/content/IMG\_0083\_large.html
  - Pole: `body:bare`
  - Kontext: …ress.com. [cit. 2026-04-28] - http://saluspopulae.co.uk/synclock/content/IMG\_0083\_large.html - [Warren Type A Synchron…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/litinove-vezni-hodiny.md`

- **HTTP 404** — https://radioeng.cz/poster.htm
  - Pole: `fm:originalUrl`
  - Kontext: …https://radioeng.cz/poster.htm…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/muzeum-beyer-zurich.md`

- **HTTP 404** — https://www.beyer-ch.com/de/uhrenmuseum-beyer-zurich/
  - Pole: `fm:references[0]:url`
  - Kontext: …https://www.beyer-ch.com/de/uhrenmuseum-beyer-zurich/…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/muzeum-gdansk-zegarow-wiezowych.md`

- **HTTP 404** — https://cs.wikipedia.org/wiki/Muzeum_Zegar%C3%B3w_Wie%C5%BCowych_w_Gda%C5%84sku
  - Pole: `fm:references[0]:url`
  - Kontext: …https://cs.wikipedia.org/wiki/Muzeum_Zegar%C3%B3w_Wie%C5%BCowych_w_Gda%C5%84sku…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/muzeum-kadan-orloj.md`

- **HTTP 404** — https://www.mesto-kadan.cz/orloj/d-1006
  - Pole: `fm:references[0]:url`
  - Kontext: …https://www.mesto-kadan.cz/orloj/d-1006…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/muzeum-klementinum.md`

- **network error: fetch failed** — https://klementinum.com/
  - Pole: `fm:references[0]:url`
  - Kontext: …https://klementinum.com/…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20251111080119/http://klementinum.com/ (20251111080119)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/muzeum-pillichsdorf.md`

- **HTTP 404** — https://www.weinviertel.at/a-pfarrkirche-st-vitus-pillichsdorf
  - Pole: `fm:references[0]:url`
  - Kontext: …https://www.weinviertel.at/a-pfarrkirche-st-vitus-pillichsdorf…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/muzeum-radnicni-vez-prostejov.md`

- **network error: fetch failed** — https://www.orloje.eu/sekce/prostejovsky-orloj/
  - Pole: `fm:references[0]:url`
  - Kontext: …https://www.orloje.eu/sekce/prostejovsky-orloj/…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/pichacky.md`

- **HTTP 403** — https://www.wikiwand.com/de/Johannes_B%C3%BCrk
  - Pole: `body:link`
  - Kontext: …ářskou firmu Bürk založil pan [Johannes Bürk](https://www.wikiwand.com/de/Johannes_B%C3%BCrk) v roce 1855. Firma od počá…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 403** — https://www.wikiwand.com/de/W%C3%BCrttembergische_Uhrenfabrik_B%C3%BCrk
  - Pole: `body:link`
  - Kontext: …u vyjímáne: - Day - Bundy - [Firma Bürk](https://www.wikiwand.com/de/W%C3%BCrttembergische_Uhrenfabrik_B%C3%BCrk) - [Str…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/rick-stanley.md`

- **HTTP 404** — http://www.usboomers.com:80/clockothers.htm
  - Pole: `body:bare`
  - Kontext: …rchive.org/web/20170117010318/http://www.usboomers.com:80/clockothers.htm) a další. …
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20170117010318/http://www.usboomers.com:80/clockothers.htm (20170117010318)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/rimskedigi2.md`

- **network error: timeout** — https://christies.com/en/lot/lot-4973414
  - Pole: `body:link`
  - Kontext: …y-taste-l13303/lot.12.html) - [www.christies.com/en/lot/lot-4973414](https://christies.com/en/lot/lot-4973414) - Moderní…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20260312144619/https://www.christies.com/en/lot/lot-4973414 (20260312144619)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/slunecni-filler.mdx`

- **network error: fetch failed** — https://www.vlastafiller.wz.cz/
  - Pole: `body:bare`
  - Kontext: …rchive.org/web/20250408182125/https://www.vlastafiller.wz.cz/), můžeme zde ukázat [sluneční…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20250408182125/https://www.vlastafiller.wz.cz/ (20250408182125)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/slunecni.mdx`

- **network error: fetch failed** — https://www.vlastafiller.wz.cz/
  - Pole: `body:bare`
  - Kontext: …rchive.org/web/20250408182125/https://www.vlastafiller.wz.cz/), zde můžeme ukázat funkční s…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20250408182125/https://www.vlastafiller.wz.cz/ (20250408182125)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 409** — http://www.astroama.com/
  - Pole: `fm:references[3]:url`
  - Kontext: …http://www.astroama.com/…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/sobotecka-dilna-prokesova-robertuv-krok.md`

- **network error: fetch failed** — https://www.hodinarstvi-marek.cz/
  - Pole: `body:link`
  - Kontext: …ké hodinářství **Jan Marek** ([webové stránky](https://www.hodinarstvi-marek.cz/)) provedl restaurace mj. v **…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **network error: fetch failed** — https://www.hodinarstvi-marek.cz/
  - Pole: `body:link`
  - Kontext: …rad — Hodinářství Jan Marek* ([webové stránky](https://www.hodinarstvi-marek.cz/)). Restaurátorské dokumentace…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/svarcvaldky.md`

- **HTTP 404** — http://www.villingen-schwenningen.de/UEber_das_Museum.697.0.html
  - Pole: `fm:references[6]:url`
  - Kontext: …http://www.villingen-schwenningen.de/UEber_das_Museum.697.0.html…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/synchronizace-hodin.md`

- **HTTP 403** — https://www.wikiwand.com/cs/Vys%C3%ADla%C4%8D_OMA/
  - Pole: `body:link`
  - Kontext: …95 vypnut. Zajímavý podrobný [článek zde](https://www.wikiwand.com/cs/Vys%C3%ADla%C4%8D_OMA/) a také ve [wikipedii](http…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/tabor.mdx`

- **HTTP 404** — https://www.impuls.cz/regiony/jihocesky-kraj/stara-radnice-tabor-krov-jan-zizka-600-let.A200821_123202_imp-jihocesky_kov/
  - Pole: `body:bare`
  - Kontext: …rchive.org/web/20260309004348/https://www.impuls.cz/regiony/jihocesky-kraj/stara-radnice-tabor-krov-jan-zizka-600-let.A2…
  - 📦 **Wayback Machine snapshot:** http://web.archive.org/web/20260309004348/https://www.impuls.cz/regiony/jihocesky-kraj/stara-radnice-tabor-krov-jan-zizka-600-let.A200821_123202_imp-jihocesky_kov/ (20260309004348)
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/vezni-muzejicko-evropa.md`

- **HTTP 404** — https://www.jindrisskavez.cz/index.php/cs/
  - Pole: `body:bare`
  - Kontext: …rchive.org/web/20260317054855/https://www.jindrisskavez.cz/index.php/cs/) [![Jindřížská věž](/img/vez…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://www.jindrisskavez.cz/index.php/cs/
  - Pole: `body:bare`
  - Kontext: …rchive.org/web/20260317054855/https://www.jindrisskavez.cz/index.php/cs/) a na něm umístěna virtuální …
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/zidovske.mdx`

- **HTTP 404** — https://www.mapy.cz/s/kcyO
  - Pole: `body:link`
  - Kontext: …vské hodiny najdete přibližně [zde](https://www.mapy.cz/s/kcyO). Obrázek ukazuje Staronovou …
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/horologie-cz/novinky.md`

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/laplace
  - Pole: `body:link`
  - Kontext: …y/time-slider) - 15\. 3. 2024 [Elektrárenské hodiny LAPLACE](https://hodinarium-eu.pages.dev/clanky/laplace) Doplnění in…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/pneumatika2
  - Pole: `body:link`
  - Kontext: …projekty/ntph) - 11\. 1. 2023 [Pneumatické veřejné hodiny v Paříži ](https://hodinarium-eu.pages.dev/clanky/pneumatika2)…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/rimskedigi2
  - Pole: `body:link`
  - Kontext: …vezni2021.htm) - 19\. 9. 2021 [Římské digitálky tentokrát s Arduinem](https://hodinarium-eu.pages.dev/clanky/rimskedigi2…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/tabor
  - Pole: `body:link`
  - Kontext: …y/lantime-m100) - 3\. 1. 2021 [O stěhovavém orloji v Táboře](https://hodinarium-eu.pages.dev/clanky/tabor) (aktualizace)…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/mobatime
  - Pole: `body:link`
  - Kontext: …kty/gps-sakul) - 19\. 5. 2020 [Samostavitelné hodiny systému MOBALine](https://hodinarium-eu.pages.dev/clanky/mobatime) …
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/nocturnal
  - Pole: `body:link`
  - Kontext: … přesného času - 20\. 4. 2020 [Nocturnal](https://hodinarium-eu.pages.dev/clanky/nocturnal) - 19\. 4. 2020 [Kalendářní k…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/orient
  - Pole: `body:link`
  - Kontext: …nky/nocturnal) - 19\. 4. 2020 [Kalendářní kopmlikace u hodinek Orient a Raketa](https://hodinarium-eu.pages.dev/clanky/o…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/pichacky
  - Pole: `body:link`
  - Kontext: …/clanky/merkur) - 18\. 7.2018 [Stránka věnovaná starým "píchačkám"](https://hodinarium-eu.pages.dev/clanky/pichacky) - 2…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/eureka
  - Pole: `body:link`
  - Kontext: … Legendární elektrické hodiny [Eureka](https://hodinarium-eu.pages.dev/clanky/eureka) - 13\. 4.2018 Elektricky nat…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/pulsynetic
  - Pole: `body:link`
  - Kontext: …/clanky/ferramo) - 1\. 5.2017 [Pulsynetic - svérázná řešení](https://hodinarium-eu.pages.dev/clanky/pulsynetic) - 29.4.2…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/brillie
  - Pole: `body:link`
  - Kontext: …c) - 29.4.2017 Mateční hodiny [Brillie](https://hodinarium-eu.pages.dev/clanky/brillie) - nový přírůstek do Hodinári…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/horologie-cz/novinky2.md`

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/laplace
  - Pole: `body:link`
  - Kontext: …2\. 4. 2013 Synchronní hodiny [LAPLACE](https://hodinarium-eu.pages.dev/clanky/laplace) - 8\. 4. 2013 Fotogalerie [M…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/tabor
  - Pole: `body:link`
  - Kontext: …orloj_k_u.htm) - 19\. 6. 2007 [Hodiny ve věži staré táborské radnice](https://hodinarium-eu.pages.dev/clanky/tabor) (vče…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/kostky
  - Pole: `body:link`
  - Kontext: …tavka 2015 v Hodináriu Děčín. [Výtvarné miniatury ve tvaru kostky - Dr. Jaroslav Adam](https://hodinarium-eu.pages.dev/c…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/pilovky
  - Pole: `body:link`
  - Kontext: …zdroj zanikl)* - 29\. 9. 2014 [Pilové hodiny se samonivelačním fyzikálním kyvadlem](https://hodinarium-eu.pages.dev/clan…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/mindelheim
  - Pole: `body:link`
  - Kontext: …ce) - 8\. 4. 2013 Fotogalerie [Mindelheim](https://hodinarium-eu.pages.dev/clanky/mindelheim) - 2\. 3. 2013 [Sezóna 2013…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/zidovske
  - Pole: `body:link`
  - Kontext: …5. 2009 Doplněna nová animace [židovských hodin](https://hodinarium-eu.pages.dev/clanky/zidovske) a přidána [animace slu…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/zidovske
  - Pole: `body:link`
  - Kontext: …anky/janovice) - 20\. 6. 2007 [Židovské hodiny z roku 1764](https://hodinarium-eu.pages.dev/clanky/zidovske) (i PC anima…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/slunecni
  - Pole: `body:link`
  - Kontext: …lanky/zidovske) a přidána [animace slunečních hodin](https://hodinarium-eu.pages.dev/clanky/slunecni) od pana Vlasty Fil…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/schaffhausen
  - Pole: `body:link`
  - Kontext: … 13\. 4. 2009 Mechanické digi [IWC Schaffhausen](https://hodinarium-eu.pages.dev/clanky/schaffhausen) z roku 1885 - 7\. …
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/prestavby
  - Pole: `body:link`
  - Kontext: …m) trochu jinak - 26.11. 2008 [Přestavby hodin](https://hodinarium-eu.pages.dev/clanky/prestavby) - doplněno o [historic…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/prestavby
  - Pole: `body:link`
  - Kontext: …-24-ciferniku) - 23\. 3. 2008 [Přestavby hodin](https://hodinarium-eu.pages.dev/clanky/prestavby) - 20\. 3. 2008 Hodiny …
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/ukazatele
  - Pole: `body:link`
  - Kontext: … Atmos, fotovoltaika a jiné - [Bez ručiček](https://hodinarium-eu.pages.dev/clanky/ukazatele) to také jde - Pan Marce [B…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/betrisey
  - Pole: `body:link`
  - Kontext: …tele) to také jde - Pan Marce [Betrisey](https://hodinarium-eu.pages.dev/clanky/betrisey) - hodiny kuličkové, pneumati…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/svitici
  - Pole: `body:link`
  - Kontext: …t - 100 vteřin - 24\. 5. 2008 [Svítící](https://hodinarium-eu.pages.dev/clanky/svitici) hodiny - 18\. 5. 2008 [Lenzk…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/svitici
  - Pole: `body:link`
  - Kontext: …nky.htm) eshop - 14\. 2. 2008 [Svítící hodiny](https://hodinarium-eu.pages.dev/clanky/svitici) - 5\. 1. 2008 [Orloj v Br…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/lenzkirch
  - Pole: `body:link`
  - Kontext: …vitici) hodiny - 18\. 5. 2008 [Lenzkirch](https://hodinarium-eu.pages.dev/clanky/lenzkirch) - Rolls-Royce ze Schwarzwald…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/uspirku
  - Pole: `body:link`
  - Kontext: … 2008 Variace na věžní hodiny [U Špirků](https://hodinarium-eu.pages.dev/clanky/uspirku) - 12\. 4. 2008 Kuriózní hodi…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/youtube
  - Pole: `body:link`
  - Kontext: …\. 4. 2008 Kuriózní hodiny na [YouTube](https://hodinarium-eu.pages.dev/clanky/youtube) - 12\. 4. 2008 Hodiny [ATO](…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/zapekane
  - Pole: `body:link`
  - Kontext: …lanky/kulicky) - 18\. 2. 2008 [Zapékané hodiny](https://hodinarium-eu.pages.dev/clanky/zapekane) (do skla) - 18\. 2. 200…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/kvetinove
  - Pole: `body:link`
  - Kontext: …aktualizace webu, zejména [květinové hodiny](https://hodinarium-eu.pages.dev/clanky/kvetinove), [květinové hodiny v Podě…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/podebrady
  - Pole: `body:link`
  - Kontext: ….pages.dev/clanky/kvetinove), [květinové hodiny v Poděbradech 1](https://hodinarium-eu.pages.dev/clanky/podebrady), [2](…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/podebrady
  - Pole: `body:link`
  - Kontext: …/co-pisi-jini) - 13\. 2. 2007 [Květinové hodiny](https://hodinarium-eu.pages.dev/clanky/podebrady) Poděbrady - 12\. 2. 2…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/podebrady1b
  - Pole: `body:link`
  - Kontext: ….pages.dev/clanky/podebrady), [2](https://hodinarium-eu.pages.dev/clanky/podebrady1b), [3](https://hodinarium-eu.p…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/podebrady2
  - Pole: `body:link`
  - Kontext: …ages.dev/clanky/podebrady1b), [3](https://hodinarium-eu.pages.dev/clanky/podebrady2), [4](https://hodinarium-eu.p…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/podebrady3
  - Pole: `body:link`
  - Kontext: …pages.dev/clanky/podebrady2), [4](https://hodinarium-eu.pages.dev/clanky/podebrady3), [5](https://hodinarium-eu.p…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/podebrady4
  - Pole: `body:link`
  - Kontext: …pages.dev/clanky/podebrady3), [5](https://hodinarium-eu.pages.dev/clanky/podebrady4) a[ stroje Švarcvaldek](/…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/gobelin
  - Pole: `body:link`
  - Kontext: …ady) Poděbrady - 12\. 2. 2007 [Gobelínky](https://hodinarium-eu.pages.dev/clanky/gobelin) - vyšívané hodiny (kýč je kd…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/razitka
  - Pole: `body:link`
  - Kontext: … 1. 2007 Kvalifikovaná časová [razítka](https://hodinarium-eu.pages.dev/clanky/razitka) doplněk elektronického podpi…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/lahvace
  - Pole: `body:link`
  - Kontext: …nického podpisu - 29.12. 2006 [Lahváče](https://hodinarium-eu.pages.dev/clanky/lahvace) aneb hodiny v lahvích - 29.1…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/papir
  - Pole: `body:link`
  - Kontext: …odiny v lahvích - 29.12. 2006 [Papíráky](https://hodinarium-eu.pages.dev/clanky/papir) - hodiny z produkce Papírové…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/mluvici1895
  - Pole: `body:link`
  - Kontext: …arozitnici.htm) - 23.11. 2006 [Mluvící hodiny](https://hodinarium-eu.pages.dev/clanky/mluvici1895) z roku 1895 - 5.11 20…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/horologie-cz/spolek.md`

- **HTTP 404** — https://hodinarium-eu.pages.dev/clanky/rimskedigi
  - Pole: `body:link`
  - Kontext: …ch vynálezů. Jmenujme alespoň [římské digitálky](https://hodinarium-eu.pages.dev/clanky/rimskedigi). Sdružení bylo založ…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/kronika/decin-aktual0.md`

- **network error: timeout** — http://www.novinky.cz/cestovani/tipy-na-vylety/385676-decinsky-zamek-vystavuje-mechanicke-hodiny-nechybi-ani-bizarni-kousky.html
  - Pole: `body:link`
  - Kontext: …o.rvp.cz. [cit. 2026-04-28] - [Novinky od ČTK](http://www.novinky.cz/cestovani/tipy-na-vylety/385676-decinsky-zamek-vyst…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/kronika/vezni-muzejicko.md`

- **network error: fetch failed** — https://horologie.cz/clanky/spolek
  - Pole: `body:link`
  - Kontext: … uložení pokladů. Díky členům [Českého spolku horologického](https://horologie.cz/clanky/spolek) také nějakou dobu byla …
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/soupis-veznich-hodin/1591-hradec-kralove-bila-vez-frejlich.mdx`

- **HTTP 404** — https://cs.wikipedia.org/wiki/B%C3%ADl%C3%A1_v%C4%9B%C5%BE_(Hradec_Kr%C3%A1lov%C3%A9
  - Pole: `fm:prameny[2]:url`
  - Kontext: …https://cs.wikipedia.org/wiki/B%C3%ADl%C3%A1_v%C4%9B%C5%BE_(Hradec_Kr%C3%A1lov%C…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/soupis-veznich-hodin/1876-police-nad-metuji-radnice-janata.mdx`

- **HTTP 400** — https://www.policenm.cz/e_download.php?file=data/editor/88cs_173.pdf
  - Pole: `fm:prameny[1]:url`
  - Kontext: …https://www.policenm.cz/e_download.php?file=data/editor/88cs_173.pdf…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/soupis-veznich-hodin/1887-v-soukr-sbirce-krecmer.mdx`

- **HTTP 404** — http://paichl.cz/knihy/hodiny/hodiny_vezni/Krecmer_Vaclav_Praha/Kretschmer_V_Praha_1888/Kretschmer_V_Praha_1888.jpg
  - Pole: `fm:prameny[0]:url`
  - Kontext: …http://paichl.cz/knihy/hodiny/hodiny_vezni/Krecmer_Vaclav_Praha/Kretschmer_V_Pra…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/soupis-veznich-hodin/1893-domazlice-hainz.mdx`

- **network error: fetch failed** — https://www.cdsh.cz/
  - Pole: `body:link`
  - Kontext: …l.htm?id=1292106) a publikace [Fišer 2015](https://www.cdsh.cz/). …
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/soupis-veznich-hodin/1898-paichl-krecmer.mdx`

- **HTTP 404** — http://paichl.cz/knihy/hodiny/hodiny_vezni/Krecmer_Vaclav_Praha/Krecmer_11.jpg
  - Pole: `fm:prameny[0]:url`
  - Kontext: …http://paichl.cz/knihy/hodiny/hodiny_vezni/Krecmer_Vaclav_Praha/Krecmer_11.jpg…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/soupis-veznich-hodin/1899-netvorice-krecmer.mdx`

- **network error: timeout** — https://www.jiskra-benesov.cz/clanek/proc-lenka-filipova-nabidla-pomoc-nezvonicim-zvonum-a-vezni-hodiny-zase-obijeji-cas-7976
  - Pole: `fm:prameny[0]:url`
  - Kontext: …https://www.jiskra-benesov.cz/clanek/proc-lenka-filipova-nabidla-pomoc-nezvonici…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/soupis-veznich-hodin/nedatovano-nezname-krecmer.mdx`

- **HTTP 404** — http://paichl.cz/knihy/hodiny/hodiny_vezni/Krecmer_Vaclav_Praha/Beroun/Krecmer_Vaclav_Vinohrady_vezni_hodiny_0001.JPG
  - Pole: `fm:prameny[0]:url`
  - Kontext: …http://paichl.cz/knihy/hodiny/hodiny_vezni/Krecmer_Vaclav_Praha/Beroun/Krecmer_V…
  - ⚠ Žádný Wayback snapshot nenalezen — kandidát na REMOVE
  - Rozhodnutí: _REPLACE / REMOVE — doplň_
