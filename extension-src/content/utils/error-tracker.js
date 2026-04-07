/* ── OptiBot Error Tracker ──────────────────────────────────────────────── */
/* Centralise le suivi des erreurs silencieuses dans l'extension.           */
/* Les erreurs sont loguees localement et envoyees en batch au backend.     */

var _errorBuffer = [];
var _flushTimer = null;
var FLUSH_INTERVAL = 30000;
var MAX_BUFFER = 50;

export function trackError(context, error) {
  var entry = {
    context: context,
    message: error && error.message ? error.message : String(error || "unknown"),
    ts: Date.now(),
    url: window.location.hostname
  };
  if (globalThis.optiTrace) {
    globalThis.optiTrace.log("ERROR", context + ": " + entry.message);
  }
  _errorBuffer.push(entry);
  if (_errorBuffer.length >= MAX_BUFFER) flushErrors();
  if (!_flushTimer) {
    _flushTimer = setTimeout(function() { _flushTimer = null; flushErrors(); }, FLUSH_INTERVAL);
  }
}

function flushErrors() {
  if (_errorBuffer.length === 0) return;
  var batch = _errorBuffer.splice(0, MAX_BUFFER);
  if (typeof globalThis.getSyncToken !== "function") return;
  globalThis.getSyncToken().then(function(token) {
    if (!token) return;
    fetch("https://optibot.fr/api/extension/bot-step-log", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
      body: JSON.stringify({ type: "extension_errors", errors: batch, ts: Date.now() })
    }).catch(function() { /* network failure — discard */ });
  }).catch(function() {});
}

globalThis.trackError = trackError;
