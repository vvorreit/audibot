/* ── TP Table Sync — scrapeTPTable, syncTPToOptiBot, showSyncTPButton, showSyncButton ── */

import { CONFIGS } from "./portals/index.js";
import { stackButtons } from "./ui/buttons.js";
import { showRPAToast } from "./rpa-utils.js";

export function showSyncButton() {
  if (document.getElementById('optibot-sync-btn')) return;
  globalThis._optibotHasPortalSync = true;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.id = 'optibot-sync-btn';
  btn.innerText = '\uD83D\uDCBE M\u00E9moriser';
  btn.style.cssText = `
    z-index: 999999;
    background: #8b5cf6; color: white; border: none; padding: 12px 20px;
    border-radius: 50px; font-weight: bold; cursor: pointer;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2); font-family: sans-serif;
    transition: all 0.2s;
  `;
  btn.onclick = async () => {
    btn.innerText = '\u23F3 En cours...';
    const currentSite = Object.values(CONFIGS).find(cfg => cfg.isMatch());
    if (!currentSite) { btn.innerText = '\u274C Portail non reconnu'; btn.style.background = '#ef4444'; setTimeout(() => { btn.innerText = '\uD83D\uDCBE M\u00E9moriser'; btn.style.background = '#8b5cf6'; }, 2000); return; }
    if (globalThis.optiTrace) globalThis.optiTrace.log("SCRAPE", "M\u00E9moriser: calling synchroniser()", { portal: currentSite.name });
    const success = await currentSite.actions.synchroniser();
    if (globalThis.optiTrace) globalThis.optiTrace.log("SCRAPE", "M\u00E9moriser: synchroniser() result", { portal: currentSite.name, success: !!success });
    if (success) {
      btn.innerText = '\u2705 Client m\u00E9moris\u00E9 !';
      btn.style.background = '#10b981';
      setTimeout(() => {
        btn.innerText = '\uD83D\uDCBE M\u00E9moriser';
        btn.style.background = '#8b5cf6';
      }, 2000);
    } else {
      btn.innerText = '\u274C Formulaire vide';
      btn.style.background = '#ef4444';
      setTimeout(() => {
        btn.innerText = '\uD83D\uDCBE M\u00E9moriser';
        btn.style.background = '#8b5cf6';
      }, 2000);
    }
  };
  document.body.appendChild(btn);
  stackButtons();
}

// ── Sync TP depuis LBO ─────────────────────────────────────────────────────

function scrapeTPTable() {
  var table = document.querySelector('#grid_pointage_tiers_payant tbody');
  if (!table) return [];
  var rows = table.querySelectorAll('tr');
  var dossiers = [];
  for (var i = 0; i < rows.length; i++) {
    var tr = rows[i];
    var tds = tr.querySelectorAll('td');
    if (tds.length < 9) continue;

    var date = (tds[0].textContent || "").trim();
    var modeEl = tds[1].querySelector('.label');
    var mode = modeEl ? (modeEl.textContent || "").trim() : "";
    var numFSE = (tds[2].textContent || "").trim();

    var orgTypeEl = tds[3].querySelector('.label');
    var orgType = orgTypeEl ? (orgTypeEl.textContent || "").trim() : "";
    var organisme = (tds[3].textContent || "").trim().replace(/^(RO|RC)\s*/, "");

    var bordText = (tds[4].textContent || "").trim();
    var numBordereau = bordText.replace(/^(Bord\.\s*N\u00B0|Lot\s*N\u00B0)\s*/i, "").trim();

    /* PAS DE NOM CLIENT — on skip tds[5] */

    var montantText = (tds[6].textContent || "").replace(/[^\d,.-]/g, "").replace(",", ".").trim();
    var montant = parseFloat(montantText) || 0;

    var statutEl = tds[7].querySelector('.label-danger');
    var statut = statutEl ? "Rejet" : (tds[7].textContent || "").trim();

    var remarque = (tds[8].textContent || "").trim();

    /* IDs depuis les data-attributes des boutons d'action */
    var encBtn = tds[9] ? tds[9].querySelector('[data-bordereau_regime_detail_id]') : null;
    var lboDetailId = encBtn ? encBtn.getAttribute('data-bordereau_regime_detail_id') : "";

    var rejetBtn = tds[9] ? tds[9].querySelector('[data-rejet_noemi_type_id]') : null;
    var rejetTypeId = rejetBtn ? rejetBtn.getAttribute('data-rejet_noemi_type_id') : "";

    dossiers.push({
      date: date,
      mode: mode,
      numFSE: numFSE,
      type: orgType,
      organisme: organisme,
      numBordereau: numBordereau,
      montant: montant,
      statut: statut,
      remarque: remarque,
      rejetTypeId: rejetTypeId || "",
      lboDetailId: lboDetailId || ""
    });
  }
  return dossiers;
}

async function syncTPToOptiBot(btn) {
  btn.innerText = "Chargement...";
  btn.style.background = "#6366f1";

  /* Passer le DataTable en 100 lignes pour tout recuperer */
  var lengthSelect = document.querySelector('#grid_pointage_tiers_payant_length select');
  var originalLength = lengthSelect ? lengthSelect.value : "10";
  if (lengthSelect && lengthSelect.value !== "100") {
    lengthSelect.value = "100";
    lengthSelect.dispatchEvent(new Event("change", { bubbles: true }));
    await new Promise(function(r) { setTimeout(r, 2000); });
  }

  var allDossiers = [];
  var maxPages = 20;
  var page = 0;

  while (page < maxPages) {
    btn.innerText = "Page " + (page + 1) + "...";
    var batch = scrapeTPTable();
    if (batch.length === 0) break;
    allDossiers = allDossiers.concat(batch);

    var nextBtn = document.querySelector('#grid_pointage_tiers_payant_next:not(.disabled)');
    if (!nextBtn) break;
    nextBtn.querySelector('a').click();
    await new Promise(function(r) { setTimeout(r, 1500); });
    page++;
  }

  /* Revenir a la premiere page */
  var firstPageBtn = document.querySelector('#grid_pointage_tiers_payant_paginate .paginate_button:nth-child(2) a');
  if (firstPageBtn) firstPageBtn.click();

  /* Restaurer le nombre de lignes */
  if (lengthSelect && originalLength !== "100") {
    setTimeout(function() {
      lengthSelect.value = originalLength;
      lengthSelect.dispatchEvent(new Event("change", { bubbles: true }));
    }, 500);
  }

  if (allDossiers.length === 0) {
    btn.innerText = "Aucun dossier";
    btn.style.background = "#ef4444";
    setTimeout(function() { btn.innerText = "Sync TP"; btn.style.background = "#6366f1"; }, 2000);
    return;
  }

  btn.innerText = "Envoi " + allDossiers.length + " dossiers...";

  /* Recuperer le syncToken depuis optibot_auth (source de verite) */
  var syncToken = await globalThis.getSyncToken();
  if (!syncToken) {
    btn.innerText = "Connectez-vous sur OptiBot";
    btn.style.background = "#ef4444";
    setTimeout(function() { btn.innerText = "Sync TP"; btn.style.background = "#6366f1"; }, 3000);
    return;
  }
  (async function() {

    try {
      if (globalThis.optiTrace) globalThis.optiTrace.log("API", "fetch: sync-tp", { dossiers: allDossiers.length });
      var resp = await fetch("https://optibot.fr/api/extension/sync-tp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ syncToken: syncToken, dossiers: allDossiers })
      });
      var data = await resp.json();
      if (globalThis.optiTrace) globalThis.optiTrace.log("API", "fetch response: sync-tp", { ok: resp.ok, status: resp.status, success: data.success, created: data.created, updated: data.updated });
      if (data.success) {
        btn.innerText = "+" + data.created + " / maj " + data.updated;
        btn.style.background = "#10b981";
      } else {
        btn.innerText = data.error || "Erreur";
        btn.style.background = "#ef4444";
      }
    } catch(e) {
      if (globalThis.optiTrace) globalThis.optiTrace.log("ERROR", "fetch error: sync-tp", { error: e.message });
      btn.innerText = "Erreur r\u00E9seau";
      btn.style.background = "#ef4444";
    }

    setTimeout(function() { btn.innerText = "Sync TP"; btn.style.background = "#6366f1"; }, 3000);
  })();
}

export function showSyncTPButton() {
  if (document.getElementById('optibot-sync-tp-btn')) return;
  if (!document.querySelector('#grid_pointage_tiers_payant')) return;
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.id = 'optibot-sync-tp-btn';
  btn.innerText = 'Sync TP';
  btn.style.cssText = [
    'z-index: 999999;',
    'background: #6366f1; color: white; border: none; padding: 12px 20px;',
    'border-radius: 50px; font-weight: bold; cursor: pointer;',
    'box-shadow: 0 4px 15px rgba(0,0,0,0.2); font-family: sans-serif;',
    'transition: all 0.2s;'
  ].join('');
  btn.onclick = function() { syncTPToOptiBot(btn); };
  document.body.appendChild(btn);
  stackButtons();
}
