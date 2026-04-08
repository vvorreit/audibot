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
          console.info("[AudiBot Generation] Page simulation \u2014 filled:", filled, "| hasOD:", !!od, "| hasOG:", !!og, "| monture:", !!montureLigne, "| verreOD:", !!verreOD, "| verreOG:", !!verreOG);
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
          chrome.storage.local.get(["audibot_cache"], (result) => {
            const existing = (result.audibot_cache || {}).current || {};
            chrome.storage.local.set({
              audibot_cache: { current: { ...existing, ...client } }
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
          console.info("[AudiBot APGIS] prescEl found:", !!prescEl, "| rppsEl found:", !!rppsEl);
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
        console.info("[AudiBot Solimut] filled \u2014 hasNSS:", !!effectiveNSS, "| hasDob:", !!dob, "| hasRpps:", !!rpps, "| hasDateOrdo:", !!dateOrdo);
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
        console.info("[AudiBot Almerys] formulaire \u2014 hasNSS:", !!nss, "hasDob:", !!dob, "hasNom:", !!nom);
        var nomBenef = findElementTracked(PORTAL_KEY2, "nom_beneficiaire", "#nom_beneficiaire");
        if (nomBenef) {
          console.info("[AudiBot Almerys] Page recherche beneficiaire detectee");
          ultraFill(nomBenef, nom.toUpperCase());
          ultraFill(findElementTracked(PORTAL_KEY2, "nss_beneficiaire", "#nss_beneficiaire"), nss);
          filled = true;
        }
        var critNNI = findElementTracked(PORTAL_KEY2, "crit_numInsee", 'input[name="crit_numInsee"]');
        if (critNNI) {
          console.info("[AudiBot Almerys] Popup recherche beneficiaire detectee");
          var effectiveNSS = getOuvrantDroitNSS(nss, dob, personnes);
          ultraFill(critNNI, effectiveNSS.replace(/\D/g, "").slice(0, 13));
          ultraFill(findElementTracked(PORTAL_KEY2, "crit_nomBenef", 'input[name="crit_nomBenef"]'), nom.toUpperCase());
          ultraFill(findElementTracked(PORTAL_KEY2, "crit_prenomBenef", 'input[name="crit_prenomBenef"]'), capitalize(prenom));
          if (dob) ultraFill(findElementTracked(PORTAL_KEY2, "crit_dateNaissanceEdit", 'input[name="crit_dateNaissanceEdit"]'), dob);
          filled = true;
        }
        var nniEl = findElementTracked(PORTAL_KEY2, "numInsee", 'input[name="numInsee"]');
        console.info("[AudiBot Almerys] numInsee trouve:", !!nniEl, nniEl ? "readOnly=" + nniEl.readOnly : "");
        if (nniEl && !nniEl.readOnly) {
          var effectiveNSS = getOuvrantDroitNSS(nss, dob, personnes);
          console.info("[AudiBot Almerys] Fill NNI: [REDACTED]");
          ultraFill(nniEl, effectiveNSS.replace(/\D/g, "").slice(0, 13));
          filled = true;
        }
        var dateOrdoEl = findElementTracked(PORTAL_KEY2, "dateOrdonnanceEdit", 'input[name="dateOrdonnanceEdit"]');
        console.info("[AudiBot Almerys] dateOrdonnanceEdit trouve:", !!dateOrdoEl, dateOrdoEl ? "disabled=" + dateOrdoEl.disabled : "");
        if (dateOrdoEl) {
          if (!dateOrdoEl.disabled && !dateOrdoEl.value) {
            var dateOrdo = o.dateOrdonnance || c.prescription && c.prescription.datePrescription || "";
            console.info("[AudiBot Almerys] Fill date ordo: [REDACTED]");
            if (dateOrdo) fillDate(dateOrdoEl, dateOrdo);
          }
          var dateDemandeEl = findElementTracked(PORTAL_KEY2, "dateDemandeEdit", 'input[name="dateDemandeEdit"]');
          console.info("[AudiBot Almerys] dateDemandeEdit trouve:", !!dateDemandeEl, dateDemandeEl ? "disabled=" + dateDemandeEl.disabled : "");
          if (dateDemandeEl && !dateDemandeEl.disabled && !dateDemandeEl.value) {
            var today = /* @__PURE__ */ new Date();
            var dd = String(today.getDate()).padStart(2, "0");
            var mm = String(today.getMonth() + 1).padStart(2, "0");
            var yyyy = today.getFullYear();
            console.info("[AudiBot Almerys] Fill date demande:", dd + mm + yyyy);
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
          console.info("[AudiBot Almerys] Page 2 equipements detectee");
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

  // extension-src/content/portals/itelis.js
  var PORTAL_KEY3 = "pro.ism-tp.fr";
  var itelis_default = {
    name: "Itelis",
    isMatch: () => window.location.hostname.includes("ism-tp.fr") || window.location.hostname.includes("itelis.fr"),
    actions: {
      formulaire: (data) => {
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
        var nomEl = findElementTracked(
          PORTAL_KEY3,
          "nom_assuree",
          'input[name="nom_assuree"], input[name="nom"], input[id*="nom"][id*="assure"], input[data-cy="input-lastName"]'
        );
        if (!nomEl) return false;
        ultraFill(nomEl, nom.toUpperCase());
        ultraFill(
          findElementTracked(
            PORTAL_KEY3,
            "prenom_assuree",
            'input[name="prenom_assuree"], input[name="prenom"], input[data-cy="input-firstName"]'
          ),
          capitalize(prenom)
        );
        ultraFill(
          findElementTracked(
            PORTAL_KEY3,
            "nss",
            'input[name="nss"], input[name="nirp"], input[name="numInsee"], input[name="nir"], input[data-cy="input-nir"]'
          ),
          effectiveNSS.replace(/\D/g, "")
        );
        ultraFill(
          findElementTracked(
            PORTAL_KEY3,
            "dateNaissance",
            'input[name="dateNaissance"], input[name="date_naissance"], input[data-cy="input-dob"]'
          ),
          dob
        );
        ultraFill(
          findElementTracked(
            PORTAL_KEY3,
            "adherent",
            'input[name="adherent"], input[name="num_adherent"], input[name="numAdherent"]'
          ),
          m.numeroAdherent || ""
        );
        return true;
      },
      synchroniser: async () => false
    }
  };

  // extension-src/content/portals/viamedis.js
  var PORTAL_KEY4 = "pro.viamedis.net";
  var viamedis_default = {
    name: "Viamedis",
    isMatch: () => window.location.hostname.includes("viamedis.net") || window.location.hostname.includes("viamedis.fr"),
    actions: {
      formulaire: (data) => {
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
        var nomEl = findElementTracked(
          PORTAL_KEY4,
          "nom",
          'input[data-cy="nom"], input[ng-reflect-name="nom"], input[name="nom"], input[aria-label*="nom" i]'
        );
        if (!nomEl) {
          nomEl = Array.from(document.querySelectorAll("input")).find(function(el) {
            return (el.placeholder || "").toLowerCase().includes("nom");
          });
        }
        if (!nomEl) return false;
        ultraFill(nomEl, nom.toUpperCase());
        ultraFill(
          findElementTracked(
            PORTAL_KEY4,
            "prenom",
            'input[data-cy="prenom"], input[ng-reflect-name="prenom"], input[name="prenom"], input[aria-label*="pr\xE9nom" i]'
          ),
          capitalize(prenom)
        );
        var nssEl = findElementTracked(
          PORTAL_KEY4,
          "nir",
          'input[data-cy="nir"], input[data-cy="nirp"], input[ng-reflect-name="nir"], input[ng-reflect-name="nirp"], input[name="nir"], input[name="nirp"], input[aria-label*="NIR" i], input[aria-label*="s\xE9curit\xE9 sociale" i]'
        );
        ultraFill(nssEl, effectiveNSS.replace(/\D/g, "").slice(0, 13));
        ultraFill(
          findElementTracked(
            PORTAL_KEY4,
            "dateNaissance",
            'input[data-cy="dateNaissance"], input[ng-reflect-name="dateNaissance"], input[name="dateNaissance"], input[aria-label*="naissance" i]'
          ),
          dob
        );
        return true;
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
    "oxantis": oxantis_default,
    "pro.ism-tp.fr": itelis_default,
    "pro.viamedis.net": viamedis_default
  };

  // extension-src/content/utils/remote-selectors.js
  var _remoteOverrides = null;
  var _remoteOverridesLoaded = false;
  function loadRemoteSelectors2(callback) {
    chrome.storage.local.get(["audibot_selector_overrides"], function(result) {
      var data = result.audibot_selector_overrides;
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
    menu.id = "audibot-feedback-menu";
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
    btn.innerHTML = '<span style="font-size:16px">\u{1F41B}</span><span>Signaler ce champ \xE0 AudiBot</span>';
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
    showFeedbackToast("\u23F3 Signalement envoy\xE9 \xE0 AudiBot\u2026");
    chrome.runtime.sendMessage({
      type: "AUDIBOT_FIELD_FEEDBACK",
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
    var existing = document.getElementById("audibot-feedback-toast");
    if (existing) existing.remove();
    var toast = document.createElement("div");
    toast.id = "audibot-feedback-toast";
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
    chrome.storage.local.get(["audibot_auth"], function(result) {
      var auth = result.audibot_auth || {};
      if (!auth.syncToken) return;
      chrome.runtime.sendMessage({
        type: "AUDIBOT_PING",
        payloads: [{
          url: "https://audibot.fr/api/extension/selector-health",
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
    console.warn("[AudiBot] Taux de skip eleve sur " + hostname + " (" + Math.round(skipRate * 100) + "%) \u2014 envoi snapshot DOM pour reparation");
    var snapshot = captureAnonymizedSnapshot();
    chrome.storage.local.get(["audibot_auth"], function(result) {
      var auth = result.audibot_auth || {};
      if (!auth.syncToken) return;
      fetch("https://audibot.fr/api/extension/selector-repair", {
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
        console.warn("[AudiBot] selector repair submission failed:", err);
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
    chrome.storage.local.get(["audibot_rejection_model"], function(result) {
      var cached = result.audibot_rejection_model;
      if (cached && cached.ts && Date.now() - cached.ts < 864e5) {
        _rejectionModel = cached.model;
        return;
      }
      if (typeof getSyncToken === "function") {
        getSyncToken().then(function(token) {
          if (!token) return;
          fetch("https://audibot.fr/api/extension/rejection-model", {
            headers: { "Authorization": "Bearer " + token }
          }).then(function(r) {
            return r.json();
          }).then(function(data) {
            _rejectionModel = data.model || null;
            chrome.storage.local.set({ audibot_rejection_model: { model: _rejectionModel, ts: Date.now() } });
          }).catch(function(err) {
            console.warn("[AudiBot] rejection model fetch failed:", err);
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
    var existing = document.getElementById("audibot-rejection-risk");
    if (existing) existing.remove();
    var colors = { low: "#059669", medium: "#d97706", high: "#dc2626" };
    var labels = { low: "Faible", medium: "Moyen", high: "Eleve" };
    var banner = document.createElement("div");
    banner.id = "audibot-rejection-risk";
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
  var CC_STORAGE_KEY = "audibot_cc_state";
  function createCommandCenter2() {
    if (document.getElementById("audibot-command-center")) return;
    var host = document.createElement("div");
    host.id = "audibot-command-center";
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
      if (message && message.type === "AUDIBOT_SSE_EVENT") {
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
      logoText.textContent = "AudiBot";
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
        empty.textContent = "Aucune donnee patient. Scannez un document depuis le dashboard AudiBot.";
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
        var pageBtn = document.getElementById("audibot-fill-btn");
        if (pageBtn) pageBtn.click();
      };
      actions.appendChild(fillBtn);
      var scanBtn = document.createElement("button");
      scanBtn.className = "cc-btn cc-btn-scan";
      scanBtn.textContent = "Rescanner";
      scanBtn.onclick = function() {
        chrome.runtime.sendMessage({ type: "AUDIBOT_OPEN_TAB", url: "https://audibot.fr/dashboard" });
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
      "@keyframes audibotPulse {",
      "  0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }",
      "  70% { box-shadow: 0 0 0 6px rgba(16,185,129,0); }",
      "  100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }",
      "}",
      "@keyframes audibotFadeIn {",
      "  from { opacity: 0; transform: translateY(8px); }",
      "  to { opacity: 1; transform: translateY(0); }",
      "}",
      "@keyframes audibotDotFlash {",
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
      "  animation: audibotFadeIn 0.3s ease-out;",
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
      "  animation: audibotFadeIn 0.3s ease-out;",
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
      "  animation: audibotPulse 2s infinite;",
      "}",
      ".cc-dot-flash {",
      "  animation: audibotDotFlash 1.5s ease-out !important;",
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
        fetch("https://audibot.fr/api/extension/devis", {
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
          console.warn("[AudiBot] devis sync failed:", err);
        });
      });
    }
  }
  function showDevisToast(message, type) {
    var existing = document.getElementById("audibot-devis-toast");
    if (existing) existing.remove();
    var toast = document.createElement("div");
    toast.id = "audibot-devis-toast";
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
    chrome.storage.local.get(["audibot_learned_weights"], function(result) {
      var cached = result.audibot_learned_weights;
      if (cached && cached.ts && Date.now() - cached.ts < 36e5) {
        _learnedWeights = cached.weights || {};
        return;
      }
      if (typeof getSyncToken === "function") {
        getSyncToken().then(function(token) {
          if (!token) return;
          fetch("https://audibot.fr/api/extension/smart-fill/weights?hostname=" + encodeURIComponent(hostname), {
            headers: { "Authorization": "Bearer " + token }
          }).then(function(r) {
            return r.json();
          }).then(function(data) {
            _learnedWeights = data.weights || {};
            chrome.storage.local.set({ audibot_learned_weights: { weights: _learnedWeights, ts: Date.now() } });
          }).catch(function(err) {
            console.warn("[AudiBot] learned weights fetch failed:", err);
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
      /* Classes CSS — filtrer les classes framework sans valeur sémantique */
      ...(el.className || "").split(/\s+/).filter(function(cls) {
        if (!cls) return false;
        if (/^(form-control|input-|col-|row|ng-|mat-|mdc-|v-|vue-|ant-|el-|p-|btn|badge|text-|bg-|border-|shadow-|rounded|flex|grid|hidden|block|inline|container|wrapper|field|group|control|dirty|pristine|valid|invalid|touched|untouched|required|disabled|readonly)/.test(cls)) return false;
        return cls.length > 2 && cls.length < 40;
      })
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
  var SELECTOR_CACHE_TTL = 24 * 60 * 60 * 1e3;
  function getCachedSelector(hostname, fieldName) {
    if (!_selectorCache[hostname]) return null;
    var entry = _selectorCache[hostname][fieldName];
    if (!entry) return null;
    if (typeof entry === "string") return entry;
    if (Date.now() - entry.ts > SELECTOR_CACHE_TTL) {
      delete _selectorCache[hostname][fieldName];
      _selectorCacheDirty = true;
      return null;
    }
    return entry.selector;
  }
  function setCachedSelector(hostname, fieldName, selector) {
    if (!_selectorCache[hostname]) _selectorCache[hostname] = {};
    _selectorCache[hostname][fieldName] = { selector, ts: Date.now() };
    _selectorCacheDirty = true;
    var now = Date.now();
    if (now - _selectorCacheLastSave > 1e4) {
      saveSelectorCache();
    }
  }
  function cleanSelectorCache() {
    var now = Date.now();
    var changed = false;
    Object.keys(_selectorCache).forEach(function(hostname) {
      Object.keys(_selectorCache[hostname]).forEach(function(fieldName) {
        var entry = _selectorCache[hostname][fieldName];
        if (typeof entry === "object" && entry.ts && now - entry.ts > SELECTOR_CACHE_TTL) {
          delete _selectorCache[hostname][fieldName];
          changed = true;
        }
      });
      if (Object.keys(_selectorCache[hostname]).length === 0) {
        delete _selectorCache[hostname];
      }
    });
    if (changed) _selectorCacheDirty = true;
  }
  function loadSelectorCache() {
    chrome.storage.local.get(["audibot_selector_cache"], function(result) {
      _selectorCache = result.audibot_selector_cache || {};
      cleanSelectorCache();
    });
  }
  function saveSelectorCache() {
    if (!_selectorCacheDirty) return;
    _selectorCacheDirty = false;
    _selectorCacheLastSave = Date.now();
    chrome.storage.local.set({ audibot_selector_cache: _selectorCache });
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
  function ultraFillWithRetry(selector, value, opts) {
    var el = document.querySelector(selector);
    if (el) {
      ultraFill2(el, value, opts);
      return;
    }
    var timeout;
    var observer = new MutationObserver(function() {
      var found = document.querySelector(selector);
      if (found) {
        observer.disconnect();
        clearTimeout(timeout);
        ultraFill2(found, value, opts);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    timeout = setTimeout(function() {
      observer.disconnect();
    }, 3e3);
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
  function markFilledByAudiBot2(el, variable) {
    el.setAttribute("data-audibot-filled", variable);
    el.setAttribute("data-audibot-value", el.value);
  }
  async function sendLearningSignal(signal) {
    var syncToken = await getSyncToken();
    if (!syncToken) return;
    fetch("https://audibot.fr/api/extension/smart-fill/learn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ syncToken, hostname: signal.hostname, selector: signal.selector, label: signal.label, oldVariable: signal.oldVariable, correctVariable: signal.correctVariable })
    }).catch(function(err) {
      console.warn("[AudiBot] learning signal failed:", err);
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
        chrome.storage.local.get(["audibot_settings"], function(res) {
          r(res.audibot_settings || {});
        });
      });
      var previewEnabled = settings.previewBeforeFill || false;
      if (inputList.length > 100) {
        var scanToast = document.createElement("div");
        scanToast.id = "audibot-scan-progress";
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
          if (existingVal && !el.getAttribute("data-audibot-filled")) {
            fillReport.skipped.push({ label: normalizeLabel(getFieldLabel(el)), variable: bestField, confidence: bestScore, reason: "deja_rempli" });
            continue;
          }
          if (VALUE_NORMALIZERS[bestField]) {
            value = VALUE_NORMALIZERS[bestField](value, el);
          }
          if (OPTICAL_FIELD_KEYS.indexOf(bestField) !== -1) {
            value = formatOpticalValue(value, el);
          }
          if (bestField === "numeroSecuriteSociale" && value && value.replace(/\D/g, "").length >= 13) {
            var maxLen = parseInt(el.getAttribute("maxlength") || "0");
            var elName = (el.name || "").toLowerCase();
            if (maxLen > 0 && maxLen <= 2 || /rang|cle|key|rang_naissance/.test(elName)) {
              fillReport.skipped.push({ label: normalizeLabel(getFieldLabel(el)), variable: bestField, confidence: bestScore, reason: "nss_dans_champ_rang" });
              continue;
            }
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
      var existingToast = document.getElementById("audibot-scan-progress");
      if (existingToast) existingToast.remove();
      if (scanDuration > 500) {
        console.info("[AudiBot] Smart Fill scan: " + inputList.length + " fields in " + scanDuration + "ms");
      }
      if (scanDuration > 1e3) {
        var resultToast = document.createElement("div");
        resultToast.id = "audibot-scan-progress";
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
                markFilledByAudiBot2(el2, bestField2);
                if (bestScore2 < 80) {
                  el2.setAttribute("data-audibot-confidence", bestScore2);
                  el2.setAttribute("data-audibot-warned", "true");
                  el2.style.backgroundColor = "#fef9c3";
                  el2.style.outline = "2px solid #eab308";
                  el2.title = "AudiBot \u2014 confiance " + bestScore2 + "% (" + bestField2 + ") \u2014 v\xE9rifiez";
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
          markFilledByAudiBot2(el2, bestField2);
          if (bestScore2 >= 50 && bestScore2 < 80) {
            el2.setAttribute("data-audibot-confidence", bestScore2);
            el2.setAttribute("data-audibot-warned", "true");
            el2.style.backgroundColor = "#fef9c3";
            el2.style.outline = "2px solid #eab308";
            el2.title = "AudiBot \u2014 confiance " + bestScore2 + "% (" + bestField2 + ") \u2014 v\xE9rifiez";
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
        chrome.storage.local.set({ audibot_last_fill_report: fillReport });
        if (filled > 0) {
          getSyncToken().then(function(syncToken) {
            if (!syncToken) return;
            fetch("https://audibot.fr/api/extension/log-injection", {
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
              console.warn("[AudiBot] log-injection failed:", err);
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
    overlay.id = "audibot-fill-preview";
    overlay.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;z-index:2147483646;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,sans-serif;";
    var panel = document.createElement("div");
    panel.style.cssText = "background:white;border-radius:16px;padding:24px;max-width:480px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);";
    var title = document.createElement("div");
    title.style.cssText = "font-size:16px;font-weight:700;color:#111;margin-bottom:16px;";
    title.textContent = "AudiBot \u2014 Apercu du remplissage (" + items.length + " champs)";
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
          frames[fi].contentWindow.postMessage({ type: "AUDIBOT_FILL_FRAME", payload: data }, frameOrigin);
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
    chrome.storage.local.get(["audibot_injection_log"], (logResult) => {
      const log = logResult.audibot_injection_log || [];
      log.unshift({
        ts: Date.now(),
        site,
        success,
        fieldsCount,
        syncToken: data.syncToken || null
      });
      chrome.storage.local.set({ audibot_injection_log: log.slice(0, 100) });
    });
    var extVersion = typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getManifest ? chrome.runtime.getManifest().version : "bookmarklet";
    var pingPayloads = [];
    const syncToken = data.syncToken || null;
    if (syncToken && success !== void 0) {
      pingPayloads.push({ url: "https://audibot.fr/api/extension/log-injection", body: { syncToken, site, success, fieldsCount, ts: Date.now() } });
    }
    pingPayloads.push({ url: "https://audibot.fr/api/bookmarklet/ping", body: {
      version: extVersion,
      portal: site || "unknown",
      status: success ? "ok" : fieldsCount === 0 ? "broken" : "partial",
      errorHint: success ? null : "fields=" + fieldsCount
    } });
    try {
      chrome.runtime.sendMessage({ type: "AUDIBOT_PING", payloads: pingPayloads });
    } catch (e) {
    }
    if (success) {
      const btn = document.getElementById("audibot-fill-btn");
      if (btn) {
        btn.innerText = `\u2713 Rempli !`;
        btn.style.background = "#10b981";
        setTimeout(() => {
          btn.innerText = "\u{1F916} Remplir";
          btn.style.background = "#2563eb";
        }, 2e3);
      }
    } else {
      alert(`AudiBot : Aucun formulaire d\xE9tect\xE9.`);
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
      _progressOverlay.id = "audibot-replay-progress";
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
      markFilledByAudiBot(el, varKey);
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
      markFilledByAudiBot(el, varKeyS);
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
        fetch("https://audibot.fr/api/extension/log-injection", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ syncToken, site: parcours.hostname, success: true, fieldsCount: filled, ts: Date.now() })
        }).catch(function(err) {
          console.warn("[AudiBot] log-injection failed:", err);
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
      var res = await fetch("https://audibot.fr/api/extension/parcours?hostname=" + encodeURIComponent(hostname), { headers: { "Authorization": "Bearer " + syncToken } });
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
    chrome.storage.local.get(["audibot_auth", "audibot_rpa"], function(result) {
      var auth = result.audibot_auth || {};
      if (auth.rpaEnabled === false) {
        showRPAToast("RPA disponible \xE0 partir du plan Pro", "info");
        return;
      }
      var rpa = result.audibot_rpa;
      if (!rpa || !rpa.target) return;
      var rpaHostname = rpa.targetHostname || "";
      var targetMatchesCurrent = currentHostname.includes(rpa.target) || currentHostname.includes(rpaHostname);
      if (!targetMatchesCurrent) return;
      if (Date.now() - rpa.ts > 3e5) {
        chrome.storage.local.remove("audibot_rpa");
        return;
      }
      var loginPage = /\/login|\/signin|\/connexion|\/auth|Login\.do/i.test(window.location.pathname) || !!document.querySelector('input[type="password"]');
      if (loginPage && !rpa.login_shown) {
        chrome.storage.local.set({ audibot_rpa: Object.assign({}, rpa, { login_shown: true }) });
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
        chrome.storage.local.remove("audibot_rpa");
        showRPAToast("RPA " + (rpa.target || "portail") + " : d\xE9marrage...", "info");
        if (typeof replayParcours === "function") {
          replayParcours(rpa.parcours, rpa.payload);
        }
        return;
      }
      chrome.storage.local.remove("audibot_rpa");
      showRPAToast("RPA " + (rpa.target || "portail") + " : remplissage automatique...", "info");
      if (typeof performSmartFill === "function") {
        performSmartFill();
      }
    });
  }

  // extension-src/content/index.js
  function loadDynamicParcours() {
    chrome.storage.local.get(["audibot_dynamic_parcours", "audibot_auth"], function(result) {
      var auth = result.audibot_auth || {};
      if (!auth.syncToken) return;
      var cached = result.audibot_dynamic_parcours;
      if (cached && cached.ts && Date.now() - cached.ts < 18e5) {
        injectDynamicParcours(cached.handlers);
        return;
      }
      fetch("https://audibot.fr/api/extension/parcours?handlers=true", {
        headers: { "Authorization": "Bearer " + auth.syncToken }
      }).then(function(r) {
        return r.json();
      }).then(function(data) {
        chrome.storage.local.set({
          audibot_dynamic_parcours: { handlers: data.handlers, ts: Date.now() }
        });
        injectDynamicParcours(data.handlers);
      }).catch(function(err) {
        console.warn("[AudiBot] dynamic parcours fetch failed:", err);
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
    if (document.getElementById("audibot-sync-btn")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "audibot-sync-btn";
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
  async function syncTPToAudiBot(btn) {
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
      btn.innerText = "Connectez-vous sur AudiBot";
      btn.style.background = "#ef4444";
      setTimeout(function() {
        btn.innerText = "Sync TP";
        btn.style.background = "#6366f1";
      }, 3e3);
      return;
    }
    (async function() {
      try {
        var resp = await fetch("https://audibot.fr/api/extension/sync-tp", {
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
    if (document.getElementById("audibot-sync-tp-btn")) return;
    if (!document.querySelector("#grid_pointage_tiers_payant")) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "audibot-sync-tp-btn";
    btn.innerText = "Sync TP";
    btn.style.cssText = [
      "position: fixed; bottom: 140px; right: 20px; z-index: 999999;",
      "background: #6366f1; color: white; border: none; padding: 12px 20px;",
      "border-radius: 50px; font-weight: bold; cursor: pointer;",
      "box-shadow: 0 4px 15px rgba(0,0,0,0.2); font-family: sans-serif;",
      "transition: all 0.2s;"
    ].join("");
    btn.onclick = function() {
      syncTPToAudiBot(btn);
    };
    document.body.appendChild(btn);
  }
  function showRPAToast3(message, type) {
    var existing = document.getElementById("audibot-rpa-toast");
    if (existing) existing.remove();
    var colors = {
      info: { bg: "#2563eb", border: "#3b82f6" },
      success: { bg: "#10b981", border: "#34d399" },
      warning: { bg: "#f59e0b", border: "#fbbf24" },
      error: { bg: "#ef4444", border: "#f87171" }
    };
    var c = colors[type] || colors.info;
    var toast = document.createElement("div");
    toast.id = "audibot-rpa-toast";
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
    if (!e.data || e.data.type !== "AUDIBOT_FILL_FRAME" || !e.data.payload) return;
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
        console.warn("[AudiBot] postMessage rejet\xE9 \u2014 iframe non reconnue :", e.origin);
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
        e.source.postMessage({ type: "AUDIBOT_FILL_FRAME_ACK", ok: true }, e.origin);
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
      if (!document.getElementById("audibot-fill-btn")) {
        var btnSmart = document.createElement("button");
        btnSmart.type = "button";
        btnSmart.id = "audibot-fill-btn";
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
    if (!document.getElementById("audibot-fill-btn")) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.id = "audibot-fill-btn";
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
      var filledVar = el.getAttribute("data-audibot-filled");
      if (!filledVar) return;
      var oldValue = el.getAttribute("data-audibot-value");
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
      if (!doc || doc._audibotObserved) return;
      doc._audibotObserved = true;
      var obs = new MutationObserver(function() {
        if (_smartFillDebounce) clearTimeout(_smartFillDebounce);
        _smartFillDebounce = setTimeout(function() {
          var currentFields = getVisibleFields();
          var hasNew = false;
          currentFields.forEach(function(f) {
            var key = f.id || f.name || f.getAttribute && f.getAttribute("formcontrolname") || "";
            if (key && !_knownFieldIds.has(key) && !(f.getAttribute && f.getAttribute("data-audibot-filled"))) {
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
    var ids = ["audibot-fill-btn", "audibot-sync-btn", "audibot-sync-tp-btn"];
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (el) el.style.display = visible ? "block" : "none";
    }
  }
  chrome.runtime.onMessage.addListener(function(msg) {
    if (msg && msg.type === "AUDIBOT_TOGGLE_BUTTONS") {
      setButtonsVisibility(msg.visible);
    }
    if (msg && msg.type === "AUDIBOT_PAGE_LOADED") {
      var matchedPortail = Object.values(CONFIGS2).find(function(cfg) {
        return cfg.isMatch();
      });
      if (matchedPortail) {
      }
    }
  });
  function applyButtonsPreference() {
    chrome.storage.local.get(["audibot_buttons_visible"], function(result) {
      var visible = result.audibot_buttons_visible !== false;
      setButtonsVisibility(visible);
    });
  }
  if (typeof initFieldFeedback === "function") initFieldFeedback();
  (function() {
    var _lastHref = window.location.href;
    function onSpaNavigation() {
      var newHref = window.location.href;
      if (newHref === _lastHref) return;
      _lastHref = newHref;
      console.info("[AudiBot] SPA navigation d\xE9tect\xE9e \u2192", newHref);
      var currentSite = Object.values(CONFIGS2).find(function(cfg) {
        return cfg.isMatch();
      });
      if (currentSite) {
        setTimeout(function() {
          var fillBtn = document.getElementById("audibot-fill-btn");
          if (fillBtn) fillBtn.style.display = "";
        }, 500);
      }
    }
    var originalPushState = history.pushState.bind(history);
    var originalReplaceState = history.replaceState.bind(history);
    history.pushState = function() {
      originalPushState.apply(history, arguments);
      setTimeout(onSpaNavigation, 100);
    };
    history.replaceState = function() {
      originalReplaceState.apply(history, arguments);
      setTimeout(onSpaNavigation, 100);
    };
    window.addEventListener("popstate", onSpaNavigation);
  })();
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
    if (window.location.hostname.includes("audibot.fr")) return;
    setTimeout(function() {
      if (typeof createCommandCenter === "function") createCommandCenter();
    }, 1500);
  }
  chrome.runtime.onMessage.addListener(function(msg) {
    if (msg && msg.type === "AUDIBOT_LAUNCH_PARCOURS" && msg.parcoursId) {
      (async function() {
        var syncToken = await getSyncToken();
        if (!syncToken) return;
        try {
          var hostname = window.location.hostname.replace("www.", "");
          var res = await fetch("https://audibot.fr/api/extension/parcours?hostname=" + encodeURIComponent(hostname), { headers: { "Authorization": "Bearer " + syncToken } });
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
    if (document.getElementById("audibot-recorder-panel")) return;
    var panel = document.createElement("div");
    panel.id = "audibot-recorder-panel";
    panel.style.cssText = "position:fixed;right:0;top:50%;transform:translateY(-50%);z-index:2147483646;background:white;border-radius:12px 0 0 12px;box-shadow:-4px 0 20px rgba(0,0,0,0.15);width:260px;font-family:sans-serif;display:flex;flex-direction:column;max-height:70vh;";
    var header = document.createElement("div");
    header.style.cssText = "padding:14px 16px 10px;border-bottom:1px solid #e5e7eb;";
    header.innerHTML = '<div style="font-size:14px;font-weight:700;color:#ef4444;">\u23FA AudiBot \u2014 Enregistrement</div>';
    panel.appendChild(header);
    var body = document.createElement("div");
    body.id = "audibot-recorder-panel-body";
    body.style.cssText = "flex:1;overflow-y:auto;padding:8px 12px;";
    panel.appendChild(body);
    var footer = document.createElement("div");
    footer.id = "audibot-recorder-panel-footer";
    footer.style.cssText = "padding:10px 16px;border-top:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;";
    var counter = document.createElement("span");
    counter.id = "audibot-recorder-panel-counter";
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
    var body = document.getElementById("audibot-recorder-panel-body");
    var counter = document.getElementById("audibot-recorder-panel-counter");
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
    if (!el || el.getAttribute("data-audibot-recorded")) return;
    el.setAttribute("data-audibot-recorded", "true");
    var isKnown = variable && variable.indexOf("{{") === 0;
    el.style.outline = isKnown ? "2px solid #10b981" : "2px solid #f59e0b";
    el.style.backgroundColor = isKnown ? "#f0fdf4" : "#fffbeb";
    var rect = el.getBoundingClientRect();
    var badge = document.createElement("span");
    badge.className = "audibot-recorder-field-badge";
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
    var marked = document.querySelectorAll("[data-audibot-recorded]");
    for (var i = 0; i < marked.length; i++) {
      marked[i].style.outline = "";
      marked[i].style.backgroundColor = "";
      marked[i].removeAttribute("data-audibot-recorded");
    }
    var badges = document.querySelectorAll(".audibot-recorder-field-badge");
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
    badge.id = "audibot-recorder-badge";
    badge.style.cssText = "position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:2147483647;background:#ef4444;color:white;padding:8px 20px;border-radius:50px;font-family:sans-serif;font-size:13px;font-weight:bold;box-shadow:0 4px 15px rgba(0,0,0,0.3);display:flex;align-items:center;gap:8px;";
    badge.innerHTML = '<span style="width:10px;height:10px;background:white;border-radius:50%;display:inline-block;animation:pulse 1s infinite;"></span> Enregistrement en cours \u2014 effectuez le parcours manuellement';
    document.body.appendChild(badge);
    if (!document.getElementById("audibot-recorder-style")) {
      var style = document.createElement("style");
      style.id = "audibot-recorder-style";
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
          if (!iDoc || iDoc._audibotRecorder) continue;
          iDoc._audibotRecorder = true;
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
    chrome.storage.local.set({ audibot_recorder: { active: true, etapes: [], hostname: recorderState.hostname, startTime: recorderState.startTime } });
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
          iDoc._audibotRecorder = false;
          iDoc.removeEventListener("click", onRecorderClick, true);
          iDoc.removeEventListener("change", onRecorderChange, true);
          iDoc.removeEventListener("blur", onRecorderBlur, true);
        } catch (e) {
        }
      }
    } catch (e) {
    }
    var badge = document.getElementById("audibot-recorder-badge");
    if (badge) badge.remove();
    var panel = document.getElementById("audibot-recorder-panel");
    if (panel) panel.remove();
    removeRecorderHighlights();
    var etapes = recorderState.etapes;
    var hostname = recorderState.hostname;
    recorderState = null;
    chrome.storage.local.remove("audibot_recorder");
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
      var res = await fetch("https://audibot.fr/api/extension/parcours/save", {
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
    var existing = document.getElementById("audibot-recorder-modal-overlay");
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
    overlay.id = "audibot-recorder-modal-overlay";
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
      sendBtn.textContent = "Envoyer \xE0 AudiBot";
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
        a.download = "audibot-parcours-" + hostname + ".json";
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
    if (!el || el.id === "audibot-recorder-badge" || el.closest("#audibot-recorder-badge") || el.closest("#audibot-recorder-panel")) return;
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
        showRPAToast3("\u{1F4C4} Nouvelle page \u2014 continuez votre saisie, AudiBot enregistre", "info");
        var recBadge = document.getElementById("audibot-recorder-badge");
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
    chrome.storage.local.set({ audibot_recorder: {
      active: true,
      etapes: etapesSansHtml,
      hostname: recorderState.hostname,
      startTime: recorderState.startTime,
      pages
    } });
  }
  function restoreRecorderIfNeeded() {
    chrome.storage.local.get(["audibot_recorder"], function(result) {
      var saved = result.audibot_recorder;
      if (!saved || !saved.active) return;
      recorderState = {
        etapes: saved.etapes || [],
        hostname: saved.hostname || window.location.hostname.replace("www.", ""),
        startTime: saved.startTime || Date.now()
      };
      if (!document.getElementById("audibot-recorder-badge")) {
        var badge = document.createElement("div");
        badge.id = "audibot-recorder-badge";
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
    if (msg && msg.type === "AUDIBOT_RECORDER_START") startRecorder();
    if (msg && msg.type === "AUDIBOT_RECORDER_STOP") stopRecorder();
    if (msg && msg.type === "AUDIBOT_RECORDER_STATUS") {
      chrome.runtime.sendMessage({ type: "AUDIBOT_RECORDER_STATUS_REPLY", active: !!recorderState, etapes: recorderState ? recorderState.etapes.length : 0 });
    }
  });
  globalThis.ultraFill = ultraFill2;
  globalThis.ultraFillWithRetry = ultraFillWithRetry;
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vZXh0ZW5zaW9uLXNyYy9jb250ZW50L3BvcnRhbHMvZ2VuZXJhdGlvbi5qcyIsICIuLi9leHRlbnNpb24tc3JjL2NvbnRlbnQvcG9ydGFscy9saXZlYnlvcHRpbXVtLmpzIiwgIi4uL2V4dGVuc2lvbi1zcmMvY29udGVudC9wb3J0YWxzL3dlbWluZC5qcyIsICIuLi9leHRlbnNpb24tc3JjL2NvbnRlbnQvcG9ydGFscy9hcGdpcy5qcyIsICIuLi9leHRlbnNpb24tc3JjL2NvbnRlbnQvcG9ydGFscy9hY3RpbC5qcyIsICIuLi9leHRlbnNpb24tc3JjL2NvbnRlbnQvcG9ydGFscy9tZXJjZXIuanMiLCAiLi4vZXh0ZW5zaW9uLXNyYy9jb250ZW50L3BvcnRhbHMvdHAtcGx1cy5qcyIsICIuLi9leHRlbnNpb24tc3JjL2NvbnRlbnQvcG9ydGFscy9mZmwtcHJvbW90ZXVyLmpzIiwgIi4uL2V4dGVuc2lvbi1zcmMvY29udGVudC9wb3J0YWxzL3NvbGltdXQuanMiLCAiLi4vZXh0ZW5zaW9uLXNyYy9jb250ZW50L3BvcnRhbHMvYW1lbGkuanMiLCAiLi4vZXh0ZW5zaW9uLXNyYy9jb250ZW50L3BvcnRhbHMvYWxtZXJ5cy5qcyIsICIuLi9leHRlbnNpb24tc3JjL2NvbnRlbnQvcG9ydGFscy9veGFudGlzLmpzIiwgIi4uL2V4dGVuc2lvbi1zcmMvY29udGVudC9wb3J0YWxzL2l0ZWxpcy5qcyIsICIuLi9leHRlbnNpb24tc3JjL2NvbnRlbnQvcG9ydGFscy92aWFtZWRpcy5qcyIsICIuLi9leHRlbnNpb24tc3JjL2NvbnRlbnQvcG9ydGFscy9pbmRleC5qcyIsICIuLi9leHRlbnNpb24tc3JjL2NvbnRlbnQvdXRpbHMvcmVtb3RlLXNlbGVjdG9ycy5qcyIsICIuLi9leHRlbnNpb24tc3JjL2NvbnRlbnQvdXRpbHMvZmllbGQtZmVlZGJhY2suanMiLCAiLi4vZXh0ZW5zaW9uLXNyYy9jb250ZW50L3V0aWxzL3NlbGVjdG9yLWhlYWx0aC5qcyIsICIuLi9leHRlbnNpb24tc3JjL2NvbnRlbnQvdXRpbHMvcmVqZWN0aW9uLXByZWRpY3Rvci5qcyIsICIuLi9leHRlbnNpb24tc3JjL2NvbnRlbnQvY29tbWFuZC1jZW50ZXIuanMiLCAiLi4vZXh0ZW5zaW9uLXNyYy9jb250ZW50L3V0aWxzL2RldmlzLWNhcHR1cmUuanMiLCAiLi4vZXh0ZW5zaW9uLXNyYy9jb250ZW50L3V0aWxzL2RvbS5qcyIsICIuLi9leHRlbnNpb24tc3JjL2NvbnRlbnQvdXRpbHMvZm9ybWF0LmpzIiwgIi4uL2V4dGVuc2lvbi1zcmMvY29udGVudC91dGlscy9kYXRhLmpzIiwgIi4uL2V4dGVuc2lvbi1zcmMvY29udGVudC91dGlscy9maWVsZC1tYXRjaGluZy5qcyIsICIuLi9leHRlbnNpb24tc3JjL2NvbnRlbnQvdXRpbHMvc2VsZWN0b3ItY2FjaGUuanMiLCAiLi4vZXh0ZW5zaW9uLXNyYy9jb250ZW50L3V0aWxzL2ZpbGwuanMiLCAiLi4vZXh0ZW5zaW9uLXNyYy9jb250ZW50L3NtYXJ0LWZpbGwvbGVhcm5pbmcuanMiLCAiLi4vZXh0ZW5zaW9uLXNyYy9jb250ZW50L3NtYXJ0LWZpbGwvaW5kZXguanMiLCAiLi4vZXh0ZW5zaW9uLXNyYy9jb250ZW50L3N0YW5kYXJkLWZpbGwvaW5kZXguanMiLCAiLi4vZXh0ZW5zaW9uLXNyYy9jb250ZW50L3JlcGxheS9pbmRleC5qcyIsICIuLi9leHRlbnNpb24tc3JjL2NvbnRlbnQvcnBhL2luZGV4LmpzIiwgIi4uL2V4dGVuc2lvbi1zcmMvY29udGVudC9pbmRleC5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0IGRlZmF1bHQge1xuICBuYW1lOiBcIkdlbmVyYXRpb25cIixcbiAgaXNNYXRjaDogKCkgPT4gd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLmluY2x1ZGVzKFwiZ2VuZXJhdGlvbi5mclwiKSxcbiAgYWN0aW9uczoge1xuICAgIGZvcm11bGFpcmU6IChkYXRhKSA9PiB7XG4gICAgICB2YXIgbSA9IGRhdGEubSB8fCB7fTtcbiAgICAgIHZhciBvID0gZGF0YS5vIHx8IHt9O1xuICAgICAgdmFyIGMgPSBkYXRhLmNhY2hlZCB8fCB7fTtcbiAgICAgIHZhciBmaWxsZWQgPSAwO1xuXG4gICAgICAvKiBcdTI1MDBcdTI1MDAgUGFnZSAxIDogUmVjaGVyY2hlIGFkaFx1MDBFOXJlbnQgKFR4dE5vQWRoKSBcdTI1MDBcdTI1MDAgKi9cbiAgICAgIHZhciBhZGhFbCA9IGZpbmRFbGVtZW50KCcjY3RsMDBfQ3BoX1R4dE5vQWRoJyk7XG4gICAgICBpZiAoYWRoRWwpIHtcbiAgICAgICAgdmFyIG5vQWRoID0gbS5udW1lcm9BZGhlcmVudCB8fCAoYy5yZWdpbWVzICYmIGMucmVnaW1lcy5yYzEgJiYgYy5yZWdpbWVzLnJjMS5udW1lcm9BZGhlcmVudCkgfHwgYy5udW1lcm9BZGhlcmVudCB8fCBcIlwiO1xuICAgICAgICB2YXIgbnNzID0gbS5udW1lcm9TZWN1cml0ZVNvY2lhbGUgfHwgYy5uc3MgfHwgXCJcIjtcbiAgICAgICAgdmFyIGRpZ2l0cyA9IG5zcy5yZXBsYWNlKC9cXEQvZywgXCJcIikuc2xpY2UoMCwgMTUpO1xuICAgICAgICB2YXIgZm9ybWF0dGVkTlNTID0gZGlnaXRzO1xuICAgICAgICBpZiAoZGlnaXRzLmxlbmd0aCA+PSAxMykge1xuICAgICAgICAgIGZvcm1hdHRlZE5TUyA9IGRpZ2l0c1swXSArIFwiIFwiICsgZGlnaXRzLnNsaWNlKDEsMykgKyBcIiBcIiArIGRpZ2l0cy5zbGljZSgzLDUpICsgXCIgXCIgKyBkaWdpdHMuc2xpY2UoNSw3KSArIFwiIFwiICsgZGlnaXRzLnNsaWNlKDcsMTApICsgXCIgXCIgKyBkaWdpdHMuc2xpY2UoMTAsMTMpO1xuICAgICAgICAgIGlmIChkaWdpdHMubGVuZ3RoID49IDE1KSBmb3JtYXR0ZWROU1MgKz0gXCIgXCIgKyBkaWdpdHMuc2xpY2UoMTMsMTUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub0FkaCkgeyB1bHRyYUZpbGwoYWRoRWwsIG5vQWRoKTsgZmlsbGVkKys7IH1cbiAgICAgICAgaWYgKGZvcm1hdHRlZE5TUykgeyB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJyNjdGwwMF9DcGhfVHh0Tm9TUycpLCBmb3JtYXR0ZWROU1MpOyBmaWxsZWQrKzsgfVxuICAgICAgICByZXR1cm4gZmlsbGVkID4gMDtcbiAgICAgIH1cblxuICAgICAgLyogXHUyNTAwXHUyNTAwIFBhZ2UgMiA6IFNpbXVsYXRpb24gVmVycmVzL01vbnR1cmUgXHUyNTAwXHUyNTAwICovXG4gICAgICB2YXIgYWRlbGlFbCA9IGZpbmRFbGVtZW50KCcjY3RsMDBfQ3BoX1RDQ2FsY3VsX1RQVmVycmVzTW9udF9EZGxOb0FkZWxpUHJlc2NyaXB0ZXVyJyk7XG4gICAgICBpZiAoYWRlbGlFbCkge1xuICAgICAgICB2YXIgb3Jkb25uYW5jZSA9IG8gfHwgKGMub3Jkb25uYW5jZSkgfHwge307XG4gICAgICAgIHZhciBwcmVzY3JpcHRpb24gPSBjLnByZXNjcmlwdGlvbiB8fCBjLm9yZG9ubmFuY2UgfHwge307XG4gICAgICAgIHZhciBvZCA9IG8ubHVuZXR0ZXNPRCB8fCBwcmVzY3JpcHRpb24ub2QgfHwge307XG4gICAgICAgIHZhciBvZyA9IG8ubHVuZXR0ZXNPRyB8fCBwcmVzY3JpcHRpb24ub2cgfHwge307XG4gICAgICAgIHZhciBlcURhdGEgPSBjLmVxdWlwZW1lbnRzIHx8IFtdO1xuICAgICAgICB2YXIgbW9udHVyZUxpZ25lID0gbnVsbCwgdmVycmVPRCA9IG51bGwsIHZlcnJlT0cgPSBudWxsO1xuICAgICAgICBmb3IgKHZhciBlaSA9IDA7IGVpIDwgZXFEYXRhLmxlbmd0aDsgZWkrKykge1xuICAgICAgICAgIHZhciBsaWduZXMgPSBlcURhdGFbZWldLmxpZ25lcyB8fCBbXTtcbiAgICAgICAgICBmb3IgKHZhciBsaSA9IDA7IGxpIDwgbGlnbmVzLmxlbmd0aDsgbGkrKykge1xuICAgICAgICAgICAgdmFyIGxpZ25lID0gbGlnbmVzW2xpXTtcbiAgICAgICAgICAgIGlmIChsaWduZS50eXBlID09PSBcIm1vbnR1cmVcIiAmJiAhbW9udHVyZUxpZ25lKSBtb250dXJlTGlnbmUgPSBsaWduZTtcbiAgICAgICAgICAgIGlmIChsaWduZS50eXBlID09PSBcInZlcnJlXCIpIHtcbiAgICAgICAgICAgICAgaWYgKGxpZ25lLm9laWwgPT09IFwiT0RcIiAmJiAhdmVycmVPRCkgdmVycmVPRCA9IGxpZ25lO1xuICAgICAgICAgICAgICBlbHNlIGlmIChsaWduZS5vZWlsID09PSBcIk9HXCIgJiYgIXZlcnJlT0cpIHZlcnJlT0cgPSBsaWduZTtcbiAgICAgICAgICAgICAgZWxzZSBpZiAoIXZlcnJlT0QpIHZlcnJlT0QgPSBsaWduZTtcbiAgICAgICAgICAgICAgZWxzZSBpZiAoIXZlcnJlT0cpIHZlcnJlT0cgPSBsaWduZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiBOXHUwMEIwIEFERUxJIFByZXNjcmlwdGV1ciAqL1xuICAgICAgICB2YXIgcnBwcyA9IG8ucnBwcyB8fCBvcmRvbm5hbmNlLnJwcHMgfHwgcHJlc2NyaXB0aW9uLnJwcHMgfHwgYy5ycHBzIHx8IFwiXCI7XG4gICAgICAgIGlmIChycHBzKSB7IHVsdHJhRmlsbChhZGVsaUVsLCBycHBzLnJlcGxhY2UoL1xcRC9nLCBcIlwiKS5zbGljZSgwLCA5KSk7IGZpbGxlZCsrOyB9XG5cbiAgICAgICAgLyogRGF0ZSBvcmRvbm5hbmNlICovXG4gICAgICAgIHZhciBkYXRlT3JkbyA9IG8uZGF0ZU9yZG9ubmFuY2UgfHwgb3Jkb25uYW5jZS5kYXRlT3Jkb25uYW5jZSB8fCBcIlwiO1xuICAgICAgICB2YXIgZGF0ZU9yZG9FbCA9IGZpbmRFbGVtZW50KCcjY3RsMDBfQ3BoX1RDQ2FsY3VsX1RQVmVycmVzTW9udF9DRE9yZG9WZXJyZXNNb250X1RleHRCb3hEYXRlJyk7XG4gICAgICAgIGlmIChkYXRlT3JkbyAmJiBkYXRlT3Jkb0VsICYmICFkYXRlT3Jkb0VsLmRpc2FibGVkKSB7IHVsdHJhRmlsbChkYXRlT3Jkb0VsLCBkYXRlT3Jkbyk7IGZpbGxlZCsrOyB9XG5cbiAgICAgICAgLyogT0QgXHUyMDE0IENvcnJlY3Rpb24gKi9cbiAgICAgICAgaWYgKG9kLnNwaGVyZSkgeyB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJyNjdGwwMF9DcGhfVENDYWxjdWxfVFBWZXJyZXNNb250X1R4dFNwaGVyZUQnKSwgb2Quc3BoZXJlKTsgZmlsbGVkKys7IH1cbiAgICAgICAgaWYgKG9kLmN5bGluZHJlKSB7IHVsdHJhRmlsbChmaW5kRWxlbWVudCgnI2N0bDAwX0NwaF9UQ0NhbGN1bF9UUFZlcnJlc01vbnRfVHh0Q3lsRCcpLCBvZC5jeWxpbmRyZSk7IGZpbGxlZCsrOyB9XG4gICAgICAgIGlmIChvZC5heGUpIHsgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCcjY3RsMDBfQ3BoX1RDQ2FsY3VsX1RQVmVycmVzTW9udF9UeHRBeGVEJyksIG9kLmF4ZSk7IGZpbGxlZCsrOyB9XG4gICAgICAgIGlmIChvZC5hZGRpdGlvbikgeyB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJyNjdGwwMF9DcGhfVENDYWxjdWxfVFBWZXJyZXNNb250X1R4dEFkZEQnKSwgb2QuYWRkaXRpb24pOyBmaWxsZWQrKzsgfVxuXG4gICAgICAgIC8qIE9EIFx1MjAxNCBWZXJyZSAoY29kZSBMUFAsIG1vbnRhbnQpICovXG4gICAgICAgIGlmICh2ZXJyZU9EKSB7XG4gICAgICAgICAgaWYgKHZlcnJlT0QuY29kZUxQUCkgeyB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJyNjdGwwMF9DcGhfVENDYWxjdWxfVFBWZXJyZXNNb250X1R4dENvZGVMUFBEJyksIHZlcnJlT0QuY29kZUxQUCk7IGZpbGxlZCsrOyB9XG4gICAgICAgICAgaWYgKHZlcnJlT0QucHJpeEJydXQpIHsgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCcjY3RsMDBfQ3BoX1RDQ2FsY3VsX1RQVmVycmVzTW9udF9UeHRNdFZlcnJlRCcpLCBTdHJpbmcodmVycmVPRC5wcml4QnJ1dCkucmVwbGFjZShcIi5cIiwgXCIsXCIpKTsgZmlsbGVkKys7IH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIE9HIFx1MjAxNCBDb3JyZWN0aW9uICovXG4gICAgICAgIGlmIChvZy5zcGhlcmUpIHsgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCcjY3RsMDBfQ3BoX1RDQ2FsY3VsX1RQVmVycmVzTW9udF9UeHRTcGhlcmVHJyksIG9nLnNwaGVyZSk7IGZpbGxlZCsrOyB9XG4gICAgICAgIGlmIChvZy5jeWxpbmRyZSkgeyB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJyNjdGwwMF9DcGhfVENDYWxjdWxfVFBWZXJyZXNNb250X1R4dEN5bEcnKSwgb2cuY3lsaW5kcmUpOyBmaWxsZWQrKzsgfVxuICAgICAgICBpZiAob2cuYXhlKSB7IHVsdHJhRmlsbChmaW5kRWxlbWVudCgnI2N0bDAwX0NwaF9UQ0NhbGN1bF9UUFZlcnJlc01vbnRfVHh0QXhlRycpLCBvZy5heGUpOyBmaWxsZWQrKzsgfVxuICAgICAgICBpZiAob2cuYWRkaXRpb24pIHsgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCcjY3RsMDBfQ3BoX1RDQ2FsY3VsX1RQVmVycmVzTW9udF9UeHRBZGRHJyksIG9nLmFkZGl0aW9uKTsgZmlsbGVkKys7IH1cblxuICAgICAgICAvKiBPRyBcdTIwMTQgVmVycmUgKGNvZGUgTFBQLCBtb250YW50KSAqL1xuICAgICAgICBpZiAodmVycmVPRykge1xuICAgICAgICAgIGlmICh2ZXJyZU9HLmNvZGVMUFApIHsgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCcjY3RsMDBfQ3BoX1RDQ2FsY3VsX1RQVmVycmVzTW9udF9UeHRDb2RlTFBQRycpLCB2ZXJyZU9HLmNvZGVMUFApOyBmaWxsZWQrKzsgfVxuICAgICAgICAgIGlmICh2ZXJyZU9HLnByaXhCcnV0KSB7IHVsdHJhRmlsbChmaW5kRWxlbWVudCgnI2N0bDAwX0NwaF9UQ0NhbGN1bF9UUFZlcnJlc01vbnRfVHh0TXRWZXJyZUcnKSwgU3RyaW5nKHZlcnJlT0cucHJpeEJydXQpLnJlcGxhY2UoXCIuXCIsIFwiLFwiKSk7IGZpbGxlZCsrOyB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiBNb250dXJlICovXG4gICAgICAgIGlmIChtb250dXJlTGlnbmUpIHtcbiAgICAgICAgICBpZiAobW9udHVyZUxpZ25lLmNvZGVMUFApIHsgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCcjY3RsMDBfQ3BoX1RDQ2FsY3VsX1RQVmVycmVzTW9udF9UeHRDb2RlTFBQTW9udCcpLCBtb250dXJlTGlnbmUuY29kZUxQUCk7IGZpbGxlZCsrOyB9XG4gICAgICAgICAgaWYgKG1vbnR1cmVMaWduZS5wcml4QnJ1dCkgeyB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJyNjdGwwMF9DcGhfVENDYWxjdWxfVFBWZXJyZXNNb250X1R4dE10TW9udCcpLCBTdHJpbmcobW9udHVyZUxpZ25lLnByaXhCcnV0KS5yZXBsYWNlKFwiLlwiLCBcIixcIikpOyBmaWxsZWQrKzsgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5pbmZvKFwiW0F1ZGlCb3QgR2VuZXJhdGlvbl0gUGFnZSBzaW11bGF0aW9uIFx1MjAxNCBmaWxsZWQ6XCIsIGZpbGxlZCwgXCJ8IGhhc09EOlwiLCAhIW9kLCBcInwgaGFzT0c6XCIsICEhb2csIFwifCBtb250dXJlOlwiLCAhIW1vbnR1cmVMaWduZSwgXCJ8IHZlcnJlT0Q6XCIsICEhdmVycmVPRCwgXCJ8IHZlcnJlT0c6XCIsICEhdmVycmVPRyk7XG4gICAgICAgIHJldHVybiBmaWxsZWQgPiAwO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcbiAgICBzeW5jaHJvbmlzZXI6IGFzeW5jICgpID0+IGZhbHNlXG4gIH1cbn07XG4iLCAiY29uc3QgTEJPX1NFTEVDVE9SUyA9IHtcbiAgbm9tOiAnW25hbWU9XCJpbmZvc19jbGllbnRbbm9tXVwiXScsXG4gIHByZW5vbTogJ1tuYW1lPVwiaW5mb3NfY2xpZW50W3ByZW5vbV1cIl0nLFxuICBkb2I6ICdbbmFtZT1cImluZm9zX2NsaWVudFtkYXRlX25haXNzYW5jZV1cIl0nLFxuICBuc3M6ICdbbmFtZT1cImluZm9zX2NsaWVudFtudW1fc3NdXCJdJyxcbiAgY2xlOiAnW25hbWU9XCJpbmZvc19jbGllbnRbY2xlX3NzXVwiXScsXG4gIHBob25lOiAnI3RlbGVwaG9uZV9mb3JtX2NsaWVudF81JyxcbiAgZW1haWw6ICdbbmFtZT1cImluZm9zX2NsaWVudFtlbWFpbF1cIl0nLFxuICBhZGRyZXNzOiAnW25hbWU9XCJpbmZvc19jbGllbnRbYWRyZXNzZV1bbGlnbmVfMV1cIl0nLFxuICB6aXA6ICdbbmFtZT1cImluZm9zX2NsaWVudFthZHJlc3NlXVtjb2RlX3Bvc3RhbF1cIl0nLFxuICBjaXR5OiAnW25hbWU9XCJpbmZvc19jbGllbnRbYWRyZXNzZV1bdmlsbGVdXCJdJyxcbiAgbm9tQXNzdXJlOiAnW25hbWU9XCJpbmZvc19jbGllbnRbbm9tX2Fzc3VyZV1cIl0nLFxuICByYW5nTmFpc3NhbmNlOiAnW25hbWU9XCJpbmZvc19jbGllbnRbcmFuZ19uYWlzc2FuY2VdXCJdJyxcbiAgaXNBc3RpZ21hdGU6ICdbbmFtZT1cImluZm9zX2NsaWVudFtpc19hc3RpZ21hdGVdXCJdJ1xufTtcblxuZXhwb3J0IGRlZmF1bHQge1xuICBuYW1lOiBcIkxpdmVieU9wdGltdW1cIixcbiAgaXNNYXRjaDogKCkgPT4gd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLmluY2x1ZGVzKFwibGl2ZWJ5b3B0aW11bS5jb21cIiksXG4gIHNlbGVjdG9yczogTEJPX1NFTEVDVE9SUyxcbiAgYWN0aW9uczoge1xuICAgIGZvcm11bGFpcmU6IChkYXRhKSA9PiB7XG4gICAgICAvKiBDaGFtcCByZWNoZXJjaGUgY2xpZW50IChwYWdlIGFjY3VlaWwgLyBiYXJyZSBkZSByZWNoZXJjaGUpICovXG4gICAgICBjb25zdCBzZWFyY2hJbnB1dCA9IGZpbmRFbGVtZW50KCcjaW5wdXRfcmVjaGVyY2hlX2NsaWVudCcpO1xuICAgICAgY29uc3QgZm9ybUNoZWNrID0gZmluZEVsZW1lbnQoTEJPX1NFTEVDVE9SUy5ub20pO1xuXG4gICAgICBpZiAoc2VhcmNoSW5wdXQgJiYgIWZvcm1DaGVjaykge1xuICAgICAgICBjb25zdCBtID0gZGF0YS5tIHx8IHt9O1xuICAgICAgICBjb25zdCBvID0gZGF0YS5vIHx8IHt9O1xuICAgICAgICBjb25zdCBjID0gZGF0YS5jYWNoZWQgfHwge307XG4gICAgICAgIGNvbnN0IHAwID0gKG0ucGVyc29ubmVzICYmIG0ucGVyc29ubmVzLmxlbmd0aCA+IDApID8gbS5wZXJzb25uZXNbMF0gOiB7fTtcbiAgICAgICAgY29uc3Qgbm9tID0gKG0ubm9tIHx8IHAwLm5vbSB8fCBvLm5vbVBhdGllbnQgfHwgYy5ub20gfHwgXCJcIikudG9VcHBlckNhc2UoKTtcbiAgICAgICAgaWYgKG5vbSkge1xuICAgICAgICAgIHVsdHJhRmlsbChzZWFyY2hJbnB1dCwgbm9tKTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGlmICghZm9ybUNoZWNrKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIGNvbnN0IG0gPSBkYXRhLm0gfHwge307XG4gICAgICBjb25zdCBvID0gZGF0YS5vIHx8IHt9O1xuICAgICAgY29uc3QgYyA9IGRhdGEuY2FjaGVkIHx8IHt9O1xuICAgICAgY29uc3QgcDAgPSAobS5wZXJzb25uZXMgJiYgbS5wZXJzb25uZXMubGVuZ3RoID4gMCkgPyBtLnBlcnNvbm5lc1swXSA6IHt9O1xuXG4gICAgICBjb25zdCByYXdOU1MgPSBtLm51bWVyb1NlY3VyaXRlU29jaWFsZSB8fCBwMC5udW1lcm9TZWN1cml0ZVNvY2lhbGUgfHwgYy5uc3MgfHwgXCJcIjtcbiAgICAgIGNvbnN0IGRvYiA9IG0uZGF0ZU5haXNzYW5jZSB8fCBwMC5kYXRlTmFpc3NhbmNlIHx8IG8uZGF0ZU5haXNzYW5jZVBhdGllbnQgfHwgYy5kb2IgfHwgXCJcIjtcbiAgICAgIGNvbnN0IG5zcyA9IGdldE91dnJhbnREcm9pdE5TUyhyYXdOU1MsIGRvYiwgbS5wZXJzb25uZXMpO1xuXG4gICAgICBjb25zdCBtYXBwaW5nID0ge1xuICAgICAgICAnaW5mb3NfY2xpZW50W2NpdmlsaXRlX3R5cGVfaWRdJzogbnNzLnN0YXJ0c1dpdGgoJzEnKSA/ICcxJyA6IChuc3Muc3RhcnRzV2l0aCgnMicpID8gJzInIDogJzAnKSxcbiAgICAgICAgJ2luZm9zX2NsaWVudFtub21dJzogKG0ubm9tIHx8IHAwLm5vbSB8fCBvLm5vbVBhdGllbnQgfHwgYy5ub20gfHwgXCJcIikudG9VcHBlckNhc2UoKSxcbiAgICAgICAgJ2luZm9zX2NsaWVudFtwcmVub21dJzogY2FwaXRhbGl6ZShtLnByZW5vbSB8fCBwMC5wcmVub20gfHwgby5wcmVub21QYXRpZW50IHx8IGMucHJlbm9tIHx8IFwiXCIpLFxuICAgICAgICAnaW5mb3NfY2xpZW50W2RhdGVfbmFpc3NhbmNlXSc6IGRvYixcbiAgICAgICAgJ2luZm9zX2NsaWVudFtudW1fc3NdJzogbnNzLnNsaWNlKDAsIDEzKSxcbiAgICAgICAgJ2luZm9zX2NsaWVudFtjbGVfc3NdJzogbnNzLnNsaWNlKDEzLCAxNSksXG4gICAgICAgICdpbmZvc19jbGllbnRbZW1haWxdJzogYy5lbWFpbCB8fCBcIlwiLFxuICAgICAgICAnaW5mb3NfY2xpZW50W2FkcmVzc2VdW2xpZ25lXzFdJzogYy5hZGRyZXNzIHx8IFwiXCIsXG4gICAgICAgICdpbmZvc19jbGllbnRbYWRyZXNzZV1bY29kZV9wb3N0YWxdJzogYy56aXBDb2RlIHx8IFwiXCIsXG4gICAgICAgICdpbmZvc19jbGllbnRbYWRyZXNzZV1bdmlsbGVdJzogYy5jaXR5IHx8IFwiXCIsXG4gICAgICAgICdpbmZvc19jbGllbnRbbm9tX2Fzc3VyZV0nOiBjLm5vbUFzc3VyZSB8fCBcIlwiLFxuICAgICAgICAnaW5mb3NfY2xpZW50W3JhbmdfbmFpc3NhbmNlXSc6IGMucmFuZ05haXNzYW5jZSB8fCBcIlwiXG4gICAgICB9O1xuXG4gICAgICBmb3IgKGNvbnN0IFtuYW1lLCB2YWxdIG9mIE9iamVjdC5lbnRyaWVzKG1hcHBpbmcpKSB7XG4gICAgICAgIGlmICh2YWwpIHVsdHJhRmlsbChmaW5kRWxlbWVudChgW25hbWU9XCIke25hbWV9XCJdYCksIHZhbCk7XG4gICAgICB9XG5cbiAgICAgIC8qIFRcdTAwRTlsXHUwMEU5cGhvbmUgcG9ydGFibGUgdmlhIGludGwtdGVsLWlucHV0IChjaGFtcCB2aXNpYmxlICN0ZWxlcGhvbmVfZm9ybV9jbGllbnRfNSkgKi9cbiAgICAgIHZhciBwaG9uZVZhbCA9IG5vcm1hbGl6ZVBob25lKGMucGhvbmUgfHwgXCJcIik7XG4gICAgICBpZiAocGhvbmVWYWwpIHtcbiAgICAgICAgdmFyIHBob25lRWwgPSBmaW5kRWxlbWVudCgnI3RlbGVwaG9uZV9mb3JtX2NsaWVudF81Jyk7XG4gICAgICAgIGlmIChwaG9uZUVsKSB1bHRyYUZpbGwocGhvbmVFbCwgcGhvbmVWYWwpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzcGggPSBvLmx1bmV0dGVzT0Q/LnNwaGVyZSB8fCBvLmxlbnRpbGxlc09EPy5zcGhlcmU7XG4gICAgICBjb25zdCBjeWwgPSBvLmx1bmV0dGVzT0Q/LmN5bGluZHJlIHx8IG8ubGVudGlsbGVzT0Q/LmN5bGluZHJlO1xuICAgICAgaWYgKHNwaCkge1xuICAgICAgICBjb25zdCBpc015b3BlID0gcGFyc2VGbG9hdChzcGgucmVwbGFjZSgnLCcsICcuJykpIDwgMDtcbiAgICAgICAgY29uc3QgbUVsID0gZmluZEVsZW1lbnQoJ1tuYW1lPVwiaW5mb3NfY2xpZW50W2lzX215b3BlXVwiXScpO1xuICAgICAgICBpZiAobUVsICYmIG1FbC5jaGVja2VkICE9PSBpc015b3BlKSBtRWwuY2xpY2soKTtcbiAgICAgICAgY29uc3QgaEVsID0gZmluZEVsZW1lbnQoJ1tuYW1lPVwiaW5mb3NfY2xpZW50W2lzX2h5cGVybWV0cm9wZV1cIl0nKTtcbiAgICAgICAgaWYgKGhFbCAmJiBoRWwuY2hlY2tlZCAhPT0gIWlzTXlvcGUpIGhFbC5jbGljaygpO1xuICAgICAgfVxuXG4gICAgICAvKiBBc3RpZ21hdGUgOiBjb2NoXHUwMEU5IHNpIGN5bGluZHJlIG5vbiBudWwgKi9cbiAgICAgIGlmIChjeWwpIHtcbiAgICAgICAgY29uc3QgY3lsVmFsID0gcGFyc2VGbG9hdChjeWwucmVwbGFjZSgnLCcsICcuJykpO1xuICAgICAgICBpZiAoY3lsVmFsICE9PSAwKSB7XG4gICAgICAgICAgY29uc3QgYUVsID0gZmluZEVsZW1lbnQoJ1tuYW1lPVwiaW5mb3NfY2xpZW50W2lzX2FzdGlnbWF0ZV1cIl0nKTtcbiAgICAgICAgICBpZiAoYUVsICYmICFhRWwuY2hlY2tlZCkgYUVsLmNsaWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICBzeW5jaHJvbmlzZXI6IGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IHMgPSBMQk9fU0VMRUNUT1JTO1xuICAgICAgY29uc3QgY2xpZW50ID0ge1xuICAgICAgICBub206IGZpbmRFbGVtZW50KHMubm9tKT8udmFsdWUsXG4gICAgICAgIHByZW5vbTogZmluZEVsZW1lbnQocy5wcmVub20pPy52YWx1ZSxcbiAgICAgICAgZG9iOiBmaW5kRWxlbWVudChzLmRvYik/LnZhbHVlLFxuICAgICAgICBuc3M6IChmaW5kRWxlbWVudChzLm5zcyk/LnZhbHVlIHx8IFwiXCIpICsgKGZpbmRFbGVtZW50KHMuY2xlKT8udmFsdWUgfHwgXCJcIiksXG4gICAgICAgIHBob25lOiBmaW5kRWxlbWVudChzLnBob25lKT8udmFsdWUsXG4gICAgICAgIGVtYWlsOiBmaW5kRWxlbWVudChzLmVtYWlsKT8udmFsdWUsXG4gICAgICAgIGFkZHJlc3M6IGZpbmRFbGVtZW50KHMuYWRkcmVzcyk/LnZhbHVlLFxuICAgICAgICB6aXBDb2RlOiBmaW5kRWxlbWVudChzLnppcCk/LnZhbHVlLFxuICAgICAgICBjaXR5OiBmaW5kRWxlbWVudChzLmNpdHkpPy52YWx1ZSxcbiAgICAgICAgbm9tQXNzdXJlOiBmaW5kRWxlbWVudChzLm5vbUFzc3VyZSk/LnZhbHVlLFxuICAgICAgICByYW5nTmFpc3NhbmNlOiBmaW5kRWxlbWVudChzLnJhbmdOYWlzc2FuY2UpPy52YWx1ZSxcbiAgICAgICAgdXBkYXRlZEF0OiBEYXRlLm5vdygpLFxuICAgICAgICBleHBpcmVzQXQ6IERhdGUubm93KCkgKyA2MCAqIDYwICogMTAwMFxuICAgICAgfTtcblxuICAgICAgLyogU2NyYXBlIGRlcyBwcmVzY3JpcHRpb25zICovXG4gICAgICB2YXIgcHJlc2NyaXB0aW9uID0ge307XG4gICAgICB2YXIgcHJlc2NUYWIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbmF2LXRhYi1wcmVzY3JpcHRpb25zJyk7XG4gICAgICBpZiAocHJlc2NUYWIpIHtcbiAgICAgICAgdmFyIHByZXNjTGlzID0gcHJlc2NUYWIucXVlcnlTZWxlY3RvckFsbCgnbGknKTtcbiAgICAgICAgZm9yICh2YXIgcGkgPSAwOyBwaSA8IHByZXNjTGlzLmxlbmd0aDsgcGkrKykge1xuICAgICAgICAgIHZhciBsaSA9IHByZXNjTGlzW3BpXTtcbiAgICAgICAgICB2YXIgY29udGVudCA9IGxpLnF1ZXJ5U2VsZWN0b3IoJy5saW5lX2NvbnRlbnQnKTtcbiAgICAgICAgICBpZiAoIWNvbnRlbnQpIGNvbnRpbnVlO1xuICAgICAgICAgIHZhciB0ZXh0ID0gY29udGVudC50ZXh0Q29udGVudC50cmltKCk7XG5cbiAgICAgICAgICBpZiAobGkucXVlcnlTZWxlY3RvcignLnByZXNjcmlwdGV1cicpKSB7XG4gICAgICAgICAgICB2YXIgcGFydHMgPSB0ZXh0LnNwbGl0KCcgLSAnKTtcbiAgICAgICAgICAgIHByZXNjcmlwdGlvbi5wcmVzY3JpcHRldXIgPSBwYXJ0c1swXSA/IHBhcnRzWzBdLnRyaW0oKSA6ICcnO1xuICAgICAgICAgICAgcHJlc2NyaXB0aW9uLnJwcHMgPSBwYXJ0c1sxXSA/IHBhcnRzWzFdLnRyaW0oKSA6ICcnO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobGkucXVlcnlTZWxlY3RvcignLnJlbm91dmVsbGVtZW50JykgJiYgIWxpLmNsYXNzTGlzdC5jb250YWlucygnaGlkZGVuJykpIHtcbiAgICAgICAgICAgIHZhciBkYXRlTWF0Y2ggPSB0ZXh0Lm1hdGNoKC8oXFxkezJ9XFwvXFxkezJ9XFwvXFxkezR9KS8pO1xuICAgICAgICAgICAgcHJlc2NyaXB0aW9uLmRhdGVQcmVzY3JpcHRpb24gPSBkYXRlTWF0Y2ggPyBkYXRlTWF0Y2hbMV0gOiAnJztcbiAgICAgICAgICAgIHByZXNjcmlwdGlvbi50eXBlVmlzaW9uID0gdGV4dC5yZXBsYWNlKGRhdGVNYXRjaCA/IGRhdGVNYXRjaFswXSA6ICcnLCAnJykucmVwbGFjZSgvZHVcXHMqJC8sICcnKS5yZXBsYWNlKC9cXHMrL2csICcgJykudHJpbSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobGkucXVlcnlTZWxlY3RvcignLmZhLWV5ZScpICYmICFsaS5jbGFzc0xpc3QuY29udGFpbnMoJ2hpZGRlbicpKSB7XG4gICAgICAgICAgICB2YXIgY29yck1hdGNoID0gdGV4dC5tYXRjaCgvXihPRHxPRylcXHMqOlxccyooWystXT9cXGQrW1xcLixdXFxkKylcXHMqXFwoKFsrLV0/XFxkK1tcXC4sXVxcZCspXFwpXFxzKihcXGQrKVx1MDBCMFxccypBREQ6XFxzKihbKy1dP1xcZCtbXFwuLF1cXGQrKS8pO1xuICAgICAgICAgICAgaWYgKGNvcnJNYXRjaCkge1xuICAgICAgICAgICAgICB2YXIgb2VpbCA9IGNvcnJNYXRjaFsxXS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgICBwcmVzY3JpcHRpb25bb2VpbF0gPSB7XG4gICAgICAgICAgICAgICAgc3BoZXJlOiBjb3JyTWF0Y2hbMl0ucmVwbGFjZSgnLCcsICcuJyksXG4gICAgICAgICAgICAgICAgY3lsaW5kcmU6IGNvcnJNYXRjaFszXS5yZXBsYWNlKCcsJywgJy4nKSxcbiAgICAgICAgICAgICAgICBheGU6IGNvcnJNYXRjaFs0XSxcbiAgICAgICAgICAgICAgICBhZGRpdGlvbjogY29yck1hdGNoWzVdLnJlcGxhY2UoJywnLCAnLicpLFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobGkucXVlcnlTZWxlY3RvcignLmljb24tY29udGFjdHMnKSAmJiAhbGkuY2xhc3NMaXN0LmNvbnRhaW5zKCdoaWRkZW4nKSkge1xuICAgICAgICAgICAgdmFyIGxlbnRNYXRjaCA9IHRleHQubWF0Y2goL14oT0R8T0cpXFxzKjpcXHMqKFsrLV0/XFxkK1tcXC4sXVxcZCspXFxzKlxcKChbKy1dP1xcZCtbXFwuLF1cXGQrKVxcKVxccyooXFxkKylcdTAwQjBcXHMqQUREOlxccyooWystXT9cXGQrW1xcLixdXFxkKykvKTtcbiAgICAgICAgICAgIGlmIChsZW50TWF0Y2gpIHtcbiAgICAgICAgICAgICAgdmFyIG9laWxMID0gJ2xlbnRpbGxlcycgKyBsZW50TWF0Y2hbMV07XG4gICAgICAgICAgICAgIHByZXNjcmlwdGlvbltvZWlsTF0gPSB7XG4gICAgICAgICAgICAgICAgc3BoZXJlOiBsZW50TWF0Y2hbMl0ucmVwbGFjZSgnLCcsICcuJyksXG4gICAgICAgICAgICAgICAgY3lsaW5kcmU6IGxlbnRNYXRjaFszXS5yZXBsYWNlKCcsJywgJy4nKSxcbiAgICAgICAgICAgICAgICBheGU6IGxlbnRNYXRjaFs0XSxcbiAgICAgICAgICAgICAgICBhZGRpdGlvbjogbGVudE1hdGNoWzVdLnJlcGxhY2UoJywnLCAnLicpLFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY2xpZW50LnByZXNjcmlwdGlvbiA9IHByZXNjcmlwdGlvbjtcblxuICAgICAgLyogU2NyYXBlIGRlcyByXHUwMEU5Z2ltZXMgKFJPICsgUkMpICovXG4gICAgICB2YXIgcmVnaW1lcyA9IHt9O1xuICAgICAgLyogUk8gKi9cbiAgICAgIHZhciByb05vbUVsID0gZmluZEVsZW1lbnQoJyNyZWdpbWVfb2JsaWdhdG9pcmVfbm9tJyk7XG4gICAgICBpZiAocm9Ob21FbCAmJiByb05vbUVsLnZhbHVlKSB7XG4gICAgICAgIHJlZ2ltZXMucm8gPSB7XG4gICAgICAgICAgbm9tOiByb05vbUVsLnZhbHVlLFxuICAgICAgICAgIGNvZGVSZWdpbWU6IChmaW5kRWxlbWVudCgnI3JvX2NvZGVfcmVnaW1lJykgfHwge30pLnZhbHVlIHx8ICcnLFxuICAgICAgICAgIGNvZGVDZW50cmU6IChmaW5kRWxlbWVudCgnI2NvZGVfY2VudHJlJykgfHwge30pLnZhbHVlIHx8ICcnLFxuICAgICAgICAgIHRhdXhQRUM6IChmaW5kRWxlbWVudCgnI3RhdXhfcGVjX3JvJykgfHwge30pLnZhbHVlIHx8ICcnLFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgLyogUkMxICovXG4gICAgICB2YXIgcmMxTm9tRWwgPSBmaW5kRWxlbWVudCgnI3JlZ2ltZV9jb21wbGVtZW50YWlyZV8xJyk7XG4gICAgICBpZiAocmMxTm9tRWwgJiYgcmMxTm9tRWwudmFsdWUpIHtcbiAgICAgICAgcmVnaW1lcy5yYzEgPSB7XG4gICAgICAgICAgbm9tOiByYzFOb21FbC52YWx1ZSxcbiAgICAgICAgICBudW1lcm9BZGhlcmVudDogKGZpbmRFbGVtZW50KCcjbm9fYWRoZXJlbnRfcmNfMScpIHx8IHt9KS52YWx1ZSB8fCAnJyxcbiAgICAgICAgICBudW1lcm9Db250cmF0OiAoZmluZEVsZW1lbnQoJyNub19jb250cmF0X3JjXzEnKSB8fCB7fSkudmFsdWUgfHwgJycsXG4gICAgICAgICAgbnVtZXJvVGVsZXRyYW5zbWlzc2lvbjogKGZpbmRFbGVtZW50KCdpbnB1dFtuYW1lPVwiaW5mb3NfcmVnaW1lW251bWVyb190ZWxldHJhbnNtaXNzaW9uXzFdXCJdJykgfHwge30pLnZhbHVlIHx8ICcnLFxuICAgICAgICAgIGNyaXRlcmVTZWNvbmRhaXJlOiAoZmluZEVsZW1lbnQoJyNjcml0ZXJlX3NlY29uZGFpcmUnKSB8fCB7fSkudmFsdWUgfHwgJycsXG4gICAgICAgICAgY29kZUNvbnZlbnRpb246IChmaW5kRWxlbWVudCgnI2NvZGVfY29udmVudGlvbicpIHx8IHt9KS52YWx1ZSB8fCAnJyxcbiAgICAgICAgICBkYXRlRGVidXQ6IChmaW5kRWxlbWVudCgnI2RhdGVfZGVidXRfcmNfMScpIHx8IHt9KS52YWx1ZSB8fCAnJyxcbiAgICAgICAgICBkYXRlRmluOiAoZmluZEVsZW1lbnQoJyNkYXRlX2Zpbl9yY18xJykgfHwge30pLnZhbHVlIHx8ICcnLFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgLyogUkMyICovXG4gICAgICB2YXIgcmMyTm9tRWwgPSBmaW5kRWxlbWVudCgnI3JlZ2ltZV9jb21wbGVtZW50YWlyZV8yJyk7XG4gICAgICBpZiAocmMyTm9tRWwgJiYgcmMyTm9tRWwudmFsdWUpIHtcbiAgICAgICAgcmVnaW1lcy5yYzIgPSB7XG4gICAgICAgICAgbm9tOiByYzJOb21FbC52YWx1ZSxcbiAgICAgICAgICBudW1lcm9BZGhlcmVudDogKGZpbmRFbGVtZW50KCcjbm9fYWRoZXJlbnRfcmNfMicpIHx8IHt9KS52YWx1ZSB8fCAnJyxcbiAgICAgICAgICBudW1lcm9Db250cmF0OiAoZmluZEVsZW1lbnQoJyNub19jb250cmF0X3JjXzInKSB8fCB7fSkudmFsdWUgfHwgJycsXG4gICAgICAgICAgbnVtZXJvVGVsZXRyYW5zbWlzc2lvbjogKGZpbmRFbGVtZW50KCdpbnB1dFtuYW1lPVwiaW5mb3NfcmVnaW1lW251bWVyb190ZWxldHJhbnNtaXNzaW9uXzJdXCJdJykgfHwge30pLnZhbHVlIHx8ICcnLFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKHJlZ2ltZXMucm8gfHwgcmVnaW1lcy5yYzEgfHwgcmVnaW1lcy5yYzIpIHtcbiAgICAgICAgY2xpZW50LnJlZ2ltZXMgPSByZWdpbWVzO1xuICAgICAgfVxuXG4gICAgICAvKiBTY3JhcGUgZGVzIFx1MDBFOXF1aXBlbWVudHMgZGUgbGEgcHJvcG9zaXRpb24gKi9cbiAgICAgIHZhciBlcXVpcGVtZW50cyA9IFtdO1xuICAgICAgdmFyIG9mZnJlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5vZmZyZS5hY2NvcmRpb24nKTtcbiAgICAgIGZvciAodmFyIG9pID0gMDsgb2kgPCBvZmZyZXMubGVuZ3RoOyBvaSsrKSB7XG4gICAgICAgIHZhciBvZmZyZSA9IG9mZnJlc1tvaV07XG4gICAgICAgIHZhciBvZmZyZUlkID0gb2ZmcmUuZ2V0QXR0cmlidXRlKCdkYXRhLW9mZnJlX2lkJykgfHwgJyc7XG4gICAgICAgIHZhciBlcVR5cGUgPSBvZmZyZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtZXF1aXBlbWVudF90eXBlX2lkJykgfHwgJyc7XG4gICAgICAgIHZhciBub0VxID0gb2ZmcmUuZ2V0QXR0cmlidXRlKCdkYXRhLW5vX2VxdWlwZW1lbnRfb2ZmcmVfY29tbWVyY2lhbGUnKSB8fCAnJztcblxuICAgICAgICAvKiBDb3JyZWN0aW9uIHZpc3VlbGxlIGRlcHVpcyBsZSBiYWRnZSAqL1xuICAgICAgICB2YXIgY29yckxhYmVsID0gb2ZmcmUucXVlcnlTZWxlY3RvcignLmxhYmVsLWluZm8nKTtcbiAgICAgICAgdmFyIGNvcnJlY3Rpb24gPSBjb3JyTGFiZWwgPyBjb3JyTGFiZWwudGV4dENvbnRlbnQudHJpbSgpIDogJyc7XG5cbiAgICAgICAgLyogVHlwZSB2aXNpb24gKi9cbiAgICAgICAgdmFyIHZpc2lvbkJ0biA9IG9mZnJlLnF1ZXJ5U2VsZWN0b3IoJy5kcm9wZG93bi1zZWxlY3QtdGV4dCcpO1xuICAgICAgICB2YXIgdmlzaW9uID0gdmlzaW9uQnRuID8gdmlzaW9uQnRuLnRleHRDb250ZW50LnRyaW0oKSA6ICcnO1xuXG4gICAgICAgIC8qIExpZ25lcyBkZSBkXHUwMEU5dGFpbCAqL1xuICAgICAgICB2YXIgbGlnbmVzID0gW107XG4gICAgICAgIHZhciByb3dzID0gb2ZmcmUucXVlcnlTZWxlY3RvckFsbCgnLnRhYmxlLWNvbnNlaWxsZXIgdGJvZHkgdHJbZGF0YS1vZmZyZV9kZXRhaWxfaWRdJyk7XG4gICAgICAgIGZvciAodmFyIHJpID0gMDsgcmkgPCByb3dzLmxlbmd0aDsgcmkrKykge1xuICAgICAgICAgIHZhciByb3cgPSByb3dzW3JpXTtcbiAgICAgICAgICB2YXIgdHlwZUlkID0gcm93LmdldEF0dHJpYnV0ZSgnZGF0YS1vZmZyZV9kZXRhaWxfdHlwZV9pZCcpIHx8ICcnO1xuICAgICAgICAgIHZhciBvZWlsID0gcm93LmdldEF0dHJpYnV0ZSgnZGF0YS1vZWlsX29mZnJlX2RldGFpbCcpIHx8ICcnO1xuICAgICAgICAgIHZhciBjbGFzc2UgPSByb3cuZ2V0QXR0cmlidXRlKCdkYXRhLWNsYXNzZV9vZmZyZV9kZXRhaWwnKSB8fCAnJztcbiAgICAgICAgICB2YXIgZGVzaWcgPSByb3cucXVlcnlTZWxlY3RvcignLmRlc2lnbmF0aW9uX2FydGljbGUnKTtcbiAgICAgICAgICB2YXIgbHBwRWwgPSByb3cucXVlcnlTZWxlY3RvcignLmRldGFpbF9jb2RlX2xwcCcpO1xuXG4gICAgICAgICAgbGlnbmVzLnB1c2goe1xuICAgICAgICAgICAgdHlwZTogdHlwZUlkID09PSAnMycgPyAnbW9udHVyZScgOiB0eXBlSWQgPT09ICcxJyA/ICd2ZXJyZScgOiB0eXBlSWQgPT09ICcyJyA/ICdzdXBwbGVtZW50JyA6IHR5cGVJZCxcbiAgICAgICAgICAgIG9laWw6IG9laWwgPT09ICcxJyA/ICdPRCcgOiBvZWlsID09PSAnMicgPyAnT0cnIDogJ2xlcyBkZXV4JyxcbiAgICAgICAgICAgIGNsYXNzZTogY2xhc3NlLFxuICAgICAgICAgICAgZGVzaWduYXRpb246IGRlc2lnID8gZGVzaWcudGV4dENvbnRlbnQudHJpbSgpLnJlcGxhY2UoL1xccysvZywgJyAnKSA6ICcnLFxuICAgICAgICAgICAgY29kZUxQUDogbHBwRWwgPyAobHBwRWwuZ2V0QXR0cmlidXRlKCdkYXRhLWNvZGVfbHBwJykgfHwgJycpLnRyaW0oKSA6ICcnLFxuICAgICAgICAgICAgcHJpeEJydXQ6IHBhcnNlRmxvYXQoKHJvdy5xdWVyeVNlbGVjdG9yKCcucHJpeF92ZW50ZV9hcHBsaXF1ZScpPy50ZXh0Q29udGVudCB8fCAnMCcpLnJlcGxhY2UoL1teXFxkLC4tXS9nLCAnJykucmVwbGFjZSgnLCcsICcuJykpIHx8IDAsXG4gICAgICAgICAgICByZW1pc2U6IHBhcnNlRmxvYXQoKHJvdy5xdWVyeVNlbGVjdG9yKCcubW9kaWZfbW9udGFudF9yZW1pc2UnKT8udGV4dENvbnRlbnQgfHwgJzAnKS5yZXBsYWNlKC9bXlxcZCwuLV0vZywgJycpLnJlcGxhY2UoJywnLCAnLicpKSB8fCAwLFxuICAgICAgICAgICAgcHJpeE5ldDogcGFyc2VGbG9hdCgocm93LnF1ZXJ5U2VsZWN0b3IoJy5tb2RpZl9wcml4X3ZlbnRlX3JlbWlzZScpPy50ZXh0Q29udGVudCB8fCAnMCcpLnJlcGxhY2UoL1teXFxkLC4tXS9nLCAnJykucmVwbGFjZSgnLCcsICcuJykpIHx8IDAsXG4gICAgICAgICAgICBybzogcGFyc2VGbG9hdCgocm93LnF1ZXJ5U2VsZWN0b3IoJy5tb250YW50X3BlY19ybycpPy50ZXh0Q29udGVudCB8fCAnMCcpLnJlcGxhY2UoL1teXFxkLC4tXS9nLCAnJykucmVwbGFjZSgnLCcsICcuJykpIHx8IDAsXG4gICAgICAgICAgICByYzE6IHBhcnNlRmxvYXQoKHJvdy5xdWVyeVNlbGVjdG9yKCdbY2xhc3MqPVwibW9udGFudF9wZWNfcmNfMVwiXScpPy50ZXh0Q29udGVudCB8fCAnMCcpLnJlcGxhY2UoL1teXFxkLC4tXS9nLCAnJykucmVwbGFjZSgnLCcsICcuJykpIHx8IDAsXG4gICAgICAgICAgICByYWM6IHBhcnNlRmxvYXQoKHJvdy5xdWVyeVNlbGVjdG9yKCcudG90YWxfbGlnbmVfcmFjJyk/LnRleHRDb250ZW50IHx8ICcwJykucmVwbGFjZSgvW15cXGQsLi1dL2csICcnKS5yZXBsYWNlKCcsJywgJy4nKSkgfHwgMCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIFRvdGF1eCAqL1xuICAgICAgICB2YXIgZm9vdCA9IG9mZnJlLnF1ZXJ5U2VsZWN0b3IoJy50YWJsZS1jb25zZWlsbGVyIHRmb290Jyk7XG4gICAgICAgIHZhciB0b3RhdXggPSB7fTtcbiAgICAgICAgaWYgKGZvb3QpIHtcbiAgICAgICAgICB0b3RhdXggPSB7XG4gICAgICAgICAgICBicnV0OiBwYXJzZUZsb2F0KChmb290LnF1ZXJ5U2VsZWN0b3IoJy50b3RhbF9icnV0Jyk/LnRleHRDb250ZW50IHx8ICcwJykucmVwbGFjZSgvW15cXGQsLi1dL2csICcnKS5yZXBsYWNlKCcsJywgJy4nKSkgfHwgMCxcbiAgICAgICAgICAgIHJlbWlzZTogcGFyc2VGbG9hdCgoZm9vdC5xdWVyeVNlbGVjdG9yKCcudG90YWxfcmVtaXNlJyk/LnRleHRDb250ZW50IHx8ICcwJykucmVwbGFjZSgvW15cXGQsLi1dL2csICcnKS5yZXBsYWNlKCcsJywgJy4nKSkgfHwgMCxcbiAgICAgICAgICAgIG5ldDogcGFyc2VGbG9hdCgoZm9vdC5xdWVyeVNlbGVjdG9yKCcudG90YWxfbmV0Jyk/LnRleHRDb250ZW50IHx8ICcwJykucmVwbGFjZSgvW15cXGQsLi1dL2csICcnKS5yZXBsYWNlKCcsJywgJy4nKSkgfHwgMCxcbiAgICAgICAgICAgIHJvOiBwYXJzZUZsb2F0KChmb290LnF1ZXJ5U2VsZWN0b3IoJy50b3RhbF9ybycpPy50ZXh0Q29udGVudCB8fCAnMCcpLnJlcGxhY2UoL1teXFxkLC4tXS9nLCAnJykucmVwbGFjZSgnLCcsICcuJykpIHx8IDAsXG4gICAgICAgICAgICByYzE6IHBhcnNlRmxvYXQoKGZvb3QucXVlcnlTZWxlY3RvcignW2NsYXNzKj1cInRvdGFsX3JjXzFcIl0nKT8udGV4dENvbnRlbnQgfHwgJzAnKS5yZXBsYWNlKC9bXlxcZCwuLV0vZywgJycpLnJlcGxhY2UoJywnLCAnLicpKSB8fCAwLFxuICAgICAgICAgICAgcmFjOiBwYXJzZUZsb2F0KChmb290LnF1ZXJ5U2VsZWN0b3IoJy50b3RhbF9yYWMnKT8udGV4dENvbnRlbnQgfHwgJzAnKS5yZXBsYWNlKC9bXlxcZCwuLV0vZywgJycpLnJlcGxhY2UoJywnLCAnLicpKSB8fCAwLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBlcXVpcGVtZW50cy5wdXNoKHtcbiAgICAgICAgICBvZmZyZUlkOiBvZmZyZUlkLFxuICAgICAgICAgIG51bWVybzogbm9FcSxcbiAgICAgICAgICB0eXBlOiBlcVR5cGUgPT09ICcxJyA/ICdsdW5ldHRlcycgOiBlcVR5cGUgPT09ICcyJyA/ICdsZW50aWxsZXMnIDogZXFUeXBlLFxuICAgICAgICAgIGNvcnJlY3Rpb246IGNvcnJlY3Rpb24sXG4gICAgICAgICAgdmlzaW9uOiB2aXNpb24sXG4gICAgICAgICAgbGlnbmVzOiBsaWduZXMsXG4gICAgICAgICAgdG90YXV4OiB0b3RhdXgsXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvKiBUb3RhdXggcHJvcG9zaXRpb24gKi9cbiAgICAgIHZhciB0b3RhbFByb3AgPSBwYXJzZUZsb2F0KChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudG90YWxfbmV0X3Byb3Bvc2l0aW9uJyk/LnRleHRDb250ZW50IHx8ICcwJykucmVwbGFjZSgvW15cXGQsLi1dL2csICcnKS5yZXBsYWNlKCcsJywgJy4nKSkgfHwgMDtcbiAgICAgIHZhciByYWNQcm9wID0gcGFyc2VGbG9hdCgoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvdGFsX3JhY19wcm9wb3NpdGlvbicpPy50ZXh0Q29udGVudCB8fCAnMCcpLnJlcGxhY2UoL1teXFxkLC4tXS9nLCAnJykucmVwbGFjZSgnLCcsICcuJykpIHx8IDA7XG5cbiAgICAgIGNsaWVudC5lcXVpcGVtZW50cyA9IGVxdWlwZW1lbnRzO1xuICAgICAgY2xpZW50LnRvdGFsUHJvcG9zaXRpb24gPSB0b3RhbFByb3A7XG4gICAgICBjbGllbnQucmFjUHJvcG9zaXRpb24gPSByYWNQcm9wO1xuXG4gICAgICBpZiAoIWNsaWVudC5ub20gJiYgIWNsaWVudC5uc3MgJiYgZXF1aXBlbWVudHMubGVuZ3RoID09PSAwKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoWydhdWRpYm90X2NhY2hlJ10sIChyZXN1bHQpID0+IHtcbiAgICAgICAgICBjb25zdCBleGlzdGluZyA9IChyZXN1bHQuYXVkaWJvdF9jYWNoZSB8fCB7fSkuY3VycmVudCB8fCB7fTtcbiAgICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoe1xuICAgICAgICAgICAgYXVkaWJvdF9jYWNoZTogeyBjdXJyZW50OiB7IC4uLmV4aXN0aW5nLCAuLi5jbGllbnQgfSB9XG4gICAgICAgICAgfSwgKCkgPT4gcmVzb2x2ZSh0cnVlKSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG59O1xuIiwgInZhciBQT1JUQUxfS0VZID0gXCJwcm8ud2VtaW5kLmlvXCI7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgbmFtZTogXCJXZW1pbmRcIixcbiAgaXNNYXRjaDogKCkgPT4gd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLmluY2x1ZGVzKFwid2VtaW5kLmlvXCIpLFxuICBhY3Rpb25zOiB7XG4gICAgZm9ybXVsYWlyZTogKGRhdGEpID0+IHtcbiAgICAgIGNvbnN0IG0gPSBkYXRhLm0gfHwge307XG4gICAgICBjb25zdCBvID0gZGF0YS5vIHx8IHt9O1xuICAgICAgY29uc3QgYyA9IGRhdGEuY2FjaGVkIHx8IHt9O1xuICAgICAgLyogRmFsbGJhY2sgOiBzaSBsZXMgY2hhbXBzIHRvcC1sZXZlbCBzb250IHZpZGVzLCBjaGVyY2hlciBkYW5zIHBlcnNvbm5lcyAqL1xuICAgICAgY29uc3QgcGVyc29ubmVzID0gbS5wZXJzb25uZXMgfHwgW107XG4gICAgICBjb25zdCBwMCA9IHBlcnNvbm5lcy5sZW5ndGggPiAwID8gcGVyc29ubmVzWzBdIDoge307XG4gICAgICBjb25zdCBub20gPSBtLm5vbSB8fCBwMC5ub20gfHwgby5ub21QYXRpZW50IHx8IGMubm9tIHx8IFwiXCI7XG4gICAgICBjb25zdCBwcmVub20gPSBtLnByZW5vbSB8fCBwMC5wcmVub20gfHwgby5wcmVub21QYXRpZW50IHx8IGMucHJlbm9tIHx8IFwiXCI7XG4gICAgICAvKiBDaGVyY2hlciBsZSBwcmVtaWVyIE5TUyB2YWxpZGUgcGFybWkgdG91dGVzIGxlcyBwZXJzb25uZXMgKi9cbiAgICAgIHZhciBmb3VuZE5TUyA9IG0ubnVtZXJvU2VjdXJpdGVTb2NpYWxlIHx8IFwiXCI7XG4gICAgICB2YXIgZm91bmRET0IgPSBtLmRhdGVOYWlzc2FuY2UgfHwgXCJcIjtcbiAgICAgIGlmICghZm91bmROU1MpIHtcbiAgICAgICAgZm9yICh2YXIgcGkgPSAwOyBwaSA8IHBlcnNvbm5lcy5sZW5ndGg7IHBpKyspIHtcbiAgICAgICAgICB2YXIgcE5TUyA9IChwZXJzb25uZXNbcGldLm51bWVyb1NlY3VyaXRlU29jaWFsZSB8fCBcIlwiKS5yZXBsYWNlKC9cXEQvZywgXCJcIik7XG4gICAgICAgICAgaWYgKHBOU1MubGVuZ3RoID49IDEzKSB7IGZvdW5kTlNTID0gcGVyc29ubmVzW3BpXS5udW1lcm9TZWN1cml0ZVNvY2lhbGU7IGJyZWFrOyB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghZm91bmRET0IpIHtcbiAgICAgICAgZm9yICh2YXIgcGkgPSAwOyBwaSA8IHBlcnNvbm5lcy5sZW5ndGg7IHBpKyspIHtcbiAgICAgICAgICBpZiAocGVyc29ubmVzW3BpXS5kYXRlTmFpc3NhbmNlKSB7IGZvdW5kRE9CID0gcGVyc29ubmVzW3BpXS5kYXRlTmFpc3NhbmNlOyBicmVhazsgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zdCBuc3MgPSBmb3VuZE5TUyB8fCBjLm5zcyB8fCBcIlwiO1xuICAgICAgY29uc3QgZG9iID0gZm91bmRET0IgfHwgby5kYXRlTmFpc3NhbmNlUGF0aWVudCB8fCBjLmRvYiB8fCBcIlwiO1xuXG4gICAgICAvKiBQb3VyIHVuIG1pbmV1ciwgdXRpbGlzZXIgbGUgTlNTIGRlIGwnb3V2cmFudCBkcm9pdCAobWVyZSkgKi9cbiAgICAgIGNvbnN0IGVmZmVjdGl2ZU5TUyA9IGdldE91dnJhbnREcm9pdE5TUyhuc3MsIGRvYiwgbS5wZXJzb25uZXMpO1xuXG4gICAgICAvKiBTdGVwIDEgXHUyMDE0IEJlbmVmaWNpYWlyZSAqL1xuICAgICAgY29uc3Qgc3RlcEJlbmVmID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW2RhdGEtY3k9XCJzdGVwLWJlbmVmaWNpYXJ5XCJdJyk7XG4gICAgICBpZiAoc3RlcEJlbmVmKSB7XG4gICAgICAgIHVsdHJhRmlsbChmaW5kRWxlbWVudFRyYWNrZWQoUE9SVEFMX0tFWSwgXCJpbnB1dC1sYXN0TmFtZVwiLCAnW2RhdGEtY3k9XCJpbnB1dC1sYXN0TmFtZVwiXScpLCBub20udG9VcHBlckNhc2UoKSk7XG4gICAgICAgIHVsdHJhRmlsbChmaW5kRWxlbWVudFRyYWNrZWQoUE9SVEFMX0tFWSwgXCJpbnB1dC1maXJzdE5hbWVcIiwgJ1tkYXRhLWN5PVwiaW5wdXQtZmlyc3ROYW1lXCJdJyksIGNhcGl0YWxpemUocHJlbm9tKSk7XG4gICAgICAgIC8qIE5TUyBmb3JtYXRlIGF2ZWMgZXNwYWNlcyAobWF4bGVuZ3RoPTIxIC0+IFggWFggWFggWFggWFhYIFhYWCBYWCkgKi9cbiAgICAgICAgY29uc3QgZGlnaXRzID0gZWZmZWN0aXZlTlNTLnJlcGxhY2UoL1xcRC9nLCBcIlwiKTtcbiAgICAgICAgbGV0IGZvcm1hdHRlZE5TUyA9IGRpZ2l0cztcbiAgICAgICAgaWYgKGRpZ2l0cy5sZW5ndGggPj0gMTMpIHtcbiAgICAgICAgICBmb3JtYXR0ZWROU1MgPSBkaWdpdHNbMF0gKyBcIiBcIiArIGRpZ2l0cy5zbGljZSgxLDMpICsgXCIgXCIgKyBkaWdpdHMuc2xpY2UoMyw1KSArIFwiIFwiICsgZGlnaXRzLnNsaWNlKDUsNykgKyBcIiBcIiArIGRpZ2l0cy5zbGljZSg3LDEwKSArIFwiIFwiICsgZGlnaXRzLnNsaWNlKDEwLDEzKTtcbiAgICAgICAgICBpZiAoZGlnaXRzLmxlbmd0aCA+PSAxNSkgZm9ybWF0dGVkTlNTICs9IFwiIFwiICsgZGlnaXRzLnNsaWNlKDEzLDE1KTtcbiAgICAgICAgfVxuICAgICAgICB1bHRyYUZpbGwoZmluZEVsZW1lbnRUcmFja2VkKFBPUlRBTF9LRVksIFwiaW5wdXQtc3NuXCIsICdbZGF0YS1jeT1cImlucHV0LXNzblwiXScpLCBmb3JtYXR0ZWROU1MpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLyogU3RlcCAyIFx1MjAxNCBEZXNjcmlwdGlvbiAqL1xuICAgICAgY29uc3Qgc3RlcERlc2MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1jeT1cInN0ZXAtZGVzY3JpcHRpb25cIl0nKTtcbiAgICAgIGlmIChzdGVwRGVzYykge1xuICAgICAgICBzZWxlY3RSYWRpeE9wdGlvbihcImNhdGVnb3J5XCIsIFwib3B0aXF1ZVwiKTtcbiAgICAgICAgLyogRGV0ZXJtaW5lIGxlIHR5cGUgZGUgc29pbiAqL1xuICAgICAgICBsZXQgdHlwZVZhbCA9IFwibHVuZXR0ZXNfYWR1bHRlXCI7XG4gICAgICAgIGNvbnN0IGhhc0xlbnRpbGxlcyA9IChvLmxlbnRpbGxlc09EICYmIG8ubGVudGlsbGVzT0Quc3BoZXJlKSB8fCAoby5sZW50aWxsZXNPRyAmJiBvLmxlbnRpbGxlc09HLnNwaGVyZSk7XG4gICAgICAgIGlmIChoYXNMZW50aWxsZXMpIHR5cGVWYWwgPSBcImxlbnRpbGxlc19hZHVsdGVcIjtcbiAgICAgICAgLyogVmVyaWZpY2F0aW9uIGVuZmFudCAoPDE4IGFucykgKi9cbiAgICAgICAgaWYgKGRvYiAmJiBpc1VuZGVyMTgoZG9iKSkge1xuICAgICAgICAgIHR5cGVWYWwgPSBoYXNMZW50aWxsZXMgPyBcImxlbnRpbGxlc19lbmZhbnRcIiA6IFwibHVuZXR0ZXNfZW5mYW50XCI7XG4gICAgICAgIH1cbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiBzZWxlY3RSYWRpeE9wdGlvbihcInR5cGVcIiwgdHlwZVZhbCksIDYwMCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvKiBTdGVwIDMgXHUyMDE0IENvZGVzIExQUCAocGFzIGQnYXV0by1yZW1wbGlzc2FnZSwgbGVzIGNvZGVzIHNvbnQgc3BlY2lmaXF1ZXMgYXUgcHJvZHVpdCkgKi9cbiAgICAgIGNvbnN0IHN0ZXBMcHAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1jeT1cInN0ZXAtbHBwLWNvZGVzXCJdJyk7XG4gICAgICBpZiAoc3RlcExwcCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG4gICAgc3luY2hyb25pc2VyOiBhc3luYyAoKSA9PiBmYWxzZVxuICB9XG59O1xuIiwgImV4cG9ydCBkZWZhdWx0IHtcbiAgbmFtZTogXCJBUEdJU1wiLFxuICBpc01hdGNoOiAoKSA9PiB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUuaW5jbHVkZXMoXCJhcGdpcy5jb21cIiksXG4gIGFjdGlvbnM6IHtcbiAgICBmb3JtdWxhaXJlOiAoZGF0YSkgPT4ge1xuICAgICAgY29uc3QgbSA9IGRhdGEubSB8fCB7fTtcbiAgICAgIGNvbnN0IG8gPSBkYXRhLm8gfHwge307XG4gICAgICBjb25zdCBjID0gZGF0YS5jYWNoZWQgfHwge307XG4gICAgICBjb25zdCBwZXJzb25uZXMgPSBtLnBlcnNvbm5lcyB8fCBbXTtcbiAgICAgIGNvbnN0IHAwID0gcGVyc29ubmVzLmxlbmd0aCA+IDAgPyBwZXJzb25uZXNbMF0gOiB7fTtcblxuICAgICAgY29uc3Qgbm9tID0gbS5ub20gfHwgcDAubm9tIHx8IG8ubm9tUGF0aWVudCB8fCBjLm5vbSB8fCBcIlwiO1xuICAgICAgY29uc3QgcHJlbm9tID0gbS5wcmVub20gfHwgcDAucHJlbm9tIHx8IG8ucHJlbm9tUGF0aWVudCB8fCBjLnByZW5vbSB8fCBcIlwiO1xuICAgICAgdmFyIGZvdW5kTlNTID0gbS5udW1lcm9TZWN1cml0ZVNvY2lhbGUgfHwgXCJcIjtcbiAgICAgIGlmICghZm91bmROU1MpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwZXJzb25uZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgcE5TUyA9IChwZXJzb25uZXNbaV0ubnVtZXJvU2VjdXJpdGVTb2NpYWxlIHx8IFwiXCIpLnJlcGxhY2UoL1xcRC9nLCBcIlwiKTtcbiAgICAgICAgICBpZiAocE5TUy5sZW5ndGggPj0gMTMpIHsgZm91bmROU1MgPSBwZXJzb25uZXNbaV0ubnVtZXJvU2VjdXJpdGVTb2NpYWxlOyBicmVhazsgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YXIgZm91bmRET0IgPSBtLmRhdGVOYWlzc2FuY2UgfHwgXCJcIjtcbiAgICAgIGlmICghZm91bmRET0IpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwZXJzb25uZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAocGVyc29ubmVzW2ldLmRhdGVOYWlzc2FuY2UpIHsgZm91bmRET0IgPSBwZXJzb25uZXNbaV0uZGF0ZU5haXNzYW5jZTsgYnJlYWs7IH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc3QgbnNzID0gZm91bmROU1MgfHwgYy5uc3MgfHwgXCJcIjtcbiAgICAgIGNvbnN0IGRvYiA9IGZvdW5kRE9CIHx8IG8uZGF0ZU5haXNzYW5jZVBhdGllbnQgfHwgYy5kb2IgfHwgXCJcIjtcbiAgICAgIGNvbnN0IGVmZmVjdGl2ZU5TUyA9IGdldE91dnJhbnREcm9pdE5TUyhuc3MsIGRvYiwgcGVyc29ubmVzKTtcblxuICAgICAgLyogUGFuZWwgUmVjaGVyY2hlIEJcdTAwRTluXHUwMEU5ZmljaWFpcmUgKi9cbiAgICAgIHZhciBpbnNlZUVsID0gZmluZEVsZW1lbnQoJ1tpZCQ9XCJyZWNoZXJjaGVyaW5zZWVfSVwiXScpO1xuICAgICAgaWYgKGluc2VlRWwpIHtcbiAgICAgICAgdWx0cmFGaWxsKGluc2VlRWwsIGVmZmVjdGl2ZU5TUy5yZXBsYWNlKC9cXEQvZywgXCJcIikuc2xpY2UoMCwgMTMpKTtcbiAgICAgICAgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCdbaWQkPVwicmVjaGVyY2hlcm5vbV9JXCJdJyksIG5vbS50b1VwcGVyQ2FzZSgpKTtcbiAgICAgICAgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCdbaWQkPVwicmVjaGVyY2hlcnByZW5vbV9JXCJdJyksIGNhcGl0YWxpemUocHJlbm9tKSk7XG4gICAgICAgIHVsdHJhRmlsbChmaW5kRWxlbWVudCgnW2lkJD1cInJlY2hlcmNoZXJkYXRlbmFpc3NhbmNlX0lcIl0nKSwgZG9iKTtcbiAgICAgICAgLyogRGF0ZSBwcmVzY3JpcHRpb24gZGVwdWlzIGwnb3Jkb25uYW5jZSAoY2xpcGJvYXJkIE9VIGNhY2hlKSAqL1xuICAgICAgICB2YXIgZGF0ZU9yZG8gPSBvLmRhdGVPcmRvbm5hbmNlIHx8IChjLm9yZG9ubmFuY2UgJiYgYy5vcmRvbm5hbmNlLmRhdGVPcmRvbm5hbmNlKSB8fCBcIlwiO1xuICAgICAgICBpZiAoZGF0ZU9yZG8pIHtcbiAgICAgICAgICB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJ1tpZCQ9XCJyZWNoZXJjaGVyZGF0ZXByZXNjcmlwdGlvbl9JXCJdJyksIGRhdGVPcmRvKTtcbiAgICAgICAgfVxuICAgICAgICAvKiBSUFBTIFByZXNjcmlwdGV1ciAoY2xpcGJvYXJkIE9VIGNhY2hlKSAqL1xuICAgICAgICB2YXIgcnBwcyA9IG8ucnBwcyB8fCAoYy5vcmRvbm5hbmNlICYmIGMub3Jkb25uYW5jZS5ycHBzKSB8fCBjLnJwcHMgfHwgXCJcIjtcbiAgICAgICAgaWYgKHJwcHMpIHtcbiAgICAgICAgICB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJ1tpZCQ9XCJyZWNoZXJjaGVyUlBQU19JXCJdJyksIHJwcHMucmVwbGFjZSgvXFxEL2csIFwiXCIpLnNsaWNlKDAsIDExKSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHByZXNjRWwgPSBmaW5kRWxlbWVudCgnW2lkJD1cInJlY2hlcmNoZXJkYXRlcHJlc2NyaXB0aW9uX0lcIl0nKTtcbiAgICAgICAgdmFyIHJwcHNFbCA9IGZpbmRFbGVtZW50KCdbaWQkPVwicmVjaGVyY2hlclJQUFNfSVwiXScpO1xuICAgICAgICBjb25zb2xlLmluZm8oXCJbQXVkaUJvdCBBUEdJU10gcHJlc2NFbCBmb3VuZDpcIiwgISFwcmVzY0VsLCBcInwgcnBwc0VsIGZvdW5kOlwiLCAhIXJwcHNFbCk7XG4gICAgICAgIC8qIERldkV4cHJlc3MgY29tYm9zIFx1MjAxNCBtYW5pcHVsYXRpb24gRE9NIGRpcmVjdGUgKENTUCBibG9xdWUgbGVzIHNjcmlwdHMgaW5saW5lKS5cbiAgICAgICAgICAgUGF0dGVybiA6IHNldHRlciBsYSB2YWxldXIgdmlzaWJsZSAoX0kpICsgbGEgdmFsZXVyIGNhY2hcdTAwRTllIChfVkkpICsgZGlzcGF0Y2ggY2hhbmdlICovXG4gICAgICAgIGZ1bmN0aW9uIGR4Q29tYm9GaWxsKGlkU3VmZml4LCBkaXNwbGF5VGV4dCwgdmFsdWUpIHtcbiAgICAgICAgICB2YXIgaW5wID0gZmluZEVsZW1lbnQoJ1tpZCQ9XCInICsgaWRTdWZmaXggKyAnX0lcIl0nKTtcbiAgICAgICAgICBpZiAoIWlucCB8fCAoaW5wLnZhbHVlIHx8IFwiXCIpLnRyaW0oKSkgcmV0dXJuO1xuICAgICAgICAgIHZhciBoaWRkZW5JbnB1dCA9IGZpbmRFbGVtZW50KCdbaWQkPVwiJyArIGlkU3VmZml4ICsgJ19WSVwiXScpO1xuICAgICAgICAgIGlucC52YWx1ZSA9IGRpc3BsYXlUZXh0O1xuICAgICAgICAgIGlucC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2hhbmdlJywgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgICAgICAgICBpZiAoaGlkZGVuSW5wdXQpIGhpZGRlbklucHV0LnZhbHVlID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgLyogTmF0dXJlIGQnYXNzdXJhbmNlIDogXCIxMFwiID0gTWFsYWRpZSAtIFRhdXggU1MgNjAlICovXG4gICAgICAgIGR4Q29tYm9GaWxsKFwicmVjaGVyY2hlcm5hdHVyZWFzc3VyYW5jZVwiLCBcIk1hbGFkaWUgLSBUYXV4IFNTIDYwJVwiLCBcIjEwXCIpO1xuICAgICAgICAvKiBUeXBlIGRlIHJlbm91dmVsbGVtZW50IDogZFx1MDBFOWxhaSBjYXIgbGUgY2FsbGJhY2sgTmF0dXJlQ2hhbmdlIHBldXQgclx1MDBFOWluaXRpYWxpc2VyIGxlIERPTSAqL1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGR4Q29tYm9GaWxsKFwicmVjaGVyY2hlcnR5cGVyZW5vdXZlbGxlbWVudFwiLCBcIlJlbm91di4gYXZlYyBhZGFwdGF0aW9uXCIsIFwiMlwiKTtcbiAgICAgICAgfSwgODAwKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuICAgIHN5bmNocm9uaXNlcjogYXN5bmMgKCkgPT4gZmFsc2VcbiAgfVxufTtcbiIsICJleHBvcnQgZGVmYXVsdCB7XG4gIG5hbWU6IFwiQWN0aWxcIixcbiAgaXNNYXRjaDogKCkgPT4gd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLmluY2x1ZGVzKFwiYWN0aWwuY29tXCIpLFxuICBhY3Rpb25zOiB7XG4gICAgZm9ybXVsYWlyZTogKGRhdGEpID0+IHtcbiAgICAgIHZhciBub21FbCA9IGZpbmRFbGVtZW50KCdpbnB1dFtuYW1lPVwibm9tXCJdJyk7XG4gICAgICBpZiAoIW5vbUVsKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIHZhciBtID0gZGF0YS5tIHx8IHt9O1xuICAgICAgdmFyIG8gPSBkYXRhLm8gfHwge307XG4gICAgICB2YXIgYyA9IGRhdGEuY2FjaGVkIHx8IHt9O1xuICAgICAgdmFyIHBlcnNvbm5lcyA9IG0ucGVyc29ubmVzIHx8IFtdO1xuICAgICAgdmFyIHAwID0gcGVyc29ubmVzLmxlbmd0aCA+IDAgPyBwZXJzb25uZXNbMF0gOiB7fTtcblxuICAgICAgdmFyIG5vbSA9IG0ubm9tIHx8IHAwLm5vbSB8fCBvLm5vbVBhdGllbnQgfHwgYy5ub20gfHwgXCJcIjtcbiAgICAgIHZhciBwcmVub20gPSBtLnByZW5vbSB8fCBwMC5wcmVub20gfHwgby5wcmVub21QYXRpZW50IHx8IGMucHJlbm9tIHx8IFwiXCI7XG4gICAgICB2YXIgZm91bmROU1MgPSBtLm51bWVyb1NlY3VyaXRlU29jaWFsZSB8fCBcIlwiO1xuICAgICAgaWYgKCFmb3VuZE5TUykge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBlcnNvbm5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciBwTlNTID0gKHBlcnNvbm5lc1tpXS5udW1lcm9TZWN1cml0ZVNvY2lhbGUgfHwgXCJcIikucmVwbGFjZSgvXFxEL2csIFwiXCIpO1xuICAgICAgICAgIGlmIChwTlNTLmxlbmd0aCA+PSAxMykgeyBmb3VuZE5TUyA9IHBlcnNvbm5lc1tpXS5udW1lcm9TZWN1cml0ZVNvY2lhbGU7IGJyZWFrOyB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciBmb3VuZERPQiA9IG0uZGF0ZU5haXNzYW5jZSB8fCBcIlwiO1xuICAgICAgaWYgKCFmb3VuZERPQikge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBlcnNvbm5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChwZXJzb25uZXNbaV0uZGF0ZU5haXNzYW5jZSkgeyBmb3VuZERPQiA9IHBlcnNvbm5lc1tpXS5kYXRlTmFpc3NhbmNlOyBicmVhazsgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YXIgbnNzID0gZm91bmROU1MgfHwgYy5uc3MgfHwgXCJcIjtcbiAgICAgIHZhciBkb2IgPSBmb3VuZERPQiB8fCBvLmRhdGVOYWlzc2FuY2VQYXRpZW50IHx8IGMuZG9iIHx8IFwiXCI7XG4gICAgICB2YXIgZWZmZWN0aXZlTlNTID0gZ2V0T3V2cmFudERyb2l0TlNTKG5zcywgZG9iLCBwZXJzb25uZXMpO1xuXG4gICAgICB1bHRyYUZpbGwobm9tRWwsIG5vbS50b1VwcGVyQ2FzZSgpKTtcbiAgICAgIHVsdHJhRmlsbChmaW5kRWxlbWVudCgnaW5wdXRbbmFtZT1cInByZW5vbVwiXScpLCBjYXBpdGFsaXplKHByZW5vbSkpO1xuICAgICAgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCdpbnB1dFtuYW1lPVwibnVtSW5zZWVcIl0nKSwgZWZmZWN0aXZlTlNTLnJlcGxhY2UoL1xcRC9nLCBcIlwiKSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuICAgIHN5bmNocm9uaXNlcjogYXN5bmMgKCkgPT4gZmFsc2VcbiAgfVxufTtcbiIsICJleHBvcnQgZGVmYXVsdCB7XG4gIG5hbWU6IFwiTWVyY2VyXCIsXG4gIGlzTWF0Y2g6ICgpID0+IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZS5pbmNsdWRlcyhcInNlcnZpY2VzLWZtLm5ldFwiKSB8fCB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUuaW5jbHVkZXMoXCJtZXJjZXJuZXQuZnJcIikgfHwgd2luZG93LmxvY2F0aW9uLmhyZWYuaW5jbHVkZXMoXCJQRUNNRVJQUk9cIiksXG4gIGFjdGlvbnM6IHtcbiAgICBmb3JtdWxhaXJlOiAoZGF0YSkgPT4ge1xuICAgICAgdmFyIHNzRWwgPSBmaW5kRWxlbWVudCgnaW5wdXRbbmFtZT1cIm51bWVyb1NTXCJdJyk7XG4gICAgICBpZiAoIXNzRWwpIHJldHVybiBmYWxzZTtcbiAgICAgIHZhciBtID0gZGF0YS5tIHx8IHt9O1xuICAgICAgdmFyIG8gPSBkYXRhLm8gfHwge307XG4gICAgICB2YXIgYyA9IGRhdGEuY2FjaGVkIHx8IHt9O1xuICAgICAgdmFyIHBlcnNvbm5lcyA9IG0ucGVyc29ubmVzIHx8IFtdO1xuICAgICAgdmFyIHAwID0gcGVyc29ubmVzLmxlbmd0aCA+IDAgPyBwZXJzb25uZXNbMF0gOiB7fTtcbiAgICAgIHZhciBub20gPSBtLm5vbSB8fCBwMC5ub20gfHwgby5ub21QYXRpZW50IHx8IGMubm9tIHx8IFwiXCI7XG4gICAgICB2YXIgcHJlbm9tID0gbS5wcmVub20gfHwgcDAucHJlbm9tIHx8IG8ucHJlbm9tUGF0aWVudCB8fCBjLnByZW5vbSB8fCBcIlwiO1xuICAgICAgdmFyIGZvdW5kTlNTID0gbS5udW1lcm9TZWN1cml0ZVNvY2lhbGUgfHwgXCJcIjtcbiAgICAgIGlmICghZm91bmROU1MpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwZXJzb25uZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgcE5TUyA9IChwZXJzb25uZXNbaV0ubnVtZXJvU2VjdXJpdGVTb2NpYWxlIHx8IFwiXCIpLnJlcGxhY2UoL1xcRC9nLCBcIlwiKTtcbiAgICAgICAgICBpZiAocE5TUy5sZW5ndGggPj0gMTMpIHsgZm91bmROU1MgPSBwZXJzb25uZXNbaV0ubnVtZXJvU2VjdXJpdGVTb2NpYWxlOyBicmVhazsgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YXIgZm91bmRET0IgPSBtLmRhdGVOYWlzc2FuY2UgfHwgXCJcIjtcbiAgICAgIGlmICghZm91bmRET0IpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwZXJzb25uZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAocGVyc29ubmVzW2ldLmRhdGVOYWlzc2FuY2UpIHsgZm91bmRET0IgPSBwZXJzb25uZXNbaV0uZGF0ZU5haXNzYW5jZTsgYnJlYWs7IH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIG5zcyA9IGZvdW5kTlNTIHx8IGMubnNzIHx8IFwiXCI7XG4gICAgICB2YXIgZG9iID0gZm91bmRET0IgfHwgby5kYXRlTmFpc3NhbmNlUGF0aWVudCB8fCBjLmRvYiB8fCBcIlwiO1xuICAgICAgdmFyIGVmZmVjdGl2ZU5TUyA9IGdldE91dnJhbnREcm9pdE5TUyhuc3MsIGRvYiwgcGVyc29ubmVzKTtcbiAgICAgIHZhciBudW1BZGhlcmVudCA9IG0ubnVtZXJvQWRoZXJlbnQgfHwgYy5udW1lcm9BZGhlcmVudCB8fCAoYy5yZWdpbWVzICYmIGMucmVnaW1lcy5yYzEgJiYgYy5yZWdpbWVzLnJjMS5udW1lcm9BZGhlcmVudCkgfHwgXCJcIjtcblxuICAgICAgdWx0cmFGaWxsKHNzRWwsIGVmZmVjdGl2ZU5TUy5yZXBsYWNlKC9cXEQvZywgXCJcIikpO1xuICAgICAgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCcjbm9tJyksIG5vbS50b1VwcGVyQ2FzZSgpKTtcbiAgICAgIHVsdHJhRmlsbChmaW5kRWxlbWVudCgnI3ByZW5vbScpLCBjYXBpdGFsaXplKHByZW5vbSkpO1xuICAgICAgaWYgKGRvYikgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCcjZGF0ZU5haScpLCBkb2IpO1xuICAgICAgaWYgKG51bUFkaGVyZW50KSB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJyNudW1BZGgnKSwgbnVtQWRoZXJlbnQpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICBzeW5jaHJvbmlzZXI6IGFzeW5jICgpID0+IGZhbHNlXG4gIH1cbn07XG4iLCAiZXhwb3J0IGRlZmF1bHQge1xuICBuYW1lOiBcIlRQIFBsdXNcIixcbiAgaXNNYXRjaDogKCkgPT4gd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLmluY2x1ZGVzKFwib3B0aXF1ZS10cHBsdXNcIikgfHwgKHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZS5pbmNsdWRlcyhcInNhbnRlY2xhaXIuZnJcIikgJiYgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmluY2x1ZGVzKFwiL3RwLXBsdXNcIikpLFxuICBhY3Rpb25zOiB7XG4gICAgZm9ybXVsYWlyZTogKGRhdGEpID0+IHtcbiAgICAgIC8qIFx1MDBDOXRhcGUgMSBcdTIwMTQgSWRlbnRpdFx1MDBFOSBkdSBwYXRpZW50IChBbmd1bGFyIE1hdGVyaWFsIHN0ZXBwZXIpICovXG4gICAgICB2YXIgbm9tRWwgPSBmaW5kRWxlbWVudCgnW2Zvcm1jb250cm9sbmFtZT1cIm5vbVwiXTpub3QoW2Rpc2FibGVkXSknKSB8fCBmaW5kRWxlbWVudCgnI21hdC1pbnB1dC0wJyk7XG4gICAgICBpZiAoIW5vbUVsKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIHZhciBtID0gZGF0YS5tIHx8IHt9O1xuICAgICAgdmFyIG8gPSBkYXRhLm8gfHwge307XG4gICAgICB2YXIgYyA9IGRhdGEuY2FjaGVkIHx8IHt9O1xuICAgICAgdmFyIHBlcnNvbm5lcyA9IG0ucGVyc29ubmVzIHx8IFtdO1xuICAgICAgdmFyIHAwID0gcGVyc29ubmVzLmxlbmd0aCA+IDAgPyBwZXJzb25uZXNbMF0gOiB7fTtcblxuICAgICAgdmFyIG5vbSA9IG0ubm9tIHx8IHAwLm5vbSB8fCBvLm5vbVBhdGllbnQgfHwgYy5ub20gfHwgXCJcIjtcbiAgICAgIHZhciBwcmVub20gPSBtLnByZW5vbSB8fCBwMC5wcmVub20gfHwgby5wcmVub21QYXRpZW50IHx8IGMucHJlbm9tIHx8IFwiXCI7XG4gICAgICB2YXIgZm91bmRET0IgPSBtLmRhdGVOYWlzc2FuY2UgfHwgXCJcIjtcbiAgICAgIGlmICghZm91bmRET0IpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwZXJzb25uZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAocGVyc29ubmVzW2ldLmRhdGVOYWlzc2FuY2UpIHsgZm91bmRET0IgPSBwZXJzb25uZXNbaV0uZGF0ZU5haXNzYW5jZTsgYnJlYWs7IH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIGRvYiA9IGZvdW5kRE9CIHx8IG8uZGF0ZU5haXNzYW5jZVBhdGllbnQgfHwgYy5kb2IgfHwgXCJcIjtcbiAgICAgIHZhciBwaG9uZSA9IG5vcm1hbGl6ZVBob25lKGMucGhvbmUgfHwgbS50ZWxlcGhvbmUgfHwgXCJcIik7XG4gICAgICB2YXIgbXV0dWVsbGUgPSBtLm9yZ2FuaXNtZSB8fCBjLm11dHVlbGxlIHx8IGMub3JnYW5pc21lIHx8IFwiXCI7XG4gICAgICB2YXIgbnVtQWRoZXJlbnQgPSBtLm51bWVyb0FkaGVyZW50IHx8IGMubnVtZXJvQWRoZXJlbnQgfHwgKGMucmVnaW1lcyAmJiBjLnJlZ2ltZXMucmMxICYmIGMucmVnaW1lcy5yYzEubnVtZXJvQWRoZXJlbnQpIHx8IFwiXCI7XG5cbiAgICAgIC8qIEZvbmN0aW9uIHBvdXIgcmVtcGxpciBsZXMgY2hhbXBzIHVuZSBmb2lzIGwnYXNzdXJldXIgclx1MDBFOXNvbHVcbiAgICAgICAgIChhcHBlbFx1MDBFOWUgc29pdCBhcHJcdTAwRThzIGwnYXV0b2NvbXBsZXRlLCBzb2l0IGltbVx1MDBFOWRpYXRlbWVudCBzaSBwYXMgZGUgbXV0dWVsbGUpICovXG4gICAgICB2YXIgZmlsbEZpZWxkcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAvKiBOXHUwMEIwIENPTlRSQVQgXHUyMDE0IGFwcGFyYVx1MDBFRXQgZHluYW1pcXVlbWVudCBhcHJcdTAwRThzIHNcdTAwRTlsZWN0aW9uIGFzc3VyZXVyICovXG4gICAgICAgIGlmIChudW1BZGhlcmVudCkge1xuICAgICAgICAgIHZhciBjb250cmF0RWwgPSBmaW5kRWxlbWVudCgnW2Zvcm1jb250cm9sbmFtZT1cIm51bWVyb0NvbnRyYXRBbWNcIl0nKTtcbiAgICAgICAgICBpZiAoY29udHJhdEVsICYmICFjb250cmF0RWwuZGlzYWJsZWQpIHVsdHJhRmlsbChjb250cmF0RWwsIG51bUFkaGVyZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIEJcdTAwRTluXHUwMEU5ZmljaWFpcmUgKi9cbiAgICAgICAgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCdbZm9ybWNvbnRyb2xuYW1lPVwibm9tXCJdOm5vdChbZGlzYWJsZWRdKScpLCBub20udG9VcHBlckNhc2UoKSk7XG4gICAgICAgIHVsdHJhRmlsbChmaW5kRWxlbWVudCgnW2Zvcm1jb250cm9sbmFtZT1cInByZW5vbVwiXTpub3QoW2Rpc2FibGVkXSknKSwgY2FwaXRhbGl6ZShwcmVub20pKTtcblxuICAgICAgICAvKiBEYXRlIGRlIG5haXNzYW5jZSBcdTIwMTQgbm9ybWFsaXNlciBlbiBERC9NTS9ZWVlZIHBvdXIgbGUgZGF0ZXBpY2tlciBBbmd1bGFyICovXG4gICAgICAgIGlmIChkb2IpIHtcbiAgICAgICAgICB2YXIgZCA9IFN0cmluZyhkb2IpLnJlcGxhY2UoL1xcRC9nLCBcIlwiKTtcbiAgICAgICAgICB2YXIgZG9iRm10ID0gZG9iO1xuICAgICAgICAgIGlmIChkLmxlbmd0aCA9PT0gOCkge1xuICAgICAgICAgICAgZG9iRm10ID0gKHBhcnNlSW50KGQuc2xpY2UoMCw0KSkgPiAxOTAwKVxuICAgICAgICAgICAgICA/IGQuc2xpY2UoNiw4KSArIFwiL1wiICsgZC5zbGljZSg0LDYpICsgXCIvXCIgKyBkLnNsaWNlKDAsNClcbiAgICAgICAgICAgICAgOiBkLnNsaWNlKDAsMikgKyBcIi9cIiArIGQuc2xpY2UoMiw0KSArIFwiL1wiICsgZC5zbGljZSg0LDgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJ1tmb3JtY29udHJvbG5hbWU9XCJkYXRlTmFpc3NhbmNlXCJdJyksIGRvYkZtdCk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBUXHUwMEU5bFx1MDBFOXBob25lICovXG4gICAgICAgIGlmIChwaG9uZSkge1xuICAgICAgICAgIHVsdHJhRmlsbChmaW5kRWxlbWVudCgnW2Zvcm1jb250cm9sbmFtZT1cInRlbGVwaG9uZVwiXScpLCBwaG9uZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBOYXR1cmUgZHUgZG9zc2llciBcdTIwMTQgbHVuZXR0ZXMgKDEpIG91IGxlbnRpbGxlcyAoMikgKi9cbiAgICAgICAgdmFyIGhhc0xlbnRpbGxlcyA9IChvLmxlbnRpbGxlc09EICYmIG8ubGVudGlsbGVzT0Quc3BoZXJlKSB8fCAoby5sZW50aWxsZXNPRyAmJiBvLmxlbnRpbGxlc09HLnNwaGVyZSlcbiAgICAgICAgICB8fCBvLnR5cGVQcmVzY3JpcHRpb24gPT09IFwibGVudGlsbGVzXCI7XG4gICAgICAgIHZhciByYWRpb1ZhbCA9IGhhc0xlbnRpbGxlcyA/IFwiMlwiIDogXCIxXCI7XG4gICAgICAgIHZhciByYWRpb3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dC5tZGMtcmFkaW9fX25hdGl2ZS1jb250cm9sJyk7XG4gICAgICAgIGZvciAodmFyIHJpID0gMDsgcmkgPCByYWRpb3MubGVuZ3RoOyByaSsrKSB7XG4gICAgICAgICAgaWYgKHJhZGlvc1tyaV0udmFsdWUgPT09IHJhZGlvVmFsICYmICFyYWRpb3NbcmldLmNoZWNrZWQpIHsgcmFkaW9zW3JpXS5jbGljaygpOyBicmVhazsgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyogQ2xpYyBTdWl2YW50ICovXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIHN1aXZhbnRCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdidXR0b24uc3RlcHBlci1idG4nKTtcbiAgICAgICAgICBpZiAoc3VpdmFudEJ0biAmJiAhc3VpdmFudEJ0bi5kaXNhYmxlZCkgc3VpdmFudEJ0bi5jbGljaygpO1xuICAgICAgICB9LCA4MDApO1xuICAgICAgfTtcblxuICAgICAgLyogQXNzdXJldXIgXHUyMDE0IGF1dG9jb21wbGV0ZSBBbmd1bGFyIE1hdGVyaWFsIDogdGFwZXIgbGUgbm9tIHB1aXMgc1x1MDBFOWxlY3Rpb25uZXIgbGUgbWVpbGxldXIgbWF0Y2ggKi9cbiAgICAgIGlmIChtdXR1ZWxsZSkge1xuICAgICAgICB2YXIgYXNzdXJldXJFbCA9IGZpbmRFbGVtZW50KCdbZm9ybWNvbnRyb2xuYW1lPVwiYXNzdXJldXJcIl0nKTtcbiAgICAgICAgaWYgKGFzc3VyZXVyRWwpIHtcbiAgICAgICAgICB1bHRyYUZpbGwoYXNzdXJldXJFbCwgbXV0dWVsbGUpO1xuICAgICAgICAgIC8qIEF0dGVuZHJlIHF1ZSBsZSBwYW5lbCBhdXRvY29tcGxldGUgcydvdXZyZSwgcHVpcyBjbGlxdWVyIGxlIG1laWxsZXVyIG1hdGNoICovXG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBwYW5lbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tYXQtbWRjLWF1dG9jb21wbGV0ZS1wYW5lbCwgLm1hdC1hdXRvY29tcGxldGUtcGFuZWwnKTtcbiAgICAgICAgICAgIGlmICghcGFuZWwpIHJldHVybjtcbiAgICAgICAgICAgIHZhciBvcHRpb25zID0gcGFuZWwucXVlcnlTZWxlY3RvckFsbCgnbWF0LW9wdGlvbicpO1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMubGVuZ3RoID09PSAwKSByZXR1cm47XG4gICAgICAgICAgICB2YXIgbmVlZGxlID0gbXV0dWVsbGUudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9cXHMrL2csIFwiIFwiKS50cmltKCk7XG4gICAgICAgICAgICB2YXIgYmVzdCA9IG9wdGlvbnNbMF07XG4gICAgICAgICAgICB2YXIgYmVzdFNjb3JlID0gMDtcbiAgICAgICAgICAgIGZvciAodmFyIG9pID0gMDsgb2kgPCBvcHRpb25zLmxlbmd0aDsgb2krKykge1xuICAgICAgICAgICAgICB2YXIgb3B0VGV4dCA9IChvcHRpb25zW29pXS50ZXh0Q29udGVudCB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1xccysvZywgXCIgXCIpLnRyaW0oKTtcbiAgICAgICAgICAgICAgaWYgKG9wdFRleHQgPT09IG5lZWRsZSkgeyBiZXN0ID0gb3B0aW9uc1tvaV07IGJlc3RTY29yZSA9IDM7IGJyZWFrOyB9XG4gICAgICAgICAgICAgIGlmIChiZXN0U2NvcmUgPCAyICYmIG9wdFRleHQuaW5jbHVkZXMobmVlZGxlKSkgeyBiZXN0ID0gb3B0aW9uc1tvaV07IGJlc3RTY29yZSA9IDI7IH1cbiAgICAgICAgICAgICAgaWYgKGJlc3RTY29yZSA8IDEgJiYgbmVlZGxlLmluY2x1ZGVzKG9wdFRleHQpKSB7IGJlc3QgPSBvcHRpb25zW29pXTsgYmVzdFNjb3JlID0gMTsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYmVzdC5jbGljaygpO1xuICAgICAgICAgICAgLyogQXByXHUwMEU4cyBzXHUwMEU5bGVjdGlvbiA6IGF0dGVuZHJlIHF1ZSBsZSBjaGFtcCBOXHUwMEIwIENPTlRSQVQgYXBwYXJhaXNzZSwgcHVpcyByZW1wbGlyIGxlIHJlc3RlICovXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZpbGxGaWVsZHMsIDgwMCk7XG4gICAgICAgICAgfSwgNjAwKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZmlsbEZpZWxkcygpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG4gICAgLyogXHUwMEM5Y3JhbiAyIFx1MjAxNCBEb3NzaWVyIHBhdGllbnQgKG9yZG9ubmFuY2UsIHByZXNjcmlwdGV1ciwgY29ycmVjdGlvbnMpICovXG4gICAgcnBhOiAoZGF0YSkgPT4ge1xuICAgICAgdmFyIG8gPSBkYXRhLm8gfHwge307XG4gICAgICB2YXIgYyA9IGRhdGEuY2FjaGVkIHx8IHt9O1xuICAgICAgdmFyIG0gPSBkYXRhLm0gfHwge307XG4gICAgICB2YXIgZmlsbGVkID0gMDtcblxuICAgICAgLyogRGF0ZSBkJ29yZG9ubmFuY2UgKi9cbiAgICAgIHZhciBkYXRlT3JkbyA9IG8uZGF0ZU9yZG9ubmFuY2UgfHwgYy5kYXRlT3Jkb25uYW5jZSB8fCBcIlwiO1xuICAgICAgaWYgKGRhdGVPcmRvKSB7XG4gICAgICAgIHZhciBkID0gU3RyaW5nKGRhdGVPcmRvKS5yZXBsYWNlKC9cXEQvZywgXCJcIik7XG4gICAgICAgIHZhciBkYXRlT3Jkb0ZtdCA9IGRhdGVPcmRvO1xuICAgICAgICBpZiAoZC5sZW5ndGggPT09IDgpIHtcbiAgICAgICAgICBkYXRlT3Jkb0ZtdCA9IChwYXJzZUludChkLnNsaWNlKDAsNCkpID4gMTkwMClcbiAgICAgICAgICAgID8gZC5zbGljZSg2LDgpICsgXCIvXCIgKyBkLnNsaWNlKDQsNikgKyBcIi9cIiArIGQuc2xpY2UoMCw0KVxuICAgICAgICAgICAgOiBkLnNsaWNlKDAsMikgKyBcIi9cIiArIGQuc2xpY2UoMiw0KSArIFwiL1wiICsgZC5zbGljZSg0LDgpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBkYXRlT3Jkb0VsID0gZmluZEVsZW1lbnQoJ1tmb3JtY29udHJvbG5hbWU9XCJkYXRlT3Jkb25uYW5jZVwiXScpO1xuICAgICAgICBpZiAoZGF0ZU9yZG9FbCAmJiAhZGF0ZU9yZG9FbC5kaXNhYmxlZCkgeyB1bHRyYUZpbGwoZGF0ZU9yZG9FbCwgZGF0ZU9yZG9GbXQpOyBmaWxsZWQrKzsgfVxuICAgICAgfVxuXG4gICAgICAvKiBQcmVzY3JpcHRldXIgXHUyMDE0IFJQUFMgKHJhZGlvICsgY2hhbXApICovXG4gICAgICB2YXIgcnBwcyA9IG8ucnBwcyB8fCBjLnJwcHMgfHwgXCJcIjtcbiAgICAgIGlmIChycHBzKSB7XG4gICAgICAgIC8qIFNcdTAwRTlsZWN0aW9ubmVyIGxlIHJhZGlvIFJQUFMgKHZhbHVlPVwiMlwiKSAqL1xuICAgICAgICB2YXIgcnBwc1JhZGlvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbWF0LXJhZGlvLWdyb3VwW2Zvcm1jb250cm9sbmFtZT1cInByZXNjcmlwdGV1clR5cGVcIl0gaW5wdXRbdmFsdWU9XCIyXCJdJyk7XG4gICAgICAgIGlmIChycHBzUmFkaW8gJiYgIXJwcHNSYWRpby5jaGVja2VkKSBycHBzUmFkaW8uY2xpY2soKTtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgcnBwc0VsID0gZmluZEVsZW1lbnQoJ1tmb3JtY29udHJvbG5hbWU9XCJpZGVudGlmaWFudFJlZ2xlbWVudGFpcmVcIl0nKTtcbiAgICAgICAgICBpZiAocnBwc0VsKSB7IHVsdHJhRmlsbChycHBzRWwsIHJwcHMucmVwbGFjZSgvXFxEL2csIFwiXCIpKTsgZmlsbGVkKys7IH1cbiAgICAgICAgfSwgMzAwKTtcbiAgICAgIH1cblxuICAgICAgLyogXHUyNTAwXHUyNTAwIENvcnJlY3Rpb25zIG9wdGlxdWVzIFx1MjUwMFx1MjUwMCAqL1xuICAgICAgdmFyIG9kID0gby5vZWlsRHJvaXQgfHwgby5vZCB8fCB7fTtcbiAgICAgIHZhciBvZyA9IG8ub2VpbEdhdWNoZSB8fCBvLm9nIHx8IHt9O1xuXG4gICAgICAvKiBEXHUwMEU5dGVjdGlvbiBkdSB0eXBlIGRlIHZpc2lvbiBzXHUwMEU5bGVjdGlvbm5cdTAwRTkgdmlhIGxlcyBjaGVja2JveGVzICovXG4gICAgICB2YXIgY2hlY2tib3hlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jaG9peC12aXNpb24tdGVpbnRlIG1hdC1jaGVja2JveCcpO1xuXG4gICAgICAvKiBIZWxwZXIgOiB0cm91dmVyIGxlcyBpbnB1dHMgZGUgY29ycmVjdGlvbiBkYW5zIHVuIGJsb2MgZXF1aXBlbWVudCAqL1xuICAgICAgZnVuY3Rpb24gZmlsbFZpc2lvbkJsb2NrKGJsb2NrSW5kZXgsIG9kRGF0YSwgb2dEYXRhKSB7XG4gICAgICAgIC8qIENoYXF1ZSBibG9jIGRlIHZpc2lvbiAobG9pbiwgcHJcdTAwRThzLCBtdWx0aWZvY2FsKSBhIHVuIGFwcC1jYXJhY3RlcmlzdGlxdWUgKi9cbiAgICAgICAgdmFyIGJsb2NrcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2FwcC1jYXJhY3RlcmlzdGlxdWUnKTtcbiAgICAgICAgaWYgKCFibG9ja3MgfHwgIWJsb2Nrc1tibG9ja0luZGV4XSkgcmV0dXJuIDA7XG4gICAgICAgIHZhciBibG9jayA9IGJsb2Nrc1tibG9ja0luZGV4XTtcbiAgICAgICAgdmFyIGNvdW50ID0gMDtcblxuICAgICAgICAvKiBPRCBcdTIwMTQgcHJlbWlcdTAwRThyZSBsaWduZSBkdSB0YWJsZWF1ICovXG4gICAgICAgIHZhciByb3dzID0gYmxvY2sucXVlcnlTZWxlY3RvckFsbCgndHInKTtcbiAgICAgICAgaWYgKHJvd3MubGVuZ3RoID49IDIpIHtcbiAgICAgICAgICB2YXIgb2RJbnB1dHMgPSByb3dzWzFdLnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0W21hdGlucHV0XTpub3QoW2Rpc2FibGVkXSknKTtcbiAgICAgICAgICBpZiAob2RJbnB1dHMubGVuZ3RoID49IDEgJiYgb2REYXRhLnNwaGVyZSkgeyB1bHRyYUZpbGwob2RJbnB1dHNbMF0sIG9kRGF0YS5zcGhlcmUpOyBjb3VudCsrOyB9XG4gICAgICAgICAgaWYgKG9kSW5wdXRzLmxlbmd0aCA+PSAyICYmIG9kRGF0YS5jeWxpbmRyZSkgeyB1bHRyYUZpbGwob2RJbnB1dHNbMV0sIG9kRGF0YS5jeWxpbmRyZSk7IGNvdW50Kys7IH1cbiAgICAgICAgICBpZiAob2RJbnB1dHMubGVuZ3RoID49IDMgJiYgb2REYXRhLmF4ZSkgeyB1bHRyYUZpbGwob2RJbnB1dHNbMl0sIG9kRGF0YS5heGUpOyBjb3VudCsrOyB9XG4gICAgICAgICAgLyogQWRkaXRpb24gKHNpIHByXHUwMEU5c2VudCBcdTIwMTQgbXVsdGlmb2NhbCkgKi9cbiAgICAgICAgICBpZiAob2RJbnB1dHMubGVuZ3RoID49IDQgJiYgb2REYXRhLmFkZGl0aW9uKSB7IHVsdHJhRmlsbChvZElucHV0c1szXSwgb2REYXRhLmFkZGl0aW9uKTsgY291bnQrKzsgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyogT0cgXHUyMDE0IGRldXhpXHUwMEU4bWUgbGlnbmUgZHUgdGFibGVhdSAqL1xuICAgICAgICBpZiAocm93cy5sZW5ndGggPj0gMykge1xuICAgICAgICAgIHZhciBvZ0lucHV0cyA9IHJvd3NbMl0ucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbbWF0aW5wdXRdOm5vdChbZGlzYWJsZWRdKScpO1xuICAgICAgICAgIGlmIChvZ0lucHV0cy5sZW5ndGggPj0gMSAmJiBvZ0RhdGEuc3BoZXJlKSB7IHVsdHJhRmlsbChvZ0lucHV0c1swXSwgb2dEYXRhLnNwaGVyZSk7IGNvdW50Kys7IH1cbiAgICAgICAgICBpZiAob2dJbnB1dHMubGVuZ3RoID49IDIgJiYgb2dEYXRhLmN5bGluZHJlKSB7IHVsdHJhRmlsbChvZ0lucHV0c1sxXSwgb2dEYXRhLmN5bGluZHJlKTsgY291bnQrKzsgfVxuICAgICAgICAgIGlmIChvZ0lucHV0cy5sZW5ndGggPj0gMyAmJiBvZ0RhdGEuYXhlKSB7IHVsdHJhRmlsbChvZ0lucHV0c1syXSwgb2dEYXRhLmF4ZSk7IGNvdW50Kys7IH1cbiAgICAgICAgICBpZiAob2dJbnB1dHMubGVuZ3RoID49IDQgJiYgb2dEYXRhLmFkZGl0aW9uKSB7IHVsdHJhRmlsbChvZ0lucHV0c1szXSwgb2dEYXRhLmFkZGl0aW9uKTsgY291bnQrKzsgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNvdW50O1xuICAgICAgfVxuXG4gICAgICAvKiBDb2NoZXIgbGEgdmlzaW9uIGNvbmNlcm5cdTAwRTllIGV0IHJlbXBsaXIgKi9cbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIC8qIFZpc2lvbiBkZSBsb2luICovXG4gICAgICAgIGlmICgob2Quc3BoZXJlIHx8IG9nLnNwaGVyZSkgJiYgY2hlY2tib3hlc1swXSkge1xuICAgICAgICAgIHZhciBjYjBJbnB1dCA9IGNoZWNrYm94ZXNbMF0ucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJyk7XG4gICAgICAgICAgaWYgKGNiMElucHV0ICYmICFjYjBJbnB1dC5jaGVja2VkKSBjYjBJbnB1dC5jbGljaygpO1xuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IGZpbGxlZCArPSBmaWxsVmlzaW9uQmxvY2soMCwgb2QsIG9nKTsgfSwgMjAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIFZpc2lvbiBkZSBwclx1MDBFOHMgKGFkZGl0aW9uID0gcHJvZ3Jlc3NpZnMpICovXG4gICAgICAgIGlmIChvZC5hZGRpdGlvbiB8fCBvZy5hZGRpdGlvbikge1xuICAgICAgICAgIC8qIENvY2hlciBtdWx0aWZvY2FsIHNpIGFkZGl0aW9uIGV4aXN0ZSAqL1xuICAgICAgICAgIGlmIChjaGVja2JveGVzWzJdKSB7XG4gICAgICAgICAgICB2YXIgY2IySW5wdXQgPSBjaGVja2JveGVzWzJdLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXScpO1xuICAgICAgICAgICAgaWYgKGNiMklucHV0ICYmICFjYjJJbnB1dC5jaGVja2VkKSBjYjJJbnB1dC5jbGljaygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSwgNTAwKTtcblxuICAgICAgcmV0dXJuIGZpbGxlZCA+IDA7XG4gICAgfSxcblxuICAgIC8qIFBhZ2UgMiBcdTIwMTQgZFx1MDBFOXRlY3Rpb24gYXV0b21hdGlxdWUgKi9cbiAgICBycGFQYWdlMjogdHJ1ZSxcblxuICAgIHN5bmNocm9uaXNlcjogYXN5bmMgKCkgPT4gZmFsc2VcbiAgfVxufTtcbiIsICJleHBvcnQgZGVmYXVsdCB7XG4gIG5hbWU6IFwiU1AgU2FudGVcIixcbiAgaXNNYXRjaDogKCkgPT4gKHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZS5pbmNsdWRlcyhcImZmbC1wcm9tb3RldXIuY29tXCIpICYmICF3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUuaW5jbHVkZXMoXCJvcHRpcXVlLXRwcGx1c1wiKSkgfHwgd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLmluY2x1ZGVzKFwic3BzYW50ZS5mclwiKSxcbiAgYWN0aW9uczoge1xuICAgIGZvcm11bGFpcmU6IChkYXRhKSA9PiB7XG4gICAgICB2YXIgbm9tRWwgPSBmaW5kRWxlbWVudCgnI21hdC1pbnB1dC0wJyk7XG4gICAgICBpZiAoIW5vbUVsKSByZXR1cm4gZmFsc2U7XG4gICAgICB2YXIgbSA9IGRhdGEubSB8fCB7fTtcbiAgICAgIHZhciBvID0gZGF0YS5vIHx8IHt9O1xuICAgICAgdmFyIGMgPSBkYXRhLmNhY2hlZCB8fCB7fTtcbiAgICAgIHZhciBwZXJzb25uZXMgPSBtLnBlcnNvbm5lcyB8fCBbXTtcbiAgICAgIHZhciBwMCA9IHBlcnNvbm5lcy5sZW5ndGggPiAwID8gcGVyc29ubmVzWzBdIDoge307XG4gICAgICB2YXIgbm9tID0gbS5ub20gfHwgcDAubm9tIHx8IG8ubm9tUGF0aWVudCB8fCBjLm5vbSB8fCBcIlwiO1xuICAgICAgdmFyIHByZW5vbSA9IG0ucHJlbm9tIHx8IHAwLnByZW5vbSB8fCBvLnByZW5vbVBhdGllbnQgfHwgYy5wcmVub20gfHwgXCJcIjtcbiAgICAgIHZhciBmb3VuZE5TUyA9IG0ubnVtZXJvU2VjdXJpdGVTb2NpYWxlIHx8IFwiXCI7XG4gICAgICBpZiAoIWZvdW5kTlNTKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGVyc29ubmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdmFyIHBOU1MgPSAocGVyc29ubmVzW2ldLm51bWVyb1NlY3VyaXRlU29jaWFsZSB8fCBcIlwiKS5yZXBsYWNlKC9cXEQvZywgXCJcIik7XG4gICAgICAgICAgaWYgKHBOU1MubGVuZ3RoID49IDEzKSB7IGZvdW5kTlNTID0gcGVyc29ubmVzW2ldLm51bWVyb1NlY3VyaXRlU29jaWFsZTsgYnJlYWs7IH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIGZvdW5kRE9CID0gbS5kYXRlTmFpc3NhbmNlIHx8IFwiXCI7XG4gICAgICBpZiAoIWZvdW5kRE9CKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGVyc29ubmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKHBlcnNvbm5lc1tpXS5kYXRlTmFpc3NhbmNlKSB7IGZvdW5kRE9CID0gcGVyc29ubmVzW2ldLmRhdGVOYWlzc2FuY2U7IGJyZWFrOyB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciBuc3MgPSBmb3VuZE5TUyB8fCBjLm5zcyB8fCBcIlwiO1xuICAgICAgdmFyIGRvYiA9IGZvdW5kRE9CIHx8IG8uZGF0ZU5haXNzYW5jZVBhdGllbnQgfHwgYy5kb2IgfHwgXCJcIjtcbiAgICAgIHZhciBlZmZlY3RpdmVOU1MgPSBnZXRPdXZyYW50RHJvaXROU1MobnNzLCBkb2IsIHBlcnNvbm5lcyk7XG4gICAgICB2YXIgZGlnaXRzID0gZWZmZWN0aXZlTlNTLnJlcGxhY2UoL1xcRC9nLCBcIlwiKTtcbiAgICAgIHZhciBudW1BZGhlcmVudCA9IG0ubnVtZXJvQWRoZXJlbnQgfHwgYy5udW1lcm9BZGhlcmVudCB8fCAoYy5yZWdpbWVzICYmIGMucmVnaW1lcy5yYzEgJiYgYy5yZWdpbWVzLnJjMS5udW1lcm9BZGhlcmVudCkgfHwgXCJcIjtcblxuICAgICAgdWx0cmFGaWxsKG5vbUVsLCBub20udG9VcHBlckNhc2UoKSk7XG4gICAgICB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJyNtYXQtaW5wdXQtMScpLCBjYXBpdGFsaXplKHByZW5vbSkpO1xuICAgICAgaWYgKGRvYikgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCcjbWF0LWlucHV0LTInKSwgZG9iKTtcbiAgICAgIGlmIChudW1BZGhlcmVudCkge1xuICAgICAgICB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJyNtYXQtaW5wdXQtNycpLCBudW1BZGhlcmVudCk7XG4gICAgICAgIHVsdHJhRmlsbChmaW5kRWxlbWVudCgnI21hdC1pbnB1dC04JyksIG51bUFkaGVyZW50KTtcbiAgICAgIH1cbiAgICAgIHVsdHJhRmlsbChmaW5kRWxlbWVudCgnI21hdC1pbnB1dC05JyksIGRpZ2l0cy5zbGljZSgwLCAxMykpO1xuICAgICAgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCcjbWF0LWlucHV0LTEwJyksIGRpZ2l0cy5zbGljZSgxMywgMTUpKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG4gICAgc3luY2hyb25pc2VyOiBhc3luYyAoKSA9PiBmYWxzZVxuICB9XG59O1xuIiwgImV4cG9ydCBkZWZhdWx0IHtcbiAgbmFtZTogXCJTb2xpbXV0XCIsXG4gIGlzTWF0Y2g6ICgpID0+IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZS5pbmNsdWRlcyhcInNvbGltdXQuZnJcIiksXG4gIGFjdGlvbnM6IHtcbiAgICBmb3JtdWxhaXJlOiAoZGF0YSkgPT4ge1xuICAgICAgdmFyIG1hdHJpY3VsZUVsID0gZmluZEVsZW1lbnQoJ2lucHV0W25hbWU9XCJQaG9uZVwiXScpO1xuICAgICAgaWYgKCFtYXRyaWN1bGVFbCkgcmV0dXJuIGZhbHNlO1xuICAgICAgdmFyIG0gPSBkYXRhLm0gfHwge307XG4gICAgICB2YXIgbyA9IGRhdGEubyB8fCB7fTtcbiAgICAgIHZhciBjID0gZGF0YS5jYWNoZWQgfHwge307XG4gICAgICB2YXIgcGVyc29ubmVzID0gbS5wZXJzb25uZXMgfHwgW107XG4gICAgICB2YXIgcDAgPSBwZXJzb25uZXMubGVuZ3RoID4gMCA/IHBlcnNvbm5lc1swXSA6IHt9O1xuICAgICAgdmFyIGZvdW5kTlNTID0gbS5udW1lcm9TZWN1cml0ZVNvY2lhbGUgfHwgXCJcIjtcbiAgICAgIGlmICghZm91bmROU1MpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwZXJzb25uZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgcE5TUyA9IChwZXJzb25uZXNbaV0ubnVtZXJvU2VjdXJpdGVTb2NpYWxlIHx8IFwiXCIpLnJlcGxhY2UoL1xcRC9nLCBcIlwiKTtcbiAgICAgICAgICBpZiAocE5TUy5sZW5ndGggPj0gMTMpIHsgZm91bmROU1MgPSBwZXJzb25uZXNbaV0ubnVtZXJvU2VjdXJpdGVTb2NpYWxlOyBicmVhazsgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YXIgZm91bmRET0IgPSBtLmRhdGVOYWlzc2FuY2UgfHwgXCJcIjtcbiAgICAgIGlmICghZm91bmRET0IpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwZXJzb25uZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAocGVyc29ubmVzW2ldLmRhdGVOYWlzc2FuY2UpIHsgZm91bmRET0IgPSBwZXJzb25uZXNbaV0uZGF0ZU5haXNzYW5jZTsgYnJlYWs7IH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIG5zcyA9IGZvdW5kTlNTIHx8IGMubnNzIHx8IFwiXCI7XG4gICAgICB2YXIgZG9iID0gZm91bmRET0IgfHwgby5kYXRlTmFpc3NhbmNlUGF0aWVudCB8fCBjLmRvYiB8fCBcIlwiO1xuICAgICAgdmFyIGVmZmVjdGl2ZU5TUyA9IGdldE91dnJhbnREcm9pdE5TUyhuc3MsIGRvYiwgcGVyc29ubmVzKTtcblxuICAgICAgLyogSGVscGVyIDogdHJvdXZlciB1biBpbnB1dCBSYWR6ZW4gcGFyIGxlIHRleHRlIGR1IGxhYmVsIGFkamFjZW50ICovXG4gICAgICBmdW5jdGlvbiBmaW5kUmFkemVuSW5wdXRCeUxhYmVsKGxhYmVsVGV4dCkge1xuICAgICAgICB2YXIgbGFiZWxzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI2RldmlzX2lkZW50IGxhYmVsLCAjYm9keS1kZXZpcyBsYWJlbCcpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxhYmVscy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmICgobGFiZWxzW2ldLnRleHRDb250ZW50IHx8IFwiXCIpLnRyaW0oKS50b0xvd2VyQ2FzZSgpLmluZGV4T2YobGFiZWxUZXh0LnRvTG93ZXJDYXNlKCkpID49IDApIHtcbiAgICAgICAgICAgIHZhciBjb250YWluZXIgPSBsYWJlbHNbaV0uY2xvc2VzdCgnLmNvbC1sZy0yLCAuY29sLWxnLTMsIC5jb2wteGwtMiwgLmNvbC14bC0zLCBkaXZbY2xhc3MqPVwiY29sLVwiXScpO1xuICAgICAgICAgICAgaWYgKGNvbnRhaW5lcikge1xuICAgICAgICAgICAgICB2YXIgaW5wID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5yei1jYWxlbmRhciAucnotaW5wdXR0ZXh0Om5vdChbZGlzYWJsZWRdKTpub3QoW3JlYWRvbmx5XSknKTtcbiAgICAgICAgICAgICAgaWYgKGlucCkgcmV0dXJuIGlucDtcbiAgICAgICAgICAgICAgaW5wID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5yei10ZXh0Ym94Om5vdChbZGlzYWJsZWRdKScpO1xuICAgICAgICAgICAgICBpZiAoaW5wKSByZXR1cm4gaW5wO1xuICAgICAgICAgICAgICBpbnAgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignaW5wdXQucnotaW5wdXR0ZXh0Om5vdChbZGlzYWJsZWRdKTpub3QoW3JlYWRvbmx5XSknKTtcbiAgICAgICAgICAgICAgaWYgKGlucCkgcmV0dXJuIGlucDtcbiAgICAgICAgICAgICAgaW5wID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5yei1zcGlubmVyLWlucHV0Om5vdChbZGlzYWJsZWRdKScpO1xuICAgICAgICAgICAgICBpZiAoaW5wKSByZXR1cm4gaW5wO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgLyogTWF0cmljdWxlIGF2ZWMgbWFzcXVlIDogWCBYWCBYWCBYWCBYWFggWFhYICovXG4gICAgICB2YXIgZGlnaXRzID0gZWZmZWN0aXZlTlNTLnJlcGxhY2UoL1xcRC9nLCBcIlwiKTtcbiAgICAgIHZhciBmb3JtYXR0ZWQgPSBkaWdpdHM7XG4gICAgICBpZiAoZGlnaXRzLmxlbmd0aCA+PSAxMykge1xuICAgICAgICBmb3JtYXR0ZWQgPSBkaWdpdHNbMF0gKyBcIiBcIiArIGRpZ2l0cy5zbGljZSgxLDMpICsgXCIgXCIgKyBkaWdpdHMuc2xpY2UoMyw1KSArIFwiIFwiICsgZGlnaXRzLnNsaWNlKDUsNykgKyBcIiBcIiArIGRpZ2l0cy5zbGljZSg3LDEwKSArIFwiIFwiICsgZGlnaXRzLnNsaWNlKDEwLDEzKTtcbiAgICAgICAgaWYgKGRpZ2l0cy5sZW5ndGggPj0gMTUpIGZvcm1hdHRlZCArPSBcIiBcIiArIGRpZ2l0cy5zbGljZSgxMywxNSk7XG4gICAgICB9XG4gICAgICB1bHRyYUZpbGwobWF0cmljdWxlRWwsIGZvcm1hdHRlZCk7XG5cbiAgICAgIC8qIERhdGUgZGUgbmFpc3NhbmNlIFx1MjAxNCBjaGVyY2hlciBwYXIgbGFiZWwgKi9cbiAgICAgIGlmIChkb2IpIHtcbiAgICAgICAgdmFyIGRvYklucHV0ID0gZmluZFJhZHplbklucHV0QnlMYWJlbChcIkRhdGUgZGUgbmFpc3NhbmNlXCIpO1xuICAgICAgICBpZiAoIWRvYklucHV0KSB7XG4gICAgICAgICAgdmFyIGFsbERhdGVJbnB1dHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjZGV2aXNfaWRlbnQgLnJ6LWNhbGVuZGFyIC5yei1pbnB1dHRleHQ6bm90KFtkaXNhYmxlZF0pOm5vdChbcmVhZG9ubHldKScpO1xuICAgICAgICAgIGlmIChhbGxEYXRlSW5wdXRzLmxlbmd0aCA+PSAxKSBkb2JJbnB1dCA9IGFsbERhdGVJbnB1dHNbMF07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRvYklucHV0KSB1bHRyYUZpbGwoZG9iSW5wdXQsIGRvYik7XG4gICAgICB9XG5cbiAgICAgIC8qIFJhbmcgZ1x1MDBFOW1lbGxhaXJlICovXG4gICAgICB2YXIgcmFuZ0VsID0gZmluZFJhZHplbklucHV0QnlMYWJlbChcIlJhbmdcIik7XG4gICAgICAvKiBuZSBwYXMgcmVtcGxpciBsZSByYW5nIHNhdWYgc2kgb24gYSB1bmUgZG9ublx1MDBFOWUgZXhwbGljaXRlICovXG5cbiAgICAgIC8qIE5cdTAwQjAgcHJlc2NyaXB0ZXVyIChSUFBTL0FERUxJKSAqL1xuICAgICAgdmFyIHJwcHMgPSBvLnJwcHMgfHwgKGMub3Jkb25uYW5jZSAmJiBjLm9yZG9ubmFuY2UucnBwcykgfHwgKGMucHJlc2NyaXB0aW9uICYmIGMucHJlc2NyaXB0aW9uLnJwcHMpIHx8IGMucnBwcyB8fCBcIlwiO1xuICAgICAgaWYgKHJwcHMpIHtcbiAgICAgICAgdmFyIHJwcHNFbCA9IGZpbmRFbGVtZW50KCdpbnB1dFtuYW1lPVwiUHJlc2NyaXB0ZXVyXCJdJyk7XG4gICAgICAgIGlmIChycHBzRWwpIHVsdHJhRmlsbChycHBzRWwsIHJwcHMucmVwbGFjZSgvXFxEL2csIFwiXCIpLnNsaWNlKDAsIDkpKTtcbiAgICAgIH1cblxuICAgICAgLyogRGF0ZSBkZSBwcmVzY3JpcHRpb24gXHUyMDE0IGNoZXJjaGVyIHBhciBsYWJlbCAqL1xuICAgICAgdmFyIGRhdGVPcmRvID0gby5kYXRlT3Jkb25uYW5jZSB8fCAoYy5vcmRvbm5hbmNlICYmIGMub3Jkb25uYW5jZS5kYXRlT3Jkb25uYW5jZSkgfHwgKGMucHJlc2NyaXB0aW9uICYmIGMucHJlc2NyaXB0aW9uLmRhdGVQcmVzY3JpcHRpb24pIHx8IFwiXCI7XG4gICAgICBpZiAoZGF0ZU9yZG8pIHtcbiAgICAgICAgdmFyIHByZXNjRGF0ZUlucHV0ID0gZmluZFJhZHplbklucHV0QnlMYWJlbChcIkRhdGUgZGUgcHJlc2NyaXB0aW9uXCIpO1xuICAgICAgICBpZiAoIXByZXNjRGF0ZUlucHV0KSB7XG4gICAgICAgICAgdmFyIGFsbERhdGVJbnB1dHMyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI2RldmlzX2lkZW50IC5yei1jYWxlbmRhciAucnotaW5wdXR0ZXh0Om5vdChbZGlzYWJsZWRdKTpub3QoW3JlYWRvbmx5XSknKTtcbiAgICAgICAgICBpZiAoYWxsRGF0ZUlucHV0czIubGVuZ3RoID49IDIpIHByZXNjRGF0ZUlucHV0ID0gYWxsRGF0ZUlucHV0czJbMV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByZXNjRGF0ZUlucHV0KSB1bHRyYUZpbGwocHJlc2NEYXRlSW5wdXQsIGRhdGVPcmRvKTtcbiAgICAgIH1cblxuICAgICAgY29uc29sZS5pbmZvKFwiW0F1ZGlCb3QgU29saW11dF0gZmlsbGVkIFx1MjAxNCBoYXNOU1M6XCIsICEhZWZmZWN0aXZlTlNTLCBcInwgaGFzRG9iOlwiLCAhIWRvYiwgXCJ8IGhhc1JwcHM6XCIsICEhcnBwcywgXCJ8IGhhc0RhdGVPcmRvOlwiLCAhIWRhdGVPcmRvKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG4gICAgc3luY2hyb25pc2VyOiBhc3luYyAoKSA9PiBmYWxzZVxuICB9XG59O1xuIiwgImV4cG9ydCBkZWZhdWx0IHtcbiAgbmFtZTogXCJBbWVsaVwiLFxuICBpc01hdGNoOiAoKSA9PiB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUuaW5jbHVkZXMoXCJhbWVsaS5mclwiKSxcbiAgYWN0aW9uczoge1xuICAgIGZvcm11bGFpcmU6IChkYXRhKSA9PiB7XG4gICAgICB2YXIgbmlyRWwgPSBmaW5kRWxlbWVudCgnI25pcicpO1xuICAgICAgaWYgKCFuaXJFbCkgcmV0dXJuIGZhbHNlO1xuICAgICAgdmFyIG0gPSBkYXRhLm0gfHwge307XG4gICAgICB2YXIgcGVyc29ubmVzID0gbS5wZXJzb25uZXMgfHwgW107XG4gICAgICB2YXIgcDAgPSBwZXJzb25uZXMubGVuZ3RoID4gMCA/IHBlcnNvbm5lc1swXSA6IHt9O1xuICAgICAgdmFyIGZvdW5kTlNTID0gbS5udW1lcm9TZWN1cml0ZVNvY2lhbGUgfHwgXCJcIjtcbiAgICAgIGlmICghZm91bmROU1MpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwZXJzb25uZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgcE5TUyA9IChwZXJzb25uZXNbaV0ubnVtZXJvU2VjdXJpdGVTb2NpYWxlIHx8IFwiXCIpLnJlcGxhY2UoL1xcRC9nLCBcIlwiKTtcbiAgICAgICAgICBpZiAocE5TUy5sZW5ndGggPj0gMTMpIHsgZm91bmROU1MgPSBwZXJzb25uZXNbaV0ubnVtZXJvU2VjdXJpdGVTb2NpYWxlOyBicmVhazsgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YXIgZG9iID0gbS5kYXRlTmFpc3NhbmNlIHx8IHAwLmRhdGVOYWlzc2FuY2UgfHwgXCJcIjtcbiAgICAgIHZhciBjID0gZGF0YS5jYWNoZWQgfHwge307XG4gICAgICB2YXIgbnNzID0gZm91bmROU1MgfHwgYy5uc3MgfHwgXCJcIjtcbiAgICAgIHZhciBlZmZlY3RpdmVOU1MgPSBnZXRPdXZyYW50RHJvaXROU1MobnNzLCBkb2IsIHBlcnNvbm5lcyk7XG4gICAgICB1bHRyYUZpbGwobmlyRWwsIGVmZmVjdGl2ZU5TUy5yZXBsYWNlKC9cXEQvZywgXCJcIikuc2xpY2UoMCwgMTMpKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG4gICAgc3luY2hyb25pc2VyOiBhc3luYyAoKSA9PiBmYWxzZVxuICB9XG59O1xuIiwgInZhciBQT1JUQUxfS0VZID0gXCJtdXR1ZWxsZS1hbG1lcnlzLmNvbVwiO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIG5hbWU6IFwiQWxtZXJ5c1wiLFxuICBpc01hdGNoOiAoKSA9PiB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUuaW5jbHVkZXMoXCJhbG1lcnlzLmNvbVwiKSB8fCB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUuaW5jbHVkZXMoXCJiZS1hbG1lcnlzLmNvbVwiKSxcbiAgYWN0aW9uczoge1xuICAgIGZvcm11bGFpcmU6IChkYXRhKSA9PiB7XG4gICAgICB2YXIgbSA9IGRhdGEubSB8fCB7fTtcbiAgICAgIHZhciBvID0gZGF0YS5vIHx8IHt9O1xuICAgICAgdmFyIGMgPSBkYXRhLmNhY2hlZCB8fCB7fTtcbiAgICAgIHZhciBwZXJzb25uZXMgPSBtLnBlcnNvbm5lcyB8fCBbXTtcbiAgICAgIHZhciBwMCA9IHBlcnNvbm5lcy5sZW5ndGggPiAwID8gcGVyc29ubmVzWzBdIDoge307XG4gICAgICB2YXIgcmF3TlNTID0gbS5udW1lcm9TZWN1cml0ZVNvY2lhbGUgfHwgcDAubnVtZXJvU2VjdXJpdGVTb2NpYWxlIHx8IGMubnNzIHx8IFwiXCI7XG4gICAgICB2YXIgZG9iID0gbS5kYXRlTmFpc3NhbmNlIHx8IHAwLmRhdGVOYWlzc2FuY2UgfHwgby5kYXRlTmFpc3NhbmNlUGF0aWVudCB8fCBjLmRvYiB8fCBcIlwiO1xuICAgICAgdmFyIG5zcyA9IGdldE91dnJhbnREcm9pdE5TUyhyYXdOU1MsIGRvYiwgcGVyc29ubmVzKTtcbiAgICAgIHZhciBub20gPSBtLm5vbSB8fCBwMC5ub20gfHwgby5ub21QYXRpZW50IHx8IGMubm9tIHx8IFwiXCI7XG4gICAgICB2YXIgcHJlbm9tID0gbS5wcmVub20gfHwgcDAucHJlbm9tIHx8IG8ucHJlbm9tUGF0aWVudCB8fCBjLnByZW5vbSB8fCBcIlwiO1xuICAgICAgdmFyIGZpbGxlZCA9IGZhbHNlO1xuXG4gICAgICAvKiBBbG1lcnlzIGEgdW5lIENTUCBzdHJpY3RlIHF1aSBibG9xdWUgbGVzIHNjcmlwdHMgaW5saW5lIChwYWdlRXhlYykuXG4gICAgICAgICB1bHRyYUZpbGwgZGlzcGF0Y2ggZGVzIGV2ZW50cyBuYXRpZnMgKGZvY3VzL2lucHV0L2NoYW5nZS9ibHVyKSBkZXB1aXMgbGVcbiAgICAgICAgIGNvbnRlbnQgc2NyaXB0LiBMZSBjcmFzaCAkLmdyZXAgZCdBbG1lcnlzIGVzdCBkYW5zICQoZG9jdW1lbnQpLnJlYWR5KClcbiAgICAgICAgIGF1IGNoYXJnZW1lbnQgZGUgcGFnZSBcdTIwMTQgUEFTIGxpZSBhIG5vcyBldmVudHMuIExlcyBoYW5kbGVycyBvbmJsdXIgZGVzXG4gICAgICAgICBpbnB1dHMgZGF0ZXMgKHZlcmlmRGF0ZURlbWFuZGUyLzMpIHNvbnQgZGVjbGVuY2hlcyBjb3JyZWN0ZW1lbnQgcGFyIGxlXG4gICAgICAgICBibHVyIG5hdGlmIGRpc3BhdGNoZSBwYXIgdWx0cmFGaWxsLiAqL1xuICAgICAgdmFyIGZpbGxEYXRlID0gZnVuY3Rpb24oZWwsIHZhbCkge1xuICAgICAgICBpZiAoIWVsIHx8IGVsLmRpc2FibGVkIHx8IGVsLnJlYWRPbmx5KSByZXR1cm47XG4gICAgICAgIHZhciBkID0gU3RyaW5nKHZhbCkucmVwbGFjZSgvXFxEL2csIFwiXCIpO1xuICAgICAgICBpZiAoZC5sZW5ndGggPCA4KSByZXR1cm47XG4gICAgICAgIHZhciBmb3JtYXR0ZWQgPSBkLnNsaWNlKDAsMikgKyAnLycgKyBkLnNsaWNlKDIsNCkgKyAnLycgKyBkLnNsaWNlKDQsOCk7XG4gICAgICAgIHVsdHJhRmlsbChlbCwgZm9ybWF0dGVkKTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnNvbGUuaW5mbyhcIltBdWRpQm90IEFsbWVyeXNdIGZvcm11bGFpcmUgXHUyMDE0IGhhc05TUzpcIiwgISFuc3MsIFwiaGFzRG9iOlwiLCAhIWRvYiwgXCJoYXNOb206XCIsICEhbm9tKTtcblxuICAgICAgLyogUGFnZSByZWNoZXJjaGUgYmVuZWZpY2lhaXJlICovXG4gICAgICB2YXIgbm9tQmVuZWYgPSBmaW5kRWxlbWVudFRyYWNrZWQoUE9SVEFMX0tFWSwgXCJub21fYmVuZWZpY2lhaXJlXCIsICcjbm9tX2JlbmVmaWNpYWlyZScpO1xuICAgICAgaWYgKG5vbUJlbmVmKSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhcIltBdWRpQm90IEFsbWVyeXNdIFBhZ2UgcmVjaGVyY2hlIGJlbmVmaWNpYWlyZSBkZXRlY3RlZVwiKTtcbiAgICAgICAgdWx0cmFGaWxsKG5vbUJlbmVmLCBub20udG9VcHBlckNhc2UoKSk7XG4gICAgICAgIHVsdHJhRmlsbChmaW5kRWxlbWVudFRyYWNrZWQoUE9SVEFMX0tFWSwgXCJuc3NfYmVuZWZpY2lhaXJlXCIsICcjbnNzX2JlbmVmaWNpYWlyZScpLCBuc3MpO1xuICAgICAgICBmaWxsZWQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvKiBQb3B1cCBpZnJhbWUgcmVjaGVyY2hlIGJlbmVmaWNpYWlyZSAoY2hhbXBzIGNyaXRfKSAqL1xuICAgICAgdmFyIGNyaXROTkkgPSBmaW5kRWxlbWVudFRyYWNrZWQoUE9SVEFMX0tFWSwgXCJjcml0X251bUluc2VlXCIsICdpbnB1dFtuYW1lPVwiY3JpdF9udW1JbnNlZVwiXScpO1xuICAgICAgaWYgKGNyaXROTkkpIHtcbiAgICAgICAgY29uc29sZS5pbmZvKFwiW0F1ZGlCb3QgQWxtZXJ5c10gUG9wdXAgcmVjaGVyY2hlIGJlbmVmaWNpYWlyZSBkZXRlY3RlZVwiKTtcbiAgICAgICAgdmFyIGVmZmVjdGl2ZU5TUyA9IGdldE91dnJhbnREcm9pdE5TUyhuc3MsIGRvYiwgcGVyc29ubmVzKTtcbiAgICAgICAgdWx0cmFGaWxsKGNyaXROTkksIGVmZmVjdGl2ZU5TUy5yZXBsYWNlKC9cXEQvZywgXCJcIikuc2xpY2UoMCwgMTMpKTtcbiAgICAgICAgdWx0cmFGaWxsKGZpbmRFbGVtZW50VHJhY2tlZChQT1JUQUxfS0VZLCBcImNyaXRfbm9tQmVuZWZcIiwgJ2lucHV0W25hbWU9XCJjcml0X25vbUJlbmVmXCJdJyksIG5vbS50b1VwcGVyQ2FzZSgpKTtcbiAgICAgICAgdWx0cmFGaWxsKGZpbmRFbGVtZW50VHJhY2tlZChQT1JUQUxfS0VZLCBcImNyaXRfcHJlbm9tQmVuZWZcIiwgJ2lucHV0W25hbWU9XCJjcml0X3ByZW5vbUJlbmVmXCJdJyksIGNhcGl0YWxpemUocHJlbm9tKSk7XG4gICAgICAgIGlmIChkb2IpIHVsdHJhRmlsbChmaW5kRWxlbWVudFRyYWNrZWQoUE9SVEFMX0tFWSwgXCJjcml0X2RhdGVOYWlzc2FuY2VFZGl0XCIsICdpbnB1dFtuYW1lPVwiY3JpdF9kYXRlTmFpc3NhbmNlRWRpdFwiXScpLCBkb2IpO1xuICAgICAgICBmaWxsZWQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvKiBQYWdlIFBFQyBPcHRpcXVlIFx1MjAxNCBOTkkgYmVuZWZpY2lhaXJlICovXG4gICAgICB2YXIgbm5pRWwgPSBmaW5kRWxlbWVudFRyYWNrZWQoUE9SVEFMX0tFWSwgXCJudW1JbnNlZVwiLCAnaW5wdXRbbmFtZT1cIm51bUluc2VlXCJdJyk7XG4gICAgICBjb25zb2xlLmluZm8oXCJbQXVkaUJvdCBBbG1lcnlzXSBudW1JbnNlZSB0cm91dmU6XCIsICEhbm5pRWwsIG5uaUVsID8gXCJyZWFkT25seT1cIiArIG5uaUVsLnJlYWRPbmx5IDogXCJcIik7XG4gICAgICBpZiAobm5pRWwgJiYgIW5uaUVsLnJlYWRPbmx5KSB7XG4gICAgICAgIHZhciBlZmZlY3RpdmVOU1MgPSBnZXRPdXZyYW50RHJvaXROU1MobnNzLCBkb2IsIHBlcnNvbm5lcyk7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhcIltBdWRpQm90IEFsbWVyeXNdIEZpbGwgTk5JOiBbUkVEQUNURURdXCIpO1xuICAgICAgICB1bHRyYUZpbGwobm5pRWwsIGVmZmVjdGl2ZU5TUy5yZXBsYWNlKC9cXEQvZywgXCJcIikuc2xpY2UoMCwgMTMpKTtcbiAgICAgICAgZmlsbGVkID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLyogUGFnZSBQRUMgT3B0aXF1ZSBcdTIwMTQgcHJlc2NyaXB0aW9uICovXG4gICAgICB2YXIgZGF0ZU9yZG9FbCA9IGZpbmRFbGVtZW50VHJhY2tlZChQT1JUQUxfS0VZLCBcImRhdGVPcmRvbm5hbmNlRWRpdFwiLCAnaW5wdXRbbmFtZT1cImRhdGVPcmRvbm5hbmNlRWRpdFwiXScpO1xuICAgICAgY29uc29sZS5pbmZvKFwiW0F1ZGlCb3QgQWxtZXJ5c10gZGF0ZU9yZG9ubmFuY2VFZGl0IHRyb3V2ZTpcIiwgISFkYXRlT3Jkb0VsLCBkYXRlT3Jkb0VsID8gXCJkaXNhYmxlZD1cIiArIGRhdGVPcmRvRWwuZGlzYWJsZWQgOiBcIlwiKTtcbiAgICAgIGlmIChkYXRlT3Jkb0VsKSB7XG4gICAgICAgIC8qIERhdGUgZCdvcmRvbm5hbmNlIChzZXVsZW1lbnQgc2kgbGUgY2hhbXAgZXN0IHZpZGUgZXQgcGFzIGRpc2FibGVkKSAqL1xuICAgICAgICBpZiAoIWRhdGVPcmRvRWwuZGlzYWJsZWQgJiYgIWRhdGVPcmRvRWwudmFsdWUpIHtcbiAgICAgICAgICB2YXIgZGF0ZU9yZG8gPSBvLmRhdGVPcmRvbm5hbmNlIHx8IChjLnByZXNjcmlwdGlvbiAmJiBjLnByZXNjcmlwdGlvbi5kYXRlUHJlc2NyaXB0aW9uKSB8fCBcIlwiO1xuICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIltBdWRpQm90IEFsbWVyeXNdIEZpbGwgZGF0ZSBvcmRvOiBbUkVEQUNURURdXCIpO1xuICAgICAgICAgIGlmIChkYXRlT3JkbykgZmlsbERhdGUoZGF0ZU9yZG9FbCwgZGF0ZU9yZG8pO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogRGF0ZSBkZSBkZW1hbmRlID0gYXVqb3VyZCdodWkgKi9cbiAgICAgICAgdmFyIGRhdGVEZW1hbmRlRWwgPSBmaW5kRWxlbWVudFRyYWNrZWQoUE9SVEFMX0tFWSwgXCJkYXRlRGVtYW5kZUVkaXRcIiwgJ2lucHV0W25hbWU9XCJkYXRlRGVtYW5kZUVkaXRcIl0nKTtcbiAgICAgICAgY29uc29sZS5pbmZvKFwiW0F1ZGlCb3QgQWxtZXJ5c10gZGF0ZURlbWFuZGVFZGl0IHRyb3V2ZTpcIiwgISFkYXRlRGVtYW5kZUVsLCBkYXRlRGVtYW5kZUVsID8gXCJkaXNhYmxlZD1cIiArIGRhdGVEZW1hbmRlRWwuZGlzYWJsZWQgOiBcIlwiKTtcbiAgICAgICAgaWYgKGRhdGVEZW1hbmRlRWwgJiYgIWRhdGVEZW1hbmRlRWwuZGlzYWJsZWQgJiYgIWRhdGVEZW1hbmRlRWwudmFsdWUpIHtcbiAgICAgICAgICB2YXIgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgIHZhciBkZCA9IFN0cmluZyh0b2RheS5nZXREYXRlKCkpLnBhZFN0YXJ0KDIsICcwJyk7XG4gICAgICAgICAgdmFyIG1tID0gU3RyaW5nKHRvZGF5LmdldE1vbnRoKCkgKyAxKS5wYWRTdGFydCgyLCAnMCcpO1xuICAgICAgICAgIHZhciB5eXl5ID0gdG9kYXkuZ2V0RnVsbFllYXIoKTtcbiAgICAgICAgICBjb25zb2xlLmluZm8oXCJbQXVkaUJvdCBBbG1lcnlzXSBGaWxsIGRhdGUgZGVtYW5kZTpcIiwgZGQgKyBtbSArIHl5eXkpO1xuICAgICAgICAgIGZpbGxEYXRlKGRhdGVEZW1hbmRlRWwsIGRkICsgbW0gKyB5eXl5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZpbGxlZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIC8qIFBhZ2UgUEVDIE9wdGlxdWUgXHUyMDE0IGNvY2hlciBlcXVpcGVtZW50cyBzZWxvbiBkb25uZWVzIExCTyAqL1xuICAgICAgdmFyIGNiTW9udHVyZSA9IGZpbmRFbGVtZW50VHJhY2tlZChQT1JUQUxfS0VZLCBcInNhaXNpZU1vbnR1cmVcIiwgJ2lucHV0W25hbWU9XCJzYWlzaWVNb250dXJlXCJdJyk7XG4gICAgICBpZiAoY2JNb250dXJlKSB7XG4gICAgICAgIHZhciBlcURhdGEgPSBjLmVxdWlwZW1lbnRzIHx8IFtdO1xuICAgICAgICB2YXIgaGFzTW9udHVyZSA9IGZhbHNlO1xuICAgICAgICB2YXIgaGFzVmVycmUgPSBmYWxzZTtcbiAgICAgICAgdmFyIGhhc1N1cHBsZW1lbnQgPSBmYWxzZTtcbiAgICAgICAgdmFyIGhhc0xlbnRpbGxlID0gZmFsc2U7XG4gICAgICAgIGlmIChlcURhdGEubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGZvciAodmFyIGVpID0gMDsgZWkgPCBlcURhdGEubGVuZ3RoOyBlaSsrKSB7XG4gICAgICAgICAgICB2YXIgbGlnbmVzID0gZXFEYXRhW2VpXS5saWduZXMgfHwgW107XG4gICAgICAgICAgICBmb3IgKHZhciBsaSA9IDA7IGxpIDwgbGlnbmVzLmxlbmd0aDsgbGkrKykge1xuICAgICAgICAgICAgICBpZiAobGlnbmVzW2xpXS50eXBlID09PSAnbW9udHVyZScpIGhhc01vbnR1cmUgPSB0cnVlO1xuICAgICAgICAgICAgICBpZiAobGlnbmVzW2xpXS50eXBlID09PSAndmVycmUnKSBoYXNWZXJyZSA9IHRydWU7XG4gICAgICAgICAgICAgIGlmIChsaWduZXNbbGldLnR5cGUgPT09ICdzdXBwbGVtZW50JykgaGFzU3VwcGxlbWVudCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXFEYXRhW2VpXS50eXBlID09PSAnbGVudGlsbGVzJykgaGFzTGVudGlsbGUgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvKiBQYXMgZGUgZG9ubmVlcyBlcXVpcGVtZW50cyAtPiBjb2NoZXIgbW9udHVyZSArIHZlcnJlcyBwYXIgZGVmYXV0ICovXG4gICAgICAgICAgaGFzTW9udHVyZSA9IHRydWU7XG4gICAgICAgICAgaGFzVmVycmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjYlZlcnJlID0gZmluZEVsZW1lbnRUcmFja2VkKFBPUlRBTF9LRVksIFwic2Fpc2llVmVycmVcIiwgJ2lucHV0W25hbWU9XCJzYWlzaWVWZXJyZVwiXScpO1xuICAgICAgICB2YXIgY2JTdXBwID0gZmluZEVsZW1lbnRUcmFja2VkKFBPUlRBTF9LRVksIFwic2Fpc2llU3VwcGxlbWVudFwiLCAnaW5wdXRbbmFtZT1cInNhaXNpZVN1cHBsZW1lbnRcIl0nKTtcbiAgICAgICAgdmFyIGNiTGVudGlsbGUgPSBmaW5kRWxlbWVudFRyYWNrZWQoUE9SVEFMX0tFWSwgXCJzYWlzaWVMZW50aWxsZVwiLCAnaW5wdXRbbmFtZT1cInNhaXNpZUxlbnRpbGxlXCJdJyk7XG4gICAgICAgIGlmIChjYk1vbnR1cmUgJiYgaGFzTW9udHVyZSAmJiAhY2JNb250dXJlLmNoZWNrZWQgJiYgIWNiTW9udHVyZS5kaXNhYmxlZCkgY2JNb250dXJlLmNsaWNrKCk7XG4gICAgICAgIGlmIChjYlZlcnJlICYmIGhhc1ZlcnJlICYmICFjYlZlcnJlLmNoZWNrZWQgJiYgIWNiVmVycmUuZGlzYWJsZWQpIGNiVmVycmUuY2xpY2soKTtcbiAgICAgICAgaWYgKGNiU3VwcCAmJiBoYXNTdXBwbGVtZW50ICYmICFjYlN1cHAuY2hlY2tlZCAmJiAhY2JTdXBwLmRpc2FibGVkKSBjYlN1cHAuY2xpY2soKTtcbiAgICAgICAgaWYgKGNiTGVudGlsbGUgJiYgaGFzTGVudGlsbGUgJiYgIWNiTGVudGlsbGUuY2hlY2tlZCAmJiAhY2JMZW50aWxsZS5kaXNhYmxlZCkgY2JMZW50aWxsZS5jbGljaygpO1xuICAgICAgICBmaWxsZWQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvKiBcdTI1MDBcdTI1MDAgUGFnZSAyIDogRXF1aXBlbWVudHMgZGV0YWlsbGVzIChHZXJlclBlY09wdGlxdWUuZG8pIFx1MjUwMFx1MjUwMFxuICAgICAgICAgSU1QT1JUQU5UIDogTkUgUEFTIHV0aWxpc2VyIHVsdHJhRmlsbCBpY2kuIEFsbWVyeXMgYSBkZXMgaGFuZGxlcnNcbiAgICAgICAgIG9uY2hhbmdlIHN1ciBjZXJ0YWlucyBjaGFtcHMgKG51bUFNUHJlc2NyaXB0ZXVyIC0+IHJlY2hlcmNoZVByZXNjcmlwdGV1cigpXG4gICAgICAgICAtPiBkaXNwYXRjaGVyKCkgLT4gZm9ybS5zdWJtaXQoKSkuIHVsdHJhRmlsbCBkaXNwYXRjaCBjaGFuZ2UvYmx1clxuICAgICAgICAgY2UgcXVpIGRlY2xlbmNoZSBsZSBzdWJtaXQgZXQgdmlkZSB0b3V0LlxuICAgICAgICAgT24gZWNyaXQgbGEgdmFsZXVyIHNpbGVuY2lldXNlbWVudCBzYW5zIGV2ZW5lbWVudHMuICovXG4gICAgICB2YXIgUFJFRklYID0gXCJnZXJlclBlY09wdGlxdWVFbGVtZW50WzBdLlwiO1xuICAgICAgdmFyIGFsRmlsbCA9IGZ1bmN0aW9uKG5hbWUsIHZhbCkge1xuICAgICAgICBpZiAoIXZhbCkgcmV0dXJuO1xuICAgICAgICB2YXIgZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbbmFtZT1cIicgKyBQUkVGSVggKyBuYW1lICsgJ1wiXScpO1xuICAgICAgICBpZiAoZWwgJiYgIWVsLmRpc2FibGVkICYmICFlbC5yZWFkT25seSAmJiAhKGVsLnZhbHVlIHx8IFwiXCIpLnRyaW0oKSkgeyBlbC52YWx1ZSA9IFN0cmluZyh2YWwpOyBmaWxsZWQgPSB0cnVlOyB9XG4gICAgICB9O1xuXG4gICAgICB2YXIgcHJlc2NFbCA9IGZpbmRFbGVtZW50VHJhY2tlZChQT1JUQUxfS0VZLCBcIm51bUFNUHJlc2NyaXB0ZXVyXCIsICdbbmFtZT1cIicgKyBQUkVGSVggKyAnbnVtQU1QcmVzY3JpcHRldXJcIl0nKTtcbiAgICAgIGlmIChwcmVzY0VsKSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhcIltBdWRpQm90IEFsbWVyeXNdIFBhZ2UgMiBlcXVpcGVtZW50cyBkZXRlY3RlZVwiKTtcblxuICAgICAgICAvKiBQcmVzY3JpcHRldXIgUlBQUy9BREVMSSAqL1xuICAgICAgICB2YXIgcnBwcyA9IChvICYmIG8ucnBwcykgfHwgKGMucHJlc2NyaXB0aW9uICYmIGMucHJlc2NyaXB0aW9uLnJwcHMpIHx8IFwiXCI7XG4gICAgICAgIGlmIChycHBzKSBhbEZpbGwoXCJudW1BTVByZXNjcmlwdGV1clwiLCBycHBzLnJlcGxhY2UoL1xcRC9nLCBcIlwiKS5zbGljZSgwLCA5KSk7XG5cbiAgICAgICAgLyogTW9udHVyZSAqL1xuICAgICAgICB2YXIgZXFEYXRhID0gYy5lcXVpcGVtZW50cyB8fCBbXTtcbiAgICAgICAgdmFyIG1vbnR1cmVMaWduZSA9IG51bGwsIHZlcnJlT0QgPSBudWxsLCB2ZXJyZU9HID0gbnVsbDtcbiAgICAgICAgZm9yICh2YXIgZWkyID0gMDsgZWkyIDwgZXFEYXRhLmxlbmd0aDsgZWkyKyspIHtcbiAgICAgICAgICB2YXIgbGlnbmVzMiA9IGVxRGF0YVtlaTJdLmxpZ25lcyB8fCBbXTtcbiAgICAgICAgICBmb3IgKHZhciBsaTIgPSAwOyBsaTIgPCBsaWduZXMyLmxlbmd0aDsgbGkyKyspIHtcbiAgICAgICAgICAgIHZhciBsaWduZSA9IGxpZ25lczJbbGkyXTtcbiAgICAgICAgICAgIGlmIChsaWduZS50eXBlID09PSBcIm1vbnR1cmVcIiAmJiAhbW9udHVyZUxpZ25lKSBtb250dXJlTGlnbmUgPSBsaWduZTtcbiAgICAgICAgICAgIGlmIChsaWduZS50eXBlID09PSBcInZlcnJlXCIgJiYgbGlnbmUub2VpbCA9PT0gXCJPRFwiICYmICF2ZXJyZU9EKSB2ZXJyZU9EID0gbGlnbmU7XG4gICAgICAgICAgICBpZiAobGlnbmUudHlwZSA9PT0gXCJ2ZXJyZVwiICYmIGxpZ25lLm9laWwgPT09IFwiT0dcIiAmJiAhdmVycmVPRykgdmVycmVPRyA9IGxpZ25lO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtb250dXJlTGlnbmUpIHtcbiAgICAgICAgICBpZiAobW9udHVyZUxpZ25lLmNvZGVMUFApIGFsRmlsbChcImNvZGVMUFBNb250dXJlXCIsIG1vbnR1cmVMaWduZS5jb2RlTFBQKTtcbiAgICAgICAgICBpZiAobW9udHVyZUxpZ25lLnByaXhCcnV0KSBhbEZpbGwoXCJwcml4QnJ1dE1vbnR1cmVcIiwgU3RyaW5nKG1vbnR1cmVMaWduZS5wcml4QnJ1dCkucmVwbGFjZShcIi5cIiwgXCIsXCIpKTtcbiAgICAgICAgICBpZiAobW9udHVyZUxpZ25lLnJlbWlzZSkgYWxGaWxsKFwicHJpeFJlbWlzZU1vbnR1cmVcIiwgU3RyaW5nKG1vbnR1cmVMaWduZS5yZW1pc2UpLnJlcGxhY2UoXCIuXCIsIFwiLFwiKSk7XG4gICAgICAgICAgaWYgKG1vbnR1cmVMaWduZS5kZXNpZ25hdGlvbikge1xuICAgICAgICAgICAgdmFyIHBhcnRzID0gbW9udHVyZUxpZ25lLmRlc2lnbmF0aW9uLnNwbGl0KFwiL1wiKTtcbiAgICAgICAgICAgIGFsRmlsbChcIm1hcnF1ZU1vbnR1cmVcIiwgKHBhcnRzWzBdIHx8IFwiXCIpLnRyaW0oKSk7XG4gICAgICAgICAgICBpZiAocGFydHNbMV0pIGFsRmlsbChcIm1vZGVsZU1vbnR1cmVcIiwgcGFydHNbMV0udHJpbSgpKTtcbiAgICAgICAgICAgIGFsRmlsbChcInJlZmVyZW5jZU1vbnR1cmVcIiwgbW9udHVyZUxpZ25lLmRlc2lnbmF0aW9uKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiBWZXJyZSBPRCAqL1xuICAgICAgICBpZiAodmVycmVPRCAmJiB2ZXJyZU9ELmNvZGVMUFApIGFsRmlsbChcImNvZGVMUFBWZXJyZURyb2l0XCIsIHZlcnJlT0QuY29kZUxQUCk7XG4gICAgICAgIC8qIFZlcnJlIE9HICovXG4gICAgICAgIGlmICh2ZXJyZU9HICYmIHZlcnJlT0cuY29kZUxQUCkgYWxGaWxsKFwiY29kZUxQUFZlcnJlR2F1Y2hlXCIsIHZlcnJlT0cuY29kZUxQUCk7XG5cbiAgICAgICAgLyogQ29ycmVjdGlvbiBcdTIwMTQgZGVwdWlzIG9yZG9ubmFuY2Ugb3UgcHJlc2NyaXB0aW9uIGNhY2hlZCAqL1xuICAgICAgICB2YXIgb2QgPSAobyAmJiBvLmx1bmV0dGVzT0QpIHx8IChjLnByZXNjcmlwdGlvbiAmJiBjLnByZXNjcmlwdGlvbi5vZCkgfHwge307XG4gICAgICAgIHZhciBvZyA9IChvICYmIG8ubHVuZXR0ZXNPRykgfHwgKGMucHJlc2NyaXB0aW9uICYmIGMucHJlc2NyaXB0aW9uLm9nKSB8fCB7fTtcbiAgICAgICAgaWYgKG9kLnNwaGVyZSkgYWxGaWxsKFwic3BoZXJlVmVycmVEcm9pdFwiLCBvZC5zcGhlcmUpO1xuICAgICAgICBpZiAob2QuY3lsaW5kcmUpIGFsRmlsbChcImN5bGluZHJlVmVycmVEcm9pdFwiLCBvZC5jeWxpbmRyZSk7XG4gICAgICAgIGlmIChvZC5heGUpIGFsRmlsbChcImF4ZVZlcnJlRHJvaXRcIiwgb2QuYXhlKTtcbiAgICAgICAgaWYgKG9kLmFkZGl0aW9uKSBhbEZpbGwoXCJhZGRpdGlvblZlcnJlRHJvaXRcIiwgb2QuYWRkaXRpb24pO1xuICAgICAgICBpZiAob2cuc3BoZXJlKSBhbEZpbGwoXCJzcGhlcmVWZXJyZUdhdWNoZVwiLCBvZy5zcGhlcmUpO1xuICAgICAgICBpZiAob2cuY3lsaW5kcmUpIGFsRmlsbChcImN5bGluZHJlVmVycmVHYXVjaGVcIiwgb2cuY3lsaW5kcmUpO1xuICAgICAgICBpZiAob2cuYXhlKSBhbEZpbGwoXCJheGVWZXJyZUdhdWNoZVwiLCBvZy5heGUpO1xuICAgICAgICBpZiAob2cuYWRkaXRpb24pIGFsRmlsbChcImFkZGl0aW9uVmVycmVHYXVjaGVcIiwgb2cuYWRkaXRpb24pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmlsbGVkO1xuICAgIH0sXG4gICAgc3luY2hyb25pc2VyOiBhc3luYyAoKSA9PiBmYWxzZVxuICB9XG59O1xuIiwgImV4cG9ydCBkZWZhdWx0IHtcbiAgbmFtZTogXCJPeGFudGlzXCIsXG4gIGlzTWF0Y2g6ICgpID0+IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZS5pbmNsdWRlcyhcIm94YW50aXMubmV0XCIpLFxuICBhY3Rpb25zOiB7XG4gICAgZm9ybXVsYWlyZTogKGRhdGEpID0+IHtcbiAgICAgIHZhciBtID0gZGF0YS5tIHx8IHt9O1xuICAgICAgdmFyIG8gPSBkYXRhLm8gfHwge307XG4gICAgICB2YXIgYyA9IGRhdGEuY2FjaGVkIHx8IHt9O1xuICAgICAgdmFyIHBlcnNvbm5lcyA9IG0ucGVyc29ubmVzIHx8IFtdO1xuICAgICAgdmFyIHAwID0gcGVyc29ubmVzLmxlbmd0aCA+IDAgPyBwZXJzb25uZXNbMF0gOiB7fTtcblxuICAgICAgdmFyIG5vbSA9IChtLm5vbSB8fCBwMC5ub20gfHwgby5ub21QYXRpZW50IHx8IGMubm9tIHx8IFwiXCIpLnRvVXBwZXJDYXNlKCk7XG4gICAgICB2YXIgcHJlbm9tID0gbS5wcmVub20gfHwgcDAucHJlbm9tIHx8IG8ucHJlbm9tUGF0aWVudCB8fCBjLnByZW5vbSB8fCBcIlwiO1xuXG4gICAgICB2YXIgZm91bmROU1MgPSBtLm51bWVyb1NlY3VyaXRlU29jaWFsZSB8fCBcIlwiO1xuICAgICAgaWYgKCFmb3VuZE5TUykge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBlcnNvbm5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciBwTlNTID0gKHBlcnNvbm5lc1tpXS5udW1lcm9TZWN1cml0ZVNvY2lhbGUgfHwgXCJcIikucmVwbGFjZSgvXFxEL2csIFwiXCIpO1xuICAgICAgICAgIGlmIChwTlNTLmxlbmd0aCA+PSAxMykgeyBmb3VuZE5TUyA9IHBlcnNvbm5lc1tpXS5udW1lcm9TZWN1cml0ZVNvY2lhbGU7IGJyZWFrOyB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciBmb3VuZERPQiA9IG0uZGF0ZU5haXNzYW5jZSB8fCBcIlwiO1xuICAgICAgaWYgKCFmb3VuZERPQikge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBlcnNvbm5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChwZXJzb25uZXNbaV0uZGF0ZU5haXNzYW5jZSkgeyBmb3VuZERPQiA9IHBlcnNvbm5lc1tpXS5kYXRlTmFpc3NhbmNlOyBicmVhazsgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YXIgbnNzID0gKGZvdW5kTlNTIHx8IGMubnNzIHx8IFwiXCIpLnJlcGxhY2UoL1xccy9nLCBcIlwiKTtcbiAgICAgIHZhciBkb2IgPSBmb3VuZERPQiB8fCBvLmRhdGVOYWlzc2FuY2VQYXRpZW50IHx8IGMuZG9iIHx8IFwiXCI7XG4gICAgICB2YXIgZWZmZWN0aXZlTlNTID0gZ2V0T3V2cmFudERyb2l0TlNTKG5zcywgZG9iLCBwZXJzb25uZXMpO1xuICAgICAgdmFyIGRpZ2l0cyA9IGVmZmVjdGl2ZU5TUy5yZXBsYWNlKC9cXEQvZywgXCJcIikuc2xpY2UoMCwgMTUpO1xuXG4gICAgICB2YXIgZmlsbGVkID0gZmFsc2U7XG5cbiAgICAgIC8qIFBhZ2UgaGlzdG9yaXF1ZSBkb3NzaWVycyAoZm9ybSBuYW1lPVwicGVjXCIpIDogbnVtU3MsIG5vbUFzc3VyZSwgcHJlbm9tQXNzdXJlICovXG4gICAgICB2YXIgbnVtU3NFbCA9IGZpbmRFbGVtZW50KCdbbmFtZT1cIm51bVNzXCJdJyk7XG4gICAgICBpZiAobnVtU3NFbCkge1xuICAgICAgICBpZiAoZGlnaXRzKSB7IHVsdHJhRmlsbChudW1Tc0VsLCBkaWdpdHMpOyBmaWxsZWQgPSB0cnVlOyB9XG4gICAgICAgIGlmIChub20pIHsgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCdbbmFtZT1cIm5vbUFzc3VyZVwiXScpLCBub20pOyBmaWxsZWQgPSB0cnVlOyB9XG4gICAgICAgIGlmIChwcmVub20pIHsgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCdbbmFtZT1cInByZW5vbUFzc3VyZVwiXScpLCBjYXBpdGFsaXplKHByZW5vbSkpOyBmaWxsZWQgPSB0cnVlOyB9XG4gICAgICAgIHJldHVybiBmaWxsZWQ7XG4gICAgICB9XG5cbiAgICAgIC8qIFBhZ2UgYlx1MDBFOW5cdTAwRTlmaWNpYWlyZSBEUEVDIChmb3JtIG5hbWU9XCJzZWFyY2hcIikgOiBudW1TZWN1LCBkYXRlTmFpc0pqL01tL0FhLCByYW5nTmFpcyAqL1xuICAgICAgdmFyIG51bVNlY3VFbCA9IGZpbmRFbGVtZW50KCdbbmFtZT1cIm51bVNlY3VcIl0nKTtcbiAgICAgIGlmIChudW1TZWN1RWwpIHtcbiAgICAgICAgaWYgKGRpZ2l0cykgeyB1bHRyYUZpbGwobnVtU2VjdUVsLCBkaWdpdHMpOyBmaWxsZWQgPSB0cnVlOyB9XG5cbiAgICAgICAgLyogRGF0ZSBkZSBuYWlzc2FuY2UgXHUwMEU5Y2xhdFx1MDBFOWUgZW4gSkogLyBNTSAvIEFBQUEgKi9cbiAgICAgICAgaWYgKGRvYikge1xuICAgICAgICAgIHZhciBwYXJ0cyA9IGRvYi5tYXRjaCgvKFxcZHsyfSlbXFwvXFwtXShcXGR7Mn0pW1xcL1xcLV0oXFxkezR9KS8pO1xuICAgICAgICAgIGlmIChwYXJ0cykge1xuICAgICAgICAgICAgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCdbbmFtZT1cImRhdGVOYWlzSmpcIl0nKSwgcGFydHNbMV0pO1xuICAgICAgICAgICAgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCdbbmFtZT1cImRhdGVOYWlzTW1cIl0nKSwgcGFydHNbMl0pO1xuICAgICAgICAgICAgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCdbbmFtZT1cImRhdGVOYWlzQWFcIl0nKSwgcGFydHNbM10pO1xuICAgICAgICAgICAgZmlsbGVkID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiBSYW5nIGRlIG5haXNzYW5jZSAqL1xuICAgICAgICB2YXIgcmFuZyA9IGMucmFuZ05haXNzYW5jZSB8fCBcIlwiO1xuICAgICAgICBpZiAocmFuZykge1xuICAgICAgICAgIHZhciByYW5nRWwgPSBmaW5kRWxlbWVudCgnW25hbWU9XCJyYW5nTmFpc1wiXScpO1xuICAgICAgICAgIGlmIChyYW5nRWwpIHsgcmFuZ0VsLnZhbHVlID0gcmFuZzsgcmFuZ0VsLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjaGFuZ2UnLCB7IGJ1YmJsZXM6IHRydWUgfSkpOyBmaWxsZWQgPSB0cnVlOyB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmlsbGVkO1xuICAgICAgfVxuXG4gICAgICAvKiBQYWdlIGRvc3NpZXIgLyBpbmZvcyBhZG1pbmlzdHJhdGl2ZXMgKGZvcm0gbmFtZT1cImRvc3NpZXJcIikgOiBkYXRlIHByZXNjcmlwdGlvbiArIHR5cGUgXHUwMEU5cXVpcGVtZW50ICovXG4gICAgICB2YXIgam91clByZXNjRWwgPSBmaW5kRWxlbWVudCgnW25hbWU9XCJqb3VyUHJlc2NyaXB0aW9uXCJdJyk7XG4gICAgICBpZiAoam91clByZXNjRWwpIHtcbiAgICAgICAgdmFyIGRhdGVPcmRvID0gby5kYXRlT3Jkb25uYW5jZSB8fCAoYy5wcmVzY3JpcHRpb24gJiYgYy5wcmVzY3JpcHRpb24uZGF0ZVByZXNjcmlwdGlvbikgfHwgXCJcIjtcbiAgICAgICAgaWYgKGRhdGVPcmRvKSB7XG4gICAgICAgICAgdmFyIHBhcnRzID0gZGF0ZU9yZG8ubWF0Y2goLyhcXGR7Mn0pW1xcL1xcLV0oXFxkezJ9KVtcXC9cXC1dKFxcZHs0fSkvKTtcbiAgICAgICAgICBpZiAocGFydHMpIHtcbiAgICAgICAgICAgIHVsdHJhRmlsbChqb3VyUHJlc2NFbCwgcGFydHNbMV0pO1xuICAgICAgICAgICAgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCdbbmFtZT1cIm1vaXNQcmVzY3JpcHRpb25cIl0nKSwgcGFydHNbMl0pO1xuICAgICAgICAgICAgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCdbbmFtZT1cImFubmVlUHJlc2NyaXB0aW9uXCJdJyksIHBhcnRzWzNdKTtcbiAgICAgICAgICAgIGZpbGxlZCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyogVHlwZSBkJ1x1MDBFOXF1aXBlbWVudCA6IEx1bmV0dGVzIG91IExlbnRpbGxlcyAqL1xuICAgICAgICB2YXIgaGFzTGVudGlsbGVzID0gKG8ubGVudGlsbGVzT0QgJiYgby5sZW50aWxsZXNPRC5zcGhlcmUpIHx8IChvLmxlbnRpbGxlc09HICYmIG8ubGVudGlsbGVzT0cuc3BoZXJlKTtcbiAgICAgICAgdmFyIHJhZGlvcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tuYW1lPVwiRXF1aXBlbWVudFwiXScpO1xuICAgICAgICBmb3IgKHZhciByaSA9IDA7IHJpIDwgcmFkaW9zLmxlbmd0aDsgcmkrKykge1xuICAgICAgICAgIGlmIChoYXNMZW50aWxsZXMgJiYgcmFkaW9zW3JpXS52YWx1ZSA9PT0gXCJMZW50aWxsZXNcIikgeyByYWRpb3NbcmldLmNsaWNrKCk7IGZpbGxlZCA9IHRydWU7IH1cbiAgICAgICAgICBpZiAoIWhhc0xlbnRpbGxlcyAmJiByYWRpb3NbcmldLnZhbHVlID09PSBcIkx1bmV0dGVzXCIpIHsgcmFkaW9zW3JpXS5jbGljaygpOyBmaWxsZWQgPSB0cnVlOyB9XG4gICAgICAgIH1cbiAgICAgICAgLyogTWV0dHJlIFx1MDBFMCBqb3VyIGxlIGhpZGRlbiB0eXBlRXF1aXBlbWVudCAqL1xuICAgICAgICB2YXIgdHlwZUVxRWwgPSBmaW5kRWxlbWVudCgnI3R5cGVFcXVpcGVtZW50Jyk7XG4gICAgICAgIGlmICh0eXBlRXFFbCkgdHlwZUVxRWwudmFsdWUgPSBoYXNMZW50aWxsZXMgPyBcImxlbnRpbGxlc1wiIDogXCJMdW5ldHRlc1wiO1xuXG4gICAgICAgIHJldHVybiBmaWxsZWQ7XG4gICAgICB9XG5cbiAgICAgIC8qIFBhZ2UgRFBFQyBjb3JyZWN0aW9uIHZpc3VlbGxlIChmb3JtIG5hbWU9XCJkcGVjT3B0XCIpICovXG4gICAgICB2YXIgZHBlY0Zvcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdmb3JtW25hbWU9XCJkcGVjT3B0XCJdJyk7XG4gICAgICBpZiAoZHBlY0Zvcm0pIHtcbiAgICAgICAgLyogUHJlc2NyaXB0ZXVyICovXG4gICAgICAgIHZhciBwcmVzY0Z1bGxOYW1lID0gKGMucHJlc2NyaXB0aW9uICYmIGMucHJlc2NyaXB0aW9uLnByZXNjcmlwdGV1cikgfHwgXCJcIjtcbiAgICAgICAgaWYgKHByZXNjRnVsbE5hbWUpIHtcbiAgICAgICAgICB2YXIgcHJlc2NQYXJ0cyA9IHByZXNjRnVsbE5hbWUuc3BsaXQoL1xccysvKTtcbiAgICAgICAgICB2YXIgcHJlc2NOb20gPSBwcmVzY1BhcnRzLmxlbmd0aCA+IDEgPyBwcmVzY1BhcnRzLnNsaWNlKDEpLmpvaW4oXCIgXCIpIDogcHJlc2NQYXJ0c1swXSB8fCBcIlwiO1xuICAgICAgICAgIHZhciBwcmVzY1ByZW5vbSA9IHByZXNjUGFydHMubGVuZ3RoID4gMSA/IHByZXNjUGFydHNbMF0gOiBcIlwiO1xuICAgICAgICAgIHVsdHJhRmlsbChmaW5kRWxlbWVudCgnW25hbWU9XCJub21QcmVzY3JpcHRldXJcIl0nKSwgcHJlc2NOb20udG9VcHBlckNhc2UoKSk7XG4gICAgICAgICAgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCdbbmFtZT1cInByZW5vbVByZXNjcmlwdGV1clwiXScpLCBjYXBpdGFsaXplKHByZXNjUHJlbm9tKSk7XG4gICAgICAgICAgZmlsbGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIFJQUFMgLyBBREVMSSAoY2hhbXAgZmluZXNzUHJlc2NyaXB0ZXVyLCBtYXhsZW5ndGggOSkgKi9cbiAgICAgICAgdmFyIHJwcHMgPSBvLnJwcHMgfHwgKGMucHJlc2NyaXB0aW9uICYmIGMucHJlc2NyaXB0aW9uLnJwcHMpIHx8IFwiXCI7XG4gICAgICAgIGlmIChycHBzKSB7XG4gICAgICAgICAgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCdbbmFtZT1cImZpbmVzc1ByZXNjcmlwdGV1clwiXScpLCBycHBzLnJlcGxhY2UoL1xcRC9nLCBcIlwiKS5zbGljZSgwLCA5KSk7XG4gICAgICAgICAgZmlsbGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIFR5cGUgZGUgcHJlc2NyaXB0aW9uIDogcHJlbWlcdTAwRThyZSBkXHUwMEU5bGl2cmFuY2UgcGFyIGRcdTAwRTlmYXV0ICovXG4gICAgICAgIHZhciBmaXJzdFJhZGlvID0gZmluZEVsZW1lbnQoJ1tuYW1lPVwicHJlc2NyaXB0aW9uU2VsZWN0aW9uXCJdW3ZhbHVlPVwiZmlyc3RcIl0nKTtcbiAgICAgICAgaWYgKGZpcnN0UmFkaW8gJiYgIWZpcnN0UmFkaW8uY2hlY2tlZCkge1xuICAgICAgICAgIGZpcnN0UmFkaW8uY2xpY2soKTtcbiAgICAgICAgICBmaWxsZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogVGllcnMgcGF5YW50IFJPIDogY29jaGVyIE9VSSBwYXIgZFx1MDBFOWZhdXQgKi9cbiAgICAgICAgdmFyIHRwT3VpUmFkaW8gPSBmaW5kRWxlbWVudCgnW25hbWU9XCJvcHRUUFJlZ2ltZU9ibGlnYXRvaXJlXCJdW3ZhbHVlPVwiT1VJXCJdJyk7XG4gICAgICAgIGlmICh0cE91aVJhZGlvICYmICF0cE91aVJhZGlvLmNoZWNrZWQpIHtcbiAgICAgICAgICB0cE91aVJhZGlvLmNsaWNrKCk7XG4gICAgICAgICAgZmlsbGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIENvbnRhY3QgOiB0XHUwMEU5bFx1MDBFOXBob25lLCBlbWFpbCAqL1xuICAgICAgICB2YXIgcGhvbmVWYWwgPSBub3JtYWxpemVQaG9uZShjLnBob25lIHx8IFwiXCIpO1xuICAgICAgICBpZiAocGhvbmVWYWwpIHsgdWx0cmFGaWxsKGZpbmRFbGVtZW50KCdbbmFtZT1cImRldmlzVGVsZXBob25lXCJdJyksIHBob25lVmFsKTsgZmlsbGVkID0gdHJ1ZTsgfVxuICAgICAgICB2YXIgZW1haWxWYWwgPSBjLmVtYWlsIHx8IFwiXCI7XG4gICAgICAgIGlmIChlbWFpbFZhbCkge1xuICAgICAgICAgIC8qIEFjdGl2ZXIgbGEgc2VjdGlvbiBlbWFpbCAocmFkaW8gbWFpbHBlcnNvbm5lbCA9IE9VSSkgc2kgZWxsZSBlc3QgY2FjaFx1MDBFOWUgKi9cbiAgICAgICAgICB2YXIgbWFpbE91aVJhZGlvID0gZmluZEVsZW1lbnQoJyNtYWlscGVyc29ubmVsJyk7XG4gICAgICAgICAgaWYgKG1haWxPdWlSYWRpbyAmJiAhbWFpbE91aVJhZGlvLmNoZWNrZWQpIHtcbiAgICAgICAgICAgIG1haWxPdWlSYWRpby5jbGljaygpO1xuICAgICAgICAgICAgLyogQXBwZWxlciBsYSBmb25jdGlvbiBPeGFudGlzIHBvdXIgcmVuZHJlIHZpc2libGUgbGUgZGl2IGVtYWlsICovXG4gICAgICAgICAgICBpZiAodHlwZW9mIGFmZmljaGVybWFpbHBlcnNvbm5lbCA9PT0gJ2Z1bmN0aW9uJykgYWZmaWNoZXJtYWlscGVyc29ubmVsKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHVsdHJhRmlsbChmaW5kRWxlbWVudCgnW25hbWU9XCJkZXZpc0VtYWlsXCJdJyksIGVtYWlsVmFsKTtcbiAgICAgICAgICB1bHRyYUZpbGwoZmluZEVsZW1lbnQoJ1tuYW1lPVwiZGV2aXNFbWFpbENvbmZpcm1hdGlvblwiXScpLCBlbWFpbFZhbCk7XG4gICAgICAgICAgZmlsbGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIENvcnJlY3Rpb24gT0QgLyBPRyAqL1xuICAgICAgICB2YXIgb2QgPSAoby5sdW5ldHRlc09EKSB8fCAoYy5wcmVzY3JpcHRpb24gJiYgYy5wcmVzY3JpcHRpb24ub2QpIHx8IHt9O1xuICAgICAgICB2YXIgb2cgPSAoby5sdW5ldHRlc09HKSB8fCAoYy5wcmVzY3JpcHRpb24gJiYgYy5wcmVzY3JpcHRpb24ub2cpIHx8IHt9O1xuXG4gICAgICAgIC8qIERcdTAwRTl0ZXJtaW5lciBsZSB0eXBlIGRlIHZpc2lvbiA6IHNpIGFkZGl0aW9uID4gMCBcdTIxOTIgcHJvZ3Jlc3NpZnMgKDQpLCBzaW5vbiBsb2luICgxKSAqL1xuICAgICAgICB2YXIgYWRkT0QgPSBwYXJzZUZsb2F0KG9kLmFkZGl0aW9uKSB8fCAwO1xuICAgICAgICB2YXIgYWRkT0cgPSBwYXJzZUZsb2F0KG9nLmFkZGl0aW9uKSB8fCAwO1xuICAgICAgICB2YXIgdmlzaW9uVmFsID0gKGFkZE9EID4gMCB8fCBhZGRPRyA+IDApID8gXCI0XCIgOiBcIjFcIjtcblxuICAgICAgICB2YXIgdmlzaW9uT0RFbCA9IGZpbmRFbGVtZW50KCdbbmFtZT1cInZpc2lvblR5cGVPRFwiXScpO1xuICAgICAgICBpZiAodmlzaW9uT0RFbCkge1xuICAgICAgICAgIHZpc2lvbk9ERWwudmFsdWUgPSB2aXNpb25WYWw7XG4gICAgICAgICAgdmlzaW9uT0RFbC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2hhbmdlJywgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgICAgICAgICBmaWxsZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHZhciB2aXNpb25PR0VsID0gZmluZEVsZW1lbnQoJ1tuYW1lPVwidmlzaW9uVHlwZU9HXCJdJyk7XG4gICAgICAgIGlmICh2aXNpb25PR0VsKSB7XG4gICAgICAgICAgdmlzaW9uT0dFbC52YWx1ZSA9IHZpc2lvblZhbDtcbiAgICAgICAgICB2aXNpb25PR0VsLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjaGFuZ2UnLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgICAgICAgIGZpbGxlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBBY3RpdmVyIGxlcyBjaGFtcHMgZGUgY29ycmVjdGlvbiAoZGlzYWJsZWQgcGFyIGRcdTAwRTlmYXV0KSBwdWlzIHJlbXBsaXIgKi9cbiAgICAgICAgdmFyIGNvcnJGaWVsZHMgPSBbXG4gICAgICAgICAgWyd2aXNpb25zWzBdLmxvZFNwaGVyZScsIG9kLnNwaGVyZV0sXG4gICAgICAgICAgWyd2aXNpb25zWzBdLmxvZEN5bGluZHJlJywgb2QuY3lsaW5kcmVdLFxuICAgICAgICAgIFsndmlzaW9uc1swXS5heGVPZCcsIG9kLmF4ZV0sXG4gICAgICAgICAgWyd2aXNpb25zWzBdLmxvZEFkZGl0aW9uJywgb2QuYWRkaXRpb25dLFxuICAgICAgICAgIFsndmlzaW9uc1swXS5sb2dTcGhlcmUnLCBvZy5zcGhlcmVdLFxuICAgICAgICAgIFsndmlzaW9uc1swXS5sb2dDeWxpbmRyZScsIG9nLmN5bGluZHJlXSxcbiAgICAgICAgICBbJ3Zpc2lvbnNbMF0uYXhlT2cnLCBvZy5heGVdLFxuICAgICAgICAgIFsndmlzaW9uc1swXS5sb2dBZGRpdGlvbicsIG9nLmFkZGl0aW9uXVxuICAgICAgICBdO1xuICAgICAgICBmb3IgKHZhciBjaSA9IDA7IGNpIDwgY29yckZpZWxkcy5sZW5ndGg7IGNpKyspIHtcbiAgICAgICAgICB2YXIgZmllbGROYW1lID0gY29yckZpZWxkc1tjaV1bMF07XG4gICAgICAgICAgdmFyIGZpZWxkVmFsID0gY29yckZpZWxkc1tjaV1bMV07XG4gICAgICAgICAgaWYgKCFmaWVsZFZhbCkgY29udGludWU7XG4gICAgICAgICAgdmFyIGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW25hbWU9XCInICsgZmllbGROYW1lICsgJ1wiXScpO1xuICAgICAgICAgIGlmIChlbCkge1xuICAgICAgICAgICAgaWYgKGVsLmRpc2FibGVkKSBlbC5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgdWx0cmFGaWxsKGVsLCBmaWVsZFZhbCk7XG4gICAgICAgICAgICBmaWxsZWQgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmaWxsZWQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuICAgIHN5bmNocm9uaXNlcjogYXN5bmMgKCkgPT4gZmFsc2VcbiAgfVxufTtcbiIsICJ2YXIgUE9SVEFMX0tFWSA9IFwicHJvLmlzbS10cC5mclwiO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIG5hbWU6IFwiSXRlbGlzXCIsXG4gIGlzTWF0Y2g6ICgpID0+IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZS5pbmNsdWRlcyhcImlzbS10cC5mclwiKSB8fCB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUuaW5jbHVkZXMoXCJpdGVsaXMuZnJcIiksXG4gIGFjdGlvbnM6IHtcbiAgICBmb3JtdWxhaXJlOiAoZGF0YSkgPT4ge1xuICAgICAgdmFyIG0gPSBkYXRhLm0gfHwge307XG4gICAgICB2YXIgbyA9IGRhdGEubyB8fCB7fTtcbiAgICAgIHZhciBjID0gZGF0YS5jYWNoZWQgfHwge307XG4gICAgICB2YXIgcGVyc29ubmVzID0gbS5wZXJzb25uZXMgfHwgW107XG4gICAgICB2YXIgcDAgPSBwZXJzb25uZXMubGVuZ3RoID4gMCA/IHBlcnNvbm5lc1swXSA6IHt9O1xuICAgICAgdmFyIG5vbSA9IG0ubm9tIHx8IHAwLm5vbSB8fCBvLm5vbVBhdGllbnQgfHwgYy5ub20gfHwgXCJcIjtcbiAgICAgIHZhciBwcmVub20gPSBtLnByZW5vbSB8fCBwMC5wcmVub20gfHwgby5wcmVub21QYXRpZW50IHx8IGMucHJlbm9tIHx8IFwiXCI7XG4gICAgICB2YXIgZm91bmROU1MgPSBtLm51bWVyb1NlY3VyaXRlU29jaWFsZSB8fCBcIlwiO1xuICAgICAgaWYgKCFmb3VuZE5TUykge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBlcnNvbm5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciBwTlNTID0gKHBlcnNvbm5lc1tpXS5udW1lcm9TZWN1cml0ZVNvY2lhbGUgfHwgXCJcIikucmVwbGFjZSgvXFxEL2csIFwiXCIpO1xuICAgICAgICAgIGlmIChwTlNTLmxlbmd0aCA+PSAxMykgeyBmb3VuZE5TUyA9IHBlcnNvbm5lc1tpXS5udW1lcm9TZWN1cml0ZVNvY2lhbGU7IGJyZWFrOyB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciBmb3VuZERPQiA9IG0uZGF0ZU5haXNzYW5jZSB8fCBcIlwiO1xuICAgICAgaWYgKCFmb3VuZERPQikge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBlcnNvbm5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChwZXJzb25uZXNbaV0uZGF0ZU5haXNzYW5jZSkgeyBmb3VuZERPQiA9IHBlcnNvbm5lc1tpXS5kYXRlTmFpc3NhbmNlOyBicmVhazsgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YXIgbnNzID0gZm91bmROU1MgfHwgYy5uc3MgfHwgXCJcIjtcbiAgICAgIHZhciBkb2IgPSBmb3VuZERPQiB8fCBvLmRhdGVOYWlzc2FuY2VQYXRpZW50IHx8IGMuZG9iIHx8IFwiXCI7XG4gICAgICB2YXIgZWZmZWN0aXZlTlNTID0gZ2V0T3V2cmFudERyb2l0TlNTKG5zcywgZG9iLCBwZXJzb25uZXMpO1xuXG4gICAgICAvKiBJdGVsaXMgXHUyMDE0IGZvcm11bGFpcmUgcmVjaGVyY2hlIGJlbmVmaWNpYWlyZSAqL1xuICAgICAgdmFyIG5vbUVsID0gZmluZEVsZW1lbnRUcmFja2VkKFBPUlRBTF9LRVksIFwibm9tX2Fzc3VyZWVcIixcbiAgICAgICAgJ2lucHV0W25hbWU9XCJub21fYXNzdXJlZVwiXSwgaW5wdXRbbmFtZT1cIm5vbVwiXSwgaW5wdXRbaWQqPVwibm9tXCJdW2lkKj1cImFzc3VyZVwiXSwgaW5wdXRbZGF0YS1jeT1cImlucHV0LWxhc3ROYW1lXCJdJyk7XG4gICAgICBpZiAoIW5vbUVsKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIHVsdHJhRmlsbChub21FbCwgbm9tLnRvVXBwZXJDYXNlKCkpO1xuICAgICAgdWx0cmFGaWxsKGZpbmRFbGVtZW50VHJhY2tlZChQT1JUQUxfS0VZLCBcInByZW5vbV9hc3N1cmVlXCIsXG4gICAgICAgICdpbnB1dFtuYW1lPVwicHJlbm9tX2Fzc3VyZWVcIl0sIGlucHV0W25hbWU9XCJwcmVub21cIl0sIGlucHV0W2RhdGEtY3k9XCJpbnB1dC1maXJzdE5hbWVcIl0nKSxcbiAgICAgICAgY2FwaXRhbGl6ZShwcmVub20pKTtcbiAgICAgIHVsdHJhRmlsbChmaW5kRWxlbWVudFRyYWNrZWQoUE9SVEFMX0tFWSwgXCJuc3NcIixcbiAgICAgICAgJ2lucHV0W25hbWU9XCJuc3NcIl0sIGlucHV0W25hbWU9XCJuaXJwXCJdLCBpbnB1dFtuYW1lPVwibnVtSW5zZWVcIl0sIGlucHV0W25hbWU9XCJuaXJcIl0sIGlucHV0W2RhdGEtY3k9XCJpbnB1dC1uaXJcIl0nKSxcbiAgICAgICAgZWZmZWN0aXZlTlNTLnJlcGxhY2UoL1xcRC9nLCBcIlwiKSk7XG4gICAgICB1bHRyYUZpbGwoZmluZEVsZW1lbnRUcmFja2VkKFBPUlRBTF9LRVksIFwiZGF0ZU5haXNzYW5jZVwiLFxuICAgICAgICAnaW5wdXRbbmFtZT1cImRhdGVOYWlzc2FuY2VcIl0sIGlucHV0W25hbWU9XCJkYXRlX25haXNzYW5jZVwiXSwgaW5wdXRbZGF0YS1jeT1cImlucHV0LWRvYlwiXScpLFxuICAgICAgICBkb2IpO1xuICAgICAgdWx0cmFGaWxsKGZpbmRFbGVtZW50VHJhY2tlZChQT1JUQUxfS0VZLCBcImFkaGVyZW50XCIsXG4gICAgICAgICdpbnB1dFtuYW1lPVwiYWRoZXJlbnRcIl0sIGlucHV0W25hbWU9XCJudW1fYWRoZXJlbnRcIl0sIGlucHV0W25hbWU9XCJudW1BZGhlcmVudFwiXScpLFxuICAgICAgICBtLm51bWVyb0FkaGVyZW50IHx8IFwiXCIpO1xuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuICAgIHN5bmNocm9uaXNlcjogYXN5bmMgKCkgPT4gZmFsc2VcbiAgfVxufTtcbiIsICJ2YXIgUE9SVEFMX0tFWSA9IFwicHJvLnZpYW1lZGlzLm5ldFwiO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIG5hbWU6IFwiVmlhbWVkaXNcIixcbiAgaXNNYXRjaDogKCkgPT4gd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLmluY2x1ZGVzKFwidmlhbWVkaXMubmV0XCIpIHx8IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZS5pbmNsdWRlcyhcInZpYW1lZGlzLmZyXCIpLFxuICBhY3Rpb25zOiB7XG4gICAgZm9ybXVsYWlyZTogKGRhdGEpID0+IHtcbiAgICAgIHZhciBtID0gZGF0YS5tIHx8IHt9O1xuICAgICAgdmFyIG8gPSBkYXRhLm8gfHwge307XG4gICAgICB2YXIgYyA9IGRhdGEuY2FjaGVkIHx8IHt9O1xuICAgICAgdmFyIHBlcnNvbm5lcyA9IG0ucGVyc29ubmVzIHx8IFtdO1xuICAgICAgdmFyIHAwID0gcGVyc29ubmVzLmxlbmd0aCA+IDAgPyBwZXJzb25uZXNbMF0gOiB7fTtcbiAgICAgIHZhciBub20gPSBtLm5vbSB8fCBwMC5ub20gfHwgby5ub21QYXRpZW50IHx8IGMubm9tIHx8IFwiXCI7XG4gICAgICB2YXIgcHJlbm9tID0gbS5wcmVub20gfHwgcDAucHJlbm9tIHx8IG8ucHJlbm9tUGF0aWVudCB8fCBjLnByZW5vbSB8fCBcIlwiO1xuICAgICAgdmFyIGZvdW5kTlNTID0gbS5udW1lcm9TZWN1cml0ZVNvY2lhbGUgfHwgXCJcIjtcbiAgICAgIGlmICghZm91bmROU1MpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwZXJzb25uZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgcE5TUyA9IChwZXJzb25uZXNbaV0ubnVtZXJvU2VjdXJpdGVTb2NpYWxlIHx8IFwiXCIpLnJlcGxhY2UoL1xcRC9nLCBcIlwiKTtcbiAgICAgICAgICBpZiAocE5TUy5sZW5ndGggPj0gMTMpIHsgZm91bmROU1MgPSBwZXJzb25uZXNbaV0ubnVtZXJvU2VjdXJpdGVTb2NpYWxlOyBicmVhazsgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YXIgZm91bmRET0IgPSBtLmRhdGVOYWlzc2FuY2UgfHwgXCJcIjtcbiAgICAgIGlmICghZm91bmRET0IpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwZXJzb25uZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAocGVyc29ubmVzW2ldLmRhdGVOYWlzc2FuY2UpIHsgZm91bmRET0IgPSBwZXJzb25uZXNbaV0uZGF0ZU5haXNzYW5jZTsgYnJlYWs7IH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIG5zcyA9IGZvdW5kTlNTIHx8IGMubnNzIHx8IFwiXCI7XG4gICAgICB2YXIgZG9iID0gZm91bmRET0IgfHwgby5kYXRlTmFpc3NhbmNlUGF0aWVudCB8fCBjLmRvYiB8fCBcIlwiO1xuICAgICAgdmFyIGVmZmVjdGl2ZU5TUyA9IGdldE91dnJhbnREcm9pdE5TUyhuc3MsIGRvYiwgcGVyc29ubmVzKTtcblxuICAgICAgLyogVmlhbWVkaXMgdXRpbGlzZSBBbmd1bGFyIFx1MjAxNCBkYXRhLWN5LCBhcmlhLWxhYmVsLCBuZy1yZWZsZWN0LW5hbWUgKi9cblxuICAgICAgLyogRm9ybXVsYWlyZSByZWNoZXJjaGUgYmVuZWZpY2lhaXJlICovXG4gICAgICB2YXIgbm9tRWwgPSBmaW5kRWxlbWVudFRyYWNrZWQoUE9SVEFMX0tFWSwgXCJub21cIixcbiAgICAgICAgJ2lucHV0W2RhdGEtY3k9XCJub21cIl0sIGlucHV0W25nLXJlZmxlY3QtbmFtZT1cIm5vbVwiXSwgaW5wdXRbbmFtZT1cIm5vbVwiXSwgaW5wdXRbYXJpYS1sYWJlbCo9XCJub21cIiBpXScpO1xuICAgICAgaWYgKCFub21FbCkge1xuICAgICAgICAvKiBGYWxsYmFjayA6IGVzc2F5ZXIgdmlhIHBsYWNlaG9sZGVyICovXG4gICAgICAgIG5vbUVsID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dCcpKS5maW5kKGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgcmV0dXJuIChlbC5wbGFjZWhvbGRlciB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKFwibm9tXCIpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGlmICghbm9tRWwpIHJldHVybiBmYWxzZTtcblxuICAgICAgdWx0cmFGaWxsKG5vbUVsLCBub20udG9VcHBlckNhc2UoKSk7XG4gICAgICB1bHRyYUZpbGwoZmluZEVsZW1lbnRUcmFja2VkKFBPUlRBTF9LRVksIFwicHJlbm9tXCIsXG4gICAgICAgICdpbnB1dFtkYXRhLWN5PVwicHJlbm9tXCJdLCBpbnB1dFtuZy1yZWZsZWN0LW5hbWU9XCJwcmVub21cIl0sIGlucHV0W25hbWU9XCJwcmVub21cIl0sIGlucHV0W2FyaWEtbGFiZWwqPVwicHJcdTAwRTlub21cIiBpXScpLFxuICAgICAgICBjYXBpdGFsaXplKHByZW5vbSkpO1xuXG4gICAgICAvKiBOU1MgLyBOSVIgXHUyMDE0IFZpYW1lZGlzIHV0aWxpc2Ugc291dmVudCBuaXJwIG91IG5pciAqL1xuICAgICAgdmFyIG5zc0VsID0gZmluZEVsZW1lbnRUcmFja2VkKFBPUlRBTF9LRVksIFwibmlyXCIsXG4gICAgICAgICdpbnB1dFtkYXRhLWN5PVwibmlyXCJdLCBpbnB1dFtkYXRhLWN5PVwibmlycFwiXSwgaW5wdXRbbmctcmVmbGVjdC1uYW1lPVwibmlyXCJdLCBpbnB1dFtuZy1yZWZsZWN0LW5hbWU9XCJuaXJwXCJdLCBpbnB1dFtuYW1lPVwibmlyXCJdLCBpbnB1dFtuYW1lPVwibmlycFwiXSwgaW5wdXRbYXJpYS1sYWJlbCo9XCJOSVJcIiBpXSwgaW5wdXRbYXJpYS1sYWJlbCo9XCJzXHUwMEU5Y3VyaXRcdTAwRTkgc29jaWFsZVwiIGldJyk7XG4gICAgICB1bHRyYUZpbGwobnNzRWwsIGVmZmVjdGl2ZU5TUy5yZXBsYWNlKC9cXEQvZywgXCJcIikuc2xpY2UoMCwgMTMpKTtcblxuICAgICAgLyogRGF0ZSBuYWlzc2FuY2UgKi9cbiAgICAgIHVsdHJhRmlsbChmaW5kRWxlbWVudFRyYWNrZWQoUE9SVEFMX0tFWSwgXCJkYXRlTmFpc3NhbmNlXCIsXG4gICAgICAgICdpbnB1dFtkYXRhLWN5PVwiZGF0ZU5haXNzYW5jZVwiXSwgaW5wdXRbbmctcmVmbGVjdC1uYW1lPVwiZGF0ZU5haXNzYW5jZVwiXSwgaW5wdXRbbmFtZT1cImRhdGVOYWlzc2FuY2VcIl0sIGlucHV0W2FyaWEtbGFiZWwqPVwibmFpc3NhbmNlXCIgaV0nKSxcbiAgICAgICAgZG9iKTtcblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICBzeW5jaHJvbmlzZXI6IGFzeW5jICgpID0+IGZhbHNlXG4gIH1cbn07XG4iLCAiaW1wb3J0IGdlbmVyYXRpb24gZnJvbSBcIi4vZ2VuZXJhdGlvbi5qc1wiO1xuaW1wb3J0IGxpdmVieW9wdGltdW0gZnJvbSBcIi4vbGl2ZWJ5b3B0aW11bS5qc1wiO1xuaW1wb3J0IHdlbWluZCBmcm9tIFwiLi93ZW1pbmQuanNcIjtcbmltcG9ydCBhcGdpcyBmcm9tIFwiLi9hcGdpcy5qc1wiO1xuaW1wb3J0IGFjdGlsIGZyb20gXCIuL2FjdGlsLmpzXCI7XG5pbXBvcnQgbWVyY2VyIGZyb20gXCIuL21lcmNlci5qc1wiO1xuaW1wb3J0IHRwUGx1cyBmcm9tIFwiLi90cC1wbHVzLmpzXCI7XG5pbXBvcnQgZmZsUHJvbW90ZXVyIGZyb20gXCIuL2ZmbC1wcm9tb3RldXIuanNcIjtcbmltcG9ydCBzb2xpbXV0IGZyb20gXCIuL3NvbGltdXQuanNcIjtcbmltcG9ydCBhbWVsaSBmcm9tIFwiLi9hbWVsaS5qc1wiO1xuaW1wb3J0IGFsbWVyeXMgZnJvbSBcIi4vYWxtZXJ5cy5qc1wiO1xuaW1wb3J0IG94YW50aXMgZnJvbSBcIi4vb3hhbnRpcy5qc1wiO1xuaW1wb3J0IGl0ZWxpcyBmcm9tIFwiLi9pdGVsaXMuanNcIjtcbmltcG9ydCB2aWFtZWRpcyBmcm9tIFwiLi92aWFtZWRpcy5qc1wiO1xuXG5leHBvcnQgY29uc3QgQ09ORklHUyA9IHtcbiAgXCJnZW5lcmF0aW9uLmZyXCI6IGdlbmVyYXRpb24sXG4gIFwibGl2ZWJ5b3B0aW11bS5jb21cIjogbGl2ZWJ5b3B0aW11bSxcbiAgXCJwcm8ud2VtaW5kLmlvXCI6IHdlbWluZCxcbiAgXCJlc3BhY2Vwcm9mZXNzaW9ubmVsLmFwZ2lzLmNvbVwiOiBhcGdpcyxcbiAgXCJ3d3cuYWN0aWwuY29tXCI6IGFjdGlsLFxuICBcIm1lcmNlclwiOiBtZXJjZXIsXG4gIFwidHAtcGx1c1wiOiB0cFBsdXMsXG4gIFwiZmZsLXByb21vdGV1ci5jb21cIjogZmZsUHJvbW90ZXVyLFxuICBcInNvbGltdXQuZnJcIjogc29saW11dCxcbiAgXCJhbWVsaS5mclwiOiBhbWVsaSxcbiAgXCJtdXR1ZWxsZS1hbG1lcnlzLmNvbVwiOiBhbG1lcnlzLFxuICBcIm94YW50aXNcIjogb3hhbnRpcyxcbiAgXCJwcm8uaXNtLXRwLmZyXCI6IGl0ZWxpcyxcbiAgXCJwcm8udmlhbWVkaXMubmV0XCI6IHZpYW1lZGlzLFxufTtcbiIsICIvKiBcdTI1MDBcdTI1MDAgUmVtb3RlIFNlbGVjdG9yIE92ZXJyaWRlcyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cbi8qIENoYXJnZSBsZXMgb3ZlcnJpZGVzIGRlIHNlbGVjdGV1cnMgZGVwdWlzIGNocm9tZS5zdG9yYWdlLmxvY2FsICAgICAgICAgICAgICAqL1xuLyogKGFsaW1lbnRlIHBhciBsZSBiYWNrZ3JvdW5kIHRvdXRlcyBsZXMgMzAgbWluIHZpYSAvYXBpL2V4dGVuc2lvbi9zZWxlY3RvcnMpICovXG5cbnZhciBfcmVtb3RlT3ZlcnJpZGVzID0gbnVsbDtcbnZhciBfcmVtb3RlT3ZlcnJpZGVzTG9hZGVkID0gZmFsc2U7XG5cbi8qKlxuICogQ2hhcmdlIGxlcyBvdmVycmlkZXMgZGVwdWlzIGxlIHN0b3JhZ2UgbG9jYWwuXG4gKiBBcHBlbGUgdW5lIHNldWxlIGZvaXMgYXUgZGVtYXJyYWdlIGR1IGNvbnRlbnQgc2NyaXB0LlxuICovXG5mdW5jdGlvbiBsb2FkUmVtb3RlU2VsZWN0b3JzKGNhbGxiYWNrKSB7XG4gIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbXCJhdWRpYm90X3NlbGVjdG9yX292ZXJyaWRlc1wiXSwgZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgdmFyIGRhdGEgPSByZXN1bHQuYXVkaWJvdF9zZWxlY3Rvcl9vdmVycmlkZXM7XG4gICAgaWYgKGRhdGEgJiYgZGF0YS5vdmVycmlkZXMpIHtcbiAgICAgIF9yZW1vdGVPdmVycmlkZXMgPSBkYXRhLm92ZXJyaWRlcztcbiAgICB9IGVsc2Uge1xuICAgICAgX3JlbW90ZU92ZXJyaWRlcyA9IHt9O1xuICAgIH1cbiAgICBfcmVtb3RlT3ZlcnJpZGVzTG9hZGVkID0gdHJ1ZTtcbiAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSBcImZ1bmN0aW9uXCIpIGNhbGxiYWNrKCk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFJldG91cm5lIGxlIHNlbGVjdGV1ciBvdmVycmlkZSBwb3VyIHVuIHBvcnRhaWwvY2hhbXAgZG9ubmUsXG4gKiBvdSBsZSBmYWxsYmFjayBoYXJkY29kZSBzaSBhdWN1biBvdmVycmlkZSBuJ2V4aXN0ZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcG9ydGFsICAgICAtIGNsZSBkdSBwb3J0YWlsIChleDogXCJtdXR1ZWxsZS1hbG1lcnlzLmNvbVwiKVxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgICAgICAgLSBub20gbG9naXF1ZSBkdSBzZWxlY3RldXIgKGV4OiBcIm5vbV9iZW5lZmljaWFpcmVcIilcbiAqIEBwYXJhbSB7c3RyaW5nfSBmYWxsYmFjayAgIC0gc2VsZWN0ZXVyIENTUyBoYXJkY29kZSBwYXIgZGVmYXV0XG4gKiBAcmV0dXJucyB7c3RyaW5nfSBsZSBzZWxlY3RldXIgQ1NTIGEgdXRpbGlzZXJcbiAqL1xuZnVuY3Rpb24gZ2V0T3ZlcnJpZGUocG9ydGFsLCBuYW1lLCBmYWxsYmFjaykge1xuICBpZiAoIV9yZW1vdGVPdmVycmlkZXNMb2FkZWQgfHwgIV9yZW1vdGVPdmVycmlkZXMpIHJldHVybiBmYWxsYmFjaztcbiAgdmFyIHBvcnRhbE92ZXJyaWRlcyA9IF9yZW1vdGVPdmVycmlkZXNbcG9ydGFsXTtcbiAgaWYgKCFwb3J0YWxPdmVycmlkZXMpIHJldHVybiBmYWxsYmFjaztcbiAgdmFyIG92ZXJyaWRlID0gcG9ydGFsT3ZlcnJpZGVzW25hbWVdO1xuICByZXR1cm4gKG92ZXJyaWRlICYmIHR5cGVvZiBvdmVycmlkZSA9PT0gXCJzdHJpbmdcIikgPyBvdmVycmlkZSA6IGZhbGxiYWNrO1xufVxuXG4vKipcbiAqIFZhcmlhbnRlIGRlIGZpbmRFbGVtZW50IHF1aSB1dGlsaXNlIGxlcyBvdmVycmlkZXMuXG4gKiBFc3NhaWUgZCdhYm9yZCBsJ292ZXJyaWRlLCBwdWlzIGxlIGZhbGxiYWNrIHNpIGwnb3ZlcnJpZGUgZWNob3VlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwb3J0YWwgICAgIC0gY2xlIGR1IHBvcnRhaWxcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lICAgICAgIC0gbm9tIGxvZ2lxdWUgZHUgc2VsZWN0ZXVyXG4gKiBAcGFyYW0ge3N0cmluZ30gZmFsbGJhY2sgICAtIHNlbGVjdGV1ciBDU1MgaGFyZGNvZGVcbiAqIEByZXR1cm5zIHtFbGVtZW50fG51bGx9XG4gKi9cbmZ1bmN0aW9uIGZpbmRFbGVtZW50V2l0aE92ZXJyaWRlKHBvcnRhbCwgbmFtZSwgZmFsbGJhY2spIHtcbiAgdmFyIG92ZXJyaWRlU2VsZWN0b3IgPSBnZXRPdmVycmlkZShwb3J0YWwsIG5hbWUsIG51bGwpO1xuICBpZiAob3ZlcnJpZGVTZWxlY3RvciAmJiBvdmVycmlkZVNlbGVjdG9yICE9PSBmYWxsYmFjaykge1xuICAgIHZhciBlbCA9IGZpbmRFbGVtZW50KG92ZXJyaWRlU2VsZWN0b3IpO1xuICAgIGlmIChlbCkgcmV0dXJuIGVsO1xuICAgIC8qIE92ZXJyaWRlIG4nYSBwYXMgbWFyY2hlLCBlc3NheWVyIGxlIGZhbGxiYWNrICovXG4gIH1cbiAgcmV0dXJuIGZpbmRFbGVtZW50KGZhbGxiYWNrKTtcbn1cblxuLyogRXhwb3NlIHBvdXIgbCdpbXBvcnQgZGVwdWlzIGNvbnRlbnQvaW5kZXguanMgKi9cbmdsb2JhbFRoaXMubG9hZFJlbW90ZVNlbGVjdG9ycyA9IGxvYWRSZW1vdGVTZWxlY3RvcnM7XG5nbG9iYWxUaGlzLmdldE92ZXJyaWRlID0gZ2V0T3ZlcnJpZGU7XG5nbG9iYWxUaGlzLmZpbmRFbGVtZW50V2l0aE92ZXJyaWRlID0gZmluZEVsZW1lbnRXaXRoT3ZlcnJpZGU7XG4iLCAiLyogXHUyNTAwXHUyNTAwIFVTLTggOiBGZWVkYmFjayBMb29wIFx1MjAxNCBTaWduYWxlbWVudCBkZSBjaGFtcCBtYWwgcmVtcGxpIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuLyogQ2xpYyBkcm9pdCBzdXIgdW4gY2hhbXAgXHUyMTkyIFwiU2lnbmFsZXIgY2UgY2hhbXBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuLyogRW52b2llIHNcdTAwRTlsZWN0ZXVyIERPTSArIFVSTCBwb3J0YWlsIGF1IHNlcnZldXIgKGFub255bWlzXHUwMEU5LCBzYW5zIGRvbm5cdTAwRTllIHBhdGllbnQpICovXG5cbnZhciBfZmVlZGJhY2tNZW51RWwgPSBudWxsO1xudmFyIF9mZWVkYmFja1RhcmdldEVsID0gbnVsbDtcblxuZnVuY3Rpb24gaW5pdEZpZWxkRmVlZGJhY2soKSB7XG4gIC8qIEluamVjdGVyIGxlIG1lbnUgY29udGV4dHVlbCBjdXN0b20gKi9cbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBmdW5jdGlvbihlKSB7XG4gICAgdmFyIHRhcmdldCA9IGUudGFyZ2V0O1xuICAgIGlmICghdGFyZ2V0KSByZXR1cm47XG5cbiAgICAvKiBWXHUwMEU5cmlmaWVyIHNpIGMnZXN0IHVuIGlucHV0L3NlbGVjdC90ZXh0YXJlYSBwb3RlbnRpZWxsZW1lbnQgcmVtcGxpIHBhciBBdWRpQm90ICovXG4gICAgdmFyIGlzRm9ybUZpZWxkID0gdGFyZ2V0Lm1hdGNoZXMoJ2lucHV0LCBzZWxlY3QsIHRleHRhcmVhLCBbY29udGVudGVkaXRhYmxlPVwidHJ1ZVwiXScpO1xuICAgIGlmICghaXNGb3JtRmllbGQpIHJldHVybjtcblxuICAgIC8qIEFmZmljaGVyIG5vdHJlIG1lbnUgYXByXHUwMEU4cyBsZSBtZW51IGNvbnRleHR1ZWwgbmF0aWYgKi9cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBzaG93RmVlZGJhY2tNZW51KGUuY2xpZW50WCwgZS5jbGllbnRZLCB0YXJnZXQpOyB9LCAxMDApO1xuICB9KTtcblxuICAvKiBGZXJtZXIgbGUgbWVudSBzaSBjbGljIGFpbGxldXJzICovXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgIGlmIChfZmVlZGJhY2tNZW51RWwgJiYgIV9mZWVkYmFja01lbnVFbC5jb250YWlucyhlLnRhcmdldCkpIHtcbiAgICAgIGhpZGVGZWVkYmFja01lbnUoKTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBzaG93RmVlZGJhY2tNZW51KHgsIHksIHRhcmdldEVsKSB7XG4gIGhpZGVGZWVkYmFja01lbnUoKTtcbiAgX2ZlZWRiYWNrVGFyZ2V0RWwgPSB0YXJnZXRFbDtcblxuICB2YXIgbWVudSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBtZW51LmlkID0gJ2F1ZGlib3QtZmVlZGJhY2stbWVudSc7XG4gIG1lbnUuc3R5bGUuY3NzVGV4dCA9IFtcbiAgICAncG9zaXRpb246Zml4ZWQnLFxuICAgICd6LWluZGV4OjIxNDc0ODM2NDcnLFxuICAgICdiYWNrZ3JvdW5kOiMxZTI5M2InLFxuICAgICdjb2xvcjp3aGl0ZScsXG4gICAgJ2JvcmRlci1yYWRpdXM6OHB4JyxcbiAgICAnYm94LXNoYWRvdzowIDRweCAxNnB4IHJnYmEoMCwwLDAsMC4zKScsXG4gICAgJ3BhZGRpbmc6NHB4JyxcbiAgICAnbWluLXdpZHRoOjIwMHB4JyxcbiAgICAnZm9udC1mYW1pbHk6c3lzdGVtLXVpLHNhbnMtc2VyaWYnLFxuICAgICdmb250LXNpemU6MTNweCcsXG4gICAgJ2xlZnQ6JyArIE1hdGgubWluKHgsIHdpbmRvdy5pbm5lcldpZHRoIC0gMjIwKSArICdweCcsXG4gICAgJ3RvcDonICsgTWF0aC5taW4oeSwgd2luZG93LmlubmVySGVpZ2h0IC0gODApICsgJ3B4J1xuICBdLmpvaW4oJzsnKTtcblxuICB2YXIgYnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gIGJ0bi5zdHlsZS5jc3NUZXh0ID0gJ2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweDt3aWR0aDoxMDAlO3BhZGRpbmc6OHB4IDEycHg7YmFja2dyb3VuZDpub25lO2JvcmRlcjpub25lO2NvbG9yOndoaXRlO2N1cnNvcjpwb2ludGVyO2JvcmRlci1yYWRpdXM6NnB4O3RleHQtYWxpZ246bGVmdDsnO1xuICBidG4uaW5uZXJIVE1MID0gJzxzcGFuIHN0eWxlPVwiZm9udC1zaXplOjE2cHhcIj5cdUQ4M0RcdURDMUI8L3NwYW4+PHNwYW4+U2lnbmFsZXIgY2UgY2hhbXAgXHUwMEUwIEF1ZGlCb3Q8L3NwYW4+JztcbiAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCBmdW5jdGlvbigpIHsgYnRuLnN0eWxlLmJhY2tncm91bmQgPSAnIzMzNDE1NSc7IH0pO1xuICBidG4uYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIGZ1bmN0aW9uKCkgeyBidG4uc3R5bGUuYmFja2dyb3VuZCA9ICdub25lJzsgfSk7XG4gIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIHNlbmRGaWVsZEZlZWRiYWNrKHRhcmdldEVsKTtcbiAgICBoaWRlRmVlZGJhY2tNZW51KCk7XG4gIH0pO1xuXG4gIG1lbnUuYXBwZW5kQ2hpbGQoYnRuKTtcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtZW51KTtcbiAgX2ZlZWRiYWNrTWVudUVsID0gbWVudTtcbn1cblxuZnVuY3Rpb24gaGlkZUZlZWRiYWNrTWVudSgpIHtcbiAgaWYgKF9mZWVkYmFja01lbnVFbCkge1xuICAgIF9mZWVkYmFja01lbnVFbC5yZW1vdmUoKTtcbiAgICBfZmVlZGJhY2tNZW51RWwgPSBudWxsO1xuICB9XG4gIF9mZWVkYmFja1RhcmdldEVsID0gbnVsbDtcbn1cblxuZnVuY3Rpb24gYnVpbGRTZWxlY3RvcihlbCkge1xuICAvKiBDb25zdHJ1aXJlIHVuIHNcdTAwRTlsZWN0ZXVyIENTUyBzdGFibGUgcG91ciBsZSBjaGFtcCAqL1xuICBpZiAoZWwuaWQpIHJldHVybiAnIycgKyBlbC5pZDtcbiAgaWYgKGVsLm5hbWUpIHJldHVybiBlbC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgKyAnW25hbWU9XCInICsgZWwubmFtZSArICdcIl0nO1xuICBpZiAoZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWZpZWxkJykpIHJldHVybiAnW2RhdGEtZmllbGQ9XCInICsgZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWZpZWxkJykgKyAnXCJdJztcbiAgaWYgKGVsLmNsYXNzTmFtZSkge1xuICAgIHZhciBjbGFzc2VzID0gQXJyYXkuZnJvbShlbC5jbGFzc0xpc3QpLnNsaWNlKDAsIDIpLmpvaW4oJy4nKTtcbiAgICBpZiAoY2xhc3NlcykgcmV0dXJuIGVsLnRhZ05hbWUudG9Mb3dlckNhc2UoKSArICcuJyArIGNsYXNzZXM7XG4gIH1cbiAgLyogRmFsbGJhY2sgOiBwb3NpdGlvbiBkYW5zIGxlIERPTSAqL1xuICB2YXIgcGFyZW50ID0gZWwucGFyZW50RWxlbWVudDtcbiAgaWYgKHBhcmVudCkge1xuICAgIHZhciBzaWJsaW5ncyA9IEFycmF5LmZyb20ocGFyZW50LmNoaWxkcmVuKTtcbiAgICB2YXIgaWR4ID0gc2libGluZ3MuaW5kZXhPZihlbCkgKyAxO1xuICAgIHJldHVybiBlbC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgKyAnOm50aC1jaGlsZCgnICsgaWR4ICsgJyknO1xuICB9XG4gIHJldHVybiBlbC50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG59XG5cbmZ1bmN0aW9uIGluZmVyRmllbGRUeXBlKGVsKSB7XG4gIC8qIERldmluZXIgbGUgdHlwZSBkZSBjaGFtcCBhdHRlbmR1ICovXG4gIHZhciBoaW50cyA9IFtcbiAgICBlbC5pZCwgZWwubmFtZSwgZWwucGxhY2Vob2xkZXIsXG4gICAgZWwuZ2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJyksIGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1maWVsZCcpXG4gIF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJyAnKS50b0xvd2VyQ2FzZSgpO1xuXG4gIGlmICgvbm9tfGxhc3RuYW1lfGZhbWlseS9pLnRlc3QoaGludHMpKSByZXR1cm4gJ25vbSc7XG4gIGlmICgvcHJlbm9tfGZpcnN0bmFtZS9pLnRlc3QoaGludHMpKSByZXR1cm4gJ3ByZW5vbSc7XG4gIGlmICgvbnNzfHNlY3V8aW5zZWUvaS50ZXN0KGhpbnRzKSkgcmV0dXJuICduc3MnO1xuICBpZiAoL2RhdGV8bmFpc3NhbmNlfGJpcnRoL2kudGVzdChoaW50cykpIHJldHVybiAnZGF0ZSc7XG4gIGlmICgvbXV0dWVsbGV8cmVnaW1lfHJjMS9pLnRlc3QoaGludHMpKSByZXR1cm4gJ211dHVlbGxlJztcbiAgaWYgKC9zcGhbZVx1MDBFOF1yZXxzcGhlcmUvaS50ZXN0KGhpbnRzKSkgcmV0dXJuICdzcGhlcmUnO1xuICBpZiAoL2N5bGluZHJlfGN5bC9pLnRlc3QoaGludHMpKSByZXR1cm4gJ2N5bGluZHJlJztcbiAgaWYgKC9heGUvaS50ZXN0KGhpbnRzKSkgcmV0dXJuICdheGUnO1xuICByZXR1cm4gJ3Vua25vd24nO1xufVxuXG5mdW5jdGlvbiBzZW5kRmllbGRGZWVkYmFjayhlbCkge1xuICB2YXIgc2VsZWN0b3IgPSBidWlsZFNlbGVjdG9yKGVsKTtcbiAgdmFyIGZpZWxkVHlwZSA9IGluZmVyRmllbGRUeXBlKGVsKTtcbiAgdmFyIHBvcnRhbEhvc3RuYW1lID0gd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLnJlcGxhY2UoL153d3dcXC4vLCAnJyk7XG4gIHZhciBwb3J0YWxVcmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5zcGxpdCgnPycpWzBdOyAvKiBzYW5zIHF1ZXJ5IHBhcmFtcyBcdTIwMTQgYW5vbnltaXNcdTAwRTkgKi9cblxuICB2YXIgcGF5bG9hZCA9IHtcbiAgICBzZWxlY3Rvcjogc2VsZWN0b3IsXG4gICAgZmllbGRUeXBlOiBmaWVsZFR5cGUsXG4gICAgcG9ydGFsOiBwb3J0YWxIb3N0bmFtZSxcbiAgICB1cmw6IHBvcnRhbFVybCxcbiAgICB0czogRGF0ZS5ub3coKVxuICB9O1xuXG4gIC8qIFRvYXN0IGRlIGNvbmZpcm1hdGlvbiBpbW1cdTAwRTlkaWF0ZSAqL1xuICBzaG93RmVlZGJhY2tUb2FzdCgnXHUyM0YzIFNpZ25hbGVtZW50IGVudm95XHUwMEU5IFx1MDBFMCBBdWRpQm90XHUyMDI2Jyk7XG5cbiAgLyogRW52b3llciB2aWEgYmFja2dyb3VuZCAoXHUwMEU5dml0ZSBsZXMgcmVzdHJpY3Rpb25zIENPUlMgZHUgY29udGVudCBzY3JpcHQpICovXG4gIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICB0eXBlOiAnQVVESUJPVF9GSUVMRF9GRUVEQkFDSycsXG4gICAgcGF5bG9hZDogcGF5bG9hZFxuICB9LCBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgIGlmIChyZXNwb25zZSAmJiByZXNwb25zZS5vaykge1xuICAgICAgc2hvd0ZlZWRiYWNrVG9hc3QoJ1x1RDgzRFx1REU0RiBNZXJjaSwgb24gYW1cdTAwRTlsaW9yZSBcdTAwRTdhICEnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2hvd0ZlZWRiYWNrVG9hc3QoJ1x1MjZBMFx1RkUwRiBFbnZvaSBcdTAwRTljaG91XHUwMEU5IFx1MjAxNCByXHUwMEU5ZXNzYWllIHBsdXMgdGFyZCcpO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHNob3dGZWVkYmFja1RvYXN0KG1lc3NhZ2UpIHtcbiAgdmFyIGV4aXN0aW5nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2F1ZGlib3QtZmVlZGJhY2stdG9hc3QnKTtcbiAgaWYgKGV4aXN0aW5nKSBleGlzdGluZy5yZW1vdmUoKTtcblxuICB2YXIgdG9hc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgdG9hc3QuaWQgPSAnYXVkaWJvdC1mZWVkYmFjay10b2FzdCc7XG4gIHRvYXN0LnN0eWxlLmNzc1RleHQgPSBbXG4gICAgJ3Bvc2l0aW9uOmZpeGVkJyxcbiAgICAnYm90dG9tOjI0cHgnLFxuICAgICdyaWdodDoyNHB4JyxcbiAgICAnei1pbmRleDoyMTQ3NDgzNjQ3JyxcbiAgICAnYmFja2dyb3VuZDojMWUyOTNiJyxcbiAgICAnY29sb3I6d2hpdGUnLFxuICAgICdwYWRkaW5nOjEwcHggMTZweCcsXG4gICAgJ2JvcmRlci1yYWRpdXM6MTBweCcsXG4gICAgJ2ZvbnQtZmFtaWx5OnN5c3RlbS11aSxzYW5zLXNlcmlmJyxcbiAgICAnZm9udC1zaXplOjEzcHgnLFxuICAgICdmb250LXdlaWdodDo2MDAnLFxuICAgICdib3gtc2hhZG93OjAgNHB4IDE2cHggcmdiYSgwLDAsMCwwLjI1KScsXG4gICAgJ3RyYW5zaXRpb246b3BhY2l0eSAwLjNzJ1xuICBdLmpvaW4oJzsnKTtcbiAgdG9hc3QudGV4dENvbnRlbnQgPSBtZXNzYWdlO1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRvYXN0KTtcblxuICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgIHRvYXN0LnN0eWxlLm9wYWNpdHkgPSAnMCc7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHsgdG9hc3QucmVtb3ZlKCk7IH0sIDMwMCk7XG4gIH0sIDMwMDApO1xufVxuXG4vKiBFeHBvc2UgKi9cbmdsb2JhbFRoaXMuaW5pdEZpZWxkRmVlZGJhY2sgPSBpbml0RmllbGRGZWVkYmFjaztcbiIsICIvKiBcdTI1MDBcdTI1MDAgU2VsZWN0b3IgSGVhbHRoIFRlbGVtZXRyeSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cbi8qIEVudm9pZSBkZXMgcGluZ3MgZGUgc2FudGUgYW5vbnltaXNlcyBsb3JzcXUndW4gc2VsZWN0ZXVyIG4nZXN0IHBhcyB0cm91dmUgICovXG4vKiBzdXIgdW4gcG9ydGFpbCBjb25udS4gTGVzIHBpbmdzIHNvbnQgYmF0Y2hlcyBldCBlbnZveWVzIHRvdXRlcyBsZXMgMTBzLiAgICAqL1xuXG52YXIgX2hlYWx0aFBpbmdRdWV1ZSA9IFtdO1xudmFyIF9oZWFsdGhGbHVzaFRpbWVyID0gbnVsbDtcbnZhciBIRUFMVEhfRkxVU0hfSU5URVJWQUxfTVMgPSAxMDAwMDtcbnZhciBIRUFMVEhfTUFYX0JBVENIID0gMjA7XG5cbi8qKlxuICogRW5yZWdpc3RyZSB1biBwaW5nIGRlIHNhbnRlIHBvdXIgdW4gc2VsZWN0ZXVyLlxuICogTGVzIHBpbmdzIHNvbnQgYWNjdW11bGVzIHB1aXMgZW52b3llcyBlbiBiYXRjaC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcG9ydGFsICAgICAgIC0gY2xlIGR1IHBvcnRhaWwgKGV4OiBcIm11dHVlbGxlLWFsbWVyeXMuY29tXCIpXG4gKiBAcGFyYW0ge3N0cmluZ30gc2VsZWN0b3JOYW1lIC0gbm9tIGxvZ2lxdWUgZHUgc2VsZWN0ZXVyIChleDogXCJub21fYmVuZWZpY2lhaXJlXCIpXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGZvdW5kICAgICAgIC0gdHJ1ZSBzaSBsJ2VsZW1lbnQgYSBldGUgdHJvdXZlLCBmYWxzZSBzaW5vblxuICovXG5mdW5jdGlvbiByZXBvcnRTZWxlY3RvckhlYWx0aChwb3J0YWwsIHNlbGVjdG9yTmFtZSwgZm91bmQpIHtcbiAgX2hlYWx0aFBpbmdRdWV1ZS5wdXNoKHtcbiAgICBwb3J0YWw6IHBvcnRhbCxcbiAgICBzZWxlY3Rvck5hbWU6IHNlbGVjdG9yTmFtZSxcbiAgICBmb3VuZDogZm91bmQsXG4gIH0pO1xuXG4gIC8qIERlbWFycmVyIGxlIHRpbWVyIGRlIGZsdXNoIHNpIHBhcyBkZWphIGVuIGNvdXJzICovXG4gIGlmICghX2hlYWx0aEZsdXNoVGltZXIpIHtcbiAgICBfaGVhbHRoRmx1c2hUaW1lciA9IHNldFRpbWVvdXQoZmx1c2hIZWFsdGhQaW5ncywgSEVBTFRIX0ZMVVNIX0lOVEVSVkFMX01TKTtcbiAgfVxuXG4gIC8qIEZsdXNoIGltbWVkaWF0IHNpIGxlIGJhdGNoIGVzdCBwbGVpbiAqL1xuICBpZiAoX2hlYWx0aFBpbmdRdWV1ZS5sZW5ndGggPj0gSEVBTFRIX01BWF9CQVRDSCkge1xuICAgIGZsdXNoSGVhbHRoUGluZ3MoKTtcbiAgfVxufVxuXG4vKipcbiAqIEVudm9pZSBsZSBiYXRjaCBkZSBwaW5ncyBhdSBzZXJ2ZXVyIHZpYSBsZSBiYWNrZ3JvdW5kIHNlcnZpY2Ugd29ya2VyLlxuICogVXRpbGlzZSBsZSBtZWNhbmlzbWUgQVVESUJPVF9QSU5HIGV4aXN0YW50IHBvdXIgZXZpdGVyIGxlcyBwcm9ibGVtZXMgQ09SUy5cbiAqL1xuZnVuY3Rpb24gZmx1c2hIZWFsdGhQaW5ncygpIHtcbiAgaWYgKF9oZWFsdGhGbHVzaFRpbWVyKSB7XG4gICAgY2xlYXJUaW1lb3V0KF9oZWFsdGhGbHVzaFRpbWVyKTtcbiAgICBfaGVhbHRoRmx1c2hUaW1lciA9IG51bGw7XG4gIH1cblxuICBpZiAoX2hlYWx0aFBpbmdRdWV1ZS5sZW5ndGggPT09IDApIHJldHVybjtcblxuICB2YXIgcGluZ3NUb1NlbmQgPSBfaGVhbHRoUGluZ1F1ZXVlLnNwbGljZSgwKTtcblxuICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoW1wiYXVkaWJvdF9hdXRoXCJdLCBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICB2YXIgYXV0aCA9IHJlc3VsdC5hdWRpYm90X2F1dGggfHwge307XG4gICAgaWYgKCFhdXRoLnN5bmNUb2tlbikgcmV0dXJuOyAvKiBwYXMgYXV0aGVudGlmaWUsIG9uIGpldHRlIGxlcyBwaW5ncyAqL1xuXG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgdHlwZTogXCJBVURJQk9UX1BJTkdcIixcbiAgICAgIHBheWxvYWRzOiBbe1xuICAgICAgICB1cmw6IFwiaHR0cHM6Ly9hdWRpYm90LmZyL2FwaS9leHRlbnNpb24vc2VsZWN0b3ItaGVhbHRoXCIsXG4gICAgICAgIGJvZHk6IHtcbiAgICAgICAgICBzeW5jVG9rZW46IGF1dGguc3luY1Rva2VuLFxuICAgICAgICAgIHBpbmdzOiBwaW5nc1RvU2VuZCxcbiAgICAgICAgfSxcbiAgICAgIH1dLFxuICAgIH0pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBXcmFwcGVyIGF1dG91ciBkZSBmaW5kRWxlbWVudFdpdGhPdmVycmlkZSBxdWkgcmVwb3J0ZSBhdXRvbWF0aXF1ZW1lbnRcbiAqIGxhIHNhbnRlIGR1IHNlbGVjdGV1ci4gVXRpbGlzZSBkYW5zIGxlcyBwb3J0YWlscyBtaWdyZXMuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBvcnRhbCAgICAgLSBjbGUgZHUgcG9ydGFpbFxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgICAgICAgLSBub20gbG9naXF1ZSBkdSBzZWxlY3RldXJcbiAqIEBwYXJhbSB7c3RyaW5nfSBmYWxsYmFjayAgIC0gc2VsZWN0ZXVyIENTUyBoYXJkY29kZVxuICogQHJldHVybnMge0VsZW1lbnR8bnVsbH1cbiAqL1xuZnVuY3Rpb24gZmluZEVsZW1lbnRUcmFja2VkKHBvcnRhbCwgbmFtZSwgZmFsbGJhY2spIHtcbiAgdmFyIGVsID0gZmluZEVsZW1lbnRXaXRoT3ZlcnJpZGUocG9ydGFsLCBuYW1lLCBmYWxsYmFjayk7XG4gIHJlcG9ydFNlbGVjdG9ySGVhbHRoKHBvcnRhbCwgbmFtZSwgISFlbCk7XG4gIHJldHVybiBlbDtcbn1cblxuLyogRXhwb3NlIHBvdXIgbCdpbXBvcnQgZGVwdWlzIGNvbnRlbnQvaW5kZXguanMgKi9cbmdsb2JhbFRoaXMucmVwb3J0U2VsZWN0b3JIZWFsdGggPSByZXBvcnRTZWxlY3RvckhlYWx0aDtcbmdsb2JhbFRoaXMuZmx1c2hIZWFsdGhQaW5ncyA9IGZsdXNoSGVhbHRoUGluZ3M7XG5nbG9iYWxUaGlzLmZpbmRFbGVtZW50VHJhY2tlZCA9IGZpbmRFbGVtZW50VHJhY2tlZDtcblxuLyogXHUyNTAwXHUyNTAwIFYzLTIgOiBBdXRvLXJlcGFpciBcdTIwMTQgY2FwdHVyZSBET00gc25hcHNob3Qgb24gaGlnaCBza2lwIHJhdGUgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG5cbnZhciBfZmlsbFN0YXRzID0ge307XG5cbmZ1bmN0aW9uIHRyYWNrRmlsbFJlc3VsdChob3N0bmFtZSwgZmllbGQsIHN1Y2Nlc3MpIHtcbiAgaWYgKCFfZmlsbFN0YXRzW2hvc3RuYW1lXSkgX2ZpbGxTdGF0c1tob3N0bmFtZV0gPSB7IHRvdGFsOiAwLCBza2lwcGVkOiAwLCBmaWVsZHM6IHt9IH07XG4gIF9maWxsU3RhdHNbaG9zdG5hbWVdLnRvdGFsKys7XG4gIGlmICghc3VjY2VzcykgX2ZpbGxTdGF0c1tob3N0bmFtZV0uc2tpcHBlZCsrO1xuICBpZiAoIXN1Y2Nlc3MpIHtcbiAgICBfZmlsbFN0YXRzW2hvc3RuYW1lXS5maWVsZHNbZmllbGRdID0gKF9maWxsU3RhdHNbaG9zdG5hbWVdLmZpZWxkc1tmaWVsZF0gfHwgMCkgKyAxO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNoZWNrQW5kUmVwYWlyU2VsZWN0b3JzKGhvc3RuYW1lKSB7XG4gIHZhciBzdGF0cyA9IF9maWxsU3RhdHNbaG9zdG5hbWVdO1xuICBpZiAoIXN0YXRzIHx8IHN0YXRzLnRvdGFsIDwgNSkgcmV0dXJuOyAvKiBQYXMgYXNzZXogZGUgZG9ubmVlcyAqL1xuXG4gIHZhciBza2lwUmF0ZSA9IHN0YXRzLnNraXBwZWQgLyBzdGF0cy50b3RhbDtcbiAgaWYgKHNraXBSYXRlIDwgMC4zKSByZXR1cm47IC8qIFRhdXggZGUgc2tpcCBhY2NlcHRhYmxlICovXG5cbiAgY29uc29sZS53YXJuKFwiW0F1ZGlCb3RdIFRhdXggZGUgc2tpcCBlbGV2ZSBzdXIgXCIgKyBob3N0bmFtZSArIFwiIChcIiArIE1hdGgucm91bmQoc2tpcFJhdGUgKiAxMDApICsgXCIlKSBcdTIwMTQgZW52b2kgc25hcHNob3QgRE9NIHBvdXIgcmVwYXJhdGlvblwiKTtcblxuICAvKiBDYXB0dXJlciB1biBzbmFwc2hvdCBET00gYW5vbnltaXNlIChzYW5zIHZhbGV1cnMgZGUgY2hhbXBzKSAqL1xuICB2YXIgc25hcHNob3QgPSBjYXB0dXJlQW5vbnltaXplZFNuYXBzaG90KCk7XG5cbiAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFtcImF1ZGlib3RfYXV0aFwiXSwgZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgdmFyIGF1dGggPSByZXN1bHQuYXVkaWJvdF9hdXRoIHx8IHt9O1xuICAgIGlmICghYXV0aC5zeW5jVG9rZW4pIHJldHVybjtcblxuICAgIGZldGNoKFwiaHR0cHM6Ly9hdWRpYm90LmZyL2FwaS9leHRlbnNpb24vc2VsZWN0b3ItcmVwYWlyXCIsIHtcbiAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICBcIkF1dGhvcml6YXRpb25cIjogXCJCZWFyZXIgXCIgKyBhdXRoLnN5bmNUb2tlblxuICAgICAgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgaG9zdG5hbWU6IGhvc3RuYW1lLFxuICAgICAgICBza2lwUmF0ZTogc2tpcFJhdGUsXG4gICAgICAgIGZhaWxlZEZpZWxkczogc3RhdHMuZmllbGRzLFxuICAgICAgICBzbmFwc2hvdDogc25hcHNob3QsXG4gICAgICAgIHRzOiBEYXRlLm5vdygpXG4gICAgICB9KVxuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikgeyBjb25zb2xlLndhcm4oXCJbQXVkaUJvdF0gc2VsZWN0b3IgcmVwYWlyIHN1Ym1pc3Npb24gZmFpbGVkOlwiLCBlcnIpOyB9KTtcbiAgfSk7XG5cbiAgLyogUmVzZXQgc3RhdHMgYXByZXMgZW52b2kgKi9cbiAgX2ZpbGxTdGF0c1tob3N0bmFtZV0gPSB7IHRvdGFsOiAwLCBza2lwcGVkOiAwLCBmaWVsZHM6IHt9IH07XG59XG5cbmZ1bmN0aW9uIGNhcHR1cmVBbm9ueW1pemVkU25hcHNob3QoKSB7XG4gIHZhciBpbnB1dHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiaW5wdXQsIHNlbGVjdCwgdGV4dGFyZWFcIik7XG4gIHZhciBzbmFwc2hvdCA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaW5wdXRzLmxlbmd0aCAmJiBpIDwgMTAwOyBpKyspIHtcbiAgICB2YXIgZWwgPSBpbnB1dHNbaV07XG4gICAgc25hcHNob3QucHVzaCh7XG4gICAgICB0YWc6IGVsLnRhZ05hbWUudG9Mb3dlckNhc2UoKSxcbiAgICAgIHR5cGU6IGVsLnR5cGUgfHwgXCJcIixcbiAgICAgIGlkOiBlbC5pZCB8fCBcIlwiLFxuICAgICAgbmFtZTogZWwubmFtZSB8fCBcIlwiLFxuICAgICAgY2xhc3NOYW1lOiAoZWwuY2xhc3NOYW1lIHx8IFwiXCIpLnN1YnN0cmluZygwLCAxMDApLFxuICAgICAgcGxhY2Vob2xkZXI6IChlbC5wbGFjZWhvbGRlciB8fCBcIlwiKS5zdWJzdHJpbmcoMCwgNTApLFxuICAgICAgYXJpYUxhYmVsOiBlbC5nZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsXCIpIHx8IFwiXCIsXG4gICAgICBmb3JtQ29udHJvbE5hbWU6IGVsLmdldEF0dHJpYnV0ZShcImZvcm1jb250cm9sbmFtZVwiKSB8fCBcIlwiLFxuICAgICAgLyogTk8gdmFsdWUgXHUyMDE0IGFub255bWl6ZWQgKi9cbiAgICAgIGhhc1ZhbHVlOiAhIShlbC52YWx1ZSB8fCBcIlwiKS50cmltKCksXG4gICAgICBpc1Zpc2libGU6IGVsLm9mZnNldEhlaWdodCA+IDAsXG4gICAgICBwYXJlbnRDbGFzc2VzOiBlbC5wYXJlbnRFbGVtZW50ID8gKGVsLnBhcmVudEVsZW1lbnQuY2xhc3NOYW1lIHx8IFwiXCIpLnN1YnN0cmluZygwLCAxMDApIDogXCJcIixcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBzbmFwc2hvdDtcbn1cblxuZ2xvYmFsVGhpcy50cmFja0ZpbGxSZXN1bHQgPSB0cmFja0ZpbGxSZXN1bHQ7XG5nbG9iYWxUaGlzLmNoZWNrQW5kUmVwYWlyU2VsZWN0b3JzID0gY2hlY2tBbmRSZXBhaXJTZWxlY3RvcnM7XG4iLCAiLyogXHUyNTAwXHUyNTAwIFYzLTkgOiBTY29yaW5nIHByZWRpY3RpZiBkZSByZWpldCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cbi8qIEV2YWx1ZSBsZSByaXNxdWUgZGUgcmVqZXQgQVZBTlQgc291bWlzc2lvbiBUUC4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuLyogTGUgbW9kZWxlIHV0aWxpc2UgbGVzIGRvbm5lZXMgaGlzdG9yaXF1ZXMgZHUgYmFja2VuZC4gICAgICAgICAgICAgICAgICAqL1xuXG52YXIgX3JlamVjdGlvbk1vZGVsID0gbnVsbDtcblxuZnVuY3Rpb24gbG9hZFJlamVjdGlvbk1vZGVsKCkge1xuICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoW1wiYXVkaWJvdF9yZWplY3Rpb25fbW9kZWxcIl0sIGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgIHZhciBjYWNoZWQgPSByZXN1bHQuYXVkaWJvdF9yZWplY3Rpb25fbW9kZWw7XG4gICAgaWYgKGNhY2hlZCAmJiBjYWNoZWQudHMgJiYgRGF0ZS5ub3coKSAtIGNhY2hlZC50cyA8IDg2NDAwMDAwKSB7XG4gICAgICBfcmVqZWN0aW9uTW9kZWwgPSBjYWNoZWQubW9kZWw7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0eXBlb2YgZ2V0U3luY1Rva2VuID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIGdldFN5bmNUb2tlbigpLnRoZW4oZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgICAgaWYgKCF0b2tlbikgcmV0dXJuO1xuICAgICAgICBmZXRjaChcImh0dHBzOi8vYXVkaWJvdC5mci9hcGkvZXh0ZW5zaW9uL3JlamVjdGlvbi1tb2RlbFwiLCB7XG4gICAgICAgICAgaGVhZGVyczogeyBcIkF1dGhvcml6YXRpb25cIjogXCJCZWFyZXIgXCIgKyB0b2tlbiB9XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHIpIHsgcmV0dXJuIHIuanNvbigpOyB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgX3JlamVjdGlvbk1vZGVsID0gZGF0YS5tb2RlbCB8fCBudWxsO1xuICAgICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7IGF1ZGlib3RfcmVqZWN0aW9uX21vZGVsOiB7IG1vZGVsOiBfcmVqZWN0aW9uTW9kZWwsIHRzOiBEYXRlLm5vdygpIH0gfSk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbihlcnIpIHsgY29uc29sZS53YXJuKFwiW0F1ZGlCb3RdIHJlamVjdGlvbiBtb2RlbCBmZXRjaCBmYWlsZWQ6XCIsIGVycik7IH0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gcHJlZGljdFJlamVjdGlvblJpc2soZmlsbERhdGEsIGhvc3RuYW1lKSB7XG4gIGlmICghX3JlamVjdGlvbk1vZGVsKSByZXR1cm4gbnVsbDtcblxuICB2YXIgcmlzayA9IDA7XG4gIHZhciBmYWN0b3JzID0gW107XG5cbiAgdmFyIHJ1bGVzID0gX3JlamVjdGlvbk1vZGVsLnJ1bGVzIHx8IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHJ1bGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHJ1bGUgPSBydWxlc1tpXTtcbiAgICAvKiBWZXJpZmllciBzaSBsYSByZWdsZSBzJ2FwcGxpcXVlIGEgY2UgcG9ydGFpbCAqL1xuICAgIGlmIChydWxlLmhvc3RuYW1lICYmIHJ1bGUuaG9zdG5hbWUgIT09IGhvc3RuYW1lKSBjb250aW51ZTtcblxuICAgIC8qIEV2YWx1ZXIgbGEgY29uZGl0aW9uICovXG4gICAgdmFyIG1hdGNoZXMgPSBmYWxzZTtcbiAgICBpZiAocnVsZS50eXBlID09PSBcIm1vbnRhbnRfbWF4XCIgJiYgZmlsbERhdGEubW9udGFudFRvdGFsKSB7XG4gICAgICBtYXRjaGVzID0gcGFyc2VGbG9hdChmaWxsRGF0YS5tb250YW50VG90YWwpID4gKHJ1bGUudGhyZXNob2xkIHx8IDApO1xuICAgIH0gZWxzZSBpZiAocnVsZS50eXBlID09PSBcIm9yZ2FuaXNtZVwiICYmIGZpbGxEYXRhLm9yZ2FuaXNtZSkge1xuICAgICAgbWF0Y2hlcyA9IHJ1bGUub3JnYW5pc21zICYmIHJ1bGUub3JnYW5pc21zLmluZGV4T2YoZmlsbERhdGEub3JnYW5pc21lLnRvTG93ZXJDYXNlKCkpICE9PSAtMTtcbiAgICB9IGVsc2UgaWYgKHJ1bGUudHlwZSA9PT0gXCJlcXVpcG1lbnRcIiAmJiBmaWxsRGF0YS5lcXVpcG1lbnRDb2RlKSB7XG4gICAgICBtYXRjaGVzID0gcnVsZS5jb2RlcyAmJiBydWxlLmNvZGVzLmluZGV4T2YoZmlsbERhdGEuZXF1aXBtZW50Q29kZSkgIT09IC0xO1xuICAgIH1cblxuICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICByaXNrICs9IHJ1bGUud2VpZ2h0IHx8IDEwO1xuICAgICAgZmFjdG9ycy5wdXNoKHtcbiAgICAgICAgcmVhc29uOiBydWxlLnJlYXNvbiB8fCBydWxlLnR5cGUsXG4gICAgICAgIGltcGFjdDogcnVsZS53ZWlnaHQgfHwgMTAsXG4gICAgICAgIHN1Z2dlc3Rpb246IHJ1bGUuc3VnZ2VzdGlvbiB8fCBudWxsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKiBOb3JtYWxpc2VyIGVudHJlIDAgZXQgMTAwICovXG4gIHJpc2sgPSBNYXRoLm1pbigxMDAsIE1hdGgubWF4KDAsIHJpc2spKTtcblxuICByZXR1cm4ge1xuICAgIHJpc2s6IHJpc2ssXG4gICAgbGV2ZWw6IHJpc2sgPCAyMCA/IFwibG93XCIgOiByaXNrIDwgNTAgPyBcIm1lZGl1bVwiIDogXCJoaWdoXCIsXG4gICAgZmFjdG9yczogZmFjdG9ycyxcbiAgICBzdWdnZXN0aW9uczogZmFjdG9ycy5maWx0ZXIoZnVuY3Rpb24oZikgeyByZXR1cm4gZi5zdWdnZXN0aW9uOyB9KS5tYXAoZnVuY3Rpb24oZikgeyByZXR1cm4gZi5zdWdnZXN0aW9uOyB9KVxuICB9O1xufVxuXG5mdW5jdGlvbiBzaG93UmVqZWN0aW9uUmlza0Jhbm5lcihwcmVkaWN0aW9uKSB7XG4gIGlmICghcHJlZGljdGlvbiB8fCBwcmVkaWN0aW9uLnJpc2sgPCAxNSkgcmV0dXJuO1xuXG4gIHZhciBleGlzdGluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXVkaWJvdC1yZWplY3Rpb24tcmlza1wiKTtcbiAgaWYgKGV4aXN0aW5nKSBleGlzdGluZy5yZW1vdmUoKTtcblxuICB2YXIgY29sb3JzID0geyBsb3c6IFwiIzA1OTY2OVwiLCBtZWRpdW06IFwiI2Q5NzcwNlwiLCBoaWdoOiBcIiNkYzI2MjZcIiB9O1xuICB2YXIgbGFiZWxzID0geyBsb3c6IFwiRmFpYmxlXCIsIG1lZGl1bTogXCJNb3llblwiLCBoaWdoOiBcIkVsZXZlXCIgfTtcblxuICB2YXIgYmFubmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgYmFubmVyLmlkID0gXCJhdWRpYm90LXJlamVjdGlvbi1yaXNrXCI7XG4gIGJhbm5lci5zdHlsZS5jc3NUZXh0ID0gXCJwb3NpdGlvbjpmaXhlZDt0b3A6MTZweDtyaWdodDoxNnB4O3otaW5kZXg6MjE0NzQ4MzY0NztiYWNrZ3JvdW5kOndoaXRlO2JvcmRlci1yYWRpdXM6MTJweDtwYWRkaW5nOjE2cHggMjBweDtib3gtc2hhZG93OjAgOHB4IDMwcHggcmdiYSgwLDAsMCwwLjE1KTtmb250LWZhbWlseTotYXBwbGUtc3lzdGVtLEJsaW5rTWFjU3lzdGVtRm9udCxzYW5zLXNlcmlmO21heC13aWR0aDozNjBweDtib3JkZXItbGVmdDo0cHggc29saWQgXCIgKyBjb2xvcnNbcHJlZGljdGlvbi5sZXZlbF0gKyBcIjtcIjtcblxuICB2YXIgaGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgaGVhZGVyLnN0eWxlLmNzc1RleHQgPSBcImRpc3BsYXk6ZmxleDtqdXN0aWZ5LWNvbnRlbnQ6c3BhY2UtYmV0d2VlbjthbGlnbi1pdGVtczpjZW50ZXI7bWFyZ2luLWJvdHRvbTo4cHg7XCI7XG4gIGhlYWRlci5pbm5lckhUTUwgPSAnPHNwYW4gc3R5bGU9XCJmb250LXNpemU6MTRweDtmb250LXdlaWdodDo3MDA7Y29sb3I6IzExMTtcIj5SaXNxdWUgZGUgcmVqZXQgOiAnICsgcHJlZGljdGlvbi5yaXNrICsgJyU8L3NwYW4+PHNwYW4gc3R5bGU9XCJmb250LXNpemU6MTFweDtwYWRkaW5nOjJweCA4cHg7Ym9yZGVyLXJhZGl1czo0cHg7YmFja2dyb3VuZDonICsgY29sb3JzW3ByZWRpY3Rpb24ubGV2ZWxdICsgJztjb2xvcjp3aGl0ZTtmb250LXdlaWdodDo2MDA7XCI+JyArIGxhYmVsc1twcmVkaWN0aW9uLmxldmVsXSArICc8L3NwYW4+JztcbiAgYmFubmVyLmFwcGVuZENoaWxkKGhlYWRlcik7XG5cbiAgaWYgKHByZWRpY3Rpb24uZmFjdG9ycy5sZW5ndGggPiAwKSB7XG4gICAgdmFyIGZhY3Rvckxpc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGZhY3Rvckxpc3Quc3R5bGUuY3NzVGV4dCA9IFwiZm9udC1zaXplOjEycHg7Y29sb3I6IzZiNzI4MDtcIjtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByZWRpY3Rpb24uZmFjdG9ycy5sZW5ndGggJiYgaSA8IDM7IGkrKykge1xuICAgICAgdmFyIGYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgZi5zdHlsZS5jc3NUZXh0ID0gXCJwYWRkaW5nOjJweCAwO1wiO1xuICAgICAgZi50ZXh0Q29udGVudCA9IFwiXFx1MjAyMiBcIiArIHByZWRpY3Rpb24uZmFjdG9yc1tpXS5yZWFzb247XG4gICAgICBmYWN0b3JMaXN0LmFwcGVuZENoaWxkKGYpO1xuICAgIH1cbiAgICBiYW5uZXIuYXBwZW5kQ2hpbGQoZmFjdG9yTGlzdCk7XG4gIH1cblxuICBpZiAocHJlZGljdGlvbi5zdWdnZXN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgdmFyIHN1Z2dCb3ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHN1Z2dCb3guc3R5bGUuY3NzVGV4dCA9IFwibWFyZ2luLXRvcDo4cHg7cGFkZGluZzo4cHg7YmFja2dyb3VuZDojZjBmZGY0O2JvcmRlci1yYWRpdXM6NnB4O2ZvbnQtc2l6ZToxMnB4O2NvbG9yOiMwNjVmNDY7XCI7XG4gICAgc3VnZ0JveC50ZXh0Q29udGVudCA9IFwiU3VnZ2VzdGlvbiA6IFwiICsgcHJlZGljdGlvbi5zdWdnZXN0aW9uc1swXTtcbiAgICBiYW5uZXIuYXBwZW5kQ2hpbGQoc3VnZ0JveCk7XG4gIH1cblxuICB2YXIgY2xvc2VCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICBjbG9zZUJ0bi50ZXh0Q29udGVudCA9IFwiXFx1MDBkN1wiO1xuICBjbG9zZUJ0bi5zdHlsZS5jc3NUZXh0ID0gXCJwb3NpdGlvbjphYnNvbHV0ZTt0b3A6OHB4O3JpZ2h0OjhweDtiYWNrZ3JvdW5kOm5vbmU7Ym9yZGVyOm5vbmU7Zm9udC1zaXplOjE4cHg7Y29sb3I6IzljYTNhZjtjdXJzb3I6cG9pbnRlcjtcIjtcbiAgY2xvc2VCdG4ub25jbGljayA9IGZ1bmN0aW9uKCkgeyBiYW5uZXIucmVtb3ZlKCk7IH07XG4gIGJhbm5lci5hcHBlbmRDaGlsZChjbG9zZUJ0bik7XG5cbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChiYW5uZXIpO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBiYW5uZXIucmVtb3ZlKCk7IH0sIDE1MDAwKTtcbn1cblxuZ2xvYmFsVGhpcy5sb2FkUmVqZWN0aW9uTW9kZWwgPSBsb2FkUmVqZWN0aW9uTW9kZWw7XG5nbG9iYWxUaGlzLnByZWRpY3RSZWplY3Rpb25SaXNrID0gcHJlZGljdFJlamVjdGlvblJpc2s7XG5nbG9iYWxUaGlzLnNob3dSZWplY3Rpb25SaXNrQmFubmVyID0gc2hvd1JlamVjdGlvblJpc2tCYW5uZXI7XG4iLCAiLyogQXVkaUJvdCBDb21tYW5kIENlbnRlciBcdTIwMTQgTWluaSBkYXNoYm9hcmQgZmxvdHRhbnQgc3VyIGxlcyBwb3J0YWlscyAqL1xuLyogSW5qZWN0ZSB2aWEgU2hhZG93IERPTSBwb3VyIGlzb2xhdGlvbiBDU1MgY29tcGxldGUgKi9cblxudmFyIENDX1NUT1JBR0VfS0VZID0gXCJhdWRpYm90X2NjX3N0YXRlXCI7XG5cbmZ1bmN0aW9uIGNyZWF0ZUNvbW1hbmRDZW50ZXIoKSB7XG4gIGlmIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF1ZGlib3QtY29tbWFuZC1jZW50ZXJcIikpIHJldHVybjtcblxuICB2YXIgaG9zdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIGhvc3QuaWQgPSBcImF1ZGlib3QtY29tbWFuZC1jZW50ZXJcIjtcbiAgaG9zdC5zdHlsZS5jc3NUZXh0ID0gXCJwb3NpdGlvbjpmaXhlZDt6LWluZGV4OjIxNDc0ODM2NDc7XCI7XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaG9zdCk7XG5cbiAgdmFyIHNoYWRvdyA9IGhvc3QuYXR0YWNoU2hhZG93KHsgbW9kZTogXCJjbG9zZWRcIiB9KTtcblxuICB2YXIgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gIHN0eWxlLnRleHRDb250ZW50ID0gZ2V0Q29tbWFuZENlbnRlckNTUygpO1xuICBzaGFkb3cuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuXG4gIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBjb250YWluZXIuY2xhc3NOYW1lID0gXCJjYy1jb250YWluZXJcIjtcbiAgc2hhZG93LmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG5cbiAgLyogQ2hhcmdlciBsYSBwb3NpdGlvbiBldCBsZSBtb2RlIHNhdXZlZ2FyZGVzICovXG4gIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbQ0NfU1RPUkFHRV9LRVldLCBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICB2YXIgc3RhdGUgPSByZXN1bHRbQ0NfU1RPUkFHRV9LRVldIHx8IHt9O1xuICAgIHZhciB4ID0gc3RhdGUueCAhPSBudWxsID8gc3RhdGUueCA6IHdpbmRvdy5pbm5lcldpZHRoIC0gMzYwO1xuICAgIHZhciB5ID0gc3RhdGUueSAhPSBudWxsID8gc3RhdGUueSA6IDgwO1xuICAgIGhvc3Quc3R5bGUubGVmdCA9IE1hdGgubWF4KDAsIE1hdGgubWluKHgsIHdpbmRvdy5pbm5lcldpZHRoIC0gNTApKSArIFwicHhcIjtcbiAgICBob3N0LnN0eWxlLnRvcCA9IE1hdGgubWF4KDAsIE1hdGgubWluKHksIHdpbmRvdy5pbm5lckhlaWdodCAtIDUwKSkgKyBcInB4XCI7XG5cbiAgICAvKiBtb2RlOiBcIm1pbmltaXplZFwiLCBcImNvbGxhcHNlZFwiLCBcImV4cGFuZGVkXCIgKi9cbiAgICB2YXIgbW9kZSA9IHN0YXRlLm1vZGUgfHwgXCJjb2xsYXBzZWRcIjtcbiAgICByZW5kZXJDb21tYW5kQ2VudGVyKHNoYWRvdywgY29udGFpbmVyLCBob3N0LCBtb2RlKTtcbiAgfSk7XG5cbiAgLyogU1NFIEV2ZW50IExpc3RlbmVyIFx1MjAxNCByZS1yZW5kZXIgb24gY2FjaGUgdXBkYXRlIGZyb20gYmFja2dyb3VuZCAqL1xuICBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoZnVuY3Rpb24obWVzc2FnZSkge1xuICAgIGlmIChtZXNzYWdlICYmIG1lc3NhZ2UudHlwZSA9PT0gXCJBVURJQk9UX1NTRV9FVkVOVFwiKSB7XG4gICAgICByZWFkRW5jcnlwdGVkQ2FjaGUoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAvKiBEZXRlcm1pbmUgY3VycmVudCBtb2RlIGZyb20gc3RvcmFnZSBiZWZvcmUgcmUtcmVuZGVyaW5nICovXG4gICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbQ0NfU1RPUkFHRV9LRVldLCBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICB2YXIgc3RhdGUgPSByZXN1bHRbQ0NfU1RPUkFHRV9LRVldIHx8IHt9O1xuICAgICAgICAgIHZhciBtb2RlID0gc3RhdGUubW9kZSB8fCBcImNvbGxhcHNlZFwiO1xuICAgICAgICAgIHJlbmRlckNvbW1hbmRDZW50ZXIoc2hhZG93LCBjb250YWluZXIsIGhvc3QsIG1vZGUpO1xuXG4gICAgICAgICAgLyogRmxhc2ggdGhlIHN0YXR1cyBkb3QgZ3JlZW4gYnJpZWZseSAqL1xuICAgICAgICAgIGZsYXNoU3RhdHVzRG90KHNoYWRvdyk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gZmxhc2hTdGF0dXNEb3Qoc2hhZG93KSB7XG4gIHZhciBkb3QgPSBzaGFkb3cucXVlcnlTZWxlY3RvcihcIi5jYy1zdGF0dXMtZG90XCIpO1xuICBpZiAoIWRvdCkge1xuICAgIGRvdCA9IHNoYWRvdy5xdWVyeVNlbGVjdG9yKFwiLmNjLW1pbmktZG90XCIpO1xuICB9XG4gIGlmIChkb3QpIHtcbiAgICBkb3Quc3R5bGUuYmFja2dyb3VuZCA9IFwiIzEwYjk4MVwiO1xuICAgIGRvdC5zdHlsZS5ib3hTaGFkb3cgPSBcIjAgMCA4cHggIzEwYjk4MVwiO1xuICAgIGRvdC5jbGFzc0xpc3QuYWRkKFwiY2MtZG90LWZsYXNoXCIpO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBkb3QuY2xhc3NMaXN0LnJlbW92ZShcImNjLWRvdC1mbGFzaFwiKTtcbiAgICAgIGRvdC5zdHlsZS5ib3hTaGFkb3cgPSBcIlwiO1xuICAgIH0sIDE1MDApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFN0YXR1c0NvbG9yKGRhdGEpIHtcbiAgaWYgKCFkYXRhIHx8ICFkYXRhLm5vbSkgcmV0dXJuIFwiI2VmNDQ0NFwiO1xuICB2YXIgaGFzTnNzID0gISEoZGF0YS5uc3MgfHwgZGF0YS5udW1lcm9TZWN1cml0ZVNvY2lhbGUpO1xuICBpZiAoZGF0YS5ub20gJiYgaGFzTnNzKSByZXR1cm4gXCIjMTBiOTgxXCI7XG4gIHJldHVybiBcIiNmNTllMGJcIjtcbn1cblxuZnVuY3Rpb24gcmVuZGVyQ29tbWFuZENlbnRlcihzaGFkb3csIGNvbnRhaW5lciwgaG9zdCwgbW9kZSkge1xuICByZWFkRW5jcnlwdGVkQ2FjaGUoKS50aGVuKGZ1bmN0aW9uKGNhY2hlKSB7XG4gICAgdmFyIGRhdGEgPSBjYWNoZSAmJiBjYWNoZS5jdXJyZW50ID8gY2FjaGUuY3VycmVudCA6IG51bGw7XG4gICAgdmFyIHN0YXR1c0NvbG9yID0gZ2V0U3RhdHVzQ29sb3IoZGF0YSk7XG4gICAgY29udGFpbmVyLmlubmVySFRNTCA9IFwiXCI7XG5cbiAgICBpZiAobW9kZSA9PT0gXCJtaW5pbWl6ZWRcIikge1xuICAgICAgcmVuZGVyTWluaUJ1dHRvbihzaGFkb3csIGNvbnRhaW5lciwgaG9zdCwgc3RhdHVzQ29sb3IpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBjb2xsYXBzZWQgPSAobW9kZSA9PT0gXCJjb2xsYXBzZWRcIik7XG5cbiAgICAvKiBIZWFkZXIgKi9cbiAgICB2YXIgaGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBoZWFkZXIuY2xhc3NOYW1lID0gXCJjYy1oZWFkZXJcIjtcblxuICAgIHZhciBsb2dvV3JhcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgIGxvZ29XcmFwLmNsYXNzTmFtZSA9IFwiY2MtbG9nby13cmFwXCI7XG5cbiAgICB2YXIgbG9nb1RleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICBsb2dvVGV4dC5jbGFzc05hbWUgPSBcImNjLWxvZ29cIjtcbiAgICBsb2dvVGV4dC50ZXh0Q29udGVudCA9IFwiQXVkaUJvdFwiO1xuICAgIGxvZ29XcmFwLmFwcGVuZENoaWxkKGxvZ29UZXh0KTtcblxuICAgIC8qIFN0YXR1cyBkb3QgKi9cbiAgICB2YXIgc3RhdHVzRG90ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgc3RhdHVzRG90LmNsYXNzTmFtZSA9IFwiY2Mtc3RhdHVzLWRvdFwiO1xuICAgIGlmIChzdGF0dXNDb2xvciA9PT0gXCIjMTBiOTgxXCIpIHtcbiAgICAgIHN0YXR1c0RvdC5jbGFzc0xpc3QuYWRkKFwiY2MtZG90LXB1bHNlXCIpO1xuICAgIH1cbiAgICBzdGF0dXNEb3Quc3R5bGUuYmFja2dyb3VuZCA9IHN0YXR1c0NvbG9yO1xuICAgIGxvZ29XcmFwLmFwcGVuZENoaWxkKHN0YXR1c0RvdCk7XG5cbiAgICBoZWFkZXIuYXBwZW5kQ2hpbGQobG9nb1dyYXApO1xuXG4gICAgLyogRHJhZyBoYW5kbGUgKi9cbiAgICBtYWtlRHJhZ2dhYmxlKGhvc3QsIGhlYWRlcik7XG5cbiAgICAvKiBIZWFkZXIgYnV0dG9ucyB3cmFwcGVyICovXG4gICAgdmFyIGhlYWRlckJ0bnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICBoZWFkZXJCdG5zLmNsYXNzTmFtZSA9IFwiY2MtaGVhZGVyLWJ0bnNcIjtcblxuICAgIC8qIE1pbmltaXplIGJ1dHRvbiAqL1xuICAgIHZhciBtaW5CdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICAgIG1pbkJ0bi5jbGFzc05hbWUgPSBcImNjLWJ0bi10b2dnbGUgY2MtYnRuLW1pbmltaXplXCI7XG4gICAgbWluQnRuLmlubmVySFRNTCA9IFwiJiN4MjUwMDtcIjtcbiAgICBtaW5CdG4udGl0bGUgPSBcIk1pbmltaXNlclwiO1xuICAgIG1pbkJ0bi5vbmNsaWNrID0gZnVuY3Rpb24oZSkge1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIHNhdmVTdGF0ZShob3N0LCBcIm1pbmltaXplZFwiKTtcbiAgICAgIHJlbmRlckNvbW1hbmRDZW50ZXIoc2hhZG93LCBjb250YWluZXIsIGhvc3QsIFwibWluaW1pemVkXCIpO1xuICAgIH07XG4gICAgaGVhZGVyQnRucy5hcHBlbmRDaGlsZChtaW5CdG4pO1xuXG4gICAgLyogVG9nZ2xlIGJ1dHRvbiAqL1xuICAgIHZhciB0b2dnbGVCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICAgIHRvZ2dsZUJ0bi5jbGFzc05hbWUgPSBcImNjLWJ0bi10b2dnbGVcIjtcbiAgICB0b2dnbGVCdG4uaW5uZXJIVE1MID0gY29sbGFwc2VkID8gXCImI3gyNUJDO1wiIDogXCImI3gyNUIyO1wiO1xuICAgIHRvZ2dsZUJ0bi50aXRsZSA9IGNvbGxhcHNlZCA/IFwiT3V2cmlyXCIgOiBcIlJlZHVpcmVcIjtcbiAgICB0b2dnbGVCdG4ub25jbGljayA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICB2YXIgbmV3TW9kZSA9IGNvbGxhcHNlZCA/IFwiZXhwYW5kZWRcIiA6IFwiY29sbGFwc2VkXCI7XG4gICAgICBzYXZlU3RhdGUoaG9zdCwgbmV3TW9kZSk7XG4gICAgICByZW5kZXJDb21tYW5kQ2VudGVyKHNoYWRvdywgY29udGFpbmVyLCBob3N0LCBuZXdNb2RlKTtcbiAgICB9O1xuICAgIGhlYWRlckJ0bnMuYXBwZW5kQ2hpbGQodG9nZ2xlQnRuKTtcblxuICAgIGhlYWRlci5hcHBlbmRDaGlsZChoZWFkZXJCdG5zKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoaGVhZGVyKTtcblxuICAgIGlmIChjb2xsYXBzZWQpIHJldHVybjtcblxuICAgIGlmICghZGF0YSB8fCAhZGF0YS5ub20pIHtcbiAgICAgIHZhciBlbXB0eSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICBlbXB0eS5jbGFzc05hbWUgPSBcImNjLWVtcHR5XCI7XG4gICAgICBlbXB0eS50ZXh0Q29udGVudCA9IFwiQXVjdW5lIGRvbm5lZSBwYXRpZW50LiBTY2FubmV6IHVuIGRvY3VtZW50IGRlcHVpcyBsZSBkYXNoYm9hcmQgQXVkaUJvdC5cIjtcbiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChlbXB0eSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLyogRXRhdCBDaXZpbCAqL1xuICAgIGFkZFNlY3Rpb24oY29udGFpbmVyLCBcIkV0YXQgQ2l2aWxcIiwgW1xuICAgICAgeyBsYWJlbDogXCJOb21cIiwgdmFsdWU6IChkYXRhLm5vbSB8fCBcIlwiKS50b1VwcGVyQ2FzZSgpIH0sXG4gICAgICB7IGxhYmVsOiBcIlByZW5vbVwiLCB2YWx1ZTogZGF0YS5wcmVub20gfHwgXCJcIiB9LFxuICAgICAgeyBsYWJlbDogXCJEYXRlIG5haXNzYW5jZVwiLCB2YWx1ZTogZGF0YS5kYXRlTmFpc3NhbmNlIHx8IGRhdGEuZG9iIHx8IFwiXCIgfSxcbiAgICAgIHsgbGFiZWw6IFwiTlNTXCIsIHZhbHVlOiBkYXRhLm51bWVyb1NlY3VyaXRlU29jaWFsZSB8fCBkYXRhLm5zcyB8fCBcIlwiIH0sXG4gICAgXSk7XG5cbiAgICAvKiBNdXR1ZWxsZSAqL1xuICAgIGFkZFNlY3Rpb24oY29udGFpbmVyLCBcIk11dHVlbGxlXCIsIFtcbiAgICAgIHsgbGFiZWw6IFwiT3JnYW5pc21lXCIsIHZhbHVlOiBkYXRhLm9yZ2FuaXNtZSB8fCBcIlwiIH0sXG4gICAgICB7IGxhYmVsOiBcIk4uIEFkaGVyZW50XCIsIHZhbHVlOiBkYXRhLm51bWVyb0FkaGVyZW50IHx8IFwiXCIgfSxcbiAgICAgIHsgbGFiZWw6IFwiTi4gQU1DXCIsIHZhbHVlOiBkYXRhLm51bWVyb0FNQyB8fCBcIlwiIH0sXG4gICAgICB7IGxhYmVsOiBcIk4uIFRlbGV0cmFucy5cIiwgdmFsdWU6IGRhdGEubnVtZXJvVGVsZXRyYW5zbWlzc2lvbiB8fCBcIlwiIH0sXG4gICAgICB7IGxhYmVsOiBcIlR5cGUgQ29udi5cIiwgdmFsdWU6IGRhdGEudHlwZUNvbnYgfHwgXCJcIiB9LFxuICAgICAgeyBsYWJlbDogXCJWYWxpZGl0ZVwiLCB2YWx1ZTogKGRhdGEuZGF0ZURlYnV0VmFsaWRpdGUgfHwgXCJcIikgKyAoZGF0YS5kYXRlRmluVmFsaWRpdGUgPyBcIiAtIFwiICsgZGF0YS5kYXRlRmluVmFsaWRpdGUgOiBcIlwiKSB9LFxuICAgIF0pO1xuXG4gICAgLyogT3Jkb25uYW5jZSAqL1xuICAgIHZhciBvID0gZGF0YS5vcmRvbm5hbmNlIHx8IHt9O1xuICAgIGlmIChvLmx1bmV0dGVzT0QgfHwgby5sdW5ldHRlc09HIHx8IG8uZGF0ZU9yZG9ubmFuY2UpIHtcbiAgICAgIHZhciBvcmRvRmllbGRzID0gW1xuICAgICAgICB7IGxhYmVsOiBcIkRhdGUgb3Jkby5cIiwgdmFsdWU6IG8uZGF0ZU9yZG9ubmFuY2UgfHwgXCJcIiB9LFxuICAgICAgICB7IGxhYmVsOiBcIkRQXCIsIHZhbHVlOiBvLmRpc3RhbmNlUHVwaWxsYWlyZSB8fCBcIlwiIH0sXG4gICAgICBdO1xuICAgICAgaWYgKG8ubHVuZXR0ZXNPRCkge1xuICAgICAgICB2YXIgb2QgPSBvLmx1bmV0dGVzT0Q7XG4gICAgICAgIG9yZG9GaWVsZHMucHVzaCh7IGxhYmVsOiBcIk9EXCIsIHZhbHVlOiBmb3JtYXRDb3JyZWN0aW9uKG9kKSB9KTtcbiAgICAgIH1cbiAgICAgIGlmIChvLmx1bmV0dGVzT0cpIHtcbiAgICAgICAgdmFyIG9nID0gby5sdW5ldHRlc09HO1xuICAgICAgICBvcmRvRmllbGRzLnB1c2goeyBsYWJlbDogXCJPR1wiLCB2YWx1ZTogZm9ybWF0Q29ycmVjdGlvbihvZykgfSk7XG4gICAgICB9XG4gICAgICBpZiAoby5sdW5ldHRlc09EICYmIG8ubHVuZXR0ZXNPRC5hZGRpdGlvbikge1xuICAgICAgICBvcmRvRmllbGRzLnB1c2goeyBsYWJlbDogXCJBZGRpdGlvblwiLCB2YWx1ZTogby5sdW5ldHRlc09ELmFkZGl0aW9uIH0pO1xuICAgICAgfVxuICAgICAgYWRkU2VjdGlvbihjb250YWluZXIsIFwiT3Jkb25uYW5jZVwiLCBvcmRvRmllbGRzKTtcbiAgICB9XG5cbiAgICAvKiBBY3Rpb24gYnV0dG9ucyAqL1xuICAgIHZhciBhY3Rpb25zID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBhY3Rpb25zLmNsYXNzTmFtZSA9IFwiY2MtYWN0aW9uc1wiO1xuXG4gICAgdmFyIGZpbGxCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICAgIGZpbGxCdG4uY2xhc3NOYW1lID0gXCJjYy1idG4gY2MtYnRuLWZpbGxcIjtcbiAgICBmaWxsQnRuLnRleHRDb250ZW50ID0gXCJSZW1wbGlyXCI7XG4gICAgZmlsbEJ0bi5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcGFnZUJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXVkaWJvdC1maWxsLWJ0blwiKTtcbiAgICAgIGlmIChwYWdlQnRuKSBwYWdlQnRuLmNsaWNrKCk7XG4gICAgfTtcbiAgICBhY3Rpb25zLmFwcGVuZENoaWxkKGZpbGxCdG4pO1xuXG4gICAgdmFyIHNjYW5CdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICAgIHNjYW5CdG4uY2xhc3NOYW1lID0gXCJjYy1idG4gY2MtYnRuLXNjYW5cIjtcbiAgICBzY2FuQnRuLnRleHRDb250ZW50ID0gXCJSZXNjYW5uZXJcIjtcbiAgICBzY2FuQnRuLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHsgdHlwZTogXCJBVURJQk9UX09QRU5fVEFCXCIsIHVybDogXCJodHRwczovL2F1ZGlib3QuZnIvZGFzaGJvYXJkXCIgfSk7XG4gICAgfTtcbiAgICBhY3Rpb25zLmFwcGVuZENoaWxkKHNjYW5CdG4pO1xuXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGFjdGlvbnMpO1xuICB9KS5jYXRjaChmdW5jdGlvbigpIHtcbiAgICBjb250YWluZXIuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJjYy1lbXB0eVwiPkVycmV1ciBkZSBsZWN0dXJlIGR1IGNhY2hlLjwvZGl2Pic7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZW5kZXJNaW5pQnV0dG9uKHNoYWRvdywgY29udGFpbmVyLCBob3N0LCBzdGF0dXNDb2xvcikge1xuICBjb250YWluZXIuY2xhc3NOYW1lID0gXCJjYy1jb250YWluZXIgY2MtbWluaW1pemVkXCI7XG5cbiAgdmFyIG1pbmlCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBtaW5pQnRuLmNsYXNzTmFtZSA9IFwiY2MtbWluaS1idG5cIjtcblxuICB2YXIgbWluaUxldHRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICBtaW5pTGV0dGVyLmNsYXNzTmFtZSA9IFwiY2MtbWluaS1sZXR0ZXJcIjtcbiAgbWluaUxldHRlci50ZXh0Q29udGVudCA9IFwiT1wiO1xuICBtaW5pQnRuLmFwcGVuZENoaWxkKG1pbmlMZXR0ZXIpO1xuXG4gIC8qIFN0YXR1cyBiYWRnZSBvbiBtaW5pIGJ1dHRvbiAqL1xuICB2YXIgbWluaUJhZGdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gIG1pbmlCYWRnZS5jbGFzc05hbWUgPSBcImNjLW1pbmktZG90XCI7XG4gIGlmIChzdGF0dXNDb2xvciA9PT0gXCIjMTBiOTgxXCIpIHtcbiAgICBtaW5pQmFkZ2UuY2xhc3NMaXN0LmFkZChcImNjLWRvdC1wdWxzZVwiKTtcbiAgfVxuICBtaW5pQmFkZ2Uuc3R5bGUuYmFja2dyb3VuZCA9IHN0YXR1c0NvbG9yO1xuICBtaW5pQnRuLmFwcGVuZENoaWxkKG1pbmlCYWRnZSk7XG5cbiAgLyogRHJhZyBoYW5kbGUgb24gbWluaSBidXR0b24gKi9cbiAgbWFrZURyYWdnYWJsZShob3N0LCBtaW5pQnRuKTtcblxuICAvKiBDbGljayB0byBleHBhbmQgdG8gY29sbGFwc2VkICovXG4gIG1pbmlCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICAvKiBJZ25vcmUgaWYgdGhpcyB3YXMgYSBkcmFnICovXG4gICAgaWYgKG1pbmlCdG4uX3dhc0RyYWdnZWQpIHtcbiAgICAgIG1pbmlCdG4uX3dhc0RyYWdnZWQgPSBmYWxzZTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICBjb250YWluZXIuY2xhc3NOYW1lID0gXCJjYy1jb250YWluZXJcIjtcbiAgICBzYXZlU3RhdGUoaG9zdCwgXCJjb2xsYXBzZWRcIik7XG4gICAgcmVuZGVyQ29tbWFuZENlbnRlcihzaGFkb3csIGNvbnRhaW5lciwgaG9zdCwgXCJjb2xsYXBzZWRcIik7XG4gIH0pO1xuXG4gIGNvbnRhaW5lci5hcHBlbmRDaGlsZChtaW5pQnRuKTtcbn1cblxuZnVuY3Rpb24gYWRkU2VjdGlvbihjb250YWluZXIsIHRpdGxlLCBmaWVsZHMpIHtcbiAgdmFyIGZpbHRlcmVkRmllbGRzID0gZmllbGRzLmZpbHRlcihmdW5jdGlvbihmKSB7IHJldHVybiBmLnZhbHVlOyB9KTtcbiAgaWYgKGZpbHRlcmVkRmllbGRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gIHZhciBzZWN0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgc2VjdGlvbi5jbGFzc05hbWUgPSBcImNjLXNlY3Rpb25cIjtcblxuICB2YXIgc1RpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgc1RpdGxlLmNsYXNzTmFtZSA9IFwiY2Mtc2VjdGlvbi10aXRsZVwiO1xuICBzVGl0bGUudGV4dENvbnRlbnQgPSB0aXRsZTtcbiAgc2VjdGlvbi5hcHBlbmRDaGlsZChzVGl0bGUpO1xuXG4gIGZpbHRlcmVkRmllbGRzLmZvckVhY2goZnVuY3Rpb24oZmllbGQpIHtcbiAgICB2YXIgcm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICByb3cuY2xhc3NOYW1lID0gXCJjYy1maWVsZFwiO1xuXG4gICAgdmFyIGxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgbGFiZWwuY2xhc3NOYW1lID0gXCJjYy1sYWJlbFwiO1xuICAgIGxhYmVsLnRleHRDb250ZW50ID0gZmllbGQubGFiZWw7XG4gICAgcm93LmFwcGVuZENoaWxkKGxhYmVsKTtcblxuICAgIHZhciB2YWx1ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgIHZhbHVlLmNsYXNzTmFtZSA9IFwiY2MtdmFsdWVcIjtcbiAgICB2YWx1ZS50ZXh0Q29udGVudCA9IGZpZWxkLnZhbHVlO1xuICAgIHJvdy5hcHBlbmRDaGlsZCh2YWx1ZSk7XG5cbiAgICB2YXIgY29weUJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgY29weUJ0bi5jbGFzc05hbWUgPSBcImNjLWJ0bi1jb3B5XCI7XG4gICAgY29weUJ0bi5pbm5lckhUTUwgPSBcIiYjeDIzOTg7XCI7XG4gICAgY29weUJ0bi50aXRsZSA9IFwiQ29waWVyXCI7XG4gICAgY29weUJ0bi5vbmNsaWNrID0gZnVuY3Rpb24oZSkge1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KGZpZWxkLnZhbHVlKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBjb3B5QnRuLmlubmVySFRNTCA9IFwiJiN4MjcxMztcIjtcbiAgICAgICAgY29weUJ0bi5zdHlsZS5jb2xvciA9IFwiIzEwYjk4MVwiO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGNvcHlCdG4uaW5uZXJIVE1MID0gXCImI3gyMzk4O1wiO1xuICAgICAgICAgIGNvcHlCdG4uc3R5bGUuY29sb3IgPSBcIlwiO1xuICAgICAgICB9LCAxNTAwKTtcbiAgICAgIH0pO1xuICAgIH07XG4gICAgcm93LmFwcGVuZENoaWxkKGNvcHlCdG4pO1xuXG4gICAgc2VjdGlvbi5hcHBlbmRDaGlsZChyb3cpO1xuICB9KTtcblxuICBjb250YWluZXIuYXBwZW5kQ2hpbGQoc2VjdGlvbik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdENvcnJlY3Rpb24oYykge1xuICBpZiAoIWMpIHJldHVybiBcIlwiO1xuICB2YXIgcGFydHMgPSBbXTtcbiAgaWYgKGMuc3BoZXJlKSBwYXJ0cy5wdXNoKFwiU3BoIFwiICsgYy5zcGhlcmUpO1xuICBpZiAoYy5jeWxpbmRyZSAmJiBjLmN5bGluZHJlICE9PSBcIjBcIiAmJiBjLmN5bGluZHJlICE9PSBcIjAuMDBcIikgcGFydHMucHVzaChcIkN5bCBcIiArIGMuY3lsaW5kcmUpO1xuICBpZiAoYy5heGUgJiYgYy5heGUgIT09IFwiMFwiKSBwYXJ0cy5wdXNoKFwiQXhlIFwiICsgYy5heGUpO1xuICBpZiAoYy5hZGRpdGlvbikgcGFydHMucHVzaChcIkFkZCBcIiArIGMuYWRkaXRpb24pO1xuICByZXR1cm4gcGFydHMuam9pbihcIiAgXCIpO1xufVxuXG5mdW5jdGlvbiBtYWtlRHJhZ2dhYmxlKGhvc3QsIGhhbmRsZSkge1xuICB2YXIgc3RhcnRYLCBzdGFydFksIG9yaWdYLCBvcmlnWSwgZHJhZ2dpbmc7XG4gIGhhbmRsZS5zdHlsZS5jdXJzb3IgPSBcImdyYWJcIjtcblxuICBoYW5kbGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBmdW5jdGlvbihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHN0YXJ0WCA9IGUuY2xpZW50WDtcbiAgICBzdGFydFkgPSBlLmNsaWVudFk7XG4gICAgb3JpZ1ggPSBwYXJzZUludChob3N0LnN0eWxlLmxlZnQpIHx8IDA7XG4gICAgb3JpZ1kgPSBwYXJzZUludChob3N0LnN0eWxlLnRvcCkgfHwgMDtcbiAgICBkcmFnZ2luZyA9IGZhbHNlO1xuICAgIGhhbmRsZS5zdHlsZS5jdXJzb3IgPSBcImdyYWJiaW5nXCI7XG5cbiAgICBmdW5jdGlvbiBvbk1vdmUoZTIpIHtcbiAgICAgIHZhciBkeCA9IGUyLmNsaWVudFggLSBzdGFydFg7XG4gICAgICB2YXIgZHkgPSBlMi5jbGllbnRZIC0gc3RhcnRZO1xuICAgICAgaWYgKCFkcmFnZ2luZyAmJiAoTWF0aC5hYnMoZHgpID4gMyB8fCBNYXRoLmFicyhkeSkgPiAzKSkge1xuICAgICAgICBkcmFnZ2luZyA9IHRydWU7XG4gICAgICB9XG4gICAgICBob3N0LnN0eWxlLmxlZnQgPSAob3JpZ1ggKyBkeCkgKyBcInB4XCI7XG4gICAgICBob3N0LnN0eWxlLnRvcCA9IChvcmlnWSArIGR5KSArIFwicHhcIjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvblVwKCkge1xuICAgICAgaGFuZGxlLnN0eWxlLmN1cnNvciA9IFwiZ3JhYlwiO1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBvbk1vdmUpO1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgb25VcCk7XG4gICAgICBpZiAoZHJhZ2dpbmcpIHtcbiAgICAgICAgaGFuZGxlLl93YXNEcmFnZ2VkID0gdHJ1ZTtcbiAgICAgICAgc2F2ZVN0YXRlKGhvc3QsIG51bGwpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgb25Nb3ZlKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBvblVwKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHNhdmVTdGF0ZShob3N0LCBtb2RlKSB7XG4gIHZhciBzdGF0ZSA9IHtcbiAgICB4OiBwYXJzZUludChob3N0LnN0eWxlLmxlZnQpIHx8IDAsXG4gICAgeTogcGFyc2VJbnQoaG9zdC5zdHlsZS50b3ApIHx8IDAsXG4gIH07XG4gIGlmIChtb2RlICE9PSBudWxsKSBzdGF0ZS5tb2RlID0gbW9kZTtcblxuICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoW0NDX1NUT1JBR0VfS0VZXSwgZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgdmFyIHByZXYgPSByZXN1bHRbQ0NfU1RPUkFHRV9LRVldIHx8IHt9O1xuICAgIHZhciBtZXJnZWQgPSBPYmplY3QuYXNzaWduKHt9LCBwcmV2LCBzdGF0ZSk7XG4gICAgdmFyIG9iaiA9IHt9O1xuICAgIG9ialtDQ19TVE9SQUdFX0tFWV0gPSBtZXJnZWQ7XG4gICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KG9iaik7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRDb21tYW5kQ2VudGVyQ1NTKCkge1xuICByZXR1cm4gW1xuICAgIC8qIEFuaW1hdGlvbnMgKi9cbiAgICBcIkBrZXlmcmFtZXMgYXVkaWJvdFB1bHNlIHtcIixcbiAgICBcIiAgMCUgeyBib3gtc2hhZG93OiAwIDAgMCAwIHJnYmEoMTYsMTg1LDEyOSwwLjUpOyB9XCIsXG4gICAgXCIgIDcwJSB7IGJveC1zaGFkb3c6IDAgMCAwIDZweCByZ2JhKDE2LDE4NSwxMjksMCk7IH1cIixcbiAgICBcIiAgMTAwJSB7IGJveC1zaGFkb3c6IDAgMCAwIDAgcmdiYSgxNiwxODUsMTI5LDApOyB9XCIsXG4gICAgXCJ9XCIsXG4gICAgXCJAa2V5ZnJhbWVzIGF1ZGlib3RGYWRlSW4ge1wiLFxuICAgIFwiICBmcm9tIHsgb3BhY2l0eTogMDsgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDhweCk7IH1cIixcbiAgICBcIiAgdG8geyBvcGFjaXR5OiAxOyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCk7IH1cIixcbiAgICBcIn1cIixcbiAgICBcIkBrZXlmcmFtZXMgYXVkaWJvdERvdEZsYXNoIHtcIixcbiAgICBcIiAgMCUgeyBib3gtc2hhZG93OiAwIDAgMCAwIHJnYmEoMTYsMTg1LDEyOSwwLjcpOyB9XCIsXG4gICAgXCIgIDUwJSB7IGJveC1zaGFkb3c6IDAgMCAxMnB4IDRweCByZ2JhKDE2LDE4NSwxMjksMC41KTsgfVwiLFxuICAgIFwiICAxMDAlIHsgYm94LXNoYWRvdzogMCAwIDAgMCByZ2JhKDE2LDE4NSwxMjksMCk7IH1cIixcbiAgICBcIn1cIixcblxuICAgIC8qIENvbnRhaW5lciAqL1xuICAgIFwiLmNjLWNvbnRhaW5lciB7XCIsXG4gICAgXCIgIHdpZHRoOiAzMjBweDtcIixcbiAgICBcIiAgYmFja2dyb3VuZDogI2ZmZjtcIixcbiAgICBcIiAgYm9yZGVyOiAxcHggc29saWQgI2UyZThmMDtcIixcbiAgICBcIiAgYm9yZGVyLXJhZGl1czogMTZweDtcIixcbiAgICBcIiAgYm94LXNoYWRvdzogMCA4cHggMzBweCByZ2JhKDAsMCwwLDAuMTIpO1wiLFxuICAgIFwiICBmb250LWZhbWlseTogLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAnU2Vnb2UgVUknLCBSb2JvdG8sIHNhbnMtc2VyaWY7XCIsXG4gICAgXCIgIGZvbnQtc2l6ZTogMTJweDtcIixcbiAgICBcIiAgY29sb3I6ICMxZTI5M2I7XCIsXG4gICAgXCIgIG92ZXJmbG93OiBoaWRkZW47XCIsXG4gICAgXCIgIHVzZXItc2VsZWN0OiBub25lO1wiLFxuICAgIFwiICB0cmFuc2l0aW9uOiBhbGwgMC4yNXMgY3ViaWMtYmV6aWVyKDAuNCwgMCwgMC4yLCAxKTtcIixcbiAgICBcIiAgYW5pbWF0aW9uOiBhdWRpYm90RmFkZUluIDAuM3MgZWFzZS1vdXQ7XCIsXG4gICAgXCJ9XCIsXG5cbiAgICAvKiBNaW5pbWl6ZWQgY29udGFpbmVyICovXG4gICAgXCIuY2MtY29udGFpbmVyLmNjLW1pbmltaXplZCB7XCIsXG4gICAgXCIgIHdpZHRoOiA0MHB4O1wiLFxuICAgIFwiICBoZWlnaHQ6IDQwcHg7XCIsXG4gICAgXCIgIGJvcmRlcjogbm9uZTtcIixcbiAgICBcIiAgYm9yZGVyLXJhZGl1czogNTAlO1wiLFxuICAgIFwiICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcIixcbiAgICBcIiAgYm94LXNoYWRvdzogbm9uZTtcIixcbiAgICBcIiAgb3ZlcmZsb3c6IHZpc2libGU7XCIsXG4gICAgXCJ9XCIsXG5cbiAgICAvKiBNaW5pIGJ1dHRvbiAqL1xuICAgIFwiLmNjLW1pbmktYnRuIHtcIixcbiAgICBcIiAgcG9zaXRpb246IHJlbGF0aXZlO1wiLFxuICAgIFwiICB3aWR0aDogNDBweDtcIixcbiAgICBcIiAgaGVpZ2h0OiA0MHB4O1wiLFxuICAgIFwiICBib3JkZXItcmFkaXVzOiA1MCU7XCIsXG4gICAgXCIgIGJhY2tncm91bmQ6ICMyNTYzZWI7XCIsXG4gICAgXCIgIGRpc3BsYXk6IGZsZXg7XCIsXG4gICAgXCIgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XCIsXG4gICAgXCIgIGp1c3RpZnktY29udGVudDogY2VudGVyO1wiLFxuICAgIFwiICBjdXJzb3I6IHBvaW50ZXI7XCIsXG4gICAgXCIgIGJveC1zaGFkb3c6IDAgNHB4IDE0cHggcmdiYSgzNyw5OSwyMzUsMC40KTtcIixcbiAgICBcIiAgdHJhbnNpdGlvbjogYm94LXNoYWRvdyAwLjI1cyBjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpLCB0cmFuc2Zvcm0gMC4yNXMgY3ViaWMtYmV6aWVyKDAuNCwgMCwgMC4yLCAxKTtcIixcbiAgICBcIiAgYW5pbWF0aW9uOiBhdWRpYm90RmFkZUluIDAuM3MgZWFzZS1vdXQ7XCIsXG4gICAgXCJ9XCIsXG4gICAgXCIuY2MtbWluaS1idG46aG92ZXIge1wiLFxuICAgIFwiICBib3gtc2hhZG93OiAwIDZweCAyMHB4IHJnYmEoMzcsOTksMjM1LDAuNTUpO1wiLFxuICAgIFwiICB0cmFuc2Zvcm06IHNjYWxlKDEuMDgpO1wiLFxuICAgIFwifVwiLFxuICAgIFwiLmNjLW1pbmktbGV0dGVyIHtcIixcbiAgICBcIiAgY29sb3I6ICNmZmY7XCIsXG4gICAgXCIgIGZvbnQtZmFtaWx5OiAtYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgc2Fucy1zZXJpZjtcIixcbiAgICBcIiAgZm9udC1zaXplOiAxOHB4O1wiLFxuICAgIFwiICBmb250LXdlaWdodDogODAwO1wiLFxuICAgIFwiICBsaW5lLWhlaWdodDogMTtcIixcbiAgICBcIiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XCIsXG4gICAgXCJ9XCIsXG4gICAgXCIuY2MtbWluaS1kb3Qge1wiLFxuICAgIFwiICBwb3NpdGlvbjogYWJzb2x1dGU7XCIsXG4gICAgXCIgIHRvcDogLTFweDtcIixcbiAgICBcIiAgcmlnaHQ6IC0xcHg7XCIsXG4gICAgXCIgIHdpZHRoOiAxMHB4O1wiLFxuICAgIFwiICBoZWlnaHQ6IDEwcHg7XCIsXG4gICAgXCIgIGJvcmRlci1yYWRpdXM6IDUwJTtcIixcbiAgICBcIiAgYm9yZGVyOiAycHggc29saWQgI2ZmZjtcIixcbiAgICBcIiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XCIsXG4gICAgXCJ9XCIsXG5cbiAgICAvKiBIZWFkZXIgKi9cbiAgICBcIi5jYy1oZWFkZXIge1wiLFxuICAgIFwiICBkaXNwbGF5OiBmbGV4O1wiLFxuICAgIFwiICBhbGlnbi1pdGVtczogY2VudGVyO1wiLFxuICAgIFwiICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XCIsXG4gICAgXCIgIHBhZGRpbmc6IDEwcHggMTRweDtcIixcbiAgICBcIiAgYmFja2dyb3VuZDogIzFlMjkzYjtcIixcbiAgICBcIiAgY29sb3I6ICNmZmY7XCIsXG4gICAgXCJ9XCIsXG4gICAgXCIuY2MtbG9nby13cmFwIHtcIixcbiAgICBcIiAgZGlzcGxheTogZmxleDtcIixcbiAgICBcIiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcIixcbiAgICBcIiAgZ2FwOiA4cHg7XCIsXG4gICAgXCJ9XCIsXG4gICAgXCIuY2MtbG9nbyB7XCIsXG4gICAgXCIgIGZvbnQtd2VpZ2h0OiA4MDA7XCIsXG4gICAgXCIgIGZvbnQtc2l6ZTogMTNweDtcIixcbiAgICBcIiAgbGV0dGVyLXNwYWNpbmc6IC0wLjNweDtcIixcbiAgICBcIn1cIixcblxuICAgIC8qIFN0YXR1cyBkb3QgKi9cbiAgICBcIi5jYy1zdGF0dXMtZG90IHtcIixcbiAgICBcIiAgd2lkdGg6IDhweDtcIixcbiAgICBcIiAgaGVpZ2h0OiA4cHg7XCIsXG4gICAgXCIgIGJvcmRlci1yYWRpdXM6IDUwJTtcIixcbiAgICBcIiAgZmxleC1zaHJpbms6IDA7XCIsXG4gICAgXCJ9XCIsXG4gICAgXCIuY2MtZG90LXB1bHNlIHtcIixcbiAgICBcIiAgYW5pbWF0aW9uOiBhdWRpYm90UHVsc2UgMnMgaW5maW5pdGU7XCIsXG4gICAgXCJ9XCIsXG4gICAgXCIuY2MtZG90LWZsYXNoIHtcIixcbiAgICBcIiAgYW5pbWF0aW9uOiBhdWRpYm90RG90Rmxhc2ggMS41cyBlYXNlLW91dCAhaW1wb3J0YW50O1wiLFxuICAgIFwifVwiLFxuXG4gICAgLyogSGVhZGVyIGJ1dHRvbnMgKi9cbiAgICBcIi5jYy1oZWFkZXItYnRucyB7XCIsXG4gICAgXCIgIGRpc3BsYXk6IGZsZXg7XCIsXG4gICAgXCIgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XCIsXG4gICAgXCIgIGdhcDogMnB4O1wiLFxuICAgIFwifVwiLFxuICAgIFwiLmNjLWJ0bi10b2dnbGUge1wiLFxuICAgIFwiICBiYWNrZ3JvdW5kOiBub25lO1wiLFxuICAgIFwiICBib3JkZXI6IG5vbmU7XCIsXG4gICAgXCIgIGNvbG9yOiAjOTRhM2I4O1wiLFxuICAgIFwiICBjdXJzb3I6IHBvaW50ZXI7XCIsXG4gICAgXCIgIGZvbnQtc2l6ZTogMTFweDtcIixcbiAgICBcIiAgcGFkZGluZzogNHB4IDhweDtcIixcbiAgICBcIiAgYm9yZGVyLXJhZGl1czogNnB4O1wiLFxuICAgIFwiICB0cmFuc2l0aW9uOiBiYWNrZ3JvdW5kIDAuMTVzLCBjb2xvciAwLjE1cztcIixcbiAgICBcIn1cIixcbiAgICBcIi5jYy1idG4tdG9nZ2xlOmhvdmVyIHsgYmFja2dyb3VuZDogcmdiYSgyNTUsMjU1LDI1NSwwLjEpOyBjb2xvcjogI2ZmZjsgfVwiLFxuICAgIFwiLmNjLWJ0bi1taW5pbWl6ZSB7XCIsXG4gICAgXCIgIGZvbnQtc2l6ZTogMTRweDtcIixcbiAgICBcIiAgbGluZS1oZWlnaHQ6IDE7XCIsXG4gICAgXCIgIHBhZGRpbmc6IDRweCA2cHg7XCIsXG4gICAgXCJ9XCIsXG5cbiAgICAvKiBTZWN0aW9ucyAqL1xuICAgIFwiLmNjLXNlY3Rpb24geyBwYWRkaW5nOiA4cHggMTRweDsgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNmMWY1Zjk7IH1cIixcbiAgICBcIi5jYy1zZWN0aW9uLXRpdGxlIHtcIixcbiAgICBcIiAgZm9udC1zaXplOiAxMHB4O1wiLFxuICAgIFwiICBmb250LXdlaWdodDogODAwO1wiLFxuICAgIFwiICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1wiLFxuICAgIFwiICBsZXR0ZXItc3BhY2luZzogMC41cHg7XCIsXG4gICAgXCIgIGNvbG9yOiAjOTRhM2I4O1wiLFxuICAgIFwiICBtYXJnaW4tYm90dG9tOiA2cHg7XCIsXG4gICAgXCJ9XCIsXG4gICAgXCIuY2MtZmllbGQge1wiLFxuICAgIFwiICBkaXNwbGF5OiBmbGV4O1wiLFxuICAgIFwiICBhbGlnbi1pdGVtczogY2VudGVyO1wiLFxuICAgIFwiICBnYXA6IDZweDtcIixcbiAgICBcIiAgcGFkZGluZzogM3B4IDA7XCIsXG4gICAgXCJ9XCIsXG4gICAgXCIuY2MtbGFiZWwge1wiLFxuICAgIFwiICBmb250LXNpemU6IDExcHg7XCIsXG4gICAgXCIgIGZvbnQtd2VpZ2h0OiA2MDA7XCIsXG4gICAgXCIgIGNvbG9yOiAjNjQ3NDhiO1wiLFxuICAgIFwiICBtaW4td2lkdGg6IDgwcHg7XCIsXG4gICAgXCIgIGZsZXgtc2hyaW5rOiAwO1wiLFxuICAgIFwifVwiLFxuICAgIFwiLmNjLXZhbHVlIHtcIixcbiAgICBcIiAgZm9udC1zaXplOiAxMnB4O1wiLFxuICAgIFwiICBmb250LXdlaWdodDogNzAwO1wiLFxuICAgIFwiICBjb2xvcjogIzFlMjkzYjtcIixcbiAgICBcIiAgZmxleDogMTtcIixcbiAgICBcIiAgb3ZlcmZsb3c6IGhpZGRlbjtcIixcbiAgICBcIiAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XCIsXG4gICAgXCIgIHdoaXRlLXNwYWNlOiBub3dyYXA7XCIsXG4gICAgXCJ9XCIsXG4gICAgXCIuY2MtYnRuLWNvcHkge1wiLFxuICAgIFwiICBiYWNrZ3JvdW5kOiBub25lO1wiLFxuICAgIFwiICBib3JkZXI6IG5vbmU7XCIsXG4gICAgXCIgIGN1cnNvcjogcG9pbnRlcjtcIixcbiAgICBcIiAgZm9udC1zaXplOiAxM3B4O1wiLFxuICAgIFwiICBjb2xvcjogIzk0YTNiODtcIixcbiAgICBcIiAgcGFkZGluZzogMnB4IDRweDtcIixcbiAgICBcIiAgYm9yZGVyLXJhZGl1czogNHB4O1wiLFxuICAgIFwiICBmbGV4LXNocmluazogMDtcIixcbiAgICBcIiAgdHJhbnNpdGlvbjogYmFja2dyb3VuZCAwLjE1cywgY29sb3IgMC4xNXM7XCIsXG4gICAgXCJ9XCIsXG4gICAgXCIuY2MtYnRuLWNvcHk6aG92ZXIgeyBiYWNrZ3JvdW5kOiAjZjFmNWY5OyBjb2xvcjogIzNiODJmNjsgfVwiLFxuXG4gICAgLyogQWN0aW9ucyAqL1xuICAgIFwiLmNjLWFjdGlvbnMge1wiLFxuICAgIFwiICBkaXNwbGF5OiBmbGV4O1wiLFxuICAgIFwiICBnYXA6IDhweDtcIixcbiAgICBcIiAgcGFkZGluZzogMTBweCAxNHB4O1wiLFxuICAgIFwifVwiLFxuICAgIFwiLmNjLWJ0biB7XCIsXG4gICAgXCIgIGZsZXg6IDE7XCIsXG4gICAgXCIgIHBhZGRpbmc6IDhweCAxMnB4O1wiLFxuICAgIFwiICBib3JkZXI6IG5vbmU7XCIsXG4gICAgXCIgIGJvcmRlci1yYWRpdXM6IDEwcHg7XCIsXG4gICAgXCIgIGZvbnQtc2l6ZTogMTJweDtcIixcbiAgICBcIiAgZm9udC13ZWlnaHQ6IDcwMDtcIixcbiAgICBcIiAgY3Vyc29yOiBwb2ludGVyO1wiLFxuICAgIFwiICB0cmFuc2l0aW9uOiBhbGwgMC4ycyBjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpO1wiLFxuICAgIFwifVwiLFxuICAgIFwiLmNjLWJ0bjpob3ZlciB7XCIsXG4gICAgXCIgIHRyYW5zZm9ybTogc2NhbGUoMS4wMyk7XCIsXG4gICAgXCIgIGJveC1zaGFkb3c6IDAgNHB4IDEycHggcmdiYSgwLDAsMCwwLjE1KTtcIixcbiAgICBcIn1cIixcbiAgICBcIi5jYy1idG4tZmlsbCB7IGJhY2tncm91bmQ6ICMyNTYzZWI7IGNvbG9yOiAjZmZmOyB9XCIsXG4gICAgXCIuY2MtYnRuLWZpbGw6aG92ZXIgeyBiYWNrZ3JvdW5kOiAjMWQ0ZWQ4OyB9XCIsXG4gICAgXCIuY2MtYnRuLXNjYW4geyBiYWNrZ3JvdW5kOiAjZjFmNWY5OyBjb2xvcjogIzQ3NTU2OTsgfVwiLFxuICAgIFwiLmNjLWJ0bi1zY2FuOmhvdmVyIHsgYmFja2dyb3VuZDogI2UyZThmMDsgfVwiLFxuICAgIFwiLmNjLWVtcHR5IHtcIixcbiAgICBcIiAgcGFkZGluZzogMjBweCAxNHB4O1wiLFxuICAgIFwiICB0ZXh0LWFsaWduOiBjZW50ZXI7XCIsXG4gICAgXCIgIGNvbG9yOiAjOTRhM2I4O1wiLFxuICAgIFwiICBmb250LXNpemU6IDEycHg7XCIsXG4gICAgXCIgIGZvbnQtd2VpZ2h0OiA1MDA7XCIsXG4gICAgXCIgIGxpbmUtaGVpZ2h0OiAxLjU7XCIsXG4gICAgXCJ9XCIsXG4gIF0uam9pbihcIlxcblwiKTtcbn1cblxuLyogRXhwb3NlIHBvdXIgbCdpbXBvcnQgZGVwdWlzIGNvbnRlbnQvaW5kZXguanMgKi9cbmdsb2JhbFRoaXMuY3JlYXRlQ29tbWFuZENlbnRlciA9IGNyZWF0ZUNvbW1hbmRDZW50ZXI7XG4iLCAiLyogXHUyNTAwXHUyNTAwIFYzLTggOiBDYXB0dXJlIGF1dG9tYXRpcXVlIGRlIGRldmlzIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuLyogRGV0ZWN0ZSBldCBjYXB0dXJlIGxlcyBkb25uZWVzIGRlIGRldmlzL2NvdGF0aW9uIHN1ciBsZXMgcG9ydGFpbHMuICAgICAgKi9cblxuLyogSW5kaWNhdGV1cnMgZGUgcGFnZSBkZXZpcyBcdTIwMTQgbW90cyBzcGVjaWZpcXVlcyBwb3VyIGV2aXRlciBsZXMgZmF1eCBwb3NpdGlmcyAqL1xuLyogTGVzIG1vdHMgZ2VuZXJpcXVlcyAobW9udGFudCwgcHJpc2UgZW4gY2hhcmdlKSBzb250IGV4Y2x1cyBjYXIgcHJlc2VudHMgc3VyIHRvdXRlIHBhZ2UgVFAgKi9cbnZhciBERVZJU19JTkRJQ0FUT1JTID0gW1xuICBcImRldmlzXCIsIFwiY290YXRpb25cIiwgXCJzaW11bGF0aW9uIGRldmlzXCIsIFwidGFyaWZpY2F0aW9uIGRldmlzXCIsXG4gIFwibW9udHVyZVwiLCBcInZlcnJlIGNvcnJlY3RldXJcIiwgXCJ2ZXJyZSBwcm9ncmVzc2lmXCIsXG4gIFwicHJpeCB0b3RhbFwiLCBcInRvdGFsIHR0Y1wiLCBcInJlc3RlIGEgY2hhcmdlXCIsXG4gIFwiY29kZSBscHBcIiwgXCJxdW90YXRpb25cIixcbl07XG5cbnZhciBERVZJU19GSUVMRF9BTElBU0VTID0ge1xuICBtb250dXJlUmVmOiAgICAgW1wibW9udHVyZVwiLCBcInJlZl9tb250dXJlXCIsIFwicmVmZXJlbmNlX21vbnR1cmVcIiwgXCJjb2RlX21vbnR1cmVcIiwgXCJmcmFtZVwiLCBcIm1vbnR1cmVfcmVmXCIsIFwiZnJhbWVfcmVmXCIsIFwiZnJhbWVfcmVmZXJlbmNlXCJdLFxuICBtb250dXJlTWFycXVlOiAgW1wibWFycXVlX21vbnR1cmVcIiwgXCJicmFuZF9tb250dXJlXCIsIFwiZmFicmljYW50X21vbnR1cmVcIiwgXCJtYXJxdWVfZnJhbWVcIiwgXCJtb250dXJlX21hcnF1ZVwiLCBcImZyYW1lX2JyYW5kXCJdLFxuICBtb250dXJlUHJpeDogICAgW1wicHJpeF9tb250dXJlXCIsIFwibW9udGFudF9tb250dXJlXCIsIFwicHJpY2VfZnJhbWVcIiwgXCJmcmFtZV9wcmljZVwiLCBcImNvdXRfbW9udHVyZVwiLCBcInRhcmlmX21vbnR1cmVcIl0sXG4gIHZlcnJlT0RSZWY6ICAgICBbXCJ2ZXJyZV9vZFwiLCBcInZlcnJlX2Ryb2l0XCIsIFwibGVuc19vZFwiLCBcImxlbnNfcmlnaHRcIiwgXCJyZWZfdmVycmVfb2RcIiwgXCJ2ZXJyZV9vZF9yZWZcIl0sXG4gIHZlcnJlT0dSZWY6ICAgICBbXCJ2ZXJyZV9vZ1wiLCBcInZlcnJlX2dhdWNoZVwiLCBcImxlbnNfb2dcIiwgXCJsZW5zX2xlZnRcIiwgXCJyZWZfdmVycmVfb2dcIiwgXCJ2ZXJyZV9vZ19yZWZcIl0sXG4gIHZlcnJlUHJpeDogICAgICBbXCJwcml4X3ZlcnJlc1wiLCBcInByaXhfdmVycmVcIiwgXCJtb250YW50X3ZlcnJlc1wiLCBcImxlbnNfcHJpY2VcIiwgXCJjb3V0X3ZlcnJlc1wiLCBcInRhcmlmX3ZlcnJlc1wiXSxcbiAgc3VwcGxlbWVudFJlZjogIFtcInN1cHBsZW1lbnRcIiwgXCJ0cmFpdGVtZW50XCIsIFwiYW50aV9yZWZsZXRcIiwgXCJjb2F0aW5nXCIsIFwib3B0aW9uXCIsIFwic3VyY2hhcmdlXCIsIFwiYW50aXJlZmxldFwiLCBcInBob3RvY2hyb21pcXVlXCIsIFwiYW50aV9sdW1pZXJlX2JsZXVlXCJdLFxuICBzdXBwbGVtZW50UHJpeDogW1wicHJpeF9zdXBwbGVtZW50XCIsIFwibW9udGFudF9zdXBwbGVtZW50XCIsIFwicHJpeF90cmFpdGVtZW50XCIsIFwicHJpeF9vcHRpb25cIiwgXCJ0YXJpZl9zdXBwbGVtZW50XCJdLFxuICB0b3RhbFRUQzogICAgICAgW1widG90YWxcIiwgXCJ0b3RhbF90dGNcIiwgXCJtb250YW50X3RvdGFsXCIsIFwicHJpeF90b3RhbFwiLCBcInRvdGFsX2dlbmVyYWxcIiwgXCJuZXRfYV9wYXllclwiLCBcIm1vbnRhbnRfZGV2aXNcIl0sXG4gIHBhcnRNdXR1ZWxsZTogICBbXCJwYXJ0X211dHVlbGxlXCIsIFwicHJpc2VfZW5fY2hhcmdlXCIsIFwicmVtYm91cnNlbWVudFwiLCBcIm1vbnRhbnRfcmVtYm91cnNlXCIsIFwicGFydF9hbWNcIiwgXCJwYXJ0X2NvbXBsZW1lbnRhaXJlXCIsIFwicGFydF9yY1wiXSxcbiAgcGFydFNlY3U6ICAgICAgIFtcInBhcnRfc2VjdVwiLCBcInBhcnRfYW1vXCIsIFwicmVtYm91cnNlbWVudF9zZWN1XCIsIFwiYmFzZV9zZWN1XCIsIFwicGFydF9zZWN1cml0ZV9zb2NpYWxlXCIsIFwicmVtYm91cnNlbWVudF9hbW9cIl0sXG4gIHJlc3RlQUNoYXJnZTogICBbXCJyZXN0ZV9hX2NoYXJnZVwiLCBcInJhY1wiLCBcInJlc3RlX2NoYXJnZVwiLCBcImFfcGF5ZXJcIiwgXCJtb250YW50X3JhY1wiLCBcInJlc3RlXCIsIFwic29sZGVfcGF0aWVudFwiXSxcbiAgY29kZUxQUDogICAgICAgIFtcImNvZGVfbHBwXCIsIFwibHBwXCIsIFwiY29kZV9wcmVzdGF0aW9uXCIsIFwiY29kZV9hY3RlXCIsIFwibHBwX2NvZGVcIl0sXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZGV0ZWN0RGV2aXNQYWdlKCkge1xuICB2YXIgdGV4dCA9IChkb2N1bWVudC50aXRsZSArIFwiIFwiICsgZG9jdW1lbnQuYm9keS5pbm5lclRleHQuc3Vic3RyaW5nKDAsIDMwMDApKS50b0xvd2VyQ2FzZSgpO1xuICB2YXIgbWF0Y2hDb3VudCA9IDA7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgREVWSVNfSU5ESUNBVE9SUy5sZW5ndGg7IGkrKykge1xuICAgIGlmICh0ZXh0LmluZGV4T2YoREVWSVNfSU5ESUNBVE9SU1tpXSkgIT09IC0xKSBtYXRjaENvdW50Kys7XG4gIH1cbiAgLyogQXUgbW9pbnMgNCBpbmRpY2F0ZXVycyBzcGVjaWZpcXVlcyBwb3VyIGV2aXRlciBsZXMgZmF1eCBwb3NpdGlmcyBzdXIgbGVzIHBhZ2VzIFRQICovXG4gIHJldHVybiBtYXRjaENvdW50ID49IDQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYXB0dXJlRGV2aXMoKSB7XG4gIGlmICghZGV0ZWN0RGV2aXNQYWdlKCkpIHJldHVybiBudWxsO1xuXG4gIHZhciByZXN1bHQgPSB7fTtcbiAgdmFyIGlucHV0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbnB1dCwgc2VsZWN0LCB0ZXh0YXJlYSwgc3BhbiwgdGQsIGRkLCBbY2xhc3MqPXZhbHVlXSwgW2NsYXNzKj1wcml4XSwgW2NsYXNzKj1tb250YW50XVwiKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGlucHV0cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBlbCA9IGlucHV0c1tpXTtcbiAgICB2YXIgdmFsO1xuICAgIGlmIChlbC50YWdOYW1lID09PSBcIklOUFVUXCIgfHwgZWwudGFnTmFtZSA9PT0gXCJTRUxFQ1RcIiB8fCBlbC50YWdOYW1lID09PSBcIlRFWFRBUkVBXCIpIHtcbiAgICAgIHZhbCA9IChlbC52YWx1ZSB8fCBcIlwiKS50cmltKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbCA9IChlbC50ZXh0Q29udGVudCB8fCBcIlwiKS50cmltKCk7XG4gICAgfVxuICAgIGlmICghdmFsIHx8IHZhbC5sZW5ndGggPiAxMDApIGNvbnRpbnVlO1xuXG4gICAgLyogU2lnbmFsIGNvbGxlY3Rpb24gc2ltcGxpZmllICovXG4gICAgdmFyIHNpZ25hbHMgPSBbXG4gICAgICBlbC5uYW1lLCBlbC5pZCwgZWwucGxhY2Vob2xkZXIsXG4gICAgICBlbC5nZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsXCIpLFxuICAgICAgZWwuZ2V0QXR0cmlidXRlKFwiZGF0YS1maWVsZFwiKSxcbiAgICAgIGVsLmNsYXNzTmFtZSxcbiAgICBdLmZpbHRlcihCb29sZWFuKS5qb2luKFwiIFwiKS50b0xvd2VyQ2FzZSgpLm5vcm1hbGl6ZShcIk5GRFwiKS5yZXBsYWNlKC9bXFx1MDMwMC1cXHUwMzZmXS9nLCBcIlwiKS5yZXBsYWNlKC9bXFxzXFwtX1xcLl0vZywgXCJcIik7XG5cbiAgICBmb3IgKHZhciBmaWVsZCBpbiBERVZJU19GSUVMRF9BTElBU0VTKSB7XG4gICAgICBpZiAocmVzdWx0W2ZpZWxkXSkgY29udGludWU7XG4gICAgICB2YXIgYWxpYXNlcyA9IERFVklTX0ZJRUxEX0FMSUFTRVNbZmllbGRdO1xuICAgICAgZm9yICh2YXIgYSA9IDA7IGEgPCBhbGlhc2VzLmxlbmd0aDsgYSsrKSB7XG4gICAgICAgIHZhciBub3JtID0gYWxpYXNlc1thXS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1tcXHNcXC1fXFwuXS9nLCBcIlwiKTtcbiAgICAgICAgaWYgKHNpZ25hbHMuaW5kZXhPZihub3JtKSAhPT0gLTEpIHtcbiAgICAgICAgICByZXN1bHRbZmllbGRdID0gdmFsO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyogRGV0ZWN0ZXIgYXVzc2kgbGVzIHByaXggZGFucyBkZXMgZWxlbWVudHMgc3BlY2lmaXF1ZXMgKi9cbiAgdmFyIHByaWNlRWxzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIltjbGFzcyo9dG90YWxdLCBbY2xhc3MqPXByaXhdLCBbY2xhc3MqPW1vbnRhbnRdLCBbY2xhc3MqPXByaWNlXSwgW2lkKj10b3RhbF0sIFtpZCo9cHJpeF1cIik7XG4gIGZvciAodmFyIHAgPSAwOyBwIDwgcHJpY2VFbHMubGVuZ3RoOyBwKyspIHtcbiAgICB2YXIgcFRleHQgPSAocHJpY2VFbHNbcF0udGV4dENvbnRlbnQgfHwgXCJcIikudHJpbSgpO1xuICAgIHZhciBwcmljZU1hdGNoID0gcFRleHQubWF0Y2goLyhcXGQrWy4sXVxcZHsyfSlcXHMqXHUyMEFDPy8pO1xuICAgIGlmIChwcmljZU1hdGNoICYmICFyZXN1bHQudG90YWxUVEMpIHtcbiAgICAgIHJlc3VsdC50b3RhbFRUQyA9IHByaWNlTWF0Y2hbMV07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIE9iamVjdC5rZXlzKHJlc3VsdCkubGVuZ3RoID49IDIgPyByZXN1bHQgOiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3luY0RldmlzVG9CYWNrZW5kKGRldmlzKSB7XG4gIGlmICghZGV2aXMpIHJldHVybjtcblxuICBpZiAodHlwZW9mIGdldFN5bmNUb2tlbiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgZ2V0U3luY1Rva2VuKCkudGhlbihmdW5jdGlvbih0b2tlbikge1xuICAgICAgaWYgKCF0b2tlbikgcmV0dXJuO1xuICAgICAgZmV0Y2goXCJodHRwczovL2F1ZGlib3QuZnIvYXBpL2V4dGVuc2lvbi9kZXZpc1wiLCB7XG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICBcIkF1dGhvcml6YXRpb25cIjogXCJCZWFyZXIgXCIgKyB0b2tlbixcbiAgICAgICAgfSxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgIGhvc3RuYW1lOiB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUsXG4gICAgICAgICAgZGV2aXM6IGRldmlzLFxuICAgICAgICAgIHVybDogd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLFxuICAgICAgICAgIHRzOiBEYXRlLm5vdygpLFxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBzaG93RGV2aXNUb2FzdChcIkRldmlzIGNhcHR1cmUgXHUyMDE0IFwiICsgKGRldmlzLnRvdGFsVFRDIHx8IFwibW9udGFudCBpbmNvbm51XCIpICsgXCIgRVVSXCIsIFwic3VjY2Vzc1wiKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyKSB7IGNvbnNvbGUud2FybihcIltBdWRpQm90XSBkZXZpcyBzeW5jIGZhaWxlZDpcIiwgZXJyKTsgfSk7XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2hvd0RldmlzVG9hc3QobWVzc2FnZSwgdHlwZSkge1xuICB2YXIgZXhpc3RpbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF1ZGlib3QtZGV2aXMtdG9hc3RcIik7XG4gIGlmIChleGlzdGluZykgZXhpc3RpbmcucmVtb3ZlKCk7XG5cbiAgdmFyIHRvYXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgdG9hc3QuaWQgPSBcImF1ZGlib3QtZGV2aXMtdG9hc3RcIjtcbiAgdG9hc3QudGV4dENvbnRlbnQgPSBtZXNzYWdlO1xuICB2YXIgYmcgPSB0eXBlID09PSBcInN1Y2Nlc3NcIiA/IFwiIzA1OTY2OVwiIDogXCIjZDk3NzA2XCI7XG4gIHRvYXN0LnN0eWxlLmNzc1RleHQgPSBcInBvc2l0aW9uOmZpeGVkO2JvdHRvbTo3MHB4O3JpZ2h0OjI0cHg7ei1pbmRleDoyMTQ3NDgzNjQ3O2JhY2tncm91bmQ6XCIgKyBiZyArIFwiO2NvbG9yOndoaXRlO3BhZGRpbmc6MTBweCAxNnB4O2JvcmRlci1yYWRpdXM6MTBweDtmb250OjYwMCAxMnB4LzEuNCAtYXBwbGUtc3lzdGVtLEJsaW5rTWFjU3lzdGVtRm9udCxzYW5zLXNlcmlmO2JveC1zaGFkb3c6MCA0cHggMTZweCByZ2JhKDAsMCwwLC4xMik7b3BhY2l0eTowO3RyYW5zaXRpb246b3BhY2l0eSAuM3M7XCI7XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodG9hc3QpO1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7IHRvYXN0LnN0eWxlLm9wYWNpdHkgPSBcIjFcIjsgfSk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IHRvYXN0LnN0eWxlLm9wYWNpdHkgPSBcIjBcIjsgc2V0VGltZW91dChmdW5jdGlvbigpIHsgdG9hc3QucmVtb3ZlKCk7IH0sIDMwMCk7IH0sIDUwMDApO1xufVxuXG4vKiBcdTI1MDBcdTI1MDAgQXV0by1kZXRlY3Rpb24gYXZlYyBNdXRhdGlvbk9ic2VydmVyIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xudmFyIF9kZXZpc0RldGVjdGVkID0gZmFsc2U7XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cERldmlzRGV0ZWN0aW9uKCkge1xuICAvKiBUZW50YXRpdmUgaW5pdGlhbGUgYXByZXMgM3MgKi9cbiAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICB2YXIgZGV2aXMgPSBjYXB0dXJlRGV2aXMoKTtcbiAgICBpZiAoZGV2aXMpIHsgX2RldmlzRGV0ZWN0ZWQgPSB0cnVlOyBzeW5jRGV2aXNUb0JhY2tlbmQoZGV2aXMpOyB9XG4gIH0sIDMwMDApO1xuXG4gIC8qIE9ic2VydmVyIHBvdXIgU1BBICovXG4gIGlmIChkb2N1bWVudC5ib2R5KSB7XG4gICAgdmFyIHRpbWVyID0gbnVsbDtcbiAgICB2YXIgb2JzID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24obXV0YXRpb25zKSB7XG4gICAgICBpZiAoX2RldmlzRGV0ZWN0ZWQpIHJldHVybjtcbiAgICAgIHZhciBoYXNOZXcgPSBtdXRhdGlvbnMuc29tZShmdW5jdGlvbihtKSB7IHJldHVybiBtLmFkZGVkTm9kZXMubGVuZ3RoID4gMDsgfSk7XG4gICAgICBpZiAoaGFzTmV3KSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgZGV2aXMgPSBjYXB0dXJlRGV2aXMoKTtcbiAgICAgICAgICBpZiAoZGV2aXMpIHsgX2RldmlzRGV0ZWN0ZWQgPSB0cnVlOyBzeW5jRGV2aXNUb0JhY2tlbmQoZGV2aXMpOyB9XG4gICAgICAgIH0sIDIwMDApO1xuICAgICAgfVxuICAgIH0pO1xuICAgIG9icy5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHsgY2hpbGRMaXN0OiB0cnVlLCBzdWJ0cmVlOiB0cnVlIH0pO1xuICB9XG59XG4iLCAiLyogXHUyNTAwXHUyNTAwIERPTSBVdGlsaXR5IEZ1bmN0aW9ucyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHF1ZXJ5U2VsZWN0b3JBbGxEZWVwKHNlbGVjdG9yLCByb290LCBkZXB0aCkge1xuICByb290ID0gcm9vdCB8fCBkb2N1bWVudDtcbiAgZGVwdGggPSBkZXB0aCB8fCAwO1xuICBpZiAoZGVwdGggPiA1KSByZXR1cm4gW107XG4gIHZhciByZXN1bHRzID0gQXJyYXkuZnJvbShyb290LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpKTtcblxuICAvLyBTaGFkb3cgcm9vdHNcbiAgdmFyIGFsbCA9IHJvb3QucXVlcnlTZWxlY3RvckFsbChcIipcIik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYWxsLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGFsbFtpXS5zaGFkb3dSb290KSB7XG4gICAgICByZXN1bHRzID0gcmVzdWx0cy5jb25jYXQocXVlcnlTZWxlY3RvckFsbERlZXAoc2VsZWN0b3IsIGFsbFtpXS5zaGFkb3dSb290LCBkZXB0aCArIDEpKTtcbiAgICB9XG4gIH1cblxuICAvLyBTYW1lLW9yaWdpbiBpZnJhbWVzIChvbmx5IGZyb20gZG9jdW1lbnQgcm9vdCwgbm90IGluc2lkZSBzaGFkb3cpXG4gIGlmIChyb290ID09PSBkb2N1bWVudCAmJiBkZXB0aCA9PT0gMCkge1xuICAgIHZhciBpZnJhbWVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcImlmcmFtZVwiKTtcbiAgICBmb3IgKHZhciBmaSA9IDA7IGZpIDwgaWZyYW1lcy5sZW5ndGg7IGZpKyspIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciBpRG9jID0gaWZyYW1lc1tmaV0uY29udGVudERvY3VtZW50IHx8IChpZnJhbWVzW2ZpXS5jb250ZW50V2luZG93ICYmIGlmcmFtZXNbZmldLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQpO1xuICAgICAgICBpZiAoaURvYykgcmVzdWx0cyA9IHJlc3VsdHMuY29uY2F0KHF1ZXJ5U2VsZWN0b3JBbGxEZWVwKHNlbGVjdG9yLCBpRG9jLCBkZXB0aCArIDEpKTtcbiAgICAgIH0gY2F0Y2goZSkgeyAvKiBjcm9zcy1vcmlnaW4gKi8gfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHRzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZEVsZW1lbnQoc2VsZWN0b3IpIHtcbiAgaWYgKCFzZWxlY3RvcikgcmV0dXJuIG51bGw7XG4gIHZhciBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICBpZiAoZWwpIHJldHVybiBlbDtcbiAgdmFyIGlmcmFtZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiaWZyYW1lXCIpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGlmcmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICB0cnkge1xuICAgICAgdmFyIGlEb2MgPSBpZnJhbWVzW2ldLmNvbnRlbnREb2N1bWVudDtcbiAgICAgIGlmIChpRG9jKSB7IGVsID0gaURvYy5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTsgaWYgKGVsKSByZXR1cm4gZWw7IH1cbiAgICB9IGNhdGNoKGUpIHt9XG4gIH1cbiAgcmV0dXJuIGZpbmRJblNoYWRvd1Jvb3RzKHNlbGVjdG9yLCBkb2N1bWVudCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kSW5TaGFkb3dSb290cyhzZWxlY3Rvciwgcm9vdCwgZGVwdGgpIHtcbiAgaWYgKChkZXB0aCB8fCAwKSA+IDUpIHJldHVybiBudWxsO1xuICAvKiBFYXJseSBleGl0IDogdlx1MDBFOXJpZmllciBzaSBkZXMgZW5mYW50cyBkaXJlY3RzIG9udCB1biBzaGFkb3dSb290ICovXG4gIHZhciBjaGlsZHJlbiA9IEFycmF5LmZyb20ocm9vdC5jaGlsZHJlbiB8fCBbXSk7XG4gIHZhciBoYXNTaGFkb3dDaGlsZCA9IGNoaWxkcmVuLnNvbWUoZnVuY3Rpb24oYykgeyByZXR1cm4gISFjLnNoYWRvd1Jvb3Q7IH0pO1xuICBpZiAoIWhhc1NoYWRvd0NoaWxkKSB7XG4gICAgLyogVlx1MDBFOXJpZmllciBhdXNzaSBsZXMgZGVzY2VuZGFudHMgcHJvY2hlcyAobWF4IDIgbml2ZWF1eCkgc2FucyBxdWVyeVNlbGVjdG9yQWxsKFwiKlwiKSAqL1xuICAgIHZhciBoYXNEZWVwU2hhZG93ID0gY2hpbGRyZW4uc29tZShmdW5jdGlvbihjKSB7XG4gICAgICByZXR1cm4gQXJyYXkuZnJvbShjLmNoaWxkcmVuIHx8IFtdKS5zb21lKGZ1bmN0aW9uKGdjKSB7IHJldHVybiAhIWdjLnNoYWRvd1Jvb3Q7IH0pO1xuICAgIH0pO1xuICAgIGlmICghaGFzRGVlcFNoYWRvdykgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmFyIGFsbCA9IHJvb3QucXVlcnlTZWxlY3RvckFsbChcIipcIik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYWxsLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGFsbFtpXS5zaGFkb3dSb290KSB7XG4gICAgICB2YXIgZm91bmQgPSBhbGxbaV0uc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgIGlmIChmb3VuZCkgcmV0dXJuIGZvdW5kO1xuICAgICAgZm91bmQgPSBmaW5kSW5TaGFkb3dSb290cyhzZWxlY3RvciwgYWxsW2ldLnNoYWRvd1Jvb3QsIChkZXB0aCB8fCAwKSArIDEpO1xuICAgICAgaWYgKGZvdW5kKSByZXR1cm4gZm91bmQ7XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG4vKiB3YWl0Rm9yRWxlbWVudCBcdTIwMTQgTXV0YXRpb25PYnNlcnZlciBhdSBsaWV1IGR1IHBvbGxpbmcgcG91ciByXHUwMEU5YWdpciBpbW1cdTAwRTlkaWF0ZW1lbnQgKi9cbmV4cG9ydCBmdW5jdGlvbiB3YWl0Rm9yRWxlbWVudChzZWxlY3RvciwgdGltZW91dE1zKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgLyogVlx1MDBFOXJpZmljYXRpb24gaW1tXHUwMEU5ZGlhdGUgZG9jdW1lbnQgKyBpZnJhbWVzICovXG4gICAgdmFyIGVsID0gZmluZEVsZW1lbnQoc2VsZWN0b3IpO1xuICAgIGlmIChlbCkgeyByZXNvbHZlKGVsKTsgcmV0dXJuOyB9XG5cbiAgICB2YXIgcmVzb2x2ZWQgPSBmYWxzZTtcbiAgICB2YXIgb2JzZXJ2ZXIgPSBudWxsO1xuICAgIHZhciB0aW1lciA9IG51bGw7XG5cbiAgICBmdW5jdGlvbiBjbGVhbnVwKCkge1xuICAgICAgaWYgKHJlc29sdmVkKSByZXR1cm47XG4gICAgICByZXNvbHZlZCA9IHRydWU7XG4gICAgICBpZiAob2JzZXJ2ZXIpIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgIGlmICh0aW1lcikgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjaGVjaygpIHtcbiAgICAgIGlmIChyZXNvbHZlZCkgcmV0dXJuO1xuICAgICAgdmFyIGZvdW5kID0gZmluZEVsZW1lbnQoc2VsZWN0b3IpO1xuICAgICAgaWYgKGZvdW5kKSB7XG4gICAgICAgIGNsZWFudXAoKTtcbiAgICAgICAgcmVzb2x2ZShmb3VuZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyogTXV0YXRpb25PYnNlcnZlciBwb3VyIHJcdTAwRTlhZ2lyIGRcdTAwRThzIHF1J3VuIG5cdTAxNTN1ZCBlc3QgYWpvdXRcdTAwRTkgKi9cbiAgICB0cnkge1xuICAgICAgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbigpIHsgY2hlY2soKTsgfSk7XG4gICAgICBvYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmJvZHkgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCB7XG4gICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICAgICAgYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgICAgYXR0cmlidXRlRmlsdGVyOiBbXCJpZFwiLCBcIm5hbWVcIiwgXCJjbGFzc1wiLCBcInN0eWxlXCIsIFwiaGlkZGVuXCIsIFwiZGlzYWJsZWRcIl0sXG4gICAgICB9KTtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIC8qIEZhbGxiYWNrIHBvbGxpbmcgc2kgTXV0YXRpb25PYnNlcnZlciBcdTAwRTljaG91ZSAqL1xuICAgICAgdmFyIHBvbGxJbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgICAgICBjaGVjaygpO1xuICAgICAgICBpZiAocmVzb2x2ZWQpIGNsZWFySW50ZXJ2YWwocG9sbEludGVydmFsKTtcbiAgICAgIH0sIDE1MCk7XG4gICAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwocG9sbEludGVydmFsKTtcbiAgICAgICAgaWYgKCFyZXNvbHZlZCkgeyByZXNvbHZlZCA9IHRydWU7IHJlc29sdmUobnVsbCk7IH1cbiAgICAgIH0sIHRpbWVvdXRNcyB8fCA1MDAwKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvKiBQb2xsaW5nIGRlIHNlY291cnMgdG91dGVzIGxlcyAzMDBtcyAobGVzIGlmcmFtZXMgbmUgZFx1MDBFOWNsZW5jaGVudCBwYXMgbGUgTXV0YXRpb25PYnNlcnZlcikgKi9cbiAgICB2YXIgaWZyYW1lUG9sbCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkgeyBjaGVjaygpOyB9LCAzMDApO1xuXG4gICAgLyogVGltZW91dCAqL1xuICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIGNsZWFySW50ZXJ2YWwoaWZyYW1lUG9sbCk7XG4gICAgICBjbGVhbnVwKCk7XG4gICAgICByZXNvbHZlKG51bGwpO1xuICAgIH0sIHRpbWVvdXRNcyB8fCA1MDAwKTtcbiAgfSk7XG59XG4iLCAiLyogXHUyNTAwXHUyNTAwIEZvcm1hdCBVdGlsaXR5IEZ1bmN0aW9ucyAmIENvbnN0YW50cyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGNhcGl0YWxpemUocykge1xuICBpZiAoIXMpIHJldHVybiBcIlwiO1xuICByZXR1cm4gcy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHMuc2xpY2UoMSkudG9Mb3dlckNhc2UoKTtcbn1cblxuLyogTm9ybWFsaXNlIHVuIG51bVx1MDBFOXJvIGRlIHRcdTAwRTlsXHUwMEU5cGhvbmUgZW4gMTAgY2hpZmZyZXMgZnJhblx1MDBFN2FpcyA6XG4gICArMzM2MTIzNDU2NzggXHUyMTkyIDA2MTIzNDU2NzggfCAwMDMzNjEyMzQ1Njc4IFx1MjE5MiAwNjEyMzQ1Njc4XG4gICBTdXBwcmltZSB0b3V0IGNlIHF1aSBkXHUwMEU5cGFzc2UgMTAgY2hpZmZyZXMuIFJldG91cm5lIFwiXCIgc2kgPCAxMCBjaGlmZnJlcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVQaG9uZShyYXcpIHtcbiAgaWYgKCFyYXcpIHJldHVybiBcIlwiO1xuICB2YXIgcyA9IFN0cmluZyhyYXcpLnJlcGxhY2UoL1tcXHMuXFwtKCldL2csIFwiXCIpO1xuICBpZiAocy5zdGFydHNXaXRoKFwiKzMzXCIpKSBzID0gXCIwXCIgKyBzLnNsaWNlKDMpO1xuICBlbHNlIGlmIChzLnN0YXJ0c1dpdGgoXCIwMDMzXCIpKSBzID0gXCIwXCIgKyBzLnNsaWNlKDQpO1xuICBzID0gcy5yZXBsYWNlKC9cXEQvZywgXCJcIik7XG4gIGlmIChzLmxlbmd0aCA+IDEwKSBzID0gcy5zbGljZSgwLCAxMCk7XG4gIHJldHVybiBzLmxlbmd0aCA9PT0gMTAgPyBzIDogXCJcIjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRldGVjdE9wdGljYWxGb3JtYXQoZWwpIHtcbiAgdmFyIHBoID0gKGVsLnBsYWNlaG9sZGVyIHx8IFwiXCIpLnRyaW0oKTtcbiAgaWYgKC8sLy50ZXN0KHBoKSkgcmV0dXJuIFwiY29tbWFcIjtcbiAgaWYgKC9eXFxkLy50ZXN0KHBoKSkgcmV0dXJuIFwibm9fcGx1c1wiO1xuICByZXR1cm4gXCJkZWZhdWx0XCI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRPcHRpY2FsVmFsdWUodmFsdWUsIGVsKSB7XG4gIHZhciBmbXQgPSBkZXRlY3RPcHRpY2FsRm9ybWF0KGVsKTtcbiAgaWYgKE9QVElDQUxfRk9STUFUVEVSU1tmbXRdKSByZXR1cm4gT1BUSUNBTF9GT1JNQVRURVJTW2ZtdF0oU3RyaW5nKHZhbHVlKSk7XG4gIHJldHVybiBTdHJpbmcodmFsdWUpO1xufVxuXG4vKiBcdTI1MDBcdTI1MDAgVmFsdWUgTm9ybWFsaXplcnMgXHUyMDE0IGZvcm1hdGFnZSBhZGFwdFx1MDBFOSBhdSBjaGFtcCBjaWJsZSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cbmV4cG9ydCB2YXIgVkFMVUVfTk9STUFMSVpFUlMgPSB7XG4gIG51bWVyb1NlY3VyaXRlU29jaWFsZTogZnVuY3Rpb24odiwgZWwpIHtcbiAgICB2YXIgcmF3ID0gdi5yZXBsYWNlKC9cXEQvZywgXCJcIik7XG4gICAgdmFyIG1heGxlbiA9IHBhcnNlSW50KGVsLmdldEF0dHJpYnV0ZShcIm1heGxlbmd0aFwiKSB8fCBcIjE1XCIpO1xuICAgIHZhciBwaCA9IChlbC5wbGFjZWhvbGRlciB8fCBcIlwiKTtcbiAgICBpZiAobWF4bGVuID49IDE5IHx8IC9cXGRcXHNcXGQvLnRlc3QocGgpKSB7XG4gICAgICB2YXIgZCA9IHJhdztcbiAgICAgIHJldHVybiAoZFswXXx8XCJcIikrXCIgXCIrKGQuc2xpY2UoMSwzKXx8XCJcIikrXCIgXCIrKGQuc2xpY2UoMyw1KXx8XCJcIikrXCIgXCIrKGQuc2xpY2UoNSw3KXx8XCJcIikrXCIgXCIrKGQuc2xpY2UoNywxMCl8fFwiXCIpK1wiIFwiKyhkLnNsaWNlKDEwLDEzKXx8XCJcIikrKHJhdy5sZW5ndGg+PTE1P1wiIFwiK2Quc2xpY2UoMTMsMTUpOlwiXCIpO1xuICAgIH1cbiAgICBpZiAobWF4bGVuID09PSAxMykgcmV0dXJuIHJhdy5zbGljZSgwLDEzKTtcbiAgICByZXR1cm4gcmF3LnNsaWNlKDAsMTUpO1xuICB9LFxuICB0ZWxlcGhvbmU6IGZ1bmN0aW9uKHYsIGVsKSB7XG4gICAgdmFyIHJhdyA9IHYucmVwbGFjZSgvXFxEL2csIFwiXCIpO1xuICAgIHZhciBwaCA9IGVsLnBsYWNlaG9sZGVyIHx8IFwiXCI7XG4gICAgaWYgKC9cXGR7Mn1cXHMvLnRlc3QocGgpKSByZXR1cm4gcmF3LnNsaWNlKDAsMikrXCIgXCIrcmF3LnNsaWNlKDIsNCkrXCIgXCIrcmF3LnNsaWNlKDQsNikrXCIgXCIrcmF3LnNsaWNlKDYsOCkrXCIgXCIrcmF3LnNsaWNlKDgsMTApO1xuICAgIHJldHVybiByYXcuc2xpY2UoMCwxMCk7XG4gIH1cbn07XG5cbi8qIFx1MjUwMFx1MjUwMCBPUFRJQ0FMX0ZPUk1BVFRFUlMgXHUyMDE0IGNvcnJlY3Rpb25zIG9wdGlxdWVzIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuZXhwb3J0IHZhciBPUFRJQ0FMX0ZPUk1BVFRFUlMgPSB7XG4gIGNvbW1hOiBmdW5jdGlvbih2KSB7IHJldHVybiB2LnJlcGxhY2UoXCIuXCIsIFwiLFwiKTsgfSxcbiAgbm9fcGx1czogZnVuY3Rpb24odikgeyByZXR1cm4gdi5yZXBsYWNlKC9eXFwrLywgXCJcIik7IH0sXG4gIGFic29sdXRlOiBmdW5jdGlvbih2KSB7IHJldHVybiB2LnJlcGxhY2UoL15bKy1dLywgXCJcIik7IH1cbn07XG5cbi8qIENoYW1wcyBvcHRpcXVlcyBcdTAwRTAgZm9ybWF0dGVyICovXG5leHBvcnQgdmFyIE9QVElDQUxfRklFTERfS0VZUyA9IFtcbiAgXCJsdW5ldHRlc09ELnNwaGVyZVwiLCBcImx1bmV0dGVzT0QuY3lsaW5kcmVcIiwgXCJsdW5ldHRlc09ELmF4ZVwiLCBcImx1bmV0dGVzT0QuYWRkaXRpb25cIixcbiAgXCJsdW5ldHRlc09HLnNwaGVyZVwiLCBcImx1bmV0dGVzT0cuY3lsaW5kcmVcIiwgXCJsdW5ldHRlc09HLmF4ZVwiLCBcImx1bmV0dGVzT0cuYWRkaXRpb25cIixcbiAgXCJsZW50aWxsZXNPRC5zcGhlcmVcIiwgXCJsZW50aWxsZXNPRC5jeWxpbmRyZVwiLCBcImxlbnRpbGxlc09ELmF4ZVwiLCBcImxlbnRpbGxlc09ELmFkZGl0aW9uXCIsXG4gIFwibGVudGlsbGVzT0cuc3BoZXJlXCIsIFwibGVudGlsbGVzT0cuY3lsaW5kcmVcIiwgXCJsZW50aWxsZXNPRy5heGVcIiwgXCJsZW50aWxsZXNPRy5hZGRpdGlvblwiXG5dO1xuXG4vKiBOb3JtYWxpc2UgdW5lIGRhdGUgdmVycyBERC9NTS9ZWVlZIChwb3VyIGFmZmljaGFnZSkgZXQgWVlZWS1NTS1ERCAocG91ciBpbnB1dFt0eXBlPWRhdGVdKSAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZURhdGVWYWx1ZShyYXcpIHtcbiAgaWYgKCFyYXcpIHJldHVybiB7IGRpc3BsYXk6IHJhdywgaXNvOiByYXcgfTtcbiAgdmFyIGQgPSBTdHJpbmcocmF3KS5yZXBsYWNlKC9cXEQvZywgXCJcIik7XG4gIHZhciBkZCwgbW0sIHl5eXk7XG4gIC8qIFByaW9yaXRcdTAwRTkgMSA6IGRcdTAwRTlqXHUwMEUwIEREL01NL1lZWVkgXHUyMTkyIG5lIHBhcyByZS1wYXJzZXIgKi9cbiAgaWYgKC9eXFxkezJ9XFwvXFxkezJ9XFwvXFxkezR9JC8udGVzdChyYXcpKSB7XG4gICAgdmFyIHAyID0gcmF3LnNwbGl0KFwiL1wiKTsgZGQgPSBwMlswXTsgbW0gPSBwMlsxXTsgeXl5eSA9IHAyWzJdO1xuICAvKiBQcmlvcml0XHUwMEU5IDIgOiBJU08gWVlZWS1NTS1ERCAqL1xuICB9IGVsc2UgaWYgKC9eXFxkezR9LVxcZHsyfS1cXGR7Mn0kLy50ZXN0KHJhdykpIHtcbiAgICB2YXIgcCA9IHJhdy5zcGxpdChcIi1cIik7IHl5eXkgPSBwWzBdOyBtbSA9IHBbMV07IGRkID0gcFsyXTtcbiAgLyogUHJpb3JpdFx1MDBFOSAzIDogOCBjaGlmZnJlcyBicnV0cyAqL1xuICB9IGVsc2UgaWYgKGQubGVuZ3RoID09PSA4KSB7XG4gICAgaWYgKHBhcnNlSW50KGQuc2xpY2UoMCwgNCkpID4gMTkwMCkge1xuICAgICAgeXl5eSA9IGQuc2xpY2UoMCwgNCk7IG1tID0gZC5zbGljZSg0LCA2KTsgZGQgPSBkLnNsaWNlKDYsIDgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZCA9IGQuc2xpY2UoMCwgMik7IG1tID0gZC5zbGljZSgyLCA0KTsgeXl5eSA9IGQuc2xpY2UoNCwgOCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiB7IGRpc3BsYXk6IHJhdywgaXNvOiByYXcgfTtcbiAgfVxuICByZXR1cm4ge1xuICAgIGRpc3BsYXk6IGRkICsgXCIvXCIgKyBtbSArIFwiL1wiICsgeXl5eSxcbiAgICBpc286IHl5eXkgKyBcIi1cIiArIG1tICsgXCItXCIgKyBkZCxcbiAgICBkZDogZGQsIG1tOiBtbSwgeXl5eTogeXl5eVxuICB9O1xufVxuXG4vKiBWXHUwMEU5cmlmaWUgc2kgdW4gY2hhbXAgYSBcdTAwRTl0XHUwMEU5IHJlbXBsaSBhdmVjIHN1Y2NcdTAwRThzICovXG5leHBvcnQgZnVuY3Rpb24gZmllbGRIYXNWYWx1ZShlbCwgZXhwZWN0ZWQpIHtcbiAgdmFyIHZhbCA9IFN0cmluZyhlbC52YWx1ZSB8fCBcIlwiKS50cmltKCk7XG4gIHZhciBleHAgPSBTdHJpbmcoZXhwZWN0ZWQgfHwgXCJcIikudHJpbSgpO1xuICByZXR1cm4gdmFsICE9PSBcIlwiICYmICh2YWwgPT09IGV4cCB8fCB2YWwucmVwbGFjZSgvXFxEL2csIFwiXCIpID09PSBleHAucmVwbGFjZSgvXFxEL2csIFwiXCIpKTtcbn1cbiIsICIvKiBcdTI1MDBcdTI1MDAgRGF0YSBVdGlsaXR5IEZ1bmN0aW9ucyAmIENvbnN0YW50cyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldENhY2hlZENsaWVudChkYXRhKSB7XG4gIHZhciBjYWNoZSA9IGF3YWl0IHJlYWRFbmNyeXB0ZWRDYWNoZSgpO1xuICBpZiAoIWNhY2hlKSByZXR1cm4gbnVsbDtcbiAgcmV0dXJuIGNhY2hlLmN1cnJlbnQgfHwgbnVsbDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFNtYXJ0RmlsbERhdGEoKSB7XG4gIHZhciBkYXRhID0ge307XG4gIHRyeSB7XG4gICAgdmFyIHRleHQgPSBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLnJlYWRUZXh0KCk7XG4gICAgdmFyIHBhcnNlZCA9IEpTT04ucGFyc2UodGV4dCk7XG4gICAgaWYgKHBhcnNlZC5tIHx8IHBhcnNlZC5vKSBkYXRhID0gcGFyc2VkO1xuICB9IGNhdGNoKGUpIHt9XG4gIHZhciBjYWNoZWQgPSBhd2FpdCBnZXRDYWNoZWRDbGllbnQoZGF0YSk7XG4gIHZhciBtID0gY2FjaGVkIHx8IGRhdGEubSB8fCB7fTtcbiAgdmFyIG8gPSBkYXRhLm8gfHwge307XG5cbiAgLyogUHJpb3JpdFx1MDBFOSA6IGRvbm5cdTAwRTllcyBtdXR1ZWxsZSBzdXIgbGEgY2FydGUsIHNpbm9uIG9yZG9ubmFuY2UgKi9cbiAgdmFyIHAgPSAobS5wZXJzb25uZXMgJiYgbS5wZXJzb25uZXNbMF0pIHx8IHt9O1xuICAvKiBFeHRyYWlyZSBsZXMgZG9ublx1MDBFOWVzIGR1IHJcdTAwRTlnaW1lIHJjMSAoVFAgUGx1cyAvIG11dHVlbGxlKSAqL1xuICB2YXIgcmMxID0gKG0ucmVnaW1lcyAmJiBtLnJlZ2ltZXMucmMxKSB8fCB7fTtcblxuICByZXR1cm4ge1xuICAgIG9yZ2FuaXNtZTogICAgICAgICAgICAgIG0ub3JnYW5pc21lIHx8IHJjMS5ub20gfHwgXCJcIixcbiAgICBudW1lcm9BTUM6ICAgICAgICAgICAgICBtLm51bWVyb0FNQyB8fCByYzEubnVtZXJvQU1DIHx8IFwiXCIsXG4gICAgbnVtZXJvQWRoZXJlbnQ6ICAgICAgICAgbS5udW1lcm9BZGhlcmVudCB8fCByYzEubnVtZXJvQWRoZXJlbnQgfHwgcmMxLm51bWVyb0NvbnRyYXQgfHwgXCJcIixcbiAgICBudW1lcm9UZWxldHJhbnNtaXNzaW9uOiBtLm51bWVyb1RlbGV0cmFuc21pc3Npb24gfHwgcmMxLm51bWVyb1RlbGV0cmFuc21pc3Npb24gfHwgXCJcIixcbiAgICB0eXBlQ29udjogICAgICAgICAgICAgICBtLnR5cGVDb252IHx8IHJjMS5jb2RlQ29udmVudGlvbiB8fCBcIlwiLFxuICAgIGRhdGVEZWJ1dFZhbGlkaXRlOiAgICAgIG0uZGF0ZURlYnV0VmFsaWRpdGUgfHwgcmMxLmRhdGVEZWJ1dCB8fCBcIlwiLFxuICAgIGRhdGVGaW5WYWxpZGl0ZTogICAgICAgIG0uZGF0ZUZpblZhbGlkaXRlIHx8IHJjMS5kYXRlRmluIHx8IFwiXCIsXG4gICAgbm9tOiAgICAgICAgICAgICAgICAgICAgKG0ubm9tIHx8IHAubm9tIHx8IG8ubm9tUGF0aWVudCB8fCBcIlwiKS50b1VwcGVyQ2FzZSgpLFxuICAgIHByZW5vbTogICAgICAgICAgICAgICAgIG0ucHJlbm9tIHx8IHAucHJlbm9tIHx8IG8ucHJlbm9tUGF0aWVudCB8fCBcIlwiLFxuICAgIG51bWVyb1NlY3VyaXRlU29jaWFsZTogIG0ubnVtZXJvU2VjdXJpdGVTb2NpYWxlIHx8IG0ubnNzIHx8IHAubnVtZXJvU2VjdXJpdGVTb2NpYWxlIHx8IFwiXCIsXG4gICAgZGF0ZU5haXNzYW5jZTogICAgICAgICAgbS5kYXRlTmFpc3NhbmNlIHx8IG0uZG9iIHx8IHAuZGF0ZU5haXNzYW5jZSB8fCBvLmRhdGVOYWlzc2FuY2VQYXRpZW50IHx8IFwiXCIsXG4gICAgdGVsZXBob25lOiAoZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcmF3ID0gbS50ZWxlcGhvbmUgfHwgbS5waG9uZSB8fCBcIlwiO1xuICAgICAgaWYgKCFyYXcpIHJldHVybiBcIlwiO1xuICAgICAgdmFyIGRpZ2l0cyA9IHJhdy5yZXBsYWNlKC9cXEQvZywgXCJcIik7XG4gICAgICBpZiAoZGlnaXRzLmxlbmd0aCA9PT0gMTEgJiYgZGlnaXRzLnN0YXJ0c1dpdGgoXCIzM1wiKSkgZGlnaXRzID0gXCIwXCIgKyBkaWdpdHMuc2xpY2UoMik7XG4gICAgICBpZiAoZGlnaXRzLmxlbmd0aCA9PT0gMTIgJiYgZGlnaXRzLnN0YXJ0c1dpdGgoXCIzMzBcIikpIGRpZ2l0cyA9IFwiMFwiICsgZGlnaXRzLnNsaWNlKDMpO1xuICAgICAgdmFyIHJlc3VsdCA9IGRpZ2l0cy5zbGljZSgwLCAxMCk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0pKCksXG4gICAgZW1haWw6ICAgICAgICAgICAgICAgICAgbS5lbWFpbCB8fCBcIlwiLFxuICAgIGFkcmVzc2U6ICAgICAgICAgICAgICAgIG0uYWRyZXNzZSB8fCBtLmFkZHJlc3MgfHwgXCJcIixcbiAgICBjb2RlUG9zdGFsOiAgICAgICAgICAgICBtLmNvZGVQb3N0YWwgfHwgbS56aXBDb2RlIHx8IFwiXCIsXG4gICAgdmlsbGU6ICAgICAgICAgICAgICAgICAgbS52aWxsZSB8fCBtLmNpdHkgfHwgXCJcIixcbiAgICBkYXRlVmFsaWRpdGU6ICAgICAgICAgICBvLmRhdGVWYWxpZGl0ZSB8fCBcIlwiLFxuICAgIG5vbVBhdGllbnQ6ICAgICAgICAgICAgIG8ubm9tUGF0aWVudCB8fCBcIlwiLFxuICAgIHByZW5vbVBhdGllbnQ6ICAgICAgICAgIG8ucHJlbm9tUGF0aWVudCB8fCBcIlwiLFxuICAgIGRhdGVOYWlzc2FuY2VQYXRpZW50OiAgIG8uZGF0ZU5haXNzYW5jZVBhdGllbnQgfHwgXCJcIixcbiAgICBkaXN0YW5jZVB1cGlsbGFpcmU6ICAgICBvLmRpc3RhbmNlUHVwaWxsYWlyZSB8fCBcIlwiLFxuICAgIHR5cGVQcmVzY3JpcHRpb246ICAgICAgIG8udHlwZVByZXNjcmlwdGlvbiB8fCAobS5wcmVzY3JpcHRpb24gJiYgbS5wcmVzY3JpcHRpb24udHlwZVZpc2lvbikgfHwgXCJcIixcbiAgICByZW1hcnF1ZXM6ICAgICAgICAgICAgICBvLnJlbWFycXVlcyB8fCBcIlwiLFxuICAgIC8qIE9yZG9ubmFuY2UgXHUyMDE0IGZhbGxiYWNrIG0ucHJlc2NyaXB0aW9uIChmb3JtYXQgTGl2ZUJ5T3B0aW11bS9UUCBQbHVzKSAqL1xuICAgIGRhdGVPcmRvbm5hbmNlOiAgICAgICAgIG8uZGF0ZU9yZG9ubmFuY2UgfHwgKG0ucHJlc2NyaXB0aW9uICYmIG0ucHJlc2NyaXB0aW9uLmRhdGVQcmVzY3JpcHRpb24pIHx8IFwiXCIsXG4gICAgbm9tT3BodGFsbW9sb2d1ZTogICAgICAgby5ub21PcGh0YWxtb2xvZ3VlIHx8IChtLnByZXNjcmlwdGlvbiAmJiBtLnByZXNjcmlwdGlvbi5wcmVzY3JpcHRldXIpIHx8IFwiXCIsXG4gICAgcnBwczogICAgICAgICAgICAgICAgICAgby5ycHBzIHx8IChtLnByZXNjcmlwdGlvbiAmJiBtLnByZXNjcmlwdGlvbi5ycHBzKSB8fCBcIlwiLFxuICAgIFwibHVuZXR0ZXNPRC5zcGhlcmVcIjogICAgKG8ubHVuZXR0ZXNPRCAmJiBvLmx1bmV0dGVzT0Quc3BoZXJlKSA/IFN0cmluZyhvLmx1bmV0dGVzT0Quc3BoZXJlKSA6IChtLnByZXNjcmlwdGlvbiAmJiBtLnByZXNjcmlwdGlvbi5vZCAmJiBtLnByZXNjcmlwdGlvbi5vZC5zcGhlcmUpID8gU3RyaW5nKG0ucHJlc2NyaXB0aW9uLm9kLnNwaGVyZSkgOiBcIlwiLFxuICAgIFwibHVuZXR0ZXNPRC5jeWxpbmRyZVwiOiAgKG8ubHVuZXR0ZXNPRCAmJiBvLmx1bmV0dGVzT0QuY3lsaW5kcmUpID8gU3RyaW5nKG8ubHVuZXR0ZXNPRC5jeWxpbmRyZSkgOiAobS5wcmVzY3JpcHRpb24gJiYgbS5wcmVzY3JpcHRpb24ub2QgJiYgbS5wcmVzY3JpcHRpb24ub2QuY3lsaW5kcmUpID8gU3RyaW5nKG0ucHJlc2NyaXB0aW9uLm9kLmN5bGluZHJlKSA6IFwiXCIsXG4gICAgXCJsdW5ldHRlc09ELmF4ZVwiOiAgICAgICAoby5sdW5ldHRlc09EICYmIG8ubHVuZXR0ZXNPRC5heGUpID8gU3RyaW5nKG8ubHVuZXR0ZXNPRC5heGUpIDogKG0ucHJlc2NyaXB0aW9uICYmIG0ucHJlc2NyaXB0aW9uLm9kICYmIG0ucHJlc2NyaXB0aW9uLm9kLmF4ZSkgPyBTdHJpbmcobS5wcmVzY3JpcHRpb24ub2QuYXhlKSA6IFwiXCIsXG4gICAgXCJsdW5ldHRlc09ELmFkZGl0aW9uXCI6ICAoby5sdW5ldHRlc09EICYmIG8ubHVuZXR0ZXNPRC5hZGRpdGlvbikgPyBTdHJpbmcoby5sdW5ldHRlc09ELmFkZGl0aW9uKSA6IChtLnByZXNjcmlwdGlvbiAmJiBtLnByZXNjcmlwdGlvbi5vZCAmJiBtLnByZXNjcmlwdGlvbi5vZC5hZGRpdGlvbikgPyBTdHJpbmcobS5wcmVzY3JpcHRpb24ub2QuYWRkaXRpb24pIDogXCJcIixcbiAgICBcImx1bmV0dGVzT0cuc3BoZXJlXCI6ICAgIChvLmx1bmV0dGVzT0cgJiYgby5sdW5ldHRlc09HLnNwaGVyZSkgPyBTdHJpbmcoby5sdW5ldHRlc09HLnNwaGVyZSkgOiAobS5wcmVzY3JpcHRpb24gJiYgbS5wcmVzY3JpcHRpb24ub2cgJiYgbS5wcmVzY3JpcHRpb24ub2cuc3BoZXJlKSA/IFN0cmluZyhtLnByZXNjcmlwdGlvbi5vZy5zcGhlcmUpIDogXCJcIixcbiAgICBcImx1bmV0dGVzT0cuY3lsaW5kcmVcIjogIChvLmx1bmV0dGVzT0cgJiYgby5sdW5ldHRlc09HLmN5bGluZHJlKSA/IFN0cmluZyhvLmx1bmV0dGVzT0cuY3lsaW5kcmUpIDogKG0ucHJlc2NyaXB0aW9uICYmIG0ucHJlc2NyaXB0aW9uLm9nICYmIG0ucHJlc2NyaXB0aW9uLm9nLmN5bGluZHJlKSA/IFN0cmluZyhtLnByZXNjcmlwdGlvbi5vZy5jeWxpbmRyZSkgOiBcIlwiLFxuICAgIFwibHVuZXR0ZXNPRy5heGVcIjogICAgICAgKG8ubHVuZXR0ZXNPRyAmJiBvLmx1bmV0dGVzT0cuYXhlKSA/IFN0cmluZyhvLmx1bmV0dGVzT0cuYXhlKSA6IChtLnByZXNjcmlwdGlvbiAmJiBtLnByZXNjcmlwdGlvbi5vZyAmJiBtLnByZXNjcmlwdGlvbi5vZy5heGUpID8gU3RyaW5nKG0ucHJlc2NyaXB0aW9uLm9nLmF4ZSkgOiBcIlwiLFxuICAgIFwibHVuZXR0ZXNPRy5hZGRpdGlvblwiOiAgKG8ubHVuZXR0ZXNPRyAmJiBvLmx1bmV0dGVzT0cuYWRkaXRpb24pID8gU3RyaW5nKG8ubHVuZXR0ZXNPRy5hZGRpdGlvbikgOiAobS5wcmVzY3JpcHRpb24gJiYgbS5wcmVzY3JpcHRpb24ub2cgJiYgbS5wcmVzY3JpcHRpb24ub2cuYWRkaXRpb24pID8gU3RyaW5nKG0ucHJlc2NyaXB0aW9uLm9nLmFkZGl0aW9uKSA6IFwiXCIsXG4gICAgXCJsZW50aWxsZXNPRC5zcGhlcmVcIjogICAoby5sZW50aWxsZXNPRCAmJiBvLmxlbnRpbGxlc09ELnNwaGVyZSkgPyBTdHJpbmcoby5sZW50aWxsZXNPRC5zcGhlcmUpIDogXCJcIixcbiAgICBcImxlbnRpbGxlc09ELmN5bGluZHJlXCI6IChvLmxlbnRpbGxlc09EICYmIG8ubGVudGlsbGVzT0QuY3lsaW5kcmUpID8gU3RyaW5nKG8ubGVudGlsbGVzT0QuY3lsaW5kcmUpIDogXCJcIixcbiAgICBcImxlbnRpbGxlc09ELmF4ZVwiOiAgICAgIChvLmxlbnRpbGxlc09EICYmIG8ubGVudGlsbGVzT0QuYXhlKSA/IFN0cmluZyhvLmxlbnRpbGxlc09ELmF4ZSkgOiBcIlwiLFxuICAgIFwibGVudGlsbGVzT0QuYWRkaXRpb25cIjogKG8ubGVudGlsbGVzT0QgJiYgby5sZW50aWxsZXNPRC5hZGRpdGlvbikgPyBTdHJpbmcoby5sZW50aWxsZXNPRC5hZGRpdGlvbikgOiBcIlwiLFxuICAgIFwibGVudGlsbGVzT0QucmF5b25Db3VyYnVyZVwiOiAoby5sZW50aWxsZXNPRCAmJiBvLmxlbnRpbGxlc09ELnJheW9uQ291cmJ1cmUpID8gU3RyaW5nKG8ubGVudGlsbGVzT0QucmF5b25Db3VyYnVyZSkgOiBcIlwiLFxuICAgIFwibGVudGlsbGVzT0QuZGlhbWV0cmVcIjogKG8ubGVudGlsbGVzT0QgJiYgby5sZW50aWxsZXNPRC5kaWFtZXRyZSkgPyBTdHJpbmcoby5sZW50aWxsZXNPRC5kaWFtZXRyZSkgOiBcIlwiLFxuICAgIFwibGVudGlsbGVzT0cuc3BoZXJlXCI6ICAgKG8ubGVudGlsbGVzT0cgJiYgby5sZW50aWxsZXNPRy5zcGhlcmUpID8gU3RyaW5nKG8ubGVudGlsbGVzT0cuc3BoZXJlKSA6IFwiXCIsXG4gICAgXCJsZW50aWxsZXNPRy5jeWxpbmRyZVwiOiAoby5sZW50aWxsZXNPRyAmJiBvLmxlbnRpbGxlc09HLmN5bGluZHJlKSA/IFN0cmluZyhvLmxlbnRpbGxlc09HLmN5bGluZHJlKSA6IFwiXCIsXG4gICAgXCJsZW50aWxsZXNPRy5heGVcIjogICAgICAoby5sZW50aWxsZXNPRyAmJiBvLmxlbnRpbGxlc09HLmF4ZSkgPyBTdHJpbmcoby5sZW50aWxsZXNPRy5heGUpIDogXCJcIixcbiAgICBcImxlbnRpbGxlc09HLmFkZGl0aW9uXCI6IChvLmxlbnRpbGxlc09HICYmIG8ubGVudGlsbGVzT0cuYWRkaXRpb24pID8gU3RyaW5nKG8ubGVudGlsbGVzT0cuYWRkaXRpb24pIDogXCJcIixcbiAgICBcImxlbnRpbGxlc09HLnJheW9uQ291cmJ1cmVcIjogKG8ubGVudGlsbGVzT0cgJiYgby5sZW50aWxsZXNPRy5yYXlvbkNvdXJidXJlKSA/IFN0cmluZyhvLmxlbnRpbGxlc09HLnJheW9uQ291cmJ1cmUpIDogXCJcIixcbiAgICBcImxlbnRpbGxlc09HLmRpYW1ldHJlXCI6IChvLmxlbnRpbGxlc09HICYmIG8ubGVudGlsbGVzT0cuZGlhbWV0cmUpID8gU3RyaW5nKG8ubGVudGlsbGVzT0cuZGlhbWV0cmUpIDogXCJcIixcbiAgfTtcbn1cblxuLyogXHUyNTAwXHUyNTAwIFNtYXJ0IEZpbGwgXHUyMDE0IGRpY3Rpb25uYWlyZSBkJ2FsaWFzIHBhciBjaGFtcCBPQ1IgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG5leHBvcnQgdmFyIFNNQVJUX0ZJTExfQUxJQVNFUyA9IHtcbiAgLyogXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXG4gICAqICBNVVRVRUxMRSAvIFRJRVJTLVBBWUFOVFxuICAgKiBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTAgKi9cbiAgb3JnYW5pc21lOiBbXG4gICAgXCJvcmdhbmlzbWVcIiwgXCJtdXR1ZWxsZVwiLCBcImNhaXNzZVwiLCBcImFzc3VyZXVyXCIsIFwiY29tcGFnbmllXCIsIFwiY29tcGxlbWVudGFpcmVcIiwgXCJhc3N1cmFuY2VcIixcbiAgICBcIm9yZ2FuaXNtZV9jb21wbGVtZW50YWlyZVwiLCBcIm5vbV9tdXR1ZWxsZVwiLCBcImxpYmVsbGVfb3JnYW5pc21lXCIsIFwibm9tX29yZ2FuaXNtZVwiLFxuICAgIFwib3JnYW5pc21lX2FtY1wiLCBcImNhaXNzZV9jb21wbGVtZW50YWlyZVwiLCBcImFzc3VyYW5jZV9jb21wbGVtZW50YWlyZVwiLCBcImNvbXBsZW1lbnRhaXJlX3NhbnRlXCIsXG4gICAgXCJyZWdpbWVfY29tcGxlbWVudGFpcmVcIiwgXCJ0aWVyc19wYXlhbnRcIiwgXCJvcmdhbmlzbWVfdHBcIiwgXCJ0cF9vcmdhbmlzbWVcIiwgXCJvcmdhbmlzbWVfcmNcIixcbiAgICBcInJjX29yZ2FuaXNtZVwiLCBcIm5vbV9jYWlzc2VcIiwgXCJub21fYXNzdXJldXJcIiwgXCJub21fY29tcGFnbmllXCIsIFwiY29kZV9tdXR1ZWxsZVwiLFxuICAgIFwibXV0dWVsbGVfbm9tXCIsIFwib2NcIiwgXCJvcmdhbmlzbWVfb2NcIiwgXCJpbnN1cmVyXCIsIFwiaW5zdXJhbmNlXCIsIFwiaW5zdXJhbmNlX2NvbXBhbnlcIixcbiAgICBcImluc3VyYW5jZV9wcm92aWRlclwiLCBcImhlYWx0aF9mdW5kXCIsIFwibXV0dWFsXCIsIFwiZnVuZF9uYW1lXCIsIFwicGF5ZXJcIixcbiAgICBcImluc3VyZXJOYW1lXCIsIFwib3JnYW5pc21lQ29tcGxlbWVudGFpcmVcIiwgXCJsaWJlbGxlT3JnYW5pc21lXCIsIFwibm9tTXV0dWVsbGVcIixcbiAgXSxcbiAgbnVtZXJvQU1DOiBbXG4gICAgLyogc3RhbmRhcmQgKi9cbiAgICBcIm51bWVyb2FtY1wiLCBcIm51bV9hbWNcIiwgXCJhbWNcIiwgXCJjb2RlX2FtY1wiLCBcImNvZGVfb3JnYW5pc21lXCIsIFwiaWRfb3JnYW5pc21lXCIsIFwibnVtX29yZ2FuaXNtZVwiLFxuICAgIFwibnVtZXJvX29yZ2FuaXNtZVwiLCBcImNvZGVfY2Fpc3NlXCIsIFwibnVtZXJvX2FtY1wiLCBcImNvZGVBbWNcIiwgXCJhbWNDb2RlXCIsIFwiYW1jTnVtYmVyXCIsXG4gICAgXCJjb2RlX2NvbXBsZW1lbnRhaXJlXCIsIFwiaWRfYW1jXCIsIFwicmVmX2FtY1wiLFxuICAgIC8qIHZhcmlhdGlvbnMgcG9ydGFpbHMgKi9cbiAgICBcImNvZGVfb2NcIiwgXCJudW1fb2NcIiwgXCJpZF9vY1wiLCBcIm51bWVyb19vY1wiLCBcImlkZW50aWZpYW50X29jXCIsXG4gICAgXCJjb2RlX2NvbXBsZW1lbnRhaXJlX3NhbnRlXCIsIFwiY29kZV9tdXR1ZWxsZVwiLCBcImlkX211dHVlbGxlXCIsXG4gICAgXCJjb2RlX2Fzc3VyZXVyXCIsIFwibnVtX2Fzc3VyZXVyXCIsIFwiaWRlbnRpZmlhbnRfbXV0dWVsbGVcIixcbiAgICBcImNvZGVBTUNcIiwgXCJudW1BTUNcIiwgXCJpZEFNQ1wiLCBcImFtY0lkZW50aWZpZXJcIixcbiAgICAvKiBBbG1lcnlzICovXG4gICAgXCJjb2RlT3JnYW5pc21lXCIsIFwiaWRPcmdhbmlzbWVcIiwgXCJudW1PcmdhbmlzbWVcIixcbiAgICAvKiBWaWFtZWRpcyAqL1xuICAgIFwidm0tYW1jXCIsIFwidm0tY29kZS1vY1wiLFxuICAgIC8qIGRhdGEtdGVzdGlkICovXG4gICAgXCJhbWMtY29kZVwiLCBcIm9yZ2FuaXNtZS1jb2RlXCIsIFwibXV0dWVsbGUtY29kZVwiLFxuICBdLFxuICBudW1lcm9BZGhlcmVudDogW1xuICAgIC8qIHN0YW5kYXJkICovXG4gICAgXCJudW1lcm9hZGhlcmVudFwiLCBcIm51bV9hZGhlcmVudFwiLCBcImFkaGVyZW50XCIsIFwibnVtZXJvX2NvbnRyYXRcIiwgXCJudW1fY29udHJhdFwiLCBcIm51bWNvbnRyYXRcIixcbiAgICBcIm5vY29udHJhdFwiLCBcIm5vX2NvbnRyYXRcIiwgXCJpZF9hZGhlcmVudFwiLCBcInJlZl9hZGhlcmVudFwiLCBcIm51bWVyb19tZW1icmVcIiwgXCJjb250cmF0XCIsXG4gICAgXCJjb250cmFjdFwiLCBcIm4gY29udHJhdFwiLCBcIm5jb250cmF0XCIsIFwicmVmZXJlbmNlX2FkaGVyZW50XCIsIFwibnVtZXJvX2NhcnRlXCIsIFwibnVtX2NhcnRlXCIsXG4gICAgXCJpZF9jb250cmF0XCIsIFwicmVmX2NvbnRyYXRcIiwgXCJudW1lcm9fYWRoZXJlbnRcIiwgXCJuX2FkaGVyZW50XCIsIFwibm9fYWRoZXJlbnRcIixcbiAgICBcInN1YnNjcmliZXJfaWRcIiwgXCJtZW1iZXJfaWRcIiwgXCJtZW1iZXJfbnVtYmVyXCIsIFwicG9saWN5X251bWJlclwiLCBcInBvbGljeW51bWJlclwiLFxuICAgIFwic3Vic2NyaWJlcklkXCIsIFwibWVtYmVySWRcIiwgXCJtZW1iZXJOdW1iZXJcIiwgXCJjb250cmFjdE51bWJlclwiLCBcIm51bWVyb0NvbnRyYXRcIixcbiAgICAvKiB2YXJpYXRpb25zIHBvcnRhaWxzICovXG4gICAgXCJudW1fYmVuZWZpY2lhaXJlXCIsIFwiaWRfYmVuZWZpY2lhaXJlXCIsIFwicmVmX2JlbmVmaWNpYWlyZVwiLFxuICAgIFwibnVtZXJvX2JlbmVmaWNpYWlyZVwiLCBcIm5fYmVuZWZpY2lhaXJlXCIsIFwibm9fYmVuZWZpY2lhaXJlXCIsXG4gICAgXCJpZGVudGlmaWFudF9hZGhlcmVudFwiLCBcImlkX2Fzc3VyXHUwMEU5XCIsIFwibnVtX2Fzc3VyXHUwMEU5XCIsIFwibnVtZXJvX2Fzc3VyXHUwMEU5XCIsXG4gICAgXCJjYXJ0ZV9hZGhlcmVudFwiLCBcIm51bV9jYXJ0ZV9hZGhlcmVudFwiLCBcImNhcnRlX211dHVlbGxlXCIsXG4gICAgXCJhZGhlcmVudF9udW1iZXJcIiwgXCJhZGhlcmVudF9pZFwiLCBcImFkaGVyZW50X3JlZlwiLFxuICAgIC8qIEFsbWVyeXMgUk9DICovXG4gICAgXCJudW1BZGhlcmVudFwiLCBcImlkQWRoZXJlbnRcIiwgXCJyZWZBZGhlcmVudFwiLCBcImJlbmVmaWNpYWlyZU51bWVyb1wiLFxuICAgIC8qIFdlbWluZCB2MyAqL1xuICAgIFwibWVtYmVyc2hpcE51bWJlclwiLCBcImVucm9sbG1lbnRJZFwiLCBcInZtLWFkaGVyZW50XCIsXG4gICAgLyogVmlhbWVkaXMgKi9cbiAgICBcIm51bUJlbmVmaWNpYWlyZVwiLCBcInZtLWJlbmVmaWNpYWlyZVwiLFxuICAgIC8qIEVSUCAqL1xuICAgIFwidHh0TnVtQWRoZXJlbnRcIiwgXCJmbGRfYWRoZXJlbnRcIiwgXCJpbnB1dF9hZGhlcmVudFwiLFxuICAgIC8qIGRhdGEtdGVzdGlkICovXG4gICAgXCJhZGhlcmVudC1udW1iZXJcIiwgXCJtZW1iZXItaWRcIiwgXCJzdWJzY3JpYmVyLWlkXCIsIFwiYmVuZWZpY2lhcnktaWRcIixcbiAgXSxcbiAgbnVtZXJvVGVsZXRyYW5zbWlzc2lvbjogW1xuICAgIC8qIHN0YW5kYXJkICovXG4gICAgXCJudW1lcm90ZWxldHJhbnNtaXNzaW9uXCIsIFwibnVtX3RlbGV0cmFuc21pc3Npb25cIiwgXCJ0ZWxldHJhbnNtaXNzaW9uXCIsIFwibnVtX3RwXCIsIFwibnVtZXJvX3RwXCIsXG4gICAgXCJyZWZfdHBcIiwgXCJjb2RlX3RlbGV0cmFuc21pc3Npb25cIiwgXCJ0ZWxldHJhbnNcIiwgXCJudW1fdGVsZXRyYW5zXCIsXG4gICAgLyogdmFyaWF0aW9ucyBwb3J0YWlscyAqL1xuICAgIFwibm9fdHBcIiwgXCJuX3RwXCIsIFwicmVmZXJlbmNlX3RwXCIsIFwiaWRfdHBcIiwgXCJudW1fdGVsZXRwXCIsXG4gICAgXCJ0ZWxldHJhbnNtaXNzaW9uX251bWJlclwiLCBcInRwX3JlZmVyZW5jZVwiLCBcInRwX251bVwiLFxuICAgIFwibnVtZXJvX2VtaXNzaW9uXCIsIFwibnVtX2VtaXNzaW9uXCIsIFwiY29kZV9kZXN0aW5hdGFpcmVcIixcbiAgICBcIm51bV9kZXN0aW5hdGFpcmVcIiwgXCJkZXN0aW5hdGFpcmVfdHBcIiwgXCJudW1fcm91dGFnZVwiLFxuICAgIFwiY29kZV9yb3V0YWdlXCIsIFwicm91dGFnZVwiLCBcIm5fZW1pc3Npb25cIixcbiAgICAvKiBBbG1lcnlzICovXG4gICAgXCJudW1UUFwiLCBcInJlZlRQXCIsIFwibnVtVGVsZXRyYW5zbWlzc2lvblwiLFxuICAgIC8qIFZpYW1lZGlzICovXG4gICAgXCJudW1lcm9EZXN0aW5hdGFpcmVcIiwgXCJjb2RlRGVzdGluYXRhaXJlXCIsXG4gICAgLyogY2FtZWxDYXNlICovXG4gICAgXCJudW1lcm9UZWxldHJhbnNtaXNzaW9uXCIsIFwibnVtVGVsZXRyYW5zXCIsIFwicmVmVGVsZXRyYW5zXCIsXG4gICAgLyogRVJQICovXG4gICAgXCJ0eHROdW1UUFwiLCBcImZsZF9udW1fdHBcIiwgXCJpbnB1dF90cFwiLFxuICAgIC8qIGRhdGEtdGVzdGlkICovXG4gICAgXCJ0ZWxldHJhbnNtaXNzaW9uLW51bWJlclwiLCBcInRwLW51bWJlclwiLCBcInRwLXJlZlwiLFxuICBdLFxuICB0eXBlQ29udjogW1xuICAgIC8qIHN0YW5kYXJkICovXG4gICAgXCJ0eXBlY29udlwiLCBcInR5cGVfY29udlwiLCBcInR5cGVfY29udmVudGlvblwiLCBcImNvbnZlbnRpb25cIiwgXCJyZWdpbWVcIiwgXCJ0eXBlX3JlZ2ltZVwiLFxuICAgIFwiY29kZV9jb252ZW50aW9uXCIsIFwiY29kZWNvbnZlbnRpb25cIiwgXCJyZWdpbWVUeXBlXCIsXG4gICAgLyogdmFyaWF0aW9ucyBwb3J0YWlscyAqL1xuICAgIFwibmF0dXJlX2NvbnZlbnRpb25cIiwgXCJjb2RlQ29udmVudGlvblwiLCBcInR5cGVfcHJpc2VfZW5fY2hhcmdlXCIsXG4gICAgXCJtb2RlX3JlbWJvdXJzZW1lbnRcIiwgXCJ0eXBlX3JvY1wiLCBcInR5cGVfdHBcIiwgXCJ0eXBlX3RpZXJzX3BheWFudFwiLFxuICAgIFwiY29kZV9yZWdpbWVcIiwgXCJyZWdpbWVfY29kZVwiLCBcInJlZ2ltZV9vYmxpZ2F0b2lyZVwiLCBcInJvXCIsXG4gICAgXCJjb252ZW50aW9uX2NvZGVcIiwgXCJjb2RlX2NvbnZcIiwgXCJuYXR1cmVfcGVjXCIsIFwidHlwZV9jb3V2ZXJ0dXJlXCIsXG4gICAgXCJtb2RhbGl0eVwiLCBcImNvbnZlbnRpb25fdHlwZVwiLCBcInJlZ2ltZV9hc3N1cmFuY2VcIixcbiAgICAvKiBBbG1lcnlzIFJPQyAqL1xuICAgIFwidHlwZUNvbnZlbnRpb25cIiwgXCJtb2RlR2VzdGlvblwiLCBcIm5hdHVyZVBFQ1wiLFxuICAgIC8qIFdlbWluZCB2MyAqL1xuICAgIFwiY292ZXJhZ2VUeXBlXCIsIFwicGxhblR5cGVcIiwgXCJiZW5lZml0VHlwZVwiLFxuICAgIC8qIGNhbWVsQ2FzZSAqL1xuICAgIFwidHlwZUNvbnZcIiwgXCJjb2RlQ29udlwiLCBcInJlZ2ltZVR5cGVcIiwgXCJjb252ZW50aW9uVHlwZVwiLFxuICAgIC8qIGRhdGEtdGVzdGlkICovXG4gICAgXCJjb252ZW50aW9uLXR5cGVcIiwgXCJyZWdpbWUtdHlwZVwiLCBcImNvdmVyYWdlLXR5cGVcIixcbiAgXSxcbiAgZGF0ZURlYnV0VmFsaWRpdGU6IFtcbiAgICBcImRhdGVkZWJ1dHZhbGlkaXRlXCIsIFwiZGVidXRfdmFsaWRpdGVcIiwgXCJkYXRlX2RlYnV0XCIsIFwidmFsaWRpdGVfZGVidXRcIiwgXCJkYXRlX2RlYnV0X3ZhbGlkaXRlXCIsXG4gICAgXCJzdGFydF9kYXRlXCIsIFwic3RhcnRkYXRlXCIsIFwidmFsaWRfZnJvbVwiLCBcInZhbGlkZnJvbVwiLCBcImVmZmVjdGl2ZV9kYXRlXCIsXG4gICAgXCJkYXRlRGVidXRcIiwgXCJkZWJ1dFZhbGlkaXRlXCIsIFwiZGF0ZUVmZmV0XCIsXG4gIF0sXG4gIGRhdGVGaW5WYWxpZGl0ZTogW1xuICAgIFwiZGF0ZWZpbnZhbGlkaXRlXCIsIFwiZmluX3ZhbGlkaXRlXCIsIFwiZGF0ZV9maW5cIiwgXCJ2YWxpZGl0ZV9maW5cIiwgXCJkYXRlX2Zpbl92YWxpZGl0ZVwiLFxuICAgIFwiZGF0ZV9leHBpcmF0aW9uXCIsIFwiZXhwaXJhdGlvblwiLCBcImVuZF9kYXRlXCIsIFwiZW5kZGF0ZVwiLCBcInZhbGlkX3VudGlsXCIsIFwidmFsaWR1bnRpbFwiLFxuICAgIFwiZXhwaXJ5X2RhdGVcIiwgXCJleHBpcnlkYXRlXCIsIFwiZGF0ZUZpblwiLCBcImZpblZhbGlkaXRlXCIsIFwiZGF0ZUV4cGlyYXRpb25cIixcbiAgXSxcblxuICAvKiBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcbiAgICogIFBBVElFTlQgLyBCRU5FRklDSUFJUkUgXHUyMDE0IElERU5USVRFXG4gICAqIFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MCAqL1xuICBub206IFtcbiAgICAvKiBmcmFuXHUwMEU3YWlzICovXG4gICAgXCJub21cIiwgXCJub21fcGF0aWVudFwiLCBcInBhdGllbnRfbm9tXCIsIFwibm9tX2NsaWVudFwiLCBcImNsaWVudF9ub21cIiwgXCJub21fYmVuZWZpY2lhaXJlXCIsXG4gICAgXCJiZW5lZmljaWFpcmVfbm9tXCIsIFwibm9tX2Fzc3VyZVwiLCBcImFzc3VyZV9ub21cIiwgXCJub21fcG9ydGV1clwiLCBcIm5vbV91c2FnZVwiLFxuICAgIFwibm9tX25haXNzYW5jZVwiLCBcIm5vbV9qZXVuZV9maWxsZVwiLCBcInBhdHJvbnltZVwiLCBcIm5vbV9wZXJzXCIsIFwibm9tX3RpdHVsYWlyZVwiLFxuICAgIFwiYWRoZXJlbnRfbm9tXCIsIFwiaW5mb3NfY2xpZW50X25vbVwiLCBcIm5vbSBkZSBmYW1pbGxlXCIsIFwibm9tIGJlbmVmaWNpYWlyZVwiLCBcIm5vbSBhc3N1cmVcIixcbiAgICBcIm5vbWFzc3VyZWVcIiwgXCJpZGVudGl0ZV9ub21cIiwgXCJiZW5fbm9tXCIsIFwibm9tX2JlblwiLFxuICAgIC8qIGFuZ2xhaXMgKi9cbiAgICBcImxhc3RuYW1lXCIsIFwibGFzdF9uYW1lXCIsIFwic3VybmFtZVwiLCBcImZhbWlseV9uYW1lXCIsIFwiZmFtaWx5bmFtZVwiLCBcImxhc3QtbmFtZVwiLCBcImZhbWlseS1uYW1lXCIsXG4gICAgLyogY2FtZWxDYXNlIC8gZnJhbWV3b3JrcyAqL1xuICAgIFwibm9tUGF0aWVudFwiLCBcIm5vbUNsaWVudFwiLCBcIm5vbUJlbmVmaWNpYWlyZVwiLCBcIm5vbUFzc3VyZVwiLCBcIm5vbVBvcnRldXJcIiwgXCJub21Vc2FnZVwiLFxuICAgIFwibGFzdE5hbWVcIiwgXCJmYW1pbHlOYW1lXCIsIFwicGF0aWVudExhc3ROYW1lXCIsIFwiY3VzdG9tZXJMYXN0TmFtZVwiLCBcImNsaWVudExhc3ROYW1lXCIsXG4gICAgXCJiZW5lZmljaWFyeUxhc3ROYW1lXCIsIFwiUGF0aWVudFN1cm5hbWVcIiwgXCJTdXJuYW1lXCIsXG4gICAgLyogRVJQIHNwZWNpZmlxdWVzICovXG4gICAgXCJ0eHROb21cIiwgXCJ0eHROb21QYXRpZW50XCIsIFwiY3RsX25vbVwiLCBcImN0bDAwX25vbVwiLCBcInRiTm9tXCIsIFwiZmxkX25vbVwiLFxuICAgIFwiaW5wdXRfbm9tXCIsIFwiY2hhbXBfbm9tXCIsIFwiZmllbGRfbm9tXCIsIFwid29fbm9tXCIsIFwiYXJjaF9ub21cIiwgXCJmaWNoZV9ub21cIixcbiAgICAvKiBDb3NpdW0gLyBpR2VzdGlvbiAqL1xuICAgIFwiZmljaGVfcGF0aWVudF9ub21cIiwgXCJwYXRfbm9tXCIsIFwicGF0aWVudF9sYXN0X25hbWVcIixcbiAgICAvKiBXZW1pbmQgdjMgKi9cbiAgICBcInBhdGllbnRCaXJ0aE5hbWVcIiwgXCJwYXRpZW50X2JpcnRoX25hbWVcIiwgXCJ2bS1ub21cIixcbiAgICAvKiBkYXRhLXRlc3RpZCBSZWFjdC9OZXh0ICovXG4gICAgXCJwYXRpZW50LWxhc3RuYW1lXCIsIFwicGF0aWVudC1uYW1lXCIsIFwiYmVuZWZpY2lhcnktbGFzdG5hbWVcIixcbiAgICAvKiBkYXRhIGF0dHJpYnV0ZXMgKi9cbiAgICBcImlucHV0LWxhc3RuYW1lXCIsIFwiaW5wdXQtbGFzdC1uYW1lXCIsIFwiaW5wdXQtbm9tXCIsXG4gIF0sXG4gIHByZW5vbTogW1xuICAgIC8qIGZyYW5cdTAwRTdhaXMgKi9cbiAgICBcInByZW5vbVwiLCBcInByZW5vbV9wYXRpZW50XCIsIFwicGF0aWVudF9wcmVub21cIiwgXCJwcmVub21fY2xpZW50XCIsIFwiY2xpZW50X3ByZW5vbVwiLFxuICAgIFwicHJlbm9tX2JlbmVmaWNpYWlyZVwiLCBcImJlbmVmaWNpYWlyZV9wcmVub21cIiwgXCJwcmVub21fYXNzdXJlXCIsIFwicHJlbm9tX3BvcnRldXJcIixcbiAgICBcInByZW5vbV91c2FnZVwiLCBcInByZW5vbV9wZXJzXCIsIFwicHJlbm9tX3RpdHVsYWlyZVwiLCBcImFkaGVyZW50X3ByZW5vbVwiLFxuICAgIFwiaW5mb3NfY2xpZW50X3ByZW5vbVwiLCBcInByZW5vbSBiZW5lZmljaWFpcmVcIiwgXCJwcmVub20gYXNzdXJlXCIsIFwicHJlbm9tYXNzdXJlZVwiLFxuICAgIFwiYmVuX3ByZW5vbVwiLCBcInByZW5vbV9iZW5cIixcbiAgICAvKiBhbmdsYWlzICovXG4gICAgXCJmaXJzdG5hbWVcIiwgXCJmaXJzdF9uYW1lXCIsIFwiZ2l2ZW5fbmFtZVwiLCBcImdpdmVubmFtZVwiLCBcImZvcmVuYW1lXCIsIFwiZmlyc3QtbmFtZVwiLCBcImdpdmVuLW5hbWVcIixcbiAgICAvKiBjYW1lbENhc2UgLyBmcmFtZXdvcmtzICovXG4gICAgXCJwcmVub21QYXRpZW50XCIsIFwicHJlbm9tQ2xpZW50XCIsIFwicHJlbm9tQmVuZWZpY2lhaXJlXCIsIFwicHJlbm9tQXNzdXJlXCIsIFwicHJlbm9tUG9ydGV1clwiLFxuICAgIFwiZmlyc3ROYW1lXCIsIFwiZ2l2ZW5OYW1lXCIsIFwicGF0aWVudEZpcnN0TmFtZVwiLCBcImN1c3RvbWVyRmlyc3ROYW1lXCIsIFwiY2xpZW50Rmlyc3ROYW1lXCIsXG4gICAgXCJiZW5lZmljaWFyeUZpcnN0TmFtZVwiLCBcIlBhdGllbnRGb3JlbmFtZVwiLCBcIkZvcmVuYW1lXCIsIFwiR2l2ZW5OYW1lXCIsXG4gICAgLyogRVJQIHNwZWNpZmlxdWVzICovXG4gICAgXCJ0eHRQcmVub21cIiwgXCJ0eHRQcmVub21QYXRpZW50XCIsIFwiY3RsX3ByZW5vbVwiLCBcImN0bDAwX3ByZW5vbVwiLCBcInRiUHJlbm9tXCIsIFwiZmxkX3ByZW5vbVwiLFxuICAgIFwiaW5wdXRfcHJlbm9tXCIsIFwiY2hhbXBfcHJlbm9tXCIsIFwiZmllbGRfcHJlbm9tXCIsIFwid29fcHJlbm9tXCIsIFwiYXJjaF9wcmVub21cIiwgXCJmaWNoZV9wcmVub21cIixcbiAgICAvKiBDb3NpdW0gLyBpR2VzdGlvbiAqL1xuICAgIFwiZmljaGVfcGF0aWVudF9wcmVub21cIiwgXCJwYXRfcHJlbm9tXCIsIFwicGF0aWVudF9maXJzdF9uYW1lXCIsXG4gICAgLyogV2VtaW5kIHYzICovXG4gICAgXCJ2bS1wcmVub21cIixcbiAgICAvKiBkYXRhLXRlc3RpZCBSZWFjdC9OZXh0ICovXG4gICAgXCJwYXRpZW50LWZpcnN0bmFtZVwiLCBcInBhdGllbnQtZ2l2ZW4tbmFtZVwiLCBcImJlbmVmaWNpYXJ5LWZpcnN0bmFtZVwiLFxuICAgIC8qIGRhdGEgYXR0cmlidXRlcyAqL1xuICAgIFwiaW5wdXQtZmlyc3RuYW1lXCIsIFwiaW5wdXQtZmlyc3QtbmFtZVwiLCBcImlucHV0LXByZW5vbVwiLFxuICBdLFxuICBudW1lcm9TZWN1cml0ZVNvY2lhbGU6IFtcbiAgICAvKiBmcmFuXHUwMEU3YWlzIHN0YW5kYXJkICovXG4gICAgXCJudW1lcm9zZWN1cml0ZXNvY2lhbGVcIiwgXCJuc3NcIiwgXCJudW1fc3NcIiwgXCJudW1zc1wiLCBcInNlY3VyaXRlX3NvY2lhbGVcIiwgXCJudW1lcm9fc2VjdVwiLFxuICAgIFwibnVtX3NlY3VcIiwgXCJpbW1hdHJpY3VsYXRpb25cIiwgXCJuaXJwcFwiLCBcInNlY3VcIiwgXCJtYXRyaWN1bGVcIiwgXCJudW1zZWN1cml0ZVwiLFxuICAgIFwibnVtZXJvX3NlY3VyaXRlX3NvY2lhbGVcIiwgXCJudW1lcm8gZGUgc2VjdXJpdGUgc29jaWFsZVwiLCBcIm4gc2VjdXJpdGUgc29jaWFsZVwiLFxuICAgIFwibm8gc2VjdXJpdGUgc29jaWFsZVwiLCBcIm51bWVyb19pbW1hdHJpY3VsYXRpb25cIiwgXCJpbW1hdHJpY3VsYXRpb25fYXNzdXJlXCIsXG4gICAgXCJudW1lcm9fbWF0cmljdWxlXCIsIFwibWF0cmljdWxlX2Fzc3VyZVwiLCBcIm5pclwiLCBcIm51bWVyb19uaXJcIiwgXCJuaXJfYXNzdXJlXCIsXG4gICAgXCJudW1faW1tYXRcIiwgXCJpbW1hdFwiLCBcIm51bV9uaXJcIiwgXCJuaXJfY29tcGxldFwiLCBcIm5pcl9iZW5lZmljaWFpcmVcIiwgXCJuaXJfYmVuXCIsXG4gICAgXCJpbW1hdF9iZW5lZmljaWFpcmVcIiwgXCJjbGVfbnNzXCIsIFwibnNzX2NsZVwiLCBcIm5pcnBwX2NsZVwiLCBcImJlbmVmaWNpYWlyZV9ubmlcIiwgXCJubmlcIixcbiAgICBcIm51bWJlbmVmXCIsIFwibnVtX2JlbmVmXCIsIFwibnVtaW5zZWVcIiwgXCJudW1faW5zZWVcIiwgXCJpbnNlZVwiLFxuICAgIC8qIGFuZ2xhaXMgKi9cbiAgICBcInNzblwiLCBcInNvY2lhbF9zZWN1cml0eVwiLCBcInNvY2lhbF9zZWN1cml0eV9udW1iZXJcIiwgXCJzb2NpYWxzZWN1cml0eW51bWJlclwiLFxuICAgIFwibmF0aW9uYWxfaWRcIiwgXCJuYXRpb25hbF9pbnN1cmFuY2VcIiwgXCJpbnN1cmFuY2VfbnVtYmVyXCIsXG4gICAgLyogY2FtZWxDYXNlIC8gZnJhbWV3b3JrcyAqL1xuICAgIFwibnVtZXJvU2VjdXJpdGVTb2NpYWxlXCIsIFwibnVtU1NcIiwgXCJudW1TZWN1XCIsIFwibnVtSW5zZWVcIiwgXCJzZWN1cml0ZVNvY2lhbGVcIixcbiAgICBcIm5pckFzc3VyZVwiLCBcIm51bUFzc3VyZVwiLCBcIm5pckJlbmVmaWNpYWlyZVwiLCBcInNvY2lhbFNlY3VyaXR5TnVtYmVyXCIsXG4gICAgXCJQYXRpZW50TklSXCIsIFwiTklSXCIsIFwiU29jaWFsU2VjdXJpdHlOb1wiLCBcIlNTTlwiLCBcIkluc3VyYW5jZU5vXCIsXG4gICAgLyogRVJQIHNwZWNpZmlxdWVzICovXG4gICAgXCJ0eHROU1NcIiwgXCJ0eHROdW1TU1wiLCBcImN0bF9uc3NcIiwgXCJ0eHRJbW1hdFwiLCBcInRiTlNTXCIsIFwiZmxkX25zc1wiLFxuICAgIFwiaW5wdXRfbnNzXCIsIFwiY2hhbXBfbnNzXCIsIFwid29fbnNzXCIsIFwiYXJjaF9uc3NcIixcbiAgICAvKiBkYXRhIC8gcGxhY2Vob2xkZXIgcGF0dGVybnMgKi9cbiAgICBcImlucHV0LXNzblwiLCBcImlucHV0LW5zc1wiLCBcIm51bWVybyBzZWN1XCIsIFwibnVtZXJvIHNzXCIsIFwibiBkZSBzZWN1XCIsXG4gICAgLyogQWxtZXJ5cyBST0Mgbm91dmVhdSBwb3J0YWlsICovXG4gICAgXCJiZW5lZmljaWFpcmVObmlcIiwgXCJuaXJDb21wbGV0XCIsIFwicmFuZ05haXNzYW5jZVwiLCBcImNvZGVDYWlzc2VcIiwgXCJuaXJfcmFuZ1wiLFxuICAgIC8qIFdlbWluZCB2MyAqL1xuICAgIFwic3Vic2NyaWJlck5JUlwiLCBcImluc3VyZWRJZFwiLCBcImluc3VyZWRfaWRcIiwgXCJiZW5lZmljaWFyeV9uaXJcIixcbiAgICAvKiBWaWFtZWRpcyBBbmd1bGFyIChwcmVmaXhlIHZtLSkgKi9cbiAgICBcInZtLW5pclwiLCBcInZtLW5zc1wiLCBcInZtLXNlY3VcIixcbiAgICAvKiBkYXRhLXRlc3RpZCBwYXR0ZXJucyBSZWFjdC9OZXh0ICovXG4gICAgXCJwYXRpZW50LW5zc1wiLCBcImJlbmVmaWNpYXJ5LW5pclwiLCBcImluc3VyZWQtbmlyXCIsIFwibmlyLWlucHV0XCIsXG4gIF0sXG4gIGRhdGVOYWlzc2FuY2U6IFtcbiAgICAvKiBmcmFuXHUwMEU3YWlzICovXG4gICAgXCJkYXRlbmFpc3NhbmNlXCIsIFwiZGF0ZV9uYWlzc2FuY2VcIiwgXCJuYWlzc2FuY2VcIiwgXCJkZG5cIiwgXCJkYXRlX2RlX25haXNzYW5jZVwiLFxuICAgIFwiZGF0ZWRlbmFpc3NhbmNlXCIsIFwibmVfbGVcIiwgXCJuZWVfbGVcIiwgXCJuZWxlXCIsIFwibmVlbGVcIiwgXCJkYXRlX25haXNcIiwgXCJkYXRlbmFpc1wiLFxuICAgIFwiZGF0ZSBkZSBuYWlzc2FuY2VcIiwgXCJuYWlzc2FuY2UgYmVuZWZpY2lhaXJlXCIsIFwiZGF0ZSBuYWlzc2FuY2UgYmVuZWZpY2lhaXJlXCIsXG4gICAgXCJkYXRlbm5haXNzYW5jZWFzc3VyZVwiLCBcImRhdGVubmFpc3NhbmNlYXNzdXJlZVwiLCBcIm5haXNzYW5jZWFzc3VyZVwiLFxuICAgIFwiZGF0ZW5uYWlzc2FuY2ViZW5lZlwiLCBcImRhdGUgZGUgbmFpc3NhbmNlIGJlbmVmaWNpYWlyZVwiLCBcImR0X25haXNzXCIsIFwiZGF0ZV9uYWlzc1wiLFxuICAgIFwiZGRuX3BhdGllbnRcIiwgXCJkZG5fYmVuZWZpY2lhaXJlXCIsIFwiZGRuX2Fzc3VyZVwiLFxuICAgIC8qIGFuZ2xhaXMgKi9cbiAgICBcImJpcnRoZGF0ZVwiLCBcImJpcnRoX2RhdGVcIiwgXCJkYXRlb2ZiaXJ0aFwiLCBcImRhdGVfb2ZfYmlydGhcIiwgXCJiaXJ0aGRheVwiLCBcImRvYlwiLFxuICAgIFwiZGF0ZWJpcnRoXCIsIFwiYm9ybmRhdGVcIiwgXCJib3JuX2RhdGVcIiwgXCJiaXJ0aF9kYXlcIixcbiAgICAvKiBjYW1lbENhc2UgLyBmcmFtZXdvcmtzICovXG4gICAgXCJkYXRlTmFpc3NhbmNlXCIsIFwiZGF0ZU5haXNzYW5jZVBhdGllbnRcIiwgXCJkYXRlTmFpc3NhbmNlQmVuZWZpY2lhaXJlXCIsXG4gICAgXCJkYXRlTmFpc3NhbmNlQXNzdXJlXCIsIFwiZGF0ZU9mQmlydGhcIiwgXCJiaXJ0aERhdGVcIiwgXCJwYXRpZW50RE9CXCIsIFwiRE9CXCIsXG4gICAgXCJQYXRpZW50RE9CXCIsIFwiQmlydGhEYXRlXCIsIFwiY3VzdG9tZXJCaXJ0aERhdGVcIiwgXCJjbGllbnRCaXJ0aERhdGVcIixcbiAgICAvKiBFUlAgc3BlY2lmaXF1ZXMgKi9cbiAgICBcInR4dERhdGVOYWlzc2FuY2VcIiwgXCJjdGxfZGF0ZU5haXNzXCIsIFwidHh0REROXCIsIFwidGJEYXRlTmFpc3NcIiwgXCJmbGRfZGF0ZV9uYWlzc1wiLFxuICAgIFwiaW5wdXRfZGF0ZW5haXNzYW5jZVwiLCBcIndvX2RkblwiLCBcImFyY2hfZGRuXCIsXG4gICAgLyogQWxtZXJ5cyBST0MgKi9cbiAgICBcInJhbmdOYWlzc2FuY2VBc3N1cmVcIiwgXCJkYXRlTmFpc3NhbmNlQXNzdXJlXCIsIFwiZGRuX2Fzc3VyXHUwMEU5XCIsXG4gICAgLyogV2VtaW5kIHYzICovXG4gICAgXCJwYXRpZW50RG9iXCIsIFwicGF0aWVudF9kb2JcIiwgXCJ2bS1kYXRlbmFpc3NhbmNlXCIsXG4gICAgLyogQ29zaXVtIC8gaUdlc3Rpb24gKi9cbiAgICBcImZpY2hlX3BhdGllbnRfZGRuXCIsIFwicGF0X2RkblwiLFxuICAgIC8qIGRhdGEtdGVzdGlkIFJlYWN0L05leHQgKi9cbiAgICBcInBhdGllbnQtZG9iXCIsIFwicGF0aWVudC1iaXJ0aGRhdGVcIiwgXCJiZW5lZmljaWFyeS1kb2JcIixcbiAgICAvKiBkYXRhIGF0dHJpYnV0ZXMgKi9cbiAgICBcImlucHV0LWRvYlwiLCBcImlucHV0LWJpcnRoZGF0ZVwiLCBcImlucHV0LWRhdGVuYWlzc2FuY2VcIixcbiAgXSxcblxuICAvKiBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcbiAgICogIENPTlRBQ1QgUEFUSUVOVFxuICAgKiBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTAgKi9cbiAgdGVsZXBob25lOiBbXG4gICAgXCJ0ZWxlcGhvbmVcIiwgXCJ0ZWxcIiwgXCJwaG9uZVwiLCBcIm1vYmlsZVwiLCBcInBvcnRhYmxlXCIsIFwiZ3NtXCIsIFwiY2VsbHBob25lXCIsXG4gICAgXCJudW1fdGVsXCIsIFwibnVtZXJvX3RlbGVwaG9uZVwiLCBcInRlbF9wb3J0YWJsZVwiLCBcInRlbF9tb2JpbGVcIiwgXCJ0ZWxfZml4ZVwiLFxuICAgIFwidGVsX2RvbWljaWxlXCIsIFwidGVsX3Byb1wiLCBcInRlbGVwaG9uZV9kb21pY2lsZVwiLCBcInRlbGVwaG9uZV9wb3J0YWJsZVwiLFxuICAgIFwidGVsZXBob25lX21vYmlsZVwiLCBcImNvbnRhY3RfdGVsXCIsIFwiaW5mb3NfY2xpZW50X3RlbGVwaG9uZVwiLCBcImNvb3Jkb25uZWVzX3RlbFwiLFxuICAgIFwidGVsX2NvbnRhY3RcIiwgXCJ0ZWwxXCIsIFwidGVsZXBob25lMVwiLCBcInBob25lMVwiLCBcIm51bXRlbFwiLFxuICAgIFwicGhvbmVfbnVtYmVyXCIsIFwicGhvbmVudW1iZXJcIiwgXCJtb2JpbGVfcGhvbmVcIiwgXCJjZWxsX3Bob25lXCIsIFwiaG9tZV9waG9uZVwiLFxuICAgIFwicGhvbmVOdW1iZXJcIiwgXCJtb2JpbGVQaG9uZVwiLCBcImNlbGxQaG9uZVwiLCBcImhvbWVQaG9uZVwiLCBcImNvbnRhY3RQaG9uZVwiLFxuICAgIFwiUGF0aWVudFBob25lXCIsIFwiTW9iaWxlUGhvbmVcIiwgXCJIb21lUGhvbmVcIiwgXCJQaG9uZU5vXCIsXG4gICAgXCJ0eHRUZWxcIiwgXCJ0eHRUZWxlcGhvbmVcIiwgXCJjdGxfdGVsXCIsIFwidGJUZWxNb2JpbGVcIiwgXCJmbGRfdGVsXCIsXG4gICAgXCJpbnB1dF90ZWxlcGhvbmVcIiwgXCJjaGFtcF90ZWxcIiwgXCJ3b190ZWxcIixcbiAgICBcImlucHV0LXBob25lXCIsIFwiaW5wdXQtdGVsXCIsIFwiaW5wdXQtbW9iaWxlXCIsXG4gIF0sXG4gIGVtYWlsOiBbXG4gICAgXCJlbWFpbFwiLCBcIm1haWxcIiwgXCJjb3VycmllbFwiLCBcImFkcmVzc2VfZW1haWxcIiwgXCJhZHJlc3NlX21haWxcIiwgXCJlLW1haWxcIixcbiAgICBcImNvbnRhY3RfZW1haWxcIiwgXCJlbWFpbGFkZHJlc3NcIiwgXCJlbWFpbF9hZGRyZXNzXCIsIFwiYWRyZXNzZW1haWxcIiwgXCJhZHJlc3NlIGUtbWFpbFwiLFxuICAgIFwiYWRyZXNzZV9lX21haWxcIiwgXCJlbWFpbF9wYXRpZW50XCIsIFwibWFpbF9wYXRpZW50XCIsIFwiZV9tYWlsXCIsXG4gICAgXCJlbWFpbEFkZHJlc3NcIiwgXCJQYXRpZW50RW1haWxcIiwgXCJFbWFpbEFkZHJlc3NcIixcbiAgICBcInR4dEVtYWlsXCIsIFwidHh0TWFpbFwiLCBcImN0bF9lbWFpbFwiLCBcInRiRW1haWxcIiwgXCJmbGRfZW1haWxcIixcbiAgICBcImlucHV0X2VtYWlsXCIsIFwiY2hhbXBfZW1haWxcIixcbiAgICBcImlucHV0LWVtYWlsXCIsIFwiaW5wdXQtbWFpbFwiLFxuICBdLFxuICBhZHJlc3NlOiBbXG4gICAgXCJhZHJlc3NlXCIsIFwiYWRkcmVzc1wiLCBcInJ1ZVwiLCBcInZvaWVcIiwgXCJhZHJlc3NlX3Bvc3RhbGVcIiwgXCJhZHJlc3NlcG9zdGFsZVwiLFxuICAgIFwibGlnbmVfMVwiLCBcImFkcmVzc2VfbGlnbmUxXCIsIFwiYWRyZXNzZTFcIiwgXCJhZHJlc3NlXzFcIiwgXCJudW1lcm9fcnVlXCIsXG4gICAgXCJzdHJlZXRcIiwgXCJzdHJlZXRfYWRkcmVzc1wiLCBcInN0cmVldGFkZHJlc3NcIiwgXCJhZGRyZXNzX2xpbmUxXCIsIFwiYWRkcmVzc19saW5lXzFcIixcbiAgICBcImxpZ25lMVwiLCBcImFkcmVzc2VsaWduZTFcIiwgXCJhZHJlc3NlX2RvbWljaWxlXCIsIFwibGlnbmVfYWRyZXNzZVwiLFxuICAgIFwidHh0QWRyZXNzZVwiLCBcImN0bF9hZHJlc3NlXCIsIFwiZmxkX2FkcmVzc2VcIiwgXCJhZHJcIixcbiAgICBcImlucHV0X2FkcmVzc2VcIiwgXCJjaGFtcF9hZHJlc3NlXCIsXG4gICAgXCJpbnB1dC1hZGRyZXNzXCIsIFwiaW5wdXQtYWRyZXNzZVwiLFxuICBdLFxuICBjb2RlUG9zdGFsOiBbXG4gICAgXCJjb2RlcG9zdGFsXCIsIFwiY29kZV9wb3N0YWxcIiwgXCJjcFwiLCBcInppcGNvZGVcIiwgXCJ6aXBfY29kZVwiLCBcInppcFwiLFxuICAgIFwicG9zdGFsX2NvZGVcIiwgXCJwb3N0YWxjb2RlXCIsIFwiY29kZSBwb3N0YWxcIiwgXCJjcF92aWxsZVwiLCBcImNkcG9zdGFsXCIsXG4gICAgXCJwb3N0Y29kZVwiLCBcInBvc3RfY29kZVwiLFxuICAgIFwidHh0Q1BcIiwgXCJjdGxfY3BcIiwgXCJmbGRfY3BcIixcbiAgICBcImlucHV0X2NwXCIsIFwiY2hhbXBfY3BcIixcbiAgICBcImlucHV0LXppcFwiLCBcImlucHV0LXppcGNvZGVcIiwgXCJpbnB1dC1jcFwiLFxuICBdLFxuICB2aWxsZTogW1xuICAgIFwidmlsbGVcIiwgXCJjaXR5XCIsIFwibG9jYWxpdGVcIiwgXCJjb21tdW5lXCIsIFwibXVuaWNpcGFsaXR5XCIsIFwidG93blwiLFxuICAgIFwibm9tX3ZpbGxlXCIsIFwidmlsbGVfY29tbXVuZVwiLCBcImNvbW11bmVfcmVzaWRlbmNlXCIsIFwibG9jYWxpdHlcIixcbiAgICBcInR4dFZpbGxlXCIsIFwiY3RsX3ZpbGxlXCIsIFwiZmxkX3ZpbGxlXCIsXG4gICAgXCJpbnB1dF92aWxsZVwiLCBcImNoYW1wX3ZpbGxlXCIsXG4gICAgXCJpbnB1dC1jaXR5XCIsIFwiaW5wdXQtdmlsbGVcIixcbiAgXSxcblxuICAvKiBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcbiAgICogIE9SRE9OTkFOQ0UgLyBQUkVTQ1JJUFRJT05cbiAgICogXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwICovXG4gIG5vbU9waHRhbG1vbG9ndWU6IFtcbiAgICBcIm5vbW9waHRhbG1vbG9ndWVcIiwgXCJub21fbWVkZWNpblwiLCBcIm1lZGVjaW5cIiwgXCJwcmVzY3JpcHRldXJcIiwgXCJub21fcHJlc2NyaXB0ZXVyXCIsXG4gICAgXCJkb2N0ZXVyXCIsIFwib3BodGFsbW9sb2d1ZVwiLCBcIm9waHRhbG1vXCIsIFwibm9tX2RvY3RldXJcIiwgXCJub21tZWRlY2luXCIsXG4gICAgXCJtZWRlY2luX3ByZXNjcmlwdGV1clwiLCBcIm5vbSBwcmVzY3JpcHRldXJcIiwgXCJkb2N0ZXVyIHByZXNjcmlwdGV1clwiLFxuICAgIFwibm9tX29waHRhbG1vXCIsIFwiZHJcIiwgXCJub21fZHJcIiwgXCJwcmVzY3JpYmVyXCIsIFwiZG9jdG9yXCIsXG4gICAgXCJQcmVzY3JpYmVyTmFtZVwiLCBcIlByYWN0aXRpb25lck5hbWVcIiwgXCJSZWZlcnJlZEJ5XCIsXG4gICAgXCJ0eHRQcmVzY3JpcHRldXJcIiwgXCJjdGxfcHJlc2NyaXB0ZXVyXCIsXG4gIF0sXG4gIHJwcHM6IFtcbiAgICAvKiBzdGFuZGFyZCAqL1xuICAgIFwicnBwc1wiLCBcIm51bV9ycHBzXCIsIFwibnVtZXJvX3JwcHNcIiwgXCJpZGVudGlmaWFudF9ycHBzXCIsIFwiY29kZV9ycHBzXCIsIFwibl9ycHBzXCIsXG4gICAgXCJpZF9wcmVzY3JpcHRldXJcIiwgXCJudW1ycHBzXCIsIFwiYWRlbGlcIiwgXCJudW1fYWRlbGlcIiwgXCJudW1lcm9fYWRlbGlcIixcbiAgICBcIm51bWFtXCIsIFwibnVtX2FtXCIsIFwibnVtZXJvX2FtXCIsIFwibnVtYW1wcmVzY3JpcHRldXJcIiwgXCJmaW5lc3NcIixcbiAgICBcIm51bV9wcmVzY3JpcHRldXJcIiwgXCJwcmVzY3JpYmVyX2lkXCIsXG4gICAgLyogdmFyaWF0aW9ucyBwb3J0YWlscyAqL1xuICAgIFwicnBwc19wcmVzY3JpcHRldXJcIiwgXCJub19ycHBzXCIsIFwibl9ycHBzX3ByZXNjcmlwdGV1clwiLCBcImNvZGVSUFBTXCIsXG4gICAgXCJycHBzX21lZGVjaW5cIiwgXCJycHBzX29waHRhbG1vbG9ndWVcIiwgXCJycHBzX29waHRhbG1vXCIsIFwicnBwc051bWJlclwiLFxuICAgIFwicnBwc19kclwiLCBcIm51bV9hbV9wcmVzY3JpcHRldXJcIiwgXCJpZF9hbVwiLCBcIm51bWVyb19hbV9tZWRlY2luXCIsXG4gICAgXCJudW1hbXByZXNjcmliZXVyXCIsIFwibnVtZXJvYWRlbGlcIiwgXCJpZGVudGlmaWFudF9hbVwiLFxuICAgIFwiaWRlbnRpZmlhbnRfcHJvZmVzc2lvbm5lbFwiLCBcImlkX3Byb2Zlc3Npb25uZWxcIiwgXCJudW1fcHJvZmVzc2lvbm5lbFwiLFxuICAgIFwibnVtX2ZpbmVzc1wiLCBcImZpbmVzc19wcmVzY3JpcHRldXJcIixcbiAgICAvKiBjYW1lbENhc2UgLyBmcmFtZXdvcmtzICovXG4gICAgXCJQcmVzY3JpYmVySWRcIiwgXCJQcmVzY3JpYmVyTm9cIiwgXCJSUFBTTm9cIiwgXCJQcmFjdGl0aW9uZXJJZFwiLFxuICAgIFwicHJlc2NyaXB0ZXVyUnBwc1wiLCBcIm1lZGVjaW5ScHBzXCIsIFwibnVtUlBQU1wiLCBcImNvZGVBbVwiLFxuICAgIC8qIEFsbWVyeXMgUk9DICovXG4gICAgXCJudW1QcmVzY3JpcHRldXJcIiwgXCJpZFByZXNjcmlwdGV1clwiLCBcImNvZGVQcmF0aWNpZW5cIixcbiAgICAvKiBFUlAgKi9cbiAgICBcInR4dFJQUFNcIiwgXCJjdGxfcnBwc1wiLCBcImZsZF9ycHBzXCIsIFwid29fcnBwc1wiLFxuICAgIC8qIGRhdGEtdGVzdGlkICovXG4gICAgXCJwcmVzY3JpYmVyLXJwcHNcIiwgXCJkb2N0b3ItcnBwc1wiLCBcInByZXNjcmliZXItaWRcIixcbiAgXSxcbiAgZGF0ZU9yZG9ubmFuY2U6IFtcbiAgICAvKiBzdGFuZGFyZCAqL1xuICAgIFwiZGF0ZW9yZG9ubmFuY2VcIiwgXCJkYXRlX29yZG9ubmFuY2VcIiwgXCJvcmRvbm5hbmNlX2RhdGVcIiwgXCJwcmVzY3JpcHRpb25fZGF0ZVwiLFxuICAgIFwiZGF0ZV9wcmVzY3JpcHRpb25cIiwgXCJkYXRlX29yZG9cIiwgXCJkYXRlb3Jkb1wiLCBcImRhdGUgb3Jkb25uYW5jZVwiLFxuICAgIFwiZGF0ZSBkZSBsJ29yZG9ubmFuY2VcIiwgXCJkYXRlIGRlIGxvcmRvbm5hbmNlXCIsIFwiZGF0ZSBwcmVzY3JpcHRpb25cIixcbiAgICBcImRhdGVvcmRvbm5hbmNlZWRpdFwiLCBcImR0X29yZG9ubmFuY2VcIiwgXCJkYXRlX3ByZXNjXCIsIFwiZGF0ZV9yeFwiLCBcInJ4X2RhdGVcIixcbiAgICAvKiB2YXJpYXRpb25zIHBvcnRhaWxzICovXG4gICAgXCJkYXRlX29yZG9fcGF0aWVudFwiLCBcImRhdGVvcmRvbm5hbmNlZGVwcmVzY3JpcHRpb25cIiwgXCJkYXRlX2VtaXNzaW9uXCIsXG4gICAgXCJkYXRlX2V0YWJsaXNzZW1lbnRcIiwgXCJkYXRlX3JlZGFjdGlvblwiLCBcImRhdGVwcmVzY3JpcHRpb25cIixcbiAgICBcImRhdGVfZXRhYmxpc3NlbWVudF9vcmRvbm5hbmNlXCIsIFwiZGF0ZWVtaXNzaW9ub3Jkb25uYW5jZVwiLFxuICAgIFwiZGF0ZV9kZV9wcmVzY3JpcHRpb25cIiwgXCJkYXRlX2RlX2xvcmRvbm5hbmNlXCIsXG4gICAgXCJvcmRvbm5hbmNlX2V0YWJsaWVfbGVcIiwgXCJvcmRvX2RhdGVcIiwgXCJkYXRlX3JcdTAwRTlkYWN0aW9uXCIsXG4gICAgLyogYW5nbGFpcyAqL1xuICAgIFwicHJlc2NyaXB0aW9uX2RhdGVcIiwgXCJwcmVzY3JpcHRpb25EYXRlXCIsIFwicnhfZGF0ZVwiLCBcIm9yZGVyX2RhdGVcIixcbiAgICBcImlzc3VlX2RhdGVcIiwgXCJpc3N1YW5jZV9kYXRlXCIsIFwic2NyaXB0X2RhdGVcIixcbiAgICAvKiBjYW1lbENhc2UgLyBmcmFtZXdvcmtzICovXG4gICAgXCJkYXRlT3Jkb25uYW5jZVwiLCBcImRhdGVQcmVzY3JpcHRpb25cIiwgXCJkYXRlUnhcIiwgXCJyeERhdGVcIixcbiAgICBcInByZXNjcmlwdGlvbkRhdGVcIiwgXCJvcmRlckRhdGVcIiwgXCJpc3N1ZWREYXRlXCIsXG4gICAgLyogQWxtZXJ5cyBST0MgLyBXZW1pbmQgKi9cbiAgICBcImRhdGVQcmVzY3JpcHRpb25PcmRvbm5hbmNlXCIsIFwiZGF0ZURlbGl2cmFuY2VcIiwgXCJkYXRlRW1pc3Npb25cIixcbiAgICAvKiBFUlAgKi9cbiAgICBcInR4dERhdGVPcmRvXCIsIFwiY3RsX2RhdGVPcmRvXCIsIFwiZmxkX2RhdGVfb3Jkb1wiLCBcIndvX2RhdGVvcmRvXCIsXG4gICAgLyogZGF0YS10ZXN0aWQgKi9cbiAgICBcInByZXNjcmlwdGlvbi1kYXRlXCIsIFwib3Jkb25uYW5jZS1kYXRlXCIsIFwicngtZGF0ZVwiLFxuICBdLFxuICBkYXRlVmFsaWRpdGU6IFtcbiAgICBcImRhdGV2YWxpZGl0ZVwiLCBcImRhdGVfdmFsaWRpdGVcIiwgXCJ2YWxpZGl0ZVwiLCBcInZhbGlkaXRlX29yZG9ubmFuY2VcIixcbiAgICBcImRhdGUgdmFsaWRpdGVcIiwgXCJkYXRlIGRlIHZhbGlkaXRlXCIsIFwiZXhwaXJ5XCIsIFwidmFsaWRpdHlfZGF0ZVwiLFxuICBdLFxuICBub21QYXRpZW50OiBbXG4gICAgXCJub21wYXRpZW50XCIsIFwibm9tX3BhdGllbnRcIiwgXCJwYXRpZW50X25vbVwiLCBcInBhdGllbnRfbmFtZVwiLCBcInBhdGllbnROYW1lXCIsXG4gICAgXCJwYXRpZW50X2xhc3RfbmFtZVwiLCBcInBhdGllbnRMYXN0TmFtZVwiLFxuICBdLFxuICBwcmVub21QYXRpZW50OiBbXG4gICAgXCJwcmVub21wYXRpZW50XCIsIFwicHJlbm9tX3BhdGllbnRcIiwgXCJwYXRpZW50X3ByZW5vbVwiLCBcInBhdGllbnRfZmlyc3RfbmFtZVwiLFxuICAgIFwicGF0aWVudEZpcnN0TmFtZVwiLCBcInBhdGllbnRGb3JlbmFtZVwiLFxuICBdLFxuICBkYXRlTmFpc3NhbmNlUGF0aWVudDogW1xuICAgIFwiZGF0ZW5uYWlzc2FuY2VwYXRpZW50XCIsIFwiZGF0ZW5haXNzYW5jZV9wYXRpZW50XCIsIFwicGF0aWVudF9kZG5cIiwgXCJwYXRpZW50X25haXNzYW5jZVwiLFxuICAgIFwicGF0aWVudERPQlwiLCBcInBhdGllbnRfZGF0ZV9vZl9iaXJ0aFwiLCBcInBhdGllbnRfYmlydGhkYXRlXCIsXG4gIF0sXG4gIGRpc3RhbmNlUHVwaWxsYWlyZTogW1xuICAgIC8qIHN0YW5kYXJkICovXG4gICAgXCJkaXN0YW5jZXB1cGlsbGFpcmVcIiwgXCJkcFwiLCBcImRpc3RfcHVwaWxsYWlyZVwiLCBcImVjYXJ0X3B1cGlsbGFpcmVcIiwgXCJwdXBpbGxlXCIsXG4gICAgXCJkaXN0YW5jZV9wdXBpbGxhaXJlXCIsIFwiZWNhcnRwdXBpbGxhaXJlXCIsIFwiZWNhcnQgaW50ZXItcHVwaWxsYWlyZVwiLFxuICAgIFwiZGlzdGFuY2UgaW50ZXJwdXBpbGxhaXJlXCIsXG4gICAgLyogdmFyaWF0aW9ucyAqL1xuICAgIFwiZGlzdF9wdXBpbFwiLCBcImRwX3RvdGFsXCIsIFwiZHBfb2RcIiwgXCJkcF9vZ1wiLCBcImVjYXJ0X3B1cGlsXCIsXG4gICAgXCJlY2FydHB1cGlsXCIsIFwiaW50ZXJwdXBpbGxhaXJlXCIsIFwiaW50ZXJfcHVwaWxsYWlyZVwiLFxuICAgIFwiZGlzdGFuY2VwdXBpbGxhaXJlX2xvaW5cIiwgXCJkcHZsXCIsIFwiZHBfdmxcIiwgXCJkaXN0YW5jZXB1cGlsbGFpcmVWTFwiLFxuICAgIFwiZGlzdGFuY2VwdXBpbGxhaXJlX3ByZXNcIiwgXCJkcHZwXCIsIFwiZHBfdnBcIiwgXCJkaXN0YW5jZXB1cGlsbGFpcmVWUFwiLFxuICAgIFwiZWlwXCIsIFwiZWlwX3ZsXCIsIFwiZWlwX3ZwXCIsIFwiZWNhcnRpbnRlcnB1cGlsbGFpcmVcIixcbiAgICAvKiBhbmdsYWlzICovXG4gICAgXCJwZFwiLCBcInB1cGlsbGFyeV9kaXN0YW5jZVwiLCBcImlwZFwiLCBcImludGVyX3B1cGlsbGFyeVwiLCBcImludGVycHVwaWxsYXJ5XCIsXG4gICAgXCJwdXBpbF9kaXN0YW5jZVwiLCBcImludGVyX3B1cGlsX2Rpc3RhbmNlXCIsIFwiYmlub2N1bGFyX3BkXCIsXG4gICAgLyogY2FtZWxDYXNlIC8gZnJhbWV3b3JrcyAqL1xuICAgIFwiZGlzdGFuY2VQdXBpbGxhaXJlXCIsIFwiZGlzdGFuY2VQRFwiLCBcInB1cGlsbGFyeURpc3RhbmNlXCIsIFwiaW50ZXJwdXBpbGxhcnlEaXN0YW5jZVwiLFxuICAgIC8qIEFsbWVyeXMgLyBXZW1pbmQgKi9cbiAgICBcImVwZFwiLCBcImRpc3RfaW50ZXJwdXBpbGxhaXJlXCIsXG4gICAgLyogRVJQICovXG4gICAgXCJ0eHREUFwiLCBcImZsZF9kcFwiLCBcImlucHV0X2RwXCIsIFwiY2hhbXBfZHBcIixcbiAgICAvKiBkYXRhLXRlc3RpZCAqL1xuICAgIFwicHVwaWxsYXJ5LWRpc3RhbmNlXCIsIFwicGQtaW5wdXRcIiwgXCJkcC1pbnB1dFwiLFxuICBdLFxuICB0eXBlUHJlc2NyaXB0aW9uOiBbXG4gICAgXCJ0eXBlcHJlc2NyaXB0aW9uXCIsIFwidHlwZV9wcmVzY3JpcHRpb25cIiwgXCJ0eXBlX2VxdWlwZW1lbnRcIiwgXCJlcXVpcGVtZW50XCIsXG4gICAgXCJ0eXBlX3ZlcnJlXCIsIFwidHlwZWVxdWlwZW1lbnRcIiwgXCJuYXR1cmVfZXF1aXBlbWVudFwiLCBcInByZXNjcmlwdGlvbl90eXBlXCIsXG4gICAgXCJlcXVpcG1lbnRfdHlwZVwiLCBcImxlbnNfdHlwZVwiLCBcIm5hdHVyZV9kb3NzaWVyXCIsIFwibmF0dXJlZG9zc2llclwiLFxuICBdLFxuICByZW1hcnF1ZXM6IFtcbiAgICBcInJlbWFycXVlc1wiLCBcIm5vdGVzXCIsIFwiY29tbWVudGFpcmVcIiwgXCJvYnNlcnZhdGlvbnNcIiwgXCJub3RlXCIsIFwiY29tbWVudGFpcmVzXCIsXG4gICAgXCJpbmZvcm1hdGlvbnNfY29tcGxlbWVudGFpcmVzXCIsIFwiaW5mb3NfY29tcFwiLCBcIm1lbW9cIiwgXCJub3RlX2ludGVybmVcIixcbiAgICBcInJlbWFycXVlXCIsIFwibm90ZXNfZG9zc2llclwiLCBcIm5vdGVzX2ludGVybmVzXCIsIFwib2JzZXJ2YXRpb25cIixcbiAgICBcInR4dE5vdGVzXCIsIFwiY3RsX25vdGVzXCIsIFwibm90ZXNfbGlicmVzXCIsXG4gIF0sXG5cbiAgLyogXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXG4gICAqICBDT1JSRUNUSU9OUyBMVU5FVFRFUyBPRCAoT2VpbCBEcm9pdClcbiAgICogXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwICovXG4gIFwibHVuZXR0ZXNPRC5zcGhlcmVcIjogW1xuICAgIFwic3BoZXJlX29kXCIsIFwic3BoX29kXCIsIFwib2Rfc3BoXCIsIFwic3BoZXJlb2RcIiwgXCJzcGhlcmUgb2RcIiwgXCJzcGggb2RcIixcbiAgICBcInNwaGVyZV92ZXJyZV9kcm9pdFwiLCBcInNwaGVyZXZlcnJlZHJvaXRcIiwgXCJvZF9zcGhlcmVcIiwgXCJyX3NwaGVyZVwiLFxuICAgIFwic3BoX2Ryb2l0XCIsIFwic3BoZXJlX2RcIiwgXCJzcGhlcmVfdmxfb2RcIiwgXCJzcGhlcmVfbG9pbl9vZFwiLCBcInN2bF9vZFwiLFxuICAgIFwic3BoX3JcIiwgXCJzcGhvZFwiLCBcInJpZ2h0X3NwaGVyZVwiLCBcInNwaGVyZVJpZ2h0XCIsIFwic3BoZXJlX29laWxfZHJvaXRcIixcbiAgICBcInJlX3NwaFwiLCBcInNwaGVyZV92cF9vZFwiLCBcImRyb2l0X3NwaGVyZVwiLFxuICAgIC8qIEFsbWVyeXMgUk9DIC8gV2VtaW5kIHYzICovXG4gICAgXCJzcGhPRFwiLCBcInNwaGVyZU9EXCIsIFwiU3BoT0RcIiwgXCJTcGhlcmVPRFwiLCBcInNwaF92bF9vZFwiLFxuICAgIFwidmVycmVfZHJvaXRfc3BoXCIsIFwidmRfc3BoXCIsIFwiVkRfc3BoZXJlXCIsIFwib2VpbERyb2l0X3NwaGVyZVwiLFxuICAgIC8qIExCTyAvIE9wdGltdW0gKi9cbiAgICBcIm9kX3NwaGVyZV92bFwiLCBcInNwaGVyZVZMT0RcIiwgXCJzcGhfb2RfdmxcIixcbiAgICAvKiBkYXRhLXRlc3RpZCAqL1xuICAgIFwib2Qtc3BoZXJlXCIsIFwicmlnaHQtc3BoZXJlXCIsIFwic3BoZXJlLW9kXCIsXG4gIF0sXG4gIFwibHVuZXR0ZXNPRC5jeWxpbmRyZVwiOiBbXG4gICAgXCJjeWxpbmRyZV9vZFwiLCBcImN5bF9vZFwiLCBcIm9kX2N5bFwiLCBcImN5bGluZHJlb2RcIiwgXCJjeWwgb2RcIiwgXCJjeWxpbmRyZSBvZFwiLFxuICAgIFwiY3lsaW5kcmVfdmVycmVfZHJvaXRcIiwgXCJyX2N5bGluZHJlXCIsIFwiY3lsX2Ryb2l0XCIsIFwiY3lsaW5kcmVfZFwiLFxuICAgIFwiY3lsX3JcIiwgXCJjeWxvZFwiLCBcInJpZ2h0X2N5bGluZGVyXCIsIFwiY3lsaW5kZXJSaWdodFwiLCBcImN5bF92bF9vZFwiLFxuICAgIFwib2RfY3lsaW5kcmVcIiwgXCJkcm9pdF9jeWxpbmRyZVwiLCBcInJlX2N5bFwiLFxuICAgIC8qIEFsbWVyeXMgUk9DIC8gV2VtaW5kIHYzICovXG4gICAgXCJjeWxPRFwiLCBcImN5bGluZHJlT0RcIiwgXCJDeWxPRFwiLCBcIkN5bGluZHJlT0RcIixcbiAgICBcInZlcnJlX2Ryb2l0X2N5bFwiLCBcInZkX2N5bFwiLCBcIlZEX2N5bGluZHJlXCIsIFwib2VpbERyb2l0X2N5bGluZHJlXCIsXG4gICAgLyogZGF0YS10ZXN0aWQgKi9cbiAgICBcIm9kLWN5bGluZHJlXCIsIFwicmlnaHQtY3lsaW5kZXJcIiwgXCJjeWxpbmRyZS1vZFwiLFxuICBdLFxuICBcImx1bmV0dGVzT0QuYXhlXCI6IFtcbiAgICBcImF4ZV9vZFwiLCBcImF4X29kXCIsIFwib2RfYXhlXCIsIFwiYXhlb2RcIiwgXCJheGUgb2RcIiwgXCJheCBvZFwiLFxuICAgIFwiYXhlX3ZlcnJlX2Ryb2l0XCIsIFwicl9heGVcIiwgXCJheGVfZHJvaXRcIiwgXCJheGVfZFwiLCBcImF4X3JcIiwgXCJheG9kXCIsXG4gICAgXCJyaWdodF9heGlzXCIsIFwiYXhpc1JpZ2h0XCIsIFwiYXhlX3ZsX29kXCIsIFwib2RfYXhcIiwgXCJkcm9pdF9heGVcIixcbiAgICBcImF4aXNfb2RcIiwgXCJyZV9heFwiLFxuICAgIC8qIEFsbWVyeXMgUk9DIC8gV2VtaW5kIHYzICovXG4gICAgXCJheGVPRFwiLCBcIkF4ZU9EXCIsIFwidmVycmVfZHJvaXRfYXhlXCIsIFwidmRfYXhlXCIsIFwiVkRfYXhlXCIsXG4gICAgXCJvZWlsRHJvaXRfYXhlXCIsIFwiYXhlX2NvcnJlY3Rpb25fb2RcIixcbiAgICAvKiBkYXRhLXRlc3RpZCAqL1xuICAgIFwib2QtYXhlXCIsIFwicmlnaHQtYXhpc1wiLCBcImF4ZS1vZFwiLFxuICBdLFxuICBcImx1bmV0dGVzT0QuYWRkaXRpb25cIjogW1xuICAgIFwiYWRkaXRpb25fb2RcIiwgXCJhZGRfb2RcIiwgXCJvZF9hZGRcIiwgXCJhZGRpdGlvbm9kXCIsIFwiYWRkIG9kXCIsIFwiYWRkaXRpb24gb2RcIixcbiAgICBcInJfYWRkaXRpb25cIiwgXCJhZGRfZHJvaXRcIiwgXCJhZGRpdGlvbl9kXCIsIFwiYWRkX3JcIiwgXCJhZGRvZFwiLFxuICAgIFwicmlnaHRfYWRkaXRpb25cIiwgXCJhZGRSaWdodFwiLCBcImFkZF92cF9vZFwiLCBcIm9kX2FkZGl0aW9uXCIsXG4gICAgXCJkcm9pdF9hZGRpdGlvblwiLCBcInJlX2FkZFwiLFxuICAgIC8qIEFsbWVyeXMgUk9DIC8gV2VtaW5kIHYzICovXG4gICAgXCJhZGRPRFwiLCBcImFkZGl0aW9uT0RcIiwgXCJBZGRPRFwiLCBcInZlcnJlX2Ryb2l0X2FkZFwiLCBcInZkX2FkZFwiLFxuICAgIFwib2VpbERyb2l0X2FkZGl0aW9uXCIsIFwiYWRkX3ZwXCIsXG4gICAgLyogZGF0YS10ZXN0aWQgKi9cbiAgICBcIm9kLWFkZGl0aW9uXCIsIFwicmlnaHQtYWRkaXRpb25cIiwgXCJhZGRpdGlvbi1vZFwiLFxuICBdLFxuXG4gIC8qIFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFxuICAgKiAgQ09SUkVDVElPTlMgTFVORVRURVMgT0cgKE9laWwgR2F1Y2hlKVxuICAgKiBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTAgKi9cbiAgXCJsdW5ldHRlc09HLnNwaGVyZVwiOiBbXG4gICAgXCJzcGhlcmVfb2dcIiwgXCJzcGhfb2dcIiwgXCJvZ19zcGhcIiwgXCJzcGhlcmVvZ1wiLCBcInNwaGVyZSBvZ1wiLCBcInNwaCBvZ1wiLFxuICAgIFwic3BoZXJlX3ZlcnJlX2dhdWNoZVwiLCBcImxfc3BoZXJlXCIsIFwic3BoX2dhdWNoZVwiLCBcInNwaGVyZV9nXCIsXG4gICAgXCJzcGhlcmVfdmxfb2dcIiwgXCJzcGhlcmVfbG9pbl9vZ1wiLCBcInN2bF9vZ1wiLCBcInNwaF9sXCIsIFwic3Bob2dcIixcbiAgICBcImxlZnRfc3BoZXJlXCIsIFwic3BoZXJlTGVmdFwiLCBcInNwaGVyZV9vZWlsX2dhdWNoZVwiLCBcImxlX3NwaFwiLFxuICAgIFwic3BoZXJlX3ZwX29nXCIsIFwiZ2F1Y2hlX3NwaGVyZVwiLFxuICAgIC8qIEFsbWVyeXMgUk9DIC8gV2VtaW5kIHYzICovXG4gICAgXCJzcGhPR1wiLCBcInNwaGVyZU9HXCIsIFwiU3BoT0dcIiwgXCJTcGhlcmVPR1wiLCBcInNwaF92bF9vZ1wiLFxuICAgIFwidmVycmVfZ2F1Y2hlX3NwaFwiLCBcInZnX3NwaFwiLCBcIlZHX3NwaGVyZVwiLCBcIm9laWxHYXVjaGVfc3BoZXJlXCIsXG4gICAgLyogTEJPIC8gT3B0aW11bSAqL1xuICAgIFwib2dfc3BoZXJlX3ZsXCIsIFwic3BoZXJlVkxPR1wiLCBcInNwaF9vZ192bFwiLFxuICAgIC8qIGRhdGEtdGVzdGlkICovXG4gICAgXCJvZy1zcGhlcmVcIiwgXCJsZWZ0LXNwaGVyZVwiLCBcInNwaGVyZS1vZ1wiLFxuICBdLFxuICBcImx1bmV0dGVzT0cuY3lsaW5kcmVcIjogW1xuICAgIFwiY3lsaW5kcmVfb2dcIiwgXCJjeWxfb2dcIiwgXCJvZ19jeWxcIiwgXCJjeWxpbmRyZW9nXCIsIFwiY3lsIG9nXCIsIFwiY3lsaW5kcmUgb2dcIixcbiAgICBcImN5bGluZHJlX3ZlcnJlX2dhdWNoZVwiLCBcImxfY3lsaW5kcmVcIiwgXCJjeWxfZ2F1Y2hlXCIsIFwiY3lsaW5kcmVfZ1wiLFxuICAgIFwiY3lsX2xcIiwgXCJjeWxvZ1wiLCBcImxlZnRfY3lsaW5kZXJcIiwgXCJjeWxpbmRlckxlZnRcIiwgXCJjeWxfdmxfb2dcIixcbiAgICBcIm9nX2N5bGluZHJlXCIsIFwiZ2F1Y2hlX2N5bGluZHJlXCIsIFwibGVfY3lsXCIsXG4gICAgLyogQWxtZXJ5cyBST0MgLyBXZW1pbmQgdjMgKi9cbiAgICBcImN5bE9HXCIsIFwiY3lsaW5kcmVPR1wiLCBcIkN5bE9HXCIsIFwiQ3lsaW5kcmVPR1wiLFxuICAgIFwidmVycmVfZ2F1Y2hlX2N5bFwiLCBcInZnX2N5bFwiLCBcIlZHX2N5bGluZHJlXCIsIFwib2VpbEdhdWNoZV9jeWxpbmRyZVwiLFxuICAgIC8qIGRhdGEtdGVzdGlkICovXG4gICAgXCJvZy1jeWxpbmRyZVwiLCBcImxlZnQtY3lsaW5kZXJcIiwgXCJjeWxpbmRyZS1vZ1wiLFxuICBdLFxuICBcImx1bmV0dGVzT0cuYXhlXCI6IFtcbiAgICBcImF4ZV9vZ1wiLCBcImF4X29nXCIsIFwib2dfYXhlXCIsIFwiYXhlb2dcIiwgXCJheGUgb2dcIiwgXCJheCBvZ1wiLFxuICAgIFwiYXhlX3ZlcnJlX2dhdWNoZVwiLCBcImxfYXhlXCIsIFwiYXhlX2dhdWNoZVwiLCBcImF4ZV9nXCIsIFwiYXhfbFwiLCBcImF4b2dcIixcbiAgICBcImxlZnRfYXhpc1wiLCBcImF4aXNMZWZ0XCIsIFwiYXhlX3ZsX29nXCIsIFwib2dfYXhcIiwgXCJnYXVjaGVfYXhlXCIsXG4gICAgXCJheGlzX29nXCIsIFwibGVfYXhcIixcbiAgICAvKiBBbG1lcnlzIFJPQyAvIFdlbWluZCB2MyAqL1xuICAgIFwiYXhlT0dcIiwgXCJBeGVPR1wiLCBcInZlcnJlX2dhdWNoZV9heGVcIiwgXCJ2Z19heGVcIiwgXCJWR19heGVcIixcbiAgICBcIm9laWxHYXVjaGVfYXhlXCIsIFwiYXhlX2NvcnJlY3Rpb25fb2dcIixcbiAgICAvKiBkYXRhLXRlc3RpZCAqL1xuICAgIFwib2ctYXhlXCIsIFwibGVmdC1heGlzXCIsIFwiYXhlLW9nXCIsXG4gIF0sXG4gIFwibHVuZXR0ZXNPRy5hZGRpdGlvblwiOiBbXG4gICAgXCJhZGRpdGlvbl9vZ1wiLCBcImFkZF9vZ1wiLCBcIm9nX2FkZFwiLCBcImFkZGl0aW9ub2dcIiwgXCJhZGQgb2dcIiwgXCJhZGRpdGlvbiBvZ1wiLFxuICAgIFwibF9hZGRpdGlvblwiLCBcImFkZF9nYXVjaGVcIiwgXCJhZGRpdGlvbl9nXCIsIFwiYWRkX2xcIiwgXCJhZGRvZ1wiLFxuICAgIFwibGVmdF9hZGRpdGlvblwiLCBcImFkZExlZnRcIiwgXCJhZGRfdnBfb2dcIiwgXCJvZ19hZGRpdGlvblwiLFxuICAgIFwiZ2F1Y2hlX2FkZGl0aW9uXCIsIFwibGVfYWRkXCIsXG4gICAgLyogQWxtZXJ5cyBST0MgLyBXZW1pbmQgdjMgKi9cbiAgICBcImFkZE9HXCIsIFwiYWRkaXRpb25PR1wiLCBcIkFkZE9HXCIsIFwidmVycmVfZ2F1Y2hlX2FkZFwiLCBcInZnX2FkZFwiLFxuICAgIFwib2VpbEdhdWNoZV9hZGRpdGlvblwiLFxuICAgIC8qIGRhdGEtdGVzdGlkICovXG4gICAgXCJvZy1hZGRpdGlvblwiLCBcImxlZnQtYWRkaXRpb25cIiwgXCJhZGRpdGlvbi1vZ1wiLFxuICBdLFxuXG4gIC8qIFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFxuICAgKiAgQ09SUkVDVElPTlMgTEVOVElMTEVTIE9EXG4gICAqIFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MCAqL1xuICBcImxlbnRpbGxlc09ELnNwaGVyZVwiOiAgIFtcInNwaGVyZV9sZW50aWxsZV9vZFwiLCBcInNwaF9sZW50aWxsZV9vZFwiLCBcImxlbnRpbGxlX29kX3NwaGVyZVwiLCBcImxvZF9zcGhcIiwgXCJjb250YWN0X3NwaGVyZV9vZFwiLCBcImNsX3NwaF9vZFwiXSxcbiAgXCJsZW50aWxsZXNPRC5jeWxpbmRyZVwiOiBbXCJjeWxpbmRyZV9sZW50aWxsZV9vZFwiLCBcImN5bF9sZW50aWxsZV9vZFwiLCBcImxlbnRpbGxlX29kX2N5bFwiLCBcImxvZF9jeWxcIiwgXCJjb250YWN0X2N5bF9vZFwiLCBcImNsX2N5bF9vZFwiXSxcbiAgXCJsZW50aWxsZXNPRC5heGVcIjogICAgICBbXCJheGVfbGVudGlsbGVfb2RcIiwgXCJheF9sZW50aWxsZV9vZFwiLCBcImxlbnRpbGxlX29kX2F4ZVwiLCBcImxvZF9heFwiLCBcImNvbnRhY3RfYXhlX29kXCIsIFwiY2xfYXhfb2RcIl0sXG4gIFwibGVudGlsbGVzT0QuYWRkaXRpb25cIjogW1wiYWRkaXRpb25fbGVudGlsbGVfb2RcIiwgXCJhZGRfbGVudGlsbGVfb2RcIiwgXCJsZW50aWxsZV9vZF9hZGRcIiwgXCJjb250YWN0X2FkZF9vZFwiLCBcImNsX2FkZF9vZFwiXSxcbiAgXCJsZW50aWxsZXNPRC5yYXlvbkNvdXJidXJlXCI6IFtcInJheW9uX29kXCIsIFwicmF5b25jb3VyYnVyZV9vZFwiLCBcImJjX29kXCIsIFwiYmFzZV9jdXJ2ZV9vZFwiLCBcInJiX29kXCIsIFwicmF5b25fY291cmJ1cmVfb2RcIiwgXCJiYXNlY3VydmVfb2RcIl0sXG4gIFwibGVudGlsbGVzT0QuZGlhbWV0cmVcIjogW1wiZGlhbWV0cmVfb2RcIiwgXCJkaWFfb2RcIiwgXCJkaWFtX29kXCIsIFwiZGlhbWV0ZXJfb2RcIiwgXCJkaWFtZXRyZV9sZW50aWxsZV9vZFwiXSxcblxuICAvKiBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcbiAgICogIENPUlJFQ1RJT05TIExFTlRJTExFUyBPR1xuICAgKiBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTAgKi9cbiAgXCJsZW50aWxsZXNPRy5zcGhlcmVcIjogICBbXCJzcGhlcmVfbGVudGlsbGVfb2dcIiwgXCJzcGhfbGVudGlsbGVfb2dcIiwgXCJsZW50aWxsZV9vZ19zcGhlcmVcIiwgXCJsb2dfc3BoXCIsIFwiY29udGFjdF9zcGhlcmVfb2dcIiwgXCJjbF9zcGhfb2dcIl0sXG4gIFwibGVudGlsbGVzT0cuY3lsaW5kcmVcIjogW1wiY3lsaW5kcmVfbGVudGlsbGVfb2dcIiwgXCJjeWxfbGVudGlsbGVfb2dcIiwgXCJsZW50aWxsZV9vZ19jeWxcIiwgXCJsb2dfY3lsXCIsIFwiY29udGFjdF9jeWxfb2dcIiwgXCJjbF9jeWxfb2dcIl0sXG4gIFwibGVudGlsbGVzT0cuYXhlXCI6ICAgICAgW1wiYXhlX2xlbnRpbGxlX29nXCIsIFwiYXhfbGVudGlsbGVfb2dcIiwgXCJsZW50aWxsZV9vZ19heGVcIiwgXCJsb2dfYXhcIiwgXCJjb250YWN0X2F4ZV9vZ1wiLCBcImNsX2F4X29nXCJdLFxuICBcImxlbnRpbGxlc09HLmFkZGl0aW9uXCI6IFtcImFkZGl0aW9uX2xlbnRpbGxlX29nXCIsIFwiYWRkX2xlbnRpbGxlX29nXCIsIFwibGVudGlsbGVfb2dfYWRkXCIsIFwiY29udGFjdF9hZGRfb2dcIiwgXCJjbF9hZGRfb2dcIl0sXG4gIFwibGVudGlsbGVzT0cucmF5b25Db3VyYnVyZVwiOiBbXCJyYXlvbl9vZ1wiLCBcInJheW9uY291cmJ1cmVfb2dcIiwgXCJiY19vZ1wiLCBcImJhc2VfY3VydmVfb2dcIiwgXCJyYl9vZ1wiLCBcInJheW9uX2NvdXJidXJlX29nXCIsIFwiYmFzZWN1cnZlX29nXCJdLFxuICBcImxlbnRpbGxlc09HLmRpYW1ldHJlXCI6IFtcImRpYW1ldHJlX29nXCIsIFwiZGlhX29nXCIsIFwiZGlhbV9vZ1wiLCBcImRpYW1ldGVyX29nXCIsIFwiZGlhbWV0cmVfbGVudGlsbGVfb2dcIl0sXG59O1xuXG4vKiBDaGFtcHMgXHUwMEUwIG5lIGphbWFpcyByZW1wbGlyIGF1dG9tYXRpcXVlbWVudCAoYXV0b2NvbXBsZXRlLCBsb29rdXBzLCBjaGFtcHMgc2Vuc2libGVzKSAqL1xuZXhwb3J0IHZhciBTTUFSVF9GSUxMX0JMQUNLTElTVCA9IFtcbiAgLyogQ2hhbXBzIGF1dG9jb21wbGV0ZSAvIHJlY2hlcmNoZSBcdTIwMTQgZ1x1MDBFOXJcdTAwRTlzIG1hbnVlbGxlbWVudCAqL1xuICBcImFzc3VyZXVyXCIsXG4gIFwib3JnYW5pc21lX3NlYXJjaFwiLFxuICBcInNlYXJjaFwiLFxuICBcInJlY2hlcmNoZVwiLFxuICBcImF1dG9jb21wbGV0ZVwiLFxuICAvKiBBdXRoZW50aWZpY2F0aW9uIFx1MjAxNCBORSBKQU1BSVMgcmVtcGxpciAqL1xuICBcInBhc3N3b3JkXCIsXG4gIFwibW90X2RlX3Bhc3NlXCIsXG4gIFwibWRwXCIsXG4gIFwicGFzc3dkXCIsXG4gIFwicHdkXCIsXG4gIFwidXNlcm5hbWVcIixcbiAgXCJsb2dpblwiLFxuICBcImlkZW50aWZpYW50XCIsXG4gIFwidXNlcl9pZFwiLFxuICBcInVzZXJpZFwiLFxuICAvKiAyRkEgLyBjb2RlcyBkZSB2XHUwMEU5cmlmaWNhdGlvbiAqL1xuICBcIm90cFwiLFxuICBcImNvZGVfb3RwXCIsXG4gIFwiY29kZV92ZXJpZmljYXRpb25cIixcbiAgXCJ2ZXJpZmljYXRpb25fY29kZVwiLFxuICBcImNvZGVfc21zXCIsXG4gIFwidG90cFwiLFxuICBcInBpblwiLFxuICAvKiBEb25uXHUwMEU5ZXMgYmFuY2FpcmVzIFx1MjAxNCBjcml0aXF1ZSBSR1BEICovXG4gIFwibnVtZXJvY2FydGViYW5jYWlyZVwiLFxuICBcImNhcnRlX2JhbmNhaXJlXCIsXG4gIFwibnVtZXJvX2NhcnRlX2JhbmNhaXJlXCIsXG4gIFwiY2FyZF9udW1iZXJcIixcbiAgXCJjYXJkbnVtYmVyXCIsXG4gIFwiY3Z2XCIsXG4gIFwiY3ZjXCIsXG4gIFwiY3Z2MlwiLFxuICBcImV4cGlyeVwiLFxuICBcImV4cGlyeV9kYXRlXCIsXG4gIFwiY2FyZF9leHBpcnlcIixcbiAgXCJpYmFuXCIsXG4gIFwiYmljXCIsXG4gIFwicmliXCIsXG4gIFwibnVtaWJhblwiLFxuICAvKiBDaGFtcHMgZGUgcmVjaGVyY2hlIGQnYWRyZXNzZSAoR29vZ2xlIE1hcHMsIGV0Yy4pICovXG4gIFwiYWRkcmVzc19zZWFyY2hcIixcbiAgXCJhZHJlc3NlX3JlY2hlcmNoZVwiLFxuICBcImNvZGVfcG9zdGFsX3JlY2hlcmNoZVwiLFxuICBcInZpbGxlX3JlY2hlcmNoZVwiLFxuICBcInNlYXJjaF9hZGRyZXNzXCIsXG4gIC8qIENhcHRjaGEgKi9cbiAgXCJjYXB0Y2hhXCIsXG4gIFwiZy1yZWNhcHRjaGFcIixcbiAgXCJyZWNhcHRjaGFcIixcbiAgXCJoY2FwdGNoYVwiLFxuXTtcblxuLyogXHUyNTAwXHUyNTAwIFBhZ2UgY29udGV4dCBkZXRlY3Rpb24gXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG5leHBvcnQgZnVuY3Rpb24gZGV0ZWN0UGFnZUNvbnRleHQoKSB7XG4gIHZhciB0ZXh0ID0gKHdpbmRvdy5sb2NhdGlvbi5ocmVmICsgXCIgXCIgKyBkb2N1bWVudC50aXRsZSArIFwiIFwiICsgKChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiaDEsaDJcIil8fHt9KS50ZXh0Q29udGVudHx8XCJcIikpLnRvTG93ZXJDYXNlKCk7XG4gIGlmICgvbG9naW58Y29ubmV4aW9ufHNpZ25pbnxtb3QuZGUucGFzc2UvLnRlc3QodGV4dCkpIHJldHVybiBcImxvZ2luXCI7XG4gIGlmICgvcmVjaGVyY2hlfHNlYXJjaC8udGVzdCh0ZXh0KSkgcmV0dXJuIFwic2VhcmNoXCI7XG4gIGlmICgvYmVuZWZpY2lhaXJlfGFkaGVyZW50Ly50ZXN0KHRleHQpKSByZXR1cm4gXCJiZW5lZmljaWFpcmVcIjtcbiAgaWYgKC9wcmlzZS5lbi5jaGFyZ2V8cGVjfGRlbWFuZGUvLnRlc3QodGV4dCkpIHJldHVybiBcInBlY1wiO1xuICBpZiAoL2RldmlzfGNvdGF0aW9uLy50ZXN0KHRleHQpKSByZXR1cm4gXCJkZXZpc1wiO1xuICByZXR1cm4gXCJ1bmtub3duXCI7XG59XG5cbi8qIFx1MjUwMFx1MjUwMCBWaXNpYmxlIGZpZWxkcyBkZXRlY3Rpb24gXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VmlzaWJsZUZpZWxkcygpIHtcbiAgdmFyIHNlbGVjdG9yID0gXCJpbnB1dDpub3QoW3R5cGU9aGlkZGVuXSksIHNlbGVjdCwgdGV4dGFyZWFcIjtcbiAgdmFyIGZpZWxkcyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpO1xuICAvKiBJbmNsdXJlIGxlcyBjaGFtcHMgZGFucyBsZXMgaWZyYW1lcyBhY2Nlc3NpYmxlcyAqL1xuICB2YXIgaWZyYW1lcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJpZnJhbWVcIik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaWZyYW1lcy5sZW5ndGg7IGkrKykge1xuICAgIHRyeSB7XG4gICAgICB2YXIgaURvYyA9IGlmcmFtZXNbaV0uY29udGVudERvY3VtZW50IHx8IChpZnJhbWVzW2ldLmNvbnRlbnRXaW5kb3cgJiYgaWZyYW1lc1tpXS5jb250ZW50V2luZG93LmRvY3VtZW50KTtcbiAgICAgIGlmIChpRG9jKSBmaWVsZHMgPSBmaWVsZHMuY29uY2F0KEFycmF5LmZyb20oaURvYy5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSkpO1xuICAgIH0gY2F0Y2goZSkge31cbiAgfVxuICByZXR1cm4gZmllbGRzLmZpbHRlcihmdW5jdGlvbihlbCkge1xuICAgIHRyeSB7XG4gICAgICB2YXIgY3MgPSAoZWwub3duZXJEb2N1bWVudC5kZWZhdWx0VmlldyB8fCB3aW5kb3cpLmdldENvbXB1dGVkU3R5bGUoZWwpO1xuICAgICAgcmV0dXJuIGNzLmRpc3BsYXkgIT09IFwibm9uZVwiICYmIGNzLnZpc2liaWxpdHkgIT09IFwiaGlkZGVuXCIgJiYgY3Mub3BhY2l0eSAhPT0gXCIwXCJcbiAgICAgICAgJiYgIWVsLmRpc2FibGVkICYmICFlbC5yZWFkT25seSAmJiBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQgPiAwO1xuICAgIH0gY2F0Y2goZSkgeyByZXR1cm4gZmFsc2U7IH1cbiAgfSk7XG59XG4iLCAiLyogXHUyNTAwXHUyNTAwIEZpZWxkIE1hdGNoaW5nIFV0aWxpdHkgRnVuY3Rpb25zIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuXG5pbXBvcnQgeyBTTUFSVF9GSUxMX0FMSUFTRVMsIFNNQVJUX0ZJTExfQkxBQ0tMSVNUIH0gZnJvbSBcIi4vZGF0YS5qc1wiO1xuXG4vKiBcdTI1MDBcdTI1MDAgTGVhcm5lZCB3ZWlnaHRzIGZvciBzY29yZSByZWNhbGlicmF0aW9uIChWMy0zKSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cbnZhciBfbGVhcm5lZFdlaWdodHMgPSBudWxsO1xuXG5leHBvcnQgZnVuY3Rpb24gbG9hZExlYXJuZWRXZWlnaHRzKCkge1xuICB2YXIgaG9zdG5hbWUgPSB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWU7XG4gIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbXCJhdWRpYm90X2xlYXJuZWRfd2VpZ2h0c1wiXSwgZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgdmFyIGNhY2hlZCA9IHJlc3VsdC5hdWRpYm90X2xlYXJuZWRfd2VpZ2h0cztcbiAgICBpZiAoY2FjaGVkICYmIGNhY2hlZC50cyAmJiBEYXRlLm5vdygpIC0gY2FjaGVkLnRzIDwgMzYwMDAwMCkge1xuICAgICAgX2xlYXJuZWRXZWlnaHRzID0gY2FjaGVkLndlaWdodHMgfHwge307XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8qIEZldGNoIGZyZXNoIHdlaWdodHMgZnJvbSBiYWNrZW5kICovXG4gICAgaWYgKHR5cGVvZiBnZXRTeW5jVG9rZW4gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgZ2V0U3luY1Rva2VuKCkudGhlbihmdW5jdGlvbih0b2tlbikge1xuICAgICAgICBpZiAoIXRva2VuKSByZXR1cm47XG4gICAgICAgIGZldGNoKFwiaHR0cHM6Ly9hdWRpYm90LmZyL2FwaS9leHRlbnNpb24vc21hcnQtZmlsbC93ZWlnaHRzP2hvc3RuYW1lPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KGhvc3RuYW1lKSwge1xuICAgICAgICAgIGhlYWRlcnM6IHsgXCJBdXRob3JpemF0aW9uXCI6IFwiQmVhcmVyIFwiICsgdG9rZW4gfVxuICAgICAgICB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbihyKSB7IHJldHVybiByLmpzb24oKTsgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIF9sZWFybmVkV2VpZ2h0cyA9IGRhdGEud2VpZ2h0cyB8fCB7fTtcbiAgICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoeyBhdWRpYm90X2xlYXJuZWRfd2VpZ2h0czogeyB3ZWlnaHRzOiBfbGVhcm5lZFdlaWdodHMsIHRzOiBEYXRlLm5vdygpIH0gfSk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbihlcnIpIHsgY29uc29sZS53YXJuKFwiW0F1ZGlCb3RdIGxlYXJuZWQgd2VpZ2h0cyBmZXRjaCBmYWlsZWQ6XCIsIGVycik7IH0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcbn1cblxuLyogXHUyNTAwXHUyNTAwIFByZS1jYWNoZWQgbGFiZWwgbWFwIChwb3B1bGF0ZWQgYnkgcHJlQ2FjaGVMYWJlbE1hcCkgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG52YXIgX2xhYmVsTWFwID0gbnVsbDtcblxuZXhwb3J0IGZ1bmN0aW9uIHByZUNhY2hlTGFiZWxNYXAoKSB7XG4gIF9sYWJlbE1hcCA9IHt9O1xuICB2YXIgbGFiZWxzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcImxhYmVsW2Zvcl1cIik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGFiZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGZvcklkID0gbGFiZWxzW2ldLmdldEF0dHJpYnV0ZShcImZvclwiKTtcbiAgICBpZiAoZm9ySWQpIF9sYWJlbE1hcFtmb3JJZF0gPSBsYWJlbHNbaV0udGV4dENvbnRlbnQudHJpbSgpO1xuICB9XG59XG5cbi8qIFx1MjUwMFx1MjUwMCBMZXZlbnNodGVpbiBkaXN0YW5jZSAod2l0aCBtZW1vaXphdGlvbikgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG52YXIgX2xldmVuc2h0ZWluQ2FjaGUgPSB7fTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyTWF0Y2hpbmdDYWNoZSgpIHtcbiAgX2xldmVuc2h0ZWluQ2FjaGUgPSB7fTtcbiAgX2xhYmVsTWFwID0gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxldmVuc2h0ZWluKGEsIGIpIHtcbiAgdmFyIGtleSA9IGEgKyBcIlxcMFwiICsgYjtcbiAgaWYgKF9sZXZlbnNodGVpbkNhY2hlW2tleV0gIT09IHVuZGVmaW5lZCkgcmV0dXJuIF9sZXZlbnNodGVpbkNhY2hlW2tleV07XG4gIGlmICghYSkgeyBfbGV2ZW5zaHRlaW5DYWNoZVtrZXldID0gKGIgfHwgXCJcIikubGVuZ3RoOyByZXR1cm4gX2xldmVuc2h0ZWluQ2FjaGVba2V5XTsgfVxuICBpZiAoIWIpIHsgX2xldmVuc2h0ZWluQ2FjaGVba2V5XSA9IGEubGVuZ3RoOyByZXR1cm4gX2xldmVuc2h0ZWluQ2FjaGVba2V5XTsgfVxuICB2YXIgbSA9IGEubGVuZ3RoLCBuID0gYi5sZW5ndGg7XG4gIHZhciBkcCA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8PSBtOyBpKyspIHtcbiAgICBkcFtpXSA9IFtpXTtcbiAgICBmb3IgKHZhciBqID0gMTsgaiA8PSBuOyBqKyspIHtcbiAgICAgIGRwW2ldW2pdID0gaSA9PT0gMCA/IGogOiAwO1xuICAgIH1cbiAgfVxuICBmb3IgKHZhciBpMiA9IDE7IGkyIDw9IG07IGkyKyspIHtcbiAgICBmb3IgKHZhciBqMiA9IDE7IGoyIDw9IG47IGoyKyspIHtcbiAgICAgIGlmIChhW2kyIC0gMV0gPT09IGJbajIgLSAxXSkge1xuICAgICAgICBkcFtpMl1bajJdID0gZHBbaTIgLSAxXVtqMiAtIDFdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZHBbaTJdW2oyXSA9IDEgKyBNYXRoLm1pbihkcFtpMiAtIDFdW2oyXSwgZHBbaTJdW2oyIC0gMV0sIGRwW2kyIC0gMV1bajIgLSAxXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIF9sZXZlbnNodGVpbkNhY2hlW2tleV0gPSBkcFttXVtuXTtcbiAgcmV0dXJuIGRwW21dW25dO1xufVxuXG4vKiBcdTI1MDBcdTI1MDAgTGFiZWwgZXh0cmFjdGlvbiBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRGaWVsZExhYmVsKGVsKSB7XG4gIGlmICghZWwpIHJldHVybiBcIlwiO1xuICAvKiBVc2UgcHJlLWNhY2hlZCBsYWJlbCBtYXAgaWYgYXZhaWxhYmxlICovXG4gIGlmIChfbGFiZWxNYXAgJiYgZWwuaWQgJiYgX2xhYmVsTWFwW2VsLmlkXSkgcmV0dXJuIF9sYWJlbE1hcFtlbC5pZF07XG4gIHZhciByb290Tm9kZSA9IGVsLmdldFJvb3ROb2RlID8gZWwuZ2V0Um9vdE5vZGUoKSA6IGRvY3VtZW50O1xuICBpZiAoZWwuaWQpIHtcbiAgICB2YXIgbGJsID0gcm9vdE5vZGUucXVlcnlTZWxlY3RvcignbGFiZWxbZm9yPVwiJyArIGVsLmlkICsgJ1wiXScpO1xuICAgIGlmIChsYmwgJiYgbGJsLnRleHRDb250ZW50LnRyaW0oKSkgcmV0dXJuIGxibC50ZXh0Q29udGVudC50cmltKCk7XG4gIH1cbiAgdmFyIGFyaWFMYWJlbCA9IGVsLmdldEF0dHJpYnV0ZShcImFyaWEtbGFiZWxcIik7XG4gIGlmIChhcmlhTGFiZWwpIHJldHVybiBhcmlhTGFiZWwudHJpbSgpO1xuICB2YXIgYXJpYUxhYmVsbGVkYnkgPSBlbC5nZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsbGVkYnlcIik7XG4gIGlmIChhcmlhTGFiZWxsZWRieSkge1xuICAgIHZhciByZWZFbCA9IHJvb3ROb2RlLmdldEVsZW1lbnRCeUlkID8gcm9vdE5vZGUuZ2V0RWxlbWVudEJ5SWQoYXJpYUxhYmVsbGVkYnkpIDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYXJpYUxhYmVsbGVkYnkpO1xuICAgIGlmIChyZWZFbCAmJiByZWZFbC50ZXh0Q29udGVudC50cmltKCkpIHJldHVybiByZWZFbC50ZXh0Q29udGVudC50cmltKCk7XG4gIH1cbiAgaWYgKGVsLnBsYWNlaG9sZGVyKSByZXR1cm4gZWwucGxhY2Vob2xkZXIudHJpbSgpO1xuICBpZiAoZWwuY2xvc2VzdCkge1xuICAgIHZhciBncm91cCA9IGVsLmNsb3Nlc3QoXCIuZm9ybS1ncm91cCwgLmZpZWxkLCAuZm9ybS1maWVsZCwgLm1hdC1mb3JtLWZpZWxkLCBtYXQtZm9ybS1maWVsZFwiKTtcbiAgICBpZiAoZ3JvdXApIHtcbiAgICAgIHZhciBncm91cExhYmVsID0gZ3JvdXAucXVlcnlTZWxlY3RvcihcImxhYmVsLCBtYXQtbGFiZWwsIC5tYXQtbGFiZWwsIGxlZ2VuZFwiKTtcbiAgICAgIGlmIChncm91cExhYmVsICYmIGdyb3VwTGFiZWwudGV4dENvbnRlbnQudHJpbSgpKSByZXR1cm4gZ3JvdXBMYWJlbC50ZXh0Q29udGVudC50cmltKCk7XG4gICAgfVxuICB9XG4gIHZhciBwYXJlbnQgPSBlbC5wYXJlbnRFbGVtZW50O1xuICBpZiAocGFyZW50ICYmIHBhcmVudC50YWdOYW1lID09PSBcIlREXCIpIHtcbiAgICB2YXIgcHJldlRkID0gcGFyZW50LnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XG4gICAgaWYgKHByZXZUZCAmJiBwcmV2VGQudGFnTmFtZSA9PT0gXCJURFwiICYmIHByZXZUZC50ZXh0Q29udGVudC50cmltKCkpIHJldHVybiBwcmV2VGQudGV4dENvbnRlbnQudHJpbSgpO1xuICB9XG4gIHJldHVybiBcIlwiO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplTGFiZWwoc3RyKSB7XG4gIHJldHVybiAoc3RyIHx8IFwiXCIpXG4gICAgLnRvTG93ZXJDYXNlKClcbiAgICAubm9ybWFsaXplKFwiTkZEXCIpLnJlcGxhY2UoL1tcXHUwMzAwLVxcdTAzNmZdL2csIFwiXCIpXG4gICAgLnJlcGxhY2UoL1teYS16MC05XS9nLCBcIl9cIilcbiAgICAucmVwbGFjZSgvXysvZywgXCJfXCIpXG4gICAgLnJlcGxhY2UoL15ffF8kL2csIFwiXCIpO1xufVxuXG4vKiBOb3JtYWxpc2UgdW4gc3RyaW5nIHBvdXIgbGEgY29tcGFyYWlzb24gOiBtaW51c2N1bGVzLCBzYW5zIGFjY2VudHMsIHNhbnMgZXNwYWNlcy90aXJldHMgKi9cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVBbGlhcyhzdHIpIHtcbiAgcmV0dXJuIChzdHIgfHwgXCJcIilcbiAgICAudG9Mb3dlckNhc2UoKVxuICAgIC5ub3JtYWxpemUoXCJORkRcIikucmVwbGFjZSgvW1xcdTAzMDAtXFx1MDM2Zl0vZywgXCJcIilcbiAgICAvKiBTdXBwcmltZXIgbGVzIG1hcnF1ZXVycyBvYmxpZ2F0b2lyZXMgKCopLCBwb25jdHVhdGlvbiBldCBwYXJlbnRoXHUwMEU4c2VzICovXG4gICAgLnJlcGxhY2UoL1sqOigpXFxbXFxde30jXHUwMEIwJ1wiIT9dL2csIFwiXCIpXG4gICAgLnJlcGxhY2UoL1tcXHNcXC1fXFwuXFwvXS9nLCBcIlwiKTtcbn1cblxuLyogXHUyNTAwXHUyNTAwIFNjb3JlLWJhc2VkIGZpZWxkIG1hdGNoaW5nIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjb3JlRmllbGRNYXRjaChlbCwgYWxpYXNLZXksIGFsaWFzZXMpIHtcbiAgdmFyIGVsSWQgPSBub3JtYWxpemVBbGlhcyhlbC5pZCB8fCBcIlwiKTtcbiAgdmFyIGVsTmFtZSA9IG5vcm1hbGl6ZUFsaWFzKGVsLm5hbWUgfHwgXCJcIik7XG4gIHZhciBlbExhYmVsID0gbm9ybWFsaXplQWxpYXMoZ2V0RmllbGRMYWJlbChlbCkpO1xuICB2YXIgZWxQbGFjZWhvbGRlciA9IG5vcm1hbGl6ZUFsaWFzKGVsLnBsYWNlaG9sZGVyIHx8IFwiXCIpO1xuICB2YXIgZWxUZXN0SWQgPSBub3JtYWxpemVBbGlhcyhlbC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXRlc3RpZFwiKSB8fCBlbC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWN5XCIpIHx8IGVsLmdldEF0dHJpYnV0ZShcImRhdGEtcWFcIikgfHwgXCJcIik7XG4gIHZhciBtYXhTY29yZSA9IDA7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYWxpYXNlcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBhbGlhcyA9IG5vcm1hbGl6ZUFsaWFzKGFsaWFzZXNbaV0pO1xuICAgIGlmICghYWxpYXMpIGNvbnRpbnVlO1xuICAgIGlmIChlbElkICYmIGVsSWQgPT09IGFsaWFzKSByZXR1cm4gMTAwO1xuICAgIGlmIChlbE5hbWUgJiYgZWxOYW1lID09PSBhbGlhcykgeyBtYXhTY29yZSA9IE1hdGgubWF4KG1heFNjb3JlLCA5MCk7IGNvbnRpbnVlOyB9XG4gICAgaWYgKGVsTGFiZWwgJiYgZWxMYWJlbCA9PT0gYWxpYXMpIHsgbWF4U2NvcmUgPSBNYXRoLm1heChtYXhTY29yZSwgODUpOyBjb250aW51ZTsgfVxuICAgIGlmIChlbFRlc3RJZCAmJiBlbFRlc3RJZCA9PT0gYWxpYXMpIHsgbWF4U2NvcmUgPSBNYXRoLm1heChtYXhTY29yZSwgODUpOyBjb250aW51ZTsgfVxuICAgIGlmIChlbElkICYmIGVsSWQuaW5kZXhPZihhbGlhcykgIT09IC0xKSB7IG1heFNjb3JlID0gTWF0aC5tYXgobWF4U2NvcmUsIDcwKTsgfVxuICAgIGlmIChlbE5hbWUgJiYgZWxOYW1lLmluZGV4T2YoYWxpYXMpICE9PSAtMSkgeyBtYXhTY29yZSA9IE1hdGgubWF4KG1heFNjb3JlLCA2NSk7IH1cbiAgICBpZiAoZWxMYWJlbCAmJiBlbExhYmVsLmluZGV4T2YoYWxpYXMpICE9PSAtMSkgeyBtYXhTY29yZSA9IE1hdGgubWF4KG1heFNjb3JlLCA2MCk7IH1cbiAgICBpZiAoZWxUZXN0SWQgJiYgZWxUZXN0SWQuaW5kZXhPZihhbGlhcykgIT09IC0xKSB7IG1heFNjb3JlID0gTWF0aC5tYXgobWF4U2NvcmUsIDYwKTsgfVxuICAgIGlmIChlbFBsYWNlaG9sZGVyICYmIGVsUGxhY2Vob2xkZXIuaW5kZXhPZihhbGlhcykgIT09IC0xKSB7IG1heFNjb3JlID0gTWF0aC5tYXgobWF4U2NvcmUsIDU1KTsgfVxuICAgIGlmIChlbElkICYmIGxldmVuc2h0ZWluKGVsSWQsIGFsaWFzKSA8PSAyKSB7IG1heFNjb3JlID0gTWF0aC5tYXgobWF4U2NvcmUsIDUwKTsgfVxuICAgIGlmIChlbE5hbWUgJiYgbGV2ZW5zaHRlaW4oZWxOYW1lLCBhbGlhcykgPD0gMikgeyBtYXhTY29yZSA9IE1hdGgubWF4KG1heFNjb3JlLCA0NSk7IH1cbiAgICBpZiAoZWxMYWJlbCAmJiBsZXZlbnNodGVpbihlbExhYmVsLCBhbGlhcykgPD0gMikgeyBtYXhTY29yZSA9IE1hdGgubWF4KG1heFNjb3JlLCA0MCk7IH1cbiAgfVxuICAvKiBWMy0zOiBhcHBseSBsZWFybmVkIHdlaWdodCBhZGp1c3RtZW50ICovXG4gIGlmIChfbGVhcm5lZFdlaWdodHMgJiYgX2xlYXJuZWRXZWlnaHRzW2FsaWFzS2V5XSkge1xuICAgIG1heFNjb3JlID0gTWF0aC5yb3VuZChtYXhTY29yZSAqIChfbGVhcm5lZFdlaWdodHNbYWxpYXNLZXldLm11bHRpcGxpZXIgfHwgMSkpO1xuICB9XG4gIHJldHVybiBtYXhTY29yZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hdGNoU21hcnRGaWVsZChlbCkge1xuICAvKiBcdTI1MDBcdTI1MDAgQmxhY2tsaXN0IFx1MjAxNCBqYW1haXMgcmVtcGxpciBjZXMgY2hhbXBzIFx1MjUwMFx1MjUwMCAqL1xuICB2YXIgZmNuUmF3ID0gZWwuZ2V0QXR0cmlidXRlKFwiZm9ybWNvbnRyb2xuYW1lXCIpIHx8IGVsLmdldEF0dHJpYnV0ZShcIm5nLXJlZmxlY3QtbmFtZVwiKSB8fCBlbC5uYW1lIHx8IFwiXCI7XG4gIGlmIChmY25SYXcgJiYgU01BUlRfRklMTF9CTEFDS0xJU1QuaW5kZXhPZihmY25SYXcudG9Mb3dlckNhc2UoKSkgIT09IC0xKSByZXR1cm4gbnVsbDtcblxuICAvKiBcdTI1MDBcdTI1MDAgQ29sbGVjdGUgZGVzIHNvdXJjZXMgZGUgc2lnbmFsIFx1MjUwMFx1MjUwMCAqL1xuICB2YXIgYXR0cnMgPSBbXG4gICAgZWwubmFtZSxcbiAgICBlbC5pZCxcbiAgICBlbC5wbGFjZWhvbGRlcixcbiAgICBlbC5nZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsXCIpLFxuICAgIGVsLmdldEF0dHJpYnV0ZShcImRhdGEtZmllbGRcIiksXG4gICAgZWwuZ2V0QXR0cmlidXRlKFwiZGF0YS1uYW1lXCIpLFxuICAgIGVsLmdldEF0dHJpYnV0ZShcImRhdGEtbGFiZWxcIiksXG4gICAgZWwuZ2V0QXR0cmlidXRlKFwiZGF0YS10ZXN0aWRcIiksXG4gICAgZWwuZ2V0QXR0cmlidXRlKFwiZGF0YS1jeVwiKSxcbiAgICAvKiBBbmd1bGFyIE1hdGVyaWFsIC8gUmVhY3RpdmUgRm9ybXMgKi9cbiAgICBlbC5nZXRBdHRyaWJ1dGUoXCJmb3JtY29udHJvbG5hbWVcIiksXG4gICAgZWwuZ2V0QXR0cmlidXRlKFwibmctcmVmbGVjdC1uYW1lXCIpLFxuICAgIGVsLmdldEF0dHJpYnV0ZShcIm5nLXJlZmxlY3QtcGxhY2Vob2xkZXJcIiksXG4gICAgZWwuZ2V0QXR0cmlidXRlKFwiZGF0YS1tYXQtaW5wdXRcIiksXG4gICAgLyogVnVlICovXG4gICAgZWwuZ2V0QXR0cmlidXRlKFwidi1tb2RlbFwiKSxcbiAgICBlbC5nZXRBdHRyaWJ1dGUoXCI6bmFtZVwiKSxcbiAgICAvKiBDbGFzc2VzIENTUyBcdTIwMTQgZmlsdHJlciBsZXMgY2xhc3NlcyBmcmFtZXdvcmsgc2FucyB2YWxldXIgc1x1MDBFOW1hbnRpcXVlICovXG4gICAgLi4uKGVsLmNsYXNzTmFtZSB8fCBcIlwiKS5zcGxpdCgvXFxzKy8pLmZpbHRlcihmdW5jdGlvbihjbHMpIHtcbiAgICAgIGlmICghY2xzKSByZXR1cm4gZmFsc2U7XG4gICAgICAvKiBFeGNsdXJlIGNsYXNzZXMgQm9vdHN0cmFwLCBBbmd1bGFyIE1hdGVyaWFsLCBUYWlsd2luZCwgbmctKiwgbWF0LSogKi9cbiAgICAgIGlmICgvXihmb3JtLWNvbnRyb2x8aW5wdXQtfGNvbC18cm93fG5nLXxtYXQtfG1kYy18di18dnVlLXxhbnQtfGVsLXxwLXxidG58YmFkZ2V8dGV4dC18YmctfGJvcmRlci18c2hhZG93LXxyb3VuZGVkfGZsZXh8Z3JpZHxoaWRkZW58YmxvY2t8aW5saW5lfGNvbnRhaW5lcnx3cmFwcGVyfGZpZWxkfGdyb3VwfGNvbnRyb2x8ZGlydHl8cHJpc3RpbmV8dmFsaWR8aW52YWxpZHx0b3VjaGVkfHVudG91Y2hlZHxyZXF1aXJlZHxkaXNhYmxlZHxyZWFkb25seSkvLnRlc3QoY2xzKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgLyogR2FyZGVyIHNldWxlbWVudCBsZXMgY2xhc3NlcyBxdWkgcmVzc2VtYmxlbnQgXHUwMEUwIGRlcyBub21zIGRlIGNoYW1wcyAqL1xuICAgICAgcmV0dXJuIGNscy5sZW5ndGggPiAyICYmIGNscy5sZW5ndGggPCA0MDtcbiAgICB9KSxcbiAgXTtcblxuICAvKiBcdTI1MDBcdTI1MDAgTGFiZWwgdmlhIGZvcj0gXHUyNTAwXHUyNTAwICovXG4gIHZhciBsYWJlbEVsID0gZWwuaWQgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsYWJlbFtmb3I9XCInICsgQ1NTLmVzY2FwZShlbC5pZCkgKyAnXCJdJykgOiBudWxsO1xuXG4gIC8qIFx1MjUwMFx1MjUwMCBhcmlhLWxhYmVsbGVkYnkgKHBldXQgcG9pbnRlciB2ZXJzIHBsdXNpZXVycyBpZHMpIFx1MjUwMFx1MjUwMCAqL1xuICBpZiAoIWxhYmVsRWwpIHtcbiAgICB2YXIgbGFiZWxsZWRieSA9IGVsLmdldEF0dHJpYnV0ZShcImFyaWEtbGFiZWxsZWRieVwiKTtcbiAgICBpZiAobGFiZWxsZWRieSkge1xuICAgICAgdmFyIGxhYmVsVGV4dCA9IGxhYmVsbGVkYnkuc3BsaXQoL1xccysvKS5tYXAoZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgdmFyIHJlZiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgICAgICAgcmV0dXJuIHJlZiA/IHJlZi50ZXh0Q29udGVudC50cmltKCkgOiBcIlwiO1xuICAgICAgfSkuZmlsdGVyKEJvb2xlYW4pLmpvaW4oXCIgXCIpO1xuICAgICAgaWYgKGxhYmVsVGV4dCkgYXR0cnMucHVzaChsYWJlbFRleHQpO1xuICAgIH1cbiAgfVxuXG4gIC8qIFx1MjUwMFx1MjUwMCBBbmd1bGFyIE1hdGVyaWFsIG1hdC1mb3JtLWZpZWxkIFx1MjUwMFx1MjUwMCAqL1xuICBpZiAoIWxhYmVsRWwgJiYgZWwuY2xvc2VzdCkge1xuICAgIHZhciBtYXRGaWVsZCA9IGVsLmNsb3Nlc3QoXCJtYXQtZm9ybS1maWVsZCwgLm1hdC1mb3JtLWZpZWxkLCAubWF0LW1kYy1mb3JtLWZpZWxkXCIpO1xuICAgIGlmIChtYXRGaWVsZCkge1xuICAgICAgdmFyIG1hdExhYmVsID0gbWF0RmllbGQucXVlcnlTZWxlY3RvcihcIm1hdC1sYWJlbCwgbGFiZWwsIC5tYXQtbGFiZWwsIC5tYXQtbWRjLWZsb2F0aW5nLWxhYmVsXCIpO1xuICAgICAgaWYgKG1hdExhYmVsKSBsYWJlbEVsID0gbWF0TGFiZWw7XG4gICAgfVxuICB9XG5cbiAgLyogXHUyNTAwXHUyNTAwIExhYmVsIHBhcmVudCBkaXJlY3Qgb3Ugc2libGluZyBwclx1MDBFOWNcdTAwRTlkZW50IFx1MjUwMFx1MjUwMCAqL1xuICBpZiAoIWxhYmVsRWwgJiYgZWwuY2xvc2VzdCkge1xuICAgIGxhYmVsRWwgPSBlbC5jbG9zZXN0KFwibGFiZWxcIik7XG4gICAgaWYgKCFsYWJlbEVsICYmIGVsLnBhcmVudEVsZW1lbnQpIHtcbiAgICAgIGxhYmVsRWwgPSBlbC5wYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCJsYWJlbFwiKTtcbiAgICB9XG4gIH1cblxuICAvKiBcdTI1MDBcdTI1MDAgU2libGluZyBwclx1MDBFOWNcdTAwRTlkZW50IChsYWJlbC9zcGFuL2RpdiBhZGphY2VudCBkYW5zIGxlIERPTSkgXHUyNTAwXHUyNTAwICovXG4gIGlmICghbGFiZWxFbCkge1xuICAgIHZhciBwcmV2ID0gZWwucHJldmlvdXNFbGVtZW50U2libGluZztcbiAgICBpZiAocHJldiAmJiAvXihsYWJlbHxzcGFufGRpdnxwfHRofHRkfGR0fGxlZ2VuZCkkL2kudGVzdChwcmV2LnRhZ05hbWUpICYmIHByZXYudGV4dENvbnRlbnQudHJpbSgpLmxlbmd0aCA8IDYwKSB7XG4gICAgICBhdHRycy5wdXNoKHByZXYudGV4dENvbnRlbnQudHJpbSgpKTtcbiAgICB9XG4gIH1cblxuICAvKiBcdTI1MDBcdTI1MDAgQ2VsbHVsZSBkZSB0YWJsZWF1IHByXHUwMEU5Y1x1MDBFOWRlbnRlICh2aWV1eCBwb3J0YWlscyB0eXBlIEFsbWVyeXMvVmlhbWVkaXMpIFx1MjUwMFx1MjUwMCAqL1xuICBpZiAoIWxhYmVsRWwpIHtcbiAgICB2YXIgdGQgPSBlbC5jbG9zZXN0KFwidGRcIik7XG4gICAgaWYgKHRkKSB7XG4gICAgICB2YXIgcHJldlRkID0gdGQucHJldmlvdXNFbGVtZW50U2libGluZztcbiAgICAgIGlmIChwcmV2VGQpIGF0dHJzLnB1c2gocHJldlRkLnRleHRDb250ZW50LnRyaW0oKSk7XG4gICAgfVxuICB9XG5cbiAgLyogXHUyNTAwXHUyNTAwIDxsZWdlbmQ+IGR1IGZpZWxkc2V0IHBhcmVudCBcdTI1MDBcdTI1MDAgKi9cbiAgaWYgKCFsYWJlbEVsICYmIGVsLmNsb3Nlc3QpIHtcbiAgICB2YXIgZmllbGRzZXQgPSBlbC5jbG9zZXN0KFwiZmllbGRzZXRcIik7XG4gICAgaWYgKGZpZWxkc2V0KSB7XG4gICAgICB2YXIgbGVnZW5kID0gZmllbGRzZXQucXVlcnlTZWxlY3RvcihcImxlZ2VuZFwiKTtcbiAgICAgIGlmIChsZWdlbmQpIGF0dHJzLnB1c2gobGVnZW5kLnRleHRDb250ZW50LnRyaW0oKSk7XG4gICAgfVxuICB9XG5cbiAgLyogXHUyNTAwXHUyNTAwIDx0aD4gZGUgbGEgbGlnbmUgKHRhYmxlYXV4IGRlIGZvcm11bGFpcmVzKSBcdTI1MDBcdTI1MDAgKi9cbiAgaWYgKCFsYWJlbEVsKSB7XG4gICAgdmFyIHRyID0gZWwuY2xvc2VzdCAmJiBlbC5jbG9zZXN0KFwidHJcIik7XG4gICAgaWYgKHRyKSB7XG4gICAgICB2YXIgdGggPSB0ci5xdWVyeVNlbGVjdG9yKFwidGhcIik7XG4gICAgICBpZiAodGgpIGF0dHJzLnB1c2godGgudGV4dENvbnRlbnQudHJpbSgpKTtcbiAgICB9XG4gIH1cblxuICBpZiAobGFiZWxFbCkgYXR0cnMucHVzaChsYWJlbEVsLnRleHRDb250ZW50LnRyaW0oKSk7XG5cbiAgLyogXHUyNTAwXHUyNTAwIE1hdGNoaW5nIFx1MjUwMFx1MjUwMCAqL1xuICB2YXIgYXR0clZhbHVlcyA9IGF0dHJzLmZpbHRlcihCb29sZWFuKTtcbiAgdmFyIG5vcm1hbGl6ZWRBbGwgPSBhdHRyVmFsdWVzLm1hcChub3JtYWxpemVBbGlhcykuam9pbihcIiBcIik7XG4gIGlmICghbm9ybWFsaXplZEFsbC50cmltKCkpIHJldHVybiBudWxsO1xuXG4gIGZvciAodmFyIGZpZWxkIGluIFNNQVJUX0ZJTExfQUxJQVNFUykge1xuICAgIHZhciBhbGlhc2VzID0gU01BUlRfRklMTF9BTElBU0VTW2ZpZWxkXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFsaWFzZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBhbGlhcyA9IG5vcm1hbGl6ZUFsaWFzKGFsaWFzZXNbaV0pO1xuICAgICAgaWYgKCFhbGlhcykgY29udGludWU7XG4gICAgICAvKiBFeGFjdCBtYXRjaCBzdXIgdW4gYXR0cmlidXQgaW5kaXZpZHVlbCAqL1xuICAgICAgdmFyIGV4YWN0TWF0Y2ggPSBhdHRyVmFsdWVzLnNvbWUoZnVuY3Rpb24oYSkgeyByZXR1cm4gbm9ybWFsaXplQWxpYXMoYSkgPT09IGFsaWFzOyB9KTtcbiAgICAgIC8qIFBhcnRpYWwgbWF0Y2ggZFx1MDBFOWxpbWl0XHUwMEU5IChcdTAwRTl2aXRlIFwibm9tXCIgZGFucyBcInByZW5vbVwiKSAqL1xuICAgICAgdmFyIHBhcnRpYWxNYXRjaCA9IGZhbHNlO1xuICAgICAgaWYgKCFleGFjdE1hdGNoKSB7XG4gICAgICAgIHZhciByZSA9IG5ldyBSZWdFeHAoXCIoXnxbXFxcXHNfXFxcXC1dKVwiICsgYWxpYXMucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csIFwiXFxcXCQmXCIpICsgXCIoW1xcXFxzX1xcXFwtXXwkKVwiKTtcbiAgICAgICAgcGFydGlhbE1hdGNoID0gcmUudGVzdChub3JtYWxpemVkQWxsKTtcbiAgICAgIH1cbiAgICAgIGlmIChleGFjdE1hdGNoKSByZXR1cm4geyBmaWVsZDogZmllbGQsIGNvbmZpZGVuY2U6IFwiY2VydGFpblwiIH07XG4gICAgICBpZiAocGFydGlhbE1hdGNoKSByZXR1cm4geyBmaWVsZDogZmllbGQsIGNvbmZpZGVuY2U6IFwicHJvYmFibGVcIiB9O1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cbiIsICIvKiBcdTI1MDBcdTI1MDAgU2VsZWN0b3IgQ2FjaGUgcGVyIHBvcnRhbCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cblxuZXhwb3J0IGxldCBfc2VsZWN0b3JDYWNoZSA9IHt9O1xudmFyIF9zZWxlY3RvckNhY2hlRGlydHkgPSBmYWxzZTtcbnZhciBfc2VsZWN0b3JDYWNoZUxhc3RTYXZlID0gMDtcblxudmFyIFNFTEVDVE9SX0NBQ0hFX1RUTCA9IDI0ICogNjAgKiA2MCAqIDEwMDA7IC8vIDI0aFxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2FjaGVkU2VsZWN0b3IoaG9zdG5hbWUsIGZpZWxkTmFtZSkge1xuICBpZiAoIV9zZWxlY3RvckNhY2hlW2hvc3RuYW1lXSkgcmV0dXJuIG51bGw7XG4gIHZhciBlbnRyeSA9IF9zZWxlY3RvckNhY2hlW2hvc3RuYW1lXVtmaWVsZE5hbWVdO1xuICBpZiAoIWVudHJ5KSByZXR1cm4gbnVsbDtcbiAgLyogQmFja3dhcmQgY29tcGF0IDogYW5jaWVucyBjYWNoZXMgc2FucyB0aW1lc3RhbXAgKi9cbiAgaWYgKHR5cGVvZiBlbnRyeSA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIGVudHJ5O1xuICAvKiBUVEwgY2hlY2sgKi9cbiAgaWYgKERhdGUubm93KCkgLSBlbnRyeS50cyA+IFNFTEVDVE9SX0NBQ0hFX1RUTCkge1xuICAgIGRlbGV0ZSBfc2VsZWN0b3JDYWNoZVtob3N0bmFtZV1bZmllbGROYW1lXTtcbiAgICBfc2VsZWN0b3JDYWNoZURpcnR5ID0gdHJ1ZTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4gZW50cnkuc2VsZWN0b3I7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRDYWNoZWRTZWxlY3Rvcihob3N0bmFtZSwgZmllbGROYW1lLCBzZWxlY3Rvcikge1xuICBpZiAoIV9zZWxlY3RvckNhY2hlW2hvc3RuYW1lXSkgX3NlbGVjdG9yQ2FjaGVbaG9zdG5hbWVdID0ge307XG4gIF9zZWxlY3RvckNhY2hlW2hvc3RuYW1lXVtmaWVsZE5hbWVdID0geyBzZWxlY3Rvcjogc2VsZWN0b3IsIHRzOiBEYXRlLm5vdygpIH07XG4gIF9zZWxlY3RvckNhY2hlRGlydHkgPSB0cnVlO1xuICB2YXIgbm93ID0gRGF0ZS5ub3coKTtcbiAgaWYgKG5vdyAtIF9zZWxlY3RvckNhY2hlTGFzdFNhdmUgPiAxMDAwMCkge1xuICAgIHNhdmVTZWxlY3RvckNhY2hlKCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFuU2VsZWN0b3JDYWNoZSgpIHtcbiAgdmFyIG5vdyA9IERhdGUubm93KCk7XG4gIHZhciBjaGFuZ2VkID0gZmFsc2U7XG4gIE9iamVjdC5rZXlzKF9zZWxlY3RvckNhY2hlKS5mb3JFYWNoKGZ1bmN0aW9uKGhvc3RuYW1lKSB7XG4gICAgT2JqZWN0LmtleXMoX3NlbGVjdG9yQ2FjaGVbaG9zdG5hbWVdKS5mb3JFYWNoKGZ1bmN0aW9uKGZpZWxkTmFtZSkge1xuICAgICAgdmFyIGVudHJ5ID0gX3NlbGVjdG9yQ2FjaGVbaG9zdG5hbWVdW2ZpZWxkTmFtZV07XG4gICAgICBpZiAodHlwZW9mIGVudHJ5ID09PSBcIm9iamVjdFwiICYmIGVudHJ5LnRzICYmIG5vdyAtIGVudHJ5LnRzID4gU0VMRUNUT1JfQ0FDSEVfVFRMKSB7XG4gICAgICAgIGRlbGV0ZSBfc2VsZWN0b3JDYWNoZVtob3N0bmFtZV1bZmllbGROYW1lXTtcbiAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKE9iamVjdC5rZXlzKF9zZWxlY3RvckNhY2hlW2hvc3RuYW1lXSkubGVuZ3RoID09PSAwKSB7XG4gICAgICBkZWxldGUgX3NlbGVjdG9yQ2FjaGVbaG9zdG5hbWVdO1xuICAgIH1cbiAgfSk7XG4gIGlmIChjaGFuZ2VkKSBfc2VsZWN0b3JDYWNoZURpcnR5ID0gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRTZWxlY3RvckNhY2hlKCkge1xuICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoW1wiYXVkaWJvdF9zZWxlY3Rvcl9jYWNoZVwiXSwgZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgX3NlbGVjdG9yQ2FjaGUgPSByZXN1bHQuYXVkaWJvdF9zZWxlY3Rvcl9jYWNoZSB8fCB7fTtcbiAgICBjbGVhblNlbGVjdG9yQ2FjaGUoKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzYXZlU2VsZWN0b3JDYWNoZSgpIHtcbiAgaWYgKCFfc2VsZWN0b3JDYWNoZURpcnR5KSByZXR1cm47XG4gIF9zZWxlY3RvckNhY2hlRGlydHkgPSBmYWxzZTtcbiAgX3NlbGVjdG9yQ2FjaGVMYXN0U2F2ZSA9IERhdGUubm93KCk7XG4gIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7IGF1ZGlib3Rfc2VsZWN0b3JfY2FjaGU6IF9zZWxlY3RvckNhY2hlIH0pO1xufVxuIiwgIi8qIFx1MjUwMFx1MjUwMCBGaWxsIFV0aWxpdHkgRnVuY3Rpb25zIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuXG5pbXBvcnQgeyBub3JtYWxpemVEYXRlVmFsdWUsIGZpZWxkSGFzVmFsdWUgfSBmcm9tIFwiLi9mb3JtYXQuanNcIjtcbmltcG9ydCB7IGxldmVuc2h0ZWluIH0gZnJvbSBcIi4vZmllbGQtbWF0Y2hpbmcuanNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIHVsdHJhRmlsbChlbCwgdmFsLCBvcHRzKSB7XG4gIGlmICghZWwgfHwgdmFsID09PSB1bmRlZmluZWQgfHwgdmFsID09PSBudWxsIHx8IHZhbCA9PT0gXCJcIikgcmV0dXJuO1xuICAvKiBTa2lwIHNpIGxlIGNoYW1wIGEgZFx1MDBFOWpcdTAwRTAgdW5lIHZhbGV1ciAoc2F1ZiBzaSBmb3JjZTogdHJ1ZSkgKi9cbiAgaWYgKCEob3B0cyAmJiBvcHRzLmZvcmNlKSkge1xuICAgIHZhciBleGlzdGluZyA9IChlbC52YWx1ZSB8fCBcIlwiKS50cmltKCk7XG4gICAgaWYgKGV4aXN0aW5nLmxlbmd0aCA+IDApIHJldHVybjtcbiAgfVxuICBlbC5mb2N1cygpO1xuXG4gIC8qIFNldHRlciBuYXRpZiBwb3VyIGNvbnRvdXJuZXIgVnVlIDMgLyBSZWFjdCBxdWkgb3ZlcnJpZGUgLnZhbHVlICovXG4gIHZhciBwcm90byA9IGVsIGluc3RhbmNlb2YgSFRNTFRleHRBcmVhRWxlbWVudCA/IEhUTUxUZXh0QXJlYUVsZW1lbnQucHJvdG90eXBlXG4gICAgICAgICAgICA6IGVsIGluc3RhbmNlb2YgSFRNTFNlbGVjdEVsZW1lbnQgPyBIVE1MU2VsZWN0RWxlbWVudC5wcm90b3R5cGVcbiAgICAgICAgICAgIDogSFRNTElucHV0RWxlbWVudC5wcm90b3R5cGU7XG4gIHZhciBuYXRpdmVTZXR0ZXIgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHByb3RvLCAndmFsdWUnKTtcbiAgaWYgKG5hdGl2ZVNldHRlciAmJiBuYXRpdmVTZXR0ZXIuc2V0KSB7XG4gICAgbmF0aXZlU2V0dGVyLnNldC5jYWxsKGVsLCB2YWwpO1xuICB9IGVsc2Uge1xuICAgIGVsLnZhbHVlID0gdmFsO1xuICB9XG5cbiAgLyogU2ltdWxlciB1bmUgdnJhaWUgZnJhcHBlIHBvdXIgUmVhY3QvVnVlIChrZXlkb3duICsgaW5wdXQgKyBrZXl1cCBwYXIgY2FyYWN0XHUwMEU4cmUpICovXG4gIHZhciBzdHJWYWwgPSBTdHJpbmcodmFsKTtcbiAgZWwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2ZvY3VzJywgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHJWYWwubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgY2ggPSBzdHJWYWxbaV07XG4gICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgS2V5Ym9hcmRFdmVudCgna2V5ZG93bicsIHsgYnViYmxlczogdHJ1ZSwga2V5OiBjaCwgY2hhckNvZGU6IGNoLmNoYXJDb2RlQXQoMCksIGtleUNvZGU6IGNoLmNoYXJDb2RlQXQoMCkgfSkpO1xuICAgIGVsLmRpc3BhdGNoRXZlbnQobmV3IEtleWJvYXJkRXZlbnQoJ2tleXByZXNzJywgeyBidWJibGVzOiB0cnVlLCBrZXk6IGNoLCBjaGFyQ29kZTogY2guY2hhckNvZGVBdCgwKSwga2V5Q29kZTogY2guY2hhckNvZGVBdCgwKSB9KSk7XG4gICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgS2V5Ym9hcmRFdmVudCgna2V5dXAnLCB7IGJ1YmJsZXM6IHRydWUsIGtleTogY2gsIGNoYXJDb2RlOiBjaC5jaGFyQ29kZUF0KDApLCBrZXlDb2RlOiBjaC5jaGFyQ29kZUF0KDApIH0pKTtcbiAgfVxuICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBJbnB1dEV2ZW50KCdpbnB1dCcsIHsgYnViYmxlczogdHJ1ZSwgZGF0YTogc3RyVmFsLCBpbnB1dFR5cGU6ICdpbnNlcnRUZXh0JyB9KSk7XG4gIGVsLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjaGFuZ2UnLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnYmx1cicsIHsgYnViYmxlczogdHJ1ZSB9KSk7XG5cbiAgaWYgKHdpbmRvdy4kICYmIHdpbmRvdy4kKGVsKS50cmlnZ2VyKSB7XG4gICAgd2luZG93LiQoZWwpLnZhbCh2YWwpLnRyaWdnZXIoJ2lucHV0JykudHJpZ2dlcignY2hhbmdlJykudHJpZ2dlcigna2V5dXAnKTtcbiAgfVxufVxuXG4vKipcbiAqIFRlbnRlIGRlIHJlbXBsaXIgdW4gY2hhbXAuIFNpIGxlIHNcdTAwRTlsZWN0ZXVyIG5lIHRyb3V2ZSByaWVuLFxuICogb2JzZXJ2ZSBsZSBET00gcGVuZGFudCAzcyBldCByXHUwMEU5ZXNzYWllIGRcdTAwRThzIHF1J3VuIGNoYW1wIGFwcGFyYVx1MDBFRXQuXG4gKiBVdGlsZSBwb3VyIGxlcyBTUEEgUmVhY3QvTmV4dC9Bbmd1bGFyIG9cdTAwRjkgbGVzIGNoYW1wcyBhcnJpdmVudCBlbiBhc3luYy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVsdHJhRmlsbFdpdGhSZXRyeShzZWxlY3RvciwgdmFsdWUsIG9wdHMpIHtcbiAgdmFyIGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gIGlmIChlbCkgeyB1bHRyYUZpbGwoZWwsIHZhbHVlLCBvcHRzKTsgcmV0dXJuOyB9XG5cbiAgdmFyIHRpbWVvdXQ7XG4gIHZhciBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uKCkge1xuICAgIHZhciBmb3VuZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgIGlmIChmb3VuZCkge1xuICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgdWx0cmFGaWxsKGZvdW5kLCB2YWx1ZSwgb3B0cyk7XG4gICAgfVxuICB9KTtcblxuICBvYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHsgY2hpbGRMaXN0OiB0cnVlLCBzdWJ0cmVlOiB0cnVlIH0pO1xuXG4gIC8qIEF1dG8tZGlzY29ubmVjdCBhcHJcdTAwRThzIDNzIHBvdXIgXHUwMEU5dml0ZXIgbGVzIGZ1aXRlcyBtXHUwMEU5bW9pcmUgKi9cbiAgdGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICB9LCAzMDAwKTtcbn1cblxuLyogXHUyNTAwXHUyNTAwIHNtYXJ0U2VsZWN0T3B0aW9uKCkgXHUyMDE0IGZ1enp5IG1hdGNoaW5nIHBvdXIgPHNlbGVjdD4gXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG5leHBvcnQgZnVuY3Rpb24gc21hcnRTZWxlY3RPcHRpb24oc2VsZWN0RWwsIHRhcmdldFZhbHVlKSB7XG4gIGlmICghc2VsZWN0RWwgfHwgc2VsZWN0RWwudGFnTmFtZSAhPT0gXCJTRUxFQ1RcIiB8fCAhdGFyZ2V0VmFsdWUpIHJldHVybiBmYWxzZTtcbiAgdmFyIHRhcmdldCA9ICh0YXJnZXRWYWx1ZSArIFwiXCIpLnRvTG93ZXJDYXNlKCkubm9ybWFsaXplKFwiTkZEXCIpLnJlcGxhY2UoL1tcXHUwMzAwLVxcdTAzNmZdL2csIFwiXCIpLnRyaW0oKTtcbiAgdmFyIG9wdGlvbnMgPSBBcnJheS5mcm9tKHNlbGVjdEVsLm9wdGlvbnMpO1xuICB2YXIgYmVzdFNjb3JlID0gMDtcbiAgdmFyIGJlc3RPcHRpb24gPSBudWxsO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgb3B0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBvcHRUZXh0ID0gKG9wdGlvbnNbaV0udGV4dCB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpLm5vcm1hbGl6ZShcIk5GRFwiKS5yZXBsYWNlKC9bXFx1MDMwMC1cXHUwMzZmXS9nLCBcIlwiKS50cmltKCk7XG4gICAgdmFyIG9wdFZhbCA9IChvcHRpb25zW2ldLnZhbHVlIHx8IFwiXCIpLnRvTG93ZXJDYXNlKCkubm9ybWFsaXplKFwiTkZEXCIpLnJlcGxhY2UoL1tcXHUwMzAwLVxcdTAzNmZdL2csIFwiXCIpLnRyaW0oKTtcbiAgICB2YXIgc2NvcmUgPSAwO1xuXG4gICAgLyogRXhhY3QgbWF0Y2ggPSAxMDBwdHMgKi9cbiAgICBpZiAob3B0VGV4dCA9PT0gdGFyZ2V0IHx8IG9wdFZhbCA9PT0gdGFyZ2V0KSB7IHNjb3JlID0gMTAwOyB9XG4gICAgLyogQ29udGFpbnMgPSA4MHB0cyAqL1xuICAgIGVsc2UgaWYgKG9wdFRleHQuaW5kZXhPZih0YXJnZXQpICE9PSAtMSB8fCB0YXJnZXQuaW5kZXhPZihvcHRUZXh0KSAhPT0gLTEpIHsgc2NvcmUgPSA4MDsgfVxuICAgIGVsc2UgaWYgKG9wdFZhbC5pbmRleE9mKHRhcmdldCkgIT09IC0xIHx8IHRhcmdldC5pbmRleE9mKG9wdFZhbCkgIT09IC0xKSB7IHNjb3JlID0gODA7IH1cbiAgICAvKiBMZXZlbnNodGVpbiA8PSAzID0gNjBwdHMgKi9cbiAgICBlbHNlIHtcbiAgICAgIHZhciBkaXN0ID0gbGV2ZW5zaHRlaW4ob3B0VGV4dCwgdGFyZ2V0KTtcbiAgICAgIGlmIChkaXN0IDw9IDMpIHNjb3JlID0gNjA7XG4gICAgICBlbHNlIHtcbiAgICAgICAgZGlzdCA9IGxldmVuc2h0ZWluKG9wdFZhbCwgdGFyZ2V0KTtcbiAgICAgICAgaWYgKGRpc3QgPD0gMykgc2NvcmUgPSA2MDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc2NvcmUgPiBiZXN0U2NvcmUpIHsgYmVzdFNjb3JlID0gc2NvcmU7IGJlc3RPcHRpb24gPSBvcHRpb25zW2ldOyB9XG4gICAgaWYgKHNjb3JlID09PSAxMDApIGJyZWFrO1xuICB9XG5cbiAgaWYgKGJlc3RTY29yZSA+PSA0MCAmJiBiZXN0T3B0aW9uKSB7XG4gICAgc2VsZWN0RWwudmFsdWUgPSBiZXN0T3B0aW9uLnZhbHVlO1xuICAgIHNlbGVjdEVsLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiY2hhbmdlXCIsIHsgYnViYmxlczogdHJ1ZSB9KSk7XG4gICAgc2VsZWN0RWwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJpbnB1dFwiLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyogXHUyNTAwXHUyNTAwIGZpbGxEYXRlUGlja2VyKCkgXHUyMDE0IHN1cHBvcnQgZGF0ZXBpY2tlciBsaWJyYXJpZXMgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmlsbERhdGVQaWNrZXIoZWwsIGRhdGVTdHIpIHtcbiAgaWYgKCFlbCB8fCAhZGF0ZVN0cikgcmV0dXJuIGZhbHNlO1xuXG4gIC8qIDEuIEZsYXRwaWNrciAqL1xuICB0cnkge1xuICAgIGlmIChlbC5fZmxhdHBpY2tyICYmIGVsLl9mbGF0cGlja3Iuc2V0RGF0ZSkge1xuICAgICAgZWwuX2ZsYXRwaWNrci5zZXREYXRlKGRhdGVTdHIsIHRydWUpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9IGNhdGNoKGUpIHt9XG5cbiAgLyogMi4gUGlrYWRheSAqL1xuICB0cnkge1xuICAgIGlmIChlbC5fcGlrYWRheSAmJiBlbC5fcGlrYWRheS5zZXREYXRlKSB7XG4gICAgICB2YXIgcGFydHMgPSBkYXRlU3RyLm1hdGNoKC8oXFxkezJ9KVtcXC9cXC1dKFxcZHsyfSlbXFwvXFwtXShcXGR7NH0pLyk7XG4gICAgICBpZiAocGFydHMpIHtcbiAgICAgICAgZWwuX3Bpa2FkYXkuc2V0RGF0ZShuZXcgRGF0ZShwYXJzZUludChwYXJ0c1szXSksIHBhcnNlSW50KHBhcnRzWzJdKSAtIDEsIHBhcnNlSW50KHBhcnRzWzFdKSkpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2goZSkge31cblxuICAvKiAzLiBqUXVlcnkgVUkgZGF0ZXBpY2tlciAqL1xuICB0cnkge1xuICAgIGlmICh3aW5kb3cualF1ZXJ5ICYmIHdpbmRvdy5qUXVlcnkoZWwpLmRhdGVwaWNrZXIpIHtcbiAgICAgIHdpbmRvdy5qUXVlcnkoZWwpLmRhdGVwaWNrZXIoXCJzZXREYXRlXCIsIGRhdGVTdHIpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9IGNhdGNoKGUpIHt9XG5cbiAgLyogNC4gQW5ndWxhciBNYXRlcmlhbCBtYXQtZm9ybS1maWVsZCBcdTIwMTQgZnJhcHBlIGxlbnRlIGNhcmFjdFx1MDBFOHJlIHBhciBjYXJhY3RcdTAwRThyZSAqL1xuICB0cnkge1xuICAgIHZhciBtYXRGaWVsZCA9IGVsLmNsb3Nlc3QgJiYgZWwuY2xvc2VzdChcIm1hdC1mb3JtLWZpZWxkLCAubWF0LWZvcm0tZmllbGQsIC5tYXQtbWRjLWZvcm0tZmllbGRcIik7XG4gICAgaWYgKG1hdEZpZWxkKSB7XG4gICAgICBlbC5mb2N1cygpO1xuICAgICAgZWwuY2xpY2soKTtcbiAgICAgIGVsLnZhbHVlID0gXCJcIjtcbiAgICAgIGVsLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiaW5wdXRcIiwgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgICAgIHZhciBjaGFycyA9IGRhdGVTdHIucmVwbGFjZSgvXFxEL2csIFwiXCIpO1xuICAgICAgZm9yICh2YXIgY2kgPSAwOyBjaSA8IGNoYXJzLmxlbmd0aDsgY2krKykge1xuICAgICAgICB2YXIgY2ggPSBjaGFyc1tjaV07XG4gICAgICAgIGVsLmRpc3BhdGNoRXZlbnQobmV3IEtleWJvYXJkRXZlbnQoXCJrZXlkb3duXCIsIHsgYnViYmxlczogdHJ1ZSwga2V5OiBjaCwgY29kZTogXCJEaWdpdFwiICsgY2gsIGtleUNvZGU6IDQ4ICsgcGFyc2VJbnQoY2gpIH0pKTtcbiAgICAgICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgS2V5Ym9hcmRFdmVudChcImtleXByZXNzXCIsIHsgYnViYmxlczogdHJ1ZSwga2V5OiBjaCwgY2hhckNvZGU6IGNoLmNoYXJDb2RlQXQoMCkgfSkpO1xuICAgICAgICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBJbnB1dEV2ZW50KFwiaW5wdXRcIiwgeyBidWJibGVzOiB0cnVlLCBkYXRhOiBjaCwgaW5wdXRUeXBlOiBcImluc2VydFRleHRcIiB9KSk7XG4gICAgICAgIGVsLmRpc3BhdGNoRXZlbnQobmV3IEtleWJvYXJkRXZlbnQoXCJrZXl1cFwiLCB7IGJ1YmJsZXM6IHRydWUsIGtleTogY2gsIGNvZGU6IFwiRGlnaXRcIiArIGNoLCBrZXlDb2RlOiA0OCArIHBhcnNlSW50KGNoKSB9KSk7XG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHIpIHsgc2V0VGltZW91dChyLCA2MCk7IH0pO1xuICAgICAgfVxuICAgICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJjaGFuZ2VcIiwgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgICAgIGVsLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiYmx1clwiLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgICAgaWYgKGVsLnZhbHVlICE9PSBcIlwiKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0gY2F0Y2goZSkge31cblxuICAvKiA1LiBGYWxsYmFjayB1bHRyYUZpbGwgKi9cbiAgdWx0cmFGaWxsKGVsLCBkYXRlU3RyKTtcbiAgcmV0dXJuIChlbC52YWx1ZSB8fCBcIlwiKSAhPT0gXCJcIjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdFJhZGl4T3B0aW9uKHNlbGVjdE5hbWUsIHZhbHVlKSB7XG4gIC8qIFJhZGl4IFZ1ZSA6IGNsaXF1ZXIgbGUgdHJpZ2dlciBwdWlzIGwnb3B0aW9uIGRhbnMgbGUgcG9ydGFsICovXG4gIGNvbnN0IGhpZGRlblNlbGVjdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdFtuYW1lPVwiJyArIHNlbGVjdE5hbWUgKyAnXCJdJyk7XG4gIGlmICghaGlkZGVuU2VsZWN0KSByZXR1cm47XG4gIGNvbnN0IGZvcm1GaWVsZCA9IGhpZGRlblNlbGVjdC5jbG9zZXN0KFwiLnNwYWNlLXktMlwiKTtcbiAgaWYgKCFmb3JtRmllbGQpIHJldHVybjtcbiAgY29uc3QgdHJpZ2dlciA9IGZvcm1GaWVsZC5xdWVyeVNlbGVjdG9yKCdbcm9sZT1cImNvbWJvYm94XCJdJyk7XG4gIGlmICghdHJpZ2dlcikgcmV0dXJuO1xuICB0cmlnZ2VyLmNsaWNrKCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFsbE9wdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbcm9sZT1cIm9wdGlvblwiXScpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYWxsT3B0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIG9wdCA9IGFsbE9wdGlvbnNbaV07XG4gICAgICB2YXIgb3B0VmFsdWUgPSBvcHQuZ2V0QXR0cmlidXRlKFwiZGF0YS12YWx1ZVwiKSB8fCBcIlwiO1xuICAgICAgdmFyIG9wdFRleHQgPSAob3B0LnRleHRDb250ZW50IHx8IFwiXCIpLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKG9wdFZhbHVlID09PSB2YWx1ZSB8fCBvcHRUZXh0ID09PSB2YWx1ZSkge1xuICAgICAgICBvcHQuY2xpY2soKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICAvKiBGYWxsYmFjayA6IGVzc2FpIHZpYSBsZSBoaWRkZW4gc2VsZWN0IG5hdGlmICovXG4gICAgaGlkZGVuU2VsZWN0LnZhbHVlID0gdmFsdWU7XG4gICAgaGlkZGVuU2VsZWN0LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiY2hhbmdlXCIsIHsgYnViYmxlczogdHJ1ZSB9KSk7XG4gIH0sIDMwMCk7XG59XG5cbi8qIFRlbnRlIGRlIHJlbXBsaXIgdW4gY2hhbXAgYXZlYyB0b3V0ZXMgbGVzIHN0cmF0XHUwMEU5Z2llcyBkaXNwb25pYmxlcyAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNtYXJ0RmlsbEZpZWxkKGVsLCB2YWx1ZSwgaXNEYXRlRmllbGQpIHtcbiAgaWYgKCFlbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsIHx8IFN0cmluZyh2YWx1ZSkudHJpbSgpID09PSBcIlwiKSByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIGRhdGVOb3JtID0gaXNEYXRlRmllbGQgPyBub3JtYWxpemVEYXRlVmFsdWUodmFsdWUpIDogbnVsbDtcbiAgdmFyIGRpc3BsYXlWYWwgPSBkYXRlTm9ybSA/IGRhdGVOb3JtLmRpc3BsYXkgOiBTdHJpbmcodmFsdWUpO1xuXG4gIC8qIFx1MjUwMFx1MjUwMCBTRUxFQ1QgXHUyMTkyIHNtYXJ0U2VsZWN0T3B0aW9uIGZ1enp5IFx1MjUwMFx1MjUwMCAqL1xuICBpZiAoZWwudGFnTmFtZSA9PT0gXCJTRUxFQ1RcIikge1xuICAgIHJldHVybiBzbWFydFNlbGVjdE9wdGlvbihlbCwgZGlzcGxheVZhbCk7XG4gIH1cblxuICAvKiBcdTI1MDBcdTI1MDAgRGF0ZSBwaWNrZXIgbGlicmFyaWVzIChGbGF0cGlja3IsIFBpa2FkYXksIGpRdWVyeSBVSSwgQW5ndWxhciBNYXRlcmlhbCkgXHUyNTAwXHUyNTAwICovXG4gIGlmIChpc0RhdGVGaWVsZCkge1xuICAgIHRyeSB7XG4gICAgICB2YXIgZHBSZXN1bHQgPSBhd2FpdCBmaWxsRGF0ZVBpY2tlcihlbCwgZGlzcGxheVZhbCk7XG4gICAgICBpZiAoZHBSZXN1bHQpIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2goZSkge31cbiAgfVxuXG4gIC8qIFx1MjUwMFx1MjUwMCBTdHJhdFx1MDBFOWdpZSAwIDogaW5wdXRbdHlwZT1kYXRlXSBcdTIxOTIgZm9ybWF0IElTTyBkaXJlY3QgXHUyNTAwXHUyNTAwICovXG4gIGlmIChlbC50eXBlID09PSBcImRhdGVcIiAmJiBkYXRlTm9ybSAmJiBkYXRlTm9ybS5pc28pIHtcbiAgICB0cnkge1xuICAgICAgdmFyIHNldHRlcjAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKEhUTUxJbnB1dEVsZW1lbnQucHJvdG90eXBlLCBcInZhbHVlXCIpO1xuICAgICAgaWYgKHNldHRlcjAgJiYgc2V0dGVyMC5zZXQpIHNldHRlcjAuc2V0LmNhbGwoZWwsIGRhdGVOb3JtLmlzbyk7XG4gICAgICBlbHNlIGVsLnZhbHVlID0gZGF0ZU5vcm0uaXNvO1xuICAgICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJpbnB1dFwiLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJjaGFuZ2VcIiwgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgICAgIGlmIChmaWVsZEhhc1ZhbHVlKGVsLCBkYXRlTm9ybS5pc28pKSByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoKGUpIHt9XG4gIH1cblxuICAvKiBcdTI1MDBcdTI1MDAgU3RyYXRcdTAwRTlnaWUgMSA6IHVsdHJhRmlsbCBzdGFuZGFyZCAobmF0aWYgc2V0dGVyICsgZXZlbnRzICsgalF1ZXJ5KSBcdTI1MDBcdTI1MDAgKi9cbiAgdHJ5IHtcbiAgICB1bHRyYUZpbGwoZWwsIGRpc3BsYXlWYWwpO1xuICAgIGlmIChmaWVsZEhhc1ZhbHVlKGVsLCBkaXNwbGF5VmFsKSkgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2goZSkge31cblxuICAvKiBcdTI1MDBcdTI1MDAgU3RyYXRcdTAwRTlnaWUgMiA6IHNldEF0dHJpYnV0ZSB2YWx1ZSArIGRpc3BhdGNoRXZlbnQgSW5wdXRFdmVudCBcdTI1MDBcdTI1MDAgKi9cbiAgdHJ5IHtcbiAgICBlbC5zZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiLCBkaXNwbGF5VmFsKTtcbiAgICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBJbnB1dEV2ZW50KFwiaW5wdXRcIiwgeyBidWJibGVzOiB0cnVlLCBkYXRhOiBkaXNwbGF5VmFsLCBpbnB1dFR5cGU6IFwiaW5zZXJ0VGV4dFwiIH0pKTtcbiAgICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImNoYW5nZVwiLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgIGlmIChmaWVsZEhhc1ZhbHVlKGVsLCBkaXNwbGF5VmFsKSkgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2goZSkge31cblxuICAvKiBcdTI1MDBcdTI1MDAgU3RyYXRcdTAwRTlnaWUgMyA6IGRvY3VtZW50LmV4ZWNDb21tYW5kIChkZXByZWNhdGVkIG1haXMgbWFyY2hlIGVuY29yZSBzdXIgY2VydGFpbnMgcG9ydGFpbHMpIFx1MjUwMFx1MjUwMCAqL1xuICB0cnkge1xuICAgIGVsLmZvY3VzKCk7XG4gICAgZWwuc2VsZWN0KCk7XG4gICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJzZWxlY3RBbGxcIiwgZmFsc2UsIG51bGwpO1xuICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKFwiaW5zZXJ0VGV4dFwiLCBmYWxzZSwgZGlzcGxheVZhbCk7XG4gICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJjaGFuZ2VcIiwgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgICBpZiAoZmllbGRIYXNWYWx1ZShlbCwgZGlzcGxheVZhbCkpIHJldHVybiB0cnVlO1xuICB9IGNhdGNoKGUpIHt9XG5cbiAgLyogXHUyNTAwXHUyNTAwIFN0cmF0XHUwMEU5Z2llIDQgOiBQYXN0ZSBldmVudCAoY2VydGFpbnMgZnJhbWV3b3JrcyBuJ1x1MDBFOWNvdXRlbnQgcXVlIFx1MDBFN2EpIFx1MjUwMFx1MjUwMCAqL1xuICB0cnkge1xuICAgIGVsLmZvY3VzKCk7XG4gICAgdmFyIGR0ID0gbmV3IERhdGFUcmFuc2ZlcigpO1xuICAgIGR0LnNldERhdGEoXCJ0ZXh0L3BsYWluXCIsIGRpc3BsYXlWYWwpO1xuICAgIHZhciBwYXN0ZUV2dCA9IG5ldyBDbGlwYm9hcmRFdmVudChcInBhc3RlXCIsIHsgYnViYmxlczogdHJ1ZSwgY2FuY2VsYWJsZTogdHJ1ZSwgY2xpcGJvYXJkRGF0YTogZHQgfSk7XG4gICAgZWwuZGlzcGF0Y2hFdmVudChwYXN0ZUV2dCk7XG4gICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJpbnB1dFwiLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgIGVsLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiY2hhbmdlXCIsIHsgYnViYmxlczogdHJ1ZSB9KSk7XG4gICAgaWYgKGZpZWxkSGFzVmFsdWUoZWwsIGRpc3BsYXlWYWwpKSByZXR1cm4gdHJ1ZTtcbiAgfSBjYXRjaChlKSB7fVxuXG4gIC8qIFx1MjUwMFx1MjUwMCBTdHJhdFx1MDBFOWdpZSA1IDogQW5ndWxhciBOZ0NvbnRyb2wgKFJlYWN0aXZlIEZvcm1zIC8gX19uZ0NvbnRleHRfXykgXHUyNTAwXHUyNTAwICovXG4gIHRyeSB7XG4gICAgdmFyIG5nQ3R4ID0gZWwuX19uZ0NvbnRleHRfXyB8fCAoZWwuX2VsZW1lbnRSZWYgJiYgZWwuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCAmJiBlbC5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50Ll9fbmdDb250ZXh0X18pO1xuICAgIGlmIChuZ0N0eCkge1xuICAgICAgdmFyIGRpciA9IEFycmF5LmlzQXJyYXkobmdDdHgpID8gbmdDdHguZmluZChmdW5jdGlvbihjKSB7IHJldHVybiBjICYmIGMuY29udHJvbDsgfSkgOiBuZ0N0eDtcbiAgICAgIGlmIChkaXIgJiYgZGlyLmNvbnRyb2wgJiYgZGlyLmNvbnRyb2wuc2V0VmFsdWUpIHtcbiAgICAgICAgZGlyLmNvbnRyb2wuc2V0VmFsdWUoaXNEYXRlRmllbGQgPyBkaXNwbGF5VmFsIDogZGlzcGxheVZhbCwgeyBlbWl0RXZlbnQ6IHRydWUgfSk7XG4gICAgICAgIGRpci5jb250cm9sLm1hcmtBc0RpcnR5KCk7XG4gICAgICAgIGRpci5jb250cm9sLm1hcmtBc1RvdWNoZWQoKTtcbiAgICAgICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJpbnB1dFwiLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgICAgICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImNoYW5nZVwiLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgICAgICBpZiAoZmllbGRIYXNWYWx1ZShlbCwgZGlzcGxheVZhbCkgfHwgKGRpci5jb250cm9sLnZhbHVlICYmIFN0cmluZyhkaXIuY29udHJvbC52YWx1ZSkudHJpbSgpICE9PSBcIlwiKSkgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoKGUpIHt9XG5cbiAgLyogXHUyNTAwXHUyNTAwIFN0cmF0XHUwMEU5Z2llIDYgOiBWdWUgMyBfX3ZNb2RlbERpcmVjdGl2ZSAvIF9fdnVlUGFyZW50Q29tcG9uZW50IFx1MjUwMFx1MjUwMCAqL1xuICB0cnkge1xuICAgIHZhciB2dWVJbnN0ID0gZWwuX192dWVQYXJlbnRDb21wb25lbnQ7XG4gICAgaWYgKHZ1ZUluc3QgJiYgdnVlSW5zdC5wcm9wcyAmJiB2dWVJbnN0LmVtaXQpIHtcbiAgICAgIHZ1ZUluc3QuZW1pdChcInVwZGF0ZTptb2RlbFZhbHVlXCIsIGRpc3BsYXlWYWwpO1xuICAgICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJpbnB1dFwiLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgICAgaWYgKGZpZWxkSGFzVmFsdWUoZWwsIGRpc3BsYXlWYWwpKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgLyogVnVlIDIgKi9cbiAgICB2YXIgdnVlMiA9IGVsLl9fdnVlX187XG4gICAgaWYgKHZ1ZTIgJiYgdnVlMi4kZW1pdCkge1xuICAgICAgdnVlMi4kZW1pdChcImlucHV0XCIsIGRpc3BsYXlWYWwpO1xuICAgICAgaWYgKGZpZWxkSGFzVmFsdWUoZWwsIGRpc3BsYXlWYWwpKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0gY2F0Y2goZSkge31cblxuICAvKiBcdTI1MDBcdTI1MDAgU3RyYXRcdTAwRTlnaWUgNyA6IEZsYXRwaWNrciBcdTI1MDBcdTI1MDAgKi9cbiAgdHJ5IHtcbiAgICBpZiAoZWwuX2ZsYXRwaWNrciAmJiBlbC5fZmxhdHBpY2tyLnNldERhdGUgJiYgZGF0ZU5vcm0gJiYgZGF0ZU5vcm0uZGQpIHtcbiAgICAgIGVsLl9mbGF0cGlja3Iuc2V0RGF0ZShkYXRlTm9ybS5kaXNwbGF5LCB0cnVlLCBcImQvbS9ZXCIpO1xuICAgICAgaWYgKGZpZWxkSGFzVmFsdWUoZWwsIGRhdGVOb3JtLmRpc3BsYXkpKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0gY2F0Y2goZSkge31cblxuICAvKiBcdTI1MDBcdTI1MDAgU3RyYXRcdTAwRTlnaWUgOCA6IFJhZHplbiAvIEJsYXpvciAoZGF0ZSkgXHUyMDE0IHZpYSBsJ2lucHV0IHZpc2libGUgZGFucyBsZSBzaGFkb3cgRE9NIFx1MjUwMFx1MjUwMCAqL1xuICB0cnkge1xuICAgIGlmIChpc0RhdGVGaWVsZCkge1xuICAgICAgdmFyIHNoYWRvdyA9IGVsLnNoYWRvd1Jvb3QgfHwgKGVsLnBhcmVudEVsZW1lbnQgJiYgZWwucGFyZW50RWxlbWVudC5zaGFkb3dSb290KTtcbiAgICAgIHZhciBzaGFkb3dJbnB1dCA9IHNoYWRvdyAmJiBzaGFkb3cucXVlcnlTZWxlY3RvcihcImlucHV0XCIpO1xuICAgICAgaWYgKHNoYWRvd0lucHV0KSB7XG4gICAgICAgIHVsdHJhRmlsbChzaGFkb3dJbnB1dCwgZGlzcGxheVZhbCk7XG4gICAgICAgIGlmIChmaWVsZEhhc1ZhbHVlKHNoYWRvd0lucHV0LCBkaXNwbGF5VmFsKSkgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoKGUpIHt9XG5cbiAgLyogXHUyNTAwXHUyNTAwIFN0cmF0XHUwMEU5Z2llIDkgOiBTaW11bGF0aW9uIGZyYXBwZSBkYW5zIHVuIGRhdGUgcGlja2VyIGN1c3RvbSAoY2xpYyArIGVmZmFjZW1lbnQgKyBzYWlzaWUpIFx1MjUwMFx1MjUwMCAqL1xuICBpZiAoaXNEYXRlRmllbGQgJiYgZGF0ZU5vcm0gJiYgZGF0ZU5vcm0uZGQpIHtcbiAgICB0cnkge1xuICAgICAgZWwuZm9jdXMoKTtcbiAgICAgIGVsLmNsaWNrKCk7XG4gICAgICAvKiBFZmZhY2VyIGxlIGNoYW1wICovXG4gICAgICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBLZXlib2FyZEV2ZW50KFwia2V5ZG93blwiLCB7IGJ1YmJsZXM6IHRydWUsIGtleTogXCJhXCIsIGN0cmxLZXk6IHRydWUgfSkpO1xuICAgICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgS2V5Ym9hcmRFdmVudChcImtleWRvd25cIiwgeyBidWJibGVzOiB0cnVlLCBrZXk6IFwiRGVsZXRlXCIgfSkpO1xuICAgICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgS2V5Ym9hcmRFdmVudChcImtleWRvd25cIiwgeyBidWJibGVzOiB0cnVlLCBrZXk6IFwiQmFja3NwYWNlXCIgfSkpO1xuICAgICAgZWwudmFsdWUgPSBcIlwiO1xuXG4gICAgICAvKiBUYXBlciBsYSBkYXRlIGNoaWZmcmUgcGFyIGNoaWZmcmUgKi9cbiAgICAgIHZhciBkYXRlU3RyID0gZGF0ZU5vcm0uZGQgKyBkYXRlTm9ybS5tbSArIGRhdGVOb3JtLnl5eXk7XG4gICAgICBmb3IgKHZhciBjaSA9IDA7IGNpIDwgZGF0ZVN0ci5sZW5ndGg7IGNpKyspIHtcbiAgICAgICAgdmFyIGNoID0gZGF0ZVN0cltjaV07XG4gICAgICAgIGVsLmRpc3BhdGNoRXZlbnQobmV3IEtleWJvYXJkRXZlbnQoXCJrZXlkb3duXCIsICB7IGJ1YmJsZXM6IHRydWUsIGtleTogY2gsIGNvZGU6IFwiRGlnaXRcIiArIGNoLCBrZXlDb2RlOiA0OCArIHBhcnNlSW50KGNoKSB9KSk7XG4gICAgICAgIGVsLmRpc3BhdGNoRXZlbnQobmV3IEtleWJvYXJkRXZlbnQoXCJrZXlwcmVzc1wiLCB7IGJ1YmJsZXM6IHRydWUsIGtleTogY2gsIGNvZGU6IFwiRGlnaXRcIiArIGNoLCBrZXlDb2RlOiA0OCArIHBhcnNlSW50KGNoKSB9KSk7XG4gICAgICAgIGVsLmRpc3BhdGNoRXZlbnQobmV3IEtleWJvYXJkRXZlbnQoXCJrZXl1cFwiLCAgICB7IGJ1YmJsZXM6IHRydWUsIGtleTogY2gsIGNvZGU6IFwiRGlnaXRcIiArIGNoLCBrZXlDb2RlOiA0OCArIHBhcnNlSW50KGNoKSB9KSk7XG4gICAgICB9XG4gICAgICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImlucHV0XCIsICB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJjaGFuZ2VcIiwgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgICAgIGVsLmRpc3BhdGNoRXZlbnQobmV3IEtleWJvYXJkRXZlbnQoXCJrZXlkb3duXCIsIHsgYnViYmxlczogdHJ1ZSwga2V5OiBcIlRhYlwiIH0pKTtcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHIpIHsgc2V0VGltZW91dChyLCAxMDApOyB9KTtcbiAgICAgIGlmIChmaWVsZEhhc1ZhbHVlKGVsLCBkYXRlTm9ybS5kaXNwbGF5KSB8fCBlbC52YWx1ZSAhPT0gXCJcIikgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaChlKSB7fVxuICB9XG5cbiAgLyogXHUyNTAwXHUyNTAwIFN0cmF0XHUwMEU5Z2llIDliIDogZGF0ZSBwaWNrZXIgYXZlYyBpY1x1MDBGNG5lIGNhbGVuZHJpZXIgXHUyMDE0IGNsaXF1ZXIgbCdpY1x1MDBGNG5lIHB1aXMgdGFwZXIgXHUyNTAwXHUyNTAwICovXG4gIGlmIChpc0RhdGVGaWVsZCAmJiBkYXRlTm9ybSAmJiBkYXRlTm9ybS5kZCkge1xuICAgIHRyeSB7XG4gICAgICAvKiBDaGVyY2hlciBsJ2ljXHUwMEY0bmUgY2FsZW5kcmllciBhc3NvY2lcdTAwRTllIChib3V0b24gb3Ugc3BhbiBhZGphY2VudCkgKi9cbiAgICAgIHZhciBwYXJlbnQgPSBlbC5wYXJlbnRFbGVtZW50IHx8IGVsLmNsb3Nlc3QoXCIuaW5wdXQtZ3JvdXBcIikgfHwgZWwuY2xvc2VzdChcIi5kYXRlLWZpZWxkXCIpO1xuICAgICAgdmFyIGNhbEljb24gPSBwYXJlbnQgJiYgKFxuICAgICAgICBwYXJlbnQucXVlcnlTZWxlY3RvcignYnV0dG9uW2NsYXNzKj1cImNhbGVuZGFyXCJdLCBidXR0b25bYXJpYS1sYWJlbCo9XCJkYXRlXCJdLCBidXR0b25bYXJpYS1sYWJlbCo9XCJjYWxlbmRyaWVyXCJdLCAuY2FsZW5kYXItaWNvbiwgLmRhdGVwaWNrZXItdG9nZ2xlLCBbY2xhc3MqPVwiZGF0ZXBpY2tlci1idG5cIl0nKSB8fFxuICAgICAgICBwYXJlbnQucXVlcnlTZWxlY3RvcignYnV0dG9uLCBbcm9sZT1cImJ1dHRvblwiXScpXG4gICAgICApO1xuICAgICAgaWYgKGNhbEljb24pIHtcbiAgICAgICAgY2FsSWNvbi5jbGljaygpO1xuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShmdW5jdGlvbihyKSB7IHNldFRpbWVvdXQociwgMzAwKTsgfSk7XG4gICAgICAgIC8qIENoZXJjaGVyIGxlcyBjaGFtcHMgam91ci9tb2lzL2Fublx1MDBFOWUgZGFucyBsZSBwaWNrZXIgb3V2ZXJ0ICovXG4gICAgICAgIHZhciBwaWNrZXJJbnB1dHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZGF0ZXBpY2tlciBpbnB1dCwgLmNhbGVuZGFyIGlucHV0LCBbY2xhc3MqPVwiZGF0ZXBpY2tlclwiXSBpbnB1dCwgW3JvbGU9XCJkaWFsb2dcIl0gaW5wdXQnKTtcbiAgICAgICAgaWYgKHBpY2tlcklucHV0cy5sZW5ndGggPj0gMykge1xuICAgICAgICAgIHVsdHJhRmlsbChwaWNrZXJJbnB1dHNbMF0sIGRhdGVOb3JtLmRkKTtcbiAgICAgICAgICB1bHRyYUZpbGwocGlja2VySW5wdXRzWzFdLCBkYXRlTm9ybS5tbSk7XG4gICAgICAgICAgdWx0cmFGaWxsKHBpY2tlcklucHV0c1syXSwgZGF0ZU5vcm0ueXl5eSk7XG4gICAgICAgIH0gZWxzZSBpZiAocGlja2VySW5wdXRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgIHVsdHJhRmlsbChwaWNrZXJJbnB1dHNbMF0sIGRhdGVOb3JtLmRpc3BsYXkpO1xuICAgICAgICB9XG4gICAgICAgIC8qIEZlcm1lciBsZSBwaWNrZXIgKi9cbiAgICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgS2V5Ym9hcmRFdmVudChcImtleWRvd25cIiwgeyBidWJibGVzOiB0cnVlLCBrZXk6IFwiRXNjYXBlXCIgfSkpO1xuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShmdW5jdGlvbihyKSB7IHNldFRpbWVvdXQociwgMjAwKTsgfSk7XG4gICAgICAgIGlmIChlbC52YWx1ZSAhPT0gXCJcIikgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSBjYXRjaChlKSB7fVxuICB9XG5cbiAgLyogXHUyNTAwXHUyNTAwIFN0cmF0XHUwMEU5Z2llIDEwIDogPHNlbGVjdD4gXHUyMDE0IHNtYXJ0U2VsZWN0T3B0aW9uIGZ1enp5IFx1MjUwMFx1MjUwMCAqL1xuICBpZiAoZWwudGFnTmFtZSA9PT0gXCJTRUxFQ1RcIikge1xuICAgIHRyeSB7XG4gICAgICBpZiAoc21hcnRTZWxlY3RPcHRpb24oZWwsIGRpc3BsYXlWYWwpKSByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoKGUpIHt9XG4gIH1cblxuICAvKiBcdTI1MDBcdTI1MDAgU3RyYXRcdTAwRTlnaWUgMTEgOiBjb250ZW50ZWRpdGFibGUgKFx1MDBFOWRpdGV1cnMgcmljaCB0ZXh0KSBcdTI1MDBcdTI1MDAgKi9cbiAgdHJ5IHtcbiAgICBpZiAoZWwuZ2V0QXR0cmlidXRlKFwiY29udGVudGVkaXRhYmxlXCIpID09PSBcInRydWVcIiB8fCBlbC5jb250ZW50RWRpdGFibGUgPT09IFwidHJ1ZVwiKSB7XG4gICAgICBlbC5mb2N1cygpO1xuICAgICAgZWwudGV4dENvbnRlbnQgPSBkaXNwbGF5VmFsO1xuICAgICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgSW5wdXRFdmVudChcImlucHV0XCIsIHsgYnViYmxlczogdHJ1ZSwgZGF0YTogZGlzcGxheVZhbCwgaW5wdXRUeXBlOiBcImluc2VydFRleHRcIiB9KSk7XG4gICAgICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImNoYW5nZVwiLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJibHVyXCIsICAgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgICAgIGlmIChlbC50ZXh0Q29udGVudC50cmltKCkgIT09IFwiXCIpIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSBjYXRjaChlKSB7fVxuXG4gIC8qIFx1MjUwMFx1MjUwMCBTdHJhdFx1MDBFOWdpZSAxMiA6IFJlYWN0IGludGVybmFsIGZpYmVyIChfX3JlYWN0RmliZXIgLyBfX3JlYWN0UHJvcHMpIFx1MjUwMFx1MjUwMCAqL1xuICB0cnkge1xuICAgIHZhciBmaWJlcktleSA9IE9iamVjdC5rZXlzKGVsKS5maW5kKGZ1bmN0aW9uKGspIHsgcmV0dXJuIGsuc3RhcnRzV2l0aChcIl9fcmVhY3RGaWJlclwiKSB8fCBrLnN0YXJ0c1dpdGgoXCJfX3JlYWN0SW50ZXJuYWxJbnN0YW5jZVwiKTsgfSk7XG4gICAgdmFyIHByb3BzS2V5ID0gT2JqZWN0LmtleXMoZWwpLmZpbmQoZnVuY3Rpb24oaykgeyByZXR1cm4gay5zdGFydHNXaXRoKFwiX19yZWFjdFByb3BzXCIpOyB9KTtcbiAgICBpZiAocHJvcHNLZXkgJiYgZWxbcHJvcHNLZXldKSB7XG4gICAgICB2YXIgcHJvcHMgPSBlbFtwcm9wc0tleV07XG4gICAgICBpZiAodHlwZW9mIHByb3BzLm9uQ2hhbmdlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdmFyIG5zID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihIVE1MSW5wdXRFbGVtZW50LnByb3RvdHlwZSwgXCJ2YWx1ZVwiKTtcbiAgICAgICAgaWYgKG5zICYmIG5zLnNldCkgbnMuc2V0LmNhbGwoZWwsIGRpc3BsYXlWYWwpOyBlbHNlIGVsLnZhbHVlID0gZGlzcGxheVZhbDtcbiAgICAgICAgcHJvcHMub25DaGFuZ2UoeyB0YXJnZXQ6IGVsLCBjdXJyZW50VGFyZ2V0OiBlbCwgYnViYmxlczogdHJ1ZSwgdHlwZTogXCJjaGFuZ2VcIiB9KTtcbiAgICAgICAgaWYgKGZpZWxkSGFzVmFsdWUoZWwsIGRpc3BsYXlWYWwpKSByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2goZSkge31cblxuICAvKiBcdTI1MDBcdTI1MDAgU3RyYXRcdTAwRTlnaWUgMTMgOiBTdmVsdGUgKCQkIC8gX19zdmVsdGUpIFx1MjUwMFx1MjUwMCAqL1xuICB0cnkge1xuICAgIGlmIChlbC5fX3N2ZWx0ZV9tZXRhIHx8IGVsLiQkKSB7XG4gICAgICB2YXIgc3ZlbHRlTnMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKEhUTUxJbnB1dEVsZW1lbnQucHJvdG90eXBlLCBcInZhbHVlXCIpO1xuICAgICAgaWYgKHN2ZWx0ZU5zICYmIHN2ZWx0ZU5zLnNldCkgc3ZlbHRlTnMuc2V0LmNhbGwoZWwsIGRpc3BsYXlWYWwpOyBlbHNlIGVsLnZhbHVlID0gZGlzcGxheVZhbDtcbiAgICAgIGVsLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiaW5wdXRcIiwgIHsgYnViYmxlczogdHJ1ZSB9KSk7XG4gICAgICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImNoYW5nZVwiLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgICAgaWYgKGZpZWxkSGFzVmFsdWUoZWwsIGRpc3BsYXlWYWwpKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0gY2F0Y2goZSkge31cblxuICAvKiBcdTI1MDBcdTI1MDAgU3RyYXRcdTAwRTlnaWUgMTQgOiBGb3JjZSBicnV0ZSBcdTIwMTQgc2V0dGVyIGRpcmVjdCBzYW5zIHZcdTAwRTlyaWZpY2F0aW9uIFx1MjUwMFx1MjUwMCAqL1xuICB0cnkge1xuICAgIGVsLnZhbHVlID0gZGlzcGxheVZhbDtcbiAgICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImlucHV0XCIsICB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgIGVsLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiY2hhbmdlXCIsIHsgYnViYmxlczogdHJ1ZSB9KSk7XG4gICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJibHVyXCIsICAgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgICByZXR1cm4gZmllbGRIYXNWYWx1ZShlbCwgZGlzcGxheVZhbCk7XG4gIH0gY2F0Y2goZSkge31cblxuICByZXR1cm4gZmFsc2U7XG59XG4iLCAiLyogXHUyNTAwXHUyNTAwIExlYXJuaW5nIHNpZ25hbCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cblxuZXhwb3J0IGZ1bmN0aW9uIG1hcmtGaWxsZWRCeUF1ZGlCb3QoZWwsIHZhcmlhYmxlKSB7XG4gIGVsLnNldEF0dHJpYnV0ZShcImRhdGEtYXVkaWJvdC1maWxsZWRcIiwgdmFyaWFibGUpO1xuICBlbC5zZXRBdHRyaWJ1dGUoXCJkYXRhLWF1ZGlib3QtdmFsdWVcIiwgZWwudmFsdWUpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VuZExlYXJuaW5nU2lnbmFsKHNpZ25hbCkge1xuICB2YXIgc3luY1Rva2VuID0gYXdhaXQgZ2V0U3luY1Rva2VuKCk7XG4gIGlmICghc3luY1Rva2VuKSByZXR1cm47XG4gIGZldGNoKFwiaHR0cHM6Ly9hdWRpYm90LmZyL2FwaS9leHRlbnNpb24vc21hcnQtZmlsbC9sZWFyblwiLCB7XG4gICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBzeW5jVG9rZW46IHN5bmNUb2tlbiwgaG9zdG5hbWU6IHNpZ25hbC5ob3N0bmFtZSwgc2VsZWN0b3I6IHNpZ25hbC5zZWxlY3RvciwgbGFiZWw6IHNpZ25hbC5sYWJlbCwgb2xkVmFyaWFibGU6IHNpZ25hbC5vbGRWYXJpYWJsZSwgY29ycmVjdFZhcmlhYmxlOiBzaWduYWwuY29ycmVjdFZhcmlhYmxlIH0pXG4gIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikgeyBjb25zb2xlLndhcm4oXCJbQXVkaUJvdF0gbGVhcm5pbmcgc2lnbmFsIGZhaWxlZDpcIiwgZXJyKTsgfSk7XG59XG4iLCAiLyogXHUyNTAwXHUyNTAwIFNtYXJ0IEZpbGwgXHUyMDE0IHBlcmZvcm1TbWFydEZpbGwgKyBoZWxwZXJzIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuXG5pbXBvcnQgeyBxdWVyeVNlbGVjdG9yQWxsRGVlcCB9IGZyb20gXCIuLi91dGlscy9kb20uanNcIjtcbmltcG9ydCB7IGdldFNtYXJ0RmlsbERhdGEsIGdldENhY2hlZENsaWVudCB9IGZyb20gXCIuLi91dGlscy9kYXRhLmpzXCI7XG5pbXBvcnQgeyB1bHRyYUZpbGwsIHNtYXJ0RmlsbEZpZWxkLCBzbWFydFNlbGVjdE9wdGlvbiB9IGZyb20gXCIuLi91dGlscy9maWxsLmpzXCI7XG5pbXBvcnQgeyBnZXRDYWNoZWRTZWxlY3Rvciwgc2V0Q2FjaGVkU2VsZWN0b3IsIHNhdmVTZWxlY3RvckNhY2hlIH0gZnJvbSBcIi4uL3V0aWxzL3NlbGVjdG9yLWNhY2hlLmpzXCI7XG5pbXBvcnQgeyBnZXRGaWVsZExhYmVsLCBub3JtYWxpemVMYWJlbCwgbm9ybWFsaXplQWxpYXMsIHNjb3JlRmllbGRNYXRjaCwgbWF0Y2hTbWFydEZpZWxkLCBjbGVhck1hdGNoaW5nQ2FjaGUsIHByZUNhY2hlTGFiZWxNYXAsIGxvYWRMZWFybmVkV2VpZ2h0cyB9IGZyb20gXCIuLi91dGlscy9maWVsZC1tYXRjaGluZy5qc1wiO1xuaW1wb3J0IHsgZm9ybWF0T3B0aWNhbFZhbHVlLCBub3JtYWxpemVEYXRlVmFsdWUsIGZpZWxkSGFzVmFsdWUsIFZBTFVFX05PUk1BTElaRVJTLCBPUFRJQ0FMX0ZJRUxEX0tFWVMgfSBmcm9tIFwiLi4vdXRpbHMvZm9ybWF0LmpzXCI7XG5pbXBvcnQgeyBTTUFSVF9GSUxMX0FMSUFTRVMsIFNNQVJUX0ZJTExfQkxBQ0tMSVNULCBkZXRlY3RQYWdlQ29udGV4dCB9IGZyb20gXCIuLi91dGlscy9kYXRhLmpzXCI7XG5pbXBvcnQgeyBtYXJrRmlsbGVkQnlBdWRpQm90IH0gZnJvbSBcIi4vbGVhcm5pbmcuanNcIjtcblxuLyogRm9uY3Rpb25zIGRlZmluaWVzIGRhbnMgY29udGVudC9pbmRleC5qcyBldCBleHBvc2VlcyB2aWEgZ2xvYmFsVGhpcyAqL1xudmFyIHNob3dSUEFUb2FzdCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gZ2xvYmFsVGhpcy5zaG93UlBBVG9hc3QgPyBnbG9iYWxUaGlzLnNob3dSUEFUb2FzdC5hcHBseShudWxsLCBhcmd1bWVudHMpIDogdW5kZWZpbmVkOyB9O1xudmFyIGNoZWNrRHJvaXRzTXV0dWVsbGUgPSBmdW5jdGlvbihkKSB7IHJldHVybiBnbG9iYWxUaGlzLmNoZWNrRHJvaXRzTXV0dWVsbGUgPyBnbG9iYWxUaGlzLmNoZWNrRHJvaXRzTXV0dWVsbGUoZCkgOiB1bmRlZmluZWQ7IH07XG5cbnZhciBfcGVyZm9ybWluZ1NtYXJ0RmlsbCA9IGZhbHNlO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcGVyZm9ybVNtYXJ0RmlsbCgpIHtcbiAgaWYgKF9wZXJmb3JtaW5nU21hcnRGaWxsKSByZXR1cm47XG4gIF9wZXJmb3JtaW5nU21hcnRGaWxsID0gdHJ1ZTtcbiAgdHJ5IHtcbiAgdmFyIGZpbGxEYXRhID0gYXdhaXQgZ2V0U21hcnRGaWxsRGF0YSgpO1xuICBpZiAoIWZpbGxEYXRhLm5vbSAmJiAhZmlsbERhdGEubnVtZXJvU2VjdXJpdGVTb2NpYWxlICYmICFmaWxsRGF0YS5udW1lcm9BZGhlcmVudCkge1xuICAgIHNob3dSUEFUb2FzdChcIkF1Y3VuZSBkb25uXFx1MDBFOWUgcGF0aWVudCBlbiBtXFx1MDBFOW1vaXJlLiBTY2FubmV6IGQnYWJvcmQgdW5lIG9yZG9ubmFuY2UuXCIsIFwiZXJyb3JcIik7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLyogQW1cdTAwRTlsaW9yYXRpb24gNiA6IG5lIHBhcyByZW1wbGlyIGxlcyBwYWdlcyBkZSBsb2dpbiAqL1xuICBpZiAoZGV0ZWN0UGFnZUNvbnRleHQoKSA9PT0gXCJsb2dpblwiKSByZXR1cm47XG5cbiAgLyogVlx1MDBFOXJpZmljYXRpb24gZHJvaXRzIG11dHVlbGxlICovXG4gIGNoZWNrRHJvaXRzTXV0dWVsbGUoZmlsbERhdGEpO1xuXG4gIHZhciBJTlBVVF9TRUxFQ1RPUiA9IFwiaW5wdXQ6bm90KFt0eXBlPWhpZGRlbl0pOm5vdChbdHlwZT1zdWJtaXRdKTpub3QoW3R5cGU9YnV0dG9uXSk6bm90KFt0eXBlPWNoZWNrYm94XSk6bm90KFt0eXBlPXJhZGlvXSk6bm90KFt0eXBlPWZpbGVdKTpub3QoW3JlYWRvbmx5XSksIHNlbGVjdDpub3QoW2Rpc2FibGVkXSksIHRleHRhcmVhOm5vdChbcmVhZG9ubHldKVwiO1xuXG4gIC8qIENvbGxlY3RlciBsZXMgaW5wdXRzIGR1IGRvY3VtZW50IHByaW5jaXBhbCArIGlmcmFtZXMgKyBzaGFkb3cgRE9NICovXG4gIHZhciBpbnB1dExpc3QgPSBxdWVyeVNlbGVjdG9yQWxsRGVlcChJTlBVVF9TRUxFQ1RPUik7XG4gIHZhciBmaWxsZWQgPSAwO1xuICB2YXIgcHJvYmFibGUgPSAwO1xuICB2YXIgZmlsbFJlcG9ydCA9IHsgdHM6IERhdGUubm93KCksIGhvc3RuYW1lOiB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUsIGZpbGxlZDogW10sIHdhcm5lZDogW10sIHNraXBwZWQ6IFtdLCBmYWlsZWQ6IFtdIH07XG5cbiAgdmFyIGN1cnJlbnRIb3N0bmFtZSA9IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZTtcblxuICAvKiBcdTI1MDBcdTI1MDAgUHJlLWNhY2hlIGxhYmVscyAmIGNsZWFyIExldmVuc2h0ZWluIG1lbW8gZm9yIHRoaXMgcnVuIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuICBpZiAodHlwZW9mIGNsZWFyTWF0Y2hpbmdDYWNoZSA9PT0gXCJmdW5jdGlvblwiKSBjbGVhck1hdGNoaW5nQ2FjaGUoKTtcbiAgaWYgKHR5cGVvZiBwcmVDYWNoZUxhYmVsTWFwID09PSBcImZ1bmN0aW9uXCIpIHByZUNhY2hlTGFiZWxNYXAoKTtcbiAgLyogVjMtMzogbG9hZCBsZWFybmVkIHdlaWdodHMgZm9yIHNjb3JlIHJlY2FsaWJyYXRpb24gKi9cbiAgaWYgKHR5cGVvZiBsb2FkTGVhcm5lZFdlaWdodHMgPT09IFwiZnVuY3Rpb25cIikgbG9hZExlYXJuZWRXZWlnaHRzKCk7XG5cbiAgLyogVjMtNTogcmVhZCBwcmV2aWV3LWJlZm9yZS1maWxsIHNldHRpbmcgKi9cbiAgdmFyIHNldHRpbmdzID0gYXdhaXQgbmV3IFByb21pc2UoZnVuY3Rpb24ocikgeyBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoW1wiYXVkaWJvdF9zZXR0aW5nc1wiXSwgZnVuY3Rpb24ocmVzKSB7IHIocmVzLmF1ZGlib3Rfc2V0dGluZ3MgfHwge30pOyB9KTsgfSk7XG4gIHZhciBwcmV2aWV3RW5hYmxlZCA9IHNldHRpbmdzLnByZXZpZXdCZWZvcmVGaWxsIHx8IGZhbHNlO1xuXG4gIC8qIFx1MjUwMFx1MjUwMCBTY2FubmluZyBpbmRpY2F0b3IgZm9yIGxhcmdlIHBhZ2VzIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuICBpZiAoaW5wdXRMaXN0Lmxlbmd0aCA+IDEwMCkge1xuICAgIHZhciBzY2FuVG9hc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHNjYW5Ub2FzdC5pZCA9IFwiYXVkaWJvdC1zY2FuLXByb2dyZXNzXCI7XG4gICAgc2NhblRvYXN0LnRleHRDb250ZW50ID0gXCJTY2FuIGVuIGNvdXJzXFx1MjAyNiAoXCIgKyBpbnB1dExpc3QubGVuZ3RoICsgXCIgY2hhbXBzKVwiO1xuICAgIHNjYW5Ub2FzdC5zdHlsZS5jc3NUZXh0ID0gXCJwb3NpdGlvbjpmaXhlZDtib3R0b206MjRweDtsZWZ0OjUwJTt0cmFuc2Zvcm06dHJhbnNsYXRlWCgtNTAlKTt6LWluZGV4OjIxNDc0ODM2NDc7YmFja2dyb3VuZDojMWUyOTNiO2NvbG9yOndoaXRlO3BhZGRpbmc6OHB4IDE2cHg7Ym9yZGVyLXJhZGl1czo4cHg7Zm9udDo1MDAgMTJweC8xLjQgLWFwcGxlLXN5c3RlbSxCbGlua01hY1N5c3RlbUZvbnQsc2Fucy1zZXJpZjtib3gtc2hhZG93OjAgNHB4IDEycHggcmdiYSgwLDAsMCwuMTUpO29wYWNpdHk6MDt0cmFuc2l0aW9uOm9wYWNpdHkgLjNzO1wiO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2NhblRvYXN0KTtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7IHNjYW5Ub2FzdC5zdHlsZS5vcGFjaXR5ID0gXCIxXCI7IH0pO1xuICB9XG5cbiAgLyogXHUyNTAwXHUyNTAwIENodW5rZWQgYXN5bmMgcHJvY2Vzc2luZyB0byBhdm9pZCBibG9ja2luZyBtYWluIHRocmVhZCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cbiAgdmFyIENIVU5LX1NJWkUgPSA0MDtcbiAgdmFyIHNjYW5TdGFydCA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAvKiBWMy01OiBidWlsZCBhIGZpbGwgcGxhbiBmb3IgcHJldmlldyBtb2RlICovXG4gIHZhciBmaWxsUGxhbiA9IFtdO1xuXG4gIGZvciAodmFyIGNodW5rU3RhcnQgPSAwOyBjaHVua1N0YXJ0IDwgaW5wdXRMaXN0Lmxlbmd0aDsgY2h1bmtTdGFydCArPSBDSFVOS19TSVpFKSB7XG4gICAgdmFyIGNodW5rRW5kID0gTWF0aC5taW4oY2h1bmtTdGFydCArIENIVU5LX1NJWkUsIGlucHV0TGlzdC5sZW5ndGgpO1xuXG4gICAgZm9yICh2YXIgaWR4ID0gY2h1bmtTdGFydDsgaWR4IDwgY2h1bmtFbmQ7IGlkeCsrKSB7XG4gICAgICB2YXIgZWwgPSBpbnB1dExpc3RbaWR4XTtcblxuICAgIC8qIFx1MjUwMFx1MjUwMCBDYWNoZSBjaGVjayA6IHNpIHVuIHNcdTAwRTlsZWN0ZXVyIGVzdCBlbiBjYWNoZSBwb3VyIGNlIHBvcnRhaWwsIGwndXRpbGlzZXIgXHUyNTAwXHUyNTAwICovXG4gICAgdmFyIGVsU2VsZWN0b3IgPSBlbC5pZCA/IChcIiNcIiArIENTUy5lc2NhcGUoZWwuaWQpKSA6IChlbC5uYW1lID8gKCdbbmFtZT1cIicgKyBlbC5uYW1lICsgJ1wiXScpIDogbnVsbCk7XG4gICAgdmFyIGNhY2hlZEZpZWxkID0gbnVsbDtcbiAgICBpZiAoZWxTZWxlY3Rvcikge1xuICAgICAgZm9yICh2YXIgY2ZLZXkgaW4gU01BUlRfRklMTF9BTElBU0VTKSB7XG4gICAgICAgIHZhciBjYWNoZWQgPSBnZXRDYWNoZWRTZWxlY3RvcihjdXJyZW50SG9zdG5hbWUsIGNmS2V5KTtcbiAgICAgICAgaWYgKGNhY2hlZCAmJiBjYWNoZWQgPT09IGVsU2VsZWN0b3IpIHsgY2FjaGVkRmllbGQgPSBjZktleTsgYnJlYWs7IH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKiBcdTI1MDBcdTI1MDAgU2NvcmUtYmFzZWQgbWF0Y2hpbmcgKEFtXHUwMEU5bGlvcmF0aW9uIDIrNCkgXHUyNTAwXHUyNTAwICovXG4gICAgdmFyIGJlc3RGaWVsZCA9IGNhY2hlZEZpZWxkO1xuICAgIHZhciBiZXN0U2NvcmUgPSBjYWNoZWRGaWVsZCA/IDk1IDogMDtcbiAgICBpZiAoIWNhY2hlZEZpZWxkKSB7XG4gICAgICBmb3IgKHZhciBmaWVsZCBpbiBTTUFSVF9GSUxMX0FMSUFTRVMpIHtcbiAgICAgICAgdmFyIHNjb3JlID0gc2NvcmVGaWVsZE1hdGNoKGVsLCBmaWVsZCwgU01BUlRfRklMTF9BTElBU0VTW2ZpZWxkXSk7XG4gICAgICAgIGlmIChzY29yZSA+IGJlc3RTY29yZSkgeyBiZXN0U2NvcmUgPSBzY29yZTsgYmVzdEZpZWxkID0gZmllbGQ7IH1cbiAgICAgIH1cblxuICAgICAgLyogQWxzbyB0cnkgbGVnYWN5IG1hdGNoU21hcnRGaWVsZCBmb3IgYmFja3dhcmQgY29tcGF0ICovXG4gICAgICBpZiAoYmVzdFNjb3JlIDwgNTApIHtcbiAgICAgICAgdmFyIGxlZ2FjeU1hdGNoID0gbWF0Y2hTbWFydEZpZWxkKGVsKTtcbiAgICAgICAgaWYgKGxlZ2FjeU1hdGNoKSB7XG4gICAgICAgICAgYmVzdEZpZWxkID0gbGVnYWN5TWF0Y2guZmllbGQ7XG4gICAgICAgICAgYmVzdFNjb3JlID0gbGVnYWN5TWF0Y2guY29uZmlkZW5jZSA9PT0gXCJjZXJ0YWluXCIgPyA4NSA6IDYwO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFiZXN0RmllbGQpIGNvbnRpbnVlO1xuXG4gICAgLyogU3RvcmUgbWF0Y2hlZCBzZWxlY3RvciBpbiBjYWNoZSBmb3IgdGhpcyBwb3J0YWwgKi9cbiAgICBpZiAoZWxTZWxlY3RvciAmJiBiZXN0U2NvcmUgPj0gNTApIHtcbiAgICAgIHNldENhY2hlZFNlbGVjdG9yKGN1cnJlbnRIb3N0bmFtZSwgYmVzdEZpZWxkLCBlbFNlbGVjdG9yKTtcbiAgICB9XG4gICAgdmFyIHZhbHVlID0gZmlsbERhdGFbYmVzdEZpZWxkXTtcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICBmaWxsUmVwb3J0LmZhaWxlZC5wdXNoKHsgbGFiZWw6IG5vcm1hbGl6ZUxhYmVsKGdldEZpZWxkTGFiZWwoZWwpKSwgdmFyaWFibGU6IGJlc3RGaWVsZCwgY29uZmlkZW5jZTogYmVzdFNjb3JlLCBzaWduYWxzOiB7IGNhY2hlZDogISFjYWNoZWRGaWVsZCwgaWRNYXRjaDogZWwuaWQgJiYgbm9ybWFsaXplQWxpYXMoZWwuaWQpLmluZGV4T2Yobm9ybWFsaXplQWxpYXMoYmVzdEZpZWxkKSkgIT09IC0xLCBuYW1lTWF0Y2g6IGVsLm5hbWUgJiYgbm9ybWFsaXplQWxpYXMoZWwubmFtZSkuaW5kZXhPZihub3JtYWxpemVBbGlhcyhiZXN0RmllbGQpKSAhPT0gLTEsIGxhYmVsTWF0Y2g6ICEhZ2V0RmllbGRMYWJlbChlbCkgfSB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8qIFNldWlsIDwgNTAgXHUyMTkyIG5lIHBhcyByZW1wbGlyICovXG4gICAgaWYgKGJlc3RTY29yZSA8IDUwKSB7XG4gICAgICBmaWxsUmVwb3J0LnNraXBwZWQucHVzaCh7IGxhYmVsOiBub3JtYWxpemVMYWJlbChnZXRGaWVsZExhYmVsKGVsKSksIHZhcmlhYmxlOiBiZXN0RmllbGQsIGNvbmZpZGVuY2U6IGJlc3RTY29yZSwgcmVhc29uOiBcInNjb3JlX3Ryb3BfZmFpYmxlXCIgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvKiBCbGFja2xpc3QgY2hlY2sgKi9cbiAgICB2YXIgZmNuUmF3ID0gZWwuZ2V0QXR0cmlidXRlKFwiZm9ybWNvbnRyb2xuYW1lXCIpIHx8IGVsLmdldEF0dHJpYnV0ZShcIm5nLXJlZmxlY3QtbmFtZVwiKSB8fCBlbC5uYW1lIHx8IFwiXCI7XG4gICAgaWYgKGZjblJhdyAmJiBTTUFSVF9GSUxMX0JMQUNLTElTVC5pbmRleE9mKGZjblJhdy50b0xvd2VyQ2FzZSgpKSAhPT0gLTEpIGNvbnRpbnVlO1xuXG4gICAgLyogTmUgcGFzIFx1MDBFOWNyYXNlciB1biBjaGFtcCBkXHUwMEU5alx1MDBFMCByZW1wbGkgbWFudWVsbGVtZW50IHBhciBsJ29wdGljaWVuICovXG4gICAgdmFyIGV4aXN0aW5nVmFsID0gKGVsLnZhbHVlIHx8IFwiXCIpLnRyaW0oKTtcbiAgICBpZiAoZXhpc3RpbmdWYWwgJiYgIWVsLmdldEF0dHJpYnV0ZShcImRhdGEtYXVkaWJvdC1maWxsZWRcIikpIHtcbiAgICAgIGZpbGxSZXBvcnQuc2tpcHBlZC5wdXNoKHsgbGFiZWw6IG5vcm1hbGl6ZUxhYmVsKGdldEZpZWxkTGFiZWwoZWwpKSwgdmFyaWFibGU6IGJlc3RGaWVsZCwgY29uZmlkZW5jZTogYmVzdFNjb3JlLCByZWFzb246IFwiZGVqYV9yZW1wbGlcIiB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8qIEFtXHUwMEU5bGlvcmF0aW9uIDggOiBhcHBsaXF1ZXIgVkFMVUVfTk9STUFMSVpFUlMgYXZhbnQgZmlsbCAqL1xuICAgIGlmIChWQUxVRV9OT1JNQUxJWkVSU1tiZXN0RmllbGRdKSB7XG4gICAgICB2YWx1ZSA9IFZBTFVFX05PUk1BTElaRVJTW2Jlc3RGaWVsZF0odmFsdWUsIGVsKTtcbiAgICB9XG5cbiAgICAvKiBGb3JtYXQgY29ycmVjdGlvbnMgb3B0aXF1ZXMgKHNwaGVyZS9jeWxpbmRyZS9heGUvYWRkaXRpb24pICovXG4gICAgaWYgKE9QVElDQUxfRklFTERfS0VZUy5pbmRleE9mKGJlc3RGaWVsZCkgIT09IC0xKSB7XG4gICAgICB2YWx1ZSA9IGZvcm1hdE9wdGljYWxWYWx1ZSh2YWx1ZSwgZWwpO1xuICAgIH1cblxuICAgIC8qIFByb3RlY3Rpb24gcmFuZyBOU1MgOiBuZSBwYXMgcmVtcGxpciBOU1MgZW50aWVyIGRhbnMgdW4gY2hhbXAgZGUgMS0yIGNoaWZmcmVzICovXG4gICAgaWYgKGJlc3RGaWVsZCA9PT0gXCJudW1lcm9TZWN1cml0ZVNvY2lhbGVcIiAmJiB2YWx1ZSAmJiB2YWx1ZS5yZXBsYWNlKC9cXEQvZywgXCJcIikubGVuZ3RoID49IDEzKSB7XG4gICAgICB2YXIgbWF4TGVuID0gcGFyc2VJbnQoZWwuZ2V0QXR0cmlidXRlKFwibWF4bGVuZ3RoXCIpIHx8IFwiMFwiKTtcbiAgICAgIHZhciBlbE5hbWUgPSAoZWwubmFtZSB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgLyogU2kgbGUgY2hhbXAgYXR0ZW5kIDEtMiBjaGlmZnJlcyBldCBjb250aWVudCBcInJhbmdcIiBvdSBcImNsZVwiIFx1MjE5MiBpZ25vcmVyICovXG4gICAgICBpZiAoKG1heExlbiA+IDAgJiYgbWF4TGVuIDw9IDIpIHx8IC9yYW5nfGNsZXxrZXl8cmFuZ19uYWlzc2FuY2UvLnRlc3QoZWxOYW1lKSkge1xuICAgICAgICBmaWxsUmVwb3J0LnNraXBwZWQucHVzaCh7IGxhYmVsOiBub3JtYWxpemVMYWJlbChnZXRGaWVsZExhYmVsKGVsKSksIHZhcmlhYmxlOiBiZXN0RmllbGQsIGNvbmZpZGVuY2U6IGJlc3RTY29yZSwgcmVhc29uOiBcIm5zc19kYW5zX2NoYW1wX3JhbmdcIiB9KTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyogVjMtNTogY29sbGVjdCBmaWxsIHBsYW4gaXRlbSAqL1xuICAgIGZpbGxQbGFuLnB1c2goeyBlbDogZWwsIGZpZWxkOiBiZXN0RmllbGQsIHZhbHVlOiB2YWx1ZSwgc2NvcmU6IGJlc3RTY29yZSwgY2FjaGVkRmllbGQ6IGNhY2hlZEZpZWxkLCBsYWJlbDogbm9ybWFsaXplTGFiZWwoZ2V0RmllbGRMYWJlbChlbCkpIH0pO1xuXG4gICAgfSAvKiBlbmQgaW5uZXIgZm9yIChpZHgpICovXG5cbiAgICAvKiBZaWVsZCB0byBtYWluIHRocmVhZCBiZXR3ZWVuIGNodW5rcyBpZiB0aGVyZSBhcmUgbW9yZSAqL1xuICAgIGlmIChjaHVua0VuZCA8IGlucHV0TGlzdC5sZW5ndGgpIHtcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHIpIHsgc2V0VGltZW91dChyLCAwKTsgfSk7XG4gICAgfVxuICB9IC8qIGVuZCBvdXRlciBmb3IgKGNodW5rU3RhcnQpICovXG5cbiAgdmFyIHNjYW5EdXJhdGlvbiA9IE1hdGgucm91bmQocGVyZm9ybWFuY2Uubm93KCkgLSBzY2FuU3RhcnQpO1xuICAvKiBWMy0xOiBhdHRhY2ggc2NhbiBtZXRhZGF0YSB0byBmaWxsIHJlcG9ydCAqL1xuICBmaWxsUmVwb3J0LnNjYW5EdXJhdGlvbiA9IHNjYW5EdXJhdGlvbjtcbiAgZmlsbFJlcG9ydC50b3RhbEZpZWxkcyA9IGlucHV0TGlzdC5sZW5ndGg7XG4gIC8qIFJlbW92ZSBzY2FubmluZyBpbmRpY2F0b3IsIHNob3cgcmVzdWx0IGlmIGxvbmcgKi9cbiAgdmFyIGV4aXN0aW5nVG9hc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF1ZGlib3Qtc2Nhbi1wcm9ncmVzc1wiKTtcbiAgaWYgKGV4aXN0aW5nVG9hc3QpIGV4aXN0aW5nVG9hc3QucmVtb3ZlKCk7XG4gIGlmIChzY2FuRHVyYXRpb24gPiA1MDApIHtcbiAgICBjb25zb2xlLmluZm8oXCJbQXVkaUJvdF0gU21hcnQgRmlsbCBzY2FuOiBcIiArIGlucHV0TGlzdC5sZW5ndGggKyBcIiBmaWVsZHMgaW4gXCIgKyBzY2FuRHVyYXRpb24gKyBcIm1zXCIpO1xuICB9XG4gIGlmIChzY2FuRHVyYXRpb24gPiAxMDAwKSB7XG4gICAgdmFyIHJlc3VsdFRvYXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICByZXN1bHRUb2FzdC5pZCA9IFwiYXVkaWJvdC1zY2FuLXByb2dyZXNzXCI7XG4gICAgcmVzdWx0VG9hc3QudGV4dENvbnRlbnQgPSBcIlNjYW4gdGVybWluXFx1MDBFOSBcdTIwMTQgXCIgKyBpbnB1dExpc3QubGVuZ3RoICsgXCIgY2hhbXBzIGVuIFwiICsgKHNjYW5EdXJhdGlvbiAvIDEwMDApLnRvRml4ZWQoMSkgKyBcInNcIjtcbiAgICByZXN1bHRUb2FzdC5zdHlsZS5jc3NUZXh0ID0gXCJwb3NpdGlvbjpmaXhlZDtib3R0b206MjRweDtsZWZ0OjUwJTt0cmFuc2Zvcm06dHJhbnNsYXRlWCgtNTAlKTt6LWluZGV4OjIxNDc0ODM2NDc7YmFja2dyb3VuZDojMWUyOTNiO2NvbG9yOndoaXRlO3BhZGRpbmc6OHB4IDE2cHg7Ym9yZGVyLXJhZGl1czo4cHg7Zm9udDo1MDAgMTJweC8xLjQgLWFwcGxlLXN5c3RlbSxCbGlua01hY1N5c3RlbUZvbnQsc2Fucy1zZXJpZjtib3gtc2hhZG93OjAgNHB4IDEycHggcmdiYSgwLDAsMCwuMTUpO29wYWNpdHk6MDt0cmFuc2l0aW9uOm9wYWNpdHkgLjNzO1wiO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQocmVzdWx0VG9hc3QpO1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHsgcmVzdWx0VG9hc3Quc3R5bGUub3BhY2l0eSA9IFwiMVwiOyB9KTtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyByZXN1bHRUb2FzdC5zdHlsZS5vcGFjaXR5ID0gXCIwXCI7IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IHJlc3VsdFRvYXN0LnJlbW92ZSgpOyB9LCAzMDApOyB9LCAzMDAwKTtcbiAgfVxuXG4gIC8qIFx1MjUwMFx1MjUwMCBWMy01OiBmaWxsIGV4ZWN1dGlvbiAoZXh0cmFjdGVkIGZvciBwcmV2aWV3IHN1cHBvcnQpIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuICBhc3luYyBmdW5jdGlvbiBleGVjdXRlRmlsbCgpIHtcbiAgICBmb3IgKHZhciBwaSA9IDA7IHBpIDwgZmlsbFBsYW4ubGVuZ3RoOyBwaSsrKSB7XG4gICAgICB2YXIgaXRlbSA9IGZpbGxQbGFuW3BpXTtcbiAgICAgIHZhciBlbCA9IGl0ZW0uZWw7XG4gICAgICB2YXIgYmVzdEZpZWxkID0gaXRlbS5maWVsZDtcbiAgICAgIHZhciB2YWx1ZSA9IGl0ZW0udmFsdWU7XG4gICAgICB2YXIgYmVzdFNjb3JlID0gaXRlbS5zY29yZTtcbiAgICAgIHZhciBjYWNoZWRGaWVsZCA9IGl0ZW0uY2FjaGVkRmllbGQ7XG5cbiAgICAgIC8qIENhcyBzcFx1MDBFOWNpYWwgOiBpbnRsLXRlbC1pbnB1dCAodFx1MDBFOWxcdTAwRTlwaG9uZSBhdmVjIGluZGljYXRpZiBwYXlzKSAqL1xuICAgICAgaWYgKGJlc3RGaWVsZCA9PT0gXCJ0ZWxlcGhvbmVcIikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHZhciBpdGlJbnN0YW5jZSA9IHdpbmRvdy5pbnRsVGVsSW5wdXRHbG9iYWxzICYmIHdpbmRvdy5pbnRsVGVsSW5wdXRHbG9iYWxzLmdldEluc3RhbmNlXG4gICAgICAgICAgICA/IHdpbmRvdy5pbnRsVGVsSW5wdXRHbG9iYWxzLmdldEluc3RhbmNlKGVsKVxuICAgICAgICAgICAgOiAoZWwuX2l0aUluc3RhbmNlIHx8IG51bGwpO1xuICAgICAgICAgIGlmIChpdGlJbnN0YW5jZSAmJiBpdGlJbnN0YW5jZS5zZXROdW1iZXIpIHtcbiAgICAgICAgICAgIGl0aUluc3RhbmNlLnNldE51bWJlcih2YWx1ZSk7XG4gICAgICAgICAgICBmaWxsZWQrKztcbiAgICAgICAgICAgIG1hcmtGaWxsZWRCeUF1ZGlCb3QoZWwsIGJlc3RGaWVsZCk7XG4gICAgICAgICAgICBpZiAoYmVzdFNjb3JlIDwgODApIHtcbiAgICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlKFwiZGF0YS1hdWRpYm90LWNvbmZpZGVuY2VcIiwgYmVzdFNjb3JlKTtcbiAgICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlKFwiZGF0YS1hdWRpYm90LXdhcm5lZFwiLCBcInRydWVcIik7XG4gICAgICAgICAgICAgIGVsLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IFwiI2ZlZjljM1wiO1xuICAgICAgICAgICAgICBlbC5zdHlsZS5vdXRsaW5lID0gXCIycHggc29saWQgI2VhYjMwOFwiO1xuICAgICAgICAgICAgICBlbC50aXRsZSA9IFwiQXVkaUJvdCBcXHUyMDE0IGNvbmZpYW5jZSBcIiArIGJlc3RTY29yZSArIFwiJSAoXCIgKyBiZXN0RmllbGQgKyBcIikgXFx1MjAxNCB2XFx1MDBFOXJpZmllelwiO1xuICAgICAgICAgICAgICBwcm9iYWJsZSsrO1xuICAgICAgICAgICAgICBmaWxsUmVwb3J0Lndhcm5lZC5wdXNoKHsgbGFiZWw6IG5vcm1hbGl6ZUxhYmVsKGdldEZpZWxkTGFiZWwoZWwpKSwgdmFyaWFibGU6IGJlc3RGaWVsZCwgY29uZmlkZW5jZTogYmVzdFNjb3JlLCBzaWduYWxzOiB7IGNhY2hlZDogISFjYWNoZWRGaWVsZCwgaWRNYXRjaDogZWwuaWQgJiYgbm9ybWFsaXplQWxpYXMoZWwuaWQpLmluZGV4T2Yobm9ybWFsaXplQWxpYXMoYmVzdEZpZWxkKSkgIT09IC0xLCBuYW1lTWF0Y2g6IGVsLm5hbWUgJiYgbm9ybWFsaXplQWxpYXMoZWwubmFtZSkuaW5kZXhPZihub3JtYWxpemVBbGlhcyhiZXN0RmllbGQpKSAhPT0gLTEsIGxhYmVsTWF0Y2g6ICEhZ2V0RmllbGRMYWJlbChlbCkgfSB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGZpbGxSZXBvcnQuZmlsbGVkLnB1c2goeyBsYWJlbDogbm9ybWFsaXplTGFiZWwoZ2V0RmllbGRMYWJlbChlbCkpLCB2YXJpYWJsZTogYmVzdEZpZWxkLCBjb25maWRlbmNlOiBiZXN0U2NvcmUsIHNpZ25hbHM6IHsgY2FjaGVkOiAhIWNhY2hlZEZpZWxkLCBpZE1hdGNoOiBlbC5pZCAmJiBub3JtYWxpemVBbGlhcyhlbC5pZCkuaW5kZXhPZihub3JtYWxpemVBbGlhcyhiZXN0RmllbGQpKSAhPT0gLTEsIG5hbWVNYXRjaDogZWwubmFtZSAmJiBub3JtYWxpemVBbGlhcyhlbC5uYW1lKS5pbmRleE9mKG5vcm1hbGl6ZUFsaWFzKGJlc3RGaWVsZCkpICE9PSAtMSwgbGFiZWxNYXRjaDogISFnZXRGaWVsZExhYmVsKGVsKSB9IH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoKGUpIHt9XG4gICAgICB9XG5cbiAgICAgIC8qIE5vcm1hbGlzYXRpb24gZGVzIGRhdGVzICovXG4gICAgICB2YXIgaXNEYXRlRmllbGQgPSBbXCJkYXRlTmFpc3NhbmNlXCIsIFwiZGF0ZU5haXNzYW5jZVBhdGllbnRcIiwgXCJkYXRlT3Jkb25uYW5jZVwiLCBcImRhdGVWYWxpZGl0ZVwiLCBcImRhdGVEZWJ1dFZhbGlkaXRlXCIsIFwiZGF0ZUZpblZhbGlkaXRlXCIsIFwiZGF0ZU5haXNzYW5jZUFzc3VyZVwiXS5pbmRleE9mKGJlc3RGaWVsZCkgIT09IC0xXG4gICAgICAgIHx8IGVsLnR5cGUgPT09IFwiZGF0ZVwiO1xuXG4gICAgICAvKiBNdWx0aS1zdHJhdGVneSBmaWxsICovXG4gICAgICB2YXIgb2sgPSBhd2FpdCBzbWFydEZpbGxGaWVsZChlbCwgdmFsdWUsIGlzRGF0ZUZpZWxkKTtcbiAgICAgIGlmICghb2spIHtcbiAgICAgICAgZmlsbFJlcG9ydC5mYWlsZWQucHVzaCh7IGxhYmVsOiBub3JtYWxpemVMYWJlbChnZXRGaWVsZExhYmVsKGVsKSksIHZhcmlhYmxlOiBiZXN0RmllbGQsIGNvbmZpZGVuY2U6IGJlc3RTY29yZSwgc2lnbmFsczogeyBjYWNoZWQ6ICEhY2FjaGVkRmllbGQsIGlkTWF0Y2g6IGVsLmlkICYmIG5vcm1hbGl6ZUFsaWFzKGVsLmlkKS5pbmRleE9mKG5vcm1hbGl6ZUFsaWFzKGJlc3RGaWVsZCkpICE9PSAtMSwgbmFtZU1hdGNoOiBlbC5uYW1lICYmIG5vcm1hbGl6ZUFsaWFzKGVsLm5hbWUpLmluZGV4T2Yobm9ybWFsaXplQWxpYXMoYmVzdEZpZWxkKSkgIT09IC0xLCBsYWJlbE1hdGNoOiAhIWdldEZpZWxkTGFiZWwoZWwpIH0gfSk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBmaWxsZWQrKztcbiAgICAgIG1hcmtGaWxsZWRCeUF1ZGlCb3QoZWwsIGJlc3RGaWVsZCk7XG5cbiAgICAgIGlmIChiZXN0U2NvcmUgPj0gNTAgJiYgYmVzdFNjb3JlIDwgODApIHtcbiAgICAgICAgZWwuc2V0QXR0cmlidXRlKFwiZGF0YS1hdWRpYm90LWNvbmZpZGVuY2VcIiwgYmVzdFNjb3JlKTtcbiAgICAgICAgZWwuc2V0QXR0cmlidXRlKFwiZGF0YS1hdWRpYm90LXdhcm5lZFwiLCBcInRydWVcIik7XG4gICAgICAgIGVsLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IFwiI2ZlZjljM1wiO1xuICAgICAgICBlbC5zdHlsZS5vdXRsaW5lID0gXCIycHggc29saWQgI2VhYjMwOFwiO1xuICAgICAgICBlbC50aXRsZSA9IFwiQXVkaUJvdCBcXHUyMDE0IGNvbmZpYW5jZSBcIiArIGJlc3RTY29yZSArIFwiJSAoXCIgKyBiZXN0RmllbGQgKyBcIikgXFx1MjAxNCB2XFx1MDBFOXJpZmllelwiO1xuICAgICAgICBwcm9iYWJsZSsrO1xuICAgICAgICBmaWxsUmVwb3J0Lndhcm5lZC5wdXNoKHsgbGFiZWw6IG5vcm1hbGl6ZUxhYmVsKGdldEZpZWxkTGFiZWwoZWwpKSwgdmFyaWFibGU6IGJlc3RGaWVsZCwgY29uZmlkZW5jZTogYmVzdFNjb3JlLCBzaWduYWxzOiB7IGNhY2hlZDogISFjYWNoZWRGaWVsZCwgaWRNYXRjaDogZWwuaWQgJiYgbm9ybWFsaXplQWxpYXMoZWwuaWQpLmluZGV4T2Yobm9ybWFsaXplQWxpYXMoYmVzdEZpZWxkKSkgIT09IC0xLCBuYW1lTWF0Y2g6IGVsLm5hbWUgJiYgbm9ybWFsaXplQWxpYXMoZWwubmFtZSkuaW5kZXhPZihub3JtYWxpemVBbGlhcyhiZXN0RmllbGQpKSAhPT0gLTEsIGxhYmVsTWF0Y2g6ICEhZ2V0RmllbGRMYWJlbChlbCkgfSB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZpbGxSZXBvcnQuZmlsbGVkLnB1c2goeyBsYWJlbDogbm9ybWFsaXplTGFiZWwoZ2V0RmllbGRMYWJlbChlbCkpLCB2YXJpYWJsZTogYmVzdEZpZWxkLCBjb25maWRlbmNlOiBiZXN0U2NvcmUsIHNpZ25hbHM6IHsgY2FjaGVkOiAhIWNhY2hlZEZpZWxkLCBpZE1hdGNoOiBlbC5pZCAmJiBub3JtYWxpemVBbGlhcyhlbC5pZCkuaW5kZXhPZihub3JtYWxpemVBbGlhcyhiZXN0RmllbGQpKSAhPT0gLTEsIG5hbWVNYXRjaDogZWwubmFtZSAmJiBub3JtYWxpemVBbGlhcyhlbC5uYW1lKS5pbmRleE9mKG5vcm1hbGl6ZUFsaWFzKGJlc3RGaWVsZCkpICE9PSAtMSwgbGFiZWxNYXRjaDogISFnZXRGaWVsZExhYmVsKGVsKSB9IH0pO1xuICAgICAgfVxuICAgIH0gLyogZW5kIGZpbGxQbGFuIGxvb3AgKi9cblxuICAgIC8qIFx1MjUwMFx1MjUwMCBSYWRpbyBidXR0b25zIDogc1x1MDBFOWxlY3Rpb25uZXIgc2Vsb24gbGUgdHlwZSBkZSBwcmVzY3JpcHRpb24gXHUyNTAwXHUyNTAwICovXG4gICAgdmFyIHR5cGVQcmVzY3JpcHRpb24gPSBmaWxsRGF0YVtcInR5cGVQcmVzY3JpcHRpb25cIl0gfHwgXCJcIjtcbiAgICBpZiAodHlwZVByZXNjcmlwdGlvbikge1xuICAgICAgdmFyIGlzTGVudGlsbGVzID0gdHlwZVByZXNjcmlwdGlvbi50b0xvd2VyQ2FzZSgpLmluZGV4T2YoXCJsZW50aWxsZVwiKSAhPT0gLTE7XG4gICAgICB2YXIgYWxsUmFkaW9zID0gcXVlcnlTZWxlY3RvckFsbERlZXAoJ2lucHV0W3R5cGU9XCJyYWRpb1wiXTpub3QoW2Rpc2FibGVkXSknKTtcbiAgICAgIGFsbFJhZGlvcy5mb3JFYWNoKGZ1bmN0aW9uKHJhZGlvKSB7XG4gICAgICAgIHZhciBsYWJlbCA9IFwiXCI7XG4gICAgICAgIHZhciBsYWJlbEVsID0gcmFkaW8uaWQgPyAocmFkaW8uZ2V0Um9vdE5vZGUgPyByYWRpby5nZXRSb290Tm9kZSgpIDogZG9jdW1lbnQpLnF1ZXJ5U2VsZWN0b3IoJ2xhYmVsW2Zvcj1cIicgKyByYWRpby5pZCArICdcIl0nKSA6IG51bGw7XG4gICAgICAgIGlmICghbGFiZWxFbCAmJiByYWRpby5jbG9zZXN0KSBsYWJlbEVsID0gcmFkaW8uY2xvc2VzdChcImxhYmVsXCIpO1xuICAgICAgICBpZiAobGFiZWxFbCkgbGFiZWwgPSBsYWJlbEVsLnRleHRDb250ZW50LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGVsc2UgbGFiZWwgPSAocmFkaW8udmFsdWUgfHwgcmFkaW8uZ2V0QXR0cmlidXRlKFwiYXJpYS1sYWJlbFwiKSB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgIHZhciBpc0xlbnRpbGxlUmFkaW8gPSBsYWJlbC5pbmRleE9mKFwibGVudGlsbGVcIikgIT09IC0xO1xuICAgICAgICB2YXIgaXNMdW5ldHRlUmFkaW8gID0gbGFiZWwuaW5kZXhPZihcImx1bmV0dGVcIikgIT09IC0xIHx8IGxhYmVsLmluZGV4T2YoXCJ2ZXJyZVwiKSAhPT0gLTE7XG5cbiAgICAgICAgaWYgKChpc0xlbnRpbGxlcyAmJiBpc0xlbnRpbGxlUmFkaW8pIHx8ICghaXNMZW50aWxsZXMgJiYgaXNMdW5ldHRlUmFkaW8pKSB7XG4gICAgICAgICAgaWYgKCFyYWRpby5jaGVja2VkKSB7XG4gICAgICAgICAgICByYWRpby5jbGljaygpO1xuICAgICAgICAgICAgcmFkaW8uZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJjaGFuZ2VcIiwgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgICAgICAgICAgIGZpbGxlZCsrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyogXHUyNTAwXHUyNTAwIEFtXHUwMEU5bGlvcmF0aW9uIDkgOiBzYXV2ZWdhcmRlciBsZSByYXBwb3J0IGRlIHJlbXBsaXNzYWdlIFx1MjUwMFx1MjUwMCAqL1xuICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7IGF1ZGlib3RfbGFzdF9maWxsX3JlcG9ydDogZmlsbFJlcG9ydCB9KTtcblxuICAgIC8qIFx1MjUwMFx1MjUwMCBMb2cgaW5qZWN0aW9uIHZlcnMgbGUgYmFja2VuZCAoc3RhdHMgYWRtaW4vZXh0ZW5zaW9uKSBcdTI1MDBcdTI1MDAgKi9cbiAgICBpZiAoZmlsbGVkID4gMCkge1xuICAgICAgZ2V0U3luY1Rva2VuKCkudGhlbihmdW5jdGlvbihzeW5jVG9rZW4pIHtcbiAgICAgICAgaWYgKCFzeW5jVG9rZW4pIHJldHVybjtcbiAgICAgICAgZmV0Y2goXCJodHRwczovL2F1ZGlib3QuZnIvYXBpL2V4dGVuc2lvbi9sb2ctaW5qZWN0aW9uXCIsIHtcbiAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsIFwiQXV0aG9yaXphdGlvblwiOiBcIkJlYXJlciBcIiArIHN5bmNUb2tlbiB9LFxuICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgIHN5bmNUb2tlbjogc3luY1Rva2VuLFxuICAgICAgICAgICAgc2l0ZTogd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLFxuICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgIGZpZWxkc0NvdW50OiBmaWxsZWQsXG4gICAgICAgICAgICBtb2RlOiBcInNtYXJ0ZmlsbFwiLFxuICAgICAgICAgICAgdHM6IERhdGUubm93KClcbiAgICAgICAgICB9KVxuICAgICAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHsgY29uc29sZS53YXJuKFwiW0F1ZGlCb3RdIGxvZy1pbmplY3Rpb24gZmFpbGVkOlwiLCBlcnIpOyB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qIFYzLTI6IFRyYWNrIGZpbGwgcmVzdWx0cyBmb3IgYXV0by1yZXBhaXIgKi9cbiAgICBpZiAodHlwZW9mIHRyYWNrRmlsbFJlc3VsdCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICB2YXIgY3VycmVudEhvc3QgPSB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWU7XG4gICAgICBmb3IgKHZhciBmaSA9IDA7IGZpIDwgZmlsbFJlcG9ydC5maWxsZWQubGVuZ3RoOyBmaSsrKSB0cmFja0ZpbGxSZXN1bHQoY3VycmVudEhvc3QsIGZpbGxSZXBvcnQuZmlsbGVkW2ZpXS52YXJpYWJsZSwgdHJ1ZSk7XG4gICAgICBmb3IgKHZhciBzaSA9IDA7IHNpIDwgZmlsbFJlcG9ydC5za2lwcGVkLmxlbmd0aDsgc2krKykgdHJhY2tGaWxsUmVzdWx0KGN1cnJlbnRIb3N0LCBmaWxsUmVwb3J0LnNraXBwZWRbc2ldLnZhcmlhYmxlIHx8IFwidW5rbm93blwiLCBmYWxzZSk7XG4gICAgICBmb3IgKHZhciBmYWkgPSAwOyBmYWkgPCBmaWxsUmVwb3J0LmZhaWxlZC5sZW5ndGg7IGZhaSsrKSB0cmFja0ZpbGxSZXN1bHQoY3VycmVudEhvc3QsIGZpbGxSZXBvcnQuZmFpbGVkW2ZhaV0udmFyaWFibGUsIGZhbHNlKTtcbiAgICAgIGNoZWNrQW5kUmVwYWlyU2VsZWN0b3JzKGN1cnJlbnRIb3N0KTtcbiAgICB9XG5cbiAgICAvKiBWMy05OiBQcmVkaWN0aXZlIHJlamVjdGlvbiBzY29yaW5nICovXG4gICAgaWYgKHR5cGVvZiBwcmVkaWN0UmVqZWN0aW9uUmlzayA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICB2YXIgcHJlZGljdGlvbiA9IHByZWRpY3RSZWplY3Rpb25SaXNrKGZpbGxSZXBvcnQsIHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSk7XG4gICAgICBpZiAocHJlZGljdGlvbikge1xuICAgICAgICBmaWxsUmVwb3J0LnJlamVjdGlvblJpc2sgPSBwcmVkaWN0aW9uO1xuICAgICAgICBzaG93UmVqZWN0aW9uUmlza0Jhbm5lcihwcmVkaWN0aW9uKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZmlsbGVkID09PSAwKSB7XG4gICAgICBzaG93UlBBVG9hc3QoXCJBdWN1biBjaGFtcCByZWNvbm51IHN1ciBjZXR0ZSBwYWdlLlwiLCBcImVycm9yXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgbXNnID0gZmlsbGVkICsgXCIgY2hhbXBcIiArIChmaWxsZWQgPiAxID8gXCJzXCIgOiBcIlwiKSArIFwiIHJlbXBsaVwiICsgKGZpbGxlZCA+IDEgPyBcInNcIiA6IFwiXCIpO1xuICAgICAgaWYgKHByb2JhYmxlID4gMCkgbXNnICs9IFwiIFxcdTAwQjcgXCIgKyBwcm9iYWJsZSArIFwiIFxcdTAwRTAgdlxcdTAwRTlyaWZpZXIgKGphdW5lKVwiO1xuICAgICAgc2hvd1JQQVRvYXN0KFwiXFx1MjcwNSBcIiArIG1zZywgXCJzdWNjZXNzXCIpO1xuICAgIH1cbiAgICBfcGVyZm9ybWluZ1NtYXJ0RmlsbCA9IGZhbHNlO1xuICB9XG5cbiAgLyogVjMtNTogc2hvdyBwcmV2aWV3IG9yIGZpbGwgaW1tZWRpYXRlbHkgKi9cbiAgaWYgKHByZXZpZXdFbmFibGVkICYmIGZpbGxQbGFuLmxlbmd0aCA+IDUpIHtcbiAgICBzaG93RmlsbFByZXZpZXcoZmlsbFBsYW4sIGV4ZWN1dGVGaWxsLCBmdW5jdGlvbigpIHtcbiAgICAgIF9wZXJmb3JtaW5nU21hcnRGaWxsID0gZmFsc2U7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgYXdhaXQgZXhlY3V0ZUZpbGwoKTtcbiAgfVxuICB9IGZpbmFsbHkge1xuICAgIF9wZXJmb3JtaW5nU21hcnRGaWxsID0gZmFsc2U7XG4gIH1cbn1cblxuLyogXHUyNTAwXHUyNTAwIFYzLTU6IFByZXZpZXcgb3ZlcmxheSBiZWZvcmUgZmlsbCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cbmZ1bmN0aW9uIHNob3dGaWxsUHJldmlldyhpdGVtcywgb25Db25maXJtLCBvbkNhbmNlbCkge1xuICB2YXIgb3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIG92ZXJsYXkuaWQgPSBcImF1ZGlib3QtZmlsbC1wcmV2aWV3XCI7XG4gIG92ZXJsYXkuc3R5bGUuY3NzVGV4dCA9IFwicG9zaXRpb246Zml4ZWQ7dG9wOjA7bGVmdDowO3JpZ2h0OjA7Ym90dG9tOjA7ei1pbmRleDoyMTQ3NDgzNjQ2O2JhY2tncm91bmQ6cmdiYSgwLDAsMCwwLjQpO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtmb250LWZhbWlseTotYXBwbGUtc3lzdGVtLEJsaW5rTWFjU3lzdGVtRm9udCxzYW5zLXNlcmlmO1wiO1xuXG4gIHZhciBwYW5lbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIHBhbmVsLnN0eWxlLmNzc1RleHQgPSBcImJhY2tncm91bmQ6d2hpdGU7Ym9yZGVyLXJhZGl1czoxNnB4O3BhZGRpbmc6MjRweDttYXgtd2lkdGg6NDgwcHg7d2lkdGg6OTAlO21heC1oZWlnaHQ6ODB2aDtvdmVyZmxvdy15OmF1dG87Ym94LXNoYWRvdzowIDIwcHggNjBweCByZ2JhKDAsMCwwLDAuMyk7XCI7XG5cbiAgdmFyIHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgdGl0bGUuc3R5bGUuY3NzVGV4dCA9IFwiZm9udC1zaXplOjE2cHg7Zm9udC13ZWlnaHQ6NzAwO2NvbG9yOiMxMTE7bWFyZ2luLWJvdHRvbToxNnB4O1wiO1xuICB0aXRsZS50ZXh0Q29udGVudCA9IFwiQXVkaUJvdCBcdTIwMTQgQXBlcmN1IGR1IHJlbXBsaXNzYWdlIChcIiArIGl0ZW1zLmxlbmd0aCArIFwiIGNoYW1wcylcIjtcbiAgcGFuZWwuYXBwZW5kQ2hpbGQodGl0bGUpO1xuXG4gIHZhciBsaXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgbGlzdC5zdHlsZS5jc3NUZXh0ID0gXCJtYXgtaGVpZ2h0OjUwdmg7b3ZlcmZsb3cteTphdXRvO1wiO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoICYmIGkgPCAzMDsgaSsrKSB7XG4gICAgdmFyIHJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgcm93LnN0eWxlLmNzc1RleHQgPSBcImRpc3BsYXk6ZmxleDtqdXN0aWZ5LWNvbnRlbnQ6c3BhY2UtYmV0d2VlbjthbGlnbi1pdGVtczpjZW50ZXI7cGFkZGluZzo2cHggMDtib3JkZXItYm90dG9tOjFweCBzb2xpZCAjZjNmNGY2O2ZvbnQtc2l6ZToxM3B4O1wiO1xuXG4gICAgdmFyIGZpZWxkTmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgIGZpZWxkTmFtZS5zdHlsZS5jc3NUZXh0ID0gXCJjb2xvcjojNmI3MjgwO2ZsZXgtc2hyaW5rOjA7d2lkdGg6NDAlO1wiO1xuICAgIGZpZWxkTmFtZS50ZXh0Q29udGVudCA9IGl0ZW1zW2ldLmxhYmVsIHx8IGl0ZW1zW2ldLmZpZWxkO1xuXG4gICAgdmFyIGZpZWxkVmFsdWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICBmaWVsZFZhbHVlLnN0eWxlLmNzc1RleHQgPSBcImNvbG9yOiMxMTE7Zm9udC13ZWlnaHQ6NTAwO3RleHQtYWxpZ246cmlnaHQ7b3ZlcmZsb3c6aGlkZGVuO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7d2hpdGUtc3BhY2U6bm93cmFwO21heC13aWR0aDo1NSU7XCI7XG4gICAgZmllbGRWYWx1ZS50ZXh0Q29udGVudCA9IChpdGVtc1tpXS52YWx1ZSB8fCBcIlwiKS5zdWJzdHJpbmcoMCwgNDApO1xuXG4gICAgcm93LmFwcGVuZENoaWxkKGZpZWxkTmFtZSk7XG4gICAgcm93LmFwcGVuZENoaWxkKGZpZWxkVmFsdWUpO1xuICAgIGxpc3QuYXBwZW5kQ2hpbGQocm93KTtcbiAgfVxuICBpZiAoaXRlbXMubGVuZ3RoID4gMzApIHtcbiAgICB2YXIgbW9yZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgbW9yZS5zdHlsZS5jc3NUZXh0ID0gXCJ0ZXh0LWFsaWduOmNlbnRlcjtjb2xvcjojOWNhM2FmO2ZvbnQtc2l6ZToxMnB4O3BhZGRpbmc6OHB4O1wiO1xuICAgIG1vcmUudGV4dENvbnRlbnQgPSBcIitcIiArIChpdGVtcy5sZW5ndGggLSAzMCkgKyBcIiBjaGFtcHMgc3VwcGxlbWVudGFpcmVzXCI7XG4gICAgbGlzdC5hcHBlbmRDaGlsZChtb3JlKTtcbiAgfVxuICBwYW5lbC5hcHBlbmRDaGlsZChsaXN0KTtcblxuICB2YXIgYnRuUm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgYnRuUm93LnN0eWxlLmNzc1RleHQgPSBcImRpc3BsYXk6ZmxleDtnYXA6MTJweDttYXJnaW4tdG9wOjE2cHg7XCI7XG5cbiAgdmFyIGNhbmNlbEJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gIGNhbmNlbEJ0bi50ZXh0Q29udGVudCA9IFwiQW5udWxlclwiO1xuICBjYW5jZWxCdG4uc3R5bGUuY3NzVGV4dCA9IFwiZmxleDoxO3BhZGRpbmc6MTBweDtib3JkZXI6MXB4IHNvbGlkICNkMWQ1ZGI7Ym9yZGVyLXJhZGl1czo4cHg7YmFja2dyb3VuZDp3aGl0ZTtjb2xvcjojMzc0MTUxO2N1cnNvcjpwb2ludGVyO2ZvbnQtc2l6ZToxM3B4O2ZvbnQtd2VpZ2h0OjYwMDtcIjtcbiAgY2FuY2VsQnRuLm9uY2xpY2sgPSBmdW5jdGlvbigpIHsgb3ZlcmxheS5yZW1vdmUoKTsgaWYgKG9uQ2FuY2VsKSBvbkNhbmNlbCgpOyB9O1xuXG4gIHZhciBjb25maXJtQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgY29uZmlybUJ0bi50ZXh0Q29udGVudCA9IFwiUmVtcGxpciBcIiArIGl0ZW1zLmxlbmd0aCArIFwiIGNoYW1wc1wiO1xuICBjb25maXJtQnRuLnN0eWxlLmNzc1RleHQgPSBcImZsZXg6MTtwYWRkaW5nOjEwcHg7Ym9yZGVyOm5vbmU7Ym9yZGVyLXJhZGl1czo4cHg7YmFja2dyb3VuZDojMjU2M2ViO2NvbG9yOndoaXRlO2N1cnNvcjpwb2ludGVyO2ZvbnQtc2l6ZToxM3B4O2ZvbnQtd2VpZ2h0OjcwMDtcIjtcbiAgY29uZmlybUJ0bi5vbmNsaWNrID0gZnVuY3Rpb24oKSB7IG92ZXJsYXkucmVtb3ZlKCk7IGlmIChvbkNvbmZpcm0pIG9uQ29uZmlybSgpOyB9O1xuXG4gIGJ0blJvdy5hcHBlbmRDaGlsZChjYW5jZWxCdG4pO1xuICBidG5Sb3cuYXBwZW5kQ2hpbGQoY29uZmlybUJ0bik7XG4gIHBhbmVsLmFwcGVuZENoaWxkKGJ0blJvdyk7XG5cbiAgb3ZlcmxheS5hcHBlbmRDaGlsZChwYW5lbCk7XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQob3ZlcmxheSk7XG59XG5cbi8qIFx1MjUwMFx1MjUwMCBpZnJhbWVzIGNyb3NzLWRvbWFpbiBwb3N0TWVzc2FnZSBsaXN0ZW5lciBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cFBvc3RNZXNzYWdlTGlzdGVuZXIoKSB7XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBmdW5jdGlvbihlKSB7XG4gICAgaWYgKGUub3JpZ2luICE9PSB3aW5kb3cubG9jYXRpb24ub3JpZ2luKSByZXR1cm47XG4gICAgaWYgKCFlLmRhdGEgfHwgZS5kYXRhLnR5cGUgIT09IFwiQVVESUJPVF9GSUxMX0ZSQU1FXCIgfHwgIWUuZGF0YS5wYXlsb2FkKSByZXR1cm47XG4gICAgcGVyZm9ybVNtYXJ0RmlsbChlLmRhdGEucGF5bG9hZCk7XG4gIH0sIGZhbHNlKTtcbn1cbiIsICIvKiBcdTI1MDBcdTI1MDAgU3RhbmRhcmQgRmlsbCBcdTIwMTQgcGVyZm9ybUZpbGwgKyBjaGVja0Ryb2l0c011dHVlbGxlIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcGVyZm9ybUZpbGwoKSB7XG4gIGxldCBkYXRhID0ge307XG4gIHRyeSB7XG4gICAgY29uc3QgdGV4dCA9IGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQucmVhZFRleHQoKTtcbiAgICBkYXRhID0gSlNPTi5wYXJzZSh0ZXh0KTtcblxuICAgIC8vIFNhdXZlZ2FyZGUgYXV0b21hdGlxdWUgZGVzIGRvbm5cdTAwRTllcyBkdSBwcmVzc2UtcGFwaWVyIGRhbnMgbGUgY2FjaGVcbiAgICBpZiAoZGF0YS5tIHx8IGRhdGEubykge1xuICAgICAgY29uc3Qgbm9tID0gKGRhdGEubT8ubm9tIHx8IGRhdGEubz8ubm9tUGF0aWVudCB8fCBcIlwiKS50b1VwcGVyQ2FzZSgpO1xuXG4gICAgICBpZiAobm9tKSB7XG4gICAgICAgIHdyaXRlRW5jcnlwdGVkQ2FjaGUoe1xuICAgICAgICAgIGN1cnJlbnQ6IHtcbiAgICAgICAgICAgIC4uLmRhdGEubSxcbiAgICAgICAgICAgIG9yZG9ubmFuY2U6IGRhdGEubyB8fCB7fSxcbiAgICAgICAgICAgIHVwZGF0ZWRBdDogRGF0ZS5ub3coKVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvKiBQcmVzc2UtcGFwaWVyIHZpZGUgb3UgaW52YWxpZGUgXHUyMDE0IHV0aWxpc2F0aW9uIGR1IGNhY2hlIGxvY2FsICovXG4gIH1cblxuICAvKiBCcm9hZGNhc3QgYXV4IGlmcmFtZXMgY3Jvc3MtZG9tYWluIHZpYSBwb3N0TWVzc2FnZSAqL1xuICB2YXIgZnJhbWVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcImlmcmFtZVwiKTtcbiAgZm9yICh2YXIgZmkgPSAwOyBmaSA8IGZyYW1lcy5sZW5ndGg7IGZpKyspIHtcbiAgICB0cnkgeyBpZiAoZnJhbWVzW2ZpXS5zcmMpIHsgdmFyIGZyYW1lT3JpZ2luID0gbmV3IFVSTChmcmFtZXNbZmldLnNyYykub3JpZ2luOyBmcmFtZXNbZmldLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UoeyB0eXBlOiBcIkFVRElCT1RfRklMTF9GUkFNRVwiLCBwYXlsb2FkOiBkYXRhIH0sIGZyYW1lT3JpZ2luKTsgfSB9IGNhdGNoKGUpIHt9XG4gIH1cblxuICBjb25zdCBjdXJyZW50U2l0ZSA9IE9iamVjdC52YWx1ZXMoQ09ORklHUykuZmluZChjZmcgPT4gY2ZnLmlzTWF0Y2goKSk7XG4gIGlmICghY3VycmVudFNpdGUpIHJldHVybjtcblxuICBkYXRhLmNhY2hlZCA9IGF3YWl0IGdldENhY2hlZENsaWVudChkYXRhKTtcblxuICAvKiBWXHUwMEU5cmlmaWNhdGlvbiBkcm9pdHMgbXV0dWVsbGUgKi9cbiAgY2hlY2tEcm9pdHNNdXR1ZWxsZShkYXRhKTtcblxuICBjb25zdCBzdWNjZXNzID0gY3VycmVudFNpdGUuYWN0aW9ucy5mb3JtdWxhaXJlKGRhdGEpO1xuICBjb25zdCBzaXRlID0gY3VycmVudFNpdGUubmFtZTtcbiAgY29uc3QgZmllbGRzQ291bnQgPSBPYmplY3Qua2V5cyhkYXRhLmNhY2hlZCB8fCBkYXRhLm0gfHwge30pLmxlbmd0aDtcblxuICAvKiBNb25pdG9yaW5nIDogbG9nIGxvY2FsICsgZW52b2kgQVBJIGJlc3QtZWZmb3J0ICovXG4gIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbXCJhdWRpYm90X2luamVjdGlvbl9sb2dcIl0sIChsb2dSZXN1bHQpID0+IHtcbiAgICBjb25zdCBsb2cgPSBsb2dSZXN1bHQuYXVkaWJvdF9pbmplY3Rpb25fbG9nIHx8IFtdO1xuICAgIGxvZy51bnNoaWZ0KHtcbiAgICAgIHRzOiBEYXRlLm5vdygpLFxuICAgICAgc2l0ZSxcbiAgICAgIHN1Y2Nlc3MsXG4gICAgICBmaWVsZHNDb3VudCxcbiAgICAgIHN5bmNUb2tlbjogZGF0YS5zeW5jVG9rZW4gfHwgbnVsbFxuICAgIH0pO1xuICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7IGF1ZGlib3RfaW5qZWN0aW9uX2xvZzogbG9nLnNsaWNlKDAsIDEwMCkgfSk7XG4gIH0pO1xuXG4gIC8qIEVudm95ZXIgbGVzIHBpbmdzIHZpYSBsZSBiYWNrZ3JvdW5kIHNlcnZpY2Ugd29ya2VyIHBvdXIgXHUwMEU5dml0ZXIgQ09SUyAqL1xuICB2YXIgZXh0VmVyc2lvbiA9ICh0eXBlb2YgY2hyb21lICE9PSBcInVuZGVmaW5lZFwiICYmIGNocm9tZS5ydW50aW1lICYmIGNocm9tZS5ydW50aW1lLmdldE1hbmlmZXN0KVxuICAgID8gY2hyb21lLnJ1bnRpbWUuZ2V0TWFuaWZlc3QoKS52ZXJzaW9uXG4gICAgOiBcImJvb2ttYXJrbGV0XCI7XG4gIHZhciBwaW5nUGF5bG9hZHMgPSBbXTtcbiAgY29uc3Qgc3luY1Rva2VuID0gZGF0YS5zeW5jVG9rZW4gfHwgbnVsbDtcbiAgaWYgKHN5bmNUb2tlbiAmJiBzdWNjZXNzICE9PSB1bmRlZmluZWQpIHtcbiAgICBwaW5nUGF5bG9hZHMucHVzaCh7IHVybDogXCJodHRwczovL2F1ZGlib3QuZnIvYXBpL2V4dGVuc2lvbi9sb2ctaW5qZWN0aW9uXCIsIGJvZHk6IHsgc3luY1Rva2VuLCBzaXRlLCBzdWNjZXNzLCBmaWVsZHNDb3VudCwgdHM6IERhdGUubm93KCkgfSB9KTtcbiAgfVxuICBwaW5nUGF5bG9hZHMucHVzaCh7IHVybDogXCJodHRwczovL2F1ZGlib3QuZnIvYXBpL2Jvb2ttYXJrbGV0L3BpbmdcIiwgYm9keToge1xuICAgIHZlcnNpb246IGV4dFZlcnNpb24sIHBvcnRhbDogc2l0ZSB8fCBcInVua25vd25cIixcbiAgICBzdGF0dXM6IHN1Y2Nlc3MgPyBcIm9rXCIgOiAoZmllbGRzQ291bnQgPT09IDAgPyBcImJyb2tlblwiIDogXCJwYXJ0aWFsXCIpLFxuICAgIGVycm9ySGludDogc3VjY2VzcyA/IG51bGwgOiAoXCJmaWVsZHM9XCIgKyBmaWVsZHNDb3VudClcbiAgfX0pO1xuICB0cnkge1xuICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHsgdHlwZTogXCJBVURJQk9UX1BJTkdcIiwgcGF5bG9hZHM6IHBpbmdQYXlsb2FkcyB9KTtcbiAgfSBjYXRjaChlKSB7IC8qIGphbWFpcyBibG9xdWVyIGwnVUkgKi8gfVxuXG4gIGlmIChzdWNjZXNzKSB7XG4gICAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2F1ZGlib3QtZmlsbC1idG4nKTtcbiAgICBpZiAoYnRuKSB7XG4gICAgICBidG4uaW5uZXJUZXh0ID0gYFxcdTI3MTMgUmVtcGxpICFgO1xuICAgICAgYnRuLnN0eWxlLmJhY2tncm91bmQgPSAnIzEwYjk4MSc7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgYnRuLmlubmVyVGV4dCA9ICdcXHVEODNFXFx1REQxNiBSZW1wbGlyJztcbiAgICAgICAgYnRuLnN0eWxlLmJhY2tncm91bmQgPSAnIzI1NjNlYic7XG4gICAgICB9LCAyMDAwKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgYWxlcnQoYEF1ZGlCb3QgOiBBdWN1biBmb3JtdWxhaXJlIGRcXHUwMEU5dGVjdFxcdTAwRTkuYCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrRHJvaXRzTXV0dWVsbGUoZGF0YSkge1xuICB2YXIgbSA9IGRhdGEubSB8fCBkYXRhIHx8IHt9O1xuICB2YXIgZGF0ZUZpbiA9IG0uZGF0ZUZpblZhbGlkaXRlIHx8IFwiXCI7XG4gIHZhciBkYXRlRGVidXQgPSBtLmRhdGVEZWJ1dFZhbGlkaXRlIHx8IFwiXCI7XG4gIHZhciB0b2RheSA9IG5ldyBEYXRlKCk7XG4gIHRvZGF5LnNldEhvdXJzKDAsIDAsIDAsIDApO1xuXG4gIGlmIChkYXRlRmluKSB7XG4gICAgdmFyIHBhcnRzID0gZGF0ZUZpbi5tYXRjaCgvKFxcZHsyfSlbXFwvXFwtXShcXGR7Mn0pW1xcL1xcLV0oXFxkezR9KS8pO1xuICAgIGlmIChwYXJ0cykge1xuICAgICAgdmFyIGZpbkRhdGUgPSBuZXcgRGF0ZShwYXJzZUludChwYXJ0c1szXSksIHBhcnNlSW50KHBhcnRzWzJdKSAtIDEsIHBhcnNlSW50KHBhcnRzWzFdKSk7XG4gICAgICBpZiAoZmluRGF0ZSA8IHRvZGF5KSB7XG4gICAgICAgIHNob3dSUEFUb2FzdChcIlxcdTI2RDQgRHJvaXRzIG11dHVlbGxlIGV4cGlyXFx1MDBFOXMgZGVwdWlzIGxlIFwiICsgZGF0ZUZpbiwgXCJlcnJvclwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyIGRpZmZEYXlzID0gTWF0aC5jZWlsKChmaW5EYXRlIC0gdG9kYXkpIC8gKDEwMDAgKiA2MCAqIDYwICogMjQpKTtcbiAgICAgIGlmIChkaWZmRGF5cyA8PSAzMCkge1xuICAgICAgICBzaG93UlBBVG9hc3QoXCJcXHUyNkEwXFx1RkUwRiBEcm9pdHMgbXV0dWVsbGUgZXhwaXJlbnQgZGFucyBcIiArIGRpZmZEYXlzICsgXCIgam91clwiICsgKGRpZmZEYXlzID4gMSA/IFwic1wiIDogXCJcIikgKyBcIiAoXCIgKyBkYXRlRmluICsgXCIpXCIsIFwid2FybmluZ1wiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChkYXRlRGVidXQpIHtcbiAgICB2YXIgcGFydHNEID0gZGF0ZURlYnV0Lm1hdGNoKC8oXFxkezJ9KVtcXC9cXC1dKFxcZHsyfSlbXFwvXFwtXShcXGR7NH0pLyk7XG4gICAgaWYgKHBhcnRzRCkge1xuICAgICAgdmFyIGRlYnV0RGF0ZSA9IG5ldyBEYXRlKHBhcnNlSW50KHBhcnRzRFszXSksIHBhcnNlSW50KHBhcnRzRFsyXSkgLSAxLCBwYXJzZUludChwYXJ0c0RbMV0pKTtcbiAgICAgIGlmIChkZWJ1dERhdGUgPiB0b2RheSkge1xuICAgICAgICBzaG93UlBBVG9hc3QoXCJcXHUyNkEwXFx1RkUwRiBEcm9pdHMgbXV0dWVsbGUgcGFzIGVuY29yZSBhY3RpZnMgKGRcXHUwMEU5YnV0IDogXCIgKyBkYXRlRGVidXQgKyBcIilcIiwgXCJ3YXJuaW5nXCIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIiwgIi8qIFx1MjUwMFx1MjUwMCBSZXBsYXkgRW5naW5lIFx1MjAxNCBQYXJjb3VycyBSUEEgRHluYW1pcXVlIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuLyogTGVzIHZhbGV1cnMgcGF0aWVudCB2aWVubmVudCBkdSBjYWNoZSBMT0NBTCBjaGlmZnJcdTAwRTkgXHUyMDE0IGphbWFpcyBkdSBzZXJ2ZXVyICAgICovXG5cbi8qIFx1MjUwMFx1MjUwMCBGb3JtYXRhZ2UgTlNTIGF1dG9tYXRpcXVlIHNlbG9uIGxlIGNvbnRleHRlIGR1IGNoYW1wIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuZnVuY3Rpb24gZm9ybWF0TlNTKHJhd05TUywgZWwpIHtcbiAgaWYgKCFyYXdOU1MpIHJldHVybiByYXdOU1M7XG4gIHZhciBkaWdpdHMgPSByYXdOU1MucmVwbGFjZSgvXFxEL2csIFwiXCIpO1xuXG4gIC8qIERcdTAwRTl0ZWN0ZXIgbGUgZm9ybWF0IGF0dGVuZHUgcGFyIGxlIGNoYW1wICovXG4gIHZhciBtYXhMZW4gPSBlbCA/IHBhcnNlSW50KGVsLmdldEF0dHJpYnV0ZShcIm1heGxlbmd0aFwiKSB8fCBcIjBcIikgOiAwO1xuICB2YXIgcGxhY2Vob2xkZXIgPSBlbCA/IChlbC5wbGFjZWhvbGRlciB8fCBcIlwiKSA6IFwiXCI7XG4gIHZhciBuYW1lID0gZWwgPyAoZWwubmFtZSB8fCBcIlwiKSA6IFwiXCI7XG5cbiAgLyogQ2hhbXAgcXVpIGF0dGVuZCAxMyBjaGlmZnJlcyAoc2FucyBjbFx1MDBFOSkgKi9cbiAgaWYgKG1heExlbiA9PT0gMTMgfHwgbmFtZS5pbmRleE9mKFwiMTNcIikgIT09IC0xIHx8IHBsYWNlaG9sZGVyLm1hdGNoKC9cXGR7MTN9JC8pKSB7XG4gICAgcmV0dXJuIGRpZ2l0cy5zbGljZSgwLCAxMyk7XG4gIH1cbiAgLyogQ2hhbXAgcXVpIGF0dGVuZCBqdXN0ZSBsYSBjbFx1MDBFOSAoMiBjaGlmZnJlcykgKi9cbiAgaWYgKG1heExlbiA9PT0gMiAmJiAobmFtZS5pbmRleE9mKFwiY2xlXCIpICE9PSAtMSB8fCBuYW1lLmluZGV4T2YoXCJrZXlcIikgIT09IC0xKSkge1xuICAgIHJldHVybiBkaWdpdHMuc2xpY2UoMTMsIDE1KTtcbiAgfVxuICAvKiBDaGFtcCBhdmVjIGVzcGFjZXMgKGZvcm1hdCBsaXNpYmxlKSAqL1xuICBpZiAocGxhY2Vob2xkZXIubWF0Y2goL1xcZFxcc1xcZC8pIHx8IG1heExlbiA+IDE1KSB7XG4gICAgaWYgKGRpZ2l0cy5sZW5ndGggPj0gMTUpIHtcbiAgICAgIHJldHVybiBkaWdpdHNbMF0gKyBcIiBcIiArIGRpZ2l0cy5zbGljZSgxLCAzKSArIFwiIFwiICsgZGlnaXRzLnNsaWNlKDMsIDUpICsgXCIgXCIgKyBkaWdpdHMuc2xpY2UoNSwgNykgKyBcIiBcIiArIGRpZ2l0cy5zbGljZSg3LCAxMCkgKyBcIiBcIiArIGRpZ2l0cy5zbGljZSgxMCwgMTMpICsgXCIgXCIgKyBkaWdpdHMuc2xpY2UoMTMsIDE1KTtcbiAgICB9XG4gIH1cbiAgLyogUGFyIGRcdTAwRTlmYXV0IDogcmV0b3VybmVyIGxlcyAxNSBjaGlmZnJlcyBicnV0cyAqL1xuICByZXR1cm4gZGlnaXRzLnNsaWNlKDAsIDE1KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVWYXJpYWJsZXModGVtcGxhdGUsIGNhY2hlLCBlbCkge1xuICBpZiAoIXRlbXBsYXRlKSByZXR1cm4gXCJcIjtcbiAgdmFyIG0gPSBjYWNoZS5jdXJyZW50IHx8IHt9O1xuICB2YXIgbyA9IG0ub3Jkb25uYW5jZSB8fCB7fTtcbiAgdmFyIG9kID0gby5sdW5ldHRlc09EIHx8IHt9O1xuICB2YXIgb2cgPSBvLmx1bmV0dGVzT0cgfHwge307XG4gIHZhciBwMCA9IChtLnBlcnNvbm5lcyAmJiBtLnBlcnNvbm5lc1swXSkgfHwge307XG4gIHZhciBwcmVzID0gbS5wcmVzY3JpcHRpb24gfHwge307XG4gIHZhciByZWdpbWVzID0gbS5yZWdpbWVzIHx8IHt9O1xuICB2YXIgcmMxID0gcmVnaW1lcy5yYzEgfHwge307XG4gIHZhciBsb2QgPSBvLmxlbnRpbGxlc09EIHx8IHt9O1xuICB2YXIgbG9nID0gby5sZW50aWxsZXNPRyB8fCB7fTtcblxuICAvKiBOU1MgZm9ybWF0XHUwMEU5IHNlbG9uIGxlIGNoYW1wIGNpYmxlICovXG4gIHZhciBuc3NSYXcgPSBtLm51bWVyb1NlY3VyaXRlU29jaWFsZSB8fCBtLm5zcyB8fCBcIlwiO1xuICB2YXIgbnNzRm9ybWF0dGVkID0gdGVtcGxhdGUgPT09IFwie3tuc3N9fVwiID8gZm9ybWF0TlNTKG5zc1JhdywgZWwpIDogbnNzUmF3O1xuXG4gIHZhciB2YXJzID0ge1xuICAgIC8qIFBhdGllbnQgKi9cbiAgICBcInt7bm9tfX1cIjogKG0ubm9tIHx8IHAwLm5vbSB8fCBcIlwiKS50b1VwcGVyQ2FzZSgpLFxuICAgIFwie3twcmVub219fVwiOiBtLnByZW5vbSB8fCBwMC5wcmVub20gfHwgXCJcIixcbiAgICBcInt7bnNzfX1cIjogbnNzRm9ybWF0dGVkLFxuICAgIFwie3tkYXRlTmFpc3NhbmNlfX1cIjogbS5kYXRlTmFpc3NhbmNlIHx8IG0uZG9iIHx8IFwiXCIsXG4gICAgLyogQ29udGFjdCAqL1xuICAgIFwie3t0ZWxlcGhvbmV9fVwiOiBtLnBob25lIHx8IG0udGVsZXBob25lIHx8IFwiXCIsXG4gICAgXCJ7e2VtYWlsfX1cIjogbS5lbWFpbCB8fCBcIlwiLFxuICAgIFwie3thZHJlc3NlfX1cIjogbS5hZGRyZXNzIHx8IG0uYWRyZXNzZSB8fCBcIlwiLFxuICAgIFwie3tjb2RlUG9zdGFsfX1cIjogbS56aXBDb2RlIHx8IG0uY29kZVBvc3RhbCB8fCBcIlwiLFxuICAgIFwie3t2aWxsZX19XCI6IG0uY2l0eSB8fCBtLnZpbGxlIHx8IFwiXCIsXG4gICAgLyogTXV0dWVsbGUgKi9cbiAgICBcInt7b3JnYW5pc21lfX1cIjogbS5vcmdhbmlzbWUgfHwgcmMxLm5vbSB8fCBcIlwiLFxuICAgIFwie3tudW1lcm9BZGhlcmVudH19XCI6IG0ubnVtZXJvQWRoZXJlbnQgfHwgcmMxLm51bWVyb0FkaGVyZW50IHx8IFwiXCIsXG4gICAgXCJ7e251bWVyb0FNQ319XCI6IG0ubnVtZXJvQU1DIHx8IFwiXCIsXG4gICAgXCJ7e251bWVyb1RlbGV0cmFuc21pc3Npb259fVwiOiBtLm51bWVyb1RlbGV0cmFuc21pc3Npb24gfHwgcmMxLm51bWVyb1RlbGV0cmFuc21pc3Npb24gfHwgXCJcIixcbiAgICBcInt7Y3JpdGVyZVNlY29uZGFpcmV9fVwiOiBtLmNyaXRlcmVTZWNvbmRhaXJlIHx8IHJjMS5jcml0ZXJlU2Vjb25kYWlyZSB8fCBcIlwiLFxuICAgIFwie3tjb2RlQ29udmVudGlvbn19XCI6IG0uY29kZUNvbnZlbnRpb24gfHwgcmMxLmNvZGVDb252ZW50aW9uIHx8IFwiXCIsXG4gICAgXCJ7e2RhdGVEZWJ1dFZhbGlkaXRlfX1cIjogbS5kYXRlRGVidXRWYWxpZGl0ZSB8fCByYzEuZGF0ZURlYnV0IHx8IFwiXCIsXG4gICAgXCJ7e2RhdGVGaW5WYWxpZGl0ZX19XCI6IG0uZGF0ZUZpblZhbGlkaXRlIHx8IHJjMS5kYXRlRmluIHx8IFwiXCIsXG4gICAgLyogUHJlc2NyaXB0aW9uICovXG4gICAgXCJ7e2RhdGVPcmRvbm5hbmNlfX1cIjogby5kYXRlT3Jkb25uYW5jZSB8fCBwcmVzLmRhdGVQcmVzY3JpcHRpb24gfHwgXCJcIixcbiAgICBcInt7bm9tT3BodGFsbW9sb2d1ZX19XCI6IG8ubm9tT3BodGFsbW9sb2d1ZSB8fCBwcmVzLnByZXNjcmlwdGV1ciB8fCBcIlwiLFxuICAgIFwie3tycHBzfX1cIjogby5ycHBzIHx8IHByZXMucnBwcyB8fCBcIlwiLFxuICAgIFwie3tkaXN0YW5jZVB1cGlsbGFpcmV9fVwiOiBvLmRpc3RhbmNlUHVwaWxsYWlyZSB8fCBcIlwiLFxuICAgIFwie3t0eXBlUHJlc2NyaXB0aW9ufX1cIjogby50eXBlUHJlc2NyaXB0aW9uIHx8IHByZXMudHlwZVZpc2lvbiB8fCBcIlwiLFxuICAgIC8qIEx1bmV0dGVzIE9EICovXG4gICAgXCJ7e3NwaGVyZV9vZH19XCI6IG9kLnNwaGVyZSB8fCBcIlwiLFxuICAgIFwie3tjeWxpbmRyZV9vZH19XCI6IG9kLmN5bGluZHJlIHx8IFwiXCIsXG4gICAgXCJ7e2F4ZV9vZH19XCI6IG9kLmF4ZSB8fCBcIlwiLFxuICAgIFwie3thZGRpdGlvbl9vZH19XCI6IG9kLmFkZGl0aW9uIHx8IFwiXCIsXG4gICAgLyogTHVuZXR0ZXMgT0cgKi9cbiAgICBcInt7c3BoZXJlX29nfX1cIjogb2cuc3BoZXJlIHx8IFwiXCIsXG4gICAgXCJ7e2N5bGluZHJlX29nfX1cIjogb2cuY3lsaW5kcmUgfHwgXCJcIixcbiAgICBcInt7YXhlX29nfX1cIjogb2cuYXhlIHx8IFwiXCIsXG4gICAgXCJ7e2FkZGl0aW9uX29nfX1cIjogb2cuYWRkaXRpb24gfHwgXCJcIixcbiAgICAvKiBBZGRpdGlvbiBnXHUwMEU5blx1MDBFOXJpcXVlICovXG4gICAgXCJ7e2FkZGl0aW9ufX1cIjogb2QuYWRkaXRpb24gfHwgb2cuYWRkaXRpb24gfHwgXCJcIixcbiAgICAvKiBMZW50aWxsZXMgT0QgKi9cbiAgICBcInt7c3BoZXJlX2xlbnRpbGxlX29kfX1cIjogbG9kLnNwaGVyZSB8fCBcIlwiLFxuICAgIFwie3tjeWxpbmRyZV9sZW50aWxsZV9vZH19XCI6IGxvZC5jeWxpbmRyZSB8fCBcIlwiLFxuICAgIFwie3theGVfbGVudGlsbGVfb2R9fVwiOiBsb2QuYXhlIHx8IFwiXCIsXG4gICAgXCJ7e2FkZGl0aW9uX2xlbnRpbGxlX29kfX1cIjogbG9kLmFkZGl0aW9uIHx8IFwiXCIsXG4gICAgXCJ7e3JheW9uX29kfX1cIjogbG9kLnJheW9uQ291cmJ1cmUgfHwgXCJcIixcbiAgICBcInt7ZGlhbWV0cmVfb2R9fVwiOiBsb2QuZGlhbWV0cmUgfHwgXCJcIixcbiAgICAvKiBMZW50aWxsZXMgT0cgKi9cbiAgICBcInt7c3BoZXJlX2xlbnRpbGxlX29nfX1cIjogbG9nLnNwaGVyZSB8fCBcIlwiLFxuICAgIFwie3tjeWxpbmRyZV9sZW50aWxsZV9vZ319XCI6IGxvZy5jeWxpbmRyZSB8fCBcIlwiLFxuICAgIFwie3theGVfbGVudGlsbGVfb2d9fVwiOiBsb2cuYXhlIHx8IFwiXCIsXG4gICAgXCJ7e2FkZGl0aW9uX2xlbnRpbGxlX29nfX1cIjogbG9nLmFkZGl0aW9uIHx8IFwiXCIsXG4gICAgXCJ7e3JheW9uX29nfX1cIjogbG9nLnJheW9uQ291cmJ1cmUgfHwgXCJcIixcbiAgICBcInt7ZGlhbWV0cmVfb2d9fVwiOiBsb2cuZGlhbWV0cmUgfHwgXCJcIixcbiAgfTtcbiAgdmFyIHJlc3VsdCA9IHRlbXBsYXRlO1xuICBmb3IgKHZhciBrZXkgaW4gdmFycykgeyByZXN1bHQgPSByZXN1bHQuc3BsaXQoa2V5KS5qb2luKHZhcnNba2V5XSk7IH1cbiAgaWYgKHJlc3VsdCA9PT0gXCJcIiB8fCByZXN1bHQgPT09IHRlbXBsYXRlKSByZXR1cm4gXCJcIjtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyogXHUyNTAwXHUyNTAwIFNjcm9sbCBsJ1x1MDBFOWxcdTAwRTltZW50IGRhbnMgbGEgdnVlIGF2YW50IGludGVyYWN0aW9uIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuZnVuY3Rpb24gc2Nyb2xsSW50b1ZpZXdJZk5lZWRlZChlbCkge1xuICBpZiAoIWVsKSByZXR1cm47XG4gIHZhciByZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIHZhciBpblZpZXcgPSByZWN0LnRvcCA+PSAwICYmIHJlY3QuYm90dG9tIDw9IHdpbmRvdy5pbm5lckhlaWdodCAmJlxuICAgICAgICAgICAgICAgcmVjdC5sZWZ0ID49IDAgJiYgcmVjdC5yaWdodCA8PSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgaWYgKCFpblZpZXcpIHtcbiAgICBlbC5zY3JvbGxJbnRvVmlldyh7IGJlaGF2aW9yOiBcInNtb290aFwiLCBibG9jazogXCJjZW50ZXJcIiwgaW5saW5lOiBcImNlbnRlclwiIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzRGF0ZVZhcmlhYmxlKHZhcmlhYmxlKSB7XG4gIGlmICghdmFyaWFibGUpIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuIHZhcmlhYmxlLmluZGV4T2YoXCJkYXRlXCIpICE9PSAtMSB8fCB2YXJpYWJsZS5pbmRleE9mKFwiRGF0ZVwiKSAhPT0gLTEgfHxcbiAgICAgICAgIHZhcmlhYmxlLmluZGV4T2YoXCJuYWlzc2FuY2VcIikgIT09IC0xIHx8IHZhcmlhYmxlLmluZGV4T2YoXCJOYWlzc2FuY2VcIikgIT09IC0xO1xufVxuXG5mdW5jdGlvbiBmcmFtZXdvcmtEZWxheShtcykge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocikgeyBzZXRUaW1lb3V0KHIsIG1zIHx8IDE1MCk7IH0pO1xufVxuXG4vKiBcdTI1MDBcdTI1MDAgUHJvZ3Jlc3MgT3ZlcmxheSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cblxudmFyIF9wcm9ncmVzc092ZXJsYXkgPSBudWxsO1xuXG5mdW5jdGlvbiBzaG93UHJvZ3Jlc3NPdmVybGF5KGN1cnJlbnQsIHRvdGFsLCBsYWJlbCkge1xuICBpZiAoIV9wcm9ncmVzc092ZXJsYXkpIHtcbiAgICBfcHJvZ3Jlc3NPdmVybGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBfcHJvZ3Jlc3NPdmVybGF5LmlkID0gXCJhdWRpYm90LXJlcGxheS1wcm9ncmVzc1wiO1xuICAgIF9wcm9ncmVzc092ZXJsYXkuc3R5bGUuY3NzVGV4dCA9IFwicG9zaXRpb246Zml4ZWQ7Ym90dG9tOjIwcHg7bGVmdDo1MCU7dHJhbnNmb3JtOnRyYW5zbGF0ZVgoLTUwJSk7ei1pbmRleDoyMTQ3NDgzNjQ3O2JhY2tncm91bmQ6d2hpdGU7Ym9yZGVyLXJhZGl1czoxMnB4O2JveC1zaGFkb3c6MCA0cHggMjBweCByZ2JhKDAsMCwwLDAuMTUpO3BhZGRpbmc6MTJweCAyMHB4O2ZvbnQtZmFtaWx5OnNhbnMtc2VyaWY7bWluLXdpZHRoOjI4MHB4O1wiO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoX3Byb2dyZXNzT3ZlcmxheSk7XG4gIH1cblxuICB2YXIgcGN0ID0gTWF0aC5yb3VuZCgoY3VycmVudCAvIHRvdGFsKSAqIDEwMCk7XG4gIF9wcm9ncmVzc092ZXJsYXkuaW5uZXJIVE1MID1cbiAgICAnPGRpdiBzdHlsZT1cImRpc3BsYXk6ZmxleDtqdXN0aWZ5LWNvbnRlbnQ6c3BhY2UtYmV0d2VlbjthbGlnbi1pdGVtczpjZW50ZXI7bWFyZ2luLWJvdHRvbTo2cHg7XCI+JyArXG4gICAgICAnPHNwYW4gc3R5bGU9XCJmb250LXNpemU6MTJweDtmb250LXdlaWdodDo2MDA7Y29sb3I6IzM3NDE1MTtcIj5cXHUyNjk5XFx1RkUwRiBSUEEgZW4gY291cnM8L3NwYW4+JyArXG4gICAgICAnPHNwYW4gc3R5bGU9XCJmb250LXNpemU6MTFweDtjb2xvcjojNmI3MjgwO1wiPicgKyBjdXJyZW50ICsgJy8nICsgdG90YWwgKyAnPC9zcGFuPicgK1xuICAgICc8L2Rpdj4nICtcbiAgICAnPGRpdiBzdHlsZT1cImhlaWdodDo0cHg7YmFja2dyb3VuZDojZTVlN2ViO2JvcmRlci1yYWRpdXM6MnB4O292ZXJmbG93OmhpZGRlbjtcIj4nICtcbiAgICAgICc8ZGl2IHN0eWxlPVwiaGVpZ2h0OjEwMCU7YmFja2dyb3VuZDojM2I4MmY2O2JvcmRlci1yYWRpdXM6MnB4O3dpZHRoOicgKyBwY3QgKyAnJTt0cmFuc2l0aW9uOndpZHRoIDAuM3M7XCI+PC9kaXY+JyArXG4gICAgJzwvZGl2PicgK1xuICAgICc8ZGl2IHN0eWxlPVwiZm9udC1zaXplOjExcHg7Y29sb3I6IzljYTNhZjttYXJnaW4tdG9wOjRweDtvdmVyZmxvdzpoaWRkZW47dGV4dC1vdmVyZmxvdzplbGxpcHNpczt3aGl0ZS1zcGFjZTpub3dyYXA7XCI+JyArIChsYWJlbCB8fCBcIlwiKSArICc8L2Rpdj4nO1xufVxuXG5mdW5jdGlvbiBoaWRlUHJvZ3Jlc3NPdmVybGF5KCkge1xuICBpZiAoX3Byb2dyZXNzT3ZlcmxheSkge1xuICAgIF9wcm9ncmVzc092ZXJsYXkucmVtb3ZlKCk7XG4gICAgX3Byb2dyZXNzT3ZlcmxheSA9IG51bGw7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2hvd1Byb2dyZXNzU3VjY2VzcyhmaWxsZWQsIGVsYXBzZWQpIHtcbiAgaWYgKF9wcm9ncmVzc092ZXJsYXkpIHtcbiAgICBfcHJvZ3Jlc3NPdmVybGF5LmlubmVySFRNTCA9XG4gICAgICAnPGRpdiBzdHlsZT1cInRleHQtYWxpZ246Y2VudGVyO3BhZGRpbmc6NHB4IDA7XCI+JyArXG4gICAgICAgICc8ZGl2IHN0eWxlPVwiZm9udC1zaXplOjE0cHg7Zm9udC13ZWlnaHQ6NjAwO2NvbG9yOiMxMGI5ODE7XCI+XFx1MjcwNSBUZXJtaW5cXHUwMEU5PC9kaXY+JyArXG4gICAgICAgICc8ZGl2IHN0eWxlPVwiZm9udC1zaXplOjEycHg7Y29sb3I6IzZiNzI4MDttYXJnaW4tdG9wOjRweDtcIj4nICsgZmlsbGVkICsgJyBjaGFtcHMgcmVtcGxpcyBlbiAnICsgZWxhcHNlZCArICdzPC9kaXY+JyArXG4gICAgICAnPC9kaXY+JztcbiAgICBzZXRUaW1lb3V0KGhpZGVQcm9ncmVzc092ZXJsYXksIDQwMDApO1xuICB9XG59XG5cbi8qIFx1MjUwMFx1MjUwMCBcdTAwQzl0YXBlIHJlcGxheSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1blN0ZXAoZXRhcGUsIGNhY2hlKSB7XG4gIHZhciB0aW1lb3V0ID0gZXRhcGUudGltZW91dCB8fCA1MDAwO1xuICB2YXIgc2VsZWN0b3JzID0gQXJyYXkuaXNBcnJheShldGFwZS5zZWxlY3RvcnMpID8gZXRhcGUuc2VsZWN0b3JzIDogKGV0YXBlLnNlbGVjdG9yID8gW2V0YXBlLnNlbGVjdG9yXSA6IFtdKTtcblxuICBpZiAoZXRhcGUuYWN0aW9uID09PSBcIndhaXRcIikge1xuICAgIHZhciBlbFcgPSBhd2FpdCBmaW5kRWxlbWVudEJ5U2VsZWN0b3JzKHNlbGVjdG9ycywgdGltZW91dCk7XG4gICAgcmV0dXJuIGVsVyAhPT0gbnVsbDtcbiAgfVxuXG4gIHZhciBlbCA9IGF3YWl0IGZpbmRFbGVtZW50QnlTZWxlY3RvcnMoc2VsZWN0b3JzLCB0aW1lb3V0KTtcbiAgaWYgKCFlbCkgcmV0dXJuIGZhbHNlO1xuXG4gIC8qIFJcdTAwRTlzb3VkcmUgbGEgdmFyaWFibGUgYXZlYyBsZSBjb250ZXh0ZSBkZSBsJ1x1MDBFOWxcdTAwRTltZW50IHRyb3V2XHUwMEU5IChwb3VyIGxlIGZvcm1hdGFnZSBOU1MpICovXG4gIHZhciB2YWx1ZSA9IGV0YXBlLnZhcmlhYmxlID8gcmVzb2x2ZVZhcmlhYmxlcyhldGFwZS52YXJpYWJsZSwgY2FjaGUsIGVsKSA6IG51bGw7XG5cbiAgc2Nyb2xsSW50b1ZpZXdJZk5lZWRlZChlbCk7XG4gIGF3YWl0IGZyYW1ld29ya0RlbGF5KDUwKTtcblxuICAvKiBIaWdobGlnaHQgdGVtcG9yYWlyZSBkZSBsJ1x1MDBFOWxcdTAwRTltZW50IGVuIGNvdXJzICovXG4gIHZhciBwcmV2T3V0bGluZSA9IGVsLnN0eWxlLm91dGxpbmU7XG4gIGVsLnN0eWxlLm91dGxpbmUgPSBcIjJweCBzb2xpZCAjM2I4MmY2XCI7XG5cbiAgaWYgKGV0YXBlLmFjdGlvbiA9PT0gXCJmaWxsXCIpIHtcbiAgICB2YXIgaXNEYXRlID0gaXNEYXRlVmFyaWFibGUoZXRhcGUudmFyaWFibGUpO1xuICAgIHZhciBmaWxsZWQgPSBhd2FpdCBzbWFydEZpbGxGaWVsZChlbCwgdmFsdWUsIGlzRGF0ZSk7XG4gICAgaWYgKCFmaWxsZWQpIHtcbiAgICAgIHVsdHJhRmlsbChlbCwgdmFsdWUsIHsgZm9yY2U6IHRydWUgfSk7XG4gICAgfVxuICAgIC8qIExlYXJuaW5nIDogbWFycXVlciBsZSBjaGFtcCBwb3VyIGxhIGJvdWNsZSBkJ2FwcHJlbnRpc3NhZ2UgKi9cbiAgICB2YXIgdmFyS2V5ID0gKGV0YXBlLnZhcmlhYmxlIHx8IFwiXCIpLnJlcGxhY2UoL1xce3xcXH0vZywgXCJcIikgfHwgZXRhcGUubGFiZWwgfHwgXCJcIjtcbiAgICBtYXJrRmlsbGVkQnlBdWRpQm90KGVsLCB2YXJLZXkpO1xuICAgIGF3YWl0IGZyYW1ld29ya0RlbGF5KDgwKTtcbiAgfSBlbHNlIGlmIChldGFwZS5hY3Rpb24gPT09IFwiY2xpY2tcIikge1xuICAgIGVsLmNsaWNrKCk7XG4gICAgYXdhaXQgZnJhbWV3b3JrRGVsYXkoMTUwKTtcbiAgfSBlbHNlIGlmIChldGFwZS5hY3Rpb24gPT09IFwic2VsZWN0XCIpIHtcbiAgICB2YXIgc2VsZWN0ZWQgPSBzbWFydFNlbGVjdE9wdGlvbihlbCwgdmFsdWUpO1xuICAgIGlmICghc2VsZWN0ZWQpIHtcbiAgICAgIGVsLnZhbHVlID0gdmFsdWU7XG4gICAgICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImNoYW5nZVwiLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgIH1cbiAgICAvKiBMZWFybmluZyA6IG1hcnF1ZXIgbGUgY2hhbXAgcG91ciBsYSBib3VjbGUgZCdhcHByZW50aXNzYWdlICovXG4gICAgdmFyIHZhcktleVMgPSAoZXRhcGUudmFyaWFibGUgfHwgXCJcIikucmVwbGFjZSgvXFx7fFxcfS9nLCBcIlwiKSB8fCBldGFwZS5sYWJlbCB8fCBcIlwiO1xuICAgIG1hcmtGaWxsZWRCeUF1ZGlCb3QoZWwsIHZhcktleVMpO1xuICAgIGF3YWl0IGZyYW1ld29ya0RlbGF5KDgwKTtcbiAgfVxuXG4gIC8qIFJldGlyZXIgbGUgaGlnaGxpZ2h0ICovXG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IGVsLnN0eWxlLm91dGxpbmUgPSBwcmV2T3V0bGluZTsgfSwgNTAwKTtcblxuICBpZiAoZXRhcGUud2FpdEZvcikge1xuICAgIHZhciBuZXh0ID0gYXdhaXQgd2FpdEZvckVsZW1lbnQoZXRhcGUud2FpdEZvciwgdGltZW91dCk7XG4gICAgcmV0dXJuIG5leHQgIT09IG51bGw7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJ1blN0ZXBXaXRoUmV0cnkoZXRhcGUsIGNhY2hlLCBtYXhSZXRyaWVzKSB7XG4gIG1heFJldHJpZXMgPSBtYXhSZXRyaWVzIHx8IDM7XG4gIGZvciAodmFyIGF0dGVtcHQgPSAwOyBhdHRlbXB0IDw9IG1heFJldHJpZXM7IGF0dGVtcHQrKykge1xuICAgIHZhciBvayA9IGF3YWl0IHJ1blN0ZXAoZXRhcGUsIGNhY2hlKTtcbiAgICBpZiAob2spIHJldHVybiB0cnVlO1xuICAgIGlmIChhdHRlbXB0IDwgbWF4UmV0cmllcykge1xuICAgICAgYXdhaXQgZnJhbWV3b3JrRGVsYXkoODAwICogTWF0aC5wb3coMiwgYXR0ZW1wdCkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCB2YXIgcmVwbGF5U3RhdGUgPSBudWxsO1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0UmVwbGF5U3RhdGUodmFsKSB7IHJlcGxheVN0YXRlID0gdmFsOyB9XG5cbi8qIE5ldHRveWFnZSBzaSBsYSBwYWdlIGVzdCBkXHUwMEU5Y2hhcmdcdTAwRTllIHBlbmRhbnQgdW4gcmVwbGF5ICovXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInBhZ2VoaWRlXCIsIGZ1bmN0aW9uKCkge1xuICByZXBsYXlTdGF0ZSA9IG51bGw7XG4gIGhpZGVQcm9ncmVzc092ZXJsYXkoKTtcbn0pO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3RhcnRSZXBsYXkocGFyY291cnMsIGNhY2hlKSB7XG4gIHZhciBldGFwZXMgPSBwYXJjb3Vycy5ldGFwZXMgfHwgW107XG4gIHZhciB0b3RhbCA9IGV0YXBlcy5sZW5ndGg7XG4gIHZhciBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICByZXBsYXlTdGF0ZSA9IHsgcGFyY291cnM6IHBhcmNvdXJzLCBjdXJyZW50SW5kZXg6IDAsIHBhdXNlZDogZmFsc2UsIGNhY2hlOiBjYWNoZSwgZmFpbENvdW50OiAwIH07XG5cbiAgc2hvd1Byb2dyZXNzT3ZlcmxheSgwLCB0b3RhbCwgXCJEXFx1MDBFOW1hcnJhZ2VcXHUyMDI2XCIpO1xuICBsb2dSUEEocGFyY291cnMuaG9zdG5hbWUgfHwgXCJwYXJjb3Vyc1wiLCBcInJlcGxheV9zdGFydFwiLCBcInN1Y2Nlc1wiKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGV0YXBlcy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChyZXBsYXlTdGF0ZSAmJiByZXBsYXlTdGF0ZS5wYXVzZWQpIHtcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHsgcmVwbGF5U3RhdGUub25SZXN1bWUgPSByZXNvbHZlOyB9KTtcbiAgICB9XG4gICAgaWYgKCFyZXBsYXlTdGF0ZSkgeyBoaWRlUHJvZ3Jlc3NPdmVybGF5KCk7IHJldHVybjsgfVxuXG4gICAgcmVwbGF5U3RhdGUuY3VycmVudEluZGV4ID0gaTtcbiAgICB2YXIgZXRhcGUgPSBldGFwZXNbaV07XG4gICAgc2hvd1Byb2dyZXNzT3ZlcmxheShpICsgMSwgdG90YWwsIGV0YXBlLmxhYmVsIHx8IGV0YXBlLmFjdGlvbik7XG5cbiAgICB2YXIgb2sgPSBhd2FpdCBydW5TdGVwV2l0aFJldHJ5KGV0YXBlLCBjYWNoZSwgMyk7XG5cbiAgICBpZiAoIW9rKSB7XG4gICAgICByZXBsYXlTdGF0ZS5wYXVzZWQgPSB0cnVlO1xuICAgICAgcmVwbGF5U3RhdGUuZmFpbENvdW50ID0gKHJlcGxheVN0YXRlLmZhaWxDb3VudCB8fCAwKSArIDE7XG4gICAgICBzaG93UlBBVG9hc3QoXCJcXHUyNkEwXFx1RkUwRiBSUEEgYmxvcXVcXHUwMEU5IFxcdTAwRTl0YXBlIFwiICsgKGkgKyAxKSArIFwiIFxcdTIwMTQgXCIgKyBldGFwZS5sYWJlbCArIFwiIG5vbiB0cm91dlxcdTAwRTlcXG5SZW1wbGlzc2V6IG1hbnVlbGxlbWVudCBwdWlzIGNsaXF1ZXogXFx1MjVCNiBSZXByZW5kcmVcIiwgXCJlcnJvclwiKTtcbiAgICAgIGxvZ1JQQShwYXJjb3Vycy5ob3N0bmFtZSB8fCBcInBhcmNvdXJzXCIsIFwic3RlcFwiICsgKGkgKyAxKSArIFwiX1wiICsgKGV0YXBlLmFjdGlvbiB8fCBcInVua25vd25cIiksIFwiZWNoZWNcIiwgZXRhcGUubGFiZWwgKyBcIiBub24gdHJvdXZlXCIpO1xuICAgICAgc2hvd1JlcGxheUNvbnRyb2xzKCk7XG4gICAgICBpZiAocmVwbGF5U3RhdGUuZmFpbENvdW50ID49IDIpIHtcbiAgICAgICAgc2VuZEhlYWx0aFBpbmcocGFyY291cnMuaG9zdG5hbWUsIFwiYnJva2VuXCIsIFwicmVwbGF5X2ZhaWxfc3RlcF9cIiArIChpICsgMSkpO1xuICAgICAgfVxuICAgICAgYXdhaXQgbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSkgeyByZXBsYXlTdGF0ZS5vblJlc3VtZSA9IHJlc29sdmU7IH0pO1xuICAgICAgcmVwbGF5U3RhdGUucGF1c2VkID0gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlcGxheVN0YXRlLmZhaWxDb3VudCA9IDA7XG4gICAgfVxuICB9XG5cbiAgdmFyIGVsYXBzZWQgPSBNYXRoLnJvdW5kKChEYXRlLm5vdygpIC0gc3RhcnRUaW1lKSAvIDEwMDApO1xuICB2YXIgZmlsbGVkID0gZXRhcGVzLmZpbHRlcihmdW5jdGlvbihlKSB7IHJldHVybiBlLmFjdGlvbiA9PT0gXCJmaWxsXCI7IH0pLmxlbmd0aDtcbiAgc2hvd1Byb2dyZXNzU3VjY2VzcyhmaWxsZWQsIGVsYXBzZWQpO1xuICBzaG93UlBBVG9hc3QoXCJcXHUyNzA1IFBhcmNvdXJzIHRlcm1pblxcdTAwRTkgXFx1MjAxNCBcIiArIGZpbGxlZCArIFwiIGNoYW1wcyByZW1wbGlzIGVuIFwiICsgZWxhcHNlZCArIFwic1wiLCBcInN1Y2Nlc3NcIik7XG4gIGxvZ1JQQShwYXJjb3Vycy5ob3N0bmFtZSB8fCBcInBhcmNvdXJzXCIsIFwicmVwbGF5X2NvbXBsZXRlXCIsIFwic3VjY2VzXCIsIGZpbGxlZCArIFwiIGNoYW1wcyBlbiBcIiArIGVsYXBzZWQgKyBcInNcIik7XG4gIGdldFN5bmNUb2tlbigpLnRoZW4oZnVuY3Rpb24oc3luY1Rva2VuKSB7XG4gICAgaWYgKHN5bmNUb2tlbikge1xuICAgICAgZmV0Y2goXCJodHRwczovL2F1ZGlib3QuZnIvYXBpL2V4dGVuc2lvbi9sb2ctaW5qZWN0aW9uXCIsIHtcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIiwgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9LFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IHN5bmNUb2tlbjogc3luY1Rva2VuLCBzaXRlOiBwYXJjb3Vycy5ob3N0bmFtZSwgc3VjY2VzczogdHJ1ZSwgZmllbGRzQ291bnQ6IGZpbGxlZCwgdHM6IERhdGUubm93KCkgfSlcbiAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikgeyBjb25zb2xlLndhcm4oXCJbQXVkaUJvdF0gbG9nLWluamVjdGlvbiBmYWlsZWQ6XCIsIGVycik7IH0pO1xuICAgIH1cbiAgfSk7XG4gIHJlcGxheVN0YXRlID0gbnVsbDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHRyeUR5bmFtaWNSZXBsYXkoKSB7XG4gIHZhciBob3N0bmFtZSA9IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZS5yZXBsYWNlKFwid3d3LlwiLCBcIlwiKTtcbiAgdmFyIHN5bmNUb2tlbiA9IGF3YWl0IGdldFN5bmNUb2tlbigpO1xuICBpZiAoIXN5bmNUb2tlbikgcmV0dXJuIGZhbHNlO1xuICB0cnkge1xuICAgIHZhciByZXMgPSBhd2FpdCBmZXRjaChcImh0dHBzOi8vYXVkaWJvdC5mci9hcGkvZXh0ZW5zaW9uL3BhcmNvdXJzP2hvc3RuYW1lPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KGhvc3RuYW1lKSwgeyBoZWFkZXJzOiB7IFwiQXV0aG9yaXphdGlvblwiOiBcIkJlYXJlciBcIiArIHN5bmNUb2tlbiB9IH0pO1xuICAgIGlmICghcmVzLm9rKSByZXR1cm4gZmFsc2U7XG4gICAgdmFyIGRhdGEgPSBhd2FpdCByZXMuanNvbigpO1xuICAgIGlmICghZGF0YS5wYXJjb3VycyB8fCBkYXRhLnBhcmNvdXJzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIGZhbHNlO1xuICAgIHZhciBwYXJjb3VycyA9IGRhdGEucGFyY291cnNbMF07XG4gICAgdmFyIGNhY2hlID0gYXdhaXQgcmVhZEVuY3J5cHRlZENhY2hlKCkgfHwge307XG4gICAgc3RhcnRSZXBsYXkocGFyY291cnMsIGNhY2hlKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBjYXRjaChlKSB7IHJldHVybiBmYWxzZTsgfVxufVxuIiwgIi8qIFx1MjUwMFx1MjUwMCBSUEEgRW50cnkgUG9pbnQgXHUyMDE0IGNoZWNrQW5kU3RhcnRSUEEgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG4vKiBSUEEgZ2VuZXJhbGlzXHUwMEU5IFx1MjAxNCByZXBsYXkgcGFyY291cnMgZHluYW1pcXVlIHN1ciB0b3V0IHBvcnRhaWwgKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrQW5kU3RhcnRSUEEoKSB7XG4gIHZhciBjdXJyZW50SG9zdG5hbWUgPSB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWU7XG5cbiAgLyogVlx1MDBFOXJpZmllciBxdWUgbCd1c2VyIGEgbGUgcGxhbiBQUk8vRVFVSVBFL0FETUlOIGF2YW50IGRlIGxhbmNlciAqL1xuICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoWydhdWRpYm90X2F1dGgnLCAnYXVkaWJvdF9ycGEnXSwgZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgdmFyIGF1dGggPSByZXN1bHQuYXVkaWJvdF9hdXRoIHx8IHt9O1xuICAgIGlmIChhdXRoLnJwYUVuYWJsZWQgPT09IGZhbHNlKSB7XG4gICAgICBzaG93UlBBVG9hc3QoXCJSUEEgZGlzcG9uaWJsZSBcXHUwMEUwIHBhcnRpciBkdSBwbGFuIFByb1wiLCBcImluZm9cIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBycGEgPSByZXN1bHQuYXVkaWJvdF9ycGE7XG4gICAgaWYgKCFycGEgfHwgIXJwYS50YXJnZXQpIHJldHVybjtcblxuICAgIC8qIFZlcmlmaWVyIHF1ZSBsZSBSUEEgY2libGUgY29ycmVzcG9uZCBhdSBkb21haW5lIGNvdXJhbnQgKi9cbiAgICB2YXIgcnBhSG9zdG5hbWUgPSBycGEudGFyZ2V0SG9zdG5hbWUgfHwgXCJcIjtcbiAgICB2YXIgdGFyZ2V0TWF0Y2hlc0N1cnJlbnQgPSBjdXJyZW50SG9zdG5hbWUuaW5jbHVkZXMocnBhLnRhcmdldCkgfHwgY3VycmVudEhvc3RuYW1lLmluY2x1ZGVzKHJwYUhvc3RuYW1lKTtcbiAgICBpZiAoIXRhcmdldE1hdGNoZXNDdXJyZW50KSByZXR1cm47XG5cbiAgICAvKiBOJ2V4XHUwMEU5Y3V0ZXIgcXVlIHNpIGxlcyBkb25uXHUwMEU5ZXMgb250IG1vaW5zIGRlIDUgbWludXRlcyAqL1xuICAgIGlmIChEYXRlLm5vdygpIC0gcnBhLnRzID4gMzAwMDAwKSB7XG4gICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5yZW1vdmUoJ2F1ZGlib3RfcnBhJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLyogXHUyNTAwXHUyNTAwIFBvcnRhaWwgZ2VuZXJpcXVlIFx1MjAxNCByZXBsYXkgcGFyY291cnMgZHluYW1pcXVlIFx1MjUwMFx1MjUwMCAqL1xuICAgIHZhciBsb2dpblBhZ2UgPSAvXFwvbG9naW58XFwvc2lnbmlufFxcL2Nvbm5leGlvbnxcXC9hdXRofExvZ2luXFwuZG8vaS50ZXN0KHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSlcbiAgICAgIHx8ICghIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W3R5cGU9XCJwYXNzd29yZFwiXScpKTtcblxuICAgIGlmIChsb2dpblBhZ2UgJiYgIXJwYS5sb2dpbl9zaG93bikge1xuICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHsgYXVkaWJvdF9ycGE6IE9iamVjdC5hc3NpZ24oe30sIHJwYSwgeyBsb2dpbl9zaG93bjogdHJ1ZSB9KSB9KTtcbiAgICAgIHNob3dSUEFUb2FzdChcIlxcdUQ4M0RcXHVERDEwIFJQQSA6IGNvbm5lY3Rlei12b3VzLCBsZSBib3QgcmVwcmVuZCBhdXRvbWF0aXF1ZW1lbnQgYXByXFx1MDBFOHMgY29ubmV4aW9uXCIsIFwiaW5mb1wiKTtcbiAgICAgIHZhciBsb2dpbk9icyA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W3R5cGU9XCJwYXNzd29yZFwiXScpKSB7XG4gICAgICAgICAgbG9naW5PYnMuZGlzY29ubmVjdCgpO1xuICAgICAgICAgIGNoZWNrQW5kU3RhcnRSUEEoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBsb2dpbk9icy5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHsgY2hpbGRMaXN0OiB0cnVlLCBzdWJ0cmVlOiB0cnVlIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8qIExhbmNlciBsZSByZXBsYXkgZHluYW1pcXVlIHNpIHVuIHBhcmNvdXJzIGVzdCBhdHRhY2hlIGF1eCBkb25uZWVzIFJQQSAqL1xuICAgIGlmIChycGEucGFyY291cnMgJiYgcnBhLnBhcmNvdXJzLmV0YXBlcykge1xuICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwucmVtb3ZlKCdhdWRpYm90X3JwYScpO1xuICAgICAgc2hvd1JQQVRvYXN0KFwiUlBBIFwiICsgKHJwYS50YXJnZXQgfHwgXCJwb3J0YWlsXCIpICsgXCIgOiBkXFx1MDBFOW1hcnJhZ2UuLi5cIiwgXCJpbmZvXCIpO1xuICAgICAgaWYgKHR5cGVvZiByZXBsYXlQYXJjb3VycyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJlcGxheVBhcmNvdXJzKHJwYS5wYXJjb3VycywgcnBhLnBheWxvYWQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8qIEZhbGxiYWNrIDogdGVudGVyIHVuIFNtYXJ0IEZpbGwgYXZlYyBsZXMgZG9ubmVlcyBSUEEgKi9cbiAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5yZW1vdmUoJ2F1ZGlib3RfcnBhJyk7XG4gICAgc2hvd1JQQVRvYXN0KFwiUlBBIFwiICsgKHJwYS50YXJnZXQgfHwgXCJwb3J0YWlsXCIpICsgXCIgOiByZW1wbGlzc2FnZSBhdXRvbWF0aXF1ZS4uLlwiLCBcImluZm9cIik7XG4gICAgaWYgKHR5cGVvZiBwZXJmb3JtU21hcnRGaWxsID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHBlcmZvcm1TbWFydEZpbGwoKTtcbiAgICB9XG4gIH0pOyAvKiBlbmQgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0IGF1ZGlib3RfYXV0aCArIGF1ZGlib3RfcnBhICovXG59XG4iLCAiLy8gXHUyNTAwXHUyNTAwIEF1ZGlCb3QgTXVsdGktU2l0ZSBEaXNwYXRjaGVyIChNb2R1bGFyIEJ1aWxkKSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuaW1wb3J0IHsgQ09ORklHUyB9IGZyb20gXCIuL3BvcnRhbHMvaW5kZXguanNcIjtcbmltcG9ydCBcIi4vdXRpbHMvcmVtb3RlLXNlbGVjdG9ycy5qc1wiO1xuaW1wb3J0IFwiLi91dGlscy9maWVsZC1mZWVkYmFjay5qc1wiOyAvKiBVUy04IDogRmVlZGJhY2sgTG9vcCBzaWduYWxlbWVudCBjaGFtcCAqL1xuaW1wb3J0IFwiLi91dGlscy9zZWxlY3Rvci1oZWFsdGguanNcIjtcbmltcG9ydCBcIi4vdXRpbHMvcmVqZWN0aW9uLXByZWRpY3Rvci5qc1wiO1xuaW1wb3J0IFwiLi9jb21tYW5kLWNlbnRlci5qc1wiO1xuaW1wb3J0IFwiLi9wZWMtY2FwdHVyZS5qc1wiO1xuaW1wb3J0IHsgc2V0dXBEZXZpc0RldGVjdGlvbiB9IGZyb20gXCIuL3V0aWxzL2RldmlzLWNhcHR1cmUuanNcIjtcblxuLyogXHUyNTAwXHUyNTAwIE1vZHVsZSBpbXBvcnRzIChkZWR1cGxpY2F0ZWQgZnJvbSBpbmxpbmUgY29waWVzKSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cbmltcG9ydCB7IHF1ZXJ5U2VsZWN0b3JBbGxEZWVwLCBmaW5kRWxlbWVudCwgZmluZEluU2hhZG93Um9vdHMsIHdhaXRGb3JFbGVtZW50IH0gZnJvbSBcIi4vdXRpbHMvZG9tLmpzXCI7XG5pbXBvcnQgeyBjYXBpdGFsaXplLCBub3JtYWxpemVQaG9uZSwgZm9ybWF0T3B0aWNhbFZhbHVlLCBkZXRlY3RPcHRpY2FsRm9ybWF0LCBub3JtYWxpemVEYXRlVmFsdWUsIGZpZWxkSGFzVmFsdWUgfSBmcm9tIFwiLi91dGlscy9mb3JtYXQuanNcIjtcbmltcG9ydCB7IHByZUNhY2hlTGFiZWxNYXAsIGNsZWFyTWF0Y2hpbmdDYWNoZSwgZ2V0RmllbGRMYWJlbCwgbm9ybWFsaXplTGFiZWwsIG5vcm1hbGl6ZUFsaWFzLCBzY29yZUZpZWxkTWF0Y2gsIG1hdGNoU21hcnRGaWVsZCwgbGV2ZW5zaHRlaW4sIGxvYWRMZWFybmVkV2VpZ2h0cyB9IGZyb20gXCIuL3V0aWxzL2ZpZWxkLW1hdGNoaW5nLmpzXCI7XG5pbXBvcnQgeyBnZXRDYWNoZWRTZWxlY3Rvciwgc2V0Q2FjaGVkU2VsZWN0b3IsIGxvYWRTZWxlY3RvckNhY2hlLCBzYXZlU2VsZWN0b3JDYWNoZSB9IGZyb20gXCIuL3V0aWxzL3NlbGVjdG9yLWNhY2hlLmpzXCI7XG5pbXBvcnQgeyBnZXRTbWFydEZpbGxEYXRhLCBnZXRDYWNoZWRDbGllbnQsIGdldFZpc2libGVGaWVsZHMsIGRldGVjdFBhZ2VDb250ZXh0IH0gZnJvbSBcIi4vdXRpbHMvZGF0YS5qc1wiO1xuaW1wb3J0IHsgdWx0cmFGaWxsLCB1bHRyYUZpbGxXaXRoUmV0cnksIHNtYXJ0RmlsbEZpZWxkLCBzbWFydFNlbGVjdE9wdGlvbiwgZmlsbERhdGVQaWNrZXIsIHNlbGVjdFJhZGl4T3B0aW9uIH0gZnJvbSBcIi4vdXRpbHMvZmlsbC5qc1wiO1xuaW1wb3J0IHsgcGVyZm9ybVNtYXJ0RmlsbCB9IGZyb20gXCIuL3NtYXJ0LWZpbGwvaW5kZXguanNcIjtcbmltcG9ydCB7IG1hcmtGaWxsZWRCeUF1ZGlCb3QsIHNlbmRMZWFybmluZ1NpZ25hbCB9IGZyb20gXCIuL3NtYXJ0LWZpbGwvbGVhcm5pbmcuanNcIjtcbmltcG9ydCB7IHBlcmZvcm1GaWxsIH0gZnJvbSBcIi4vc3RhbmRhcmQtZmlsbC9pbmRleC5qc1wiO1xuaW1wb3J0IHsgc3RhcnRSZXBsYXksIHJ1blN0ZXAsIHJlc29sdmVWYXJpYWJsZXMsIHRyeUR5bmFtaWNSZXBsYXksIHJlcGxheVN0YXRlLCBzZXRSZXBsYXlTdGF0ZSB9IGZyb20gXCIuL3JlcGxheS9pbmRleC5qc1wiO1xuaW1wb3J0IHsgY2hlY2tBbmRTdGFydFJQQSB9IGZyb20gXCIuL3JwYS9pbmRleC5qc1wiO1xuLyogaW1wb3J0IHsgaW5pdCB9IGZyb20gXCIuL3VpL2luaXQuanNcIjsgXHUyMDE0IGtlcHQgaW5saW5lIGFzIGluaXRMb2NhbCgpIHNpbmNlIGl0IHJlZmVyZW5jZXMgbWFueSBsb2NhbCBmdW5jdGlvbnMgKi9cblxuLyogXHUyNTAwXHUyNTAwIFBhcmNvdXJzIER5bmFtaXF1ZXMgREIgXHUyMTkyIENPTkZJR1MgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG5cbmZ1bmN0aW9uIGxvYWREeW5hbWljUGFyY291cnMoKSB7XG4gIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbJ2F1ZGlib3RfZHluYW1pY19wYXJjb3VycycsICdhdWRpYm90X2F1dGgnXSwgZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgdmFyIGF1dGggPSByZXN1bHQuYXVkaWJvdF9hdXRoIHx8IHt9O1xuICAgIGlmICghYXV0aC5zeW5jVG9rZW4pIHJldHVybjtcbiAgICB2YXIgY2FjaGVkID0gcmVzdWx0LmF1ZGlib3RfZHluYW1pY19wYXJjb3VycztcbiAgICAvKiBVdGlsaXNlciBsZSBjYWNoZSBzaSBtb2lucyBkZSAzMCBtaW4gKi9cbiAgICBpZiAoY2FjaGVkICYmIGNhY2hlZC50cyAmJiBEYXRlLm5vdygpIC0gY2FjaGVkLnRzIDwgMTgwMDAwMCkge1xuICAgICAgaW5qZWN0RHluYW1pY1BhcmNvdXJzKGNhY2hlZC5oYW5kbGVycyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGZldGNoKFwiaHR0cHM6Ly9hdWRpYm90LmZyL2FwaS9leHRlbnNpb24vcGFyY291cnM/aGFuZGxlcnM9dHJ1ZVwiLCB7XG4gICAgICBoZWFkZXJzOiB7IFwiQXV0aG9yaXphdGlvblwiOiBcIkJlYXJlciBcIiArIGF1dGguc3luY1Rva2VuIH1cbiAgICB9KVxuICAgIC50aGVuKGZ1bmN0aW9uKHIpIHsgcmV0dXJuIHIuanNvbigpOyB9KVxuICAgIC50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7XG4gICAgICAgIGF1ZGlib3RfZHluYW1pY19wYXJjb3VyczogeyBoYW5kbGVyczogZGF0YS5oYW5kbGVycywgdHM6IERhdGUubm93KCkgfVxuICAgICAgfSk7XG4gICAgICBpbmplY3REeW5hbWljUGFyY291cnMoZGF0YS5oYW5kbGVycyk7XG4gICAgfSlcbiAgICAuY2F0Y2goZnVuY3Rpb24oZXJyKSB7IGNvbnNvbGUud2FybihcIltBdWRpQm90XSBkeW5hbWljIHBhcmNvdXJzIGZldGNoIGZhaWxlZDpcIiwgZXJyKTsgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBpbmplY3REeW5hbWljUGFyY291cnMoaGFuZGxlcnMpIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KGhhbmRsZXJzKSkgcmV0dXJuO1xuICBoYW5kbGVycy5mb3JFYWNoKGZ1bmN0aW9uKGgpIHtcbiAgICBpZiAoIWguaG9zdG5hbWUpIHJldHVybjtcbiAgICAvKiBOZSBwYXMgXHUwMEU5Y3Jhc2VyIGxlcyBjb25maWdzIGhhcmRjb2RcdTAwRTllcyAqL1xuICAgIHZhciBhbHJlYWR5RXhpc3RzID0gT2JqZWN0LnZhbHVlcyhDT05GSUdTKS5zb21lKGZ1bmN0aW9uKGNmZykge1xuICAgICAgcmV0dXJuIGNmZy5pc01hdGNoICYmIGNmZy5pc01hdGNoKCkgJiYgd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLmluY2x1ZGVzKGguaG9zdG5hbWUpO1xuICAgIH0pO1xuICAgIGlmIChDT05GSUdTW2guaG9zdG5hbWVdIHx8IGFscmVhZHlFeGlzdHMpIHJldHVybjtcblxuICAgIC8qIENyXHUwMEU5ZXIgbGUgaGFuZGxlciBkeW5hbWlxdWUgZGVwdWlzIGxlcyBcdTAwRTl0YXBlcyBKU09OIChzYW5zIGV2YWwpICovXG4gICAgdmFyIGV0YXBlcyA9IGguZXRhcGVzIHx8IFtdO1xuICAgIENPTkZJR1NbaC5ob3N0bmFtZV0gPSB7XG4gICAgICBuYW1lOiBoLm5vbSB8fCBoLmhvc3RuYW1lLFxuICAgICAgaXNNYXRjaDogKGZ1bmN0aW9uKGhvc3RuYW1lKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHsgcmV0dXJuIHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZS5pbmNsdWRlcyhob3N0bmFtZSk7IH07XG4gICAgICB9KShoLmhvc3RuYW1lKSxcbiAgICAgIGFjdGlvbnM6IHtcbiAgICAgICAgZm9ybXVsYWlyZTogKGZ1bmN0aW9uKGV0YXBlc0xpc3QpIHtcbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgLyogUmVqb3VlciBsZXMgXHUwMEU5dGFwZXMgZmlsbCBlbiB1dGlsaXNhbnQgbGUgbW90ZXVyIHVsdHJhRmlsbCBleGlzdGFudCAqL1xuICAgICAgICAgICAgaWYgKCFldGFwZXNMaXN0IHx8IGV0YXBlc0xpc3QubGVuZ3RoID09PSAwKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB2YXIgZmlsbGVkID0gZmFsc2U7XG4gICAgICAgICAgICB2YXIgY2FjaGUgPSBkYXRhLmNhY2hlZCB8fCB7fTtcbiAgICAgICAgICAgIHZhciBtID0gZGF0YS5tIHx8IHt9O1xuICAgICAgICAgICAgdmFyIG8gPSBkYXRhLm8gfHwge307XG4gICAgICAgICAgICB2YXIgcGVyc29ubmVzID0gbS5wZXJzb25uZXMgfHwgW107XG4gICAgICAgICAgICB2YXIgcDAgPSBwZXJzb25uZXMubGVuZ3RoID4gMCA/IHBlcnNvbm5lc1swXSA6IHt9O1xuXG4gICAgICAgICAgICAvKiBDb25zdHJ1aXJlIGxlIGRpY3Rpb25uYWlyZSBkZSB2YWxldXJzIHBhdGllbnQgKi9cbiAgICAgICAgICAgIHZhciB2YXJzID0ge1xuICAgICAgICAgICAgICBcInt7bnNzfX1cIjogZ2V0T3V2cmFudERyb2l0TlNTKG0ubnVtZXJvU2VjdXJpdGVTb2NpYWxlIHx8IFwiXCIsIG0uZGF0ZU5haXNzYW5jZSB8fCBcIlwiLCBwZXJzb25uZXMpLnJlcGxhY2UoL1xcRC9nLCBcIlwiKSxcbiAgICAgICAgICAgICAgXCJ7e25vbX19XCI6IChtLm5vbSB8fCBwMC5ub20gfHwgby5ub21QYXRpZW50IHx8IGNhY2hlLm5vbSB8fCBcIlwiKS50b1VwcGVyQ2FzZSgpLFxuICAgICAgICAgICAgICBcInt7cHJlbm9tfX1cIjogY2FwaXRhbGl6ZShtLnByZW5vbSB8fCBwMC5wcmVub20gfHwgby5wcmVub21QYXRpZW50IHx8IGNhY2hlLnByZW5vbSB8fCBcIlwiKSxcbiAgICAgICAgICAgICAgXCJ7e2RhdGVOYWlzc2FuY2V9fVwiOiBtLmRhdGVOYWlzc2FuY2UgfHwgby5kYXRlTmFpc3NhbmNlUGF0aWVudCB8fCBjYWNoZS5kb2IgfHwgXCJcIixcbiAgICAgICAgICAgICAgXCJ7e2RhdGVPcmRvbm5hbmNlfX1cIjogby5kYXRlT3Jkb25uYW5jZSB8fCAoY2FjaGUucHJlc2NyaXB0aW9uICYmIGNhY2hlLnByZXNjcmlwdGlvbi5kYXRlUHJlc2NyaXB0aW9uKSB8fCBcIlwiLFxuICAgICAgICAgICAgICBcInt7bnVtZXJvQWRoZXJlbnR9fVwiOiBtLm51bWVyb0FkaGVyZW50IHx8IGNhY2hlLm51bWVyb0FkaGVyZW50IHx8IFwiXCIsXG4gICAgICAgICAgICAgIFwie3tvcmdhbmlzbWV9fVwiOiBtLm9yZ2FuaXNtZSB8fCBjYWNoZS5vcmdhbmlzbWUgfHwgXCJcIixcbiAgICAgICAgICAgICAgXCJ7e3NwaGVyZV9vZH19XCI6IChvLmx1bmV0dGVzT0QgJiYgby5sdW5ldHRlc09ELnNwaGVyZSkgfHwgXCJcIixcbiAgICAgICAgICAgICAgXCJ7e3NwaGVyZV9vZ319XCI6IChvLmx1bmV0dGVzT0cgJiYgby5sdW5ldHRlc09HLnNwaGVyZSkgfHwgXCJcIixcbiAgICAgICAgICAgICAgXCJ7e2N5bGluZHJlX29kfX1cIjogKG8ubHVuZXR0ZXNPRCAmJiBvLmx1bmV0dGVzT0QuY3lsaW5kcmUpIHx8IFwiXCIsXG4gICAgICAgICAgICAgIFwie3tjeWxpbmRyZV9vZ319XCI6IChvLmx1bmV0dGVzT0cgJiYgby5sdW5ldHRlc09HLmN5bGluZHJlKSB8fCBcIlwiLFxuICAgICAgICAgICAgICBcInt7YXhlX29kfX1cIjogKG8ubHVuZXR0ZXNPRCAmJiBvLmx1bmV0dGVzT0QuYXhlKSB8fCBcIlwiLFxuICAgICAgICAgICAgICBcInt7YXhlX29nfX1cIjogKG8ubHVuZXR0ZXNPRyAmJiBvLmx1bmV0dGVzT0cuYXhlKSB8fCBcIlwiLFxuICAgICAgICAgICAgICBcInt7YWRkaXRpb259fVwiOiAoby5sdW5ldHRlc09EICYmIG8ubHVuZXR0ZXNPRC5hZGRpdGlvbikgfHwgKG8ubHVuZXR0ZXNPRyAmJiBvLmx1bmV0dGVzT0cuYWRkaXRpb24pIHx8IFwiXCIsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBldGFwZXNMaXN0LmZvckVhY2goZnVuY3Rpb24oZXRhcGUpIHtcbiAgICAgICAgICAgICAgaWYgKGV0YXBlLmFjdGlvbiAhPT0gXCJmaWxsXCIgJiYgZXRhcGUuYWN0aW9uICE9PSBcImNsaWNrXCIgJiYgZXRhcGUuYWN0aW9uICE9PSBcInNlbGVjdFwiKSByZXR1cm47XG4gICAgICAgICAgICAgIHZhciBzZWxlY3RvcnMgPSBldGFwZS5zZWxlY3RvcnMgfHwgKGV0YXBlLnNlbGVjdG9yID8gW2V0YXBlLnNlbGVjdG9yXSA6IFtdKTtcbiAgICAgICAgICAgICAgaWYgKHNlbGVjdG9ycy5sZW5ndGggPT09IDApIHJldHVybjtcblxuICAgICAgICAgICAgICAvKiBUcm91dmVyIGwnXHUwMEU5bFx1MDBFOW1lbnQgdmlhIGxlcyBzXHUwMEU5bGVjdGV1cnMgZmFsbGJhY2sgKi9cbiAgICAgICAgICAgICAgdmFyIGVsID0gbnVsbDtcbiAgICAgICAgICAgICAgZm9yICh2YXIgc2kgPSAwOyBzaSA8IHNlbGVjdG9ycy5sZW5ndGg7IHNpKyspIHtcbiAgICAgICAgICAgICAgICBlbCA9IGZpbmRFbGVtZW50KHNlbGVjdG9yc1tzaV0pO1xuICAgICAgICAgICAgICAgIGlmIChlbCkgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKCFlbCkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgIGlmIChldGFwZS5hY3Rpb24gPT09IFwiY2xpY2tcIikge1xuICAgICAgICAgICAgICAgIGVsLmNsaWNrKCk7XG4gICAgICAgICAgICAgICAgZmlsbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvKiBSXHUwMEU5c291ZHJlIGxhIHZhcmlhYmxlICovXG4gICAgICAgICAgICAgIHZhciB2YWx1ZSA9IGV0YXBlLnZhcmlhYmxlID8gKHZhcnNbZXRhcGUudmFyaWFibGVdIHx8IFwiXCIpIDogXCJcIjtcbiAgICAgICAgICAgICAgaWYgKCF2YWx1ZSkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgIGlmIChldGFwZS5hY3Rpb24gPT09IFwic2VsZWN0XCIpIHtcbiAgICAgICAgICAgICAgICBzbWFydFNlbGVjdE9wdGlvbihlbCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIGZpbGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdWx0cmFGaWxsKGVsLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgZmlsbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBmaWxsZWQ7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSkoZXRhcGVzKSxcbiAgICAgICAgc3luY2hyb25pc2VyOiBmdW5jdGlvbigpIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG59XG5cbi8qIENoYXJnZXIgbGVzIHBhcmNvdXJzIGR5bmFtaXF1ZXMgYXUgZFx1MDBFOW1hcnJhZ2UgKi9cbmxvYWREeW5hbWljUGFyY291cnMoKTtcblxuLyogXHUyNTAwXHUyNTAwIEZvbmN0aW9ucyBVdGlsaXRhaXJlcyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cblxuZnVuY3Rpb24gdmFsaWRhdGVMdWhuTlNTKG5zcykge1xuICB2YXIgZGlnaXRzID0gbnNzLnJlcGxhY2UoL1xcRC9nLCBcIlwiKTtcbiAgaWYgKGRpZ2l0cy5sZW5ndGggPCAxMykgcmV0dXJuIGZhbHNlO1xuICB2YXIgbiA9IGRpZ2l0cy5zbGljZSgwLCAxMykucmVwbGFjZSgvMkEvaSwgXCIxOVwiKS5yZXBsYWNlKC8yQi9pLCBcIjE4XCIpO1xuICB2YXIgbnVtID0gcGFyc2VJbnQobiwgMTApO1xuICBpZiAoaXNOYU4obnVtKSkgcmV0dXJuIGZhbHNlO1xuICBpZiAoZGlnaXRzLmxlbmd0aCA+PSAxNSkge1xuICAgIHZhciBjbGUgPSBwYXJzZUludChkaWdpdHMuc2xpY2UoMTMsIDE1KSwgMTApO1xuICAgIHJldHVybiAoOTcgLSAobnVtICUgOTcpKSA9PT0gY2xlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKiBcdTI1MDBcdTI1MDAgY2hlY2tEcm9pdHNNdXR1ZWxsZSBcdTIwMTQgYWxlcnRlIHNpIGRyb2l0cyBleHBpclx1MDBFOXMgb3UgYmllbnRcdTAwRjR0IGV4cGlyXHUwMEU5cyBcdTI1MDBcdTI1MDAgKi9cbmZ1bmN0aW9uIGNoZWNrRHJvaXRzTXV0dWVsbGUoZGF0YSkge1xuICB2YXIgbSA9IGRhdGEubSB8fCBkYXRhIHx8IHt9O1xuICB2YXIgZGF0ZUZpbiA9IG0uZGF0ZUZpblZhbGlkaXRlIHx8IFwiXCI7XG4gIHZhciBkYXRlRGVidXQgPSBtLmRhdGVEZWJ1dFZhbGlkaXRlIHx8IFwiXCI7XG4gIHZhciB0b2RheSA9IG5ldyBEYXRlKCk7XG4gIHRvZGF5LnNldEhvdXJzKDAsIDAsIDAsIDApO1xuXG4gIGlmIChkYXRlRmluKSB7XG4gICAgdmFyIHBhcnRzID0gZGF0ZUZpbi5tYXRjaCgvKFxcZHsyfSlbXFwvXFwtXShcXGR7Mn0pW1xcL1xcLV0oXFxkezR9KS8pO1xuICAgIGlmIChwYXJ0cykge1xuICAgICAgdmFyIGZpbkRhdGUgPSBuZXcgRGF0ZShwYXJzZUludChwYXJ0c1szXSksIHBhcnNlSW50KHBhcnRzWzJdKSAtIDEsIHBhcnNlSW50KHBhcnRzWzFdKSk7XG4gICAgICBpZiAoZmluRGF0ZSA8IHRvZGF5KSB7XG4gICAgICAgIHNob3dSUEFUb2FzdChcIlx1MjZENCBEcm9pdHMgbXV0dWVsbGUgZXhwaXJcdTAwRTlzIGRlcHVpcyBsZSBcIiArIGRhdGVGaW4sIFwiZXJyb3JcIik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZhciBkaWZmRGF5cyA9IE1hdGguY2VpbCgoZmluRGF0ZSAtIHRvZGF5KSAvICgxMDAwICogNjAgKiA2MCAqIDI0KSk7XG4gICAgICBpZiAoZGlmZkRheXMgPD0gMzApIHtcbiAgICAgICAgc2hvd1JQQVRvYXN0KFwiXHUyNkEwXHVGRTBGIERyb2l0cyBtdXR1ZWxsZSBleHBpcmVudCBkYW5zIFwiICsgZGlmZkRheXMgKyBcIiBqb3VyXCIgKyAoZGlmZkRheXMgPiAxID8gXCJzXCIgOiBcIlwiKSArIFwiIChcIiArIGRhdGVGaW4gKyBcIilcIiwgXCJ3YXJuaW5nXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKGRhdGVEZWJ1dCkge1xuICAgIHZhciBwYXJ0c0QgPSBkYXRlRGVidXQubWF0Y2goLyhcXGR7Mn0pW1xcL1xcLV0oXFxkezJ9KVtcXC9cXC1dKFxcZHs0fSkvKTtcbiAgICBpZiAocGFydHNEKSB7XG4gICAgICB2YXIgZGVidXREYXRlID0gbmV3IERhdGUocGFyc2VJbnQocGFydHNEWzNdKSwgcGFyc2VJbnQocGFydHNEWzJdKSAtIDEsIHBhcnNlSW50KHBhcnRzRFsxXSkpO1xuICAgICAgaWYgKGRlYnV0RGF0ZSA+IHRvZGF5KSB7XG4gICAgICAgIHNob3dSUEFUb2FzdChcIlx1MjZBMFx1RkUwRiBEcm9pdHMgbXV0dWVsbGUgcGFzIGVuY29yZSBhY3RpZnMgKGRcdTAwRTlidXQgOiBcIiArIGRhdGVEZWJ1dCArIFwiKVwiLCBcIndhcm5pbmdcIik7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogUG91ciB1biBtaW5ldXIsIHJldG91cm5lIGxlIE5TUyBkZSBsJ291dnJhbnQgZHJvaXQgKG1cdTAwRThyZSBlbiBwcmlvcml0XHUwMEU5ID0gTlNTIGNvbW1lblx1MDBFN2FudCBwYXIgMikuXG4gKiBTaSBsZSBiXHUwMEU5blx1MDBFOWZpY2lhaXJlIGVzdCBtYWpldXIsIHJldG91cm5lIHNvbiBwcm9wcmUgTlNTLlxuICovXG5mdW5jdGlvbiBnZXRPdXZyYW50RHJvaXROU1MoYmVuZWZpY2lhaXJlTlNTLCBiZW5lZmljaWFpcmVET0IsIHBlcnNvbm5lcykge1xuICBpZiAoIXBlcnNvbm5lcyB8fCBwZXJzb25uZXMubGVuZ3RoIDw9IDEpIHJldHVybiBiZW5lZmljaWFpcmVOU1M7XG4gIGlmICghYmVuZWZpY2lhaXJlRE9CIHx8ICFpc1VuZGVyMTgoYmVuZWZpY2lhaXJlRE9CKSkgcmV0dXJuIGJlbmVmaWNpYWlyZU5TUztcblxuICAvKiBDaGVyY2hlciBsYSBtXHUwMEU4cmUgKE5TUyBjb21tZW5jZSBwYXIgMiwgbWFqZXVyZSkgKi9cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwZXJzb25uZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcCA9IHBlcnNvbm5lc1tpXTtcbiAgICB2YXIgcE5TUyA9IChwLm51bWVyb1NlY3VyaXRlU29jaWFsZSB8fCBcIlwiKS5yZXBsYWNlKC9cXEQvZywgXCJcIik7XG4gICAgaWYgKHBOU1Muc3RhcnRzV2l0aChcIjJcIikgJiYgcE5TUy5sZW5ndGggPj0gMTMgJiYgcC5kYXRlTmFpc3NhbmNlICYmICFpc1VuZGVyMTgocC5kYXRlTmFpc3NhbmNlKSkge1xuICAgICAgcmV0dXJuIHAubnVtZXJvU2VjdXJpdGVTb2NpYWxlO1xuICAgIH1cbiAgfVxuICAvKiBGYWxsYmFjayA6IHByZW1pZXIgYWR1bHRlIGF2ZWMgdW4gTlNTIHZhbGlkZSAqL1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHBlcnNvbm5lcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBwID0gcGVyc29ubmVzW2ldO1xuICAgIHZhciBwTlNTID0gKHAubnVtZXJvU2VjdXJpdGVTb2NpYWxlIHx8IFwiXCIpLnJlcGxhY2UoL1xcRC9nLCBcIlwiKTtcbiAgICBpZiAocE5TUy5sZW5ndGggPj0gMTMgJiYgcC5kYXRlTmFpc3NhbmNlICYmICFpc1VuZGVyMTgocC5kYXRlTmFpc3NhbmNlKSkge1xuICAgICAgcmV0dXJuIHAubnVtZXJvU2VjdXJpdGVTb2NpYWxlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYmVuZWZpY2lhaXJlTlNTO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVyMTgoZG9iKSB7XG4gIC8qIEFjY2VwdGUgREQvTU0vWVlZWSBvdSBZWVlZLU1NLUREICovXG4gIGxldCBkO1xuICBpZiAoZG9iLmluY2x1ZGVzKFwiL1wiKSkge1xuICAgIGNvbnN0IHAgPSBkb2Iuc3BsaXQoXCIvXCIpO1xuICAgIGQgPSBuZXcgRGF0ZShwWzJdLCBwWzFdIC0gMSwgcFswXSk7XG4gIH0gZWxzZSB7XG4gICAgZCA9IG5ldyBEYXRlKGRvYik7XG4gIH1cbiAgaWYgKGlzTmFOKGQuZ2V0VGltZSgpKSkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBhZ2UgPSAoRGF0ZS5ub3coKSAtIGQuZ2V0VGltZSgpKSAvICgzNjUuMjUgKiAyNCAqIDYwICogNjAgKiAxMDAwKTtcbiAgcmV0dXJuIGFnZSA8IDE4O1xufVxuXG5mdW5jdGlvbiBzaG93U3luY0J1dHRvbigpIHtcbiAgaWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhdWRpYm90LXN5bmMtYnRuJykpIHJldHVybjtcbiAgY29uc3QgYnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gIGJ0bi50eXBlID0gJ2J1dHRvbic7XG4gIGJ0bi5pZCA9ICdhdWRpYm90LXN5bmMtYnRuJztcbiAgYnRuLmlubmVyVGV4dCA9ICdcdUQ4M0RcdURDQkUgTVx1MDBFOW1vcmlzZXInO1xuICBidG4uc3R5bGUuY3NzVGV4dCA9IGBcbiAgICBwb3NpdGlvbjogZml4ZWQ7IGJvdHRvbTogODBweDsgcmlnaHQ6IDIwcHg7IHotaW5kZXg6IDk5OTk5OTtcbiAgICBiYWNrZ3JvdW5kOiAjOGI1Y2Y2OyBjb2xvcjogd2hpdGU7IGJvcmRlcjogbm9uZTsgcGFkZGluZzogMTJweCAyMHB4O1xuICAgIGJvcmRlci1yYWRpdXM6IDUwcHg7IGZvbnQtd2VpZ2h0OiBib2xkOyBjdXJzb3I6IHBvaW50ZXI7XG4gICAgYm94LXNoYWRvdzogMCA0cHggMTVweCByZ2JhKDAsMCwwLDAuMik7IGZvbnQtZmFtaWx5OiBzYW5zLXNlcmlmO1xuICAgIHRyYW5zaXRpb246IGFsbCAwLjJzO1xuICBgO1xuICBidG4ub25jbGljayA9IGFzeW5jICgpID0+IHtcbiAgICBidG4uaW5uZXJUZXh0ID0gJ1x1MjNGMyBFbiBjb3Vycy4uLic7XG4gICAgY29uc3QgY3VycmVudFNpdGUgPSBPYmplY3QudmFsdWVzKENPTkZJR1MpLmZpbmQoY2ZnID0+IGNmZy5pc01hdGNoKCkpO1xuICAgIGNvbnN0IHN1Y2Nlc3MgPSBhd2FpdCBjdXJyZW50U2l0ZS5hY3Rpb25zLnN5bmNocm9uaXNlcigpO1xuICAgIGlmIChzdWNjZXNzKSB7XG4gICAgICBidG4uaW5uZXJUZXh0ID0gJ1x1MjcwNSBDbGllbnQgbVx1MDBFOW1vcmlzXHUwMEU5ICEnO1xuICAgICAgYnRuLnN0eWxlLmJhY2tncm91bmQgPSAnIzEwYjk4MSc7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgYnRuLmlubmVyVGV4dCA9ICdcdUQ4M0RcdURDQkUgTVx1MDBFOW1vcmlzZXInO1xuICAgICAgICBidG4uc3R5bGUuYmFja2dyb3VuZCA9ICcjOGI1Y2Y2JztcbiAgICAgIH0sIDIwMDApO1xuICAgIH0gZWxzZSB7XG4gICAgICBidG4uaW5uZXJUZXh0ID0gJ1x1Mjc0QyBGb3JtdWxhaXJlIHZpZGUnO1xuICAgICAgYnRuLnN0eWxlLmJhY2tncm91bmQgPSAnI2VmNDQ0NCc7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgYnRuLmlubmVyVGV4dCA9ICdcdUQ4M0RcdURDQkUgTVx1MDBFOW1vcmlzZXInO1xuICAgICAgICBidG4uc3R5bGUuYmFja2dyb3VuZCA9ICcjOGI1Y2Y2JztcbiAgICAgIH0sIDIwMDApO1xuICAgIH1cbiAgfTtcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChidG4pO1xufVxuXG4vLyBcdTI1MDBcdTI1MDAgU3luYyBUUCBkZXB1aXMgTEJPIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG5mdW5jdGlvbiBzY3JhcGVUUFRhYmxlKCkge1xuICB2YXIgdGFibGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZ3JpZF9wb2ludGFnZV90aWVyc19wYXlhbnQgdGJvZHknKTtcbiAgaWYgKCF0YWJsZSkgcmV0dXJuIFtdO1xuICB2YXIgcm93cyA9IHRhYmxlLnF1ZXJ5U2VsZWN0b3JBbGwoJ3RyJyk7XG4gIHZhciBkb3NzaWVycyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHJvd3MubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgdHIgPSByb3dzW2ldO1xuICAgIHZhciB0ZHMgPSB0ci5xdWVyeVNlbGVjdG9yQWxsKCd0ZCcpO1xuICAgIGlmICh0ZHMubGVuZ3RoIDwgOSkgY29udGludWU7XG5cbiAgICB2YXIgZGF0ZSA9ICh0ZHNbMF0udGV4dENvbnRlbnQgfHwgXCJcIikudHJpbSgpO1xuICAgIHZhciBtb2RlRWwgPSB0ZHNbMV0ucXVlcnlTZWxlY3RvcignLmxhYmVsJyk7XG4gICAgdmFyIG1vZGUgPSBtb2RlRWwgPyAobW9kZUVsLnRleHRDb250ZW50IHx8IFwiXCIpLnRyaW0oKSA6IFwiXCI7XG4gICAgdmFyIG51bUZTRSA9ICh0ZHNbMl0udGV4dENvbnRlbnQgfHwgXCJcIikudHJpbSgpO1xuXG4gICAgdmFyIG9yZ1R5cGVFbCA9IHRkc1szXS5xdWVyeVNlbGVjdG9yKCcubGFiZWwnKTtcbiAgICB2YXIgb3JnVHlwZSA9IG9yZ1R5cGVFbCA/IChvcmdUeXBlRWwudGV4dENvbnRlbnQgfHwgXCJcIikudHJpbSgpIDogXCJcIjtcbiAgICB2YXIgb3JnYW5pc21lID0gKHRkc1szXS50ZXh0Q29udGVudCB8fCBcIlwiKS50cmltKCkucmVwbGFjZSgvXihST3xSQylcXHMqLywgXCJcIik7XG5cbiAgICB2YXIgYm9yZFRleHQgPSAodGRzWzRdLnRleHRDb250ZW50IHx8IFwiXCIpLnRyaW0oKTtcbiAgICB2YXIgbnVtQm9yZGVyZWF1ID0gYm9yZFRleHQucmVwbGFjZSgvXihCb3JkXFwuXFxzKk5cdTAwQjB8TG90XFxzKk5cdTAwQjApXFxzKi9pLCBcIlwiKS50cmltKCk7XG5cbiAgICAvKiBQQVMgREUgTk9NIENMSUVOVCBcdTIwMTQgb24gc2tpcCB0ZHNbNV0gKi9cblxuICAgIHZhciBtb250YW50VGV4dCA9ICh0ZHNbNl0udGV4dENvbnRlbnQgfHwgXCJcIikucmVwbGFjZSgvW15cXGQsLi1dL2csIFwiXCIpLnJlcGxhY2UoXCIsXCIsIFwiLlwiKS50cmltKCk7XG4gICAgdmFyIG1vbnRhbnQgPSBwYXJzZUZsb2F0KG1vbnRhbnRUZXh0KSB8fCAwO1xuXG4gICAgdmFyIHN0YXR1dEVsID0gdGRzWzddLnF1ZXJ5U2VsZWN0b3IoJy5sYWJlbC1kYW5nZXInKTtcbiAgICB2YXIgc3RhdHV0ID0gc3RhdHV0RWwgPyBcIlJlamV0XCIgOiAodGRzWzddLnRleHRDb250ZW50IHx8IFwiXCIpLnRyaW0oKTtcblxuICAgIHZhciByZW1hcnF1ZSA9ICh0ZHNbOF0udGV4dENvbnRlbnQgfHwgXCJcIikudHJpbSgpO1xuXG4gICAgLyogSURzIGRlcHVpcyBsZXMgZGF0YS1hdHRyaWJ1dGVzIGRlcyBib3V0b25zIGQnYWN0aW9uICovXG4gICAgdmFyIGVuY0J0biA9IHRkc1s5XSA/IHRkc1s5XS5xdWVyeVNlbGVjdG9yKCdbZGF0YS1ib3JkZXJlYXVfcmVnaW1lX2RldGFpbF9pZF0nKSA6IG51bGw7XG4gICAgdmFyIGxib0RldGFpbElkID0gZW5jQnRuID8gZW5jQnRuLmdldEF0dHJpYnV0ZSgnZGF0YS1ib3JkZXJlYXVfcmVnaW1lX2RldGFpbF9pZCcpIDogXCJcIjtcblxuICAgIHZhciByZWpldEJ0biA9IHRkc1s5XSA/IHRkc1s5XS5xdWVyeVNlbGVjdG9yKCdbZGF0YS1yZWpldF9ub2VtaV90eXBlX2lkXScpIDogbnVsbDtcbiAgICB2YXIgcmVqZXRUeXBlSWQgPSByZWpldEJ0biA/IHJlamV0QnRuLmdldEF0dHJpYnV0ZSgnZGF0YS1yZWpldF9ub2VtaV90eXBlX2lkJykgOiBcIlwiO1xuXG4gICAgZG9zc2llcnMucHVzaCh7XG4gICAgICBkYXRlOiBkYXRlLFxuICAgICAgbW9kZTogbW9kZSxcbiAgICAgIG51bUZTRTogbnVtRlNFLFxuICAgICAgdHlwZTogb3JnVHlwZSxcbiAgICAgIG9yZ2FuaXNtZTogb3JnYW5pc21lLFxuICAgICAgbnVtQm9yZGVyZWF1OiBudW1Cb3JkZXJlYXUsXG4gICAgICBtb250YW50OiBtb250YW50LFxuICAgICAgc3RhdHV0OiBzdGF0dXQsXG4gICAgICByZW1hcnF1ZTogcmVtYXJxdWUsXG4gICAgICByZWpldFR5cGVJZDogcmVqZXRUeXBlSWQgfHwgXCJcIixcbiAgICAgIGxib0RldGFpbElkOiBsYm9EZXRhaWxJZCB8fCBcIlwiXG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIGRvc3NpZXJzO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzeW5jVFBUb0F1ZGlCb3QoYnRuKSB7XG4gIGJ0bi5pbm5lclRleHQgPSBcIkNoYXJnZW1lbnQuLi5cIjtcbiAgYnRuLnN0eWxlLmJhY2tncm91bmQgPSBcIiM2MzY2ZjFcIjtcblxuICAvKiBQYXNzZXIgbGUgRGF0YVRhYmxlIGVuIDEwMCBsaWduZXMgcG91ciB0b3V0IHJcdTAwRTljdXBcdTAwRTlyZXIgKi9cbiAgdmFyIGxlbmd0aFNlbGVjdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNncmlkX3BvaW50YWdlX3RpZXJzX3BheWFudF9sZW5ndGggc2VsZWN0Jyk7XG4gIHZhciBvcmlnaW5hbExlbmd0aCA9IGxlbmd0aFNlbGVjdCA/IGxlbmd0aFNlbGVjdC52YWx1ZSA6IFwiMTBcIjtcbiAgaWYgKGxlbmd0aFNlbGVjdCAmJiBsZW5ndGhTZWxlY3QudmFsdWUgIT09IFwiMTAwXCIpIHtcbiAgICBsZW5ndGhTZWxlY3QudmFsdWUgPSBcIjEwMFwiO1xuICAgIGxlbmd0aFNlbGVjdC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImNoYW5nZVwiLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgIGF3YWl0IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHIpIHsgc2V0VGltZW91dChyLCAyMDAwKTsgfSk7XG4gIH1cblxuICB2YXIgYWxsRG9zc2llcnMgPSBbXTtcbiAgdmFyIG1heFBhZ2VzID0gMjA7XG4gIHZhciBwYWdlID0gMDtcblxuICB3aGlsZSAocGFnZSA8IG1heFBhZ2VzKSB7XG4gICAgYnRuLmlubmVyVGV4dCA9IFwiUGFnZSBcIiArIChwYWdlICsgMSkgKyBcIi4uLlwiO1xuICAgIHZhciBiYXRjaCA9IHNjcmFwZVRQVGFibGUoKTtcbiAgICBpZiAoYmF0Y2gubGVuZ3RoID09PSAwKSBicmVhaztcbiAgICBhbGxEb3NzaWVycyA9IGFsbERvc3NpZXJzLmNvbmNhdChiYXRjaCk7XG5cbiAgICB2YXIgbmV4dEJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNncmlkX3BvaW50YWdlX3RpZXJzX3BheWFudF9uZXh0Om5vdCguZGlzYWJsZWQpJyk7XG4gICAgaWYgKCFuZXh0QnRuKSBicmVhaztcbiAgICBuZXh0QnRuLnF1ZXJ5U2VsZWN0b3IoJ2EnKS5jbGljaygpO1xuICAgIGF3YWl0IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHIpIHsgc2V0VGltZW91dChyLCAxNTAwKTsgfSk7XG4gICAgcGFnZSsrO1xuICB9XG5cbiAgLyogUmV2ZW5pciBcdTAwRTAgbGEgcHJlbWlcdTAwRThyZSBwYWdlICovXG4gIHZhciBmaXJzdFBhZ2VCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZ3JpZF9wb2ludGFnZV90aWVyc19wYXlhbnRfcGFnaW5hdGUgLnBhZ2luYXRlX2J1dHRvbjpudGgtY2hpbGQoMikgYScpO1xuICBpZiAoZmlyc3RQYWdlQnRuKSBmaXJzdFBhZ2VCdG4uY2xpY2soKTtcblxuICAvKiBSZXN0YXVyZXIgbGUgbm9tYnJlIGRlIGxpZ25lcyAqL1xuICBpZiAobGVuZ3RoU2VsZWN0ICYmIG9yaWdpbmFsTGVuZ3RoICE9PSBcIjEwMFwiKSB7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIGxlbmd0aFNlbGVjdC52YWx1ZSA9IG9yaWdpbmFsTGVuZ3RoO1xuICAgICAgbGVuZ3RoU2VsZWN0LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiY2hhbmdlXCIsIHsgYnViYmxlczogdHJ1ZSB9KSk7XG4gICAgfSwgNTAwKTtcbiAgfVxuXG4gIGlmIChhbGxEb3NzaWVycy5sZW5ndGggPT09IDApIHtcbiAgICBidG4uaW5uZXJUZXh0ID0gXCJBdWN1biBkb3NzaWVyXCI7XG4gICAgYnRuLnN0eWxlLmJhY2tncm91bmQgPSBcIiNlZjQ0NDRcIjtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBidG4uaW5uZXJUZXh0ID0gXCJTeW5jIFRQXCI7IGJ0bi5zdHlsZS5iYWNrZ3JvdW5kID0gXCIjNjM2NmYxXCI7IH0sIDIwMDApO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGJ0bi5pbm5lclRleHQgPSBcIkVudm9pIFwiICsgYWxsRG9zc2llcnMubGVuZ3RoICsgXCIgZG9zc2llcnMuLi5cIjtcblxuICAvKiBSXHUwMEU5Y3VwXHUwMEU5cmVyIGxlIHN5bmNUb2tlbiBkZXB1aXMgYXVkaWJvdF9hdXRoIChzb3VyY2UgZGUgdlx1MDBFOXJpdFx1MDBFOSkgKi9cbiAgdmFyIHN5bmNUb2tlbiA9IGF3YWl0IGdldFN5bmNUb2tlbigpO1xuICBpZiAoIXN5bmNUb2tlbikge1xuICAgIGJ0bi5pbm5lclRleHQgPSBcIkNvbm5lY3Rlei12b3VzIHN1ciBBdWRpQm90XCI7XG4gICAgYnRuLnN0eWxlLmJhY2tncm91bmQgPSBcIiNlZjQ0NDRcIjtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBidG4uaW5uZXJUZXh0ID0gXCJTeW5jIFRQXCI7IGJ0bi5zdHlsZS5iYWNrZ3JvdW5kID0gXCIjNjM2NmYxXCI7IH0sIDMwMDApO1xuICAgIHJldHVybjtcbiAgfVxuICAoYXN5bmMgZnVuY3Rpb24oKSB7XG5cbiAgICB0cnkge1xuICAgICAgdmFyIHJlc3AgPSBhd2FpdCBmZXRjaChcImh0dHBzOi8vYXVkaWJvdC5mci9hcGkvZXh0ZW5zaW9uL3N5bmMtdHBcIiwge1xuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgc3luY1Rva2VuOiBzeW5jVG9rZW4sIGRvc3NpZXJzOiBhbGxEb3NzaWVycyB9KVxuICAgICAgfSk7XG4gICAgICB2YXIgZGF0YSA9IGF3YWl0IHJlc3AuanNvbigpO1xuICAgICAgaWYgKGRhdGEuc3VjY2Vzcykge1xuICAgICAgICBidG4uaW5uZXJUZXh0ID0gXCIrXCIgKyBkYXRhLmNyZWF0ZWQgKyBcIiAvIG1haiBcIiArIGRhdGEudXBkYXRlZDtcbiAgICAgICAgYnRuLnN0eWxlLmJhY2tncm91bmQgPSBcIiMxMGI5ODFcIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJ0bi5pbm5lclRleHQgPSBkYXRhLmVycm9yIHx8IFwiRXJyZXVyXCI7XG4gICAgICAgIGJ0bi5zdHlsZS5iYWNrZ3JvdW5kID0gXCIjZWY0NDQ0XCI7XG4gICAgICB9XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBidG4uaW5uZXJUZXh0ID0gXCJFcnJldXIgclx1MDBFOXNlYXVcIjtcbiAgICAgIGJ0bi5zdHlsZS5iYWNrZ3JvdW5kID0gXCIjZWY0NDQ0XCI7XG4gICAgfVxuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHsgYnRuLmlubmVyVGV4dCA9IFwiU3luYyBUUFwiOyBidG4uc3R5bGUuYmFja2dyb3VuZCA9IFwiIzYzNjZmMVwiOyB9LCAzMDAwKTtcbiAgfSkoKTtcbn1cblxuZnVuY3Rpb24gc2hvd1N5bmNUUEJ1dHRvbigpIHtcbiAgaWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhdWRpYm90LXN5bmMtdHAtYnRuJykpIHJldHVybjtcbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZ3JpZF9wb2ludGFnZV90aWVyc19wYXlhbnQnKSkgcmV0dXJuO1xuICB2YXIgYnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gIGJ0bi50eXBlID0gJ2J1dHRvbic7XG4gIGJ0bi5pZCA9ICdhdWRpYm90LXN5bmMtdHAtYnRuJztcbiAgYnRuLmlubmVyVGV4dCA9ICdTeW5jIFRQJztcbiAgYnRuLnN0eWxlLmNzc1RleHQgPSBbXG4gICAgJ3Bvc2l0aW9uOiBmaXhlZDsgYm90dG9tOiAxNDBweDsgcmlnaHQ6IDIwcHg7IHotaW5kZXg6IDk5OTk5OTsnLFxuICAgICdiYWNrZ3JvdW5kOiAjNjM2NmYxOyBjb2xvcjogd2hpdGU7IGJvcmRlcjogbm9uZTsgcGFkZGluZzogMTJweCAyMHB4OycsXG4gICAgJ2JvcmRlci1yYWRpdXM6IDUwcHg7IGZvbnQtd2VpZ2h0OiBib2xkOyBjdXJzb3I6IHBvaW50ZXI7JyxcbiAgICAnYm94LXNoYWRvdzogMCA0cHggMTVweCByZ2JhKDAsMCwwLDAuMik7IGZvbnQtZmFtaWx5OiBzYW5zLXNlcmlmOycsXG4gICAgJ3RyYW5zaXRpb246IGFsbCAwLjJzOydcbiAgXS5qb2luKCcnKTtcbiAgYnRuLm9uY2xpY2sgPSBmdW5jdGlvbigpIHsgc3luY1RQVG9BdWRpQm90KGJ0bik7IH07XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYnRuKTtcbn1cblxuLy8gXHUyNTAwXHUyNTAwIFJQQSBMb2dnaW5nIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG5mdW5jdGlvbiBsb2dSUEEobXV0dWVsbGUsIGV0YXBlLCBzdGF0dXQsIGVycmV1cikge1xuICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoW1wiYXVkaWJvdF9hdXRoXCJdLCBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICB2YXIgc3luY1Rva2VuID0gKHJlc3VsdC5hdWRpYm90X2F1dGggJiYgcmVzdWx0LmF1ZGlib3RfYXV0aC5zeW5jVG9rZW4pIHx8IG51bGw7XG4gICAgZmV0Y2goXCJodHRwczovL2F1ZGlib3QuZnIvYXBpL2V4dGVuc2lvbi9ycGEtbG9nXCIsIHtcbiAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIHN5bmNUb2tlbjogc3luY1Rva2VuLFxuICAgICAgICBtdXR1ZWxsZTogbXV0dWVsbGUsXG4gICAgICAgIGV0YXBlOiBldGFwZSxcbiAgICAgICAgc3RhdHV0OiBzdGF0dXQsXG4gICAgICAgIGVycmV1cjogZXJyZXVyIHx8IG51bGwsXG4gICAgICAgIHVybDogd2luZG93LmxvY2F0aW9uLmhyZWZcbiAgICAgIH0pXG4gICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7IGNvbnNvbGUud2FybihcIltBdWRpQm90XSBSUEEgbG9nIGZhaWxlZDpcIiwgZXJyKTsgfSk7IC8qIHNpbGVudCBmYWlsICovXG4gIH0pO1xufVxuXG4vLyBcdTI1MDBcdTI1MDAgUlBBIFRvYXN0IFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG5mdW5jdGlvbiBzaG93UlBBVG9hc3QobWVzc2FnZSwgdHlwZSkge1xuICB2YXIgZXhpc3RpbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXVkaWJvdC1ycGEtdG9hc3QnKTtcbiAgaWYgKGV4aXN0aW5nKSBleGlzdGluZy5yZW1vdmUoKTtcblxuICB2YXIgY29sb3JzID0ge1xuICAgIGluZm86IHsgYmc6ICcjMjU2M2ViJywgYm9yZGVyOiAnIzNiODJmNicgfSxcbiAgICBzdWNjZXNzOiB7IGJnOiAnIzEwYjk4MScsIGJvcmRlcjogJyMzNGQzOTknIH0sXG4gICAgd2FybmluZzogeyBiZzogJyNmNTllMGInLCBib3JkZXI6ICcjZmJiZjI0JyB9LFxuICAgIGVycm9yOiB7IGJnOiAnI2VmNDQ0NCcsIGJvcmRlcjogJyNmODcxNzEnIH1cbiAgfTtcbiAgdmFyIGMgPSBjb2xvcnNbdHlwZV0gfHwgY29sb3JzLmluZm87XG5cbiAgdmFyIHRvYXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIHRvYXN0LmlkID0gJ2F1ZGlib3QtcnBhLXRvYXN0JztcbiAgdG9hc3QudGV4dENvbnRlbnQgPSBtZXNzYWdlO1xuICB0b2FzdC5zdHlsZS5jc3NUZXh0ID0gW1xuICAgICdwb3NpdGlvbjogZml4ZWQ7IGJvdHRvbTogODBweDsgcmlnaHQ6IDIwcHg7IHotaW5kZXg6IDk5OTk5OTk7JyxcbiAgICAnYmFja2dyb3VuZDogJyArIGMuYmcgKyAnOyBjb2xvcjogd2hpdGU7IGJvcmRlcjogMnB4IHNvbGlkICcgKyBjLmJvcmRlciArICc7JyxcbiAgICAncGFkZGluZzogMTRweCAyMnB4OyBib3JkZXItcmFkaXVzOiAxNHB4OyBmb250LXdlaWdodDogNjAwOyBmb250LXNpemU6IDEzcHg7JyxcbiAgICAnZm9udC1mYW1pbHk6IHNhbnMtc2VyaWY7IGJveC1zaGFkb3c6IDAgOHB4IDMwcHggcmdiYSgwLDAsMCwwLjI1KTsnLFxuICAgICdtYXgtd2lkdGg6IDM2MHB4OyBsaW5lLWhlaWdodDogMS40OyBvcGFjaXR5OiAwOyB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuM3M7J1xuICBdLmpvaW4oJycpO1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRvYXN0KTtcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkgeyB0b2FzdC5zdHlsZS5vcGFjaXR5ID0gJzEnOyB9KTtcblxuICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgIHRvYXN0LnN0eWxlLm9wYWNpdHkgPSAnMCc7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHsgdG9hc3QucmVtb3ZlKCk7IH0sIDMwMCk7XG4gIH0sIDQwMDApO1xufVxuXG4vKiBcdTI1MDBcdTI1MDAgaWZyYW1lcyBjcm9zcy1kb21haW4gcG9zdE1lc3NhZ2UgbGlzdGVuZXIgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgZnVuY3Rpb24oZSkge1xuICBpZiAoIWUuZGF0YSB8fCBlLmRhdGEudHlwZSAhPT0gXCJBVURJQk9UX0ZJTExfRlJBTUVcIiB8fCAhZS5kYXRhLnBheWxvYWQpIHJldHVybjtcbiAgLyogVmFsaWRlciBsJ29yaWdpbmUgOiBhY2NlcHRlciBzYW1lLW9yaWdpbiArIGlmcmFtZXMgZW5mYW50cyBjb25udWVzICovXG4gIGlmIChlLm9yaWdpbiAhPT0gd2luZG93LmxvY2F0aW9uLm9yaWdpbikge1xuICAgIHZhciBpc0tub3duRnJhbWUgPSBmYWxzZTtcbiAgICB2YXIgZnJhbWVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcImlmcmFtZVwiKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZyYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKGZyYW1lc1tpXS5zcmMgJiYgbmV3IFVSTChmcmFtZXNbaV0uc3JjKS5vcmlnaW4gPT09IGUub3JpZ2luKSB7XG4gICAgICAgICAgaXNLbm93bkZyYW1lID0gdHJ1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaChlcnIpIHt9XG4gICAgfVxuICAgIGlmICghaXNLbm93bkZyYW1lKSB7XG4gICAgICBjb25zb2xlLndhcm4oXCJbQXVkaUJvdF0gcG9zdE1lc3NhZ2UgcmVqZXRcdTAwRTkgXHUyMDE0IGlmcmFtZSBub24gcmVjb25udWUgOlwiLCBlLm9yaWdpbik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG4gIC8qIFx1MDBDOWNyaXJlIGxlIHBheWxvYWQgZGFucyBsZSBjYWNoZSBhdmFudCBkJ2FwcGVsZXIgcGVyZm9ybVNtYXJ0RmlsbCAocXVpIGxpdCBkZXB1aXMgbGUgY2FjaGUpICovXG4gIHZhciBwYXlsb2FkID0gZS5kYXRhLnBheWxvYWQ7XG4gIHZhciBjYWNoZVByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKTtcbiAgaWYgKHBheWxvYWQgJiYgKHBheWxvYWQubSB8fCBwYXlsb2FkLm8pKSB7XG4gICAgdmFyIG5vbSA9ICgocGF5bG9hZC5tICYmIHBheWxvYWQubS5ub20pIHx8IChwYXlsb2FkLm8gJiYgcGF5bG9hZC5vLm5vbVBhdGllbnQpIHx8IFwiXCIpLnRvVXBwZXJDYXNlKCk7XG4gICAgaWYgKG5vbSkge1xuICAgICAgdmFyIGN1cnJlbnQgPSBPYmplY3QuYXNzaWduKHt9LCBwYXlsb2FkLm0gfHwge30sIHsgb3Jkb25uYW5jZTogcGF5bG9hZC5vIHx8IHt9LCB1cGRhdGVkQXQ6IERhdGUubm93KCkgfSk7XG4gICAgICBjYWNoZVByb21pc2UgPSB3cml0ZUVuY3J5cHRlZENhY2hlKHsgY3VycmVudDogY3VycmVudCB9KTtcbiAgICB9XG4gIH1cbiAgY2FjaGVQcm9taXNlLnRoZW4oZnVuY3Rpb24oKSB7IHBlcmZvcm1TbWFydEZpbGwoKTsgfSk7XG4gIC8qIEFjY3VzXHUwMEU5IGRlIHJcdTAwRTljZXB0aW9uIHZlcnMgbGEgc291cmNlICovXG4gIGlmIChlLnNvdXJjZSkge1xuICAgIHRyeSB7IGUuc291cmNlLnBvc3RNZXNzYWdlKHsgdHlwZTogXCJBVURJQk9UX0ZJTExfRlJBTUVfQUNLXCIsIG9rOiB0cnVlIH0sIGUub3JpZ2luKTsgfSBjYXRjaChlcnIpIHt9XG4gIH1cbn0sIGZhbHNlKTtcblxuLy8gXHUyNTAwXHUyNTAwIEluaXRpYWxpc2F0aW9uIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG5mdW5jdGlvbiBpbml0TG9jYWwoKSB7XG4gIGlmICh3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUuaW5jbHVkZXMoXCJsb2NhbGhvc3RcIikpIHJldHVybjtcblxuICBsb2FkU2VsZWN0b3JDYWNoZSgpO1xuICAvKiBDaGFyZ2VyIGxlcyBvdmVycmlkZXMgZGUgc2VsZWN0ZXVycyBkaXN0YW50cyAqL1xuICBpZiAodHlwZW9mIGxvYWRSZW1vdGVTZWxlY3RvcnMgPT09IFwiZnVuY3Rpb25cIikgbG9hZFJlbW90ZVNlbGVjdG9ycygpO1xuICAvKiBWMy05OiBDaGFyZ2VyIGxlIG1vZGVsZSBkZSBwcmVkaWN0aW9uIGRlIHJlamV0ICovXG4gIGlmICh0eXBlb2YgbG9hZFJlamVjdGlvbk1vZGVsID09PSBcImZ1bmN0aW9uXCIpIGxvYWRSZWplY3Rpb25Nb2RlbCgpO1xuXG4gIGNvbnN0IGN1cnJlbnRTaXRlID0gT2JqZWN0LnZhbHVlcyhDT05GSUdTKS5maW5kKGNmZyA9PiBjZmcuaXNNYXRjaCgpKTtcblxuICAvKiBQb3J0YWlsIGluY29ubnUgXHUyMDE0IGFmZmljaGVyIHF1YW5kIG1cdTAwRUFtZSBsZSBib3V0b24gU21hcnQgRmlsbCAqL1xuICBpZiAoIWN1cnJlbnRTaXRlKSB7XG4gICAgaWYgKCFkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF1ZGlib3QtZmlsbC1idG5cIikpIHtcbiAgICAgIHZhciBidG5TbWFydCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgICBidG5TbWFydC50eXBlID0gXCJidXR0b25cIjtcbiAgICAgIGJ0blNtYXJ0LmlkID0gXCJhdWRpYm90LWZpbGwtYnRuXCI7XG4gICAgICBidG5TbWFydC5pbm5lclRleHQgPSBcIlx1RDgzRVx1REQxNiBSZW1wbGlyXCI7XG4gICAgICBidG5TbWFydC5zdHlsZS5jc3NUZXh0ID0gXCJwb3NpdGlvbjpmaXhlZDtib3R0b206MjBweDtyaWdodDoyMHB4O3otaW5kZXg6OTk5OTk5O2JhY2tncm91bmQ6IzdjM2FlZDtjb2xvcjp3aGl0ZTtib3JkZXI6bm9uZTtwYWRkaW5nOjEycHggMjBweDtib3JkZXItcmFkaXVzOjUwcHg7Zm9udC13ZWlnaHQ6Ym9sZDtjdXJzb3I6cG9pbnRlcjtib3gtc2hhZG93OjAgNHB4IDE1cHggcmdiYSgwLDAsMCwwLjIpO2ZvbnQtZmFtaWx5OnNhbnMtc2VyaWY7dHJhbnNpdGlvbjphbGwgMC4ycztcIjtcbiAgICAgIGJ0blNtYXJ0LnRpdGxlID0gXCJSZW1wbGlyIGxlcyBjaGFtcHMgZGUgY2V0dGUgcGFnZVwiO1xuICAgICAgYnRuU21hcnQub25jbGljayA9IGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdXNlZER5bmFtaWMgPSBhd2FpdCB0cnlEeW5hbWljUmVwbGF5KCk7XG4gICAgICAgIGlmICghdXNlZER5bmFtaWMpIHtcbiAgICAgICAgICAvKiBQb3J0YWlsIGNvbm51IGF2ZWMgbWFwcGluZyBjb2RcdTAwRTkgXHUyMTkyIHV0aWxpc2VyIHBlcmZvcm1GaWxsIGVuIHByaW9yaXRcdTAwRTksIHNtYXJ0IGZpbGwgZW4gZmFsbGJhY2sgKi9cbiAgICAgICAgICBwZXJmb3JtRmlsbCgpLnRoZW4oZnVuY3Rpb24oKSB7fSkuY2F0Y2goZnVuY3Rpb24oKSB7IHBlcmZvcm1TbWFydEZpbGwoKTsgfSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGJ0blNtYXJ0KTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gQ3JcdTAwRTlhdGlvbiBkdSBib3V0b24gUmVtcGxpclxuICBpZiAoIWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhdWRpYm90LWZpbGwtYnRuJykpIHtcbiAgICBjb25zdCBidG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICBidG4udHlwZSA9ICdidXR0b24nO1xuICAgIGJ0bi5pZCA9ICdhdWRpYm90LWZpbGwtYnRuJztcbiAgICBidG4uaW5uZXJUZXh0ID0gJ1x1RDgzRVx1REQxNiBSZW1wbGlyJztcbiAgICBidG4uc3R5bGUuY3NzVGV4dCA9IGBcbiAgICAgIHBvc2l0aW9uOiBmaXhlZDsgYm90dG9tOiAyMHB4OyByaWdodDogMjBweDsgei1pbmRleDogOTk5OTk5O1xuICAgICAgYmFja2dyb3VuZDogIzI1NjNlYjsgY29sb3I6IHdoaXRlOyBib3JkZXI6IG5vbmU7IHBhZGRpbmc6IDEycHggMjBweDtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDUwcHg7IGZvbnQtd2VpZ2h0OiBib2xkOyBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICBib3gtc2hhZG93OiAwIDRweCAxNXB4IHJnYmEoMCwwLDAsMC4yKTsgZm9udC1mYW1pbHk6IHNhbnMtc2VyaWY7XG4gICAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycztcbiAgICBgO1xuICAgIGJ0bi50aXRsZSA9IFwiUmVtcGxpciBsZXMgY2hhbXBzIGRlIGNldHRlIHBhZ2VcIjtcbiAgICBidG4ub25jbGljayA9IGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHVzZWREeW5hbWljID0gYXdhaXQgdHJ5RHluYW1pY1JlcGxheSgpO1xuICAgICAgaWYgKCF1c2VkRHluYW1pYykge1xuICAgICAgICAvKiBTaXRlIGNvbm51IFx1MjE5MiBmb3JtdWxhaXJlIGNvZFx1MDBFOSBlbiBwcmlvcml0XHUwMEU5LCBTbWFydEZpbGwgZW4gZmFsbGJhY2sgKi9cbiAgICAgICAgcGVyZm9ybUZpbGwoKS50aGVuKGZ1bmN0aW9uKCkge30pLmNhdGNoKGZ1bmN0aW9uKCkgeyBwZXJmb3JtU21hcnRGaWxsKCk7IH0pO1xuICAgICAgfVxuICAgIH07XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChidG4pO1xuICB9XG5cbiAgLy8gQWZmaWNoYWdlIHBlcm1hbmVudCBkdSBib3V0b24gTVx1MDBFOW1vcmlzZXIgc3VyIExpdmVieU9wdGltdW1cbiAgaWYgKGN1cnJlbnRTaXRlLm5hbWUgPT09IFwiTGl2ZWJ5T3B0aW11bVwiKSB7XG4gICAgc2hvd1N5bmNCdXR0b24oKTtcbiAgICBzaG93U3luY1RQQnV0dG9uKCk7XG5cbiAgICAvKiBMZSBEYXRhVGFibGUgVFAgc2UgY2hhcmdlIGVuIEFKQVggXHUyMDE0IG9ic2VydmVyIGxlIERPTSBwb3VyIGxlIGRcdTAwRTl0ZWN0ZXIgKi9cbiAgICB2YXIgdHBPYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uKCkge1xuICAgICAgc2hvd1N5bmNUUEJ1dHRvbigpO1xuICAgICAgYXBwbHlCdXR0b25zUHJlZmVyZW5jZSgpO1xuICAgIH0pO1xuICAgIHRwT2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7IGNoaWxkTGlzdDogdHJ1ZSwgc3VidHJlZTogdHJ1ZSB9KTtcbiAgfVxuXG4gIC8qIFZcdTAwRTlyaWZpZXIgcydpbCB5IGEgdW4gUlBBIGVuIGF0dGVudGUgKi9cbiAgY2hlY2tBbmRTdGFydFJQQSgpO1xuXG4gIC8qIFx1MjUwMFx1MjUwMCBBbVx1MDBFOWxpb3JhdGlvbiA1IDogZFx1MDBFOXRlY3Rpb24gY29ycmVjdGlvbnMgdXRpbGlzYXRldXIgXHUyNTAwXHUyNTAwICovXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCBmdW5jdGlvbihlKSB7XG4gICAgdmFyIGVsID0gZS50YXJnZXQ7XG4gICAgaWYgKCFlbCB8fCAhZWwuZ2V0QXR0cmlidXRlKSByZXR1cm47XG4gICAgdmFyIGZpbGxlZFZhciA9IGVsLmdldEF0dHJpYnV0ZShcImRhdGEtYXVkaWJvdC1maWxsZWRcIik7XG4gICAgaWYgKCFmaWxsZWRWYXIpIHJldHVybjtcbiAgICB2YXIgb2xkVmFsdWUgPSBlbC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWF1ZGlib3QtdmFsdWVcIik7XG4gICAgaWYgKGVsLnZhbHVlICE9PSBvbGRWYWx1ZSkge1xuICAgICAgc2VuZExlYXJuaW5nU2lnbmFsKHtcbiAgICAgICAgaG9zdG5hbWU6IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSxcbiAgICAgICAgc2VsZWN0b3I6IGdlbmVyYXRlU2VsZWN0b3JzKGVsKVswXSB8fCBcIlwiLFxuICAgICAgICBsYWJlbDogbm9ybWFsaXplTGFiZWwoZ2V0RmllbGRMYWJlbChlbCkpLFxuICAgICAgICBvbGRWYXJpYWJsZTogZmlsbGVkVmFyLFxuICAgICAgICBjb3JyZWN0VmFyaWFibGU6IG51bGxcbiAgICAgIH0pO1xuICAgIH1cbiAgfSwgdHJ1ZSk7XG5cbiAgLyogXHUyNTAwXHUyNTAwIEFtXHUwMEU5bGlvcmF0aW9uIDcgOiBNdXRhdGlvbk9ic2VydmVyIHBvdXIgZm9ybXVsYWlyZXMgbXVsdGktc3RlcCBcdTI1MDBcdTI1MDAgKi9cbiAgdmFyIF9zbWFydEZpbGxEZWJvdW5jZSA9IG51bGw7XG4gIHZhciBfa25vd25GaWVsZElkcyA9IG5ldyBTZXQoKTtcbiAgLyogTVx1MDBFOW1vcmlzZXIgbGVzIGNoYW1wcyBkXHUwMEU5alx1MDBFMCB2aXNpYmxlcyAqL1xuICBnZXRWaXNpYmxlRmllbGRzKCkuZm9yRWFjaChmdW5jdGlvbihmKSB7XG4gICAgX2tub3duRmllbGRJZHMuYWRkKGYuaWQgfHwgZi5uYW1lIHx8IGYuZ2V0QXR0cmlidXRlKFwiZm9ybWNvbnRyb2xuYW1lXCIpIHx8IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpKTtcbiAgfSk7XG5cbiAgdmFyIF9hY3RpdmVPYnNlcnZlcnMgPSBbXTtcblxuICBmdW5jdGlvbiBvYnNlcnZlRG9jKGRvYykge1xuICAgIGlmICghZG9jIHx8IGRvYy5fYXVkaWJvdE9ic2VydmVkKSByZXR1cm47XG4gICAgZG9jLl9hdWRpYm90T2JzZXJ2ZWQgPSB0cnVlO1xuICAgIHZhciBvYnMgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbigpIHtcbiAgICAgIGlmIChfc21hcnRGaWxsRGVib3VuY2UpIGNsZWFyVGltZW91dChfc21hcnRGaWxsRGVib3VuY2UpO1xuICAgICAgX3NtYXJ0RmlsbERlYm91bmNlID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGN1cnJlbnRGaWVsZHMgPSBnZXRWaXNpYmxlRmllbGRzKCk7XG4gICAgICAgIHZhciBoYXNOZXcgPSBmYWxzZTtcbiAgICAgICAgY3VycmVudEZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgICB2YXIga2V5ID0gZi5pZCB8fCBmLm5hbWUgfHwgKGYuZ2V0QXR0cmlidXRlICYmIGYuZ2V0QXR0cmlidXRlKFwiZm9ybWNvbnRyb2xuYW1lXCIpKSB8fCBcIlwiO1xuICAgICAgICAgIGlmIChrZXkgJiYgIV9rbm93bkZpZWxkSWRzLmhhcyhrZXkpICYmICEoZi5nZXRBdHRyaWJ1dGUgJiYgZi5nZXRBdHRyaWJ1dGUoXCJkYXRhLWF1ZGlib3QtZmlsbGVkXCIpKSkge1xuICAgICAgICAgICAgaGFzTmV3ID0gdHJ1ZTtcbiAgICAgICAgICAgIF9rbm93bkZpZWxkSWRzLmFkZChrZXkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChoYXNOZXcpIHBlcmZvcm1TbWFydEZpbGwoKTtcbiAgICAgIH0sIDYwMCk7XG4gICAgfSk7XG4gICAgb2JzLm9ic2VydmUoZG9jLmJvZHkgfHwgZG9jLmRvY3VtZW50RWxlbWVudCwge1xuICAgICAgY2hpbGRMaXN0OiB0cnVlLCBzdWJ0cmVlOiB0cnVlLCBhdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgYXR0cmlidXRlRmlsdGVyOiBbXCJzdHlsZVwiLCBcImNsYXNzXCIsIFwiaGlkZGVuXCIsIFwiYXJpYS1oaWRkZW5cIl1cbiAgICB9KTtcbiAgICBfYWN0aXZlT2JzZXJ2ZXJzLnB1c2gob2JzKTtcbiAgfVxuXG4gIC8qIE9ic2VydmVyIGxlIGRvY3VtZW50IHByaW5jaXBhbCAqL1xuICBvYnNlcnZlRG9jKGRvY3VtZW50KTtcblxuICAvKiBPYnNlcnZlciBsZXMgaWZyYW1lcyBleGlzdGFudGVzIGV0IGNlbGxlcyBxdWkgYXJyaXZlbnQgZHluYW1pcXVlbWVudCAqL1xuICBmdW5jdGlvbiBvYnNlcnZlSWZyYW1lcygpIHtcbiAgICB2YXIgaWZyYW1lcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJpZnJhbWVcIik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpZnJhbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0cnkge1xuICAgICAgICB2YXIgaURvYyA9IGlmcmFtZXNbaV0uY29udGVudERvY3VtZW50IHx8IChpZnJhbWVzW2ldLmNvbnRlbnRXaW5kb3cgJiYgaWZyYW1lc1tpXS5jb250ZW50V2luZG93LmRvY3VtZW50KTtcbiAgICAgICAgaWYgKGlEb2MgJiYgaURvYy5ib2R5KSBvYnNlcnZlRG9jKGlEb2MpO1xuICAgICAgfSBjYXRjaChlKSB7fVxuICAgIH1cbiAgfVxuICBvYnNlcnZlSWZyYW1lcygpO1xuICB2YXIgaWZyYW1lV2F0Y2hlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uKCkgeyBvYnNlcnZlSWZyYW1lcygpOyB9KTtcbiAgaWZyYW1lV2F0Y2hlci5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHsgY2hpbGRMaXN0OiB0cnVlLCBzdWJ0cmVlOiB0cnVlIH0pO1xuXG4gIC8qIFYzLTg6IERldmlzIGF1dG8tZGV0ZWN0aW9uICovXG4gIHRyeSB7IHNldHVwRGV2aXNEZXRlY3Rpb24oKTsgfSBjYXRjaChlKSB7fVxufVxuXG4vKiBcdTI1MDBcdTI1MDAgVmlzaWJpbGl0ZSBkZXMgYm91dG9ucyAodG9nZ2xlIGRlcHVpcyBwb3B1cCkgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG5cbmZ1bmN0aW9uIHNldEJ1dHRvbnNWaXNpYmlsaXR5KHZpc2libGUpIHtcbiAgdmFyIGlkcyA9IFsnYXVkaWJvdC1maWxsLWJ0bicsICdhdWRpYm90LXN5bmMtYnRuJywgJ2F1ZGlib3Qtc3luYy10cC1idG4nXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBpZHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZHNbaV0pO1xuICAgIGlmIChlbCkgZWwuc3R5bGUuZGlzcGxheSA9IHZpc2libGUgPyAnYmxvY2snIDogJ25vbmUnO1xuICB9XG59XG5cbi8qIEVjb3V0ZSBsZSBtZXNzYWdlIGR1IHBvcHVwIHBvdXIgdG9nZ2xlIGltbWVkaWF0ICovXG5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoZnVuY3Rpb24obXNnKSB7XG4gIGlmIChtc2cgJiYgbXNnLnR5cGUgPT09ICdBVURJQk9UX1RPR0dMRV9CVVRUT05TJykge1xuICAgIHNldEJ1dHRvbnNWaXNpYmlsaXR5KG1zZy52aXNpYmxlKTtcbiAgfVxuICAvKiBBdXRvLXJlcGxheSA6IG5vdGlmaWNhdGlvbiBwYWdlIGNoYXJnXHUwMEU5ZSBkZXB1aXMgYmFja2dyb3VuZC5qcyAqL1xuICBpZiAobXNnICYmIG1zZy50eXBlID09PSAnQVVESUJPVF9QQUdFX0xPQURFRCcpIHtcbiAgICB2YXIgbWF0Y2hlZFBvcnRhaWwgPSBPYmplY3QudmFsdWVzKENPTkZJR1MpLmZpbmQoZnVuY3Rpb24oY2ZnKSB7IHJldHVybiBjZmcuaXNNYXRjaCgpOyB9KTtcbiAgICBpZiAobWF0Y2hlZFBvcnRhaWwpIHtcbiAgICAgIC8qIFBsdXMgZGUgbm90aWZpY2F0aW9uIFwiZG9ublx1MDBFOWVzIHByXHUwMEVBdGVzXCIgXHUyMDE0IGludXRpbGUgZXQgZGlzdHJheWFudCAqL1xuICAgIH1cbiAgfVxufSk7XG5cbi8qIEF1IGNoYXJnZW1lbnQsIGFwcGxpcXVlciBsYSBwcmVmZXJlbmNlIHNhdXZlZ2FyZGVlICovXG5mdW5jdGlvbiBhcHBseUJ1dHRvbnNQcmVmZXJlbmNlKCkge1xuICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoWydhdWRpYm90X2J1dHRvbnNfdmlzaWJsZSddLCBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICB2YXIgdmlzaWJsZSA9IHJlc3VsdC5hdWRpYm90X2J1dHRvbnNfdmlzaWJsZSAhPT0gZmFsc2U7XG4gICAgc2V0QnV0dG9uc1Zpc2liaWxpdHkodmlzaWJsZSk7XG4gIH0pO1xufVxuXG4vKiBVUy04IDogRmVlZGJhY2sgTG9vcCBcdTIwMTQgaW5pdCBjbGljIGRyb2l0IHNpZ25hbGVtZW50IGNoYW1wICovXG5pZiAodHlwZW9mIGluaXRGaWVsZEZlZWRiYWNrID09PSAnZnVuY3Rpb24nKSBpbml0RmllbGRGZWVkYmFjaygpO1xuXG4vKiBcdTI1MDBcdTI1MDAgRFx1MDBFOXRlY3Rpb24gbmF2aWdhdGlvbiBTUEEgKFJlYWN0IFJvdXRlciwgVnVlIFJvdXRlciwgQW5ndWxhciBSb3V0ZXIpIFx1MjUwMFx1MjUwMCAqL1xuKGZ1bmN0aW9uKCkge1xuICB2YXIgX2xhc3RIcmVmID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG5cbiAgZnVuY3Rpb24gb25TcGFOYXZpZ2F0aW9uKCkge1xuICAgIHZhciBuZXdIcmVmID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG4gICAgaWYgKG5ld0hyZWYgPT09IF9sYXN0SHJlZikgcmV0dXJuO1xuICAgIF9sYXN0SHJlZiA9IG5ld0hyZWY7XG4gICAgLyogUlx1MDBFOWluaXRpYWxpc2VyIGwnXHUwMEU5dGF0IGRlIGRcdTAwRTl0ZWN0aW9uIGR1IHBvcnRhaWwgKi9cbiAgICBjb25zb2xlLmluZm8oXCJbQXVkaUJvdF0gU1BBIG5hdmlnYXRpb24gZFx1MDBFOXRlY3RcdTAwRTllIFx1MjE5MlwiLCBuZXdIcmVmKTtcbiAgICAvKiBSZS1kXHUwMEU5dGVjdGVyIGxlIHBvcnRhaWwgYWN0dWVsICovXG4gICAgdmFyIGN1cnJlbnRTaXRlID0gT2JqZWN0LnZhbHVlcyhDT05GSUdTKS5maW5kKGZ1bmN0aW9uKGNmZykgeyByZXR1cm4gY2ZnLmlzTWF0Y2goKTsgfSk7XG4gICAgaWYgKGN1cnJlbnRTaXRlKSB7XG4gICAgICAvKiBSZS1hZmZpY2hlciBsZSBib3V0b24gcmVtcGxpciBzaSBiZXNvaW4gKi9cbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBmaWxsQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhdWRpYm90LWZpbGwtYnRuXCIpO1xuICAgICAgICBpZiAoZmlsbEJ0bikgZmlsbEJ0bi5zdHlsZS5kaXNwbGF5ID0gXCJcIjtcbiAgICAgIH0sIDUwMCk7XG4gICAgfVxuICB9XG5cbiAgLyogSW50ZXJjZXB0ZXIgcHVzaFN0YXRlIGV0IHJlcGxhY2VTdGF0ZSAqL1xuICB2YXIgb3JpZ2luYWxQdXNoU3RhdGUgPSBoaXN0b3J5LnB1c2hTdGF0ZS5iaW5kKGhpc3RvcnkpO1xuICB2YXIgb3JpZ2luYWxSZXBsYWNlU3RhdGUgPSBoaXN0b3J5LnJlcGxhY2VTdGF0ZS5iaW5kKGhpc3RvcnkpO1xuXG4gIGhpc3RvcnkucHVzaFN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgb3JpZ2luYWxQdXNoU3RhdGUuYXBwbHkoaGlzdG9yeSwgYXJndW1lbnRzKTtcbiAgICBzZXRUaW1lb3V0KG9uU3BhTmF2aWdhdGlvbiwgMTAwKTtcbiAgfTtcblxuICBoaXN0b3J5LnJlcGxhY2VTdGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIG9yaWdpbmFsUmVwbGFjZVN0YXRlLmFwcGx5KGhpc3RvcnksIGFyZ3VtZW50cyk7XG4gICAgc2V0VGltZW91dChvblNwYU5hdmlnYXRpb24sIDEwMCk7XG4gIH07XG5cbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJwb3BzdGF0ZVwiLCBvblNwYU5hdmlnYXRpb24pO1xufSkoKTtcblxuaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpIHsgaW5pdExvY2FsKCk7IGFwcGx5QnV0dG9uc1ByZWZlcmVuY2UoKTsgcmVzdG9yZVJlY29yZGVySWZOZWVkZWQoKTsgaW5pdENvbW1hbmRDZW50ZXIoKTsgfVxuZWxzZSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uKCkgeyBpbml0TG9jYWwoKTsgYXBwbHlCdXR0b25zUHJlZmVyZW5jZSgpOyByZXN0b3JlUmVjb3JkZXJJZk5lZWRlZCgpOyBpbml0Q29tbWFuZENlbnRlcigpOyB9KTtcblxuLyogQ29tbWFuZCBDZW50ZXIgOiBpbmplY3RlciBzdXIgbGVzIHBvcnRhaWxzIG91IGRhdGEgcGF0aWVudCBwcmVzZW50ZSAqL1xuZnVuY3Rpb24gaW5pdENvbW1hbmRDZW50ZXIoKSB7XG4gIGlmICh3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUuaW5jbHVkZXMoXCJsb2NhbGhvc3RcIikpIHJldHVybjtcbiAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZS5pbmNsdWRlcyhcImF1ZGlib3QuZnJcIikpIHJldHVybjtcbiAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICBpZiAodHlwZW9mIGNyZWF0ZUNvbW1hbmRDZW50ZXIgPT09IFwiZnVuY3Rpb25cIikgY3JlYXRlQ29tbWFuZENlbnRlcigpO1xuICB9LCAxNTAwKTtcbn1cblxuLyogXHUyNTAwXHUyNTAwIFJlcGxheSBFbmdpbmUgXHUyMDE0IFVJICYgSGVhbHRoICh1bmlxdWUgdG8gaW5kZXguanMpIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuXG5mdW5jdGlvbiBzaG93UmVwbGF5Q29udHJvbHMoKSB7XG4gIHZhciBleGlzdGluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXVkaWJvdC1yZXBsYXktY29udHJvbHNcIik7XG4gIGlmIChleGlzdGluZykgZXhpc3RpbmcucmVtb3ZlKCk7XG4gIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBkaXYuaWQgPSBcImF1ZGlib3QtcmVwbGF5LWNvbnRyb2xzXCI7XG4gIGRpdi5zdHlsZS5jc3NUZXh0ID0gXCJwb3NpdGlvbjpmaXhlZDtib3R0b206ODBweDtyaWdodDoyMHB4O3otaW5kZXg6MjE0NzQ4MzY0NjtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDo4cHg7XCI7XG4gIHZhciBidG5SZXN1bWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICBidG5SZXN1bWUudHlwZSA9IFwiYnV0dG9uXCI7XG4gIGJ0blJlc3VtZS5pbm5lclRleHQgPSBcIlxcdTI1QjYgUmVwcmVuZHJlXCI7XG4gIGJ0blJlc3VtZS5zdHlsZS5jc3NUZXh0ID0gXCJwYWRkaW5nOjEwcHggMjBweDtiYWNrZ3JvdW5kOiMyNTYzZWI7Y29sb3I6d2hpdGU7Ym9yZGVyOm5vbmU7Ym9yZGVyLXJhZGl1czoxMnB4O2ZvbnQtd2VpZ2h0OmJvbGQ7Y3Vyc29yOnBvaW50ZXI7Zm9udC1mYW1pbHk6c2Fucy1zZXJpZjtcIjtcbiAgYnRuUmVzdW1lLm9uY2xpY2sgPSBmdW5jdGlvbigpIHsgZGl2LnJlbW92ZSgpOyBpZiAocmVwbGF5U3RhdGUgJiYgcmVwbGF5U3RhdGUub25SZXN1bWUpIHJlcGxheVN0YXRlLm9uUmVzdW1lKCk7IH07XG4gIHZhciBidG5BYm9ydCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gIGJ0bkFib3J0LnR5cGUgPSBcImJ1dHRvblwiO1xuICBidG5BYm9ydC5pbm5lclRleHQgPSBcIlxcdTI3MTUgQWJhbmRvbm5lclwiO1xuICBidG5BYm9ydC5zdHlsZS5jc3NUZXh0ID0gXCJwYWRkaW5nOjEwcHggMjBweDtiYWNrZ3JvdW5kOiNlZjQ0NDQ7Y29sb3I6d2hpdGU7Ym9yZGVyOm5vbmU7Ym9yZGVyLXJhZGl1czoxMnB4O2ZvbnQtd2VpZ2h0OmJvbGQ7Y3Vyc29yOnBvaW50ZXI7Zm9udC1mYW1pbHk6c2Fucy1zZXJpZjtcIjtcbiAgYnRuQWJvcnQub25jbGljayA9IGZ1bmN0aW9uKCkgeyBkaXYucmVtb3ZlKCk7IHNldFJlcGxheVN0YXRlKG51bGwpOyBzaG93UlBBVG9hc3QoXCJQYXJjb3VycyBhYmFuZG9ublxcdTAwRTkuXCIsIFwiaW5mb1wiKTsgfTtcbiAgZGl2LmFwcGVuZENoaWxkKGJ0blJlc3VtZSk7XG4gIGRpdi5hcHBlbmRDaGlsZChidG5BYm9ydCk7XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZGl2KTtcbn1cblxuZnVuY3Rpb24gc2VuZEhlYWx0aFBpbmcocG9ydGFsLCBzdGF0dXMsIGVycm9ySGludCkge1xuICB0cnkge1xuICAgIHZhciB2ZXJzaW9uID0gKHR5cGVvZiBjaHJvbWUgIT09IFwidW5kZWZpbmVkXCIgJiYgY2hyb21lLnJ1bnRpbWUgJiYgY2hyb21lLnJ1bnRpbWUuZ2V0TWFuaWZlc3QpID8gY2hyb21lLnJ1bnRpbWUuZ2V0TWFuaWZlc3QoKS52ZXJzaW9uIDogXCJ1bmtub3duXCI7XG4gICAgZmV0Y2goXCJodHRwczovL2F1ZGlib3QuZnIvYXBpL2Jvb2ttYXJrbGV0L3BpbmdcIiwge1xuICAgICAgbWV0aG9kOiBcIlBPU1RcIiwgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyB2ZXJzaW9uOiB2ZXJzaW9uLCBwb3J0YWw6IHBvcnRhbCwgc3RhdHVzOiBzdGF0dXMsIGVycm9ySGludDogZXJyb3JIaW50IH0pXG4gICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7IGNvbnNvbGUud2FybihcIltBdWRpQm90XSBoZWFsdGggcGluZyBmYWlsZWQ6XCIsIGVycik7IH0pO1xuICB9IGNhdGNoKGUpIHt9XG59XG5cbmNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihmdW5jdGlvbihtc2cpIHtcbiAgaWYgKG1zZyAmJiBtc2cudHlwZSA9PT0gXCJBVURJQk9UX0xBVU5DSF9QQVJDT1VSU1wiICYmIG1zZy5wYXJjb3Vyc0lkKSB7XG4gICAgKGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHN5bmNUb2tlbiA9IGF3YWl0IGdldFN5bmNUb2tlbigpO1xuICAgICAgaWYgKCFzeW5jVG9rZW4pIHJldHVybjtcbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciBob3N0bmFtZSA9IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZS5yZXBsYWNlKFwid3d3LlwiLCBcIlwiKTtcbiAgICAgICAgdmFyIHJlcyA9IGF3YWl0IGZldGNoKFwiaHR0cHM6Ly9hdWRpYm90LmZyL2FwaS9leHRlbnNpb24vcGFyY291cnM/aG9zdG5hbWU9XCIgKyBlbmNvZGVVUklDb21wb25lbnQoaG9zdG5hbWUpLCB7IGhlYWRlcnM6IHsgXCJBdXRob3JpemF0aW9uXCI6IFwiQmVhcmVyIFwiICsgc3luY1Rva2VuIH0gfSk7XG4gICAgICAgIGlmICghcmVzLm9rKSByZXR1cm47XG4gICAgICAgIHZhciBkYXRhID0gYXdhaXQgcmVzLmpzb24oKTtcbiAgICAgICAgdmFyIGZvdW5kID0gKGRhdGEucGFyY291cnMgfHwgW10pLmZpbmQoZnVuY3Rpb24ocCkgeyByZXR1cm4gcC5pZCA9PT0gbXNnLnBhcmNvdXJzSWQ7IH0pO1xuICAgICAgICBpZiAoIWZvdW5kKSByZXR1cm47XG4gICAgICAgIHZhciBjYWNoZSA9IGF3YWl0IHJlYWRFbmNyeXB0ZWRDYWNoZSgpIHx8IHt9O1xuICAgICAgICBzdGFydFJlcGxheShmb3VuZCwgY2FjaGUpO1xuICAgICAgfSBjYXRjaChlKSB7fVxuICAgIH0pKCk7XG4gIH1cbn0pO1xuXG4vKiBcdTI1MDBcdTI1MDAgRmluIFJlcGxheSBFbmdpbmUgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG5cbi8qIFx1MjUwMFx1MjUwMCBNYWNybyBSZWNvcmRlciBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cblxudmFyIHJlY29yZGVyU3RhdGUgPSBudWxsOyAvKiBudWxsID0gaW5hY3RpZiwgc2lub24geyBldGFwZXM6IFtdLCBob3N0bmFtZTogXCJcIiB9ICovXG5cbi8qIEdcdTAwRTluXHUwMEU4cmUgdW5lIGxpc3RlIG9yZG9ublx1MDBFOWUgZGUgc1x1MDBFOWxlY3RldXJzIENTUyBzdGFibGVzIHBvdXIgdW4gXHUwMEU5bFx1MDBFOW1lbnQgKFAxIFx1MjAxNCBzXHUwMEU5bGVjdGV1cnMgYWx0ZXJuYXRpZnMpICovXG5mdW5jdGlvbiBnZW5lcmF0ZVNlbGVjdG9ycyhlbCkge1xuICB2YXIgc2VsZWN0b3JzID0gW107XG4gIGlmIChlbC5pZCAmJiAhZWwuaWQubWF0Y2goL15bMC05XS8pKSBzZWxlY3RvcnMucHVzaCgnIycgKyBDU1MuZXNjYXBlKGVsLmlkKSk7XG4gIGlmIChlbC5uYW1lKSBzZWxlY3RvcnMucHVzaCgnW25hbWU9XCInICsgZWwubmFtZSArICdcIl0nKTtcbiAgaWYgKGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1jeScpKSBzZWxlY3RvcnMucHVzaCgnW2RhdGEtY3k9XCInICsgZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWN5JykgKyAnXCJdJyk7XG4gIGlmIChlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGVzdGlkJykpIHNlbGVjdG9ycy5wdXNoKCdbZGF0YS10ZXN0aWQ9XCInICsgZWwuZ2V0QXR0cmlidXRlKCdkYXRhLXRlc3RpZCcpICsgJ1wiXScpO1xuICBpZiAoZWwucGxhY2Vob2xkZXIpIHNlbGVjdG9ycy5wdXNoKGVsLnRhZ05hbWUudG9Mb3dlckNhc2UoKSArICdbcGxhY2Vob2xkZXI9XCInICsgZWwucGxhY2Vob2xkZXIgKyAnXCJdJyk7XG4gIC8qIExhYmVsIGFzc29jaVx1MDBFOSAqL1xuICB2YXIgbGJsID0gZWwuaWQgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsYWJlbFtmb3I9XCInICsgZWwuaWQgKyAnXCJdJykgOiBudWxsO1xuICBpZiAobGJsICYmIGxibC50ZXh0Q29udGVudC50cmltKCkgJiYgZWwuaWQgJiYgZWwuaWQubGVuZ3RoID49IDgpIHtcbiAgICBzZWxlY3RvcnMucHVzaChlbC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgKyAnW2lkJD1cIicgKyBlbC5pZC5zbGljZSgtOCkgKyAnXCJdJyk7XG4gIH1cbiAgLyogRmFsbGJhY2sgbnRoLWNoaWxkICovXG4gIHZhciBwYXJlbnQgPSBlbC5wYXJlbnRFbGVtZW50O1xuICBpZiAocGFyZW50KSB7XG4gICAgdmFyIGlkeCA9IEFycmF5LmZyb20ocGFyZW50LmNoaWxkcmVuKS5pbmRleE9mKGVsKSArIDE7XG4gICAgc2VsZWN0b3JzLnB1c2goZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpICsgJzpudGgtY2hpbGQoJyArIGlkeCArICcpJyk7XG4gIH1cbiAgaWYgKHNlbGVjdG9ycy5sZW5ndGggPT09IDApIHNlbGVjdG9ycy5wdXNoKGVsLnRhZ05hbWUudG9Mb3dlckNhc2UoKSk7XG4gIC8qIERcdTAwRTlkdXBsaXF1ZXIgKi9cbiAgcmV0dXJuIHNlbGVjdG9ycy5maWx0ZXIoZnVuY3Rpb24ocywgaSwgYXJyKSB7IHJldHVybiBhcnIuaW5kZXhPZihzKSA9PT0gaTsgfSk7XG59XG5cbi8qIFRyb3V2ZSB1biBcdTAwRTlsXHUwMEU5bWVudCBlbiBlc3NheWFudCBsZXMgc1x1MDBFOWxlY3RldXJzIGRhbnMgbCdvcmRyZSAoUDEgXHUyMDE0IGZhbGxiYWNrIGxpc3QpICovXG5hc3luYyBmdW5jdGlvbiBmaW5kRWxlbWVudEJ5U2VsZWN0b3JzKHNlbGVjdG9ycywgdGltZW91dCkge1xuICB2YXIgc2VsZWN0b3JMaXN0ID0gQXJyYXkuaXNBcnJheShzZWxlY3RvcnMpID8gc2VsZWN0b3JzIDogW3NlbGVjdG9yc107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZWN0b3JMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGVsID0gYXdhaXQgd2FpdEZvckVsZW1lbnQoc2VsZWN0b3JMaXN0W2ldLCBpID09PSAwID8gdGltZW91dCA6IDUwMCk7XG4gICAgaWYgKGVsKSByZXR1cm4gZWw7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qIFAxIFx1MjAxNCBOb3JtYWxpc2F0aW9uIGF2YW5jXHUwMEU5ZSBwb3VyIGxhIGNvcnJlc3BvbmRhbmNlIGRlIHZhcmlhYmxlcyBwYXRpZW50ICovXG5mdW5jdGlvbiBub3JtYWxpemVGb3JNYXRjaCh2YWwpIHtcbiAgcmV0dXJuICh2YWwgfHwgXCJcIikucmVwbGFjZSgvW1xcc1xcLVxcLlxcL10vZywgXCJcIikudG9Mb3dlckNhc2UoKTtcbn1cblxuLyogUDEgXHUyMDE0IEdcdTAwRTluXHUwMEU4cmUgcGx1c2lldXJzIHJlcHJcdTAwRTlzZW50YXRpb25zIG5vcm1hbGlzXHUwMEU5ZXMgZCd1bmUgZGF0ZSBwb3VyIGxhIGNvbXBhcmFpc29uICovXG5mdW5jdGlvbiBub3JtYWxpemVEYXRlRm9yTWF0Y2goZGF0ZVN0cikge1xuICBpZiAoIWRhdGVTdHIpIHJldHVybiBbXTtcbiAgdmFyIGQgPSBkYXRlU3RyLnJlcGxhY2UoL1xcRC9nLCBcIlwiKTtcbiAgaWYgKGQubGVuZ3RoID09PSA4KSB7XG4gICAgLyogRERNTVlZWVkgXHUyMTkyIGVzc2F5ZXIgRERNTVlZWVksIFlZWVlNTURELCBERC9NTS9ZWVlZICovXG4gICAgcmV0dXJuIFtkLCBkLnNsaWNlKDQpICsgZC5zbGljZSgyLCA0KSArIGQuc2xpY2UoMCwgMiksIGQuc2xpY2UoMCwgMikgKyBkLnNsaWNlKDIsIDQpICsgZC5zbGljZSg0KV07XG4gIH1cbiAgcmV0dXJuIFtkXTtcbn1cblxuLyogRFx1MDBFOXRlY3RlIHNpIHVuZSB2YWxldXIgY29ycmVzcG9uZCBcdTAwRTAgdW5lIHZhcmlhYmxlIHBhdGllbnQgKGRlcHVpcyBjYWNoZSBsb2NhbCkgKi9cbmFzeW5jIGZ1bmN0aW9uIGRldGVjdFZhcmlhYmxlKHZhbHVlKSB7XG4gIGlmICghdmFsdWUgfHwgdmFsdWUubGVuZ3RoIDwgMikgcmV0dXJuIG51bGw7XG4gIHZhciBjYWNoZSA9IGF3YWl0IHJlYWRFbmNyeXB0ZWRDYWNoZSgpO1xuICBpZiAoIWNhY2hlIHx8ICFjYWNoZS5jdXJyZW50KSByZXR1cm4gbnVsbDtcbiAgdmFyIG0gPSBjYWNoZS5jdXJyZW50O1xuICB2YXIgbyA9IG0ub3Jkb25uYW5jZSB8fCB7fTtcbiAgdmFyIG9kID0gby5sdW5ldHRlc09EIHx8IHt9O1xuICB2YXIgb2cgPSBvLmx1bmV0dGVzT0cgfHwge307XG4gIHZhciBwMCA9IChtLnBlcnNvbm5lcyAmJiBtLnBlcnNvbm5lc1swXSkgfHwge307XG5cbiAgdmFyIG5vcm1hbGl6ZWRWYWx1ZSA9IG5vcm1hbGl6ZUZvck1hdGNoKHZhbHVlKTtcblxuICAvKiBDaGFtcHMgc2ltcGxlcyBcdTIwMTQgY29tcGFyYWlzb24gbm9ybWFsaXNcdTAwRTllICovXG4gIHZhciBtYXBwaW5nID0gW1xuICAgIHsgdmFyaWFibGU6IFwie3tuc3N9fVwiLCB2YWx1ZTogbS5udW1lcm9TZWN1cml0ZVNvY2lhbGUgfHwgXCJcIiB9LFxuICAgIHsgdmFyaWFibGU6IFwie3tub219fVwiLCB2YWx1ZTogbS5ub20gfHwgcDAubm9tIHx8IFwiXCIgfSxcbiAgICB7IHZhcmlhYmxlOiBcInt7cHJlbm9tfX1cIiwgdmFsdWU6IG0ucHJlbm9tIHx8IHAwLnByZW5vbSB8fCBcIlwiIH0sXG4gICAgeyB2YXJpYWJsZTogXCJ7e29yZ2FuaXNtZX19XCIsIHZhbHVlOiBtLm9yZ2FuaXNtZSB8fCBcIlwiIH0sXG4gICAgeyB2YXJpYWJsZTogXCJ7e251bWVyb0FkaGVyZW50fX1cIiwgdmFsdWU6IG0ubnVtZXJvQWRoZXJlbnQgfHwgXCJcIiB9LFxuICAgIHsgdmFyaWFibGU6IFwie3tzcGhlcmVfb2R9fVwiLCB2YWx1ZTogb2Quc3BoZXJlIHx8IFwiXCIgfSxcbiAgICB7IHZhcmlhYmxlOiBcInt7c3BoZXJlX29nfX1cIiwgdmFsdWU6IG9nLnNwaGVyZSB8fCBcIlwiIH0sXG4gICAgeyB2YXJpYWJsZTogXCJ7e2N5bGluZHJlX29kfX1cIiwgdmFsdWU6IG9kLmN5bGluZHJlIHx8IFwiXCIgfSxcbiAgICB7IHZhcmlhYmxlOiBcInt7Y3lsaW5kcmVfb2d9fVwiLCB2YWx1ZTogb2cuY3lsaW5kcmUgfHwgXCJcIiB9LFxuICAgIHsgdmFyaWFibGU6IFwie3theGVfb2R9fVwiLCB2YWx1ZTogb2QuYXhlIHx8IFwiXCIgfSxcbiAgICB7IHZhcmlhYmxlOiBcInt7YXhlX29nfX1cIiwgdmFsdWU6IG9nLmF4ZSB8fCBcIlwiIH0sXG4gICAgeyB2YXJpYWJsZTogXCJ7e2FkZGl0aW9ufX1cIiwgdmFsdWU6IG9kLmFkZGl0aW9uIHx8IG9nLmFkZGl0aW9uIHx8IFwiXCIgfSxcbiAgXTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IG1hcHBpbmcubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgY2FuZGlkYXRlID0gbm9ybWFsaXplRm9yTWF0Y2gobWFwcGluZ1tpXS52YWx1ZSk7XG4gICAgaWYgKGNhbmRpZGF0ZSAmJiBjYW5kaWRhdGUubGVuZ3RoID49IDIgJiYgbm9ybWFsaXplZFZhbHVlID09PSBjYW5kaWRhdGUpIHtcbiAgICAgIHJldHVybiBtYXBwaW5nW2ldLnZhcmlhYmxlO1xuICAgIH1cbiAgfVxuXG4gIC8qIERhdGVzIFx1MjAxNCBlc3NheWVyIHBsdXNpZXVycyBmb3JtYXRzIG5vcm1hbGlzXHUwMEU5cyAqL1xuICB2YXIgZGF0ZUZpZWxkcyA9IFtcbiAgICB7IHZhcmlhYmxlOiBcInt7ZGF0ZU5haXNzYW5jZX19XCIsIHZhbHVlOiBtLmRhdGVOYWlzc2FuY2UgfHwgXCJcIiB9LFxuICAgIHsgdmFyaWFibGU6IFwie3tkYXRlT3Jkb25uYW5jZX19XCIsIHZhbHVlOiBvLmRhdGVPcmRvbm5hbmNlIHx8IFwiXCIgfSxcbiAgXTtcbiAgZm9yICh2YXIgaiA9IDA7IGogPCBkYXRlRmllbGRzLmxlbmd0aDsgaisrKSB7XG4gICAgdmFyIHZhcmlhbnRzID0gbm9ybWFsaXplRGF0ZUZvck1hdGNoKGRhdGVGaWVsZHNbal0udmFsdWUpO1xuICAgIGZvciAodmFyIGsgPSAwOyBrIDwgdmFyaWFudHMubGVuZ3RoOyBrKyspIHtcbiAgICAgIGlmICh2YXJpYW50c1trXSAmJiB2YXJpYW50c1trXS5sZW5ndGggPj0gNiAmJiBub3JtYWxpemVkVmFsdWUgPT09IHZhcmlhbnRzW2tdKSB7XG4gICAgICAgIHJldHVybiBkYXRlRmllbGRzW2pdLnZhcmlhYmxlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuXG4vKiBcdTI1MDBcdTI1MDAgUGFubmVhdSBndWlkXHUwMEU5IGxhdFx1MDBFOXJhbCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cblxuZnVuY3Rpb24gc2hvd1JlY29yZGVyUGFuZWwoKSB7XG4gIGlmIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF1ZGlib3QtcmVjb3JkZXItcGFuZWxcIikpIHJldHVybjtcbiAgdmFyIHBhbmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgcGFuZWwuaWQgPSBcImF1ZGlib3QtcmVjb3JkZXItcGFuZWxcIjtcbiAgcGFuZWwuc3R5bGUuY3NzVGV4dCA9IFwicG9zaXRpb246Zml4ZWQ7cmlnaHQ6MDt0b3A6NTAlO3RyYW5zZm9ybTp0cmFuc2xhdGVZKC01MCUpO3otaW5kZXg6MjE0NzQ4MzY0NjtiYWNrZ3JvdW5kOndoaXRlO2JvcmRlci1yYWRpdXM6MTJweCAwIDAgMTJweDtib3gtc2hhZG93Oi00cHggMCAyMHB4IHJnYmEoMCwwLDAsMC4xNSk7d2lkdGg6MjYwcHg7Zm9udC1mYW1pbHk6c2Fucy1zZXJpZjtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO21heC1oZWlnaHQ6NzB2aDtcIjtcblxuICAvKiBIZWFkZXIgKi9cbiAgdmFyIGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIGhlYWRlci5zdHlsZS5jc3NUZXh0ID0gXCJwYWRkaW5nOjE0cHggMTZweCAxMHB4O2JvcmRlci1ib3R0b206MXB4IHNvbGlkICNlNWU3ZWI7XCI7XG4gIGhlYWRlci5pbm5lckhUTUwgPSAnPGRpdiBzdHlsZT1cImZvbnQtc2l6ZToxNHB4O2ZvbnQtd2VpZ2h0OjcwMDtjb2xvcjojZWY0NDQ0O1wiPlx1MjNGQSBBdWRpQm90IFx1MjAxNCBFbnJlZ2lzdHJlbWVudDwvZGl2Pic7XG4gIHBhbmVsLmFwcGVuZENoaWxkKGhlYWRlcik7XG5cbiAgLyogQm9keSAoc2Nyb2xsYWJsZSBsaXN0KSAqL1xuICB2YXIgYm9keSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIGJvZHkuaWQgPSBcImF1ZGlib3QtcmVjb3JkZXItcGFuZWwtYm9keVwiO1xuICBib2R5LnN0eWxlLmNzc1RleHQgPSBcImZsZXg6MTtvdmVyZmxvdy15OmF1dG87cGFkZGluZzo4cHggMTJweDtcIjtcbiAgcGFuZWwuYXBwZW5kQ2hpbGQoYm9keSk7XG5cbiAgLyogRm9vdGVyICovXG4gIHZhciBmb290ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBmb290ZXIuaWQgPSBcImF1ZGlib3QtcmVjb3JkZXItcGFuZWwtZm9vdGVyXCI7XG4gIGZvb3Rlci5zdHlsZS5jc3NUZXh0ID0gXCJwYWRkaW5nOjEwcHggMTZweDtib3JkZXItdG9wOjFweCBzb2xpZCAjZTVlN2ViO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OnNwYWNlLWJldHdlZW47XCI7XG4gIHZhciBjb3VudGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gIGNvdW50ZXIuaWQgPSBcImF1ZGlib3QtcmVjb3JkZXItcGFuZWwtY291bnRlclwiO1xuICBjb3VudGVyLnN0eWxlLmNzc1RleHQgPSBcImZvbnQtc2l6ZToxMnB4O2NvbG9yOiM2YjcyODA7XCI7XG4gIGNvdW50ZXIudGV4dENvbnRlbnQgPSBcIjAgXHUwMEU5dGFwZXMgZW5yZWdpc3RyXHUwMEU5ZXNcIjtcbiAgdmFyIHN0b3BCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICBzdG9wQnRuLnN0eWxlLmNzc1RleHQgPSBcInBhZGRpbmc6NnB4IDE0cHg7Ym9yZGVyOm5vbmU7Ym9yZGVyLXJhZGl1czo2cHg7YmFja2dyb3VuZDojZWY0NDQ0O2NvbG9yOndoaXRlO2ZvbnQtc2l6ZToxMnB4O2ZvbnQtd2VpZ2h0OjYwMDtjdXJzb3I6cG9pbnRlcjtcIjtcbiAgc3RvcEJ0bi50ZXh0Q29udGVudCA9IFwiXHUyM0Y5IFRlcm1pbmVyXCI7XG4gIHN0b3BCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkgeyBzdG9wUmVjb3JkZXIoKTsgfSk7XG4gIGZvb3Rlci5hcHBlbmRDaGlsZChjb3VudGVyKTtcbiAgZm9vdGVyLmFwcGVuZENoaWxkKHN0b3BCdG4pO1xuICBwYW5lbC5hcHBlbmRDaGlsZChmb290ZXIpO1xuXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQocGFuZWwpO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVSZWNvcmRlclBhbmVsKCkge1xuICBpZiAoIXJlY29yZGVyU3RhdGUpIHJldHVybjtcbiAgdmFyIGJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF1ZGlib3QtcmVjb3JkZXItcGFuZWwtYm9keVwiKTtcbiAgdmFyIGNvdW50ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF1ZGlib3QtcmVjb3JkZXItcGFuZWwtY291bnRlclwiKTtcbiAgaWYgKCFib2R5KSByZXR1cm47XG5cbiAgdmFyIGV0YXBlcyA9IHJlY29yZGVyU3RhdGUuZXRhcGVzO1xuXG4gIC8qIE1ldHRyZSBcdTAwRTAgam91ciBsZSBjb21wdGV1ciAqL1xuICBpZiAoY291bnRlcikgY291bnRlci50ZXh0Q29udGVudCA9IGV0YXBlcy5sZW5ndGggKyBcIiBcdTAwRTl0YXBlXCIgKyAoZXRhcGVzLmxlbmd0aCA+IDEgPyBcInNcIiA6IFwiXCIpICsgXCIgZW5yZWdpc3RyXHUwMEU5ZVwiICsgKGV0YXBlcy5sZW5ndGggPiAxID8gXCJzXCIgOiBcIlwiKTtcblxuICAvKiBSZWNvbnN0cnVpcmUgbGEgbGlzdGUgKi9cbiAgYm9keS5pbm5lckhUTUwgPSBcIlwiO1xuICB2YXIgbGFzdFVybCA9IG51bGw7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZXRhcGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHN0ZXAgPSBldGFwZXNbaV07XG5cbiAgICAvKiBTXHUwMEU5cGFyYXRldXIgZW50cmUgZ3JvdXBlcyBkJ1VSTCBkaWZmXHUwMEU5cmVudGVzICovXG4gICAgaWYgKHN0ZXAudXJsICYmIHN0ZXAudXJsICE9PSBsYXN0VXJsICYmIGxhc3RVcmwgIT09IG51bGwpIHtcbiAgICAgIHZhciBzZXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgc2VwLnN0eWxlLmNzc1RleHQgPSBcImJvcmRlci10b3A6MnB4IGRhc2hlZCAjZDFkNWRiO21hcmdpbjo2cHggMDtwYWRkaW5nLXRvcDo0cHg7Zm9udC1zaXplOjEwcHg7Y29sb3I6IzljYTNhZjtvdmVyZmxvdzpoaWRkZW47dGV4dC1vdmVyZmxvdzplbGxpcHNpczt3aGl0ZS1zcGFjZTpub3dyYXA7XCI7XG4gICAgICBzZXAudGV4dENvbnRlbnQgPSBcIlx1RDgzRFx1RENDNCBcIiArIHN0ZXAudXJsLnJlcGxhY2UoL2h0dHBzPzpcXC9cXC8vLCBcIlwiKS5zbGljZSgwLCAzNSk7XG4gICAgICBib2R5LmFwcGVuZENoaWxkKHNlcCk7XG4gICAgfVxuICAgIGxhc3RVcmwgPSBzdGVwLnVybDtcblxuICAgIHZhciByb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHJvdy5zdHlsZS5jc3NUZXh0ID0gXCJkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo2cHg7cGFkZGluZzo0cHggMDtmb250LXNpemU6MTJweDtcIjtcblxuICAgIHZhciBpY29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgaWYgKHN0ZXAuYWN0aW9uID09PSBcImZpbGxcIikge1xuICAgICAgdmFyIGlzS25vd24gPSBzdGVwLnZhcmlhYmxlICYmIHN0ZXAudmFyaWFibGUuaW5kZXhPZihcInt7XCIpID09PSAwO1xuICAgICAgaWNvbi50ZXh0Q29udGVudCA9IFwiXHUyNzA1XCI7XG4gICAgICB2YXIgbGFiZWxFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgICAgbGFiZWxFbC5zdHlsZS5jc3NUZXh0ID0gXCJmbGV4OjE7b3ZlcmZsb3c6aGlkZGVuO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7d2hpdGUtc3BhY2U6bm93cmFwO2NvbG9yOiMzNzQxNTE7XCI7XG4gICAgICBsYWJlbEVsLnRleHRDb250ZW50ID0gKHN0ZXAubGFiZWwgfHwgXCJDaGFtcFwiKS5zbGljZSgwLCAyNSk7XG4gICAgICB2YXIgdmFyQmFkZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICAgIGlmIChpc0tub3duKSB7XG4gICAgICAgIHZhckJhZGdlLnN0eWxlLmNzc1RleHQgPSBcImZvbnQtc2l6ZToxMHB4O2JhY2tncm91bmQ6I2QxZmFlNTtjb2xvcjojMDY1ZjQ2O3BhZGRpbmc6MXB4IDVweDtib3JkZXItcmFkaXVzOjNweDt3aGl0ZS1zcGFjZTpub3dyYXA7XCI7XG4gICAgICAgIHZhckJhZGdlLnRleHRDb250ZW50ID0gc3RlcC52YXJpYWJsZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhckJhZGdlLnN0eWxlLmNzc1RleHQgPSBcImZvbnQtc2l6ZToxMHB4O2JhY2tncm91bmQ6I2ZlZjNjNztjb2xvcjojOTI0MDBlO3BhZGRpbmc6MXB4IDVweDtib3JkZXItcmFkaXVzOjNweDt3aGl0ZS1zcGFjZTpub3dyYXA7XCI7XG4gICAgICAgIHZhckJhZGdlLnRleHRDb250ZW50ID0gXCJzdGF0aXF1ZVwiO1xuICAgICAgfVxuICAgICAgcm93LmFwcGVuZENoaWxkKGljb24pO1xuICAgICAgcm93LmFwcGVuZENoaWxkKGxhYmVsRWwpO1xuICAgICAgcm93LmFwcGVuZENoaWxkKHZhckJhZGdlKTtcbiAgICB9IGVsc2UgaWYgKHN0ZXAuYWN0aW9uID09PSBcImNsaWNrXCIpIHtcbiAgICAgIGljb24udGV4dENvbnRlbnQgPSBcIlx1RDgzRFx1RERCMVx1RkUwRlwiO1xuICAgICAgdmFyIGxhYmVsRWwyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgICBsYWJlbEVsMi5zdHlsZS5jc3NUZXh0ID0gXCJmbGV4OjE7b3ZlcmZsb3c6aGlkZGVuO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7d2hpdGUtc3BhY2U6bm93cmFwO2NvbG9yOiMzNzQxNTE7XCI7XG4gICAgICBsYWJlbEVsMi50ZXh0Q29udGVudCA9IChzdGVwLmxhYmVsIHx8IFwiQ2xpY1wiKS5zbGljZSgwLCAzMCk7XG4gICAgICByb3cuYXBwZW5kQ2hpbGQoaWNvbik7XG4gICAgICByb3cuYXBwZW5kQ2hpbGQobGFiZWxFbDIpO1xuICAgIH0gZWxzZSBpZiAoc3RlcC5hY3Rpb24gPT09IFwic2VsZWN0XCIpIHtcbiAgICAgIGljb24udGV4dENvbnRlbnQgPSBcIlx1RDgzRFx1RENDQlwiO1xuICAgICAgdmFyIGxhYmVsRWwzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgICBsYWJlbEVsMy5zdHlsZS5jc3NUZXh0ID0gXCJmbGV4OjE7b3ZlcmZsb3c6aGlkZGVuO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7d2hpdGUtc3BhY2U6bm93cmFwO2NvbG9yOiMzNzQxNTE7XCI7XG4gICAgICBsYWJlbEVsMy50ZXh0Q29udGVudCA9IChzdGVwLmxhYmVsIHx8IFwiU1x1MDBFOWxlY3Rpb25cIikuc2xpY2UoMCwgMzApO1xuICAgICAgcm93LmFwcGVuZENoaWxkKGljb24pO1xuICAgICAgcm93LmFwcGVuZENoaWxkKGxhYmVsRWwzKTtcbiAgICB9XG5cbiAgICBib2R5LmFwcGVuZENoaWxkKHJvdyk7XG4gIH1cblxuICAvKiBBdXRvLXNjcm9sbCB2ZXJzIGxlIGJhcyAqL1xuICBib2R5LnNjcm9sbFRvcCA9IGJvZHkuc2Nyb2xsSGVpZ2h0O1xufVxuXG4vKiBcdTI1MDBcdTI1MDAgSGlnaGxpZ2h0IHZpc3VlbCBkZXMgY2hhbXBzIGNhcHR1clx1MDBFOXMgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG5cbmZ1bmN0aW9uIGhpZ2hsaWdodFJlY29yZGVkRmllbGQoZWwsIHZhcmlhYmxlKSB7XG4gIGlmICghZWwgfHwgZWwuZ2V0QXR0cmlidXRlKFwiZGF0YS1hdWRpYm90LXJlY29yZGVkXCIpKSByZXR1cm47XG4gIGVsLnNldEF0dHJpYnV0ZShcImRhdGEtYXVkaWJvdC1yZWNvcmRlZFwiLCBcInRydWVcIik7XG5cbiAgdmFyIGlzS25vd24gPSB2YXJpYWJsZSAmJiB2YXJpYWJsZS5pbmRleE9mKFwie3tcIikgPT09IDA7XG4gIGVsLnN0eWxlLm91dGxpbmUgPSBpc0tub3duID8gXCIycHggc29saWQgIzEwYjk4MVwiIDogXCIycHggc29saWQgI2Y1OWUwYlwiO1xuICBlbC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBpc0tub3duID8gXCIjZjBmZGY0XCIgOiBcIiNmZmZiZWJcIjtcblxuICAvKiBCYWRnZSBhYnNvbHUgYXUtZGVzc3VzIGR1IGNoYW1wICovXG4gIHZhciByZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIHZhciBiYWRnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICBiYWRnZS5jbGFzc05hbWUgPSBcImF1ZGlib3QtcmVjb3JkZXItZmllbGQtYmFkZ2VcIjtcbiAgYmFkZ2Uuc3R5bGUuY3NzVGV4dCA9IFwicG9zaXRpb246YWJzb2x1dGU7ei1pbmRleDoyMTQ3NDgzNjQ1O2ZvbnQtc2l6ZToxMHB4O2ZvbnQtd2VpZ2h0OjYwMDtwYWRkaW5nOjFweCA2cHg7Ym9yZGVyLXJhZGl1czozcHg7Zm9udC1mYW1pbHk6c2Fucy1zZXJpZjtwb2ludGVyLWV2ZW50czpub25lO3doaXRlLXNwYWNlOm5vd3JhcDtcIjtcbiAgaWYgKGlzS25vd24pIHtcbiAgICBiYWRnZS5zdHlsZS5iYWNrZ3JvdW5kID0gXCIjZDFmYWU1XCI7XG4gICAgYmFkZ2Uuc3R5bGUuY29sb3IgPSBcIiMwNjVmNDZcIjtcbiAgICBiYWRnZS50ZXh0Q29udGVudCA9IHZhcmlhYmxlO1xuICB9IGVsc2Uge1xuICAgIGJhZGdlLnN0eWxlLmJhY2tncm91bmQgPSBcIiNmZWYzYzdcIjtcbiAgICBiYWRnZS5zdHlsZS5jb2xvciA9IFwiIzkyNDAwZVwiO1xuICAgIGJhZGdlLnRleHRDb250ZW50ID0gXCJzdGF0aXF1ZVwiO1xuICB9XG5cbiAgLyogUG9zaXRpb25uZXIgbGUgYmFkZ2UgcmVsYXRpdmVtZW50IGF1IHBhcmVudCBwb3NpdGlvbm5cdTAwRTkgKi9cbiAgdmFyIHBhcmVudCA9IGVsLm9mZnNldFBhcmVudCB8fCBkb2N1bWVudC5ib2R5O1xuICB2YXIgcGFyZW50UmVjdCA9IHBhcmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgYmFkZ2Uuc3R5bGUubGVmdCA9IChyZWN0LmxlZnQgLSBwYXJlbnRSZWN0LmxlZnQpICsgXCJweFwiO1xuICBiYWRnZS5zdHlsZS50b3AgPSAocmVjdC50b3AgLSBwYXJlbnRSZWN0LnRvcCAtIDE2KSArIFwicHhcIjtcbiAgcGFyZW50LmFwcGVuZENoaWxkKGJhZGdlKTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlUmVjb3JkZXJIaWdobGlnaHRzKCkge1xuICAvKiBSZXRpcmVyIGxlcyBvdXRsaW5lcyBldCBiYWNrZ3JvdW5kcyAqL1xuICB2YXIgbWFya2VkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIltkYXRhLWF1ZGlib3QtcmVjb3JkZWRdXCIpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG1hcmtlZC5sZW5ndGg7IGkrKykge1xuICAgIG1hcmtlZFtpXS5zdHlsZS5vdXRsaW5lID0gXCJcIjtcbiAgICBtYXJrZWRbaV0uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJcIjtcbiAgICBtYXJrZWRbaV0ucmVtb3ZlQXR0cmlidXRlKFwiZGF0YS1hdWRpYm90LXJlY29yZGVkXCIpO1xuICB9XG4gIC8qIFJldGlyZXIgbGVzIGJhZGdlcyAqL1xuICB2YXIgYmFkZ2VzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5hdWRpYm90LXJlY29yZGVyLWZpZWxkLWJhZGdlXCIpO1xuICBmb3IgKHZhciBqID0gMDsgaiA8IGJhZGdlcy5sZW5ndGg7IGorKykge1xuICAgIGJhZGdlc1tqXS5yZW1vdmUoKTtcbiAgfVxufVxuXG4vKiBEXHUwMEU5bWFycmVyIGwnZW5yZWdpc3RyZW1lbnQgKi9cbmZ1bmN0aW9uIHN0YXJ0UmVjb3JkZXIoKSB7XG4gIGlmIChyZWNvcmRlclN0YXRlKSByZXR1cm47XG4gIHJlY29yZGVyU3RhdGUgPSB7XG4gICAgZXRhcGVzOiBbXSxcbiAgICBob3N0bmFtZTogd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLnJlcGxhY2UoXCJ3d3cuXCIsIFwiXCIpLFxuICAgIHN0YXJ0VGltZTogRGF0ZS5ub3coKSxcbiAgfTtcblxuICAvKiBCYWRnZSBlbnJlZ2lzdHJlbWVudCAqL1xuICB2YXIgYmFkZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBiYWRnZS5pZCA9IFwiYXVkaWJvdC1yZWNvcmRlci1iYWRnZVwiO1xuICBiYWRnZS5zdHlsZS5jc3NUZXh0ID0gXCJwb3NpdGlvbjpmaXhlZDt0b3A6MjBweDtsZWZ0OjUwJTt0cmFuc2Zvcm06dHJhbnNsYXRlWCgtNTAlKTt6LWluZGV4OjIxNDc0ODM2NDc7YmFja2dyb3VuZDojZWY0NDQ0O2NvbG9yOndoaXRlO3BhZGRpbmc6OHB4IDIwcHg7Ym9yZGVyLXJhZGl1czo1MHB4O2ZvbnQtZmFtaWx5OnNhbnMtc2VyaWY7Zm9udC1zaXplOjEzcHg7Zm9udC13ZWlnaHQ6Ym9sZDtib3gtc2hhZG93OjAgNHB4IDE1cHggcmdiYSgwLDAsMCwwLjMpO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweDtcIjtcbiAgYmFkZ2UuaW5uZXJIVE1MID0gJzxzcGFuIHN0eWxlPVwid2lkdGg6MTBweDtoZWlnaHQ6MTBweDtiYWNrZ3JvdW5kOndoaXRlO2JvcmRlci1yYWRpdXM6NTAlO2Rpc3BsYXk6aW5saW5lLWJsb2NrO2FuaW1hdGlvbjpwdWxzZSAxcyBpbmZpbml0ZTtcIj48L3NwYW4+IEVucmVnaXN0cmVtZW50IGVuIGNvdXJzIFx1MjAxNCBlZmZlY3R1ZXogbGUgcGFyY291cnMgbWFudWVsbGVtZW50JztcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChiYWRnZSk7XG5cbiAgLyogU3R5bGUgYW5pbWF0aW9uICovXG4gIGlmICghZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhdWRpYm90LXJlY29yZGVyLXN0eWxlXCIpKSB7XG4gICAgdmFyIHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuICAgIHN0eWxlLmlkID0gXCJhdWRpYm90LXJlY29yZGVyLXN0eWxlXCI7XG4gICAgc3R5bGUudGV4dENvbnRlbnQgPSBcIkBrZXlmcmFtZXMgcHVsc2UgeyAwJSwxMDAle29wYWNpdHk6MX0gNTAle29wYWNpdHk6MC4zfSB9XCI7XG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XG4gIH1cblxuICAvKiBcdTAwQzljb3V0ZXIgbGVzIGV2ZW50cyBzdXIgbGUgZG9jdW1lbnQgcHJpbmNpcGFsICovXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBvblJlY29yZGVyQ2xpY2ssIHRydWUpO1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIG9uUmVjb3JkZXJDaGFuZ2UsIHRydWUpO1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiYmx1clwiLCBvblJlY29yZGVyQmx1ciwgdHJ1ZSk7XG5cbiAgLyogXHUyNTAwXHUyNTAwIElmcmFtZXMgOiBhdHRhY2hlciBsZXMgbGlzdGVuZXJzIGRhbnMgY2hhcXVlIGlmcmFtZSBhY2Nlc3NpYmxlIFx1MjUwMFx1MjUwMCAqL1xuICBmdW5jdGlvbiBhdHRhY2hSZWNvcmRlclRvSWZyYW1lcygpIHtcbiAgICB2YXIgaWZyYW1lcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJpZnJhbWVcIik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpZnJhbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0cnkge1xuICAgICAgICB2YXIgaURvYyA9IGlmcmFtZXNbaV0uY29udGVudERvY3VtZW50IHx8IChpZnJhbWVzW2ldLmNvbnRlbnRXaW5kb3cgJiYgaWZyYW1lc1tpXS5jb250ZW50V2luZG93LmRvY3VtZW50KTtcbiAgICAgICAgaWYgKCFpRG9jIHx8IGlEb2MuX2F1ZGlib3RSZWNvcmRlcikgY29udGludWU7IC8qIGRcdTAwRTlqXHUwMEUwIGF0dGFjaFx1MDBFOSAqL1xuICAgICAgICBpRG9jLl9hdWRpYm90UmVjb3JkZXIgPSB0cnVlO1xuICAgICAgICBpRG9jLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBvblJlY29yZGVyQ2xpY2ssIHRydWUpO1xuICAgICAgICBpRG9jLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgb25SZWNvcmRlckNoYW5nZSwgdHJ1ZSk7XG4gICAgICAgIGlEb2MuYWRkRXZlbnRMaXN0ZW5lcihcImJsdXJcIiwgb25SZWNvcmRlckJsdXIsIHRydWUpO1xuICAgICAgfSBjYXRjaChlKSB7IC8qIGNyb3NzLW9yaWdpbiBcdTIwMTQgaW5hY2Nlc3NpYmxlICovIH1cbiAgICB9XG4gIH1cbiAgYXR0YWNoUmVjb3JkZXJUb0lmcmFtZXMoKTtcblxuICAvKiBPYnNlcnZlciBsZXMgaWZyYW1lcyBxdWkgYXBwYXJhaXNzZW50IGR5bmFtaXF1ZW1lbnQgKi9cbiAgdmFyIGlmcmFtZU9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24oKSB7XG4gICAgYXR0YWNoUmVjb3JkZXJUb0lmcmFtZXMoKTtcbiAgfSk7XG4gIGlmcmFtZU9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuYm9keSwgeyBjaGlsZExpc3Q6IHRydWUsIHN1YnRyZWU6IHRydWUgfSk7XG4gIHJlY29yZGVyU3RhdGUuX2lmcmFtZU9ic2VydmVyID0gaWZyYW1lT2JzZXJ2ZXI7XG5cbiAgLyogUGVyc2lzdGVyIGwnXHUwMEU5dGF0IGRhbnMgY2hyb21lLnN0b3JhZ2UgcG91ciBzdXJ2aXZyZSBhdXggbmF2aWdhdGlvbnMgKi9cbiAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHsgYXVkaWJvdF9yZWNvcmRlcjogeyBhY3RpdmU6IHRydWUsIGV0YXBlczogW10sIGhvc3RuYW1lOiByZWNvcmRlclN0YXRlLmhvc3RuYW1lLCBzdGFydFRpbWU6IHJlY29yZGVyU3RhdGUuc3RhcnRUaW1lIH0gfSk7XG5cbiAgLyogQWZmaWNoZXIgbGUgcGFubmVhdSBndWlkXHUwMEU5IGxhdFx1MDBFOXJhbCAqL1xuICBzaG93UmVjb3JkZXJQYW5lbCgpO1xuICB1cGRhdGVSZWNvcmRlclBhbmVsKCk7XG5cbiAgc2hvd1JQQVRvYXN0KFwiXHUyM0ZBIEVucmVnaXN0cmVtZW50IGRcdTAwRTltYXJyXHUwMEU5IFx1MjAxNCBlZmZlY3R1ZXogbGUgcGFyY291cnNcIiwgXCJpbmZvXCIpO1xufVxuXG4vKiBBcnJcdTAwRUF0ZXIgbCdlbnJlZ2lzdHJlbWVudCBldCBhZmZpY2hlciBsZSBtb2RhbCBkZSBjb25maXJtYXRpb24gKi9cbmFzeW5jIGZ1bmN0aW9uIHN0b3BSZWNvcmRlcigpIHtcbiAgaWYgKCFyZWNvcmRlclN0YXRlKSByZXR1cm47XG5cbiAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIG9uUmVjb3JkZXJDbGljaywgdHJ1ZSk7XG4gIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgb25SZWNvcmRlckNoYW5nZSwgdHJ1ZSk7XG4gIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJibHVyXCIsIG9uUmVjb3JkZXJCbHVyLCB0cnVlKTtcblxuICAvKiBEXHUwMEU5dGFjaGVyIGxlcyBsaXN0ZW5lcnMgZGVzIGlmcmFtZXMgKyBzdG9wcGVyIGwnb2JzZXJ2ZXIgKi9cbiAgaWYgKHJlY29yZGVyU3RhdGUuX2lmcmFtZU9ic2VydmVyKSB7XG4gICAgcmVjb3JkZXJTdGF0ZS5faWZyYW1lT2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICB9XG4gIHRyeSB7XG4gICAgdmFyIGlmcmFtZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiaWZyYW1lXCIpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaWZyYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIGlEb2MgPSBpZnJhbWVzW2ldLmNvbnRlbnREb2N1bWVudCB8fCAoaWZyYW1lc1tpXS5jb250ZW50V2luZG93ICYmIGlmcmFtZXNbaV0uY29udGVudFdpbmRvdy5kb2N1bWVudCk7XG4gICAgICAgIGlmICghaURvYykgY29udGludWU7XG4gICAgICAgIGlEb2MuX2F1ZGlib3RSZWNvcmRlciA9IGZhbHNlO1xuICAgICAgICBpRG9jLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBvblJlY29yZGVyQ2xpY2ssIHRydWUpO1xuICAgICAgICBpRG9jLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgb25SZWNvcmRlckNoYW5nZSwgdHJ1ZSk7XG4gICAgICAgIGlEb2MucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImJsdXJcIiwgb25SZWNvcmRlckJsdXIsIHRydWUpO1xuICAgICAgfSBjYXRjaChlKSB7fVxuICAgIH1cbiAgfSBjYXRjaChlKSB7fVxuXG4gIHZhciBiYWRnZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXVkaWJvdC1yZWNvcmRlci1iYWRnZVwiKTtcbiAgaWYgKGJhZGdlKSBiYWRnZS5yZW1vdmUoKTtcblxuICAvKiBSZXRpcmVyIGxlIHBhbm5lYXUgZ3VpZFx1MDBFOSBldCBsZXMgaGlnaGxpZ2h0cyAqL1xuICB2YXIgcGFuZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF1ZGlib3QtcmVjb3JkZXItcGFuZWxcIik7XG4gIGlmIChwYW5lbCkgcGFuZWwucmVtb3ZlKCk7XG4gIHJlbW92ZVJlY29yZGVySGlnaGxpZ2h0cygpO1xuXG4gIHZhciBldGFwZXMgPSByZWNvcmRlclN0YXRlLmV0YXBlcztcbiAgdmFyIGhvc3RuYW1lID0gcmVjb3JkZXJTdGF0ZS5ob3N0bmFtZTtcbiAgcmVjb3JkZXJTdGF0ZSA9IG51bGw7XG5cbiAgLyogTmV0dG95ZXIgbGUgc3RvcmFnZSAqL1xuICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5yZW1vdmUoXCJhdWRpYm90X3JlY29yZGVyXCIpO1xuXG4gIGlmIChldGFwZXMubGVuZ3RoID09PSAwKSB7XG4gICAgc2hvd1JQQVRvYXN0KFwiQXVjdW5lIFx1MDBFOXRhcGUgZW5yZWdpc3RyXHUwMEU5ZS5cIiwgXCJpbmZvXCIpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8qIEFmZmljaGVyIGxlIHdpemFyZCAzIFx1MDBFOXRhcGVzICovXG4gIHNob3dSZWNvcmRlcldpemFyZChldGFwZXMsIGhvc3RuYW1lKTtcbn1cblxuLyogRW52b3llciBsZSBwYXJjb3VycyBlbnJlZ2lzdHJcdTAwRTkgYXUgc2VydmV1ciAqL1xuYXN5bmMgZnVuY3Rpb24gc2VuZFJlY29yZGVyUGFyY291cnMoZXRhcGVzLCBob3N0bmFtZSwgbm9tKSB7XG4gIHZhciBzeW5jVG9rZW4gPSBhd2FpdCBnZXRTeW5jVG9rZW4oKTtcbiAgaWYgKCFzeW5jVG9rZW4pIHtcbiAgICBzaG93UlBBVG9hc3QoXCJFcnJldXIgOiBub24gY29ubmVjdFx1MDBFOS5cIiwgXCJlcnJvclwiKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB0cnkge1xuICAgIHZhciByZXMgPSBhd2FpdCBmZXRjaChcImh0dHBzOi8vYXVkaWJvdC5mci9hcGkvZXh0ZW5zaW9uL3BhcmNvdXJzL3NhdmVcIiwge1xuICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgdG9rZW46IHN5bmNUb2tlbixcbiAgICAgICAgaG9zdG5hbWU6IGhvc3RuYW1lLFxuICAgICAgICBub206IG5vbSxcbiAgICAgICAgZXRhcGVzOiBldGFwZXMsXG4gICAgICB9KSxcbiAgICB9KTtcbiAgICBpZiAocmVzLm9rKSB7XG4gICAgICBzaG93UlBBVG9hc3QoXCJcdTI3MDUgUGFyY291cnMgZW5yZWdpc3RyXHUwMEU5IChcIiArIGV0YXBlcy5sZW5ndGggKyBcIiBcdTAwRTl0YXBlcykgXHUyMDE0IGVuIGF0dGVudGUgZGUgdmFsaWRhdGlvbiBhZG1pblwiLCBcInN1Y2Nlc3NcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNob3dSUEFUb2FzdChcIkVycmV1ciBsb3JzIGRlIGwnZW5yZWdpc3RyZW1lbnQuXCIsIFwiZXJyb3JcIik7XG4gICAgfVxuICB9IGNhdGNoKGUpIHtcbiAgICBzaG93UlBBVG9hc3QoXCJFcnJldXIgclx1MDBFOXNlYXUuXCIsIFwiZXJyb3JcIik7XG4gIH1cbn1cblxuLyogXHUyNTAwXHUyNTAwIFdpemFyZCAzIFx1MDBFOXRhcGVzIFx1MjAxNCByZW1wbGFjZSBsZSBtb2RhbCBkZSBjb25maXJtYXRpb24gXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG5cbmZ1bmN0aW9uIHNob3dSZWNvcmRlcldpemFyZChldGFwZXMsIGhvc3RuYW1lKSB7XG4gIHZhciBleGlzdGluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXVkaWJvdC1yZWNvcmRlci1tb2RhbC1vdmVybGF5XCIpO1xuICBpZiAoZXhpc3RpbmcpIGV4aXN0aW5nLnJlbW92ZSgpO1xuXG4gIHZhciBjdXJyZW50U3RlcCA9IDE7XG4gIHZhciBub21Qb3J0YWlsID0gaG9zdG5hbWU7XG5cbiAgLyogVmFyaWFibGVzIGRpc3BvbmlibGVzIHBvdXIgY29ycmVjdGlvbiBtYW51ZWxsZSAqL1xuICB2YXIgdmFyaWFibGVPcHRpb25zID0gW1xuICAgIFwie3tuc3N9fVwiLCBcInt7bm9tfX1cIiwgXCJ7e3ByZW5vbX19XCIsIFwie3tkYXRlTmFpc3NhbmNlfX1cIiwgXCJ7e2RhdGVPcmRvbm5hbmNlfX1cIixcbiAgICBcInt7bnVtZXJvQWRoZXJlbnR9fVwiLCBcInt7b3JnYW5pc21lfX1cIiwgXCJ7e3NwaGVyZV9vZH19XCIsIFwie3tzcGhlcmVfb2d9fVwiLFxuICAgIFwie3tjeWxpbmRyZV9vZH19XCIsIFwie3tjeWxpbmRyZV9vZ319XCIsIFwie3theGVfb2R9fVwiLCBcInt7YXhlX29nfX1cIiwgXCJ7e2FkZGl0aW9ufX1cIixcbiAgICBcIklnbm9yZXIgY2UgY2hhbXBcIlxuICBdO1xuXG4gIC8qIE92ZXJsYXkgKi9cbiAgdmFyIG92ZXJsYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBvdmVybGF5LmlkID0gXCJhdWRpYm90LXJlY29yZGVyLW1vZGFsLW92ZXJsYXlcIjtcbiAgb3ZlcmxheS5zdHlsZS5jc3NUZXh0ID0gXCJwb3NpdGlvbjpmaXhlZDt0b3A6MDtsZWZ0OjA7d2lkdGg6MTAwJTtoZWlnaHQ6MTAwJTtiYWNrZ3JvdW5kOnJnYmEoMCwwLDAsMC41KTt6LWluZGV4OjIxNDc0ODM2NDc7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO2ZvbnQtZmFtaWx5OnNhbnMtc2VyaWY7XCI7XG5cbiAgLyogQ2FydGUgKi9cbiAgdmFyIGNhcmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBjYXJkLnN0eWxlLmNzc1RleHQgPSBcImJhY2tncm91bmQ6d2hpdGU7Ym9yZGVyLXJhZGl1czoxNnB4O21heC13aWR0aDo0ODBweDt3aWR0aDo5MiU7bWF4LWhlaWdodDo4NXZoO2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Ym94LXNoYWRvdzowIDIwcHggNjBweCByZ2JhKDAsMCwwLDAuMyk7cGFkZGluZzoyNHB4O1wiO1xuXG4gIC8qIEluZGljYXRldXIgZGUgcHJvZ3Jlc3Npb24gKi9cbiAgdmFyIHByb2dyZXNzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgcHJvZ3Jlc3Muc3R5bGUuY3NzVGV4dCA9IFwidGV4dC1hbGlnbjpjZW50ZXI7bWFyZ2luLWJvdHRvbToxNnB4O2ZvbnQtc2l6ZToxOHB4O2xldHRlci1zcGFjaW5nOjRweDtcIjtcblxuICAvKiBDb250ZW5ldXIgZGUgY29udGVudSAoY2hhbmdlIFx1MDBFMCBjaGFxdWUgXHUwMEU5dGFwZSkgKi9cbiAgdmFyIGNvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBjb250ZW50LnN0eWxlLmNzc1RleHQgPSBcImZsZXg6MTtvdmVyZmxvdy15OmF1dG87bWF4LWhlaWdodDo1NXZoO1wiO1xuXG4gIC8qIEZvb3RlciBib3V0b25zICovXG4gIHZhciBmb290ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBmb290ZXIuc3R5bGUuY3NzVGV4dCA9IFwiZGlzcGxheTpmbGV4O2p1c3RpZnktY29udGVudDpzcGFjZS1iZXR3ZWVuO2FsaWduLWl0ZW1zOmNlbnRlcjttYXJnaW4tdG9wOjE2cHg7Z2FwOjhweDtcIjtcblxuICBmdW5jdGlvbiB1cGRhdGVQcm9ncmVzcygpIHtcbiAgICB2YXIgZG90cyA9IFwiXCI7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPD0gMzsgaSsrKSB7XG4gICAgICBkb3RzICs9IChpIDw9IGN1cnJlbnRTdGVwKSA/IFwiXHUyNUNGIFwiIDogXCJcdTI1Q0IgXCI7XG4gICAgfVxuICAgIHByb2dyZXNzLnRleHRDb250ZW50ID0gZG90cy50cmltKCk7XG4gIH1cblxuICBmdW5jdGlvbiByZW5kZXJTdGVwKCkge1xuICAgIGNvbnRlbnQuaW5uZXJIVE1MID0gXCJcIjtcbiAgICBmb290ZXIuaW5uZXJIVE1MID0gXCJcIjtcbiAgICB1cGRhdGVQcm9ncmVzcygpO1xuXG4gICAgaWYgKGN1cnJlbnRTdGVwID09PSAxKSByZW5kZXJTdGVwMSgpO1xuICAgIGVsc2UgaWYgKGN1cnJlbnRTdGVwID09PSAyKSByZW5kZXJTdGVwMigpO1xuICAgIGVsc2UgaWYgKGN1cnJlbnRTdGVwID09PSAzKSByZW5kZXJTdGVwMygpO1xuICB9XG5cbiAgLyogXHUyNTAwXHUyNTAwIFx1MDBDOXRhcGUgMSBcdTIwMTQgTm9tIGR1IHBvcnRhaWwgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG4gIGZ1bmN0aW9uIHJlbmRlclN0ZXAxKCkge1xuICAgIHZhciB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgdGl0bGUuc3R5bGUuY3NzVGV4dCA9IFwiZm9udC1zaXplOjE2cHg7Zm9udC13ZWlnaHQ6NzAwO2NvbG9yOiMxMTE7bWFyZ2luLWJvdHRvbToxMnB4O1wiO1xuICAgIHRpdGxlLnRleHRDb250ZW50ID0gXCJcdTIzRkEgTm9tIGR1IHBvcnRhaWxcIjtcblxuICAgIHZhciBkZXNjID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBkZXNjLnN0eWxlLmNzc1RleHQgPSBcImZvbnQtc2l6ZToxM3B4O2NvbG9yOiM2YjcyODA7bWFyZ2luLWJvdHRvbToxNnB4O1wiO1xuICAgIGRlc2MudGV4dENvbnRlbnQgPSBcIkRvbm5leiB1biBub20gXHUwMEUwIGNlIHBhcmNvdXJzIHBvdXIgbGUgcmV0cm91dmVyIGZhY2lsZW1lbnQuXCI7XG5cbiAgICB2YXIgaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XG4gICAgaW5wdXQudHlwZSA9IFwidGV4dFwiO1xuICAgIGlucHV0LnZhbHVlID0gbm9tUG9ydGFpbDtcbiAgICBpbnB1dC5wbGFjZWhvbGRlciA9IGhvc3RuYW1lO1xuICAgIGlucHV0LnN0eWxlLmNzc1RleHQgPSBcIndpZHRoOjEwMCU7cGFkZGluZzoxMHB4IDE0cHg7Ym9yZGVyOjFweCBzb2xpZCAjZDFkNWRiO2JvcmRlci1yYWRpdXM6OHB4O2ZvbnQtc2l6ZToxNHB4O2JveC1zaXppbmc6Ym9yZGVyLWJveDtvdXRsaW5lOm5vbmU7XCI7XG4gICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImZvY3VzXCIsIGZ1bmN0aW9uKCkgeyBpbnB1dC5zdHlsZS5ib3JkZXJDb2xvciA9IFwiIzNiODJmNlwiOyB9KTtcbiAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiYmx1clwiLCBmdW5jdGlvbigpIHsgaW5wdXQuc3R5bGUuYm9yZGVyQ29sb3IgPSBcIiNkMWQ1ZGJcIjsgfSk7XG4gICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIGZ1bmN0aW9uKCkgeyBub21Qb3J0YWlsID0gaW5wdXQudmFsdWUudHJpbSgpIHx8IGhvc3RuYW1lOyB9KTtcblxuICAgIGNvbnRlbnQuYXBwZW5kQ2hpbGQodGl0bGUpO1xuICAgIGNvbnRlbnQuYXBwZW5kQ2hpbGQoZGVzYyk7XG4gICAgY29udGVudC5hcHBlbmRDaGlsZChpbnB1dCk7XG5cbiAgICAvKiBCb3V0b25zICovXG4gICAgdmFyIGNhbmNlbEJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgY2FuY2VsQnRuLnN0eWxlLmNzc1RleHQgPSBcInBhZGRpbmc6OHB4IDE2cHg7Ym9yZGVyOjFweCBzb2xpZCAjZDFkNWRiO2JvcmRlci1yYWRpdXM6OHB4O2JhY2tncm91bmQ6d2hpdGU7Y29sb3I6IzM3NDE1MTtmb250LXNpemU6MTNweDtmb250LXdlaWdodDo1MDA7Y3Vyc29yOnBvaW50ZXI7XCI7XG4gICAgY2FuY2VsQnRuLnRleHRDb250ZW50ID0gXCJBbm51bGVyXCI7XG4gICAgY2FuY2VsQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHsgb3ZlcmxheS5yZW1vdmUoKTsgc2hvd1JQQVRvYXN0KFwiRW52b2kgYW5udWxcdTAwRTkuXCIsIFwiaW5mb1wiKTsgfSk7XG5cbiAgICB2YXIgbmV4dEJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgbmV4dEJ0bi5zdHlsZS5jc3NUZXh0ID0gXCJwYWRkaW5nOjhweCAyMHB4O2JvcmRlcjpub25lO2JvcmRlci1yYWRpdXM6OHB4O2JhY2tncm91bmQ6IzNiODJmNjtjb2xvcjp3aGl0ZTtmb250LXNpemU6MTNweDtmb250LXdlaWdodDo2MDA7Y3Vyc29yOnBvaW50ZXI7XCI7XG4gICAgbmV4dEJ0bi50ZXh0Q29udGVudCA9IFwiU3VpdmFudCBcdTIxOTJcIjtcbiAgICBuZXh0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHsgY3VycmVudFN0ZXAgPSAyOyByZW5kZXJTdGVwKCk7IH0pO1xuXG4gICAgZm9vdGVyLmFwcGVuZENoaWxkKGNhbmNlbEJ0bik7XG4gICAgZm9vdGVyLmFwcGVuZENoaWxkKG5leHRCdG4pO1xuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHsgaW5wdXQuZm9jdXMoKTsgaW5wdXQuc2VsZWN0KCk7IH0sIDUwKTtcbiAgfVxuXG4gIC8qIFx1MjUwMFx1MjUwMCBcdTAwQzl0YXBlIDIgXHUyMDE0IFZcdTAwRTlyaWZpY2F0aW9uIGRlcyBjaGFtcHMgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG4gIGZ1bmN0aW9uIHJlbmRlclN0ZXAyKCkge1xuICAgIHZhciB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgdGl0bGUuc3R5bGUuY3NzVGV4dCA9IFwiZm9udC1zaXplOjE2cHg7Zm9udC13ZWlnaHQ6NzAwO2NvbG9yOiMxMTE7bWFyZ2luLWJvdHRvbToxMnB4O1wiO1xuICAgIHRpdGxlLnRleHRDb250ZW50ID0gXCJcdUQ4M0RcdUREMEQgVlx1MDBFOXJpZmljYXRpb24gZGVzIGNoYW1wc1wiO1xuXG4gICAgdmFyIGRlc2MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGRlc2Muc3R5bGUuY3NzVGV4dCA9IFwiZm9udC1zaXplOjEzcHg7Y29sb3I6IzZiNzI4MDttYXJnaW4tYm90dG9tOjE2cHg7XCI7XG4gICAgZGVzYy50ZXh0Q29udGVudCA9IFwiVlx1MDBFOXJpZmlleiBsZXMgdmFyaWFibGVzIGRcdTAwRTl0ZWN0XHUwMEU5ZXMuIENvcnJpZ2V6IGxlcyBjaGFtcHMgb3JhbmdlIG1hbnVlbGxlbWVudC5cIjtcblxuICAgIGNvbnRlbnQuYXBwZW5kQ2hpbGQodGl0bGUpO1xuICAgIGNvbnRlbnQuYXBwZW5kQ2hpbGQoZGVzYyk7XG5cbiAgICB2YXIgZmlsbFN0ZXBzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBldGFwZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChldGFwZXNbaV0uYWN0aW9uID09PSBcImZpbGxcIiB8fCBldGFwZXNbaV0uYWN0aW9uID09PSBcInNlbGVjdFwiKSBmaWxsU3RlcHMucHVzaChpKTtcbiAgICB9XG5cbiAgICBpZiAoZmlsbFN0ZXBzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdmFyIG5vRmlsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICBub0ZpbGwuc3R5bGUuY3NzVGV4dCA9IFwiZm9udC1zaXplOjEzcHg7Y29sb3I6IzljYTNhZjt0ZXh0LWFsaWduOmNlbnRlcjtwYWRkaW5nOjIwcHggMDtcIjtcbiAgICAgIG5vRmlsbC50ZXh0Q29udGVudCA9IFwiQXVjdW4gY2hhbXAgZGUgc2Fpc2llIGRcdTAwRTl0ZWN0XHUwMEU5IFx1MjAxNCB1bmlxdWVtZW50IGRlcyBjbGljcy5cIjtcbiAgICAgIGNvbnRlbnQuYXBwZW5kQ2hpbGQobm9GaWxsKTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBmaSA9IDA7IGZpIDwgZmlsbFN0ZXBzLmxlbmd0aDsgZmkrKykge1xuICAgICAgKGZ1bmN0aW9uKGV0YXBlSWR4KSB7XG4gICAgICAgIHZhciBzdGVwID0gZXRhcGVzW2V0YXBlSWR4XTtcbiAgICAgICAgdmFyIGlzS25vd24gPSBzdGVwLnZhcmlhYmxlICYmIHN0ZXAudmFyaWFibGUuaW5kZXhPZihcInt7XCIpID09PSAwO1xuICAgICAgICB2YXIgaXNTdGF0aWMgPSAhc3RlcC52YXJpYWJsZSB8fCBzdGVwLnZhcmlhYmxlID09PSBcIltWQUxFVVIgU1RBVElRVUUgXHUyMDE0IFx1MDBDMCBSRU5TRUlHTkVSXVwiO1xuXG4gICAgICAgIHZhciByb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICByb3cuc3R5bGUuY3NzVGV4dCA9IFwiZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4O3BhZGRpbmc6OHB4IDA7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgI2YzZjRmNjtcIjtcblxuICAgICAgICB2YXIgbGFiZWxTcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgICAgIGxhYmVsU3Bhbi5zdHlsZS5jc3NUZXh0ID0gXCJmb250LXNpemU6MTNweDtjb2xvcjojMzc0MTUxO2ZsZXg6MTttaW4td2lkdGg6MDtvdmVyZmxvdzpoaWRkZW47dGV4dC1vdmVyZmxvdzplbGxpcHNpczt3aGl0ZS1zcGFjZTpub3dyYXA7XCI7XG4gICAgICAgIGxhYmVsU3Bhbi50ZXh0Q29udGVudCA9IChzdGVwLmxhYmVsIHx8IFwiQ2hhbXBcIikuc2xpY2UoMCwgMzApO1xuXG4gICAgICAgIGlmIChpc0tub3duKSB7XG4gICAgICAgICAgdmFyIGJhZGdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgICAgICAgYmFkZ2Uuc3R5bGUuY3NzVGV4dCA9IFwiZm9udC1zaXplOjExcHg7YmFja2dyb3VuZDojZDFmYWU1O2NvbG9yOiMwNjVmNDY7cGFkZGluZzoycHggOHB4O2JvcmRlci1yYWRpdXM6NHB4O3doaXRlLXNwYWNlOm5vd3JhcDtcIjtcbiAgICAgICAgICBiYWRnZS50ZXh0Q29udGVudCA9IFwiYXV0b21hdGlxdWUgXCIgKyBzdGVwLnZhcmlhYmxlO1xuICAgICAgICAgIHJvdy5hcHBlbmRDaGlsZChsYWJlbFNwYW4pO1xuICAgICAgICAgIHJvdy5hcHBlbmRDaGlsZChiYWRnZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIHNlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzZWxlY3RcIik7XG4gICAgICAgICAgc2VsLnN0eWxlLmNzc1RleHQgPSBcImZvbnQtc2l6ZToxMnB4O3BhZGRpbmc6NHB4IDZweDtib3JkZXI6MXB4IHNvbGlkICNmNTllMGI7Ym9yZGVyLXJhZGl1czo0cHg7YmFja2dyb3VuZDojZmZmYmViO2NvbG9yOiM5MjQwMGU7bWF4LXdpZHRoOjE2MHB4O1wiO1xuICAgICAgICAgIC8qIE9wdGlvbiBwYXIgZFx1MDBFOWZhdXQgKi9cbiAgICAgICAgICB2YXIgZGVmYXVsdE9wdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJvcHRpb25cIik7XG4gICAgICAgICAgZGVmYXVsdE9wdC52YWx1ZSA9IFwiXCI7XG4gICAgICAgICAgZGVmYXVsdE9wdC50ZXh0Q29udGVudCA9IFwiXHUyNkEwXHVGRTBGIFx1MDBDMCBtYXBwZXJcIjtcbiAgICAgICAgICBkZWZhdWx0T3B0LnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICBzZWwuYXBwZW5kQ2hpbGQoZGVmYXVsdE9wdCk7XG4gICAgICAgICAgZm9yICh2YXIgdmkgPSAwOyB2aSA8IHZhcmlhYmxlT3B0aW9ucy5sZW5ndGg7IHZpKyspIHtcbiAgICAgICAgICAgIHZhciBvcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIpO1xuICAgICAgICAgICAgb3B0LnZhbHVlID0gdmFyaWFibGVPcHRpb25zW3ZpXTtcbiAgICAgICAgICAgIG9wdC50ZXh0Q29udGVudCA9IHZhcmlhYmxlT3B0aW9uc1t2aV07XG4gICAgICAgICAgICBzZWwuYXBwZW5kQ2hpbGQob3B0KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgc2VsLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgZnVuY3Rpb24oZXYpIHtcbiAgICAgICAgICAgIHZhciB2YWwgPSBldi50YXJnZXQudmFsdWU7XG4gICAgICAgICAgICBpZiAodmFsID09PSBcIklnbm9yZXIgY2UgY2hhbXBcIikge1xuICAgICAgICAgICAgICBzdGVwLnZhcmlhYmxlID0gbnVsbDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsKSB7XG4gICAgICAgICAgICAgIHN0ZXAudmFyaWFibGUgPSB2YWw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcm93LmFwcGVuZENoaWxkKGxhYmVsU3Bhbik7XG4gICAgICAgICAgcm93LmFwcGVuZENoaWxkKHNlbCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb250ZW50LmFwcGVuZENoaWxkKHJvdyk7XG4gICAgICB9KShmaWxsU3RlcHNbZmldKTtcbiAgICB9XG5cbiAgICAvKiBCb3V0b25zICovXG4gICAgdmFyIGJhY2tCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICAgIGJhY2tCdG4uc3R5bGUuY3NzVGV4dCA9IFwicGFkZGluZzo4cHggMTZweDtib3JkZXI6MXB4IHNvbGlkICNkMWQ1ZGI7Ym9yZGVyLXJhZGl1czo4cHg7YmFja2dyb3VuZDp3aGl0ZTtjb2xvcjojMzc0MTUxO2ZvbnQtc2l6ZToxM3B4O2ZvbnQtd2VpZ2h0OjUwMDtjdXJzb3I6cG9pbnRlcjtcIjtcbiAgICBiYWNrQnRuLnRleHRDb250ZW50ID0gXCJcdTIxOTAgUmV0b3VyXCI7XG4gICAgYmFja0J0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7IGN1cnJlbnRTdGVwID0gMTsgcmVuZGVyU3RlcCgpOyB9KTtcblxuICAgIHZhciBuZXh0QnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgICBuZXh0QnRuLnN0eWxlLmNzc1RleHQgPSBcInBhZGRpbmc6OHB4IDIwcHg7Ym9yZGVyOm5vbmU7Ym9yZGVyLXJhZGl1czo4cHg7YmFja2dyb3VuZDojM2I4MmY2O2NvbG9yOndoaXRlO2ZvbnQtc2l6ZToxM3B4O2ZvbnQtd2VpZ2h0OjYwMDtjdXJzb3I6cG9pbnRlcjtcIjtcbiAgICBuZXh0QnRuLnRleHRDb250ZW50ID0gXCJTdWl2YW50IFx1MjE5MlwiO1xuICAgIG5leHRCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkgeyBjdXJyZW50U3RlcCA9IDM7IHJlbmRlclN0ZXAoKTsgfSk7XG5cbiAgICBmb290ZXIuYXBwZW5kQ2hpbGQoYmFja0J0bik7XG4gICAgZm9vdGVyLmFwcGVuZENoaWxkKG5leHRCdG4pO1xuICB9XG5cbiAgLyogXHUyNTAwXHUyNTAwIFx1MDBDOXRhcGUgMyBcdTIwMTQgUlx1MDBFOWNhcCBldCBlbnZvaSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cbiAgZnVuY3Rpb24gcmVuZGVyU3RlcDMoKSB7XG4gICAgdmFyIGF1dG9Db3VudCA9IDA7XG4gICAgdmFyIG1hbnVhbENvdW50ID0gMDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV0YXBlcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGV0YXBlc1tpXS5hY3Rpb24gPT09IFwiZmlsbFwiIHx8IGV0YXBlc1tpXS5hY3Rpb24gPT09IFwic2VsZWN0XCIpIHtcbiAgICAgICAgaWYgKGV0YXBlc1tpXS52YXJpYWJsZSAmJiBldGFwZXNbaV0udmFyaWFibGUuaW5kZXhPZihcInt7XCIpID09PSAwKSBhdXRvQ291bnQrKztcbiAgICAgICAgZWxzZSBtYW51YWxDb3VudCsrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgdGl0bGUuc3R5bGUuY3NzVGV4dCA9IFwiZm9udC1zaXplOjIwcHg7Zm9udC13ZWlnaHQ6NzAwO2NvbG9yOiMxMTE7dGV4dC1hbGlnbjpjZW50ZXI7bWFyZ2luLWJvdHRvbTo4cHg7XCI7XG4gICAgdGl0bGUudGV4dENvbnRlbnQgPSBcIlx1RDgzQ1x1REY4OSBQYXJjb3VycyBwclx1MDBFQXQgIVwiO1xuXG4gICAgdmFyIHN0YXRzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBzdGF0cy5zdHlsZS5jc3NUZXh0ID0gXCJmb250LXNpemU6MTRweDtjb2xvcjojNmI3MjgwO3RleHQtYWxpZ246Y2VudGVyO21hcmdpbi1ib3R0b206MjRweDtcIjtcbiAgICBzdGF0cy50ZXh0Q29udGVudCA9IGV0YXBlcy5sZW5ndGggKyBcIiBcdTAwRTl0YXBlcyBcdTAwQjcgXCIgKyBhdXRvQ291bnQgKyBcIiBjaGFtcHMgYXV0b21hdGlxdWVzIFx1MDBCNyBcIiArIG1hbnVhbENvdW50ICsgXCIgY2hhbXBzIG1hbnVlbHNcIjtcblxuICAgIGNvbnRlbnQuYXBwZW5kQ2hpbGQodGl0bGUpO1xuICAgIGNvbnRlbnQuYXBwZW5kQ2hpbGQoc3RhdHMpO1xuXG4gICAgLyogQm91dG9uIEVudm95ZXIgKi9cbiAgICB2YXIgc2VuZEJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgc2VuZEJ0bi5zdHlsZS5jc3NUZXh0ID0gXCJ3aWR0aDoxMDAlO3BhZGRpbmc6MTJweDtib3JkZXI6bm9uZTtib3JkZXItcmFkaXVzOjhweDtiYWNrZ3JvdW5kOiMzYjgyZjY7Y29sb3I6d2hpdGU7Zm9udC1zaXplOjE0cHg7Zm9udC13ZWlnaHQ6NjAwO2N1cnNvcjpwb2ludGVyO21hcmdpbi1ib3R0b206OHB4O1wiO1xuICAgIHNlbmRCdG4udGV4dENvbnRlbnQgPSBcIkVudm95ZXIgXHUwMEUwIEF1ZGlCb3RcIjtcbiAgICBzZW5kQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgIG92ZXJsYXkucmVtb3ZlKCk7XG4gICAgICBzZW5kUmVjb3JkZXJQYXJjb3VycyhldGFwZXMsIGhvc3RuYW1lLCBub21Qb3J0YWlsKTtcbiAgICB9KTtcbiAgICBjb250ZW50LmFwcGVuZENoaWxkKHNlbmRCdG4pO1xuXG4gICAgLyogQm91dG9uIFRcdTAwRTlsXHUwMEU5Y2hhcmdlciBKU09OICovXG4gICAgdmFyIGRsQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgICBkbEJ0bi5zdHlsZS5jc3NUZXh0ID0gXCJ3aWR0aDoxMDAlO3BhZGRpbmc6MTJweDtib3JkZXI6MXB4IHNvbGlkICNkMWQ1ZGI7Ym9yZGVyLXJhZGl1czo4cHg7YmFja2dyb3VuZDp3aGl0ZTtjb2xvcjojMzc0MTUxO2ZvbnQtc2l6ZToxNHB4O2ZvbnQtd2VpZ2h0OjUwMDtjdXJzb3I6cG9pbnRlcjttYXJnaW4tYm90dG9tOjhweDtcIjtcbiAgICBkbEJ0bi50ZXh0Q29udGVudCA9IFwiVFx1MDBFOWxcdTAwRTljaGFyZ2VyIEpTT05cIjtcbiAgICBkbEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYmxvYiA9IG5ldyBCbG9iKFtKU09OLnN0cmluZ2lmeSh7IGhvc3RuYW1lOiBob3N0bmFtZSwgbm9tOiBub21Qb3J0YWlsLCBldGFwZXM6IGV0YXBlcyB9LCBudWxsLCAyKV0sIHsgdHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSk7XG4gICAgICB2YXIgdXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICAgIHZhciBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XG4gICAgICBhLmhyZWYgPSB1cmw7XG4gICAgICBhLmRvd25sb2FkID0gXCJhdWRpYm90LXBhcmNvdXJzLVwiICsgaG9zdG5hbWUgKyBcIi5qc29uXCI7XG4gICAgICBhLmNsaWNrKCk7XG4gICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHVybCk7XG4gICAgfSk7XG4gICAgY29udGVudC5hcHBlbmRDaGlsZChkbEJ0bik7XG5cbiAgICAvKiBCb3V0b25zIGZvb3RlciAqL1xuICAgIHZhciBiYWNrQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgICBiYWNrQnRuLnN0eWxlLmNzc1RleHQgPSBcInBhZGRpbmc6OHB4IDE2cHg7Ym9yZGVyOjFweCBzb2xpZCAjZDFkNWRiO2JvcmRlci1yYWRpdXM6OHB4O2JhY2tncm91bmQ6d2hpdGU7Y29sb3I6IzM3NDE1MTtmb250LXNpemU6MTNweDtmb250LXdlaWdodDo1MDA7Y3Vyc29yOnBvaW50ZXI7XCI7XG4gICAgYmFja0J0bi50ZXh0Q29udGVudCA9IFwiXHUyMTkwIFJldG91clwiO1xuICAgIGJhY2tCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkgeyBjdXJyZW50U3RlcCA9IDI7IHJlbmRlclN0ZXAoKTsgfSk7XG5cbiAgICB2YXIgY2FuY2VsQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgICBjYW5jZWxCdG4uc3R5bGUuY3NzVGV4dCA9IFwicGFkZGluZzo4cHggMTZweDtib3JkZXI6MXB4IHNvbGlkICNkMWQ1ZGI7Ym9yZGVyLXJhZGl1czo4cHg7YmFja2dyb3VuZDp3aGl0ZTtjb2xvcjojZWY0NDQ0O2ZvbnQtc2l6ZToxM3B4O2ZvbnQtd2VpZ2h0OjUwMDtjdXJzb3I6cG9pbnRlcjtcIjtcbiAgICBjYW5jZWxCdG4udGV4dENvbnRlbnQgPSBcIkFubnVsZXJcIjtcbiAgICBjYW5jZWxCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkgeyBvdmVybGF5LnJlbW92ZSgpOyBzaG93UlBBVG9hc3QoXCJFbnZvaSBhbm51bFx1MDBFOS5cIiwgXCJpbmZvXCIpOyB9KTtcblxuICAgIGZvb3Rlci5hcHBlbmRDaGlsZChiYWNrQnRuKTtcbiAgICBmb290ZXIuYXBwZW5kQ2hpbGQoY2FuY2VsQnRuKTtcbiAgfVxuXG4gIC8qIEFzc2VtYmxlciAqL1xuICBjYXJkLmFwcGVuZENoaWxkKHByb2dyZXNzKTtcbiAgY2FyZC5hcHBlbmRDaGlsZChjb250ZW50KTtcbiAgY2FyZC5hcHBlbmRDaGlsZChmb290ZXIpO1xuICBvdmVybGF5LmFwcGVuZENoaWxkKGNhcmQpO1xuXG4gIC8qIEZlcm1lciBlbiBjbGlxdWFudCBzdXIgbCdvdmVybGF5IChob3JzIGNhcnRlKSAqL1xuICBvdmVybGF5LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldikge1xuICAgIGlmIChldi50YXJnZXQgPT09IG92ZXJsYXkpIHtcbiAgICAgIG92ZXJsYXkucmVtb3ZlKCk7XG4gICAgICBzaG93UlBBVG9hc3QoXCJFbnZvaSBhbm51bFx1MDBFOS5cIiwgXCJpbmZvXCIpO1xuICAgIH1cbiAgfSk7XG5cbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChvdmVybGF5KTtcbiAgcmVuZGVyU3RlcCgpO1xufVxuXG4vKiBSR1BEIFx1MjAxNCBBbm9ueW1pc2UgbGUgc25hcHNob3QgSFRNTCBhdmFudCBlbnZvaSAoc3VwcHJpbWUgdmFsZXVycyBwYXRpZW50LCBzY3JpcHRzLCBkYXRhLWF0dHJzIHNlbnNpYmxlcykgKi9cbmZ1bmN0aW9uIGFub255bWl6ZUh0bWxTbmFwc2hvdCgpIHtcbiAgdHJ5IHtcbiAgICB2YXIgY2xvbmUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xvbmVOb2RlKHRydWUpO1xuICAgIC8qIFZpZGVyIHRvdXRlcyBsZXMgdmFsZXVycyBkZXMgaW5wdXRzIChkb25uXHUwMEU5ZXMgcGF0aWVudCBwb3RlbnRpZWxsZXMpICovXG4gICAgdmFyIGlucHV0cyA9IGNsb25lLnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbnB1dCwgdGV4dGFyZWEsIHNlbGVjdFwiKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGlucHV0cy5sZW5ndGg7IGkrKykge1xuICAgICAgaW5wdXRzW2ldLnZhbHVlID0gXCJcIjtcbiAgICAgIGlucHV0c1tpXS5yZW1vdmVBdHRyaWJ1dGUoXCJ2YWx1ZVwiKTtcbiAgICB9XG4gICAgLyogU3VwcHJpbWVyIGxlcyBzY3JpcHRzIGlubGluZSAoaW51dGlsZXMgcG91ciBsZSBkcnktcnVuKSAqL1xuICAgIHZhciBzY3JpcHRzID0gY2xvbmUucXVlcnlTZWxlY3RvckFsbChcInNjcmlwdFwiKTtcbiAgICBmb3IgKHZhciBzID0gMDsgcyA8IHNjcmlwdHMubGVuZ3RoOyBzKyspIHsgc2NyaXB0c1tzXS5yZW1vdmUoKTsgfVxuICAgIC8qIFN1cHByaW1lciBsZXMgZG9ublx1MDBFOWVzIGRhbnMgbGVzIGF0dHJpYnV0cyBkYXRhLSAocGV1dmVudCBjb250ZW5pciBkZXMgaW5mb3MgcGF0aWVudCkgKi9cbiAgICB2YXIgZGF0YUVscyA9IGNsb25lLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbZGF0YS1uc3NdLCBbZGF0YS1ub21dLCBbZGF0YS1wcmVub21dLCBbZGF0YS1zZWN1XSwgW2RhdGEtcGF0aWVudF1cIik7XG4gICAgZm9yICh2YXIgZCA9IDA7IGQgPCBkYXRhRWxzLmxlbmd0aDsgZCsrKSB7XG4gICAgICBbXCJkYXRhLW5zc1wiLFwiZGF0YS1ub21cIixcImRhdGEtcHJlbm9tXCIsXCJkYXRhLXNlY3VcIixcImRhdGEtcGF0aWVudFwiXS5mb3JFYWNoKGZ1bmN0aW9uKGF0dHIpIHtcbiAgICAgICAgZGF0YUVsc1tkXS5yZW1vdmVBdHRyaWJ1dGUoYXR0cik7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGNsb25lLm91dGVySFRNTDtcbiAgfSBjYXRjaChlKSB7XG4gICAgcmV0dXJuIFwiXCI7IC8qIEVuIGNhcyBkJ2VycmV1ciwgbmUgcGFzIGVudm95ZXIgZGUgc25hcHNob3QgKi9cbiAgfVxufVxuXG4vKiBIYW5kbGVyIGNsaWNrICovXG5hc3luYyBmdW5jdGlvbiBvblJlY29yZGVyQ2xpY2soZSkge1xuICBpZiAoIXJlY29yZGVyU3RhdGUpIHJldHVybjtcbiAgdmFyIGVsID0gZS50YXJnZXQ7XG4gIGlmICghZWwgfHwgZWwuaWQgPT09IFwiYXVkaWJvdC1yZWNvcmRlci1iYWRnZVwiIHx8IGVsLmNsb3Nlc3QoXCIjYXVkaWJvdC1yZWNvcmRlci1iYWRnZVwiKSB8fCBlbC5jbG9zZXN0KFwiI2F1ZGlib3QtcmVjb3JkZXItcGFuZWxcIikpIHJldHVybjtcblxuICAvKiBJZ25vcmVyIGxlcyBjaGFtcHMgZGUgc2Fpc2llIChnXHUwMEU5clx1MDBFOXMgcGFyIGJsdXIpICovXG4gIGlmIChlbC50YWdOYW1lID09PSBcIklOUFVUXCIgfHwgZWwudGFnTmFtZSA9PT0gXCJURVhUQVJFQVwiIHx8IGVsLnRhZ05hbWUgPT09IFwiU0VMRUNUXCIpIHJldHVybjtcblxuICAvKiBQMSBcdTIwMTQgU1x1MDBFOWxlY3RldXJzIG11bHRpcGxlcyAqL1xuICB2YXIgc2VsZWN0b3JzID0gZ2VuZXJhdGVTZWxlY3RvcnMoZWwpO1xuICB2YXIgbGFiZWwgPSAoZWwuaW5uZXJUZXh0IHx8IGVsLnZhbHVlIHx8IGVsLmdldEF0dHJpYnV0ZShcImFyaWEtbGFiZWxcIikgfHwgXCJcIikudHJpbSgpLnNsaWNlKDAsIDUwKTtcblxuICAvKiBTbmFwc2hvdCBBVkFOVCBsJ2FjdGlvbiBcdTIwMTQgaW50ZW50aW9ubmVsIDogb24gY2FwdHVyZSBsJ1x1MDBFOXRhdCBkZSBsYSBwYWdlXG4gICAgIGF1IG1vbWVudCBvXHUwMEY5IGwnYWN0aW9uIGRvaXQgXHUwMEVBdHJlIHJlam91XHUwMEU5ZSAobGUgZHJ5LXJ1biBwYXJ0IGRlIGNldCBcdTAwRTl0YXQpLiAqL1xuICB2YXIgaHRtbFNuYXBzaG90ID0gYW5vbnltaXplSHRtbFNuYXBzaG90KCk7XG4gIHZhciBuZXdTdGVwID0ge1xuICAgIGlkOiBcInN0ZXBfXCIgKyAocmVjb3JkZXJTdGF0ZS5ldGFwZXMubGVuZ3RoICsgMSksXG4gICAgbGFiZWw6IGxhYmVsIHx8IFwiQ2xpY1wiLFxuICAgIGFjdGlvbjogXCJjbGlja1wiLFxuICAgIHNlbGVjdG9yVHlwZTogXCJjc3NcIixcbiAgICBzZWxlY3Rvcjogc2VsZWN0b3JzWzBdLFxuICAgIHNlbGVjdG9yczogc2VsZWN0b3JzLFxuICAgIHZhcmlhYmxlOiBudWxsLFxuICAgIGh0bWxTbmFwc2hvdDogaHRtbFNuYXBzaG90LFxuICAgIHVybDogd2luZG93LmxvY2F0aW9uLmhyZWYsXG4gICAgd2FpdEZvcjogbnVsbCxcbiAgICB0aW1lb3V0OiA1MDAwLFxuICB9O1xuICByZWNvcmRlclN0YXRlLmV0YXBlcy5wdXNoKG5ld1N0ZXApO1xuXG4gIHNhdmVSZWNvcmRlclN0YXRlKCk7XG4gIHVwZGF0ZVJlY29yZGVyUGFuZWwoKTtcbiAgc2hvd1JQQVRvYXN0KFwiXHUyM0ZBIFx1MDBDOXRhcGUgXCIgKyByZWNvcmRlclN0YXRlLmV0YXBlcy5sZW5ndGggKyBcIiBcdTIwMTQgY2xpYyBlbnJlZ2lzdHJcdTAwRTlcIiwgXCJpbmZvXCIpO1xuXG4gIC8qIFAwIFx1MjAxNCBEXHUwMEU5dGVjdGlvbiBhdXRvbWF0aXF1ZSBkdSB3YWl0Rm9yIGFwclx1MDBFOHMgbmF2aWdhdGlvbiBvdSBjaGFuZ2VtZW50IERPTSAqL1xuICB2YXIgdXJsQmVmb3JlID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG4gIHZhciBib2R5U25hcHNob3QgPSBkb2N1bWVudC5ib2R5LmlubmVySFRNTC5sZW5ndGg7XG4gIHZhciBsYXN0U3RlcEFkZGVkID0gbmV3U3RlcDtcbiAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICBpZiAoIXJlY29yZGVyU3RhdGUpIHJldHVybjtcbiAgICBpZiAod2luZG93LmxvY2F0aW9uLmhyZWYgIT09IHVybEJlZm9yZSkge1xuICAgICAgLyogTmF2aWdhdGlvbiBjb21wbFx1MDBFOHRlIFx1MjAxNCBjaGVyY2hlciBsZSBwcmVtaWVyIFx1MDBFOWxcdTAwRTltZW50IGludGVyYWN0aWYgZGUgbGEgbm91dmVsbGUgcGFnZSAqL1xuICAgICAgbGFzdFN0ZXBBZGRlZC53YWl0Rm9yID0gXCJpbnB1dDpub3QoW3R5cGU9aGlkZGVuXSksIHNlbGVjdCwgYnV0dG9uW3R5cGU9c3VibWl0XSwgZm9ybVwiO1xuICAgICAgc2F2ZVJlY29yZGVyU3RhdGUoKTtcbiAgICAgIC8qIE5vdGlmaWNhdGlvbiBjaGFuZ2VtZW50IGRlIHBhZ2UgKi9cbiAgICAgIHNob3dSUEFUb2FzdChcIlx1RDgzRFx1RENDNCBOb3V2ZWxsZSBwYWdlIFx1MjAxNCBjb250aW51ZXogdm90cmUgc2Fpc2llLCBBdWRpQm90IGVucmVnaXN0cmVcIiwgXCJpbmZvXCIpO1xuICAgICAgLyogTWV0dHJlIFx1MDBFMCBqb3VyIGxlIGJhZGdlIGF2ZWMgbGUgY29tcHRldXIgKi9cbiAgICAgIHZhciByZWNCYWRnZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXVkaWJvdC1yZWNvcmRlci1iYWRnZVwiKTtcbiAgICAgIGlmIChyZWNCYWRnZSkge1xuICAgICAgICByZWNCYWRnZS5pbm5lckhUTUwgPSAnPHNwYW4gc3R5bGU9XCJ3aWR0aDoxMHB4O2hlaWdodDoxMHB4O2JhY2tncm91bmQ6d2hpdGU7Ym9yZGVyLXJhZGl1czo1MCU7ZGlzcGxheTppbmxpbmUtYmxvY2s7YW5pbWF0aW9uOnB1bHNlIDFzIGluZmluaXRlO1wiPjwvc3Bhbj4gRW5yZWdpc3RyZW1lbnQgZW4gY291cnMgKCcgKyByZWNvcmRlclN0YXRlLmV0YXBlcy5sZW5ndGggKyAnIFx1MDBFOXRhcGVzKSc7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChNYXRoLmFicyhkb2N1bWVudC5ib2R5LmlubmVySFRNTC5sZW5ndGggLSBib2R5U25hcHNob3QpID4gNTAwKSB7XG4gICAgICAvKiBDaGFuZ2VtZW50IERPTSBzaWduaWZpY2F0aWYgKEFKQVgpICovXG4gICAgICBsYXN0U3RlcEFkZGVkLndhaXRGb3IgPSBcImlucHV0Om5vdChbdHlwZT1oaWRkZW5dKSwgc2VsZWN0LCBidXR0b25bdHlwZT1zdWJtaXRdLCBmb3JtXCI7XG4gICAgICBzYXZlUmVjb3JkZXJTdGF0ZSgpO1xuICAgIH1cbiAgfSwgODAwKTtcbn1cblxuLyogSGFuZGxlciBibHVyIChmaW4gZGUgc2Fpc2llIGRhbnMgdW4gY2hhbXApIFx1MjAxNCBzXHUwMEU5cmlhbGlzXHUwMEU5IHZpYSBxdWV1ZSBwb3VyIFx1MDBFOXZpdGVyIGxlcyByYWNlcyBzdXIgZGV0ZWN0VmFyaWFibGUoKSAqL1xudmFyIHJlY29yZGVyQmx1clF1ZXVlID0gUHJvbWlzZS5yZXNvbHZlKCk7XG5cbmFzeW5jIGZ1bmN0aW9uIG9uUmVjb3JkZXJCbHVyKGUpIHtcbiAgaWYgKCFyZWNvcmRlclN0YXRlKSByZXR1cm47XG4gIHZhciBlbCA9IGUudGFyZ2V0O1xuICBpZiAoIWVsIHx8ICFbXCJJTlBVVFwiLCBcIlRFWFRBUkVBXCJdLmluY2x1ZGVzKGVsLnRhZ05hbWUpKSByZXR1cm47XG4gIGlmICghZWwudmFsdWUgfHwgZWwudmFsdWUubGVuZ3RoIDwgMSkgcmV0dXJuO1xuXG4gIC8qIENhcHR1cmVyIGxlcyB2YWxldXJzIGltbVx1MDBFOWRpYXRlbWVudCAoYXZhbnQgcXVlIGxlIERPTSBjaGFuZ2UpICovXG4gIHZhciBjYXB0dXJlZFZhbHVlID0gZWwudmFsdWU7XG4gIHZhciBjYXB0dXJlZFNlbGVjdG9ycyA9IGdlbmVyYXRlU2VsZWN0b3JzKGVsKTtcbiAgdmFyIGNhcHR1cmVkU2VsZWN0b3IgPSBjYXB0dXJlZFNlbGVjdG9yc1swXTtcbiAgdmFyIGNhcHR1cmVkTGFiZWxFbCA9IGVsLmlkID8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGFiZWxbZm9yPVwiJyArIGVsLmlkICsgJ1wiXScpIDogbnVsbDtcbiAgdmFyIGNhcHR1cmVkTGFiZWwgPSAoY2FwdHVyZWRMYWJlbEVsICYmIGNhcHR1cmVkTGFiZWxFbC50ZXh0Q29udGVudC50cmltKCkpIHx8IGVsLnBsYWNlaG9sZGVyIHx8IGVsLm5hbWUgfHwgXCJDaGFtcFwiO1xuICB2YXIgY2FwdHVyZWRVcmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcblxuICByZWNvcmRlckJsdXJRdWV1ZSA9IHJlY29yZGVyQmx1clF1ZXVlLnRoZW4oYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgaWYgKCFyZWNvcmRlclN0YXRlKSByZXR1cm47XG5cbiAgICB2YXIgdmFyaWFibGUgPSBhd2FpdCBkZXRlY3RWYXJpYWJsZShjYXB0dXJlZFZhbHVlKTtcblxuICAgIC8qIFAwIFx1MjAxNCBEXHUwMEU5ZHVwbGljYXRpb24gOiBzaSBsYSBkZXJuaVx1MDBFOHJlIFx1MDBFOXRhcGUgY2libGUgbGUgbVx1MDBFQW1lIHNcdTAwRTlsZWN0ZXVyIFx1MjE5MiBtaXNlIFx1MDBFMCBqb3VyICovXG4gICAgdmFyIGxhc3RFdGFwZSA9IHJlY29yZGVyU3RhdGUuZXRhcGVzW3JlY29yZGVyU3RhdGUuZXRhcGVzLmxlbmd0aCAtIDFdO1xuICAgIGlmIChsYXN0RXRhcGUgJiYgbGFzdEV0YXBlLmFjdGlvbiA9PT0gXCJmaWxsXCIgJiYgbGFzdEV0YXBlLnNlbGVjdG9yID09PSBjYXB0dXJlZFNlbGVjdG9yKSB7XG4gICAgICBsYXN0RXRhcGUudmFyaWFibGUgPSB2YXJpYWJsZSB8fCBcIltWQUxFVVIgU1RBVElRVUUgXHUyMDE0IFx1MDBDMCBSRU5TRUlHTkVSXVwiO1xuICAgICAgbGFzdEV0YXBlLnNlbGVjdG9ycyA9IGNhcHR1cmVkU2VsZWN0b3JzO1xuICAgICAgc2F2ZVJlY29yZGVyU3RhdGUoKTtcbiAgICAgIHVwZGF0ZVJlY29yZGVyUGFuZWwoKTtcbiAgICAgIC8qIEhpZ2hsaWdodCBsZSBjaGFtcCAqL1xuICAgICAgdmFyIGRlZHVwRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGNhcHR1cmVkU2VsZWN0b3IpO1xuICAgICAgaWYgKGRlZHVwRWwpIGhpZ2hsaWdodFJlY29yZGVkRmllbGQoZGVkdXBFbCwgbGFzdEV0YXBlLnZhcmlhYmxlKTtcbiAgICAgIHNob3dSUEFUb2FzdChcIlx1MjNGQSBcdTAwQzl0YXBlIFwiICsgcmVjb3JkZXJTdGF0ZS5ldGFwZXMubGVuZ3RoICsgXCIgbWlzZSBcdTAwRTAgam91ciBcdTIwMTQgXCIgKyBjYXB0dXJlZExhYmVsLnNsaWNlKDAsIDIwKSwgXCJpbmZvXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8qIFNuYXBzaG90IEFWQU5UIGwnYWN0aW9uIFx1MjAxNCBpbnRlbnRpb25uZWwgOiBvbiBjYXB0dXJlIGwnXHUwMEU5dGF0IGRlIGxhIHBhZ2VcbiAgICAgICBhdSBtb21lbnQgb1x1MDBGOSBsJ2FjdGlvbiBkb2l0IFx1MDBFQXRyZSByZWpvdVx1MDBFOWUgKGxlIGRyeS1ydW4gcGFydCBkZSBjZXQgXHUwMEU5dGF0KS4gKi9cbiAgICB2YXIgaHRtbFNuYXBzaG90ID0gYW5vbnltaXplSHRtbFNuYXBzaG90KCk7XG4gICAgdmFyIG5ld0ZpbGxTdGVwID0ge1xuICAgICAgaWQ6IFwic3RlcF9cIiArIChyZWNvcmRlclN0YXRlLmV0YXBlcy5sZW5ndGggKyAxKSxcbiAgICAgIGxhYmVsOiBjYXB0dXJlZExhYmVsLnNsaWNlKDAsIDUwKSxcbiAgICAgIGFjdGlvbjogXCJmaWxsXCIsXG4gICAgICBzZWxlY3RvclR5cGU6IFwiY3NzXCIsXG4gICAgICBzZWxlY3RvcjogY2FwdHVyZWRTZWxlY3RvcixcbiAgICAgIHNlbGVjdG9yczogY2FwdHVyZWRTZWxlY3RvcnMsXG4gICAgICAvKiBTaSB2YWxldXIgcGF0aWVudCBcdTIxOTIgdmFyaWFibGUgOyBzaW5vbiB2YWxldXIgc3RhdGlxdWUgbWFzcXVcdTAwRTllICovXG4gICAgICB2YXJpYWJsZTogdmFyaWFibGUgfHwgXCJbVkFMRVVSIFNUQVRJUVVFIFx1MjAxNCBcdTAwQzAgUkVOU0VJR05FUl1cIixcbiAgICAgIGh0bWxTbmFwc2hvdDogaHRtbFNuYXBzaG90LFxuICAgICAgdXJsOiBjYXB0dXJlZFVybCxcbiAgICAgIHdhaXRGb3I6IG51bGwsXG4gICAgICB0aW1lb3V0OiA1MDAwLFxuICAgIH07XG4gICAgcmVjb3JkZXJTdGF0ZS5ldGFwZXMucHVzaChuZXdGaWxsU3RlcCk7XG5cbiAgICBzYXZlUmVjb3JkZXJTdGF0ZSgpO1xuICAgIHVwZGF0ZVJlY29yZGVyUGFuZWwoKTtcbiAgICAvKiBIaWdobGlnaHQgbGUgY2hhbXAgKi9cbiAgICB2YXIgZmlsbEVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihjYXB0dXJlZFNlbGVjdG9yKTtcbiAgICBpZiAoZmlsbEVsKSBoaWdobGlnaHRSZWNvcmRlZEZpZWxkKGZpbGxFbCwgbmV3RmlsbFN0ZXAudmFyaWFibGUpO1xuICAgIHNob3dSUEFUb2FzdChcIlx1MjNGQSBcdTAwQzl0YXBlIFwiICsgcmVjb3JkZXJTdGF0ZS5ldGFwZXMubGVuZ3RoICsgXCIgXHUyMDE0IFwiICsgY2FwdHVyZWRMYWJlbC5zbGljZSgwLCAyMCkgKyAodmFyaWFibGUgPyBcIiBcdTIxOTIgXCIgKyB2YXJpYWJsZSA6IFwiIFx1MjE5MiBzdGF0aXF1ZVwiKSwgXCJpbmZvXCIpO1xuICB9KTtcbn1cblxuLyogSGFuZGxlciBjaGFuZ2UgKHNlbGVjdCkgKi9cbmFzeW5jIGZ1bmN0aW9uIG9uUmVjb3JkZXJDaGFuZ2UoZSkge1xuICBpZiAoIXJlY29yZGVyU3RhdGUpIHJldHVybjtcbiAgdmFyIGVsID0gZS50YXJnZXQ7XG4gIGlmIChlbC50YWdOYW1lICE9PSBcIlNFTEVDVFwiKSByZXR1cm47XG5cbiAgLyogUDEgXHUyMDE0IFNcdTAwRTlsZWN0ZXVycyBtdWx0aXBsZXMgKi9cbiAgdmFyIHNlbGVjdG9ycyA9IGdlbmVyYXRlU2VsZWN0b3JzKGVsKTtcbiAgdmFyIHZhcmlhYmxlID0gYXdhaXQgZGV0ZWN0VmFyaWFibGUoZWwudmFsdWUpO1xuICB2YXIgbGFiZWwgPSBlbC5uYW1lIHx8IGVsLmlkIHx8IFwiU1x1MDBFOWxlY3Rpb25cIjtcblxuICAvKiBTbmFwc2hvdCBBVkFOVCBsJ2FjdGlvbiBcdTIwMTQgaW50ZW50aW9ubmVsIDogb24gY2FwdHVyZSBsJ1x1MDBFOXRhdCBkZSBsYSBwYWdlXG4gICAgIGF1IG1vbWVudCBvXHUwMEY5IGwnYWN0aW9uIGRvaXQgXHUwMEVBdHJlIHJlam91XHUwMEU5ZSAobGUgZHJ5LXJ1biBwYXJ0IGRlIGNldCBcdTAwRTl0YXQpLiAqL1xuICB2YXIgaHRtbFNuYXBzaG90ID0gYW5vbnltaXplSHRtbFNuYXBzaG90KCk7XG4gIHZhciBuZXdTZWxlY3RTdGVwID0ge1xuICAgIGlkOiBcInN0ZXBfXCIgKyAocmVjb3JkZXJTdGF0ZS5ldGFwZXMubGVuZ3RoICsgMSksXG4gICAgbGFiZWw6IGxhYmVsLnNsaWNlKDAsIDUwKSxcbiAgICBhY3Rpb246IFwic2VsZWN0XCIsXG4gICAgc2VsZWN0b3JUeXBlOiBcImNzc1wiLFxuICAgIHNlbGVjdG9yOiBzZWxlY3RvcnNbMF0sXG4gICAgc2VsZWN0b3JzOiBzZWxlY3RvcnMsXG4gICAgdmFyaWFibGU6IHZhcmlhYmxlIHx8IGVsLnZhbHVlLFxuICAgIGh0bWxTbmFwc2hvdDogaHRtbFNuYXBzaG90LFxuICAgIHVybDogd2luZG93LmxvY2F0aW9uLmhyZWYsXG4gICAgd2FpdEZvcjogbnVsbCxcbiAgICB0aW1lb3V0OiA1MDAwLFxuICB9O1xuICByZWNvcmRlclN0YXRlLmV0YXBlcy5wdXNoKG5ld1NlbGVjdFN0ZXApO1xuXG4gIHNhdmVSZWNvcmRlclN0YXRlKCk7XG4gIHVwZGF0ZVJlY29yZGVyUGFuZWwoKTtcbiAgaGlnaGxpZ2h0UmVjb3JkZWRGaWVsZChlbCwgbmV3U2VsZWN0U3RlcC52YXJpYWJsZSk7XG4gIHNob3dSUEFUb2FzdChcIlx1MjNGQSBcdTAwQzl0YXBlIFwiICsgcmVjb3JkZXJTdGF0ZS5ldGFwZXMubGVuZ3RoICsgXCIgXHUyMDE0IHNcdTAwRTlsZWN0aW9uIFwiICsgbGFiZWwuc2xpY2UoMCwgMjApICsgKHZhcmlhYmxlID8gXCIgXHUyMTkyIFwiICsgdmFyaWFibGUgOiBcIlwiKSwgXCJpbmZvXCIpO1xufVxuXG4vKiBTYXV2ZWdhcmRlciBsJ1x1MDBFOXRhdCBkdSByZWNvcmRlciBkYW5zIGNocm9tZS5zdG9yYWdlIGFwclx1MDBFOHMgY2hhcXVlIFx1MDBFOXRhcGUgKi9cbmZ1bmN0aW9uIHNhdmVSZWNvcmRlclN0YXRlKCkge1xuICBpZiAoIXJlY29yZGVyU3RhdGUpIHJldHVybjtcbiAgLyogRXhjbHVyZSBsZXMgaHRtbFNuYXBzaG90IGR1IHN0b3JhZ2UgbG9jYWwgKHRyb3AgbG91cmRzLCBsaW1pdGUgMTBNQiBDaHJvbWUpLlxuICAgICBMZXMgc25hcHNob3RzIHJlc3RlbnQgZW4gbVx1MDBFOW1vaXJlIGRhbnMgcmVjb3JkZXJTdGF0ZS5ldGFwZXNcbiAgICAgZXQgc29udCBlbnZveVx1MDBFOXMgYXUgc2VydmV1ciB1bmlxdWVtZW50IGxvcnMgZHUgc3RvcFJlY29yZGVyKCkuICovXG4gIHZhciBldGFwZXNTYW5zSHRtbCA9IHJlY29yZGVyU3RhdGUuZXRhcGVzLm1hcChmdW5jdGlvbihlKSB7XG4gICAgdmFyIGNvcHkgPSBPYmplY3QuYXNzaWduKHt9LCBlKTtcbiAgICBkZWxldGUgY29weS5odG1sU25hcHNob3Q7XG4gICAgcmV0dXJuIGNvcHk7XG4gIH0pO1xuICB2YXIgcGFnZXMgPSBbXTtcbiAgdmFyIHNlZW5VcmxzID0ge307XG4gIGZvciAodmFyIHBpID0gMDsgcGkgPCByZWNvcmRlclN0YXRlLmV0YXBlcy5sZW5ndGg7IHBpKyspIHtcbiAgICB2YXIgdSA9IHJlY29yZGVyU3RhdGUuZXRhcGVzW3BpXS51cmw7XG4gICAgaWYgKHUgJiYgIXNlZW5VcmxzW3VdKSB7IHNlZW5VcmxzW3VdID0gdHJ1ZTsgcGFnZXMucHVzaCh1KTsgfVxuICB9XG4gIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7IGF1ZGlib3RfcmVjb3JkZXI6IHtcbiAgICBhY3RpdmU6IHRydWUsXG4gICAgZXRhcGVzOiBldGFwZXNTYW5zSHRtbCxcbiAgICBob3N0bmFtZTogcmVjb3JkZXJTdGF0ZS5ob3N0bmFtZSxcbiAgICBzdGFydFRpbWU6IHJlY29yZGVyU3RhdGUuc3RhcnRUaW1lLFxuICAgIHBhZ2VzOiBwYWdlcyxcbiAgfX0pO1xufVxuXG4vKiBSZXN0YXVyZXIgbGUgcmVjb3JkZXIgc2kgdW5lIG5hdmlnYXRpb24gYSBldSBsaWV1IHBlbmRhbnQgbCdlbnJlZ2lzdHJlbWVudCAqL1xuZnVuY3Rpb24gcmVzdG9yZVJlY29yZGVySWZOZWVkZWQoKSB7XG4gIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbXCJhdWRpYm90X3JlY29yZGVyXCJdLCBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICB2YXIgc2F2ZWQgPSByZXN1bHQuYXVkaWJvdF9yZWNvcmRlcjtcbiAgICBpZiAoIXNhdmVkIHx8ICFzYXZlZC5hY3RpdmUpIHJldHVybjtcblxuICAgIC8qIFJlY29yZGVyIGFjdGlmIGRhbnMgbGUgc3RvcmFnZSBtYWlzIHBhcyBlbiBtXHUwMEU5bW9pcmUgXHUyMTkyIHJlc3RhdXJlci5cbiAgICAgICBOb3RlOiBsZXMgaHRtbFNuYXBzaG90IG5lIHNvbnQgcGFzIHJlc3RhdXJcdTAwRTlzIGFwclx1MDBFOHMgbmF2aWdhdGlvbiAobm9uIHN0b2NrXHUwMEU5cyBsb2NhbGVtZW50KS5cbiAgICAgICBTZXVsZXMgbGVzIFx1MDBFOXRhcGVzIHNhbnMgc25hcHNob3Qgc29udCByXHUwMEU5Y3VwXHUwMEU5clx1MDBFOWVzIFx1MjAxNCBsZXMgc25hcHNob3RzIEhUTUwgc29udCBlbnZveVx1MDBFOXNcbiAgICAgICBhdSBzZXJ2ZXVyIFx1MDBFMCBsYSBmaW4gZGUgbCdlbnJlZ2lzdHJlbWVudCB1bmlxdWVtZW50LiAqL1xuICAgIHJlY29yZGVyU3RhdGUgPSB7XG4gICAgICBldGFwZXM6IHNhdmVkLmV0YXBlcyB8fCBbXSxcbiAgICAgIGhvc3RuYW1lOiBzYXZlZC5ob3N0bmFtZSB8fCB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUucmVwbGFjZShcInd3dy5cIiwgXCJcIiksXG4gICAgICBzdGFydFRpbWU6IHNhdmVkLnN0YXJ0VGltZSB8fCBEYXRlLm5vdygpLFxuICAgIH07XG5cbiAgICAvKiBSXHUwMEU5LWFmZmljaGVyIGxlIGJhZGdlICovXG4gICAgaWYgKCFkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF1ZGlib3QtcmVjb3JkZXItYmFkZ2VcIikpIHtcbiAgICAgIHZhciBiYWRnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICBiYWRnZS5pZCA9IFwiYXVkaWJvdC1yZWNvcmRlci1iYWRnZVwiO1xuICAgICAgYmFkZ2Uuc3R5bGUuY3NzVGV4dCA9IFwicG9zaXRpb246Zml4ZWQ7dG9wOjIwcHg7bGVmdDo1MCU7dHJhbnNmb3JtOnRyYW5zbGF0ZVgoLTUwJSk7ei1pbmRleDoyMTQ3NDgzNjQ3O2JhY2tncm91bmQ6I2VmNDQ0NDtjb2xvcjp3aGl0ZTtwYWRkaW5nOjhweCAyMHB4O2JvcmRlci1yYWRpdXM6NTBweDtmb250LWZhbWlseTpzYW5zLXNlcmlmO2ZvbnQtc2l6ZToxM3B4O2ZvbnQtd2VpZ2h0OmJvbGQ7Ym94LXNoYWRvdzowIDRweCAxNXB4IHJnYmEoMCwwLDAsMC4zKTtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7XCI7XG4gICAgICBiYWRnZS5pbm5lckhUTUwgPSAnPHNwYW4gc3R5bGU9XCJ3aWR0aDoxMHB4O2hlaWdodDoxMHB4O2JhY2tncm91bmQ6d2hpdGU7Ym9yZGVyLXJhZGl1czo1MCU7ZGlzcGxheTppbmxpbmUtYmxvY2s7YW5pbWF0aW9uOnB1bHNlIDFzIGluZmluaXRlO1wiPjwvc3Bhbj4gRW5yZWdpc3RyZW1lbnQgZW4gY291cnMgKCcgKyByZWNvcmRlclN0YXRlLmV0YXBlcy5sZW5ndGggKyAnIFx1MDBFOXRhcGVzKSBcdTIwMTQgY29udGludWV6IGxlIHBhcmNvdXJzJztcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYmFkZ2UpO1xuICAgIH1cblxuICAgIC8qIFJcdTAwRTktYXR0YWNoZXIgbGVzIGxpc3RlbmVycyAqL1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBvblJlY29yZGVyQ2xpY2ssIHRydWUpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgb25SZWNvcmRlckNoYW5nZSwgdHJ1ZSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImJsdXJcIiwgb25SZWNvcmRlckJsdXIsIHRydWUpO1xuXG4gICAgLyogUlx1MDBFOS1hZmZpY2hlciBsZSBwYW5uZWF1IGd1aWRcdTAwRTkgKi9cbiAgICBzaG93UmVjb3JkZXJQYW5lbCgpO1xuICAgIHVwZGF0ZVJlY29yZGVyUGFuZWwoKTtcblxuICAgIHNob3dSUEFUb2FzdChcIlx1MjNGQSBFbnJlZ2lzdHJlbWVudCByZXByaXMgKFwiICsgcmVjb3JkZXJTdGF0ZS5ldGFwZXMubGVuZ3RoICsgXCIgXHUwMEU5dGFwZXMgZFx1MDBFOWpcdTAwRTAgZW5yZWdpc3RyXHUwMEU5ZXMpXCIsIFwiaW5mb1wiKTtcbiAgfSk7XG59XG5cbi8qIFx1MDBDOWNvdXRlciBsZXMgbWVzc2FnZXMgZHUgcG9wdXAgKi9cbmNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihmdW5jdGlvbihtc2cpIHtcbiAgaWYgKG1zZyAmJiBtc2cudHlwZSA9PT0gXCJBVURJQk9UX1JFQ09SREVSX1NUQVJUXCIpIHN0YXJ0UmVjb3JkZXIoKTtcbiAgaWYgKG1zZyAmJiBtc2cudHlwZSA9PT0gXCJBVURJQk9UX1JFQ09SREVSX1NUT1BcIikgc3RvcFJlY29yZGVyKCk7XG4gIGlmIChtc2cgJiYgbXNnLnR5cGUgPT09IFwiQVVESUJPVF9SRUNPUkRFUl9TVEFUVVNcIikge1xuICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHsgdHlwZTogXCJBVURJQk9UX1JFQ09SREVSX1NUQVRVU19SRVBMWVwiLCBhY3RpdmU6ICEhcmVjb3JkZXJTdGF0ZSwgZXRhcGVzOiByZWNvcmRlclN0YXRlID8gcmVjb3JkZXJTdGF0ZS5ldGFwZXMubGVuZ3RoIDogMCB9KTtcbiAgfVxufSk7XG5cbi8qIHJlc3RvcmVCb3RJZk5lZWRlZCBcdTIwMTQgZFx1MDBFOXNhY3Rpdlx1MDBFOSAqL1xuXG4vKiBcdTI1MDBcdTI1MDAgRmluIE1hY3JvIFJlY29yZGVyIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuXG4vKiBcdTI1MDBcdTI1MDAgRXhwb3NlIGxlcyBmb25jdGlvbnMgdXRpbGl0YWlyZXMgcG91ciBsZXMgcG9ydGFpbHMgbW9kdWxhaXJlcyBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cbmdsb2JhbFRoaXMudWx0cmFGaWxsID0gdWx0cmFGaWxsO1xuZ2xvYmFsVGhpcy51bHRyYUZpbGxXaXRoUmV0cnkgPSB1bHRyYUZpbGxXaXRoUmV0cnk7XG5nbG9iYWxUaGlzLmZpbmRFbGVtZW50ID0gZmluZEVsZW1lbnQ7XG5nbG9iYWxUaGlzLmNhcGl0YWxpemUgPSB0eXBlb2YgY2FwaXRhbGl6ZSA9PT0gJ2Z1bmN0aW9uJyA/IGNhcGl0YWxpemUgOiBmdW5jdGlvbihzKSB7IHJldHVybiBzID8gcy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHMuc2xpY2UoMSkudG9Mb3dlckNhc2UoKSA6IFwiXCI7IH07XG5nbG9iYWxUaGlzLmdldE91dnJhbnREcm9pdE5TUyA9IGdldE91dnJhbnREcm9pdE5TUztcbmdsb2JhbFRoaXMuaXNVbmRlcjE4ID0gaXNVbmRlcjE4O1xuZ2xvYmFsVGhpcy5ub3JtYWxpemVQaG9uZSA9IG5vcm1hbGl6ZVBob25lO1xuZ2xvYmFsVGhpcy5zZWxlY3RSYWRpeE9wdGlvbiA9IHNlbGVjdFJhZGl4T3B0aW9uO1xuZ2xvYmFsVGhpcy5maWxsRGF0ZVBpY2tlciA9IGZpbGxEYXRlUGlja2VyO1xuZ2xvYmFsVGhpcy5zbWFydFNlbGVjdE9wdGlvbiA9IHNtYXJ0U2VsZWN0T3B0aW9uO1xuZ2xvYmFsVGhpcy5maW5kSW5TaGFkb3dSb290cyA9IGZpbmRJblNoYWRvd1Jvb3RzO1xuZ2xvYmFsVGhpcy5xdWVyeVNlbGVjdG9yQWxsRGVlcCA9IHF1ZXJ5U2VsZWN0b3JBbGxEZWVwO1xuZ2xvYmFsVGhpcy53YWl0Rm9yRWxlbWVudCA9IHdhaXRGb3JFbGVtZW50O1xuZ2xvYmFsVGhpcy52YWxpZGF0ZUx1aG5OU1MgPSB2YWxpZGF0ZUx1aG5OU1M7XG5nbG9iYWxUaGlzLnNob3dSUEFUb2FzdCA9IHNob3dSUEFUb2FzdDtcbmdsb2JhbFRoaXMuZGV0ZWN0UGFnZUNvbnRleHQgPSBkZXRlY3RQYWdlQ29udGV4dDtcbmdsb2JhbFRoaXMuY2hlY2tEcm9pdHNNdXR1ZWxsZSA9IGNoZWNrRHJvaXRzTXV0dWVsbGU7XG5nbG9iYWxUaGlzLnNhdmVTZWxlY3RvckNhY2hlID0gc2F2ZVNlbGVjdG9yQ2FjaGU7XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7QUFBQSxNQUFPLHFCQUFRO0FBQUEsSUFDYixNQUFNO0FBQUEsSUFDTixT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QUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBO0FBQUEsTUFHQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUE7QUFBQSxNQUdBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQTtBQUFBLE1BR0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBO0FBQUEsTUFHQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUE7QUFBQSxNQUdBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQTtBQUFBLE1BR0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQTtBQUFBLE1BR0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxN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Q2hFLFFBQUksT0FBTyxJQUFJLFNBQVMsd0JBQXlCLGNBQWE7QUFDOUQsUUFBSSxPQUFPLElBQUksU0FBUywyQkFBMkI7QUFDakQsYUFBTyxRQUFRLFlBQVksRUFBRSxNQUFNLGlDQUFpQyxRQUFRLENBQUMsQ0FBQyxlQUFlLFFBQVEsZ0JBQWdCLGNBQWMsT0FBTyxTQUFTLEVBQUUsQ0FBQztBQUFBLElBQ3hKO0FBQUEsRUFDRixDQUFDO0FBT0QsYUFBVyxZQUFZQztBQUN2QixhQUFXLHFCQUFxQjtBQUNoQyxhQUFXLGNBQWNDO0FBQ3pCLGFBQVcsYUFBYSxPQUFPQyxnQkFBZSxhQUFhQSxjQUFhLFNBQVMsR0FBRztBQUFFLFdBQU8sSUFBSSxFQUFFLE9BQU8sQ0FBQyxFQUFFLFlBQVksSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFLFlBQVksSUFBSTtBQUFBLEVBQUk7QUFDNUosYUFBVyxxQkFBcUJDO0FBQ2hDLGFBQVcsWUFBWUM7QUFDdkIsYUFBVyxpQkFBaUJDO0FBQzVCLGFBQVcsb0JBQW9CQztBQUMvQixhQUFXLGlCQUFpQjtBQUM1QixhQUFXLG9CQUFvQkM7QUFDL0IsYUFBVyxvQkFBb0I7QUFDL0IsYUFBVyx1QkFBdUI7QUFDbEMsYUFBVyxpQkFBaUJDO0FBQzVCLGFBQVcsa0JBQWtCO0FBQzdCLGFBQVcsZUFBZVQ7QUFDMUIsYUFBVyxvQkFBb0I7QUFDL0IsYUFBVyxzQkFBc0JVO0FBQ2pDLGFBQVcsb0JBQW9COyIsCiAgIm5hbWVzIjogWyJtIiwgIm8iLCAiYyIsICJwMCIsICJkeENvbWJvRmlsbCIsICJpIiwgIlBPUlRBTF9LRVkiLCAiUE9SVEFMX0tFWSIsICJQT1JUQUxfS0VZIiwgIkNPTkZJR1MiLCAibG9hZFJlbW90ZVNlbGVjdG9ycyIsICJmaW5kRWxlbWVudFdpdGhPdmVycmlkZSIsICJpbml0RmllbGRGZWVkYmFjayIsICJmaW5kRWxlbWVudFRyYWNrZWQiLCAidHJhY2tGaWxsUmVzdWx0IiwgImNoZWNrQW5kUmVwYWlyU2VsZWN0b3JzIiwgImxvYWRSZWplY3Rpb25Nb2RlbCIsICJwcmVkaWN0UmVqZWN0aW9uUmlzayIsICJzaG93UmVqZWN0aW9uUmlza0Jhbm5lciIsICJjcmVhdGVDb21tYW5kQ2VudGVyIiwgImZpbmRFbGVtZW50IiwgIndhaXRGb3JFbGVtZW50IiwgImNhcGl0YWxpemUiLCAibm9ybWFsaXplUGhvbmUiLCAiZ2V0Q2FjaGVkQ2xpZW50IiwgInVsdHJhRmlsbCIsICJzbWFydFNlbGVjdE9wdGlvbiIsICJzZWxlY3RSYWRpeE9wdGlvbiIsICJzbWFydEZpbGxGaWVsZCIsICJtYXJrRmlsbGVkQnlBdWRpQm90IiwgInNob3dSUEFUb2FzdCIsICJwZXJmb3JtU21hcnRGaWxsIiwgImVsIiwgImJlc3RGaWVsZCIsICJ2YWx1ZSIsICJiZXN0U2NvcmUiLCAiY2FjaGVkRmllbGQiLCAibWFya0ZpbGxlZEJ5QXVkaUJvdCIsICJzbWFydEZpbGxGaWVsZCIsICJjaGVja0Ryb2l0c011dHVlbGxlIiwgIkNPTkZJR1MiLCAiZ2V0T3V2cmFudERyb2l0TlNTIiwgImNhcGl0YWxpemUiLCAiZmluZEVsZW1lbnQiLCAic21hcnRTZWxlY3RPcHRpb24iLCAidWx0cmFGaWxsIiwgImNoZWNrRHJvaXRzTXV0dWVsbGUiLCAic2hvd1JQQVRvYXN0IiwgImlzVW5kZXIxOCIsICJzaG93UlBBVG9hc3QiLCAicGVyZm9ybVNtYXJ0RmlsbCIsICJDT05GSUdTIiwgInNob3dSUEFUb2FzdCIsICJ1bHRyYUZpbGwiLCAiZmluZEVsZW1lbnQiLCAiY2FwaXRhbGl6ZSIsICJnZXRPdXZyYW50RHJvaXROU1MiLCAiaXNVbmRlcjE4IiwgIm5vcm1hbGl6ZVBob25lIiwgInNlbGVjdFJhZGl4T3B0aW9uIiwgInNtYXJ0U2VsZWN0T3B0aW9uIiwgIndhaXRGb3JFbGVtZW50IiwgImNoZWNrRHJvaXRzTXV0dWVsbGUiXQp9Cg==
