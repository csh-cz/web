/**
 * rehype plugin: označí veškerý EDITORSKÝ APARÁT v edicích pramenů třídou
 * `editorial-note`, aby ho šlo (a) vizuálně odlišit a (b) přepínačem skrýt
 * a nechat „čistý pramen".
 *
 * Edice pramenů (/edice) mají třídílnou strukturu:
 *
 *   [hero ::photo — sken 1. strany]      ← PRAMEN (zůstává vždy)
 *   ## O čem je tato kniha …             ┐
 *   ### O překladu / ### Editorská …     │ ÚVODNÍ APARÁT (skrývá se)
 *   ---                                  ┘ (oddělovač úvodu od pramene)
 *   ## <Název pramene>                   ┐
 *   …přeložený text pramene…             │ PRAMEN (zůstává)
 *   > **Editorská poznámka …**           │   — kromě INLINE poznámek
 *   …                                    ┘     (blockquote „Editor…", skrývá se)
 *   ## Editorská poznámka                ┐ ZÁVĚREČNÝ KOLOFON (skrývá se)
 *   …použitý exemplář, citace, odkazy…   ┘
 *
 * Označí se tři druhy aparátu:
 *   1. INLINE poznámky — blockquote začínající tučně „Editorská poznámka /
 *      komentář / výhrada". (Skutečné citace pramene — „Mistr Hanuš…",
 *      „Vystavuje se…" — nezačínají „Editor", takže zůstávají výrazné.)
 *   2. ÚVOD — vše od začátku těla po PRVNÍ `<hr>` (`---`), který v šabloně
 *      odděluje úvod od pramene. Hero (::photo / mdxJsxFlowElement) se NEoznačí
 *      — sken první stránky je součástí prezentace pramene a zůstává.
 *   3. KOLOFON — poslední nadpis `<h2>` začínající „Editor…" a vše za ním.
 *
 * Styling (ztlumení inline poznámek) + přepínač skrytí zajišťuje global.css
 * + EditorialNotesToggle.astro, scoped na `data-category="edice"`.
 *
 * Šablonová úmluva pro nové edice: mezi úvodem a pramenem MUSÍ být `---`;
 * kolofon je nadepsán `## Editorská poznámka`.
 *
 * Děje se SSR (rehype fáze) → správná třída už v doručeném HTML (bez FOUC,
 * funguje i bez JS).
 */

/** Rekurzivně posbírá textový obsah hast uzlu. */
function textOf(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value || '';
  if (Array.isArray(node.children)) return node.children.map(textOf).join('');
  return '';
}

/** Najde první dětský `element` (přeskočí whitespace text nodes). */
function firstElementChild(node) {
  if (!Array.isArray(node.children)) return null;
  return node.children.find((c) => c.type === 'element') ?? null;
}

/** Přidá CSS třídu hast elementu (idempotentně). */
function addClass(node, cls) {
  node.properties = node.properties || {};
  const c = node.properties.className;
  const list = Array.isArray(c) ? c : c ? [c] : [];
  if (!list.includes(cls)) list.push(cls);
  node.properties.className = list;
}

// „Editorská poznámka", „Editorský komentář", „Editorská výhrada" — i s NBSP.
const EDITORIAL_RE = /^\s*Editor(sk[áéý]|ský)/i;

export default function rehypeEditorialNotes() {
  return (tree) => {
    const children = Array.isArray(tree.children) ? tree.children : [];

    // 1) INLINE poznámky — blockquote začínající „Editor…".
    for (const node of children) {
      if (node.type !== 'element' || node.tagName !== 'blockquote') continue;
      const firstPara = firstElementChild(node);
      if (!firstPara) continue;
      const lead = textOf(firstPara).replace(/ /g, ' ');
      if (EDITORIAL_RE.test(lead)) addClass(node, 'editorial-note');
    }

    // 2) ÚVODNÍ aparát — vše od začátku po první `<hr>` (oddělovač úvod×pramen).
    //    Označí jen hast `element` uzly (nadpisy/odstavce/seznamy/hr); hero
    //    ::photo je `mdxJsxFlowElement` (nebo <figure>), ten přeskočíme.
    const firstHr = children.findIndex(
      (n) => n.type === 'element' && n.tagName === 'hr',
    );
    if (firstHr > 0 && firstHr < children.length - 1) {
      for (let i = 0; i <= firstHr; i++) {
        const n = children[i];
        if (n.type === 'element' && n.tagName !== 'figure') addClass(n, 'editorial-note');
      }
    }

    // 3) ZÁVĚREČNÝ kolofon — POSLEDNÍ `<h2>` začínající „Editor…" a vše za ním.
    //    (Pozn.: úvodní `### Editorská výhrada` je h3 → sem nespadá; navíc je
    //    už pokryto úvodem. Bereme h2, aby se trefil jen `## Editorská poznámka`.)
    let colophonIdx = -1;
    children.forEach((n, i) => {
      if (n.type === 'element' && n.tagName === 'h2' && EDITORIAL_RE.test(textOf(n))) {
        colophonIdx = i;
      }
    });
    if (colophonIdx >= 0) {
      for (let i = colophonIdx; i < children.length; i++) {
        const n = children[i];
        if (n.type === 'element') addClass(n, 'editorial-note');
      }
    }
  };
}
