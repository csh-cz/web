---
title: "Fyzikální \"líné\" kyvadlo"
slug: "line_kyvadlo"
category: "konstrukce"
tags:
  - kyvadlo
originalUrl: "https://hodinarium.eu/line_kyvadlo.htm"
lastModified: "Fri, 30 Jun 2023 11:40:00 GMT"
sourceCharset: "windows-1250"
scrapedAt: "2026-04-27T17:37:02.515Z"
tldr: 'Tato stránka se zaměřuje na to, jak jednoduše reálné kyvadlo zpomalit pro nenáročné aplikace a to jinak než prodloužením jeho délky.'
---
![pilovky](/img/line_kyvadlo/differentialni_kyvadlo.jpg)Prakticky každý, kdo se zajímá o hodiny, zná vzoreček na výpočet délky matematického [kyvadla](/slovnik/kyvadlo). Kupodivu málokdo zná podobný vzoreček na výpočet fyzikálního kyvadla. Každé reálné [kyvadlo](/slovnik/kyvadlo) je však kyvadlo fyzikální. Hmota kyvadla tak působí jednak jako hmota kterou urychluje tíhové zrychlení, jednak jako hmota setrvačná působící proti změně rychlosti pohybu. Tato dvě působené se projevují různě, proto neplatí známá "poučka", že na hmotě nezáleží. Neplatí v celém rozsahu ani pravidlo, že prodlužováním vzdálenosti mezi bodem otáčení a těžištěm se zvyšuje doba kyvu.

Tato stránka se zaměřuje na to, jak jednoduše reálné kyvadlo zpomalit pro nenáročné aplikace a to jinak než prodloužením jeho délky.

## Trocha teorie

U každého kyvadla na jeho hmotu v těžišti působí na jedné straně gravitace, která vyvolává pohyb směrem k rovnovážné poloze a na druhé straně se setrvačnost hmoty snaží bránit změně rychlosti pohybu. Pouze u matematického kyvadla se vliv hmoty na kterou působí tíhové zrychlení a vliv setrvačné hmoty projevuje ve stejném bodě a stejně, takže velikost hmoty kývání neovlivňuje. Bez hmoty by to ovšem nekývalo. Vzoreček pro výpočet doby kyvu libovolného kyvadla je jednoduchý. Odvození najdete například v prvním odkazu.

t = pí SQRT( J/mgl)
kde J je moment setrvačnosti, m - hmota kyvadla,
g - gravitační zrychlení a l - vzdálenost těžiště od osy otáčení.

Aby se vzorečky daly snadno psát do textu, píšeme druhou odmocninu jako funkci SQRT().

U matematického kyvadla je hmota, soustředěna v bodu, tedy celkový J = ml2. Po dosazení vyjde známý vzorec **t** **= pí SQRT( l/g)**

## Diferenciální matematické kyvadlo

Problém praktického výpočtu ovšem je, **jak jednoduše stanovit moment setrvačnosti** u reálného kyvadla. Pro často používanou konstrukci "líného" kyvadla však zjednodušené řešení existuje. Když nahlédneme do Mechaniky od Dr. Strouhala z roku 1901, vidíme, že kyvadlo na obrázku chápe jako (v původním pravopisu) **"differentialni matematické kyvadlo"**, které jde spočítat celkem snadno. V idealizovaném modelu má toto kyvadlo na nehmotné tyči ve vzdálenosti l od osy otáčení dva stejné hmotné body o hmotnosti m. Na obrázku je jeden pod osou, druhý nad osou, ale tyč může být i jinak orientovaná. Připojí-li se k dolnímu bodu malý přívažek m0, působí svou direkční silou D=m0gl nejen proti setrvačnosti vlastní, ale i proti setrvačnosti celkové hmoty M=2m+m0. Celkový moment setrvačnosti je pak J=Ml2. (Proti obrázku Dr. Strouhal předpokládá, že hmota m0 je pevně připojena v bodě dolního bodu. Kyvadlo na obrázku má tento přívažek - regulační matičku posuvnou.)

Doba kyvu diferenciálního kyvadla je tedy: t=pí SQRT(J/m0gl), po zjednodušení t=pí SQRT(Ml/m0g). Zásadní zjednodušení výpočtu spočívá v tom, že se nepočítá s direkční silou celé hmoty působící v těžišti, ale pouze s direkční silou přívažku působící v bodě přívažku, zatím co v momentu setrvačnosti se projevuje veškerá hmota. Porovnáním se vzorcem pro dobu kyvu matematického kyvadla dochází Strouhal k názoru, že **pro diferenciální matematické kyvadlo platí, že doba kyvu se zvýší tolikrát, kolikrát je odmocnina z celkové hmoty větší než odmocnina z urychlovací hmoty** m0**.**

Zkusíme jako příklad odpovědět na následující otázku. Jak by kývalo kyvadlo sekundové dlouhé 1 metr od závěsu k těžišti, váha čočky kyvadla 10 kg, kdybychom na ose jeho závěsu k němu připevnili setrvačník o průměru 1 metr a hmotnosti 50 kg, s osou v bodu závěsu kyvadla. Takto to nejde spočítat, protože pojem setrvačník o poloměru 1 m s hmotností 50 kg nemá určené rozložení hmoty, tedy nelze spočítat moment setrvačnosti. Pokud by setrvačník byl udělán jako u diferenciálního matematického kyvadla, tedy dva hmotné body ve stejné vzdálenosti 1 m, nebo kdyby byl setrvačník ve tvaru obruče, pak vyjde jednoduché: t=pí SQRT(60/10g). Kyvadlo by proti matematickému mělo kývat přibližně 2.45 krát pomaleji.

Metodu náhradu kyvadla několika hmotnými body můžeme uplatnit i pro jiné konstrukce "líných" kyvadel.

![T kyvadlo](/img/line_kyvadlo/T_kyvadlo.jpg)

## **Kyvadlo "obrácené T"**

**Takové kyvadlo je na snímku vlevo. Jeho hlavní výhoda je, že se snáze realizuje protože nepotřebuje hmotu nad závěsem. Je to vlastně setrvačník předchozího kyvadla posunutý níže a otočený do vodorovné polohy. Můžeme si ho představit jako matematické kyvadlo o délce závěsu L, jehož hmota m byla rozdělena symetricky na obě strany na nehmotných ramenech délky R.**

**Direkční gravitační síla je stejná jako u klasického matematického kyvadla, protože rozdělením hmoty se poloha těžiště nezměnila. Moment setrvačnosti je však větší, neboť setrvačná hmota působí na větším poloměru, který je dán vzdálenost poloviční hmoty od místa závěsu. Tato vzdálenost je přeponou pravoúhlého trojúhelníka, tak ji lze snadno určit.**

**V tomto případě je moment setrvačnosti J = m(L2 + R2)**

**Po dosazení do prvního vzorce vidíme, že opět lze zkrátit zlomek velikostí hmoty, nikoliv však už délkou závěsu. Ani u tohoto "líného" kyvadla doba kyvu nezáleží na velikosti hmoty. Ovšem hmota musí být nenulová a značně převažovat nad hmotou ostatních konstrukčních prvků kyvadla..**

![váhy místo kyvadla](/img/line_kyvadlo/kyvadlo_vahy.jpg)

**Tedy:** t = pí SQRT ((L2 + R2)/gL)

Pokud je délka ramen rovná délce závěsu, je doba kyvu přibližně 1.41 krát delší než u matematického kyvadla. Ve všech těchto případech vychází redukovaná délka kyvadla větší než vzdálenost mezi osou závěsu a těžištěm. Označení "redukovaná délka" se proto moc nehodí, ale asi jiný pojem není zaveden.

## Složená kyvadla

Ve fyzice se kyvadlo chápe jako pevný předmět. Ovšem všechno co kývá můžeme považovat za kyvadlo, tedy i dvouramenné váhy na snímku připojené k hodinám Burk. Ty jsou dosti složitou soustavou pák. Základem je vodorovné rameno vah podepřené nad těžištěm soustavy. Veškerá pohyblivá hmota ovlivňuje moment setrvačnosti. Moment gravitační síly byl zde moc malý a váhy kývaly příliš pomalu. Musela se na rameno vah doplnit tyč s přívažkem (není ještě na snímku), tedy jakési urychlovací kyvadlo. Jeho prodlužováním se váhy zrychlovaly. Řešeno bylo empiricky. Tady tedy byl opačný problém, jak původní líné kyvadlo z vah urychlit. Urychlení by se dosáhlo i zmenšením pohyblivé hmoty, ovšem váhy by po odstrojení ztratily své kouzlo.

## Odkazy

- [fyzika.jreichl.com/main.article/view/206-fyzicke-kyvadlo](http://fyzika.jreichl.com/main.article/view/206-fyzicke-kyvadlo) — fyzika.jreichl.com. [cit. 2026-04-28]
- Kniha Mechanika od Dr. Č. Strouhala z roku 1901
- [Řešené úlohy z mechaniky](http://reseneulohy.cz/cs/fyzika/mechanika) — reseneulohy.cz. [cit. 2026-04-28]
