#!/usr/bin/env python3
"""
Analyzér duplicitních PDF v Zotero.
Vstup: /tmp/duplicate-pdfs-metadata.tsv
Výstup: /tmp/duplicate-pdfs-report.md (markdown report) + /tmp/duplicate-pdfs-delete.tsv (kandidáti smazání)

Heuristika výběru "winner":
1. has_text="yes" > "no" (PDF bez textu vrstvy je nepoužitelný)
2. cache_words (vyšší = lepší OCR coverage v Zotero indexu)
3. producer obsahuje "OCRmyPDF" (modernější pipeline)
4. producer obsahuje "Tesseract" (alespoň OCR)
5. menší pdf_size (při srovnatelné kvalitě)
6. Penalizace: Google Books scan (creator/producer obsahuje "Google", nebo kreator obsahuje "ABBYY" + velmi velký file)
"""
from __future__ import annotations
import csv
import re
from collections import defaultdict
from pathlib import Path

INPUT = Path("/tmp/duplicate-pdfs-metadata.tsv")
REPORT = Path("/tmp/duplicate-pdfs-report.md")
DELETE = Path("/tmp/duplicate-pdfs-delete.tsv")

GOOGLE_HINTS = re.compile(r"google|tesseract\s*5\.0\.|tesseract\s*4\.", re.IGNORECASE)
OCRMYPDF = re.compile(r"OCRmyPDF", re.IGNORECASE)
TESSERACT = re.compile(r"Tesseract", re.IGNORECASE)


def _safe_int(v) -> int:
    try:
        return int(v or 0)
    except (TypeError, ValueError):
        return 0


def score_pdf(row: dict) -> tuple:
    """Vyšší = lepší. Tuple pro lexikografické řazení.
    Priorita: kompletnost OCR > zdroj > velikost > brand-name producer.
    """
    pdf_size = _safe_int(row.get("pdf_size"))
    cache_words = _safe_int(row.get("cache_words"))
    pages = _safe_int(row.get("pages"))
    producer = row.get("producer", "")
    creator = row.get("creator", "")
    has_text = row.get("has_text", "no")
    afile = row.get("att_filename", "")

    score = []

    # 1. Soubor existuje + má textovou vrstvu (KRITICKÉ)
    if pdf_size == 0:
        score.append(-100)
        return tuple(score)
    score.append(10 if has_text == "yes" else 0)

    # 2. OCR pokrytí — JE NEJDŮLEŽITĚJŠÍ INDIKÁTOR
    #    Logaritmická škála: 1 slov = 0, 100 = 2, 1000 = 4, 10k = 7, 100k = 10, 1M = 13
    #    To zajistí že 26k slov > 17k slov vždy přebije OCRmyPDF +2 bonus.
    if cache_words == 0:
        score.append(0)
    else:
        import math
        score.append(round(math.log10(cache_words) * 2))  # 100 → 4, 10k → 8, 100k → 10

    # 3. Bonus za OCRmyPDF post-process (jen tie-breaker, ne dominantní)
    has_ocrmypdf = bool(OCRMYPDF.search(producer) or OCRMYPDF.search(creator))
    score.append(1 if has_ocrmypdf and cache_words > 0 else 0)

    # 4. Tesseract = neutrální (nedostane bonus ani malus)
    score.append(0)

    # 5. Menší soubor = lepší (při stejném OCR)
    size_mb = pdf_size / (1024 * 1024)
    if size_mb < 5:
        score.append(3)
    elif size_mb < 20:
        score.append(2)
    elif size_mb < 50:
        score.append(1)
    else:
        score.append(0)

    # 6. Penalizace Google Books signatury (filename obsahuje "Google" nebo "books_google")
    if re.search(r"google|books?_?google", afile, re.IGNORECASE):
        score.append(-3)
    else:
        score.append(0)

    # 7. Bonus za více stránek (kompletnější edice)
    score.append(min(5, pages // 100))

    return tuple(score)


def fmt_size(b: int) -> str:
    b = int(b)
    if b == 0:
        return "0"
    for unit in ["B", "KB", "MB", "GB"]:
        if b < 1024:
            return f"{b:.1f} {unit}" if isinstance(b, float) else f"{b} {unit}"
        b = b / 1024  # type: ignore
    return f"{b:.1f} TB"


def short_producer(producer: str, creator: str) -> str:
    """Zkrať dlouhé strings na užitečnou indikaci."""
    if not producer and not creator:
        return "—"
    parts = []
    if creator:
        c = creator[:50]
        if "OCRmyPDF" in c:
            parts.append("OCRmyPDF")
        elif "Tesseract" in c:
            parts.append("Tesseract")
        elif "ABBYY" in c:
            parts.append("ABBYY")
        else:
            parts.append(c)
    if producer and producer not in (creator or ""):
        p = producer[:30]
        parts.append(p)
    return " / ".join(parts) or "—"


# Načti TSV
rows = []
with INPUT.open() as f:
    reader = csv.DictReader(f, delimiter="\t")
    for r in reader:
        rows.append(r)

# Skup podle parent_id
groups: dict[str, list[dict]] = defaultdict(list)
for r in rows:
    groups[r["parent_id"]].append(r)

# Analyzuj každou skupinu
report_lines = ["# Audit duplicitních PDF v Zotero\n"]
report_lines.append(f"**Zdroj:** `{INPUT}`\n")
report_lines.append(f"**Itemů s 2+ PDF:** {len(groups)}\n")
report_lines.append(f"**Celkem attachmentů:** {len(rows)}\n\n")

total_freed_bytes = 0
delete_candidates = []
keep_winners = []
ambiguous = []
identical_keep_first = []
all_missing = []  # všechny PDFs jsou broken/MISSING

for parent_id, items in groups.items():
    if not items:
        continue
    parent_key = items[0]["parent_key"]
    parent_title = items[0]["parent_title"]

    # Detekce: všechny soubory jsou MISSING (#chybi-pdf-broken)?
    sizes_all = [_safe_int(r.get('pdf_size')) for r in items]
    if all(s == 0 for s in sizes_all):
        # Nech jeden záznam, zbytek smaž (item v Zoteru zůstává, jen prázdné attachmenty navíc)
        all_missing.append((parent_id, parent_key, parent_title, items))
        for r in items[1:]:
            delete_candidates.append({**r, "reason": "broken-attachment-duplicate (all MISSING)"})
        continue

    # Skóruj
    scored = []
    for r in items:
        s = score_pdf(r)
        scored.append((s, r))
    scored.sort(key=lambda x: x[0], reverse=True)

    winner = scored[0][1]
    losers = [r for s, r in scored[1:]]

    # Pokud všichni mají identický skóre (a stejnou velikost ± 5%), označ jako ambiguous
    winner_score = scored[0][0]
    same_score = [r for s, r in scored if s == winner_score]
    if len(same_score) > 1:
        # Identické skore → další test: identická velikost?
        sizes = [_safe_int(r.get('pdf_size')) for r in same_score]
        max_s = max(sizes)
        min_s = min(sizes)
        if max_s > 0 and (max_s - min_s) / max_s < 0.05:
            # Téměř identické soubory — necháme první, zbytek smaž
            identical_keep_first.append((parent_id, parent_key, parent_title, same_score, [r for s, r in scored if r not in same_score]))
            for r in same_score[1:]:
                delete_candidates.append({**r, "reason": "identical-duplicate (keep first)"})
                total_freed_bytes += _safe_int(r.get('pdf_size'))
            # i ostatní non-winners se přidávají
            for r in losers:
                if r not in same_score[1:]:
                    delete_candidates.append({**r, "reason": "lower-quality"})
                    total_freed_bytes += _safe_int(r.get('pdf_size'))
            continue
        else:
            ambiguous.append((parent_id, parent_key, parent_title, scored))
            continue

    # Standardní případ — jeden jasný winner
    keep_winners.append((parent_id, parent_key, parent_title, winner, losers, winner_score))
    for loser in losers:
        delete_candidates.append({**loser, "reason": "lower-quality"})
        total_freed_bytes += _safe_int(loser.get('pdf_size'))

# === REPORT ===
report_lines.append("## Souhrn\n")
report_lines.append(f"- **Jednoznační winneři:** {len(keep_winners)} itemů → smazat {sum(len(w[4]) for w in keep_winners)} PDFs\n")
report_lines.append(f"- **Identické duplikáty** (téměř stejná velikost): {len(identical_keep_first)} itemů\n")
report_lines.append(f"- **Broken-only** (všechny PDFs MISSING, jen prázdné attachmenty): {len(all_missing)} itemů\n")
report_lines.append(f"- **Ambivalentní** (vyžaduje manuální posouzení): {len(ambiguous)} itemů\n")
report_lines.append(f"- **Celkem ke smazání:** {len(delete_candidates)} souborů\n")
report_lines.append(f"- **Uvolní místa:** {fmt_size(total_freed_bytes)} ({total_freed_bytes} B)\n\n")

# === SEKCE 0: broken-only itemy ===
if all_missing:
    report_lines.append("## 0) Broken-only itemy (všechny PDFs jsou MISSING) — bezpečné smazání prázdných attachmentů\n\n")
    report_lines.append("U těchto itemů NEEXISTUJE žádný PDF soubor na disku. Item v Zoteru zůstává, jen prázdné attachment záznamy navíc.\n\n")
    for parent_id, parent_key, parent_title, items in all_missing:
        report_lines.append(f"### `{parent_key}` — {parent_title}\n")
        for i, r in enumerate(items):
            marker = "✅ keep (placeholder)" if i == 0 else "❌ delete (empty)"
            report_lines.append(f"- **{marker}** `{r['att_key']}` · *{r['att_filename']}*\n")
        report_lines.append("\n")

# === SEKCE 1: identické duplikáty ===
report_lines.append("## A) Identické duplikáty (téměř stejná velikost) — bezpečné mazání\n\n")
report_lines.append("Pro každý item se nechá první, zbytek smaže.\n\n")
for parent_id, parent_key, parent_title, dup_group, others in identical_keep_first:
    report_lines.append(f"### `{parent_key}` — {parent_title}\n")
    for i, r in enumerate(dup_group):
        marker = "✅ keep" if i == 0 else "❌ delete (identical)"
        report_lines.append(f"- **{marker}** `{r['att_key']}` — {fmt_size(_safe_int(r.get('pdf_size')))}, {r['pages']} stránek, OCR cache {r['cache_words']} slov · *{r['att_filename']}*\n")
    for r in others:
        report_lines.append(f"- ❌ delete (lower-quality) `{r['att_key']}` — {fmt_size(_safe_int(r.get('pdf_size')))}, {r['pages']} stránek, OCR cache {r['cache_words']} slov · *{r['att_filename']}*\n")
    report_lines.append("\n")

# === SEKCE 2: Jednoznační winneři ===
report_lines.append("## B) Jednoznační winneři (heuristika OCR/velikost/zdroj)\n\n")
for parent_id, parent_key, parent_title, winner, losers, score in keep_winners:
    report_lines.append(f"### `{parent_key}` — {parent_title}\n")
    report_lines.append(f"- ✅ **keep** `{winner['att_key']}` — {fmt_size(int(winner['pdf_size'] or 0))}, {winner['pages']} stránek, OCR {winner['cache_words']} slov, *{short_producer(winner['producer'], winner['creator'])}*, has_text={winner['has_text']}, skóre={score}\n")
    report_lines.append(f"  - filename: `{winner['att_filename']}`\n")
    for r in losers:
        report_lines.append(f"- ❌ **delete** `{r['att_key']}` — {fmt_size(_safe_int(r.get('pdf_size')))}, {r['pages']} stránek, OCR {r['cache_words']} slov, *{short_producer(r['producer'], r['creator'])}*, has_text={r['has_text']}\n")
        report_lines.append(f"  - filename: `{r['att_filename']}`\n")
    report_lines.append("\n")

# === SEKCE 3: Ambivalentní ===
if ambiguous:
    report_lines.append("## C) Ambivalentní — manuální posouzení\n\n")
    report_lines.append("Stejné skóre, ale rozdílná velikost — pravděpodobně různé edice/části. Nechat všechny nebo posoudit ručně.\n\n")
    for parent_id, parent_key, parent_title, scored in ambiguous:
        report_lines.append(f"### `{parent_key}` — {parent_title}\n")
        for s, r in scored:
            report_lines.append(f"- ⚠️ `{r['att_key']}` — {fmt_size(_safe_int(r.get('pdf_size')))}, {r['pages']} stránek, OCR {r['cache_words']} slov, *{short_producer(r['producer'], r['creator'])}*\n")
            report_lines.append(f"  - filename: `{r['att_filename']}`\n")
        report_lines.append("\n")

# === ZÁVĚREČNÝ TSV s kandidáty smazání ===
with DELETE.open("w") as f:
    writer = csv.DictWriter(f, delimiter="\t", fieldnames=[
        "parent_key", "att_key", "pdf_size", "pages", "cache_words", "reason", "att_filename"
    ])
    writer.writeheader()
    for r in delete_candidates:
        writer.writerow({
            "parent_key": r["parent_key"],
            "att_key": r["att_key"],
            "pdf_size": r["pdf_size"],
            "pages": r["pages"],
            "cache_words": r["cache_words"],
            "reason": r["reason"],
            "att_filename": r["att_filename"],
        })

REPORT.write_text("".join(report_lines))
print(f"Report: {REPORT}")
print(f"Delete candidates: {DELETE} ({len(delete_candidates)} files, {fmt_size(total_freed_bytes)} to free)")
