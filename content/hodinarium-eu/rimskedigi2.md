---
title: "Římské digitálky - tentokrát s Arduinem"
slug: "rimskedigi2"
category: "projekty"
originalUrl: "https://hodinarium.eu/rimskedigi2.htm"
lastModified: "Mon, 04 Apr 2022 09:25:00 GMT"
sourceCharset: "windows-1250"
scrapedAt: "2026-04-27T17:37:10.809Z"
tldr: 'Prosakují zprávy, že se uvažuje o vyřazení římských číslic ze školních osnov. Protože s tímto trendem nesouhlasíme, navrhli jsme římské digitálky nejprve jako script pro tento web (viz níže), následně…'
---
Prosakují zprávy, že se uvažuje o vyřazení římských číslic ze školních osnov. Protože s tímto trendem nesouhlasíme, navrhli jsme římské digitálky nejprve jako script pro tento web (viz níže), následně pak jako exponát pro Hodinárium v Děčíně do části Nonsens. Není to míněno příliš vážně, spíše pro seznámení s možnostmi Arduina a procvičení římských číslic.

## script rimskedigi

Váš prohlížeč nepodporuje prvek video – soubor si stáhněte odsud.

Pro římské digitálky je použito Arduino ESP WEMOS D1. Čas získávají protokolem NTP z WiFi sítě internetu a zobrazuje ho na displeji IIC I2C Display LCD 1602, tedy dvou řádcích a 16 znacích. SW řešení používá knihovnu ESP8266WiFiMulti, která umožňuje zadat více možných přístupových bodů. Vzhledem k plánovanému použití v Hodináriu není doplněna funkce uživatelského zadání jména a hesla k libovolnému AP. Seznam použitelných AP je zadán již při překladu.

Po zapnutí je nejprve zobrazen text "Rimske digitalky", pak nastává pokus o připojení do internetu. Při úspěšném připojení k AP je zobrazeno jeho SSID, síla signálu a přidělené IP. Při čekání na odpověď NTP serveru z poolu "cz.pool.ntp.org" nebo interního GPS NTP serveru Hodinária bliká písmeno "T". Po časové synchronizaci se na prvním řádku římskými číslicemi zobrazuje datum (den.měsíc.rok), v druhém čas ve tvaru hodiny:minuty:sekundy. Bohužel v některých případech je pro zobrazení času potřeba více než 16 znaků. Římské digitálky si v tomto případě vypomáhají tím, že při překročení délky vypíší sekundy arabskými číslicemi. Například XXIII.ILVIII.38. Číslice XXXVIII by se již celá nezobrazila.

## Trocha teorie

Římské číslice se píšou velkými písmeny abecedy: I=1, V=5, X=10, L=50, C=100, D=500, M=1000. Číslice zapisujeme od nejvyšších hodnot k nejnižším: MDL=1550, LX=60, CV=105. Menší číslice před větší znamená odečet: IV = 4, IX = 9, XC = 90.

Při zápisu pomocí římských číslic v podstatě neexistuje žádná směrodatná norma. Obvykle se kombinují nejvýše tři stejné římské číslice (III = 3, XXX = 30). Někdy mohou být kombinovány i čtyři stejné římské číslice (např. IIII = 4 bylo běžné na hodinách, číslo 90 můžeme zapsat LXXXX nebo XC).

Většinou se před vyšší číslicí odečítá pouze jediná římská číslice (jen ojediněle i dvě stejné číslice; např. číslo 18 můžeme zapsat XVIII i XIIX). Pro odčítání se obvykle používají pouze římské číslice I, X, C (římské číslice V, L, D se pro odečítání nepoužívají). Obvykle se také odečítá od znaku téhož nebo nejblíže vyššího řádu, tedy IV, IX, XL, XC, CD, CM. Např. číslo 80 zapíšeme LXXX (nikoli XXC), číslo 95 zapíšeme LXXXXV nebo XCV (nikoli VC), číslo 99 zapíšeme XCIX (nikoli IC).

Číslice I se pro odečítání většinou užívá jen před V a X. Rok 1999 se tedy píše MCMXCIX nebo MCMXCVIIII (nikoli MIM).

Tato teorie je zkráceně převzata z internetové jazykové příručky [https://prirucka.ujc.cas.cz/?id=793](https://prirucka.ujc.cas.cz/?id=793)

![](http://orloj.eu/img/orloje/venecia/f/digitalky1.jpg)

## Použitý HW a SW

-   [ESP8266 ESP-12E OTA WeMos D1 CH340 WiFi](https://dratek.cz/arduino/1457-esp8266-esp-12e-ota-wemos-d1-ch340-wifi.html) Vývojová platforma Espressif založená na ESP-8266EX
-   [IIC I2C Display LCD 1602 16X2 Znaků LCD](https://dratek.cz/arduino/1570-iic-i2c-display-lcd-1602-16x2-znaku-lcd-modul-modry.html)
-   Program (Kdyby si to někdo chtěl snad také vyzkoušet.)

Digitální ukazatel minut na orloji v Benátkách. Číslice se mění v pětiminutovém intervalu.

## Obecněji k tématu

Slovo "digit" je v překladu číslice. Za "digitálky" můžeme považovat všechny hodiny, které čas ukazují čísly, nikoliv tedy hodiny, kdy rafie "plynulým" pohybem ukazují na číslice. První digitální mechanické kapesní hodinky se objevily na konci 19. století. Ve 20. letech 20. století se objevily první digitální mechanické náramkové hodinky.

Existuje i jiné přenesené pojetí, kdy za digitální techniku považujeme vše, co zpracovává "číslicový počítač". Běžně jsou tak označovány i hodinky řízené krystalem, které mají analogový výstup na ručičky. V tomto textu je za digitálky nebudeme považovat.

Na obrázku vpravo je ukazatel minut na orloji v Benátkách. Ukazatel se změní jednou za pět minut. Můžeme ukazatel považovat za digitální

* * *

## Římské odbíjení hodin

Aby kuriozita byla ještě kurióznější doplníme Římské digitálky ještě o "římské odbíjení". Toto odbíjení nemá s Římem nic společného. Je jen pojmenované podle principu římských číslic. Odbíjí se na dva zvony (dva tóny) hlubší znamená římská „V“, vyšší znamení římská „I“. Celé hodiny se odbíjí jako by to byly římské číslice. Místo X jsou dvě V. Tedy posloupnost bití je: I, II, III, IV, V, VI, VII, VIII, IVV, VV, VVI, VVII.

Smysl byl, kromě toho že to bylo zajímavé, menší spotřeba energií, déle vydrželo natažení, bylo třeba méně úderů. Toto odbíjení navrhl anglický hodinář Josepha Knibba ([https://en.wikipedia.org/wiki/Joseph\_Knibb](https://en.wikipedia.org/wiki/Joseph_Knibb)). Následuje několik odkazů na aukční síně:

-   [www.sothebys.com/en/buy/auction/2021/treasures-2/joseph-knibb-a-charles-ii-ebony-roman-striking](https://www.sothebys.com/en/buy/auction/2021/treasures-2/joseph-knibb-a-charles-ii-ebony-roman-striking)
-   [www.sothebys.com/en/auctions/ecatalogue/2012/george-daniels-so-l12313/lot.130.html](https://www.sothebys.com/en/auctions/ecatalogue/2012/george-daniels-so-l12313/lot.130.html)
-   [www.sothebys.com/en/auctions/ecatalogue/2012/george-daniels-so-l12313/lot.131.html](https://www.sothebys.com/en/auctions/ecatalogue/2012/george-daniels-so-l12313/lot.131.html)
-   [www.sothebys.com/en/auctions/ecatalogue/2013/treasures-princely-taste-l13303/lot.12.html](https://www.sothebys.com/en/auctions/ecatalogue/2013/treasures-princely-taste-l13303/lot.12.html)
-   [www.christies.com/en/lot/lot-4973414](https://www.christies.com/en/lot/lot-4973414)
-   Moderní replika
-   [www.horologiumprecision.co.uk/joseph-knibb-reconstruction](https://www.horologiumprecision.co.uk/joseph-knibb-reconstruction)
-   [www.youtube.com/watch?v=Bxg6hyv889s](https://www.youtube.com/watch?v=Bxg6hyv889s)

Na dalším snímku bude realizace se dvěma gongy odvozenými od domovních zvonku bim-bam. Jsou upraveny tak, že každá zvonek vydává jen jeden tón, tedy reprezentuje buď číslici V nebo I. ... připravuje se.....
