/* ── RPA Entry Point — checkAndStartRPA ────────────────────────────────── */
/* RPA generalisé — replay parcours dynamique sur tout portail */

export function checkAndStartRPA() {
  var currentHostname = window.location.hostname;

  /* Vérifier que l'user a le plan PRO/EQUIPE/ADMIN avant de lancer */
  chrome.storage.local.get(['audibot_auth', 'audibot_rpa'], function(result) {
    var auth = result.audibot_auth || {};
    if (auth.rpaEnabled === false) {
      showRPAToast("RPA disponible \u00E0 partir du plan Pro", "info");
      return;
    }
    var rpa = result.audibot_rpa;
    if (!rpa || !rpa.target) return;

    /* Verifier que le RPA cible correspond au domaine courant */
    var rpaHostname = rpa.targetHostname || "";
    var targetMatchesCurrent = currentHostname.includes(rpa.target) || currentHostname.includes(rpaHostname);
    if (!targetMatchesCurrent) return;

    /* N'exécuter que si les données ont moins de 5 minutes */
    if (Date.now() - rpa.ts > 300000) {
      chrome.storage.local.remove('audibot_rpa');
      return;
    }

    /* ── Portail generique — replay parcours dynamique ── */
    var loginPage = /\/login|\/signin|\/connexion|\/auth|Login\.do/i.test(window.location.pathname)
      || (!!document.querySelector('input[type="password"]'));

    if (loginPage && !rpa.login_shown) {
      chrome.storage.local.set({ audibot_rpa: Object.assign({}, rpa, { login_shown: true }) });
      showRPAToast("\uD83D\uDD10 RPA : connectez-vous, le bot reprend automatiquement apr\u00E8s connexion", "info");
      var loginObs = new MutationObserver(function() {
        if (!document.querySelector('input[type="password"]')) {
          loginObs.disconnect();
          checkAndStartRPA();
        }
      });
      loginObs.observe(document.body, { childList: true, subtree: true });
      return;
    }

    /* Lancer le replay dynamique si un parcours est attache aux donnees RPA */
    if (rpa.parcours && rpa.parcours.etapes) {
      chrome.storage.local.remove('audibot_rpa');
      showRPAToast("RPA " + (rpa.target || "portail") + " : d\u00E9marrage...", "info");
      if (typeof replayParcours === "function") {
        replayParcours(rpa.parcours, rpa.payload);
      }
      return;
    }

    /* Fallback : tenter un Smart Fill avec les donnees RPA */
    chrome.storage.local.remove('audibot_rpa');
    showRPAToast("RPA " + (rpa.target || "portail") + " : remplissage automatique...", "info");
    if (typeof performSmartFill === "function") {
      performSmartFill();
    }
  }); /* end chrome.storage.local.get audibot_auth + audibot_rpa */
}
