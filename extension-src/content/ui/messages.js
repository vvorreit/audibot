/* ── Chrome Runtime Message Listeners (consolidated) ──────────────────── */

chrome.runtime.onMessage.addListener(function(msg) {
  /* Toggle buttons visibility from popup */
  if (msg && msg.type === 'OPTIBOT_TOGGLE_BUTTONS') {
    setButtonsVisibility(msg.visible);
  }

  /* Auto-replay : notification page chargée depuis background.js */
  if (msg && msg.type === 'OPTIBOT_PAGE_LOADED') {
    var matchedPortail = Object.values(CONFIGS).find(function(cfg) { return cfg.isMatch(); });
    if (matchedPortail) {
      /* Plus de notification "données prêtes" — inutile et distrayant */
    }

    /* PEC Capture : detecter un accord PEC sur les portails mutuelles */
    setTimeout(function() {
      try { capturePECIfPresent(); } catch(e) { /* silencieux */ }
    }, 5000);
  }

  /* Launch parcours from popup */
  if (msg && msg.type === "OPTIBOT_LAUNCH_PARCOURS" && msg.parcoursId) {
    (async function() {
      var syncToken = await getSyncToken();
      if (!syncToken) return;
      try {
        var hostname = window.location.hostname.replace("www.", "");
        var res = await fetch("https://optibot.fr/api/extension/parcours?hostname=" + encodeURIComponent(hostname), { headers: { "Authorization": "Bearer " + syncToken } });
        if (!res.ok) return;
        var data = await res.json();
        var found = (data.parcours || []).find(function(p) { return p.id === msg.parcoursId; });
        if (!found) return;
        var cache = await readEncryptedCache() || {};
        startReplay(found, cache);
      } catch(e) {}
    })();
  }

  /* Recorder controls from popup */
  if (msg && msg.type === "OPTIBOT_RECORDER_START") startRecorder();
  if (msg && msg.type === "OPTIBOT_RECORDER_STOP") stopRecorder();
  if (msg && msg.type === "OPTIBOT_RECORDER_STATUS") {
    chrome.runtime.sendMessage({ type: "OPTIBOT_RECORDER_STATUS_REPLY", active: !!recorderState, etapes: recorderState ? recorderState.etapes.length : 0 });
  }
});
