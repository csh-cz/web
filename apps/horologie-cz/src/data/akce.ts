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
    slug: 'rostock-2022',
    rok: 2022,
    datum: '27.—29. října 2022',
    nazev: 'Symposium 550 let astronomického orloje v Rostocku',
    misto: 'Rostock (Mariánský kostel), Německo',
    lat: 54.0901, lon: 12.1410,
    popis:
      'Mezinárodní symposium k 550. výročí rostockého astronomického orloje. '
      + 'Spolek zastupovali David Knespl, Miroslav Baudisch, Petr Skála '
      + 'a Radim Himmler.',
    detail:
      '<p>Konec října 2022 hostilo německé hanzovní město <strong>Rostock</strong> '
      + 'mezinárodní symposium k <strong>550. výročí astronomického orloje</strong> '
      + 'v Mariánském kostele (Marienkirche). Stroj z roku 1472 je považován za '
      + '<strong>nejstarší orloj s dochovaným funkčním středověkým strojem</strong>.</p>'
      + '<p>Experti diskutovali nové vědecké poznatky o díle a o jeho restaurování. '
      + 'Příspěvky vyšly v <em>Tagungsbandu „550 Jahre astronomische Uhr Rostock"</em>.</p>'
      + '<p>Český spolek horologický zastupovali <strong>David Knespl</strong>, '
      + '<strong>Miroslav Baudisch</strong>, <strong>Petr Skála</strong> a '
      + '<strong>Radim Himmler</strong>.</p>'
      + '<p>Při symposiu bylo navázáno plodné přátelství s <strong>Deutsche '
      + 'Gesellschaft für Chronometrie</strong> '
      + '(<a href="https://www.dg-chrono.de" target="_blank" rel="noopener">dg-chrono.de</a>).</p>'
      + '<p><em>Pokud máte přesnější popisky k jednotlivým fotografiím a další '
      + 'podrobnosti k programu, ozvěte se, rád to doplním.</em></p>',
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
      '28. 10. — večerní setkání účastníků',
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
