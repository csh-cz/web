/**
 * Seznam dokumentů ČSH ve sbírce listin Krajského soudu v Č. Budějovicích.
 * Spis L 4908 / KSCB.
 *
 * Pozn.: Justice.cz má časově omezené session tokeny pro download PDF,
 * proto neprovozujeme přímé linky na PDF, ale na detail-page, kde si
 * uživatel klikne a session-aware download proběhne v prohlížeči.
 *
 * Subject ID: 794447, Spis ID: 439453.
 */

export interface SbirkaDokument {
  cislo: string;        // např. "SL14"
  typ: 'ucetni-zaverka' | 'stanovy' | 'zapis-schuze' | 'jine';
  rok?: number;          // rok účetní závěrky / vzniku dokumentu
  popis: string;
  dokumentId: string;    // do URL pro detail
  datumZapisu: string;   // datum zápisu do rejstříku (D. M. YYYY)
  datumVzniku?: string;  // datum vzniku dokumentu
  stran: number;
}

const SUBJEKT_ID = '794447';
const SPIS_ID = '439453';

export function detailUrl(dokumentId: string): string {
  return `https://or.justice.cz/ias/ui/vypis-sl-detail?dokument=${dokumentId}&subjektId=${SUBJEKT_ID}&spis=${SPIS_ID}`;
}

export const dokumenty: SbirkaDokument[] = [
  // Účetní závěrky
  { cislo: 'SL14', typ: 'ucetni-zaverka', rok: 2025, popis: 'Účetní závěrka [2025]', dokumentId: '90749678', datumZapisu: '10. 4. 2026', stran: 1 },
  { cislo: 'SL13', typ: 'ucetni-zaverka', rok: 2024, popis: 'Účetní závěrka [2024]', dokumentId: '85984881', datumZapisu: '25. 4. 2025', stran: 1 },
  { cislo: 'SL12', typ: 'ucetni-zaverka', rok: 2023, popis: 'Účetní závěrka [2023]', dokumentId: '81227458', datumZapisu: '28. 4. 2024', stran: 1 },
  { cislo: 'SL11', typ: 'ucetni-zaverka', rok: 2022, popis: 'Účetní závěrka [2022]', dokumentId: '76269609', datumZapisu: '18. 4. 2023', stran: 1 },
  { cislo: 'SL10', typ: 'ucetni-zaverka', rok: 2021, popis: 'Účetní závěrka [2021]', dokumentId: '71548674', datumZapisu: '3. 5. 2022', stran: 1 },
  { cislo: 'SL9',  typ: 'ucetni-zaverka', rok: 2020, popis: 'Účetní závěrka [2020]', dokumentId: '66002482', datumZapisu: '19. 4. 2021', stran: 1 },
  { cislo: 'SL8',  typ: 'ucetni-zaverka', rok: 2019, popis: 'Účetní závěrka [2019]', dokumentId: '61226939', datumZapisu: '23. 3. 2020', stran: 1 },
  { cislo: 'SL7',  typ: 'ucetni-zaverka', rok: 2018, popis: 'Účetní závěrka [2018]', dokumentId: '56838873', datumZapisu: '27. 3. 2019', stran: 1 },
  { cislo: 'SL6',  typ: 'ucetni-zaverka', rok: 2017, popis: 'Účetní závěrka [2017]', dokumentId: '51864323', datumZapisu: '19. 2. 2018', stran: 1 },
  { cislo: 'SL5',  typ: 'ucetni-zaverka', rok: 2016, popis: 'Účetní závěrka [2016]', dokumentId: '50365957', datumZapisu: '10. 10. 2017', stran: 1 },
  { cislo: 'SL4',  typ: 'ucetni-zaverka', rok: 2015, popis: 'Účetní závěrka [2015]', dokumentId: '50365953', datumZapisu: '10. 10. 2017', stran: 1 },
  { cislo: 'SL3',  typ: 'ucetni-zaverka', rok: 2014, popis: 'Účetní závěrka [2014]', dokumentId: '50365948', datumZapisu: '10. 10. 2017', stran: 1 },

  // Stanovy a zápisy
  { cislo: 'SL2',  typ: 'stanovy',        popis: 'Stanovy spolku', dokumentId: '42887580', datumZapisu: '17. 3. 2016', datumVzniku: '5. 6. 2015', stran: 3 },
  { cislo: 'SL1',  typ: 'zapis-schuze',   popis: 'Zápis ze zasedání členské schůze', dokumentId: '42887557', datumZapisu: '17. 3. 2016', datumVzniku: '5. 6. 2015', stran: 2 },
];

export const sbirkaListinUrl = `https://or.justice.cz/ias/ui/vypis-sl-firma?subjektId=${SUBJEKT_ID}`;
