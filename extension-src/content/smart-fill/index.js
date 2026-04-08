/* ── Smart Fill — performSmartFill + helpers ───────────────────────────── */

import { querySelectorAllDeep } from "../utils/dom.js";
import { getSmartFillData, getCachedClient } from "../utils/data.js";
import { ultraFill, smartFillField, smartSelectOption } from "../utils/fill.js";
import { getCachedSelector, setCachedSelector, saveSelectorCache } from "../utils/selector-cache.js";
import { getFieldLabel, normalizeLabel, normalizeAlias, scoreFieldMatch, matchSmartField, clearMatchingCache, preCacheLabelMap, loadLearnedWeights } from "../utils/field-matching.js";
import { formatOpticalValue, normalizeDateValue, fieldHasValue, VALUE_NORMALIZERS, OPTICAL_FIELD_KEYS } from "../utils/format.js";
import { SMART_FILL_ALIASES, SMART_FILL_BLACKLIST, detectPageContext } from "../utils/data.js";
import { markFilledByAudiBot } from "./learning.js";

/* Fonctions definies dans content/index.js et exposees via globalThis */
var showRPAToast = function() { return globalThis.showRPAToast ? globalThis.showRPAToast.apply(null, arguments) : undefined; };
var checkDroitsMutuelle = function(d) { return globalThis.checkDroitsMutuelle ? globalThis.checkDroitsMutuelle(d) : undefined; };

var _performingSmartFill = false;

export async function performSmartFill() {
  if (_performingSmartFill) return;
  _performingSmartFill = true;
  try {
  var fillData = await getSmartFillData();
  if (!fillData.nom && !fillData.numeroSecuriteSociale && !fillData.numeroAdherent) {
    showRPAToast("Aucune donn\u00E9e patient en m\u00E9moire. Scannez d'abord une ordonnance.", "error");
    return;
  }

  /* Amélioration 6 : ne pas remplir les pages de login */
  if (detectPageContext() === "login") return;

  /* Vérification droits mutuelle */
  checkDroitsMutuelle(fillData);

  var INPUT_SELECTOR = "input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=checkbox]):not([type=radio]):not([type=file]):not([readonly]), select:not([disabled]), textarea:not([readonly])";

  /* Collecter les inputs du document principal + iframes + shadow DOM */
  var inputList = querySelectorAllDeep(INPUT_SELECTOR);
  var filled = 0;
  var probable = 0;
  var fillReport = { ts: Date.now(), hostname: window.location.hostname, filled: [], warned: [], skipped: [], failed: [] };

  var currentHostname = window.location.hostname;

  /* ── Pre-cache labels & clear Levenshtein memo for this run ─────────── */
  if (typeof clearMatchingCache === "function") clearMatchingCache();
  if (typeof preCacheLabelMap === "function") preCacheLabelMap();
  /* V3-3: load learned weights for score recalibration */
  if (typeof loadLearnedWeights === "function") loadLearnedWeights();

  /* V3-5: read preview-before-fill setting */
  var settings = await new Promise(function(r) { chrome.storage.local.get(["audibot_settings"], function(res) { r(res.audibot_settings || {}); }); });
  var previewEnabled = settings.previewBeforeFill || false;

  /* ── Scanning indicator for large pages ─────────────────────────────── */
  if (inputList.length > 100) {
    var scanToast = document.createElement("div");
    scanToast.id = "audibot-scan-progress";
    scanToast.textContent = "Scan en cours\u2026 (" + inputList.length + " champs)";
    scanToast.style.cssText = "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:2147483647;background:#1e293b;color:white;padding:8px 16px;border-radius:8px;font:500 12px/1.4 -apple-system,BlinkMacSystemFont,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,.15);opacity:0;transition:opacity .3s;";
    document.body.appendChild(scanToast);
    requestAnimationFrame(function() { scanToast.style.opacity = "1"; });
  }

  /* ── Chunked async processing to avoid blocking main thread ────────── */
  var CHUNK_SIZE = 40;
  var scanStart = performance.now();
  /* V3-5: build a fill plan for preview mode */
  var fillPlan = [];

  for (var chunkStart = 0; chunkStart < inputList.length; chunkStart += CHUNK_SIZE) {
    var chunkEnd = Math.min(chunkStart + CHUNK_SIZE, inputList.length);

    for (var idx = chunkStart; idx < chunkEnd; idx++) {
      var el = inputList[idx];

    /* ── Cache check : si un sélecteur est en cache pour ce portail, l'utiliser ── */
    var elSelector = el.id ? ("#" + CSS.escape(el.id)) : (el.name ? ('[name="' + el.name + '"]') : null);
    var cachedField = null;
    if (elSelector) {
      for (var cfKey in SMART_FILL_ALIASES) {
        var cached = getCachedSelector(currentHostname, cfKey);
        if (cached && cached === elSelector) { cachedField = cfKey; break; }
      }
    }

    /* ── Score-based matching (Amélioration 2+4) ── */
    var bestField = cachedField;
    var bestScore = cachedField ? 95 : 0;
    if (!cachedField) {
      for (var field in SMART_FILL_ALIASES) {
        var score = scoreFieldMatch(el, field, SMART_FILL_ALIASES[field]);
        if (score > bestScore) { bestScore = score; bestField = field; }
      }

      /* Also try legacy matchSmartField for backward compat */
      if (bestScore < 50) {
        var legacyMatch = matchSmartField(el);
        if (legacyMatch) {
          bestField = legacyMatch.field;
          bestScore = legacyMatch.confidence === "certain" ? 85 : 60;
        }
      }
    }

    if (!bestField) continue;

    /* Store matched selector in cache for this portal */
    if (elSelector && bestScore >= 50) {
      setCachedSelector(currentHostname, bestField, elSelector);
    }
    var value = fillData[bestField];
    if (!value) {
      fillReport.failed.push({ label: normalizeLabel(getFieldLabel(el)), variable: bestField, confidence: bestScore, signals: { cached: !!cachedField, idMatch: el.id && normalizeAlias(el.id).indexOf(normalizeAlias(bestField)) !== -1, nameMatch: el.name && normalizeAlias(el.name).indexOf(normalizeAlias(bestField)) !== -1, labelMatch: !!getFieldLabel(el) } });
      continue;
    }

    /* Seuil < 50 → ne pas remplir */
    if (bestScore < 50) {
      fillReport.skipped.push({ label: normalizeLabel(getFieldLabel(el)), variable: bestField, confidence: bestScore, reason: "score_trop_faible" });
      continue;
    }

    /* Blacklist check */
    var fcnRaw = el.getAttribute("formcontrolname") || el.getAttribute("ng-reflect-name") || el.name || "";
    if (fcnRaw && SMART_FILL_BLACKLIST.indexOf(fcnRaw.toLowerCase()) !== -1) continue;

    /* Ne pas écraser un champ déjà rempli manuellement par l'opticien */
    var existingVal = (el.value || "").trim();
    if (existingVal && !el.getAttribute("data-audibot-filled")) {
      fillReport.skipped.push({ label: normalizeLabel(getFieldLabel(el)), variable: bestField, confidence: bestScore, reason: "deja_rempli" });
      continue;
    }

    /* Amélioration 8 : appliquer VALUE_NORMALIZERS avant fill */
    if (VALUE_NORMALIZERS[bestField]) {
      value = VALUE_NORMALIZERS[bestField](value, el);
    }

    /* Format corrections optiques (sphere/cylindre/axe/addition) */
    if (OPTICAL_FIELD_KEYS.indexOf(bestField) !== -1) {
      value = formatOpticalValue(value, el);
    }

    /* Protection rang NSS : ne pas remplir NSS entier dans un champ de 1-2 chiffres */
    if (bestField === "numeroSecuriteSociale" && value && value.replace(/\D/g, "").length >= 13) {
      var maxLen = parseInt(el.getAttribute("maxlength") || "0");
      var elName = (el.name || "").toLowerCase();
      /* Si le champ attend 1-2 chiffres et contient "rang" ou "cle" → ignorer */
      if ((maxLen > 0 && maxLen <= 2) || /rang|cle|key|rang_naissance/.test(elName)) {
        fillReport.skipped.push({ label: normalizeLabel(getFieldLabel(el)), variable: bestField, confidence: bestScore, reason: "nss_dans_champ_rang" });
        continue;
      }
    }

    /* V3-5: collect fill plan item */
    fillPlan.push({ el: el, field: bestField, value: value, score: bestScore, cachedField: cachedField, label: normalizeLabel(getFieldLabel(el)) });

    } /* end inner for (idx) */

    /* Yield to main thread between chunks if there are more */
    if (chunkEnd < inputList.length) {
      await new Promise(function(r) { setTimeout(r, 0); });
    }
  } /* end outer for (chunkStart) */

  var scanDuration = Math.round(performance.now() - scanStart);
  /* V3-1: attach scan metadata to fill report */
  fillReport.scanDuration = scanDuration;
  fillReport.totalFields = inputList.length;
  /* Remove scanning indicator, show result if long */
  var existingToast = document.getElementById("audibot-scan-progress");
  if (existingToast) existingToast.remove();
  if (scanDuration > 500) {
    console.info("[AudiBot] Smart Fill scan: " + inputList.length + " fields in " + scanDuration + "ms");
  }
  if (scanDuration > 1000) {
    var resultToast = document.createElement("div");
    resultToast.id = "audibot-scan-progress";
    resultToast.textContent = "Scan termin\u00E9 — " + inputList.length + " champs en " + (scanDuration / 1000).toFixed(1) + "s";
    resultToast.style.cssText = "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:2147483647;background:#1e293b;color:white;padding:8px 16px;border-radius:8px;font:500 12px/1.4 -apple-system,BlinkMacSystemFont,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,.15);opacity:0;transition:opacity .3s;";
    document.body.appendChild(resultToast);
    requestAnimationFrame(function() { resultToast.style.opacity = "1"; });
    setTimeout(function() { resultToast.style.opacity = "0"; setTimeout(function() { resultToast.remove(); }, 300); }, 3000);
  }

  /* ── V3-5: fill execution (extracted for preview support) ──────────── */
  async function executeFill() {
    for (var pi = 0; pi < fillPlan.length; pi++) {
      var item = fillPlan[pi];
      var el = item.el;
      var bestField = item.field;
      var value = item.value;
      var bestScore = item.score;
      var cachedField = item.cachedField;

      /* Cas spécial : intl-tel-input (téléphone avec indicatif pays) */
      if (bestField === "telephone") {
        try {
          var itiInstance = window.intlTelInputGlobals && window.intlTelInputGlobals.getInstance
            ? window.intlTelInputGlobals.getInstance(el)
            : (el._itiInstance || null);
          if (itiInstance && itiInstance.setNumber) {
            itiInstance.setNumber(value);
            filled++;
            markFilledByAudiBot(el, bestField);
            if (bestScore < 80) {
              el.setAttribute("data-audibot-confidence", bestScore);
              el.setAttribute("data-audibot-warned", "true");
              el.style.backgroundColor = "#fef9c3";
              el.style.outline = "2px solid #eab308";
              el.title = "AudiBot \u2014 confiance " + bestScore + "% (" + bestField + ") \u2014 v\u00E9rifiez";
              probable++;
              fillReport.warned.push({ label: normalizeLabel(getFieldLabel(el)), variable: bestField, confidence: bestScore, signals: { cached: !!cachedField, idMatch: el.id && normalizeAlias(el.id).indexOf(normalizeAlias(bestField)) !== -1, nameMatch: el.name && normalizeAlias(el.name).indexOf(normalizeAlias(bestField)) !== -1, labelMatch: !!getFieldLabel(el) } });
            } else {
              fillReport.filled.push({ label: normalizeLabel(getFieldLabel(el)), variable: bestField, confidence: bestScore, signals: { cached: !!cachedField, idMatch: el.id && normalizeAlias(el.id).indexOf(normalizeAlias(bestField)) !== -1, nameMatch: el.name && normalizeAlias(el.name).indexOf(normalizeAlias(bestField)) !== -1, labelMatch: !!getFieldLabel(el) } });
            }
            continue;
          }
        } catch(e) {}
      }

      /* Normalisation des dates */
      var isDateField = ["dateNaissance", "dateNaissancePatient", "dateOrdonnance", "dateValidite", "dateDebutValidite", "dateFinValidite", "dateNaissanceAssure"].indexOf(bestField) !== -1
        || el.type === "date";

      /* Multi-strategy fill */
      var ok = await smartFillField(el, value, isDateField);
      if (!ok) {
        fillReport.failed.push({ label: normalizeLabel(getFieldLabel(el)), variable: bestField, confidence: bestScore, signals: { cached: !!cachedField, idMatch: el.id && normalizeAlias(el.id).indexOf(normalizeAlias(bestField)) !== -1, nameMatch: el.name && normalizeAlias(el.name).indexOf(normalizeAlias(bestField)) !== -1, labelMatch: !!getFieldLabel(el) } });
        continue;
      }

      filled++;
      markFilledByAudiBot(el, bestField);

      if (bestScore >= 50 && bestScore < 80) {
        el.setAttribute("data-audibot-confidence", bestScore);
        el.setAttribute("data-audibot-warned", "true");
        el.style.backgroundColor = "#fef9c3";
        el.style.outline = "2px solid #eab308";
        el.title = "AudiBot \u2014 confiance " + bestScore + "% (" + bestField + ") \u2014 v\u00E9rifiez";
        probable++;
        fillReport.warned.push({ label: normalizeLabel(getFieldLabel(el)), variable: bestField, confidence: bestScore, signals: { cached: !!cachedField, idMatch: el.id && normalizeAlias(el.id).indexOf(normalizeAlias(bestField)) !== -1, nameMatch: el.name && normalizeAlias(el.name).indexOf(normalizeAlias(bestField)) !== -1, labelMatch: !!getFieldLabel(el) } });
      } else {
        fillReport.filled.push({ label: normalizeLabel(getFieldLabel(el)), variable: bestField, confidence: bestScore, signals: { cached: !!cachedField, idMatch: el.id && normalizeAlias(el.id).indexOf(normalizeAlias(bestField)) !== -1, nameMatch: el.name && normalizeAlias(el.name).indexOf(normalizeAlias(bestField)) !== -1, labelMatch: !!getFieldLabel(el) } });
      }
    } /* end fillPlan loop */

    /* ── Radio buttons : sélectionner selon le type de prescription ── */
    var typePrescription = fillData["typePrescription"] || "";
    if (typePrescription) {
      var isLentilles = typePrescription.toLowerCase().indexOf("lentille") !== -1;
      var allRadios = querySelectorAllDeep('input[type="radio"]:not([disabled])');
      allRadios.forEach(function(radio) {
        var label = "";
        var labelEl = radio.id ? (radio.getRootNode ? radio.getRootNode() : document).querySelector('label[for="' + radio.id + '"]') : null;
        if (!labelEl && radio.closest) labelEl = radio.closest("label");
        if (labelEl) label = labelEl.textContent.toLowerCase();
        else label = (radio.value || radio.getAttribute("aria-label") || "").toLowerCase();

        var isLentilleRadio = label.indexOf("lentille") !== -1;
        var isLunetteRadio  = label.indexOf("lunette") !== -1 || label.indexOf("verre") !== -1;

        if ((isLentilles && isLentilleRadio) || (!isLentilles && isLunetteRadio)) {
          if (!radio.checked) {
            radio.click();
            radio.dispatchEvent(new Event("change", { bubbles: true }));
            filled++;
          }
        }
      });
    }

    /* ── Amélioration 9 : sauvegarder le rapport de remplissage ── */
    chrome.storage.local.set({ audibot_last_fill_report: fillReport });

    /* ── Log injection vers le backend (stats admin/extension) ── */
    if (filled > 0) {
      getSyncToken().then(function(syncToken) {
        if (!syncToken) return;
        fetch("https://audibot.fr/api/extension/log-injection", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + syncToken },
          body: JSON.stringify({
            syncToken: syncToken,
            site: window.location.hostname,
            success: true,
            fieldsCount: filled,
            mode: "smartfill",
            ts: Date.now()
          })
        }).catch(function(err) { console.warn("[AudiBot] log-injection failed:", err); });
      });
    }

    /* V3-2: Track fill results for auto-repair */
    if (typeof trackFillResult === "function") {
      var currentHost = window.location.hostname;
      for (var fi = 0; fi < fillReport.filled.length; fi++) trackFillResult(currentHost, fillReport.filled[fi].variable, true);
      for (var si = 0; si < fillReport.skipped.length; si++) trackFillResult(currentHost, fillReport.skipped[si].variable || "unknown", false);
      for (var fai = 0; fai < fillReport.failed.length; fai++) trackFillResult(currentHost, fillReport.failed[fai].variable, false);
      checkAndRepairSelectors(currentHost);
    }

    /* V3-9: Predictive rejection scoring */
    if (typeof predictRejectionRisk === "function") {
      var prediction = predictRejectionRisk(fillReport, window.location.hostname);
      if (prediction) {
        fillReport.rejectionRisk = prediction;
        showRejectionRiskBanner(prediction);
      }
    }

    if (filled === 0) {
      showRPAToast("Aucun champ reconnu sur cette page.", "error");
    } else {
      var msg = filled + " champ" + (filled > 1 ? "s" : "") + " rempli" + (filled > 1 ? "s" : "");
      if (probable > 0) msg += " \u00B7 " + probable + " \u00E0 v\u00E9rifier (jaune)";
      showRPAToast("\u2705 " + msg, "success");
    }
    _performingSmartFill = false;
  }

  /* V3-5: show preview or fill immediately */
  if (previewEnabled && fillPlan.length > 5) {
    showFillPreview(fillPlan, executeFill, function() {
      _performingSmartFill = false;
    });
  } else {
    await executeFill();
  }
  } finally {
    _performingSmartFill = false;
  }
}

/* ── V3-5: Preview overlay before fill ─────────────────────────────────── */
function showFillPreview(items, onConfirm, onCancel) {
  var overlay = document.createElement("div");
  overlay.id = "audibot-fill-preview";
  overlay.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;z-index:2147483646;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,sans-serif;";

  var panel = document.createElement("div");
  panel.style.cssText = "background:white;border-radius:16px;padding:24px;max-width:480px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);";

  var title = document.createElement("div");
  title.style.cssText = "font-size:16px;font-weight:700;color:#111;margin-bottom:16px;";
  title.textContent = "AudiBot — Apercu du remplissage (" + items.length + " champs)";
  panel.appendChild(title);

  var list = document.createElement("div");
  list.style.cssText = "max-height:50vh;overflow-y:auto;";

  for (var i = 0; i < items.length && i < 30; i++) {
    var row = document.createElement("div");
    row.style.cssText = "display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #f3f4f6;font-size:13px;";

    var fieldName = document.createElement("span");
    fieldName.style.cssText = "color:#6b7280;flex-shrink:0;width:40%;";
    fieldName.textContent = items[i].label || items[i].field;

    var fieldValue = document.createElement("span");
    fieldValue.style.cssText = "color:#111;font-weight:500;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:55%;";
    fieldValue.textContent = (items[i].value || "").substring(0, 40);

    row.appendChild(fieldName);
    row.appendChild(fieldValue);
    list.appendChild(row);
  }
  if (items.length > 30) {
    var more = document.createElement("div");
    more.style.cssText = "text-align:center;color:#9ca3af;font-size:12px;padding:8px;";
    more.textContent = "+" + (items.length - 30) + " champs supplementaires";
    list.appendChild(more);
  }
  panel.appendChild(list);

  var btnRow = document.createElement("div");
  btnRow.style.cssText = "display:flex;gap:12px;margin-top:16px;";

  var cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Annuler";
  cancelBtn.style.cssText = "flex:1;padding:10px;border:1px solid #d1d5db;border-radius:8px;background:white;color:#374151;cursor:pointer;font-size:13px;font-weight:600;";
  cancelBtn.onclick = function() { overlay.remove(); if (onCancel) onCancel(); };

  var confirmBtn = document.createElement("button");
  confirmBtn.textContent = "Remplir " + items.length + " champs";
  confirmBtn.style.cssText = "flex:1;padding:10px;border:none;border-radius:8px;background:#2563eb;color:white;cursor:pointer;font-size:13px;font-weight:700;";
  confirmBtn.onclick = function() { overlay.remove(); if (onConfirm) onConfirm(); };

  btnRow.appendChild(cancelBtn);
  btnRow.appendChild(confirmBtn);
  panel.appendChild(btnRow);

  overlay.appendChild(panel);
  document.body.appendChild(overlay);
}

/* ── iframes cross-domain postMessage listener ────────────────────────────── */
export function setupPostMessageListener() {
  window.addEventListener("message", function(e) {
    if (e.origin !== window.location.origin) return;
    if (!e.data || e.data.type !== "AUDIBOT_FILL_FRAME" || !e.data.payload) return;
    performSmartFill(e.data.payload);
  }, false);
}
