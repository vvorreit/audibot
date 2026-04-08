/* ── Macro Recorder — startRecorder, stopRecorder, restoreRecorderIfNeeded, sendRecorderParcours ── */

/* Démarrer l'enregistrement */
export function startRecorder() {
  if (recorderState) return;
  recorderState = {
    etapes: [],
    hostname: window.location.hostname.replace("www.", ""),
    startTime: Date.now(),
    paused: false,
  };

  /* Badge enregistrement avec bouton pause */
  var badge = document.createElement("div");
  badge.id = "audibot-recorder-badge";
  badge.style.cssText = "position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:2147483647;background:#ef4444;color:white;padding:8px 20px;border-radius:50px;font-family:sans-serif;font-size:13px;font-weight:bold;box-shadow:0 4px 15px rgba(0,0,0,0.3);display:flex;align-items:center;gap:8px;cursor:default;user-select:none;";
  badge.innerHTML = '<span id="audibot-rec-dot" style="width:10px;height:10px;background:white;border-radius:50%;display:inline-block;animation:pulse 1s infinite;"></span> <span id="audibot-rec-text">Enregistrement en cours</span> <button id="audibot-rec-pause" style="margin-left:8px;padding:2px 10px;border:1px solid rgba(255,255,255,0.5);border-radius:20px;background:transparent;color:white;font-size:11px;font-weight:600;cursor:pointer;">\u23F8 Pause</button>';
  document.body.appendChild(badge);

  /* Événement pause/reprise */
  var pauseBtn = document.getElementById("audibot-rec-pause");
  if (pauseBtn) {
    pauseBtn.addEventListener("click", function(ev) {
      ev.stopPropagation();
      toggleRecorderPause();
    });
  }

  /* Style animation */
  if (!document.getElementById("audibot-recorder-style")) {
    var style = document.createElement("style");
    style.id = "audibot-recorder-style";
    style.textContent = "@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} } .audibot-recorder-step-row:hover { background:#f9fafb; }";
    document.head.appendChild(style);
  }

  /* Écouter les events sur le document principal */
  document.addEventListener("click", onRecorderClick, true);
  document.addEventListener("change", onRecorderChange, true);
  document.addEventListener("blur", onRecorderBlur, true);

  /* Iframes : attacher les listeners dans chaque iframe accessible */
  function attachRecorderToIframes() {
    var iframes = document.querySelectorAll("iframe");
    for (var i = 0; i < iframes.length; i++) {
      try {
        var iDoc = iframes[i].contentDocument || (iframes[i].contentWindow && iframes[i].contentWindow.document);
        if (!iDoc || iDoc._audibotRecorder) continue;
        iDoc._audibotRecorder = true;
        iDoc.addEventListener("click", onRecorderClick, true);
        iDoc.addEventListener("change", onRecorderChange, true);
        iDoc.addEventListener("blur", onRecorderBlur, true);
      } catch(e) { /* cross-origin */ }
    }
  }
  attachRecorderToIframes();

  /* Observer les iframes qui apparaissent dynamiquement */
  var iframeObserver = new MutationObserver(function() {
    attachRecorderToIframes();
  });
  iframeObserver.observe(document.body, { childList: true, subtree: true });
  recorderState._iframeObserver = iframeObserver;

  /* Persister l'état dans chrome.storage pour survivre aux navigations */
  chrome.storage.local.set({ audibot_recorder: { active: true, etapes: [], hostname: recorderState.hostname, startTime: recorderState.startTime } });

  /* Afficher le panneau guidé latéral */
  showRecorderPanel();
  updateRecorderPanel();

  showRPAToast("\u23FA Enregistrement d\u00E9marr\u00E9 \u2014 effectuez le parcours", "info");
}

/* Pause / Reprise de l'enregistrement */
export function toggleRecorderPause() {
  if (!recorderState) return;
  recorderState.paused = !recorderState.paused;

  var dot = document.getElementById("audibot-rec-dot");
  var text = document.getElementById("audibot-rec-text");
  var pauseBtn = document.getElementById("audibot-rec-pause");
  var badge = document.getElementById("audibot-recorder-badge");

  if (recorderState.paused) {
    if (dot) dot.style.animation = "none";
    if (dot) dot.style.background = "#fbbf24";
    if (text) text.textContent = "En pause (" + recorderState.etapes.length + " \u00E9tapes)";
    if (pauseBtn) pauseBtn.textContent = "\u25B6 Reprendre";
    if (badge) badge.style.background = "#6b7280";
    showRPAToast("\u23F8 Enregistrement en pause", "info");
  } else {
    if (dot) dot.style.animation = "pulse 1s infinite";
    if (dot) dot.style.background = "white";
    if (text) text.textContent = "Enregistrement (" + recorderState.etapes.length + " \u00E9tapes)";
    if (pauseBtn) pauseBtn.textContent = "\u23F8 Pause";
    if (badge) badge.style.background = "#ef4444";
    showRPAToast("\u23FA Enregistrement repris", "info");
  }
}

/* Arrêter l'enregistrement et afficher le wizard */
export async function stopRecorder() {
  if (!recorderState) return;

  document.removeEventListener("click", onRecorderClick, true);
  document.removeEventListener("change", onRecorderChange, true);
  document.removeEventListener("blur", onRecorderBlur, true);

  /* Détacher les listeners des iframes + stopper l'observer */
  if (recorderState._iframeObserver) {
    recorderState._iframeObserver.disconnect();
  }
  try {
    var iframes = document.querySelectorAll("iframe");
    for (var i = 0; i < iframes.length; i++) {
      try {
        var iDoc = iframes[i].contentDocument || (iframes[i].contentWindow && iframes[i].contentWindow.document);
        if (!iDoc) continue;
        iDoc._audibotRecorder = false;
        iDoc.removeEventListener("click", onRecorderClick, true);
        iDoc.removeEventListener("change", onRecorderChange, true);
        iDoc.removeEventListener("blur", onRecorderBlur, true);
      } catch(e) {}
    }
  } catch(e) {}

  var badge = document.getElementById("audibot-recorder-badge");
  if (badge) badge.remove();

  /* Retirer le panneau guidé et les highlights */
  var panel = document.getElementById("audibot-recorder-panel");
  if (panel) panel.remove();
  removeRecorderHighlights();

  var etapes = recorderState.etapes;
  var hostname = recorderState.hostname;
  recorderState = null;

  /* Nettoyer le storage */
  chrome.storage.local.remove("audibot_recorder");

  if (etapes.length === 0) {
    showRPAToast("Aucune \u00E9tape enregistr\u00E9e.", "info");
    return;
  }

  /* Capturer un seul htmlSnapshot à la fin (au lieu d'un par étape) */
  var finalSnapshot = anonymizeHtmlSnapshot();
  for (var si = 0; si < etapes.length; si++) {
    if (etapes[si].url === window.location.href) {
      etapes[si].htmlSnapshot = finalSnapshot;
      break;
    }
  }

  /* Afficher le wizard */
  showRecorderWizard(etapes, hostname);
}

/* Envoyer le parcours enregistré au serveur */
export async function sendRecorderParcours(etapes, hostname, nom) {
  var syncToken = await getSyncToken();
  if (!syncToken) {
    showRPAToast("Erreur : non connect\u00E9.", "error");
    return;
  }

  try {
    var res = await fetch("https://audibot.fr/api/extension/parcours/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: syncToken,
        hostname: hostname,
        nom: nom,
        etapes: etapes,
      }),
    });
    if (res.ok) {
      showRPAToast("\u2705 Parcours enregistr\u00E9 (" + etapes.length + " \u00E9tapes) \u2014 en attente de validation", "success");
    } else {
      var err = await res.json().catch(function() { return {}; });
      showRPAToast("Erreur : " + (err.error || "envoi \u00E9chou\u00E9"), "error");
    }
  } catch(e) {
    showRPAToast("Erreur r\u00E9seau.", "error");
  }
}

/* Restaurer le recorder si une navigation a eu lieu pendant l'enregistrement */
export function restoreRecorderIfNeeded() {
  chrome.storage.local.get(["audibot_recorder"], function(result) {
    var saved = result.audibot_recorder;
    if (!saved || !saved.active) return;

    recorderState = {
      etapes: saved.etapes || [],
      hostname: saved.hostname || window.location.hostname.replace("www.", ""),
      startTime: saved.startTime || Date.now(),
    };

    /* Ré-afficher le badge */
    if (!document.getElementById("audibot-recorder-badge")) {
      var badge = document.createElement("div");
      badge.id = "audibot-recorder-badge";
      badge.style.cssText = "position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:2147483647;background:#ef4444;color:white;padding:8px 20px;border-radius:50px;font-family:sans-serif;font-size:13px;font-weight:bold;box-shadow:0 4px 15px rgba(0,0,0,0.3);display:flex;align-items:center;gap:8px;";
      badge.innerHTML = '<span style="width:10px;height:10px;background:white;border-radius:50%;display:inline-block;animation:pulse 1s infinite;"></span> Enregistrement (' + recorderState.etapes.length + ' \u00E9tapes) \u2014 continuez';
      document.body.appendChild(badge);
    }

    /* Ré-attacher les listeners */
    document.addEventListener("click", onRecorderClick, true);
    document.addEventListener("change", onRecorderChange, true);
    document.addEventListener("blur", onRecorderBlur, true);

    /* Ré-afficher le panneau guidé */
    showRecorderPanel();
    updateRecorderPanel();

    showRPAToast("\u23FA Enregistrement repris (" + recorderState.etapes.length + " \u00E9tapes)", "info");
  });
}
