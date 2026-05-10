/**
 * CSH editor helpers — settings panel + spell-checker + AI našeptávač
 * pro Sveltia CMS editor.
 *
 * Načítá se z admin/index.html jako nemodulový script. Žádné dependencies,
 * jen vanilla JS. Externí knihovny (nspell, cs dict) jsou lazy-loaded
 * dynamic import přes esm.sh / unpkg, **jen pokud uživatel zapne**
 * spell-checker / AI v settings panelu.
 *
 * Settings persistují v localStorage `csh-editor-settings`. Default:
 * vše vypnuto (uživatel musí explicitně zapnout — žádný surprise).
 *
 * Spell-checker: nspell s cs_CZ Hunspell dict (load z CDN při zapnutí)
 * + custom CSH slovník (csh-spell-dict.json — pre-built ze slovníku +
 * hodinari + soupis obcí).
 *
 * AI našeptávač: POST do /api/ai/suggest (Cloudflare Pages Function
 * s Workers AI binding) → streaming inline ghost-text overlay.
 */
(function () {
  'use strict';

  const SETTINGS_KEY = 'csh-editor-settings';
  const DEFAULT_SETTINGS = {
    spellcheck: false,
    ai: false,
    aiLevel: 'free', // 'free' = Workers AI Mistral, 'paid' = Anthropic Sonnet (později)
    linkPicker: true, // Cmd+K modal pro odkazy — default ON (low overhead, žádný stažený asset)
  };

  /** Read settings z localStorage, merge s defaults. */
  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return { ...DEFAULT_SETTINGS };
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  function saveSettings(s) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    } catch {
      // localStorage může být disabled (private mode), tichá chyba —
      // settings se prostě nepamatuje mezi sessions.
    }
  }

  // ── Settings panel UI ───────────────────────────────────────────

  /**
   * Floating settings button + popover modal. Vlevo dole, vedle „Zpět
   * na web". Klik otevře popover s checkboxy. Změna zapisuje hned do
   * localStorage a vyvolá `csh-settings-changed` event na window.
   */
  function buildSettingsPanel() {
    const settings = loadSettings();

    // Floating button
    const btn = document.createElement('button');
    btn.id = 'csh-settings-btn';
    btn.type = 'button';
    btn.title = 'Editor — pokročilé funkce';
    btn.setAttribute('aria-label', 'Otevřít nastavení editoru');
    btn.textContent = '⚙ Pomocníci';
    btn.style.cssText =
      'position:fixed;bottom:.6rem;left:.6rem;z-index:99998;' +
      'background:#1a1a1a;color:#e8d8a8;text-decoration:none;' +
      'padding:.45rem .85rem;border-radius:2rem;border:1px solid #c9a85d;' +
      'box-shadow:0 2px 8px rgba(0,0,0,.4);' +
      'font:500 13px/1.2 ui-serif,Georgia,serif;letter-spacing:.02em;' +
      'transition:all 150ms ease;cursor:pointer';
    btn.addEventListener('mouseenter', () => {
      btn.style.background = '#c9a85d';
      btn.style.color = '#1a1a1a';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = '#1a1a1a';
      btn.style.color = '#e8d8a8';
    });
    document.body.appendChild(btn);

    // Popover modal (skrytý)
    const modal = document.createElement('div');
    modal.id = 'csh-settings-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-label', 'Nastavení editoru');
    modal.style.cssText =
      'position:fixed;bottom:3.5rem;left:.6rem;z-index:99998;' +
      'background:#1a1a1a;color:#e8d8a8;padding:1rem 1.2rem;' +
      'border-radius:.5rem;border:1px solid #c9a85d;' +
      'box-shadow:0 4px 16px rgba(0,0,0,.5);' +
      'font:14px/1.4 ui-serif,Georgia,serif;' +
      'width:min(360px,calc(100vw - 1.2rem));' +
      'display:none';
    modal.innerHTML = `
      <h3 style="margin:0 0 .8rem;font-size:1rem;color:#c9a85d;font-weight:500">
        Pomocníci v editoru
      </h3>
      <p style="margin:0 0 .8rem;font-size:.85rem;opacity:.8">
        Volitelné funkce. Změny se uloží automaticky a aplikují ihned.
      </p>
      <label style="display:flex;align-items:flex-start;gap:.5rem;margin-bottom:.6rem;cursor:pointer">
        <input type="checkbox" id="csh-set-spellcheck" ${settings.spellcheck ? 'checked' : ''}
               style="margin-top:.2rem;cursor:pointer">
        <span>
          <strong>Český spell-checker (hodinářský)</strong>
          <span style="display:block;font-size:.8rem;opacity:.7;margin-top:.15rem">
            Slovník s českou morfologií + hodinařské termíny + jména hodinářů.
            Podtrhne nepravopisná slova. Jednorázové stažení ~5 MB při zapnutí.
          </span>
        </span>
      </label>
      <label style="display:flex;align-items:flex-start;gap:.5rem;margin-bottom:.6rem;cursor:pointer">
        <input type="checkbox" id="csh-set-ai" ${settings.ai ? 'checked' : ''}
               style="margin-top:.2rem;cursor:pointer">
        <span>
          <strong>AI našeptávač</strong>
          <span style="display:block;font-size:.8rem;opacity:.7;margin-top:.15rem">
            Inline návrhy pokračování textu (Tab přijme). Používá Cloudflare
            Workers AI s naším slovníkem v kontextu. Text odchází do AI při
            každém požadavku.
          </span>
        </span>
      </label>
      <label style="display:flex;align-items:flex-start;gap:.5rem;margin-bottom:.6rem;cursor:pointer">
        <input type="checkbox" id="csh-set-link-picker" ${settings.linkPicker ? 'checked' : ''}
               style="margin-top:.2rem;cursor:pointer">
        <span>
          <strong>Vkládání odkazů (⌘K / Ctrl+K)</strong>
          <span style="display:block;font-size:.8rem;opacity:.7;margin-top:.15rem">
            Modal pro snadné vkládání odkazů. Označ slovo nebo umísti kurzor,
            stiskni ⌘K (Mac) nebo Ctrl+K (Win/Lin) — najde Hodinárium stránky
            (medailony, slovník, soupis), Wikipedii, Wikidata, Památkový
            katalog NPÚ.
          </span>
        </span>
      </label>
      <div style="margin:1rem 0 .6rem;padding-top:.8rem;border-top:1px solid #444;font-size:.8rem;opacity:.7">
        <strong>Pozn.:</strong> obě funkce jsou nezávislé, lze zapnout libovolnou
        kombinaci. Spell-check funguje offline (data v prohlížeči), AI vyžaduje
        síť (data jdou na Cloudflare).
      </div>
      <div style="text-align:right;margin-top:.8rem">
        <button type="button" id="csh-set-close"
                style="background:none;border:1px solid #c9a85d;color:#e8d8a8;
                       padding:.35rem .8rem;border-radius:.25rem;cursor:pointer;
                       font:inherit">
          Hotovo
        </button>
      </div>
    `;
    document.body.appendChild(modal);

    // Toggle modal
    btn.addEventListener('click', () => {
      modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
    });
    modal.querySelector('#csh-set-close').addEventListener('click', () => {
      modal.style.display = 'none';
    });
    // Click outside to close
    document.addEventListener('click', (e) => {
      if (modal.style.display !== 'block') return;
      if (modal.contains(e.target) || btn.contains(e.target)) return;
      modal.style.display = 'none';
    });

    // Save on change + emit event
    function applyAndEmit() {
      const next = {
        spellcheck: modal.querySelector('#csh-set-spellcheck').checked,
        ai: modal.querySelector('#csh-set-ai').checked,
        aiLevel: 'free',
        linkPicker: modal.querySelector('#csh-set-link-picker').checked,
      };
      saveSettings(next);
      window.dispatchEvent(new CustomEvent('csh-settings-changed', { detail: next }));
    }
    modal.querySelector('#csh-set-spellcheck').addEventListener('change', applyAndEmit);
    modal.querySelector('#csh-set-ai').addEventListener('change', applyAndEmit);
    modal.querySelector('#csh-set-link-picker').addEventListener('change', applyAndEmit);
  }

  // ── Public API ──────────────────────────────────────────────────

  // Expose pro debug + future modulů (spell-checker, AI)
  window.cshEditor = {
    getSettings: loadSettings,
    onSettingsChanged(callback) {
      window.addEventListener('csh-settings-changed', (e) => callback(e.detail));
    },
  };

  // ── Init ────────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildSettingsPanel);
  } else {
    buildSettingsPanel();
  }
})();
