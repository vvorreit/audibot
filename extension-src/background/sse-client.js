/* AudiBot — SSE Client : connexion bidirectionnelle via fetch + ReadableStream */
/* Chrome MV3 service workers ne supportent pas EventSource.                   */

import { isActiveDomain, API_BASE } from './config.js';

var _sseReader = null;
var _sseRetryCount = 0;
var _sseRetryTimer = null;
var _sseConnected = false;
var SSE_RETRY_DELAYS = [5000, 10000, 30000, 60000]; /* backoff exponentiel */

export function connectSSE() {
  chrome.storage.local.get(["audibot_auth", "audibot_lock"], function(result) {
    var auth = result.audibot_auth || {};
    var lock = result.audibot_lock || {};

    /* Ne pas connecter si pas authentifie ou verrouille */
    if (!auth.syncToken) return;
    if (lock.lockAt && lock.lockAt < Date.now()) return;

    /* Fermer toute connexion existante */
    disconnectSSE();

    _sseConnected = true;

    var url = API_BASE + "/api/extension/sse";
    fetch(url, { headers: { "Authorization": "Bearer " + auth.syncToken } })
      .then(function(response) {
        if (!response.ok || !response.body) {
          throw new Error("SSE response " + response.status);
        }
        _sseReader = response.body.getReader();
        _sseRetryCount = 0; /* reset backoff on successful connect */
        var decoder = new TextDecoder();
        var buffer = "";

        function read() {
          if (!_sseConnected) return;
          _sseReader.read().then(function(result) {
            if (result.done) {
              /* Serveur a ferme la connexion, reconnecter */
              scheduleSSEReconnect();
              return;
            }
            buffer += decoder.decode(result.value, { stream: true });

            /* Decouper sur les double newlines (protocole SSE) */
            var events = buffer.split("\n\n");
            buffer = events.pop(); /* garder le dernier fragment incomplet */

            events.forEach(function(raw) {
              if (!raw || raw.trim().charAt(0) === ":") return; /* commentaire keepalive */
              var dataLine = null;
              var lines = raw.split("\n");
              for (var i = 0; i < lines.length; i++) {
                if (lines[i].indexOf("data:") === 0) {
                  dataLine = lines[i].slice(5).trim();
                  break;
                }
              }
              if (!dataLine) return;
              try {
                var payload = JSON.parse(dataLine);
                handleSSEEvent(payload);
              } catch (e) { /* JSON invalide, ignorer */ }
            });

            read();
          }).catch(function(err) {
            console.warn("[AudiBot] SSE read error:", err);
            if (_sseConnected) scheduleSSEReconnect();
          });
        }

        read();
      })
      .catch(function(err) {
        console.warn("[AudiBot] SSE connection error:", err);
        if (_sseConnected) scheduleSSEReconnect();
      });
  });
}

export function disconnectSSE() {
  _sseConnected = false;
  if (_sseReader) {
    try { _sseReader.cancel(); } catch (e) {}
    _sseReader = null;
  }
  if (_sseRetryTimer) {
    clearTimeout(_sseRetryTimer);
    _sseRetryTimer = null;
  }
}

function scheduleSSEReconnect() {
  if (_sseRetryTimer) return;
  var delay = SSE_RETRY_DELAYS[Math.min(_sseRetryCount, SSE_RETRY_DELAYS.length - 1)];
  _sseRetryCount++;
  _sseRetryTimer = setTimeout(function() {
    _sseRetryTimer = null;
    connectSSE();
  }, delay);
}

function handleSSEEvent(payload) {
  if (!payload || !payload.type) return;

  if (payload.type === "reconnect") {
    /* Serveur demande une reconnexion */
    scheduleSSEReconnect();
    return;
  }

  if (payload.type === "connected") {
    /* Connexion SSE etablie */
    return;
  }

  /* Dispatcher l'evenement a tous les onglets actifs */
  chrome.tabs.query({}, function(tabs) {
    tabs.forEach(function(tab) {
      if (tab.url && (isActiveDomain(tab.url) || (function(u) { try { var h = new URL(u).hostname; return h === "audibot.fr" || h.endsWith(".audibot.fr"); } catch(e) { return false; } })(tab.url))) {
        chrome.tabs.sendMessage(tab.id, {
          type: "AUDIBOT_SSE_EVENT",
          payload: payload,
        }, function() {
          if (chrome.runtime.lastError) {} /* silencieux */
        });
      }
    });
  });
}

/* Expose pour le keepalive check dans l'orchestrateur */
export function isSSEConnected() {
  return _sseConnected && !!_sseReader;
}
