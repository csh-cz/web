---
title: "Vrtuálky - Propeller Clock - vrtulové hodiny - strobo hodiny"
slug: "propeller-clock"
category: "projekty"
imageCredit: "Archiv Petra Krále (hodinarium.eu)"
originalUrl: "https://hodinarium.eu/propeller_clock.htm"
lastModified: "Fri, 13 Apr 2018 15:44:00 GMT"
sourceCharset: "windows-1250"
scrapedAt: "2026-04-27T17:36:46.948Z"
tldr: 'Konstrukce s rotujícím LED ukazatelem, kde mikroprocesor synchronizuje záblesky polohou pohybu — od Blickova projektu z roku 1997 přes komerční stroboskopické varianty po patent US 6856303.'
---
Občas si myslím, že všechno tady již bylo. Pak se náhle objeví nová myšlenka. A je to tu. Jsou tu magické virtuální vrtulové hodiny. Tato myšlenka se poprvé objevila +- v roce 1996. Jsme velmi rádi, že na stránkách tohoto našeho virtuálního muzea kuriózních hodin můžeme představit hodiny s rotačním displejem, **reálné hodiny s virtuálním ukazatelem času.
***V tomto případě by bylo na místě místo o virtuálním hovořit o vrtuálním ukazateli času (od slova vrtule). Hodinám takto vytvořeným budeme proto říkat **vrtuálky.***

Hodiny mají ukazatel času umístněný na točící se "vrtuli". Ukazatel je tvořen zdroji světla (nejčastěji svítícími diodami - LED, ale třeba i digitrony). Rozsvěcování je ovládáno obvykle programem běžícím na 8 bitovém mikroprocesoru tak, aby v prostoru vznikl zdánlivý obraz ručiček hodin, číselného vyjádření času, případně jakékoliv další informace. Co bude zobrazováno určuje obslužný program. Zobrazovaná informace se může plynule měnit. Program běžící na mikroprocesoru je při zobrazování limitován pouze "rozlišením" rotačního displeje, které je dáno především počtem použitých diod a stabilitou otáček.

Možná první číslicové vrtulové hodiny publikoval 25. ledna 1997 pan Bob Blick. Učil elektroniku a vytvářel pro studenty jednoduché elektronické konstrukce. Vznikl tak i projekt hodin, respektive projekt podivuhodného ukazatele času, který autor nazývá "Mechanically scanned digital clocks operated by a PIC that uses an array of LEDs to create the illusion of digits". Princip vytváření virtuálního obrazu v prostoru zaujal mnoho dalších designérů. Po celém světě vznikají stále nové a nové trochu bláznivé konstrukce. Pokusíme se je trochu roztřídit. Dnes je způsob zobrazení - **Rotating display system** - chráněn patentem USA [6856303](http://www.freepatentsonline.com/6856303.html).

![Podobně vypadající hodiny, lze koupit za cca 130 USD.](/img/propcloch_anim1.gif)

## Analogové vrtuálky

Analogové vrtulové hodiny zobrazují ručičky imaginárních hodin. Patří tak k jednodušším typům vrtuláků. Rotující rameno hodin (vrtule) nese řadu svítících diod. Mikropočítač ve vhodný okamžik rozsvítí některé LEDky tak, aby pozorovatel viděl zdánlivé ručičky hodin. Základním problémem, který musí být vyřešen, je snímání polohy točícího se ramene. Nejčastěji se to řeší hallovou sondou. Pak už je to na programu mikroprocesoru, aby ve vhodný čas, který odpovídá natočení vrtule, rozsvítil vybrané diody. Na animaci se objevují základní číslice číselníku. Číslice jsou rovněž vytvořeny záblesky diod ve vhodných polohách ramene. A to je již přechod k číslicovému zobrazení času.

**Diodové číslicové vrtuálky**

Jsou technicky prakticky stejné. Pouze jiný program mikroprocesoru vytváří jiné zobrazení. Může být zvoleno jiné uspořádání řady LEDek a to rovnoběžně s osou otáčení. Virtuální obraz tak vzniká válcový. Nicméně se používá i uspořádání předchozí.

!

!

Zde je použit stejný princip, pouze jako zdroj světla je zvolen digitron. Obraz číslice tak vzniká najednou v jedné poloze ramene. V dalších polohách dojde k rozsvícení dalšího řádu údaje času. Vypadají třeba takto:

!

!

**Komerčně vyráběné "[kyvadlové](/slovnik/kyvadlo)" STROBO hodiny**

**V** poslední době se na trhu objevily hodiny, kterým se začalo říkat stroboskopické. Koncem roku 2006 byla jejich cena od 749.- až do 1 295.- Kč. Pokud jsem milovníky klasických hodin vyděsil použitím termínu "kyvadlové", tak jsem to udělal jen proto, abych zdůraznil odlišnost pohyblivého displeje, který se neotáčí, ale kývá. Jde o velmi podobnou konstrukci, která využitím kmitajícího [kyvadla](/slovnik/kyvadlo) místo otáčející se vrtule možná zdařile uniká nástrahám patentové ochrany. *!*Technicky se zjednodušují problémy spojení elektroniky se zobrazovací jednotkou, na druhé straně je provedení kyvadla mechanicky poněkud náročnější.

Cituji z letáku:" *Tyto víceúčelové hodiny slouží k automatickému zobrazování času, datumu a různých textů nebo zpráv, které si můžeme sami napsat a vložit do paměti a naprogramovat tak, že se bude text zobrazovat stále nebo jen v určitý den. Kratší text se zobrazuje jako stojící, delší text se plynule posouvá. Text i číslice jsou zobrazovány svítícími LED diodami, které jsou upevněny na kyvadélku, které velmi rychle kmitá, takže vzniká stroboskopický jev. Díky tomuto jevu vzniká dojem, že text visí ve vzduchu. Hodiny jsou napájeny síťovým adapterem a zálohovány třemi alkalickými bateriemi."*

Použití termínu *stroboskopický jev*, pro popis funkce zobrazovací jednotky není možná nejšťastnější. Jde spíše o jev opačný. V každém případě jde o zajímavé hodiny, které stojí za to, zařadit do sbírky. Mohou například zobrazovat nápis: "Ať vzkvétá virtuální muzeum virtuálních hodin".

**Kuriózní a ještě kurióznější**

Myšlenka použití rotačního displeje již našla pokračovatele. Můžete je vidět na následujících stránkách. Někde je uveden i popis konstrukčního řešení a realizace. Některé vrtulové hodiny se dají i koupit, třeba v odkazu 11. Princip rotačního displeje je dále používán k reklamním informacím a je vytvářen z roztodivných otáčivých předmětů. Více zejména v odkazu č. 6.

**Některé další zajímavé linky:**

1. www.bobblick.com/techref/projects/propclock/propclock.html
2. www.graffagnino.net/frankie/projects/propeller\_clock/
3. www.graffagnino.net/frankie/projects/propeller\_clock/index.php
4. www.luberth.com/analog.htm
5. hackedgadgets.com/2006/06/29/nixie-propeller-clock/

!
