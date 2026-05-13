---
title: "Meinberg NTP LANTIME M100 GPS (ELX)"
slug: "lantime-m100"
category: "projekty"
tags:
  - ntp-rizeno
  - gps-rizeno
  - krystal
  - meinberg
originalUrl: "https://hodinarium.eu/Lantime_M100.htm"
lastModified: "Mon, 01 Feb 2021 01:21:00 GMT"
sourceCharset: "windows-1250"
scrapedAt: "2026-04-27T17:36:29.659Z"
tldr: 'Nejmenší NTP server řady Meinberg LANTIME postavený na průmyslovém PC s Linuxem a upraveným ntpd. GPS synchronizace včetně PPS pulzů, jediný ethernetový port. V roce 2021 neúspěšný pokus o aukční pořízení do expozice.'
---
![Panel Lantime M100](/img/decin/NTP_Meinberg/panelM100.jpg)


Společnost Meinberg Funkuhren GmbH & Co. KG byla založena v roce 1979 Wernerem a Günterem Meinbergem a nyní je moderní průmyslovou společností. Více než 100 zaměstnanců pracuje na vývoji a výrobě elektronických modulů a systémů pro časovou a frekvenční synchronizaci.

Společnost Meinberg dnes nabízí širokou škálu rádiových hodin DCF77, přijímačů GPS, karet IRIG a souvisejícího příslušenství. Tyto sestavy a moduly jsou základem pro složité systémy, které lze dodávat jako sériová zařízení nebo řešení specifická pro zákazníka. Úspěšné časové servery LANTIME NTP jsou příkladem inovativní produktové politiky, která se soustavně orientuje na potřeby trhu v neustále se rozvíjející oblasti síťových technologií.( Převzato z materiálů firmy.)

Do expozice Hodinária jsme v roce 2021 chtěli zakoupit v aukci starší a nejjednodušší model NTP serverů Meinberg - LANTIME M100. Bohužel neúspěšně.

Všechny NTP servery Meinberg jsou založené na miniaturním průmyslovém PC třídy Pentium s operačním systémem Linux a používají upravenou variantou open-source ntpd. Model M100 má jeden ethernetový port a k hlavní časové synchronizaci používá GPS přijímač včetně příjmu PPS pulzů. Bohužel je schopen přijímat jen družice Novastar GPS, má tedy trochu nevýhodu proti modelům přijímající i ostatní družice. Server může využít i údaje z externích NTP serverů nebo nějako dobu pracovat bez synchronizace díky přesnému vnitřnímu oscilátoru. Více o [oscilátorech](https://www.meinbergglobal.com/english/specs/gpsopt.htm) a jejich přesnostech na stránkách firmy.

Jiné modely mají možnost přijímat časovou informaci z DCF77, GPS, GLONASS, Galileo, IRIG-A/B či jako řetězec na RS-232, PPS, .. Rovněž výstupy mohou být třeba řetězec na RS-232 (v několika různých formátech a s volitelnou rychlostí UARTu), NTP na Ethernetu, PTP na Ethernetu, pulse per second, pulse per minute, stabilní frekvence na rozhraní TTL (100 kHz, 1 MHz, 10 MHz, volně programovatelný syntezátor), generovaný signál IRIG-A/B, generovaný signál DCF77, normalizovaný signál GPS (vzniklý analogovou konverzí mezifrekvenčního vstupu 35 MHz zpět do základního pásma), "telekomikační" výstupy pro PDH/SDH, synchronizační signály pro studiovou audio a video techniku. [Podrobněji zde](http://support.fccps.cz/download/Meinberg/prehled/mbg-vystupy.htm).

Model LANTIME M100 PS (ELX) je nejmenším ze NTP serverů firmy a je v možnostech omezen. Přesto by byl nejsilnějším článkem na panelu našich NTP serverů. Šíře nastavovacích možností na ilustračním obrázku webového přístupu ukazuje množství funkcí tohoto modelu. Server dále vytváří různé statistiky chodu a umožňuje chod monitorovat.
[![Ovládací web zařízení](/img/decin/NTP_Meinberg/M100_web_control_m.jpg)](/img/decin/NTP_Meinberg/M100_web_control.jpg)

## Odkazy

- [Oficiální web Meinberg](https://www.meinberg.de/) — meinberg.de. [cit. 2026-04-28]
- [Manuál](https://www.meinbergglobal.com/english/products/rail-mount-ntp-server.htm) — meinbergglobal.com. [cit. 2026-04-28]
- [Produkty Meinberg](http://support.fccps.cz/download/Meinberg/prehled/meinberg-prehled.htm) — support.fccps.cz. [cit. 2026-04-28]
- [O přesnosti](http://support.fccps.cz/download/Meinberg/prehled/meinberg-presnosti.htm) — support.fccps.cz. [cit. 2026-04-28]
- [Různé výstupní možnosti NTP serverů](http://support.fccps.cz/download/Meinberg/prehled/mbg-vystupy.htm) — support.fccps.cz. [cit. 2026-04-28]
- [o oscilátorech](https://www.meinbergglobal.com/english/specs/gpsopt.htm) — meinbergglobal.com. [cit. 2026-04-28]
- [Podrobnosti o DCF](http://support.fccps.cz/download/Meinberg/prehled/DCF77.htm) — support.fccps.cz. [cit. 2026-04-28]
- [Vybraná témata technické podpory FCC PS](http://support.fccps.cz/) — support.fccps.cz. [cit. 2026-04-28]
- [Zajímavá úvaha o redundatních zdrojích času](http://support.fccps.cz/download/Meinberg/prehled/mbg-redundance.htm) — support.fccps.cz. [cit. 2026-04-28]
