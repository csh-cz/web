---
title: "Zobrazení času na www 2 - č as generuje server"
slug: "cas_internet2"
category: "projekty"
originalUrl: "https://hodinarium.eu/cas_internet2.htm"
lastModified: "Wed, 26 Apr 2017 16:12:00 GMT"
sourceCharset: "windows-1250"
scrapedAt: "2026-04-27T17:37:08.659Z"
tldr: 'Nejjednodušší je zobrazovat čas vždy správně. Nejlépe touto tautologií: Je právě tolik hodin, kolik právě je. S tím ovšem daleko nedojdeme. Se statickým zobrazením máme potíž.…'
---
Nejjednodušší je zobrazovat čas vždy správně. Nejlépe touto tautologií: *Je právě tolik hodin, kolik právě je.* S tím ovšem daleko nedojdeme. Se statickým zobrazením máme potíž. Většinou nám nestačí **vyjádření času, které jednorázově vydal www server**. Nápis aukce končí za 2 minuty, nám moc neřekne, když nevíme, před jakou dobou tuto informaci server vyrobil. Pomoci musí aktivní technologie na straně prohlížeče. Bylo by možné informaci periodicky opakovat třeba pomocí tagu Refresh a pravidelně žádat server o zaslání času znovu. Ovšem to by vyvolávalo zbytečnou potřebu přenosu ostatních dat stránky.

Naštěstí je možné udělat jakýsi kompromis. **Vyslat informaci o správném čase www serverem a** dále **animovat plynutí času** třeba pomocí JAVA scriptu. Tento animační program zjistí odchylku vašich hodin od spráného času a pak již vesele přičítá vteřiny v rytmu vlastních hodin počítače - s přesností podle podmínek spojení tak 0,5 sekundy.

Tak pracovala například stránka [cs.thetimenow.com](http://cs.thetimenow.com/clock/), kde si návštěvník mohl složit vlastní embed widget — výběr formátu (12 / 24h), barev pozadí i číslic, šířky okraje, fontu. Vložená ukázka byla na původním webu virtuálního muzea, dnes by stejně přestala fungovat (služba změnila API i embed-URL formát).

Na serveru [**www.presnycas.cz**](http://www.presnycas.cz/) tvrdí, že "*Přesný čas na serveru je přímo získáván pomocí protokolu NTP z kořenového časového serveru s atomovými hodinami (odchylka času na našem serveru od absolutně přesného času se pohybuje v řádu milisekund). Na Vašem počítači je čas z našeho serveru zobrazován pomocí Java Apletu. Celková odchylka času zobrazeného na Vašem počítači od atomového času je závislá na kvalitě připojení k Internetu. Řádově se pohybuje do 0,5 sec.*"

Tuto metodu také u vidíte (doufejme) na serveru [www.time.gov](https://www.time.gov/) Nepřehlédněte obrázek světa s vyznačením pásem dne a noci. To jsou vlastně také hodiny, protože i tento obrázek "jde", respektive se mění podle času. Pokud bychom na obrázek doplnily 24 hodinovou pohyblivou časovou osu, vzniknou univerzální hodiny, které pro každé místo na zemi ukazují správný sluneční čas. Tento čas se ovšem liší od času, který platí v daném časovém pásmu.

Aby to nebylo vše, tak obrázek závisí i na datu v kalendáři, protože slunce svítí jinak v létě, jinak v zimě. Graficky se to projevuje změnou tvaru plochy slunečního svitu. Tvar závisí na poloze Země vůči Slunci, na orientaci zemské osy a vzdálenosti od Slunce.

Tato kombinace technologií je dostatečně efektní, aby byla zařazena do virtuálního muzeu kuriózních hodin. Doporučuji vaší pozornosti i další stránky tohoto serveru
