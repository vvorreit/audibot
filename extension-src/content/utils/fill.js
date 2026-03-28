/* ── Fill Utility Functions ─────────────────────────────────────────────── */

import { normalizeDateValue, fieldHasValue } from "./format.js";
import { levenshtein } from "./field-matching.js";

export function ultraFill(el, val, opts) {
  if (!el || val === undefined || val === null || val === "") return;
  /* Skip si le champ a déjà une valeur (sauf si force: true) */
  if (!(opts && opts.force)) {
    var existing = (el.value || "").trim();
    if (existing.length > 0) return;
  }
  el.focus();

  /* Setter natif pour contourner Vue 3 / React qui override .value */
  var proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype
            : el instanceof HTMLSelectElement ? HTMLSelectElement.prototype
            : HTMLInputElement.prototype;
  var nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value');
  if (nativeSetter && nativeSetter.set) {
    nativeSetter.set.call(el, val);
  } else {
    el.value = val;
  }

  /* Simuler une vraie frappe pour React/Vue (keydown + input + keyup par caractère) */
  var strVal = String(val);
  el.dispatchEvent(new Event('focus', { bubbles: true }));
  for (var i = 0; i < strVal.length; i++) {
    var ch = strVal[i];
    el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: ch, charCode: ch.charCodeAt(0), keyCode: ch.charCodeAt(0) }));
    el.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, key: ch, charCode: ch.charCodeAt(0), keyCode: ch.charCodeAt(0) }));
    el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: ch, charCode: ch.charCodeAt(0), keyCode: ch.charCodeAt(0) }));
  }
  el.dispatchEvent(new InputEvent('input', { bubbles: true, data: strVal, inputType: 'insertText' }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.dispatchEvent(new Event('blur', { bubbles: true }));

  if (window.$ && window.$(el).trigger) {
    window.$(el).val(val).trigger('input').trigger('change').trigger('keyup');
  }
}

/**
 * Tente de remplir un champ. Si le sélecteur ne trouve rien,
 * observe le DOM pendant 3s et réessaie dès qu'un champ apparaît.
 * Utile pour les SPA React/Next/Angular où les champs arrivent en async.
 */
export function ultraFillWithRetry(selector, value, opts) {
  var el = document.querySelector(selector);
  if (el) { ultraFill(el, value, opts); return; }

  var timeout;
  var observer = new MutationObserver(function() {
    var found = document.querySelector(selector);
    if (found) {
      observer.disconnect();
      clearTimeout(timeout);
      ultraFill(found, value, opts);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  /* Auto-disconnect après 3s pour éviter les fuites mémoire */
  timeout = setTimeout(function() {
    observer.disconnect();
  }, 3000);
}

/* ── smartSelectOption() — fuzzy matching pour <select> ─────────────────── */
export function smartSelectOption(selectEl, targetValue) {
  if (!selectEl || selectEl.tagName !== "SELECT" || !targetValue) return false;
  var target = (targetValue + "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  var options = Array.from(selectEl.options);
  var bestScore = 0;
  var bestOption = null;

  for (var i = 0; i < options.length; i++) {
    var optText = (options[i].text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    var optVal = (options[i].value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    var score = 0;

    /* Exact match = 100pts */
    if (optText === target || optVal === target) { score = 100; }
    /* Contains = 80pts */
    else if (optText.indexOf(target) !== -1 || target.indexOf(optText) !== -1) { score = 80; }
    else if (optVal.indexOf(target) !== -1 || target.indexOf(optVal) !== -1) { score = 80; }
    /* Levenshtein <= 3 = 60pts */
    else {
      var dist = levenshtein(optText, target);
      if (dist <= 3) score = 60;
      else {
        dist = levenshtein(optVal, target);
        if (dist <= 3) score = 60;
      }
    }

    if (score > bestScore) { bestScore = score; bestOption = options[i]; }
    if (score === 100) break;
  }

  if (bestScore >= 40 && bestOption) {
    selectEl.value = bestOption.value;
    selectEl.dispatchEvent(new Event("change", { bubbles: true }));
    selectEl.dispatchEvent(new Event("input", { bubbles: true }));
    return true;
  }
  return false;
}

/* ── fillDatePicker() — support datepicker libraries ──────────────────── */
export async function fillDatePicker(el, dateStr) {
  if (!el || !dateStr) return false;

  /* 1. Flatpickr */
  try {
    if (el._flatpickr && el._flatpickr.setDate) {
      el._flatpickr.setDate(dateStr, true);
      return true;
    }
  } catch(e) {}

  /* 2. Pikaday */
  try {
    if (el._pikaday && el._pikaday.setDate) {
      var parts = dateStr.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
      if (parts) {
        el._pikaday.setDate(new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1])));
        return true;
      }
    }
  } catch(e) {}

  /* 3. jQuery UI datepicker */
  try {
    if (window.jQuery && window.jQuery(el).datepicker) {
      window.jQuery(el).datepicker("setDate", dateStr);
      return true;
    }
  } catch(e) {}

  /* 4. Angular Material mat-form-field — frappe lente caractère par caractère */
  try {
    var matField = el.closest && el.closest("mat-form-field, .mat-form-field, .mat-mdc-form-field");
    if (matField) {
      el.focus();
      el.click();
      el.value = "";
      el.dispatchEvent(new Event("input", { bubbles: true }));
      var chars = dateStr.replace(/\D/g, "");
      for (var ci = 0; ci < chars.length; ci++) {
        var ch = chars[ci];
        el.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: ch, code: "Digit" + ch, keyCode: 48 + parseInt(ch) }));
        el.dispatchEvent(new KeyboardEvent("keypress", { bubbles: true, key: ch, charCode: ch.charCodeAt(0) }));
        el.dispatchEvent(new InputEvent("input", { bubbles: true, data: ch, inputType: "insertText" }));
        el.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, key: ch, code: "Digit" + ch, keyCode: 48 + parseInt(ch) }));
        await new Promise(function(r) { setTimeout(r, 60); });
      }
      el.dispatchEvent(new Event("change", { bubbles: true }));
      el.dispatchEvent(new Event("blur", { bubbles: true }));
      if (el.value !== "") return true;
    }
  } catch(e) {}

  /* 5. Fallback ultraFill */
  ultraFill(el, dateStr);
  return (el.value || "") !== "";
}

export function selectRadixOption(selectName, value) {
  /* Radix Vue : cliquer le trigger puis l'option dans le portal */
  const hiddenSelect = document.querySelector('select[name="' + selectName + '"]');
  if (!hiddenSelect) return;
  const formField = hiddenSelect.closest(".space-y-2");
  if (!formField) return;
  const trigger = formField.querySelector('[role="combobox"]');
  if (!trigger) return;
  trigger.click();
  setTimeout(function() {
    var allOptions = document.querySelectorAll('[role="option"]');
    for (var i = 0; i < allOptions.length; i++) {
      var opt = allOptions[i];
      var optValue = opt.getAttribute("data-value") || "";
      var optText = (opt.textContent || "").trim().toLowerCase();
      if (optValue === value || optText === value) {
        opt.click();
        return;
      }
    }
    /* Fallback : essai via le hidden select natif */
    hiddenSelect.value = value;
    hiddenSelect.dispatchEvent(new Event("change", { bubbles: true }));
  }, 300);
}

/* Tente de remplir un champ avec toutes les stratégies disponibles */
export async function smartFillField(el, value, isDateField) {
  if (!el || value === undefined || value === null || String(value).trim() === "") return false;

  var dateNorm = isDateField ? normalizeDateValue(value) : null;
  var displayVal = dateNorm ? dateNorm.display : String(value);

  /* ── SELECT → smartSelectOption fuzzy ── */
  if (el.tagName === "SELECT") {
    return smartSelectOption(el, displayVal);
  }

  /* ── Date picker libraries (Flatpickr, Pikaday, jQuery UI, Angular Material) ── */
  if (isDateField) {
    try {
      var dpResult = await fillDatePicker(el, displayVal);
      if (dpResult) return true;
    } catch(e) {}
  }

  /* ── Stratégie 0 : input[type=date] → format ISO direct ── */
  if (el.type === "date" && dateNorm && dateNorm.iso) {
    try {
      var setter0 = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
      if (setter0 && setter0.set) setter0.set.call(el, dateNorm.iso);
      else el.value = dateNorm.iso;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      if (fieldHasValue(el, dateNorm.iso)) return true;
    } catch(e) {}
  }

  /* ── Stratégie 1 : ultraFill standard (natif setter + events + jQuery) ── */
  try {
    ultraFill(el, displayVal);
    if (fieldHasValue(el, displayVal)) return true;
  } catch(e) {}

  /* ── Stratégie 2 : setAttribute value + dispatchEvent InputEvent ── */
  try {
    el.setAttribute("value", displayVal);
    el.dispatchEvent(new InputEvent("input", { bubbles: true, data: displayVal, inputType: "insertText" }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    if (fieldHasValue(el, displayVal)) return true;
  } catch(e) {}

  /* ── Stratégie 3 : document.execCommand (deprecated mais marche encore sur certains portails) ── */
  try {
    el.focus();
    el.select();
    document.execCommand("selectAll", false, null);
    document.execCommand("insertText", false, displayVal);
    el.dispatchEvent(new Event("change", { bubbles: true }));
    if (fieldHasValue(el, displayVal)) return true;
  } catch(e) {}

  /* ── Stratégie 4 : Paste event (certains frameworks n'écoutent que ça) ── */
  try {
    el.focus();
    var dt = new DataTransfer();
    dt.setData("text/plain", displayVal);
    var pasteEvt = new ClipboardEvent("paste", { bubbles: true, cancelable: true, clipboardData: dt });
    el.dispatchEvent(pasteEvt);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    if (fieldHasValue(el, displayVal)) return true;
  } catch(e) {}

  /* ── Stratégie 5 : Angular NgControl (Reactive Forms / __ngContext__) ── */
  try {
    var ngCtx = el.__ngContext__ || (el._elementRef && el._elementRef.nativeElement && el._elementRef.nativeElement.__ngContext__);
    if (ngCtx) {
      var dir = Array.isArray(ngCtx) ? ngCtx.find(function(c) { return c && c.control; }) : ngCtx;
      if (dir && dir.control && dir.control.setValue) {
        dir.control.setValue(isDateField ? displayVal : displayVal, { emitEvent: true });
        dir.control.markAsDirty();
        dir.control.markAsTouched();
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        if (fieldHasValue(el, displayVal) || (dir.control.value && String(dir.control.value).trim() !== "")) return true;
      }
    }
  } catch(e) {}

  /* ── Stratégie 6 : Vue 3 __vModelDirective / __vueParentComponent ── */
  try {
    var vueInst = el.__vueParentComponent;
    if (vueInst && vueInst.props && vueInst.emit) {
      vueInst.emit("update:modelValue", displayVal);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      if (fieldHasValue(el, displayVal)) return true;
    }
    /* Vue 2 */
    var vue2 = el.__vue__;
    if (vue2 && vue2.$emit) {
      vue2.$emit("input", displayVal);
      if (fieldHasValue(el, displayVal)) return true;
    }
  } catch(e) {}

  /* ── Stratégie 7 : Flatpickr ── */
  try {
    if (el._flatpickr && el._flatpickr.setDate && dateNorm && dateNorm.dd) {
      el._flatpickr.setDate(dateNorm.display, true, "d/m/Y");
      if (fieldHasValue(el, dateNorm.display)) return true;
    }
  } catch(e) {}

  /* ── Stratégie 8 : Radzen / Blazor (date) — via l'input visible dans le shadow DOM ── */
  try {
    if (isDateField) {
      var shadow = el.shadowRoot || (el.parentElement && el.parentElement.shadowRoot);
      var shadowInput = shadow && shadow.querySelector("input");
      if (shadowInput) {
        ultraFill(shadowInput, displayVal);
        if (fieldHasValue(shadowInput, displayVal)) return true;
      }
    }
  } catch(e) {}

  /* ── Stratégie 9 : Simulation frappe dans un date picker custom (clic + effacement + saisie) ── */
  if (isDateField && dateNorm && dateNorm.dd) {
    try {
      el.focus();
      el.click();
      /* Effacer le champ */
      el.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "a", ctrlKey: true }));
      el.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Delete" }));
      el.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Backspace" }));
      el.value = "";

      /* Taper la date chiffre par chiffre */
      var dateStr = dateNorm.dd + dateNorm.mm + dateNorm.yyyy;
      for (var ci = 0; ci < dateStr.length; ci++) {
        var ch = dateStr[ci];
        el.dispatchEvent(new KeyboardEvent("keydown",  { bubbles: true, key: ch, code: "Digit" + ch, keyCode: 48 + parseInt(ch) }));
        el.dispatchEvent(new KeyboardEvent("keypress", { bubbles: true, key: ch, code: "Digit" + ch, keyCode: 48 + parseInt(ch) }));
        el.dispatchEvent(new KeyboardEvent("keyup",    { bubbles: true, key: ch, code: "Digit" + ch, keyCode: 48 + parseInt(ch) }));
      }
      el.dispatchEvent(new Event("input",  { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      el.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Tab" }));
      await new Promise(function(r) { setTimeout(r, 100); });
      if (fieldHasValue(el, dateNorm.display) || el.value !== "") return true;
    } catch(e) {}
  }

  /* ── Stratégie 9b : date picker avec icône calendrier — cliquer l'icône puis taper ── */
  if (isDateField && dateNorm && dateNorm.dd) {
    try {
      /* Chercher l'icône calendrier associée (bouton ou span adjacent) */
      var parent = el.parentElement || el.closest(".input-group") || el.closest(".date-field");
      var calIcon = parent && (
        parent.querySelector('button[class*="calendar"], button[aria-label*="date"], button[aria-label*="calendrier"], .calendar-icon, .datepicker-toggle, [class*="datepicker-btn"]') ||
        parent.querySelector('button, [role="button"]')
      );
      if (calIcon) {
        calIcon.click();
        await new Promise(function(r) { setTimeout(r, 300); });
        /* Chercher les champs jour/mois/année dans le picker ouvert */
        var pickerInputs = document.querySelectorAll('.datepicker input, .calendar input, [class*="datepicker"] input, [role="dialog"] input');
        if (pickerInputs.length >= 3) {
          ultraFill(pickerInputs[0], dateNorm.dd);
          ultraFill(pickerInputs[1], dateNorm.mm);
          ultraFill(pickerInputs[2], dateNorm.yyyy);
        } else if (pickerInputs.length === 1) {
          ultraFill(pickerInputs[0], dateNorm.display);
        }
        /* Fermer le picker */
        document.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Escape" }));
        await new Promise(function(r) { setTimeout(r, 200); });
        if (el.value !== "") return true;
      }
    } catch(e) {}
  }

  /* ── Stratégie 10 : <select> — smartSelectOption fuzzy ── */
  if (el.tagName === "SELECT") {
    try {
      if (smartSelectOption(el, displayVal)) return true;
    } catch(e) {}
  }

  /* ── Stratégie 11 : contenteditable (éditeurs rich text) ── */
  try {
    if (el.getAttribute("contenteditable") === "true" || el.contentEditable === "true") {
      el.focus();
      el.textContent = displayVal;
      el.dispatchEvent(new InputEvent("input", { bubbles: true, data: displayVal, inputType: "insertText" }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      el.dispatchEvent(new Event("blur",   { bubbles: true }));
      if (el.textContent.trim() !== "") return true;
    }
  } catch(e) {}

  /* ── Stratégie 12 : React internal fiber (__reactFiber / __reactProps) ── */
  try {
    var fiberKey = Object.keys(el).find(function(k) { return k.startsWith("__reactFiber") || k.startsWith("__reactInternalInstance"); });
    var propsKey = Object.keys(el).find(function(k) { return k.startsWith("__reactProps"); });
    if (propsKey && el[propsKey]) {
      var props = el[propsKey];
      if (typeof props.onChange === "function") {
        var ns = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
        if (ns && ns.set) ns.set.call(el, displayVal); else el.value = displayVal;
        props.onChange({ target: el, currentTarget: el, bubbles: true, type: "change" });
        if (fieldHasValue(el, displayVal)) return true;
      }
    }
  } catch(e) {}

  /* ── Stratégie 13 : Svelte ($$ / __svelte) ── */
  try {
    if (el.__svelte_meta || el.$$) {
      var svelteNs = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
      if (svelteNs && svelteNs.set) svelteNs.set.call(el, displayVal); else el.value = displayVal;
      el.dispatchEvent(new Event("input",  { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      if (fieldHasValue(el, displayVal)) return true;
    }
  } catch(e) {}

  /* ── Stratégie 14 : Force brute — setter direct sans vérification ── */
  try {
    el.value = displayVal;
    el.dispatchEvent(new Event("input",  { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur",   { bubbles: true }));
    return fieldHasValue(el, displayVal);
  } catch(e) {}

  return false;
}
