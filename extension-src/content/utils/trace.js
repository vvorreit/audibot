/* ── AudiBot Diagnostic Trace Logger ────────────────────────────────────── */
/* Ring buffer de logs structurés pour le diagnostic à distance.            */
/* Accessible via globalThis.optiTrace depuis tout le content script.      */

var MAX_ENTRIES = 3000;
var _buffer = [];
var _seq = 0;

var optiTrace = {
  /**
   * Ajouter une entrée au buffer de trace.
   * @param {string} cat  - Catégorie (DETECT, FILL, FILL_FAIL, SELECT, SELECT_FAIL,
   *                         SELECTOR, SELECTOR_FAIL, SMART_FILL, SMART_FILL_MISS,
   *                         SCRAPE, API, RECORDER, ERROR, IFRAME, EVENT, PAGE_INFO, PORTAL)
   * @param {string} msg  - Message court
   * @param {*} [data]    - Données optionnelles (objet, sera stringifié à l'export)
   */
  log: function(cat, msg, data) {
    _seq++;
    var entry = { seq: _seq, ts: Date.now(), cat: cat, msg: msg };
    if (data !== undefined) entry.data = data;
    _buffer.push(entry);
    if (_buffer.length > MAX_ENTRIES) _buffer.shift();
  },

  /** Retourne une copie du buffer entier */
  getAll: function() {
    return _buffer.slice();
  },

  /** Nombre d'entrées actuelles */
  count: function() {
    return _buffer.length;
  },

  /** Vider le buffer */
  clear: function() {
    _buffer = [];
    _seq = 0;
  },

  /**
   * Formater toutes les entrées en texte lisible pour copier/coller.
   * Format: [HH:MM:SS.mmm] [CATEGORY] message | {data}
   */
  formatText: function() {
    var lines = [];
    var extVersion = "?";
    try { extVersion = chrome.runtime.getManifest().version; } catch(e) {}

    lines.push("═══ AudiBot Diagnostic Trace ═══");
    lines.push("URL: " + window.location.href);
    lines.push("Hostname: " + window.location.hostname);
    lines.push("Timestamp: " + new Date().toISOString());
    lines.push("Extension: v" + extVersion);
    lines.push("UserAgent: " + navigator.userAgent);
    lines.push("Viewport: " + window.innerWidth + "x" + window.innerHeight);
    lines.push("Entries: " + _buffer.length);
    lines.push("═══════════════════════════════════");
    lines.push("");

    for (var i = 0; i < _buffer.length; i++) {
      var e = _buffer[i];
      var d = new Date(e.ts);
      var hh = String(d.getHours()).padStart(2, "0");
      var mm = String(d.getMinutes()).padStart(2, "0");
      var ss = String(d.getSeconds()).padStart(2, "0");
      var ms = String(d.getMilliseconds()).padStart(3, "0");
      var timeStr = hh + ":" + mm + ":" + ss + "." + ms;

      var line = "[" + timeStr + "] [" + (e.cat || "?").padEnd(15) + "] " + e.msg;
      if (e.data !== undefined) {
        try {
          var dataStr = typeof e.data === "string" ? e.data : JSON.stringify(e.data);
          if (dataStr.length > 500) dataStr = dataStr.slice(0, 500) + "…";
          line += " | " + dataStr;
        } catch(err) {
          line += " | [unserializable]";
        }
      }
      lines.push(line);
    }

    return lines.join("\n");
  },

  /**
   * Exporter en JSON structuré (pour envoi API éventuel)
   */
  toJSON: function() {
    var extVersion = "?";
    try { extVersion = chrome.runtime.getManifest().version; } catch(e) {}
    return {
      url: window.location.href,
      hostname: window.location.hostname,
      ts: new Date().toISOString(),
      version: extVersion,
      ua: navigator.userAgent,
      viewport: window.innerWidth + "x" + window.innerHeight,
      entries: _buffer.slice()
    };
  }
};

/* ── Auto-log page info au chargement ─────────────────────────────────── */
var _extVersion = "?";
try { _extVersion = chrome.runtime.getManifest().version; } catch(e) {}

optiTrace.log("PAGE_INFO", "Page loaded", {
  url: window.location.href,
  hostname: window.location.hostname,
  viewport: window.innerWidth + "x" + window.innerHeight,
  iframes: document.querySelectorAll("iframe").length,
  version: _extVersion,
  time: new Date().toISOString()
});

/* ── Capturer les erreurs JS non gérées ───────────────────────────────── */
window.addEventListener("error", function(ev) {
  optiTrace.log("ERROR", "Uncaught: " + (ev.message || "?"), {
    file: ev.filename,
    line: ev.lineno,
    col: ev.colno
  });
  /* Envoyer les logs au backend sur erreur critique */
  try { optiTrace.send("error", "JS Error: " + (ev.message || "?").slice(0, 100)); } catch(e2) {}
});

window.addEventListener("unhandledrejection", function(ev) {
  var reason = ev.reason;
  var msg = "Unhandled rejection";
  try { msg = reason && reason.message ? reason.message : String(reason).slice(0, 200); } catch(e) {}
  optiTrace.log("ERROR", "Promise: " + msg);
  try { optiTrace.send("error", "Promise: " + msg.slice(0, 100)); } catch(e2) {}
});

/* ── Envoi automatique des logs au backend ─────────────────────────────── */
var _lastSendTime = 0;
var SEND_COOLDOWN_MS = 30000; // 30s minimum entre deux envois

/**
 * Envoyer les logs au backend. Appelé automatiquement après chaque fill
 * et sur erreur critique. Rate-limited côté client (30s cooldown).
 *
 * @param {string} trigger - "auto" | "manual" | "error"
 * @param {string} [summary] - résumé court optionnel
 */
optiTrace.send = function(trigger, summary) {
  var now = Date.now();
  if (now - _lastSendTime < SEND_COOLDOWN_MS && trigger !== "manual") return;
  _lastSendTime = now;

  var count = _buffer.length;
  if (count === 0) return;

  var logsText = optiTrace.formatText();
  var extVersion = "?";
  try { extVersion = chrome.runtime.getManifest().version; } catch(e) {}

  /* Capturer le HTML anonymisé de la page actuelle */
  var htmlSnapshot = null;
  try {
    if (typeof globalThis.anonymizeHtmlSnapshot === "function") {
      htmlSnapshot = globalThis.anonymizeHtmlSnapshot();
      /* Limiter à 1MB pour éviter les payloads trop gros */
      if (htmlSnapshot && htmlSnapshot.length > 1000000) {
        htmlSnapshot = htmlSnapshot.slice(0, 1000000) + "\n<!-- truncated -->";
      }
    }
  } catch(e) { /* silencieux */ }

  /* Récupérer le syncToken de manière asynchrone */
  chrome.storage.local.get(["audibot_auth"], function(result) {
    var auth = result.audibot_auth || {};
    if (!auth.syncToken) return; /* pas connecté → on n'envoie pas */

    var payload = {
      syncToken: auth.syncToken,
      hostname: window.location.hostname,
      url: window.location.href,
      trigger: trigger || "auto",
      entryCount: count,
      summary: (summary || "").slice(0, 1000),
      logs: logsText,
      htmlSnapshot: htmlSnapshot || null,
      metadata: {
        version: extVersion,
        ua: navigator.userAgent,
        viewport: window.innerWidth + "x" + window.innerHeight,
        iframes: document.querySelectorAll("iframe").length,
        time: new Date().toISOString()
      }
    };

    /* Envoyer via le background service worker pour éviter CORS */
    try {
      chrome.runtime.sendMessage({
        type: "AUDIBOT_PING",
        payloads: [{
          url: "https://audibot.fr/api/extension/diagnostic",
          body: payload
        }]
      });
    } catch(e) { /* silencieux */ }
  });
};

/* ── Exposer globalement ──────────────────────────────────────────────── */
globalThis.optiTrace = optiTrace;
