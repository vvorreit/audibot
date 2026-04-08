/* OptiBot — Messages : handler chrome.runtime.onMessage (13 types) */

import { API_BASE } from './config.js';
import { resetLockAlarm, registerCosiumScripts } from './tabs.js';
import { connectSSE, isSSEConnected } from './sse-client.js';

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg && msg.type === 'OPTIBOT_OPEN_TAB' && msg.url) {
    chrome.tabs.create({ url: msg.url });
  }
  if (msg && msg.type === 'OPTIBOT_RENEW_LOCK') {
    resetLockAlarm();
    /* Reconnecter SSE si deconnecte apres lock */
    if (!isSSEConnected()) connectSSE();
  }

  /* ── US-8 : Feedback Loop — signalement champ mal rempli ── */
  if (msg && msg.type === 'OPTIBOT_FIELD_FEEDBACK' && msg.payload) {
    chrome.storage.local.get(["optibot_auth"], function(result) {
      var auth = result.optibot_auth || {};
      if (!auth.syncToken) { sendResponse({ ok: false, error: 'not_authenticated' }); return; }

      fetch(API_BASE + "/api/extension/field-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + auth.syncToken
        },
        body: JSON.stringify({
          selector: msg.payload.selector,
          fieldType: msg.payload.fieldType,
          portal: msg.payload.portal,
          url: msg.payload.url,
          ts: msg.payload.ts
        })
      })
      .then(function(r) { return r.json(); })
      .then(function(data) { sendResponse({ ok: true, data: data }); })
      .catch(function(err) {
        console.warn("[OptiBot] field-feedback failed:", err);
        sendResponse({ ok: false, error: err.message });
      });
    });
    return true; /* async sendResponse */
  }
  /* Proxy fetch pour eviter CORS — le service worker n'a pas de restrictions CORS */
  if (msg && msg.type === 'OPTIBOT_PING' && msg.payloads) {
    msg.payloads.forEach(function(p) {
      fetch(p.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p.body)
      }).catch(function(err) { console.warn("[OptiBot] ping relay failed:", err); });
    });
  }
  /* ── Cosium ERP ── */
  if (msg && msg.type === 'OPTIBOT_SET_COSIUM_URL') {
    registerCosiumScripts(msg.url);
    sendResponse({ ok: true });
    return true;
  }

  /* ── Badge rejet rouge ── */
  if (msg && msg.type === 'OPTIBOT_REJET_BADGE') {
    var badgeColor = msg.rejetType === "technique" ? "#f59e0b" : "#ef4444";
    var badgeText = msg.rejetType === "technique" ? "!" : "REJET";
    chrome.action.setBadgeText({ text: badgeText });
    chrome.action.setBadgeBackgroundColor({ color: badgeColor });
    /* Effacer le badge via alarm (setTimeout est tue quand le SW est suspendu) */
    chrome.alarms.create("optibot_clear_badge", { delayInMinutes: 0.5 });
  }

  /* ── Injection note rejet dans Cosium ── */
  if (msg && msg.type === 'OPTIBOT_COSIUM_INJECT_NOTE') {
    chrome.storage.local.get(["optibot_cosium_url"], function(result) {
      if (!result.optibot_cosium_url) return;
      var cosiumOrigin = new URL(result.optibot_cosium_url).origin;
      /* Chercher un onglet Cosium ouvert et injecter la note */
      chrome.tabs.query({}, function(tabs) {
        for (var i = 0; i < tabs.length; i++) {
          if (tabs[i].url && tabs[i].url.startsWith(cosiumOrigin)) {
            chrome.tabs.sendMessage(tabs[i].id, {
              type: "OPTIBOT_INJECT_REJET_NOTE",
              note: msg.note,
            }, function() {
              if (chrome.runtime.lastError) {} /* silencieux */
            });
            break;
          }
        }
      });
    });
  }

  if (msg && msg.type === 'OPTIBOT_COSIUM_SCRAPED') {
    chrome.storage.local.set({
      optibot_cosium_status: { scraped: true, fields: msg.fields, ts: Date.now() }
    });
  }

  if (msg && msg.type === 'OPTIBOT_PEC_CAPTURED') {
    chrome.storage.local.set({
      optibot_pec_pending: {
        encryptedPayload: msg.encryptedPayload,
        source: msg.source,
        ts: Date.now()
      }
    });
  }

  /* Envoyer un statut au serveur (extension → dashboard) */
  if (msg && msg.type === 'OPTIBOT_SEND_STATUS') {
    chrome.storage.local.get(["optibot_auth"], function(result) {
      var auth = result.optibot_auth || {};
      if (!auth.syncToken) return;
      fetch(API_BASE + "/api/extension/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          syncToken: auth.syncToken,
          status: msg.status || "idle",
          portal: msg.portal || null,
          details: msg.details || null,
        })
      }).catch(function(err) { console.warn("[OptiBot] status send failed:", err); });
    });
  }
});
