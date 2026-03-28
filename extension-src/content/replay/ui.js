/* ── Replay UI — showReplayControls + sendHealthPing ──────────────────── */

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
  btnResume.onclick = function() { div.remove(); if (replayState && replayState.onResume) replayState.onResume(); };
  var btnAbort = document.createElement("button");
  btnAbort.type = "button";
  btnAbort.innerText = "\u2715 Abandonner";
  btnAbort.style.cssText = "padding:10px 20px;background:#ef4444;color:white;border:none;border-radius:12px;font-weight:bold;cursor:pointer;font-family:sans-serif;";
  btnAbort.onclick = function() { div.remove(); replayState = null; showRPAToast("Parcours abandonn\u00E9.", "info"); };
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
