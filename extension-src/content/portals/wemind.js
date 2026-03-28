var PORTAL_KEY = "pro.wemind.io";

export default {
  name: "Wemind",
  isMatch: () => window.location.hostname.includes("wemind.io"),
  actions: {
    formulaire: (data) => {
      const m = data.m || {};
      const o = data.o || {};
      const c = data.cached || {};
      /* Fallback : si les champs top-level sont vides, chercher dans personnes */
      const personnes = m.personnes || [];
      const p0 = personnes.length > 0 ? personnes[0] : {};
      const nom = m.nom || p0.nom || o.nomPatient || c.nom || "";
      const prenom = m.prenom || p0.prenom || o.prenomPatient || c.prenom || "";
      /* Chercher le premier NSS valide parmi toutes les personnes */
      var foundNSS = m.numeroSecuriteSociale || "";
      var foundDOB = m.dateNaissance || "";
      if (!foundNSS) {
        for (var pi = 0; pi < personnes.length; pi++) {
          var pNSS = (personnes[pi].numeroSecuriteSociale || "").replace(/\D/g, "");
          if (pNSS.length >= 13) { foundNSS = personnes[pi].numeroSecuriteSociale; break; }
        }
      }
      if (!foundDOB) {
        for (var pi = 0; pi < personnes.length; pi++) {
          if (personnes[pi].dateNaissance) { foundDOB = personnes[pi].dateNaissance; break; }
        }
      }
      const nss = foundNSS || c.nss || "";
      const dob = foundDOB || o.dateNaissancePatient || c.dob || "";

      /* Pour un mineur, utiliser le NSS de l'ouvrant droit (mere) */
      const effectiveNSS = getOuvrantDroitNSS(nss, dob, m.personnes);

      /* Step 1 — Beneficiaire */
      const stepBenef = document.querySelector('[data-cy="step-beneficiary"]');
      if (stepBenef) {
        ultraFill(findElementTracked(PORTAL_KEY, "input-lastName", '[data-cy="input-lastName"]'), nom.toUpperCase());
        ultraFill(findElementTracked(PORTAL_KEY, "input-firstName", '[data-cy="input-firstName"]'), capitalize(prenom));
        /* NSS formate avec espaces (maxlength=21 -> X XX XX XX XXX XXX XX) */
        const digits = effectiveNSS.replace(/\D/g, "");
        let formattedNSS = digits;
        if (digits.length >= 13) {
          formattedNSS = digits[0] + " " + digits.slice(1,3) + " " + digits.slice(3,5) + " " + digits.slice(5,7) + " " + digits.slice(7,10) + " " + digits.slice(10,13);
          if (digits.length >= 15) formattedNSS += " " + digits.slice(13,15);
        }
        ultraFill(findElementTracked(PORTAL_KEY, "input-ssn", '[data-cy="input-ssn"]'), formattedNSS);
        return true;
      }

      /* Step 2 — Description */
      const stepDesc = document.querySelector('[data-cy="step-description"]');
      if (stepDesc) {
        selectRadixOption("category", "optique");
        /* Determine le type de soin */
        let typeVal = "lunettes_adulte";
        const hasLentilles = (o.lentillesOD && o.lentillesOD.sphere) || (o.lentillesOG && o.lentillesOG.sphere);
        if (hasLentilles) typeVal = "lentilles_adulte";
        /* Verification enfant (<18 ans) */
        if (dob && isUnder18(dob)) {
          typeVal = hasLentilles ? "lentilles_enfant" : "lunettes_enfant";
        }
        setTimeout(() => selectRadixOption("type", typeVal), 600);
        return true;
      }

      /* Step 3 — Codes LPP (pas d'auto-remplissage, les codes sont specifiques au produit) */
      const stepLpp = document.querySelector('[data-cy="step-lpp-codes"]');
      if (stepLpp) {
        return true;
      }

      return false;
    },
    synchroniser: async () => false
  }
};
