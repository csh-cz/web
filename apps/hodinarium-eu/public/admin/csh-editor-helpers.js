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
    /** Spell-check mode:
     *  - 'off': vypnuto (textarea.spellcheck=false, žádný overlay)
     *  - 'native': pouze browser native cs spell-check (textarea.spellcheck=true,
     *    žádný náš overlay) — výchozí, žádný extra download
     *  - 'csh': CSH hodinářský s slovníkem 1242 termínů (textarea.spellcheck=false,
     *    náš overlay aktivní) — vyžaduje 6 MB stažení 1×
     */
    spellcheckMode: 'native',
    /** Backwards-compat field — pokud user měl předchozí spellcheck:bool,
     *  promigruje se v loadSettings(). */
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
      const merged = { ...DEFAULT_SETTINGS, ...parsed };
      // Backwards-compat: pokud user měl `spellcheck: true` z předchozí
      // verze (před zavedením spellcheckMode), promigruj na 'csh'.
      // Pokud `spellcheckMode` je už explicit set v parsed, respektuj ho.
      if (parsed.spellcheckMode === undefined && parsed.spellcheck === true) {
        merged.spellcheckMode = 'csh';
      }
      return merged;
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

    // Status badge vedle ⚙ tlačítka — krátký indikátor co je aktivní.
    // Klik otevře panel (stejně jako ⚙ tlačítko).
    const status = document.createElement('button');
    status.id = 'csh-status-badge';
    status.type = 'button';
    status.setAttribute('aria-label', 'Stav pomocníků v editoru');
    status.style.cssText =
      'position:fixed;bottom:.6rem;left:9.6rem;z-index:99998;' +
      'background:transparent;color:#888;border:none;cursor:pointer;' +
      'font:500 12px/1.4 ui-serif,Georgia,serif;letter-spacing:.02em;' +
      'padding:.45rem 0;display:flex;align-items:center;gap:.5rem';
    document.body.appendChild(status);
    status.addEventListener('click', () => {
      modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
    });

    /** Re-render status badge based on current settings. Pomocníci buď
     *  ON (jasné), OFF (dim), nebo loading (pro spell-check 1× po
     *  zapnutí). */
    function renderStatus(s) {
      const parts = [];
      // Spell-check
      const mode = s.spellcheckMode || (s.spellcheck ? 'csh' : 'native');
      if (mode === 'csh') {
        parts.push('<span style="color:#c9a85d">📖 CSH</span>');
      } else if (mode === 'native') {
        parts.push('<span style="color:#888">📖 native</span>');
      } else {
        parts.push('<span style="color:#666;text-decoration:line-through">📖</span>');
      }
      // AI
      parts.push(s.ai
        ? '<span style="color:#9bd97a">🤖 AI</span>'
        : '<span style="color:#666;text-decoration:line-through">🤖</span>');
      // Link picker
      parts.push(s.linkPicker
        ? '<span style="color:#5b9dd9">🔗 ⌘K</span>'
        : '<span style="color:#666;text-decoration:line-through">🔗</span>');
      status.innerHTML = parts.join('<span style="opacity:.4">·</span>');
    }
    renderStatus(settings);
    window.addEventListener('csh-settings-changed', (e) => renderStatus(e.detail));

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
      <fieldset style="border:1px solid #444;border-radius:.3rem;padding:.5rem .8rem .3rem;margin-bottom:.6rem">
        <legend style="padding:0 .3rem;font-size:.78rem;text-transform:uppercase;letter-spacing:.08em;color:#c9a85d">Spell-check</legend>
        <label style="display:flex;align-items:flex-start;gap:.5rem;margin-bottom:.4rem;cursor:pointer">
          <input type="radio" name="csh-spellcheck-mode" value="native" id="csh-set-mode-native"
                 ${settings.spellcheckMode === 'native' ? 'checked' : ''}
                 style="margin-top:.2rem;cursor:pointer">
          <span>
            <strong>Browser nativní (cs)</strong>
            <span style="display:block;font-size:.78rem;opacity:.7;margin-top:.1rem">
              Výchozí spell-check prohlížeče. Zná běžnou češtinu, ale ne
              jména hodinářů ani odbornou terminologii. Žádný download.
            </span>
          </span>
        </label>
        <label style="display:flex;align-items:flex-start;gap:.5rem;margin-bottom:.4rem;cursor:pointer">
          <input type="radio" name="csh-spellcheck-mode" value="csh" id="csh-set-mode-csh"
                 ${settings.spellcheckMode === 'csh' ? 'checked' : ''}
                 style="margin-top:.2rem;cursor:pointer">
          <span>
            <strong>CSH hodinářský</strong>
            <span style="display:block;font-size:.78rem;opacity:.7;margin-top:.1rem">
              Cs Hunspell s morfologií + 1242 hodinářských termínů a jmen
              (Krečmer, setrvačka, Holešovice…). Vypne browser native (jen
              jeden naráz). Jednorázové stažení ~6 MB.
            </span>
          </span>
        </label>
        <label style="display:flex;align-items:flex-start;gap:.5rem;margin-bottom:.2rem;cursor:pointer">
          <input type="radio" name="csh-spellcheck-mode" value="off" id="csh-set-mode-off"
                 ${settings.spellcheckMode === 'off' ? 'checked' : ''}
                 style="margin-top:.2rem;cursor:pointer">
          <span>
            <strong>Vypnuto</strong>
            <span style="display:block;font-size:.78rem;opacity:.7;margin-top:.1rem">
              Žádný spell-check (užitečné pro psaní cizojazyčných pasáží).
            </span>
          </span>
        </label>
      </fieldset>
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
        <strong>Pozn.:</strong> všechny funkce jsou nezávislé, lze zapnout libovolnou
        kombinaci. Spell-check + Vkládání odkazů funguje offline (data v prohlížeči),
        AI vyžaduje síť (data jdou na Cloudflare).
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:.8rem">
        <button type="button" id="csh-set-help"
                style="background:none;border:1px solid #888;color:#e8d8a8;
                       padding:.35rem .8rem;border-radius:.25rem;cursor:pointer;
                       font:inherit;font-size:.85rem">
          ? Nápověda a zkratky
        </button>
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
    // Click outside to close — status badge je taky trigger, neuzavírat
    // při kliku na něj (jinak se okamžitě zavře po otevření)
    document.addEventListener('click', (e) => {
      if (modal.style.display !== 'block') return;
      if (modal.contains(e.target) || btn.contains(e.target) || status.contains(e.target)) return;
      modal.style.display = 'none';
    });

    // Save on change + emit event
    function applyAndEmit() {
      const modeRadio = modal.querySelector('input[name="csh-spellcheck-mode"]:checked');
      const mode = modeRadio ? modeRadio.value : 'native';
      const next = {
        spellcheckMode: mode,
        spellcheck: mode === 'csh', // backwards-compat field
        ai: modal.querySelector('#csh-set-ai').checked,
        aiLevel: 'free',
        linkPicker: modal.querySelector('#csh-set-link-picker').checked,
      };
      saveSettings(next);
      window.dispatchEvent(new CustomEvent('csh-settings-changed', { detail: next }));
    }
    modal.querySelectorAll('input[name="csh-spellcheck-mode"]').forEach((r) => {
      r.addEventListener('change', applyAndEmit);
    });
    modal.querySelector('#csh-set-ai').addEventListener('change', applyAndEmit);
    modal.querySelector('#csh-set-link-picker').addEventListener('change', applyAndEmit);

    // Help modal
    modal.querySelector('#csh-set-help').addEventListener('click', () => {
      modal.style.display = 'none';
      buildHelpModal().style.display = 'flex';
    });
  }

  // ── Help modal ──────────────────────────────────────────────────

  let helpEl = null;
  function buildHelpModal() {
    if (helpEl) return helpEl;
    const m = document.createElement('div');
    m.id = 'csh-help-modal';
    m.setAttribute('role', 'dialog');
    m.setAttribute('aria-label', 'Nápověda — pomocníci v editoru');
    m.style.cssText =
      'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);' +
      'z-index:99999;background:#1a1a1a;color:#e8d8a8;padding:1.2rem 1.5rem;' +
      'border-radius:.5rem;border:1px solid #c9a85d;' +
      'box-shadow:0 8px 32px rgba(0,0,0,.7);' +
      'font:14px/1.5 ui-serif,Georgia,serif;' +
      'width:min(640px,calc(100vw - 2rem));max-height:85vh;' +
      'display:none;flex-direction:column;overflow:hidden';
    m.innerHTML = `
      <h2 style="margin:0 0 .8rem;font-size:1.2rem;color:#c9a85d;font-weight:500">
        Nápověda — pomocníci v editoru
      </h2>
      <p style="margin:0 0 .6rem;font-size:.85rem;opacity:.85">
        Krátký přehled. Pro plnou příručku se vším detailem otevři
        <a href="/admin/handbook/" style="color:#c9a85d;font-weight:500">📘 Příručku pro editory</a>.
      </p>
      <div style="overflow-y:auto;flex:1;padding-right:.4rem">

      <h3 style="color:#c9a85d;font-size:1rem;margin:.8rem 0 .3rem">📋 Úkolovník (editorial workflow)</h3>
      <p style="margin:.2rem 0 .5rem">
        Stránka <a href="/admin/tasks/" style="color:#c9a85d">/admin/tasks/</a>
        ukazuje rozpracované články — kdo na čem pracuje, co čeká recenzi,
        co je k zabrání. Default je vše „ready" (= žádný workflow field).
      </p>
      <p style="margin:.2rem 0 .5rem"><strong>Stavy článku:</strong></p>
      <table style="margin:.4rem 0 .8rem;border-collapse:collapse;width:100%;font-size:.85rem">
        <tr><td style="padding:.15rem .5rem;width:7rem">
          <span style="color:#888">todo</span></td>
          <td>k zabrání — někdo by ho měl začít upravovat</td></tr>
        <tr><td style="padding:.15rem .5rem">
          <span style="color:#d9a05b">in-progress</span></td>
          <td>rozpracováno (zabráno editorem) — sám nedělej, domluvte se</td></tr>
        <tr><td style="padding:.15rem .5rem">
          <span style="color:#5b9dd9">review</span></td>
          <td>k recenzi — někdo má přečíst a schválit</td></tr>
        <tr><td style="padding:.15rem .5rem">
          <span style="color:#4caf50">ready</span></td>
          <td>hotovo, publikováno (zmizí z úkolovníku)</td></tr>
      </table>
      <p style="margin:.2rem 0 .5rem;font-size:.85rem;opacity:.7">
        Stav a další pole (lockedBy, reviewers, …) editor zatím nastavuje
        ručně v Sveltia formuláři pod sekcí <strong>Workflow status</strong>.
        V2 přidá tlačítka „Zabrat / Pošli k review / Schvaluji" v úkolovníku.
      </p>
      <p style="margin:.2rem 0 .8rem;font-size:.85rem;opacity:.7">
        <strong>Veřejnost vidí?</strong> Když status != ready a editor v
        článku nastaví <code>publicDuringEdit: true</code>, návštěvník
        vidí článek s WIP banner. Default <code>publicDuringEdit: false</code>
        — neready článek je 404 pro veřejnost (jen editoři).
      </p>

      <h3 style="color:#c9a85d;font-size:1rem;margin:.8rem 0 .3rem">📖 Spell-check — 3 režimy</h3>
      <table style="margin:.4rem 0 .8rem;border-collapse:collapse;width:100%;font-size:.85rem">
        <tr style="border-bottom:1px solid #333">
          <td style="padding:.3rem .5rem;width:8.5rem;vertical-align:top"><strong>Browser nativní (cs)</strong><br>
            <span style="font-size:.7rem;opacity:.6">výchozí</span></td>
          <td style="padding:.3rem .5rem">Spell-check, který umí prohlížeč. Zná běžnou
            češtinu (potřebuje cs jazyk v OS / browser settings). Nezná hodinářské termíny
            ani jména. Žádný extra stažený asset, žádné CPU.</td></tr>
        <tr style="border-bottom:1px solid #333">
          <td style="padding:.3rem .5rem;vertical-align:top"><strong>CSH hodinářský</strong></td>
          <td style="padding:.3rem .5rem">Cs Hunspell s morfologií (kyvadlu / kyvadlem)
            + <strong>1242 hodinářských termínů a jmen</strong> (Krečmer, setrvačka,
            čtvrťové bití, Holešovice). Vypne browser native — overlay je překrýval. Stažení
            ~6 MB jednorázově.</td></tr>
        <tr>
          <td style="padding:.3rem .5rem;vertical-align:top"><strong>Vypnuto</strong></td>
          <td style="padding:.3rem .5rem">Žádný spell-check. Hodí se na cizojazyčné pasáže
            (citace, němčina v hist. dokumentech).</td></tr>
      </table>
      <p style="margin:.2rem 0 .5rem;font-size:.85rem;opacity:.7">
        Modes jsou exclusive — vybíráš v Pomocníci radio button. Detail
        CSH režimu níže:
      </p>

      <p style="margin:.6rem 0 .3rem"><strong>Při prvním zapnutí se stáhne:</strong></p>
      <table style="margin:.2rem 0 .8rem;border-collapse:collapse;width:100%;font-size:.85rem">
        <tr style="border-bottom:1px solid #333">
          <td style="padding:.2rem .5rem"><code>nspell</code> knihovna</td>
          <td style="padding:.2rem .5rem;text-align:right">~50 KB</td>
          <td style="padding:.2rem .5rem;font-size:.7rem;opacity:.6">esm.sh CDN</td>
        </tr>
        <tr style="border-bottom:1px solid #333">
          <td style="padding:.2rem .5rem"><code>cs_CZ.aff</code> (gramatika)</td>
          <td style="padding:.2rem .5rem;text-align:right">~1.2 MB</td>
          <td style="padding:.2rem .5rem;font-size:.7rem;opacity:.6">unpkg.com</td>
        </tr>
        <tr style="border-bottom:1px solid #333">
          <td style="padding:.2rem .5rem"><code>cs_CZ.dic</code> (slovník)</td>
          <td style="padding:.2rem .5rem;text-align:right">~5 MB</td>
          <td style="padding:.2rem .5rem;font-size:.7rem;opacity:.6">unpkg.com</td>
        </tr>
        <tr>
          <td style="padding:.2rem .5rem"><code>csh-spell-dict.json</code> (CSH terms)</td>
          <td style="padding:.2rem .5rem;text-align:right">~50 KB</td>
          <td style="padding:.2rem .5rem;font-size:.7rem;opacity:.6">tento web</td>
        </tr>
        <tr style="border-top:1px solid #c9a85d">
          <td style="padding:.2rem .5rem"><strong>Celkem</strong></td>
          <td style="padding:.2rem .5rem;text-align:right"><strong>~6.3 MB</strong></td>
          <td style="padding:.2rem .5rem;font-size:.7rem;opacity:.6">jednorázově</td>
        </tr>
      </table>

      <p style="margin:.4rem 0 .3rem"><strong>Časová náročnost:</strong></p>
      <ul style="margin:.2rem 0 .8rem;padding-left:1.2rem;font-size:.88rem">
        <li>1. zapnutí: stažení (~3–10 s podle připojení) + parsování (~3–5 s)</li>
        <li>2. zapnutí (cached): okamžité (~100 ms) — soubory v browser cache</li>
        <li>Check tokenu: &lt;1 ms (vše v paměti)</li>
        <li>Heap memory: ~10 MB</li>
      </ul>

      <p style="margin:.4rem 0 .3rem"><strong>Co se podtrhne (špatně):</strong></p>
      <ul style="margin:.2rem 0 .8rem;padding-left:1.2rem;font-size:.88rem">
        <li><code>balanc</code> → správně „setrvačka" (anglicismus)</li>
        <li><code>vlasová pružinka</code> → „vlásek"</li>
        <li><code>escapement</code> → „krok"</li>
        <li>Překlepy: <code>kyvadlu</code> ✓ vs <code>kyvadelm</code> ✗</li>
      </ul>

      <p style="margin:.4rem 0 .3rem"><strong>Co se nepodtrhne (správně):</strong></p>
      <ul style="margin:.2rem 0 .8rem;padding-left:1.2rem;font-size:.88rem">
        <li>České slovo s diakritikou: <code>kyvadlové soukolí</code>, <code>čtvrťový stroj</code></li>
        <li>Hodináři (custom dict): <code>Krečmer</code>, <code>Hainz</code>, <code>Janata</code></li>
        <li>Místa ze soupisu: <code>Holešovice</code>, <code>Sušice</code>, <code>Vimperk</code></li>
        <li>Historická cizí jména: <code>München</code>, <code>Schöpperle</code>, <code>Glashütte</code></li>
      </ul>

      <p style="margin:.4rem 0 .3rem"><strong>Kde funguje:</strong></p>
      <ul style="margin:.2rem 0 .8rem;padding-left:1.2rem;font-size:.88rem">
        <li>Velké textareas (≥ 60 px výška) — typicky tělo článku v Sveltia</li>
        <li>NEpracuje na malých single-line input polích (slug, title, …)</li>
      </ul>

      <p style="margin:.4rem 0 .3rem"><strong>Známé limity:</strong></p>
      <ul style="margin:.2rem 0 .8rem;padding-left:1.2rem;font-size:.88rem">
        <li>Sveltia rich-text mode (TipTap/ProseMirror) — overlay nemusí
            sedět přesně. Přepni do <em>Markdown source</em> view (přepínač
            vpravo nahoře v editor pole).</li>
        <li>Slovo je v souboru, ale podtrhuje se? Pošli e-mail na info@orloj.eu
            s ukázkou — slovo přidáme do CSH custom dict při dalším buildu.</li>
        <li>Vyčištění cache: F12 → Application → Storage → Clear site data,
            pak znovu zapnout.</li>
      </ul>

      <h3 style="color:#c9a85d;font-size:1rem;margin:.8rem 0 .3rem">🤖 AI našeptávač</h3>
      <p style="margin:.2rem 0 .5rem">
        Po pauze ~1.2 s v psaní AI navrhne pokračování věty — jako
        <em>ghost-text</em> (lehce průhledný zelený text za kurzorem).
        Používá Cloudflare Workers AI s Mistral 24B + náš slovníkový kontext.
      </p>
      <table style="margin:.4rem 0 .8rem;border-collapse:collapse;width:100%">
        <tr><td style="padding:.15rem .5rem;width:9rem">
          <kbd style="background:#2a2a2a;padding:.05rem .3rem;border-radius:.2rem;border:1px solid #444">Tab</kbd></td>
          <td>přijme návrh (vloží do textu)</td></tr>
        <tr><td style="padding:.15rem .5rem">
          <kbd style="background:#2a2a2a;padding:.05rem .3rem;border-radius:.2rem;border:1px solid #444">Esc</kbd></td>
          <td>odmítne návrh</td></tr>
        <tr><td style="padding:.15rem .5rem">pokračuj psát</td>
          <td>návrh zmizí, po další pauze přijde nový</td></tr>
      </table>
      <p style="margin:.2rem 0 .8rem;font-size:.85rem;opacity:.7">
        Trigger: kontext ≥ 30 znaků, věta nekončí tečkou. Status indikátor
        vpravo dole (žlutý = loading, zelený = navrhuje, červený = error).
      </p>
      <p style="margin:.2rem 0 .8rem;font-size:.85rem;opacity:.7">
        ⚠ Privacy: text odchází na Cloudflare při každém požadavku. Pokud
        je obsah citlivý, vypni AI v Pomocníci.
      </p>

      <h3 style="color:#c9a85d;font-size:1rem;margin:.8rem 0 .3rem">🔗 Vkládání odkazů</h3>
      <p style="margin:.2rem 0 .5rem">
        Modal pro snadné vkládání odkazů z 5 zdrojů:
      </p>
      <table style="margin:.4rem 0 .8rem;border-collapse:collapse;width:100%">
        <tr><td style="padding:.15rem .5rem;width:9rem">
          <kbd style="background:#2a2a2a;padding:.05rem .3rem;border-radius:.2rem;border:1px solid #444">⌘K</kbd> /
          <kbd style="background:#2a2a2a;padding:.05rem .3rem;border-radius:.2rem;border:1px solid #444">Ctrl+K</kbd></td>
          <td>otevře modal (kurzor v textarea)</td></tr>
        <tr><td style="padding:.15rem .5rem">↑ ↓</td>
          <td>navigace mezi výsledky</td></tr>
        <tr><td style="padding:.15rem .5rem">
          <kbd style="background:#2a2a2a;padding:.05rem .3rem;border-radius:.2rem;border:1px solid #444">Enter</kbd></td>
          <td>vloží vybraný odkaz</td></tr>
        <tr><td style="padding:.15rem .5rem">
          <kbd style="background:#2a2a2a;padding:.05rem .3rem;border-radius:.2rem;border:1px solid #444">Esc</kbd></td>
          <td>zavře modal</td></tr>
      </table>
      <ul style="margin:.2rem 0 .8rem;padding-left:1.2rem">
        <li><strong>📍 Hodinárium</strong> — medailony, slovník, soupis, články</li>
        <li><strong>ⓦ Wikipedia (cs)</strong> — heslo z české Wikipedie</li>
        <li><strong>🏛 Wikidata</strong> — entity Q-id s cs label</li>
        <li><strong>🏛 Památkový katalog NPÚ</strong> — kulturní památky</li>
        <li><strong>🔗 Vlastní URL</strong> — manuální vstup (https://…)</li>
      </ul>
      <p style="margin:.2rem 0 .8rem;font-size:.85rem;opacity:.7">
        Tip: označ slovo v textu před stiskem ⌘K → search input bude
        pre-filled selection, klik na výsledek nahradí selection
        markdown linkem <code>[text](url)</code>.
      </p>

      <h3 style="color:#c9a85d;font-size:1rem;margin:1rem 0 .3rem">🌐 Kompatibilita prohlížečů</h3>
      <table style="margin:.4rem 0 .8rem;border-collapse:collapse;width:100%;font-size:.85rem">
        <thead>
          <tr style="border-bottom:1px solid #c9a85d">
            <th style="text-align:left;padding:.25rem .5rem">Prohlížeč</th>
            <th style="text-align:left;padding:.25rem .5rem">Min. verze</th>
            <th style="text-align:left;padding:.25rem .5rem">Stav</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style="padding:.2rem .5rem">Chrome / Edge / Brave</td>
            <td style="padding:.2rem .5rem">79+ (2020)</td>
            <td style="padding:.2rem .5rem">✅ doporučeno</td></tr>
          <tr><td style="padding:.2rem .5rem">Firefox</td>
            <td style="padding:.2rem .5rem">79+ (2020)</td>
            <td style="padding:.2rem .5rem">✅ plně</td></tr>
          <tr><td style="padding:.2rem .5rem">Safari (macOS)</td>
            <td style="padding:.2rem .5rem">16+ (2022)</td>
            <td style="padding:.2rem .5rem">✅ plně (DevTools v Settings → Advanced)</td></tr>
          <tr><td style="padding:.2rem .5rem">Mobile Safari / Chrome</td>
            <td style="padding:.2rem .5rem">—</td>
            <td style="padding:.2rem .5rem">⚠ Sveltia není mobile-friendly</td></tr>
        </tbody>
      </table>
      <p style="margin:.2rem 0 .5rem;font-size:.85rem;opacity:.85">
        <strong>Sveltia rich-text mode:</strong> v některých verzích používá
        <code>contenteditable</code> div — overlay nesedí. Workaround:
        přepni na <em>Markdown source</em> view (přepínač v editoru).
      </p>
      <p style="margin:.2rem 0 .5rem;font-size:.85rem;opacity:.85">
        <strong>V2 plán — CSH rozšíření prohlížeče:</strong> doplníme
        pomocníky i mimo CMS editor (např. když píšete v Notionu nebo
        v generic formuláři). Bude se instalovat jako rozšíření do
        Chrome / Firefox.
      </p>

      <h3 style="color:#c9a85d;font-size:1rem;margin:1rem 0 .3rem">⚙ Reset / odstranění problémů</h3>
      <p style="margin:.2rem 0 .5rem;font-size:.85rem">
        Pokud něco nefunguje, otevři DevTools console (F12 / Cmd+Opt+C) —
        moduly logují své stavy:
      </p>
      <pre style="background:#0f0f0f;padding:.5rem .8rem;border-radius:.3rem;
                  font-size:.8rem;overflow:auto;margin:.4rem 0;color:#9bd97a">[csh-spell] Activated.
[csh-ai] Activated.
[csh-link] Activated. ⌘K v textarea otevře link picker.</pre>
      <p style="margin:.2rem 0 .5rem;font-size:.85rem">
        Reset všech nastavení (do Console):
      </p>
      <pre style="background:#0f0f0f;padding:.5rem .8rem;border-radius:.3rem;
                  font-size:.8rem;overflow:auto;margin:.4rem 0">localStorage.removeItem('csh-editor-settings'); location.reload();</pre>

      </div>
      <div style="margin-top:.8rem;padding-top:.8rem;border-top:1px solid #444;text-align:right">
        <button type="button" id="csh-help-close"
                style="background:#c9a85d;color:#1a1a1a;border:none;
                       padding:.4rem 1rem;border-radius:.3rem;cursor:pointer;
                       font:inherit;font-weight:500">
          Zavřít
        </button>
      </div>
    `;
    document.body.appendChild(m);
    helpEl = m;

    m.querySelector('#csh-help-close').addEventListener('click', () => {
      m.style.display = 'none';
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && m.style.display === 'flex') {
        m.style.display = 'none';
      }
    });
    document.addEventListener('mousedown', (e) => {
      if (m.style.display !== 'flex') return;
      if (m.contains(e.target)) return;
      m.style.display = 'none';
    });
    return m;
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
