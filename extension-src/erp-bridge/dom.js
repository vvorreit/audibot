/* ── AudiBot — ERP Bridge: DOM utilities ─────────────────────────────── */
/* Deep query (Shadow DOM + iframes), normalisation, signal collection.   */

/* ══════════════════════════════════════════════════════════════════════
 *  DEEP QUERY (Shadow DOM + iframes)
 * ══════════════════════════════════════════════════════════════════════ */

export function querySelectorAllDeep(selector, root, depth) {
  root = root || document;
  depth = depth || 0;
  if (depth > 5) return [];
  var results = Array.from(root.querySelectorAll(selector));
  var all = root.querySelectorAll("*");
  for (var i = 0; i < all.length; i++) {
    if (all[i].shadowRoot) {
      results = results.concat(querySelectorAllDeep(selector, all[i].shadowRoot, depth + 1));
    }
  }
  if (root === document && depth === 0) {
    var iframes = document.querySelectorAll("iframe");
    for (var fi = 0; fi < iframes.length; fi++) {
      try {
        var iDoc = iframes[fi].contentDocument || (iframes[fi].contentWindow && iframes[fi].contentWindow.document);
        if (iDoc) results = results.concat(querySelectorAllDeep(selector, iDoc, depth + 1));
      } catch(e) { console.info("[AudiBot] iframe cross-origin ignorée :", iframes[fi].src || "(no src)"); }
    }
  }
  return results;
}

/* ══════════════════════════════════════════════════════════════════════
 *  NORMALISATION & SIGNAL COLLECTION
 * ══════════════════════════════════════════════════════════════════════ */

var _normalizeCache = {};

export function normalizeAlias(str) {
  var key = str || "";
  if (_normalizeCache[key] !== undefined) return _normalizeCache[key];
  var result = key
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s\-_\.\/]/g, "");
  _normalizeCache[key] = result;
  return result;
}

export function collectSignals(el) {
  var signals = [];

  /* 1. Attributs directs */
  var directAttrs = [
    el.name, el.id, el.placeholder, el.title,
    el.getAttribute("aria-label"),
    el.getAttribute("data-field"),
    el.getAttribute("data-name"),
    el.getAttribute("data-label"),
    el.getAttribute("data-testid"),
    el.getAttribute("data-bind"),
    el.getAttribute("data-key"),
    el.getAttribute("data-col"),
    el.getAttribute("formcontrolname"),
    el.getAttribute("ng-reflect-name"),
    el.getAttribute("ng-model"),
    el.getAttribute("v-model"),
    el.getAttribute("data-vv-as"),
    el.className,
  ];
  for (var i = 0; i < directAttrs.length; i++) {
    if (directAttrs[i]) signals.push(directAttrs[i]);
  }

  /* 2. Label via for= */
  var labelEl = el.id ? (el.getRootNode ? el.getRootNode() : document).querySelector('label[for="' + CSS.escape(el.id) + '"]') : null;

  /* 3. aria-labelledby */
  if (!labelEl) {
    var labelledby = el.getAttribute("aria-labelledby");
    if (labelledby) {
      var parts = labelledby.split(/\s+/).map(function(id) {
        var ref = document.getElementById(id);
        return ref ? ref.textContent.trim() : "";
      }).filter(Boolean);
      if (parts.length) signals.push(parts.join(" "));
    }
  }

  /* 4. Label parent ou ancetre */
  if (!labelEl && el.closest) {
    labelEl = el.closest("label");
    if (!labelEl && el.parentElement) {
      labelEl = el.parentElement.querySelector("label");
    }
  }

  /* 5. Sibling precedent (label, span, div, p, th, td, dt, legend) */
  if (!labelEl) {
    var prev = el.previousElementSibling;
    if (prev && /^(label|span|div|p|th|td|dt|legend)$/i.test(prev.tagName) && prev.textContent.trim().length < 60) {
      signals.push(prev.textContent.trim());
    }
  }

  /* 6. Cellule de tableau precedente */
  if (!labelEl) {
    var td = el.closest ? el.closest("td") : null;
    if (td) {
      var prevTd = td.previousElementSibling;
      if (prevTd && prevTd.textContent.trim().length < 60) {
        signals.push(prevTd.textContent.trim());
      }
    }
  }

  /* 7. Wrapper div/span avec class contenant field, form-group, input-group */
  if (!labelEl) {
    var wrapper = el.closest ? el.closest(".form-group, .field, .input-group, .form-field, .field-row, .form-row") : null;
    if (wrapper) {
      var wrapperLabel = wrapper.querySelector("label, .label, .field-label, .form-label, legend");
      if (wrapperLabel && wrapperLabel.textContent.trim().length < 60) {
        signals.push(wrapperLabel.textContent.trim());
      }
    }
  }

  if (labelEl) signals.push(labelEl.textContent.trim());

  /* 8. data-* attributs supplementaires */
  if (el.dataset) {
    var dataKeys = Object.keys(el.dataset);
    for (var dk = 0; dk < dataKeys.length; dk++) {
      var dv = el.dataset[dataKeys[dk]];
      if (dv && typeof dv === "string" && dv.length > 2 && dv.length < 50) {
        signals.push(dv);
      }
    }
  }

  return signals;
}
