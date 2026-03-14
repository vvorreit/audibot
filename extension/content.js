// ── AudiBot Multi-Site Dispatcher ───────────────────────────────────────────
// Portails supportés :
//   - Auditdata (app.auditdata.com) — logiciel audioprothésiste
//   - Almerys (mutuelle-almerys.com)
//   - Viamedis (viamedis.net)
//   - Ameli Pro / SCOR (amelipro.ameli.fr)

const CONFIGS = {

  // ── Auditdata ──────────────────────────────────────────────────────────────
  // TODO: Confirmer l'URL exacte de l'instance Auditdata (app.auditdata.com ou autre)
  // TODO: Mapper les vrais sélecteurs une fois l'accès obtenu (inspecter le DOM Auditdata)
  "auditdata.com": {
    name: "Auditdata",
    isMatch: () =>
      window.location.hostname.includes("auditdata.com"),
    actions: {
      formulaire: (data) => {
        const m = data.m || {};
        const o = data.o || {};
        const c = data.cached || {};

        // ── Champs patient ──
        // TODO: Remplacer ces sélecteurs par les vrais sélecteurs DOM Auditdata
        // Inspecter avec DevTools sur app.auditdata.com > fiche patient
        const patientSelectors = {
          nom:            '[data-field="lastName"], #lastName, [name="lastName"], input[placeholder*="Nom"]',
          prenom:         '[data-field="firstName"], #firstName, [name="firstName"], input[placeholder*="Prénom"]',
          dateNaissance:  '[data-field="birthDate"], #birthDate, [name="birthDate"], input[type="date"]',
          nss:            '[data-field="nss"], #nss, [name="socialSecurityNumber"]',
        };

        let filled = false;

        const nom = (m.nom || o.nomPatient || c.nom || "").toUpperCase();
        const prenom = capitalize(m.prenom || o.prenomPatient || c.prenom || "");
        const dob = m.dateNaissance || o.dateNaissancePatient || c.dob || "";
        const nss = m.numeroSecuriteSociale || c.nss || "";

        if (nom && ultraFill(findElement(patientSelectors.nom), nom)) filled = true;
        if (prenom) ultraFill(findElement(patientSelectors.prenom), prenom);
        if (dob) ultraFill(findElement(patientSelectors.dateNaissance), dob);
        if (nss) ultraFill(findElement(patientSelectors.nss), nss.slice(0, 13));

        // ── Champs prescription ORL ──
        // TODO: Mapper les champs audiogramme dans Auditdata (OD/OG par fréquence)
        // TODO: Mapper le champ classe d'appareillage (1 ou 2)
        // TODO: Mapper le champ type appareillage (BTE / ITE / RIC)
        //
        // Exemple de mapping à compléter :
        // const audioSelectors = {
        //   od_250: '[data-freq="250"][data-ear="right"]',
        //   od_500: '[data-freq="500"][data-ear="right"]',
        //   og_250: '[data-freq="250"][data-ear="left"]',
        //   ...
        // };
        // if (o.oreilleDroite?.hz250) ultraFill(findElement(audioSelectors.od_250), o.oreilleDroite.hz250);

        return filled;
      },
      synchroniser: async () => {
        // TODO: Implémenter la capture des données depuis le formulaire Auditdata
        // Lire les champs patient et les stocker dans le cache local
        console.log("AudiBot : synchronisation Auditdata — TODO");
        return false;
      }
    }
  },

  // ── Almerys ────────────────────────────────────────────────────────────────
  // Portail tiers-payant mutuelle — identique à OptiBot (champs communs)
  "mutuelle-almerys.com": {
    name: "Almerys",
    isMatch: () => window.location.hostname.includes("almerys.com"),
    actions: {
      formulaire: (data) => {
        const m = data.m || {};
        const c = data.cached || {};
        ultraFill(findElement('#nom_beneficiaire'), m.nom || c.nom);
        ultraFill(findElement('#nss_beneficiaire'), m.numeroSecuriteSociale || c.nss);
        return true;
      },
      synchroniser: async () => false
    }
  },

  // ── Viamedis ───────────────────────────────────────────────────────────────
  // Portail tiers-payant mutuelle — identique à OptiBot
  "viamedis.net": {
    name: "Viamedis",
    isMatch: () => window.location.hostname.includes("viamedis.net"),
    actions: {
      formulaire: (data) => {
        const m = data.m || {};
        const c = data.cached || {};
        // TODO: Vérifier les sélecteurs Viamedis et affiner si besoin
        ultraFill(findElement('[name="beneficiaire_nom"]'), m.nom || c.nom);
        ultraFill(findElement('[name="beneficiaire_prenom"]'), m.prenom || c.prenom);
        ultraFill(findElement('[name="beneficiaire_nss"]'), m.numeroSecuriteSociale || c.nss);
        return true;
      },
      synchroniser: async () => false
    }
  },

  // ── Ameli Pro / SCOR ───────────────────────────────────────────────────────
  // Portail professionnel de santé pour audioprothésistes
  "ameli.fr": {
    name: "Ameli Pro",
    isMatch: () =>
      window.location.hostname.includes("ameli.fr") ||
      window.location.hostname.includes("amelipro.ameli.fr"),
    actions: {
      formulaire: (data) => {
        const m = data.m || {};
        const c = data.cached || {};
        // TODO: Inspecter le DOM de amelipro.ameli.fr > télétransmission / feuille de soins
        // et mapper les sélecteurs réels ci-dessous
        const nom = m.nom || c.nom || "";
        const nss = m.numeroSecuriteSociale || c.nss || "";

        // Sélecteurs probables Ameli Pro (à confirmer via DevTools)
        ultraFill(findElement('[name="nom"], #benefNom'), nom);
        ultraFill(findElement('[name="nir"], #nirPatient, #benefNir'), nss.slice(0, 13));

        return !!(nom || nss);
      },
      synchroniser: async () => false
    }
  }
};

// ── Fonctions Utilitaires ────────────────────────────────────────────────────

function capitalize(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function findElement(selector) {
  if (!selector) return null;
  // Supporte les sélecteurs multiples séparés par virgule
  const selectors = selector.split(",").map(s => s.trim());
  for (const sel of selectors) {
    let el = document.querySelector(sel);
    if (el) return el;
    const iframes = document.querySelectorAll("iframe");
    for (let i = 0; i < iframes.length; i++) {
      try {
        el = iframes[i].contentDocument.querySelector(sel);
        if (el) return el;
      } catch (e) {}
    }
  }
  return null;
}

function ultraFill(el, val) {
  if (!el || val === undefined || val === null || val === "") return false;
  el.focus();
  el.value = val;
  ["focus", "input", "change", "keydown", "keypress", "keyup", "blur"].forEach((name) => {
    el.dispatchEvent(new Event(name, { bubbles: true, cancelable: true }));
  });
  if (window.$ && window.$(el).trigger) {
    window.$(el).val(val).trigger("input").trigger("change").trigger("keyup");
  }
  return true;
}

async function getCachedClient(data) {
  return new Promise((resolve) => {
    chrome.storage.local.get(["audibot_cache"], (result) => {
      const cache = result.audibot_cache || {};
      const now = Date.now();

      // Nettoyage automatique des entrées expirées
      Object.keys(cache).forEach((key) => {
        if (cache[key].expiresAt < now) delete cache[key];
      });
      chrome.storage.local.set({ audibot_cache: cache });

      if (!data.m && !data.o) {
        const clients = Object.values(cache).sort((a, b) => b.updatedAt - a.updatedAt);
        resolve(clients[0] || null);
        return;
      }

      const nss = data.m?.numeroSecuriteSociale;
      const nom = data.m?.nom || data.o?.nomPatient;
      const dob = data.m?.dateNaissance || data.o?.dateNaissancePatient;
      const match = cache[nss] || Object.values(cache).find((c) => c.nom === nom && c.dob === dob);
      resolve(match || null);
    });
  });
}

async function performFill() {
  let data = {};
  try {
    const text = await navigator.clipboard.readText();
    data = JSON.parse(text);

    // Sauvegarde automatique dans le cache AudiBot
    if (data.m || data.o) {
      const nss = data.m?.numeroSecuriteSociale;
      const nom = (data.m?.nom || data.o?.nomPatient || "").toUpperCase();
      const dob = data.m?.dateNaissance || data.o?.dateNaissancePatient;

      if (nom) {
        const key = nss || `${nom}-${dob}`;
        chrome.storage.local.get(["audibot_cache"], (result) => {
          const cache = result.audibot_cache || {};
          const existing = cache[key] || {};
          cache[key] = {
            ...existing,
            ...data.m,
            ordonnance: data.o || existing.ordonnance || {},
            updatedAt: Date.now(),
            expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24h
          };
          chrome.storage.local.set({ audibot_cache: cache });
        });
      }
    }
  } catch (e) {
    console.log("AudiBot : Presse-papier vide ou invalide, utilisation du cache local.");
  }

  const currentSite = Object.values(CONFIGS).find((cfg) => cfg.isMatch());
  if (!currentSite) return;

  data.cached = await getCachedClient(data);

  if (currentSite.actions.formulaire(data)) {
    const btn = document.getElementById("audibot-fill-btn");
    if (btn) {
      btn.innerText = "✓ Rempli !";
      btn.style.background = "#10b981";
      setTimeout(() => {
        btn.innerText = "🦻 Remplir";
        btn.style.background = "#2563eb";
      }, 2000);
    }
  } else {
    alert("AudiBot : Aucun formulaire détecté.");
  }
}

function showSyncButton() {
  if (document.getElementById("audibot-sync-btn")) return;
  const btn = document.createElement("button");
  btn.id = "audibot-sync-btn";
  btn.innerText = "💾 Mémoriser";
  btn.style.cssText = `
    position: fixed; bottom: 80px; right: 20px; z-index: 999999;
    background: #8b5cf6; color: white; border: none; padding: 12px 20px;
    border-radius: 50px; font-weight: bold; cursor: pointer;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2); font-family: sans-serif;
    transition: all 0.2s;
  `;
  btn.onclick = async () => {
    btn.innerText = "⏳ En cours...";
    const currentSite = Object.values(CONFIGS).find((cfg) => cfg.isMatch());
    const success = await currentSite.actions.synchroniser();
    if (success) {
      btn.innerText = "✅ Client mémorisé !";
      btn.style.background = "#10b981";
      setTimeout(() => {
        btn.innerText = "💾 Mémoriser";
        btn.style.background = "#8b5cf6";
      }, 2000);
    } else {
      btn.innerText = "❌ Formulaire vide";
      btn.style.background = "#ef4444";
      setTimeout(() => {
        btn.innerText = "💾 Mémoriser";
        btn.style.background = "#8b5cf6";
      }, 2000);
    }
  };
  document.body.appendChild(btn);
}

// ── Initialisation ──────────────────────────────────────────────────────────

function init() {
  if (window.location.hostname.includes("localhost")) return;

  const currentSite = Object.values(CONFIGS).find((cfg) => cfg.isMatch());
  if (!currentSite) return;

  if (!document.getElementById("audibot-fill-btn")) {
    const btn = document.createElement("button");
    btn.id = "audibot-fill-btn";
    btn.innerText = "🦻 Remplir";
    btn.style.cssText = `
      position: fixed; bottom: 20px; right: 20px; z-index: 999999;
      background: #2563eb; color: white; border: none; padding: 12px 20px;
      border-radius: 50px; font-weight: bold; cursor: pointer;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2); font-family: sans-serif;
      transition: all 0.2s;
    `;
    btn.onclick = performFill;
    document.body.appendChild(btn);
  }

  // Bouton Mémoriser sur Auditdata (site principal audioprothésiste)
  if (currentSite.name === "Auditdata") {
    showSyncButton();
  }
}

if (document.readyState === "complete") init();
else window.addEventListener("load", init);
