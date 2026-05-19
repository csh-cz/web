/**
 * CSH dead-link widget pro Sveltia editor (A.21 V2 follow-up).
 *
 * Načte poslední dead-link audit snapshot (`/admin/dead-links-latest.json`,
 * generuje `scripts/audit-dead-links.mjs` při každém runu) a zobrazí
 * dead links pro **aktuálně editovaný soubor**.
 *
 * Detection editovaného souboru:
 *   - Sveltia URL pattern: `#/collections/<col>/entries/<slug>`
 *   - Mapování: collection → content path
 *     hodinari        → content/hodinari/<slug>.mdx
 *     slovnik         → content/slovnik/<slug>.md
 *     soupis          → content/soupis-veznich-hodin/<slug>.mdx
 *     karty           → content/sbirka/karta/<slug>.md (pozor: liší se per app)
 *     clanky          → content/hodinarium-eu/<slug>.md(x)
 *     kronika         → content/kronika/<slug>.md(x)
 *     kroky           → content/kroky/<slug>.mdx
 *
 * UI:
 *   - Floating widget v pravém dolním rohu CMS (mimo Sveltia chrome).
 *   - Skryt pokud: žádná editace, nebo žádné dead links pro file.
 *   - Klik na widget rozbalí list dead URLs + tlačítko "Wayback" pokud existuje.
 *   - "Wayback" tlačítko = copy URL do clipboardu (editor manuálně paste).
 *   - "🐙 GH Issue" — předvyplněný GitHub issue link pro report.
 *
 * Toggle přes ⚙ Pomocníci panel (default ON, lehký 1 fetch při mount).
 *
 * Snapshot age check:
 *   - Pokud `generatedAt` > 30 dnů old, ukáže warning "Audit zastaralý,
 *     spusťte pnpm deadlinks:audit".
 *
 * Default OFF — uživatel zapne v ⚙ Pomocníci panelu.
 *
 * V2 možné rozšíření:
 *   - Diff vs předchozí JSON (nové dead links highlight)
 *   - Auto-fix click: editor.value.replace(deadUrl, waybackUrl) +
 *     pre-vyplnit save commit message "fix: dead link → Wayback"
 *
 * © ČSH 2026-05-17.
 */
(function () {
  'use strict';

  let widgetEl = null;
  let snapshot = null;        // celý audit JSON
  let snapshotLoading = false;
  let snapshotError = null;
  let currentFile = null;     // aktuálně editovaný content/.../<slug>.md(x)

  // Collection → content path prefix mapping
  const COLLECTION_PATHS = {
    hodinari: { dir: 'content/hodinari', ext: '.mdx' },
    slovnik: { dir: 'content/slovnik', ext: '.md' },
    soupis: { dir: 'content/soupis-veznich-hodin', ext: '.mdx' },
    'soupis-veznich-hodin': { dir: 'content/soupis-veznich-hodin', ext: '.mdx' },
    karty: { dir: 'content/sbirka/karta', ext: '.md' },
    sbirka: { dir: 'content/sbirka/karta', ext: '.md' },
    clanky: { dir: 'content/hodinarium-eu', ext: '.md' },
    'hodinarium-eu': { dir: 'content/hodinarium-eu', ext: '.md' },
    kronika: { dir: 'content/kronika', ext: '.md' },
    kroky: { dir: 'content/kroky', ext: '.mdx' },
  };

  // ── Snapshot loader ─────────────────────────────────────────────

  async function loadSnapshot() {
    if (snapshot || snapshotLoading) return;
    snapshotLoading = true;
    try {
      const r = await fetch('/admin/dead-links-latest.json', { cache: 'no-cache' });
      if (!r.ok) {
        snapshotError = `HTTP ${r.status}`;
        return;
      }
      snapshot = await r.json();
    } catch (e) {
      snapshotError = e.message || 'fetch failed';
    } finally {
      snapshotLoading = false;
    }
  }

  // ── File path detection from Sveltia URL ────────────────────────

  function detectCurrentFile() {
    const m = window.location.hash.match(/^#\/collections\/([^/]+)\/entries\/([^/?]+)/);
    if (!m) return null;
    const [, col, slug] = m;
    const cfg = COLLECTION_PATHS[col];
    if (!cfg) return null;
    // Pokud .mdx variant existuje, prefer; jinak .md. Tady ale jen text
    // match — auditor používá relative path se skutečnou extenzí. Zkusíme
    // obě varianty při lookup.
    return {
      collection: col,
      slug,
      pathPrimary: `${cfg.dir}/${slug}${cfg.ext}`,
      pathAlt: `${cfg.dir}/${slug}${cfg.ext === '.md' ? '.mdx' : '.md'}`,
    };
  }

  function findingsForFile(file) {
    if (!snapshot || !file) return null;
    const byFile = snapshot.byFile || {};
    return byFile[file.pathPrimary] || byFile[file.pathAlt] || null;
  }

  // ── UI render ───────────────────────────────────────────────────

  function ensureWidget() {
    if (widgetEl) return widgetEl;
    widgetEl = document.createElement('div');
    widgetEl.id = 'csh-dead-links-widget';
    widgetEl.style.cssText =
      'position:fixed;bottom:.6rem;right:.6rem;z-index:99997;' +
      'background:#1a1a1a;color:#e8d8a8;' +
      'border:1px solid #b04848;border-radius:.5rem;' +
      'box-shadow:0 4px 16px rgba(0,0,0,.5);' +
      'font:13px/1.4 ui-serif,Georgia,serif;' +
      'max-width:380px;display:none';
    document.body.appendChild(widgetEl);
    return widgetEl;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[c]);
  }

  function snapshotAgeWarning() {
    if (!snapshot?.generatedAt) return '';
    const ageDays = (Date.now() - new Date(snapshot.generatedAt).getTime()) / 86400000;
    if (ageDays < 30) return '';
    return `<div style="font-size:.8rem;color:#d9a05b;margin-top:.3rem">⚠ Audit stár ${Math.round(ageDays)} dní (spusť <code>pnpm deadlinks:audit</code>)</div>`;
  }

  function ghIssueUrl(file, findings) {
    const title = encodeURIComponent(`Dead links v ${file.collection}/${file.slug}`);
    const body = encodeURIComponent(
      `Audit dead-links detekoval ${findings.length} mrtvých URL v souboru \`${file.pathPrimary}\`:\n\n` +
      findings.map((f) => `- **${f.status || 'network err'}** — ${f.url}${f.wayback ? `\n  - Wayback: ${f.wayback.url}` : ''}`).join('\n') +
      `\n\n_Generováno z \`csh-dead-links.js\` Sveltia widget._`
    );
    return `https://github.com/csh-cz/web/issues/new?title=${title}&body=${body}&labels=dead-link,content`;
  }

  function render() {
    const file = detectCurrentFile();
    currentFile = file;
    if (!file) {
      if (widgetEl) widgetEl.style.display = 'none';
      return;
    }

    const findings = findingsForFile(file);
    if (!findings || findings.length === 0) {
      if (widgetEl) widgetEl.style.display = 'none';
      return;
    }

    const w = ensureWidget();
    const withWayback = findings.filter((f) => f.wayback).length;
    w.innerHTML = `
      <div style="padding:.6rem .8rem;cursor:pointer;display:flex;align-items:center;gap:.5rem"
           id="csh-dl-header">
        <span style="font-size:1rem">⚠</span>
        <strong style="flex:1">${findings.length} mrtvých odkazů</strong>
        ${withWayback ? `<span style="font-size:.78rem;opacity:.7">${withWayback}× Wayback</span>` : ''}
        <span id="csh-dl-toggle" style="opacity:.6">▾</span>
      </div>
      <div id="csh-dl-body" style="display:none;border-top:1px solid #333;padding:.5rem .8rem;max-height:60vh;overflow-y:auto">
        <ol style="margin:0;padding-left:1.2rem">
          ${findings.map((f, i) => `
            <li style="margin-bottom:.7rem;font-size:.85rem">
              <div style="font-family:monospace;font-size:.78rem;word-break:break-all;color:#d97070">
                ${escapeHtml(f.url)}
              </div>
              <div style="opacity:.7;font-size:.78rem;margin:.15rem 0">
                ${escapeHtml(f.status || f.error || 'network error')}${f.field ? ` · ${escapeHtml(f.field)}` : ''}
              </div>
              ${f.context ? `<div style="opacity:.6;font-size:.75rem;font-style:italic;margin:.15rem 0">…${escapeHtml(f.context.slice(0, 120))}…</div>` : ''}
              ${f.wayback ? `
                <button data-wayback-url="${escapeHtml(f.wayback.url)}" data-finding-idx="${i}"
                        style="margin-top:.3rem;background:#5b9dd9;color:#1a1a1a;border:0;padding:.25rem .55rem;
                               border-radius:.2rem;font:500 .75rem ui-sans-serif;cursor:pointer">
                  <i class="fa-solid fa-clipboard" aria-hidden="true"></i> Wayback URL
                </button>
              ` : ''}
              <a href="${escapeHtml(f.url)}" target="_blank" rel="noopener"
                 style="display:inline-block;margin-top:.3rem;color:#5b9dd9;font-size:.78rem;text-decoration:none;
                        margin-left:.4rem">
                <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i> Otevřít
              </a>
            </li>
          `).join('')}
        </ol>
        ${snapshotAgeWarning()}
        <div style="margin-top:.5rem;padding-top:.4rem;border-top:1px solid #333;text-align:right">
          <a href="${ghIssueUrl(file, findings)}" target="_blank" rel="noopener"
             style="color:#c9a85d;font-size:.78rem;text-decoration:none"><i class="fa-brands fa-github" aria-hidden="true"></i> GH Issue</a>
        </div>
      </div>
    `;
    w.style.display = 'block';

    // Toggle expand/collapse
    const header = w.querySelector('#csh-dl-header');
    const body = w.querySelector('#csh-dl-body');
    const toggle = w.querySelector('#csh-dl-toggle');
    header?.addEventListener('click', () => {
      const open = body.style.display === 'block';
      body.style.display = open ? 'none' : 'block';
      toggle.textContent = open ? '▾' : '▴';
    });

    // Wayback copy buttons
    w.querySelectorAll('[data-wayback-url]').forEach((btn) => {
      btn.addEventListener('click', async (ev) => {
        ev.stopPropagation();
        const url = btn.getAttribute('data-wayback-url');
        try {
          await navigator.clipboard.writeText(url);
          btn.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i> Zkopírováno';
          setTimeout(() => { btn.innerHTML = '<i class="fa-solid fa-clipboard" aria-hidden="true"></i> Wayback URL'; }, 1500);
        } catch {
          // fallback: select prompt
          window.prompt('Zkopíruj Wayback URL ručně:', url);
        }
      });
    });
  }

  // ── Lifecycle ───────────────────────────────────────────────────

  async function init() {
    // Default OFF — užatel zapne v ⚙ Pomocníci
    let settings = {};
    try { settings = JSON.parse(localStorage.getItem('csh-editor-settings') || '{}'); } catch {}
    if (settings.deadLinks === false) return;
    // V1: default ON pokud není explicitně OFF (uživatel to objeví v UI)
    if (settings.deadLinks === undefined) {
      // bez explicit settings: default ON
    }

    await loadSnapshot();
    if (snapshotError) {
      // silent — audit nemusí být commited yet
      console.warn('[csh-dead-links] snapshot load:', snapshotError);
      return;
    }

    render();
    window.addEventListener('hashchange', render);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
