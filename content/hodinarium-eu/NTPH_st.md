---
title: "Hodiny NTPH - mikropočítačem řízené hodiny vyrobené 3D tiskem se synchronizací času z internetu"
slug: "NTPH_st"
category: "projekty"
originalUrl: "https://hodinarium.eu/NTPH_st.htm"
lastModified: "Wed, 06 Mar 2024 14:36:00 GMT"
sourceCharset: "windows-1250"
scrapedAt: "2026-04-27T17:37:41.034Z"
---
Hodiny jsou vyrobeny 3D tiskem ve dvou variantách a jsou ovládané elektronikou sestávající z modulu ESP8266 ESP-12F a motoru s řadičem 28BYJ48. Design hodin je převzat z hodin publikovaných na internetu, SW je vlastní vývoj. Hodiny jsou napájeny 5 V adaptérem s konektorem USB mikro. Hodiny po zapnutí potřebují prvotní nastavení času buď z NTP serveru v internetu nebo nouzově přímo z mobilního telefonu. Synchronizaci zajistí alespoň občasné připojení k NTP serveru. Po nastavení času dokáží hodiny jít autonomně s lehce nižší přesností. (Hodiny nemají vlastní RTC.) Ovládání je omezeno na jedno tlačítko s proměnnou funkcí. Signalizace stavu zajišťuje malá modrá LED dioda a tříbarevná RGB LED. Hlavní ovládání je soustředěno do vlastního webu. Web je dostupný po připojení k WiFi modulu na IP adrese 192.168.4.1 nebo ze sítě, ke které se hodiny připojily z přidělené IP adresy.

## Základní vlastnosti

-   NTPH jsou hodiny vyrobené 3D tiskem ve dvou variantách designu.
-   Hodiny posouvají ručičky vždy po minutě.
-   Časová synchronizace zajištěna NTP klientem na WiFi.
-   Nouzově lze do hodin přenést čas z mobilního zařízení po připojení na WiFi hodin. Toto nastavené platí jen do vypnutí hodin.
-   Při použití synchronizace z NTP serveru je zajištěno automatické přepnutí letního času.
-   Čas nastavený na hodinách je ukládán do simulované EEPROM paměti pro restart po výpadku.
-   Komunikace s hodinami lze jen prostřednictvím vnitřního webu.
-   Nouzové ruční nastavení času tlačítkem rychlého chodu FAST.
-   Při připojení do internetu je dostupný monitor chodu.

Nejsou to tedy běžné hodiny s jednoduchou obsluhou. Předpokládá se základní orientace v organizaci připojení k internetu v místě použití.

## Návod k obsluze

Platí od 1.3.2024, kdy je doplněna funkce WPS tlačítka .

## Počáteční rychlé připojení (tlačítkem WPS nebo zadáním z interního webu )

### Nejprve postup bez podrobností.

1.  Sestavíme hodiny s nastavením ručiček na 12:00.
2.  Stiskněte na domácím routeru tlačíto WPS. ( Stav WPS obvykle trvá 2 sec. )
3.  Zapněte NTP hodiny a tomto intervalu stisknete tlačítko na modulu hodin. Rozsvítí se červená a hodiny se budou snažit připojit. Při tom různě bliká modrá malá LED. Po úspěšném připojení zhasne červená a trvale svítí malá modrá LED. Hodiny se nastaví na čas.
4.  Při dalším připojení na stejný WiFi router je vše automatické.
5.  Pokud se hodiny takto nepřipojí, musíme zadat připojovací informace z interního webu hodin.
6.  Vyvolat stav "panika" opětovným stiskem tlačítka, připojit se na síť hodin, zadat 192.168.4.1. a vybrat volbu "SCAN + WiFi".
7.  Vybrat domácí router, a zadat heslo.
8.  Vyčkat, až se hodiny připojí.

Počátěční uvadení hodiny do chodu je nejsložitější činnost, zejména když hodiny mají bát připojeny k NTP serveru prostřednictvím internetu. Při prvním sestavení nastavte rafičky na čas 12:00.

Nejjednodušeji počátečního připojení do internetu dosáhnete tak, že na připojovacím routeru zmáčknete tlačítko WPS, zapnete hodiny v jeho blízkosti a zmáčknete tlačítko pod anténou během 10 sekund po zapnutí (střídavě bliká modrá a červená LED) nebo při naúspěšných pokusech o připojení (svítí červená a poblikává modrá). Bez stisknutí tlačítka po 10 sekundách hodiny přejdou do normálního režimu a budou se snažit připojit k zadané WiFi.

Tlačítko má v této chvíli význam WPS. V době pokusu o párování trvale svítí červená LED. Po vyčerpání pokusů o připojení k nějakému zůstane svítit červená a začne blikat malá modrá LEDka. Dochází k pokusu o připojení dle informací získaných v režimu WPS. Pokud se připojení povede, řídící jednotka si uloží připojovací informace a restartuje.

Pokud se připojení nepovede, řídící jednotka přejde do stavu "panika" (rychle bliká červená LED), kdy očekává další povel z webu (viz Připojení na vnitřní web) nebo (od 24.2.2024) opětovné zmáčknutí tlačítka. Panika je režim nazván proto, že není k dispozici aktuální čas. Tento režim se se ukončí zadáním připojovacího bodu nebo uplynutím 10 minut. Následuje restart.

Pokud se v režimu panika opětovně zmáčkne tlačítko, nastaví se nouzový režim, kdy se řídící jednotka spustí v naposledy známém čase. V této době je možné na interním webu zadat polohu rafiček, zadat přenesení času z telefonu nebo zadat jiné internetové připojení. Je možná jednoduší komunikovat s hodinami v tomto režimu než v režimu panika.

Obecně platí, že tlačítko přerušuje probíhající činnost. Co následuje, záleží na konkrétní situaci. Tlačítko v době pokusů o připojení vede na přechod do stavu panika, tlačítko ve stavu panika, vede k nouzovému stavu a tlačítko v normálním chodu vede k vynucenému otáčení rafiček.

Připojování může trvat několik minut. Mějte trpělivost.

* * *

ESP8266 prvotně obsluhuje WiFi komunikaci. Zde ještě obtížněji, protože hodiny fungují jako stanice i jako AP a webserver. Ve volném čase může probíhat vlastní program hodin. Ten je dále přerušován časovačem, tlačítkem nebo požadavky z webu. Praktickým důsledkem je, že pokud se jednotka neúspěšně pokouší připojit k WiFi nemá čas obsluhovat web a komunikovat s uživatelem. Proto je zaveden režim panika, ve kterém se jednotka k síti nepřipojuje a je tak s ní možné komunikovat. Nicméně i zde je třeba mít jistou trpělivost. Odpovědi nejsou okamžité.

## Připojení na vnitřní web

Vnitřní web je základním způsobem ovládání hodin. Po zapnutí hodiny spustí WiFi s názvem sítě NTPH-xxxx, kde xxxx jsou poslední čtyři znaky MAC adresy WiFi adaptéru. Připojíte se na tuto síť bez hesla a v prohlížeči zadáte 192.168.4.1 Objeví se základní obrazovka jako na spodním obrázku. Přistoupíte k zadání způsobu získání aktuálního času, tedy obvykle k nastavení připojení k internetu.Modul provede Scan okolí a umožní vybrat síť a zadat heslo.

## Připojení k internetu

<img src="/img/NTPH/NTPH2.jpg" alt="Vstupní obrazovka NTPH webu po zapnutí" class="img-standalone" loading="lazy" />

Po připojení na vnitřní web klikněte na volbu "Scan + WiFi" a přejdete k výběru sítě (viz obrázek vpravo). Hodiny provedou Scan okolí a nalezené WiFi sítě zobrazí pomocí rozbalovacího menu. Klikněte na něj a ze seznamu zobrazených sítí doplněných sílou signálu si kliknutím vyberete nejvhodnější přístupový bod. Dále zadáte heslo. Ve většině případů můžete přednastavený NTP server ponechat. Informace hodinám odešlete tlačítkem Send. Tím ukončíte čekací smyčku na zadání z webu. Hodiny se nyní budou pokoušet o připojení k vámi zadané WiFi a o získání času ze zadaného NTP serveru. Pokud uspějí, nastaví si aktuální čas

Ani po úspěšném připojení k internetu ve výjimečných případech nemusí být získán čas z NTP serveru. V tomto případě musíte zadat čas v autonomním režimu. I v tomto režimu, mohou být hodiny připojeny k internetu, takže k nim můžete přistupovat na IP adresu přidělenou routerem a také funguje externí monitor.

### Připojení na IP adresu, kterou přidělil router

V době, kde jsou hodiny připojeny k internetu je výhodnější se připojovat ze stejné domácí sítě na adresu přidělenou routerem. IP adresu zjistíme z informací po připojení na IP 192.168.4.1 (viz druhý obrázek) nebo nějakým programem IP skeneru například Advanced IP scaner Přidělená IP adresa je většinou routerem zapamatovaná, takže je hodinám přidělovaná opakovaně. Nicméně se může někdy změnit, například po restartu routeru. Například dle druhého obrázku přidělil router IP 192.168.1.10 Pokud jsme připojeni do stejné sítě, je nejlepší použít přidělenou IP adresu.

### Autonomní zadání času "telefonem"

Hodiny umožňují také autonomní provoz do okamžiku vypnutí. Pamatují si poslední nastavení ručiček, nemají však po zapnutí napájení aktuální čas. (Nemají vlastní RTC - hodiny reálného času.) Normálně po připojení k internetu získají čas z NTP serveru. Pokud je však není možné připojit do internetu, můžete aktuální čas zadat. Můžete se připojit mobilním telefonem, tabletem či notebookem k hodinám stejně jako je popsáno výše. Místo výběru WiFi sítě kliknete na tlačítko !!! Bez internetu !!!. (Přesnější název tlačítka by byl: Bez času z NTP serveru.) V tomto případě se přenese aktuální čas z vašeho mobilního zařízen do hodin. Nadále nebude svítit malá modrá LEDka. Zruší se stav STOP, který je nastaven stavem "panika". Hodiny nyní automaticky nepřepínají letní čas. Nastavení času mobilem lze kdykoliv opakovat. Autonomní chod používá vnitřní zdroj frekvence, který není tak přesný jako čas z NTP serveru. Příliš to však pro běžné užití nevadí.

### Hlavní stránka komunikačního webu

O další volbě "Scan + WiFi" jsme již psali. Následuje různobarevné okno aktuálního stavu.

### Okno aktuálního stavu

<img src="/img/NTPH/NTPH1.jpg" alt="Hlavní stránka komunikačního webu NTPH s oknem aktuálního stavu" class="img-standalone" loading="lazy" />

Okno zobrazuje datum a čas získaný z NTP serveru a informaci o tom, jaký je stav na hodinách a co případně hodiny dělají. Získaný čas je SE(L)Č, tedy respektuje případný letní čas. Je-li pole olivové barvy, jde o normální chod hodin. Červená barva značí, že hodiny byly zastaveny povelem "STOP" nebo na něco čekají. Žlutá barva značí, že se hodiny právě seřizují. Čas na hodinách je v tomto případě komentován textem "FAST" na rozdíl od stavu "CHOD". Aktuální okno se obnovuje jednou za minutu kromě stavu "FAST", kdy je refresch za 2 sec. Při změně stavu je vhodné obnovit celou stránku tlačítkem "Refresch".

### Nastavení hodin

V normálním režimu se hodiny automaticky nastavují na správný čas i po výpadku napájení. Ručně je hodiny možné nastavovat dvěma způsoby. Při stlačení tlačítka na modulu ESP8266 v době normálního chodu se začnou ručičky hodin otáčet ve směru "hodinových ručiček". V okamžiku uvolnění tlačítka se předpokládá, že hodiny ukazují aktuální čas.

Pohodlnější metoda je, že do pole "Nastav \[hhmm\]" zapíšete čas, který vidíte na hodinách. Tedy ukazují-li hodiny půl třetí, zadáme 230. Vedoucí nula se nezadá; nezadává se žádný oddělovací znak mezi hodinami a minutami. Řídící jednotka pak hodiny nastaví na aktuální čas. Je vhodné, aby hodiny při zadání času byly ve stavu STOP.

Při vypnutí si hodiny pamatují čas ve kterém k vypnutí došlo. Po zapnutí a získání NTP času automaticky nastaví správný čas.

### STOP / CHOD

Tlačítko umožňuje zastavit hodiny například při nějaké manipulaci s rafičkami a pak je zase spustit. Po uvedení do stavu CHOD hodiny zvolí, zda je rychlejší nastavování vpřed či v zad. Aby se zabránilo nejasnému stavu vlivem vůle v převodech, nastavení vzad končí jistým přeběhem a následným nastavením vpřed.

### Tlačítko " + "

Tlačítko vyprovokuje posun minutové ručičky o 1/10 minuty. Slouží k přesnějšímu nastavení polohy ručičky.

### Další informace

Tyto informace jsou závislé na verzi hodin a na způsobu získání času. Jako první se zobrazuje informace o použité verzi převodů. Dále je uvedeno jméno WiFi sítě, které je zadané. Pokud jsou hodiny připojeny k síti, uvádí se kam je modul připojen. Kromě zadaného AP má modul v programu uložené jméno WiFi Hodinarium / traktor1. Nouzově lze i takto pojmenovat sít vlastního routeru a připojování neřešit. Dále může být uvedena externí IP adresa, kterou přiřadil router. Pokud jste například mobilem připojeni na stejnou WiFi síť, můžete s výhodou požívat tuto adresu. Tato adresa pravděpodobně nebude dostupná z internetu. Následuje informace o délce provozu a času, kdy byla tato stránky vystavena. Tlačítko "Refresch" způsobí obnovu stránky.

### Poznámky

-   Někdy jsou potíže k připojení na interní web hodin. Některé mobilní telefony se nechtějí připojit k WiFi, která neposkytuje připojení k internetu. Je třeba to povolit.
-   Od 6.2.2024 (s úpravou 24.2.2024) bylo zavedeno tlačítko WPS pro "automatické párování". Tato funkce představuje určité bezpečnostní riziko. Nemusí být dostupná buď pro absenci či zákazem v routeru nebo jen tím, že k routeru nemáme přístup. Nemusí se ani vždy povést, pokud se v blízkém okolí nachází více AP a hodiny "svůj" AP nestačí najít.
-   Pozor na routery, které mají společné tlačítko WPS/RST, aby nedošlo k resetování konfigurace.
-   Od 9.2.2024 není již na hlavní stránce webu volba protokol. Můžete ho však vyvolat zadáním vaše IP/log

* * *

* * *

* * *

### Úvaha o přesnosti

V původních plánech pro tisk 3D hodin byl předpokládán jednoduchý řídící program, který rychlost otáčení ručiček odvozoval od vnitřního keramického rezonátoru. Ručičky nemají zpětnou vazbu o své poloze. Pro běžné účely byla tato přesnost dostatečná. Přistupuje však další zdroj nepřesnosti a tím je vynechání kroku krokového motoru, případně jeho přeběh. Použitý krokový motor nemá tolik přebytku energie, aby to bylo vyloučeno. Hodiny se proto mohou různě zpožďovat i zrychlovat. Tedy po synchronizaci z NTP má řídící jednotka čas s přesností v desítkách ms, ale jeho přenesení na ručičky není až tak jisté. Platí, že v celou minutu se ručičky začnou pohybovat. Pohyb je dokončen trochu později.

Přinastavování se ručičky pohybují kratší cestou po i proti směru. Přestože je v hodinách algoritmus pro omezení vlivu vůlí v převodech, může střídání směru přonést odchylku v postavení ručiček. Rozdíl může nastat, když dojde k vypnutí proudu právě v okamžiku pohybu ručiček. Proto se nový stav ukládá v polovině pohybu.

Pro určitou možnost kompenzace případných chyb je možné zavést korekční konstantu, která představuje přidání cyklů každou hodinu. Pro představu uvádím, že jedna minuta u hodin a magnetickým převodem má 64 cyklů, u reálných převodů 102,4 cyklů. Korekce se zadává přímo do URL, tedy například 192.168.4.1/korekce?k=2 Za normálních okolností by měla být korekce nulová.

* * *

## Obvyklý význam kontrolních LEDek

Malá modrá LED trvale svítí, pokud jsou hodiny připojeny k internetu včetně získání informace o čase z NTP serveru. Ledka bliká pomalu při navazování spojení. Rychlé blikání střídavě s červenou značí čekání na zásah obsluhy a zadání funkční WiFi sítě. .

Červená RGB LED svítí při čekání na připojení nebo při zastavení povelem "STOP". Bez modré obvykle signalizuje čekání na připojení mobilem a zadání WiFi sítě.

Zelená a modrá LED blikají při aktivitě krokového motoru,

* * *

## Odstranění některých problémů

1.  Trvale a rychle bliká samostatná červená LED. Hodiny jsou v nastavovacím stavu a čekají na zadání sítě, ke které se mají připojit. Zadání je možné jen z webu 192.168.4.1 po připojení na WiFi hodin nebo režimem WPS.
2.  Dlouho svítí červená a poblikává modrá LED. Hodiny se marně snaží připojit k internetu, například pro chybné heslo. Připojit se na vnitřní web hodin ( viz výše ) a nastavit funkční připojení.
3.  Ručičky jsou mírně posunuty. Ručičky směrem vpřed posunete krátkým stlačením tlačítka nebo na webu volbou "+".
4.  Na hodinách není správný čas, ale hodiny mají aktuální čas. Větší posun je nejlépe řešit zadáním času na hodinách ve tvaru hhmm. Nouzově jde i znovu nasadit rafičky.
5.  Hodiny lze spustit poprvé i bez použití webového rozhraní. Připojení zajistíte tlačítky WPS. Nastavíte rafičky na přibližně správný čas a po připojení k internetu zmáčknete tlačítko tentokráte ve významu "rychlý chod". Současně se zruší stav STOP a rafičky se začnou pohybovat rychlejším pohybem, dokud držíte tlačítko.
6.  Nahrání nové verze programu. Případná nová verze bude k dispozici v přeložené formě. Pro nahrání musí být na počítači nainstalován ovladač USB CH340, modul s ESP8266 musí být umístěn v dodaném základovém modulu. ( USB konektor na desce slouží jen k napájení. )

-   **Ovladače pro převodník USB CH340**

-   [Pro Windows](https://dratek.cz/docs/produkty/0/142/driver_ch341ser.ZIP)
-   [Pro Linux](https://dratek.cz/docs/produkty/0/143/driver_ch341ser_linux.ZIP)
-   [Pro MAC](https://dratek.cz/docs/produkty/0/144/driver_ch341ser_mac.ZIP)

-   K vlastnímu nahrávání programu použijte [flash\_dowload\_tools](https://www.espressif.com/en/support/download/other-tools).

Autor: Petr Král
