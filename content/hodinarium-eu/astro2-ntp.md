---
title: Astronomické hodiny z čínské stavebnice meteostanice
slug: astro2-ntp
category: projekty
tags:
  - ntp-rizeno
  - diy
tldr: 'Přeprogramování čínské meteostanice (ESP01S, OLED) na astronomicko-astrologický displej zobrazující efemeridy Slunce a Měsíce, planetní hodiny, staročeský čas i computus včetně data Velikonoc.'
author: Petr Král
manualEdit: true
imageCredit: "Archiv Petra Krále (hodinarium.eu)"
originalUrl: https://hodinarium.eu/astro2_NTP.htm
lastModified: Sun, 05 Oct 2025 18:07:00 GMT
sourceCharset: windows-1250
scrapedAt: 2026-04-27T17:37:20.757Z
---

![Čínská stavebnice meteostanice](/img/astro2/meteo.jpg)

Základem těchto astronomicko-astrologických hodin je čínská stavebnice meteostanice podobná té na obrázku. Řídí jí modul ESP01S. který výsledky výpočtů zobrazuje na OLED displeji. Bohužel stavebnice nebyla softwarově snadno lokalizovatelná, takže ukazovala jen čas v Číně a pro zobrazení počasí bylo potřeba se zaregistrovat na Čínském serveru počasí, což jsem neudělal. Koupil jsem si proto programovací adaptér na modul ESP10S a s částečnou pomocí AI jsem nově naprogramoval astronomicko-astrologické hodiny, které nyní zobrazující kromě **aktuálního času a data** i další údaje na šesti pravidelně se střídajících stránkách.

- **O Slunci**
    - dobu východu a západu Slunce
    - odchylku pravého slunečního času pro zadanou lokalitu
    - staročeský čas
    - planetní hodinu (denní i noční)
    - ekliptikální znamení
    - obzorníkové souřadnice (azimut a výšku)
- **O Měsíci**
    - dobu východu a západu Měsíce
    - slovní vyjádření fáze s rozlišením na osm poloh
    - stáří měsíce ve dnech
    - osvětlení v %
    - ekliptikální znamení
    - obzorníkové souřadnice
- **Výpočty dle Computu**
    - platné nedělní písmeno
    - zlatý počet
    - epakta
    - datum Velikonoční neděle v tomto roce

## O přesnosti

Pro menší kapacitu modulu ESP10S byly voleny zjednodušující výpočty. Základem je knihovna SunMoonCalc (Copyright (c) 2018 by ThingPulse Ltd., https://thingpulse.com). Tato knihovna poskytuje i další zatím nepoužité výstupy, jako je třeba moon.brightLimbAngle a pod..

Uvádí se, že použitá knihovna používá zjednodušený algoritmus pro výpočet východu a západu Slunce i Měsíce. Přesnost této knihovny je obecně dostatečná pro běžné potřeby, jako jsou meteostanice, displeje nebo informativní zobrazení času východu a západu obou těles. Obvyklá odchylka je ±1 až 3 minuty vůči přesnějším výpočtům (např. algoritmus NOAA, nebo výpočty podle Jean Meeus). Pro Měsíc je přesnost horší.

Přesnost závisí na: zeměpisné šířce a délce – v rovníkových oblastech je přesnější než u pólů, dále na datu – u některých dnů v roce (zejména blízko rovnodenností nebo slunovratů) se odchylka může zvýšit a nepočítá se s nadmořskou výškou, refrakcí, ani s topografií (např. kopec nad obzorem).

## Připojení k WiFi:

![Astro2 nastavovací web](/img/astro2/Astro2_web.jpg)

Základem výpočtu je čas a datum. Hodiny potřebují získat čas z internetu ze serverů pool.ntp.org. Program obsahuje seznam několika známých přístupových bodů (jméno, heslo) a jeden uživatelsky zadávaný AP. Vše potřebné se zadává po připojení na WiFi s SSID ASTRO2 z webu na http://192.168.4.1. (Pozor, nepoužívat zabezpečené připojení, aplikovaný SW ho neumí, tedey nikoliv https://192.168.4.1 ) Případně můžete u prohlížečů vypnout volbu: Vždy používat zabezpečené připojení. (Například Chrome vypnout _Settings → Privacy and security → Security_ →_Always use secure connections_; Firefox: vypnout _Preferences → Privacy & Security → HTTPS-Only Mode atd.._ )

Nastavovací web spustíte metodou dvojitého zapnutí. Pokud během prvních 5 sekund po prvním připojení napájení, hodiny vypnete a znovu zapnete, budou hodiny pouze nabízet nastavovací web. Na displeji se objeví " ASTRO2 192.168.4.1 " Připojíte se (viz výše) a nastavíte jméno a heslo WiFi a zeměpisnou délku a šířku lokality ve stupních až na 4 desetinná místa. Nastavení ukončíte volbou Uložit + Restart. Po restartu se hodiny pokusí připojit k zadané síti. Po 15 minutách případné nečinnosti nastavovacího webu, hodiny přejdou do normálního chodu. Nastavovací web v normálním chodu není k dispozici.

Pozor, napájecí konektor není C.
  _Text i program vznikly s pomocí AI._
