/* AudiBot — Remote Config : parcours dynamiques, selectors, hotpatches, mappings */

import { API_BASE } from './config.js';

export var MAPPINGS_CHECK_ALARM = "audibot_mappings_check";

/** Fetch with timeout and response.ok validation */
function safeFetch(url, options, timeoutMs) {
  var controller = new AbortController();
  var timer = setTimeout(function() { controller.abort(); }, timeoutMs || 15000);
  var opts = Object.assign({}, options || {}, { signal: controller.signal });
  return fetch(url, opts).then(function(r) {
    clearTimeout(timer);
    if (!r.ok && r.status !== 304) throw new Error("HTTP " + r.status);
    return r;
  }).catch(function(err) {
    clearTimeout(timer);
    throw err;
  });
}

/** Retry wrapper — retries up to maxRetries times with exponential backoff */
function fetchWithRetry(url, options, maxRetries) {
  var delays = [2000, 5000, 15000];
  var attempt = 0;
  var max = maxRetries || 2;
  function tryFetch() {
    return safeFetch(url, options).catch(function(err) {
      if (attempt < max) {
        var delay = delays[attempt] || 15000;
        attempt++;
        return new Promise(function(resolve) {
          setTimeout(function() { resolve(tryFetch()); }, delay);
        });
      }
      throw err;
    });
  }
  return tryFetch();
}

export function fetchAndCacheDynamicParcours() {
  chrome.storage.local.get(["audibot_auth"], function(result) {
    if (chrome.runtime.lastError) { console.warn("[AudiBot] storage error:", chrome.runtime.lastError); return; }
    var auth = result.audibot_auth || {};
    if (!auth.syncToken) return;
    fetchWithRetry(API_BASE + "/api/extension/parcours?handlers=true", {
      headers: { "Authorization": "Bearer " + auth.syncToken }
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (Array.isArray(data.handlers)) {
        chrome.storage.local.set({
          audibot_dynamic_parcours: { handlers: data.handlers, ts: Date.now() }
        });
      }
    })
    .catch(function(err) { console.warn("[AudiBot] dynamic parcours fetch failed:", err.message); });
  });
}

export function fetchAndCacheSelectorOverrides() {
  fetchWithRetry(API_BASE + "/api/extension/selectors")
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data && data.overrides) {
        chrome.storage.local.set({
          audibot_selector_overrides: { overrides: data.overrides, version: data.version || 1, ts: Date.now() }
        });
      }
    })
    .catch(function(err) { console.warn("[AudiBot] selector overrides fetch failed:", err.message); });
}

export function fetchAndCacheHotPatches() {
  fetchWithRetry(API_BASE + "/api/extension/hotpatch")
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data && data.patches) {
        chrome.storage.local.set({
          audibot_hotpatches: { patches: data.patches, ts: Date.now() }
        });
        console.info("[AudiBot] Hot-patches: " + data.patches.length + " actifs");
      }
    })
    .catch(function(err) { console.warn("[AudiBot] hotpatch fetch failed:", err.message); });
}

/* ── US-9 : Remote Config Mappings — mise a jour silencieuse ─────────────── */
/* Charge les mappings complets (portails + ERPs) depuis le serveur.           */
/* Format JSON : { version, sources: [ { source, urlPattern, fields: {...} } ] } */
/* Chrome Web Store autorise les donnees JSON distantes, pas le code JS.       */

export function fetchAndCacheMappings() {
  chrome.storage.local.get(["audibot_mappings", "audibot_auth"], function(result) {
    if (chrome.runtime.lastError) { console.warn("[AudiBot] storage error:", chrome.runtime.lastError); return; }
    var auth = result.audibot_auth || {};
    var cached = result.audibot_mappings || {};
    var localVersion = cached.version || 0;

    var headers = { "Content-Type": "application/json" };
    if (auth.syncToken) headers["Authorization"] = "Bearer " + auth.syncToken;

    safeFetch(API_BASE + "/api/extension/mappings?version=" + localVersion, { headers: headers })
      .then(function(r) {
        /* 304 = pas de changement */
        if (r.status === 304) {
          console.info("[AudiBot] Mappings a jour (version " + localVersion + ")");
          return null;
        }
        return r.json();
      })
      .then(function(data) {
        if (!data) return;
        if (data.version && data.sources) {
          chrome.storage.local.set({
            audibot_mappings: { version: data.version, sources: data.sources, ts: Date.now() }
          });
          console.info("[AudiBot] Mappings mis a jour → version " + data.version + " (" + data.sources.length + " sources)");
          /* Notifier les content scripts actifs */
          chrome.tabs.query({ active: true }, function(tabs) {
            tabs.forEach(function(tab) {
              if (tab.id) {
                chrome.tabs.sendMessage(tab.id, { type: "AUDIBOT_MAPPINGS_UPDATED", version: data.version })
                  .catch(function() {});
              }
            });
          });
        }
      })
      .catch(function(err) { console.warn("[AudiBot] mappings fetch failed:", err.message); });
  });
}
