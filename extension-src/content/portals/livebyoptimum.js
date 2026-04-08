const LBO_SELECTORS = {
  nom: '[name="infos_client[nom]"]',
  prenom: '[name="infos_client[prenom]"]',
  dob: '[name="infos_client[date_naissance]"]',
  nss: '[name="infos_client[num_ss]"]',
  cle: '[name="infos_client[cle_ss]"]',
  phone: '#telephone_form_client_5',
  email: '[name="infos_client[email]"]',
  address: '[name="infos_client[adresse][ligne_1]"]',
  zip: '[name="infos_client[adresse][code_postal]"]',
  city: '[name="infos_client[adresse][ville]"]',
  nomAssure: '[name="infos_client[nom_assure]"]',
  rangNaissance: '[name="infos_client[rang_naissance]"]',
  isAstigmate: '[name="infos_client[is_astigmate]"]'
};

export default {
  name: "LivebyOptimum",
  isMatch: () => window.location.hostname.includes("livebyoptimum.com"),
  selectors: LBO_SELECTORS,
  actions: {
    formulaire: (data) => {
      /* Champ recherche client (page accueil / barre de recherche) */
      const searchInput = findElement('#input_recherche_client');
      const formCheck = findElement(LBO_SELECTORS.nom);

      if (searchInput && !formCheck) {
        const m = data.m || {};
        const o = data.o || {};
        const c = data.cached || {};
        const p0 = (m.personnes && m.personnes.length > 0) ? m.personnes[0] : {};
        const nom = (m.nom || p0.nom || o.nomPatient || c.nom || "").toUpperCase();
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
      const p0 = (m.personnes && m.personnes.length > 0) ? m.personnes[0] : {};

      const rawNSS = m.numeroSecuriteSociale || p0.numeroSecuriteSociale || c.nss || "";
      const dob = m.dateNaissance || p0.dateNaissance || o.dateNaissancePatient || c.dob || "";
      const nss = getOuvrantDroitNSS(rawNSS, dob, m.personnes);

      const mapping = {
        'infos_client[civilite_type_id]': nss.startsWith('1') ? '1' : (nss.startsWith('2') ? '2' : '0'),
        'infos_client[nom]': (m.nom || p0.nom || o.nomPatient || c.nom || "").toUpperCase(),
        'infos_client[prenom]': capitalize(m.prenom || p0.prenom || o.prenomPatient || c.prenom || ""),
        'infos_client[date_naissance]': dob,
        'infos_client[num_ss]': nss.slice(0, 13),
        'infos_client[cle_ss]': nss.slice(13, 15),
        'infos_client[email]': c.email || "",
        'infos_client[adresse][ligne_1]': c.address || "",
        'infos_client[adresse][code_postal]': c.zipCode || "",
        'infos_client[adresse][ville]': c.city || "",
        'infos_client[nom_assure]': c.nomAssure || "",
        'infos_client[rang_naissance]': c.rangNaissance || ""
      };

      for (const [name, val] of Object.entries(mapping)) {
        if (val) ultraFill(findElement(`[name="${name}"]`), val);
      }

      /* Téléphone portable via intl-tel-input (champ visible #telephone_form_client_5) */
      var phoneVal = normalizePhone(c.phone || "");
      if (phoneVal) {
        var phoneEl = findElement('#telephone_form_client_5');
        if (phoneEl) ultraFill(phoneEl, phoneVal);
      }

      const sph = o.lunettesOD?.sphere || o.lentillesOD?.sphere;
      const cyl = o.lunettesOD?.cylindre || o.lentillesOD?.cylindre;
      if (sph) {
        const isMyope = parseFloat(sph.replace(',', '.')) < 0;
        const mEl = findElement('[name="infos_client[is_myope]"]');
        if (mEl && mEl.checked !== isMyope) mEl.click();
        const hEl = findElement('[name="infos_client[is_hypermetrope]"]');
        if (hEl && hEl.checked !== !isMyope) hEl.click();
      }

      /* Astigmate : coché si cylindre non nul */
      if (cyl) {
        const cylVal = parseFloat(cyl.replace(',', '.'));
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
        expiresAt: Date.now() + 60 * 60 * 1000
      };

      /* Scrape des prescriptions */
      var prescription = {};
      var prescTab = document.querySelector('#nav-tab-prescriptions');
      if (prescTab) {
        var prescLis = prescTab.querySelectorAll('li');
        for (var pi = 0; pi < prescLis.length; pi++) {
          var li = prescLis[pi];
          var content = li.querySelector('.line_content');
          if (!content) continue;
          var text = content.textContent.trim();

          if (li.querySelector('.prescripteur')) {
            var parts = text.split(' - ');
            prescription.prescripteur = parts[0] ? parts[0].trim() : '';
            prescription.rpps = parts[1] ? parts[1].trim() : '';
          }
          if (li.querySelector('.renouvellement') && !li.classList.contains('hidden')) {
            var dateMatch = text.match(/(\d{2}\/\d{2}\/\d{4})/);
            prescription.datePrescription = dateMatch ? dateMatch[1] : '';
            prescription.typeVision = text.replace(dateMatch ? dateMatch[0] : '', '').replace(/du\s*$/, '').replace(/\s+/g, ' ').trim();
          }
          if (li.querySelector('.fa-eye') && !li.classList.contains('hidden')) {
            var corrMatch = text.match(/^(OD|OG)\s*:\s*([+-]?\d+[\.,]\d+)\s*\(([+-]?\d+[\.,]\d+)\)\s*(\d+)°\s*ADD:\s*([+-]?\d+[\.,]\d+)/);
            if (corrMatch) {
              var oeil = corrMatch[1].toLowerCase();
              prescription[oeil] = {
                sphere: corrMatch[2].replace(',', '.'),
                cylindre: corrMatch[3].replace(',', '.'),
                axe: corrMatch[4],
                addition: corrMatch[5].replace(',', '.'),
              };
            }
          }
          if (li.querySelector('.icon-contacts') && !li.classList.contains('hidden')) {
            var lentMatch = text.match(/^(OD|OG)\s*:\s*([+-]?\d+[\.,]\d+)\s*\(([+-]?\d+[\.,]\d+)\)\s*(\d+)°\s*ADD:\s*([+-]?\d+[\.,]\d+)/);
            if (lentMatch) {
              var oeilL = 'lentilles' + lentMatch[1];
              prescription[oeilL] = {
                sphere: lentMatch[2].replace(',', '.'),
                cylindre: lentMatch[3].replace(',', '.'),
                axe: lentMatch[4],
                addition: lentMatch[5].replace(',', '.'),
              };
            }
          }
        }
      }
      client.prescription = prescription;

      /* Scrape des régimes (RO + RC) */
      var regimes = {};
      /* RO */
      var roNomEl = findElement('#regime_obligatoire_nom');
      if (roNomEl && roNomEl.value) {
        regimes.ro = {
          nom: roNomEl.value,
          codeRegime: (findElement('#ro_code_regime') || {}).value || '',
          codeCentre: (findElement('#code_centre') || {}).value || '',
          tauxPEC: (findElement('#taux_pec_ro') || {}).value || '',
        };
      }
      /* RC1 */
      var rc1NomEl = findElement('#regime_complementaire_1');
      if (rc1NomEl && rc1NomEl.value) {
        regimes.rc1 = {
          nom: rc1NomEl.value,
          numeroAdherent: (findElement('#no_adherent_rc_1') || {}).value || '',
          numeroContrat: (findElement('#no_contrat_rc_1') || {}).value || '',
          numeroTeletransmission: (findElement('input[name="infos_regime[numero_teletransmission_1]"]') || {}).value || '',
          critereSecondaire: (findElement('#critere_secondaire') || {}).value || '',
          codeConvention: (findElement('#code_convention') || {}).value || '',
          dateDebut: (findElement('#date_debut_rc_1') || {}).value || '',
          dateFin: (findElement('#date_fin_rc_1') || {}).value || '',
        };
      }
      /* RC2 */
      var rc2NomEl = findElement('#regime_complementaire_2');
      if (rc2NomEl && rc2NomEl.value) {
        regimes.rc2 = {
          nom: rc2NomEl.value,
          numeroAdherent: (findElement('#no_adherent_rc_2') || {}).value || '',
          numeroContrat: (findElement('#no_contrat_rc_2') || {}).value || '',
          numeroTeletransmission: (findElement('input[name="infos_regime[numero_teletransmission_2]"]') || {}).value || '',
        };
      }
      if (regimes.ro || regimes.rc1 || regimes.rc2) {
        client.regimes = regimes;
      }

      /* Scrape des équipements de la proposition */
      var equipements = [];
      var offres = document.querySelectorAll('.offre.accordion');
      for (var oi = 0; oi < offres.length; oi++) {
        var offre = offres[oi];
        var offreId = offre.getAttribute('data-offre_id') || '';
        var eqType = offre.getAttribute('data-equipement_type_id') || '';
        var noEq = offre.getAttribute('data-no_equipement_offre_commerciale') || '';

        /* Correction visuelle depuis le badge */
        var corrLabel = offre.querySelector('.label-info');
        var correction = corrLabel ? corrLabel.textContent.trim() : '';

        /* Type vision */
        var visionBtn = offre.querySelector('.dropdown-select-text');
        var vision = visionBtn ? visionBtn.textContent.trim() : '';

        /* Lignes de détail */
        var lignes = [];
        var rows = offre.querySelectorAll('.table-conseiller tbody tr[data-offre_detail_id]');
        for (var ri = 0; ri < rows.length; ri++) {
          var row = rows[ri];
          var typeId = row.getAttribute('data-offre_detail_type_id') || '';
          var oeil = row.getAttribute('data-oeil_offre_detail') || '';
          var classe = row.getAttribute('data-classe_offre_detail') || '';
          var desig = row.querySelector('.designation_article');
          var lppEl = row.querySelector('.detail_code_lpp');

          lignes.push({
            type: typeId === '3' ? 'monture' : typeId === '1' ? 'verre' : typeId === '2' ? 'supplement' : typeId,
            oeil: oeil === '1' ? 'OD' : oeil === '2' ? 'OG' : 'les deux',
            classe: classe,
            designation: desig ? desig.textContent.trim().replace(/\s+/g, ' ') : '',
            codeLPP: lppEl ? (lppEl.getAttribute('data-code_lpp') || '').trim() : '',
            prixBrut: parseFloat((row.querySelector('.prix_vente_applique')?.textContent || '0').replace(/[^\d,.-]/g, '').replace(',', '.')) || 0,
            remise: parseFloat((row.querySelector('.modif_montant_remise')?.textContent || '0').replace(/[^\d,.-]/g, '').replace(',', '.')) || 0,
            prixNet: parseFloat((row.querySelector('.modif_prix_vente_remise')?.textContent || '0').replace(/[^\d,.-]/g, '').replace(',', '.')) || 0,
            ro: parseFloat((row.querySelector('.montant_pec_ro')?.textContent || '0').replace(/[^\d,.-]/g, '').replace(',', '.')) || 0,
            rc1: parseFloat((row.querySelector('[class*="montant_pec_rc_1"]')?.textContent || '0').replace(/[^\d,.-]/g, '').replace(',', '.')) || 0,
            rac: parseFloat((row.querySelector('.total_ligne_rac')?.textContent || '0').replace(/[^\d,.-]/g, '').replace(',', '.')) || 0,
          });
        }

        /* Totaux */
        var foot = offre.querySelector('.table-conseiller tfoot');
        var totaux = {};
        if (foot) {
          totaux = {
            brut: parseFloat((foot.querySelector('.total_brut')?.textContent || '0').replace(/[^\d,.-]/g, '').replace(',', '.')) || 0,
            remise: parseFloat((foot.querySelector('.total_remise')?.textContent || '0').replace(/[^\d,.-]/g, '').replace(',', '.')) || 0,
            net: parseFloat((foot.querySelector('.total_net')?.textContent || '0').replace(/[^\d,.-]/g, '').replace(',', '.')) || 0,
            ro: parseFloat((foot.querySelector('.total_ro')?.textContent || '0').replace(/[^\d,.-]/g, '').replace(',', '.')) || 0,
            rc1: parseFloat((foot.querySelector('[class*="total_rc_1"]')?.textContent || '0').replace(/[^\d,.-]/g, '').replace(',', '.')) || 0,
            rac: parseFloat((foot.querySelector('.total_rac')?.textContent || '0').replace(/[^\d,.-]/g, '').replace(',', '.')) || 0,
          };
        }

        equipements.push({
          offreId: offreId,
          numero: noEq,
          type: eqType === '1' ? 'lunettes' : eqType === '2' ? 'lentilles' : eqType,
          correction: correction,
          vision: vision,
          lignes: lignes,
          totaux: totaux,
        });
      }

      /* Totaux proposition */
      var totalProp = parseFloat((document.querySelector('.total_net_proposition')?.textContent || '0').replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
      var racProp = parseFloat((document.querySelector('.total_rac_proposition')?.textContent || '0').replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;

      client.equipements = equipements;
      client.totalProposition = totalProp;
      client.racProposition = racProp;

      if (!client.nom && !client.nss && equipements.length === 0) return false;

      return new Promise((resolve) => {
        chrome.storage.local.get(['audibot_cache'], (result) => {
          const existing = (result.audibot_cache || {}).current || {};
          chrome.storage.local.set({
            audibot_cache: { current: { ...existing, ...client } }
          }, () => resolve(true));
        });
      });
    }
  }
};
