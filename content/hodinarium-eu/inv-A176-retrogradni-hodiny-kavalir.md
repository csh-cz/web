---
title: "Retrográdní hodiny Kavalír"
slug: "inv-A176-retrogradni-hodiny-kavalir"
category: "sbirka"
podsekce: "karta"
imageCredit: "Archiv Petra Krále (hodinarium.eu)"
originalUrl: "https://hodinarium-eu.pages.dev/sbirka/katalog"
lastModified: null
sourceCharset: "utf-8"
scrapedAt: "2026-05-21T00:00:00.000Z"
manualEdit: true
author: "Český spolek horologický"
tldr: 'Retrográdní „chronulátor" konstrukce Kavalíra — pět sovětských ručkových voltmetrů řízených Arduinem (RTC DS3231) zobrazuje den, hodiny, minuty, sekundy a teplotu.'
references:
  - title: "Retrográdní hodiny — podrobný popis konstrukce"
    url: "https://bastlirna.hwkitchen.cz/retrogradni-hodiny/"
    type: odkaz
tags:
  - vitrina-3-vedlejsi
  - kuriozita
  - diy
  - elektricke
  - krystal
  - 2000s
  - decin
karta:
  inventarniCislo: "A176"
  umisteni: "Vitrína 3 (Sál elektro)"
  vyrobce: "Kavalír"
  datace: "2016"
  majitel: "Kavalír"
  vztahKeSbirce: "zápůjčka"
  stav: "funkční"
  rokVyroby: "2016"
---

![Retrográdní hodiny „chronulátor" konstrukce Kavalír](/img/decin/chronulator/ret1.jpg)

Slovem **chronulátor** se označují hodiny, které čas ukazují pomocí soustavy ručkových voltmetrů. Nejjednodušší chronulátor má dva voltmetry — jeden ukazuje hodiny, druhý minuty. Možností je ovšem více. Tento exponát byl do Hodinária zařazen v průběhu roku 2016.

## Konstrukce Kavalír

Pro Hodinárium zkonstruoval [Kavalír](/hodinari/kavalir) **[retrográdní](/kroky/retrogradni-zobrazovani)** hodiny z voltmetrů pocházejících z aukce na Aukru — jde o měřidla ze sovětského servisního přístroje asi z padesátých let. Díky pěti voltmetrům mohou ukazovat mnohem více údajů. Voltmetry byly doplněny ovládací elektronikou s mikroprocesorem a namontovány do nové skříně. První voltmetr ukazuje den v týdnu, druhý hodiny, třetí minuty, čtvrtý sekundy a poslední teplotu.

![Pět voltmetrů — den, hodiny, minuty, sekundy, teplota](/img/decin/chronulator/ret5.jpg)

Srdcem retrográdních hodin je modul reálného času DS3231 (výrobce uvádí přesnost ±2 ppm v rozsahu 0–40 °C, tedy asi 5 vteřin za měsíc). Čas z modulu je čten mikroprocesorem Arduino-Uno přes sběrnici I²C, převeden pomocí PWM regulátorů na napětí a přiveden na voltmetry. Čas lze nastavit přes USB z PC, pro běžnou korekci slouží tlačítko nulující sekundy; letní čas se přepíná automaticky softwarově. Hodiny jsou napájeny zdrojem 7,5 V DC, při výpadku je čas zálohován baterií CR2032 — voltmetry sice neukazují, ale po obnovení napájení ukazují správný čas.

![Hodinový číselník s dvanáctkou uprostřed (od 6 do 6 hodin)](/img/decin/chronulator/ret7.jpg)

Hodinový číselník má dvanáctku uprostřed a poněkud neobvykle ukazuje od 6 do 6 hodin (na obrázku pondělí, 1 hodina 5 minut). Tyto kuriózní hodiny dokazují, že pro unikátní funkci lze kombinovat různé technologie.
