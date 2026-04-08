/* ── Dynamic Parcours — loadDynamicParcours + injectDynamicParcours ────── */

export function loadDynamicParcours() {
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

export function injectDynamicParcours(handlers) {
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

              if (etape.action === "click") { el.click(); filled = true; return; }

              /* Résoudre la variable */
              var resolvedVal = etape.variable || "";
              for (var vk in vars) { resolvedVal = resolvedVal.split(vk).join(vars[vk]); }
              if (!resolvedVal) return;

              if (etape.action === "fill") {
                ultraFill(el, resolvedVal);
                filled = true;
              } else if (etape.action === "select") {
                el.value = resolvedVal;
                el.dispatchEvent(new Event("change", { bubbles: true }));
                filled = true;
              }
            });

            return filled;
          };
        })(etapes),
      },
    };
  });
}
