export default {
  name: "Generation",
  isMatch: () => window.location.hostname.includes("generation.fr"),
  actions: {
    formulaire: (data) => {
      var m = data.m || {};
      var o = data.o || {};
      var c = data.cached || {};
      var filled = 0;

      /* ── Page 1 : Recherche adhérent (TxtNoAdh) ── */
      var adhEl = findElement('#ctl00_Cph_TxtNoAdh');
      if (adhEl) {
        var noAdh = m.numeroAdherent || (c.regimes && c.regimes.rc1 && c.regimes.rc1.numeroAdherent) || c.numeroAdherent || "";
        var nss = m.numeroSecuriteSociale || c.nss || "";
        var digits = nss.replace(/\D/g, "").slice(0, 15);
        var formattedNSS = digits;
        if (digits.length >= 13) {
          formattedNSS = digits[0] + " " + digits.slice(1,3) + " " + digits.slice(3,5) + " " + digits.slice(5,7) + " " + digits.slice(7,10) + " " + digits.slice(10,13);
          if (digits.length >= 15) formattedNSS += " " + digits.slice(13,15);
        }
        if (noAdh) { ultraFill(adhEl, noAdh); filled++; }
        if (formattedNSS) { ultraFill(findElement('#ctl00_Cph_TxtNoSS'), formattedNSS); filled++; }
        return filled > 0;
      }

      /* ── Page 2 : Simulation Verres/Monture ── */
      var adeliEl = findElement('#ctl00_Cph_TCCalcul_TPVerresMont_DdlNoAdeliPrescripteur');
      if (adeliEl) {
        var ordonnance = o || (c.ordonnance) || {};
        var prescription = c.prescription || c.ordonnance || {};
        var od = o.lunettesOD || prescription.od || {};
        var og = o.lunettesOG || prescription.og || {};
        var eqData = c.equipements || [];
        var montureLigne = null, verreOD = null, verreOG = null;
        for (var ei = 0; ei < eqData.length; ei++) {
          var lignes = eqData[ei].lignes || [];
          for (var li = 0; li < lignes.length; li++) {
            var ligne = lignes[li];
            if (ligne.type === "monture" && !montureLigne) montureLigne = ligne;
            if (ligne.type === "verre") {
              if (ligne.oeil === "OD" && !verreOD) verreOD = ligne;
              else if (ligne.oeil === "OG" && !verreOG) verreOG = ligne;
              else if (!verreOD) verreOD = ligne;
              else if (!verreOG) verreOG = ligne;
            }
          }
        }

        /* N° ADELI Prescripteur */
        var rpps = o.rpps || ordonnance.rpps || prescription.rpps || c.rpps || "";
        if (rpps) { ultraFill(adeliEl, rpps.replace(/\D/g, "").slice(0, 9)); filled++; }

        /* Date ordonnance */
        var dateOrdo = o.dateOrdonnance || ordonnance.dateOrdonnance || "";
        var dateOrdoEl = findElement('#ctl00_Cph_TCCalcul_TPVerresMont_CDOrdoVerresMont_TextBoxDate');
        if (dateOrdo && dateOrdoEl && !dateOrdoEl.disabled) { ultraFill(dateOrdoEl, dateOrdo); filled++; }

        /* OD — Correction */
        if (od.sphere) { ultraFill(findElement('#ctl00_Cph_TCCalcul_TPVerresMont_TxtSphereD'), od.sphere); filled++; }
        if (od.cylindre) { ultraFill(findElement('#ctl00_Cph_TCCalcul_TPVerresMont_TxtCylD'), od.cylindre); filled++; }
        if (od.axe) { ultraFill(findElement('#ctl00_Cph_TCCalcul_TPVerresMont_TxtAxeD'), od.axe); filled++; }
        if (od.addition) { ultraFill(findElement('#ctl00_Cph_TCCalcul_TPVerresMont_TxtAddD'), od.addition); filled++; }

        /* OD — Verre (code LPP, montant) */
        if (verreOD) {
          if (verreOD.codeLPP) { ultraFill(findElement('#ctl00_Cph_TCCalcul_TPVerresMont_TxtCodeLPPD'), verreOD.codeLPP); filled++; }
          if (verreOD.prixBrut) { ultraFill(findElement('#ctl00_Cph_TCCalcul_TPVerresMont_TxtMtVerreD'), String(verreOD.prixBrut).replace(".", ",")); filled++; }
        }

        /* OG — Correction */
        if (og.sphere) { ultraFill(findElement('#ctl00_Cph_TCCalcul_TPVerresMont_TxtSphereG'), og.sphere); filled++; }
        if (og.cylindre) { ultraFill(findElement('#ctl00_Cph_TCCalcul_TPVerresMont_TxtCylG'), og.cylindre); filled++; }
        if (og.axe) { ultraFill(findElement('#ctl00_Cph_TCCalcul_TPVerresMont_TxtAxeG'), og.axe); filled++; }
        if (og.addition) { ultraFill(findElement('#ctl00_Cph_TCCalcul_TPVerresMont_TxtAddG'), og.addition); filled++; }

        /* OG — Verre (code LPP, montant) */
        if (verreOG) {
          if (verreOG.codeLPP) { ultraFill(findElement('#ctl00_Cph_TCCalcul_TPVerresMont_TxtCodeLPPG'), verreOG.codeLPP); filled++; }
          if (verreOG.prixBrut) { ultraFill(findElement('#ctl00_Cph_TCCalcul_TPVerresMont_TxtMtVerreG'), String(verreOG.prixBrut).replace(".", ",")); filled++; }
        }

        /* Monture */
        if (montureLigne) {
          if (montureLigne.codeLPP) { ultraFill(findElement('#ctl00_Cph_TCCalcul_TPVerresMont_TxtCodeLPPMont'), montureLigne.codeLPP); filled++; }
          if (montureLigne.prixBrut) { ultraFill(findElement('#ctl00_Cph_TCCalcul_TPVerresMont_TxtMtMont'), String(montureLigne.prixBrut).replace(".", ",")); filled++; }
        }

        console.info("[AudiBot Generation] Page simulation — filled:", filled, "| hasOD:", !!od, "| hasOG:", !!og, "| monture:", !!montureLigne, "| verreOD:", !!verreOD, "| verreOG:", !!verreOG);
        return filled > 0;
      }

      return false;
    },
    synchroniser: async () => false
  }
};
