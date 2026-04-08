/* AudiBot — Tab listeners : activation, update, PEC forwarding, lock alarm */

import { isActiveDomain, updateIcon, ACTIVE_DOMAINS, INACTIVITY_MINUTES } from './config.js';

/* Mettre a jour quand on change d'onglet */
chrome.tabs.onActivated.addListener(function (info) {
  chrome.tabs.get(info.tabId, function (tab) {
    if (tab && tab.url) {
      updateIcon(tab.id, tab.url);
      forwardPECToCosiumIfNeeded(tab);
    }
  });
});

/* Forwarding PEC vers Cosium quand on bascule sur l'onglet ERP */
export function forwardPECToCosiumIfNeeded(tab) {
  chrome.storage.local.get(["audibot_cosium_url", "audibot_pec_pending"], function(result) {
    var cosiumUrl = result.audibot_cosium_url;
    var pec = result.audibot_pec_pending;
    if (!cosiumUrl || !pec || !tab.url) return;
    try {
      var cosiumOrigin = new URL(cosiumUrl).origin;
      if (!tab.url.startsWith(cosiumOrigin)) return;
    } catch(e) { return; }
    /* Fraicheur : max 30 min */
    if (Date.now() - pec.ts > 30 * 60 * 1000) {
      chrome.storage.local.remove("audibot_pec_pending");
      return;
    }
    chrome.tabs.sendMessage(tab.id, {
      type: "AUDIBOT_INJECT_PEC",
      pecData: pec.encryptedPayload
    }, function() {
      if (chrome.runtime.lastError) {} /* silencieux */
    });
  });
}

/* Mettre a jour quand la page change */
var _pageLoadedTimers = {};
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.url || changeInfo.status === "complete") {
    updateIcon(tabId, tab.url || changeInfo.url || "");
  }
  /* Auto-replay : notifier le content script quand une page active est chargee (debounce 500ms) */
  if (changeInfo.status === "complete" && tab.url && isActiveDomain(tab.url)) {
    clearTimeout(_pageLoadedTimers[tabId]);
    _pageLoadedTimers[tabId] = setTimeout(function() {
      delete _pageLoadedTimers[tabId];
      /* Envoyer AUDIBOT_PAGE_LOADED au nouvel onglet (fix cross-domain Almerys target=_blank) */
      chrome.tabs.sendMessage(tabId, { type: "AUDIBOT_PAGE_LOADED" }, function() {
        if (chrome.runtime.lastError) {} /* silencieux */
      });
      /* V3-10 : Propager audibot_rpa — matching dynamique sur tout domaine */
      chrome.storage.local.get(["audibot_rpa"], function(result) {
        var rpa = result.audibot_rpa;
        if (!rpa || !rpa.target) return;
        /* Mapping connu pour les bots codes en dur */
        var knownDomains = {
          almerys: ["almerys.com", "be-almerys.com"],
          wemind: ["wemind.io"],
          generation: ["generation.fr"],
          oxantis: ["oxantis.net"],
          viamedis: ["viamedis.net"]
        };
        var domains = knownDomains[rpa.target] || [];
        var tabUrl = tab.url || "";
        var tabHostname = "";
        try { tabHostname = new URL(tabUrl).hostname; } catch(e) {}
        var matches = domains.some(function(d) { return tabHostname === d || tabHostname.endsWith("." + d); });
        /* Matching dynamique : si le RPA contient un targetHostname, matcher dessus */
        if (!matches && rpa.targetHostname) {
          matches = tabHostname === rpa.targetHostname || tabHostname.endsWith("." + rpa.targetHostname);
        }
        /* Dernier recours : matcher le target directement comme domaine */
        if (!matches && rpa.target.indexOf(".") !== -1) {
          matches = tabHostname === rpa.target || tabHostname.endsWith("." + rpa.target);
        }
        if (!matches) return;
        /* Données fraîches (< 5 min) — déclencher checkAndStartRPA via le content script */
        if (Date.now() - rpa.ts > 300000) { chrome.storage.local.remove("audibot_rpa"); return; }
        chrome.tabs.sendMessage(tabId, { type: "AUDIBOT_CHECK_RPA" }, function() {
          if (chrome.runtime.lastError) {} /* silencieux */
        });
      });
    }, 800);
  }
});

/* ── Lock d'inactivite avec chrome.alarms ─────────────────── */
export function resetLockAlarm() {
  chrome.alarms.clear("audibot_lock", function() {
    chrome.alarms.create("audibot_lock", { delayInMinutes: INACTIVITY_MINUTES });
  });
  /* Mettre a jour le lockAt dans le storage */
  chrome.storage.local.set({ audibot_lock: { lockAt: Date.now() + INACTIVITY_MINUTES * 60 * 1000 } });
}

/* ── Cosium ERP : enregistrement scripts dynamiques ─────── */
export async function registerCosiumScripts(cosiumUrl) {
  try {
    var origin = new URL(cosiumUrl).origin + "/*";

    /* Desinscrire les anciens scripts si existants */
    try {
      await chrome.scripting.unregisterContentScripts({ ids: ["audibot-cosium"] });
    } catch(e) { /* pas encore enregistre */ }

    /* Enregistrer les scripts Cosium */
    await chrome.scripting.registerContentScripts([{
      id: "audibot-cosium",
      matches: [origin],
      js: ["crypto.js", "erp-bridge.js"],
      allFrames: true,
      runAt: "document_idle"
    }]);

    /* Ajouter le domaine a ACTIVE_DOMAINS pour l'icone bleue */
    var cosiumDomain = new URL(cosiumUrl).hostname;
    if (!ACTIVE_DOMAINS.includes(cosiumDomain)) {
      ACTIVE_DOMAINS.push(cosiumDomain);
    }

    chrome.storage.local.set({ audibot_cosium_url: cosiumUrl });
  } catch(e) {
    console.warn("[AudiBot] Cosium script registration failed:", e);
  }
}
