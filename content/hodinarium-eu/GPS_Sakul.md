---
title: "Hodiny synchronizované systémem GPS respektive GNSS"
slug: "GPS_Sakul"
category: "projekty"
originalUrl: "https://hodinarium.eu/GPS_Sakul.htm"
lastModified: "Tue, 23 Jun 2020 10:27:00 GMT"
sourceCharset: "windows-1250"
scrapedAt: "2026-04-27T17:36:46.678Z"
tldr: 'V roce 2020 jsme do Hodinária dostali prototyp hodin řízených signálem z družice. Jde o hodiny popsané na webu sakul.cz včetně podrobné dokumentace pro vlastní stavbu.…'
---
V roce 2020 jsme do Hodinária dostali prototyp hodin řízených signálem z družice. Jde o hodiny popsané na [webu sakul.cz](https://www.sakul.cz/gps-hodiny-v2-pe2-2015/n/) včetně podrobné dokumentace pro vlastní stavbu. Rozšířila se tak část expozice věnovaná systémům [synchronizace hodin](/clanky/synchronizace_hodin).

![GPS Sakul 1](/img/decin/GPS_Sakul/f/GPS_Sakul1.jpg)Autorovi děkujeme.

Globální družicový polohový systém (GNSS z anglického Global Navigation Satellite System) případně GPS (Global Positioning System) je systém umožňující určit polohu přijímače na základě zjištění vzdálenosti k jednotlivým družicím podle doby, o kterou byl údaj o přesném čase zpožděn na cestě od družice k přijímači. Nejdůležitější podmínkou je možnost měřit čas s přesností odpovídající požadované přesností určení polohy. Rychlost světla je 299 792 km/s. Pro určení vzdálenosti v řádu 1 m potřebujeme čas s přesností nanosekund (10\-9 s). Družice jsou ve výšce kolem 20 tisíc km, tedy zpoždění vlivem vzdálenosti minimálně překročí hodnotu 65 milisekund. Časové zpoždění signálu kromě vzdálenosti závisí na vlastnostech prostředí, kterým se pohybuje družice nebo signál. Je ovlivněno i vlivy, které popisuje speciální a obecná teorii relativity. (Pro podrobnější pochopení doporučuji článek [Přesnost atomových hodin, GPS a teorie relativity](https://www.osel.cz/3225-presnost-atomovych-hodin-gps-a-teorie-relativity.html). Korekci k signálu GPS vlivem průchodu atmosférou poskytuje například EGNOS.

Hodiny satelitů jsou velmi přesné a synchronizované. Přijímač uživatele není tak přesný ani dokonale synchronizovaný. Pro přesné určení času musí hodiny co nejpřesněji znát svou polohu a odchylku dopočítat. K tomu potřebují vyhodnotit signál nejméně ze čtyř družic. Dnešní přesné časové servery mohou využít většinu navigačních systémů, jako je americký Novastar Global Positioning System (GPS), ruský GLONASS, evropský Galileo, čínský BeiDou, japonský QZSS, indický IRNSS a případně další připravované. Viz také [zde](decin_NTP.htm#satelity).

## Synchronizace běžných hodin pomocí signálů GPS

Jsme však v jiné situaci. Pro občanské využití s rozlišením maximálně na sekundy není nutné "kosmické" korekce započítávat a stačí přímo použít údaj vysílaný jednou družicí. V základním GPRMC paketu je čas z použitého GPS přijímače uveden s rozlišením na milisekundy ve formátu hhmmss.sss, což i tak je pro běžné zobrazení příliš. Není tedy nutné hledat polohu hodin, postačí alespoň občasný příjem jedné družice. Protože není určena poloha hodin, musíme na hodinách nastavit platné časové pásmo a případný letní čas.

## GPS přijímač je základem konstrukce hodin

![GPS Sakul 2](/img/decin/GPS_Sakul/f/GPS_Sakul2.jpg)

Popis je čerpán z [webu autora](https://www.sakul.cz/gps-hodiny-v2-pe2-2015/n/).

Autor pro základ hodin použil GPS modul Quectel L80. Jeho výhodou je, že obsahuje vlastní hodiny reálného času (RTC = Real-time clock), které se synchronizují s časem satelitů. Údaj času je tak dostupný i v momentě, kdy GPS přijímač nepřijímá data ze žádného satelitu. Právě proto stačí, aby se jednou za čas podařilo GPS přijímači synchronizovat čas a není tak nutné, aby byl signál ze satelitů nepřetržitý.

Data z GPS modulu následně přes rozhraní UART zpracovává mikroprocesor ATMEGA328P. Čas je zobrazován na displeji složeném ze sedmisegmentových zobrazovačů. Protože GPS L80 nemá integrovánu baterii pro zálohu interního modulu reálného času, je použit vysokokapacitní kondenzátor C15 0,22F/5,5V, který v případě výpadku napětí zálohuje konfiguraci GPS a jejího RTC, což pomáhá po obnovení napájení rychlému vyhledání satelitů a synchronizaci času. Díky tomu jsou hodiny schopny do 3 sekund po zapnutí začít zobrazovat přesný čas. Pokud jsou hodiny dlouho vypnuté, může dojít k situaci, kdy hodiny krátce po zapnutí ukazují špatně. GPS modul musí nejprve vyhledat satelity a synchronizovat čas. V závislosti na poloze (kvalitě signálu) to může trvat až hodinu (běžně však do 10minut). Poté by se čas měl změnit na správný. Při příštím zapnutí již bude čas k dispozici okamžitě a vyhledání satelitů proběhne také podstatně rychleji.

U první verze autorových GPS hodin byl použit Bluetooth(BT) GPS modul. To mělo výhodu v tom, že hodiny a GPS přijímač nemuseli být na stejném místě a byly mezi sebou propojeny bezdrátově až na vzdálenost 10m. Přijímač se mohl umístit v místě dobrého příjmu satelitů. Na druhou stranu toto řešení zásadně konstrukci prodražuje. GPS přijímač podporující BT připojení je samozřejmě dražší a hodiny musejí být vybaveny BT modulem podporujícím MASTER režim.

### Odkazy

- podrobný popis [gps-hodiny-v2-pe2-2015/n/](https://www.sakul.cz/gps-hodiny-v2-pe2-2015/n/)
- Komponenty [forum.sakul.cz/viewtopic.php?p=1512#p1512](https://forum.sakul.cz/viewtopic.php?p=1512#p1512)
- Jiné konstrukce autora - například [stopky nejen pro hasiče](https://www.sakul.cz/stopky-pro-hasice-smd/n)

- [GNSS - funkce](https://cs.wikipedia.org/wiki/Glob%C3%A1ln%C3%AD_dru%C5%BEicov%C3%BD_polohov%C3%BD_syst%C3%A9m)
- [L80\_GPS\_Protocol\_Specification\_V1.1.pdf](/download/GPS_Sakul/L80_GPS_Protocol_Specification_V1.1.pdf)
- [Jak pracuje GPS - video](https://www.youtube.com/watch?v=_vfzAL5L29Y&feature=youtu.be)
- [Přesnost atomových hodin, GPS a teorie relativity](https://www.osel.cz/3225-presnost-atomovych-hodin-gps-a-teorie-relativity.html)
- EGNOS

Petr Král s využitím uvedených zdrojů
