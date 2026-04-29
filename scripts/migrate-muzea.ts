/**
 * Přesune muzea ze horologie-cz/data/spolky.ts do
 * content/hodinarium-eu/<slug>.md s category: muzea.
 *
 * Vytvoří článek pro každé muzeum z spolky.ts (typ: 'muzeum').
 * Pokud slug už existuje, skip (např. mindelheim už je v hodinarium-eu).
 *
 * Po přesunu:
 *   - spolky.ts ručně updatovat (smazat muzea entries — ne tímto skriptem)
 *   - spolky.astro ručně updatovat (odstranit muzea sekci)
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const HODINARIUM_CONTENT = join(ROOT, 'content/hodinarium-eu');

interface Muzeum {
  slug: string;
  jmeno: string;
  zeme: string;
  popis: string;
  web?: string;
}

// Manuální data z spolky.ts (typ: 'muzeum'). Slugy jsou normalizované
// pro hodinarium-eu (lowercase, snake_case, lokalita-oriented).
const MUZEA: Muzeum[] = [
  {
    slug: 'muzeum_furtwangen',
    jmeno: 'Deutsches Uhrenmuseum Furtwangen',
    zeme: 'evropa',
    popis:
      'Schwarzwaldské muzeum hodin v jihoněmeckém Furtwangenu — kolébka kukačkových hodin a jedna z nejvýznamnějších evropských sbírek mechanického hodinářství. Stálá expozice mapuje hodinářskou tradici Černého lesa od 17. století po současnost; součástí je i sekce o astronomických hodinách a moderních elektronických oscilátorech.',
    web: 'https://www.deutsches-uhrenmuseum.de/',
  },
  {
    slug: 'muzeum_glashutte',
    jmeno: 'Deutsches Uhrenmuseum Glashütte',
    zeme: 'evropa',
    popis:
      'Saské hodinářské muzeum v centru německé hodinářské tradice (Glashütte). Sbírka mechanických hodin a hodinek od poloviny 19. století po současnost; významný důraz na vývoj přesných pražcových strojů a saskou školu jemné mechaniky.',
    web: 'https://www.uhrenmuseum-glashuette.com/',
  },
  {
    slug: 'muzeum_mih_chaux_de_fonds',
    jmeno: 'Musée International d’Horlogerie',
    zeme: 'evropa',
    popis:
      'Mezinárodní muzeum hodinařství v La Chaux-de-Fonds (Švýcarsko) — vrcholná světová sbírka, restaurátorské pracoviště a referenční institut hodinářské vědy. MIH provozuje Institut L\'homme et le temps a vydává odborné publikace; sbírka pokrývá historii měření času od slunečních hodin po atomové.',
    web: 'https://www.chaux-de-fonds.ch/musees/mih',
  },
  {
    slug: 'muzeum_wien',
    jmeno: 'Wien Museum Uhrenmuseum',
    zeme: 'evropa',
    popis:
      'Vídeňské muzeum hodin v paláci Obizzi — sbírka přes 700 hodin od gotiky po 20. století. Zvláštní význam má kolekce barokních pendlovek a vídeňských stolních hodin. V roce 2024 muzeum prošlo rekonstrukcí; expozice je rozšířena o moderní interaktivní výklad.',
    web: 'https://www.wienmuseum.at/de/standorte/uhrenmuseum',
  },
  {
    slug: 'muzeum_royal_observatory',
    jmeno: 'Royal Observatory Greenwich',
    zeme: 'svet',
    popis:
      'Královská observatoř Greenwich u Londýna — Harrisonovy mořské chronometry H1—H4, nultý poledník, GMT. Klíčová instituce pro historii navigace a měření času. Součástí komplexu je Národní námořní muzeum (NMM) s největší sbírkou slunečních hodin na světě.',
    web: 'https://www.rmg.co.uk/royal-observatory',
  },
  {
    slug: 'muzeum_olomouc_vmo',
    jmeno: 'Vlastivědné muzeum v Olomouci — orlojní sbírka',
    zeme: 'cesko',
    popis:
      'Olomoucké Vlastivědné muzeum eviduje téměř dva miliony sbírkových předmětů, mezi nimi unikátně dochovaný soubor originálních součástek olomouckého orloje. V roce 2019 hostilo výstavu k 500. výročí první zmínky o orloji (kurátor Radim Himmler), kde byly poprvé prezentovány repliky a emulátory zaniklých částí.',
    web: 'https://www.vmo.cz/',
  },
  {
    slug: 'muzeum_gdansk_marien',
    jmeno: 'Astronomický orloj v Mariackém kostele v Gdaňsku',
    zeme: 'evropa',
    popis:
      'Středověký orloj v gdaňské Bazilice Nanebevzetí Panny Marie. Patří mezi nejstarší dochované astronomické věžní hodiny v Polsku. V roce 2022 byl detailně prezentován prof. A. Januszajtisem na rostockém symposiu Mittelalterliche astronomische Großuhren.',
  },
  {
    slug: 'muzeum_stara_bystrica',
    jmeno: 'Slovenský orloj — Stará Bystrica',
    zeme: 'evropa',
    popis:
      'Slovenský orloj otevřený v roce 2009 ve Staré Bystrici — největší dřevěná socha Sedembolestnej Panny Marie. Současné dílo navazující na středoevropskou orlojovou tradici, dílo sochaře Viliama Loviška a hodinářů ze závodu Vyhne.',
  },
];

const FRONTMATTER_TEMPLATE = (m: Muzeum) => {
  const refs = m.web
    ? `references:\n  - title: "Webové stránky muzea"\n    url: "${m.web}"\n    type: odkaz\n`
    : '';
  return `---
title: "${m.jmeno.replace(/"/g, '\\"')}"
slug: "${m.slug}"
category: "muzea"
originalUrl: "https://horologie-cz.pages.dev/spolky"
lastModified: null
sourceCharset: "utf-8"
scrapedAt: "2026-04-29T00:00:00.000Z"
manualEdit: true
author: "Český spolek horologický"
tags:
  - ${m.zeme}
${refs}---

${m.popis}
`;
};

let created = 0;
let skipped = 0;
for (const m of MUZEA) {
  const filePath = join(HODINARIUM_CONTENT, `${m.slug}.md`);
  if (existsSync(filePath) || existsSync(filePath + 'x')) {
    console.log(`  SKIP (existuje): ${m.slug}`);
    skipped += 1;
    continue;
  }
  writeFileSync(filePath, FRONTMATTER_TEMPLATE(m));
  console.log(`  ✓ ${m.slug}.md`);
  created += 1;
}
console.log(`\nCreated: ${created}, skipped: ${skipped}`);
