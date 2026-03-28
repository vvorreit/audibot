export default {
  name: "TP Plus",
  isMatch: () => window.location.hostname.includes("optique-tpplus") || (window.location.hostname.includes("santeclair.fr") && window.location.pathname.includes("/tp-plus")),
  actions: {
    formulaire: (data) => {
      /* Étape 1 — Identité du patient (Angular Material stepper) */
      var nomEl = findElement('[formcontrolname="nom"]:not([disabled])') || findElement('#mat-input-0');
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
          if (personnes[i].dateNaissance) { foundDOB = personnes[i].dateNaissance; break; }
        }
      }
      var dob = foundDOB || o.dateNaissancePatient || c.dob || "";
      var phone = normalizePhone(c.phone || m.telephone || "");
      var mutuelle = m.organisme || c.mutuelle || c.organisme || "";
      var numAdherent = m.numeroAdherent || c.numeroAdherent || (c.regimes && c.regimes.rc1 && c.regimes.rc1.numeroAdherent) || "";

      /* Fonction pour remplir les champs une fois l'assureur résolu
         (appelée soit après l'autocomplete, soit immédiatement si pas de mutuelle) */
      var fillFields = function() {
        /* N° CONTRAT — apparaît dynamiquement après sélection assureur */
        if (numAdherent) {
          var contratEl = findElement('[formcontrolname="numeroContratAmc"]');
          if (contratEl && !contratEl.disabled) ultraFill(contratEl, numAdherent);
        }

        /* Bénéficiaire */
        ultraFill(findElement('[formcontrolname="nom"]:not([disabled])'), nom.toUpperCase());
        ultraFill(findElement('[formcontrolname="prenom"]:not([disabled])'), capitalize(prenom));

        /* Date de naissance — normaliser en DD/MM/YYYY pour le datepicker Angular */
        if (dob) {
          var d = String(dob).replace(/\D/g, "");
          var dobFmt = dob;
          if (d.length === 8) {
            dobFmt = (parseInt(d.slice(0,4)) > 1900)
              ? d.slice(6,8) + "/" + d.slice(4,6) + "/" + d.slice(0,4)
              : d.slice(0,2) + "/" + d.slice(2,4) + "/" + d.slice(4,8);
          }
          ultraFill(findElement('[formcontrolname="dateNaissance"]'), dobFmt);
        }

        /* Téléphone */
        if (phone) {
          ultraFill(findElement('[formcontrolname="telephone"]'), phone);
        }

        /* Nature du dossier — lunettes (1) ou lentilles (2) */
        var hasLentilles = (o.lentillesOD && o.lentillesOD.sphere) || (o.lentillesOG && o.lentillesOG.sphere)
          || o.typePrescription === "lentilles";
        var radioVal = hasLentilles ? "2" : "1";
        var radios = document.querySelectorAll('input.mdc-radio__native-control');
        for (var ri = 0; ri < radios.length; ri++) {
          if (radios[ri].value === radioVal && !radios[ri].checked) { radios[ri].click(); break; }
        }

        /* Clic Suivant */
        setTimeout(function() {
          var suivantBtn = document.querySelector('button.stepper-btn');
          if (suivantBtn && !suivantBtn.disabled) suivantBtn.click();
        }, 800);
      };

      /* Assureur — autocomplete Angular Material : taper le nom puis sélectionner le meilleur match */
      if (mutuelle) {
        var assureurEl = findElement('[formcontrolname="assureur"]');
        if (assureurEl) {
          ultraFill(assureurEl, mutuelle);
          /* Attendre que le panel autocomplete s'ouvre, puis cliquer le meilleur match */
          setTimeout(function() {
            var panel = document.querySelector('.mat-mdc-autocomplete-panel, .mat-autocomplete-panel');
            if (!panel) return;
            var options = panel.querySelectorAll('mat-option');
            if (options.length === 0) return;
            var needle = mutuelle.toLowerCase().replace(/\s+/g, " ").trim();
            var best = options[0];
            var bestScore = 0;
            for (var oi = 0; oi < options.length; oi++) {
              var optText = (options[oi].textContent || "").toLowerCase().replace(/\s+/g, " ").trim();
              if (optText === needle) { best = options[oi]; bestScore = 3; break; }
              if (bestScore < 2 && optText.includes(needle)) { best = options[oi]; bestScore = 2; }
              if (bestScore < 1 && needle.includes(optText)) { best = options[oi]; bestScore = 1; }
            }
            best.click();
            /* Après sélection : attendre que le champ N° CONTRAT apparaisse, puis remplir le reste */
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

      /* Date d'ordonnance */
      var dateOrdo = o.dateOrdonnance || c.dateOrdonnance || "";
      if (dateOrdo) {
        var d = String(dateOrdo).replace(/\D/g, "");
        var dateOrdoFmt = dateOrdo;
        if (d.length === 8) {
          dateOrdoFmt = (parseInt(d.slice(0,4)) > 1900)
            ? d.slice(6,8) + "/" + d.slice(4,6) + "/" + d.slice(0,4)
            : d.slice(0,2) + "/" + d.slice(2,4) + "/" + d.slice(4,8);
        }
        var dateOrdoEl = findElement('[formcontrolname="dateOrdonnance"]');
        if (dateOrdoEl && !dateOrdoEl.disabled) { ultraFill(dateOrdoEl, dateOrdoFmt); filled++; }
      }

      /* Prescripteur — RPPS (radio + champ) */
      var rpps = o.rpps || c.rpps || "";
      if (rpps) {
        /* Sélectionner le radio RPPS (value="2") */
        var rppsRadio = document.querySelector('mat-radio-group[formcontrolname="prescripteurType"] input[value="2"]');
        if (rppsRadio && !rppsRadio.checked) rppsRadio.click();
        setTimeout(function() {
          var rppsEl = findElement('[formcontrolname="identifiantReglementaire"]');
          if (rppsEl) { ultraFill(rppsEl, rpps.replace(/\D/g, "")); filled++; }
        }, 300);
      }

      /* ── Corrections optiques ── */
      var od = o.oeilDroit || o.od || {};
      var og = o.oeilGauche || o.og || {};

      /* Détection du type de vision sélectionné via les checkboxes */
      var checkboxes = document.querySelectorAll('.choix-vision-teinte mat-checkbox');

      /* Helper : trouver les inputs de correction dans un bloc equipement */
      function fillVisionBlock(blockIndex, odData, ogData) {
        /* Chaque bloc de vision (loin, près, multifocal) a un app-caracteristique */
        var blocks = document.querySelectorAll('app-caracteristique');
        if (!blocks || !blocks[blockIndex]) return 0;
        var block = blocks[blockIndex];
        var count = 0;

        /* OD — première ligne du tableau */
        var rows = block.querySelectorAll('tr');
        if (rows.length >= 2) {
          var odInputs = rows[1].querySelectorAll('input[matinput]:not([disabled])');
          if (odInputs.length >= 1 && odData.sphere) { ultraFill(odInputs[0], odData.sphere); count++; }
          if (odInputs.length >= 2 && odData.cylindre) { ultraFill(odInputs[1], odData.cylindre); count++; }
          if (odInputs.length >= 3 && odData.axe) { ultraFill(odInputs[2], odData.axe); count++; }
          /* Addition (si présent — multifocal) */
          if (odInputs.length >= 4 && odData.addition) { ultraFill(odInputs[3], odData.addition); count++; }
        }

        /* OG — deuxième ligne du tableau */
        if (rows.length >= 3) {
          var ogInputs = rows[2].querySelectorAll('input[matinput]:not([disabled])');
          if (ogInputs.length >= 1 && ogData.sphere) { ultraFill(ogInputs[0], ogData.sphere); count++; }
          if (ogInputs.length >= 2 && ogData.cylindre) { ultraFill(ogInputs[1], ogData.cylindre); count++; }
          if (ogInputs.length >= 3 && ogData.axe) { ultraFill(ogInputs[2], ogData.axe); count++; }
          if (ogInputs.length >= 4 && ogData.addition) { ultraFill(ogInputs[3], ogData.addition); count++; }
        }

        return count;
      }

      /* Cocher la vision concernée et remplir */
      setTimeout(function() {
        /* Vision de loin */
        if ((od.sphere || og.sphere) && checkboxes[0]) {
          var cb0Input = checkboxes[0].querySelector('input[type="checkbox"]');
          if (cb0Input && !cb0Input.checked) cb0Input.click();
          setTimeout(function() { filled += fillVisionBlock(0, od, og); }, 200);
        }

        /* Vision de près (addition = progressifs) */
        if (od.addition || og.addition) {
          /* Cocher multifocal si addition existe */
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
