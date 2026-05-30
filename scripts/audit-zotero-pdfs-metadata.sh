#!/bin/bash
# Audit duplicitních PDF v Zotero
# Pro každý attachment vytáhne: PDF size, OCR cache size, OCR producer/creator, pages, has-text

INPUT=/tmp/duplicate-pdfs.tsv
OUTPUT=/tmp/duplicate-pdfs-metadata.tsv
STORAGE=~/Zotero/storage

# Header
printf "parent_id\tparent_key\tparent_title\tatt_key\tatt_filename\tpdf_size\tcache_size\tcache_words\tpages\tproducer\tcreator\tcreation_date\thas_text\n" > "$OUTPUT"

while IFS=$'\t' read -r pid pkey ptitle akey afile; do
  pdf_path="$STORAGE/$akey/$afile"
  cache_path="$STORAGE/$akey/.zotero-ft-cache"

  if [[ ! -f "$pdf_path" ]]; then
    printf "%s\t%s\t%s\t%s\t%s\tMISSING\t0\t0\t0\t\t\t\tno\n" "$pid" "$pkey" "$ptitle" "$akey" "$afile" >> "$OUTPUT"
    continue
  fi

  pdf_size=$(stat -f%z "$pdf_path" 2>/dev/null || echo 0)
  cache_size=0
  cache_words=0
  if [[ -f "$cache_path" ]]; then
    cache_size=$(stat -f%z "$cache_path" 2>/dev/null || echo 0)
    cache_words=$(wc -w < "$cache_path" 2>/dev/null | tr -d ' ')
  fi

  pages=0
  producer=""
  creator=""
  creation_date=""
  has_text="unknown"

  if command -v pdfinfo &>/dev/null; then
    info=$(pdfinfo "$pdf_path" 2>/dev/null)
    pages=$(echo "$info" | grep "^Pages:" | head -1 | awk '{print $2}')
    producer=$(echo "$info" | grep "^Producer:" | head -1 | sed 's/^Producer: *//' | tr '\t' ' ')
    creator=$(echo "$info" | grep "^Creator:" | head -1 | sed 's/^Creator: *//' | tr '\t' ' ')
    creation_date=$(echo "$info" | grep "^CreationDate:" | head -1 | sed 's/^CreationDate: *//' | tr '\t' ' ')
  fi

  # quick has-text check: pdftotext page 1 a zkontroluj zda > 50 znaků
  if command -v pdftotext &>/dev/null; then
    text_sample=$(pdftotext -f 1 -l 3 "$pdf_path" - 2>/dev/null | tr -d '[:space:]' | head -c 200)
    if [[ ${#text_sample} -gt 50 ]]; then
      has_text="yes"
    else
      has_text="no"
    fi
  fi

  printf "%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n" \
    "$pid" "$pkey" "$ptitle" "$akey" "$afile" \
    "$pdf_size" "$cache_size" "$cache_words" "$pages" \
    "$producer" "$creator" "$creation_date" "$has_text" >> "$OUTPUT"
done < "$INPUT"

echo "Done. $(wc -l < "$OUTPUT") rows written to $OUTPUT"
