---
title: "Jednotně řízené hodiny a synchronizace času"
slug: "synchronizace_hodin"
category: "projekty"
originalUrl: "https://hodinarium.eu/synchronizace_hodin.htm"
lastModified: "Sun, 26 Sep 2021 09:14:00 GMT"
sourceCharset: "windows-1250"
scrapedAt: "2026-04-27T17:37:09.010Z"
---
## aneb od žárovkového kompresoru po NTP servery

**P**otřebujeme, nebo si jen přejeme, hodiny, které jdou přesně a správně. K tomu vede několik cest. Buď je musíme stále přesnější vyrábět nebo je můžeme neustále dálkově řídit, či pravidelně automaticky seřizovat podle jiných přesnějších hodin. Od nepaměti hodiny seřizujeme podle nějaké autority. Podle polohy Slunce, podle zvuku zvonů kostelů, podle mávnutí praporem, podle tůtání v rádiu či v televizi, nebo podle časové informace obsažené v televizním vysílání. V poslední době se nejčastěji využívá speciálního radiového vysílání, družicových signálů nebo NTP serverů v počítačových sítích. Na hlášení času ze studia se již nemůžeme spolehnout, neboť u digitálního zpracování signálu dochází k nemalému a hlavně proměnlivému zpoždění až v řádu několika sekund. Po historickém přehledu se zaměříme na použití NTP serverů.

## Hlavní způsoby řízení hodin a synchronizace času

-   mechanické řízení
-   pneumatické řízení
-   řízení polarizovanými elektrickými impulzy po speciálním vedení
-   řízení frekvencí rozvodné sítě

-   synchronizace časovou informací po speciálním vedení (sériové kódování, MOBAline, ...)
-   synchronizace pomocí radiové vysílání OMA 50, radiové vysílání DCF 77, televizní vysílání, ...
-   synchronizace pomocí satelitní signál GPS, Beidou, GLONASS, Galileo, QZSS
-   řízení času NTP servery v místních sítích i v internetu

## Mechanické řízení a řízení vůbec

Typickým případem mechanického řízení je Pražský orloj, kde vlastní stroj orloje je v pravidelných minutových intervalech spouštěn mechanickým chronometrem s podstatně vyšší přesností než měl původní vlastní jicí stroj. Za mechanické řízení můžeme považovat i někdy docela složité rozvody k vedlejším číselníkům mechanických věžních hodin. Vedení pomocí soustavy hřídelů, křížových spojek, dilatačních spojek, šikmých odboček a pod. zaslouží obdiv k umění starých mistrů. I boční ciferníky Pražského orloje jsou takto připojeny na hlavní stroj orloje.

Toto řízení je přímé, bez zpětné vazby. Řídící chronometr nijak nereaguje na hypotetickou situaci, kdy posun o minutu nebyl z nějakých důvodů proveden nebo se některý ciferník uvolnil a neposunul. Tyto nevýhody mají všechny soustavy přímého řízení. Odstraňuje je teprve předávání kompletní časové informace v moderních systémech. Synchronizace času může probíhat s různou periodou.

## Synchronizace mechanických věžních hodin

Zdálo by se, že téma synchronizace se týká pouze elektronických hodin a hodinek. Ale i u historického exempláře věžních hodin může být synchronizace provedena. Petr Skála navrhl zařízení (chráněné Úřadem průmyslového vlastnictví v Praze), které umožňuje i mechanickému věžnímu hodinovému stroji jít s několika vteřinovou přesností. Jde o počítačově řízený záchyt kyvadla. Synchronizaci času zajišťuje DCF 77 přijímač. Umožňuje dokonce automatickou změnu letního času.

Ukázka zde i jinde na webu [www.veznihodiny.cz/ukaz19.htm](http://www.veznihodiny.cz/ukaz19.htm)

## Pneumatické řízení podružných hodin - zajímavá kuriozita

Dnes trochu kuriózně působí pneumatický **[systém Elektronom](elektricke1.htm#elektron)** z třicátých let minulého století, který na trh uvedl Junghans. Zavedl žárovkový kompresor (častěji překládáno jako kompresní žárovka) s pulzním elektrickým ohřevem. Získal tak nejenom nový způsob elektrického natahování hodin, ale i možnost rozvádět tyto tlakové pulzy po budově a pohánět tak až 6 podružných hodin. Na obrázku z patentového spisu vidíme princip natahování matečních hodin, způsob rozvodu tlakových pulzů a princip funkce podružných hodin. Český popis jsme si dovolili doplnit, takže neodpovídá přesně originálu.

**V**íce najdete na již zmiňované stránce (v němčině)**[www.hwynen.de](http://www.hwynen.de/jgh-elektronom.html) ,** odkud je obrázek převzat.

![zakladní schema systému Elektronom](/img/elektrika/junhhans/elektronom_patent.gif)

**Zdroj tlakových pulzů**

**Hlavní hodiny**

**Podružné hodiny**

1 - kompresní žárovka
2 - žhavicí vlákno
3 - přívod elektrického proudu
4 - přívod minutových pulzů
5 - spínací kontakty
13 - gumová hadička pro
natahování i pro
pohon podružných hodin

7 - kotva mechanického stroje
8 - pérovník s rohatkou
10 - natahovací páka
11 - válec
12 - píst
20 - palec spínače
14 - gumová hadička pro
pohon podružných hodin

15 - píst
16 - rohatka
minutového kola
17 - postrkovací páka
18, 19 - podružné hodiny

* * *

## **Elektrické systémy v současné době**

Základní otázkou synchronizace je, jak přesný požadujeme výsledek. Stačí nám několik sekund, několik milisekund, mikrosekund či nanosekund? Podle toho volíme přesnost zdroje času, zvažujeme (kompenzujeme) dobu šíření signálu a dobu zpracování. Pokud například byl rozhodující okamžik oznamován výstřelem z děla, nějakou dobu trvalo, než na povel dělo vystřelilo, doba přijetí signálu závisela na vzdálenosti a rychlosti zvuku a asi hlavní roli hrála pozornost posluchače. Dnes po zavedení digitálního zpracování radiového či televizního signálu, se projevují výrazná zpoždění vlivem délky přenosové terasy (například přes družici) či doba zpracování digitálního systému v různých částech přenosové trasy. U družic je nutné počítat i s vlivy popsanými speciální a opecnou teorií relativity. Problém je, že tato zpoždění jsou proměnlivá zejména pro různé příjemce signálu.Přesnost časového signálu vysílaného ze studia je proto problematická. Vezměmě to napřed historocky.

## Řízení podružných hodin pomocí polarizovaných impulzů po speciálním vedení

V roce 1839 si profesor Carl August Steinheil dal patentovat mechanizmus vysílání časových značek z centrálních (matečních) hodin do hodin podružných. O rok později podobný patent získal také pan Alexander Bain. Systém byl postupně vylepšován a stal se na dlouhou dobu ideálním systémem jednotného času v úřadech, v továrnách, na nádražích a v dalších velkých budovách v celém světě. **Polarizované impulzy** těchto soustav nás provázely v minulosti a provází nás dodnes. Hodinám jednotného času se v Čechách věnovalo a věnuje několik firem. Nejznámější asi byla firma [**Elektročas - Pragotron**](http://www.elektrocas.cz/), která je v současné době zakoupena firmou [Elekon sro.](https://mobatime.cz/)

## Řízení frekvencí rozvodné sítě

Elektrické hodiny mohou využívat frekvenci rozvodné sítě jako časový normál. Jde o časový normál snadno dostupný a dnes již pro běžnou potřebu dostatečně přesný. Elektrárenské společnosti úspěšně frekvenci rozvodné sítě stabilizují. Ještě nedávno frekvence vlivem různé zátěže sítě kolísala. Jako historickou zajímavost uveďme, že první elektrické hodiny v Rakousku-Uhersku, hodiny [LAPLACE](/clanky/laplace) pana Roberta Michla, byly ve spojení s přesnými kyvadlovými hodinami používány právě ke kontrole a řízení frekvence sítě. Dnes se hodiny se synchronním motorem používají zejména v aplikacích i jinak související s rozvodem elektrické energie, zejména v různých spínacích hodinách.

Nevýhodou jednoduše řízených skupin hodin je závislost na nepřetržitém chodu časového normálu a závislost na kvalitě vedení. Dojde-li například k výpadku sítě, některé hodiny se synchronním motorem se již sami nerozejdou, některé nastartují, ale ukazují čas zpožděný o dobu výpadku. Novější systémy jednotného času s polarizovaným impulzem v době výpadku impulzy nevysílají, ale pamatují si buď počet nevyslaných impulzů nebo čas nastavený na podružných hodinách. Po obnovení dodávky elektrické energie, centrální hodiny zrychleně impulzy odvysílají. Ani tento systém není bezobslužný, neboť nekvalitou vedení či jiným problémem se může stát, že některé hodiny v soustavě ukazují odlišný čas.

* * *

V současnosti se proto častěji používají hodin, které jsou schopny samostatného chodu a jsou nadřízenou autoritou pouze v různých intervalech synchronizovány, nebo jsou neustále opravovány podle neustále přenášené úplné časové informace.

* * *

## Distribuce časové informace radiovými vysílači OMA 50

(Zkráceně podle stránek [https://home.zcu.cz/~poupa/oma50.html](https://home.zcu.cz/~poupa/oma50.html) a [http://home.zcu.cz/~poupa/pccas.html](http://home.zcu.cz/~poupa/pccas.html) které napsal pan Martin Poupa )

Nápad používat pro šíření časové informace radiově vysílané se objevil v USA a v Kanadě již roku 1905. Roku 1910 jako první v Evropě začalo vysílat Německo a Francie. Významným podnětem rozvoje časových signálů byl Mezinárodní geofyzikální rok 1957/58. Pokusné vysílání přesného kmitočtu a časového signálu z hodin vyvinutých v ÚRE AV ČR u nás začalo rokem 1955, kolektivní stanicí OK1KAA na frekvenci 3,5 MHz, a dále pokračovalo vysíláním krátkovlnných stanic OMA 2,5 MHz a OLB5 3,170 MHz. [![OMA 50](/img/Mobatime/OMA50.jpg)](/img/Mobatime/OMA50_v.jpg)Dlouhovlnné vysílání začalo 17. května 1957 stanicí OLP 48,6 kHz a vyústilo v dubnu 1958 vysíláním stanice OMA 50 na kmitočtu 50 kHz. Tato stanice šířila svou normálovou frekvenci a časové signály vysílačem OMA 50 z Liblice u Českého Brodu výkonem 50 kW do NT antény. Výhoda dlouhých vln byla v dosahu vysílače. Byli jsme tehdy první stanicí na světě šířící časové signály na dlouhých vlnách. Po definování Pražského koordinovaného času UTC(TP) (TP znamená Tempus Pragense) v lednu 1969 vysílala OMA 50 tento čas v mikrosekundové shodě se světovým koordinovaným časem UTC odvozovaným z cesiových atomových hodin v ÚRE. Od roku 1974 bylo zavedeno kódování v BCD tvořeném klíčováním fáze nosné o 180°, což byl sice technicky vyspělejší systém, než v té době používal vysílač DCF 77, který však vyžadoval náročnější přijímač. Výrobky řízené tímto signálem se na trhu neprosadily. V sedmdesátých letech vyrobila firma Elektročas - Pragotron několikery hodiny s lístkovou překlápěcí indikací, řízené signálem OMA 50. Pragotron ve vývoji hodin uvažoval i o synchronizi chodu hlavních hodin EH 40 tímto signálem. Pozůstatkem tohoto vývoje je kontrolka na hodinách se symbolem antény. Zájem o vysílání vysílače OMA 50 stále klesal, až bylo financování jeho provozu neúnosné a vysílač byl na jaře roku 1995 vypnut.

Zajímavý podrobný [článek zde](https://www.wikiwand.com/cs/Vys%C3%ADla%C4%8D_OMA) a také ve [wikipedii](https://cs.wikipedia.org/wiki/Vys%C3%ADla%C4%8D_OMA)

## Radiové vysílání DCF 77

DCF 77je německá stanice, která vysílá nepřetržitě na dlouhé vlně z vysílače v Mainflingen (50° 01" severní šířky, 09° 00" východní délky), asi 25 km jihovýchodně od Frankfurtu nad Mohanem. Provoz zajišťují společně Spolková pošta Telekom, která provozuje vlastní vysílač a antény, a Spolkový fyzikálně-technický ústav PTB Braunschweig, který odpovídá za řídící signál odvozovaný od atomových hodin. Stanice začala vysílat v září roku 1970. Vysílač má výkon 50 kW s odhadovaným vyzářeným výkonem (ERP) asi 30 kW. Dosah vysílače je dle údajů PTB kolem 2000 km. K vysílání je určena 150 m vysoká (200 m vysoká záložní) vertikální všesměrová anténa s kapacitním nástavcem. Čas je odvozován od lokálních atomových hodin.

Signál DCF 77 dnes nese dvě složky modulace. Původní amplitudovou modulaci a později uvedenou fázovou složku. Modulační schéma je vymyšleno tak, aby AM demodulátory "neviděly" fázovou složku, a naopak fázové detektory mají signál na vstupu "zarovnaný" limiterem, takže AM složku ignorují. Dražší přijímače s fázovou demodulací (PZF) vykazují mnohem lepší odolnost proti rušení. Firma [Meinberg](http://www.meinbergglobal.com/english/sw/ntp.htm) tvrdí, že PZF přijímač leckdy ukazuje bezchybná demodulovaná data ještě i na signálu, kde užitečná amplitudová modulace je zcela překryta rušením. Kvalita signálu závisí na mnoha faktorech a zdrojích rušení. [Více...](http://www.fccps.cz/default.asp?inc=inc/DCF77.htm) Další informace také [zde](https://cs.qwe.wiki/wiki/DCF77).

Vysílač DCF 77 od konce roku 1995 asi nejvíce využívaný vysílač na Evropském kontinentě. Jsou i jiné. Informace o dalších vysílačích a různých systémech najdete například [zde](https://cs.qwe.wiki/wiki/Radio_clock) Podrobně popisuje sutuaci také [pan Poupa](http://home.zcu.cz/~poupa/dcf77.html).

![Hodiny PIK s.r.o. DCF-1](/img/Mobatime/PIK_dcf1.jpg)

## Časové informace vysílané ze studia

Ještě v nedávné době byly populární časové informace vysílané rozhlasem či televizí. Jak již bylo naznačeno, přechodem na digitální vysílání jejich význam klesá. Zpoždění studiového signálu zejména TV může být až 4 s a řeší se vlivem různých použitých vysílacích tras velmi složitě průměrným předstihem, či se neřeší vůbec. Podrobněji se tomuto problému věnují články: [Je uváděný čas skutečně přesný?](https://www.parabola.cz/clanky/1899/digitalni-vysilani-je-uvadeny-cas-skutecne-presny/) první a [druhá část](https://www.parabola.cz/clanky/1914/digit-vysilani-je-uvadeny-cas-skutecne-presny-2/). Přesto se zdá, že ono známé "tůtání" časového signálu v rádiu ještě do muzea nepatří.

V Hodináriu máme (ve stolní zjednodušené formě) zapůjčený vysílač časových značek DCF-1 vyrobený firmou [PIK s.r.o.](http://piknymburk.cz/hodiny.html) Hodiny jsou řízené signálem DCF 77 a vysílají časové značky s předstihem 0,85 sekundy, aby se vyrovnalo průměrné zpoždění na vysílací trase přes družici. Hodiny v provedení DCF-1R do racku mohou být doplněny výstupem minutových a vteřinových impulzů pro řízení podružných hodin. K hodinám DCF-1R je možné připojit displeje s výškou číslic od 17 do 100 mm. Přepínačem lze zvolit tři možnosti charakteru zvuku. [Více o historii těchto hodin](http://piknymburk.cz/histhod.html) najdete na stránkách výrobce.

## Šíření časové informace v televizním signálu

Televizní vysílání bylo svého času československý časovým normál. V době zpětného běhu řádku se vysílalo také časové razítko. Nové technologie způsobily, že tato cesta byla opuštěna a v současné době vlivem různých zpoždění po celé trase digitálního zpracován signálu již není možná. Na dotaz, jak to s vysíláním času je, odpovědělo Divácké centrum ČT toto:

Informace o reálném čase je v digitálních televizních multiplexech obsažena v tabulce TDT (Time and Date Table). Informace o časovém pásmu (a případné korekci kvůli letnímu času) v tabulce TOT (Time Offset Table). Stabilita této časomíry bývá odvozena od přijímače GPS.

Nebývá ambicí televizních společností ani operátorů distribučních sítí dosáhnout na přijímací straně co nejnižší absolutní odchylky od přesného času. Velikost do jisté míry konstantní odchylky je dána tím, v kterém místě vysílacího a distribučního řetězce je tabulka TDT do multiplexu vkládána (většinou se jedná o multiplexer jednotlivých vysílaných služeb v rámci tzv. headendu) a jakými dalšími zařízeními a distribučními cestami vysílaný multiplex prochází.

Pokud je součástí televizního multiplexu také teletext, je přesný (místní) čas obsažen v jeho záhlaví, tedy v paketu 0. Dále pak v paketu 8/30 Format 1 je přenášen světový čas UTC, hodnota časového offsetu a dále též modifikovaný Juliánský kalendář.

## Časová informace z navigačních systémů NOVASTAR GPS, BeiDou, GLONASS, Galileo, QZSS, IRNSS, ...

Zkratkou GPS, tedy Global Positioning System, je míněn družicový systém pro určování polohy na zeměkouli. Tato informace má značný vojenský význam, proto je vyvíjeno více národních systémů. Označení GPS přešlo do obecné mluvy jako označení nejen pro NOVASTAR GPS, ale pro jakýkoliv elektronický systém zjišťování polohy, jako je čínský BeiDou, ruský GLONASS, evropský systém Galileo nebo zatím čtyř družicový systém QZSS doplňkově používaný pro Japonsko či indický IRNSS. O vlastním nezávislém systému se mluví také v Británii. Kromě Galilea jde zejména o vojenské systémy, které pro civilní použití mají sníženou přesnost. Přesnější údaje jsou šifrovány. 8.6.2020 bylo na oběžné dráze 134 takových družic. Nastavte si polohu a spusťte animaci na stránce [gnssplanning.com/#/skyplot](https://www.gnssplanning.com/#/skyplot). Podstatné je, že nové NTP servery umí časovou informaci získat z většiny těchto dr
První a nejznámější je americký systém NOVASTAR GPS. Je tvořen 30 družicemi kroužícími na přesně specifikovaných oběžných drahách asi 20 tisíc km nad zemí. Družice jsou vybaveny přijímačem, vysílačem, atomovými hodinami a dalšími přístroji pro navigaci a speciální účely. Každá družice vysílá kódované informace o přesném čase, signál PPS (, informaci o své poloze ve vesmíru a přibližné poloze ostatních družic systému. Pro příjem a zpracování vysílaných signálů byly vyvinuty speciální přijímače. Každý přijímač GPS zpracovává vysílané informace ze tří až dvanácti družic. Na jejich základě určí přesnou pozici uživatele. Součástí vysílaného signálu je časová informace ve formátu UTC (Universal Time Coordinated), ke kterému jsou vztaženy časové základny hlavních hodin a časových center. Lokální čas lze zadat přidělením časové zóny s informací o změně letního času. Výhodou tohoto systému je celosvětový dosah a vysoká přesnost časové informace. S rozšiřováním "chytrých telefonů" nabývá tato synchronizace stále většího objemu.![šíření paketů NTP](/img/ntpanim.gif)

Příklad vhodného řešení i pro malé odloučené počítačové sítě jsou GPS NTP servery popsané na stránce [expozice v našem Hodináriu](/clanky/decin_NTP).

Více také na [Wikipedii](https://cs.wikipedia.org/wiki/GPS) a [v popisu Systému GPS.](https://cs.wikipedia.org/wiki/Glob%C3%A1ln%C3%AD_dru%C5%BEicov%C3%BD_polohov%C3%BD_syst%C3%A9m)

## Čas v počítačích a časové informace v síti INTERNET

Podobně jako u naprosté většiny v současné době vyráběných hodin, je i čas počítače odměřován kmity krystalu křemene. Stabilita těchto kmitů však není pro samotný chod PC nijak podstatná a tomu také odpovídá kvalita používaných krystalů - i v levných náramkových hodinkách se používají krystaly kvalitnější (s vyšší přesností nominální frekvence, s nižší závislostí na změnách teploty). Dalším faktorem, který ovlivňuje chod hodin, je zátěž procesoru. V době, kdy je počítač vypnut, udržují čas tzv. hodiny reálného času (RTC). Po zapnutí počítače převezmou jejich čas systémové hodiny, řízené procesorem. Ten nemá při velké zátěži vždy čas přijmout signál pro jejich posun, vyslaný obvodem krystalu. Přenosné počítače navíc, ve snaze ušetřit energii, mění v závislosti na zátěži i takt procesoru. Zkrátka, hodiny počítače jsou nespolehlivé. Je nutné je nějak synchronizovat. Nabízí se prostředek, který je nejsnáze k dispozici - síť internet.

Paketový přenos dat, který je základním způsobem práce v Internetu, však nemá zaručenou rychlost šíření a zdánlivě se moc pro synchronizaci času nehodí. Rychlost šíření časové informace je poněkud nestabilní na rozdíl od mnohem stabilnější rychlosti zvuku, světla či přenosu časové informace po vyhrazených linkách. Je však celosvětově dostupný a dostupný je i v místech bez výhledu na oblohu. Dosažení potřebné přesnosti však vyžaduje mnohem sofistikovanější způsob práce zahrnující statistické vyhodnocení přijímané informace. **![hierarchie stratum](/img/Mobatime/statum.jpg)**

**Z**ákladem synchronizace času v Internetu je dnes **N**etwork **T**ime **P**rotokol, případně jeho zjednodušení varianta bez statistického hodnocení **S**imle **NTP**. Ten umožňuje synchronizaci s přesností na zlomky sekundy. Základní myšlenka protokolu je "synchronizovat všechny počítače v síti" podle jednotného zdroje "správního" času. Aby to bylo proveditelné, je vytvořena v Internetu struktura časových serverů různé úrovně (Stratum) a různé přesnosti. Primární NTP servery Stratum 1 jsou ty servery, které jsou synchronizovány pouze externími referenčními zdroji - např. cesiové či rubidiové hodiny, některý satelitní systém, případně radiový signál, např. DCF77. Servery Stratum 1 obvykle dosahují lepší než submilisekundové přesnosti. Používá se čas UTC se speciálními příznaky pro přestupné sekundy.

Nejlevnějším řešením vlastního serveru je instalace NTP démona na PC s Linuxem. Že to může být i zcela minimálné hardware, dokazje například použití NanoPi-NEO. NTP Servery klientskou částí vyhodnocují stabilitu a důvěryhodnost jednotlivých zdrojů. Z odpovědí nejprve vyloučí servery se zřejmě nesmyslným časem. Poté ponechají skupinu serverů s největším společným průnikem. Používají Marzullův algoritmus pro stanovení času z nepatrně se lišících odpovědí různých časových serverů. Běžně se jím dosahuje přesnosti hodin v řádu milisekund. NTP verze 4 obvykle dovede po internetu udržovat čas s chybou pod 10 milisekund (1/100 s), v lokální síti může při ideálních podmínkách dosáhnout přesnosti až 200 mikrosekund (1/5000 s).

Spojení GPS NTP serveru je vhodné zejména pro izolované sítě. ![Nonitor NTP serveru](/img/Mobatime/monitorNTP.jpg)

Vlastní synchronizaci počítačových hodin zajišťuje operační systém počítače nebo lze použít specializovaných programů. Počítač, který chce synchronizovat své hodiny, pošle pár dotazů několika NTP serverům a ty mu v odpovědi pošlou svůj přesný čas.

Zajímavou možností umožňující systém lépe pochopit je spustit na vlastním počítači NTP server s vhodným monitorem. Doporučujeme i pro použití ve Windows server ntpd - Network Time Protocol Daemon. Na obrázku dole vidíte monitor tohoto serveru pod windows. Server i monitor ke stažení na stránce [Meinberg](http://www.meinbergglobal.com/english/sw/ntp.htm). (Pro přenosné počítače se nyní více využívá démon chronyd.)

V okně monitoru vidíme situaci, kdy pokusný NTP server je nainstalován na počítači s W XP připojeném ADSL linkou k internetu. Jeden ze NTP serverů používaných k synchronizaci je server lx.ujf. cas.cz což je [NTP server Ústavu Jaderné fyziky AV ČR](http://lx.ujf.cas.cz/time/pctime-cz.html). Server je na prvním žlutém řádku označen jako použitelný (znak +). Zelený řádek se znakem \* označuje server, který program vybral k synchronizaci. Jde o server Stratum 1, tedy server s nejvyší autoritou synchronizován DCF rádiem. Tmavozelený řádek se znakem - představuje server vyloučený ze synchronizace pro velkou rozdílnost údajů.

### Legenda:

-   **\***Aktuální a preferovaný zdroj.
-   \+ Další kandidát pokud aktuální vypadne (považovaný za dobrý zdroj).
-   remote – IP nebo hostname vzdáleného NTP serveru.
-   refid – Reference zdroje. GPS znamená, že čas je synchronizovaný pomocí družic, nebo může se objevit i PPS (pulse per second). ATOM jsou atomové hodiny či velmi přesný krystal
-   st – Stratum, který udává vrstvu časového zdroje v [hierarchii](https://www.ntp-zeit.de/images/stratum-levels.jpg). Čím menší číslo, tím přesnější čas.t – Typ zasílané zprávy (u=unicast, m=multicast, b=broadcast, l=local,..).
-   when – Počet sekund, které uplynuly od NTP odpovědi (synchronizace).
-   pool – Při naplnění časovače when, vyšle NTP klient žádost o další synchronizaci
-   reach – Stav synchronizace v hodnotě hexa, každá logická 1 níže reprezentuje nový přijatý paket (z prava).delay – Odezva (round trip time) v ms (od vyslání NTP žádosti po NTP odpověď).
-   offset – Časový rozdíl v ms mezi NTP klientem a zdrojem.
-   jitter – Rozdíl mezi NTP odpověďmi ( v překladu "chvění")

Aby nedocházelo k přetěžování konkrétních NTP serverů, zadává se místo konkrétního počítače, jméno poolu NTP serverů. Pool obsahuje dynamický seznam počítačů dobrovolně přidaných do projektu. Dotazy jsou tak posílány cca každou hodinu jiným serverům. Popis problematiky synchronizace času v Internetu přesahuje rámec této stránky. Podrobnější informace najdete na [www.ntp.org](http://www.ntp.org/) nebo česky třeba [zde](http://www.hw.cz/Teorie-a-praxe/Dokumentace/ART1027-Presny-cas-na-PC-prostrednictvim-Internetu.html) nebo [zde](http://www.eecis.udel.edu/%7Emills/ntp/html/index.html). Popis nastavení třeba [zde](https://martinuvzivot.cz/konfigurace-ntp-serveru/).

## ToE - synchronizace hodinových systémů přes Ethernet

Informace z NTP serverů může být předávána nejen počítačům, ale do mnoha zařízení včetně samostatných hodin připojených k LAN. Na obrázku převzatém od firmy [ELEKON](http://www.mobatime.cz/) vidíme celý jednotný časový systém s vlastním NTP serverem synchronizovaným GPS přijímačem.

![System s NTP Mobatime](/img/Mobatime/NTP_LAN.jpg)

V Vpravo nahoře je přijímač časového signálu GPS. Časovou informaci zpracovává NTP server, který ji bude následně předávat mnoha zařízením. GPS signál je zde kromě vnitřních profesionálních hodin serveru jediným zdrojem časové informace. Nejběžnější využití časové informace z NTP serveru je synchronizace jednotlivých počítačů v síti. Může jít i o průmyslové počítače využité k řízení technologií. Aplikaci by prospělo ještě záložní řešení.

K síti mohou být připojeny i speciální strojky podružných hodin, které časovou informaci přímo zpracují. Dále mohou být s určitým omezením připojeny přes převodníky síťových interfaců i hodiny řízené signálem MOBALine či s DCF synchronizací.

* * *

Odkazy:

-   [Časová znamení v rozhlase](https://radiozurnal.rozhlas.cz/casova-znameni-10-dil-ceska-republika-6303408)
-   [NTP servery v Hodináriu](/clanky/decin_NTP)
-   [Synchronizace času pomocí NTP](http://is.muni.cz/th/143076/fi_m/thesis.pdf) - diplomová práce
-   [Čas a kmitočet](http://dml.cz/bitstream/handle/10338.dmlcz/138777/PokrokyMFA_25-1980-3_4.pdf) - PMFA 1980 - O. Buzek, J. Čermák
-   [Osel.cz](http://osel.cz/index.php?clanek=1458)
-   [NTP: Filozofie synchronizace času po Internetu](http://www.lupa.cz/clanky/ntp-filozofie-synchronizace-casu-po-internetu/)
-   [Česká firma Vaelektronik](http://www.vaelektronik.cz/) vyrábějící široký sortiment přijímačů časového kódu DCF77 a další výrobky

!
