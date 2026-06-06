---
title: "DECIMÁLKY - hodiny v desítkové soustavě"
author: "Petr Král"
slug: "decimalky"
category: "zajimavosti"
imageCredit: "Archiv Petra Krále (hodinarium.eu)"
originalUrl: "https://hodinarium.eu/decimalky.htm"
lastModified: "Wed, 13 Jan 2021 10:56:00 GMT"
sourceCharset: "windows-1250"
scrapedAt: "2026-04-27T17:36:59.736Z"
tags:
  - decimalka
  - kuriozita
  - popularizace
tldr: 'Krátká epizoda Francouzské revoluce zavádějící dělení dne 10–100–100 a její ozvuky v současnosti — od překreslených číselníků z roku 1793 po internetový čas firmy Swatch s 1000 beats.'
---
Od malička se učíme hodiny v soustavě 24-60-60 a připadá nám to normální, ačkoliv kopy či mandele dnes nepoužíváme a všude jinde počítáme většinou v soustavě desítkové. Tradice je holt tradice. Francouzi se v roce 1793, v době Francouzské revoluce, vzepřeli a zavedli společně s novým kalendářem i **hodiny decimální, hodiny v soustavě 10-100–100**. Den byl rozdělen na **deset hodin**, každá **hodina na 100 minut** a každá **minuta na sto vteřin**. Půlnoc byla v 10 hodin. Polednice chodila v pět. Poledne je obvykle na hodinách dole i když existují i opačně situované číselníky.

Současný čas SEČ na decimálkách by mohl být: **?DECIMÁLKY?** .
Francouzský revoluční čas pro Paříž byl proti GMT trochu posunut (+9 minut 21 sekund). Více **[zde](http://decimaltime.hynes.net/times.html)**.

Zmínky o decimálním dělení času najdeme i jinde (Egypt, Babylón, Čína, ..), ale "pokus" ve Francii, přestože trval jen dva roky, byl asi nejvýznamější pro "běžného občana". Moc se neprosadil, ačkoliv vláda ve Francii nařídila umístit hodiny s novým číselníkem na všech možných místech. Vznikl prý tak neuvěřitelný zmatek, že se v roce 1795 Francie radějii vrátila k 24 denním hodinám.

Nadále proto musíme "bojovat" s převody údajů v soustavě poněkud složitější. V mnoha oborech by desetinné dělení bylo jistě lepší a opravdu se v různých podobách používá zejména v počítačových sítích, ale třeba i v programu EXEL, v astronomii a jinde. Převody dají trochu práce. Pro představu zkuste formulář.

Tradiční vyjádření času

Decimální vyjádření času

hod.

min.

hod.

min.

Nebudeme si všímat bouřlivé politické atmosféry a raději si ukážeme, jak se s nařízením vyrovnali hodináři. Patrně nebyl příliš čas konstruhovat nový stroj, tak se to trochu šidilo. Postavily se hodiny, které nařízení plnily alespoň částečně. Za základ se vzaly celodenní hodiny a a namaloval se jinak číselník. Většinou revoluční hodiny ukazovaly čas v obou systémech (alespoň hodinovou ručičkou). Existovaly i hodiny, se samostatnými číselníky pro oba časy.

Na prvním obrázku je najjednodušší kombinovaný číselník, kde hodinová ručička ukazuje
1-10 decimálních hodin a doplňkově 2 x 1-12. Pro minutovou ručičku má číselník pouze značení 1-60. Ukazuje tedy v minutách předrevoluční čas a oběhne číselník za den celkem 24x. Jsou to tedy "normální" celodenní hodiny, včetně převodu na minutovou ručičku, pouze s domalovaným novým číselníkem hodin. Minuty v desetinné soustavě můžeme pouze odhadovat z polohy malé ručičky. Na číselníku je přibližne 1,3 hodiny, tedy 1 hodina 30 minut.

![kombinovaný revoluční číselník (1793) — hodinová ručička ukazuje 1–10 decimálních hodin a doplňkově 2×1–12 klasických; minutová ručička sleduje předrevoluční dělení 1–60 (oběhne 24× za den), na číselníku přibližně 1,3 hodiny = 1 hodina 30 minut](/img/decimalky/225.jpg)[!
](/img/decimalky/Horloge-republicaine2.jpg)Obrázky převzaty z serveru [www.decimaltime.hynes.net](http://www.decimaltime.hynes.net/) Kliknutím zvětšte.

Na druhém číselníku zdobeném revoluční čapkou republiky a národními barvami je již pokročilejší řešení. Pro velkou ručičku jsou opět namalovány oba číselníky jako v předchozím případě. Tentokrát jsou i dva číselníky pro minuty. V tomto případě musí být ovšem dvě různé minutové ručičky s různými převody. Jedna minutová ručička obíhá číselník 10 x za den, druhá (klasická) 24 x za den.

Hodiny ukazují přibližně 2 hod 73 minut decimálního času a současně 6 hodin 29 minut klasického času. Jedna decimální hodina odpovídá 24/10 = 2,4 (2 h 24 min) klasickým hodinám. Tedy přepočet 2,73 x 2,4 = 6,552 = 6 h 33 minut. Poloha malých ručiček je celkem správná.

I u nás se docházelo k přemalování číselníků, jak svědčí [nalezená tabulka.](/img/decimalky/cedule2.jpg)

## Internetový zavináčový čas - ?zavinac? aneb "Jeden svět - jeden čas"

*(Uvedený internetový čas v titulku článku se odvozuje od hodin vačeho PC. Zatím se předpokl*á*dá , že PC je nastaven na časové pásmo GMT+1 bez letního času.
Pokud někdo víte, jak v Java Scriptu zjistit nastavení hodin PC, napište.)*

Internetový čas švýcarské hodinářské firmy [**Swatch**](http://web.archive.org/web/20130524065953/http://www.swatch.com:80/xx_en/internettime.html) také používá decimální dělení času. Den je rozdělen na 1000 beats. *(Na jiných serverech se překládá slovo "beat" jako "zavináč". Nechci se hádat, ale překládal bych to spíše jako "tik", tedy den má 1000 tiků. Tik je tedy 1 minuta 26,4 sec).* Číselně hodnota internetového času odpovídá hodnotě na výše uvedených francouzských decimálních hodinách (hodiny x 10 + minuty). Lze tedy říci, že způsob vyjádření internetového času vychází z tradic francouzské revoluce. Srovnej údaj v nadpisu článku s údajem na začátku stránky.

Rozdíl je ovšem podstatný. Pro internetový čas neplatí časová pásma. Je tedy všude na světě stejný. Internetový den začíná o půlnoci ve městě Biel ve Švýcarsku. Rozhodující poledník je tam namalovaný na budově firmy Swatch. Tento časový systém byl poprvé představen 23. října 1998. V Čechách máme to štěstí, že žijeme v témže časovém pásmu jako firma Swatch. Proto půlnoc u nás je také v @000. V ostatních pásmech je "půlnoc" příslušně posunuta. Při použití letního času je již korekce nutná i u nás.

O vhodnosti či nevhodnosti internetového času se vede diskuze. Pro celosvětové jevy, kdy například musíme zkoordinovat lidi v různých časových pásmech, je to jistě výhoda. Ať jsem kdekoliv, událost nastává ve stejný údaj internetového času. Také matematické výpočty se s internetovým časem provádějí mnohem lépe. Myslím si však, že pro běžný život to moc není. Kdo si má pamatovat v kolik beatů se někde na světě třeba vstává. Člověk, a vlastně každý živý tvor, je v čase orientován odjakživa podle Slunce. Tyto atavizmy nás neopustí ani díky Internetu. Sice si můžeme s přáteli sjednat schuzku v @627, ale stejně si to budeme muset v hlavě přepočítat. A to máme v Čechách již zmíněné štěstí.

Převod internetového času na místní pásmový čas můžete zkusit pomocí následujícího formuláře. Nastavte zavináčový čas, časové pásmo (pro které chcete převod udělat) a eventuelně i požadavek, aby byl vyjádřen letní čas. Zatím nejsou uvedena časová pásma, kde místní pásmový čas není posunut o celou hodinu. Rovněž nekontrolujeme, zda se v daném místě používá letní čas.

**Internetový čas**

**Pásmový čas +-43 sec**

*** ***@** ****

GMT Londýn LisabonGMT+1 Praha, Paříž, ŘímGMT+2 Atény Istambul KáhiraGMT+3 Moskva KuvajtGMT+4 Baku Kábul KaráčíGMT+5 TaškentGMT+6 Alma-Ata NovosibirskGMT+7 Bangkok HanojGMT+8 Peking SingapurGMT+9 Tokio SoulGMT+10 Vladivostot SydnyGMT+11 Šalamounovy ostrovyGMT+12 WellingtonGMT-11 SamolaGMT-10 Havajské ostrovyGMT-9 AljaškaGMT-8 Los AngelesGMT-7 DenverGMT-6 ChicagoGMT-5 New YorkGMT-4 CaracasGMT-3 Rio de JaneiroGMT-2 Střední AtlantikGMT-1 Azory Kapverdy
— letní čas

**Odkazy**

- [**Wikipedie**](http://en.wikipedia.org/wiki/Decimal_time)
- [**French Revolutionary calendar**](http://www.answers.com/topic/french-republican-calendar)
- [**Číselníky a další informace o "Decimal time".
    **](http://en.wikipedia.org/wiki/Decimal_time)

    * * *

- [**www.swatch.com**](http://www.swatch.com/) Domovské stránky zakladatele internetového času
- [**www.fodor.sk/Spectrum/itimec.htm**](http://www.fodor.sk/Spectrum/itimec.htm) - konvertor internetového času pro různá místa na světě
