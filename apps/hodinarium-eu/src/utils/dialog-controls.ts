/**
 * `attachDialogControls` — sjednocený handler pro `<dialog>` modaly
 * (open/close + Escape + click-outside-to-close).
 *
 * Před tímto modulem byl identický pattern duplicitní v `SearchModal.astro`
 * a `ReportIssueModal.astro` (TD2 v `docs/tech-debt-hodinarium-2026-05-08.md`).
 * Oba modaly měly:
 *   - `openModal()` / `closeModal()` wrappery kolem `dialog.showModal()`
 *     / `dialog.close()`
 *   - `dialog.addEventListener('click', e => if (e.target === dialog) close)`
 *     pro click-outside (byte-for-byte identický)
 *   - `document.addEventListener('keydown', e => if (e.key === 'Escape') close)`
 *
 * Vrací `{ open, close }` API pro callers, kteří potřebují ovládat modal
 * z keyboard shortcutů nebo result clicks (např. SearchModal v navu).
 *
 * Helper neřeší focus management uvnitř modalu (init focus, restore na
 * close, focus trap) — `<dialog>` element ze HTML5 to dělá native přes
 * `showModal()`. Volitelný `onOpen` callback nese init focus logiku, kde
 * je třeba.
 */
export interface DialogControlsOptions {
  /** Element, jehož klik otevře modal (typicky FAB / nav button). */
  trigger?: HTMLElement | null;

  /** Ostatní triggery, které všechny otevřou modal (data-* selectory). */
  triggers?: NodeListOf<Element> | Element[];

  /** Buttons uvnitř modalu, které ho zavřou (close + cancel + apod.). */
  closeBtns?: (HTMLElement | null)[];

  /**
   * Volitelný callback po otevření modalu — vhodné pro init focus,
   * reset form state apod.
   */
  onOpen?: () => void;

  /** Volitelný callback po zavření modalu — vhodné pro state reset. */
  onClose?: () => void;

  /**
   * Když true, klik mimo content (na `<dialog>` backdrop) modal nezavírá.
   * Default false (= klik mimo zavírá).
   */
  noClickOutside?: boolean;

  /**
   * Když true, Escape se nezachytí na document (dialog default beztoho
   * Escape zavírá). Default false. Tento ne-default přístup tu je pro
   * kompatibilitu s legacy zavoláním v Base.astro CMS hydraci.
   */
  noEscapeHandler?: boolean;
}

export interface DialogControls {
  open: () => void;
  close: () => void;
}

export function attachDialogControls(
  dialog: HTMLDialogElement,
  opts: DialogControlsOptions = {},
): DialogControls {
  function open() {
    if (!dialog.open) dialog.showModal();
    opts.onOpen?.();
  }

  function close() {
    if (dialog.open) dialog.close();
    opts.onClose?.();
  }

  // Trigger(s) → open
  if (opts.trigger) {
    opts.trigger.addEventListener('click', (e) => {
      e.preventDefault();
      open();
    });
  }
  if (opts.triggers) {
    for (const el of Array.from(opts.triggers)) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        open();
      });
    }
  }

  // Close buttons → close
  if (opts.closeBtns) {
    for (const btn of opts.closeBtns) {
      if (!btn) continue;
      btn.addEventListener('click', close);
    }
  }

  // Click-outside (na `<dialog>` element samotný = backdrop area)
  if (!opts.noClickOutside) {
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) close();
    });
  }

  // Escape (jako pojistka — `<dialog>` default Escape zavírá taky,
  // ale callers někdy chtějí state reset přes onClose).
  if (!opts.noEscapeHandler) {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dialog.open) close();
    });
  }

  return { open, close };
}
