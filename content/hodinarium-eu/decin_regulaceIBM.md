---
title: "Třídrátový rozvod IBM"
slug: "decin_regulaceIBM"
category: "decin"
originalUrl: "https://hodinarium.eu/decin_regulaceIBM.htm"
lastModified: "Fri, 10 Jun 2022 22:30:00 GMT"
sourceCharset: "windows-1250"
scrapedAt: "2026-04-27T17:36:44.996Z"
---
Hodinárium v Děčíně se v roce 2017 rozrostlo o podružné hodiny INTERNACIONAL určené pro třídrátový rozvod nepolarizovaných řídících impulzů. Tento rozvod je určen pro hodiny IBM se samočinnou regulací jednotlivých podružných hodin. Systém umožňuje podružným hodinám s malou odchylkou upravit nastavení na stav matečních hodin. V současné době je v provozu sestava hlavních hodin IBM, několika podružných hodiny včetně píchaček. ![Stroj podružných hodin Internacional](/img/decin/IBM/stroj.jpg)

## Podružné hodiny

Na první pohled se strojek podružných hodin značně liší od u nás běžně používaných strojků Elektročas. Strojek je konstruován na stejnosměrné nepolarizované impulzy. (Polarizované impulzy mu však v zásadě nevadí.)

V horní části strojku můžeme vidět kotvu elektromagnetu. Po odeznění impulzu vrací kotvu do počáteční polohy pružina a západky současně posune rohatkové kolo o jeden zub. To by pro běžný chod hodin stačilo. Minutová ručička je na hřídeli rohatky. Ručkové soukolí pro převod na hodinovou ručičku je jediný převod v hodinách.

Systém IBM je však vybaven funkcí samostatného vyrovnání několikaminutových odchylek podružných hodin na čas ústředny. Systém je tvořen dvěma vačkami na minutové hřídeli a vidlici přepínající impulzové vodiče A (červený) nebo B (černý). Vidlice je většinou natočena tak (stav na obrázku), že je sepnut kontakt A. V okamžiku, kdy raménko spadne do výřezu v první vačce, vidlice se natočí a přitlačí střední kontakt ke spodnímu kontaktu B. V okamžiku, kdy raménko spadne i z druhé vačky, vidlice se vyrovná a je opět sepnut horní kontakt A. Přepínací kontakt je spojen s jedním koncem cívek elektromagnetu, druhý konec cívek je připojen k vodiči C (zelený). Vačky jsou nastaveny tak, že přepínač v 59. minutě na hodinách přepne na drát B a ve 3. minutě přepne zpět na drát A. Jinými slovy: jeden pól cívky je trvale spojen s drátem C, druhý pól přes přepínací kontakt se připojuje na drát A, nebo B ve sledu, patrném z následující tabulky.![Ciferník hlavních hodin RADO](/img/decin/IBM/centrala_instalace.jpg)

Konkrétně je to takto:

1\. až 50. minuta

minutové impulzy po vodičích A i B

normální chod

51\. až 59. minuta

minutové impulzy pouze vodiči A

zastavení předbíhajících se hodin

59.min 10.sec až 59.min 40.sec

impulzy po dvou sekundách po vodiči A

dokrokování zpožděných hodin

60\. minuta a dál

minutové impulzy po vodičích A i B

normální chod

Princip nastavení hodin spočívá ve způsobu, jak jsou po vodičích A a B (proti vodiči C) centrální jednotkou vysílány impulzy. Impulzy jsou buď posílány každou minutu na obou nebo jen na jednom z vodičů nebo jsou vysílány zrychlené impulzy každé 2 sekundy. Správně jdoucí podružné hodiny se přepojí samočinně při dosažení své 59. minuty souhlasně s časem hlavních hodin na drát B a tím zamezí příchodu zrychlených impulzů. Další minutové impulzy přijímají drátem B a pak se opět přepojí na drát A.

Pokud jsou hodiny zpožděné, nepřepnou včas a dostanou po vodiči A sérii rychlých dvousekundových impulzů, dokud nedosáhnou své 59. minuty. Podružná jednotka přepne na drát B a vyčká 60. minutový impulz.

Pokud hodiny jdou napřed, přepnou dříve a nedostanou (v intervalu 51. až 59. minuty) po vodiči B žádné impulzy. Čekají proto až do 60. minuty, až budou impulzy po B obnoveny.

Během jedné hodiny lze tak vyrovnat 10 minut předběhnutí nebo 15 minut zpoždění. K seřízení někdy může dojít i po více hodinách. Pokud je odchylka hodin velká a interval přepnutí podružných hodin leží v době, kdy jsou vysílány stejné impulzy po obou vodičích, k seřízení nedojde.

Kuriózní bylo, že získané hodiny byly přestavěny tak, že vodič A byl trvale připojen na přepínací kontakt a hodiny byly připojeny na normální dvoudrátový rozvod. Patrně původní ústředna IBM byla nahrazena "Elektročasem" a ve všech hodinách přepojili dráty. Pokud se nepoškodilo třídrátové vedení, asi stačilo na ústředně dráty A a B propojit.

## Hlavní hodiny IBM - třídrátový systém

V podružných hodinách je celkem jednoduchý systém. Složitost je obsažena v konstrukci hlavních hodin. Při pohledu na číselník hodin to ani tak nevypadá. Na fotografii jsou hlavní hodiny IBM instalované v Hodináriu. Hodiny mají motorový nátah závaží. Bez elektrického proudu hodiny vydrží v chodu asi 4 hodiny. Tuto odchylku by však automatický systém nedokázal vyrovnat. Proto by vysílání impulzů mělo být zajištěno na přibližně stejnou dobu akumulátorem.

Hlavní logiku systému zajišťuje skupina čtyř kontaktu. Sekundový kontakt, minutový kontakt, advance kontakt (pro zapnutí rychlého chodu) a stop kontakt. Z nákresu uspořádání kontaktů vidíme, že impulzy po dvou sekundách jsou odvozovány od kontaktu na sekundovém kyvadle. Hlavním výstupem jsou minutové impulzy. Protože nejde o polarizované impulzy, odpadá komplikace s obracením polarity. Stroj ještě pomocí vaček spíná pomocné kontakty. Advance kontakt vymezuje časový interval v 59. minutě 10. až 40. sekundě, kdy se po vodiči A posílají impulzy s dvousekundovou prodlevou. Stop kontakt vymezuje interval 49. minuta, 40. sekunda až 59. minuta 40. sekunda, kdy po vodiči B žádné impulzy vysílány nejsou.

Vlastní zapojení kontaktů ukazuje zjednodušené schema. Podstatné je impulzní relé, které vytváří stejnosměrné impulzy v linkových vodičích. Vlastními řídícími kontakty tak teče mnohem menší proud a jsou také zapojeny na nižší napětí a to na napětí střídavé. Přepínač označený NORMAL - ADVANCE je přepínač pro manuální dokrokování linky. V tomto režimu po obou drátech přicházení dvousekundové impulzy bez dalšího blokování či řízení.

![Nákres kontaktů](/img/decin/IBM/nakres.jpg)

![Nálezový stav](/img/decin/IBM/RADO_nalezovy_stav.jpg)![zjednodušené schema](/img/decin/IBM/zakladni_schema.jpg)

Foto: Baudisch, Král, Text: Petr Krá

* * *

* * *

* * *

![modul s L286N](/img/arduino/modul_L298N.jpg)

## Nová ochrana kontaktů před jiskřením

Zvýšení spolehlivosti spínání dosáhneme použitím nižšího napětí a například použitím ochranných diod. Rozvoj modulů používaných v konstrukcích s Arduinem umožňuje jako levné a spolehlivé řešení použít modu Dual H můstek s L298N. Získáme zesilovač pro spínání indukční zátěže a zdroj napětí a to za cenu cca 55.- Kč. [Zapojení je velmi jednoduché.](/img/arduino/schema_klasikab.jpg) Modul nepoužíváme jako H můstek, ale jako dvojici zesilovačů realizovanou polovinou každého můstku pro dráty A a B.

Výhodou je, že modul má i vlastní step-down zdroj 5V. Ten můžete s výhodou použít pro napájení logiky spínacích kontaktů, takže potřebujete pouze zdroj pracovního napětí například 24 V. Prodejce uvádí, že pracovní napětí může dosáhnout až hodnoty 46 V a proud může dosáhnout až 3 A MAX dlouhodoběji 2 A, 25 W. Osobně vych se držel 24V a použití takového množství podružných hodin, aby nebyl významně překračován výkon 25 W.

Výstupy z vačkové logiky A a B vedete na vstupy poloviny každého můstku. Aby nevznikaly při rozpojených kontaktech nejisté stavy, uzemníte tyto vstupy přes odpory 10K. To jsou jedinné doplněné součástky. Pozor, společný bod cívek v hodinách musí být zapojen jen na OUT2 nebo OUT3, aby nedocházelo ke zkratu mezi jednotlivými H můstky. A drát rozvodu linky je na OUT1, B drát na OUT4. Použití tohoto modulu prakticky znemožní jiskření na kontaktech a zvýší tak spolehlivost funkce. Odzkoušeno.

Text a konstrukce: Petr Král

* * *

* * *

* * *
