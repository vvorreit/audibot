/* ── OptiBot — ERP Bridge: Smart scrape & patient page detection ─────── */

import { querySelectorAllDeep } from "./dom.js";
import { matchFieldAgainst } from "./matching.js";
import { showToast } from "./ui.js";

/* ══════════════════════════════════════════════════════════════════════
 *  SMART SCRAPE
 * ══════════════════════════════════════════════════════════════════════ */

var INPUT_SELECTOR = "input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=checkbox]):not([type=radio]):not([type=file]):not([type=image]):not([type=reset]), select, textarea";

export function queryInputs(adapter) {
  var sel = adapter.inputSelector || INPUT_SELECTOR;
  return querySelectorAllDeep(sel);
}

export async function smartScrape(adapter, getScrapingAliases) {
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

export async function isPatientPage(adapter, getScrapingAliases) {
  /* Ne jamais scraper les pages de login */
  var loginSignals = document.querySelectorAll(
    '[type="password"], [name*="login"], [name*="password"], [action*="login"], [action*="auth"], [class*="login"], [class*="signin"], [id*="login"], [id*="signin"]'
  );
  if (loginSignals.length > 0) {
    return { isPatient: false, data: {}, fieldCount: 0 };
  }

  /* Indicateurs rapides */
  if (adapter.patientPageIndicators && adapter.patientPageIndicators.length) {
    for (var p = 0; p < adapter.patientPageIndicators.length; p++) {
      if (document.querySelector(adapter.patientPageIndicators[p])) {
        var scraped = await smartScrape(adapter, getScrapingAliases);
        return { isPatient: true, data: scraped, fieldCount: Object.keys(scraped).length };
      }
    }
    /* L'adaptateur a des indicateurs explicites mais aucun ne matche →
       on n'est PAS sur une fiche patient, ne pas utiliser le fallback par comptage */
    return { isPatient: false, data: {}, fieldCount: 0 };
  }

  /* Fallback pour adaptateurs sans indicateurs : nombre de champs */
  var data = await smartScrape(adapter, getScrapingAliases);
  var count = Object.keys(data).length;
  var min = adapter.minFieldsForPatientPage || 3;
  return { isPatient: count >= min, data: data, fieldCount: count };
}

export async function performScrape(adapter, getScrapingAliases) {
  var check = await isPatientPage(adapter, getScrapingAliases);
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
 *  BOUTON "MÉMORISER" — scrape uniquement sur action explicite
 * ══════════════════════════════════════════════════════════════════════ */

var _autoDetectionActive = false;

export function setupScrapeButton(adapter, getScrapingAliases) {
  if (_autoDetectionActive) return;
  _autoDetectionActive = true;

  var BTN_ID = "optibot-erp-scrape-btn";

  function createButton() {
    if (document.getElementById(BTN_ID)) return;
    /* Ne pas créer le bouton si le portail a déjà son propre bouton Mémoriser
       (flag globalThis posé par le content script, ou DOM check en fallback) */
    if (globalThis._optibotHasPortalSync || document.getElementById("optibot-sync-btn")) return;

    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = BTN_ID;
    btn.textContent = "\uD83D\uDCBE M\u00E9moriser ce client";
    btn.style.cssText = "position:fixed;bottom:80px;right:20px;z-index:2147483647;background:#7c3aed;color:white;border:none;padding:12px 20px;border-radius:50px;font:700 13px/1.4 -apple-system,BlinkMacSystemFont,sans-serif;cursor:pointer;box-shadow:0 4px 15px rgba(0,0,0,.2);transition:all .2s ease;";

    btn.onmouseenter = function() { btn.style.transform = "scale(1.05)"; };
    btn.onmouseleave = function() { btn.style.transform = "scale(1)"; };

    btn.onclick = async function() {
      btn.textContent = "\u23F3 Lecture...";
      btn.style.background = "#6366f1";
      btn.disabled = true;

      try {
        var check = await isPatientPage(adapter, getScrapingAliases);
        if (!check.isPatient || check.fieldCount < 2) {
          btn.textContent = "\u274C Pas de fiche client";
          btn.style.background = "#ef4444";
          setTimeout(function() { resetBtn(); }, 2000);
          return;
        }

        await performScrape(adapter, getScrapingAliases);
        btn.textContent = "\u2705 Client m\u00E9moris\u00E9 !";
        btn.style.background = "#059669";
        setTimeout(function() { resetBtn(); }, 2500);
      } catch(e) {
        console.warn("[OptiBot] ERP scrape failed:", e);
        btn.textContent = "\u274C Erreur de lecture";
        btn.style.background = "#ef4444";
        setTimeout(function() { resetBtn(); }, 2000);
      }
    };

    function resetBtn() {
      btn.textContent = "\uD83D\uDCBE M\u00E9moriser ce client";
      btn.style.background = "#7c3aed";
      btn.disabled = false;
    }

    document.body.appendChild(btn);
  }

  /* Afficher le bouton après que le content script ait eu le temps de s'initialiser */
  setTimeout(createButton, Math.max(adapter.scrapeDelay || 2000, 3500));

  /* Re-afficher après navigation SPA */
  window.addEventListener("popstate", function() { setTimeout(createButton, 1000); });
  window.addEventListener("hashchange", function() { setTimeout(createButton, 1000); });
}
