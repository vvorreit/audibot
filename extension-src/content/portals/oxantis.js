export default {
  name: "Oxantis",
  isMatch: () => window.location.hostname.includes("oxantis.net"),
  actions: {
    formulaire: (data) => {
      var m = data.m || {};
      var o = data.o || {};
      var c = data.cached || {};
      var personnes = m.personnes || [];
      var p0 = personnes.length > 0 ? personnes[0] : {};

      var nom = (m.nom || p0.nom || o.nomPatient || c.nom || "").toUpperCase();
      var prenom = m.prenom || p0.prenom || o.prenomPatient || c.prenom || "";

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
      var nss = (foundNSS || c.nss || "").replace(/\s/g, "");
      var dob = foundDOB || o.dateNaissancePatient || c.dob || "";
      var effectiveNSS = getOuvrantDroitNSS(nss, dob, personnes);
      var digits = effectiveNSS.replace(/\D/g, "").slice(0, 15);

      var filled = false;

      /* Page historique dossiers (form name="pec") : numSs, nomAssure, prenomAssure */
      var numSsEl = findElement('[name="numSs"]');
      if (numSsEl) {
        if (digits) { ultraFill(numSsEl, digits); filled = true; }
        if (nom) { ultraFill(findElement('[name="nomAssure"]'), nom); filled = true; }
        if (prenom) { ultraFill(findElement('[name="prenomAssure"]'), capitalize(prenom)); filled = true; }
        return filled;
      }

      /* Page bénéficiaire DPEC (form name="search") : numSecu, dateNaisJj/Mm/Aa, rangNais */
      var numSecuEl = findElement('[name="numSecu"]');
      if (numSecuEl) {
        if (digits) { ultraFill(numSecuEl, digits); filled = true; }

        /* Date de naissance éclatée en JJ / MM / AAAA */
        if (dob) {
          var parts = dob.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
          if (parts) {
            ultraFill(findElement('[name="dateNaisJj"]'), parts[1]);
            ultraFill(findElement('[name="dateNaisMm"]'), parts[2]);
            ultraFill(findElement('[name="dateNaisAa"]'), parts[3]);
            filled = true;
          }
        }

        /* Rang de naissance */
        var rang = c.rangNaissance || "";
        if (rang) {
          var rangEl = findElement('[name="rangNais"]');
          if (rangEl) { rangEl.value = rang; rangEl.dispatchEvent(new Event('change', { bubbles: true })); filled = true; }
        }

        return filled;
      }

      /* Page dossier / infos administratives (form name="dossier") : date prescription + type équipement */
      var jourPrescEl = findElement('[name="jourPrescription"]');
      if (jourPrescEl) {
        var dateOrdo = o.dateOrdonnance || (c.prescription && c.prescription.datePrescription) || "";
        if (dateOrdo) {
          var parts = dateOrdo.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
          if (parts) {
            ultraFill(jourPrescEl, parts[1]);
            ultraFill(findElement('[name="moisPrescription"]'), parts[2]);
            ultraFill(findElement('[name="anneePrescription"]'), parts[3]);
            filled = true;
          }
        }

        /* Type d'équipement : Lunettes ou Lentilles */
        var hasLentilles = (o.lentillesOD && o.lentillesOD.sphere) || (o.lentillesOG && o.lentillesOG.sphere);
        var radios = document.querySelectorAll('[name="Equipement"]');
        for (var ri = 0; ri < radios.length; ri++) {
          if (hasLentilles && radios[ri].value === "Lentilles") { radios[ri].click(); filled = true; }
          if (!hasLentilles && radios[ri].value === "Lunettes") { radios[ri].click(); filled = true; }
        }
        /* Mettre à jour le hidden typeEquipement */
        var typeEqEl = findElement('#typeEquipement');
        if (typeEqEl) typeEqEl.value = hasLentilles ? "lentilles" : "Lunettes";

        return filled;
      }

      /* Page DPEC correction visuelle (form name="dpecOpt") */
      var dpecForm = document.querySelector('form[name="dpecOpt"]');
      if (dpecForm) {
        /* Prescripteur */
        var prescFullName = (c.prescription && c.prescription.prescripteur) || "";
        if (prescFullName) {
          var prescParts = prescFullName.split(/\s+/);
          var prescNom = prescParts.length > 1 ? prescParts.slice(1).join(" ") : prescParts[0] || "";
          var prescPrenom = prescParts.length > 1 ? prescParts[0] : "";
          ultraFill(findElement('[name="nomPrescripteur"]'), prescNom.toUpperCase());
          ultraFill(findElement('[name="prenomPrescripteur"]'), capitalize(prescPrenom));
          filled = true;
        }

        /* RPPS / ADELI (champ finessPrescripteur, maxlength 9) */
        var rpps = o.rpps || (c.prescription && c.prescription.rpps) || "";
        if (rpps) {
          ultraFill(findElement('[name="finessPrescripteur"]'), rpps.replace(/\D/g, "").slice(0, 9));
          filled = true;
        }

        /* Type de prescription : première délivrance par défaut */
        var firstRadio = findElement('[name="prescriptionSelection"][value="first"]');
        if (firstRadio && !firstRadio.checked) {
          firstRadio.click();
          filled = true;
        }

        /* Tiers payant RO : cocher OUI par défaut */
        var tpOuiRadio = findElement('[name="optTPRegimeObligatoire"][value="OUI"]');
        if (tpOuiRadio && !tpOuiRadio.checked) {
          tpOuiRadio.click();
          filled = true;
        }

        /* Contact : téléphone, email */
        var phoneVal = normalizePhone(c.phone || "");
        if (phoneVal) { ultraFill(findElement('[name="devisTelephone"]'), phoneVal); filled = true; }
        var emailVal = c.email || "";
        if (emailVal) {
          /* Activer la section email (radio mailpersonnel = OUI) si elle est cachée */
          var mailOuiRadio = findElement('#mailpersonnel');
          if (mailOuiRadio && !mailOuiRadio.checked) {
            mailOuiRadio.click();
            /* Appeler la fonction Oxantis pour rendre visible le div email */
            if (typeof affichermailpersonnel === 'function') affichermailpersonnel();
          }
          ultraFill(findElement('[name="devisEmail"]'), emailVal);
          ultraFill(findElement('[name="devisEmailConfirmation"]'), emailVal);
          filled = true;
        }

        /* Correction OD / OG */
        var od = (o.lunettesOD) || (c.prescription && c.prescription.od) || {};
        var og = (o.lunettesOG) || (c.prescription && c.prescription.og) || {};

        /* Déterminer le type de vision : si addition > 0 → progressifs (4), sinon loin (1) */
        var addOD = parseFloat(od.addition) || 0;
        var addOG = parseFloat(og.addition) || 0;
        var visionVal = (addOD > 0 || addOG > 0) ? "4" : "1";

        var visionODEl = findElement('[name="visionTypeOD"]');
        if (visionODEl) {
          visionODEl.value = visionVal;
          visionODEl.dispatchEvent(new Event('change', { bubbles: true }));
          filled = true;
        }
        var visionOGEl = findElement('[name="visionTypeOG"]');
        if (visionOGEl) {
          visionOGEl.value = visionVal;
          visionOGEl.dispatchEvent(new Event('change', { bubbles: true }));
          filled = true;
        }

        /* Activer les champs de correction (disabled par défaut) puis remplir */
        var corrFields = [
          ['visions[0].lodSphere', od.sphere],
          ['visions[0].lodCylindre', od.cylindre],
          ['visions[0].axeOd', od.axe],
          ['visions[0].lodAddition', od.addition],
          ['visions[0].logSphere', og.sphere],
          ['visions[0].logCylindre', og.cylindre],
          ['visions[0].axeOg', og.axe],
          ['visions[0].logAddition', og.addition]
        ];
        for (var ci = 0; ci < corrFields.length; ci++) {
          var fieldName = corrFields[ci][0];
          var fieldVal = corrFields[ci][1];
          if (!fieldVal) continue;
          var el = document.querySelector('[name="' + fieldName + '"]');
          if (el) {
            if (el.disabled) el.disabled = false;
            ultraFill(el, fieldVal);
            filled = true;
          }
        }

        return filled;
      }

      return false;
    },
    synchroniser: async () => false
  }
};
