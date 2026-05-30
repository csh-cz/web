#!/usr/bin/env python3
"""
Generátor Zotero JavaScript snippetu pro přesun duplicitních PDF do koše.

Workflow:
  1. Tento skript přečte docs/zotero-duplicate-pdfs-delete.tsv
  2. Vygeneruje docs/zotero-trash-duplicates.js (Zotero JavaScript)
  3. Uživatel:
     a. Backup zotero.sqlite (důležité!)
     b. Otevře Zotero → Tools → Developer → Run JavaScript
     c. Vloží obsah .js souboru
     d. PRVNÍ run: DRY_RUN=true (vypíše počty + sample, NIC nesmaže)
     e. Po kontrole: nastaví DRY_RUN=false a znovu spustí
     f. PDF jsou nyní v Zotero trashi (reverzibilní — můžou se obnovit)
     g. Když je vše OK: Trash → Empty trash

Bezpečnostní vlastnosti:
  - Defaultně DRY_RUN — nic se nesmaže bez explicitní změny
  - Zotero JavaScript běží v transakci (Zotero.Items.trashTx)
  - Po trashTx jsou itemy v Zotero Trash, ne smazané — reverzibilní
  - Reference v slovniku používají PARENT key, ne attachment key, takže smazání PDF přílohy neovlivní citace

Použití:
  python3 scripts/zotero-trash-duplicates.py
"""
from __future__ import annotations

import csv
import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
INPUT = REPO_ROOT / "docs" / "zotero-duplicate-pdfs-delete.tsv"
OUTPUT = REPO_ROOT / "docs" / "zotero-trash-duplicates.js"


def _safe_int(v) -> int:
    try:
        return int(v or 0)
    except (TypeError, ValueError):
        return 0


def main() -> None:
    if not INPUT.exists():
        raise SystemExit(f"Nenalezen vstup: {INPUT}\nNejdřív spusť audit:\n  bash scripts/audit-zotero-pdfs-metadata.sh\n  python3 scripts/audit-zotero-duplicate-pdfs.py")

    # Načti delete kandidáty
    candidates: list[dict] = []
    with INPUT.open() as f:
        reader = csv.DictReader(f, delimiter="\t")
        for row in reader:
            candidates.append(row)

    # Skupuj podle reason pro lepší přehled v JS
    by_reason: dict[str, list[dict]] = {}
    for c in candidates:
        by_reason.setdefault(c["reason"], []).append(c)

    # Sestav JS array s att_keys + sample info pro logging
    att_keys = [c["att_key"] for c in candidates]
    sample = candidates[:10]  # prvních 10 pro dry-run preview

    js = generate_js(
        att_keys=att_keys,
        candidates=candidates,
        by_reason=by_reason,
        sample=sample,
    )

    OUTPUT.write_text(js)

    # Print summary
    total_bytes = sum(_safe_int(c.get("pdf_size")) for c in candidates)
    total_mb = total_bytes / (1024 * 1024)

    print(f"Vygenerováno: {OUTPUT}")
    print(f"Kandidátů ke smazání: {len(candidates)}")
    print(f"Velikost na disku: {total_mb:.1f} MB ({total_bytes:,} B)")
    print()
    print("Rozpad podle důvodu:")
    for reason, items in sorted(by_reason.items()):
        print(f"  - {reason}: {len(items)} souborů")
    print()
    print("=" * 70)
    print("DALŠÍ KROKY:")
    print("=" * 70)
    print("1. BACKUP zotero.sqlite (důležité!):")
    print("   cp ~/Zotero/zotero.sqlite ~/Zotero/zotero.sqlite.backup-$(date +%Y%m%d)")
    print()
    print("2. V Zotero: Tools → Developer → Run JavaScript")
    print(f"   Otevři: {OUTPUT}")
    print("   Zkopíruj celý obsah a vlož do dialogu")
    print()
    print("3. PRVNÍ run (DRY_RUN=true, default):")
    print("   - Klikni Run")
    print("   - V output: zkontroluj počty, sample, varování")
    print("   - NIC se nesmaže")
    print()
    print("4. DRUHÝ run (skutečné mazání):")
    print("   - V kódu změň: const DRY_RUN = false;")
    print("   - Klikni Run")
    print("   - Itemy se přesunou do Zotero Trash (reverzibilní)")
    print()
    print("5. Verify v Zotero Trash:")
    print("   - Sidebar → Trash")
    print("   - Když je vše OK: Right-click → Empty Trash")
    print()
    print("6. Update audit po smazání:")
    print("   bash scripts/audit-zotero-pdfs-metadata.sh")
    print("   python3 scripts/audit-zotero-duplicate-pdfs.py")


def generate_js(
    att_keys: list[str],
    candidates: list[dict],
    by_reason: dict[str, list[dict]],
    sample: list[dict],
) -> str:
    """Sestav Zotero JS snippet."""

    # Bezpečnostní hlavička
    header = """/* eslint-disable */
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
"""

    # Att keys array
    keys_json = json.dumps(att_keys, indent=2, ensure_ascii=False)

    # Reason breakdown
    reason_summary = "\n".join(
        f"//   - {reason}: {len(items)} souborů"
        for reason, items in sorted(by_reason.items())
    )

    # Sample preview
    sample_lines = []
    for c in sample:
        sample_lines.append(
            f"//   - {c['att_key']} (parent {c['parent_key']}) — {c['reason']} — {c['att_filename'][:60]}"
        )
    sample_preview = "\n".join(sample_lines)

    total_bytes = sum(_safe_int(c.get("pdf_size")) for c in candidates)
    total_mb = total_bytes / (1024 * 1024)

    body = f"""
// === KANDIDÁTI KE SMAZÁNÍ ({len(att_keys)} souborů, ~{total_mb:.1f} MB) ===
//
// Rozpad podle důvodu:
{reason_summary}
//
// Sample (prvních {len(sample)}):
{sample_preview}

const ATTACHMENT_KEYS = {keys_json};

// === IMPLEMENTACE ===
// Pozn.: Zotero "Run JavaScript" dialog už obaluje kód do AsyncFunction,
// proto NEpoužíváme vlastní (async () => {{}})() wrapper — return na
// nejvyšší úrovni funguje a vrátí výsledek do dialogu.

const libraryID = Zotero.Libraries.userLibraryID;
const results = {{
  found: 0,
  not_found: 0,
  already_trashed: 0,
  trashed: 0,
  errors: [],
}};

Zotero.debug('=== zotero-trash-duplicates: START ===');
Zotero.debug(`DRY_RUN = ${{DRY_RUN}}`);
Zotero.debug(`Total candidates: ${{ATTACHMENT_KEYS.length}}`);

const idsToTrash = [];

for (const key of ATTACHMENT_KEYS) {{
  try {{
    const item = await Zotero.Items.getByLibraryAndKeyAsync(libraryID, key);
    if (!item) {{
      results.not_found++;
      continue;
    }}
    results.found++;
    if (item.deleted) {{
      results.already_trashed++;
      continue;
    }}
    idsToTrash.push(item.id);
  }} catch (e) {{
    results.errors.push({{key, error: String(e)}});
  }}
}}

Zotero.debug(`Found: ${{results.found}}, not_found: ${{results.not_found}}, already_trashed: ${{results.already_trashed}}`);
Zotero.debug(`To trash: ${{idsToTrash.length}}`);

if (DRY_RUN) {{
  const msg = [
    '=== DRY RUN — nic se nesmazalo ===',
    `Kandidátů celkem:     ${{ATTACHMENT_KEYS.length}}`,
    `Nalezeno v knihovně:  ${{results.found}}`,
    `Nenalezeno (jiz pryc):${{results.not_found}}`,
    `Uz v Trashi:          ${{results.already_trashed}}`,
    `K presunu do Trashe:  ${{idsToTrash.length}}`,
    `Chyby:                ${{results.errors.length}}`,
    '',
    'Pro skutecne spusteni: zmen `const DRY_RUN = true` na `false` a znovu Run.',
  ].join('\\n');
  Zotero.debug(msg);
  return msg;
}}

// === SKUTECNE MAZANI (DRY_RUN=false) ===
for (let i = 0; i < idsToTrash.length; i += BATCH_SIZE) {{
  const batch = idsToTrash.slice(i, i + BATCH_SIZE);
  await Zotero.Items.trashTx(batch);
  results.trashed += batch.length;
  Zotero.debug(`Batch ${{Math.floor(i/BATCH_SIZE)+1}}: trashed ${{batch.length}} (running total ${{results.trashed}}/${{idsToTrash.length}})`);
}}

const finalMsg = [
  '=== HOTOVO ===',
  `Presunuto do Trashe: ${{results.trashed}}`,
  `Uz bylo v Trashi:    ${{results.already_trashed}}`,
  `Nenalezeno:          ${{results.not_found}}`,
  `Chyby:               ${{results.errors.length}}`,
  '',
  'Zkontroluj v Zotero -> Trash. Kdyz je vse OK: Right-click -> Empty Trash.',
  'Pro obnovu: Right-click na item v Trashi -> Restore to Library.',
].join('\\n');
Zotero.debug(finalMsg);
return finalMsg;
"""

    return header + body


if __name__ == "__main__":
    main()
