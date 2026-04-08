/* ── RPA Utilities — Toast, Logging, Replay Controls, Health Ping ─────── */

import { getToastBottom } from "./ui/buttons.js";
import { getReplayState, setReplayState } from "./replay/index.js";

// ── RPA Logging ─────────────────────────────────────────────────────────────

export function logRPA(mutuelle, etape, statut, erreur) {
  chrome.storage.local.get(["optibot_auth"], function(result) {
    var syncToken = (result.optibot_auth && result.optibot_auth.syncToken) || null;
    fetch("https://optibot.fr/api/extension/rpa-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        syncToken: syncToken,
        mutuelle: mutuelle,
        etape: etape,
        statut: statut,
        erreur: erreur || null,
        url: window.location.href
      })
    }).catch(function(err) { console.warn("[OptiBot] RPA log failed:", err); }); /* silent fail */
  });
}

// ── RPA Toast ───────────────────────────────────────────────────────────────

export function showRPAToast(message, type) {
  var existing = document.getElementById('optibot-rpa-toast');
  if (existing) existing.remove();

  var colors = {
    info: { bg: '#2563eb', border: '#3b82f6' },
    success: { bg: '#10b981', border: '#34d399' },
    warning: { bg: '#f59e0b', border: '#fbbf24' },
    error: { bg: '#ef4444', border: '#f87171' }
  };
  var c = colors[type] || colors.info;

  var toast = document.createElement('div');
  toast.id = 'optibot-rpa-toast';
  toast.textContent = message;
  toast.style.cssText = [
    'position: fixed; bottom: ' + getToastBottom() + 'px; right: 20px; z-index: 9999999;',
    'background: ' + c.bg + '; color: white; border: 2px solid ' + c.border + ';',
    'padding: 14px 22px; border-radius: 14px; font-weight: 600; font-size: 13px;',
    'font-family: sans-serif; box-shadow: 0 8px 30px rgba(0,0,0,0.25);',
    'max-width: 360px; line-height: 1.4; opacity: 0; transition: opacity 0.3s;'
  ].join('');
  document.body.appendChild(toast);
  requestAnimationFrame(function() { toast.style.opacity = '1'; });

  setTimeout(function() {
    toast.style.opacity = '0';
    setTimeout(function() { toast.remove(); }, 300);
  }, 4000);
}

/* ── Replay Engine — UI & Health (unique to index.js) ─────────────────────── */

export function showReplayControls() {
  var existing = document.getElementById("optibot-replay-controls");
  if (existing) existing.remove();
  var div = document.createElement("div");
  div.id = "optibot-replay-controls";
  div.style.cssText = "position:fixed;bottom:80px;right:20px;z-index:2147483646;display:flex;flex-direction:column;gap:8px;";
  var btnResume = document.createElement("button");
  btnResume.type = "button";
  btnResume.innerText = "\u25B6 Reprendre";
  btnResume.style.cssText = "padding:10px 20px;background:#2563eb;color:white;border:none;border-radius:12px;font-weight:bold;cursor:pointer;font-family:sans-serif;";
  btnResume.onclick = function() { div.remove(); var rs = getReplayState(); if (rs && rs.onResume) rs.onResume(); };
  var btnAbort = document.createElement("button");
  btnAbort.type = "button";
  btnAbort.innerText = "\u2715 Abandonner";
  btnAbort.style.cssText = "padding:10px 20px;background:#ef4444;color:white;border:none;border-radius:12px;font-weight:bold;cursor:pointer;font-family:sans-serif;";
  btnAbort.onclick = function() { div.remove(); setReplayState(null); showRPAToast("Parcours abandonn\u00E9.", "info"); };
  div.appendChild(btnResume);
  div.appendChild(btnAbort);
  document.body.appendChild(div);
}

export function sendHealthPing(portal, status, errorHint) {
  try {
    var version = (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getManifest) ? chrome.runtime.getManifest().version : "unknown";
    fetch("https://optibot.fr/api/bookmarklet/ping", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version: version, portal: portal, status: status, errorHint: errorHint })
    }).catch(function(err) { console.warn("[OptiBot] health ping failed:", err); });
  } catch(e) {}
}
