"use strict";
(() => {
  // extension-src/content/portals/generation.js
  var generation_default = {
    name: "Generation",
    isMatch: () => window.location.hostname.includes("generation.fr"),
    actions: {
      formulaire: (data) => {
        var m = data.m || {};
        var o = data.o || {};
        var c = data.cached || {};
        var filled = 0;
        var adhEl = findElement("#ctl00_Cph_TxtNoAdh");
        if (adhEl) {
          var noAdh = m.numeroAdherent || c.regimes && c.regimes.rc1 && c.regimes.rc1.numeroAdherent || c.numeroAdherent || "";
          var nss = m.numeroSecuriteSociale || c.nss || "";
          var digits = nss.replace(/\D/g, "").slice(0, 15);
          var formattedNSS = digits;
          if (digits.length >= 13) {
            formattedNSS = digits[0] + " " + digits.slice(1, 3) + " " + digits.slice(3, 5) + " " + digits.slice(5, 7) + " " + digits.slice(7, 10) + " " + digits.slice(10, 13);
            if (digits.length >= 15) formattedNSS += " " + digits.slice(13, 15);
          }
          if (noAdh) {
            ultraFill(adhEl, noAdh);
            filled++;
          }
          if (formattedNSS) {
            ultraFill(findElement("#ctl00_Cph_TxtNoSS"), formattedNSS);
            filled++;
          }
          return filled > 0;
        }
        var adeliEl = findElement("#ctl00_Cph_TCCalcul_TPVerresMont_DdlNoAdeliPrescripteur");
        if (adeliEl) {
          var ordonnance = o || c.ordonnance || {};
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
          var rpps = o.rpps || ordonnance.rpps || prescription.rpps || c.rpps || "";
          if (rpps) {
            ultraFill(adeliEl, rpps.replace(/\D/g, "").slice(0, 9));
            filled++;
          }
          var dateOrdo = o.dateOrdonnance || ordonnance.dateOrdonnance || "";
          var dateOrdoEl = findElement("#ctl00_Cph_TCCalcul_TPVerresMont_CDOrdoVerresMont_TextBoxDate");
          if (dateOrdo && dateOrdoEl && !dateOrdoEl.disabled) {
            ultraFill(dateOrdoEl, dateOrdo);
            filled++;
          }
          if (od.sphere) {
            ultraFill(findElement("#ctl00_Cph_TCCalcul_TPVerresMont_TxtSphereD"), od.sphere);
            filled++;
          }
          if (od.cylindre) {
            ultraFill(findElement("#ctl00_Cph_TCCalcul_TPVerresMont_TxtCylD"), od.cylindre);
            filled++;
          }
          if (od.axe) {
            ultraFill(findElement("#ctl00_Cph_TCCalcul_TPVerresMont_TxtAxeD"), od.axe);
            filled++;
          }
          if (od.addition) {
            ultraFill(findElement("#ctl00_Cph_TCCalcul_TPVerresMont_TxtAddD"), od.addition);
            filled++;
          }
          if (verreOD) {
            if (verreOD.codeLPP) {
              ultraFill(findElement("#ctl00_Cph_TCCalcul_TPVerresMont_TxtCodeLPPD"), verreOD.codeLPP);
              filled++;
            }
            if (verreOD.prixBrut) {
              ultraFill(findElement("#ctl00_Cph_TCCalcul_TPVerresMont_TxtMtVerreD"), String(verreOD.prixBrut).replace(".", ","));
              filled++;
            }
          }
          if (og.sphere) {
            ultraFill(findElement("#ctl00_Cph_TCCalcul_TPVerresMont_TxtSphereG"), og.sphere);
            filled++;
          }
          if (og.cylindre) {
            ultraFill(findElement("#ctl00_Cph_TCCalcul_TPVerresMont_TxtCylG"), og.cylindre);
            filled++;
          }
          if (og.axe) {
            ultraFill(findElement("#ctl00_Cph_TCCalcul_TPVerresMont_TxtAxeG"), og.axe);
            filled++;
          }
          if (og.addition) {
            ultraFill(findElement("#ctl00_Cph_TCCalcul_TPVerresMont_TxtAddG"), og.addition);
            filled++;
          }
          if (verreOG) {
            if (verreOG.codeLPP) {
              ultraFill(findElement("#ctl00_Cph_TCCalcul_TPVerresMont_TxtCodeLPPG"), verreOG.codeLPP);
              filled++;
            }
            if (verreOG.prixBrut) {
              ultraFill(findElement("#ctl00_Cph_TCCalcul_TPVerresMont_TxtMtVerreG"), String(verreOG.prixBrut).replace(".", ","));
              filled++;
            }
          }
          if (montureLigne) {
            if (montureLigne.codeLPP) {
              ultraFill(findElement("#ctl00_Cph_TCCalcul_TPVerresMont_TxtCodeLPPMont"), montureLigne.codeLPP);
              filled++;
            }
            if (montureLigne.prixBrut) {
              ultraFill(findElement("#ctl00_Cph_TCCalcul_TPVerresMont_TxtMtMont"), String(montureLigne.prixBrut).replace(".", ","));
              filled++;
            }
          }
          console.info("[OptiBot Generation] Page simulation \u2014 filled:", filled, "| hasOD:", !!od, "| hasOG:", !!og, "| monture:", !!montureLigne, "| verreOD:", !!verreOD, "| verreOG:", !!verreOG);
          return filled > 0;
        }
        return false;
      },
      synchroniser: async () => false
    }
  };

  // extension-src/content/portals/livebyoptimum.js
  var LBO_SELECTORS = {
    nom: '[name="infos_client[nom]"]',
    prenom: '[name="infos_client[prenom]"]',
    dob: '[name="infos_client[date_naissance]"]',
    nss: '[name="infos_client[num_ss]"]',
    cle: '[name="infos_client[cle_ss]"]',
    phone: "#telephone_form_client_5",
    email: '[name="infos_client[email]"]',
    address: '[name="infos_client[adresse][ligne_1]"]',
    zip: '[name="infos_client[adresse][code_postal]"]',
    city: '[name="infos_client[adresse][ville]"]',
    nomAssure: '[name="infos_client[nom_assure]"]',
    rangNaissance: '[name="infos_client[rang_naissance]"]',
    isAstigmate: '[name="infos_client[is_astigmate]"]'
  };
  var livebyoptimum_default = {
    name: "LivebyOptimum",
    isMatch: () => window.location.hostname.includes("livebyoptimum.com"),
    selectors: LBO_SELECTORS,
    actions: {
      formulaire: (data) => {
        const searchInput = findElement("#input_recherche_client");
        const formCheck = findElement(LBO_SELECTORS.nom);
        if (searchInput && !formCheck) {
          const m2 = data.m || {};
          const o2 = data.o || {};
          const c2 = data.cached || {};
          const p02 = m2.personnes && m2.personnes.length > 0 ? m2.personnes[0] : {};
          const nom = (m2.nom || p02.nom || o2.nomPatient || c2.nom || "").toUpperCase();
          if (nom) {
            ultraFill(searchInput, nom);
            return true;
          }
          return false;
        }
        if (!formCheck) return false;
        const m = data.m || {};
        const o = data.o || {};
        const c = data.cached || {};
        const p0 = m.personnes && m.personnes.length > 0 ? m.personnes[0] : {};
        const rawNSS = m.numeroSecuriteSociale || p0.numeroSecuriteSociale || c.nss || "";
        const dob = m.dateNaissance || p0.dateNaissance || o.dateNaissancePatient || c.dob || "";
        const nss = getOuvrantDroitNSS(rawNSS, dob, m.personnes);
        const mapping = {
          "infos_client[civilite_type_id]": nss.startsWith("1") ? "1" : nss.startsWith("2") ? "2" : "0",
          "infos_client[nom]": (m.nom || p0.nom || o.nomPatient || c.nom || "").toUpperCase(),
          "infos_client[prenom]": capitalize(m.prenom || p0.prenom || o.prenomPatient || c.prenom || ""),
          "infos_client[date_naissance]": dob,
          "infos_client[num_ss]": nss.slice(0, 13),
          "infos_client[cle_ss]": nss.slice(13, 15),
          "infos_client[email]": c.email || "",
          "infos_client[adresse][ligne_1]": c.address || "",
          "infos_client[adresse][code_postal]": c.zipCode || "",
          "infos_client[adresse][ville]": c.city || "",
          "infos_client[nom_assure]": c.nomAssure || "",
          "infos_client[rang_naissance]": c.rangNaissance || ""
        };
        for (const [name, val] of Object.entries(mapping)) {
          if (val) ultraFill(findElement(`[name="${name}"]`), val);
        }
        var phoneVal = normalizePhone(c.phone || "");
        if (phoneVal) {
          var phoneEl = findElement("#telephone_form_client_5");
          if (phoneEl) ultraFill(phoneEl, phoneVal);
        }
        const sph = o.lunettesOD?.sphere || o.lentillesOD?.sphere;
        const cyl = o.lunettesOD?.cylindre || o.lentillesOD?.cylindre;
        if (sph) {
          const isMyope = parseFloat(sph.replace(",", ".")) < 0;
          const mEl = findElement('[name="infos_client[is_myope]"]');
          if (mEl && mEl.checked !== isMyope) mEl.click();
          const hEl = findElement('[name="infos_client[is_hypermetrope]"]');
          if (hEl && hEl.checked !== !isMyope) hEl.click();
        }
        if (cyl) {
          const cylVal = parseFloat(cyl.replace(",", "."));
          if (cylVal !== 0) {
            const aEl = findElement('[name="infos_client[is_astigmate]"]');
            if (aEl && !aEl.checked) aEl.click();
          }
        }
        return true;
      },
      synchroniser: async () => {
        const s = LBO_SELECTORS;
        const client = {
          nom: findElement(s.nom)?.value,
          prenom: findElement(s.prenom)?.value,
          dob: findElement(s.dob)?.value,
          nss: (findElement(s.nss)?.value || "") + (findElement(s.cle)?.value || ""),
          phone: findElement(s.phone)?.value,
          email: findElement(s.email)?.value,
          address: findElement(s.address)?.value,
          zipCode: findElement(s.zip)?.value,
          city: findElement(s.city)?.value,
          nomAssure: findElement(s.nomAssure)?.value,
          rangNaissance: findElement(s.rangNaissance)?.value,
          updatedAt: Date.now(),
          expiresAt: Date.now() + 60 * 60 * 1e3
        };
        var prescription = {};
        var prescTab = document.querySelector("#nav-tab-prescriptions");
        if (prescTab) {
          var prescLis = prescTab.querySelectorAll("li");
          for (var pi = 0; pi < prescLis.length; pi++) {
            var li = prescLis[pi];
            var content = li.querySelector(".line_content");
            if (!content) continue;
            var text = content.textContent.trim();
            if (li.querySelector(".prescripteur")) {
              var parts = text.split(" - ");
              prescription.prescripteur = parts[0] ? parts[0].trim() : "";
              prescription.rpps = parts[1] ? parts[1].trim() : "";
            }
            if (li.querySelector(".renouvellement") && !li.classList.contains("hidden")) {
              var dateMatch = text.match(/(\d{2}\/\d{2}\/\d{4})/);
              prescription.datePrescription = dateMatch ? dateMatch[1] : "";
              prescription.typeVision = text.replace(dateMatch ? dateMatch[0] : "", "").replace(/du\s*$/, "").replace(/\s+/g, " ").trim();
            }
            if (li.querySelector(".fa-eye") && !li.classList.contains("hidden")) {
              var corrMatch = text.match(/^(OD|OG)\s*:\s*([+-]?\d+[\.,]\d+)\s*\(([+-]?\d+[\.,]\d+)\)\s*(\d+)°\s*ADD:\s*([+-]?\d+[\.,]\d+)/);
              if (corrMatch) {
                var oeil = corrMatch[1].toLowerCase();
                prescription[oeil] = {
                  sphere: corrMatch[2].replace(",", "."),
                  cylindre: corrMatch[3].replace(",", "."),
                  axe: corrMatch[4],
                  addition: corrMatch[5].replace(",", ".")
                };
              }
            }
            if (li.querySelector(".icon-contacts") && !li.classList.contains("hidden")) {
              var lentMatch = text.match(/^(OD|OG)\s*:\s*([+-]?\d+[\.,]\d+)\s*\(([+-]?\d+[\.,]\d+)\)\s*(\d+)°\s*ADD:\s*([+-]?\d+[\.,]\d+)/);
              if (lentMatch) {
                var oeilL = "lentilles" + lentMatch[1];
                prescription[oeilL] = {
                  sphere: lentMatch[2].replace(",", "."),
                  cylindre: lentMatch[3].replace(",", "."),
                  axe: lentMatch[4],
                  addition: lentMatch[5].replace(",", ".")
                };
              }
            }
          }
        }
        client.prescription = prescription;
        var regimes = {};
        var roNomEl = findElement("#regime_obligatoire_nom");
        if (roNomEl && roNomEl.value) {
          regimes.ro = {
            nom: roNomEl.value,
            codeRegime: (findElement("#ro_code_regime") || {}).value || "",
            codeCentre: (findElement("#code_centre") || {}).value || "",
            tauxPEC: (findElement("#taux_pec_ro") || {}).value || ""
          };
        }
        var rc1NomEl = findElement("#regime_complementaire_1");
        if (rc1NomEl && rc1NomEl.value) {
          regimes.rc1 = {
            nom: rc1NomEl.value,
            numeroAdherent: (findElement("#no_adherent_rc_1") || {}).value || "",
            numeroContrat: (findElement("#no_contrat_rc_1") || {}).value || "",
            numeroTeletransmission: (findElement('input[name="infos_regime[numero_teletransmission_1]"]') || {}).value || "",
            critereSecondaire: (findElement("#critere_secondaire") || {}).value || "",
            codeConvention: (findElement("#code_convention") || {}).value || "",
            dateDebut: (findElement("#date_debut_rc_1") || {}).value || "",
            dateFin: (findElement("#date_fin_rc_1") || {}).value || ""
          };
        }
        var rc2NomEl = findElement("#regime_complementaire_2");
        if (rc2NomEl && rc2NomEl.value) {
          regimes.rc2 = {
            nom: rc2NomEl.value,
            numeroAdherent: (findElement("#no_adherent_rc_2") || {}).value || "",
            numeroContrat: (findElement("#no_contrat_rc_2") || {}).value || "",
            numeroTeletransmission: (findElement('input[name="infos_regime[numero_teletransmission_2]"]') || {}).value || ""
          };
        }
        if (regimes.ro || regimes.rc1 || regimes.rc2) {
          client.regimes = regimes;
        }
        var equipements = [];
        var offres = document.querySelectorAll(".offre.accordion");
        for (var oi = 0; oi < offres.length; oi++) {
          var offre = offres[oi];
          var offreId = offre.getAttribute("data-offre_id") || "";
          var eqType = offre.getAttribute("data-equipement_type_id") || "";
          var noEq = offre.getAttribute("data-no_equipement_offre_commerciale") || "";
          var corrLabel = offre.querySelector(".label-info");
          var correction = corrLabel ? corrLabel.textContent.trim() : "";
          var visionBtn = offre.querySelector(".dropdown-select-text");
          var vision = visionBtn ? visionBtn.textContent.trim() : "";
          var lignes = [];
          var rows = offre.querySelectorAll(".table-conseiller tbody tr[data-offre_detail_id]");
          for (var ri = 0; ri < rows.length; ri++) {
            var row = rows[ri];
            var typeId = row.getAttribute("data-offre_detail_type_id") || "";
            var oeil = row.getAttribute("data-oeil_offre_detail") || "";
            var classe = row.getAttribute("data-classe_offre_detail") || "";
            var desig = row.querySelector(".designation_article");
            var lppEl = row.querySelector(".detail_code_lpp");
            lignes.push({
              type: typeId === "3" ? "monture" : typeId === "1" ? "verre" : typeId === "2" ? "supplement" : typeId,
              oeil: oeil === "1" ? "OD" : oeil === "2" ? "OG" : "les deux",
              classe,
              designation: desig ? desig.textContent.trim().replace(/\s+/g, " ") : "",
              codeLPP: lppEl ? (lppEl.getAttribute("data-code_lpp") || "").trim() : "",
              prixBrut: parseFloat((row.querySelector(".prix_vente_applique")?.textContent || "0").replace(/[^\d,.-]/g, "").replace(",", ".")) || 0,
              remise: parseFloat((row.querySelector(".modif_montant_remise")?.textContent || "0").replace(/[^\d,.-]/g, "").replace(",", ".")) || 0,
              prixNet: parseFloat((row.querySelector(".modif_prix_vente_remise")?.textContent || "0").replace(/[^\d,.-]/g, "").replace(",", ".")) || 0,
              ro: parseFloat((row.querySelector(".montant_pec_ro")?.textContent || "0").replace(/[^\d,.-]/g, "").replace(",", ".")) || 0,
              rc1: parseFloat((row.querySelector('[class*="montant_pec_rc_1"]')?.textContent || "0").replace(/[^\d,.-]/g, "").replace(",", ".")) || 0,
              rac: parseFloat((row.querySelector(".total_ligne_rac")?.textContent || "0").replace(/[^\d,.-]/g, "").replace(",", ".")) || 0
            });
          }
          var foot = offre.querySelector(".table-conseiller tfoot");
          var totaux = {};
          if (foot) {
            totaux = {
              brut: parseFloat((foot.querySelector(".total_brut")?.textContent || "0").replace(/[^\d,.-]/g, "").replace(",", ".")) || 0,
              remise: parseFloat((foot.querySelector(".total_remise")?.textContent || "0").replace(/[^\d,.-]/g, "").replace(",", ".")) || 0,
              net: parseFloat((foot.querySelector(".total_net")?.textContent || "0").replace(/[^\d,.-]/g, "").replace(",", ".")) || 0,
              ro: parseFloat((foot.querySelector(".total_ro")?.textContent || "0").replace(/[^\d,.-]/g, "").replace(",", ".")) || 0,
              rc1: parseFloat((foot.querySelector('[class*="total_rc_1"]')?.textContent || "0").replace(/[^\d,.-]/g, "").replace(",", ".")) || 0,
              rac: parseFloat((foot.querySelector(".total_rac")?.textContent || "0").replace(/[^\d,.-]/g, "").replace(",", ".")) || 0
            };
          }
          equipements.push({
            offreId,
            numero: noEq,
            type: eqType === "1" ? "lunettes" : eqType === "2" ? "lentilles" : eqType,
            correction,
            vision,
            lignes,
            totaux
          });
        }
        var totalProp = parseFloat((document.querySelector(".total_net_proposition")?.textContent || "0").replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;
        var racProp = parseFloat((document.querySelector(".total_rac_proposition")?.textContent || "0").replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;
        client.equipements = equipements;
        client.totalProposition = totalProp;
        client.racProposition = racProp;
        if (!client.nom && !client.nss && equipements.length === 0) return false;
        return new Promise((resolve) => {
          chrome.storage.local.get(["optibot_cache"], (result) => {
            const existing = (result.optibot_cache || {}).current || {};
            chrome.storage.local.set({
              optibot_cache: { current: { ...existing, ...client } }
            }, () => resolve(true));
          });
        });
      }
    }
  };

  // extension-src/content/portals/wemind.js
  var PORTAL_KEY = "pro.wemind.io";
  var wemind_default = {
    name: "Wemind",
    isMatch: () => window.location.hostname.includes("wemind.io"),
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
        var foundDOB = m.dateNaissance || "";
        if (!foundNSS) {
          for (var pi = 0; pi < personnes.length; pi++) {
            var pNSS = (personnes[pi].numeroSecuriteSociale || "").replace(/\D/g, "");
            if (pNSS.length >= 13) {
              foundNSS = personnes[pi].numeroSecuriteSociale;
              break;
            }
          }
        }
        if (!foundDOB) {
          for (var pi = 0; pi < personnes.length; pi++) {
            if (personnes[pi].dateNaissance) {
              foundDOB = personnes[pi].dateNaissance;
              break;
            }
          }
        }
        const nss = foundNSS || c.nss || "";
        const dob = foundDOB || o.dateNaissancePatient || c.dob || "";
        const effectiveNSS = getOuvrantDroitNSS(nss, dob, m.personnes);
        const stepBenef = document.querySelector('[data-cy="step-beneficiary"]');
        if (stepBenef) {
          ultraFill(findElementTracked(PORTAL_KEY, "input-lastName", '[data-cy="input-lastName"]'), nom.toUpperCase());
          ultraFill(findElementTracked(PORTAL_KEY, "input-firstName", '[data-cy="input-firstName"]'), capitalize(prenom));
          const digits = effectiveNSS.replace(/\D/g, "");
          let formattedNSS = digits;
          if (digits.length >= 13) {
            formattedNSS = digits[0] + " " + digits.slice(1, 3) + " " + digits.slice(3, 5) + " " + digits.slice(5, 7) + " " + digits.slice(7, 10) + " " + digits.slice(10, 13);
            if (digits.length >= 15) formattedNSS += " " + digits.slice(13, 15);
          }
          ultraFill(findElementTracked(PORTAL_KEY, "input-ssn", '[data-cy="input-ssn"]'), formattedNSS);
          return true;
        }
        const stepDesc = document.querySelector('[data-cy="step-description"]');
        if (stepDesc) {
          selectRadixOption("category", "optique");
          let typeVal = "lunettes_adulte";
          const hasLentilles = o.lentillesOD && o.lentillesOD.sphere || o.lentillesOG && o.lentillesOG.sphere;
          if (hasLentilles) typeVal = "lentilles_adulte";
          if (dob && isUnder18(dob)) {
            typeVal = hasLentilles ? "lentilles_enfant" : "lunettes_enfant";
          }
          setTimeout(() => selectRadixOption("type", typeVal), 600);
          return true;
        }
        const stepLpp = document.querySelector('[data-cy="step-lpp-codes"]');
        if (stepLpp) {
          return true;
        }
        return false;
      },
      synchroniser: async () => false
    }
  };

  // extension-src/content/portals/apgis.js
  var apgis_default = {
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
            if (pNSS.length >= 13) {
              foundNSS = personnes[i].numeroSecuriteSociale;
              break;
            }
          }
        }
        var foundDOB = m.dateNaissance || "";
        if (!foundDOB) {
          for (var i = 0; i < personnes.length; i++) {
            if (personnes[i].dateNaissance) {
              foundDOB = personnes[i].dateNaissance;
              break;
            }
          }
        }
        const nss = foundNSS || c.nss || "";
        const dob = foundDOB || o.dateNaissancePatient || c.dob || "";
        const effectiveNSS = getOuvrantDroitNSS(nss, dob, personnes);
        var inseeEl = findElement('[id$="rechercherinsee_I"]');
        if (inseeEl) {
          let dxComboFill2 = function(idSuffix, displayText, value) {
            var inp = findElement('[id$="' + idSuffix + '_I"]');
            if (!inp || (inp.value || "").trim()) return;
            var hiddenInput = findElement('[id$="' + idSuffix + '_VI"]');
            inp.value = displayText;
            inp.dispatchEvent(new Event("change", { bubbles: true }));
            if (hiddenInput) hiddenInput.value = value;
          };
          var dxComboFill = dxComboFill2;
          ultraFill(inseeEl, effectiveNSS.replace(/\D/g, "").slice(0, 13));
          ultraFill(findElement('[id$="recherchernom_I"]'), nom.toUpperCase());
          ultraFill(findElement('[id$="rechercherprenom_I"]'), capitalize(prenom));
          ultraFill(findElement('[id$="rechercherdatenaissance_I"]'), dob);
          var dateOrdo = o.dateOrdonnance || c.ordonnance && c.ordonnance.dateOrdonnance || "";
          if (dateOrdo) {
            ultraFill(findElement('[id$="rechercherdateprescription_I"]'), dateOrdo);
          }
          var rpps = o.rpps || c.ordonnance && c.ordonnance.rpps || c.rpps || "";
          if (rpps) {
            ultraFill(findElement('[id$="rechercherRPPS_I"]'), rpps.replace(/\D/g, "").slice(0, 11));
          }
          var prescEl = findElement('[id$="rechercherdateprescription_I"]');
          var rppsEl = findElement('[id$="rechercherRPPS_I"]');
          console.info("[OptiBot APGIS] prescEl found:", !!prescEl, "| rppsEl found:", !!rppsEl);
          dxComboFill2("recherchernatureassurance", "Maladie - Taux SS 60%", "10");
          setTimeout(function() {
            dxComboFill2("recherchertyperenouvellement", "Renouv. avec adaptation", "2");
          }, 800);
          return true;
        }
        return false;
      },
      synchroniser: async () => false
    }
  };

  // extension-src/content/portals/actil.js
  var actil_default = {
    name: "Actil",
    isMatch: () => window.location.hostname.includes("actil.com"),
    actions: {
      formulaire: (data) => {
        var nomEl = findElement('input[name="nom"]');
        if (!nomEl) return false;
        var m = data.m || {};
        var o = data.o || {};
        var c = data.cached || {};
        var personnes = m.personnes || [];
        var p0 = personnes.length > 0 ? personnes[0] : {};
        var nom = m.nom || p0.nom || o.nomPatient || c.nom || "";
        var prenom = m.prenom || p0.prenom || o.prenomPatient || c.prenom || "";
        var foundNSS = m.numeroSecuriteSociale || "";
        if (!foundNSS) {
          for (var i = 0; i < personnes.length; i++) {
            var pNSS = (personnes[i].numeroSecuriteSociale || "").replace(/\D/g, "");
            if (pNSS.length >= 13) {
              foundNSS = personnes[i].numeroSecuriteSociale;
              break;
            }
          }
        }
        var foundDOB = m.dateNaissance || "";
        if (!foundDOB) {
          for (var i = 0; i < personnes.length; i++) {
            if (personnes[i].dateNaissance) {
              foundDOB = personnes[i].dateNaissance;
              break;
            }
          }
        }
        var nss = foundNSS || c.nss || "";
        var dob = foundDOB || o.dateNaissancePatient || c.dob || "";
        var effectiveNSS = getOuvrantDroitNSS(nss, dob, personnes);
        ultraFill(nomEl, nom.toUpperCase());
        ultraFill(findElement('input[name="prenom"]'), capitalize(prenom));
        ultraFill(findElement('input[name="numInsee"]'), effectiveNSS.replace(/\D/g, ""));
        return true;
      },
      synchroniser: async () => false
    }
  };

  // extension-src/content/portals/mercer.js
  var mercer_default = {
    name: "Mercer",
    isMatch: () => window.location.hostname.includes("services-fm.net") || window.location.hostname.includes("mercernet.fr") || window.location.href.includes("PECMERPRO"),
    actions: {
      formulaire: (data) => {
        var ssEl = findElement('input[name="numeroSS"]');
        if (!ssEl) return false;
        var m = data.m || {};
        var o = data.o || {};
        var c = data.cached || {};
        var personnes = m.personnes || [];
        var p0 = personnes.length > 0 ? personnes[0] : {};
        var nom = m.nom || p0.nom || o.nomPatient || c.nom || "";
        var prenom = m.prenom || p0.prenom || o.prenomPatient || c.prenom || "";
        var foundNSS = m.numeroSecuriteSociale || "";
        if (!foundNSS) {
          for (var i = 0; i < personnes.length; i++) {
            var pNSS = (personnes[i].numeroSecuriteSociale || "").replace(/\D/g, "");
            if (pNSS.length >= 13) {
              foundNSS = personnes[i].numeroSecuriteSociale;
              break;
            }
          }
        }
        var foundDOB = m.dateNaissance || "";
        if (!foundDOB) {
          for (var i = 0; i < personnes.length; i++) {
            if (personnes[i].dateNaissance) {
              foundDOB = personnes[i].dateNaissance;
              break;
            }
          }
        }
        var nss = foundNSS || c.nss || "";
        var dob = foundDOB || o.dateNaissancePatient || c.dob || "";
        var effectiveNSS = getOuvrantDroitNSS(nss, dob, personnes);
        var numAdherent = m.numeroAdherent || c.numeroAdherent || c.regimes && c.regimes.rc1 && c.regimes.rc1.numeroAdherent || "";
        ultraFill(ssEl, effectiveNSS.replace(/\D/g, ""));
        ultraFill(findElement("#nom"), nom.toUpperCase());
        ultraFill(findElement("#prenom"), capitalize(prenom));
        if (dob) ultraFill(findElement("#dateNai"), dob);
        if (numAdherent) ultraFill(findElement("#numAdh"), numAdherent);
        return true;
      },
      synchroniser: async () => false
    }
  };

  // extension-src/content/portals/tp-plus.js
  var tp_plus_default = {
    name: "TP Plus",
    isMatch: () => window.location.hostname.includes("optique-tpplus") || window.location.hostname.includes("santeclair.fr") && window.location.pathname.includes("/tp-plus"),
    actions: {
      formulaire: (data) => {
        var nomEl = findElement('[formcontrolname="nom"]:not([disabled])') || findElement("#mat-input-0");
        if (!nomEl) return false;
        var m = data.m || {};
        var o = data.o || {};
        var c = data.cached || {};
        var personnes = m.personnes || [];
        var p0 = personnes.length > 0 ? personnes[0] : {};
        var nom = m.nom || p0.nom || o.nomPatient || c.nom || "";
        var prenom = m.prenom || p0.prenom || o.prenomPatient || c.prenom || "";
        var foundDOB = m.dateNaissance || "";
        if (!foundDOB) {
          for (var i = 0; i < personnes.length; i++) {
            if (personnes[i].dateNaissance) {
              foundDOB = personnes[i].dateNaissance;
              break;
            }
          }
        }
        var dob = foundDOB || o.dateNaissancePatient || c.dob || "";
        var phone = normalizePhone(c.phone || m.telephone || "");
        var mutuelle = m.organisme || c.mutuelle || c.organisme || "";
        var numAdherent = m.numeroAdherent || c.numeroAdherent || c.regimes && c.regimes.rc1 && c.regimes.rc1.numeroAdherent || "";
        var fillFields = function() {
          if (numAdherent) {
            var contratEl = findElement('[formcontrolname="numeroContratAmc"]');
            if (contratEl && !contratEl.disabled) ultraFill(contratEl, numAdherent);
          }
          ultraFill(findElement('[formcontrolname="nom"]:not([disabled])'), nom.toUpperCase());
          ultraFill(findElement('[formcontrolname="prenom"]:not([disabled])'), capitalize(prenom));
          if (dob) {
            var d = String(dob).replace(/\D/g, "");
            var dobFmt = dob;
            if (d.length === 8) {
              dobFmt = parseInt(d.slice(0, 4)) > 1900 ? d.slice(6, 8) + "/" + d.slice(4, 6) + "/" + d.slice(0, 4) : d.slice(0, 2) + "/" + d.slice(2, 4) + "/" + d.slice(4, 8);
            }
            ultraFill(findElement('[formcontrolname="dateNaissance"]'), dobFmt);
          }
          if (phone) {
            ultraFill(findElement('[formcontrolname="telephone"]'), phone);
          }
          var hasLentilles = o.lentillesOD && o.lentillesOD.sphere || o.lentillesOG && o.lentillesOG.sphere || o.typePrescription === "lentilles";
          var radioVal = hasLentilles ? "2" : "1";
          var radios = document.querySelectorAll("input.mdc-radio__native-control");
          for (var ri = 0; ri < radios.length; ri++) {
            if (radios[ri].value === radioVal && !radios[ri].checked) {
              radios[ri].click();
              break;
            }
          }
          setTimeout(function() {
            var suivantBtn = document.querySelector("button.stepper-btn");
            if (suivantBtn && !suivantBtn.disabled) suivantBtn.click();
          }, 800);
        };
        if (mutuelle) {
          var assureurEl = findElement('[formcontrolname="assureur"]');
          if (assureurEl) {
            ultraFill(assureurEl, mutuelle);
            setTimeout(function() {
              var panel = document.querySelector(".mat-mdc-autocomplete-panel, .mat-autocomplete-panel");
              if (!panel) return;
              var options = panel.querySelectorAll("mat-option");
              if (options.length === 0) return;
              var needle = mutuelle.toLowerCase().replace(/\s+/g, " ").trim();
              var best = options[0];
              var bestScore = 0;
              for (var oi = 0; oi < options.length; oi++) {
                var optText = (options[oi].textContent || "").toLowerCase().replace(/\s+/g, " ").trim();
                if (optText === needle) {
                  best = options[oi];
                  bestScore = 3;
                  break;
                }
                if (bestScore < 2 && optText.includes(needle)) {
                  best = options[oi];
                  bestScore = 2;
                }
                if (bestScore < 1 && needle.includes(optText)) {
                  best = options[oi];
                  bestScore = 1;
                }
              }
              best.click();
              setTimeout(fillFields, 800);
            }, 600);
          }
        } else {
          fillFields();
        }
        return true;
      },
      /* Écran 2 — Dossier patient (ordonnance, prescripteur, corrections) */
      rpa: (data) => {
        var o = data.o || {};
        var c = data.cached || {};
        var m = data.m || {};
        var filled = 0;
        var dateOrdo = o.dateOrdonnance || c.dateOrdonnance || "";
        if (dateOrdo) {
          var d = String(dateOrdo).replace(/\D/g, "");
          var dateOrdoFmt = dateOrdo;
          if (d.length === 8) {
            dateOrdoFmt = parseInt(d.slice(0, 4)) > 1900 ? d.slice(6, 8) + "/" + d.slice(4, 6) + "/" + d.slice(0, 4) : d.slice(0, 2) + "/" + d.slice(2, 4) + "/" + d.slice(4, 8);
          }
          var dateOrdoEl = findElement('[formcontrolname="dateOrdonnance"]');
          if (dateOrdoEl && !dateOrdoEl.disabled) {
            ultraFill(dateOrdoEl, dateOrdoFmt);
            filled++;
          }
        }
        var rpps = o.rpps || c.rpps || "";
        if (rpps) {
          var rppsRadio = document.querySelector('mat-radio-group[formcontrolname="prescripteurType"] input[value="2"]');
          if (rppsRadio && !rppsRadio.checked) rppsRadio.click();
          setTimeout(function() {
            var rppsEl = findElement('[formcontrolname="identifiantReglementaire"]');
            if (rppsEl) {
              ultraFill(rppsEl, rpps.replace(/\D/g, ""));
              filled++;
            }
          }, 300);
        }
        var od = o.oeilDroit || o.od || {};
        var og = o.oeilGauche || o.og || {};
        var checkboxes = document.querySelectorAll(".choix-vision-teinte mat-checkbox");
        function fillVisionBlock(blockIndex, odData, ogData) {
          var blocks = document.querySelectorAll("app-caracteristique");
          if (!blocks || !blocks[blockIndex]) return 0;
          var block = blocks[blockIndex];
          var count = 0;
          var rows = block.querySelectorAll("tr");
          if (rows.length >= 2) {
            var odInputs = rows[1].querySelectorAll("input[matinput]:not([disabled])");
            if (odInputs.length >= 1 && odData.sphere) {
              ultraFill(odInputs[0], odData.sphere);
              count++;
            }
            if (odInputs.length >= 2 && odData.cylindre) {
              ultraFill(odInputs[1], odData.cylindre);
              count++;
            }
            if (odInputs.length >= 3 && odData.axe) {
              ultraFill(odInputs[2], odData.axe);
              count++;
            }
            if (odInputs.length >= 4 && odData.addition) {
              ultraFill(odInputs[3], odData.addition);
              count++;
            }
          }
          if (rows.length >= 3) {
            var ogInputs = rows[2].querySelectorAll("input[matinput]:not([disabled])");
            if (ogInputs.length >= 1 && ogData.sphere) {
              ultraFill(ogInputs[0], ogData.sphere);
              count++;
            }
            if (ogInputs.length >= 2 && ogData.cylindre) {
              ultraFill(ogInputs[1], ogData.cylindre);
              count++;
            }
            if (ogInputs.length >= 3 && ogData.axe) {
              ultraFill(ogInputs[2], ogData.axe);
              count++;
            }
            if (ogInputs.length >= 4 && ogData.addition) {
              ultraFill(ogInputs[3], ogData.addition);
              count++;
            }
          }
          return count;
        }
        setTimeout(function() {
          if ((od.sphere || og.sphere) && checkboxes[0]) {
            var cb0Input = checkboxes[0].querySelector('input[type="checkbox"]');
            if (cb0Input && !cb0Input.checked) cb0Input.click();
            setTimeout(function() {
              filled += fillVisionBlock(0, od, og);
            }, 200);
          }
          if (od.addition || og.addition) {
            if (checkboxes[2]) {
              var cb2Input = checkboxes[2].querySelector('input[type="checkbox"]');
              if (cb2Input && !cb2Input.checked) cb2Input.click();
            }
          }
        }, 500);
        return filled > 0;
      },
      /* Page 2 — détection automatique */
      rpaPage2: true,
      synchroniser: async () => false
    }
  };

  // extension-src/content/portals/ffl-promoteur.js
  var ffl_promoteur_default = {
    name: "SP Sante",
    isMatch: () => window.location.hostname.includes("ffl-promoteur.com") && !window.location.hostname.includes("optique-tpplus") || window.location.hostname.includes("spsante.fr"),
    actions: {
      formulaire: (data) => {
        var nomEl = findElement("#mat-input-0");
        if (!nomEl) return false;
        var m = data.m || {};
        var o = data.o || {};
        var c = data.cached || {};
        var personnes = m.personnes || [];
        var p0 = personnes.length > 0 ? personnes[0] : {};
        var nom = m.nom || p0.nom || o.nomPatient || c.nom || "";
        var prenom = m.prenom || p0.prenom || o.prenomPatient || c.prenom || "";
        var foundNSS = m.numeroSecuriteSociale || "";
        if (!foundNSS) {
          for (var i = 0; i < personnes.length; i++) {
            var pNSS = (personnes[i].numeroSecuriteSociale || "").replace(/\D/g, "");
            if (pNSS.length >= 13) {
              foundNSS = personnes[i].numeroSecuriteSociale;
              break;
            }
          }
        }
        var foundDOB = m.dateNaissance || "";
        if (!foundDOB) {
          for (var i = 0; i < personnes.length; i++) {
            if (personnes[i].dateNaissance) {
              foundDOB = personnes[i].dateNaissance;
              break;
            }
          }
        }
        var nss = foundNSS || c.nss || "";
        var dob = foundDOB || o.dateNaissancePatient || c.dob || "";
        var effectiveNSS = getOuvrantDroitNSS(nss, dob, personnes);
        var digits = effectiveNSS.replace(/\D/g, "");
        var numAdherent = m.numeroAdherent || c.numeroAdherent || c.regimes && c.regimes.rc1 && c.regimes.rc1.numeroAdherent || "";
        ultraFill(nomEl, nom.toUpperCase());
        ultraFill(findElement("#mat-input-1"), capitalize(prenom));
        if (dob) ultraFill(findElement("#mat-input-2"), dob);
        if (numAdherent) {
          ultraFill(findElement("#mat-input-7"), numAdherent);
          ultraFill(findElement("#mat-input-8"), numAdherent);
        }
        ultraFill(findElement("#mat-input-9"), digits.slice(0, 13));
        ultraFill(findElement("#mat-input-10"), digits.slice(13, 15));
        return true;
      },
      synchroniser: async () => false
    }
  };

  // extension-src/content/portals/solimut.js
  var solimut_default = {
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
            if (pNSS.length >= 13) {
              foundNSS = personnes[i].numeroSecuriteSociale;
              break;
            }
          }
        }
        var foundDOB = m.dateNaissance || "";
        if (!foundDOB) {
          for (var i = 0; i < personnes.length; i++) {
            if (personnes[i].dateNaissance) {
              foundDOB = personnes[i].dateNaissance;
              break;
            }
          }
        }
        var nss = foundNSS || c.nss || "";
        var dob = foundDOB || o.dateNaissancePatient || c.dob || "";
        var effectiveNSS = getOuvrantDroitNSS(nss, dob, personnes);
        function findRadzenInputByLabel(labelText) {
          var labels = document.querySelectorAll("#devis_ident label, #body-devis label");
          for (var i2 = 0; i2 < labels.length; i2++) {
            if ((labels[i2].textContent || "").trim().toLowerCase().indexOf(labelText.toLowerCase()) >= 0) {
              var container = labels[i2].closest('.col-lg-2, .col-lg-3, .col-xl-2, .col-xl-3, div[class*="col-"]');
              if (container) {
                var inp = container.querySelector(".rz-calendar .rz-inputtext:not([disabled]):not([readonly])");
                if (inp) return inp;
                inp = container.querySelector(".rz-textbox:not([disabled])");
                if (inp) return inp;
                inp = container.querySelector("input.rz-inputtext:not([disabled]):not([readonly])");
                if (inp) return inp;
                inp = container.querySelector(".rz-spinner-input:not([disabled])");
                if (inp) return inp;
              }
            }
          }
          return null;
        }
        var digits = effectiveNSS.replace(/\D/g, "");
        var formatted = digits;
        if (digits.length >= 13) {
          formatted = digits[0] + " " + digits.slice(1, 3) + " " + digits.slice(3, 5) + " " + digits.slice(5, 7) + " " + digits.slice(7, 10) + " " + digits.slice(10, 13);
          if (digits.length >= 15) formatted += " " + digits.slice(13, 15);
        }
        ultraFill(matriculeEl, formatted);
        if (dob) {
          var dobInput = findRadzenInputByLabel("Date de naissance");
          if (!dobInput) {
            var allDateInputs = document.querySelectorAll("#devis_ident .rz-calendar .rz-inputtext:not([disabled]):not([readonly])");
            if (allDateInputs.length >= 1) dobInput = allDateInputs[0];
          }
          if (dobInput) ultraFill(dobInput, dob);
        }
        var rangEl = findRadzenInputByLabel("Rang");
        var rpps = o.rpps || c.ordonnance && c.ordonnance.rpps || c.prescription && c.prescription.rpps || c.rpps || "";
        if (rpps) {
          var rppsEl = findElement('input[name="Prescripteur"]');
          if (rppsEl) ultraFill(rppsEl, rpps.replace(/\D/g, "").slice(0, 9));
        }
        var dateOrdo = o.dateOrdonnance || c.ordonnance && c.ordonnance.dateOrdonnance || c.prescription && c.prescription.datePrescription || "";
        if (dateOrdo) {
          var prescDateInput = findRadzenInputByLabel("Date de prescription");
          if (!prescDateInput) {
            var allDateInputs2 = document.querySelectorAll("#devis_ident .rz-calendar .rz-inputtext:not([disabled]):not([readonly])");
            if (allDateInputs2.length >= 2) prescDateInput = allDateInputs2[1];
          }
          if (prescDateInput) ultraFill(prescDateInput, dateOrdo);
        }
        console.info("[OptiBot Solimut] filled \u2014 hasNSS:", !!effectiveNSS, "| hasDob:", !!dob, "| hasRpps:", !!rpps, "| hasDateOrdo:", !!dateOrdo);
        return true;
      },
      synchroniser: async () => false
    }
  };

  // extension-src/content/portals/ameli.js
  var ameli_default = {
    name: "Ameli",
    isMatch: () => window.location.hostname.includes("ameli.fr"),
    actions: {
      formulaire: (data) => {
        var nirEl = findElement("#nir");
        if (!nirEl) return false;
        var m = data.m || {};
        var personnes = m.personnes || [];
        var p0 = personnes.length > 0 ? personnes[0] : {};
        var foundNSS = m.numeroSecuriteSociale || "";
        if (!foundNSS) {
          for (var i = 0; i < personnes.length; i++) {
            var pNSS = (personnes[i].numeroSecuriteSociale || "").replace(/\D/g, "");
            if (pNSS.length >= 13) {
              foundNSS = personnes[i].numeroSecuriteSociale;
              break;
            }
          }
        }
        var dob = m.dateNaissance || p0.dateNaissance || "";
        var c = data.cached || {};
        var nss = foundNSS || c.nss || "";
        var effectiveNSS = getOuvrantDroitNSS(nss, dob, personnes);
        ultraFill(nirEl, effectiveNSS.replace(/\D/g, "").slice(0, 13));
        return true;
      },
      synchroniser: async () => false
    }
  };

  // extension-src/content/portals/almerys.js
  var PORTAL_KEY2 = "mutuelle-almerys.com";
  var almerys_default = {
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
        var fillDate = function(el, val) {
          if (!el || el.disabled || el.readOnly) return;
          var d = String(val).replace(/\D/g, "");
          if (d.length < 8) return;
          var formatted = d.slice(0, 2) + "/" + d.slice(2, 4) + "/" + d.slice(4, 8);
          ultraFill(el, formatted);
        };
        console.info("[OptiBot Almerys] formulaire \u2014 hasNSS:", !!nss, "hasDob:", !!dob, "hasNom:", !!nom);
        var nomBenef = findElementTracked(PORTAL_KEY2, "nom_beneficiaire", "#nom_beneficiaire");
        if (nomBenef) {
          console.info("[OptiBot Almerys] Page recherche beneficiaire detectee");
          ultraFill(nomBenef, nom.toUpperCase());
          ultraFill(findElementTracked(PORTAL_KEY2, "nss_beneficiaire", "#nss_beneficiaire"), nss);
          filled = true;
        }
        var critNNI = findElementTracked(PORTAL_KEY2, "crit_numInsee", 'input[name="crit_numInsee"]');
        if (critNNI) {
          console.info("[OptiBot Almerys] Popup recherche beneficiaire detectee");
          var effectiveNSS = getOuvrantDroitNSS(nss, dob, personnes);
          ultraFill(critNNI, effectiveNSS.replace(/\D/g, "").slice(0, 13));
          ultraFill(findElementTracked(PORTAL_KEY2, "crit_nomBenef", 'input[name="crit_nomBenef"]'), nom.toUpperCase());
          ultraFill(findElementTracked(PORTAL_KEY2, "crit_prenomBenef", 'input[name="crit_prenomBenef"]'), capitalize(prenom));
          if (dob) ultraFill(findElementTracked(PORTAL_KEY2, "crit_dateNaissanceEdit", 'input[name="crit_dateNaissanceEdit"]'), dob);
          filled = true;
        }
        var nniEl = findElementTracked(PORTAL_KEY2, "numInsee", 'input[name="numInsee"]');
        console.info("[OptiBot Almerys] numInsee trouve:", !!nniEl, nniEl ? "readOnly=" + nniEl.readOnly : "");
        if (nniEl && !nniEl.readOnly) {
          var effectiveNSS = getOuvrantDroitNSS(nss, dob, personnes);
          console.info("[OptiBot Almerys] Fill NNI: [REDACTED]");
          ultraFill(nniEl, effectiveNSS.replace(/\D/g, "").slice(0, 13));
          filled = true;
        }
        var dateOrdoEl = findElementTracked(PORTAL_KEY2, "dateOrdonnanceEdit", 'input[name="dateOrdonnanceEdit"]');
        console.info("[OptiBot Almerys] dateOrdonnanceEdit trouve:", !!dateOrdoEl, dateOrdoEl ? "disabled=" + dateOrdoEl.disabled : "");
        if (dateOrdoEl) {
          if (!dateOrdoEl.disabled && !dateOrdoEl.value) {
            var dateOrdo = o.dateOrdonnance || c.prescription && c.prescription.datePrescription || "";
            console.info("[OptiBot Almerys] Fill date ordo: [REDACTED]");
            if (dateOrdo) fillDate(dateOrdoEl, dateOrdo);
          }
          var dateDemandeEl = findElementTracked(PORTAL_KEY2, "dateDemandeEdit", 'input[name="dateDemandeEdit"]');
          console.info("[OptiBot Almerys] dateDemandeEdit trouve:", !!dateDemandeEl, dateDemandeEl ? "disabled=" + dateDemandeEl.disabled : "");
          if (dateDemandeEl && !dateDemandeEl.disabled && !dateDemandeEl.value) {
            var today = /* @__PURE__ */ new Date();
            var dd = String(today.getDate()).padStart(2, "0");
            var mm = String(today.getMonth() + 1).padStart(2, "0");
            var yyyy = today.getFullYear();
            console.info("[OptiBot Almerys] Fill date demande:", dd + mm + yyyy);
            fillDate(dateDemandeEl, dd + mm + yyyy);
          }
          filled = true;
        }
        var cbMonture = findElementTracked(PORTAL_KEY2, "saisieMonture", 'input[name="saisieMonture"]');
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
                if (lignes[li].type === "monture") hasMonture = true;
                if (lignes[li].type === "verre") hasVerre = true;
                if (lignes[li].type === "supplement") hasSupplement = true;
              }
              if (eqData[ei].type === "lentilles") hasLentille = true;
            }
          } else {
            hasMonture = true;
            hasVerre = true;
          }
          var cbVerre = findElementTracked(PORTAL_KEY2, "saisieVerre", 'input[name="saisieVerre"]');
          var cbSupp = findElementTracked(PORTAL_KEY2, "saisieSupplement", 'input[name="saisieSupplement"]');
          var cbLentille = findElementTracked(PORTAL_KEY2, "saisieLentille", 'input[name="saisieLentille"]');
          if (cbMonture && hasMonture && !cbMonture.checked && !cbMonture.disabled) cbMonture.click();
          if (cbVerre && hasVerre && !cbVerre.checked && !cbVerre.disabled) cbVerre.click();
          if (cbSupp && hasSupplement && !cbSupp.checked && !cbSupp.disabled) cbSupp.click();
          if (cbLentille && hasLentille && !cbLentille.checked && !cbLentille.disabled) cbLentille.click();
          filled = true;
        }
        var PREFIX = "gererPecOptiqueElement[0].";
        var alFill = function(name, val) {
          if (!val) return;
          var el = document.querySelector('[name="' + PREFIX + name + '"]');
          if (el && !el.disabled && !el.readOnly && !(el.value || "").trim()) {
            el.value = String(val);
            filled = true;
          }
        };
        var prescEl = findElementTracked(PORTAL_KEY2, "numAMPrescripteur", '[name="' + PREFIX + 'numAMPrescripteur"]');
        if (prescEl) {
          console.info("[OptiBot Almerys] Page 2 equipements detectee");
          var rpps = o && o.rpps || c.prescription && c.prescription.rpps || "";
          if (rpps) alFill("numAMPrescripteur", rpps.replace(/\D/g, "").slice(0, 9));
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
          if (verreOD && verreOD.codeLPP) alFill("codeLPPVerreDroit", verreOD.codeLPP);
          if (verreOG && verreOG.codeLPP) alFill("codeLPPVerreGauche", verreOG.codeLPP);
          var od = o && o.lunettesOD || c.prescription && c.prescription.od || {};
          var og = o && o.lunettesOG || c.prescription && c.prescription.og || {};
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

  // extension-src/content/portals/oxantis.js
  var oxantis_default = {
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
            if (pNSS.length >= 13) {
              foundNSS = personnes[i].numeroSecuriteSociale;
              break;
            }
          }
        }
        var foundDOB = m.dateNaissance || "";
        if (!foundDOB) {
          for (var i = 0; i < personnes.length; i++) {
            if (personnes[i].dateNaissance) {
              foundDOB = personnes[i].dateNaissance;
              break;
            }
          }
        }
        var nss = (foundNSS || c.nss || "").replace(/\s/g, "");
        var dob = foundDOB || o.dateNaissancePatient || c.dob || "";
        var effectiveNSS = getOuvrantDroitNSS(nss, dob, personnes);
        var digits = effectiveNSS.replace(/\D/g, "").slice(0, 15);
        var filled = false;
        var numSsEl = findElement('[name="numSs"]');
        if (numSsEl) {
          if (digits) {
            ultraFill(numSsEl, digits);
            filled = true;
          }
          if (nom) {
            ultraFill(findElement('[name="nomAssure"]'), nom);
            filled = true;
          }
          if (prenom) {
            ultraFill(findElement('[name="prenomAssure"]'), capitalize(prenom));
            filled = true;
          }
          return filled;
        }
        var numSecuEl = findElement('[name="numSecu"]');
        if (numSecuEl) {
          if (digits) {
            ultraFill(numSecuEl, digits);
            filled = true;
          }
          if (dob) {
            var parts = dob.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
            if (parts) {
              ultraFill(findElement('[name="dateNaisJj"]'), parts[1]);
              ultraFill(findElement('[name="dateNaisMm"]'), parts[2]);
              ultraFill(findElement('[name="dateNaisAa"]'), parts[3]);
              filled = true;
            }
          }
          var rang = c.rangNaissance || "";
          if (rang) {
            var rangEl = findElement('[name="rangNais"]');
            if (rangEl) {
              rangEl.value = rang;
              rangEl.dispatchEvent(new Event("change", { bubbles: true }));
              filled = true;
            }
          }
          return filled;
        }
        var jourPrescEl = findElement('[name="jourPrescription"]');
        if (jourPrescEl) {
          var dateOrdo = o.dateOrdonnance || c.prescription && c.prescription.datePrescription || "";
          if (dateOrdo) {
            var parts = dateOrdo.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
            if (parts) {
              ultraFill(jourPrescEl, parts[1]);
              ultraFill(findElement('[name="moisPrescription"]'), parts[2]);
              ultraFill(findElement('[name="anneePrescription"]'), parts[3]);
              filled = true;
            }
          }
          var hasLentilles = o.lentillesOD && o.lentillesOD.sphere || o.lentillesOG && o.lentillesOG.sphere;
          var radios = document.querySelectorAll('[name="Equipement"]');
          for (var ri = 0; ri < radios.length; ri++) {
            if (hasLentilles && radios[ri].value === "Lentilles") {
              radios[ri].click();
              filled = true;
            }
            if (!hasLentilles && radios[ri].value === "Lunettes") {
              radios[ri].click();
              filled = true;
            }
          }
          var typeEqEl = findElement("#typeEquipement");
          if (typeEqEl) typeEqEl.value = hasLentilles ? "lentilles" : "Lunettes";
          return filled;
        }
        var dpecForm = document.querySelector('form[name="dpecOpt"]');
        if (dpecForm) {
          var prescFullName = c.prescription && c.prescription.prescripteur || "";
          if (prescFullName) {
            var prescParts = prescFullName.split(/\s+/);
            var prescNom = prescParts.length > 1 ? prescParts.slice(1).join(" ") : prescParts[0] || "";
            var prescPrenom = prescParts.length > 1 ? prescParts[0] : "";
            ultraFill(findElement('[name="nomPrescripteur"]'), prescNom.toUpperCase());
            ultraFill(findElement('[name="prenomPrescripteur"]'), capitalize(prescPrenom));
            filled = true;
          }
          var rpps = o.rpps || c.prescription && c.prescription.rpps || "";
          if (rpps) {
            ultraFill(findElement('[name="finessPrescripteur"]'), rpps.replace(/\D/g, "").slice(0, 9));
            filled = true;
          }
          var firstRadio = findElement('[name="prescriptionSelection"][value="first"]');
          if (firstRadio && !firstRadio.checked) {
            firstRadio.click();
            filled = true;
          }
          var tpOuiRadio = findElement('[name="optTPRegimeObligatoire"][value="OUI"]');
          if (tpOuiRadio && !tpOuiRadio.checked) {
            tpOuiRadio.click();
            filled = true;
          }
          var phoneVal = normalizePhone(c.phone || "");
          if (phoneVal) {
            ultraFill(findElement('[name="devisTelephone"]'), phoneVal);
            filled = true;
          }
          var emailVal = c.email || "";
          if (emailVal) {
            var mailOuiRadio = findElement("#mailpersonnel");
            if (mailOuiRadio && !mailOuiRadio.checked) {
              mailOuiRadio.click();
              if (typeof affichermailpersonnel === "function") affichermailpersonnel();
            }
            ultraFill(findElement('[name="devisEmail"]'), emailVal);
            ultraFill(findElement('[name="devisEmailConfirmation"]'), emailVal);
            filled = true;
          }
          var od = o.lunettesOD || c.prescription && c.prescription.od || {};
          var og = o.lunettesOG || c.prescription && c.prescription.og || {};
          var addOD = parseFloat(od.addition) || 0;
          var addOG = parseFloat(og.addition) || 0;
          var visionVal = addOD > 0 || addOG > 0 ? "4" : "1";
          var visionODEl = findElement('[name="visionTypeOD"]');
          if (visionODEl) {
            visionODEl.value = visionVal;
            visionODEl.dispatchEvent(new Event("change", { bubbles: true }));
            filled = true;
          }
          var visionOGEl = findElement('[name="visionTypeOG"]');
          if (visionOGEl) {
            visionOGEl.value = visionVal;
            visionOGEl.dispatchEvent(new Event("change", { bubbles: true }));
            filled = true;
          }
          var corrFields = [
            ["visions[0].lodSphere", od.sphere],
            ["visions[0].lodCylindre", od.cylindre],
            ["visions[0].axeOd", od.axe],
            ["visions[0].lodAddition", od.addition],
            ["visions[0].logSphere", og.sphere],
            ["visions[0].logCylindre", og.cylindre],
            ["visions[0].axeOg", og.axe],
            ["visions[0].logAddition", og.addition]
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

  // extension-src/content/portals/index.js
  var CONFIGS2 = {
    "generation.fr": generation_default,
    "livebyoptimum.com": livebyoptimum_default,
    "pro.wemind.io": wemind_default,
    "espaceprofessionnel.apgis.com": apgis_default,
    "www.actil.com": actil_default,
    "mercer": mercer_default,
    "tp-plus": tp_plus_default,
    "ffl-promoteur.com": ffl_promoteur_default,
    "solimut.fr": solimut_default,
    "ameli.fr": ameli_default,
    "mutuelle-almerys.com": almerys_default,
    "oxantis": oxantis_default
  };

  // extension-src/content/utils/remote-selectors.js
  var _remoteOverrides = null;
  var _remoteOverridesLoaded = false;
  function loadRemoteSelectors2(callback) {
    chrome.storage.local.get(["optibot_selector_overrides"], function(result) {
      var data = result.optibot_selector_overrides;
      if (data && data.overrides) {
        _remoteOverrides = data.overrides;
      } else {
        _remoteOverrides = {};
      }
      _remoteOverridesLoaded = true;
      if (typeof callback === "function") callback();
    });
  }
  function getOverride(portal, name, fallback) {
    if (!_remoteOverridesLoaded || !_remoteOverrides) return fallback;
    var portalOverrides = _remoteOverrides[portal];
    if (!portalOverrides) return fallback;
    var override = portalOverrides[name];
    return override && typeof override === "string" ? override : fallback;
  }
  function findElementWithOverride2(portal, name, fallback) {
    var overrideSelector = getOverride(portal, name, null);
    if (overrideSelector && overrideSelector !== fallback) {
      var el = findElement(overrideSelector);
      if (el) return el;
    }
    return findElement(fallback);
  }
  globalThis.loadRemoteSelectors = loadRemoteSelectors2;
  globalThis.getOverride = getOverride;
  globalThis.findElementWithOverride = findElementWithOverride2;

  // extension-src/content/utils/field-feedback.js
  var _feedbackMenuEl = null;
  var _feedbackTargetEl = null;
  function initFieldFeedback2() {
    document.addEventListener("contextmenu", function(e) {
      var target = e.target;
      if (!target) return;
      var isFormField = target.matches('input, select, textarea, [contenteditable="true"]');
      if (!isFormField) return;
      setTimeout(function() {
        showFeedbackMenu(e.clientX, e.clientY, target);
      }, 100);
    });
    document.addEventListener("click", function(e) {
      if (_feedbackMenuEl && !_feedbackMenuEl.contains(e.target)) {
        hideFeedbackMenu();
      }
    });
  }
  function showFeedbackMenu(x, y, targetEl) {
    hideFeedbackMenu();
    _feedbackTargetEl = targetEl;
    var menu = document.createElement("div");
    menu.id = "optibot-feedback-menu";
    menu.style.cssText = [
      "position:fixed",
      "z-index:2147483647",
      "background:#1e293b",
      "color:white",
      "border-radius:8px",
      "box-shadow:0 4px 16px rgba(0,0,0,0.3)",
      "padding:4px",
      "min-width:200px",
      "font-family:system-ui,sans-serif",
      "font-size:13px",
      "left:" + Math.min(x, window.innerWidth - 220) + "px",
      "top:" + Math.min(y, window.innerHeight - 80) + "px"
    ].join(";");
    var btn = document.createElement("button");
    btn.style.cssText = "display:flex;align-items:center;gap:8px;width:100%;padding:8px 12px;background:none;border:none;color:white;cursor:pointer;border-radius:6px;text-align:left;";
    btn.innerHTML = '<span style="font-size:16px">\u{1F41B}</span><span>Signaler ce champ \xE0 OptiBot</span>';
    btn.addEventListener("mouseenter", function() {
      btn.style.background = "#334155";
    });
    btn.addEventListener("mouseleave", function() {
      btn.style.background = "none";
    });
    btn.addEventListener("click", function(e) {
      e.stopPropagation();
      sendFieldFeedback(targetEl);
      hideFeedbackMenu();
    });
    menu.appendChild(btn);
    document.body.appendChild(menu);
    _feedbackMenuEl = menu;
  }
  function hideFeedbackMenu() {
    if (_feedbackMenuEl) {
      _feedbackMenuEl.remove();
      _feedbackMenuEl = null;
    }
    _feedbackTargetEl = null;
  }
  function buildSelector(el) {
    if (el.id) return "#" + el.id;
    if (el.name) return el.tagName.toLowerCase() + '[name="' + el.name + '"]';
    if (el.getAttribute("data-field")) return '[data-field="' + el.getAttribute("data-field") + '"]';
    if (el.className) {
      var classes = Array.from(el.classList).slice(0, 2).join(".");
      if (classes) return el.tagName.toLowerCase() + "." + classes;
    }
    var parent = el.parentElement;
    if (parent) {
      var siblings = Array.from(parent.children);
      var idx = siblings.indexOf(el) + 1;
      return el.tagName.toLowerCase() + ":nth-child(" + idx + ")";
    }
    return el.tagName.toLowerCase();
  }
  function inferFieldType(el) {
    var hints = [
      el.id,
      el.name,
      el.placeholder,
      el.getAttribute("aria-label"),
      el.getAttribute("data-field")
    ].filter(Boolean).join(" ").toLowerCase();
    if (/nom|lastname|family/i.test(hints)) return "nom";
    if (/prenom|firstname/i.test(hints)) return "prenom";
    if (/nss|secu|insee/i.test(hints)) return "nss";
    if (/date|naissance|birth/i.test(hints)) return "date";
    if (/mutuelle|regime|rc1/i.test(hints)) return "mutuelle";
    if (/sph[eè]re|sphere/i.test(hints)) return "sphere";
    if (/cylindre|cyl/i.test(hints)) return "cylindre";
    if (/axe/i.test(hints)) return "axe";
    return "unknown";
  }
  function sendFieldFeedback(el) {
    var selector = buildSelector(el);
    var fieldType = inferFieldType(el);
    var portalHostname = window.location.hostname.replace(/^www\./, "");
    var portalUrl = window.location.href.split("?")[0];
    var payload = {
      selector,
      fieldType,
      portal: portalHostname,
      url: portalUrl,
      ts: Date.now()
    };
    showFeedbackToast("\u23F3 Signalement envoy\xE9 \xE0 OptiBot\u2026");
    chrome.runtime.sendMessage({
      type: "OPTIBOT_FIELD_FEEDBACK",
      payload
    }, function(response) {
      if (response && response.ok) {
        showFeedbackToast("\u{1F64F} Merci, on am\xE9liore \xE7a !");
      } else {
        showFeedbackToast("\u26A0\uFE0F Envoi \xE9chou\xE9 \u2014 r\xE9essaie plus tard");
      }
    });
  }
  function showFeedbackToast(message) {
    var existing = document.getElementById("optibot-feedback-toast");
    if (existing) existing.remove();
    var toast = document.createElement("div");
    toast.id = "optibot-feedback-toast";
    toast.style.cssText = [
      "position:fixed",
      "bottom:24px",
      "right:24px",
      "z-index:2147483647",
      "background:#1e293b",
      "color:white",
      "padding:10px 16px",
      "border-radius:10px",
      "font-family:system-ui,sans-serif",
      "font-size:13px",
      "font-weight:600",
      "box-shadow:0 4px 16px rgba(0,0,0,0.25)",
      "transition:opacity 0.3s"
    ].join(";");
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function() {
      toast.style.opacity = "0";
      setTimeout(function() {
        toast.remove();
      }, 300);
    }, 3e3);
  }
  globalThis.initFieldFeedback = initFieldFeedback2;

  // extension-src/content/utils/selector-health.js
  var _healthPingQueue = [];
  var _healthFlushTimer = null;
  var HEALTH_FLUSH_INTERVAL_MS = 1e4;
  var HEALTH_MAX_BATCH = 20;
  function reportSelectorHealth(portal, selectorName, found) {
    _healthPingQueue.push({
      portal,
      selectorName,
      found
    });
    if (!_healthFlushTimer) {
      _healthFlushTimer = setTimeout(flushHealthPings, HEALTH_FLUSH_INTERVAL_MS);
    }
    if (_healthPingQueue.length >= HEALTH_MAX_BATCH) {
      flushHealthPings();
    }
  }
  function flushHealthPings() {
    if (_healthFlushTimer) {
      clearTimeout(_healthFlushTimer);
      _healthFlushTimer = null;
    }
    if (_healthPingQueue.length === 0) return;
    var pingsToSend = _healthPingQueue.splice(0);
    chrome.storage.local.get(["optibot_auth"], function(result) {
      var auth = result.optibot_auth || {};
      if (!auth.syncToken) return;
      chrome.runtime.sendMessage({
        type: "OPTIBOT_PING",
        payloads: [{
          url: "https://optibot.fr/api/extension/selector-health",
          body: {
            syncToken: auth.syncToken,
            pings: pingsToSend
          }
        }]
      });
    });
  }
  function findElementTracked2(portal, name, fallback) {
    var el = findElementWithOverride(portal, name, fallback);
    reportSelectorHealth(portal, name, !!el);
    return el;
  }
  globalThis.reportSelectorHealth = reportSelectorHealth;
  globalThis.flushHealthPings = flushHealthPings;
  globalThis.findElementTracked = findElementTracked2;
  var _fillStats = {};
  function trackFillResult2(hostname, field, success) {
    if (!_fillStats[hostname]) _fillStats[hostname] = { total: 0, skipped: 0, fields: {} };
    _fillStats[hostname].total++;
    if (!success) _fillStats[hostname].skipped++;
    if (!success) {
      _fillStats[hostname].fields[field] = (_fillStats[hostname].fields[field] || 0) + 1;
    }
  }
  function checkAndRepairSelectors2(hostname) {
    var stats = _fillStats[hostname];
    if (!stats || stats.total < 5) return;
    var skipRate = stats.skipped / stats.total;
    if (skipRate < 0.3) return;
    console.warn("[OptiBot] Taux de skip eleve sur " + hostname + " (" + Math.round(skipRate * 100) + "%) \u2014 envoi snapshot DOM pour reparation");
    var snapshot = captureAnonymizedSnapshot();
    chrome.storage.local.get(["optibot_auth"], function(result) {
      var auth = result.optibot_auth || {};
      if (!auth.syncToken) return;
      fetch("https://optibot.fr/api/extension/selector-repair", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + auth.syncToken
        },
        body: JSON.stringify({
          hostname,
          skipRate,
          failedFields: stats.fields,
          snapshot,
          ts: Date.now()
        })
      }).catch(function(err) {
        console.warn("[OptiBot] selector repair submission failed:", err);
      });
    });
    _fillStats[hostname] = { total: 0, skipped: 0, fields: {} };
  }
  function captureAnonymizedSnapshot() {
    var inputs = document.querySelectorAll("input, select, textarea");
    var snapshot = [];
    for (var i = 0; i < inputs.length && i < 100; i++) {
      var el = inputs[i];
      snapshot.push({
        tag: el.tagName.toLowerCase(),
        type: el.type || "",
        id: el.id || "",
        name: el.name || "",
        className: (el.className || "").substring(0, 100),
        placeholder: (el.placeholder || "").substring(0, 50),
        ariaLabel: el.getAttribute("aria-label") || "",
        formControlName: el.getAttribute("formcontrolname") || "",
        /* NO value — anonymized */
        hasValue: !!(el.value || "").trim(),
        isVisible: el.offsetHeight > 0,
        parentClasses: el.parentElement ? (el.parentElement.className || "").substring(0, 100) : ""
      });
    }
    return snapshot;
  }
  globalThis.trackFillResult = trackFillResult2;
  globalThis.checkAndRepairSelectors = checkAndRepairSelectors2;

  // extension-src/content/utils/rejection-predictor.js
  var _rejectionModel = null;
  function loadRejectionModel2() {
    chrome.storage.local.get(["optibot_rejection_model"], function(result) {
      var cached = result.optibot_rejection_model;
      if (cached && cached.ts && Date.now() - cached.ts < 864e5) {
        _rejectionModel = cached.model;
        return;
      }
      if (typeof getSyncToken === "function") {
        getSyncToken().then(function(token) {
          if (!token) return;
          fetch("https://optibot.fr/api/extension/rejection-model", {
            headers: { "Authorization": "Bearer " + token }
          }).then(function(r) {
            return r.json();
          }).then(function(data) {
            _rejectionModel = data.model || null;
            chrome.storage.local.set({ optibot_rejection_model: { model: _rejectionModel, ts: Date.now() } });
          }).catch(function(err) {
            console.warn("[OptiBot] rejection model fetch failed:", err);
          });
        });
      }
    });
  }
  function predictRejectionRisk2(fillData, hostname) {
    if (!_rejectionModel) return null;
    var risk = 0;
    var factors = [];
    var rules = _rejectionModel.rules || [];
    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i];
      if (rule.hostname && rule.hostname !== hostname) continue;
      var matches = false;
      if (rule.type === "montant_max" && fillData.montantTotal) {
        matches = parseFloat(fillData.montantTotal) > (rule.threshold || 0);
      } else if (rule.type === "organisme" && fillData.organisme) {
        matches = rule.organisms && rule.organisms.indexOf(fillData.organisme.toLowerCase()) !== -1;
      } else if (rule.type === "equipment" && fillData.equipmentCode) {
        matches = rule.codes && rule.codes.indexOf(fillData.equipmentCode) !== -1;
      }
      if (matches) {
        risk += rule.weight || 10;
        factors.push({
          reason: rule.reason || rule.type,
          impact: rule.weight || 10,
          suggestion: rule.suggestion || null
        });
      }
    }
    risk = Math.min(100, Math.max(0, risk));
    return {
      risk,
      level: risk < 20 ? "low" : risk < 50 ? "medium" : "high",
      factors,
      suggestions: factors.filter(function(f) {
        return f.suggestion;
      }).map(function(f) {
        return f.suggestion;
      })
    };
  }
  function showRejectionRiskBanner2(prediction) {
    if (!prediction || prediction.risk < 15) return;
    var existing = document.getElementById("optibot-rejection-risk");
    if (existing) existing.remove();
    var colors = { low: "#059669", medium: "#d97706", high: "#dc2626" };
    var labels = { low: "Faible", medium: "Moyen", high: "Eleve" };
    var banner = document.createElement("div");
    banner.id = "optibot-rejection-risk";
    banner.style.cssText = "position:fixed;top:16px;right:16px;z-index:2147483647;background:white;border-radius:12px;padding:16px 20px;box-shadow:0 8px 30px rgba(0,0,0,0.15);font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:360px;border-left:4px solid " + colors[prediction.level] + ";";
    var header = document.createElement("div");
    header.style.cssText = "display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;";
    header.innerHTML = '<span style="font-size:14px;font-weight:700;color:#111;">Risque de rejet : ' + prediction.risk + '%</span><span style="font-size:11px;padding:2px 8px;border-radius:4px;background:' + colors[prediction.level] + ';color:white;font-weight:600;">' + labels[prediction.level] + "</span>";
    banner.appendChild(header);
    if (prediction.factors.length > 0) {
      var factorList = document.createElement("div");
      factorList.style.cssText = "font-size:12px;color:#6b7280;";
      for (var i = 0; i < prediction.factors.length && i < 3; i++) {
        var f = document.createElement("div");
        f.style.cssText = "padding:2px 0;";
        f.textContent = "\u2022 " + prediction.factors[i].reason;
        factorList.appendChild(f);
      }
      banner.appendChild(factorList);
    }
    if (prediction.suggestions.length > 0) {
      var suggBox = document.createElement("div");
      suggBox.style.cssText = "margin-top:8px;padding:8px;background:#f0fdf4;border-radius:6px;font-size:12px;color:#065f46;";
      suggBox.textContent = "Suggestion : " + prediction.suggestions[0];
      banner.appendChild(suggBox);
    }
    var closeBtn = document.createElement("button");
    closeBtn.textContent = "\xD7";
    closeBtn.style.cssText = "position:absolute;top:8px;right:8px;background:none;border:none;font-size:18px;color:#9ca3af;cursor:pointer;";
    closeBtn.onclick = function() {
      banner.remove();
    };
    banner.appendChild(closeBtn);
    document.body.appendChild(banner);
    setTimeout(function() {
      banner.remove();
    }, 15e3);
  }
  globalThis.loadRejectionModel = loadRejectionModel2;
  globalThis.predictRejectionRisk = predictRejectionRisk2;
  globalThis.showRejectionRiskBanner = showRejectionRiskBanner2;

  // extension-src/content/command-center.js
  var CC_STORAGE_KEY = "optibot_cc_state";
  function createCommandCenter2() {
    if (document.getElementById("optibot-command-center")) return;
    var host = document.createElement("div");
    host.id = "optibot-command-center";
    host.style.cssText = "position:fixed;z-index:2147483647;";
    document.body.appendChild(host);
    var shadow = host.attachShadow({ mode: "closed" });
    var style = document.createElement("style");
    style.textContent = getCommandCenterCSS();
    shadow.appendChild(style);
    var container = document.createElement("div");
    container.className = "cc-container";
    shadow.appendChild(container);
    chrome.storage.local.get([CC_STORAGE_KEY], function(result) {
      var state = result[CC_STORAGE_KEY] || {};
      var x = state.x != null ? state.x : window.innerWidth - 360;
      var y = state.y != null ? state.y : 80;
      host.style.left = Math.max(0, Math.min(x, window.innerWidth - 50)) + "px";
      host.style.top = Math.max(0, Math.min(y, window.innerHeight - 50)) + "px";
      var mode = state.mode || "collapsed";
      renderCommandCenter(shadow, container, host, mode);
    });
    chrome.runtime.onMessage.addListener(function(message) {
      if (message && message.type === "OPTIBOT_SSE_EVENT") {
        readEncryptedCache().then(function() {
          chrome.storage.local.get([CC_STORAGE_KEY], function(result) {
            var state = result[CC_STORAGE_KEY] || {};
            var mode = state.mode || "collapsed";
            renderCommandCenter(shadow, container, host, mode);
            flashStatusDot(shadow);
          });
        });
      }
    });
  }
  function flashStatusDot(shadow) {
    var dot = shadow.querySelector(".cc-status-dot");
    if (!dot) {
      dot = shadow.querySelector(".cc-mini-dot");
    }
    if (dot) {
      dot.style.background = "#10b981";
      dot.style.boxShadow = "0 0 8px #10b981";
      dot.classList.add("cc-dot-flash");
      setTimeout(function() {
        dot.classList.remove("cc-dot-flash");
        dot.style.boxShadow = "";
      }, 1500);
    }
  }
  function getStatusColor(data) {
    if (!data || !data.nom) return "#ef4444";
    var hasNss = !!(data.nss || data.numeroSecuriteSociale);
    if (data.nom && hasNss) return "#10b981";
    return "#f59e0b";
  }
  function renderCommandCenter(shadow, container, host, mode) {
    readEncryptedCache().then(function(cache) {
      var data = cache && cache.current ? cache.current : null;
      var statusColor = getStatusColor(data);
      container.innerHTML = "";
      if (mode === "minimized") {
        renderMiniButton(shadow, container, host, statusColor);
        return;
      }
      var collapsed = mode === "collapsed";
      var header = document.createElement("div");
      header.className = "cc-header";
      var logoWrap = document.createElement("span");
      logoWrap.className = "cc-logo-wrap";
      var logoText = document.createElement("span");
      logoText.className = "cc-logo";
      logoText.textContent = "OptiBot";
      logoWrap.appendChild(logoText);
      var statusDot = document.createElement("span");
      statusDot.className = "cc-status-dot";
      if (statusColor === "#10b981") {
        statusDot.classList.add("cc-dot-pulse");
      }
      statusDot.style.background = statusColor;
      logoWrap.appendChild(statusDot);
      header.appendChild(logoWrap);
      makeDraggable(host, header);
      var headerBtns = document.createElement("span");
      headerBtns.className = "cc-header-btns";
      var minBtn = document.createElement("button");
      minBtn.className = "cc-btn-toggle cc-btn-minimize";
      minBtn.innerHTML = "&#x2500;";
      minBtn.title = "Minimiser";
      minBtn.onclick = function(e) {
        e.stopPropagation();
        saveState(host, "minimized");
        renderCommandCenter(shadow, container, host, "minimized");
      };
      headerBtns.appendChild(minBtn);
      var toggleBtn = document.createElement("button");
      toggleBtn.className = "cc-btn-toggle";
      toggleBtn.innerHTML = collapsed ? "&#x25BC;" : "&#x25B2;";
      toggleBtn.title = collapsed ? "Ouvrir" : "Reduire";
      toggleBtn.onclick = function(e) {
        e.stopPropagation();
        var newMode = collapsed ? "expanded" : "collapsed";
        saveState(host, newMode);
        renderCommandCenter(shadow, container, host, newMode);
      };
      headerBtns.appendChild(toggleBtn);
      header.appendChild(headerBtns);
      container.appendChild(header);
      if (collapsed) return;
      if (!data || !data.nom) {
        var empty = document.createElement("div");
        empty.className = "cc-empty";
        empty.textContent = "Aucune donnee patient. Scannez un document depuis le dashboard OptiBot.";
        container.appendChild(empty);
        return;
      }
      addSection(container, "Etat Civil", [
        { label: "Nom", value: (data.nom || "").toUpperCase() },
        { label: "Prenom", value: data.prenom || "" },
        { label: "Date naissance", value: data.dateNaissance || data.dob || "" },
        { label: "NSS", value: data.numeroSecuriteSociale || data.nss || "" }
      ]);
      addSection(container, "Mutuelle", [
        { label: "Organisme", value: data.organisme || "" },
        { label: "N. Adherent", value: data.numeroAdherent || "" },
        { label: "N. AMC", value: data.numeroAMC || "" },
        { label: "N. Teletrans.", value: data.numeroTeletransmission || "" },
        { label: "Type Conv.", value: data.typeConv || "" },
        { label: "Validite", value: (data.dateDebutValidite || "") + (data.dateFinValidite ? " - " + data.dateFinValidite : "") }
      ]);
      var o = data.ordonnance || {};
      if (o.lunettesOD || o.lunettesOG || o.dateOrdonnance) {
        var ordoFields = [
          { label: "Date ordo.", value: o.dateOrdonnance || "" },
          { label: "DP", value: o.distancePupillaire || "" }
        ];
        if (o.lunettesOD) {
          var od = o.lunettesOD;
          ordoFields.push({ label: "OD", value: formatCorrection(od) });
        }
        if (o.lunettesOG) {
          var og = o.lunettesOG;
          ordoFields.push({ label: "OG", value: formatCorrection(og) });
        }
        if (o.lunettesOD && o.lunettesOD.addition) {
          ordoFields.push({ label: "Addition", value: o.lunettesOD.addition });
        }
        addSection(container, "Ordonnance", ordoFields);
      }
      var actions = document.createElement("div");
      actions.className = "cc-actions";
      var fillBtn = document.createElement("button");
      fillBtn.className = "cc-btn cc-btn-fill";
      fillBtn.textContent = "Remplir";
      fillBtn.onclick = function() {
        var pageBtn = document.getElementById("optibot-fill-btn");
        if (pageBtn) pageBtn.click();
      };
      actions.appendChild(fillBtn);
      var scanBtn = document.createElement("button");
      scanBtn.className = "cc-btn cc-btn-scan";
      scanBtn.textContent = "Rescanner";
      scanBtn.onclick = function() {
        chrome.runtime.sendMessage({ type: "OPTIBOT_OPEN_TAB", url: "https://optibot.fr/dashboard" });
      };
      actions.appendChild(scanBtn);
      container.appendChild(actions);
    }).catch(function() {
      container.innerHTML = '<div class="cc-empty">Erreur de lecture du cache.</div>';
    });
  }
  function renderMiniButton(shadow, container, host, statusColor) {
    container.className = "cc-container cc-minimized";
    var miniBtn = document.createElement("div");
    miniBtn.className = "cc-mini-btn";
    var miniLetter = document.createElement("span");
    miniLetter.className = "cc-mini-letter";
    miniLetter.textContent = "O";
    miniBtn.appendChild(miniLetter);
    var miniBadge = document.createElement("span");
    miniBadge.className = "cc-mini-dot";
    if (statusColor === "#10b981") {
      miniBadge.classList.add("cc-dot-pulse");
    }
    miniBadge.style.background = statusColor;
    miniBtn.appendChild(miniBadge);
    makeDraggable(host, miniBtn);
    miniBtn.addEventListener("click", function(e) {
      if (miniBtn._wasDragged) {
        miniBtn._wasDragged = false;
        return;
      }
      e.stopPropagation();
      container.className = "cc-container";
      saveState(host, "collapsed");
      renderCommandCenter(shadow, container, host, "collapsed");
    });
    container.appendChild(miniBtn);
  }
  function addSection(container, title, fields) {
    var filteredFields = fields.filter(function(f) {
      return f.value;
    });
    if (filteredFields.length === 0) return;
    var section = document.createElement("div");
    section.className = "cc-section";
    var sTitle = document.createElement("div");
    sTitle.className = "cc-section-title";
    sTitle.textContent = title;
    section.appendChild(sTitle);
    filteredFields.forEach(function(field) {
      var row = document.createElement("div");
      row.className = "cc-field";
      var label = document.createElement("span");
      label.className = "cc-label";
      label.textContent = field.label;
      row.appendChild(label);
      var value = document.createElement("span");
      value.className = "cc-value";
      value.textContent = field.value;
      row.appendChild(value);
      var copyBtn = document.createElement("button");
      copyBtn.className = "cc-btn-copy";
      copyBtn.innerHTML = "&#x2398;";
      copyBtn.title = "Copier";
      copyBtn.onclick = function(e) {
        e.stopPropagation();
        navigator.clipboard.writeText(field.value).then(function() {
          copyBtn.innerHTML = "&#x2713;";
          copyBtn.style.color = "#10b981";
          setTimeout(function() {
            copyBtn.innerHTML = "&#x2398;";
            copyBtn.style.color = "";
          }, 1500);
        });
      };
      row.appendChild(copyBtn);
      section.appendChild(row);
    });
    container.appendChild(section);
  }
  function formatCorrection(c) {
    if (!c) return "";
    var parts = [];
    if (c.sphere) parts.push("Sph " + c.sphere);
    if (c.cylindre && c.cylindre !== "0" && c.cylindre !== "0.00") parts.push("Cyl " + c.cylindre);
    if (c.axe && c.axe !== "0") parts.push("Axe " + c.axe);
    if (c.addition) parts.push("Add " + c.addition);
    return parts.join("  ");
  }
  function makeDraggable(host, handle) {
    var startX, startY, origX, origY, dragging;
    handle.style.cursor = "grab";
    handle.addEventListener("mousedown", function(e) {
      e.preventDefault();
      startX = e.clientX;
      startY = e.clientY;
      origX = parseInt(host.style.left) || 0;
      origY = parseInt(host.style.top) || 0;
      dragging = false;
      handle.style.cursor = "grabbing";
      function onMove(e2) {
        var dx = e2.clientX - startX;
        var dy = e2.clientY - startY;
        if (!dragging && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
          dragging = true;
        }
        host.style.left = origX + dx + "px";
        host.style.top = origY + dy + "px";
      }
      function onUp() {
        handle.style.cursor = "grab";
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        if (dragging) {
          handle._wasDragged = true;
          saveState(host, null);
        }
      }
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });
  }
  function saveState(host, mode) {
    var state = {
      x: parseInt(host.style.left) || 0,
      y: parseInt(host.style.top) || 0
    };
    if (mode !== null) state.mode = mode;
    chrome.storage.local.get([CC_STORAGE_KEY], function(result) {
      var prev = result[CC_STORAGE_KEY] || {};
      var merged = Object.assign({}, prev, state);
      var obj = {};
      obj[CC_STORAGE_KEY] = merged;
      chrome.storage.local.set(obj);
    });
  }
  function getCommandCenterCSS() {
    return [
      /* Animations */
      "@keyframes optibotPulse {",
      "  0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }",
      "  70% { box-shadow: 0 0 0 6px rgba(16,185,129,0); }",
      "  100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }",
      "}",
      "@keyframes optibotFadeIn {",
      "  from { opacity: 0; transform: translateY(8px); }",
      "  to { opacity: 1; transform: translateY(0); }",
      "}",
      "@keyframes optibotDotFlash {",
      "  0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.7); }",
      "  50% { box-shadow: 0 0 12px 4px rgba(16,185,129,0.5); }",
      "  100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }",
      "}",
      /* Container */
      ".cc-container {",
      "  width: 320px;",
      "  background: #fff;",
      "  border: 1px solid #e2e8f0;",
      "  border-radius: 16px;",
      "  box-shadow: 0 8px 30px rgba(0,0,0,0.12);",
      "  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;",
      "  font-size: 12px;",
      "  color: #1e293b;",
      "  overflow: hidden;",
      "  user-select: none;",
      "  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);",
      "  animation: optibotFadeIn 0.3s ease-out;",
      "}",
      /* Minimized container */
      ".cc-container.cc-minimized {",
      "  width: 40px;",
      "  height: 40px;",
      "  border: none;",
      "  border-radius: 50%;",
      "  background: transparent;",
      "  box-shadow: none;",
      "  overflow: visible;",
      "}",
      /* Mini button */
      ".cc-mini-btn {",
      "  position: relative;",
      "  width: 40px;",
      "  height: 40px;",
      "  border-radius: 50%;",
      "  background: #2563eb;",
      "  display: flex;",
      "  align-items: center;",
      "  justify-content: center;",
      "  cursor: pointer;",
      "  box-shadow: 0 4px 14px rgba(37,99,235,0.4);",
      "  transition: box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);",
      "  animation: optibotFadeIn 0.3s ease-out;",
      "}",
      ".cc-mini-btn:hover {",
      "  box-shadow: 0 6px 20px rgba(37,99,235,0.55);",
      "  transform: scale(1.08);",
      "}",
      ".cc-mini-letter {",
      "  color: #fff;",
      "  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;",
      "  font-size: 18px;",
      "  font-weight: 800;",
      "  line-height: 1;",
      "  pointer-events: none;",
      "}",
      ".cc-mini-dot {",
      "  position: absolute;",
      "  top: -1px;",
      "  right: -1px;",
      "  width: 10px;",
      "  height: 10px;",
      "  border-radius: 50%;",
      "  border: 2px solid #fff;",
      "  pointer-events: none;",
      "}",
      /* Header */
      ".cc-header {",
      "  display: flex;",
      "  align-items: center;",
      "  justify-content: space-between;",
      "  padding: 10px 14px;",
      "  background: #1e293b;",
      "  color: #fff;",
      "}",
      ".cc-logo-wrap {",
      "  display: flex;",
      "  align-items: center;",
      "  gap: 8px;",
      "}",
      ".cc-logo {",
      "  font-weight: 800;",
      "  font-size: 13px;",
      "  letter-spacing: -0.3px;",
      "}",
      /* Status dot */
      ".cc-status-dot {",
      "  width: 8px;",
      "  height: 8px;",
      "  border-radius: 50%;",
      "  flex-shrink: 0;",
      "}",
      ".cc-dot-pulse {",
      "  animation: optibotPulse 2s infinite;",
      "}",
      ".cc-dot-flash {",
      "  animation: optibotDotFlash 1.5s ease-out !important;",
      "}",
      /* Header buttons */
      ".cc-header-btns {",
      "  display: flex;",
      "  align-items: center;",
      "  gap: 2px;",
      "}",
      ".cc-btn-toggle {",
      "  background: none;",
      "  border: none;",
      "  color: #94a3b8;",
      "  cursor: pointer;",
      "  font-size: 11px;",
      "  padding: 4px 8px;",
      "  border-radius: 6px;",
      "  transition: background 0.15s, color 0.15s;",
      "}",
      ".cc-btn-toggle:hover { background: rgba(255,255,255,0.1); color: #fff; }",
      ".cc-btn-minimize {",
      "  font-size: 14px;",
      "  line-height: 1;",
      "  padding: 4px 6px;",
      "}",
      /* Sections */
      ".cc-section { padding: 8px 14px; border-bottom: 1px solid #f1f5f9; }",
      ".cc-section-title {",
      "  font-size: 10px;",
      "  font-weight: 800;",
      "  text-transform: uppercase;",
      "  letter-spacing: 0.5px;",
      "  color: #94a3b8;",
      "  margin-bottom: 6px;",
      "}",
      ".cc-field {",
      "  display: flex;",
      "  align-items: center;",
      "  gap: 6px;",
      "  padding: 3px 0;",
      "}",
      ".cc-label {",
      "  font-size: 11px;",
      "  font-weight: 600;",
      "  color: #64748b;",
      "  min-width: 80px;",
      "  flex-shrink: 0;",
      "}",
      ".cc-value {",
      "  font-size: 12px;",
      "  font-weight: 700;",
      "  color: #1e293b;",
      "  flex: 1;",
      "  overflow: hidden;",
      "  text-overflow: ellipsis;",
      "  white-space: nowrap;",
      "}",
      ".cc-btn-copy {",
      "  background: none;",
      "  border: none;",
      "  cursor: pointer;",
      "  font-size: 13px;",
      "  color: #94a3b8;",
      "  padding: 2px 4px;",
      "  border-radius: 4px;",
      "  flex-shrink: 0;",
      "  transition: background 0.15s, color 0.15s;",
      "}",
      ".cc-btn-copy:hover { background: #f1f5f9; color: #3b82f6; }",
      /* Actions */
      ".cc-actions {",
      "  display: flex;",
      "  gap: 8px;",
      "  padding: 10px 14px;",
      "}",
      ".cc-btn {",
      "  flex: 1;",
      "  padding: 8px 12px;",
      "  border: none;",
      "  border-radius: 10px;",
      "  font-size: 12px;",
      "  font-weight: 700;",
      "  cursor: pointer;",
      "  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);",
      "}",
      ".cc-btn:hover {",
      "  transform: scale(1.03);",
      "  box-shadow: 0 4px 12px rgba(0,0,0,0.15);",
      "}",
      ".cc-btn-fill { background: #2563eb; color: #fff; }",
      ".cc-btn-fill:hover { background: #1d4ed8; }",
      ".cc-btn-scan { background: #f1f5f9; color: #475569; }",
      ".cc-btn-scan:hover { background: #e2e8f0; }",
      ".cc-empty {",
      "  padding: 20px 14px;",
      "  text-align: center;",
      "  color: #94a3b8;",
      "  font-size: 12px;",
      "  font-weight: 500;",
      "  line-height: 1.5;",
      "}"
    ].join("\n");
  }
  globalThis.createCommandCenter = createCommandCenter2;

  // extension-src/content/utils/devis-capture.js
  var DEVIS_INDICATORS = [
    "devis",
    "cotation",
    "simulation devis",
    "tarification devis",
    "monture",
    "verre correcteur",
    "verre progressif",
    "prix total",
    "total ttc",
    "reste a charge",
    "code lpp",
    "quotation"
  ];
  var DEVIS_FIELD_ALIASES = {
    montureRef: ["monture", "ref_monture", "reference_monture", "code_monture", "frame", "monture_ref", "frame_ref", "frame_reference"],
    montureMarque: ["marque_monture", "brand_monture", "fabricant_monture", "marque_frame", "monture_marque", "frame_brand"],
    monturePrix: ["prix_monture", "montant_monture", "price_frame", "frame_price", "cout_monture", "tarif_monture"],
    verreODRef: ["verre_od", "verre_droit", "lens_od", "lens_right", "ref_verre_od", "verre_od_ref"],
    verreOGRef: ["verre_og", "verre_gauche", "lens_og", "lens_left", "ref_verre_og", "verre_og_ref"],
    verrePrix: ["prix_verres", "prix_verre", "montant_verres", "lens_price", "cout_verres", "tarif_verres"],
    supplementRef: ["supplement", "traitement", "anti_reflet", "coating", "option", "surcharge", "antireflet", "photochromique", "anti_lumiere_bleue"],
    supplementPrix: ["prix_supplement", "montant_supplement", "prix_traitement", "prix_option", "tarif_supplement"],
    totalTTC: ["total", "total_ttc", "montant_total", "prix_total", "total_general", "net_a_payer", "montant_devis"],
    partMutuelle: ["part_mutuelle", "prise_en_charge", "remboursement", "montant_rembourse", "part_amc", "part_complementaire", "part_rc"],
    partSecu: ["part_secu", "part_amo", "remboursement_secu", "base_secu", "part_securite_sociale", "remboursement_amo"],
    resteACharge: ["reste_a_charge", "rac", "reste_charge", "a_payer", "montant_rac", "reste", "solde_patient"],
    codeLPP: ["code_lpp", "lpp", "code_prestation", "code_acte", "lpp_code"]
  };
  function detectDevisPage() {
    var text = (document.title + " " + document.body.innerText.substring(0, 3e3)).toLowerCase();
    var matchCount = 0;
    for (var i = 0; i < DEVIS_INDICATORS.length; i++) {
      if (text.indexOf(DEVIS_INDICATORS[i]) !== -1) matchCount++;
    }
    return matchCount >= 4;
  }
  function captureDevis() {
    if (!detectDevisPage()) return null;
    var result = {};
    var inputs = document.querySelectorAll("input, select, textarea, span, td, dd, [class*=value], [class*=prix], [class*=montant]");
    for (var i = 0; i < inputs.length; i++) {
      var el = inputs[i];
      var val;
      if (el.tagName === "INPUT" || el.tagName === "SELECT" || el.tagName === "TEXTAREA") {
        val = (el.value || "").trim();
      } else {
        val = (el.textContent || "").trim();
      }
      if (!val || val.length > 100) continue;
      var signals = [
        el.name,
        el.id,
        el.placeholder,
        el.getAttribute("aria-label"),
        el.getAttribute("data-field"),
        el.className
      ].filter(Boolean).join(" ").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s\-_\.]/g, "");
      for (var field in DEVIS_FIELD_ALIASES) {
        if (result[field]) continue;
        var aliases = DEVIS_FIELD_ALIASES[field];
        for (var a = 0; a < aliases.length; a++) {
          var norm = aliases[a].toLowerCase().replace(/[\s\-_\.]/g, "");
          if (signals.indexOf(norm) !== -1) {
            result[field] = val;
            break;
          }
        }
      }
    }
    var priceEls = document.querySelectorAll("[class*=total], [class*=prix], [class*=montant], [class*=price], [id*=total], [id*=prix]");
    for (var p = 0; p < priceEls.length; p++) {
      var pText = (priceEls[p].textContent || "").trim();
      var priceMatch = pText.match(/(\d+[.,]\d{2})\s*€?/);
      if (priceMatch && !result.totalTTC) {
        result.totalTTC = priceMatch[1];
      }
    }
    return Object.keys(result).length >= 2 ? result : null;
  }
  function syncDevisToBackend(devis) {
    if (!devis) return;
    if (typeof getSyncToken === "function") {
      getSyncToken().then(function(token) {
        if (!token) return;
        fetch("https://optibot.fr/api/extension/devis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          },
          body: JSON.stringify({
            hostname: window.location.hostname,
            devis,
            url: window.location.pathname,
            ts: Date.now()
          })
        }).then(function() {
          showDevisToast("Devis capture \u2014 " + (devis.totalTTC || "montant inconnu") + " EUR", "success");
        }).catch(function(err) {
          console.warn("[OptiBot] devis sync failed:", err);
        });
      });
    }
  }
  function showDevisToast(message, type) {
    var existing = document.getElementById("optibot-devis-toast");
    if (existing) existing.remove();
    var toast = document.createElement("div");
    toast.id = "optibot-devis-toast";
    toast.textContent = message;
    var bg = type === "success" ? "#059669" : "#d97706";
    toast.style.cssText = "position:fixed;bottom:70px;right:24px;z-index:2147483647;background:" + bg + ";color:white;padding:10px 16px;border-radius:10px;font:600 12px/1.4 -apple-system,BlinkMacSystemFont,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.12);opacity:0;transition:opacity .3s;";
    document.body.appendChild(toast);
    requestAnimationFrame(function() {
      toast.style.opacity = "1";
    });
    setTimeout(function() {
      toast.style.opacity = "0";
      setTimeout(function() {
        toast.remove();
      }, 300);
    }, 5e3);
  }
  var _devisDetected = false;
  function setupDevisDetection() {
    setTimeout(function() {
      var devis = captureDevis();
      if (devis) {
        _devisDetected = true;
        syncDevisToBackend(devis);
      }
    }, 3e3);
    if (document.body) {
      var timer = null;
      var obs = new MutationObserver(function(mutations) {
        if (_devisDetected) return;
        var hasNew = mutations.some(function(m) {
          return m.addedNodes.length > 0;
        });
        if (hasNew) {
          clearTimeout(timer);
          timer = setTimeout(function() {
            var devis = captureDevis();
            if (devis) {
              _devisDetected = true;
              syncDevisToBackend(devis);
            }
          }, 2e3);
        }
      });
      obs.observe(document.body, { childList: true, subtree: true });
    }
  }

  // extension-src/content/utils/dom.js
  function querySelectorAllDeep(selector, root, depth) {
    root = root || document;
    depth = depth || 0;
    if (depth > 5) return [];
    var results = Array.from(root.querySelectorAll(selector));
    var all = root.querySelectorAll("*");
    for (var i = 0; i < all.length; i++) {
      if (all[i].shadowRoot) {
        results = results.concat(querySelectorAllDeep(selector, all[i].shadowRoot, depth + 1));
      }
    }
    if (root === document && depth === 0) {
      var iframes = document.querySelectorAll("iframe");
      for (var fi = 0; fi < iframes.length; fi++) {
        try {
          var iDoc = iframes[fi].contentDocument || iframes[fi].contentWindow && iframes[fi].contentWindow.document;
          if (iDoc) results = results.concat(querySelectorAllDeep(selector, iDoc, depth + 1));
        } catch (e) {
        }
      }
    }
    return results;
  }
  function findElement2(selector) {
    if (!selector) return null;
    var el = document.querySelector(selector);
    if (el) return el;
    var iframes = document.querySelectorAll("iframe");
    for (var i = 0; i < iframes.length; i++) {
      try {
        var iDoc = iframes[i].contentDocument;
        if (iDoc) {
          el = iDoc.querySelector(selector);
          if (el) return el;
        }
      } catch (e) {
      }
    }
    return findInShadowRoots(selector, document);
  }
  function findInShadowRoots(selector, root, depth) {
    if ((depth || 0) > 5) return null;
    var children = Array.from(root.children || []);
    var hasShadowChild = children.some(function(c) {
      return !!c.shadowRoot;
    });
    if (!hasShadowChild) {
      var hasDeepShadow = children.some(function(c) {
        return Array.from(c.children || []).some(function(gc) {
          return !!gc.shadowRoot;
        });
      });
      if (!hasDeepShadow) return null;
    }
    var all = root.querySelectorAll("*");
    for (var i = 0; i < all.length; i++) {
      if (all[i].shadowRoot) {
        var found = all[i].shadowRoot.querySelector(selector);
        if (found) return found;
        found = findInShadowRoots(selector, all[i].shadowRoot, (depth || 0) + 1);
        if (found) return found;
      }
    }
    return null;
  }
  function waitForElement2(selector, timeoutMs) {
    return new Promise(function(resolve) {
      var el = findElement2(selector);
      if (el) {
        resolve(el);
        return;
      }
      var resolved = false;
      var observer = null;
      var timer = null;
      function cleanup() {
        if (resolved) return;
        resolved = true;
        if (observer) observer.disconnect();
        if (timer) clearTimeout(timer);
      }
      function check() {
        if (resolved) return;
        var found = findElement2(selector);
        if (found) {
          cleanup();
          resolve(found);
        }
      }
      try {
        observer = new MutationObserver(function() {
          check();
        });
        observer.observe(document.body || document.documentElement, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["id", "name", "class", "style", "hidden", "disabled"]
        });
      } catch (e) {
        var pollInterval = setInterval(function() {
          check();
          if (resolved) clearInterval(pollInterval);
        }, 150);
        timer = setTimeout(function() {
          clearInterval(pollInterval);
          if (!resolved) {
            resolved = true;
            resolve(null);
          }
        }, timeoutMs || 5e3);
        return;
      }
      var iframePoll = setInterval(function() {
        check();
      }, 300);
      timer = setTimeout(function() {
        clearInterval(iframePoll);
        cleanup();
        resolve(null);
      }, timeoutMs || 5e3);
    });
  }

  // extension-src/content/utils/format.js
  function capitalize2(s) {
    if (!s) return "";
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }
  function normalizePhone2(raw) {
    if (!raw) return "";
    var s = String(raw).replace(/[\s.\-()]/g, "");
    if (s.startsWith("+33")) s = "0" + s.slice(3);
    else if (s.startsWith("0033")) s = "0" + s.slice(4);
    s = s.replace(/\D/g, "");
    if (s.length > 10) s = s.slice(0, 10);
    return s.length === 10 ? s : "";
  }
  function detectOpticalFormat(el) {
    var ph = (el.placeholder || "").trim();
    if (/,/.test(ph)) return "comma";
    if (/^\d/.test(ph)) return "no_plus";
    return "default";
  }
  function formatOpticalValue(value, el) {
    var fmt = detectOpticalFormat(el);
    if (OPTICAL_FORMATTERS[fmt]) return OPTICAL_FORMATTERS[fmt](String(value));
    return String(value);
  }
  var VALUE_NORMALIZERS = {
    numeroSecuriteSociale: function(v, el) {
      var raw = v.replace(/\D/g, "");
      var maxlen = parseInt(el.getAttribute("maxlength") || "15");
      var ph = el.placeholder || "";
      if (maxlen >= 19 || /\d\s\d/.test(ph)) {
        var d = raw;
        return (d[0] || "") + " " + (d.slice(1, 3) || "") + " " + (d.slice(3, 5) || "") + " " + (d.slice(5, 7) || "") + " " + (d.slice(7, 10) || "") + " " + (d.slice(10, 13) || "") + (raw.length >= 15 ? " " + d.slice(13, 15) : "");
      }
      if (maxlen === 13) return raw.slice(0, 13);
      return raw.slice(0, 15);
    },
    telephone: function(v, el) {
      var raw = v.replace(/\D/g, "");
      var ph = el.placeholder || "";
      if (/\d{2}\s/.test(ph)) return raw.slice(0, 2) + " " + raw.slice(2, 4) + " " + raw.slice(4, 6) + " " + raw.slice(6, 8) + " " + raw.slice(8, 10);
      return raw.slice(0, 10);
    }
  };
  var OPTICAL_FORMATTERS = {
    comma: function(v) {
      return v.replace(".", ",");
    },
    no_plus: function(v) {
      return v.replace(/^\+/, "");
    },
    absolute: function(v) {
      return v.replace(/^[+-]/, "");
    }
  };
  var OPTICAL_FIELD_KEYS = [
    "lunettesOD.sphere",
    "lunettesOD.cylindre",
    "lunettesOD.axe",
    "lunettesOD.addition",
    "lunettesOG.sphere",
    "lunettesOG.cylindre",
    "lunettesOG.axe",
    "lunettesOG.addition",
    "lentillesOD.sphere",
    "lentillesOD.cylindre",
    "lentillesOD.axe",
    "lentillesOD.addition",
    "lentillesOG.sphere",
    "lentillesOG.cylindre",
    "lentillesOG.axe",
    "lentillesOG.addition"
  ];
  function normalizeDateValue(raw) {
    if (!raw) return { display: raw, iso: raw };
    var d = String(raw).replace(/\D/g, "");
    var dd, mm, yyyy;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
      var p2 = raw.split("/");
      dd = p2[0];
      mm = p2[1];
      yyyy = p2[2];
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      var p = raw.split("-");
      yyyy = p[0];
      mm = p[1];
      dd = p[2];
    } else if (d.length === 8) {
      if (parseInt(d.slice(0, 4)) > 1900) {
        yyyy = d.slice(0, 4);
        mm = d.slice(4, 6);
        dd = d.slice(6, 8);
      } else {
        dd = d.slice(0, 2);
        mm = d.slice(2, 4);
        yyyy = d.slice(4, 8);
      }
    } else {
      return { display: raw, iso: raw };
    }
    return {
      display: dd + "/" + mm + "/" + yyyy,
      iso: yyyy + "-" + mm + "-" + dd,
      dd,
      mm,
      yyyy
    };
  }
  function fieldHasValue(el, expected) {
    var val = String(el.value || "").trim();
    var exp = String(expected || "").trim();
    return val !== "" && (val === exp || val.replace(/\D/g, "") === exp.replace(/\D/g, ""));
  }

  // extension-src/content/utils/data.js
  async function getCachedClient2(data) {
    var cache = await readEncryptedCache();
    if (!cache) return null;
    return cache.current || null;
  }
  async function getSmartFillData() {
    var data = {};
    try {
      var text = await navigator.clipboard.readText();
      var parsed = JSON.parse(text);
      if (parsed.m || parsed.o) data = parsed;
    } catch (e) {
    }
    var cached = await getCachedClient2(data);
    var m = cached || data.m || {};
    var o = data.o || {};
    var p = m.personnes && m.personnes[0] || {};
    var rc1 = m.regimes && m.regimes.rc1 || {};
    return {
      organisme: m.organisme || rc1.nom || "",
      numeroAMC: m.numeroAMC || rc1.numeroAMC || "",
      numeroAdherent: m.numeroAdherent || rc1.numeroAdherent || rc1.numeroContrat || "",
      numeroTeletransmission: m.numeroTeletransmission || rc1.numeroTeletransmission || "",
      typeConv: m.typeConv || rc1.codeConvention || "",
      dateDebutValidite: m.dateDebutValidite || rc1.dateDebut || "",
      dateFinValidite: m.dateFinValidite || rc1.dateFin || "",
      nom: (m.nom || p.nom || o.nomPatient || "").toUpperCase(),
      prenom: m.prenom || p.prenom || o.prenomPatient || "",
      numeroSecuriteSociale: m.numeroSecuriteSociale || m.nss || p.numeroSecuriteSociale || "",
      dateNaissance: m.dateNaissance || m.dob || p.dateNaissance || o.dateNaissancePatient || "",
      telephone: (function() {
        var raw = m.telephone || m.phone || "";
        if (!raw) return "";
        var digits = raw.replace(/\D/g, "");
        if (digits.length === 11 && digits.startsWith("33")) digits = "0" + digits.slice(2);
        if (digits.length === 12 && digits.startsWith("330")) digits = "0" + digits.slice(3);
        var result = digits.slice(0, 10);
        return result;
      })(),
      email: m.email || "",
      adresse: m.adresse || m.address || "",
      codePostal: m.codePostal || m.zipCode || "",
      ville: m.ville || m.city || "",
      dateValidite: o.dateValidite || "",
      nomPatient: o.nomPatient || "",
      prenomPatient: o.prenomPatient || "",
      dateNaissancePatient: o.dateNaissancePatient || "",
      distancePupillaire: o.distancePupillaire || "",
      typePrescription: o.typePrescription || m.prescription && m.prescription.typeVision || "",
      remarques: o.remarques || "",
      /* Ordonnance — fallback m.prescription (format LiveByOptimum/TP Plus) */
      dateOrdonnance: o.dateOrdonnance || m.prescription && m.prescription.datePrescription || "",
      nomOphtalmologue: o.nomOphtalmologue || m.prescription && m.prescription.prescripteur || "",
      rpps: o.rpps || m.prescription && m.prescription.rpps || "",
      "lunettesOD.sphere": o.lunettesOD && o.lunettesOD.sphere ? String(o.lunettesOD.sphere) : m.prescription && m.prescription.od && m.prescription.od.sphere ? String(m.prescription.od.sphere) : "",
      "lunettesOD.cylindre": o.lunettesOD && o.lunettesOD.cylindre ? String(o.lunettesOD.cylindre) : m.prescription && m.prescription.od && m.prescription.od.cylindre ? String(m.prescription.od.cylindre) : "",
      "lunettesOD.axe": o.lunettesOD && o.lunettesOD.axe ? String(o.lunettesOD.axe) : m.prescription && m.prescription.od && m.prescription.od.axe ? String(m.prescription.od.axe) : "",
      "lunettesOD.addition": o.lunettesOD && o.lunettesOD.addition ? String(o.lunettesOD.addition) : m.prescription && m.prescription.od && m.prescription.od.addition ? String(m.prescription.od.addition) : "",
      "lunettesOG.sphere": o.lunettesOG && o.lunettesOG.sphere ? String(o.lunettesOG.sphere) : m.prescription && m.prescription.og && m.prescription.og.sphere ? String(m.prescription.og.sphere) : "",
      "lunettesOG.cylindre": o.lunettesOG && o.lunettesOG.cylindre ? String(o.lunettesOG.cylindre) : m.prescription && m.prescription.og && m.prescription.og.cylindre ? String(m.prescription.og.cylindre) : "",
      "lunettesOG.axe": o.lunettesOG && o.lunettesOG.axe ? String(o.lunettesOG.axe) : m.prescription && m.prescription.og && m.prescription.og.axe ? String(m.prescription.og.axe) : "",
      "lunettesOG.addition": o.lunettesOG && o.lunettesOG.addition ? String(o.lunettesOG.addition) : m.prescription && m.prescription.og && m.prescription.og.addition ? String(m.prescription.og.addition) : "",
      "lentillesOD.sphere": o.lentillesOD && o.lentillesOD.sphere ? String(o.lentillesOD.sphere) : "",
      "lentillesOD.cylindre": o.lentillesOD && o.lentillesOD.cylindre ? String(o.lentillesOD.cylindre) : "",
      "lentillesOD.axe": o.lentillesOD && o.lentillesOD.axe ? String(o.lentillesOD.axe) : "",
      "lentillesOD.addition": o.lentillesOD && o.lentillesOD.addition ? String(o.lentillesOD.addition) : "",
      "lentillesOD.rayonCourbure": o.lentillesOD && o.lentillesOD.rayonCourbure ? String(o.lentillesOD.rayonCourbure) : "",
      "lentillesOD.diametre": o.lentillesOD && o.lentillesOD.diametre ? String(o.lentillesOD.diametre) : "",
      "lentillesOG.sphere": o.lentillesOG && o.lentillesOG.sphere ? String(o.lentillesOG.sphere) : "",
      "lentillesOG.cylindre": o.lentillesOG && o.lentillesOG.cylindre ? String(o.lentillesOG.cylindre) : "",
      "lentillesOG.axe": o.lentillesOG && o.lentillesOG.axe ? String(o.lentillesOG.axe) : "",
      "lentillesOG.addition": o.lentillesOG && o.lentillesOG.addition ? String(o.lentillesOG.addition) : "",
      "lentillesOG.rayonCourbure": o.lentillesOG && o.lentillesOG.rayonCourbure ? String(o.lentillesOG.rayonCourbure) : "",
      "lentillesOG.diametre": o.lentillesOG && o.lentillesOG.diametre ? String(o.lentillesOG.diametre) : ""
    };
  }
  var SMART_FILL_ALIASES = {
    /* ══════════════════════════════════════════════════════════════════════
     *  MUTUELLE / TIERS-PAYANT
     * ══════════════════════════════════════════════════════════════════════ */
    organisme: [
      "organisme",
      "mutuelle",
      "caisse",
      "assureur",
      "compagnie",
      "complementaire",
      "assurance",
      "organisme_complementaire",
      "nom_mutuelle",
      "libelle_organisme",
      "nom_organisme",
      "organisme_amc",
      "caisse_complementaire",
      "assurance_complementaire",
      "complementaire_sante",
      "regime_complementaire",
      "tiers_payant",
      "organisme_tp",
      "tp_organisme",
      "organisme_rc",
      "rc_organisme",
      "nom_caisse",
      "nom_assureur",
      "nom_compagnie",
      "code_mutuelle",
      "mutuelle_nom",
      "oc",
      "organisme_oc",
      "insurer",
      "insurance",
      "insurance_company",
      "insurance_provider",
      "health_fund",
      "mutual",
      "fund_name",
      "payer",
      "insurerName",
      "organismeComplementaire",
      "libelleOrganisme",
      "nomMutuelle"
    ],
    numeroAMC: [
      /* standard */
      "numeroamc",
      "num_amc",
      "amc",
      "code_amc",
      "code_organisme",
      "id_organisme",
      "num_organisme",
      "numero_organisme",
      "code_caisse",
      "numero_amc",
      "codeAmc",
      "amcCode",
      "amcNumber",
      "code_complementaire",
      "id_amc",
      "ref_amc",
      /* variations portails */
      "code_oc",
      "num_oc",
      "id_oc",
      "numero_oc",
      "identifiant_oc",
      "code_complementaire_sante",
      "code_mutuelle",
      "id_mutuelle",
      "code_assureur",
      "num_assureur",
      "identifiant_mutuelle",
      "codeAMC",
      "numAMC",
      "idAMC",
      "amcIdentifier",
      /* Almerys */
      "codeOrganisme",
      "idOrganisme",
      "numOrganisme",
      /* Viamedis */
      "vm-amc",
      "vm-code-oc",
      /* data-testid */
      "amc-code",
      "organisme-code",
      "mutuelle-code"
    ],
    numeroAdherent: [
      /* standard */
      "numeroadherent",
      "num_adherent",
      "adherent",
      "numero_contrat",
      "num_contrat",
      "numcontrat",
      "nocontrat",
      "no_contrat",
      "id_adherent",
      "ref_adherent",
      "numero_membre",
      "contrat",
      "contract",
      "n contrat",
      "ncontrat",
      "reference_adherent",
      "numero_carte",
      "num_carte",
      "id_contrat",
      "ref_contrat",
      "numero_adherent",
      "n_adherent",
      "no_adherent",
      "subscriber_id",
      "member_id",
      "member_number",
      "policy_number",
      "policynumber",
      "subscriberId",
      "memberId",
      "memberNumber",
      "contractNumber",
      "numeroContrat",
      /* variations portails */
      "num_beneficiaire",
      "id_beneficiaire",
      "ref_beneficiaire",
      "numero_beneficiaire",
      "n_beneficiaire",
      "no_beneficiaire",
      "identifiant_adherent",
      "id_assur\xE9",
      "num_assur\xE9",
      "numero_assur\xE9",
      "carte_adherent",
      "num_carte_adherent",
      "carte_mutuelle",
      "adherent_number",
      "adherent_id",
      "adherent_ref",
      /* Almerys ROC */
      "numAdherent",
      "idAdherent",
      "refAdherent",
      "beneficiaireNumero",
      /* Wemind v3 */
      "membershipNumber",
      "enrollmentId",
      "vm-adherent",
      /* Viamedis */
      "numBeneficiaire",
      "vm-beneficiaire",
      /* ERP */
      "txtNumAdherent",
      "fld_adherent",
      "input_adherent",
      /* data-testid */
      "adherent-number",
      "member-id",
      "subscriber-id",
      "beneficiary-id"
    ],
    numeroTeletransmission: [
      /* standard */
      "numeroteletransmission",
      "num_teletransmission",
      "teletransmission",
      "num_tp",
      "numero_tp",
      "ref_tp",
      "code_teletransmission",
      "teletrans",
      "num_teletrans",
      /* variations portails */
      "no_tp",
      "n_tp",
      "reference_tp",
      "id_tp",
      "num_teletp",
      "teletransmission_number",
      "tp_reference",
      "tp_num",
      "numero_emission",
      "num_emission",
      "code_destinataire",
      "num_destinataire",
      "destinataire_tp",
      "num_routage",
      "code_routage",
      "routage",
      "n_emission",
      /* Almerys */
      "numTP",
      "refTP",
      "numTeletransmission",
      /* Viamedis */
      "numeroDestinataire",
      "codeDestinataire",
      /* camelCase */
      "numeroTeletransmission",
      "numTeletrans",
      "refTeletrans",
      /* ERP */
      "txtNumTP",
      "fld_num_tp",
      "input_tp",
      /* data-testid */
      "teletransmission-number",
      "tp-number",
      "tp-ref"
    ],
    typeConv: [
      /* standard */
      "typeconv",
      "type_conv",
      "type_convention",
      "convention",
      "regime",
      "type_regime",
      "code_convention",
      "codeconvention",
      "regimeType",
      /* variations portails */
      "nature_convention",
      "codeConvention",
      "type_prise_en_charge",
      "mode_remboursement",
      "type_roc",
      "type_tp",
      "type_tiers_payant",
      "code_regime",
      "regime_code",
      "regime_obligatoire",
      "ro",
      "convention_code",
      "code_conv",
      "nature_pec",
      "type_couverture",
      "modality",
      "convention_type",
      "regime_assurance",
      /* Almerys ROC */
      "typeConvention",
      "modeGestion",
      "naturePEC",
      /* Wemind v3 */
      "coverageType",
      "planType",
      "benefitType",
      /* camelCase */
      "typeConv",
      "codeConv",
      "regimeType",
      "conventionType",
      /* data-testid */
      "convention-type",
      "regime-type",
      "coverage-type"
    ],
    dateDebutValidite: [
      "datedebutvalidite",
      "debut_validite",
      "date_debut",
      "validite_debut",
      "date_debut_validite",
      "start_date",
      "startdate",
      "valid_from",
      "validfrom",
      "effective_date",
      "dateDebut",
      "debutValidite",
      "dateEffet"
    ],
    dateFinValidite: [
      "datefinvalidite",
      "fin_validite",
      "date_fin",
      "validite_fin",
      "date_fin_validite",
      "date_expiration",
      "expiration",
      "end_date",
      "enddate",
      "valid_until",
      "validuntil",
      "expiry_date",
      "expirydate",
      "dateFin",
      "finValidite",
      "dateExpiration"
    ],
    /* ══════════════════════════════════════════════════════════════════════
     *  PATIENT / BENEFICIAIRE — IDENTITE
     * ══════════════════════════════════════════════════════════════════════ */
    nom: [
      /* français */
      "nom",
      "nom_patient",
      "patient_nom",
      "nom_client",
      "client_nom",
      "nom_beneficiaire",
      "beneficiaire_nom",
      "nom_assure",
      "assure_nom",
      "nom_porteur",
      "nom_usage",
      "nom_naissance",
      "nom_jeune_fille",
      "patronyme",
      "nom_pers",
      "nom_titulaire",
      "adherent_nom",
      "infos_client_nom",
      "nom de famille",
      "nom beneficiaire",
      "nom assure",
      "nomassuree",
      "identite_nom",
      "ben_nom",
      "nom_ben",
      /* anglais */
      "lastname",
      "last_name",
      "surname",
      "family_name",
      "familyname",
      "last-name",
      "family-name",
      /* camelCase / frameworks */
      "nomPatient",
      "nomClient",
      "nomBeneficiaire",
      "nomAssure",
      "nomPorteur",
      "nomUsage",
      "lastName",
      "familyName",
      "patientLastName",
      "customerLastName",
      "clientLastName",
      "beneficiaryLastName",
      "PatientSurname",
      "Surname",
      /* ERP specifiques */
      "txtNom",
      "txtNomPatient",
      "ctl_nom",
      "ctl00_nom",
      "tbNom",
      "fld_nom",
      "input_nom",
      "champ_nom",
      "field_nom",
      "wo_nom",
      "arch_nom",
      "fiche_nom",
      /* Cosium / iGestion */
      "fiche_patient_nom",
      "pat_nom",
      "patient_last_name",
      /* Wemind v3 */
      "patientBirthName",
      "patient_birth_name",
      "vm-nom",
      /* data-testid React/Next */
      "patient-lastname",
      "patient-name",
      "beneficiary-lastname",
      /* data attributes */
      "input-lastname",
      "input-last-name",
      "input-nom"
    ],
    prenom: [
      /* français */
      "prenom",
      "prenom_patient",
      "patient_prenom",
      "prenom_client",
      "client_prenom",
      "prenom_beneficiaire",
      "beneficiaire_prenom",
      "prenom_assure",
      "prenom_porteur",
      "prenom_usage",
      "prenom_pers",
      "prenom_titulaire",
      "adherent_prenom",
      "infos_client_prenom",
      "prenom beneficiaire",
      "prenom assure",
      "prenomassuree",
      "ben_prenom",
      "prenom_ben",
      /* anglais */
      "firstname",
      "first_name",
      "given_name",
      "givenname",
      "forename",
      "first-name",
      "given-name",
      /* camelCase / frameworks */
      "prenomPatient",
      "prenomClient",
      "prenomBeneficiaire",
      "prenomAssure",
      "prenomPorteur",
      "firstName",
      "givenName",
      "patientFirstName",
      "customerFirstName",
      "clientFirstName",
      "beneficiaryFirstName",
      "PatientForename",
      "Forename",
      "GivenName",
      /* ERP specifiques */
      "txtPrenom",
      "txtPrenomPatient",
      "ctl_prenom",
      "ctl00_prenom",
      "tbPrenom",
      "fld_prenom",
      "input_prenom",
      "champ_prenom",
      "field_prenom",
      "wo_prenom",
      "arch_prenom",
      "fiche_prenom",
      /* Cosium / iGestion */
      "fiche_patient_prenom",
      "pat_prenom",
      "patient_first_name",
      /* Wemind v3 */
      "vm-prenom",
      /* data-testid React/Next */
      "patient-firstname",
      "patient-given-name",
      "beneficiary-firstname",
      /* data attributes */
      "input-firstname",
      "input-first-name",
      "input-prenom"
    ],
    numeroSecuriteSociale: [
      /* français standard */
      "numerosecuritesociale",
      "nss",
      "num_ss",
      "numss",
      "securite_sociale",
      "numero_secu",
      "num_secu",
      "immatriculation",
      "nirpp",
      "secu",
      "matricule",
      "numsecurite",
      "numero_securite_sociale",
      "numero de securite sociale",
      "n securite sociale",
      "no securite sociale",
      "numero_immatriculation",
      "immatriculation_assure",
      "numero_matricule",
      "matricule_assure",
      "nir",
      "numero_nir",
      "nir_assure",
      "num_immat",
      "immat",
      "num_nir",
      "nir_complet",
      "nir_beneficiaire",
      "nir_ben",
      "immat_beneficiaire",
      "cle_nss",
      "nss_cle",
      "nirpp_cle",
      "beneficiaire_nni",
      "nni",
      "numbenef",
      "num_benef",
      "numinsee",
      "num_insee",
      "insee",
      /* anglais */
      "ssn",
      "social_security",
      "social_security_number",
      "socialsecuritynumber",
      "national_id",
      "national_insurance",
      "insurance_number",
      /* camelCase / frameworks */
      "numeroSecuriteSociale",
      "numSS",
      "numSecu",
      "numInsee",
      "securiteSociale",
      "nirAssure",
      "numAssure",
      "nirBeneficiaire",
      "socialSecurityNumber",
      "PatientNIR",
      "NIR",
      "SocialSecurityNo",
      "SSN",
      "InsuranceNo",
      /* ERP specifiques */
      "txtNSS",
      "txtNumSS",
      "ctl_nss",
      "txtImmat",
      "tbNSS",
      "fld_nss",
      "input_nss",
      "champ_nss",
      "wo_nss",
      "arch_nss",
      /* data / placeholder patterns */
      "input-ssn",
      "input-nss",
      "numero secu",
      "numero ss",
      "n de secu",
      /* Almerys ROC nouveau portail */
      "beneficiaireNni",
      "nirComplet",
      "rangNaissance",
      "codeCaisse",
      "nir_rang",
      /* Wemind v3 */
      "subscriberNIR",
      "insuredId",
      "insured_id",
      "beneficiary_nir",
      /* Viamedis Angular (prefixe vm-) */
      "vm-nir",
      "vm-nss",
      "vm-secu",
      /* data-testid patterns React/Next */
      "patient-nss",
      "beneficiary-nir",
      "insured-nir",
      "nir-input"
    ],
    dateNaissance: [
      /* français */
      "datenaissance",
      "date_naissance",
      "naissance",
      "ddn",
      "date_de_naissance",
      "datedenaissance",
      "ne_le",
      "nee_le",
      "nele",
      "neele",
      "date_nais",
      "datenais",
      "date de naissance",
      "naissance beneficiaire",
      "date naissance beneficiaire",
      "datennaissanceassure",
      "datennaissanceassuree",
      "naissanceassure",
      "datennaissancebenef",
      "date de naissance beneficiaire",
      "dt_naiss",
      "date_naiss",
      "ddn_patient",
      "ddn_beneficiaire",
      "ddn_assure",
      /* anglais */
      "birthdate",
      "birth_date",
      "dateofbirth",
      "date_of_birth",
      "birthday",
      "dob",
      "datebirth",
      "borndate",
      "born_date",
      "birth_day",
      /* camelCase / frameworks */
      "dateNaissance",
      "dateNaissancePatient",
      "dateNaissanceBeneficiaire",
      "dateNaissanceAssure",
      "dateOfBirth",
      "birthDate",
      "patientDOB",
      "DOB",
      "PatientDOB",
      "BirthDate",
      "customerBirthDate",
      "clientBirthDate",
      /* ERP specifiques */
      "txtDateNaissance",
      "ctl_dateNaiss",
      "txtDDN",
      "tbDateNaiss",
      "fld_date_naiss",
      "input_datenaissance",
      "wo_ddn",
      "arch_ddn",
      /* Almerys ROC */
      "rangNaissanceAssure",
      "dateNaissanceAssure",
      "ddn_assur\xE9",
      /* Wemind v3 */
      "patientDob",
      "patient_dob",
      "vm-datenaissance",
      /* Cosium / iGestion */
      "fiche_patient_ddn",
      "pat_ddn",
      /* data-testid React/Next */
      "patient-dob",
      "patient-birthdate",
      "beneficiary-dob",
      /* data attributes */
      "input-dob",
      "input-birthdate",
      "input-datenaissance"
    ],
    /* ══════════════════════════════════════════════════════════════════════
     *  CONTACT PATIENT
     * ══════════════════════════════════════════════════════════════════════ */
    telephone: [
      "telephone",
      "tel",
      "phone",
      "mobile",
      "portable",
      "gsm",
      "cellphone",
      "num_tel",
      "numero_telephone",
      "tel_portable",
      "tel_mobile",
      "tel_fixe",
      "tel_domicile",
      "tel_pro",
      "telephone_domicile",
      "telephone_portable",
      "telephone_mobile",
      "contact_tel",
      "infos_client_telephone",
      "coordonnees_tel",
      "tel_contact",
      "tel1",
      "telephone1",
      "phone1",
      "numtel",
      "phone_number",
      "phonenumber",
      "mobile_phone",
      "cell_phone",
      "home_phone",
      "phoneNumber",
      "mobilePhone",
      "cellPhone",
      "homePhone",
      "contactPhone",
      "PatientPhone",
      "MobilePhone",
      "HomePhone",
      "PhoneNo",
      "txtTel",
      "txtTelephone",
      "ctl_tel",
      "tbTelMobile",
      "fld_tel",
      "input_telephone",
      "champ_tel",
      "wo_tel",
      "input-phone",
      "input-tel",
      "input-mobile"
    ],
    email: [
      "email",
      "mail",
      "courriel",
      "adresse_email",
      "adresse_mail",
      "e-mail",
      "contact_email",
      "emailaddress",
      "email_address",
      "adressemail",
      "adresse e-mail",
      "adresse_e_mail",
      "email_patient",
      "mail_patient",
      "e_mail",
      "emailAddress",
      "PatientEmail",
      "EmailAddress",
      "txtEmail",
      "txtMail",
      "ctl_email",
      "tbEmail",
      "fld_email",
      "input_email",
      "champ_email",
      "input-email",
      "input-mail"
    ],
    adresse: [
      "adresse",
      "address",
      "rue",
      "voie",
      "adresse_postale",
      "adressepostale",
      "ligne_1",
      "adresse_ligne1",
      "adresse1",
      "adresse_1",
      "numero_rue",
      "street",
      "street_address",
      "streetaddress",
      "address_line1",
      "address_line_1",
      "ligne1",
      "adresseligne1",
      "adresse_domicile",
      "ligne_adresse",
      "txtAdresse",
      "ctl_adresse",
      "fld_adresse",
      "adr",
      "input_adresse",
      "champ_adresse",
      "input-address",
      "input-adresse"
    ],
    codePostal: [
      "codepostal",
      "code_postal",
      "cp",
      "zipcode",
      "zip_code",
      "zip",
      "postal_code",
      "postalcode",
      "code postal",
      "cp_ville",
      "cdpostal",
      "postcode",
      "post_code",
      "txtCP",
      "ctl_cp",
      "fld_cp",
      "input_cp",
      "champ_cp",
      "input-zip",
      "input-zipcode",
      "input-cp"
    ],
    ville: [
      "ville",
      "city",
      "localite",
      "commune",
      "municipality",
      "town",
      "nom_ville",
      "ville_commune",
      "commune_residence",
      "locality",
      "txtVille",
      "ctl_ville",
      "fld_ville",
      "input_ville",
      "champ_ville",
      "input-city",
      "input-ville"
    ],
    /* ══════════════════════════════════════════════════════════════════════
     *  ORDONNANCE / PRESCRIPTION
     * ══════════════════════════════════════════════════════════════════════ */
    nomOphtalmologue: [
      "nomophtalmologue",
      "nom_medecin",
      "medecin",
      "prescripteur",
      "nom_prescripteur",
      "docteur",
      "ophtalmologue",
      "ophtalmo",
      "nom_docteur",
      "nommedecin",
      "medecin_prescripteur",
      "nom prescripteur",
      "docteur prescripteur",
      "nom_ophtalmo",
      "dr",
      "nom_dr",
      "prescriber",
      "doctor",
      "PrescriberName",
      "PractitionerName",
      "ReferredBy",
      "txtPrescripteur",
      "ctl_prescripteur"
    ],
    rpps: [
      /* standard */
      "rpps",
      "num_rpps",
      "numero_rpps",
      "identifiant_rpps",
      "code_rpps",
      "n_rpps",
      "id_prescripteur",
      "numrpps",
      "adeli",
      "num_adeli",
      "numero_adeli",
      "numam",
      "num_am",
      "numero_am",
      "numamprescripteur",
      "finess",
      "num_prescripteur",
      "prescriber_id",
      /* variations portails */
      "rpps_prescripteur",
      "no_rpps",
      "n_rpps_prescripteur",
      "codeRPPS",
      "rpps_medecin",
      "rpps_ophtalmologue",
      "rpps_ophtalmo",
      "rppsNumber",
      "rpps_dr",
      "num_am_prescripteur",
      "id_am",
      "numero_am_medecin",
      "numamprescribeur",
      "numeroadeli",
      "identifiant_am",
      "identifiant_professionnel",
      "id_professionnel",
      "num_professionnel",
      "num_finess",
      "finess_prescripteur",
      /* camelCase / frameworks */
      "PrescriberId",
      "PrescriberNo",
      "RPPSNo",
      "PractitionerId",
      "prescripteurRpps",
      "medecinRpps",
      "numRPPS",
      "codeAm",
      /* Almerys ROC */
      "numPrescripteur",
      "idPrescripteur",
      "codePraticien",
      /* ERP */
      "txtRPPS",
      "ctl_rpps",
      "fld_rpps",
      "wo_rpps",
      /* data-testid */
      "prescriber-rpps",
      "doctor-rpps",
      "prescriber-id"
    ],
    dateOrdonnance: [
      /* standard */
      "dateordonnance",
      "date_ordonnance",
      "ordonnance_date",
      "prescription_date",
      "date_prescription",
      "date_ordo",
      "dateordo",
      "date ordonnance",
      "date de l'ordonnance",
      "date de lordonnance",
      "date prescription",
      "dateordonnanceedit",
      "dt_ordonnance",
      "date_presc",
      "date_rx",
      "rx_date",
      /* variations portails */
      "date_ordo_patient",
      "dateordonnancedeprescription",
      "date_emission",
      "date_etablissement",
      "date_redaction",
      "dateprescription",
      "date_etablissement_ordonnance",
      "dateemissionordonnance",
      "date_de_prescription",
      "date_de_lordonnance",
      "ordonnance_etablie_le",
      "ordo_date",
      "date_r\xE9daction",
      /* anglais */
      "prescription_date",
      "prescriptionDate",
      "rx_date",
      "order_date",
      "issue_date",
      "issuance_date",
      "script_date",
      /* camelCase / frameworks */
      "dateOrdonnance",
      "datePrescription",
      "dateRx",
      "rxDate",
      "prescriptionDate",
      "orderDate",
      "issuedDate",
      /* Almerys ROC / Wemind */
      "datePrescriptionOrdonnance",
      "dateDelivrance",
      "dateEmission",
      /* ERP */
      "txtDateOrdo",
      "ctl_dateOrdo",
      "fld_date_ordo",
      "wo_dateordo",
      /* data-testid */
      "prescription-date",
      "ordonnance-date",
      "rx-date"
    ],
    dateValidite: [
      "datevalidite",
      "date_validite",
      "validite",
      "validite_ordonnance",
      "date validite",
      "date de validite",
      "expiry",
      "validity_date"
    ],
    nomPatient: [
      "nompatient",
      "nom_patient",
      "patient_nom",
      "patient_name",
      "patientName",
      "patient_last_name",
      "patientLastName"
    ],
    prenomPatient: [
      "prenompatient",
      "prenom_patient",
      "patient_prenom",
      "patient_first_name",
      "patientFirstName",
      "patientForename"
    ],
    dateNaissancePatient: [
      "datennaissancepatient",
      "datenaissance_patient",
      "patient_ddn",
      "patient_naissance",
      "patientDOB",
      "patient_date_of_birth",
      "patient_birthdate"
    ],
    distancePupillaire: [
      /* standard */
      "distancepupillaire",
      "dp",
      "dist_pupillaire",
      "ecart_pupillaire",
      "pupille",
      "distance_pupillaire",
      "ecartpupillaire",
      "ecart inter-pupillaire",
      "distance interpupillaire",
      /* variations */
      "dist_pupil",
      "dp_total",
      "dp_od",
      "dp_og",
      "ecart_pupil",
      "ecartpupil",
      "interpupillaire",
      "inter_pupillaire",
      "distancepupillaire_loin",
      "dpvl",
      "dp_vl",
      "distancepupillaireVL",
      "distancepupillaire_pres",
      "dpvp",
      "dp_vp",
      "distancepupillaireVP",
      "eip",
      "eip_vl",
      "eip_vp",
      "ecartinterpupillaire",
      /* anglais */
      "pd",
      "pupillary_distance",
      "ipd",
      "inter_pupillary",
      "interpupillary",
      "pupil_distance",
      "inter_pupil_distance",
      "binocular_pd",
      /* camelCase / frameworks */
      "distancePupillaire",
      "distancePD",
      "pupillaryDistance",
      "interpupillaryDistance",
      /* Almerys / Wemind */
      "epd",
      "dist_interpupillaire",
      /* ERP */
      "txtDP",
      "fld_dp",
      "input_dp",
      "champ_dp",
      /* data-testid */
      "pupillary-distance",
      "pd-input",
      "dp-input"
    ],
    typePrescription: [
      "typeprescription",
      "type_prescription",
      "type_equipement",
      "equipement",
      "type_verre",
      "typeequipement",
      "nature_equipement",
      "prescription_type",
      "equipment_type",
      "lens_type",
      "nature_dossier",
      "naturedossier"
    ],
    remarques: [
      "remarques",
      "notes",
      "commentaire",
      "observations",
      "note",
      "commentaires",
      "informations_complementaires",
      "infos_comp",
      "memo",
      "note_interne",
      "remarque",
      "notes_dossier",
      "notes_internes",
      "observation",
      "txtNotes",
      "ctl_notes",
      "notes_libres"
    ],
    /* ══════════════════════════════════════════════════════════════════════
     *  CORRECTIONS LUNETTES OD (Oeil Droit)
     * ══════════════════════════════════════════════════════════════════════ */
    "lunettesOD.sphere": [
      "sphere_od",
      "sph_od",
      "od_sph",
      "sphereod",
      "sphere od",
      "sph od",
      "sphere_verre_droit",
      "sphereverredroit",
      "od_sphere",
      "r_sphere",
      "sph_droit",
      "sphere_d",
      "sphere_vl_od",
      "sphere_loin_od",
      "svl_od",
      "sph_r",
      "sphod",
      "right_sphere",
      "sphereRight",
      "sphere_oeil_droit",
      "re_sph",
      "sphere_vp_od",
      "droit_sphere",
      /* Almerys ROC / Wemind v3 */
      "sphOD",
      "sphereOD",
      "SphOD",
      "SphereOD",
      "sph_vl_od",
      "verre_droit_sph",
      "vd_sph",
      "VD_sphere",
      "oeilDroit_sphere",
      /* LBO / Optimum */
      "od_sphere_vl",
      "sphereVLOD",
      "sph_od_vl",
      /* data-testid */
      "od-sphere",
      "right-sphere",
      "sphere-od"
    ],
    "lunettesOD.cylindre": [
      "cylindre_od",
      "cyl_od",
      "od_cyl",
      "cylindreod",
      "cyl od",
      "cylindre od",
      "cylindre_verre_droit",
      "r_cylindre",
      "cyl_droit",
      "cylindre_d",
      "cyl_r",
      "cylod",
      "right_cylinder",
      "cylinderRight",
      "cyl_vl_od",
      "od_cylindre",
      "droit_cylindre",
      "re_cyl",
      /* Almerys ROC / Wemind v3 */
      "cylOD",
      "cylindreOD",
      "CylOD",
      "CylindreOD",
      "verre_droit_cyl",
      "vd_cyl",
      "VD_cylindre",
      "oeilDroit_cylindre",
      /* data-testid */
      "od-cylindre",
      "right-cylinder",
      "cylindre-od"
    ],
    "lunettesOD.axe": [
      "axe_od",
      "ax_od",
      "od_axe",
      "axeod",
      "axe od",
      "ax od",
      "axe_verre_droit",
      "r_axe",
      "axe_droit",
      "axe_d",
      "ax_r",
      "axod",
      "right_axis",
      "axisRight",
      "axe_vl_od",
      "od_ax",
      "droit_axe",
      "axis_od",
      "re_ax",
      /* Almerys ROC / Wemind v3 */
      "axeOD",
      "AxeOD",
      "verre_droit_axe",
      "vd_axe",
      "VD_axe",
      "oeilDroit_axe",
      "axe_correction_od",
      /* data-testid */
      "od-axe",
      "right-axis",
      "axe-od"
    ],
    "lunettesOD.addition": [
      "addition_od",
      "add_od",
      "od_add",
      "additionod",
      "add od",
      "addition od",
      "r_addition",
      "add_droit",
      "addition_d",
      "add_r",
      "addod",
      "right_addition",
      "addRight",
      "add_vp_od",
      "od_addition",
      "droit_addition",
      "re_add",
      /* Almerys ROC / Wemind v3 */
      "addOD",
      "additionOD",
      "AddOD",
      "verre_droit_add",
      "vd_add",
      "oeilDroit_addition",
      "add_vp",
      /* data-testid */
      "od-addition",
      "right-addition",
      "addition-od"
    ],
    /* ══════════════════════════════════════════════════════════════════════
     *  CORRECTIONS LUNETTES OG (Oeil Gauche)
     * ══════════════════════════════════════════════════════════════════════ */
    "lunettesOG.sphere": [
      "sphere_og",
      "sph_og",
      "og_sph",
      "sphereog",
      "sphere og",
      "sph og",
      "sphere_verre_gauche",
      "l_sphere",
      "sph_gauche",
      "sphere_g",
      "sphere_vl_og",
      "sphere_loin_og",
      "svl_og",
      "sph_l",
      "sphog",
      "left_sphere",
      "sphereLeft",
      "sphere_oeil_gauche",
      "le_sph",
      "sphere_vp_og",
      "gauche_sphere",
      /* Almerys ROC / Wemind v3 */
      "sphOG",
      "sphereOG",
      "SphOG",
      "SphereOG",
      "sph_vl_og",
      "verre_gauche_sph",
      "vg_sph",
      "VG_sphere",
      "oeilGauche_sphere",
      /* LBO / Optimum */
      "og_sphere_vl",
      "sphereVLOG",
      "sph_og_vl",
      /* data-testid */
      "og-sphere",
      "left-sphere",
      "sphere-og"
    ],
    "lunettesOG.cylindre": [
      "cylindre_og",
      "cyl_og",
      "og_cyl",
      "cylindreog",
      "cyl og",
      "cylindre og",
      "cylindre_verre_gauche",
      "l_cylindre",
      "cyl_gauche",
      "cylindre_g",
      "cyl_l",
      "cylog",
      "left_cylinder",
      "cylinderLeft",
      "cyl_vl_og",
      "og_cylindre",
      "gauche_cylindre",
      "le_cyl",
      /* Almerys ROC / Wemind v3 */
      "cylOG",
      "cylindreOG",
      "CylOG",
      "CylindreOG",
      "verre_gauche_cyl",
      "vg_cyl",
      "VG_cylindre",
      "oeilGauche_cylindre",
      /* data-testid */
      "og-cylindre",
      "left-cylinder",
      "cylindre-og"
    ],
    "lunettesOG.axe": [
      "axe_og",
      "ax_og",
      "og_axe",
      "axeog",
      "axe og",
      "ax og",
      "axe_verre_gauche",
      "l_axe",
      "axe_gauche",
      "axe_g",
      "ax_l",
      "axog",
      "left_axis",
      "axisLeft",
      "axe_vl_og",
      "og_ax",
      "gauche_axe",
      "axis_og",
      "le_ax",
      /* Almerys ROC / Wemind v3 */
      "axeOG",
      "AxeOG",
      "verre_gauche_axe",
      "vg_axe",
      "VG_axe",
      "oeilGauche_axe",
      "axe_correction_og",
      /* data-testid */
      "og-axe",
      "left-axis",
      "axe-og"
    ],
    "lunettesOG.addition": [
      "addition_og",
      "add_og",
      "og_add",
      "additionog",
      "add og",
      "addition og",
      "l_addition",
      "add_gauche",
      "addition_g",
      "add_l",
      "addog",
      "left_addition",
      "addLeft",
      "add_vp_og",
      "og_addition",
      "gauche_addition",
      "le_add",
      /* Almerys ROC / Wemind v3 */
      "addOG",
      "additionOG",
      "AddOG",
      "verre_gauche_add",
      "vg_add",
      "oeilGauche_addition",
      /* data-testid */
      "og-addition",
      "left-addition",
      "addition-og"
    ],
    /* ══════════════════════════════════════════════════════════════════════
     *  CORRECTIONS LENTILLES OD
     * ══════════════════════════════════════════════════════════════════════ */
    "lentillesOD.sphere": ["sphere_lentille_od", "sph_lentille_od", "lentille_od_sphere", "lod_sph", "contact_sphere_od", "cl_sph_od"],
    "lentillesOD.cylindre": ["cylindre_lentille_od", "cyl_lentille_od", "lentille_od_cyl", "lod_cyl", "contact_cyl_od", "cl_cyl_od"],
    "lentillesOD.axe": ["axe_lentille_od", "ax_lentille_od", "lentille_od_axe", "lod_ax", "contact_axe_od", "cl_ax_od"],
    "lentillesOD.addition": ["addition_lentille_od", "add_lentille_od", "lentille_od_add", "contact_add_od", "cl_add_od"],
    "lentillesOD.rayonCourbure": ["rayon_od", "rayoncourbure_od", "bc_od", "base_curve_od", "rb_od", "rayon_courbure_od", "basecurve_od"],
    "lentillesOD.diametre": ["diametre_od", "dia_od", "diam_od", "diameter_od", "diametre_lentille_od"],
    /* ══════════════════════════════════════════════════════════════════════
     *  CORRECTIONS LENTILLES OG
     * ══════════════════════════════════════════════════════════════════════ */
    "lentillesOG.sphere": ["sphere_lentille_og", "sph_lentille_og", "lentille_og_sphere", "log_sph", "contact_sphere_og", "cl_sph_og"],
    "lentillesOG.cylindre": ["cylindre_lentille_og", "cyl_lentille_og", "lentille_og_cyl", "log_cyl", "contact_cyl_og", "cl_cyl_og"],
    "lentillesOG.axe": ["axe_lentille_og", "ax_lentille_og", "lentille_og_axe", "log_ax", "contact_axe_og", "cl_ax_og"],
    "lentillesOG.addition": ["addition_lentille_og", "add_lentille_og", "lentille_og_add", "contact_add_og", "cl_add_og"],
    "lentillesOG.rayonCourbure": ["rayon_og", "rayoncourbure_og", "bc_og", "base_curve_og", "rb_og", "rayon_courbure_og", "basecurve_og"],
    "lentillesOG.diametre": ["diametre_og", "dia_og", "diam_og", "diameter_og", "diametre_lentille_og"]
  };
  var SMART_FILL_BLACKLIST = [
    /* Champs autocomplete / recherche — gérés manuellement */
    "assureur",
    "organisme_search",
    "search",
    "recherche",
    "autocomplete",
    /* Authentification — NE JAMAIS remplir */
    "password",
    "mot_de_passe",
    "mdp",
    "passwd",
    "pwd",
    "username",
    "login",
    "identifiant",
    "user_id",
    "userid",
    /* 2FA / codes de vérification */
    "otp",
    "code_otp",
    "code_verification",
    "verification_code",
    "code_sms",
    "totp",
    "pin",
    /* Données bancaires — critique RGPD */
    "numerocartebancaire",
    "carte_bancaire",
    "numero_carte_bancaire",
    "card_number",
    "cardnumber",
    "cvv",
    "cvc",
    "cvv2",
    "expiry",
    "expiry_date",
    "card_expiry",
    "iban",
    "bic",
    "rib",
    "numiban",
    /* Champs de recherche d'adresse (Google Maps, etc.) */
    "address_search",
    "adresse_recherche",
    "code_postal_recherche",
    "ville_recherche",
    "search_address",
    /* Captcha */
    "captcha",
    "g-recaptcha",
    "recaptcha",
    "hcaptcha"
  ];
  function detectPageContext() {
    var text = (window.location.href + " " + document.title + " " + ((document.querySelector("h1,h2") || {}).textContent || "")).toLowerCase();
    if (/login|connexion|signin|mot.de.passe/.test(text)) return "login";
    if (/recherche|search/.test(text)) return "search";
    if (/beneficiaire|adherent/.test(text)) return "beneficiaire";
    if (/prise.en.charge|pec|demande/.test(text)) return "pec";
    if (/devis|cotation/.test(text)) return "devis";
    return "unknown";
  }
  function getVisibleFields() {
    var selector = "input:not([type=hidden]), select, textarea";
    var fields = Array.from(document.querySelectorAll(selector));
    var iframes = document.querySelectorAll("iframe");
    for (var i = 0; i < iframes.length; i++) {
      try {
        var iDoc = iframes[i].contentDocument || iframes[i].contentWindow && iframes[i].contentWindow.document;
        if (iDoc) fields = fields.concat(Array.from(iDoc.querySelectorAll(selector)));
      } catch (e) {
      }
    }
    return fields.filter(function(el) {
      try {
        var cs = (el.ownerDocument.defaultView || window).getComputedStyle(el);
        return cs.display !== "none" && cs.visibility !== "hidden" && cs.opacity !== "0" && !el.disabled && !el.readOnly && el.getBoundingClientRect().height > 0;
      } catch (e) {
        return false;
      }
    });
  }

  // extension-src/content/utils/field-matching.js
  var _learnedWeights = null;
  function loadLearnedWeights() {
    var hostname = window.location.hostname;
    chrome.storage.local.get(["optibot_learned_weights"], function(result) {
      var cached = result.optibot_learned_weights;
      if (cached && cached.ts && Date.now() - cached.ts < 36e5) {
        _learnedWeights = cached.weights || {};
        return;
      }
      if (typeof getSyncToken === "function") {
        getSyncToken().then(function(token) {
          if (!token) return;
          fetch("https://optibot.fr/api/extension/smart-fill/weights?hostname=" + encodeURIComponent(hostname), {
            headers: { "Authorization": "Bearer " + token }
          }).then(function(r) {
            return r.json();
          }).then(function(data) {
            _learnedWeights = data.weights || {};
            chrome.storage.local.set({ optibot_learned_weights: { weights: _learnedWeights, ts: Date.now() } });
          }).catch(function(err) {
            console.warn("[OptiBot] learned weights fetch failed:", err);
          });
        });
      }
    });
  }
  var _labelMap = null;
  function preCacheLabelMap() {
    _labelMap = {};
    var labels = document.querySelectorAll("label[for]");
    for (var i = 0; i < labels.length; i++) {
      var forId = labels[i].getAttribute("for");
      if (forId) _labelMap[forId] = labels[i].textContent.trim();
    }
  }
  var _levenshteinCache = {};
  function clearMatchingCache() {
    _levenshteinCache = {};
    _labelMap = null;
  }
  function levenshtein(a, b) {
    var key = a + "\0" + b;
    if (_levenshteinCache[key] !== void 0) return _levenshteinCache[key];
    if (!a) {
      _levenshteinCache[key] = (b || "").length;
      return _levenshteinCache[key];
    }
    if (!b) {
      _levenshteinCache[key] = a.length;
      return _levenshteinCache[key];
    }
    var m = a.length, n = b.length;
    var dp = [];
    for (var i = 0; i <= m; i++) {
      dp[i] = [i];
      for (var j = 1; j <= n; j++) {
        dp[i][j] = i === 0 ? j : 0;
      }
    }
    for (var i2 = 1; i2 <= m; i2++) {
      for (var j2 = 1; j2 <= n; j2++) {
        if (a[i2 - 1] === b[j2 - 1]) {
          dp[i2][j2] = dp[i2 - 1][j2 - 1];
        } else {
          dp[i2][j2] = 1 + Math.min(dp[i2 - 1][j2], dp[i2][j2 - 1], dp[i2 - 1][j2 - 1]);
        }
      }
    }
    _levenshteinCache[key] = dp[m][n];
    return dp[m][n];
  }
  function getFieldLabel(el) {
    if (!el) return "";
    if (_labelMap && el.id && _labelMap[el.id]) return _labelMap[el.id];
    var rootNode = el.getRootNode ? el.getRootNode() : document;
    if (el.id) {
      var lbl = rootNode.querySelector('label[for="' + el.id + '"]');
      if (lbl && lbl.textContent.trim()) return lbl.textContent.trim();
    }
    var ariaLabel = el.getAttribute("aria-label");
    if (ariaLabel) return ariaLabel.trim();
    var ariaLabelledby = el.getAttribute("aria-labelledby");
    if (ariaLabelledby) {
      var refEl = rootNode.getElementById ? rootNode.getElementById(ariaLabelledby) : document.getElementById(ariaLabelledby);
      if (refEl && refEl.textContent.trim()) return refEl.textContent.trim();
    }
    if (el.placeholder) return el.placeholder.trim();
    if (el.closest) {
      var group = el.closest(".form-group, .field, .form-field, .mat-form-field, mat-form-field");
      if (group) {
        var groupLabel = group.querySelector("label, mat-label, .mat-label, legend");
        if (groupLabel && groupLabel.textContent.trim()) return groupLabel.textContent.trim();
      }
    }
    var parent = el.parentElement;
    if (parent && parent.tagName === "TD") {
      var prevTd = parent.previousElementSibling;
      if (prevTd && prevTd.tagName === "TD" && prevTd.textContent.trim()) return prevTd.textContent.trim();
    }
    return "";
  }
  function normalizeLabel(str) {
    return (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
  }
  function normalizeAlias(str) {
    return (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[*:()\[\]{}#°'"!?]/g, "").replace(/[\s\-_\.\/]/g, "");
  }
  function scoreFieldMatch(el, aliasKey, aliases) {
    var elId = normalizeAlias(el.id || "");
    var elName = normalizeAlias(el.name || "");
    var elLabel = normalizeAlias(getFieldLabel(el));
    var elPlaceholder = normalizeAlias(el.placeholder || "");
    var elTestId = normalizeAlias(el.getAttribute("data-testid") || el.getAttribute("data-cy") || el.getAttribute("data-qa") || "");
    var maxScore = 0;
    for (var i = 0; i < aliases.length; i++) {
      var alias = normalizeAlias(aliases[i]);
      if (!alias) continue;
      if (elId && elId === alias) return 100;
      if (elName && elName === alias) {
        maxScore = Math.max(maxScore, 90);
        continue;
      }
      if (elLabel && elLabel === alias) {
        maxScore = Math.max(maxScore, 85);
        continue;
      }
      if (elTestId && elTestId === alias) {
        maxScore = Math.max(maxScore, 85);
        continue;
      }
      if (elId && elId.indexOf(alias) !== -1) {
        maxScore = Math.max(maxScore, 70);
      }
      if (elName && elName.indexOf(alias) !== -1) {
        maxScore = Math.max(maxScore, 65);
      }
      if (elLabel && elLabel.indexOf(alias) !== -1) {
        maxScore = Math.max(maxScore, 60);
      }
      if (elTestId && elTestId.indexOf(alias) !== -1) {
        maxScore = Math.max(maxScore, 60);
      }
      if (elPlaceholder && elPlaceholder.indexOf(alias) !== -1) {
        maxScore = Math.max(maxScore, 55);
      }
      if (elId && levenshtein(elId, alias) <= 2) {
        maxScore = Math.max(maxScore, 50);
      }
      if (elName && levenshtein(elName, alias) <= 2) {
        maxScore = Math.max(maxScore, 45);
      }
      if (elLabel && levenshtein(elLabel, alias) <= 2) {
        maxScore = Math.max(maxScore, 40);
      }
    }
    if (_learnedWeights && _learnedWeights[aliasKey]) {
      maxScore = Math.round(maxScore * (_learnedWeights[aliasKey].multiplier || 1));
    }
    return maxScore;
  }
  function matchSmartField(el) {
    var fcnRaw = el.getAttribute("formcontrolname") || el.getAttribute("ng-reflect-name") || el.name || "";
    if (fcnRaw && SMART_FILL_BLACKLIST.indexOf(fcnRaw.toLowerCase()) !== -1) return null;
    var attrs = [
      el.name,
      el.id,
      el.placeholder,
      el.getAttribute("aria-label"),
      el.getAttribute("data-field"),
      el.getAttribute("data-name"),
      el.getAttribute("data-label"),
      el.getAttribute("data-testid"),
      el.getAttribute("data-cy"),
      /* Angular Material / Reactive Forms */
      el.getAttribute("formcontrolname"),
      el.getAttribute("ng-reflect-name"),
      el.getAttribute("ng-reflect-placeholder"),
      el.getAttribute("data-mat-input"),
      /* Vue */
      el.getAttribute("v-model"),
      el.getAttribute(":name"),
      /* Classes CSS significatives (class*="nom", class*="prenom"...) */
      el.className
    ];
    var labelEl = el.id ? document.querySelector('label[for="' + CSS.escape(el.id) + '"]') : null;
    if (!labelEl) {
      var labelledby = el.getAttribute("aria-labelledby");
      if (labelledby) {
        var labelText = labelledby.split(/\s+/).map(function(id) {
          var ref = document.getElementById(id);
          return ref ? ref.textContent.trim() : "";
        }).filter(Boolean).join(" ");
        if (labelText) attrs.push(labelText);
      }
    }
    if (!labelEl && el.closest) {
      var matField = el.closest("mat-form-field, .mat-form-field, .mat-mdc-form-field");
      if (matField) {
        var matLabel = matField.querySelector("mat-label, label, .mat-label, .mat-mdc-floating-label");
        if (matLabel) labelEl = matLabel;
      }
    }
    if (!labelEl && el.closest) {
      labelEl = el.closest("label");
      if (!labelEl && el.parentElement) {
        labelEl = el.parentElement.querySelector("label");
      }
    }
    if (!labelEl) {
      var prev = el.previousElementSibling;
      if (prev && /^(label|span|div|p|th|td|dt|legend)$/i.test(prev.tagName) && prev.textContent.trim().length < 60) {
        attrs.push(prev.textContent.trim());
      }
    }
    if (!labelEl) {
      var td = el.closest("td");
      if (td) {
        var prevTd = td.previousElementSibling;
        if (prevTd) attrs.push(prevTd.textContent.trim());
      }
    }
    if (!labelEl && el.closest) {
      var fieldset = el.closest("fieldset");
      if (fieldset) {
        var legend = fieldset.querySelector("legend");
        if (legend) attrs.push(legend.textContent.trim());
      }
    }
    if (!labelEl) {
      var tr = el.closest && el.closest("tr");
      if (tr) {
        var th = tr.querySelector("th");
        if (th) attrs.push(th.textContent.trim());
      }
    }
    if (labelEl) attrs.push(labelEl.textContent.trim());
    var attrValues = attrs.filter(Boolean);
    var normalizedAll = attrValues.map(normalizeAlias).join(" ");
    if (!normalizedAll.trim()) return null;
    for (var field in SMART_FILL_ALIASES) {
      var aliases = SMART_FILL_ALIASES[field];
      for (var i = 0; i < aliases.length; i++) {
        var alias = normalizeAlias(aliases[i]);
        if (!alias) continue;
        var exactMatch = attrValues.some(function(a) {
          return normalizeAlias(a) === alias;
        });
        var partialMatch = false;
        if (!exactMatch) {
          var re = new RegExp("(^|[\\s_\\-])" + alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([\\s_\\-]|$)");
          partialMatch = re.test(normalizedAll);
        }
        if (exactMatch) return { field, confidence: "certain" };
        if (partialMatch) return { field, confidence: "probable" };
      }
    }
    return null;
  }

  // extension-src/content/utils/selector-cache.js
  var _selectorCache = {};
  var _selectorCacheDirty = false;
  var _selectorCacheLastSave = 0;
  function getCachedSelector(hostname, fieldName) {
    if (!_selectorCache[hostname]) return null;
    return _selectorCache[hostname][fieldName] || null;
  }
  function setCachedSelector(hostname, fieldName, selector) {
    if (!_selectorCache[hostname]) _selectorCache[hostname] = {};
    _selectorCache[hostname][fieldName] = selector;
    _selectorCacheDirty = true;
    var now = Date.now();
    if (now - _selectorCacheLastSave > 1e4) {
      saveSelectorCache();
    }
  }
  function loadSelectorCache() {
    chrome.storage.local.get(["optibot_selector_cache"], function(result) {
      _selectorCache = result.optibot_selector_cache || {};
    });
  }
  function saveSelectorCache() {
    if (!_selectorCacheDirty) return;
    _selectorCacheDirty = false;
    _selectorCacheLastSave = Date.now();
    chrome.storage.local.set({ optibot_selector_cache: _selectorCache });
  }

  // extension-src/content/utils/fill.js
  function ultraFill2(el, val, opts) {
    if (!el || val === void 0 || val === null || val === "") return;
    if (!(opts && opts.force)) {
      var existing = (el.value || "").trim();
      if (existing.length > 0) return;
    }
    el.focus();
    var proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    var nativeSetter = Object.getOwnPropertyDescriptor(proto, "value");
    if (nativeSetter && nativeSetter.set) {
      nativeSetter.set.call(el, val);
    } else {
      el.value = val;
    }
    var strVal = String(val);
    el.dispatchEvent(new Event("focus", { bubbles: true }));
    for (var i = 0; i < strVal.length; i++) {
      var ch = strVal[i];
      el.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: ch, charCode: ch.charCodeAt(0), keyCode: ch.charCodeAt(0) }));
      el.dispatchEvent(new KeyboardEvent("keypress", { bubbles: true, key: ch, charCode: ch.charCodeAt(0), keyCode: ch.charCodeAt(0) }));
      el.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, key: ch, charCode: ch.charCodeAt(0), keyCode: ch.charCodeAt(0) }));
    }
    el.dispatchEvent(new InputEvent("input", { bubbles: true, data: strVal, inputType: "insertText" }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur", { bubbles: true }));
    if (window.$ && window.$(el).trigger) {
      window.$(el).val(val).trigger("input").trigger("change").trigger("keyup");
    }
  }
  function smartSelectOption2(selectEl, targetValue) {
    if (!selectEl || selectEl.tagName !== "SELECT" || !targetValue) return false;
    var target = (targetValue + "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    var options = Array.from(selectEl.options);
    var bestScore = 0;
    var bestOption = null;
    for (var i = 0; i < options.length; i++) {
      var optText = (options[i].text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      var optVal = (options[i].value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      var score = 0;
      if (optText === target || optVal === target) {
        score = 100;
      } else if (optText.indexOf(target) !== -1 || target.indexOf(optText) !== -1) {
        score = 80;
      } else if (optVal.indexOf(target) !== -1 || target.indexOf(optVal) !== -1) {
        score = 80;
      } else {
        var dist = levenshtein(optText, target);
        if (dist <= 3) score = 60;
        else {
          dist = levenshtein(optVal, target);
          if (dist <= 3) score = 60;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestOption = options[i];
      }
      if (score === 100) break;
    }
    if (bestScore >= 40 && bestOption) {
      selectEl.value = bestOption.value;
      selectEl.dispatchEvent(new Event("change", { bubbles: true }));
      selectEl.dispatchEvent(new Event("input", { bubbles: true }));
      return true;
    }
    return false;
  }
  async function fillDatePicker(el, dateStr) {
    if (!el || !dateStr) return false;
    try {
      if (el._flatpickr && el._flatpickr.setDate) {
        el._flatpickr.setDate(dateStr, true);
        return true;
      }
    } catch (e) {
    }
    try {
      if (el._pikaday && el._pikaday.setDate) {
        var parts = dateStr.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
        if (parts) {
          el._pikaday.setDate(new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1])));
          return true;
        }
      }
    } catch (e) {
    }
    try {
      if (window.jQuery && window.jQuery(el).datepicker) {
        window.jQuery(el).datepicker("setDate", dateStr);
        return true;
      }
    } catch (e) {
    }
    try {
      var matField = el.closest && el.closest("mat-form-field, .mat-form-field, .mat-mdc-form-field");
      if (matField) {
        el.focus();
        el.click();
        el.value = "";
        el.dispatchEvent(new Event("input", { bubbles: true }));
        var chars = dateStr.replace(/\D/g, "");
        for (var ci = 0; ci < chars.length; ci++) {
          var ch = chars[ci];
          el.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: ch, code: "Digit" + ch, keyCode: 48 + parseInt(ch) }));
          el.dispatchEvent(new KeyboardEvent("keypress", { bubbles: true, key: ch, charCode: ch.charCodeAt(0) }));
          el.dispatchEvent(new InputEvent("input", { bubbles: true, data: ch, inputType: "insertText" }));
          el.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, key: ch, code: "Digit" + ch, keyCode: 48 + parseInt(ch) }));
          await new Promise(function(r) {
            setTimeout(r, 60);
          });
        }
        el.dispatchEvent(new Event("change", { bubbles: true }));
        el.dispatchEvent(new Event("blur", { bubbles: true }));
        if (el.value !== "") return true;
      }
    } catch (e) {
    }
    ultraFill2(el, dateStr);
    return (el.value || "") !== "";
  }
  function selectRadixOption2(selectName, value) {
    const hiddenSelect = document.querySelector('select[name="' + selectName + '"]');
    if (!hiddenSelect) return;
    const formField = hiddenSelect.closest(".space-y-2");
    if (!formField) return;
    const trigger = formField.querySelector('[role="combobox"]');
    if (!trigger) return;
    trigger.click();
    setTimeout(function() {
      var allOptions = document.querySelectorAll('[role="option"]');
      for (var i = 0; i < allOptions.length; i++) {
        var opt = allOptions[i];
        var optValue = opt.getAttribute("data-value") || "";
        var optText = (opt.textContent || "").trim().toLowerCase();
        if (optValue === value || optText === value) {
          opt.click();
          return;
        }
      }
      hiddenSelect.value = value;
      hiddenSelect.dispatchEvent(new Event("change", { bubbles: true }));
    }, 300);
  }
  async function smartFillField2(el, value, isDateField) {
    if (!el || value === void 0 || value === null || String(value).trim() === "") return false;
    var dateNorm = isDateField ? normalizeDateValue(value) : null;
    var displayVal = dateNorm ? dateNorm.display : String(value);
    if (el.tagName === "SELECT") {
      return smartSelectOption2(el, displayVal);
    }
    if (isDateField) {
      try {
        var dpResult = await fillDatePicker(el, displayVal);
        if (dpResult) return true;
      } catch (e) {
      }
    }
    if (el.type === "date" && dateNorm && dateNorm.iso) {
      try {
        var setter0 = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
        if (setter0 && setter0.set) setter0.set.call(el, dateNorm.iso);
        else el.value = dateNorm.iso;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        if (fieldHasValue(el, dateNorm.iso)) return true;
      } catch (e) {
      }
    }
    try {
      ultraFill2(el, displayVal);
      if (fieldHasValue(el, displayVal)) return true;
    } catch (e) {
    }
    try {
      el.setAttribute("value", displayVal);
      el.dispatchEvent(new InputEvent("input", { bubbles: true, data: displayVal, inputType: "insertText" }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      if (fieldHasValue(el, displayVal)) return true;
    } catch (e) {
    }
    try {
      el.focus();
      el.select();
      document.execCommand("selectAll", false, null);
      document.execCommand("insertText", false, displayVal);
      el.dispatchEvent(new Event("change", { bubbles: true }));
      if (fieldHasValue(el, displayVal)) return true;
    } catch (e) {
    }
    try {
      el.focus();
      var dt = new DataTransfer();
      dt.setData("text/plain", displayVal);
      var pasteEvt = new ClipboardEvent("paste", { bubbles: true, cancelable: true, clipboardData: dt });
      el.dispatchEvent(pasteEvt);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      if (fieldHasValue(el, displayVal)) return true;
    } catch (e) {
    }
    try {
      var ngCtx = el.__ngContext__ || el._elementRef && el._elementRef.nativeElement && el._elementRef.nativeElement.__ngContext__;
      if (ngCtx) {
        var dir = Array.isArray(ngCtx) ? ngCtx.find(function(c) {
          return c && c.control;
        }) : ngCtx;
        if (dir && dir.control && dir.control.setValue) {
          dir.control.setValue(isDateField ? displayVal : displayVal, { emitEvent: true });
          dir.control.markAsDirty();
          dir.control.markAsTouched();
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
          if (fieldHasValue(el, displayVal) || dir.control.value && String(dir.control.value).trim() !== "") return true;
        }
      }
    } catch (e) {
    }
    try {
      var vueInst = el.__vueParentComponent;
      if (vueInst && vueInst.props && vueInst.emit) {
        vueInst.emit("update:modelValue", displayVal);
        el.dispatchEvent(new Event("input", { bubbles: true }));
        if (fieldHasValue(el, displayVal)) return true;
      }
      var vue2 = el.__vue__;
      if (vue2 && vue2.$emit) {
        vue2.$emit("input", displayVal);
        if (fieldHasValue(el, displayVal)) return true;
      }
    } catch (e) {
    }
    try {
      if (el._flatpickr && el._flatpickr.setDate && dateNorm && dateNorm.dd) {
        el._flatpickr.setDate(dateNorm.display, true, "d/m/Y");
        if (fieldHasValue(el, dateNorm.display)) return true;
      }
    } catch (e) {
    }
    try {
      if (isDateField) {
        var shadow = el.shadowRoot || el.parentElement && el.parentElement.shadowRoot;
        var shadowInput = shadow && shadow.querySelector("input");
        if (shadowInput) {
          ultraFill2(shadowInput, displayVal);
          if (fieldHasValue(shadowInput, displayVal)) return true;
        }
      }
    } catch (e) {
    }
    if (isDateField && dateNorm && dateNorm.dd) {
      try {
        el.focus();
        el.click();
        el.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "a", ctrlKey: true }));
        el.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Delete" }));
        el.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Backspace" }));
        el.value = "";
        var dateStr = dateNorm.dd + dateNorm.mm + dateNorm.yyyy;
        for (var ci = 0; ci < dateStr.length; ci++) {
          var ch = dateStr[ci];
          el.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: ch, code: "Digit" + ch, keyCode: 48 + parseInt(ch) }));
          el.dispatchEvent(new KeyboardEvent("keypress", { bubbles: true, key: ch, code: "Digit" + ch, keyCode: 48 + parseInt(ch) }));
          el.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, key: ch, code: "Digit" + ch, keyCode: 48 + parseInt(ch) }));
        }
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        el.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Tab" }));
        await new Promise(function(r) {
          setTimeout(r, 100);
        });
        if (fieldHasValue(el, dateNorm.display) || el.value !== "") return true;
      } catch (e) {
      }
    }
    if (isDateField && dateNorm && dateNorm.dd) {
      try {
        var parent = el.parentElement || el.closest(".input-group") || el.closest(".date-field");
        var calIcon = parent && (parent.querySelector('button[class*="calendar"], button[aria-label*="date"], button[aria-label*="calendrier"], .calendar-icon, .datepicker-toggle, [class*="datepicker-btn"]') || parent.querySelector('button, [role="button"]'));
        if (calIcon) {
          calIcon.click();
          await new Promise(function(r) {
            setTimeout(r, 300);
          });
          var pickerInputs = document.querySelectorAll('.datepicker input, .calendar input, [class*="datepicker"] input, [role="dialog"] input');
          if (pickerInputs.length >= 3) {
            ultraFill2(pickerInputs[0], dateNorm.dd);
            ultraFill2(pickerInputs[1], dateNorm.mm);
            ultraFill2(pickerInputs[2], dateNorm.yyyy);
          } else if (pickerInputs.length === 1) {
            ultraFill2(pickerInputs[0], dateNorm.display);
          }
          document.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Escape" }));
          await new Promise(function(r) {
            setTimeout(r, 200);
          });
          if (el.value !== "") return true;
        }
      } catch (e) {
      }
    }
    if (el.tagName === "SELECT") {
      try {
        if (smartSelectOption2(el, displayVal)) return true;
      } catch (e) {
      }
    }
    try {
      if (el.getAttribute("contenteditable") === "true" || el.contentEditable === "true") {
        el.focus();
        el.textContent = displayVal;
        el.dispatchEvent(new InputEvent("input", { bubbles: true, data: displayVal, inputType: "insertText" }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        el.dispatchEvent(new Event("blur", { bubbles: true }));
        if (el.textContent.trim() !== "") return true;
      }
    } catch (e) {
    }
    try {
      var fiberKey = Object.keys(el).find(function(k) {
        return k.startsWith("__reactFiber") || k.startsWith("__reactInternalInstance");
      });
      var propsKey = Object.keys(el).find(function(k) {
        return k.startsWith("__reactProps");
      });
      if (propsKey && el[propsKey]) {
        var props = el[propsKey];
        if (typeof props.onChange === "function") {
          var ns = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
          if (ns && ns.set) ns.set.call(el, displayVal);
          else el.value = displayVal;
          props.onChange({ target: el, currentTarget: el, bubbles: true, type: "change" });
          if (fieldHasValue(el, displayVal)) return true;
        }
      }
    } catch (e) {
    }
    try {
      if (el.__svelte_meta || el.$$) {
        var svelteNs = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
        if (svelteNs && svelteNs.set) svelteNs.set.call(el, displayVal);
        else el.value = displayVal;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        if (fieldHasValue(el, displayVal)) return true;
      }
    } catch (e) {
    }
    try {
      el.value = displayVal;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      el.dispatchEvent(new Event("blur", { bubbles: true }));
      return fieldHasValue(el, displayVal);
    } catch (e) {
    }
    return false;
  }

  // extension-src/content/smart-fill/learning.js
  function markFilledByOptiBot2(el, variable) {
    el.setAttribute("data-optibot-filled", variable);
    el.setAttribute("data-optibot-value", el.value);
  }
  async function sendLearningSignal(signal) {
    var syncToken = await getSyncToken();
    if (!syncToken) return;
    fetch("https://optibot.fr/api/extension/smart-fill/learn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ syncToken, hostname: signal.hostname, selector: signal.selector, label: signal.label, oldVariable: signal.oldVariable, correctVariable: signal.correctVariable })
    }).catch(function(err) {
      console.warn("[OptiBot] learning signal failed:", err);
    });
  }

  // extension-src/content/smart-fill/index.js
  var showRPAToast2 = function() {
    return globalThis.showRPAToast ? globalThis.showRPAToast.apply(null, arguments) : void 0;
  };
  var checkDroitsMutuelle = function(d) {
    return globalThis.checkDroitsMutuelle ? globalThis.checkDroitsMutuelle(d) : void 0;
  };
  var _performingSmartFill = false;
  async function performSmartFill2() {
    if (_performingSmartFill) return;
    _performingSmartFill = true;
    try {
      var fillData = await getSmartFillData();
      if (!fillData.nom && !fillData.numeroSecuriteSociale && !fillData.numeroAdherent) {
        showRPAToast2("Aucune donn\xE9e patient en m\xE9moire. Scannez d'abord une ordonnance.", "error");
        return;
      }
      if (detectPageContext() === "login") return;
      checkDroitsMutuelle(fillData);
      var INPUT_SELECTOR = "input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=checkbox]):not([type=radio]):not([type=file]):not([readonly]), select:not([disabled]), textarea:not([readonly])";
      var inputList = querySelectorAllDeep(INPUT_SELECTOR);
      var filled = 0;
      var probable = 0;
      var fillReport = { ts: Date.now(), hostname: window.location.hostname, filled: [], warned: [], skipped: [], failed: [] };
      var currentHostname = window.location.hostname;
      if (typeof clearMatchingCache === "function") clearMatchingCache();
      if (typeof preCacheLabelMap === "function") preCacheLabelMap();
      if (typeof loadLearnedWeights === "function") loadLearnedWeights();
      var settings = await new Promise(function(r) {
        chrome.storage.local.get(["optibot_settings"], function(res) {
          r(res.optibot_settings || {});
        });
      });
      var previewEnabled = settings.previewBeforeFill || false;
      if (inputList.length > 100) {
        var scanToast = document.createElement("div");
        scanToast.id = "optibot-scan-progress";
        scanToast.textContent = "Scan en cours\u2026 (" + inputList.length + " champs)";
        scanToast.style.cssText = "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:2147483647;background:#1e293b;color:white;padding:8px 16px;border-radius:8px;font:500 12px/1.4 -apple-system,BlinkMacSystemFont,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,.15);opacity:0;transition:opacity .3s;";
        document.body.appendChild(scanToast);
        requestAnimationFrame(function() {
          scanToast.style.opacity = "1";
        });
      }
      var CHUNK_SIZE = 40;
      var scanStart = performance.now();
      var fillPlan = [];
      for (var chunkStart = 0; chunkStart < inputList.length; chunkStart += CHUNK_SIZE) {
        var chunkEnd = Math.min(chunkStart + CHUNK_SIZE, inputList.length);
        for (var idx = chunkStart; idx < chunkEnd; idx++) {
          var el = inputList[idx];
          var elSelector = el.id ? "#" + CSS.escape(el.id) : el.name ? '[name="' + el.name + '"]' : null;
          var cachedField = null;
          if (elSelector) {
            for (var cfKey in SMART_FILL_ALIASES) {
              var cached = getCachedSelector(currentHostname, cfKey);
              if (cached && cached === elSelector) {
                cachedField = cfKey;
                break;
              }
            }
          }
          var bestField = cachedField;
          var bestScore = cachedField ? 95 : 0;
          if (!cachedField) {
            for (var field in SMART_FILL_ALIASES) {
              var score = scoreFieldMatch(el, field, SMART_FILL_ALIASES[field]);
              if (score > bestScore) {
                bestScore = score;
                bestField = field;
              }
            }
            if (bestScore < 50) {
              var legacyMatch = matchSmartField(el);
              if (legacyMatch) {
                bestField = legacyMatch.field;
                bestScore = legacyMatch.confidence === "certain" ? 85 : 60;
              }
            }
          }
          if (!bestField) continue;
          if (elSelector && bestScore >= 50) {
            setCachedSelector(currentHostname, bestField, elSelector);
          }
          var value = fillData[bestField];
          if (!value) {
            fillReport.failed.push({ label: normalizeLabel(getFieldLabel(el)), variable: bestField, confidence: bestScore, signals: { cached: !!cachedField, idMatch: el.id && normalizeAlias(el.id).indexOf(normalizeAlias(bestField)) !== -1, nameMatch: el.name && normalizeAlias(el.name).indexOf(normalizeAlias(bestField)) !== -1, labelMatch: !!getFieldLabel(el) } });
            continue;
          }
          if (bestScore < 50) {
            fillReport.skipped.push({ label: normalizeLabel(getFieldLabel(el)), variable: bestField, confidence: bestScore, reason: "score_trop_faible" });
            continue;
          }
          var fcnRaw = el.getAttribute("formcontrolname") || el.getAttribute("ng-reflect-name") || el.name || "";
          if (fcnRaw && SMART_FILL_BLACKLIST.indexOf(fcnRaw.toLowerCase()) !== -1) continue;
          var existingVal = (el.value || "").trim();
          if (existingVal && !el.getAttribute("data-optibot-filled")) {
            fillReport.skipped.push({ label: normalizeLabel(getFieldLabel(el)), variable: bestField, confidence: bestScore, reason: "deja_rempli" });
            continue;
          }
          if (VALUE_NORMALIZERS[bestField]) {
            value = VALUE_NORMALIZERS[bestField](value, el);
          }
          if (OPTICAL_FIELD_KEYS.indexOf(bestField) !== -1) {
            value = formatOpticalValue(value, el);
          }
          fillPlan.push({ el, field: bestField, value, score: bestScore, cachedField, label: normalizeLabel(getFieldLabel(el)) });
        }
        if (chunkEnd < inputList.length) {
          await new Promise(function(r) {
            setTimeout(r, 0);
          });
        }
      }
      var scanDuration = Math.round(performance.now() - scanStart);
      fillReport.scanDuration = scanDuration;
      fillReport.totalFields = inputList.length;
      var existingToast = document.getElementById("optibot-scan-progress");
      if (existingToast) existingToast.remove();
      if (scanDuration > 500) {
        console.info("[OptiBot] Smart Fill scan: " + inputList.length + " fields in " + scanDuration + "ms");
      }
      if (scanDuration > 1e3) {
        var resultToast = document.createElement("div");
        resultToast.id = "optibot-scan-progress";
        resultToast.textContent = "Scan termin\xE9 \u2014 " + inputList.length + " champs en " + (scanDuration / 1e3).toFixed(1) + "s";
        resultToast.style.cssText = "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:2147483647;background:#1e293b;color:white;padding:8px 16px;border-radius:8px;font:500 12px/1.4 -apple-system,BlinkMacSystemFont,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,.15);opacity:0;transition:opacity .3s;";
        document.body.appendChild(resultToast);
        requestAnimationFrame(function() {
          resultToast.style.opacity = "1";
        });
        setTimeout(function() {
          resultToast.style.opacity = "0";
          setTimeout(function() {
            resultToast.remove();
          }, 300);
        }, 3e3);
      }
      async function executeFill() {
        for (var pi = 0; pi < fillPlan.length; pi++) {
          var item = fillPlan[pi];
          var el2 = item.el;
          var bestField2 = item.field;
          var value2 = item.value;
          var bestScore2 = item.score;
          var cachedField2 = item.cachedField;
          if (bestField2 === "telephone") {
            try {
              var itiInstance = window.intlTelInputGlobals && window.intlTelInputGlobals.getInstance ? window.intlTelInputGlobals.getInstance(el2) : el2._itiInstance || null;
              if (itiInstance && itiInstance.setNumber) {
                itiInstance.setNumber(value2);
                filled++;
                markFilledByOptiBot2(el2, bestField2);
                if (bestScore2 < 80) {
                  el2.setAttribute("data-optibot-confidence", bestScore2);
                  el2.setAttribute("data-optibot-warned", "true");
                  el2.style.backgroundColor = "#fef9c3";
                  el2.style.outline = "2px solid #eab308";
                  el2.title = "OptiBot \u2014 confiance " + bestScore2 + "% (" + bestField2 + ") \u2014 v\xE9rifiez";
                  probable++;
                  fillReport.warned.push({ label: normalizeLabel(getFieldLabel(el2)), variable: bestField2, confidence: bestScore2, signals: { cached: !!cachedField2, idMatch: el2.id && normalizeAlias(el2.id).indexOf(normalizeAlias(bestField2)) !== -1, nameMatch: el2.name && normalizeAlias(el2.name).indexOf(normalizeAlias(bestField2)) !== -1, labelMatch: !!getFieldLabel(el2) } });
                } else {
                  fillReport.filled.push({ label: normalizeLabel(getFieldLabel(el2)), variable: bestField2, confidence: bestScore2, signals: { cached: !!cachedField2, idMatch: el2.id && normalizeAlias(el2.id).indexOf(normalizeAlias(bestField2)) !== -1, nameMatch: el2.name && normalizeAlias(el2.name).indexOf(normalizeAlias(bestField2)) !== -1, labelMatch: !!getFieldLabel(el2) } });
                }
                continue;
              }
            } catch (e) {
            }
          }
          var isDateField = ["dateNaissance", "dateNaissancePatient", "dateOrdonnance", "dateValidite", "dateDebutValidite", "dateFinValidite", "dateNaissanceAssure"].indexOf(bestField2) !== -1 || el2.type === "date";
          var ok = await smartFillField2(el2, value2, isDateField);
          if (!ok) {
            fillReport.failed.push({ label: normalizeLabel(getFieldLabel(el2)), variable: bestField2, confidence: bestScore2, signals: { cached: !!cachedField2, idMatch: el2.id && normalizeAlias(el2.id).indexOf(normalizeAlias(bestField2)) !== -1, nameMatch: el2.name && normalizeAlias(el2.name).indexOf(normalizeAlias(bestField2)) !== -1, labelMatch: !!getFieldLabel(el2) } });
            continue;
          }
          filled++;
          markFilledByOptiBot2(el2, bestField2);
          if (bestScore2 >= 50 && bestScore2 < 80) {
            el2.setAttribute("data-optibot-confidence", bestScore2);
            el2.setAttribute("data-optibot-warned", "true");
            el2.style.backgroundColor = "#fef9c3";
            el2.style.outline = "2px solid #eab308";
            el2.title = "OptiBot \u2014 confiance " + bestScore2 + "% (" + bestField2 + ") \u2014 v\xE9rifiez";
            probable++;
            fillReport.warned.push({ label: normalizeLabel(getFieldLabel(el2)), variable: bestField2, confidence: bestScore2, signals: { cached: !!cachedField2, idMatch: el2.id && normalizeAlias(el2.id).indexOf(normalizeAlias(bestField2)) !== -1, nameMatch: el2.name && normalizeAlias(el2.name).indexOf(normalizeAlias(bestField2)) !== -1, labelMatch: !!getFieldLabel(el2) } });
          } else {
            fillReport.filled.push({ label: normalizeLabel(getFieldLabel(el2)), variable: bestField2, confidence: bestScore2, signals: { cached: !!cachedField2, idMatch: el2.id && normalizeAlias(el2.id).indexOf(normalizeAlias(bestField2)) !== -1, nameMatch: el2.name && normalizeAlias(el2.name).indexOf(normalizeAlias(bestField2)) !== -1, labelMatch: !!getFieldLabel(el2) } });
          }
        }
        var typePrescription = fillData["typePrescription"] || "";
        if (typePrescription) {
          var isLentilles = typePrescription.toLowerCase().indexOf("lentille") !== -1;
          var allRadios = querySelectorAllDeep('input[type="radio"]:not([disabled])');
          allRadios.forEach(function(radio) {
            var label = "";
            var labelEl = radio.id ? (radio.getRootNode ? radio.getRootNode() : document).querySelector('label[for="' + radio.id + '"]') : null;
            if (!labelEl && radio.closest) labelEl = radio.closest("label");
            if (labelEl) label = labelEl.textContent.toLowerCase();
            else label = (radio.value || radio.getAttribute("aria-label") || "").toLowerCase();
            var isLentilleRadio = label.indexOf("lentille") !== -1;
            var isLunetteRadio = label.indexOf("lunette") !== -1 || label.indexOf("verre") !== -1;
            if (isLentilles && isLentilleRadio || !isLentilles && isLunetteRadio) {
              if (!radio.checked) {
                radio.click();
                radio.dispatchEvent(new Event("change", { bubbles: true }));
                filled++;
              }
            }
          });
        }
        chrome.storage.local.set({ optibot_last_fill_report: fillReport });
        if (filled > 0) {
          getSyncToken().then(function(syncToken) {
            if (!syncToken) return;
            fetch("https://optibot.fr/api/extension/log-injection", {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": "Bearer " + syncToken },
              body: JSON.stringify({
                syncToken,
                site: window.location.hostname,
                success: true,
                fieldsCount: filled,
                mode: "smartfill",
                ts: Date.now()
              })
            }).catch(function(err) {
              console.warn("[OptiBot] log-injection failed:", err);
            });
          });
        }
        if (typeof trackFillResult === "function") {
          var currentHost = window.location.hostname;
          for (var fi = 0; fi < fillReport.filled.length; fi++) trackFillResult(currentHost, fillReport.filled[fi].variable, true);
          for (var si = 0; si < fillReport.skipped.length; si++) trackFillResult(currentHost, fillReport.skipped[si].variable || "unknown", false);
          for (var fai = 0; fai < fillReport.failed.length; fai++) trackFillResult(currentHost, fillReport.failed[fai].variable, false);
          checkAndRepairSelectors(currentHost);
        }
        if (typeof predictRejectionRisk === "function") {
          var prediction = predictRejectionRisk(fillReport, window.location.hostname);
          if (prediction) {
            fillReport.rejectionRisk = prediction;
            showRejectionRiskBanner(prediction);
          }
        }
        if (filled === 0) {
          showRPAToast2("Aucun champ reconnu sur cette page.", "error");
        } else {
          var msg = filled + " champ" + (filled > 1 ? "s" : "") + " rempli" + (filled > 1 ? "s" : "");
          if (probable > 0) msg += " \xB7 " + probable + " \xE0 v\xE9rifier (jaune)";
          showRPAToast2("\u2705 " + msg, "success");
        }
        _performingSmartFill = false;
      }
      if (previewEnabled && fillPlan.length > 5) {
        showFillPreview(fillPlan, executeFill, function() {
          _performingSmartFill = false;
        });
      } else {
        await executeFill();
      }
    } finally {
      _performingSmartFill = false;
    }
  }
  function showFillPreview(items, onConfirm, onCancel) {
    var overlay = document.createElement("div");
    overlay.id = "optibot-fill-preview";
    overlay.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;z-index:2147483646;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,sans-serif;";
    var panel = document.createElement("div");
    panel.style.cssText = "background:white;border-radius:16px;padding:24px;max-width:480px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);";
    var title = document.createElement("div");
    title.style.cssText = "font-size:16px;font-weight:700;color:#111;margin-bottom:16px;";
    title.textContent = "OptiBot \u2014 Apercu du remplissage (" + items.length + " champs)";
    panel.appendChild(title);
    var list = document.createElement("div");
    list.style.cssText = "max-height:50vh;overflow-y:auto;";
    for (var i = 0; i < items.length && i < 30; i++) {
      var row = document.createElement("div");
      row.style.cssText = "display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #f3f4f6;font-size:13px;";
      var fieldName = document.createElement("span");
      fieldName.style.cssText = "color:#6b7280;flex-shrink:0;width:40%;";
      fieldName.textContent = items[i].label || items[i].field;
      var fieldValue = document.createElement("span");
      fieldValue.style.cssText = "color:#111;font-weight:500;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:55%;";
      fieldValue.textContent = (items[i].value || "").substring(0, 40);
      row.appendChild(fieldName);
      row.appendChild(fieldValue);
      list.appendChild(row);
    }
    if (items.length > 30) {
      var more = document.createElement("div");
      more.style.cssText = "text-align:center;color:#9ca3af;font-size:12px;padding:8px;";
      more.textContent = "+" + (items.length - 30) + " champs supplementaires";
      list.appendChild(more);
    }
    panel.appendChild(list);
    var btnRow = document.createElement("div");
    btnRow.style.cssText = "display:flex;gap:12px;margin-top:16px;";
    var cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Annuler";
    cancelBtn.style.cssText = "flex:1;padding:10px;border:1px solid #d1d5db;border-radius:8px;background:white;color:#374151;cursor:pointer;font-size:13px;font-weight:600;";
    cancelBtn.onclick = function() {
      overlay.remove();
      if (onCancel) onCancel();
    };
    var confirmBtn = document.createElement("button");
    confirmBtn.textContent = "Remplir " + items.length + " champs";
    confirmBtn.style.cssText = "flex:1;padding:10px;border:none;border-radius:8px;background:#2563eb;color:white;cursor:pointer;font-size:13px;font-weight:700;";
    confirmBtn.onclick = function() {
      overlay.remove();
      if (onConfirm) onConfirm();
    };
    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(confirmBtn);
    panel.appendChild(btnRow);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
  }

  // extension-src/content/standard-fill/index.js
  async function performFill() {
    let data = {};
    try {
      const text = await navigator.clipboard.readText();
      data = JSON.parse(text);
      if (data.m || data.o) {
        const nom = (data.m?.nom || data.o?.nomPatient || "").toUpperCase();
        if (nom) {
          writeEncryptedCache({
            current: {
              ...data.m,
              ordonnance: data.o || {},
              updatedAt: Date.now()
            }
          });
        }
      }
    } catch (e) {
    }
    var frames = document.querySelectorAll("iframe");
    for (var fi = 0; fi < frames.length; fi++) {
      try {
        if (frames[fi].src) {
          var frameOrigin = new URL(frames[fi].src).origin;
          frames[fi].contentWindow.postMessage({ type: "OPTIBOT_FILL_FRAME", payload: data }, frameOrigin);
        }
      } catch (e) {
      }
    }
    const currentSite = Object.values(CONFIGS).find((cfg) => cfg.isMatch());
    if (!currentSite) return;
    data.cached = await getCachedClient(data);
    checkDroitsMutuelle2(data);
    const success = currentSite.actions.formulaire(data);
    const site = currentSite.name;
    const fieldsCount = Object.keys(data.cached || data.m || {}).length;
    chrome.storage.local.get(["optibot_injection_log"], (logResult) => {
      const log = logResult.optibot_injection_log || [];
      log.unshift({
        ts: Date.now(),
        site,
        success,
        fieldsCount,
        syncToken: data.syncToken || null
      });
      chrome.storage.local.set({ optibot_injection_log: log.slice(0, 100) });
    });
    var extVersion = typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getManifest ? chrome.runtime.getManifest().version : "bookmarklet";
    var pingPayloads = [];
    const syncToken = data.syncToken || null;
    if (syncToken && success !== void 0) {
      pingPayloads.push({ url: "https://optibot.fr/api/extension/log-injection", body: { syncToken, site, success, fieldsCount, ts: Date.now() } });
    }
    pingPayloads.push({ url: "https://optibot.fr/api/bookmarklet/ping", body: {
      version: extVersion,
      portal: site || "unknown",
      status: success ? "ok" : fieldsCount === 0 ? "broken" : "partial",
      errorHint: success ? null : "fields=" + fieldsCount
    } });
    try {
      chrome.runtime.sendMessage({ type: "OPTIBOT_PING", payloads: pingPayloads });
    } catch (e) {
    }
    if (success) {
      const btn = document.getElementById("optibot-fill-btn");
      if (btn) {
        btn.innerText = `\u2713 Rempli !`;
        btn.style.background = "#10b981";
        setTimeout(() => {
          btn.innerText = "\u{1F916} Remplir";
          btn.style.background = "#2563eb";
        }, 2e3);
      }
    } else {
      alert(`OptiBot : Aucun formulaire d\xE9tect\xE9.`);
    }
  }
  function checkDroitsMutuelle2(data) {
    var m = data.m || data || {};
    var dateFin = m.dateFinValidite || "";
    var dateDebut = m.dateDebutValidite || "";
    var today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    if (dateFin) {
      var parts = dateFin.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
      if (parts) {
        var finDate = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]));
        if (finDate < today) {
          showRPAToast("\u26D4 Droits mutuelle expir\xE9s depuis le " + dateFin, "error");
          return;
        }
        var diffDays = Math.ceil((finDate - today) / (1e3 * 60 * 60 * 24));
        if (diffDays <= 30) {
          showRPAToast("\u26A0\uFE0F Droits mutuelle expirent dans " + diffDays + " jour" + (diffDays > 1 ? "s" : "") + " (" + dateFin + ")", "warning");
          return;
        }
      }
    }
    if (dateDebut) {
      var partsD = dateDebut.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
      if (partsD) {
        var debutDate = new Date(parseInt(partsD[3]), parseInt(partsD[2]) - 1, parseInt(partsD[1]));
        if (debutDate > today) {
          showRPAToast("\u26A0\uFE0F Droits mutuelle pas encore actifs (d\xE9but : " + dateDebut + ")", "warning");
        }
      }
    }
  }

  // extension-src/content/replay/index.js
  function formatNSS(rawNSS, el) {
    if (!rawNSS) return rawNSS;
    var digits = rawNSS.replace(/\D/g, "");
    var maxLen = el ? parseInt(el.getAttribute("maxlength") || "0") : 0;
    var placeholder = el ? el.placeholder || "" : "";
    var name = el ? el.name || "" : "";
    if (maxLen === 13 || name.indexOf("13") !== -1 || placeholder.match(/\d{13}$/)) {
      return digits.slice(0, 13);
    }
    if (maxLen === 2 && (name.indexOf("cle") !== -1 || name.indexOf("key") !== -1)) {
      return digits.slice(13, 15);
    }
    if (placeholder.match(/\d\s\d/) || maxLen > 15) {
      if (digits.length >= 15) {
        return digits[0] + " " + digits.slice(1, 3) + " " + digits.slice(3, 5) + " " + digits.slice(5, 7) + " " + digits.slice(7, 10) + " " + digits.slice(10, 13) + " " + digits.slice(13, 15);
      }
    }
    return digits.slice(0, 15);
  }
  function resolveVariables(template, cache, el) {
    if (!template) return "";
    var m = cache.current || {};
    var o = m.ordonnance || {};
    var od = o.lunettesOD || {};
    var og = o.lunettesOG || {};
    var p0 = m.personnes && m.personnes[0] || {};
    var pres = m.prescription || {};
    var regimes = m.regimes || {};
    var rc1 = regimes.rc1 || {};
    var lod = o.lentillesOD || {};
    var log = o.lentillesOG || {};
    var nssRaw = m.numeroSecuriteSociale || m.nss || "";
    var nssFormatted = template === "{{nss}}" ? formatNSS(nssRaw, el) : nssRaw;
    var vars = {
      /* Patient */
      "{{nom}}": (m.nom || p0.nom || "").toUpperCase(),
      "{{prenom}}": m.prenom || p0.prenom || "",
      "{{nss}}": nssFormatted,
      "{{dateNaissance}}": m.dateNaissance || m.dob || "",
      /* Contact */
      "{{telephone}}": m.phone || m.telephone || "",
      "{{email}}": m.email || "",
      "{{adresse}}": m.address || m.adresse || "",
      "{{codePostal}}": m.zipCode || m.codePostal || "",
      "{{ville}}": m.city || m.ville || "",
      /* Mutuelle */
      "{{organisme}}": m.organisme || rc1.nom || "",
      "{{numeroAdherent}}": m.numeroAdherent || rc1.numeroAdherent || "",
      "{{numeroAMC}}": m.numeroAMC || "",
      "{{numeroTeletransmission}}": m.numeroTeletransmission || rc1.numeroTeletransmission || "",
      "{{critereSecondaire}}": m.critereSecondaire || rc1.critereSecondaire || "",
      "{{codeConvention}}": m.codeConvention || rc1.codeConvention || "",
      "{{dateDebutValidite}}": m.dateDebutValidite || rc1.dateDebut || "",
      "{{dateFinValidite}}": m.dateFinValidite || rc1.dateFin || "",
      /* Prescription */
      "{{dateOrdonnance}}": o.dateOrdonnance || pres.datePrescription || "",
      "{{nomOphtalmologue}}": o.nomOphtalmologue || pres.prescripteur || "",
      "{{rpps}}": o.rpps || pres.rpps || "",
      "{{distancePupillaire}}": o.distancePupillaire || "",
      "{{typePrescription}}": o.typePrescription || pres.typeVision || "",
      /* Lunettes OD */
      "{{sphere_od}}": od.sphere || "",
      "{{cylindre_od}}": od.cylindre || "",
      "{{axe_od}}": od.axe || "",
      "{{addition_od}}": od.addition || "",
      /* Lunettes OG */
      "{{sphere_og}}": og.sphere || "",
      "{{cylindre_og}}": og.cylindre || "",
      "{{axe_og}}": og.axe || "",
      "{{addition_og}}": og.addition || "",
      /* Addition générique */
      "{{addition}}": od.addition || og.addition || "",
      /* Lentilles OD */
      "{{sphere_lentille_od}}": lod.sphere || "",
      "{{cylindre_lentille_od}}": lod.cylindre || "",
      "{{axe_lentille_od}}": lod.axe || "",
      "{{addition_lentille_od}}": lod.addition || "",
      "{{rayon_od}}": lod.rayonCourbure || "",
      "{{diametre_od}}": lod.diametre || "",
      /* Lentilles OG */
      "{{sphere_lentille_og}}": log.sphere || "",
      "{{cylindre_lentille_og}}": log.cylindre || "",
      "{{axe_lentille_og}}": log.axe || "",
      "{{addition_lentille_og}}": log.addition || "",
      "{{rayon_og}}": log.rayonCourbure || "",
      "{{diametre_og}}": log.diametre || ""
    };
    var result = template;
    for (var key in vars) {
      result = result.split(key).join(vars[key]);
    }
    if (result === "" || result === template) return "";
    return result;
  }
  function scrollIntoViewIfNeeded(el) {
    if (!el) return;
    var rect = el.getBoundingClientRect();
    var inView = rect.top >= 0 && rect.bottom <= window.innerHeight && rect.left >= 0 && rect.right <= window.innerWidth;
    if (!inView) {
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }
  }
  function isDateVariable(variable) {
    if (!variable) return false;
    return variable.indexOf("date") !== -1 || variable.indexOf("Date") !== -1 || variable.indexOf("naissance") !== -1 || variable.indexOf("Naissance") !== -1;
  }
  function frameworkDelay(ms) {
    return new Promise(function(r) {
      setTimeout(r, ms || 150);
    });
  }
  var _progressOverlay = null;
  function showProgressOverlay(current, total, label) {
    if (!_progressOverlay) {
      _progressOverlay = document.createElement("div");
      _progressOverlay.id = "optibot-replay-progress";
      _progressOverlay.style.cssText = "position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:2147483647;background:white;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.15);padding:12px 20px;font-family:sans-serif;min-width:280px;";
      document.body.appendChild(_progressOverlay);
    }
    var pct = Math.round(current / total * 100);
    _progressOverlay.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;"><span style="font-size:12px;font-weight:600;color:#374151;">\u2699\uFE0F RPA en cours</span><span style="font-size:11px;color:#6b7280;">' + current + "/" + total + '</span></div><div style="height:4px;background:#e5e7eb;border-radius:2px;overflow:hidden;"><div style="height:100%;background:#3b82f6;border-radius:2px;width:' + pct + '%;transition:width 0.3s;"></div></div><div style="font-size:11px;color:#9ca3af;margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + (label || "") + "</div>";
  }
  function hideProgressOverlay() {
    if (_progressOverlay) {
      _progressOverlay.remove();
      _progressOverlay = null;
    }
  }
  function showProgressSuccess(filled, elapsed) {
    if (_progressOverlay) {
      _progressOverlay.innerHTML = '<div style="text-align:center;padding:4px 0;"><div style="font-size:14px;font-weight:600;color:#10b981;">\u2705 Termin\xE9</div><div style="font-size:12px;color:#6b7280;margin-top:4px;">' + filled + " champs remplis en " + elapsed + "s</div></div>";
      setTimeout(hideProgressOverlay, 4e3);
    }
  }
  async function runStep(etape, cache) {
    var timeout = etape.timeout || 5e3;
    var selectors = Array.isArray(etape.selectors) ? etape.selectors : etape.selector ? [etape.selector] : [];
    if (etape.action === "wait") {
      var elW = await findElementBySelectors(selectors, timeout);
      return elW !== null;
    }
    var el = await findElementBySelectors(selectors, timeout);
    if (!el) return false;
    var value = etape.variable ? resolveVariables(etape.variable, cache, el) : null;
    scrollIntoViewIfNeeded(el);
    await frameworkDelay(50);
    var prevOutline = el.style.outline;
    el.style.outline = "2px solid #3b82f6";
    if (etape.action === "fill") {
      var isDate = isDateVariable(etape.variable);
      var filled = await smartFillField(el, value, isDate);
      if (!filled) {
        ultraFill(el, value, { force: true });
      }
      var varKey = (etape.variable || "").replace(/\{|\}/g, "") || etape.label || "";
      markFilledByOptiBot(el, varKey);
      await frameworkDelay(80);
    } else if (etape.action === "click") {
      el.click();
      await frameworkDelay(150);
    } else if (etape.action === "select") {
      var selected = smartSelectOption(el, value);
      if (!selected) {
        el.value = value;
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }
      var varKeyS = (etape.variable || "").replace(/\{|\}/g, "") || etape.label || "";
      markFilledByOptiBot(el, varKeyS);
      await frameworkDelay(80);
    }
    setTimeout(function() {
      el.style.outline = prevOutline;
    }, 500);
    if (etape.waitFor) {
      var next = await waitForElement(etape.waitFor, timeout);
      return next !== null;
    }
    return true;
  }
  async function runStepWithRetry(etape, cache, maxRetries) {
    maxRetries = maxRetries || 3;
    for (var attempt = 0; attempt <= maxRetries; attempt++) {
      var ok = await runStep(etape, cache);
      if (ok) return true;
      if (attempt < maxRetries) {
        await frameworkDelay(800 * Math.pow(2, attempt));
      }
    }
    return false;
  }
  var replayState = null;
  window.addEventListener("pagehide", function() {
    replayState = null;
    hideProgressOverlay();
  });
  async function startReplay(parcours, cache) {
    var etapes = parcours.etapes || [];
    var total = etapes.length;
    var startTime = Date.now();
    replayState = { parcours, currentIndex: 0, paused: false, cache, failCount: 0 };
    showProgressOverlay(0, total, "D\xE9marrage\u2026");
    logRPA(parcours.hostname || "parcours", "replay_start", "succes");
    for (var i = 0; i < etapes.length; i++) {
      if (replayState && replayState.paused) {
        await new Promise(function(resolve) {
          replayState.onResume = resolve;
        });
      }
      if (!replayState) {
        hideProgressOverlay();
        return;
      }
      replayState.currentIndex = i;
      var etape = etapes[i];
      showProgressOverlay(i + 1, total, etape.label || etape.action);
      var ok = await runStepWithRetry(etape, cache, 3);
      if (!ok) {
        replayState.paused = true;
        replayState.failCount = (replayState.failCount || 0) + 1;
        showRPAToast("\u26A0\uFE0F RPA bloqu\xE9 \xE9tape " + (i + 1) + " \u2014 " + etape.label + " non trouv\xE9\nRemplissez manuellement puis cliquez \u25B6 Reprendre", "error");
        logRPA(parcours.hostname || "parcours", "step" + (i + 1) + "_" + (etape.action || "unknown"), "echec", etape.label + " non trouve");
        showReplayControls();
        if (replayState.failCount >= 2) {
          sendHealthPing(parcours.hostname, "broken", "replay_fail_step_" + (i + 1));
        }
        await new Promise(function(resolve) {
          replayState.onResume = resolve;
        });
        replayState.paused = false;
      } else {
        replayState.failCount = 0;
      }
    }
    var elapsed = Math.round((Date.now() - startTime) / 1e3);
    var filled = etapes.filter(function(e) {
      return e.action === "fill";
    }).length;
    showProgressSuccess(filled, elapsed);
    showRPAToast("\u2705 Parcours termin\xE9 \u2014 " + filled + " champs remplis en " + elapsed + "s", "success");
    logRPA(parcours.hostname || "parcours", "replay_complete", "succes", filled + " champs en " + elapsed + "s");
    getSyncToken().then(function(syncToken) {
      if (syncToken) {
        fetch("https://optibot.fr/api/extension/log-injection", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ syncToken, site: parcours.hostname, success: true, fieldsCount: filled, ts: Date.now() })
        }).catch(function(err) {
          console.warn("[OptiBot] log-injection failed:", err);
        });
      }
    });
    replayState = null;
  }
  async function tryDynamicReplay() {
    var hostname = window.location.hostname.replace("www.", "");
    var syncToken = await getSyncToken();
    if (!syncToken) return false;
    try {
      var res = await fetch("https://optibot.fr/api/extension/parcours?hostname=" + encodeURIComponent(hostname), { headers: { "Authorization": "Bearer " + syncToken } });
      if (!res.ok) return false;
      var data = await res.json();
      if (!data.parcours || data.parcours.length === 0) return false;
      var parcours = data.parcours[0];
      var cache = await readEncryptedCache() || {};
      startReplay(parcours, cache);
      return true;
    } catch (e) {
      return false;
    }
  }

  // extension-src/content/rpa/index.js
  function checkAndStartRPA() {
    var currentHostname = window.location.hostname;
    chrome.storage.local.get(["optibot_auth", "optibot_rpa"], function(result) {
      var auth = result.optibot_auth || {};
      if (auth.rpaEnabled === false) {
        showRPAToast("RPA disponible \xE0 partir du plan Pro", "info");
        return;
      }
      var rpa = result.optibot_rpa;
      if (!rpa || !rpa.target) return;
      var rpaHostname = rpa.targetHostname || "";
      var targetMatchesCurrent = currentHostname.includes(rpa.target) || currentHostname.includes(rpaHostname);
      if (!targetMatchesCurrent) return;
      if (Date.now() - rpa.ts > 3e5) {
        chrome.storage.local.remove("optibot_rpa");
        return;
      }
      var loginPage = /\/login|\/signin|\/connexion|\/auth|Login\.do/i.test(window.location.pathname) || !!document.querySelector('input[type="password"]');
      if (loginPage && !rpa.login_shown) {
        chrome.storage.local.set({ optibot_rpa: Object.assign({}, rpa, { login_shown: true }) });
        showRPAToast("\u{1F510} RPA : connectez-vous, le bot reprend automatiquement apr\xE8s connexion", "info");
        var loginObs = new MutationObserver(function() {
          if (!document.querySelector('input[type="password"]')) {
            loginObs.disconnect();
            checkAndStartRPA();
          }
        });
        loginObs.observe(document.body, { childList: true, subtree: true });
        return;
      }
      if (rpa.parcours && rpa.parcours.etapes) {
        chrome.storage.local.remove("optibot_rpa");
        showRPAToast("RPA " + (rpa.target || "portail") + " : d\xE9marrage...", "info");
        if (typeof replayParcours === "function") {
          replayParcours(rpa.parcours, rpa.payload);
        }
        return;
      }
      chrome.storage.local.remove("optibot_rpa");
      showRPAToast("RPA " + (rpa.target || "portail") + " : remplissage automatique...", "info");
      if (typeof performSmartFill === "function") {
        performSmartFill();
      }
    });
  }

  // extension-src/content/index.js
  function loadDynamicParcours() {
    chrome.storage.local.get(["optibot_dynamic_parcours", "optibot_auth"], function(result) {
      var auth = result.optibot_auth || {};
      if (!auth.syncToken) return;
      var cached = result.optibot_dynamic_parcours;
      if (cached && cached.ts && Date.now() - cached.ts < 18e5) {
        injectDynamicParcours(cached.handlers);
        return;
      }
      fetch("https://optibot.fr/api/extension/parcours?handlers=true", {
        headers: { "Authorization": "Bearer " + auth.syncToken }
      }).then(function(r) {
        return r.json();
      }).then(function(data) {
        chrome.storage.local.set({
          optibot_dynamic_parcours: { handlers: data.handlers, ts: Date.now() }
        });
        injectDynamicParcours(data.handlers);
      }).catch(function(err) {
        console.warn("[OptiBot] dynamic parcours fetch failed:", err);
      });
    });
  }
  function injectDynamicParcours(handlers) {
    if (!Array.isArray(handlers)) return;
    handlers.forEach(function(h) {
      if (!h.hostname) return;
      var alreadyExists = Object.values(CONFIGS2).some(function(cfg) {
        return cfg.isMatch && cfg.isMatch() && window.location.hostname.includes(h.hostname);
      });
      if (CONFIGS2[h.hostname] || alreadyExists) return;
      var etapes = h.etapes || [];
      CONFIGS2[h.hostname] = {
        name: h.nom || h.hostname,
        isMatch: /* @__PURE__ */ (function(hostname) {
          return function() {
            return window.location.hostname.includes(hostname);
          };
        })(h.hostname),
        actions: {
          formulaire: /* @__PURE__ */ (function(etapesList) {
            return function(data) {
              if (!etapesList || etapesList.length === 0) return false;
              var filled = false;
              var cache = data.cached || {};
              var m = data.m || {};
              var o = data.o || {};
              var personnes = m.personnes || [];
              var p0 = personnes.length > 0 ? personnes[0] : {};
              var vars = {
                "{{nss}}": getOuvrantDroitNSS2(m.numeroSecuriteSociale || "", m.dateNaissance || "", personnes).replace(/\D/g, ""),
                "{{nom}}": (m.nom || p0.nom || o.nomPatient || cache.nom || "").toUpperCase(),
                "{{prenom}}": capitalize2(m.prenom || p0.prenom || o.prenomPatient || cache.prenom || ""),
                "{{dateNaissance}}": m.dateNaissance || o.dateNaissancePatient || cache.dob || "",
                "{{dateOrdonnance}}": o.dateOrdonnance || cache.prescription && cache.prescription.datePrescription || "",
                "{{numeroAdherent}}": m.numeroAdherent || cache.numeroAdherent || "",
                "{{organisme}}": m.organisme || cache.organisme || "",
                "{{sphere_od}}": o.lunettesOD && o.lunettesOD.sphere || "",
                "{{sphere_og}}": o.lunettesOG && o.lunettesOG.sphere || "",
                "{{cylindre_od}}": o.lunettesOD && o.lunettesOD.cylindre || "",
                "{{cylindre_og}}": o.lunettesOG && o.lunettesOG.cylindre || "",
                "{{axe_od}}": o.lunettesOD && o.lunettesOD.axe || "",
                "{{axe_og}}": o.lunettesOG && o.lunettesOG.axe || "",
                "{{addition}}": o.lunettesOD && o.lunettesOD.addition || o.lunettesOG && o.lunettesOG.addition || ""
              };
              etapesList.forEach(function(etape) {
                if (etape.action !== "fill" && etape.action !== "click" && etape.action !== "select") return;
                var selectors = etape.selectors || (etape.selector ? [etape.selector] : []);
                if (selectors.length === 0) return;
                var el = null;
                for (var si = 0; si < selectors.length; si++) {
                  el = findElement2(selectors[si]);
                  if (el) break;
                }
                if (!el) return;
                if (etape.action === "click") {
                  el.click();
                  filled = true;
                  return;
                }
                var value = etape.variable ? vars[etape.variable] || "" : "";
                if (!value) return;
                if (etape.action === "select") {
                  smartSelectOption2(el, value);
                  filled = true;
                } else {
                  ultraFill2(el, value);
                  filled = true;
                }
              });
              return filled;
            };
          })(etapes),
          synchroniser: function() {
            return false;
          }
        }
      };
    });
  }
  loadDynamicParcours();
  function validateLuhnNSS(nss) {
    var digits = nss.replace(/\D/g, "");
    if (digits.length < 13) return false;
    var n = digits.slice(0, 13).replace(/2A/i, "19").replace(/2B/i, "18");
    var num = parseInt(n, 10);
    if (isNaN(num)) return false;
    if (digits.length >= 15) {
      var cle = parseInt(digits.slice(13, 15), 10);
      return 97 - num % 97 === cle;
    }
    return true;
  }
  function checkDroitsMutuelle3(data) {
    var m = data.m || data || {};
    var dateFin = m.dateFinValidite || "";
    var dateDebut = m.dateDebutValidite || "";
    var today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    if (dateFin) {
      var parts = dateFin.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
      if (parts) {
        var finDate = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]));
        if (finDate < today) {
          showRPAToast3("\u26D4 Droits mutuelle expir\xE9s depuis le " + dateFin, "error");
          return;
        }
        var diffDays = Math.ceil((finDate - today) / (1e3 * 60 * 60 * 24));
        if (diffDays <= 30) {
          showRPAToast3("\u26A0\uFE0F Droits mutuelle expirent dans " + diffDays + " jour" + (diffDays > 1 ? "s" : "") + " (" + dateFin + ")", "warning");
          return;
        }
      }
    }
    if (dateDebut) {
      var partsD = dateDebut.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
      if (partsD) {
        var debutDate = new Date(parseInt(partsD[3]), parseInt(partsD[2]) - 1, parseInt(partsD[1]));
        if (debutDate > today) {
          showRPAToast3("\u26A0\uFE0F Droits mutuelle pas encore actifs (d\xE9but : " + dateDebut + ")", "warning");
        }
      }
    }
  }
  function getOuvrantDroitNSS2(beneficiaireNSS, beneficiaireDOB, personnes) {
    if (!personnes || personnes.length <= 1) return beneficiaireNSS;
    if (!beneficiaireDOB || !isUnder182(beneficiaireDOB)) return beneficiaireNSS;
    for (var i = 0; i < personnes.length; i++) {
      var p = personnes[i];
      var pNSS = (p.numeroSecuriteSociale || "").replace(/\D/g, "");
      if (pNSS.startsWith("2") && pNSS.length >= 13 && p.dateNaissance && !isUnder182(p.dateNaissance)) {
        return p.numeroSecuriteSociale;
      }
    }
    for (var i = 0; i < personnes.length; i++) {
      var p = personnes[i];
      var pNSS = (p.numeroSecuriteSociale || "").replace(/\D/g, "");
      if (pNSS.length >= 13 && p.dateNaissance && !isUnder182(p.dateNaissance)) {
        return p.numeroSecuriteSociale;
      }
    }
    return beneficiaireNSS;
  }
  function isUnder182(dob) {
    let d;
    if (dob.includes("/")) {
      const p = dob.split("/");
      d = new Date(p[2], p[1] - 1, p[0]);
    } else {
      d = new Date(dob);
    }
    if (isNaN(d.getTime())) return false;
    const age = (Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1e3);
    return age < 18;
  }
  function showSyncButton() {
    if (document.getElementById("optibot-sync-btn")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "optibot-sync-btn";
    btn.innerText = "\u{1F4BE} M\xE9moriser";
    btn.style.cssText = `
    position: fixed; bottom: 80px; right: 20px; z-index: 999999;
    background: #8b5cf6; color: white; border: none; padding: 12px 20px;
    border-radius: 50px; font-weight: bold; cursor: pointer;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2); font-family: sans-serif;
    transition: all 0.2s;
  `;
    btn.onclick = async () => {
      btn.innerText = "\u23F3 En cours...";
      const currentSite = Object.values(CONFIGS2).find((cfg) => cfg.isMatch());
      const success = await currentSite.actions.synchroniser();
      if (success) {
        btn.innerText = "\u2705 Client m\xE9moris\xE9 !";
        btn.style.background = "#10b981";
        setTimeout(() => {
          btn.innerText = "\u{1F4BE} M\xE9moriser";
          btn.style.background = "#8b5cf6";
        }, 2e3);
      } else {
        btn.innerText = "\u274C Formulaire vide";
        btn.style.background = "#ef4444";
        setTimeout(() => {
          btn.innerText = "\u{1F4BE} M\xE9moriser";
          btn.style.background = "#8b5cf6";
        }, 2e3);
      }
    };
    document.body.appendChild(btn);
  }
  function scrapeTPTable() {
    var table = document.querySelector("#grid_pointage_tiers_payant tbody");
    if (!table) return [];
    var rows = table.querySelectorAll("tr");
    var dossiers = [];
    for (var i = 0; i < rows.length; i++) {
      var tr = rows[i];
      var tds = tr.querySelectorAll("td");
      if (tds.length < 9) continue;
      var date = (tds[0].textContent || "").trim();
      var modeEl = tds[1].querySelector(".label");
      var mode = modeEl ? (modeEl.textContent || "").trim() : "";
      var numFSE = (tds[2].textContent || "").trim();
      var orgTypeEl = tds[3].querySelector(".label");
      var orgType = orgTypeEl ? (orgTypeEl.textContent || "").trim() : "";
      var organisme = (tds[3].textContent || "").trim().replace(/^(RO|RC)\s*/, "");
      var bordText = (tds[4].textContent || "").trim();
      var numBordereau = bordText.replace(/^(Bord\.\s*N°|Lot\s*N°)\s*/i, "").trim();
      var montantText = (tds[6].textContent || "").replace(/[^\d,.-]/g, "").replace(",", ".").trim();
      var montant = parseFloat(montantText) || 0;
      var statutEl = tds[7].querySelector(".label-danger");
      var statut = statutEl ? "Rejet" : (tds[7].textContent || "").trim();
      var remarque = (tds[8].textContent || "").trim();
      var encBtn = tds[9] ? tds[9].querySelector("[data-bordereau_regime_detail_id]") : null;
      var lboDetailId = encBtn ? encBtn.getAttribute("data-bordereau_regime_detail_id") : "";
      var rejetBtn = tds[9] ? tds[9].querySelector("[data-rejet_noemi_type_id]") : null;
      var rejetTypeId = rejetBtn ? rejetBtn.getAttribute("data-rejet_noemi_type_id") : "";
      dossiers.push({
        date,
        mode,
        numFSE,
        type: orgType,
        organisme,
        numBordereau,
        montant,
        statut,
        remarque,
        rejetTypeId: rejetTypeId || "",
        lboDetailId: lboDetailId || ""
      });
    }
    return dossiers;
  }
  async function syncTPToOptiBot(btn) {
    btn.innerText = "Chargement...";
    btn.style.background = "#6366f1";
    var lengthSelect = document.querySelector("#grid_pointage_tiers_payant_length select");
    var originalLength = lengthSelect ? lengthSelect.value : "10";
    if (lengthSelect && lengthSelect.value !== "100") {
      lengthSelect.value = "100";
      lengthSelect.dispatchEvent(new Event("change", { bubbles: true }));
      await new Promise(function(r) {
        setTimeout(r, 2e3);
      });
    }
    var allDossiers = [];
    var maxPages = 20;
    var page = 0;
    while (page < maxPages) {
      btn.innerText = "Page " + (page + 1) + "...";
      var batch = scrapeTPTable();
      if (batch.length === 0) break;
      allDossiers = allDossiers.concat(batch);
      var nextBtn = document.querySelector("#grid_pointage_tiers_payant_next:not(.disabled)");
      if (!nextBtn) break;
      nextBtn.querySelector("a").click();
      await new Promise(function(r) {
        setTimeout(r, 1500);
      });
      page++;
    }
    var firstPageBtn = document.querySelector("#grid_pointage_tiers_payant_paginate .paginate_button:nth-child(2) a");
    if (firstPageBtn) firstPageBtn.click();
    if (lengthSelect && originalLength !== "100") {
      setTimeout(function() {
        lengthSelect.value = originalLength;
        lengthSelect.dispatchEvent(new Event("change", { bubbles: true }));
      }, 500);
    }
    if (allDossiers.length === 0) {
      btn.innerText = "Aucun dossier";
      btn.style.background = "#ef4444";
      setTimeout(function() {
        btn.innerText = "Sync TP";
        btn.style.background = "#6366f1";
      }, 2e3);
      return;
    }
    btn.innerText = "Envoi " + allDossiers.length + " dossiers...";
    var syncToken = await getSyncToken();
    if (!syncToken) {
      btn.innerText = "Connectez-vous sur OptiBot";
      btn.style.background = "#ef4444";
      setTimeout(function() {
        btn.innerText = "Sync TP";
        btn.style.background = "#6366f1";
      }, 3e3);
      return;
    }
    (async function() {
      try {
        var resp = await fetch("https://optibot.fr/api/extension/sync-tp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ syncToken, dossiers: allDossiers })
        });
        var data = await resp.json();
        if (data.success) {
          btn.innerText = "+" + data.created + " / maj " + data.updated;
          btn.style.background = "#10b981";
        } else {
          btn.innerText = data.error || "Erreur";
          btn.style.background = "#ef4444";
        }
      } catch (e) {
        btn.innerText = "Erreur r\xE9seau";
        btn.style.background = "#ef4444";
      }
      setTimeout(function() {
        btn.innerText = "Sync TP";
        btn.style.background = "#6366f1";
      }, 3e3);
    })();
  }
  function showSyncTPButton() {
    if (document.getElementById("optibot-sync-tp-btn")) return;
    if (!document.querySelector("#grid_pointage_tiers_payant")) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "optibot-sync-tp-btn";
    btn.innerText = "Sync TP";
    btn.style.cssText = [
      "position: fixed; bottom: 140px; right: 20px; z-index: 999999;",
      "background: #6366f1; color: white; border: none; padding: 12px 20px;",
      "border-radius: 50px; font-weight: bold; cursor: pointer;",
      "box-shadow: 0 4px 15px rgba(0,0,0,0.2); font-family: sans-serif;",
      "transition: all 0.2s;"
    ].join("");
    btn.onclick = function() {
      syncTPToOptiBot(btn);
    };
    document.body.appendChild(btn);
  }
  function showRPAToast3(message, type) {
    var existing = document.getElementById("optibot-rpa-toast");
    if (existing) existing.remove();
    var colors = {
      info: { bg: "#2563eb", border: "#3b82f6" },
      success: { bg: "#10b981", border: "#34d399" },
      warning: { bg: "#f59e0b", border: "#fbbf24" },
      error: { bg: "#ef4444", border: "#f87171" }
    };
    var c = colors[type] || colors.info;
    var toast = document.createElement("div");
    toast.id = "optibot-rpa-toast";
    toast.textContent = message;
    toast.style.cssText = [
      "position: fixed; bottom: 80px; right: 20px; z-index: 9999999;",
      "background: " + c.bg + "; color: white; border: 2px solid " + c.border + ";",
      "padding: 14px 22px; border-radius: 14px; font-weight: 600; font-size: 13px;",
      "font-family: sans-serif; box-shadow: 0 8px 30px rgba(0,0,0,0.25);",
      "max-width: 360px; line-height: 1.4; opacity: 0; transition: opacity 0.3s;"
    ].join("");
    document.body.appendChild(toast);
    requestAnimationFrame(function() {
      toast.style.opacity = "1";
    });
    setTimeout(function() {
      toast.style.opacity = "0";
      setTimeout(function() {
        toast.remove();
      }, 300);
    }, 4e3);
  }
  window.addEventListener("message", function(e) {
    if (!e.data || e.data.type !== "OPTIBOT_FILL_FRAME" || !e.data.payload) return;
    if (e.origin !== window.location.origin) {
      var isKnownFrame = false;
      var frames = document.querySelectorAll("iframe");
      for (var i = 0; i < frames.length; i++) {
        try {
          if (frames[i].src && new URL(frames[i].src).origin === e.origin) {
            isKnownFrame = true;
            break;
          }
        } catch (err) {
        }
      }
      if (!isKnownFrame) {
        console.warn("[OptiBot] postMessage rejet\xE9 \u2014 iframe non reconnue :", e.origin);
        return;
      }
    }
    var payload = e.data.payload;
    var cachePromise = Promise.resolve();
    if (payload && (payload.m || payload.o)) {
      var nom = (payload.m && payload.m.nom || payload.o && payload.o.nomPatient || "").toUpperCase();
      if (nom) {
        var current = Object.assign({}, payload.m || {}, { ordonnance: payload.o || {}, updatedAt: Date.now() });
        cachePromise = writeEncryptedCache({ current });
      }
    }
    cachePromise.then(function() {
      performSmartFill2();
    });
    if (e.source) {
      try {
        e.source.postMessage({ type: "OPTIBOT_FILL_FRAME_ACK", ok: true }, e.origin);
      } catch (err) {
      }
    }
  }, false);
  function initLocal() {
    if (window.location.hostname.includes("localhost")) return;
    loadSelectorCache();
    if (typeof loadRemoteSelectors === "function") loadRemoteSelectors();
    if (typeof loadRejectionModel === "function") loadRejectionModel();
    const currentSite = Object.values(CONFIGS2).find((cfg) => cfg.isMatch());
    if (!currentSite) {
      if (!document.getElementById("optibot-fill-btn")) {
        var btnSmart = document.createElement("button");
        btnSmart.type = "button";
        btnSmart.id = "optibot-fill-btn";
        btnSmart.innerText = "\u{1F916} Remplir";
        btnSmart.style.cssText = "position:fixed;bottom:20px;right:20px;z-index:999999;background:#7c3aed;color:white;border:none;padding:12px 20px;border-radius:50px;font-weight:bold;cursor:pointer;box-shadow:0 4px 15px rgba(0,0,0,0.2);font-family:sans-serif;transition:all 0.2s;";
        btnSmart.title = "Remplir les champs de cette page";
        btnSmart.onclick = async function() {
          var usedDynamic = await tryDynamicReplay();
          if (!usedDynamic) {
            performFill().then(function() {
            }).catch(function() {
              performSmartFill2();
            });
          }
        };
        document.body.appendChild(btnSmart);
      }
      return;
    }
    if (!document.getElementById("optibot-fill-btn")) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.id = "optibot-fill-btn";
      btn.innerText = "\u{1F916} Remplir";
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
          performFill().then(function() {
          }).catch(function() {
            performSmartFill2();
          });
        }
      };
      document.body.appendChild(btn);
    }
    if (currentSite.name === "LivebyOptimum") {
      showSyncButton();
      showSyncTPButton();
      var tpObserver = new MutationObserver(function() {
        showSyncTPButton();
        applyButtonsPreference();
      });
      tpObserver.observe(document.body, { childList: true, subtree: true });
    }
    checkAndStartRPA();
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
    var _smartFillDebounce = null;
    var _knownFieldIds = /* @__PURE__ */ new Set();
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
            var key = f.id || f.name || f.getAttribute && f.getAttribute("formcontrolname") || "";
            if (key && !_knownFieldIds.has(key) && !(f.getAttribute && f.getAttribute("data-optibot-filled"))) {
              hasNew = true;
              _knownFieldIds.add(key);
            }
          });
          if (hasNew) performSmartFill2();
        }, 600);
      });
      obs.observe(doc.body || doc.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class", "hidden", "aria-hidden"]
      });
      _activeObservers.push(obs);
    }
    observeDoc(document);
    function observeIframes() {
      var iframes = document.querySelectorAll("iframe");
      for (var i = 0; i < iframes.length; i++) {
        try {
          var iDoc = iframes[i].contentDocument || iframes[i].contentWindow && iframes[i].contentWindow.document;
          if (iDoc && iDoc.body) observeDoc(iDoc);
        } catch (e) {
        }
      }
    }
    observeIframes();
    var iframeWatcher = new MutationObserver(function() {
      observeIframes();
    });
    iframeWatcher.observe(document.body, { childList: true, subtree: true });
    try {
      setupDevisDetection();
    } catch (e) {
    }
  }
  function setButtonsVisibility(visible) {
    var ids = ["optibot-fill-btn", "optibot-sync-btn", "optibot-sync-tp-btn"];
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (el) el.style.display = visible ? "block" : "none";
    }
  }
  chrome.runtime.onMessage.addListener(function(msg) {
    if (msg && msg.type === "OPTIBOT_TOGGLE_BUTTONS") {
      setButtonsVisibility(msg.visible);
    }
    if (msg && msg.type === "OPTIBOT_PAGE_LOADED") {
      var matchedPortail = Object.values(CONFIGS2).find(function(cfg) {
        return cfg.isMatch();
      });
      if (matchedPortail) {
      }
    }
  });
  function applyButtonsPreference() {
    chrome.storage.local.get(["optibot_buttons_visible"], function(result) {
      var visible = result.optibot_buttons_visible !== false;
      setButtonsVisibility(visible);
    });
  }
  if (typeof initFieldFeedback === "function") initFieldFeedback();
  if (document.readyState === "complete") {
    initLocal();
    applyButtonsPreference();
    restoreRecorderIfNeeded();
    initCommandCenter();
  } else window.addEventListener("load", function() {
    initLocal();
    applyButtonsPreference();
    restoreRecorderIfNeeded();
    initCommandCenter();
  });
  function initCommandCenter() {
    if (window.location.hostname.includes("localhost")) return;
    if (window.location.hostname.includes("optibot.fr")) return;
    setTimeout(function() {
      if (typeof createCommandCenter === "function") createCommandCenter();
    }, 1500);
  }
  chrome.runtime.onMessage.addListener(function(msg) {
    if (msg && msg.type === "OPTIBOT_LAUNCH_PARCOURS" && msg.parcoursId) {
      (async function() {
        var syncToken = await getSyncToken();
        if (!syncToken) return;
        try {
          var hostname = window.location.hostname.replace("www.", "");
          var res = await fetch("https://optibot.fr/api/extension/parcours?hostname=" + encodeURIComponent(hostname), { headers: { "Authorization": "Bearer " + syncToken } });
          if (!res.ok) return;
          var data = await res.json();
          var found = (data.parcours || []).find(function(p) {
            return p.id === msg.parcoursId;
          });
          if (!found) return;
          var cache = await readEncryptedCache() || {};
          startReplay(found, cache);
        } catch (e) {
        }
      })();
    }
  });
  var recorderState = null;
  function generateSelectors(el) {
    var selectors = [];
    if (el.id && !el.id.match(/^[0-9]/)) selectors.push("#" + CSS.escape(el.id));
    if (el.name) selectors.push('[name="' + el.name + '"]');
    if (el.getAttribute("data-cy")) selectors.push('[data-cy="' + el.getAttribute("data-cy") + '"]');
    if (el.getAttribute("data-testid")) selectors.push('[data-testid="' + el.getAttribute("data-testid") + '"]');
    if (el.placeholder) selectors.push(el.tagName.toLowerCase() + '[placeholder="' + el.placeholder + '"]');
    var lbl = el.id ? document.querySelector('label[for="' + el.id + '"]') : null;
    if (lbl && lbl.textContent.trim() && el.id && el.id.length >= 8) {
      selectors.push(el.tagName.toLowerCase() + '[id$="' + el.id.slice(-8) + '"]');
    }
    var parent = el.parentElement;
    if (parent) {
      var idx = Array.from(parent.children).indexOf(el) + 1;
      selectors.push(el.tagName.toLowerCase() + ":nth-child(" + idx + ")");
    }
    if (selectors.length === 0) selectors.push(el.tagName.toLowerCase());
    return selectors.filter(function(s, i, arr) {
      return arr.indexOf(s) === i;
    });
  }
  function normalizeForMatch(val) {
    return (val || "").replace(/[\s\-\.\/]/g, "").toLowerCase();
  }
  function normalizeDateForMatch(dateStr) {
    if (!dateStr) return [];
    var d = dateStr.replace(/\D/g, "");
    if (d.length === 8) {
      return [d, d.slice(4) + d.slice(2, 4) + d.slice(0, 2), d.slice(0, 2) + d.slice(2, 4) + d.slice(4)];
    }
    return [d];
  }
  async function detectVariable(value) {
    if (!value || value.length < 2) return null;
    var cache = await readEncryptedCache();
    if (!cache || !cache.current) return null;
    var m = cache.current;
    var o = m.ordonnance || {};
    var od = o.lunettesOD || {};
    var og = o.lunettesOG || {};
    var p0 = m.personnes && m.personnes[0] || {};
    var normalizedValue = normalizeForMatch(value);
    var mapping = [
      { variable: "{{nss}}", value: m.numeroSecuriteSociale || "" },
      { variable: "{{nom}}", value: m.nom || p0.nom || "" },
      { variable: "{{prenom}}", value: m.prenom || p0.prenom || "" },
      { variable: "{{organisme}}", value: m.organisme || "" },
      { variable: "{{numeroAdherent}}", value: m.numeroAdherent || "" },
      { variable: "{{sphere_od}}", value: od.sphere || "" },
      { variable: "{{sphere_og}}", value: og.sphere || "" },
      { variable: "{{cylindre_od}}", value: od.cylindre || "" },
      { variable: "{{cylindre_og}}", value: og.cylindre || "" },
      { variable: "{{axe_od}}", value: od.axe || "" },
      { variable: "{{axe_og}}", value: og.axe || "" },
      { variable: "{{addition}}", value: od.addition || og.addition || "" }
    ];
    for (var i = 0; i < mapping.length; i++) {
      var candidate = normalizeForMatch(mapping[i].value);
      if (candidate && candidate.length >= 2 && normalizedValue === candidate) {
        return mapping[i].variable;
      }
    }
    var dateFields = [
      { variable: "{{dateNaissance}}", value: m.dateNaissance || "" },
      { variable: "{{dateOrdonnance}}", value: o.dateOrdonnance || "" }
    ];
    for (var j = 0; j < dateFields.length; j++) {
      var variants = normalizeDateForMatch(dateFields[j].value);
      for (var k = 0; k < variants.length; k++) {
        if (variants[k] && variants[k].length >= 6 && normalizedValue === variants[k]) {
          return dateFields[j].variable;
        }
      }
    }
    return null;
  }
  function showRecorderPanel() {
    if (document.getElementById("optibot-recorder-panel")) return;
    var panel = document.createElement("div");
    panel.id = "optibot-recorder-panel";
    panel.style.cssText = "position:fixed;right:0;top:50%;transform:translateY(-50%);z-index:2147483646;background:white;border-radius:12px 0 0 12px;box-shadow:-4px 0 20px rgba(0,0,0,0.15);width:260px;font-family:sans-serif;display:flex;flex-direction:column;max-height:70vh;";
    var header = document.createElement("div");
    header.style.cssText = "padding:14px 16px 10px;border-bottom:1px solid #e5e7eb;";
    header.innerHTML = '<div style="font-size:14px;font-weight:700;color:#ef4444;">\u23FA OptiBot \u2014 Enregistrement</div>';
    panel.appendChild(header);
    var body = document.createElement("div");
    body.id = "optibot-recorder-panel-body";
    body.style.cssText = "flex:1;overflow-y:auto;padding:8px 12px;";
    panel.appendChild(body);
    var footer = document.createElement("div");
    footer.id = "optibot-recorder-panel-footer";
    footer.style.cssText = "padding:10px 16px;border-top:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;";
    var counter = document.createElement("span");
    counter.id = "optibot-recorder-panel-counter";
    counter.style.cssText = "font-size:12px;color:#6b7280;";
    counter.textContent = "0 \xE9tapes enregistr\xE9es";
    var stopBtn = document.createElement("button");
    stopBtn.style.cssText = "padding:6px 14px;border:none;border-radius:6px;background:#ef4444;color:white;font-size:12px;font-weight:600;cursor:pointer;";
    stopBtn.textContent = "\u23F9 Terminer";
    stopBtn.addEventListener("click", function() {
      stopRecorder();
    });
    footer.appendChild(counter);
    footer.appendChild(stopBtn);
    panel.appendChild(footer);
    document.body.appendChild(panel);
  }
  function updateRecorderPanel() {
    if (!recorderState) return;
    var body = document.getElementById("optibot-recorder-panel-body");
    var counter = document.getElementById("optibot-recorder-panel-counter");
    if (!body) return;
    var etapes = recorderState.etapes;
    if (counter) counter.textContent = etapes.length + " \xE9tape" + (etapes.length > 1 ? "s" : "") + " enregistr\xE9e" + (etapes.length > 1 ? "s" : "");
    body.innerHTML = "";
    var lastUrl = null;
    for (var i = 0; i < etapes.length; i++) {
      var step = etapes[i];
      if (step.url && step.url !== lastUrl && lastUrl !== null) {
        var sep = document.createElement("div");
        sep.style.cssText = "border-top:2px dashed #d1d5db;margin:6px 0;padding-top:4px;font-size:10px;color:#9ca3af;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
        sep.textContent = "\u{1F4C4} " + step.url.replace(/https?:\/\//, "").slice(0, 35);
        body.appendChild(sep);
      }
      lastUrl = step.url;
      var row = document.createElement("div");
      row.style.cssText = "display:flex;align-items:center;gap:6px;padding:4px 0;font-size:12px;";
      var icon = document.createElement("span");
      if (step.action === "fill") {
        var isKnown = step.variable && step.variable.indexOf("{{") === 0;
        icon.textContent = "\u2705";
        var labelEl = document.createElement("span");
        labelEl.style.cssText = "flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#374151;";
        labelEl.textContent = (step.label || "Champ").slice(0, 25);
        var varBadge = document.createElement("span");
        if (isKnown) {
          varBadge.style.cssText = "font-size:10px;background:#d1fae5;color:#065f46;padding:1px 5px;border-radius:3px;white-space:nowrap;";
          varBadge.textContent = step.variable;
        } else {
          varBadge.style.cssText = "font-size:10px;background:#fef3c7;color:#92400e;padding:1px 5px;border-radius:3px;white-space:nowrap;";
          varBadge.textContent = "statique";
        }
        row.appendChild(icon);
        row.appendChild(labelEl);
        row.appendChild(varBadge);
      } else if (step.action === "click") {
        icon.textContent = "\u{1F5B1}\uFE0F";
        var labelEl2 = document.createElement("span");
        labelEl2.style.cssText = "flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#374151;";
        labelEl2.textContent = (step.label || "Clic").slice(0, 30);
        row.appendChild(icon);
        row.appendChild(labelEl2);
      } else if (step.action === "select") {
        icon.textContent = "\u{1F4CB}";
        var labelEl3 = document.createElement("span");
        labelEl3.style.cssText = "flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#374151;";
        labelEl3.textContent = (step.label || "S\xE9lection").slice(0, 30);
        row.appendChild(icon);
        row.appendChild(labelEl3);
      }
      body.appendChild(row);
    }
    body.scrollTop = body.scrollHeight;
  }
  function highlightRecordedField(el, variable) {
    if (!el || el.getAttribute("data-optibot-recorded")) return;
    el.setAttribute("data-optibot-recorded", "true");
    var isKnown = variable && variable.indexOf("{{") === 0;
    el.style.outline = isKnown ? "2px solid #10b981" : "2px solid #f59e0b";
    el.style.backgroundColor = isKnown ? "#f0fdf4" : "#fffbeb";
    var rect = el.getBoundingClientRect();
    var badge = document.createElement("span");
    badge.className = "optibot-recorder-field-badge";
    badge.style.cssText = "position:absolute;z-index:2147483645;font-size:10px;font-weight:600;padding:1px 6px;border-radius:3px;font-family:sans-serif;pointer-events:none;white-space:nowrap;";
    if (isKnown) {
      badge.style.background = "#d1fae5";
      badge.style.color = "#065f46";
      badge.textContent = variable;
    } else {
      badge.style.background = "#fef3c7";
      badge.style.color = "#92400e";
      badge.textContent = "statique";
    }
    var parent = el.offsetParent || document.body;
    var parentRect = parent.getBoundingClientRect();
    badge.style.left = rect.left - parentRect.left + "px";
    badge.style.top = rect.top - parentRect.top - 16 + "px";
    parent.appendChild(badge);
  }
  function removeRecorderHighlights() {
    var marked = document.querySelectorAll("[data-optibot-recorded]");
    for (var i = 0; i < marked.length; i++) {
      marked[i].style.outline = "";
      marked[i].style.backgroundColor = "";
      marked[i].removeAttribute("data-optibot-recorded");
    }
    var badges = document.querySelectorAll(".optibot-recorder-field-badge");
    for (var j = 0; j < badges.length; j++) {
      badges[j].remove();
    }
  }
  function startRecorder() {
    if (recorderState) return;
    recorderState = {
      etapes: [],
      hostname: window.location.hostname.replace("www.", ""),
      startTime: Date.now()
    };
    var badge = document.createElement("div");
    badge.id = "optibot-recorder-badge";
    badge.style.cssText = "position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:2147483647;background:#ef4444;color:white;padding:8px 20px;border-radius:50px;font-family:sans-serif;font-size:13px;font-weight:bold;box-shadow:0 4px 15px rgba(0,0,0,0.3);display:flex;align-items:center;gap:8px;";
    badge.innerHTML = '<span style="width:10px;height:10px;background:white;border-radius:50%;display:inline-block;animation:pulse 1s infinite;"></span> Enregistrement en cours \u2014 effectuez le parcours manuellement';
    document.body.appendChild(badge);
    if (!document.getElementById("optibot-recorder-style")) {
      var style = document.createElement("style");
      style.id = "optibot-recorder-style";
      style.textContent = "@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }";
      document.head.appendChild(style);
    }
    document.addEventListener("click", onRecorderClick, true);
    document.addEventListener("change", onRecorderChange, true);
    document.addEventListener("blur", onRecorderBlur, true);
    function attachRecorderToIframes() {
      var iframes = document.querySelectorAll("iframe");
      for (var i = 0; i < iframes.length; i++) {
        try {
          var iDoc = iframes[i].contentDocument || iframes[i].contentWindow && iframes[i].contentWindow.document;
          if (!iDoc || iDoc._optibotRecorder) continue;
          iDoc._optibotRecorder = true;
          iDoc.addEventListener("click", onRecorderClick, true);
          iDoc.addEventListener("change", onRecorderChange, true);
          iDoc.addEventListener("blur", onRecorderBlur, true);
        } catch (e) {
        }
      }
    }
    attachRecorderToIframes();
    var iframeObserver = new MutationObserver(function() {
      attachRecorderToIframes();
    });
    iframeObserver.observe(document.body, { childList: true, subtree: true });
    recorderState._iframeObserver = iframeObserver;
    chrome.storage.local.set({ optibot_recorder: { active: true, etapes: [], hostname: recorderState.hostname, startTime: recorderState.startTime } });
    showRecorderPanel();
    updateRecorderPanel();
    showRPAToast3("\u23FA Enregistrement d\xE9marr\xE9 \u2014 effectuez le parcours", "info");
  }
  async function stopRecorder() {
    if (!recorderState) return;
    document.removeEventListener("click", onRecorderClick, true);
    document.removeEventListener("change", onRecorderChange, true);
    document.removeEventListener("blur", onRecorderBlur, true);
    if (recorderState._iframeObserver) {
      recorderState._iframeObserver.disconnect();
    }
    try {
      var iframes = document.querySelectorAll("iframe");
      for (var i = 0; i < iframes.length; i++) {
        try {
          var iDoc = iframes[i].contentDocument || iframes[i].contentWindow && iframes[i].contentWindow.document;
          if (!iDoc) continue;
          iDoc._optibotRecorder = false;
          iDoc.removeEventListener("click", onRecorderClick, true);
          iDoc.removeEventListener("change", onRecorderChange, true);
          iDoc.removeEventListener("blur", onRecorderBlur, true);
        } catch (e) {
        }
      }
    } catch (e) {
    }
    var badge = document.getElementById("optibot-recorder-badge");
    if (badge) badge.remove();
    var panel = document.getElementById("optibot-recorder-panel");
    if (panel) panel.remove();
    removeRecorderHighlights();
    var etapes = recorderState.etapes;
    var hostname = recorderState.hostname;
    recorderState = null;
    chrome.storage.local.remove("optibot_recorder");
    if (etapes.length === 0) {
      showRPAToast3("Aucune \xE9tape enregistr\xE9e.", "info");
      return;
    }
    showRecorderWizard(etapes, hostname);
  }
  async function sendRecorderParcours(etapes, hostname, nom) {
    var syncToken = await getSyncToken();
    if (!syncToken) {
      showRPAToast3("Erreur : non connect\xE9.", "error");
      return;
    }
    try {
      var res = await fetch("https://optibot.fr/api/extension/parcours/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: syncToken,
          hostname,
          nom,
          etapes
        })
      });
      if (res.ok) {
        showRPAToast3("\u2705 Parcours enregistr\xE9 (" + etapes.length + " \xE9tapes) \u2014 en attente de validation admin", "success");
      } else {
        showRPAToast3("Erreur lors de l'enregistrement.", "error");
      }
    } catch (e) {
      showRPAToast3("Erreur r\xE9seau.", "error");
    }
  }
  function showRecorderWizard(etapes, hostname) {
    var existing = document.getElementById("optibot-recorder-modal-overlay");
    if (existing) existing.remove();
    var currentStep = 1;
    var nomPortail = hostname;
    var variableOptions = [
      "{{nss}}",
      "{{nom}}",
      "{{prenom}}",
      "{{dateNaissance}}",
      "{{dateOrdonnance}}",
      "{{numeroAdherent}}",
      "{{organisme}}",
      "{{sphere_od}}",
      "{{sphere_og}}",
      "{{cylindre_od}}",
      "{{cylindre_og}}",
      "{{axe_od}}",
      "{{axe_og}}",
      "{{addition}}",
      "Ignorer ce champ"
    ];
    var overlay = document.createElement("div");
    overlay.id = "optibot-recorder-modal-overlay";
    overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:2147483647;display:flex;align-items:center;justify-content:center;font-family:sans-serif;";
    var card = document.createElement("div");
    card.style.cssText = "background:white;border-radius:16px;max-width:480px;width:92%;max-height:85vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.3);padding:24px;";
    var progress = document.createElement("div");
    progress.style.cssText = "text-align:center;margin-bottom:16px;font-size:18px;letter-spacing:4px;";
    var content = document.createElement("div");
    content.style.cssText = "flex:1;overflow-y:auto;max-height:55vh;";
    var footer = document.createElement("div");
    footer.style.cssText = "display:flex;justify-content:space-between;align-items:center;margin-top:16px;gap:8px;";
    function updateProgress() {
      var dots = "";
      for (var i = 1; i <= 3; i++) {
        dots += i <= currentStep ? "\u25CF " : "\u25CB ";
      }
      progress.textContent = dots.trim();
    }
    function renderStep() {
      content.innerHTML = "";
      footer.innerHTML = "";
      updateProgress();
      if (currentStep === 1) renderStep1();
      else if (currentStep === 2) renderStep2();
      else if (currentStep === 3) renderStep3();
    }
    function renderStep1() {
      var title = document.createElement("div");
      title.style.cssText = "font-size:16px;font-weight:700;color:#111;margin-bottom:12px;";
      title.textContent = "\u23FA Nom du portail";
      var desc = document.createElement("div");
      desc.style.cssText = "font-size:13px;color:#6b7280;margin-bottom:16px;";
      desc.textContent = "Donnez un nom \xE0 ce parcours pour le retrouver facilement.";
      var input = document.createElement("input");
      input.type = "text";
      input.value = nomPortail;
      input.placeholder = hostname;
      input.style.cssText = "width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;box-sizing:border-box;outline:none;";
      input.addEventListener("focus", function() {
        input.style.borderColor = "#3b82f6";
      });
      input.addEventListener("blur", function() {
        input.style.borderColor = "#d1d5db";
      });
      input.addEventListener("input", function() {
        nomPortail = input.value.trim() || hostname;
      });
      content.appendChild(title);
      content.appendChild(desc);
      content.appendChild(input);
      var cancelBtn = document.createElement("button");
      cancelBtn.style.cssText = "padding:8px 16px;border:1px solid #d1d5db;border-radius:8px;background:white;color:#374151;font-size:13px;font-weight:500;cursor:pointer;";
      cancelBtn.textContent = "Annuler";
      cancelBtn.addEventListener("click", function() {
        overlay.remove();
        showRPAToast3("Envoi annul\xE9.", "info");
      });
      var nextBtn = document.createElement("button");
      nextBtn.style.cssText = "padding:8px 20px;border:none;border-radius:8px;background:#3b82f6;color:white;font-size:13px;font-weight:600;cursor:pointer;";
      nextBtn.textContent = "Suivant \u2192";
      nextBtn.addEventListener("click", function() {
        currentStep = 2;
        renderStep();
      });
      footer.appendChild(cancelBtn);
      footer.appendChild(nextBtn);
      setTimeout(function() {
        input.focus();
        input.select();
      }, 50);
    }
    function renderStep2() {
      var title = document.createElement("div");
      title.style.cssText = "font-size:16px;font-weight:700;color:#111;margin-bottom:12px;";
      title.textContent = "\u{1F50D} V\xE9rification des champs";
      var desc = document.createElement("div");
      desc.style.cssText = "font-size:13px;color:#6b7280;margin-bottom:16px;";
      desc.textContent = "V\xE9rifiez les variables d\xE9tect\xE9es. Corrigez les champs orange manuellement.";
      content.appendChild(title);
      content.appendChild(desc);
      var fillSteps = [];
      for (var i = 0; i < etapes.length; i++) {
        if (etapes[i].action === "fill" || etapes[i].action === "select") fillSteps.push(i);
      }
      if (fillSteps.length === 0) {
        var noFill = document.createElement("div");
        noFill.style.cssText = "font-size:13px;color:#9ca3af;text-align:center;padding:20px 0;";
        noFill.textContent = "Aucun champ de saisie d\xE9tect\xE9 \u2014 uniquement des clics.";
        content.appendChild(noFill);
      }
      for (var fi = 0; fi < fillSteps.length; fi++) {
        (function(etapeIdx) {
          var step = etapes[etapeIdx];
          var isKnown = step.variable && step.variable.indexOf("{{") === 0;
          var isStatic = !step.variable || step.variable === "[VALEUR STATIQUE \u2014 \xC0 RENSEIGNER]";
          var row = document.createElement("div");
          row.style.cssText = "display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #f3f4f6;";
          var labelSpan = document.createElement("span");
          labelSpan.style.cssText = "font-size:13px;color:#374151;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
          labelSpan.textContent = (step.label || "Champ").slice(0, 30);
          if (isKnown) {
            var badge = document.createElement("span");
            badge.style.cssText = "font-size:11px;background:#d1fae5;color:#065f46;padding:2px 8px;border-radius:4px;white-space:nowrap;";
            badge.textContent = "automatique " + step.variable;
            row.appendChild(labelSpan);
            row.appendChild(badge);
          } else {
            var sel = document.createElement("select");
            sel.style.cssText = "font-size:12px;padding:4px 6px;border:1px solid #f59e0b;border-radius:4px;background:#fffbeb;color:#92400e;max-width:160px;";
            var defaultOpt = document.createElement("option");
            defaultOpt.value = "";
            defaultOpt.textContent = "\u26A0\uFE0F \xC0 mapper";
            defaultOpt.selected = true;
            sel.appendChild(defaultOpt);
            for (var vi = 0; vi < variableOptions.length; vi++) {
              var opt = document.createElement("option");
              opt.value = variableOptions[vi];
              opt.textContent = variableOptions[vi];
              sel.appendChild(opt);
            }
            sel.addEventListener("change", function(ev) {
              var val = ev.target.value;
              if (val === "Ignorer ce champ") {
                step.variable = null;
              } else if (val) {
                step.variable = val;
              }
            });
            row.appendChild(labelSpan);
            row.appendChild(sel);
          }
          content.appendChild(row);
        })(fillSteps[fi]);
      }
      var backBtn = document.createElement("button");
      backBtn.style.cssText = "padding:8px 16px;border:1px solid #d1d5db;border-radius:8px;background:white;color:#374151;font-size:13px;font-weight:500;cursor:pointer;";
      backBtn.textContent = "\u2190 Retour";
      backBtn.addEventListener("click", function() {
        currentStep = 1;
        renderStep();
      });
      var nextBtn = document.createElement("button");
      nextBtn.style.cssText = "padding:8px 20px;border:none;border-radius:8px;background:#3b82f6;color:white;font-size:13px;font-weight:600;cursor:pointer;";
      nextBtn.textContent = "Suivant \u2192";
      nextBtn.addEventListener("click", function() {
        currentStep = 3;
        renderStep();
      });
      footer.appendChild(backBtn);
      footer.appendChild(nextBtn);
    }
    function renderStep3() {
      var autoCount = 0;
      var manualCount = 0;
      for (var i = 0; i < etapes.length; i++) {
        if (etapes[i].action === "fill" || etapes[i].action === "select") {
          if (etapes[i].variable && etapes[i].variable.indexOf("{{") === 0) autoCount++;
          else manualCount++;
        }
      }
      var title = document.createElement("div");
      title.style.cssText = "font-size:20px;font-weight:700;color:#111;text-align:center;margin-bottom:8px;";
      title.textContent = "\u{1F389} Parcours pr\xEAt !";
      var stats = document.createElement("div");
      stats.style.cssText = "font-size:14px;color:#6b7280;text-align:center;margin-bottom:24px;";
      stats.textContent = etapes.length + " \xE9tapes \xB7 " + autoCount + " champs automatiques \xB7 " + manualCount + " champs manuels";
      content.appendChild(title);
      content.appendChild(stats);
      var sendBtn = document.createElement("button");
      sendBtn.style.cssText = "width:100%;padding:12px;border:none;border-radius:8px;background:#3b82f6;color:white;font-size:14px;font-weight:600;cursor:pointer;margin-bottom:8px;";
      sendBtn.textContent = "Envoyer \xE0 OptiBot";
      sendBtn.addEventListener("click", function() {
        overlay.remove();
        sendRecorderParcours(etapes, hostname, nomPortail);
      });
      content.appendChild(sendBtn);
      var dlBtn = document.createElement("button");
      dlBtn.style.cssText = "width:100%;padding:12px;border:1px solid #d1d5db;border-radius:8px;background:white;color:#374151;font-size:14px;font-weight:500;cursor:pointer;margin-bottom:8px;";
      dlBtn.textContent = "T\xE9l\xE9charger JSON";
      dlBtn.addEventListener("click", function() {
        var blob = new Blob([JSON.stringify({ hostname, nom: nomPortail, etapes }, null, 2)], { type: "application/json" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "optibot-parcours-" + hostname + ".json";
        a.click();
        URL.revokeObjectURL(url);
      });
      content.appendChild(dlBtn);
      var backBtn = document.createElement("button");
      backBtn.style.cssText = "padding:8px 16px;border:1px solid #d1d5db;border-radius:8px;background:white;color:#374151;font-size:13px;font-weight:500;cursor:pointer;";
      backBtn.textContent = "\u2190 Retour";
      backBtn.addEventListener("click", function() {
        currentStep = 2;
        renderStep();
      });
      var cancelBtn = document.createElement("button");
      cancelBtn.style.cssText = "padding:8px 16px;border:1px solid #d1d5db;border-radius:8px;background:white;color:#ef4444;font-size:13px;font-weight:500;cursor:pointer;";
      cancelBtn.textContent = "Annuler";
      cancelBtn.addEventListener("click", function() {
        overlay.remove();
        showRPAToast3("Envoi annul\xE9.", "info");
      });
      footer.appendChild(backBtn);
      footer.appendChild(cancelBtn);
    }
    card.appendChild(progress);
    card.appendChild(content);
    card.appendChild(footer);
    overlay.appendChild(card);
    overlay.addEventListener("click", function(ev) {
      if (ev.target === overlay) {
        overlay.remove();
        showRPAToast3("Envoi annul\xE9.", "info");
      }
    });
    document.body.appendChild(overlay);
    renderStep();
  }
  function anonymizeHtmlSnapshot() {
    try {
      var clone = document.documentElement.cloneNode(true);
      var inputs = clone.querySelectorAll("input, textarea, select");
      for (var i = 0; i < inputs.length; i++) {
        inputs[i].value = "";
        inputs[i].removeAttribute("value");
      }
      var scripts = clone.querySelectorAll("script");
      for (var s = 0; s < scripts.length; s++) {
        scripts[s].remove();
      }
      var dataEls = clone.querySelectorAll("[data-nss], [data-nom], [data-prenom], [data-secu], [data-patient]");
      for (var d = 0; d < dataEls.length; d++) {
        ["data-nss", "data-nom", "data-prenom", "data-secu", "data-patient"].forEach(function(attr) {
          dataEls[d].removeAttribute(attr);
        });
      }
      return clone.outerHTML;
    } catch (e) {
      return "";
    }
  }
  async function onRecorderClick(e) {
    if (!recorderState) return;
    var el = e.target;
    if (!el || el.id === "optibot-recorder-badge" || el.closest("#optibot-recorder-badge") || el.closest("#optibot-recorder-panel")) return;
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT") return;
    var selectors = generateSelectors(el);
    var label = (el.innerText || el.value || el.getAttribute("aria-label") || "").trim().slice(0, 50);
    var htmlSnapshot = anonymizeHtmlSnapshot();
    var newStep = {
      id: "step_" + (recorderState.etapes.length + 1),
      label: label || "Clic",
      action: "click",
      selectorType: "css",
      selector: selectors[0],
      selectors,
      variable: null,
      htmlSnapshot,
      url: window.location.href,
      waitFor: null,
      timeout: 5e3
    };
    recorderState.etapes.push(newStep);
    saveRecorderState();
    updateRecorderPanel();
    showRPAToast3("\u23FA \xC9tape " + recorderState.etapes.length + " \u2014 clic enregistr\xE9", "info");
    var urlBefore = window.location.href;
    var bodySnapshot = document.body.innerHTML.length;
    var lastStepAdded = newStep;
    setTimeout(function() {
      if (!recorderState) return;
      if (window.location.href !== urlBefore) {
        lastStepAdded.waitFor = "input:not([type=hidden]), select, button[type=submit], form";
        saveRecorderState();
        showRPAToast3("\u{1F4C4} Nouvelle page \u2014 continuez votre saisie, OptiBot enregistre", "info");
        var recBadge = document.getElementById("optibot-recorder-badge");
        if (recBadge) {
          recBadge.innerHTML = '<span style="width:10px;height:10px;background:white;border-radius:50%;display:inline-block;animation:pulse 1s infinite;"></span> Enregistrement en cours (' + recorderState.etapes.length + " \xE9tapes)";
        }
      } else if (Math.abs(document.body.innerHTML.length - bodySnapshot) > 500) {
        lastStepAdded.waitFor = "input:not([type=hidden]), select, button[type=submit], form";
        saveRecorderState();
      }
    }, 800);
  }
  var recorderBlurQueue = Promise.resolve();
  async function onRecorderBlur(e) {
    if (!recorderState) return;
    var el = e.target;
    if (!el || !["INPUT", "TEXTAREA"].includes(el.tagName)) return;
    if (!el.value || el.value.length < 1) return;
    var capturedValue = el.value;
    var capturedSelectors = generateSelectors(el);
    var capturedSelector = capturedSelectors[0];
    var capturedLabelEl = el.id ? document.querySelector('label[for="' + el.id + '"]') : null;
    var capturedLabel = capturedLabelEl && capturedLabelEl.textContent.trim() || el.placeholder || el.name || "Champ";
    var capturedUrl = window.location.href;
    recorderBlurQueue = recorderBlurQueue.then(async function() {
      if (!recorderState) return;
      var variable = await detectVariable(capturedValue);
      var lastEtape = recorderState.etapes[recorderState.etapes.length - 1];
      if (lastEtape && lastEtape.action === "fill" && lastEtape.selector === capturedSelector) {
        lastEtape.variable = variable || "[VALEUR STATIQUE \u2014 \xC0 RENSEIGNER]";
        lastEtape.selectors = capturedSelectors;
        saveRecorderState();
        updateRecorderPanel();
        var dedupEl = document.querySelector(capturedSelector);
        if (dedupEl) highlightRecordedField(dedupEl, lastEtape.variable);
        showRPAToast3("\u23FA \xC9tape " + recorderState.etapes.length + " mise \xE0 jour \u2014 " + capturedLabel.slice(0, 20), "info");
        return;
      }
      var htmlSnapshot = anonymizeHtmlSnapshot();
      var newFillStep = {
        id: "step_" + (recorderState.etapes.length + 1),
        label: capturedLabel.slice(0, 50),
        action: "fill",
        selectorType: "css",
        selector: capturedSelector,
        selectors: capturedSelectors,
        /* Si valeur patient → variable ; sinon valeur statique masquée */
        variable: variable || "[VALEUR STATIQUE \u2014 \xC0 RENSEIGNER]",
        htmlSnapshot,
        url: capturedUrl,
        waitFor: null,
        timeout: 5e3
      };
      recorderState.etapes.push(newFillStep);
      saveRecorderState();
      updateRecorderPanel();
      var fillEl = document.querySelector(capturedSelector);
      if (fillEl) highlightRecordedField(fillEl, newFillStep.variable);
      showRPAToast3("\u23FA \xC9tape " + recorderState.etapes.length + " \u2014 " + capturedLabel.slice(0, 20) + (variable ? " \u2192 " + variable : " \u2192 statique"), "info");
    });
  }
  async function onRecorderChange(e) {
    if (!recorderState) return;
    var el = e.target;
    if (el.tagName !== "SELECT") return;
    var selectors = generateSelectors(el);
    var variable = await detectVariable(el.value);
    var label = el.name || el.id || "S\xE9lection";
    var htmlSnapshot = anonymizeHtmlSnapshot();
    var newSelectStep = {
      id: "step_" + (recorderState.etapes.length + 1),
      label: label.slice(0, 50),
      action: "select",
      selectorType: "css",
      selector: selectors[0],
      selectors,
      variable: variable || el.value,
      htmlSnapshot,
      url: window.location.href,
      waitFor: null,
      timeout: 5e3
    };
    recorderState.etapes.push(newSelectStep);
    saveRecorderState();
    updateRecorderPanel();
    highlightRecordedField(el, newSelectStep.variable);
    showRPAToast3("\u23FA \xC9tape " + recorderState.etapes.length + " \u2014 s\xE9lection " + label.slice(0, 20) + (variable ? " \u2192 " + variable : ""), "info");
  }
  function saveRecorderState() {
    if (!recorderState) return;
    var etapesSansHtml = recorderState.etapes.map(function(e) {
      var copy = Object.assign({}, e);
      delete copy.htmlSnapshot;
      return copy;
    });
    var pages = [];
    var seenUrls = {};
    for (var pi = 0; pi < recorderState.etapes.length; pi++) {
      var u = recorderState.etapes[pi].url;
      if (u && !seenUrls[u]) {
        seenUrls[u] = true;
        pages.push(u);
      }
    }
    chrome.storage.local.set({ optibot_recorder: {
      active: true,
      etapes: etapesSansHtml,
      hostname: recorderState.hostname,
      startTime: recorderState.startTime,
      pages
    } });
  }
  function restoreRecorderIfNeeded() {
    chrome.storage.local.get(["optibot_recorder"], function(result) {
      var saved = result.optibot_recorder;
      if (!saved || !saved.active) return;
      recorderState = {
        etapes: saved.etapes || [],
        hostname: saved.hostname || window.location.hostname.replace("www.", ""),
        startTime: saved.startTime || Date.now()
      };
      if (!document.getElementById("optibot-recorder-badge")) {
        var badge = document.createElement("div");
        badge.id = "optibot-recorder-badge";
        badge.style.cssText = "position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:2147483647;background:#ef4444;color:white;padding:8px 20px;border-radius:50px;font-family:sans-serif;font-size:13px;font-weight:bold;box-shadow:0 4px 15px rgba(0,0,0,0.3);display:flex;align-items:center;gap:8px;";
        badge.innerHTML = '<span style="width:10px;height:10px;background:white;border-radius:50%;display:inline-block;animation:pulse 1s infinite;"></span> Enregistrement en cours (' + recorderState.etapes.length + " \xE9tapes) \u2014 continuez le parcours";
        document.body.appendChild(badge);
      }
      document.addEventListener("click", onRecorderClick, true);
      document.addEventListener("change", onRecorderChange, true);
      document.addEventListener("blur", onRecorderBlur, true);
      showRecorderPanel();
      updateRecorderPanel();
      showRPAToast3("\u23FA Enregistrement repris (" + recorderState.etapes.length + " \xE9tapes d\xE9j\xE0 enregistr\xE9es)", "info");
    });
  }
  chrome.runtime.onMessage.addListener(function(msg) {
    if (msg && msg.type === "OPTIBOT_RECORDER_START") startRecorder();
    if (msg && msg.type === "OPTIBOT_RECORDER_STOP") stopRecorder();
    if (msg && msg.type === "OPTIBOT_RECORDER_STATUS") {
      chrome.runtime.sendMessage({ type: "OPTIBOT_RECORDER_STATUS_REPLY", active: !!recorderState, etapes: recorderState ? recorderState.etapes.length : 0 });
    }
  });
  globalThis.ultraFill = ultraFill2;
  globalThis.findElement = findElement2;
  globalThis.capitalize = typeof capitalize2 === "function" ? capitalize2 : function(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
  };
  globalThis.getOuvrantDroitNSS = getOuvrantDroitNSS2;
  globalThis.isUnder18 = isUnder182;
  globalThis.normalizePhone = normalizePhone2;
  globalThis.selectRadixOption = selectRadixOption2;
  globalThis.fillDatePicker = fillDatePicker;
  globalThis.smartSelectOption = smartSelectOption2;
  globalThis.findInShadowRoots = findInShadowRoots;
  globalThis.querySelectorAllDeep = querySelectorAllDeep;
  globalThis.waitForElement = waitForElement2;
  globalThis.validateLuhnNSS = validateLuhnNSS;
  globalThis.showRPAToast = showRPAToast3;
  globalThis.detectPageContext = detectPageContext;
  globalThis.checkDroitsMutuelle = checkDroitsMutuelle3;
  globalThis.saveSelectorCache = saveSelectorCache;
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vZXh0ZW5zaW9uLXNyYy9jb250ZW50L3BvcnRhbHMvZ2VuZXJhdGlvbi5qcyIsICIuLi9leHRlbnNpb24tc3JjL2NvbnRlbnQvcG9ydGFscy9saXZlYnlvcHRpbXVtLmpzIiwgIi4uL2V4dGVuc2lvbi1zcmMvY29udGVudC9wb3J0YWxzL3dlbWluZC5qcyIsICIuLi9leHRlbnNpb24tc3JjL2NvbnRlbnQvcG9ydGFscy9hcGdpcy5qcyIsICIuLi9leHRlbnNpb24tc3JjL2NvbnRlbnQvcG9ydGFscy9hY3RpbC5qcyIsICIuLi9leHRlbnNpb24tc3JjL2NvbnRlbnQvcG9ydGFscy9tZXJjZXIuanMiLCAiLi4vZXh0ZW5zaW9uLXNyYy9jb250ZW50L3BvcnRhbHMvdHAtcGx1cy5qcyIsICIuLi9leHRlbnNpb24tc3JjL2NvbnRlbnQvcG9ydGFscy9mZmwtcHJvbW90ZXVyLmpzIiwgIi4uL2V4dGVuc2lvbi1zcmMvY29udGVudC9wb3J0YWxzL3NvbGltdXQuanMiLCAiLi4vZXh0ZW5zaW9uLXNyYy9jb250ZW50L3BvcnRhbHMvYW1lbGkuanMiLCAiLi4vZXh0ZW5zaW9uLXNyYy9jb250ZW50L3BvcnRhbHMvYWxtZXJ5cy5qcyIsICIuLi9leHRlbnNpb24tc3JjL2NvbnRlbnQvcG9ydGFscy9veGFudGlzLmpzIiwgIi4uL2V4dGVuc2lvbi1zcmMvY29udGVudC9wb3J0YWxzL2luZGV4LmpzIiwgIi4uL2V4dGVuc2lvbi1zcmMvY29udGVudC91dGlscy9yZW1vdGUtc2VsZWN0b3JzLmpzIiwgIi4uL2V4dGVuc2lvbi1zcmMvY29udGVudC91dGlscy9maWVsZC1mZWVkYmFjay5qcyIsICIuLi9leHRlbnNpb24tc3JjL2NvbnRlbnQvdXRpbHMvc2VsZWN0b3ItaGVhbHRoLmpzIiwgIi4uL2V4dGVuc2lvbi1zcmMvY29udGVudC91dGlscy9yZWplY3Rpb24tcHJlZGljdG9yLmpzIiwgIi4uL2V4dGVuc2lvbi1zcmMvY29udGVudC9jb21tYW5kLWNlbnRlci5qcyIsICIuLi9leHRlbnNpb24tc3JjL2NvbnRlbnQvdXRpbHMvZGV2aXMtY2FwdHVyZS5qcyIsICIuLi9leHRlbnNpb24tc3JjL2NvbnRlbnQvdXRpbHMvZG9tLmpzIiwgIi4uL2V4dGVuc2lvbi1zcmMvY29udGVudC91dGlscy9mb3JtYXQuanMiLCAiLi4vZXh0ZW5zaW9uLXNyYy9jb250ZW50L3V0aWxzL2RhdGEuanMiLCAiLi4vZXh0ZW5zaW9uLXNyYy9jb250ZW50L3V0aWxzL2ZpZWxkLW1hdGNoaW5nLmpzIiwgIi4uL2V4dGVuc2lvbi1zcmMvY29udGVudC91dGlscy9zZWxlY3Rvci1jYWNoZS5qcyIsICIuLi9leHRlbnNpb24tc3JjL2NvbnRlbnQvdXRpbHMvZmlsbC5qcyIsICIuLi9leHRlbnNpb24tc3JjL2NvbnRlbnQvc21hcnQtZmlsbC9sZWFybmluZy5qcyIsICIuLi9leHRlbnNpb24tc3JjL2NvbnRlbnQvc21hcnQtZmlsbC9pbmRleC5qcyIsICIuLi9leHRlbnNpb24tc3JjL2NvbnRlbnQvc3RhbmRhcmQtZmlsbC9pbmRleC5qcyIsICIuLi9leHRlbnNpb24tc3JjL2NvbnRlbnQvcmVwbGF5L2luZGV4LmpzIiwgIi4uL2V4dGVuc2lvbi1zcmMvY29udGVudC9ycGEvaW5kZXguanMiLCAiLi4vZXh0ZW5zaW9uLXNyYy9jb250ZW50L2luZGV4LmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgZGVmYXVsdCB7XG4gIG5hbWU6IFwiR2VuZXJhdGlvblwiLFxuICBpc01hdGNoOiAoKSA9PiB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUuaW5jbHVkZXMoXCJnZW5lcmF0aW9uLmZyXCIpLFxuICBhY3Rpb25zOiB7XG4gICAgZm9ybXVsYWlyZTogKGRhdGEpID0+IHtcbiAgICAgIHZhciBtID0gZGF0YS5tIHx8IHt9O1xuICAgICAgdmFyIG8gPSBkYXRhLm8gfHwge307XG4gICAgICB2YXIgYyA9IGRhdGEuY2FjaGVkIHx8IHt9O1xuICAgICAgdmFyIGZpbGxlZCA9IDA7XG5cbiAgICAgIC8qIFx1MjUwMFx1MjUwMCBQYWdlIDEgOiBSZWNoZXJjaGUgYWRoXHUwMEU5cmVudCAoVHh0Tm9BZGgpIFx1MjUwMFx1MjUwMCAqL1xuICAgICAgdmFyIGFkaEVsID0gZmluZEVsZW1lbnQoJyNjdGwwMF9DcGhfVHh0Tm9BZGgnKTtcbiAgICAgIGlmIChhZGhFbCkge1xuICAgICAgICB2YXIgbm9BZGggPSBtLm51bWVyb0FkaGVyZW50IHx8IChjLnJlZ2ltZXMgJiYgYy5yZWdpbWVzLnJjMSAmJiBjLnJlZ2ltZXMucmMxLm51bWVyb0FkaGVyZW50KSB8fCBjLm51bWVyb0FkaGVyZW50IHx8IFwiXCI7XG4gICAgICAgIHZhciBuc3MgPSBtLm51bWVyb1NlY3VyaXRlU29jaWFsZSB8fCBjLm5zcyB8fCBcIlwiO1xuICAgICAgICB2YXIgZGlnaXRzID0gbnNzLnJlcGxhY2UoL1xcRC9nLCBcIlwiKS5zbGljZSgwLCAxNSk7XG4gICAgICAgIHZhciBmb3JtYXR0ZWROU1MgPSBkaWdpdHM7XG4gICAgICAgIGlmIChkaWdpdHMubGVuZ3RoID49IDEzKSB7XG4gICAgICAgICAgZm9ybWF0dGVkTlNTID0gZGlnaXRzWzBdICsgXCIgXCIgKyBkaWdpdHMuc2xpY2UoMSwzKSArIFwiIFwiICsgZGlnaXRzLnNsaWNlKDMsNSkgKyBcIiBcIiArIGRpZ2l0cy5zbGljZSg1LDcpICsgXCIgXCIgKyBkaWdpdHMuc2xpY2UoNywxMCkgKyBcIiBcIiArIGRpZ2l0cy5zbGljZSgxMCwxMyk7XG4gICAgICAgICAgaWYgKGRpZ2l0cy5sZW5ndGggPj0gMTUpIGZvcm1hdHRlZE5TUyArPSBcIiBcIiArIGRpZ2l0cy5zbGljZSgxMywxNSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vQWRoKSB7IHVsdHJhRmlsbChhZGhFbCwgbm9BZGgpOyBmaWxsZWQrKzsgfVxuICAgICAgICBpZiAoZm9ybWF0dGVkTlNTKSB7IHVsdHJhRmlsbChmaW5kRWxlbWVudCgnI2N0bDAwX0NwaF9UeHROb1NTJyksIGZvcm1hdHRlZE5TUyk7IGZpbGxlZCsrOyB9XG4gICAgICAgIHJldHVybiBmaWxsZWQgPiAwO1xuICAgICAgfVxuXG4gICAgICAvKiBcdTI1MDBcdTI1MDAgUGFnZSAyIDogU2ltdWxhdGlvbiBWZXJyZXMvTW9udHVyZSBcdTI1MDBcdTI1MDAgKi9cbiAgICAgIHZhciBhZGVsaUVsID0gZmluZEVsZW1lbnQoJyNjdGwwMF9DcGhfVENDYWxjdWxfVFBWZXJyZXNNb250X0RkbE5vQWRlbGlQcmVzY3JpcHRldXInKTtcbiAgICAgIGlmIChhZGVsaUVsKSB7XG4gICAgICAgIHZhciBvcmRvbm5hbmNlID0gbyB8fCAoYy5vcmRvbm5hbmNlKSB8fCB7fTtcbiAgICAgICAgdmFyIHByZXNjcmlwdGlvbiA9IGMucHJlc2NyaXB0aW9uIHx8IGMub3Jkb25uYW5jZSB8fCB7fTtcbiAgICAgICAgdmFyIG9kID0gby5sdW5ldHRlc09EIHx8IHByZXNjcmlwdGlvbi5vZCB8fCB7fTtcbiAgICAgICAgdmFyIG9nID0gby5sdW5ldHRlc09HIHx8IHByZXNjcmlwdGlvbi5vZyB8fCB7fTtcbiAgICAgICAgdmFyIGVxRGF0YSA9IGMuZXF1aXBlbWVudHMgfHwgW107XG4gICAgICAgIHZhciBtb250dXJlTGlnbmUgPSBudWxsLCB2ZXJyZU9EID0gbnVsbCwgdmVycmVPRyA9IG51bGw7XG4gICAgICAgIGZvciAodmFyIGVpID0gMDsgZWkgPCBlcURhdGEubGVuZ3RoOyBlaSsrKSB7XG4gICAgICAgICAgdmFyIGxpZ25lcyA9IGVxRGF0YVtlaV0ubGlnbmVzIHx8IFtdO1xuICAgICAgICAgIGZvciAodmFyIGxpID0gMDsgbGkgPCBsaWduZXMubGVuZ3RoOyBsaSsrKSB7XG4gICAgICAgICAgICB2YXIgbGlnbmUgPSBsaWduZXNbbGldO1xuICAgICAgICAgICAgaWYgKGxpZ25lLnR5cGUgPT09IFwibW9udHVyZVwiICYmICFtb250dXJlTGlnbmUpIG1vbnR1cmVMaWduZSA9IGxpZ25lO1xuICAgICAgICAgICAgaWYgKGxpZ25lLnR5cGUgPT09IFwidmVycmVcIikge1xuICAgICAgICAgICAgICBpZiAobGlnbmUub2VpbCA9PT0gXCJPRFwiICYmICF2ZXJyZU9EKSB2ZXJyZU9EID0gbGlnbmU7XG4gICAgICAgICAgICAgIGVsc2UgaWYgKGxpZ25lLm9laWwgPT09IFwiT0dcIiAmJiAhdmVycmVPRykgdmVycmVPRyA9IGxpZ25lO1xuICAgICAgICAgICAgICBlbHNlIGlmICghdmVycmVPRCkgdmVycmVPRCA9IGxpZ25lO1xuICAgICAgICAgICAgICBlbHNlIGlmICghdmVycmVPRykgdmVycmVPRyA9IGxpZ25lO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIE5cdTAwQjAgQURFTEkgUHJlc2NyaXB0ZXVyICovXG4gICAgICAgIHZhciBycHBzID0gby5ycHBzIHx8IG9yZG9ubmFuY2UucnBwcyB8fCBwcmVzY3JpcHRpb24ucnBwcyB8fCBjLnJwcHMgfHwgXCJcIjtcbiAgICAgICAgaWYgKHJwcHMpIHsgdWx0cmFGaWxsKGFkZWxpRWwsIHJwcHMucmVwbGFjZSgvXFxEL2csIFwiXCIpLnNsaWNlKDAsIDkpKTsgZmlsbGVkKys7IH1cblxuICAgICAgICAvKiBEYXRlIG9yZG9ubmFuY2UgKi9cbiAgICAgICAgdmFyIGRhdGVPcmRvID0gby5kYXRlT3Jkb25uYW5jZSB8fCBvcmRvbm5hbmNlLmRhdGVPcmRvbm5hbmNlIHx8IFwiXCI7XG4gICAgICAgIHZhciBkYXRlT3Jkb0VsID0gZmluZEVsZW1lbnQoJyNjdGwwMF9DcGhfVENDYWxjdWxfVFBWZXJyZXNNb250X0NET3Jkb1ZlcnJlc01vbnRfVGV4dEJveERhdGUnKTtcbiAgICAgICAgaWYgKGRhdGVPcmRvICYmIGRhdGVPcmRvRWwgJiYgIWRhdGVPcmRvRWwuZGlzYWJsZWQpIHsgdWx0cmFGaWxsKGRhdGVPcmRvRWwsIGRhdGVPcmRvKTsgZmlsbGVkKys7IH1cblxuICAgICAgICAvKiBPRCBcdTIwMTQgQ29ycmVjdGlvbiAqL1xuICAgICAgICBpZiAob2Quc3BoZXJlKSB7IHVsdHJhRmlsbChmaW5kRWxlbWVudCgnI2N0bDAwX0NwaF9UQ0NhbGN1bF9UUFZlcnJlc01vbnRfVHh0U3BoZXJlRCcpLCBvZC5zcGhlcmUpOyBmaWxsZWQrKzsgfVxuICAgICAgICBpZiAob2QuY3lsaW5kcmUpIHsgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCcjY3RsMDBfQ3BoX1RDQ2FsY3VsX1RQVmVycmVzTW9udF9UeHRDeWxEJyksIG9kLmN5bGluZHJlKTsgZmlsbGVkKys7IH1cbiAgICAgICAgaWYgKG9kLmF4ZSkgeyB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJyNjdGwwMF9DcGhfVENDYWxjdWxfVFBWZXJyZXNNb250X1R4dEF4ZUQnKSwgb2QuYXhlKTsgZmlsbGVkKys7IH1cbiAgICAgICAgaWYgKG9kLmFkZGl0aW9uKSB7IHVsdHJhRmlsbChmaW5kRWxlbWVudCgnI2N0bDAwX0NwaF9UQ0NhbGN1bF9UUFZlcnJlc01vbnRfVHh0QWRkRCcpLCBvZC5hZGRpdGlvbik7IGZpbGxlZCsrOyB9XG5cbiAgICAgICAgLyogT0QgXHUyMDE0IFZlcnJlIChjb2RlIExQUCwgbW9udGFudCkgKi9cbiAgICAgICAgaWYgKHZlcnJlT0QpIHtcbiAgICAgICAgICBpZiAodmVycmVPRC5jb2RlTFBQKSB7IHVsdHJhRmlsbChmaW5kRWxlbWVudCgnI2N0bDAwX0NwaF9UQ0NhbGN1bF9UUFZlcnJlc01vbnRfVHh0Q29kZUxQUEQnKSwgdmVycmVPRC5jb2RlTFBQKTsgZmlsbGVkKys7IH1cbiAgICAgICAgICBpZiAodmVycmVPRC5wcml4QnJ1dCkgeyB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJyNjdGwwMF9DcGhfVENDYWxjdWxfVFBWZXJyZXNNb250X1R4dE10VmVycmVEJyksIFN0cmluZyh2ZXJyZU9ELnByaXhCcnV0KS5yZXBsYWNlKFwiLlwiLCBcIixcIikpOyBmaWxsZWQrKzsgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyogT0cgXHUyMDE0IENvcnJlY3Rpb24gKi9cbiAgICAgICAgaWYgKG9nLnNwaGVyZSkgeyB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJyNjdGwwMF9DcGhfVENDYWxjdWxfVFBWZXJyZXNNb250X1R4dFNwaGVyZUcnKSwgb2cuc3BoZXJlKTsgZmlsbGVkKys7IH1cbiAgICAgICAgaWYgKG9nLmN5bGluZHJlKSB7IHVsdHJhRmlsbChmaW5kRWxlbWVudCgnI2N0bDAwX0NwaF9UQ0NhbGN1bF9UUFZlcnJlc01vbnRfVHh0Q3lsRycpLCBvZy5jeWxpbmRyZSk7IGZpbGxlZCsrOyB9XG4gICAgICAgIGlmIChvZy5heGUpIHsgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCcjY3RsMDBfQ3BoX1RDQ2FsY3VsX1RQVmVycmVzTW9udF9UeHRBeGVHJyksIG9nLmF4ZSk7IGZpbGxlZCsrOyB9XG4gICAgICAgIGlmIChvZy5hZGRpdGlvbikgeyB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJyNjdGwwMF9DcGhfVENDYWxjdWxfVFBWZXJyZXNNb250X1R4dEFkZEcnKSwgb2cuYWRkaXRpb24pOyBmaWxsZWQrKzsgfVxuXG4gICAgICAgIC8qIE9HIFx1MjAxNCBWZXJyZSAoY29kZSBMUFAsIG1vbnRhbnQpICovXG4gICAgICAgIGlmICh2ZXJyZU9HKSB7XG4gICAgICAgICAgaWYgKHZlcnJlT0cuY29kZUxQUCkgeyB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJyNjdGwwMF9DcGhfVENDYWxjdWxfVFBWZXJyZXNNb250X1R4dENvZGVMUFBHJyksIHZlcnJlT0cuY29kZUxQUCk7IGZpbGxlZCsrOyB9XG4gICAgICAgICAgaWYgKHZlcnJlT0cucHJpeEJydXQpIHsgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCcjY3RsMDBfQ3BoX1RDQ2FsY3VsX1RQVmVycmVzTW9udF9UeHRNdFZlcnJlRycpLCBTdHJpbmcodmVycmVPRy5wcml4QnJ1dCkucmVwbGFjZShcIi5cIiwgXCIsXCIpKTsgZmlsbGVkKys7IH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIE1vbnR1cmUgKi9cbiAgICAgICAgaWYgKG1vbnR1cmVMaWduZSkge1xuICAgICAgICAgIGlmIChtb250dXJlTGlnbmUuY29kZUxQUCkgeyB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJyNjdGwwMF9DcGhfVENDYWxjdWxfVFBWZXJyZXNNb250X1R4dENvZGVMUFBNb250JyksIG1vbnR1cmVMaWduZS5jb2RlTFBQKTsgZmlsbGVkKys7IH1cbiAgICAgICAgICBpZiAobW9udHVyZUxpZ25lLnByaXhCcnV0KSB7IHVsdHJhRmlsbChmaW5kRWxlbWVudCgnI2N0bDAwX0NwaF9UQ0NhbGN1bF9UUFZlcnJlc01vbnRfVHh0TXRNb250JyksIFN0cmluZyhtb250dXJlTGlnbmUucHJpeEJydXQpLnJlcGxhY2UoXCIuXCIsIFwiLFwiKSk7IGZpbGxlZCsrOyB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zb2xlLmluZm8oXCJbT3B0aUJvdCBHZW5lcmF0aW9uXSBQYWdlIHNpbXVsYXRpb24gXHUyMDE0IGZpbGxlZDpcIiwgZmlsbGVkLCBcInwgaGFzT0Q6XCIsICEhb2QsIFwifCBoYXNPRzpcIiwgISFvZywgXCJ8IG1vbnR1cmU6XCIsICEhbW9udHVyZUxpZ25lLCBcInwgdmVycmVPRDpcIiwgISF2ZXJyZU9ELCBcInwgdmVycmVPRzpcIiwgISF2ZXJyZU9HKTtcbiAgICAgICAgcmV0dXJuIGZpbGxlZCA+IDA7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuICAgIHN5bmNocm9uaXNlcjogYXN5bmMgKCkgPT4gZmFsc2VcbiAgfVxufTtcbiIsICJjb25zdCBMQk9fU0VMRUNUT1JTID0ge1xuICBub206ICdbbmFtZT1cImluZm9zX2NsaWVudFtub21dXCJdJyxcbiAgcHJlbm9tOiAnW25hbWU9XCJpbmZvc19jbGllbnRbcHJlbm9tXVwiXScsXG4gIGRvYjogJ1tuYW1lPVwiaW5mb3NfY2xpZW50W2RhdGVfbmFpc3NhbmNlXVwiXScsXG4gIG5zczogJ1tuYW1lPVwiaW5mb3NfY2xpZW50W251bV9zc11cIl0nLFxuICBjbGU6ICdbbmFtZT1cImluZm9zX2NsaWVudFtjbGVfc3NdXCJdJyxcbiAgcGhvbmU6ICcjdGVsZXBob25lX2Zvcm1fY2xpZW50XzUnLFxuICBlbWFpbDogJ1tuYW1lPVwiaW5mb3NfY2xpZW50W2VtYWlsXVwiXScsXG4gIGFkZHJlc3M6ICdbbmFtZT1cImluZm9zX2NsaWVudFthZHJlc3NlXVtsaWduZV8xXVwiXScsXG4gIHppcDogJ1tuYW1lPVwiaW5mb3NfY2xpZW50W2FkcmVzc2VdW2NvZGVfcG9zdGFsXVwiXScsXG4gIGNpdHk6ICdbbmFtZT1cImluZm9zX2NsaWVudFthZHJlc3NlXVt2aWxsZV1cIl0nLFxuICBub21Bc3N1cmU6ICdbbmFtZT1cImluZm9zX2NsaWVudFtub21fYXNzdXJlXVwiXScsXG4gIHJhbmdOYWlzc2FuY2U6ICdbbmFtZT1cImluZm9zX2NsaWVudFtyYW5nX25haXNzYW5jZV1cIl0nLFxuICBpc0FzdGlnbWF0ZTogJ1tuYW1lPVwiaW5mb3NfY2xpZW50W2lzX2FzdGlnbWF0ZV1cIl0nXG59O1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIG5hbWU6IFwiTGl2ZWJ5T3B0aW11bVwiLFxuICBpc01hdGNoOiAoKSA9PiB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUuaW5jbHVkZXMoXCJsaXZlYnlvcHRpbXVtLmNvbVwiKSxcbiAgc2VsZWN0b3JzOiBMQk9fU0VMRUNUT1JTLFxuICBhY3Rpb25zOiB7XG4gICAgZm9ybXVsYWlyZTogKGRhdGEpID0+IHtcbiAgICAgIC8qIENoYW1wIHJlY2hlcmNoZSBjbGllbnQgKHBhZ2UgYWNjdWVpbCAvIGJhcnJlIGRlIHJlY2hlcmNoZSkgKi9cbiAgICAgIGNvbnN0IHNlYXJjaElucHV0ID0gZmluZEVsZW1lbnQoJyNpbnB1dF9yZWNoZXJjaGVfY2xpZW50Jyk7XG4gICAgICBjb25zdCBmb3JtQ2hlY2sgPSBmaW5kRWxlbWVudChMQk9fU0VMRUNUT1JTLm5vbSk7XG5cbiAgICAgIGlmIChzZWFyY2hJbnB1dCAmJiAhZm9ybUNoZWNrKSB7XG4gICAgICAgIGNvbnN0IG0gPSBkYXRhLm0gfHwge307XG4gICAgICAgIGNvbnN0IG8gPSBkYXRhLm8gfHwge307XG4gICAgICAgIGNvbnN0IGMgPSBkYXRhLmNhY2hlZCB8fCB7fTtcbiAgICAgICAgY29uc3QgcDAgPSAobS5wZXJzb25uZXMgJiYgbS5wZXJzb25uZXMubGVuZ3RoID4gMCkgPyBtLnBlcnNvbm5lc1swXSA6IHt9O1xuICAgICAgICBjb25zdCBub20gPSAobS5ub20gfHwgcDAubm9tIHx8IG8ubm9tUGF0aWVudCB8fCBjLm5vbSB8fCBcIlwiKS50b1VwcGVyQ2FzZSgpO1xuICAgICAgICBpZiAobm9tKSB7XG4gICAgICAgICAgdWx0cmFGaWxsKHNlYXJjaElucHV0LCBub20pO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFmb3JtQ2hlY2spIHJldHVybiBmYWxzZTtcblxuICAgICAgY29uc3QgbSA9IGRhdGEubSB8fCB7fTtcbiAgICAgIGNvbnN0IG8gPSBkYXRhLm8gfHwge307XG4gICAgICBjb25zdCBjID0gZGF0YS5jYWNoZWQgfHwge307XG4gICAgICBjb25zdCBwMCA9IChtLnBlcnNvbm5lcyAmJiBtLnBlcnNvbm5lcy5sZW5ndGggPiAwKSA/IG0ucGVyc29ubmVzWzBdIDoge307XG5cbiAgICAgIGNvbnN0IHJhd05TUyA9IG0ubnVtZXJvU2VjdXJpdGVTb2NpYWxlIHx8IHAwLm51bWVyb1NlY3VyaXRlU29jaWFsZSB8fCBjLm5zcyB8fCBcIlwiO1xuICAgICAgY29uc3QgZG9iID0gbS5kYXRlTmFpc3NhbmNlIHx8IHAwLmRhdGVOYWlzc2FuY2UgfHwgby5kYXRlTmFpc3NhbmNlUGF0aWVudCB8fCBjLmRvYiB8fCBcIlwiO1xuICAgICAgY29uc3QgbnNzID0gZ2V0T3V2cmFudERyb2l0TlNTKHJhd05TUywgZG9iLCBtLnBlcnNvbm5lcyk7XG5cbiAgICAgIGNvbnN0IG1hcHBpbmcgPSB7XG4gICAgICAgICdpbmZvc19jbGllbnRbY2l2aWxpdGVfdHlwZV9pZF0nOiBuc3Muc3RhcnRzV2l0aCgnMScpID8gJzEnIDogKG5zcy5zdGFydHNXaXRoKCcyJykgPyAnMicgOiAnMCcpLFxuICAgICAgICAnaW5mb3NfY2xpZW50W25vbV0nOiAobS5ub20gfHwgcDAubm9tIHx8IG8ubm9tUGF0aWVudCB8fCBjLm5vbSB8fCBcIlwiKS50b1VwcGVyQ2FzZSgpLFxuICAgICAgICAnaW5mb3NfY2xpZW50W3ByZW5vbV0nOiBjYXBpdGFsaXplKG0ucHJlbm9tIHx8IHAwLnByZW5vbSB8fCBvLnByZW5vbVBhdGllbnQgfHwgYy5wcmVub20gfHwgXCJcIiksXG4gICAgICAgICdpbmZvc19jbGllbnRbZGF0ZV9uYWlzc2FuY2VdJzogZG9iLFxuICAgICAgICAnaW5mb3NfY2xpZW50W251bV9zc10nOiBuc3Muc2xpY2UoMCwgMTMpLFxuICAgICAgICAnaW5mb3NfY2xpZW50W2NsZV9zc10nOiBuc3Muc2xpY2UoMTMsIDE1KSxcbiAgICAgICAgJ2luZm9zX2NsaWVudFtlbWFpbF0nOiBjLmVtYWlsIHx8IFwiXCIsXG4gICAgICAgICdpbmZvc19jbGllbnRbYWRyZXNzZV1bbGlnbmVfMV0nOiBjLmFkZHJlc3MgfHwgXCJcIixcbiAgICAgICAgJ2luZm9zX2NsaWVudFthZHJlc3NlXVtjb2RlX3Bvc3RhbF0nOiBjLnppcENvZGUgfHwgXCJcIixcbiAgICAgICAgJ2luZm9zX2NsaWVudFthZHJlc3NlXVt2aWxsZV0nOiBjLmNpdHkgfHwgXCJcIixcbiAgICAgICAgJ2luZm9zX2NsaWVudFtub21fYXNzdXJlXSc6IGMubm9tQXNzdXJlIHx8IFwiXCIsXG4gICAgICAgICdpbmZvc19jbGllbnRbcmFuZ19uYWlzc2FuY2VdJzogYy5yYW5nTmFpc3NhbmNlIHx8IFwiXCJcbiAgICAgIH07XG5cbiAgICAgIGZvciAoY29uc3QgW25hbWUsIHZhbF0gb2YgT2JqZWN0LmVudHJpZXMobWFwcGluZykpIHtcbiAgICAgICAgaWYgKHZhbCkgdWx0cmFGaWxsKGZpbmRFbGVtZW50KGBbbmFtZT1cIiR7bmFtZX1cIl1gKSwgdmFsKTtcbiAgICAgIH1cblxuICAgICAgLyogVFx1MDBFOWxcdTAwRTlwaG9uZSBwb3J0YWJsZSB2aWEgaW50bC10ZWwtaW5wdXQgKGNoYW1wIHZpc2libGUgI3RlbGVwaG9uZV9mb3JtX2NsaWVudF81KSAqL1xuICAgICAgdmFyIHBob25lVmFsID0gbm9ybWFsaXplUGhvbmUoYy5waG9uZSB8fCBcIlwiKTtcbiAgICAgIGlmIChwaG9uZVZhbCkge1xuICAgICAgICB2YXIgcGhvbmVFbCA9IGZpbmRFbGVtZW50KCcjdGVsZXBob25lX2Zvcm1fY2xpZW50XzUnKTtcbiAgICAgICAgaWYgKHBob25lRWwpIHVsdHJhRmlsbChwaG9uZUVsLCBwaG9uZVZhbCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHNwaCA9IG8ubHVuZXR0ZXNPRD8uc3BoZXJlIHx8IG8ubGVudGlsbGVzT0Q/LnNwaGVyZTtcbiAgICAgIGNvbnN0IGN5bCA9IG8ubHVuZXR0ZXNPRD8uY3lsaW5kcmUgfHwgby5sZW50aWxsZXNPRD8uY3lsaW5kcmU7XG4gICAgICBpZiAoc3BoKSB7XG4gICAgICAgIGNvbnN0IGlzTXlvcGUgPSBwYXJzZUZsb2F0KHNwaC5yZXBsYWNlKCcsJywgJy4nKSkgPCAwO1xuICAgICAgICBjb25zdCBtRWwgPSBmaW5kRWxlbWVudCgnW25hbWU9XCJpbmZvc19jbGllbnRbaXNfbXlvcGVdXCJdJyk7XG4gICAgICAgIGlmIChtRWwgJiYgbUVsLmNoZWNrZWQgIT09IGlzTXlvcGUpIG1FbC5jbGljaygpO1xuICAgICAgICBjb25zdCBoRWwgPSBmaW5kRWxlbWVudCgnW25hbWU9XCJpbmZvc19jbGllbnRbaXNfaHlwZXJtZXRyb3BlXVwiXScpO1xuICAgICAgICBpZiAoaEVsICYmIGhFbC5jaGVja2VkICE9PSAhaXNNeW9wZSkgaEVsLmNsaWNrKCk7XG4gICAgICB9XG5cbiAgICAgIC8qIEFzdGlnbWF0ZSA6IGNvY2hcdTAwRTkgc2kgY3lsaW5kcmUgbm9uIG51bCAqL1xuICAgICAgaWYgKGN5bCkge1xuICAgICAgICBjb25zdCBjeWxWYWwgPSBwYXJzZUZsb2F0KGN5bC5yZXBsYWNlKCcsJywgJy4nKSk7XG4gICAgICAgIGlmIChjeWxWYWwgIT09IDApIHtcbiAgICAgICAgICBjb25zdCBhRWwgPSBmaW5kRWxlbWVudCgnW25hbWU9XCJpbmZvc19jbGllbnRbaXNfYXN0aWdtYXRlXVwiXScpO1xuICAgICAgICAgIGlmIChhRWwgJiYgIWFFbC5jaGVja2VkKSBhRWwuY2xpY2soKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuICAgIHN5bmNocm9uaXNlcjogYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgcyA9IExCT19TRUxFQ1RPUlM7XG4gICAgICBjb25zdCBjbGllbnQgPSB7XG4gICAgICAgIG5vbTogZmluZEVsZW1lbnQocy5ub20pPy52YWx1ZSxcbiAgICAgICAgcHJlbm9tOiBmaW5kRWxlbWVudChzLnByZW5vbSk/LnZhbHVlLFxuICAgICAgICBkb2I6IGZpbmRFbGVtZW50KHMuZG9iKT8udmFsdWUsXG4gICAgICAgIG5zczogKGZpbmRFbGVtZW50KHMubnNzKT8udmFsdWUgfHwgXCJcIikgKyAoZmluZEVsZW1lbnQocy5jbGUpPy52YWx1ZSB8fCBcIlwiKSxcbiAgICAgICAgcGhvbmU6IGZpbmRFbGVtZW50KHMucGhvbmUpPy52YWx1ZSxcbiAgICAgICAgZW1haWw6IGZpbmRFbGVtZW50KHMuZW1haWwpPy52YWx1ZSxcbiAgICAgICAgYWRkcmVzczogZmluZEVsZW1lbnQocy5hZGRyZXNzKT8udmFsdWUsXG4gICAgICAgIHppcENvZGU6IGZpbmRFbGVtZW50KHMuemlwKT8udmFsdWUsXG4gICAgICAgIGNpdHk6IGZpbmRFbGVtZW50KHMuY2l0eSk/LnZhbHVlLFxuICAgICAgICBub21Bc3N1cmU6IGZpbmRFbGVtZW50KHMubm9tQXNzdXJlKT8udmFsdWUsXG4gICAgICAgIHJhbmdOYWlzc2FuY2U6IGZpbmRFbGVtZW50KHMucmFuZ05haXNzYW5jZSk/LnZhbHVlLFxuICAgICAgICB1cGRhdGVkQXQ6IERhdGUubm93KCksXG4gICAgICAgIGV4cGlyZXNBdDogRGF0ZS5ub3coKSArIDYwICogNjAgKiAxMDAwXG4gICAgICB9O1xuXG4gICAgICAvKiBTY3JhcGUgZGVzIHByZXNjcmlwdGlvbnMgKi9cbiAgICAgIHZhciBwcmVzY3JpcHRpb24gPSB7fTtcbiAgICAgIHZhciBwcmVzY1RhYiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNuYXYtdGFiLXByZXNjcmlwdGlvbnMnKTtcbiAgICAgIGlmIChwcmVzY1RhYikge1xuICAgICAgICB2YXIgcHJlc2NMaXMgPSBwcmVzY1RhYi5xdWVyeVNlbGVjdG9yQWxsKCdsaScpO1xuICAgICAgICBmb3IgKHZhciBwaSA9IDA7IHBpIDwgcHJlc2NMaXMubGVuZ3RoOyBwaSsrKSB7XG4gICAgICAgICAgdmFyIGxpID0gcHJlc2NMaXNbcGldO1xuICAgICAgICAgIHZhciBjb250ZW50ID0gbGkucXVlcnlTZWxlY3RvcignLmxpbmVfY29udGVudCcpO1xuICAgICAgICAgIGlmICghY29udGVudCkgY29udGludWU7XG4gICAgICAgICAgdmFyIHRleHQgPSBjb250ZW50LnRleHRDb250ZW50LnRyaW0oKTtcblxuICAgICAgICAgIGlmIChsaS5xdWVyeVNlbGVjdG9yKCcucHJlc2NyaXB0ZXVyJykpIHtcbiAgICAgICAgICAgIHZhciBwYXJ0cyA9IHRleHQuc3BsaXQoJyAtICcpO1xuICAgICAgICAgICAgcHJlc2NyaXB0aW9uLnByZXNjcmlwdGV1ciA9IHBhcnRzWzBdID8gcGFydHNbMF0udHJpbSgpIDogJyc7XG4gICAgICAgICAgICBwcmVzY3JpcHRpb24ucnBwcyA9IHBhcnRzWzFdID8gcGFydHNbMV0udHJpbSgpIDogJyc7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChsaS5xdWVyeVNlbGVjdG9yKCcucmVub3V2ZWxsZW1lbnQnKSAmJiAhbGkuY2xhc3NMaXN0LmNvbnRhaW5zKCdoaWRkZW4nKSkge1xuICAgICAgICAgICAgdmFyIGRhdGVNYXRjaCA9IHRleHQubWF0Y2goLyhcXGR7Mn1cXC9cXGR7Mn1cXC9cXGR7NH0pLyk7XG4gICAgICAgICAgICBwcmVzY3JpcHRpb24uZGF0ZVByZXNjcmlwdGlvbiA9IGRhdGVNYXRjaCA/IGRhdGVNYXRjaFsxXSA6ICcnO1xuICAgICAgICAgICAgcHJlc2NyaXB0aW9uLnR5cGVWaXNpb24gPSB0ZXh0LnJlcGxhY2UoZGF0ZU1hdGNoID8gZGF0ZU1hdGNoWzBdIDogJycsICcnKS5yZXBsYWNlKC9kdVxccyokLywgJycpLnJlcGxhY2UoL1xccysvZywgJyAnKS50cmltKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChsaS5xdWVyeVNlbGVjdG9yKCcuZmEtZXllJykgJiYgIWxpLmNsYXNzTGlzdC5jb250YWlucygnaGlkZGVuJykpIHtcbiAgICAgICAgICAgIHZhciBjb3JyTWF0Y2ggPSB0ZXh0Lm1hdGNoKC9eKE9EfE9HKVxccyo6XFxzKihbKy1dP1xcZCtbXFwuLF1cXGQrKVxccypcXCgoWystXT9cXGQrW1xcLixdXFxkKylcXClcXHMqKFxcZCspXHUwMEIwXFxzKkFERDpcXHMqKFsrLV0/XFxkK1tcXC4sXVxcZCspLyk7XG4gICAgICAgICAgICBpZiAoY29yck1hdGNoKSB7XG4gICAgICAgICAgICAgIHZhciBvZWlsID0gY29yck1hdGNoWzFdLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgIHByZXNjcmlwdGlvbltvZWlsXSA9IHtcbiAgICAgICAgICAgICAgICBzcGhlcmU6IGNvcnJNYXRjaFsyXS5yZXBsYWNlKCcsJywgJy4nKSxcbiAgICAgICAgICAgICAgICBjeWxpbmRyZTogY29yck1hdGNoWzNdLnJlcGxhY2UoJywnLCAnLicpLFxuICAgICAgICAgICAgICAgIGF4ZTogY29yck1hdGNoWzRdLFxuICAgICAgICAgICAgICAgIGFkZGl0aW9uOiBjb3JyTWF0Y2hbNV0ucmVwbGFjZSgnLCcsICcuJyksXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChsaS5xdWVyeVNlbGVjdG9yKCcuaWNvbi1jb250YWN0cycpICYmICFsaS5jbGFzc0xpc3QuY29udGFpbnMoJ2hpZGRlbicpKSB7XG4gICAgICAgICAgICB2YXIgbGVudE1hdGNoID0gdGV4dC5tYXRjaCgvXihPRHxPRylcXHMqOlxccyooWystXT9cXGQrW1xcLixdXFxkKylcXHMqXFwoKFsrLV0/XFxkK1tcXC4sXVxcZCspXFwpXFxzKihcXGQrKVx1MDBCMFxccypBREQ6XFxzKihbKy1dP1xcZCtbXFwuLF1cXGQrKS8pO1xuICAgICAgICAgICAgaWYgKGxlbnRNYXRjaCkge1xuICAgICAgICAgICAgICB2YXIgb2VpbEwgPSAnbGVudGlsbGVzJyArIGxlbnRNYXRjaFsxXTtcbiAgICAgICAgICAgICAgcHJlc2NyaXB0aW9uW29laWxMXSA9IHtcbiAgICAgICAgICAgICAgICBzcGhlcmU6IGxlbnRNYXRjaFsyXS5yZXBsYWNlKCcsJywgJy4nKSxcbiAgICAgICAgICAgICAgICBjeWxpbmRyZTogbGVudE1hdGNoWzNdLnJlcGxhY2UoJywnLCAnLicpLFxuICAgICAgICAgICAgICAgIGF4ZTogbGVudE1hdGNoWzRdLFxuICAgICAgICAgICAgICAgIGFkZGl0aW9uOiBsZW50TWF0Y2hbNV0ucmVwbGFjZSgnLCcsICcuJyksXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjbGllbnQucHJlc2NyaXB0aW9uID0gcHJlc2NyaXB0aW9uO1xuXG4gICAgICAvKiBTY3JhcGUgZGVzIHJcdTAwRTlnaW1lcyAoUk8gKyBSQykgKi9cbiAgICAgIHZhciByZWdpbWVzID0ge307XG4gICAgICAvKiBSTyAqL1xuICAgICAgdmFyIHJvTm9tRWwgPSBmaW5kRWxlbWVudCgnI3JlZ2ltZV9vYmxpZ2F0b2lyZV9ub20nKTtcbiAgICAgIGlmIChyb05vbUVsICYmIHJvTm9tRWwudmFsdWUpIHtcbiAgICAgICAgcmVnaW1lcy5ybyA9IHtcbiAgICAgICAgICBub206IHJvTm9tRWwudmFsdWUsXG4gICAgICAgICAgY29kZVJlZ2ltZTogKGZpbmRFbGVtZW50KCcjcm9fY29kZV9yZWdpbWUnKSB8fCB7fSkudmFsdWUgfHwgJycsXG4gICAgICAgICAgY29kZUNlbnRyZTogKGZpbmRFbGVtZW50KCcjY29kZV9jZW50cmUnKSB8fCB7fSkudmFsdWUgfHwgJycsXG4gICAgICAgICAgdGF1eFBFQzogKGZpbmRFbGVtZW50KCcjdGF1eF9wZWNfcm8nKSB8fCB7fSkudmFsdWUgfHwgJycsXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICAvKiBSQzEgKi9cbiAgICAgIHZhciByYzFOb21FbCA9IGZpbmRFbGVtZW50KCcjcmVnaW1lX2NvbXBsZW1lbnRhaXJlXzEnKTtcbiAgICAgIGlmIChyYzFOb21FbCAmJiByYzFOb21FbC52YWx1ZSkge1xuICAgICAgICByZWdpbWVzLnJjMSA9IHtcbiAgICAgICAgICBub206IHJjMU5vbUVsLnZhbHVlLFxuICAgICAgICAgIG51bWVyb0FkaGVyZW50OiAoZmluZEVsZW1lbnQoJyNub19hZGhlcmVudF9yY18xJykgfHwge30pLnZhbHVlIHx8ICcnLFxuICAgICAgICAgIG51bWVyb0NvbnRyYXQ6IChmaW5kRWxlbWVudCgnI25vX2NvbnRyYXRfcmNfMScpIHx8IHt9KS52YWx1ZSB8fCAnJyxcbiAgICAgICAgICBudW1lcm9UZWxldHJhbnNtaXNzaW9uOiAoZmluZEVsZW1lbnQoJ2lucHV0W25hbWU9XCJpbmZvc19yZWdpbWVbbnVtZXJvX3RlbGV0cmFuc21pc3Npb25fMV1cIl0nKSB8fCB7fSkudmFsdWUgfHwgJycsXG4gICAgICAgICAgY3JpdGVyZVNlY29uZGFpcmU6IChmaW5kRWxlbWVudCgnI2NyaXRlcmVfc2Vjb25kYWlyZScpIHx8IHt9KS52YWx1ZSB8fCAnJyxcbiAgICAgICAgICBjb2RlQ29udmVudGlvbjogKGZpbmRFbGVtZW50KCcjY29kZV9jb252ZW50aW9uJykgfHwge30pLnZhbHVlIHx8ICcnLFxuICAgICAgICAgIGRhdGVEZWJ1dDogKGZpbmRFbGVtZW50KCcjZGF0ZV9kZWJ1dF9yY18xJykgfHwge30pLnZhbHVlIHx8ICcnLFxuICAgICAgICAgIGRhdGVGaW46IChmaW5kRWxlbWVudCgnI2RhdGVfZmluX3JjXzEnKSB8fCB7fSkudmFsdWUgfHwgJycsXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICAvKiBSQzIgKi9cbiAgICAgIHZhciByYzJOb21FbCA9IGZpbmRFbGVtZW50KCcjcmVnaW1lX2NvbXBsZW1lbnRhaXJlXzInKTtcbiAgICAgIGlmIChyYzJOb21FbCAmJiByYzJOb21FbC52YWx1ZSkge1xuICAgICAgICByZWdpbWVzLnJjMiA9IHtcbiAgICAgICAgICBub206IHJjMk5vbUVsLnZhbHVlLFxuICAgICAgICAgIG51bWVyb0FkaGVyZW50OiAoZmluZEVsZW1lbnQoJyNub19hZGhlcmVudF9yY18yJykgfHwge30pLnZhbHVlIHx8ICcnLFxuICAgICAgICAgIG51bWVyb0NvbnRyYXQ6IChmaW5kRWxlbWVudCgnI25vX2NvbnRyYXRfcmNfMicpIHx8IHt9KS52YWx1ZSB8fCAnJyxcbiAgICAgICAgICBudW1lcm9UZWxldHJhbnNtaXNzaW9uOiAoZmluZEVsZW1lbnQoJ2lucHV0W25hbWU9XCJpbmZvc19yZWdpbWVbbnVtZXJvX3RlbGV0cmFuc21pc3Npb25fMl1cIl0nKSB8fCB7fSkudmFsdWUgfHwgJycsXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAocmVnaW1lcy5ybyB8fCByZWdpbWVzLnJjMSB8fCByZWdpbWVzLnJjMikge1xuICAgICAgICBjbGllbnQucmVnaW1lcyA9IHJlZ2ltZXM7XG4gICAgICB9XG5cbiAgICAgIC8qIFNjcmFwZSBkZXMgXHUwMEU5cXVpcGVtZW50cyBkZSBsYSBwcm9wb3NpdGlvbiAqL1xuICAgICAgdmFyIGVxdWlwZW1lbnRzID0gW107XG4gICAgICB2YXIgb2ZmcmVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm9mZnJlLmFjY29yZGlvbicpO1xuICAgICAgZm9yICh2YXIgb2kgPSAwOyBvaSA8IG9mZnJlcy5sZW5ndGg7IG9pKyspIHtcbiAgICAgICAgdmFyIG9mZnJlID0gb2ZmcmVzW29pXTtcbiAgICAgICAgdmFyIG9mZnJlSWQgPSBvZmZyZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtb2ZmcmVfaWQnKSB8fCAnJztcbiAgICAgICAgdmFyIGVxVHlwZSA9IG9mZnJlLmdldEF0dHJpYnV0ZSgnZGF0YS1lcXVpcGVtZW50X3R5cGVfaWQnKSB8fCAnJztcbiAgICAgICAgdmFyIG5vRXEgPSBvZmZyZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbm9fZXF1aXBlbWVudF9vZmZyZV9jb21tZXJjaWFsZScpIHx8ICcnO1xuXG4gICAgICAgIC8qIENvcnJlY3Rpb24gdmlzdWVsbGUgZGVwdWlzIGxlIGJhZGdlICovXG4gICAgICAgIHZhciBjb3JyTGFiZWwgPSBvZmZyZS5xdWVyeVNlbGVjdG9yKCcubGFiZWwtaW5mbycpO1xuICAgICAgICB2YXIgY29ycmVjdGlvbiA9IGNvcnJMYWJlbCA/IGNvcnJMYWJlbC50ZXh0Q29udGVudC50cmltKCkgOiAnJztcblxuICAgICAgICAvKiBUeXBlIHZpc2lvbiAqL1xuICAgICAgICB2YXIgdmlzaW9uQnRuID0gb2ZmcmUucXVlcnlTZWxlY3RvcignLmRyb3Bkb3duLXNlbGVjdC10ZXh0Jyk7XG4gICAgICAgIHZhciB2aXNpb24gPSB2aXNpb25CdG4gPyB2aXNpb25CdG4udGV4dENvbnRlbnQudHJpbSgpIDogJyc7XG5cbiAgICAgICAgLyogTGlnbmVzIGRlIGRcdTAwRTl0YWlsICovXG4gICAgICAgIHZhciBsaWduZXMgPSBbXTtcbiAgICAgICAgdmFyIHJvd3MgPSBvZmZyZS5xdWVyeVNlbGVjdG9yQWxsKCcudGFibGUtY29uc2VpbGxlciB0Ym9keSB0cltkYXRhLW9mZnJlX2RldGFpbF9pZF0nKTtcbiAgICAgICAgZm9yICh2YXIgcmkgPSAwOyByaSA8IHJvd3MubGVuZ3RoOyByaSsrKSB7XG4gICAgICAgICAgdmFyIHJvdyA9IHJvd3NbcmldO1xuICAgICAgICAgIHZhciB0eXBlSWQgPSByb3cuZ2V0QXR0cmlidXRlKCdkYXRhLW9mZnJlX2RldGFpbF90eXBlX2lkJykgfHwgJyc7XG4gICAgICAgICAgdmFyIG9laWwgPSByb3cuZ2V0QXR0cmlidXRlKCdkYXRhLW9laWxfb2ZmcmVfZGV0YWlsJykgfHwgJyc7XG4gICAgICAgICAgdmFyIGNsYXNzZSA9IHJvdy5nZXRBdHRyaWJ1dGUoJ2RhdGEtY2xhc3NlX29mZnJlX2RldGFpbCcpIHx8ICcnO1xuICAgICAgICAgIHZhciBkZXNpZyA9IHJvdy5xdWVyeVNlbGVjdG9yKCcuZGVzaWduYXRpb25fYXJ0aWNsZScpO1xuICAgICAgICAgIHZhciBscHBFbCA9IHJvdy5xdWVyeVNlbGVjdG9yKCcuZGV0YWlsX2NvZGVfbHBwJyk7XG5cbiAgICAgICAgICBsaWduZXMucHVzaCh7XG4gICAgICAgICAgICB0eXBlOiB0eXBlSWQgPT09ICczJyA/ICdtb250dXJlJyA6IHR5cGVJZCA9PT0gJzEnID8gJ3ZlcnJlJyA6IHR5cGVJZCA9PT0gJzInID8gJ3N1cHBsZW1lbnQnIDogdHlwZUlkLFxuICAgICAgICAgICAgb2VpbDogb2VpbCA9PT0gJzEnID8gJ09EJyA6IG9laWwgPT09ICcyJyA/ICdPRycgOiAnbGVzIGRldXgnLFxuICAgICAgICAgICAgY2xhc3NlOiBjbGFzc2UsXG4gICAgICAgICAgICBkZXNpZ25hdGlvbjogZGVzaWcgPyBkZXNpZy50ZXh0Q29udGVudC50cmltKCkucmVwbGFjZSgvXFxzKy9nLCAnICcpIDogJycsXG4gICAgICAgICAgICBjb2RlTFBQOiBscHBFbCA/IChscHBFbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY29kZV9scHAnKSB8fCAnJykudHJpbSgpIDogJycsXG4gICAgICAgICAgICBwcml4QnJ1dDogcGFyc2VGbG9hdCgocm93LnF1ZXJ5U2VsZWN0b3IoJy5wcml4X3ZlbnRlX2FwcGxpcXVlJyk/LnRleHRDb250ZW50IHx8ICcwJykucmVwbGFjZSgvW15cXGQsLi1dL2csICcnKS5yZXBsYWNlKCcsJywgJy4nKSkgfHwgMCxcbiAgICAgICAgICAgIHJlbWlzZTogcGFyc2VGbG9hdCgocm93LnF1ZXJ5U2VsZWN0b3IoJy5tb2RpZl9tb250YW50X3JlbWlzZScpPy50ZXh0Q29udGVudCB8fCAnMCcpLnJlcGxhY2UoL1teXFxkLC4tXS9nLCAnJykucmVwbGFjZSgnLCcsICcuJykpIHx8IDAsXG4gICAgICAgICAgICBwcml4TmV0OiBwYXJzZUZsb2F0KChyb3cucXVlcnlTZWxlY3RvcignLm1vZGlmX3ByaXhfdmVudGVfcmVtaXNlJyk/LnRleHRDb250ZW50IHx8ICcwJykucmVwbGFjZSgvW15cXGQsLi1dL2csICcnKS5yZXBsYWNlKCcsJywgJy4nKSkgfHwgMCxcbiAgICAgICAgICAgIHJvOiBwYXJzZUZsb2F0KChyb3cucXVlcnlTZWxlY3RvcignLm1vbnRhbnRfcGVjX3JvJyk/LnRleHRDb250ZW50IHx8ICcwJykucmVwbGFjZSgvW15cXGQsLi1dL2csICcnKS5yZXBsYWNlKCcsJywgJy4nKSkgfHwgMCxcbiAgICAgICAgICAgIHJjMTogcGFyc2VGbG9hdCgocm93LnF1ZXJ5U2VsZWN0b3IoJ1tjbGFzcyo9XCJtb250YW50X3BlY19yY18xXCJdJyk/LnRleHRDb250ZW50IHx8ICcwJykucmVwbGFjZSgvW15cXGQsLi1dL2csICcnKS5yZXBsYWNlKCcsJywgJy4nKSkgfHwgMCxcbiAgICAgICAgICAgIHJhYzogcGFyc2VGbG9hdCgocm93LnF1ZXJ5U2VsZWN0b3IoJy50b3RhbF9saWduZV9yYWMnKT8udGV4dENvbnRlbnQgfHwgJzAnKS5yZXBsYWNlKC9bXlxcZCwuLV0vZywgJycpLnJlcGxhY2UoJywnLCAnLicpKSB8fCAwLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogVG90YXV4ICovXG4gICAgICAgIHZhciBmb290ID0gb2ZmcmUucXVlcnlTZWxlY3RvcignLnRhYmxlLWNvbnNlaWxsZXIgdGZvb3QnKTtcbiAgICAgICAgdmFyIHRvdGF1eCA9IHt9O1xuICAgICAgICBpZiAoZm9vdCkge1xuICAgICAgICAgIHRvdGF1eCA9IHtcbiAgICAgICAgICAgIGJydXQ6IHBhcnNlRmxvYXQoKGZvb3QucXVlcnlTZWxlY3RvcignLnRvdGFsX2JydXQnKT8udGV4dENvbnRlbnQgfHwgJzAnKS5yZXBsYWNlKC9bXlxcZCwuLV0vZywgJycpLnJlcGxhY2UoJywnLCAnLicpKSB8fCAwLFxuICAgICAgICAgICAgcmVtaXNlOiBwYXJzZUZsb2F0KChmb290LnF1ZXJ5U2VsZWN0b3IoJy50b3RhbF9yZW1pc2UnKT8udGV4dENvbnRlbnQgfHwgJzAnKS5yZXBsYWNlKC9bXlxcZCwuLV0vZywgJycpLnJlcGxhY2UoJywnLCAnLicpKSB8fCAwLFxuICAgICAgICAgICAgbmV0OiBwYXJzZUZsb2F0KChmb290LnF1ZXJ5U2VsZWN0b3IoJy50b3RhbF9uZXQnKT8udGV4dENvbnRlbnQgfHwgJzAnKS5yZXBsYWNlKC9bXlxcZCwuLV0vZywgJycpLnJlcGxhY2UoJywnLCAnLicpKSB8fCAwLFxuICAgICAgICAgICAgcm86IHBhcnNlRmxvYXQoKGZvb3QucXVlcnlTZWxlY3RvcignLnRvdGFsX3JvJyk/LnRleHRDb250ZW50IHx8ICcwJykucmVwbGFjZSgvW15cXGQsLi1dL2csICcnKS5yZXBsYWNlKCcsJywgJy4nKSkgfHwgMCxcbiAgICAgICAgICAgIHJjMTogcGFyc2VGbG9hdCgoZm9vdC5xdWVyeVNlbGVjdG9yKCdbY2xhc3MqPVwidG90YWxfcmNfMVwiXScpPy50ZXh0Q29udGVudCB8fCAnMCcpLnJlcGxhY2UoL1teXFxkLC4tXS9nLCAnJykucmVwbGFjZSgnLCcsICcuJykpIHx8IDAsXG4gICAgICAgICAgICByYWM6IHBhcnNlRmxvYXQoKGZvb3QucXVlcnlTZWxlY3RvcignLnRvdGFsX3JhYycpPy50ZXh0Q29udGVudCB8fCAnMCcpLnJlcGxhY2UoL1teXFxkLC4tXS9nLCAnJykucmVwbGFjZSgnLCcsICcuJykpIHx8IDAsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGVxdWlwZW1lbnRzLnB1c2goe1xuICAgICAgICAgIG9mZnJlSWQ6IG9mZnJlSWQsXG4gICAgICAgICAgbnVtZXJvOiBub0VxLFxuICAgICAgICAgIHR5cGU6IGVxVHlwZSA9PT0gJzEnID8gJ2x1bmV0dGVzJyA6IGVxVHlwZSA9PT0gJzInID8gJ2xlbnRpbGxlcycgOiBlcVR5cGUsXG4gICAgICAgICAgY29ycmVjdGlvbjogY29ycmVjdGlvbixcbiAgICAgICAgICB2aXNpb246IHZpc2lvbixcbiAgICAgICAgICBsaWduZXM6IGxpZ25lcyxcbiAgICAgICAgICB0b3RhdXg6IHRvdGF1eCxcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8qIFRvdGF1eCBwcm9wb3NpdGlvbiAqL1xuICAgICAgdmFyIHRvdGFsUHJvcCA9IHBhcnNlRmxvYXQoKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50b3RhbF9uZXRfcHJvcG9zaXRpb24nKT8udGV4dENvbnRlbnQgfHwgJzAnKS5yZXBsYWNlKC9bXlxcZCwuLV0vZywgJycpLnJlcGxhY2UoJywnLCAnLicpKSB8fCAwO1xuICAgICAgdmFyIHJhY1Byb3AgPSBwYXJzZUZsb2F0KChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudG90YWxfcmFjX3Byb3Bvc2l0aW9uJyk/LnRleHRDb250ZW50IHx8ICcwJykucmVwbGFjZSgvW15cXGQsLi1dL2csICcnKS5yZXBsYWNlKCcsJywgJy4nKSkgfHwgMDtcblxuICAgICAgY2xpZW50LmVxdWlwZW1lbnRzID0gZXF1aXBlbWVudHM7XG4gICAgICBjbGllbnQudG90YWxQcm9wb3NpdGlvbiA9IHRvdGFsUHJvcDtcbiAgICAgIGNsaWVudC5yYWNQcm9wb3NpdGlvbiA9IHJhY1Byb3A7XG5cbiAgICAgIGlmICghY2xpZW50Lm5vbSAmJiAhY2xpZW50Lm5zcyAmJiBlcXVpcGVtZW50cy5sZW5ndGggPT09IDApIHJldHVybiBmYWxzZTtcblxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbJ29wdGlib3RfY2FjaGUnXSwgKHJlc3VsdCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGV4aXN0aW5nID0gKHJlc3VsdC5vcHRpYm90X2NhY2hlIHx8IHt9KS5jdXJyZW50IHx8IHt9O1xuICAgICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7XG4gICAgICAgICAgICBvcHRpYm90X2NhY2hlOiB7IGN1cnJlbnQ6IHsgLi4uZXhpc3RpbmcsIC4uLmNsaWVudCB9IH1cbiAgICAgICAgICB9LCAoKSA9PiByZXNvbHZlKHRydWUpKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn07XG4iLCAidmFyIFBPUlRBTF9LRVkgPSBcInByby53ZW1pbmQuaW9cIjtcblxuZXhwb3J0IGRlZmF1bHQge1xuICBuYW1lOiBcIldlbWluZFwiLFxuICBpc01hdGNoOiAoKSA9PiB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUuaW5jbHVkZXMoXCJ3ZW1pbmQuaW9cIiksXG4gIGFjdGlvbnM6IHtcbiAgICBmb3JtdWxhaXJlOiAoZGF0YSkgPT4ge1xuICAgICAgY29uc3QgbSA9IGRhdGEubSB8fCB7fTtcbiAgICAgIGNvbnN0IG8gPSBkYXRhLm8gfHwge307XG4gICAgICBjb25zdCBjID0gZGF0YS5jYWNoZWQgfHwge307XG4gICAgICAvKiBGYWxsYmFjayA6IHNpIGxlcyBjaGFtcHMgdG9wLWxldmVsIHNvbnQgdmlkZXMsIGNoZXJjaGVyIGRhbnMgcGVyc29ubmVzICovXG4gICAgICBjb25zdCBwZXJzb25uZXMgPSBtLnBlcnNvbm5lcyB8fCBbXTtcbiAgICAgIGNvbnN0IHAwID0gcGVyc29ubmVzLmxlbmd0aCA+IDAgPyBwZXJzb25uZXNbMF0gOiB7fTtcbiAgICAgIGNvbnN0IG5vbSA9IG0ubm9tIHx8IHAwLm5vbSB8fCBvLm5vbVBhdGllbnQgfHwgYy5ub20gfHwgXCJcIjtcbiAgICAgIGNvbnN0IHByZW5vbSA9IG0ucHJlbm9tIHx8IHAwLnByZW5vbSB8fCBvLnByZW5vbVBhdGllbnQgfHwgYy5wcmVub20gfHwgXCJcIjtcbiAgICAgIC8qIENoZXJjaGVyIGxlIHByZW1pZXIgTlNTIHZhbGlkZSBwYXJtaSB0b3V0ZXMgbGVzIHBlcnNvbm5lcyAqL1xuICAgICAgdmFyIGZvdW5kTlNTID0gbS5udW1lcm9TZWN1cml0ZVNvY2lhbGUgfHwgXCJcIjtcbiAgICAgIHZhciBmb3VuZERPQiA9IG0uZGF0ZU5haXNzYW5jZSB8fCBcIlwiO1xuICAgICAgaWYgKCFmb3VuZE5TUykge1xuICAgICAgICBmb3IgKHZhciBwaSA9IDA7IHBpIDwgcGVyc29ubmVzLmxlbmd0aDsgcGkrKykge1xuICAgICAgICAgIHZhciBwTlNTID0gKHBlcnNvbm5lc1twaV0ubnVtZXJvU2VjdXJpdGVTb2NpYWxlIHx8IFwiXCIpLnJlcGxhY2UoL1xcRC9nLCBcIlwiKTtcbiAgICAgICAgICBpZiAocE5TUy5sZW5ndGggPj0gMTMpIHsgZm91bmROU1MgPSBwZXJzb25uZXNbcGldLm51bWVyb1NlY3VyaXRlU29jaWFsZTsgYnJlYWs7IH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCFmb3VuZERPQikge1xuICAgICAgICBmb3IgKHZhciBwaSA9IDA7IHBpIDwgcGVyc29ubmVzLmxlbmd0aDsgcGkrKykge1xuICAgICAgICAgIGlmIChwZXJzb25uZXNbcGldLmRhdGVOYWlzc2FuY2UpIHsgZm91bmRET0IgPSBwZXJzb25uZXNbcGldLmRhdGVOYWlzc2FuY2U7IGJyZWFrOyB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IG5zcyA9IGZvdW5kTlNTIHx8IGMubnNzIHx8IFwiXCI7XG4gICAgICBjb25zdCBkb2IgPSBmb3VuZERPQiB8fCBvLmRhdGVOYWlzc2FuY2VQYXRpZW50IHx8IGMuZG9iIHx8IFwiXCI7XG5cbiAgICAgIC8qIFBvdXIgdW4gbWluZXVyLCB1dGlsaXNlciBsZSBOU1MgZGUgbCdvdXZyYW50IGRyb2l0IChtZXJlKSAqL1xuICAgICAgY29uc3QgZWZmZWN0aXZlTlNTID0gZ2V0T3V2cmFudERyb2l0TlNTKG5zcywgZG9iLCBtLnBlcnNvbm5lcyk7XG5cbiAgICAgIC8qIFN0ZXAgMSBcdTIwMTQgQmVuZWZpY2lhaXJlICovXG4gICAgICBjb25zdCBzdGVwQmVuZWYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1jeT1cInN0ZXAtYmVuZWZpY2lhcnlcIl0nKTtcbiAgICAgIGlmIChzdGVwQmVuZWYpIHtcbiAgICAgICAgdWx0cmFGaWxsKGZpbmRFbGVtZW50VHJhY2tlZChQT1JUQUxfS0VZLCBcImlucHV0LWxhc3ROYW1lXCIsICdbZGF0YS1jeT1cImlucHV0LWxhc3ROYW1lXCJdJyksIG5vbS50b1VwcGVyQ2FzZSgpKTtcbiAgICAgICAgdWx0cmFGaWxsKGZpbmRFbGVtZW50VHJhY2tlZChQT1JUQUxfS0VZLCBcImlucHV0LWZpcnN0TmFtZVwiLCAnW2RhdGEtY3k9XCJpbnB1dC1maXJzdE5hbWVcIl0nKSwgY2FwaXRhbGl6ZShwcmVub20pKTtcbiAgICAgICAgLyogTlNTIGZvcm1hdGUgYXZlYyBlc3BhY2VzIChtYXhsZW5ndGg9MjEgLT4gWCBYWCBYWCBYWCBYWFggWFhYIFhYKSAqL1xuICAgICAgICBjb25zdCBkaWdpdHMgPSBlZmZlY3RpdmVOU1MucmVwbGFjZSgvXFxEL2csIFwiXCIpO1xuICAgICAgICBsZXQgZm9ybWF0dGVkTlNTID0gZGlnaXRzO1xuICAgICAgICBpZiAoZGlnaXRzLmxlbmd0aCA+PSAxMykge1xuICAgICAgICAgIGZvcm1hdHRlZE5TUyA9IGRpZ2l0c1swXSArIFwiIFwiICsgZGlnaXRzLnNsaWNlKDEsMykgKyBcIiBcIiArIGRpZ2l0cy5zbGljZSgzLDUpICsgXCIgXCIgKyBkaWdpdHMuc2xpY2UoNSw3KSArIFwiIFwiICsgZGlnaXRzLnNsaWNlKDcsMTApICsgXCIgXCIgKyBkaWdpdHMuc2xpY2UoMTAsMTMpO1xuICAgICAgICAgIGlmIChkaWdpdHMubGVuZ3RoID49IDE1KSBmb3JtYXR0ZWROU1MgKz0gXCIgXCIgKyBkaWdpdHMuc2xpY2UoMTMsMTUpO1xuICAgICAgICB9XG4gICAgICAgIHVsdHJhRmlsbChmaW5kRWxlbWVudFRyYWNrZWQoUE9SVEFMX0tFWSwgXCJpbnB1dC1zc25cIiwgJ1tkYXRhLWN5PVwiaW5wdXQtc3NuXCJdJyksIGZvcm1hdHRlZE5TUyk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvKiBTdGVwIDIgXHUyMDE0IERlc2NyaXB0aW9uICovXG4gICAgICBjb25zdCBzdGVwRGVzYyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWN5PVwic3RlcC1kZXNjcmlwdGlvblwiXScpO1xuICAgICAgaWYgKHN0ZXBEZXNjKSB7XG4gICAgICAgIHNlbGVjdFJhZGl4T3B0aW9uKFwiY2F0ZWdvcnlcIiwgXCJvcHRpcXVlXCIpO1xuICAgICAgICAvKiBEZXRlcm1pbmUgbGUgdHlwZSBkZSBzb2luICovXG4gICAgICAgIGxldCB0eXBlVmFsID0gXCJsdW5ldHRlc19hZHVsdGVcIjtcbiAgICAgICAgY29uc3QgaGFzTGVudGlsbGVzID0gKG8ubGVudGlsbGVzT0QgJiYgby5sZW50aWxsZXNPRC5zcGhlcmUpIHx8IChvLmxlbnRpbGxlc09HICYmIG8ubGVudGlsbGVzT0cuc3BoZXJlKTtcbiAgICAgICAgaWYgKGhhc0xlbnRpbGxlcykgdHlwZVZhbCA9IFwibGVudGlsbGVzX2FkdWx0ZVwiO1xuICAgICAgICAvKiBWZXJpZmljYXRpb24gZW5mYW50ICg8MTggYW5zKSAqL1xuICAgICAgICBpZiAoZG9iICYmIGlzVW5kZXIxOChkb2IpKSB7XG4gICAgICAgICAgdHlwZVZhbCA9IGhhc0xlbnRpbGxlcyA/IFwibGVudGlsbGVzX2VuZmFudFwiIDogXCJsdW5ldHRlc19lbmZhbnRcIjtcbiAgICAgICAgfVxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHNlbGVjdFJhZGl4T3B0aW9uKFwidHlwZVwiLCB0eXBlVmFsKSwgNjAwKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIC8qIFN0ZXAgMyBcdTIwMTQgQ29kZXMgTFBQIChwYXMgZCdhdXRvLXJlbXBsaXNzYWdlLCBsZXMgY29kZXMgc29udCBzcGVjaWZpcXVlcyBhdSBwcm9kdWl0KSAqL1xuICAgICAgY29uc3Qgc3RlcExwcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWN5PVwic3RlcC1scHAtY29kZXNcIl0nKTtcbiAgICAgIGlmIChzdGVwTHBwKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcbiAgICBzeW5jaHJvbmlzZXI6IGFzeW5jICgpID0+IGZhbHNlXG4gIH1cbn07XG4iLCAiZXhwb3J0IGRlZmF1bHQge1xuICBuYW1lOiBcIkFQR0lTXCIsXG4gIGlzTWF0Y2g6ICgpID0+IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZS5pbmNsdWRlcyhcImFwZ2lzLmNvbVwiKSxcbiAgYWN0aW9uczoge1xuICAgIGZvcm11bGFpcmU6IChkYXRhKSA9PiB7XG4gICAgICBjb25zdCBtID0gZGF0YS5tIHx8IHt9O1xuICAgICAgY29uc3QgbyA9IGRhdGEubyB8fCB7fTtcbiAgICAgIGNvbnN0IGMgPSBkYXRhLmNhY2hlZCB8fCB7fTtcbiAgICAgIGNvbnN0IHBlcnNvbm5lcyA9IG0ucGVyc29ubmVzIHx8IFtdO1xuICAgICAgY29uc3QgcDAgPSBwZXJzb25uZXMubGVuZ3RoID4gMCA/IHBlcnNvbm5lc1swXSA6IHt9O1xuXG4gICAgICBjb25zdCBub20gPSBtLm5vbSB8fCBwMC5ub20gfHwgby5ub21QYXRpZW50IHx8IGMubm9tIHx8IFwiXCI7XG4gICAgICBjb25zdCBwcmVub20gPSBtLnByZW5vbSB8fCBwMC5wcmVub20gfHwgby5wcmVub21QYXRpZW50IHx8IGMucHJlbm9tIHx8IFwiXCI7XG4gICAgICB2YXIgZm91bmROU1MgPSBtLm51bWVyb1NlY3VyaXRlU29jaWFsZSB8fCBcIlwiO1xuICAgICAgaWYgKCFmb3VuZE5TUykge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBlcnNvbm5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciBwTlNTID0gKHBlcnNvbm5lc1tpXS5udW1lcm9TZWN1cml0ZVNvY2lhbGUgfHwgXCJcIikucmVwbGFjZSgvXFxEL2csIFwiXCIpO1xuICAgICAgICAgIGlmIChwTlNTLmxlbmd0aCA+PSAxMykgeyBmb3VuZE5TUyA9IHBlcnNvbm5lc1tpXS5udW1lcm9TZWN1cml0ZVNvY2lhbGU7IGJyZWFrOyB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciBmb3VuZERPQiA9IG0uZGF0ZU5haXNzYW5jZSB8fCBcIlwiO1xuICAgICAgaWYgKCFmb3VuZERPQikge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBlcnNvbm5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChwZXJzb25uZXNbaV0uZGF0ZU5haXNzYW5jZSkgeyBmb3VuZERPQiA9IHBlcnNvbm5lc1tpXS5kYXRlTmFpc3NhbmNlOyBicmVhazsgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zdCBuc3MgPSBmb3VuZE5TUyB8fCBjLm5zcyB8fCBcIlwiO1xuICAgICAgY29uc3QgZG9iID0gZm91bmRET0IgfHwgby5kYXRlTmFpc3NhbmNlUGF0aWVudCB8fCBjLmRvYiB8fCBcIlwiO1xuICAgICAgY29uc3QgZWZmZWN0aXZlTlNTID0gZ2V0T3V2cmFudERyb2l0TlNTKG5zcywgZG9iLCBwZXJzb25uZXMpO1xuXG4gICAgICAvKiBQYW5lbCBSZWNoZXJjaGUgQlx1MDBFOW5cdTAwRTlmaWNpYWlyZSAqL1xuICAgICAgdmFyIGluc2VlRWwgPSBmaW5kRWxlbWVudCgnW2lkJD1cInJlY2hlcmNoZXJpbnNlZV9JXCJdJyk7XG4gICAgICBpZiAoaW5zZWVFbCkge1xuICAgICAgICB1bHRyYUZpbGwoaW5zZWVFbCwgZWZmZWN0aXZlTlNTLnJlcGxhY2UoL1xcRC9nLCBcIlwiKS5zbGljZSgwLCAxMykpO1xuICAgICAgICB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJ1tpZCQ9XCJyZWNoZXJjaGVybm9tX0lcIl0nKSwgbm9tLnRvVXBwZXJDYXNlKCkpO1xuICAgICAgICB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJ1tpZCQ9XCJyZWNoZXJjaGVycHJlbm9tX0lcIl0nKSwgY2FwaXRhbGl6ZShwcmVub20pKTtcbiAgICAgICAgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCdbaWQkPVwicmVjaGVyY2hlcmRhdGVuYWlzc2FuY2VfSVwiXScpLCBkb2IpO1xuICAgICAgICAvKiBEYXRlIHByZXNjcmlwdGlvbiBkZXB1aXMgbCdvcmRvbm5hbmNlIChjbGlwYm9hcmQgT1UgY2FjaGUpICovXG4gICAgICAgIHZhciBkYXRlT3JkbyA9IG8uZGF0ZU9yZG9ubmFuY2UgfHwgKGMub3Jkb25uYW5jZSAmJiBjLm9yZG9ubmFuY2UuZGF0ZU9yZG9ubmFuY2UpIHx8IFwiXCI7XG4gICAgICAgIGlmIChkYXRlT3Jkbykge1xuICAgICAgICAgIHVsdHJhRmlsbChmaW5kRWxlbWVudCgnW2lkJD1cInJlY2hlcmNoZXJkYXRlcHJlc2NyaXB0aW9uX0lcIl0nKSwgZGF0ZU9yZG8pO1xuICAgICAgICB9XG4gICAgICAgIC8qIFJQUFMgUHJlc2NyaXB0ZXVyIChjbGlwYm9hcmQgT1UgY2FjaGUpICovXG4gICAgICAgIHZhciBycHBzID0gby5ycHBzIHx8IChjLm9yZG9ubmFuY2UgJiYgYy5vcmRvbm5hbmNlLnJwcHMpIHx8IGMucnBwcyB8fCBcIlwiO1xuICAgICAgICBpZiAocnBwcykge1xuICAgICAgICAgIHVsdHJhRmlsbChmaW5kRWxlbWVudCgnW2lkJD1cInJlY2hlcmNoZXJSUFBTX0lcIl0nKSwgcnBwcy5yZXBsYWNlKC9cXEQvZywgXCJcIikuc2xpY2UoMCwgMTEpKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcHJlc2NFbCA9IGZpbmRFbGVtZW50KCdbaWQkPVwicmVjaGVyY2hlcmRhdGVwcmVzY3JpcHRpb25fSVwiXScpO1xuICAgICAgICB2YXIgcnBwc0VsID0gZmluZEVsZW1lbnQoJ1tpZCQ9XCJyZWNoZXJjaGVyUlBQU19JXCJdJyk7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhcIltPcHRpQm90IEFQR0lTXSBwcmVzY0VsIGZvdW5kOlwiLCAhIXByZXNjRWwsIFwifCBycHBzRWwgZm91bmQ6XCIsICEhcnBwc0VsKTtcbiAgICAgICAgLyogRGV2RXhwcmVzcyBjb21ib3MgXHUyMDE0IG1hbmlwdWxhdGlvbiBET00gZGlyZWN0ZSAoQ1NQIGJsb3F1ZSBsZXMgc2NyaXB0cyBpbmxpbmUpLlxuICAgICAgICAgICBQYXR0ZXJuIDogc2V0dGVyIGxhIHZhbGV1ciB2aXNpYmxlIChfSSkgKyBsYSB2YWxldXIgY2FjaFx1MDBFOWUgKF9WSSkgKyBkaXNwYXRjaCBjaGFuZ2UgKi9cbiAgICAgICAgZnVuY3Rpb24gZHhDb21ib0ZpbGwoaWRTdWZmaXgsIGRpc3BsYXlUZXh0LCB2YWx1ZSkge1xuICAgICAgICAgIHZhciBpbnAgPSBmaW5kRWxlbWVudCgnW2lkJD1cIicgKyBpZFN1ZmZpeCArICdfSVwiXScpO1xuICAgICAgICAgIGlmICghaW5wIHx8IChpbnAudmFsdWUgfHwgXCJcIikudHJpbSgpKSByZXR1cm47XG4gICAgICAgICAgdmFyIGhpZGRlbklucHV0ID0gZmluZEVsZW1lbnQoJ1tpZCQ9XCInICsgaWRTdWZmaXggKyAnX1ZJXCJdJyk7XG4gICAgICAgICAgaW5wLnZhbHVlID0gZGlzcGxheVRleHQ7XG4gICAgICAgICAgaW5wLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjaGFuZ2UnLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgICAgICAgIGlmIChoaWRkZW5JbnB1dCkgaGlkZGVuSW5wdXQudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICAvKiBOYXR1cmUgZCdhc3N1cmFuY2UgOiBcIjEwXCIgPSBNYWxhZGllIC0gVGF1eCBTUyA2MCUgKi9cbiAgICAgICAgZHhDb21ib0ZpbGwoXCJyZWNoZXJjaGVybmF0dXJlYXNzdXJhbmNlXCIsIFwiTWFsYWRpZSAtIFRhdXggU1MgNjAlXCIsIFwiMTBcIik7XG4gICAgICAgIC8qIFR5cGUgZGUgcmVub3V2ZWxsZW1lbnQgOiBkXHUwMEU5bGFpIGNhciBsZSBjYWxsYmFjayBOYXR1cmVDaGFuZ2UgcGV1dCByXHUwMEU5aW5pdGlhbGlzZXIgbGUgRE9NICovXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZHhDb21ib0ZpbGwoXCJyZWNoZXJjaGVydHlwZXJlbm91dmVsbGVtZW50XCIsIFwiUmVub3V2LiBhdmVjIGFkYXB0YXRpb25cIiwgXCIyXCIpO1xuICAgICAgICB9LCA4MDApO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG4gICAgc3luY2hyb25pc2VyOiBhc3luYyAoKSA9PiBmYWxzZVxuICB9XG59O1xuIiwgImV4cG9ydCBkZWZhdWx0IHtcbiAgbmFtZTogXCJBY3RpbFwiLFxuICBpc01hdGNoOiAoKSA9PiB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUuaW5jbHVkZXMoXCJhY3RpbC5jb21cIiksXG4gIGFjdGlvbnM6IHtcbiAgICBmb3JtdWxhaXJlOiAoZGF0YSkgPT4ge1xuICAgICAgdmFyIG5vbUVsID0gZmluZEVsZW1lbnQoJ2lucHV0W25hbWU9XCJub21cIl0nKTtcbiAgICAgIGlmICghbm9tRWwpIHJldHVybiBmYWxzZTtcblxuICAgICAgdmFyIG0gPSBkYXRhLm0gfHwge307XG4gICAgICB2YXIgbyA9IGRhdGEubyB8fCB7fTtcbiAgICAgIHZhciBjID0gZGF0YS5jYWNoZWQgfHwge307XG4gICAgICB2YXIgcGVyc29ubmVzID0gbS5wZXJzb25uZXMgfHwgW107XG4gICAgICB2YXIgcDAgPSBwZXJzb25uZXMubGVuZ3RoID4gMCA/IHBlcnNvbm5lc1swXSA6IHt9O1xuXG4gICAgICB2YXIgbm9tID0gbS5ub20gfHwgcDAubm9tIHx8IG8ubm9tUGF0aWVudCB8fCBjLm5vbSB8fCBcIlwiO1xuICAgICAgdmFyIHByZW5vbSA9IG0ucHJlbm9tIHx8IHAwLnByZW5vbSB8fCBvLnByZW5vbVBhdGllbnQgfHwgYy5wcmVub20gfHwgXCJcIjtcbiAgICAgIHZhciBmb3VuZE5TUyA9IG0ubnVtZXJvU2VjdXJpdGVTb2NpYWxlIHx8IFwiXCI7XG4gICAgICBpZiAoIWZvdW5kTlNTKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGVyc29ubmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdmFyIHBOU1MgPSAocGVyc29ubmVzW2ldLm51bWVyb1NlY3VyaXRlU29jaWFsZSB8fCBcIlwiKS5yZXBsYWNlKC9cXEQvZywgXCJcIik7XG4gICAgICAgICAgaWYgKHBOU1MubGVuZ3RoID49IDEzKSB7IGZvdW5kTlNTID0gcGVyc29ubmVzW2ldLm51bWVyb1NlY3VyaXRlU29jaWFsZTsgYnJlYWs7IH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIGZvdW5kRE9CID0gbS5kYXRlTmFpc3NhbmNlIHx8IFwiXCI7XG4gICAgICBpZiAoIWZvdW5kRE9CKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGVyc29ubmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKHBlcnNvbm5lc1tpXS5kYXRlTmFpc3NhbmNlKSB7IGZvdW5kRE9CID0gcGVyc29ubmVzW2ldLmRhdGVOYWlzc2FuY2U7IGJyZWFrOyB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciBuc3MgPSBmb3VuZE5TUyB8fCBjLm5zcyB8fCBcIlwiO1xuICAgICAgdmFyIGRvYiA9IGZvdW5kRE9CIHx8IG8uZGF0ZU5haXNzYW5jZVBhdGllbnQgfHwgYy5kb2IgfHwgXCJcIjtcbiAgICAgIHZhciBlZmZlY3RpdmVOU1MgPSBnZXRPdXZyYW50RHJvaXROU1MobnNzLCBkb2IsIHBlcnNvbm5lcyk7XG5cbiAgICAgIHVsdHJhRmlsbChub21FbCwgbm9tLnRvVXBwZXJDYXNlKCkpO1xuICAgICAgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCdpbnB1dFtuYW1lPVwicHJlbm9tXCJdJyksIGNhcGl0YWxpemUocHJlbm9tKSk7XG4gICAgICB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJ2lucHV0W25hbWU9XCJudW1JbnNlZVwiXScpLCBlZmZlY3RpdmVOU1MucmVwbGFjZSgvXFxEL2csIFwiXCIpKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG4gICAgc3luY2hyb25pc2VyOiBhc3luYyAoKSA9PiBmYWxzZVxuICB9XG59O1xuIiwgImV4cG9ydCBkZWZhdWx0IHtcbiAgbmFtZTogXCJNZXJjZXJcIixcbiAgaXNNYXRjaDogKCkgPT4gd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLmluY2x1ZGVzKFwic2VydmljZXMtZm0ubmV0XCIpIHx8IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZS5pbmNsdWRlcyhcIm1lcmNlcm5ldC5mclwiKSB8fCB3aW5kb3cubG9jYXRpb24uaHJlZi5pbmNsdWRlcyhcIlBFQ01FUlBST1wiKSxcbiAgYWN0aW9uczoge1xuICAgIGZvcm11bGFpcmU6IChkYXRhKSA9PiB7XG4gICAgICB2YXIgc3NFbCA9IGZpbmRFbGVtZW50KCdpbnB1dFtuYW1lPVwibnVtZXJvU1NcIl0nKTtcbiAgICAgIGlmICghc3NFbCkgcmV0dXJuIGZhbHNlO1xuICAgICAgdmFyIG0gPSBkYXRhLm0gfHwge307XG4gICAgICB2YXIgbyA9IGRhdGEubyB8fCB7fTtcbiAgICAgIHZhciBjID0gZGF0YS5jYWNoZWQgfHwge307XG4gICAgICB2YXIgcGVyc29ubmVzID0gbS5wZXJzb25uZXMgfHwgW107XG4gICAgICB2YXIgcDAgPSBwZXJzb25uZXMubGVuZ3RoID4gMCA/IHBlcnNvbm5lc1swXSA6IHt9O1xuICAgICAgdmFyIG5vbSA9IG0ubm9tIHx8IHAwLm5vbSB8fCBvLm5vbVBhdGllbnQgfHwgYy5ub20gfHwgXCJcIjtcbiAgICAgIHZhciBwcmVub20gPSBtLnByZW5vbSB8fCBwMC5wcmVub20gfHwgby5wcmVub21QYXRpZW50IHx8IGMucHJlbm9tIHx8IFwiXCI7XG4gICAgICB2YXIgZm91bmROU1MgPSBtLm51bWVyb1NlY3VyaXRlU29jaWFsZSB8fCBcIlwiO1xuICAgICAgaWYgKCFmb3VuZE5TUykge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBlcnNvbm5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciBwTlNTID0gKHBlcnNvbm5lc1tpXS5udW1lcm9TZWN1cml0ZVNvY2lhbGUgfHwgXCJcIikucmVwbGFjZSgvXFxEL2csIFwiXCIpO1xuICAgICAgICAgIGlmIChwTlNTLmxlbmd0aCA+PSAxMykgeyBmb3VuZE5TUyA9IHBlcnNvbm5lc1tpXS5udW1lcm9TZWN1cml0ZVNvY2lhbGU7IGJyZWFrOyB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciBmb3VuZERPQiA9IG0uZGF0ZU5haXNzYW5jZSB8fCBcIlwiO1xuICAgICAgaWYgKCFmb3VuZERPQikge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBlcnNvbm5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChwZXJzb25uZXNbaV0uZGF0ZU5haXNzYW5jZSkgeyBmb3VuZERPQiA9IHBlcnNvbm5lc1tpXS5kYXRlTmFpc3NhbmNlOyBicmVhazsgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YXIgbnNzID0gZm91bmROU1MgfHwgYy5uc3MgfHwgXCJcIjtcbiAgICAgIHZhciBkb2IgPSBmb3VuZERPQiB8fCBvLmRhdGVOYWlzc2FuY2VQYXRpZW50IHx8IGMuZG9iIHx8IFwiXCI7XG4gICAgICB2YXIgZWZmZWN0aXZlTlNTID0gZ2V0T3V2cmFudERyb2l0TlNTKG5zcywgZG9iLCBwZXJzb25uZXMpO1xuICAgICAgdmFyIG51bUFkaGVyZW50ID0gbS5udW1lcm9BZGhlcmVudCB8fCBjLm51bWVyb0FkaGVyZW50IHx8IChjLnJlZ2ltZXMgJiYgYy5yZWdpbWVzLnJjMSAmJiBjLnJlZ2ltZXMucmMxLm51bWVyb0FkaGVyZW50KSB8fCBcIlwiO1xuXG4gICAgICB1bHRyYUZpbGwoc3NFbCwgZWZmZWN0aXZlTlNTLnJlcGxhY2UoL1xcRC9nLCBcIlwiKSk7XG4gICAgICB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJyNub20nKSwgbm9tLnRvVXBwZXJDYXNlKCkpO1xuICAgICAgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCcjcHJlbm9tJyksIGNhcGl0YWxpemUocHJlbm9tKSk7XG4gICAgICBpZiAoZG9iKSB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJyNkYXRlTmFpJyksIGRvYik7XG4gICAgICBpZiAobnVtQWRoZXJlbnQpIHVsdHJhRmlsbChmaW5kRWxlbWVudCgnI251bUFkaCcpLCBudW1BZGhlcmVudCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuICAgIHN5bmNocm9uaXNlcjogYXN5bmMgKCkgPT4gZmFsc2VcbiAgfVxufTtcbiIsICJleHBvcnQgZGVmYXVsdCB7XG4gIG5hbWU6IFwiVFAgUGx1c1wiLFxuICBpc01hdGNoOiAoKSA9PiB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUuaW5jbHVkZXMoXCJvcHRpcXVlLXRwcGx1c1wiKSB8fCAod2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLmluY2x1ZGVzKFwic2FudGVjbGFpci5mclwiKSAmJiB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuaW5jbHVkZXMoXCIvdHAtcGx1c1wiKSksXG4gIGFjdGlvbnM6IHtcbiAgICBmb3JtdWxhaXJlOiAoZGF0YSkgPT4ge1xuICAgICAgLyogXHUwMEM5dGFwZSAxIFx1MjAxNCBJZGVudGl0XHUwMEU5IGR1IHBhdGllbnQgKEFuZ3VsYXIgTWF0ZXJpYWwgc3RlcHBlcikgKi9cbiAgICAgIHZhciBub21FbCA9IGZpbmRFbGVtZW50KCdbZm9ybWNvbnRyb2xuYW1lPVwibm9tXCJdOm5vdChbZGlzYWJsZWRdKScpIHx8IGZpbmRFbGVtZW50KCcjbWF0LWlucHV0LTAnKTtcbiAgICAgIGlmICghbm9tRWwpIHJldHVybiBmYWxzZTtcblxuICAgICAgdmFyIG0gPSBkYXRhLm0gfHwge307XG4gICAgICB2YXIgbyA9IGRhdGEubyB8fCB7fTtcbiAgICAgIHZhciBjID0gZGF0YS5jYWNoZWQgfHwge307XG4gICAgICB2YXIgcGVyc29ubmVzID0gbS5wZXJzb25uZXMgfHwgW107XG4gICAgICB2YXIgcDAgPSBwZXJzb25uZXMubGVuZ3RoID4gMCA/IHBlcnNvbm5lc1swXSA6IHt9O1xuXG4gICAgICB2YXIgbm9tID0gbS5ub20gfHwgcDAubm9tIHx8IG8ubm9tUGF0aWVudCB8fCBjLm5vbSB8fCBcIlwiO1xuICAgICAgdmFyIHByZW5vbSA9IG0ucHJlbm9tIHx8IHAwLnByZW5vbSB8fCBvLnByZW5vbVBhdGllbnQgfHwgYy5wcmVub20gfHwgXCJcIjtcbiAgICAgIHZhciBmb3VuZERPQiA9IG0uZGF0ZU5haXNzYW5jZSB8fCBcIlwiO1xuICAgICAgaWYgKCFmb3VuZERPQikge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBlcnNvbm5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChwZXJzb25uZXNbaV0uZGF0ZU5haXNzYW5jZSkgeyBmb3VuZERPQiA9IHBlcnNvbm5lc1tpXS5kYXRlTmFpc3NhbmNlOyBicmVhazsgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YXIgZG9iID0gZm91bmRET0IgfHwgby5kYXRlTmFpc3NhbmNlUGF0aWVudCB8fCBjLmRvYiB8fCBcIlwiO1xuICAgICAgdmFyIHBob25lID0gbm9ybWFsaXplUGhvbmUoYy5waG9uZSB8fCBtLnRlbGVwaG9uZSB8fCBcIlwiKTtcbiAgICAgIHZhciBtdXR1ZWxsZSA9IG0ub3JnYW5pc21lIHx8IGMubXV0dWVsbGUgfHwgYy5vcmdhbmlzbWUgfHwgXCJcIjtcbiAgICAgIHZhciBudW1BZGhlcmVudCA9IG0ubnVtZXJvQWRoZXJlbnQgfHwgYy5udW1lcm9BZGhlcmVudCB8fCAoYy5yZWdpbWVzICYmIGMucmVnaW1lcy5yYzEgJiYgYy5yZWdpbWVzLnJjMS5udW1lcm9BZGhlcmVudCkgfHwgXCJcIjtcblxuICAgICAgLyogRm9uY3Rpb24gcG91ciByZW1wbGlyIGxlcyBjaGFtcHMgdW5lIGZvaXMgbCdhc3N1cmV1ciByXHUwMEU5c29sdVxuICAgICAgICAgKGFwcGVsXHUwMEU5ZSBzb2l0IGFwclx1MDBFOHMgbCdhdXRvY29tcGxldGUsIHNvaXQgaW1tXHUwMEU5ZGlhdGVtZW50IHNpIHBhcyBkZSBtdXR1ZWxsZSkgKi9cbiAgICAgIHZhciBmaWxsRmllbGRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIC8qIE5cdTAwQjAgQ09OVFJBVCBcdTIwMTQgYXBwYXJhXHUwMEVFdCBkeW5hbWlxdWVtZW50IGFwclx1MDBFOHMgc1x1MDBFOWxlY3Rpb24gYXNzdXJldXIgKi9cbiAgICAgICAgaWYgKG51bUFkaGVyZW50KSB7XG4gICAgICAgICAgdmFyIGNvbnRyYXRFbCA9IGZpbmRFbGVtZW50KCdbZm9ybWNvbnRyb2xuYW1lPVwibnVtZXJvQ29udHJhdEFtY1wiXScpO1xuICAgICAgICAgIGlmIChjb250cmF0RWwgJiYgIWNvbnRyYXRFbC5kaXNhYmxlZCkgdWx0cmFGaWxsKGNvbnRyYXRFbCwgbnVtQWRoZXJlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogQlx1MDBFOW5cdTAwRTlmaWNpYWlyZSAqL1xuICAgICAgICB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJ1tmb3JtY29udHJvbG5hbWU9XCJub21cIl06bm90KFtkaXNhYmxlZF0pJyksIG5vbS50b1VwcGVyQ2FzZSgpKTtcbiAgICAgICAgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCdbZm9ybWNvbnRyb2xuYW1lPVwicHJlbm9tXCJdOm5vdChbZGlzYWJsZWRdKScpLCBjYXBpdGFsaXplKHByZW5vbSkpO1xuXG4gICAgICAgIC8qIERhdGUgZGUgbmFpc3NhbmNlIFx1MjAxNCBub3JtYWxpc2VyIGVuIEREL01NL1lZWVkgcG91ciBsZSBkYXRlcGlja2VyIEFuZ3VsYXIgKi9cbiAgICAgICAgaWYgKGRvYikge1xuICAgICAgICAgIHZhciBkID0gU3RyaW5nKGRvYikucmVwbGFjZSgvXFxEL2csIFwiXCIpO1xuICAgICAgICAgIHZhciBkb2JGbXQgPSBkb2I7XG4gICAgICAgICAgaWYgKGQubGVuZ3RoID09PSA4KSB7XG4gICAgICAgICAgICBkb2JGbXQgPSAocGFyc2VJbnQoZC5zbGljZSgwLDQpKSA+IDE5MDApXG4gICAgICAgICAgICAgID8gZC5zbGljZSg2LDgpICsgXCIvXCIgKyBkLnNsaWNlKDQsNikgKyBcIi9cIiArIGQuc2xpY2UoMCw0KVxuICAgICAgICAgICAgICA6IGQuc2xpY2UoMCwyKSArIFwiL1wiICsgZC5zbGljZSgyLDQpICsgXCIvXCIgKyBkLnNsaWNlKDQsOCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHVsdHJhRmlsbChmaW5kRWxlbWVudCgnW2Zvcm1jb250cm9sbmFtZT1cImRhdGVOYWlzc2FuY2VcIl0nKSwgZG9iRm10KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIFRcdTAwRTlsXHUwMEU5cGhvbmUgKi9cbiAgICAgICAgaWYgKHBob25lKSB7XG4gICAgICAgICAgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCdbZm9ybWNvbnRyb2xuYW1lPVwidGVsZXBob25lXCJdJyksIHBob25lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIE5hdHVyZSBkdSBkb3NzaWVyIFx1MjAxNCBsdW5ldHRlcyAoMSkgb3UgbGVudGlsbGVzICgyKSAqL1xuICAgICAgICB2YXIgaGFzTGVudGlsbGVzID0gKG8ubGVudGlsbGVzT0QgJiYgby5sZW50aWxsZXNPRC5zcGhlcmUpIHx8IChvLmxlbnRpbGxlc09HICYmIG8ubGVudGlsbGVzT0cuc3BoZXJlKVxuICAgICAgICAgIHx8IG8udHlwZVByZXNjcmlwdGlvbiA9PT0gXCJsZW50aWxsZXNcIjtcbiAgICAgICAgdmFyIHJhZGlvVmFsID0gaGFzTGVudGlsbGVzID8gXCIyXCIgOiBcIjFcIjtcbiAgICAgICAgdmFyIHJhZGlvcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0Lm1kYy1yYWRpb19fbmF0aXZlLWNvbnRyb2wnKTtcbiAgICAgICAgZm9yICh2YXIgcmkgPSAwOyByaSA8IHJhZGlvcy5sZW5ndGg7IHJpKyspIHtcbiAgICAgICAgICBpZiAocmFkaW9zW3JpXS52YWx1ZSA9PT0gcmFkaW9WYWwgJiYgIXJhZGlvc1tyaV0uY2hlY2tlZCkgeyByYWRpb3NbcmldLmNsaWNrKCk7IGJyZWFrOyB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiBDbGljIFN1aXZhbnQgKi9cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgc3VpdmFudEJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbi5zdGVwcGVyLWJ0bicpO1xuICAgICAgICAgIGlmIChzdWl2YW50QnRuICYmICFzdWl2YW50QnRuLmRpc2FibGVkKSBzdWl2YW50QnRuLmNsaWNrKCk7XG4gICAgICAgIH0sIDgwMCk7XG4gICAgICB9O1xuXG4gICAgICAvKiBBc3N1cmV1ciBcdTIwMTQgYXV0b2NvbXBsZXRlIEFuZ3VsYXIgTWF0ZXJpYWwgOiB0YXBlciBsZSBub20gcHVpcyBzXHUwMEU5bGVjdGlvbm5lciBsZSBtZWlsbGV1ciBtYXRjaCAqL1xuICAgICAgaWYgKG11dHVlbGxlKSB7XG4gICAgICAgIHZhciBhc3N1cmV1ckVsID0gZmluZEVsZW1lbnQoJ1tmb3JtY29udHJvbG5hbWU9XCJhc3N1cmV1clwiXScpO1xuICAgICAgICBpZiAoYXNzdXJldXJFbCkge1xuICAgICAgICAgIHVsdHJhRmlsbChhc3N1cmV1ckVsLCBtdXR1ZWxsZSk7XG4gICAgICAgICAgLyogQXR0ZW5kcmUgcXVlIGxlIHBhbmVsIGF1dG9jb21wbGV0ZSBzJ291dnJlLCBwdWlzIGNsaXF1ZXIgbGUgbWVpbGxldXIgbWF0Y2ggKi9cbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHBhbmVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1hdC1tZGMtYXV0b2NvbXBsZXRlLXBhbmVsLCAubWF0LWF1dG9jb21wbGV0ZS1wYW5lbCcpO1xuICAgICAgICAgICAgaWYgKCFwYW5lbCkgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIG9wdGlvbnMgPSBwYW5lbC5xdWVyeVNlbGVjdG9yQWxsKCdtYXQtb3B0aW9uJyk7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5sZW5ndGggPT09IDApIHJldHVybjtcbiAgICAgICAgICAgIHZhciBuZWVkbGUgPSBtdXR1ZWxsZS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1xccysvZywgXCIgXCIpLnRyaW0oKTtcbiAgICAgICAgICAgIHZhciBiZXN0ID0gb3B0aW9uc1swXTtcbiAgICAgICAgICAgIHZhciBiZXN0U2NvcmUgPSAwO1xuICAgICAgICAgICAgZm9yICh2YXIgb2kgPSAwOyBvaSA8IG9wdGlvbnMubGVuZ3RoOyBvaSsrKSB7XG4gICAgICAgICAgICAgIHZhciBvcHRUZXh0ID0gKG9wdGlvbnNbb2ldLnRleHRDb250ZW50IHx8IFwiXCIpLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvXFxzKy9nLCBcIiBcIikudHJpbSgpO1xuICAgICAgICAgICAgICBpZiAob3B0VGV4dCA9PT0gbmVlZGxlKSB7IGJlc3QgPSBvcHRpb25zW29pXTsgYmVzdFNjb3JlID0gMzsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgaWYgKGJlc3RTY29yZSA8IDIgJiYgb3B0VGV4dC5pbmNsdWRlcyhuZWVkbGUpKSB7IGJlc3QgPSBvcHRpb25zW29pXTsgYmVzdFNjb3JlID0gMjsgfVxuICAgICAgICAgICAgICBpZiAoYmVzdFNjb3JlIDwgMSAmJiBuZWVkbGUuaW5jbHVkZXMob3B0VGV4dCkpIHsgYmVzdCA9IG9wdGlvbnNbb2ldOyBiZXN0U2NvcmUgPSAxOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiZXN0LmNsaWNrKCk7XG4gICAgICAgICAgICAvKiBBcHJcdTAwRThzIHNcdTAwRTlsZWN0aW9uIDogYXR0ZW5kcmUgcXVlIGxlIGNoYW1wIE5cdTAwQjAgQ09OVFJBVCBhcHBhcmFpc3NlLCBwdWlzIHJlbXBsaXIgbGUgcmVzdGUgKi9cbiAgICAgICAgICAgIHNldFRpbWVvdXQoZmlsbEZpZWxkcywgODAwKTtcbiAgICAgICAgICB9LCA2MDApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmaWxsRmllbGRzKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICAvKiBcdTAwQzljcmFuIDIgXHUyMDE0IERvc3NpZXIgcGF0aWVudCAob3Jkb25uYW5jZSwgcHJlc2NyaXB0ZXVyLCBjb3JyZWN0aW9ucykgKi9cbiAgICBycGE6IChkYXRhKSA9PiB7XG4gICAgICB2YXIgbyA9IGRhdGEubyB8fCB7fTtcbiAgICAgIHZhciBjID0gZGF0YS5jYWNoZWQgfHwge307XG4gICAgICB2YXIgbSA9IGRhdGEubSB8fCB7fTtcbiAgICAgIHZhciBmaWxsZWQgPSAwO1xuXG4gICAgICAvKiBEYXRlIGQnb3Jkb25uYW5jZSAqL1xuICAgICAgdmFyIGRhdGVPcmRvID0gby5kYXRlT3Jkb25uYW5jZSB8fCBjLmRhdGVPcmRvbm5hbmNlIHx8IFwiXCI7XG4gICAgICBpZiAoZGF0ZU9yZG8pIHtcbiAgICAgICAgdmFyIGQgPSBTdHJpbmcoZGF0ZU9yZG8pLnJlcGxhY2UoL1xcRC9nLCBcIlwiKTtcbiAgICAgICAgdmFyIGRhdGVPcmRvRm10ID0gZGF0ZU9yZG87XG4gICAgICAgIGlmIChkLmxlbmd0aCA9PT0gOCkge1xuICAgICAgICAgIGRhdGVPcmRvRm10ID0gKHBhcnNlSW50KGQuc2xpY2UoMCw0KSkgPiAxOTAwKVxuICAgICAgICAgICAgPyBkLnNsaWNlKDYsOCkgKyBcIi9cIiArIGQuc2xpY2UoNCw2KSArIFwiL1wiICsgZC5zbGljZSgwLDQpXG4gICAgICAgICAgICA6IGQuc2xpY2UoMCwyKSArIFwiL1wiICsgZC5zbGljZSgyLDQpICsgXCIvXCIgKyBkLnNsaWNlKDQsOCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGRhdGVPcmRvRWwgPSBmaW5kRWxlbWVudCgnW2Zvcm1jb250cm9sbmFtZT1cImRhdGVPcmRvbm5hbmNlXCJdJyk7XG4gICAgICAgIGlmIChkYXRlT3Jkb0VsICYmICFkYXRlT3Jkb0VsLmRpc2FibGVkKSB7IHVsdHJhRmlsbChkYXRlT3Jkb0VsLCBkYXRlT3Jkb0ZtdCk7IGZpbGxlZCsrOyB9XG4gICAgICB9XG5cbiAgICAgIC8qIFByZXNjcmlwdGV1ciBcdTIwMTQgUlBQUyAocmFkaW8gKyBjaGFtcCkgKi9cbiAgICAgIHZhciBycHBzID0gby5ycHBzIHx8IGMucnBwcyB8fCBcIlwiO1xuICAgICAgaWYgKHJwcHMpIHtcbiAgICAgICAgLyogU1x1MDBFOWxlY3Rpb25uZXIgbGUgcmFkaW8gUlBQUyAodmFsdWU9XCIyXCIpICovXG4gICAgICAgIHZhciBycHBzUmFkaW8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdtYXQtcmFkaW8tZ3JvdXBbZm9ybWNvbnRyb2xuYW1lPVwicHJlc2NyaXB0ZXVyVHlwZVwiXSBpbnB1dFt2YWx1ZT1cIjJcIl0nKTtcbiAgICAgICAgaWYgKHJwcHNSYWRpbyAmJiAhcnBwc1JhZGlvLmNoZWNrZWQpIHJwcHNSYWRpby5jbGljaygpO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBycHBzRWwgPSBmaW5kRWxlbWVudCgnW2Zvcm1jb250cm9sbmFtZT1cImlkZW50aWZpYW50UmVnbGVtZW50YWlyZVwiXScpO1xuICAgICAgICAgIGlmIChycHBzRWwpIHsgdWx0cmFGaWxsKHJwcHNFbCwgcnBwcy5yZXBsYWNlKC9cXEQvZywgXCJcIikpOyBmaWxsZWQrKzsgfVxuICAgICAgICB9LCAzMDApO1xuICAgICAgfVxuXG4gICAgICAvKiBcdTI1MDBcdTI1MDAgQ29ycmVjdGlvbnMgb3B0aXF1ZXMgXHUyNTAwXHUyNTAwICovXG4gICAgICB2YXIgb2QgPSBvLm9laWxEcm9pdCB8fCBvLm9kIHx8IHt9O1xuICAgICAgdmFyIG9nID0gby5vZWlsR2F1Y2hlIHx8IG8ub2cgfHwge307XG5cbiAgICAgIC8qIERcdTAwRTl0ZWN0aW9uIGR1IHR5cGUgZGUgdmlzaW9uIHNcdTAwRTlsZWN0aW9ublx1MDBFOSB2aWEgbGVzIGNoZWNrYm94ZXMgKi9cbiAgICAgIHZhciBjaGVja2JveGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNob2l4LXZpc2lvbi10ZWludGUgbWF0LWNoZWNrYm94Jyk7XG5cbiAgICAgIC8qIEhlbHBlciA6IHRyb3V2ZXIgbGVzIGlucHV0cyBkZSBjb3JyZWN0aW9uIGRhbnMgdW4gYmxvYyBlcXVpcGVtZW50ICovXG4gICAgICBmdW5jdGlvbiBmaWxsVmlzaW9uQmxvY2soYmxvY2tJbmRleCwgb2REYXRhLCBvZ0RhdGEpIHtcbiAgICAgICAgLyogQ2hhcXVlIGJsb2MgZGUgdmlzaW9uIChsb2luLCBwclx1MDBFOHMsIG11bHRpZm9jYWwpIGEgdW4gYXBwLWNhcmFjdGVyaXN0aXF1ZSAqL1xuICAgICAgICB2YXIgYmxvY2tzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnYXBwLWNhcmFjdGVyaXN0aXF1ZScpO1xuICAgICAgICBpZiAoIWJsb2NrcyB8fCAhYmxvY2tzW2Jsb2NrSW5kZXhdKSByZXR1cm4gMDtcbiAgICAgICAgdmFyIGJsb2NrID0gYmxvY2tzW2Jsb2NrSW5kZXhdO1xuICAgICAgICB2YXIgY291bnQgPSAwO1xuXG4gICAgICAgIC8qIE9EIFx1MjAxNCBwcmVtaVx1MDBFOHJlIGxpZ25lIGR1IHRhYmxlYXUgKi9cbiAgICAgICAgdmFyIHJvd3MgPSBibG9jay5xdWVyeVNlbGVjdG9yQWxsKCd0cicpO1xuICAgICAgICBpZiAocm93cy5sZW5ndGggPj0gMikge1xuICAgICAgICAgIHZhciBvZElucHV0cyA9IHJvd3NbMV0ucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbbWF0aW5wdXRdOm5vdChbZGlzYWJsZWRdKScpO1xuICAgICAgICAgIGlmIChvZElucHV0cy5sZW5ndGggPj0gMSAmJiBvZERhdGEuc3BoZXJlKSB7IHVsdHJhRmlsbChvZElucHV0c1swXSwgb2REYXRhLnNwaGVyZSk7IGNvdW50Kys7IH1cbiAgICAgICAgICBpZiAob2RJbnB1dHMubGVuZ3RoID49IDIgJiYgb2REYXRhLmN5bGluZHJlKSB7IHVsdHJhRmlsbChvZElucHV0c1sxXSwgb2REYXRhLmN5bGluZHJlKTsgY291bnQrKzsgfVxuICAgICAgICAgIGlmIChvZElucHV0cy5sZW5ndGggPj0gMyAmJiBvZERhdGEuYXhlKSB7IHVsdHJhRmlsbChvZElucHV0c1syXSwgb2REYXRhLmF4ZSk7IGNvdW50Kys7IH1cbiAgICAgICAgICAvKiBBZGRpdGlvbiAoc2kgcHJcdTAwRTlzZW50IFx1MjAxNCBtdWx0aWZvY2FsKSAqL1xuICAgICAgICAgIGlmIChvZElucHV0cy5sZW5ndGggPj0gNCAmJiBvZERhdGEuYWRkaXRpb24pIHsgdWx0cmFGaWxsKG9kSW5wdXRzWzNdLCBvZERhdGEuYWRkaXRpb24pOyBjb3VudCsrOyB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiBPRyBcdTIwMTQgZGV1eGlcdTAwRThtZSBsaWduZSBkdSB0YWJsZWF1ICovXG4gICAgICAgIGlmIChyb3dzLmxlbmd0aCA+PSAzKSB7XG4gICAgICAgICAgdmFyIG9nSW5wdXRzID0gcm93c1syXS5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFttYXRpbnB1dF06bm90KFtkaXNhYmxlZF0pJyk7XG4gICAgICAgICAgaWYgKG9nSW5wdXRzLmxlbmd0aCA+PSAxICYmIG9nRGF0YS5zcGhlcmUpIHsgdWx0cmFGaWxsKG9nSW5wdXRzWzBdLCBvZ0RhdGEuc3BoZXJlKTsgY291bnQrKzsgfVxuICAgICAgICAgIGlmIChvZ0lucHV0cy5sZW5ndGggPj0gMiAmJiBvZ0RhdGEuY3lsaW5kcmUpIHsgdWx0cmFGaWxsKG9nSW5wdXRzWzFdLCBvZ0RhdGEuY3lsaW5kcmUpOyBjb3VudCsrOyB9XG4gICAgICAgICAgaWYgKG9nSW5wdXRzLmxlbmd0aCA+PSAzICYmIG9nRGF0YS5heGUpIHsgdWx0cmFGaWxsKG9nSW5wdXRzWzJdLCBvZ0RhdGEuYXhlKTsgY291bnQrKzsgfVxuICAgICAgICAgIGlmIChvZ0lucHV0cy5sZW5ndGggPj0gNCAmJiBvZ0RhdGEuYWRkaXRpb24pIHsgdWx0cmFGaWxsKG9nSW5wdXRzWzNdLCBvZ0RhdGEuYWRkaXRpb24pOyBjb3VudCsrOyB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY291bnQ7XG4gICAgICB9XG5cbiAgICAgIC8qIENvY2hlciBsYSB2aXNpb24gY29uY2Vyblx1MDBFOWUgZXQgcmVtcGxpciAqL1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgLyogVmlzaW9uIGRlIGxvaW4gKi9cbiAgICAgICAgaWYgKChvZC5zcGhlcmUgfHwgb2cuc3BoZXJlKSAmJiBjaGVja2JveGVzWzBdKSB7XG4gICAgICAgICAgdmFyIGNiMElucHV0ID0gY2hlY2tib3hlc1swXS5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKTtcbiAgICAgICAgICBpZiAoY2IwSW5wdXQgJiYgIWNiMElucHV0LmNoZWNrZWQpIGNiMElucHV0LmNsaWNrKCk7XG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHsgZmlsbGVkICs9IGZpbGxWaXNpb25CbG9jaygwLCBvZCwgb2cpOyB9LCAyMDApO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogVmlzaW9uIGRlIHByXHUwMEU4cyAoYWRkaXRpb24gPSBwcm9ncmVzc2lmcykgKi9cbiAgICAgICAgaWYgKG9kLmFkZGl0aW9uIHx8IG9nLmFkZGl0aW9uKSB7XG4gICAgICAgICAgLyogQ29jaGVyIG11bHRpZm9jYWwgc2kgYWRkaXRpb24gZXhpc3RlICovXG4gICAgICAgICAgaWYgKGNoZWNrYm94ZXNbMl0pIHtcbiAgICAgICAgICAgIHZhciBjYjJJbnB1dCA9IGNoZWNrYm94ZXNbMl0ucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJyk7XG4gICAgICAgICAgICBpZiAoY2IySW5wdXQgJiYgIWNiMklucHV0LmNoZWNrZWQpIGNiMklucHV0LmNsaWNrKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LCA1MDApO1xuXG4gICAgICByZXR1cm4gZmlsbGVkID4gMDtcbiAgICB9LFxuXG4gICAgLyogUGFnZSAyIFx1MjAxNCBkXHUwMEU5dGVjdGlvbiBhdXRvbWF0aXF1ZSAqL1xuICAgIHJwYVBhZ2UyOiB0cnVlLFxuXG4gICAgc3luY2hyb25pc2VyOiBhc3luYyAoKSA9PiBmYWxzZVxuICB9XG59O1xuIiwgImV4cG9ydCBkZWZhdWx0IHtcbiAgbmFtZTogXCJTUCBTYW50ZVwiLFxuICBpc01hdGNoOiAoKSA9PiAod2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLmluY2x1ZGVzKFwiZmZsLXByb21vdGV1ci5jb21cIikgJiYgIXdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZS5pbmNsdWRlcyhcIm9wdGlxdWUtdHBwbHVzXCIpKSB8fCB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUuaW5jbHVkZXMoXCJzcHNhbnRlLmZyXCIpLFxuICBhY3Rpb25zOiB7XG4gICAgZm9ybXVsYWlyZTogKGRhdGEpID0+IHtcbiAgICAgIHZhciBub21FbCA9IGZpbmRFbGVtZW50KCcjbWF0LWlucHV0LTAnKTtcbiAgICAgIGlmICghbm9tRWwpIHJldHVybiBmYWxzZTtcbiAgICAgIHZhciBtID0gZGF0YS5tIHx8IHt9O1xuICAgICAgdmFyIG8gPSBkYXRhLm8gfHwge307XG4gICAgICB2YXIgYyA9IGRhdGEuY2FjaGVkIHx8IHt9O1xuICAgICAgdmFyIHBlcnNvbm5lcyA9IG0ucGVyc29ubmVzIHx8IFtdO1xuICAgICAgdmFyIHAwID0gcGVyc29ubmVzLmxlbmd0aCA+IDAgPyBwZXJzb25uZXNbMF0gOiB7fTtcbiAgICAgIHZhciBub20gPSBtLm5vbSB8fCBwMC5ub20gfHwgby5ub21QYXRpZW50IHx8IGMubm9tIHx8IFwiXCI7XG4gICAgICB2YXIgcHJlbm9tID0gbS5wcmVub20gfHwgcDAucHJlbm9tIHx8IG8ucHJlbm9tUGF0aWVudCB8fCBjLnByZW5vbSB8fCBcIlwiO1xuICAgICAgdmFyIGZvdW5kTlNTID0gbS5udW1lcm9TZWN1cml0ZVNvY2lhbGUgfHwgXCJcIjtcbiAgICAgIGlmICghZm91bmROU1MpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwZXJzb25uZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgcE5TUyA9IChwZXJzb25uZXNbaV0ubnVtZXJvU2VjdXJpdGVTb2NpYWxlIHx8IFwiXCIpLnJlcGxhY2UoL1xcRC9nLCBcIlwiKTtcbiAgICAgICAgICBpZiAocE5TUy5sZW5ndGggPj0gMTMpIHsgZm91bmROU1MgPSBwZXJzb25uZXNbaV0ubnVtZXJvU2VjdXJpdGVTb2NpYWxlOyBicmVhazsgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YXIgZm91bmRET0IgPSBtLmRhdGVOYWlzc2FuY2UgfHwgXCJcIjtcbiAgICAgIGlmICghZm91bmRET0IpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwZXJzb25uZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAocGVyc29ubmVzW2ldLmRhdGVOYWlzc2FuY2UpIHsgZm91bmRET0IgPSBwZXJzb25uZXNbaV0uZGF0ZU5haXNzYW5jZTsgYnJlYWs7IH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIG5zcyA9IGZvdW5kTlNTIHx8IGMubnNzIHx8IFwiXCI7XG4gICAgICB2YXIgZG9iID0gZm91bmRET0IgfHwgby5kYXRlTmFpc3NhbmNlUGF0aWVudCB8fCBjLmRvYiB8fCBcIlwiO1xuICAgICAgdmFyIGVmZmVjdGl2ZU5TUyA9IGdldE91dnJhbnREcm9pdE5TUyhuc3MsIGRvYiwgcGVyc29ubmVzKTtcbiAgICAgIHZhciBkaWdpdHMgPSBlZmZlY3RpdmVOU1MucmVwbGFjZSgvXFxEL2csIFwiXCIpO1xuICAgICAgdmFyIG51bUFkaGVyZW50ID0gbS5udW1lcm9BZGhlcmVudCB8fCBjLm51bWVyb0FkaGVyZW50IHx8IChjLnJlZ2ltZXMgJiYgYy5yZWdpbWVzLnJjMSAmJiBjLnJlZ2ltZXMucmMxLm51bWVyb0FkaGVyZW50KSB8fCBcIlwiO1xuXG4gICAgICB1bHRyYUZpbGwobm9tRWwsIG5vbS50b1VwcGVyQ2FzZSgpKTtcbiAgICAgIHVsdHJhRmlsbChmaW5kRWxlbWVudCgnI21hdC1pbnB1dC0xJyksIGNhcGl0YWxpemUocHJlbm9tKSk7XG4gICAgICBpZiAoZG9iKSB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJyNtYXQtaW5wdXQtMicpLCBkb2IpO1xuICAgICAgaWYgKG51bUFkaGVyZW50KSB7XG4gICAgICAgIHVsdHJhRmlsbChmaW5kRWxlbWVudCgnI21hdC1pbnB1dC03JyksIG51bUFkaGVyZW50KTtcbiAgICAgICAgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCcjbWF0LWlucHV0LTgnKSwgbnVtQWRoZXJlbnQpO1xuICAgICAgfVxuICAgICAgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCcjbWF0LWlucHV0LTknKSwgZGlnaXRzLnNsaWNlKDAsIDEzKSk7XG4gICAgICB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJyNtYXQtaW5wdXQtMTAnKSwgZGlnaXRzLnNsaWNlKDEzLCAxNSkpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICBzeW5jaHJvbmlzZXI6IGFzeW5jICgpID0+IGZhbHNlXG4gIH1cbn07XG4iLCAiZXhwb3J0IGRlZmF1bHQge1xuICBuYW1lOiBcIlNvbGltdXRcIixcbiAgaXNNYXRjaDogKCkgPT4gd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLmluY2x1ZGVzKFwic29saW11dC5mclwiKSxcbiAgYWN0aW9uczoge1xuICAgIGZvcm11bGFpcmU6IChkYXRhKSA9PiB7XG4gICAgICB2YXIgbWF0cmljdWxlRWwgPSBmaW5kRWxlbWVudCgnaW5wdXRbbmFtZT1cIlBob25lXCJdJyk7XG4gICAgICBpZiAoIW1hdHJpY3VsZUVsKSByZXR1cm4gZmFsc2U7XG4gICAgICB2YXIgbSA9IGRhdGEubSB8fCB7fTtcbiAgICAgIHZhciBvID0gZGF0YS5vIHx8IHt9O1xuICAgICAgdmFyIGMgPSBkYXRhLmNhY2hlZCB8fCB7fTtcbiAgICAgIHZhciBwZXJzb25uZXMgPSBtLnBlcnNvbm5lcyB8fCBbXTtcbiAgICAgIHZhciBwMCA9IHBlcnNvbm5lcy5sZW5ndGggPiAwID8gcGVyc29ubmVzWzBdIDoge307XG4gICAgICB2YXIgZm91bmROU1MgPSBtLm51bWVyb1NlY3VyaXRlU29jaWFsZSB8fCBcIlwiO1xuICAgICAgaWYgKCFmb3VuZE5TUykge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBlcnNvbm5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciBwTlNTID0gKHBlcnNvbm5lc1tpXS5udW1lcm9TZWN1cml0ZVNvY2lhbGUgfHwgXCJcIikucmVwbGFjZSgvXFxEL2csIFwiXCIpO1xuICAgICAgICAgIGlmIChwTlNTLmxlbmd0aCA+PSAxMykgeyBmb3VuZE5TUyA9IHBlcnNvbm5lc1tpXS5udW1lcm9TZWN1cml0ZVNvY2lhbGU7IGJyZWFrOyB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciBmb3VuZERPQiA9IG0uZGF0ZU5haXNzYW5jZSB8fCBcIlwiO1xuICAgICAgaWYgKCFmb3VuZERPQikge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBlcnNvbm5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChwZXJzb25uZXNbaV0uZGF0ZU5haXNzYW5jZSkgeyBmb3VuZERPQiA9IHBlcnNvbm5lc1tpXS5kYXRlTmFpc3NhbmNlOyBicmVhazsgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YXIgbnNzID0gZm91bmROU1MgfHwgYy5uc3MgfHwgXCJcIjtcbiAgICAgIHZhciBkb2IgPSBmb3VuZERPQiB8fCBvLmRhdGVOYWlzc2FuY2VQYXRpZW50IHx8IGMuZG9iIHx8IFwiXCI7XG4gICAgICB2YXIgZWZmZWN0aXZlTlNTID0gZ2V0T3V2cmFudERyb2l0TlNTKG5zcywgZG9iLCBwZXJzb25uZXMpO1xuXG4gICAgICAvKiBIZWxwZXIgOiB0cm91dmVyIHVuIGlucHV0IFJhZHplbiBwYXIgbGUgdGV4dGUgZHUgbGFiZWwgYWRqYWNlbnQgKi9cbiAgICAgIGZ1bmN0aW9uIGZpbmRSYWR6ZW5JbnB1dEJ5TGFiZWwobGFiZWxUZXh0KSB7XG4gICAgICAgIHZhciBsYWJlbHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjZGV2aXNfaWRlbnQgbGFiZWwsICNib2R5LWRldmlzIGxhYmVsJyk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGFiZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKChsYWJlbHNbaV0udGV4dENvbnRlbnQgfHwgXCJcIikudHJpbSgpLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihsYWJlbFRleHQudG9Mb3dlckNhc2UoKSkgPj0gMCkge1xuICAgICAgICAgICAgdmFyIGNvbnRhaW5lciA9IGxhYmVsc1tpXS5jbG9zZXN0KCcuY29sLWxnLTIsIC5jb2wtbGctMywgLmNvbC14bC0yLCAuY29sLXhsLTMsIGRpdltjbGFzcyo9XCJjb2wtXCJdJyk7XG4gICAgICAgICAgICBpZiAoY29udGFpbmVyKSB7XG4gICAgICAgICAgICAgIHZhciBpbnAgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignLnJ6LWNhbGVuZGFyIC5yei1pbnB1dHRleHQ6bm90KFtkaXNhYmxlZF0pOm5vdChbcmVhZG9ubHldKScpO1xuICAgICAgICAgICAgICBpZiAoaW5wKSByZXR1cm4gaW5wO1xuICAgICAgICAgICAgICBpbnAgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignLnJ6LXRleHRib3g6bm90KFtkaXNhYmxlZF0pJyk7XG4gICAgICAgICAgICAgIGlmIChpbnApIHJldHVybiBpbnA7XG4gICAgICAgICAgICAgIGlucCA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdpbnB1dC5yei1pbnB1dHRleHQ6bm90KFtkaXNhYmxlZF0pOm5vdChbcmVhZG9ubHldKScpO1xuICAgICAgICAgICAgICBpZiAoaW5wKSByZXR1cm4gaW5wO1xuICAgICAgICAgICAgICBpbnAgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignLnJ6LXNwaW5uZXItaW5wdXQ6bm90KFtkaXNhYmxlZF0pJyk7XG4gICAgICAgICAgICAgIGlmIChpbnApIHJldHVybiBpbnA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICAvKiBNYXRyaWN1bGUgYXZlYyBtYXNxdWUgOiBYIFhYIFhYIFhYIFhYWCBYWFggKi9cbiAgICAgIHZhciBkaWdpdHMgPSBlZmZlY3RpdmVOU1MucmVwbGFjZSgvXFxEL2csIFwiXCIpO1xuICAgICAgdmFyIGZvcm1hdHRlZCA9IGRpZ2l0cztcbiAgICAgIGlmIChkaWdpdHMubGVuZ3RoID49IDEzKSB7XG4gICAgICAgIGZvcm1hdHRlZCA9IGRpZ2l0c1swXSArIFwiIFwiICsgZGlnaXRzLnNsaWNlKDEsMykgKyBcIiBcIiArIGRpZ2l0cy5zbGljZSgzLDUpICsgXCIgXCIgKyBkaWdpdHMuc2xpY2UoNSw3KSArIFwiIFwiICsgZGlnaXRzLnNsaWNlKDcsMTApICsgXCIgXCIgKyBkaWdpdHMuc2xpY2UoMTAsMTMpO1xuICAgICAgICBpZiAoZGlnaXRzLmxlbmd0aCA+PSAxNSkgZm9ybWF0dGVkICs9IFwiIFwiICsgZGlnaXRzLnNsaWNlKDEzLDE1KTtcbiAgICAgIH1cbiAgICAgIHVsdHJhRmlsbChtYXRyaWN1bGVFbCwgZm9ybWF0dGVkKTtcblxuICAgICAgLyogRGF0ZSBkZSBuYWlzc2FuY2UgXHUyMDE0IGNoZXJjaGVyIHBhciBsYWJlbCAqL1xuICAgICAgaWYgKGRvYikge1xuICAgICAgICB2YXIgZG9iSW5wdXQgPSBmaW5kUmFkemVuSW5wdXRCeUxhYmVsKFwiRGF0ZSBkZSBuYWlzc2FuY2VcIik7XG4gICAgICAgIGlmICghZG9iSW5wdXQpIHtcbiAgICAgICAgICB2YXIgYWxsRGF0ZUlucHV0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyNkZXZpc19pZGVudCAucnotY2FsZW5kYXIgLnJ6LWlucHV0dGV4dDpub3QoW2Rpc2FibGVkXSk6bm90KFtyZWFkb25seV0pJyk7XG4gICAgICAgICAgaWYgKGFsbERhdGVJbnB1dHMubGVuZ3RoID49IDEpIGRvYklucHV0ID0gYWxsRGF0ZUlucHV0c1swXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZG9iSW5wdXQpIHVsdHJhRmlsbChkb2JJbnB1dCwgZG9iKTtcbiAgICAgIH1cblxuICAgICAgLyogUmFuZyBnXHUwMEU5bWVsbGFpcmUgKi9cbiAgICAgIHZhciByYW5nRWwgPSBmaW5kUmFkemVuSW5wdXRCeUxhYmVsKFwiUmFuZ1wiKTtcbiAgICAgIC8qIG5lIHBhcyByZW1wbGlyIGxlIHJhbmcgc2F1ZiBzaSBvbiBhIHVuZSBkb25uXHUwMEU5ZSBleHBsaWNpdGUgKi9cblxuICAgICAgLyogTlx1MDBCMCBwcmVzY3JpcHRldXIgKFJQUFMvQURFTEkpICovXG4gICAgICB2YXIgcnBwcyA9IG8ucnBwcyB8fCAoYy5vcmRvbm5hbmNlICYmIGMub3Jkb25uYW5jZS5ycHBzKSB8fCAoYy5wcmVzY3JpcHRpb24gJiYgYy5wcmVzY3JpcHRpb24ucnBwcykgfHwgYy5ycHBzIHx8IFwiXCI7XG4gICAgICBpZiAocnBwcykge1xuICAgICAgICB2YXIgcnBwc0VsID0gZmluZEVsZW1lbnQoJ2lucHV0W25hbWU9XCJQcmVzY3JpcHRldXJcIl0nKTtcbiAgICAgICAgaWYgKHJwcHNFbCkgdWx0cmFGaWxsKHJwcHNFbCwgcnBwcy5yZXBsYWNlKC9cXEQvZywgXCJcIikuc2xpY2UoMCwgOSkpO1xuICAgICAgfVxuXG4gICAgICAvKiBEYXRlIGRlIHByZXNjcmlwdGlvbiBcdTIwMTQgY2hlcmNoZXIgcGFyIGxhYmVsICovXG4gICAgICB2YXIgZGF0ZU9yZG8gPSBvLmRhdGVPcmRvbm5hbmNlIHx8IChjLm9yZG9ubmFuY2UgJiYgYy5vcmRvbm5hbmNlLmRhdGVPcmRvbm5hbmNlKSB8fCAoYy5wcmVzY3JpcHRpb24gJiYgYy5wcmVzY3JpcHRpb24uZGF0ZVByZXNjcmlwdGlvbikgfHwgXCJcIjtcbiAgICAgIGlmIChkYXRlT3Jkbykge1xuICAgICAgICB2YXIgcHJlc2NEYXRlSW5wdXQgPSBmaW5kUmFkemVuSW5wdXRCeUxhYmVsKFwiRGF0ZSBkZSBwcmVzY3JpcHRpb25cIik7XG4gICAgICAgIGlmICghcHJlc2NEYXRlSW5wdXQpIHtcbiAgICAgICAgICB2YXIgYWxsRGF0ZUlucHV0czIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjZGV2aXNfaWRlbnQgLnJ6LWNhbGVuZGFyIC5yei1pbnB1dHRleHQ6bm90KFtkaXNhYmxlZF0pOm5vdChbcmVhZG9ubHldKScpO1xuICAgICAgICAgIGlmIChhbGxEYXRlSW5wdXRzMi5sZW5ndGggPj0gMikgcHJlc2NEYXRlSW5wdXQgPSBhbGxEYXRlSW5wdXRzMlsxXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocHJlc2NEYXRlSW5wdXQpIHVsdHJhRmlsbChwcmVzY0RhdGVJbnB1dCwgZGF0ZU9yZG8pO1xuICAgICAgfVxuXG4gICAgICBjb25zb2xlLmluZm8oXCJbT3B0aUJvdCBTb2xpbXV0XSBmaWxsZWQgXHUyMDE0IGhhc05TUzpcIiwgISFlZmZlY3RpdmVOU1MsIFwifCBoYXNEb2I6XCIsICEhZG9iLCBcInwgaGFzUnBwczpcIiwgISFycHBzLCBcInwgaGFzRGF0ZU9yZG86XCIsICEhZGF0ZU9yZG8pO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICBzeW5jaHJvbmlzZXI6IGFzeW5jICgpID0+IGZhbHNlXG4gIH1cbn07XG4iLCAiZXhwb3J0IGRlZmF1bHQge1xuICBuYW1lOiBcIkFtZWxpXCIsXG4gIGlzTWF0Y2g6ICgpID0+IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZS5pbmNsdWRlcyhcImFtZWxpLmZyXCIpLFxuICBhY3Rpb25zOiB7XG4gICAgZm9ybXVsYWlyZTogKGRhdGEpID0+IHtcbiAgICAgIHZhciBuaXJFbCA9IGZpbmRFbGVtZW50KCcjbmlyJyk7XG4gICAgICBpZiAoIW5pckVsKSByZXR1cm4gZmFsc2U7XG4gICAgICB2YXIgbSA9IGRhdGEubSB8fCB7fTtcbiAgICAgIHZhciBwZXJzb25uZXMgPSBtLnBlcnNvbm5lcyB8fCBbXTtcbiAgICAgIHZhciBwMCA9IHBlcnNvbm5lcy5sZW5ndGggPiAwID8gcGVyc29ubmVzWzBdIDoge307XG4gICAgICB2YXIgZm91bmROU1MgPSBtLm51bWVyb1NlY3VyaXRlU29jaWFsZSB8fCBcIlwiO1xuICAgICAgaWYgKCFmb3VuZE5TUykge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBlcnNvbm5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciBwTlNTID0gKHBlcnNvbm5lc1tpXS5udW1lcm9TZWN1cml0ZVNvY2lhbGUgfHwgXCJcIikucmVwbGFjZSgvXFxEL2csIFwiXCIpO1xuICAgICAgICAgIGlmIChwTlNTLmxlbmd0aCA+PSAxMykgeyBmb3VuZE5TUyA9IHBlcnNvbm5lc1tpXS5udW1lcm9TZWN1cml0ZVNvY2lhbGU7IGJyZWFrOyB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciBkb2IgPSBtLmRhdGVOYWlzc2FuY2UgfHwgcDAuZGF0ZU5haXNzYW5jZSB8fCBcIlwiO1xuICAgICAgdmFyIGMgPSBkYXRhLmNhY2hlZCB8fCB7fTtcbiAgICAgIHZhciBuc3MgPSBmb3VuZE5TUyB8fCBjLm5zcyB8fCBcIlwiO1xuICAgICAgdmFyIGVmZmVjdGl2ZU5TUyA9IGdldE91dnJhbnREcm9pdE5TUyhuc3MsIGRvYiwgcGVyc29ubmVzKTtcbiAgICAgIHVsdHJhRmlsbChuaXJFbCwgZWZmZWN0aXZlTlNTLnJlcGxhY2UoL1xcRC9nLCBcIlwiKS5zbGljZSgwLCAxMykpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICBzeW5jaHJvbmlzZXI6IGFzeW5jICgpID0+IGZhbHNlXG4gIH1cbn07XG4iLCAidmFyIFBPUlRBTF9LRVkgPSBcIm11dHVlbGxlLWFsbWVyeXMuY29tXCI7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgbmFtZTogXCJBbG1lcnlzXCIsXG4gIGlzTWF0Y2g6ICgpID0+IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZS5pbmNsdWRlcyhcImFsbWVyeXMuY29tXCIpIHx8IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZS5pbmNsdWRlcyhcImJlLWFsbWVyeXMuY29tXCIpLFxuICBhY3Rpb25zOiB7XG4gICAgZm9ybXVsYWlyZTogKGRhdGEpID0+IHtcbiAgICAgIHZhciBtID0gZGF0YS5tIHx8IHt9O1xuICAgICAgdmFyIG8gPSBkYXRhLm8gfHwge307XG4gICAgICB2YXIgYyA9IGRhdGEuY2FjaGVkIHx8IHt9O1xuICAgICAgdmFyIHBlcnNvbm5lcyA9IG0ucGVyc29ubmVzIHx8IFtdO1xuICAgICAgdmFyIHAwID0gcGVyc29ubmVzLmxlbmd0aCA+IDAgPyBwZXJzb25uZXNbMF0gOiB7fTtcbiAgICAgIHZhciByYXdOU1MgPSBtLm51bWVyb1NlY3VyaXRlU29jaWFsZSB8fCBwMC5udW1lcm9TZWN1cml0ZVNvY2lhbGUgfHwgYy5uc3MgfHwgXCJcIjtcbiAgICAgIHZhciBkb2IgPSBtLmRhdGVOYWlzc2FuY2UgfHwgcDAuZGF0ZU5haXNzYW5jZSB8fCBvLmRhdGVOYWlzc2FuY2VQYXRpZW50IHx8IGMuZG9iIHx8IFwiXCI7XG4gICAgICB2YXIgbnNzID0gZ2V0T3V2cmFudERyb2l0TlNTKHJhd05TUywgZG9iLCBwZXJzb25uZXMpO1xuICAgICAgdmFyIG5vbSA9IG0ubm9tIHx8IHAwLm5vbSB8fCBvLm5vbVBhdGllbnQgfHwgYy5ub20gfHwgXCJcIjtcbiAgICAgIHZhciBwcmVub20gPSBtLnByZW5vbSB8fCBwMC5wcmVub20gfHwgby5wcmVub21QYXRpZW50IHx8IGMucHJlbm9tIHx8IFwiXCI7XG4gICAgICB2YXIgZmlsbGVkID0gZmFsc2U7XG5cbiAgICAgIC8qIEFsbWVyeXMgYSB1bmUgQ1NQIHN0cmljdGUgcXVpIGJsb3F1ZSBsZXMgc2NyaXB0cyBpbmxpbmUgKHBhZ2VFeGVjKS5cbiAgICAgICAgIHVsdHJhRmlsbCBkaXNwYXRjaCBkZXMgZXZlbnRzIG5hdGlmcyAoZm9jdXMvaW5wdXQvY2hhbmdlL2JsdXIpIGRlcHVpcyBsZVxuICAgICAgICAgY29udGVudCBzY3JpcHQuIExlIGNyYXNoICQuZ3JlcCBkJ0FsbWVyeXMgZXN0IGRhbnMgJChkb2N1bWVudCkucmVhZHkoKVxuICAgICAgICAgYXUgY2hhcmdlbWVudCBkZSBwYWdlIFx1MjAxNCBQQVMgbGllIGEgbm9zIGV2ZW50cy4gTGVzIGhhbmRsZXJzIG9uYmx1ciBkZXNcbiAgICAgICAgIGlucHV0cyBkYXRlcyAodmVyaWZEYXRlRGVtYW5kZTIvMykgc29udCBkZWNsZW5jaGVzIGNvcnJlY3RlbWVudCBwYXIgbGVcbiAgICAgICAgIGJsdXIgbmF0aWYgZGlzcGF0Y2hlIHBhciB1bHRyYUZpbGwuICovXG4gICAgICB2YXIgZmlsbERhdGUgPSBmdW5jdGlvbihlbCwgdmFsKSB7XG4gICAgICAgIGlmICghZWwgfHwgZWwuZGlzYWJsZWQgfHwgZWwucmVhZE9ubHkpIHJldHVybjtcbiAgICAgICAgdmFyIGQgPSBTdHJpbmcodmFsKS5yZXBsYWNlKC9cXEQvZywgXCJcIik7XG4gICAgICAgIGlmIChkLmxlbmd0aCA8IDgpIHJldHVybjtcbiAgICAgICAgdmFyIGZvcm1hdHRlZCA9IGQuc2xpY2UoMCwyKSArICcvJyArIGQuc2xpY2UoMiw0KSArICcvJyArIGQuc2xpY2UoNCw4KTtcbiAgICAgICAgdWx0cmFGaWxsKGVsLCBmb3JtYXR0ZWQpO1xuICAgICAgfTtcblxuICAgICAgY29uc29sZS5pbmZvKFwiW09wdGlCb3QgQWxtZXJ5c10gZm9ybXVsYWlyZSBcdTIwMTQgaGFzTlNTOlwiLCAhIW5zcywgXCJoYXNEb2I6XCIsICEhZG9iLCBcImhhc05vbTpcIiwgISFub20pO1xuXG4gICAgICAvKiBQYWdlIHJlY2hlcmNoZSBiZW5lZmljaWFpcmUgKi9cbiAgICAgIHZhciBub21CZW5lZiA9IGZpbmRFbGVtZW50VHJhY2tlZChQT1JUQUxfS0VZLCBcIm5vbV9iZW5lZmljaWFpcmVcIiwgJyNub21fYmVuZWZpY2lhaXJlJyk7XG4gICAgICBpZiAobm9tQmVuZWYpIHtcbiAgICAgICAgY29uc29sZS5pbmZvKFwiW09wdGlCb3QgQWxtZXJ5c10gUGFnZSByZWNoZXJjaGUgYmVuZWZpY2lhaXJlIGRldGVjdGVlXCIpO1xuICAgICAgICB1bHRyYUZpbGwobm9tQmVuZWYsIG5vbS50b1VwcGVyQ2FzZSgpKTtcbiAgICAgICAgdWx0cmFGaWxsKGZpbmRFbGVtZW50VHJhY2tlZChQT1JUQUxfS0VZLCBcIm5zc19iZW5lZmljaWFpcmVcIiwgJyNuc3NfYmVuZWZpY2lhaXJlJyksIG5zcyk7XG4gICAgICAgIGZpbGxlZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIC8qIFBvcHVwIGlmcmFtZSByZWNoZXJjaGUgYmVuZWZpY2lhaXJlIChjaGFtcHMgY3JpdF8pICovXG4gICAgICB2YXIgY3JpdE5OSSA9IGZpbmRFbGVtZW50VHJhY2tlZChQT1JUQUxfS0VZLCBcImNyaXRfbnVtSW5zZWVcIiwgJ2lucHV0W25hbWU9XCJjcml0X251bUluc2VlXCJdJyk7XG4gICAgICBpZiAoY3JpdE5OSSkge1xuICAgICAgICBjb25zb2xlLmluZm8oXCJbT3B0aUJvdCBBbG1lcnlzXSBQb3B1cCByZWNoZXJjaGUgYmVuZWZpY2lhaXJlIGRldGVjdGVlXCIpO1xuICAgICAgICB2YXIgZWZmZWN0aXZlTlNTID0gZ2V0T3V2cmFudERyb2l0TlNTKG5zcywgZG9iLCBwZXJzb25uZXMpO1xuICAgICAgICB1bHRyYUZpbGwoY3JpdE5OSSwgZWZmZWN0aXZlTlNTLnJlcGxhY2UoL1xcRC9nLCBcIlwiKS5zbGljZSgwLCAxMykpO1xuICAgICAgICB1bHRyYUZpbGwoZmluZEVsZW1lbnRUcmFja2VkKFBPUlRBTF9LRVksIFwiY3JpdF9ub21CZW5lZlwiLCAnaW5wdXRbbmFtZT1cImNyaXRfbm9tQmVuZWZcIl0nKSwgbm9tLnRvVXBwZXJDYXNlKCkpO1xuICAgICAgICB1bHRyYUZpbGwoZmluZEVsZW1lbnRUcmFja2VkKFBPUlRBTF9LRVksIFwiY3JpdF9wcmVub21CZW5lZlwiLCAnaW5wdXRbbmFtZT1cImNyaXRfcHJlbm9tQmVuZWZcIl0nKSwgY2FwaXRhbGl6ZShwcmVub20pKTtcbiAgICAgICAgaWYgKGRvYikgdWx0cmFGaWxsKGZpbmRFbGVtZW50VHJhY2tlZChQT1JUQUxfS0VZLCBcImNyaXRfZGF0ZU5haXNzYW5jZUVkaXRcIiwgJ2lucHV0W25hbWU9XCJjcml0X2RhdGVOYWlzc2FuY2VFZGl0XCJdJyksIGRvYik7XG4gICAgICAgIGZpbGxlZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIC8qIFBhZ2UgUEVDIE9wdGlxdWUgXHUyMDE0IE5OSSBiZW5lZmljaWFpcmUgKi9cbiAgICAgIHZhciBubmlFbCA9IGZpbmRFbGVtZW50VHJhY2tlZChQT1JUQUxfS0VZLCBcIm51bUluc2VlXCIsICdpbnB1dFtuYW1lPVwibnVtSW5zZWVcIl0nKTtcbiAgICAgIGNvbnNvbGUuaW5mbyhcIltPcHRpQm90IEFsbWVyeXNdIG51bUluc2VlIHRyb3V2ZTpcIiwgISFubmlFbCwgbm5pRWwgPyBcInJlYWRPbmx5PVwiICsgbm5pRWwucmVhZE9ubHkgOiBcIlwiKTtcbiAgICAgIGlmIChubmlFbCAmJiAhbm5pRWwucmVhZE9ubHkpIHtcbiAgICAgICAgdmFyIGVmZmVjdGl2ZU5TUyA9IGdldE91dnJhbnREcm9pdE5TUyhuc3MsIGRvYiwgcGVyc29ubmVzKTtcbiAgICAgICAgY29uc29sZS5pbmZvKFwiW09wdGlCb3QgQWxtZXJ5c10gRmlsbCBOTkk6IFtSRURBQ1RFRF1cIik7XG4gICAgICAgIHVsdHJhRmlsbChubmlFbCwgZWZmZWN0aXZlTlNTLnJlcGxhY2UoL1xcRC9nLCBcIlwiKS5zbGljZSgwLCAxMykpO1xuICAgICAgICBmaWxsZWQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvKiBQYWdlIFBFQyBPcHRpcXVlIFx1MjAxNCBwcmVzY3JpcHRpb24gKi9cbiAgICAgIHZhciBkYXRlT3Jkb0VsID0gZmluZEVsZW1lbnRUcmFja2VkKFBPUlRBTF9LRVksIFwiZGF0ZU9yZG9ubmFuY2VFZGl0XCIsICdpbnB1dFtuYW1lPVwiZGF0ZU9yZG9ubmFuY2VFZGl0XCJdJyk7XG4gICAgICBjb25zb2xlLmluZm8oXCJbT3B0aUJvdCBBbG1lcnlzXSBkYXRlT3Jkb25uYW5jZUVkaXQgdHJvdXZlOlwiLCAhIWRhdGVPcmRvRWwsIGRhdGVPcmRvRWwgPyBcImRpc2FibGVkPVwiICsgZGF0ZU9yZG9FbC5kaXNhYmxlZCA6IFwiXCIpO1xuICAgICAgaWYgKGRhdGVPcmRvRWwpIHtcbiAgICAgICAgLyogRGF0ZSBkJ29yZG9ubmFuY2UgKHNldWxlbWVudCBzaSBsZSBjaGFtcCBlc3QgdmlkZSBldCBwYXMgZGlzYWJsZWQpICovXG4gICAgICAgIGlmICghZGF0ZU9yZG9FbC5kaXNhYmxlZCAmJiAhZGF0ZU9yZG9FbC52YWx1ZSkge1xuICAgICAgICAgIHZhciBkYXRlT3JkbyA9IG8uZGF0ZU9yZG9ubmFuY2UgfHwgKGMucHJlc2NyaXB0aW9uICYmIGMucHJlc2NyaXB0aW9uLmRhdGVQcmVzY3JpcHRpb24pIHx8IFwiXCI7XG4gICAgICAgICAgY29uc29sZS5pbmZvKFwiW09wdGlCb3QgQWxtZXJ5c10gRmlsbCBkYXRlIG9yZG86IFtSRURBQ1RFRF1cIik7XG4gICAgICAgICAgaWYgKGRhdGVPcmRvKSBmaWxsRGF0ZShkYXRlT3Jkb0VsLCBkYXRlT3Jkbyk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBEYXRlIGRlIGRlbWFuZGUgPSBhdWpvdXJkJ2h1aSAqL1xuICAgICAgICB2YXIgZGF0ZURlbWFuZGVFbCA9IGZpbmRFbGVtZW50VHJhY2tlZChQT1JUQUxfS0VZLCBcImRhdGVEZW1hbmRlRWRpdFwiLCAnaW5wdXRbbmFtZT1cImRhdGVEZW1hbmRlRWRpdFwiXScpO1xuICAgICAgICBjb25zb2xlLmluZm8oXCJbT3B0aUJvdCBBbG1lcnlzXSBkYXRlRGVtYW5kZUVkaXQgdHJvdXZlOlwiLCAhIWRhdGVEZW1hbmRlRWwsIGRhdGVEZW1hbmRlRWwgPyBcImRpc2FibGVkPVwiICsgZGF0ZURlbWFuZGVFbC5kaXNhYmxlZCA6IFwiXCIpO1xuICAgICAgICBpZiAoZGF0ZURlbWFuZGVFbCAmJiAhZGF0ZURlbWFuZGVFbC5kaXNhYmxlZCAmJiAhZGF0ZURlbWFuZGVFbC52YWx1ZSkge1xuICAgICAgICAgIHZhciB0b2RheSA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgdmFyIGRkID0gU3RyaW5nKHRvZGF5LmdldERhdGUoKSkucGFkU3RhcnQoMiwgJzAnKTtcbiAgICAgICAgICB2YXIgbW0gPSBTdHJpbmcodG9kYXkuZ2V0TW9udGgoKSArIDEpLnBhZFN0YXJ0KDIsICcwJyk7XG4gICAgICAgICAgdmFyIHl5eXkgPSB0b2RheS5nZXRGdWxsWWVhcigpO1xuICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIltPcHRpQm90IEFsbWVyeXNdIEZpbGwgZGF0ZSBkZW1hbmRlOlwiLCBkZCArIG1tICsgeXl5eSk7XG4gICAgICAgICAgZmlsbERhdGUoZGF0ZURlbWFuZGVFbCwgZGQgKyBtbSArIHl5eXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgZmlsbGVkID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLyogUGFnZSBQRUMgT3B0aXF1ZSBcdTIwMTQgY29jaGVyIGVxdWlwZW1lbnRzIHNlbG9uIGRvbm5lZXMgTEJPICovXG4gICAgICB2YXIgY2JNb250dXJlID0gZmluZEVsZW1lbnRUcmFja2VkKFBPUlRBTF9LRVksIFwic2Fpc2llTW9udHVyZVwiLCAnaW5wdXRbbmFtZT1cInNhaXNpZU1vbnR1cmVcIl0nKTtcbiAgICAgIGlmIChjYk1vbnR1cmUpIHtcbiAgICAgICAgdmFyIGVxRGF0YSA9IGMuZXF1aXBlbWVudHMgfHwgW107XG4gICAgICAgIHZhciBoYXNNb250dXJlID0gZmFsc2U7XG4gICAgICAgIHZhciBoYXNWZXJyZSA9IGZhbHNlO1xuICAgICAgICB2YXIgaGFzU3VwcGxlbWVudCA9IGZhbHNlO1xuICAgICAgICB2YXIgaGFzTGVudGlsbGUgPSBmYWxzZTtcbiAgICAgICAgaWYgKGVxRGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgZm9yICh2YXIgZWkgPSAwOyBlaSA8IGVxRGF0YS5sZW5ndGg7IGVpKyspIHtcbiAgICAgICAgICAgIHZhciBsaWduZXMgPSBlcURhdGFbZWldLmxpZ25lcyB8fCBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGxpID0gMDsgbGkgPCBsaWduZXMubGVuZ3RoOyBsaSsrKSB7XG4gICAgICAgICAgICAgIGlmIChsaWduZXNbbGldLnR5cGUgPT09ICdtb250dXJlJykgaGFzTW9udHVyZSA9IHRydWU7XG4gICAgICAgICAgICAgIGlmIChsaWduZXNbbGldLnR5cGUgPT09ICd2ZXJyZScpIGhhc1ZlcnJlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgaWYgKGxpZ25lc1tsaV0udHlwZSA9PT0gJ3N1cHBsZW1lbnQnKSBoYXNTdXBwbGVtZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChlcURhdGFbZWldLnR5cGUgPT09ICdsZW50aWxsZXMnKSBoYXNMZW50aWxsZSA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8qIFBhcyBkZSBkb25uZWVzIGVxdWlwZW1lbnRzIC0+IGNvY2hlciBtb250dXJlICsgdmVycmVzIHBhciBkZWZhdXQgKi9cbiAgICAgICAgICBoYXNNb250dXJlID0gdHJ1ZTtcbiAgICAgICAgICBoYXNWZXJyZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNiVmVycmUgPSBmaW5kRWxlbWVudFRyYWNrZWQoUE9SVEFMX0tFWSwgXCJzYWlzaWVWZXJyZVwiLCAnaW5wdXRbbmFtZT1cInNhaXNpZVZlcnJlXCJdJyk7XG4gICAgICAgIHZhciBjYlN1cHAgPSBmaW5kRWxlbWVudFRyYWNrZWQoUE9SVEFMX0tFWSwgXCJzYWlzaWVTdXBwbGVtZW50XCIsICdpbnB1dFtuYW1lPVwic2Fpc2llU3VwcGxlbWVudFwiXScpO1xuICAgICAgICB2YXIgY2JMZW50aWxsZSA9IGZpbmRFbGVtZW50VHJhY2tlZChQT1JUQUxfS0VZLCBcInNhaXNpZUxlbnRpbGxlXCIsICdpbnB1dFtuYW1lPVwic2Fpc2llTGVudGlsbGVcIl0nKTtcbiAgICAgICAgaWYgKGNiTW9udHVyZSAmJiBoYXNNb250dXJlICYmICFjYk1vbnR1cmUuY2hlY2tlZCAmJiAhY2JNb250dXJlLmRpc2FibGVkKSBjYk1vbnR1cmUuY2xpY2soKTtcbiAgICAgICAgaWYgKGNiVmVycmUgJiYgaGFzVmVycmUgJiYgIWNiVmVycmUuY2hlY2tlZCAmJiAhY2JWZXJyZS5kaXNhYmxlZCkgY2JWZXJyZS5jbGljaygpO1xuICAgICAgICBpZiAoY2JTdXBwICYmIGhhc1N1cHBsZW1lbnQgJiYgIWNiU3VwcC5jaGVja2VkICYmICFjYlN1cHAuZGlzYWJsZWQpIGNiU3VwcC5jbGljaygpO1xuICAgICAgICBpZiAoY2JMZW50aWxsZSAmJiBoYXNMZW50aWxsZSAmJiAhY2JMZW50aWxsZS5jaGVja2VkICYmICFjYkxlbnRpbGxlLmRpc2FibGVkKSBjYkxlbnRpbGxlLmNsaWNrKCk7XG4gICAgICAgIGZpbGxlZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIC8qIFx1MjUwMFx1MjUwMCBQYWdlIDIgOiBFcXVpcGVtZW50cyBkZXRhaWxsZXMgKEdlcmVyUGVjT3B0aXF1ZS5kbykgXHUyNTAwXHUyNTAwXG4gICAgICAgICBJTVBPUlRBTlQgOiBORSBQQVMgdXRpbGlzZXIgdWx0cmFGaWxsIGljaS4gQWxtZXJ5cyBhIGRlcyBoYW5kbGVyc1xuICAgICAgICAgb25jaGFuZ2Ugc3VyIGNlcnRhaW5zIGNoYW1wcyAobnVtQU1QcmVzY3JpcHRldXIgLT4gcmVjaGVyY2hlUHJlc2NyaXB0ZXVyKClcbiAgICAgICAgIC0+IGRpc3BhdGNoZXIoKSAtPiBmb3JtLnN1Ym1pdCgpKS4gdWx0cmFGaWxsIGRpc3BhdGNoIGNoYW5nZS9ibHVyXG4gICAgICAgICBjZSBxdWkgZGVjbGVuY2hlIGxlIHN1Ym1pdCBldCB2aWRlIHRvdXQuXG4gICAgICAgICBPbiBlY3JpdCBsYSB2YWxldXIgc2lsZW5jaWV1c2VtZW50IHNhbnMgZXZlbmVtZW50cy4gKi9cbiAgICAgIHZhciBQUkVGSVggPSBcImdlcmVyUGVjT3B0aXF1ZUVsZW1lbnRbMF0uXCI7XG4gICAgICB2YXIgYWxGaWxsID0gZnVuY3Rpb24obmFtZSwgdmFsKSB7XG4gICAgICAgIGlmICghdmFsKSByZXR1cm47XG4gICAgICAgIHZhciBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tuYW1lPVwiJyArIFBSRUZJWCArIG5hbWUgKyAnXCJdJyk7XG4gICAgICAgIGlmIChlbCAmJiAhZWwuZGlzYWJsZWQgJiYgIWVsLnJlYWRPbmx5ICYmICEoZWwudmFsdWUgfHwgXCJcIikudHJpbSgpKSB7IGVsLnZhbHVlID0gU3RyaW5nKHZhbCk7IGZpbGxlZCA9IHRydWU7IH1cbiAgICAgIH07XG5cbiAgICAgIHZhciBwcmVzY0VsID0gZmluZEVsZW1lbnRUcmFja2VkKFBPUlRBTF9LRVksIFwibnVtQU1QcmVzY3JpcHRldXJcIiwgJ1tuYW1lPVwiJyArIFBSRUZJWCArICdudW1BTVByZXNjcmlwdGV1clwiXScpO1xuICAgICAgaWYgKHByZXNjRWwpIHtcbiAgICAgICAgY29uc29sZS5pbmZvKFwiW09wdGlCb3QgQWxtZXJ5c10gUGFnZSAyIGVxdWlwZW1lbnRzIGRldGVjdGVlXCIpO1xuXG4gICAgICAgIC8qIFByZXNjcmlwdGV1ciBSUFBTL0FERUxJICovXG4gICAgICAgIHZhciBycHBzID0gKG8gJiYgby5ycHBzKSB8fCAoYy5wcmVzY3JpcHRpb24gJiYgYy5wcmVzY3JpcHRpb24ucnBwcykgfHwgXCJcIjtcbiAgICAgICAgaWYgKHJwcHMpIGFsRmlsbChcIm51bUFNUHJlc2NyaXB0ZXVyXCIsIHJwcHMucmVwbGFjZSgvXFxEL2csIFwiXCIpLnNsaWNlKDAsIDkpKTtcblxuICAgICAgICAvKiBNb250dXJlICovXG4gICAgICAgIHZhciBlcURhdGEgPSBjLmVxdWlwZW1lbnRzIHx8IFtdO1xuICAgICAgICB2YXIgbW9udHVyZUxpZ25lID0gbnVsbCwgdmVycmVPRCA9IG51bGwsIHZlcnJlT0cgPSBudWxsO1xuICAgICAgICBmb3IgKHZhciBlaTIgPSAwOyBlaTIgPCBlcURhdGEubGVuZ3RoOyBlaTIrKykge1xuICAgICAgICAgIHZhciBsaWduZXMyID0gZXFEYXRhW2VpMl0ubGlnbmVzIHx8IFtdO1xuICAgICAgICAgIGZvciAodmFyIGxpMiA9IDA7IGxpMiA8IGxpZ25lczIubGVuZ3RoOyBsaTIrKykge1xuICAgICAgICAgICAgdmFyIGxpZ25lID0gbGlnbmVzMltsaTJdO1xuICAgICAgICAgICAgaWYgKGxpZ25lLnR5cGUgPT09IFwibW9udHVyZVwiICYmICFtb250dXJlTGlnbmUpIG1vbnR1cmVMaWduZSA9IGxpZ25lO1xuICAgICAgICAgICAgaWYgKGxpZ25lLnR5cGUgPT09IFwidmVycmVcIiAmJiBsaWduZS5vZWlsID09PSBcIk9EXCIgJiYgIXZlcnJlT0QpIHZlcnJlT0QgPSBsaWduZTtcbiAgICAgICAgICAgIGlmIChsaWduZS50eXBlID09PSBcInZlcnJlXCIgJiYgbGlnbmUub2VpbCA9PT0gXCJPR1wiICYmICF2ZXJyZU9HKSB2ZXJyZU9HID0gbGlnbmU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1vbnR1cmVMaWduZSkge1xuICAgICAgICAgIGlmIChtb250dXJlTGlnbmUuY29kZUxQUCkgYWxGaWxsKFwiY29kZUxQUE1vbnR1cmVcIiwgbW9udHVyZUxpZ25lLmNvZGVMUFApO1xuICAgICAgICAgIGlmIChtb250dXJlTGlnbmUucHJpeEJydXQpIGFsRmlsbChcInByaXhCcnV0TW9udHVyZVwiLCBTdHJpbmcobW9udHVyZUxpZ25lLnByaXhCcnV0KS5yZXBsYWNlKFwiLlwiLCBcIixcIikpO1xuICAgICAgICAgIGlmIChtb250dXJlTGlnbmUucmVtaXNlKSBhbEZpbGwoXCJwcml4UmVtaXNlTW9udHVyZVwiLCBTdHJpbmcobW9udHVyZUxpZ25lLnJlbWlzZSkucmVwbGFjZShcIi5cIiwgXCIsXCIpKTtcbiAgICAgICAgICBpZiAobW9udHVyZUxpZ25lLmRlc2lnbmF0aW9uKSB7XG4gICAgICAgICAgICB2YXIgcGFydHMgPSBtb250dXJlTGlnbmUuZGVzaWduYXRpb24uc3BsaXQoXCIvXCIpO1xuICAgICAgICAgICAgYWxGaWxsKFwibWFycXVlTW9udHVyZVwiLCAocGFydHNbMF0gfHwgXCJcIikudHJpbSgpKTtcbiAgICAgICAgICAgIGlmIChwYXJ0c1sxXSkgYWxGaWxsKFwibW9kZWxlTW9udHVyZVwiLCBwYXJ0c1sxXS50cmltKCkpO1xuICAgICAgICAgICAgYWxGaWxsKFwicmVmZXJlbmNlTW9udHVyZVwiLCBtb250dXJlTGlnbmUuZGVzaWduYXRpb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIFZlcnJlIE9EICovXG4gICAgICAgIGlmICh2ZXJyZU9EICYmIHZlcnJlT0QuY29kZUxQUCkgYWxGaWxsKFwiY29kZUxQUFZlcnJlRHJvaXRcIiwgdmVycmVPRC5jb2RlTFBQKTtcbiAgICAgICAgLyogVmVycmUgT0cgKi9cbiAgICAgICAgaWYgKHZlcnJlT0cgJiYgdmVycmVPRy5jb2RlTFBQKSBhbEZpbGwoXCJjb2RlTFBQVmVycmVHYXVjaGVcIiwgdmVycmVPRy5jb2RlTFBQKTtcblxuICAgICAgICAvKiBDb3JyZWN0aW9uIFx1MjAxNCBkZXB1aXMgb3Jkb25uYW5jZSBvdSBwcmVzY3JpcHRpb24gY2FjaGVkICovXG4gICAgICAgIHZhciBvZCA9IChvICYmIG8ubHVuZXR0ZXNPRCkgfHwgKGMucHJlc2NyaXB0aW9uICYmIGMucHJlc2NyaXB0aW9uLm9kKSB8fCB7fTtcbiAgICAgICAgdmFyIG9nID0gKG8gJiYgby5sdW5ldHRlc09HKSB8fCAoYy5wcmVzY3JpcHRpb24gJiYgYy5wcmVzY3JpcHRpb24ub2cpIHx8IHt9O1xuICAgICAgICBpZiAob2Quc3BoZXJlKSBhbEZpbGwoXCJzcGhlcmVWZXJyZURyb2l0XCIsIG9kLnNwaGVyZSk7XG4gICAgICAgIGlmIChvZC5jeWxpbmRyZSkgYWxGaWxsKFwiY3lsaW5kcmVWZXJyZURyb2l0XCIsIG9kLmN5bGluZHJlKTtcbiAgICAgICAgaWYgKG9kLmF4ZSkgYWxGaWxsKFwiYXhlVmVycmVEcm9pdFwiLCBvZC5heGUpO1xuICAgICAgICBpZiAob2QuYWRkaXRpb24pIGFsRmlsbChcImFkZGl0aW9uVmVycmVEcm9pdFwiLCBvZC5hZGRpdGlvbik7XG4gICAgICAgIGlmIChvZy5zcGhlcmUpIGFsRmlsbChcInNwaGVyZVZlcnJlR2F1Y2hlXCIsIG9nLnNwaGVyZSk7XG4gICAgICAgIGlmIChvZy5jeWxpbmRyZSkgYWxGaWxsKFwiY3lsaW5kcmVWZXJyZUdhdWNoZVwiLCBvZy5jeWxpbmRyZSk7XG4gICAgICAgIGlmIChvZy5heGUpIGFsRmlsbChcImF4ZVZlcnJlR2F1Y2hlXCIsIG9nLmF4ZSk7XG4gICAgICAgIGlmIChvZy5hZGRpdGlvbikgYWxGaWxsKFwiYWRkaXRpb25WZXJyZUdhdWNoZVwiLCBvZy5hZGRpdGlvbik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmaWxsZWQ7XG4gICAgfSxcbiAgICBzeW5jaHJvbmlzZXI6IGFzeW5jICgpID0+IGZhbHNlXG4gIH1cbn07XG4iLCAiZXhwb3J0IGRlZmF1bHQge1xuICBuYW1lOiBcIk94YW50aXNcIixcbiAgaXNNYXRjaDogKCkgPT4gd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLmluY2x1ZGVzKFwib3hhbnRpcy5uZXRcIiksXG4gIGFjdGlvbnM6IHtcbiAgICBmb3JtdWxhaXJlOiAoZGF0YSkgPT4ge1xuICAgICAgdmFyIG0gPSBkYXRhLm0gfHwge307XG4gICAgICB2YXIgbyA9IGRhdGEubyB8fCB7fTtcbiAgICAgIHZhciBjID0gZGF0YS5jYWNoZWQgfHwge307XG4gICAgICB2YXIgcGVyc29ubmVzID0gbS5wZXJzb25uZXMgfHwgW107XG4gICAgICB2YXIgcDAgPSBwZXJzb25uZXMubGVuZ3RoID4gMCA/IHBlcnNvbm5lc1swXSA6IHt9O1xuXG4gICAgICB2YXIgbm9tID0gKG0ubm9tIHx8IHAwLm5vbSB8fCBvLm5vbVBhdGllbnQgfHwgYy5ub20gfHwgXCJcIikudG9VcHBlckNhc2UoKTtcbiAgICAgIHZhciBwcmVub20gPSBtLnByZW5vbSB8fCBwMC5wcmVub20gfHwgby5wcmVub21QYXRpZW50IHx8IGMucHJlbm9tIHx8IFwiXCI7XG5cbiAgICAgIHZhciBmb3VuZE5TUyA9IG0ubnVtZXJvU2VjdXJpdGVTb2NpYWxlIHx8IFwiXCI7XG4gICAgICBpZiAoIWZvdW5kTlNTKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGVyc29ubmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdmFyIHBOU1MgPSAocGVyc29ubmVzW2ldLm51bWVyb1NlY3VyaXRlU29jaWFsZSB8fCBcIlwiKS5yZXBsYWNlKC9cXEQvZywgXCJcIik7XG4gICAgICAgICAgaWYgKHBOU1MubGVuZ3RoID49IDEzKSB7IGZvdW5kTlNTID0gcGVyc29ubmVzW2ldLm51bWVyb1NlY3VyaXRlU29jaWFsZTsgYnJlYWs7IH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIGZvdW5kRE9CID0gbS5kYXRlTmFpc3NhbmNlIHx8IFwiXCI7XG4gICAgICBpZiAoIWZvdW5kRE9CKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGVyc29ubmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKHBlcnNvbm5lc1tpXS5kYXRlTmFpc3NhbmNlKSB7IGZvdW5kRE9CID0gcGVyc29ubmVzW2ldLmRhdGVOYWlzc2FuY2U7IGJyZWFrOyB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciBuc3MgPSAoZm91bmROU1MgfHwgYy5uc3MgfHwgXCJcIikucmVwbGFjZSgvXFxzL2csIFwiXCIpO1xuICAgICAgdmFyIGRvYiA9IGZvdW5kRE9CIHx8IG8uZGF0ZU5haXNzYW5jZVBhdGllbnQgfHwgYy5kb2IgfHwgXCJcIjtcbiAgICAgIHZhciBlZmZlY3RpdmVOU1MgPSBnZXRPdXZyYW50RHJvaXROU1MobnNzLCBkb2IsIHBlcnNvbm5lcyk7XG4gICAgICB2YXIgZGlnaXRzID0gZWZmZWN0aXZlTlNTLnJlcGxhY2UoL1xcRC9nLCBcIlwiKS5zbGljZSgwLCAxNSk7XG5cbiAgICAgIHZhciBmaWxsZWQgPSBmYWxzZTtcblxuICAgICAgLyogUGFnZSBoaXN0b3JpcXVlIGRvc3NpZXJzIChmb3JtIG5hbWU9XCJwZWNcIikgOiBudW1Tcywgbm9tQXNzdXJlLCBwcmVub21Bc3N1cmUgKi9cbiAgICAgIHZhciBudW1Tc0VsID0gZmluZEVsZW1lbnQoJ1tuYW1lPVwibnVtU3NcIl0nKTtcbiAgICAgIGlmIChudW1Tc0VsKSB7XG4gICAgICAgIGlmIChkaWdpdHMpIHsgdWx0cmFGaWxsKG51bVNzRWwsIGRpZ2l0cyk7IGZpbGxlZCA9IHRydWU7IH1cbiAgICAgICAgaWYgKG5vbSkgeyB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJ1tuYW1lPVwibm9tQXNzdXJlXCJdJyksIG5vbSk7IGZpbGxlZCA9IHRydWU7IH1cbiAgICAgICAgaWYgKHByZW5vbSkgeyB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJ1tuYW1lPVwicHJlbm9tQXNzdXJlXCJdJyksIGNhcGl0YWxpemUocHJlbm9tKSk7IGZpbGxlZCA9IHRydWU7IH1cbiAgICAgICAgcmV0dXJuIGZpbGxlZDtcbiAgICAgIH1cblxuICAgICAgLyogUGFnZSBiXHUwMEU5blx1MDBFOWZpY2lhaXJlIERQRUMgKGZvcm0gbmFtZT1cInNlYXJjaFwiKSA6IG51bVNlY3UsIGRhdGVOYWlzSmovTW0vQWEsIHJhbmdOYWlzICovXG4gICAgICB2YXIgbnVtU2VjdUVsID0gZmluZEVsZW1lbnQoJ1tuYW1lPVwibnVtU2VjdVwiXScpO1xuICAgICAgaWYgKG51bVNlY3VFbCkge1xuICAgICAgICBpZiAoZGlnaXRzKSB7IHVsdHJhRmlsbChudW1TZWN1RWwsIGRpZ2l0cyk7IGZpbGxlZCA9IHRydWU7IH1cblxuICAgICAgICAvKiBEYXRlIGRlIG5haXNzYW5jZSBcdTAwRTljbGF0XHUwMEU5ZSBlbiBKSiAvIE1NIC8gQUFBQSAqL1xuICAgICAgICBpZiAoZG9iKSB7XG4gICAgICAgICAgdmFyIHBhcnRzID0gZG9iLm1hdGNoKC8oXFxkezJ9KVtcXC9cXC1dKFxcZHsyfSlbXFwvXFwtXShcXGR7NH0pLyk7XG4gICAgICAgICAgaWYgKHBhcnRzKSB7XG4gICAgICAgICAgICB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJ1tuYW1lPVwiZGF0ZU5haXNKalwiXScpLCBwYXJ0c1sxXSk7XG4gICAgICAgICAgICB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJ1tuYW1lPVwiZGF0ZU5haXNNbVwiXScpLCBwYXJ0c1syXSk7XG4gICAgICAgICAgICB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJ1tuYW1lPVwiZGF0ZU5haXNBYVwiXScpLCBwYXJ0c1szXSk7XG4gICAgICAgICAgICBmaWxsZWQgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIFJhbmcgZGUgbmFpc3NhbmNlICovXG4gICAgICAgIHZhciByYW5nID0gYy5yYW5nTmFpc3NhbmNlIHx8IFwiXCI7XG4gICAgICAgIGlmIChyYW5nKSB7XG4gICAgICAgICAgdmFyIHJhbmdFbCA9IGZpbmRFbGVtZW50KCdbbmFtZT1cInJhbmdOYWlzXCJdJyk7XG4gICAgICAgICAgaWYgKHJhbmdFbCkgeyByYW5nRWwudmFsdWUgPSByYW5nOyByYW5nRWwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2NoYW5nZScsIHsgYnViYmxlczogdHJ1ZSB9KSk7IGZpbGxlZCA9IHRydWU7IH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmaWxsZWQ7XG4gICAgICB9XG5cbiAgICAgIC8qIFBhZ2UgZG9zc2llciAvIGluZm9zIGFkbWluaXN0cmF0aXZlcyAoZm9ybSBuYW1lPVwiZG9zc2llclwiKSA6IGRhdGUgcHJlc2NyaXB0aW9uICsgdHlwZSBcdTAwRTlxdWlwZW1lbnQgKi9cbiAgICAgIHZhciBqb3VyUHJlc2NFbCA9IGZpbmRFbGVtZW50KCdbbmFtZT1cImpvdXJQcmVzY3JpcHRpb25cIl0nKTtcbiAgICAgIGlmIChqb3VyUHJlc2NFbCkge1xuICAgICAgICB2YXIgZGF0ZU9yZG8gPSBvLmRhdGVPcmRvbm5hbmNlIHx8IChjLnByZXNjcmlwdGlvbiAmJiBjLnByZXNjcmlwdGlvbi5kYXRlUHJlc2NyaXB0aW9uKSB8fCBcIlwiO1xuICAgICAgICBpZiAoZGF0ZU9yZG8pIHtcbiAgICAgICAgICB2YXIgcGFydHMgPSBkYXRlT3Jkby5tYXRjaCgvKFxcZHsyfSlbXFwvXFwtXShcXGR7Mn0pW1xcL1xcLV0oXFxkezR9KS8pO1xuICAgICAgICAgIGlmIChwYXJ0cykge1xuICAgICAgICAgICAgdWx0cmFGaWxsKGpvdXJQcmVzY0VsLCBwYXJ0c1sxXSk7XG4gICAgICAgICAgICB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJ1tuYW1lPVwibW9pc1ByZXNjcmlwdGlvblwiXScpLCBwYXJ0c1syXSk7XG4gICAgICAgICAgICB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJ1tuYW1lPVwiYW5uZWVQcmVzY3JpcHRpb25cIl0nKSwgcGFydHNbM10pO1xuICAgICAgICAgICAgZmlsbGVkID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiBUeXBlIGQnXHUwMEU5cXVpcGVtZW50IDogTHVuZXR0ZXMgb3UgTGVudGlsbGVzICovXG4gICAgICAgIHZhciBoYXNMZW50aWxsZXMgPSAoby5sZW50aWxsZXNPRCAmJiBvLmxlbnRpbGxlc09ELnNwaGVyZSkgfHwgKG8ubGVudGlsbGVzT0cgJiYgby5sZW50aWxsZXNPRy5zcGhlcmUpO1xuICAgICAgICB2YXIgcmFkaW9zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW25hbWU9XCJFcXVpcGVtZW50XCJdJyk7XG4gICAgICAgIGZvciAodmFyIHJpID0gMDsgcmkgPCByYWRpb3MubGVuZ3RoOyByaSsrKSB7XG4gICAgICAgICAgaWYgKGhhc0xlbnRpbGxlcyAmJiByYWRpb3NbcmldLnZhbHVlID09PSBcIkxlbnRpbGxlc1wiKSB7IHJhZGlvc1tyaV0uY2xpY2soKTsgZmlsbGVkID0gdHJ1ZTsgfVxuICAgICAgICAgIGlmICghaGFzTGVudGlsbGVzICYmIHJhZGlvc1tyaV0udmFsdWUgPT09IFwiTHVuZXR0ZXNcIikgeyByYWRpb3NbcmldLmNsaWNrKCk7IGZpbGxlZCA9IHRydWU7IH1cbiAgICAgICAgfVxuICAgICAgICAvKiBNZXR0cmUgXHUwMEUwIGpvdXIgbGUgaGlkZGVuIHR5cGVFcXVpcGVtZW50ICovXG4gICAgICAgIHZhciB0eXBlRXFFbCA9IGZpbmRFbGVtZW50KCcjdHlwZUVxdWlwZW1lbnQnKTtcbiAgICAgICAgaWYgKHR5cGVFcUVsKSB0eXBlRXFFbC52YWx1ZSA9IGhhc0xlbnRpbGxlcyA/IFwibGVudGlsbGVzXCIgOiBcIkx1bmV0dGVzXCI7XG5cbiAgICAgICAgcmV0dXJuIGZpbGxlZDtcbiAgICAgIH1cblxuICAgICAgLyogUGFnZSBEUEVDIGNvcnJlY3Rpb24gdmlzdWVsbGUgKGZvcm0gbmFtZT1cImRwZWNPcHRcIikgKi9cbiAgICAgIHZhciBkcGVjRm9ybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Zvcm1bbmFtZT1cImRwZWNPcHRcIl0nKTtcbiAgICAgIGlmIChkcGVjRm9ybSkge1xuICAgICAgICAvKiBQcmVzY3JpcHRldXIgKi9cbiAgICAgICAgdmFyIHByZXNjRnVsbE5hbWUgPSAoYy5wcmVzY3JpcHRpb24gJiYgYy5wcmVzY3JpcHRpb24ucHJlc2NyaXB0ZXVyKSB8fCBcIlwiO1xuICAgICAgICBpZiAocHJlc2NGdWxsTmFtZSkge1xuICAgICAgICAgIHZhciBwcmVzY1BhcnRzID0gcHJlc2NGdWxsTmFtZS5zcGxpdCgvXFxzKy8pO1xuICAgICAgICAgIHZhciBwcmVzY05vbSA9IHByZXNjUGFydHMubGVuZ3RoID4gMSA/IHByZXNjUGFydHMuc2xpY2UoMSkuam9pbihcIiBcIikgOiBwcmVzY1BhcnRzWzBdIHx8IFwiXCI7XG4gICAgICAgICAgdmFyIHByZXNjUHJlbm9tID0gcHJlc2NQYXJ0cy5sZW5ndGggPiAxID8gcHJlc2NQYXJ0c1swXSA6IFwiXCI7XG4gICAgICAgICAgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCdbbmFtZT1cIm5vbVByZXNjcmlwdGV1clwiXScpLCBwcmVzY05vbS50b1VwcGVyQ2FzZSgpKTtcbiAgICAgICAgICB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJ1tuYW1lPVwicHJlbm9tUHJlc2NyaXB0ZXVyXCJdJyksIGNhcGl0YWxpemUocHJlc2NQcmVub20pKTtcbiAgICAgICAgICBmaWxsZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogUlBQUyAvIEFERUxJIChjaGFtcCBmaW5lc3NQcmVzY3JpcHRldXIsIG1heGxlbmd0aCA5KSAqL1xuICAgICAgICB2YXIgcnBwcyA9IG8ucnBwcyB8fCAoYy5wcmVzY3JpcHRpb24gJiYgYy5wcmVzY3JpcHRpb24ucnBwcykgfHwgXCJcIjtcbiAgICAgICAgaWYgKHJwcHMpIHtcbiAgICAgICAgICB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJ1tuYW1lPVwiZmluZXNzUHJlc2NyaXB0ZXVyXCJdJyksIHJwcHMucmVwbGFjZSgvXFxEL2csIFwiXCIpLnNsaWNlKDAsIDkpKTtcbiAgICAgICAgICBmaWxsZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogVHlwZSBkZSBwcmVzY3JpcHRpb24gOiBwcmVtaVx1MDBFOHJlIGRcdTAwRTlsaXZyYW5jZSBwYXIgZFx1MDBFOWZhdXQgKi9cbiAgICAgICAgdmFyIGZpcnN0UmFkaW8gPSBmaW5kRWxlbWVudCgnW25hbWU9XCJwcmVzY3JpcHRpb25TZWxlY3Rpb25cIl1bdmFsdWU9XCJmaXJzdFwiXScpO1xuICAgICAgICBpZiAoZmlyc3RSYWRpbyAmJiAhZmlyc3RSYWRpby5jaGVja2VkKSB7XG4gICAgICAgICAgZmlyc3RSYWRpby5jbGljaygpO1xuICAgICAgICAgIGZpbGxlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBUaWVycyBwYXlhbnQgUk8gOiBjb2NoZXIgT1VJIHBhciBkXHUwMEU5ZmF1dCAqL1xuICAgICAgICB2YXIgdHBPdWlSYWRpbyA9IGZpbmRFbGVtZW50KCdbbmFtZT1cIm9wdFRQUmVnaW1lT2JsaWdhdG9pcmVcIl1bdmFsdWU9XCJPVUlcIl0nKTtcbiAgICAgICAgaWYgKHRwT3VpUmFkaW8gJiYgIXRwT3VpUmFkaW8uY2hlY2tlZCkge1xuICAgICAgICAgIHRwT3VpUmFkaW8uY2xpY2soKTtcbiAgICAgICAgICBmaWxsZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogQ29udGFjdCA6IHRcdTAwRTlsXHUwMEU5cGhvbmUsIGVtYWlsICovXG4gICAgICAgIHZhciBwaG9uZVZhbCA9IG5vcm1hbGl6ZVBob25lKGMucGhvbmUgfHwgXCJcIik7XG4gICAgICAgIGlmIChwaG9uZVZhbCkgeyB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJ1tuYW1lPVwiZGV2aXNUZWxlcGhvbmVcIl0nKSwgcGhvbmVWYWwpOyBmaWxsZWQgPSB0cnVlOyB9XG4gICAgICAgIHZhciBlbWFpbFZhbCA9IGMuZW1haWwgfHwgXCJcIjtcbiAgICAgICAgaWYgKGVtYWlsVmFsKSB7XG4gICAgICAgICAgLyogQWN0aXZlciBsYSBzZWN0aW9uIGVtYWlsIChyYWRpbyBtYWlscGVyc29ubmVsID0gT1VJKSBzaSBlbGxlIGVzdCBjYWNoXHUwMEU5ZSAqL1xuICAgICAgICAgIHZhciBtYWlsT3VpUmFkaW8gPSBmaW5kRWxlbWVudCgnI21haWxwZXJzb25uZWwnKTtcbiAgICAgICAgICBpZiAobWFpbE91aVJhZGlvICYmICFtYWlsT3VpUmFkaW8uY2hlY2tlZCkge1xuICAgICAgICAgICAgbWFpbE91aVJhZGlvLmNsaWNrKCk7XG4gICAgICAgICAgICAvKiBBcHBlbGVyIGxhIGZvbmN0aW9uIE94YW50aXMgcG91ciByZW5kcmUgdmlzaWJsZSBsZSBkaXYgZW1haWwgKi9cbiAgICAgICAgICAgIGlmICh0eXBlb2YgYWZmaWNoZXJtYWlscGVyc29ubmVsID09PSAnZnVuY3Rpb24nKSBhZmZpY2hlcm1haWxwZXJzb25uZWwoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCdbbmFtZT1cImRldmlzRW1haWxcIl0nKSwgZW1haWxWYWwpO1xuICAgICAgICAgIHVsdHJhRmlsbChmaW5kRWxlbWVudCgnW25hbWU9XCJkZXZpc0VtYWlsQ29uZmlybWF0aW9uXCJdJyksIGVtYWlsVmFsKTtcbiAgICAgICAgICBmaWxsZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogQ29ycmVjdGlvbiBPRCAvIE9HICovXG4gICAgICAgIHZhciBvZCA9IChvLmx1bmV0dGVzT0QpIHx8IChjLnByZXNjcmlwdGlvbiAmJiBjLnByZXNjcmlwdGlvbi5vZCkgfHwge307XG4gICAgICAgIHZhciBvZyA9IChvLmx1bmV0dGVzT0cpIHx8IChjLnByZXNjcmlwdGlvbiAmJiBjLnByZXNjcmlwdGlvbi5vZykgfHwge307XG5cbiAgICAgICAgLyogRFx1MDBFOXRlcm1pbmVyIGxlIHR5cGUgZGUgdmlzaW9uIDogc2kgYWRkaXRpb24gPiAwIFx1MjE5MiBwcm9ncmVzc2lmcyAoNCksIHNpbm9uIGxvaW4gKDEpICovXG4gICAgICAgIHZhciBhZGRPRCA9IHBhcnNlRmxvYXQob2QuYWRkaXRpb24pIHx8IDA7XG4gICAgICAgIHZhciBhZGRPRyA9IHBhcnNlRmxvYXQob2cuYWRkaXRpb24pIHx8IDA7XG4gICAgICAgIHZhciB2aXNpb25WYWwgPSAoYWRkT0QgPiAwIHx8IGFkZE9HID4gMCkgPyBcIjRcIiA6IFwiMVwiO1xuXG4gICAgICAgIHZhciB2aXNpb25PREVsID0gZmluZEVsZW1lbnQoJ1tuYW1lPVwidmlzaW9uVHlwZU9EXCJdJyk7XG4gICAgICAgIGlmICh2aXNpb25PREVsKSB7XG4gICAgICAgICAgdmlzaW9uT0RFbC52YWx1ZSA9IHZpc2lvblZhbDtcbiAgICAgICAgICB2aXNpb25PREVsLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjaGFuZ2UnLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgICAgICAgIGZpbGxlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHZpc2lvbk9HRWwgPSBmaW5kRWxlbWVudCgnW25hbWU9XCJ2aXNpb25UeXBlT0dcIl0nKTtcbiAgICAgICAgaWYgKHZpc2lvbk9HRWwpIHtcbiAgICAgICAgICB2aXNpb25PR0VsLnZhbHVlID0gdmlzaW9uVmFsO1xuICAgICAgICAgIHZpc2lvbk9HRWwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2NoYW5nZScsIHsgYnViYmxlczogdHJ1ZSB9KSk7XG4gICAgICAgICAgZmlsbGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIEFjdGl2ZXIgbGVzIGNoYW1wcyBkZSBjb3JyZWN0aW9uIChkaXNhYmxlZCBwYXIgZFx1MDBFOWZhdXQpIHB1aXMgcmVtcGxpciAqL1xuICAgICAgICB2YXIgY29yckZpZWxkcyA9IFtcbiAgICAgICAgICBbJ3Zpc2lvbnNbMF0ubG9kU3BoZXJlJywgb2Quc3BoZXJlXSxcbiAgICAgICAgICBbJ3Zpc2lvbnNbMF0ubG9kQ3lsaW5kcmUnLCBvZC5jeWxpbmRyZV0sXG4gICAgICAgICAgWyd2aXNpb25zWzBdLmF4ZU9kJywgb2QuYXhlXSxcbiAgICAgICAgICBbJ3Zpc2lvbnNbMF0ubG9kQWRkaXRpb24nLCBvZC5hZGRpdGlvbl0sXG4gICAgICAgICAgWyd2aXNpb25zWzBdLmxvZ1NwaGVyZScsIG9nLnNwaGVyZV0sXG4gICAgICAgICAgWyd2aXNpb25zWzBdLmxvZ0N5bGluZHJlJywgb2cuY3lsaW5kcmVdLFxuICAgICAgICAgIFsndmlzaW9uc1swXS5heGVPZycsIG9nLmF4ZV0sXG4gICAgICAgICAgWyd2aXNpb25zWzBdLmxvZ0FkZGl0aW9uJywgb2cuYWRkaXRpb25dXG4gICAgICAgIF07XG4gICAgICAgIGZvciAodmFyIGNpID0gMDsgY2kgPCBjb3JyRmllbGRzLmxlbmd0aDsgY2krKykge1xuICAgICAgICAgIHZhciBmaWVsZE5hbWUgPSBjb3JyRmllbGRzW2NpXVswXTtcbiAgICAgICAgICB2YXIgZmllbGRWYWwgPSBjb3JyRmllbGRzW2NpXVsxXTtcbiAgICAgICAgICBpZiAoIWZpZWxkVmFsKSBjb250aW51ZTtcbiAgICAgICAgICB2YXIgZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbbmFtZT1cIicgKyBmaWVsZE5hbWUgKyAnXCJdJyk7XG4gICAgICAgICAgaWYgKGVsKSB7XG4gICAgICAgICAgICBpZiAoZWwuZGlzYWJsZWQpIGVsLmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgICAgICB1bHRyYUZpbGwoZWwsIGZpZWxkVmFsKTtcbiAgICAgICAgICAgIGZpbGxlZCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZpbGxlZDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG4gICAgc3luY2hyb25pc2VyOiBhc3luYyAoKSA9PiBmYWxzZVxuICB9XG59O1xuIiwgImltcG9ydCBnZW5lcmF0aW9uIGZyb20gXCIuL2dlbmVyYXRpb24uanNcIjtcbmltcG9ydCBsaXZlYnlvcHRpbXVtIGZyb20gXCIuL2xpdmVieW9wdGltdW0uanNcIjtcbmltcG9ydCB3ZW1pbmQgZnJvbSBcIi4vd2VtaW5kLmpzXCI7XG5pbXBvcnQgYXBnaXMgZnJvbSBcIi4vYXBnaXMuanNcIjtcbmltcG9ydCBhY3RpbCBmcm9tIFwiLi9hY3RpbC5qc1wiO1xuaW1wb3J0IG1lcmNlciBmcm9tIFwiLi9tZXJjZXIuanNcIjtcbmltcG9ydCB0cFBsdXMgZnJvbSBcIi4vdHAtcGx1cy5qc1wiO1xuaW1wb3J0IGZmbFByb21vdGV1ciBmcm9tIFwiLi9mZmwtcHJvbW90ZXVyLmpzXCI7XG5pbXBvcnQgc29saW11dCBmcm9tIFwiLi9zb2xpbXV0LmpzXCI7XG5pbXBvcnQgYW1lbGkgZnJvbSBcIi4vYW1lbGkuanNcIjtcbmltcG9ydCBhbG1lcnlzIGZyb20gXCIuL2FsbWVyeXMuanNcIjtcbmltcG9ydCBveGFudGlzIGZyb20gXCIuL294YW50aXMuanNcIjtcblxuZXhwb3J0IGNvbnN0IENPTkZJR1MgPSB7XG4gIFwiZ2VuZXJhdGlvbi5mclwiOiBnZW5lcmF0aW9uLFxuICBcImxpdmVieW9wdGltdW0uY29tXCI6IGxpdmVieW9wdGltdW0sXG4gIFwicHJvLndlbWluZC5pb1wiOiB3ZW1pbmQsXG4gIFwiZXNwYWNlcHJvZmVzc2lvbm5lbC5hcGdpcy5jb21cIjogYXBnaXMsXG4gIFwid3d3LmFjdGlsLmNvbVwiOiBhY3RpbCxcbiAgXCJtZXJjZXJcIjogbWVyY2VyLFxuICBcInRwLXBsdXNcIjogdHBQbHVzLFxuICBcImZmbC1wcm9tb3RldXIuY29tXCI6IGZmbFByb21vdGV1cixcbiAgXCJzb2xpbXV0LmZyXCI6IHNvbGltdXQsXG4gIFwiYW1lbGkuZnJcIjogYW1lbGksXG4gIFwibXV0dWVsbGUtYWxtZXJ5cy5jb21cIjogYWxtZXJ5cyxcbiAgXCJveGFudGlzXCI6IG94YW50aXMsXG59O1xuIiwgIi8qIFx1MjUwMFx1MjUwMCBSZW1vdGUgU2VsZWN0b3IgT3ZlcnJpZGVzIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuLyogQ2hhcmdlIGxlcyBvdmVycmlkZXMgZGUgc2VsZWN0ZXVycyBkZXB1aXMgY2hyb21lLnN0b3JhZ2UubG9jYWwgICAgICAgICAgICAgICovXG4vKiAoYWxpbWVudGUgcGFyIGxlIGJhY2tncm91bmQgdG91dGVzIGxlcyAzMCBtaW4gdmlhIC9hcGkvZXh0ZW5zaW9uL3NlbGVjdG9ycykgKi9cblxudmFyIF9yZW1vdGVPdmVycmlkZXMgPSBudWxsO1xudmFyIF9yZW1vdGVPdmVycmlkZXNMb2FkZWQgPSBmYWxzZTtcblxuLyoqXG4gKiBDaGFyZ2UgbGVzIG92ZXJyaWRlcyBkZXB1aXMgbGUgc3RvcmFnZSBsb2NhbC5cbiAqIEFwcGVsZSB1bmUgc2V1bGUgZm9pcyBhdSBkZW1hcnJhZ2UgZHUgY29udGVudCBzY3JpcHQuXG4gKi9cbmZ1bmN0aW9uIGxvYWRSZW1vdGVTZWxlY3RvcnMoY2FsbGJhY2spIHtcbiAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFtcIm9wdGlib3Rfc2VsZWN0b3Jfb3ZlcnJpZGVzXCJdLCBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICB2YXIgZGF0YSA9IHJlc3VsdC5vcHRpYm90X3NlbGVjdG9yX292ZXJyaWRlcztcbiAgICBpZiAoZGF0YSAmJiBkYXRhLm92ZXJyaWRlcykge1xuICAgICAgX3JlbW90ZU92ZXJyaWRlcyA9IGRhdGEub3ZlcnJpZGVzO1xuICAgIH0gZWxzZSB7XG4gICAgICBfcmVtb3RlT3ZlcnJpZGVzID0ge307XG4gICAgfVxuICAgIF9yZW1vdGVPdmVycmlkZXNMb2FkZWQgPSB0cnVlO1xuICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09IFwiZnVuY3Rpb25cIikgY2FsbGJhY2soKTtcbiAgfSk7XG59XG5cbi8qKlxuICogUmV0b3VybmUgbGUgc2VsZWN0ZXVyIG92ZXJyaWRlIHBvdXIgdW4gcG9ydGFpbC9jaGFtcCBkb25uZSxcbiAqIG91IGxlIGZhbGxiYWNrIGhhcmRjb2RlIHNpIGF1Y3VuIG92ZXJyaWRlIG4nZXhpc3RlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwb3J0YWwgICAgIC0gY2xlIGR1IHBvcnRhaWwgKGV4OiBcIm11dHVlbGxlLWFsbWVyeXMuY29tXCIpXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAgICAgICAtIG5vbSBsb2dpcXVlIGR1IHNlbGVjdGV1ciAoZXg6IFwibm9tX2JlbmVmaWNpYWlyZVwiKVxuICogQHBhcmFtIHtzdHJpbmd9IGZhbGxiYWNrICAgLSBzZWxlY3RldXIgQ1NTIGhhcmRjb2RlIHBhciBkZWZhdXRcbiAqIEByZXR1cm5zIHtzdHJpbmd9IGxlIHNlbGVjdGV1ciBDU1MgYSB1dGlsaXNlclxuICovXG5mdW5jdGlvbiBnZXRPdmVycmlkZShwb3J0YWwsIG5hbWUsIGZhbGxiYWNrKSB7XG4gIGlmICghX3JlbW90ZU92ZXJyaWRlc0xvYWRlZCB8fCAhX3JlbW90ZU92ZXJyaWRlcykgcmV0dXJuIGZhbGxiYWNrO1xuICB2YXIgcG9ydGFsT3ZlcnJpZGVzID0gX3JlbW90ZU92ZXJyaWRlc1twb3J0YWxdO1xuICBpZiAoIXBvcnRhbE92ZXJyaWRlcykgcmV0dXJuIGZhbGxiYWNrO1xuICB2YXIgb3ZlcnJpZGUgPSBwb3J0YWxPdmVycmlkZXNbbmFtZV07XG4gIHJldHVybiAob3ZlcnJpZGUgJiYgdHlwZW9mIG92ZXJyaWRlID09PSBcInN0cmluZ1wiKSA/IG92ZXJyaWRlIDogZmFsbGJhY2s7XG59XG5cbi8qKlxuICogVmFyaWFudGUgZGUgZmluZEVsZW1lbnQgcXVpIHV0aWxpc2UgbGVzIG92ZXJyaWRlcy5cbiAqIEVzc2FpZSBkJ2Fib3JkIGwnb3ZlcnJpZGUsIHB1aXMgbGUgZmFsbGJhY2sgc2kgbCdvdmVycmlkZSBlY2hvdWUuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBvcnRhbCAgICAgLSBjbGUgZHUgcG9ydGFpbFxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgICAgICAgLSBub20gbG9naXF1ZSBkdSBzZWxlY3RldXJcbiAqIEBwYXJhbSB7c3RyaW5nfSBmYWxsYmFjayAgIC0gc2VsZWN0ZXVyIENTUyBoYXJkY29kZVxuICogQHJldHVybnMge0VsZW1lbnR8bnVsbH1cbiAqL1xuZnVuY3Rpb24gZmluZEVsZW1lbnRXaXRoT3ZlcnJpZGUocG9ydGFsLCBuYW1lLCBmYWxsYmFjaykge1xuICB2YXIgb3ZlcnJpZGVTZWxlY3RvciA9IGdldE92ZXJyaWRlKHBvcnRhbCwgbmFtZSwgbnVsbCk7XG4gIGlmIChvdmVycmlkZVNlbGVjdG9yICYmIG92ZXJyaWRlU2VsZWN0b3IgIT09IGZhbGxiYWNrKSB7XG4gICAgdmFyIGVsID0gZmluZEVsZW1lbnQob3ZlcnJpZGVTZWxlY3Rvcik7XG4gICAgaWYgKGVsKSByZXR1cm4gZWw7XG4gICAgLyogT3ZlcnJpZGUgbidhIHBhcyBtYXJjaGUsIGVzc2F5ZXIgbGUgZmFsbGJhY2sgKi9cbiAgfVxuICByZXR1cm4gZmluZEVsZW1lbnQoZmFsbGJhY2spO1xufVxuXG4vKiBFeHBvc2UgcG91ciBsJ2ltcG9ydCBkZXB1aXMgY29udGVudC9pbmRleC5qcyAqL1xuZ2xvYmFsVGhpcy5sb2FkUmVtb3RlU2VsZWN0b3JzID0gbG9hZFJlbW90ZVNlbGVjdG9ycztcbmdsb2JhbFRoaXMuZ2V0T3ZlcnJpZGUgPSBnZXRPdmVycmlkZTtcbmdsb2JhbFRoaXMuZmluZEVsZW1lbnRXaXRoT3ZlcnJpZGUgPSBmaW5kRWxlbWVudFdpdGhPdmVycmlkZTtcbiIsICIvKiBcdTI1MDBcdTI1MDAgVVMtOCA6IEZlZWRiYWNrIExvb3AgXHUyMDE0IFNpZ25hbGVtZW50IGRlIGNoYW1wIG1hbCByZW1wbGkgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG4vKiBDbGljIGRyb2l0IHN1ciB1biBjaGFtcCBcdTIxOTIgXCJTaWduYWxlciBjZSBjaGFtcFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4vKiBFbnZvaWUgc1x1MDBFOWxlY3RldXIgRE9NICsgVVJMIHBvcnRhaWwgYXUgc2VydmV1ciAoYW5vbnltaXNcdTAwRTksIHNhbnMgZG9ublx1MDBFOWUgcGF0aWVudCkgKi9cblxudmFyIF9mZWVkYmFja01lbnVFbCA9IG51bGw7XG52YXIgX2ZlZWRiYWNrVGFyZ2V0RWwgPSBudWxsO1xuXG5mdW5jdGlvbiBpbml0RmllbGRGZWVkYmFjaygpIHtcbiAgLyogSW5qZWN0ZXIgbGUgbWVudSBjb250ZXh0dWVsIGN1c3RvbSAqL1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgdGFyZ2V0ID0gZS50YXJnZXQ7XG4gICAgaWYgKCF0YXJnZXQpIHJldHVybjtcblxuICAgIC8qIFZcdTAwRTlyaWZpZXIgc2kgYydlc3QgdW4gaW5wdXQvc2VsZWN0L3RleHRhcmVhIHBvdGVudGllbGxlbWVudCByZW1wbGkgcGFyIE9wdGlCb3QgKi9cbiAgICB2YXIgaXNGb3JtRmllbGQgPSB0YXJnZXQubWF0Y2hlcygnaW5wdXQsIHNlbGVjdCwgdGV4dGFyZWEsIFtjb250ZW50ZWRpdGFibGU9XCJ0cnVlXCJdJyk7XG4gICAgaWYgKCFpc0Zvcm1GaWVsZCkgcmV0dXJuO1xuXG4gICAgLyogQWZmaWNoZXIgbm90cmUgbWVudSBhcHJcdTAwRThzIGxlIG1lbnUgY29udGV4dHVlbCBuYXRpZiAqL1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IHNob3dGZWVkYmFja01lbnUoZS5jbGllbnRYLCBlLmNsaWVudFksIHRhcmdldCk7IH0sIDEwMCk7XG4gIH0pO1xuXG4gIC8qIEZlcm1lciBsZSBtZW51IHNpIGNsaWMgYWlsbGV1cnMgKi9cbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgaWYgKF9mZWVkYmFja01lbnVFbCAmJiAhX2ZlZWRiYWNrTWVudUVsLmNvbnRhaW5zKGUudGFyZ2V0KSkge1xuICAgICAgaGlkZUZlZWRiYWNrTWVudSgpO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHNob3dGZWVkYmFja01lbnUoeCwgeSwgdGFyZ2V0RWwpIHtcbiAgaGlkZUZlZWRiYWNrTWVudSgpO1xuICBfZmVlZGJhY2tUYXJnZXRFbCA9IHRhcmdldEVsO1xuXG4gIHZhciBtZW51ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIG1lbnUuaWQgPSAnb3B0aWJvdC1mZWVkYmFjay1tZW51JztcbiAgbWVudS5zdHlsZS5jc3NUZXh0ID0gW1xuICAgICdwb3NpdGlvbjpmaXhlZCcsXG4gICAgJ3otaW5kZXg6MjE0NzQ4MzY0NycsXG4gICAgJ2JhY2tncm91bmQ6IzFlMjkzYicsXG4gICAgJ2NvbG9yOndoaXRlJyxcbiAgICAnYm9yZGVyLXJhZGl1czo4cHgnLFxuICAgICdib3gtc2hhZG93OjAgNHB4IDE2cHggcmdiYSgwLDAsMCwwLjMpJyxcbiAgICAncGFkZGluZzo0cHgnLFxuICAgICdtaW4td2lkdGg6MjAwcHgnLFxuICAgICdmb250LWZhbWlseTpzeXN0ZW0tdWksc2Fucy1zZXJpZicsXG4gICAgJ2ZvbnQtc2l6ZToxM3B4JyxcbiAgICAnbGVmdDonICsgTWF0aC5taW4oeCwgd2luZG93LmlubmVyV2lkdGggLSAyMjApICsgJ3B4JyxcbiAgICAndG9wOicgKyBNYXRoLm1pbih5LCB3aW5kb3cuaW5uZXJIZWlnaHQgLSA4MCkgKyAncHgnXG4gIF0uam9pbignOycpO1xuXG4gIHZhciBidG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgYnRuLnN0eWxlLmNzc1RleHQgPSAnZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4O3dpZHRoOjEwMCU7cGFkZGluZzo4cHggMTJweDtiYWNrZ3JvdW5kOm5vbmU7Ym9yZGVyOm5vbmU7Y29sb3I6d2hpdGU7Y3Vyc29yOnBvaW50ZXI7Ym9yZGVyLXJhZGl1czo2cHg7dGV4dC1hbGlnbjpsZWZ0Oyc7XG4gIGJ0bi5pbm5lckhUTUwgPSAnPHNwYW4gc3R5bGU9XCJmb250LXNpemU6MTZweFwiPlx1RDgzRFx1REMxQjwvc3Bhbj48c3Bhbj5TaWduYWxlciBjZSBjaGFtcCBcdTAwRTAgT3B0aUJvdDwvc3Bhbj4nO1xuICBidG4uYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIGZ1bmN0aW9uKCkgeyBidG4uc3R5bGUuYmFja2dyb3VuZCA9ICcjMzM0MTU1JzsgfSk7XG4gIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgZnVuY3Rpb24oKSB7IGJ0bi5zdHlsZS5iYWNrZ3JvdW5kID0gJ25vbmUnOyB9KTtcbiAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgc2VuZEZpZWxkRmVlZGJhY2sodGFyZ2V0RWwpO1xuICAgIGhpZGVGZWVkYmFja01lbnUoKTtcbiAgfSk7XG5cbiAgbWVudS5hcHBlbmRDaGlsZChidG4pO1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG1lbnUpO1xuICBfZmVlZGJhY2tNZW51RWwgPSBtZW51O1xufVxuXG5mdW5jdGlvbiBoaWRlRmVlZGJhY2tNZW51KCkge1xuICBpZiAoX2ZlZWRiYWNrTWVudUVsKSB7XG4gICAgX2ZlZWRiYWNrTWVudUVsLnJlbW92ZSgpO1xuICAgIF9mZWVkYmFja01lbnVFbCA9IG51bGw7XG4gIH1cbiAgX2ZlZWRiYWNrVGFyZ2V0RWwgPSBudWxsO1xufVxuXG5mdW5jdGlvbiBidWlsZFNlbGVjdG9yKGVsKSB7XG4gIC8qIENvbnN0cnVpcmUgdW4gc1x1MDBFOWxlY3RldXIgQ1NTIHN0YWJsZSBwb3VyIGxlIGNoYW1wICovXG4gIGlmIChlbC5pZCkgcmV0dXJuICcjJyArIGVsLmlkO1xuICBpZiAoZWwubmFtZSkgcmV0dXJuIGVsLnRhZ05hbWUudG9Mb3dlckNhc2UoKSArICdbbmFtZT1cIicgKyBlbC5uYW1lICsgJ1wiXSc7XG4gIGlmIChlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZmllbGQnKSkgcmV0dXJuICdbZGF0YS1maWVsZD1cIicgKyBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZmllbGQnKSArICdcIl0nO1xuICBpZiAoZWwuY2xhc3NOYW1lKSB7XG4gICAgdmFyIGNsYXNzZXMgPSBBcnJheS5mcm9tKGVsLmNsYXNzTGlzdCkuc2xpY2UoMCwgMikuam9pbignLicpO1xuICAgIGlmIChjbGFzc2VzKSByZXR1cm4gZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpICsgJy4nICsgY2xhc3NlcztcbiAgfVxuICAvKiBGYWxsYmFjayA6IHBvc2l0aW9uIGRhbnMgbGUgRE9NICovXG4gIHZhciBwYXJlbnQgPSBlbC5wYXJlbnRFbGVtZW50O1xuICBpZiAocGFyZW50KSB7XG4gICAgdmFyIHNpYmxpbmdzID0gQXJyYXkuZnJvbShwYXJlbnQuY2hpbGRyZW4pO1xuICAgIHZhciBpZHggPSBzaWJsaW5ncy5pbmRleE9mKGVsKSArIDE7XG4gICAgcmV0dXJuIGVsLnRhZ05hbWUudG9Mb3dlckNhc2UoKSArICc6bnRoLWNoaWxkKCcgKyBpZHggKyAnKSc7XG4gIH1cbiAgcmV0dXJuIGVsLnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcbn1cblxuZnVuY3Rpb24gaW5mZXJGaWVsZFR5cGUoZWwpIHtcbiAgLyogRGV2aW5lciBsZSB0eXBlIGRlIGNoYW1wIGF0dGVuZHUgKi9cbiAgdmFyIGhpbnRzID0gW1xuICAgIGVsLmlkLCBlbC5uYW1lLCBlbC5wbGFjZWhvbGRlcixcbiAgICBlbC5nZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnKSwgZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWZpZWxkJylcbiAgXS5maWx0ZXIoQm9vbGVhbikuam9pbignICcpLnRvTG93ZXJDYXNlKCk7XG5cbiAgaWYgKC9ub218bGFzdG5hbWV8ZmFtaWx5L2kudGVzdChoaW50cykpIHJldHVybiAnbm9tJztcbiAgaWYgKC9wcmVub218Zmlyc3RuYW1lL2kudGVzdChoaW50cykpIHJldHVybiAncHJlbm9tJztcbiAgaWYgKC9uc3N8c2VjdXxpbnNlZS9pLnRlc3QoaGludHMpKSByZXR1cm4gJ25zcyc7XG4gIGlmICgvZGF0ZXxuYWlzc2FuY2V8YmlydGgvaS50ZXN0KGhpbnRzKSkgcmV0dXJuICdkYXRlJztcbiAgaWYgKC9tdXR1ZWxsZXxyZWdpbWV8cmMxL2kudGVzdChoaW50cykpIHJldHVybiAnbXV0dWVsbGUnO1xuICBpZiAoL3NwaFtlXHUwMEU4XXJlfHNwaGVyZS9pLnRlc3QoaGludHMpKSByZXR1cm4gJ3NwaGVyZSc7XG4gIGlmICgvY3lsaW5kcmV8Y3lsL2kudGVzdChoaW50cykpIHJldHVybiAnY3lsaW5kcmUnO1xuICBpZiAoL2F4ZS9pLnRlc3QoaGludHMpKSByZXR1cm4gJ2F4ZSc7XG4gIHJldHVybiAndW5rbm93bic7XG59XG5cbmZ1bmN0aW9uIHNlbmRGaWVsZEZlZWRiYWNrKGVsKSB7XG4gIHZhciBzZWxlY3RvciA9IGJ1aWxkU2VsZWN0b3IoZWwpO1xuICB2YXIgZmllbGRUeXBlID0gaW5mZXJGaWVsZFR5cGUoZWwpO1xuICB2YXIgcG9ydGFsSG9zdG5hbWUgPSB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUucmVwbGFjZSgvXnd3d1xcLi8sICcnKTtcbiAgdmFyIHBvcnRhbFVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNwbGl0KCc/JylbMF07IC8qIHNhbnMgcXVlcnkgcGFyYW1zIFx1MjAxNCBhbm9ueW1pc1x1MDBFOSAqL1xuXG4gIHZhciBwYXlsb2FkID0ge1xuICAgIHNlbGVjdG9yOiBzZWxlY3RvcixcbiAgICBmaWVsZFR5cGU6IGZpZWxkVHlwZSxcbiAgICBwb3J0YWw6IHBvcnRhbEhvc3RuYW1lLFxuICAgIHVybDogcG9ydGFsVXJsLFxuICAgIHRzOiBEYXRlLm5vdygpXG4gIH07XG5cbiAgLyogVG9hc3QgZGUgY29uZmlybWF0aW9uIGltbVx1MDBFOWRpYXRlICovXG4gIHNob3dGZWVkYmFja1RvYXN0KCdcdTIzRjMgU2lnbmFsZW1lbnQgZW52b3lcdTAwRTkgXHUwMEUwIE9wdGlCb3RcdTIwMjYnKTtcblxuICAvKiBFbnZveWVyIHZpYSBiYWNrZ3JvdW5kIChcdTAwRTl2aXRlIGxlcyByZXN0cmljdGlvbnMgQ09SUyBkdSBjb250ZW50IHNjcmlwdCkgKi9cbiAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgIHR5cGU6ICdPUFRJQk9UX0ZJRUxEX0ZFRURCQUNLJyxcbiAgICBwYXlsb2FkOiBwYXlsb2FkXG4gIH0sIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgaWYgKHJlc3BvbnNlICYmIHJlc3BvbnNlLm9rKSB7XG4gICAgICBzaG93RmVlZGJhY2tUb2FzdCgnXHVEODNEXHVERTRGIE1lcmNpLCBvbiBhbVx1MDBFOWxpb3JlIFx1MDBFN2EgIScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzaG93RmVlZGJhY2tUb2FzdCgnXHUyNkEwXHVGRTBGIEVudm9pIFx1MDBFOWNob3VcdTAwRTkgXHUyMDE0IHJcdTAwRTllc3NhaWUgcGx1cyB0YXJkJyk7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gc2hvd0ZlZWRiYWNrVG9hc3QobWVzc2FnZSkge1xuICB2YXIgZXhpc3RpbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb3B0aWJvdC1mZWVkYmFjay10b2FzdCcpO1xuICBpZiAoZXhpc3RpbmcpIGV4aXN0aW5nLnJlbW92ZSgpO1xuXG4gIHZhciB0b2FzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICB0b2FzdC5pZCA9ICdvcHRpYm90LWZlZWRiYWNrLXRvYXN0JztcbiAgdG9hc3Quc3R5bGUuY3NzVGV4dCA9IFtcbiAgICAncG9zaXRpb246Zml4ZWQnLFxuICAgICdib3R0b206MjRweCcsXG4gICAgJ3JpZ2h0OjI0cHgnLFxuICAgICd6LWluZGV4OjIxNDc0ODM2NDcnLFxuICAgICdiYWNrZ3JvdW5kOiMxZTI5M2InLFxuICAgICdjb2xvcjp3aGl0ZScsXG4gICAgJ3BhZGRpbmc6MTBweCAxNnB4JyxcbiAgICAnYm9yZGVyLXJhZGl1czoxMHB4JyxcbiAgICAnZm9udC1mYW1pbHk6c3lzdGVtLXVpLHNhbnMtc2VyaWYnLFxuICAgICdmb250LXNpemU6MTNweCcsXG4gICAgJ2ZvbnQtd2VpZ2h0OjYwMCcsXG4gICAgJ2JveC1zaGFkb3c6MCA0cHggMTZweCByZ2JhKDAsMCwwLDAuMjUpJyxcbiAgICAndHJhbnNpdGlvbjpvcGFjaXR5IDAuM3MnXG4gIF0uam9pbignOycpO1xuICB0b2FzdC50ZXh0Q29udGVudCA9IG1lc3NhZ2U7XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodG9hc3QpO1xuXG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgdG9hc3Quc3R5bGUub3BhY2l0eSA9ICcwJztcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyB0b2FzdC5yZW1vdmUoKTsgfSwgMzAwKTtcbiAgfSwgMzAwMCk7XG59XG5cbi8qIEV4cG9zZSAqL1xuZ2xvYmFsVGhpcy5pbml0RmllbGRGZWVkYmFjayA9IGluaXRGaWVsZEZlZWRiYWNrO1xuIiwgIi8qIFx1MjUwMFx1MjUwMCBTZWxlY3RvciBIZWFsdGggVGVsZW1ldHJ5IFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuLyogRW52b2llIGRlcyBwaW5ncyBkZSBzYW50ZSBhbm9ueW1pc2VzIGxvcnNxdSd1biBzZWxlY3RldXIgbidlc3QgcGFzIHRyb3V2ZSAgKi9cbi8qIHN1ciB1biBwb3J0YWlsIGNvbm51LiBMZXMgcGluZ3Mgc29udCBiYXRjaGVzIGV0IGVudm95ZXMgdG91dGVzIGxlcyAxMHMuICAgICovXG5cbnZhciBfaGVhbHRoUGluZ1F1ZXVlID0gW107XG52YXIgX2hlYWx0aEZsdXNoVGltZXIgPSBudWxsO1xudmFyIEhFQUxUSF9GTFVTSF9JTlRFUlZBTF9NUyA9IDEwMDAwO1xudmFyIEhFQUxUSF9NQVhfQkFUQ0ggPSAyMDtcblxuLyoqXG4gKiBFbnJlZ2lzdHJlIHVuIHBpbmcgZGUgc2FudGUgcG91ciB1biBzZWxlY3RldXIuXG4gKiBMZXMgcGluZ3Mgc29udCBhY2N1bXVsZXMgcHVpcyBlbnZveWVzIGVuIGJhdGNoLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwb3J0YWwgICAgICAgLSBjbGUgZHUgcG9ydGFpbCAoZXg6IFwibXV0dWVsbGUtYWxtZXJ5cy5jb21cIilcbiAqIEBwYXJhbSB7c3RyaW5nfSBzZWxlY3Rvck5hbWUgLSBub20gbG9naXF1ZSBkdSBzZWxlY3RldXIgKGV4OiBcIm5vbV9iZW5lZmljaWFpcmVcIilcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZm91bmQgICAgICAgLSB0cnVlIHNpIGwnZWxlbWVudCBhIGV0ZSB0cm91dmUsIGZhbHNlIHNpbm9uXG4gKi9cbmZ1bmN0aW9uIHJlcG9ydFNlbGVjdG9ySGVhbHRoKHBvcnRhbCwgc2VsZWN0b3JOYW1lLCBmb3VuZCkge1xuICBfaGVhbHRoUGluZ1F1ZXVlLnB1c2goe1xuICAgIHBvcnRhbDogcG9ydGFsLFxuICAgIHNlbGVjdG9yTmFtZTogc2VsZWN0b3JOYW1lLFxuICAgIGZvdW5kOiBmb3VuZCxcbiAgfSk7XG5cbiAgLyogRGVtYXJyZXIgbGUgdGltZXIgZGUgZmx1c2ggc2kgcGFzIGRlamEgZW4gY291cnMgKi9cbiAgaWYgKCFfaGVhbHRoRmx1c2hUaW1lcikge1xuICAgIF9oZWFsdGhGbHVzaFRpbWVyID0gc2V0VGltZW91dChmbHVzaEhlYWx0aFBpbmdzLCBIRUFMVEhfRkxVU0hfSU5URVJWQUxfTVMpO1xuICB9XG5cbiAgLyogRmx1c2ggaW1tZWRpYXQgc2kgbGUgYmF0Y2ggZXN0IHBsZWluICovXG4gIGlmIChfaGVhbHRoUGluZ1F1ZXVlLmxlbmd0aCA+PSBIRUFMVEhfTUFYX0JBVENIKSB7XG4gICAgZmx1c2hIZWFsdGhQaW5ncygpO1xuICB9XG59XG5cbi8qKlxuICogRW52b2llIGxlIGJhdGNoIGRlIHBpbmdzIGF1IHNlcnZldXIgdmlhIGxlIGJhY2tncm91bmQgc2VydmljZSB3b3JrZXIuXG4gKiBVdGlsaXNlIGxlIG1lY2FuaXNtZSBPUFRJQk9UX1BJTkcgZXhpc3RhbnQgcG91ciBldml0ZXIgbGVzIHByb2JsZW1lcyBDT1JTLlxuICovXG5mdW5jdGlvbiBmbHVzaEhlYWx0aFBpbmdzKCkge1xuICBpZiAoX2hlYWx0aEZsdXNoVGltZXIpIHtcbiAgICBjbGVhclRpbWVvdXQoX2hlYWx0aEZsdXNoVGltZXIpO1xuICAgIF9oZWFsdGhGbHVzaFRpbWVyID0gbnVsbDtcbiAgfVxuXG4gIGlmIChfaGVhbHRoUGluZ1F1ZXVlLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gIHZhciBwaW5nc1RvU2VuZCA9IF9oZWFsdGhQaW5nUXVldWUuc3BsaWNlKDApO1xuXG4gIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbXCJvcHRpYm90X2F1dGhcIl0sIGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgIHZhciBhdXRoID0gcmVzdWx0Lm9wdGlib3RfYXV0aCB8fCB7fTtcbiAgICBpZiAoIWF1dGguc3luY1Rva2VuKSByZXR1cm47IC8qIHBhcyBhdXRoZW50aWZpZSwgb24gamV0dGUgbGVzIHBpbmdzICovXG5cbiAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICB0eXBlOiBcIk9QVElCT1RfUElOR1wiLFxuICAgICAgcGF5bG9hZHM6IFt7XG4gICAgICAgIHVybDogXCJodHRwczovL29wdGlib3QuZnIvYXBpL2V4dGVuc2lvbi9zZWxlY3Rvci1oZWFsdGhcIixcbiAgICAgICAgYm9keToge1xuICAgICAgICAgIHN5bmNUb2tlbjogYXV0aC5zeW5jVG9rZW4sXG4gICAgICAgICAgcGluZ3M6IHBpbmdzVG9TZW5kLFxuICAgICAgICB9LFxuICAgICAgfV0sXG4gICAgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFdyYXBwZXIgYXV0b3VyIGRlIGZpbmRFbGVtZW50V2l0aE92ZXJyaWRlIHF1aSByZXBvcnRlIGF1dG9tYXRpcXVlbWVudFxuICogbGEgc2FudGUgZHUgc2VsZWN0ZXVyLiBVdGlsaXNlIGRhbnMgbGVzIHBvcnRhaWxzIG1pZ3Jlcy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcG9ydGFsICAgICAtIGNsZSBkdSBwb3J0YWlsXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAgICAgICAtIG5vbSBsb2dpcXVlIGR1IHNlbGVjdGV1clxuICogQHBhcmFtIHtzdHJpbmd9IGZhbGxiYWNrICAgLSBzZWxlY3RldXIgQ1NTIGhhcmRjb2RlXG4gKiBAcmV0dXJucyB7RWxlbWVudHxudWxsfVxuICovXG5mdW5jdGlvbiBmaW5kRWxlbWVudFRyYWNrZWQocG9ydGFsLCBuYW1lLCBmYWxsYmFjaykge1xuICB2YXIgZWwgPSBmaW5kRWxlbWVudFdpdGhPdmVycmlkZShwb3J0YWwsIG5hbWUsIGZhbGxiYWNrKTtcbiAgcmVwb3J0U2VsZWN0b3JIZWFsdGgocG9ydGFsLCBuYW1lLCAhIWVsKTtcbiAgcmV0dXJuIGVsO1xufVxuXG4vKiBFeHBvc2UgcG91ciBsJ2ltcG9ydCBkZXB1aXMgY29udGVudC9pbmRleC5qcyAqL1xuZ2xvYmFsVGhpcy5yZXBvcnRTZWxlY3RvckhlYWx0aCA9IHJlcG9ydFNlbGVjdG9ySGVhbHRoO1xuZ2xvYmFsVGhpcy5mbHVzaEhlYWx0aFBpbmdzID0gZmx1c2hIZWFsdGhQaW5ncztcbmdsb2JhbFRoaXMuZmluZEVsZW1lbnRUcmFja2VkID0gZmluZEVsZW1lbnRUcmFja2VkO1xuXG4vKiBcdTI1MDBcdTI1MDAgVjMtMiA6IEF1dG8tcmVwYWlyIFx1MjAxNCBjYXB0dXJlIERPTSBzbmFwc2hvdCBvbiBoaWdoIHNraXAgcmF0ZSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cblxudmFyIF9maWxsU3RhdHMgPSB7fTtcblxuZnVuY3Rpb24gdHJhY2tGaWxsUmVzdWx0KGhvc3RuYW1lLCBmaWVsZCwgc3VjY2Vzcykge1xuICBpZiAoIV9maWxsU3RhdHNbaG9zdG5hbWVdKSBfZmlsbFN0YXRzW2hvc3RuYW1lXSA9IHsgdG90YWw6IDAsIHNraXBwZWQ6IDAsIGZpZWxkczoge30gfTtcbiAgX2ZpbGxTdGF0c1tob3N0bmFtZV0udG90YWwrKztcbiAgaWYgKCFzdWNjZXNzKSBfZmlsbFN0YXRzW2hvc3RuYW1lXS5za2lwcGVkKys7XG4gIGlmICghc3VjY2Vzcykge1xuICAgIF9maWxsU3RhdHNbaG9zdG5hbWVdLmZpZWxkc1tmaWVsZF0gPSAoX2ZpbGxTdGF0c1tob3N0bmFtZV0uZmllbGRzW2ZpZWxkXSB8fCAwKSArIDE7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2hlY2tBbmRSZXBhaXJTZWxlY3RvcnMoaG9zdG5hbWUpIHtcbiAgdmFyIHN0YXRzID0gX2ZpbGxTdGF0c1tob3N0bmFtZV07XG4gIGlmICghc3RhdHMgfHwgc3RhdHMudG90YWwgPCA1KSByZXR1cm47IC8qIFBhcyBhc3NleiBkZSBkb25uZWVzICovXG5cbiAgdmFyIHNraXBSYXRlID0gc3RhdHMuc2tpcHBlZCAvIHN0YXRzLnRvdGFsO1xuICBpZiAoc2tpcFJhdGUgPCAwLjMpIHJldHVybjsgLyogVGF1eCBkZSBza2lwIGFjY2VwdGFibGUgKi9cblxuICBjb25zb2xlLndhcm4oXCJbT3B0aUJvdF0gVGF1eCBkZSBza2lwIGVsZXZlIHN1ciBcIiArIGhvc3RuYW1lICsgXCIgKFwiICsgTWF0aC5yb3VuZChza2lwUmF0ZSAqIDEwMCkgKyBcIiUpIFx1MjAxNCBlbnZvaSBzbmFwc2hvdCBET00gcG91ciByZXBhcmF0aW9uXCIpO1xuXG4gIC8qIENhcHR1cmVyIHVuIHNuYXBzaG90IERPTSBhbm9ueW1pc2UgKHNhbnMgdmFsZXVycyBkZSBjaGFtcHMpICovXG4gIHZhciBzbmFwc2hvdCA9IGNhcHR1cmVBbm9ueW1pemVkU25hcHNob3QoKTtcblxuICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoW1wib3B0aWJvdF9hdXRoXCJdLCBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICB2YXIgYXV0aCA9IHJlc3VsdC5vcHRpYm90X2F1dGggfHwge307XG4gICAgaWYgKCFhdXRoLnN5bmNUb2tlbikgcmV0dXJuO1xuXG4gICAgZmV0Y2goXCJodHRwczovL29wdGlib3QuZnIvYXBpL2V4dGVuc2lvbi9zZWxlY3Rvci1yZXBhaXJcIiwge1xuICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgIFwiQXV0aG9yaXphdGlvblwiOiBcIkJlYXJlciBcIiArIGF1dGguc3luY1Rva2VuXG4gICAgICB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBob3N0bmFtZTogaG9zdG5hbWUsXG4gICAgICAgIHNraXBSYXRlOiBza2lwUmF0ZSxcbiAgICAgICAgZmFpbGVkRmllbGRzOiBzdGF0cy5maWVsZHMsXG4gICAgICAgIHNuYXBzaG90OiBzbmFwc2hvdCxcbiAgICAgICAgdHM6IERhdGUubm93KClcbiAgICAgIH0pXG4gICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7IGNvbnNvbGUud2FybihcIltPcHRpQm90XSBzZWxlY3RvciByZXBhaXIgc3VibWlzc2lvbiBmYWlsZWQ6XCIsIGVycik7IH0pO1xuICB9KTtcblxuICAvKiBSZXNldCBzdGF0cyBhcHJlcyBlbnZvaSAqL1xuICBfZmlsbFN0YXRzW2hvc3RuYW1lXSA9IHsgdG90YWw6IDAsIHNraXBwZWQ6IDAsIGZpZWxkczoge30gfTtcbn1cblxuZnVuY3Rpb24gY2FwdHVyZUFub255bWl6ZWRTbmFwc2hvdCgpIHtcbiAgdmFyIGlucHV0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbnB1dCwgc2VsZWN0LCB0ZXh0YXJlYVwiKTtcbiAgdmFyIHNuYXBzaG90ID0gW107XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbnB1dHMubGVuZ3RoICYmIGkgPCAxMDA7IGkrKykge1xuICAgIHZhciBlbCA9IGlucHV0c1tpXTtcbiAgICBzbmFwc2hvdC5wdXNoKHtcbiAgICAgIHRhZzogZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpLFxuICAgICAgdHlwZTogZWwudHlwZSB8fCBcIlwiLFxuICAgICAgaWQ6IGVsLmlkIHx8IFwiXCIsXG4gICAgICBuYW1lOiBlbC5uYW1lIHx8IFwiXCIsXG4gICAgICBjbGFzc05hbWU6IChlbC5jbGFzc05hbWUgfHwgXCJcIikuc3Vic3RyaW5nKDAsIDEwMCksXG4gICAgICBwbGFjZWhvbGRlcjogKGVsLnBsYWNlaG9sZGVyIHx8IFwiXCIpLnN1YnN0cmluZygwLCA1MCksXG4gICAgICBhcmlhTGFiZWw6IGVsLmdldEF0dHJpYnV0ZShcImFyaWEtbGFiZWxcIikgfHwgXCJcIixcbiAgICAgIGZvcm1Db250cm9sTmFtZTogZWwuZ2V0QXR0cmlidXRlKFwiZm9ybWNvbnRyb2xuYW1lXCIpIHx8IFwiXCIsXG4gICAgICAvKiBOTyB2YWx1ZSBcdTIwMTQgYW5vbnltaXplZCAqL1xuICAgICAgaGFzVmFsdWU6ICEhKGVsLnZhbHVlIHx8IFwiXCIpLnRyaW0oKSxcbiAgICAgIGlzVmlzaWJsZTogZWwub2Zmc2V0SGVpZ2h0ID4gMCxcbiAgICAgIHBhcmVudENsYXNzZXM6IGVsLnBhcmVudEVsZW1lbnQgPyAoZWwucGFyZW50RWxlbWVudC5jbGFzc05hbWUgfHwgXCJcIikuc3Vic3RyaW5nKDAsIDEwMCkgOiBcIlwiLFxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHNuYXBzaG90O1xufVxuXG5nbG9iYWxUaGlzLnRyYWNrRmlsbFJlc3VsdCA9IHRyYWNrRmlsbFJlc3VsdDtcbmdsb2JhbFRoaXMuY2hlY2tBbmRSZXBhaXJTZWxlY3RvcnMgPSBjaGVja0FuZFJlcGFpclNlbGVjdG9ycztcbiIsICIvKiBcdTI1MDBcdTI1MDAgVjMtOSA6IFNjb3JpbmcgcHJlZGljdGlmIGRlIHJlamV0IFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuLyogRXZhbHVlIGxlIHJpc3F1ZSBkZSByZWpldCBBVkFOVCBzb3VtaXNzaW9uIFRQLiAgICAgICAgICAgICAgICAgICAgICAgICovXG4vKiBMZSBtb2RlbGUgdXRpbGlzZSBsZXMgZG9ubmVlcyBoaXN0b3JpcXVlcyBkdSBiYWNrZW5kLiAgICAgICAgICAgICAgICAgICovXG5cbnZhciBfcmVqZWN0aW9uTW9kZWwgPSBudWxsO1xuXG5mdW5jdGlvbiBsb2FkUmVqZWN0aW9uTW9kZWwoKSB7XG4gIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbXCJvcHRpYm90X3JlamVjdGlvbl9tb2RlbFwiXSwgZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgdmFyIGNhY2hlZCA9IHJlc3VsdC5vcHRpYm90X3JlamVjdGlvbl9tb2RlbDtcbiAgICBpZiAoY2FjaGVkICYmIGNhY2hlZC50cyAmJiBEYXRlLm5vdygpIC0gY2FjaGVkLnRzIDwgODY0MDAwMDApIHtcbiAgICAgIF9yZWplY3Rpb25Nb2RlbCA9IGNhY2hlZC5tb2RlbDtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBnZXRTeW5jVG9rZW4gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgZ2V0U3luY1Rva2VuKCkudGhlbihmdW5jdGlvbih0b2tlbikge1xuICAgICAgICBpZiAoIXRva2VuKSByZXR1cm47XG4gICAgICAgIGZldGNoKFwiaHR0cHM6Ly9vcHRpYm90LmZyL2FwaS9leHRlbnNpb24vcmVqZWN0aW9uLW1vZGVsXCIsIHtcbiAgICAgICAgICBoZWFkZXJzOiB7IFwiQXV0aG9yaXphdGlvblwiOiBcIkJlYXJlciBcIiArIHRva2VuIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocikgeyByZXR1cm4gci5qc29uKCk7IH0pXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICBfcmVqZWN0aW9uTW9kZWwgPSBkYXRhLm1vZGVsIHx8IG51bGw7XG4gICAgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHsgb3B0aWJvdF9yZWplY3Rpb25fbW9kZWw6IHsgbW9kZWw6IF9yZWplY3Rpb25Nb2RlbCwgdHM6IERhdGUubm93KCkgfSB9KTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycikgeyBjb25zb2xlLndhcm4oXCJbT3B0aUJvdF0gcmVqZWN0aW9uIG1vZGVsIGZldGNoIGZhaWxlZDpcIiwgZXJyKTsgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBwcmVkaWN0UmVqZWN0aW9uUmlzayhmaWxsRGF0YSwgaG9zdG5hbWUpIHtcbiAgaWYgKCFfcmVqZWN0aW9uTW9kZWwpIHJldHVybiBudWxsO1xuXG4gIHZhciByaXNrID0gMDtcbiAgdmFyIGZhY3RvcnMgPSBbXTtcblxuICB2YXIgcnVsZXMgPSBfcmVqZWN0aW9uTW9kZWwucnVsZXMgfHwgW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcnVsZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcnVsZSA9IHJ1bGVzW2ldO1xuICAgIC8qIFZlcmlmaWVyIHNpIGxhIHJlZ2xlIHMnYXBwbGlxdWUgYSBjZSBwb3J0YWlsICovXG4gICAgaWYgKHJ1bGUuaG9zdG5hbWUgJiYgcnVsZS5ob3N0bmFtZSAhPT0gaG9zdG5hbWUpIGNvbnRpbnVlO1xuXG4gICAgLyogRXZhbHVlciBsYSBjb25kaXRpb24gKi9cbiAgICB2YXIgbWF0Y2hlcyA9IGZhbHNlO1xuICAgIGlmIChydWxlLnR5cGUgPT09IFwibW9udGFudF9tYXhcIiAmJiBmaWxsRGF0YS5tb250YW50VG90YWwpIHtcbiAgICAgIG1hdGNoZXMgPSBwYXJzZUZsb2F0KGZpbGxEYXRhLm1vbnRhbnRUb3RhbCkgPiAocnVsZS50aHJlc2hvbGQgfHwgMCk7XG4gICAgfSBlbHNlIGlmIChydWxlLnR5cGUgPT09IFwib3JnYW5pc21lXCIgJiYgZmlsbERhdGEub3JnYW5pc21lKSB7XG4gICAgICBtYXRjaGVzID0gcnVsZS5vcmdhbmlzbXMgJiYgcnVsZS5vcmdhbmlzbXMuaW5kZXhPZihmaWxsRGF0YS5vcmdhbmlzbWUudG9Mb3dlckNhc2UoKSkgIT09IC0xO1xuICAgIH0gZWxzZSBpZiAocnVsZS50eXBlID09PSBcImVxdWlwbWVudFwiICYmIGZpbGxEYXRhLmVxdWlwbWVudENvZGUpIHtcbiAgICAgIG1hdGNoZXMgPSBydWxlLmNvZGVzICYmIHJ1bGUuY29kZXMuaW5kZXhPZihmaWxsRGF0YS5lcXVpcG1lbnRDb2RlKSAhPT0gLTE7XG4gICAgfVxuXG4gICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgIHJpc2sgKz0gcnVsZS53ZWlnaHQgfHwgMTA7XG4gICAgICBmYWN0b3JzLnB1c2goe1xuICAgICAgICByZWFzb246IHJ1bGUucmVhc29uIHx8IHJ1bGUudHlwZSxcbiAgICAgICAgaW1wYWN0OiBydWxlLndlaWdodCB8fCAxMCxcbiAgICAgICAgc3VnZ2VzdGlvbjogcnVsZS5zdWdnZXN0aW9uIHx8IG51bGxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qIE5vcm1hbGlzZXIgZW50cmUgMCBldCAxMDAgKi9cbiAgcmlzayA9IE1hdGgubWluKDEwMCwgTWF0aC5tYXgoMCwgcmlzaykpO1xuXG4gIHJldHVybiB7XG4gICAgcmlzazogcmlzayxcbiAgICBsZXZlbDogcmlzayA8IDIwID8gXCJsb3dcIiA6IHJpc2sgPCA1MCA/IFwibWVkaXVtXCIgOiBcImhpZ2hcIixcbiAgICBmYWN0b3JzOiBmYWN0b3JzLFxuICAgIHN1Z2dlc3Rpb25zOiBmYWN0b3JzLmZpbHRlcihmdW5jdGlvbihmKSB7IHJldHVybiBmLnN1Z2dlc3Rpb247IH0pLm1hcChmdW5jdGlvbihmKSB7IHJldHVybiBmLnN1Z2dlc3Rpb247IH0pXG4gIH07XG59XG5cbmZ1bmN0aW9uIHNob3dSZWplY3Rpb25SaXNrQmFubmVyKHByZWRpY3Rpb24pIHtcbiAgaWYgKCFwcmVkaWN0aW9uIHx8IHByZWRpY3Rpb24ucmlzayA8IDE1KSByZXR1cm47XG5cbiAgdmFyIGV4aXN0aW5nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJvcHRpYm90LXJlamVjdGlvbi1yaXNrXCIpO1xuICBpZiAoZXhpc3RpbmcpIGV4aXN0aW5nLnJlbW92ZSgpO1xuXG4gIHZhciBjb2xvcnMgPSB7IGxvdzogXCIjMDU5NjY5XCIsIG1lZGl1bTogXCIjZDk3NzA2XCIsIGhpZ2g6IFwiI2RjMjYyNlwiIH07XG4gIHZhciBsYWJlbHMgPSB7IGxvdzogXCJGYWlibGVcIiwgbWVkaXVtOiBcIk1veWVuXCIsIGhpZ2g6IFwiRWxldmVcIiB9O1xuXG4gIHZhciBiYW5uZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBiYW5uZXIuaWQgPSBcIm9wdGlib3QtcmVqZWN0aW9uLXJpc2tcIjtcbiAgYmFubmVyLnN0eWxlLmNzc1RleHQgPSBcInBvc2l0aW9uOmZpeGVkO3RvcDoxNnB4O3JpZ2h0OjE2cHg7ei1pbmRleDoyMTQ3NDgzNjQ3O2JhY2tncm91bmQ6d2hpdGU7Ym9yZGVyLXJhZGl1czoxMnB4O3BhZGRpbmc6MTZweCAyMHB4O2JveC1zaGFkb3c6MCA4cHggMzBweCByZ2JhKDAsMCwwLDAuMTUpO2ZvbnQtZmFtaWx5Oi1hcHBsZS1zeXN0ZW0sQmxpbmtNYWNTeXN0ZW1Gb250LHNhbnMtc2VyaWY7bWF4LXdpZHRoOjM2MHB4O2JvcmRlci1sZWZ0OjRweCBzb2xpZCBcIiArIGNvbG9yc1twcmVkaWN0aW9uLmxldmVsXSArIFwiO1wiO1xuXG4gIHZhciBoZWFkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBoZWFkZXIuc3R5bGUuY3NzVGV4dCA9IFwiZGlzcGxheTpmbGV4O2p1c3RpZnktY29udGVudDpzcGFjZS1iZXR3ZWVuO2FsaWduLWl0ZW1zOmNlbnRlcjttYXJnaW4tYm90dG9tOjhweDtcIjtcbiAgaGVhZGVyLmlubmVySFRNTCA9ICc8c3BhbiBzdHlsZT1cImZvbnQtc2l6ZToxNHB4O2ZvbnQtd2VpZ2h0OjcwMDtjb2xvcjojMTExO1wiPlJpc3F1ZSBkZSByZWpldCA6ICcgKyBwcmVkaWN0aW9uLnJpc2sgKyAnJTwvc3Bhbj48c3BhbiBzdHlsZT1cImZvbnQtc2l6ZToxMXB4O3BhZGRpbmc6MnB4IDhweDtib3JkZXItcmFkaXVzOjRweDtiYWNrZ3JvdW5kOicgKyBjb2xvcnNbcHJlZGljdGlvbi5sZXZlbF0gKyAnO2NvbG9yOndoaXRlO2ZvbnQtd2VpZ2h0OjYwMDtcIj4nICsgbGFiZWxzW3ByZWRpY3Rpb24ubGV2ZWxdICsgJzwvc3Bhbj4nO1xuICBiYW5uZXIuYXBwZW5kQ2hpbGQoaGVhZGVyKTtcblxuICBpZiAocHJlZGljdGlvbi5mYWN0b3JzLmxlbmd0aCA+IDApIHtcbiAgICB2YXIgZmFjdG9yTGlzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgZmFjdG9yTGlzdC5zdHlsZS5jc3NUZXh0ID0gXCJmb250LXNpemU6MTJweDtjb2xvcjojNmI3MjgwO1wiO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJlZGljdGlvbi5mYWN0b3JzLmxlbmd0aCAmJiBpIDwgMzsgaSsrKSB7XG4gICAgICB2YXIgZiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICBmLnN0eWxlLmNzc1RleHQgPSBcInBhZGRpbmc6MnB4IDA7XCI7XG4gICAgICBmLnRleHRDb250ZW50ID0gXCJcXHUyMDIyIFwiICsgcHJlZGljdGlvbi5mYWN0b3JzW2ldLnJlYXNvbjtcbiAgICAgIGZhY3Rvckxpc3QuYXBwZW5kQ2hpbGQoZik7XG4gICAgfVxuICAgIGJhbm5lci5hcHBlbmRDaGlsZChmYWN0b3JMaXN0KTtcbiAgfVxuXG4gIGlmIChwcmVkaWN0aW9uLnN1Z2dlc3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICB2YXIgc3VnZ0JveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgc3VnZ0JveC5zdHlsZS5jc3NUZXh0ID0gXCJtYXJnaW4tdG9wOjhweDtwYWRkaW5nOjhweDtiYWNrZ3JvdW5kOiNmMGZkZjQ7Ym9yZGVyLXJhZGl1czo2cHg7Zm9udC1zaXplOjEycHg7Y29sb3I6IzA2NWY0NjtcIjtcbiAgICBzdWdnQm94LnRleHRDb250ZW50ID0gXCJTdWdnZXN0aW9uIDogXCIgKyBwcmVkaWN0aW9uLnN1Z2dlc3Rpb25zWzBdO1xuICAgIGJhbm5lci5hcHBlbmRDaGlsZChzdWdnQm94KTtcbiAgfVxuXG4gIHZhciBjbG9zZUJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gIGNsb3NlQnRuLnRleHRDb250ZW50ID0gXCJcXHUwMGQ3XCI7XG4gIGNsb3NlQnRuLnN0eWxlLmNzc1RleHQgPSBcInBvc2l0aW9uOmFic29sdXRlO3RvcDo4cHg7cmlnaHQ6OHB4O2JhY2tncm91bmQ6bm9uZTtib3JkZXI6bm9uZTtmb250LXNpemU6MThweDtjb2xvcjojOWNhM2FmO2N1cnNvcjpwb2ludGVyO1wiO1xuICBjbG9zZUJ0bi5vbmNsaWNrID0gZnVuY3Rpb24oKSB7IGJhbm5lci5yZW1vdmUoKTsgfTtcbiAgYmFubmVyLmFwcGVuZENoaWxkKGNsb3NlQnRuKTtcblxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGJhbm5lcik7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IGJhbm5lci5yZW1vdmUoKTsgfSwgMTUwMDApO1xufVxuXG5nbG9iYWxUaGlzLmxvYWRSZWplY3Rpb25Nb2RlbCA9IGxvYWRSZWplY3Rpb25Nb2RlbDtcbmdsb2JhbFRoaXMucHJlZGljdFJlamVjdGlvblJpc2sgPSBwcmVkaWN0UmVqZWN0aW9uUmlzaztcbmdsb2JhbFRoaXMuc2hvd1JlamVjdGlvblJpc2tCYW5uZXIgPSBzaG93UmVqZWN0aW9uUmlza0Jhbm5lcjtcbiIsICIvKiBPcHRpQm90IENvbW1hbmQgQ2VudGVyIFx1MjAxNCBNaW5pIGRhc2hib2FyZCBmbG90dGFudCBzdXIgbGVzIHBvcnRhaWxzICovXG4vKiBJbmplY3RlIHZpYSBTaGFkb3cgRE9NIHBvdXIgaXNvbGF0aW9uIENTUyBjb21wbGV0ZSAqL1xuXG52YXIgQ0NfU1RPUkFHRV9LRVkgPSBcIm9wdGlib3RfY2Nfc3RhdGVcIjtcblxuZnVuY3Rpb24gY3JlYXRlQ29tbWFuZENlbnRlcigpIHtcbiAgaWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwib3B0aWJvdC1jb21tYW5kLWNlbnRlclwiKSkgcmV0dXJuO1xuXG4gIHZhciBob3N0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgaG9zdC5pZCA9IFwib3B0aWJvdC1jb21tYW5kLWNlbnRlclwiO1xuICBob3N0LnN0eWxlLmNzc1RleHQgPSBcInBvc2l0aW9uOmZpeGVkO3otaW5kZXg6MjE0NzQ4MzY0NztcIjtcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChob3N0KTtcblxuICB2YXIgc2hhZG93ID0gaG9zdC5hdHRhY2hTaGFkb3coeyBtb2RlOiBcImNsb3NlZFwiIH0pO1xuXG4gIHZhciBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgc3R5bGUudGV4dENvbnRlbnQgPSBnZXRDb21tYW5kQ2VudGVyQ1NTKCk7XG4gIHNoYWRvdy5hcHBlbmRDaGlsZChzdHlsZSk7XG5cbiAgdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIGNvbnRhaW5lci5jbGFzc05hbWUgPSBcImNjLWNvbnRhaW5lclwiO1xuICBzaGFkb3cuYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcblxuICAvKiBDaGFyZ2VyIGxhIHBvc2l0aW9uIGV0IGxlIG1vZGUgc2F1dmVnYXJkZXMgKi9cbiAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFtDQ19TVE9SQUdFX0tFWV0sIGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgIHZhciBzdGF0ZSA9IHJlc3VsdFtDQ19TVE9SQUdFX0tFWV0gfHwge307XG4gICAgdmFyIHggPSBzdGF0ZS54ICE9IG51bGwgPyBzdGF0ZS54IDogd2luZG93LmlubmVyV2lkdGggLSAzNjA7XG4gICAgdmFyIHkgPSBzdGF0ZS55ICE9IG51bGwgPyBzdGF0ZS55IDogODA7XG4gICAgaG9zdC5zdHlsZS5sZWZ0ID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oeCwgd2luZG93LmlubmVyV2lkdGggLSA1MCkpICsgXCJweFwiO1xuICAgIGhvc3Quc3R5bGUudG9wID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oeSwgd2luZG93LmlubmVySGVpZ2h0IC0gNTApKSArIFwicHhcIjtcblxuICAgIC8qIG1vZGU6IFwibWluaW1pemVkXCIsIFwiY29sbGFwc2VkXCIsIFwiZXhwYW5kZWRcIiAqL1xuICAgIHZhciBtb2RlID0gc3RhdGUubW9kZSB8fCBcImNvbGxhcHNlZFwiO1xuICAgIHJlbmRlckNvbW1hbmRDZW50ZXIoc2hhZG93LCBjb250YWluZXIsIGhvc3QsIG1vZGUpO1xuICB9KTtcblxuICAvKiBTU0UgRXZlbnQgTGlzdGVuZXIgXHUyMDE0IHJlLXJlbmRlciBvbiBjYWNoZSB1cGRhdGUgZnJvbSBiYWNrZ3JvdW5kICovXG4gIGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgaWYgKG1lc3NhZ2UgJiYgbWVzc2FnZS50eXBlID09PSBcIk9QVElCT1RfU1NFX0VWRU5UXCIpIHtcbiAgICAgIHJlYWRFbmNyeXB0ZWRDYWNoZSgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIC8qIERldGVybWluZSBjdXJyZW50IG1vZGUgZnJvbSBzdG9yYWdlIGJlZm9yZSByZS1yZW5kZXJpbmcgKi9cbiAgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFtDQ19TVE9SQUdFX0tFWV0sIGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgIHZhciBzdGF0ZSA9IHJlc3VsdFtDQ19TVE9SQUdFX0tFWV0gfHwge307XG4gICAgICAgICAgdmFyIG1vZGUgPSBzdGF0ZS5tb2RlIHx8IFwiY29sbGFwc2VkXCI7XG4gICAgICAgICAgcmVuZGVyQ29tbWFuZENlbnRlcihzaGFkb3csIGNvbnRhaW5lciwgaG9zdCwgbW9kZSk7XG5cbiAgICAgICAgICAvKiBGbGFzaCB0aGUgc3RhdHVzIGRvdCBncmVlbiBicmllZmx5ICovXG4gICAgICAgICAgZmxhc2hTdGF0dXNEb3Qoc2hhZG93KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBmbGFzaFN0YXR1c0RvdChzaGFkb3cpIHtcbiAgdmFyIGRvdCA9IHNoYWRvdy5xdWVyeVNlbGVjdG9yKFwiLmNjLXN0YXR1cy1kb3RcIik7XG4gIGlmICghZG90KSB7XG4gICAgZG90ID0gc2hhZG93LnF1ZXJ5U2VsZWN0b3IoXCIuY2MtbWluaS1kb3RcIik7XG4gIH1cbiAgaWYgKGRvdCkge1xuICAgIGRvdC5zdHlsZS5iYWNrZ3JvdW5kID0gXCIjMTBiOTgxXCI7XG4gICAgZG90LnN0eWxlLmJveFNoYWRvdyA9IFwiMCAwIDhweCAjMTBiOTgxXCI7XG4gICAgZG90LmNsYXNzTGlzdC5hZGQoXCJjYy1kb3QtZmxhc2hcIik7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIGRvdC5jbGFzc0xpc3QucmVtb3ZlKFwiY2MtZG90LWZsYXNoXCIpO1xuICAgICAgZG90LnN0eWxlLmJveFNoYWRvdyA9IFwiXCI7XG4gICAgfSwgMTUwMCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0U3RhdHVzQ29sb3IoZGF0YSkge1xuICBpZiAoIWRhdGEgfHwgIWRhdGEubm9tKSByZXR1cm4gXCIjZWY0NDQ0XCI7XG4gIHZhciBoYXNOc3MgPSAhIShkYXRhLm5zcyB8fCBkYXRhLm51bWVyb1NlY3VyaXRlU29jaWFsZSk7XG4gIGlmIChkYXRhLm5vbSAmJiBoYXNOc3MpIHJldHVybiBcIiMxMGI5ODFcIjtcbiAgcmV0dXJuIFwiI2Y1OWUwYlwiO1xufVxuXG5mdW5jdGlvbiByZW5kZXJDb21tYW5kQ2VudGVyKHNoYWRvdywgY29udGFpbmVyLCBob3N0LCBtb2RlKSB7XG4gIHJlYWRFbmNyeXB0ZWRDYWNoZSgpLnRoZW4oZnVuY3Rpb24oY2FjaGUpIHtcbiAgICB2YXIgZGF0YSA9IGNhY2hlICYmIGNhY2hlLmN1cnJlbnQgPyBjYWNoZS5jdXJyZW50IDogbnVsbDtcbiAgICB2YXIgc3RhdHVzQ29sb3IgPSBnZXRTdGF0dXNDb2xvcihkYXRhKTtcbiAgICBjb250YWluZXIuaW5uZXJIVE1MID0gXCJcIjtcblxuICAgIGlmIChtb2RlID09PSBcIm1pbmltaXplZFwiKSB7XG4gICAgICByZW5kZXJNaW5pQnV0dG9uKHNoYWRvdywgY29udGFpbmVyLCBob3N0LCBzdGF0dXNDb2xvcik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGNvbGxhcHNlZCA9IChtb2RlID09PSBcImNvbGxhcHNlZFwiKTtcblxuICAgIC8qIEhlYWRlciAqL1xuICAgIHZhciBoZWFkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGhlYWRlci5jbGFzc05hbWUgPSBcImNjLWhlYWRlclwiO1xuXG4gICAgdmFyIGxvZ29XcmFwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgbG9nb1dyYXAuY2xhc3NOYW1lID0gXCJjYy1sb2dvLXdyYXBcIjtcblxuICAgIHZhciBsb2dvVGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgIGxvZ29UZXh0LmNsYXNzTmFtZSA9IFwiY2MtbG9nb1wiO1xuICAgIGxvZ29UZXh0LnRleHRDb250ZW50ID0gXCJPcHRpQm90XCI7XG4gICAgbG9nb1dyYXAuYXBwZW5kQ2hpbGQobG9nb1RleHQpO1xuXG4gICAgLyogU3RhdHVzIGRvdCAqL1xuICAgIHZhciBzdGF0dXNEb3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICBzdGF0dXNEb3QuY2xhc3NOYW1lID0gXCJjYy1zdGF0dXMtZG90XCI7XG4gICAgaWYgKHN0YXR1c0NvbG9yID09PSBcIiMxMGI5ODFcIikge1xuICAgICAgc3RhdHVzRG90LmNsYXNzTGlzdC5hZGQoXCJjYy1kb3QtcHVsc2VcIik7XG4gICAgfVxuICAgIHN0YXR1c0RvdC5zdHlsZS5iYWNrZ3JvdW5kID0gc3RhdHVzQ29sb3I7XG4gICAgbG9nb1dyYXAuYXBwZW5kQ2hpbGQoc3RhdHVzRG90KTtcblxuICAgIGhlYWRlci5hcHBlbmRDaGlsZChsb2dvV3JhcCk7XG5cbiAgICAvKiBEcmFnIGhhbmRsZSAqL1xuICAgIG1ha2VEcmFnZ2FibGUoaG9zdCwgaGVhZGVyKTtcblxuICAgIC8qIEhlYWRlciBidXR0b25zIHdyYXBwZXIgKi9cbiAgICB2YXIgaGVhZGVyQnRucyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgIGhlYWRlckJ0bnMuY2xhc3NOYW1lID0gXCJjYy1oZWFkZXItYnRuc1wiO1xuXG4gICAgLyogTWluaW1pemUgYnV0dG9uICovXG4gICAgdmFyIG1pbkJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgbWluQnRuLmNsYXNzTmFtZSA9IFwiY2MtYnRuLXRvZ2dsZSBjYy1idG4tbWluaW1pemVcIjtcbiAgICBtaW5CdG4uaW5uZXJIVE1MID0gXCImI3gyNTAwO1wiO1xuICAgIG1pbkJ0bi50aXRsZSA9IFwiTWluaW1pc2VyXCI7XG4gICAgbWluQnRuLm9uY2xpY2sgPSBmdW5jdGlvbihlKSB7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgc2F2ZVN0YXRlKGhvc3QsIFwibWluaW1pemVkXCIpO1xuICAgICAgcmVuZGVyQ29tbWFuZENlbnRlcihzaGFkb3csIGNvbnRhaW5lciwgaG9zdCwgXCJtaW5pbWl6ZWRcIik7XG4gICAgfTtcbiAgICBoZWFkZXJCdG5zLmFwcGVuZENoaWxkKG1pbkJ0bik7XG5cbiAgICAvKiBUb2dnbGUgYnV0dG9uICovXG4gICAgdmFyIHRvZ2dsZUJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgdG9nZ2xlQnRuLmNsYXNzTmFtZSA9IFwiY2MtYnRuLXRvZ2dsZVwiO1xuICAgIHRvZ2dsZUJ0bi5pbm5lckhUTUwgPSBjb2xsYXBzZWQgPyBcIiYjeDI1QkM7XCIgOiBcIiYjeDI1QjI7XCI7XG4gICAgdG9nZ2xlQnRuLnRpdGxlID0gY29sbGFwc2VkID8gXCJPdXZyaXJcIiA6IFwiUmVkdWlyZVwiO1xuICAgIHRvZ2dsZUJ0bi5vbmNsaWNrID0gZnVuY3Rpb24oZSkge1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIHZhciBuZXdNb2RlID0gY29sbGFwc2VkID8gXCJleHBhbmRlZFwiIDogXCJjb2xsYXBzZWRcIjtcbiAgICAgIHNhdmVTdGF0ZShob3N0LCBuZXdNb2RlKTtcbiAgICAgIHJlbmRlckNvbW1hbmRDZW50ZXIoc2hhZG93LCBjb250YWluZXIsIGhvc3QsIG5ld01vZGUpO1xuICAgIH07XG4gICAgaGVhZGVyQnRucy5hcHBlbmRDaGlsZCh0b2dnbGVCdG4pO1xuXG4gICAgaGVhZGVyLmFwcGVuZENoaWxkKGhlYWRlckJ0bnMpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChoZWFkZXIpO1xuXG4gICAgaWYgKGNvbGxhcHNlZCkgcmV0dXJuO1xuXG4gICAgaWYgKCFkYXRhIHx8ICFkYXRhLm5vbSkge1xuICAgICAgdmFyIGVtcHR5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgIGVtcHR5LmNsYXNzTmFtZSA9IFwiY2MtZW1wdHlcIjtcbiAgICAgIGVtcHR5LnRleHRDb250ZW50ID0gXCJBdWN1bmUgZG9ubmVlIHBhdGllbnQuIFNjYW5uZXogdW4gZG9jdW1lbnQgZGVwdWlzIGxlIGRhc2hib2FyZCBPcHRpQm90LlwiO1xuICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGVtcHR5KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvKiBFdGF0IENpdmlsICovXG4gICAgYWRkU2VjdGlvbihjb250YWluZXIsIFwiRXRhdCBDaXZpbFwiLCBbXG4gICAgICB7IGxhYmVsOiBcIk5vbVwiLCB2YWx1ZTogKGRhdGEubm9tIHx8IFwiXCIpLnRvVXBwZXJDYXNlKCkgfSxcbiAgICAgIHsgbGFiZWw6IFwiUHJlbm9tXCIsIHZhbHVlOiBkYXRhLnByZW5vbSB8fCBcIlwiIH0sXG4gICAgICB7IGxhYmVsOiBcIkRhdGUgbmFpc3NhbmNlXCIsIHZhbHVlOiBkYXRhLmRhdGVOYWlzc2FuY2UgfHwgZGF0YS5kb2IgfHwgXCJcIiB9LFxuICAgICAgeyBsYWJlbDogXCJOU1NcIiwgdmFsdWU6IGRhdGEubnVtZXJvU2VjdXJpdGVTb2NpYWxlIHx8IGRhdGEubnNzIHx8IFwiXCIgfSxcbiAgICBdKTtcblxuICAgIC8qIE11dHVlbGxlICovXG4gICAgYWRkU2VjdGlvbihjb250YWluZXIsIFwiTXV0dWVsbGVcIiwgW1xuICAgICAgeyBsYWJlbDogXCJPcmdhbmlzbWVcIiwgdmFsdWU6IGRhdGEub3JnYW5pc21lIHx8IFwiXCIgfSxcbiAgICAgIHsgbGFiZWw6IFwiTi4gQWRoZXJlbnRcIiwgdmFsdWU6IGRhdGEubnVtZXJvQWRoZXJlbnQgfHwgXCJcIiB9LFxuICAgICAgeyBsYWJlbDogXCJOLiBBTUNcIiwgdmFsdWU6IGRhdGEubnVtZXJvQU1DIHx8IFwiXCIgfSxcbiAgICAgIHsgbGFiZWw6IFwiTi4gVGVsZXRyYW5zLlwiLCB2YWx1ZTogZGF0YS5udW1lcm9UZWxldHJhbnNtaXNzaW9uIHx8IFwiXCIgfSxcbiAgICAgIHsgbGFiZWw6IFwiVHlwZSBDb252LlwiLCB2YWx1ZTogZGF0YS50eXBlQ29udiB8fCBcIlwiIH0sXG4gICAgICB7IGxhYmVsOiBcIlZhbGlkaXRlXCIsIHZhbHVlOiAoZGF0YS5kYXRlRGVidXRWYWxpZGl0ZSB8fCBcIlwiKSArIChkYXRhLmRhdGVGaW5WYWxpZGl0ZSA/IFwiIC0gXCIgKyBkYXRhLmRhdGVGaW5WYWxpZGl0ZSA6IFwiXCIpIH0sXG4gICAgXSk7XG5cbiAgICAvKiBPcmRvbm5hbmNlICovXG4gICAgdmFyIG8gPSBkYXRhLm9yZG9ubmFuY2UgfHwge307XG4gICAgaWYgKG8ubHVuZXR0ZXNPRCB8fCBvLmx1bmV0dGVzT0cgfHwgby5kYXRlT3Jkb25uYW5jZSkge1xuICAgICAgdmFyIG9yZG9GaWVsZHMgPSBbXG4gICAgICAgIHsgbGFiZWw6IFwiRGF0ZSBvcmRvLlwiLCB2YWx1ZTogby5kYXRlT3Jkb25uYW5jZSB8fCBcIlwiIH0sXG4gICAgICAgIHsgbGFiZWw6IFwiRFBcIiwgdmFsdWU6IG8uZGlzdGFuY2VQdXBpbGxhaXJlIHx8IFwiXCIgfSxcbiAgICAgIF07XG4gICAgICBpZiAoby5sdW5ldHRlc09EKSB7XG4gICAgICAgIHZhciBvZCA9IG8ubHVuZXR0ZXNPRDtcbiAgICAgICAgb3Jkb0ZpZWxkcy5wdXNoKHsgbGFiZWw6IFwiT0RcIiwgdmFsdWU6IGZvcm1hdENvcnJlY3Rpb24ob2QpIH0pO1xuICAgICAgfVxuICAgICAgaWYgKG8ubHVuZXR0ZXNPRykge1xuICAgICAgICB2YXIgb2cgPSBvLmx1bmV0dGVzT0c7XG4gICAgICAgIG9yZG9GaWVsZHMucHVzaCh7IGxhYmVsOiBcIk9HXCIsIHZhbHVlOiBmb3JtYXRDb3JyZWN0aW9uKG9nKSB9KTtcbiAgICAgIH1cbiAgICAgIGlmIChvLmx1bmV0dGVzT0QgJiYgby5sdW5ldHRlc09ELmFkZGl0aW9uKSB7XG4gICAgICAgIG9yZG9GaWVsZHMucHVzaCh7IGxhYmVsOiBcIkFkZGl0aW9uXCIsIHZhbHVlOiBvLmx1bmV0dGVzT0QuYWRkaXRpb24gfSk7XG4gICAgICB9XG4gICAgICBhZGRTZWN0aW9uKGNvbnRhaW5lciwgXCJPcmRvbm5hbmNlXCIsIG9yZG9GaWVsZHMpO1xuICAgIH1cblxuICAgIC8qIEFjdGlvbiBidXR0b25zICovXG4gICAgdmFyIGFjdGlvbnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGFjdGlvbnMuY2xhc3NOYW1lID0gXCJjYy1hY3Rpb25zXCI7XG5cbiAgICB2YXIgZmlsbEJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgZmlsbEJ0bi5jbGFzc05hbWUgPSBcImNjLWJ0biBjYy1idG4tZmlsbFwiO1xuICAgIGZpbGxCdG4udGV4dENvbnRlbnQgPSBcIlJlbXBsaXJcIjtcbiAgICBmaWxsQnRuLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBwYWdlQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJvcHRpYm90LWZpbGwtYnRuXCIpO1xuICAgICAgaWYgKHBhZ2VCdG4pIHBhZ2VCdG4uY2xpY2soKTtcbiAgICB9O1xuICAgIGFjdGlvbnMuYXBwZW5kQ2hpbGQoZmlsbEJ0bik7XG5cbiAgICB2YXIgc2NhbkJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgc2NhbkJ0bi5jbGFzc05hbWUgPSBcImNjLWJ0biBjYy1idG4tc2NhblwiO1xuICAgIHNjYW5CdG4udGV4dENvbnRlbnQgPSBcIlJlc2Nhbm5lclwiO1xuICAgIHNjYW5CdG4ub25jbGljayA9IGZ1bmN0aW9uKCkge1xuICAgICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyB0eXBlOiBcIk9QVElCT1RfT1BFTl9UQUJcIiwgdXJsOiBcImh0dHBzOi8vb3B0aWJvdC5mci9kYXNoYm9hcmRcIiB9KTtcbiAgICB9O1xuICAgIGFjdGlvbnMuYXBwZW5kQ2hpbGQoc2NhbkJ0bik7XG5cbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoYWN0aW9ucyk7XG4gIH0pLmNhdGNoKGZ1bmN0aW9uKCkge1xuICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cImNjLWVtcHR5XCI+RXJyZXVyIGRlIGxlY3R1cmUgZHUgY2FjaGUuPC9kaXY+JztcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlck1pbmlCdXR0b24oc2hhZG93LCBjb250YWluZXIsIGhvc3QsIHN0YXR1c0NvbG9yKSB7XG4gIGNvbnRhaW5lci5jbGFzc05hbWUgPSBcImNjLWNvbnRhaW5lciBjYy1taW5pbWl6ZWRcIjtcblxuICB2YXIgbWluaUJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIG1pbmlCdG4uY2xhc3NOYW1lID0gXCJjYy1taW5pLWJ0blwiO1xuXG4gIHZhciBtaW5pTGV0dGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gIG1pbmlMZXR0ZXIuY2xhc3NOYW1lID0gXCJjYy1taW5pLWxldHRlclwiO1xuICBtaW5pTGV0dGVyLnRleHRDb250ZW50ID0gXCJPXCI7XG4gIG1pbmlCdG4uYXBwZW5kQ2hpbGQobWluaUxldHRlcik7XG5cbiAgLyogU3RhdHVzIGJhZGdlIG9uIG1pbmkgYnV0dG9uICovXG4gIHZhciBtaW5pQmFkZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgbWluaUJhZGdlLmNsYXNzTmFtZSA9IFwiY2MtbWluaS1kb3RcIjtcbiAgaWYgKHN0YXR1c0NvbG9yID09PSBcIiMxMGI5ODFcIikge1xuICAgIG1pbmlCYWRnZS5jbGFzc0xpc3QuYWRkKFwiY2MtZG90LXB1bHNlXCIpO1xuICB9XG4gIG1pbmlCYWRnZS5zdHlsZS5iYWNrZ3JvdW5kID0gc3RhdHVzQ29sb3I7XG4gIG1pbmlCdG4uYXBwZW5kQ2hpbGQobWluaUJhZGdlKTtcblxuICAvKiBEcmFnIGhhbmRsZSBvbiBtaW5pIGJ1dHRvbiAqL1xuICBtYWtlRHJhZ2dhYmxlKGhvc3QsIG1pbmlCdG4pO1xuXG4gIC8qIENsaWNrIHRvIGV4cGFuZCB0byBjb2xsYXBzZWQgKi9cbiAgbWluaUJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZSkge1xuICAgIC8qIElnbm9yZSBpZiB0aGlzIHdhcyBhIGRyYWcgKi9cbiAgICBpZiAobWluaUJ0bi5fd2FzRHJhZ2dlZCkge1xuICAgICAgbWluaUJ0bi5fd2FzRHJhZ2dlZCA9IGZhbHNlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIGNvbnRhaW5lci5jbGFzc05hbWUgPSBcImNjLWNvbnRhaW5lclwiO1xuICAgIHNhdmVTdGF0ZShob3N0LCBcImNvbGxhcHNlZFwiKTtcbiAgICByZW5kZXJDb21tYW5kQ2VudGVyKHNoYWRvdywgY29udGFpbmVyLCBob3N0LCBcImNvbGxhcHNlZFwiKTtcbiAgfSk7XG5cbiAgY29udGFpbmVyLmFwcGVuZENoaWxkKG1pbmlCdG4pO1xufVxuXG5mdW5jdGlvbiBhZGRTZWN0aW9uKGNvbnRhaW5lciwgdGl0bGUsIGZpZWxkcykge1xuICB2YXIgZmlsdGVyZWRGaWVsZHMgPSBmaWVsZHMuZmlsdGVyKGZ1bmN0aW9uKGYpIHsgcmV0dXJuIGYudmFsdWU7IH0pO1xuICBpZiAoZmlsdGVyZWRGaWVsZHMubGVuZ3RoID09PSAwKSByZXR1cm47XG5cbiAgdmFyIHNlY3Rpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBzZWN0aW9uLmNsYXNzTmFtZSA9IFwiY2Mtc2VjdGlvblwiO1xuXG4gIHZhciBzVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBzVGl0bGUuY2xhc3NOYW1lID0gXCJjYy1zZWN0aW9uLXRpdGxlXCI7XG4gIHNUaXRsZS50ZXh0Q29udGVudCA9IHRpdGxlO1xuICBzZWN0aW9uLmFwcGVuZENoaWxkKHNUaXRsZSk7XG5cbiAgZmlsdGVyZWRGaWVsZHMuZm9yRWFjaChmdW5jdGlvbihmaWVsZCkge1xuICAgIHZhciByb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHJvdy5jbGFzc05hbWUgPSBcImNjLWZpZWxkXCI7XG5cbiAgICB2YXIgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICBsYWJlbC5jbGFzc05hbWUgPSBcImNjLWxhYmVsXCI7XG4gICAgbGFiZWwudGV4dENvbnRlbnQgPSBmaWVsZC5sYWJlbDtcbiAgICByb3cuYXBwZW5kQ2hpbGQobGFiZWwpO1xuXG4gICAgdmFyIHZhbHVlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgdmFsdWUuY2xhc3NOYW1lID0gXCJjYy12YWx1ZVwiO1xuICAgIHZhbHVlLnRleHRDb250ZW50ID0gZmllbGQudmFsdWU7XG4gICAgcm93LmFwcGVuZENoaWxkKHZhbHVlKTtcblxuICAgIHZhciBjb3B5QnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgICBjb3B5QnRuLmNsYXNzTmFtZSA9IFwiY2MtYnRuLWNvcHlcIjtcbiAgICBjb3B5QnRuLmlubmVySFRNTCA9IFwiJiN4MjM5ODtcIjtcbiAgICBjb3B5QnRuLnRpdGxlID0gXCJDb3BpZXJcIjtcbiAgICBjb3B5QnRuLm9uY2xpY2sgPSBmdW5jdGlvbihlKSB7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoZmllbGQudmFsdWUpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvcHlCdG4uaW5uZXJIVE1MID0gXCImI3gyNzEzO1wiO1xuICAgICAgICBjb3B5QnRuLnN0eWxlLmNvbG9yID0gXCIjMTBiOTgxXCI7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgY29weUJ0bi5pbm5lckhUTUwgPSBcIiYjeDIzOTg7XCI7XG4gICAgICAgICAgY29weUJ0bi5zdHlsZS5jb2xvciA9IFwiXCI7XG4gICAgICAgIH0sIDE1MDApO1xuICAgICAgfSk7XG4gICAgfTtcbiAgICByb3cuYXBwZW5kQ2hpbGQoY29weUJ0bik7XG5cbiAgICBzZWN0aW9uLmFwcGVuZENoaWxkKHJvdyk7XG4gIH0pO1xuXG4gIGNvbnRhaW5lci5hcHBlbmRDaGlsZChzZWN0aW9uKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0Q29ycmVjdGlvbihjKSB7XG4gIGlmICghYykgcmV0dXJuIFwiXCI7XG4gIHZhciBwYXJ0cyA9IFtdO1xuICBpZiAoYy5zcGhlcmUpIHBhcnRzLnB1c2goXCJTcGggXCIgKyBjLnNwaGVyZSk7XG4gIGlmIChjLmN5bGluZHJlICYmIGMuY3lsaW5kcmUgIT09IFwiMFwiICYmIGMuY3lsaW5kcmUgIT09IFwiMC4wMFwiKSBwYXJ0cy5wdXNoKFwiQ3lsIFwiICsgYy5jeWxpbmRyZSk7XG4gIGlmIChjLmF4ZSAmJiBjLmF4ZSAhPT0gXCIwXCIpIHBhcnRzLnB1c2goXCJBeGUgXCIgKyBjLmF4ZSk7XG4gIGlmIChjLmFkZGl0aW9uKSBwYXJ0cy5wdXNoKFwiQWRkIFwiICsgYy5hZGRpdGlvbik7XG4gIHJldHVybiBwYXJ0cy5qb2luKFwiICBcIik7XG59XG5cbmZ1bmN0aW9uIG1ha2VEcmFnZ2FibGUoaG9zdCwgaGFuZGxlKSB7XG4gIHZhciBzdGFydFgsIHN0YXJ0WSwgb3JpZ1gsIG9yaWdZLCBkcmFnZ2luZztcbiAgaGFuZGxlLnN0eWxlLmN1cnNvciA9IFwiZ3JhYlwiO1xuXG4gIGhhbmRsZS5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgc3RhcnRYID0gZS5jbGllbnRYO1xuICAgIHN0YXJ0WSA9IGUuY2xpZW50WTtcbiAgICBvcmlnWCA9IHBhcnNlSW50KGhvc3Quc3R5bGUubGVmdCkgfHwgMDtcbiAgICBvcmlnWSA9IHBhcnNlSW50KGhvc3Quc3R5bGUudG9wKSB8fCAwO1xuICAgIGRyYWdnaW5nID0gZmFsc2U7XG4gICAgaGFuZGxlLnN0eWxlLmN1cnNvciA9IFwiZ3JhYmJpbmdcIjtcblxuICAgIGZ1bmN0aW9uIG9uTW92ZShlMikge1xuICAgICAgdmFyIGR4ID0gZTIuY2xpZW50WCAtIHN0YXJ0WDtcbiAgICAgIHZhciBkeSA9IGUyLmNsaWVudFkgLSBzdGFydFk7XG4gICAgICBpZiAoIWRyYWdnaW5nICYmIChNYXRoLmFicyhkeCkgPiAzIHx8IE1hdGguYWJzKGR5KSA+IDMpKSB7XG4gICAgICAgIGRyYWdnaW5nID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGhvc3Quc3R5bGUubGVmdCA9IChvcmlnWCArIGR4KSArIFwicHhcIjtcbiAgICAgIGhvc3Quc3R5bGUudG9wID0gKG9yaWdZICsgZHkpICsgXCJweFwiO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uVXAoKSB7XG4gICAgICBoYW5kbGUuc3R5bGUuY3Vyc29yID0gXCJncmFiXCI7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIG9uTW92ZSk7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBvblVwKTtcbiAgICAgIGlmIChkcmFnZ2luZykge1xuICAgICAgICBoYW5kbGUuX3dhc0RyYWdnZWQgPSB0cnVlO1xuICAgICAgICBzYXZlU3RhdGUoaG9zdCwgbnVsbCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBvbk1vdmUpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIG9uVXApO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gc2F2ZVN0YXRlKGhvc3QsIG1vZGUpIHtcbiAgdmFyIHN0YXRlID0ge1xuICAgIHg6IHBhcnNlSW50KGhvc3Quc3R5bGUubGVmdCkgfHwgMCxcbiAgICB5OiBwYXJzZUludChob3N0LnN0eWxlLnRvcCkgfHwgMCxcbiAgfTtcbiAgaWYgKG1vZGUgIT09IG51bGwpIHN0YXRlLm1vZGUgPSBtb2RlO1xuXG4gIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbQ0NfU1RPUkFHRV9LRVldLCBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICB2YXIgcHJldiA9IHJlc3VsdFtDQ19TVE9SQUdFX0tFWV0gfHwge307XG4gICAgdmFyIG1lcmdlZCA9IE9iamVjdC5hc3NpZ24oe30sIHByZXYsIHN0YXRlKTtcbiAgICB2YXIgb2JqID0ge307XG4gICAgb2JqW0NDX1NUT1JBR0VfS0VZXSA9IG1lcmdlZDtcbiAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQob2JqKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldENvbW1hbmRDZW50ZXJDU1MoKSB7XG4gIHJldHVybiBbXG4gICAgLyogQW5pbWF0aW9ucyAqL1xuICAgIFwiQGtleWZyYW1lcyBvcHRpYm90UHVsc2Uge1wiLFxuICAgIFwiICAwJSB7IGJveC1zaGFkb3c6IDAgMCAwIDAgcmdiYSgxNiwxODUsMTI5LDAuNSk7IH1cIixcbiAgICBcIiAgNzAlIHsgYm94LXNoYWRvdzogMCAwIDAgNnB4IHJnYmEoMTYsMTg1LDEyOSwwKTsgfVwiLFxuICAgIFwiICAxMDAlIHsgYm94LXNoYWRvdzogMCAwIDAgMCByZ2JhKDE2LDE4NSwxMjksMCk7IH1cIixcbiAgICBcIn1cIixcbiAgICBcIkBrZXlmcmFtZXMgb3B0aWJvdEZhZGVJbiB7XCIsXG4gICAgXCIgIGZyb20geyBvcGFjaXR5OiAwOyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoOHB4KTsgfVwiLFxuICAgIFwiICB0byB7IG9wYWNpdHk6IDE7IHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTsgfVwiLFxuICAgIFwifVwiLFxuICAgIFwiQGtleWZyYW1lcyBvcHRpYm90RG90Rmxhc2gge1wiLFxuICAgIFwiICAwJSB7IGJveC1zaGFkb3c6IDAgMCAwIDAgcmdiYSgxNiwxODUsMTI5LDAuNyk7IH1cIixcbiAgICBcIiAgNTAlIHsgYm94LXNoYWRvdzogMCAwIDEycHggNHB4IHJnYmEoMTYsMTg1LDEyOSwwLjUpOyB9XCIsXG4gICAgXCIgIDEwMCUgeyBib3gtc2hhZG93OiAwIDAgMCAwIHJnYmEoMTYsMTg1LDEyOSwwKTsgfVwiLFxuICAgIFwifVwiLFxuXG4gICAgLyogQ29udGFpbmVyICovXG4gICAgXCIuY2MtY29udGFpbmVyIHtcIixcbiAgICBcIiAgd2lkdGg6IDMyMHB4O1wiLFxuICAgIFwiICBiYWNrZ3JvdW5kOiAjZmZmO1wiLFxuICAgIFwiICBib3JkZXI6IDFweCBzb2xpZCAjZTJlOGYwO1wiLFxuICAgIFwiICBib3JkZXItcmFkaXVzOiAxNnB4O1wiLFxuICAgIFwiICBib3gtc2hhZG93OiAwIDhweCAzMHB4IHJnYmEoMCwwLDAsMC4xMik7XCIsXG4gICAgXCIgIGZvbnQtZmFtaWx5OiAtYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgc2Fucy1zZXJpZjtcIixcbiAgICBcIiAgZm9udC1zaXplOiAxMnB4O1wiLFxuICAgIFwiICBjb2xvcjogIzFlMjkzYjtcIixcbiAgICBcIiAgb3ZlcmZsb3c6IGhpZGRlbjtcIixcbiAgICBcIiAgdXNlci1zZWxlY3Q6IG5vbmU7XCIsXG4gICAgXCIgIHRyYW5zaXRpb246IGFsbCAwLjI1cyBjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpO1wiLFxuICAgIFwiICBhbmltYXRpb246IG9wdGlib3RGYWRlSW4gMC4zcyBlYXNlLW91dDtcIixcbiAgICBcIn1cIixcblxuICAgIC8qIE1pbmltaXplZCBjb250YWluZXIgKi9cbiAgICBcIi5jYy1jb250YWluZXIuY2MtbWluaW1pemVkIHtcIixcbiAgICBcIiAgd2lkdGg6IDQwcHg7XCIsXG4gICAgXCIgIGhlaWdodDogNDBweDtcIixcbiAgICBcIiAgYm9yZGVyOiBub25lO1wiLFxuICAgIFwiICBib3JkZXItcmFkaXVzOiA1MCU7XCIsXG4gICAgXCIgIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1wiLFxuICAgIFwiICBib3gtc2hhZG93OiBub25lO1wiLFxuICAgIFwiICBvdmVyZmxvdzogdmlzaWJsZTtcIixcbiAgICBcIn1cIixcblxuICAgIC8qIE1pbmkgYnV0dG9uICovXG4gICAgXCIuY2MtbWluaS1idG4ge1wiLFxuICAgIFwiICBwb3NpdGlvbjogcmVsYXRpdmU7XCIsXG4gICAgXCIgIHdpZHRoOiA0MHB4O1wiLFxuICAgIFwiICBoZWlnaHQ6IDQwcHg7XCIsXG4gICAgXCIgIGJvcmRlci1yYWRpdXM6IDUwJTtcIixcbiAgICBcIiAgYmFja2dyb3VuZDogIzI1NjNlYjtcIixcbiAgICBcIiAgZGlzcGxheTogZmxleDtcIixcbiAgICBcIiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcIixcbiAgICBcIiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XCIsXG4gICAgXCIgIGN1cnNvcjogcG9pbnRlcjtcIixcbiAgICBcIiAgYm94LXNoYWRvdzogMCA0cHggMTRweCByZ2JhKDM3LDk5LDIzNSwwLjQpO1wiLFxuICAgIFwiICB0cmFuc2l0aW9uOiBib3gtc2hhZG93IDAuMjVzIGN1YmljLWJlemllcigwLjQsIDAsIDAuMiwgMSksIHRyYW5zZm9ybSAwLjI1cyBjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpO1wiLFxuICAgIFwiICBhbmltYXRpb246IG9wdGlib3RGYWRlSW4gMC4zcyBlYXNlLW91dDtcIixcbiAgICBcIn1cIixcbiAgICBcIi5jYy1taW5pLWJ0bjpob3ZlciB7XCIsXG4gICAgXCIgIGJveC1zaGFkb3c6IDAgNnB4IDIwcHggcmdiYSgzNyw5OSwyMzUsMC41NSk7XCIsXG4gICAgXCIgIHRyYW5zZm9ybTogc2NhbGUoMS4wOCk7XCIsXG4gICAgXCJ9XCIsXG4gICAgXCIuY2MtbWluaS1sZXR0ZXIge1wiLFxuICAgIFwiICBjb2xvcjogI2ZmZjtcIixcbiAgICBcIiAgZm9udC1mYW1pbHk6IC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBzYW5zLXNlcmlmO1wiLFxuICAgIFwiICBmb250LXNpemU6IDE4cHg7XCIsXG4gICAgXCIgIGZvbnQtd2VpZ2h0OiA4MDA7XCIsXG4gICAgXCIgIGxpbmUtaGVpZ2h0OiAxO1wiLFxuICAgIFwiICBwb2ludGVyLWV2ZW50czogbm9uZTtcIixcbiAgICBcIn1cIixcbiAgICBcIi5jYy1taW5pLWRvdCB7XCIsXG4gICAgXCIgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcIixcbiAgICBcIiAgdG9wOiAtMXB4O1wiLFxuICAgIFwiICByaWdodDogLTFweDtcIixcbiAgICBcIiAgd2lkdGg6IDEwcHg7XCIsXG4gICAgXCIgIGhlaWdodDogMTBweDtcIixcbiAgICBcIiAgYm9yZGVyLXJhZGl1czogNTAlO1wiLFxuICAgIFwiICBib3JkZXI6IDJweCBzb2xpZCAjZmZmO1wiLFxuICAgIFwiICBwb2ludGVyLWV2ZW50czogbm9uZTtcIixcbiAgICBcIn1cIixcblxuICAgIC8qIEhlYWRlciAqL1xuICAgIFwiLmNjLWhlYWRlciB7XCIsXG4gICAgXCIgIGRpc3BsYXk6IGZsZXg7XCIsXG4gICAgXCIgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XCIsXG4gICAgXCIgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcIixcbiAgICBcIiAgcGFkZGluZzogMTBweCAxNHB4O1wiLFxuICAgIFwiICBiYWNrZ3JvdW5kOiAjMWUyOTNiO1wiLFxuICAgIFwiICBjb2xvcjogI2ZmZjtcIixcbiAgICBcIn1cIixcbiAgICBcIi5jYy1sb2dvLXdyYXAge1wiLFxuICAgIFwiICBkaXNwbGF5OiBmbGV4O1wiLFxuICAgIFwiICBhbGlnbi1pdGVtczogY2VudGVyO1wiLFxuICAgIFwiICBnYXA6IDhweDtcIixcbiAgICBcIn1cIixcbiAgICBcIi5jYy1sb2dvIHtcIixcbiAgICBcIiAgZm9udC13ZWlnaHQ6IDgwMDtcIixcbiAgICBcIiAgZm9udC1zaXplOiAxM3B4O1wiLFxuICAgIFwiICBsZXR0ZXItc3BhY2luZzogLTAuM3B4O1wiLFxuICAgIFwifVwiLFxuXG4gICAgLyogU3RhdHVzIGRvdCAqL1xuICAgIFwiLmNjLXN0YXR1cy1kb3Qge1wiLFxuICAgIFwiICB3aWR0aDogOHB4O1wiLFxuICAgIFwiICBoZWlnaHQ6IDhweDtcIixcbiAgICBcIiAgYm9yZGVyLXJhZGl1czogNTAlO1wiLFxuICAgIFwiICBmbGV4LXNocmluazogMDtcIixcbiAgICBcIn1cIixcbiAgICBcIi5jYy1kb3QtcHVsc2Uge1wiLFxuICAgIFwiICBhbmltYXRpb246IG9wdGlib3RQdWxzZSAycyBpbmZpbml0ZTtcIixcbiAgICBcIn1cIixcbiAgICBcIi5jYy1kb3QtZmxhc2gge1wiLFxuICAgIFwiICBhbmltYXRpb246IG9wdGlib3REb3RGbGFzaCAxLjVzIGVhc2Utb3V0ICFpbXBvcnRhbnQ7XCIsXG4gICAgXCJ9XCIsXG5cbiAgICAvKiBIZWFkZXIgYnV0dG9ucyAqL1xuICAgIFwiLmNjLWhlYWRlci1idG5zIHtcIixcbiAgICBcIiAgZGlzcGxheTogZmxleDtcIixcbiAgICBcIiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcIixcbiAgICBcIiAgZ2FwOiAycHg7XCIsXG4gICAgXCJ9XCIsXG4gICAgXCIuY2MtYnRuLXRvZ2dsZSB7XCIsXG4gICAgXCIgIGJhY2tncm91bmQ6IG5vbmU7XCIsXG4gICAgXCIgIGJvcmRlcjogbm9uZTtcIixcbiAgICBcIiAgY29sb3I6ICM5NGEzYjg7XCIsXG4gICAgXCIgIGN1cnNvcjogcG9pbnRlcjtcIixcbiAgICBcIiAgZm9udC1zaXplOiAxMXB4O1wiLFxuICAgIFwiICBwYWRkaW5nOiA0cHggOHB4O1wiLFxuICAgIFwiICBib3JkZXItcmFkaXVzOiA2cHg7XCIsXG4gICAgXCIgIHRyYW5zaXRpb246IGJhY2tncm91bmQgMC4xNXMsIGNvbG9yIDAuMTVzO1wiLFxuICAgIFwifVwiLFxuICAgIFwiLmNjLWJ0bi10b2dnbGU6aG92ZXIgeyBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwyNTUsMjU1LDAuMSk7IGNvbG9yOiAjZmZmOyB9XCIsXG4gICAgXCIuY2MtYnRuLW1pbmltaXplIHtcIixcbiAgICBcIiAgZm9udC1zaXplOiAxNHB4O1wiLFxuICAgIFwiICBsaW5lLWhlaWdodDogMTtcIixcbiAgICBcIiAgcGFkZGluZzogNHB4IDZweDtcIixcbiAgICBcIn1cIixcblxuICAgIC8qIFNlY3Rpb25zICovXG4gICAgXCIuY2Mtc2VjdGlvbiB7IHBhZGRpbmc6IDhweCAxNHB4OyBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2YxZjVmOTsgfVwiLFxuICAgIFwiLmNjLXNlY3Rpb24tdGl0bGUge1wiLFxuICAgIFwiICBmb250LXNpemU6IDEwcHg7XCIsXG4gICAgXCIgIGZvbnQtd2VpZ2h0OiA4MDA7XCIsXG4gICAgXCIgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XCIsXG4gICAgXCIgIGxldHRlci1zcGFjaW5nOiAwLjVweDtcIixcbiAgICBcIiAgY29sb3I6ICM5NGEzYjg7XCIsXG4gICAgXCIgIG1hcmdpbi1ib3R0b206IDZweDtcIixcbiAgICBcIn1cIixcbiAgICBcIi5jYy1maWVsZCB7XCIsXG4gICAgXCIgIGRpc3BsYXk6IGZsZXg7XCIsXG4gICAgXCIgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XCIsXG4gICAgXCIgIGdhcDogNnB4O1wiLFxuICAgIFwiICBwYWRkaW5nOiAzcHggMDtcIixcbiAgICBcIn1cIixcbiAgICBcIi5jYy1sYWJlbCB7XCIsXG4gICAgXCIgIGZvbnQtc2l6ZTogMTFweDtcIixcbiAgICBcIiAgZm9udC13ZWlnaHQ6IDYwMDtcIixcbiAgICBcIiAgY29sb3I6ICM2NDc0OGI7XCIsXG4gICAgXCIgIG1pbi13aWR0aDogODBweDtcIixcbiAgICBcIiAgZmxleC1zaHJpbms6IDA7XCIsXG4gICAgXCJ9XCIsXG4gICAgXCIuY2MtdmFsdWUge1wiLFxuICAgIFwiICBmb250LXNpemU6IDEycHg7XCIsXG4gICAgXCIgIGZvbnQtd2VpZ2h0OiA3MDA7XCIsXG4gICAgXCIgIGNvbG9yOiAjMWUyOTNiO1wiLFxuICAgIFwiICBmbGV4OiAxO1wiLFxuICAgIFwiICBvdmVyZmxvdzogaGlkZGVuO1wiLFxuICAgIFwiICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcIixcbiAgICBcIiAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcIixcbiAgICBcIn1cIixcbiAgICBcIi5jYy1idG4tY29weSB7XCIsXG4gICAgXCIgIGJhY2tncm91bmQ6IG5vbmU7XCIsXG4gICAgXCIgIGJvcmRlcjogbm9uZTtcIixcbiAgICBcIiAgY3Vyc29yOiBwb2ludGVyO1wiLFxuICAgIFwiICBmb250LXNpemU6IDEzcHg7XCIsXG4gICAgXCIgIGNvbG9yOiAjOTRhM2I4O1wiLFxuICAgIFwiICBwYWRkaW5nOiAycHggNHB4O1wiLFxuICAgIFwiICBib3JkZXItcmFkaXVzOiA0cHg7XCIsXG4gICAgXCIgIGZsZXgtc2hyaW5rOiAwO1wiLFxuICAgIFwiICB0cmFuc2l0aW9uOiBiYWNrZ3JvdW5kIDAuMTVzLCBjb2xvciAwLjE1cztcIixcbiAgICBcIn1cIixcbiAgICBcIi5jYy1idG4tY29weTpob3ZlciB7IGJhY2tncm91bmQ6ICNmMWY1Zjk7IGNvbG9yOiAjM2I4MmY2OyB9XCIsXG5cbiAgICAvKiBBY3Rpb25zICovXG4gICAgXCIuY2MtYWN0aW9ucyB7XCIsXG4gICAgXCIgIGRpc3BsYXk6IGZsZXg7XCIsXG4gICAgXCIgIGdhcDogOHB4O1wiLFxuICAgIFwiICBwYWRkaW5nOiAxMHB4IDE0cHg7XCIsXG4gICAgXCJ9XCIsXG4gICAgXCIuY2MtYnRuIHtcIixcbiAgICBcIiAgZmxleDogMTtcIixcbiAgICBcIiAgcGFkZGluZzogOHB4IDEycHg7XCIsXG4gICAgXCIgIGJvcmRlcjogbm9uZTtcIixcbiAgICBcIiAgYm9yZGVyLXJhZGl1czogMTBweDtcIixcbiAgICBcIiAgZm9udC1zaXplOiAxMnB4O1wiLFxuICAgIFwiICBmb250LXdlaWdodDogNzAwO1wiLFxuICAgIFwiICBjdXJzb3I6IHBvaW50ZXI7XCIsXG4gICAgXCIgIHRyYW5zaXRpb246IGFsbCAwLjJzIGN1YmljLWJlemllcigwLjQsIDAsIDAuMiwgMSk7XCIsXG4gICAgXCJ9XCIsXG4gICAgXCIuY2MtYnRuOmhvdmVyIHtcIixcbiAgICBcIiAgdHJhbnNmb3JtOiBzY2FsZSgxLjAzKTtcIixcbiAgICBcIiAgYm94LXNoYWRvdzogMCA0cHggMTJweCByZ2JhKDAsMCwwLDAuMTUpO1wiLFxuICAgIFwifVwiLFxuICAgIFwiLmNjLWJ0bi1maWxsIHsgYmFja2dyb3VuZDogIzI1NjNlYjsgY29sb3I6ICNmZmY7IH1cIixcbiAgICBcIi5jYy1idG4tZmlsbDpob3ZlciB7IGJhY2tncm91bmQ6ICMxZDRlZDg7IH1cIixcbiAgICBcIi5jYy1idG4tc2NhbiB7IGJhY2tncm91bmQ6ICNmMWY1Zjk7IGNvbG9yOiAjNDc1NTY5OyB9XCIsXG4gICAgXCIuY2MtYnRuLXNjYW46aG92ZXIgeyBiYWNrZ3JvdW5kOiAjZTJlOGYwOyB9XCIsXG4gICAgXCIuY2MtZW1wdHkge1wiLFxuICAgIFwiICBwYWRkaW5nOiAyMHB4IDE0cHg7XCIsXG4gICAgXCIgIHRleHQtYWxpZ246IGNlbnRlcjtcIixcbiAgICBcIiAgY29sb3I6ICM5NGEzYjg7XCIsXG4gICAgXCIgIGZvbnQtc2l6ZTogMTJweDtcIixcbiAgICBcIiAgZm9udC13ZWlnaHQ6IDUwMDtcIixcbiAgICBcIiAgbGluZS1oZWlnaHQ6IDEuNTtcIixcbiAgICBcIn1cIixcbiAgXS5qb2luKFwiXFxuXCIpO1xufVxuXG4vKiBFeHBvc2UgcG91ciBsJ2ltcG9ydCBkZXB1aXMgY29udGVudC9pbmRleC5qcyAqL1xuZ2xvYmFsVGhpcy5jcmVhdGVDb21tYW5kQ2VudGVyID0gY3JlYXRlQ29tbWFuZENlbnRlcjtcbiIsICIvKiBcdTI1MDBcdTI1MDAgVjMtOCA6IENhcHR1cmUgYXV0b21hdGlxdWUgZGUgZGV2aXMgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG4vKiBEZXRlY3RlIGV0IGNhcHR1cmUgbGVzIGRvbm5lZXMgZGUgZGV2aXMvY290YXRpb24gc3VyIGxlcyBwb3J0YWlscy4gICAgICAqL1xuXG4vKiBJbmRpY2F0ZXVycyBkZSBwYWdlIGRldmlzIFx1MjAxNCBtb3RzIHNwZWNpZmlxdWVzIHBvdXIgZXZpdGVyIGxlcyBmYXV4IHBvc2l0aWZzICovXG4vKiBMZXMgbW90cyBnZW5lcmlxdWVzIChtb250YW50LCBwcmlzZSBlbiBjaGFyZ2UpIHNvbnQgZXhjbHVzIGNhciBwcmVzZW50cyBzdXIgdG91dGUgcGFnZSBUUCAqL1xudmFyIERFVklTX0lORElDQVRPUlMgPSBbXG4gIFwiZGV2aXNcIiwgXCJjb3RhdGlvblwiLCBcInNpbXVsYXRpb24gZGV2aXNcIiwgXCJ0YXJpZmljYXRpb24gZGV2aXNcIixcbiAgXCJtb250dXJlXCIsIFwidmVycmUgY29ycmVjdGV1clwiLCBcInZlcnJlIHByb2dyZXNzaWZcIixcbiAgXCJwcml4IHRvdGFsXCIsIFwidG90YWwgdHRjXCIsIFwicmVzdGUgYSBjaGFyZ2VcIixcbiAgXCJjb2RlIGxwcFwiLCBcInF1b3RhdGlvblwiLFxuXTtcblxudmFyIERFVklTX0ZJRUxEX0FMSUFTRVMgPSB7XG4gIG1vbnR1cmVSZWY6ICAgICBbXCJtb250dXJlXCIsIFwicmVmX21vbnR1cmVcIiwgXCJyZWZlcmVuY2VfbW9udHVyZVwiLCBcImNvZGVfbW9udHVyZVwiLCBcImZyYW1lXCIsIFwibW9udHVyZV9yZWZcIiwgXCJmcmFtZV9yZWZcIiwgXCJmcmFtZV9yZWZlcmVuY2VcIl0sXG4gIG1vbnR1cmVNYXJxdWU6ICBbXCJtYXJxdWVfbW9udHVyZVwiLCBcImJyYW5kX21vbnR1cmVcIiwgXCJmYWJyaWNhbnRfbW9udHVyZVwiLCBcIm1hcnF1ZV9mcmFtZVwiLCBcIm1vbnR1cmVfbWFycXVlXCIsIFwiZnJhbWVfYnJhbmRcIl0sXG4gIG1vbnR1cmVQcml4OiAgICBbXCJwcml4X21vbnR1cmVcIiwgXCJtb250YW50X21vbnR1cmVcIiwgXCJwcmljZV9mcmFtZVwiLCBcImZyYW1lX3ByaWNlXCIsIFwiY291dF9tb250dXJlXCIsIFwidGFyaWZfbW9udHVyZVwiXSxcbiAgdmVycmVPRFJlZjogICAgIFtcInZlcnJlX29kXCIsIFwidmVycmVfZHJvaXRcIiwgXCJsZW5zX29kXCIsIFwibGVuc19yaWdodFwiLCBcInJlZl92ZXJyZV9vZFwiLCBcInZlcnJlX29kX3JlZlwiXSxcbiAgdmVycmVPR1JlZjogICAgIFtcInZlcnJlX29nXCIsIFwidmVycmVfZ2F1Y2hlXCIsIFwibGVuc19vZ1wiLCBcImxlbnNfbGVmdFwiLCBcInJlZl92ZXJyZV9vZ1wiLCBcInZlcnJlX29nX3JlZlwiXSxcbiAgdmVycmVQcml4OiAgICAgIFtcInByaXhfdmVycmVzXCIsIFwicHJpeF92ZXJyZVwiLCBcIm1vbnRhbnRfdmVycmVzXCIsIFwibGVuc19wcmljZVwiLCBcImNvdXRfdmVycmVzXCIsIFwidGFyaWZfdmVycmVzXCJdLFxuICBzdXBwbGVtZW50UmVmOiAgW1wic3VwcGxlbWVudFwiLCBcInRyYWl0ZW1lbnRcIiwgXCJhbnRpX3JlZmxldFwiLCBcImNvYXRpbmdcIiwgXCJvcHRpb25cIiwgXCJzdXJjaGFyZ2VcIiwgXCJhbnRpcmVmbGV0XCIsIFwicGhvdG9jaHJvbWlxdWVcIiwgXCJhbnRpX2x1bWllcmVfYmxldWVcIl0sXG4gIHN1cHBsZW1lbnRQcml4OiBbXCJwcml4X3N1cHBsZW1lbnRcIiwgXCJtb250YW50X3N1cHBsZW1lbnRcIiwgXCJwcml4X3RyYWl0ZW1lbnRcIiwgXCJwcml4X29wdGlvblwiLCBcInRhcmlmX3N1cHBsZW1lbnRcIl0sXG4gIHRvdGFsVFRDOiAgICAgICBbXCJ0b3RhbFwiLCBcInRvdGFsX3R0Y1wiLCBcIm1vbnRhbnRfdG90YWxcIiwgXCJwcml4X3RvdGFsXCIsIFwidG90YWxfZ2VuZXJhbFwiLCBcIm5ldF9hX3BheWVyXCIsIFwibW9udGFudF9kZXZpc1wiXSxcbiAgcGFydE11dHVlbGxlOiAgIFtcInBhcnRfbXV0dWVsbGVcIiwgXCJwcmlzZV9lbl9jaGFyZ2VcIiwgXCJyZW1ib3Vyc2VtZW50XCIsIFwibW9udGFudF9yZW1ib3Vyc2VcIiwgXCJwYXJ0X2FtY1wiLCBcInBhcnRfY29tcGxlbWVudGFpcmVcIiwgXCJwYXJ0X3JjXCJdLFxuICBwYXJ0U2VjdTogICAgICAgW1wicGFydF9zZWN1XCIsIFwicGFydF9hbW9cIiwgXCJyZW1ib3Vyc2VtZW50X3NlY3VcIiwgXCJiYXNlX3NlY3VcIiwgXCJwYXJ0X3NlY3VyaXRlX3NvY2lhbGVcIiwgXCJyZW1ib3Vyc2VtZW50X2Ftb1wiXSxcbiAgcmVzdGVBQ2hhcmdlOiAgIFtcInJlc3RlX2FfY2hhcmdlXCIsIFwicmFjXCIsIFwicmVzdGVfY2hhcmdlXCIsIFwiYV9wYXllclwiLCBcIm1vbnRhbnRfcmFjXCIsIFwicmVzdGVcIiwgXCJzb2xkZV9wYXRpZW50XCJdLFxuICBjb2RlTFBQOiAgICAgICAgW1wiY29kZV9scHBcIiwgXCJscHBcIiwgXCJjb2RlX3ByZXN0YXRpb25cIiwgXCJjb2RlX2FjdGVcIiwgXCJscHBfY29kZVwiXSxcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXRlY3REZXZpc1BhZ2UoKSB7XG4gIHZhciB0ZXh0ID0gKGRvY3VtZW50LnRpdGxlICsgXCIgXCIgKyBkb2N1bWVudC5ib2R5LmlubmVyVGV4dC5zdWJzdHJpbmcoMCwgMzAwMCkpLnRvTG93ZXJDYXNlKCk7XG4gIHZhciBtYXRjaENvdW50ID0gMDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBERVZJU19JTkRJQ0FUT1JTLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHRleHQuaW5kZXhPZihERVZJU19JTkRJQ0FUT1JTW2ldKSAhPT0gLTEpIG1hdGNoQ291bnQrKztcbiAgfVxuICAvKiBBdSBtb2lucyA0IGluZGljYXRldXJzIHNwZWNpZmlxdWVzIHBvdXIgZXZpdGVyIGxlcyBmYXV4IHBvc2l0aWZzIHN1ciBsZXMgcGFnZXMgVFAgKi9cbiAgcmV0dXJuIG1hdGNoQ291bnQgPj0gNDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhcHR1cmVEZXZpcygpIHtcbiAgaWYgKCFkZXRlY3REZXZpc1BhZ2UoKSkgcmV0dXJuIG51bGw7XG5cbiAgdmFyIHJlc3VsdCA9IHt9O1xuICB2YXIgaW5wdXRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcImlucHV0LCBzZWxlY3QsIHRleHRhcmVhLCBzcGFuLCB0ZCwgZGQsIFtjbGFzcyo9dmFsdWVdLCBbY2xhc3MqPXByaXhdLCBbY2xhc3MqPW1vbnRhbnRdXCIpO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaW5wdXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGVsID0gaW5wdXRzW2ldO1xuICAgIHZhciB2YWw7XG4gICAgaWYgKGVsLnRhZ05hbWUgPT09IFwiSU5QVVRcIiB8fCBlbC50YWdOYW1lID09PSBcIlNFTEVDVFwiIHx8IGVsLnRhZ05hbWUgPT09IFwiVEVYVEFSRUFcIikge1xuICAgICAgdmFsID0gKGVsLnZhbHVlIHx8IFwiXCIpLnRyaW0oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsID0gKGVsLnRleHRDb250ZW50IHx8IFwiXCIpLnRyaW0oKTtcbiAgICB9XG4gICAgaWYgKCF2YWwgfHwgdmFsLmxlbmd0aCA+IDEwMCkgY29udGludWU7XG5cbiAgICAvKiBTaWduYWwgY29sbGVjdGlvbiBzaW1wbGlmaWUgKi9cbiAgICB2YXIgc2lnbmFscyA9IFtcbiAgICAgIGVsLm5hbWUsIGVsLmlkLCBlbC5wbGFjZWhvbGRlcixcbiAgICAgIGVsLmdldEF0dHJpYnV0ZShcImFyaWEtbGFiZWxcIiksXG4gICAgICBlbC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWZpZWxkXCIpLFxuICAgICAgZWwuY2xhc3NOYW1lLFxuICAgIF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oXCIgXCIpLnRvTG93ZXJDYXNlKCkubm9ybWFsaXplKFwiTkZEXCIpLnJlcGxhY2UoL1tcXHUwMzAwLVxcdTAzNmZdL2csIFwiXCIpLnJlcGxhY2UoL1tcXHNcXC1fXFwuXS9nLCBcIlwiKTtcblxuICAgIGZvciAodmFyIGZpZWxkIGluIERFVklTX0ZJRUxEX0FMSUFTRVMpIHtcbiAgICAgIGlmIChyZXN1bHRbZmllbGRdKSBjb250aW51ZTtcbiAgICAgIHZhciBhbGlhc2VzID0gREVWSVNfRklFTERfQUxJQVNFU1tmaWVsZF07XG4gICAgICBmb3IgKHZhciBhID0gMDsgYSA8IGFsaWFzZXMubGVuZ3RoOyBhKyspIHtcbiAgICAgICAgdmFyIG5vcm0gPSBhbGlhc2VzW2FdLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvW1xcc1xcLV9cXC5dL2csIFwiXCIpO1xuICAgICAgICBpZiAoc2lnbmFscy5pbmRleE9mKG5vcm0pICE9PSAtMSkge1xuICAgICAgICAgIHJlc3VsdFtmaWVsZF0gPSB2YWw7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiBEZXRlY3RlciBhdXNzaSBsZXMgcHJpeCBkYW5zIGRlcyBlbGVtZW50cyBzcGVjaWZpcXVlcyAqL1xuICB2YXIgcHJpY2VFbHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiW2NsYXNzKj10b3RhbF0sIFtjbGFzcyo9cHJpeF0sIFtjbGFzcyo9bW9udGFudF0sIFtjbGFzcyo9cHJpY2VdLCBbaWQqPXRvdGFsXSwgW2lkKj1wcml4XVwiKTtcbiAgZm9yICh2YXIgcCA9IDA7IHAgPCBwcmljZUVscy5sZW5ndGg7IHArKykge1xuICAgIHZhciBwVGV4dCA9IChwcmljZUVsc1twXS50ZXh0Q29udGVudCB8fCBcIlwiKS50cmltKCk7XG4gICAgdmFyIHByaWNlTWF0Y2ggPSBwVGV4dC5tYXRjaCgvKFxcZCtbLixdXFxkezJ9KVxccypcdTIwQUM/Lyk7XG4gICAgaWYgKHByaWNlTWF0Y2ggJiYgIXJlc3VsdC50b3RhbFRUQykge1xuICAgICAgcmVzdWx0LnRvdGFsVFRDID0gcHJpY2VNYXRjaFsxXTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gT2JqZWN0LmtleXMocmVzdWx0KS5sZW5ndGggPj0gMiA/IHJlc3VsdCA6IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzeW5jRGV2aXNUb0JhY2tlbmQoZGV2aXMpIHtcbiAgaWYgKCFkZXZpcykgcmV0dXJuO1xuXG4gIGlmICh0eXBlb2YgZ2V0U3luY1Rva2VuID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBnZXRTeW5jVG9rZW4oKS50aGVuKGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICBpZiAoIXRva2VuKSByZXR1cm47XG4gICAgICBmZXRjaChcImh0dHBzOi8vb3B0aWJvdC5mci9hcGkvZXh0ZW5zaW9uL2RldmlzXCIsIHtcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgIFwiQXV0aG9yaXphdGlvblwiOiBcIkJlYXJlciBcIiArIHRva2VuLFxuICAgICAgICB9LFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgaG9zdG5hbWU6IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSxcbiAgICAgICAgICBkZXZpczogZGV2aXMsXG4gICAgICAgICAgdXJsOiB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUsXG4gICAgICAgICAgdHM6IERhdGUubm93KCksXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIHNob3dEZXZpc1RvYXN0KFwiRGV2aXMgY2FwdHVyZSBcdTIwMTQgXCIgKyAoZGV2aXMudG90YWxUVEMgfHwgXCJtb250YW50IGluY29ubnVcIikgKyBcIiBFVVJcIiwgXCJzdWNjZXNzXCIpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnIpIHsgY29uc29sZS53YXJuKFwiW09wdGlCb3RdIGRldmlzIHN5bmMgZmFpbGVkOlwiLCBlcnIpOyB9KTtcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzaG93RGV2aXNUb2FzdChtZXNzYWdlLCB0eXBlKSB7XG4gIHZhciBleGlzdGluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwib3B0aWJvdC1kZXZpcy10b2FzdFwiKTtcbiAgaWYgKGV4aXN0aW5nKSBleGlzdGluZy5yZW1vdmUoKTtcblxuICB2YXIgdG9hc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICB0b2FzdC5pZCA9IFwib3B0aWJvdC1kZXZpcy10b2FzdFwiO1xuICB0b2FzdC50ZXh0Q29udGVudCA9IG1lc3NhZ2U7XG4gIHZhciBiZyA9IHR5cGUgPT09IFwic3VjY2Vzc1wiID8gXCIjMDU5NjY5XCIgOiBcIiNkOTc3MDZcIjtcbiAgdG9hc3Quc3R5bGUuY3NzVGV4dCA9IFwicG9zaXRpb246Zml4ZWQ7Ym90dG9tOjcwcHg7cmlnaHQ6MjRweDt6LWluZGV4OjIxNDc0ODM2NDc7YmFja2dyb3VuZDpcIiArIGJnICsgXCI7Y29sb3I6d2hpdGU7cGFkZGluZzoxMHB4IDE2cHg7Ym9yZGVyLXJhZGl1czoxMHB4O2ZvbnQ6NjAwIDEycHgvMS40IC1hcHBsZS1zeXN0ZW0sQmxpbmtNYWNTeXN0ZW1Gb250LHNhbnMtc2VyaWY7Ym94LXNoYWRvdzowIDRweCAxNnB4IHJnYmEoMCwwLDAsLjEyKTtvcGFjaXR5OjA7dHJhbnNpdGlvbjpvcGFjaXR5IC4zcztcIjtcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0b2FzdCk7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHsgdG9hc3Quc3R5bGUub3BhY2l0eSA9IFwiMVwiOyB9KTtcbiAgc2V0VGltZW91dChmdW5jdGlvbigpIHsgdG9hc3Quc3R5bGUub3BhY2l0eSA9IFwiMFwiOyBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyB0b2FzdC5yZW1vdmUoKTsgfSwgMzAwKTsgfSwgNTAwMCk7XG59XG5cbi8qIFx1MjUwMFx1MjUwMCBBdXRvLWRldGVjdGlvbiBhdmVjIE11dGF0aW9uT2JzZXJ2ZXIgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG52YXIgX2RldmlzRGV0ZWN0ZWQgPSBmYWxzZTtcblxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwRGV2aXNEZXRlY3Rpb24oKSB7XG4gIC8qIFRlbnRhdGl2ZSBpbml0aWFsZSBhcHJlcyAzcyAqL1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgIHZhciBkZXZpcyA9IGNhcHR1cmVEZXZpcygpO1xuICAgIGlmIChkZXZpcykgeyBfZGV2aXNEZXRlY3RlZCA9IHRydWU7IHN5bmNEZXZpc1RvQmFja2VuZChkZXZpcyk7IH1cbiAgfSwgMzAwMCk7XG5cbiAgLyogT2JzZXJ2ZXIgcG91ciBTUEEgKi9cbiAgaWYgKGRvY3VtZW50LmJvZHkpIHtcbiAgICB2YXIgdGltZXIgPSBudWxsO1xuICAgIHZhciBvYnMgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbihtdXRhdGlvbnMpIHtcbiAgICAgIGlmIChfZGV2aXNEZXRlY3RlZCkgcmV0dXJuO1xuICAgICAgdmFyIGhhc05ldyA9IG11dGF0aW9ucy5zb21lKGZ1bmN0aW9uKG0pIHsgcmV0dXJuIG0uYWRkZWROb2Rlcy5sZW5ndGggPiAwOyB9KTtcbiAgICAgIGlmIChoYXNOZXcpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBkZXZpcyA9IGNhcHR1cmVEZXZpcygpO1xuICAgICAgICAgIGlmIChkZXZpcykgeyBfZGV2aXNEZXRlY3RlZCA9IHRydWU7IHN5bmNEZXZpc1RvQmFja2VuZChkZXZpcyk7IH1cbiAgICAgICAgfSwgMjAwMCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgb2JzLm9ic2VydmUoZG9jdW1lbnQuYm9keSwgeyBjaGlsZExpc3Q6IHRydWUsIHN1YnRyZWU6IHRydWUgfSk7XG4gIH1cbn1cbiIsICIvKiBcdTI1MDBcdTI1MDAgRE9NIFV0aWxpdHkgRnVuY3Rpb25zIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuXG5leHBvcnQgZnVuY3Rpb24gcXVlcnlTZWxlY3RvckFsbERlZXAoc2VsZWN0b3IsIHJvb3QsIGRlcHRoKSB7XG4gIHJvb3QgPSByb290IHx8IGRvY3VtZW50O1xuICBkZXB0aCA9IGRlcHRoIHx8IDA7XG4gIGlmIChkZXB0aCA+IDUpIHJldHVybiBbXTtcbiAgdmFyIHJlc3VsdHMgPSBBcnJheS5mcm9tKHJvb3QucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpO1xuXG4gIC8vIFNoYWRvdyByb290c1xuICB2YXIgYWxsID0gcm9vdC5xdWVyeVNlbGVjdG9yQWxsKFwiKlwiKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbGwubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoYWxsW2ldLnNoYWRvd1Jvb3QpIHtcbiAgICAgIHJlc3VsdHMgPSByZXN1bHRzLmNvbmNhdChxdWVyeVNlbGVjdG9yQWxsRGVlcChzZWxlY3RvciwgYWxsW2ldLnNoYWRvd1Jvb3QsIGRlcHRoICsgMSkpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFNhbWUtb3JpZ2luIGlmcmFtZXMgKG9ubHkgZnJvbSBkb2N1bWVudCByb290LCBub3QgaW5zaWRlIHNoYWRvdylcbiAgaWYgKHJvb3QgPT09IGRvY3VtZW50ICYmIGRlcHRoID09PSAwKSB7XG4gICAgdmFyIGlmcmFtZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiaWZyYW1lXCIpO1xuICAgIGZvciAodmFyIGZpID0gMDsgZmkgPCBpZnJhbWVzLmxlbmd0aDsgZmkrKykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIGlEb2MgPSBpZnJhbWVzW2ZpXS5jb250ZW50RG9jdW1lbnQgfHwgKGlmcmFtZXNbZmldLmNvbnRlbnRXaW5kb3cgJiYgaWZyYW1lc1tmaV0uY29udGVudFdpbmRvdy5kb2N1bWVudCk7XG4gICAgICAgIGlmIChpRG9jKSByZXN1bHRzID0gcmVzdWx0cy5jb25jYXQocXVlcnlTZWxlY3RvckFsbERlZXAoc2VsZWN0b3IsIGlEb2MsIGRlcHRoICsgMSkpO1xuICAgICAgfSBjYXRjaChlKSB7IC8qIGNyb3NzLW9yaWdpbiAqLyB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdHM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kRWxlbWVudChzZWxlY3Rvcikge1xuICBpZiAoIXNlbGVjdG9yKSByZXR1cm4gbnVsbDtcbiAgdmFyIGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gIGlmIChlbCkgcmV0dXJuIGVsO1xuICB2YXIgaWZyYW1lcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJpZnJhbWVcIik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaWZyYW1lcy5sZW5ndGg7IGkrKykge1xuICAgIHRyeSB7XG4gICAgICB2YXIgaURvYyA9IGlmcmFtZXNbaV0uY29udGVudERvY3VtZW50O1xuICAgICAgaWYgKGlEb2MpIHsgZWwgPSBpRG9jLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpOyBpZiAoZWwpIHJldHVybiBlbDsgfVxuICAgIH0gY2F0Y2goZSkge31cbiAgfVxuICByZXR1cm4gZmluZEluU2hhZG93Um9vdHMoc2VsZWN0b3IsIGRvY3VtZW50KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRJblNoYWRvd1Jvb3RzKHNlbGVjdG9yLCByb290LCBkZXB0aCkge1xuICBpZiAoKGRlcHRoIHx8IDApID4gNSkgcmV0dXJuIG51bGw7XG4gIC8qIEVhcmx5IGV4aXQgOiB2XHUwMEU5cmlmaWVyIHNpIGRlcyBlbmZhbnRzIGRpcmVjdHMgb250IHVuIHNoYWRvd1Jvb3QgKi9cbiAgdmFyIGNoaWxkcmVuID0gQXJyYXkuZnJvbShyb290LmNoaWxkcmVuIHx8IFtdKTtcbiAgdmFyIGhhc1NoYWRvd0NoaWxkID0gY2hpbGRyZW4uc29tZShmdW5jdGlvbihjKSB7IHJldHVybiAhIWMuc2hhZG93Um9vdDsgfSk7XG4gIGlmICghaGFzU2hhZG93Q2hpbGQpIHtcbiAgICAvKiBWXHUwMEU5cmlmaWVyIGF1c3NpIGxlcyBkZXNjZW5kYW50cyBwcm9jaGVzIChtYXggMiBuaXZlYXV4KSBzYW5zIHF1ZXJ5U2VsZWN0b3JBbGwoXCIqXCIpICovXG4gICAgdmFyIGhhc0RlZXBTaGFkb3cgPSBjaGlsZHJlbi5zb21lKGZ1bmN0aW9uKGMpIHtcbiAgICAgIHJldHVybiBBcnJheS5mcm9tKGMuY2hpbGRyZW4gfHwgW10pLnNvbWUoZnVuY3Rpb24oZ2MpIHsgcmV0dXJuICEhZ2Muc2hhZG93Um9vdDsgfSk7XG4gICAgfSk7XG4gICAgaWYgKCFoYXNEZWVwU2hhZG93KSByZXR1cm4gbnVsbDtcbiAgfVxuICB2YXIgYWxsID0gcm9vdC5xdWVyeVNlbGVjdG9yQWxsKFwiKlwiKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbGwubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoYWxsW2ldLnNoYWRvd1Jvb3QpIHtcbiAgICAgIHZhciBmb3VuZCA9IGFsbFtpXS5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgaWYgKGZvdW5kKSByZXR1cm4gZm91bmQ7XG4gICAgICBmb3VuZCA9IGZpbmRJblNoYWRvd1Jvb3RzKHNlbGVjdG9yLCBhbGxbaV0uc2hhZG93Um9vdCwgKGRlcHRoIHx8IDApICsgMSk7XG4gICAgICBpZiAoZm91bmQpIHJldHVybiBmb3VuZDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qIHdhaXRGb3JFbGVtZW50IFx1MjAxNCBNdXRhdGlvbk9ic2VydmVyIGF1IGxpZXUgZHUgcG9sbGluZyBwb3VyIHJcdTAwRTlhZ2lyIGltbVx1MDBFOWRpYXRlbWVudCAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdhaXRGb3JFbGVtZW50KHNlbGVjdG9yLCB0aW1lb3V0TXMpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICAvKiBWXHUwMEU5cmlmaWNhdGlvbiBpbW1cdTAwRTlkaWF0ZSBkb2N1bWVudCArIGlmcmFtZXMgKi9cbiAgICB2YXIgZWwgPSBmaW5kRWxlbWVudChzZWxlY3Rvcik7XG4gICAgaWYgKGVsKSB7IHJlc29sdmUoZWwpOyByZXR1cm47IH1cblxuICAgIHZhciByZXNvbHZlZCA9IGZhbHNlO1xuICAgIHZhciBvYnNlcnZlciA9IG51bGw7XG4gICAgdmFyIHRpbWVyID0gbnVsbDtcblxuICAgIGZ1bmN0aW9uIGNsZWFudXAoKSB7XG4gICAgICBpZiAocmVzb2x2ZWQpIHJldHVybjtcbiAgICAgIHJlc29sdmVkID0gdHJ1ZTtcbiAgICAgIGlmIChvYnNlcnZlcikgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgaWYgKHRpbWVyKSBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNoZWNrKCkge1xuICAgICAgaWYgKHJlc29sdmVkKSByZXR1cm47XG4gICAgICB2YXIgZm91bmQgPSBmaW5kRWxlbWVudChzZWxlY3Rvcik7XG4gICAgICBpZiAoZm91bmQpIHtcbiAgICAgICAgY2xlYW51cCgpO1xuICAgICAgICByZXNvbHZlKGZvdW5kKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKiBNdXRhdGlvbk9ic2VydmVyIHBvdXIgclx1MDBFOWFnaXIgZFx1MDBFOHMgcXUndW4gblx1MDE1M3VkIGVzdCBham91dFx1MDBFOSAqL1xuICAgIHRyeSB7XG4gICAgICBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uKCkgeyBjaGVjaygpOyB9KTtcbiAgICAgIG9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuYm9keSB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsIHtcbiAgICAgICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgICAgICBzdWJ0cmVlOiB0cnVlLFxuICAgICAgICBhdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgICBhdHRyaWJ1dGVGaWx0ZXI6IFtcImlkXCIsIFwibmFtZVwiLCBcImNsYXNzXCIsIFwic3R5bGVcIiwgXCJoaWRkZW5cIiwgXCJkaXNhYmxlZFwiXSxcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgLyogRmFsbGJhY2sgcG9sbGluZyBzaSBNdXRhdGlvbk9ic2VydmVyIFx1MDBFOWNob3VlICovXG4gICAgICB2YXIgcG9sbEludGVydmFsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgICAgIGNoZWNrKCk7XG4gICAgICAgIGlmIChyZXNvbHZlZCkgY2xlYXJJbnRlcnZhbChwb2xsSW50ZXJ2YWwpO1xuICAgICAgfSwgMTUwKTtcbiAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgY2xlYXJJbnRlcnZhbChwb2xsSW50ZXJ2YWwpO1xuICAgICAgICBpZiAoIXJlc29sdmVkKSB7IHJlc29sdmVkID0gdHJ1ZTsgcmVzb2x2ZShudWxsKTsgfVxuICAgICAgfSwgdGltZW91dE1zIHx8IDUwMDApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8qIFBvbGxpbmcgZGUgc2Vjb3VycyB0b3V0ZXMgbGVzIDMwMG1zIChsZXMgaWZyYW1lcyBuZSBkXHUwMEU5Y2xlbmNoZW50IHBhcyBsZSBNdXRhdGlvbk9ic2VydmVyKSAqL1xuICAgIHZhciBpZnJhbWVQb2xsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7IGNoZWNrKCk7IH0sIDMwMCk7XG5cbiAgICAvKiBUaW1lb3V0ICovXG4gICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgY2xlYXJJbnRlcnZhbChpZnJhbWVQb2xsKTtcbiAgICAgIGNsZWFudXAoKTtcbiAgICAgIHJlc29sdmUobnVsbCk7XG4gICAgfSwgdGltZW91dE1zIHx8IDUwMDApO1xuICB9KTtcbn1cbiIsICIvKiBcdTI1MDBcdTI1MDAgRm9ybWF0IFV0aWxpdHkgRnVuY3Rpb25zICYgQ29uc3RhbnRzIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuXG5leHBvcnQgZnVuY3Rpb24gY2FwaXRhbGl6ZShzKSB7XG4gIGlmICghcykgcmV0dXJuIFwiXCI7XG4gIHJldHVybiBzLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcy5zbGljZSgxKS50b0xvd2VyQ2FzZSgpO1xufVxuXG4vKiBOb3JtYWxpc2UgdW4gbnVtXHUwMEU5cm8gZGUgdFx1MDBFOWxcdTAwRTlwaG9uZSBlbiAxMCBjaGlmZnJlcyBmcmFuXHUwMEU3YWlzIDpcbiAgICszMzYxMjM0NTY3OCBcdTIxOTIgMDYxMjM0NTY3OCB8IDAwMzM2MTIzNDU2NzggXHUyMTkyIDA2MTIzNDU2NzhcbiAgIFN1cHByaW1lIHRvdXQgY2UgcXVpIGRcdTAwRTlwYXNzZSAxMCBjaGlmZnJlcy4gUmV0b3VybmUgXCJcIiBzaSA8IDEwIGNoaWZmcmVzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVBob25lKHJhdykge1xuICBpZiAoIXJhdykgcmV0dXJuIFwiXCI7XG4gIHZhciBzID0gU3RyaW5nKHJhdykucmVwbGFjZSgvW1xccy5cXC0oKV0vZywgXCJcIik7XG4gIGlmIChzLnN0YXJ0c1dpdGgoXCIrMzNcIikpIHMgPSBcIjBcIiArIHMuc2xpY2UoMyk7XG4gIGVsc2UgaWYgKHMuc3RhcnRzV2l0aChcIjAwMzNcIikpIHMgPSBcIjBcIiArIHMuc2xpY2UoNCk7XG4gIHMgPSBzLnJlcGxhY2UoL1xcRC9nLCBcIlwiKTtcbiAgaWYgKHMubGVuZ3RoID4gMTApIHMgPSBzLnNsaWNlKDAsIDEwKTtcbiAgcmV0dXJuIHMubGVuZ3RoID09PSAxMCA/IHMgOiBcIlwiO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGV0ZWN0T3B0aWNhbEZvcm1hdChlbCkge1xuICB2YXIgcGggPSAoZWwucGxhY2Vob2xkZXIgfHwgXCJcIikudHJpbSgpO1xuICBpZiAoLywvLnRlc3QocGgpKSByZXR1cm4gXCJjb21tYVwiO1xuICBpZiAoL15cXGQvLnRlc3QocGgpKSByZXR1cm4gXCJub19wbHVzXCI7XG4gIHJldHVybiBcImRlZmF1bHRcIjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdE9wdGljYWxWYWx1ZSh2YWx1ZSwgZWwpIHtcbiAgdmFyIGZtdCA9IGRldGVjdE9wdGljYWxGb3JtYXQoZWwpO1xuICBpZiAoT1BUSUNBTF9GT1JNQVRURVJTW2ZtdF0pIHJldHVybiBPUFRJQ0FMX0ZPUk1BVFRFUlNbZm10XShTdHJpbmcodmFsdWUpKTtcbiAgcmV0dXJuIFN0cmluZyh2YWx1ZSk7XG59XG5cbi8qIFx1MjUwMFx1MjUwMCBWYWx1ZSBOb3JtYWxpemVycyBcdTIwMTQgZm9ybWF0YWdlIGFkYXB0XHUwMEU5IGF1IGNoYW1wIGNpYmxlIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuZXhwb3J0IHZhciBWQUxVRV9OT1JNQUxJWkVSUyA9IHtcbiAgbnVtZXJvU2VjdXJpdGVTb2NpYWxlOiBmdW5jdGlvbih2LCBlbCkge1xuICAgIHZhciByYXcgPSB2LnJlcGxhY2UoL1xcRC9nLCBcIlwiKTtcbiAgICB2YXIgbWF4bGVuID0gcGFyc2VJbnQoZWwuZ2V0QXR0cmlidXRlKFwibWF4bGVuZ3RoXCIpIHx8IFwiMTVcIik7XG4gICAgdmFyIHBoID0gKGVsLnBsYWNlaG9sZGVyIHx8IFwiXCIpO1xuICAgIGlmIChtYXhsZW4gPj0gMTkgfHwgL1xcZFxcc1xcZC8udGVzdChwaCkpIHtcbiAgICAgIHZhciBkID0gcmF3O1xuICAgICAgcmV0dXJuIChkWzBdfHxcIlwiKStcIiBcIisoZC5zbGljZSgxLDMpfHxcIlwiKStcIiBcIisoZC5zbGljZSgzLDUpfHxcIlwiKStcIiBcIisoZC5zbGljZSg1LDcpfHxcIlwiKStcIiBcIisoZC5zbGljZSg3LDEwKXx8XCJcIikrXCIgXCIrKGQuc2xpY2UoMTAsMTMpfHxcIlwiKSsocmF3Lmxlbmd0aD49MTU/XCIgXCIrZC5zbGljZSgxMywxNSk6XCJcIik7XG4gICAgfVxuICAgIGlmIChtYXhsZW4gPT09IDEzKSByZXR1cm4gcmF3LnNsaWNlKDAsMTMpO1xuICAgIHJldHVybiByYXcuc2xpY2UoMCwxNSk7XG4gIH0sXG4gIHRlbGVwaG9uZTogZnVuY3Rpb24odiwgZWwpIHtcbiAgICB2YXIgcmF3ID0gdi5yZXBsYWNlKC9cXEQvZywgXCJcIik7XG4gICAgdmFyIHBoID0gZWwucGxhY2Vob2xkZXIgfHwgXCJcIjtcbiAgICBpZiAoL1xcZHsyfVxccy8udGVzdChwaCkpIHJldHVybiByYXcuc2xpY2UoMCwyKStcIiBcIityYXcuc2xpY2UoMiw0KStcIiBcIityYXcuc2xpY2UoNCw2KStcIiBcIityYXcuc2xpY2UoNiw4KStcIiBcIityYXcuc2xpY2UoOCwxMCk7XG4gICAgcmV0dXJuIHJhdy5zbGljZSgwLDEwKTtcbiAgfVxufTtcblxuLyogXHUyNTAwXHUyNTAwIE9QVElDQUxfRk9STUFUVEVSUyBcdTIwMTQgY29ycmVjdGlvbnMgb3B0aXF1ZXMgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG5leHBvcnQgdmFyIE9QVElDQUxfRk9STUFUVEVSUyA9IHtcbiAgY29tbWE6IGZ1bmN0aW9uKHYpIHsgcmV0dXJuIHYucmVwbGFjZShcIi5cIiwgXCIsXCIpOyB9LFxuICBub19wbHVzOiBmdW5jdGlvbih2KSB7IHJldHVybiB2LnJlcGxhY2UoL15cXCsvLCBcIlwiKTsgfSxcbiAgYWJzb2x1dGU6IGZ1bmN0aW9uKHYpIHsgcmV0dXJuIHYucmVwbGFjZSgvXlsrLV0vLCBcIlwiKTsgfVxufTtcblxuLyogQ2hhbXBzIG9wdGlxdWVzIFx1MDBFMCBmb3JtYXR0ZXIgKi9cbmV4cG9ydCB2YXIgT1BUSUNBTF9GSUVMRF9LRVlTID0gW1xuICBcImx1bmV0dGVzT0Quc3BoZXJlXCIsIFwibHVuZXR0ZXNPRC5jeWxpbmRyZVwiLCBcImx1bmV0dGVzT0QuYXhlXCIsIFwibHVuZXR0ZXNPRC5hZGRpdGlvblwiLFxuICBcImx1bmV0dGVzT0cuc3BoZXJlXCIsIFwibHVuZXR0ZXNPRy5jeWxpbmRyZVwiLCBcImx1bmV0dGVzT0cuYXhlXCIsIFwibHVuZXR0ZXNPRy5hZGRpdGlvblwiLFxuICBcImxlbnRpbGxlc09ELnNwaGVyZVwiLCBcImxlbnRpbGxlc09ELmN5bGluZHJlXCIsIFwibGVudGlsbGVzT0QuYXhlXCIsIFwibGVudGlsbGVzT0QuYWRkaXRpb25cIixcbiAgXCJsZW50aWxsZXNPRy5zcGhlcmVcIiwgXCJsZW50aWxsZXNPRy5jeWxpbmRyZVwiLCBcImxlbnRpbGxlc09HLmF4ZVwiLCBcImxlbnRpbGxlc09HLmFkZGl0aW9uXCJcbl07XG5cbi8qIE5vcm1hbGlzZSB1bmUgZGF0ZSB2ZXJzIEREL01NL1lZWVkgKHBvdXIgYWZmaWNoYWdlKSBldCBZWVlZLU1NLUREIChwb3VyIGlucHV0W3R5cGU9ZGF0ZV0pICovXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplRGF0ZVZhbHVlKHJhdykge1xuICBpZiAoIXJhdykgcmV0dXJuIHsgZGlzcGxheTogcmF3LCBpc286IHJhdyB9O1xuICB2YXIgZCA9IFN0cmluZyhyYXcpLnJlcGxhY2UoL1xcRC9nLCBcIlwiKTtcbiAgdmFyIGRkLCBtbSwgeXl5eTtcbiAgLyogUHJpb3JpdFx1MDBFOSAxIDogZFx1MDBFOWpcdTAwRTAgREQvTU0vWVlZWSBcdTIxOTIgbmUgcGFzIHJlLXBhcnNlciAqL1xuICBpZiAoL15cXGR7Mn1cXC9cXGR7Mn1cXC9cXGR7NH0kLy50ZXN0KHJhdykpIHtcbiAgICB2YXIgcDIgPSByYXcuc3BsaXQoXCIvXCIpOyBkZCA9IHAyWzBdOyBtbSA9IHAyWzFdOyB5eXl5ID0gcDJbMl07XG4gIC8qIFByaW9yaXRcdTAwRTkgMiA6IElTTyBZWVlZLU1NLUREICovXG4gIH0gZWxzZSBpZiAoL15cXGR7NH0tXFxkezJ9LVxcZHsyfSQvLnRlc3QocmF3KSkge1xuICAgIHZhciBwID0gcmF3LnNwbGl0KFwiLVwiKTsgeXl5eSA9IHBbMF07IG1tID0gcFsxXTsgZGQgPSBwWzJdO1xuICAvKiBQcmlvcml0XHUwMEU5IDMgOiA4IGNoaWZmcmVzIGJydXRzICovXG4gIH0gZWxzZSBpZiAoZC5sZW5ndGggPT09IDgpIHtcbiAgICBpZiAocGFyc2VJbnQoZC5zbGljZSgwLCA0KSkgPiAxOTAwKSB7XG4gICAgICB5eXl5ID0gZC5zbGljZSgwLCA0KTsgbW0gPSBkLnNsaWNlKDQsIDYpOyBkZCA9IGQuc2xpY2UoNiwgOCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRkID0gZC5zbGljZSgwLCAyKTsgbW0gPSBkLnNsaWNlKDIsIDQpOyB5eXl5ID0gZC5zbGljZSg0LCA4KTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHsgZGlzcGxheTogcmF3LCBpc286IHJhdyB9O1xuICB9XG4gIHJldHVybiB7XG4gICAgZGlzcGxheTogZGQgKyBcIi9cIiArIG1tICsgXCIvXCIgKyB5eXl5LFxuICAgIGlzbzogeXl5eSArIFwiLVwiICsgbW0gKyBcIi1cIiArIGRkLFxuICAgIGRkOiBkZCwgbW06IG1tLCB5eXl5OiB5eXl5XG4gIH07XG59XG5cbi8qIFZcdTAwRTlyaWZpZSBzaSB1biBjaGFtcCBhIFx1MDBFOXRcdTAwRTkgcmVtcGxpIGF2ZWMgc3VjY1x1MDBFOHMgKi9cbmV4cG9ydCBmdW5jdGlvbiBmaWVsZEhhc1ZhbHVlKGVsLCBleHBlY3RlZCkge1xuICB2YXIgdmFsID0gU3RyaW5nKGVsLnZhbHVlIHx8IFwiXCIpLnRyaW0oKTtcbiAgdmFyIGV4cCA9IFN0cmluZyhleHBlY3RlZCB8fCBcIlwiKS50cmltKCk7XG4gIHJldHVybiB2YWwgIT09IFwiXCIgJiYgKHZhbCA9PT0gZXhwIHx8IHZhbC5yZXBsYWNlKC9cXEQvZywgXCJcIikgPT09IGV4cC5yZXBsYWNlKC9cXEQvZywgXCJcIikpO1xufVxuIiwgIi8qIFx1MjUwMFx1MjUwMCBEYXRhIFV0aWxpdHkgRnVuY3Rpb25zICYgQ29uc3RhbnRzIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0Q2FjaGVkQ2xpZW50KGRhdGEpIHtcbiAgdmFyIGNhY2hlID0gYXdhaXQgcmVhZEVuY3J5cHRlZENhY2hlKCk7XG4gIGlmICghY2FjaGUpIHJldHVybiBudWxsO1xuICByZXR1cm4gY2FjaGUuY3VycmVudCB8fCBudWxsO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0U21hcnRGaWxsRGF0YSgpIHtcbiAgdmFyIGRhdGEgPSB7fTtcbiAgdHJ5IHtcbiAgICB2YXIgdGV4dCA9IGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQucmVhZFRleHQoKTtcbiAgICB2YXIgcGFyc2VkID0gSlNPTi5wYXJzZSh0ZXh0KTtcbiAgICBpZiAocGFyc2VkLm0gfHwgcGFyc2VkLm8pIGRhdGEgPSBwYXJzZWQ7XG4gIH0gY2F0Y2goZSkge31cbiAgdmFyIGNhY2hlZCA9IGF3YWl0IGdldENhY2hlZENsaWVudChkYXRhKTtcbiAgdmFyIG0gPSBjYWNoZWQgfHwgZGF0YS5tIHx8IHt9O1xuICB2YXIgbyA9IGRhdGEubyB8fCB7fTtcblxuICAvKiBQcmlvcml0XHUwMEU5IDogZG9ublx1MDBFOWVzIG11dHVlbGxlIHN1ciBsYSBjYXJ0ZSwgc2lub24gb3Jkb25uYW5jZSAqL1xuICB2YXIgcCA9IChtLnBlcnNvbm5lcyAmJiBtLnBlcnNvbm5lc1swXSkgfHwge307XG4gIC8qIEV4dHJhaXJlIGxlcyBkb25uXHUwMEU5ZXMgZHUgclx1MDBFOWdpbWUgcmMxIChUUCBQbHVzIC8gbXV0dWVsbGUpICovXG4gIHZhciByYzEgPSAobS5yZWdpbWVzICYmIG0ucmVnaW1lcy5yYzEpIHx8IHt9O1xuXG4gIHJldHVybiB7XG4gICAgb3JnYW5pc21lOiAgICAgICAgICAgICAgbS5vcmdhbmlzbWUgfHwgcmMxLm5vbSB8fCBcIlwiLFxuICAgIG51bWVyb0FNQzogICAgICAgICAgICAgIG0ubnVtZXJvQU1DIHx8IHJjMS5udW1lcm9BTUMgfHwgXCJcIixcbiAgICBudW1lcm9BZGhlcmVudDogICAgICAgICBtLm51bWVyb0FkaGVyZW50IHx8IHJjMS5udW1lcm9BZGhlcmVudCB8fCByYzEubnVtZXJvQ29udHJhdCB8fCBcIlwiLFxuICAgIG51bWVyb1RlbGV0cmFuc21pc3Npb246IG0ubnVtZXJvVGVsZXRyYW5zbWlzc2lvbiB8fCByYzEubnVtZXJvVGVsZXRyYW5zbWlzc2lvbiB8fCBcIlwiLFxuICAgIHR5cGVDb252OiAgICAgICAgICAgICAgIG0udHlwZUNvbnYgfHwgcmMxLmNvZGVDb252ZW50aW9uIHx8IFwiXCIsXG4gICAgZGF0ZURlYnV0VmFsaWRpdGU6ICAgICAgbS5kYXRlRGVidXRWYWxpZGl0ZSB8fCByYzEuZGF0ZURlYnV0IHx8IFwiXCIsXG4gICAgZGF0ZUZpblZhbGlkaXRlOiAgICAgICAgbS5kYXRlRmluVmFsaWRpdGUgfHwgcmMxLmRhdGVGaW4gfHwgXCJcIixcbiAgICBub206ICAgICAgICAgICAgICAgICAgICAobS5ub20gfHwgcC5ub20gfHwgby5ub21QYXRpZW50IHx8IFwiXCIpLnRvVXBwZXJDYXNlKCksXG4gICAgcHJlbm9tOiAgICAgICAgICAgICAgICAgbS5wcmVub20gfHwgcC5wcmVub20gfHwgby5wcmVub21QYXRpZW50IHx8IFwiXCIsXG4gICAgbnVtZXJvU2VjdXJpdGVTb2NpYWxlOiAgbS5udW1lcm9TZWN1cml0ZVNvY2lhbGUgfHwgbS5uc3MgfHwgcC5udW1lcm9TZWN1cml0ZVNvY2lhbGUgfHwgXCJcIixcbiAgICBkYXRlTmFpc3NhbmNlOiAgICAgICAgICBtLmRhdGVOYWlzc2FuY2UgfHwgbS5kb2IgfHwgcC5kYXRlTmFpc3NhbmNlIHx8IG8uZGF0ZU5haXNzYW5jZVBhdGllbnQgfHwgXCJcIixcbiAgICB0ZWxlcGhvbmU6IChmdW5jdGlvbigpIHtcbiAgICAgIHZhciByYXcgPSBtLnRlbGVwaG9uZSB8fCBtLnBob25lIHx8IFwiXCI7XG4gICAgICBpZiAoIXJhdykgcmV0dXJuIFwiXCI7XG4gICAgICB2YXIgZGlnaXRzID0gcmF3LnJlcGxhY2UoL1xcRC9nLCBcIlwiKTtcbiAgICAgIGlmIChkaWdpdHMubGVuZ3RoID09PSAxMSAmJiBkaWdpdHMuc3RhcnRzV2l0aChcIjMzXCIpKSBkaWdpdHMgPSBcIjBcIiArIGRpZ2l0cy5zbGljZSgyKTtcbiAgICAgIGlmIChkaWdpdHMubGVuZ3RoID09PSAxMiAmJiBkaWdpdHMuc3RhcnRzV2l0aChcIjMzMFwiKSkgZGlnaXRzID0gXCIwXCIgKyBkaWdpdHMuc2xpY2UoMyk7XG4gICAgICB2YXIgcmVzdWx0ID0gZGlnaXRzLnNsaWNlKDAsIDEwKTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSkoKSxcbiAgICBlbWFpbDogICAgICAgICAgICAgICAgICBtLmVtYWlsIHx8IFwiXCIsXG4gICAgYWRyZXNzZTogICAgICAgICAgICAgICAgbS5hZHJlc3NlIHx8IG0uYWRkcmVzcyB8fCBcIlwiLFxuICAgIGNvZGVQb3N0YWw6ICAgICAgICAgICAgIG0uY29kZVBvc3RhbCB8fCBtLnppcENvZGUgfHwgXCJcIixcbiAgICB2aWxsZTogICAgICAgICAgICAgICAgICBtLnZpbGxlIHx8IG0uY2l0eSB8fCBcIlwiLFxuICAgIGRhdGVWYWxpZGl0ZTogICAgICAgICAgIG8uZGF0ZVZhbGlkaXRlIHx8IFwiXCIsXG4gICAgbm9tUGF0aWVudDogICAgICAgICAgICAgby5ub21QYXRpZW50IHx8IFwiXCIsXG4gICAgcHJlbm9tUGF0aWVudDogICAgICAgICAgby5wcmVub21QYXRpZW50IHx8IFwiXCIsXG4gICAgZGF0ZU5haXNzYW5jZVBhdGllbnQ6ICAgby5kYXRlTmFpc3NhbmNlUGF0aWVudCB8fCBcIlwiLFxuICAgIGRpc3RhbmNlUHVwaWxsYWlyZTogICAgIG8uZGlzdGFuY2VQdXBpbGxhaXJlIHx8IFwiXCIsXG4gICAgdHlwZVByZXNjcmlwdGlvbjogICAgICAgby50eXBlUHJlc2NyaXB0aW9uIHx8IChtLnByZXNjcmlwdGlvbiAmJiBtLnByZXNjcmlwdGlvbi50eXBlVmlzaW9uKSB8fCBcIlwiLFxuICAgIHJlbWFycXVlczogICAgICAgICAgICAgIG8ucmVtYXJxdWVzIHx8IFwiXCIsXG4gICAgLyogT3Jkb25uYW5jZSBcdTIwMTQgZmFsbGJhY2sgbS5wcmVzY3JpcHRpb24gKGZvcm1hdCBMaXZlQnlPcHRpbXVtL1RQIFBsdXMpICovXG4gICAgZGF0ZU9yZG9ubmFuY2U6ICAgICAgICAgby5kYXRlT3Jkb25uYW5jZSB8fCAobS5wcmVzY3JpcHRpb24gJiYgbS5wcmVzY3JpcHRpb24uZGF0ZVByZXNjcmlwdGlvbikgfHwgXCJcIixcbiAgICBub21PcGh0YWxtb2xvZ3VlOiAgICAgICBvLm5vbU9waHRhbG1vbG9ndWUgfHwgKG0ucHJlc2NyaXB0aW9uICYmIG0ucHJlc2NyaXB0aW9uLnByZXNjcmlwdGV1cikgfHwgXCJcIixcbiAgICBycHBzOiAgICAgICAgICAgICAgICAgICBvLnJwcHMgfHwgKG0ucHJlc2NyaXB0aW9uICYmIG0ucHJlc2NyaXB0aW9uLnJwcHMpIHx8IFwiXCIsXG4gICAgXCJsdW5ldHRlc09ELnNwaGVyZVwiOiAgICAoby5sdW5ldHRlc09EICYmIG8ubHVuZXR0ZXNPRC5zcGhlcmUpID8gU3RyaW5nKG8ubHVuZXR0ZXNPRC5zcGhlcmUpIDogKG0ucHJlc2NyaXB0aW9uICYmIG0ucHJlc2NyaXB0aW9uLm9kICYmIG0ucHJlc2NyaXB0aW9uLm9kLnNwaGVyZSkgPyBTdHJpbmcobS5wcmVzY3JpcHRpb24ub2Quc3BoZXJlKSA6IFwiXCIsXG4gICAgXCJsdW5ldHRlc09ELmN5bGluZHJlXCI6ICAoby5sdW5ldHRlc09EICYmIG8ubHVuZXR0ZXNPRC5jeWxpbmRyZSkgPyBTdHJpbmcoby5sdW5ldHRlc09ELmN5bGluZHJlKSA6IChtLnByZXNjcmlwdGlvbiAmJiBtLnByZXNjcmlwdGlvbi5vZCAmJiBtLnByZXNjcmlwdGlvbi5vZC5jeWxpbmRyZSkgPyBTdHJpbmcobS5wcmVzY3JpcHRpb24ub2QuY3lsaW5kcmUpIDogXCJcIixcbiAgICBcImx1bmV0dGVzT0QuYXhlXCI6ICAgICAgIChvLmx1bmV0dGVzT0QgJiYgby5sdW5ldHRlc09ELmF4ZSkgPyBTdHJpbmcoby5sdW5ldHRlc09ELmF4ZSkgOiAobS5wcmVzY3JpcHRpb24gJiYgbS5wcmVzY3JpcHRpb24ub2QgJiYgbS5wcmVzY3JpcHRpb24ub2QuYXhlKSA/IFN0cmluZyhtLnByZXNjcmlwdGlvbi5vZC5heGUpIDogXCJcIixcbiAgICBcImx1bmV0dGVzT0QuYWRkaXRpb25cIjogIChvLmx1bmV0dGVzT0QgJiYgby5sdW5ldHRlc09ELmFkZGl0aW9uKSA/IFN0cmluZyhvLmx1bmV0dGVzT0QuYWRkaXRpb24pIDogKG0ucHJlc2NyaXB0aW9uICYmIG0ucHJlc2NyaXB0aW9uLm9kICYmIG0ucHJlc2NyaXB0aW9uLm9kLmFkZGl0aW9uKSA/IFN0cmluZyhtLnByZXNjcmlwdGlvbi5vZC5hZGRpdGlvbikgOiBcIlwiLFxuICAgIFwibHVuZXR0ZXNPRy5zcGhlcmVcIjogICAgKG8ubHVuZXR0ZXNPRyAmJiBvLmx1bmV0dGVzT0cuc3BoZXJlKSA/IFN0cmluZyhvLmx1bmV0dGVzT0cuc3BoZXJlKSA6IChtLnByZXNjcmlwdGlvbiAmJiBtLnByZXNjcmlwdGlvbi5vZyAmJiBtLnByZXNjcmlwdGlvbi5vZy5zcGhlcmUpID8gU3RyaW5nKG0ucHJlc2NyaXB0aW9uLm9nLnNwaGVyZSkgOiBcIlwiLFxuICAgIFwibHVuZXR0ZXNPRy5jeWxpbmRyZVwiOiAgKG8ubHVuZXR0ZXNPRyAmJiBvLmx1bmV0dGVzT0cuY3lsaW5kcmUpID8gU3RyaW5nKG8ubHVuZXR0ZXNPRy5jeWxpbmRyZSkgOiAobS5wcmVzY3JpcHRpb24gJiYgbS5wcmVzY3JpcHRpb24ub2cgJiYgbS5wcmVzY3JpcHRpb24ub2cuY3lsaW5kcmUpID8gU3RyaW5nKG0ucHJlc2NyaXB0aW9uLm9nLmN5bGluZHJlKSA6IFwiXCIsXG4gICAgXCJsdW5ldHRlc09HLmF4ZVwiOiAgICAgICAoby5sdW5ldHRlc09HICYmIG8ubHVuZXR0ZXNPRy5heGUpID8gU3RyaW5nKG8ubHVuZXR0ZXNPRy5heGUpIDogKG0ucHJlc2NyaXB0aW9uICYmIG0ucHJlc2NyaXB0aW9uLm9nICYmIG0ucHJlc2NyaXB0aW9uLm9nLmF4ZSkgPyBTdHJpbmcobS5wcmVzY3JpcHRpb24ub2cuYXhlKSA6IFwiXCIsXG4gICAgXCJsdW5ldHRlc09HLmFkZGl0aW9uXCI6ICAoby5sdW5ldHRlc09HICYmIG8ubHVuZXR0ZXNPRy5hZGRpdGlvbikgPyBTdHJpbmcoby5sdW5ldHRlc09HLmFkZGl0aW9uKSA6IChtLnByZXNjcmlwdGlvbiAmJiBtLnByZXNjcmlwdGlvbi5vZyAmJiBtLnByZXNjcmlwdGlvbi5vZy5hZGRpdGlvbikgPyBTdHJpbmcobS5wcmVzY3JpcHRpb24ub2cuYWRkaXRpb24pIDogXCJcIixcbiAgICBcImxlbnRpbGxlc09ELnNwaGVyZVwiOiAgIChvLmxlbnRpbGxlc09EICYmIG8ubGVudGlsbGVzT0Quc3BoZXJlKSA/IFN0cmluZyhvLmxlbnRpbGxlc09ELnNwaGVyZSkgOiBcIlwiLFxuICAgIFwibGVudGlsbGVzT0QuY3lsaW5kcmVcIjogKG8ubGVudGlsbGVzT0QgJiYgby5sZW50aWxsZXNPRC5jeWxpbmRyZSkgPyBTdHJpbmcoby5sZW50aWxsZXNPRC5jeWxpbmRyZSkgOiBcIlwiLFxuICAgIFwibGVudGlsbGVzT0QuYXhlXCI6ICAgICAgKG8ubGVudGlsbGVzT0QgJiYgby5sZW50aWxsZXNPRC5heGUpID8gU3RyaW5nKG8ubGVudGlsbGVzT0QuYXhlKSA6IFwiXCIsXG4gICAgXCJsZW50aWxsZXNPRC5hZGRpdGlvblwiOiAoby5sZW50aWxsZXNPRCAmJiBvLmxlbnRpbGxlc09ELmFkZGl0aW9uKSA/IFN0cmluZyhvLmxlbnRpbGxlc09ELmFkZGl0aW9uKSA6IFwiXCIsXG4gICAgXCJsZW50aWxsZXNPRC5yYXlvbkNvdXJidXJlXCI6IChvLmxlbnRpbGxlc09EICYmIG8ubGVudGlsbGVzT0QucmF5b25Db3VyYnVyZSkgPyBTdHJpbmcoby5sZW50aWxsZXNPRC5yYXlvbkNvdXJidXJlKSA6IFwiXCIsXG4gICAgXCJsZW50aWxsZXNPRC5kaWFtZXRyZVwiOiAoby5sZW50aWxsZXNPRCAmJiBvLmxlbnRpbGxlc09ELmRpYW1ldHJlKSA/IFN0cmluZyhvLmxlbnRpbGxlc09ELmRpYW1ldHJlKSA6IFwiXCIsXG4gICAgXCJsZW50aWxsZXNPRy5zcGhlcmVcIjogICAoby5sZW50aWxsZXNPRyAmJiBvLmxlbnRpbGxlc09HLnNwaGVyZSkgPyBTdHJpbmcoby5sZW50aWxsZXNPRy5zcGhlcmUpIDogXCJcIixcbiAgICBcImxlbnRpbGxlc09HLmN5bGluZHJlXCI6IChvLmxlbnRpbGxlc09HICYmIG8ubGVudGlsbGVzT0cuY3lsaW5kcmUpID8gU3RyaW5nKG8ubGVudGlsbGVzT0cuY3lsaW5kcmUpIDogXCJcIixcbiAgICBcImxlbnRpbGxlc09HLmF4ZVwiOiAgICAgIChvLmxlbnRpbGxlc09HICYmIG8ubGVudGlsbGVzT0cuYXhlKSA/IFN0cmluZyhvLmxlbnRpbGxlc09HLmF4ZSkgOiBcIlwiLFxuICAgIFwibGVudGlsbGVzT0cuYWRkaXRpb25cIjogKG8ubGVudGlsbGVzT0cgJiYgby5sZW50aWxsZXNPRy5hZGRpdGlvbikgPyBTdHJpbmcoby5sZW50aWxsZXNPRy5hZGRpdGlvbikgOiBcIlwiLFxuICAgIFwibGVudGlsbGVzT0cucmF5b25Db3VyYnVyZVwiOiAoby5sZW50aWxsZXNPRyAmJiBvLmxlbnRpbGxlc09HLnJheW9uQ291cmJ1cmUpID8gU3RyaW5nKG8ubGVudGlsbGVzT0cucmF5b25Db3VyYnVyZSkgOiBcIlwiLFxuICAgIFwibGVudGlsbGVzT0cuZGlhbWV0cmVcIjogKG8ubGVudGlsbGVzT0cgJiYgby5sZW50aWxsZXNPRy5kaWFtZXRyZSkgPyBTdHJpbmcoby5sZW50aWxsZXNPRy5kaWFtZXRyZSkgOiBcIlwiLFxuICB9O1xufVxuXG4vKiBcdTI1MDBcdTI1MDAgU21hcnQgRmlsbCBcdTIwMTQgZGljdGlvbm5haXJlIGQnYWxpYXMgcGFyIGNoYW1wIE9DUiBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cbmV4cG9ydCB2YXIgU01BUlRfRklMTF9BTElBU0VTID0ge1xuICAvKiBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcbiAgICogIE1VVFVFTExFIC8gVElFUlMtUEFZQU5UXG4gICAqIFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MCAqL1xuICBvcmdhbmlzbWU6IFtcbiAgICBcIm9yZ2FuaXNtZVwiLCBcIm11dHVlbGxlXCIsIFwiY2Fpc3NlXCIsIFwiYXNzdXJldXJcIiwgXCJjb21wYWduaWVcIiwgXCJjb21wbGVtZW50YWlyZVwiLCBcImFzc3VyYW5jZVwiLFxuICAgIFwib3JnYW5pc21lX2NvbXBsZW1lbnRhaXJlXCIsIFwibm9tX211dHVlbGxlXCIsIFwibGliZWxsZV9vcmdhbmlzbWVcIiwgXCJub21fb3JnYW5pc21lXCIsXG4gICAgXCJvcmdhbmlzbWVfYW1jXCIsIFwiY2Fpc3NlX2NvbXBsZW1lbnRhaXJlXCIsIFwiYXNzdXJhbmNlX2NvbXBsZW1lbnRhaXJlXCIsIFwiY29tcGxlbWVudGFpcmVfc2FudGVcIixcbiAgICBcInJlZ2ltZV9jb21wbGVtZW50YWlyZVwiLCBcInRpZXJzX3BheWFudFwiLCBcIm9yZ2FuaXNtZV90cFwiLCBcInRwX29yZ2FuaXNtZVwiLCBcIm9yZ2FuaXNtZV9yY1wiLFxuICAgIFwicmNfb3JnYW5pc21lXCIsIFwibm9tX2NhaXNzZVwiLCBcIm5vbV9hc3N1cmV1clwiLCBcIm5vbV9jb21wYWduaWVcIiwgXCJjb2RlX211dHVlbGxlXCIsXG4gICAgXCJtdXR1ZWxsZV9ub21cIiwgXCJvY1wiLCBcIm9yZ2FuaXNtZV9vY1wiLCBcImluc3VyZXJcIiwgXCJpbnN1cmFuY2VcIiwgXCJpbnN1cmFuY2VfY29tcGFueVwiLFxuICAgIFwiaW5zdXJhbmNlX3Byb3ZpZGVyXCIsIFwiaGVhbHRoX2Z1bmRcIiwgXCJtdXR1YWxcIiwgXCJmdW5kX25hbWVcIiwgXCJwYXllclwiLFxuICAgIFwiaW5zdXJlck5hbWVcIiwgXCJvcmdhbmlzbWVDb21wbGVtZW50YWlyZVwiLCBcImxpYmVsbGVPcmdhbmlzbWVcIiwgXCJub21NdXR1ZWxsZVwiLFxuICBdLFxuICBudW1lcm9BTUM6IFtcbiAgICAvKiBzdGFuZGFyZCAqL1xuICAgIFwibnVtZXJvYW1jXCIsIFwibnVtX2FtY1wiLCBcImFtY1wiLCBcImNvZGVfYW1jXCIsIFwiY29kZV9vcmdhbmlzbWVcIiwgXCJpZF9vcmdhbmlzbWVcIiwgXCJudW1fb3JnYW5pc21lXCIsXG4gICAgXCJudW1lcm9fb3JnYW5pc21lXCIsIFwiY29kZV9jYWlzc2VcIiwgXCJudW1lcm9fYW1jXCIsIFwiY29kZUFtY1wiLCBcImFtY0NvZGVcIiwgXCJhbWNOdW1iZXJcIixcbiAgICBcImNvZGVfY29tcGxlbWVudGFpcmVcIiwgXCJpZF9hbWNcIiwgXCJyZWZfYW1jXCIsXG4gICAgLyogdmFyaWF0aW9ucyBwb3J0YWlscyAqL1xuICAgIFwiY29kZV9vY1wiLCBcIm51bV9vY1wiLCBcImlkX29jXCIsIFwibnVtZXJvX29jXCIsIFwiaWRlbnRpZmlhbnRfb2NcIixcbiAgICBcImNvZGVfY29tcGxlbWVudGFpcmVfc2FudGVcIiwgXCJjb2RlX211dHVlbGxlXCIsIFwiaWRfbXV0dWVsbGVcIixcbiAgICBcImNvZGVfYXNzdXJldXJcIiwgXCJudW1fYXNzdXJldXJcIiwgXCJpZGVudGlmaWFudF9tdXR1ZWxsZVwiLFxuICAgIFwiY29kZUFNQ1wiLCBcIm51bUFNQ1wiLCBcImlkQU1DXCIsIFwiYW1jSWRlbnRpZmllclwiLFxuICAgIC8qIEFsbWVyeXMgKi9cbiAgICBcImNvZGVPcmdhbmlzbWVcIiwgXCJpZE9yZ2FuaXNtZVwiLCBcIm51bU9yZ2FuaXNtZVwiLFxuICAgIC8qIFZpYW1lZGlzICovXG4gICAgXCJ2bS1hbWNcIiwgXCJ2bS1jb2RlLW9jXCIsXG4gICAgLyogZGF0YS10ZXN0aWQgKi9cbiAgICBcImFtYy1jb2RlXCIsIFwib3JnYW5pc21lLWNvZGVcIiwgXCJtdXR1ZWxsZS1jb2RlXCIsXG4gIF0sXG4gIG51bWVyb0FkaGVyZW50OiBbXG4gICAgLyogc3RhbmRhcmQgKi9cbiAgICBcIm51bWVyb2FkaGVyZW50XCIsIFwibnVtX2FkaGVyZW50XCIsIFwiYWRoZXJlbnRcIiwgXCJudW1lcm9fY29udHJhdFwiLCBcIm51bV9jb250cmF0XCIsIFwibnVtY29udHJhdFwiLFxuICAgIFwibm9jb250cmF0XCIsIFwibm9fY29udHJhdFwiLCBcImlkX2FkaGVyZW50XCIsIFwicmVmX2FkaGVyZW50XCIsIFwibnVtZXJvX21lbWJyZVwiLCBcImNvbnRyYXRcIixcbiAgICBcImNvbnRyYWN0XCIsIFwibiBjb250cmF0XCIsIFwibmNvbnRyYXRcIiwgXCJyZWZlcmVuY2VfYWRoZXJlbnRcIiwgXCJudW1lcm9fY2FydGVcIiwgXCJudW1fY2FydGVcIixcbiAgICBcImlkX2NvbnRyYXRcIiwgXCJyZWZfY29udHJhdFwiLCBcIm51bWVyb19hZGhlcmVudFwiLCBcIm5fYWRoZXJlbnRcIiwgXCJub19hZGhlcmVudFwiLFxuICAgIFwic3Vic2NyaWJlcl9pZFwiLCBcIm1lbWJlcl9pZFwiLCBcIm1lbWJlcl9udW1iZXJcIiwgXCJwb2xpY3lfbnVtYmVyXCIsIFwicG9saWN5bnVtYmVyXCIsXG4gICAgXCJzdWJzY3JpYmVySWRcIiwgXCJtZW1iZXJJZFwiLCBcIm1lbWJlck51bWJlclwiLCBcImNvbnRyYWN0TnVtYmVyXCIsIFwibnVtZXJvQ29udHJhdFwiLFxuICAgIC8qIHZhcmlhdGlvbnMgcG9ydGFpbHMgKi9cbiAgICBcIm51bV9iZW5lZmljaWFpcmVcIiwgXCJpZF9iZW5lZmljaWFpcmVcIiwgXCJyZWZfYmVuZWZpY2lhaXJlXCIsXG4gICAgXCJudW1lcm9fYmVuZWZpY2lhaXJlXCIsIFwibl9iZW5lZmljaWFpcmVcIiwgXCJub19iZW5lZmljaWFpcmVcIixcbiAgICBcImlkZW50aWZpYW50X2FkaGVyZW50XCIsIFwiaWRfYXNzdXJcdTAwRTlcIiwgXCJudW1fYXNzdXJcdTAwRTlcIiwgXCJudW1lcm9fYXNzdXJcdTAwRTlcIixcbiAgICBcImNhcnRlX2FkaGVyZW50XCIsIFwibnVtX2NhcnRlX2FkaGVyZW50XCIsIFwiY2FydGVfbXV0dWVsbGVcIixcbiAgICBcImFkaGVyZW50X251bWJlclwiLCBcImFkaGVyZW50X2lkXCIsIFwiYWRoZXJlbnRfcmVmXCIsXG4gICAgLyogQWxtZXJ5cyBST0MgKi9cbiAgICBcIm51bUFkaGVyZW50XCIsIFwiaWRBZGhlcmVudFwiLCBcInJlZkFkaGVyZW50XCIsIFwiYmVuZWZpY2lhaXJlTnVtZXJvXCIsXG4gICAgLyogV2VtaW5kIHYzICovXG4gICAgXCJtZW1iZXJzaGlwTnVtYmVyXCIsIFwiZW5yb2xsbWVudElkXCIsIFwidm0tYWRoZXJlbnRcIixcbiAgICAvKiBWaWFtZWRpcyAqL1xuICAgIFwibnVtQmVuZWZpY2lhaXJlXCIsIFwidm0tYmVuZWZpY2lhaXJlXCIsXG4gICAgLyogRVJQICovXG4gICAgXCJ0eHROdW1BZGhlcmVudFwiLCBcImZsZF9hZGhlcmVudFwiLCBcImlucHV0X2FkaGVyZW50XCIsXG4gICAgLyogZGF0YS10ZXN0aWQgKi9cbiAgICBcImFkaGVyZW50LW51bWJlclwiLCBcIm1lbWJlci1pZFwiLCBcInN1YnNjcmliZXItaWRcIiwgXCJiZW5lZmljaWFyeS1pZFwiLFxuICBdLFxuICBudW1lcm9UZWxldHJhbnNtaXNzaW9uOiBbXG4gICAgLyogc3RhbmRhcmQgKi9cbiAgICBcIm51bWVyb3RlbGV0cmFuc21pc3Npb25cIiwgXCJudW1fdGVsZXRyYW5zbWlzc2lvblwiLCBcInRlbGV0cmFuc21pc3Npb25cIiwgXCJudW1fdHBcIiwgXCJudW1lcm9fdHBcIixcbiAgICBcInJlZl90cFwiLCBcImNvZGVfdGVsZXRyYW5zbWlzc2lvblwiLCBcInRlbGV0cmFuc1wiLCBcIm51bV90ZWxldHJhbnNcIixcbiAgICAvKiB2YXJpYXRpb25zIHBvcnRhaWxzICovXG4gICAgXCJub190cFwiLCBcIm5fdHBcIiwgXCJyZWZlcmVuY2VfdHBcIiwgXCJpZF90cFwiLCBcIm51bV90ZWxldHBcIixcbiAgICBcInRlbGV0cmFuc21pc3Npb25fbnVtYmVyXCIsIFwidHBfcmVmZXJlbmNlXCIsIFwidHBfbnVtXCIsXG4gICAgXCJudW1lcm9fZW1pc3Npb25cIiwgXCJudW1fZW1pc3Npb25cIiwgXCJjb2RlX2Rlc3RpbmF0YWlyZVwiLFxuICAgIFwibnVtX2Rlc3RpbmF0YWlyZVwiLCBcImRlc3RpbmF0YWlyZV90cFwiLCBcIm51bV9yb3V0YWdlXCIsXG4gICAgXCJjb2RlX3JvdXRhZ2VcIiwgXCJyb3V0YWdlXCIsIFwibl9lbWlzc2lvblwiLFxuICAgIC8qIEFsbWVyeXMgKi9cbiAgICBcIm51bVRQXCIsIFwicmVmVFBcIiwgXCJudW1UZWxldHJhbnNtaXNzaW9uXCIsXG4gICAgLyogVmlhbWVkaXMgKi9cbiAgICBcIm51bWVyb0Rlc3RpbmF0YWlyZVwiLCBcImNvZGVEZXN0aW5hdGFpcmVcIixcbiAgICAvKiBjYW1lbENhc2UgKi9cbiAgICBcIm51bWVyb1RlbGV0cmFuc21pc3Npb25cIiwgXCJudW1UZWxldHJhbnNcIiwgXCJyZWZUZWxldHJhbnNcIixcbiAgICAvKiBFUlAgKi9cbiAgICBcInR4dE51bVRQXCIsIFwiZmxkX251bV90cFwiLCBcImlucHV0X3RwXCIsXG4gICAgLyogZGF0YS10ZXN0aWQgKi9cbiAgICBcInRlbGV0cmFuc21pc3Npb24tbnVtYmVyXCIsIFwidHAtbnVtYmVyXCIsIFwidHAtcmVmXCIsXG4gIF0sXG4gIHR5cGVDb252OiBbXG4gICAgLyogc3RhbmRhcmQgKi9cbiAgICBcInR5cGVjb252XCIsIFwidHlwZV9jb252XCIsIFwidHlwZV9jb252ZW50aW9uXCIsIFwiY29udmVudGlvblwiLCBcInJlZ2ltZVwiLCBcInR5cGVfcmVnaW1lXCIsXG4gICAgXCJjb2RlX2NvbnZlbnRpb25cIiwgXCJjb2RlY29udmVudGlvblwiLCBcInJlZ2ltZVR5cGVcIixcbiAgICAvKiB2YXJpYXRpb25zIHBvcnRhaWxzICovXG4gICAgXCJuYXR1cmVfY29udmVudGlvblwiLCBcImNvZGVDb252ZW50aW9uXCIsIFwidHlwZV9wcmlzZV9lbl9jaGFyZ2VcIixcbiAgICBcIm1vZGVfcmVtYm91cnNlbWVudFwiLCBcInR5cGVfcm9jXCIsIFwidHlwZV90cFwiLCBcInR5cGVfdGllcnNfcGF5YW50XCIsXG4gICAgXCJjb2RlX3JlZ2ltZVwiLCBcInJlZ2ltZV9jb2RlXCIsIFwicmVnaW1lX29ibGlnYXRvaXJlXCIsIFwicm9cIixcbiAgICBcImNvbnZlbnRpb25fY29kZVwiLCBcImNvZGVfY29udlwiLCBcIm5hdHVyZV9wZWNcIiwgXCJ0eXBlX2NvdXZlcnR1cmVcIixcbiAgICBcIm1vZGFsaXR5XCIsIFwiY29udmVudGlvbl90eXBlXCIsIFwicmVnaW1lX2Fzc3VyYW5jZVwiLFxuICAgIC8qIEFsbWVyeXMgUk9DICovXG4gICAgXCJ0eXBlQ29udmVudGlvblwiLCBcIm1vZGVHZXN0aW9uXCIsIFwibmF0dXJlUEVDXCIsXG4gICAgLyogV2VtaW5kIHYzICovXG4gICAgXCJjb3ZlcmFnZVR5cGVcIiwgXCJwbGFuVHlwZVwiLCBcImJlbmVmaXRUeXBlXCIsXG4gICAgLyogY2FtZWxDYXNlICovXG4gICAgXCJ0eXBlQ29udlwiLCBcImNvZGVDb252XCIsIFwicmVnaW1lVHlwZVwiLCBcImNvbnZlbnRpb25UeXBlXCIsXG4gICAgLyogZGF0YS10ZXN0aWQgKi9cbiAgICBcImNvbnZlbnRpb24tdHlwZVwiLCBcInJlZ2ltZS10eXBlXCIsIFwiY292ZXJhZ2UtdHlwZVwiLFxuICBdLFxuICBkYXRlRGVidXRWYWxpZGl0ZTogW1xuICAgIFwiZGF0ZWRlYnV0dmFsaWRpdGVcIiwgXCJkZWJ1dF92YWxpZGl0ZVwiLCBcImRhdGVfZGVidXRcIiwgXCJ2YWxpZGl0ZV9kZWJ1dFwiLCBcImRhdGVfZGVidXRfdmFsaWRpdGVcIixcbiAgICBcInN0YXJ0X2RhdGVcIiwgXCJzdGFydGRhdGVcIiwgXCJ2YWxpZF9mcm9tXCIsIFwidmFsaWRmcm9tXCIsIFwiZWZmZWN0aXZlX2RhdGVcIixcbiAgICBcImRhdGVEZWJ1dFwiLCBcImRlYnV0VmFsaWRpdGVcIiwgXCJkYXRlRWZmZXRcIixcbiAgXSxcbiAgZGF0ZUZpblZhbGlkaXRlOiBbXG4gICAgXCJkYXRlZmludmFsaWRpdGVcIiwgXCJmaW5fdmFsaWRpdGVcIiwgXCJkYXRlX2ZpblwiLCBcInZhbGlkaXRlX2ZpblwiLCBcImRhdGVfZmluX3ZhbGlkaXRlXCIsXG4gICAgXCJkYXRlX2V4cGlyYXRpb25cIiwgXCJleHBpcmF0aW9uXCIsIFwiZW5kX2RhdGVcIiwgXCJlbmRkYXRlXCIsIFwidmFsaWRfdW50aWxcIiwgXCJ2YWxpZHVudGlsXCIsXG4gICAgXCJleHBpcnlfZGF0ZVwiLCBcImV4cGlyeWRhdGVcIiwgXCJkYXRlRmluXCIsIFwiZmluVmFsaWRpdGVcIiwgXCJkYXRlRXhwaXJhdGlvblwiLFxuICBdLFxuXG4gIC8qIFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFxuICAgKiAgUEFUSUVOVCAvIEJFTkVGSUNJQUlSRSBcdTIwMTQgSURFTlRJVEVcbiAgICogXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwICovXG4gIG5vbTogW1xuICAgIC8qIGZyYW5cdTAwRTdhaXMgKi9cbiAgICBcIm5vbVwiLCBcIm5vbV9wYXRpZW50XCIsIFwicGF0aWVudF9ub21cIiwgXCJub21fY2xpZW50XCIsIFwiY2xpZW50X25vbVwiLCBcIm5vbV9iZW5lZmljaWFpcmVcIixcbiAgICBcImJlbmVmaWNpYWlyZV9ub21cIiwgXCJub21fYXNzdXJlXCIsIFwiYXNzdXJlX25vbVwiLCBcIm5vbV9wb3J0ZXVyXCIsIFwibm9tX3VzYWdlXCIsXG4gICAgXCJub21fbmFpc3NhbmNlXCIsIFwibm9tX2pldW5lX2ZpbGxlXCIsIFwicGF0cm9ueW1lXCIsIFwibm9tX3BlcnNcIiwgXCJub21fdGl0dWxhaXJlXCIsXG4gICAgXCJhZGhlcmVudF9ub21cIiwgXCJpbmZvc19jbGllbnRfbm9tXCIsIFwibm9tIGRlIGZhbWlsbGVcIiwgXCJub20gYmVuZWZpY2lhaXJlXCIsIFwibm9tIGFzc3VyZVwiLFxuICAgIFwibm9tYXNzdXJlZVwiLCBcImlkZW50aXRlX25vbVwiLCBcImJlbl9ub21cIiwgXCJub21fYmVuXCIsXG4gICAgLyogYW5nbGFpcyAqL1xuICAgIFwibGFzdG5hbWVcIiwgXCJsYXN0X25hbWVcIiwgXCJzdXJuYW1lXCIsIFwiZmFtaWx5X25hbWVcIiwgXCJmYW1pbHluYW1lXCIsIFwibGFzdC1uYW1lXCIsIFwiZmFtaWx5LW5hbWVcIixcbiAgICAvKiBjYW1lbENhc2UgLyBmcmFtZXdvcmtzICovXG4gICAgXCJub21QYXRpZW50XCIsIFwibm9tQ2xpZW50XCIsIFwibm9tQmVuZWZpY2lhaXJlXCIsIFwibm9tQXNzdXJlXCIsIFwibm9tUG9ydGV1clwiLCBcIm5vbVVzYWdlXCIsXG4gICAgXCJsYXN0TmFtZVwiLCBcImZhbWlseU5hbWVcIiwgXCJwYXRpZW50TGFzdE5hbWVcIiwgXCJjdXN0b21lckxhc3ROYW1lXCIsIFwiY2xpZW50TGFzdE5hbWVcIixcbiAgICBcImJlbmVmaWNpYXJ5TGFzdE5hbWVcIiwgXCJQYXRpZW50U3VybmFtZVwiLCBcIlN1cm5hbWVcIixcbiAgICAvKiBFUlAgc3BlY2lmaXF1ZXMgKi9cbiAgICBcInR4dE5vbVwiLCBcInR4dE5vbVBhdGllbnRcIiwgXCJjdGxfbm9tXCIsIFwiY3RsMDBfbm9tXCIsIFwidGJOb21cIiwgXCJmbGRfbm9tXCIsXG4gICAgXCJpbnB1dF9ub21cIiwgXCJjaGFtcF9ub21cIiwgXCJmaWVsZF9ub21cIiwgXCJ3b19ub21cIiwgXCJhcmNoX25vbVwiLCBcImZpY2hlX25vbVwiLFxuICAgIC8qIENvc2l1bSAvIGlHZXN0aW9uICovXG4gICAgXCJmaWNoZV9wYXRpZW50X25vbVwiLCBcInBhdF9ub21cIiwgXCJwYXRpZW50X2xhc3RfbmFtZVwiLFxuICAgIC8qIFdlbWluZCB2MyAqL1xuICAgIFwicGF0aWVudEJpcnRoTmFtZVwiLCBcInBhdGllbnRfYmlydGhfbmFtZVwiLCBcInZtLW5vbVwiLFxuICAgIC8qIGRhdGEtdGVzdGlkIFJlYWN0L05leHQgKi9cbiAgICBcInBhdGllbnQtbGFzdG5hbWVcIiwgXCJwYXRpZW50LW5hbWVcIiwgXCJiZW5lZmljaWFyeS1sYXN0bmFtZVwiLFxuICAgIC8qIGRhdGEgYXR0cmlidXRlcyAqL1xuICAgIFwiaW5wdXQtbGFzdG5hbWVcIiwgXCJpbnB1dC1sYXN0LW5hbWVcIiwgXCJpbnB1dC1ub21cIixcbiAgXSxcbiAgcHJlbm9tOiBbXG4gICAgLyogZnJhblx1MDBFN2FpcyAqL1xuICAgIFwicHJlbm9tXCIsIFwicHJlbm9tX3BhdGllbnRcIiwgXCJwYXRpZW50X3ByZW5vbVwiLCBcInByZW5vbV9jbGllbnRcIiwgXCJjbGllbnRfcHJlbm9tXCIsXG4gICAgXCJwcmVub21fYmVuZWZpY2lhaXJlXCIsIFwiYmVuZWZpY2lhaXJlX3ByZW5vbVwiLCBcInByZW5vbV9hc3N1cmVcIiwgXCJwcmVub21fcG9ydGV1clwiLFxuICAgIFwicHJlbm9tX3VzYWdlXCIsIFwicHJlbm9tX3BlcnNcIiwgXCJwcmVub21fdGl0dWxhaXJlXCIsIFwiYWRoZXJlbnRfcHJlbm9tXCIsXG4gICAgXCJpbmZvc19jbGllbnRfcHJlbm9tXCIsIFwicHJlbm9tIGJlbmVmaWNpYWlyZVwiLCBcInByZW5vbSBhc3N1cmVcIiwgXCJwcmVub21hc3N1cmVlXCIsXG4gICAgXCJiZW5fcHJlbm9tXCIsIFwicHJlbm9tX2JlblwiLFxuICAgIC8qIGFuZ2xhaXMgKi9cbiAgICBcImZpcnN0bmFtZVwiLCBcImZpcnN0X25hbWVcIiwgXCJnaXZlbl9uYW1lXCIsIFwiZ2l2ZW5uYW1lXCIsIFwiZm9yZW5hbWVcIiwgXCJmaXJzdC1uYW1lXCIsIFwiZ2l2ZW4tbmFtZVwiLFxuICAgIC8qIGNhbWVsQ2FzZSAvIGZyYW1ld29ya3MgKi9cbiAgICBcInByZW5vbVBhdGllbnRcIiwgXCJwcmVub21DbGllbnRcIiwgXCJwcmVub21CZW5lZmljaWFpcmVcIiwgXCJwcmVub21Bc3N1cmVcIiwgXCJwcmVub21Qb3J0ZXVyXCIsXG4gICAgXCJmaXJzdE5hbWVcIiwgXCJnaXZlbk5hbWVcIiwgXCJwYXRpZW50Rmlyc3ROYW1lXCIsIFwiY3VzdG9tZXJGaXJzdE5hbWVcIiwgXCJjbGllbnRGaXJzdE5hbWVcIixcbiAgICBcImJlbmVmaWNpYXJ5Rmlyc3ROYW1lXCIsIFwiUGF0aWVudEZvcmVuYW1lXCIsIFwiRm9yZW5hbWVcIiwgXCJHaXZlbk5hbWVcIixcbiAgICAvKiBFUlAgc3BlY2lmaXF1ZXMgKi9cbiAgICBcInR4dFByZW5vbVwiLCBcInR4dFByZW5vbVBhdGllbnRcIiwgXCJjdGxfcHJlbm9tXCIsIFwiY3RsMDBfcHJlbm9tXCIsIFwidGJQcmVub21cIiwgXCJmbGRfcHJlbm9tXCIsXG4gICAgXCJpbnB1dF9wcmVub21cIiwgXCJjaGFtcF9wcmVub21cIiwgXCJmaWVsZF9wcmVub21cIiwgXCJ3b19wcmVub21cIiwgXCJhcmNoX3ByZW5vbVwiLCBcImZpY2hlX3ByZW5vbVwiLFxuICAgIC8qIENvc2l1bSAvIGlHZXN0aW9uICovXG4gICAgXCJmaWNoZV9wYXRpZW50X3ByZW5vbVwiLCBcInBhdF9wcmVub21cIiwgXCJwYXRpZW50X2ZpcnN0X25hbWVcIixcbiAgICAvKiBXZW1pbmQgdjMgKi9cbiAgICBcInZtLXByZW5vbVwiLFxuICAgIC8qIGRhdGEtdGVzdGlkIFJlYWN0L05leHQgKi9cbiAgICBcInBhdGllbnQtZmlyc3RuYW1lXCIsIFwicGF0aWVudC1naXZlbi1uYW1lXCIsIFwiYmVuZWZpY2lhcnktZmlyc3RuYW1lXCIsXG4gICAgLyogZGF0YSBhdHRyaWJ1dGVzICovXG4gICAgXCJpbnB1dC1maXJzdG5hbWVcIiwgXCJpbnB1dC1maXJzdC1uYW1lXCIsIFwiaW5wdXQtcHJlbm9tXCIsXG4gIF0sXG4gIG51bWVyb1NlY3VyaXRlU29jaWFsZTogW1xuICAgIC8qIGZyYW5cdTAwRTdhaXMgc3RhbmRhcmQgKi9cbiAgICBcIm51bWVyb3NlY3VyaXRlc29jaWFsZVwiLCBcIm5zc1wiLCBcIm51bV9zc1wiLCBcIm51bXNzXCIsIFwic2VjdXJpdGVfc29jaWFsZVwiLCBcIm51bWVyb19zZWN1XCIsXG4gICAgXCJudW1fc2VjdVwiLCBcImltbWF0cmljdWxhdGlvblwiLCBcIm5pcnBwXCIsIFwic2VjdVwiLCBcIm1hdHJpY3VsZVwiLCBcIm51bXNlY3VyaXRlXCIsXG4gICAgXCJudW1lcm9fc2VjdXJpdGVfc29jaWFsZVwiLCBcIm51bWVybyBkZSBzZWN1cml0ZSBzb2NpYWxlXCIsIFwibiBzZWN1cml0ZSBzb2NpYWxlXCIsXG4gICAgXCJubyBzZWN1cml0ZSBzb2NpYWxlXCIsIFwibnVtZXJvX2ltbWF0cmljdWxhdGlvblwiLCBcImltbWF0cmljdWxhdGlvbl9hc3N1cmVcIixcbiAgICBcIm51bWVyb19tYXRyaWN1bGVcIiwgXCJtYXRyaWN1bGVfYXNzdXJlXCIsIFwibmlyXCIsIFwibnVtZXJvX25pclwiLCBcIm5pcl9hc3N1cmVcIixcbiAgICBcIm51bV9pbW1hdFwiLCBcImltbWF0XCIsIFwibnVtX25pclwiLCBcIm5pcl9jb21wbGV0XCIsIFwibmlyX2JlbmVmaWNpYWlyZVwiLCBcIm5pcl9iZW5cIixcbiAgICBcImltbWF0X2JlbmVmaWNpYWlyZVwiLCBcImNsZV9uc3NcIiwgXCJuc3NfY2xlXCIsIFwibmlycHBfY2xlXCIsIFwiYmVuZWZpY2lhaXJlX25uaVwiLCBcIm5uaVwiLFxuICAgIFwibnVtYmVuZWZcIiwgXCJudW1fYmVuZWZcIiwgXCJudW1pbnNlZVwiLCBcIm51bV9pbnNlZVwiLCBcImluc2VlXCIsXG4gICAgLyogYW5nbGFpcyAqL1xuICAgIFwic3NuXCIsIFwic29jaWFsX3NlY3VyaXR5XCIsIFwic29jaWFsX3NlY3VyaXR5X251bWJlclwiLCBcInNvY2lhbHNlY3VyaXR5bnVtYmVyXCIsXG4gICAgXCJuYXRpb25hbF9pZFwiLCBcIm5hdGlvbmFsX2luc3VyYW5jZVwiLCBcImluc3VyYW5jZV9udW1iZXJcIixcbiAgICAvKiBjYW1lbENhc2UgLyBmcmFtZXdvcmtzICovXG4gICAgXCJudW1lcm9TZWN1cml0ZVNvY2lhbGVcIiwgXCJudW1TU1wiLCBcIm51bVNlY3VcIiwgXCJudW1JbnNlZVwiLCBcInNlY3VyaXRlU29jaWFsZVwiLFxuICAgIFwibmlyQXNzdXJlXCIsIFwibnVtQXNzdXJlXCIsIFwibmlyQmVuZWZpY2lhaXJlXCIsIFwic29jaWFsU2VjdXJpdHlOdW1iZXJcIixcbiAgICBcIlBhdGllbnROSVJcIiwgXCJOSVJcIiwgXCJTb2NpYWxTZWN1cml0eU5vXCIsIFwiU1NOXCIsIFwiSW5zdXJhbmNlTm9cIixcbiAgICAvKiBFUlAgc3BlY2lmaXF1ZXMgKi9cbiAgICBcInR4dE5TU1wiLCBcInR4dE51bVNTXCIsIFwiY3RsX25zc1wiLCBcInR4dEltbWF0XCIsIFwidGJOU1NcIiwgXCJmbGRfbnNzXCIsXG4gICAgXCJpbnB1dF9uc3NcIiwgXCJjaGFtcF9uc3NcIiwgXCJ3b19uc3NcIiwgXCJhcmNoX25zc1wiLFxuICAgIC8qIGRhdGEgLyBwbGFjZWhvbGRlciBwYXR0ZXJucyAqL1xuICAgIFwiaW5wdXQtc3NuXCIsIFwiaW5wdXQtbnNzXCIsIFwibnVtZXJvIHNlY3VcIiwgXCJudW1lcm8gc3NcIiwgXCJuIGRlIHNlY3VcIixcbiAgICAvKiBBbG1lcnlzIFJPQyBub3V2ZWF1IHBvcnRhaWwgKi9cbiAgICBcImJlbmVmaWNpYWlyZU5uaVwiLCBcIm5pckNvbXBsZXRcIiwgXCJyYW5nTmFpc3NhbmNlXCIsIFwiY29kZUNhaXNzZVwiLCBcIm5pcl9yYW5nXCIsXG4gICAgLyogV2VtaW5kIHYzICovXG4gICAgXCJzdWJzY3JpYmVyTklSXCIsIFwiaW5zdXJlZElkXCIsIFwiaW5zdXJlZF9pZFwiLCBcImJlbmVmaWNpYXJ5X25pclwiLFxuICAgIC8qIFZpYW1lZGlzIEFuZ3VsYXIgKHByZWZpeGUgdm0tKSAqL1xuICAgIFwidm0tbmlyXCIsIFwidm0tbnNzXCIsIFwidm0tc2VjdVwiLFxuICAgIC8qIGRhdGEtdGVzdGlkIHBhdHRlcm5zIFJlYWN0L05leHQgKi9cbiAgICBcInBhdGllbnQtbnNzXCIsIFwiYmVuZWZpY2lhcnktbmlyXCIsIFwiaW5zdXJlZC1uaXJcIiwgXCJuaXItaW5wdXRcIixcbiAgXSxcbiAgZGF0ZU5haXNzYW5jZTogW1xuICAgIC8qIGZyYW5cdTAwRTdhaXMgKi9cbiAgICBcImRhdGVuYWlzc2FuY2VcIiwgXCJkYXRlX25haXNzYW5jZVwiLCBcIm5haXNzYW5jZVwiLCBcImRkblwiLCBcImRhdGVfZGVfbmFpc3NhbmNlXCIsXG4gICAgXCJkYXRlZGVuYWlzc2FuY2VcIiwgXCJuZV9sZVwiLCBcIm5lZV9sZVwiLCBcIm5lbGVcIiwgXCJuZWVsZVwiLCBcImRhdGVfbmFpc1wiLCBcImRhdGVuYWlzXCIsXG4gICAgXCJkYXRlIGRlIG5haXNzYW5jZVwiLCBcIm5haXNzYW5jZSBiZW5lZmljaWFpcmVcIiwgXCJkYXRlIG5haXNzYW5jZSBiZW5lZmljaWFpcmVcIixcbiAgICBcImRhdGVubmFpc3NhbmNlYXNzdXJlXCIsIFwiZGF0ZW5uYWlzc2FuY2Vhc3N1cmVlXCIsIFwibmFpc3NhbmNlYXNzdXJlXCIsXG4gICAgXCJkYXRlbm5haXNzYW5jZWJlbmVmXCIsIFwiZGF0ZSBkZSBuYWlzc2FuY2UgYmVuZWZpY2lhaXJlXCIsIFwiZHRfbmFpc3NcIiwgXCJkYXRlX25haXNzXCIsXG4gICAgXCJkZG5fcGF0aWVudFwiLCBcImRkbl9iZW5lZmljaWFpcmVcIiwgXCJkZG5fYXNzdXJlXCIsXG4gICAgLyogYW5nbGFpcyAqL1xuICAgIFwiYmlydGhkYXRlXCIsIFwiYmlydGhfZGF0ZVwiLCBcImRhdGVvZmJpcnRoXCIsIFwiZGF0ZV9vZl9iaXJ0aFwiLCBcImJpcnRoZGF5XCIsIFwiZG9iXCIsXG4gICAgXCJkYXRlYmlydGhcIiwgXCJib3JuZGF0ZVwiLCBcImJvcm5fZGF0ZVwiLCBcImJpcnRoX2RheVwiLFxuICAgIC8qIGNhbWVsQ2FzZSAvIGZyYW1ld29ya3MgKi9cbiAgICBcImRhdGVOYWlzc2FuY2VcIiwgXCJkYXRlTmFpc3NhbmNlUGF0aWVudFwiLCBcImRhdGVOYWlzc2FuY2VCZW5lZmljaWFpcmVcIixcbiAgICBcImRhdGVOYWlzc2FuY2VBc3N1cmVcIiwgXCJkYXRlT2ZCaXJ0aFwiLCBcImJpcnRoRGF0ZVwiLCBcInBhdGllbnRET0JcIiwgXCJET0JcIixcbiAgICBcIlBhdGllbnRET0JcIiwgXCJCaXJ0aERhdGVcIiwgXCJjdXN0b21lckJpcnRoRGF0ZVwiLCBcImNsaWVudEJpcnRoRGF0ZVwiLFxuICAgIC8qIEVSUCBzcGVjaWZpcXVlcyAqL1xuICAgIFwidHh0RGF0ZU5haXNzYW5jZVwiLCBcImN0bF9kYXRlTmFpc3NcIiwgXCJ0eHRERE5cIiwgXCJ0YkRhdGVOYWlzc1wiLCBcImZsZF9kYXRlX25haXNzXCIsXG4gICAgXCJpbnB1dF9kYXRlbmFpc3NhbmNlXCIsIFwid29fZGRuXCIsIFwiYXJjaF9kZG5cIixcbiAgICAvKiBBbG1lcnlzIFJPQyAqL1xuICAgIFwicmFuZ05haXNzYW5jZUFzc3VyZVwiLCBcImRhdGVOYWlzc2FuY2VBc3N1cmVcIiwgXCJkZG5fYXNzdXJcdTAwRTlcIixcbiAgICAvKiBXZW1pbmQgdjMgKi9cbiAgICBcInBhdGllbnREb2JcIiwgXCJwYXRpZW50X2RvYlwiLCBcInZtLWRhdGVuYWlzc2FuY2VcIixcbiAgICAvKiBDb3NpdW0gLyBpR2VzdGlvbiAqL1xuICAgIFwiZmljaGVfcGF0aWVudF9kZG5cIiwgXCJwYXRfZGRuXCIsXG4gICAgLyogZGF0YS10ZXN0aWQgUmVhY3QvTmV4dCAqL1xuICAgIFwicGF0aWVudC1kb2JcIiwgXCJwYXRpZW50LWJpcnRoZGF0ZVwiLCBcImJlbmVmaWNpYXJ5LWRvYlwiLFxuICAgIC8qIGRhdGEgYXR0cmlidXRlcyAqL1xuICAgIFwiaW5wdXQtZG9iXCIsIFwiaW5wdXQtYmlydGhkYXRlXCIsIFwiaW5wdXQtZGF0ZW5haXNzYW5jZVwiLFxuICBdLFxuXG4gIC8qIFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFxuICAgKiAgQ09OVEFDVCBQQVRJRU5UXG4gICAqIFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MCAqL1xuICB0ZWxlcGhvbmU6IFtcbiAgICBcInRlbGVwaG9uZVwiLCBcInRlbFwiLCBcInBob25lXCIsIFwibW9iaWxlXCIsIFwicG9ydGFibGVcIiwgXCJnc21cIiwgXCJjZWxscGhvbmVcIixcbiAgICBcIm51bV90ZWxcIiwgXCJudW1lcm9fdGVsZXBob25lXCIsIFwidGVsX3BvcnRhYmxlXCIsIFwidGVsX21vYmlsZVwiLCBcInRlbF9maXhlXCIsXG4gICAgXCJ0ZWxfZG9taWNpbGVcIiwgXCJ0ZWxfcHJvXCIsIFwidGVsZXBob25lX2RvbWljaWxlXCIsIFwidGVsZXBob25lX3BvcnRhYmxlXCIsXG4gICAgXCJ0ZWxlcGhvbmVfbW9iaWxlXCIsIFwiY29udGFjdF90ZWxcIiwgXCJpbmZvc19jbGllbnRfdGVsZXBob25lXCIsIFwiY29vcmRvbm5lZXNfdGVsXCIsXG4gICAgXCJ0ZWxfY29udGFjdFwiLCBcInRlbDFcIiwgXCJ0ZWxlcGhvbmUxXCIsIFwicGhvbmUxXCIsIFwibnVtdGVsXCIsXG4gICAgXCJwaG9uZV9udW1iZXJcIiwgXCJwaG9uZW51bWJlclwiLCBcIm1vYmlsZV9waG9uZVwiLCBcImNlbGxfcGhvbmVcIiwgXCJob21lX3Bob25lXCIsXG4gICAgXCJwaG9uZU51bWJlclwiLCBcIm1vYmlsZVBob25lXCIsIFwiY2VsbFBob25lXCIsIFwiaG9tZVBob25lXCIsIFwiY29udGFjdFBob25lXCIsXG4gICAgXCJQYXRpZW50UGhvbmVcIiwgXCJNb2JpbGVQaG9uZVwiLCBcIkhvbWVQaG9uZVwiLCBcIlBob25lTm9cIixcbiAgICBcInR4dFRlbFwiLCBcInR4dFRlbGVwaG9uZVwiLCBcImN0bF90ZWxcIiwgXCJ0YlRlbE1vYmlsZVwiLCBcImZsZF90ZWxcIixcbiAgICBcImlucHV0X3RlbGVwaG9uZVwiLCBcImNoYW1wX3RlbFwiLCBcIndvX3RlbFwiLFxuICAgIFwiaW5wdXQtcGhvbmVcIiwgXCJpbnB1dC10ZWxcIiwgXCJpbnB1dC1tb2JpbGVcIixcbiAgXSxcbiAgZW1haWw6IFtcbiAgICBcImVtYWlsXCIsIFwibWFpbFwiLCBcImNvdXJyaWVsXCIsIFwiYWRyZXNzZV9lbWFpbFwiLCBcImFkcmVzc2VfbWFpbFwiLCBcImUtbWFpbFwiLFxuICAgIFwiY29udGFjdF9lbWFpbFwiLCBcImVtYWlsYWRkcmVzc1wiLCBcImVtYWlsX2FkZHJlc3NcIiwgXCJhZHJlc3NlbWFpbFwiLCBcImFkcmVzc2UgZS1tYWlsXCIsXG4gICAgXCJhZHJlc3NlX2VfbWFpbFwiLCBcImVtYWlsX3BhdGllbnRcIiwgXCJtYWlsX3BhdGllbnRcIiwgXCJlX21haWxcIixcbiAgICBcImVtYWlsQWRkcmVzc1wiLCBcIlBhdGllbnRFbWFpbFwiLCBcIkVtYWlsQWRkcmVzc1wiLFxuICAgIFwidHh0RW1haWxcIiwgXCJ0eHRNYWlsXCIsIFwiY3RsX2VtYWlsXCIsIFwidGJFbWFpbFwiLCBcImZsZF9lbWFpbFwiLFxuICAgIFwiaW5wdXRfZW1haWxcIiwgXCJjaGFtcF9lbWFpbFwiLFxuICAgIFwiaW5wdXQtZW1haWxcIiwgXCJpbnB1dC1tYWlsXCIsXG4gIF0sXG4gIGFkcmVzc2U6IFtcbiAgICBcImFkcmVzc2VcIiwgXCJhZGRyZXNzXCIsIFwicnVlXCIsIFwidm9pZVwiLCBcImFkcmVzc2VfcG9zdGFsZVwiLCBcImFkcmVzc2Vwb3N0YWxlXCIsXG4gICAgXCJsaWduZV8xXCIsIFwiYWRyZXNzZV9saWduZTFcIiwgXCJhZHJlc3NlMVwiLCBcImFkcmVzc2VfMVwiLCBcIm51bWVyb19ydWVcIixcbiAgICBcInN0cmVldFwiLCBcInN0cmVldF9hZGRyZXNzXCIsIFwic3RyZWV0YWRkcmVzc1wiLCBcImFkZHJlc3NfbGluZTFcIiwgXCJhZGRyZXNzX2xpbmVfMVwiLFxuICAgIFwibGlnbmUxXCIsIFwiYWRyZXNzZWxpZ25lMVwiLCBcImFkcmVzc2VfZG9taWNpbGVcIiwgXCJsaWduZV9hZHJlc3NlXCIsXG4gICAgXCJ0eHRBZHJlc3NlXCIsIFwiY3RsX2FkcmVzc2VcIiwgXCJmbGRfYWRyZXNzZVwiLCBcImFkclwiLFxuICAgIFwiaW5wdXRfYWRyZXNzZVwiLCBcImNoYW1wX2FkcmVzc2VcIixcbiAgICBcImlucHV0LWFkZHJlc3NcIiwgXCJpbnB1dC1hZHJlc3NlXCIsXG4gIF0sXG4gIGNvZGVQb3N0YWw6IFtcbiAgICBcImNvZGVwb3N0YWxcIiwgXCJjb2RlX3Bvc3RhbFwiLCBcImNwXCIsIFwiemlwY29kZVwiLCBcInppcF9jb2RlXCIsIFwiemlwXCIsXG4gICAgXCJwb3N0YWxfY29kZVwiLCBcInBvc3RhbGNvZGVcIiwgXCJjb2RlIHBvc3RhbFwiLCBcImNwX3ZpbGxlXCIsIFwiY2Rwb3N0YWxcIixcbiAgICBcInBvc3Rjb2RlXCIsIFwicG9zdF9jb2RlXCIsXG4gICAgXCJ0eHRDUFwiLCBcImN0bF9jcFwiLCBcImZsZF9jcFwiLFxuICAgIFwiaW5wdXRfY3BcIiwgXCJjaGFtcF9jcFwiLFxuICAgIFwiaW5wdXQtemlwXCIsIFwiaW5wdXQtemlwY29kZVwiLCBcImlucHV0LWNwXCIsXG4gIF0sXG4gIHZpbGxlOiBbXG4gICAgXCJ2aWxsZVwiLCBcImNpdHlcIiwgXCJsb2NhbGl0ZVwiLCBcImNvbW11bmVcIiwgXCJtdW5pY2lwYWxpdHlcIiwgXCJ0b3duXCIsXG4gICAgXCJub21fdmlsbGVcIiwgXCJ2aWxsZV9jb21tdW5lXCIsIFwiY29tbXVuZV9yZXNpZGVuY2VcIiwgXCJsb2NhbGl0eVwiLFxuICAgIFwidHh0VmlsbGVcIiwgXCJjdGxfdmlsbGVcIiwgXCJmbGRfdmlsbGVcIixcbiAgICBcImlucHV0X3ZpbGxlXCIsIFwiY2hhbXBfdmlsbGVcIixcbiAgICBcImlucHV0LWNpdHlcIiwgXCJpbnB1dC12aWxsZVwiLFxuICBdLFxuXG4gIC8qIFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFxuICAgKiAgT1JET05OQU5DRSAvIFBSRVNDUklQVElPTlxuICAgKiBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTAgKi9cbiAgbm9tT3BodGFsbW9sb2d1ZTogW1xuICAgIFwibm9tb3BodGFsbW9sb2d1ZVwiLCBcIm5vbV9tZWRlY2luXCIsIFwibWVkZWNpblwiLCBcInByZXNjcmlwdGV1clwiLCBcIm5vbV9wcmVzY3JpcHRldXJcIixcbiAgICBcImRvY3RldXJcIiwgXCJvcGh0YWxtb2xvZ3VlXCIsIFwib3BodGFsbW9cIiwgXCJub21fZG9jdGV1clwiLCBcIm5vbW1lZGVjaW5cIixcbiAgICBcIm1lZGVjaW5fcHJlc2NyaXB0ZXVyXCIsIFwibm9tIHByZXNjcmlwdGV1clwiLCBcImRvY3RldXIgcHJlc2NyaXB0ZXVyXCIsXG4gICAgXCJub21fb3BodGFsbW9cIiwgXCJkclwiLCBcIm5vbV9kclwiLCBcInByZXNjcmliZXJcIiwgXCJkb2N0b3JcIixcbiAgICBcIlByZXNjcmliZXJOYW1lXCIsIFwiUHJhY3RpdGlvbmVyTmFtZVwiLCBcIlJlZmVycmVkQnlcIixcbiAgICBcInR4dFByZXNjcmlwdGV1clwiLCBcImN0bF9wcmVzY3JpcHRldXJcIixcbiAgXSxcbiAgcnBwczogW1xuICAgIC8qIHN0YW5kYXJkICovXG4gICAgXCJycHBzXCIsIFwibnVtX3JwcHNcIiwgXCJudW1lcm9fcnBwc1wiLCBcImlkZW50aWZpYW50X3JwcHNcIiwgXCJjb2RlX3JwcHNcIiwgXCJuX3JwcHNcIixcbiAgICBcImlkX3ByZXNjcmlwdGV1clwiLCBcIm51bXJwcHNcIiwgXCJhZGVsaVwiLCBcIm51bV9hZGVsaVwiLCBcIm51bWVyb19hZGVsaVwiLFxuICAgIFwibnVtYW1cIiwgXCJudW1fYW1cIiwgXCJudW1lcm9fYW1cIiwgXCJudW1hbXByZXNjcmlwdGV1clwiLCBcImZpbmVzc1wiLFxuICAgIFwibnVtX3ByZXNjcmlwdGV1clwiLCBcInByZXNjcmliZXJfaWRcIixcbiAgICAvKiB2YXJpYXRpb25zIHBvcnRhaWxzICovXG4gICAgXCJycHBzX3ByZXNjcmlwdGV1clwiLCBcIm5vX3JwcHNcIiwgXCJuX3JwcHNfcHJlc2NyaXB0ZXVyXCIsIFwiY29kZVJQUFNcIixcbiAgICBcInJwcHNfbWVkZWNpblwiLCBcInJwcHNfb3BodGFsbW9sb2d1ZVwiLCBcInJwcHNfb3BodGFsbW9cIiwgXCJycHBzTnVtYmVyXCIsXG4gICAgXCJycHBzX2RyXCIsIFwibnVtX2FtX3ByZXNjcmlwdGV1clwiLCBcImlkX2FtXCIsIFwibnVtZXJvX2FtX21lZGVjaW5cIixcbiAgICBcIm51bWFtcHJlc2NyaWJldXJcIiwgXCJudW1lcm9hZGVsaVwiLCBcImlkZW50aWZpYW50X2FtXCIsXG4gICAgXCJpZGVudGlmaWFudF9wcm9mZXNzaW9ubmVsXCIsIFwiaWRfcHJvZmVzc2lvbm5lbFwiLCBcIm51bV9wcm9mZXNzaW9ubmVsXCIsXG4gICAgXCJudW1fZmluZXNzXCIsIFwiZmluZXNzX3ByZXNjcmlwdGV1clwiLFxuICAgIC8qIGNhbWVsQ2FzZSAvIGZyYW1ld29ya3MgKi9cbiAgICBcIlByZXNjcmliZXJJZFwiLCBcIlByZXNjcmliZXJOb1wiLCBcIlJQUFNOb1wiLCBcIlByYWN0aXRpb25lcklkXCIsXG4gICAgXCJwcmVzY3JpcHRldXJScHBzXCIsIFwibWVkZWNpblJwcHNcIiwgXCJudW1SUFBTXCIsIFwiY29kZUFtXCIsXG4gICAgLyogQWxtZXJ5cyBST0MgKi9cbiAgICBcIm51bVByZXNjcmlwdGV1clwiLCBcImlkUHJlc2NyaXB0ZXVyXCIsIFwiY29kZVByYXRpY2llblwiLFxuICAgIC8qIEVSUCAqL1xuICAgIFwidHh0UlBQU1wiLCBcImN0bF9ycHBzXCIsIFwiZmxkX3JwcHNcIiwgXCJ3b19ycHBzXCIsXG4gICAgLyogZGF0YS10ZXN0aWQgKi9cbiAgICBcInByZXNjcmliZXItcnBwc1wiLCBcImRvY3Rvci1ycHBzXCIsIFwicHJlc2NyaWJlci1pZFwiLFxuICBdLFxuICBkYXRlT3Jkb25uYW5jZTogW1xuICAgIC8qIHN0YW5kYXJkICovXG4gICAgXCJkYXRlb3Jkb25uYW5jZVwiLCBcImRhdGVfb3Jkb25uYW5jZVwiLCBcIm9yZG9ubmFuY2VfZGF0ZVwiLCBcInByZXNjcmlwdGlvbl9kYXRlXCIsXG4gICAgXCJkYXRlX3ByZXNjcmlwdGlvblwiLCBcImRhdGVfb3Jkb1wiLCBcImRhdGVvcmRvXCIsIFwiZGF0ZSBvcmRvbm5hbmNlXCIsXG4gICAgXCJkYXRlIGRlIGwnb3Jkb25uYW5jZVwiLCBcImRhdGUgZGUgbG9yZG9ubmFuY2VcIiwgXCJkYXRlIHByZXNjcmlwdGlvblwiLFxuICAgIFwiZGF0ZW9yZG9ubmFuY2VlZGl0XCIsIFwiZHRfb3Jkb25uYW5jZVwiLCBcImRhdGVfcHJlc2NcIiwgXCJkYXRlX3J4XCIsIFwicnhfZGF0ZVwiLFxuICAgIC8qIHZhcmlhdGlvbnMgcG9ydGFpbHMgKi9cbiAgICBcImRhdGVfb3Jkb19wYXRpZW50XCIsIFwiZGF0ZW9yZG9ubmFuY2VkZXByZXNjcmlwdGlvblwiLCBcImRhdGVfZW1pc3Npb25cIixcbiAgICBcImRhdGVfZXRhYmxpc3NlbWVudFwiLCBcImRhdGVfcmVkYWN0aW9uXCIsIFwiZGF0ZXByZXNjcmlwdGlvblwiLFxuICAgIFwiZGF0ZV9ldGFibGlzc2VtZW50X29yZG9ubmFuY2VcIiwgXCJkYXRlZW1pc3Npb25vcmRvbm5hbmNlXCIsXG4gICAgXCJkYXRlX2RlX3ByZXNjcmlwdGlvblwiLCBcImRhdGVfZGVfbG9yZG9ubmFuY2VcIixcbiAgICBcIm9yZG9ubmFuY2VfZXRhYmxpZV9sZVwiLCBcIm9yZG9fZGF0ZVwiLCBcImRhdGVfclx1MDBFOWRhY3Rpb25cIixcbiAgICAvKiBhbmdsYWlzICovXG4gICAgXCJwcmVzY3JpcHRpb25fZGF0ZVwiLCBcInByZXNjcmlwdGlvbkRhdGVcIiwgXCJyeF9kYXRlXCIsIFwib3JkZXJfZGF0ZVwiLFxuICAgIFwiaXNzdWVfZGF0ZVwiLCBcImlzc3VhbmNlX2RhdGVcIiwgXCJzY3JpcHRfZGF0ZVwiLFxuICAgIC8qIGNhbWVsQ2FzZSAvIGZyYW1ld29ya3MgKi9cbiAgICBcImRhdGVPcmRvbm5hbmNlXCIsIFwiZGF0ZVByZXNjcmlwdGlvblwiLCBcImRhdGVSeFwiLCBcInJ4RGF0ZVwiLFxuICAgIFwicHJlc2NyaXB0aW9uRGF0ZVwiLCBcIm9yZGVyRGF0ZVwiLCBcImlzc3VlZERhdGVcIixcbiAgICAvKiBBbG1lcnlzIFJPQyAvIFdlbWluZCAqL1xuICAgIFwiZGF0ZVByZXNjcmlwdGlvbk9yZG9ubmFuY2VcIiwgXCJkYXRlRGVsaXZyYW5jZVwiLCBcImRhdGVFbWlzc2lvblwiLFxuICAgIC8qIEVSUCAqL1xuICAgIFwidHh0RGF0ZU9yZG9cIiwgXCJjdGxfZGF0ZU9yZG9cIiwgXCJmbGRfZGF0ZV9vcmRvXCIsIFwid29fZGF0ZW9yZG9cIixcbiAgICAvKiBkYXRhLXRlc3RpZCAqL1xuICAgIFwicHJlc2NyaXB0aW9uLWRhdGVcIiwgXCJvcmRvbm5hbmNlLWRhdGVcIiwgXCJyeC1kYXRlXCIsXG4gIF0sXG4gIGRhdGVWYWxpZGl0ZTogW1xuICAgIFwiZGF0ZXZhbGlkaXRlXCIsIFwiZGF0ZV92YWxpZGl0ZVwiLCBcInZhbGlkaXRlXCIsIFwidmFsaWRpdGVfb3Jkb25uYW5jZVwiLFxuICAgIFwiZGF0ZSB2YWxpZGl0ZVwiLCBcImRhdGUgZGUgdmFsaWRpdGVcIiwgXCJleHBpcnlcIiwgXCJ2YWxpZGl0eV9kYXRlXCIsXG4gIF0sXG4gIG5vbVBhdGllbnQ6IFtcbiAgICBcIm5vbXBhdGllbnRcIiwgXCJub21fcGF0aWVudFwiLCBcInBhdGllbnRfbm9tXCIsIFwicGF0aWVudF9uYW1lXCIsIFwicGF0aWVudE5hbWVcIixcbiAgICBcInBhdGllbnRfbGFzdF9uYW1lXCIsIFwicGF0aWVudExhc3ROYW1lXCIsXG4gIF0sXG4gIHByZW5vbVBhdGllbnQ6IFtcbiAgICBcInByZW5vbXBhdGllbnRcIiwgXCJwcmVub21fcGF0aWVudFwiLCBcInBhdGllbnRfcHJlbm9tXCIsIFwicGF0aWVudF9maXJzdF9uYW1lXCIsXG4gICAgXCJwYXRpZW50Rmlyc3ROYW1lXCIsIFwicGF0aWVudEZvcmVuYW1lXCIsXG4gIF0sXG4gIGRhdGVOYWlzc2FuY2VQYXRpZW50OiBbXG4gICAgXCJkYXRlbm5haXNzYW5jZXBhdGllbnRcIiwgXCJkYXRlbmFpc3NhbmNlX3BhdGllbnRcIiwgXCJwYXRpZW50X2RkblwiLCBcInBhdGllbnRfbmFpc3NhbmNlXCIsXG4gICAgXCJwYXRpZW50RE9CXCIsIFwicGF0aWVudF9kYXRlX29mX2JpcnRoXCIsIFwicGF0aWVudF9iaXJ0aGRhdGVcIixcbiAgXSxcbiAgZGlzdGFuY2VQdXBpbGxhaXJlOiBbXG4gICAgLyogc3RhbmRhcmQgKi9cbiAgICBcImRpc3RhbmNlcHVwaWxsYWlyZVwiLCBcImRwXCIsIFwiZGlzdF9wdXBpbGxhaXJlXCIsIFwiZWNhcnRfcHVwaWxsYWlyZVwiLCBcInB1cGlsbGVcIixcbiAgICBcImRpc3RhbmNlX3B1cGlsbGFpcmVcIiwgXCJlY2FydHB1cGlsbGFpcmVcIiwgXCJlY2FydCBpbnRlci1wdXBpbGxhaXJlXCIsXG4gICAgXCJkaXN0YW5jZSBpbnRlcnB1cGlsbGFpcmVcIixcbiAgICAvKiB2YXJpYXRpb25zICovXG4gICAgXCJkaXN0X3B1cGlsXCIsIFwiZHBfdG90YWxcIiwgXCJkcF9vZFwiLCBcImRwX29nXCIsIFwiZWNhcnRfcHVwaWxcIixcbiAgICBcImVjYXJ0cHVwaWxcIiwgXCJpbnRlcnB1cGlsbGFpcmVcIiwgXCJpbnRlcl9wdXBpbGxhaXJlXCIsXG4gICAgXCJkaXN0YW5jZXB1cGlsbGFpcmVfbG9pblwiLCBcImRwdmxcIiwgXCJkcF92bFwiLCBcImRpc3RhbmNlcHVwaWxsYWlyZVZMXCIsXG4gICAgXCJkaXN0YW5jZXB1cGlsbGFpcmVfcHJlc1wiLCBcImRwdnBcIiwgXCJkcF92cFwiLCBcImRpc3RhbmNlcHVwaWxsYWlyZVZQXCIsXG4gICAgXCJlaXBcIiwgXCJlaXBfdmxcIiwgXCJlaXBfdnBcIiwgXCJlY2FydGludGVycHVwaWxsYWlyZVwiLFxuICAgIC8qIGFuZ2xhaXMgKi9cbiAgICBcInBkXCIsIFwicHVwaWxsYXJ5X2Rpc3RhbmNlXCIsIFwiaXBkXCIsIFwiaW50ZXJfcHVwaWxsYXJ5XCIsIFwiaW50ZXJwdXBpbGxhcnlcIixcbiAgICBcInB1cGlsX2Rpc3RhbmNlXCIsIFwiaW50ZXJfcHVwaWxfZGlzdGFuY2VcIiwgXCJiaW5vY3VsYXJfcGRcIixcbiAgICAvKiBjYW1lbENhc2UgLyBmcmFtZXdvcmtzICovXG4gICAgXCJkaXN0YW5jZVB1cGlsbGFpcmVcIiwgXCJkaXN0YW5jZVBEXCIsIFwicHVwaWxsYXJ5RGlzdGFuY2VcIiwgXCJpbnRlcnB1cGlsbGFyeURpc3RhbmNlXCIsXG4gICAgLyogQWxtZXJ5cyAvIFdlbWluZCAqL1xuICAgIFwiZXBkXCIsIFwiZGlzdF9pbnRlcnB1cGlsbGFpcmVcIixcbiAgICAvKiBFUlAgKi9cbiAgICBcInR4dERQXCIsIFwiZmxkX2RwXCIsIFwiaW5wdXRfZHBcIiwgXCJjaGFtcF9kcFwiLFxuICAgIC8qIGRhdGEtdGVzdGlkICovXG4gICAgXCJwdXBpbGxhcnktZGlzdGFuY2VcIiwgXCJwZC1pbnB1dFwiLCBcImRwLWlucHV0XCIsXG4gIF0sXG4gIHR5cGVQcmVzY3JpcHRpb246IFtcbiAgICBcInR5cGVwcmVzY3JpcHRpb25cIiwgXCJ0eXBlX3ByZXNjcmlwdGlvblwiLCBcInR5cGVfZXF1aXBlbWVudFwiLCBcImVxdWlwZW1lbnRcIixcbiAgICBcInR5cGVfdmVycmVcIiwgXCJ0eXBlZXF1aXBlbWVudFwiLCBcIm5hdHVyZV9lcXVpcGVtZW50XCIsIFwicHJlc2NyaXB0aW9uX3R5cGVcIixcbiAgICBcImVxdWlwbWVudF90eXBlXCIsIFwibGVuc190eXBlXCIsIFwibmF0dXJlX2Rvc3NpZXJcIiwgXCJuYXR1cmVkb3NzaWVyXCIsXG4gIF0sXG4gIHJlbWFycXVlczogW1xuICAgIFwicmVtYXJxdWVzXCIsIFwibm90ZXNcIiwgXCJjb21tZW50YWlyZVwiLCBcIm9ic2VydmF0aW9uc1wiLCBcIm5vdGVcIiwgXCJjb21tZW50YWlyZXNcIixcbiAgICBcImluZm9ybWF0aW9uc19jb21wbGVtZW50YWlyZXNcIiwgXCJpbmZvc19jb21wXCIsIFwibWVtb1wiLCBcIm5vdGVfaW50ZXJuZVwiLFxuICAgIFwicmVtYXJxdWVcIiwgXCJub3Rlc19kb3NzaWVyXCIsIFwibm90ZXNfaW50ZXJuZXNcIiwgXCJvYnNlcnZhdGlvblwiLFxuICAgIFwidHh0Tm90ZXNcIiwgXCJjdGxfbm90ZXNcIiwgXCJub3Rlc19saWJyZXNcIixcbiAgXSxcblxuICAvKiBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcbiAgICogIENPUlJFQ1RJT05TIExVTkVUVEVTIE9EIChPZWlsIERyb2l0KVxuICAgKiBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTAgKi9cbiAgXCJsdW5ldHRlc09ELnNwaGVyZVwiOiBbXG4gICAgXCJzcGhlcmVfb2RcIiwgXCJzcGhfb2RcIiwgXCJvZF9zcGhcIiwgXCJzcGhlcmVvZFwiLCBcInNwaGVyZSBvZFwiLCBcInNwaCBvZFwiLFxuICAgIFwic3BoZXJlX3ZlcnJlX2Ryb2l0XCIsIFwic3BoZXJldmVycmVkcm9pdFwiLCBcIm9kX3NwaGVyZVwiLCBcInJfc3BoZXJlXCIsXG4gICAgXCJzcGhfZHJvaXRcIiwgXCJzcGhlcmVfZFwiLCBcInNwaGVyZV92bF9vZFwiLCBcInNwaGVyZV9sb2luX29kXCIsIFwic3ZsX29kXCIsXG4gICAgXCJzcGhfclwiLCBcInNwaG9kXCIsIFwicmlnaHRfc3BoZXJlXCIsIFwic3BoZXJlUmlnaHRcIiwgXCJzcGhlcmVfb2VpbF9kcm9pdFwiLFxuICAgIFwicmVfc3BoXCIsIFwic3BoZXJlX3ZwX29kXCIsIFwiZHJvaXRfc3BoZXJlXCIsXG4gICAgLyogQWxtZXJ5cyBST0MgLyBXZW1pbmQgdjMgKi9cbiAgICBcInNwaE9EXCIsIFwic3BoZXJlT0RcIiwgXCJTcGhPRFwiLCBcIlNwaGVyZU9EXCIsIFwic3BoX3ZsX29kXCIsXG4gICAgXCJ2ZXJyZV9kcm9pdF9zcGhcIiwgXCJ2ZF9zcGhcIiwgXCJWRF9zcGhlcmVcIiwgXCJvZWlsRHJvaXRfc3BoZXJlXCIsXG4gICAgLyogTEJPIC8gT3B0aW11bSAqL1xuICAgIFwib2Rfc3BoZXJlX3ZsXCIsIFwic3BoZXJlVkxPRFwiLCBcInNwaF9vZF92bFwiLFxuICAgIC8qIGRhdGEtdGVzdGlkICovXG4gICAgXCJvZC1zcGhlcmVcIiwgXCJyaWdodC1zcGhlcmVcIiwgXCJzcGhlcmUtb2RcIixcbiAgXSxcbiAgXCJsdW5ldHRlc09ELmN5bGluZHJlXCI6IFtcbiAgICBcImN5bGluZHJlX29kXCIsIFwiY3lsX29kXCIsIFwib2RfY3lsXCIsIFwiY3lsaW5kcmVvZFwiLCBcImN5bCBvZFwiLCBcImN5bGluZHJlIG9kXCIsXG4gICAgXCJjeWxpbmRyZV92ZXJyZV9kcm9pdFwiLCBcInJfY3lsaW5kcmVcIiwgXCJjeWxfZHJvaXRcIiwgXCJjeWxpbmRyZV9kXCIsXG4gICAgXCJjeWxfclwiLCBcImN5bG9kXCIsIFwicmlnaHRfY3lsaW5kZXJcIiwgXCJjeWxpbmRlclJpZ2h0XCIsIFwiY3lsX3ZsX29kXCIsXG4gICAgXCJvZF9jeWxpbmRyZVwiLCBcImRyb2l0X2N5bGluZHJlXCIsIFwicmVfY3lsXCIsXG4gICAgLyogQWxtZXJ5cyBST0MgLyBXZW1pbmQgdjMgKi9cbiAgICBcImN5bE9EXCIsIFwiY3lsaW5kcmVPRFwiLCBcIkN5bE9EXCIsIFwiQ3lsaW5kcmVPRFwiLFxuICAgIFwidmVycmVfZHJvaXRfY3lsXCIsIFwidmRfY3lsXCIsIFwiVkRfY3lsaW5kcmVcIiwgXCJvZWlsRHJvaXRfY3lsaW5kcmVcIixcbiAgICAvKiBkYXRhLXRlc3RpZCAqL1xuICAgIFwib2QtY3lsaW5kcmVcIiwgXCJyaWdodC1jeWxpbmRlclwiLCBcImN5bGluZHJlLW9kXCIsXG4gIF0sXG4gIFwibHVuZXR0ZXNPRC5heGVcIjogW1xuICAgIFwiYXhlX29kXCIsIFwiYXhfb2RcIiwgXCJvZF9heGVcIiwgXCJheGVvZFwiLCBcImF4ZSBvZFwiLCBcImF4IG9kXCIsXG4gICAgXCJheGVfdmVycmVfZHJvaXRcIiwgXCJyX2F4ZVwiLCBcImF4ZV9kcm9pdFwiLCBcImF4ZV9kXCIsIFwiYXhfclwiLCBcImF4b2RcIixcbiAgICBcInJpZ2h0X2F4aXNcIiwgXCJheGlzUmlnaHRcIiwgXCJheGVfdmxfb2RcIiwgXCJvZF9heFwiLCBcImRyb2l0X2F4ZVwiLFxuICAgIFwiYXhpc19vZFwiLCBcInJlX2F4XCIsXG4gICAgLyogQWxtZXJ5cyBST0MgLyBXZW1pbmQgdjMgKi9cbiAgICBcImF4ZU9EXCIsIFwiQXhlT0RcIiwgXCJ2ZXJyZV9kcm9pdF9heGVcIiwgXCJ2ZF9heGVcIiwgXCJWRF9heGVcIixcbiAgICBcIm9laWxEcm9pdF9heGVcIiwgXCJheGVfY29ycmVjdGlvbl9vZFwiLFxuICAgIC8qIGRhdGEtdGVzdGlkICovXG4gICAgXCJvZC1heGVcIiwgXCJyaWdodC1heGlzXCIsIFwiYXhlLW9kXCIsXG4gIF0sXG4gIFwibHVuZXR0ZXNPRC5hZGRpdGlvblwiOiBbXG4gICAgXCJhZGRpdGlvbl9vZFwiLCBcImFkZF9vZFwiLCBcIm9kX2FkZFwiLCBcImFkZGl0aW9ub2RcIiwgXCJhZGQgb2RcIiwgXCJhZGRpdGlvbiBvZFwiLFxuICAgIFwicl9hZGRpdGlvblwiLCBcImFkZF9kcm9pdFwiLCBcImFkZGl0aW9uX2RcIiwgXCJhZGRfclwiLCBcImFkZG9kXCIsXG4gICAgXCJyaWdodF9hZGRpdGlvblwiLCBcImFkZFJpZ2h0XCIsIFwiYWRkX3ZwX29kXCIsIFwib2RfYWRkaXRpb25cIixcbiAgICBcImRyb2l0X2FkZGl0aW9uXCIsIFwicmVfYWRkXCIsXG4gICAgLyogQWxtZXJ5cyBST0MgLyBXZW1pbmQgdjMgKi9cbiAgICBcImFkZE9EXCIsIFwiYWRkaXRpb25PRFwiLCBcIkFkZE9EXCIsIFwidmVycmVfZHJvaXRfYWRkXCIsIFwidmRfYWRkXCIsXG4gICAgXCJvZWlsRHJvaXRfYWRkaXRpb25cIiwgXCJhZGRfdnBcIixcbiAgICAvKiBkYXRhLXRlc3RpZCAqL1xuICAgIFwib2QtYWRkaXRpb25cIiwgXCJyaWdodC1hZGRpdGlvblwiLCBcImFkZGl0aW9uLW9kXCIsXG4gIF0sXG5cbiAgLyogXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXG4gICAqICBDT1JSRUNUSU9OUyBMVU5FVFRFUyBPRyAoT2VpbCBHYXVjaGUpXG4gICAqIFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MCAqL1xuICBcImx1bmV0dGVzT0cuc3BoZXJlXCI6IFtcbiAgICBcInNwaGVyZV9vZ1wiLCBcInNwaF9vZ1wiLCBcIm9nX3NwaFwiLCBcInNwaGVyZW9nXCIsIFwic3BoZXJlIG9nXCIsIFwic3BoIG9nXCIsXG4gICAgXCJzcGhlcmVfdmVycmVfZ2F1Y2hlXCIsIFwibF9zcGhlcmVcIiwgXCJzcGhfZ2F1Y2hlXCIsIFwic3BoZXJlX2dcIixcbiAgICBcInNwaGVyZV92bF9vZ1wiLCBcInNwaGVyZV9sb2luX29nXCIsIFwic3ZsX29nXCIsIFwic3BoX2xcIiwgXCJzcGhvZ1wiLFxuICAgIFwibGVmdF9zcGhlcmVcIiwgXCJzcGhlcmVMZWZ0XCIsIFwic3BoZXJlX29laWxfZ2F1Y2hlXCIsIFwibGVfc3BoXCIsXG4gICAgXCJzcGhlcmVfdnBfb2dcIiwgXCJnYXVjaGVfc3BoZXJlXCIsXG4gICAgLyogQWxtZXJ5cyBST0MgLyBXZW1pbmQgdjMgKi9cbiAgICBcInNwaE9HXCIsIFwic3BoZXJlT0dcIiwgXCJTcGhPR1wiLCBcIlNwaGVyZU9HXCIsIFwic3BoX3ZsX29nXCIsXG4gICAgXCJ2ZXJyZV9nYXVjaGVfc3BoXCIsIFwidmdfc3BoXCIsIFwiVkdfc3BoZXJlXCIsIFwib2VpbEdhdWNoZV9zcGhlcmVcIixcbiAgICAvKiBMQk8gLyBPcHRpbXVtICovXG4gICAgXCJvZ19zcGhlcmVfdmxcIiwgXCJzcGhlcmVWTE9HXCIsIFwic3BoX29nX3ZsXCIsXG4gICAgLyogZGF0YS10ZXN0aWQgKi9cbiAgICBcIm9nLXNwaGVyZVwiLCBcImxlZnQtc3BoZXJlXCIsIFwic3BoZXJlLW9nXCIsXG4gIF0sXG4gIFwibHVuZXR0ZXNPRy5jeWxpbmRyZVwiOiBbXG4gICAgXCJjeWxpbmRyZV9vZ1wiLCBcImN5bF9vZ1wiLCBcIm9nX2N5bFwiLCBcImN5bGluZHJlb2dcIiwgXCJjeWwgb2dcIiwgXCJjeWxpbmRyZSBvZ1wiLFxuICAgIFwiY3lsaW5kcmVfdmVycmVfZ2F1Y2hlXCIsIFwibF9jeWxpbmRyZVwiLCBcImN5bF9nYXVjaGVcIiwgXCJjeWxpbmRyZV9nXCIsXG4gICAgXCJjeWxfbFwiLCBcImN5bG9nXCIsIFwibGVmdF9jeWxpbmRlclwiLCBcImN5bGluZGVyTGVmdFwiLCBcImN5bF92bF9vZ1wiLFxuICAgIFwib2dfY3lsaW5kcmVcIiwgXCJnYXVjaGVfY3lsaW5kcmVcIiwgXCJsZV9jeWxcIixcbiAgICAvKiBBbG1lcnlzIFJPQyAvIFdlbWluZCB2MyAqL1xuICAgIFwiY3lsT0dcIiwgXCJjeWxpbmRyZU9HXCIsIFwiQ3lsT0dcIiwgXCJDeWxpbmRyZU9HXCIsXG4gICAgXCJ2ZXJyZV9nYXVjaGVfY3lsXCIsIFwidmdfY3lsXCIsIFwiVkdfY3lsaW5kcmVcIiwgXCJvZWlsR2F1Y2hlX2N5bGluZHJlXCIsXG4gICAgLyogZGF0YS10ZXN0aWQgKi9cbiAgICBcIm9nLWN5bGluZHJlXCIsIFwibGVmdC1jeWxpbmRlclwiLCBcImN5bGluZHJlLW9nXCIsXG4gIF0sXG4gIFwibHVuZXR0ZXNPRy5heGVcIjogW1xuICAgIFwiYXhlX29nXCIsIFwiYXhfb2dcIiwgXCJvZ19heGVcIiwgXCJheGVvZ1wiLCBcImF4ZSBvZ1wiLCBcImF4IG9nXCIsXG4gICAgXCJheGVfdmVycmVfZ2F1Y2hlXCIsIFwibF9heGVcIiwgXCJheGVfZ2F1Y2hlXCIsIFwiYXhlX2dcIiwgXCJheF9sXCIsIFwiYXhvZ1wiLFxuICAgIFwibGVmdF9heGlzXCIsIFwiYXhpc0xlZnRcIiwgXCJheGVfdmxfb2dcIiwgXCJvZ19heFwiLCBcImdhdWNoZV9heGVcIixcbiAgICBcImF4aXNfb2dcIiwgXCJsZV9heFwiLFxuICAgIC8qIEFsbWVyeXMgUk9DIC8gV2VtaW5kIHYzICovXG4gICAgXCJheGVPR1wiLCBcIkF4ZU9HXCIsIFwidmVycmVfZ2F1Y2hlX2F4ZVwiLCBcInZnX2F4ZVwiLCBcIlZHX2F4ZVwiLFxuICAgIFwib2VpbEdhdWNoZV9heGVcIiwgXCJheGVfY29ycmVjdGlvbl9vZ1wiLFxuICAgIC8qIGRhdGEtdGVzdGlkICovXG4gICAgXCJvZy1heGVcIiwgXCJsZWZ0LWF4aXNcIiwgXCJheGUtb2dcIixcbiAgXSxcbiAgXCJsdW5ldHRlc09HLmFkZGl0aW9uXCI6IFtcbiAgICBcImFkZGl0aW9uX29nXCIsIFwiYWRkX29nXCIsIFwib2dfYWRkXCIsIFwiYWRkaXRpb25vZ1wiLCBcImFkZCBvZ1wiLCBcImFkZGl0aW9uIG9nXCIsXG4gICAgXCJsX2FkZGl0aW9uXCIsIFwiYWRkX2dhdWNoZVwiLCBcImFkZGl0aW9uX2dcIiwgXCJhZGRfbFwiLCBcImFkZG9nXCIsXG4gICAgXCJsZWZ0X2FkZGl0aW9uXCIsIFwiYWRkTGVmdFwiLCBcImFkZF92cF9vZ1wiLCBcIm9nX2FkZGl0aW9uXCIsXG4gICAgXCJnYXVjaGVfYWRkaXRpb25cIiwgXCJsZV9hZGRcIixcbiAgICAvKiBBbG1lcnlzIFJPQyAvIFdlbWluZCB2MyAqL1xuICAgIFwiYWRkT0dcIiwgXCJhZGRpdGlvbk9HXCIsIFwiQWRkT0dcIiwgXCJ2ZXJyZV9nYXVjaGVfYWRkXCIsIFwidmdfYWRkXCIsXG4gICAgXCJvZWlsR2F1Y2hlX2FkZGl0aW9uXCIsXG4gICAgLyogZGF0YS10ZXN0aWQgKi9cbiAgICBcIm9nLWFkZGl0aW9uXCIsIFwibGVmdC1hZGRpdGlvblwiLCBcImFkZGl0aW9uLW9nXCIsXG4gIF0sXG5cbiAgLyogXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXG4gICAqICBDT1JSRUNUSU9OUyBMRU5USUxMRVMgT0RcbiAgICogXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwICovXG4gIFwibGVudGlsbGVzT0Quc3BoZXJlXCI6ICAgW1wic3BoZXJlX2xlbnRpbGxlX29kXCIsIFwic3BoX2xlbnRpbGxlX29kXCIsIFwibGVudGlsbGVfb2Rfc3BoZXJlXCIsIFwibG9kX3NwaFwiLCBcImNvbnRhY3Rfc3BoZXJlX29kXCIsIFwiY2xfc3BoX29kXCJdLFxuICBcImxlbnRpbGxlc09ELmN5bGluZHJlXCI6IFtcImN5bGluZHJlX2xlbnRpbGxlX29kXCIsIFwiY3lsX2xlbnRpbGxlX29kXCIsIFwibGVudGlsbGVfb2RfY3lsXCIsIFwibG9kX2N5bFwiLCBcImNvbnRhY3RfY3lsX29kXCIsIFwiY2xfY3lsX29kXCJdLFxuICBcImxlbnRpbGxlc09ELmF4ZVwiOiAgICAgIFtcImF4ZV9sZW50aWxsZV9vZFwiLCBcImF4X2xlbnRpbGxlX29kXCIsIFwibGVudGlsbGVfb2RfYXhlXCIsIFwibG9kX2F4XCIsIFwiY29udGFjdF9heGVfb2RcIiwgXCJjbF9heF9vZFwiXSxcbiAgXCJsZW50aWxsZXNPRC5hZGRpdGlvblwiOiBbXCJhZGRpdGlvbl9sZW50aWxsZV9vZFwiLCBcImFkZF9sZW50aWxsZV9vZFwiLCBcImxlbnRpbGxlX29kX2FkZFwiLCBcImNvbnRhY3RfYWRkX29kXCIsIFwiY2xfYWRkX29kXCJdLFxuICBcImxlbnRpbGxlc09ELnJheW9uQ291cmJ1cmVcIjogW1wicmF5b25fb2RcIiwgXCJyYXlvbmNvdXJidXJlX29kXCIsIFwiYmNfb2RcIiwgXCJiYXNlX2N1cnZlX29kXCIsIFwicmJfb2RcIiwgXCJyYXlvbl9jb3VyYnVyZV9vZFwiLCBcImJhc2VjdXJ2ZV9vZFwiXSxcbiAgXCJsZW50aWxsZXNPRC5kaWFtZXRyZVwiOiBbXCJkaWFtZXRyZV9vZFwiLCBcImRpYV9vZFwiLCBcImRpYW1fb2RcIiwgXCJkaWFtZXRlcl9vZFwiLCBcImRpYW1ldHJlX2xlbnRpbGxlX29kXCJdLFxuXG4gIC8qIFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFxuICAgKiAgQ09SUkVDVElPTlMgTEVOVElMTEVTIE9HXG4gICAqIFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MCAqL1xuICBcImxlbnRpbGxlc09HLnNwaGVyZVwiOiAgIFtcInNwaGVyZV9sZW50aWxsZV9vZ1wiLCBcInNwaF9sZW50aWxsZV9vZ1wiLCBcImxlbnRpbGxlX29nX3NwaGVyZVwiLCBcImxvZ19zcGhcIiwgXCJjb250YWN0X3NwaGVyZV9vZ1wiLCBcImNsX3NwaF9vZ1wiXSxcbiAgXCJsZW50aWxsZXNPRy5jeWxpbmRyZVwiOiBbXCJjeWxpbmRyZV9sZW50aWxsZV9vZ1wiLCBcImN5bF9sZW50aWxsZV9vZ1wiLCBcImxlbnRpbGxlX29nX2N5bFwiLCBcImxvZ19jeWxcIiwgXCJjb250YWN0X2N5bF9vZ1wiLCBcImNsX2N5bF9vZ1wiXSxcbiAgXCJsZW50aWxsZXNPRy5heGVcIjogICAgICBbXCJheGVfbGVudGlsbGVfb2dcIiwgXCJheF9sZW50aWxsZV9vZ1wiLCBcImxlbnRpbGxlX29nX2F4ZVwiLCBcImxvZ19heFwiLCBcImNvbnRhY3RfYXhlX29nXCIsIFwiY2xfYXhfb2dcIl0sXG4gIFwibGVudGlsbGVzT0cuYWRkaXRpb25cIjogW1wiYWRkaXRpb25fbGVudGlsbGVfb2dcIiwgXCJhZGRfbGVudGlsbGVfb2dcIiwgXCJsZW50aWxsZV9vZ19hZGRcIiwgXCJjb250YWN0X2FkZF9vZ1wiLCBcImNsX2FkZF9vZ1wiXSxcbiAgXCJsZW50aWxsZXNPRy5yYXlvbkNvdXJidXJlXCI6IFtcInJheW9uX29nXCIsIFwicmF5b25jb3VyYnVyZV9vZ1wiLCBcImJjX29nXCIsIFwiYmFzZV9jdXJ2ZV9vZ1wiLCBcInJiX29nXCIsIFwicmF5b25fY291cmJ1cmVfb2dcIiwgXCJiYXNlY3VydmVfb2dcIl0sXG4gIFwibGVudGlsbGVzT0cuZGlhbWV0cmVcIjogW1wiZGlhbWV0cmVfb2dcIiwgXCJkaWFfb2dcIiwgXCJkaWFtX29nXCIsIFwiZGlhbWV0ZXJfb2dcIiwgXCJkaWFtZXRyZV9sZW50aWxsZV9vZ1wiXSxcbn07XG5cbi8qIENoYW1wcyBcdTAwRTAgbmUgamFtYWlzIHJlbXBsaXIgYXV0b21hdGlxdWVtZW50IChhdXRvY29tcGxldGUsIGxvb2t1cHMsIGNoYW1wcyBzZW5zaWJsZXMpICovXG5leHBvcnQgdmFyIFNNQVJUX0ZJTExfQkxBQ0tMSVNUID0gW1xuICAvKiBDaGFtcHMgYXV0b2NvbXBsZXRlIC8gcmVjaGVyY2hlIFx1MjAxNCBnXHUwMEU5clx1MDBFOXMgbWFudWVsbGVtZW50ICovXG4gIFwiYXNzdXJldXJcIixcbiAgXCJvcmdhbmlzbWVfc2VhcmNoXCIsXG4gIFwic2VhcmNoXCIsXG4gIFwicmVjaGVyY2hlXCIsXG4gIFwiYXV0b2NvbXBsZXRlXCIsXG4gIC8qIEF1dGhlbnRpZmljYXRpb24gXHUyMDE0IE5FIEpBTUFJUyByZW1wbGlyICovXG4gIFwicGFzc3dvcmRcIixcbiAgXCJtb3RfZGVfcGFzc2VcIixcbiAgXCJtZHBcIixcbiAgXCJwYXNzd2RcIixcbiAgXCJwd2RcIixcbiAgXCJ1c2VybmFtZVwiLFxuICBcImxvZ2luXCIsXG4gIFwiaWRlbnRpZmlhbnRcIixcbiAgXCJ1c2VyX2lkXCIsXG4gIFwidXNlcmlkXCIsXG4gIC8qIDJGQSAvIGNvZGVzIGRlIHZcdTAwRTlyaWZpY2F0aW9uICovXG4gIFwib3RwXCIsXG4gIFwiY29kZV9vdHBcIixcbiAgXCJjb2RlX3ZlcmlmaWNhdGlvblwiLFxuICBcInZlcmlmaWNhdGlvbl9jb2RlXCIsXG4gIFwiY29kZV9zbXNcIixcbiAgXCJ0b3RwXCIsXG4gIFwicGluXCIsXG4gIC8qIERvbm5cdTAwRTllcyBiYW5jYWlyZXMgXHUyMDE0IGNyaXRpcXVlIFJHUEQgKi9cbiAgXCJudW1lcm9jYXJ0ZWJhbmNhaXJlXCIsXG4gIFwiY2FydGVfYmFuY2FpcmVcIixcbiAgXCJudW1lcm9fY2FydGVfYmFuY2FpcmVcIixcbiAgXCJjYXJkX251bWJlclwiLFxuICBcImNhcmRudW1iZXJcIixcbiAgXCJjdnZcIixcbiAgXCJjdmNcIixcbiAgXCJjdnYyXCIsXG4gIFwiZXhwaXJ5XCIsXG4gIFwiZXhwaXJ5X2RhdGVcIixcbiAgXCJjYXJkX2V4cGlyeVwiLFxuICBcImliYW5cIixcbiAgXCJiaWNcIixcbiAgXCJyaWJcIixcbiAgXCJudW1pYmFuXCIsXG4gIC8qIENoYW1wcyBkZSByZWNoZXJjaGUgZCdhZHJlc3NlIChHb29nbGUgTWFwcywgZXRjLikgKi9cbiAgXCJhZGRyZXNzX3NlYXJjaFwiLFxuICBcImFkcmVzc2VfcmVjaGVyY2hlXCIsXG4gIFwiY29kZV9wb3N0YWxfcmVjaGVyY2hlXCIsXG4gIFwidmlsbGVfcmVjaGVyY2hlXCIsXG4gIFwic2VhcmNoX2FkZHJlc3NcIixcbiAgLyogQ2FwdGNoYSAqL1xuICBcImNhcHRjaGFcIixcbiAgXCJnLXJlY2FwdGNoYVwiLFxuICBcInJlY2FwdGNoYVwiLFxuICBcImhjYXB0Y2hhXCIsXG5dO1xuXG4vKiBcdTI1MDBcdTI1MDAgUGFnZSBjb250ZXh0IGRldGVjdGlvbiBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cbmV4cG9ydCBmdW5jdGlvbiBkZXRlY3RQYWdlQ29udGV4dCgpIHtcbiAgdmFyIHRleHQgPSAod2luZG93LmxvY2F0aW9uLmhyZWYgKyBcIiBcIiArIGRvY3VtZW50LnRpdGxlICsgXCIgXCIgKyAoKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJoMSxoMlwiKXx8e30pLnRleHRDb250ZW50fHxcIlwiKSkudG9Mb3dlckNhc2UoKTtcbiAgaWYgKC9sb2dpbnxjb25uZXhpb258c2lnbmlufG1vdC5kZS5wYXNzZS8udGVzdCh0ZXh0KSkgcmV0dXJuIFwibG9naW5cIjtcbiAgaWYgKC9yZWNoZXJjaGV8c2VhcmNoLy50ZXN0KHRleHQpKSByZXR1cm4gXCJzZWFyY2hcIjtcbiAgaWYgKC9iZW5lZmljaWFpcmV8YWRoZXJlbnQvLnRlc3QodGV4dCkpIHJldHVybiBcImJlbmVmaWNpYWlyZVwiO1xuICBpZiAoL3ByaXNlLmVuLmNoYXJnZXxwZWN8ZGVtYW5kZS8udGVzdCh0ZXh0KSkgcmV0dXJuIFwicGVjXCI7XG4gIGlmICgvZGV2aXN8Y290YXRpb24vLnRlc3QodGV4dCkpIHJldHVybiBcImRldmlzXCI7XG4gIHJldHVybiBcInVua25vd25cIjtcbn1cblxuLyogXHUyNTAwXHUyNTAwIFZpc2libGUgZmllbGRzIGRldGVjdGlvbiBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRWaXNpYmxlRmllbGRzKCkge1xuICB2YXIgc2VsZWN0b3IgPSBcImlucHV0Om5vdChbdHlwZT1oaWRkZW5dKSwgc2VsZWN0LCB0ZXh0YXJlYVwiO1xuICB2YXIgZmllbGRzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSk7XG4gIC8qIEluY2x1cmUgbGVzIGNoYW1wcyBkYW5zIGxlcyBpZnJhbWVzIGFjY2Vzc2libGVzICovXG4gIHZhciBpZnJhbWVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcImlmcmFtZVwiKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBpZnJhbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBpRG9jID0gaWZyYW1lc1tpXS5jb250ZW50RG9jdW1lbnQgfHwgKGlmcmFtZXNbaV0uY29udGVudFdpbmRvdyAmJiBpZnJhbWVzW2ldLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQpO1xuICAgICAgaWYgKGlEb2MpIGZpZWxkcyA9IGZpZWxkcy5jb25jYXQoQXJyYXkuZnJvbShpRG9jLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpKSk7XG4gICAgfSBjYXRjaChlKSB7fVxuICB9XG4gIHJldHVybiBmaWVsZHMuZmlsdGVyKGZ1bmN0aW9uKGVsKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBjcyA9IChlbC5vd25lckRvY3VtZW50LmRlZmF1bHRWaWV3IHx8IHdpbmRvdykuZ2V0Q29tcHV0ZWRTdHlsZShlbCk7XG4gICAgICByZXR1cm4gY3MuZGlzcGxheSAhPT0gXCJub25lXCIgJiYgY3MudmlzaWJpbGl0eSAhPT0gXCJoaWRkZW5cIiAmJiBjcy5vcGFjaXR5ICE9PSBcIjBcIlxuICAgICAgICAmJiAhZWwuZGlzYWJsZWQgJiYgIWVsLnJlYWRPbmx5ICYmIGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodCA+IDA7XG4gICAgfSBjYXRjaChlKSB7IHJldHVybiBmYWxzZTsgfVxuICB9KTtcbn1cbiIsICIvKiBcdTI1MDBcdTI1MDAgRmllbGQgTWF0Y2hpbmcgVXRpbGl0eSBGdW5jdGlvbnMgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG5cbmltcG9ydCB7IFNNQVJUX0ZJTExfQUxJQVNFUywgU01BUlRfRklMTF9CTEFDS0xJU1QgfSBmcm9tIFwiLi9kYXRhLmpzXCI7XG5cbi8qIFx1MjUwMFx1MjUwMCBMZWFybmVkIHdlaWdodHMgZm9yIHNjb3JlIHJlY2FsaWJyYXRpb24gKFYzLTMpIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xudmFyIF9sZWFybmVkV2VpZ2h0cyA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkTGVhcm5lZFdlaWdodHMoKSB7XG4gIHZhciBob3N0bmFtZSA9IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZTtcbiAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFtcIm9wdGlib3RfbGVhcm5lZF93ZWlnaHRzXCJdLCBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICB2YXIgY2FjaGVkID0gcmVzdWx0Lm9wdGlib3RfbGVhcm5lZF93ZWlnaHRzO1xuICAgIGlmIChjYWNoZWQgJiYgY2FjaGVkLnRzICYmIERhdGUubm93KCkgLSBjYWNoZWQudHMgPCAzNjAwMDAwKSB7XG4gICAgICBfbGVhcm5lZFdlaWdodHMgPSBjYWNoZWQud2VpZ2h0cyB8fCB7fTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLyogRmV0Y2ggZnJlc2ggd2VpZ2h0cyBmcm9tIGJhY2tlbmQgKi9cbiAgICBpZiAodHlwZW9mIGdldFN5bmNUb2tlbiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBnZXRTeW5jVG9rZW4oKS50aGVuKGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICAgIGlmICghdG9rZW4pIHJldHVybjtcbiAgICAgICAgZmV0Y2goXCJodHRwczovL29wdGlib3QuZnIvYXBpL2V4dGVuc2lvbi9zbWFydC1maWxsL3dlaWdodHM/aG9zdG5hbWU9XCIgKyBlbmNvZGVVUklDb21wb25lbnQoaG9zdG5hbWUpLCB7XG4gICAgICAgICAgaGVhZGVyczogeyBcIkF1dGhvcml6YXRpb25cIjogXCJCZWFyZXIgXCIgKyB0b2tlbiB9XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHIpIHsgcmV0dXJuIHIuanNvbigpOyB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgX2xlYXJuZWRXZWlnaHRzID0gZGF0YS53ZWlnaHRzIHx8IHt9O1xuICAgICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7IG9wdGlib3RfbGVhcm5lZF93ZWlnaHRzOiB7IHdlaWdodHM6IF9sZWFybmVkV2VpZ2h0cywgdHM6IERhdGUubm93KCkgfSB9KTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycikgeyBjb25zb2xlLndhcm4oXCJbT3B0aUJvdF0gbGVhcm5lZCB3ZWlnaHRzIGZldGNoIGZhaWxlZDpcIiwgZXJyKTsgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKiBcdTI1MDBcdTI1MDAgUHJlLWNhY2hlZCBsYWJlbCBtYXAgKHBvcHVsYXRlZCBieSBwcmVDYWNoZUxhYmVsTWFwKSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cbnZhciBfbGFiZWxNYXAgPSBudWxsO1xuXG5leHBvcnQgZnVuY3Rpb24gcHJlQ2FjaGVMYWJlbE1hcCgpIHtcbiAgX2xhYmVsTWFwID0ge307XG4gIHZhciBsYWJlbHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwibGFiZWxbZm9yXVwiKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYWJlbHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgZm9ySWQgPSBsYWJlbHNbaV0uZ2V0QXR0cmlidXRlKFwiZm9yXCIpO1xuICAgIGlmIChmb3JJZCkgX2xhYmVsTWFwW2ZvcklkXSA9IGxhYmVsc1tpXS50ZXh0Q29udGVudC50cmltKCk7XG4gIH1cbn1cblxuLyogXHUyNTAwXHUyNTAwIExldmVuc2h0ZWluIGRpc3RhbmNlICh3aXRoIG1lbW9pemF0aW9uKSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cbnZhciBfbGV2ZW5zaHRlaW5DYWNoZSA9IHt9O1xuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJNYXRjaGluZ0NhY2hlKCkge1xuICBfbGV2ZW5zaHRlaW5DYWNoZSA9IHt9O1xuICBfbGFiZWxNYXAgPSBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGV2ZW5zaHRlaW4oYSwgYikge1xuICB2YXIga2V5ID0gYSArIFwiXFwwXCIgKyBiO1xuICBpZiAoX2xldmVuc2h0ZWluQ2FjaGVba2V5XSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gX2xldmVuc2h0ZWluQ2FjaGVba2V5XTtcbiAgaWYgKCFhKSB7IF9sZXZlbnNodGVpbkNhY2hlW2tleV0gPSAoYiB8fCBcIlwiKS5sZW5ndGg7IHJldHVybiBfbGV2ZW5zaHRlaW5DYWNoZVtrZXldOyB9XG4gIGlmICghYikgeyBfbGV2ZW5zaHRlaW5DYWNoZVtrZXldID0gYS5sZW5ndGg7IHJldHVybiBfbGV2ZW5zaHRlaW5DYWNoZVtrZXldOyB9XG4gIHZhciBtID0gYS5sZW5ndGgsIG4gPSBiLmxlbmd0aDtcbiAgdmFyIGRwID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDw9IG07IGkrKykge1xuICAgIGRwW2ldID0gW2ldO1xuICAgIGZvciAodmFyIGogPSAxOyBqIDw9IG47IGorKykge1xuICAgICAgZHBbaV1bal0gPSBpID09PSAwID8gaiA6IDA7XG4gICAgfVxuICB9XG4gIGZvciAodmFyIGkyID0gMTsgaTIgPD0gbTsgaTIrKykge1xuICAgIGZvciAodmFyIGoyID0gMTsgajIgPD0gbjsgajIrKykge1xuICAgICAgaWYgKGFbaTIgLSAxXSA9PT0gYltqMiAtIDFdKSB7XG4gICAgICAgIGRwW2kyXVtqMl0gPSBkcFtpMiAtIDFdW2oyIC0gMV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkcFtpMl1bajJdID0gMSArIE1hdGgubWluKGRwW2kyIC0gMV1bajJdLCBkcFtpMl1bajIgLSAxXSwgZHBbaTIgLSAxXVtqMiAtIDFdKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgX2xldmVuc2h0ZWluQ2FjaGVba2V5XSA9IGRwW21dW25dO1xuICByZXR1cm4gZHBbbV1bbl07XG59XG5cbi8qIFx1MjUwMFx1MjUwMCBMYWJlbCBleHRyYWN0aW9uIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEZpZWxkTGFiZWwoZWwpIHtcbiAgaWYgKCFlbCkgcmV0dXJuIFwiXCI7XG4gIC8qIFVzZSBwcmUtY2FjaGVkIGxhYmVsIG1hcCBpZiBhdmFpbGFibGUgKi9cbiAgaWYgKF9sYWJlbE1hcCAmJiBlbC5pZCAmJiBfbGFiZWxNYXBbZWwuaWRdKSByZXR1cm4gX2xhYmVsTWFwW2VsLmlkXTtcbiAgdmFyIHJvb3ROb2RlID0gZWwuZ2V0Um9vdE5vZGUgPyBlbC5nZXRSb290Tm9kZSgpIDogZG9jdW1lbnQ7XG4gIGlmIChlbC5pZCkge1xuICAgIHZhciBsYmwgPSByb290Tm9kZS5xdWVyeVNlbGVjdG9yKCdsYWJlbFtmb3I9XCInICsgZWwuaWQgKyAnXCJdJyk7XG4gICAgaWYgKGxibCAmJiBsYmwudGV4dENvbnRlbnQudHJpbSgpKSByZXR1cm4gbGJsLnRleHRDb250ZW50LnRyaW0oKTtcbiAgfVxuICB2YXIgYXJpYUxhYmVsID0gZWwuZ2V0QXR0cmlidXRlKFwiYXJpYS1sYWJlbFwiKTtcbiAgaWYgKGFyaWFMYWJlbCkgcmV0dXJuIGFyaWFMYWJlbC50cmltKCk7XG4gIHZhciBhcmlhTGFiZWxsZWRieSA9IGVsLmdldEF0dHJpYnV0ZShcImFyaWEtbGFiZWxsZWRieVwiKTtcbiAgaWYgKGFyaWFMYWJlbGxlZGJ5KSB7XG4gICAgdmFyIHJlZkVsID0gcm9vdE5vZGUuZ2V0RWxlbWVudEJ5SWQgPyByb290Tm9kZS5nZXRFbGVtZW50QnlJZChhcmlhTGFiZWxsZWRieSkgOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChhcmlhTGFiZWxsZWRieSk7XG4gICAgaWYgKHJlZkVsICYmIHJlZkVsLnRleHRDb250ZW50LnRyaW0oKSkgcmV0dXJuIHJlZkVsLnRleHRDb250ZW50LnRyaW0oKTtcbiAgfVxuICBpZiAoZWwucGxhY2Vob2xkZXIpIHJldHVybiBlbC5wbGFjZWhvbGRlci50cmltKCk7XG4gIGlmIChlbC5jbG9zZXN0KSB7XG4gICAgdmFyIGdyb3VwID0gZWwuY2xvc2VzdChcIi5mb3JtLWdyb3VwLCAuZmllbGQsIC5mb3JtLWZpZWxkLCAubWF0LWZvcm0tZmllbGQsIG1hdC1mb3JtLWZpZWxkXCIpO1xuICAgIGlmIChncm91cCkge1xuICAgICAgdmFyIGdyb3VwTGFiZWwgPSBncm91cC5xdWVyeVNlbGVjdG9yKFwibGFiZWwsIG1hdC1sYWJlbCwgLm1hdC1sYWJlbCwgbGVnZW5kXCIpO1xuICAgICAgaWYgKGdyb3VwTGFiZWwgJiYgZ3JvdXBMYWJlbC50ZXh0Q29udGVudC50cmltKCkpIHJldHVybiBncm91cExhYmVsLnRleHRDb250ZW50LnRyaW0oKTtcbiAgICB9XG4gIH1cbiAgdmFyIHBhcmVudCA9IGVsLnBhcmVudEVsZW1lbnQ7XG4gIGlmIChwYXJlbnQgJiYgcGFyZW50LnRhZ05hbWUgPT09IFwiVERcIikge1xuICAgIHZhciBwcmV2VGQgPSBwYXJlbnQucHJldmlvdXNFbGVtZW50U2libGluZztcbiAgICBpZiAocHJldlRkICYmIHByZXZUZC50YWdOYW1lID09PSBcIlREXCIgJiYgcHJldlRkLnRleHRDb250ZW50LnRyaW0oKSkgcmV0dXJuIHByZXZUZC50ZXh0Q29udGVudC50cmltKCk7XG4gIH1cbiAgcmV0dXJuIFwiXCI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVMYWJlbChzdHIpIHtcbiAgcmV0dXJuIChzdHIgfHwgXCJcIilcbiAgICAudG9Mb3dlckNhc2UoKVxuICAgIC5ub3JtYWxpemUoXCJORkRcIikucmVwbGFjZSgvW1xcdTAzMDAtXFx1MDM2Zl0vZywgXCJcIilcbiAgICAucmVwbGFjZSgvW15hLXowLTldL2csIFwiX1wiKVxuICAgIC5yZXBsYWNlKC9fKy9nLCBcIl9cIilcbiAgICAucmVwbGFjZSgvXl98XyQvZywgXCJcIik7XG59XG5cbi8qIE5vcm1hbGlzZSB1biBzdHJpbmcgcG91ciBsYSBjb21wYXJhaXNvbiA6IG1pbnVzY3VsZXMsIHNhbnMgYWNjZW50cywgc2FucyBlc3BhY2VzL3RpcmV0cyAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZUFsaWFzKHN0cikge1xuICByZXR1cm4gKHN0ciB8fCBcIlwiKVxuICAgIC50b0xvd2VyQ2FzZSgpXG4gICAgLm5vcm1hbGl6ZShcIk5GRFwiKS5yZXBsYWNlKC9bXFx1MDMwMC1cXHUwMzZmXS9nLCBcIlwiKVxuICAgIC8qIFN1cHByaW1lciBsZXMgbWFycXVldXJzIG9ibGlnYXRvaXJlcyAoKiksIHBvbmN0dWF0aW9uIGV0IHBhcmVudGhcdTAwRThzZXMgKi9cbiAgICAucmVwbGFjZSgvWyo6KClcXFtcXF17fSNcdTAwQjAnXCIhP10vZywgXCJcIilcbiAgICAucmVwbGFjZSgvW1xcc1xcLV9cXC5cXC9dL2csIFwiXCIpO1xufVxuXG4vKiBcdTI1MDBcdTI1MDAgU2NvcmUtYmFzZWQgZmllbGQgbWF0Y2hpbmcgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG5leHBvcnQgZnVuY3Rpb24gc2NvcmVGaWVsZE1hdGNoKGVsLCBhbGlhc0tleSwgYWxpYXNlcykge1xuICB2YXIgZWxJZCA9IG5vcm1hbGl6ZUFsaWFzKGVsLmlkIHx8IFwiXCIpO1xuICB2YXIgZWxOYW1lID0gbm9ybWFsaXplQWxpYXMoZWwubmFtZSB8fCBcIlwiKTtcbiAgdmFyIGVsTGFiZWwgPSBub3JtYWxpemVBbGlhcyhnZXRGaWVsZExhYmVsKGVsKSk7XG4gIHZhciBlbFBsYWNlaG9sZGVyID0gbm9ybWFsaXplQWxpYXMoZWwucGxhY2Vob2xkZXIgfHwgXCJcIik7XG4gIHZhciBlbFRlc3RJZCA9IG5vcm1hbGl6ZUFsaWFzKGVsLmdldEF0dHJpYnV0ZShcImRhdGEtdGVzdGlkXCIpIHx8IGVsLmdldEF0dHJpYnV0ZShcImRhdGEtY3lcIikgfHwgZWwuZ2V0QXR0cmlidXRlKFwiZGF0YS1xYVwiKSB8fCBcIlwiKTtcbiAgdmFyIG1heFNjb3JlID0gMDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbGlhc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGFsaWFzID0gbm9ybWFsaXplQWxpYXMoYWxpYXNlc1tpXSk7XG4gICAgaWYgKCFhbGlhcykgY29udGludWU7XG4gICAgaWYgKGVsSWQgJiYgZWxJZCA9PT0gYWxpYXMpIHJldHVybiAxMDA7XG4gICAgaWYgKGVsTmFtZSAmJiBlbE5hbWUgPT09IGFsaWFzKSB7IG1heFNjb3JlID0gTWF0aC5tYXgobWF4U2NvcmUsIDkwKTsgY29udGludWU7IH1cbiAgICBpZiAoZWxMYWJlbCAmJiBlbExhYmVsID09PSBhbGlhcykgeyBtYXhTY29yZSA9IE1hdGgubWF4KG1heFNjb3JlLCA4NSk7IGNvbnRpbnVlOyB9XG4gICAgaWYgKGVsVGVzdElkICYmIGVsVGVzdElkID09PSBhbGlhcykgeyBtYXhTY29yZSA9IE1hdGgubWF4KG1heFNjb3JlLCA4NSk7IGNvbnRpbnVlOyB9XG4gICAgaWYgKGVsSWQgJiYgZWxJZC5pbmRleE9mKGFsaWFzKSAhPT0gLTEpIHsgbWF4U2NvcmUgPSBNYXRoLm1heChtYXhTY29yZSwgNzApOyB9XG4gICAgaWYgKGVsTmFtZSAmJiBlbE5hbWUuaW5kZXhPZihhbGlhcykgIT09IC0xKSB7IG1heFNjb3JlID0gTWF0aC5tYXgobWF4U2NvcmUsIDY1KTsgfVxuICAgIGlmIChlbExhYmVsICYmIGVsTGFiZWwuaW5kZXhPZihhbGlhcykgIT09IC0xKSB7IG1heFNjb3JlID0gTWF0aC5tYXgobWF4U2NvcmUsIDYwKTsgfVxuICAgIGlmIChlbFRlc3RJZCAmJiBlbFRlc3RJZC5pbmRleE9mKGFsaWFzKSAhPT0gLTEpIHsgbWF4U2NvcmUgPSBNYXRoLm1heChtYXhTY29yZSwgNjApOyB9XG4gICAgaWYgKGVsUGxhY2Vob2xkZXIgJiYgZWxQbGFjZWhvbGRlci5pbmRleE9mKGFsaWFzKSAhPT0gLTEpIHsgbWF4U2NvcmUgPSBNYXRoLm1heChtYXhTY29yZSwgNTUpOyB9XG4gICAgaWYgKGVsSWQgJiYgbGV2ZW5zaHRlaW4oZWxJZCwgYWxpYXMpIDw9IDIpIHsgbWF4U2NvcmUgPSBNYXRoLm1heChtYXhTY29yZSwgNTApOyB9XG4gICAgaWYgKGVsTmFtZSAmJiBsZXZlbnNodGVpbihlbE5hbWUsIGFsaWFzKSA8PSAyKSB7IG1heFNjb3JlID0gTWF0aC5tYXgobWF4U2NvcmUsIDQ1KTsgfVxuICAgIGlmIChlbExhYmVsICYmIGxldmVuc2h0ZWluKGVsTGFiZWwsIGFsaWFzKSA8PSAyKSB7IG1heFNjb3JlID0gTWF0aC5tYXgobWF4U2NvcmUsIDQwKTsgfVxuICB9XG4gIC8qIFYzLTM6IGFwcGx5IGxlYXJuZWQgd2VpZ2h0IGFkanVzdG1lbnQgKi9cbiAgaWYgKF9sZWFybmVkV2VpZ2h0cyAmJiBfbGVhcm5lZFdlaWdodHNbYWxpYXNLZXldKSB7XG4gICAgbWF4U2NvcmUgPSBNYXRoLnJvdW5kKG1heFNjb3JlICogKF9sZWFybmVkV2VpZ2h0c1thbGlhc0tleV0ubXVsdGlwbGllciB8fCAxKSk7XG4gIH1cbiAgcmV0dXJuIG1heFNjb3JlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWF0Y2hTbWFydEZpZWxkKGVsKSB7XG4gIC8qIFx1MjUwMFx1MjUwMCBCbGFja2xpc3QgXHUyMDE0IGphbWFpcyByZW1wbGlyIGNlcyBjaGFtcHMgXHUyNTAwXHUyNTAwICovXG4gIHZhciBmY25SYXcgPSBlbC5nZXRBdHRyaWJ1dGUoXCJmb3JtY29udHJvbG5hbWVcIikgfHwgZWwuZ2V0QXR0cmlidXRlKFwibmctcmVmbGVjdC1uYW1lXCIpIHx8IGVsLm5hbWUgfHwgXCJcIjtcbiAgaWYgKGZjblJhdyAmJiBTTUFSVF9GSUxMX0JMQUNLTElTVC5pbmRleE9mKGZjblJhdy50b0xvd2VyQ2FzZSgpKSAhPT0gLTEpIHJldHVybiBudWxsO1xuXG4gIC8qIFx1MjUwMFx1MjUwMCBDb2xsZWN0ZSBkZXMgc291cmNlcyBkZSBzaWduYWwgXHUyNTAwXHUyNTAwICovXG4gIHZhciBhdHRycyA9IFtcbiAgICBlbC5uYW1lLFxuICAgIGVsLmlkLFxuICAgIGVsLnBsYWNlaG9sZGVyLFxuICAgIGVsLmdldEF0dHJpYnV0ZShcImFyaWEtbGFiZWxcIiksXG4gICAgZWwuZ2V0QXR0cmlidXRlKFwiZGF0YS1maWVsZFwiKSxcbiAgICBlbC5nZXRBdHRyaWJ1dGUoXCJkYXRhLW5hbWVcIiksXG4gICAgZWwuZ2V0QXR0cmlidXRlKFwiZGF0YS1sYWJlbFwiKSxcbiAgICBlbC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXRlc3RpZFwiKSxcbiAgICBlbC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWN5XCIpLFxuICAgIC8qIEFuZ3VsYXIgTWF0ZXJpYWwgLyBSZWFjdGl2ZSBGb3JtcyAqL1xuICAgIGVsLmdldEF0dHJpYnV0ZShcImZvcm1jb250cm9sbmFtZVwiKSxcbiAgICBlbC5nZXRBdHRyaWJ1dGUoXCJuZy1yZWZsZWN0LW5hbWVcIiksXG4gICAgZWwuZ2V0QXR0cmlidXRlKFwibmctcmVmbGVjdC1wbGFjZWhvbGRlclwiKSxcbiAgICBlbC5nZXRBdHRyaWJ1dGUoXCJkYXRhLW1hdC1pbnB1dFwiKSxcbiAgICAvKiBWdWUgKi9cbiAgICBlbC5nZXRBdHRyaWJ1dGUoXCJ2LW1vZGVsXCIpLFxuICAgIGVsLmdldEF0dHJpYnV0ZShcIjpuYW1lXCIpLFxuICAgIC8qIENsYXNzZXMgQ1NTIHNpZ25pZmljYXRpdmVzIChjbGFzcyo9XCJub21cIiwgY2xhc3MqPVwicHJlbm9tXCIuLi4pICovXG4gICAgZWwuY2xhc3NOYW1lLFxuICBdO1xuXG4gIC8qIFx1MjUwMFx1MjUwMCBMYWJlbCB2aWEgZm9yPSBcdTI1MDBcdTI1MDAgKi9cbiAgdmFyIGxhYmVsRWwgPSBlbC5pZCA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xhYmVsW2Zvcj1cIicgKyBDU1MuZXNjYXBlKGVsLmlkKSArICdcIl0nKSA6IG51bGw7XG5cbiAgLyogXHUyNTAwXHUyNTAwIGFyaWEtbGFiZWxsZWRieSAocGV1dCBwb2ludGVyIHZlcnMgcGx1c2lldXJzIGlkcykgXHUyNTAwXHUyNTAwICovXG4gIGlmICghbGFiZWxFbCkge1xuICAgIHZhciBsYWJlbGxlZGJ5ID0gZWwuZ2V0QXR0cmlidXRlKFwiYXJpYS1sYWJlbGxlZGJ5XCIpO1xuICAgIGlmIChsYWJlbGxlZGJ5KSB7XG4gICAgICB2YXIgbGFiZWxUZXh0ID0gbGFiZWxsZWRieS5zcGxpdCgvXFxzKy8pLm1hcChmdW5jdGlvbihpZCkge1xuICAgICAgICB2YXIgcmVmID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICAgICAgICByZXR1cm4gcmVmID8gcmVmLnRleHRDb250ZW50LnRyaW0oKSA6IFwiXCI7XG4gICAgICB9KS5maWx0ZXIoQm9vbGVhbikuam9pbihcIiBcIik7XG4gICAgICBpZiAobGFiZWxUZXh0KSBhdHRycy5wdXNoKGxhYmVsVGV4dCk7XG4gICAgfVxuICB9XG5cbiAgLyogXHUyNTAwXHUyNTAwIEFuZ3VsYXIgTWF0ZXJpYWwgbWF0LWZvcm0tZmllbGQgXHUyNTAwXHUyNTAwICovXG4gIGlmICghbGFiZWxFbCAmJiBlbC5jbG9zZXN0KSB7XG4gICAgdmFyIG1hdEZpZWxkID0gZWwuY2xvc2VzdChcIm1hdC1mb3JtLWZpZWxkLCAubWF0LWZvcm0tZmllbGQsIC5tYXQtbWRjLWZvcm0tZmllbGRcIik7XG4gICAgaWYgKG1hdEZpZWxkKSB7XG4gICAgICB2YXIgbWF0TGFiZWwgPSBtYXRGaWVsZC5xdWVyeVNlbGVjdG9yKFwibWF0LWxhYmVsLCBsYWJlbCwgLm1hdC1sYWJlbCwgLm1hdC1tZGMtZmxvYXRpbmctbGFiZWxcIik7XG4gICAgICBpZiAobWF0TGFiZWwpIGxhYmVsRWwgPSBtYXRMYWJlbDtcbiAgICB9XG4gIH1cblxuICAvKiBcdTI1MDBcdTI1MDAgTGFiZWwgcGFyZW50IGRpcmVjdCBvdSBzaWJsaW5nIHByXHUwMEU5Y1x1MDBFOWRlbnQgXHUyNTAwXHUyNTAwICovXG4gIGlmICghbGFiZWxFbCAmJiBlbC5jbG9zZXN0KSB7XG4gICAgbGFiZWxFbCA9IGVsLmNsb3Nlc3QoXCJsYWJlbFwiKTtcbiAgICBpZiAoIWxhYmVsRWwgJiYgZWwucGFyZW50RWxlbWVudCkge1xuICAgICAgbGFiZWxFbCA9IGVsLnBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvcihcImxhYmVsXCIpO1xuICAgIH1cbiAgfVxuXG4gIC8qIFx1MjUwMFx1MjUwMCBTaWJsaW5nIHByXHUwMEU5Y1x1MDBFOWRlbnQgKGxhYmVsL3NwYW4vZGl2IGFkamFjZW50IGRhbnMgbGUgRE9NKSBcdTI1MDBcdTI1MDAgKi9cbiAgaWYgKCFsYWJlbEVsKSB7XG4gICAgdmFyIHByZXYgPSBlbC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xuICAgIGlmIChwcmV2ICYmIC9eKGxhYmVsfHNwYW58ZGl2fHB8dGh8dGR8ZHR8bGVnZW5kKSQvaS50ZXN0KHByZXYudGFnTmFtZSkgJiYgcHJldi50ZXh0Q29udGVudC50cmltKCkubGVuZ3RoIDwgNjApIHtcbiAgICAgIGF0dHJzLnB1c2gocHJldi50ZXh0Q29udGVudC50cmltKCkpO1xuICAgIH1cbiAgfVxuXG4gIC8qIFx1MjUwMFx1MjUwMCBDZWxsdWxlIGRlIHRhYmxlYXUgcHJcdTAwRTljXHUwMEU5ZGVudGUgKHZpZXV4IHBvcnRhaWxzIHR5cGUgQWxtZXJ5cy9WaWFtZWRpcykgXHUyNTAwXHUyNTAwICovXG4gIGlmICghbGFiZWxFbCkge1xuICAgIHZhciB0ZCA9IGVsLmNsb3Nlc3QoXCJ0ZFwiKTtcbiAgICBpZiAodGQpIHtcbiAgICAgIHZhciBwcmV2VGQgPSB0ZC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xuICAgICAgaWYgKHByZXZUZCkgYXR0cnMucHVzaChwcmV2VGQudGV4dENvbnRlbnQudHJpbSgpKTtcbiAgICB9XG4gIH1cblxuICAvKiBcdTI1MDBcdTI1MDAgPGxlZ2VuZD4gZHUgZmllbGRzZXQgcGFyZW50IFx1MjUwMFx1MjUwMCAqL1xuICBpZiAoIWxhYmVsRWwgJiYgZWwuY2xvc2VzdCkge1xuICAgIHZhciBmaWVsZHNldCA9IGVsLmNsb3Nlc3QoXCJmaWVsZHNldFwiKTtcbiAgICBpZiAoZmllbGRzZXQpIHtcbiAgICAgIHZhciBsZWdlbmQgPSBmaWVsZHNldC5xdWVyeVNlbGVjdG9yKFwibGVnZW5kXCIpO1xuICAgICAgaWYgKGxlZ2VuZCkgYXR0cnMucHVzaChsZWdlbmQudGV4dENvbnRlbnQudHJpbSgpKTtcbiAgICB9XG4gIH1cblxuICAvKiBcdTI1MDBcdTI1MDAgPHRoPiBkZSBsYSBsaWduZSAodGFibGVhdXggZGUgZm9ybXVsYWlyZXMpIFx1MjUwMFx1MjUwMCAqL1xuICBpZiAoIWxhYmVsRWwpIHtcbiAgICB2YXIgdHIgPSBlbC5jbG9zZXN0ICYmIGVsLmNsb3Nlc3QoXCJ0clwiKTtcbiAgICBpZiAodHIpIHtcbiAgICAgIHZhciB0aCA9IHRyLnF1ZXJ5U2VsZWN0b3IoXCJ0aFwiKTtcbiAgICAgIGlmICh0aCkgYXR0cnMucHVzaCh0aC50ZXh0Q29udGVudC50cmltKCkpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChsYWJlbEVsKSBhdHRycy5wdXNoKGxhYmVsRWwudGV4dENvbnRlbnQudHJpbSgpKTtcblxuICAvKiBcdTI1MDBcdTI1MDAgTWF0Y2hpbmcgXHUyNTAwXHUyNTAwICovXG4gIHZhciBhdHRyVmFsdWVzID0gYXR0cnMuZmlsdGVyKEJvb2xlYW4pO1xuICB2YXIgbm9ybWFsaXplZEFsbCA9IGF0dHJWYWx1ZXMubWFwKG5vcm1hbGl6ZUFsaWFzKS5qb2luKFwiIFwiKTtcbiAgaWYgKCFub3JtYWxpemVkQWxsLnRyaW0oKSkgcmV0dXJuIG51bGw7XG5cbiAgZm9yICh2YXIgZmllbGQgaW4gU01BUlRfRklMTF9BTElBU0VTKSB7XG4gICAgdmFyIGFsaWFzZXMgPSBTTUFSVF9GSUxMX0FMSUFTRVNbZmllbGRdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYWxpYXNlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGFsaWFzID0gbm9ybWFsaXplQWxpYXMoYWxpYXNlc1tpXSk7XG4gICAgICBpZiAoIWFsaWFzKSBjb250aW51ZTtcbiAgICAgIC8qIEV4YWN0IG1hdGNoIHN1ciB1biBhdHRyaWJ1dCBpbmRpdmlkdWVsICovXG4gICAgICB2YXIgZXhhY3RNYXRjaCA9IGF0dHJWYWx1ZXMuc29tZShmdW5jdGlvbihhKSB7IHJldHVybiBub3JtYWxpemVBbGlhcyhhKSA9PT0gYWxpYXM7IH0pO1xuICAgICAgLyogUGFydGlhbCBtYXRjaCBkXHUwMEU5bGltaXRcdTAwRTkgKFx1MDBFOXZpdGUgXCJub21cIiBkYW5zIFwicHJlbm9tXCIpICovXG4gICAgICB2YXIgcGFydGlhbE1hdGNoID0gZmFsc2U7XG4gICAgICBpZiAoIWV4YWN0TWF0Y2gpIHtcbiAgICAgICAgdmFyIHJlID0gbmV3IFJlZ0V4cChcIihefFtcXFxcc19cXFxcLV0pXCIgKyBhbGlhcy5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgXCJcXFxcJCZcIikgKyBcIihbXFxcXHNfXFxcXC1dfCQpXCIpO1xuICAgICAgICBwYXJ0aWFsTWF0Y2ggPSByZS50ZXN0KG5vcm1hbGl6ZWRBbGwpO1xuICAgICAgfVxuICAgICAgaWYgKGV4YWN0TWF0Y2gpIHJldHVybiB7IGZpZWxkOiBmaWVsZCwgY29uZmlkZW5jZTogXCJjZXJ0YWluXCIgfTtcbiAgICAgIGlmIChwYXJ0aWFsTWF0Y2gpIHJldHVybiB7IGZpZWxkOiBmaWVsZCwgY29uZmlkZW5jZTogXCJwcm9iYWJsZVwiIH07XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuIiwgIi8qIFx1MjUwMFx1MjUwMCBTZWxlY3RvciBDYWNoZSBwZXIgcG9ydGFsIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuXG5leHBvcnQgbGV0IF9zZWxlY3RvckNhY2hlID0ge307XG52YXIgX3NlbGVjdG9yQ2FjaGVEaXJ0eSA9IGZhbHNlO1xudmFyIF9zZWxlY3RvckNhY2hlTGFzdFNhdmUgPSAwO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2FjaGVkU2VsZWN0b3IoaG9zdG5hbWUsIGZpZWxkTmFtZSkge1xuICBpZiAoIV9zZWxlY3RvckNhY2hlW2hvc3RuYW1lXSkgcmV0dXJuIG51bGw7XG4gIHJldHVybiBfc2VsZWN0b3JDYWNoZVtob3N0bmFtZV1bZmllbGROYW1lXSB8fCBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0Q2FjaGVkU2VsZWN0b3IoaG9zdG5hbWUsIGZpZWxkTmFtZSwgc2VsZWN0b3IpIHtcbiAgaWYgKCFfc2VsZWN0b3JDYWNoZVtob3N0bmFtZV0pIF9zZWxlY3RvckNhY2hlW2hvc3RuYW1lXSA9IHt9O1xuICBfc2VsZWN0b3JDYWNoZVtob3N0bmFtZV1bZmllbGROYW1lXSA9IHNlbGVjdG9yO1xuICBfc2VsZWN0b3JDYWNoZURpcnR5ID0gdHJ1ZTtcbiAgdmFyIG5vdyA9IERhdGUubm93KCk7XG4gIGlmIChub3cgLSBfc2VsZWN0b3JDYWNoZUxhc3RTYXZlID4gMTAwMDApIHtcbiAgICBzYXZlU2VsZWN0b3JDYWNoZSgpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkU2VsZWN0b3JDYWNoZSgpIHtcbiAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFtcIm9wdGlib3Rfc2VsZWN0b3JfY2FjaGVcIl0sIGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgIF9zZWxlY3RvckNhY2hlID0gcmVzdWx0Lm9wdGlib3Rfc2VsZWN0b3JfY2FjaGUgfHwge307XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2F2ZVNlbGVjdG9yQ2FjaGUoKSB7XG4gIGlmICghX3NlbGVjdG9yQ2FjaGVEaXJ0eSkgcmV0dXJuO1xuICBfc2VsZWN0b3JDYWNoZURpcnR5ID0gZmFsc2U7XG4gIF9zZWxlY3RvckNhY2hlTGFzdFNhdmUgPSBEYXRlLm5vdygpO1xuICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoeyBvcHRpYm90X3NlbGVjdG9yX2NhY2hlOiBfc2VsZWN0b3JDYWNoZSB9KTtcbn1cbiIsICIvKiBcdTI1MDBcdTI1MDAgRmlsbCBVdGlsaXR5IEZ1bmN0aW9ucyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cblxuaW1wb3J0IHsgbm9ybWFsaXplRGF0ZVZhbHVlLCBmaWVsZEhhc1ZhbHVlIH0gZnJvbSBcIi4vZm9ybWF0LmpzXCI7XG5pbXBvcnQgeyBsZXZlbnNodGVpbiB9IGZyb20gXCIuL2ZpZWxkLW1hdGNoaW5nLmpzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiB1bHRyYUZpbGwoZWwsIHZhbCwgb3B0cykge1xuICBpZiAoIWVsIHx8IHZhbCA9PT0gdW5kZWZpbmVkIHx8IHZhbCA9PT0gbnVsbCB8fCB2YWwgPT09IFwiXCIpIHJldHVybjtcbiAgLyogU2tpcCBzaSBsZSBjaGFtcCBhIGRcdTAwRTlqXHUwMEUwIHVuZSB2YWxldXIgKHNhdWYgc2kgZm9yY2U6IHRydWUpICovXG4gIGlmICghKG9wdHMgJiYgb3B0cy5mb3JjZSkpIHtcbiAgICB2YXIgZXhpc3RpbmcgPSAoZWwudmFsdWUgfHwgXCJcIikudHJpbSgpO1xuICAgIGlmIChleGlzdGluZy5sZW5ndGggPiAwKSByZXR1cm47XG4gIH1cbiAgZWwuZm9jdXMoKTtcblxuICAvKiBTZXR0ZXIgbmF0aWYgcG91ciBjb250b3VybmVyIFZ1ZSAzIC8gUmVhY3QgcXVpIG92ZXJyaWRlIC52YWx1ZSAqL1xuICB2YXIgcHJvdG8gPSBlbCBpbnN0YW5jZW9mIEhUTUxUZXh0QXJlYUVsZW1lbnQgPyBIVE1MVGV4dEFyZWFFbGVtZW50LnByb3RvdHlwZVxuICAgICAgICAgICAgOiBlbCBpbnN0YW5jZW9mIEhUTUxTZWxlY3RFbGVtZW50ID8gSFRNTFNlbGVjdEVsZW1lbnQucHJvdG90eXBlXG4gICAgICAgICAgICA6IEhUTUxJbnB1dEVsZW1lbnQucHJvdG90eXBlO1xuICB2YXIgbmF0aXZlU2V0dGVyID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihwcm90bywgJ3ZhbHVlJyk7XG4gIGlmIChuYXRpdmVTZXR0ZXIgJiYgbmF0aXZlU2V0dGVyLnNldCkge1xuICAgIG5hdGl2ZVNldHRlci5zZXQuY2FsbChlbCwgdmFsKTtcbiAgfSBlbHNlIHtcbiAgICBlbC52YWx1ZSA9IHZhbDtcbiAgfVxuXG4gIC8qIFNpbXVsZXIgdW5lIHZyYWllIGZyYXBwZSBwb3VyIFJlYWN0L1Z1ZSAoa2V5ZG93biArIGlucHV0ICsga2V5dXAgcGFyIGNhcmFjdFx1MDBFOHJlKSAqL1xuICB2YXIgc3RyVmFsID0gU3RyaW5nKHZhbCk7XG4gIGVsLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdmb2N1cycsIHsgYnViYmxlczogdHJ1ZSB9KSk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyVmFsLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGNoID0gc3RyVmFsW2ldO1xuICAgIGVsLmRpc3BhdGNoRXZlbnQobmV3IEtleWJvYXJkRXZlbnQoJ2tleWRvd24nLCB7IGJ1YmJsZXM6IHRydWUsIGtleTogY2gsIGNoYXJDb2RlOiBjaC5jaGFyQ29kZUF0KDApLCBrZXlDb2RlOiBjaC5jaGFyQ29kZUF0KDApIH0pKTtcbiAgICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBLZXlib2FyZEV2ZW50KCdrZXlwcmVzcycsIHsgYnViYmxlczogdHJ1ZSwga2V5OiBjaCwgY2hhckNvZGU6IGNoLmNoYXJDb2RlQXQoMCksIGtleUNvZGU6IGNoLmNoYXJDb2RlQXQoMCkgfSkpO1xuICAgIGVsLmRpc3BhdGNoRXZlbnQobmV3IEtleWJvYXJkRXZlbnQoJ2tleXVwJywgeyBidWJibGVzOiB0cnVlLCBrZXk6IGNoLCBjaGFyQ29kZTogY2guY2hhckNvZGVBdCgwKSwga2V5Q29kZTogY2guY2hhckNvZGVBdCgwKSB9KSk7XG4gIH1cbiAgZWwuZGlzcGF0Y2hFdmVudChuZXcgSW5wdXRFdmVudCgnaW5wdXQnLCB7IGJ1YmJsZXM6IHRydWUsIGRhdGE6IHN0clZhbCwgaW5wdXRUeXBlOiAnaW5zZXJ0VGV4dCcgfSkpO1xuICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2hhbmdlJywgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgZWwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2JsdXInLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuXG4gIGlmICh3aW5kb3cuJCAmJiB3aW5kb3cuJChlbCkudHJpZ2dlcikge1xuICAgIHdpbmRvdy4kKGVsKS52YWwodmFsKS50cmlnZ2VyKCdpbnB1dCcpLnRyaWdnZXIoJ2NoYW5nZScpLnRyaWdnZXIoJ2tleXVwJyk7XG4gIH1cbn1cblxuLyogXHUyNTAwXHUyNTAwIHNtYXJ0U2VsZWN0T3B0aW9uKCkgXHUyMDE0IGZ1enp5IG1hdGNoaW5nIHBvdXIgPHNlbGVjdD4gXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG5leHBvcnQgZnVuY3Rpb24gc21hcnRTZWxlY3RPcHRpb24oc2VsZWN0RWwsIHRhcmdldFZhbHVlKSB7XG4gIGlmICghc2VsZWN0RWwgfHwgc2VsZWN0RWwudGFnTmFtZSAhPT0gXCJTRUxFQ1RcIiB8fCAhdGFyZ2V0VmFsdWUpIHJldHVybiBmYWxzZTtcbiAgdmFyIHRhcmdldCA9ICh0YXJnZXRWYWx1ZSArIFwiXCIpLnRvTG93ZXJDYXNlKCkubm9ybWFsaXplKFwiTkZEXCIpLnJlcGxhY2UoL1tcXHUwMzAwLVxcdTAzNmZdL2csIFwiXCIpLnRyaW0oKTtcbiAgdmFyIG9wdGlvbnMgPSBBcnJheS5mcm9tKHNlbGVjdEVsLm9wdGlvbnMpO1xuICB2YXIgYmVzdFNjb3JlID0gMDtcbiAgdmFyIGJlc3RPcHRpb24gPSBudWxsO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgb3B0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBvcHRUZXh0ID0gKG9wdGlvbnNbaV0udGV4dCB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpLm5vcm1hbGl6ZShcIk5GRFwiKS5yZXBsYWNlKC9bXFx1MDMwMC1cXHUwMzZmXS9nLCBcIlwiKS50cmltKCk7XG4gICAgdmFyIG9wdFZhbCA9IChvcHRpb25zW2ldLnZhbHVlIHx8IFwiXCIpLnRvTG93ZXJDYXNlKCkubm9ybWFsaXplKFwiTkZEXCIpLnJlcGxhY2UoL1tcXHUwMzAwLVxcdTAzNmZdL2csIFwiXCIpLnRyaW0oKTtcbiAgICB2YXIgc2NvcmUgPSAwO1xuXG4gICAgLyogRXhhY3QgbWF0Y2ggPSAxMDBwdHMgKi9cbiAgICBpZiAob3B0VGV4dCA9PT0gdGFyZ2V0IHx8IG9wdFZhbCA9PT0gdGFyZ2V0KSB7IHNjb3JlID0gMTAwOyB9XG4gICAgLyogQ29udGFpbnMgPSA4MHB0cyAqL1xuICAgIGVsc2UgaWYgKG9wdFRleHQuaW5kZXhPZih0YXJnZXQpICE9PSAtMSB8fCB0YXJnZXQuaW5kZXhPZihvcHRUZXh0KSAhPT0gLTEpIHsgc2NvcmUgPSA4MDsgfVxuICAgIGVsc2UgaWYgKG9wdFZhbC5pbmRleE9mKHRhcmdldCkgIT09IC0xIHx8IHRhcmdldC5pbmRleE9mKG9wdFZhbCkgIT09IC0xKSB7IHNjb3JlID0gODA7IH1cbiAgICAvKiBMZXZlbnNodGVpbiA8PSAzID0gNjBwdHMgKi9cbiAgICBlbHNlIHtcbiAgICAgIHZhciBkaXN0ID0gbGV2ZW5zaHRlaW4ob3B0VGV4dCwgdGFyZ2V0KTtcbiAgICAgIGlmIChkaXN0IDw9IDMpIHNjb3JlID0gNjA7XG4gICAgICBlbHNlIHtcbiAgICAgICAgZGlzdCA9IGxldmVuc2h0ZWluKG9wdFZhbCwgdGFyZ2V0KTtcbiAgICAgICAgaWYgKGRpc3QgPD0gMykgc2NvcmUgPSA2MDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc2NvcmUgPiBiZXN0U2NvcmUpIHsgYmVzdFNjb3JlID0gc2NvcmU7IGJlc3RPcHRpb24gPSBvcHRpb25zW2ldOyB9XG4gICAgaWYgKHNjb3JlID09PSAxMDApIGJyZWFrO1xuICB9XG5cbiAgaWYgKGJlc3RTY29yZSA+PSA0MCAmJiBiZXN0T3B0aW9uKSB7XG4gICAgc2VsZWN0RWwudmFsdWUgPSBiZXN0T3B0aW9uLnZhbHVlO1xuICAgIHNlbGVjdEVsLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiY2hhbmdlXCIsIHsgYnViYmxlczogdHJ1ZSB9KSk7XG4gICAgc2VsZWN0RWwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJpbnB1dFwiLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyogXHUyNTAwXHUyNTAwIGZpbGxEYXRlUGlja2VyKCkgXHUyMDE0IHN1cHBvcnQgZGF0ZXBpY2tlciBsaWJyYXJpZXMgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmlsbERhdGVQaWNrZXIoZWwsIGRhdGVTdHIpIHtcbiAgaWYgKCFlbCB8fCAhZGF0ZVN0cikgcmV0dXJuIGZhbHNlO1xuXG4gIC8qIDEuIEZsYXRwaWNrciAqL1xuICB0cnkge1xuICAgIGlmIChlbC5fZmxhdHBpY2tyICYmIGVsLl9mbGF0cGlja3Iuc2V0RGF0ZSkge1xuICAgICAgZWwuX2ZsYXRwaWNrci5zZXREYXRlKGRhdGVTdHIsIHRydWUpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9IGNhdGNoKGUpIHt9XG5cbiAgLyogMi4gUGlrYWRheSAqL1xuICB0cnkge1xuICAgIGlmIChlbC5fcGlrYWRheSAmJiBlbC5fcGlrYWRheS5zZXREYXRlKSB7XG4gICAgICB2YXIgcGFydHMgPSBkYXRlU3RyLm1hdGNoKC8oXFxkezJ9KVtcXC9cXC1dKFxcZHsyfSlbXFwvXFwtXShcXGR7NH0pLyk7XG4gICAgICBpZiAocGFydHMpIHtcbiAgICAgICAgZWwuX3Bpa2FkYXkuc2V0RGF0ZShuZXcgRGF0ZShwYXJzZUludChwYXJ0c1szXSksIHBhcnNlSW50KHBhcnRzWzJdKSAtIDEsIHBhcnNlSW50KHBhcnRzWzFdKSkpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2goZSkge31cblxuICAvKiAzLiBqUXVlcnkgVUkgZGF0ZXBpY2tlciAqL1xuICB0cnkge1xuICAgIGlmICh3aW5kb3cualF1ZXJ5ICYmIHdpbmRvdy5qUXVlcnkoZWwpLmRhdGVwaWNrZXIpIHtcbiAgICAgIHdpbmRvdy5qUXVlcnkoZWwpLmRhdGVwaWNrZXIoXCJzZXREYXRlXCIsIGRhdGVTdHIpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9IGNhdGNoKGUpIHt9XG5cbiAgLyogNC4gQW5ndWxhciBNYXRlcmlhbCBtYXQtZm9ybS1maWVsZCBcdTIwMTQgZnJhcHBlIGxlbnRlIGNhcmFjdFx1MDBFOHJlIHBhciBjYXJhY3RcdTAwRThyZSAqL1xuICB0cnkge1xuICAgIHZhciBtYXRGaWVsZCA9IGVsLmNsb3Nlc3QgJiYgZWwuY2xvc2VzdChcIm1hdC1mb3JtLWZpZWxkLCAubWF0LWZvcm0tZmllbGQsIC5tYXQtbWRjLWZvcm0tZmllbGRcIik7XG4gICAgaWYgKG1hdEZpZWxkKSB7XG4gICAgICBlbC5mb2N1cygpO1xuICAgICAgZWwuY2xpY2soKTtcbiAgICAgIGVsLnZhbHVlID0gXCJcIjtcbiAgICAgIGVsLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiaW5wdXRcIiwgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgICAgIHZhciBjaGFycyA9IGRhdGVTdHIucmVwbGFjZSgvXFxEL2csIFwiXCIpO1xuICAgICAgZm9yICh2YXIgY2kgPSAwOyBjaSA8IGNoYXJzLmxlbmd0aDsgY2krKykge1xuICAgICAgICB2YXIgY2ggPSBjaGFyc1tjaV07XG4gICAgICAgIGVsLmRpc3BhdGNoRXZlbnQobmV3IEtleWJvYXJkRXZlbnQoXCJrZXlkb3duXCIsIHsgYnViYmxlczogdHJ1ZSwga2V5OiBjaCwgY29kZTogXCJEaWdpdFwiICsgY2gsIGtleUNvZGU6IDQ4ICsgcGFyc2VJbnQoY2gpIH0pKTtcbiAgICAgICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgS2V5Ym9hcmRFdmVudChcImtleXByZXNzXCIsIHsgYnViYmxlczogdHJ1ZSwga2V5OiBjaCwgY2hhckNvZGU6IGNoLmNoYXJDb2RlQXQoMCkgfSkpO1xuICAgICAgICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBJbnB1dEV2ZW50KFwiaW5wdXRcIiwgeyBidWJibGVzOiB0cnVlLCBkYXRhOiBjaCwgaW5wdXRUeXBlOiBcImluc2VydFRleHRcIiB9KSk7XG4gICAgICAgIGVsLmRpc3BhdGNoRXZlbnQobmV3IEtleWJvYXJkRXZlbnQoXCJrZXl1cFwiLCB7IGJ1YmJsZXM6IHRydWUsIGtleTogY2gsIGNvZGU6IFwiRGlnaXRcIiArIGNoLCBrZXlDb2RlOiA0OCArIHBhcnNlSW50KGNoKSB9KSk7XG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHIpIHsgc2V0VGltZW91dChyLCA2MCk7IH0pO1xuICAgICAgfVxuICAgICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJjaGFuZ2VcIiwgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgICAgIGVsLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiYmx1clwiLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgICAgaWYgKGVsLnZhbHVlICE9PSBcIlwiKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0gY2F0Y2goZSkge31cblxuICAvKiA1LiBGYWxsYmFjayB1bHRyYUZpbGwgKi9cbiAgdWx0cmFGaWxsKGVsLCBkYXRlU3RyKTtcbiAgcmV0dXJuIChlbC52YWx1ZSB8fCBcIlwiKSAhPT0gXCJcIjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdFJhZGl4T3B0aW9uKHNlbGVjdE5hbWUsIHZhbHVlKSB7XG4gIC8qIFJhZGl4IFZ1ZSA6IGNsaXF1ZXIgbGUgdHJpZ2dlciBwdWlzIGwnb3B0aW9uIGRhbnMgbGUgcG9ydGFsICovXG4gIGNvbnN0IGhpZGRlblNlbGVjdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdFtuYW1lPVwiJyArIHNlbGVjdE5hbWUgKyAnXCJdJyk7XG4gIGlmICghaGlkZGVuU2VsZWN0KSByZXR1cm47XG4gIGNvbnN0IGZvcm1GaWVsZCA9IGhpZGRlblNlbGVjdC5jbG9zZXN0KFwiLnNwYWNlLXktMlwiKTtcbiAgaWYgKCFmb3JtRmllbGQpIHJldHVybjtcbiAgY29uc3QgdHJpZ2dlciA9IGZvcm1GaWVsZC5xdWVyeVNlbGVjdG9yKCdbcm9sZT1cImNvbWJvYm94XCJdJyk7XG4gIGlmICghdHJpZ2dlcikgcmV0dXJuO1xuICB0cmlnZ2VyLmNsaWNrKCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFsbE9wdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbcm9sZT1cIm9wdGlvblwiXScpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYWxsT3B0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIG9wdCA9IGFsbE9wdGlvbnNbaV07XG4gICAgICB2YXIgb3B0VmFsdWUgPSBvcHQuZ2V0QXR0cmlidXRlKFwiZGF0YS12YWx1ZVwiKSB8fCBcIlwiO1xuICAgICAgdmFyIG9wdFRleHQgPSAob3B0LnRleHRDb250ZW50IHx8IFwiXCIpLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKG9wdFZhbHVlID09PSB2YWx1ZSB8fCBvcHRUZXh0ID09PSB2YWx1ZSkge1xuICAgICAgICBvcHQuY2xpY2soKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICAvKiBGYWxsYmFjayA6IGVzc2FpIHZpYSBsZSBoaWRkZW4gc2VsZWN0IG5hdGlmICovXG4gICAgaGlkZGVuU2VsZWN0LnZhbHVlID0gdmFsdWU7XG4gICAgaGlkZGVuU2VsZWN0LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiY2hhbmdlXCIsIHsgYnViYmxlczogdHJ1ZSB9KSk7XG4gIH0sIDMwMCk7XG59XG5cbi8qIFRlbnRlIGRlIHJlbXBsaXIgdW4gY2hhbXAgYXZlYyB0b3V0ZXMgbGVzIHN0cmF0XHUwMEU5Z2llcyBkaXNwb25pYmxlcyAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNtYXJ0RmlsbEZpZWxkKGVsLCB2YWx1ZSwgaXNEYXRlRmllbGQpIHtcbiAgaWYgKCFlbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsIHx8IFN0cmluZyh2YWx1ZSkudHJpbSgpID09PSBcIlwiKSByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIGRhdGVOb3JtID0gaXNEYXRlRmllbGQgPyBub3JtYWxpemVEYXRlVmFsdWUodmFsdWUpIDogbnVsbDtcbiAgdmFyIGRpc3BsYXlWYWwgPSBkYXRlTm9ybSA/IGRhdGVOb3JtLmRpc3BsYXkgOiBTdHJpbmcodmFsdWUpO1xuXG4gIC8qIFx1MjUwMFx1MjUwMCBTRUxFQ1QgXHUyMTkyIHNtYXJ0U2VsZWN0T3B0aW9uIGZ1enp5IFx1MjUwMFx1MjUwMCAqL1xuICBpZiAoZWwudGFnTmFtZSA9PT0gXCJTRUxFQ1RcIikge1xuICAgIHJldHVybiBzbWFydFNlbGVjdE9wdGlvbihlbCwgZGlzcGxheVZhbCk7XG4gIH1cblxuICAvKiBcdTI1MDBcdTI1MDAgRGF0ZSBwaWNrZXIgbGlicmFyaWVzIChGbGF0cGlja3IsIFBpa2FkYXksIGpRdWVyeSBVSSwgQW5ndWxhciBNYXRlcmlhbCkgXHUyNTAwXHUyNTAwICovXG4gIGlmIChpc0RhdGVGaWVsZCkge1xuICAgIHRyeSB7XG4gICAgICB2YXIgZHBSZXN1bHQgPSBhd2FpdCBmaWxsRGF0ZVBpY2tlcihlbCwgZGlzcGxheVZhbCk7XG4gICAgICBpZiAoZHBSZXN1bHQpIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2goZSkge31cbiAgfVxuXG4gIC8qIFx1MjUwMFx1MjUwMCBTdHJhdFx1MDBFOWdpZSAwIDogaW5wdXRbdHlwZT1kYXRlXSBcdTIxOTIgZm9ybWF0IElTTyBkaXJlY3QgXHUyNTAwXHUyNTAwICovXG4gIGlmIChlbC50eXBlID09PSBcImRhdGVcIiAmJiBkYXRlTm9ybSAmJiBkYXRlTm9ybS5pc28pIHtcbiAgICB0cnkge1xuICAgICAgdmFyIHNldHRlcjAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKEhUTUxJbnB1dEVsZW1lbnQucHJvdG90eXBlLCBcInZhbHVlXCIpO1xuICAgICAgaWYgKHNldHRlcjAgJiYgc2V0dGVyMC5zZXQpIHNldHRlcjAuc2V0LmNhbGwoZWwsIGRhdGVOb3JtLmlzbyk7XG4gICAgICBlbHNlIGVsLnZhbHVlID0gZGF0ZU5vcm0uaXNvO1xuICAgICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJpbnB1dFwiLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJjaGFuZ2VcIiwgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgICAgIGlmIChmaWVsZEhhc1ZhbHVlKGVsLCBkYXRlTm9ybS5pc28pKSByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoKGUpIHt9XG4gIH1cblxuICAvKiBcdTI1MDBcdTI1MDAgU3RyYXRcdTAwRTlnaWUgMSA6IHVsdHJhRmlsbCBzdGFuZGFyZCAobmF0aWYgc2V0dGVyICsgZXZlbnRzICsgalF1ZXJ5KSBcdTI1MDBcdTI1MDAgKi9cbiAgdHJ5IHtcbiAgICB1bHRyYUZpbGwoZWwsIGRpc3BsYXlWYWwpO1xuICAgIGlmIChmaWVsZEhhc1ZhbHVlKGVsLCBkaXNwbGF5VmFsKSkgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2goZSkge31cblxuICAvKiBcdTI1MDBcdTI1MDAgU3RyYXRcdTAwRTlnaWUgMiA6IHNldEF0dHJpYnV0ZSB2YWx1ZSArIGRpc3BhdGNoRXZlbnQgSW5wdXRFdmVudCBcdTI1MDBcdTI1MDAgKi9cbiAgdHJ5IHtcbiAgICBlbC5zZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiLCBkaXNwbGF5VmFsKTtcbiAgICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBJbnB1dEV2ZW50KFwiaW5wdXRcIiwgeyBidWJibGVzOiB0cnVlLCBkYXRhOiBkaXNwbGF5VmFsLCBpbnB1dFR5cGU6IFwiaW5zZXJ0VGV4dFwiIH0pKTtcbiAgICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImNoYW5nZVwiLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgIGlmIChmaWVsZEhhc1ZhbHVlKGVsLCBkaXNwbGF5VmFsKSkgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2goZSkge31cblxuICAvKiBcdTI1MDBcdTI1MDAgU3RyYXRcdTAwRTlnaWUgMyA6IGRvY3VtZW50LmV4ZWNDb21tYW5kIChkZXByZWNhdGVkIG1haXMgbWFyY2hlIGVuY29yZSBzdXIgY2VydGFpbnMgcG9ydGFpbHMpIFx1MjUwMFx1MjUwMCAqL1xuICB0cnkge1xuICAgIGVsLmZvY3VzKCk7XG4gICAgZWwuc2VsZWN0KCk7XG4gICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJzZWxlY3RBbGxcIiwgZmFsc2UsIG51bGwpO1xuICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKFwiaW5zZXJ0VGV4dFwiLCBmYWxzZSwgZGlzcGxheVZhbCk7XG4gICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJjaGFuZ2VcIiwgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgICBpZiAoZmllbGRIYXNWYWx1ZShlbCwgZGlzcGxheVZhbCkpIHJldHVybiB0cnVlO1xuICB9IGNhdGNoKGUpIHt9XG5cbiAgLyogXHUyNTAwXHUyNTAwIFN0cmF0XHUwMEU5Z2llIDQgOiBQYXN0ZSBldmVudCAoY2VydGFpbnMgZnJhbWV3b3JrcyBuJ1x1MDBFOWNvdXRlbnQgcXVlIFx1MDBFN2EpIFx1MjUwMFx1MjUwMCAqL1xuICB0cnkge1xuICAgIGVsLmZvY3VzKCk7XG4gICAgdmFyIGR0ID0gbmV3IERhdGFUcmFuc2ZlcigpO1xuICAgIGR0LnNldERhdGEoXCJ0ZXh0L3BsYWluXCIsIGRpc3BsYXlWYWwpO1xuICAgIHZhciBwYXN0ZUV2dCA9IG5ldyBDbGlwYm9hcmRFdmVudChcInBhc3RlXCIsIHsgYnViYmxlczogdHJ1ZSwgY2FuY2VsYWJsZTogdHJ1ZSwgY2xpcGJvYXJkRGF0YTogZHQgfSk7XG4gICAgZWwuZGlzcGF0Y2hFdmVudChwYXN0ZUV2dCk7XG4gICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJpbnB1dFwiLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgIGVsLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiY2hhbmdlXCIsIHsgYnViYmxlczogdHJ1ZSB9KSk7XG4gICAgaWYgKGZpZWxkSGFzVmFsdWUoZWwsIGRpc3BsYXlWYWwpKSByZXR1cm4gdHJ1ZTtcbiAgfSBjYXRjaChlKSB7fVxuXG4gIC8qIFx1MjUwMFx1MjUwMCBTdHJhdFx1MDBFOWdpZSA1IDogQW5ndWxhciBOZ0NvbnRyb2wgKFJlYWN0aXZlIEZvcm1zIC8gX19uZ0NvbnRleHRfXykgXHUyNTAwXHUyNTAwICovXG4gIHRyeSB7XG4gICAgdmFyIG5nQ3R4ID0gZWwuX19uZ0NvbnRleHRfXyB8fCAoZWwuX2VsZW1lbnRSZWYgJiYgZWwuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCAmJiBlbC5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50Ll9fbmdDb250ZXh0X18pO1xuICAgIGlmIChuZ0N0eCkge1xuICAgICAgdmFyIGRpciA9IEFycmF5LmlzQXJyYXkobmdDdHgpID8gbmdDdHguZmluZChmdW5jdGlvbihjKSB7IHJldHVybiBjICYmIGMuY29udHJvbDsgfSkgOiBuZ0N0eDtcbiAgICAgIGlmIChkaXIgJiYgZGlyLmNvbnRyb2wgJiYgZGlyLmNvbnRyb2wuc2V0VmFsdWUpIHtcbiAgICAgICAgZGlyLmNvbnRyb2wuc2V0VmFsdWUoaXNEYXRlRmllbGQgPyBkaXNwbGF5VmFsIDogZGlzcGxheVZhbCwgeyBlbWl0RXZlbnQ6IHRydWUgfSk7XG4gICAgICAgIGRpci5jb250cm9sLm1hcmtBc0RpcnR5KCk7XG4gICAgICAgIGRpci5jb250cm9sLm1hcmtBc1RvdWNoZWQoKTtcbiAgICAgICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJpbnB1dFwiLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgICAgICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImNoYW5nZVwiLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgICAgICBpZiAoZmllbGRIYXNWYWx1ZShlbCwgZGlzcGxheVZhbCkgfHwgKGRpci5jb250cm9sLnZhbHVlICYmIFN0cmluZyhkaXIuY29udHJvbC52YWx1ZSkudHJpbSgpICE9PSBcIlwiKSkgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoKGUpIHt9XG5cbiAgLyogXHUyNTAwXHUyNTAwIFN0cmF0XHUwMEU5Z2llIDYgOiBWdWUgMyBfX3ZNb2RlbERpcmVjdGl2ZSAvIF9fdnVlUGFyZW50Q29tcG9uZW50IFx1MjUwMFx1MjUwMCAqL1xuICB0cnkge1xuICAgIHZhciB2dWVJbnN0ID0gZWwuX192dWVQYXJlbnRDb21wb25lbnQ7XG4gICAgaWYgKHZ1ZUluc3QgJiYgdnVlSW5zdC5wcm9wcyAmJiB2dWVJbnN0LmVtaXQpIHtcbiAgICAgIHZ1ZUluc3QuZW1pdChcInVwZGF0ZTptb2RlbFZhbHVlXCIsIGRpc3BsYXlWYWwpO1xuICAgICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJpbnB1dFwiLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgICAgaWYgKGZpZWxkSGFzVmFsdWUoZWwsIGRpc3BsYXlWYWwpKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgLyogVnVlIDIgKi9cbiAgICB2YXIgdnVlMiA9IGVsLl9fdnVlX187XG4gICAgaWYgKHZ1ZTIgJiYgdnVlMi4kZW1pdCkge1xuICAgICAgdnVlMi4kZW1pdChcImlucHV0XCIsIGRpc3BsYXlWYWwpO1xuICAgICAgaWYgKGZpZWxkSGFzVmFsdWUoZWwsIGRpc3BsYXlWYWwpKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0gY2F0Y2goZSkge31cblxuICAvKiBcdTI1MDBcdTI1MDAgU3RyYXRcdTAwRTlnaWUgNyA6IEZsYXRwaWNrciBcdTI1MDBcdTI1MDAgKi9cbiAgdHJ5IHtcbiAgICBpZiAoZWwuX2ZsYXRwaWNrciAmJiBlbC5fZmxhdHBpY2tyLnNldERhdGUgJiYgZGF0ZU5vcm0gJiYgZGF0ZU5vcm0uZGQpIHtcbiAgICAgIGVsLl9mbGF0cGlja3Iuc2V0RGF0ZShkYXRlTm9ybS5kaXNwbGF5LCB0cnVlLCBcImQvbS9ZXCIpO1xuICAgICAgaWYgKGZpZWxkSGFzVmFsdWUoZWwsIGRhdGVOb3JtLmRpc3BsYXkpKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0gY2F0Y2goZSkge31cblxuICAvKiBcdTI1MDBcdTI1MDAgU3RyYXRcdTAwRTlnaWUgOCA6IFJhZHplbiAvIEJsYXpvciAoZGF0ZSkgXHUyMDE0IHZpYSBsJ2lucHV0IHZpc2libGUgZGFucyBsZSBzaGFkb3cgRE9NIFx1MjUwMFx1MjUwMCAqL1xuICB0cnkge1xuICAgIGlmIChpc0RhdGVGaWVsZCkge1xuICAgICAgdmFyIHNoYWRvdyA9IGVsLnNoYWRvd1Jvb3QgfHwgKGVsLnBhcmVudEVsZW1lbnQgJiYgZWwucGFyZW50RWxlbWVudC5zaGFkb3dSb290KTtcbiAgICAgIHZhciBzaGFkb3dJbnB1dCA9IHNoYWRvdyAmJiBzaGFkb3cucXVlcnlTZWxlY3RvcihcImlucHV0XCIpO1xuICAgICAgaWYgKHNoYWRvd0lucHV0KSB7XG4gICAgICAgIHVsdHJhRmlsbChzaGFkb3dJbnB1dCwgZGlzcGxheVZhbCk7XG4gICAgICAgIGlmIChmaWVsZEhhc1ZhbHVlKHNoYWRvd0lucHV0LCBkaXNwbGF5VmFsKSkgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoKGUpIHt9XG5cbiAgLyogXHUyNTAwXHUyNTAwIFN0cmF0XHUwMEU5Z2llIDkgOiBTaW11bGF0aW9uIGZyYXBwZSBkYW5zIHVuIGRhdGUgcGlja2VyIGN1c3RvbSAoY2xpYyArIGVmZmFjZW1lbnQgKyBzYWlzaWUpIFx1MjUwMFx1MjUwMCAqL1xuICBpZiAoaXNEYXRlRmllbGQgJiYgZGF0ZU5vcm0gJiYgZGF0ZU5vcm0uZGQpIHtcbiAgICB0cnkge1xuICAgICAgZWwuZm9jdXMoKTtcbiAgICAgIGVsLmNsaWNrKCk7XG4gICAgICAvKiBFZmZhY2VyIGxlIGNoYW1wICovXG4gICAgICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBLZXlib2FyZEV2ZW50KFwia2V5ZG93blwiLCB7IGJ1YmJsZXM6IHRydWUsIGtleTogXCJhXCIsIGN0cmxLZXk6IHRydWUgfSkpO1xuICAgICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgS2V5Ym9hcmRFdmVudChcImtleWRvd25cIiwgeyBidWJibGVzOiB0cnVlLCBrZXk6IFwiRGVsZXRlXCIgfSkpO1xuICAgICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgS2V5Ym9hcmRFdmVudChcImtleWRvd25cIiwgeyBidWJibGVzOiB0cnVlLCBrZXk6IFwiQmFja3NwYWNlXCIgfSkpO1xuICAgICAgZWwudmFsdWUgPSBcIlwiO1xuXG4gICAgICAvKiBUYXBlciBsYSBkYXRlIGNoaWZmcmUgcGFyIGNoaWZmcmUgKi9cbiAgICAgIHZhciBkYXRlU3RyID0gZGF0ZU5vcm0uZGQgKyBkYXRlTm9ybS5tbSArIGRhdGVOb3JtLnl5eXk7XG4gICAgICBmb3IgKHZhciBjaSA9IDA7IGNpIDwgZGF0ZVN0ci5sZW5ndGg7IGNpKyspIHtcbiAgICAgICAgdmFyIGNoID0gZGF0ZVN0cltjaV07XG4gICAgICAgIGVsLmRpc3BhdGNoRXZlbnQobmV3IEtleWJvYXJkRXZlbnQoXCJrZXlkb3duXCIsICB7IGJ1YmJsZXM6IHRydWUsIGtleTogY2gsIGNvZGU6IFwiRGlnaXRcIiArIGNoLCBrZXlDb2RlOiA0OCArIHBhcnNlSW50KGNoKSB9KSk7XG4gICAgICAgIGVsLmRpc3BhdGNoRXZlbnQobmV3IEtleWJvYXJkRXZlbnQoXCJrZXlwcmVzc1wiLCB7IGJ1YmJsZXM6IHRydWUsIGtleTogY2gsIGNvZGU6IFwiRGlnaXRcIiArIGNoLCBrZXlDb2RlOiA0OCArIHBhcnNlSW50KGNoKSB9KSk7XG4gICAgICAgIGVsLmRpc3BhdGNoRXZlbnQobmV3IEtleWJvYXJkRXZlbnQoXCJrZXl1cFwiLCAgICB7IGJ1YmJsZXM6IHRydWUsIGtleTogY2gsIGNvZGU6IFwiRGlnaXRcIiArIGNoLCBrZXlDb2RlOiA0OCArIHBhcnNlSW50KGNoKSB9KSk7XG4gICAgICB9XG4gICAgICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImlucHV0XCIsICB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJjaGFuZ2VcIiwgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgICAgIGVsLmRpc3BhdGNoRXZlbnQobmV3IEtleWJvYXJkRXZlbnQoXCJrZXlkb3duXCIsIHsgYnViYmxlczogdHJ1ZSwga2V5OiBcIlRhYlwiIH0pKTtcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHIpIHsgc2V0VGltZW91dChyLCAxMDApOyB9KTtcbiAgICAgIGlmIChmaWVsZEhhc1ZhbHVlKGVsLCBkYXRlTm9ybS5kaXNwbGF5KSB8fCBlbC52YWx1ZSAhPT0gXCJcIikgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaChlKSB7fVxuICB9XG5cbiAgLyogXHUyNTAwXHUyNTAwIFN0cmF0XHUwMEU5Z2llIDliIDogZGF0ZSBwaWNrZXIgYXZlYyBpY1x1MDBGNG5lIGNhbGVuZHJpZXIgXHUyMDE0IGNsaXF1ZXIgbCdpY1x1MDBGNG5lIHB1aXMgdGFwZXIgXHUyNTAwXHUyNTAwICovXG4gIGlmIChpc0RhdGVGaWVsZCAmJiBkYXRlTm9ybSAmJiBkYXRlTm9ybS5kZCkge1xuICAgIHRyeSB7XG4gICAgICAvKiBDaGVyY2hlciBsJ2ljXHUwMEY0bmUgY2FsZW5kcmllciBhc3NvY2lcdTAwRTllIChib3V0b24gb3Ugc3BhbiBhZGphY2VudCkgKi9cbiAgICAgIHZhciBwYXJlbnQgPSBlbC5wYXJlbnRFbGVtZW50IHx8IGVsLmNsb3Nlc3QoXCIuaW5wdXQtZ3JvdXBcIikgfHwgZWwuY2xvc2VzdChcIi5kYXRlLWZpZWxkXCIpO1xuICAgICAgdmFyIGNhbEljb24gPSBwYXJlbnQgJiYgKFxuICAgICAgICBwYXJlbnQucXVlcnlTZWxlY3RvcignYnV0dG9uW2NsYXNzKj1cImNhbGVuZGFyXCJdLCBidXR0b25bYXJpYS1sYWJlbCo9XCJkYXRlXCJdLCBidXR0b25bYXJpYS1sYWJlbCo9XCJjYWxlbmRyaWVyXCJdLCAuY2FsZW5kYXItaWNvbiwgLmRhdGVwaWNrZXItdG9nZ2xlLCBbY2xhc3MqPVwiZGF0ZXBpY2tlci1idG5cIl0nKSB8fFxuICAgICAgICBwYXJlbnQucXVlcnlTZWxlY3RvcignYnV0dG9uLCBbcm9sZT1cImJ1dHRvblwiXScpXG4gICAgICApO1xuICAgICAgaWYgKGNhbEljb24pIHtcbiAgICAgICAgY2FsSWNvbi5jbGljaygpO1xuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShmdW5jdGlvbihyKSB7IHNldFRpbWVvdXQociwgMzAwKTsgfSk7XG4gICAgICAgIC8qIENoZXJjaGVyIGxlcyBjaGFtcHMgam91ci9tb2lzL2Fublx1MDBFOWUgZGFucyBsZSBwaWNrZXIgb3V2ZXJ0ICovXG4gICAgICAgIHZhciBwaWNrZXJJbnB1dHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZGF0ZXBpY2tlciBpbnB1dCwgLmNhbGVuZGFyIGlucHV0LCBbY2xhc3MqPVwiZGF0ZXBpY2tlclwiXSBpbnB1dCwgW3JvbGU9XCJkaWFsb2dcIl0gaW5wdXQnKTtcbiAgICAgICAgaWYgKHBpY2tlcklucHV0cy5sZW5ndGggPj0gMykge1xuICAgICAgICAgIHVsdHJhRmlsbChwaWNrZXJJbnB1dHNbMF0sIGRhdGVOb3JtLmRkKTtcbiAgICAgICAgICB1bHRyYUZpbGwocGlja2VySW5wdXRzWzFdLCBkYXRlTm9ybS5tbSk7XG4gICAgICAgICAgdWx0cmFGaWxsKHBpY2tlcklucHV0c1syXSwgZGF0ZU5vcm0ueXl5eSk7XG4gICAgICAgIH0gZWxzZSBpZiAocGlja2VySW5wdXRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgIHVsdHJhRmlsbChwaWNrZXJJbnB1dHNbMF0sIGRhdGVOb3JtLmRpc3BsYXkpO1xuICAgICAgICB9XG4gICAgICAgIC8qIEZlcm1lciBsZSBwaWNrZXIgKi9cbiAgICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgS2V5Ym9hcmRFdmVudChcImtleWRvd25cIiwgeyBidWJibGVzOiB0cnVlLCBrZXk6IFwiRXNjYXBlXCIgfSkpO1xuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShmdW5jdGlvbihyKSB7IHNldFRpbWVvdXQociwgMjAwKTsgfSk7XG4gICAgICAgIGlmIChlbC52YWx1ZSAhPT0gXCJcIikgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSBjYXRjaChlKSB7fVxuICB9XG5cbiAgLyogXHUyNTAwXHUyNTAwIFN0cmF0XHUwMEU5Z2llIDEwIDogPHNlbGVjdD4gXHUyMDE0IHNtYXJ0U2VsZWN0T3B0aW9uIGZ1enp5IFx1MjUwMFx1MjUwMCAqL1xuICBpZiAoZWwudGFnTmFtZSA9PT0gXCJTRUxFQ1RcIikge1xuICAgIHRyeSB7XG4gICAgICBpZiAoc21hcnRTZWxlY3RPcHRpb24oZWwsIGRpc3BsYXlWYWwpKSByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoKGUpIHt9XG4gIH1cblxuICAvKiBcdTI1MDBcdTI1MDAgU3RyYXRcdTAwRTlnaWUgMTEgOiBjb250ZW50ZWRpdGFibGUgKFx1MDBFOWRpdGV1cnMgcmljaCB0ZXh0KSBcdTI1MDBcdTI1MDAgKi9cbiAgdHJ5IHtcbiAgICBpZiAoZWwuZ2V0QXR0cmlidXRlKFwiY29udGVudGVkaXRhYmxlXCIpID09PSBcInRydWVcIiB8fCBlbC5jb250ZW50RWRpdGFibGUgPT09IFwidHJ1ZVwiKSB7XG4gICAgICBlbC5mb2N1cygpO1xuICAgICAgZWwudGV4dENvbnRlbnQgPSBkaXNwbGF5VmFsO1xuICAgICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgSW5wdXRFdmVudChcImlucHV0XCIsIHsgYnViYmxlczogdHJ1ZSwgZGF0YTogZGlzcGxheVZhbCwgaW5wdXRUeXBlOiBcImluc2VydFRleHRcIiB9KSk7XG4gICAgICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImNoYW5nZVwiLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJibHVyXCIsICAgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgICAgIGlmIChlbC50ZXh0Q29udGVudC50cmltKCkgIT09IFwiXCIpIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSBjYXRjaChlKSB7fVxuXG4gIC8qIFx1MjUwMFx1MjUwMCBTdHJhdFx1MDBFOWdpZSAxMiA6IFJlYWN0IGludGVybmFsIGZpYmVyIChfX3JlYWN0RmliZXIgLyBfX3JlYWN0UHJvcHMpIFx1MjUwMFx1MjUwMCAqL1xuICB0cnkge1xuICAgIHZhciBmaWJlcktleSA9IE9iamVjdC5rZXlzKGVsKS5maW5kKGZ1bmN0aW9uKGspIHsgcmV0dXJuIGsuc3RhcnRzV2l0aChcIl9fcmVhY3RGaWJlclwiKSB8fCBrLnN0YXJ0c1dpdGgoXCJfX3JlYWN0SW50ZXJuYWxJbnN0YW5jZVwiKTsgfSk7XG4gICAgdmFyIHByb3BzS2V5ID0gT2JqZWN0LmtleXMoZWwpLmZpbmQoZnVuY3Rpb24oaykgeyByZXR1cm4gay5zdGFydHNXaXRoKFwiX19yZWFjdFByb3BzXCIpOyB9KTtcbiAgICBpZiAocHJvcHNLZXkgJiYgZWxbcHJvcHNLZXldKSB7XG4gICAgICB2YXIgcHJvcHMgPSBlbFtwcm9wc0tleV07XG4gICAgICBpZiAodHlwZW9mIHByb3BzLm9uQ2hhbmdlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdmFyIG5zID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihIVE1MSW5wdXRFbGVtZW50LnByb3RvdHlwZSwgXCJ2YWx1ZVwiKTtcbiAgICAgICAgaWYgKG5zICYmIG5zLnNldCkgbnMuc2V0LmNhbGwoZWwsIGRpc3BsYXlWYWwpOyBlbHNlIGVsLnZhbHVlID0gZGlzcGxheVZhbDtcbiAgICAgICAgcHJvcHMub25DaGFuZ2UoeyB0YXJnZXQ6IGVsLCBjdXJyZW50VGFyZ2V0OiBlbCwgYnViYmxlczogdHJ1ZSwgdHlwZTogXCJjaGFuZ2VcIiB9KTtcbiAgICAgICAgaWYgKGZpZWxkSGFzVmFsdWUoZWwsIGRpc3BsYXlWYWwpKSByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2goZSkge31cblxuICAvKiBcdTI1MDBcdTI1MDAgU3RyYXRcdTAwRTlnaWUgMTMgOiBTdmVsdGUgKCQkIC8gX19zdmVsdGUpIFx1MjUwMFx1MjUwMCAqL1xuICB0cnkge1xuICAgIGlmIChlbC5fX3N2ZWx0ZV9tZXRhIHx8IGVsLiQkKSB7XG4gICAgICB2YXIgc3ZlbHRlTnMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKEhUTUxJbnB1dEVsZW1lbnQucHJvdG90eXBlLCBcInZhbHVlXCIpO1xuICAgICAgaWYgKHN2ZWx0ZU5zICYmIHN2ZWx0ZU5zLnNldCkgc3ZlbHRlTnMuc2V0LmNhbGwoZWwsIGRpc3BsYXlWYWwpOyBlbHNlIGVsLnZhbHVlID0gZGlzcGxheVZhbDtcbiAgICAgIGVsLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiaW5wdXRcIiwgIHsgYnViYmxlczogdHJ1ZSB9KSk7XG4gICAgICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImNoYW5nZVwiLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgICAgaWYgKGZpZWxkSGFzVmFsdWUoZWwsIGRpc3BsYXlWYWwpKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0gY2F0Y2goZSkge31cblxuICAvKiBcdTI1MDBcdTI1MDAgU3RyYXRcdTAwRTlnaWUgMTQgOiBGb3JjZSBicnV0ZSBcdTIwMTQgc2V0dGVyIGRpcmVjdCBzYW5zIHZcdTAwRTlyaWZpY2F0aW9uIFx1MjUwMFx1MjUwMCAqL1xuICB0cnkge1xuICAgIGVsLnZhbHVlID0gZGlzcGxheVZhbDtcbiAgICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImlucHV0XCIsICB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgIGVsLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiY2hhbmdlXCIsIHsgYnViYmxlczogdHJ1ZSB9KSk7XG4gICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJibHVyXCIsICAgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgICByZXR1cm4gZmllbGRIYXNWYWx1ZShlbCwgZGlzcGxheVZhbCk7XG4gIH0gY2F0Y2goZSkge31cblxuICByZXR1cm4gZmFsc2U7XG59XG4iLCAiLyogXHUyNTAwXHUyNTAwIExlYXJuaW5nIHNpZ25hbCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cblxuZXhwb3J0IGZ1bmN0aW9uIG1hcmtGaWxsZWRCeU9wdGlCb3QoZWwsIHZhcmlhYmxlKSB7XG4gIGVsLnNldEF0dHJpYnV0ZShcImRhdGEtb3B0aWJvdC1maWxsZWRcIiwgdmFyaWFibGUpO1xuICBlbC5zZXRBdHRyaWJ1dGUoXCJkYXRhLW9wdGlib3QtdmFsdWVcIiwgZWwudmFsdWUpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VuZExlYXJuaW5nU2lnbmFsKHNpZ25hbCkge1xuICB2YXIgc3luY1Rva2VuID0gYXdhaXQgZ2V0U3luY1Rva2VuKCk7XG4gIGlmICghc3luY1Rva2VuKSByZXR1cm47XG4gIGZldGNoKFwiaHR0cHM6Ly9vcHRpYm90LmZyL2FwaS9leHRlbnNpb24vc21hcnQtZmlsbC9sZWFyblwiLCB7XG4gICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBzeW5jVG9rZW46IHN5bmNUb2tlbiwgaG9zdG5hbWU6IHNpZ25hbC5ob3N0bmFtZSwgc2VsZWN0b3I6IHNpZ25hbC5zZWxlY3RvciwgbGFiZWw6IHNpZ25hbC5sYWJlbCwgb2xkVmFyaWFibGU6IHNpZ25hbC5vbGRWYXJpYWJsZSwgY29ycmVjdFZhcmlhYmxlOiBzaWduYWwuY29ycmVjdFZhcmlhYmxlIH0pXG4gIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikgeyBjb25zb2xlLndhcm4oXCJbT3B0aUJvdF0gbGVhcm5pbmcgc2lnbmFsIGZhaWxlZDpcIiwgZXJyKTsgfSk7XG59XG4iLCAiLyogXHUyNTAwXHUyNTAwIFNtYXJ0IEZpbGwgXHUyMDE0IHBlcmZvcm1TbWFydEZpbGwgKyBoZWxwZXJzIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuXG5pbXBvcnQgeyBxdWVyeVNlbGVjdG9yQWxsRGVlcCB9IGZyb20gXCIuLi91dGlscy9kb20uanNcIjtcbmltcG9ydCB7IGdldFNtYXJ0RmlsbERhdGEsIGdldENhY2hlZENsaWVudCB9IGZyb20gXCIuLi91dGlscy9kYXRhLmpzXCI7XG5pbXBvcnQgeyB1bHRyYUZpbGwsIHNtYXJ0RmlsbEZpZWxkLCBzbWFydFNlbGVjdE9wdGlvbiB9IGZyb20gXCIuLi91dGlscy9maWxsLmpzXCI7XG5pbXBvcnQgeyBnZXRDYWNoZWRTZWxlY3Rvciwgc2V0Q2FjaGVkU2VsZWN0b3IsIHNhdmVTZWxlY3RvckNhY2hlIH0gZnJvbSBcIi4uL3V0aWxzL3NlbGVjdG9yLWNhY2hlLmpzXCI7XG5pbXBvcnQgeyBnZXRGaWVsZExhYmVsLCBub3JtYWxpemVMYWJlbCwgbm9ybWFsaXplQWxpYXMsIHNjb3JlRmllbGRNYXRjaCwgbWF0Y2hTbWFydEZpZWxkLCBjbGVhck1hdGNoaW5nQ2FjaGUsIHByZUNhY2hlTGFiZWxNYXAsIGxvYWRMZWFybmVkV2VpZ2h0cyB9IGZyb20gXCIuLi91dGlscy9maWVsZC1tYXRjaGluZy5qc1wiO1xuaW1wb3J0IHsgZm9ybWF0T3B0aWNhbFZhbHVlLCBub3JtYWxpemVEYXRlVmFsdWUsIGZpZWxkSGFzVmFsdWUsIFZBTFVFX05PUk1BTElaRVJTLCBPUFRJQ0FMX0ZJRUxEX0tFWVMgfSBmcm9tIFwiLi4vdXRpbHMvZm9ybWF0LmpzXCI7XG5pbXBvcnQgeyBTTUFSVF9GSUxMX0FMSUFTRVMsIFNNQVJUX0ZJTExfQkxBQ0tMSVNULCBkZXRlY3RQYWdlQ29udGV4dCB9IGZyb20gXCIuLi91dGlscy9kYXRhLmpzXCI7XG5pbXBvcnQgeyBtYXJrRmlsbGVkQnlPcHRpQm90IH0gZnJvbSBcIi4vbGVhcm5pbmcuanNcIjtcblxuLyogRm9uY3Rpb25zIGRlZmluaWVzIGRhbnMgY29udGVudC9pbmRleC5qcyBldCBleHBvc2VlcyB2aWEgZ2xvYmFsVGhpcyAqL1xudmFyIHNob3dSUEFUb2FzdCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gZ2xvYmFsVGhpcy5zaG93UlBBVG9hc3QgPyBnbG9iYWxUaGlzLnNob3dSUEFUb2FzdC5hcHBseShudWxsLCBhcmd1bWVudHMpIDogdW5kZWZpbmVkOyB9O1xudmFyIGNoZWNrRHJvaXRzTXV0dWVsbGUgPSBmdW5jdGlvbihkKSB7IHJldHVybiBnbG9iYWxUaGlzLmNoZWNrRHJvaXRzTXV0dWVsbGUgPyBnbG9iYWxUaGlzLmNoZWNrRHJvaXRzTXV0dWVsbGUoZCkgOiB1bmRlZmluZWQ7IH07XG5cbnZhciBfcGVyZm9ybWluZ1NtYXJ0RmlsbCA9IGZhbHNlO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcGVyZm9ybVNtYXJ0RmlsbCgpIHtcbiAgaWYgKF9wZXJmb3JtaW5nU21hcnRGaWxsKSByZXR1cm47XG4gIF9wZXJmb3JtaW5nU21hcnRGaWxsID0gdHJ1ZTtcbiAgdHJ5IHtcbiAgdmFyIGZpbGxEYXRhID0gYXdhaXQgZ2V0U21hcnRGaWxsRGF0YSgpO1xuICBpZiAoIWZpbGxEYXRhLm5vbSAmJiAhZmlsbERhdGEubnVtZXJvU2VjdXJpdGVTb2NpYWxlICYmICFmaWxsRGF0YS5udW1lcm9BZGhlcmVudCkge1xuICAgIHNob3dSUEFUb2FzdChcIkF1Y3VuZSBkb25uXFx1MDBFOWUgcGF0aWVudCBlbiBtXFx1MDBFOW1vaXJlLiBTY2FubmV6IGQnYWJvcmQgdW5lIG9yZG9ubmFuY2UuXCIsIFwiZXJyb3JcIik7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLyogQW1cdTAwRTlsaW9yYXRpb24gNiA6IG5lIHBhcyByZW1wbGlyIGxlcyBwYWdlcyBkZSBsb2dpbiAqL1xuICBpZiAoZGV0ZWN0UGFnZUNvbnRleHQoKSA9PT0gXCJsb2dpblwiKSByZXR1cm47XG5cbiAgLyogVlx1MDBFOXJpZmljYXRpb24gZHJvaXRzIG11dHVlbGxlICovXG4gIGNoZWNrRHJvaXRzTXV0dWVsbGUoZmlsbERhdGEpO1xuXG4gIHZhciBJTlBVVF9TRUxFQ1RPUiA9IFwiaW5wdXQ6bm90KFt0eXBlPWhpZGRlbl0pOm5vdChbdHlwZT1zdWJtaXRdKTpub3QoW3R5cGU9YnV0dG9uXSk6bm90KFt0eXBlPWNoZWNrYm94XSk6bm90KFt0eXBlPXJhZGlvXSk6bm90KFt0eXBlPWZpbGVdKTpub3QoW3JlYWRvbmx5XSksIHNlbGVjdDpub3QoW2Rpc2FibGVkXSksIHRleHRhcmVhOm5vdChbcmVhZG9ubHldKVwiO1xuXG4gIC8qIENvbGxlY3RlciBsZXMgaW5wdXRzIGR1IGRvY3VtZW50IHByaW5jaXBhbCArIGlmcmFtZXMgKyBzaGFkb3cgRE9NICovXG4gIHZhciBpbnB1dExpc3QgPSBxdWVyeVNlbGVjdG9yQWxsRGVlcChJTlBVVF9TRUxFQ1RPUik7XG4gIHZhciBmaWxsZWQgPSAwO1xuICB2YXIgcHJvYmFibGUgPSAwO1xuICB2YXIgZmlsbFJlcG9ydCA9IHsgdHM6IERhdGUubm93KCksIGhvc3RuYW1lOiB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUsIGZpbGxlZDogW10sIHdhcm5lZDogW10sIHNraXBwZWQ6IFtdLCBmYWlsZWQ6IFtdIH07XG5cbiAgdmFyIGN1cnJlbnRIb3N0bmFtZSA9IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZTtcblxuICAvKiBcdTI1MDBcdTI1MDAgUHJlLWNhY2hlIGxhYmVscyAmIGNsZWFyIExldmVuc2h0ZWluIG1lbW8gZm9yIHRoaXMgcnVuIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuICBpZiAodHlwZW9mIGNsZWFyTWF0Y2hpbmdDYWNoZSA9PT0gXCJmdW5jdGlvblwiKSBjbGVhck1hdGNoaW5nQ2FjaGUoKTtcbiAgaWYgKHR5cGVvZiBwcmVDYWNoZUxhYmVsTWFwID09PSBcImZ1bmN0aW9uXCIpIHByZUNhY2hlTGFiZWxNYXAoKTtcbiAgLyogVjMtMzogbG9hZCBsZWFybmVkIHdlaWdodHMgZm9yIHNjb3JlIHJlY2FsaWJyYXRpb24gKi9cbiAgaWYgKHR5cGVvZiBsb2FkTGVhcm5lZFdlaWdodHMgPT09IFwiZnVuY3Rpb25cIikgbG9hZExlYXJuZWRXZWlnaHRzKCk7XG5cbiAgLyogVjMtNTogcmVhZCBwcmV2aWV3LWJlZm9yZS1maWxsIHNldHRpbmcgKi9cbiAgdmFyIHNldHRpbmdzID0gYXdhaXQgbmV3IFByb21pc2UoZnVuY3Rpb24ocikgeyBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoW1wib3B0aWJvdF9zZXR0aW5nc1wiXSwgZnVuY3Rpb24ocmVzKSB7IHIocmVzLm9wdGlib3Rfc2V0dGluZ3MgfHwge30pOyB9KTsgfSk7XG4gIHZhciBwcmV2aWV3RW5hYmxlZCA9IHNldHRpbmdzLnByZXZpZXdCZWZvcmVGaWxsIHx8IGZhbHNlO1xuXG4gIC8qIFx1MjUwMFx1MjUwMCBTY2FubmluZyBpbmRpY2F0b3IgZm9yIGxhcmdlIHBhZ2VzIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuICBpZiAoaW5wdXRMaXN0Lmxlbmd0aCA+IDEwMCkge1xuICAgIHZhciBzY2FuVG9hc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHNjYW5Ub2FzdC5pZCA9IFwib3B0aWJvdC1zY2FuLXByb2dyZXNzXCI7XG4gICAgc2NhblRvYXN0LnRleHRDb250ZW50ID0gXCJTY2FuIGVuIGNvdXJzXFx1MjAyNiAoXCIgKyBpbnB1dExpc3QubGVuZ3RoICsgXCIgY2hhbXBzKVwiO1xuICAgIHNjYW5Ub2FzdC5zdHlsZS5jc3NUZXh0ID0gXCJwb3NpdGlvbjpmaXhlZDtib3R0b206MjRweDtsZWZ0OjUwJTt0cmFuc2Zvcm06dHJhbnNsYXRlWCgtNTAlKTt6LWluZGV4OjIxNDc0ODM2NDc7YmFja2dyb3VuZDojMWUyOTNiO2NvbG9yOndoaXRlO3BhZGRpbmc6OHB4IDE2cHg7Ym9yZGVyLXJhZGl1czo4cHg7Zm9udDo1MDAgMTJweC8xLjQgLWFwcGxlLXN5c3RlbSxCbGlua01hY1N5c3RlbUZvbnQsc2Fucy1zZXJpZjtib3gtc2hhZG93OjAgNHB4IDEycHggcmdiYSgwLDAsMCwuMTUpO29wYWNpdHk6MDt0cmFuc2l0aW9uOm9wYWNpdHkgLjNzO1wiO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2NhblRvYXN0KTtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7IHNjYW5Ub2FzdC5zdHlsZS5vcGFjaXR5ID0gXCIxXCI7IH0pO1xuICB9XG5cbiAgLyogXHUyNTAwXHUyNTAwIENodW5rZWQgYXN5bmMgcHJvY2Vzc2luZyB0byBhdm9pZCBibG9ja2luZyBtYWluIHRocmVhZCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cbiAgdmFyIENIVU5LX1NJWkUgPSA0MDtcbiAgdmFyIHNjYW5TdGFydCA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAvKiBWMy01OiBidWlsZCBhIGZpbGwgcGxhbiBmb3IgcHJldmlldyBtb2RlICovXG4gIHZhciBmaWxsUGxhbiA9IFtdO1xuXG4gIGZvciAodmFyIGNodW5rU3RhcnQgPSAwOyBjaHVua1N0YXJ0IDwgaW5wdXRMaXN0Lmxlbmd0aDsgY2h1bmtTdGFydCArPSBDSFVOS19TSVpFKSB7XG4gICAgdmFyIGNodW5rRW5kID0gTWF0aC5taW4oY2h1bmtTdGFydCArIENIVU5LX1NJWkUsIGlucHV0TGlzdC5sZW5ndGgpO1xuXG4gICAgZm9yICh2YXIgaWR4ID0gY2h1bmtTdGFydDsgaWR4IDwgY2h1bmtFbmQ7IGlkeCsrKSB7XG4gICAgICB2YXIgZWwgPSBpbnB1dExpc3RbaWR4XTtcblxuICAgIC8qIFx1MjUwMFx1MjUwMCBDYWNoZSBjaGVjayA6IHNpIHVuIHNcdTAwRTlsZWN0ZXVyIGVzdCBlbiBjYWNoZSBwb3VyIGNlIHBvcnRhaWwsIGwndXRpbGlzZXIgXHUyNTAwXHUyNTAwICovXG4gICAgdmFyIGVsU2VsZWN0b3IgPSBlbC5pZCA/IChcIiNcIiArIENTUy5lc2NhcGUoZWwuaWQpKSA6IChlbC5uYW1lID8gKCdbbmFtZT1cIicgKyBlbC5uYW1lICsgJ1wiXScpIDogbnVsbCk7XG4gICAgdmFyIGNhY2hlZEZpZWxkID0gbnVsbDtcbiAgICBpZiAoZWxTZWxlY3Rvcikge1xuICAgICAgZm9yICh2YXIgY2ZLZXkgaW4gU01BUlRfRklMTF9BTElBU0VTKSB7XG4gICAgICAgIHZhciBjYWNoZWQgPSBnZXRDYWNoZWRTZWxlY3RvcihjdXJyZW50SG9zdG5hbWUsIGNmS2V5KTtcbiAgICAgICAgaWYgKGNhY2hlZCAmJiBjYWNoZWQgPT09IGVsU2VsZWN0b3IpIHsgY2FjaGVkRmllbGQgPSBjZktleTsgYnJlYWs7IH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKiBcdTI1MDBcdTI1MDAgU2NvcmUtYmFzZWQgbWF0Y2hpbmcgKEFtXHUwMEU5bGlvcmF0aW9uIDIrNCkgXHUyNTAwXHUyNTAwICovXG4gICAgdmFyIGJlc3RGaWVsZCA9IGNhY2hlZEZpZWxkO1xuICAgIHZhciBiZXN0U2NvcmUgPSBjYWNoZWRGaWVsZCA/IDk1IDogMDtcbiAgICBpZiAoIWNhY2hlZEZpZWxkKSB7XG4gICAgICBmb3IgKHZhciBmaWVsZCBpbiBTTUFSVF9GSUxMX0FMSUFTRVMpIHtcbiAgICAgICAgdmFyIHNjb3JlID0gc2NvcmVGaWVsZE1hdGNoKGVsLCBmaWVsZCwgU01BUlRfRklMTF9BTElBU0VTW2ZpZWxkXSk7XG4gICAgICAgIGlmIChzY29yZSA+IGJlc3RTY29yZSkgeyBiZXN0U2NvcmUgPSBzY29yZTsgYmVzdEZpZWxkID0gZmllbGQ7IH1cbiAgICAgIH1cblxuICAgICAgLyogQWxzbyB0cnkgbGVnYWN5IG1hdGNoU21hcnRGaWVsZCBmb3IgYmFja3dhcmQgY29tcGF0ICovXG4gICAgICBpZiAoYmVzdFNjb3JlIDwgNTApIHtcbiAgICAgICAgdmFyIGxlZ2FjeU1hdGNoID0gbWF0Y2hTbWFydEZpZWxkKGVsKTtcbiAgICAgICAgaWYgKGxlZ2FjeU1hdGNoKSB7XG4gICAgICAgICAgYmVzdEZpZWxkID0gbGVnYWN5TWF0Y2guZmllbGQ7XG4gICAgICAgICAgYmVzdFNjb3JlID0gbGVnYWN5TWF0Y2guY29uZmlkZW5jZSA9PT0gXCJjZXJ0YWluXCIgPyA4NSA6IDYwO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFiZXN0RmllbGQpIGNvbnRpbnVlO1xuXG4gICAgLyogU3RvcmUgbWF0Y2hlZCBzZWxlY3RvciBpbiBjYWNoZSBmb3IgdGhpcyBwb3J0YWwgKi9cbiAgICBpZiAoZWxTZWxlY3RvciAmJiBiZXN0U2NvcmUgPj0gNTApIHtcbiAgICAgIHNldENhY2hlZFNlbGVjdG9yKGN1cnJlbnRIb3N0bmFtZSwgYmVzdEZpZWxkLCBlbFNlbGVjdG9yKTtcbiAgICB9XG4gICAgdmFyIHZhbHVlID0gZmlsbERhdGFbYmVzdEZpZWxkXTtcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICBmaWxsUmVwb3J0LmZhaWxlZC5wdXNoKHsgbGFiZWw6IG5vcm1hbGl6ZUxhYmVsKGdldEZpZWxkTGFiZWwoZWwpKSwgdmFyaWFibGU6IGJlc3RGaWVsZCwgY29uZmlkZW5jZTogYmVzdFNjb3JlLCBzaWduYWxzOiB7IGNhY2hlZDogISFjYWNoZWRGaWVsZCwgaWRNYXRjaDogZWwuaWQgJiYgbm9ybWFsaXplQWxpYXMoZWwuaWQpLmluZGV4T2Yobm9ybWFsaXplQWxpYXMoYmVzdEZpZWxkKSkgIT09IC0xLCBuYW1lTWF0Y2g6IGVsLm5hbWUgJiYgbm9ybWFsaXplQWxpYXMoZWwubmFtZSkuaW5kZXhPZihub3JtYWxpemVBbGlhcyhiZXN0RmllbGQpKSAhPT0gLTEsIGxhYmVsTWF0Y2g6ICEhZ2V0RmllbGRMYWJlbChlbCkgfSB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8qIFNldWlsIDwgNTAgXHUyMTkyIG5lIHBhcyByZW1wbGlyICovXG4gICAgaWYgKGJlc3RTY29yZSA8IDUwKSB7XG4gICAgICBmaWxsUmVwb3J0LnNraXBwZWQucHVzaCh7IGxhYmVsOiBub3JtYWxpemVMYWJlbChnZXRGaWVsZExhYmVsKGVsKSksIHZhcmlhYmxlOiBiZXN0RmllbGQsIGNvbmZpZGVuY2U6IGJlc3RTY29yZSwgcmVhc29uOiBcInNjb3JlX3Ryb3BfZmFpYmxlXCIgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvKiBCbGFja2xpc3QgY2hlY2sgKi9cbiAgICB2YXIgZmNuUmF3ID0gZWwuZ2V0QXR0cmlidXRlKFwiZm9ybWNvbnRyb2xuYW1lXCIpIHx8IGVsLmdldEF0dHJpYnV0ZShcIm5nLXJlZmxlY3QtbmFtZVwiKSB8fCBlbC5uYW1lIHx8IFwiXCI7XG4gICAgaWYgKGZjblJhdyAmJiBTTUFSVF9GSUxMX0JMQUNLTElTVC5pbmRleE9mKGZjblJhdy50b0xvd2VyQ2FzZSgpKSAhPT0gLTEpIGNvbnRpbnVlO1xuXG4gICAgLyogTmUgcGFzIFx1MDBFOWNyYXNlciB1biBjaGFtcCBkXHUwMEU5alx1MDBFMCByZW1wbGkgbWFudWVsbGVtZW50IHBhciBsJ29wdGljaWVuICovXG4gICAgdmFyIGV4aXN0aW5nVmFsID0gKGVsLnZhbHVlIHx8IFwiXCIpLnRyaW0oKTtcbiAgICBpZiAoZXhpc3RpbmdWYWwgJiYgIWVsLmdldEF0dHJpYnV0ZShcImRhdGEtb3B0aWJvdC1maWxsZWRcIikpIHtcbiAgICAgIGZpbGxSZXBvcnQuc2tpcHBlZC5wdXNoKHsgbGFiZWw6IG5vcm1hbGl6ZUxhYmVsKGdldEZpZWxkTGFiZWwoZWwpKSwgdmFyaWFibGU6IGJlc3RGaWVsZCwgY29uZmlkZW5jZTogYmVzdFNjb3JlLCByZWFzb246IFwiZGVqYV9yZW1wbGlcIiB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8qIEFtXHUwMEU5bGlvcmF0aW9uIDggOiBhcHBsaXF1ZXIgVkFMVUVfTk9STUFMSVpFUlMgYXZhbnQgZmlsbCAqL1xuICAgIGlmIChWQUxVRV9OT1JNQUxJWkVSU1tiZXN0RmllbGRdKSB7XG4gICAgICB2YWx1ZSA9IFZBTFVFX05PUk1BTElaRVJTW2Jlc3RGaWVsZF0odmFsdWUsIGVsKTtcbiAgICB9XG5cbiAgICAvKiBGb3JtYXQgY29ycmVjdGlvbnMgb3B0aXF1ZXMgKHNwaGVyZS9jeWxpbmRyZS9heGUvYWRkaXRpb24pICovXG4gICAgaWYgKE9QVElDQUxfRklFTERfS0VZUy5pbmRleE9mKGJlc3RGaWVsZCkgIT09IC0xKSB7XG4gICAgICB2YWx1ZSA9IGZvcm1hdE9wdGljYWxWYWx1ZSh2YWx1ZSwgZWwpO1xuICAgIH1cblxuICAgIC8qIFYzLTU6IGNvbGxlY3QgZmlsbCBwbGFuIGl0ZW0gKi9cbiAgICBmaWxsUGxhbi5wdXNoKHsgZWw6IGVsLCBmaWVsZDogYmVzdEZpZWxkLCB2YWx1ZTogdmFsdWUsIHNjb3JlOiBiZXN0U2NvcmUsIGNhY2hlZEZpZWxkOiBjYWNoZWRGaWVsZCwgbGFiZWw6IG5vcm1hbGl6ZUxhYmVsKGdldEZpZWxkTGFiZWwoZWwpKSB9KTtcblxuICAgIH0gLyogZW5kIGlubmVyIGZvciAoaWR4KSAqL1xuXG4gICAgLyogWWllbGQgdG8gbWFpbiB0aHJlYWQgYmV0d2VlbiBjaHVua3MgaWYgdGhlcmUgYXJlIG1vcmUgKi9cbiAgICBpZiAoY2h1bmtFbmQgPCBpbnB1dExpc3QubGVuZ3RoKSB7XG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShmdW5jdGlvbihyKSB7IHNldFRpbWVvdXQociwgMCk7IH0pO1xuICAgIH1cbiAgfSAvKiBlbmQgb3V0ZXIgZm9yIChjaHVua1N0YXJ0KSAqL1xuXG4gIHZhciBzY2FuRHVyYXRpb24gPSBNYXRoLnJvdW5kKHBlcmZvcm1hbmNlLm5vdygpIC0gc2NhblN0YXJ0KTtcbiAgLyogVjMtMTogYXR0YWNoIHNjYW4gbWV0YWRhdGEgdG8gZmlsbCByZXBvcnQgKi9cbiAgZmlsbFJlcG9ydC5zY2FuRHVyYXRpb24gPSBzY2FuRHVyYXRpb247XG4gIGZpbGxSZXBvcnQudG90YWxGaWVsZHMgPSBpbnB1dExpc3QubGVuZ3RoO1xuICAvKiBSZW1vdmUgc2Nhbm5pbmcgaW5kaWNhdG9yLCBzaG93IHJlc3VsdCBpZiBsb25nICovXG4gIHZhciBleGlzdGluZ1RvYXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJvcHRpYm90LXNjYW4tcHJvZ3Jlc3NcIik7XG4gIGlmIChleGlzdGluZ1RvYXN0KSBleGlzdGluZ1RvYXN0LnJlbW92ZSgpO1xuICBpZiAoc2NhbkR1cmF0aW9uID4gNTAwKSB7XG4gICAgY29uc29sZS5pbmZvKFwiW09wdGlCb3RdIFNtYXJ0IEZpbGwgc2NhbjogXCIgKyBpbnB1dExpc3QubGVuZ3RoICsgXCIgZmllbGRzIGluIFwiICsgc2NhbkR1cmF0aW9uICsgXCJtc1wiKTtcbiAgfVxuICBpZiAoc2NhbkR1cmF0aW9uID4gMTAwMCkge1xuICAgIHZhciByZXN1bHRUb2FzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgcmVzdWx0VG9hc3QuaWQgPSBcIm9wdGlib3Qtc2Nhbi1wcm9ncmVzc1wiO1xuICAgIHJlc3VsdFRvYXN0LnRleHRDb250ZW50ID0gXCJTY2FuIHRlcm1pblxcdTAwRTkgXHUyMDE0IFwiICsgaW5wdXRMaXN0Lmxlbmd0aCArIFwiIGNoYW1wcyBlbiBcIiArIChzY2FuRHVyYXRpb24gLyAxMDAwKS50b0ZpeGVkKDEpICsgXCJzXCI7XG4gICAgcmVzdWx0VG9hc3Quc3R5bGUuY3NzVGV4dCA9IFwicG9zaXRpb246Zml4ZWQ7Ym90dG9tOjI0cHg7bGVmdDo1MCU7dHJhbnNmb3JtOnRyYW5zbGF0ZVgoLTUwJSk7ei1pbmRleDoyMTQ3NDgzNjQ3O2JhY2tncm91bmQ6IzFlMjkzYjtjb2xvcjp3aGl0ZTtwYWRkaW5nOjhweCAxNnB4O2JvcmRlci1yYWRpdXM6OHB4O2ZvbnQ6NTAwIDEycHgvMS40IC1hcHBsZS1zeXN0ZW0sQmxpbmtNYWNTeXN0ZW1Gb250LHNhbnMtc2VyaWY7Ym94LXNoYWRvdzowIDRweCAxMnB4IHJnYmEoMCwwLDAsLjE1KTtvcGFjaXR5OjA7dHJhbnNpdGlvbjpvcGFjaXR5IC4zcztcIjtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHJlc3VsdFRvYXN0KTtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7IHJlc3VsdFRvYXN0LnN0eWxlLm9wYWNpdHkgPSBcIjFcIjsgfSk7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHsgcmVzdWx0VG9hc3Quc3R5bGUub3BhY2l0eSA9IFwiMFwiOyBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyByZXN1bHRUb2FzdC5yZW1vdmUoKTsgfSwgMzAwKTsgfSwgMzAwMCk7XG4gIH1cblxuICAvKiBcdTI1MDBcdTI1MDAgVjMtNTogZmlsbCBleGVjdXRpb24gKGV4dHJhY3RlZCBmb3IgcHJldmlldyBzdXBwb3J0KSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cbiAgYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZUZpbGwoKSB7XG4gICAgZm9yICh2YXIgcGkgPSAwOyBwaSA8IGZpbGxQbGFuLmxlbmd0aDsgcGkrKykge1xuICAgICAgdmFyIGl0ZW0gPSBmaWxsUGxhbltwaV07XG4gICAgICB2YXIgZWwgPSBpdGVtLmVsO1xuICAgICAgdmFyIGJlc3RGaWVsZCA9IGl0ZW0uZmllbGQ7XG4gICAgICB2YXIgdmFsdWUgPSBpdGVtLnZhbHVlO1xuICAgICAgdmFyIGJlc3RTY29yZSA9IGl0ZW0uc2NvcmU7XG4gICAgICB2YXIgY2FjaGVkRmllbGQgPSBpdGVtLmNhY2hlZEZpZWxkO1xuXG4gICAgICAvKiBDYXMgc3BcdTAwRTljaWFsIDogaW50bC10ZWwtaW5wdXQgKHRcdTAwRTlsXHUwMEU5cGhvbmUgYXZlYyBpbmRpY2F0aWYgcGF5cykgKi9cbiAgICAgIGlmIChiZXN0RmllbGQgPT09IFwidGVsZXBob25lXCIpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB2YXIgaXRpSW5zdGFuY2UgPSB3aW5kb3cuaW50bFRlbElucHV0R2xvYmFscyAmJiB3aW5kb3cuaW50bFRlbElucHV0R2xvYmFscy5nZXRJbnN0YW5jZVxuICAgICAgICAgICAgPyB3aW5kb3cuaW50bFRlbElucHV0R2xvYmFscy5nZXRJbnN0YW5jZShlbClcbiAgICAgICAgICAgIDogKGVsLl9pdGlJbnN0YW5jZSB8fCBudWxsKTtcbiAgICAgICAgICBpZiAoaXRpSW5zdGFuY2UgJiYgaXRpSW5zdGFuY2Uuc2V0TnVtYmVyKSB7XG4gICAgICAgICAgICBpdGlJbnN0YW5jZS5zZXROdW1iZXIodmFsdWUpO1xuICAgICAgICAgICAgZmlsbGVkKys7XG4gICAgICAgICAgICBtYXJrRmlsbGVkQnlPcHRpQm90KGVsLCBiZXN0RmllbGQpO1xuICAgICAgICAgICAgaWYgKGJlc3RTY29yZSA8IDgwKSB7XG4gICAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZShcImRhdGEtb3B0aWJvdC1jb25maWRlbmNlXCIsIGJlc3RTY29yZSk7XG4gICAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZShcImRhdGEtb3B0aWJvdC13YXJuZWRcIiwgXCJ0cnVlXCIpO1xuICAgICAgICAgICAgICBlbC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIiNmZWY5YzNcIjtcbiAgICAgICAgICAgICAgZWwuc3R5bGUub3V0bGluZSA9IFwiMnB4IHNvbGlkICNlYWIzMDhcIjtcbiAgICAgICAgICAgICAgZWwudGl0bGUgPSBcIk9wdGlCb3QgXFx1MjAxNCBjb25maWFuY2UgXCIgKyBiZXN0U2NvcmUgKyBcIiUgKFwiICsgYmVzdEZpZWxkICsgXCIpIFxcdTIwMTQgdlxcdTAwRTlyaWZpZXpcIjtcbiAgICAgICAgICAgICAgcHJvYmFibGUrKztcbiAgICAgICAgICAgICAgZmlsbFJlcG9ydC53YXJuZWQucHVzaCh7IGxhYmVsOiBub3JtYWxpemVMYWJlbChnZXRGaWVsZExhYmVsKGVsKSksIHZhcmlhYmxlOiBiZXN0RmllbGQsIGNvbmZpZGVuY2U6IGJlc3RTY29yZSwgc2lnbmFsczogeyBjYWNoZWQ6ICEhY2FjaGVkRmllbGQsIGlkTWF0Y2g6IGVsLmlkICYmIG5vcm1hbGl6ZUFsaWFzKGVsLmlkKS5pbmRleE9mKG5vcm1hbGl6ZUFsaWFzKGJlc3RGaWVsZCkpICE9PSAtMSwgbmFtZU1hdGNoOiBlbC5uYW1lICYmIG5vcm1hbGl6ZUFsaWFzKGVsLm5hbWUpLmluZGV4T2Yobm9ybWFsaXplQWxpYXMoYmVzdEZpZWxkKSkgIT09IC0xLCBsYWJlbE1hdGNoOiAhIWdldEZpZWxkTGFiZWwoZWwpIH0gfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBmaWxsUmVwb3J0LmZpbGxlZC5wdXNoKHsgbGFiZWw6IG5vcm1hbGl6ZUxhYmVsKGdldEZpZWxkTGFiZWwoZWwpKSwgdmFyaWFibGU6IGJlc3RGaWVsZCwgY29uZmlkZW5jZTogYmVzdFNjb3JlLCBzaWduYWxzOiB7IGNhY2hlZDogISFjYWNoZWRGaWVsZCwgaWRNYXRjaDogZWwuaWQgJiYgbm9ybWFsaXplQWxpYXMoZWwuaWQpLmluZGV4T2Yobm9ybWFsaXplQWxpYXMoYmVzdEZpZWxkKSkgIT09IC0xLCBuYW1lTWF0Y2g6IGVsLm5hbWUgJiYgbm9ybWFsaXplQWxpYXMoZWwubmFtZSkuaW5kZXhPZihub3JtYWxpemVBbGlhcyhiZXN0RmllbGQpKSAhPT0gLTEsIGxhYmVsTWF0Y2g6ICEhZ2V0RmllbGRMYWJlbChlbCkgfSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaChlKSB7fVxuICAgICAgfVxuXG4gICAgICAvKiBOb3JtYWxpc2F0aW9uIGRlcyBkYXRlcyAqL1xuICAgICAgdmFyIGlzRGF0ZUZpZWxkID0gW1wiZGF0ZU5haXNzYW5jZVwiLCBcImRhdGVOYWlzc2FuY2VQYXRpZW50XCIsIFwiZGF0ZU9yZG9ubmFuY2VcIiwgXCJkYXRlVmFsaWRpdGVcIiwgXCJkYXRlRGVidXRWYWxpZGl0ZVwiLCBcImRhdGVGaW5WYWxpZGl0ZVwiLCBcImRhdGVOYWlzc2FuY2VBc3N1cmVcIl0uaW5kZXhPZihiZXN0RmllbGQpICE9PSAtMVxuICAgICAgICB8fCBlbC50eXBlID09PSBcImRhdGVcIjtcblxuICAgICAgLyogTXVsdGktc3RyYXRlZ3kgZmlsbCAqL1xuICAgICAgdmFyIG9rID0gYXdhaXQgc21hcnRGaWxsRmllbGQoZWwsIHZhbHVlLCBpc0RhdGVGaWVsZCk7XG4gICAgICBpZiAoIW9rKSB7XG4gICAgICAgIGZpbGxSZXBvcnQuZmFpbGVkLnB1c2goeyBsYWJlbDogbm9ybWFsaXplTGFiZWwoZ2V0RmllbGRMYWJlbChlbCkpLCB2YXJpYWJsZTogYmVzdEZpZWxkLCBjb25maWRlbmNlOiBiZXN0U2NvcmUsIHNpZ25hbHM6IHsgY2FjaGVkOiAhIWNhY2hlZEZpZWxkLCBpZE1hdGNoOiBlbC5pZCAmJiBub3JtYWxpemVBbGlhcyhlbC5pZCkuaW5kZXhPZihub3JtYWxpemVBbGlhcyhiZXN0RmllbGQpKSAhPT0gLTEsIG5hbWVNYXRjaDogZWwubmFtZSAmJiBub3JtYWxpemVBbGlhcyhlbC5uYW1lKS5pbmRleE9mKG5vcm1hbGl6ZUFsaWFzKGJlc3RGaWVsZCkpICE9PSAtMSwgbGFiZWxNYXRjaDogISFnZXRGaWVsZExhYmVsKGVsKSB9IH0pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgZmlsbGVkKys7XG4gICAgICBtYXJrRmlsbGVkQnlPcHRpQm90KGVsLCBiZXN0RmllbGQpO1xuXG4gICAgICBpZiAoYmVzdFNjb3JlID49IDUwICYmIGJlc3RTY29yZSA8IDgwKSB7XG4gICAgICAgIGVsLnNldEF0dHJpYnV0ZShcImRhdGEtb3B0aWJvdC1jb25maWRlbmNlXCIsIGJlc3RTY29yZSk7XG4gICAgICAgIGVsLnNldEF0dHJpYnV0ZShcImRhdGEtb3B0aWJvdC13YXJuZWRcIiwgXCJ0cnVlXCIpO1xuICAgICAgICBlbC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIiNmZWY5YzNcIjtcbiAgICAgICAgZWwuc3R5bGUub3V0bGluZSA9IFwiMnB4IHNvbGlkICNlYWIzMDhcIjtcbiAgICAgICAgZWwudGl0bGUgPSBcIk9wdGlCb3QgXFx1MjAxNCBjb25maWFuY2UgXCIgKyBiZXN0U2NvcmUgKyBcIiUgKFwiICsgYmVzdEZpZWxkICsgXCIpIFxcdTIwMTQgdlxcdTAwRTlyaWZpZXpcIjtcbiAgICAgICAgcHJvYmFibGUrKztcbiAgICAgICAgZmlsbFJlcG9ydC53YXJuZWQucHVzaCh7IGxhYmVsOiBub3JtYWxpemVMYWJlbChnZXRGaWVsZExhYmVsKGVsKSksIHZhcmlhYmxlOiBiZXN0RmllbGQsIGNvbmZpZGVuY2U6IGJlc3RTY29yZSwgc2lnbmFsczogeyBjYWNoZWQ6ICEhY2FjaGVkRmllbGQsIGlkTWF0Y2g6IGVsLmlkICYmIG5vcm1hbGl6ZUFsaWFzKGVsLmlkKS5pbmRleE9mKG5vcm1hbGl6ZUFsaWFzKGJlc3RGaWVsZCkpICE9PSAtMSwgbmFtZU1hdGNoOiBlbC5uYW1lICYmIG5vcm1hbGl6ZUFsaWFzKGVsLm5hbWUpLmluZGV4T2Yobm9ybWFsaXplQWxpYXMoYmVzdEZpZWxkKSkgIT09IC0xLCBsYWJlbE1hdGNoOiAhIWdldEZpZWxkTGFiZWwoZWwpIH0gfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmaWxsUmVwb3J0LmZpbGxlZC5wdXNoKHsgbGFiZWw6IG5vcm1hbGl6ZUxhYmVsKGdldEZpZWxkTGFiZWwoZWwpKSwgdmFyaWFibGU6IGJlc3RGaWVsZCwgY29uZmlkZW5jZTogYmVzdFNjb3JlLCBzaWduYWxzOiB7IGNhY2hlZDogISFjYWNoZWRGaWVsZCwgaWRNYXRjaDogZWwuaWQgJiYgbm9ybWFsaXplQWxpYXMoZWwuaWQpLmluZGV4T2Yobm9ybWFsaXplQWxpYXMoYmVzdEZpZWxkKSkgIT09IC0xLCBuYW1lTWF0Y2g6IGVsLm5hbWUgJiYgbm9ybWFsaXplQWxpYXMoZWwubmFtZSkuaW5kZXhPZihub3JtYWxpemVBbGlhcyhiZXN0RmllbGQpKSAhPT0gLTEsIGxhYmVsTWF0Y2g6ICEhZ2V0RmllbGRMYWJlbChlbCkgfSB9KTtcbiAgICAgIH1cbiAgICB9IC8qIGVuZCBmaWxsUGxhbiBsb29wICovXG5cbiAgICAvKiBcdTI1MDBcdTI1MDAgUmFkaW8gYnV0dG9ucyA6IHNcdTAwRTlsZWN0aW9ubmVyIHNlbG9uIGxlIHR5cGUgZGUgcHJlc2NyaXB0aW9uIFx1MjUwMFx1MjUwMCAqL1xuICAgIHZhciB0eXBlUHJlc2NyaXB0aW9uID0gZmlsbERhdGFbXCJ0eXBlUHJlc2NyaXB0aW9uXCJdIHx8IFwiXCI7XG4gICAgaWYgKHR5cGVQcmVzY3JpcHRpb24pIHtcbiAgICAgIHZhciBpc0xlbnRpbGxlcyA9IHR5cGVQcmVzY3JpcHRpb24udG9Mb3dlckNhc2UoKS5pbmRleE9mKFwibGVudGlsbGVcIikgIT09IC0xO1xuICAgICAgdmFyIGFsbFJhZGlvcyA9IHF1ZXJ5U2VsZWN0b3JBbGxEZWVwKCdpbnB1dFt0eXBlPVwicmFkaW9cIl06bm90KFtkaXNhYmxlZF0pJyk7XG4gICAgICBhbGxSYWRpb3MuZm9yRWFjaChmdW5jdGlvbihyYWRpbykge1xuICAgICAgICB2YXIgbGFiZWwgPSBcIlwiO1xuICAgICAgICB2YXIgbGFiZWxFbCA9IHJhZGlvLmlkID8gKHJhZGlvLmdldFJvb3ROb2RlID8gcmFkaW8uZ2V0Um9vdE5vZGUoKSA6IGRvY3VtZW50KS5xdWVyeVNlbGVjdG9yKCdsYWJlbFtmb3I9XCInICsgcmFkaW8uaWQgKyAnXCJdJykgOiBudWxsO1xuICAgICAgICBpZiAoIWxhYmVsRWwgJiYgcmFkaW8uY2xvc2VzdCkgbGFiZWxFbCA9IHJhZGlvLmNsb3Nlc3QoXCJsYWJlbFwiKTtcbiAgICAgICAgaWYgKGxhYmVsRWwpIGxhYmVsID0gbGFiZWxFbC50ZXh0Q29udGVudC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBlbHNlIGxhYmVsID0gKHJhZGlvLnZhbHVlIHx8IHJhZGlvLmdldEF0dHJpYnV0ZShcImFyaWEtbGFiZWxcIikgfHwgXCJcIikudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICB2YXIgaXNMZW50aWxsZVJhZGlvID0gbGFiZWwuaW5kZXhPZihcImxlbnRpbGxlXCIpICE9PSAtMTtcbiAgICAgICAgdmFyIGlzTHVuZXR0ZVJhZGlvICA9IGxhYmVsLmluZGV4T2YoXCJsdW5ldHRlXCIpICE9PSAtMSB8fCBsYWJlbC5pbmRleE9mKFwidmVycmVcIikgIT09IC0xO1xuXG4gICAgICAgIGlmICgoaXNMZW50aWxsZXMgJiYgaXNMZW50aWxsZVJhZGlvKSB8fCAoIWlzTGVudGlsbGVzICYmIGlzTHVuZXR0ZVJhZGlvKSkge1xuICAgICAgICAgIGlmICghcmFkaW8uY2hlY2tlZCkge1xuICAgICAgICAgICAgcmFkaW8uY2xpY2soKTtcbiAgICAgICAgICAgIHJhZGlvLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiY2hhbmdlXCIsIHsgYnViYmxlczogdHJ1ZSB9KSk7XG4gICAgICAgICAgICBmaWxsZWQrKztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qIFx1MjUwMFx1MjUwMCBBbVx1MDBFOWxpb3JhdGlvbiA5IDogc2F1dmVnYXJkZXIgbGUgcmFwcG9ydCBkZSByZW1wbGlzc2FnZSBcdTI1MDBcdTI1MDAgKi9cbiAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoeyBvcHRpYm90X2xhc3RfZmlsbF9yZXBvcnQ6IGZpbGxSZXBvcnQgfSk7XG5cbiAgICAvKiBcdTI1MDBcdTI1MDAgTG9nIGluamVjdGlvbiB2ZXJzIGxlIGJhY2tlbmQgKHN0YXRzIGFkbWluL2V4dGVuc2lvbikgXHUyNTAwXHUyNTAwICovXG4gICAgaWYgKGZpbGxlZCA+IDApIHtcbiAgICAgIGdldFN5bmNUb2tlbigpLnRoZW4oZnVuY3Rpb24oc3luY1Rva2VuKSB7XG4gICAgICAgIGlmICghc3luY1Rva2VuKSByZXR1cm47XG4gICAgICAgIGZldGNoKFwiaHR0cHM6Ly9vcHRpYm90LmZyL2FwaS9leHRlbnNpb24vbG9nLWluamVjdGlvblwiLCB7XG4gICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLCBcIkF1dGhvcml6YXRpb25cIjogXCJCZWFyZXIgXCIgKyBzeW5jVG9rZW4gfSxcbiAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICBzeW5jVG9rZW46IHN5bmNUb2tlbixcbiAgICAgICAgICAgIHNpdGU6IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICBmaWVsZHNDb3VudDogZmlsbGVkLFxuICAgICAgICAgICAgbW9kZTogXCJzbWFydGZpbGxcIixcbiAgICAgICAgICAgIHRzOiBEYXRlLm5vdygpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7IGNvbnNvbGUud2FybihcIltPcHRpQm90XSBsb2ctaW5qZWN0aW9uIGZhaWxlZDpcIiwgZXJyKTsgfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKiBWMy0yOiBUcmFjayBmaWxsIHJlc3VsdHMgZm9yIGF1dG8tcmVwYWlyICovXG4gICAgaWYgKHR5cGVvZiB0cmFja0ZpbGxSZXN1bHQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgdmFyIGN1cnJlbnRIb3N0ID0gd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lO1xuICAgICAgZm9yICh2YXIgZmkgPSAwOyBmaSA8IGZpbGxSZXBvcnQuZmlsbGVkLmxlbmd0aDsgZmkrKykgdHJhY2tGaWxsUmVzdWx0KGN1cnJlbnRIb3N0LCBmaWxsUmVwb3J0LmZpbGxlZFtmaV0udmFyaWFibGUsIHRydWUpO1xuICAgICAgZm9yICh2YXIgc2kgPSAwOyBzaSA8IGZpbGxSZXBvcnQuc2tpcHBlZC5sZW5ndGg7IHNpKyspIHRyYWNrRmlsbFJlc3VsdChjdXJyZW50SG9zdCwgZmlsbFJlcG9ydC5za2lwcGVkW3NpXS52YXJpYWJsZSB8fCBcInVua25vd25cIiwgZmFsc2UpO1xuICAgICAgZm9yICh2YXIgZmFpID0gMDsgZmFpIDwgZmlsbFJlcG9ydC5mYWlsZWQubGVuZ3RoOyBmYWkrKykgdHJhY2tGaWxsUmVzdWx0KGN1cnJlbnRIb3N0LCBmaWxsUmVwb3J0LmZhaWxlZFtmYWldLnZhcmlhYmxlLCBmYWxzZSk7XG4gICAgICBjaGVja0FuZFJlcGFpclNlbGVjdG9ycyhjdXJyZW50SG9zdCk7XG4gICAgfVxuXG4gICAgLyogVjMtOTogUHJlZGljdGl2ZSByZWplY3Rpb24gc2NvcmluZyAqL1xuICAgIGlmICh0eXBlb2YgcHJlZGljdFJlamVjdGlvblJpc2sgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgdmFyIHByZWRpY3Rpb24gPSBwcmVkaWN0UmVqZWN0aW9uUmlzayhmaWxsUmVwb3J0LCB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUpO1xuICAgICAgaWYgKHByZWRpY3Rpb24pIHtcbiAgICAgICAgZmlsbFJlcG9ydC5yZWplY3Rpb25SaXNrID0gcHJlZGljdGlvbjtcbiAgICAgICAgc2hvd1JlamVjdGlvblJpc2tCYW5uZXIocHJlZGljdGlvbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGZpbGxlZCA9PT0gMCkge1xuICAgICAgc2hvd1JQQVRvYXN0KFwiQXVjdW4gY2hhbXAgcmVjb25udSBzdXIgY2V0dGUgcGFnZS5cIiwgXCJlcnJvclwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIG1zZyA9IGZpbGxlZCArIFwiIGNoYW1wXCIgKyAoZmlsbGVkID4gMSA/IFwic1wiIDogXCJcIikgKyBcIiByZW1wbGlcIiArIChmaWxsZWQgPiAxID8gXCJzXCIgOiBcIlwiKTtcbiAgICAgIGlmIChwcm9iYWJsZSA+IDApIG1zZyArPSBcIiBcXHUwMEI3IFwiICsgcHJvYmFibGUgKyBcIiBcXHUwMEUwIHZcXHUwMEU5cmlmaWVyIChqYXVuZSlcIjtcbiAgICAgIHNob3dSUEFUb2FzdChcIlxcdTI3MDUgXCIgKyBtc2csIFwic3VjY2Vzc1wiKTtcbiAgICB9XG4gICAgX3BlcmZvcm1pbmdTbWFydEZpbGwgPSBmYWxzZTtcbiAgfVxuXG4gIC8qIFYzLTU6IHNob3cgcHJldmlldyBvciBmaWxsIGltbWVkaWF0ZWx5ICovXG4gIGlmIChwcmV2aWV3RW5hYmxlZCAmJiBmaWxsUGxhbi5sZW5ndGggPiA1KSB7XG4gICAgc2hvd0ZpbGxQcmV2aWV3KGZpbGxQbGFuLCBleGVjdXRlRmlsbCwgZnVuY3Rpb24oKSB7XG4gICAgICBfcGVyZm9ybWluZ1NtYXJ0RmlsbCA9IGZhbHNlO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIGF3YWl0IGV4ZWN1dGVGaWxsKCk7XG4gIH1cbiAgfSBmaW5hbGx5IHtcbiAgICBfcGVyZm9ybWluZ1NtYXJ0RmlsbCA9IGZhbHNlO1xuICB9XG59XG5cbi8qIFx1MjUwMFx1MjUwMCBWMy01OiBQcmV2aWV3IG92ZXJsYXkgYmVmb3JlIGZpbGwgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG5mdW5jdGlvbiBzaG93RmlsbFByZXZpZXcoaXRlbXMsIG9uQ29uZmlybSwgb25DYW5jZWwpIHtcbiAgdmFyIG92ZXJsYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBvdmVybGF5LmlkID0gXCJvcHRpYm90LWZpbGwtcHJldmlld1wiO1xuICBvdmVybGF5LnN0eWxlLmNzc1RleHQgPSBcInBvc2l0aW9uOmZpeGVkO3RvcDowO2xlZnQ6MDtyaWdodDowO2JvdHRvbTowO3otaW5kZXg6MjE0NzQ4MzY0NjtiYWNrZ3JvdW5kOnJnYmEoMCwwLDAsMC40KTtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7Zm9udC1mYW1pbHk6LWFwcGxlLXN5c3RlbSxCbGlua01hY1N5c3RlbUZvbnQsc2Fucy1zZXJpZjtcIjtcblxuICB2YXIgcGFuZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBwYW5lbC5zdHlsZS5jc3NUZXh0ID0gXCJiYWNrZ3JvdW5kOndoaXRlO2JvcmRlci1yYWRpdXM6MTZweDtwYWRkaW5nOjI0cHg7bWF4LXdpZHRoOjQ4MHB4O3dpZHRoOjkwJTttYXgtaGVpZ2h0Ojgwdmg7b3ZlcmZsb3cteTphdXRvO2JveC1zaGFkb3c6MCAyMHB4IDYwcHggcmdiYSgwLDAsMCwwLjMpO1wiO1xuXG4gIHZhciB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIHRpdGxlLnN0eWxlLmNzc1RleHQgPSBcImZvbnQtc2l6ZToxNnB4O2ZvbnQtd2VpZ2h0OjcwMDtjb2xvcjojMTExO21hcmdpbi1ib3R0b206MTZweDtcIjtcbiAgdGl0bGUudGV4dENvbnRlbnQgPSBcIk9wdGlCb3QgXHUyMDE0IEFwZXJjdSBkdSByZW1wbGlzc2FnZSAoXCIgKyBpdGVtcy5sZW5ndGggKyBcIiBjaGFtcHMpXCI7XG4gIHBhbmVsLmFwcGVuZENoaWxkKHRpdGxlKTtcblxuICB2YXIgbGlzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIGxpc3Quc3R5bGUuY3NzVGV4dCA9IFwibWF4LWhlaWdodDo1MHZoO292ZXJmbG93LXk6YXV0bztcIjtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aCAmJiBpIDwgMzA7IGkrKykge1xuICAgIHZhciByb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHJvdy5zdHlsZS5jc3NUZXh0ID0gXCJkaXNwbGF5OmZsZXg7anVzdGlmeS1jb250ZW50OnNwYWNlLWJldHdlZW47YWxpZ24taXRlbXM6Y2VudGVyO3BhZGRpbmc6NnB4IDA7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgI2YzZjRmNjtmb250LXNpemU6MTNweDtcIjtcblxuICAgIHZhciBmaWVsZE5hbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICBmaWVsZE5hbWUuc3R5bGUuY3NzVGV4dCA9IFwiY29sb3I6IzZiNzI4MDtmbGV4LXNocmluazowO3dpZHRoOjQwJTtcIjtcbiAgICBmaWVsZE5hbWUudGV4dENvbnRlbnQgPSBpdGVtc1tpXS5sYWJlbCB8fCBpdGVtc1tpXS5maWVsZDtcblxuICAgIHZhciBmaWVsZFZhbHVlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgZmllbGRWYWx1ZS5zdHlsZS5jc3NUZXh0ID0gXCJjb2xvcjojMTExO2ZvbnQtd2VpZ2h0OjUwMDt0ZXh0LWFsaWduOnJpZ2h0O292ZXJmbG93OmhpZGRlbjt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO3doaXRlLXNwYWNlOm5vd3JhcDttYXgtd2lkdGg6NTUlO1wiO1xuICAgIGZpZWxkVmFsdWUudGV4dENvbnRlbnQgPSAoaXRlbXNbaV0udmFsdWUgfHwgXCJcIikuc3Vic3RyaW5nKDAsIDQwKTtcblxuICAgIHJvdy5hcHBlbmRDaGlsZChmaWVsZE5hbWUpO1xuICAgIHJvdy5hcHBlbmRDaGlsZChmaWVsZFZhbHVlKTtcbiAgICBsaXN0LmFwcGVuZENoaWxkKHJvdyk7XG4gIH1cbiAgaWYgKGl0ZW1zLmxlbmd0aCA+IDMwKSB7XG4gICAgdmFyIG1vcmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIG1vcmUuc3R5bGUuY3NzVGV4dCA9IFwidGV4dC1hbGlnbjpjZW50ZXI7Y29sb3I6IzljYTNhZjtmb250LXNpemU6MTJweDtwYWRkaW5nOjhweDtcIjtcbiAgICBtb3JlLnRleHRDb250ZW50ID0gXCIrXCIgKyAoaXRlbXMubGVuZ3RoIC0gMzApICsgXCIgY2hhbXBzIHN1cHBsZW1lbnRhaXJlc1wiO1xuICAgIGxpc3QuYXBwZW5kQ2hpbGQobW9yZSk7XG4gIH1cbiAgcGFuZWwuYXBwZW5kQ2hpbGQobGlzdCk7XG5cbiAgdmFyIGJ0blJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIGJ0blJvdy5zdHlsZS5jc3NUZXh0ID0gXCJkaXNwbGF5OmZsZXg7Z2FwOjEycHg7bWFyZ2luLXRvcDoxNnB4O1wiO1xuXG4gIHZhciBjYW5jZWxCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICBjYW5jZWxCdG4udGV4dENvbnRlbnQgPSBcIkFubnVsZXJcIjtcbiAgY2FuY2VsQnRuLnN0eWxlLmNzc1RleHQgPSBcImZsZXg6MTtwYWRkaW5nOjEwcHg7Ym9yZGVyOjFweCBzb2xpZCAjZDFkNWRiO2JvcmRlci1yYWRpdXM6OHB4O2JhY2tncm91bmQ6d2hpdGU7Y29sb3I6IzM3NDE1MTtjdXJzb3I6cG9pbnRlcjtmb250LXNpemU6MTNweDtmb250LXdlaWdodDo2MDA7XCI7XG4gIGNhbmNlbEJ0bi5vbmNsaWNrID0gZnVuY3Rpb24oKSB7IG92ZXJsYXkucmVtb3ZlKCk7IGlmIChvbkNhbmNlbCkgb25DYW5jZWwoKTsgfTtcblxuICB2YXIgY29uZmlybUJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gIGNvbmZpcm1CdG4udGV4dENvbnRlbnQgPSBcIlJlbXBsaXIgXCIgKyBpdGVtcy5sZW5ndGggKyBcIiBjaGFtcHNcIjtcbiAgY29uZmlybUJ0bi5zdHlsZS5jc3NUZXh0ID0gXCJmbGV4OjE7cGFkZGluZzoxMHB4O2JvcmRlcjpub25lO2JvcmRlci1yYWRpdXM6OHB4O2JhY2tncm91bmQ6IzI1NjNlYjtjb2xvcjp3aGl0ZTtjdXJzb3I6cG9pbnRlcjtmb250LXNpemU6MTNweDtmb250LXdlaWdodDo3MDA7XCI7XG4gIGNvbmZpcm1CdG4ub25jbGljayA9IGZ1bmN0aW9uKCkgeyBvdmVybGF5LnJlbW92ZSgpOyBpZiAob25Db25maXJtKSBvbkNvbmZpcm0oKTsgfTtcblxuICBidG5Sb3cuYXBwZW5kQ2hpbGQoY2FuY2VsQnRuKTtcbiAgYnRuUm93LmFwcGVuZENoaWxkKGNvbmZpcm1CdG4pO1xuICBwYW5lbC5hcHBlbmRDaGlsZChidG5Sb3cpO1xuXG4gIG92ZXJsYXkuYXBwZW5kQ2hpbGQocGFuZWwpO1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG92ZXJsYXkpO1xufVxuXG4vKiBcdTI1MDBcdTI1MDAgaWZyYW1lcyBjcm9zcy1kb21haW4gcG9zdE1lc3NhZ2UgbGlzdGVuZXIgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG5leHBvcnQgZnVuY3Rpb24gc2V0dXBQb3N0TWVzc2FnZUxpc3RlbmVyKCkge1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgZnVuY3Rpb24oZSkge1xuICAgIGlmIChlLm9yaWdpbiAhPT0gd2luZG93LmxvY2F0aW9uLm9yaWdpbikgcmV0dXJuO1xuICAgIGlmICghZS5kYXRhIHx8IGUuZGF0YS50eXBlICE9PSBcIk9QVElCT1RfRklMTF9GUkFNRVwiIHx8ICFlLmRhdGEucGF5bG9hZCkgcmV0dXJuO1xuICAgIHBlcmZvcm1TbWFydEZpbGwoZS5kYXRhLnBheWxvYWQpO1xuICB9LCBmYWxzZSk7XG59XG4iLCAiLyogXHUyNTAwXHUyNTAwIFN0YW5kYXJkIEZpbGwgXHUyMDE0IHBlcmZvcm1GaWxsICsgY2hlY2tEcm9pdHNNdXR1ZWxsZSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBlcmZvcm1GaWxsKCkge1xuICBsZXQgZGF0YSA9IHt9O1xuICB0cnkge1xuICAgIGNvbnN0IHRleHQgPSBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLnJlYWRUZXh0KCk7XG4gICAgZGF0YSA9IEpTT04ucGFyc2UodGV4dCk7XG5cbiAgICAvLyBTYXV2ZWdhcmRlIGF1dG9tYXRpcXVlIGRlcyBkb25uXHUwMEU5ZXMgZHUgcHJlc3NlLXBhcGllciBkYW5zIGxlIGNhY2hlXG4gICAgaWYgKGRhdGEubSB8fCBkYXRhLm8pIHtcbiAgICAgIGNvbnN0IG5vbSA9IChkYXRhLm0/Lm5vbSB8fCBkYXRhLm8/Lm5vbVBhdGllbnQgfHwgXCJcIikudG9VcHBlckNhc2UoKTtcblxuICAgICAgaWYgKG5vbSkge1xuICAgICAgICB3cml0ZUVuY3J5cHRlZENhY2hlKHtcbiAgICAgICAgICBjdXJyZW50OiB7XG4gICAgICAgICAgICAuLi5kYXRhLm0sXG4gICAgICAgICAgICBvcmRvbm5hbmNlOiBkYXRhLm8gfHwge30sXG4gICAgICAgICAgICB1cGRhdGVkQXQ6IERhdGUubm93KClcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICB9IGNhdGNoIChlKSB7XG4gICAgLyogUHJlc3NlLXBhcGllciB2aWRlIG91IGludmFsaWRlIFx1MjAxNCB1dGlsaXNhdGlvbiBkdSBjYWNoZSBsb2NhbCAqL1xuICB9XG5cbiAgLyogQnJvYWRjYXN0IGF1eCBpZnJhbWVzIGNyb3NzLWRvbWFpbiB2aWEgcG9zdE1lc3NhZ2UgKi9cbiAgdmFyIGZyYW1lcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJpZnJhbWVcIik7XG4gIGZvciAodmFyIGZpID0gMDsgZmkgPCBmcmFtZXMubGVuZ3RoOyBmaSsrKSB7XG4gICAgdHJ5IHsgaWYgKGZyYW1lc1tmaV0uc3JjKSB7IHZhciBmcmFtZU9yaWdpbiA9IG5ldyBVUkwoZnJhbWVzW2ZpXS5zcmMpLm9yaWdpbjsgZnJhbWVzW2ZpXS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKHsgdHlwZTogXCJPUFRJQk9UX0ZJTExfRlJBTUVcIiwgcGF5bG9hZDogZGF0YSB9LCBmcmFtZU9yaWdpbik7IH0gfSBjYXRjaChlKSB7fVxuICB9XG5cbiAgY29uc3QgY3VycmVudFNpdGUgPSBPYmplY3QudmFsdWVzKENPTkZJR1MpLmZpbmQoY2ZnID0+IGNmZy5pc01hdGNoKCkpO1xuICBpZiAoIWN1cnJlbnRTaXRlKSByZXR1cm47XG5cbiAgZGF0YS5jYWNoZWQgPSBhd2FpdCBnZXRDYWNoZWRDbGllbnQoZGF0YSk7XG5cbiAgLyogVlx1MDBFOXJpZmljYXRpb24gZHJvaXRzIG11dHVlbGxlICovXG4gIGNoZWNrRHJvaXRzTXV0dWVsbGUoZGF0YSk7XG5cbiAgY29uc3Qgc3VjY2VzcyA9IGN1cnJlbnRTaXRlLmFjdGlvbnMuZm9ybXVsYWlyZShkYXRhKTtcbiAgY29uc3Qgc2l0ZSA9IGN1cnJlbnRTaXRlLm5hbWU7XG4gIGNvbnN0IGZpZWxkc0NvdW50ID0gT2JqZWN0LmtleXMoZGF0YS5jYWNoZWQgfHwgZGF0YS5tIHx8IHt9KS5sZW5ndGg7XG5cbiAgLyogTW9uaXRvcmluZyA6IGxvZyBsb2NhbCArIGVudm9pIEFQSSBiZXN0LWVmZm9ydCAqL1xuICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoW1wib3B0aWJvdF9pbmplY3Rpb25fbG9nXCJdLCAobG9nUmVzdWx0KSA9PiB7XG4gICAgY29uc3QgbG9nID0gbG9nUmVzdWx0Lm9wdGlib3RfaW5qZWN0aW9uX2xvZyB8fCBbXTtcbiAgICBsb2cudW5zaGlmdCh7XG4gICAgICB0czogRGF0ZS5ub3coKSxcbiAgICAgIHNpdGUsXG4gICAgICBzdWNjZXNzLFxuICAgICAgZmllbGRzQ291bnQsXG4gICAgICBzeW5jVG9rZW46IGRhdGEuc3luY1Rva2VuIHx8IG51bGxcbiAgICB9KTtcbiAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoeyBvcHRpYm90X2luamVjdGlvbl9sb2c6IGxvZy5zbGljZSgwLCAxMDApIH0pO1xuICB9KTtcblxuICAvKiBFbnZveWVyIGxlcyBwaW5ncyB2aWEgbGUgYmFja2dyb3VuZCBzZXJ2aWNlIHdvcmtlciBwb3VyIFx1MDBFOXZpdGVyIENPUlMgKi9cbiAgdmFyIGV4dFZlcnNpb24gPSAodHlwZW9mIGNocm9tZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBjaHJvbWUucnVudGltZSAmJiBjaHJvbWUucnVudGltZS5nZXRNYW5pZmVzdClcbiAgICA/IGNocm9tZS5ydW50aW1lLmdldE1hbmlmZXN0KCkudmVyc2lvblxuICAgIDogXCJib29rbWFya2xldFwiO1xuICB2YXIgcGluZ1BheWxvYWRzID0gW107XG4gIGNvbnN0IHN5bmNUb2tlbiA9IGRhdGEuc3luY1Rva2VuIHx8IG51bGw7XG4gIGlmIChzeW5jVG9rZW4gJiYgc3VjY2VzcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcGluZ1BheWxvYWRzLnB1c2goeyB1cmw6IFwiaHR0cHM6Ly9vcHRpYm90LmZyL2FwaS9leHRlbnNpb24vbG9nLWluamVjdGlvblwiLCBib2R5OiB7IHN5bmNUb2tlbiwgc2l0ZSwgc3VjY2VzcywgZmllbGRzQ291bnQsIHRzOiBEYXRlLm5vdygpIH0gfSk7XG4gIH1cbiAgcGluZ1BheWxvYWRzLnB1c2goeyB1cmw6IFwiaHR0cHM6Ly9vcHRpYm90LmZyL2FwaS9ib29rbWFya2xldC9waW5nXCIsIGJvZHk6IHtcbiAgICB2ZXJzaW9uOiBleHRWZXJzaW9uLCBwb3J0YWw6IHNpdGUgfHwgXCJ1bmtub3duXCIsXG4gICAgc3RhdHVzOiBzdWNjZXNzID8gXCJva1wiIDogKGZpZWxkc0NvdW50ID09PSAwID8gXCJicm9rZW5cIiA6IFwicGFydGlhbFwiKSxcbiAgICBlcnJvckhpbnQ6IHN1Y2Nlc3MgPyBudWxsIDogKFwiZmllbGRzPVwiICsgZmllbGRzQ291bnQpXG4gIH19KTtcbiAgdHJ5IHtcbiAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7IHR5cGU6IFwiT1BUSUJPVF9QSU5HXCIsIHBheWxvYWRzOiBwaW5nUGF5bG9hZHMgfSk7XG4gIH0gY2F0Y2goZSkgeyAvKiBqYW1haXMgYmxvcXVlciBsJ1VJICovIH1cblxuICBpZiAoc3VjY2Vzcykge1xuICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvcHRpYm90LWZpbGwtYnRuJyk7XG4gICAgaWYgKGJ0bikge1xuICAgICAgYnRuLmlubmVyVGV4dCA9IGBcXHUyNzEzIFJlbXBsaSAhYDtcbiAgICAgIGJ0bi5zdHlsZS5iYWNrZ3JvdW5kID0gJyMxMGI5ODEnO1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGJ0bi5pbm5lclRleHQgPSAnXFx1RDgzRVxcdUREMTYgUmVtcGxpcic7XG4gICAgICAgIGJ0bi5zdHlsZS5iYWNrZ3JvdW5kID0gJyMyNTYzZWInO1xuICAgICAgfSwgMjAwMCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGFsZXJ0KGBPcHRpQm90IDogQXVjdW4gZm9ybXVsYWlyZSBkXFx1MDBFOXRlY3RcXHUwMEU5LmApO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0Ryb2l0c011dHVlbGxlKGRhdGEpIHtcbiAgdmFyIG0gPSBkYXRhLm0gfHwgZGF0YSB8fCB7fTtcbiAgdmFyIGRhdGVGaW4gPSBtLmRhdGVGaW5WYWxpZGl0ZSB8fCBcIlwiO1xuICB2YXIgZGF0ZURlYnV0ID0gbS5kYXRlRGVidXRWYWxpZGl0ZSB8fCBcIlwiO1xuICB2YXIgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICB0b2RheS5zZXRIb3VycygwLCAwLCAwLCAwKTtcblxuICBpZiAoZGF0ZUZpbikge1xuICAgIHZhciBwYXJ0cyA9IGRhdGVGaW4ubWF0Y2goLyhcXGR7Mn0pW1xcL1xcLV0oXFxkezJ9KVtcXC9cXC1dKFxcZHs0fSkvKTtcbiAgICBpZiAocGFydHMpIHtcbiAgICAgIHZhciBmaW5EYXRlID0gbmV3IERhdGUocGFyc2VJbnQocGFydHNbM10pLCBwYXJzZUludChwYXJ0c1syXSkgLSAxLCBwYXJzZUludChwYXJ0c1sxXSkpO1xuICAgICAgaWYgKGZpbkRhdGUgPCB0b2RheSkge1xuICAgICAgICBzaG93UlBBVG9hc3QoXCJcXHUyNkQ0IERyb2l0cyBtdXR1ZWxsZSBleHBpclxcdTAwRTlzIGRlcHVpcyBsZSBcIiArIGRhdGVGaW4sIFwiZXJyb3JcIik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZhciBkaWZmRGF5cyA9IE1hdGguY2VpbCgoZmluRGF0ZSAtIHRvZGF5KSAvICgxMDAwICogNjAgKiA2MCAqIDI0KSk7XG4gICAgICBpZiAoZGlmZkRheXMgPD0gMzApIHtcbiAgICAgICAgc2hvd1JQQVRvYXN0KFwiXFx1MjZBMFxcdUZFMEYgRHJvaXRzIG11dHVlbGxlIGV4cGlyZW50IGRhbnMgXCIgKyBkaWZmRGF5cyArIFwiIGpvdXJcIiArIChkaWZmRGF5cyA+IDEgPyBcInNcIiA6IFwiXCIpICsgXCIgKFwiICsgZGF0ZUZpbiArIFwiKVwiLCBcIndhcm5pbmdcIik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoZGF0ZURlYnV0KSB7XG4gICAgdmFyIHBhcnRzRCA9IGRhdGVEZWJ1dC5tYXRjaCgvKFxcZHsyfSlbXFwvXFwtXShcXGR7Mn0pW1xcL1xcLV0oXFxkezR9KS8pO1xuICAgIGlmIChwYXJ0c0QpIHtcbiAgICAgIHZhciBkZWJ1dERhdGUgPSBuZXcgRGF0ZShwYXJzZUludChwYXJ0c0RbM10pLCBwYXJzZUludChwYXJ0c0RbMl0pIC0gMSwgcGFyc2VJbnQocGFydHNEWzFdKSk7XG4gICAgICBpZiAoZGVidXREYXRlID4gdG9kYXkpIHtcbiAgICAgICAgc2hvd1JQQVRvYXN0KFwiXFx1MjZBMFxcdUZFMEYgRHJvaXRzIG11dHVlbGxlIHBhcyBlbmNvcmUgYWN0aWZzIChkXFx1MDBFOWJ1dCA6IFwiICsgZGF0ZURlYnV0ICsgXCIpXCIsIFwid2FybmluZ1wiKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiIsICIvKiBcdTI1MDBcdTI1MDAgUmVwbGF5IEVuZ2luZSBcdTIwMTQgUGFyY291cnMgUlBBIER5bmFtaXF1ZSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cbi8qIExlcyB2YWxldXJzIHBhdGllbnQgdmllbm5lbnQgZHUgY2FjaGUgTE9DQUwgY2hpZmZyXHUwMEU5IFx1MjAxNCBqYW1haXMgZHUgc2VydmV1ciAgICAqL1xuXG4vKiBcdTI1MDBcdTI1MDAgRm9ybWF0YWdlIE5TUyBhdXRvbWF0aXF1ZSBzZWxvbiBsZSBjb250ZXh0ZSBkdSBjaGFtcCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cbmZ1bmN0aW9uIGZvcm1hdE5TUyhyYXdOU1MsIGVsKSB7XG4gIGlmICghcmF3TlNTKSByZXR1cm4gcmF3TlNTO1xuICB2YXIgZGlnaXRzID0gcmF3TlNTLnJlcGxhY2UoL1xcRC9nLCBcIlwiKTtcblxuICAvKiBEXHUwMEU5dGVjdGVyIGxlIGZvcm1hdCBhdHRlbmR1IHBhciBsZSBjaGFtcCAqL1xuICB2YXIgbWF4TGVuID0gZWwgPyBwYXJzZUludChlbC5nZXRBdHRyaWJ1dGUoXCJtYXhsZW5ndGhcIikgfHwgXCIwXCIpIDogMDtcbiAgdmFyIHBsYWNlaG9sZGVyID0gZWwgPyAoZWwucGxhY2Vob2xkZXIgfHwgXCJcIikgOiBcIlwiO1xuICB2YXIgbmFtZSA9IGVsID8gKGVsLm5hbWUgfHwgXCJcIikgOiBcIlwiO1xuXG4gIC8qIENoYW1wIHF1aSBhdHRlbmQgMTMgY2hpZmZyZXMgKHNhbnMgY2xcdTAwRTkpICovXG4gIGlmIChtYXhMZW4gPT09IDEzIHx8IG5hbWUuaW5kZXhPZihcIjEzXCIpICE9PSAtMSB8fCBwbGFjZWhvbGRlci5tYXRjaCgvXFxkezEzfSQvKSkge1xuICAgIHJldHVybiBkaWdpdHMuc2xpY2UoMCwgMTMpO1xuICB9XG4gIC8qIENoYW1wIHF1aSBhdHRlbmQganVzdGUgbGEgY2xcdTAwRTkgKDIgY2hpZmZyZXMpICovXG4gIGlmIChtYXhMZW4gPT09IDIgJiYgKG5hbWUuaW5kZXhPZihcImNsZVwiKSAhPT0gLTEgfHwgbmFtZS5pbmRleE9mKFwia2V5XCIpICE9PSAtMSkpIHtcbiAgICByZXR1cm4gZGlnaXRzLnNsaWNlKDEzLCAxNSk7XG4gIH1cbiAgLyogQ2hhbXAgYXZlYyBlc3BhY2VzIChmb3JtYXQgbGlzaWJsZSkgKi9cbiAgaWYgKHBsYWNlaG9sZGVyLm1hdGNoKC9cXGRcXHNcXGQvKSB8fCBtYXhMZW4gPiAxNSkge1xuICAgIGlmIChkaWdpdHMubGVuZ3RoID49IDE1KSB7XG4gICAgICByZXR1cm4gZGlnaXRzWzBdICsgXCIgXCIgKyBkaWdpdHMuc2xpY2UoMSwgMykgKyBcIiBcIiArIGRpZ2l0cy5zbGljZSgzLCA1KSArIFwiIFwiICsgZGlnaXRzLnNsaWNlKDUsIDcpICsgXCIgXCIgKyBkaWdpdHMuc2xpY2UoNywgMTApICsgXCIgXCIgKyBkaWdpdHMuc2xpY2UoMTAsIDEzKSArIFwiIFwiICsgZGlnaXRzLnNsaWNlKDEzLCAxNSk7XG4gICAgfVxuICB9XG4gIC8qIFBhciBkXHUwMEU5ZmF1dCA6IHJldG91cm5lciBsZXMgMTUgY2hpZmZyZXMgYnJ1dHMgKi9cbiAgcmV0dXJuIGRpZ2l0cy5zbGljZSgwLCAxNSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlVmFyaWFibGVzKHRlbXBsYXRlLCBjYWNoZSwgZWwpIHtcbiAgaWYgKCF0ZW1wbGF0ZSkgcmV0dXJuIFwiXCI7XG4gIHZhciBtID0gY2FjaGUuY3VycmVudCB8fCB7fTtcbiAgdmFyIG8gPSBtLm9yZG9ubmFuY2UgfHwge307XG4gIHZhciBvZCA9IG8ubHVuZXR0ZXNPRCB8fCB7fTtcbiAgdmFyIG9nID0gby5sdW5ldHRlc09HIHx8IHt9O1xuICB2YXIgcDAgPSAobS5wZXJzb25uZXMgJiYgbS5wZXJzb25uZXNbMF0pIHx8IHt9O1xuICB2YXIgcHJlcyA9IG0ucHJlc2NyaXB0aW9uIHx8IHt9O1xuICB2YXIgcmVnaW1lcyA9IG0ucmVnaW1lcyB8fCB7fTtcbiAgdmFyIHJjMSA9IHJlZ2ltZXMucmMxIHx8IHt9O1xuICB2YXIgbG9kID0gby5sZW50aWxsZXNPRCB8fCB7fTtcbiAgdmFyIGxvZyA9IG8ubGVudGlsbGVzT0cgfHwge307XG5cbiAgLyogTlNTIGZvcm1hdFx1MDBFOSBzZWxvbiBsZSBjaGFtcCBjaWJsZSAqL1xuICB2YXIgbnNzUmF3ID0gbS5udW1lcm9TZWN1cml0ZVNvY2lhbGUgfHwgbS5uc3MgfHwgXCJcIjtcbiAgdmFyIG5zc0Zvcm1hdHRlZCA9IHRlbXBsYXRlID09PSBcInt7bnNzfX1cIiA/IGZvcm1hdE5TUyhuc3NSYXcsIGVsKSA6IG5zc1JhdztcblxuICB2YXIgdmFycyA9IHtcbiAgICAvKiBQYXRpZW50ICovXG4gICAgXCJ7e25vbX19XCI6IChtLm5vbSB8fCBwMC5ub20gfHwgXCJcIikudG9VcHBlckNhc2UoKSxcbiAgICBcInt7cHJlbm9tfX1cIjogbS5wcmVub20gfHwgcDAucHJlbm9tIHx8IFwiXCIsXG4gICAgXCJ7e25zc319XCI6IG5zc0Zvcm1hdHRlZCxcbiAgICBcInt7ZGF0ZU5haXNzYW5jZX19XCI6IG0uZGF0ZU5haXNzYW5jZSB8fCBtLmRvYiB8fCBcIlwiLFxuICAgIC8qIENvbnRhY3QgKi9cbiAgICBcInt7dGVsZXBob25lfX1cIjogbS5waG9uZSB8fCBtLnRlbGVwaG9uZSB8fCBcIlwiLFxuICAgIFwie3tlbWFpbH19XCI6IG0uZW1haWwgfHwgXCJcIixcbiAgICBcInt7YWRyZXNzZX19XCI6IG0uYWRkcmVzcyB8fCBtLmFkcmVzc2UgfHwgXCJcIixcbiAgICBcInt7Y29kZVBvc3RhbH19XCI6IG0uemlwQ29kZSB8fCBtLmNvZGVQb3N0YWwgfHwgXCJcIixcbiAgICBcInt7dmlsbGV9fVwiOiBtLmNpdHkgfHwgbS52aWxsZSB8fCBcIlwiLFxuICAgIC8qIE11dHVlbGxlICovXG4gICAgXCJ7e29yZ2FuaXNtZX19XCI6IG0ub3JnYW5pc21lIHx8IHJjMS5ub20gfHwgXCJcIixcbiAgICBcInt7bnVtZXJvQWRoZXJlbnR9fVwiOiBtLm51bWVyb0FkaGVyZW50IHx8IHJjMS5udW1lcm9BZGhlcmVudCB8fCBcIlwiLFxuICAgIFwie3tudW1lcm9BTUN9fVwiOiBtLm51bWVyb0FNQyB8fCBcIlwiLFxuICAgIFwie3tudW1lcm9UZWxldHJhbnNtaXNzaW9ufX1cIjogbS5udW1lcm9UZWxldHJhbnNtaXNzaW9uIHx8IHJjMS5udW1lcm9UZWxldHJhbnNtaXNzaW9uIHx8IFwiXCIsXG4gICAgXCJ7e2NyaXRlcmVTZWNvbmRhaXJlfX1cIjogbS5jcml0ZXJlU2Vjb25kYWlyZSB8fCByYzEuY3JpdGVyZVNlY29uZGFpcmUgfHwgXCJcIixcbiAgICBcInt7Y29kZUNvbnZlbnRpb259fVwiOiBtLmNvZGVDb252ZW50aW9uIHx8IHJjMS5jb2RlQ29udmVudGlvbiB8fCBcIlwiLFxuICAgIFwie3tkYXRlRGVidXRWYWxpZGl0ZX19XCI6IG0uZGF0ZURlYnV0VmFsaWRpdGUgfHwgcmMxLmRhdGVEZWJ1dCB8fCBcIlwiLFxuICAgIFwie3tkYXRlRmluVmFsaWRpdGV9fVwiOiBtLmRhdGVGaW5WYWxpZGl0ZSB8fCByYzEuZGF0ZUZpbiB8fCBcIlwiLFxuICAgIC8qIFByZXNjcmlwdGlvbiAqL1xuICAgIFwie3tkYXRlT3Jkb25uYW5jZX19XCI6IG8uZGF0ZU9yZG9ubmFuY2UgfHwgcHJlcy5kYXRlUHJlc2NyaXB0aW9uIHx8IFwiXCIsXG4gICAgXCJ7e25vbU9waHRhbG1vbG9ndWV9fVwiOiBvLm5vbU9waHRhbG1vbG9ndWUgfHwgcHJlcy5wcmVzY3JpcHRldXIgfHwgXCJcIixcbiAgICBcInt7cnBwc319XCI6IG8ucnBwcyB8fCBwcmVzLnJwcHMgfHwgXCJcIixcbiAgICBcInt7ZGlzdGFuY2VQdXBpbGxhaXJlfX1cIjogby5kaXN0YW5jZVB1cGlsbGFpcmUgfHwgXCJcIixcbiAgICBcInt7dHlwZVByZXNjcmlwdGlvbn19XCI6IG8udHlwZVByZXNjcmlwdGlvbiB8fCBwcmVzLnR5cGVWaXNpb24gfHwgXCJcIixcbiAgICAvKiBMdW5ldHRlcyBPRCAqL1xuICAgIFwie3tzcGhlcmVfb2R9fVwiOiBvZC5zcGhlcmUgfHwgXCJcIixcbiAgICBcInt7Y3lsaW5kcmVfb2R9fVwiOiBvZC5jeWxpbmRyZSB8fCBcIlwiLFxuICAgIFwie3theGVfb2R9fVwiOiBvZC5heGUgfHwgXCJcIixcbiAgICBcInt7YWRkaXRpb25fb2R9fVwiOiBvZC5hZGRpdGlvbiB8fCBcIlwiLFxuICAgIC8qIEx1bmV0dGVzIE9HICovXG4gICAgXCJ7e3NwaGVyZV9vZ319XCI6IG9nLnNwaGVyZSB8fCBcIlwiLFxuICAgIFwie3tjeWxpbmRyZV9vZ319XCI6IG9nLmN5bGluZHJlIHx8IFwiXCIsXG4gICAgXCJ7e2F4ZV9vZ319XCI6IG9nLmF4ZSB8fCBcIlwiLFxuICAgIFwie3thZGRpdGlvbl9vZ319XCI6IG9nLmFkZGl0aW9uIHx8IFwiXCIsXG4gICAgLyogQWRkaXRpb24gZ1x1MDBFOW5cdTAwRTlyaXF1ZSAqL1xuICAgIFwie3thZGRpdGlvbn19XCI6IG9kLmFkZGl0aW9uIHx8IG9nLmFkZGl0aW9uIHx8IFwiXCIsXG4gICAgLyogTGVudGlsbGVzIE9EICovXG4gICAgXCJ7e3NwaGVyZV9sZW50aWxsZV9vZH19XCI6IGxvZC5zcGhlcmUgfHwgXCJcIixcbiAgICBcInt7Y3lsaW5kcmVfbGVudGlsbGVfb2R9fVwiOiBsb2QuY3lsaW5kcmUgfHwgXCJcIixcbiAgICBcInt7YXhlX2xlbnRpbGxlX29kfX1cIjogbG9kLmF4ZSB8fCBcIlwiLFxuICAgIFwie3thZGRpdGlvbl9sZW50aWxsZV9vZH19XCI6IGxvZC5hZGRpdGlvbiB8fCBcIlwiLFxuICAgIFwie3tyYXlvbl9vZH19XCI6IGxvZC5yYXlvbkNvdXJidXJlIHx8IFwiXCIsXG4gICAgXCJ7e2RpYW1ldHJlX29kfX1cIjogbG9kLmRpYW1ldHJlIHx8IFwiXCIsXG4gICAgLyogTGVudGlsbGVzIE9HICovXG4gICAgXCJ7e3NwaGVyZV9sZW50aWxsZV9vZ319XCI6IGxvZy5zcGhlcmUgfHwgXCJcIixcbiAgICBcInt7Y3lsaW5kcmVfbGVudGlsbGVfb2d9fVwiOiBsb2cuY3lsaW5kcmUgfHwgXCJcIixcbiAgICBcInt7YXhlX2xlbnRpbGxlX29nfX1cIjogbG9nLmF4ZSB8fCBcIlwiLFxuICAgIFwie3thZGRpdGlvbl9sZW50aWxsZV9vZ319XCI6IGxvZy5hZGRpdGlvbiB8fCBcIlwiLFxuICAgIFwie3tyYXlvbl9vZ319XCI6IGxvZy5yYXlvbkNvdXJidXJlIHx8IFwiXCIsXG4gICAgXCJ7e2RpYW1ldHJlX29nfX1cIjogbG9nLmRpYW1ldHJlIHx8IFwiXCIsXG4gIH07XG4gIHZhciByZXN1bHQgPSB0ZW1wbGF0ZTtcbiAgZm9yICh2YXIga2V5IGluIHZhcnMpIHsgcmVzdWx0ID0gcmVzdWx0LnNwbGl0KGtleSkuam9pbih2YXJzW2tleV0pOyB9XG4gIGlmIChyZXN1bHQgPT09IFwiXCIgfHwgcmVzdWx0ID09PSB0ZW1wbGF0ZSkgcmV0dXJuIFwiXCI7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qIFx1MjUwMFx1MjUwMCBTY3JvbGwgbCdcdTAwRTlsXHUwMEU5bWVudCBkYW5zIGxhIHZ1ZSBhdmFudCBpbnRlcmFjdGlvbiBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cbmZ1bmN0aW9uIHNjcm9sbEludG9WaWV3SWZOZWVkZWQoZWwpIHtcbiAgaWYgKCFlbCkgcmV0dXJuO1xuICB2YXIgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB2YXIgaW5WaWV3ID0gcmVjdC50b3AgPj0gMCAmJiByZWN0LmJvdHRvbSA8PSB3aW5kb3cuaW5uZXJIZWlnaHQgJiZcbiAgICAgICAgICAgICAgIHJlY3QubGVmdCA+PSAwICYmIHJlY3QucmlnaHQgPD0gd2luZG93LmlubmVyV2lkdGg7XG4gIGlmICghaW5WaWV3KSB7XG4gICAgZWwuc2Nyb2xsSW50b1ZpZXcoeyBiZWhhdmlvcjogXCJzbW9vdGhcIiwgYmxvY2s6IFwiY2VudGVyXCIsIGlubGluZTogXCJjZW50ZXJcIiB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc0RhdGVWYXJpYWJsZSh2YXJpYWJsZSkge1xuICBpZiAoIXZhcmlhYmxlKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiB2YXJpYWJsZS5pbmRleE9mKFwiZGF0ZVwiKSAhPT0gLTEgfHwgdmFyaWFibGUuaW5kZXhPZihcIkRhdGVcIikgIT09IC0xIHx8XG4gICAgICAgICB2YXJpYWJsZS5pbmRleE9mKFwibmFpc3NhbmNlXCIpICE9PSAtMSB8fCB2YXJpYWJsZS5pbmRleE9mKFwiTmFpc3NhbmNlXCIpICE9PSAtMTtcbn1cblxuZnVuY3Rpb24gZnJhbWV3b3JrRGVsYXkobXMpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHIpIHsgc2V0VGltZW91dChyLCBtcyB8fCAxNTApOyB9KTtcbn1cblxuLyogXHUyNTAwXHUyNTAwIFByb2dyZXNzIE92ZXJsYXkgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG5cbnZhciBfcHJvZ3Jlc3NPdmVybGF5ID0gbnVsbDtcblxuZnVuY3Rpb24gc2hvd1Byb2dyZXNzT3ZlcmxheShjdXJyZW50LCB0b3RhbCwgbGFiZWwpIHtcbiAgaWYgKCFfcHJvZ3Jlc3NPdmVybGF5KSB7XG4gICAgX3Byb2dyZXNzT3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgX3Byb2dyZXNzT3ZlcmxheS5pZCA9IFwib3B0aWJvdC1yZXBsYXktcHJvZ3Jlc3NcIjtcbiAgICBfcHJvZ3Jlc3NPdmVybGF5LnN0eWxlLmNzc1RleHQgPSBcInBvc2l0aW9uOmZpeGVkO2JvdHRvbToyMHB4O2xlZnQ6NTAlO3RyYW5zZm9ybTp0cmFuc2xhdGVYKC01MCUpO3otaW5kZXg6MjE0NzQ4MzY0NztiYWNrZ3JvdW5kOndoaXRlO2JvcmRlci1yYWRpdXM6MTJweDtib3gtc2hhZG93OjAgNHB4IDIwcHggcmdiYSgwLDAsMCwwLjE1KTtwYWRkaW5nOjEycHggMjBweDtmb250LWZhbWlseTpzYW5zLXNlcmlmO21pbi13aWR0aDoyODBweDtcIjtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKF9wcm9ncmVzc092ZXJsYXkpO1xuICB9XG5cbiAgdmFyIHBjdCA9IE1hdGgucm91bmQoKGN1cnJlbnQgLyB0b3RhbCkgKiAxMDApO1xuICBfcHJvZ3Jlc3NPdmVybGF5LmlubmVySFRNTCA9XG4gICAgJzxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7anVzdGlmeS1jb250ZW50OnNwYWNlLWJldHdlZW47YWxpZ24taXRlbXM6Y2VudGVyO21hcmdpbi1ib3R0b206NnB4O1wiPicgK1xuICAgICAgJzxzcGFuIHN0eWxlPVwiZm9udC1zaXplOjEycHg7Zm9udC13ZWlnaHQ6NjAwO2NvbG9yOiMzNzQxNTE7XCI+XFx1MjY5OVxcdUZFMEYgUlBBIGVuIGNvdXJzPC9zcGFuPicgK1xuICAgICAgJzxzcGFuIHN0eWxlPVwiZm9udC1zaXplOjExcHg7Y29sb3I6IzZiNzI4MDtcIj4nICsgY3VycmVudCArICcvJyArIHRvdGFsICsgJzwvc3Bhbj4nICtcbiAgICAnPC9kaXY+JyArXG4gICAgJzxkaXYgc3R5bGU9XCJoZWlnaHQ6NHB4O2JhY2tncm91bmQ6I2U1ZTdlYjtib3JkZXItcmFkaXVzOjJweDtvdmVyZmxvdzpoaWRkZW47XCI+JyArXG4gICAgICAnPGRpdiBzdHlsZT1cImhlaWdodDoxMDAlO2JhY2tncm91bmQ6IzNiODJmNjtib3JkZXItcmFkaXVzOjJweDt3aWR0aDonICsgcGN0ICsgJyU7dHJhbnNpdGlvbjp3aWR0aCAwLjNzO1wiPjwvZGl2PicgK1xuICAgICc8L2Rpdj4nICtcbiAgICAnPGRpdiBzdHlsZT1cImZvbnQtc2l6ZToxMXB4O2NvbG9yOiM5Y2EzYWY7bWFyZ2luLXRvcDo0cHg7b3ZlcmZsb3c6aGlkZGVuO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7d2hpdGUtc3BhY2U6bm93cmFwO1wiPicgKyAobGFiZWwgfHwgXCJcIikgKyAnPC9kaXY+Jztcbn1cblxuZnVuY3Rpb24gaGlkZVByb2dyZXNzT3ZlcmxheSgpIHtcbiAgaWYgKF9wcm9ncmVzc092ZXJsYXkpIHtcbiAgICBfcHJvZ3Jlc3NPdmVybGF5LnJlbW92ZSgpO1xuICAgIF9wcm9ncmVzc092ZXJsYXkgPSBudWxsO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNob3dQcm9ncmVzc1N1Y2Nlc3MoZmlsbGVkLCBlbGFwc2VkKSB7XG4gIGlmIChfcHJvZ3Jlc3NPdmVybGF5KSB7XG4gICAgX3Byb2dyZXNzT3ZlcmxheS5pbm5lckhUTUwgPVxuICAgICAgJzxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOmNlbnRlcjtwYWRkaW5nOjRweCAwO1wiPicgK1xuICAgICAgICAnPGRpdiBzdHlsZT1cImZvbnQtc2l6ZToxNHB4O2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjojMTBiOTgxO1wiPlxcdTI3MDUgVGVybWluXFx1MDBFOTwvZGl2PicgK1xuICAgICAgICAnPGRpdiBzdHlsZT1cImZvbnQtc2l6ZToxMnB4O2NvbG9yOiM2YjcyODA7bWFyZ2luLXRvcDo0cHg7XCI+JyArIGZpbGxlZCArICcgY2hhbXBzIHJlbXBsaXMgZW4gJyArIGVsYXBzZWQgKyAnczwvZGl2PicgK1xuICAgICAgJzwvZGl2Pic7XG4gICAgc2V0VGltZW91dChoaWRlUHJvZ3Jlc3NPdmVybGF5LCA0MDAwKTtcbiAgfVxufVxuXG4vKiBcdTI1MDBcdTI1MDAgXHUwMEM5dGFwZSByZXBsYXkgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5TdGVwKGV0YXBlLCBjYWNoZSkge1xuICB2YXIgdGltZW91dCA9IGV0YXBlLnRpbWVvdXQgfHwgNTAwMDtcbiAgdmFyIHNlbGVjdG9ycyA9IEFycmF5LmlzQXJyYXkoZXRhcGUuc2VsZWN0b3JzKSA/IGV0YXBlLnNlbGVjdG9ycyA6IChldGFwZS5zZWxlY3RvciA/IFtldGFwZS5zZWxlY3Rvcl0gOiBbXSk7XG5cbiAgaWYgKGV0YXBlLmFjdGlvbiA9PT0gXCJ3YWl0XCIpIHtcbiAgICB2YXIgZWxXID0gYXdhaXQgZmluZEVsZW1lbnRCeVNlbGVjdG9ycyhzZWxlY3RvcnMsIHRpbWVvdXQpO1xuICAgIHJldHVybiBlbFcgIT09IG51bGw7XG4gIH1cblxuICB2YXIgZWwgPSBhd2FpdCBmaW5kRWxlbWVudEJ5U2VsZWN0b3JzKHNlbGVjdG9ycywgdGltZW91dCk7XG4gIGlmICghZWwpIHJldHVybiBmYWxzZTtcblxuICAvKiBSXHUwMEU5c291ZHJlIGxhIHZhcmlhYmxlIGF2ZWMgbGUgY29udGV4dGUgZGUgbCdcdTAwRTlsXHUwMEU5bWVudCB0cm91dlx1MDBFOSAocG91ciBsZSBmb3JtYXRhZ2UgTlNTKSAqL1xuICB2YXIgdmFsdWUgPSBldGFwZS52YXJpYWJsZSA/IHJlc29sdmVWYXJpYWJsZXMoZXRhcGUudmFyaWFibGUsIGNhY2hlLCBlbCkgOiBudWxsO1xuXG4gIHNjcm9sbEludG9WaWV3SWZOZWVkZWQoZWwpO1xuICBhd2FpdCBmcmFtZXdvcmtEZWxheSg1MCk7XG5cbiAgLyogSGlnaGxpZ2h0IHRlbXBvcmFpcmUgZGUgbCdcdTAwRTlsXHUwMEU5bWVudCBlbiBjb3VycyAqL1xuICB2YXIgcHJldk91dGxpbmUgPSBlbC5zdHlsZS5vdXRsaW5lO1xuICBlbC5zdHlsZS5vdXRsaW5lID0gXCIycHggc29saWQgIzNiODJmNlwiO1xuXG4gIGlmIChldGFwZS5hY3Rpb24gPT09IFwiZmlsbFwiKSB7XG4gICAgdmFyIGlzRGF0ZSA9IGlzRGF0ZVZhcmlhYmxlKGV0YXBlLnZhcmlhYmxlKTtcbiAgICB2YXIgZmlsbGVkID0gYXdhaXQgc21hcnRGaWxsRmllbGQoZWwsIHZhbHVlLCBpc0RhdGUpO1xuICAgIGlmICghZmlsbGVkKSB7XG4gICAgICB1bHRyYUZpbGwoZWwsIHZhbHVlLCB7IGZvcmNlOiB0cnVlIH0pO1xuICAgIH1cbiAgICAvKiBMZWFybmluZyA6IG1hcnF1ZXIgbGUgY2hhbXAgcG91ciBsYSBib3VjbGUgZCdhcHByZW50aXNzYWdlICovXG4gICAgdmFyIHZhcktleSA9IChldGFwZS52YXJpYWJsZSB8fCBcIlwiKS5yZXBsYWNlKC9cXHt8XFx9L2csIFwiXCIpIHx8IGV0YXBlLmxhYmVsIHx8IFwiXCI7XG4gICAgbWFya0ZpbGxlZEJ5T3B0aUJvdChlbCwgdmFyS2V5KTtcbiAgICBhd2FpdCBmcmFtZXdvcmtEZWxheSg4MCk7XG4gIH0gZWxzZSBpZiAoZXRhcGUuYWN0aW9uID09PSBcImNsaWNrXCIpIHtcbiAgICBlbC5jbGljaygpO1xuICAgIGF3YWl0IGZyYW1ld29ya0RlbGF5KDE1MCk7XG4gIH0gZWxzZSBpZiAoZXRhcGUuYWN0aW9uID09PSBcInNlbGVjdFwiKSB7XG4gICAgdmFyIHNlbGVjdGVkID0gc21hcnRTZWxlY3RPcHRpb24oZWwsIHZhbHVlKTtcbiAgICBpZiAoIXNlbGVjdGVkKSB7XG4gICAgICBlbC52YWx1ZSA9IHZhbHVlO1xuICAgICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJjaGFuZ2VcIiwgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgICB9XG4gICAgLyogTGVhcm5pbmcgOiBtYXJxdWVyIGxlIGNoYW1wIHBvdXIgbGEgYm91Y2xlIGQnYXBwcmVudGlzc2FnZSAqL1xuICAgIHZhciB2YXJLZXlTID0gKGV0YXBlLnZhcmlhYmxlIHx8IFwiXCIpLnJlcGxhY2UoL1xce3xcXH0vZywgXCJcIikgfHwgZXRhcGUubGFiZWwgfHwgXCJcIjtcbiAgICBtYXJrRmlsbGVkQnlPcHRpQm90KGVsLCB2YXJLZXlTKTtcbiAgICBhd2FpdCBmcmFtZXdvcmtEZWxheSg4MCk7XG4gIH1cblxuICAvKiBSZXRpcmVyIGxlIGhpZ2hsaWdodCAqL1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBlbC5zdHlsZS5vdXRsaW5lID0gcHJldk91dGxpbmU7IH0sIDUwMCk7XG5cbiAgaWYgKGV0YXBlLndhaXRGb3IpIHtcbiAgICB2YXIgbmV4dCA9IGF3YWl0IHdhaXRGb3JFbGVtZW50KGV0YXBlLndhaXRGb3IsIHRpbWVvdXQpO1xuICAgIHJldHVybiBuZXh0ICE9PSBudWxsO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5hc3luYyBmdW5jdGlvbiBydW5TdGVwV2l0aFJldHJ5KGV0YXBlLCBjYWNoZSwgbWF4UmV0cmllcykge1xuICBtYXhSZXRyaWVzID0gbWF4UmV0cmllcyB8fCAzO1xuICBmb3IgKHZhciBhdHRlbXB0ID0gMDsgYXR0ZW1wdCA8PSBtYXhSZXRyaWVzOyBhdHRlbXB0KyspIHtcbiAgICB2YXIgb2sgPSBhd2FpdCBydW5TdGVwKGV0YXBlLCBjYWNoZSk7XG4gICAgaWYgKG9rKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAoYXR0ZW1wdCA8IG1heFJldHJpZXMpIHtcbiAgICAgIGF3YWl0IGZyYW1ld29ya0RlbGF5KDgwMCAqIE1hdGgucG93KDIsIGF0dGVtcHQpKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgdmFyIHJlcGxheVN0YXRlID0gbnVsbDtcblxuZXhwb3J0IGZ1bmN0aW9uIHNldFJlcGxheVN0YXRlKHZhbCkgeyByZXBsYXlTdGF0ZSA9IHZhbDsgfVxuXG4vKiBOZXR0b3lhZ2Ugc2kgbGEgcGFnZSBlc3QgZFx1MDBFOWNoYXJnXHUwMEU5ZSBwZW5kYW50IHVuIHJlcGxheSAqL1xud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJwYWdlaGlkZVwiLCBmdW5jdGlvbigpIHtcbiAgcmVwbGF5U3RhdGUgPSBudWxsO1xuICBoaWRlUHJvZ3Jlc3NPdmVybGF5KCk7XG59KTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN0YXJ0UmVwbGF5KHBhcmNvdXJzLCBjYWNoZSkge1xuICB2YXIgZXRhcGVzID0gcGFyY291cnMuZXRhcGVzIHx8IFtdO1xuICB2YXIgdG90YWwgPSBldGFwZXMubGVuZ3RoO1xuICB2YXIgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgcmVwbGF5U3RhdGUgPSB7IHBhcmNvdXJzOiBwYXJjb3VycywgY3VycmVudEluZGV4OiAwLCBwYXVzZWQ6IGZhbHNlLCBjYWNoZTogY2FjaGUsIGZhaWxDb3VudDogMCB9O1xuXG4gIHNob3dQcm9ncmVzc092ZXJsYXkoMCwgdG90YWwsIFwiRFxcdTAwRTltYXJyYWdlXFx1MjAyNlwiKTtcbiAgbG9nUlBBKHBhcmNvdXJzLmhvc3RuYW1lIHx8IFwicGFyY291cnNcIiwgXCJyZXBsYXlfc3RhcnRcIiwgXCJzdWNjZXNcIik7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBldGFwZXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAocmVwbGF5U3RhdGUgJiYgcmVwbGF5U3RhdGUucGF1c2VkKSB7XG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7IHJlcGxheVN0YXRlLm9uUmVzdW1lID0gcmVzb2x2ZTsgfSk7XG4gICAgfVxuICAgIGlmICghcmVwbGF5U3RhdGUpIHsgaGlkZVByb2dyZXNzT3ZlcmxheSgpOyByZXR1cm47IH1cblxuICAgIHJlcGxheVN0YXRlLmN1cnJlbnRJbmRleCA9IGk7XG4gICAgdmFyIGV0YXBlID0gZXRhcGVzW2ldO1xuICAgIHNob3dQcm9ncmVzc092ZXJsYXkoaSArIDEsIHRvdGFsLCBldGFwZS5sYWJlbCB8fCBldGFwZS5hY3Rpb24pO1xuXG4gICAgdmFyIG9rID0gYXdhaXQgcnVuU3RlcFdpdGhSZXRyeShldGFwZSwgY2FjaGUsIDMpO1xuXG4gICAgaWYgKCFvaykge1xuICAgICAgcmVwbGF5U3RhdGUucGF1c2VkID0gdHJ1ZTtcbiAgICAgIHJlcGxheVN0YXRlLmZhaWxDb3VudCA9IChyZXBsYXlTdGF0ZS5mYWlsQ291bnQgfHwgMCkgKyAxO1xuICAgICAgc2hvd1JQQVRvYXN0KFwiXFx1MjZBMFxcdUZFMEYgUlBBIGJsb3F1XFx1MDBFOSBcXHUwMEU5dGFwZSBcIiArIChpICsgMSkgKyBcIiBcXHUyMDE0IFwiICsgZXRhcGUubGFiZWwgKyBcIiBub24gdHJvdXZcXHUwMEU5XFxuUmVtcGxpc3NleiBtYW51ZWxsZW1lbnQgcHVpcyBjbGlxdWV6IFxcdTI1QjYgUmVwcmVuZHJlXCIsIFwiZXJyb3JcIik7XG4gICAgICBsb2dSUEEocGFyY291cnMuaG9zdG5hbWUgfHwgXCJwYXJjb3Vyc1wiLCBcInN0ZXBcIiArIChpICsgMSkgKyBcIl9cIiArIChldGFwZS5hY3Rpb24gfHwgXCJ1bmtub3duXCIpLCBcImVjaGVjXCIsIGV0YXBlLmxhYmVsICsgXCIgbm9uIHRyb3V2ZVwiKTtcbiAgICAgIHNob3dSZXBsYXlDb250cm9scygpO1xuICAgICAgaWYgKHJlcGxheVN0YXRlLmZhaWxDb3VudCA+PSAyKSB7XG4gICAgICAgIHNlbmRIZWFsdGhQaW5nKHBhcmNvdXJzLmhvc3RuYW1lLCBcImJyb2tlblwiLCBcInJlcGxheV9mYWlsX3N0ZXBfXCIgKyAoaSArIDEpKTtcbiAgICAgIH1cbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHsgcmVwbGF5U3RhdGUub25SZXN1bWUgPSByZXNvbHZlOyB9KTtcbiAgICAgIHJlcGxheVN0YXRlLnBhdXNlZCA9IGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXBsYXlTdGF0ZS5mYWlsQ291bnQgPSAwO1xuICAgIH1cbiAgfVxuXG4gIHZhciBlbGFwc2VkID0gTWF0aC5yb3VuZCgoRGF0ZS5ub3coKSAtIHN0YXJ0VGltZSkgLyAxMDAwKTtcbiAgdmFyIGZpbGxlZCA9IGV0YXBlcy5maWx0ZXIoZnVuY3Rpb24oZSkgeyByZXR1cm4gZS5hY3Rpb24gPT09IFwiZmlsbFwiOyB9KS5sZW5ndGg7XG4gIHNob3dQcm9ncmVzc1N1Y2Nlc3MoZmlsbGVkLCBlbGFwc2VkKTtcbiAgc2hvd1JQQVRvYXN0KFwiXFx1MjcwNSBQYXJjb3VycyB0ZXJtaW5cXHUwMEU5IFxcdTIwMTQgXCIgKyBmaWxsZWQgKyBcIiBjaGFtcHMgcmVtcGxpcyBlbiBcIiArIGVsYXBzZWQgKyBcInNcIiwgXCJzdWNjZXNzXCIpO1xuICBsb2dSUEEocGFyY291cnMuaG9zdG5hbWUgfHwgXCJwYXJjb3Vyc1wiLCBcInJlcGxheV9jb21wbGV0ZVwiLCBcInN1Y2Nlc1wiLCBmaWxsZWQgKyBcIiBjaGFtcHMgZW4gXCIgKyBlbGFwc2VkICsgXCJzXCIpO1xuICBnZXRTeW5jVG9rZW4oKS50aGVuKGZ1bmN0aW9uKHN5bmNUb2tlbikge1xuICAgIGlmIChzeW5jVG9rZW4pIHtcbiAgICAgIGZldGNoKFwiaHR0cHM6Ly9vcHRpYm90LmZyL2FwaS9leHRlbnNpb24vbG9nLWluamVjdGlvblwiLCB7XG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBzeW5jVG9rZW46IHN5bmNUb2tlbiwgc2l0ZTogcGFyY291cnMuaG9zdG5hbWUsIHN1Y2Nlc3M6IHRydWUsIGZpZWxkc0NvdW50OiBmaWxsZWQsIHRzOiBEYXRlLm5vdygpIH0pXG4gICAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHsgY29uc29sZS53YXJuKFwiW09wdGlCb3RdIGxvZy1pbmplY3Rpb24gZmFpbGVkOlwiLCBlcnIpOyB9KTtcbiAgICB9XG4gIH0pO1xuICByZXBsYXlTdGF0ZSA9IG51bGw7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB0cnlEeW5hbWljUmVwbGF5KCkge1xuICB2YXIgaG9zdG5hbWUgPSB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUucmVwbGFjZShcInd3dy5cIiwgXCJcIik7XG4gIHZhciBzeW5jVG9rZW4gPSBhd2FpdCBnZXRTeW5jVG9rZW4oKTtcbiAgaWYgKCFzeW5jVG9rZW4pIHJldHVybiBmYWxzZTtcbiAgdHJ5IHtcbiAgICB2YXIgcmVzID0gYXdhaXQgZmV0Y2goXCJodHRwczovL29wdGlib3QuZnIvYXBpL2V4dGVuc2lvbi9wYXJjb3Vycz9ob3N0bmFtZT1cIiArIGVuY29kZVVSSUNvbXBvbmVudChob3N0bmFtZSksIHsgaGVhZGVyczogeyBcIkF1dGhvcml6YXRpb25cIjogXCJCZWFyZXIgXCIgKyBzeW5jVG9rZW4gfSB9KTtcbiAgICBpZiAoIXJlcy5vaykgcmV0dXJuIGZhbHNlO1xuICAgIHZhciBkYXRhID0gYXdhaXQgcmVzLmpzb24oKTtcbiAgICBpZiAoIWRhdGEucGFyY291cnMgfHwgZGF0YS5wYXJjb3Vycy5sZW5ndGggPT09IDApIHJldHVybiBmYWxzZTtcbiAgICB2YXIgcGFyY291cnMgPSBkYXRhLnBhcmNvdXJzWzBdO1xuICAgIHZhciBjYWNoZSA9IGF3YWl0IHJlYWRFbmNyeXB0ZWRDYWNoZSgpIHx8IHt9O1xuICAgIHN0YXJ0UmVwbGF5KHBhcmNvdXJzLCBjYWNoZSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2goZSkgeyByZXR1cm4gZmFsc2U7IH1cbn1cbiIsICIvKiBcdTI1MDBcdTI1MDAgUlBBIEVudHJ5IFBvaW50IFx1MjAxNCBjaGVja0FuZFN0YXJ0UlBBIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuLyogUlBBIGdlbmVyYWxpc1x1MDBFOSBcdTIwMTQgcmVwbGF5IHBhcmNvdXJzIGR5bmFtaXF1ZSBzdXIgdG91dCBwb3J0YWlsICovXG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0FuZFN0YXJ0UlBBKCkge1xuICB2YXIgY3VycmVudEhvc3RuYW1lID0gd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lO1xuXG4gIC8qIFZcdTAwRTlyaWZpZXIgcXVlIGwndXNlciBhIGxlIHBsYW4gUFJPL0VRVUlQRS9BRE1JTiBhdmFudCBkZSBsYW5jZXIgKi9cbiAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFsnb3B0aWJvdF9hdXRoJywgJ29wdGlib3RfcnBhJ10sIGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgIHZhciBhdXRoID0gcmVzdWx0Lm9wdGlib3RfYXV0aCB8fCB7fTtcbiAgICBpZiAoYXV0aC5ycGFFbmFibGVkID09PSBmYWxzZSkge1xuICAgICAgc2hvd1JQQVRvYXN0KFwiUlBBIGRpc3BvbmlibGUgXFx1MDBFMCBwYXJ0aXIgZHUgcGxhbiBQcm9cIiwgXCJpbmZvXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgcnBhID0gcmVzdWx0Lm9wdGlib3RfcnBhO1xuICAgIGlmICghcnBhIHx8ICFycGEudGFyZ2V0KSByZXR1cm47XG5cbiAgICAvKiBWZXJpZmllciBxdWUgbGUgUlBBIGNpYmxlIGNvcnJlc3BvbmQgYXUgZG9tYWluZSBjb3VyYW50ICovXG4gICAgdmFyIHJwYUhvc3RuYW1lID0gcnBhLnRhcmdldEhvc3RuYW1lIHx8IFwiXCI7XG4gICAgdmFyIHRhcmdldE1hdGNoZXNDdXJyZW50ID0gY3VycmVudEhvc3RuYW1lLmluY2x1ZGVzKHJwYS50YXJnZXQpIHx8IGN1cnJlbnRIb3N0bmFtZS5pbmNsdWRlcyhycGFIb3N0bmFtZSk7XG4gICAgaWYgKCF0YXJnZXRNYXRjaGVzQ3VycmVudCkgcmV0dXJuO1xuXG4gICAgLyogTidleFx1MDBFOWN1dGVyIHF1ZSBzaSBsZXMgZG9ublx1MDBFOWVzIG9udCBtb2lucyBkZSA1IG1pbnV0ZXMgKi9cbiAgICBpZiAoRGF0ZS5ub3coKSAtIHJwYS50cyA+IDMwMDAwMCkge1xuICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwucmVtb3ZlKCdvcHRpYm90X3JwYScpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8qIFx1MjUwMFx1MjUwMCBQb3J0YWlsIGdlbmVyaXF1ZSBcdTIwMTQgcmVwbGF5IHBhcmNvdXJzIGR5bmFtaXF1ZSBcdTI1MDBcdTI1MDAgKi9cbiAgICB2YXIgbG9naW5QYWdlID0gL1xcL2xvZ2lufFxcL3NpZ25pbnxcXC9jb25uZXhpb258XFwvYXV0aHxMb2dpblxcLmRvL2kudGVzdCh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUpXG4gICAgICB8fCAoISFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwicGFzc3dvcmRcIl0nKSk7XG5cbiAgICBpZiAobG9naW5QYWdlICYmICFycGEubG9naW5fc2hvd24pIHtcbiAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7IG9wdGlib3RfcnBhOiBPYmplY3QuYXNzaWduKHt9LCBycGEsIHsgbG9naW5fc2hvd246IHRydWUgfSkgfSk7XG4gICAgICBzaG93UlBBVG9hc3QoXCJcXHVEODNEXFx1REQxMCBSUEEgOiBjb25uZWN0ZXotdm91cywgbGUgYm90IHJlcHJlbmQgYXV0b21hdGlxdWVtZW50IGFwclxcdTAwRThzIGNvbm5leGlvblwiLCBcImluZm9cIik7XG4gICAgICB2YXIgbG9naW5PYnMgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwicGFzc3dvcmRcIl0nKSkge1xuICAgICAgICAgIGxvZ2luT2JzLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICBjaGVja0FuZFN0YXJ0UlBBKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgbG9naW5PYnMub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7IGNoaWxkTGlzdDogdHJ1ZSwgc3VidHJlZTogdHJ1ZSB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvKiBMYW5jZXIgbGUgcmVwbGF5IGR5bmFtaXF1ZSBzaSB1biBwYXJjb3VycyBlc3QgYXR0YWNoZSBhdXggZG9ubmVlcyBSUEEgKi9cbiAgICBpZiAocnBhLnBhcmNvdXJzICYmIHJwYS5wYXJjb3Vycy5ldGFwZXMpIHtcbiAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnJlbW92ZSgnb3B0aWJvdF9ycGEnKTtcbiAgICAgIHNob3dSUEFUb2FzdChcIlJQQSBcIiArIChycGEudGFyZ2V0IHx8IFwicG9ydGFpbFwiKSArIFwiIDogZFxcdTAwRTltYXJyYWdlLi4uXCIsIFwiaW5mb1wiKTtcbiAgICAgIGlmICh0eXBlb2YgcmVwbGF5UGFyY291cnMgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXBsYXlQYXJjb3VycyhycGEucGFyY291cnMsIHJwYS5wYXlsb2FkKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvKiBGYWxsYmFjayA6IHRlbnRlciB1biBTbWFydCBGaWxsIGF2ZWMgbGVzIGRvbm5lZXMgUlBBICovXG4gICAgY2hyb21lLnN0b3JhZ2UubG9jYWwucmVtb3ZlKCdvcHRpYm90X3JwYScpO1xuICAgIHNob3dSUEFUb2FzdChcIlJQQSBcIiArIChycGEudGFyZ2V0IHx8IFwicG9ydGFpbFwiKSArIFwiIDogcmVtcGxpc3NhZ2UgYXV0b21hdGlxdWUuLi5cIiwgXCJpbmZvXCIpO1xuICAgIGlmICh0eXBlb2YgcGVyZm9ybVNtYXJ0RmlsbCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBwZXJmb3JtU21hcnRGaWxsKCk7XG4gICAgfVxuICB9KTsgLyogZW5kIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldCBvcHRpYm90X2F1dGggKyBvcHRpYm90X3JwYSAqL1xufVxuIiwgIi8vIFx1MjUwMFx1MjUwMCBPcHRpQm90IE11bHRpLVNpdGUgRGlzcGF0Y2hlciAoTW9kdWxhciBCdWlsZCkgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbmltcG9ydCB7IENPTkZJR1MgfSBmcm9tIFwiLi9wb3J0YWxzL2luZGV4LmpzXCI7XG5pbXBvcnQgXCIuL3V0aWxzL3JlbW90ZS1zZWxlY3RvcnMuanNcIjtcbmltcG9ydCBcIi4vdXRpbHMvZmllbGQtZmVlZGJhY2suanNcIjsgLyogVVMtOCA6IEZlZWRiYWNrIExvb3Agc2lnbmFsZW1lbnQgY2hhbXAgKi9cbmltcG9ydCBcIi4vdXRpbHMvc2VsZWN0b3ItaGVhbHRoLmpzXCI7XG5pbXBvcnQgXCIuL3V0aWxzL3JlamVjdGlvbi1wcmVkaWN0b3IuanNcIjtcbmltcG9ydCBcIi4vY29tbWFuZC1jZW50ZXIuanNcIjtcbmltcG9ydCBcIi4vcGVjLWNhcHR1cmUuanNcIjtcbmltcG9ydCB7IHNldHVwRGV2aXNEZXRlY3Rpb24gfSBmcm9tIFwiLi91dGlscy9kZXZpcy1jYXB0dXJlLmpzXCI7XG5cbi8qIFx1MjUwMFx1MjUwMCBNb2R1bGUgaW1wb3J0cyAoZGVkdXBsaWNhdGVkIGZyb20gaW5saW5lIGNvcGllcykgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG5pbXBvcnQgeyBxdWVyeVNlbGVjdG9yQWxsRGVlcCwgZmluZEVsZW1lbnQsIGZpbmRJblNoYWRvd1Jvb3RzLCB3YWl0Rm9yRWxlbWVudCB9IGZyb20gXCIuL3V0aWxzL2RvbS5qc1wiO1xuaW1wb3J0IHsgY2FwaXRhbGl6ZSwgbm9ybWFsaXplUGhvbmUsIGZvcm1hdE9wdGljYWxWYWx1ZSwgZGV0ZWN0T3B0aWNhbEZvcm1hdCwgbm9ybWFsaXplRGF0ZVZhbHVlLCBmaWVsZEhhc1ZhbHVlIH0gZnJvbSBcIi4vdXRpbHMvZm9ybWF0LmpzXCI7XG5pbXBvcnQgeyBwcmVDYWNoZUxhYmVsTWFwLCBjbGVhck1hdGNoaW5nQ2FjaGUsIGdldEZpZWxkTGFiZWwsIG5vcm1hbGl6ZUxhYmVsLCBub3JtYWxpemVBbGlhcywgc2NvcmVGaWVsZE1hdGNoLCBtYXRjaFNtYXJ0RmllbGQsIGxldmVuc2h0ZWluLCBsb2FkTGVhcm5lZFdlaWdodHMgfSBmcm9tIFwiLi91dGlscy9maWVsZC1tYXRjaGluZy5qc1wiO1xuaW1wb3J0IHsgZ2V0Q2FjaGVkU2VsZWN0b3IsIHNldENhY2hlZFNlbGVjdG9yLCBsb2FkU2VsZWN0b3JDYWNoZSwgc2F2ZVNlbGVjdG9yQ2FjaGUgfSBmcm9tIFwiLi91dGlscy9zZWxlY3Rvci1jYWNoZS5qc1wiO1xuaW1wb3J0IHsgZ2V0U21hcnRGaWxsRGF0YSwgZ2V0Q2FjaGVkQ2xpZW50LCBnZXRWaXNpYmxlRmllbGRzLCBkZXRlY3RQYWdlQ29udGV4dCB9IGZyb20gXCIuL3V0aWxzL2RhdGEuanNcIjtcbmltcG9ydCB7IHVsdHJhRmlsbCwgc21hcnRGaWxsRmllbGQsIHNtYXJ0U2VsZWN0T3B0aW9uLCBmaWxsRGF0ZVBpY2tlciwgc2VsZWN0UmFkaXhPcHRpb24gfSBmcm9tIFwiLi91dGlscy9maWxsLmpzXCI7XG5pbXBvcnQgeyBwZXJmb3JtU21hcnRGaWxsIH0gZnJvbSBcIi4vc21hcnQtZmlsbC9pbmRleC5qc1wiO1xuaW1wb3J0IHsgbWFya0ZpbGxlZEJ5T3B0aUJvdCwgc2VuZExlYXJuaW5nU2lnbmFsIH0gZnJvbSBcIi4vc21hcnQtZmlsbC9sZWFybmluZy5qc1wiO1xuaW1wb3J0IHsgcGVyZm9ybUZpbGwgfSBmcm9tIFwiLi9zdGFuZGFyZC1maWxsL2luZGV4LmpzXCI7XG5pbXBvcnQgeyBzdGFydFJlcGxheSwgcnVuU3RlcCwgcmVzb2x2ZVZhcmlhYmxlcywgdHJ5RHluYW1pY1JlcGxheSwgcmVwbGF5U3RhdGUsIHNldFJlcGxheVN0YXRlIH0gZnJvbSBcIi4vcmVwbGF5L2luZGV4LmpzXCI7XG5pbXBvcnQgeyBjaGVja0FuZFN0YXJ0UlBBIH0gZnJvbSBcIi4vcnBhL2luZGV4LmpzXCI7XG4vKiBpbXBvcnQgeyBpbml0IH0gZnJvbSBcIi4vdWkvaW5pdC5qc1wiOyBcdTIwMTQga2VwdCBpbmxpbmUgYXMgaW5pdExvY2FsKCkgc2luY2UgaXQgcmVmZXJlbmNlcyBtYW55IGxvY2FsIGZ1bmN0aW9ucyAqL1xuXG4vKiBcdTI1MDBcdTI1MDAgUGFyY291cnMgRHluYW1pcXVlcyBEQiBcdTIxOTIgQ09ORklHUyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cblxuZnVuY3Rpb24gbG9hZER5bmFtaWNQYXJjb3VycygpIHtcbiAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFsnb3B0aWJvdF9keW5hbWljX3BhcmNvdXJzJywgJ29wdGlib3RfYXV0aCddLCBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICB2YXIgYXV0aCA9IHJlc3VsdC5vcHRpYm90X2F1dGggfHwge307XG4gICAgaWYgKCFhdXRoLnN5bmNUb2tlbikgcmV0dXJuO1xuICAgIHZhciBjYWNoZWQgPSByZXN1bHQub3B0aWJvdF9keW5hbWljX3BhcmNvdXJzO1xuICAgIC8qIFV0aWxpc2VyIGxlIGNhY2hlIHNpIG1vaW5zIGRlIDMwIG1pbiAqL1xuICAgIGlmIChjYWNoZWQgJiYgY2FjaGVkLnRzICYmIERhdGUubm93KCkgLSBjYWNoZWQudHMgPCAxODAwMDAwKSB7XG4gICAgICBpbmplY3REeW5hbWljUGFyY291cnMoY2FjaGVkLmhhbmRsZXJzKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZmV0Y2goXCJodHRwczovL29wdGlib3QuZnIvYXBpL2V4dGVuc2lvbi9wYXJjb3Vycz9oYW5kbGVycz10cnVlXCIsIHtcbiAgICAgIGhlYWRlcnM6IHsgXCJBdXRob3JpemF0aW9uXCI6IFwiQmVhcmVyIFwiICsgYXV0aC5zeW5jVG9rZW4gfVxuICAgIH0pXG4gICAgLnRoZW4oZnVuY3Rpb24ocikgeyByZXR1cm4gci5qc29uKCk7IH0pXG4gICAgLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHtcbiAgICAgICAgb3B0aWJvdF9keW5hbWljX3BhcmNvdXJzOiB7IGhhbmRsZXJzOiBkYXRhLmhhbmRsZXJzLCB0czogRGF0ZS5ub3coKSB9XG4gICAgICB9KTtcbiAgICAgIGluamVjdER5bmFtaWNQYXJjb3VycyhkYXRhLmhhbmRsZXJzKTtcbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbihlcnIpIHsgY29uc29sZS53YXJuKFwiW09wdGlCb3RdIGR5bmFtaWMgcGFyY291cnMgZmV0Y2ggZmFpbGVkOlwiLCBlcnIpOyB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGluamVjdER5bmFtaWNQYXJjb3VycyhoYW5kbGVycykge1xuICBpZiAoIUFycmF5LmlzQXJyYXkoaGFuZGxlcnMpKSByZXR1cm47XG4gIGhhbmRsZXJzLmZvckVhY2goZnVuY3Rpb24oaCkge1xuICAgIGlmICghaC5ob3N0bmFtZSkgcmV0dXJuO1xuICAgIC8qIE5lIHBhcyBcdTAwRTljcmFzZXIgbGVzIGNvbmZpZ3MgaGFyZGNvZFx1MDBFOWVzICovXG4gICAgdmFyIGFscmVhZHlFeGlzdHMgPSBPYmplY3QudmFsdWVzKENPTkZJR1MpLnNvbWUoZnVuY3Rpb24oY2ZnKSB7XG4gICAgICByZXR1cm4gY2ZnLmlzTWF0Y2ggJiYgY2ZnLmlzTWF0Y2goKSAmJiB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUuaW5jbHVkZXMoaC5ob3N0bmFtZSk7XG4gICAgfSk7XG4gICAgaWYgKENPTkZJR1NbaC5ob3N0bmFtZV0gfHwgYWxyZWFkeUV4aXN0cykgcmV0dXJuO1xuXG4gICAgLyogQ3JcdTAwRTllciBsZSBoYW5kbGVyIGR5bmFtaXF1ZSBkZXB1aXMgbGVzIFx1MDBFOXRhcGVzIEpTT04gKHNhbnMgZXZhbCkgKi9cbiAgICB2YXIgZXRhcGVzID0gaC5ldGFwZXMgfHwgW107XG4gICAgQ09ORklHU1toLmhvc3RuYW1lXSA9IHtcbiAgICAgIG5hbWU6IGgubm9tIHx8IGguaG9zdG5hbWUsXG4gICAgICBpc01hdGNoOiAoZnVuY3Rpb24oaG9zdG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkgeyByZXR1cm4gd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLmluY2x1ZGVzKGhvc3RuYW1lKTsgfTtcbiAgICAgIH0pKGguaG9zdG5hbWUpLFxuICAgICAgYWN0aW9uczoge1xuICAgICAgICBmb3JtdWxhaXJlOiAoZnVuY3Rpb24oZXRhcGVzTGlzdCkge1xuICAgICAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAvKiBSZWpvdWVyIGxlcyBcdTAwRTl0YXBlcyBmaWxsIGVuIHV0aWxpc2FudCBsZSBtb3RldXIgdWx0cmFGaWxsIGV4aXN0YW50ICovXG4gICAgICAgICAgICBpZiAoIWV0YXBlc0xpc3QgfHwgZXRhcGVzTGlzdC5sZW5ndGggPT09IDApIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIHZhciBmaWxsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHZhciBjYWNoZSA9IGRhdGEuY2FjaGVkIHx8IHt9O1xuICAgICAgICAgICAgdmFyIG0gPSBkYXRhLm0gfHwge307XG4gICAgICAgICAgICB2YXIgbyA9IGRhdGEubyB8fCB7fTtcbiAgICAgICAgICAgIHZhciBwZXJzb25uZXMgPSBtLnBlcnNvbm5lcyB8fCBbXTtcbiAgICAgICAgICAgIHZhciBwMCA9IHBlcnNvbm5lcy5sZW5ndGggPiAwID8gcGVyc29ubmVzWzBdIDoge307XG5cbiAgICAgICAgICAgIC8qIENvbnN0cnVpcmUgbGUgZGljdGlvbm5haXJlIGRlIHZhbGV1cnMgcGF0aWVudCAqL1xuICAgICAgICAgICAgdmFyIHZhcnMgPSB7XG4gICAgICAgICAgICAgIFwie3tuc3N9fVwiOiBnZXRPdXZyYW50RHJvaXROU1MobS5udW1lcm9TZWN1cml0ZVNvY2lhbGUgfHwgXCJcIiwgbS5kYXRlTmFpc3NhbmNlIHx8IFwiXCIsIHBlcnNvbm5lcykucmVwbGFjZSgvXFxEL2csIFwiXCIpLFxuICAgICAgICAgICAgICBcInt7bm9tfX1cIjogKG0ubm9tIHx8IHAwLm5vbSB8fCBvLm5vbVBhdGllbnQgfHwgY2FjaGUubm9tIHx8IFwiXCIpLnRvVXBwZXJDYXNlKCksXG4gICAgICAgICAgICAgIFwie3twcmVub219fVwiOiBjYXBpdGFsaXplKG0ucHJlbm9tIHx8IHAwLnByZW5vbSB8fCBvLnByZW5vbVBhdGllbnQgfHwgY2FjaGUucHJlbm9tIHx8IFwiXCIpLFxuICAgICAgICAgICAgICBcInt7ZGF0ZU5haXNzYW5jZX19XCI6IG0uZGF0ZU5haXNzYW5jZSB8fCBvLmRhdGVOYWlzc2FuY2VQYXRpZW50IHx8IGNhY2hlLmRvYiB8fCBcIlwiLFxuICAgICAgICAgICAgICBcInt7ZGF0ZU9yZG9ubmFuY2V9fVwiOiBvLmRhdGVPcmRvbm5hbmNlIHx8IChjYWNoZS5wcmVzY3JpcHRpb24gJiYgY2FjaGUucHJlc2NyaXB0aW9uLmRhdGVQcmVzY3JpcHRpb24pIHx8IFwiXCIsXG4gICAgICAgICAgICAgIFwie3tudW1lcm9BZGhlcmVudH19XCI6IG0ubnVtZXJvQWRoZXJlbnQgfHwgY2FjaGUubnVtZXJvQWRoZXJlbnQgfHwgXCJcIixcbiAgICAgICAgICAgICAgXCJ7e29yZ2FuaXNtZX19XCI6IG0ub3JnYW5pc21lIHx8IGNhY2hlLm9yZ2FuaXNtZSB8fCBcIlwiLFxuICAgICAgICAgICAgICBcInt7c3BoZXJlX29kfX1cIjogKG8ubHVuZXR0ZXNPRCAmJiBvLmx1bmV0dGVzT0Quc3BoZXJlKSB8fCBcIlwiLFxuICAgICAgICAgICAgICBcInt7c3BoZXJlX29nfX1cIjogKG8ubHVuZXR0ZXNPRyAmJiBvLmx1bmV0dGVzT0cuc3BoZXJlKSB8fCBcIlwiLFxuICAgICAgICAgICAgICBcInt7Y3lsaW5kcmVfb2R9fVwiOiAoby5sdW5ldHRlc09EICYmIG8ubHVuZXR0ZXNPRC5jeWxpbmRyZSkgfHwgXCJcIixcbiAgICAgICAgICAgICAgXCJ7e2N5bGluZHJlX29nfX1cIjogKG8ubHVuZXR0ZXNPRyAmJiBvLmx1bmV0dGVzT0cuY3lsaW5kcmUpIHx8IFwiXCIsXG4gICAgICAgICAgICAgIFwie3theGVfb2R9fVwiOiAoby5sdW5ldHRlc09EICYmIG8ubHVuZXR0ZXNPRC5heGUpIHx8IFwiXCIsXG4gICAgICAgICAgICAgIFwie3theGVfb2d9fVwiOiAoby5sdW5ldHRlc09HICYmIG8ubHVuZXR0ZXNPRy5heGUpIHx8IFwiXCIsXG4gICAgICAgICAgICAgIFwie3thZGRpdGlvbn19XCI6IChvLmx1bmV0dGVzT0QgJiYgby5sdW5ldHRlc09ELmFkZGl0aW9uKSB8fCAoby5sdW5ldHRlc09HICYmIG8ubHVuZXR0ZXNPRy5hZGRpdGlvbikgfHwgXCJcIixcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGV0YXBlc0xpc3QuZm9yRWFjaChmdW5jdGlvbihldGFwZSkge1xuICAgICAgICAgICAgICBpZiAoZXRhcGUuYWN0aW9uICE9PSBcImZpbGxcIiAmJiBldGFwZS5hY3Rpb24gIT09IFwiY2xpY2tcIiAmJiBldGFwZS5hY3Rpb24gIT09IFwic2VsZWN0XCIpIHJldHVybjtcbiAgICAgICAgICAgICAgdmFyIHNlbGVjdG9ycyA9IGV0YXBlLnNlbGVjdG9ycyB8fCAoZXRhcGUuc2VsZWN0b3IgPyBbZXRhcGUuc2VsZWN0b3JdIDogW10pO1xuICAgICAgICAgICAgICBpZiAoc2VsZWN0b3JzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgIC8qIFRyb3V2ZXIgbCdcdTAwRTlsXHUwMEU5bWVudCB2aWEgbGVzIHNcdTAwRTlsZWN0ZXVycyBmYWxsYmFjayAqL1xuICAgICAgICAgICAgICB2YXIgZWwgPSBudWxsO1xuICAgICAgICAgICAgICBmb3IgKHZhciBzaSA9IDA7IHNpIDwgc2VsZWN0b3JzLmxlbmd0aDsgc2krKykge1xuICAgICAgICAgICAgICAgIGVsID0gZmluZEVsZW1lbnQoc2VsZWN0b3JzW3NpXSk7XG4gICAgICAgICAgICAgICAgaWYgKGVsKSBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoIWVsKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgaWYgKGV0YXBlLmFjdGlvbiA9PT0gXCJjbGlja1wiKSB7XG4gICAgICAgICAgICAgICAgZWwuY2xpY2soKTtcbiAgICAgICAgICAgICAgICBmaWxsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8qIFJcdTAwRTlzb3VkcmUgbGEgdmFyaWFibGUgKi9cbiAgICAgICAgICAgICAgdmFyIHZhbHVlID0gZXRhcGUudmFyaWFibGUgPyAodmFyc1tldGFwZS52YXJpYWJsZV0gfHwgXCJcIikgOiBcIlwiO1xuICAgICAgICAgICAgICBpZiAoIXZhbHVlKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgaWYgKGV0YXBlLmFjdGlvbiA9PT0gXCJzZWxlY3RcIikge1xuICAgICAgICAgICAgICAgIHNtYXJ0U2VsZWN0T3B0aW9uKGVsLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgZmlsbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB1bHRyYUZpbGwoZWwsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBmaWxsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIGZpbGxlZDtcbiAgICAgICAgICB9O1xuICAgICAgICB9KShldGFwZXMpLFxuICAgICAgICBzeW5jaHJvbmlzZXI6IGZ1bmN0aW9uKCkgeyByZXR1cm4gZmFsc2U7IH1cbiAgICAgIH1cbiAgICB9O1xuICB9KTtcbn1cblxuLyogQ2hhcmdlciBsZXMgcGFyY291cnMgZHluYW1pcXVlcyBhdSBkXHUwMEU5bWFycmFnZSAqL1xubG9hZER5bmFtaWNQYXJjb3VycygpO1xuXG4vKiBcdTI1MDBcdTI1MDAgRm9uY3Rpb25zIFV0aWxpdGFpcmVzIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuXG5mdW5jdGlvbiB2YWxpZGF0ZUx1aG5OU1MobnNzKSB7XG4gIHZhciBkaWdpdHMgPSBuc3MucmVwbGFjZSgvXFxEL2csIFwiXCIpO1xuICBpZiAoZGlnaXRzLmxlbmd0aCA8IDEzKSByZXR1cm4gZmFsc2U7XG4gIHZhciBuID0gZGlnaXRzLnNsaWNlKDAsIDEzKS5yZXBsYWNlKC8yQS9pLCBcIjE5XCIpLnJlcGxhY2UoLzJCL2ksIFwiMThcIik7XG4gIHZhciBudW0gPSBwYXJzZUludChuLCAxMCk7XG4gIGlmIChpc05hTihudW0pKSByZXR1cm4gZmFsc2U7XG4gIGlmIChkaWdpdHMubGVuZ3RoID49IDE1KSB7XG4gICAgdmFyIGNsZSA9IHBhcnNlSW50KGRpZ2l0cy5zbGljZSgxMywgMTUpLCAxMCk7XG4gICAgcmV0dXJuICg5NyAtIChudW0gJSA5NykpID09PSBjbGU7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qIFx1MjUwMFx1MjUwMCBjaGVja0Ryb2l0c011dHVlbGxlIFx1MjAxNCBhbGVydGUgc2kgZHJvaXRzIGV4cGlyXHUwMEU5cyBvdSBiaWVudFx1MDBGNHQgZXhwaXJcdTAwRTlzIFx1MjUwMFx1MjUwMCAqL1xuZnVuY3Rpb24gY2hlY2tEcm9pdHNNdXR1ZWxsZShkYXRhKSB7XG4gIHZhciBtID0gZGF0YS5tIHx8IGRhdGEgfHwge307XG4gIHZhciBkYXRlRmluID0gbS5kYXRlRmluVmFsaWRpdGUgfHwgXCJcIjtcbiAgdmFyIGRhdGVEZWJ1dCA9IG0uZGF0ZURlYnV0VmFsaWRpdGUgfHwgXCJcIjtcbiAgdmFyIHRvZGF5ID0gbmV3IERhdGUoKTtcbiAgdG9kYXkuc2V0SG91cnMoMCwgMCwgMCwgMCk7XG5cbiAgaWYgKGRhdGVGaW4pIHtcbiAgICB2YXIgcGFydHMgPSBkYXRlRmluLm1hdGNoKC8oXFxkezJ9KVtcXC9cXC1dKFxcZHsyfSlbXFwvXFwtXShcXGR7NH0pLyk7XG4gICAgaWYgKHBhcnRzKSB7XG4gICAgICB2YXIgZmluRGF0ZSA9IG5ldyBEYXRlKHBhcnNlSW50KHBhcnRzWzNdKSwgcGFyc2VJbnQocGFydHNbMl0pIC0gMSwgcGFyc2VJbnQocGFydHNbMV0pKTtcbiAgICAgIGlmIChmaW5EYXRlIDwgdG9kYXkpIHtcbiAgICAgICAgc2hvd1JQQVRvYXN0KFwiXHUyNkQ0IERyb2l0cyBtdXR1ZWxsZSBleHBpclx1MDBFOXMgZGVwdWlzIGxlIFwiICsgZGF0ZUZpbiwgXCJlcnJvclwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyIGRpZmZEYXlzID0gTWF0aC5jZWlsKChmaW5EYXRlIC0gdG9kYXkpIC8gKDEwMDAgKiA2MCAqIDYwICogMjQpKTtcbiAgICAgIGlmIChkaWZmRGF5cyA8PSAzMCkge1xuICAgICAgICBzaG93UlBBVG9hc3QoXCJcdTI2QTBcdUZFMEYgRHJvaXRzIG11dHVlbGxlIGV4cGlyZW50IGRhbnMgXCIgKyBkaWZmRGF5cyArIFwiIGpvdXJcIiArIChkaWZmRGF5cyA+IDEgPyBcInNcIiA6IFwiXCIpICsgXCIgKFwiICsgZGF0ZUZpbiArIFwiKVwiLCBcIndhcm5pbmdcIik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoZGF0ZURlYnV0KSB7XG4gICAgdmFyIHBhcnRzRCA9IGRhdGVEZWJ1dC5tYXRjaCgvKFxcZHsyfSlbXFwvXFwtXShcXGR7Mn0pW1xcL1xcLV0oXFxkezR9KS8pO1xuICAgIGlmIChwYXJ0c0QpIHtcbiAgICAgIHZhciBkZWJ1dERhdGUgPSBuZXcgRGF0ZShwYXJzZUludChwYXJ0c0RbM10pLCBwYXJzZUludChwYXJ0c0RbMl0pIC0gMSwgcGFyc2VJbnQocGFydHNEWzFdKSk7XG4gICAgICBpZiAoZGVidXREYXRlID4gdG9kYXkpIHtcbiAgICAgICAgc2hvd1JQQVRvYXN0KFwiXHUyNkEwXHVGRTBGIERyb2l0cyBtdXR1ZWxsZSBwYXMgZW5jb3JlIGFjdGlmcyAoZFx1MDBFOWJ1dCA6IFwiICsgZGF0ZURlYnV0ICsgXCIpXCIsIFwid2FybmluZ1wiKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBQb3VyIHVuIG1pbmV1ciwgcmV0b3VybmUgbGUgTlNTIGRlIGwnb3V2cmFudCBkcm9pdCAobVx1MDBFOHJlIGVuIHByaW9yaXRcdTAwRTkgPSBOU1MgY29tbWVuXHUwMEU3YW50IHBhciAyKS5cbiAqIFNpIGxlIGJcdTAwRTluXHUwMEU5ZmljaWFpcmUgZXN0IG1hamV1ciwgcmV0b3VybmUgc29uIHByb3ByZSBOU1MuXG4gKi9cbmZ1bmN0aW9uIGdldE91dnJhbnREcm9pdE5TUyhiZW5lZmljaWFpcmVOU1MsIGJlbmVmaWNpYWlyZURPQiwgcGVyc29ubmVzKSB7XG4gIGlmICghcGVyc29ubmVzIHx8IHBlcnNvbm5lcy5sZW5ndGggPD0gMSkgcmV0dXJuIGJlbmVmaWNpYWlyZU5TUztcbiAgaWYgKCFiZW5lZmljaWFpcmVET0IgfHwgIWlzVW5kZXIxOChiZW5lZmljaWFpcmVET0IpKSByZXR1cm4gYmVuZWZpY2lhaXJlTlNTO1xuXG4gIC8qIENoZXJjaGVyIGxhIG1cdTAwRThyZSAoTlNTIGNvbW1lbmNlIHBhciAyLCBtYWpldXJlKSAqL1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHBlcnNvbm5lcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBwID0gcGVyc29ubmVzW2ldO1xuICAgIHZhciBwTlNTID0gKHAubnVtZXJvU2VjdXJpdGVTb2NpYWxlIHx8IFwiXCIpLnJlcGxhY2UoL1xcRC9nLCBcIlwiKTtcbiAgICBpZiAocE5TUy5zdGFydHNXaXRoKFwiMlwiKSAmJiBwTlNTLmxlbmd0aCA+PSAxMyAmJiBwLmRhdGVOYWlzc2FuY2UgJiYgIWlzVW5kZXIxOChwLmRhdGVOYWlzc2FuY2UpKSB7XG4gICAgICByZXR1cm4gcC5udW1lcm9TZWN1cml0ZVNvY2lhbGU7XG4gICAgfVxuICB9XG4gIC8qIEZhbGxiYWNrIDogcHJlbWllciBhZHVsdGUgYXZlYyB1biBOU1MgdmFsaWRlICovXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcGVyc29ubmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHAgPSBwZXJzb25uZXNbaV07XG4gICAgdmFyIHBOU1MgPSAocC5udW1lcm9TZWN1cml0ZVNvY2lhbGUgfHwgXCJcIikucmVwbGFjZSgvXFxEL2csIFwiXCIpO1xuICAgIGlmIChwTlNTLmxlbmd0aCA+PSAxMyAmJiBwLmRhdGVOYWlzc2FuY2UgJiYgIWlzVW5kZXIxOChwLmRhdGVOYWlzc2FuY2UpKSB7XG4gICAgICByZXR1cm4gcC5udW1lcm9TZWN1cml0ZVNvY2lhbGU7XG4gICAgfVxuICB9XG4gIHJldHVybiBiZW5lZmljaWFpcmVOU1M7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZXIxOChkb2IpIHtcbiAgLyogQWNjZXB0ZSBERC9NTS9ZWVlZIG91IFlZWVktTU0tREQgKi9cbiAgbGV0IGQ7XG4gIGlmIChkb2IuaW5jbHVkZXMoXCIvXCIpKSB7XG4gICAgY29uc3QgcCA9IGRvYi5zcGxpdChcIi9cIik7XG4gICAgZCA9IG5ldyBEYXRlKHBbMl0sIHBbMV0gLSAxLCBwWzBdKTtcbiAgfSBlbHNlIHtcbiAgICBkID0gbmV3IERhdGUoZG9iKTtcbiAgfVxuICBpZiAoaXNOYU4oZC5nZXRUaW1lKCkpKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IGFnZSA9IChEYXRlLm5vdygpIC0gZC5nZXRUaW1lKCkpIC8gKDM2NS4yNSAqIDI0ICogNjAgKiA2MCAqIDEwMDApO1xuICByZXR1cm4gYWdlIDwgMTg7XG59XG5cbmZ1bmN0aW9uIHNob3dTeW5jQnV0dG9uKCkge1xuICBpZiAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29wdGlib3Qtc3luYy1idG4nKSkgcmV0dXJuO1xuICBjb25zdCBidG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgYnRuLnR5cGUgPSAnYnV0dG9uJztcbiAgYnRuLmlkID0gJ29wdGlib3Qtc3luYy1idG4nO1xuICBidG4uaW5uZXJUZXh0ID0gJ1x1RDgzRFx1RENCRSBNXHUwMEU5bW9yaXNlcic7XG4gIGJ0bi5zdHlsZS5jc3NUZXh0ID0gYFxuICAgIHBvc2l0aW9uOiBmaXhlZDsgYm90dG9tOiA4MHB4OyByaWdodDogMjBweDsgei1pbmRleDogOTk5OTk5O1xuICAgIGJhY2tncm91bmQ6ICM4YjVjZjY7IGNvbG9yOiB3aGl0ZTsgYm9yZGVyOiBub25lOyBwYWRkaW5nOiAxMnB4IDIwcHg7XG4gICAgYm9yZGVyLXJhZGl1czogNTBweDsgZm9udC13ZWlnaHQ6IGJvbGQ7IGN1cnNvcjogcG9pbnRlcjtcbiAgICBib3gtc2hhZG93OiAwIDRweCAxNXB4IHJnYmEoMCwwLDAsMC4yKTsgZm9udC1mYW1pbHk6IHNhbnMtc2VyaWY7XG4gICAgdHJhbnNpdGlvbjogYWxsIDAuMnM7XG4gIGA7XG4gIGJ0bi5vbmNsaWNrID0gYXN5bmMgKCkgPT4ge1xuICAgIGJ0bi5pbm5lclRleHQgPSAnXHUyM0YzIEVuIGNvdXJzLi4uJztcbiAgICBjb25zdCBjdXJyZW50U2l0ZSA9IE9iamVjdC52YWx1ZXMoQ09ORklHUykuZmluZChjZmcgPT4gY2ZnLmlzTWF0Y2goKSk7XG4gICAgY29uc3Qgc3VjY2VzcyA9IGF3YWl0IGN1cnJlbnRTaXRlLmFjdGlvbnMuc3luY2hyb25pc2VyKCk7XG4gICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgIGJ0bi5pbm5lclRleHQgPSAnXHUyNzA1IENsaWVudCBtXHUwMEU5bW9yaXNcdTAwRTkgISc7XG4gICAgICBidG4uc3R5bGUuYmFja2dyb3VuZCA9ICcjMTBiOTgxJztcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBidG4uaW5uZXJUZXh0ID0gJ1x1RDgzRFx1RENCRSBNXHUwMEU5bW9yaXNlcic7XG4gICAgICAgIGJ0bi5zdHlsZS5iYWNrZ3JvdW5kID0gJyM4YjVjZjYnO1xuICAgICAgfSwgMjAwMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJ0bi5pbm5lclRleHQgPSAnXHUyNzRDIEZvcm11bGFpcmUgdmlkZSc7XG4gICAgICBidG4uc3R5bGUuYmFja2dyb3VuZCA9ICcjZWY0NDQ0JztcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBidG4uaW5uZXJUZXh0ID0gJ1x1RDgzRFx1RENCRSBNXHUwMEU5bW9yaXNlcic7XG4gICAgICAgIGJ0bi5zdHlsZS5iYWNrZ3JvdW5kID0gJyM4YjVjZjYnO1xuICAgICAgfSwgMjAwMCk7XG4gICAgfVxuICB9O1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGJ0bik7XG59XG5cbi8vIFx1MjUwMFx1MjUwMCBTeW5jIFRQIGRlcHVpcyBMQk8gXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbmZ1bmN0aW9uIHNjcmFwZVRQVGFibGUoKSB7XG4gIHZhciB0YWJsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNncmlkX3BvaW50YWdlX3RpZXJzX3BheWFudCB0Ym9keScpO1xuICBpZiAoIXRhYmxlKSByZXR1cm4gW107XG4gIHZhciByb3dzID0gdGFibGUucXVlcnlTZWxlY3RvckFsbCgndHInKTtcbiAgdmFyIGRvc3NpZXJzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcm93cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciB0ciA9IHJvd3NbaV07XG4gICAgdmFyIHRkcyA9IHRyLnF1ZXJ5U2VsZWN0b3JBbGwoJ3RkJyk7XG4gICAgaWYgKHRkcy5sZW5ndGggPCA5KSBjb250aW51ZTtcblxuICAgIHZhciBkYXRlID0gKHRkc1swXS50ZXh0Q29udGVudCB8fCBcIlwiKS50cmltKCk7XG4gICAgdmFyIG1vZGVFbCA9IHRkc1sxXS5xdWVyeVNlbGVjdG9yKCcubGFiZWwnKTtcbiAgICB2YXIgbW9kZSA9IG1vZGVFbCA/IChtb2RlRWwudGV4dENvbnRlbnQgfHwgXCJcIikudHJpbSgpIDogXCJcIjtcbiAgICB2YXIgbnVtRlNFID0gKHRkc1syXS50ZXh0Q29udGVudCB8fCBcIlwiKS50cmltKCk7XG5cbiAgICB2YXIgb3JnVHlwZUVsID0gdGRzWzNdLnF1ZXJ5U2VsZWN0b3IoJy5sYWJlbCcpO1xuICAgIHZhciBvcmdUeXBlID0gb3JnVHlwZUVsID8gKG9yZ1R5cGVFbC50ZXh0Q29udGVudCB8fCBcIlwiKS50cmltKCkgOiBcIlwiO1xuICAgIHZhciBvcmdhbmlzbWUgPSAodGRzWzNdLnRleHRDb250ZW50IHx8IFwiXCIpLnRyaW0oKS5yZXBsYWNlKC9eKFJPfFJDKVxccyovLCBcIlwiKTtcblxuICAgIHZhciBib3JkVGV4dCA9ICh0ZHNbNF0udGV4dENvbnRlbnQgfHwgXCJcIikudHJpbSgpO1xuICAgIHZhciBudW1Cb3JkZXJlYXUgPSBib3JkVGV4dC5yZXBsYWNlKC9eKEJvcmRcXC5cXHMqTlx1MDBCMHxMb3RcXHMqTlx1MDBCMClcXHMqL2ksIFwiXCIpLnRyaW0oKTtcblxuICAgIC8qIFBBUyBERSBOT00gQ0xJRU5UIFx1MjAxNCBvbiBza2lwIHRkc1s1XSAqL1xuXG4gICAgdmFyIG1vbnRhbnRUZXh0ID0gKHRkc1s2XS50ZXh0Q29udGVudCB8fCBcIlwiKS5yZXBsYWNlKC9bXlxcZCwuLV0vZywgXCJcIikucmVwbGFjZShcIixcIiwgXCIuXCIpLnRyaW0oKTtcbiAgICB2YXIgbW9udGFudCA9IHBhcnNlRmxvYXQobW9udGFudFRleHQpIHx8IDA7XG5cbiAgICB2YXIgc3RhdHV0RWwgPSB0ZHNbN10ucXVlcnlTZWxlY3RvcignLmxhYmVsLWRhbmdlcicpO1xuICAgIHZhciBzdGF0dXQgPSBzdGF0dXRFbCA/IFwiUmVqZXRcIiA6ICh0ZHNbN10udGV4dENvbnRlbnQgfHwgXCJcIikudHJpbSgpO1xuXG4gICAgdmFyIHJlbWFycXVlID0gKHRkc1s4XS50ZXh0Q29udGVudCB8fCBcIlwiKS50cmltKCk7XG5cbiAgICAvKiBJRHMgZGVwdWlzIGxlcyBkYXRhLWF0dHJpYnV0ZXMgZGVzIGJvdXRvbnMgZCdhY3Rpb24gKi9cbiAgICB2YXIgZW5jQnRuID0gdGRzWzldID8gdGRzWzldLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWJvcmRlcmVhdV9yZWdpbWVfZGV0YWlsX2lkXScpIDogbnVsbDtcbiAgICB2YXIgbGJvRGV0YWlsSWQgPSBlbmNCdG4gPyBlbmNCdG4uZ2V0QXR0cmlidXRlKCdkYXRhLWJvcmRlcmVhdV9yZWdpbWVfZGV0YWlsX2lkJykgOiBcIlwiO1xuXG4gICAgdmFyIHJlamV0QnRuID0gdGRzWzldID8gdGRzWzldLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLXJlamV0X25vZW1pX3R5cGVfaWRdJykgOiBudWxsO1xuICAgIHZhciByZWpldFR5cGVJZCA9IHJlamV0QnRuID8gcmVqZXRCdG4uZ2V0QXR0cmlidXRlKCdkYXRhLXJlamV0X25vZW1pX3R5cGVfaWQnKSA6IFwiXCI7XG5cbiAgICBkb3NzaWVycy5wdXNoKHtcbiAgICAgIGRhdGU6IGRhdGUsXG4gICAgICBtb2RlOiBtb2RlLFxuICAgICAgbnVtRlNFOiBudW1GU0UsXG4gICAgICB0eXBlOiBvcmdUeXBlLFxuICAgICAgb3JnYW5pc21lOiBvcmdhbmlzbWUsXG4gICAgICBudW1Cb3JkZXJlYXU6IG51bUJvcmRlcmVhdSxcbiAgICAgIG1vbnRhbnQ6IG1vbnRhbnQsXG4gICAgICBzdGF0dXQ6IHN0YXR1dCxcbiAgICAgIHJlbWFycXVlOiByZW1hcnF1ZSxcbiAgICAgIHJlamV0VHlwZUlkOiByZWpldFR5cGVJZCB8fCBcIlwiLFxuICAgICAgbGJvRGV0YWlsSWQ6IGxib0RldGFpbElkIHx8IFwiXCJcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gZG9zc2llcnM7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHN5bmNUUFRvT3B0aUJvdChidG4pIHtcbiAgYnRuLmlubmVyVGV4dCA9IFwiQ2hhcmdlbWVudC4uLlwiO1xuICBidG4uc3R5bGUuYmFja2dyb3VuZCA9IFwiIzYzNjZmMVwiO1xuXG4gIC8qIFBhc3NlciBsZSBEYXRhVGFibGUgZW4gMTAwIGxpZ25lcyBwb3VyIHRvdXQgclx1MDBFOWN1cFx1MDBFOXJlciAqL1xuICB2YXIgbGVuZ3RoU2VsZWN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2dyaWRfcG9pbnRhZ2VfdGllcnNfcGF5YW50X2xlbmd0aCBzZWxlY3QnKTtcbiAgdmFyIG9yaWdpbmFsTGVuZ3RoID0gbGVuZ3RoU2VsZWN0ID8gbGVuZ3RoU2VsZWN0LnZhbHVlIDogXCIxMFwiO1xuICBpZiAobGVuZ3RoU2VsZWN0ICYmIGxlbmd0aFNlbGVjdC52YWx1ZSAhPT0gXCIxMDBcIikge1xuICAgIGxlbmd0aFNlbGVjdC52YWx1ZSA9IFwiMTAwXCI7XG4gICAgbGVuZ3RoU2VsZWN0LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiY2hhbmdlXCIsIHsgYnViYmxlczogdHJ1ZSB9KSk7XG4gICAgYXdhaXQgbmV3IFByb21pc2UoZnVuY3Rpb24ocikgeyBzZXRUaW1lb3V0KHIsIDIwMDApOyB9KTtcbiAgfVxuXG4gIHZhciBhbGxEb3NzaWVycyA9IFtdO1xuICB2YXIgbWF4UGFnZXMgPSAyMDtcbiAgdmFyIHBhZ2UgPSAwO1xuXG4gIHdoaWxlIChwYWdlIDwgbWF4UGFnZXMpIHtcbiAgICBidG4uaW5uZXJUZXh0ID0gXCJQYWdlIFwiICsgKHBhZ2UgKyAxKSArIFwiLi4uXCI7XG4gICAgdmFyIGJhdGNoID0gc2NyYXBlVFBUYWJsZSgpO1xuICAgIGlmIChiYXRjaC5sZW5ndGggPT09IDApIGJyZWFrO1xuICAgIGFsbERvc3NpZXJzID0gYWxsRG9zc2llcnMuY29uY2F0KGJhdGNoKTtcblxuICAgIHZhciBuZXh0QnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2dyaWRfcG9pbnRhZ2VfdGllcnNfcGF5YW50X25leHQ6bm90KC5kaXNhYmxlZCknKTtcbiAgICBpZiAoIW5leHRCdG4pIGJyZWFrO1xuICAgIG5leHRCdG4ucXVlcnlTZWxlY3RvcignYScpLmNsaWNrKCk7XG4gICAgYXdhaXQgbmV3IFByb21pc2UoZnVuY3Rpb24ocikgeyBzZXRUaW1lb3V0KHIsIDE1MDApOyB9KTtcbiAgICBwYWdlKys7XG4gIH1cblxuICAvKiBSZXZlbmlyIFx1MDBFMCBsYSBwcmVtaVx1MDBFOHJlIHBhZ2UgKi9cbiAgdmFyIGZpcnN0UGFnZUJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNncmlkX3BvaW50YWdlX3RpZXJzX3BheWFudF9wYWdpbmF0ZSAucGFnaW5hdGVfYnV0dG9uOm50aC1jaGlsZCgyKSBhJyk7XG4gIGlmIChmaXJzdFBhZ2VCdG4pIGZpcnN0UGFnZUJ0bi5jbGljaygpO1xuXG4gIC8qIFJlc3RhdXJlciBsZSBub21icmUgZGUgbGlnbmVzICovXG4gIGlmIChsZW5ndGhTZWxlY3QgJiYgb3JpZ2luYWxMZW5ndGggIT09IFwiMTAwXCIpIHtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgbGVuZ3RoU2VsZWN0LnZhbHVlID0gb3JpZ2luYWxMZW5ndGg7XG4gICAgICBsZW5ndGhTZWxlY3QuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJjaGFuZ2VcIiwgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgICB9LCA1MDApO1xuICB9XG5cbiAgaWYgKGFsbERvc3NpZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgIGJ0bi5pbm5lclRleHQgPSBcIkF1Y3VuIGRvc3NpZXJcIjtcbiAgICBidG4uc3R5bGUuYmFja2dyb3VuZCA9IFwiI2VmNDQ0NFwiO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IGJ0bi5pbm5lclRleHQgPSBcIlN5bmMgVFBcIjsgYnRuLnN0eWxlLmJhY2tncm91bmQgPSBcIiM2MzY2ZjFcIjsgfSwgMjAwMCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgYnRuLmlubmVyVGV4dCA9IFwiRW52b2kgXCIgKyBhbGxEb3NzaWVycy5sZW5ndGggKyBcIiBkb3NzaWVycy4uLlwiO1xuXG4gIC8qIFJcdTAwRTljdXBcdTAwRTlyZXIgbGUgc3luY1Rva2VuIGRlcHVpcyBvcHRpYm90X2F1dGggKHNvdXJjZSBkZSB2XHUwMEU5cml0XHUwMEU5KSAqL1xuICB2YXIgc3luY1Rva2VuID0gYXdhaXQgZ2V0U3luY1Rva2VuKCk7XG4gIGlmICghc3luY1Rva2VuKSB7XG4gICAgYnRuLmlubmVyVGV4dCA9IFwiQ29ubmVjdGV6LXZvdXMgc3VyIE9wdGlCb3RcIjtcbiAgICBidG4uc3R5bGUuYmFja2dyb3VuZCA9IFwiI2VmNDQ0NFwiO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IGJ0bi5pbm5lclRleHQgPSBcIlN5bmMgVFBcIjsgYnRuLnN0eWxlLmJhY2tncm91bmQgPSBcIiM2MzY2ZjFcIjsgfSwgMzAwMCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIChhc3luYyBmdW5jdGlvbigpIHtcblxuICAgIHRyeSB7XG4gICAgICB2YXIgcmVzcCA9IGF3YWl0IGZldGNoKFwiaHR0cHM6Ly9vcHRpYm90LmZyL2FwaS9leHRlbnNpb24vc3luYy10cFwiLCB7XG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBzeW5jVG9rZW46IHN5bmNUb2tlbiwgZG9zc2llcnM6IGFsbERvc3NpZXJzIH0pXG4gICAgICB9KTtcbiAgICAgIHZhciBkYXRhID0gYXdhaXQgcmVzcC5qc29uKCk7XG4gICAgICBpZiAoZGF0YS5zdWNjZXNzKSB7XG4gICAgICAgIGJ0bi5pbm5lclRleHQgPSBcIitcIiArIGRhdGEuY3JlYXRlZCArIFwiIC8gbWFqIFwiICsgZGF0YS51cGRhdGVkO1xuICAgICAgICBidG4uc3R5bGUuYmFja2dyb3VuZCA9IFwiIzEwYjk4MVwiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnRuLmlubmVyVGV4dCA9IGRhdGEuZXJyb3IgfHwgXCJFcnJldXJcIjtcbiAgICAgICAgYnRuLnN0eWxlLmJhY2tncm91bmQgPSBcIiNlZjQ0NDRcIjtcbiAgICAgIH1cbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIGJ0bi5pbm5lclRleHQgPSBcIkVycmV1ciByXHUwMEU5c2VhdVwiO1xuICAgICAgYnRuLnN0eWxlLmJhY2tncm91bmQgPSBcIiNlZjQ0NDRcIjtcbiAgICB9XG5cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBidG4uaW5uZXJUZXh0ID0gXCJTeW5jIFRQXCI7IGJ0bi5zdHlsZS5iYWNrZ3JvdW5kID0gXCIjNjM2NmYxXCI7IH0sIDMwMDApO1xuICB9KSgpO1xufVxuXG5mdW5jdGlvbiBzaG93U3luY1RQQnV0dG9uKCkge1xuICBpZiAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29wdGlib3Qtc3luYy10cC1idG4nKSkgcmV0dXJuO1xuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNncmlkX3BvaW50YWdlX3RpZXJzX3BheWFudCcpKSByZXR1cm47XG4gIHZhciBidG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgYnRuLnR5cGUgPSAnYnV0dG9uJztcbiAgYnRuLmlkID0gJ29wdGlib3Qtc3luYy10cC1idG4nO1xuICBidG4uaW5uZXJUZXh0ID0gJ1N5bmMgVFAnO1xuICBidG4uc3R5bGUuY3NzVGV4dCA9IFtcbiAgICAncG9zaXRpb246IGZpeGVkOyBib3R0b206IDE0MHB4OyByaWdodDogMjBweDsgei1pbmRleDogOTk5OTk5OycsXG4gICAgJ2JhY2tncm91bmQ6ICM2MzY2ZjE7IGNvbG9yOiB3aGl0ZTsgYm9yZGVyOiBub25lOyBwYWRkaW5nOiAxMnB4IDIwcHg7JyxcbiAgICAnYm9yZGVyLXJhZGl1czogNTBweDsgZm9udC13ZWlnaHQ6IGJvbGQ7IGN1cnNvcjogcG9pbnRlcjsnLFxuICAgICdib3gtc2hhZG93OiAwIDRweCAxNXB4IHJnYmEoMCwwLDAsMC4yKTsgZm9udC1mYW1pbHk6IHNhbnMtc2VyaWY7JyxcbiAgICAndHJhbnNpdGlvbjogYWxsIDAuMnM7J1xuICBdLmpvaW4oJycpO1xuICBidG4ub25jbGljayA9IGZ1bmN0aW9uKCkgeyBzeW5jVFBUb09wdGlCb3QoYnRuKTsgfTtcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChidG4pO1xufVxuXG4vLyBcdTI1MDBcdTI1MDAgUlBBIExvZ2dpbmcgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbmZ1bmN0aW9uIGxvZ1JQQShtdXR1ZWxsZSwgZXRhcGUsIHN0YXR1dCwgZXJyZXVyKSB7XG4gIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbXCJvcHRpYm90X2F1dGhcIl0sIGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgIHZhciBzeW5jVG9rZW4gPSAocmVzdWx0Lm9wdGlib3RfYXV0aCAmJiByZXN1bHQub3B0aWJvdF9hdXRoLnN5bmNUb2tlbikgfHwgbnVsbDtcbiAgICBmZXRjaChcImh0dHBzOi8vb3B0aWJvdC5mci9hcGkvZXh0ZW5zaW9uL3JwYS1sb2dcIiwge1xuICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgc3luY1Rva2VuOiBzeW5jVG9rZW4sXG4gICAgICAgIG11dHVlbGxlOiBtdXR1ZWxsZSxcbiAgICAgICAgZXRhcGU6IGV0YXBlLFxuICAgICAgICBzdGF0dXQ6IHN0YXR1dCxcbiAgICAgICAgZXJyZXVyOiBlcnJldXIgfHwgbnVsbCxcbiAgICAgICAgdXJsOiB3aW5kb3cubG9jYXRpb24uaHJlZlxuICAgICAgfSlcbiAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHsgY29uc29sZS53YXJuKFwiW09wdGlCb3RdIFJQQSBsb2cgZmFpbGVkOlwiLCBlcnIpOyB9KTsgLyogc2lsZW50IGZhaWwgKi9cbiAgfSk7XG59XG5cbi8vIFx1MjUwMFx1MjUwMCBSUEEgVG9hc3QgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbmZ1bmN0aW9uIHNob3dSUEFUb2FzdChtZXNzYWdlLCB0eXBlKSB7XG4gIHZhciBleGlzdGluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvcHRpYm90LXJwYS10b2FzdCcpO1xuICBpZiAoZXhpc3RpbmcpIGV4aXN0aW5nLnJlbW92ZSgpO1xuXG4gIHZhciBjb2xvcnMgPSB7XG4gICAgaW5mbzogeyBiZzogJyMyNTYzZWInLCBib3JkZXI6ICcjM2I4MmY2JyB9LFxuICAgIHN1Y2Nlc3M6IHsgYmc6ICcjMTBiOTgxJywgYm9yZGVyOiAnIzM0ZDM5OScgfSxcbiAgICB3YXJuaW5nOiB7IGJnOiAnI2Y1OWUwYicsIGJvcmRlcjogJyNmYmJmMjQnIH0sXG4gICAgZXJyb3I6IHsgYmc6ICcjZWY0NDQ0JywgYm9yZGVyOiAnI2Y4NzE3MScgfVxuICB9O1xuICB2YXIgYyA9IGNvbG9yc1t0eXBlXSB8fCBjb2xvcnMuaW5mbztcblxuICB2YXIgdG9hc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgdG9hc3QuaWQgPSAnb3B0aWJvdC1ycGEtdG9hc3QnO1xuICB0b2FzdC50ZXh0Q29udGVudCA9IG1lc3NhZ2U7XG4gIHRvYXN0LnN0eWxlLmNzc1RleHQgPSBbXG4gICAgJ3Bvc2l0aW9uOiBmaXhlZDsgYm90dG9tOiA4MHB4OyByaWdodDogMjBweDsgei1pbmRleDogOTk5OTk5OTsnLFxuICAgICdiYWNrZ3JvdW5kOiAnICsgYy5iZyArICc7IGNvbG9yOiB3aGl0ZTsgYm9yZGVyOiAycHggc29saWQgJyArIGMuYm9yZGVyICsgJzsnLFxuICAgICdwYWRkaW5nOiAxNHB4IDIycHg7IGJvcmRlci1yYWRpdXM6IDE0cHg7IGZvbnQtd2VpZ2h0OiA2MDA7IGZvbnQtc2l6ZTogMTNweDsnLFxuICAgICdmb250LWZhbWlseTogc2Fucy1zZXJpZjsgYm94LXNoYWRvdzogMCA4cHggMzBweCByZ2JhKDAsMCwwLDAuMjUpOycsXG4gICAgJ21heC13aWR0aDogMzYwcHg7IGxpbmUtaGVpZ2h0OiAxLjQ7IG9wYWNpdHk6IDA7IHRyYW5zaXRpb246IG9wYWNpdHkgMC4zczsnXG4gIF0uam9pbignJyk7XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodG9hc3QpO1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7IHRvYXN0LnN0eWxlLm9wYWNpdHkgPSAnMSc7IH0pO1xuXG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgdG9hc3Quc3R5bGUub3BhY2l0eSA9ICcwJztcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyB0b2FzdC5yZW1vdmUoKTsgfSwgMzAwKTtcbiAgfSwgNDAwMCk7XG59XG5cbi8qIFx1MjUwMFx1MjUwMCBpZnJhbWVzIGNyb3NzLWRvbWFpbiBwb3N0TWVzc2FnZSBsaXN0ZW5lciBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBmdW5jdGlvbihlKSB7XG4gIGlmICghZS5kYXRhIHx8IGUuZGF0YS50eXBlICE9PSBcIk9QVElCT1RfRklMTF9GUkFNRVwiIHx8ICFlLmRhdGEucGF5bG9hZCkgcmV0dXJuO1xuICAvKiBWYWxpZGVyIGwnb3JpZ2luZSA6IGFjY2VwdGVyIHNhbWUtb3JpZ2luICsgaWZyYW1lcyBlbmZhbnRzIGNvbm51ZXMgKi9cbiAgaWYgKGUub3JpZ2luICE9PSB3aW5kb3cubG9jYXRpb24ub3JpZ2luKSB7XG4gICAgdmFyIGlzS25vd25GcmFtZSA9IGZhbHNlO1xuICAgIHZhciBmcmFtZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiaWZyYW1lXCIpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZnJhbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoZnJhbWVzW2ldLnNyYyAmJiBuZXcgVVJMKGZyYW1lc1tpXS5zcmMpLm9yaWdpbiA9PT0gZS5vcmlnaW4pIHtcbiAgICAgICAgICBpc0tub3duRnJhbWUgPSB0cnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoKGVycikge31cbiAgICB9XG4gICAgaWYgKCFpc0tub3duRnJhbWUpIHtcbiAgICAgIGNvbnNvbGUud2FybihcIltPcHRpQm90XSBwb3N0TWVzc2FnZSByZWpldFx1MDBFOSBcdTIwMTQgaWZyYW1lIG5vbiByZWNvbm51ZSA6XCIsIGUub3JpZ2luKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cbiAgLyogXHUwMEM5Y3JpcmUgbGUgcGF5bG9hZCBkYW5zIGxlIGNhY2hlIGF2YW50IGQnYXBwZWxlciBwZXJmb3JtU21hcnRGaWxsIChxdWkgbGl0IGRlcHVpcyBsZSBjYWNoZSkgKi9cbiAgdmFyIHBheWxvYWQgPSBlLmRhdGEucGF5bG9hZDtcbiAgdmFyIGNhY2hlUHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpO1xuICBpZiAocGF5bG9hZCAmJiAocGF5bG9hZC5tIHx8IHBheWxvYWQubykpIHtcbiAgICB2YXIgbm9tID0gKChwYXlsb2FkLm0gJiYgcGF5bG9hZC5tLm5vbSkgfHwgKHBheWxvYWQubyAmJiBwYXlsb2FkLm8ubm9tUGF0aWVudCkgfHwgXCJcIikudG9VcHBlckNhc2UoKTtcbiAgICBpZiAobm9tKSB7XG4gICAgICB2YXIgY3VycmVudCA9IE9iamVjdC5hc3NpZ24oe30sIHBheWxvYWQubSB8fCB7fSwgeyBvcmRvbm5hbmNlOiBwYXlsb2FkLm8gfHwge30sIHVwZGF0ZWRBdDogRGF0ZS5ub3coKSB9KTtcbiAgICAgIGNhY2hlUHJvbWlzZSA9IHdyaXRlRW5jcnlwdGVkQ2FjaGUoeyBjdXJyZW50OiBjdXJyZW50IH0pO1xuICAgIH1cbiAgfVxuICBjYWNoZVByb21pc2UudGhlbihmdW5jdGlvbigpIHsgcGVyZm9ybVNtYXJ0RmlsbCgpOyB9KTtcbiAgLyogQWNjdXNcdTAwRTkgZGUgclx1MDBFOWNlcHRpb24gdmVycyBsYSBzb3VyY2UgKi9cbiAgaWYgKGUuc291cmNlKSB7XG4gICAgdHJ5IHsgZS5zb3VyY2UucG9zdE1lc3NhZ2UoeyB0eXBlOiBcIk9QVElCT1RfRklMTF9GUkFNRV9BQ0tcIiwgb2s6IHRydWUgfSwgZS5vcmlnaW4pOyB9IGNhdGNoKGVycikge31cbiAgfVxufSwgZmFsc2UpO1xuXG4vLyBcdTI1MDBcdTI1MDAgSW5pdGlhbGlzYXRpb24gXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbmZ1bmN0aW9uIGluaXRMb2NhbCgpIHtcbiAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZS5pbmNsdWRlcyhcImxvY2FsaG9zdFwiKSkgcmV0dXJuO1xuXG4gIGxvYWRTZWxlY3RvckNhY2hlKCk7XG4gIC8qIENoYXJnZXIgbGVzIG92ZXJyaWRlcyBkZSBzZWxlY3RldXJzIGRpc3RhbnRzICovXG4gIGlmICh0eXBlb2YgbG9hZFJlbW90ZVNlbGVjdG9ycyA9PT0gXCJmdW5jdGlvblwiKSBsb2FkUmVtb3RlU2VsZWN0b3JzKCk7XG4gIC8qIFYzLTk6IENoYXJnZXIgbGUgbW9kZWxlIGRlIHByZWRpY3Rpb24gZGUgcmVqZXQgKi9cbiAgaWYgKHR5cGVvZiBsb2FkUmVqZWN0aW9uTW9kZWwgPT09IFwiZnVuY3Rpb25cIikgbG9hZFJlamVjdGlvbk1vZGVsKCk7XG5cbiAgY29uc3QgY3VycmVudFNpdGUgPSBPYmplY3QudmFsdWVzKENPTkZJR1MpLmZpbmQoY2ZnID0+IGNmZy5pc01hdGNoKCkpO1xuXG4gIC8qIFBvcnRhaWwgaW5jb25udSBcdTIwMTQgYWZmaWNoZXIgcXVhbmQgbVx1MDBFQW1lIGxlIGJvdXRvbiBTbWFydCBGaWxsICovXG4gIGlmICghY3VycmVudFNpdGUpIHtcbiAgICBpZiAoIWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwib3B0aWJvdC1maWxsLWJ0blwiKSkge1xuICAgICAgdmFyIGJ0blNtYXJ0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgICAgIGJ0blNtYXJ0LnR5cGUgPSBcImJ1dHRvblwiO1xuICAgICAgYnRuU21hcnQuaWQgPSBcIm9wdGlib3QtZmlsbC1idG5cIjtcbiAgICAgIGJ0blNtYXJ0LmlubmVyVGV4dCA9IFwiXHVEODNFXHVERDE2IFJlbXBsaXJcIjtcbiAgICAgIGJ0blNtYXJ0LnN0eWxlLmNzc1RleHQgPSBcInBvc2l0aW9uOmZpeGVkO2JvdHRvbToyMHB4O3JpZ2h0OjIwcHg7ei1pbmRleDo5OTk5OTk7YmFja2dyb3VuZDojN2MzYWVkO2NvbG9yOndoaXRlO2JvcmRlcjpub25lO3BhZGRpbmc6MTJweCAyMHB4O2JvcmRlci1yYWRpdXM6NTBweDtmb250LXdlaWdodDpib2xkO2N1cnNvcjpwb2ludGVyO2JveC1zaGFkb3c6MCA0cHggMTVweCByZ2JhKDAsMCwwLDAuMik7Zm9udC1mYW1pbHk6c2Fucy1zZXJpZjt0cmFuc2l0aW9uOmFsbCAwLjJzO1wiO1xuICAgICAgYnRuU21hcnQudGl0bGUgPSBcIlJlbXBsaXIgbGVzIGNoYW1wcyBkZSBjZXR0ZSBwYWdlXCI7XG4gICAgICBidG5TbWFydC5vbmNsaWNrID0gYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB1c2VkRHluYW1pYyA9IGF3YWl0IHRyeUR5bmFtaWNSZXBsYXkoKTtcbiAgICAgICAgaWYgKCF1c2VkRHluYW1pYykge1xuICAgICAgICAgIC8qIFBvcnRhaWwgY29ubnUgYXZlYyBtYXBwaW5nIGNvZFx1MDBFOSBcdTIxOTIgdXRpbGlzZXIgcGVyZm9ybUZpbGwgZW4gcHJpb3JpdFx1MDBFOSwgc21hcnQgZmlsbCBlbiBmYWxsYmFjayAqL1xuICAgICAgICAgIHBlcmZvcm1GaWxsKCkudGhlbihmdW5jdGlvbigpIHt9KS5jYXRjaChmdW5jdGlvbigpIHsgcGVyZm9ybVNtYXJ0RmlsbCgpOyB9KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYnRuU21hcnQpO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBDclx1MDBFOWF0aW9uIGR1IGJvdXRvbiBSZW1wbGlyXG4gIGlmICghZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29wdGlib3QtZmlsbC1idG4nKSkge1xuICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgIGJ0bi50eXBlID0gJ2J1dHRvbic7XG4gICAgYnRuLmlkID0gJ29wdGlib3QtZmlsbC1idG4nO1xuICAgIGJ0bi5pbm5lclRleHQgPSAnXHVEODNFXHVERDE2IFJlbXBsaXInO1xuICAgIGJ0bi5zdHlsZS5jc3NUZXh0ID0gYFxuICAgICAgcG9zaXRpb246IGZpeGVkOyBib3R0b206IDIwcHg7IHJpZ2h0OiAyMHB4OyB6LWluZGV4OiA5OTk5OTk7XG4gICAgICBiYWNrZ3JvdW5kOiAjMjU2M2ViOyBjb2xvcjogd2hpdGU7IGJvcmRlcjogbm9uZTsgcGFkZGluZzogMTJweCAyMHB4O1xuICAgICAgYm9yZGVyLXJhZGl1czogNTBweDsgZm9udC13ZWlnaHQ6IGJvbGQ7IGN1cnNvcjogcG9pbnRlcjtcbiAgICAgIGJveC1zaGFkb3c6IDAgNHB4IDE1cHggcmdiYSgwLDAsMCwwLjIpOyBmb250LWZhbWlseTogc2Fucy1zZXJpZjtcbiAgICAgIHRyYW5zaXRpb246IGFsbCAwLjJzO1xuICAgIGA7XG4gICAgYnRuLnRpdGxlID0gXCJSZW1wbGlyIGxlcyBjaGFtcHMgZGUgY2V0dGUgcGFnZVwiO1xuICAgIGJ0bi5vbmNsaWNrID0gYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdXNlZER5bmFtaWMgPSBhd2FpdCB0cnlEeW5hbWljUmVwbGF5KCk7XG4gICAgICBpZiAoIXVzZWREeW5hbWljKSB7XG4gICAgICAgIC8qIFNpdGUgY29ubnUgXHUyMTkyIGZvcm11bGFpcmUgY29kXHUwMEU5IGVuIHByaW9yaXRcdTAwRTksIFNtYXJ0RmlsbCBlbiBmYWxsYmFjayAqL1xuICAgICAgICBwZXJmb3JtRmlsbCgpLnRoZW4oZnVuY3Rpb24oKSB7fSkuY2F0Y2goZnVuY3Rpb24oKSB7IHBlcmZvcm1TbWFydEZpbGwoKTsgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGJ0bik7XG4gIH1cblxuICAvLyBBZmZpY2hhZ2UgcGVybWFuZW50IGR1IGJvdXRvbiBNXHUwMEU5bW9yaXNlciBzdXIgTGl2ZWJ5T3B0aW11bVxuICBpZiAoY3VycmVudFNpdGUubmFtZSA9PT0gXCJMaXZlYnlPcHRpbXVtXCIpIHtcbiAgICBzaG93U3luY0J1dHRvbigpO1xuICAgIHNob3dTeW5jVFBCdXR0b24oKTtcblxuICAgIC8qIExlIERhdGFUYWJsZSBUUCBzZSBjaGFyZ2UgZW4gQUpBWCBcdTIwMTQgb2JzZXJ2ZXIgbGUgRE9NIHBvdXIgbGUgZFx1MDBFOXRlY3RlciAqL1xuICAgIHZhciB0cE9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24oKSB7XG4gICAgICBzaG93U3luY1RQQnV0dG9uKCk7XG4gICAgICBhcHBseUJ1dHRvbnNQcmVmZXJlbmNlKCk7XG4gICAgfSk7XG4gICAgdHBPYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHsgY2hpbGRMaXN0OiB0cnVlLCBzdWJ0cmVlOiB0cnVlIH0pO1xuICB9XG5cbiAgLyogVlx1MDBFOXJpZmllciBzJ2lsIHkgYSB1biBSUEEgZW4gYXR0ZW50ZSAqL1xuICBjaGVja0FuZFN0YXJ0UlBBKCk7XG5cbiAgLyogXHUyNTAwXHUyNTAwIEFtXHUwMEU5bGlvcmF0aW9uIDUgOiBkXHUwMEU5dGVjdGlvbiBjb3JyZWN0aW9ucyB1dGlsaXNhdGV1ciBcdTI1MDBcdTI1MDAgKi9cbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgZWwgPSBlLnRhcmdldDtcbiAgICBpZiAoIWVsIHx8ICFlbC5nZXRBdHRyaWJ1dGUpIHJldHVybjtcbiAgICB2YXIgZmlsbGVkVmFyID0gZWwuZ2V0QXR0cmlidXRlKFwiZGF0YS1vcHRpYm90LWZpbGxlZFwiKTtcbiAgICBpZiAoIWZpbGxlZFZhcikgcmV0dXJuO1xuICAgIHZhciBvbGRWYWx1ZSA9IGVsLmdldEF0dHJpYnV0ZShcImRhdGEtb3B0aWJvdC12YWx1ZVwiKTtcbiAgICBpZiAoZWwudmFsdWUgIT09IG9sZFZhbHVlKSB7XG4gICAgICBzZW5kTGVhcm5pbmdTaWduYWwoe1xuICAgICAgICBob3N0bmFtZTogd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLFxuICAgICAgICBzZWxlY3RvcjogZ2VuZXJhdGVTZWxlY3RvcnMoZWwpWzBdIHx8IFwiXCIsXG4gICAgICAgIGxhYmVsOiBub3JtYWxpemVMYWJlbChnZXRGaWVsZExhYmVsKGVsKSksXG4gICAgICAgIG9sZFZhcmlhYmxlOiBmaWxsZWRWYXIsXG4gICAgICAgIGNvcnJlY3RWYXJpYWJsZTogbnVsbFxuICAgICAgfSk7XG4gICAgfVxuICB9LCB0cnVlKTtcblxuICAvKiBcdTI1MDBcdTI1MDAgQW1cdTAwRTlsaW9yYXRpb24gNyA6IE11dGF0aW9uT2JzZXJ2ZXIgcG91ciBmb3JtdWxhaXJlcyBtdWx0aS1zdGVwIFx1MjUwMFx1MjUwMCAqL1xuICB2YXIgX3NtYXJ0RmlsbERlYm91bmNlID0gbnVsbDtcbiAgdmFyIF9rbm93bkZpZWxkSWRzID0gbmV3IFNldCgpO1xuICAvKiBNXHUwMEU5bW9yaXNlciBsZXMgY2hhbXBzIGRcdTAwRTlqXHUwMEUwIHZpc2libGVzICovXG4gIGdldFZpc2libGVGaWVsZHMoKS5mb3JFYWNoKGZ1bmN0aW9uKGYpIHtcbiAgICBfa25vd25GaWVsZElkcy5hZGQoZi5pZCB8fCBmLm5hbWUgfHwgZi5nZXRBdHRyaWJ1dGUoXCJmb3JtY29udHJvbG5hbWVcIikgfHwgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikpO1xuICB9KTtcblxuICB2YXIgX2FjdGl2ZU9ic2VydmVycyA9IFtdO1xuXG4gIGZ1bmN0aW9uIG9ic2VydmVEb2MoZG9jKSB7XG4gICAgaWYgKCFkb2MgfHwgZG9jLl9vcHRpYm90T2JzZXJ2ZWQpIHJldHVybjtcbiAgICBkb2MuX29wdGlib3RPYnNlcnZlZCA9IHRydWU7XG4gICAgdmFyIG9icyA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKF9zbWFydEZpbGxEZWJvdW5jZSkgY2xlYXJUaW1lb3V0KF9zbWFydEZpbGxEZWJvdW5jZSk7XG4gICAgICBfc21hcnRGaWxsRGVib3VuY2UgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY3VycmVudEZpZWxkcyA9IGdldFZpc2libGVGaWVsZHMoKTtcbiAgICAgICAgdmFyIGhhc05ldyA9IGZhbHNlO1xuICAgICAgICBjdXJyZW50RmllbGRzLmZvckVhY2goZnVuY3Rpb24oZikge1xuICAgICAgICAgIHZhciBrZXkgPSBmLmlkIHx8IGYubmFtZSB8fCAoZi5nZXRBdHRyaWJ1dGUgJiYgZi5nZXRBdHRyaWJ1dGUoXCJmb3JtY29udHJvbG5hbWVcIikpIHx8IFwiXCI7XG4gICAgICAgICAgaWYgKGtleSAmJiAhX2tub3duRmllbGRJZHMuaGFzKGtleSkgJiYgIShmLmdldEF0dHJpYnV0ZSAmJiBmLmdldEF0dHJpYnV0ZShcImRhdGEtb3B0aWJvdC1maWxsZWRcIikpKSB7XG4gICAgICAgICAgICBoYXNOZXcgPSB0cnVlO1xuICAgICAgICAgICAgX2tub3duRmllbGRJZHMuYWRkKGtleSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGhhc05ldykgcGVyZm9ybVNtYXJ0RmlsbCgpO1xuICAgICAgfSwgNjAwKTtcbiAgICB9KTtcbiAgICBvYnMub2JzZXJ2ZShkb2MuYm9keSB8fCBkb2MuZG9jdW1lbnRFbGVtZW50LCB7XG4gICAgICBjaGlsZExpc3Q6IHRydWUsIHN1YnRyZWU6IHRydWUsIGF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICBhdHRyaWJ1dGVGaWx0ZXI6IFtcInN0eWxlXCIsIFwiY2xhc3NcIiwgXCJoaWRkZW5cIiwgXCJhcmlhLWhpZGRlblwiXVxuICAgIH0pO1xuICAgIF9hY3RpdmVPYnNlcnZlcnMucHVzaChvYnMpO1xuICB9XG5cbiAgLyogT2JzZXJ2ZXIgbGUgZG9jdW1lbnQgcHJpbmNpcGFsICovXG4gIG9ic2VydmVEb2MoZG9jdW1lbnQpO1xuXG4gIC8qIE9ic2VydmVyIGxlcyBpZnJhbWVzIGV4aXN0YW50ZXMgZXQgY2VsbGVzIHF1aSBhcnJpdmVudCBkeW5hbWlxdWVtZW50ICovXG4gIGZ1bmN0aW9uIG9ic2VydmVJZnJhbWVzKCkge1xuICAgIHZhciBpZnJhbWVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcImlmcmFtZVwiKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGlmcmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciBpRG9jID0gaWZyYW1lc1tpXS5jb250ZW50RG9jdW1lbnQgfHwgKGlmcmFtZXNbaV0uY29udGVudFdpbmRvdyAmJiBpZnJhbWVzW2ldLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQpO1xuICAgICAgICBpZiAoaURvYyAmJiBpRG9jLmJvZHkpIG9ic2VydmVEb2MoaURvYyk7XG4gICAgICB9IGNhdGNoKGUpIHt9XG4gICAgfVxuICB9XG4gIG9ic2VydmVJZnJhbWVzKCk7XG4gIHZhciBpZnJhbWVXYXRjaGVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24oKSB7IG9ic2VydmVJZnJhbWVzKCk7IH0pO1xuICBpZnJhbWVXYXRjaGVyLm9ic2VydmUoZG9jdW1lbnQuYm9keSwgeyBjaGlsZExpc3Q6IHRydWUsIHN1YnRyZWU6IHRydWUgfSk7XG5cbiAgLyogVjMtODogRGV2aXMgYXV0by1kZXRlY3Rpb24gKi9cbiAgdHJ5IHsgc2V0dXBEZXZpc0RldGVjdGlvbigpOyB9IGNhdGNoKGUpIHt9XG59XG5cbi8qIFx1MjUwMFx1MjUwMCBWaXNpYmlsaXRlIGRlcyBib3V0b25zICh0b2dnbGUgZGVwdWlzIHBvcHVwKSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cblxuZnVuY3Rpb24gc2V0QnV0dG9uc1Zpc2liaWxpdHkodmlzaWJsZSkge1xuICB2YXIgaWRzID0gWydvcHRpYm90LWZpbGwtYnRuJywgJ29wdGlib3Qtc3luYy1idG4nLCAnb3B0aWJvdC1zeW5jLXRwLWJ0biddO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGlkcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkc1tpXSk7XG4gICAgaWYgKGVsKSBlbC5zdHlsZS5kaXNwbGF5ID0gdmlzaWJsZSA/ICdibG9jaycgOiAnbm9uZSc7XG4gIH1cbn1cblxuLyogRWNvdXRlIGxlIG1lc3NhZ2UgZHUgcG9wdXAgcG91ciB0b2dnbGUgaW1tZWRpYXQgKi9cbmNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihmdW5jdGlvbihtc2cpIHtcbiAgaWYgKG1zZyAmJiBtc2cudHlwZSA9PT0gJ09QVElCT1RfVE9HR0xFX0JVVFRPTlMnKSB7XG4gICAgc2V0QnV0dG9uc1Zpc2liaWxpdHkobXNnLnZpc2libGUpO1xuICB9XG4gIC8qIEF1dG8tcmVwbGF5IDogbm90aWZpY2F0aW9uIHBhZ2UgY2hhcmdcdTAwRTllIGRlcHVpcyBiYWNrZ3JvdW5kLmpzICovXG4gIGlmIChtc2cgJiYgbXNnLnR5cGUgPT09ICdPUFRJQk9UX1BBR0VfTE9BREVEJykge1xuICAgIHZhciBtYXRjaGVkUG9ydGFpbCA9IE9iamVjdC52YWx1ZXMoQ09ORklHUykuZmluZChmdW5jdGlvbihjZmcpIHsgcmV0dXJuIGNmZy5pc01hdGNoKCk7IH0pO1xuICAgIGlmIChtYXRjaGVkUG9ydGFpbCkge1xuICAgICAgLyogUGx1cyBkZSBub3RpZmljYXRpb24gXCJkb25uXHUwMEU5ZXMgcHJcdTAwRUF0ZXNcIiBcdTIwMTQgaW51dGlsZSBldCBkaXN0cmF5YW50ICovXG4gICAgfVxuICB9XG59KTtcblxuLyogQXUgY2hhcmdlbWVudCwgYXBwbGlxdWVyIGxhIHByZWZlcmVuY2Ugc2F1dmVnYXJkZWUgKi9cbmZ1bmN0aW9uIGFwcGx5QnV0dG9uc1ByZWZlcmVuY2UoKSB7XG4gIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbJ29wdGlib3RfYnV0dG9uc192aXNpYmxlJ10sIGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgIHZhciB2aXNpYmxlID0gcmVzdWx0Lm9wdGlib3RfYnV0dG9uc192aXNpYmxlICE9PSBmYWxzZTtcbiAgICBzZXRCdXR0b25zVmlzaWJpbGl0eSh2aXNpYmxlKTtcbiAgfSk7XG59XG5cbi8qIFVTLTggOiBGZWVkYmFjayBMb29wIFx1MjAxNCBpbml0IGNsaWMgZHJvaXQgc2lnbmFsZW1lbnQgY2hhbXAgKi9cbmlmICh0eXBlb2YgaW5pdEZpZWxkRmVlZGJhY2sgPT09ICdmdW5jdGlvbicpIGluaXRGaWVsZEZlZWRiYWNrKCk7XG5cbmlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB7IGluaXRMb2NhbCgpOyBhcHBseUJ1dHRvbnNQcmVmZXJlbmNlKCk7IHJlc3RvcmVSZWNvcmRlcklmTmVlZGVkKCk7IGluaXRDb21tYW5kQ2VudGVyKCk7IH1cbmVsc2Ugd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbigpIHsgaW5pdExvY2FsKCk7IGFwcGx5QnV0dG9uc1ByZWZlcmVuY2UoKTsgcmVzdG9yZVJlY29yZGVySWZOZWVkZWQoKTsgaW5pdENvbW1hbmRDZW50ZXIoKTsgfSk7XG5cbi8qIENvbW1hbmQgQ2VudGVyIDogaW5qZWN0ZXIgc3VyIGxlcyBwb3J0YWlscyBvdSBkYXRhIHBhdGllbnQgcHJlc2VudGUgKi9cbmZ1bmN0aW9uIGluaXRDb21tYW5kQ2VudGVyKCkge1xuICBpZiAod2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLmluY2x1ZGVzKFwibG9jYWxob3N0XCIpKSByZXR1cm47XG4gIGlmICh3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUuaW5jbHVkZXMoXCJvcHRpYm90LmZyXCIpKSByZXR1cm47XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgaWYgKHR5cGVvZiBjcmVhdGVDb21tYW5kQ2VudGVyID09PSBcImZ1bmN0aW9uXCIpIGNyZWF0ZUNvbW1hbmRDZW50ZXIoKTtcbiAgfSwgMTUwMCk7XG59XG5cbi8qIFx1MjUwMFx1MjUwMCBSZXBsYXkgRW5naW5lIFx1MjAxNCBVSSAmIEhlYWx0aCAodW5pcXVlIHRvIGluZGV4LmpzKSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cblxuZnVuY3Rpb24gc2hvd1JlcGxheUNvbnRyb2xzKCkge1xuICB2YXIgZXhpc3RpbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm9wdGlib3QtcmVwbGF5LWNvbnRyb2xzXCIpO1xuICBpZiAoZXhpc3RpbmcpIGV4aXN0aW5nLnJlbW92ZSgpO1xuICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgZGl2LmlkID0gXCJvcHRpYm90LXJlcGxheS1jb250cm9sc1wiO1xuICBkaXYuc3R5bGUuY3NzVGV4dCA9IFwicG9zaXRpb246Zml4ZWQ7Ym90dG9tOjgwcHg7cmlnaHQ6MjBweDt6LWluZGV4OjIxNDc0ODM2NDY7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6OHB4O1wiO1xuICB2YXIgYnRuUmVzdW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgYnRuUmVzdW1lLnR5cGUgPSBcImJ1dHRvblwiO1xuICBidG5SZXN1bWUuaW5uZXJUZXh0ID0gXCJcXHUyNUI2IFJlcHJlbmRyZVwiO1xuICBidG5SZXN1bWUuc3R5bGUuY3NzVGV4dCA9IFwicGFkZGluZzoxMHB4IDIwcHg7YmFja2dyb3VuZDojMjU2M2ViO2NvbG9yOndoaXRlO2JvcmRlcjpub25lO2JvcmRlci1yYWRpdXM6MTJweDtmb250LXdlaWdodDpib2xkO2N1cnNvcjpwb2ludGVyO2ZvbnQtZmFtaWx5OnNhbnMtc2VyaWY7XCI7XG4gIGJ0blJlc3VtZS5vbmNsaWNrID0gZnVuY3Rpb24oKSB7IGRpdi5yZW1vdmUoKTsgaWYgKHJlcGxheVN0YXRlICYmIHJlcGxheVN0YXRlLm9uUmVzdW1lKSByZXBsYXlTdGF0ZS5vblJlc3VtZSgpOyB9O1xuICB2YXIgYnRuQWJvcnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICBidG5BYm9ydC50eXBlID0gXCJidXR0b25cIjtcbiAgYnRuQWJvcnQuaW5uZXJUZXh0ID0gXCJcXHUyNzE1IEFiYW5kb25uZXJcIjtcbiAgYnRuQWJvcnQuc3R5bGUuY3NzVGV4dCA9IFwicGFkZGluZzoxMHB4IDIwcHg7YmFja2dyb3VuZDojZWY0NDQ0O2NvbG9yOndoaXRlO2JvcmRlcjpub25lO2JvcmRlci1yYWRpdXM6MTJweDtmb250LXdlaWdodDpib2xkO2N1cnNvcjpwb2ludGVyO2ZvbnQtZmFtaWx5OnNhbnMtc2VyaWY7XCI7XG4gIGJ0bkFib3J0Lm9uY2xpY2sgPSBmdW5jdGlvbigpIHsgZGl2LnJlbW92ZSgpOyBzZXRSZXBsYXlTdGF0ZShudWxsKTsgc2hvd1JQQVRvYXN0KFwiUGFyY291cnMgYWJhbmRvbm5cXHUwMEU5LlwiLCBcImluZm9cIik7IH07XG4gIGRpdi5hcHBlbmRDaGlsZChidG5SZXN1bWUpO1xuICBkaXYuYXBwZW5kQ2hpbGQoYnRuQWJvcnQpO1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpdik7XG59XG5cbmZ1bmN0aW9uIHNlbmRIZWFsdGhQaW5nKHBvcnRhbCwgc3RhdHVzLCBlcnJvckhpbnQpIHtcbiAgdHJ5IHtcbiAgICB2YXIgdmVyc2lvbiA9ICh0eXBlb2YgY2hyb21lICE9PSBcInVuZGVmaW5lZFwiICYmIGNocm9tZS5ydW50aW1lICYmIGNocm9tZS5ydW50aW1lLmdldE1hbmlmZXN0KSA/IGNocm9tZS5ydW50aW1lLmdldE1hbmlmZXN0KCkudmVyc2lvbiA6IFwidW5rbm93blwiO1xuICAgIGZldGNoKFwiaHR0cHM6Ly9vcHRpYm90LmZyL2FwaS9ib29rbWFya2xldC9waW5nXCIsIHtcbiAgICAgIG1ldGhvZDogXCJQT1NUXCIsIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgdmVyc2lvbjogdmVyc2lvbiwgcG9ydGFsOiBwb3J0YWwsIHN0YXR1czogc3RhdHVzLCBlcnJvckhpbnQ6IGVycm9ySGludCB9KVxuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikgeyBjb25zb2xlLndhcm4oXCJbT3B0aUJvdF0gaGVhbHRoIHBpbmcgZmFpbGVkOlwiLCBlcnIpOyB9KTtcbiAgfSBjYXRjaChlKSB7fVxufVxuXG5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoZnVuY3Rpb24obXNnKSB7XG4gIGlmIChtc2cgJiYgbXNnLnR5cGUgPT09IFwiT1BUSUJPVF9MQVVOQ0hfUEFSQ09VUlNcIiAmJiBtc2cucGFyY291cnNJZCkge1xuICAgIChhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzeW5jVG9rZW4gPSBhd2FpdCBnZXRTeW5jVG9rZW4oKTtcbiAgICAgIGlmICghc3luY1Rva2VuKSByZXR1cm47XG4gICAgICB0cnkge1xuICAgICAgICB2YXIgaG9zdG5hbWUgPSB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUucmVwbGFjZShcInd3dy5cIiwgXCJcIik7XG4gICAgICAgIHZhciByZXMgPSBhd2FpdCBmZXRjaChcImh0dHBzOi8vb3B0aWJvdC5mci9hcGkvZXh0ZW5zaW9uL3BhcmNvdXJzP2hvc3RuYW1lPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KGhvc3RuYW1lKSwgeyBoZWFkZXJzOiB7IFwiQXV0aG9yaXphdGlvblwiOiBcIkJlYXJlciBcIiArIHN5bmNUb2tlbiB9IH0pO1xuICAgICAgICBpZiAoIXJlcy5vaykgcmV0dXJuO1xuICAgICAgICB2YXIgZGF0YSA9IGF3YWl0IHJlcy5qc29uKCk7XG4gICAgICAgIHZhciBmb3VuZCA9IChkYXRhLnBhcmNvdXJzIHx8IFtdKS5maW5kKGZ1bmN0aW9uKHApIHsgcmV0dXJuIHAuaWQgPT09IG1zZy5wYXJjb3Vyc0lkOyB9KTtcbiAgICAgICAgaWYgKCFmb3VuZCkgcmV0dXJuO1xuICAgICAgICB2YXIgY2FjaGUgPSBhd2FpdCByZWFkRW5jcnlwdGVkQ2FjaGUoKSB8fCB7fTtcbiAgICAgICAgc3RhcnRSZXBsYXkoZm91bmQsIGNhY2hlKTtcbiAgICAgIH0gY2F0Y2goZSkge31cbiAgICB9KSgpO1xuICB9XG59KTtcblxuLyogXHUyNTAwXHUyNTAwIEZpbiBSZXBsYXkgRW5naW5lIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuXG4vKiBcdTI1MDBcdTI1MDAgTWFjcm8gUmVjb3JkZXIgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG5cbnZhciByZWNvcmRlclN0YXRlID0gbnVsbDsgLyogbnVsbCA9IGluYWN0aWYsIHNpbm9uIHsgZXRhcGVzOiBbXSwgaG9zdG5hbWU6IFwiXCIgfSAqL1xuXG4vKiBHXHUwMEU5blx1MDBFOHJlIHVuZSBsaXN0ZSBvcmRvbm5cdTAwRTllIGRlIHNcdTAwRTlsZWN0ZXVycyBDU1Mgc3RhYmxlcyBwb3VyIHVuIFx1MDBFOWxcdTAwRTltZW50IChQMSBcdTIwMTQgc1x1MDBFOWxlY3RldXJzIGFsdGVybmF0aWZzKSAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVTZWxlY3RvcnMoZWwpIHtcbiAgdmFyIHNlbGVjdG9ycyA9IFtdO1xuICBpZiAoZWwuaWQgJiYgIWVsLmlkLm1hdGNoKC9eWzAtOV0vKSkgc2VsZWN0b3JzLnB1c2goJyMnICsgQ1NTLmVzY2FwZShlbC5pZCkpO1xuICBpZiAoZWwubmFtZSkgc2VsZWN0b3JzLnB1c2goJ1tuYW1lPVwiJyArIGVsLm5hbWUgKyAnXCJdJyk7XG4gIGlmIChlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY3knKSkgc2VsZWN0b3JzLnB1c2goJ1tkYXRhLWN5PVwiJyArIGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1jeScpICsgJ1wiXScpO1xuICBpZiAoZWwuZ2V0QXR0cmlidXRlKCdkYXRhLXRlc3RpZCcpKSBzZWxlY3RvcnMucHVzaCgnW2RhdGEtdGVzdGlkPVwiJyArIGVsLmdldEF0dHJpYnV0ZSgnZGF0YS10ZXN0aWQnKSArICdcIl0nKTtcbiAgaWYgKGVsLnBsYWNlaG9sZGVyKSBzZWxlY3RvcnMucHVzaChlbC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgKyAnW3BsYWNlaG9sZGVyPVwiJyArIGVsLnBsYWNlaG9sZGVyICsgJ1wiXScpO1xuICAvKiBMYWJlbCBhc3NvY2lcdTAwRTkgKi9cbiAgdmFyIGxibCA9IGVsLmlkID8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGFiZWxbZm9yPVwiJyArIGVsLmlkICsgJ1wiXScpIDogbnVsbDtcbiAgaWYgKGxibCAmJiBsYmwudGV4dENvbnRlbnQudHJpbSgpICYmIGVsLmlkICYmIGVsLmlkLmxlbmd0aCA+PSA4KSB7XG4gICAgc2VsZWN0b3JzLnB1c2goZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpICsgJ1tpZCQ9XCInICsgZWwuaWQuc2xpY2UoLTgpICsgJ1wiXScpO1xuICB9XG4gIC8qIEZhbGxiYWNrIG50aC1jaGlsZCAqL1xuICB2YXIgcGFyZW50ID0gZWwucGFyZW50RWxlbWVudDtcbiAgaWYgKHBhcmVudCkge1xuICAgIHZhciBpZHggPSBBcnJheS5mcm9tKHBhcmVudC5jaGlsZHJlbikuaW5kZXhPZihlbCkgKyAxO1xuICAgIHNlbGVjdG9ycy5wdXNoKGVsLnRhZ05hbWUudG9Mb3dlckNhc2UoKSArICc6bnRoLWNoaWxkKCcgKyBpZHggKyAnKScpO1xuICB9XG4gIGlmIChzZWxlY3RvcnMubGVuZ3RoID09PSAwKSBzZWxlY3RvcnMucHVzaChlbC50YWdOYW1lLnRvTG93ZXJDYXNlKCkpO1xuICAvKiBEXHUwMEU5ZHVwbGlxdWVyICovXG4gIHJldHVybiBzZWxlY3RvcnMuZmlsdGVyKGZ1bmN0aW9uKHMsIGksIGFycikgeyByZXR1cm4gYXJyLmluZGV4T2YocykgPT09IGk7IH0pO1xufVxuXG4vKiBUcm91dmUgdW4gXHUwMEU5bFx1MDBFOW1lbnQgZW4gZXNzYXlhbnQgbGVzIHNcdTAwRTlsZWN0ZXVycyBkYW5zIGwnb3JkcmUgKFAxIFx1MjAxNCBmYWxsYmFjayBsaXN0KSAqL1xuYXN5bmMgZnVuY3Rpb24gZmluZEVsZW1lbnRCeVNlbGVjdG9ycyhzZWxlY3RvcnMsIHRpbWVvdXQpIHtcbiAgdmFyIHNlbGVjdG9yTGlzdCA9IEFycmF5LmlzQXJyYXkoc2VsZWN0b3JzKSA/IHNlbGVjdG9ycyA6IFtzZWxlY3RvcnNdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHNlbGVjdG9yTGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBlbCA9IGF3YWl0IHdhaXRGb3JFbGVtZW50KHNlbGVjdG9yTGlzdFtpXSwgaSA9PT0gMCA/IHRpbWVvdXQgOiA1MDApO1xuICAgIGlmIChlbCkgcmV0dXJuIGVsO1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG4vKiBQMSBcdTIwMTQgTm9ybWFsaXNhdGlvbiBhdmFuY1x1MDBFOWUgcG91ciBsYSBjb3JyZXNwb25kYW5jZSBkZSB2YXJpYWJsZXMgcGF0aWVudCAqL1xuZnVuY3Rpb24gbm9ybWFsaXplRm9yTWF0Y2godmFsKSB7XG4gIHJldHVybiAodmFsIHx8IFwiXCIpLnJlcGxhY2UoL1tcXHNcXC1cXC5cXC9dL2csIFwiXCIpLnRvTG93ZXJDYXNlKCk7XG59XG5cbi8qIFAxIFx1MjAxNCBHXHUwMEU5blx1MDBFOHJlIHBsdXNpZXVycyByZXByXHUwMEU5c2VudGF0aW9ucyBub3JtYWxpc1x1MDBFOWVzIGQndW5lIGRhdGUgcG91ciBsYSBjb21wYXJhaXNvbiAqL1xuZnVuY3Rpb24gbm9ybWFsaXplRGF0ZUZvck1hdGNoKGRhdGVTdHIpIHtcbiAgaWYgKCFkYXRlU3RyKSByZXR1cm4gW107XG4gIHZhciBkID0gZGF0ZVN0ci5yZXBsYWNlKC9cXEQvZywgXCJcIik7XG4gIGlmIChkLmxlbmd0aCA9PT0gOCkge1xuICAgIC8qIERETU1ZWVlZIFx1MjE5MiBlc3NheWVyIERETU1ZWVlZLCBZWVlZTU1ERCwgREQvTU0vWVlZWSAqL1xuICAgIHJldHVybiBbZCwgZC5zbGljZSg0KSArIGQuc2xpY2UoMiwgNCkgKyBkLnNsaWNlKDAsIDIpLCBkLnNsaWNlKDAsIDIpICsgZC5zbGljZSgyLCA0KSArIGQuc2xpY2UoNCldO1xuICB9XG4gIHJldHVybiBbZF07XG59XG5cbi8qIERcdTAwRTl0ZWN0ZSBzaSB1bmUgdmFsZXVyIGNvcnJlc3BvbmQgXHUwMEUwIHVuZSB2YXJpYWJsZSBwYXRpZW50IChkZXB1aXMgY2FjaGUgbG9jYWwpICovXG5hc3luYyBmdW5jdGlvbiBkZXRlY3RWYXJpYWJsZSh2YWx1ZSkge1xuICBpZiAoIXZhbHVlIHx8IHZhbHVlLmxlbmd0aCA8IDIpIHJldHVybiBudWxsO1xuICB2YXIgY2FjaGUgPSBhd2FpdCByZWFkRW5jcnlwdGVkQ2FjaGUoKTtcbiAgaWYgKCFjYWNoZSB8fCAhY2FjaGUuY3VycmVudCkgcmV0dXJuIG51bGw7XG4gIHZhciBtID0gY2FjaGUuY3VycmVudDtcbiAgdmFyIG8gPSBtLm9yZG9ubmFuY2UgfHwge307XG4gIHZhciBvZCA9IG8ubHVuZXR0ZXNPRCB8fCB7fTtcbiAgdmFyIG9nID0gby5sdW5ldHRlc09HIHx8IHt9O1xuICB2YXIgcDAgPSAobS5wZXJzb25uZXMgJiYgbS5wZXJzb25uZXNbMF0pIHx8IHt9O1xuXG4gIHZhciBub3JtYWxpemVkVmFsdWUgPSBub3JtYWxpemVGb3JNYXRjaCh2YWx1ZSk7XG5cbiAgLyogQ2hhbXBzIHNpbXBsZXMgXHUyMDE0IGNvbXBhcmFpc29uIG5vcm1hbGlzXHUwMEU5ZSAqL1xuICB2YXIgbWFwcGluZyA9IFtcbiAgICB7IHZhcmlhYmxlOiBcInt7bnNzfX1cIiwgdmFsdWU6IG0ubnVtZXJvU2VjdXJpdGVTb2NpYWxlIHx8IFwiXCIgfSxcbiAgICB7IHZhcmlhYmxlOiBcInt7bm9tfX1cIiwgdmFsdWU6IG0ubm9tIHx8IHAwLm5vbSB8fCBcIlwiIH0sXG4gICAgeyB2YXJpYWJsZTogXCJ7e3ByZW5vbX19XCIsIHZhbHVlOiBtLnByZW5vbSB8fCBwMC5wcmVub20gfHwgXCJcIiB9LFxuICAgIHsgdmFyaWFibGU6IFwie3tvcmdhbmlzbWV9fVwiLCB2YWx1ZTogbS5vcmdhbmlzbWUgfHwgXCJcIiB9LFxuICAgIHsgdmFyaWFibGU6IFwie3tudW1lcm9BZGhlcmVudH19XCIsIHZhbHVlOiBtLm51bWVyb0FkaGVyZW50IHx8IFwiXCIgfSxcbiAgICB7IHZhcmlhYmxlOiBcInt7c3BoZXJlX29kfX1cIiwgdmFsdWU6IG9kLnNwaGVyZSB8fCBcIlwiIH0sXG4gICAgeyB2YXJpYWJsZTogXCJ7e3NwaGVyZV9vZ319XCIsIHZhbHVlOiBvZy5zcGhlcmUgfHwgXCJcIiB9LFxuICAgIHsgdmFyaWFibGU6IFwie3tjeWxpbmRyZV9vZH19XCIsIHZhbHVlOiBvZC5jeWxpbmRyZSB8fCBcIlwiIH0sXG4gICAgeyB2YXJpYWJsZTogXCJ7e2N5bGluZHJlX29nfX1cIiwgdmFsdWU6IG9nLmN5bGluZHJlIHx8IFwiXCIgfSxcbiAgICB7IHZhcmlhYmxlOiBcInt7YXhlX29kfX1cIiwgdmFsdWU6IG9kLmF4ZSB8fCBcIlwiIH0sXG4gICAgeyB2YXJpYWJsZTogXCJ7e2F4ZV9vZ319XCIsIHZhbHVlOiBvZy5heGUgfHwgXCJcIiB9LFxuICAgIHsgdmFyaWFibGU6IFwie3thZGRpdGlvbn19XCIsIHZhbHVlOiBvZC5hZGRpdGlvbiB8fCBvZy5hZGRpdGlvbiB8fCBcIlwiIH0sXG4gIF07XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXBwaW5nLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGNhbmRpZGF0ZSA9IG5vcm1hbGl6ZUZvck1hdGNoKG1hcHBpbmdbaV0udmFsdWUpO1xuICAgIGlmIChjYW5kaWRhdGUgJiYgY2FuZGlkYXRlLmxlbmd0aCA+PSAyICYmIG5vcm1hbGl6ZWRWYWx1ZSA9PT0gY2FuZGlkYXRlKSB7XG4gICAgICByZXR1cm4gbWFwcGluZ1tpXS52YXJpYWJsZTtcbiAgICB9XG4gIH1cblxuICAvKiBEYXRlcyBcdTIwMTQgZXNzYXllciBwbHVzaWV1cnMgZm9ybWF0cyBub3JtYWxpc1x1MDBFOXMgKi9cbiAgdmFyIGRhdGVGaWVsZHMgPSBbXG4gICAgeyB2YXJpYWJsZTogXCJ7e2RhdGVOYWlzc2FuY2V9fVwiLCB2YWx1ZTogbS5kYXRlTmFpc3NhbmNlIHx8IFwiXCIgfSxcbiAgICB7IHZhcmlhYmxlOiBcInt7ZGF0ZU9yZG9ubmFuY2V9fVwiLCB2YWx1ZTogby5kYXRlT3Jkb25uYW5jZSB8fCBcIlwiIH0sXG4gIF07XG4gIGZvciAodmFyIGogPSAwOyBqIDwgZGF0ZUZpZWxkcy5sZW5ndGg7IGorKykge1xuICAgIHZhciB2YXJpYW50cyA9IG5vcm1hbGl6ZURhdGVGb3JNYXRjaChkYXRlRmllbGRzW2pdLnZhbHVlKTtcbiAgICBmb3IgKHZhciBrID0gMDsgayA8IHZhcmlhbnRzLmxlbmd0aDsgaysrKSB7XG4gICAgICBpZiAodmFyaWFudHNba10gJiYgdmFyaWFudHNba10ubGVuZ3RoID49IDYgJiYgbm9ybWFsaXplZFZhbHVlID09PSB2YXJpYW50c1trXSkge1xuICAgICAgICByZXR1cm4gZGF0ZUZpZWxkc1tqXS52YXJpYWJsZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuLyogXHUyNTAwXHUyNTAwIFBhbm5lYXUgZ3VpZFx1MDBFOSBsYXRcdTAwRTlyYWwgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG5cbmZ1bmN0aW9uIHNob3dSZWNvcmRlclBhbmVsKCkge1xuICBpZiAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJvcHRpYm90LXJlY29yZGVyLXBhbmVsXCIpKSByZXR1cm47XG4gIHZhciBwYW5lbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIHBhbmVsLmlkID0gXCJvcHRpYm90LXJlY29yZGVyLXBhbmVsXCI7XG4gIHBhbmVsLnN0eWxlLmNzc1RleHQgPSBcInBvc2l0aW9uOmZpeGVkO3JpZ2h0OjA7dG9wOjUwJTt0cmFuc2Zvcm06dHJhbnNsYXRlWSgtNTAlKTt6LWluZGV4OjIxNDc0ODM2NDY7YmFja2dyb3VuZDp3aGl0ZTtib3JkZXItcmFkaXVzOjEycHggMCAwIDEycHg7Ym94LXNoYWRvdzotNHB4IDAgMjBweCByZ2JhKDAsMCwwLDAuMTUpO3dpZHRoOjI2MHB4O2ZvbnQtZmFtaWx5OnNhbnMtc2VyaWY7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjttYXgtaGVpZ2h0Ojcwdmg7XCI7XG5cbiAgLyogSGVhZGVyICovXG4gIHZhciBoZWFkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBoZWFkZXIuc3R5bGUuY3NzVGV4dCA9IFwicGFkZGluZzoxNHB4IDE2cHggMTBweDtib3JkZXItYm90dG9tOjFweCBzb2xpZCAjZTVlN2ViO1wiO1xuICBoZWFkZXIuaW5uZXJIVE1MID0gJzxkaXYgc3R5bGU9XCJmb250LXNpemU6MTRweDtmb250LXdlaWdodDo3MDA7Y29sb3I6I2VmNDQ0NDtcIj5cdTIzRkEgT3B0aUJvdCBcdTIwMTQgRW5yZWdpc3RyZW1lbnQ8L2Rpdj4nO1xuICBwYW5lbC5hcHBlbmRDaGlsZChoZWFkZXIpO1xuXG4gIC8qIEJvZHkgKHNjcm9sbGFibGUgbGlzdCkgKi9cbiAgdmFyIGJvZHkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBib2R5LmlkID0gXCJvcHRpYm90LXJlY29yZGVyLXBhbmVsLWJvZHlcIjtcbiAgYm9keS5zdHlsZS5jc3NUZXh0ID0gXCJmbGV4OjE7b3ZlcmZsb3cteTphdXRvO3BhZGRpbmc6OHB4IDEycHg7XCI7XG4gIHBhbmVsLmFwcGVuZENoaWxkKGJvZHkpO1xuXG4gIC8qIEZvb3RlciAqL1xuICB2YXIgZm9vdGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgZm9vdGVyLmlkID0gXCJvcHRpYm90LXJlY29yZGVyLXBhbmVsLWZvb3RlclwiO1xuICBmb290ZXIuc3R5bGUuY3NzVGV4dCA9IFwicGFkZGluZzoxMHB4IDE2cHg7Ym9yZGVyLXRvcDoxcHggc29saWQgI2U1ZTdlYjtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpzcGFjZS1iZXR3ZWVuO1wiO1xuICB2YXIgY291bnRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICBjb3VudGVyLmlkID0gXCJvcHRpYm90LXJlY29yZGVyLXBhbmVsLWNvdW50ZXJcIjtcbiAgY291bnRlci5zdHlsZS5jc3NUZXh0ID0gXCJmb250LXNpemU6MTJweDtjb2xvcjojNmI3MjgwO1wiO1xuICBjb3VudGVyLnRleHRDb250ZW50ID0gXCIwIFx1MDBFOXRhcGVzIGVucmVnaXN0clx1MDBFOWVzXCI7XG4gIHZhciBzdG9wQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgc3RvcEJ0bi5zdHlsZS5jc3NUZXh0ID0gXCJwYWRkaW5nOjZweCAxNHB4O2JvcmRlcjpub25lO2JvcmRlci1yYWRpdXM6NnB4O2JhY2tncm91bmQ6I2VmNDQ0NDtjb2xvcjp3aGl0ZTtmb250LXNpemU6MTJweDtmb250LXdlaWdodDo2MDA7Y3Vyc29yOnBvaW50ZXI7XCI7XG4gIHN0b3BCdG4udGV4dENvbnRlbnQgPSBcIlx1MjNGOSBUZXJtaW5lclwiO1xuICBzdG9wQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHsgc3RvcFJlY29yZGVyKCk7IH0pO1xuICBmb290ZXIuYXBwZW5kQ2hpbGQoY291bnRlcik7XG4gIGZvb3Rlci5hcHBlbmRDaGlsZChzdG9wQnRuKTtcbiAgcGFuZWwuYXBwZW5kQ2hpbGQoZm9vdGVyKTtcblxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHBhbmVsKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlUmVjb3JkZXJQYW5lbCgpIHtcbiAgaWYgKCFyZWNvcmRlclN0YXRlKSByZXR1cm47XG4gIHZhciBib2R5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJvcHRpYm90LXJlY29yZGVyLXBhbmVsLWJvZHlcIik7XG4gIHZhciBjb3VudGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJvcHRpYm90LXJlY29yZGVyLXBhbmVsLWNvdW50ZXJcIik7XG4gIGlmICghYm9keSkgcmV0dXJuO1xuXG4gIHZhciBldGFwZXMgPSByZWNvcmRlclN0YXRlLmV0YXBlcztcblxuICAvKiBNZXR0cmUgXHUwMEUwIGpvdXIgbGUgY29tcHRldXIgKi9cbiAgaWYgKGNvdW50ZXIpIGNvdW50ZXIudGV4dENvbnRlbnQgPSBldGFwZXMubGVuZ3RoICsgXCIgXHUwMEU5dGFwZVwiICsgKGV0YXBlcy5sZW5ndGggPiAxID8gXCJzXCIgOiBcIlwiKSArIFwiIGVucmVnaXN0clx1MDBFOWVcIiArIChldGFwZXMubGVuZ3RoID4gMSA/IFwic1wiIDogXCJcIik7XG5cbiAgLyogUmVjb25zdHJ1aXJlIGxhIGxpc3RlICovXG4gIGJvZHkuaW5uZXJIVE1MID0gXCJcIjtcbiAgdmFyIGxhc3RVcmwgPSBudWxsO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGV0YXBlcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBzdGVwID0gZXRhcGVzW2ldO1xuXG4gICAgLyogU1x1MDBFOXBhcmF0ZXVyIGVudHJlIGdyb3VwZXMgZCdVUkwgZGlmZlx1MDBFOXJlbnRlcyAqL1xuICAgIGlmIChzdGVwLnVybCAmJiBzdGVwLnVybCAhPT0gbGFzdFVybCAmJiBsYXN0VXJsICE9PSBudWxsKSB7XG4gICAgICB2YXIgc2VwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgIHNlcC5zdHlsZS5jc3NUZXh0ID0gXCJib3JkZXItdG9wOjJweCBkYXNoZWQgI2QxZDVkYjttYXJnaW46NnB4IDA7cGFkZGluZy10b3A6NHB4O2ZvbnQtc2l6ZToxMHB4O2NvbG9yOiM5Y2EzYWY7b3ZlcmZsb3c6aGlkZGVuO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7d2hpdGUtc3BhY2U6bm93cmFwO1wiO1xuICAgICAgc2VwLnRleHRDb250ZW50ID0gXCJcdUQ4M0RcdURDQzQgXCIgKyBzdGVwLnVybC5yZXBsYWNlKC9odHRwcz86XFwvXFwvLywgXCJcIikuc2xpY2UoMCwgMzUpO1xuICAgICAgYm9keS5hcHBlbmRDaGlsZChzZXApO1xuICAgIH1cbiAgICBsYXN0VXJsID0gc3RlcC51cmw7XG5cbiAgICB2YXIgcm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICByb3cuc3R5bGUuY3NzVGV4dCA9IFwiZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NnB4O3BhZGRpbmc6NHB4IDA7Zm9udC1zaXplOjEycHg7XCI7XG5cbiAgICB2YXIgaWNvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgIGlmIChzdGVwLmFjdGlvbiA9PT0gXCJmaWxsXCIpIHtcbiAgICAgIHZhciBpc0tub3duID0gc3RlcC52YXJpYWJsZSAmJiBzdGVwLnZhcmlhYmxlLmluZGV4T2YoXCJ7e1wiKSA9PT0gMDtcbiAgICAgIGljb24udGV4dENvbnRlbnQgPSBcIlx1MjcwNVwiO1xuICAgICAgdmFyIGxhYmVsRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICAgIGxhYmVsRWwuc3R5bGUuY3NzVGV4dCA9IFwiZmxleDoxO292ZXJmbG93OmhpZGRlbjt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO3doaXRlLXNwYWNlOm5vd3JhcDtjb2xvcjojMzc0MTUxO1wiO1xuICAgICAgbGFiZWxFbC50ZXh0Q29udGVudCA9IChzdGVwLmxhYmVsIHx8IFwiQ2hhbXBcIikuc2xpY2UoMCwgMjUpO1xuICAgICAgdmFyIHZhckJhZGdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgICBpZiAoaXNLbm93bikge1xuICAgICAgICB2YXJCYWRnZS5zdHlsZS5jc3NUZXh0ID0gXCJmb250LXNpemU6MTBweDtiYWNrZ3JvdW5kOiNkMWZhZTU7Y29sb3I6IzA2NWY0NjtwYWRkaW5nOjFweCA1cHg7Ym9yZGVyLXJhZGl1czozcHg7d2hpdGUtc3BhY2U6bm93cmFwO1wiO1xuICAgICAgICB2YXJCYWRnZS50ZXh0Q29udGVudCA9IHN0ZXAudmFyaWFibGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXJCYWRnZS5zdHlsZS5jc3NUZXh0ID0gXCJmb250LXNpemU6MTBweDtiYWNrZ3JvdW5kOiNmZWYzYzc7Y29sb3I6IzkyNDAwZTtwYWRkaW5nOjFweCA1cHg7Ym9yZGVyLXJhZGl1czozcHg7d2hpdGUtc3BhY2U6bm93cmFwO1wiO1xuICAgICAgICB2YXJCYWRnZS50ZXh0Q29udGVudCA9IFwic3RhdGlxdWVcIjtcbiAgICAgIH1cbiAgICAgIHJvdy5hcHBlbmRDaGlsZChpY29uKTtcbiAgICAgIHJvdy5hcHBlbmRDaGlsZChsYWJlbEVsKTtcbiAgICAgIHJvdy5hcHBlbmRDaGlsZCh2YXJCYWRnZSk7XG4gICAgfSBlbHNlIGlmIChzdGVwLmFjdGlvbiA9PT0gXCJjbGlja1wiKSB7XG4gICAgICBpY29uLnRleHRDb250ZW50ID0gXCJcdUQ4M0RcdUREQjFcdUZFMEZcIjtcbiAgICAgIHZhciBsYWJlbEVsMiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgICAgbGFiZWxFbDIuc3R5bGUuY3NzVGV4dCA9IFwiZmxleDoxO292ZXJmbG93OmhpZGRlbjt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO3doaXRlLXNwYWNlOm5vd3JhcDtjb2xvcjojMzc0MTUxO1wiO1xuICAgICAgbGFiZWxFbDIudGV4dENvbnRlbnQgPSAoc3RlcC5sYWJlbCB8fCBcIkNsaWNcIikuc2xpY2UoMCwgMzApO1xuICAgICAgcm93LmFwcGVuZENoaWxkKGljb24pO1xuICAgICAgcm93LmFwcGVuZENoaWxkKGxhYmVsRWwyKTtcbiAgICB9IGVsc2UgaWYgKHN0ZXAuYWN0aW9uID09PSBcInNlbGVjdFwiKSB7XG4gICAgICBpY29uLnRleHRDb250ZW50ID0gXCJcdUQ4M0RcdURDQ0JcIjtcbiAgICAgIHZhciBsYWJlbEVsMyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgICAgbGFiZWxFbDMuc3R5bGUuY3NzVGV4dCA9IFwiZmxleDoxO292ZXJmbG93OmhpZGRlbjt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO3doaXRlLXNwYWNlOm5vd3JhcDtjb2xvcjojMzc0MTUxO1wiO1xuICAgICAgbGFiZWxFbDMudGV4dENvbnRlbnQgPSAoc3RlcC5sYWJlbCB8fCBcIlNcdTAwRTlsZWN0aW9uXCIpLnNsaWNlKDAsIDMwKTtcbiAgICAgIHJvdy5hcHBlbmRDaGlsZChpY29uKTtcbiAgICAgIHJvdy5hcHBlbmRDaGlsZChsYWJlbEVsMyk7XG4gICAgfVxuXG4gICAgYm9keS5hcHBlbmRDaGlsZChyb3cpO1xuICB9XG5cbiAgLyogQXV0by1zY3JvbGwgdmVycyBsZSBiYXMgKi9cbiAgYm9keS5zY3JvbGxUb3AgPSBib2R5LnNjcm9sbEhlaWdodDtcbn1cblxuLyogXHUyNTAwXHUyNTAwIEhpZ2hsaWdodCB2aXN1ZWwgZGVzIGNoYW1wcyBjYXB0dXJcdTAwRTlzIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuXG5mdW5jdGlvbiBoaWdobGlnaHRSZWNvcmRlZEZpZWxkKGVsLCB2YXJpYWJsZSkge1xuICBpZiAoIWVsIHx8IGVsLmdldEF0dHJpYnV0ZShcImRhdGEtb3B0aWJvdC1yZWNvcmRlZFwiKSkgcmV0dXJuO1xuICBlbC5zZXRBdHRyaWJ1dGUoXCJkYXRhLW9wdGlib3QtcmVjb3JkZWRcIiwgXCJ0cnVlXCIpO1xuXG4gIHZhciBpc0tub3duID0gdmFyaWFibGUgJiYgdmFyaWFibGUuaW5kZXhPZihcInt7XCIpID09PSAwO1xuICBlbC5zdHlsZS5vdXRsaW5lID0gaXNLbm93biA/IFwiMnB4IHNvbGlkICMxMGI5ODFcIiA6IFwiMnB4IHNvbGlkICNmNTllMGJcIjtcbiAgZWwuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gaXNLbm93biA/IFwiI2YwZmRmNFwiIDogXCIjZmZmYmViXCI7XG5cbiAgLyogQmFkZ2UgYWJzb2x1IGF1LWRlc3N1cyBkdSBjaGFtcCAqL1xuICB2YXIgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB2YXIgYmFkZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgYmFkZ2UuY2xhc3NOYW1lID0gXCJvcHRpYm90LXJlY29yZGVyLWZpZWxkLWJhZGdlXCI7XG4gIGJhZGdlLnN0eWxlLmNzc1RleHQgPSBcInBvc2l0aW9uOmFic29sdXRlO3otaW5kZXg6MjE0NzQ4MzY0NTtmb250LXNpemU6MTBweDtmb250LXdlaWdodDo2MDA7cGFkZGluZzoxcHggNnB4O2JvcmRlci1yYWRpdXM6M3B4O2ZvbnQtZmFtaWx5OnNhbnMtc2VyaWY7cG9pbnRlci1ldmVudHM6bm9uZTt3aGl0ZS1zcGFjZTpub3dyYXA7XCI7XG4gIGlmIChpc0tub3duKSB7XG4gICAgYmFkZ2Uuc3R5bGUuYmFja2dyb3VuZCA9IFwiI2QxZmFlNVwiO1xuICAgIGJhZGdlLnN0eWxlLmNvbG9yID0gXCIjMDY1ZjQ2XCI7XG4gICAgYmFkZ2UudGV4dENvbnRlbnQgPSB2YXJpYWJsZTtcbiAgfSBlbHNlIHtcbiAgICBiYWRnZS5zdHlsZS5iYWNrZ3JvdW5kID0gXCIjZmVmM2M3XCI7XG4gICAgYmFkZ2Uuc3R5bGUuY29sb3IgPSBcIiM5MjQwMGVcIjtcbiAgICBiYWRnZS50ZXh0Q29udGVudCA9IFwic3RhdGlxdWVcIjtcbiAgfVxuXG4gIC8qIFBvc2l0aW9ubmVyIGxlIGJhZGdlIHJlbGF0aXZlbWVudCBhdSBwYXJlbnQgcG9zaXRpb25uXHUwMEU5ICovXG4gIHZhciBwYXJlbnQgPSBlbC5vZmZzZXRQYXJlbnQgfHwgZG9jdW1lbnQuYm9keTtcbiAgdmFyIHBhcmVudFJlY3QgPSBwYXJlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIGJhZGdlLnN0eWxlLmxlZnQgPSAocmVjdC5sZWZ0IC0gcGFyZW50UmVjdC5sZWZ0KSArIFwicHhcIjtcbiAgYmFkZ2Uuc3R5bGUudG9wID0gKHJlY3QudG9wIC0gcGFyZW50UmVjdC50b3AgLSAxNikgKyBcInB4XCI7XG4gIHBhcmVudC5hcHBlbmRDaGlsZChiYWRnZSk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVJlY29yZGVySGlnaGxpZ2h0cygpIHtcbiAgLyogUmV0aXJlciBsZXMgb3V0bGluZXMgZXQgYmFja2dyb3VuZHMgKi9cbiAgdmFyIG1hcmtlZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJbZGF0YS1vcHRpYm90LXJlY29yZGVkXVwiKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXJrZWQubGVuZ3RoOyBpKyspIHtcbiAgICBtYXJrZWRbaV0uc3R5bGUub3V0bGluZSA9IFwiXCI7XG4gICAgbWFya2VkW2ldLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IFwiXCI7XG4gICAgbWFya2VkW2ldLnJlbW92ZUF0dHJpYnV0ZShcImRhdGEtb3B0aWJvdC1yZWNvcmRlZFwiKTtcbiAgfVxuICAvKiBSZXRpcmVyIGxlcyBiYWRnZXMgKi9cbiAgdmFyIGJhZGdlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIub3B0aWJvdC1yZWNvcmRlci1maWVsZC1iYWRnZVwiKTtcbiAgZm9yICh2YXIgaiA9IDA7IGogPCBiYWRnZXMubGVuZ3RoOyBqKyspIHtcbiAgICBiYWRnZXNbal0ucmVtb3ZlKCk7XG4gIH1cbn1cblxuLyogRFx1MDBFOW1hcnJlciBsJ2VucmVnaXN0cmVtZW50ICovXG5mdW5jdGlvbiBzdGFydFJlY29yZGVyKCkge1xuICBpZiAocmVjb3JkZXJTdGF0ZSkgcmV0dXJuO1xuICByZWNvcmRlclN0YXRlID0ge1xuICAgIGV0YXBlczogW10sXG4gICAgaG9zdG5hbWU6IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZS5yZXBsYWNlKFwid3d3LlwiLCBcIlwiKSxcbiAgICBzdGFydFRpbWU6IERhdGUubm93KCksXG4gIH07XG5cbiAgLyogQmFkZ2UgZW5yZWdpc3RyZW1lbnQgKi9cbiAgdmFyIGJhZGdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgYmFkZ2UuaWQgPSBcIm9wdGlib3QtcmVjb3JkZXItYmFkZ2VcIjtcbiAgYmFkZ2Uuc3R5bGUuY3NzVGV4dCA9IFwicG9zaXRpb246Zml4ZWQ7dG9wOjIwcHg7bGVmdDo1MCU7dHJhbnNmb3JtOnRyYW5zbGF0ZVgoLTUwJSk7ei1pbmRleDoyMTQ3NDgzNjQ3O2JhY2tncm91bmQ6I2VmNDQ0NDtjb2xvcjp3aGl0ZTtwYWRkaW5nOjhweCAyMHB4O2JvcmRlci1yYWRpdXM6NTBweDtmb250LWZhbWlseTpzYW5zLXNlcmlmO2ZvbnQtc2l6ZToxM3B4O2ZvbnQtd2VpZ2h0OmJvbGQ7Ym94LXNoYWRvdzowIDRweCAxNXB4IHJnYmEoMCwwLDAsMC4zKTtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7XCI7XG4gIGJhZGdlLmlubmVySFRNTCA9ICc8c3BhbiBzdHlsZT1cIndpZHRoOjEwcHg7aGVpZ2h0OjEwcHg7YmFja2dyb3VuZDp3aGl0ZTtib3JkZXItcmFkaXVzOjUwJTtkaXNwbGF5OmlubGluZS1ibG9jazthbmltYXRpb246cHVsc2UgMXMgaW5maW5pdGU7XCI+PC9zcGFuPiBFbnJlZ2lzdHJlbWVudCBlbiBjb3VycyBcdTIwMTQgZWZmZWN0dWV6IGxlIHBhcmNvdXJzIG1hbnVlbGxlbWVudCc7XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYmFkZ2UpO1xuXG4gIC8qIFN0eWxlIGFuaW1hdGlvbiAqL1xuICBpZiAoIWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwib3B0aWJvdC1yZWNvcmRlci1zdHlsZVwiKSkge1xuICAgIHZhciBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgICBzdHlsZS5pZCA9IFwib3B0aWJvdC1yZWNvcmRlci1zdHlsZVwiO1xuICAgIHN0eWxlLnRleHRDb250ZW50ID0gXCJAa2V5ZnJhbWVzIHB1bHNlIHsgMCUsMTAwJXtvcGFjaXR5OjF9IDUwJXtvcGFjaXR5OjAuM30gfVwiO1xuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuICB9XG5cbiAgLyogXHUwMEM5Y291dGVyIGxlcyBldmVudHMgc3VyIGxlIGRvY3VtZW50IHByaW5jaXBhbCAqL1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgb25SZWNvcmRlckNsaWNrLCB0cnVlKTtcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBvblJlY29yZGVyQ2hhbmdlLCB0cnVlKTtcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImJsdXJcIiwgb25SZWNvcmRlckJsdXIsIHRydWUpO1xuXG4gIC8qIFx1MjUwMFx1MjUwMCBJZnJhbWVzIDogYXR0YWNoZXIgbGVzIGxpc3RlbmVycyBkYW5zIGNoYXF1ZSBpZnJhbWUgYWNjZXNzaWJsZSBcdTI1MDBcdTI1MDAgKi9cbiAgZnVuY3Rpb24gYXR0YWNoUmVjb3JkZXJUb0lmcmFtZXMoKSB7XG4gICAgdmFyIGlmcmFtZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiaWZyYW1lXCIpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaWZyYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIGlEb2MgPSBpZnJhbWVzW2ldLmNvbnRlbnREb2N1bWVudCB8fCAoaWZyYW1lc1tpXS5jb250ZW50V2luZG93ICYmIGlmcmFtZXNbaV0uY29udGVudFdpbmRvdy5kb2N1bWVudCk7XG4gICAgICAgIGlmICghaURvYyB8fCBpRG9jLl9vcHRpYm90UmVjb3JkZXIpIGNvbnRpbnVlOyAvKiBkXHUwMEU5alx1MDBFMCBhdHRhY2hcdTAwRTkgKi9cbiAgICAgICAgaURvYy5fb3B0aWJvdFJlY29yZGVyID0gdHJ1ZTtcbiAgICAgICAgaURvYy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgb25SZWNvcmRlckNsaWNrLCB0cnVlKTtcbiAgICAgICAgaURvYy5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIG9uUmVjb3JkZXJDaGFuZ2UsIHRydWUpO1xuICAgICAgICBpRG9jLmFkZEV2ZW50TGlzdGVuZXIoXCJibHVyXCIsIG9uUmVjb3JkZXJCbHVyLCB0cnVlKTtcbiAgICAgIH0gY2F0Y2goZSkgeyAvKiBjcm9zcy1vcmlnaW4gXHUyMDE0IGluYWNjZXNzaWJsZSAqLyB9XG4gICAgfVxuICB9XG4gIGF0dGFjaFJlY29yZGVyVG9JZnJhbWVzKCk7XG5cbiAgLyogT2JzZXJ2ZXIgbGVzIGlmcmFtZXMgcXVpIGFwcGFyYWlzc2VudCBkeW5hbWlxdWVtZW50ICovXG4gIHZhciBpZnJhbWVPYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uKCkge1xuICAgIGF0dGFjaFJlY29yZGVyVG9JZnJhbWVzKCk7XG4gIH0pO1xuICBpZnJhbWVPYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHsgY2hpbGRMaXN0OiB0cnVlLCBzdWJ0cmVlOiB0cnVlIH0pO1xuICByZWNvcmRlclN0YXRlLl9pZnJhbWVPYnNlcnZlciA9IGlmcmFtZU9ic2VydmVyO1xuXG4gIC8qIFBlcnNpc3RlciBsJ1x1MDBFOXRhdCBkYW5zIGNocm9tZS5zdG9yYWdlIHBvdXIgc3Vydml2cmUgYXV4IG5hdmlnYXRpb25zICovXG4gIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7IG9wdGlib3RfcmVjb3JkZXI6IHsgYWN0aXZlOiB0cnVlLCBldGFwZXM6IFtdLCBob3N0bmFtZTogcmVjb3JkZXJTdGF0ZS5ob3N0bmFtZSwgc3RhcnRUaW1lOiByZWNvcmRlclN0YXRlLnN0YXJ0VGltZSB9IH0pO1xuXG4gIC8qIEFmZmljaGVyIGxlIHBhbm5lYXUgZ3VpZFx1MDBFOSBsYXRcdTAwRTlyYWwgKi9cbiAgc2hvd1JlY29yZGVyUGFuZWwoKTtcbiAgdXBkYXRlUmVjb3JkZXJQYW5lbCgpO1xuXG4gIHNob3dSUEFUb2FzdChcIlx1MjNGQSBFbnJlZ2lzdHJlbWVudCBkXHUwMEU5bWFyclx1MDBFOSBcdTIwMTQgZWZmZWN0dWV6IGxlIHBhcmNvdXJzXCIsIFwiaW5mb1wiKTtcbn1cblxuLyogQXJyXHUwMEVBdGVyIGwnZW5yZWdpc3RyZW1lbnQgZXQgYWZmaWNoZXIgbGUgbW9kYWwgZGUgY29uZmlybWF0aW9uICovXG5hc3luYyBmdW5jdGlvbiBzdG9wUmVjb3JkZXIoKSB7XG4gIGlmICghcmVjb3JkZXJTdGF0ZSkgcmV0dXJuO1xuXG4gIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBvblJlY29yZGVyQ2xpY2ssIHRydWUpO1xuICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIG9uUmVjb3JkZXJDaGFuZ2UsIHRydWUpO1xuICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiYmx1clwiLCBvblJlY29yZGVyQmx1ciwgdHJ1ZSk7XG5cbiAgLyogRFx1MDBFOXRhY2hlciBsZXMgbGlzdGVuZXJzIGRlcyBpZnJhbWVzICsgc3RvcHBlciBsJ29ic2VydmVyICovXG4gIGlmIChyZWNvcmRlclN0YXRlLl9pZnJhbWVPYnNlcnZlcikge1xuICAgIHJlY29yZGVyU3RhdGUuX2lmcmFtZU9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgfVxuICB0cnkge1xuICAgIHZhciBpZnJhbWVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcImlmcmFtZVwiKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGlmcmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciBpRG9jID0gaWZyYW1lc1tpXS5jb250ZW50RG9jdW1lbnQgfHwgKGlmcmFtZXNbaV0uY29udGVudFdpbmRvdyAmJiBpZnJhbWVzW2ldLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQpO1xuICAgICAgICBpZiAoIWlEb2MpIGNvbnRpbnVlO1xuICAgICAgICBpRG9jLl9vcHRpYm90UmVjb3JkZXIgPSBmYWxzZTtcbiAgICAgICAgaURvYy5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgb25SZWNvcmRlckNsaWNrLCB0cnVlKTtcbiAgICAgICAgaURvYy5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIG9uUmVjb3JkZXJDaGFuZ2UsIHRydWUpO1xuICAgICAgICBpRG9jLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJibHVyXCIsIG9uUmVjb3JkZXJCbHVyLCB0cnVlKTtcbiAgICAgIH0gY2F0Y2goZSkge31cbiAgICB9XG4gIH0gY2F0Y2goZSkge31cblxuICB2YXIgYmFkZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm9wdGlib3QtcmVjb3JkZXItYmFkZ2VcIik7XG4gIGlmIChiYWRnZSkgYmFkZ2UucmVtb3ZlKCk7XG5cbiAgLyogUmV0aXJlciBsZSBwYW5uZWF1IGd1aWRcdTAwRTkgZXQgbGVzIGhpZ2hsaWdodHMgKi9cbiAgdmFyIHBhbmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJvcHRpYm90LXJlY29yZGVyLXBhbmVsXCIpO1xuICBpZiAocGFuZWwpIHBhbmVsLnJlbW92ZSgpO1xuICByZW1vdmVSZWNvcmRlckhpZ2hsaWdodHMoKTtcblxuICB2YXIgZXRhcGVzID0gcmVjb3JkZXJTdGF0ZS5ldGFwZXM7XG4gIHZhciBob3N0bmFtZSA9IHJlY29yZGVyU3RhdGUuaG9zdG5hbWU7XG4gIHJlY29yZGVyU3RhdGUgPSBudWxsO1xuXG4gIC8qIE5ldHRveWVyIGxlIHN0b3JhZ2UgKi9cbiAgY2hyb21lLnN0b3JhZ2UubG9jYWwucmVtb3ZlKFwib3B0aWJvdF9yZWNvcmRlclwiKTtcblxuICBpZiAoZXRhcGVzLmxlbmd0aCA9PT0gMCkge1xuICAgIHNob3dSUEFUb2FzdChcIkF1Y3VuZSBcdTAwRTl0YXBlIGVucmVnaXN0clx1MDBFOWUuXCIsIFwiaW5mb1wiKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvKiBBZmZpY2hlciBsZSB3aXphcmQgMyBcdTAwRTl0YXBlcyAqL1xuICBzaG93UmVjb3JkZXJXaXphcmQoZXRhcGVzLCBob3N0bmFtZSk7XG59XG5cbi8qIEVudm95ZXIgbGUgcGFyY291cnMgZW5yZWdpc3RyXHUwMEU5IGF1IHNlcnZldXIgKi9cbmFzeW5jIGZ1bmN0aW9uIHNlbmRSZWNvcmRlclBhcmNvdXJzKGV0YXBlcywgaG9zdG5hbWUsIG5vbSkge1xuICB2YXIgc3luY1Rva2VuID0gYXdhaXQgZ2V0U3luY1Rva2VuKCk7XG4gIGlmICghc3luY1Rva2VuKSB7XG4gICAgc2hvd1JQQVRvYXN0KFwiRXJyZXVyIDogbm9uIGNvbm5lY3RcdTAwRTkuXCIsIFwiZXJyb3JcIik7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdHJ5IHtcbiAgICB2YXIgcmVzID0gYXdhaXQgZmV0Y2goXCJodHRwczovL29wdGlib3QuZnIvYXBpL2V4dGVuc2lvbi9wYXJjb3Vycy9zYXZlXCIsIHtcbiAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIHRva2VuOiBzeW5jVG9rZW4sXG4gICAgICAgIGhvc3RuYW1lOiBob3N0bmFtZSxcbiAgICAgICAgbm9tOiBub20sXG4gICAgICAgIGV0YXBlczogZXRhcGVzLFxuICAgICAgfSksXG4gICAgfSk7XG4gICAgaWYgKHJlcy5vaykge1xuICAgICAgc2hvd1JQQVRvYXN0KFwiXHUyNzA1IFBhcmNvdXJzIGVucmVnaXN0clx1MDBFOSAoXCIgKyBldGFwZXMubGVuZ3RoICsgXCIgXHUwMEU5dGFwZXMpIFx1MjAxNCBlbiBhdHRlbnRlIGRlIHZhbGlkYXRpb24gYWRtaW5cIiwgXCJzdWNjZXNzXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzaG93UlBBVG9hc3QoXCJFcnJldXIgbG9ycyBkZSBsJ2VucmVnaXN0cmVtZW50LlwiLCBcImVycm9yXCIpO1xuICAgIH1cbiAgfSBjYXRjaChlKSB7XG4gICAgc2hvd1JQQVRvYXN0KFwiRXJyZXVyIHJcdTAwRTlzZWF1LlwiLCBcImVycm9yXCIpO1xuICB9XG59XG5cbi8qIFx1MjUwMFx1MjUwMCBXaXphcmQgMyBcdTAwRTl0YXBlcyBcdTIwMTQgcmVtcGxhY2UgbGUgbW9kYWwgZGUgY29uZmlybWF0aW9uIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuXG5mdW5jdGlvbiBzaG93UmVjb3JkZXJXaXphcmQoZXRhcGVzLCBob3N0bmFtZSkge1xuICB2YXIgZXhpc3RpbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm9wdGlib3QtcmVjb3JkZXItbW9kYWwtb3ZlcmxheVwiKTtcbiAgaWYgKGV4aXN0aW5nKSBleGlzdGluZy5yZW1vdmUoKTtcblxuICB2YXIgY3VycmVudFN0ZXAgPSAxO1xuICB2YXIgbm9tUG9ydGFpbCA9IGhvc3RuYW1lO1xuXG4gIC8qIFZhcmlhYmxlcyBkaXNwb25pYmxlcyBwb3VyIGNvcnJlY3Rpb24gbWFudWVsbGUgKi9cbiAgdmFyIHZhcmlhYmxlT3B0aW9ucyA9IFtcbiAgICBcInt7bnNzfX1cIiwgXCJ7e25vbX19XCIsIFwie3twcmVub219fVwiLCBcInt7ZGF0ZU5haXNzYW5jZX19XCIsIFwie3tkYXRlT3Jkb25uYW5jZX19XCIsXG4gICAgXCJ7e251bWVyb0FkaGVyZW50fX1cIiwgXCJ7e29yZ2FuaXNtZX19XCIsIFwie3tzcGhlcmVfb2R9fVwiLCBcInt7c3BoZXJlX29nfX1cIixcbiAgICBcInt7Y3lsaW5kcmVfb2R9fVwiLCBcInt7Y3lsaW5kcmVfb2d9fVwiLCBcInt7YXhlX29kfX1cIiwgXCJ7e2F4ZV9vZ319XCIsIFwie3thZGRpdGlvbn19XCIsXG4gICAgXCJJZ25vcmVyIGNlIGNoYW1wXCJcbiAgXTtcblxuICAvKiBPdmVybGF5ICovXG4gIHZhciBvdmVybGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgb3ZlcmxheS5pZCA9IFwib3B0aWJvdC1yZWNvcmRlci1tb2RhbC1vdmVybGF5XCI7XG4gIG92ZXJsYXkuc3R5bGUuY3NzVGV4dCA9IFwicG9zaXRpb246Zml4ZWQ7dG9wOjA7bGVmdDowO3dpZHRoOjEwMCU7aGVpZ2h0OjEwMCU7YmFja2dyb3VuZDpyZ2JhKDAsMCwwLDAuNSk7ei1pbmRleDoyMTQ3NDgzNjQ3O2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtmb250LWZhbWlseTpzYW5zLXNlcmlmO1wiO1xuXG4gIC8qIENhcnRlICovXG4gIHZhciBjYXJkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgY2FyZC5zdHlsZS5jc3NUZXh0ID0gXCJiYWNrZ3JvdW5kOndoaXRlO2JvcmRlci1yYWRpdXM6MTZweDttYXgtd2lkdGg6NDgwcHg7d2lkdGg6OTIlO21heC1oZWlnaHQ6ODV2aDtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2JveC1zaGFkb3c6MCAyMHB4IDYwcHggcmdiYSgwLDAsMCwwLjMpO3BhZGRpbmc6MjRweDtcIjtcblxuICAvKiBJbmRpY2F0ZXVyIGRlIHByb2dyZXNzaW9uICovXG4gIHZhciBwcm9ncmVzcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIHByb2dyZXNzLnN0eWxlLmNzc1RleHQgPSBcInRleHQtYWxpZ246Y2VudGVyO21hcmdpbi1ib3R0b206MTZweDtmb250LXNpemU6MThweDtsZXR0ZXItc3BhY2luZzo0cHg7XCI7XG5cbiAgLyogQ29udGVuZXVyIGRlIGNvbnRlbnUgKGNoYW5nZSBcdTAwRTAgY2hhcXVlIFx1MDBFOXRhcGUpICovXG4gIHZhciBjb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgY29udGVudC5zdHlsZS5jc3NUZXh0ID0gXCJmbGV4OjE7b3ZlcmZsb3cteTphdXRvO21heC1oZWlnaHQ6NTV2aDtcIjtcblxuICAvKiBGb290ZXIgYm91dG9ucyAqL1xuICB2YXIgZm9vdGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgZm9vdGVyLnN0eWxlLmNzc1RleHQgPSBcImRpc3BsYXk6ZmxleDtqdXN0aWZ5LWNvbnRlbnQ6c3BhY2UtYmV0d2VlbjthbGlnbi1pdGVtczpjZW50ZXI7bWFyZ2luLXRvcDoxNnB4O2dhcDo4cHg7XCI7XG5cbiAgZnVuY3Rpb24gdXBkYXRlUHJvZ3Jlc3MoKSB7XG4gICAgdmFyIGRvdHMgPSBcIlwiO1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDw9IDM7IGkrKykge1xuICAgICAgZG90cyArPSAoaSA8PSBjdXJyZW50U3RlcCkgPyBcIlx1MjVDRiBcIiA6IFwiXHUyNUNCIFwiO1xuICAgIH1cbiAgICBwcm9ncmVzcy50ZXh0Q29udGVudCA9IGRvdHMudHJpbSgpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVuZGVyU3RlcCgpIHtcbiAgICBjb250ZW50LmlubmVySFRNTCA9IFwiXCI7XG4gICAgZm9vdGVyLmlubmVySFRNTCA9IFwiXCI7XG4gICAgdXBkYXRlUHJvZ3Jlc3MoKTtcblxuICAgIGlmIChjdXJyZW50U3RlcCA9PT0gMSkgcmVuZGVyU3RlcDEoKTtcbiAgICBlbHNlIGlmIChjdXJyZW50U3RlcCA9PT0gMikgcmVuZGVyU3RlcDIoKTtcbiAgICBlbHNlIGlmIChjdXJyZW50U3RlcCA9PT0gMykgcmVuZGVyU3RlcDMoKTtcbiAgfVxuXG4gIC8qIFx1MjUwMFx1MjUwMCBcdTAwQzl0YXBlIDEgXHUyMDE0IE5vbSBkdSBwb3J0YWlsIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuICBmdW5jdGlvbiByZW5kZXJTdGVwMSgpIHtcbiAgICB2YXIgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHRpdGxlLnN0eWxlLmNzc1RleHQgPSBcImZvbnQtc2l6ZToxNnB4O2ZvbnQtd2VpZ2h0OjcwMDtjb2xvcjojMTExO21hcmdpbi1ib3R0b206MTJweDtcIjtcbiAgICB0aXRsZS50ZXh0Q29udGVudCA9IFwiXHUyM0ZBIE5vbSBkdSBwb3J0YWlsXCI7XG5cbiAgICB2YXIgZGVzYyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgZGVzYy5zdHlsZS5jc3NUZXh0ID0gXCJmb250LXNpemU6MTNweDtjb2xvcjojNmI3MjgwO21hcmdpbi1ib3R0b206MTZweDtcIjtcbiAgICBkZXNjLnRleHRDb250ZW50ID0gXCJEb25uZXogdW4gbm9tIFx1MDBFMCBjZSBwYXJjb3VycyBwb3VyIGxlIHJldHJvdXZlciBmYWNpbGVtZW50LlwiO1xuXG4gICAgdmFyIGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xuICAgIGlucHV0LnR5cGUgPSBcInRleHRcIjtcbiAgICBpbnB1dC52YWx1ZSA9IG5vbVBvcnRhaWw7XG4gICAgaW5wdXQucGxhY2Vob2xkZXIgPSBob3N0bmFtZTtcbiAgICBpbnB1dC5zdHlsZS5jc3NUZXh0ID0gXCJ3aWR0aDoxMDAlO3BhZGRpbmc6MTBweCAxNHB4O2JvcmRlcjoxcHggc29saWQgI2QxZDVkYjtib3JkZXItcmFkaXVzOjhweDtmb250LXNpemU6MTRweDtib3gtc2l6aW5nOmJvcmRlci1ib3g7b3V0bGluZTpub25lO1wiO1xuICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJmb2N1c1wiLCBmdW5jdGlvbigpIHsgaW5wdXQuc3R5bGUuYm9yZGVyQ29sb3IgPSBcIiMzYjgyZjZcIjsgfSk7XG4gICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImJsdXJcIiwgZnVuY3Rpb24oKSB7IGlucHV0LnN0eWxlLmJvcmRlckNvbG9yID0gXCIjZDFkNWRiXCI7IH0pO1xuICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCBmdW5jdGlvbigpIHsgbm9tUG9ydGFpbCA9IGlucHV0LnZhbHVlLnRyaW0oKSB8fCBob3N0bmFtZTsgfSk7XG5cbiAgICBjb250ZW50LmFwcGVuZENoaWxkKHRpdGxlKTtcbiAgICBjb250ZW50LmFwcGVuZENoaWxkKGRlc2MpO1xuICAgIGNvbnRlbnQuYXBwZW5kQ2hpbGQoaW5wdXQpO1xuXG4gICAgLyogQm91dG9ucyAqL1xuICAgIHZhciBjYW5jZWxCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICAgIGNhbmNlbEJ0bi5zdHlsZS5jc3NUZXh0ID0gXCJwYWRkaW5nOjhweCAxNnB4O2JvcmRlcjoxcHggc29saWQgI2QxZDVkYjtib3JkZXItcmFkaXVzOjhweDtiYWNrZ3JvdW5kOndoaXRlO2NvbG9yOiMzNzQxNTE7Zm9udC1zaXplOjEzcHg7Zm9udC13ZWlnaHQ6NTAwO2N1cnNvcjpwb2ludGVyO1wiO1xuICAgIGNhbmNlbEJ0bi50ZXh0Q29udGVudCA9IFwiQW5udWxlclwiO1xuICAgIGNhbmNlbEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7IG92ZXJsYXkucmVtb3ZlKCk7IHNob3dSUEFUb2FzdChcIkVudm9pIGFubnVsXHUwMEU5LlwiLCBcImluZm9cIik7IH0pO1xuXG4gICAgdmFyIG5leHRCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICAgIG5leHRCdG4uc3R5bGUuY3NzVGV4dCA9IFwicGFkZGluZzo4cHggMjBweDtib3JkZXI6bm9uZTtib3JkZXItcmFkaXVzOjhweDtiYWNrZ3JvdW5kOiMzYjgyZjY7Y29sb3I6d2hpdGU7Zm9udC1zaXplOjEzcHg7Zm9udC13ZWlnaHQ6NjAwO2N1cnNvcjpwb2ludGVyO1wiO1xuICAgIG5leHRCdG4udGV4dENvbnRlbnQgPSBcIlN1aXZhbnQgXHUyMTkyXCI7XG4gICAgbmV4dEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7IGN1cnJlbnRTdGVwID0gMjsgcmVuZGVyU3RlcCgpOyB9KTtcblxuICAgIGZvb3Rlci5hcHBlbmRDaGlsZChjYW5jZWxCdG4pO1xuICAgIGZvb3Rlci5hcHBlbmRDaGlsZChuZXh0QnRuKTtcblxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IGlucHV0LmZvY3VzKCk7IGlucHV0LnNlbGVjdCgpOyB9LCA1MCk7XG4gIH1cblxuICAvKiBcdTI1MDBcdTI1MDAgXHUwMEM5dGFwZSAyIFx1MjAxNCBWXHUwMEU5cmlmaWNhdGlvbiBkZXMgY2hhbXBzIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuICBmdW5jdGlvbiByZW5kZXJTdGVwMigpIHtcbiAgICB2YXIgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHRpdGxlLnN0eWxlLmNzc1RleHQgPSBcImZvbnQtc2l6ZToxNnB4O2ZvbnQtd2VpZ2h0OjcwMDtjb2xvcjojMTExO21hcmdpbi1ib3R0b206MTJweDtcIjtcbiAgICB0aXRsZS50ZXh0Q29udGVudCA9IFwiXHVEODNEXHVERDBEIFZcdTAwRTlyaWZpY2F0aW9uIGRlcyBjaGFtcHNcIjtcblxuICAgIHZhciBkZXNjID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBkZXNjLnN0eWxlLmNzc1RleHQgPSBcImZvbnQtc2l6ZToxM3B4O2NvbG9yOiM2YjcyODA7bWFyZ2luLWJvdHRvbToxNnB4O1wiO1xuICAgIGRlc2MudGV4dENvbnRlbnQgPSBcIlZcdTAwRTlyaWZpZXogbGVzIHZhcmlhYmxlcyBkXHUwMEU5dGVjdFx1MDBFOWVzLiBDb3JyaWdleiBsZXMgY2hhbXBzIG9yYW5nZSBtYW51ZWxsZW1lbnQuXCI7XG5cbiAgICBjb250ZW50LmFwcGVuZENoaWxkKHRpdGxlKTtcbiAgICBjb250ZW50LmFwcGVuZENoaWxkKGRlc2MpO1xuXG4gICAgdmFyIGZpbGxTdGVwcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXRhcGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoZXRhcGVzW2ldLmFjdGlvbiA9PT0gXCJmaWxsXCIgfHwgZXRhcGVzW2ldLmFjdGlvbiA9PT0gXCJzZWxlY3RcIikgZmlsbFN0ZXBzLnB1c2goaSk7XG4gICAgfVxuXG4gICAgaWYgKGZpbGxTdGVwcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHZhciBub0ZpbGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgbm9GaWxsLnN0eWxlLmNzc1RleHQgPSBcImZvbnQtc2l6ZToxM3B4O2NvbG9yOiM5Y2EzYWY7dGV4dC1hbGlnbjpjZW50ZXI7cGFkZGluZzoyMHB4IDA7XCI7XG4gICAgICBub0ZpbGwudGV4dENvbnRlbnQgPSBcIkF1Y3VuIGNoYW1wIGRlIHNhaXNpZSBkXHUwMEU5dGVjdFx1MDBFOSBcdTIwMTQgdW5pcXVlbWVudCBkZXMgY2xpY3MuXCI7XG4gICAgICBjb250ZW50LmFwcGVuZENoaWxkKG5vRmlsbCk7XG4gICAgfVxuXG4gICAgZm9yICh2YXIgZmkgPSAwOyBmaSA8IGZpbGxTdGVwcy5sZW5ndGg7IGZpKyspIHtcbiAgICAgIChmdW5jdGlvbihldGFwZUlkeCkge1xuICAgICAgICB2YXIgc3RlcCA9IGV0YXBlc1tldGFwZUlkeF07XG4gICAgICAgIHZhciBpc0tub3duID0gc3RlcC52YXJpYWJsZSAmJiBzdGVwLnZhcmlhYmxlLmluZGV4T2YoXCJ7e1wiKSA9PT0gMDtcbiAgICAgICAgdmFyIGlzU3RhdGljID0gIXN0ZXAudmFyaWFibGUgfHwgc3RlcC52YXJpYWJsZSA9PT0gXCJbVkFMRVVSIFNUQVRJUVVFIFx1MjAxNCBcdTAwQzAgUkVOU0VJR05FUl1cIjtcblxuICAgICAgICB2YXIgcm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgcm93LnN0eWxlLmNzc1RleHQgPSBcImRpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweDtwYWRkaW5nOjhweCAwO2JvcmRlci1ib3R0b206MXB4IHNvbGlkICNmM2Y0ZjY7XCI7XG5cbiAgICAgICAgdmFyIGxhYmVsU3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgICAgICBsYWJlbFNwYW4uc3R5bGUuY3NzVGV4dCA9IFwiZm9udC1zaXplOjEzcHg7Y29sb3I6IzM3NDE1MTtmbGV4OjE7bWluLXdpZHRoOjA7b3ZlcmZsb3c6aGlkZGVuO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7d2hpdGUtc3BhY2U6bm93cmFwO1wiO1xuICAgICAgICBsYWJlbFNwYW4udGV4dENvbnRlbnQgPSAoc3RlcC5sYWJlbCB8fCBcIkNoYW1wXCIpLnNsaWNlKDAsIDMwKTtcblxuICAgICAgICBpZiAoaXNLbm93bikge1xuICAgICAgICAgIHZhciBiYWRnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgICAgICAgIGJhZGdlLnN0eWxlLmNzc1RleHQgPSBcImZvbnQtc2l6ZToxMXB4O2JhY2tncm91bmQ6I2QxZmFlNTtjb2xvcjojMDY1ZjQ2O3BhZGRpbmc6MnB4IDhweDtib3JkZXItcmFkaXVzOjRweDt3aGl0ZS1zcGFjZTpub3dyYXA7XCI7XG4gICAgICAgICAgYmFkZ2UudGV4dENvbnRlbnQgPSBcImF1dG9tYXRpcXVlIFwiICsgc3RlcC52YXJpYWJsZTtcbiAgICAgICAgICByb3cuYXBwZW5kQ2hpbGQobGFiZWxTcGFuKTtcbiAgICAgICAgICByb3cuYXBwZW5kQ2hpbGQoYmFkZ2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBzZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2VsZWN0XCIpO1xuICAgICAgICAgIHNlbC5zdHlsZS5jc3NUZXh0ID0gXCJmb250LXNpemU6MTJweDtwYWRkaW5nOjRweCA2cHg7Ym9yZGVyOjFweCBzb2xpZCAjZjU5ZTBiO2JvcmRlci1yYWRpdXM6NHB4O2JhY2tncm91bmQ6I2ZmZmJlYjtjb2xvcjojOTI0MDBlO21heC13aWR0aDoxNjBweDtcIjtcbiAgICAgICAgICAvKiBPcHRpb24gcGFyIGRcdTAwRTlmYXV0ICovXG4gICAgICAgICAgdmFyIGRlZmF1bHRPcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIpO1xuICAgICAgICAgIGRlZmF1bHRPcHQudmFsdWUgPSBcIlwiO1xuICAgICAgICAgIGRlZmF1bHRPcHQudGV4dENvbnRlbnQgPSBcIlx1MjZBMFx1RkUwRiBcdTAwQzAgbWFwcGVyXCI7XG4gICAgICAgICAgZGVmYXVsdE9wdC5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgc2VsLmFwcGVuZENoaWxkKGRlZmF1bHRPcHQpO1xuICAgICAgICAgIGZvciAodmFyIHZpID0gMDsgdmkgPCB2YXJpYWJsZU9wdGlvbnMubGVuZ3RoOyB2aSsrKSB7XG4gICAgICAgICAgICB2YXIgb3B0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIm9wdGlvblwiKTtcbiAgICAgICAgICAgIG9wdC52YWx1ZSA9IHZhcmlhYmxlT3B0aW9uc1t2aV07XG4gICAgICAgICAgICBvcHQudGV4dENvbnRlbnQgPSB2YXJpYWJsZU9wdGlvbnNbdmldO1xuICAgICAgICAgICAgc2VsLmFwcGVuZENoaWxkKG9wdCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHNlbC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKGV2KSB7XG4gICAgICAgICAgICB2YXIgdmFsID0gZXYudGFyZ2V0LnZhbHVlO1xuICAgICAgICAgICAgaWYgKHZhbCA9PT0gXCJJZ25vcmVyIGNlIGNoYW1wXCIpIHtcbiAgICAgICAgICAgICAgc3RlcC52YXJpYWJsZSA9IG51bGw7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZhbCkge1xuICAgICAgICAgICAgICBzdGVwLnZhcmlhYmxlID0gdmFsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJvdy5hcHBlbmRDaGlsZChsYWJlbFNwYW4pO1xuICAgICAgICAgIHJvdy5hcHBlbmRDaGlsZChzZWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29udGVudC5hcHBlbmRDaGlsZChyb3cpO1xuICAgICAgfSkoZmlsbFN0ZXBzW2ZpXSk7XG4gICAgfVxuXG4gICAgLyogQm91dG9ucyAqL1xuICAgIHZhciBiYWNrQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgICBiYWNrQnRuLnN0eWxlLmNzc1RleHQgPSBcInBhZGRpbmc6OHB4IDE2cHg7Ym9yZGVyOjFweCBzb2xpZCAjZDFkNWRiO2JvcmRlci1yYWRpdXM6OHB4O2JhY2tncm91bmQ6d2hpdGU7Y29sb3I6IzM3NDE1MTtmb250LXNpemU6MTNweDtmb250LXdlaWdodDo1MDA7Y3Vyc29yOnBvaW50ZXI7XCI7XG4gICAgYmFja0J0bi50ZXh0Q29udGVudCA9IFwiXHUyMTkwIFJldG91clwiO1xuICAgIGJhY2tCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkgeyBjdXJyZW50U3RlcCA9IDE7IHJlbmRlclN0ZXAoKTsgfSk7XG5cbiAgICB2YXIgbmV4dEJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgbmV4dEJ0bi5zdHlsZS5jc3NUZXh0ID0gXCJwYWRkaW5nOjhweCAyMHB4O2JvcmRlcjpub25lO2JvcmRlci1yYWRpdXM6OHB4O2JhY2tncm91bmQ6IzNiODJmNjtjb2xvcjp3aGl0ZTtmb250LXNpemU6MTNweDtmb250LXdlaWdodDo2MDA7Y3Vyc29yOnBvaW50ZXI7XCI7XG4gICAgbmV4dEJ0bi50ZXh0Q29udGVudCA9IFwiU3VpdmFudCBcdTIxOTJcIjtcbiAgICBuZXh0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHsgY3VycmVudFN0ZXAgPSAzOyByZW5kZXJTdGVwKCk7IH0pO1xuXG4gICAgZm9vdGVyLmFwcGVuZENoaWxkKGJhY2tCdG4pO1xuICAgIGZvb3Rlci5hcHBlbmRDaGlsZChuZXh0QnRuKTtcbiAgfVxuXG4gIC8qIFx1MjUwMFx1MjUwMCBcdTAwQzl0YXBlIDMgXHUyMDE0IFJcdTAwRTljYXAgZXQgZW52b2kgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG4gIGZ1bmN0aW9uIHJlbmRlclN0ZXAzKCkge1xuICAgIHZhciBhdXRvQ291bnQgPSAwO1xuICAgIHZhciBtYW51YWxDb3VudCA9IDA7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBldGFwZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChldGFwZXNbaV0uYWN0aW9uID09PSBcImZpbGxcIiB8fCBldGFwZXNbaV0uYWN0aW9uID09PSBcInNlbGVjdFwiKSB7XG4gICAgICAgIGlmIChldGFwZXNbaV0udmFyaWFibGUgJiYgZXRhcGVzW2ldLnZhcmlhYmxlLmluZGV4T2YoXCJ7e1wiKSA9PT0gMCkgYXV0b0NvdW50Kys7XG4gICAgICAgIGVsc2UgbWFudWFsQ291bnQrKztcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHRpdGxlLnN0eWxlLmNzc1RleHQgPSBcImZvbnQtc2l6ZToyMHB4O2ZvbnQtd2VpZ2h0OjcwMDtjb2xvcjojMTExO3RleHQtYWxpZ246Y2VudGVyO21hcmdpbi1ib3R0b206OHB4O1wiO1xuICAgIHRpdGxlLnRleHRDb250ZW50ID0gXCJcdUQ4M0NcdURGODkgUGFyY291cnMgcHJcdTAwRUF0ICFcIjtcblxuICAgIHZhciBzdGF0cyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgc3RhdHMuc3R5bGUuY3NzVGV4dCA9IFwiZm9udC1zaXplOjE0cHg7Y29sb3I6IzZiNzI4MDt0ZXh0LWFsaWduOmNlbnRlcjttYXJnaW4tYm90dG9tOjI0cHg7XCI7XG4gICAgc3RhdHMudGV4dENvbnRlbnQgPSBldGFwZXMubGVuZ3RoICsgXCIgXHUwMEU5dGFwZXMgXHUwMEI3IFwiICsgYXV0b0NvdW50ICsgXCIgY2hhbXBzIGF1dG9tYXRpcXVlcyBcdTAwQjcgXCIgKyBtYW51YWxDb3VudCArIFwiIGNoYW1wcyBtYW51ZWxzXCI7XG5cbiAgICBjb250ZW50LmFwcGVuZENoaWxkKHRpdGxlKTtcbiAgICBjb250ZW50LmFwcGVuZENoaWxkKHN0YXRzKTtcblxuICAgIC8qIEJvdXRvbiBFbnZveWVyICovXG4gICAgdmFyIHNlbmRCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICAgIHNlbmRCdG4uc3R5bGUuY3NzVGV4dCA9IFwid2lkdGg6MTAwJTtwYWRkaW5nOjEycHg7Ym9yZGVyOm5vbmU7Ym9yZGVyLXJhZGl1czo4cHg7YmFja2dyb3VuZDojM2I4MmY2O2NvbG9yOndoaXRlO2ZvbnQtc2l6ZToxNHB4O2ZvbnQtd2VpZ2h0OjYwMDtjdXJzb3I6cG9pbnRlcjttYXJnaW4tYm90dG9tOjhweDtcIjtcbiAgICBzZW5kQnRuLnRleHRDb250ZW50ID0gXCJFbnZveWVyIFx1MDBFMCBPcHRpQm90XCI7XG4gICAgc2VuZEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICBvdmVybGF5LnJlbW92ZSgpO1xuICAgICAgc2VuZFJlY29yZGVyUGFyY291cnMoZXRhcGVzLCBob3N0bmFtZSwgbm9tUG9ydGFpbCk7XG4gICAgfSk7XG4gICAgY29udGVudC5hcHBlbmRDaGlsZChzZW5kQnRuKTtcblxuICAgIC8qIEJvdXRvbiBUXHUwMEU5bFx1MDBFOWNoYXJnZXIgSlNPTiAqL1xuICAgIHZhciBkbEJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgZGxCdG4uc3R5bGUuY3NzVGV4dCA9IFwid2lkdGg6MTAwJTtwYWRkaW5nOjEycHg7Ym9yZGVyOjFweCBzb2xpZCAjZDFkNWRiO2JvcmRlci1yYWRpdXM6OHB4O2JhY2tncm91bmQ6d2hpdGU7Y29sb3I6IzM3NDE1MTtmb250LXNpemU6MTRweDtmb250LXdlaWdodDo1MDA7Y3Vyc29yOnBvaW50ZXI7bWFyZ2luLWJvdHRvbTo4cHg7XCI7XG4gICAgZGxCdG4udGV4dENvbnRlbnQgPSBcIlRcdTAwRTlsXHUwMEU5Y2hhcmdlciBKU09OXCI7XG4gICAgZGxCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGJsb2IgPSBuZXcgQmxvYihbSlNPTi5zdHJpbmdpZnkoeyBob3N0bmFtZTogaG9zdG5hbWUsIG5vbTogbm9tUG9ydGFpbCwgZXRhcGVzOiBldGFwZXMgfSwgbnVsbCwgMildLCB7IHR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiIH0pO1xuICAgICAgdmFyIHVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgICB2YXIgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xuICAgICAgYS5ocmVmID0gdXJsO1xuICAgICAgYS5kb3dubG9hZCA9IFwib3B0aWJvdC1wYXJjb3Vycy1cIiArIGhvc3RuYW1lICsgXCIuanNvblwiO1xuICAgICAgYS5jbGljaygpO1xuICAgICAgVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpO1xuICAgIH0pO1xuICAgIGNvbnRlbnQuYXBwZW5kQ2hpbGQoZGxCdG4pO1xuXG4gICAgLyogQm91dG9ucyBmb290ZXIgKi9cbiAgICB2YXIgYmFja0J0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgYmFja0J0bi5zdHlsZS5jc3NUZXh0ID0gXCJwYWRkaW5nOjhweCAxNnB4O2JvcmRlcjoxcHggc29saWQgI2QxZDVkYjtib3JkZXItcmFkaXVzOjhweDtiYWNrZ3JvdW5kOndoaXRlO2NvbG9yOiMzNzQxNTE7Zm9udC1zaXplOjEzcHg7Zm9udC13ZWlnaHQ6NTAwO2N1cnNvcjpwb2ludGVyO1wiO1xuICAgIGJhY2tCdG4udGV4dENvbnRlbnQgPSBcIlx1MjE5MCBSZXRvdXJcIjtcbiAgICBiYWNrQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHsgY3VycmVudFN0ZXAgPSAyOyByZW5kZXJTdGVwKCk7IH0pO1xuXG4gICAgdmFyIGNhbmNlbEJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgY2FuY2VsQnRuLnN0eWxlLmNzc1RleHQgPSBcInBhZGRpbmc6OHB4IDE2cHg7Ym9yZGVyOjFweCBzb2xpZCAjZDFkNWRiO2JvcmRlci1yYWRpdXM6OHB4O2JhY2tncm91bmQ6d2hpdGU7Y29sb3I6I2VmNDQ0NDtmb250LXNpemU6MTNweDtmb250LXdlaWdodDo1MDA7Y3Vyc29yOnBvaW50ZXI7XCI7XG4gICAgY2FuY2VsQnRuLnRleHRDb250ZW50ID0gXCJBbm51bGVyXCI7XG4gICAgY2FuY2VsQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHsgb3ZlcmxheS5yZW1vdmUoKTsgc2hvd1JQQVRvYXN0KFwiRW52b2kgYW5udWxcdTAwRTkuXCIsIFwiaW5mb1wiKTsgfSk7XG5cbiAgICBmb290ZXIuYXBwZW5kQ2hpbGQoYmFja0J0bik7XG4gICAgZm9vdGVyLmFwcGVuZENoaWxkKGNhbmNlbEJ0bik7XG4gIH1cblxuICAvKiBBc3NlbWJsZXIgKi9cbiAgY2FyZC5hcHBlbmRDaGlsZChwcm9ncmVzcyk7XG4gIGNhcmQuYXBwZW5kQ2hpbGQoY29udGVudCk7XG4gIGNhcmQuYXBwZW5kQ2hpbGQoZm9vdGVyKTtcbiAgb3ZlcmxheS5hcHBlbmRDaGlsZChjYXJkKTtcblxuICAvKiBGZXJtZXIgZW4gY2xpcXVhbnQgc3VyIGwnb3ZlcmxheSAoaG9ycyBjYXJ0ZSkgKi9cbiAgb3ZlcmxheS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXYpIHtcbiAgICBpZiAoZXYudGFyZ2V0ID09PSBvdmVybGF5KSB7XG4gICAgICBvdmVybGF5LnJlbW92ZSgpO1xuICAgICAgc2hvd1JQQVRvYXN0KFwiRW52b2kgYW5udWxcdTAwRTkuXCIsIFwiaW5mb1wiKTtcbiAgICB9XG4gIH0pO1xuXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQob3ZlcmxheSk7XG4gIHJlbmRlclN0ZXAoKTtcbn1cblxuLyogUkdQRCBcdTIwMTQgQW5vbnltaXNlIGxlIHNuYXBzaG90IEhUTUwgYXZhbnQgZW52b2kgKHN1cHByaW1lIHZhbGV1cnMgcGF0aWVudCwgc2NyaXB0cywgZGF0YS1hdHRycyBzZW5zaWJsZXMpICovXG5mdW5jdGlvbiBhbm9ueW1pemVIdG1sU25hcHNob3QoKSB7XG4gIHRyeSB7XG4gICAgdmFyIGNsb25lID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICAvKiBWaWRlciB0b3V0ZXMgbGVzIHZhbGV1cnMgZGVzIGlucHV0cyAoZG9ublx1MDBFOWVzIHBhdGllbnQgcG90ZW50aWVsbGVzKSAqL1xuICAgIHZhciBpbnB1dHMgPSBjbG9uZS5xdWVyeVNlbGVjdG9yQWxsKFwiaW5wdXQsIHRleHRhcmVhLCBzZWxlY3RcIik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbnB1dHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlucHV0c1tpXS52YWx1ZSA9IFwiXCI7XG4gICAgICBpbnB1dHNbaV0ucmVtb3ZlQXR0cmlidXRlKFwidmFsdWVcIik7XG4gICAgfVxuICAgIC8qIFN1cHByaW1lciBsZXMgc2NyaXB0cyBpbmxpbmUgKGludXRpbGVzIHBvdXIgbGUgZHJ5LXJ1bikgKi9cbiAgICB2YXIgc2NyaXB0cyA9IGNsb25lLnF1ZXJ5U2VsZWN0b3JBbGwoXCJzY3JpcHRcIik7XG4gICAgZm9yICh2YXIgcyA9IDA7IHMgPCBzY3JpcHRzLmxlbmd0aDsgcysrKSB7IHNjcmlwdHNbc10ucmVtb3ZlKCk7IH1cbiAgICAvKiBTdXBwcmltZXIgbGVzIGRvbm5cdTAwRTllcyBkYW5zIGxlcyBhdHRyaWJ1dHMgZGF0YS0gKHBldXZlbnQgY29udGVuaXIgZGVzIGluZm9zIHBhdGllbnQpICovXG4gICAgdmFyIGRhdGFFbHMgPSBjbG9uZS5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtbnNzXSwgW2RhdGEtbm9tXSwgW2RhdGEtcHJlbm9tXSwgW2RhdGEtc2VjdV0sIFtkYXRhLXBhdGllbnRdXCIpO1xuICAgIGZvciAodmFyIGQgPSAwOyBkIDwgZGF0YUVscy5sZW5ndGg7IGQrKykge1xuICAgICAgW1wiZGF0YS1uc3NcIixcImRhdGEtbm9tXCIsXCJkYXRhLXByZW5vbVwiLFwiZGF0YS1zZWN1XCIsXCJkYXRhLXBhdGllbnRcIl0uZm9yRWFjaChmdW5jdGlvbihhdHRyKSB7XG4gICAgICAgIGRhdGFFbHNbZF0ucmVtb3ZlQXR0cmlidXRlKGF0dHIpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBjbG9uZS5vdXRlckhUTUw7XG4gIH0gY2F0Y2goZSkge1xuICAgIHJldHVybiBcIlwiOyAvKiBFbiBjYXMgZCdlcnJldXIsIG5lIHBhcyBlbnZveWVyIGRlIHNuYXBzaG90ICovXG4gIH1cbn1cblxuLyogSGFuZGxlciBjbGljayAqL1xuYXN5bmMgZnVuY3Rpb24gb25SZWNvcmRlckNsaWNrKGUpIHtcbiAgaWYgKCFyZWNvcmRlclN0YXRlKSByZXR1cm47XG4gIHZhciBlbCA9IGUudGFyZ2V0O1xuICBpZiAoIWVsIHx8IGVsLmlkID09PSBcIm9wdGlib3QtcmVjb3JkZXItYmFkZ2VcIiB8fCBlbC5jbG9zZXN0KFwiI29wdGlib3QtcmVjb3JkZXItYmFkZ2VcIikgfHwgZWwuY2xvc2VzdChcIiNvcHRpYm90LXJlY29yZGVyLXBhbmVsXCIpKSByZXR1cm47XG5cbiAgLyogSWdub3JlciBsZXMgY2hhbXBzIGRlIHNhaXNpZSAoZ1x1MDBFOXJcdTAwRTlzIHBhciBibHVyKSAqL1xuICBpZiAoZWwudGFnTmFtZSA9PT0gXCJJTlBVVFwiIHx8IGVsLnRhZ05hbWUgPT09IFwiVEVYVEFSRUFcIiB8fCBlbC50YWdOYW1lID09PSBcIlNFTEVDVFwiKSByZXR1cm47XG5cbiAgLyogUDEgXHUyMDE0IFNcdTAwRTlsZWN0ZXVycyBtdWx0aXBsZXMgKi9cbiAgdmFyIHNlbGVjdG9ycyA9IGdlbmVyYXRlU2VsZWN0b3JzKGVsKTtcbiAgdmFyIGxhYmVsID0gKGVsLmlubmVyVGV4dCB8fCBlbC52YWx1ZSB8fCBlbC5nZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsXCIpIHx8IFwiXCIpLnRyaW0oKS5zbGljZSgwLCA1MCk7XG5cbiAgLyogU25hcHNob3QgQVZBTlQgbCdhY3Rpb24gXHUyMDE0IGludGVudGlvbm5lbCA6IG9uIGNhcHR1cmUgbCdcdTAwRTl0YXQgZGUgbGEgcGFnZVxuICAgICBhdSBtb21lbnQgb1x1MDBGOSBsJ2FjdGlvbiBkb2l0IFx1MDBFQXRyZSByZWpvdVx1MDBFOWUgKGxlIGRyeS1ydW4gcGFydCBkZSBjZXQgXHUwMEU5dGF0KS4gKi9cbiAgdmFyIGh0bWxTbmFwc2hvdCA9IGFub255bWl6ZUh0bWxTbmFwc2hvdCgpO1xuICB2YXIgbmV3U3RlcCA9IHtcbiAgICBpZDogXCJzdGVwX1wiICsgKHJlY29yZGVyU3RhdGUuZXRhcGVzLmxlbmd0aCArIDEpLFxuICAgIGxhYmVsOiBsYWJlbCB8fCBcIkNsaWNcIixcbiAgICBhY3Rpb246IFwiY2xpY2tcIixcbiAgICBzZWxlY3RvclR5cGU6IFwiY3NzXCIsXG4gICAgc2VsZWN0b3I6IHNlbGVjdG9yc1swXSxcbiAgICBzZWxlY3RvcnM6IHNlbGVjdG9ycyxcbiAgICB2YXJpYWJsZTogbnVsbCxcbiAgICBodG1sU25hcHNob3Q6IGh0bWxTbmFwc2hvdCxcbiAgICB1cmw6IHdpbmRvdy5sb2NhdGlvbi5ocmVmLFxuICAgIHdhaXRGb3I6IG51bGwsXG4gICAgdGltZW91dDogNTAwMCxcbiAgfTtcbiAgcmVjb3JkZXJTdGF0ZS5ldGFwZXMucHVzaChuZXdTdGVwKTtcblxuICBzYXZlUmVjb3JkZXJTdGF0ZSgpO1xuICB1cGRhdGVSZWNvcmRlclBhbmVsKCk7XG4gIHNob3dSUEFUb2FzdChcIlx1MjNGQSBcdTAwQzl0YXBlIFwiICsgcmVjb3JkZXJTdGF0ZS5ldGFwZXMubGVuZ3RoICsgXCIgXHUyMDE0IGNsaWMgZW5yZWdpc3RyXHUwMEU5XCIsIFwiaW5mb1wiKTtcblxuICAvKiBQMCBcdTIwMTQgRFx1MDBFOXRlY3Rpb24gYXV0b21hdGlxdWUgZHUgd2FpdEZvciBhcHJcdTAwRThzIG5hdmlnYXRpb24gb3UgY2hhbmdlbWVudCBET00gKi9cbiAgdmFyIHVybEJlZm9yZSA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuICB2YXIgYm9keVNuYXBzaG90ID0gZG9jdW1lbnQuYm9keS5pbm5lckhUTUwubGVuZ3RoO1xuICB2YXIgbGFzdFN0ZXBBZGRlZCA9IG5ld1N0ZXA7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgaWYgKCFyZWNvcmRlclN0YXRlKSByZXR1cm47XG4gICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmICE9PSB1cmxCZWZvcmUpIHtcbiAgICAgIC8qIE5hdmlnYXRpb24gY29tcGxcdTAwRTh0ZSBcdTIwMTQgY2hlcmNoZXIgbGUgcHJlbWllciBcdTAwRTlsXHUwMEU5bWVudCBpbnRlcmFjdGlmIGRlIGxhIG5vdXZlbGxlIHBhZ2UgKi9cbiAgICAgIGxhc3RTdGVwQWRkZWQud2FpdEZvciA9IFwiaW5wdXQ6bm90KFt0eXBlPWhpZGRlbl0pLCBzZWxlY3QsIGJ1dHRvblt0eXBlPXN1Ym1pdF0sIGZvcm1cIjtcbiAgICAgIHNhdmVSZWNvcmRlclN0YXRlKCk7XG4gICAgICAvKiBOb3RpZmljYXRpb24gY2hhbmdlbWVudCBkZSBwYWdlICovXG4gICAgICBzaG93UlBBVG9hc3QoXCJcdUQ4M0RcdURDQzQgTm91dmVsbGUgcGFnZSBcdTIwMTQgY29udGludWV6IHZvdHJlIHNhaXNpZSwgT3B0aUJvdCBlbnJlZ2lzdHJlXCIsIFwiaW5mb1wiKTtcbiAgICAgIC8qIE1ldHRyZSBcdTAwRTAgam91ciBsZSBiYWRnZSBhdmVjIGxlIGNvbXB0ZXVyICovXG4gICAgICB2YXIgcmVjQmFkZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm9wdGlib3QtcmVjb3JkZXItYmFkZ2VcIik7XG4gICAgICBpZiAocmVjQmFkZ2UpIHtcbiAgICAgICAgcmVjQmFkZ2UuaW5uZXJIVE1MID0gJzxzcGFuIHN0eWxlPVwid2lkdGg6MTBweDtoZWlnaHQ6MTBweDtiYWNrZ3JvdW5kOndoaXRlO2JvcmRlci1yYWRpdXM6NTAlO2Rpc3BsYXk6aW5saW5lLWJsb2NrO2FuaW1hdGlvbjpwdWxzZSAxcyBpbmZpbml0ZTtcIj48L3NwYW4+IEVucmVnaXN0cmVtZW50IGVuIGNvdXJzICgnICsgcmVjb3JkZXJTdGF0ZS5ldGFwZXMubGVuZ3RoICsgJyBcdTAwRTl0YXBlcyknO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoTWF0aC5hYnMoZG9jdW1lbnQuYm9keS5pbm5lckhUTUwubGVuZ3RoIC0gYm9keVNuYXBzaG90KSA+IDUwMCkge1xuICAgICAgLyogQ2hhbmdlbWVudCBET00gc2lnbmlmaWNhdGlmIChBSkFYKSAqL1xuICAgICAgbGFzdFN0ZXBBZGRlZC53YWl0Rm9yID0gXCJpbnB1dDpub3QoW3R5cGU9aGlkZGVuXSksIHNlbGVjdCwgYnV0dG9uW3R5cGU9c3VibWl0XSwgZm9ybVwiO1xuICAgICAgc2F2ZVJlY29yZGVyU3RhdGUoKTtcbiAgICB9XG4gIH0sIDgwMCk7XG59XG5cbi8qIEhhbmRsZXIgYmx1ciAoZmluIGRlIHNhaXNpZSBkYW5zIHVuIGNoYW1wKSBcdTIwMTQgc1x1MDBFOXJpYWxpc1x1MDBFOSB2aWEgcXVldWUgcG91ciBcdTAwRTl2aXRlciBsZXMgcmFjZXMgc3VyIGRldGVjdFZhcmlhYmxlKCkgKi9cbnZhciByZWNvcmRlckJsdXJRdWV1ZSA9IFByb21pc2UucmVzb2x2ZSgpO1xuXG5hc3luYyBmdW5jdGlvbiBvblJlY29yZGVyQmx1cihlKSB7XG4gIGlmICghcmVjb3JkZXJTdGF0ZSkgcmV0dXJuO1xuICB2YXIgZWwgPSBlLnRhcmdldDtcbiAgaWYgKCFlbCB8fCAhW1wiSU5QVVRcIiwgXCJURVhUQVJFQVwiXS5pbmNsdWRlcyhlbC50YWdOYW1lKSkgcmV0dXJuO1xuICBpZiAoIWVsLnZhbHVlIHx8IGVsLnZhbHVlLmxlbmd0aCA8IDEpIHJldHVybjtcblxuICAvKiBDYXB0dXJlciBsZXMgdmFsZXVycyBpbW1cdTAwRTlkaWF0ZW1lbnQgKGF2YW50IHF1ZSBsZSBET00gY2hhbmdlKSAqL1xuICB2YXIgY2FwdHVyZWRWYWx1ZSA9IGVsLnZhbHVlO1xuICB2YXIgY2FwdHVyZWRTZWxlY3RvcnMgPSBnZW5lcmF0ZVNlbGVjdG9ycyhlbCk7XG4gIHZhciBjYXB0dXJlZFNlbGVjdG9yID0gY2FwdHVyZWRTZWxlY3RvcnNbMF07XG4gIHZhciBjYXB0dXJlZExhYmVsRWwgPSBlbC5pZCA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xhYmVsW2Zvcj1cIicgKyBlbC5pZCArICdcIl0nKSA6IG51bGw7XG4gIHZhciBjYXB0dXJlZExhYmVsID0gKGNhcHR1cmVkTGFiZWxFbCAmJiBjYXB0dXJlZExhYmVsRWwudGV4dENvbnRlbnQudHJpbSgpKSB8fCBlbC5wbGFjZWhvbGRlciB8fCBlbC5uYW1lIHx8IFwiQ2hhbXBcIjtcbiAgdmFyIGNhcHR1cmVkVXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG5cbiAgcmVjb3JkZXJCbHVyUXVldWUgPSByZWNvcmRlckJsdXJRdWV1ZS50aGVuKGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgIGlmICghcmVjb3JkZXJTdGF0ZSkgcmV0dXJuO1xuXG4gICAgdmFyIHZhcmlhYmxlID0gYXdhaXQgZGV0ZWN0VmFyaWFibGUoY2FwdHVyZWRWYWx1ZSk7XG5cbiAgICAvKiBQMCBcdTIwMTQgRFx1MDBFOWR1cGxpY2F0aW9uIDogc2kgbGEgZGVybmlcdTAwRThyZSBcdTAwRTl0YXBlIGNpYmxlIGxlIG1cdTAwRUFtZSBzXHUwMEU5bGVjdGV1ciBcdTIxOTIgbWlzZSBcdTAwRTAgam91ciAqL1xuICAgIHZhciBsYXN0RXRhcGUgPSByZWNvcmRlclN0YXRlLmV0YXBlc1tyZWNvcmRlclN0YXRlLmV0YXBlcy5sZW5ndGggLSAxXTtcbiAgICBpZiAobGFzdEV0YXBlICYmIGxhc3RFdGFwZS5hY3Rpb24gPT09IFwiZmlsbFwiICYmIGxhc3RFdGFwZS5zZWxlY3RvciA9PT0gY2FwdHVyZWRTZWxlY3Rvcikge1xuICAgICAgbGFzdEV0YXBlLnZhcmlhYmxlID0gdmFyaWFibGUgfHwgXCJbVkFMRVVSIFNUQVRJUVVFIFx1MjAxNCBcdTAwQzAgUkVOU0VJR05FUl1cIjtcbiAgICAgIGxhc3RFdGFwZS5zZWxlY3RvcnMgPSBjYXB0dXJlZFNlbGVjdG9ycztcbiAgICAgIHNhdmVSZWNvcmRlclN0YXRlKCk7XG4gICAgICB1cGRhdGVSZWNvcmRlclBhbmVsKCk7XG4gICAgICAvKiBIaWdobGlnaHQgbGUgY2hhbXAgKi9cbiAgICAgIHZhciBkZWR1cEVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihjYXB0dXJlZFNlbGVjdG9yKTtcbiAgICAgIGlmIChkZWR1cEVsKSBoaWdobGlnaHRSZWNvcmRlZEZpZWxkKGRlZHVwRWwsIGxhc3RFdGFwZS52YXJpYWJsZSk7XG4gICAgICBzaG93UlBBVG9hc3QoXCJcdTIzRkEgXHUwMEM5dGFwZSBcIiArIHJlY29yZGVyU3RhdGUuZXRhcGVzLmxlbmd0aCArIFwiIG1pc2UgXHUwMEUwIGpvdXIgXHUyMDE0IFwiICsgY2FwdHVyZWRMYWJlbC5zbGljZSgwLCAyMCksIFwiaW5mb1wiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvKiBTbmFwc2hvdCBBVkFOVCBsJ2FjdGlvbiBcdTIwMTQgaW50ZW50aW9ubmVsIDogb24gY2FwdHVyZSBsJ1x1MDBFOXRhdCBkZSBsYSBwYWdlXG4gICAgICAgYXUgbW9tZW50IG9cdTAwRjkgbCdhY3Rpb24gZG9pdCBcdTAwRUF0cmUgcmVqb3VcdTAwRTllIChsZSBkcnktcnVuIHBhcnQgZGUgY2V0IFx1MDBFOXRhdCkuICovXG4gICAgdmFyIGh0bWxTbmFwc2hvdCA9IGFub255bWl6ZUh0bWxTbmFwc2hvdCgpO1xuICAgIHZhciBuZXdGaWxsU3RlcCA9IHtcbiAgICAgIGlkOiBcInN0ZXBfXCIgKyAocmVjb3JkZXJTdGF0ZS5ldGFwZXMubGVuZ3RoICsgMSksXG4gICAgICBsYWJlbDogY2FwdHVyZWRMYWJlbC5zbGljZSgwLCA1MCksXG4gICAgICBhY3Rpb246IFwiZmlsbFwiLFxuICAgICAgc2VsZWN0b3JUeXBlOiBcImNzc1wiLFxuICAgICAgc2VsZWN0b3I6IGNhcHR1cmVkU2VsZWN0b3IsXG4gICAgICBzZWxlY3RvcnM6IGNhcHR1cmVkU2VsZWN0b3JzLFxuICAgICAgLyogU2kgdmFsZXVyIHBhdGllbnQgXHUyMTkyIHZhcmlhYmxlIDsgc2lub24gdmFsZXVyIHN0YXRpcXVlIG1hc3F1XHUwMEU5ZSAqL1xuICAgICAgdmFyaWFibGU6IHZhcmlhYmxlIHx8IFwiW1ZBTEVVUiBTVEFUSVFVRSBcdTIwMTQgXHUwMEMwIFJFTlNFSUdORVJdXCIsXG4gICAgICBodG1sU25hcHNob3Q6IGh0bWxTbmFwc2hvdCxcbiAgICAgIHVybDogY2FwdHVyZWRVcmwsXG4gICAgICB3YWl0Rm9yOiBudWxsLFxuICAgICAgdGltZW91dDogNTAwMCxcbiAgICB9O1xuICAgIHJlY29yZGVyU3RhdGUuZXRhcGVzLnB1c2gobmV3RmlsbFN0ZXApO1xuXG4gICAgc2F2ZVJlY29yZGVyU3RhdGUoKTtcbiAgICB1cGRhdGVSZWNvcmRlclBhbmVsKCk7XG4gICAgLyogSGlnaGxpZ2h0IGxlIGNoYW1wICovXG4gICAgdmFyIGZpbGxFbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoY2FwdHVyZWRTZWxlY3Rvcik7XG4gICAgaWYgKGZpbGxFbCkgaGlnaGxpZ2h0UmVjb3JkZWRGaWVsZChmaWxsRWwsIG5ld0ZpbGxTdGVwLnZhcmlhYmxlKTtcbiAgICBzaG93UlBBVG9hc3QoXCJcdTIzRkEgXHUwMEM5dGFwZSBcIiArIHJlY29yZGVyU3RhdGUuZXRhcGVzLmxlbmd0aCArIFwiIFx1MjAxNCBcIiArIGNhcHR1cmVkTGFiZWwuc2xpY2UoMCwgMjApICsgKHZhcmlhYmxlID8gXCIgXHUyMTkyIFwiICsgdmFyaWFibGUgOiBcIiBcdTIxOTIgc3RhdGlxdWVcIiksIFwiaW5mb1wiKTtcbiAgfSk7XG59XG5cbi8qIEhhbmRsZXIgY2hhbmdlIChzZWxlY3QpICovXG5hc3luYyBmdW5jdGlvbiBvblJlY29yZGVyQ2hhbmdlKGUpIHtcbiAgaWYgKCFyZWNvcmRlclN0YXRlKSByZXR1cm47XG4gIHZhciBlbCA9IGUudGFyZ2V0O1xuICBpZiAoZWwudGFnTmFtZSAhPT0gXCJTRUxFQ1RcIikgcmV0dXJuO1xuXG4gIC8qIFAxIFx1MjAxNCBTXHUwMEU5bGVjdGV1cnMgbXVsdGlwbGVzICovXG4gIHZhciBzZWxlY3RvcnMgPSBnZW5lcmF0ZVNlbGVjdG9ycyhlbCk7XG4gIHZhciB2YXJpYWJsZSA9IGF3YWl0IGRldGVjdFZhcmlhYmxlKGVsLnZhbHVlKTtcbiAgdmFyIGxhYmVsID0gZWwubmFtZSB8fCBlbC5pZCB8fCBcIlNcdTAwRTlsZWN0aW9uXCI7XG5cbiAgLyogU25hcHNob3QgQVZBTlQgbCdhY3Rpb24gXHUyMDE0IGludGVudGlvbm5lbCA6IG9uIGNhcHR1cmUgbCdcdTAwRTl0YXQgZGUgbGEgcGFnZVxuICAgICBhdSBtb21lbnQgb1x1MDBGOSBsJ2FjdGlvbiBkb2l0IFx1MDBFQXRyZSByZWpvdVx1MDBFOWUgKGxlIGRyeS1ydW4gcGFydCBkZSBjZXQgXHUwMEU5dGF0KS4gKi9cbiAgdmFyIGh0bWxTbmFwc2hvdCA9IGFub255bWl6ZUh0bWxTbmFwc2hvdCgpO1xuICB2YXIgbmV3U2VsZWN0U3RlcCA9IHtcbiAgICBpZDogXCJzdGVwX1wiICsgKHJlY29yZGVyU3RhdGUuZXRhcGVzLmxlbmd0aCArIDEpLFxuICAgIGxhYmVsOiBsYWJlbC5zbGljZSgwLCA1MCksXG4gICAgYWN0aW9uOiBcInNlbGVjdFwiLFxuICAgIHNlbGVjdG9yVHlwZTogXCJjc3NcIixcbiAgICBzZWxlY3Rvcjogc2VsZWN0b3JzWzBdLFxuICAgIHNlbGVjdG9yczogc2VsZWN0b3JzLFxuICAgIHZhcmlhYmxlOiB2YXJpYWJsZSB8fCBlbC52YWx1ZSxcbiAgICBodG1sU25hcHNob3Q6IGh0bWxTbmFwc2hvdCxcbiAgICB1cmw6IHdpbmRvdy5sb2NhdGlvbi5ocmVmLFxuICAgIHdhaXRGb3I6IG51bGwsXG4gICAgdGltZW91dDogNTAwMCxcbiAgfTtcbiAgcmVjb3JkZXJTdGF0ZS5ldGFwZXMucHVzaChuZXdTZWxlY3RTdGVwKTtcblxuICBzYXZlUmVjb3JkZXJTdGF0ZSgpO1xuICB1cGRhdGVSZWNvcmRlclBhbmVsKCk7XG4gIGhpZ2hsaWdodFJlY29yZGVkRmllbGQoZWwsIG5ld1NlbGVjdFN0ZXAudmFyaWFibGUpO1xuICBzaG93UlBBVG9hc3QoXCJcdTIzRkEgXHUwMEM5dGFwZSBcIiArIHJlY29yZGVyU3RhdGUuZXRhcGVzLmxlbmd0aCArIFwiIFx1MjAxNCBzXHUwMEU5bGVjdGlvbiBcIiArIGxhYmVsLnNsaWNlKDAsIDIwKSArICh2YXJpYWJsZSA/IFwiIFx1MjE5MiBcIiArIHZhcmlhYmxlIDogXCJcIiksIFwiaW5mb1wiKTtcbn1cblxuLyogU2F1dmVnYXJkZXIgbCdcdTAwRTl0YXQgZHUgcmVjb3JkZXIgZGFucyBjaHJvbWUuc3RvcmFnZSBhcHJcdTAwRThzIGNoYXF1ZSBcdTAwRTl0YXBlICovXG5mdW5jdGlvbiBzYXZlUmVjb3JkZXJTdGF0ZSgpIHtcbiAgaWYgKCFyZWNvcmRlclN0YXRlKSByZXR1cm47XG4gIC8qIEV4Y2x1cmUgbGVzIGh0bWxTbmFwc2hvdCBkdSBzdG9yYWdlIGxvY2FsICh0cm9wIGxvdXJkcywgbGltaXRlIDEwTUIgQ2hyb21lKS5cbiAgICAgTGVzIHNuYXBzaG90cyByZXN0ZW50IGVuIG1cdTAwRTltb2lyZSBkYW5zIHJlY29yZGVyU3RhdGUuZXRhcGVzXG4gICAgIGV0IHNvbnQgZW52b3lcdTAwRTlzIGF1IHNlcnZldXIgdW5pcXVlbWVudCBsb3JzIGR1IHN0b3BSZWNvcmRlcigpLiAqL1xuICB2YXIgZXRhcGVzU2Fuc0h0bWwgPSByZWNvcmRlclN0YXRlLmV0YXBlcy5tYXAoZnVuY3Rpb24oZSkge1xuICAgIHZhciBjb3B5ID0gT2JqZWN0LmFzc2lnbih7fSwgZSk7XG4gICAgZGVsZXRlIGNvcHkuaHRtbFNuYXBzaG90O1xuICAgIHJldHVybiBjb3B5O1xuICB9KTtcbiAgdmFyIHBhZ2VzID0gW107XG4gIHZhciBzZWVuVXJscyA9IHt9O1xuICBmb3IgKHZhciBwaSA9IDA7IHBpIDwgcmVjb3JkZXJTdGF0ZS5ldGFwZXMubGVuZ3RoOyBwaSsrKSB7XG4gICAgdmFyIHUgPSByZWNvcmRlclN0YXRlLmV0YXBlc1twaV0udXJsO1xuICAgIGlmICh1ICYmICFzZWVuVXJsc1t1XSkgeyBzZWVuVXJsc1t1XSA9IHRydWU7IHBhZ2VzLnB1c2godSk7IH1cbiAgfVxuICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoeyBvcHRpYm90X3JlY29yZGVyOiB7XG4gICAgYWN0aXZlOiB0cnVlLFxuICAgIGV0YXBlczogZXRhcGVzU2Fuc0h0bWwsXG4gICAgaG9zdG5hbWU6IHJlY29yZGVyU3RhdGUuaG9zdG5hbWUsXG4gICAgc3RhcnRUaW1lOiByZWNvcmRlclN0YXRlLnN0YXJ0VGltZSxcbiAgICBwYWdlczogcGFnZXMsXG4gIH19KTtcbn1cblxuLyogUmVzdGF1cmVyIGxlIHJlY29yZGVyIHNpIHVuZSBuYXZpZ2F0aW9uIGEgZXUgbGlldSBwZW5kYW50IGwnZW5yZWdpc3RyZW1lbnQgKi9cbmZ1bmN0aW9uIHJlc3RvcmVSZWNvcmRlcklmTmVlZGVkKCkge1xuICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoW1wib3B0aWJvdF9yZWNvcmRlclwiXSwgZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgdmFyIHNhdmVkID0gcmVzdWx0Lm9wdGlib3RfcmVjb3JkZXI7XG4gICAgaWYgKCFzYXZlZCB8fCAhc2F2ZWQuYWN0aXZlKSByZXR1cm47XG5cbiAgICAvKiBSZWNvcmRlciBhY3RpZiBkYW5zIGxlIHN0b3JhZ2UgbWFpcyBwYXMgZW4gbVx1MDBFOW1vaXJlIFx1MjE5MiByZXN0YXVyZXIuXG4gICAgICAgTm90ZTogbGVzIGh0bWxTbmFwc2hvdCBuZSBzb250IHBhcyByZXN0YXVyXHUwMEU5cyBhcHJcdTAwRThzIG5hdmlnYXRpb24gKG5vbiBzdG9ja1x1MDBFOXMgbG9jYWxlbWVudCkuXG4gICAgICAgU2V1bGVzIGxlcyBcdTAwRTl0YXBlcyBzYW5zIHNuYXBzaG90IHNvbnQgclx1MDBFOWN1cFx1MDBFOXJcdTAwRTllcyBcdTIwMTQgbGVzIHNuYXBzaG90cyBIVE1MIHNvbnQgZW52b3lcdTAwRTlzXG4gICAgICAgYXUgc2VydmV1ciBcdTAwRTAgbGEgZmluIGRlIGwnZW5yZWdpc3RyZW1lbnQgdW5pcXVlbWVudC4gKi9cbiAgICByZWNvcmRlclN0YXRlID0ge1xuICAgICAgZXRhcGVzOiBzYXZlZC5ldGFwZXMgfHwgW10sXG4gICAgICBob3N0bmFtZTogc2F2ZWQuaG9zdG5hbWUgfHwgd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLnJlcGxhY2UoXCJ3d3cuXCIsIFwiXCIpLFxuICAgICAgc3RhcnRUaW1lOiBzYXZlZC5zdGFydFRpbWUgfHwgRGF0ZS5ub3coKSxcbiAgICB9O1xuXG4gICAgLyogUlx1MDBFOS1hZmZpY2hlciBsZSBiYWRnZSAqL1xuICAgIGlmICghZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJvcHRpYm90LXJlY29yZGVyLWJhZGdlXCIpKSB7XG4gICAgICB2YXIgYmFkZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgYmFkZ2UuaWQgPSBcIm9wdGlib3QtcmVjb3JkZXItYmFkZ2VcIjtcbiAgICAgIGJhZGdlLnN0eWxlLmNzc1RleHQgPSBcInBvc2l0aW9uOmZpeGVkO3RvcDoyMHB4O2xlZnQ6NTAlO3RyYW5zZm9ybTp0cmFuc2xhdGVYKC01MCUpO3otaW5kZXg6MjE0NzQ4MzY0NztiYWNrZ3JvdW5kOiNlZjQ0NDQ7Y29sb3I6d2hpdGU7cGFkZGluZzo4cHggMjBweDtib3JkZXItcmFkaXVzOjUwcHg7Zm9udC1mYW1pbHk6c2Fucy1zZXJpZjtmb250LXNpemU6MTNweDtmb250LXdlaWdodDpib2xkO2JveC1zaGFkb3c6MCA0cHggMTVweCByZ2JhKDAsMCwwLDAuMyk7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4O1wiO1xuICAgICAgYmFkZ2UuaW5uZXJIVE1MID0gJzxzcGFuIHN0eWxlPVwid2lkdGg6MTBweDtoZWlnaHQ6MTBweDtiYWNrZ3JvdW5kOndoaXRlO2JvcmRlci1yYWRpdXM6NTAlO2Rpc3BsYXk6aW5saW5lLWJsb2NrO2FuaW1hdGlvbjpwdWxzZSAxcyBpbmZpbml0ZTtcIj48L3NwYW4+IEVucmVnaXN0cmVtZW50IGVuIGNvdXJzICgnICsgcmVjb3JkZXJTdGF0ZS5ldGFwZXMubGVuZ3RoICsgJyBcdTAwRTl0YXBlcykgXHUyMDE0IGNvbnRpbnVleiBsZSBwYXJjb3Vycyc7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGJhZGdlKTtcbiAgICB9XG5cbiAgICAvKiBSXHUwMEU5LWF0dGFjaGVyIGxlcyBsaXN0ZW5lcnMgKi9cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgb25SZWNvcmRlckNsaWNrLCB0cnVlKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIG9uUmVjb3JkZXJDaGFuZ2UsIHRydWUpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJibHVyXCIsIG9uUmVjb3JkZXJCbHVyLCB0cnVlKTtcblxuICAgIC8qIFJcdTAwRTktYWZmaWNoZXIgbGUgcGFubmVhdSBndWlkXHUwMEU5ICovXG4gICAgc2hvd1JlY29yZGVyUGFuZWwoKTtcbiAgICB1cGRhdGVSZWNvcmRlclBhbmVsKCk7XG5cbiAgICBzaG93UlBBVG9hc3QoXCJcdTIzRkEgRW5yZWdpc3RyZW1lbnQgcmVwcmlzIChcIiArIHJlY29yZGVyU3RhdGUuZXRhcGVzLmxlbmd0aCArIFwiIFx1MDBFOXRhcGVzIGRcdTAwRTlqXHUwMEUwIGVucmVnaXN0clx1MDBFOWVzKVwiLCBcImluZm9cIik7XG4gIH0pO1xufVxuXG4vKiBcdTAwQzljb3V0ZXIgbGVzIG1lc3NhZ2VzIGR1IHBvcHVwICovXG5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoZnVuY3Rpb24obXNnKSB7XG4gIGlmIChtc2cgJiYgbXNnLnR5cGUgPT09IFwiT1BUSUJPVF9SRUNPUkRFUl9TVEFSVFwiKSBzdGFydFJlY29yZGVyKCk7XG4gIGlmIChtc2cgJiYgbXNnLnR5cGUgPT09IFwiT1BUSUJPVF9SRUNPUkRFUl9TVE9QXCIpIHN0b3BSZWNvcmRlcigpO1xuICBpZiAobXNnICYmIG1zZy50eXBlID09PSBcIk9QVElCT1RfUkVDT1JERVJfU1RBVFVTXCIpIHtcbiAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7IHR5cGU6IFwiT1BUSUJPVF9SRUNPUkRFUl9TVEFUVVNfUkVQTFlcIiwgYWN0aXZlOiAhIXJlY29yZGVyU3RhdGUsIGV0YXBlczogcmVjb3JkZXJTdGF0ZSA/IHJlY29yZGVyU3RhdGUuZXRhcGVzLmxlbmd0aCA6IDAgfSk7XG4gIH1cbn0pO1xuXG4vKiByZXN0b3JlQm90SWZOZWVkZWQgXHUyMDE0IGRcdTAwRTlzYWN0aXZcdTAwRTkgKi9cblxuLyogXHUyNTAwXHUyNTAwIEZpbiBNYWNybyBSZWNvcmRlciBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cblxuLyogXHUyNTAwXHUyNTAwIEV4cG9zZSBsZXMgZm9uY3Rpb25zIHV0aWxpdGFpcmVzIHBvdXIgbGVzIHBvcnRhaWxzIG1vZHVsYWlyZXMgXHUyNTAwXHUyNTAwXHUyNTAwICovXG5nbG9iYWxUaGlzLnVsdHJhRmlsbCA9IHVsdHJhRmlsbDtcbmdsb2JhbFRoaXMuZmluZEVsZW1lbnQgPSBmaW5kRWxlbWVudDtcbmdsb2JhbFRoaXMuY2FwaXRhbGl6ZSA9IHR5cGVvZiBjYXBpdGFsaXplID09PSAnZnVuY3Rpb24nID8gY2FwaXRhbGl6ZSA6IGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMgPyBzLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcy5zbGljZSgxKS50b0xvd2VyQ2FzZSgpIDogXCJcIjsgfTtcbmdsb2JhbFRoaXMuZ2V0T3V2cmFudERyb2l0TlNTID0gZ2V0T3V2cmFudERyb2l0TlNTO1xuZ2xvYmFsVGhpcy5pc1VuZGVyMTggPSBpc1VuZGVyMTg7XG5nbG9iYWxUaGlzLm5vcm1hbGl6ZVBob25lID0gbm9ybWFsaXplUGhvbmU7XG5nbG9iYWxUaGlzLnNlbGVjdFJhZGl4T3B0aW9uID0gc2VsZWN0UmFkaXhPcHRpb247XG5nbG9iYWxUaGlzLmZpbGxEYXRlUGlja2VyID0gZmlsbERhdGVQaWNrZXI7XG5nbG9iYWxUaGlzLnNtYXJ0U2VsZWN0T3B0aW9uID0gc21hcnRTZWxlY3RPcHRpb247XG5nbG9iYWxUaGlzLmZpbmRJblNoYWRvd1Jvb3RzID0gZmluZEluU2hhZG93Um9vdHM7XG5nbG9iYWxUaGlzLnF1ZXJ5U2VsZWN0b3JBbGxEZWVwID0gcXVlcnlTZWxlY3RvckFsbERlZXA7XG5nbG9iYWxUaGlzLndhaXRGb3JFbGVtZW50ID0gd2FpdEZvckVsZW1lbnQ7XG5nbG9iYWxUaGlzLnZhbGlkYXRlTHVobk5TUyA9IHZhbGlkYXRlTHVobk5TUztcbmdsb2JhbFRoaXMuc2hvd1JQQVRvYXN0ID0gc2hvd1JQQVRvYXN0O1xuZ2xvYmFsVGhpcy5kZXRlY3RQYWdlQ29udGV4dCA9IGRldGVjdFBhZ2VDb250ZXh0O1xuZ2xvYmFsVGhpcy5jaGVja0Ryb2l0c011dHVlbGxlID0gY2hlY2tEcm9pdHNNdXR1ZWxsZTtcbmdsb2JhbFRoaXMuc2F2ZVNlbGVjdG9yQ2FjaGUgPSBzYXZlU2VsZWN0b3JDYWNoZTtcbiJdLAogICJtYXBwaW5ncyI6ICI7OztBQUFBLE1BQU8scUJBQVE7QUFBQSxJQUNiLE1BQU07QUFBQSxJQUNOLFNBQVMsTUFBTSxPQUFPLFNBQVMsU0FBUyxTQUFTLGVBQWU7QUFBQSxJQUNoRSxTQUFTO0FBQUEsTUFDUCxZQUFZLENBQUMsU0FBUztBQUNwQixZQUFJLElBQUksS0FBSyxLQUFLLENBQUM7QUFDbkIsWUFBSSxJQUFJLEtBQUssS0FBSyxDQUFDO0FBQ25CLFlBQUksSUFBSSxLQUFLLFVBQVUsQ0FBQztBQUN4QixZQUFJLFNBQVM7QUFHYixZQUFJLFFBQVEsWUFBWSxxQkFBcUI7QUFDN0MsWUFBSSxPQUFPO0FBQ1QsY0FBSSxRQUFRLEVBQUUsa0JBQW1CLEVBQUUsV0FBVyxFQUFFLFFBQVEsT0FBTyxFQUFFLFFBQVEsSUFBSSxrQkFBbUIsRUFBRSxrQkFBa0I7QUFDcEgsY0FBSSxNQUFNLEVBQUUseUJBQXlCLEVBQUUsT0FBTztBQUM5QyxjQUFJLFNBQVMsSUFBSSxRQUFRLE9BQU8sRUFBRSxFQUFFLE1BQU0sR0FBRyxFQUFFO0FBQy9DLGNBQUksZUFBZTtBQUNuQixjQUFJLE9BQU8sVUFBVSxJQUFJO0FBQ3ZCLDJCQUFlLE9BQU8sQ0FBQyxJQUFJLE1BQU0sT0FBTyxNQUFNLEdBQUUsQ0FBQyxJQUFJLE1BQU0sT0FBTyxNQUFNLEdBQUUsQ0FBQyxJQUFJLE1BQU0sT0FBTyxNQUFNLEdBQUUsQ0FBQyxJQUFJLE1BQU0sT0FBTyxNQUFNLEdBQUUsRUFBRSxJQUFJLE1BQU0sT0FBTyxNQUFNLElBQUcsRUFBRTtBQUM1SixnQkFBSSxPQUFPLFVB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O0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQTtBQUFBLE1BR0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBO0FBQUEsTUFHQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUE7QUFBQSxNQUdBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQTtBQUFBLE1BR0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNB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UyIsICJsb2FkUmVtb3RlU2VsZWN0b3JzIiwgImZpbmRFbGVtZW50V2l0aE92ZXJyaWRlIiwgImluaXRGaWVsZEZlZWRiYWNrIiwgImZpbmRFbGVtZW50VHJhY2tlZCIsICJ0cmFja0ZpbGxSZXN1bHQiLCAiY2hlY2tBbmRSZXBhaXJTZWxlY3RvcnMiLCAibG9hZFJlamVjdGlvbk1vZGVsIiwgInByZWRpY3RSZWplY3Rpb25SaXNrIiwgInNob3dSZWplY3Rpb25SaXNrQmFubmVyIiwgImNyZWF0ZUNvbW1hbmRDZW50ZXIiLCAiZmluZEVsZW1lbnQiLCAid2FpdEZvckVsZW1lbnQiLCAiY2FwaXRhbGl6ZSIsICJub3JtYWxpemVQaG9uZSIsICJnZXRDYWNoZWRDbGllbnQiLCAidWx0cmFGaWxsIiwgInNtYXJ0U2VsZWN0T3B0aW9uIiwgInNlbGVjdFJhZGl4T3B0aW9uIiwgInNtYXJ0RmlsbEZpZWxkIiwgIm1hcmtGaWxsZWRCeU9wdGlCb3QiLCAic2hvd1JQQVRvYXN0IiwgInBlcmZvcm1TbWFydEZpbGwiLCAiZWwiLCAiYmVzdEZpZWxkIiwgInZhbHVlIiwgImJlc3RTY29yZSIsICJjYWNoZWRGaWVsZCIsICJtYXJrRmlsbGVkQnlPcHRpQm90IiwgInNtYXJ0RmlsbEZpZWxkIiwgImNoZWNrRHJvaXRzTXV0dWVsbGUiLCAiQ09ORklHUyIsICJnZXRPdXZyYW50RHJvaXROU1MiLCAiY2FwaXRhbGl6ZSIsICJmaW5kRWxlbWVudCIsICJzbWFydFNlbGVjdE9wdGlvbiIsICJ1bHRyYUZpbGwiLCAiY2hlY2tEcm9pdHNNdXR1ZWxsZSIsICJzaG93UlBBVG9hc3QiLCAiaXNVbmRlcjE4IiwgInNob3dSUEFUb2FzdCIsICJwZXJmb3JtU21hcnRGaWxsIiwgIkNPTkZJR1MiLCAic2hvd1JQQVRvYXN0IiwgInVsdHJhRmlsbCIsICJmaW5kRWxlbWVudCIsICJjYXBpdGFsaXplIiwgImdldE91dnJhbnREcm9pdE5TUyIsICJpc1VuZGVyMTgiLCAibm9ybWFsaXplUGhvbmUiLCAic2VsZWN0UmFkaXhPcHRpb24iLCAic21hcnRTZWxlY3RPcHRpb24iLCAid2FpdEZvckVsZW1lbnQiLCAiY2hlY2tEcm9pdHNNdXR1ZWxsZSJdCn0K
