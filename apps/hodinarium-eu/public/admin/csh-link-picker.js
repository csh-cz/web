/**
 * CSH universal link picker (Cmd+K / Ctrl+K) pro Sveltia editor.
 *
 * Sjednocený modal pro vkládání odkazů z 5 zdrojů:
 *   1. Hodinárium internal (přes /api/search/semantic + bge-m3)
 *   2. Wikipedia cs (cs.wikipedia.org/w/api.php?action=opensearch)
 *   3. Wikidata (wbsearchentities API)
 *   4. NPÚ Památkový katalog (geoportal.npu.cz ArcGIS REST)
 *   5. Vlastní URL (manuální vstup)
 *
 * Workflow:
 *   - Editor v textarea: označí slovo (volitelné) → Cmd+K → modal
 *   - Search input pre-filled selection (nebo prázdný)
 *   - 4 sekce výsledků se postupně doplňují (paralelní requests)
 *   - Klik vloží markdown link nahrazením selection (nebo na pozici kurzoru)
 *
 * Toggle přes ⚙ Pomocníci panel (default ON — bez stahování assets).
 */
(function () {
  'use strict';

  let active = false;
  let modalEl = null;
  let currentTextarea = null;
  let currentSelStart = 0;
  let currentSelEnd = 0;
  let abortCtrl = null;

  // ── Search backends ─────────────────────────────────────────────

  /** Hodinárium internal — bge-m3 semantic search nad cross-collection
   *  corpus (1100+ stránek). Existing endpoint /api/search/semantic. */
  async function searchInternal(q, signal) {
    const r = await fetch(`/api/search/semantic?q=${encodeURIComponent(q)}&limit=8`, {
      credentials: 'include',
      signal,
    });
    if (!r.ok) return [];
    const data = await r.json();
    return (data.results || []).map((r) => ({
      title: r.title || r.t,
      url: r.url || r.u,
      summary: (r.summary || r.s || '').slice(0, 100),
      kind: r.collection || r.c || 'page',
      source: 'internal',
    }));
  }

  /** Wikipedia cs (opensearch). Vrací [query, [titles], [descriptions], [urls]]. */
  async function searchWikipedia(q, signal, lang = 'cs') {
    const url =
      `https://${lang}.wikipedia.org/w/api.php` +
      `?action=opensearch&format=json&origin=*` +
      `&search=${encodeURIComponent(q)}&limit=5`;
    try {
      const r = await fetch(url, { signal });
      if (!r.ok) return [];
      const data = await r.json();
      const [, titles, descriptions, urls] = data;
      return titles.map((t, i) => ({
        title: t,
        url: urls[i],
        summary: descriptions[i] || '',
        kind: 'wikipedia',
        source: `wikipedia-${lang}`,
      }));
    } catch (e) {
      if (e.name !== 'AbortError') console.warn('[csh-link] Wikipedia search error:', e);
      return [];
    }
  }

  /** Wikidata wbsearchentities. */
  async function searchWikidata(q, signal) {
    const url =
      `https://www.wikidata.org/w/api.php` +
      `?action=wbsearchentities&format=json&origin=*` +
      `&language=cs&uselang=cs&type=item` +
      `&search=${encodeURIComponent(q)}&limit=5`;
    try {
      const r = await fetch(url, { signal });
      if (!r.ok) return [];
      const data = await r.json();
      return (data.search || []).map((it) => ({
        title: it.label || it.id,
        url: it.concepturi || `https://www.wikidata.org/wiki/${it.id}`,
        summary: it.description || '',
        kind: 'wikidata',
        source: 'wikidata',
      }));
    } catch (e) {
      if (e.name !== 'AbortError') console.warn('[csh-link] Wikidata search error:', e);
      return [];
    }
  }

  /** NPÚ Památkový katalog — search přes ArcGIS REST nazev field. */
  async function searchNPU(q, signal) {
    if (q.length < 4) return []; // Krátké queries vrací moc šumu
    const where = `nazev LIKE '%${q.replace(/'/g, "''")}%'`;
    const url =
      `https://geoportal.npu.cz/arcgis/rest/services/Tematicke/CP_PaKaSextc/MapServer/12/query` +
      `?where=${encodeURIComponent(where)}` +
      `&outFields=KatCislo,nazev,urlExt&outSR=4326&f=json&resultRecordCount=5`;
    try {
      const r = await fetch(url, { signal });
      if (!r.ok) return [];
      const data = await r.json();
      return (data.features || []).map((f) => {
        const a = f.attributes || {};
        return {
          title: a.nazev || a.KatCislo,
          url: a.urlExt || `https://www.pamatkovykatalog.cz/?id=${a.KatCislo}`,
          summary: a.KatCislo ? `KatCislo ${a.KatCislo}` : '',
          kind: 'npu',
          source: 'npu',
        };
      });
    } catch (e) {
      if (e.name !== 'AbortError') console.warn('[csh-link] NPÚ search error:', e);
      return [];
    }
  }

  // ── Modal UI ────────────────────────────────────────────────────

  function buildModal() {
    if (modalEl) return modalEl;
    const m = document.createElement('div');
    m.id = 'csh-link-modal';
    m.setAttribute('role', 'dialog');
    m.setAttribute('aria-label', 'Vložit odkaz');
    m.style.cssText =
      'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);' +
      'z-index:99999;background:#1a1a1a;color:#e8d8a8;padding:1rem 1.2rem;' +
      'border-radius:.5rem;border:1px solid #c9a85d;' +
      'box-shadow:0 8px 32px rgba(0,0,0,.7);' +
      'font:14px/1.4 ui-serif,Georgia,serif;' +
      'width:min(640px,calc(100vw - 2rem));max-height:80vh;' +
      'overflow:hidden;display:none;flex-direction:column';
    m.innerHTML = `
      <h3 style="margin:0 0 .6rem;font-size:1rem;color:#c9a85d;font-weight:500">
        <i class="fa-solid fa-link" aria-hidden="true"></i> Vložit odkaz
      </h3>
      <input type="search" id="csh-link-q" placeholder="Hledej…"
             style="width:100%;padding:.55rem .8rem;background:#0f0f0f;color:#e8d8a8;
                    border:1px solid #444;border-radius:.3rem;
                    font:inherit;outline:none;margin-bottom:.6rem"
             autocomplete="off" autofocus>
      <div id="csh-link-results" style="overflow-y:auto;flex:1;padding:.2rem 0">
        <div style="padding:.5rem .8rem;opacity:.6;font-size:.85rem">
          Začni psát pro hledání…
        </div>
      </div>
      <div style="margin-top:.6rem;padding-top:.6rem;border-top:1px solid #444">
        <label style="display:block;font-size:.78rem;opacity:.7;margin-bottom:.2rem">
          <i class="fa-solid fa-link" aria-hidden="true"></i> Nebo vlastní URL:
        </label>
        <div style="display:flex;gap:.4rem">
          <input type="url" id="csh-link-custom" placeholder="https://…"
                 style="flex:1;padding:.4rem .7rem;background:#0f0f0f;color:#e8d8a8;
                        border:1px solid #444;border-radius:.3rem;font:inherit;outline:none">
          <button type="button" id="csh-link-custom-go"
                  style="background:#c9a85d;color:#1a1a1a;border:none;
                         padding:.4rem .9rem;border-radius:.3rem;cursor:pointer;
                         font:inherit;font-weight:500">
            Vložit
          </button>
        </div>
      </div>
      <div style="margin-top:.6rem;font-size:.75rem;opacity:.55;text-align:right">
        ⌘K otevře • Esc zavře • ↑/↓ navigace • Enter vloží
      </div>
    `;
    document.body.appendChild(m);
    modalEl = m;

    const q = m.querySelector('#csh-link-q');
    const customInput = m.querySelector('#csh-link-custom');
    const customGo = m.querySelector('#csh-link-custom-go');

    let timer = null;
    q.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => runSearch(q.value), 250);
    });
    q.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        navigateResults(e.key === 'ArrowDown' ? 1 : -1);
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const sel = m.querySelector('.csh-link-result.is-selected');
        if (sel) sel.click();
        else if (q.value) {
          // Žádný výsledek vybrán → pokud je v inputu URL, vložit přímo
          if (/^https?:\/\//.test(q.value)) {
            insertLink(q.value, q.value);
          }
        }
      }
    });

    customGo.addEventListener('click', () => {
      const url = customInput.value.trim();
      if (!url) return;
      const text = window.getSelection?.()?.toString() || extractDomain(url);
      insertLink(url, text || url);
    });

    // Click outside to close
    document.addEventListener('mousedown', (e) => {
      if (m.style.display !== 'flex') return;
      if (m.contains(e.target)) return;
      closeModal();
    });

    return m;
  }

  function extractDomain(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch { return url; }
  }

  function navigateResults(dir) {
    const results = modalEl.querySelectorAll('.csh-link-result');
    if (results.length === 0) return;
    const current = modalEl.querySelector('.csh-link-result.is-selected');
    let idx = current ? Array.from(results).indexOf(current) : -1;
    idx += dir;
    if (idx < 0) idx = results.length - 1;
    if (idx >= results.length) idx = 0;
    results.forEach((r) => r.classList.remove('is-selected'));
    results[idx].classList.add('is-selected');
    results[idx].scrollIntoView({ block: 'nearest' });
  }

  // ── Search orchestration ────────────────────────────────────────

  /**
   * @param {HTMLElement} parent
   * @param {string} title
   * @param {Array} results
   * @param {string} icon — Font Awesome class string (per memory
   *   feedback_ikony_font_awesome). Buď „fa-solid fa-XXX" nebo
   *   „fa-brands fa-XXX". Emoji glyphy zakázány.
   */
  function renderSection(parent, title, results, icon) {
    if (results.length === 0) return;
    const sec = document.createElement('div');
    sec.style.cssText = 'margin-bottom:.6rem';
    const head = document.createElement('div');
    head.style.cssText =
      'font-size:.75rem;text-transform:uppercase;letter-spacing:.06em;' +
      'color:#c9a85d;margin:.4rem .4rem .25rem;opacity:.85';
    // innerHTML místo textContent kvůli <i> tagu — title je hardcoded
    // konstanta z volajícího (renderSection callsite), žádný XSS risk.
    head.innerHTML = `<i class="${icon}" aria-hidden="true"></i> ${title}`;
    sec.appendChild(head);
    for (const r of results) {
      const item = document.createElement('div');
      item.className = 'csh-link-result';
      item.style.cssText =
        'padding:.45rem .8rem;border-radius:.25rem;cursor:pointer;' +
        'border:1px solid transparent;transition:background 100ms';
      item.innerHTML = `
        <div style="font-weight:500;color:#e8d8a8">${escapeHtml(r.title)}</div>
        ${r.summary ? `<div style="font-size:.8rem;opacity:.7;margin-top:.1rem">${escapeHtml(r.summary)}</div>` : ''}
        <div style="font-size:.7rem;opacity:.5;margin-top:.15rem;font-family:monospace">${escapeHtml(r.url)}</div>
      `;
      item.addEventListener('mouseenter', () => {
        modalEl.querySelectorAll('.csh-link-result.is-selected').forEach((el) => el.classList.remove('is-selected'));
        item.classList.add('is-selected');
      });
      item.addEventListener('click', () => {
        const text = currentSelEnd > currentSelStart
          ? currentTextarea.value.slice(currentSelStart, currentSelEnd)
          : r.title;
        insertLink(r.url, text);
      });
      sec.appendChild(item);
    }
    parent.appendChild(sec);
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  async function runSearch(q) {
    const resultsEl = modalEl.querySelector('#csh-link-results');
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      resultsEl.innerHTML =
        '<div style="padding:.5rem .8rem;opacity:.6;font-size:.85rem">' +
        'Začni psát pro hledání…</div>';
      return;
    }

    // Cancel previous
    if (abortCtrl) abortCtrl.abort();
    abortCtrl = new AbortController();
    const signal = abortCtrl.signal;

    resultsEl.innerHTML =
      '<div style="padding:.5rem .8rem;opacity:.6;font-size:.85rem">⋯ Hledám…</div>';

    // Spustí 4 paralelní searches a doplňuje sekce jak responses přicházejí
    const accumulated = { internal: [], wiki_cs: [], wikidata: [], npu: [] };
    let firstRender = true;

    function rerender() {
      const container = document.createElement('div');
      renderSection(container, 'Hodinárium', accumulated.internal, 'fa-solid fa-location-dot');
      renderSection(container, 'Wikipedia (cs)', accumulated.wiki_cs, 'fa-brands fa-wikipedia-w');
      renderSection(container, 'Wikidata', accumulated.wikidata, 'fa-solid fa-landmark');
      renderSection(container, 'Památkový katalog NPÚ', accumulated.npu, 'fa-solid fa-landmark');
      if (container.children.length === 0 && !firstRender) {
        container.innerHTML =
          '<div style="padding:.5rem .8rem;opacity:.6;font-size:.85rem">' +
          'Žádné výsledky. Zkus jiný dotaz nebo vlož vlastní URL.</div>';
      }
      resultsEl.innerHTML = '';
      resultsEl.appendChild(container);
      firstRender = false;
      // Auto-select first result
      const first = resultsEl.querySelector('.csh-link-result');
      if (first) first.classList.add('is-selected');
    }

    Promise.allSettled([
      searchInternal(trimmed, signal).then((r) => { accumulated.internal = r; rerender(); }),
      searchWikipedia(trimmed, signal, 'cs').then((r) => { accumulated.wiki_cs = r; rerender(); }),
      searchWikidata(trimmed, signal).then((r) => { accumulated.wikidata = r; rerender(); }),
      searchNPU(trimmed, signal).then((r) => { accumulated.npu = r; rerender(); }),
    ]);
  }

  // ── Open / close ────────────────────────────────────────────────

  function openModal(textarea) {
    currentTextarea = textarea;
    currentSelStart = textarea.selectionStart;
    currentSelEnd = textarea.selectionEnd;
    const selectionText = textarea.value.slice(currentSelStart, currentSelEnd);

    const m = buildModal();
    m.style.display = 'flex';
    const q = m.querySelector('#csh-link-q');
    q.value = selectionText.trim();
    q.focus();
    q.select();
    if (q.value) {
      runSearch(q.value);
    }
  }

  function closeModal() {
    if (abortCtrl) abortCtrl.abort();
    if (modalEl) modalEl.style.display = 'none';
    if (currentTextarea) currentTextarea.focus();
  }

  function insertLink(url, text) {
    if (!currentTextarea) return;
    const ta = currentTextarea;
    const md = `[${text || extractDomain(url)}](${url})`;
    const before = ta.value.slice(0, currentSelStart);
    const after = ta.value.slice(currentSelEnd);
    ta.value = before + md + after;
    const newPos = currentSelStart + md.length;
    ta.selectionStart = ta.selectionEnd = newPos;
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    closeModal();
  }

  // ── Global keybinding ───────────────────────────────────────────

  function onGlobalKeydown(e) {
    if (!active) return;
    // Cmd+K (Mac) nebo Ctrl+K (Win/Lin)
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      const target = document.activeElement;
      if (!(target instanceof HTMLTextAreaElement) && !(target instanceof HTMLInputElement)) return;
      if (target.offsetHeight < 60 && target.tagName === 'INPUT') return; // skip small inputs
      e.preventDefault();
      openModal(target);
    }
  }

  // ── Lifecycle ───────────────────────────────────────────────────

  function activate() {
    if (active) return;
    document.addEventListener('keydown', onGlobalKeydown);
    active = true;
    console.info('[csh-link] Activated. ⌘K v textarea otevře link picker.');
  }

  function deactivate() {
    if (!active) return;
    document.removeEventListener('keydown', onGlobalKeydown);
    if (modalEl) modalEl.style.display = 'none';
    active = false;
    console.info('[csh-link] Deactivated.');
  }

  function applySettings(s) {
    if (s.linkPicker && !active) activate();
    else if (!s.linkPicker && active) deactivate();
  }

  // ── Inject result selection styles ──────────────────────────────

  const style = document.createElement('style');
  style.textContent = `
    .csh-link-result.is-selected {
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
