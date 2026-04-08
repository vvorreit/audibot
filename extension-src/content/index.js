// ── AudiBot Multi-Site Dispatcher (Modular Build) ────────────────

import { CONFIGS } from "./portals/index.js";
import "./utils/remote-selectors.js";
import "./utils/field-feedback.js"; /* US-8 : Feedback Loop signalement champ */
import "./utils/selector-health.js";
import "./utils/rejection-predictor.js";
import "./command-center.js";
import "./pec-capture.js";
import { setupDevisDetection } from "./utils/devis-capture.js";

/* ── Module imports (deduplicated from inline copies) ─────────────────── */
import { querySelectorAllDeep, findElement, findInShadowRoots, waitForElement } from "./utils/dom.js";
import { capitalize, normalizePhone, formatOpticalValue, detectOpticalFormat, normalizeDateValue, fieldHasValue } from "./utils/format.js";
import { preCacheLabelMap, clearMatchingCache, getFieldLabel, normalizeLabel, normalizeAlias, scoreFieldMatch, matchSmartField, levenshtein, loadLearnedWeights } from "./utils/field-matching.js";
import { getCachedSelector, setCachedSelector, loadSelectorCache, saveSelectorCache } from "./utils/selector-cache.js";
import { getSmartFillData, getCachedClient, getVisibleFields, detectPageContext } from "./utils/data.js";
import { ultraFill, ultraFillWithRetry, smartFillField, smartSelectOption, fillDatePicker, selectRadixOption } from "./utils/fill.js";
import { performSmartFill } from "./smart-fill/index.js";
import { markFilledByAudiBot, sendLearningSignal } from "./smart-fill/learning.js";
import { performFill } from "./standard-fill/index.js";
import { startReplay, runStep, resolveVariables, tryDynamicReplay, replayState, setReplayState } from "./replay/index.js";
import { checkAndStartRPA } from "./rpa/index.js";
/* import { init } from "./ui/init.js"; — kept inline as initLocal() since it references many local functions */

/* ── Parcours Dynamiques DB → CONFIGS ──────────────────────────────────────── */

function loadDynamicParcours() {
  chrome.storage.local.get(['audibot_dynamic_parcours', 'audibot_auth'], function(result) {
    var auth = result.audibot_auth || {};
    if (!auth.syncToken) return;
    var cached = result.audibot_dynamic_parcours;
    /* Utiliser le cache si moins de 30 min */
    if (cached && cached.ts && Date.now() - cached.ts < 1800000) {
      injectDynamicParcours(cached.handlers);
      return;
    }
    fetch("https://audibot.fr/api/extension/parcours?handlers=true", {
      headers: { "Authorization": "Bearer " + auth.syncToken }
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      chrome.storage.local.set({
        audibot_dynamic_parcours: { handlers: data.handlers, ts: Date.now() }
      });
      injectDynamicParcours(data.handlers);
    })
    .catch(function(err) { console.warn("[AudiBot] dynamic parcours fetch failed:", err); });
  });
}

function injectDynamicParcours(handlers) {
  if (!Array.isArray(handlers)) return;
  handlers.forEach(function(h) {
    if (!h.hostname) return;
    /* Ne pas écraser les configs hardcodées */
    var alreadyExists = Object.values(CONFIGS).some(function(cfg) {
      return cfg.isMatch && cfg.isMatch() && window.location.hostname.includes(h.hostname);
    });
    if (CONFIGS[h.hostname] || alreadyExists) return;

    /* Créer le handler dynamique depuis les étapes JSON (sans eval) */
    var etapes = h.etapes || [];
    CONFIGS[h.hostname] = {
      name: h.nom || h.hostname,
      isMatch: (function(hostname) {
        return function() { return window.location.hostname.includes(hostname); };
      })(h.hostname),
      actions: {
        formulaire: (function(etapesList) {
          return function(data) {
            /* Rejouer les étapes fill en utilisant le moteur ultraFill existant */
            if (!etapesList || etapesList.length === 0) return false;
            var filled = false;
            var cache = data.cached || {};
            var m = data.m || {};
            var o = data.o || {};
            var personnes = m.personnes || [];
            var p0 = personnes.length > 0 ? personnes[0] : {};

            /* Construire le dictionnaire de valeurs patient */
            var vars = {
              "{{nss}}": getOuvrantDroitNSS(m.numeroSecuriteSociale || "", m.dateNaissance || "", personnes).replace(/\D/g, ""),
              "{{nom}}": (m.nom || p0.nom || o.nomPatient || cache.nom || "").toUpperCase(),
              "{{prenom}}": capitalize(m.prenom || p0.prenom || o.prenomPatient || cache.prenom || ""),
              "{{dateNaissance}}": m.dateNaissance || o.dateNaissancePatient || cache.dob || "",
              "{{dateOrdonnance}}": o.dateOrdonnance || (cache.prescription && cache.prescription.datePrescription) || "",
              "{{numeroAdherent}}": m.numeroAdherent || cache.numeroAdherent || "",
              "{{organisme}}": m.organisme || cache.organisme || "",
              "{{sphere_od}}": (o.lunettesOD && o.lunettesOD.sphere) || "",
              "{{sphere_og}}": (o.lunettesOG && o.lunettesOG.sphere) || "",
              "{{cylindre_od}}": (o.lunettesOD && o.lunettesOD.cylindre) || "",
              "{{cylindre_og}}": (o.lunettesOG && o.lunettesOG.cylindre) || "",
              "{{axe_od}}": (o.lunettesOD && o.lunettesOD.axe) || "",
              "{{axe_og}}": (o.lunettesOG && o.lunettesOG.axe) || "",
              "{{addition}}": (o.lunettesOD && o.lunettesOD.addition) || (o.lunettesOG && o.lunettesOG.addition) || "",
            };

            etapesList.forEach(function(etape) {
              if (etape.action !== "fill" && etape.action !== "click" && etape.action !== "select") return;
              var selectors = etape.selectors || (etape.selector ? [etape.selector] : []);
              if (selectors.length === 0) return;

              /* Trouver l'élément via les sélecteurs fallback */
              var el = null;
              for (var si = 0; si < selectors.length; si++) {
                el = findElement(selectors[si]);
                if (el) break;
              }
              if (!el) return;

              if (etape.action === "click") {
                el.click();
                filled = true;
                return;
              }

              /* Résoudre la variable */
              var value = etape.variable ? (vars[etape.variable] || "") : "";
              if (!value) return;

              if (etape.action === "select") {
                smartSelectOption(el, value);
                filled = true;
              } else {
                ultraFill(el, value);
                filled = true;
              }
            });

            return filled;
          };
        })(etapes),
        synchroniser: function() { return false; }
      }
    };
  });
}

/* Charger les parcours dynamiques au démarrage */
loadDynamicParcours();

/* ── Fonctions Utilitaires ─────────────────────────────────────────────── */

function validateLuhnNSS(nss) {
  var digits = nss.replace(/\D/g, "");
  if (digits.length < 13) return false;
  var n = digits.slice(0, 13).replace(/2A/i, "19").replace(/2B/i, "18");
  var num = parseInt(n, 10);
  if (isNaN(num)) return false;
  if (digits.length >= 15) {
    var cle = parseInt(digits.slice(13, 15), 10);
    return (97 - (num % 97)) === cle;
  }
  return true;
}

/* ── checkDroitsMutuelle — alerte si droits expirés ou bientôt expirés ── */
function checkDroitsMutuelle(data) {
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
        showRPAToast("⛔ Droits mutuelle expirés depuis le " + dateFin, "error");
        return;
      }
      var diffDays = Math.ceil((finDate - today) / (1000 * 60 * 60 * 24));
      if (diffDays <= 30) {
        showRPAToast("⚠️ Droits mutuelle expirent dans " + diffDays + " jour" + (diffDays > 1 ? "s" : "") + " (" + dateFin + ")", "warning");
        return;
      }
    }
  }

  if (dateDebut) {
    var partsD = dateDebut.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
    if (partsD) {
      var debutDate = new Date(parseInt(partsD[3]), parseInt(partsD[2]) - 1, parseInt(partsD[1]));
      if (debutDate > today) {
        showRPAToast("⚠️ Droits mutuelle pas encore actifs (début : " + dateDebut + ")", "warning");
      }
    }
  }
}

/**
 * Pour un mineur, retourne le NSS de l'ouvrant droit (mère en priorité = NSS commençant par 2).
 * Si le bénéficiaire est majeur, retourne son propre NSS.
 */
function getOuvrantDroitNSS(beneficiaireNSS, beneficiaireDOB, personnes) {
  if (!personnes || personnes.length <= 1) return beneficiaireNSS;
  if (!beneficiaireDOB || !isUnder18(beneficiaireDOB)) return beneficiaireNSS;

  /* Chercher la mère (NSS commence par 2, majeure) */
  for (var i = 0; i < personnes.length; i++) {
    var p = personnes[i];
    var pNSS = (p.numeroSecuriteSociale || "").replace(/\D/g, "");
    if (pNSS.startsWith("2") && pNSS.length >= 13 && p.dateNaissance && !isUnder18(p.dateNaissance)) {
      return p.numeroSecuriteSociale;
    }
  }
  /* Fallback : premier adulte avec un NSS valide */
  for (var i = 0; i < personnes.length; i++) {
    var p = personnes[i];
    var pNSS = (p.numeroSecuriteSociale || "").replace(/\D/g, "");
    if (pNSS.length >= 13 && p.dateNaissance && !isUnder18(p.dateNaissance)) {
      return p.numeroSecuriteSociale;
    }
  }
  return beneficiaireNSS;
}

function isUnder18(dob) {
  /* Accepte DD/MM/YYYY ou YYYY-MM-DD */
  let d;
  if (dob.includes("/")) {
    const p = dob.split("/");
    d = new Date(p[2], p[1] - 1, p[0]);
  } else {
    d = new Date(dob);
  }
  if (isNaN(d.getTime())) return false;
  const age = (Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  return age < 18;
}

function showSyncButton() {
  if (document.getElementById('audibot-sync-btn')) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.id = 'audibot-sync-btn';
  btn.innerText = '💾 Mémoriser';
  btn.style.cssText = `
    position: fixed; bottom: 80px; right: 20px; z-index: 999999;
    background: #8b5cf6; color: white; border: none; padding: 12px 20px;
    border-radius: 50px; font-weight: bold; cursor: pointer;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2); font-family: sans-serif;
    transition: all 0.2s;
  `;
  btn.onclick = async () => {
    btn.innerText = '⏳ En cours...';
    const currentSite = Object.values(CONFIGS).find(cfg => cfg.isMatch());
    const success = await currentSite.actions.synchroniser();
    if (success) {
      btn.innerText = '✅ Client mémorisé !';
      btn.style.background = '#10b981';
      setTimeout(() => {
        btn.innerText = '💾 Mémoriser';
        btn.style.background = '#8b5cf6';
      }, 2000);
    } else {
      btn.innerText = '❌ Formulaire vide';
      btn.style.background = '#ef4444';
      setTimeout(() => {
        btn.innerText = '💾 Mémoriser';
        btn.style.background = '#8b5cf6';
      }, 2000);
    }
  };
  document.body.appendChild(btn);
}

// ── Sync TP depuis LBO ─────────────────────────────────────────────────────

function scrapeTPTable() {
  var table = document.querySelector('#grid_pointage_tiers_payant tbody');
  if (!table) return [];
  var rows = table.querySelectorAll('tr');
  var dossiers = [];
  for (var i = 0; i < rows.length; i++) {
    var tr = rows[i];
    var tds = tr.querySelectorAll('td');
    if (tds.length < 9) continue;

    var date = (tds[0].textContent || "").trim();
    var modeEl = tds[1].querySelector('.label');
    var mode = modeEl ? (modeEl.textContent || "").trim() : "";
    var numFSE = (tds[2].textContent || "").trim();

    var orgTypeEl = tds[3].querySelector('.label');
    var orgType = orgTypeEl ? (orgTypeEl.textContent || "").trim() : "";
    var organisme = (tds[3].textContent || "").trim().replace(/^(RO|RC)\s*/, "");

    var bordText = (tds[4].textContent || "").trim();
    var numBordereau = bordText.replace(/^(Bord\.\s*N°|Lot\s*N°)\s*/i, "").trim();

    /* PAS DE NOM CLIENT — on skip tds[5] */

    var montantText = (tds[6].textContent || "").replace(/[^\d,.-]/g, "").replace(",", ".").trim();
    var montant = parseFloat(montantText) || 0;

    var statutEl = tds[7].querySelector('.label-danger');
    var statut = statutEl ? "Rejet" : (tds[7].textContent || "").trim();

    var remarque = (tds[8].textContent || "").trim();

    /* IDs depuis les data-attributes des boutons d'action */
    var encBtn = tds[9] ? tds[9].querySelector('[data-bordereau_regime_detail_id]') : null;
    var lboDetailId = encBtn ? encBtn.getAttribute('data-bordereau_regime_detail_id') : "";

    var rejetBtn = tds[9] ? tds[9].querySelector('[data-rejet_noemi_type_id]') : null;
    var rejetTypeId = rejetBtn ? rejetBtn.getAttribute('data-rejet_noemi_type_id') : "";

    dossiers.push({
      date: date,
      mode: mode,
      numFSE: numFSE,
      type: orgType,
      organisme: organisme,
      numBordereau: numBordereau,
      montant: montant,
      statut: statut,
      remarque: remarque,
      rejetTypeId: rejetTypeId || "",
      lboDetailId: lboDetailId || ""
    });
  }
  return dossiers;
}

async function syncTPToAudiBot(btn) {
  btn.innerText = "Chargement...";
  btn.style.background = "#6366f1";

  /* Passer le DataTable en 100 lignes pour tout récupérer */
  var lengthSelect = document.querySelector('#grid_pointage_tiers_payant_length select');
  var originalLength = lengthSelect ? lengthSelect.value : "10";
  if (lengthSelect && lengthSelect.value !== "100") {
    lengthSelect.value = "100";
    lengthSelect.dispatchEvent(new Event("change", { bubbles: true }));
    await new Promise(function(r) { setTimeout(r, 2000); });
  }

  var allDossiers = [];
  var maxPages = 20;
  var page = 0;

  while (page < maxPages) {
    btn.innerText = "Page " + (page + 1) + "...";
    var batch = scrapeTPTable();
    if (batch.length === 0) break;
    allDossiers = allDossiers.concat(batch);

    var nextBtn = document.querySelector('#grid_pointage_tiers_payant_next:not(.disabled)');
    if (!nextBtn) break;
    nextBtn.querySelector('a').click();
    await new Promise(function(r) { setTimeout(r, 1500); });
    page++;
  }

  /* Revenir à la première page */
  var firstPageBtn = document.querySelector('#grid_pointage_tiers_payant_paginate .paginate_button:nth-child(2) a');
  if (firstPageBtn) firstPageBtn.click();

  /* Restaurer le nombre de lignes */
  if (lengthSelect && originalLength !== "100") {
    setTimeout(function() {
      lengthSelect.value = originalLength;
      lengthSelect.dispatchEvent(new Event("change", { bubbles: true }));
    }, 500);
  }

  if (allDossiers.length === 0) {
    btn.innerText = "Aucun dossier";
    btn.style.background = "#ef4444";
    setTimeout(function() { btn.innerText = "Sync TP"; btn.style.background = "#6366f1"; }, 2000);
    return;
  }

  btn.innerText = "Envoi " + allDossiers.length + " dossiers...";

  /* Récupérer le syncToken depuis audibot_auth (source de vérité) */
  var syncToken = await getSyncToken();
  if (!syncToken) {
    btn.innerText = "Connectez-vous sur AudiBot";
    btn.style.background = "#ef4444";
    setTimeout(function() { btn.innerText = "Sync TP"; btn.style.background = "#6366f1"; }, 3000);
    return;
  }
  (async function() {

    try {
      var resp = await fetch("https://audibot.fr/api/extension/sync-tp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ syncToken: syncToken, dossiers: allDossiers })
      });
      var data = await resp.json();
      if (data.success) {
        btn.innerText = "+" + data.created + " / maj " + data.updated;
        btn.style.background = "#10b981";
      } else {
        btn.innerText = data.error || "Erreur";
        btn.style.background = "#ef4444";
      }
    } catch(e) {
      btn.innerText = "Erreur réseau";
      btn.style.background = "#ef4444";
    }

    setTimeout(function() { btn.innerText = "Sync TP"; btn.style.background = "#6366f1"; }, 3000);
  })();
}

function showSyncTPButton() {
  if (document.getElementById('audibot-sync-tp-btn')) return;
  if (!document.querySelector('#grid_pointage_tiers_payant')) return;
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.id = 'audibot-sync-tp-btn';
  btn.innerText = 'Sync TP';
  btn.style.cssText = [
    'position: fixed; bottom: 140px; right: 20px; z-index: 999999;',
    'background: #6366f1; color: white; border: none; padding: 12px 20px;',
    'border-radius: 50px; font-weight: bold; cursor: pointer;',
    'box-shadow: 0 4px 15px rgba(0,0,0,0.2); font-family: sans-serif;',
    'transition: all 0.2s;'
  ].join('');
  btn.onclick = function() { syncTPToAudiBot(btn); };
  document.body.appendChild(btn);
}

// ── RPA Logging ─────────────────────────────────────────────────────────────

function logRPA(mutuelle, etape, statut, erreur) {
  chrome.storage.local.get(["audibot_auth"], function(result) {
    var syncToken = (result.audibot_auth && result.audibot_auth.syncToken) || null;
    fetch("https://audibot.fr/api/extension/rpa-log", {
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
    }).catch(function(err) { console.warn("[AudiBot] RPA log failed:", err); }); /* silent fail */
  });
}

// ── RPA Toast ───────────────────────────────────────────────────────────────

function showRPAToast(message, type) {
  var existing = document.getElementById('audibot-rpa-toast');
  if (existing) existing.remove();

  var colors = {
    info: { bg: '#2563eb', border: '#3b82f6' },
    success: { bg: '#10b981', border: '#34d399' },
    warning: { bg: '#f59e0b', border: '#fbbf24' },
    error: { bg: '#ef4444', border: '#f87171' }
  };
  var c = colors[type] || colors.info;

  var toast = document.createElement('div');
  toast.id = 'audibot-rpa-toast';
  toast.textContent = message;
  toast.style.cssText = [
    'position: fixed; bottom: 80px; right: 20px; z-index: 9999999;',
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

/* ── iframes cross-domain postMessage listener ────────────────────────────── */
window.addEventListener("message", function(e) {
  if (!e.data || e.data.type !== "AUDIBOT_FILL_FRAME" || !e.data.payload) return;
  /* Valider l'origine : accepter same-origin + iframes enfants connues */
  if (e.origin !== window.location.origin) {
    var isKnownFrame = false;
    var frames = document.querySelectorAll("iframe");
    for (var i = 0; i < frames.length; i++) {
      try {
        if (frames[i].src && new URL(frames[i].src).origin === e.origin) {
          isKnownFrame = true;
          break;
        }
      } catch(err) {}
    }
    if (!isKnownFrame) {
      console.warn("[AudiBot] postMessage rejeté — iframe non reconnue :", e.origin);
      return;
    }
  }
  /* Écrire le payload dans le cache avant d'appeler performSmartFill (qui lit depuis le cache) */
  var payload = e.data.payload;
  var cachePromise = Promise.resolve();
  if (payload && (payload.m || payload.o)) {
    var nom = ((payload.m && payload.m.nom) || (payload.o && payload.o.nomPatient) || "").toUpperCase();
    if (nom) {
      var current = Object.assign({}, payload.m || {}, { ordonnance: payload.o || {}, updatedAt: Date.now() });
      cachePromise = writeEncryptedCache({ current: current });
    }
  }
  cachePromise.then(function() { performSmartFill(); });
  /* Accusé de réception vers la source */
  if (e.source) {
    try { e.source.postMessage({ type: "AUDIBOT_FILL_FRAME_ACK", ok: true }, e.origin); } catch(err) {}
  }
}, false);

// ── Initialisation ──────────────────────────────────────────────────────────

function initLocal() {
  if (window.location.hostname.includes("localhost")) return;

  loadSelectorCache();
  /* Charger les overrides de selecteurs distants */
  if (typeof loadRemoteSelectors === "function") loadRemoteSelectors();
  /* V3-9: Charger le modele de prediction de rejet */
  if (typeof loadRejectionModel === "function") loadRejectionModel();

  const currentSite = Object.values(CONFIGS).find(cfg => cfg.isMatch());

  /* Portail inconnu — afficher quand même le bouton Smart Fill */
  if (!currentSite) {
    if (!document.getElementById("audibot-fill-btn")) {
      var btnSmart = document.createElement("button");
      btnSmart.type = "button";
      btnSmart.id = "audibot-fill-btn";
      btnSmart.innerText = "🤖 Remplir";
      btnSmart.style.cssText = "position:fixed;bottom:20px;right:20px;z-index:999999;background:#7c3aed;color:white;border:none;padding:12px 20px;border-radius:50px;font-weight:bold;cursor:pointer;box-shadow:0 4px 15px rgba(0,0,0,0.2);font-family:sans-serif;transition:all 0.2s;";
      btnSmart.title = "Remplir les champs de cette page";
      btnSmart.onclick = async function() {
        var usedDynamic = await tryDynamicReplay();
        if (!usedDynamic) {
          /* Portail connu avec mapping codé → utiliser performFill en priorité, smart fill en fallback */
          performFill().then(function() {}).catch(function() { performSmartFill(); });
        }
      };
      document.body.appendChild(btnSmart);
    }
    return;
  }

  // Création du bouton Remplir
  if (!document.getElementById('audibot-fill-btn')) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'audibot-fill-btn';
    btn.innerText = '🤖 Remplir';
    btn.style.cssText = `
      position: fixed; bottom: 20px; right: 20px; z-index: 999999;
      background: #2563eb; color: white; border: none; padding: 12px 20px;
      border-radius: 50px; font-weight: bold; cursor: pointer;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2); font-family: sans-serif;
      transition: all 0.2s;
    `;
    btn.title = "Remplir les champs de cette page";
    btn.onclick = async function() {
      var usedDynamic = await tryDynamicReplay();
      if (!usedDynamic) {
        /* Site connu → formulaire codé en priorité, SmartFill en fallback */
        performFill().then(function() {}).catch(function() { performSmartFill(); });
      }
    };
    document.body.appendChild(btn);
  }

  // Affichage permanent du bouton Mémoriser sur LivebyOptimum
  if (currentSite.name === "LivebyOptimum") {
    showSyncButton();
    showSyncTPButton();

    /* Le DataTable TP se charge en AJAX — observer le DOM pour le détecter */
    var tpObserver = new MutationObserver(function() {
      showSyncTPButton();
      applyButtonsPreference();
    });
    tpObserver.observe(document.body, { childList: true, subtree: true });
  }

  /* Vérifier s'il y a un RPA en attente */
  checkAndStartRPA();

  /* ── Amélioration 5 : détection corrections utilisateur ── */
  document.addEventListener("input", function(e) {
    var el = e.target;
    if (!el || !el.getAttribute) return;
    var filledVar = el.getAttribute("data-audibot-filled");
    if (!filledVar) return;
    var oldValue = el.getAttribute("data-audibot-value");
    if (el.value !== oldValue) {
      sendLearningSignal({
        hostname: window.location.hostname,
        selector: generateSelectors(el)[0] || "",
        label: normalizeLabel(getFieldLabel(el)),
        oldVariable: filledVar,
        correctVariable: null
      });
    }
  }, true);

  /* ── Amélioration 7 : MutationObserver pour formulaires multi-step ── */
  var _smartFillDebounce = null;
  var _knownFieldIds = new Set();
  /* Mémoriser les champs déjà visibles */
  getVisibleFields().forEach(function(f) {
    _knownFieldIds.add(f.id || f.name || f.getAttribute("formcontrolname") || Math.random().toString(36));
  });

  var _activeObservers = [];

  function observeDoc(doc) {
    if (!doc || doc._audibotObserved) return;
    doc._audibotObserved = true;
    var obs = new MutationObserver(function() {
      if (_smartFillDebounce) clearTimeout(_smartFillDebounce);
      _smartFillDebounce = setTimeout(function() {
        var currentFields = getVisibleFields();
        var hasNew = false;
        currentFields.forEach(function(f) {
          var key = f.id || f.name || (f.getAttribute && f.getAttribute("formcontrolname")) || "";
          if (key && !_knownFieldIds.has(key) && !(f.getAttribute && f.getAttribute("data-audibot-filled"))) {
            hasNew = true;
            _knownFieldIds.add(key);
          }
        });
        if (hasNew) performSmartFill();
      }, 600);
    });
    obs.observe(doc.body || doc.documentElement, {
      childList: true, subtree: true, attributes: true,
      attributeFilter: ["style", "class", "hidden", "aria-hidden"]
    });
    _activeObservers.push(obs);
  }

  /* Observer le document principal */
  observeDoc(document);

  /* Observer les iframes existantes et celles qui arrivent dynamiquement */
  function observeIframes() {
    var iframes = document.querySelectorAll("iframe");
    for (var i = 0; i < iframes.length; i++) {
      try {
        var iDoc = iframes[i].contentDocument || (iframes[i].contentWindow && iframes[i].contentWindow.document);
        if (iDoc && iDoc.body) observeDoc(iDoc);
      } catch(e) {}
    }
  }
  observeIframes();
  var iframeWatcher = new MutationObserver(function() { observeIframes(); });
  iframeWatcher.observe(document.body, { childList: true, subtree: true });

  /* V3-8: Devis auto-detection */
  try { setupDevisDetection(); } catch(e) {}
}

/* ── Visibilite des boutons (toggle depuis popup) ───────────────────────── */

function setButtonsVisibility(visible) {
  var ids = ['audibot-fill-btn', 'audibot-sync-btn', 'audibot-sync-tp-btn'];
  for (var i = 0; i < ids.length; i++) {
    var el = document.getElementById(ids[i]);
    if (el) el.style.display = visible ? 'block' : 'none';
  }
}

/* Ecoute le message du popup pour toggle immediat */
chrome.runtime.onMessage.addListener(function(msg) {
  if (msg && msg.type === 'AUDIBOT_TOGGLE_BUTTONS') {
    setButtonsVisibility(msg.visible);
  }
  /* Auto-replay : notification page chargée depuis background.js */
  if (msg && msg.type === 'AUDIBOT_PAGE_LOADED') {
    var matchedPortail = Object.values(CONFIGS).find(function(cfg) { return cfg.isMatch(); });
    if (matchedPortail) {
      /* Plus de notification "données prêtes" — inutile et distrayant */
    }
  }
});

/* Au chargement, appliquer la preference sauvegardee */
function applyButtonsPreference() {
  chrome.storage.local.get(['audibot_buttons_visible'], function(result) {
    var visible = result.audibot_buttons_visible !== false;
    setButtonsVisibility(visible);
  });
}

/* US-8 : Feedback Loop — init clic droit signalement champ */
if (typeof initFieldFeedback === 'function') initFieldFeedback();

/* ── Détection navigation SPA (React Router, Vue Router, Angular Router) ── */
(function() {
  var _lastHref = window.location.href;

  function onSpaNavigation() {
    var newHref = window.location.href;
    if (newHref === _lastHref) return;
    _lastHref = newHref;
    /* Réinitialiser l'état de détection du portail */
    console.info("[AudiBot] SPA navigation détectée →", newHref);
    /* Re-détecter le portail actuel */
    var currentSite = Object.values(CONFIGS).find(function(cfg) { return cfg.isMatch(); });
    if (currentSite) {
      /* Re-afficher le bouton remplir si besoin */
      setTimeout(function() {
        var fillBtn = document.getElementById("audibot-fill-btn");
        if (fillBtn) fillBtn.style.display = "";
      }, 500);
    }
  }

  /* Intercepter pushState et replaceState */
  var originalPushState = history.pushState.bind(history);
  var originalReplaceState = history.replaceState.bind(history);

  history.pushState = function() {
    originalPushState.apply(history, arguments);
    setTimeout(onSpaNavigation, 100);
  };

  history.replaceState = function() {
    originalReplaceState.apply(history, arguments);
    setTimeout(onSpaNavigation, 100);
  };

  window.addEventListener("popstate", onSpaNavigation);
})();

if (document.readyState === 'complete') { initLocal(); applyButtonsPreference(); restoreRecorderIfNeeded(); initCommandCenter(); }
else window.addEventListener('load', function() { initLocal(); applyButtonsPreference(); restoreRecorderIfNeeded(); initCommandCenter(); });

/* Command Center : injecter sur les portails ou data patient presente */
function initCommandCenter() {
  if (window.location.hostname.includes("localhost")) return;
  if (window.location.hostname.includes("audibot.fr")) return;
  setTimeout(function() {
    if (typeof createCommandCenter === "function") createCommandCenter();
  }, 1500);
}

/* ── Replay Engine — UI & Health (unique to index.js) ─────────────────────── */

function showReplayControls() {
  var existing = document.getElementById("audibot-replay-controls");
  if (existing) existing.remove();
  var div = document.createElement("div");
  div.id = "audibot-replay-controls";
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
  btnAbort.onclick = function() { div.remove(); setReplayState(null); showRPAToast("Parcours abandonn\u00E9.", "info"); };
  div.appendChild(btnResume);
  div.appendChild(btnAbort);
  document.body.appendChild(div);
}

function sendHealthPing(portal, status, errorHint) {
  try {
    var version = (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getManifest) ? chrome.runtime.getManifest().version : "unknown";
    fetch("https://audibot.fr/api/bookmarklet/ping", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version: version, portal: portal, status: status, errorHint: errorHint })
    }).catch(function(err) { console.warn("[AudiBot] health ping failed:", err); });
  } catch(e) {}
}

chrome.runtime.onMessage.addListener(function(msg) {
  if (msg && msg.type === "AUDIBOT_LAUNCH_PARCOURS" && msg.parcoursId) {
    (async function() {
      var syncToken = await getSyncToken();
      if (!syncToken) return;
      try {
        var hostname = window.location.hostname.replace("www.", "");
        var res = await fetch("https://audibot.fr/api/extension/parcours?hostname=" + encodeURIComponent(hostname), { headers: { "Authorization": "Bearer " + syncToken } });
        if (!res.ok) return;
        var data = await res.json();
        var found = (data.parcours || []).find(function(p) { return p.id === msg.parcoursId; });
        if (!found) return;
        var cache = await readEncryptedCache() || {};
        startReplay(found, cache);
      } catch(e) {}
    })();
  }
});

/* ── Fin Replay Engine ───────────────────────────────────────────────────── */

/* ── Macro Recorder ──────────────────────────────────────────────────────── */

var recorderState = null; /* null = inactif, sinon { etapes: [], hostname: "" } */

/* Génère une liste ordonnée de sélecteurs CSS stables pour un élément (P1 — sélecteurs alternatifs) */
function generateSelectors(el) {
  var selectors = [];
  if (el.id && !el.id.match(/^[0-9]/)) selectors.push('#' + CSS.escape(el.id));
  if (el.name) selectors.push('[name="' + el.name + '"]');
  if (el.getAttribute('data-cy')) selectors.push('[data-cy="' + el.getAttribute('data-cy') + '"]');
  if (el.getAttribute('data-testid')) selectors.push('[data-testid="' + el.getAttribute('data-testid') + '"]');
  if (el.placeholder) selectors.push(el.tagName.toLowerCase() + '[placeholder="' + el.placeholder + '"]');
  /* Label associé */
  var lbl = el.id ? document.querySelector('label[for="' + el.id + '"]') : null;
  if (lbl && lbl.textContent.trim() && el.id && el.id.length >= 8) {
    selectors.push(el.tagName.toLowerCase() + '[id$="' + el.id.slice(-8) + '"]');
  }
  /* Fallback nth-child */
  var parent = el.parentElement;
  if (parent) {
    var idx = Array.from(parent.children).indexOf(el) + 1;
    selectors.push(el.tagName.toLowerCase() + ':nth-child(' + idx + ')');
  }
  if (selectors.length === 0) selectors.push(el.tagName.toLowerCase());
  /* Dédupliquer */
  return selectors.filter(function(s, i, arr) { return arr.indexOf(s) === i; });
}

/* Trouve un élément en essayant les sélecteurs dans l'ordre (P1 — fallback list) */
async function findElementBySelectors(selectors, timeout) {
  var selectorList = Array.isArray(selectors) ? selectors : [selectors];
  for (var i = 0; i < selectorList.length; i++) {
    var el = await waitForElement(selectorList[i], i === 0 ? timeout : 500);
    if (el) return el;
  }
  return null;
}

/* P1 — Normalisation avancée pour la correspondance de variables patient */
function normalizeForMatch(val) {
  return (val || "").replace(/[\s\-\.\/]/g, "").toLowerCase();
}

/* P1 — Génère plusieurs représentations normalisées d'une date pour la comparaison */
function normalizeDateForMatch(dateStr) {
  if (!dateStr) return [];
  var d = dateStr.replace(/\D/g, "");
  if (d.length === 8) {
    /* DDMMYYYY → essayer DDMMYYYY, YYYYMMDD, DD/MM/YYYY */
    return [d, d.slice(4) + d.slice(2, 4) + d.slice(0, 2), d.slice(0, 2) + d.slice(2, 4) + d.slice(4)];
  }
  return [d];
}

/* Détecte si une valeur correspond à une variable patient (depuis cache local) */
async function detectVariable(value) {
  if (!value || value.length < 2) return null;
  var cache = await readEncryptedCache();
  if (!cache || !cache.current) return null;
  var m = cache.current;
  var o = m.ordonnance || {};
  var od = o.lunettesOD || {};
  var og = o.lunettesOG || {};
  var p0 = (m.personnes && m.personnes[0]) || {};

  var normalizedValue = normalizeForMatch(value);

  /* Champs simples — comparaison normalisée */
  var mapping = [
    { variable: "{{nss}}", value: m.numeroSecuriteSociale || "" },
    { variable: "{{nom}}", value: m.nom || p0.nom || "" },
    { variable: "{{prenom}}", value: m.prenom || p0.prenom || "" },
    { variable: "{{organisme}}", value: m.organisme || "" },
    { variable: "{{numeroAdherent}}", value: m.numeroAdherent || "" },
    { variable: "{{sphere_od}}", value: od.sphere || "" },
    { variable: "{{sphere_og}}", value: og.sphere || "" },
    { variable: "{{cylindre_od}}", value: od.cylindre || "" },
    { variable: "{{cylindre_og}}", value: og.cylindre || "" },
    { variable: "{{axe_od}}", value: od.axe || "" },
    { variable: "{{axe_og}}", value: og.axe || "" },
    { variable: "{{addition}}", value: od.addition || og.addition || "" },
  ];

  for (var i = 0; i < mapping.length; i++) {
    var candidate = normalizeForMatch(mapping[i].value);
    if (candidate && candidate.length >= 2 && normalizedValue === candidate) {
      return mapping[i].variable;
    }
  }

  /* Dates — essayer plusieurs formats normalisés */
  var dateFields = [
    { variable: "{{dateNaissance}}", value: m.dateNaissance || "" },
    { variable: "{{dateOrdonnance}}", value: o.dateOrdonnance || "" },
  ];
  for (var j = 0; j < dateFields.length; j++) {
    var variants = normalizeDateForMatch(dateFields[j].value);
    for (var k = 0; k < variants.length; k++) {
      if (variants[k] && variants[k].length >= 6 && normalizedValue === variants[k]) {
        return dateFields[j].variable;
      }
    }
  }

  return null;
}

/* ── Panneau guidé latéral ─────────────────────────────────────────────── */

function showRecorderPanel() {
  if (document.getElementById("audibot-recorder-panel")) return;
  var panel = document.createElement("div");
  panel.id = "audibot-recorder-panel";
  panel.style.cssText = "position:fixed;right:0;top:50%;transform:translateY(-50%);z-index:2147483646;background:white;border-radius:12px 0 0 12px;box-shadow:-4px 0 20px rgba(0,0,0,0.15);width:260px;font-family:sans-serif;display:flex;flex-direction:column;max-height:70vh;";

  /* Header */
  var header = document.createElement("div");
  header.style.cssText = "padding:14px 16px 10px;border-bottom:1px solid #e5e7eb;";
  header.innerHTML = '<div style="font-size:14px;font-weight:700;color:#ef4444;">⏺ AudiBot — Enregistrement</div>';
  panel.appendChild(header);

  /* Body (scrollable list) */
  var body = document.createElement("div");
  body.id = "audibot-recorder-panel-body";
  body.style.cssText = "flex:1;overflow-y:auto;padding:8px 12px;";
  panel.appendChild(body);

  /* Footer */
  var footer = document.createElement("div");
  footer.id = "audibot-recorder-panel-footer";
  footer.style.cssText = "padding:10px 16px;border-top:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;";
  var counter = document.createElement("span");
  counter.id = "audibot-recorder-panel-counter";
  counter.style.cssText = "font-size:12px;color:#6b7280;";
  counter.textContent = "0 étapes enregistrées";
  var stopBtn = document.createElement("button");
  stopBtn.style.cssText = "padding:6px 14px;border:none;border-radius:6px;background:#ef4444;color:white;font-size:12px;font-weight:600;cursor:pointer;";
  stopBtn.textContent = "⏹ Terminer";
  stopBtn.addEventListener("click", function() { stopRecorder(); });
  footer.appendChild(counter);
  footer.appendChild(stopBtn);
  panel.appendChild(footer);

  document.body.appendChild(panel);
}

function updateRecorderPanel() {
  if (!recorderState) return;
  var body = document.getElementById("audibot-recorder-panel-body");
  var counter = document.getElementById("audibot-recorder-panel-counter");
  if (!body) return;

  var etapes = recorderState.etapes;

  /* Mettre à jour le compteur */
  if (counter) counter.textContent = etapes.length + " étape" + (etapes.length > 1 ? "s" : "") + " enregistrée" + (etapes.length > 1 ? "s" : "");

  /* Reconstruire la liste */
  body.innerHTML = "";
  var lastUrl = null;
  for (var i = 0; i < etapes.length; i++) {
    var step = etapes[i];

    /* Séparateur entre groupes d'URL différentes */
    if (step.url && step.url !== lastUrl && lastUrl !== null) {
      var sep = document.createElement("div");
      sep.style.cssText = "border-top:2px dashed #d1d5db;margin:6px 0;padding-top:4px;font-size:10px;color:#9ca3af;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
      sep.textContent = "📄 " + step.url.replace(/https?:\/\//, "").slice(0, 35);
      body.appendChild(sep);
    }
    lastUrl = step.url;

    var row = document.createElement("div");
    row.style.cssText = "display:flex;align-items:center;gap:6px;padding:4px 0;font-size:12px;";

    var icon = document.createElement("span");
    if (step.action === "fill") {
      var isKnown = step.variable && step.variable.indexOf("{{") === 0;
      icon.textContent = "✅";
      var labelEl = document.createElement("span");
      labelEl.style.cssText = "flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#374151;";
      labelEl.textContent = (step.label || "Champ").slice(0, 25);
      var varBadge = document.createElement("span");
      if (isKnown) {
        varBadge.style.cssText = "font-size:10px;background:#d1fae5;color:#065f46;padding:1px 5px;border-radius:3px;white-space:nowrap;";
        varBadge.textContent = step.variable;
      } else {
        varBadge.style.cssText = "font-size:10px;background:#fef3c7;color:#92400e;padding:1px 5px;border-radius:3px;white-space:nowrap;";
        varBadge.textContent = "statique";
      }
      row.appendChild(icon);
      row.appendChild(labelEl);
      row.appendChild(varBadge);
    } else if (step.action === "click") {
      icon.textContent = "🖱️";
      var labelEl2 = document.createElement("span");
      labelEl2.style.cssText = "flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#374151;";
      labelEl2.textContent = (step.label || "Clic").slice(0, 30);
      row.appendChild(icon);
      row.appendChild(labelEl2);
    } else if (step.action === "select") {
      icon.textContent = "📋";
      var labelEl3 = document.createElement("span");
      labelEl3.style.cssText = "flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#374151;";
      labelEl3.textContent = (step.label || "Sélection").slice(0, 30);
      row.appendChild(icon);
      row.appendChild(labelEl3);
    }

    body.appendChild(row);
  }

  /* Auto-scroll vers le bas */
  body.scrollTop = body.scrollHeight;
}

/* ── Highlight visuel des champs capturés ──────────────────────────────── */

function highlightRecordedField(el, variable) {
  if (!el || el.getAttribute("data-audibot-recorded")) return;
  el.setAttribute("data-audibot-recorded", "true");

  var isKnown = variable && variable.indexOf("{{") === 0;
  el.style.outline = isKnown ? "2px solid #10b981" : "2px solid #f59e0b";
  el.style.backgroundColor = isKnown ? "#f0fdf4" : "#fffbeb";

  /* Badge absolu au-dessus du champ */
  var rect = el.getBoundingClientRect();
  var badge = document.createElement("span");
  badge.className = "audibot-recorder-field-badge";
  badge.style.cssText = "position:absolute;z-index:2147483645;font-size:10px;font-weight:600;padding:1px 6px;border-radius:3px;font-family:sans-serif;pointer-events:none;white-space:nowrap;";
  if (isKnown) {
    badge.style.background = "#d1fae5";
    badge.style.color = "#065f46";
    badge.textContent = variable;
  } else {
    badge.style.background = "#fef3c7";
    badge.style.color = "#92400e";
    badge.textContent = "statique";
  }

  /* Positionner le badge relativement au parent positionné */
  var parent = el.offsetParent || document.body;
  var parentRect = parent.getBoundingClientRect();
  badge.style.left = (rect.left - parentRect.left) + "px";
  badge.style.top = (rect.top - parentRect.top - 16) + "px";
  parent.appendChild(badge);
}

function removeRecorderHighlights() {
  /* Retirer les outlines et backgrounds */
  var marked = document.querySelectorAll("[data-audibot-recorded]");
  for (var i = 0; i < marked.length; i++) {
    marked[i].style.outline = "";
    marked[i].style.backgroundColor = "";
    marked[i].removeAttribute("data-audibot-recorded");
  }
  /* Retirer les badges */
  var badges = document.querySelectorAll(".audibot-recorder-field-badge");
  for (var j = 0; j < badges.length; j++) {
    badges[j].remove();
  }
}

/* Démarrer l'enregistrement */
function startRecorder() {
  if (recorderState) return;
  recorderState = {
    etapes: [],
    hostname: window.location.hostname.replace("www.", ""),
    startTime: Date.now(),
  };

  /* Badge enregistrement */
  var badge = document.createElement("div");
  badge.id = "audibot-recorder-badge";
  badge.style.cssText = "position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:2147483647;background:#ef4444;color:white;padding:8px 20px;border-radius:50px;font-family:sans-serif;font-size:13px;font-weight:bold;box-shadow:0 4px 15px rgba(0,0,0,0.3);display:flex;align-items:center;gap:8px;";
  badge.innerHTML = '<span style="width:10px;height:10px;background:white;border-radius:50%;display:inline-block;animation:pulse 1s infinite;"></span> Enregistrement en cours — effectuez le parcours manuellement';
  document.body.appendChild(badge);

  /* Style animation */
  if (!document.getElementById("audibot-recorder-style")) {
    var style = document.createElement("style");
    style.id = "audibot-recorder-style";
    style.textContent = "@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }";
    document.head.appendChild(style);
  }

  /* Écouter les events sur le document principal */
  document.addEventListener("click", onRecorderClick, true);
  document.addEventListener("change", onRecorderChange, true);
  document.addEventListener("blur", onRecorderBlur, true);

  /* ── Iframes : attacher les listeners dans chaque iframe accessible ── */
  function attachRecorderToIframes() {
    var iframes = document.querySelectorAll("iframe");
    for (var i = 0; i < iframes.length; i++) {
      try {
        var iDoc = iframes[i].contentDocument || (iframes[i].contentWindow && iframes[i].contentWindow.document);
        if (!iDoc || iDoc._audibotRecorder) continue; /* déjà attaché */
        iDoc._audibotRecorder = true;
        iDoc.addEventListener("click", onRecorderClick, true);
        iDoc.addEventListener("change", onRecorderChange, true);
        iDoc.addEventListener("blur", onRecorderBlur, true);
      } catch(e) { /* cross-origin — inaccessible */ }
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

  showRPAToast("⏺ Enregistrement démarré — effectuez le parcours", "info");
}

/* Arrêter l'enregistrement et afficher le modal de confirmation */
async function stopRecorder() {
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
    showRPAToast("Aucune étape enregistrée.", "info");
    return;
  }

  /* Afficher le wizard 3 étapes */
  showRecorderWizard(etapes, hostname);
}

/* Envoyer le parcours enregistré au serveur */
async function sendRecorderParcours(etapes, hostname, nom) {
  var syncToken = await getSyncToken();
  if (!syncToken) {
    showRPAToast("Erreur : non connecté.", "error");
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
      showRPAToast("✅ Parcours enregistré (" + etapes.length + " étapes) — en attente de validation admin", "success");
    } else {
      showRPAToast("Erreur lors de l'enregistrement.", "error");
    }
  } catch(e) {
    showRPAToast("Erreur réseau.", "error");
  }
}

/* ── Wizard 3 étapes — remplace le modal de confirmation ──────────────── */

function showRecorderWizard(etapes, hostname) {
  var existing = document.getElementById("audibot-recorder-modal-overlay");
  if (existing) existing.remove();

  var currentStep = 1;
  var nomPortail = hostname;

  /* Variables disponibles pour correction manuelle */
  var variableOptions = [
    "{{nss}}", "{{nom}}", "{{prenom}}", "{{dateNaissance}}", "{{dateOrdonnance}}",
    "{{numeroAdherent}}", "{{organisme}}", "{{sphere_od}}", "{{sphere_og}}",
    "{{cylindre_od}}", "{{cylindre_og}}", "{{axe_od}}", "{{axe_og}}", "{{addition}}",
    "Ignorer ce champ"
  ];

  /* Overlay */
  var overlay = document.createElement("div");
  overlay.id = "audibot-recorder-modal-overlay";
  overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:2147483647;display:flex;align-items:center;justify-content:center;font-family:sans-serif;";

  /* Carte */
  var card = document.createElement("div");
  card.style.cssText = "background:white;border-radius:16px;max-width:480px;width:92%;max-height:85vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.3);padding:24px;";

  /* Indicateur de progression */
  var progress = document.createElement("div");
  progress.style.cssText = "text-align:center;margin-bottom:16px;font-size:18px;letter-spacing:4px;";

  /* Conteneur de contenu (change à chaque étape) */
  var content = document.createElement("div");
  content.style.cssText = "flex:1;overflow-y:auto;max-height:55vh;";

  /* Footer boutons */
  var footer = document.createElement("div");
  footer.style.cssText = "display:flex;justify-content:space-between;align-items:center;margin-top:16px;gap:8px;";

  function updateProgress() {
    var dots = "";
    for (var i = 1; i <= 3; i++) {
      dots += (i <= currentStep) ? "● " : "○ ";
    }
    progress.textContent = dots.trim();
  }

  function renderStep() {
    content.innerHTML = "";
    footer.innerHTML = "";
    updateProgress();

    if (currentStep === 1) renderStep1();
    else if (currentStep === 2) renderStep2();
    else if (currentStep === 3) renderStep3();
  }

  /* ── Étape 1 — Nom du portail ──────────────────────────────────────── */
  function renderStep1() {
    var title = document.createElement("div");
    title.style.cssText = "font-size:16px;font-weight:700;color:#111;margin-bottom:12px;";
    title.textContent = "⏺ Nom du portail";

    var desc = document.createElement("div");
    desc.style.cssText = "font-size:13px;color:#6b7280;margin-bottom:16px;";
    desc.textContent = "Donnez un nom à ce parcours pour le retrouver facilement.";

    var input = document.createElement("input");
    input.type = "text";
    input.value = nomPortail;
    input.placeholder = hostname;
    input.style.cssText = "width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;box-sizing:border-box;outline:none;";
    input.addEventListener("focus", function() { input.style.borderColor = "#3b82f6"; });
    input.addEventListener("blur", function() { input.style.borderColor = "#d1d5db"; });
    input.addEventListener("input", function() { nomPortail = input.value.trim() || hostname; });

    content.appendChild(title);
    content.appendChild(desc);
    content.appendChild(input);

    /* Boutons */
    var cancelBtn = document.createElement("button");
    cancelBtn.style.cssText = "padding:8px 16px;border:1px solid #d1d5db;border-radius:8px;background:white;color:#374151;font-size:13px;font-weight:500;cursor:pointer;";
    cancelBtn.textContent = "Annuler";
    cancelBtn.addEventListener("click", function() { overlay.remove(); showRPAToast("Envoi annulé.", "info"); });

    var nextBtn = document.createElement("button");
    nextBtn.style.cssText = "padding:8px 20px;border:none;border-radius:8px;background:#3b82f6;color:white;font-size:13px;font-weight:600;cursor:pointer;";
    nextBtn.textContent = "Suivant →";
    nextBtn.addEventListener("click", function() { currentStep = 2; renderStep(); });

    footer.appendChild(cancelBtn);
    footer.appendChild(nextBtn);

    setTimeout(function() { input.focus(); input.select(); }, 50);
  }

  /* ── Étape 2 — Vérification des champs ─────────────────────────────── */
  function renderStep2() {
    var title = document.createElement("div");
    title.style.cssText = "font-size:16px;font-weight:700;color:#111;margin-bottom:12px;";
    title.textContent = "🔍 Vérification des champs";

    var desc = document.createElement("div");
    desc.style.cssText = "font-size:13px;color:#6b7280;margin-bottom:16px;";
    desc.textContent = "Vérifiez les variables détectées. Corrigez les champs orange manuellement.";

    content.appendChild(title);
    content.appendChild(desc);

    var fillSteps = [];
    for (var i = 0; i < etapes.length; i++) {
      if (etapes[i].action === "fill" || etapes[i].action === "select") fillSteps.push(i);
    }

    if (fillSteps.length === 0) {
      var noFill = document.createElement("div");
      noFill.style.cssText = "font-size:13px;color:#9ca3af;text-align:center;padding:20px 0;";
      noFill.textContent = "Aucun champ de saisie détecté — uniquement des clics.";
      content.appendChild(noFill);
    }

    for (var fi = 0; fi < fillSteps.length; fi++) {
      (function(etapeIdx) {
        var step = etapes[etapeIdx];
        var isKnown = step.variable && step.variable.indexOf("{{") === 0;
        var isStatic = !step.variable || step.variable === "[VALEUR STATIQUE — À RENSEIGNER]";

        var row = document.createElement("div");
        row.style.cssText = "display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #f3f4f6;";

        var labelSpan = document.createElement("span");
        labelSpan.style.cssText = "font-size:13px;color:#374151;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
        labelSpan.textContent = (step.label || "Champ").slice(0, 30);

        if (isKnown) {
          var badge = document.createElement("span");
          badge.style.cssText = "font-size:11px;background:#d1fae5;color:#065f46;padding:2px 8px;border-radius:4px;white-space:nowrap;";
          badge.textContent = "automatique " + step.variable;
          row.appendChild(labelSpan);
          row.appendChild(badge);
        } else {
          var sel = document.createElement("select");
          sel.style.cssText = "font-size:12px;padding:4px 6px;border:1px solid #f59e0b;border-radius:4px;background:#fffbeb;color:#92400e;max-width:160px;";
          /* Option par défaut */
          var defaultOpt = document.createElement("option");
          defaultOpt.value = "";
          defaultOpt.textContent = "⚠️ À mapper";
          defaultOpt.selected = true;
          sel.appendChild(defaultOpt);
          for (var vi = 0; vi < variableOptions.length; vi++) {
            var opt = document.createElement("option");
            opt.value = variableOptions[vi];
            opt.textContent = variableOptions[vi];
            sel.appendChild(opt);
          }
          sel.addEventListener("change", function(ev) {
            var val = ev.target.value;
            if (val === "Ignorer ce champ") {
              step.variable = null;
            } else if (val) {
              step.variable = val;
            }
          });
          row.appendChild(labelSpan);
          row.appendChild(sel);
        }

        content.appendChild(row);
      })(fillSteps[fi]);
    }

    /* Boutons */
    var backBtn = document.createElement("button");
    backBtn.style.cssText = "padding:8px 16px;border:1px solid #d1d5db;border-radius:8px;background:white;color:#374151;font-size:13px;font-weight:500;cursor:pointer;";
    backBtn.textContent = "← Retour";
    backBtn.addEventListener("click", function() { currentStep = 1; renderStep(); });

    var nextBtn = document.createElement("button");
    nextBtn.style.cssText = "padding:8px 20px;border:none;border-radius:8px;background:#3b82f6;color:white;font-size:13px;font-weight:600;cursor:pointer;";
    nextBtn.textContent = "Suivant →";
    nextBtn.addEventListener("click", function() { currentStep = 3; renderStep(); });

    footer.appendChild(backBtn);
    footer.appendChild(nextBtn);
  }

  /* ── Étape 3 — Récap et envoi ──────────────────────────────────────── */
  function renderStep3() {
    var autoCount = 0;
    var manualCount = 0;
    for (var i = 0; i < etapes.length; i++) {
      if (etapes[i].action === "fill" || etapes[i].action === "select") {
        if (etapes[i].variable && etapes[i].variable.indexOf("{{") === 0) autoCount++;
        else manualCount++;
      }
    }

    var title = document.createElement("div");
    title.style.cssText = "font-size:20px;font-weight:700;color:#111;text-align:center;margin-bottom:8px;";
    title.textContent = "🎉 Parcours prêt !";

    var stats = document.createElement("div");
    stats.style.cssText = "font-size:14px;color:#6b7280;text-align:center;margin-bottom:24px;";
    stats.textContent = etapes.length + " étapes · " + autoCount + " champs automatiques · " + manualCount + " champs manuels";

    content.appendChild(title);
    content.appendChild(stats);

    /* Bouton Envoyer */
    var sendBtn = document.createElement("button");
    sendBtn.style.cssText = "width:100%;padding:12px;border:none;border-radius:8px;background:#3b82f6;color:white;font-size:14px;font-weight:600;cursor:pointer;margin-bottom:8px;";
    sendBtn.textContent = "Envoyer à AudiBot";
    sendBtn.addEventListener("click", function() {
      overlay.remove();
      sendRecorderParcours(etapes, hostname, nomPortail);
    });
    content.appendChild(sendBtn);

    /* Bouton Télécharger JSON */
    var dlBtn = document.createElement("button");
    dlBtn.style.cssText = "width:100%;padding:12px;border:1px solid #d1d5db;border-radius:8px;background:white;color:#374151;font-size:14px;font-weight:500;cursor:pointer;margin-bottom:8px;";
    dlBtn.textContent = "Télécharger JSON";
    dlBtn.addEventListener("click", function() {
      var blob = new Blob([JSON.stringify({ hostname: hostname, nom: nomPortail, etapes: etapes }, null, 2)], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "audibot-parcours-" + hostname + ".json";
      a.click();
      URL.revokeObjectURL(url);
    });
    content.appendChild(dlBtn);

    /* Boutons footer */
    var backBtn = document.createElement("button");
    backBtn.style.cssText = "padding:8px 16px;border:1px solid #d1d5db;border-radius:8px;background:white;color:#374151;font-size:13px;font-weight:500;cursor:pointer;";
    backBtn.textContent = "← Retour";
    backBtn.addEventListener("click", function() { currentStep = 2; renderStep(); });

    var cancelBtn = document.createElement("button");
    cancelBtn.style.cssText = "padding:8px 16px;border:1px solid #d1d5db;border-radius:8px;background:white;color:#ef4444;font-size:13px;font-weight:500;cursor:pointer;";
    cancelBtn.textContent = "Annuler";
    cancelBtn.addEventListener("click", function() { overlay.remove(); showRPAToast("Envoi annulé.", "info"); });

    footer.appendChild(backBtn);
    footer.appendChild(cancelBtn);
  }

  /* Assembler */
  card.appendChild(progress);
  card.appendChild(content);
  card.appendChild(footer);
  overlay.appendChild(card);

  /* Fermer en cliquant sur l'overlay (hors carte) */
  overlay.addEventListener("click", function(ev) {
    if (ev.target === overlay) {
      overlay.remove();
      showRPAToast("Envoi annulé.", "info");
    }
  });

  document.body.appendChild(overlay);
  renderStep();
}

/* RGPD — Anonymise le snapshot HTML avant envoi (supprime valeurs patient, scripts, data-attrs sensibles) */
function anonymizeHtmlSnapshot() {
  try {
    var clone = document.documentElement.cloneNode(true);
    /* Vider toutes les valeurs des inputs (données patient potentielles) */
    var inputs = clone.querySelectorAll("input, textarea, select");
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].value = "";
      inputs[i].removeAttribute("value");
    }
    /* Supprimer les scripts inline (inutiles pour le dry-run) */
    var scripts = clone.querySelectorAll("script");
    for (var s = 0; s < scripts.length; s++) { scripts[s].remove(); }
    /* Supprimer les données dans les attributs data- (peuvent contenir des infos patient) */
    var dataEls = clone.querySelectorAll("[data-nss], [data-nom], [data-prenom], [data-secu], [data-patient]");
    for (var d = 0; d < dataEls.length; d++) {
      ["data-nss","data-nom","data-prenom","data-secu","data-patient"].forEach(function(attr) {
        dataEls[d].removeAttribute(attr);
      });
    }
    return clone.outerHTML;
  } catch(e) {
    return ""; /* En cas d'erreur, ne pas envoyer de snapshot */
  }
}

/* Handler click */
async function onRecorderClick(e) {
  if (!recorderState) return;
  var el = e.target;
  if (!el || el.id === "audibot-recorder-badge" || el.closest("#audibot-recorder-badge") || el.closest("#audibot-recorder-panel")) return;

  /* Ignorer les champs de saisie (gérés par blur) */
  if (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT") return;

  /* P1 — Sélecteurs multiples */
  var selectors = generateSelectors(el);
  var label = (el.innerText || el.value || el.getAttribute("aria-label") || "").trim().slice(0, 50);

  /* Snapshot AVANT l'action — intentionnel : on capture l'état de la page
     au moment où l'action doit être rejouée (le dry-run part de cet état). */
  var htmlSnapshot = anonymizeHtmlSnapshot();
  var newStep = {
    id: "step_" + (recorderState.etapes.length + 1),
    label: label || "Clic",
    action: "click",
    selectorType: "css",
    selector: selectors[0],
    selectors: selectors,
    variable: null,
    htmlSnapshot: htmlSnapshot,
    url: window.location.href,
    waitFor: null,
    timeout: 5000,
  };
  recorderState.etapes.push(newStep);

  saveRecorderState();
  updateRecorderPanel();
  showRPAToast("⏺ Étape " + recorderState.etapes.length + " — clic enregistré", "info");

  /* P0 — Détection automatique du waitFor après navigation ou changement DOM */
  var urlBefore = window.location.href;
  var bodySnapshot = document.body.innerHTML.length;
  var lastStepAdded = newStep;
  setTimeout(function() {
    if (!recorderState) return;
    if (window.location.href !== urlBefore) {
      /* Navigation complète — chercher le premier élément interactif de la nouvelle page */
      lastStepAdded.waitFor = "input:not([type=hidden]), select, button[type=submit], form";
      saveRecorderState();
      /* Notification changement de page */
      showRPAToast("📄 Nouvelle page — continuez votre saisie, AudiBot enregistre", "info");
      /* Mettre à jour le badge avec le compteur */
      var recBadge = document.getElementById("audibot-recorder-badge");
      if (recBadge) {
        recBadge.innerHTML = '<span style="width:10px;height:10px;background:white;border-radius:50%;display:inline-block;animation:pulse 1s infinite;"></span> Enregistrement en cours (' + recorderState.etapes.length + ' étapes)';
      }
    } else if (Math.abs(document.body.innerHTML.length - bodySnapshot) > 500) {
      /* Changement DOM significatif (AJAX) */
      lastStepAdded.waitFor = "input:not([type=hidden]), select, button[type=submit], form";
      saveRecorderState();
    }
  }, 800);
}

/* Handler blur (fin de saisie dans un champ) — sérialisé via queue pour éviter les races sur detectVariable() */
var recorderBlurQueue = Promise.resolve();

async function onRecorderBlur(e) {
  if (!recorderState) return;
  var el = e.target;
  if (!el || !["INPUT", "TEXTAREA"].includes(el.tagName)) return;
  if (!el.value || el.value.length < 1) return;

  /* Capturer les valeurs immédiatement (avant que le DOM change) */
  var capturedValue = el.value;
  var capturedSelectors = generateSelectors(el);
  var capturedSelector = capturedSelectors[0];
  var capturedLabelEl = el.id ? document.querySelector('label[for="' + el.id + '"]') : null;
  var capturedLabel = (capturedLabelEl && capturedLabelEl.textContent.trim()) || el.placeholder || el.name || "Champ";
  var capturedUrl = window.location.href;

  recorderBlurQueue = recorderBlurQueue.then(async function() {
    if (!recorderState) return;

    var variable = await detectVariable(capturedValue);

    /* P0 — Déduplication : si la dernière étape cible le même sélecteur → mise à jour */
    var lastEtape = recorderState.etapes[recorderState.etapes.length - 1];
    if (lastEtape && lastEtape.action === "fill" && lastEtape.selector === capturedSelector) {
      lastEtape.variable = variable || "[VALEUR STATIQUE — À RENSEIGNER]";
      lastEtape.selectors = capturedSelectors;
      saveRecorderState();
      updateRecorderPanel();
      /* Highlight le champ */
      var dedupEl = document.querySelector(capturedSelector);
      if (dedupEl) highlightRecordedField(dedupEl, lastEtape.variable);
      showRPAToast("⏺ Étape " + recorderState.etapes.length + " mise à jour — " + capturedLabel.slice(0, 20), "info");
      return;
    }

    /* Snapshot AVANT l'action — intentionnel : on capture l'état de la page
       au moment où l'action doit être rejouée (le dry-run part de cet état). */
    var htmlSnapshot = anonymizeHtmlSnapshot();
    var newFillStep = {
      id: "step_" + (recorderState.etapes.length + 1),
      label: capturedLabel.slice(0, 50),
      action: "fill",
      selectorType: "css",
      selector: capturedSelector,
      selectors: capturedSelectors,
      /* Si valeur patient → variable ; sinon valeur statique masquée */
      variable: variable || "[VALEUR STATIQUE — À RENSEIGNER]",
      htmlSnapshot: htmlSnapshot,
      url: capturedUrl,
      waitFor: null,
      timeout: 5000,
    };
    recorderState.etapes.push(newFillStep);

    saveRecorderState();
    updateRecorderPanel();
    /* Highlight le champ */
    var fillEl = document.querySelector(capturedSelector);
    if (fillEl) highlightRecordedField(fillEl, newFillStep.variable);
    showRPAToast("⏺ Étape " + recorderState.etapes.length + " — " + capturedLabel.slice(0, 20) + (variable ? " → " + variable : " → statique"), "info");
  });
}

/* Handler change (select) */
async function onRecorderChange(e) {
  if (!recorderState) return;
  var el = e.target;
  if (el.tagName !== "SELECT") return;

  /* P1 — Sélecteurs multiples */
  var selectors = generateSelectors(el);
  var variable = await detectVariable(el.value);
  var label = el.name || el.id || "Sélection";

  /* Snapshot AVANT l'action — intentionnel : on capture l'état de la page
     au moment où l'action doit être rejouée (le dry-run part de cet état). */
  var htmlSnapshot = anonymizeHtmlSnapshot();
  var newSelectStep = {
    id: "step_" + (recorderState.etapes.length + 1),
    label: label.slice(0, 50),
    action: "select",
    selectorType: "css",
    selector: selectors[0],
    selectors: selectors,
    variable: variable || el.value,
    htmlSnapshot: htmlSnapshot,
    url: window.location.href,
    waitFor: null,
    timeout: 5000,
  };
  recorderState.etapes.push(newSelectStep);

  saveRecorderState();
  updateRecorderPanel();
  highlightRecordedField(el, newSelectStep.variable);
  showRPAToast("⏺ Étape " + recorderState.etapes.length + " — sélection " + label.slice(0, 20) + (variable ? " → " + variable : ""), "info");
}

/* Sauvegarder l'état du recorder dans chrome.storage après chaque étape */
function saveRecorderState() {
  if (!recorderState) return;
  /* Exclure les htmlSnapshot du storage local (trop lourds, limite 10MB Chrome).
     Les snapshots restent en mémoire dans recorderState.etapes
     et sont envoyés au serveur uniquement lors du stopRecorder(). */
  var etapesSansHtml = recorderState.etapes.map(function(e) {
    var copy = Object.assign({}, e);
    delete copy.htmlSnapshot;
    return copy;
  });
  var pages = [];
  var seenUrls = {};
  for (var pi = 0; pi < recorderState.etapes.length; pi++) {
    var u = recorderState.etapes[pi].url;
    if (u && !seenUrls[u]) { seenUrls[u] = true; pages.push(u); }
  }
  chrome.storage.local.set({ audibot_recorder: {
    active: true,
    etapes: etapesSansHtml,
    hostname: recorderState.hostname,
    startTime: recorderState.startTime,
    pages: pages,
  }});
}

/* Restaurer le recorder si une navigation a eu lieu pendant l'enregistrement */
function restoreRecorderIfNeeded() {
  chrome.storage.local.get(["audibot_recorder"], function(result) {
    var saved = result.audibot_recorder;
    if (!saved || !saved.active) return;

    /* Recorder actif dans le storage mais pas en mémoire → restaurer.
       Note: les htmlSnapshot ne sont pas restaurés après navigation (non stockés localement).
       Seules les étapes sans snapshot sont récupérées — les snapshots HTML sont envoyés
       au serveur à la fin de l'enregistrement uniquement. */
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
      badge.innerHTML = '<span style="width:10px;height:10px;background:white;border-radius:50%;display:inline-block;animation:pulse 1s infinite;"></span> Enregistrement en cours (' + recorderState.etapes.length + ' étapes) — continuez le parcours';
      document.body.appendChild(badge);
    }

    /* Ré-attacher les listeners */
    document.addEventListener("click", onRecorderClick, true);
    document.addEventListener("change", onRecorderChange, true);
    document.addEventListener("blur", onRecorderBlur, true);

    /* Ré-afficher le panneau guidé */
    showRecorderPanel();
    updateRecorderPanel();

    showRPAToast("⏺ Enregistrement repris (" + recorderState.etapes.length + " étapes déjà enregistrées)", "info");
  });
}

/* Écouter les messages du popup */
chrome.runtime.onMessage.addListener(function(msg) {
  if (msg && msg.type === "AUDIBOT_RECORDER_START") startRecorder();
  if (msg && msg.type === "AUDIBOT_RECORDER_STOP") stopRecorder();
  if (msg && msg.type === "AUDIBOT_RECORDER_STATUS") {
    chrome.runtime.sendMessage({ type: "AUDIBOT_RECORDER_STATUS_REPLY", active: !!recorderState, etapes: recorderState ? recorderState.etapes.length : 0 });
  }
});

/* restoreBotIfNeeded — désactivé */

/* ── Fin Macro Recorder ──────────────────────────────────────────────────── */

/* ── Expose les fonctions utilitaires pour les portails modulaires ─── */
globalThis.ultraFill = ultraFill;
globalThis.ultraFillWithRetry = ultraFillWithRetry;
globalThis.findElement = findElement;
globalThis.capitalize = typeof capitalize === 'function' ? capitalize : function(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : ""; };
globalThis.getOuvrantDroitNSS = getOuvrantDroitNSS;
globalThis.isUnder18 = isUnder18;
globalThis.normalizePhone = normalizePhone;
globalThis.selectRadixOption = selectRadixOption;
globalThis.fillDatePicker = fillDatePicker;
globalThis.smartSelectOption = smartSelectOption;
globalThis.findInShadowRoots = findInShadowRoots;
globalThis.querySelectorAllDeep = querySelectorAllDeep;
globalThis.waitForElement = waitForElement;
globalThis.validateLuhnNSS = validateLuhnNSS;
globalThis.showRPAToast = showRPAToast;
globalThis.detectPageContext = detectPageContext;
globalThis.checkDroitsMutuelle = checkDroitsMutuelle;
globalThis.saveSelectorCache = saveSelectorCache;
