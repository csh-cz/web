# Audit hero / full-width obrázků — nevyhovující rozlišení

**Datum:** 2026-05-09
**Skript:** `scripts/audit-hero-images.mjs` (`pnpm exec node scripts/audit-hero-images.mjs`)

Účel: najít obrázky, které se na webu renderují jako **hero** (na celou šířku
textu) ale mají nízké rozlišení a vypadají na desktopu/retině rozmazaně.

**Pro kolegy:** pokud máte v archivu lepší skeny / fotky stejného motivu,
prosíme o doplnění. Stačí nahradit soubor (cesta + název níže), případně
poslat e-mailem na info@orloj.eu.

## Co audit pokrývá

| Zdroj | Popis |
|---|---|
| `kroky/<slug>.mdx` `hero` field | Hero hlavní fotky technického profilu kroku |
| `soupis-veznich-hodin/<slug>.mdx` `foto[0]` | Single-photo karta full-width hero |
| `hodinari/<slug>.mdx` `portret` field | Portrét na medailonu hodináře |
| `content/hodinarium-eu/<slug>.md{x}` první img | Markdown `![](src)` nebo `<Photo src=...>` v prvních 400 znacích body — Article render umístí jako hero |

## Klasifikace (thresholdy)

| Role | OK ≥ | TOO_SMALL | BORDERLINE |
|---|---|---|---|
| **Portrét hodináře** | 800 px | < 600 px | 600–800 px |
| **Hero foto / full-width** | 1600 px | < 1200 px | 1200–1600 px (retina rozmazané) |

## Souhrn

**Nalezeno: 111** obrázků k vylepšení.

- **TOO_SMALL:** 103 (urgentní — viditelně rozmazané)
- **BORDERLINE:** 8 (OK na desktopu, na retině měkké)
- **MISSING:** 0 (soubor neexistuje)

Per content type:

- **clanky** (články): 77
- **karta** (sbírkové karty): 26
- **hodinari** (medailony): 7
- **soupis** (věžní hodiny): 1
- **kroky** (hodinové kroky): 0

## Portréty hodinářů

| # | Status | Stránka | Soubor | Rozlišení | URL |
|---|---|---|---|---|---|
| 1 | TOO_SMALL | Joseph Thaddeus Winnerl | `/img/hodinari/joseph-winnerl.jpg` | 250×307 | [link](https://hodinarium.eu/hodinari/joseph-winnerl/) |
| 2 | TOO_SMALL | Josef Božek | `/img/hodinari/josef-bozek.jpg` | 325×400 | [link](https://hodinarium.eu/hodinari/josef-bozek/) |
| 3 | TOO_SMALL | Ludvík Hainz I. (zakladatel firmy) | `/img/hodinari/ludvik-hainz.png` | 548×527 | [link](https://hodinarium.eu/hodinari/ludvik-hainz/) |
| 4 | BORDERLINE | František Josef Gerstner | `/img/hodinari/franz-joseph-gerstner.jpg` | 624×717 | [link](https://hodinarium.eu/hodinari/franz-joseph-gerstner/) |
| 5 | BORDERLINE | František Špatný | `/img/hodinari/frantisek-spatny.jpg` | 632×756 | [link](https://hodinarium.eu/hodinari/frantisek-spatny/) |
| 6 | BORDERLINE | Čeněk Daněk | `/img/hodinari/cenek-danek.jpg` | 668×932 | [link](https://hodinarium.eu/hodinari/cenek-danek/) |
| 7 | BORDERLINE | Jan Prokeš | `/img/hodinari/jan-prokes.jpg` | 670×1450 | [link](https://hodinarium.eu/hodinari/jan-prokes/) |

## Soupis věžních hodin — hero foto karty

| # | Status | Stránka | Soubor | Rozlišení | URL |
|---|---|---|---|---|---|
| 1 | BORDERLINE | Žďár — Kaple Navštívení Panny Marie (1904) | `/img/sbirka/zdar-u-svijan/krecmer-stroj.jpeg` | 1280×1062 | [link](https://hodinarium.eu/soupis-veznich-hodin/1899-zdar-u-svijan-krecmer/) |

## Sbírkové karty — hero exponátu

| # | Status | Stránka | Soubor | Rozlišení | URL |
|---|---|---|---|---|---|
| 1 | TOO_SMALL | Podružné hodiny Bodet | `/img/H715_BODET/foto_0001.jpg` | 180×200 | [link](https://hodinarium.eu/sbirka/karta/inv-126-podruzne-hodiny-bodet/) |
| 2 | TOO_SMALL | Hodiny Bulle | `/img/elektrika/bulle/magnet.jpg` | 263×397 | [link](https://hodinarium.eu/sbirka/karta/inv-161-hodiny-bulle/) |
| 3 | TOO_SMALL | Podružný stroj Elektročas malý | `/img/decin/ElektrocasVK1/foto_0001.jpg` | 361×300 | [link](https://hodinarium.eu/sbirka/karta/inv-194-podruzny-stroj-elektrocas-maly/) |
| 4 | TOO_SMALL | Podružný stroj Elektročas malý | `/img/decin/ElektrocasVK1/foto_0001.jpg` | 361×300 | [link](https://hodinarium.eu/sbirka/karta/inv-227-podruzny-stroj-elektrocas-maly/) |
| 5 | TOO_SMALL | Závěsné Elektročas oboustranné | `/img/decin/ElektrocasVK1/foto_0001.jpg` | 361×300 | [link](https://hodinarium.eu/sbirka/karta/inv-253-zavesne-elektrocas-oboustranne/) |
| 6 | TOO_SMALL | Píchačky Elektročas DK6 | `/img/decin/ElektrocasVK1/foto_0001.jpg` | 361×300 | [link](https://hodinarium.eu/sbirka/karta/inv-262-pichacky-elektrocas-dk6/) |
| 7 | TOO_SMALL | Píchačky Elektročas Dk1 | `/img/decin/ElektrocasVK1/foto_0001.jpg` | 361×300 | [link](https://hodinarium.eu/sbirka/karta/inv-263-pichacky-elektrocas-dk1/) |
| 8 | TOO_SMALL | Píchačky Elektročas Dk6 | `/img/decin/ElektrocasVK1/foto_0001.jpg` | 361×300 | [link](https://hodinarium.eu/sbirka/karta/inv-274-pichacky-elektrocas-dk6/) |
| 9 | TOO_SMALL | Matiční Elektročas | `/img/decin/ElektrocasVK1/foto_0001.jpg` | 361×300 | [link](https://hodinarium.eu/sbirka/karta/inv-94-maticni-elektrocas/) |
| 10 | TOO_SMALL | Podružné Pragotron Perla | `/img/pragotron/C%2030%20ZEZADU+PS%204.jpg` | 400×400 | [link](https://hodinarium.eu/sbirka/karta/inv-121-podruzne-pragotron-perla/) |
| 11 | TOO_SMALL | Podružné hodiny Pragotron | `/img/pragotron/C%2030%20ZEZADU+PS%204.jpg` | 400×400 | [link](https://hodinarium.eu/sbirka/karta/inv-127-podruzne-hodiny-pragotron/) |
| 12 | TOO_SMALL | Stopky Pragotron | `/img/pragotron/C%2030%20ZEZADU+PS%204.jpg` | 400×400 | [link](https://hodinarium.eu/sbirka/karta/inv-153-stopky-pragotron/) |
| 13 | TOO_SMALL | Podružný stroj Pragotron malý | `/img/pragotron/C%2030%20ZEZADU+PS%204.jpg` | 400×400 | [link](https://hodinarium.eu/sbirka/karta/inv-198-podruzny-stroj-pragotron-maly/) |
| 14 | TOO_SMALL | Podružný stroj Pragotron malý | `/img/pragotron/C%2030%20ZEZADU+PS%204.jpg` | 400×400 | [link](https://hodinarium.eu/sbirka/karta/inv-199-podruzny-stroj-pragotron-maly/) |
| 15 | TOO_SMALL | Podružný stroj Pragotron malý | `/img/pragotron/C%2030%20ZEZADU+PS%204.jpg` | 400×400 | [link](https://hodinarium.eu/sbirka/karta/inv-231-podruzny-stroj-pragotron-maly/) |
| 16 | TOO_SMALL | Podružný stroj Pragotron malý | `/img/pragotron/C%2030%20ZEZADU+PS%204.jpg` | 400×400 | [link](https://hodinarium.eu/sbirka/karta/inv-232-podruzny-stroj-pragotron-maly/) |
| 17 | TOO_SMALL | Pragotron C301 | `/img/pragotron/C%2030%20ZEZADU+PS%204.jpg` | 400×400 | [link](https://hodinarium.eu/sbirka/karta/inv-270-pragotron-c301/) |
| 18 | TOO_SMALL | Podružné Brillié | `/img/elektrika/brillie/Brillie4.jpg` | 442×607 | [link](https://hodinarium.eu/sbirka/karta/inv-268-podruzne-brillie/) |
| 19 | TOO_SMALL | Brillié | `/img/elektrika/brillie/Brillie4.jpg` | 442×607 | [link](https://hodinarium.eu/sbirka/karta/inv-88-brillie/) |
| 20 | TOO_SMALL | Jednotný čas | `/img/elektrika/jednotny_cas/artdeco/f/celek_artdeco.jpg` | 528×900 | [link](https://hodinarium.eu/sbirka/karta/inv-101-jednotny-cas/) |
| 21 | TOO_SMALL | Podružné Jednotný čas | `/img/elektrika/jednotny_cas/artdeco/f/celek_artdeco.jpg` | 528×900 | [link](https://hodinarium.eu/sbirka/karta/inv-267-podruzne-jednotny-cas/) |
| 22 | TOO_SMALL | Podružné hodiny Mobatime | `/img/Mobatime/3218C1.jpg` | 800×787 | [link](https://hodinarium.eu/sbirka/karta/inv-125-podruzne-hodiny-mobatime/) |
| 23 | TOO_SMALL | Synchronní Datumatic | `/img/datumatic/f/foto_0003.jpg` | 832×500 | [link](https://hodinarium.eu/sbirka/karta/inv-144-synchronni-datumatic/) |
| 24 | TOO_SMALL | Strojek Hainz | `/img/decin/dalsi_stroje/Hainz/f/foto_0001.jpg` | 1000×750 | [link](https://hodinarium.eu/sbirka/karta/inv-100-strojek-hainz/) |
| 25 | TOO_SMALL | Podružné věžní Hainz | `/img/decin/dalsi_stroje/Hainz/f/foto_0001.jpg` | 1000×750 | [link](https://hodinarium.eu/sbirka/karta/inv-257-podruzne-vezni-hainz/) |
| 26 | TOO_SMALL | Nástěnné Hainz | `/img/decin/dalsi_stroje/Hainz/f/foto_0001.jpg` | 1000×750 | [link](https://hodinarium.eu/sbirka/karta/inv-280-nastenne-hainz/) |

## Články — hero v body

| # | Status | Stránka | Soubor | Rozlišení | URL |
|---|---|---|---|---|---|
| 1 | TOO_SMALL | Ukazatele času u "normálních" hodin | `/img/rucicky1.gif` | 85×108 | [link](https://hodinarium.eu/konstrukce/ukazatele/) |
| 2 | TOO_SMALL | Mysteriózní hodiny — sběratelský bonbónek | `/img/mystery1.jpg` | 140×132 | [link](https://hodinarium.eu/sbirka/mystery/) |
| 3 | TOO_SMALL | Hodinárium Děčín - expozice časoměrných strojů | `/img/elektrika/jednotny_cas/artdeco/celek_artdeco.jpg` | 141×240 | [link](https://hodinarium.eu/sbirka/decin_jednotny_cas/) |
| 4 | TOO_SMALL | KLÍČOVÁ OTÁZKA - natahovátko L. Hainz | `/img/hainz/predni_n.jpg` | 172×253 | [link](https://hodinarium.eu/zajimavosti/hainz_natahovani/) |
| 5 | TOO_SMALL | TIME FLOW CLOCK - hodiny protékajícího času | `/img/vodni/time_flow_clock0.jpg` | 181×361 | [link](https://hodinarium.eu/sbirka/vodni_B_Gitton/) |
| 6 | TOO_SMALL | Kapesní "orloj" BREVETE | `/img/hodinky/kapesni_orloj/627893335_6_n.jpg` | 188×250 | [link](https://hodinarium.eu/sbirka/kapesni_orloj/) |
| 7 | TOO_SMALL | Pulsynetic - neobvyklá řešení | `/img/elektrika/pulsynetic/p1959_3_m.jpg` | 188×300 | [link](https://hodinarium.eu/konstrukce/pulsynetic/) |
| 8 | TOO_SMALL | Květinové hodiny Poděbrady | `/img/ujete/podebrady2.jpg` | 190×126 | [link](https://hodinarium.eu/virtualni-muzeum/podebrady/) |
| 9 | TOO_SMALL | Římské digitálky | `/img/digitalky_naramkove1_i.jpg` | 194×108 | [link](https://hodinarium.eu/projekty/rimskedigi/) |
| 10 | TOO_SMALL | Vodní budík | `/img/ujete/vodni_budik.jpg` | 195×260 | [link](https://hodinarium.eu/sbirka/vodni_budik/) |
| 11 | TOO_SMALL | HODINY BUDÍKOVÉ 2 | `/img/budiky1/budik_schw1.jpg` | 196×333 | [link](https://hodinarium.eu/sbirka/budiky2/) |
| 12 | TOO_SMALL | Legendární elektrické hodiny Eureka | `/img/elektrika/eureka/eureka1.jpg` | 200×251 | [link](https://hodinarium.eu/konstrukce/eureka/) |
| 13 | TOO_SMALL | Fyzikální "líné" kyvadlo | `/img/line_kyvadlo/differentialni_kyvadlo.jpg` | 216×352 | [link](https://hodinarium.eu/konstrukce/line_kyvadlo/) |
| 14 | TOO_SMALL | Celodeňky - 12 verzus 24 | `/img/vezni/litomysl/litomysl1907.jpg` | 225×205 | [link](https://hodinarium.eu/zajimavosti/12_24/) |
| 15 | TOO_SMALL | Hodiny valících se kuliček | `/img/congrevovy1.jpg` | 230×224 | [link](https://hodinarium.eu/sbirka/kulicky/) |
| 16 | TOO_SMALL | Svítící hodiny | `/img/elektrika/svitici/svitici2.jpg` | 260×270 | [link](https://hodinarium.eu/sbirka/svitici/) |
| 17 | TOO_SMALL | BULLE hodiny - elektromagnet se dvěma magnetickými poli | `/img/elektrika/bulle/magnet.jpg` | 263×397 | [link](https://hodinarium.eu/konstrukce/bulle/) |
| 18 | TOO_SMALL | DCF 77 — rádiem řízené hodiny | `/img/dcf_analog.jpg` | 263×252 | [link](https://hodinarium.eu/projekty/dcf77/) |
| 19 | TOO_SMALL | Hodiny Datumatic | `/img/datumatic/foto_0001.jpg` | 264×220 | [link](https://hodinarium.eu/konstrukce/datumatik/) |
| 20 | TOO_SMALL | "Vynucená" modernizace hodin FLIP CLOCK SOLARI UDINE SPECIAL… | `/img/arduino/Solari/Solari1.jpg` | 265×270 | [link](https://hodinarium.eu/projekty/Arduino_Solari/) |
| 21 | TOO_SMALL | Mateční hodiny Brillie | `/img/elektrika/brillie/brillie_hodinarium_bez_ciferniku.jpg` | 275×560 | [link](https://hodinarium.eu/sbirka/brillie/) |
| 22 | TOO_SMALL | Instalované NTP servery | `/img/elektrika/Bodet/Profil930NTP.png` | 277×300 | [link](https://hodinarium.eu/sbirka/decin_NTP/) |
| 23 | TOO_SMALL | Lahváče | `/img/papiraky/sklober.jpg` | 280×550 | [link](https://hodinarium.eu/sbirka/lahvace/) |
| 24 | TOO_SMALL | Elektrifikace věžních strojů | `/img/decin/elektrika/foto2.jpg` | 281×280 | [link](https://hodinarium.eu/sbirka/decin_elektrifikace/) |
| 25 | TOO_SMALL | Nocturnal | `/img/nocturnal/princip_mereni.jpg` | 320×223 | [link](https://hodinarium.eu/sbirka/nocturnal/) |
| 26 | TOO_SMALL | Barokní věžní ministroj | `/img/vez/ZlateHory/kostel_Zlate_Hory.jpg` | 330×220 | [link](https://hodinarium.eu/sbirka/vez_Zlate_Hory/) |
| 27 | TOO_SMALL | Hodiny skoro z MERKURU | `/img/ujete/Clock_Cover_Dec_2003.JPG` | 336×474 | [link](https://hodinarium.eu/zajimavosti/merkur/) |
| 28 | TOO_SMALL | KAPPA – výrobce námořních hodin master-slave | `/img/elektrika/Kappa/Kappa1.jpg` | 362×408 | [link](https://hodinarium.eu/projekty/Kappa/) |
| 29 | TOO_SMALL | Stroj věžních hodin 1884 - Podmokly | `/img/vez/decin/decin1.jpg` | 363×563 | [link](https://hodinarium.eu/sbirka/vez_decin/) |
| 30 | TOO_SMALL | Hodiny k ocenění vítěze - ZEMSKÉ JEZDECKÉ ZÁVODY PRAHA 1934 | `/img/jezdeke/trmen1934_1.jpg` | 382×470 | [link](https://hodinarium.eu/sbirka/jezdecke/) |
| 31 | TOO_SMALL | Strážce času v Sezimově Ústí | `/img/slunecni/svetlonos.jpg` | 390×456 | [link](https://hodinarium.eu/virtualni-muzeum/svetlonos/) |
| 32 | TOO_SMALL | Použitá i nepoužitá literatura | `/img/ujete/sikma_plocha_1.jpg` | 397×170 | [link](https://hodinarium.eu/zajimavosti/literatura/) |
| 33 | TOO_SMALL | Astronomické hodiny a hodiny pásmového času | `/img/Astronomische/celek.jpg` | 400×447 | [link](https://hodinarium.eu/projekty/Staiger/) |
| 34 | TOO_SMALL | Meinberg NTP LANTIME M100 GPS (ELX) | `/img/decin/NTP_Meinberg/panelM100.jpg` | 403×335 | [link](https://hodinarium.eu/projekty/Lantime_M100/) |
| 35 | TOO_SMALL | Pan Rick Stanley | `/img/mystery/clockincline1.jpg` | 414×230 | [link](https://hodinarium.eu/projekty/RickStanley/) |
| 36 | TOO_SMALL | Víceletý kalendář Orient | `/img/Orient/orientceu07005wx_dial.jpg` | 428×505 | [link](https://hodinarium.eu/projekty/orient/) |
| 37 | TOO_SMALL | Švarcvaldky | `/img/svarcvald/vraky.jpg` | 448×336 | [link](https://hodinarium.eu/konstrukce/svarcvaldky/) |
| 38 | TOO_SMALL | zvon Velký později zvaný Petr Pavel | `/img/vez/zvony/f/petrpavel1.jpg` | 450×600 | [link](https://hodinarium.eu/sbirka/zvon_petr_pavel/) |
| 39 | TOO_SMALL | Vyšívané květinové hodiny - hodiny jedna báseň ?? | `/img/ujete/gobelin.jpg` | 464×441 | [link](https://hodinarium.eu/virtualni-muzeum/gobelin/) |
| 40 | TOO_SMALL | Rubidiový oscilátor PRS10 firmy SRS výtah ze stránek výrobce… | `/img/PRS10/PRS10stage2LG.jpg` | 465×400 | [link](https://hodinarium.eu/projekty/PRS10/) |
| 41 | TOO_SMALL | O věžních hodinách na ZŠ Šumava v Jablonci nad Nisou | `/img/vezni/Jablonec/ZSSumVezP.gif` | 467×396 | [link](https://hodinarium.eu/sbirka/vezni_zikmund1/) |
| 42 | TOO_SMALL | Stěhovavý orloj v Táboře | `/img/vezni/tabor/foto0189x.jpg` | 480×350 | [link](https://hodinarium.eu/virtualni-muzeum/tabor/) |
| 43 | TOO_SMALL | Polofunkční model atomových hodin pro Hodinárium | `/img/PRS10/PRS10stage3LG.jpg` | 484×400 | [link](https://hodinarium.eu/projekty/fake_atomove_hodiny/) |
| 44 | TOO_SMALL | Květinové hodiny ve světě | `/img/kvetinove/Klagenfurt2.jpg` | 500×300 | [link](https://hodinarium.eu/virtualni-muzeum/kvetinove/) |
| 45 | TOO_SMALL | Digitálně řízené kyvadlo s automatickou regulací | `/img/elektrika/kyvadlo/pripravek.jpg` | 504×350 | [link](https://hodinarium.eu/konstrukce/rizeni_kyvadla/) |
| 46 | TOO_SMALL | Pilovky se samonivelačním fyzikálním kyvadlem | `/img/pilovky/f/foto_0001.jpg` | 525×700 | [link](https://hodinarium.eu/konstrukce/pilovky/) |
| 47 | TOO_SMALL | Stroj věžních hodin - Budislav | `/img/vez/Budislav/f/kostel.jpg` | 525×700 | [link](https://hodinarium.eu/sbirka/vez_Budislav/) |
| 48 | TOO_SMALL | Stroj věžních hodin - Horní Prysk | `/img/vez/prysk/f/foto2_000.jpg` | 525×700 | [link](https://hodinarium.eu/sbirka/vez_Prysk/) |
| 49 | TOO_SMALL | Astronomické hodiny z čínské stavebnice meteostanice | `/img/astro2/meteo.jpg` | 529×380 | [link](https://hodinarium.eu/projekty/astro2_NTP/) |
| 50 | TOO_SMALL | Torzo gotického stroje z Veliké Vsi | `/img/decin/gotika/Kostel_sv._Vavrince.jpg` | 533×800 | [link](https://hodinarium.eu/sbirka/decin_velika_ves/) |
| 51 | TOO_SMALL | Pásmovky | `/img/elektrika/svetovy_cas1.jpg` | 548×172 | [link](https://hodinarium.eu/zajimavosti/casova_pasma/) |
| 52 | TOO_SMALL | Věžní komplet Prokeš 1868 ze zámku Býchory | `/img/vez/bychory/f/komplet.jpg` | 553×900 | [link](https://hodinarium.eu/sbirka/bychory_prokes1/) |
| 53 | TOO_SMALL | Poděbradský trpaslík | `/img/podebrady/trpaslik_puvodni_b.jpg` | 560×436 | [link](https://hodinarium.eu/virtualni-muzeum/podebrady3/) |
| 54 | TOO_SMALL | Květinové hodiny v Poděbradech | `/img/podebrady/malovec1.jpg` | 580×223 | [link](https://hodinarium.eu/virtualni-muzeum/podebrady1/) |
| 55 | TOO_SMALL | Papíráky | `/img/papiraky/papiraky1.jpg` | 582×280 | [link](https://hodinarium.eu/sbirka/papir/) |
| 56 | TOO_SMALL | Alžběta - 14112 - hlášení přesného času | `/img/alzbeta/Alzbeta_Ericsson.jpg.jpg` | 584×278 | [link](https://hodinarium.eu/projekty/alzbeta/) |
| 57 | TOO_SMALL | Hlavní NTP hodiny na bázi ESP8266 - NTPimpulzer + varianty | `/img/arduino/NTP_W_E.jpg` | 588×361 | [link](https://hodinarium.eu/projekty/Arduino/) |
| 58 | TOO_SMALL | Motorky z hodinek | `/img/ujete/motorky/file004681066.jpg` | 588×354 | [link](https://hodinarium.eu/sbirka/motorky/) |
| 59 | TOO_SMALL | Elektricky natahované hodiny Ferramo | `/img/elektrika/motore_cmr_1.gif` | 621×640 | [link](https://hodinarium.eu/konstrukce/ferramo/) |
| 60 | TOO_SMALL | Píchačky - kontrolní hodiny - časová razítka | `/img/pichacky/fronta2.jpg` | 640×174 | [link](https://hodinarium.eu/konstrukce/pichacky/) |
| 61 | TOO_SMALL | Hodiny v kostele sv. Josefa v Janovicích | `/img/vezni/janovice/janovice.jpg` | 680×485 | [link](https://hodinarium.eu/virtualni-muzeum/janovice/) |
| 62 | TOO_SMALL | Květinové hodiny v Poděbradech | `/img/podebrady/pohledy1/podebrady031.jpg` | 709×490 | [link](https://hodinarium.eu/virtualni-muzeum/podebrady4/) |
| 63 | TOO_SMALL | Zámek Děčín | `/img/decin/zamek_decin.jpg` | 722×580 | [link](https://hodinarium.eu/sbirka/decin_zamek/) |
| 64 | TOO_SMALL | O Hodináriu | `/img/decin/zamek_decin.jpg` | 722×580 | [link](https://hodinarium.eu/sbirka/o-hodinariu/) |
| 65 | TOO_SMALL | Překlápěčky Köhler & Co, Laufamholz | `/img/listkove/kohler_001.jpg` | 724×500 | [link](https://hodinarium.eu/sbirka/listkove_kohler/) |
| 66 | TOO_SMALL | Timometer – historické americké časové razítko po roce 1903 | `/img/Timometer/f/foto_0008.jpg` | 750×1000 | [link](https://hodinarium.eu/projekty/Timometer/) |
| 67 | TOO_SMALL | Astronomické spínací hodiny — Syst. Fr. Sauter | `/img/astronomicky_Sauter/f/Sauter1.jpg` | 773×738 | [link](https://hodinarium.eu/konstrukce/astronomicke_Sauter/) |
| 68 | TOO_SMALL | Samostavitelné hodiny MOBALine | `/img/Mobatime/HN60IP20.jpg` | 800×800 | [link](https://hodinarium.eu/sbirka/mobatime/) |
| 69 | TOO_SMALL | EVERETT EDGECOMBE ELECTRIC SYNCLOCK | `/img/elektrika/edgecombe/celek.jpg` | 802×960 | [link](https://hodinarium.eu/konstrukce/edgecombe/) |
| 70 | TOO_SMALL | Hodiny NTPH — mikropočítačem řízené hodiny vyrobené 3D tiske… | `/img/3D/magneticke.jpg` | 839×900 | [link](https://hodinarium.eu/projekty/NTPH/) |
| 71 | TOO_SMALL | Hlavní NTP hodiny na bázi ESP8266 pro třídrátový rozvod dle … | `/img/decin/IBM/stroj.jpg` | 892×900 | [link](https://hodinarium.eu/projekty/Arduino_IBM/) |
| 72 | TOO_SMALL | Časový zámek - Time Lock | `/img/decin/casove_zamky/f/T_FOX_a_CO_LTD.jpg` | 898×700 | [link](https://hodinarium.eu/konstrukce/casovy_zamek/) |
| 73 | TOO_SMALL | Virtuální prohlídka muzea v Mindelheimu | `/img/Mindelheim/f/foto_0001.jpg` | 933×700 | [link](https://hodinarium.eu/muzea/mindelheim/) |
| 74 | TOO_SMALL | Stroj Elektročas 1959 | `/img/vez/f/elektrocas1959.jpg` | 1067×800 | [link](https://hodinarium.eu/sbirka/vez_elektrocas1959/) |
| 75 | BORDERLINE | Židovské hodiny z roku 1764 | `/img/zidovske/holmstad_2014_cifernik.jpg` | 1280×853 | [link](https://hodinarium.eu/virtualni-muzeum/zidovske/) |
| 76 | BORDERLINE | Hodiny synchronizované systémem GPS respektive GNSS | `/img/decin/GPS_Sakul/f/GPS_Sakul1.jpg` | 1311×800 | [link](https://hodinarium.eu/projekty/GPS_Sakul/) |
| 77 | BORDERLINE | Zaniklé květinové hodiny v Chomutově | `/img/Chomutov/f/foto_0002.jpg` | 1429×900 | [link](https://hodinarium.eu/virtualni-muzeum/kvetinovehodiny_Chomutov/) |

## Pro kolegy — jak doplnit

1. Najděte lepší zdrojový soubor (skenování, RAW z fotoaparátu, vyšší
   rozlišení z Wikimedia Commons / NPÚ Památkový katalog / archivu spolku).
2. **Buď** nahradit přímo (přepsat soubor v `apps/hodinarium-eu/public/img/...`
   ve stejné cestě jako uvedená) **nebo** poslat e-mailem na info@orloj.eu.
3. Doporučená velikost před uploadem (úspora místa v repu):
   - Hero/full-width: max 2400 px na delší straně, JPEG q85 mozjpeg.
   - Portrét: max 1600 px na delší straně.
4. Po doplnění re-running auditu: `pnpm exec node scripts/audit-hero-images.mjs`
   ukáže, které jsou opravené.

**Zdroje s vyšším rozlišením** (osvědčené):

- **Wikimedia Commons** — Wiki Loves Monuments má často 2000+ px fotky
  památek (Krečmer celní expozitura: jankovcova-6 byla z této akvizice).
- **NPÚ Památkový katalog** — pamatkovykatalog.cz má fotky kulturních
  památek; rozlišení středního kvality (~1500 px), ale autoritativní.
- **NK ČR Digitální knihovna** — historické portréty, ryté grafické
  předlohy.
- **Wikidata** + Commons category linky.

