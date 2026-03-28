/* ── V3-9 : Scoring predictif de rejet ──────────────────────────────── */
/* Evalue le risque de rejet AVANT soumission TP.                        */
/* Le modele utilise les donnees historiques du backend.                  */

var _rejectionModel = null;

function loadRejectionModel() {
  chrome.storage.local.get(["optibot_rejection_model"], function(result) {
    var cached = result.optibot_rejection_model;
    if (cached && cached.ts && Date.now() - cached.ts < 86400000) {
      _rejectionModel = cached.model;
      return;
    }
    if (typeof getSyncToken === "function") {
      getSyncToken().then(function(token) {
        if (!token) return;
        fetch("https://optibot.fr/api/extension/rejection-model", {
          headers: { "Authorization": "Bearer " + token }
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
          _rejectionModel = data.model || null;
          chrome.storage.local.set({ optibot_rejection_model: { model: _rejectionModel, ts: Date.now() } });
        })
        .catch(function(err) { console.warn("[OptiBot] rejection model fetch failed:", err); });
      });
    }
  });
}

function predictRejectionRisk(fillData, hostname) {
  if (!_rejectionModel) return null;

  var risk = 0;
  var factors = [];

  var rules = _rejectionModel.rules || [];
  for (var i = 0; i < rules.length; i++) {
    var rule = rules[i];
    /* Verifier si la regle s'applique a ce portail */
    if (rule.hostname && rule.hostname !== hostname) continue;

    /* Evaluer la condition */
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

  /* Normaliser entre 0 et 100 */
  risk = Math.min(100, Math.max(0, risk));

  return {
    risk: risk,
    level: risk < 20 ? "low" : risk < 50 ? "medium" : "high",
    factors: factors,
    suggestions: factors.filter(function(f) { return f.suggestion; }).map(function(f) { return f.suggestion; })
  };
}

function showRejectionRiskBanner(prediction) {
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
  header.innerHTML = '<span style="font-size:14px;font-weight:700;color:#111;">Risque de rejet : ' + prediction.risk + '%</span><span style="font-size:11px;padding:2px 8px;border-radius:4px;background:' + colors[prediction.level] + ';color:white;font-weight:600;">' + labels[prediction.level] + '</span>';
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
  closeBtn.textContent = "\u00d7";
  closeBtn.style.cssText = "position:absolute;top:8px;right:8px;background:none;border:none;font-size:18px;color:#9ca3af;cursor:pointer;";
  closeBtn.onclick = function() { banner.remove(); };
  banner.appendChild(closeBtn);

  document.body.appendChild(banner);
  setTimeout(function() { banner.remove(); }, 15000);
}

globalThis.loadRejectionModel = loadRejectionModel;
globalThis.predictRejectionRisk = predictRejectionRisk;
globalThis.showRejectionRiskBanner = showRejectionRiskBanner;
