/**
 * Auto-link slovníkových termínů ve volném textu (např. v polích
 * KartaSbirky komponenty: vyrobce, krok, biciStroje, pohon, kyvadlo,
 * ciselnik). Laik narazí na „Grahamův krok" / „čtvrťový stroj" /
 * „klecový rám z pásnic" a chce kliknout na výklad.
 *
 * Sister utility k `scripts/auto-link-slovnik.mjs` (běží na content
 * body při buildu). Tato verze je runtime, používá ji KartaSbirky
 * komponenta při SSR.
 *
 * Strategie:
 *   - První výskyt aliasu → `<a href="/slovnik/<slug>">term</a>`
 *   - Max 1 link per slug per volání (parametr opts.perCallLimit)
 *   - Word boundary match (\b) — „pero" v „pokus pero" matchne, ale
 *     „pero" v „operátor" ne
 *   - Case-sensitive aliasy s podporou českých skloňování (jak
 *     definovaných v whitelistu)
 *
 * Whitelist je menší podmnožina `auto-link-slovnik.mjs` — vybrané
 * termíny, které se prokazatelně objevují v hodnotách KartaSbirky
 * polí (audit 2026-05-09 přes 268 evidenčních karet).
 */

/** slug → aliases (1.+ slovní formy s diakritikou). První alias by měl
 *  být kanonický nominativ. */
const SLOVNIK_KARTA_LINK: Record<string, string[]> = {
  // Mechanika
  kyvadlo: ['kyvadlo', 'kyvadla', 'kyvadlu', 'kyvadlem', 'kyvadlový', 'kyvadlové'],
  setrvacka: ['setrvačka', 'setrvačky', 'setrvačku', 'setrvačkou'],
  vlasek: ['vlásek', 'vlásku', 'vláskem'],
  soukoli: ['soukolí', 'soukolím'],
  perovnik: ['perovník', 'perovníku', 'perovníky', 'perovníkem'],
  snek: ['šnek', 'šneku', 'šnekem', 'šnekový závitek'],
  // Bicí
  'bici-stroj': ['bicí stroj', 'bicím strojem', 'bicí soukolí'],
  cymbal: ['cymbál', 'cymbály', 'cymbálu'],
  kladivko: ['kladívko', 'kladívka', 'kladívkem'],
  pocetnik: ['početník', 'početníku'],
  srdcovka: ['srdcovka', 'srdcovky'],
  vetrnik: ['větrník', 'větrníku', 'větrníkem'],
  'ctvrtove-biti': [
    'čtvrťové bití',
    'čtvrťová repetice',
    'čtvrťový stroj',
    'čtvrťové hodiny',
  ],
  'westminster-chime': ['Westminster chime', 'westminsterský zvon'],
  // Pohon
  zavazi: ['závaží', 'závažím', 'závaží na'],
  // Materiály
  invar: ['invar', 'invaru', 'invarem'],
  isochronismus: ['isochronismus', 'isochronní'],
  'kompenzace-teplotni': [
    'teplotní kompenzace',
    'kompenzační kyvadlo',
    'kompensační kyvadlo',
  ],
  'rubinovy-kamen': ['rubínový kámen', 'rubínových kamenů'],
  // Hodinky
  kalibr: ['kalibr', 'kalibru', 'kalibrem'],
  korunka: ['korunka', 'korunky', 'korunkové natahování'],
  sklicko: ['sklíčko', 'safírové sklo'],
  pouzdro: ['pouzdro', 'pouzdra', 'pouzdrem'],
  signatura: ['signatura', 'signatury', 'signatuře'],
  chronograf: ['chronograf', 'chronografu'],
  // Astronomické
  'slunecni-hodiny': ['sluneční hodiny', 'slunečních hodin', 'sluneční hodinky'],
  gnomon: ['gnómon', 'gnómonu'],
  'casova-rovnice': ['časová rovnice', 'rovnice času'],
  kvadrant: ['kvadrant', 'kvadrantu'],
  chronometr: ['chronometr', 'chronometru', 'chronometrický'],
  lihyr: ['lihýř', 'lihýře', 'foliot'],
  regulator: ['regulátor', 'regulátoru', 'regulátorové'],
};

/** Escape HTML special chars před interpolací do `set:html`. Ochrana
 *  proti XSS i pro trusted YAML data — pravidlo defense-in-depth. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Escape regex metacharacters v aliasu. */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Vrátí HTML string s prvním výskytem každého whitelisted slovníkového
 * termínu nahrazeným za `<a href="/slovnik/<slug>">term</a>`.
 *
 * Vstup je escapováno přes `escapeHtml` před nahrazováním, takže nikdy
 * neinterpoluje uživatelský HTML (defense-in-depth — i když fronty jsou
 * trusted source).
 */
export function linkSlovnikTermy(value: string): string {
  if (!value || value.length === 0) return '';
  let html = escapeHtml(value);

  for (const [slug, aliases] of Object.entries(SLOVNIK_KARTA_LINK)) {
    // Seřaď aliasy od nejdelšího — multi-word phrase má prioritu před
    // single word, jinak by „čtvrťový stroj" mohlo collidovat s „stroj"
    // (kdyby bylo v whitelistu).
    const sorted = [...aliases].sort((a, b) => b.length - a.length);
    for (const alias of sorted) {
      const escaped = escapeRegex(alias);
      // Word boundary na začátku, lookahead na konci — `\b` v JS regex
      // pracuje s ASCII, pro českou diakritiku použijeme custom.
      // Před: start of string nebo non-letter. Po: non-letter nebo end.
      const re = new RegExp(
        `(^|[^a-zA-Z\\u00C0-\\u017F])(${escaped})(?=[^a-zA-Z\\u00C0-\\u017F]|$)`,
        '',
      );
      const m = html.match(re);
      if (m) {
        const replacement = `${m[1]}<a href="/slovnik/${slug}">${m[2]}</a>`;
        html = html.replace(re, replacement);
        break; // jen první výskyt jednoho aliasu na slug
      }
    }
  }
  return html;
}
