---
title: "Časová základna GPS 167"
slug: "inv-A183-casova-zakladna-gps-167"
category: "sbirka"
podsekce: "karta"
originalUrl: "https://hodinarium-eu.pages.dev/sbirka/katalog"
lastModified: null
sourceCharset: "utf-8"
scrapedAt: "2026-05-21T00:00:00.000Z"
manualEdit: true
author: "Český spolek horologický"
tags:
  - vitrina-3-vedlejsi
karta:
  inventarniCislo: "A183"
  umisteni: "Vitrína 3 (Sál elektro)"
  vyrobce: "Meinberg"
  stav: "funkční"
  pohonDetail: "GPS řízený oscilátor (GPSDO)"
---

Základem přijímače je **GPS řízený oscilátor** (GPS disciplined oscillator, GPSDO) — kombinace přijímače GPS a vysoce stabilního oscilátoru, jehož výstup je řízen tak, aby souhlasil se signály družic GPS/GNSS. Modul **GPS167** tak generuje pevné i programovatelné standardní frekvence s nanosekundovou přesností a stabilitou. Generátor poskytuje impulsy za sekundu, minutu a hodinu (synchronizované na sekundu UTC) a volitelně tři programovatelné výstupy; pro odesílání časových řetězců (ASCII telegramy s časem, datem a stavem přijímače) slouží až čtyři sériová rozhraní. Dva vstupy umožňují měřit asynchronní časové události, které se zobrazují na LC displeji a lze je číst přes sériové rozhraní.

Navigační zprávu z družic dekóduje mikroprocesor, určí polohu a kompenzuje zpoždění šíření signálu. Korekce vypočtená z těchto zpráv zvyšuje přesnost teplotně stabilizovaného oscilátoru desky (OCXO) a automaticky kompenzuje jeho stárnutí. Modul využívá službu *Standard Positioning Service* (SPS).
