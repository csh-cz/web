---
title: "Hodiny NTPH — mikropočítačem řízené hodiny vyrobené 3D tiskem se synchronizací času z internetu"
slug: "NTPH"
category: "projekty"
originalUrl: "https://hodinarium.eu/NTPH.htm"
lastModified: "Wed, 01 Oct 2025 11:22:00 GMT"
sourceCharset: "windows-1250"
scrapedAt: "2026-04-27T17:37:23.264Z"
manualEdit: true
tldr: 'Hodiny jsou vyrobeny 3D tiskem ve dvou variantách a jsou ovládané elektronikou sestávající z modulu ESP8266 ESP-12F a motoru s řadičem 28BYJ48.…'
---
![NTPH magnetické](/img/3D/magneticke.jpg)

Hodiny jsou vyrobeny 3D tiskem ve dvou variantách a jsou ovládané elektronikou sestávající z modulu ESP8266 ESP-12F a motoru s řadičem 28BYJ48. Design hodin je převzat z hodin publikovaných na internetu, SW je vlastní vývoj. Hodiny jsou napájeny 5 V adaptérem s konektorem USB mikro. Hodiny po zapnutí potřebují prvotní nastavení času buď z NTP serveru v internetu nebo nouzově přímo z mobilního telefonu. Jít mohou i bez nastavení času. Synchronizaci zajistí alespoň občasné připojení.

## Základní vlastnosti

![NTPH pevné převody](/img/3D/prevodove.jpg)

- NTPH jsou hodiny vyrobené 3D tiskem ve dvou variantách designu.
- Řídící program byl navržen speciálně pro tyto hodiny.
- Hodiny posouvají ručičky vždy po minutě.
- Časová synchronizace NTP serveru v internetu po WiFi síti včetně přepnutí letního času.
- Hodiny si pamatují nastavený čas i po vypnutí zdroje a po zapnutí se seřídí.
- Připojení k WiFi pomocí WPS tlačítka nebo zadáním na vnitřním webu.
- Další nastavení hodin je dostupné na vnitřním webu.
- Nouzově mohou hodiny jít i bez nastavení vnitřního času, případně lze do hodin přenést čas třeba z telefonu. (Nastavení nouzového času platí do vypnutí hodin.)

* * *

##

## Návod k obsluze

## Počáteční rychlé připojení k internetu

### Nejprve postup bez podrobností.

1. Sestavíte hodiny s nastavením ručiček na 12:00.

2. Stiskněte na domácím routeru tlačítko WPS (Wi-Fi Protected Setup). Tlačítko obvykle bývá na zadní části routeru. Stav WPS obvykle trvá v intervalu 3 min a může být signalizován blikajícím symbolem dvou protiběžných šipek. WPS nemusí být z různých důvodů funkční, ať je to nastavením routeru, šifrováním, bezpečnosti, či jenom proto, že tlačítko není dostupné. Přesto postupujte podle dalších bodů s tím, že nenastane bod 5.
3. Zapněte NTP hodiny (krátce blikne červená LED nebo současně bliká červená a malá modrá) a v uvedeném intervalu stiskněte tlačítko, které je uvnitř hodin na modulu ESP8066. Rozsvítí se červená LED a hodiny se budou snažit připojit prostřednictvím WPS protokolu. Při tom různě bliká malá modrá a červená LED.
4. Připojování může trvat několik minut. Mějte trpělivost.
5. Po úspěšném připojení zhasne červená a trvale svítí malá modrá. Hodiny se nastaví na čas a pokračují v chodu. Zároveň se spustí vlastní web hodin.

6. Pokud se hodiny takto nepřipojí, nastaví se stav STOP. Pak můžeme zadat zvolené jméno a heslo WiFi sítě na interním webu hodin nebo používat hodiny bez NTP synchronizace. Chod hodin spustíme opětovným stiskem tlačítka na modulu. Tento stav je zapamatován i pro příští zapnutí hodin a lze ho zrušit novým připojením k WiFi.

7. Pro zadání jména a hesla WiFi sítě mobilem nebo jiným zařízením s WiFi se připojte na WiFi síť hodin, která se jmenuje NTPH-xxxx, kde xxxx je rozlišení jednotlivých hodin odvozené od posledních znaků Mac adresy. (Někdy se "telefon" odmítá připojit k síti, která neposkytuje připojení k internetu. Musíte připojení povolit.)
8. V prohlížeči zadejte http://192.168.4.1 **POZOR nezadávat https://192.168.4.1 šifrovasnou komunikaci hodiny neumí !!!**
9. Na zobrazené stránce přejdete na volbu "Scan + WiFi" , vyberete z nabídky svůj domácí WiFi router a zadáte heslo. (Nastavený NTP server změňte jen pokud není v síti dostupný.) Po odeslání volbou "Send" hodiny opakují pokus o připojení podle nového zadání. Po připojení hodiny spustíte volbou "CHOD".
10. Po připojení je vhodné si zapamatovat externí IP adresu uvedenou dole na zobrazené stránce a příště se připojovat telefonem nebo notebookem k domácí a do prohlížeče zadávat tuto externí adresu. Tato IP adresa se může časem změnit.

### Nastavení ručiček na správný čas

Řídící jednotka bohužel nemá zpětnou informaci, jak jsou nastaveny ručičky. Natavit je můžete trojím způsobem:

- Ručičky vyjmete ze elektroniky a znovu sestavíte. Asi se to nepovede úplně přesně, protože nebudou správně sedět zuby soukolí.
- Stisknete na modulu hodin tlačítko. Krátce blikne červená a začnou se vpřed pohybovat rafičky nejvyšší možnou rychlostí. V okamžiku, kdy tlačítko pustíte, považuje řídící jednotka rafičky za seřízené.
- Nejjednodušší je, na interním webu nastavit čas, který rafičky právě ukazují. Připojíte se na web dle bodů 6. a 7. Pro jistotu hodiny stopnete, zadáte čas na hodinách a hodiny spustíte. Polohu můžete jemně doladit volbou "+", která posouváte rafičky o 1/10 minuty.

* * *

Modul ESP8266 prvotně obsluhuje WiFi komunikaci. Zde ještě obtížněji, protože hodiny fungují jako stanice i jako AP a webserver. Ve volném čase může probíhat vlastní program hodin. Ten je dále přerušován časovačem, tlačítkem nebo požadavky z webu.

* * *

## Podrobnější popis

### Připojení na vnitřní web

Vnitřní web je základním způsobem ovládání hodin. Po zapnutí hodiny spustí WiFi s názvem sítě NTPH-xxxx, kde xxxx jsou poslední čtyři znaky MAC adresy WiFi adaptéru. Připojíte se na tuto síť bez hesla a v prohlížeči zadáte 192.168.4.1 Objeví se základní obrazovka jako na spodním obrázku. Přistoupíte k zadání způsobu získání aktuálního času, tedy obvykle k nastavení připojení k internetu.Modul provede Scan okolí a umožní vybrat síť a zadat heslo.

![NTPH 2](/img/NTPH/NTPH2.jpg)

### Připojení k internetu

Po připojení na vnitřní web klikněte na volbu "Scan + WiFi" a přejdete k výběru sítě (viz obrázek vpravo). Hodiny provedou Scan okolí a nalezené WiFi sítě zobrazí pomocí rozbalovacího menu. Klikněte na něj a ze seznamu zobrazených sítí doplněných sílou signálu si kliknutím vyberete nejvhodnější přístupový bod. Dále zadáte heslo. Ve většině případů můžete přednastavený NTP server ponechat. Informace hodinám odešlete volbou "Send". Hodiny se nyní budou pokoušet o připojení k vámi zadané WiFi a o získání času ze zadaného NTP serveru. Pokud uspějí, nastaví si aktuální čas

Ani po úspěšném připojení k internetu ve výjimečných případech nemusí být získán čas z NTP serveru. V tomto případě musíte zadat čas v autonomním režimu. I v tomto režimu, mohou být hodiny připojeny k internetu, takže k nim můžete přistupovat na IP externí adresu přidělenou routerem.

### Připojení na IP adresu, kterou přidělil router

V době, kde jsou hodiny připojeny k internetu je výhodnější se připojovat ze stejné domácí sítě na adresu přidělenou routerem. IP adresu zjistíme z informací po připojení na IP 192.168.4.1 (viz druhý obrázek) nebo nějakým programem IP skeneru například Advanced IP scaner. Přidělená IP adresa je většinou routerem zapamatovaná, takže je hodinám přidělovaná opakovaně. Nicméně se může někdy změnit, například po restartu routeru. Například dle druhého obrázku přidělil router IP 192.168.1.10 Pokud jsme připojeni do stejné sítě, je nejlepší použít přidělenou IP adresu.

### Autonomní zadání času "telefonem"

Hodiny umožňují také autonomní provoz do okamžiku vypnutí. Pamatují si poslední nastavení ručiček, nemají však po zapnutí napájení aktuální čas. (Nemají vlastní RTC - hodiny reálného času.) Normálně po připojení k internetu získají čas z NTP serveru. Pokud je však není možné připojit do internetu, můžete aktuální čas zadat. Můžete se připojit mobilním telefonem, tabletem či notebookem k hodinám stejně jako je popsáno výše. Místo výběru WiFi sítě kliknete na volbu "!!! Bez internetu !!!". (Přesnější název volby by byl: Bez času z NTP serveru.) V tomto případě se přenese aktuální čas z vašeho mobilního zařízen do hodin. Nadále nebude svítit malá modrá LED. Zruší se stav STOP. Hodiny nyní automaticky nepřepínají letní čas. Nastavení času mobilem lze kdykoliv opakovat. Autonomní chod používá vnitřní zdroj frekvence, který není tak přesný jako čas z NTP serveru. Příliš to však pro běžné užití nevadí.

### Hlavní stránka komunikačního webu

O další volbě "Scan + WiFi" jsme již psali. Následuje různobarevné okno aktuálního stavu.

![NTPH 1](/img/NTPH/NTPH1.jpg)

### Okno aktuálního stavu

Okno zobrazuje datum a čas získaný z NTP serveru a informaci o tom, jaký je stav na hodinách a co případně hodiny dělají. Získaný čas je SE(L)Č, tedy respektuje případný letní čas. Je-li pole olivové barvy, jde o normální chod hodin. Červená barva značí, že hodiny byly zastaveny povelem "STOP" nebo na něco čekají. Žlutá barva značí, že se hodiny právě seřizují. Čas na hodinách je v tomto případě komentován textem "FAST" na rozdíl od stavu "CHOD". Aktuální okno se obnovuje jednou za minutu kromě stavu "FAST", kdy je refresch za 2 sec. Při změně stavu je vhodné obnovit celou stránku volbou "Refresch".

### Nastavení hodin

V normálním režimu se hodiny automaticky nastavují na správný čas i po výpadku napájení. Ručně je hodiny možné nastavovat dvěma způsoby. Při stlačení tlačítka na modulu ESP8266 v době normálního chodu se začnou ručičky hodin otáčet ve směru "hodinových ručiček". V okamžiku uvolnění tlačítka se předpokládá, že hodiny ukazují aktuální čas.

Pohodlnější metoda je, že do pole "Nastav \[hhmm\]" zapíšete čas, který vidíte na hodinách. Tedy ukazují-li hodiny půl třetí, zadáme 230. Vedoucí nula se nezadá; nezadává se žádný oddělovací znak mezi hodinami a minutami. Řídící jednotka pak hodiny nastaví na aktuální čas. Je vhodné, aby hodiny při zadání času byly ve stavu STOP.

Při vypnutí si hodiny pamatují čas ve kterém k vypnutí došlo. Po zapnutí a získání NTP času automaticky nastaví správný čas.

### STOP / CHOD

Volba umožňuje zastavit hodiny například při nějaké manipulaci s rafičkami a pak je zase spustit. Po uvedení do stavu CHOD hodiny zvolí, zda je rychlejší nastavování vpřed či v zad. Aby se zabránilo nejasnému stavu vlivem vůle v převodech, nastavení vzad končí jistým přeběhem a následným nastavením vpřed.

### Volba " + "

Volba vyprovokuje posun minutové ručičky o 1/10 minuty. Slouží k přesnějšímu nastavení polohy ručičky.

### Další informace

Tyto informace jsou závislé na verzi hodin a na způsobu získání času. Jako první se zobrazuje informace o použité verzi převodů. Dále je uvedeno jméno WiFi sítě, které je zadané. Pokud jsou hodiny připojeny k síti, uvádí se kam je modul připojen. Kromě zadaného AP má modul v programu uložené jméno WiFi Hodinarium / traktor1. Nouzově lze i takto pojmenovat sít vlastního routeru a připojování neřešit. Dále může být uvedena externí IP adresa, kterou přiřadil router. Pokud jste například mobilem připojeni na stejnou WiFi síť, můžete s výhodou požívat tuto adresu. Tato adresa pravděpodobně nebude dostupná z internetu. Následuje informace o délce provozu a času, kdy byla tato stránky vystavena. Volba "Refresch" způsobí obnovu stránky.

### Poznámky

- Někdy jsou potíže k připojení na interní web hodin. Některé mobilní telefony se nechtějí připojit k WiFi, která neposkytuje připojení k internetu. Je třeba to povolit.
- Od 1.3.2024 se mění způsob připojování. Bylo zavedeno tlačítko WPS pro "automatické párování". Tato funkce představuje určité bezpečnostní riziko. Nemusí být dostupná buď pro absenci či zákazem v routeru nebo jen tím, že k routeru nemáme přístup. Nemusí se ani vždy povést, pokud se v blízkém okolí nachází více AP a hodiny "svůj" AP nestačí najít.
- Pozor na routery, které mají společné tlačítko WPS/RST, aby nedošlo k resetování konfigurace.
- Od 9.2.2024 není již na hlavní stránce webu volba protokol. Můžete ho však vyvolat zadáním vaše IP/log

* * *

### Úvaha o přesnosti

V původních plánech pro tisk 3D hodin byl předpokládán jednoduchý řídící program, který rychlost otáčení ručiček odvozoval od vnitřního keramického rezonátoru. Ručičky nemají zpětnou vazbu o své poloze. Pro běžné účely byla tato přesnost dostatečná. Přistupuje však další zdroj nepřesnosti a tím je vynechání kroku krokového motoru, případně jeho přeběh. Použitý krokový motor nemá tolik přebytku energie, aby to bylo vyloučeno. Hodiny se proto mohou různě zpožďovat i zrychlovat podle toho při jakém směru pohybu ke ztrátě dojde. Tedy po synchronizaci z NTP má řídící jednotka čas s přesností v desítkách ms, ale jeho přenesení na ručičky není až tak jisté. Platí, že v celou minutu se ručičky začnou pohybovat. Pohyb je dokončen trochu později. Celá minuta je buď správně odvozena od NTP serveru nebo s menší přesností od interního času.

Při nastavování se ručičky pohybují kratší cestou po i proti směru. Přestože je v hodinách algoritmus pro omezení vlivu vůlí v převodech, může střídání směru přinést odchylku v postavení ručiček. Rozdíl může nastat, když dojde k vypnutí proudu právě v okamžiku pohybu ručiček. Proto se stav ukládá v polovině pohybu.

Pro určitou možnost kompenzace případných chyb je možné zavést korekční konstantu, která představuje přidání cyklů každou hodinu. Pro představu uvádím, že jedna minuta u hodin a magnetickým převodem má 64 cyklů, u reálných převodů 102,4 cyklů. Korekce se zadává přímo do URL, tedy například 192.168.4.1/korekce?k=2 znamená přidat každou minutu dva cykly. Za normálních okolností by měla být korekce nulová.

* * *

## Obvyklý význam kontrolních LED

Malá modrá LED trvale svítí, pokud jsou hodiny připojeny k internetu včetně získání informace o čase z NTP serveru. LED bliká různou rychlostí při navazování spojení.

Červená RGB LED svítí při čekání na připojení WPS nebo při zastavení povelem "STOP".

Zelená a modrá LED blikají při aktivitě krokového motoru,

* * *

## Odstranění některých problémů

1. Po startu dlouho poblikává samotná malá modrá LED. Hodiny se snaží připojit k zadané WiFi síti a nedaří se to například proto, že síť má chybně zadané heslo nebo není vůbec dostupná. Připojit hodiny na funkční WiFi nebo zadat čas ručně.
2. Během chodu zhasla malá modrá LED, ale v minutových intervalech svítí modrá + zelená RGB LED. Hodiny po získání času ztratily připojení. Jsou schopné jít autonomně do vypnutí a případně obnovit připojení, pokud je WiFi routeru znovu funkční.
3. Ručičky jsou mírně posunuty. Ručičky směrem vpřed posunete krátkým stlačením tlačítka nebo na webu volbou "+".
4. Na hodinách není správný čas, ale hodiny mají aktuální čas. Větší posun je nejlépe řešit zadáním času na hodinách ve tvaru hhmm na vlastním webu hodin. Nouzově jde i znovu nasadit rafičky.
5. Hodiny lze spustit poprvé i bez použití webového rozhraní. Připojení zajistíte tlačítky WPS. Nastavíte rafičky na přibližně správný čas a po připojení k internetu zmáčknete tlačítko tentokráte ve významu "rychlý chod". Rafičky se začnou pohybovat rychlejším pohybem, dokud držíte tlačítko.
6. Nahrání nové verze programu. Případná nová verze bude k dispozici v přeložené formě. Pro nahrání musí být na počítači nainstalován ovladač USB CH340, modul s ESP8266 musí být umístěn v dodaném základovém modulu. ( USB konektor na desce slouží jen k napájení. )

- **Ovladače pro převodník USB CH340**

- [Pro Windows](https://dratek.cz/docs/produkty/0/142/driver_ch341ser.ZIP)
- [Pro Linux](https://dratek.cz/docs/produkty/0/143/driver_ch341ser_linux.ZIP)
- [Pro MAC](https://dratek.cz/docs/produkty/0/144/driver_ch341ser_mac.ZIP)

- K vlastnímu nahrávání programu použijte [flash\_dowload\_tools](https://www.espressif.com/en/support/download/other-tools).

Autor: Petr Král
