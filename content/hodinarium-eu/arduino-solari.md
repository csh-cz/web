---
title: '"Vynucená" modernizace hodin FLIP CLOCK SOLARI UDINE SPECIAL EDITION Arduinem'
slug: "arduino-solari"
category: projekty
tags:
  - ntp-rizeno
  - solari-udine
  - diy
tldr: 'Vratná modernizace italských překlápěcích hodin Solari Udine s nefunkční původní elektronikou — ESP8266 ovládá krokový motor a synchronizuje stav přes NTP s detekcí půlnoční zpětné vazby.'
author: Petr Král
searchKeywords:
  - Arduino, ESP8266
imageCredit: "Archiv Petra Krále (hodinarium.eu)"
originalUrl: https://hodinarium.eu/Arduino_Solari.htm
lastModified: Sun, 24 Apr 2022 09:31:00 GMT
sourceCharset: windows-1250
scrapedAt: 2026-04-27T17:37:11.133Z
---

![čelní panel](/img/arduino/Solari/Solari1.jpg)

FLIP CLOCK SOLARI UDINE SPECIAL EDITION

Italská firma Solari Udine má bohatou historií. Společnost Fratelli Solari byla založena v Pesariis již v roce 1725 v malém městě v regionu Carnia ve Friuli. Specializovala se na výrobu věžních a nástěnných hodin. Kolem roku 1948 rozpory v rodině přiměly bratry Remigia a Ferma Solariho k přesídlení do Udine a k založení nové společnosti, která se etablovala na trhu výroby hodinek, hodinových terminálů a veřejných informačních displejů pro vlaková nádraží a letiště. Hodiny Cifra 5, první z mnoha projektů, které navrhl Gino Valle, získaly ocenění Compasso d'Oro. V roce 1956 byl na vlakovém nádraží Liegi vytvořen první železniční informační systém na světě. V roce 1962 Solari získal ocenění Compasso d'Oro podruhé, a to díky alfanumerickým teleindikátorům pro letiště a železniční stanice včetně návrhu terminálu TWA na letišti JF Kennedyho v New Yorku. V roce 1998 společnost Solari získala historickou společnost Fratelli Solari, čímž bylo dokončeno znovusjednocení obou společností. Na trhu působí dodnes i v oblasti IT řešení. Více se dozvíte na webu společnosti: [www.solari.it](https://www.solari.it/)

[![Původní provedení](/img/arduino/Solari/Solari_original.jpg)](/img/arduino/Solari/f/Solari_original.jpg)

Do sbírky autora získané hodiny FLIP CLOCK SOLARI UDINE SPECIAL EDITION mají čtyři řádky "překlapávacích" ukazatelů. Zobrazují den v měsíci, měsíc, den v týdnu a ukazatele hodin v 24 hodinovém členění a desítky a jednotky minut. Bohužel u těchto hodin přestala být funkční elektronika. Sběratelsky správné by bylo opravit původní elektroniku. Nicméně součástková základna se rychle vyvíjí a oprava by nemusela být jednoduchá. Proto byla zvolena modernizace se zachováním původních mechanických dílů. Místo opravy jsem zvolil náhradu původní elektroniky modulem složeným z ESP8266 ESP-12F a [krokového motoru 28BYJ-48 s řadičem](https://dratek.cz/arduino/832-eses-krokovy-motor-driver-pro-jednodeskove-pocitace.html). Hodiny jsou nastaveny podle času získaného z NTP serveru v internetu. Pamatují si poslední nastavení času a dokážou ho obnovit po výpadku elektrické energie. Samozřejmě zvládnou i přechody letního času. Bonusem je reakce řídící jednotky na signál k posunu na další den. Řídící jednotka tak dokáže nastavit hodiny z libovolného počátečního stavu.

Řídí se však pouze čas. Případná změna data se musí nastavit ručně. Je to jednak proto, že den v týdnu je odvozen od přechodu přes 24:00 a přetáčení například o šest dnů by trvalo příliš dlouho a jednak proto, že přetáčení dne v měsíci a měsíce je ovládáno druhým motorem. Jeho řízení elektromechanicky zvládá i přestupný rok a byla by škoda ho nahrazovat.

Nevýhodou použití ESP8266 bez vlastních hodin reálného času je to, že hodiny nezačnou pracovat bez prvotního získání času z NTP serveru. Krátkodobé ztráta spojení nevadí, zapnuté ESP8266 v této době udržuje čas pomocí integrovaného oscilátoru. 

Vlastní (vratná) přestavba byla poměrně jednoduchá. Na levém obrázku je šipkou označena hřídel, na kterou bude přímo nasazen krokový motor. Tato hřídel se musí otočit každou minutu o 1/5 otáčky. Deska elektroniky bude odstraněna a budou demontována některá převodová kola. Stávající motor bude zachován jen jako případný náhradní díl pro motorický pohyb datumové části.

Potřeba otáčet hřídelí za minutu o jednu pětinu otáčky byl u zvoleného krokového motoru trochu problém. Použitý motor se zabudovaným převodem potřebuje na jednu otáčku 512 kroků. Toto číslo bohužel není beze zbytku dělitelné pěti. 512 / 5 = 102,4 kroky. Tento nesoulad musí řešit program například tak, že motor udělá každou minutu 102 kroků a každou minutu dělitelnou pěti přidá ještě dva kroky. Rozdíl jisté nedotáčivosti v pětiminutovém intervalu není příliš patrný.

[![Nové řešení](/img/arduino/Solari/Solari2.jpg)](/img/arduino/Solari/f/Solari2.jpg)

Program pro ESP8266 může vycházel z [návrhu pro hlavní hodiny s Arduinem](/projekty/arduino), kde pouze místo vyslání polarizovaného impulzu provede motor část otáčky. Hodiny budou používány v domácím prostředí, tak program bude zjednodušený. Vynechán bude monitor chodu a podobně. Prvotní nastavení hodin je možné udělat i nastavovací webové stránky, lze najet na správnou hodnotu pomocí tlačítka FAST, nebo je možné hodiny vůbec nenastavovat a využít toho, že se o půlnoci sami nastaví. (Řídící ESP8266 nastavuje pouze čas; den v týdnu se musí nastavit ručně, stejně jako den v měsíci a měsíc.) Pokud je během startu drženo tlačítko na modulu, přepne se modul do režimu AP a na IP 192.168.4.1 lze prohlížečem zobrazit nastavovací obrazovku. Nastavuje se jméno sítě, její heslo a čas zobrazený na ukazatelích. Po restartu hodiny najedou na správný čas. Stisk tlačítka během normálního chodu způsobí pohyb ukazatelů vpřed. Lze tak ručně dohnat zpoždění hodin a zejména jemné nastavení překlápěcích lístků minut těsně před spadnutím.

Řídící jednotka si ukládá čas, který nastavila. Po výpadku napájení automaticky najede na správný čas. Pokud je nastavený čas maximálně o hodinu napřed, řídící jednotka čeká. Jedna hodina je zvolena proto, aby nedocházelo ke zbytečnému přetáčení třeba v okamžiku konce letního času. Při přetočení o den dojde ke změně ostatních ukazatelů, což při změně času z 3. hodiny na 2. není žádoucí.

V hodinách Solari jsou dva motory. ESP8266 je nahrazen pouze motor otáčející hřídelí jednotek minut. Nastavení pořadového čísla dne a jména měsíce nastavuje druhý motor. Mechanicky je také ovládáno násobné přetáčení dnů u měsíců kratších než 31 dní a dokonce se ve čtyřletém cyklu správně nastaví přechod na 1. březen v přestupném roce. Mechanismus řídící počet dní v měsících stojí za to více popsat. Hlavní řídící částí je kalendářní kolo obsahující 4x12 poloh pro měsíce. Výška výstupku nad číslem měsíce určuje, kolik dní na začátku měsíce se má "protočit". V segmentu přestupného roku jsou zapsány přestupné roky 1980, 1984,... až 2000. Z toho jde usoudit, že hodiny byly vyrobeny mezi roky 1977 až 1980. Systém samozřejmě funguje i po roce 2000.

Aktivaci přetáčení nadbytečných dní určuje vačka se čtyřmi poloměry. Otočí se jednou za 31 dní. Vačky se dotýká páka nesoucí spínač. (Na fotografii není vidět, protože je pod pákou.) Při sepnutém spínači motor přetočí kalendářní ukazatel o další den. [![měsíční přepínač](/img/arduino/Solari/Solari3.jpg)](/img/arduino/Solari/f/Solari3.jpg)Druhým koncem se páka opírá o některý výstupek na kalendářním kole.

Na začátku běžného dne se motor otáčející ukazatelem dnů v měsíci zastaví po otočení o jeden den. Doplňkový spínač není sepnut. Když je 29. den, je páka na prvním "zubu" vačky. Zda dojde k sepnutí kontaktu a tím k novému startu přetáčecího motoru záleží na tom, o jak vysoký výstupek kalendářního kola se opírá druhý konec páky. Pouze v případě, že se opírá o nejvyšší výstupek dojde k sepnutí. Nejvyšší výstupky jsou u měsíců označených číslem 3 avšak jen v nepřestupných letech. Následně dojde k otočení denní vačky na 30. a protože druhý konec páky stále stojí na vysokém výstupku, zůstává spínač sepnut. Denní vačka se natočí na 31. a díky stále sepnutému kontaktu se motor dále točí a nastaví 1. března.

V přestupném roce je výstupek u čísla 3 nižší, takže dodatečné přetáčení začne až 30. den. Nejmenší výstupky u čísel 5, 7, 10 a 12 jsou pro měsíce, které mají jen 30 dní a uplatní se pouze při zobrazení 31. dne.

Kalendářní kolo je na své hřídeli posuvné. Do záběru je tlačeno pružinou. Nastavení na správný rok a měsíc se provede povytažením kola ze záběru a nastavením vhodného čísla měsíce proti snímací páce. Trochu mate, že výstupky jsou až u čísla následujícího měsíce, než by odpovídalo počtu dní v tomto měsíci. Je to možná tím, že k přetáčení nadbytečných dní dochází až na začátku následujícího měsíce.

Ještě je vhodné zmínit, že prvotní sepnutí motoru dní ovládá vačka na hodinové hřídeli. Spínač je sepnut v 20:00 a vypnut v 24:00. Při sepnutí tohoto spínače motor dní popojede do stavu "náběhu" a teprve po rozpojení se spustí přetáčení dnů. Tento impulz od 22:00 do 24:00 je využit jako zpětná vazba nastavení hodin na čas 0:00.

## Zpětná vazba

Nevýhody hodin, které jsou jen řízené podle času avšak postrádají zpětnou vazbu co vlastně je na ukazatelích jsou zřejmé. Pokud se stane, že z nějakých důvodů není na ukazatelích to co předpokládá řídící jednotka, není možné bez zásahu člověka stav opravit. Zpětná vazba od výše zmíněného signálu umožňuje ukazatele synchronizovat. Řídící jednotce je tak oznámeno, že na ukazatelích je stav 0:00 a ona již snadno nastaví správný čas.

## Ztráty kroků krokového motoru

Realizovaná zpětná vazba však nevyřeší zcela obecný problém krokových motorů. Při překročení mezního zatížení může dojít ke ztrátě kroku, případně k mechanickému kmitnutí.  Tím dojde pouze k k částečnému natočení lískovnice. Obě tyto negativní vlastnosti lze vyloučit volbou vhodného motoru s dostatečným kroutícím momentem. Protože návrh náhradního řešení pro hodiny Solari byl veden snahou o co nejmenší náklady, nelze u použitého motoru ztrátu kroku vyloučit. Sledováním v delším období se zdá, že se překlápěcí mechanismus drobně nedotáčí. Pro jakousi kompenzaci tohoto jevu, program vyhodnocuje za kolik dní a o kolik minut k nedotočení došlo. Na základě těch údajů spočítá korekci, kterou plynule rozdělí do celého dne. Úspěšnost této "statistické" opravné metody bude vyhodnocena po uplynutí několikaměsíčního provozu. Dodejme ještě, že počet ztracených kroků není velký, proto netrpí časová informace, jen čísla nejsou zcela srovnána.

## Ovládací web

Aby bylo možné nastavit síť, ke které se mají hodiny připoji, zadat čas, který je na ukazatelích a pod, po startu modulu ESP8266 je WiFi aktivována v režimu STA +AP. tedy že jednou WiFi jednotkou se "současně" připojuje k síti a zároveň umožňuje WiFi přístup na ovládací web. Konkurenční je pouze stav, kdy se ESP8266 marně pokouší připojit k síti. V této době nestíhá obsluhovat požadavky na web. Proto po cca 5 minutách pokusy o připojení zastaví a umožní nové zadání sítě. Toto zadání sítě se provede na stránce WiFi. Vyberete si ze seznamu získaného scanováním okolí jiné jméno sítě zadáte heslo a případně jiný nameserver. Pokud nezačnete s nastavováním sítě do cca 30 minut, jednotky restartuje. Tím se může vyřešit i to, že zadaná síť nebyla k dispozici pouze dočasně. Přerušení neśpěšných pokusů o připojení lze dosáhnout tlačítkem. Ostatní nastavení je snad dostatečně intuitivní.

![úvodní stránke webového rozhraní](/img/arduino/Solari/web_Solari.jpg)

![Stránka s nastavením WiFi](/img/arduino/Solari/web_Solari2.jpg)![Protokol chodu](/img/arduino/Solari/web_Solari1.jpg)

Dodejme ještě, že web je dostupný i z jiného zařízení připojeného na stejný AP po zadání přidělené IP adresy. Zde by to bylo 10.0.1.12 viz protokol.

Pozn. Může se stát, že se ESP8266 připojí k AP, ale ten nepošle IP adresu stanice. V takovém případě nedojde k získání časové informace. Je to stejný stav, jako když se jednotka k AP nepřipojí.

[Petr Král](/hodinari/petr-kral)
