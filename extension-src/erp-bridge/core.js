/* ── OptiBot — ERP Bridge Core Engine ────────────────────────────────── */

import { buildScrapingAliases, buildPecAliases, REJET_NOTE_ALIASES } from "./aliases.js";

/* ══════════════════════════════════════════════════════════════════════
 *  DEEP QUERY (Shadow DOM + iframes)
 * ══════════════════════════════════════════════════════════════════════ */

function querySelectorAllDeep(selector, root, depth) {
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
      } catch(e) { console.info("[OptiBot] iframe cross-origin ignorée :", iframes[fi].src || "(no src)"); }
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

/* ══════════════════════════════════════════════════════════════════════
 *  FIELD MATCHING
 * ══════════════════════════════════════════════════════════════════════ */

export function matchFieldAgainst(el, aliasDict) {
  var signals = collectSignals(el);
  var normalizedSignals = signals.map(normalizeAlias).join(" ");

  var bestField = null;
  var bestScore = 0;

  for (var field in aliasDict) {
    var aliases = aliasDict[field];
    for (var a = 0; a < aliases.length; a++) {
      var norm = normalizeAlias(aliases[a]);
      if (normalizedSignals.indexOf(norm) !== -1) {
        var score = norm.length;
        if (score > bestScore) {
          bestScore = score;
          bestField = field;
        }
      }
    }
  }

  return bestField;
}

/* ══════════════════════════════════════════════════════════════════════
 *  ALIASES (lazy init + learned merge)
 * ══════════════════════════════════════════════════════════════════════ */

var _scrapingAliases = null;
var _pecAliases = null;
var _autoDetectionActive = false;

export function getScrapingAliases() {
  if (!_scrapingAliases) _scrapingAliases = buildScrapingAliases();
  return _scrapingAliases;
}

export function getPecAliases() {
  if (!_pecAliases) _pecAliases = buildPecAliases();
  return _pecAliases;
}

function mergeAdapterAliases(adapter) {
  if (!adapter.aliases) return;
  var dict = getScrapingAliases();
  for (var field in adapter.aliases) {
    if (!dict[field]) dict[field] = [];
    var extras = adapter.aliases[field];
    for (var i = 0; i < extras.length; i++) {
      if (dict[field].indexOf(extras[i]) === -1) dict[field].push(extras[i]);
    }
  }
  if (!adapter.pecAliases) return;
  var pec = getPecAliases();
  for (var pf in adapter.pecAliases) {
    if (!pec[pf]) pec[pf] = [];
    var pe = adapter.pecAliases[pf];
    for (var j = 0; j < pe.length; j++) {
      if (pec[pf].indexOf(pe[j]) === -1) pec[pf].push(pe[j]);
    }
  }
}

/* ══════════════════════════════════════════════════════════════════════
 *  LEARNED ALIASES
 * ══════════════════════════════════════════════════════════════════════ */

export function loadLearnedAliases(adapter) {
  var hostname = window.location.hostname;
  chrome.storage.local.get(["optibot_learned_aliases_erp"], function(result) {
    var cached = result.optibot_learned_aliases_erp;
    if (cached && cached.ts && Date.now() - cached.ts < 60 * 60 * 1000) {
      mergeLearnedIntoDict(cached.aliases || {});
      return;
    }
    getSyncToken().then(function(token) {
      if (!token) return;
      fetch("https://optibot.fr/api/extension/smart-fill/aliases?hostname=" + encodeURIComponent(hostname))
        .then(function(r) { return r.json(); })
        .then(function(data) {
          var aliases = data.aliases || {};
          chrome.storage.local.set({ optibot_learned_aliases_erp: { aliases: aliases, ts: Date.now() } });
          mergeLearnedIntoDict(aliases);
        })
        .catch(function(err) { console.warn("[OptiBot] learned aliases fetch failed:", err); });
    });
  });
}

function mergeLearnedIntoDict(learned) {
  var scrape = getScrapingAliases();
  var pec = getPecAliases();
  for (var label in learned) {
    var field = learned[label];
    if (scrape[field] && scrape[field].indexOf(label) === -1) scrape[field].push(label);
    if (pec[field] && pec[field].indexOf(label) === -1) pec[field].push(label);
  }
}

export function sendLearnSignal(hostname, selector, label, oldVariable) {
  getSyncToken().then(function(syncToken) {
    if (!syncToken) return;
    fetch("https://optibot.fr/api/extension/smart-fill/learn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ syncToken: syncToken, hostname: hostname, selector: selector, label: label, oldVariable: oldVariable })
    }).catch(function(err) { console.warn("[OptiBot] learn signal failed:", err); });
  });
}

/* ══════════════════════════════════════════════════════════════════════
 *  SMART SCRAPE
 * ══════════════════════════════════════════════════════════════════════ */

var INPUT_SELECTOR = "input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=checkbox]):not([type=radio]):not([type=file]):not([type=image]):not([type=reset]), select, textarea";

function queryInputs(adapter) {
  var sel = adapter.inputSelector || INPUT_SELECTOR;
  return querySelectorAllDeep(sel);
}

export async function smartScrape(adapter) {
  var result = {};
  var dict = getScrapingAliases();
  var scanStart = performance.now();

  /* Hook pre-scrape */
  if (adapter.beforeScrape) {
    try { adapter.beforeScrape(); } catch(e) {}
  }

  /* 1. Inputs remplis */
  var inputs = queryInputs(adapter);

  /* Pre-cache labels */
  var labelMap = {};
  var labels = document.querySelectorAll("label[for]");
  for (var li = 0; li < labels.length; li++) {
    var forId = labels[li].getAttribute("for");
    if (forId) labelMap[forId] = labels[li].textContent.trim();
  }

  var CHUNK_SIZE = 40;
  for (var chunkStart = 0; chunkStart < inputs.length; chunkStart += CHUNK_SIZE) {
    var chunkEnd = Math.min(chunkStart + CHUNK_SIZE, inputs.length);

    for (var i = chunkStart; i < chunkEnd; i++) {
      var el = inputs[i];
      var val;
      if (el.tagName === "SELECT") {
        val = (el.options[el.selectedIndex] || {}).text || el.value || "";
      } else {
        val = el.value || "";
      }
      val = val.trim();
      if (!val || val.length > 200) continue;

      var field = matchFieldAgainst(el, dict);
      if (field && !result[field]) {
        result[field] = adapter.transformValue ? adapter.transformValue(field, val, el) : val;
      }
    }

    if (chunkEnd < inputs.length) {
      await new Promise(function(r) { setTimeout(r, 0); });
    }
  }

  /* 2. Conteneurs read-only */
  var roSel = adapter.readOnlySelectors || "dd, .field-value, [class*=value], [class*=display], [data-field], span.readonly, .form-control-plaintext";
  var containers = document.querySelectorAll(roSel);
  for (var t = 0; t < containers.length; t++) {
    var container = containers[t];
    var text = (container.textContent || "").trim();
    if (!text || text.length > 200 || text.length < 1) continue;
    var cf = matchFieldAgainst(container, dict);
    if (cf && !result[cf]) {
      result[cf] = adapter.transformValue ? adapter.transformValue(cf, text, container) : text;
    }
  }

  var scanDuration = Math.round(performance.now() - scanStart);
  if (scanDuration > 500) {
    console.info("[OptiBot] ERP scan: " + inputs.length + " fields in " + scanDuration + "ms");
  }

  /* Hook post-scrape */
  if (adapter.afterScrape) {
    try { adapter.afterScrape(result); } catch(e) {}
  }

  return result;
}

export async function isPatientPage(adapter) {
  /* Indicateurs rapides */
  if (adapter.patientPageIndicators && adapter.patientPageIndicators.length) {
    for (var p = 0; p < adapter.patientPageIndicators.length; p++) {
      if (document.querySelector(adapter.patientPageIndicators[p])) {
        var scraped = await smartScrape(adapter);
        return { isPatient: true, data: scraped, fieldCount: Object.keys(scraped).length };
      }
    }
  }
  /* Fallback : nombre de champs */
  var data = await smartScrape(adapter);
  var count = Object.keys(data).length;
  var min = adapter.minFieldsForPatientPage || 3;
  return { isPatient: count >= min, data: data, fieldCount: count };
}

export async function performScrape(adapter) {
  var check = await isPatientPage(adapter);
  if (!check.isPatient) return;

  var s = check.data;
  var cacheObj = {
    current: {
      nom: (s.nom || "").toUpperCase(),
      prenom: s.prenom || "",
      numeroSecuriteSociale: s.numeroSecuriteSociale || "",
      dateNaissance: s.dateNaissance || "",
      telephone: s.telephone || "",
      email: s.email || "",
      adresse: s.adresse || "",
      codePostal: s.codePostal || "",
      ville: s.ville || "",
      civilite: s.civilite || "",
      organisme: s.organisme || "",
      numeroAdherent: s.numeroAdherent || "",
      codeOrganisme: s.codeOrganisme || "",
      ordonnance: {
        rpps: s.rpps || "",
        nomOphtalmologue: s.nomOphtalmologue || "",
        dateOrdonnance: s.dateOrdonnance || "",
        lunettesOD: {
          sphere:   s["lunettesOD.sphere"]   || "",
          cylindre: s["lunettesOD.cylindre"] || "",
          axe:      s["lunettesOD.axe"]      || "",
          addition: s["lunettesOD.addition"] || "",
        },
        lunettesOG: {
          sphere:   s["lunettesOG.sphere"]   || "",
          cylindre: s["lunettesOG.cylindre"] || "",
          axe:      s["lunettesOG.axe"]      || "",
          addition: s["lunettesOG.addition"] || "",
        },
      },
      source: adapter.name,
      scrapedAt: Date.now(),
    }
  };

  await writeEncryptedCache(cacheObj);

  chrome.runtime.sendMessage({ type: "OPTIBOT_COSIUM_SCRAPED", fields: check.fieldCount });
  showToast("ERP \u2713 — " + check.fieldCount + " champs lus", "success", adapter);
}

/* ══════════════════════════════════════════════════════════════════════
 *  PEC INJECTION
 * ══════════════════════════════════════════════════════════════════════ */

export async function injectPEC(encryptedPec, adapter) {
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
      el.setAttribute("data-optibot-filled", field);
      el.setAttribute("data-optibot-value", pec[field]);
      filled++;
    }
  }

  if (filled > 0) {
    showToast("PEC inject\u00E9e \u2713 — " + filled + " champ(s)", "success", adapter);
    chrome.storage.local.remove("optibot_pec_pending");
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

/* ══════════════════════════════════════════════════════════════════════
 *  TOAST
 * ══════════════════════════════════════════════════════════════════════ */

export function showToast(message, type, adapter) {
  var existing = document.getElementById("optibot-erp-toast");
  if (existing) existing.remove();

  var prefix = adapter && adapter.displayName ? adapter.displayName + " — " : "";
  var toast = document.createElement("div");
  toast.id = "optibot-erp-toast";
  toast.textContent = prefix + message;
  var bg = type === "success" ? "#059669" : type === "warn" ? "#d97706" : "#dc2626";
  toast.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:2147483647;background:" + bg + ";color:white;padding:12px 20px;border-radius:12px;font:700 13px/1.4 -apple-system,BlinkMacSystemFont,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.15);opacity:0;transition:opacity .3s ease;";

  document.body.appendChild(toast);
  requestAnimationFrame(function() { toast.style.opacity = "1"; });
  setTimeout(function() {
    toast.style.opacity = "0";
    setTimeout(function() { toast.remove(); }, 300);
  }, 4000);
}

/* ══════════════════════════════════════════════════════════════════════
 *  AUTO-DETECTION & PASSIVE LEARNING
 * ══════════════════════════════════════════════════════════════════════ */

export function setupAutoDetection(adapter) {
  if (_autoDetectionActive) return;
  _autoDetectionActive = true;

  var scrapeTimer = null;
  var lastScrapeUrl = null;

  async function tryScrape() {
    var url = window.location.href;
    if (url === lastScrapeUrl) return;
    var check = await isPatientPage(adapter);
    if (check.isPatient) {
      lastScrapeUrl = url;
      performScrape(adapter);
    }
  }

  /* Scrape initial */
  setTimeout(tryScrape, adapter.scrapeDelay || 2000);

  /* MutationObserver */
  if (document.body) {
    var obs = new MutationObserver(function(mutations) {
      var hasNew = mutations.some(function(m) { return m.addedNodes.length > 0; });
      if (hasNew) {
        clearTimeout(scrapeTimer);
        scrapeTimer = setTimeout(tryScrape, adapter.observerDebounce || 1500);
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("pagehide", function() {
      if (obs) obs.disconnect();
    });
  }

  /* SPA navigation */
  window.addEventListener("popstate", function() { setTimeout(tryScrape, 1000); });
  window.addEventListener("hashchange", function() { setTimeout(tryScrape, 1000); });
}

export function setupPassiveLearning(adapter) {
  document.addEventListener("change", function(e) {
    var el = e.target;
    if (!el || !el.tagName || ["INPUT", "SELECT", "TEXTAREA"].indexOf(el.tagName) === -1) return;
    var filledVar = el.getAttribute("data-optibot-filled");
    if (!filledVar) return;
    var oldValue = el.getAttribute("data-optibot-value");
    if (el.value === oldValue) return;

    var signals = collectSignals(el);
    var label = normalizeAlias(
      signals.filter(function(s) { return s && s.length > 2 && s.length < 50; })[0]
      || el.name || el.id || ""
    );
    if (label) {
      sendLearnSignal(window.location.hostname, el.id || el.name || "", label, filledVar);
    }
  }, true);
}

export function setupMessageListeners(adapter) {
  chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg && msg.type === "OPTIBOT_INJECT_PEC") {
      injectPEC(msg.pecData, adapter).then(function(result) { sendResponse(result); });
      return true;
    }
    if (msg && msg.type === "OPTIBOT_INJECT_REJET_NOTE") {
      injectRejetNote(msg.note, adapter);
    }
  });
}

/* ══════════════════════════════════════════════════════════════════════
 *  INIT — called by index.js
 * ══════════════════════════════════════════════════════════════════════ */

export function initBridge(adapter) {
  mergeAdapterAliases(adapter);
  loadLearnedAliases(adapter);
  setupAutoDetection(adapter);
  setupPassiveLearning(adapter);
  setupMessageListeners(adapter);
}
