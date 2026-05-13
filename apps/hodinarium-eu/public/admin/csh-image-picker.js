/**
 * CSH Image picker (Cmd+Shift+P / Ctrl+Shift+P) pro Sveltia editor.
 *
 * Modal pro vkládání obrázků s explicit kontrolou layoutu (class) +
 * volitelně credit (autor, licence, zdroj). Generuje `::photo{...}`
 * direktivu na pozici kurzoru v textarea.
 *
 * Workflow:
 *   - Editor v textarea: pozice kurzoru → Cmd+Shift+P → modal
 *   - Vyplnit src (cesta /img/...), alt, vybrat layout (8 možností)
 *   - Optional: rozkliknout „Credit" sekci a vyplnit autor / licence / zdroj
 *   - Klik „Vložit" → markdown direktiva na pozici kurzoru
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

  // ── Layout options ──────────────────────────────────────────────

  /** Photo class options, including alignment overrides */
  const LAYOUT_OPTIONS = [
    { value: '', label: 'Auto', hint: 'První obrázek = hero, ostatní rytmem pravo/levo' },
    { value: 'img-hero', label: 'Hero', hint: 'Plná šířka nahoře pod nadpisem' },
    { value: 'img-full', label: 'Plná šířka', hint: 'Plná šířka kdekoliv v textu' },
    { value: 'img-standalone', label: 'Na střed', hint: 'Na střed, max 480 px, žádné obtékání' },
    { value: 'img-small', label: 'Malý', hint: 'Drobný (220 px), obtékaný (default vpravo)' },
    { value: 'img-medium', label: 'Střední', hint: 'Střední (320 px), obtékaný' },
    { value: 'img-tall', label: 'Vysoký', hint: 'Vertikální portrét (240×480), obtékaný' },
  ];

  const FLOAT_OPTIONS = [
    { value: '', label: 'Default', hint: 'Bez explicit floatu' },
    { value: 'img-float-left', label: 'Vlevo', hint: 'Vynutí obtékání zleva' },
    { value: 'img-float-right', label: 'Vpravo', hint: 'Vynutí obtékání zprava' },
  ];

  // ── Modal lifecycle ──────────────────────────────────────────────

  function isEnabled() {
    try {
      const raw = localStorage.getItem('csh-editor-settings');
      if (!raw) return true; // default ON
      const parsed = JSON.parse(raw);
      return parsed.imagePicker !== false;
    } catch {
      return true;
    }
  }

  function findActiveTextarea() {
    const el = document.activeElement;
    if (el && el.tagName === 'TEXTAREA') return el;
    return null;
  }

  function buildModal() {
    const m = document.createElement('div');
    m.id = 'csh-image-picker-modal';
    m.style.cssText = `
      position: fixed; inset: 0; z-index: 100000;
      background: rgba(0,0,0,.55); display: flex;
      align-items: center; justify-content: center;
      backdrop-filter: blur(4px);
    `;
    m.innerHTML = `
      <div style="background:#1f1814;color:#e8d8a8;border:1px solid #c9a85d;
                  border-radius:.4rem;max-width:560px;width:92%;max-height:85vh;
                  overflow-y:auto;font:14px/1.5 system-ui,sans-serif;
                  padding:1.25rem;box-shadow:0 8px 32px rgba(0,0,0,.4)">
        <h2 style="margin:0 0 .8rem;font-size:1.1rem;color:#d9b274">
          Vložit obrázek
        </h2>

        <label style="display:block;margin-bottom:.7rem">
          <span style="font-size:.78rem;text-transform:uppercase;letter-spacing:.1em;
                       color:#c47049;display:block;margin-bottom:.15rem">Cesta (src)</span>
          <input type="text" id="csh-ip-src" placeholder="/img/cesta/obrazek.jpg"
                 style="width:100%;background:#0a0807;color:#e8d8a8;border:1px solid #444;
                        border-radius:.25rem;padding:.4rem .55rem;font:inherit;box-sizing:border-box">
        </label>

        <label style="display:block;margin-bottom:.8rem">
          <span style="font-size:.78rem;text-transform:uppercase;letter-spacing:.1em;
                       color:#c47049;display:block;margin-bottom:.15rem">Popis (alt)</span>
          <input type="text" id="csh-ip-alt" placeholder="Popis obrázku pro screen readery"
                 style="width:100%;background:#0a0807;color:#e8d8a8;border:1px solid #444;
                        border-radius:.25rem;padding:.4rem .55rem;font:inherit;box-sizing:border-box">
        </label>

        <fieldset style="border:1px solid #444;border-radius:.25rem;padding:.6rem .8rem;margin-bottom:.7rem">
          <legend style="font-size:.78rem;text-transform:uppercase;letter-spacing:.1em;
                         color:#c47049;padding:0 .35rem">Velikost / layout</legend>
          <div id="csh-ip-layouts" style="display:grid;gap:.35rem"></div>
        </fieldset>

        <fieldset style="border:1px solid #444;border-radius:.25rem;padding:.6rem .8rem;margin-bottom:.7rem">
          <legend style="font-size:.78rem;text-transform:uppercase;letter-spacing:.1em;
                         color:#c47049;padding:0 .35rem">Obtékání (float)</legend>
          <div id="csh-ip-floats" style="display:flex;gap:1rem;flex-wrap:wrap"></div>
        </fieldset>

        <details style="margin-bottom:.7rem">
          <summary style="cursor:pointer;font-size:.85rem;color:#c9a85d;padding:.3rem 0">
            Credit (autor, licence, zdroj) — volitelné
          </summary>
          <div style="padding:.5rem 0 .2rem;display:grid;gap:.5rem">
            <label style="display:block">
              <span style="font-size:.72rem;color:#c47049;display:block;margin-bottom:.1rem">Autor</span>
              <input type="text" id="csh-ip-author" placeholder="Jméno autora fotografie"
                     style="width:100%;background:#0a0807;color:#e8d8a8;border:1px solid #444;
                            border-radius:.25rem;padding:.35rem .5rem;font:inherit;box-sizing:border-box;font-size:.9rem">
            </label>
            <label style="display:block">
              <span style="font-size:.72rem;color:#c47049;display:block;margin-bottom:.1rem">Autor URL (volitelně)</span>
              <input type="url" id="csh-ip-authorUrl" placeholder="https://..."
                     style="width:100%;background:#0a0807;color:#e8d8a8;border:1px solid #444;
                            border-radius:.25rem;padding:.35rem .5rem;font:inherit;box-sizing:border-box;font-size:.9rem">
            </label>
            <label style="display:block">
              <span style="font-size:.72rem;color:#c47049;display:block;margin-bottom:.1rem">Licence (text)</span>
              <input type="text" id="csh-ip-license" placeholder="např. CC BY-SA 3.0"
                     style="width:100%;background:#0a0807;color:#e8d8a8;border:1px solid #444;
                            border-radius:.25rem;padding:.35rem .5rem;font:inherit;box-sizing:border-box;font-size:.9rem">
            </label>
            <label style="display:block">
              <span style="font-size:.72rem;color:#c47049;display:block;margin-bottom:.1rem">Licence URL (volitelně)</span>
              <input type="url" id="csh-ip-licenseUrl" placeholder="https://creativecommons.org/..."
                     style="width:100%;background:#0a0807;color:#e8d8a8;border:1px solid #444;
                            border-radius:.25rem;padding:.35rem .5rem;font:inherit;box-sizing:border-box;font-size:.9rem">
            </label>
            <label style="display:block">
              <span style="font-size:.72rem;color:#c47049;display:block;margin-bottom:.1rem">Zdroj URL (Commons file page, ebay aukce…)</span>
              <input type="url" id="csh-ip-sourceUrl" placeholder="https://commons.wikimedia.org/wiki/File:..."
                     style="width:100%;background:#0a0807;color:#e8d8a8;border:1px solid #444;
                            border-radius:.25rem;padding:.35rem .5rem;font:inherit;box-sizing:border-box;font-size:.9rem">
            </label>
            <label style="display:block">
              <span style="font-size:.72rem;color:#c47049;display:block;margin-bottom:.1rem">Rok (volitelně)</span>
              <input type="number" id="csh-ip-year" placeholder="např. 2014"
                     style="width:120px;background:#0a0807;color:#e8d8a8;border:1px solid #444;
                            border-radius:.25rem;padding:.35rem .5rem;font:inherit;box-sizing:border-box;font-size:.9rem">
            </label>
          </div>
        </details>

        <div style="background:#0a0807;border:1px solid #444;border-radius:.25rem;
                    padding:.55rem .7rem;margin-bottom:.7rem;font-family:ui-monospace,monospace;
                    font-size:.78rem;color:#9a8c75;word-break:break-all" id="csh-ip-preview">
          ::photo{src="" alt=""}
        </div>

        <div style="display:flex;justify-content:flex-end;gap:.6rem">
          <button type="button" id="csh-ip-cancel"
                  style="background:none;border:1px solid #666;color:#e8d8a8;
                         padding:.35rem .9rem;border-radius:.25rem;cursor:pointer;font:inherit">
            Zrušit
          </button>
          <button type="button" id="csh-ip-insert"
                  style="background:#c9a85d;border:1px solid #c9a85d;color:#1a120a;
                         padding:.35rem .9rem;border-radius:.25rem;cursor:pointer;
                         font:inherit;font-weight:600">
            Vložit
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(m);

    // Layout radio buttons
    const layoutsBox = m.querySelector('#csh-ip-layouts');
    LAYOUT_OPTIONS.forEach((opt, i) => {
      const id = `csh-ip-layout-${i}`;
      const label = document.createElement('label');
      label.style.cssText = 'display:flex;align-items:flex-start;gap:.45rem;cursor:pointer;padding:.25rem .35rem;border-radius:.2rem';
      label.innerHTML = `
        <input type="radio" name="csh-ip-layout" value="${opt.value}" id="${id}"
               ${i === 0 ? 'checked' : ''} style="margin-top:.25rem;cursor:pointer">
        <span style="flex:1">
          <strong style="font-size:.9rem">${opt.label}</strong>
          <span style="display:block;font-size:.75rem;color:#9a8c75;line-height:1.3">${opt.hint}</span>
        </span>
      `;
      label.addEventListener('mouseenter', () => label.style.background = '#0a0807');
      label.addEventListener('mouseleave', () => label.style.background = 'transparent');
      layoutsBox.appendChild(label);
    });

    // Float radio buttons (horizontal)
    const floatsBox = m.querySelector('#csh-ip-floats');
    FLOAT_OPTIONS.forEach((opt, i) => {
      const id = `csh-ip-float-${i}`;
      const label = document.createElement('label');
      label.style.cssText = 'display:flex;align-items:center;gap:.35rem;cursor:pointer';
      label.innerHTML = `
        <input type="radio" name="csh-ip-float" value="${opt.value}" id="${id}"
               ${i === 0 ? 'checked' : ''} style="cursor:pointer">
        <span style="font-size:.88rem" title="${opt.hint}">${opt.label}</span>
      `;
      floatsBox.appendChild(label);
    });

    return m;
  }

  function updatePreview() {
    const preview = modalEl.querySelector('#csh-ip-preview');
    preview.textContent = buildDirective();
  }

  function buildDirective() {
    const get = (id) => modalEl.querySelector(id).value.trim();
    const src = get('#csh-ip-src');
    const alt = get('#csh-ip-alt');
    const layout = modalEl.querySelector('input[name="csh-ip-layout"]:checked')?.value || '';
    const float = modalEl.querySelector('input[name="csh-ip-float"]:checked')?.value || '';
    const cls = [layout, float].filter(Boolean).join(' ');
    const author = get('#csh-ip-author');
    const authorUrl = get('#csh-ip-authorUrl');
    const license = get('#csh-ip-license');
    const licenseUrl = get('#csh-ip-licenseUrl');
    const sourceUrl = get('#csh-ip-sourceUrl');
    const year = get('#csh-ip-year');

    const attrs = [];
    if (src) attrs.push(`src="${src}"`);
    if (alt) attrs.push(`alt="${alt.replace(/"/g, '&quot;')}"`);
    if (cls) attrs.push(`class="${cls}"`);
    if (author) attrs.push(`author="${author.replace(/"/g, '&quot;')}"`);
    if (authorUrl) attrs.push(`authorUrl="${authorUrl}"`);
    if (license) attrs.push(`license="${license}"`);
    if (licenseUrl) attrs.push(`licenseUrl="${licenseUrl}"`);
    if (sourceUrl) attrs.push(`sourceUrl="${sourceUrl}"`);
    if (year) attrs.push(`year="${year}"`);

    return `::photo{${attrs.join(' ')}}`;
  }

  function openModal() {
    if (active) return;
    currentTextarea = findActiveTextarea();
    if (!currentTextarea) return;
    currentSelStart = currentTextarea.selectionStart;
    currentSelEnd = currentTextarea.selectionEnd;

    modalEl = buildModal();
    active = true;

    const srcInput = modalEl.querySelector('#csh-ip-src');
    setTimeout(() => srcInput.focus(), 50);

    // Live preview na všechny změny
    modalEl.addEventListener('input', updatePreview);
    modalEl.addEventListener('change', updatePreview);
    updatePreview();

    // Cancel / outside click
    modalEl.querySelector('#csh-ip-cancel').addEventListener('click', closeModal);
    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) closeModal();
    });

    // Insert
    modalEl.querySelector('#csh-ip-insert').addEventListener('click', insertDirective);

    // Escape
    document.addEventListener('keydown', onEscape);

    // Enter v src/alt input = next field (not submit, aby Petr necommitnul nedopečené)
  }

  function closeModal() {
    if (!active) return;
    document.removeEventListener('keydown', onEscape);
    modalEl.remove();
    modalEl = null;
    active = false;
    if (currentTextarea) currentTextarea.focus();
  }

  function onEscape(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
    }
  }

  function insertDirective() {
    const directive = buildDirective();
    if (!directive.includes('src="')) {
      alert('Cesta (src) je povinná.');
      return;
    }

    const ta = currentTextarea;
    const before = ta.value.slice(0, currentSelStart);
    const after = ta.value.slice(currentSelEnd);

    // Ujistit se, že je direktiva na svém řádku s prázdným řádkem před i za
    const needsLineBefore = before.length && !before.endsWith('\n\n');
    const needsLineAfter = after.length && !after.startsWith('\n\n');
    const insertion =
      (needsLineBefore ? (before.endsWith('\n') ? '\n' : '\n\n') : '') +
      directive +
      (needsLineAfter ? (after.startsWith('\n') ? '\n' : '\n\n') : '');

    ta.value = before + insertion + after;
    // Trigger React/Sveltia change detection
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
    setter.call(ta, ta.value);
    ta.dispatchEvent(new Event('input', { bubbles: true }));

    const newPos = before.length + insertion.length;
    ta.setSelectionRange(newPos, newPos);

    closeModal();
  }

  // ── Keyboard shortcut ──────────────────────────────────────────────

  document.addEventListener('keydown', (e) => {
    // Cmd+Shift+P (Mac) / Ctrl+Shift+P (Win/Linux)
    const isModifier = e.metaKey || e.ctrlKey;
    if (!isModifier || !e.shiftKey) return;
    if (e.key !== 'P' && e.key !== 'p') return;
    if (!isEnabled()) return;
    const ta = findActiveTextarea();
    if (!ta) return;

    e.preventDefault();
    openModal();
  });
})();
