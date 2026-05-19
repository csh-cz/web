/**
 * CSH Citation picker (Cmd+R / Ctrl+R) pro Sveltia editor.
 *
 * Modal pro vkládání bibliografických citací z lokálního snapshotu
 * Davidova Zotera. Editor (Petr, ostatní) NEMÁ Zotero account — pracuje
 * jen nad `/data/references.json` (~2 MB, 2697 entries s citation-key,
 * sync přes `pnpm refs:sync`).
 *
 * Workflow:
 *   - Editor v textarea: pozici kurzoru → Cmd+R → modal
 *   - Search input → debounced filter na author/year/title/citation-key
 *   - Klik vloží inline citaci `[Author Year, s. X]` na pozici kurzoru
 *   - Plus copy-to-clipboard YAML snippet pro frontmatter `references[]`
 *     (idempotentní — pokud bibKey už v references, neduplikovat)
 *
 * Default insertion style: author-date `[Author Year]` (= `referenceStyle: bullet`).
 * Pro numbered články by editor mohl wraput v `<Ref bibKey="..." />` —
 * V1 zatím jen markdown text, později detekce z frontmatter.
 *
 * Toggle přes ⚙ Pomocníci panel.
 */
(function () {
  'use strict';

  let active = false;
  let modalEl = null;
  let currentTextarea = null;
  let currentSelStart = 0;
  let currentSelEnd = 0;

  /** Lazy-loaded CSL JSON dictionary { bibKey: cslItem }. */
  let cslData = null;
  /** Pre-flattened search index for O(N) text filter — [{key, blob, item}, ...] */
  let searchIndex = null;
  let loadPromise = null;

  // ── Data loading ────────────────────────────────────────────────

  async function loadReferences() {
    if (cslData) return cslData;
    if (loadPromise) return loadPromise;
    loadPromise = (async () => {
      console.info('[csh-cite] Loading references.json…');
      const r = await fetch('/data/references.json', { credentials: 'omit' });
      if (!r.ok) throw new Error(`references.json fetch failed: ${r.status}`);
      cslData = await r.json();
      // Build flat index for fast filter
      searchIndex = [];
      for (const id of Object.keys(cslData)) {
        const it = cslData[id];
        const ck = it['citation-key'] || id;
        const authors = (it.author || []).map((a) => a.family || a.literal || '').join(' ');
        const editors = (it.editor || []).map((a) => a.family || a.literal || '').join(' ');
        const yr = it.issued?.['date-parts']?.[0]?.[0] || '';
        const tt = it.title || it['container-title'] || '';
        const tags = (it.note || '').replace(/\s+/g, ' ');
        const blob = `${ck} ${authors} ${editors} ${yr} ${tt} ${tags}`.toLowerCase();
        searchIndex.push({ key: ck, blob, item: it });
      }
      console.info(`[csh-cite] Loaded ${searchIndex.length} CSL entries.`);
      return cslData;
    })();
    return loadPromise;
  }

  // ── Citation rendering ──────────────────────────────────────────

  /** Author-date inline marker: `[Bureš 1965]` nebo `[Bureš 1965, s. 87]`. */
  function inlineMarker(item, pages = '') {
    const first = (item.author || item.editor || [])[0];
    const surname = first?.family || first?.literal || '';
    const yr = item.issued?.['date-parts']?.[0]?.[0] || '';
    const head = surname && yr ? `${surname} ${yr}` : (surname || yr || item['citation-key']);
    return pages ? `[${head}, s. ${pages}]` : `[${head}]`;
  }

  /** Plain-text ISO 690-ish summary pro result list display (no full citeproc). */
  function summarize(item) {
    const authors = (item.author || []).map((a) =>
      `${a.family || ''}${a.given ? ', ' + a.given : ''}`
    ).join('; ');
    const yr = item.issued?.['date-parts']?.[0]?.[0] || '';
    const title = item.title || item['container-title'] || '(bez názvu)';
    const pub = item['publisher-place'] && item.publisher
      ? `${item['publisher-place']}: ${item.publisher}`
      : (item.publisher || item['container-title'] || '');
    const parts = [authors, yr ? `(${yr})` : '', title, pub].filter(Boolean);
    return parts.join('. ');
  }

  function typeLabel(type) {
    // FA icon + label. Per memory feedback_ikony_font_awesome — emoji zakázány.
    const fa = (icon, label) => `<i class="fa-solid ${icon}" aria-hidden="true"></i> ${label}`;
    return ({
      'article-journal': fa('fa-newspaper', 'článek'),
      'book': fa('fa-book', 'kniha'),
      'chapter': fa('fa-file-lines', 'kapitola'),
      'thesis': fa('fa-graduation-cap', 'dis.'),
      'report': fa('fa-clipboard-list', 'zpráva'),
      'manuscript': fa('fa-pen-nib', 'rukopis'),
      'webpage': fa('fa-globe', 'web'),
      'paper-conference': fa('fa-chart-column', 'konf.'),
    })[type] || `· ${type}`;
  }

  /** YAML snippet pro vložení do frontmatter `references[]` (copy-paste). */
  function frontmatterSnippet(item, pages = '') {
    const bibKey = item['citation-key'] || item.id;
    const lines = [`  - bibKey: "${bibKey}"`];
    if (pages) lines.push(`    pages: "${pages}"`);
    return lines.join('\n');
  }

  // ── UI ──────────────────────────────────────────────────────────

  function buildModal() {
    if (modalEl) return modalEl;
    const m = document.createElement('div');
    m.className = 'csh-cite-modal';
    m.style.cssText =
      'display:none;position:fixed;inset:0;z-index:99999;' +
      'background:rgba(0,0,0,.6);backdrop-filter:blur(2px);' +
      'align-items:flex-start;justify-content:center;padding-top:8vh';
    m.innerHTML = `
      <div style="background:#1a1a1a;color:#e8d8a8;border:1px solid #c9a85d;
                  border-radius:4px;width:min(720px,92vw);max-height:80vh;
                  display:flex;flex-direction:column;
                  font:14px/1.4 ui-serif,Georgia,serif;
                  box-shadow:0 16px 48px rgba(0,0,0,.7)">
        <div style="padding:.85rem 1rem .35rem;border-bottom:1px solid #3a3a3a">
          <div style="display:flex;align-items:center;gap:.6rem">
            <i class="fa-solid fa-book-open" aria-hidden="true" style="font-size:1.05rem"></i>
            <input id="csh-cite-q" type="search" autocomplete="off" spellcheck="false"
                   placeholder="Hledej citaci (Bureš 1965, věžní hodiny, Sušický)…"
                   style="flex:1;background:transparent;border:none;outline:none;
                          color:#e8d8a8;font:inherit;font-size:1.05rem;padding:.3rem 0">
            <kbd style="font-family:ui-monospace,monospace;font-size:.7rem;
                        padding:.15rem .4rem;background:#0a0807;border:1px solid #444;
                        border-radius:2px;color:#999">esc</kbd>
          </div>
          <div style="display:flex;align-items:center;gap:.6rem;margin-top:.4rem;font-size:.8rem;color:#999">
            <label style="display:flex;align-items:center;gap:.3rem">
              <span>strany (volitelné):</span>
              <input id="csh-cite-pages" type="text" autocomplete="off"
                     placeholder="87 nebo 87–92"
                     style="background:transparent;border:1px solid #3a3a3a;
                            color:#e8d8a8;font:inherit;font-size:.85rem;
                            padding:.15rem .4rem;border-radius:2px;width:7em">
            </label>
            <span id="csh-cite-status" style="margin-left:auto;opacity:.6"></span>
          </div>
        </div>
        <div id="csh-cite-results"
             style="overflow-y:auto;flex:1;padding:.4rem;min-height:200px"></div>
        <div style="padding:.4rem .8rem;border-top:1px solid #3a3a3a;
                    font-size:.72rem;color:#888;display:flex;justify-content:space-between">
          <span>↑↓ navigace · ↵ vložit · esc zavřít</span>
          <a href="/admin/handbook/" target="_blank"
             style="color:#c9a85d;text-decoration:none">Citace nenalezena?</a>
        </div>
      </div>
    `;
    document.body.appendChild(m);

    const q = m.querySelector('#csh-cite-q');
    const pagesInput = m.querySelector('#csh-cite-pages');
    let debounceTimer;

    q.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => runSearch(q.value), 120);
    });
    q.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); closeModal(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); navigateResults(+1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); navigateResults(-1); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        const sel = m.querySelector('.csh-cite-result.is-selected');
        if (sel) sel.click();
      }
    });
    pagesInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); closeModal(); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        const sel = m.querySelector('.csh-cite-result.is-selected');
        if (sel) sel.click();
      }
    });

    document.addEventListener('mousedown', (e) => {
      if (m.style.display !== 'flex') return;
      if (m.contains(e.target)) return;
      closeModal();
    });

    return m;
  }

  function navigateResults(dir) {
    const results = modalEl.querySelectorAll('.csh-cite-result');
    if (results.length === 0) return;
    const current = modalEl.querySelector('.csh-cite-result.is-selected');
    let idx = current ? Array.from(results).indexOf(current) : -1;
    idx += dir;
    if (idx < 0) idx = results.length - 1;
    if (idx >= results.length) idx = 0;
    results.forEach((r) => r.classList.remove('is-selected'));
    results[idx].classList.add('is-selected');
    results[idx].scrollIntoView({ block: 'nearest' });
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /** Run search nad searchIndex — multi-token AND match, tokenized.
   *  Lookuje substring v `blob` (lowercase, all-fields concatenated). */
  function runSearch(query) {
    const resultsEl = modalEl.querySelector('#csh-cite-results');
    const statusEl = modalEl.querySelector('#csh-cite-status');
    const q = query.trim().toLowerCase();
    if (q.length < 2) {
      resultsEl.innerHTML =
        '<div style="padding:.6rem .8rem;opacity:.6;font-size:.85rem">' +
        'Začni psát ≥ 2 znaky pro hledání.</div>';
      statusEl.textContent = `${searchIndex.length} citací k dispozici`;
      return;
    }

    const tokens = q.split(/\s+/).filter((t) => t.length >= 2);
    if (tokens.length === 0) return;

    const matches = [];
    for (const entry of searchIndex) {
      if (tokens.every((t) => entry.blob.includes(t))) {
        matches.push(entry);
        if (matches.length >= 50) break; // cap to avoid render slowdown
      }
    }

    statusEl.textContent = matches.length === 0
      ? 'žádné výsledky'
      : `${matches.length}${matches.length >= 50 ? '+' : ''} výsledků`;

    if (matches.length === 0) {
      resultsEl.innerHTML =
        '<div style="padding:.6rem .8rem;opacity:.7;font-size:.85rem">' +
        'Žádné citace nenalezeny.<br>' +
        'Pokud reference v Zoteru chybí, požádej Davida přes „Citace nenalezena?" (link dole).</div>';
      return;
    }

    resultsEl.innerHTML = '';
    for (const { key, item } of matches.slice(0, 30)) {
      // const yr = item.issued?.['date-parts']?.[0]?.[0] || ''; // unused — removed
      const div = document.createElement('div');
      div.className = 'csh-cite-result';
      div.dataset.bibkey = key;
      div.style.cssText =
        'padding:.5rem .7rem;border-radius:.25rem;cursor:pointer;' +
        'border:1px solid transparent;transition:background 100ms;margin-bottom:.15rem';
      div.innerHTML = `
        <div style="display:flex;align-items:baseline;gap:.5rem;flex-wrap:wrap">
          <span style="font-size:.7rem;color:#999;font-family:ui-monospace,monospace;
                       background:#0a0807;border:1px solid #333;padding:.05rem .25rem;
                       border-radius:2px">${escapeHtml(typeLabel(item.type))}</span>
          <span style="font-weight:500;color:#e8d8a8">${escapeHtml(summarize(item))}</span>
        </div>
        <div style="font-family:ui-monospace,monospace;font-size:.7rem;
                    opacity:.5;margin-top:.2rem">${escapeHtml(key)}</div>
      `;
      div.addEventListener('mouseenter', () => {
        modalEl.querySelectorAll('.csh-cite-result.is-selected').forEach((el) => el.classList.remove('is-selected'));
        div.classList.add('is-selected');
      });
      div.addEventListener('click', () => insertCitation(item));
      resultsEl.appendChild(div);
    }
    const first = resultsEl.querySelector('.csh-cite-result');
    if (first) first.classList.add('is-selected');
  }

  // ── Insert ──────────────────────────────────────────────────────

  function insertCitation(item) {
    if (!currentTextarea) return;
    const pages = modalEl.querySelector('#csh-cite-pages').value.trim();
    const marker = inlineMarker(item, pages);
    const ta = currentTextarea;
    const before = ta.value.slice(0, currentSelStart);
    const after = ta.value.slice(currentSelEnd);
    ta.value = before + marker + after;
    const newPos = currentSelStart + marker.length;
    ta.selectionStart = ta.selectionEnd = newPos;
    ta.dispatchEvent(new Event('input', { bubbles: true }));

    // Copy YAML snippet to clipboard for frontmatter
    const snippet = frontmatterSnippet(item, pages);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(snippet).catch(() => {});
    }

    closeModal();
    toast(`Vloženo: ${marker}\n\nDo frontmatter references[] připoj (zkopírováno):\n${snippet}`);
  }

  // ── Toast ───────────────────────────────────────────────────────

  let toastEl = null;
  function toast(message) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.style.cssText =
        'position:fixed;bottom:1rem;right:1rem;z-index:99999;' +
        'background:#1a1a1a;color:#e8d8a8;border:1px solid #c9a85d;' +
        'border-radius:4px;padding:.7rem 1rem;max-width:480px;' +
        'font:13px/1.45 ui-serif,Georgia,serif;white-space:pre-wrap;' +
        'box-shadow:0 8px 24px rgba(0,0,0,.6);' +
        'transition:opacity 200ms';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    toastEl.style.opacity = '1';
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => { toastEl.style.opacity = '0'; }, 8000);
  }

  // ── Open / close ────────────────────────────────────────────────

  async function openModal(textarea) {
    currentTextarea = textarea;
    currentSelStart = textarea.selectionStart;
    currentSelEnd = textarea.selectionEnd;
    const selectionText = textarea.value.slice(currentSelStart, currentSelEnd);

    const m = buildModal();
    m.style.display = 'flex';
    const q = m.querySelector('#csh-cite-q');
    const pagesInput = m.querySelector('#csh-cite-pages');
    pagesInput.value = '';
    q.value = selectionText.trim();
    q.focus();
    q.select();

    // Ensure data loaded
    try {
      await loadReferences();
    } catch (e) {
      m.querySelector('#csh-cite-results').innerHTML =
        '<div style="padding:.6rem .8rem;color:#d97070">' +
        'Chyba načtení references.json: ' + escapeHtml(e.message) + '</div>';
      return;
    }
    runSearch(q.value);
  }

  function closeModal() {
    if (modalEl) modalEl.style.display = 'none';
    if (currentTextarea) currentTextarea.focus();
  }

  // ── Global keybinding ───────────────────────────────────────────

  function onGlobalKeydown(e) {
    if (!active) return;
    // Cmd+Shift+R (Mac) / Ctrl+Shift+R (Win/Lin) — Shift kvůli rezervaci
    // Cmd+R pro browser refresh. Změna v Sveltii ale jen v textarea/input.
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'r') {
      const target = document.activeElement;
      if (!(target instanceof HTMLTextAreaElement)) return;
      if (target.offsetHeight < 60) return;
      e.preventDefault();
      openModal(target);
    }
  }

  // ── Lifecycle ───────────────────────────────────────────────────

  function activate() {
    if (active) return;
    document.addEventListener('keydown', onGlobalKeydown);
    active = true;
    console.info('[csh-cite] Activated. ⌘⇧R v textarea otevře citation picker.');
  }

  function deactivate() {
    if (!active) return;
    document.removeEventListener('keydown', onGlobalKeydown);
    if (modalEl) modalEl.style.display = 'none';
    active = false;
    console.info('[csh-cite] Deactivated.');
  }

  function applySettings(s) {
    if (s.citationPicker !== false && !active) activate();
    else if (s.citationPicker === false && active) deactivate();
  }

  // Result selection styles
  const style = document.createElement('style');
  style.textContent = `
    .csh-cite-result.is-selected {
      background: #2a2a2a !important;
      border-color: #c9a85d !important;
    }
  `;
  document.head.appendChild(style);

  if (window.cshEditor) {
    applySettings(window.cshEditor.getSettings());
    window.cshEditor.onSettingsChanged(applySettings);
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      if (window.cshEditor) {
        applySettings(window.cshEditor.getSettings());
        window.cshEditor.onSettingsChanged(applySettings);
      }
    });
  }
})();
