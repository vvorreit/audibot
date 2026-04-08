/* ── PEC Capture : detecter un accord PEC sur les portails mutuelles ──────
 * Utilise le meme pattern de matching que erp-bridge (word boundaries)
 * pour eviter toute divergence.
 * Resultat : PEC chiffree → chrome.storage → forwarded a l'onglet ERP */

var PEC_CAPTURE_ALIASES = {
  numeroAccord:  ["num_accord", "numero_accord", "accord", "reference_pec", "num_pec", "n_accord", "no_accord", "accord_pec", "ref_pec", "numero pec", "reference accord", "n accord", "numero de prise en charge", "numero accord pec"],
  montantPEC:    ["montant_pec", "montant_accord", "montant_rc", "prise_en_charge", "montant_mutuelle", "part_complementaire", "remboursement_rc", "montant rembourse", "montant prise en charge", "montant accord"],
  datePEC:       ["date_pec", "date_accord", "date_retour", "date_reponse", "date_validation", "date pec", "date accord", "date de l'accord"],
};

function normalizePECAlias(str) {
  return (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s\-_\.\/]/g, "");
}

function matchPECField(el) {
  /* Collecter les signaux */
  var signals = [];
  var attrs = [el.name, el.id, el.className, el.getAttribute("data-field"), el.getAttribute("aria-label")];
  for (var i = 0; i < attrs.length; i++) {
    if (attrs[i]) signals.push(attrs[i]);
  }
  /* Label adjacent */
  var prev = el.previousElementSibling;
  if (prev && prev.textContent && prev.textContent.trim().length < 60) {
    signals.push(prev.textContent.trim());
  }
  var labelFor = el.id ? document.querySelector('label[for="' + CSS.escape(el.id) + '"]') : null;
  if (labelFor) signals.push(labelFor.textContent.trim());

  var normalized = signals.map(normalizePECAlias);
  var joined = " " + normalized.join(" ") + " ";

  var bestField = null;
  var bestScore = 0;
  for (var field in PEC_CAPTURE_ALIASES) {
    var aliases = PEC_CAPTURE_ALIASES[field];
    for (var a = 0; a < aliases.length; a++) {
      var norm = normalizePECAlias(aliases[a]);
      if (!norm) continue;
      var exactMatch = normalized.indexOf(norm) !== -1;
      var boundaryMatch = false;
      if (!exactMatch) {
        var escaped = norm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        var re = new RegExp("(^| )" + escaped + "( |$)");
        boundaryMatch = re.test(joined);
      }
      if (exactMatch || boundaryMatch) {
        var score = norm.length + (exactMatch ? 100 : 0);
        if (score > bestScore) {
          bestScore = score;
          bestField = field;
        }
      }
    }
  }
  return bestField;
}

function capturePECIfPresent() {
  var result = {};

  /* Scanner les elements pour trouver des champs PEC */
  var elements = document.querySelectorAll("input, select, textarea, span, td, div, dd, p, b, strong, th");
  for (var i = 0; i < elements.length; i++) {
    var el = elements[i];
    var val = "";
    if (el.tagName === "INPUT" || el.tagName === "SELECT" || el.tagName === "TEXTAREA") {
      val = (el.value || "").trim();
    } else {
      val = (el.textContent || "").trim();
    }
    if (!val || val.length > 100 || val.length < 1) continue;

    var field = matchPECField(el);
    if (field && !result[field]) {
      result[field] = val;
    }
  }

  /* Detecter si la page contient un indicateur d'accord */
  var bodyText = (document.body.innerText || "").toLowerCase();
  if (/accord\s*(pec|prise en charge|mutuelle)|prise en charge accept|demande accept|accord favorable/.test(bodyText)) {
    result.pecStatus = "approved";
  }

  /* Si on a un accord, chiffrer et stocker pour injection ERP */
  if (result.pecStatus === "approved" && (result.numeroAccord || result.montantPEC)) {
    (async function() {
      try {
        var encrypted = await encryptData(result);
        if (!encrypted) return;
        chrome.runtime.sendMessage({
          type: "AUDIBOT_PEC_CAPTURED",
          encryptedPayload: encrypted,
          source: window.location.hostname
        });
        showRPAToast("PEC capturee — basculez sur votre logiciel pour injecter", "success");
      } catch(e) {
        console.warn("[AudiBot] PEC capture encryption failed:", e);
      }
    })();
  }
}
