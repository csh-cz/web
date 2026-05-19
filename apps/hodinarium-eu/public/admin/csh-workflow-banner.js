/**
 * CSH workflow banner — upozornění při otevření článku v Sveltia editoru
 * pokud má `workflow.lockedBy` jiného editora (= někdo na něm pracuje).
 *
 * Hook do Sveltia hash router:
 *   /admin/#/collections/<col>/entries/<id>
 *
 * Pro každý entry change:
 *   1. Fetch raw frontmatter z GitHubu přes /api/cms proxy
 *      (= already authorized through CF Access + bot PAT)
 *   2. Parse YAML, číst workflow.lockedBy / lockedAt
 *   3. Pokud lockedBy != aktuální editor + lockedAt < 24 h →
 *      render warning banner nahoře v editor area
 *   4. Pokud lockedBy == aktuální editor → friendly note "ty držíš zámek
 *      od <relative time>"
 *   5. Pokud nelocked → no banner
 *
 * Aktuální editor = Cloudflare Access cookie identity. Pages Function
 * vrací email v Cf-Access-Authenticated-User-Email; admin/ prostředí
 * ho exposuje přes cookie cf-access-authenticated-user-email.
 *
 * Dependencies: žádné. Pure vanilla JS, lazy yaml parser z esm.sh
 * (jen 30 KB) pro robust YAML parse.
 */
(function () {
  'use strict';

  const COLLECTIONS = {
    clanky: { folder: 'content/hodinarium-eu', extensions: ['.md', '.mdx'] },
    karty: { folder: 'content/hodinarium-eu', extensions: ['.md', '.mdx'] }, // Sveltia rozdělila clanky/karty
    hodinari: { folder: 'content/hodinari', extensions: ['.mdx', '.md'] },
    kroky: { folder: 'content/kroky', extensions: ['.mdx', '.md'] },
    slovnik: { folder: 'content/slovnik', extensions: ['.md', '.mdx'] },
    'soupis-veznich-hodin': { folder: 'content/soupis-veznich-hodin', extensions: ['.mdx', '.md'] },
  };

  let yaml = null;
  let bannerEl = null;
  let lastEntryId = null;

  /** Lazy-load yaml parser (pro robust YAML parse). */
  async function loadYaml() {
    if (yaml) return yaml;
    yaml = await import('https://esm.sh/yaml@2.8.4');
    return yaml;
  }

  /** Get current editor email — z cookie nastavený CF Access. */
  function getCurrentEditor() {
    const m = document.cookie.match(/CF_Authorization=([^;]+)/);
    if (!m) return null;
    // CF_Authorization je JWT — payload obsahuje email. Decode middle part.
    try {
      const parts = m[1].split('.');
      if (parts.length < 2) return null;
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload.email ?? null;
    } catch {
      return null;
    }
  }

  /** Parse Sveltia hash route. Returns {collection, entryId} nebo null. */
  function parseRoute() {
    const hash = location.hash; // e.g. #/collections/clanky/entries/akvizice-2015-2025
    const m = hash.match(/^#\/collections\/([^/]+)\/entries\/(.+)$/);
    if (!m) return null;
    return { collection: decodeURIComponent(m[1]), entryId: decodeURIComponent(m[2]) };
  }

  /** Fetch raw frontmatter z GitHubu přes /api/cms proxy.
   *  Vrací parsed workflow object nebo null. */
  async function fetchWorkflow(collection, entryId) {
    const cfg = COLLECTIONS[collection];
    if (!cfg) return null;

    for (const ext of cfg.extensions) {
      const path = `${cfg.folder}/${entryId}${ext}`;
      const url = `/api/cms/api/v3/repos/csh-cz/web/contents/${encodeURIComponent(path)}?ref=main`;
      try {
        const res = await fetch(url, { credentials: 'include' });
        if (!res.ok) continue;
        const json = await res.json();
        // Decode base64 content
        const content = atob(json.content.replace(/\n/g, ''));
        const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        if (!fmMatch) return null;
        const y = await loadYaml();
        const data = y.parse(fmMatch[1]);
        return data?.workflow ?? null;
      } catch {
        // try next extension
      }
    }
    return null;
  }

  /** Relativní čas od ISO datestamp (cs). */
  function relativeTime(iso) {
    if (!iso) return '—';
    const t = new Date(iso).getTime();
    const diffMin = Math.floor((Date.now() - t) / 60_000);
    if (diffMin < 1) return 'právě teď';
    if (diffMin < 60) return `před ${diffMin} min`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `před ${diffHr} h`;
    const diffDay = Math.floor(diffHr / 24);
    return `před ${diffDay} dny`;
  }

  function removeBanner() {
    if (bannerEl) {
      bannerEl.remove();
      bannerEl = null;
    }
  }

  /** Render banner do top of editor area. */
  function renderBanner({ status, lockedBy, lockedAt, isCurrentEditor, isStale, notes }) {
    removeBanner();
    bannerEl = document.createElement('aside');
    bannerEl.id = 'csh-workflow-banner';
    bannerEl.setAttribute('role', 'status');
    bannerEl.setAttribute('aria-live', 'polite');

    let bg, borderColor, label, body;
    if (isCurrentEditor) {
      bg = 'color-mix(in srgb, #5b9d5b 12%, transparent)';
      borderColor = '#5b9d5b';
      label = '<i class="fa-solid fa-check" aria-hidden="true"></i> Vaše rozpracování';
      body = `Status: <strong>${status}</strong> · Zabráno ${relativeTime(lockedAt)} (vy).`;
    } else if (isStale) {
      bg = 'color-mix(in srgb, #c9a85d 12%, transparent)';
      borderColor = '#c9a85d';
      label = '<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> Starý zámek';
      body = `Status: <strong>${status}</strong> · Naposledy zabral <strong>${lockedBy}</strong> ${relativeTime(lockedAt)}. Pravděpodobně už nepracuje — můžete převzít přes úkolovník.`;
    } else {
      bg = 'color-mix(in srgb, #d97070 14%, transparent)';
      borderColor = '#d97070';
      label = '<i class="fa-solid fa-lock" aria-hidden="true"></i> Někdo na článku pracuje';
      body = `Status: <strong>${status}</strong> · Zabral <strong>${lockedBy}</strong> ${relativeTime(lockedAt)}. Domluvte se před úpravou — paralelní edity přepíší jeho rozpracování.`;
    }

    bannerEl.style.cssText =
      `position:fixed;top:.6rem;right:.6rem;z-index:99997;` +
      `max-width:420px;background:${bg};border:1px solid ${borderColor};` +
      'border-radius:.4rem;padding:.7rem 1rem;font:13px/1.45 ui-serif,Georgia,serif;' +
      'color:#e8d8a8;box-shadow:0 4px 12px rgba(0,0,0,.4)';

    bannerEl.innerHTML = `
      <strong style="color:${borderColor};display:block;margin-bottom:.2rem;font-size:.92rem">${label}</strong>
      <span>${body}</span>
      ${notes ? `<p style="margin:.4rem 0 0;font-size:.82rem;color:var(--color-text-soft);font-style:italic">${notes}</p>` : ''}
      <button type="button" id="csh-wf-banner-close" style="position:absolute;top:.3rem;right:.4rem;background:none;border:none;color:#888;cursor:pointer;font-size:1rem;padding:0;line-height:1" aria-label="Zavřít upozornění">×</button>
    `;
    document.body.appendChild(bannerEl);
    bannerEl.querySelector('#csh-wf-banner-close').addEventListener('click', removeBanner);
  }

  /** Main flow: parse route → fetch workflow → render banner. */
  async function checkAndRender() {
    const route = parseRoute();
    if (!route) {
      removeBanner();
      lastEntryId = null;
      return;
    }
    if (route.entryId === lastEntryId) return; // Same entry, banner už je
    lastEntryId = route.entryId;

    const workflow = await fetchWorkflow(route.collection, route.entryId);
    if (!workflow || !workflow.lockedBy) {
      removeBanner();
      return;
    }

    const editor = getCurrentEditor();
    const isCurrentEditor = editor && workflow.lockedBy === editor;
    const isStale = workflow.lockedAt && (Date.now() - new Date(workflow.lockedAt).getTime()) > 24 * 60 * 60 * 1000;

    renderBanner({
      status: workflow.status ?? 'unknown',
      lockedBy: workflow.lockedBy,
      lockedAt: workflow.lockedAt,
      isCurrentEditor,
      isStale: !isCurrentEditor && isStale,
      notes: workflow.notes,
    });
  }

  // Init: hash change listener + initial check
  window.addEventListener('hashchange', checkAndRender);
  // Sveltia initial load — wait pro hash to populate
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(checkAndRender, 800));
  } else {
    setTimeout(checkAndRender, 800);
  }
})();
