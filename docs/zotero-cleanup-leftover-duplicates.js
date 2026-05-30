/* eslint-disable */
/**
 * Zotero JavaScript: re-trash 5 duplikátů, které se omylem obnovily
 * při restoru ze Zotero Trash.
 *
 * POZADÍ:
 *  - E93CMKRY (Bureš Hodinové stroje I): omylem obnoven horší duplikát 95SNY95L
 *    (102 MB Tesseract verze bez OCR), winner G8KJDSAC (24 MB Canon scan
 *    s 28k slov OCR) zůstává.
 *  - BXENMADI (Turner 1975 Essay Review): při ruční obnově se restorovalo
 *    všech 5 PDF, ponecháme jen první.
 *
 * SAFETY:
 *  - Preventivní check: nesmí se ztratit poslední živý PDF (defense-in-depth)
 *  - Default DRY_RUN=true
 */

const DRY_RUN = true;  // ← Změň na false pro skutečný re-trash

// 5 keys k přesunutí zpět do Trashe
const ATTACHMENT_KEYS = [
  '95SNY95L',   // Bureš Tesseract 102 MB bez OCR (winner je G8KJDSAC)
  // BXENMADI Turner: ponecháme winner (4UYMF2NL "Plný text"), zbytek trash:
  'LL9JJ6HQ',
  '3PJERWAG',
  '68KGD37G',
  'ZS7PR5A5',
];

const libraryID = Zotero.Libraries.userLibraryID;
const results = { found: 0, not_found: 0, already_trashed: 0, skipped_last_pdf: 0, trashed: 0 };
const idsToTrash = [];
const pendingSet = new Set();
const skippedDetails = [];

async function countAlivePdfsAfter(parentID, pendingTrashIds) {
  const parent = Zotero.Items.get(parentID);
  if (!parent) return 0;
  const attIds = parent.getAttachments();
  let count = 0;
  for (const id of attIds) {
    if (pendingTrashIds.has(id)) continue;
    const att = Zotero.Items.get(id);
    if (att && att.attachmentContentType === 'application/pdf') count++;
  }
  return count;
}

for (const key of ATTACHMENT_KEYS) {
  const item = await Zotero.Items.getByLibraryAndKeyAsync(libraryID, key);
  if (!item) { results.not_found++; continue; }
  results.found++;
  if (item.deleted) { results.already_trashed++; continue; }
  const aliveAfter = await countAlivePdfsAfter(item.parentID, new Set([...pendingSet, item.id]));
  if (aliveAfter === 0) {
    const parent = Zotero.Items.get(item.parentID);
    skippedDetails.push(`${key} → parent ${parent?.key} (${parent?.getField('title')?.slice(0, 40)})`);
    results.skipped_last_pdf++;
    continue;
  }
  idsToTrash.push(item.id);
  pendingSet.add(item.id);
}

if (DRY_RUN) {
  const msg = [
    '=== DRY RUN ===',
    `Kandidatu: ${ATTACHMENT_KEYS.length}`,
    `Nalezeno:  ${results.found}`,
    `Uz v trashi: ${results.already_trashed}`,
    `K presunu: ${idsToTrash.length}`,
    `Preskoceno (last PDF): ${results.skipped_last_pdf}`,
    ...(skippedDetails.length ? ['', 'Preskoceno:', ...skippedDetails.map(s => '  - ' + s)] : []),
    '',
    'Pro skutecne spusteni: DRY_RUN = false a Run.',
  ].join('\n');
  return msg;
}

await Zotero.Items.trashTx(idsToTrash);
results.trashed = idsToTrash.length;

return [
  '=== HOTOVO ===',
  `Presunuto do Trashe: ${results.trashed}`,
  `Uz bylo v Trashi: ${results.already_trashed}`,
  `Preskoceno (last PDF): ${results.skipped_last_pdf}`,
  '',
  'Zkontroluj v Zotero -> Trash a kdyz je vse OK: Empty Trash.',
].join('\n');
