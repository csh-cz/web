/* eslint-disable */
/**
 * Zotero JavaScript: obnovit 3 omylem ztracená PDF z Trashe
 *
 * VYGENEROVÁNO: scripts/zotero-trash-duplicates.py (manuální derivát)
 *
 * Ztracená PDF (kvůli bugu v auditu, který nezahrnoval předchozí Trash):
 *   1. G8KJDSAC — Bureš "Hodinové stroje I" (1965) — Canon scan, 28k slov OCR
 *      Cituje se v 12 článcích webu (krok, kaleni, kladivko, pastorek, …)
 *   2. JKEF29BJ — "Professor Mudr. Rndr. h.c. Emanuel Vlček, Drsc." (2005)
 *   3. D2WGUDNI — Nosonovsky "Early Renaissance Concepts of Time" (2024)
 *
 * POUŽITÍ:
 *   1. Otevři Zotero → Tools → Developer → Run JavaScript
 *   2. Vlož celý tento soubor
 *   3. Run
 *
 * Bezpečnost: Zotero.Items.restoreTx() je transakční a reverzibilní.
 * Pokud nějaký item už ZE byl alive (ne v Trashi), prostě se přeskočí.
 */

const RESTORE_KEYS = [
  'G8KJDSAC',  // Bureš - 1965 - Hodinové stroje I.PDF (Canon scan)
  'JKEF29BJ',  // 2005 - Professor Mudr. Rndr. h.c. Emanuel Vlček, Drsc..pdf
  'D2WGUDNI',  // Nosonovsky - 2024 - Early Renaissance Concepts of Time…
];

const libraryID = Zotero.Libraries.userLibraryID;
const results = { found: 0, not_found: 0, not_in_trash: 0, restored: 0, errors: [] };
const idsToRestore = [];
const details = [];

for (const key of RESTORE_KEYS) {
  try {
    const item = await Zotero.Items.getByLibraryAndKeyAsync(libraryID, key);
    if (!item) {
      results.not_found++;
      details.push(`- ${key}: NENALEZEN v DB`);
      continue;
    }
    results.found++;
    if (!item.deleted) {
      results.not_in_trash++;
      details.push(`- ${key}: uz NENI v Trashi (alive)`);
      continue;
    }
    idsToRestore.push(item.id);
    const parentItem = item.parentID ? Zotero.Items.get(item.parentID) : null;
    const parentTitle = parentItem ? (parentItem.getField('title') || '?').slice(0, 60) : '?';
    details.push(`- ${key}: bude obnoven -> parent ${parentItem?.key} (${parentTitle})`);
  } catch (e) {
    results.errors.push({ key, error: String(e) });
    details.push(`- ${key}: CHYBA ${e}`);
  }
}

if (idsToRestore.length > 0) {
  // Restore = nastavit deleted=0; Zotero má restoreTx() resp. setter
  await Zotero.DB.executeTransaction(async () => {
    for (const id of idsToRestore) {
      const item = Zotero.Items.get(id);
      item.deleted = false;
      await item.save();
    }
  });
  results.restored = idsToRestore.length;
}

const msg = [
  '=== HOTOVO ===',
  `Restorovano: ${results.restored}`,
  `Uz alive:    ${results.not_in_trash}`,
  `Nenalezeno:  ${results.not_found}`,
  `Chyby:       ${results.errors.length}`,
  '',
  'Detail:',
  ...details,
  '',
  'Overit: kazdy parent ma ted aktivni PDF.',
].join('\n');
Zotero.debug(msg);
return msg;
