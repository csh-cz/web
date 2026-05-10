# D6 Slug rename — dry-run preview

**Generated:** 2026-05-10T21:00:17.819Z

## Souhrn

- **Soubory navržené k přejmenování:** 121
- **Konflikty (duplicate target):** 0
- **Pouze case-fold** (Arduino → arduino): 8
- **Underscore / CamelCase rozpad** (Arduino_IBM → arduino-ibm): 105

## Postup po schválení

Pro každý řádek v tabulce níže ostrá verze udělá:

1. `git mv content/<col>/<oldId>.<ext> content/<col>/<newId>.<ext>`
2. Update `slug:` pole ve frontmatteru souboru
3. Přidá redirect `/<old-url> /<new-url> 301` do `scripts/build-redirects.ts`
   - Specifické pro non-karta články: `/clanky/<oldId>` a `/<kategorie>/<oldId>`
   - Karty (sbirka/karta/inv-*): glob už existuje, jen rename file
4. Grep všech inline markdown odkazů `[text](/clanky/<old>)` napříč repo + replace
5. Catalog.json se přepočítá automaticky při `pnpm build`
6. Sveltia config: `slug pattern hint` už existuje (= editor info)

## Konflikty (vyžadují manual override)

_Žádné konflikty._

## hodinarium-eu (112 souborů)

| Starý slug | Nový slug |
|---|---|
| `12_24` | `12-24` |
| `ATO` | `ato` |
| `Arduino` | `arduino` |
| `Arduino_IBM` | `arduino-ibm` |
| `Arduino_Solari` | `arduino-solari` |
| `ESV3` | `esv3` |
| `GPS_Sakul` | `gps-sakul` |
| `Kappa` | `kappa` |
| `Lantime_M100` | `lantime-m100` |
| `NTPH` | `ntph` |
| `PRS10` | `prs10` |
| `RickStanley` | `rick-stanley` |
| `Staiger` | `staiger` |
| `TimHunkin` | `tim-hunkin` |
| `TimeSlider` | `time-slider` |
| `Timometer` | `timometer` |
| `arduino_PPS` | `arduino-pps` |
| `astro2_NTP` | `astro2-ntp` |
| `astronomicke_Sauter` | `astronomicke-sauter` |
| `atomove_kapesni` | `atomove-kapesni` |
| `bychory_dalsi_kola` | `bychory-dalsi-kola` |
| `bychory_prokes1` | `bychory-prokes1` |
| `cas_internet1` | `cas-internet1` |
| `cas_internet2` | `cas-internet2` |
| `casova_pasma` | `casova-pasma` |
| `casovy_zamek` | `casovy-zamek` |
| `co_pisi_jini` | `co-pisi-jini` |
| `decin_NTP` | `decin-ntp` |
| `decin_Wenzel_Mellner` | `decin-wenzel-mellner` |
| `decin_bici_stroje` | `decin-bici-stroje` |
| `decin_chronulator` | `decin-chronulator` |
| `decin_elektrifikace` | `decin-elektrifikace` |
| `decin_flatbed` | `decin-flatbed` |
| `decin_galerie` | `decin-galerie` |
| `decin_jednotny_cas` | `decin-jednotny-cas` |
| `decin_patek` | `decin-patek` |
| `decin_regulaceIBM` | `decin-regulace-ibm` |
| `decin_velika_ves` | `decin-velika-ves` |
| `decin_vypousteny` | `decin-vypousteny` |
| `decin_zamek` | `decin-zamek` |
| `elektromagneticke_segmenty` | `elektromagneticke-segmenty` |
| `fake_atomove_hodiny` | `fake-atomove-hodiny` |
| `flying_pendulum` | `flying-pendulum` |
| `hainz_natahovani` | `hainz-natahovani` |
| `kalendar_rimsky` | `kalendar-rimsky` |
| `kapesni_orloj` | `kapesni-orloj` |
| `kardasova_recice` | `kardasova-recice` |
| `kvetinovehodiny_Chomutov` | `kvetinovehodiny-chomutov` |
| `kvetinovehodiny_NMnM` | `kvetinovehodiny-n-mn-m` |
| `line_kyvadlo` | `line-kyvadlo` |
| `listkove_kohler` | `listkove-kohler` |
| `mereni_casu` | `mereni-casu` |
| `muzea_cr` | `muzea-cr` |
| `muzeum_aschau_burgenland` | `muzeum-aschau-burgenland` |
| `muzeum_beyer_zurich` | `muzeum-beyer-zurich` |
| `muzeum_chemnitz` | `muzeum-chemnitz` |
| `muzeum_furtwangen` | `muzeum-furtwangen` |
| `muzeum_gdansk_marien` | `muzeum-gdansk-marien` |
| `muzeum_gdansk_zegarow_wiezowych` | `muzeum-gdansk-zegarow-wiezowych` |
| `muzeum_glashutte` | `muzeum-glashutte` |
| `muzeum_jindrisska_vez` | `muzeum-jindrisska-vez` |
| `muzeum_kadan_orloj` | `muzeum-kadan-orloj` |
| `muzeum_klementinum` | `muzeum-klementinum` |
| `muzeum_mih_chaux_de_fonds` | `muzeum-mih-chaux-de-fonds` |
| `muzeum_mnichovo_hradiste` | `muzeum-mnichovo-hradiste` |
| `muzeum_olomouc_vmo` | `muzeum-olomouc-vmo` |
| `muzeum_ostravske` | `muzeum-ostravske` |
| `muzeum_patek_philippe` | `muzeum-patek-philippe` |
| `muzeum_pillichsdorf` | `muzeum-pillichsdorf` |
| `muzeum_radnicni_vez_prostejov` | `muzeum-radnicni-vez-prostejov` |
| `muzeum_royal_observatory` | `muzeum-royal-observatory` |
| `muzeum_stara_bystrica` | `muzeum-stara-bystrica` |
| `muzeum_tyniste_n_orlici` | `muzeum-tyniste-n-orlici` |
| `muzeum_waldmunchen` | `muzeum-waldmunchen` |
| `muzeum_wien` | `muzeum-wien` |
| `perpetum_mobile` | `perpetum-mobile` |
| `podruzne_sekundove` | `podruzne-sekundove` |
| `prehled_zvonu` | `prehled-zvonu` |
| `propeller_clock` | `propeller-clock` |
| `radiotelegraficke_signaly` | `radiotelegraficke-signaly` |
| `rizeni_kyvadla` | `rizeni-kyvadla` |
| `segmentovky_s_prekladem` | `segmentovky-s-prekladem` |
| `skymaster_ghost` | `skymaster-ghost` |
| `slunecni_digi` | `slunecni-digi` |
| `slunecni_filler` | `slunecni-filler` |
| `slunecni_polarizacni` | `slunecni-polarizacni` |
| `svarcvaldky_17stol` | `svarcvaldky-17stol` |
| `svarcvaldky_18stol` | `svarcvaldky-18stol` |
| `svarcvaldky_hraci` | `svarcvaldky-hraci` |
| `svarcvaldky_stroje` | `svarcvaldky-stroje` |
| `svarcvaldky_stroje2` | `svarcvaldky-stroje2` |
| `svarcvaldky_stroje_polodrev` | `svarcvaldky-stroje-polodrev` |
| `svarcvaldky_surrerwerk` | `svarcvaldky-surrerwerk` |
| `synchron_bici` | `synchron-bici` |
| `synchronizace_hodin` | `synchronizace-hodin` |
| `vez_Budislav` | `vez-budislav` |
| `vez_Kli` | `vez-kli` |
| `vez_Prysk` | `vez-prysk` |
| `vez_Zlate_Hory` | `vez-zlate-hory` |
| `vez_decin` | `vez-decin` |
| `vez_elektrocas1959` | `vez-elektrocas1959` |
| `vezni_muzejicko_evropa` | `vezni-muzejicko-evropa` |
| `vezni_zikmund1` | `vezni-zikmund1` |
| `vodni_B_Gitton` | `vodni-b-gitton` |
| `vodni_budik` | `vodni-budik` |
| `vodni_jegorov` | `vodni-jegorov` |
| `vodni_minutky` | `vodni-minutky` |
| `vodni_odkazy` | `vodni-odkazy` |
| `zvon_petr_pavel` | `zvon-petr-pavel` |
| `zvon_petr_vok` | `zvon-petr-vok` |
| `zvony_uvod` | `zvony-uvod` |
| `zvony_vyroba` | `zvony-vyroba` |

## kronika (9 souborů)

| Starý slug | Nový slug |
|---|---|
| `decin_aktual0` | `decin-aktual0` |
| `decin_fotobrezen2017` | `decin-fotobrezen2017` |
| `decin_fotolistopad2018` | `decin-fotolistopad2018` |
| `decin_toulava_kamera2016` | `decin-toulava-kamera2016` |
| `sezona2012_foto_marusak` | `sezona2012-foto-marusak` |
| `vez_instalace1` | `vez-instalace1` |
| `vez_provoz2011` | `vez-provoz2011` |
| `vez_signatury` | `vez-signatury` |
| `vezni_muzejicko` | `vezni-muzejicko` |

