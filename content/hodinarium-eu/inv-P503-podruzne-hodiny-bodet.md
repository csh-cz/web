---
title: "Podružné hodiny Bodet"
slug: "inv-P503-podruzne-hodiny-bodet"
category: "sbirka"
podsekce: "karta"
imageCredit: "Archiv Petra Krále (hodinarium.eu)"
originalUrl: "https://hodinarium-eu.pages.dev/sbirka/katalog"
lastModified: null
sourceCharset: "utf-8"
scrapedAt: "2026-04-30T04:12:37.532Z"
manualEdit: true
author: "Český spolek horologický"
tldr: 'Analogové NTP podružné hodiny Bodet Profil 930 NTP — synchronizované po LAN protokolem NTP (Broadcast) a napájené přes PoE; součást ukázky sítě jednotného času na Panelu 5.'
references:
  - title: "Bodet Profil 930/940 NTP — návod podružných hodin"
    url: "/download/NTP/Analogue_clocks_Profil930-940NTPSlaveClockInstructions.pdf"
    type: pdf
tags:
  - panel-5
  - funkcni
  - bodet
  - jednotny-cas
  - ntp-rizeno
  - elektricke
  - 2000s
karta:
  inventarniCislo: "P503"
  umisteni: "Panel 5"
  vyrobce: "Bodet"
  pridanoDoSbirky: "2020"
  majitel: "zápůjčka"
  vztahKeSbirce: "zápůjčka"
  stav: "funkční"
  extra:
    - { label: "Typ", value: "Profil 930 NTP" }
    - { label: "Synchronizace", value: "NTP (Broadcast) po LAN" }
    - { label: "Napájení", value: "PoE 48 V ze switche" }
thumbnail: '/img/elektrika/Bodet/Profil930NTP.png'
---

![Podružné hodiny Bodet Profil 930 NTP](/img/elektrika/Bodet/Profil930NTP.png)

Analogové [podružné hodiny](/slovnik/podruzne-hodiny) Bodet **Profil 930 NTP** zastupují v expozici nejmodernější způsob šíření časového signálu — po síti LAN (Ethernet) protokolem NTP. Hodiny očekávají, že do sítě, do které jsou připojeny, přicházejí NTP pakety (Broadcast) na adresu z rozsahu 239.192.54.xx; poslední část adresy i časové pásmo se nastavují DIP přepínači přímo na hodinách. Po témže LAN kabelu jsou hodiny i napájeny napětím 48 V (PoE) ze switche.

Po připojení napájení hodiny zaujmou klidovou polohu (12:00, 4:00 nebo 8:00) a vyčkávají na příchod několika NTP paketů s časovou informací; poté se během několika minut nastaví na správný čas. Mají dva motory — sekundová ručička se nastavuje samostatně, minuty a hodiny současně. Bez NTP signálu jdou autonomně přibližně 24 hodin, pak se vrátí do polohy 12:00.

Technické řešení celé sítě jednotného času v expozici (NTP server na bázi MikroTiku, GPS-NTP server i demonstrační monitor) popisuje článek [Instalované NTP servery](/konstrukce/decin-ntp).

![podružné hodiny Bodet Profil 930 NTP v expozici Hodinária — pohled č. 1 z 4](/img/H715_BODET/foto_0001.jpg)

![podružné hodiny Bodet Profil 930 NTP v expozici Hodinária — pohled č. 2 z 4](/img/H715_BODET/foto_0002.jpg)

![podružné hodiny Bodet Profil 930 NTP v expozici Hodinária — pohled č. 3 z 4](/img/H715_BODET/foto_0003.jpg)

![podružné hodiny Bodet Profil 930 NTP v expozici Hodinária — pohled č. 4 z 4](/img/H715_BODET/foto_0004.jpg)

![Schéma zapojení podružných hodin Bodet](/img/H715_BODET/schema1.jpg)
