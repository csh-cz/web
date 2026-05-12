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
  /** In-memory Set slov, která editor manuálně označil „Ignorovat zde"
   *  v context menu. Per-session, resetuje na refresh. Případně později
   *  promovat do localStorage / GH Issue pro permanent dict add. */
  const ignoredWords = new Set();
  // Per-attach state — uchováváme listenery a původní spellcheck atribut,
  // aby deactivate mohl plně uvolnit textarea pro fresh attach v dalším
  // activate. WeakSet sice neunwineuje, ale my v deactivate musíme
  // iterovat → použijeme Set a vyčistíme po deaktivaci.
  /** @type {Map<HTMLTextAreaElement, {onInput: Function, origSpellcheck: boolean}>} */
  const attachedState = new Map();
  /** @type {Map<HTMLTextAreaElement, HTMLDivElement>} */
  const overlayMap = new Map();

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

  /** Stejná logika jako uvnitř renderOverlay — sjednocený check pro
   *  context menu (najít slovo, rozhodnout zda misspelled). */
  function isMisspelled(word) {
    if (!spellInstance) return false;
    if (word.length < 3) return false;
    if (customWords.has(word) || ignoredWords.has(word)) return false;
    return !spellInstance.spell(word).correct;
  }

  /** Najde slovo (a jeho rozsah) na dané pozici v textu. Walká
   *  back/forward dokud znaky matchují /[A-Za-zÀ-ž]/. Vrací null pokud
   *  pozice neukazuje na slovo (mezera, interpunkce, prázdná řádka). */
  function findWordAt(text, pos) {
    const reChar = /[A-Za-zÀ-ž]/;
    let start = pos;
    let end = pos;
    // Walk backward (i když je kurzor přesně na konci slova, takhle ho najdeme)
    while (start > 0 && reChar.test(text[start - 1])) start--;
    while (end < text.length && reChar.test(text[end])) end++;
    if (start === end) return null;
    return { word: text.slice(start, end), start, end };
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
      const ok = result.correct || customWords.has(tok.word) || ignoredWords.has(tok.word);
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

  // ── Suggestion menu (right-click na podtržené slovo) ────────────

  /** Aktivně zobrazený menu element. Drží se globálně, takže
   *  closeSuggestionMenu může dismissnout i menu otevřené z předchozího
   *  contextmenu na jiné textarea. */
  let activeMenu = null;
  let activeMenuOutsideHandler = null;
  let activeMenuEscHandler = null;

  function closeSuggestionMenu() {
    if (!activeMenu) return;
    activeMenu.remove();
    activeMenu = null;
    if (activeMenuOutsideHandler) {
      document.removeEventListener('mousedown', activeMenuOutsideHandler, true);
      activeMenuOutsideHandler = null;
    }
    if (activeMenuEscHandler) {
      document.removeEventListener('keydown', activeMenuEscHandler, true);
      activeMenuEscHandler = null;
    }
  }

  /** Nahrazení slova v textarea na (start, end) za new. Trigger 'input'
   *  event ručně, aby Sveltia detekovala změnu pro dirty tracking +
   *  re-render overlay. */
  function replaceWord(textarea, start, end, replacement) {
    const before = textarea.value.slice(0, start);
    const after = textarea.value.slice(end);
    textarea.value = before + replacement + after;
    // Cursor na konec replacementu
    const newCursor = start + replacement.length;
    textarea.setSelectionRange(newCursor, newCursor);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.focus();
  }

  async function reportWordToDict(word) {
    // POST do existujícího /api/report-issue endpointu — Cloudflare Access
    // identifies editora, GH Issue se vytvoří s problemType='dict-word'.
    try {
      const r = await fetch('/api/report-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemType: 'dict-word',
          description: `Slovo „${word}" — navrhuji doplnit do CSH spell-check slovníku. (Z context menu spell-checkeru v editoru.)`,
          url: location.href,
          pageTitle: 'Sveltia editor — návrh do slovníku',
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (r.ok) {
        alert(`Návrh poslán — úkol č. ${data.issue?.number ?? '?'}`);
      } else {
        alert(`Návrh neodeslán: ${data.error || r.status}`);
      }
    } catch (e) {
      alert(`Chyba sítě: ${e.message}`);
    }
  }

  function openSuggestionMenu(textarea, hit, clientX, clientY) {
    closeSuggestionMenu(); // remove předchozí menu pokud bylo

    const suggestions = (spellInstance.suggest(hit.word) || []).slice(0, 5);

    const menu = document.createElement('div');
    menu.className = 'csh-spell-menu';
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', `Návrhy oprav pro slovo ${hit.word}`);
    menu.style.cssText =
      'position:fixed;z-index:99999;min-width:220px;max-width:340px;' +
      'background:#1a1a1a;color:#e8d8a8;border:1px solid #c9a85d;' +
      'border-radius:3px;box-shadow:0 4px 16px rgba(0,0,0,.6);' +
      'font:14px/1.4 ui-serif,Georgia,serif;padding:.25rem 0;' +
      'left:' + clientX + 'px;top:' + clientY + 'px';

    function addItem(label, fn, opts = {}) {
      const item = document.createElement('button');
      item.type = 'button';
      item.setAttribute('role', 'menuitem');
      item.style.cssText =
        'display:block;width:100%;text-align:left;padding:.4rem .85rem;' +
        'background:transparent;color:inherit;border:none;cursor:pointer;' +
        'font:inherit;' + (opts.muted ? 'opacity:.7;font-style:italic;' : '');
      item.textContent = label;
      item.addEventListener('mouseenter', () => { item.style.background = '#2a2a2a'; });
      item.addEventListener('mouseleave', () => { item.style.background = 'transparent'; });
      item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeSuggestionMenu();
        fn();
      });
      menu.appendChild(item);
    }

    if (suggestions.length === 0) {
      addItem('(žádné návrhy)', () => {}, { muted: true });
    } else {
      for (const s of suggestions) {
        addItem(s, () => replaceWord(textarea, hit.start, hit.end, s));
      }
    }

    // Separator
    const sep = document.createElement('div');
    sep.style.cssText = 'border-top:1px solid #3a3a3a;margin:.25rem 0';
    menu.appendChild(sep);

    addItem('— Přidat do CSH slovníku', () => reportWordToDict(hit.word), { muted: true });
    addItem('— Ignorovat zde (do refreshe)', () => {
      ignoredWords.add(hit.word);
      renderOverlay(textarea);
    }, { muted: true });

    document.body.appendChild(menu);

    // Repozice — pokud menu přetekne pravý/dolní okraj viewport, posuň
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth - 8) {
      menu.style.left = (window.innerWidth - rect.width - 8) + 'px';
    }
    if (rect.bottom > window.innerHeight - 8) {
      menu.style.top = (window.innerHeight - rect.height - 8) + 'px';
    }

    // Dismiss handlers — capture phase, aby zachytily klik dřív než
    // contextmenu na jiné slovo otevře nové menu (které by se hned zavřelo).
    activeMenuOutsideHandler = (e) => {
      if (!menu.contains(e.target)) closeSuggestionMenu();
    };
    activeMenuEscHandler = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeSuggestionMenu();
        textarea.focus();
      }
    };
    // Defer outside handler attach o 1 tick, aby contextmenu, který menu
    // otevřel, sám sebe nezavřel přes outsideHandler.
    setTimeout(() => {
      if (activeMenu === menu) {
        document.addEventListener('mousedown', activeMenuOutsideHandler, true);
        document.addEventListener('keydown', activeMenuEscHandler, true);
      }
    }, 0);

    activeMenu = menu;
  }

  /** Hook na jednu textarea. Debounce na input pro perf.
   *  Vypneme browser native spellcheck na této textarea — nechceme dva
   *  parallel underline systémy. Původní hodnota se uloží pro restore
   *  v deactivate. */
  function attachToTextarea(textarea) {
    if (attachedState.has(textarea)) return;
    const origSpellcheck = textarea.spellcheck;
    textarea.spellcheck = false;
    let timer = null;
    const onInput = () => {
      clearTimeout(timer);
      timer = setTimeout(() => renderOverlay(textarea), 300);
    };
    const onContextmenu = (e) => {
      // Browser positionuje cursor na klik před contextmenu eventem,
      // takže selectionStart ukazuje na klikané místo.
      const pos = textarea.selectionStart;
      const hit = findWordAt(textarea.value, pos);
      if (!hit || !isMisspelled(hit.word)) return; // Nech native menu
      e.preventDefault();
      openSuggestionMenu(textarea, hit, e.clientX, e.clientY);
    };
    textarea.addEventListener('input', onInput);
    textarea.addEventListener('focus', onInput);
    textarea.addEventListener('contextmenu', onContextmenu);
    attachedState.set(textarea, { onInput, onContextmenu, origSpellcheck });
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
    // Detach all textareas: remove listenery, restore původní spellcheck,
    // vyčistit attachedState Map. Nutné pro re-aktivaci ve stejné session
    // (jinak attach v dalším activate skipne kvůli existujícímu záznamu).
    for (const [ta, state] of attachedState) {
      ta.removeEventListener('input', state.onInput);
      ta.removeEventListener('focus', state.onInput);
      if (state.onContextmenu) ta.removeEventListener('contextmenu', state.onContextmenu);
      ta.spellcheck = state.origSpellcheck;
    }
    attachedState.clear();
    closeSuggestionMenu();
    // Remove overlays + clear map
    for (const overlay of overlayMap.values()) {
      overlay.remove();
    }
    overlayMap.clear();
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
