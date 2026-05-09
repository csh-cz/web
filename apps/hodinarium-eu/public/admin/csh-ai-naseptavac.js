/**
 * CSH AI našeptávač pro Sveltia editor.
 *
 * Inline ghost-text overlay s návrhem pokračování textu. Backend:
 * /api/ai/suggest (Cloudflare Pages Function s Workers AI Mistral
 * Small 3.1 24B, viz functions/api/ai/suggest.ts).
 *
 * UX:
 *   - Editor přestane psát na 1.2 s → request na backend
 *   - Suggestion se zobrazí jako ghost-text za kurzorem (CSS opacity)
 *   - Tab přijme (suggestion se vloží do textu)
 *   - Esc / další klávesa odmítne (suggestion zmizí)
 *   - Indikátor (footer pravý dolní roh) ukazuje stav: idle / loading /
 *     error / suggesting
 *
 * Toggle přes window.cshEditor settings (UI v Pomocníci panelu).
 * Default OFF.
 */
(function () {
  'use strict';

  let active = false;
  let observer = null;
  const attached = new WeakSet();
  const pendingByEl = new WeakMap(); // textarea → { ctrl: AbortController, timer }
  const ghostByEl = new WeakMap();   // textarea → { ghost: HTMLElement, suggestion: string, anchor: number }

  // ── Indikátor ───────────────────────────────────────────────────

  let statusEl = null;
  function updateStatus(state, msg) {
    if (!statusEl) {
      statusEl = document.createElement('div');
      statusEl.id = 'csh-ai-status';
      statusEl.style.cssText =
        'position:fixed;bottom:.6rem;right:.6rem;z-index:99997;' +
        'background:#1a1a1a;color:#e8d8a8;padding:.3rem .7rem;' +
        'border-radius:1rem;border:1px solid #c9a85d;' +
        'font:11px/1.3 ui-serif,Georgia,serif;' +
        'opacity:.85;display:none';
      document.body.appendChild(statusEl);
    }
    if (state === 'idle') {
      statusEl.style.display = 'none';
      return;
    }
    statusEl.style.display = 'block';
    if (state === 'loading') {
      statusEl.textContent = '⋯ AI přemýšlí';
      statusEl.style.color = '#e8d8a8';
    } else if (state === 'error') {
      statusEl.textContent = '⚠ ' + (msg || 'AI nedostupná');
      statusEl.style.color = '#d97070';
      setTimeout(() => updateStatus('idle'), 4000);
    } else if (state === 'suggesting') {
      statusEl.textContent = '✎ AI navrhuje (Tab přijme, Esc odmítne)';
      statusEl.style.color = '#9bd97a';
    }
  }

  // ── Ghost-text overlay ──────────────────────────────────────────

  /** Vytvoří overlay s ghost-textem pozicovaným za kurzorem v textarea.
   *  Stejně jako spell-checker overlay, kopíruje styl textarea aby
   *  text vykresloval na stejných pozicích. */
  function showGhost(textarea, suggestion) {
    hideGhost(textarea);
    const cursorPos = textarea.selectionStart;
    const beforeText = textarea.value.slice(0, cursorPos);

    const wrapper = textarea.parentElement;
    if (window.getComputedStyle(wrapper).position === 'static') {
      wrapper.style.position = 'relative';
    }

    const ghost = document.createElement('div');
    ghost.className = 'csh-ai-ghost';
    ghost.setAttribute('aria-hidden', 'true');
    const cs = window.getComputedStyle(textarea);
    ghost.style.cssText =
      'position:absolute;pointer-events:none;color:transparent;' +
      'white-space:pre-wrap;word-wrap:break-word;overflow:hidden;' +
      'z-index:2';
    ghost.style.font = cs.font;
    ghost.style.padding = cs.padding;
    ghost.style.lineHeight = cs.lineHeight;
    ghost.style.letterSpacing = cs.letterSpacing;

    const r = textarea.getBoundingClientRect();
    const pr = wrapper.getBoundingClientRect();
    ghost.style.top = (r.top - pr.top) + 'px';
    ghost.style.left = (r.left - pr.left) + 'px';
    ghost.style.width = r.width + 'px';
    ghost.style.height = r.height + 'px';

    ghost.innerHTML =
      escapeHtml(beforeText) +
      '<span class="csh-ai-suggestion">' + escapeHtml(suggestion) + '</span>';

    wrapper.appendChild(ghost);
    ghostByEl.set(textarea, { ghost, suggestion, anchor: cursorPos });
    updateStatus('suggesting');
  }

  function hideGhost(textarea) {
    const data = ghostByEl.get(textarea);
    if (data) {
      data.ghost.remove();
      ghostByEl.delete(textarea);
    }
    updateStatus('idle');
  }

  function acceptGhost(textarea) {
    const data = ghostByEl.get(textarea);
    if (!data) return false;
    const { suggestion, anchor } = data;
    const before = textarea.value.slice(0, anchor);
    const after = textarea.value.slice(anchor);
    textarea.value = before + suggestion + after;
    textarea.selectionStart = textarea.selectionEnd = anchor + suggestion.length;
    // Trigger input event, aby Sveltia/CMS byly aware o změně
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    hideGhost(textarea);
    return true;
  }

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ── Backend volání ──────────────────────────────────────────────

  async function fetchSuggestion(text, signal) {
    const r = await fetch('/api/ai/suggest', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text, limit: 80 }),
      credentials: 'include', // CF Access cookie
      signal,
    });
    if (!r.ok) {
      const data = await r.json().catch(() => ({}));
      throw new Error(data.error || `HTTP ${r.status}`);
    }
    const data = await r.json();
    return data.suggestion;
  }

  // ── Hook na textarea ────────────────────────────────────────────

  function attachToTextarea(textarea) {
    if (attached.has(textarea)) return;
    attached.add(textarea);

    const onInput = () => {
      // Cancel pending request + hide existing ghost
      const pending = pendingByEl.get(textarea);
      if (pending) {
        clearTimeout(pending.timer);
        pending.ctrl?.abort();
      }
      hideGhost(textarea);

      const cursorPos = textarea.selectionStart;
      const beforeCursor = textarea.value.slice(0, cursorPos);
      // Nestartuj suggestion pokud kontext je krátký
      if (beforeCursor.trim().length < 30) return;
      // Trigger jen když věta nekončí (nepřerušíme dokončenou myšlenku)
      const lastChar = beforeCursor.slice(-1);
      if (/[.!?\n]/.test(lastChar)) return;

      const ctrl = new AbortController();
      const timer = setTimeout(async () => {
        updateStatus('loading');
        try {
          // Pošleme posledních ~500 znaků kontextu (víc by bylo plýtvání tokens)
          const context = beforeCursor.slice(-500);
          const suggestion = await fetchSuggestion(context, ctrl.signal);
          if (ctrl.signal.aborted) return;
          // Editor mohl mezitím pokračovat — ověř že pozice kurzoru je
          // pořád na konci kontextu
          if (textarea.selectionStart !== cursorPos) return;
          showGhost(textarea, suggestion);
        } catch (err) {
          if (err.name === 'AbortError') return;
          updateStatus('error', err.message);
        }
      }, 1200); // debounce 1.2 s — editor odešel z aktivního psaní
      pendingByEl.set(textarea, { ctrl, timer });
    };

    const onKeydown = (e) => {
      if (e.key === 'Tab' && ghostByEl.has(textarea)) {
        e.preventDefault();
        acceptGhost(textarea);
        return;
      }
      if (e.key === 'Escape' && ghostByEl.has(textarea)) {
        e.preventDefault();
        hideGhost(textarea);
        return;
      }
    };

    textarea.addEventListener('input', onInput);
    textarea.addEventListener('keydown', onKeydown);
    textarea.addEventListener('blur', () => hideGhost(textarea));
  }

  function scanAndAttach() {
    document.querySelectorAll('textarea').forEach((ta) => {
      if (ta.offsetHeight < 60) return;
      attachToTextarea(ta);
    });
  }

  function injectStyles() {
    if (document.getElementById('csh-ai-styles')) return;
    const style = document.createElement('style');
    style.id = 'csh-ai-styles';
    style.textContent = `
      .csh-ai-ghost { color: transparent; }
      .csh-ai-ghost .csh-ai-suggestion {
        color: rgba(155, 217, 122, 0.55);
        font-style: italic;
      }
    `;
    document.head.appendChild(style);
  }

  // ── Lifecycle ───────────────────────────────────────────────────

  function activate() {
    if (active) return;
    injectStyles();
    scanAndAttach();
    observer = new MutationObserver(scanAndAttach);
    observer.observe(document.body, { childList: true, subtree: true });
    active = true;
    console.info('[csh-ai] Activated.');
  }

  function deactivate() {
    if (!active) return;
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    document.querySelectorAll('textarea').forEach((ta) => hideGhost(ta));
    if (statusEl) statusEl.style.display = 'none';
    active = false;
    console.info('[csh-ai] Deactivated.');
  }

  // ── Wiring na settings ──────────────────────────────────────────

  function applySettings(s) {
    if (s.ai && !active) activate();
    else if (!s.ai && active) deactivate();
  }

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
