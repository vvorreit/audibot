/* OptiBot — Rejet Detector v1.0
   Content script for auto-detecting rejections on mutual insurance portals.
   Fetches selector config from remote API and scans pages for rejections.
   RGPD: No sensitive data stored locally. Data sent to OptiBot API only. */

(function () {
  "use strict";

  var API_BASE = "https://optibot.fr";
  var CONFIG_URL = API_BASE + "/api/extension/rejet-config";
  var REJET_URL = API_BASE + "/api/extension/rejet-detecte";
  var CHECK_INTERVAL = 10000; /* 10 seconds */
  var config = null;
  var currentPortail = null;
  var detectedRejets = new Set();
  var enabled = true;

  function getPortailFromUrl(url) {
    if (url.includes("almerys.com") || url.includes("be-almerys.com")) return "ALMERYS";
    if (url.includes("viamedis.net")) return "VIAMEDIS";
    if (url.includes("ism-tp.fr")) return "ITELIS";
    if (url.includes("actil.com")) return "KALIXIA";
    if (url.includes("oxantis.net")) return "OXANTIS";
    if (url.includes("generation.fr")) return "GENERATION";
    if (url.includes("ffl-promoteur.com") || url.includes("spsante.fr")) return "SP_SANTE";
    if (url.includes("santeclair.fr")) return "SANTECLAIR";
    if (url.includes("livebyoptimum.com")) return "LBO";
    if (url.includes("solimut.fr")) return "SOLIMUT";
    if (url.includes("mercernet.fr") || url.includes("services-fm.net")) return "MERCER";
    if (url.includes("wemind.io")) return "WEMIND";
    if (url.includes("ameli.fr")) return "AMELI";
    if (url.includes("carteblanchepartenaires.fr")) return "CARTE_BLANCHE";
    if (url.includes("kalixia.fr") || url.includes("kalixia-partenaires.fr")) return "KALIXIA";
    if (url.includes("optistya.fr")) return "OPTISTYA";
    if (url.includes("groupama.com")) return "GROUPAMA";
    if (url.includes("korelio.com")) return "KORELIO";
    if (url.includes("seveane.com")) return "SEVEANE";
    if (url.includes("tp-harmonie.net")) return "HARMONIE";
    if (url.includes("tp-isante.fr")) return "ISANTE";
    if (url.includes("tp-eovi-mcd.net")) return "AESIO";
    if (url.includes("mysanteclair.fr")) return "SANTECLAIR";
    if (url.includes("tpcomplementaire.fr")) return "INTERAMC";
    return null;
  }

  function getSyncToken() {
    return new Promise(function (resolve) {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        /* Lire depuis optibot_auth (clé principale depuis la migration chiffrement) */
        chrome.storage.local.get(["optibot_auth"], function (result) {
          if (result.optibot_auth && result.optibot_auth.syncToken) {
            resolve(result.optibot_auth.syncToken);
            return;
          }
          resolve(null);
        });
      } else {
        resolve(null);
      }
    });
  }

  function loadConfig() {
    return fetch(CONFIG_URL)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        config = data;
        return data;
      })
      .catch(function (err) {
        console.warn("[OptiBot Rejet] Config fetch failed:", err);
        return null;
      });
  }

  function extractText(el, selector) {
    if (!selector) return null;
    var selectors = selector.split(",").map(function (s) { return s.trim(); });
    for (var i = 0; i < selectors.length; i++) {
      var found = el.querySelector(selectors[i]);
      if (found) return (found.textContent || "").trim();
    }
    return null;
  }

  /* ── Ameli Pro rejection patterns ──────────────────────────────────────── */
  var AMELI_REJET_PATTERNS = [
    { re: /rejet[eé]?\b/i, type: "definitif" },
    { re: /refus[eé]?\b/i, type: "definitif" },
    { re: /paiement\s+refus/i, type: "definitif" },
    { re: /non\s+conforme/i, type: "definitif" },
    { re: /droits?\s+(clos|ferm|expir)/i, type: "definitif" },
    { re: /beneficiaire\s+(inconnu|non\s+identif)/i, type: "definitif" },
    { re: /prescripteur\s+(inconnu|non\s+identif)/i, type: "definitif" },
    { re: /rejet\s+noemie/i, type: "definitif" },
    { re: /signalement\s+d['']anomalie/i, type: "definitif" },
    { re: /erreur\s+technique/i, type: "technique" },
    { re: /indisponible/i, type: "technique" },
    { re: /timeout|time.?out/i, type: "technique" },
    { re: /veuillez\s+r[eé]essayer/i, type: "technique" },
  ];

  function scanAmeliRejets() {
    var rejets = [];
    /* Cibler les elements d'alerte/statut — pas tous les elements du DOM */
    var candidates = document.querySelectorAll(
      ".alert, .notification, .message, .erreur, .error, .warning, " +
      "[class*=alert], [class*=error], [class*=rejet], [class*=refus], " +
      "[role=alert], [role=status], .resultat, .retour, .statut, [class*=statut]"
    );

    for (var i = 0; i < candidates.length; i++) {
      var el = candidates[i];
      var elText = (el.textContent || "").trim();
      if (!elText || elText.length < 5 || elText.length > 500) continue;

      for (var p = 0; p < AMELI_REJET_PATTERNS.length; p++) {
        var pattern = AMELI_REJET_PATTERNS[p];
        if (!pattern.re.test(elText)) continue;

        var key = "AMELI|" + elText.substring(0, 80);
        if (detectedRejets.has(key)) break;
        detectedRejets.add(key);

        var dossierMatch = (el.parentElement ? el.parentElement.textContent : elText).match(/(?:dossier|fse|lot|n[°o])\s*[:=]?\s*([A-Z0-9\-]{4,20})/i);
        var dateMatch = (el.parentElement ? el.parentElement.textContent : elText).match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})/);
        var montantMatch = (el.parentElement ? el.parentElement.textContent : elText).match(/(\d+[.,]\d{2}\s*(?:€|EUR)?)/);

        var rejet = {
          portail: "AMELI",
          numeroDossier: dossierMatch ? dossierMatch[1] : null,
          motif: elText.substring(0, 200),
          dateRejet: dateMatch ? dateMatch[1] : null,
          montant: montantMatch ? montantMatch[1] : null,
          rejetType: pattern.type,
        };

        rejets.push(rejet);
        storeRejetLocally(rejet);
        notifyBadgeRejet(rejet);
        if (pattern.type === "definitif") injectRejetNoteCosium(rejet);

        break;
      }
    }
    return rejets;
  }

  /* ── Historique local (pas cote serveur pour les techniques) ──────────── */
  function storeRejetLocally(rejet) {
    chrome.storage.local.get(["optibot_rejet_history"], function(result) {
      var history = result.optibot_rejet_history || [];
      history.unshift({
        portail: rejet.portail, motif: rejet.motif, type: rejet.rejetType || "definitif",
        numeroDossier: rejet.numeroDossier, date: rejet.dateRejet, ts: Date.now()
      });
      if (history.length > 100) history = history.slice(0, 100);
      chrome.storage.local.set({ optibot_rejet_history: history });
    });
  }

  /* ── Badge rouge ──────────────────────────────────────────────────────── */
  function notifyBadgeRejet(rejet) {
    chrome.runtime.sendMessage({
      type: "OPTIBOT_REJET_BADGE",
      rejetType: rejet.rejetType || "definitif",
    });
  }

  /* ── Injection note dans ERP (Cosium/Optimum/etc.) ───────────────────── */
  function injectRejetNoteCosium(rejet) {
    var noteText = "REJET SECU — " + (rejet.motif || "Motif non precise").substring(0, 100) +
      (rejet.numeroDossier ? " | Dossier : " + rejet.numeroDossier : "") +
      " | " + new Date().toLocaleDateString("fr-FR");
    chrome.runtime.sendMessage({ type: "OPTIBOT_COSIUM_INJECT_NOTE", note: noteText });
  }

  function scanForRejets() {
    if (!enabled) return;
    var rejets = [];

    /* 1. Config-based scan (portails avec selecteurs connus) */
    if (config && currentPortail) {
      var portailConfig = config.portails[currentPortail];
      if (portailConfig && portailConfig.enabled && portailConfig.selectors) {
        var sel = portailConfig.selectors;
        var containers = document.querySelectorAll(sel.rejetContainer);
        containers.forEach(function (container) {
          var rows = container.querySelectorAll(sel.rejetRow);
          rows.forEach(function (row) {
            var numeroDossier = extractText(row, sel.numeroDossier);
            var motif = extractText(row, sel.motif);
            var dateRejet = extractText(row, sel.dateRejet);
            var montant = extractText(row, sel.montant);
            var key = [currentPortail, numeroDossier, dateRejet, montant].join("|");
            if (detectedRejets.has(key)) return;
            if (numeroDossier || motif) {
              detectedRejets.add(key);
              var r = { portail: currentPortail, numeroDossier: numeroDossier, motif: motif, dateRejet: dateRejet, montant: montant };
              rejets.push(r);
              storeRejetLocally(r);
              notifyBadgeRejet(r);
            }
          });
        });
      }
    }

    /* 2. Ameli Pro scan */
    if (currentPortail === "AMELI") {
      var ameliRejets = scanAmeliRejets();
      for (var a = 0; a < ameliRejets.length; a++) rejets.push(ameliRejets[a]);
    }

    /* Envoyer les rejets definitifs a l'API */
    var toSend = rejets.filter(function(r) { return r.rejetType !== "technique"; });
    if (toSend.length > 0) sendRejets(toSend);
  }

  function sendRejets(rejets) {
    getSyncToken().then(function (syncToken) {
      if (!syncToken) {
        console.warn("[OptiBot Rejet] Pas de syncToken, rejets non envoyes");
        return;
      }

      rejets.forEach(function (rejet) {
        fetch(REJET_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            syncToken: syncToken,
            portail: rejet.portail,
            numeroDossier: rejet.numeroDossier,
            motif: rejet.motif,
            dateRejet: rejet.dateRejet,
            montant: rejet.montant,
          }),
        })
          .then(function (res) { return res.json(); })
          .then(function (data) {
            if (data.ok) {
              console.info("[OptiBot Rejet] Rejet envoye:", rejet.numeroDossier, data.matched ? "(match)" : "(no match)");
            }
          })
          .catch(function () { /* silent */ });
      });
    });
  }

  function init() {
    currentPortail = getPortailFromUrl(window.location.href);

    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(["optibot_rejet_enabled", "optibot_rejet_consent"], function (result) {
        if (result.optibot_rejet_enabled === false) { enabled = false; return; }
        if (result.optibot_rejet_consent !== true) { enabled = false; return; }
        startDetection();
      });
    } else {
      startDetection();
    }
  }

  function startDetection() {
    loadConfig().then(function () {
      /* Detection active meme sans config (scan Ameli/generique) */
      setTimeout(scanForRejets, 3000);
      setInterval(scanForRejets, CHECK_INTERVAL);

      /* Debounced MutationObserver */
      var _scanTimer = null;
      var observer = new MutationObserver(function () {
        clearTimeout(_scanTimer);
        _scanTimer = setTimeout(scanForRejets, 1000);
      });
      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
      }
    });
  }

  /* Wait for page to be ready */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
