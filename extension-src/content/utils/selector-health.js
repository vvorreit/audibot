/* ── Selector Health Telemetry ──────────────────────────────────────────────── */
/* Envoie des pings de sante anonymises lorsqu'un selecteur n'est pas trouve  */
/* sur un portail connu. Les pings sont batches et envoyes toutes les 10s.    */

var _healthPingQueue = [];
var _healthFlushTimer = null;
var HEALTH_FLUSH_INTERVAL_MS = 10000;
var HEALTH_MAX_BATCH = 20;

/**
 * Enregistre un ping de sante pour un selecteur.
 * Les pings sont accumules puis envoyes en batch.
 *
 * @param {string} portal       - cle du portail (ex: "mutuelle-almerys.com")
 * @param {string} selectorName - nom logique du selecteur (ex: "nom_beneficiaire")
 * @param {boolean} found       - true si l'element a ete trouve, false sinon
 */
function reportSelectorHealth(portal, selectorName, found) {
  _healthPingQueue.push({
    portal: portal,
    selectorName: selectorName,
    found: found,
  });

  /* Demarrer le timer de flush si pas deja en cours */
  if (!_healthFlushTimer) {
    _healthFlushTimer = setTimeout(flushHealthPings, HEALTH_FLUSH_INTERVAL_MS);
  }

  /* Flush immediat si le batch est plein */
  if (_healthPingQueue.length >= HEALTH_MAX_BATCH) {
    flushHealthPings();
  }
}

/**
 * Envoie le batch de pings au serveur via le background service worker.
 * Utilise le mecanisme OPTIBOT_PING existant pour eviter les problemes CORS.
 */
function flushHealthPings() {
  if (_healthFlushTimer) {
    clearTimeout(_healthFlushTimer);
    _healthFlushTimer = null;
  }

  if (_healthPingQueue.length === 0) return;

  var pingsToSend = _healthPingQueue.splice(0);

  chrome.storage.local.get(["optibot_auth"], function(result) {
    var auth = result.optibot_auth || {};
    if (!auth.syncToken) return; /* pas authentifie, on jette les pings */

    chrome.runtime.sendMessage({
      type: "OPTIBOT_PING",
      payloads: [{
        url: "https://optibot.fr/api/extension/selector-health",
        body: {
          syncToken: auth.syncToken,
          pings: pingsToSend,
        },
      }],
    });
  });
}

/**
 * Wrapper autour de findElementWithOverride qui reporte automatiquement
 * la sante du selecteur. Utilise dans les portails migres.
 *
 * @param {string} portal     - cle du portail
 * @param {string} name       - nom logique du selecteur
 * @param {string} fallback   - selecteur CSS hardcode
 * @returns {Element|null}
 */
function findElementTracked(portal, name, fallback) {
  var el = findElementWithOverride(portal, name, fallback);
  reportSelectorHealth(portal, name, !!el);
  return el;
}

/* Expose pour l'import depuis content/index.js */
globalThis.reportSelectorHealth = reportSelectorHealth;
globalThis.flushHealthPings = flushHealthPings;
globalThis.findElementTracked = findElementTracked;

/* ── V3-2 : Auto-repair — capture DOM snapshot on high skip rate ─────── */

var _fillStats = {};

function trackFillResult(hostname, field, success) {
  if (!_fillStats[hostname]) _fillStats[hostname] = { total: 0, skipped: 0, fields: {} };
  _fillStats[hostname].total++;
  if (!success) _fillStats[hostname].skipped++;
  if (!success) {
    _fillStats[hostname].fields[field] = (_fillStats[hostname].fields[field] || 0) + 1;
  }
}

function checkAndRepairSelectors(hostname) {
  var stats = _fillStats[hostname];
  if (!stats || stats.total < 5) return; /* Pas assez de donnees */

  var skipRate = stats.skipped / stats.total;
  if (skipRate < 0.3) return; /* Taux de skip acceptable */

  console.warn("[OptiBot] Taux de skip eleve sur " + hostname + " (" + Math.round(skipRate * 100) + "%) — envoi snapshot DOM pour reparation");

  /* Capturer un snapshot DOM anonymise (sans valeurs de champs) */
  var snapshot = captureAnonymizedSnapshot();

  chrome.storage.local.get(["optibot_auth"], function(result) {
    var auth = result.optibot_auth || {};
    if (!auth.syncToken) return;

    fetch("https://optibot.fr/api/extension/selector-repair", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + auth.syncToken
      },
      body: JSON.stringify({
        hostname: hostname,
        skipRate: skipRate,
        failedFields: stats.fields,
        snapshot: snapshot,
        ts: Date.now()
      })
    }).catch(function(err) { console.warn("[OptiBot] selector repair submission failed:", err); });
  });

  /* Reset stats apres envoi */
  _fillStats[hostname] = { total: 0, skipped: 0, fields: {} };
}

function captureAnonymizedSnapshot() {
  var inputs = document.querySelectorAll("input, select, textarea");
  var snapshot = [];

  for (var i = 0; i < inputs.length && i < 100; i++) {
    var el = inputs[i];
    snapshot.push({
      tag: el.tagName.toLowerCase(),
      type: el.type || "",
      id: el.id || "",
      name: el.name || "",
      className: (el.className || "").substring(0, 100),
      placeholder: (el.placeholder || "").substring(0, 50),
      ariaLabel: el.getAttribute("aria-label") || "",
      formControlName: el.getAttribute("formcontrolname") || "",
      /* NO value — anonymized */
      hasValue: !!(el.value || "").trim(),
      isVisible: el.offsetHeight > 0,
      parentClasses: el.parentElement ? (el.parentElement.className || "").substring(0, 100) : "",
    });
  }

  return snapshot;
}

globalThis.trackFillResult = trackFillResult;
globalThis.checkAndRepairSelectors = checkAndRepairSelectors;
