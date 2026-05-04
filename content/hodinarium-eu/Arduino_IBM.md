---
title: "Hlavní NTP hodiny na bázi ESP8266 pro třídrátový rozvod dle IBM"
slug: "Arduino_IBM"
category: "projekty"
originalUrl: "https://hodinarium.eu/Arduino_IBM.htm"
lastModified: "Sun, 05 Oct 2025 10:30:00 GMT"
sourceCharset: "windows-1250"
scrapedAt: "2026-04-27T17:37:10.187Z"
tldr: 'Elektronika je stále výkonnější a levnější. I elektronické hodiny jsou stále přesnější, případně synchronizované dle DCF 77, GPS, sítě mobilních operátorů nebo z Internetu.…'
---
![Stroj podružných hodin IBM Internacional](/img/decin/IBM/stroj.jpg)

Elektronika je stále výkonnější a levnější. I elektronické hodiny jsou stále přesnější, případně synchronizované dle DCF 77, GPS, sítě mobilních operátorů nebo z Internetu. Pomalu ztrácí význam řešit sítě jednotného času na bázi rozvodů polarizovaných či stejnosměrných impulzů. Přesto jsou místa, kde takové sítě jsou vhodné.

Dnes se někdejší "fabrické hodiny" stále častěji stávají cílem sběratelů. Lze občas získat i podružné hodiny pro třídrátový rozvod systému IBM (INTERNATIONAL) původně řízené poměrně složitějšími elektromechanickými kyvadlovými hodinami. Hlavní hodiny IBM se však na trhu se starožitnostmi tak často neobjevují, proto jsou někdy "třídrátové" podružné hodiny připojovány na dvoudrátový rozvod, čímž ztratí schopnost částečného seřízení a jejich hlavní přednost je tak degradována. (Více na stránce [Třídrátový rozvod IBM](/clanky/decin_regulaceIBM). ) Na fotografii stroje jsou vidět přepínací vačky 59. minuty mezi dráty A a B.

Přistoupili jsme k vývoji co nejlevnější varianty elektronických hlavních hodin na bázi ESP8266 i pro třídrátový rozvod hodin INTERNATIONAL. **[Řešení je odvozeno od NTP impulzeru pro polarizované pulzy.](/clanky/Arduino)**

## Základní parametry hlavních hodin pro třídrátové řešení IBM - NTP impulser IBM

-   Podružné hodiny systému IBM normálně reagují na stejnosměrné impulzy po vodiči A. V své 59. minutě přepnou na vodič B. Umožní tak částečné seřízení na celou hodinu viz tabulka níže. Velká výhoda systému je, že drobné chyby (do 15 minut) v nastavení jednotlivých hodin se v každou celou hodiny ztotožní se skutečným časem. Podrobněji [na stránce těchto hodin](/clanky/decin_regulaceIBM).
-   Časová synchronizace zajištěna NTP klientem na WiFi. Pro získání času musí být prvotně modul připojený do internetu. Do vypnutí může modul udávat čas s nižší přesností autonomně.
-   Pracovní napětí linek 24 V. Maximální příkon linky 25 W; je možné připojit cca 20 podružných hodin.
-   Automatické přepnutí na letní čas (Možnost trvale zvolit GMT.)
-   Ukládání nastaveného času linky do EEPROM paměti pro restart po výpadku.
-   Nouzové ruční nastavení času podružných hodin tlačítkem rychlého chodu FAST. (Normální je zadat reálný stav podružných hodin linky na vnitřním webu.) Při startu modulu lze tímto lačítkem vyvolat stav PANIKA, kdy se modul nepokouší připojit do internetu a na vlastním webu umožňuje vybrat WiFi a zadat heslo. (Pokusy o připojení se zastaví, protože při neúspěšných pokusech k připojení nestačí mohul obsluhovat web a nelze připojení zadávat.)
-   Komunikace s modulem prostřednictvím vnitřního webu. K webu se připojíte pomocí vlastního WiFi modulu nebo z místní sítě LAN. Wifi modul se hlásí jako síť se jménem obvykle NTP...něco a MACadresa vysílače. Web je na IP 192.168.4.1 nebo po připojení do sítě na IP, které poskytl AP. Nastavovací web je chráněn heslem.Vybrat lze wifi, zadat heslo sítě, ke které se modul připojuje a nastavit základní parametry jako jsou čas zobrazený na podružných hodinách linky pro automatické seřízení linky. Web také zobrazuje posledních 25 řádek protokolu chodu. Parametry, které lze zvolit jsou tyto: SE(L)Č/GMT, 12:00/24:00, STOP chodu, délka pulzu a minimální mezery při rychlém chodu \[v rozsahu 75 - 4000 ms\].
-   Pro možnost dálkového sledování je připraven externí monitor.

1\. až 50. minuta

minutové impulsy po vodičíchAiB

normální chod

51\. až 59. minuta

minutové impulsy pouze po vodičiA

zastavení předbíhajících se hodin

59.minuta

15 impulsů po vodičiA

dokrokování zpožděných hodin

60\. minuta a dál

minutové impulsy po vodičíchAiB

normální chod

## Webové rozhraní [popsáno na stráne hlavních hodit pro polarizované impulzy](/clanky/Arduino)

![Halvní volby](/img/arduino/web_IBM.jpg)

![volba WiFi](/img/arduino/web_IBM2.jpg)![parametry](/img/arduino/web_IBM3.jpg)

![Ipulzer IBM_EEPROM verze 2](/img/arduino/E/NTPimpulzerIBM2.jpg)

## Rozdíly HW v NTP impulzeru pro verzi pro polarizované impulzy

HW verze 2 je rozšířen o modul s EEPROM a o stepdown zdroj 5 V. Tyto úpravy byly vyvolány zkušenostmi z provozu. Zamezují náhodné ztrátě dat při zakmitání napájecího napětí během startu a značně omezují zahřívání výkonového modulu, kde není využíván 5 V zdroj. Naopak byl sjednocen HW pro polarizované pulzy a pro stejnosměrné pulzy ala IBM.

Pro třídrátový rozvod je použit jiný řídící program. Protože se nepoužívají polarizované impulzy, není výkonný modul použit jako dva H můstky, ale jako dvojice zesilovačů. Tří drátová linka je v tomto případě připojena A drátem na OUT1, B drátem na OUT4 a společným C drátem na OUT 2 nebo OUT3 !!.

Konkrétně:

-   GPIO 12 - zelená LED - OUT1 - drát A
-   GPIO 13 - modrá LED - OUT4 - drát B
-   OUT2 nebo OUT3 - drát C

## Rozdíly SW pro ESP8266

Rozdíly se týkají zejména výstupní oblasti. V obou variantách jde zvolit formát času 12/ 24 hodin. Modrá a zelená barva RGB LED nyní zobrazuje aktivitu na drátech A a B. Většinou obě diody svítí současně, protože od 1. do 50. minuty se vysílají oba pulzy současně.

Hlášení stavu se lehce liší:

-   GOAB = Normální chod, impulzy po obou drátech
-   GOA\_ = Impulzy pouze po drátu A - zastavení předbíhajících se hodin od 45 minuty
-   GOAA = Rychlé pulzy po drátu A v 59. minutě
-   FAST = Rychlý krok celé linky (po obou drátech) pro dosažení aktuálního času po výpadku.
-   WAIT = Čekání, až aktuální čas dosáhne stavu linky. Používá se maximálně pro odchylku do 61 minut. (Při konci letního času se čeká.)
-   STOP = Linka je zastavena povelem. Slouží například ke změně topologie linky, ručnímu seřízení a pod.

Červená RGB LED značí zastavení. V normálním stavu jednou za minutu krátce blikne. Rychlé blikání červené LED značí stav PANIKA, kdy není dosaženo počáteční připojení k internetu. (Stav PANIKA lze vyvolat stiskem tlačítka při zapnutí napájení. ) V tomto stavu je potřeba se připojit k wifi impulzeru a na IP adrewse 192.168.4.1. nastavit funkční připojení. Úspěšné připojení signalizuje malá modrá LEDka. Při ztrátě připojení během provozu, malá modrá LEDka zhasne, ale hodiny fungují dál.

V rámečku vlevo je externí monitor reálného provozu NTP impulzeru v Hodináriu. Pro snadnější identifikaci je zobrazena MAC i přidělená IP adresa, ačkoliv tato IP adresa je dostupná pouze v místní síti. Je uvažován pouze dvanáctihodinový ciferník.

**Panel č. 5, kde je NTP impulzer zapojen, je v provozu maximálně
v intervalu cca 9:00 až 18:00.**

Petr Král

8 Přepínač DIL.
