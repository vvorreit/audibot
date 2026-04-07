/* ── OptiBot Hot-Patch System ───────────────────────────────────────────── */
/* Charge et exécute des patches JS depuis le serveur pour corriger des      */
/* problèmes sans mettre à jour l'extension.                                */
/*                                                                          */
/* Les patches sont :                                                       */
/* - Chargés depuis chrome.storage.local (alimenté par le background)       */
/* - Filtrés par hostname (chaque patch cible un ou plusieurs portails)     */
/* - Exécutés dans le contexte du content script (accès complet)            */
/* - Versionnés pour éviter la ré-exécution                                 */
/*                                                                          */
/* Types de patches supportés :                                             */
/* - "selector_override" : remplacer un sélecteur CSS                       */
/* - "alias_add" : ajouter des aliases smart-fill                           */
/* - "config_override" : modifier une config runtime                        */
/* - "blacklist_add" : ajouter des champs à la blacklist                    */
/* ─────────────────────────────────────────────────────────────────────────*/

var _appliedPatches = {};

function loadAndApplyHotPatches() {
  var hostname = window.location.hostname.replace("www.", "").toLowerCase();

  chrome.storage.local.get(["optibot_hotpatches"], function(result) {
    var data = result.optibot_hotpatches;
    if (!data || !data.patches || !Array.isArray(data.patches)) return;

    var patches = data.patches;
    var applied = 0;

    for (var i = 0; i < patches.length; i++) {
      var patch = patches[i];
      if (!patch || !patch.id || !patch.type) continue;

      /* Déjà appliqué cette session ? */
      if (_appliedPatches[patch.id]) continue;

      /* Vérifier que le patch cible ce hostname */
      var targets = patch.hostnames || [];
      var matchesHost = false;
      for (var t = 0; t < targets.length; t++) {
        if (targets[t] === "*" || hostname.indexOf(targets[t]) !== -1) {
          matchesHost = true;
          break;
        }
      }
      if (!matchesHost) continue;

      /* Appliquer le patch */
      try {
        applyPatch(patch);
        _appliedPatches[patch.id] = true;
        applied++;
        if (globalThis.optiTrace) globalThis.optiTrace.log("HOTPATCH", "Applied: " + patch.id, { type: patch.type, name: patch.name || "" });
      } catch(e) {
        if (globalThis.optiTrace) globalThis.optiTrace.log("ERROR", "Hotpatch failed: " + patch.id, { error: e.message });
      }
    }

    if (applied > 0 && globalThis.optiTrace) {
      globalThis.optiTrace.log("HOTPATCH", applied + " patches applied for " + hostname);
    }
  });
}

function applyPatch(patch) {
  switch (patch.type) {

    /* ── Type 1 : Override de sélecteurs ─────────────────────────────── */
    case "selector_override":
      /* patch.data = { portal: "xxx", selectors: { nom: "#new_sel", ... } } */
      if (patch.data && patch.data.portal && patch.data.selectors) {
        var portal = patch.data.portal;
        var sels = patch.data.selectors;
        /* Injecter dans le système d'overrides existant */
        chrome.storage.local.get(["optibot_selector_overrides"], function(result) {
          var overrides = (result.optibot_selector_overrides || {}).overrides || {};
          if (!overrides[portal]) overrides[portal] = {};
          for (var key in sels) {
            overrides[portal][key] = sels[key];
          }
          chrome.storage.local.set({
            optibot_selector_overrides: {
              overrides: overrides,
              version: Date.now(),
              ts: Date.now()
            }
          });
          /* Recharger les overrides en mémoire */
          if (typeof globalThis.loadRemoteSelectors === "function") {
            globalThis.loadRemoteSelectors();
          }
        });
      }
      break;

    /* ── Type 2 : Ajout d'aliases smart-fill ─────────────────────────── */
    case "alias_add":
      /* patch.data = { field: "roCodeRegime", aliases: ["code_regime", ...] } */
      if (patch.data && patch.data.field && patch.data.aliases) {
        var ALIASES = globalThis.SMART_FILL_ALIASES;
        if (ALIASES) {
          if (!ALIASES[patch.data.field]) ALIASES[patch.data.field] = [];
          var existing = ALIASES[patch.data.field];
          for (var ai = 0; ai < patch.data.aliases.length; ai++) {
            if (existing.indexOf(patch.data.aliases[ai]) === -1) {
              existing.push(patch.data.aliases[ai]);
            }
          }
        }
      }
      break;

    /* ── Type 3 : Config override déclaratif ────────────────────────── */
    case "config_override":
      /* patch.data = { key: "CHUNK_SIZE", value: 20 } */
      if (patch.data && patch.data.key && patch.data.value !== undefined) {
        globalThis["optibot_config_" + patch.data.key] = patch.data.value;
      }
      break;

    /* ── Type 4 : Blacklist add (ajouter des champs à ne pas remplir) ── */
    case "blacklist_add":
      /* patch.data = { fields: ["new_field_1", "new_field_2"] } */
      if (patch.data && Array.isArray(patch.data.fields) && globalThis.SMART_FILL_ALIASES) {
        var BL = globalThis.SMART_FILL_BLACKLIST;
        if (BL && Array.isArray(BL)) {
          for (var bi = 0; bi < patch.data.fields.length; bi++) {
            if (BL.indexOf(patch.data.fields[bi]) === -1) BL.push(patch.data.fields[bi]);
          }
        }
      }
      break;

    default:
      if (globalThis.optiTrace) globalThis.optiTrace.log("HOTPATCH", "Unknown patch type: " + patch.type, { id: patch.id });
  }
}

/* Exposer globalement */
globalThis.loadAndApplyHotPatches = loadAndApplyHotPatches;
