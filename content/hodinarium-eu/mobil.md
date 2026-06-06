---
title: "\"Hodinky\" v mobilu"
author: "Petr Král"
slug: "mobil"
category: "projekty"
tags:
  - digi
  - gps-rizeno
  - ntp-rizeno
  - 2000s
  - popularizace
originalUrl: "https://hodinarium.eu/mobil.htm"
lastModified: "Wed, 26 Apr 2017 13:40:00 GMT"
sourceCharset: "windows-1250"
scrapedAt: "2026-04-27T17:36:47.608Z"
tldr: 'Reflexe nad přesunem čtení času z hodinek do mobilních telefonů — synchronizace NTP a GPS, automatický letní čas a Java aplikace WTime jako příklad rozšířených časoměrných funkcí.'
---
Trochu s povzdechem na první stránce tvrdíme, že dnes se čas měří více mobilem než hodinkami. Zdá se nám, že je to trochu škoda. Ovšem doba je dnes mobilní. Mobilů je snad víc než lidí. Proto i Virtuální muzeum hodin musí mobilům věnovat alespoň zmínku.

Asi každý mobil nějakým způsobem čas zobrazit umí. Nejčastěji v digitální formě ve 24 hodinovém formátu. Analogové zobrazení hodin se na dá mnohdy nastavit jako "šetřič obrazovky" i na starších typech. Alespoň můj postarší Siemens A55 to dokáže. Nové mobilní telefony s podporou programování vytvářejí prostor pro velmi zajímavá řešení hodin. Shrňme to ( naplatí pro všechny telefony):

- Telefon si umí pamatovat čas i po vyjmutí baterie.
- Telefon je schopen synchronizovat čas se sítí, Internetem či podle GPS. Přesnost zobrazení času pak odpovídá atomovým hodinám.
- Telefon umí automaticky přepínat letní čas.
- Telefon umí používat externí programy pro časové funkce. Nabídka aplikací se stále rozšiřuje zejména pro Android.

Nás zajímá hlavně poslední bod. Nabídka programů je značně široká a stále se vyvíjí. Na této stránce proto uvedeme jen jeden starší příklad. Jedná se o program WTime Jde o Java aplikaci sloužící jako kompas, zobrazení světových časů a dalších informací. Dejme raději slovo autorovi:

### Program WTime (J2ME):

- Čas pro více než 90 světových metropolí přehledně na mapě světa.
- Kompas pomocí Slunce a Měsíce (pro Měsíc zobrazuje i fázi).
- Veškeré informace o Slunci (východ, západ, azimut, výška nad obzorem, čas soumraku...
- Mnoho informací o Měsíci, Fáze (obrázkem i procentuálně), výška, azimut, východ, západ.
- Přesný čas z internetu (pomocí protokolu NTP můžete stáhnout přesný čas).
- Nastavení hodinek (hodin...) pomocí časového zvukového signálu.
- Svou pozici mimo určování souřadnic můžete určit jednoduše pomocí zadání místa na mapě světa.

!

!!

!!

!

Z popisu i obrázků je zřejmé, že toho umí dost a dost.
