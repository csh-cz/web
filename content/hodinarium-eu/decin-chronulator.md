---
title: "Chronulátor"
slug: "decin-chronulator"
category: "sbirka"
tags:
  - kuriozita
  - decin
  - diy
  - 2000s
originalUrl: "https://hodinarium.eu/decin_chronulator.htm"
lastModified: "Thu, 26 Aug 2021 12:05:00 GMT"
sourceCharset: "windows-1250"
scrapedAt: "2026-04-27T17:36:11.443Z"
tldr: 'Retrográdní zobrazení času pomocí soustavy pěti sovětských ručkových voltmetrů; mikroprocesor Arduino-Uno převádí údaj z RTC modulu DS3231 přes PWM na výchylku ručky.'
---
Slovem chronulátor se označují hodiny, které čas ukazují pomocí systémů ručkových voltmetrů. Nejjednodušší chronulátor má dva voltmetry. Jeden ukazuje hodiny, druhý minuty. Možností je ovšem více. Do Hodinária bude zařazen v průběhu prázdnin 2016.

## Chronulátor konstrukce Kavalír

Pro Hodinárium byly zkonstruovány a vyrobeny **[retrográdní](/kroky/retrogradni-zobrazovani)** hodiny z voltmetrů pocházejícím z aukce na Aukru. Díky pěti voltmetrům mohou ukazovat mnohem více údajů. Voltmetry pocházející ze sovětského servisního přístroje asi z padesátých let. Doplněna byla ovládací elektronika s mikroprocesorem a voltmetry byly namontovány do nové skříně.

![chronulátor konstrukce Kavalír](/img/decin/chronulator/ret1.jpg)

První voltmetr ukazuje den v týdnu, druhý hodiny, třetí minuty a čtvrtý sekundy. Poslední voltmetr ukazuje teplotu.

![chronulátor konstrukce Kavalír](/img/decin/chronulator/ret5.jpg)

Srdcem retrográdních hodin je modul hodin reálného času DS3231. Výrobce uvádí přesnost ±2ppm od 0°C do +40°C což je asi 5 vteřin za měsíc. Čas z modulu je čten mikroprocesorem Arduino-Uno přes sběrnici I2C. Časové údaje jsou převedeny pomocí PWM regulátorů na napětí a to je přivedeno na voltmetry. Čas se dá nastavit přes USB z PC. Pro běžnou korekci je určeno tlačítko, které vynuluje sekundy. Letní čas je nastavován automaticky softwarově. Hodiny jsou napájeny zdrojem 7.5 V DC. Při výpadku napájení je časový údaj zálohován baterii CR2032. Bez napájení voltmetry neukazují, ale po obnovení ukazují správný čas.

![chronulátor konstrukce Kavalír](/img/decin/chronulator/ret7.jpg)

Hodinový ciferník má dvanáctku uprostřed a poněkud neobvykle ukazuje od 6 do 6 hodin. Na obrázku je pondělí, 1 hodina 5 minut.

Tyto kuriózní hodiny dokazují, že pro unikátní funkci lze kombinovat různé technologie. Poměrně širokou škálu různých řešení můžete vyhledat třeba na slovo "[chronulator](https://www.google.cz/search?q=Chronulator&source=lnms&tbm=isch&sa=X&ved=0ahUKEwjfgoWq9ZXOAhUIKsAKHeGbB9cQ_AUICCgB&biw=1353&bih=652&dpr=0.9#imgrc=_)".

Podrobnější popis [https://bastlirna.hwkitchen.cz/retrogradni-hodiny/](https://bastlirna.hwkitchen.cz/retrogradni-hodiny/)
