#!/bin/bash
# Krok 1 audit pipeline: vytáhne z Zotero SQLite seznam itemů s 2+ ŽIVÝMI PDF přílohami.
#
# ŽIVÝ = NEzařazený v deletedItems (nikoli v koši Zotero).
#
# FIX 2026-05-30: předchozí verze SQL nezahrnoval filter na deletedItems, takže
# audit viděl jako "alive" i ručně smazané PDF. To vedlo k tomu, že duplikátní
# detekce počítala i s mrtvými itemy, a Python analyzér pak doporučil smazat
# zbytek pod předpokladem, že winner zůstane. 3 itemy ztratily VŠECHEN PDF
# (E93CMKRY Bureš Hodinové stroje I, KJMYTLCA Vlček, RHHYLVK9 Nosonovsky).
# Tento skript filter doplňuje.
#
# Použití:
#   bash scripts/audit-zotero-fetch-duplicates.sh
#   bash scripts/audit-zotero-pdfs-metadata.sh
#   python3 scripts/audit-zotero-duplicate-pdfs.py

set -euo pipefail

ZOTERO_DB=~/Zotero/zotero.sqlite
TEMP_DB=/tmp/zotero-readonly.sqlite
OUTPUT=/tmp/duplicate-pdfs.tsv

if [[ ! -f "$ZOTERO_DB" ]]; then
  echo "ERROR: $ZOTERO_DB nenalezen" >&2
  exit 1
fi

# Kopie pro read-only (Zotero zámek)
cp "$ZOTERO_DB" "$TEMP_DB"

sqlite3 "$TEMP_DB" > "$OUTPUT" <<'SQL'
.mode tabs
.headers off

-- Najdi parent itemy s 2+ ŽIVÝMI PDF přílohami (ne v koši)
WITH alive_pdf_attachments AS (
  SELECT
    parentItems.itemID as parent_id,
    parentItems.key as parent_key,
    att.itemID as att_item_id,
    att.key as att_key
  FROM items parentItems
  JOIN itemAttachments att_ia ON att_ia.parentItemID = parentItems.itemID
  JOIN items att ON att.itemID = att_ia.itemID
  LEFT JOIN deletedItems di_parent ON di_parent.itemID = parentItems.itemID
  LEFT JOIN deletedItems di_att ON di_att.itemID = att.itemID
  WHERE att_ia.contentType = 'application/pdf'
    AND di_parent.itemID IS NULL  -- parent NENÍ v koši
    AND di_att.itemID IS NULL     -- attachment NENÍ v koši
),
duplicate_parents AS (
  SELECT parent_id
  FROM alive_pdf_attachments
  GROUP BY parent_id
  HAVING COUNT(att_item_id) > 1
)
SELECT
  apa.parent_id,
  apa.parent_key,
  COALESCE(parentTitle.value, '?') as parent_title,
  apa.att_key,
  attData.value as att_filename
FROM alive_pdf_attachments apa
JOIN duplicate_parents dp ON dp.parent_id = apa.parent_id
LEFT JOIN itemDataValues attData ON attData.valueID = (
  SELECT valueID FROM itemData WHERE itemID = apa.att_item_id AND fieldID = (SELECT fieldID FROM fields WHERE fieldName='title')
)
LEFT JOIN itemDataValues parentTitle ON parentTitle.valueID = (
  SELECT valueID FROM itemData WHERE itemID = apa.parent_id AND fieldID = (SELECT fieldID FROM fields WHERE fieldName='title')
)
ORDER BY apa.parent_id, apa.att_key;
SQL

n_rows=$(wc -l < "$OUTPUT" | tr -d ' ')
n_parents=$(awk -F'\t' '{print $1}' "$OUTPUT" | sort -u | wc -l | tr -d ' ')
echo "Hotovo. $n_rows řádků ($n_parents parent itemů s 2+ živými PDF) zapsáno do $OUTPUT"
