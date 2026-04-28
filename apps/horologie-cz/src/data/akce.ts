/**
 * Akce spolku — minulé i plánované.
 *
 * KAM PATŘÍ FOTKY:
 *   apps/horologie-cz/public/img/akce/<slug>/foto1.jpg
 *   apps/horologie-cz/public/img/akce/<slug>/foto2.jpg
 *
 * Cesty v `fotky` poli jsou relativní k /img/akce/<slug>/.
 * První fotka v poli = "hero" (titulní obrázek akce na indexu).
 *
 * Když přidáš fotky, doplň jejich názvy do pole `fotky` níže.
 * Pokud má fotka popisek, dej ho do pole `popisky` ve stejném pořadí.
 */

export interface Akce {
  slug: string;                  // URL část — /akce/<slug>
  rok: number;
  datum?: string;                // textový datum
  schuze?: string;               // např. "Vernisáž"
  nazev: string;
  misto?: string;
  popis: string;                 // 1—2 odstavce na index + úvod stránky
  detail?: string;               // delší text na detail stránku, podporuje Markdown
  fotky?: string[];              // např. ['hero.jpg', 'foto1.jpg', 'foto2.jpg']
  popisky?: string[];            // popisky k fotkám (stejné pořadí)
  status: 'planovana' | 'minula' | 'placeholder';
  ucastnici?: string[];          // jména pro popisky
  // Typ záznamu — odlišuje akce (vernisáže, výstavy) od událostí (zápis do rejstříku)
  typ?: 'akce' | 'udalost-spolku';
  // Geografická poloha pro mapu (souřadnice místa konání)
  lat?: number;
  lon?: number;
}

export const akce: Akce[] = [
  // ─── PLÁNOVANÉ ───
  {
    slug: 'sezona-2026',
    rok: 2026,
    datum: 'duben—říjen 2026',
    nazev: 'Sezóna 2026 v Hodináriu Děčín',
    misto: 'Zámek Děčín',
    lat: 50.7807, lon: 14.2155,
    popis:
      'Pravidelná sezóna expozice Hodinária Děčín. Otevírací doba a aktuální '
      + 'program budou zveřejněny začátkem dubna 2026.',
    status: 'planovana',
  },
  {
    slug: 'clenska-schuze-2026',
    rok: 2026,
    datum: 'jaro 2026 (termín bude upřesněn)',
    schuze: 'Členská schůze',
    nazev: 'Členská schůze CSH 2026',
    popis:
      'Pravidelná výroční členská schůze. Pozvánka s programem bude rozeslána '
      + 'členům spolku e-mailem.',
    status: 'planovana',
  },

  // ─── MINULÉ ───
  {
    slug: 'olomoucky-orloj-2019',
    rok: 2019,
    datum: '4. října 2019 — 5. ledna 2020',
    nazev: 'Olomoucký orloj — 500 let od první písemné zmínky',
    misto: 'Vlastivědné muzeum v Olomouci',
    lat: 49.5944, lon: 17.2509,
    popis:
      'Výstava ve Vlastivědném muzeu v Olomouci k 500. výročí první písemné '
      + 'zmínky o olomouckém orloji (1519). Kurátorem výstavy a autorem '
      + 'doprovodné monografie byl člen spolku Radim Himmler; David Knespl '
      + 'a Martin Šimek vytvořili repliku číselníkového patra orloje, '
      + 'Stan Marušák a Petr Král počítačový emulátor renesanční verze '
      + 'orloje. Členové spolku se rovněž podíleli na identifikaci modelu '
      + 'orloje od hodináře Jana Prokeše.',
    detail:
      '<p>Vlastivědné muzeum v Olomouci uspořádalo k <strong>500. výročí '
      + 'první písemné zmínky</strong> o olomouckém orloji (1519) výstavu '
      + '„<em>Olomoucký orloj — 500 let od první písemné zmínky</em>", '
      + 'otevřenou od 4. října 2019 do 5. ledna 2020.</p>'
      + '<p><a href="https://www.vmo.cz/vystavy/170/olomoucky-orloj--500-let-od-prvni-pisemne-zminky" '
      + 'target="_blank" rel="noopener">Stránka výstavy na vmo.cz ↗</a></p>'
      + '<h2>Účast spolku</h2>'
      + '<ul>'
      + '<li><strong>Radim Himmler</strong> — kurátor výstavy a autor '
      + 'monografie <em>Olomoucký orloj: historie v obrazech a faktech</em>, '
      + 'vydané VMO ke stejnému výročí.</li>'
      + '<li>Členové spolku se aktivně podíleli na <strong>přípravě '
      + 'exponátů</strong> — restaurování, technické konzultace, dohledávání '
      + 'historických materiálů.</li>'
      + '<li><strong>David Knespl</strong> a Martin Šimek jsou autory '
      + '<strong>repliky číselníkového patra olomouckého orloje</strong> '
      + 'podle zobrazení Josefa Vladislava Fischera z roku 1805 — replika '
      + 'byla na výstavě prezentována.</li>'
      + '<li><strong>Stan Marušák</strong> a <strong>Petr Král</strong> '
      + 'jsou autory <strong>počítačového emulátoru renesanční verze '
      + 'olomouckého orloje</strong>; emulátor byl součástí výstavy '
      + 'a je k nahlédnutí i na sesterském webu '
      + '<a href="https://orloj.eu" target="_blank" rel="noopener">orloj.eu</a>.</li>'
      + '<li>Členové spolku stáli u <strong>identifikace modelu '
      + 'olomouckého orloje od hodináře Jana Prokeše</strong> — model byl '
      + 'následně zrestaurován a na výstavě vystaven.</li>'
      + '<li>Členové spolku se zúčastnili <strong>vernisáže</strong>.</li>'
      + '</ul>'
      + '<h2>Citace</h2>'
      + '<p class="citation">'
      + 'HIMMLER, Radim. <em>Olomoucký orloj: historie v obrazech a faktech.</em> '
      + '1. vydání. Olomouc: Vlastivědné muzeum v Olomouci, 2019. '
      + 'ISBN 978-80-85037-96-8.'
      + '</p>'
      + '<p class="citation">'
      + 'KNESPL, David a Martin ŠIMEK. Replika číselníkového patra olomouckého '
      + 'orloje dle zobrazení Josefa Vladislava Fischera z roku 1805. '
      + '<em>Zpravodaj Společnosti přátel starožitných hodin.</em> 2019, č. 34, s. 20—23. '
      + '<a href="/download/Knespl-Simek-2019-replika-ciselnikoveho-patra.pdf" '
      + 'target="_blank" rel="noopener">PDF&nbsp;↗</a>'
      + '</p>'
      + '<p class="citation">'
      + 'KLIMSZOVÁ, Veronika a Jana CHALUPOVÁ. Restaurování modelu '
      + 'olomouckého orloje s přední malovanou deskou. '
      + '<em>Fórum pro konzervátory-restaurátory.</em> 2021, roč. XI, č. 1, s. 6.'
      + '</p>'
      + '<p><em>Pokud máte další fotografie z výstavy nebo z přípravných prací, '
      + 'ozvěte se na <a href="mailto:info@orloj.eu">info@orloj.eu</a>, '
      + 'rád to doplním.</em></p>',
    fotky: [
      'hero.jpg',
      '01-vyroba-1.jpg',           // 5. 8. 2019
      '02-vyroba-2.jpg',           // 10. 8. 2019
      '03-vyroba-3.jpg',           // 11. 8. 2019
      '04-vyroba-4.jpg',           // 23. 8. 2019
      '05-vyroba-5.jpg',           // 7. 9. 2019
      '06-vystava-celek.jpg',
      '07-eksponaty-1.jpg',
      '08-eksponaty-2.jpg',
      '09-vernisaz-1.jpg',
      '10-vernisaz-2.jpg',
    ],
    popisky: [
      'Výstava „Olomoucký orloj — 500 let od první písemné zmínky"',
      'Výroba exponátu — repliky orloje (5. 8. 2019)',
      'Výroba exponátu — repliky orloje (10. 8. 2019)',
      'Výroba exponátu — repliky orloje (11. 8. 2019)',
      'Výroba exponátu — repliky orloje (23. 8. 2019)',
      'Výroba exponátu — repliky orloje (7. 9. 2019)',
      'Pohled do expozice',
      'Vystavované exponáty',
      'Vystavované exponáty',
      'Vernisáž výstavy',
      'Vernisáž výstavy',
    ],
    status: 'minula',
    typ: 'akce',
  },
  {
    slug: 'rostock-2022',
    rok: 2022,
    datum: '28.—30. října 2022',
    nazev: 'VII. Symposium „Mittelalterliche astronomische Großuhren" — 550 let orloje v Rostocku',
    misto: 'Rostock (St.-Marien-Kirche), Německo',
    lat: 54.0901, lon: 12.1410,
    popis:
      'Mezinárodní symposium k 550. výročí astronomického orloje v rostockém '
      + 'Mariánském kostele. Český spolek horologický zde zastupovali David '
      + 'Knespl, Miroslav Baudisch, Petr Skála a Radim Himmler.',
    detail:
      '<p>Konec října 2022 hostilo německé hanzovní město <strong>Rostock</strong> '
      + '<strong>VII. Internationales Symposium „Mittelalterliche astronomische '
      + 'Großuhren"</strong>, věnované <strong>550. výročí astronomického orloje</strong> '
      + 'v <strong>St.-Marien-Kirche</strong> z roku 1472. Stroj je považován '
      + 'za <strong>nejstarší orloj s dochovaným funkčním středověkým strojem</strong>.</p>'
      + '<p>Pořadateli sympózia byli <strong>hanzovní a univerzitní město Rostock</strong>, '
      + '<strong>Univerzita v Rostocku</strong>, evangelicko-luteránská farnost '
      + 'mariánského kostela a spolková země Meklenbursko-Přední Pomořansko. '
      + 'Prohlídky, zasedání i doprovodný program se odehrávaly v zasedací síni '
      + 'historické budovy radnice, aule univerzity a samozřejmě v Marienkirche, '
      + 'kde se v ochozu za oltářem astronomické hodiny nacházejí.</p>'
      + '<p>Sympózia se zúčastnilo <strong>přes 60 odborníků</strong> a zájemců '
      + 'o historii orlojů z Německa, Polska, Švýcarska a Česka. Jednalo se již '
      + 'o sedmé sympózium věnované problematice (nejen baltských) středověkých '
      + 'orlojů — přednášky pokryly historii orlojů v Rostocku, Štrasburku, Praze, '
      + 'Münsteru, Bernu i Gdaňsku, opravy a restaurování řady z nich i teoretické '
      + 'zdůvodnění snahy o zápis rostockého orloje na seznam <strong>světového '
      + 'kulturního dědictví UNESCO</strong>.</p>'
      + '<h2>Česká delegace</h2>'
      + '<p>Český spolek horologický zde zastupovali <strong>ak. soch. Petr Skála</strong> '
      + '(orlojník Staroměstského orloje, restaurátor věžních hodin), <strong>Ing. David '
      + 'Knespl</strong> (hodinářský odborník a publicista, doktorand ČVUT) v doprovodu '
      + 'své paní Lenky, <strong>Ing. Miroslav Baudisch</strong> (kurátor expozice '
      + 'Hodinária na děčínském zámku) a <strong>Mgr. Radim Himmler</strong> '
      + '(ředitel Muzea Komenského v Přerově a kurátor podsbírky Chronometrie).</p>'
      + '<h2>Český příspěvek</h2>'
      + '<p>V sobotu <strong>29. 10. v 11:00</strong> zaujal publikum aktivní '
      + 'příspěvek <strong>Petra Skály</strong> na téma <em>„Die Prager Astronomische '
      + 'Uhr und ihre Restaurierung im Jahr 2018"</em>. O prezentaci v němčině '
      + 'se postaral <strong>David Knespl</strong>.</p>'
      + '<h2>Hlavní postava: Manfred Schukowski</h2>'
      + '<p>Středobodem celého setkání byl <strong>94letý emeritní profesor '
      + 'fyziky Univerzity v Rostocku</strong> Manfred Schukowski — dlouholetý '
      + 'znalec a propagátor rostockého orloje, autor monografií i průvodce. '
      + 'Pro českou delegaci se stal vítaným partnerem k diskusi o pražském '
      + 'i olomouckém orloji.</p>'
      + '<h2>Navázané a oživené kontakty</h2>'
      + '<p>Sympózium bylo cennou příležitostí k navázání či oživení kontaktů '
      + 's předními odborníky:</p>'
      + '<ul>'
      + '<li><strong>Günther Oestmann</strong> — Technická univerzita Berlín</li>'
      + '<li><strong>Markus Marti</strong> — Zytglogge Bern</li>'
      + '<li><strong>Viktoria Weinebeck</strong> — St.-Paulus-Dom Münster</li>'
      + '<li><strong>Fedor Mitschke</strong> — Univerzita Rostock</li>'
      + '<li><strong>Bettina a Jochen Motschmannovi</strong> — vedoucí sekce '
      + 'věžních hodin <em>Deutsche Gesellschaft für Chronometrie</em> '
      + '(<a href="mailto:info@f-k-turmuhren.de">info@f-k-turmuhren.de</a>)</li>'
      + '</ul>'
      + '<p>Plodné přátelství bylo navázáno také s <strong>Deutsche Gesellschaft '
      + 'für Chronometrie</strong> '
      + '(<a href="https://www.dg-chrono.de" target="_blank" rel="noopener">dg-chrono.de</a>).</p>'
      + '<h2>Prohlídka strojovny a Bad Doberan</h2>'
      + '<p>K pozoruhodným zážitkům patřila možnost prohlídky <strong>všech tří '
      + 'pater strojovny</strong> rostockého orloje, kterou se samostatně '
      + 'pro českou skupinu ochotně ujala jedna z dobrovolných „natahovačů" '
      + 'orloje paní <strong>Heike Tröger</strong>. Kromě toho byla pořízena '
      + 'studijní fotodokumentace orloje v Rostocku a astronomického číselníku '
      + 'v nedalekém cisterciáckém <strong>klášteře Bad Doberan</strong>.</p>'
      + '<h2>Vybraní řečníci a témata</h2>'
      + '<ul>'
      + '<li><strong>Pá 28. 10.</strong> — Manfred Schukowski (Rostock) vedl '
      + 'prohlídku rostockého orloje a představil novou knihu „Versteckt — '
      + 'Entdeckt"; Julian Landgraf (Univerzita Rostock) — digitální vizualizace '
      + 'hlavního a apoštolského soukolí; Tilo Schöfbeck — dendrochronologie; '
      + 'Sabine Bock a Fedor Mitschke — UNESCO World Heritage potenciál orloje.</li>'
      + '<li><strong>So 29. 10.</strong> — Günther Oestmann (Brémy): štrasburský '
      + 'orloj; Jürgen Hamel (Archenhold-Sternwarte Berlín): orloj ve Stralsundu; '
      + 'Marita Schlüter / Viktoria Weinebeck: konzervace münsterského orloje '
      + '2017—2021; Markus Marti: bernský Zytglogge; Petr Skála (přednesl D. Knespl): '
      + 'Pražský orloj; Andrzej Januszajtis (Gdaňsk): orloj v gdaňské Marii.</li>'
      + '<li><strong>Veřejné odpoledne v aule univerzity</strong> — pozdrav '
      + 'premiérky M.-V. Manuely Schwesig a rektora univerzity prof. Wolfganga '
      + 'Scharecka; přednášky Marc von der Höh, Jörg Haspel, Michael Schmidt '
      + 'a Gerhard Dohrn-van Rossum.</li>'
      + '<li><strong>Ne 30. 10.</strong> — slavnostní bohoslužba „Uhrengottesdienst" '
      + 'v Marienkirche, demonstrace nátahu orloje a přechodu z letního na zimní '
      + 'čas, závěrečný apoštolský průvod a zvonkohra.</li>'
      + '</ul>'
      + '<h2>Přínos a hodnocení</h2>'
      + '<p>Sympózium dobře ukázalo možnosti sdílení poznatků různorodých '
      + 'odborných institucí a možnosti vstřícné a interdisciplinární spolupráce '
      + 'subjektů jako farnost, univerzita, magistrát, orgány památkové péče, '
      + 'zájmové spolky či cestovní ruch. <em>Tato synergie v případě českých '
      + 'středověkých orlojů není tak rozvinuta (Praha), nebo je dokonce zcela '
      + 'zamrzlá (Olomouc). Účast na sympóziu byla přínosem nejen po odborné, '
      + 'ale i po organizační a komunikační stránce.</em></p>'
      + '<p>Příspěvky vyšly v <em>Tagungsbandu „550 Jahre astronomische Uhr '
      + 'Rostock"</em> (Thomas Helms Verlag, Schwerin). Kompletní program '
      + 'a další materiály na <a href="http://www.astronomischeuhr.de/files/symposium22.htm" '
      + 'target="_blank" rel="noopener">astronomischeuhr.de</a>.</p>'
      + '<h2>Odkazy</h2>'
      + '<ul>'
      + '<li>BAUDISCH, M. — HIMMLER, R. <em>Zpráva ze sympózia o středověkých '
      + 'orlojích v Rostocku.</em> Zpravodaj Společnosti přátel starožitných '
      + 'hodin <strong>38/2023</strong>, s. 34. (zdrojová reportáž)</li>'
      + '<li><a href="http://www.astronomischeuhr.de/" target="_blank" '
      + 'rel="noopener">astronomischeuhr.de</a> — oficiální web spolku '
      + '<em>Astronomische Uhr Rostock von 1472 e.V.</em></li>'
      + '<li><a href="https://www.dg-chrono.de" target="_blank" '
      + 'rel="noopener">dg-chrono.de</a> — Deutsche Gesellschaft für Chronometrie</li>'
      + '</ul>'
      + '<h2>In memoriam</h2>'
      + '<p><em>Od konání sympózia nás bohužel opustili hned tři vzácní '
      + 'přátelé — <strong>prof. Manfred Schukowski</strong>, bernský orlojník '
      + '<strong>Markus Marti</strong> a <strong>Jochen Motschmann</strong>. '
      + 'Setkání s nimi v Rostocku bylo o to vzácnější, čest jejich památce.</em></p>',
    fotky: [
      'hero.jpg',
      '01-rano.jpg',
      '02-zahajeni.jpg',
      '03-symposium-1.jpg',
      '04-symposium-2.jpg',
      '05-symposium-3.jpg',
      '06-symposium-4.jpg',
      '07-prestavka.jpg',
      '08-orloj.jpg',
      '09-vecer.jpg',
      '10-rano-2.jpg',
      '11-symposium-2den.jpg',
      '12-zaver.jpg',
      '13-odjezd.jpg',
    ],
    popisky: [
      'Marienkirche v Rostocku — místo konání symposia',
      '28. 10. — ráno před zahájením symposia',
      '28. 10. 13:22 — zahájení symposia',
      '28. 10. — průběh přednášek',
      '28. 10. — průběh přednášek',
      '28. 10. — průběh přednášek',
      '28. 10. — průběh přednášek',
      '28. 10. — přestávka mezi přednáškami',
      '28. 10. — astronomický orloj v Marienkirche',
      'Bernský orlojník Markus Marti a jeho pražský kolega a člen spolku Petr Skála',
      '29. 10. ráno — pokračování programu',
      '29. 10. — druhý den symposia',
      '29. 10. — závěr programu',
      '29. 10. — pohled na Rostock před odjezdem',
    ],
    status: 'minula',
    typ: 'akce',
  },
  {
    slug: 'protivin-2022',
    rok: 2022,
    datum: '19.—20. srpna 2022',
    nazev: 'Spolková výprava do Protivína',
    misto: 'Protivín, jižní Čechy',
    lat: 49.2024, lon: 14.2099,
    popis:
      'Dvoudenní spolková výprava do jižních Čech — protivínský pivovar, '
      + 'soukromá hodinářská sbírka Království času pana Kubelky, nocleh '
      + 'v kempu a druhý den návštěva Českých Budějovic a výstavy Zvuk času '
      + 'v Jihočeském muzeu.',
    detail:
      '<p><strong>Den první (19. 8. 2022)</strong> — návštěva místního '
      + '<strong>protivínského pivovaru</strong> a hlavně prohlídka '
      + '<strong><a href="https://kralovstvicasu.cz/" target="_blank" '
      + 'rel="noopener">Království času</a></strong>, soukromé hodinářské '
      + 'expozice v secesní vile z roku 1907, za osobního doprovodu jejího '
      + 'majitele <strong>pana Kubelky</strong>. Členové strávili noc '
      + 'v chatkách v místním kempu.</p>'
      + '<p><strong>Den druhý (20. 8. 2022)</strong> — přesun do '
      + '<strong>Českých Budějovic</strong>, návštěva <strong>Jihočeského '
      + 'muzea</strong> a výstavy <strong>Zvuk času</strong>.</p>'
      + '<p><em>Pokud máte vlastní fotografie nebo vzpomínky na akci, '
      + 'ozvěte se nám — rádi popisky a podrobnosti doplníme.</em></p>',
    // Pořadí fotek je chronologické podle EXIF DateTimeOriginal / času z názvu souboru.
    // Hero zůstává jako úvodní pohled (kompozice), ne první v čase.
    fotky: [
      'hero.jpg',
      '12-spolek.jpg',                 // 19. 8. 10:38 — sraz před pivovarem
      '01-pivovar.jpg',                // 19. 8. 11:52 — pivovar
      '02-pivovar-detail.jpg',         // 19. 8. 12:50 — pivovar detail
      '03-platan-pivovar.jpg',         // 19. 8. 14:06 — Platan v zahradě
      '04-prohlidka-1.jpg',            // 19. 8. 15:56 — Království času
      '05-prohlidka-2.jpg',            // 19. 8. 15:59 — KČ
      '14-skupinova.jpg',              // 19. 8. 16:00 — skupinová u expozice
      '06-detaily-hodin-1.jpg',        // 19. 8. 16:04 — KČ detail
      '07-detaily-hodin-2.jpg',        // 19. 8. 16:05 — KČ detail
      '15-mezi-prohlidkou.jpg',        // 19. 8. 16:57 — pokračování prohlídky
      '08-pan-kubelka.jpg',            // 19. 8. 17:26 — pan Kubelka
      '13-zaver.jpg',                  // 19. 8. 18:26 — večer
      '09-kemp-rano.jpg',              // 20. 8. 8:58 — kemp ráno
      '10-budejovice.jpg',             // 20. 8. 10:05 — Č. Budějovice
      '11-zvuk-casu.jpg',              // 20. 8. 10:14 — výstava Zvuk času
    ],
    popisky: [
      'Spolková výprava do Protivína 2022',
      'Setkání spolku ráno před protivínským pivovarem',
      'Návštěva protivínského pivovaru',
      'Pivovar Protivín — detail',
      'V zahradní restauraci před Protivínským pivovarem nad pulitrem místního vyhlášeného piva Platan',
      'Prohlídka Království času s panem Kubelkou',
      'Prohlídka Království času (pokračování)',
      'Skupinová fotografie u expozice Království času',
      'Detail vystavovaných hodin',
      'Detail vystavovaných hodin',
      'V průběhu prohlídky Království času',
      'Pan Kubelka, majitel Království času, provádí spolek expozicí',
      'Závěr prvního dne v Protivíně',
      'Ráno druhého dne — chatky v místním kempu',
      'Příjezd do Českých Budějovic',
      'Jihočeské muzeum — výstava Zvuk času',
    ],
    status: 'minula',
    typ: 'akce',
  },
  {
    slug: 'sezona-2025',
    rok: 2025,
    datum: 'duben—říjen 2025',
    nazev: 'Sezóna 2025 v Hodináriu Děčín',
    misto: 'Zámek Děčín',
    lat: 50.7807, lon: 14.2155,
    popis:
      'Druhá desetiletka expozice — bilanční rok. Petr dodá fotodokumentaci '
      + 'z návštěv, akcí a aktualizací expozice.',
    status: 'placeholder',
    fotky: [],
  },
  {
    slug: 'vernisaz-2017',
    rok: 2017,
    datum: '15. července 2017',
    schuze: 'Vernisáž',
    nazev: 'Vernisáž rozšířené expozice 2017',
    misto: 'Zámek Děčín',
    lat: 50.7807, lon: 14.2155,
    popis:
      'Otevření rozšířené expozice po druhé sezóně provozu. Doplnění o nové '
      + 'exponáty, mechanické i elektrické hodiny.',
    status: 'placeholder',
    fotky: [],
  },
  {
    slug: 'fotografie-2018',
    rok: 2018,
    datum: 'listopad 2018',
    nazev: 'Listopadová fotodokumentace expozice',
    misto: 'Zámek Děčín',
    lat: 50.7807, lon: 14.2155,
    popis:
      'Fotografická bilance sezóny 2018 — stav exponátů, restaurátorské '
      + 'reportáže, návštěvníci.',
    status: 'placeholder',
    fotky: [],
  },
  {
    slug: 'toulava-kamera-2016',
    rok: 2016,
    datum: '3. ledna 2016',
    nazev: 'Toulavá kamera v Hodináriu',
    misto: 'Zámek Děčín · ČT',
    lat: 50.7807, lon: 14.2155,
    popis:
      'Reportáž v pořadu Toulavá kamera České televize představila Hodinárium '
      + 'širší veřejnosti.',
    status: 'minula',
    fotky: [],
  },
  {
    slug: 'otevreni-2015',
    rok: 2015,
    datum: '4. září 2015',
    schuze: 'Slavnostní otevření',
    nazev: 'Otevření Hodinária Děčín',
    misto: 'Zámek Děčín',
    lat: 50.7807, lon: 14.2155,
    popis:
      'Slavnostní otevření nové expozice na zámku Děčín. Po stěhování '
      + 'ze Soběslavi začala v Děčíně nová kapitola spolku.',
    status: 'placeholder',
    fotky: [],
  },
  {
    slug: 'stehovani-2015',
    rok: 2015,
    datum: 'jaro—léto 2015 (foto 4. srpna 2015)',
    nazev: 'Stěhování expozice ze Soběslavi do Děčína',
    misto: 'Soběslav → Zámek Děčín',
    lat: 50.7807, lon: 14.2155,
    popis:
      'Po komunálních volbách 2015 přesun celé expozice do podkrovních prostor '
      + 'zámku Děčín. Týdny balení, převozů a instalace.',
    detail:
      '<p>Fotografická bilance přípravy expozice — týdny balení v Soběslavi, '
      + 'několik nákladních převozů do Děčína a finální instalace v podkrovních '
      + 'prostorách zámku. Fotografie pořídil <strong>Stan Marušák</strong> '
      + '4. srpna 2015, měsíc před oficiálním otevřením.</p>',
    fotky: [
      'hero.jpg',
      '01-priprava.jpg',
      '02-stehovani.jpg',
      '03-prevoz.jpg',
      '04-instalace.jpg',
      '05-vystavba.jpg',
      '06-stroje.jpg',
      '07-detaily.jpg',
      '08-fotogalerie.jpg',
      '09-zaver.jpg',
    ],
    status: 'minula',
    typ: 'akce',
  },
  {
    slug: 'dernisaz-2013',
    rok: 2013,
    datum: 'podzim 2013',
    schuze: 'Dernisáž',
    nazev: 'Dernisáž Věžního muzejíčka v Soběslavi',
    misto: 'Soběslav',
    lat: 49.2599, lon: 14.7195,
    popis:
      'Konec původní expozice ve Věžním muzejíčku v Soběslavi. Začátek hledání '
      + 'nových prostor, který vyústil ve stěhování do Děčína.',
    status: 'placeholder',
    fotky: [],
  },
  {
    slug: 'zalozeni-2009',
    rok: 2009,
    datum: '9. ledna 2009',
    schuze: 'Zápis do rejstříku',
    nazev: 'Vznik Virtuálního muzea hodin',
    misto: 'Soběslav',
    lat: 49.2599, lon: 14.7195,
    popis:
      'Zápis Virtuálního muzea hodin o.s. — předchůdce dnešního CSH — '
      + 'do rejstříku Ministerstva vnitra ČR.',
    status: 'minula',
    typ: 'udalost-spolku',
    fotky: [],
  },
  {
    slug: 'transformace-2014',
    rok: 2014,
    datum: '1. ledna 2014',
    nazev: 'Transformace na zapsaný spolek',
    misto: 'Soběslav',
    lat: 49.2599, lon: 14.7195,
    popis:
      'Po změně občanského zákoníku přechod z občanského sdružení na zapsaný spolek.',
    status: 'minula',
    typ: 'udalost-spolku',
    fotky: [],
  },
  {
    slug: 'stanovy-2015',
    rok: 2015,
    datum: '5. června 2015',
    schuze: 'Zakládací schůze CSH',
    nazev: 'Schválení Stanov a změna názvu na CSH',
    misto: 'Praha',
    lat: 50.0875, lon: 14.4214,
    popis:
      'Zakládací schůze Českého spolku horologického. Schváleny stanovy '
      + 'spolku, schválena změna názvu z Virtuálního muzea hodin.',
    status: 'minula',
    typ: 'udalost-spolku',
    fotky: [],
  },
  {
    slug: 'csh-2016',
    rok: 2016,
    datum: '5. března 2016',
    nazev: 'Zápis nového názvu CSH do rejstříku',
    misto: 'České Budějovice',
    lat: 48.9747, lon: 14.4747,
    popis:
      'Krajský soud v Českých Budějovicích zapsal nový název spolku '
      + '"Český spolek horologický" do spolkového rejstříku '
      + '(Fj 4845/2016/KSCB).',
    status: 'minula',
    typ: 'udalost-spolku',
    fotky: [],
  },
];

export function getAkce(slug: string): Akce | undefined {
  return akce.find((a) => a.slug === slug);
}

export const akceMinule = akce
  .filter((a) => a.status !== 'planovana')
  .sort((a, b) => b.rok - a.rok || (b.datum ?? '').localeCompare(a.datum ?? ''));

export const akcePlanovane = akce.filter((a) => a.status === 'planovana');
