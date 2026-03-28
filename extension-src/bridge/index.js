/* OptiBot Bridge — ecoute les donnees copiees depuis le dashboard OptiBot
   et les sauvegarde chiffrees dans chrome.storage.local */

/* Origines autorisées à envoyer des messages au bridge */
var ALLOWED_ORIGINS = ['https://optibot.fr', 'https://app.optibot.fr'];

window.addEventListener('message', async (event) => {
  if (event.source !== window) return;
  /* Vérifier l'origine pour les événements cross-frame */
  if (event.origin && event.origin !== window.location.origin &&
      !ALLOWED_ORIGINS.includes(event.origin)) return;

  /* Auth — stocker le syncToken dans optibot_auth (non chiffre, sert de cle) */
  if (event.data && event.data.type === 'OPTIBOT_AUTH' && event.data.syncToken) {
    chrome.storage.local.set({
      optibot_auth: {
        syncToken: event.data.syncToken,
        plan: event.data.plan,
        isPro: event.data.isPro,
        rpaEnabled: event.data.rpaEnabled !== undefined ? event.data.rpaEnabled : (event.data.isPro || false),
        authAt: Date.now(),
        authExpiresAt: event.data.expiresAt || (Date.now() + 20 * 60 * 60 * 1000)
      }
    });
    /* Renouveler le lock d'inactivite a chaque auth */
    chrome.storage.local.set({ optibot_lock: { lockAt: Date.now() + 15 * 60 * 1000 } });
    return;
  }

  /* RPA Start — stocker les donnees CHIFFRÉES AVANT d'ouvrir l'onglet cible */
  if (event.data && event.data.type === 'OPTIBOT_RPA_START') {
    var rpaTarget = event.data.target;
    var rpaUrls = {
      'wemind': 'https://pro.wemind.io/p/accueil',
      'almerys': 'https://www.be-almerys.com/espace-professionnels'
    };
    var rpaUrl = rpaUrls[rpaTarget];
    if (!rpaUrl) return;

    /* Chiffrer le payload (contient NSS, ordonnance, données de santé) */
    (async function() {
      var payload = event.data.payload || {};
      var encryptedPayload = await encryptData(payload);

      if (!encryptedPayload) {
        console.warn("[OptiBot Bridge] RPA annulé — chiffrement impossible.");
        return;
      }

      chrome.storage.local.set({
        optibot_rpa: {
          target: rpaTarget,
          payload: encryptedPayload, /* chiffré AES-256-GCM */
          ts: Date.now()
        }
      }, function() {
        chrome.runtime.sendMessage({ type: 'OPTIBOT_OPEN_TAB', url: rpaUrl });
      });
    })();
    return;
  }

  if (!event.data || event.data.type !== 'OPTIBOT_DATA') return;

  const { m, o } = event.data.payload || {};
  if (!m && !o) return;

  /* Fallback personnes[0] si champs top-level vides */
  const personnes = (m && m.personnes) || [];
  const p0 = personnes.length > 0 ? personnes[0] : {};

  let nss = (m && m.numeroSecuriteSociale) || "";
  if (!nss && personnes.length > 0) {
    for (let i = 0; i < personnes.length; i++) {
      const pNSS = (personnes[i].numeroSecuriteSociale || "").replace(/\D/g, "");
      if (pNSS.length >= 13) { nss = personnes[i].numeroSecuriteSociale; break; }
    }
  }

  const nom = ((m && m.nom) || p0.nom || (o && o.nomPatient) || "").toUpperCase();
  const prenom = (m && m.prenom) || p0.prenom || (o && o.prenomPatient) || "";
  const dob = (m && m.dateNaissance) || p0.dateNaissance || (o && o.dateNaissancePatient) || "";

  const cacheObj = {
    current: {
      ...(m || {}),
      nom: nom,
      prenom: prenom,
      numeroSecuriteSociale: nss,
      dateNaissance: dob,
      ordonnance: o || {},
      updatedAt: Date.now()
    }
  };

  /* Chiffrer et stocker */
  await writeEncryptedCache(cacheObj);
});
