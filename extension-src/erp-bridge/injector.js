/* ── AudiBot — ERP Bridge: PEC injection, ultra-fill, rejection notes ── */

import { normalizeAlias, collectSignals } from "./dom.js";
import { matchFieldAgainst } from "./matching.js";
import { showToast } from "./ui.js";
import { REJET_NOTE_ALIASES } from "./aliases.js";

/* ══════════════════════════════════════════════════════════════════════
 *  PEC INJECTION
 * ══════════════════════════════════════════════════════════════════════ */

export async function injectPEC(encryptedPec, adapter, getPecAliases, queryInputs) {
  var pec = await decryptData(encryptedPec);
  if (!pec) return { ok: false, error: "decrypt_failed" };

  var pecDict = getPecAliases();
  var inputs = queryInputs(adapter);
  var filled = 0;

  for (var i = 0; i < inputs.length; i++) {
    var el = inputs[i];
    var field = matchFieldAgainst(el, pecDict);
    if (field && pec[field]) {
      ultraFill(el, pec[field], adapter);
      el.setAttribute("data-audibot-filled", field);
      el.setAttribute("data-audibot-value", pec[field]);
      filled++;
    }
  }

  if (filled > 0) {
    showToast("PEC inject\u00E9e \u2713 — " + filled + " champ(s)", "success", adapter);
    chrome.storage.local.remove("audibot_pec_pending");
    return { ok: true, filled: filled };
  }
  showToast("Aucun champ PEC d\u00E9tect\u00E9 sur cette page", "warn", adapter);
  return { ok: false, error: "no_fields" };
}

export function injectRejetNote(noteText, adapter) {
  var inputs = document.querySelectorAll("textarea, input[type=text]");
  var target = null;

  for (var i = 0; i < inputs.length; i++) {
    var el = inputs[i];
    var signals = collectSignals(el);
    var normalizedSignals = signals.map(normalizeAlias).join(" ");
    for (var a = 0; a < REJET_NOTE_ALIASES.length; a++) {
      if (normalizedSignals.indexOf(normalizeAlias(REJET_NOTE_ALIASES[a])) !== -1) {
        target = el;
        break;
      }
    }
    if (target) break;
  }

  if (target) {
    var existing = target.value || "";
    var sep = existing ? "\n---\n" : "";
    ultraFill(target, existing + sep + noteText, adapter);
    showToast("Note rejet ajout\u00E9e dans le dossier", "success", adapter);
  } else {
    showToast("Rejet S\u00E9cu : " + noteText.substring(0, 80), "warn", adapter);
  }
}

/* ══════════════════════════════════════════════════════════════════════
 *  ULTRA FILL — Framework-aware value injection
 * ══════════════════════════════════════════════════════════════════════ */

export function ultraFill(el, val, adapter) {
  el.focus();
  el.dispatchEvent(new Event("focus", { bubbles: true }));

  /* Select element */
  if (el.tagName === "SELECT") {
    var best = null;
    var bestDist = Infinity;
    var target = (val || "").toLowerCase().trim();
    for (var oi = 0; oi < el.options.length; oi++) {
      var optText = (el.options[oi].text || "").toLowerCase().trim();
      var optVal = (el.options[oi].value || "").toLowerCase().trim();
      if (optText === target || optVal === target) { best = oi; break; }
      if (optText.indexOf(target) !== -1 || target.indexOf(optText) !== -1) {
        var dist = Math.abs(optText.length - target.length);
        if (dist < bestDist) { bestDist = dist; best = oi; }
      }
    }
    if (best !== null) {
      el.selectedIndex = best;
      el.dispatchEvent(new Event("change", { bubbles: true }));
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    el.dispatchEvent(new Event("blur", { bubbles: true }));
    return;
  }

  /* Native property setter (React/Angular/Vue) */
  var proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  var nativeSetter = Object.getOwnPropertyDescriptor(proto, "value");
  if (nativeSetter && nativeSetter.set) {
    nativeSetter.set.call(el, val);
  } else {
    el.value = val;
  }

  /* Events */
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new InputEvent("input", { bubbles: true, data: val, inputType: "insertText" }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  el.dispatchEvent(new Event("blur", { bubbles: true }));
}
