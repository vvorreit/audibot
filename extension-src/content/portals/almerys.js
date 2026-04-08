var PORTAL_KEY = "mutuelle-almerys.com";

export default {
  name: "Almerys",
  isMatch: () => window.location.hostname.includes("almerys.com") || window.location.hostname.includes("be-almerys.com"),
  actions: {
    formulaire: (data) => {
      var m = data.m || {};
      var o = data.o || {};
      var c = data.cached || {};
      var personnes = m.personnes || [];
      var p0 = personnes.length > 0 ? personnes[0] : {};
      var rawNSS = m.numeroSecuriteSociale || p0.numeroSecuriteSociale || c.nss || "";
      var dob = m.dateNaissance || p0.dateNaissance || o.dateNaissancePatient || c.dob || "";
      var nss = getOuvrantDroitNSS(rawNSS, dob, personnes);
      var nom = m.nom || p0.nom || o.nomPatient || c.nom || "";
      var prenom = m.prenom || p0.prenom || o.prenomPatient || c.prenom || "";
      var filled = false;

      /* Almerys a une CSP stricte qui bloque les scripts inline (pageExec).
         ultraFill dispatch des events natifs (focus/input/change/blur) depuis le
         content script. Le crash $.grep d'Almerys est dans $(document).ready()
         au chargement de page — PAS lie a nos events. Les handlers onblur des
         inputs dates (verifDateDemande2/3) sont declenches correctement par le
         blur natif dispatche par ultraFill. */
      var fillDate = function(el, val) {
        if (!el || el.disabled || el.readOnly) return;
        var d = String(val).replace(/\D/g, "");
        if (d.length < 8) return;
        var formatted = d.slice(0,2) + '/' + d.slice(2,4) + '/' + d.slice(4,8);
        ultraFill(el, formatted);
      };

      console.info("[AudiBot Almerys] formulaire — hasNSS:", !!nss, "hasDob:", !!dob, "hasNom:", !!nom);

      /* Page recherche beneficiaire */
      var nomBenef = findElementTracked(PORTAL_KEY, "nom_beneficiaire", '#nom_beneficiaire');
      if (nomBenef) {
        console.info("[AudiBot Almerys] Page recherche beneficiaire detectee");
        ultraFill(nomBenef, nom.toUpperCase());
        ultraFill(findElementTracked(PORTAL_KEY, "nss_beneficiaire", '#nss_beneficiaire'), nss);
        filled = true;
      }

      /* Popup iframe recherche beneficiaire (champs crit_) */
      var critNNI = findElementTracked(PORTAL_KEY, "crit_numInsee", 'input[name="crit_numInsee"]');
      if (critNNI) {
        console.info("[AudiBot Almerys] Popup recherche beneficiaire detectee");
        var effectiveNSS = getOuvrantDroitNSS(nss, dob, personnes);
        ultraFill(critNNI, effectiveNSS.replace(/\D/g, "").slice(0, 13));
        ultraFill(findElementTracked(PORTAL_KEY, "crit_nomBenef", 'input[name="crit_nomBenef"]'), nom.toUpperCase());
        ultraFill(findElementTracked(PORTAL_KEY, "crit_prenomBenef", 'input[name="crit_prenomBenef"]'), capitalize(prenom));
        if (dob) ultraFill(findElementTracked(PORTAL_KEY, "crit_dateNaissanceEdit", 'input[name="crit_dateNaissanceEdit"]'), dob);
        filled = true;
      }

      /* Page PEC Optique — NNI beneficiaire */
      var nniEl = findElementTracked(PORTAL_KEY, "numInsee", 'input[name="numInsee"]');
      console.info("[AudiBot Almerys] numInsee trouve:", !!nniEl, nniEl ? "readOnly=" + nniEl.readOnly : "");
      if (nniEl && !nniEl.readOnly) {
        var effectiveNSS = getOuvrantDroitNSS(nss, dob, personnes);
        console.info("[AudiBot Almerys] Fill NNI: [REDACTED]");
        ultraFill(nniEl, effectiveNSS.replace(/\D/g, "").slice(0, 13));
        filled = true;
      }

      /* Page PEC Optique — prescription */
      var dateOrdoEl = findElementTracked(PORTAL_KEY, "dateOrdonnanceEdit", 'input[name="dateOrdonnanceEdit"]');
      console.info("[AudiBot Almerys] dateOrdonnanceEdit trouve:", !!dateOrdoEl, dateOrdoEl ? "disabled=" + dateOrdoEl.disabled : "");
      if (dateOrdoEl) {
        /* Date d'ordonnance (seulement si le champ est vide et pas disabled) */
        if (!dateOrdoEl.disabled && !dateOrdoEl.value) {
          var dateOrdo = o.dateOrdonnance || (c.prescription && c.prescription.datePrescription) || "";
          console.info("[AudiBot Almerys] Fill date ordo: [REDACTED]");
          if (dateOrdo) fillDate(dateOrdoEl, dateOrdo);
        }

        /* Date de demande = aujourd'hui */
        var dateDemandeEl = findElementTracked(PORTAL_KEY, "dateDemandeEdit", 'input[name="dateDemandeEdit"]');
        console.info("[AudiBot Almerys] dateDemandeEdit trouve:", !!dateDemandeEl, dateDemandeEl ? "disabled=" + dateDemandeEl.disabled : "");
        if (dateDemandeEl && !dateDemandeEl.disabled && !dateDemandeEl.value) {
          var today = new Date();
          var dd = String(today.getDate()).padStart(2, '0');
          var mm = String(today.getMonth() + 1).padStart(2, '0');
          var yyyy = today.getFullYear();
          console.info("[AudiBot Almerys] Fill date demande:", dd + mm + yyyy);
          fillDate(dateDemandeEl, dd + mm + yyyy);
        }

        filled = true;
      }

      /* Page PEC Optique — cocher equipements selon donnees LBO */
      var cbMonture = findElementTracked(PORTAL_KEY, "saisieMonture", 'input[name="saisieMonture"]');
      if (cbMonture) {
        var eqData = c.equipements || [];
        var hasMonture = false;
        var hasVerre = false;
        var hasSupplement = false;
        var hasLentille = false;
        if (eqData.length > 0) {
          for (var ei = 0; ei < eqData.length; ei++) {
            var lignes = eqData[ei].lignes || [];
            for (var li = 0; li < lignes.length; li++) {
              if (lignes[li].type === 'monture') hasMonture = true;
              if (lignes[li].type === 'verre') hasVerre = true;
              if (lignes[li].type === 'supplement') hasSupplement = true;
            }
            if (eqData[ei].type === 'lentilles') hasLentille = true;
          }
        } else {
          /* Pas de donnees equipements -> cocher monture + verres par defaut */
          hasMonture = true;
          hasVerre = true;
        }
        var cbVerre = findElementTracked(PORTAL_KEY, "saisieVerre", 'input[name="saisieVerre"]');
        var cbSupp = findElementTracked(PORTAL_KEY, "saisieSupplement", 'input[name="saisieSupplement"]');
        var cbLentille = findElementTracked(PORTAL_KEY, "saisieLentille", 'input[name="saisieLentille"]');
        if (cbMonture && hasMonture && !cbMonture.checked && !cbMonture.disabled) cbMonture.click();
        if (cbVerre && hasVerre && !cbVerre.checked && !cbVerre.disabled) cbVerre.click();
        if (cbSupp && hasSupplement && !cbSupp.checked && !cbSupp.disabled) cbSupp.click();
        if (cbLentille && hasLentille && !cbLentille.checked && !cbLentille.disabled) cbLentille.click();
        filled = true;
      }

      /* ── Page 2 : Equipements detailles (GererPecOptique.do) ──
         IMPORTANT : NE PAS utiliser ultraFill ici. Almerys a des handlers
         onchange sur certains champs (numAMPrescripteur -> recherchePrescripteur()
         -> dispatcher() -> form.submit()). ultraFill dispatch change/blur
         ce qui declenche le submit et vide tout.
         On ecrit la valeur silencieusement sans evenements. */
      var PREFIX = "gererPecOptiqueElement[0].";
      var alFill = function(name, val) {
        if (!val) return;
        var el = document.querySelector('[name="' + PREFIX + name + '"]');
        if (el && !el.disabled && !el.readOnly && !(el.value || "").trim()) { el.value = String(val); filled = true; }
      };

      var prescEl = findElementTracked(PORTAL_KEY, "numAMPrescripteur", '[name="' + PREFIX + 'numAMPrescripteur"]');
      if (prescEl) {
        console.info("[AudiBot Almerys] Page 2 equipements detectee");

        /* Prescripteur RPPS/ADELI */
        var rpps = (o && o.rpps) || (c.prescription && c.prescription.rpps) || "";
        if (rpps) alFill("numAMPrescripteur", rpps.replace(/\D/g, "").slice(0, 9));

        /* Monture */
        var eqData = c.equipements || [];
        var montureLigne = null, verreOD = null, verreOG = null;
        for (var ei2 = 0; ei2 < eqData.length; ei2++) {
          var lignes2 = eqData[ei2].lignes || [];
          for (var li2 = 0; li2 < lignes2.length; li2++) {
            var ligne = lignes2[li2];
            if (ligne.type === "monture" && !montureLigne) montureLigne = ligne;
            if (ligne.type === "verre" && ligne.oeil === "OD" && !verreOD) verreOD = ligne;
            if (ligne.type === "verre" && ligne.oeil === "OG" && !verreOG) verreOG = ligne;
          }
        }

        if (montureLigne) {
          if (montureLigne.codeLPP) alFill("codeLPPMonture", montureLigne.codeLPP);
          if (montureLigne.prixBrut) alFill("prixBrutMonture", String(montureLigne.prixBrut).replace(".", ","));
          if (montureLigne.remise) alFill("prixRemiseMonture", String(montureLigne.remise).replace(".", ","));
          if (montureLigne.designation) {
            var parts = montureLigne.designation.split("/");
            alFill("marqueMonture", (parts[0] || "").trim());
            if (parts[1]) alFill("modeleMonture", parts[1].trim());
            alFill("referenceMonture", montureLigne.designation);
          }
        }

        /* Verre OD */
        if (verreOD && verreOD.codeLPP) alFill("codeLPPVerreDroit", verreOD.codeLPP);
        /* Verre OG */
        if (verreOG && verreOG.codeLPP) alFill("codeLPPVerreGauche", verreOG.codeLPP);

        /* Correction — depuis ordonnance ou prescription cached */
        var od = (o && o.lunettesOD) || (c.prescription && c.prescription.od) || {};
        var og = (o && o.lunettesOG) || (c.prescription && c.prescription.og) || {};
        if (od.sphere) alFill("sphereVerreDroit", od.sphere);
        if (od.cylindre) alFill("cylindreVerreDroit", od.cylindre);
        if (od.axe) alFill("axeVerreDroit", od.axe);
        if (od.addition) alFill("additionVerreDroit", od.addition);
        if (og.sphere) alFill("sphereVerreGauche", og.sphere);
        if (og.cylindre) alFill("cylindreVerreGauche", og.cylindre);
        if (og.axe) alFill("axeVerreGauche", og.axe);
        if (og.addition) alFill("additionVerreGauche", og.addition);
      }

      return filled;
    },
    synchroniser: async () => false
  }
};
