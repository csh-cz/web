// Skupiny (organizační jednotky expozice) — panely a vitríny.
//
// Datový model: skupina = kontejner držící menší exponáty. Panel i vitrína
// jsou organizačně totéž, liší se jen `typ`. Členství je odvozeno
// z JEDNOHO zdroje pravdy — `soupis-exponatu.json` (pole `lokace`) —
// takže nemůže dojít k rozejití s ručně udržovaným seznamem.
//
// `hlavni-sal` a `volne-vedlejsi` NEJSOU skupiny (podlahové samostatné kusy).

import soupis from './soupis-exponatu.json';

export interface SoupisItem {
  invCislo: string;
  invCisloNumeric: number | null;
  popis: string;
  typ: string;
  rok: string;
  majitel: string;
  stav: string;
  vztah: string;
  poznamka: string;
  lokace: string;
  lokaceHuman: string;
  sekceCislo: number | null;
  mistnost: string;
}

export type SkupinaTyp = 'panel' | 'vitrina';

export interface Skupina {
  kod: string;
  typ: SkupinaTyp;
  mistnost: string;
  nazev: string;
  clenove: SoupisItem[];
}

const items = soupis as unknown as SoupisItem[];

/** Stabilní slugy kurátorských článků panelů (panely zůstávají jako články). */
const PANEL_ARTICLE_SLUG: Record<string, string> = {
  'panel-1': 'panel-1-hipp-wagner-brillie',
  'panel-2': 'panel-2-maticni-elektrocas',
  'panel-3': 'panel-3-laplace-tn-burk',
  'panel-4': 'panel-4-pragotron',
  'panel-5': 'panel-5-dcf-gps-ntp',
};

/** Typ skupiny podle kódu lokace, nebo null pokud lokace není skupina. */
export function skupinaTyp(kod: string): SkupinaTyp | null {
  if (/^panel-[1-5]$/.test(kod)) return 'panel';
  if (kod.startsWith('vitrina-') || kod.startsWith('rohova-vitrina')) return 'vitrina';
  return null;
}

let _cache: Skupina[] | null = null;

export function getSkupiny(): Skupina[] {
  if (_cache) return _cache;
  const map = new Map<string, Skupina>();
  for (const it of items) {
    const typ = skupinaTyp(it.lokace);
    if (!typ) continue;
    let s = map.get(it.lokace);
    if (!s) {
      s = { kod: it.lokace, typ, mistnost: it.mistnost, nazev: it.lokaceHuman || it.lokace, clenove: [] };
      map.set(it.lokace, s);
    }
    s.clenove.push(it);
  }
  for (const s of map.values()) {
    s.clenove.sort((a, b) => {
      if (a.invCisloNumeric !== null && b.invCisloNumeric !== null) return a.invCisloNumeric - b.invCisloNumeric;
      if (a.invCisloNumeric !== null) return -1;
      if (b.invCisloNumeric !== null) return 1;
      return a.invCislo.localeCompare(b.invCislo, 'cs');
    });
  }
  _cache = [...map.values()];
  return _cache;
}

export function getSkupina(kod: string): Skupina | null {
  return getSkupiny().find((s) => s.kod === kod) ?? null;
}

/** Skupina, do které patří exponát daného inv. čísla (pro zpětný odkaz z karty). */
export function skupinaForInvCislo(inv: string): Skupina | null {
  const it = items.find((i) => String(i.invCislo) === String(inv));
  if (!it) return null;
  return getSkupina(it.lokace);
}

/** URL souhrnné stránky skupiny — panel = kurátorský článek, vitrína = generovaná stránka. */
export function skupinaHref(kod: string): string {
  return PANEL_ARTICLE_SLUG[kod] ? `/sbirka/${PANEL_ARTICLE_SLUG[kod]}/` : `/sbirka/${kod}/`;
}

/** Lidský label typu skupiny. */
export function skupinaTypLabel(typ: SkupinaTyp): string {
  return typ === 'panel' ? 'Panel' : 'Vitrína';
}

/** Lidský label místnosti. */
export function mistnostLabel(mistnost: string): string {
  if (mistnost === 'hlavni') return 'Sál věžních hodin';
  if (mistnost === 'vedlejsi') return 'Sál elektro';
  return mistnost;
}
