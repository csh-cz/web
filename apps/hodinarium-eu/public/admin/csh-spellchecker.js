/**
 * CSH browser-side spell-checker pro Sveltia editor.
 *
 * Lazy-loaduje nspell + cs_CZ Hunspell dictionary + custom CSH slovník
 * jen když uživatel zapne v ⚙ Pomocníci panelu. Hook do textarea
 * a contenteditable elementů, podtrhne nematche přes overlay.
 *
 * Architektura:
 *   - nspell @ esm.sh (~50 KB) — JS port Hunspell formátu
 *   - cs_CZ.aff + cs_CZ.dic od wooorm/dictionaries (CDN unpkg, GPL-2.0
 *     license je OK pro use, neumísťujeme do našeho repo)
 *   - csh-spell-dict.json (1242 slov, generovaný ze slovníku + hodinari
 *     + soupis přes scripts/build-cs-spell-dictionary.mjs)
 *
 * Bundle při zapnutí: ~50 KB nspell + ~1.2 MB .aff + ~5 MB .dic +
 * ~50 KB custom = **~6.3 MB** stažení jednorázově (cached browser),
 * ~10 MB heap. Latence: první init ~3-5 s na M1, check tokenu <1 ms.
 *
 * Vypnutí v Pomocníci → unload, GC heap.
 */
(function () {
  'use strict';

  let spellInstance = null; // nspell instance po loadu
  let customWords = null;   // Set<string> z csh-spell-dict.json
  let loadPromise = null;   // dedupe simultaneous loads
  let observer = null;      // MutationObserver pro tracking textarea
  const checkedNodes = new WeakSet(); // textareas s aktivním listenerem
  const overlayMap = new WeakMap();   // textarea → overlay div

  /** Lazy-load nspell + cs dict + custom dict. Idempotentní (vrací
   *  cached promise). Po resolve je spellInstance.spell(word) ready. */
  async function loadSpellChecker() {
    if (spellInstance) return spellInstance;
    if (loadPromise) return loadPromise;

    loadPromise = (async () => {
      console.info('[csh-spell] Loading nspell + cs_CZ Hunspell dict…');
      const [{ default: nspell }, affBuf, dicBuf, custom] = await Promise.all([
        import('https://esm.sh/nspell@2.1.5'),
        fetch('https://unpkg.com/dictionary-cs@2.0.0/index.aff').then((r) => r.arrayBuffer()),
        fetch('https://unpkg.com/dictionary-cs@2.0.0/index.dic').then((r) => r.arrayBuffer()),
        fetch('/admin/csh-spell-dict.json').then((r) => r.json()),
      ]);
      const aff = new TextDecoder('utf-8').decode(affBuf);
      const dic = new TextDecoder('utf-8').decode(dicBuf);
      const inst = nspell({ aff, dic });
      // Add custom CSH words (jména hodinářů, místa, terminy)
      for (const w of custom.words) {
        inst.add(w);
      }
      customWords = new Set(custom.words);
      spellInstance = inst;
      console.info(`[csh-spell] Ready. Base cs dict + ${custom.words.length} custom CSH words.`);
      return inst;
    })();
    return loadPromise;
  }

  /** Tokenizuje text na slova s pozicí — podpora čs. diakritiky,
   *  ignore čísla a interpunkci. */
  function* tokenize(text) {
    const re = /[A-Za-zÀ-ž]+/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      yield { word: m[0], start: m.index, end: m.index + m[0].length };
    }
  }

  /** Přidá overlay div absolutně pozicovaný nad textareou s podtržením
   *  pro nesprávná slova. Stejné rozměry, fonty a padding jako textarea
   *  → underline mřížka sedí na slova v textu pod ní. */
  function getOrCreateOverlay(textarea) {
    let overlay = overlayMap.get(textarea);
    if (overlay) return overlay;

    overlay = document.createElement('div');
    overlay.className = 'csh-spell-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.cssText =
      'position:absolute;pointer-events:none;color:transparent;' +
      'white-space:pre-wrap;word-wrap:break-word;overflow:hidden;' +
      'z-index:1';
    // Přibližný styling — kopíruje fonts a padding z textarea (per-mount).
    const cs = window.getComputedStyle(textarea);
    overlay.style.font = cs.font;
    overlay.style.padding = cs.padding;
    overlay.style.lineHeight = cs.lineHeight;
    overlay.style.letterSpacing = cs.letterSpacing;

    // Vlož overlay jako sourozence textarea, polož přesně přes ni
    const wrapper = textarea.parentElement;
    if (window.getComputedStyle(wrapper).position === 'static') {
      wrapper.style.position = 'relative';
    }
    wrapper.appendChild(overlay);
    function reposition() {
      const r = textarea.getBoundingClientRect();
      const pr = wrapper.getBoundingClientRect();
      overlay.style.top = (r.top - pr.top) + 'px';
      overlay.style.left = (r.left - pr.left) + 'px';
      overlay.style.width = r.width + 'px';
      overlay.style.height = r.height + 'px';
    }
    reposition();
    // Sync scroll mezi textarea a overlay (overlay drží stejnou
    // viewport pozici, scrolluje se vnitřně)
    textarea.addEventListener('scroll', () => {
      overlay.scrollTop = textarea.scrollTop;
      overlay.scrollLeft = textarea.scrollLeft;
    });
    window.addEventListener('resize', reposition);
    new ResizeObserver(reposition).observe(textarea);

    overlayMap.set(textarea, overlay);
    return overlay;
  }

  /** Re-render overlay HTML — escape + wrap špatná slova v <span> s
   *  CSS underline. */
  function renderOverlay(textarea) {
    if (!spellInstance) return;
    const overlay = getOrCreateOverlay(textarea);
    const text = textarea.value;
    const parts = [];
    let lastEnd = 0;
    for (const tok of tokenize(text)) {
      // Skip tokens shorter than 3 (jako i v build-cs-spell-dictionary.mjs)
      if (tok.word.length < 3) continue;
      // nspell.spell() vrací OBJECT { correct, forbidden, warn }, ne boolean.
      // Object je vždy truthy → bug v 1. iteraci kdy `if (spell())` vždy true.
      const result = spellInstance.spell(tok.word);
      const ok = result.correct || customWords.has(tok.word);
      if (ok) continue;
      // Nesprávné slovo — wrap
      parts.push(escapeHtml(text.slice(lastEnd, tok.start)));
      parts.push('<span class="csh-misspelled">');
      parts.push(escapeHtml(tok.word));
      parts.push('</span>');
      lastEnd = tok.end;
    }
    parts.push(escapeHtml(text.slice(lastEnd)));
    overlay.innerHTML = parts.join('');
  }

  function escapeHtml(s) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /** Hook na jednu textarea. Debounce na input pro perf.
   *  Vypneme browser native spellcheck na této textarea — nechceme dva
   *  parallel underline systémy. Původní hodnota se uloží na element pro
   *  obnovu při deaktivaci. */
  function attachToTextarea(textarea) {
    if (checkedNodes.has(textarea)) return;
    checkedNodes.add(textarea);
    // Save původní spellcheck attr pro restore
    textarea.dataset.cshOrigSpellcheck = textarea.spellcheck ? 'true' : 'false';
    textarea.spellcheck = false;
    let timer = null;
    const onInput = () => {
      clearTimeout(timer);
      timer = setTimeout(() => renderOverlay(textarea), 300);
    };
    textarea.addEventListener('input', onInput);
    textarea.addEventListener('focus', onInput);
    // Initial render
    renderOverlay(textarea);
  }

  /** Najde všechny markdown editor textareas a attache. Sveltia
   *  markdown widget používá `<textarea>` s class obsahující "rich-text"
   *  / "markdown" / atd. Heuristika: každá viditelná textarea v Sveltia
   *  app rooth, kde min-height ≥ 100 px (= multi-line editor, ne small
   *  string field). */
  function scanAndAttach() {
    document.querySelectorAll('textarea').forEach((ta) => {
      if (ta.offsetHeight < 60) return; // skip small string fields
      attachToTextarea(ta);
    });
  }

  /** Inject globální CSS pro underline a misspelled span. */
  function injectStyles() {
    if (document.getElementById('csh-spell-styles')) return;
    const style = document.createElement('style');
    style.id = 'csh-spell-styles';
    style.textContent = `
      .csh-spell-overlay { color: transparent; }
      .csh-spell-overlay .csh-misspelled {
        background-image: linear-gradient(45deg, transparent 65%, #d97070 65%, #d97070 80%, transparent 80%);
        background-size: 4px 4px;
        background-position: 0 100%;
        background-repeat: repeat-x;
      }
    `;
    document.head.appendChild(style);
  }

  // ── Lifecycle ───────────────────────────────────────────────────

  let active = false;

  async function activate() {
    if (active) return;
    try {
      await loadSpellChecker();
      injectStyles();
      scanAndAttach();
      // Watch DOM pro nové textarea (Sveltia mountuje editor lazy)
      observer = new MutationObserver(scanAndAttach);
      observer.observe(document.body, { childList: true, subtree: true });
      active = true;
      console.info('[csh-spell] Activated.');
    } catch (e) {
      console.error('[csh-spell] Failed to activate:', e);
    }
  }

  function deactivate() {
    if (!active) return;
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    // Remove overlays
    document.querySelectorAll('.csh-spell-overlay').forEach((el) => el.remove());
    active = false;
    console.info('[csh-spell] Deactivated.');
  }

  /** Set browser native spellcheck attribute na všech editor textareas.
   *  Mode 'native' = true (browser kontroluje), 'csh' už dělá náš overlay
   *  (a v attachToTextarea jsme native vypnuli), 'off' = false. */
  function setNativeSpellcheckAll(enabled) {
    document.querySelectorAll('textarea').forEach((ta) => {
      if (ta.offsetHeight < 60) return;
      ta.spellcheck = enabled;
    });
  }

  // ── Wiring na settings ──────────────────────────────────────────

  function applySettings(s) {
    // Backwards-compat: starý formát měl jen `spellcheck: bool`.
    const mode = s.spellcheckMode || (s.spellcheck ? 'csh' : 'native');
    if (mode === 'csh') {
      // CSH overlay aktivní, browser native vypnutý (overlay sám vypíná
      // textarea.spellcheck v attachToTextarea — žádné parallel underline)
      if (!active) activate();
    } else {
      // Mode 'native' nebo 'off' — náš overlay zhasnout
      if (active) deactivate();
      // Mode 'native' = nech browser dělat svou práci.
      // Mode 'off' = vypnout i browser.
      setNativeSpellcheckAll(mode === 'native');
    }
  }

  // Initial state
  if (window.cshEditor) {
    applySettings(window.cshEditor.getSettings());
    window.cshEditor.onSettingsChanged(applySettings);
  } else {
    // csh-editor-helpers.js se ještě nenačetl — počkej
    window.addEventListener('DOMContentLoaded', () => {
      if (window.cshEditor) {
        applySettings(window.cshEditor.getSettings());
        window.cshEditor.onSettingsChanged(applySettings);
      }
    });
  }
})();
