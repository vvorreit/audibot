/* OptiBot — Service Worker : icone dynamique + lock inactivite + remote config + SSE */

const ACTIVE_DOMAINS = [
  /* Portails mutuelles TP (25) */
  "livebyoptimum.com",
  "almerys.com",
  "be-almerys.com",
  "viamedis.net",
  "ism-tp.fr",
  "actil.com",
  "mutuelle-optique.fr",
  "wemind.io",
  "apgis.com",
  "ameli.fr",
  "solimut.fr",
  "ffl-promoteur.com",
  "spsante.fr",
  "services-fm.net",
  "mercernet.fr",
  "oxantis.net",
  "santeclair.fr",
  "generation.fr",
  "carteblanchepartenaires.fr",
  "kalixia.fr",
  "kalixia-partenaires.fr",
  "optistya.fr",
  "groupama.com",
  "korelio.com",
  "seveane.com",
  "tp-harmonie.net",
  "tp-isante.fr",
  "tp-eovi-mcd.net",
  "mysanteclair.fr",
  "tpcomplementaire.fr",
  /* ERP opticiens */
  "igestion.fr",
  "optiflex.fr",
  "winoptics.fr",
  "irium-software.fr",
  "lyra-optique.fr",
];

const INACTIVITY_MINUTES = 15;
const API_BASE = "https://optibot.fr";

function isActiveDomain(url) {
  try {
    const hostname = new URL(url).hostname;
    return ACTIVE_DOMAINS.some(function (d) { return hostname.includes(d); });
  } catch (e) {
    return false;
  }
}

function drawIcon(size, color, callback) {
  var canvas = new OffscreenCanvas(size, size);
  var ctx = canvas.getContext("2d");

  /* Fond arrondi */
  var r = size * 0.2;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  /* Lettre O */
  ctx.fillStyle = "white";
  ctx.font = "bold " + Math.round(size * 0.55) + "px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("O", size / 2, size / 2 + size * 0.03);

  var imageData = ctx.getImageData(0, 0, size, size);
  callback(imageData);
}

function updateIcon(tabId, url) {
  var active = isActiveDomain(url || "");
  var color = active ? "#2563eb" : "#94a3b8";

  var imageDataMap = {};
  var sizes = [16, 32];
  var done = 0;

  sizes.forEach(function (size) {
    drawIcon(size, color, function (imageData) {
      imageDataMap[size] = imageData;
      done++;
      if (done === sizes.length) {
        chrome.action.setIcon({ tabId: tabId, imageData: imageDataMap });
      }
    });
  });
}

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
function forwardPECToCosiumIfNeeded(tab) {
  chrome.storage.local.get(["optibot_cosium_url", "optibot_pec_pending"], function(result) {
    var cosiumUrl = result.optibot_cosium_url;
    var pec = result.optibot_pec_pending;
    if (!cosiumUrl || !pec || !tab.url) return;
    try {
      var cosiumOrigin = new URL(cosiumUrl).origin;
      if (!tab.url.startsWith(cosiumOrigin)) return;
    } catch(e) { return; }
    /* Fraicheur : max 30 min */
    if (Date.now() - pec.ts > 30 * 60 * 1000) {
      chrome.storage.local.remove("optibot_pec_pending");
      return;
    }
    chrome.tabs.sendMessage(tab.id, {
      type: "OPTIBOT_INJECT_PEC",
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
      /* Envoyer OPTIBOT_PAGE_LOADED au nouvel onglet (fix cross-domain Almerys target=_blank) */
      chrome.tabs.sendMessage(tabId, { type: "OPTIBOT_PAGE_LOADED" }, function() {
        if (chrome.runtime.lastError) {} /* silencieux */
      });
      /* V3-10 : Propager optibot_rpa — matching dynamique sur tout domaine */
      chrome.storage.local.get(["optibot_rpa"], function(result) {
        var rpa = result.optibot_rpa;
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
        var matches = domains.some(function(d) { return tabUrl.includes(d); });
        /* Matching dynamique : si le RPA contient un targetHostname, matcher dessus */
        if (!matches && rpa.targetHostname) {
          matches = tabUrl.includes(rpa.targetHostname);
        }
        /* Dernier recours : matcher le target directement comme sous-chaine du domaine */
        if (!matches && rpa.target.indexOf(".") !== -1) {
          matches = tabUrl.includes(rpa.target);
        }
        if (!matches) return;
        /* Données fraîches (< 5 min) — déclencher checkAndStartRPA via le content script */
        if (Date.now() - rpa.ts > 300000) { chrome.storage.local.remove("optibot_rpa"); return; }
        chrome.tabs.sendMessage(tabId, { type: "OPTIBOT_CHECK_RPA" }, function() {
          if (chrome.runtime.lastError) {} /* silencieux */
        });
      });
    }, 800);
  }
});

/* ── Lock d'inactivite avec chrome.alarms ─────────────────── */
function resetLockAlarm() {
  chrome.alarms.clear("optibot_lock", function() {
    chrome.alarms.create("optibot_lock", { delayInMinutes: INACTIVITY_MINUTES });
  });
  /* Mettre a jour le lockAt dans le storage */
  chrome.storage.local.set({ optibot_lock: { lockAt: Date.now() + INACTIVITY_MINUTES * 60 * 1000 } });
}

/* Creer l'alarme au demarrage du service worker */
resetLockAlarm();

/* ── Parcours dynamiques : refresh toutes les 30 min ────────────────────── */
chrome.alarms.create("optibot_dynamic_parcours", { delayInMinutes: 1, periodInMinutes: 30 });

function fetchAndCacheDynamicParcours() {
  chrome.storage.local.get(["optibot_auth"], function(result) {
    var auth = result.optibot_auth || {};
    if (!auth.syncToken) return;
    fetch(API_BASE + "/api/extension/parcours?handlers=true", {
      headers: { "Authorization": "Bearer " + auth.syncToken }
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (Array.isArray(data.handlers)) {
        chrome.storage.local.set({
          optibot_dynamic_parcours: { handlers: data.handlers, ts: Date.now() }
        });
      }
    })
    .catch(function(err) { console.warn("[OptiBot] dynamic parcours fetch failed:", err); });
  });
}

/* ── Remote Selector Overrides : meme cycle que les parcours ──────────────── */

function fetchAndCacheSelectorOverrides() {
  fetch(API_BASE + "/api/extension/selectors")
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data && data.overrides) {
        chrome.storage.local.set({
          optibot_selector_overrides: { overrides: data.overrides, version: data.version || 1, ts: Date.now() }
        });
      }
    })
    .catch(function(err) { console.warn("[OptiBot] selector overrides fetch failed:", err); });
}

/* ── US-9 : Remote Config Mappings — mise a jour silencieuse ─────────────── */
/* Charge les mappings complets (portails + ERPs) depuis le serveur.           */
/* Format JSON : { version, sources: [ { source, urlPattern, fields: {...} } ] } */
/* Chrome Web Store autorise les donnees JSON distantes, pas le code JS.       */

var MAPPINGS_CHECK_ALARM = "optibot_mappings_check";
/* Creer l'alarme : verif au demarrage + toutes les 24h */
chrome.alarms.create(MAPPINGS_CHECK_ALARM, { delayInMinutes: 2, periodInMinutes: 1440 });

function fetchAndCacheMappings() {
  chrome.storage.local.get(["optibot_mappings", "optibot_auth"], function(result) {
    var auth = result.optibot_auth || {};
    var cached = result.optibot_mappings || {};
    var localVersion = cached.version || 0;

    var headers = { "Content-Type": "application/json" };
    if (auth.syncToken) headers["Authorization"] = "Bearer " + auth.syncToken;

    fetch(API_BASE + "/api/extension/mappings?version=" + localVersion, { headers: headers })
      .then(function(r) {
        /* 304 = pas de changement */
        if (r.status === 304) {
          console.info("[OptiBot] Mappings a jour (version " + localVersion + ")");
          return null;
        }
        return r.json();
      })
      .then(function(data) {
        if (!data) return;
        if (data.version && data.sources) {
          chrome.storage.local.set({
            optibot_mappings: { version: data.version, sources: data.sources, ts: Date.now() }
          });
          console.info("[OptiBot] Mappings mis a jour → version " + data.version + " (" + data.sources.length + " sources)");
          /* Notifier les content scripts actifs */
          chrome.tabs.query({ active: true }, function(tabs) {
            tabs.forEach(function(tab) {
              if (tab.id) {
                chrome.tabs.sendMessage(tab.id, { type: "OPTIBOT_MAPPINGS_UPDATED", version: data.version })
                  .catch(function() {});
              }
            });
          });
        }
      })
      .catch(function(err) { console.warn("[OptiBot] mappings fetch failed:", err); });
  });
}

/* ── SSE Client (Bidirectional Sync) ──────────────────────────────────────── */
/* Chrome MV3 service workers ne supportent pas EventSource.                   */
/* On utilise fetch + ReadableStream pour parser le protocole SSE manuellement. */

var _sseReader = null;
var _sseRetryCount = 0;
var _sseRetryTimer = null;
var _sseConnected = false;
var SSE_RETRY_DELAYS = [5000, 10000, 30000, 60000]; /* backoff exponentiel */

function connectSSE() {
  chrome.storage.local.get(["optibot_auth", "optibot_lock"], function(result) {
    var auth = result.optibot_auth || {};
    var lock = result.optibot_lock || {};

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
            console.warn("[OptiBot] SSE read error:", err);
            if (_sseConnected) scheduleSSEReconnect();
          });
        }

        read();
      })
      .catch(function(err) {
        console.warn("[OptiBot] SSE connection error:", err);
        if (_sseConnected) scheduleSSEReconnect();
      });
  });
}

function disconnectSSE() {
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
      if (tab.url && (isActiveDomain(tab.url) || (tab.url.indexOf("optibot.fr") !== -1))) {
        chrome.tabs.sendMessage(tab.id, {
          type: "OPTIBOT_SSE_EVENT",
          payload: payload,
        }, function() {
          if (chrome.runtime.lastError) {} /* silencieux */
        });
      }
    });
  });
}

/* ── Alarme SSE keepalive (reconnecte si silent drop) ─────────────────────── */
chrome.alarms.create("optibot_sse_keepalive", { delayInMinutes: 20, periodInMinutes: 20 });

/* ── Cosium ERP : restaurer les scripts dynamiques au demarrage ─────── */
chrome.storage.local.get(["optibot_cosium_url"], function(result) {
  if (result.optibot_cosium_url) {
    registerCosiumScripts(result.optibot_cosium_url);
  }
});

async function registerCosiumScripts(cosiumUrl) {
  try {
    var origin = new URL(cosiumUrl).origin + "/*";

    /* Desinscrire les anciens scripts si existants */
    try {
      await chrome.scripting.unregisterContentScripts({ ids: ["optibot-cosium"] });
    } catch(e) { /* pas encore enregistre */ }

    /* Enregistrer les scripts Cosium */
    await chrome.scripting.registerContentScripts([{
      id: "optibot-cosium",
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

    chrome.storage.local.set({ optibot_cosium_url: cosiumUrl });
  } catch(e) {
    console.warn("[OptiBot] Cosium script registration failed:", e);
  }
}

/* ── Appels initiaux au demarrage du service worker ──────────────────────── */
fetchAndCacheDynamicParcours();
fetchAndCacheSelectorOverrides();
fetchAndCacheMappings();
connectSSE();

/* ── Alarm handler ───────────────────────────────────────────────────────── */
chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name === "optibot_lock") {
    /* Marquer comme verrouille ET supprimer le cache patient (donnees de sante) */
    chrome.storage.local.set({ optibot_lock: { lockAt: Date.now() - 1000 } });
    chrome.storage.local.remove(["optibot_cache", "optibot_rpa"]);
    disconnectSSE();
  }
  if (alarm.name === "optibot_dynamic_parcours") {
    fetchAndCacheDynamicParcours();
    fetchAndCacheSelectorOverrides();
  }
  if (alarm.name === MAPPINGS_CHECK_ALARM) {
    fetchAndCacheMappings();
  }
  if (alarm.name === "optibot_sse_keepalive") {
    /* Reconnecter si la connexion SSE est tombee silencieusement */
    if (!_sseConnected || !_sseReader) {
      connectSSE();
    }
  }
});

/* ── Messages depuis les content scripts et la popup ─────────────────────── */
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg && msg.type === 'OPTIBOT_OPEN_TAB' && msg.url) {
    chrome.tabs.create({ url: msg.url });
  }
  if (msg && msg.type === 'OPTIBOT_RENEW_LOCK') {
    resetLockAlarm();
    /* Reconnecter SSE si deconnecte apres lock */
    if (!_sseConnected) connectSSE();
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
    /* Effacer le badge apres 30 secondes */
    setTimeout(function() {
      chrome.action.setBadgeText({ text: "" });
    }, 30000);
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
