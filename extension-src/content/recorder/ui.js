/* ── Recorder UI — Panel, Wizard, Highlights ──────────────────────────── */

/* ── Panneau guidé latéral (avec suppression d'étapes + undo) ─────────── */

export function showRecorderPanel() {
  if (document.getElementById("optibot-recorder-panel")) return;
  var panel = document.createElement("div");
  panel.id = "optibot-recorder-panel";
  panel.style.cssText = "position:fixed;right:0;top:50%;transform:translateY(-50%);z-index:2147483646;background:white;border-radius:12px 0 0 12px;box-shadow:-4px 0 20px rgba(0,0,0,0.15);width:280px;font-family:sans-serif;display:flex;flex-direction:column;max-height:70vh;";

  /* Header */
  var header = document.createElement("div");
  header.style.cssText = "padding:14px 16px 10px;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;";
  header.innerHTML = '<div style="font-size:14px;font-weight:700;color:#ef4444;">\u23FA OptiBot \u2014 Enregistrement</div>';

  /* Bouton Undo */
  var undoBtn = document.createElement("button");
  undoBtn.id = "optibot-recorder-undo";
  undoBtn.style.cssText = "padding:4px 8px;border:1px solid #d1d5db;border-radius:6px;background:white;color:#6b7280;font-size:11px;cursor:pointer;opacity:0.5;";
  undoBtn.textContent = "\u21A9 Annuler";
  undoBtn.title = "Supprimer la derni\u00E8re \u00E9tape (Ctrl+Z)";
  undoBtn.addEventListener("click", function() { undoLastStep(); });
  header.appendChild(undoBtn);
  panel.appendChild(header);

  /* Body (scrollable list) */
  var body = document.createElement("div");
  body.id = "optibot-recorder-panel-body";
  body.style.cssText = "flex:1;overflow-y:auto;padding:8px 12px;";
  panel.appendChild(body);

  /* Footer */
  var footer = document.createElement("div");
  footer.id = "optibot-recorder-panel-footer";
  footer.style.cssText = "padding:10px 16px;border-top:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;";
  var counter = document.createElement("span");
  counter.id = "optibot-recorder-panel-counter";
  counter.style.cssText = "font-size:12px;color:#6b7280;";
  counter.textContent = "0 \u00E9tapes";
  var stopBtn = document.createElement("button");
  stopBtn.style.cssText = "padding:6px 14px;border:none;border-radius:6px;background:#ef4444;color:white;font-size:12px;font-weight:600;cursor:pointer;";
  stopBtn.textContent = "\u23F9 Terminer";
  stopBtn.addEventListener("click", function() { stopRecorder(); });
  footer.appendChild(counter);
  footer.appendChild(stopBtn);
  panel.appendChild(footer);

  document.body.appendChild(panel);

  /* Raccourci clavier Ctrl+Z = undo dernière étape */
  document.addEventListener("keydown", _recorderKeyHandler, true);
}

function _recorderKeyHandler(e) {
  if (e.ctrlKey && e.key === "z" && recorderState) {
    e.preventDefault();
    e.stopPropagation();
    undoLastStep();
  }
}

export function undoLastStep() {
  if (!recorderState || recorderState.etapes.length === 0) return;
  var removed = recorderState.etapes.pop();
  saveRecorderState();
  updateRecorderPanel();
  showRPAToast("\u21A9 \u00C9tape supprim\u00E9e \u2014 " + (removed.label || removed.action), "info");
}

export function deleteStep(index) {
  if (!recorderState || index < 0 || index >= recorderState.etapes.length) return;
  var removed = recorderState.etapes.splice(index, 1)[0];
  /* Renuméroter les IDs */
  for (var i = 0; i < recorderState.etapes.length; i++) {
    recorderState.etapes[i].id = "step_" + (i + 1);
  }
  saveRecorderState();
  updateRecorderPanel();
  showRPAToast("\uD83D\uDDD1\uFE0F Supprim\u00E9 \u2014 " + (removed.label || removed.action), "info");
}

export function updateRecorderPanel() {
  if (!recorderState) return;
  var body = document.getElementById("optibot-recorder-panel-body");
  var counter = document.getElementById("optibot-recorder-panel-counter");
  var undoBtn = document.getElementById("optibot-recorder-undo");
  if (!body) return;

  var etapes = recorderState.etapes;

  if (counter) counter.textContent = etapes.length + " \u00E9tape" + (etapes.length > 1 ? "s" : "");
  if (undoBtn) undoBtn.style.opacity = etapes.length > 0 ? "1" : "0.5";

  body.innerHTML = "";

  if (etapes.length === 0) {
    var empty = document.createElement("div");
    empty.style.cssText = "font-size:12px;color:#9ca3af;text-align:center;padding:16px 0;";
    empty.textContent = "Effectuez des actions sur la page\u2026";
    body.appendChild(empty);
    body.scrollTop = body.scrollHeight;
    return;
  }

  var lastUrl = null;
  for (var i = 0; i < etapes.length; i++) {
    (function(idx) {
      var step = etapes[idx];

      /* Séparateur entre groupes d'URL différentes */
      if (step.url && step.url !== lastUrl && lastUrl !== null) {
        var sep = document.createElement("div");
        sep.style.cssText = "border-top:2px dashed #d1d5db;margin:6px 0;padding-top:4px;font-size:10px;color:#9ca3af;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
        sep.textContent = "\uD83D\uDCC4 " + step.url.replace(/https?:\/\//, "").slice(0, 35);
        body.appendChild(sep);
      }
      lastUrl = step.url;

      var row = document.createElement("div");
      row.style.cssText = "display:flex;align-items:center;gap:6px;padding:4px 0;font-size:12px;position:relative;";
      row.className = "optibot-recorder-step-row";

      /* Numéro d'étape */
      var num = document.createElement("span");
      num.style.cssText = "font-size:10px;color:#9ca3af;min-width:16px;text-align:right;";
      num.textContent = (idx + 1) + ".";
      row.appendChild(num);

      var icon = document.createElement("span");
      if (step.action === "fill") {
        var isKnown = step.variable && step.variable.indexOf("{{") === 0;
        icon.textContent = isKnown ? "\u2705" : "\u270F\uFE0F";
        var labelEl = document.createElement("span");
        labelEl.style.cssText = "flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#374151;";
        labelEl.textContent = (step.label || "Champ").slice(0, 22);
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
        icon.textContent = "\uD83D\uDDB1\uFE0F";
        var labelEl2 = document.createElement("span");
        labelEl2.style.cssText = "flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#374151;";
        labelEl2.textContent = (step.label || "Clic").slice(0, 28);
        row.appendChild(icon);
        row.appendChild(labelEl2);
      } else if (step.action === "select") {
        icon.textContent = "\uD83D\uDCCB";
        var labelEl3 = document.createElement("span");
        labelEl3.style.cssText = "flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#374151;";
        labelEl3.textContent = (step.label || "S\u00E9lection").slice(0, 28);
        row.appendChild(icon);
        row.appendChild(labelEl3);
      }

      /* Bouton supprimer (apparaît au hover) */
      var delBtn = document.createElement("button");
      delBtn.style.cssText = "opacity:0;transition:opacity 0.15s;padding:2px 5px;border:none;background:#fee2e2;color:#dc2626;border-radius:3px;font-size:10px;cursor:pointer;flex-shrink:0;";
      delBtn.textContent = "\u2715";
      delBtn.title = "Supprimer cette \u00E9tape";
      delBtn.addEventListener("click", function(ev) {
        ev.stopPropagation();
        deleteStep(idx);
      });
      row.appendChild(delBtn);

      /* Hover → afficher le bouton supprimer + highlight l'élément ciblé */
      row.addEventListener("mouseenter", function() {
        delBtn.style.opacity = "1";
        _highlightTargetElement(step.selector, true);
      });
      row.addEventListener("mouseleave", function() {
        delBtn.style.opacity = "0";
        _highlightTargetElement(step.selector, false);
      });

      body.appendChild(row);
    })(i);
  }

  body.scrollTop = body.scrollHeight;
}

/* ── Highlight visuel des champs capturés ──────────────────────────────── */

export function highlightRecordedField(el, variable) {
  if (!el || el.getAttribute("data-optibot-recorded")) return;
  el.setAttribute("data-optibot-recorded", "true");

  var isKnown = variable && variable.indexOf("{{") === 0;
  el.style.outline = isKnown ? "2px solid #10b981" : "2px solid #f59e0b";
  el.style.backgroundColor = isKnown ? "#f0fdf4" : "#fffbeb";

  /* Badge absolu au-dessus du champ */
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
  badge.style.left = (rect.left - parentRect.left) + "px";
  badge.style.top = (rect.top - parentRect.top - 16) + "px";
  parent.appendChild(badge);
}

export function removeRecorderHighlights() {
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

/* ── Wizard — saute l'étape 2 si tous les champs sont auto-détectés ──── */

export function showRecorderWizard(etapes, hostname) {
  var existing = document.getElementById("optibot-recorder-modal-overlay");
  if (existing) existing.remove();

  var currentStep = 1;
  var nomPortail = _generateSmartName(hostname, etapes);

  var variableOptions = [
    /* Patient */
    "{{nom}}", "{{prenom}}", "{{nss}}", "{{dateNaissance}}",
    /* Contact */
    "{{telephone}}", "{{email}}", "{{adresse}}", "{{codePostal}}", "{{ville}}",
    /* Mutuelle */
    "{{organisme}}", "{{numeroAdherent}}", "{{numeroAMC}}", "{{numeroTeletransmission}}",
    "{{critereSecondaire}}", "{{codeConvention}}",
    "{{dateDebutValidite}}", "{{dateFinValidite}}",
    /* Prescription */
    "{{dateOrdonnance}}", "{{nomOphtalmologue}}", "{{rpps}}",
    "{{distancePupillaire}}", "{{typePrescription}}",
    /* Lunettes OD */
    "{{sphere_od}}", "{{cylindre_od}}", "{{axe_od}}", "{{addition_od}}",
    /* Lunettes OG */
    "{{sphere_og}}", "{{cylindre_og}}", "{{axe_og}}", "{{addition_og}}",
    /* Addition générique */
    "{{addition}}",
    /* Lentilles OD */
    "{{sphere_lentille_od}}", "{{cylindre_lentille_od}}", "{{axe_lentille_od}}", "{{addition_lentille_od}}",
    "{{rayon_od}}", "{{diametre_od}}",
    /* Lentilles OG */
    "{{sphere_lentille_og}}", "{{cylindre_lentille_og}}", "{{axe_lentille_og}}", "{{addition_lentille_og}}",
    "{{rayon_og}}", "{{diametre_og}}",
    /* Ignorer */
    "Ignorer ce champ"
  ];

  /* Vérifier si tous les champs sont auto-détectés */
  var hasUnmappedFields = false;
  for (var ci = 0; ci < etapes.length; ci++) {
    var e = etapes[ci];
    if ((e.action === "fill" || e.action === "select") && (!e.variable || e.variable.indexOf("{{") !== 0)) {
      hasUnmappedFields = true;
      break;
    }
  }

  /* Overlay */
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

  var totalSteps = hasUnmappedFields ? 3 : 2;

  function updateProgress() {
    var dots = "";
    for (var i = 1; i <= totalSteps; i++) {
      dots += (i <= currentStep) ? "\u25CF " : "\u25CB ";
    }
    progress.textContent = dots.trim();
  }

  function renderStep() {
    content.innerHTML = "";
    footer.innerHTML = "";
    updateProgress();

    if (currentStep === 1) renderStep1();
    else if (currentStep === 2 && hasUnmappedFields) renderStep2();
    else renderStep3();
  }

  /* ── \u00C9tape 1 \u2014 Nom du parcours ──────────────────────────────────── */
  function renderStep1() {
    var title = document.createElement("div");
    title.style.cssText = "font-size:16px;font-weight:700;color:#111;margin-bottom:12px;";
    title.textContent = "\u23FA Nom du parcours";

    var desc = document.createElement("div");
    desc.style.cssText = "font-size:13px;color:#6b7280;margin-bottom:16px;";
    desc.textContent = "Donnez un nom pour retrouver ce parcours facilement.";

    var input = document.createElement("input");
    input.type = "text";
    input.value = nomPortail;
    input.placeholder = hostname;
    input.style.cssText = "width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;box-sizing:border-box;outline:none;";
    input.addEventListener("focus", function() { input.style.borderColor = "#3b82f6"; });
    input.addEventListener("blur", function() { input.style.borderColor = "#d1d5db"; });
    input.addEventListener("input", function() { nomPortail = input.value.trim() || hostname; });

    /* Statistiques rapides */
    var fillCount = etapes.filter(function(e) { return e.action === "fill"; }).length;
    var clickCount = etapes.filter(function(e) { return e.action === "click"; }).length;
    var summary = document.createElement("div");
    summary.style.cssText = "font-size:12px;color:#9ca3af;margin-top:12px;padding:8px 12px;background:#f9fafb;border-radius:6px;";
    summary.textContent = etapes.length + " \u00E9tapes \u2014 " + fillCount + " champs, " + clickCount + " clics";

    content.appendChild(title);
    content.appendChild(desc);
    content.appendChild(input);
    content.appendChild(summary);

    var cancelBtn = _makeBtn("Annuler", "secondary", function() { overlay.remove(); showRPAToast("Annul\u00E9.", "info"); });
    var nextBtn = _makeBtn("Suivant \u2192", "primary", function() { currentStep = 2; renderStep(); });
    footer.appendChild(cancelBtn);
    footer.appendChild(nextBtn);

    setTimeout(function() { input.focus(); input.select(); }, 50);
  }

  /* ── \u00C9tape 2 \u2014 V\u00E9rification (saut\u00E9e si tout est auto-d\u00E9tect\u00E9) ─── */
  function renderStep2() {
    var title = document.createElement("div");
    title.style.cssText = "font-size:16px;font-weight:700;color:#111;margin-bottom:12px;";
    title.textContent = "\uD83D\uDD0D V\u00E9rification des champs";

    var desc = document.createElement("div");
    desc.style.cssText = "font-size:13px;color:#6b7280;margin-bottom:16px;";
    desc.textContent = "Les champs orange n\u2019ont pas \u00E9t\u00E9 reconnus automatiquement. Assignez-leur une variable.";

    content.appendChild(title);
    content.appendChild(desc);

    var fillSteps = [];
    for (var i = 0; i < etapes.length; i++) {
      if (etapes[i].action === "fill" || etapes[i].action === "select") fillSteps.push(i);
    }

    for (var fi = 0; fi < fillSteps.length; fi++) {
      (function(etapeIdx) {
        var step = etapes[etapeIdx];
        var isKnown = step.variable && step.variable.indexOf("{{") === 0;

        var row = document.createElement("div");
        row.style.cssText = "display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #f3f4f6;";

        var labelSpan = document.createElement("span");
        labelSpan.style.cssText = "font-size:13px;color:#374151;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
        labelSpan.textContent = (step.label || "Champ").slice(0, 30);

        if (isKnown) {
          var badge = document.createElement("span");
          badge.style.cssText = "font-size:11px;background:#d1fae5;color:#065f46;padding:2px 8px;border-radius:4px;white-space:nowrap;";
          badge.textContent = step.variable;
          row.appendChild(labelSpan);
          row.appendChild(badge);
        } else {
          var sel = document.createElement("select");
          sel.style.cssText = "font-size:12px;padding:4px 6px;border:1px solid #f59e0b;border-radius:4px;background:#fffbeb;color:#92400e;max-width:160px;";
          var defaultOpt = document.createElement("option");
          defaultOpt.value = "";
          defaultOpt.textContent = "\u26A0\uFE0F \u00C0 mapper";
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

    var backBtn = _makeBtn("\u2190 Retour", "secondary", function() { currentStep = 1; renderStep(); });
    var nextBtn = _makeBtn("Suivant \u2192", "primary", function() { currentStep = 3; renderStep(); });
    footer.appendChild(backBtn);
    footer.appendChild(nextBtn);
  }

  /* ── \u00C9tape 3 \u2014 R\u00E9cap et envoi ──────────────────────────────────── */
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
    title.textContent = "\uD83C\uDF89 Parcours pr\u00EAt !";

    var stats = document.createElement("div");
    stats.style.cssText = "font-size:14px;color:#6b7280;text-align:center;margin-bottom:20px;";
    stats.innerHTML = '<strong>' + etapes.length + '</strong> \u00E9tapes \u00B7 <strong>' + autoCount + '</strong> champs auto \u00B7 <strong>' + manualCount + '</strong> manuels';

    /* Indicateur de qualité */
    var quality = autoCount > 0 ? Math.round((autoCount / (autoCount + manualCount)) * 100) : 0;
    var qualityBar = document.createElement("div");
    qualityBar.style.cssText = "margin:0 auto 20px;width:200px;height:6px;background:#e5e7eb;border-radius:3px;overflow:hidden;";
    var qualityFill = document.createElement("div");
    qualityFill.style.cssText = "height:100%;border-radius:3px;background:" + (quality >= 80 ? "#10b981" : quality >= 50 ? "#f59e0b" : "#ef4444") + ";width:" + quality + "%;transition:width 0.5s;";
    qualityBar.appendChild(qualityFill);

    var qualityLabel = document.createElement("div");
    qualityLabel.style.cssText = "font-size:11px;color:#9ca3af;text-align:center;margin-bottom:20px;";
    qualityLabel.textContent = quality + "% de d\u00E9tection automatique";

    /* Validation des sélecteurs sur la page courante */
    var validation = _validateSelectors(etapes);
    var brokenCount = validation.filter(function(v) { return v.valid === false; }).length;
    if (brokenCount > 0) {
      var warning = document.createElement("div");
      warning.style.cssText = "padding:8px 12px;background:#fef3c7;border:1px solid #f59e0b;border-radius:6px;font-size:12px;color:#92400e;margin-bottom:16px;text-align:center;";
      warning.textContent = "\u26A0\uFE0F " + brokenCount + " s\u00E9lecteur" + (brokenCount > 1 ? "s" : "") + " introuvable" + (brokenCount > 1 ? "s" : "") + " sur cette page";
      content.appendChild(warning);
    }

    content.appendChild(title);
    content.appendChild(stats);
    content.appendChild(qualityBar);
    content.appendChild(qualityLabel);

    var sendBtn = document.createElement("button");
    sendBtn.style.cssText = "width:100%;padding:12px;border:none;border-radius:8px;background:#3b82f6;color:white;font-size:14px;font-weight:600;cursor:pointer;margin-bottom:8px;";
    sendBtn.textContent = "Envoyer \u00E0 OptiBot";
    sendBtn.addEventListener("click", function() {
      overlay.remove();
      sendRecorderParcours(etapes, hostname, nomPortail);
    });
    content.appendChild(sendBtn);

    var dlBtn = document.createElement("button");
    dlBtn.style.cssText = "width:100%;padding:12px;border:1px solid #d1d5db;border-radius:8px;background:white;color:#374151;font-size:14px;font-weight:500;cursor:pointer;margin-bottom:8px;";
    dlBtn.textContent = "T\u00E9l\u00E9charger JSON";
    dlBtn.addEventListener("click", function() {
      var blob = new Blob([JSON.stringify({ hostname: hostname, nom: nomPortail, etapes: etapes }, null, 2)], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "optibot-parcours-" + hostname + ".json";
      a.click();
      URL.revokeObjectURL(url);
    });
    content.appendChild(dlBtn);

    var backBtn = _makeBtn("\u2190 Retour", "secondary", function() {
      currentStep = hasUnmappedFields ? 2 : 1;
      renderStep();
    });
    var cancelBtn = document.createElement("button");
    cancelBtn.style.cssText = "padding:8px 16px;border:1px solid #d1d5db;border-radius:8px;background:white;color:#ef4444;font-size:13px;font-weight:500;cursor:pointer;";
    cancelBtn.textContent = "Annuler";
    cancelBtn.addEventListener("click", function() { overlay.remove(); showRPAToast("Annul\u00E9.", "info"); });
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
      showRPAToast("Annul\u00E9.", "info");
    }
  });

  document.body.appendChild(overlay);
  renderStep();
}

/* ── Helpers ──────────────────────────────────────────────────────────── */

function _makeBtn(text, type, onClick) {
  var btn = document.createElement("button");
  if (type === "primary") {
    btn.style.cssText = "padding:8px 20px;border:none;border-radius:8px;background:#3b82f6;color:white;font-size:13px;font-weight:600;cursor:pointer;";
  } else {
    btn.style.cssText = "padding:8px 16px;border:1px solid #d1d5db;border-radius:8px;background:white;color:#374151;font-size:13px;font-weight:500;cursor:pointer;";
  }
  btn.textContent = text;
  btn.addEventListener("click", onClick);
  return btn;
}

/* ── Highlight temporaire de l'élément ciblé (hover panneau) ──────────── */

var _currentHighlight = null;
var _currentHighlightOutline = "";

function _highlightTargetElement(selector, show) {
  /* Retirer le highlight précédent */
  if (_currentHighlight) {
    _currentHighlight.style.outline = _currentHighlightOutline;
    _currentHighlight = null;
  }
  if (!show || !selector) return;

  try {
    var el = document.querySelector(selector);
    if (!el) return;
    _currentHighlightOutline = el.style.outline;
    _currentHighlight = el;
    el.style.outline = "3px solid #3b82f6";
    /* Scroll doux vers l'élément */
    var rect = el.getBoundingClientRect();
    if (rect.top < 0 || rect.bottom > window.innerHeight) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  } catch(e) {}
}

/* ── Validation des sélecteurs avant envoi ────────────────────────────── */

function _validateSelectors(etapes) {
  var results = [];
  for (var i = 0; i < etapes.length; i++) {
    var step = etapes[i];
    if (step.url !== window.location.href) {
      results.push({ index: i, valid: null }); /* Autre page, impossible à vérifier */
      continue;
    }
    var found = false;
    var selectors = step.selectors || [step.selector];
    for (var j = 0; j < selectors.length; j++) {
      try {
        if (document.querySelector(selectors[j])) { found = true; break; }
      } catch(e) {}
    }
    results.push({ index: i, valid: found });
  }
  return results;
}

/* Génère un nom intelligent basé sur le hostname + variables détectées */
function _generateSmartName(hostname, etapes) {
  var cleanHost = hostname.replace("www.", "").replace(/\.\w+$/, "");
  cleanHost = cleanHost.charAt(0).toUpperCase() + cleanHost.slice(1);

  var variables = [];
  for (var i = 0; i < etapes.length; i++) {
    var v = etapes[i].variable;
    if (v && v.indexOf("{{") === 0 && variables.indexOf(v) === -1) {
      variables.push(v);
    }
  }

  var hasNSS = variables.indexOf("{{nss}}") !== -1;
  var hasNom = variables.indexOf("{{nom}}") !== -1;
  var hasAdherent = variables.indexOf("{{numeroAdherent}}") !== -1;
  var hasCorrectionVars = variables.some(function(v) { return v.indexOf("sphere") !== -1 || v.indexOf("cylindre") !== -1; });

  if (hasNSS || hasAdherent || hasNom) {
    return cleanHost + " \u2014 Demande TP";
  }
  if (hasCorrectionVars) {
    return cleanHost + " \u2014 Saisie correction";
  }
  return cleanHost + " \u2014 Parcours";
}
