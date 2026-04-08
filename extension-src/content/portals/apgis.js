export default {
  name: "APGIS",
  isMatch: () => window.location.hostname.includes("apgis.com"),
  actions: {
    formulaire: (data) => {
      const m = data.m || {};
      const o = data.o || {};
      const c = data.cached || {};
      const personnes = m.personnes || [];
      const p0 = personnes.length > 0 ? personnes[0] : {};

      const nom = m.nom || p0.nom || o.nomPatient || c.nom || "";
      const prenom = m.prenom || p0.prenom || o.prenomPatient || c.prenom || "";
      var foundNSS = m.numeroSecuriteSociale || "";
      if (!foundNSS) {
        for (var i = 0; i < personnes.length; i++) {
          var pNSS = (personnes[i].numeroSecuriteSociale || "").replace(/\D/g, "");
          if (pNSS.length >= 13) { foundNSS = personnes[i].numeroSecuriteSociale; break; }
        }
      }
      var foundDOB = m.dateNaissance || "";
      if (!foundDOB) {
        for (var i = 0; i < personnes.length; i++) {
          if (personnes[i].dateNaissance) { foundDOB = personnes[i].dateNaissance; break; }
        }
      }
      const nss = foundNSS || c.nss || "";
      const dob = foundDOB || o.dateNaissancePatient || c.dob || "";
      const effectiveNSS = getOuvrantDroitNSS(nss, dob, personnes);

      /* Panel Recherche Bénéficiaire */
      var inseeEl = findElement('[id$="rechercherinsee_I"]');
      if (inseeEl) {
        ultraFill(inseeEl, effectiveNSS.replace(/\D/g, "").slice(0, 13));
        ultraFill(findElement('[id$="recherchernom_I"]'), nom.toUpperCase());
        ultraFill(findElement('[id$="rechercherprenom_I"]'), capitalize(prenom));
        ultraFill(findElement('[id$="rechercherdatenaissance_I"]'), dob);
        /* Date prescription depuis l'ordonnance (clipboard OU cache) */
        var dateOrdo = o.dateOrdonnance || (c.ordonnance && c.ordonnance.dateOrdonnance) || "";
        if (dateOrdo) {
          ultraFill(findElement('[id$="rechercherdateprescription_I"]'), dateOrdo);
        }
        /* RPPS Prescripteur (clipboard OU cache) */
        var rpps = o.rpps || (c.ordonnance && c.ordonnance.rpps) || c.rpps || "";
        if (rpps) {
          ultraFill(findElement('[id$="rechercherRPPS_I"]'), rpps.replace(/\D/g, "").slice(0, 11));
        }
        var prescEl = findElement('[id$="rechercherdateprescription_I"]');
        var rppsEl = findElement('[id$="rechercherRPPS_I"]');
        console.info("[AudiBot APGIS] prescEl found:", !!prescEl, "| rppsEl found:", !!rppsEl);
        /* DevExpress combos — manipulation DOM directe (CSP bloque les scripts inline).
           Pattern : setter la valeur visible (_I) + la valeur cachée (_VI) + dispatch change */
        function dxComboFill(idSuffix, displayText, value) {
          var inp = findElement('[id$="' + idSuffix + '_I"]');
          if (!inp || (inp.value || "").trim()) return;
          var hiddenInput = findElement('[id$="' + idSuffix + '_VI"]');
          inp.value = displayText;
          inp.dispatchEvent(new Event('change', { bubbles: true }));
          if (hiddenInput) hiddenInput.value = value;
        }
        /* Nature d'assurance : "10" = Maladie - Taux SS 60% */
        dxComboFill("recherchernatureassurance", "Maladie - Taux SS 60%", "10");
        /* Type de renouvellement : délai car le callback NatureChange peut réinitialiser le DOM */
        setTimeout(function() {
          dxComboFill("recherchertyperenouvellement", "Renouv. avec adaptation", "2");
        }, 800);
        return true;
      }

      return false;
    },
    synchroniser: async () => false
  }
};
