/* OptiBot — Bandeau de correction apres re-soumission.
   Affiche un rappel visuel du motif de rejet et highlight le champ a verifier.
   Si le cache est vide, affiche un avertissement rouge invitant a scanner la carte.
   Exports: showCorrectionBanner. ~100 lignes */

var FIELD_LABELS = {
  nss: "N\u00B0 de s\u00E9curit\u00E9 sociale",
  rpps: "N\u00B0 RPPS du prescripteur",
  dateOrdonnance: "Date de l\u2019ordonnance",
  montant: "Montant",
  codeActe: "Code LPP / Code acte",
  numeroAdherent: "N\u00B0 d\u2019adh\u00E9rent",
  dateNaissance: "Date de naissance",
  nom: "Nom du patient",
  prenom: "Pr\u00E9nom du patient"
};

/* Selecteurs connus par champ pour les portails courants */
var FIELD_SELECTORS = {
  nss: 'input[name*="nss" i], input[name*="secu" i], input[id*="nss" i], input[formcontrolname*="nss" i], input[formcontrolname*="secu" i]',
  rpps: 'input[name*="rpps" i], input[id*="rpps" i], input[formcontrolname*="rpps" i]',
  dateOrdonnance: 'input[name*="ordo" i], input[name*="prescription" i], input[id*="ordo" i], input[formcontrolname*="ordo" i]',
  montant: 'input[name*="montant" i], input[name*="amount" i], input[id*="montant" i], input[formcontrolname*="montant" i]',
  codeActe: 'input[name*="code" i][name*="acte" i], input[name*="lpp" i], input[id*="lpp" i], input[formcontrolname*="code" i]',
  numeroAdherent: 'input[name*="adherent" i], input[id*="adherent" i], input[formcontrolname*="adherent" i]'
};

function highlightField(correctionField) {
  if (!correctionField || !FIELD_SELECTORS[correctionField]) return;
  try {
    var els = document.querySelectorAll(FIELD_SELECTORS[correctionField]);
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.offsetParent === null) continue; /* skip hidden */
      el.style.outline = "3px solid #f97316";
      el.style.boxShadow = "0 0 0 4px rgba(249,115,22,0.25)";
      el.title = "OptiBot \u2014 Champ \u00E0 v\u00E9rifier suite au rejet";
      /* Scroller vers le champ */
      if (i === 0) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  } catch(e) {}
}

/**
 * @param {string} motif — motif du rejet
 * @param {string|null} correctionField — champ a corriger (nss, rpps, etc.)
 * @param {string|null} correctionHint — conseil de correction
 * @param {boolean} noCacheWarning — true si le cache patient est vide
 */
export function showCorrectionBanner(motif, correctionField, correctionHint, noCacheWarning) {
  /* Eviter les doublons */
  if (document.getElementById("optibot-resubmit-banner")) return;

  var isWarning = !!noCacheWarning;
  var bgGradient = isWarning
    ? "linear-gradient(135deg,#dc2626,#b91c1c)" /* rouge si cache vide */
    : "linear-gradient(135deg,#f97316,#ea580c)"; /* orange normal */

  var banner = document.createElement("div");
  banner.id = "optibot-resubmit-banner";
  banner.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:2147483647;background:" + bgGradient + ";color:white;padding:12px 20px;font-family:system-ui,-apple-system,sans-serif;font-size:14px;display:flex;align-items:center;gap:12px;box-shadow:0 4px 20px rgba(0,0,0,0.3);";

  var icon = document.createElement("span");
  icon.textContent = isWarning ? "\uD83D\uDEA8" : "\u26A0\uFE0F";
  icon.style.fontSize = "18px";
  banner.appendChild(icon);

  var textWrap = document.createElement("div");
  textWrap.style.cssText = "flex:1;min-width:0;";

  var title = document.createElement("div");
  title.style.cssText = "font-weight:800;font-size:13px;";

  if (isWarning) {
    title.textContent = "Re-soumission impossible \u2014 donn\u00E9es patient manquantes";
  } else {
    title.textContent = "Re-soumission suite \u00E0 rejet" + (motif ? " : " + motif : "");
  }
  textWrap.appendChild(title);

  if (correctionHint || correctionField) {
    var hint = document.createElement("div");
    hint.style.cssText = "font-size:12px;opacity:0.9;margin-top:2px;font-weight:600;";

    if (isWarning) {
      hint.textContent = correctionHint || "";
    } else {
      var fieldLabel = correctionField ? (FIELD_LABELS[correctionField] || correctionField) : "";
      hint.textContent = fieldLabel
        ? "V\u00E9rifiez le champ \u00AB " + fieldLabel + " \u00BB" + (correctionHint ? " \u2014 " + correctionHint : "")
        : (correctionHint || "");
    }
    textWrap.appendChild(hint);
  }

  banner.appendChild(textWrap);

  var closeBtn = document.createElement("button");
  closeBtn.textContent = "\u2715";
  closeBtn.style.cssText = "background:rgba(255,255,255,0.2);border:none;color:white;font-size:16px;font-weight:bold;cursor:pointer;padding:4px 10px;border-radius:8px;line-height:1;";
  closeBtn.onclick = function() { banner.remove(); };
  banner.appendChild(closeBtn);

  document.body.appendChild(banner);

  /* Highlight le champ concerne (uniquement en mode correction, pas en warning) */
  if (!isWarning) highlightField(correctionField);

  /* Auto-fermer : 30s pour correction, 60s pour le warning cache vide */
  setTimeout(function() {
    if (banner.parentNode) banner.remove();
  }, isWarning ? 60000 : 30000);
}
