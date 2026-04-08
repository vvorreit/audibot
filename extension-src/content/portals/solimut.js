export default {
  name: "Solimut",
  isMatch: () => window.location.hostname.includes("solimut.fr"),
  actions: {
    formulaire: (data) => {
      var matriculeEl = findElement('input[name="Phone"]');
      if (!matriculeEl) return false;
      var m = data.m || {};
      var o = data.o || {};
      var c = data.cached || {};
      var personnes = m.personnes || [];
      var p0 = personnes.length > 0 ? personnes[0] : {};
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
      var nss = foundNSS || c.nss || "";
      var dob = foundDOB || o.dateNaissancePatient || c.dob || "";
      var effectiveNSS = getOuvrantDroitNSS(nss, dob, personnes);

      /* Helper : trouver un input Radzen par le texte du label adjacent */
      function findRadzenInputByLabel(labelText) {
        var labels = document.querySelectorAll('#devis_ident label, #body-devis label');
        for (var i = 0; i < labels.length; i++) {
          if ((labels[i].textContent || "").trim().toLowerCase().indexOf(labelText.toLowerCase()) >= 0) {
            var container = labels[i].closest('.col-lg-2, .col-lg-3, .col-xl-2, .col-xl-3, div[class*="col-"]');
            if (container) {
              var inp = container.querySelector('.rz-calendar .rz-inputtext:not([disabled]):not([readonly])');
              if (inp) return inp;
              inp = container.querySelector('.rz-textbox:not([disabled])');
              if (inp) return inp;
              inp = container.querySelector('input.rz-inputtext:not([disabled]):not([readonly])');
              if (inp) return inp;
              inp = container.querySelector('.rz-spinner-input:not([disabled])');
              if (inp) return inp;
            }
          }
        }
        return null;
      }

      /* Matricule avec masque : X XX XX XX XXX XXX */
      var digits = effectiveNSS.replace(/\D/g, "");
      var formatted = digits;
      if (digits.length >= 13) {
        formatted = digits[0] + " " + digits.slice(1,3) + " " + digits.slice(3,5) + " " + digits.slice(5,7) + " " + digits.slice(7,10) + " " + digits.slice(10,13);
        if (digits.length >= 15) formatted += " " + digits.slice(13,15);
      }
      ultraFill(matriculeEl, formatted);

      /* Date de naissance — chercher par label */
      if (dob) {
        var dobInput = findRadzenInputByLabel("Date de naissance");
        if (!dobInput) {
          var allDateInputs = document.querySelectorAll('#devis_ident .rz-calendar .rz-inputtext:not([disabled]):not([readonly])');
          if (allDateInputs.length >= 1) dobInput = allDateInputs[0];
        }
        if (dobInput) ultraFill(dobInput, dob);
      }

      /* Rang gémellaire */
      var rangEl = findRadzenInputByLabel("Rang");
      /* ne pas remplir le rang sauf si on a une donnée explicite */

      /* N° prescripteur (RPPS/ADELI) */
      var rpps = o.rpps || (c.ordonnance && c.ordonnance.rpps) || (c.prescription && c.prescription.rpps) || c.rpps || "";
      if (rpps) {
        var rppsEl = findElement('input[name="Prescripteur"]');
        if (rppsEl) ultraFill(rppsEl, rpps.replace(/\D/g, "").slice(0, 9));
      }

      /* Date de prescription — chercher par label */
      var dateOrdo = o.dateOrdonnance || (c.ordonnance && c.ordonnance.dateOrdonnance) || (c.prescription && c.prescription.datePrescription) || "";
      if (dateOrdo) {
        var prescDateInput = findRadzenInputByLabel("Date de prescription");
        if (!prescDateInput) {
          var allDateInputs2 = document.querySelectorAll('#devis_ident .rz-calendar .rz-inputtext:not([disabled]):not([readonly])');
          if (allDateInputs2.length >= 2) prescDateInput = allDateInputs2[1];
        }
        if (prescDateInput) ultraFill(prescDateInput, dateOrdo);
      }

      console.info("[AudiBot Solimut] filled — hasNSS:", !!effectiveNSS, "| hasDob:", !!dob, "| hasRpps:", !!rpps, "| hasDateOrdo:", !!dateOrdo);
      return true;
    },
    synchroniser: async () => false
  }
};
