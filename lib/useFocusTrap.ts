import { useEffect, useRef } from "react";

/**
 * Hook focus trap pour les modales (WCAG 2.4.3).
 * Piège le focus à l'intérieur du conteneur, cycle Tab/Shift+Tab,
 * et appelle onClose sur Escape.
 */
export function useFocusTrap(active: boolean, onClose?: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;
    const el = ref.current;
    if (!el) return;

    const sel = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const first = el.querySelector<HTMLElement>(sel);
    first?.focus();

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose?.(); return; }
      if (e.key !== "Tab") return;

      const focusable = Array.from(el.querySelectorAll<HTMLElement>(sel));
      if (focusable.length === 0) return;

      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [active, onClose]);

  return ref;
}
