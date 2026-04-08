/* ── V3-8 : Capture automatique de devis ─────────────────────────────── */
/* Detecte et capture les donnees de devis/cotation sur les portails.      */

/* Indicateurs de page devis — mots specifiques pour eviter les faux positifs */
/* Les mots generiques (montant, prise en charge) sont exclus car presents sur toute page TP */
var DEVIS_INDICATORS = [
  "devis", "cotation", "simulation devis", "tarification devis",
  "monture", "verre correcteur", "verre progressif",
  "prix total", "total ttc", "reste a charge",
  "code lpp", "quotation",
];

var DEVIS_FIELD_ALIASES = {
  montureRef:     ["monture", "ref_monture", "reference_monture", "code_monture", "frame", "monture_ref", "frame_ref", "frame_reference"],
  montureMarque:  ["marque_monture", "brand_monture", "fabricant_monture", "marque_frame", "monture_marque", "frame_brand"],
  monturePrix:    ["prix_monture", "montant_monture", "price_frame", "frame_price", "cout_monture", "tarif_monture"],
  verreODRef:     ["verre_od", "verre_droit", "lens_od", "lens_right", "ref_verre_od", "verre_od_ref"],
  verreOGRef:     ["verre_og", "verre_gauche", "lens_og", "lens_left", "ref_verre_og", "verre_og_ref"],
  verrePrix:      ["prix_verres", "prix_verre", "montant_verres", "lens_price", "cout_verres", "tarif_verres"],
  supplementRef:  ["supplement", "traitement", "anti_reflet", "coating", "option", "surcharge", "antireflet", "photochromique", "anti_lumiere_bleue"],
  supplementPrix: ["prix_supplement", "montant_supplement", "prix_traitement", "prix_option", "tarif_supplement"],
  totalTTC:       ["total", "total_ttc", "montant_total", "prix_total", "total_general", "net_a_payer", "montant_devis"],
  partMutuelle:   ["part_mutuelle", "prise_en_charge", "remboursement", "montant_rembourse", "part_amc", "part_complementaire", "part_rc"],
  partSecu:       ["part_secu", "part_amo", "remboursement_secu", "base_secu", "part_securite_sociale", "remboursement_amo"],
  resteACharge:   ["reste_a_charge", "rac", "reste_charge", "a_payer", "montant_rac", "reste", "solde_patient"],
  codeLPP:        ["code_lpp", "lpp", "code_prestation", "code_acte", "lpp_code"],
};

export function detectDevisPage() {
  var text = (document.title + " " + document.body.innerText.substring(0, 3000)).toLowerCase();
  var matchCount = 0;
  for (var i = 0; i < DEVIS_INDICATORS.length; i++) {
    if (text.indexOf(DEVIS_INDICATORS[i]) !== -1) matchCount++;
  }
  /* Au moins 4 indicateurs specifiques pour eviter les faux positifs sur les pages TP */
  return matchCount >= 4;
}

export function captureDevis() {
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

    /* Signal collection simplifie */
    var signals = [
      el.name, el.id, el.placeholder,
      el.getAttribute("aria-label"),
      el.getAttribute("data-field"),
      el.className,
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

  /* Detecter aussi les prix dans des elements specifiques */
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

export function syncDevisToBackend(devis) {
  if (!devis) return;

  if (typeof getSyncToken === "function") {
    getSyncToken().then(function(token) {
      if (!token) return;
      fetch("https://audibot.fr/api/extension/devis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
        },
        body: JSON.stringify({
          hostname: window.location.hostname,
          devis: devis,
          url: window.location.pathname,
          ts: Date.now(),
        })
      })
      .then(function() {
        showDevisToast("Devis capture — " + (devis.totalTTC || "montant inconnu") + " EUR", "success");
      })
      .catch(function(err) { console.warn("[AudiBot] devis sync failed:", err); });
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
  requestAnimationFrame(function() { toast.style.opacity = "1"; });
  setTimeout(function() { toast.style.opacity = "0"; setTimeout(function() { toast.remove(); }, 300); }, 5000);
}

/* ── Auto-detection avec MutationObserver ─────────────────────────────── */
var _devisDetected = false;

export function setupDevisDetection() {
  /* Tentative initiale apres 3s */
  setTimeout(function() {
    var devis = captureDevis();
    if (devis) { _devisDetected = true; syncDevisToBackend(devis); }
  }, 3000);

  /* Observer pour SPA */
  if (document.body) {
    var timer = null;
    var obs = new MutationObserver(function(mutations) {
      if (_devisDetected) return;
      var hasNew = mutations.some(function(m) { return m.addedNodes.length > 0; });
      if (hasNew) {
        clearTimeout(timer);
        timer = setTimeout(function() {
          var devis = captureDevis();
          if (devis) { _devisDetected = true; syncDevisToBackend(devis); }
        }, 2000);
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }
}
