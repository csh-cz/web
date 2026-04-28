---
title: "Arduino s \"přesným\" časem - Signál PPS z GPS"
slug: "arduino_PPS"
category: "projekty"
originalUrl: "https://hodinarium.eu/arduino_PPS.htm"
lastModified: "Sun, 29 Dec 2024 22:31:00 GMT"
sourceCharset: "windows-1250"
scrapedAt: "2026-04-27T17:37:10.502Z"
---
Při zamyšlením nad tím, jak mohou být přesné hodiny na bázi Arduina jsem narazil [na stránku](https://hackaday.io/project/5012-gpsatomic-clock-build), kde pan Paul Leskinen představuje svou konstrukci atomových hodin s Arduinem. To mě přivedlo k úvahám, jak to vlastně s přesností a s rozlišovací schopností Arduina je. Pro vlastní pokus budu předpokládat, že mé vlastní hodiny budou zobrazovat čas na osmiznakovém displej na setiny sekundy, tedy s rozlišením hh:mm:ss.ms Vnitřně bude Arduino zpracovávat i desítky mikrosekund. Sice to není moc užitečné, ale vede to k zamyšlení, jak to s přesností vlastně je.

U mnohých sportovních odvětví se časy měří na desetiny sekundy. Rubidiové stopky měří na 11 desetinných míst za údajem sekund. Naše virtuální rubidiové stopky si můžete vyzkoušet. (Je to jen simulace, čas nebudou měřit opravdové rubidiové stopky.)

StartStopStiskněte Start a Stop pro zobrazení času.

V příkladu je použito z cenových důvodů Arduino UNO na 16 MHz. To vede k jistému omezení přesnosti. Například funkce micros() vlivem předděličky 8 počítá čas po 4 mikrosekundách. Lepších výsledků by se dosáhlo při použití například Arduino DUE, které má taktovací frekvenci 84MHz.

## ![Prototyp GPS PPS Arduino UNO](/img/arduino/GPS_PPS.jpg)

## Čas a Arduino

Arduino nedisponuje hodinami reálného času, nemá tedy možnost udržovat čas ve vypnutém stavu. Má pouze interní časovač závislý na taktu mikroprocesoru. Interní oscilátor například v klonu Arduino UNO má frekvenci 16 MHz. Realizovaný je většinou keramickým rezonátorem. Pro měření delších časových úseků sepřímo nehodí. Pokud uvažujeme o přesných hodinách s údajem v řádu alespoň desítek mikrosekund, musíme vyřešit tři problémy.

1.  nastavení času v sekundách,

2.  určení okamžiku, kdy je právě tento čas platný a
3.  vlastní počítání zlomků sekund.

K tomu účelu musíme přidat další modul. Modul příjmu časové informace ze sítě GPS s výstupem PPS. Externí GPS přijímač pracuje nezávisle na Arduinu, nezatěžuje tedy jeho procesor, pokud s ním nechceme komunikovat. Nejprve tedy získáme komunikací po sériové lince aktuální čas v sekundách a potom budeme zpracovávat signál PPS (pulz za sekundu) a to tak, že budeme čas od od tohoto pulzu počítat desítky mikrosekund.

## Čas a PPS z GPS

Určení polohy v systémech GPS vychází z toho, že mikropočítač v přijímači GPS počítá, jak dlouho k němu letí signál z té které družice. Rychlost světla je cca 300 000 km/s, tedy pro přesnost určení polohy na ± 3 m potřebujeme určit čas s přesností cca 10 ns (10\-8s). Tuto přesnost však běžně používané hodiny synchronizované GPS nezískávají. Družice vysílají čas svých atomových hodin. NMEA zprávy obsahují údaje o čase s přesností na sekundy doplněnou informací o stáří dat. Jakousi časovou informaci sice můžeme získat i od jedné viditelné družice. Pokud ovšem nevíme, jaká je vzdálenost od družice a nemůžeme spočítat časové zpoždění dopravy této informace. Vzdálenost je velká, že i při šíření radiových vln rychlostí světla vzniká podstatná chyba. Levné GPS hodiny, které pouze čtou "telegramy" s časem z přijímače GPS, nedosahují někdy ani přesnosti 1 sekunda.

Situace se zlepší v okamžiku, kdy přijímač GTS již určil svou polohu a takzvaně se fixnul. Potřebuje k tomu přijímat signál minimálně ze 4 družic. V tomto okamžiku dokáže modul GPS spočítat svůj vnitřní "atomový" čas. Můžeme tedy splnit bod 1. a nastavit čas na Arduinu tento čas v sekundách.

GPS modul navíc s přesností na nanosekundy dokáže určit, kdy začíná sekunda a vyslat signál PPS = Pulz Per Secund. Tento signál formou přerušení může zpracovat Arduino. Přesnost se trochu sníží, protože na zpracování PPS musí Arduino provést několik instrukcí. Přitom je časováno vnitřním oscilátorem. Programová obsluha přerušení se prakticky redukuje jen na přičtení jedničky do časového razítka systémového času v sekundách. i TAK TO U aRDUINO UNO bude trvat několik mikrosekund.Tím jsme skoro vyřešili bod 2.

## Zlomky sekund

Přestože zobrazování času na displeji ani na setiny sekundy nemá valný smysl, budeme navrhovat dělení na desítky mikrosekund, což je patrně nejvyšší dosařitelná přesnost interního oscilátoru při kalibraci PPS. Kalibrační program při každé sekundě spočítá, zda je možné upravit počet přerušení za sekundu v příští sekundě. Zároveň stanoví konstantu, kterou se generovaná frekvence přepočítá na požadovanou. Na konkrétní desce Arduino UNO bylo při nastavení přerušení na 10 µs naměřeno celkem stabilních 99 994 přerušení za sekundu. Krátkodobá stabilita je cca obvykle lepší než ±1 mikrosekunda. Pro zobrazení je možné údaj v µ násobit konstantou 1000000/99994. Bude tak dosaženo zdánlivé přesnosti na mikrosekundy.

Pro náročnější aplikace můžeme přímo programovat vestavěný Timer, pro méně náročné aplikace můžeme použít funkci millis() a získat dělení na ms. Použití funkce micros() je již problematické, protože funkce používá předděličku 8 a připočítává mikosekundy po čtyřech. Pro mnoho aplikací to však stačí.

## ![Rubidium frekvenční normál PRS10](/img/PRS10/PRS10stage3LG.jpg)

## Přesnější frekvence oscilátoru

Další možností je použít vnější oscilátor zpracovávaný pomocí přerušení nebo ho přímo připojit na desku Arduina. Již použití teplotně stabilizovaného oscilátoru z modulu RTC hodin DS3231 by přineslo určité výsledky. Lze uvařovat o GPS disciplined oscilátoru, která má skoro přesnos rubidiových hodin.

Zásadním krokem by bylo nahrazení vnitřního oscilátoru rubidiovým oscilátorem z atomových hodinan. O připojení staršího rubidiového oscilátoru k Arduinu je na internetu několik zmínek. Jeden z použitelných rubidiových oscilátorů je na obrázku. Oscilátor používá i PPS IN. Pomocí seriové linky (TX, RX) lze obbykle získat informace o jeho stavu případně mu poslat nějaký povel.

Nejjednodušší způsob implementace je nahradit PPS signál z GPS signálem PPS z rubidiového oscilátoru. Tím se v programi Arduina nic nemění. Pokud chceme upřesnit i hodnoty v mikrosekunách použijeme frekvenci 10 MHz jako přerušení. V tomto připadě u Arduino UNO možná musíme snížit děličkou frekvenci na třeba 0.1 MHz pro získání přetušení každých 10 mikrosekund. Je ovšem možné použít rychlejší základnu, jako je například Arduino Due 84 MHz, Arduino Zero 48 MHz, Arduino Protenta H7 až 480 MHz, Raspberry Pi 4B je jeho 1.5GHz čtyřjádrový procesor ARM Cortex-A72 a i jiné.

## Využití ??

Celý tento projekt má spíše význam školníhou příkladu.

## Odkazy

-   [Stránky Rubidiového ościkátoru PRS10](https://www.thinksrs.com/products/prs10.html)
-   [GPS disciplined oscillator](https://en.wikipedia.org/wiki/GPS_disciplined_oscillator)
-   [Rubidium Frequency Oscillators firmy AccuBeat](https://www.accubeat.com/rubidium-frequency-oscillators)
-   [Zpracování dat z GPS](https://muzeumhodin.info/download/GPS_Sakul/L80_GPS_Protocol_Specification_V1.1.pdf)
-   [Přesnost hodin Arduino](https://arduino.narkive.cz/KFsqpvZa/p-esnost-hodin-arduino) - diskuze
-   [GPS synchronizace u náramkových hodinek](https://www.hodinky-365.cz/blog/gps-synchronizace-casu)
-   [Amater radio statiom W8BH](http://w8bh.net/)
-   [Přesnost časování pomocí Arduina](https://www.mylms.cz/presnost-casovani-pomoci-arduina/)

Text: Petr Král
