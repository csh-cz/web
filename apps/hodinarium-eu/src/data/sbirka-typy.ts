/**
 * Rozcestník typů hodin ve sbírce — sdílený mezi /sbirka (landing dlaždice)
 * a /sbirka/typ/[tag] (sbírkově scoped atlas jednoho typu).
 *
 * `tag` musí odpovídat tagu ve frontmatteru karet (content/hodinarium-eu/inv-*.md).
 * `icon` = Font Awesome class string (per memory feedback_ikony_font_awesome) —
 * emoji glyphy zakázány.
 */
export interface TypTile {
  tag: string;
  label: string;
  icon: string;
  popis: string;
  group: 'mech' | 'el' | 'spec';
}

export const typTiles: TypTile[] = [
  // Mechanické hodiny
  { tag: 'vezni',        label: 'Věžní a fasádní',     icon: 'fa-solid fa-landmark', popis: 'Velké stroje z věží kostelů, radnic, zámků a továren.',     group: 'mech' },
  { tag: 'nastenne',     label: 'Nástěnné',            icon: 'fa-solid fa-clock',             popis: 'Švarcvaldky, comtoázky, regulátory a další nástěnky.',     group: 'mech' },
  { tag: 'stolni',       label: 'Stolní',              icon: 'fa-solid fa-clock',             popis: 'Stolní, krbové a podlahové hodiny pro domácí prostředí.',   group: 'mech' },
  { tag: 'kapesni',      label: 'Kapesní',             icon: 'fa-regular fa-clock',           popis: 'Kapesní hodinky a chronometry.',                            group: 'mech' },
  { tag: 'naramkove',    label: 'Náramkové',           icon: 'fa-solid fa-stopwatch',         popis: 'Mechanické a kvarcové náramkovky.',                         group: 'mech' },
  { tag: 'budik',        label: 'Budíky',              icon: 'fa-solid fa-bell',              popis: 'Mechanické a elektromechanické budíky.',                    group: 'mech' },
  { tag: 'decimalka',    label: 'Decimálky',           icon: 'fa-solid fa-table-cells',       popis: 'Decimální (dělení dne na 10 hodin) — vzácné.',              group: 'mech' },
  // Elektrické hodiny
  { tag: 'sitovky',      label: 'Síťovky',             icon: 'fa-solid fa-plug',              popis: 'Synchronní motorové hodiny řízené 50 Hz síťovou frekvencí.', group: 'el' },
  { tag: 'jednotny-cas', label: 'Jednotný čas',        icon: 'fa-solid fa-network-wired',     popis: 'Mateřní + podružné systémy — kostelní, nádražní, tovární.', group: 'el' },
  { tag: 'pichacky',     label: 'Píchací (docházkové)', icon: 'fa-solid fa-business-time',    popis: 'Docházkové hodiny pro evidenci pracovní doby.',             group: 'el' },
  { tag: 'digi',         label: 'Digitálky',           icon: 'fa-solid fa-microchip',         popis: 'Mechanické i elektronické digitální (LCD, LED, flip-clock).', group: 'el' },
  { tag: 'atomove',      label: 'Atomové',             icon: 'fa-solid fa-atom',              popis: 'Cesiové standardy, GPS-disciplinovaný čas, NTP.',           group: 'el' },
  // Speciální
  { tag: 'slunecni',     label: 'Sluneční',            icon: 'fa-solid fa-sun',               popis: 'Sluneční hodiny — stěnové, vodorovné, polární.',            group: 'spec' },
  { tag: 'vodni',        label: 'Vodní',               icon: 'fa-solid fa-droplet',           popis: 'Vodní hodiny (klepsydry).',                                 group: 'spec' },
  { tag: 'pisecne',      label: 'Písečné',             icon: 'fa-solid fa-hourglass-half',    popis: 'Přesýpací hodiny.',                                         group: 'spec' },
  { tag: 'kvetinove',    label: 'Květinové',           icon: 'fa-solid fa-seedling',          popis: 'Květinové hodiny v parcích — Karlovy Vary, Poděbrady.',     group: 'spec' },
];

export const groupLabels: Record<TypTile['group'], string> = {
  mech: 'Mechanické hodiny',
  el: 'Elektrické hodiny',
  spec: 'Speciální časoměrné systémy',
};
