---
manualEdit: true
title: "Digitálně řízené kyvadlo s automatickou regulací"
slug: "rizeni_kyvadla"
category: "konstrukce"
tags:
  - kyvadlo
  - elektricke
originalUrl: "https://hodinarium.eu/rizeni_kyvadla.htm"
lastModified: "Mon, 26 May 2025 10:10:00 GMT"
sourceCharset: "windows-1250"
scrapedAt: "2026-04-27T17:37:21.432Z"
tldr: 'Přesná mechanická kyvadla jsou obvykle teplotně i barometricky kompenzována. Jednou z jiných cest může být (zejména u historických či věžních hodin) měření doby kyvu například infračerveným optickým s…'
---
![Zkušební přípravek pro digitálně řízené kyvadlo](/img/elektrika/kyvadlo/pripravek.jpg)

Přesná mechanická kyvadla jsou obvykle teplotně i barometricky kompenzována. Jednou z jiných cest může být (zejména u historických či věžních hodin) měření doby kyvu například infračerveným optickým snímačem a další zpracování pomocí mikroprocesoru (ESP8266). Na základě zjištěné odchylky od očekávaného stavu bude upraven moment setrvačnosti kyvadla. Úpravu v tomto příkladu provede krokový motor otáčením závitovou tyčí, která posunuje trimovací závažíčko na tyči kyvadla. Následující text je určitou inspirací k takovému postupu.

### Základní princip

V našem projektu kyvadlo s motoricky řízeným trimovacím závažíčkem na kyvadlové tyči volně kývá a jeho průchod nulovou polohou je snímán infračerveným optickým čidlem. Časy průchodů jsou měřeny mikroprocesorem ESP8266 s přesností na mikrosekundy pomocí funkce `micros()`. Výsledné hodnoty (doby jednoho kyvu) jsou zpracovávány a srovnávány s ideální hodnotou, například 1000.00 ms. Při zjištění odchylky program vypočítá potřebný počet kroků motoru pro změnu polohy závažíčka na závitové tyči, čímž se změní moment setrvačnosti kyvadla – a tedy i jeho perioda.![Web kyvadla](/img/elektrika/kyvadlo/kyvadlo1.jpg)

### **Možnosti a funkce systému**

Webové rozhraní zpřístupněné přes WiFi umožňuje:

- **Zobrazení posledních 10 naměřených period** kyvu (pro posouzení funkce)
- **Barevné zvýraznění odlehlých hodnot** – modře příliš pomalé, červeně příliš rychlé
- **Zobrazení průměrné periody a odchylky od požadovaného stavu**
- **Možnost manuálního posunu motoru** v obou směrech
- **Změnu nastavení ideální periody** (výchozí 2000 ms)
- **Nastavení tzv. mrtvého pásma** – odchylky, které ještě nespouští korekci (např. ±0.6 ms)
- **Reset pozice motoru**
- **Zobrazení korekčního faktoru času z RTC DS3231**
- **Zobrazení přesného počtu kroků motoru**

### **Princip měření a kalibrace**

ESP8266 měří čas mezi průchody kyvadla snímačem pomocí funkce `micros()`, která vrací počet mikrosekund od startu programu. Tato funkce však není dostatečně přesná – její hodnota může být ovlivněna teplotou a stabilitou oscilátoru mikrokontroléru.

Proto je připojen **RTC modul DS3231**, jehož vnitřní teplotně stabilizovaný oscilátor má typickou odchylku ±2 ppm. Pomocí dvacetisekundového kalibračního intervalu se spočítá korekční faktor, kterým jsou pak měření `micros()` násobena. Díky tomu je možné dosáhnout přesnosti lepší než 0,2 sekundy za den.

### **Řízení motoru a kompenzace vůle v převodech**

Posuv trimovacího závažíčka zajišťuje **krokový motor 28BYJ-48** řízený pomocí čtyř výstupních pinů ESP8266. Každý „krok” na webu odpovídá jedné kompletní sekvenci motoru.

Při změně směru otáčení se automaticky přidá několik kompenzačních kroků (např. 5) pro překonání mechanické vůle převodového systému, tzv. **backlash**.

### Řešení hardwarových úskalí

Pro zachování dlouhodobé přesnosti bylo třeba vyřešit dvě klíčové věci:

1. **Kalibrace vnitřního časovače ESP8266**
    Hodnota vrácená funkcí `micros()` není zcela přesná, protože závisí na oscilátoru uvnitř ESP8266. Proto se jednou za 4 hodiny provádí kalibrace pomocí externího reálného času z čipu DS3231 (RTC). Ten má vlastní oscilátor s teplotní kompenzací a přesností ±2 ppm. Porovnáním délky známého intervalu (např. 20 sekund) podle RTC a naměřeného počtu mikrosekund se vypočítá korekční faktor, kterým se v programu dále násobí rozdíly časů.
    **Přesnost RTC**: ±2 ppm = ±0.002 s za 1000 s → při 20 s je chyba menší než ±40 µs.
    **Chyba za den bez kalibrace** (typická pro ESP8266): ±30–100 ppm = až ±8 s denně
    **Chyba po kalibraci**: přibližně ±0.2 s za den (záleží i na šumu měření)

2. **Stabilní I²C komunikace**
    RTC DS3231 komunikuje po sběrnici I²C. ESP8266 neumožňuje na všech pinech aktivovat interní pull-up rezistory, které navíc mají příliš vysokou hodnotu. Proto musely být přidány externí pull-up odpory 4k7 na SDA i SCL. Zároveň bylo nutné zvolit nekolizní piny – například GPIO0 (SDA) a GPIO5 (SCL). V programovacím přípravku tyto piny způsobovaly chyby. Program mohl být zkoušen až po vložení ESP8266 do celého systému.

### **Technické detaily**

Na obrázku vlevo je zkušební přípravek pro řízení pohybu trimovacího závaží. V RTC modulu není vložena baterie, protože se vyučívá jen frekvence oscilátoru.

Prvek

Funkce

Pin ESP8266

RTC DS3231 (SDA)

Kalibrace času

GPIO0 +Pull-Up 4k7

RTC DS3231 (SCL)

Kalibrace času

GPIO5 +Pull-Up 4k7

IR snímač

Detekce průchodu

GPIO3 (Rx)
Nelze používat sériovou linku.

Krokový motor

Posun závaží

GPIO12, 13, 14, 16

## Úvaha o dalších vlivech na přesnost systému

### Měření periody

Každý průchod kyvadla je měřen s přesností na mikrosekundy. Lze asi očekávat, že na senzor působí rušivé vlivy jak mechanické ( například vibrace ) nebo změna světelných podmínek. Používá se **klouzavý průměr z posledních 20 hodnot**, aby se omezil vliv náhodného šumu nebo chybného snímání. Hodnoty +- 20 procent od očekávané hodnoty jsou vyřazeny. Provedení senzoru je asi nejdůležitější oblastí omezení rušení.

### Vliv „kulhání hodin”

Kyvadlo často nemá přesně symetrický chod – tzv. „kulhá”. To znamená, že doba průchodu zleva doprava se liší od doby zprava doleva. Protože se v tomto systému měří doba mezi každými dvěma průchody čidlem (bez ohledu na směr), projeví se kulhání jako **střídání kratší a delší periody**. Pokud je rozdíl např. ±5 ms, naměřené periody budou kolísat mezi 495 ms a 505 ms. Tento rozptyl sice není chyba systému, ale odpovídá fyzice pohybu kyvadla a může být užitečným diagnostickým údajem. Průměrování ze sudého počtu měření, ze tento problém skoro kompenzuje.

Pokud je ale rozdíl výrazný (např. 5 ms mezi směry), dochází k mírnému rozptylu v měření, protože infra čidlo nemusí reagovat zcela přesně v každém směru (např. kvůli různé odrazivosti odrazivé plochy při různém osvětlení).

(Na obrázku je záznam měření na značně kulhajícím metronomu..)

### **Budoucí možné rozšíření**

Systém může být snadno rozšířen například o:

- Zlepšení čidla pohybu
- **Záznam dat na server**
- **Dlouhodobé grafy z hodnot uložených na server**
- **Automatickou detekci poruch (např. nehybné kyvadlo)**
- **Přesnější GPS kalibraci pomocí PPS**

### **Závěr**

Projekt ukazuje, že i s levnými a běžně dostupnými komponenty lze vytvořit **precizní fyzikální experiment řízený mikroprocesorem**, přístupný vzdáleně přes webové rozhraní. Vhodnou kalibrací lze dosáhnout velmi dobré přesnosti i bez drahého hardwaru.
