/**
 * rehype plugin: označí „editorské poznámky" v těle článku.
 *
 * V edicích pramenů (rubrika /edice) jsou do přeloženého textu vloženy
 * redakční komentáře jako Markdown blockquoty začínající tučným nadpisem
 * „Editorská poznámka…", „Editorský komentář…", „Editorská výhrada…".
 * Tentýž blockquote element se ale používá i pro SKUTEČNÉ citace pramene
 * (např. „Vystavuje se k vidění…", „Mistr Hanuš kolem roku 1490…"), které
 * mají zůstat vizuálně výrazné. Rozlišovacím znakem je, že editorská
 * poznámka začíná slovem „Editor…".
 *
 * Plugin přidá takovým blockquotům třídu `editorial-note`. Styling
 * (ztlumení aparátu vůči prameni) a toggle skrytí/zobrazení zajišťuje
 * global.css + EditorialNotesToggle.astro, scoped na `data-category="edice"`.
 *
 * Děje se SSR (v rehype fázi), takže poznámky mají správnou třídu už
 * v doručeném HTML — žádný FOUC, funguje i bez JS.
 */
import { visit } from 'unist-util-visit';

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

// „Editorská poznámka", „Editorský komentář", „Editorská výhrada" — i s NBSP.
const EDITORIAL_RE = /^\s*Editor(sk[áéý]|ský)/i;

export default function rehypeEditorialNotes() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'blockquote') return;
      const firstPara = firstElementChild(node);
      if (!firstPara) return;
      const lead = textOf(firstPara).replace(/ /g, ' ');
      if (!EDITORIAL_RE.test(lead)) return;

      node.properties = node.properties || {};
      const cls = node.properties.className;
      const list = Array.isArray(cls) ? cls : cls ? [cls] : [];
      if (!list.includes('editorial-note')) list.push('editorial-note');
      node.properties.className = list;
    });
  };
}
