---
title: "DCF 77 — rádiem řízené hodiny"
slug: "dcf77"
category: "projekty"
tags:
  - radio-rizeno
  - atomove
  - 1900s
  - 2000s
author: "Petr Král"
imageCredit: "Archiv Petra Krále (hodinarium.eu)"
originalUrl: "https://hodinarium.eu/dcf77.htm"
lastModified: "Sat, 16 Aug 2025 15:13:00 GMT"
sourceCharset: "windows-1250"
scrapedAt: "2026-04-27T17:36:46.354Z"
manualEdit: true
ogImage: "/img/dcf_analog.jpg"
tldr: 'Princip a parametry dlouhovlnného časového signálu 77,5 kHz z vysílače Mainflingen — od pulzně šířkové modulace pod vedením PTB Braunschweig až po analogové, digitální i náramkové aplikace.'
references:
  - title: "DCF77 — Wikipedie (cs)"
    url: "https://cs.wikipedia.org/wiki/DCF77"
    type: wiki
  - title: "WWVB — Wikipedia (en)"
    url: "https://en.wikipedia.org/wiki/WWVB"
    type: wiki
  - title: "DCF77 — domovská stránka vysílače (PTB)"
    url: "https://www.ptb.de/cms/en/ptb/fachabteilungen/abt4/fb-44/ag-442/dissemination-of-legal-time/dcf77.html"
    type: odkaz
  - title: "DCF77 — Zasazení do kontextu (Meinberg)"
    url: "http://support.fccps.cz/download/Meinberg/prehled/DCF77.htm"
    type: odkaz
  - title: "Martin Pouva: Vše o času"
    url: "http://home.zcu.cz/~poupa/dcf77.html"
    type: odkaz
---
![Analogový DCF budík — kombinace klasického číselníku a atomové přesnosti](/img/dcf_analog.jpg)

Hodiny se synchronizovaly již v dávné minulosti. Zvukem (výstřel z děla), světlem (mávnutí praporem), později vysíláním časového signálu v rádiu či v televizi. ![Náramkové digitální DCF hodinky](/img/dcf_naramkove.jpg) Automatizovaně se synchronizovaly hodiny pomocí speciálních sítí (systémy matričních a podružných hodin), přenosem signálu po elektrickém vedení, Internetem.

Stále se hledají cesty jak levně obsáhnout co největší okruh uživatelů. **Radiové vysílání DCF 77 je jedna možnost.** **DCF77** je rádiová stanice vysílající časový signál, podle kterého se (pomocí časových značek) hodiny samy nastaví a jdou stále přesně, včetně nastavení na letní čas zpět.

Přijímače signálu DCF jsou stále levnější (nejlevnější prodejní cena nepřesahuje příliš 100.- Kč), a tak se postupně upouští od budování speciálních časových sítí v budovách.

Typickým znakem hodin "řízených rádiem" je symbol vysílače a případný nápis "Radio Controlled Clock". *(Pozor, nezaměnit s Radio Clock — rádiobudíkem, tedy s rádiem s vestavěným budíkem.)*

Hodiny s DCF přijímačem se obvykle vyrábějí, zejména z cenových důvodů, jako digitální. ![DCF pendlovky — efektní „mávátko” bez vlivu na chod](/img/dcf_pendlovky.jpg) V muzeu kuriózních hodin ukážeme proto i několik analogových a kombinovaných budíků. Existují DCF nádražní hodiny i DCF pendlovky. Kyvadlo je zde ovšem spíše jakýmsi mávátkem bez vlivu na chod hodin. Nicméně je to docela efektní. Je celkem zajímavé pozorovat počáteční nastavení analogových hodin. „Pendlovky” se po vložení baterie nastaví na pozici 4, 8 nebo 12 hodin a vyčkávají cca 4 minuty na příjem rádiového signálu. ![DCF hodinky Eurochron — analogový vzhled, atomová přesnost](/img/dcf_naramkove2.jpg) Správný časový údaj se kontroluje 12× za den.

Přijímač DCF lze dnes vestavět i do náramkových hodinek. Kdybych si pořizoval nové hodinky, asi bych sáhl po kombinaci klasického vzhledu s analogovým ukazatelem času a přesnosti atomových hodin dosaženou synchronizací DCF přijímačem. Prostě ručičky jsou ručičky a bezstarostnost o nastavení je to pravé, co nabízejí například **DCF hodinky Eurochron** na obrázku vpravo. Navíc [**římské**](/projekty/rimskedigi) číslice na číselníku....

## Vysílač časového signálu

Časová informace je vysílána stanicí DCF77 na dlouhých vlnách s kmitočtem 77,5 kHz z vysílače v Mainflingenu (asi 24 km jihovýchodně od Frankfurtu nad Mohanem, souřadnice 50°01' severní šířky, 09°00' východní délky). Vysílač má výkon 50 kW, odhadnutý vyzářený výkon je přibližně 25 kW. K vysílání je určena 150 m vysoká (200 m vysoká záložní) vertikální všesměrová anténa s kapacitním nástavcem. Dosah vysílače je okolo 1500–2000 km.

Střední hodnota nosného kmitočtu 77,5 kHz se neodchyluje od jmenovité hodnoty více než o 10⁻¹² týdně. Relativní nepřesnost za více než 100 dní je pouze 2·10⁻¹³. Provádět měření přesnosti za kratší dobu nemá význam, neboť vysílač vysílá za týden pouze 77 500 × 3600 × 24 × 7 = 4,6872 × 10¹⁰ sinusových kmitů. ![Ručičkové hodiny s budíkem a projektorem DCF-77](/img/dcf_kombinace.jpg) Aby bylo kontrolní měření prováděno s přesností 10⁻¹², musí rozeznat 1/20 periody za týden. Dlouhodobá přesnost 2 × 10⁻¹³ odpovídá při 77,5 kHz jednomu kmitu za dva roky.

Kódování časové informace je prováděno pulzně šířkovou modulací, poklesem amplitudy nosné na 25 % na začátku každé sekundy. Klíčování je synchronizováno fázovou synchronizací s nosnou a odpovídá na 10 mikrosekund přesně úřední časové stupnici fyzikálně technického ústavu v Braunschweigu (PTB - Physikalisch-Technischen Bundesanstalt).

Částečně citováno z Wikipedie.

![Nejlevnější DCF hodinový modul WT100](/img/dcf_modul.jpg)

Nejlevnější nové DCF hodiny lze patrně získat zakoupením vestavného modulu WT100 (viz obrázek). Panel ukazuje čas s přesností sekund. Synchronizace s vysílačem probíhá 1× za hodinu. Nejlevnější náramkové digitální DCF hodinky lze získat za cenu pod 400 Kč. Zakoupit lze i samostatné strojky ručičkových hodin s [kyvadlem](/slovnik/kyvadlo).

## Další použití

**Signál DCF 77** je možné použít **i k synchronizaci systémových hodin počítače**. Potřebujeme k tomu speciální radiový modul. Abychom vyloučili možnou nedostupnost signálu nebo rušení v bezprostřední vzdálenosti od počítače, vestavuje se přijímač signálu do externího zařízení často připojeného na sériový port počítače ( RS 232 ). Vlastní synchronizaci řídí speciální ovladač.

## Jiné vysílače:USA WWVB, Japonsko JJY, Čína BPC, Velká Británie MSF

![Hodinky EH-23GA](/img/WWVB/EH-23GA.jpg)

Na obrázku vpravo jsou hodinky La Crosse Technology E. Howard EH-23GA Gold Atomic Watch, které díky vestavěnému přijímači přijímají rádiové signály z vysílače atomových hodin NIST WWVB ve Fort Collins v Coloradu. Tento vysílač používá frekvenci 60 kHz. Podrobnější popis včetně kódování je na Wikipedii. Frekvence i způsob kódování se u různých vysílačů různí. Je otázka, co dělat, pokud jsme s hodinkami v oblasti, ve které nelze potřebný vysílač přijímat.

## Simulátory či emulátory časových vysílačů

Alespoň nouzovým řešením by mohl být simulátor či emulátor vysílače. V nejjednodušším případě mobilní telefon s vhodnou aplikací. Telefon nastaví svůj čas třeba dle GPS signálu a odvysílá potřebnou kódovou informaci prostřednictvím cívky reproduktoru. Přestože chytrý telefon není radiový vysílač, lze uvažovat o tom, že reproduktor telefonu kromě zvuku vysílá i nějaké radiové vlny, které hodiny případně samotná přijímací anténa zachytí. Apky emulující vysílač asi najdeme pro různé druhy chytrých telefonů. Na svém telefonu mám aplikace typu "Clock Wawe" pro WWVB i DCF77.

Lze jít i jinou cestou. Na internetu jsou návody, jak si vyrobit vlastní synchronizační vysílač například na [jednočipovém zařízené](https://hackaday.com/2014/03/22/build-your-own-radio-clock-transmitter/). Více o tom třeba na [WWVB transmitter](https://sites.google.com/site/cisc071jc/public/experiments/wwvb-transmitter). Samozřejmě, že výkon musí být natolik omezený, aby se tato časová informace nešířila dál než do nastavovaných hodinek. Za jakých podmínek je to povoleno uvádí závěr článku v předchozím odkazu. Asi nejvíc mě oslovil návod na [μWWVB: Malá stanice WWVB](https://www.anishathalye.com/2016/12/26/micro-wwvb/). μWWVB je stojan na hodinky, který automaticky nastavuje čas na položených náramkových hodinkách. Systém získává správný čas pomocí GPS (případněě zinternetu) a nastavuje rádiem řízené hodiny emulováním amplitudově modulovaného časového signálu.

Jako pamětník si vzpomínám na klasické rádio schopné mimo jiné přijímat i tyto vysílače na dlouhých vlnách a předat časovou informaci do hodinek vloženách do komůrky v rádiu. Citlivost přijímače v hodinkách nemusela být velká. Kdyby někdo tušil, jaká začka to byla, osvěžte prosím mou paměť.

## DCF vysílač v současnosti

Kvalita příjmu v posledních letech poklesla. Je to jednak způsobeno větším rušením všeho druhu a jednak novou vysílací anténou. Na oficiálním webu se píše:

Od ledna 1998 je jako provozní vysílač k dispozici polovodičový vysílač o výkonu 50 kW. Dříve používaný elektronkový vysílač o výkonu 50 kW je stále k dispozici jako záložní. Připojuje se k náhradní anténě, na kterou je možné přepnutí v případě poruchy nebo pokud je třeba provést údržbu fungujícího vysílače nebo antény.

Obě vysílací antény jsou vertikální všesměrové antény s horním zatížením. Náhradní anténa má výšku 200 m. Provozní anténa má výšku pouhých 150 m, ale zase vyšší kapacitu horního zatížení. Obě antény vyzařují přibližně stejný výkon a jsou umístěny souvisle na stejném anténním poli. Předpokládá se, že EIRP (Equivalent Isotropic Radiated Power) leží na cca. 30 až 35 kW.

![generátor časového signálu DCF77 v Mainflingenu — od konce října 2006 nové zařízení založené na třech atomových hodinách poskytujících standardní frekvenci 77,5 kHz, redundantní logické řízení a nepřerušitelné zdroje napájení](/img/dcf77_steuer.jpg)

Generování signálu DCF77 a jeho monitorovací a řídicí funkce jsou od konce října 2006 založeny na zcela novém zařízení. Tři atomové hodiny poskytují standardní frekvenci, ze které se generuje nosná frekvence, 77,5 KHz, a časový kód. Redundantní logické řízení musí zajistit bezchybné šíření časových informací. Hodiny a jednotky generování signálu jsou připojeny k nepřerušitelným zdrojům napájení, které zaručují spolehlivou nepřetržitou generování signálu.

Více informací o vysílači, jeho kontextu a obecných principech viz odkazy v sekci **Reference** pod článkem.
