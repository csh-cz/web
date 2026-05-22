---
title: Instalované NTP servery
slug: decin-ntp
category: konstrukce
tags:
  - jednotny-cas
  - ntp-rizeno
  - gps-rizeno
  - bodet
  - decin
  - 2000s
tldr: 'Praktická implementace sítě jednotného času přes NTP — podružné hodiny Bodet Profil 930 napájené přes PoE, MikroTik v režimu Broadcast a vlastní GPS-NTP server stratum 1 s monitorem chronyd na Lubuntu.'
author: Petr Král
ogImage: /img/elektrika/Bodet/Profil930NTP.png
relatedKarty:
  - inv-P503-podruzne-hodiny-bodet
  - inv-P502-podruzne-hodiny-mobatime
imageCredit: "Archiv Petra Krále (hodinarium.eu)"
originalUrl: https://hodinarium.eu/decin_NTP.htm
lastModified: Mon, 20 Mar 2023 10:16:00 GMT
sourceCharset: windows-1250
scrapedAt: 2026-04-27T17:36:29.360Z
---

![Schema použití NTP serveru na panelu č. 5](/img/elektrika/NTP/NTPschema2.jpg)

![Logo Bodet](/img/elektrika/Bodet/logo_bodet.png)

Synchronizace hodin jednotného času se dělala nejčastěji vysíláním polarizovaných minutových [impulzů](/slovnik/impulsy) po dvoudrátovém rozvodu od matečních hodin k hodinám podružným. Méně často se používaly impulzy půlminutové ([Brillie](/sbirka/brillie)), stejnosměrné impulzy, impulzy po tří drátu ([IBM](/sbirka/decin-regulace-ibm)) a další systémy. V druhé polovině 19. století se používal i [stlačený vzduch](/konstrukce/pneumatika2). V současné době se pro řízení hodin používá kompletní časová informace například po lince [MOBAline](/sbirka/karta/inv-P502-podruzne-hodiny-mobatime). Nejmodernějším způsobem šíření časového signálu po vlastním vedením je síť LAN - Ethernet nebo WiFi. (Více také na stránce [synchronizace](/konstrukce/synchronizace-hodin).)

V Hodináriu je tato technologie zastoupena NTP [podružnými hodinami Bodet](/sbirka/karta/inv-P503-podruzne-hodiny-bodet) (Profil 930 NTP), jednoduchým NTP serverem na bázi MikroTiku, GPS NTP serverem a NTP serverem s demonstračním monitorem chodu dle našeho návrhu. Hodiny  Bodet očekávají, že po LAN síti, do které jsou připojeny, přicházejí NTP pakety (Broadcast) směřující na adresu z rozsahu adres 239.192.54.xx. Kde xx je nastavitelné DIP přepínači na hodinách v rozsahu 1 - 15. DIP přepínači na hodinách je rovněž nastavitelné časové pásmo. Rozsah IP adres od 224.0.0.0 do 239.255.255.255 patří mezi tzv. speciální adresy a je zařazen do třídy D. Tato třída je většinou využívána pro hromadné vysílání videa nebo audia. Podstatné je, že NTP server musí být ve stejném segmentu sítě. Po LAN kabelu jsou hodiny i napájeny napětím 48 V ze switche. [Další informace například zde](https://static.bodet-time.com/images/stories/Pdfs/EN/Manuals/Distribution/606547D%20NTP%20AFNOR%20interface%20instructions.pdf).

Po připojení napětí hodiny zaujmou klidovou polohu (12:00, 4:00 nebo 8:00 hodin) a vyčkávají na příchod několika NTP paketů s časovou informací. Poté se nastaví na požadovaný čas. To může trvat několik minut. Hodiny mají dva motory. Samostatně se nastavuje sekundová ručička, je tedy obvykle nastavena jako první a současně se nastavují minuty a hodiny. Podrobný popis vystavovaného exempláře můžete najít v [manuálu](/download/NTP/Analogue_clocks_Profil930-940NTPSlaveClockInstructions.pdf). Bez NTP signálu jdou hodiny autonomně 24 hodin, pak se nastaví do polohy 12:00.

![fotografie sbírkového předmětu](/img/elektrika/Bodet/Profil930NTP.png)

K hodinám samozřejmě firma Bodet a mnoho jiných nabízí profesionální síťové hlavní hodiny či NTP časové servery. Pro použití v sítích nepřipojených do Internetu jsou tyto servery synchronizovány signálem DCF 77 nebo nyní spíše GPS. Jako obvyklá přesnost nastavení času se uvádí hodnota lepší než +- 0,5 ms. Tato přesnost je vyvážena relativně vyšší cenou. Servery jsou v ceně již od 15.000.- Kč, avšak obvykle je cena mnoho desítek tisíc Kč.

Pro instalaci v Hodináriu jsme naopak hledali řešení co nejlevnější a nejsnáze realizovatelné i za cenu případného částečného snížení přesnosti. Výstup NTP serveru bude zobrazován pouze ručkovými hodinami, tak se spokojíme i s přesností +- 1 sec. Instalovaná řešení jsou však i tak přesnější.

Použité hodiny Bodet potřebují "trvale" vysílaný časový signál NTP serveru (Broadcast). V expozici zatím pouze NTP server na bázi MikroTiku takovou informaci vysílá, proto jsou hodiny synchronizovány z něho. Pro vlastní synchronizaci může Mikrotik použít internet i místní GPS NTP server. Má tedy dvě nezávislé cesty k získání přesného času a je tak odolný vůči případným výpadkům. Bez NTP signálu jdou hodiny Bodet většinou nějakou dobu autonomně.

Do sestavy je také připojen i [NTP to DCF simulátor](https://papouch.com/dcf-simulator-generator-signalu-dcf77-p2685/) firmy Papouch store s.r.o. zde použit pro řízení [elektromagnetických sedmisegmentových displejů](/projekty/elektromagneticke-segmenty) zobrazujících internet Swatch time. DCF simulátor umí v úrovních TTL generovat stejný sled pulzů, jako vysílá DCF 77. Hlavní výhodou je podstatně vyšší spolehlivost díky nezávislosti na kvalitě bezdrátového signálu. Alternativně místo přijímače DCF můžeme použít i [konvertorem GPS-DCF dle GR projektu](http://www.grother.de/gps-to-dcf77-module.html). Výhodou je, že v půdním prostoru se snáze přijímá GPS signál a také, že tento konvertor má poměrně dobré vnitřní hodiny a drží dlouho čas i bez signálu.

## MikroTik jako NTP server v režimu Broadcast

![Levné AP od Mikrotiku](/img/elektrika/Bodet/mAPlite.jpg)

Jako první NTP server jsme zvolili zařízení na platformě Routerboardu MikroTik. Mikrotik s licencí L4 umožňuje nainstalovat NTP server s režimem Broadcast. Pro synchronizaci v síti Internet potřebujeme přístup pomocí zabudované WiFi karty s anténou a výstup na Ethernet pro připojení LAN směrem k hodinám. Vybrali jsme MikroTik mAP lite, jehož konfigurace našim potřebám dostačuje. Cena byla cca 600.- Kč.

Základní vlastnosti:

- Jakýkoliv typ napájení PoE 10 - 60V a 802.3at nebo mikroUSB;
- Integrovaná bezdrátová karta 802.1b/g/n včetně antény;
- L4 licence SW RouterOS vhodná pro AP nebo WiFi klienta i pro zprovoznění NTP serveru v režimu Broadcast
- 10/100Mbps LAN

V předinstalované konfiguraci slouží zařízení jako malý WiFi přístupový bod do Internetu (AP). Bylo nutné ho nastavit "opačně", aby WiFi bylo jako WiFi klient a LAN konektor jako výstup pro hodiny. Do zařízení byl doinstalován balíček NTP verze 6.30.4, která již umožňuje nastavit Broadcast IP adresu. Zařízení nyní pracuje tak, že se pomocí vestavěné WiFi připojí do internetu nebo se LAN sítí připojí k místnímu GPS PPS serveru a získá časovou informaci. Interní NTP server začne jako "Broadcast" vysílat každou minutu NTP pakety k hodinám. Výhodou celého řešení je jeho kompaktnost a spolehlivost. Po výpadku napájení dojde spolehlivě k restartu.

## NTP Server pro sítě GPS, BeiDou, GLONASS, Galileo, QZSS, ... s využitím PPS

V roce 2020 jsme sekci NTP serverů rozšířili o průmyslově vyráběný, avšak přesto celkem levný (cca 100 Euro) GPS NTP PPS server dovážený z Číny. (Zařízení není nijak označeno a hlásí se jako Jinan USR IOT Technology Co., Ltd.) Síťové jméno jsme zvolili pps.hodinarium. Jak název naznačuje, časový server získává přesný čas ze signálu GPS pomocí PPS, tedy přesného pulzu jednou za sekundu. Na anténě jsou uvedeny frekvence pro hlavní družicové systémy v civilním pásmu. Na zařízení není spuštěn režim Broadcast požadovaný pro hodiny, protože je patrně konkurenční s režimem Server(vis obrázek). Bohužel nemáme nastavovací aplikaci a změnu nastavení zařízení nejde udělat běžným www prohlížečem, tak zůstaly nastaveny implicitní hodnoty. Synchronizace hodin Bodet je proto řešena zprostředkovaně přes MikroTik.

![GPS NTP server MADE IN CHINA](/img/elektrika/NTP/celek_NTP.jpg)

### Vybrané uváděné technické parametry

[![družice 8.6.2020](/img/elektrika/NTP/druzice.png)](http://gnssmissionplanning.com/App/Skyplot)

- Time synchronization accuracy: 100 ns
- NTP v2, v3, v4 (RFC 1119, RFC 1305,RFC5905), SNTP v3 a v4 (RFC 1769, RFC 2030)
- NTP LAN timing accuracy: 0.5-2 ms
- Support constellation: GPS L1, Beidou B1, GLONASSL1, Galileo E1, SBAS (WAAS, EGNOS, MSAS)
- Implicitní IP 192.168.0.100

Zkratkou GPS, tedy Global Positioning System, je míněn obecný družicový systém pro určování polohy na zeměkouli. Informace o poloze má značný vojenský význam, proto je vyvíjeno více národních systémů. Označení GPS přešlo do obecné mluvy jako označení nejen pro americký systém NOVASTAR GPS, ale pro jakýkoliv elektronický systém zjišťování polohy. Zde uváděn čínský BeiDou, ruský GLONASS, evropský systém Galileo, nebo družice systému QZSS doplňkově používané pro Japonsko. O vlastním nezávislém systému se mluví také v Británii. Kromě Galilea jde zejména o vojenské systémy, které pro civilní použití mají obvykle sníženou přesnost, protože přesnější údaje jsou šifrovány. Dne 8.6.2020 bylo na oběžné dráze již 134 takových družic. Podívejte se sami. Nastavte si polohu a spusťte animaci na stránce [gnssplanning.com](https://www.gnssplanning.com/#/skyplot).

Podstatné je, že nové NTP servery umí časovou informaci získat z většiny těchto družic.

První a nejznámější je americký systém NOVASTAR GPS. Tvoří ho 30 družic kroužících na přesně specifikovaných oběžných drahách asi 20 tisíc km nad zemí. Družice jsou vybaveny přijímačem, vysílačem, atomovými hodinami a dalšími přístroji pro navigaci a speciální účely. Každá družice vysílá kódované informace o přesném čase,signál PPS (přesné pulzy jednou za sekundu), informaci o své poloze ve vesmíru a přibližné poloze ostatních družic systému. Pro příjem a zpracování vysílaných signálů byly vyvinuty speciální přijímače. K určení polohy potřebuje přijímač zachytil alespoň 3 až 4 družice. Součástí vysílaného signálu je časová informace ve formátu UTC (Universal Time Coordinated), ke kterému jsou vztaženy časové základny hlavních hodin a časových center. Lokální čas lze zadat přidělením časové zóny s informací o změně letního času. Výhodou tohoto systému je celosvětový dosah a vysoká přesnost časové informace.

Doplňme ještě, že družice Galileo nesou dva druhy hodin: Rubidiové atomové hodiny (Rubidium Atomic clocks) a vodíkové „maserové” atomové hodiny (Hydrogen Maser /Microwave Amplification by Stimulated Emission of Radiation).

![Monitor LUBUNTU](/img/elektrika/NTP/monitor_decin.jpg)

## Internetový NTP server s monitorem

Abychom lépe ukázali práci NTP, doplnili jsme expozici jednoduchým demonstračním internetovým NTP serverem postaveným na notebooku s LUBUNTU s démonem chronyd. Na obrazovce notebooku běží web monitor, který ukazuje vybrané parametry, jak jsou aktuálně jednotlivé servery z široké nabídky statisticky vyhodnocovány. Právě používaný NTP server pro synchronizaci času je na na snímku obrazovky označen jako \*Sys.peer\*. V zachyceném okamžiku je tento server pps.hodinarium, což je výše zmíněný GPS NTP server zde považovaný za Stratum 1. I některé ostatní servery označené jako Candidat jsou vyhodnoceny jako použitelné pro synchronizaci. Servery označené jako Outlyear se synchronizace neúčastní.

Seznam používaných vstupních NTP serverů kromě pps.hodinarium je zadán jako dynamicky proměnný seznam z adresy 0.cz.pool.ntp.org. První server je dostupný po místní LAN, ostatní po WiFi připojení do internetu. Výhodou tohoto uspořádání je to, že existují dvě cesty, tedy čas lze získat i při výpadku družicového příjmu nebo WiFi připojení k internetu

Je otázka, jak (ne)přesný NTP server na starším 32 bitové notebooku s Lubuntu vznikl. Z fotografie obrazovky lze usoudit, že čas poskytovaný vybraným serverem je stabilní v rozsahu desítek mikrosekund. Použitý GPS NTP server dle firemních údajů poskytuje NTP čas s přesností 0.5 až 2 ms. Pokud by byla k dispozici pouze WiFi síť internetu, bude přesnost horší. Obecně lze říci, že časová přesnost, kterou můžete na straně klienta získat, závisí nejen na přesnosti dostupného zdroje referenčního času, ale také na řadě předpokladů na straně klienta. Na operačním systému (Windows, Linux, ...) a jeho konkrétní verzi, typ CPU (dobrá podpora TSC, nebo ne), čipová sada na základní desce a kvalita oscilátoru na základní desce, která určuje obecnou stabilitu systémového času. Kromě toho existují hardwarová omezení zavedená konceptem sběrnic systému, např. PCI nebo USB, latence přerušení atd. S problematikou se můžete více seznámit na stránkách firmy [MEINBERG](https://kb.meinbergglobal.com/kb/time_sync/start) konkrétně na stránce [o přesnosti synchronizace](https://kb.meinbergglobal.com/kb/time_sync/time_synchronization_accuracy_with_ntp).

Nejnovějším NTP serverem Hodinária je Chrony server běžíci na monitorovacím Raspberry za panelem. Za normálního stavu by měl být synchronizován od místního GPS-NTP serveru s názvem Hodinarium. Prohlédnou si můžete údaje o dosažené přesnosti času na tomto [odkazu](https://proxy.hodinarium2.eu/chrony2.php/). 

Odkazy

- [Chrony server v Hodinariu](https://proxy.hodinarium2.eu/chrony2.php/)
- [Wikipedii](https://cs.wikipedia.org/wiki/GPS) — cs.wikipedia.org. [cit. 2026-04-28]
- [Přesnost atomových hodin, GPS a teorie relativity](https://www.osel.cz/3225-presnost-atomovych-hodin-gps-a-teorie-relativity.html) — osel.cz. [cit. 2026-04-28]
- [www.gpsntp.com](http://www.gpsntp.com/) — gpsntp.com. [cit. 2026-04-28]
- [Konfigurace NTP serveru](https://martinuvzivot.cz/konfigurace-ntp-serveru/) — MartinuvZivot. [cit. 2026-04-28]
- [Synchronizace času (obsáhlá informace od MEINBERG )](https://kb.meinbergglobal.com/kb/time_sync/start) — kb.meinbergglobal.com. [cit. 2026-04-28]
- [NTP server na bázi Arduina](https://forum.arduino.cc/t/ntp-time-server/192816) — Arduino Forum. [cit. 2026-04-28]
- [Digitální hodiny řízené protokolem NTP](https://dspace.vutbr.cz/bitstream/handle/11012/39582/final-thesis.pdf?sequence=-1) — dspace.vutbr.cz. [cit. 2026-04-28]

Text a řešení expozice: Ing. [Petr Král](/hodinari/petr-kral)
