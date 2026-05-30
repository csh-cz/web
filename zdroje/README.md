# Zdroje — inbox / staging area

Tato složka je **mimo Astro content** (gitignore na úrovni adresáře nebo prosté nezpracování) — slouží jako:
- staging pro PDF/.doc/fotky které čekají na zpracování do `content/`
- archiv primárních pramenů (Skálovy zprávy, atd.)

## Stav k 2026-05-31

### Plně zpracované prameny (lze archivovat nebo nechat jako primární kopii)

| Soubor | Kde zpracováno |
|---|---|
| `Hodinové ciferníky věže Staroměstské radnice.pdf` (Skála 2018, 6 str.) | `content/hodinarium-eu/prazsky-orloj-ciferniky-2018.md` |
| `Katedrála závěrečná zpráva.pdf` (Skála 2014, 41 str., sv. Vít) | `content/soupis-veznich-hodin/skala-realizace-svaty-vit.mdx` |
| `Skála_Halata opr.Skála 13. 11.doc` (Skála/Halata 2004 sv. Vít GA ČR) | `content/soupis-veznich-hodin/skala-realizace-svaty-vit.mdx` |
| `Vidim_hodiny_rest_zpráva.pdf` (Skála 2022-11-26, 28 str.) | `content/soupis-veznich-hodin/1878-vidim-krecmer.mdx` |
| `Bečváry.doc`, `Bečváryrezpr.doc` (Skála 2003) | `content/soupis-veznich-hodin/nedatovano-becvary-landesberger.mdx` |
| `Dobříš rezpr.doc` (Skála 2009) | `content/soupis-veznich-hodin/1791-dobris-landesberger-f.mdx` |
| `horálek.pdf` (Horálek 1930) | `content/hodinarium-eu/prazsky-orloj-restaurovani-2018.md` + sv. Vít karta |
| `Popisy strojů 1.txt` | merged do soupis karet (task #6 completed) |

### Neidentifikované fotky — k posouzení uživatelem

| Soubor | Co vidím (Claude inventura 2026-05-31) | Lokalita |
|---|---|---|
| `Pict0001.JPG` | Věžní stroj nálezový stav, modrý rám + červené detaily, 3 hl. kola, kyvadlo, 2 cimbály vpravo, in-situ kamenné zdivo | **?** |
| `Pict0008.JPG` | 🔥 Detail vřetenového kroku s lihýřem (foliot, závaží na konci) — vzácný typ | **?** (možná sv. Vít před Neumann 1688?) |
| `P1000838.JPG` | Barokní ciferník květinový rám, římské I-XII + minutové 5-5, jen 1 mosazná ručička, dřevěná dílenská kostra | **?** (18. století interiér) |
| `P1130125.JPG` | Velký červený klečový rám, modrý dekorativní ciferník vpravo, dřevěné stěny | **?** (Hodinárium nebo in-situ?) |
| `barokni-ciselnik.JPG` | Barokní ciferník (z mnohem dřívější session) | **?** |
| `krokmech.jpg` | Krok mechanismus (generic) | **?** |

### Foto-archiv

- `archiv StanM - expozice 2015-2018 a související hist/` — Stanislav Marušák foto-archiv. **Zpracováno** (task #34 completed; 14 hi-res fotek do 12 věžních karet, viz session handoff 2026-05-26).
  - `ústí/` — neznámý subdir, **NEzpracováno**
  - `archiv Stan. Hodinárium promítání 2020/` — 30 souborů, **NEzpracováno** (task #46 ověřeno = nelze zpracovat)
  - `zasilka-VF45DFRD2MEEJRDY/` — 18 souborů, **NEzpracováno**
  - `archiv 2022 Stan - Děčín/` — 26 souborů, **NEzpracováno**

## Co s tím dál

- **Plně zpracované prameny**: lze ponechat jako primární kopii, ale **nemusí** být v repo (jsou v atelier veznihodiny.cz archivu Skály)
- **Neidentifikované fotky**: pamatuj kontext (kdo poslal, kdy) → můžeme je přiřadit k existujícím kartám
