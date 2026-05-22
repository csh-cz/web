---
title: "Třídrátový rozvod IBM"
slug: "tridratovy-rozvod-ibm"
category: "konstrukce"
author: "Petr Král"
imageCredit: "Archiv Petra Krále (hodinarium.eu)"
originalUrl: "https://hodinarium.eu/decin_regulaceIBM.htm"
lastModified: "Fri, 10 Jun 2022 22:30:00 GMT"
sourceCharset: "windows-1250"
scrapedAt: "2026-04-27T17:36:44.996Z"
relatedKarty:
  - inv-P514-podruzne-hodiny-ibm
  - inv-P515-podruzne-hodiny-ibm-strojek
tags:
  - jednotny-cas
  - pichacky
  - elektromagneticke
  - decin
  - 1900s
tldr: 'Samočinné dorovnávání odchylek podružných hodin systému IBM International — dvě vačky přepínají od 51. minuty mezi vodiči A a B, rychlé dvousekundové impulzy v 59. minutě doženou zpožděné hodiny.'
photoAuthor: M. Baudisch, P. Král
---

Hodinárium v Děčíně se v roce 2017 rozrostlo o [podružné hodiny INTERNACIONAL](/sbirka/karta/inv-P514-podruzne-hodiny-ibm) určené pro třídrátový rozvod nepolarizovaných řídicích [impulzů](/slovnik/impulsy). Tento rozvod je určen pro hodiny IBM se samočinnou regulací jednotlivých podružných hodin — systém umožňuje podružným hodinám s malou odchylkou upravit nastavení na stav matečních hodin. V současné době je v provozu sestava hlavních hodin IBM, několika podružných hodin včetně píchaček.

![Stroj podružných hodin Internacional](/img/decin/IBM/stroj.jpg)

## Podružné hodiny

Na první pohled se [strojek podružných hodin](/sbirka/karta/inv-P515-podruzne-hodiny-ibm-strojek) značně liší od u nás běžně používaných strojků Elektročas. Strojek je konstruován na stejnosměrné nepolarizované impulzy (polarizované impulzy mu však v zásadě nevadí).

V horní části strojku můžeme vidět kotvu elektromagnetu. Po odeznění impulzu vrací kotvu do počáteční polohy pružina a západky současně posunou rohatkové kolo o jeden zub. To by pro běžný chod hodin stačilo. Minutová ručička je na hřídeli rohatky; ručkové [soukolí](/slovnik/soukoli) pro převod na hodinovou ručičku je jediný převod v hodinách.

Systém IBM je však vybaven funkcí samostatného vyrovnání několikaminutových odchylek podružných hodin na čas ústředny. Systém tvoří dvě vačky na minutové hřídeli a vidlice přepínající impulzové vodiče A (červený) nebo B (černý). Vidlice je většinou natočena tak, že je sepnut kontakt A. V okamžiku, kdy raménko spadne do výřezu v první vačce, vidlice se natočí a přitlačí střední kontakt ke spodnímu kontaktu B. Když raménko spadne i z druhé vačky, vidlice se vyrovná a je opět sepnut horní kontakt A. Přepínací kontakt je spojen s jedním koncem cívek elektromagnetu, druhý konec cívek je připojen k vodiči C (zelený). Vačky jsou nastaveny tak, že přepínač v 59. minutě přepne na drát B a ve 3. minutě přepne zpět na drát A.

![Číselník hlavních hodin RADO](/img/decin/IBM/centrala_instalace.jpg)

Konkrétně je to takto:

| Časový interval | Impulzy | Důsledek |
|---|---|---|
| 1. až 50. minuta | minutové impulzy po vodičích A i B | normální chod |
| 51. až 59. minuta | minutové impulzy pouze vodičem A | zastavení předbíhajících se hodin |
| 59.min 10.sec až 59.min 40.sec | impulzy po dvou sekundách po vodiči A | dokrokování zpožděných hodin |
| 60. minuta a dál | minutové impulzy po vodičích A i B | normální chod |

Správně jdoucí podružné hodiny se přepojí samočinně při dosažení své 59. minuty souhlasně s časem hlavních hodin na drát B a tím zamezí příchodu zrychlených impulzů. Další minutové impulzy přijímají drátem B a pak se opět přepojí na drát A. Pokud jsou hodiny zpožděné, nepřepnou včas a dostanou po vodiči A sérii rychlých dvousekundových impulzů, dokud nedosáhnou své 59. minuty; pak přepnou na drát B a vyčkají 60. minutový impulz. Pokud jdou napřed, přepnou dříve a v intervalu 51. až 59. minuty nedostanou po vodiči B žádné impulzy — čekají proto až do 60. minuty, kdy budou impulzy po B obnoveny.

Během jedné hodiny lze tak vyrovnat 10 minut předběhnutí nebo 15 minut zpoždění. Pokud je odchylka velká a interval přepnutí leží v době, kdy jsou vysílány stejné impulzy po obou vodičích, k seřízení nedojde.

Kuriózní bylo, že získané hodiny byly přestavěny tak, že vodič A byl trvale připojen na přepínací kontakt a hodiny byly připojeny na normální dvoudrátový rozvod. Patrně původní ústředna IBM byla nahrazena „Elektročasem" a ve všech hodinách přepojili dráty.

## Hlavní hodiny IBM — třídrátový systém

V podružných hodinách je celkem jednoduchý systém; složitost je obsažena v konstrukci hlavních hodin. Hodiny mají motorový [nátah](/slovnik/natah) závaží a bez elektrického proudu vydrží v chodu asi 4 hodiny. Tuto odchylku by však automatický systém nedokázal vyrovnat, proto by vysílání impulzů mělo být na přibližně stejnou dobu zajištěno akumulátorem.

Hlavní logiku zajišťuje skupina čtyř kontaktů: sekundový, minutový, advance (pro zapnutí rychlého chodu) a stop kontakt. Impulzy po dvou sekundách jsou odvozovány od kontaktu na sekundovém kyvadle, hlavním výstupem jsou minutové impulzy. Protože nejde o polarizované impulzy, odpadá komplikace s obracením polarity. Advance kontakt vymezuje interval v 59. minutě (10.–40. sekunda), kdy se po vodiči A posílají impulzy s dvousekundovou prodlevou; stop kontakt vymezuje interval 49.min 40.sec až 59.min 40.sec, kdy po vodiči B žádné impulzy vysílány nejsou.

Podstatné je impulzní relé, které vytváří stejnosměrné impulzy v linkových vodičích — vlastními řídicími kontakty tak teče mnohem menší proud a jsou zapojeny na nižší střídavé napětí. Přepínač NORMAL–ADVANCE slouží pro manuální dokrokování linky.

![Nákres kontaktů](/img/decin/IBM/nakres.jpg)

![Nálezový stav](/img/decin/IBM/RADO_nalezovy_stav.jpg)

![Zjednodušené schéma](/img/decin/IBM/zakladni_schema.jpg)

## Nová ochrana kontaktů před jiskřením

Spolehlivost spínání zvýšíme nižším napětím a ochrannými diodami. Jako levné a spolehlivé řešení lze použít modul Dual H-můstek s **L298N** (z konstrukcí s Arduinem, cca 55 Kč) — získáme zesilovač pro spínání indukční zátěže i zdroj napětí. Modul nepoužíváme jako H-můstek, ale jako dvojici zesilovačů realizovanou polovinou každého můstku pro dráty A a B.

![Modul s L298N](/img/arduino/modul_L298N.jpg)

Výhodou je vlastní step-down zdroj 5 V, který lze použít pro napájení logiky spínacích kontaktů — potřebujete tak pouze zdroj pracovního napětí (např. 24 V). Výstupy z vačkové logiky A a B vedete na vstupy poloviny každého můstku; aby při rozpojených kontaktech nevznikaly nejisté stavy, uzemníte tyto vstupy přes odpory 10 kΩ. Společný bod cívek v hodinách musí být zapojen jen na OUT2 nebo OUT3 (aby nedošlo ke zkratu mezi můstky), drát A na OUT1, drát B na OUT4. Použití modulu prakticky znemožní jiskření na kontaktech a zvýší spolehlivost funkce. Odzkoušeno.

---

Exponáty v Hodináriu: [Podružné hodiny IBM](/sbirka/karta/inv-P514-podruzne-hodiny-ibm) · [IBM strojek](/sbirka/karta/inv-P515-podruzne-hodiny-ibm-strojek).
