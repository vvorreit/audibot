/* ── Replay Engine — Parcours RPA Dynamique ──────────────────────────────── */
/* Les valeurs patient viennent du cache LOCAL chiffré — jamais du serveur    */

/* ── Formatage NSS automatique selon le contexte du champ ─────────────── */
function formatNSS(rawNSS, el) {
  if (!rawNSS) return rawNSS;
  var digits = rawNSS.replace(/\D/g, "");

  /* Détecter le format attendu par le champ */
  var maxLen = el ? parseInt(el.getAttribute("maxlength") || "0") : 0;
  var placeholder = el ? (el.placeholder || "") : "";
  var name = el ? (el.name || "") : "";

  /* Champ qui attend 13 chiffres (sans clé) */
  if (maxLen === 13 || name.indexOf("13") !== -1 || placeholder.match(/\d{13}$/)) {
    return digits.slice(0, 13);
  }
  /* Champ qui attend juste la clé (2 chiffres) */
  if (maxLen === 2 && (name.indexOf("cle") !== -1 || name.indexOf("key") !== -1)) {
    return digits.slice(13, 15);
  }
  /* Champ avec espaces (format lisible) */
  if (placeholder.match(/\d\s\d/) || maxLen > 15) {
    if (digits.length >= 15) {
      return digits[0] + " " + digits.slice(1, 3) + " " + digits.slice(3, 5) + " " + digits.slice(5, 7) + " " + digits.slice(7, 10) + " " + digits.slice(10, 13) + " " + digits.slice(13, 15);
    }
  }
  /* Par défaut : retourner les 15 chiffres bruts */
  return digits.slice(0, 15);
}

export function resolveVariables(template, cache, el) {
  if (!template) return "";
  var m = cache.current || {};
  var o = m.ordonnance || {};
  var od = o.lunettesOD || {};
  var og = o.lunettesOG || {};
  var p0 = (m.personnes && m.personnes[0]) || {};
  var pres = m.prescription || {};
  var regimes = m.regimes || {};
  var rc1 = regimes.rc1 || {};
  var lod = o.lentillesOD || {};
  var log = o.lentillesOG || {};

  /* NSS formaté selon le champ cible */
  var nssRaw = m.numeroSecuriteSociale || m.nss || "";
  var nssFormatted = template === "{{nss}}" ? formatNSS(nssRaw, el) : nssRaw;

  var vars = {
    /* Patient */
    "{{nom}}": (m.nom || p0.nom || "").toUpperCase(),
    "{{prenom}}": m.prenom || p0.prenom || "",
    "{{nss}}": nssFormatted,
    "{{dateNaissance}}": m.dateNaissance || m.dob || "",
    /* Contact */
    "{{telephone}}": m.phone || m.telephone || "",
    "{{email}}": m.email || "",
    "{{adresse}}": m.address || m.adresse || "",
    "{{codePostal}}": m.zipCode || m.codePostal || "",
    "{{ville}}": m.city || m.ville || "",
    /* Mutuelle */
    "{{organisme}}": m.organisme || rc1.nom || "",
    "{{numeroAdherent}}": m.numeroAdherent || rc1.numeroAdherent || "",
    "{{numeroAMC}}": m.numeroAMC || "",
    "{{numeroTeletransmission}}": m.numeroTeletransmission || rc1.numeroTeletransmission || "",
    "{{critereSecondaire}}": m.critereSecondaire || rc1.critereSecondaire || "",
    "{{codeConvention}}": m.codeConvention || rc1.codeConvention || "",
    "{{dateDebutValidite}}": m.dateDebutValidite || rc1.dateDebut || "",
    "{{dateFinValidite}}": m.dateFinValidite || rc1.dateFin || "",
    /* Prescription */
    "{{dateOrdonnance}}": o.dateOrdonnance || pres.datePrescription || "",
    "{{nomOphtalmologue}}": o.nomOphtalmologue || pres.prescripteur || "",
    "{{rpps}}": o.rpps || pres.rpps || "",
    "{{distancePupillaire}}": o.distancePupillaire || "",
    "{{typePrescription}}": o.typePrescription || pres.typeVision || "",
    /* Lunettes OD */
    "{{sphere_od}}": od.sphere || "",
    "{{cylindre_od}}": od.cylindre || "",
    "{{axe_od}}": od.axe || "",
    "{{addition_od}}": od.addition || "",
    /* Lunettes OG */
    "{{sphere_og}}": og.sphere || "",
    "{{cylindre_og}}": og.cylindre || "",
    "{{axe_og}}": og.axe || "",
    "{{addition_og}}": og.addition || "",
    /* Addition générique */
    "{{addition}}": od.addition || og.addition || "",
    /* Lentilles OD */
    "{{sphere_lentille_od}}": lod.sphere || "",
    "{{cylindre_lentille_od}}": lod.cylindre || "",
    "{{axe_lentille_od}}": lod.axe || "",
    "{{addition_lentille_od}}": lod.addition || "",
    "{{rayon_od}}": lod.rayonCourbure || "",
    "{{diametre_od}}": lod.diametre || "",
    /* Lentilles OG */
    "{{sphere_lentille_og}}": log.sphere || "",
    "{{cylindre_lentille_og}}": log.cylindre || "",
    "{{axe_lentille_og}}": log.axe || "",
    "{{addition_lentille_og}}": log.addition || "",
    "{{rayon_og}}": log.rayonCourbure || "",
    "{{diametre_og}}": log.diametre || "",
  };
  var result = template;
  for (var key in vars) { result = result.split(key).join(vars[key]); }
  if (result === "" || result === template) return "";
  return result;
}

/* ── Scroll l'élément dans la vue avant interaction ───────────────────── */
function scrollIntoViewIfNeeded(el) {
  if (!el) return;
  var rect = el.getBoundingClientRect();
  var inView = rect.top >= 0 && rect.bottom <= window.innerHeight &&
               rect.left >= 0 && rect.right <= window.innerWidth;
  if (!inView) {
    el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  }
}

function isDateVariable(variable) {
  if (!variable) return false;
  return variable.indexOf("date") !== -1 || variable.indexOf("Date") !== -1 ||
         variable.indexOf("naissance") !== -1 || variable.indexOf("Naissance") !== -1;
}

function frameworkDelay(ms) {
  return new Promise(function(r) { setTimeout(r, ms || 150); });
}

/* ── Progress Overlay ─────────────────────────────────────────────────── */

var _progressOverlay = null;

function showProgressOverlay(current, total, label) {
  if (!_progressOverlay) {
    _progressOverlay = document.createElement("div");
    _progressOverlay.id = "optibot-replay-progress";
    _progressOverlay.style.cssText = "position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:2147483647;background:white;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.15);padding:12px 20px;font-family:sans-serif;min-width:280px;";
    document.body.appendChild(_progressOverlay);
  }

  var pct = Math.round((current / total) * 100);
  _progressOverlay.innerHTML =
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
      '<span style="font-size:12px;font-weight:600;color:#374151;">\u2699\uFE0F RPA en cours</span>' +
      '<span style="font-size:11px;color:#6b7280;">' + current + '/' + total + '</span>' +
    '</div>' +
    '<div style="height:4px;background:#e5e7eb;border-radius:2px;overflow:hidden;">' +
      '<div style="height:100%;background:#3b82f6;border-radius:2px;width:' + pct + '%;transition:width 0.3s;"></div>' +
    '</div>' +
    '<div style="font-size:11px;color:#9ca3af;margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + (label || "") + '</div>';
}

function hideProgressOverlay() {
  if (_progressOverlay) {
    _progressOverlay.remove();
    _progressOverlay = null;
  }
}

function showProgressSuccess(filled, elapsed) {
  if (_progressOverlay) {
    _progressOverlay.innerHTML =
      '<div style="text-align:center;padding:4px 0;">' +
        '<div style="font-size:14px;font-weight:600;color:#10b981;">\u2705 Termin\u00E9</div>' +
        '<div style="font-size:12px;color:#6b7280;margin-top:4px;">' + filled + ' champs remplis en ' + elapsed + 's</div>' +
      '</div>';
    setTimeout(hideProgressOverlay, 4000);
  }
}

/* ── Étape replay ─────────────────────────────────────────────────────── */

export async function runStep(etape, cache) {
  var timeout = etape.timeout || 5000;
  var selectors = Array.isArray(etape.selectors) ? etape.selectors : (etape.selector ? [etape.selector] : []);

  if (etape.action === "wait") {
    var elW = await findElementBySelectors(selectors, timeout);
    return elW !== null;
  }

  var el = await findElementBySelectors(selectors, timeout);
  if (!el) return false;

  /* Résoudre la variable avec le contexte de l'élément trouvé (pour le formatage NSS) */
  var value = etape.variable ? resolveVariables(etape.variable, cache, el) : null;

  scrollIntoViewIfNeeded(el);
  await frameworkDelay(50);

  /* Highlight temporaire de l'élément en cours */
  var prevOutline = el.style.outline;
  el.style.outline = "2px solid #3b82f6";

  if (etape.action === "fill") {
    var isDate = isDateVariable(etape.variable);
    var filled = await smartFillField(el, value, isDate);
    if (!filled) {
      ultraFill(el, value, { force: true });
    }
    /* Learning : marquer le champ pour la boucle d'apprentissage */
    var varKey = (etape.variable || "").replace(/\{|\}/g, "") || etape.label || "";
    markFilledByOptiBot(el, varKey);
    await frameworkDelay(80);
  } else if (etape.action === "click") {
    el.click();
    await frameworkDelay(150);
  } else if (etape.action === "select") {
    var selected = smartSelectOption(el, value);
    if (!selected) {
      el.value = value;
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
    /* Learning : marquer le champ pour la boucle d'apprentissage */
    var varKeyS = (etape.variable || "").replace(/\{|\}/g, "") || etape.label || "";
    markFilledByOptiBot(el, varKeyS);
    await frameworkDelay(80);
  }

  /* Retirer le highlight */
  setTimeout(function() { el.style.outline = prevOutline; }, 500);

  if (etape.waitFor) {
    var next = await waitForElement(etape.waitFor, timeout);
    return next !== null;
  }
  return true;
}

async function runStepWithRetry(etape, cache, maxRetries) {
  maxRetries = maxRetries || 3;
  for (var attempt = 0; attempt <= maxRetries; attempt++) {
    var ok = await runStep(etape, cache);
    if (ok) return true;
    if (attempt < maxRetries) {
      await frameworkDelay(800 * Math.pow(2, attempt));
    }
  }
  return false;
}

export var replayState = null;

export function setReplayState(val) { replayState = val; }

/* Nettoyage si la page est déchargée pendant un replay */
window.addEventListener("pagehide", function() {
  replayState = null;
  hideProgressOverlay();
});

export async function startReplay(parcours, cache) {
  var etapes = parcours.etapes || [];
  var total = etapes.length;
  var startTime = Date.now();
  replayState = { parcours: parcours, currentIndex: 0, paused: false, cache: cache, failCount: 0 };

  showProgressOverlay(0, total, "D\u00E9marrage\u2026");
  logRPA(parcours.hostname || "parcours", "replay_start", "succes");

  for (var i = 0; i < etapes.length; i++) {
    if (replayState && replayState.paused) {
      await new Promise(function(resolve) { replayState.onResume = resolve; });
    }
    if (!replayState) { hideProgressOverlay(); return; }

    replayState.currentIndex = i;
    var etape = etapes[i];
    showProgressOverlay(i + 1, total, etape.label || etape.action);

    var ok = await runStepWithRetry(etape, cache, 3);

    if (!ok) {
      replayState.paused = true;
      replayState.failCount = (replayState.failCount || 0) + 1;
      showRPAToast("\u26A0\uFE0F RPA bloqu\u00E9 \u00E9tape " + (i + 1) + " \u2014 " + etape.label + " non trouv\u00E9\nRemplissez manuellement puis cliquez \u25B6 Reprendre", "error");
      logRPA(parcours.hostname || "parcours", "step" + (i + 1) + "_" + (etape.action || "unknown"), "echec", etape.label + " non trouve");
      showReplayControls();
      if (replayState.failCount >= 2) {
        sendHealthPing(parcours.hostname, "broken", "replay_fail_step_" + (i + 1));
      }
      await new Promise(function(resolve) { replayState.onResume = resolve; });
      replayState.paused = false;
    } else {
      replayState.failCount = 0;
    }
  }

  var elapsed = Math.round((Date.now() - startTime) / 1000);
  var filled = etapes.filter(function(e) { return e.action === "fill"; }).length;
  showProgressSuccess(filled, elapsed);
  showRPAToast("\u2705 Parcours termin\u00E9 \u2014 " + filled + " champs remplis en " + elapsed + "s", "success");
  logRPA(parcours.hostname || "parcours", "replay_complete", "succes", filled + " champs en " + elapsed + "s");
  getSyncToken().then(function(syncToken) {
    if (syncToken) {
      fetch("https://optibot.fr/api/extension/log-injection", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ syncToken: syncToken, site: parcours.hostname, success: true, fieldsCount: filled, ts: Date.now() })
      }).catch(function(err) { console.warn("[OptiBot] log-injection failed:", err); });
    }
  });
  replayState = null;
}

export async function tryDynamicReplay() {
  var hostname = window.location.hostname.replace("www.", "");
  var syncToken = await getSyncToken();
  if (!syncToken) return false;
  try {
    var res = await fetch("https://optibot.fr/api/extension/parcours?hostname=" + encodeURIComponent(hostname), { headers: { "Authorization": "Bearer " + syncToken } });
    if (!res.ok) return false;
    var data = await res.json();
    if (!data.parcours || data.parcours.length === 0) return false;
    var parcours = data.parcours[0];
    var cache = await readEncryptedCache() || {};
    startReplay(parcours, cache);
    return true;
  } catch(e) { return false; }
}
