/* ── Initialisation ──────────────────────────────────────────────────────── */

import { setupDevisDetection } from "../utils/devis-capture.js";

export function init() {
  if (window.location.hostname.includes("localhost")) return;

  loadSelectorCache();

  const currentSite = Object.values(CONFIGS).find(cfg => cfg.isMatch());

  /* Portail inconnu — afficher quand même le bouton Smart Fill */
  if (!currentSite) {
    if (!document.getElementById("optibot-fill-btn")) {
      var btnSmart = document.createElement("button");
      btnSmart.type = "button";
      btnSmart.id = "optibot-fill-btn";
      btnSmart.innerText = "\uD83E\uDD16 Remplir";
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
  if (!document.getElementById('optibot-fill-btn')) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'optibot-fill-btn';
    btn.innerText = '\uD83E\uDD16 Remplir';
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

  /* ── Remplissage auto au chargement (activé par défaut) ── */
  chrome.storage.local.get(["optibot_settings"], function(result) {
    var settings = result.optibot_settings || {};
    if (settings.autofillOnLoad !== false) {
      /* Attendre que la page soit prête avant de fill */
      setTimeout(function() {
        if (typeof performSmartFill === "function") performSmartFill();
      }, 1500);
    }
  });

  /* ── Amélioration 5 : détection corrections utilisateur ── */
  document.addEventListener("input", function(e) {
    var el = e.target;
    if (!el || !el.getAttribute) return;
    var filledVar = el.getAttribute("data-optibot-filled");
    if (!filledVar) return;
    var oldValue = el.getAttribute("data-optibot-value");
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
    if (!doc || doc._optibotObserved) return;
    doc._optibotObserved = true;
    var obs = new MutationObserver(function() {
      if (_smartFillDebounce) clearTimeout(_smartFillDebounce);
      _smartFillDebounce = setTimeout(function() {
        var currentFields = getVisibleFields();
        var hasNew = false;
        currentFields.forEach(function(f) {
          var key = f.id || f.name || (f.getAttribute && f.getAttribute("formcontrolname")) || "";
          if (key && !_knownFieldIds.has(key) && !(f.getAttribute && f.getAttribute("data-optibot-filled"))) {
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

  /* Raccourci clavier Ctrl+Shift+F (Cmd+Shift+F sur Mac) pour Smart Fill */
  document.addEventListener("keydown", function(e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "F" || e.key === "f")) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof performSmartFill === "function") performSmartFill();
    }
  }, true);
}
