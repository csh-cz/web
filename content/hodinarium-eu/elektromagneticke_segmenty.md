---
title: "Elektromagnetický sedmi segmentový displej H715 M - BODET"
slug: "elektromagneticke_segmenty"
category: "projekty"
originalUrl: "https://hodinarium.eu/elektromagneticke_segmenty.htm"
lastModified: "Sun, 10 Oct 2021 11:33:00 GMT"
sourceCharset: "windows-1250"
scrapedAt: "2026-04-27T17:37:23.812Z"
---
Sedmi segmentový displej je nejúspornější způsob vyjádření číslic a několika znaků. Většinou se s nimi setkáváme v provedení LED nebo LCD. Mechanické provedení sedmi segmentového displeje ovládané elektromagnety má některé výhody. Na obrázcích vidíme čelní pohled na zobrazenou číslice 6. Na tmavém otočném segmentu je vidět magnet, který pomocí elektromagnetů na posledním obrázku převrátí segment do polohy ON nebo OFF podle polarity impulzu přivedeného do cívky. V klidovém stavu nepotřebuje displej žádné napájení, protože magnet se přitahuje k jádru cívky. To znamená, že napájení je potřebné jen pro změnu stavu. Nožový konektor vpravo dole zajišťuje adresový výběr jednotky.

[!](img/H715_BODET/f/foto_0001.jpg)

[!](img/H715_BODET/f/foto_0002.jpg)

[!](img/H715_BODET/f/foto_0003.jpg)

Jednotky jsou propojeny datovou sběrnicí na kterou řídící jednotka v případě potřeby vyšle data a zároveň adresovacím vodičem určí, pro kterou jednotku je informace určena .

![schema zapojení](/img/H715_BODET/schema1.jpg)

## Hlavní výhody elektromagnetického ovládání displeje

-   výborná čitelnost i při přímém slunečním osvětlení
-   bezúdržbový provoz, spolehlivost testovaná na 70 miliónů přepnutí
-   pozorovací úhel 120 - 140°
-   teplotní rozsah -40 až +70 °C
-   nulová spotřeba v klidovém stavu

## Použití

Jednotky BODET se vyrábějí ve velikostech od 10 do 58 cm. Poměrně jednoduše se instalují pomocí plochého kabelu. Jsou vhodné pro zobrazení např. těchto údajů: kurz nebo cena (čerpací stanice PHM), sportovní tabule s časem / skóre / rychlostí, hmotnost u průmyslových vah, cena pokojů v hotelech, čas a teplota, různá průmyslová měřidla a mnoho dalších...[!](img/H715_BODET/f/foto_0004.jpg)

Pro Hodinárium jsme získali řídící jednotku GEMA ADHT z roku 1998 s teplotním čidlem a třemi zobrazovači H715M. Řídící jednotka je postavena na bázi mikroprocesoru AT89C52. Jednotku jsme nechali přeprogramovat na hodiny ukazující Internetový SWATCH čas. Tento čas jsme zvolili proto, že takových hodin není mnoho a mimo jiné i proto, že postačí zobrazení na 3 místa (původně použitá pro zobrazení teploty). Je to zajímavý způsob měření času. Tvůrcem tohoto konceptu počítání času je známá švýcarská firma [SWATCH](http://www.swatch.com/), která jej poprvé uvedla v roce 1998. Hlavní myšlenkou je odstranit časová pásma a také změny na letní čas - čas je stejný na celé planetě. Můžete si tak domluvit schůzku či telefonní hovor s kýmkoliv na světě, aniž byste složitě přepočítávali časové zóny.

Internet time má tyto vlastnosti: Den (24 hodin) je rozdělen přesně na 1000 stejně dlouhých dílků nazývaných beaty (česky takt nebo třeba tik). Jeden beat představuje 1 minutu a 26,4 sekund. Výhodou ČR je, že jako základ se zvolilo naše časové pásmo SEČ, čili v poledne bude internetový čas @500, o půlnoci @000. Na panelu v Hodináriu je tento exponát od 25.4.2021. Času @625 odpovídá 15:00 SEČ. Na ostatních hodinách je letní čas, tedy 16:00 SELČ.

## Z možností DCF synchronizace zvolena: GPS to DCF 77

Jednotka GEMA ADHT vyžaduje synchronizaci signálem DCF 77. ADHT přijímá čas dvakrát za sebou a rozdíl musí být 1 minuta, což znamená, že se dvakrát za sebou přijal správný čas. Minimální doba nastavení je 2 minuty, spíše však déle. Protože na výstavním panelu je již několik různých zařízení poskytující přesný čas, můžeme zvážit, který způsob by byl nejspolehlivější a zároveň nejzajímavější pro diváky. Shrňme proto možnosti, které se nabízejí u panelu, který je mimo návštěvní dobu vypnutý..

1.  Použít DCF výstup hlavních hodin Mobatime HN 61. Realizace by se tak redukovala na pouhé drátové propojení s hodinami HN61 i když i zde je možná potřeba napěťové přizpůsobení. Hodiny HN 61 jsou na obrázku vlevo dole.

2.  Vlastním DCF přijímačem je základní řešení. Tak byl návrh jednotky ADHT zamýšlen. Na výstavním panelu takové přijímače jsou a možná by šlo k nim jednotku připojit paralelně. Bohužel instalací dalších elektronických zařízení, začíná být okolí zarušeno a není nejvhodnější instalovat další přijímač. Prostě příjem DCF77 v zarušeném prostředí je trochu náladový.

3.  Konvertorem GPS - DCF 77. Taková průmyslová zařízení jsou na trhu ( například [GPS DCF Converter UTC±](https://www.wago.com/cz/p%C5%99%C3%ADslu%C5%A1enstv%C3%AD/gps-dcf-converter-utc%C2%B1/p/2852-7901) ) a některé mají i možnost zvolit pozitivní či negativní logiku a přepnutí varianty výstupu s nebo bez letního času. [Stavebnici takového zařízení](http://www.grother.de/gps-to-dcf77-module.html) jsme použili na panelu č. 5. Konvertor je ve vodorovné poloze na horním rámu panelu.

4.  DCF výstup z NTP serveru. NTP servery jsou hlavním motivem výstavního panelu č. 5. Samostatný DCF převodník nabízí i Mobatime. [NMI síťový MOBALine interface](https://mobatime.cz/obchod/sitovy-interface/) slouží jako síťové rozhraní mezi NTP a MOBALine a DCF. Protože nám postačí jen DCF interface, můžeme sáhnout k levnějšímu řešení od firmy [Papouch store s.r.o](https://papouch.com/dcf-simulator-generator-signalu-dcf77-p2685/).. Výhodou [sestavy NTP serverů](/clanky/decin_NTP) je to, že sami mají dva zdroje času a to Internet a GPS. Při instalaci jsme předpokládali použít zapůjčené zařízení od firmy Papouch storte s.r.o. Zařízení je namontováno na panelu pod žlutými hodinami. Bohužel jsme nenašli způsob, jak u tohoto zařízení odstranit přechod na letní čas, který je pro řízení panelu Swatch time nevhodné. Musíme tedy s připojením počkat, až bude střídání časů zrušeno.

Pro současný stav panelu zatím zvolíme variantu číslo 3., tedy konvertor informace z GPS na DCF 77.

## Odkazy

-   [Prospekt H715](https://cdn.sos.sk/productdata/c0/63/d407ac85/h-715-yellow.pdf) (jiná konstrukce)
-   [Řídící jednotka](http://mrk.eu/discon-h7-display-controller/) Discon-H7 (na stránce je i video z rozebírání jednotky sedmisegmentového displeje trochu jiné konstrukce.)
-   [Prodej](https://www.soselectronic.cz/articles/no-name/displej-citelny-za-kazdych-svetelnych-podminek-916)
-   [Prospekt jednotky GEMA ADHT](download/ADHT/Doc/ADHTpopis_zapojeni.doc)

Text a řešení panelu: Petr Král
