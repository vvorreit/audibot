/* ── OptiBot Pre-Submit Validation Overlay ──────────────────────────────── */
/* Displays validation results before form submission.                      */

var OVERLAY_ID = "optibot-presubmit-overlay";
var BACKDROP_ID = "optibot-presubmit-backdrop";

/* ── Show Overlay ───────────────────────────────────────────────────────── */

export function showPreSubmitOverlay(results, onCorrect, onSubmitAnyway) {
  /* Remove any existing overlay first */
  hidePreSubmitOverlay();

  var hasErrors = results.errors.length > 0;

  /* ── Backdrop ────────────────────────────────────────────────────────── */
  var backdrop = document.createElement("div");
  backdrop.id = BACKDROP_ID;
  backdrop.style.cssText = [
    "position: fixed; inset: 0; z-index: 2147483646;",
    "background: rgba(0,0,0,0.45);",
    "transition: opacity 0.2s;",
  ].join(" ");

  /* ── Card ────────────────────────────────────────────────────────────── */
  var card = document.createElement("div");
  card.id = OVERLAY_ID;
  card.style.cssText = [
    "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);",
    "z-index: 2147483647;",
    "background: #ffffff; color: #1a1a1a;",
    "border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);",
    "padding: 28px 32px; max-width: 560px; width: 90vw; max-height: 80vh;",
    "overflow-y: auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;",
    "font-size: 14px; line-height: 1.5;",
  ].join(" ");

  /* ── Title ───────────────────────────────────────────────────────────── */
  var title = document.createElement("h2");
  title.style.cssText = "margin: 0 0 18px 0; font-size: 18px; font-weight: 700; color: #1a1a1a;";
  title.textContent = "\u26A0\uFE0F OptiBot \u2014 V\u00E9rification pr\u00E9-soumission";
  card.appendChild(title);

  /* ── Results list ────────────────────────────────────────────────────── */
  function addSection(items, icon, color, label) {
    if (items.length === 0) return;
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var row = document.createElement("div");
      row.style.cssText = [
        "display: flex; align-items: flex-start; gap: 10px;",
        "padding: 10px 12px; margin-bottom: 6px;",
        "background: " + color + "; border-radius: 8px;",
      ].join(" ");

      var iconSpan = document.createElement("span");
      iconSpan.style.cssText = "flex-shrink: 0; font-size: 16px; line-height: 1.4;";
      iconSpan.textContent = icon;
      row.appendChild(iconSpan);

      var textDiv = document.createElement("div");
      textDiv.style.cssText = "flex: 1; min-width: 0;";

      var nameSpan = document.createElement("strong");
      nameSpan.textContent = item.name;
      nameSpan.style.cssText = "display: block; font-size: 13px; margin-bottom: 2px;";
      textDiv.appendChild(nameSpan);

      var msgSpan = document.createElement("span");
      msgSpan.textContent = item.message;
      msgSpan.style.cssText = "display: block; font-size: 13px; color: #444;";
      textDiv.appendChild(msgSpan);

      if (item.fix) {
        var fixSpan = document.createElement("span");
        fixSpan.textContent = "\u2192 " + item.fix;
        fixSpan.style.cssText = "display: block; font-size: 12px; color: #666; margin-top: 3px; font-style: italic;";
        textDiv.appendChild(fixSpan);
      }

      row.appendChild(textDiv);
      card.appendChild(row);
    }
  }

  addSection(results.errors, "\u274C", "rgba(239,68,68,0.08)", "Erreurs");
  addSection(results.warnings, "\u26A0\uFE0F", "rgba(245,158,11,0.08)", "Avertissements");
  addSection(results.passed, "\u2705", "rgba(16,185,129,0.06)", "OK");

  /* ── Buttons ─────────────────────────────────────────────────────────── */
  var btnRow = document.createElement("div");
  btnRow.style.cssText = "display: flex; gap: 12px; margin-top: 20px; justify-content: flex-end;";

  /* Corriger button */
  var btnCorrect = document.createElement("button");
  btnCorrect.type = "button";
  btnCorrect.textContent = "Corriger";
  btnCorrect.style.cssText = [
    "padding: 10px 24px; border: none; border-radius: 8px; cursor: pointer;",
    "font-size: 14px; font-weight: 600; font-family: inherit;",
    "background: #7c3aed; color: #fff;",
    "transition: background 0.2s;",
  ].join(" ");
  btnCorrect.onmouseover = function() { btnCorrect.style.background = "#6d28d9"; };
  btnCorrect.onmouseout = function() { btnCorrect.style.background = "#7c3aed"; };
  btnCorrect.onclick = function() {
    hidePreSubmitOverlay();
    if (typeof onCorrect === "function") onCorrect();
  };

  /* Soumettre quand meme button */
  var btnSubmit = document.createElement("button");
  btnSubmit.type = "button";
  btnSubmit.textContent = "Soumettre quand m\u00EAme";
  btnSubmit.style.cssText = [
    "padding: 10px 24px; border: 1px solid #d1d5db; border-radius: 8px; cursor: pointer;",
    "font-size: 14px; font-weight: 600; font-family: inherit;",
    "background: #fff; color: #374151;",
    "transition: all 0.2s;",
  ].join(" ");

  if (hasErrors) {
    /* Grey out for 3 seconds when there are errors */
    btnSubmit.disabled = true;
    btnSubmit.style.opacity = "0.4";
    btnSubmit.style.cursor = "not-allowed";
    btnSubmit.style.color = "#9ca3af";
    setTimeout(function() {
      btnSubmit.disabled = false;
      btnSubmit.style.opacity = "1";
      btnSubmit.style.cursor = "pointer";
      btnSubmit.style.color = "#374151";
    }, 3000);
  }

  btnSubmit.onmouseover = function() {
    if (!btnSubmit.disabled) btnSubmit.style.background = "#f3f4f6";
  };
  btnSubmit.onmouseout = function() {
    if (!btnSubmit.disabled) btnSubmit.style.background = "#fff";
  };
  btnSubmit.onclick = function() {
    if (btnSubmit.disabled) return;
    hidePreSubmitOverlay();
    if (typeof onSubmitAnyway === "function") onSubmitAnyway();
  };

  btnRow.appendChild(btnCorrect);
  btnRow.appendChild(btnSubmit);
  card.appendChild(btnRow);

  /* ── Append to page ──────────────────────────────────────────────────── */
  document.body.appendChild(backdrop);
  document.body.appendChild(card);

  /* Close on backdrop click */
  backdrop.onclick = function() {
    hidePreSubmitOverlay();
    if (typeof onCorrect === "function") onCorrect();
  };

  /* Close on Escape */
  card._escHandler = function(e) {
    if (e.key === "Escape") {
      hidePreSubmitOverlay();
      if (typeof onCorrect === "function") onCorrect();
    }
  };
  document.addEventListener("keydown", card._escHandler);
}

/* ── Hide Overlay ───────────────────────────────────────────────────────── */

export function hidePreSubmitOverlay() {
  var card = document.getElementById(OVERLAY_ID);
  if (card) {
    if (card._escHandler) {
      document.removeEventListener("keydown", card._escHandler);
    }
    card.remove();
  }
  var backdrop = document.getElementById(BACKDROP_ID);
  if (backdrop) backdrop.remove();
}
