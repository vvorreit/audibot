/* ── AudiBot — ERP Bridge: UI (toast notifications) ──────────────────── */

/* ══════════════════════════════════════════════════════════════════════
 *  TOAST
 * ══════════════════════════════════════════════════════════════════════ */

export function showToast(message, type, adapter) {
  var existing = document.getElementById("audibot-erp-toast");
  if (existing) existing.remove();

  var prefix = adapter && adapter.displayName ? adapter.displayName + " — " : "";
  var toast = document.createElement("div");
  toast.id = "audibot-erp-toast";
  toast.textContent = prefix + message;
  var bg = type === "success" ? "#059669" : type === "warn" ? "#d97706" : "#dc2626";
  /* Positionner au-dessus des boutons AudiBot si disponible */
  var toastBottom = (typeof globalThis.getToastBottom === "function") ? globalThis.getToastBottom() : 150;
  toast.style.cssText = "position:fixed;bottom:" + toastBottom + "px;right:20px;z-index:2147483647;background:" + bg + ";color:white;padding:12px 20px;border-radius:12px;font:700 13px/1.4 -apple-system,BlinkMacSystemFont,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.15);opacity:0;transition:opacity .3s ease;";

  document.body.appendChild(toast);
  requestAnimationFrame(function() { toast.style.opacity = "1"; });
  setTimeout(function() {
    toast.style.opacity = "0";
    setTimeout(function() { toast.remove(); }, 300);
  }, 4000);
}
