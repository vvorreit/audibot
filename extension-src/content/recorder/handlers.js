/* ── Recorder Event Handlers ───────────────────────────────────────────── */

/* Handler blur (fin de saisie dans un champ) — sérialisé via queue pour éviter les races sur detectVariable() */
export var recorderBlurQueue = Promise.resolve();

/* ── Debounce pour éviter les captures multiples rapides ─────────────── */
var _lastClickTime = 0;
var _lastClickSelector = "";

/* Handler click */
export async function onRecorderClick(e) {
  if (!recorderState || recorderState.paused) return;
  var el = e.target;
  if (!el || el.id === "optibot-recorder-badge" || el.closest("#optibot-recorder-badge") || el.closest("#optibot-recorder-panel")) return;

  /* Ignorer les champs de saisie (gérés par blur) */
  if (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT") return;

  /* Debounce : ignorer les doubles-clics rapides sur le même élément */
  var selectors = generateSelectors(el);
  var now = Date.now();
  if (selectors[0] === _lastClickSelector && now - _lastClickTime < 500) return;
  _lastClickTime = now;
  _lastClickSelector = selectors[0];

  var label = (el.innerText || el.value || el.getAttribute("aria-label") || "").trim().slice(0, 50);

  var newStep = {
    id: "step_" + (recorderState.etapes.length + 1),
    label: label || "Clic",
    action: "click",
    selectorType: "css",
    selector: selectors[0],
    selectors: selectors,
    variable: null,
    htmlSnapshot: null,
    url: window.location.href,
    waitFor: null,
    timeout: 5000,
  };
  recorderState.etapes.push(newStep);

  saveRecorderState();
  updateRecorderPanel();
  showRPAToast("\u23FA \u00C9tape " + recorderState.etapes.length + " \u2014 clic enregistr\u00E9", "info");

  /* Détection automatique du waitFor après navigation ou changement DOM */
  var urlBefore = window.location.href;
  var bodySnapshot = document.body.innerHTML.length;
  var lastStepAdded = newStep;
  setTimeout(function() {
    if (!recorderState) return;
    if (window.location.href !== urlBefore) {
      lastStepAdded.waitFor = "input:not([type=hidden]), select, button[type=submit], form";
      saveRecorderState();
      showRPAToast("\uD83D\uDCC4 Nouvelle page \u2014 continuez votre saisie", "info");
      var recBadge = document.getElementById("optibot-recorder-badge");
      if (recBadge) {
        recBadge.innerHTML = '<span style="width:10px;height:10px;background:white;border-radius:50%;display:inline-block;animation:pulse 1s infinite;"></span> Enregistrement (' + recorderState.etapes.length + ' \u00E9tapes)';
      }
    } else if (Math.abs(document.body.innerHTML.length - bodySnapshot) > 500) {
      lastStepAdded.waitFor = "input:not([type=hidden]), select, button[type=submit], form";
      saveRecorderState();
    }
  }, 800);
}

export async function onRecorderBlur(e) {
  if (!recorderState || recorderState.paused) return;
  var el = e.target;
  if (!el || !["INPUT", "TEXTAREA"].includes(el.tagName)) return;
  if (!el.value || el.value.length < 1) return;

  /* Capturer les valeurs immédiatement (avant que le DOM change) */
  var capturedValue = el.value;
  var capturedSelectors = generateSelectors(el);
  var capturedSelector = capturedSelectors[0];
  var capturedLabelEl = el.id ? document.querySelector('label[for="' + el.id + '"]') : null;
  if (!capturedLabelEl && el.closest) capturedLabelEl = el.closest("label");
  var capturedLabel = (capturedLabelEl && capturedLabelEl.textContent.trim()) || el.placeholder || el.name || el.getAttribute("aria-label") || "Champ";
  var capturedUrl = window.location.href;

  recorderBlurQueue = recorderBlurQueue.then(async function() {
    if (!recorderState) return;

    var fieldInfo = {
      label: capturedLabel,
      name: el.name || "",
      placeholder: el.placeholder || "",
      ariaLabel: el.getAttribute("aria-label") || "",
    };
    var variable = await detectVariable(capturedValue, fieldInfo);

    /* Déduplication : si la dernière étape cible le même sélecteur → mise à jour */
    var lastEtape = recorderState.etapes[recorderState.etapes.length - 1];
    if (lastEtape && lastEtape.action === "fill" && lastEtape.selector === capturedSelector) {
      lastEtape.variable = variable || "[VALEUR STATIQUE \u2014 \u00C0 RENSEIGNER]";
      lastEtape.selectors = capturedSelectors;
      saveRecorderState();
      updateRecorderPanel();
      var dedupEl = document.querySelector(capturedSelector);
      if (dedupEl) highlightRecordedField(dedupEl, lastEtape.variable);
      showRPAToast("\u23FA \u00C9tape " + recorderState.etapes.length + " mise \u00E0 jour \u2014 " + capturedLabel.slice(0, 20), "info");
      return;
    }

    var newFillStep = {
      id: "step_" + (recorderState.etapes.length + 1),
      label: capturedLabel.slice(0, 50),
      action: "fill",
      selectorType: "css",
      selector: capturedSelector,
      selectors: capturedSelectors,
      variable: variable || "[VALEUR STATIQUE \u2014 \u00C0 RENSEIGNER]",
      htmlSnapshot: null,
      url: capturedUrl,
      waitFor: null,
      timeout: 5000,
    };
    recorderState.etapes.push(newFillStep);

    saveRecorderState();
    updateRecorderPanel();
    var fillEl = document.querySelector(capturedSelector);
    if (fillEl) highlightRecordedField(fillEl, newFillStep.variable);
    showRPAToast("\u23FA \u00C9tape " + recorderState.etapes.length + " \u2014 " + capturedLabel.slice(0, 20) + (variable ? " \u2192 " + variable : " \u2192 statique"), "info");
  });
}

/* Handler change (select) */
export async function onRecorderChange(e) {
  if (!recorderState || recorderState.paused) return;
  var el = e.target;
  if (el.tagName !== "SELECT") return;

  var selectors = generateSelectors(el);
  var label = el.name || el.id || el.getAttribute("aria-label") || "S\u00E9lection";
  var fieldInfo = { label: label, name: el.name || "", placeholder: "", ariaLabel: el.getAttribute("aria-label") || "" };
  var variable = await detectVariable(el.value, fieldInfo);

  var newSelectStep = {
    id: "step_" + (recorderState.etapes.length + 1),
    label: label.slice(0, 50),
    action: "select",
    selectorType: "css",
    selector: selectors[0],
    selectors: selectors,
    variable: variable || el.value,
    htmlSnapshot: null,
    url: window.location.href,
    waitFor: null,
    timeout: 5000,
  };
  recorderState.etapes.push(newSelectStep);

  saveRecorderState();
  updateRecorderPanel();
  highlightRecordedField(el, newSelectStep.variable);
  showRPAToast("\u23FA \u00C9tape " + recorderState.etapes.length + " \u2014 s\u00E9lection " + label.slice(0, 20) + (variable ? " \u2192 " + variable : ""), "info");
}
