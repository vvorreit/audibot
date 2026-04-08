/* ── Standard Fill — performFill + checkDroitsMutuelle ─────────────────── */

export async function performFill() {
  let data = {};
  try {
    const text = await navigator.clipboard.readText();
    data = JSON.parse(text);

    // Sauvegarde automatique des données du presse-papier dans le cache
    if (data.m || data.o) {
      const nom = (data.m?.nom || data.o?.nomPatient || "").toUpperCase();

      if (nom) {
        writeEncryptedCache({
          current: {
            ...data.m,
            ordonnance: data.o || {},
            updatedAt: Date.now()
          }
        });
      }
    }

  } catch (e) {
    /* Presse-papier vide ou invalide — utilisation du cache local */
  }

  /* Broadcast aux iframes cross-domain via postMessage */
  var frames = document.querySelectorAll("iframe");
  for (var fi = 0; fi < frames.length; fi++) {
    try { if (frames[fi].src) { var frameOrigin = new URL(frames[fi].src).origin; frames[fi].contentWindow.postMessage({ type: "AUDIBOT_FILL_FRAME", payload: data }, frameOrigin); } } catch(e) {}
  }

  const currentSite = Object.values(CONFIGS).find(cfg => cfg.isMatch());
  if (!currentSite) return;

  data.cached = await getCachedClient(data);

  /* Vérification droits mutuelle */
  checkDroitsMutuelle(data);

  const success = currentSite.actions.formulaire(data);
  const site = currentSite.name;
  const fieldsCount = Object.keys(data.cached || data.m || {}).length;

  /* Monitoring : log local + envoi API best-effort */
  chrome.storage.local.get(["audibot_injection_log"], (logResult) => {
    const log = logResult.audibot_injection_log || [];
    log.unshift({
      ts: Date.now(),
      site,
      success,
      fieldsCount,
      syncToken: data.syncToken || null
    });
    chrome.storage.local.set({ audibot_injection_log: log.slice(0, 100) });
  });

  /* Envoyer les pings via le background service worker pour éviter CORS */
  var extVersion = (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getManifest)
    ? chrome.runtime.getManifest().version
    : "bookmarklet";
  var pingPayloads = [];
  const syncToken = data.syncToken || null;
  if (syncToken && success !== undefined) {
    pingPayloads.push({ url: "https://audibot.fr/api/extension/log-injection", body: { syncToken, site, success, fieldsCount, ts: Date.now() } });
  }
  pingPayloads.push({ url: "https://audibot.fr/api/bookmarklet/ping", body: {
    version: extVersion, portal: site || "unknown",
    status: success ? "ok" : (fieldsCount === 0 ? "broken" : "partial"),
    errorHint: success ? null : ("fields=" + fieldsCount)
  }});
  try {
    chrome.runtime.sendMessage({ type: "AUDIBOT_PING", payloads: pingPayloads });
  } catch(e) { /* jamais bloquer l'UI */ }

  if (success) {
    const btn = document.getElementById('audibot-fill-btn');
    if (btn) {
      btn.innerText = `\u2713 Rempli !`;
      btn.style.background = '#10b981';
      setTimeout(() => {
        btn.innerText = '\uD83E\uDD16 Remplir';
        btn.style.background = '#2563eb';
      }, 2000);
    }
  } else {
    alert(`AudiBot : Aucun formulaire d\u00E9tect\u00E9.`);
  }
}

export function checkDroitsMutuelle(data) {
  var m = data.m || data || {};
  var dateFin = m.dateFinValidite || "";
  var dateDebut = m.dateDebutValidite || "";
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  if (dateFin) {
    var parts = dateFin.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
    if (parts) {
      var finDate = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]));
      if (finDate < today) {
        showRPAToast("\u26D4 Droits mutuelle expir\u00E9s depuis le " + dateFin, "error");
        return;
      }
      var diffDays = Math.ceil((finDate - today) / (1000 * 60 * 60 * 24));
      if (diffDays <= 30) {
        showRPAToast("\u26A0\uFE0F Droits mutuelle expirent dans " + diffDays + " jour" + (diffDays > 1 ? "s" : "") + " (" + dateFin + ")", "warning");
        return;
      }
    }
  }

  if (dateDebut) {
    var partsD = dateDebut.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
    if (partsD) {
      var debutDate = new Date(parseInt(partsD[3]), parseInt(partsD[2]) - 1, parseInt(partsD[1]));
      if (debutDate > today) {
        showRPAToast("\u26A0\uFE0F Droits mutuelle pas encore actifs (d\u00E9but : " + dateDebut + ")", "warning");
      }
    }
  }
}
