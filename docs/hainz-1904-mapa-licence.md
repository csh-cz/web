# Hainz 1904 — mapové podklady, licence a atribuce

Přehled všech datových a mapových zdrojů použitých na stránce `/hainz-1904`
(interaktivní mapa) a v tiskovém podkladu pro výstavní panel NTM.
Stav k 2026-07-05.

## Webová mapa (`/hainz-1904`)

| Zdroj | Použití | Licence | Povinná atribuce |
|---|---|---|---|
| **OpenStreetMap** | zdrojová data podkladové mapy | [ODbL 1.0](https://opendatacommons.org/licenses/odbl/) | © přispěvatelé OpenStreetMap ([openstreetmap.org/copyright](https://www.openstreetmap.org/copyright)) |
| **OpenFreeMap** | hosting vektorových dlaždic (styl Positron, schema OpenMapTiles) | dlaždice zdarma bez klíče a limitů; styl BSD | atribuce OSM povinná; „OpenFreeMap" uvedeno dobrovolně ([openfreemap.org](https://openfreemap.org)) |
| **MapLibre GL JS** + maplibre-gl-leaflet | vykreslení vektorových dlaždic v Leafletu | BSD-3-Clause | — (kód, ne data) |
| **Leaflet** + Leaflet.markercluster | mapový rámec, clustering | BSD-2-Clause / MIT | — |
| **HistoGIS (ACDH-ÖAW)** | historické hranice Rakouska-Uherska a korunních zemí, stav 1910 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | „Hranice 1910: HistoGIS (ACDH-ÖAW), CC BY 4.0" — A. Piechl, A. Dückelmann, P. P. Marckhgott-Sanabria; podklady HistoGIS obsahují mj. data OSM |
| **Nominatim / Overpass API** | jednorázové geokódování při přípravě dat (neběží na webu) | data výsledků = ODbL (odvozeno z OSM) | pokryto atribucí © přispěvatelé OpenStreetMap |

Poznámky:
- `tile.openstreetmap.org` se produkčně **nepoužívá** (tiles policy OSMF); dlaždice servíruje OpenFreeMap.
- Atribuce HistoGIS se do rohu mapy přidává dynamicky při zapnutí vrstvy hranic.
- Zjednodušení geometrií: mapshaper (visvalingam weighted, 8–10 %),
  zdrojová nezjednodušená data + přesné URL dotazů: `scratchpad …/hainz1904/histogis/PROVENANCE.md`
  (kopie v `zdroje/Hainz/histogis/`, gitignored).

## Tiskový podklad (panel NTM)

| Zdroj | Použití | Licence | Atribuce na panelu |
|---|---|---|---|
| **Natural Earth 1:10m** (admin_0, boundary lines, populated places, rivers, lakes, coastline, ocean) | podkladová kartografie tisku | **public domain** | doporučeno (nepovinné): „Made with Natural Earth" |
| **HistoGIS (ACDH-ÖAW)** | hranice R-U a korunních zemí 1910 | CC BY 4.0 | povinné: „Historické hranice: HistoGIS (ACDH-ÖAW), CC BY 4.0" |
| **Data ČSH (hainz1904)** | body hodin (437 lokalit) | CC BY 4.0 (web ČSH default) | „Data: Český spolek horologický, dle letáku fy Ludwig Hainz [1905]" |
| případné OSM vrstvy stažené jako data | jen pokud budou použity | ODbL | „© přispěvatelé OpenStreetMap" + share-alike pro odvozené DB |

### Vzorový atribuční řádek pro panel

> Mapa: Český spolek horologický, 2026. Body hodin dle firemního letáku
> Ludwig Hainz, Praha [1905] (archiv firmy L. Hainz). Historické hranice:
> HistoGIS (ACDH-ÖAW), CC BY 4.0. Podkladová kartografie: Natural Earth
> (public domain).

Nekomerční výstavní užití je s uvedenými licencemi plně kompatibilní
(PD bez podmínek; CC BY vyžaduje pouze atribuci; ODbL relevantní jen
při použití OSM dat — samotný tisk mapy je „Produced Work", stačí atribuce).
