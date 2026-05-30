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

// === KANDIDÁTI KE SMAZÁNÍ (0 souborů, ~0.0 MB) ===
//
// Rozpad podle důvodu:

//
// Sample (prvních 0):


const ATTACHMENT_KEYS = [];

// === IMPLEMENTACE ===
// Pozn.: Zotero "Run JavaScript" dialog už obaluje kód do AsyncFunction,
// proto NEpoužíváme vlastní (async () => {})() wrapper — return na
// nejvyšší úrovni funguje a vrátí výsledek do dialogu.

const libraryID = Zotero.Libraries.userLibraryID;
const results = {
  found: 0,
  not_found: 0,
  already_trashed: 0,
  skipped_last_pdf: 0,  // FIX 2026-05-30: preventivní check proti "ztrátě posledního PDF"
  trashed: 0,
  errors: [],
};
const skippedLastPdfDetails = [];

Zotero.debug('=== zotero-trash-duplicates: START ===');
Zotero.debug(`DRY_RUN = ${DRY_RUN}`);
Zotero.debug(`Total candidates: ${ATTACHMENT_KEYS.length}`);

const idsToTrash = [];

// Helper: počet ŽIVÝCH (ne-trashed) PDF attachmentů pro daný parent,
// po hypothetickém přidání aktuální item.id mezi smazané.
async function countAlivePdfsAfter(parentID, pendingTrashIds) {
  const parentItem = Zotero.Items.get(parentID);
  if (!parentItem) return 0;
  const attIds = parentItem.getAttachments();  // jen NEtrashlé attachmenty
  let count = 0;
  for (const attId of attIds) {
    if (pendingTrashIds.has(attId)) continue;
    const att = Zotero.Items.get(attId);
    if (!att) continue;
    if (att.attachmentContentType === 'application/pdf') count++;
  }
  return count;
}

const pendingTrashSet = new Set();

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

    // PREVENTIVNÍ CHECK: nesmí se ztratit poslední živý PDF parentu
    const parentID = item.parentID;
    if (parentID) {
      const aliveAfter = await countAlivePdfsAfter(parentID, new Set([...pendingTrashSet, item.id]));
      if (aliveAfter === 0) {
        const parent = Zotero.Items.get(parentID);
        const parentTitle = parent ? (parent.getField('title') || '?').slice(0, 60) : '?';
        skippedLastPdfDetails.push({
          key,
          parentKey: parent?.key,
          parentTitle,
        });
        results.skipped_last_pdf++;
        continue;
      }
    }

    idsToTrash.push(item.id);
    pendingTrashSet.add(item.id);
  } catch (e) {
    results.errors.push({key, error: String(e)});
  }
}

Zotero.debug(`Found: ${results.found}, not_found: ${results.not_found}, already_trashed: ${results.already_trashed}, skipped_last_pdf: ${results.skipped_last_pdf}`);
Zotero.debug(`To trash: ${idsToTrash.length}`);

if (DRY_RUN) {
  const lines = [
    '=== DRY RUN — nic se nesmazalo ===',
    `Kandidátů celkem:        ${ATTACHMENT_KEYS.length}`,
    `Nalezeno v knihovně:     ${results.found}`,
    `Nenalezeno (jiz pryc):   ${results.not_found}`,
    `Uz v Trashi:             ${results.already_trashed}`,
    `Preskoceno (last PDF):   ${results.skipped_last_pdf}`,
    `K presunu do Trashe:     ${idsToTrash.length}`,
    `Chyby:                   ${results.errors.length}`,
  ];
  if (skippedLastPdfDetails.length > 0) {
    lines.push('');
    lines.push('PRESKOCENO (smazani by parenta pripravilo o vsechny PDF):');
    for (const s of skippedLastPdfDetails) {
      lines.push(`  - ${s.key} -> parent ${s.parentKey} (${s.parentTitle})`);
    }
  }
  lines.push('');
  lines.push('Pro skutecne spusteni: zmen `const DRY_RUN = true` na `false` a znovu Run.');
  const msg = lines.join('\n');
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

const finalLines = [
  '=== HOTOVO ===',
  `Presunuto do Trashe:    ${results.trashed}`,
  `Uz bylo v Trashi:       ${results.already_trashed}`,
  `Preskoceno (last PDF):  ${results.skipped_last_pdf}`,
  `Nenalezeno:             ${results.not_found}`,
  `Chyby:                  ${results.errors.length}`,
];
if (skippedLastPdfDetails.length > 0) {
  finalLines.push('');
  finalLines.push('PRESKOCENO (smazani by parenta pripravilo o vsechny PDF):');
  for (const s of skippedLastPdfDetails) {
    finalLines.push(`  - ${s.key} -> parent ${s.parentKey} (${s.parentTitle})`);
  }
}
finalLines.push('');
finalLines.push('Zkontroluj v Zotero -> Trash. Kdyz je vse OK: Right-click -> Empty Trash.');
finalLines.push('Pro obnovu: Right-click na item v Trashi -> Restore to Library.');
const finalMsg = finalLines.join('\n');
Zotero.debug(finalMsg);
return finalMsg;
