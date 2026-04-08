/* ── AudiBot Pre-Submit Validation Module ───────────────────────────────── */
/* Hooks into form submission to validate fields before they are sent.      */

import { runAllValidations } from "./validators.js";
import { showPreSubmitOverlay, hidePreSubmitOverlay } from "./overlay.js";

/* ── Portal submit button selectors ────────────────────────────────────── */

var SUBMIT_SELECTORS = {
  "almerys.com": "button[type=submit], .btn-valider, #soumettre, .submit-btn",
  "viamedis.net": "button[type=submit], .btn-submit, .valider-pec",
  "wemind.io": "button[type=submit], .submit-form",
  "_default": "button[type=submit], input[type=submit], .btn-valider, .btn-submit, [class*=submit], [class*=valider]",
};

/* ── State ─────────────────────────────────────────────────────────────── */

var _bypassNext = false;
var _attachedButtons = new WeakSet();

/* ── Detect portal ─────────────────────────────────────────────────────── */

function detectPortail() {
  var hostname = window.location.hostname.toLowerCase();
  var portails = Object.keys(SUBMIT_SELECTORS);
  for (var i = 0; i < portails.length; i++) {
    if (portails[i] !== "_default" && hostname.includes(portails[i])) {
      return portails[i];
    }
  }
  return "_default";
}

/* ── Get submit selectors for portal ───────────────────────────────────── */

function getSubmitSelectors(portail) {
  return SUBMIT_SELECTORS[portail] || SUBMIT_SELECTORS["_default"];
}

/* ── Read visible form fields ──────────────────────────────────────────── */

function readFormFields() {
  var data = {};
  var inputs = document.querySelectorAll("input, select, textarea");

  for (var i = 0; i < inputs.length; i++) {
    var el = inputs[i];
    /* Skip hidden / not visible */
    if (el.type === "hidden" || el.offsetParent === null) continue;

    var key = el.name || el.id || "";
    if (!key) continue;

    var val = el.value || "";
    var keyLower = key.toLowerCase();

    /* Map known field patterns to standardized keys */
    if (keyLower.match(/n(um)?[_\-]?s(ecurite)?[_\-]?s(ociale)?|nir|nss/)) {
      data.nss = val;
    } else if (keyLower.match(/rpps/)) {
      data.rpps = val;
    } else if (keyLower.match(/date[_\-]?(ord|presc)/)) {
      data.dateOrdonnance = val;
    } else if (keyLower.match(/date[_\-]?(nais|birth|dob)/)) {
      data.dateNaissance = val;
    } else if (keyLower.match(/civil/)) {
      data.civilite = val;
    } else if (keyLower.match(/montant|prix|total/)) {
      data.montant = val;
    } else if (keyLower.match(/code[_\-]?(acte|lpp|prestation)/)) {
      data.codeActe = val;
    } else if (keyLower.match(/nom|name/) && !keyLower.match(/prenom|first/)) {
      data.nom = val;
    } else if (keyLower.match(/prenom|first[_\-]?name/)) {
      data.prenom = val;
    } else if (keyLower.match(/lentille|contact[_\-]?lens/)) {
      data.isLentilles = true;
    }

    /* Also store the raw key */
    data[key] = val;
  }

  /* Detect lentilles from page content if not explicitly in a field */
  if (!data.isLentilles) {
    var pageText = document.title + " " + (document.querySelector("h1, h2, .page-title") || { textContent: "" }).textContent;
    if (/lentille/i.test(pageText)) {
      data.isLentilles = true;
    }
  }

  return data;
}

/* ── Intercept submit ──────────────────────────────────────────────────── */

function interceptSubmit(event, portail) {
  /* If bypass flag is set, let through */
  if (_bypassNext) {
    _bypassNext = false;
    return;
  }

  var formData = readFormFields();
  var results = runAllValidations(formData, portail);

  /* Log via optiTrace */
  if (globalThis.optiTrace) {
    globalThis.optiTrace.log("PRE_SUBMIT", "Validation pre-soumission", {
      portail: portail,
      errors: results.errors.length,
      warnings: results.warnings.length,
      passed: results.passed.length,
    });
  }

  /* All passed — let the click through */
  if (results.errors.length === 0 && results.warnings.length === 0) {
    return;
  }

  /* Block submission and show overlay */
  event.preventDefault();
  event.stopPropagation();

  var clickedButton = event.target;

  showPreSubmitOverlay(
    results,
    /* onCorrect */
    function() {
      /* Just close the overlay — user goes back to fix things */
    },
    /* onSubmitAnyway */
    function() {
      /* Re-click the submit button with bypass */
      _bypassNext = true;
      if (clickedButton && typeof clickedButton.click === "function") {
        clickedButton.click();
      }
    }
  );
}

/* ── Attach listeners to submit buttons ────────────────────────────────── */

function attachSubmitListeners(portail) {
  var selectors = getSubmitSelectors(portail);
  var buttons;
  try {
    buttons = document.querySelectorAll(selectors);
  } catch (err) {
    console.warn("[AudiBot] Invalid submit selector:", err);
    buttons = document.querySelectorAll(SUBMIT_SELECTORS["_default"]);
  }

  for (var i = 0; i < buttons.length; i++) {
    var btn = buttons[i];
    if (_attachedButtons.has(btn)) continue;
    _attachedButtons.add(btn);

    (function(b, p) {
      b.addEventListener("click", function(e) {
        interceptSubmit(e, p);
      }, true); /* capture phase */
    })(btn, portail);
  }
}

/* ── Load rejection patterns ───────────────────────────────────────────── */

export function loadRejetPatterns(hostname) {
  var cacheKey = "audibot_rejet_patterns";
  try {
    var cached = localStorage.getItem(cacheKey);
    if (cached) {
      var parsed = JSON.parse(cached);
      if (parsed.ts && Date.now() - parsed.ts < 24 * 60 * 60 * 1000) {
        return; /* Cache still valid */
      }
    }
  } catch (e) { /* ignore parse errors */ }

  /* Fetch from API */
  chrome.storage.local.get(["audibot_auth"], function(result) {
    var auth = result.audibot_auth || {};
    if (!auth.syncToken) return;

    fetch("https://audibot.fr/api/extension/rejet-patterns?hostname=" + encodeURIComponent(hostname), {
      headers: { "Authorization": "Bearer " + auth.syncToken },
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ data: data, ts: Date.now() }));
      } catch (e) { /* storage full, ignore */ }
    })
    .catch(function(err) {
      console.warn("[AudiBot] rejet-patterns fetch failed:", err);
    });
  });
}

/* ── Init ──────────────────────────────────────────────────────────────── */

export function initPreSubmitValidation() {
  var portail = detectPortail();

  if (globalThis.optiTrace) {
    globalThis.optiTrace.log("PRE_SUBMIT", "Init pre-submit validation", { portail: portail });
  }

  /* Attach to existing submit buttons */
  attachSubmitListeners(portail);

  /* Watch for dynamically added buttons */
  var observer = new MutationObserver(function() {
    attachSubmitListeners(portail);
  });
  observer.observe(document.body, { childList: true, subtree: true });

  /* Load rejection patterns */
  loadRejetPatterns(window.location.hostname);
}
