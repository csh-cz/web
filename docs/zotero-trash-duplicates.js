/* eslint-disable */
/**
 * Zotero JavaScript: přesun duplicitních PDF do Trashe
 *
 * VYGENEROVÁNO automaticky: scripts/zotero-trash-duplicates.py
 *
 * BEZPEČNOST:
 *   - Defaultně DRY_RUN=true (nic se nesmaže, jen vypíše souhrn)
 *   - Trash je reverzibilní — itemy lze obnovit z Zotero → Trash
 *   - Reference v slovniku používají PARENT key, ne attachment key,
 *     takže smazání PDF přílohy NEOVLIVNÍ existující citace.
 *
 * POUŽITÍ:
 *   1. Otevři Zotero → Tools → Developer → Run JavaScript
 *   2. Zkopíruj celý tento soubor a vlož do dialogu
 *   3. PRVNÍ run: nech DRY_RUN=true, ověř výstup
 *   4. DRUHÝ run: změň DRY_RUN=false, spusť znovu
 *   5. Items jsou v Trashi → ověř → Empty Trash když OK
 *
 * V případě nejistoty: ne spouštět, nejdřív se zeptat.
 */

const DRY_RUN = true;  // ← Změň na false pro skutečný přesun do Trashe
const BATCH_SIZE = 50; // Trashujeme po dávkách kvůli UI responsivity

// === KANDIDÁTI KE SMAZÁNÍ (242 souborů, ~1414.7 MB) ===
//
// Rozpad podle důvodu:
//   - broken-attachment-duplicate (all MISSING): 22 souborů
//   - identical-duplicate (keep first): 150 souborů
//   - lower-quality: 70 souborů
//
// Sample (prvních 10):
//   - EPD9AV6X (parent H868QUKS) — identical-duplicate (keep first) — Bedini a Maddison - 1966 - Mechanical Universe The Astrarium
//   - FVRC42VY (parent H868QUKS) — identical-duplicate (keep first) — Bedini a Maddison - 1966 - Mechanical Universe The Astrarium
//   - GQJ3U4EE (parent VZIC4ASR) — identical-duplicate (keep first) — Enikő - ÓRAHASZNÁLAT A KÖZÉPKORI MAGYARORSZÁGON.pdf
//   - Z75IFXEH (parent VZIC4ASR) — identical-duplicate (keep first) — Enikő - 1992 - Órahasználat a középkori Magyarországon.pdf
//   - MA6FJSZJ (parent L8LXAXMM) — identical-duplicate (keep first) — Porzionato et al. - 2012 - The Anatomical School of Padua.pd
//   - VR5EJBQ9 (parent L8LXAXMM) — identical-duplicate (keep first) — Porzionato et al. - 2012 - The Anatomical School of Padua.pd
//   - RZYIUAWY (parent ABA7YN2J) — identical-duplicate (keep first) — Haškovec - 1917 - O orloji na pražské radnici.pdf
//   - BGJD5PHK (parent ABA7YN2J) — lower-quality — Haškovec - 1917 - O orloji na pražské radnici
//   - R7RL8LMN (parent JTEVTGNW) — identical-duplicate (keep first) — Gilbert - 1977 - A Letter of Giovanni Dondi dall'Orologio to
//   - WFB4335I (parent JTEVTGNW) — identical-duplicate (keep first) — Gilbert - 1977 - A Letter of Giovanni Dondi dall'Orologio to

const ATTACHMENT_KEYS = [
  "EPD9AV6X",
  "FVRC42VY",
  "GQJ3U4EE",
  "Z75IFXEH",
  "MA6FJSZJ",
  "VR5EJBQ9",
  "RZYIUAWY",
  "BGJD5PHK",
  "R7RL8LMN",
  "WFB4335I",
  "RE8VHS9C",
  "MSYXJMDR",
  "ZRNN5EYY",
  "JX53VNQI",
  "SH66SL99",
  "TW59823D",
  "T8Y6J3AR",
  "M7VEUPUD",
  "KEA9SEK7",
  "BTIVKI7F",
  "JLXHVW97",
  "SY96YG5W",
  "YLY85PPX",
  "N8CYK5RK",
  "BTLG4YGP",
  "RMY25RTC",
  "95SNY95L",
  "9CVXI7TW",
  "RADV9QPN",
  "W36C93YA",
  "46VJJF7Z",
  "9GQ9H3RG",
  "MCE6ZC9J",
  "TRUZPA9L",
  "N6BRRTGR",
  "VQ9MGIVF",
  "LCBAKWEF",
  "N2GV7TXG",
  "QDKB9DX5",
  "DRXM6FT4",
  "LVDSWSE7",
  "BBIIVV24",
  "S4Y4R594",
  "MVHNU66Q",
  "ZVM9V36L",
  "KA7EZRLG",
  "PJGPN8C9",
  "EFPEHUWJ",
  "TFDHGDME",
  "4RDV5FWM",
  "NGLYH4BI",
  "M4RLT55Q",
  "VLARVDGC",
  "VN36USV5",
  "RTP432FL",
  "QVMRUVTH",
  "75WMF7VZ",
  "X5JCGMS3",
  "HZ9PBX7X",
  "NZU2NXXA",
  "ZTNGE4T3",
  "8IPPZH3K",
  "F3S8NPL5",
  "PMXSVS7M",
  "E7EJJ24U",
  "P3TRB35R",
  "7XDQSPB5",
  "93VJASRD",
  "8FQHQ6JI",
  "Q6Q6PX48",
  "HNME4MP4",
  "XQNAA9T4",
  "FDXJGNSP",
  "SPIBQVCK",
  "AAR4EN4D",
  "QF93KWQJ",
  "T743NRGH",
  "U5LQDQ3B",
  "HA4PJ3HP",
  "W3ZLYJ5V",
  "KIGH96C6",
  "255U6XBD",
  "UIMJ4NHX",
  "QSRRRCEI",
  "YR6BWJ6A",
  "NYDLRET7",
  "QV98TY56",
  "XSXMYAWG",
  "T76PGLLL",
  "FYAARBAT",
  "FGFYAI7N",
  "SP5YPHU7",
  "MKQ24KG8",
  "NCZXLI4P",
  "W9PJAH23",
  "YHDY7PD5",
  "QHSA4ZCW",
  "YWFP2F59",
  "A5BGAN65",
  "2RSRPBHS",
  "5YFSXA73",
  "YEYTVP5Q",
  "J5G5CAJK",
  "IDS6LHT7",
  "YBQD4QEH",
  "IIDMLQ5Z",
  "FIFAZW2N",
  "LYNYAEJ7",
  "ZDAMYFNX",
  "MDIJMFJ5",
  "92FRMSYP",
  "I3NWZ4LN",
  "AVQRK3AC",
  "JH9MUKC6",
  "QI2ZYRBE",
  "PF7QSV7K",
  "IRLHZ75P",
  "DSDUXQPM",
  "LEQYTMX6",
  "M3KGNH8V",
  "B3EJ79KS",
  "9H7DMIPF",
  "V84WJJ2L",
  "YY5UPMEK",
  "RPK2QA7I",
  "QHXH75K8",
  "3YNGM2DZ",
  "895DHHBE",
  "4XC8RW5I",
  "SILY4D3A",
  "YMYLT9S2",
  "8MDYXEF6",
  "U3ED7BAS",
  "AU6P72S8",
  "HA4RFVTD",
  "JJCNZQT6",
  "WTCV6237",
  "JC62VFX6",
  "P8S5QP9G",
  "PJXPDNBL",
  "ZMJMWFCP",
  "CP2VCZ73",
  "M8TFXIZA",
  "ZFMAW2FM",
  "CDYSUFBR",
  "PW6ANYKK",
  "59YAR5HB",
  "R4Q3Q4W2",
  "Q3EXUIMH",
  "QIEIHHIZ",
  "H9AP6UL9",
  "P9UPDZCG",
  "FJKVXD3U",
  "PHTBTFDW",
  "MHN7NN32",
  "QFIRQEPA",
  "HHGA8AEM",
  "Z4ITDNH8",
  "LHDTZTXF",
  "LLQWYL4X",
  "949QFZWG",
  "U6RJBWRU",
  "MPM2BAHY",
  "YAPM6NTJ",
  "Y9NKPHVJ",
  "ZWEPRWB2",
  "W3FAKJJ9",
  "JJN2Z7XC",
  "WNVC9AQ9",
  "KK9QATJH",
  "GMIXVCFL",
  "F7V32R6P",
  "EKFBZVPI",
  "L8AKHM64",
  "JR7ZSP6P",
  "ZBG3U7FG",
  "VIWCUUQJ",
  "QDMQ3NWF",
  "RE7KSJ5Q",
  "V5QG2J8X",
  "UFPVVQLK",
  "N8DY5AKA",
  "URN9EI82",
  "ZMA5HF4R",
  "Z5596QSZ",
  "I7JXZFDM",
  "NRLMWQWJ",
  "3TFXF4R9",
  "R4SPRSXY",
  "JSS5PENZ",
  "KIVPUK4K",
  "TNZY66QZ",
  "PE5JYJT9",
  "URWKSB5E",
  "WJYS7G9E",
  "K96XGP6X",
  "I7JZZMQT",
  "QPVUHUET",
  "R9AU85MP",
  "RA5V8GUU",
  "PBAEBG8V",
  "M48F69YA",
  "KBA2L7SP",
  "XASZI3L3",
  "PDP8PY98",
  "3XYAWKFV",
  "MGK6598N",
  "WT2BK2A5",
  "VT748P7K",
  "XFS95YC8",
  "T2LCBPN4",
  "V8XGIICM",
  "KYTFBBHH",
  "R7QEDBQN",
  "QSA9SLTI",
  "XQ69W4P3",
  "Z72Y3L7B",
  "PHBGFWUK",
  "RA5KNFDC",
  "KYAL3BFK",
  "6ZPUI9DK",
  "GPJWWTZR",
  "WWLELGDW",
  "AMRGDDF2",
  "KXR923XY",
  "3GRTNKGJ",
  "A282HSE2",
  "AUX3C8WT",
  "IW8V9YQ8",
  "JKS53BW2",
  "LVZLNRGW",
  "NEBA88F8",
  "T5Z8AIBD",
  "U34R88QC",
  "DTM7SSSC",
  "P95C8M75",
  "7WQIHLJN",
  "TN9WQ8IP",
  "NNZPR9M5",
  "VPET9HAW",
  "WI6FIFZU",
  "II9EHN4C"
];

// === IMPLEMENTACE ===
// Pozn.: Zotero "Run JavaScript" dialog už obaluje kód do AsyncFunction,
// proto NEpoužíváme vlastní (async () => {})() wrapper — return na
// nejvyšší úrovni funguje a vrátí výsledek do dialogu.

const libraryID = Zotero.Libraries.userLibraryID;
const results = {
  found: 0,
  not_found: 0,
  already_trashed: 0,
  trashed: 0,
  errors: [],
};

Zotero.debug('=== zotero-trash-duplicates: START ===');
Zotero.debug(`DRY_RUN = ${DRY_RUN}`);
Zotero.debug(`Total candidates: ${ATTACHMENT_KEYS.length}`);

const idsToTrash = [];

for (const key of ATTACHMENT_KEYS) {
  try {
    const item = await Zotero.Items.getByLibraryAndKeyAsync(libraryID, key);
    if (!item) {
      results.not_found++;
      continue;
    }
    results.found++;
    if (item.deleted) {
      results.already_trashed++;
      continue;
    }
    idsToTrash.push(item.id);
  } catch (e) {
    results.errors.push({key, error: String(e)});
  }
}

Zotero.debug(`Found: ${results.found}, not_found: ${results.not_found}, already_trashed: ${results.already_trashed}`);
Zotero.debug(`To trash: ${idsToTrash.length}`);

if (DRY_RUN) {
  const msg = [
    '=== DRY RUN — nic se nesmazalo ===',
    `Kandidátů celkem:     ${ATTACHMENT_KEYS.length}`,
    `Nalezeno v knihovně:  ${results.found}`,
    `Nenalezeno (jiz pryc):${results.not_found}`,
    `Uz v Trashi:          ${results.already_trashed}`,
    `K presunu do Trashe:  ${idsToTrash.length}`,
    `Chyby:                ${results.errors.length}`,
    '',
    'Pro skutecne spusteni: zmen `const DRY_RUN = true` na `false` a znovu Run.',
  ].join('\n');
  Zotero.debug(msg);
  return msg;
}

// === SKUTECNE MAZANI (DRY_RUN=false) ===
for (let i = 0; i < idsToTrash.length; i += BATCH_SIZE) {
  const batch = idsToTrash.slice(i, i + BATCH_SIZE);
  await Zotero.Items.trashTx(batch);
  results.trashed += batch.length;
  Zotero.debug(`Batch ${Math.floor(i/BATCH_SIZE)+1}: trashed ${batch.length} (running total ${results.trashed}/${idsToTrash.length})`);
}

const finalMsg = [
  '=== HOTOVO ===',
  `Presunuto do Trashe: ${results.trashed}`,
  `Uz bylo v Trashi:    ${results.already_trashed}`,
  `Nenalezeno:          ${results.not_found}`,
  `Chyby:               ${results.errors.length}`,
  '',
  'Zkontroluj v Zotero -> Trash. Kdyz je vse OK: Right-click -> Empty Trash.',
  'Pro obnovu: Right-click na item v Trashi -> Restore to Library.',
].join('\n');
Zotero.debug(finalMsg);
return finalMsg;
