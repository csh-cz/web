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
      + '<p>Akce navázala na dlouholetou tradici spolkových výprav po '
      + 'regionálních hodinářských památkách jižních Čech.</p>'
      + '<p><em>Pokud máte vlastní fotografie nebo vzpomínky na akci, '
      + 'ozvěte se nám — rádi popisky a podrobnosti doplníme.</em></p>',
    fotky: [
      'hero.jpg',
      '01-pivovar.jpg',
      '02-pivovar-detail.jpg',
      '03-kralovstvi-cas-uvod.jpg',
      '04-prohlidka-1.jpg',
      '05-prohlidka-2.jpg',
      '06-detaily-hodin-1.jpg',
      '07-detaily-hodin-2.jpg',
      '08-pan-kubelka.jpg',
      '09-kemp-rano.jpg',
      '10-budejovice.jpg',
      '11-zvuk-casu.jpg',
      '12-spolek.jpg',
      '13-zaver.jpg',
      '14-skupinova.jpg',
    ],
    popisky: [
      'Spolková výprava do Protivína 2022',
      'Návštěva protivínského pivovaru',
      'Pivovar Protivín — detail',
      'Království času — vstup do expozice',
      'Prohlídka Království času',
      'Prohlídka Království času (pokračování)',
      'Detail vystavovaných hodin',
      'Detail vystavovaných hodin',
      'Pan Kubelka, majitel Království času, provádí spolek expozicí',
      'Ráno druhého dne — chatky v místním kempu',
      'Druhý den — příjezd do Českých Budějovic',
      'Jihočeské muzeum — výstava Zvuk času',
      'Skupina členů spolku',
      'Závěr výpravy',
      'Skupinová fotografie',
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
