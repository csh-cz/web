---
title: "Time slider Spilka"
slug: "inv-A260-time-slider-spilka"
category: "sbirka"
podsekce: "karta"
originalUrl: "https://hodinarium-eu.pages.dev/sbirka/katalog"
lastModified: null
sourceCharset: "utf-8"
scrapedAt: "2026-05-21T00:00:00.000Z"
manualEdit: true
author: "Český spolek horologický"
references:
  - title: "Hans Andersson — Time Slider (návod, Instructables)"
    url: "https://www.instructables.com/Time-Slider"
    type: odkaz
tags:
  - volne-vedlejsi
karta:
  inventarniCislo: "A260"
  umisteni: "Volně (Sál elektro)"
  vyrobce: "Jiří Spilka"
  stav: "funkční"
---

Kuriózní hodiny vytvořené 3D tiskem s osmi krokovými motorky řízenými deskou **Arduino Mega** vyrobil podle návodu **Hanse Andersona** pan **Jiří Spilka**. Oživení a drobné rozšíření programu o rozpoznání letního času provedl pan Petr Král.

Původní řešení nemá uživatelskou možnost přesného nastavení času do modulu **RTC DS3231** (udávaná nepřesnost je 1 minuta za rok; nastavit je třeba i po výměně baterie). Autor k tomu sdílí prográmek, který do RTC nastaví čas zadaný při překladu — to však příliš přesně nejde.

Nejprve se uvažovalo o simulaci RTC modulu pomocí *Lolin D1 mini* s NTP klientem (umožnila by nastavení na SEČ včetně letního času), zprovoznit ji se ale nepodařilo. Proto byl zvolen jiný postup — „přípravek" pro externí nastavení NTP času do modulu DS3231: nastavovací program je nahrán do desky **Wemos D1**, do jejíchž dutinek (SDA, SCL, GND) lze DS3231 přímo zasunout; přivést je třeba jen napájení 3,3 V. Nastavovaný čas je GMT (bez letního času), úprava na SE(L)Č se provádí až v programu Time Slider.
