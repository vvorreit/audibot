"use strict";
(() => {
  // extension-src/popup/index.js
  document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll(".collapsible-trigger").forEach(function(trigger) {
      trigger.addEventListener("click", function() {
        var contentId = this.id.replace("-trigger", "-content");
        var content = document.getElementById(contentId);
        if (!content) return;
        var isOpen = content.classList.contains("open");
        content.classList.toggle("open", !isOpen);
        this.classList.toggle("open", !isOpen);
      });
    });
    function initToggle(checkboxId, trackId, thumbId) {
      var cb = document.getElementById(checkboxId);
      var track = document.getElementById(trackId);
      var thumb = document.getElementById(thumbId);
      if (!cb || !track || !thumb) return;
      function update() {
        track.style.background = cb.checked ? "#2563eb" : "#d1d5db";
        thumb.style.transform = cb.checked ? "translateX(18px)" : "translateX(0)";
      }
      cb.addEventListener("change", update);
      update();
    }
    initToggle("toggle-buttons", "toggle-track", "toggle-thumb");
    initToggle("toggle-autofill", "toggle-autofill-track", "toggle-autofill-thumb");
    initToggle("toggle-rejet", "toggle-rejet-track", "toggle-rejet-thumb");
    initToggle("toggle-preview", "toggle-preview-track", "toggle-preview-thumb");
  });
  document.addEventListener("DOMContentLoaded", () => {
    const dataContainer = document.getElementById("data-container");
    let editingKey = null;
    function esc(str) {
      if (str === null || str === void 0) return "";
      return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
    const PLAN_LABELS = { FREE: "Free", ESSENTIEL: "Essentiel", PRO: "Pro", EQUIPE: "Equipe" };
    const INACTIVITY_MINUTES = 15;
    function renewLock() {
      chrome.storage.local.set({ audibot_lock: { lockAt: Date.now() + INACTIVITY_MINUTES * 60 * 1e3 } });
      chrome.runtime.sendMessage({ type: "AUDIBOT_RENEW_LOCK" });
    }
    document.addEventListener("click", renewLock);
    document.addEventListener("keydown", renewLock);
    function showLocked(message) {
      var body = document.body.querySelector(".container");
      if (!body) body = document.body;
      body.innerHTML = '<div style="padding: 20px; text-align: center;"><div style="font-size: 32px; margin-bottom: 12px;">&#128274;</div><p style="font-weight: bold;">Session verrouill\xE9e</p><p style="font-size: 12px; color: #6b7280;">' + (message || "15 minutes d'inactivit\xE9") + '</p><button id="unlock-btn" style="margin-top: 12px; padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">D\xE9verrouiller</button></div>';
      var btn = document.getElementById("unlock-btn");
      if (btn) btn.addEventListener("click", attemptUnlock);
    }
    function showBlockedGlobal(error) {
      var container = document.body.querySelector(".container");
      if (!container) container = document.body;
      container.innerHTML = '<div style="padding: 20px; text-align: center;"><div style="font-size: 32px; margin-bottom: 12px;">&#128274;</div><p style="font-weight: bold; color: #dc2626; margin: 0 0 8px 0;">Compte requis</p><p style="font-size: 12px; color: #6b7280; margin-bottom: 16px;">' + error + '</p><a href="https://audibot.fr/dashboard" target="_blank" style="display:inline-block; padding: 10px 20px; background: #2563eb; color: white; border-radius: 8px; font-weight: bold; text-decoration: none; font-size: 13px;">Ouvrir AudiBot &rarr;</a></div>';
    }
    function attemptUnlock() {
      chrome.storage.local.get(["audibot_auth"], function(result) {
        var auth = result.audibot_auth || {};
        var token = auth.syncToken;
        if (!token) {
          showBlockedGlobal("Connectez-vous sur audibot.fr pour utiliser l'extension.");
          return;
        }
        fetch("https://audibot.fr/api/extension/verify", { headers: { "Authorization": "Bearer " + token } }).then(function(r) {
          return r.json();
        }).then(function(data) {
          if (data.ok) {
            renewLock();
            location.reload();
          } else {
            showBlockedGlobal(data.error || "Impossible de v\xE9rifier votre compte.");
          }
        }).catch(function() {
          showBlockedGlobal("Impossible de v\xE9rifier votre compte (r\xE9seau).");
        });
      });
    }
    chrome.storage.local.get(["audibot_lock"], function(result) {
      var lockData = result.audibot_lock || {};
      var lockAt = lockData.lockAt || 0;
      if (lockAt > 0 && Date.now() > lockAt) {
        showLocked("Session verrouill\xE9e apr\xE8s inactivit\xE9.");
        return;
      }
      renewLock();
      startPopup();
    });
    function startPopup() {
      async function verifyAccount() {
        return new Promise((resolve) => {
          chrome.storage.local.get(["audibot_auth"], (result) => {
            const auth = result.audibot_auth || {};
            const token = auth.syncToken || null;
            const expiresAt = auth.authExpiresAt || 0;
            if (!token) {
              resolve({ ok: false, error: "Connectez-vous sur audibot.fr pour utiliser l'extension." });
              return;
            }
            if (expiresAt && Date.now() > expiresAt) {
              resolve({ ok: false, error: "Session expir\xE9e. Ouvrez audibot.fr pour continuer." });
              return;
            }
            fetch("https://audibot.fr/api/extension/verify", { headers: { "Authorization": "Bearer " + token } }).then(function(r) {
              return r.json();
            }).then(function(data) {
              resolve(data);
            }).catch(function() {
              resolve({ ok: false, error: "Impossible de v\xE9rifier votre compte (r\xE9seau)." });
            });
          });
        });
      }
      function showBlocked(error) {
        var container = document.getElementById("data-container");
        container.parentElement.innerHTML = '<div style="padding: 20px; text-align: center;"><div style="font-size: 32px; margin-bottom: 12px;">&#128274;</div><p style="font-weight: bold; color: #dc2626; margin: 0 0 8px 0;">Compte requis</p><p style="font-size: 12px; color: #6b7280; margin-bottom: 16px;">' + error + '</p><a href="https://audibot.fr/dashboard" target="_blank" style="display:inline-block; padding: 10px 20px; background: #2563eb; color: white; border-radius: 8px; font-weight: bold; text-decoration: none; font-size: 13px;">Ouvrir AudiBot &rarr;</a></div>';
      }
      function showVerifiedBadge(plan, expiresAt) {
        var label = PLAN_LABELS[plan] || plan;
        var badge = document.createElement("div");
        badge.style.cssText = "font-size:10px; padding: 4px 8px; background: #dcfce7; color: #166534; border-radius: 12px; font-weight: 700; display: inline-block; margin-bottom: 8px;";
        badge.textContent = "\u2713 " + label + " connect\xE9";
        var h2 = document.querySelector("h2");
        if (h2) h2.parentElement.insertBefore(badge, h2.nextSibling);
        if (expiresAt) {
          var remaining = expiresAt - Date.now();
          if (remaining > 0 && remaining < 60 * 60 * 1e3) {
            var hours = Math.ceil(remaining / (60 * 60 * 1e3));
            var warning = document.createElement("div");
            warning.style.cssText = "font-size:10px; padding: 6px 10px; background: #fef3c7; color: #92400e; border-radius: 8px; margin-bottom: 8px; border: 1px solid #fde68a;";
            warning.textContent = "\u26A0\uFE0F Session expire dans " + (hours > 0 ? hours + "h" : "quelques minutes") + " \u2014 ouvrez le dashboard pour renouveler automatiquement.";
            if (h2) h2.parentElement.insertBefore(warning, badge.nextSibling);
          }
        }
      }
      dataContainer.innerHTML = '<div class="no-data" style="text-align:center;padding:20px;">V\xE9rification du compte...</div>';
      verifyAccount().then(function(result) {
        if (!result.ok) {
          showBlocked(result.error);
          return;
        }
        chrome.storage.local.get(["audibot_auth"], function(authResult) {
          var auth = authResult.audibot_auth || {};
          showVerifiedBadge(result.plan, auth.authExpiresAt);
        });
        dataContainer.innerHTML = '<div class="no-data">Chargement des donn\xE9es...</div>';
        initPopup(result.plan);
      });
      function initPopup(currentPlan) {
        function getValue(obj, path) {
          return path.split(".").reduce((acc, part) => acc && acc[part], obj) || "";
        }
        function setValue(obj, path, value) {
          const parts = path.split(".");
          let current = obj;
          for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!current[part]) current[part] = {};
            current = current[part];
          }
          current[parts[parts.length - 1]] = value;
        }
        async function renderData() {
          var cache = await readEncryptedCache();
          if (!cache) cache = {};
          var audibot_auth_cache = await new Promise(function(resolve) {
            chrome.storage.local.get(["audibot_auth"], function(r) {
              resolve(r.audibot_auth || {});
            });
          });
          var data = cache.current;
          if (!data) {
            dataContainer.innerHTML = '<div class="card no-data">Aucune donn\xE9e en cache.</div>';
            return;
          }
          dataContainer.innerHTML = "";
          {
            const key = "current";
            const isEditing = editingKey === key;
            const card = document.createElement("div");
            card.className = "card";
            const updatedAt = data.updatedAt ? new Date(data.updatedAt).toLocaleTimeString() : "Inconnue";
            const sections = [
              {
                title: "\xC9tat Civil",
                fields: [
                  { id: "nom", label: "Nom" },
                  { id: "prenom", label: "Pr\xE9nom" },
                  { id: "dob", label: "N\xE9(e) le" },
                  { id: "nss", label: "NSS" },
                  { id: "phone", label: "T\xE9l" },
                  { id: "email", label: "Email" },
                  { id: "address", label: "Adresse" },
                  { id: "zipCode", label: "CP" },
                  { id: "city", label: "Ville" }
                ]
              },
              {
                title: "Ordonnance",
                fields: (function() {
                  var hasOcr = getValue(data, "ordonnance.nomOphtalmologue") || getValue(data, "ordonnance.lunettesOD.sphere");
                  if (hasOcr) {
                    return [
                      { id: "ordonnance.typePrescription", label: "Type" },
                      { id: "ordonnance.nomOphtalmologue", label: "Ophtalmo" },
                      { id: "ordonnance.dateOrdonnance", label: "Date Ord." },
                      { id: "ordonnance.distancePupillaire", label: "DP" },
                      { id: "ordonnance.lunettesOD.sphere", label: "OD Sph" },
                      { id: "ordonnance.lunettesOD.cylindre", label: "OD Cyl" },
                      { id: "ordonnance.lunettesOD.axe", label: "OD Axe" },
                      { id: "ordonnance.lunettesOD.addition", label: "OD Add" },
                      { id: "ordonnance.lunettesOG.sphere", label: "OG Sph" },
                      { id: "ordonnance.lunettesOG.cylindre", label: "OG Cyl" },
                      { id: "ordonnance.lunettesOG.axe", label: "OG Axe" },
                      { id: "ordonnance.lunettesOG.addition", label: "OG Add" },
                      { id: "ordonnance.lentillesOD.rayonCourbure", label: "OD RC" },
                      { id: "ordonnance.lentillesOD.diametre", label: "OD Dia" },
                      { id: "ordonnance.lentillesOG.rayonCourbure", label: "OG RC" },
                      { id: "ordonnance.lentillesOG.diametre", label: "OG Dia" },
                      { id: "ordonnance.remarques", label: "Remarques" }
                    ];
                  }
                  return [
                    { id: "prescription.prescripteur", label: "Prescripteur" },
                    { id: "prescription.rpps", label: "RPPS" },
                    { id: "prescription.typeVision", label: "Vision" },
                    { id: "prescription.datePrescription", label: "Date" },
                    { id: "prescription.od.sphere", label: "OD Sph" },
                    { id: "prescription.od.cylindre", label: "OD Cyl" },
                    { id: "prescription.od.axe", label: "OD Axe" },
                    { id: "prescription.od.addition", label: "OD Add" },
                    { id: "prescription.og.sphere", label: "OG Sph" },
                    { id: "prescription.og.cylindre", label: "OG Cyl" },
                    { id: "prescription.og.axe", label: "OG Axe" },
                    { id: "prescription.og.addition", label: "OG Add" },
                    { id: "prescription.lentillesOD.sphere", label: "Lent OD Sph" },
                    { id: "prescription.lentillesOD.cylindre", label: "Lent OD Cyl" },
                    { id: "prescription.lentillesOG.sphere", label: "Lent OG Sph" },
                    { id: "prescription.lentillesOG.cylindre", label: "Lent OG Cyl" }
                  ];
                })()
              }
            ];
            let html = `
          <div class="section-title">
            <span>${isEditing ? "Modification" : `Donn\xE9es de ${esc(data.prenom || "")} ${esc(data.nom || "Client")}`}</span>
            <div class="actions-group">
              ${isEditing ? `
                <button class="save-btn" data-key="${key}">Sauver</button>
                <button class="cancel-btn">Annuler</button>
              ` : `
                <button id="audibot-edit-patient" style="background:none;border:none;color:#2563eb;cursor:pointer;font-size:11px;font-weight:600;">Editer</button>
                <button class="edit-btn" data-key="${key}">Modifier</button>
                <button class="clear-btn" data-key="${key}">Effacer</button>
              `}
            </div>
          </div>
          <div class="tag">Mise \xE0 jour : ${updatedAt}</div>
          <div id="audibot-patient-data" class="data-list">
        `;
            sections.forEach((section) => {
              const hasData = section.fields.some((f) => getValue(data, f.id));
              if (isEditing || hasData) {
                html += `<div style="margin: 8px 0 4px 0; font-weight: bold; font-size: 11px; color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 2px;">${esc(section.title)}</div>`;
                section.fields.forEach((field) => {
                  const val = getValue(data, field.id);
                  if (isEditing) {
                    html += `
                  <div class="data-item editing">
                    <span class="data-label">${field.label}</span>
                    <input type="text" class="edit-input" data-field="${field.id}" value="${esc(val)}">
                  </div>
                `;
                  } else if (val) {
                    html += `
                  <div class="data-item">
                    <span class="data-label">${field.label}</span>
                    <span class="data-value">${esc(val)}</span>
                  </div>
                `;
                  }
                });
              }
            });
            html += `</div>`;
            if (data.regimes || isEditing) {
              var rg = data.regimes || {};
              html += `<div style="margin: 8px 0 4px 0; font-weight: bold; font-size: 11px; color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 2px;">R\xE9gimes</div>`;
              var regimeFields = [
                { path: "regimes.ro.nom", label: "RO" },
                { path: "regimes.ro.tauxPEC", label: "Taux PEC" },
                { path: "regimes.rc1.nom", label: "RC1" },
                { path: "regimes.rc1.numeroAdherent", label: "N\xB0 adh\xE9rent" },
                { path: "regimes.rc1.numeroContrat", label: "N\xB0 contrat" },
                { path: "regimes.rc1.numeroTeletransmission", label: "N\xB0 t\xE9l\xE9tr." },
                { path: "regimes.rc1.codeConvention", label: "Convention" },
                { path: "regimes.rc2.nom", label: "RC2" },
                { path: "regimes.rc2.numeroAdherent", label: "N\xB0 adh\xE9rent 2" }
              ];
              regimeFields.forEach(function(f) {
                var val = getValue(data, f.path) || "";
                if (isEditing) {
                  html += `<div class="data-item editing"><span class="data-label">${esc(f.label)}</span><input type="text" class="edit-input" data-field="${f.path}" value="${esc(String(val))}"></div>`;
                } else if (val) {
                  html += `<div class="data-item"><span class="data-label">${esc(f.label)}</span><span class="data-value">${esc(String(val))}</span></div>`;
                }
              });
            }
            if (data.equipements && data.equipements.length > 0) {
              html += `<div style="margin: 8px 0 4px 0; font-weight: bold; font-size: 11px; color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 2px;">\xC9quipements (${data.equipements.length})</div>`;
              data.equipements.forEach(function(eq, idx) {
                var eqLabel = eq.numero === "1" ? "Principal" : "Secondaire " + (eq.numero - 1);
                html += `<div class="eq-card" data-eq-index="${idx}">`;
                html += `<div class="eq-header"><span class="eq-title">${eqLabel} \u2014 ${esc(eq.type || "Lunettes")} ${eq.vision ? "(" + esc(eq.vision) + ")" : ""}</span><div><button class="eq-edit-btn" data-cache-key="${key}" data-eq-idx="${idx}" style="margin-right:4px;">Modifier</button><button class="eq-delete" data-cache-key="${key}" data-eq-idx="${idx}">Supprimer</button></div></div>`;
                if (eq.correction) {
                  html += `<div class="eq-correction">${esc(eq.correction)}</div>`;
                }
                if (eq.lignes && eq.lignes.length > 0) {
                  eq.lignes.forEach(function(l, li) {
                    var typeLabel = l.type === "monture" ? "Monture" : l.type === "verre" ? "Verre " + l.oeil : "Suppl. " + l.oeil;
                    var pfx = "eq_" + idx + "_l_" + li + "_";
                    html += `<div class="eq-line" style="flex-direction:column;gap:2px;">`;
                    html += `<div style="font-size:11px;font-weight:700;color:#1e293b;">${esc(typeLabel)}</div>`;
                    var lppManquant = l.type !== "supplement" && !l.codeLPP;
                    var fields = [
                      { key: "designation", label: "Article", val: l.designation, cls: "", style: "font-size:10px;" },
                      { key: "codeLPP", label: "Code LPP", val: lppManquant ? "\u2014 \u26A0\uFE0F" : l.codeLPP || "", cls: "eq-lpp", show: !!l.codeLPP || lppManquant, style: lppManquant ? "color:#dc2626;font-weight:700;" : "", title: lppManquant ? "Code LPP manquant \u2014 le RPA ne pourra pas compl\xE9ter cette section" : "" },
                      { key: "classe", label: "Classe", val: l.classe || "", cls: "", show: !!l.classe },
                      { key: "prixBrut", label: "Prix brut", val: l.prixBrut.toFixed(2), cls: "", suffix: " \u20AC" },
                      { key: "remise", label: "Remise", val: l.remise.toFixed(2), cls: "", suffix: " \u20AC", show: l.remise > 0 },
                      { key: "prixNet", label: "Prix net", val: l.prixNet.toFixed(2), cls: "eq-prix", suffix: " \u20AC" },
                      { key: "ro", label: "RO", val: l.ro.toFixed(2), cls: "", suffix: " \u20AC" },
                      { key: "rc1", label: "RC", val: l.rc1.toFixed(2), cls: "", suffix: " \u20AC" },
                      { key: "rac", label: "RAC", val: l.rac.toFixed(2), cls: "eq-rac", suffix: " \u20AC" }
                    ];
                    fields.forEach(function(f) {
                      if (f.show === false) return;
                      if (isEditing) {
                        html += `<div class="data-item editing"><span class="data-label">${esc(f.label)}</span><input type="text" class="edit-input eq-field-input" data-eq-idx="${idx}" data-line-idx="${li}" data-field-key="${f.key}" value="${esc(String(f.val))}"></div>`;
                      } else {
                        html += `<div class="data-item"><span class="data-label">${esc(f.label)}</span><span class="data-value ${f.cls}" ${f.style ? 'style="' + f.style + '"' : ""} ${f.title ? 'title="' + f.title + '"' : ""}>${esc(String(f.val))}${f.suffix || ""}</span></div>`;
                      }
                    });
                    html += `</div>`;
                  });
                }
                if (eq.totaux && eq.totaux.net) {
                  html += `<div class="eq-total">Total: <span class="eq-prix">${eq.totaux.net.toFixed(2)}\u20AC</span> | RO: ${eq.totaux.ro.toFixed(2)}\u20AC | RC: ${eq.totaux.rc1.toFixed(2)}\u20AC | RAC: <span class="eq-rac">${eq.totaux.rac.toFixed(2)}\u20AC</span></div>`;
                }
                html += `</div>`;
              });
              if (data.totalProposition) {
                html += `<div style="font-size:11px;font-weight:800;color:#2563eb;margin-top:6px;padding:4px 6px;background:#eff6ff;border-radius:6px;">Proposition: ${data.totalProposition.toFixed(2)}\u20AC | RAC: <span class="eq-rac">${(data.racProposition || 0).toFixed(2)}\u20AC</span></div>`;
              }
            }
            card.innerHTML = html;
            dataContainer.appendChild(card);
          }
          (async function() {
            try {
              var syncToken = await getSyncToken();
              if (!syncToken) return;
              chrome.tabs.query({ active: true, currentWindow: true }, async function(tabs) {
                if (!tabs || !tabs[0] || !tabs[0].url) return;
                var tabUrl = tabs[0].url;
                var tabId = tabs[0].id;
                var parsedHostname = "";
                try {
                  parsedHostname = new URL(tabUrl).hostname.replace(/^www\./, "");
                } catch (e) {
                  return;
                }
                if (!parsedHostname) return;
                try {
                  var res = await fetch("https://audibot.fr/api/extension/parcours?hostname=" + encodeURIComponent(parsedHostname), { headers: { "Authorization": "Bearer " + syncToken } });
                  if (!res.ok) return;
                  var resData = await res.json();
                  var parcoursList = resData.parcours || [];
                  if (parcoursList.length === 0) return;
                  var container = document.getElementById("data-container");
                  if (!container) return;
                  var bloc = document.createElement("div");
                  bloc.style.cssText = "margin-bottom:10px;padding:10px;background:#f0f7ff;border-radius:10px;border:1px solid #bfdbfe;";
                  var title = document.createElement("div");
                  title.style.cssText = "font-size:11px;font-weight:700;color:#1d4ed8;margin-bottom:8px;";
                  title.textContent = "\u{1F916} Parcours disponibles";
                  bloc.appendChild(title);
                  parcoursList.forEach(function(p) {
                    var row = document.createElement("div");
                    row.style.cssText = "display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;";
                    var label = document.createElement("span");
                    label.style.cssText = "font-size:12px;color:#1e3a8a;font-weight:600;flex:1;margin-right:8px;";
                    label.textContent = p.nom;
                    var btnLaunch = document.createElement("button");
                    btnLaunch.textContent = "\u25B6 Lancer";
                    btnLaunch.style.cssText = "padding:5px 10px;background:#2563eb;color:white;border:none;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;";
                    btnLaunch.addEventListener("click", function() {
                      if (!tabId) return;
                      chrome.tabs.sendMessage(tabId, { type: "AUDIBOT_LAUNCH_PARCOURS", parcoursId: p.id });
                      window.close();
                    });
                    row.appendChild(label);
                    row.appendChild(btnLaunch);
                    bloc.appendChild(row);
                  });
                  container.insertBefore(bloc, container.firstChild);
                } catch (e) {
                }
              });
            } catch (e) {
            }
          })();
          document.querySelectorAll(".edit-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
              editingKey = "current";
              renderData();
            });
          });
          document.querySelectorAll(".cancel-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
              editingKey = null;
              renderData();
            });
          });
          document.querySelectorAll(".save-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
              saveChanges();
            });
          });
          document.querySelectorAll(".clear-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
              deleteEntry();
            });
          });
          document.querySelectorAll(".eq-delete").forEach((btn) => {
            btn.addEventListener("click", (e) => {
              const eqIdx = parseInt(e.target.getAttribute("data-eq-idx"), 10);
              deleteEquipement(eqIdx);
            });
          });
          document.querySelectorAll(".eq-edit-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
              editingKey = "current";
              renderData();
            });
          });
          var editBtn = document.getElementById("audibot-edit-patient");
          if (editBtn) {
            editBtn.onclick = function() {
              var container = document.getElementById("audibot-patient-data");
              if (!container) return;
              var fields = [
                { key: "nom", label: "Nom" },
                { key: "prenom", label: "Prenom" },
                { key: "nss", label: "NSS" },
                { key: "dob", label: "Date naiss." },
                { key: "phone", label: "Telephone" },
                { key: "regimes.rc1.nom", label: "Mutuelle" },
                { key: "regimes.rc1.numeroAdherent", label: "N adherent" }
              ];
              container.innerHTML = "";
              for (var i = 0; i < fields.length; i++) {
                var row = document.createElement("div");
                row.style.cssText = "display:flex;align-items:center;gap:8px;margin-bottom:6px;";
                var lbl = document.createElement("label");
                lbl.style.cssText = "font-size:11px;color:#6b7280;width:80px;flex-shrink:0;";
                lbl.textContent = fields[i].label;
                var inp = document.createElement("input");
                inp.type = "text";
                inp.dataset.field = fields[i].key;
                inp.value = getValue(data, fields[i].key) || "";
                inp.style.cssText = "flex:1;padding:4px 8px;border:1px solid #d1d5db;border-radius:6px;font-size:12px;";
                row.appendChild(lbl);
                row.appendChild(inp);
                container.appendChild(row);
              }
              var btnRow = document.createElement("div");
              btnRow.style.cssText = "display:flex;gap:8px;margin-top:8px;";
              var saveBtn = document.createElement("button");
              saveBtn.textContent = "Sauvegarder";
              saveBtn.style.cssText = "flex:1;padding:6px;border:none;border-radius:6px;background:#2563eb;color:white;font-size:12px;font-weight:600;cursor:pointer;";
              saveBtn.onclick = async function() {
                var inputs = container.querySelectorAll("input[data-field]");
                var cacheObj = await readEncryptedCache() || {};
                if (!cacheObj.current) cacheObj.current = {};
                for (var j = 0; j < inputs.length; j++) {
                  var key = inputs[j].dataset.field;
                  setValue(cacheObj.current, key, inputs[j].value);
                }
                cacheObj.current.updatedAt = Date.now();
                await writeEncryptedCache(cacheObj);
                location.reload();
              };
              var cancelBtn = document.createElement("button");
              cancelBtn.textContent = "Annuler";
              cancelBtn.style.cssText = "flex:1;padding:6px;border:1px solid #d1d5db;border-radius:6px;background:white;color:#374151;font-size:12px;cursor:pointer;";
              cancelBtn.onclick = function() {
                location.reload();
              };
              btnRow.appendChild(cancelBtn);
              btnRow.appendChild(saveBtn);
              container.appendChild(btnRow);
            };
          }
        }
        async function saveChanges() {
          const inputs = document.querySelectorAll(`.edit-input`);
          var cache = await readEncryptedCache();
          if (!cache) cache = {};
          if (cache.current) {
            const updatedData = JSON.parse(JSON.stringify(cache.current));
            inputs.forEach((input) => {
              const path = input.getAttribute("data-field");
              if (path) {
                setValue(updatedData, path, input.value);
                return;
              }
              const eqIdx = input.getAttribute("data-eq-idx");
              const lineIdx = input.getAttribute("data-line-idx");
              const fieldKey = input.getAttribute("data-field-key");
              if (eqIdx !== null && lineIdx !== null && fieldKey && updatedData.equipements) {
                var ei = parseInt(eqIdx, 10);
                var li = parseInt(lineIdx, 10);
                if (updatedData.equipements[ei] && updatedData.equipements[ei].lignes[li]) {
                  var val = input.value;
                  if (["prixBrut", "remise", "prixNet", "ro", "rc1", "rac"].indexOf(fieldKey) !== -1) {
                    val = parseFloat(val.replace(",", ".")) || 0;
                  }
                  updatedData.equipements[ei].lignes[li][fieldKey] = val;
                }
              }
            });
            updatedData.updatedAt = Date.now();
            await writeEncryptedCache({ current: updatedData });
            editingKey = null;
            renderData();
          }
        }
        async function deleteEntry() {
          await writeEncryptedCache({});
          editingKey = null;
          renderData();
        }
        async function deleteEquipement(eqIdx) {
          var cache = await readEncryptedCache();
          if (!cache) cache = {};
          if (cache.current && cache.current.equipements) {
            cache.current.equipements.splice(eqIdx, 1);
            cache.current.updatedAt = Date.now();
            await writeEncryptedCache(cache);
            renderData();
          }
        }
        async function importFromClipboard() {
          const importBtn2 = document.getElementById("import-btn");
          try {
            const text = await navigator.clipboard.readText();
            const data = JSON.parse(text);
            if (!data.m && !data.o) {
              if (importBtn2) {
                importBtn2.innerText = "Rien \xE0 importer";
                setTimeout(() => {
                  importBtn2.innerText = "Importer depuis AudiBot";
                }, 2e3);
              }
              return;
            }
            const m = data.m || {};
            const o = data.o || {};
            await writeEncryptedCache({
              current: {
                ...m,
                ordonnance: o || {},
                updatedAt: Date.now()
              }
            });
            if (importBtn2) {
              importBtn2.innerText = "Import\xE9 !";
              setTimeout(() => {
                importBtn2.innerText = "Importer depuis AudiBot";
              }, 2e3);
            }
            renderData();
          } catch (e) {
            if (importBtn2) {
              importBtn2.innerText = "Erreur";
              setTimeout(() => {
                importBtn2.innerText = "Importer depuis AudiBot";
              }, 2e3);
            }
          }
        }
        const importBtn = document.createElement("button");
        importBtn.id = "import-btn";
        importBtn.innerText = "Importer depuis AudiBot";
        importBtn.style.cssText = "width:100%;padding:10px;margin-bottom:12px;background:#2563eb;color:white;border:none;border-radius:12px;font-weight:bold;cursor:pointer;font-size:13px;";
        importBtn.addEventListener("click", importFromClipboard);
        dataContainer.parentElement.insertBefore(importBtn, dataContainer);
        var recorderSection = document.createElement("div");
        recorderSection.style.cssText = "margin-bottom:12px;padding:10px;background:#fef2f2;border:1px solid #fecaca;border-radius:12px;";
        var recorderTitle = document.createElement("div");
        recorderTitle.style.cssText = "font-size:11px;font-weight:700;color:#7f1d1d;margin-bottom:8px;";
        recorderTitle.textContent = "\u23FA Enregistrer un parcours";
        var btnRecord = document.createElement("button");
        btnRecord.id = "audibot-btn-record";
        btnRecord.textContent = "\u23FA D\xE9marrer l'enregistrement";
        btnRecord.style.cssText = "width:100%;padding:8px;background:#ef4444;color:white;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;margin-bottom:4px;";
        var btnStop = document.createElement("button");
        btnStop.id = "audibot-btn-stop";
        btnStop.textContent = "\u23F9 Arr\xEAter et sauvegarder";
        btnStop.style.cssText = "width:100%;padding:8px;background:#64748b;color:white;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;display:none;";
        var recorderStatus = document.createElement("div");
        recorderStatus.id = "audibot-recorder-status";
        recorderStatus.style.cssText = "font-size:10px;color:#6b7280;text-align:center;margin-top:4px;";
        btnRecord.addEventListener("click", function() {
          chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs[0] && tabs[0].id) {
              chrome.tabs.sendMessage(tabs[0].id, { type: "AUDIBOT_RECORDER_START" });
              btnRecord.style.display = "none";
              btnStop.style.display = "block";
              recorderStatus.textContent = "Enregistrement en cours...";
            }
          });
        });
        btnStop.addEventListener("click", function() {
          chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs[0] && tabs[0].id) {
              chrome.tabs.sendMessage(tabs[0].id, { type: "AUDIBOT_RECORDER_STOP" });
              btnRecord.style.display = "block";
              btnStop.style.display = "none";
              recorderStatus.textContent = "Parcours sauvegard\xE9 \u2014 en attente de validation admin";
            }
          });
        });
        recorderSection.appendChild(recorderTitle);
        recorderSection.appendChild(btnRecord);
        recorderSection.appendChild(btnStop);
        recorderSection.appendChild(recorderStatus);
        dataContainer.parentElement.insertBefore(recorderSection, dataContainer);
        chrome.storage.local.get(["audibot_recorder"], function(result) {
          var saved = result.audibot_recorder;
          if (saved && saved.active) {
            btnRecord.style.display = "none";
            btnStop.style.display = "block";
            recorderStatus.textContent = "\u23FA En cours \u2014 " + (saved.etapes ? saved.etapes.length : 0) + " \xE9tapes enregistr\xE9es";
          }
        });
        renderData();
        chrome.storage.onChanged.addListener(function(changes, area) {
          if (area === "local" && changes.audibot_cache) {
            renderData();
          }
        });
        const toggleCheckbox = document.getElementById("toggle-buttons");
        const toggleTrack = document.getElementById("toggle-track");
        const toggleThumb = document.getElementById("toggle-thumb");
        function updateToggleUI(visible) {
          if (!toggleCheckbox || !toggleTrack || !toggleThumb) return;
          toggleCheckbox.checked = visible;
          toggleTrack.style.background = visible ? "#2563eb" : "#d1d5db";
          toggleThumb.style.transform = visible ? "translateX(20px)" : "translateX(0)";
        }
        chrome.storage.local.get(["audibot_buttons_visible"], (result) => {
          const visible = result.audibot_buttons_visible !== false;
          updateToggleUI(visible);
        });
        if (toggleCheckbox) {
          toggleCheckbox.addEventListener("change", () => {
            const visible = toggleCheckbox.checked;
            chrome.storage.local.set({ audibot_buttons_visible: visible });
            updateToggleUI(visible);
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, { type: "AUDIBOT_TOGGLE_BUTTONS", visible });
              }
            });
          });
        }
        const toggleAutofill = document.getElementById("toggle-autofill");
        const toggleAutofillTrack = document.getElementById("toggle-autofill-track");
        const toggleAutofillThumb = document.getElementById("toggle-autofill-thumb");
        function updateAutofillToggleUI(enabled) {
          if (!toggleAutofill || !toggleAutofillTrack || !toggleAutofillThumb) return;
          toggleAutofill.checked = enabled;
          toggleAutofillTrack.style.background = enabled ? "#2563eb" : "#d1d5db";
          toggleAutofillThumb.style.transform = enabled ? "translateX(20px)" : "translateX(0)";
        }
        chrome.storage.local.get(["audibot_settings"], (result) => {
          var settings = result.audibot_settings || {};
          var enabled = settings.autofillOnLoad !== false;
          updateAutofillToggleUI(enabled);
        });
        if (toggleAutofill) {
          toggleAutofill.addEventListener("change", () => {
            chrome.storage.local.get(["audibot_settings"], (result) => {
              var settings = result.audibot_settings || {};
              settings.autofillOnLoad = toggleAutofill.checked;
              chrome.storage.local.set({ audibot_settings: settings });
              updateAutofillToggleUI(toggleAutofill.checked);
            });
          });
        }
        const toggleRejet = document.getElementById("toggle-rejet");
        const toggleRejetTrack = document.getElementById("toggle-rejet-track");
        const toggleRejetThumb = document.getElementById("toggle-rejet-thumb");
        function updateRejetToggleUI(enabled) {
          if (!toggleRejet || !toggleRejetTrack || !toggleRejetThumb) return;
          toggleRejet.checked = enabled;
          toggleRejetTrack.style.background = enabled ? "#2563eb" : "#d1d5db";
          toggleRejetThumb.style.transform = enabled ? "translateX(20px)" : "translateX(0)";
        }
        chrome.storage.local.get(["audibot_rejet_consent"], (result) => {
          const enabled = result.audibot_rejet_consent === true;
          updateRejetToggleUI(enabled);
        });
        if (toggleRejet) {
          toggleRejet.addEventListener("change", () => {
            const enabled = toggleRejet.checked;
            chrome.storage.local.set({
              audibot_rejet_consent: enabled,
              audibot_rejet_enabled: enabled
            });
            updateRejetToggleUI(enabled);
          });
        }
        const togglePreview = document.getElementById("toggle-preview");
        const togglePreviewTrack = document.getElementById("toggle-preview-track");
        const togglePreviewThumb = document.getElementById("toggle-preview-thumb");
        function updatePreviewToggleUI(enabled) {
          if (!togglePreview || !togglePreviewTrack || !togglePreviewThumb) return;
          togglePreview.checked = enabled;
          togglePreviewTrack.style.background = enabled ? "#2563eb" : "#d1d5db";
          togglePreviewThumb.style.transform = enabled ? "translateX(20px)" : "translateX(0)";
        }
        chrome.storage.local.get(["audibot_settings"], (result) => {
          var settings = result.audibot_settings || {};
          updatePreviewToggleUI(settings.previewBeforeFill || false);
        });
        if (togglePreview) {
          togglePreview.addEventListener("change", () => {
            chrome.storage.local.get(["audibot_settings"], (result) => {
              var settings = result.audibot_settings || {};
              settings.previewBeforeFill = togglePreview.checked;
              chrome.storage.local.set({ audibot_settings: settings });
              updatePreviewToggleUI(togglePreview.checked);
            });
          });
        }
        function loadTPTracker() {
          var card = document.getElementById("card-tp-tracker");
          var list = document.getElementById("tp-tracker-list");
          if (!card || !list) return;
          chrome.storage.local.get(["audibot_tp_history", "audibot_auth"], function(result) {
            var auth = result.audibot_auth || {};
            if (!auth.syncToken) {
              card.style.display = "none";
              return;
            }
            card.style.display = "block";
            fetch("https://audibot.fr/api/extension/tp-status", {
              headers: { "Authorization": "Bearer " + auth.syncToken }
            }).then(function(r) {
              return r.json();
            }).then(function(data) {
              var dossiers = data.dossiers || [];
              if (dossiers.length === 0) {
                list.textContent = "Aucun dossier TP en cours.";
                return;
              }
              list.innerHTML = "";
              var statusIcons = { accepted: "\u2705", pending: "\u23F3", rejected: "\u274C" };
              var statusColors = { accepted: "#059669", pending: "#d97706", rejected: "#dc2626" };
              for (var i = 0; i < dossiers.length && i < 10; i++) {
                var d = dossiers[i];
                var row = document.createElement("div");
                row.style.cssText = "display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #f3f4f6;";
                row.innerHTML = "<span>" + esc(d.date || "") + " \u2014 " + esc(d.organisme || "").substring(0, 20) + '</span><span style="display:flex;align-items:center;gap:4px;"><span style="font-size:12px;">' + esc(d.montant || "") + '</span><span style="color:' + (statusColors[d.status] || "#6b7280") + ';font-size:11px;font-weight:600;">' + (statusIcons[d.status] || "?") + " " + esc(d.status || "inconnu") + "</span></span>";
                list.appendChild(row);
              }
              chrome.storage.local.set({ audibot_tp_history: { dossiers, ts: Date.now() } });
            }).catch(function(err) {
              var cached = result.audibot_tp_history;
              if (cached && cached.dossiers) {
                list.textContent = cached.dossiers.length + " dossiers (cache)";
              } else {
                list.textContent = "Impossible de charger les dossiers.";
              }
              console.warn("[AudiBot] TP tracker fetch failed:", err);
            });
          });
        }
        var refreshTPBtn = document.getElementById("btn-refresh-tp");
        if (refreshTPBtn) refreshTPBtn.onclick = loadTPTracker;
        loadTPTracker();
        function loadRejectionDetails() {
          var card = document.getElementById("card-rejections");
          var list = document.getElementById("rejet-details-list");
          var countBadge = document.getElementById("rejet-count");
          if (!card || !list) return;
          chrome.storage.local.get(["audibot_auth"], function(result) {
            var auth = result.audibot_auth || {};
            if (!auth.syncToken) return;
            fetch("https://audibot.fr/api/extension/rejections", {
              headers: { "Authorization": "Bearer " + auth.syncToken }
            }).then(function(r) {
              return r.json();
            }).then(function(data) {
              var rejections = data.rejections || [];
              if (rejections.length === 0) {
                card.style.display = "none";
                return;
              }
              card.style.display = "block";
              if (countBadge) countBadge.textContent = rejections.length + " rejet(s)";
              list.innerHTML = "";
              for (var i = 0; i < rejections.length && i < 5; i++) {
                var r = rejections[i];
                var item = document.createElement("div");
                item.style.cssText = "padding:8px;margin-bottom:6px;background:#fef2f2;border-radius:8px;border-left:3px solid #dc2626;";
                var header = document.createElement("div");
                header.style.cssText = "display:flex;justify-content:space-between;font-size:12px;font-weight:600;color:#991b1b;margin-bottom:4px;";
                header.textContent = esc(r.portail || "Portail") + " \u2014 " + esc(r.date || "");
                item.appendChild(header);
                if (r.reason) {
                  var reason = document.createElement("div");
                  reason.style.cssText = "font-size:11px;color:#7f1d1d;margin-bottom:4px;";
                  reason.textContent = "Raison : " + esc(r.reason);
                  item.appendChild(reason);
                }
                if (r.suggestion) {
                  var sugg = document.createElement("div");
                  sugg.style.cssText = "font-size:11px;color:#065f46;background:#ecfdf5;padding:4px 8px;border-radius:4px;";
                  sugg.textContent = "Action : " + esc(r.suggestion);
                  item.appendChild(sugg);
                }
                list.appendChild(item);
              }
            }).catch(function(err) {
              console.warn("[AudiBot] rejection details fetch failed:", err);
            });
          });
        }
        loadRejectionDetails();
        function loadTeamDashboard(plan) {
          var card = document.getElementById("card-team");
          var stats = document.getElementById("team-stats");
          if (!card || !stats) return;
          if (plan !== "EQUIPE" && plan !== "equipe") return;
          card.style.display = "block";
          chrome.storage.local.get(["audibot_auth"], function(result) {
            var auth = result.audibot_auth || {};
            if (!auth.syncToken) return;
            fetch("https://audibot.fr/api/extension/team-activity", {
              headers: { "Authorization": "Bearer " + auth.syncToken }
            }).then(function(r) {
              return r.json();
            }).then(function(data) {
              var activity = data.activity || {};
              stats.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"><div style="text-align:center;padding:8px;background:#f0f9ff;border-radius:8px;"><div style="font-size:20px;font-weight:700;color:#2563eb;">' + esc(String(activity.fillsToday || 0)) + `</div><div style="font-size:10px;color:#6b7280;">Fills aujourd'hui</div></div><div style="text-align:center;padding:8px;background:#fef2f2;border-radius:8px;"><div style="font-size:20px;font-weight:700;color:#dc2626;">` + esc(String(activity.rejectsToday || 0)) + '</div><div style="font-size:10px;color:#6b7280;">Rejets</div></div><div style="text-align:center;padding:8px;background:#f0fdf4;border-radius:8px;"><div style="font-size:20px;font-weight:700;color:#059669;">' + esc(String(activity.acceptanceRate || "\u2014")) + '</div><div style="font-size:10px;color:#6b7280;">Taux acceptation</div></div><div style="text-align:center;padding:8px;background:#faf5ff;border-radius:8px;"><div style="font-size:20px;font-weight:700;color:#7c3aed;">' + esc(String(activity.activeMembers || 0)) + '</div><div style="font-size:10px;color:#6b7280;">Membres actifs</div></div></div>';
            }).catch(function(err) {
              stats.textContent = "Impossible de charger les donnees equipe.";
              console.warn("[AudiBot] team dashboard fetch failed:", err);
            });
          });
        }
        loadTeamDashboard(currentPlan);
      }
    }
  });
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vZXh0ZW5zaW9uLXNyYy9wb3B1cC9pbmRleC5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLyogXHUyNTAwXHUyNTAwIEZlYXR1cmUgRmxhZ3MgXHUyMDE0IFYxIHBpbG90IFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuY29uc3QgRkVBVFVSRVMgPSB7XG4gIHNtYXJ0RmlsbDogdHJ1ZSxcbiAgcmVtb3RlQ29uZmlnOiB0cnVlXG59O1xuXG4vKiBcdTI1MDBcdTI1MDAgQ29sbGFwc2libGUgc2VjdGlvbnMgKyB0b2dnbGUgaW5pdCAobW92ZWQgZnJvbSBpbmxpbmUgc2NyaXB0IGZvciBDU1ApIFx1MjUwMFx1MjUwMCAqL1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCkge1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY29sbGFwc2libGUtdHJpZ2dlcicpLmZvckVhY2goZnVuY3Rpb24odHJpZ2dlcikge1xuICAgIHRyaWdnZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjb250ZW50SWQgPSB0aGlzLmlkLnJlcGxhY2UoJy10cmlnZ2VyJywgJy1jb250ZW50Jyk7XG4gICAgICB2YXIgY29udGVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbnRlbnRJZCk7XG4gICAgICBpZiAoIWNvbnRlbnQpIHJldHVybjtcbiAgICAgIHZhciBpc09wZW4gPSBjb250ZW50LmNsYXNzTGlzdC5jb250YWlucygnb3BlbicpO1xuICAgICAgY29udGVudC5jbGFzc0xpc3QudG9nZ2xlKCdvcGVuJywgIWlzT3Blbik7XG4gICAgICB0aGlzLmNsYXNzTGlzdC50b2dnbGUoJ29wZW4nLCAhaXNPcGVuKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gaW5pdFRvZ2dsZShjaGVja2JveElkLCB0cmFja0lkLCB0aHVtYklkKSB7XG4gICAgdmFyIGNiID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY2hlY2tib3hJZCk7XG4gICAgdmFyIHRyYWNrID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodHJhY2tJZCk7XG4gICAgdmFyIHRodW1iID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGh1bWJJZCk7XG4gICAgaWYgKCFjYiB8fCAhdHJhY2sgfHwgIXRodW1iKSByZXR1cm47XG4gICAgZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgdHJhY2suc3R5bGUuYmFja2dyb3VuZCA9IGNiLmNoZWNrZWQgPyAnIzI1NjNlYicgOiAnI2QxZDVkYic7XG4gICAgICB0aHVtYi5zdHlsZS50cmFuc2Zvcm0gPSBjYi5jaGVja2VkID8gJ3RyYW5zbGF0ZVgoMThweCknIDogJ3RyYW5zbGF0ZVgoMCknO1xuICAgIH1cbiAgICBjYi5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCB1cGRhdGUpO1xuICAgIHVwZGF0ZSgpO1xuICB9XG4gIGluaXRUb2dnbGUoJ3RvZ2dsZS1idXR0b25zJywgJ3RvZ2dsZS10cmFjaycsICd0b2dnbGUtdGh1bWInKTtcbiAgaW5pdFRvZ2dsZSgndG9nZ2xlLWF1dG9maWxsJywgJ3RvZ2dsZS1hdXRvZmlsbC10cmFjaycsICd0b2dnbGUtYXV0b2ZpbGwtdGh1bWInKTtcbiAgaW5pdFRvZ2dsZSgndG9nZ2xlLXJlamV0JywgJ3RvZ2dsZS1yZWpldC10cmFjaycsICd0b2dnbGUtcmVqZXQtdGh1bWInKTtcbiAgaW5pdFRvZ2dsZSgndG9nZ2xlLXByZXZpZXcnLCAndG9nZ2xlLXByZXZpZXctdHJhY2snLCAndG9nZ2xlLXByZXZpZXctdGh1bWInKTtcbn0pO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4ge1xuICBjb25zdCBkYXRhQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RhdGEtY29udGFpbmVyJyk7XG4gIGxldCBlZGl0aW5nS2V5ID0gbnVsbDtcblxuICAvKiBFY2hhcHBlciBsZXMgdmFsZXVycyBwYXRpZW50IGF2YW50IGluamVjdGlvbiBkYW5zIGlubmVySFRNTCBcdTIwMTQgYW50aS1YU1MgKi9cbiAgZnVuY3Rpb24gZXNjKHN0cikge1xuICAgIGlmIChzdHIgPT09IG51bGwgfHwgc3RyID09PSB1bmRlZmluZWQpIHJldHVybiAnJztcbiAgICByZXR1cm4gU3RyaW5nKHN0cilcbiAgICAgIC5yZXBsYWNlKC8mL2csICcmYW1wOycpXG4gICAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpXG4gICAgICAucmVwbGFjZSgvJy9nLCAnJiMwMzk7Jyk7XG4gIH1cblxuICBjb25zdCBQTEFOX0xBQkVMUyA9IHsgRlJFRTogJ0ZyZWUnLCBFU1NFTlRJRUw6ICdFc3NlbnRpZWwnLCBQUk86ICdQcm8nLCBFUVVJUEU6ICdFcXVpcGUnIH07XG4gIGNvbnN0IElOQUNUSVZJVFlfTUlOVVRFUyA9IDE1O1xuXG4gIC8qIFx1MjUwMFx1MjUwMCBMb2NrIGQnaW5hY3Rpdml0ZSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cbiAgZnVuY3Rpb24gcmVuZXdMb2NrKCkge1xuICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7IGF1ZGlib3RfbG9jazogeyBsb2NrQXQ6IERhdGUubm93KCkgKyBJTkFDVElWSVRZX01JTlVURVMgKiA2MCAqIDEwMDAgfSB9KTtcbiAgICAvKiBSZW5vdXZlbGVyIGwnYWxhcm1lIGRhbnMgbGUgYmFja2dyb3VuZCAqL1xuICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHsgdHlwZTogJ0FVRElCT1RfUkVORVdfTE9DSycgfSk7XG4gIH1cbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCByZW5ld0xvY2spO1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgcmVuZXdMb2NrKTtcblxuICBmdW5jdGlvbiBzaG93TG9ja2VkKG1lc3NhZ2UpIHtcbiAgICB2YXIgYm9keSA9IGRvY3VtZW50LmJvZHkucXVlcnlTZWxlY3RvcignLmNvbnRhaW5lcicpO1xuICAgIGlmICghYm9keSkgYm9keSA9IGRvY3VtZW50LmJvZHk7XG4gICAgYm9keS5pbm5lckhUTUwgPSAnPGRpdiBzdHlsZT1cInBhZGRpbmc6IDIwcHg7IHRleHQtYWxpZ246IGNlbnRlcjtcIj4nXG4gICAgICArICc8ZGl2IHN0eWxlPVwiZm9udC1zaXplOiAzMnB4OyBtYXJnaW4tYm90dG9tOiAxMnB4O1wiPiYjMTI4Mjc0OzwvZGl2PidcbiAgICAgICsgJzxwIHN0eWxlPVwiZm9udC13ZWlnaHQ6IGJvbGQ7XCI+U2Vzc2lvbiB2ZXJyb3VpbGxcXHUwMGU5ZTwvcD4nXG4gICAgICArICc8cCBzdHlsZT1cImZvbnQtc2l6ZTogMTJweDsgY29sb3I6ICM2YjcyODA7XCI+JyArIChtZXNzYWdlIHx8ICcxNSBtaW51dGVzIGRcXCdpbmFjdGl2aXRcXHUwMGU5JykgKyAnPC9wPidcbiAgICAgICsgJzxidXR0b24gaWQ9XCJ1bmxvY2stYnRuXCIgc3R5bGU9XCJtYXJnaW4tdG9wOiAxMnB4OyBwYWRkaW5nOiAxMHB4IDIwcHg7IGJhY2tncm91bmQ6ICMyNTYzZWI7IGNvbG9yOiB3aGl0ZTsgYm9yZGVyOiBub25lOyBib3JkZXItcmFkaXVzOiA4cHg7IGZvbnQtd2VpZ2h0OiBib2xkOyBjdXJzb3I6IHBvaW50ZXI7XCI+J1xuICAgICAgKyAnRFxcdTAwZTl2ZXJyb3VpbGxlcjwvYnV0dG9uPjwvZGl2Pic7XG4gICAgdmFyIGJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1bmxvY2stYnRuJyk7XG4gICAgaWYgKGJ0bikgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXR0ZW1wdFVubG9jayk7XG4gIH1cblxuICBmdW5jdGlvbiBzaG93QmxvY2tlZEdsb2JhbChlcnJvcikge1xuICAgIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5ib2R5LnF1ZXJ5U2VsZWN0b3IoJy5jb250YWluZXInKTtcbiAgICBpZiAoIWNvbnRhaW5lcikgY29udGFpbmVyID0gZG9jdW1lbnQuYm9keTtcbiAgICBjb250YWluZXIuaW5uZXJIVE1MID0gJzxkaXYgc3R5bGU9XCJwYWRkaW5nOiAyMHB4OyB0ZXh0LWFsaWduOiBjZW50ZXI7XCI+J1xuICAgICAgKyAnPGRpdiBzdHlsZT1cImZvbnQtc2l6ZTogMzJweDsgbWFyZ2luLWJvdHRvbTogMTJweDtcIj4mIzEyODI3NDs8L2Rpdj4nXG4gICAgICArICc8cCBzdHlsZT1cImZvbnQtd2VpZ2h0OiBib2xkOyBjb2xvcjogI2RjMjYyNjsgbWFyZ2luOiAwIDAgOHB4IDA7XCI+Q29tcHRlIHJlcXVpczwvcD4nXG4gICAgICArICc8cCBzdHlsZT1cImZvbnQtc2l6ZTogMTJweDsgY29sb3I6ICM2YjcyODA7IG1hcmdpbi1ib3R0b206IDE2cHg7XCI+JyArIGVycm9yICsgJzwvcD4nXG4gICAgICArICc8YSBocmVmPVwiaHR0cHM6Ly9hdWRpYm90LmZyL2Rhc2hib2FyZFwiIHRhcmdldD1cIl9ibGFua1wiIHN0eWxlPVwiZGlzcGxheTppbmxpbmUtYmxvY2s7IHBhZGRpbmc6IDEwcHggMjBweDsgYmFja2dyb3VuZDogIzI1NjNlYjsgY29sb3I6IHdoaXRlOyBib3JkZXItcmFkaXVzOiA4cHg7IGZvbnQtd2VpZ2h0OiBib2xkOyB0ZXh0LWRlY29yYXRpb246IG5vbmU7IGZvbnQtc2l6ZTogMTNweDtcIj4nXG4gICAgICArICdPdXZyaXIgQXVkaUJvdCAmcmFycjs8L2E+PC9kaXY+JztcbiAgfVxuXG4gIGZ1bmN0aW9uIGF0dGVtcHRVbmxvY2soKSB7XG4gICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFsnYXVkaWJvdF9hdXRoJ10sIGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgdmFyIGF1dGggPSByZXN1bHQuYXVkaWJvdF9hdXRoIHx8IHt9O1xuICAgICAgdmFyIHRva2VuID0gYXV0aC5zeW5jVG9rZW47XG4gICAgICBpZiAoIXRva2VuKSB7XG4gICAgICAgIHNob3dCbG9ja2VkR2xvYmFsKFwiQ29ubmVjdGV6LXZvdXMgc3VyIGF1ZGlib3QuZnIgcG91ciB1dGlsaXNlciBsJ2V4dGVuc2lvbi5cIik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGZldGNoKCdodHRwczovL2F1ZGlib3QuZnIvYXBpL2V4dGVuc2lvbi92ZXJpZnknLCB7IGhlYWRlcnM6IHsgXCJBdXRob3JpemF0aW9uXCI6IFwiQmVhcmVyIFwiICsgdG9rZW4gfSB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbihyKSB7IHJldHVybiByLmpzb24oKTsgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIGlmIChkYXRhLm9rKSB7XG4gICAgICAgICAgICByZW5ld0xvY2soKTtcbiAgICAgICAgICAgIGxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaG93QmxvY2tlZEdsb2JhbChkYXRhLmVycm9yIHx8IFwiSW1wb3NzaWJsZSBkZSB2XFx1MDBlOXJpZmllciB2b3RyZSBjb21wdGUuXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHNob3dCbG9ja2VkR2xvYmFsKFwiSW1wb3NzaWJsZSBkZSB2XFx1MDBlOXJpZmllciB2b3RyZSBjb21wdGUgKHJcXHUwMGU5c2VhdSkuXCIpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qIFx1MjUwMFx1MjUwMCBWZXJpZmllciBsZSBsb2NrIEFWQU5UIHRvdXQgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG4gIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbJ2F1ZGlib3RfbG9jayddLCBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICB2YXIgbG9ja0RhdGEgPSByZXN1bHQuYXVkaWJvdF9sb2NrIHx8IHt9O1xuICAgIHZhciBsb2NrQXQgPSBsb2NrRGF0YS5sb2NrQXQgfHwgMDtcbiAgICBpZiAobG9ja0F0ID4gMCAmJiBEYXRlLm5vdygpID4gbG9ja0F0KSB7XG4gICAgICBzaG93TG9ja2VkKFwiU2Vzc2lvbiB2ZXJyb3VpbGxcXHUwMGU5ZSBhcHJcXHUwMGU4cyBpbmFjdGl2aXRcXHUwMGU5LlwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLyogTG9jayBPSyBcdTIwMTQgY29udGludWVyIGxlIGNoYXJnZW1lbnQgbm9ybWFsICovXG4gICAgcmVuZXdMb2NrKCk7XG4gICAgc3RhcnRQb3B1cCgpO1xuICB9KTtcblxuICBmdW5jdGlvbiBzdGFydFBvcHVwKCkge1xuXG4gIGFzeW5jIGZ1bmN0aW9uIHZlcmlmeUFjY291bnQoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoWydhdWRpYm90X2F1dGgnXSwgKHJlc3VsdCkgPT4ge1xuICAgICAgICBjb25zdCBhdXRoID0gcmVzdWx0LmF1ZGlib3RfYXV0aCB8fCB7fTtcbiAgICAgICAgY29uc3QgdG9rZW4gPSBhdXRoLnN5bmNUb2tlbiB8fCBudWxsO1xuICAgICAgICBjb25zdCBleHBpcmVzQXQgPSBhdXRoLmF1dGhFeHBpcmVzQXQgfHwgMDtcblxuICAgICAgICBpZiAoIXRva2VuKSB7XG4gICAgICAgICAgcmVzb2x2ZSh7IG9rOiBmYWxzZSwgZXJyb3I6IFwiQ29ubmVjdGV6LXZvdXMgc3VyIGF1ZGlib3QuZnIgcG91ciB1dGlsaXNlciBsJ2V4dGVuc2lvbi5cIiB9KTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvKiBWZXJpZmllciBleHBpcmF0aW9uIGxvY2FsZSAoMjBoKSBhdmFudCBkJ2FwcGVsZXIgbCdBUEkgKi9cbiAgICAgICAgaWYgKGV4cGlyZXNBdCAmJiBEYXRlLm5vdygpID4gZXhwaXJlc0F0KSB7XG4gICAgICAgICAgcmVzb2x2ZSh7IG9rOiBmYWxzZSwgZXJyb3I6IFwiU2Vzc2lvbiBleHBpclxcdTAwZTllLiBPdXZyZXogYXVkaWJvdC5mciBwb3VyIGNvbnRpbnVlci5cIiB9KTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBmZXRjaCgnaHR0cHM6Ly9hdWRpYm90LmZyL2FwaS9leHRlbnNpb24vdmVyaWZ5JywgeyBoZWFkZXJzOiB7IFwiQXV0aG9yaXphdGlvblwiOiBcIkJlYXJlciBcIiArIHRva2VuIH0gfSlcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyKSB7IHJldHVybiByLmpzb24oKTsgfSlcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihkYXRhKSB7IHJlc29sdmUoZGF0YSk7IH0pXG4gICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKCkgeyByZXNvbHZlKHsgb2s6IGZhbHNlLCBlcnJvcjogXCJJbXBvc3NpYmxlIGRlIHZcXHUwMGU5cmlmaWVyIHZvdHJlIGNvbXB0ZSAoclxcdTAwZTlzZWF1KS5cIiB9KTsgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNob3dCbG9ja2VkKGVycm9yKSB7XG4gICAgdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkYXRhLWNvbnRhaW5lcicpO1xuICAgIGNvbnRhaW5lci5wYXJlbnRFbGVtZW50LmlubmVySFRNTCA9ICc8ZGl2IHN0eWxlPVwicGFkZGluZzogMjBweDsgdGV4dC1hbGlnbjogY2VudGVyO1wiPidcbiAgICAgICsgJzxkaXYgc3R5bGU9XCJmb250LXNpemU6IDMycHg7IG1hcmdpbi1ib3R0b206IDEycHg7XCI+JiMxMjgyNzQ7PC9kaXY+J1xuICAgICAgKyAnPHAgc3R5bGU9XCJmb250LXdlaWdodDogYm9sZDsgY29sb3I6ICNkYzI2MjY7IG1hcmdpbjogMCAwIDhweCAwO1wiPkNvbXB0ZSByZXF1aXM8L3A+J1xuICAgICAgKyAnPHAgc3R5bGU9XCJmb250LXNpemU6IDEycHg7IGNvbG9yOiAjNmI3MjgwOyBtYXJnaW4tYm90dG9tOiAxNnB4O1wiPicgKyBlcnJvciArICc8L3A+J1xuICAgICAgKyAnPGEgaHJlZj1cImh0dHBzOi8vYXVkaWJvdC5mci9kYXNoYm9hcmRcIiB0YXJnZXQ9XCJfYmxhbmtcIiBzdHlsZT1cImRpc3BsYXk6aW5saW5lLWJsb2NrOyBwYWRkaW5nOiAxMHB4IDIwcHg7IGJhY2tncm91bmQ6ICMyNTYzZWI7IGNvbG9yOiB3aGl0ZTsgYm9yZGVyLXJhZGl1czogOHB4OyBmb250LXdlaWdodDogYm9sZDsgdGV4dC1kZWNvcmF0aW9uOiBub25lOyBmb250LXNpemU6IDEzcHg7XCI+J1xuICAgICAgKyAnT3V2cmlyIEF1ZGlCb3QgJnJhcnI7PC9hPjwvZGl2Pic7XG4gIH1cblxuICBmdW5jdGlvbiBzaG93VmVyaWZpZWRCYWRnZShwbGFuLCBleHBpcmVzQXQpIHtcbiAgICB2YXIgbGFiZWwgPSBQTEFOX0xBQkVMU1twbGFuXSB8fCBwbGFuO1xuICAgIHZhciBiYWRnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGJhZGdlLnN0eWxlLmNzc1RleHQgPSAnZm9udC1zaXplOjEwcHg7IHBhZGRpbmc6IDRweCA4cHg7IGJhY2tncm91bmQ6ICNkY2ZjZTc7IGNvbG9yOiAjMTY2NTM0OyBib3JkZXItcmFkaXVzOiAxMnB4OyBmb250LXdlaWdodDogNzAwOyBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IG1hcmdpbi1ib3R0b206IDhweDsnO1xuICAgIGJhZGdlLnRleHRDb250ZW50ID0gJ1xcdTI3MTMgJyArIGxhYmVsICsgJyBjb25uZWN0XFx1MDBlOSc7XG4gICAgdmFyIGgyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaDInKTtcbiAgICBpZiAoaDIpIGgyLnBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKGJhZGdlLCBoMi5uZXh0U2libGluZyk7XG5cbiAgICAvKiBXYXJuaW5nIHNpIHRva2VuIGV4cGlyZSBkYW5zIG1vaW5zIGRlIDFoICovXG4gICAgaWYgKGV4cGlyZXNBdCkge1xuICAgICAgdmFyIHJlbWFpbmluZyA9IGV4cGlyZXNBdCAtIERhdGUubm93KCk7XG4gICAgICBpZiAocmVtYWluaW5nID4gMCAmJiByZW1haW5pbmcgPCA2MCAqIDYwICogMTAwMCkge1xuICAgICAgICB2YXIgaG91cnMgPSBNYXRoLmNlaWwocmVtYWluaW5nIC8gKDYwICogNjAgKiAxMDAwKSk7XG4gICAgICAgIHZhciB3YXJuaW5nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHdhcm5pbmcuc3R5bGUuY3NzVGV4dCA9ICdmb250LXNpemU6MTBweDsgcGFkZGluZzogNnB4IDEwcHg7IGJhY2tncm91bmQ6ICNmZWYzYzc7IGNvbG9yOiAjOTI0MDBlOyBib3JkZXItcmFkaXVzOiA4cHg7IG1hcmdpbi1ib3R0b206IDhweDsgYm9yZGVyOiAxcHggc29saWQgI2ZkZTY4YTsnO1xuICAgICAgICB3YXJuaW5nLnRleHRDb250ZW50ID0gJ1xcdTI2YTBcXHVmZTBmIFNlc3Npb24gZXhwaXJlIGRhbnMgJyArIChob3VycyA+IDAgPyBob3VycyArICdoJyA6ICdxdWVscXVlcyBtaW51dGVzJykgKyAnIFxcdTIwMTQgb3V2cmV6IGxlIGRhc2hib2FyZCBwb3VyIHJlbm91dmVsZXIgYXV0b21hdGlxdWVtZW50Lic7XG4gICAgICAgIGlmIChoMikgaDIucGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUod2FybmluZywgYmFkZ2UubmV4dFNpYmxpbmcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGRhdGFDb250YWluZXIuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJuby1kYXRhXCIgc3R5bGU9XCJ0ZXh0LWFsaWduOmNlbnRlcjtwYWRkaW5nOjIwcHg7XCI+VlxcdTAwZTlyaWZpY2F0aW9uIGR1IGNvbXB0ZS4uLjwvZGl2Pic7XG5cbiAgdmVyaWZ5QWNjb3VudCgpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgaWYgKCFyZXN1bHQub2spIHtcbiAgICAgIHNob3dCbG9ja2VkKHJlc3VsdC5lcnJvcik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8qIExpcmUgZXhwaXJlc0F0IHBvdXIgbCdhZmZpY2hhZ2UgZHUgd2FybmluZyAqL1xuICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbJ2F1ZGlib3RfYXV0aCddLCBmdW5jdGlvbihhdXRoUmVzdWx0KSB7XG4gICAgICB2YXIgYXV0aCA9IGF1dGhSZXN1bHQuYXVkaWJvdF9hdXRoIHx8IHt9O1xuICAgICAgc2hvd1ZlcmlmaWVkQmFkZ2UocmVzdWx0LnBsYW4sIGF1dGguYXV0aEV4cGlyZXNBdCk7XG4gICAgfSk7XG4gICAgZGF0YUNvbnRhaW5lci5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cIm5vLWRhdGFcIj5DaGFyZ2VtZW50IGRlcyBkb25uXFx1MDBlOWVzLi4uPC9kaXY+JztcbiAgICBpbml0UG9wdXAocmVzdWx0LnBsYW4pO1xuICB9KTtcblxuICBmdW5jdGlvbiBpbml0UG9wdXAoY3VycmVudFBsYW4pIHtcblxuICAvKiBIZWxwZXIgcG91ciBsaXJlIHVuZSB2YWxldXIgaW1icmlxdWVlIChleDogXCJvcmRvbm5hbmNlLmx1bmV0dGVzT0Quc3BoZXJlXCIpICovXG4gIGZ1bmN0aW9uIGdldFZhbHVlKG9iaiwgcGF0aCkge1xuICAgIHJldHVybiBwYXRoLnNwbGl0KCcuJykucmVkdWNlKChhY2MsIHBhcnQpID0+IGFjYyAmJiBhY2NbcGFydF0sIG9iaikgfHwgJyc7XG4gIH1cblxuICAvKiBIZWxwZXIgcG91ciBlY3JpcmUgdW5lIHZhbGV1ciBpbWJyaXF1ZWUgKi9cbiAgZnVuY3Rpb24gc2V0VmFsdWUob2JqLCBwYXRoLCB2YWx1ZSkge1xuICAgIGNvbnN0IHBhcnRzID0gcGF0aC5zcGxpdCgnLicpO1xuICAgIGxldCBjdXJyZW50ID0gb2JqO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICBjb25zdCBwYXJ0ID0gcGFydHNbaV07XG4gICAgICBpZiAoIWN1cnJlbnRbcGFydF0pIGN1cnJlbnRbcGFydF0gPSB7fTtcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50W3BhcnRdO1xuICAgIH1cbiAgICBjdXJyZW50W3BhcnRzW3BhcnRzLmxlbmd0aCAtIDFdXSA9IHZhbHVlO1xuICB9XG5cbiAgYXN5bmMgZnVuY3Rpb24gcmVuZGVyRGF0YSgpIHtcbiAgICB2YXIgY2FjaGUgPSBhd2FpdCByZWFkRW5jcnlwdGVkQ2FjaGUoKTtcbiAgICBpZiAoIWNhY2hlKSBjYWNoZSA9IHt9O1xuICAgIHZhciBhdWRpYm90X2F1dGhfY2FjaGUgPSBhd2FpdCBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoWydhdWRpYm90X2F1dGgnXSwgZnVuY3Rpb24ocikgeyByZXNvbHZlKHIuYXVkaWJvdF9hdXRoIHx8IHt9KTsgfSk7XG4gICAgfSk7XG4gICAgdmFyIGRhdGEgPSBjYWNoZS5jdXJyZW50O1xuXG4gICAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgZGF0YUNvbnRhaW5lci5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cImNhcmQgbm8tZGF0YVwiPkF1Y3VuZSBkb25uXFx1MDBlOWUgZW4gY2FjaGUuPC9kaXY+JztcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBkYXRhQ29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuXG4gICAgICB7XG4gICAgICAgIGNvbnN0IGtleSA9ICdjdXJyZW50JztcbiAgICAgICAgY29uc3QgaXNFZGl0aW5nID0gZWRpdGluZ0tleSA9PT0ga2V5O1xuICAgICAgICBjb25zdCBjYXJkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGNhcmQuY2xhc3NOYW1lID0gJ2NhcmQnO1xuXG4gICAgICAgIGNvbnN0IHVwZGF0ZWRBdCA9IGRhdGEudXBkYXRlZEF0ID8gbmV3IERhdGUoZGF0YS51cGRhdGVkQXQpLnRvTG9jYWxlVGltZVN0cmluZygpIDogJ0luY29ubnVlJztcblxuICAgICAgICBjb25zdCBzZWN0aW9ucyA9IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0aXRsZTogXCJcXHUwMGM5dGF0IENpdmlsXCIsXG4gICAgICAgICAgICBmaWVsZHM6IFtcbiAgICAgICAgICAgICAgeyBpZDogJ25vbScsIGxhYmVsOiAnTm9tJyB9LFxuICAgICAgICAgICAgICB7IGlkOiAncHJlbm9tJywgbGFiZWw6ICdQclxcdTAwZTlub20nIH0sXG4gICAgICAgICAgICAgIHsgaWQ6ICdkb2InLCBsYWJlbDogJ05cXHUwMGU5KGUpIGxlJyB9LFxuICAgICAgICAgICAgICB7IGlkOiAnbnNzJywgbGFiZWw6ICdOU1MnIH0sXG4gICAgICAgICAgICAgIHsgaWQ6ICdwaG9uZScsIGxhYmVsOiAnVFxcdTAwZTlsJyB9LFxuICAgICAgICAgICAgICB7IGlkOiAnZW1haWwnLCBsYWJlbDogJ0VtYWlsJyB9LFxuICAgICAgICAgICAgICB7IGlkOiAnYWRkcmVzcycsIGxhYmVsOiAnQWRyZXNzZScgfSxcbiAgICAgICAgICAgICAgeyBpZDogJ3ppcENvZGUnLCBsYWJlbDogJ0NQJyB9LFxuICAgICAgICAgICAgICB7IGlkOiAnY2l0eScsIGxhYmVsOiAnVmlsbGUnIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHRpdGxlOiBcIk9yZG9ubmFuY2VcIixcbiAgICAgICAgICAgIGZpZWxkczogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB2YXIgaGFzT2NyID0gZ2V0VmFsdWUoZGF0YSwgJ29yZG9ubmFuY2Uubm9tT3BodGFsbW9sb2d1ZScpIHx8IGdldFZhbHVlKGRhdGEsICdvcmRvbm5hbmNlLmx1bmV0dGVzT0Quc3BoZXJlJyk7XG4gICAgICAgICAgICAgIGlmIChoYXNPY3IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgeyBpZDogJ29yZG9ubmFuY2UudHlwZVByZXNjcmlwdGlvbicsIGxhYmVsOiAnVHlwZScgfSxcbiAgICAgICAgICAgICAgICAgIHsgaWQ6ICdvcmRvbm5hbmNlLm5vbU9waHRhbG1vbG9ndWUnLCBsYWJlbDogJ09waHRhbG1vJyB9LFxuICAgICAgICAgICAgICAgICAgeyBpZDogJ29yZG9ubmFuY2UuZGF0ZU9yZG9ubmFuY2UnLCBsYWJlbDogJ0RhdGUgT3JkLicgfSxcbiAgICAgICAgICAgICAgICAgIHsgaWQ6ICdvcmRvbm5hbmNlLmRpc3RhbmNlUHVwaWxsYWlyZScsIGxhYmVsOiAnRFAnIH0sXG4gICAgICAgICAgICAgICAgICB7IGlkOiAnb3Jkb25uYW5jZS5sdW5ldHRlc09ELnNwaGVyZScsIGxhYmVsOiAnT0QgU3BoJyB9LFxuICAgICAgICAgICAgICAgICAgeyBpZDogJ29yZG9ubmFuY2UubHVuZXR0ZXNPRC5jeWxpbmRyZScsIGxhYmVsOiAnT0QgQ3lsJyB9LFxuICAgICAgICAgICAgICAgICAgeyBpZDogJ29yZG9ubmFuY2UubHVuZXR0ZXNPRC5heGUnLCBsYWJlbDogJ09EIEF4ZScgfSxcbiAgICAgICAgICAgICAgICAgIHsgaWQ6ICdvcmRvbm5hbmNlLmx1bmV0dGVzT0QuYWRkaXRpb24nLCBsYWJlbDogJ09EIEFkZCcgfSxcbiAgICAgICAgICAgICAgICAgIHsgaWQ6ICdvcmRvbm5hbmNlLmx1bmV0dGVzT0cuc3BoZXJlJywgbGFiZWw6ICdPRyBTcGgnIH0sXG4gICAgICAgICAgICAgICAgICB7IGlkOiAnb3Jkb25uYW5jZS5sdW5ldHRlc09HLmN5bGluZHJlJywgbGFiZWw6ICdPRyBDeWwnIH0sXG4gICAgICAgICAgICAgICAgICB7IGlkOiAnb3Jkb25uYW5jZS5sdW5ldHRlc09HLmF4ZScsIGxhYmVsOiAnT0cgQXhlJyB9LFxuICAgICAgICAgICAgICAgICAgeyBpZDogJ29yZG9ubmFuY2UubHVuZXR0ZXNPRy5hZGRpdGlvbicsIGxhYmVsOiAnT0cgQWRkJyB9LFxuICAgICAgICAgICAgICAgICAgeyBpZDogJ29yZG9ubmFuY2UubGVudGlsbGVzT0QucmF5b25Db3VyYnVyZScsIGxhYmVsOiAnT0QgUkMnIH0sXG4gICAgICAgICAgICAgICAgICB7IGlkOiAnb3Jkb25uYW5jZS5sZW50aWxsZXNPRC5kaWFtZXRyZScsIGxhYmVsOiAnT0QgRGlhJyB9LFxuICAgICAgICAgICAgICAgICAgeyBpZDogJ29yZG9ubmFuY2UubGVudGlsbGVzT0cucmF5b25Db3VyYnVyZScsIGxhYmVsOiAnT0cgUkMnIH0sXG4gICAgICAgICAgICAgICAgICB7IGlkOiAnb3Jkb25uYW5jZS5sZW50aWxsZXNPRy5kaWFtZXRyZScsIGxhYmVsOiAnT0cgRGlhJyB9LFxuICAgICAgICAgICAgICAgICAgeyBpZDogJ29yZG9ubmFuY2UucmVtYXJxdWVzJywgbGFiZWw6ICdSZW1hcnF1ZXMnIH1cbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgeyBpZDogJ3ByZXNjcmlwdGlvbi5wcmVzY3JpcHRldXInLCBsYWJlbDogJ1ByZXNjcmlwdGV1cicgfSxcbiAgICAgICAgICAgICAgICB7IGlkOiAncHJlc2NyaXB0aW9uLnJwcHMnLCBsYWJlbDogJ1JQUFMnIH0sXG4gICAgICAgICAgICAgICAgeyBpZDogJ3ByZXNjcmlwdGlvbi50eXBlVmlzaW9uJywgbGFiZWw6ICdWaXNpb24nIH0sXG4gICAgICAgICAgICAgICAgeyBpZDogJ3ByZXNjcmlwdGlvbi5kYXRlUHJlc2NyaXB0aW9uJywgbGFiZWw6ICdEYXRlJyB9LFxuICAgICAgICAgICAgICAgIHsgaWQ6ICdwcmVzY3JpcHRpb24ub2Quc3BoZXJlJywgbGFiZWw6ICdPRCBTcGgnIH0sXG4gICAgICAgICAgICAgICAgeyBpZDogJ3ByZXNjcmlwdGlvbi5vZC5jeWxpbmRyZScsIGxhYmVsOiAnT0QgQ3lsJyB9LFxuICAgICAgICAgICAgICAgIHsgaWQ6ICdwcmVzY3JpcHRpb24ub2QuYXhlJywgbGFiZWw6ICdPRCBBeGUnIH0sXG4gICAgICAgICAgICAgICAgeyBpZDogJ3ByZXNjcmlwdGlvbi5vZC5hZGRpdGlvbicsIGxhYmVsOiAnT0QgQWRkJyB9LFxuICAgICAgICAgICAgICAgIHsgaWQ6ICdwcmVzY3JpcHRpb24ub2cuc3BoZXJlJywgbGFiZWw6ICdPRyBTcGgnIH0sXG4gICAgICAgICAgICAgICAgeyBpZDogJ3ByZXNjcmlwdGlvbi5vZy5jeWxpbmRyZScsIGxhYmVsOiAnT0cgQ3lsJyB9LFxuICAgICAgICAgICAgICAgIHsgaWQ6ICdwcmVzY3JpcHRpb24ub2cuYXhlJywgbGFiZWw6ICdPRyBBeGUnIH0sXG4gICAgICAgICAgICAgICAgeyBpZDogJ3ByZXNjcmlwdGlvbi5vZy5hZGRpdGlvbicsIGxhYmVsOiAnT0cgQWRkJyB9LFxuICAgICAgICAgICAgICAgIHsgaWQ6ICdwcmVzY3JpcHRpb24ubGVudGlsbGVzT0Quc3BoZXJlJywgbGFiZWw6ICdMZW50IE9EIFNwaCcgfSxcbiAgICAgICAgICAgICAgICB7IGlkOiAncHJlc2NyaXB0aW9uLmxlbnRpbGxlc09ELmN5bGluZHJlJywgbGFiZWw6ICdMZW50IE9EIEN5bCcgfSxcbiAgICAgICAgICAgICAgICB7IGlkOiAncHJlc2NyaXB0aW9uLmxlbnRpbGxlc09HLnNwaGVyZScsIGxhYmVsOiAnTGVudCBPRyBTcGgnIH0sXG4gICAgICAgICAgICAgICAgeyBpZDogJ3ByZXNjcmlwdGlvbi5sZW50aWxsZXNPRy5jeWxpbmRyZScsIGxhYmVsOiAnTGVudCBPRyBDeWwnIH0sXG4gICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9KSgpXG4gICAgICAgICAgfVxuICAgICAgICBdO1xuXG4gICAgICAgIGxldCBodG1sID0gYFxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLXRpdGxlXCI+XG4gICAgICAgICAgICA8c3Bhbj4ke2lzRWRpdGluZyA/ICdNb2RpZmljYXRpb24nIDogYERvbm5cXHUwMGU5ZXMgZGUgJHtlc2MoZGF0YS5wcmVub20gfHwgJycpfSAke2VzYyhkYXRhLm5vbSB8fCAnQ2xpZW50Jyl9YH08L3NwYW4+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYWN0aW9ucy1ncm91cFwiPlxuICAgICAgICAgICAgICAke2lzRWRpdGluZyA/IGBcbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwic2F2ZS1idG5cIiBkYXRhLWtleT1cIiR7a2V5fVwiPlNhdXZlcjwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJjYW5jZWwtYnRuXCI+QW5udWxlcjwvYnV0dG9uPlxuICAgICAgICAgICAgICBgIDogYFxuICAgICAgICAgICAgICAgIDxidXR0b24gaWQ9XCJhdWRpYm90LWVkaXQtcGF0aWVudFwiIHN0eWxlPVwiYmFja2dyb3VuZDpub25lO2JvcmRlcjpub25lO2NvbG9yOiMyNTYzZWI7Y3Vyc29yOnBvaW50ZXI7Zm9udC1zaXplOjExcHg7Zm9udC13ZWlnaHQ6NjAwO1wiPkVkaXRlcjwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJlZGl0LWJ0blwiIGRhdGEta2V5PVwiJHtrZXl9XCI+TW9kaWZpZXI8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiY2xlYXItYnRuXCIgZGF0YS1rZXk9XCIke2tleX1cIj5FZmZhY2VyPC9idXR0b24+XG4gICAgICAgICAgICAgIGB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwidGFnXCI+TWlzZSBcXHUwMGUwIGpvdXIgOiAke3VwZGF0ZWRBdH08L2Rpdj5cbiAgICAgICAgICA8ZGl2IGlkPVwiYXVkaWJvdC1wYXRpZW50LWRhdGFcIiBjbGFzcz1cImRhdGEtbGlzdFwiPlxuICAgICAgICBgO1xuXG4gICAgICAgIHNlY3Rpb25zLmZvckVhY2goc2VjdGlvbiA9PiB7XG4gICAgICAgICAgY29uc3QgaGFzRGF0YSA9IHNlY3Rpb24uZmllbGRzLnNvbWUoZiA9PiBnZXRWYWx1ZShkYXRhLCBmLmlkKSk7XG5cbiAgICAgICAgICBpZiAoaXNFZGl0aW5nIHx8IGhhc0RhdGEpIHtcbiAgICAgICAgICAgIGh0bWwgKz0gYDxkaXYgc3R5bGU9XCJtYXJnaW46IDhweCAwIDRweCAwOyBmb250LXdlaWdodDogYm9sZDsgZm9udC1zaXplOiAxMXB4OyBjb2xvcjogIzI1NjNlYjsgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNlNWU3ZWI7IHBhZGRpbmctYm90dG9tOiAycHg7XCI+JHtlc2Moc2VjdGlvbi50aXRsZSl9PC9kaXY+YDtcblxuICAgICAgICAgICAgc2VjdGlvbi5maWVsZHMuZm9yRWFjaChmaWVsZCA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IHZhbCA9IGdldFZhbHVlKGRhdGEsIGZpZWxkLmlkKTtcbiAgICAgICAgICAgICAgaWYgKGlzRWRpdGluZykge1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gYFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRhdGEtaXRlbSBlZGl0aW5nXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZGF0YS1sYWJlbFwiPiR7ZmllbGQubGFiZWx9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImVkaXQtaW5wdXRcIiBkYXRhLWZpZWxkPVwiJHtmaWVsZC5pZH1cIiB2YWx1ZT1cIiR7ZXNjKHZhbCl9XCI+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICBgO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhbCkge1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gYFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRhdGEtaXRlbVwiPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImRhdGEtbGFiZWxcIj4ke2ZpZWxkLmxhYmVsfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJkYXRhLXZhbHVlXCI+JHtlc2ModmFsKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICBgO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGh0bWwgKz0gYDwvZGl2PmA7XG5cbiAgICAgICAgLyogU2VjdGlvbiBSZWdpbWVzIFx1MjAxNCBcdTAwRTlkaXRhYmxlIGVuIG1vZGUgbW9kaWZpY2F0aW9uICovXG4gICAgICAgIGlmIChkYXRhLnJlZ2ltZXMgfHwgaXNFZGl0aW5nKSB7XG4gICAgICAgICAgdmFyIHJnID0gZGF0YS5yZWdpbWVzIHx8IHt9O1xuICAgICAgICAgIGh0bWwgKz0gYDxkaXYgc3R5bGU9XCJtYXJnaW46IDhweCAwIDRweCAwOyBmb250LXdlaWdodDogYm9sZDsgZm9udC1zaXplOiAxMXB4OyBjb2xvcjogIzI1NjNlYjsgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNlNWU3ZWI7IHBhZGRpbmctYm90dG9tOiAycHg7XCI+UlxcdTAwZTlnaW1lczwvZGl2PmA7XG5cbiAgICAgICAgICB2YXIgcmVnaW1lRmllbGRzID0gW1xuICAgICAgICAgICAgeyBwYXRoOiAncmVnaW1lcy5yby5ub20nLCAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdSTycgfSxcbiAgICAgICAgICAgIHsgcGF0aDogJ3JlZ2ltZXMucm8udGF1eFBFQycsICAgICAgICAgICAgICAgIGxhYmVsOiAnVGF1eCBQRUMnIH0sXG4gICAgICAgICAgICB7IHBhdGg6ICdyZWdpbWVzLnJjMS5ub20nLCAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1JDMScgfSxcbiAgICAgICAgICAgIHsgcGF0aDogJ3JlZ2ltZXMucmMxLm51bWVyb0FkaGVyZW50JywgICAgICAgIGxhYmVsOiAnTlxcdTAwYjAgYWRoXFx1MDBlOXJlbnQnIH0sXG4gICAgICAgICAgICB7IHBhdGg6ICdyZWdpbWVzLnJjMS5udW1lcm9Db250cmF0JywgICAgICAgICBsYWJlbDogJ05cXHUwMGIwIGNvbnRyYXQnIH0sXG4gICAgICAgICAgICB7IHBhdGg6ICdyZWdpbWVzLnJjMS5udW1lcm9UZWxldHJhbnNtaXNzaW9uJyxsYWJlbDogJ05cXHUwMGIwIHRcXHUwMGU5bFxcdTAwZTl0ci4nIH0sXG4gICAgICAgICAgICB7IHBhdGg6ICdyZWdpbWVzLnJjMS5jb2RlQ29udmVudGlvbicsICAgICAgICBsYWJlbDogJ0NvbnZlbnRpb24nIH0sXG4gICAgICAgICAgICB7IHBhdGg6ICdyZWdpbWVzLnJjMi5ub20nLCAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1JDMicgfSxcbiAgICAgICAgICAgIHsgcGF0aDogJ3JlZ2ltZXMucmMyLm51bWVyb0FkaGVyZW50JywgICAgICAgIGxhYmVsOiAnTlxcdTAwYjAgYWRoXFx1MDBlOXJlbnQgMicgfSxcbiAgICAgICAgICBdO1xuXG4gICAgICAgICAgcmVnaW1lRmllbGRzLmZvckVhY2goZnVuY3Rpb24oZikge1xuICAgICAgICAgICAgdmFyIHZhbCA9IGdldFZhbHVlKGRhdGEsIGYucGF0aCkgfHwgJyc7XG4gICAgICAgICAgICBpZiAoaXNFZGl0aW5nKSB7XG4gICAgICAgICAgICAgIGh0bWwgKz0gYDxkaXYgY2xhc3M9XCJkYXRhLWl0ZW0gZWRpdGluZ1wiPjxzcGFuIGNsYXNzPVwiZGF0YS1sYWJlbFwiPiR7ZXNjKGYubGFiZWwpfTwvc3Bhbj48aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImVkaXQtaW5wdXRcIiBkYXRhLWZpZWxkPVwiJHtmLnBhdGh9XCIgdmFsdWU9XCIke2VzYyhTdHJpbmcodmFsKSl9XCI+PC9kaXY+YDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsKSB7XG4gICAgICAgICAgICAgIGh0bWwgKz0gYDxkaXYgY2xhc3M9XCJkYXRhLWl0ZW1cIj48c3BhbiBjbGFzcz1cImRhdGEtbGFiZWxcIj4ke2VzYyhmLmxhYmVsKX08L3NwYW4+PHNwYW4gY2xhc3M9XCJkYXRhLXZhbHVlXCI+JHtlc2MoU3RyaW5nKHZhbCkpfTwvc3Bhbj48L2Rpdj5gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogU2VjdGlvbiBFcXVpcGVtZW50cyAoc2NyYXBlcyBkZXB1aXMgTEJPKSAqL1xuICAgICAgICBpZiAoZGF0YS5lcXVpcGVtZW50cyAmJiBkYXRhLmVxdWlwZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBodG1sICs9IGA8ZGl2IHN0eWxlPVwibWFyZ2luOiA4cHggMCA0cHggMDsgZm9udC13ZWlnaHQ6IGJvbGQ7IGZvbnQtc2l6ZTogMTFweDsgY29sb3I6ICMyNTYzZWI7IGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjZTVlN2ViOyBwYWRkaW5nLWJvdHRvbTogMnB4O1wiPlxcdTAwYzlxdWlwZW1lbnRzICgke2RhdGEuZXF1aXBlbWVudHMubGVuZ3RofSk8L2Rpdj5gO1xuXG4gICAgICAgICAgZGF0YS5lcXVpcGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVxLCBpZHgpIHtcbiAgICAgICAgICAgIHZhciBlcUxhYmVsID0gKGVxLm51bWVybyA9PT0gJzEnID8gJ1ByaW5jaXBhbCcgOiAnU2Vjb25kYWlyZSAnICsgKGVxLm51bWVybyAtIDEpKTtcbiAgICAgICAgICAgIGh0bWwgKz0gYDxkaXYgY2xhc3M9XCJlcS1jYXJkXCIgZGF0YS1lcS1pbmRleD1cIiR7aWR4fVwiPmA7XG4gICAgICAgICAgICBodG1sICs9IGA8ZGl2IGNsYXNzPVwiZXEtaGVhZGVyXCI+PHNwYW4gY2xhc3M9XCJlcS10aXRsZVwiPiR7ZXFMYWJlbH0gXFx1MjAxNCAke2VzYyhlcS50eXBlIHx8ICdMdW5ldHRlcycpfSAke2VxLnZpc2lvbiA/ICcoJyArIGVzYyhlcS52aXNpb24pICsgJyknIDogJyd9PC9zcGFuPjxkaXY+PGJ1dHRvbiBjbGFzcz1cImVxLWVkaXQtYnRuXCIgZGF0YS1jYWNoZS1rZXk9XCIke2tleX1cIiBkYXRhLWVxLWlkeD1cIiR7aWR4fVwiIHN0eWxlPVwibWFyZ2luLXJpZ2h0OjRweDtcIj5Nb2RpZmllcjwvYnV0dG9uPjxidXR0b24gY2xhc3M9XCJlcS1kZWxldGVcIiBkYXRhLWNhY2hlLWtleT1cIiR7a2V5fVwiIGRhdGEtZXEtaWR4PVwiJHtpZHh9XCI+U3VwcHJpbWVyPC9idXR0b24+PC9kaXY+PC9kaXY+YDtcblxuICAgICAgICAgICAgaWYgKGVxLmNvcnJlY3Rpb24pIHtcbiAgICAgICAgICAgICAgaHRtbCArPSBgPGRpdiBjbGFzcz1cImVxLWNvcnJlY3Rpb25cIj4ke2VzYyhlcS5jb3JyZWN0aW9uKX08L2Rpdj5gO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZXEubGlnbmVzICYmIGVxLmxpZ25lcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgIGVxLmxpZ25lcy5mb3JFYWNoKGZ1bmN0aW9uKGwsIGxpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHR5cGVMYWJlbCA9IGwudHlwZSA9PT0gJ21vbnR1cmUnID8gJ01vbnR1cmUnIDogbC50eXBlID09PSAndmVycmUnID8gJ1ZlcnJlICcgKyBsLm9laWwgOiAnU3VwcGwuICcgKyBsLm9laWw7XG4gICAgICAgICAgICAgICAgdmFyIHBmeCA9ICdlcV8nICsgaWR4ICsgJ19sXycgKyBsaSArICdfJztcbiAgICAgICAgICAgICAgICBodG1sICs9IGA8ZGl2IGNsYXNzPVwiZXEtbGluZVwiIHN0eWxlPVwiZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDoycHg7XCI+YDtcbiAgICAgICAgICAgICAgICBodG1sICs9IGA8ZGl2IHN0eWxlPVwiZm9udC1zaXplOjExcHg7Zm9udC13ZWlnaHQ6NzAwO2NvbG9yOiMxZTI5M2I7XCI+JHtlc2ModHlwZUxhYmVsKX08L2Rpdj5gO1xuXG4gICAgICAgICAgICAgICAgdmFyIGxwcE1hbnF1YW50ID0gbC50eXBlICE9PSBcInN1cHBsZW1lbnRcIiAmJiAhbC5jb2RlTFBQO1xuICAgICAgICAgICAgICAgIHZhciBmaWVsZHMgPSBbXG4gICAgICAgICAgICAgICAgICB7IGtleTogJ2Rlc2lnbmF0aW9uJywgbGFiZWw6ICdBcnRpY2xlJywgdmFsOiBsLmRlc2lnbmF0aW9uLCBjbHM6ICcnLCBzdHlsZTogJ2ZvbnQtc2l6ZToxMHB4OycgfSxcbiAgICAgICAgICAgICAgICAgIHsga2V5OiAnY29kZUxQUCcsIGxhYmVsOiAnQ29kZSBMUFAnLCB2YWw6IGxwcE1hbnF1YW50ID8gJ1x1MjAxNCBcdTI2QTBcdUZFMEYnIDogKGwuY29kZUxQUCB8fCAnJyksIGNsczogJ2VxLWxwcCcsIHNob3c6ICEhbC5jb2RlTFBQIHx8IGxwcE1hbnF1YW50LCBzdHlsZTogbHBwTWFucXVhbnQgPyAnY29sb3I6I2RjMjYyNjtmb250LXdlaWdodDo3MDA7JyA6ICcnLCB0aXRsZTogbHBwTWFucXVhbnQgPyAnQ29kZSBMUFAgbWFucXVhbnQgXHUyMDE0IGxlIFJQQSBuZSBwb3VycmEgcGFzIGNvbXBsXHUwMEU5dGVyIGNldHRlIHNlY3Rpb24nIDogJycgfSxcbiAgICAgICAgICAgICAgICAgIHsga2V5OiAnY2xhc3NlJywgbGFiZWw6ICdDbGFzc2UnLCB2YWw6IGwuY2xhc3NlIHx8ICcnLCBjbHM6ICcnLCBzaG93OiAhIWwuY2xhc3NlIH0sXG4gICAgICAgICAgICAgICAgICB7IGtleTogJ3ByaXhCcnV0JywgbGFiZWw6ICdQcml4IGJydXQnLCB2YWw6IGwucHJpeEJydXQudG9GaXhlZCgyKSwgY2xzOiAnJywgc3VmZml4OiAnIFxcdTIwYWMnIH0sXG4gICAgICAgICAgICAgICAgICB7IGtleTogJ3JlbWlzZScsIGxhYmVsOiAnUmVtaXNlJywgdmFsOiBsLnJlbWlzZS50b0ZpeGVkKDIpLCBjbHM6ICcnLCBzdWZmaXg6ICcgXFx1MjBhYycsIHNob3c6IGwucmVtaXNlID4gMCB9LFxuICAgICAgICAgICAgICAgICAgeyBrZXk6ICdwcml4TmV0JywgbGFiZWw6ICdQcml4IG5ldCcsIHZhbDogbC5wcml4TmV0LnRvRml4ZWQoMiksIGNsczogJ2VxLXByaXgnLCBzdWZmaXg6ICcgXFx1MjBhYycgfSxcbiAgICAgICAgICAgICAgICAgIHsga2V5OiAncm8nLCBsYWJlbDogJ1JPJywgdmFsOiBsLnJvLnRvRml4ZWQoMiksIGNsczogJycsIHN1ZmZpeDogJyBcXHUyMGFjJyB9LFxuICAgICAgICAgICAgICAgICAgeyBrZXk6ICdyYzEnLCBsYWJlbDogJ1JDJywgdmFsOiBsLnJjMS50b0ZpeGVkKDIpLCBjbHM6ICcnLCBzdWZmaXg6ICcgXFx1MjBhYycgfSxcbiAgICAgICAgICAgICAgICAgIHsga2V5OiAncmFjJywgbGFiZWw6ICdSQUMnLCB2YWw6IGwucmFjLnRvRml4ZWQoMiksIGNsczogJ2VxLXJhYycsIHN1ZmZpeDogJyBcXHUyMGFjJyB9LFxuICAgICAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgICAgICBmaWVsZHMuZm9yRWFjaChmdW5jdGlvbihmKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoZi5zaG93ID09PSBmYWxzZSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgaWYgKGlzRWRpdGluZykge1xuICAgICAgICAgICAgICAgICAgICBodG1sICs9IGA8ZGl2IGNsYXNzPVwiZGF0YS1pdGVtIGVkaXRpbmdcIj48c3BhbiBjbGFzcz1cImRhdGEtbGFiZWxcIj4ke2VzYyhmLmxhYmVsKX08L3NwYW4+PGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJlZGl0LWlucHV0IGVxLWZpZWxkLWlucHV0XCIgZGF0YS1lcS1pZHg9XCIke2lkeH1cIiBkYXRhLWxpbmUtaWR4PVwiJHtsaX1cIiBkYXRhLWZpZWxkLWtleT1cIiR7Zi5rZXl9XCIgdmFsdWU9XCIke2VzYyhTdHJpbmcoZi52YWwpKX1cIj48L2Rpdj5gO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaHRtbCArPSBgPGRpdiBjbGFzcz1cImRhdGEtaXRlbVwiPjxzcGFuIGNsYXNzPVwiZGF0YS1sYWJlbFwiPiR7ZXNjKGYubGFiZWwpfTwvc3Bhbj48c3BhbiBjbGFzcz1cImRhdGEtdmFsdWUgJHtmLmNsc31cIiAke2Yuc3R5bGUgPyAnc3R5bGU9XCInICsgZi5zdHlsZSArICdcIicgOiAnJ30gJHtmLnRpdGxlID8gJ3RpdGxlPVwiJyArIGYudGl0bGUgKyAnXCInIDogJyd9PiR7ZXNjKFN0cmluZyhmLnZhbCkpfSR7Zi5zdWZmaXggfHwgJyd9PC9zcGFuPjwvZGl2PmA7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBodG1sICs9IGA8L2Rpdj5gO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGVxLnRvdGF1eCAmJiBlcS50b3RhdXgubmV0KSB7XG4gICAgICAgICAgICAgIGh0bWwgKz0gYDxkaXYgY2xhc3M9XCJlcS10b3RhbFwiPlRvdGFsOiA8c3BhbiBjbGFzcz1cImVxLXByaXhcIj4ke2VxLnRvdGF1eC5uZXQudG9GaXhlZCgyKX1cXHUyMGFjPC9zcGFuPiB8IFJPOiAke2VxLnRvdGF1eC5yby50b0ZpeGVkKDIpfVxcdTIwYWMgfCBSQzogJHtlcS50b3RhdXgucmMxLnRvRml4ZWQoMil9XFx1MjBhYyB8IFJBQzogPHNwYW4gY2xhc3M9XCJlcS1yYWNcIj4ke2VxLnRvdGF1eC5yYWMudG9GaXhlZCgyKX1cXHUyMGFjPC9zcGFuPjwvZGl2PmA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGh0bWwgKz0gYDwvZGl2PmA7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBpZiAoZGF0YS50b3RhbFByb3Bvc2l0aW9uKSB7XG4gICAgICAgICAgICBodG1sICs9IGA8ZGl2IHN0eWxlPVwiZm9udC1zaXplOjExcHg7Zm9udC13ZWlnaHQ6ODAwO2NvbG9yOiMyNTYzZWI7bWFyZ2luLXRvcDo2cHg7cGFkZGluZzo0cHggNnB4O2JhY2tncm91bmQ6I2VmZjZmZjtib3JkZXItcmFkaXVzOjZweDtcIj5Qcm9wb3NpdGlvbjogJHtkYXRhLnRvdGFsUHJvcG9zaXRpb24udG9GaXhlZCgyKX1cXHUyMGFjIHwgUkFDOiA8c3BhbiBjbGFzcz1cImVxLXJhY1wiPiR7KGRhdGEucmFjUHJvcG9zaXRpb24gfHwgMCkudG9GaXhlZCgyKX1cXHUyMGFjPC9zcGFuPjwvZGl2PmA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY2FyZC5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgICBkYXRhQ29udGFpbmVyLmFwcGVuZENoaWxkKGNhcmQpO1xuICAgICAgfVxuXG4gICAgICAvKiBQYXJjb3VycyBSUEEgRHluYW1pcXVlcyBcdTIwMTQgYWZmaWNoYWdlIGRhbnMgbGEgcG9wdXAgKi9cbiAgICAgIChhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB2YXIgc3luY1Rva2VuID0gYXdhaXQgZ2V0U3luY1Rva2VuKCk7XG4gICAgICAgICAgaWYgKCFzeW5jVG9rZW4pIHJldHVybjtcblxuICAgICAgICAgIC8qIFJcdTAwRTljdXBcdTAwRTlyZXIgbCdvbmdsZXQgYWN0aWYgcG91ciBvYnRlbmlyIGxlIGhvc3RuYW1lICovXG4gICAgICAgICAgY2hyb21lLnRhYnMucXVlcnkoeyBhY3RpdmU6IHRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWUgfSwgYXN5bmMgZnVuY3Rpb24odGFicykge1xuICAgICAgICAgICAgaWYgKCF0YWJzIHx8ICF0YWJzWzBdIHx8ICF0YWJzWzBdLnVybCkgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIHRhYlVybCA9IHRhYnNbMF0udXJsO1xuICAgICAgICAgICAgdmFyIHRhYklkID0gdGFic1swXS5pZDtcbiAgICAgICAgICAgIHZhciBwYXJzZWRIb3N0bmFtZSA9IFwiXCI7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBwYXJzZWRIb3N0bmFtZSA9IG5ldyBVUkwodGFiVXJsKS5ob3N0bmFtZS5yZXBsYWNlKC9ed3d3XFwuLywgXCJcIik7XG4gICAgICAgICAgICB9IGNhdGNoKGUpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgICBpZiAoIXBhcnNlZEhvc3RuYW1lKSByZXR1cm47XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIHZhciByZXMgPSBhd2FpdCBmZXRjaChcImh0dHBzOi8vYXVkaWJvdC5mci9hcGkvZXh0ZW5zaW9uL3BhcmNvdXJzP2hvc3RuYW1lPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHBhcnNlZEhvc3RuYW1lKSwgeyBoZWFkZXJzOiB7IFwiQXV0aG9yaXphdGlvblwiOiBcIkJlYXJlciBcIiArIHN5bmNUb2tlbiB9IH0pO1xuICAgICAgICAgICAgICBpZiAoIXJlcy5vaykgcmV0dXJuO1xuICAgICAgICAgICAgICB2YXIgcmVzRGF0YSA9IGF3YWl0IHJlcy5qc29uKCk7XG4gICAgICAgICAgICAgIHZhciBwYXJjb3Vyc0xpc3QgPSByZXNEYXRhLnBhcmNvdXJzIHx8IFtdO1xuICAgICAgICAgICAgICBpZiAocGFyY291cnNMaXN0Lmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgIC8qIEluc1x1MDBFOXJlciBsZSBibG9jIHBhcmNvdXJzIGVuIGhhdXQgZHUgZGF0YS1jb250YWluZXIgKi9cbiAgICAgICAgICAgICAgdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGF0YS1jb250YWluZXJcIik7XG4gICAgICAgICAgICAgIGlmICghY29udGFpbmVyKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgdmFyIGJsb2MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICAgICAgICBibG9jLnN0eWxlLmNzc1RleHQgPSBcIm1hcmdpbi1ib3R0b206MTBweDtwYWRkaW5nOjEwcHg7YmFja2dyb3VuZDojZjBmN2ZmO2JvcmRlci1yYWRpdXM6MTBweDtib3JkZXI6MXB4IHNvbGlkICNiZmRiZmU7XCI7XG5cbiAgICAgICAgICAgICAgdmFyIHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgICAgICAgdGl0bGUuc3R5bGUuY3NzVGV4dCA9IFwiZm9udC1zaXplOjExcHg7Zm9udC13ZWlnaHQ6NzAwO2NvbG9yOiMxZDRlZDg7bWFyZ2luLWJvdHRvbTo4cHg7XCI7XG4gICAgICAgICAgICAgIHRpdGxlLnRleHRDb250ZW50ID0gXCJcXHVEODNFXFx1REQxNiBQYXJjb3VycyBkaXNwb25pYmxlc1wiO1xuICAgICAgICAgICAgICBibG9jLmFwcGVuZENoaWxkKHRpdGxlKTtcblxuICAgICAgICAgICAgICBwYXJjb3Vyc0xpc3QuZm9yRWFjaChmdW5jdGlvbihwKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICAgICAgcm93LnN0eWxlLmNzc1RleHQgPSBcImRpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OnNwYWNlLWJldHdlZW47bWFyZ2luLWJvdHRvbTo2cHg7XCI7XG5cbiAgICAgICAgICAgICAgICB2YXIgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICAgICAgICAgICAgICBsYWJlbC5zdHlsZS5jc3NUZXh0ID0gXCJmb250LXNpemU6MTJweDtjb2xvcjojMWUzYThhO2ZvbnQtd2VpZ2h0OjYwMDtmbGV4OjE7bWFyZ2luLXJpZ2h0OjhweDtcIjtcbiAgICAgICAgICAgICAgICBsYWJlbC50ZXh0Q29udGVudCA9IHAubm9tO1xuXG4gICAgICAgICAgICAgICAgdmFyIGJ0bkxhdW5jaCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgICAgICAgICAgICAgYnRuTGF1bmNoLnRleHRDb250ZW50ID0gXCJcXHUyNUI2IExhbmNlclwiO1xuICAgICAgICAgICAgICAgIGJ0bkxhdW5jaC5zdHlsZS5jc3NUZXh0ID0gXCJwYWRkaW5nOjVweCAxMHB4O2JhY2tncm91bmQ6IzI1NjNlYjtjb2xvcjp3aGl0ZTtib3JkZXI6bm9uZTtib3JkZXItcmFkaXVzOjhweDtmb250LXNpemU6MTFweDtmb250LXdlaWdodDo3MDA7Y3Vyc29yOnBvaW50ZXI7d2hpdGUtc3BhY2U6bm93cmFwO1wiO1xuICAgICAgICAgICAgICAgIGJ0bkxhdW5jaC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoIXRhYklkKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJJZCwgeyB0eXBlOiBcIkFVRElCT1RfTEFVTkNIX1BBUkNPVVJTXCIsIHBhcmNvdXJzSWQ6IHAuaWQgfSk7XG4gICAgICAgICAgICAgICAgICB3aW5kb3cuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHJvdy5hcHBlbmRDaGlsZChsYWJlbCk7XG4gICAgICAgICAgICAgICAgcm93LmFwcGVuZENoaWxkKGJ0bkxhdW5jaCk7XG4gICAgICAgICAgICAgICAgYmxvYy5hcHBlbmRDaGlsZChyb3cpO1xuICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICBjb250YWluZXIuaW5zZXJ0QmVmb3JlKGJsb2MsIGNvbnRhaW5lci5maXJzdENoaWxkKTtcbiAgICAgICAgICAgIH0gY2F0Y2goZSkge31cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaChlKSB7fVxuICAgICAgfSkoKTtcblxuICAgICAgLyogRXZlbnQgTGlzdGVuZXJzICovXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZWRpdC1idG4nKS5mb3JFYWNoKGJ0biA9PiB7XG4gICAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICBlZGl0aW5nS2V5ID0gJ2N1cnJlbnQnO1xuICAgICAgICAgIHJlbmRlckRhdGEoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNhbmNlbC1idG4nKS5mb3JFYWNoKGJ0biA9PiB7XG4gICAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICBlZGl0aW5nS2V5ID0gbnVsbDtcbiAgICAgICAgICByZW5kZXJEYXRhKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5zYXZlLWJ0bicpLmZvckVhY2goYnRuID0+IHtcbiAgICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgIHNhdmVDaGFuZ2VzKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jbGVhci1idG4nKS5mb3JFYWNoKGJ0biA9PiB7XG4gICAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICBkZWxldGVFbnRyeSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZXEtZGVsZXRlJykuZm9yRWFjaChidG4gPT4ge1xuICAgICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGVxSWR4ID0gcGFyc2VJbnQoZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWVxLWlkeCcpLCAxMCk7XG4gICAgICAgICAgZGVsZXRlRXF1aXBlbWVudChlcUlkeCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5lcS1lZGl0LWJ0bicpLmZvckVhY2goYnRuID0+IHtcbiAgICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgIGVkaXRpbmdLZXkgPSAnY3VycmVudCc7XG4gICAgICAgICAgcmVuZGVyRGF0YSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICAvKiBWMy00OiBFZGl0IHBhdGllbnQgZGF0YSAqL1xuICAgICAgdmFyIGVkaXRCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF1ZGlib3QtZWRpdC1wYXRpZW50XCIpO1xuICAgICAgaWYgKGVkaXRCdG4pIHtcbiAgICAgICAgZWRpdEJ0bi5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXVkaWJvdC1wYXRpZW50LWRhdGFcIik7XG4gICAgICAgICAgaWYgKCFjb250YWluZXIpIHJldHVybjtcbiAgICAgICAgICB2YXIgZmllbGRzID0gW1xuICAgICAgICAgICAgeyBrZXk6IFwibm9tXCIsIGxhYmVsOiBcIk5vbVwiIH0sXG4gICAgICAgICAgICB7IGtleTogXCJwcmVub21cIiwgbGFiZWw6IFwiUHJlbm9tXCIgfSxcbiAgICAgICAgICAgIHsga2V5OiBcIm5zc1wiLCBsYWJlbDogXCJOU1NcIiB9LFxuICAgICAgICAgICAgeyBrZXk6IFwiZG9iXCIsIGxhYmVsOiBcIkRhdGUgbmFpc3MuXCIgfSxcbiAgICAgICAgICAgIHsga2V5OiBcInBob25lXCIsIGxhYmVsOiBcIlRlbGVwaG9uZVwiIH0sXG4gICAgICAgICAgICB7IGtleTogXCJyZWdpbWVzLnJjMS5ub21cIiwgbGFiZWw6IFwiTXV0dWVsbGVcIiB9LFxuICAgICAgICAgICAgeyBrZXk6IFwicmVnaW1lcy5yYzEubnVtZXJvQWRoZXJlbnRcIiwgbGFiZWw6IFwiTiBhZGhlcmVudFwiIH0sXG4gICAgICAgICAgXTtcbiAgICAgICAgICBjb250YWluZXIuaW5uZXJIVE1MID0gXCJcIjtcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZpZWxkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICByb3cuc3R5bGUuY3NzVGV4dCA9IFwiZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4O21hcmdpbi1ib3R0b206NnB4O1wiO1xuICAgICAgICAgICAgdmFyIGxibCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsYWJlbFwiKTtcbiAgICAgICAgICAgIGxibC5zdHlsZS5jc3NUZXh0ID0gXCJmb250LXNpemU6MTFweDtjb2xvcjojNmI3MjgwO3dpZHRoOjgwcHg7ZmxleC1zaHJpbms6MDtcIjtcbiAgICAgICAgICAgIGxibC50ZXh0Q29udGVudCA9IGZpZWxkc1tpXS5sYWJlbDtcbiAgICAgICAgICAgIHZhciBpbnAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XG4gICAgICAgICAgICBpbnAudHlwZSA9IFwidGV4dFwiO1xuICAgICAgICAgICAgaW5wLmRhdGFzZXQuZmllbGQgPSBmaWVsZHNbaV0ua2V5O1xuICAgICAgICAgICAgaW5wLnZhbHVlID0gZ2V0VmFsdWUoZGF0YSwgZmllbGRzW2ldLmtleSkgfHwgXCJcIjtcbiAgICAgICAgICAgIGlucC5zdHlsZS5jc3NUZXh0ID0gXCJmbGV4OjE7cGFkZGluZzo0cHggOHB4O2JvcmRlcjoxcHggc29saWQgI2QxZDVkYjtib3JkZXItcmFkaXVzOjZweDtmb250LXNpemU6MTJweDtcIjtcbiAgICAgICAgICAgIHJvdy5hcHBlbmRDaGlsZChsYmwpO1xuICAgICAgICAgICAgcm93LmFwcGVuZENoaWxkKGlucCk7XG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQocm93KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIGJ0blJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgYnRuUm93LnN0eWxlLmNzc1RleHQgPSBcImRpc3BsYXk6ZmxleDtnYXA6OHB4O21hcmdpbi10b3A6OHB4O1wiO1xuICAgICAgICAgIHZhciBzYXZlQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgICAgICAgICBzYXZlQnRuLnRleHRDb250ZW50ID0gXCJTYXV2ZWdhcmRlclwiO1xuICAgICAgICAgIHNhdmVCdG4uc3R5bGUuY3NzVGV4dCA9IFwiZmxleDoxO3BhZGRpbmc6NnB4O2JvcmRlcjpub25lO2JvcmRlci1yYWRpdXM6NnB4O2JhY2tncm91bmQ6IzI1NjNlYjtjb2xvcjp3aGl0ZTtmb250LXNpemU6MTJweDtmb250LXdlaWdodDo2MDA7Y3Vyc29yOnBvaW50ZXI7XCI7XG4gICAgICAgICAgc2F2ZUJ0bi5vbmNsaWNrID0gYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgaW5wdXRzID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbnB1dFtkYXRhLWZpZWxkXVwiKTtcbiAgICAgICAgICAgIHZhciBjYWNoZU9iaiA9IGF3YWl0IHJlYWRFbmNyeXB0ZWRDYWNoZSgpIHx8IHt9O1xuICAgICAgICAgICAgaWYgKCFjYWNoZU9iai5jdXJyZW50KSBjYWNoZU9iai5jdXJyZW50ID0ge307XG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGlucHV0cy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICB2YXIga2V5ID0gaW5wdXRzW2pdLmRhdGFzZXQuZmllbGQ7XG4gICAgICAgICAgICAgIHNldFZhbHVlKGNhY2hlT2JqLmN1cnJlbnQsIGtleSwgaW5wdXRzW2pdLnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhY2hlT2JqLmN1cnJlbnQudXBkYXRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgIGF3YWl0IHdyaXRlRW5jcnlwdGVkQ2FjaGUoY2FjaGVPYmopO1xuICAgICAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7IC8qIFJlZnJlc2ggcG9wdXAgKi9cbiAgICAgICAgICB9O1xuICAgICAgICAgIHZhciBjYW5jZWxCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICAgICAgICAgIGNhbmNlbEJ0bi50ZXh0Q29udGVudCA9IFwiQW5udWxlclwiO1xuICAgICAgICAgIGNhbmNlbEJ0bi5zdHlsZS5jc3NUZXh0ID0gXCJmbGV4OjE7cGFkZGluZzo2cHg7Ym9yZGVyOjFweCBzb2xpZCAjZDFkNWRiO2JvcmRlci1yYWRpdXM6NnB4O2JhY2tncm91bmQ6d2hpdGU7Y29sb3I6IzM3NDE1MTtmb250LXNpemU6MTJweDtjdXJzb3I6cG9pbnRlcjtcIjtcbiAgICAgICAgICBjYW5jZWxCdG4ub25jbGljayA9IGZ1bmN0aW9uKCkgeyBsb2NhdGlvbi5yZWxvYWQoKTsgfTtcbiAgICAgICAgICBidG5Sb3cuYXBwZW5kQ2hpbGQoY2FuY2VsQnRuKTtcbiAgICAgICAgICBidG5Sb3cuYXBwZW5kQ2hpbGQoc2F2ZUJ0bik7XG4gICAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGJ0blJvdyk7XG4gICAgICAgIH07XG4gICAgICB9XG4gIH1cblxuICBhc3luYyBmdW5jdGlvbiBzYXZlQ2hhbmdlcygpIHtcbiAgICBjb25zdCBpbnB1dHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGAuZWRpdC1pbnB1dGApO1xuICAgIHZhciBjYWNoZSA9IGF3YWl0IHJlYWRFbmNyeXB0ZWRDYWNoZSgpO1xuICAgIGlmICghY2FjaGUpIGNhY2hlID0ge307XG5cbiAgICBpZiAoY2FjaGUuY3VycmVudCkge1xuICAgICAgY29uc3QgdXBkYXRlZERhdGEgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGNhY2hlLmN1cnJlbnQpKTtcblxuICAgICAgaW5wdXRzLmZvckVhY2goaW5wdXQgPT4ge1xuICAgICAgICBjb25zdCBwYXRoID0gaW5wdXQuZ2V0QXR0cmlidXRlKCdkYXRhLWZpZWxkJyk7XG4gICAgICAgIGlmIChwYXRoKSB7XG4gICAgICAgICAgc2V0VmFsdWUodXBkYXRlZERhdGEsIHBhdGgsIGlucHV0LnZhbHVlKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBlcUlkeCA9IGlucHV0LmdldEF0dHJpYnV0ZSgnZGF0YS1lcS1pZHgnKTtcbiAgICAgICAgY29uc3QgbGluZUlkeCA9IGlucHV0LmdldEF0dHJpYnV0ZSgnZGF0YS1saW5lLWlkeCcpO1xuICAgICAgICBjb25zdCBmaWVsZEtleSA9IGlucHV0LmdldEF0dHJpYnV0ZSgnZGF0YS1maWVsZC1rZXknKTtcbiAgICAgICAgaWYgKGVxSWR4ICE9PSBudWxsICYmIGxpbmVJZHggIT09IG51bGwgJiYgZmllbGRLZXkgJiYgdXBkYXRlZERhdGEuZXF1aXBlbWVudHMpIHtcbiAgICAgICAgICB2YXIgZWkgPSBwYXJzZUludChlcUlkeCwgMTApO1xuICAgICAgICAgIHZhciBsaSA9IHBhcnNlSW50KGxpbmVJZHgsIDEwKTtcbiAgICAgICAgICBpZiAodXBkYXRlZERhdGEuZXF1aXBlbWVudHNbZWldICYmIHVwZGF0ZWREYXRhLmVxdWlwZW1lbnRzW2VpXS5saWduZXNbbGldKSB7XG4gICAgICAgICAgICB2YXIgdmFsID0gaW5wdXQudmFsdWU7XG4gICAgICAgICAgICBpZiAoWydwcml4QnJ1dCcsICdyZW1pc2UnLCAncHJpeE5ldCcsICdybycsICdyYzEnLCAncmFjJ10uaW5kZXhPZihmaWVsZEtleSkgIT09IC0xKSB7XG4gICAgICAgICAgICAgIHZhbCA9IHBhcnNlRmxvYXQodmFsLnJlcGxhY2UoJywnLCAnLicpKSB8fCAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdXBkYXRlZERhdGEuZXF1aXBlbWVudHNbZWldLmxpZ25lc1tsaV1bZmllbGRLZXldID0gdmFsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHVwZGF0ZWREYXRhLnVwZGF0ZWRBdCA9IERhdGUubm93KCk7XG5cbiAgICAgIGF3YWl0IHdyaXRlRW5jcnlwdGVkQ2FjaGUoeyBjdXJyZW50OiB1cGRhdGVkRGF0YSB9KTtcbiAgICAgIGVkaXRpbmdLZXkgPSBudWxsO1xuICAgICAgcmVuZGVyRGF0YSgpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZUVudHJ5KCkge1xuICAgIGF3YWl0IHdyaXRlRW5jcnlwdGVkQ2FjaGUoe30pO1xuICAgIGVkaXRpbmdLZXkgPSBudWxsO1xuICAgIHJlbmRlckRhdGEoKTtcbiAgfVxuXG4gIGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZUVxdWlwZW1lbnQoZXFJZHgpIHtcbiAgICB2YXIgY2FjaGUgPSBhd2FpdCByZWFkRW5jcnlwdGVkQ2FjaGUoKTtcbiAgICBpZiAoIWNhY2hlKSBjYWNoZSA9IHt9O1xuICAgIGlmIChjYWNoZS5jdXJyZW50ICYmIGNhY2hlLmN1cnJlbnQuZXF1aXBlbWVudHMpIHtcbiAgICAgIGNhY2hlLmN1cnJlbnQuZXF1aXBlbWVudHMuc3BsaWNlKGVxSWR4LCAxKTtcbiAgICAgIGNhY2hlLmN1cnJlbnQudXBkYXRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgICAgIGF3YWl0IHdyaXRlRW5jcnlwdGVkQ2FjaGUoY2FjaGUpO1xuICAgICAgcmVuZGVyRGF0YSgpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGZ1bmN0aW9uIGltcG9ydEZyb21DbGlwYm9hcmQoKSB7XG4gICAgY29uc3QgaW1wb3J0QnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ltcG9ydC1idG4nKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgdGV4dCA9IGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQucmVhZFRleHQoKTtcbiAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKHRleHQpO1xuICAgICAgaWYgKCFkYXRhLm0gJiYgIWRhdGEubykge1xuICAgICAgICBpZiAoaW1wb3J0QnRuKSB7IGltcG9ydEJ0bi5pbm5lclRleHQgPSAnUmllbiBcXHUwMGUwIGltcG9ydGVyJzsgc2V0VGltZW91dCgoKSA9PiB7IGltcG9ydEJ0bi5pbm5lclRleHQgPSAnSW1wb3J0ZXIgZGVwdWlzIEF1ZGlCb3QnOyB9LCAyMDAwKTsgfVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG0gPSBkYXRhLm0gfHwge307XG4gICAgICBjb25zdCBvID0gZGF0YS5vIHx8IHt9O1xuXG4gICAgICBhd2FpdCB3cml0ZUVuY3J5cHRlZENhY2hlKHtcbiAgICAgICAgY3VycmVudDoge1xuICAgICAgICAgIC4uLm0sXG4gICAgICAgICAgb3Jkb25uYW5jZTogbyB8fCB7fSxcbiAgICAgICAgICB1cGRhdGVkQXQ6IERhdGUubm93KClcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmIChpbXBvcnRCdG4pIHsgaW1wb3J0QnRuLmlubmVyVGV4dCA9ICdJbXBvcnRcXHUwMGU5ICEnOyBzZXRUaW1lb3V0KCgpID0+IHsgaW1wb3J0QnRuLmlubmVyVGV4dCA9ICdJbXBvcnRlciBkZXB1aXMgQXVkaUJvdCc7IH0sIDIwMDApOyB9XG4gICAgICByZW5kZXJEYXRhKCk7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBpZiAoaW1wb3J0QnRuKSB7IGltcG9ydEJ0bi5pbm5lclRleHQgPSAnRXJyZXVyJzsgc2V0VGltZW91dCgoKSA9PiB7IGltcG9ydEJ0bi5pbm5lclRleHQgPSAnSW1wb3J0ZXIgZGVwdWlzIEF1ZGlCb3QnOyB9LCAyMDAwKTsgfVxuICAgIH1cbiAgfVxuXG4gIC8qIEJvdXRvbiBkJ2ltcG9ydCBlbiBoYXV0IGRlIGxhIHBvcHVwICovXG4gIGNvbnN0IGltcG9ydEJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICBpbXBvcnRCdG4uaWQgPSAnaW1wb3J0LWJ0bic7XG4gIGltcG9ydEJ0bi5pbm5lclRleHQgPSAnSW1wb3J0ZXIgZGVwdWlzIEF1ZGlCb3QnO1xuICBpbXBvcnRCdG4uc3R5bGUuY3NzVGV4dCA9ICd3aWR0aDoxMDAlO3BhZGRpbmc6MTBweDttYXJnaW4tYm90dG9tOjEycHg7YmFja2dyb3VuZDojMjU2M2ViO2NvbG9yOndoaXRlO2JvcmRlcjpub25lO2JvcmRlci1yYWRpdXM6MTJweDtmb250LXdlaWdodDpib2xkO2N1cnNvcjpwb2ludGVyO2ZvbnQtc2l6ZToxM3B4Oyc7XG4gIGltcG9ydEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGltcG9ydEZyb21DbGlwYm9hcmQpO1xuICBkYXRhQ29udGFpbmVyLnBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKGltcG9ydEJ0biwgZGF0YUNvbnRhaW5lcik7XG5cbiAgLyogXHUyNTAwXHUyNTAwIEJvdXRvbnMgUmVjb3JkIFx1MjUwMFx1MjUwMCAqL1xuICB2YXIgcmVjb3JkZXJTZWN0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgcmVjb3JkZXJTZWN0aW9uLnN0eWxlLmNzc1RleHQgPSBcIm1hcmdpbi1ib3R0b206MTJweDtwYWRkaW5nOjEwcHg7YmFja2dyb3VuZDojZmVmMmYyO2JvcmRlcjoxcHggc29saWQgI2ZlY2FjYTtib3JkZXItcmFkaXVzOjEycHg7XCI7XG5cbiAgdmFyIHJlY29yZGVyVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICByZWNvcmRlclRpdGxlLnN0eWxlLmNzc1RleHQgPSBcImZvbnQtc2l6ZToxMXB4O2ZvbnQtd2VpZ2h0OjcwMDtjb2xvcjojN2YxZDFkO21hcmdpbi1ib3R0b206OHB4O1wiO1xuICByZWNvcmRlclRpdGxlLnRleHRDb250ZW50ID0gXCJcdTIzRkEgRW5yZWdpc3RyZXIgdW4gcGFyY291cnNcIjtcblxuICB2YXIgYnRuUmVjb3JkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgYnRuUmVjb3JkLmlkID0gXCJhdWRpYm90LWJ0bi1yZWNvcmRcIjtcbiAgYnRuUmVjb3JkLnRleHRDb250ZW50ID0gXCJcdTIzRkEgRFx1MDBFOW1hcnJlciBsJ2VucmVnaXN0cmVtZW50XCI7XG4gIGJ0blJlY29yZC5zdHlsZS5jc3NUZXh0ID0gXCJ3aWR0aDoxMDAlO3BhZGRpbmc6OHB4O2JhY2tncm91bmQ6I2VmNDQ0NDtjb2xvcjp3aGl0ZTtib3JkZXI6bm9uZTtib3JkZXItcmFkaXVzOjhweDtmb250LXNpemU6MTJweDtmb250LXdlaWdodDo3MDA7Y3Vyc29yOnBvaW50ZXI7bWFyZ2luLWJvdHRvbTo0cHg7XCI7XG5cbiAgdmFyIGJ0blN0b3AgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICBidG5TdG9wLmlkID0gXCJhdWRpYm90LWJ0bi1zdG9wXCI7XG4gIGJ0blN0b3AudGV4dENvbnRlbnQgPSBcIlx1MjNGOSBBcnJcdTAwRUF0ZXIgZXQgc2F1dmVnYXJkZXJcIjtcbiAgYnRuU3RvcC5zdHlsZS5jc3NUZXh0ID0gXCJ3aWR0aDoxMDAlO3BhZGRpbmc6OHB4O2JhY2tncm91bmQ6IzY0NzQ4Yjtjb2xvcjp3aGl0ZTtib3JkZXI6bm9uZTtib3JkZXItcmFkaXVzOjhweDtmb250LXNpemU6MTJweDtmb250LXdlaWdodDo3MDA7Y3Vyc29yOnBvaW50ZXI7ZGlzcGxheTpub25lO1wiO1xuXG4gIHZhciByZWNvcmRlclN0YXR1cyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIHJlY29yZGVyU3RhdHVzLmlkID0gXCJhdWRpYm90LXJlY29yZGVyLXN0YXR1c1wiO1xuICByZWNvcmRlclN0YXR1cy5zdHlsZS5jc3NUZXh0ID0gXCJmb250LXNpemU6MTBweDtjb2xvcjojNmI3MjgwO3RleHQtYWxpZ246Y2VudGVyO21hcmdpbi10b3A6NHB4O1wiO1xuXG4gIGJ0blJlY29yZC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgY2hyb21lLnRhYnMucXVlcnkoeyBhY3RpdmU6IHRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWUgfSwgZnVuY3Rpb24odGFicykge1xuICAgICAgaWYgKHRhYnNbMF0gJiYgdGFic1swXS5pZCkge1xuICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJzWzBdLmlkLCB7IHR5cGU6IFwiQVVESUJPVF9SRUNPUkRFUl9TVEFSVFwiIH0pO1xuICAgICAgICBidG5SZWNvcmQuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICBidG5TdG9wLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICAgIHJlY29yZGVyU3RhdHVzLnRleHRDb250ZW50ID0gXCJFbnJlZ2lzdHJlbWVudCBlbiBjb3Vycy4uLlwiO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcblxuICBidG5TdG9wLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICBjaHJvbWUudGFicy5xdWVyeSh7IGFjdGl2ZTogdHJ1ZSwgY3VycmVudFdpbmRvdzogdHJ1ZSB9LCBmdW5jdGlvbih0YWJzKSB7XG4gICAgICBpZiAodGFic1swXSAmJiB0YWJzWzBdLmlkKSB7XG4gICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYnNbMF0uaWQsIHsgdHlwZTogXCJBVURJQk9UX1JFQ09SREVSX1NUT1BcIiB9KTtcbiAgICAgICAgYnRuUmVjb3JkLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICAgIGJ0blN0b3Auc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICByZWNvcmRlclN0YXR1cy50ZXh0Q29udGVudCA9IFwiUGFyY291cnMgc2F1dmVnYXJkXHUwMEU5IFx1MjAxNCBlbiBhdHRlbnRlIGRlIHZhbGlkYXRpb24gYWRtaW5cIjtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG5cbiAgcmVjb3JkZXJTZWN0aW9uLmFwcGVuZENoaWxkKHJlY29yZGVyVGl0bGUpO1xuICByZWNvcmRlclNlY3Rpb24uYXBwZW5kQ2hpbGQoYnRuUmVjb3JkKTtcbiAgcmVjb3JkZXJTZWN0aW9uLmFwcGVuZENoaWxkKGJ0blN0b3ApO1xuICByZWNvcmRlclNlY3Rpb24uYXBwZW5kQ2hpbGQocmVjb3JkZXJTdGF0dXMpO1xuICBkYXRhQ29udGFpbmVyLnBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKHJlY29yZGVyU2VjdGlvbiwgZGF0YUNvbnRhaW5lcik7XG5cbiAgLyogVlx1MDBFOXJpZmllciBsJ1x1MDBFOXRhdCBkdSByZWNvcmRlciBkZXB1aXMgbGUgc3RvcmFnZSAoc3Vydml0IGF1eCBuYXZpZ2F0aW9ucykgKi9cbiAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFtcImF1ZGlib3RfcmVjb3JkZXJcIl0sIGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgIHZhciBzYXZlZCA9IHJlc3VsdC5hdWRpYm90X3JlY29yZGVyO1xuICAgIGlmIChzYXZlZCAmJiBzYXZlZC5hY3RpdmUpIHtcbiAgICAgIGJ0blJlY29yZC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICBidG5TdG9wLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICByZWNvcmRlclN0YXR1cy50ZXh0Q29udGVudCA9IFwiXHUyM0ZBIEVuIGNvdXJzIFx1MjAxNCBcIiArIChzYXZlZC5ldGFwZXMgPyBzYXZlZC5ldGFwZXMubGVuZ3RoIDogMCkgKyBcIiBcdTAwRTl0YXBlcyBlbnJlZ2lzdHJcdTAwRTllc1wiO1xuICAgIH1cbiAgfSk7XG4gIC8qIFx1MjUwMFx1MjUwMCBGaW4gQm91dG9ucyBSZWNvcmQgXHUyNTAwXHUyNTAwICovXG5cbiAgcmVuZGVyRGF0YSgpO1xuXG4gIC8qIFx1MjUwMFx1MjUwMCBBdXRvLXJlZnJlc2ggcXVhbmQgbGUgY2FjaGUgY2hhbmdlIChleDogY2xpYyBNXHUwMEU5bW9yaXNlciBzdXIgbGEgcGFnZSkgXHUyNTAwXHUyNTAwICovXG4gIGNocm9tZS5zdG9yYWdlLm9uQ2hhbmdlZC5hZGRMaXN0ZW5lcihmdW5jdGlvbihjaGFuZ2VzLCBhcmVhKSB7XG4gICAgaWYgKGFyZWEgPT09ICdsb2NhbCcgJiYgY2hhbmdlcy5hdWRpYm90X2NhY2hlKSB7XG4gICAgICByZW5kZXJEYXRhKCk7XG4gICAgfVxuICB9KTtcblxuICAvKiBcdTI1MDBcdTI1MDAgVG9nZ2xlIGJvdXRvbnMgZmxvdHRhbnRzIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuICBjb25zdCB0b2dnbGVDaGVja2JveCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2dnbGUtYnV0dG9ucycpO1xuICBjb25zdCB0b2dnbGVUcmFjayA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2dnbGUtdHJhY2snKTtcbiAgY29uc3QgdG9nZ2xlVGh1bWIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9nZ2xlLXRodW1iJyk7XG5cbiAgZnVuY3Rpb24gdXBkYXRlVG9nZ2xlVUkodmlzaWJsZSkge1xuICAgIGlmICghdG9nZ2xlQ2hlY2tib3ggfHwgIXRvZ2dsZVRyYWNrIHx8ICF0b2dnbGVUaHVtYikgcmV0dXJuO1xuICAgIHRvZ2dsZUNoZWNrYm94LmNoZWNrZWQgPSB2aXNpYmxlO1xuICAgIHRvZ2dsZVRyYWNrLnN0eWxlLmJhY2tncm91bmQgPSB2aXNpYmxlID8gJyMyNTYzZWInIDogJyNkMWQ1ZGInO1xuICAgIHRvZ2dsZVRodW1iLnN0eWxlLnRyYW5zZm9ybSA9IHZpc2libGUgPyAndHJhbnNsYXRlWCgyMHB4KScgOiAndHJhbnNsYXRlWCgwKSc7XG4gIH1cblxuICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoWydhdWRpYm90X2J1dHRvbnNfdmlzaWJsZSddLCAocmVzdWx0KSA9PiB7XG4gICAgY29uc3QgdmlzaWJsZSA9IHJlc3VsdC5hdWRpYm90X2J1dHRvbnNfdmlzaWJsZSAhPT0gZmFsc2U7XG4gICAgdXBkYXRlVG9nZ2xlVUkodmlzaWJsZSk7XG4gIH0pO1xuXG4gIGlmICh0b2dnbGVDaGVja2JveCkge1xuICAgIHRvZ2dsZUNoZWNrYm94LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcbiAgICAgIGNvbnN0IHZpc2libGUgPSB0b2dnbGVDaGVja2JveC5jaGVja2VkO1xuICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHsgYXVkaWJvdF9idXR0b25zX3Zpc2libGU6IHZpc2libGUgfSk7XG4gICAgICB1cGRhdGVUb2dnbGVVSSh2aXNpYmxlKTtcblxuICAgICAgY2hyb21lLnRhYnMucXVlcnkoeyBhY3RpdmU6IHRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWUgfSwgKHRhYnMpID0+IHtcbiAgICAgICAgaWYgKHRhYnNbMF0/LmlkKSB7XG4gICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFic1swXS5pZCwgeyB0eXBlOiAnQVVESUJPVF9UT0dHTEVfQlVUVE9OUycsIHZpc2libGUgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyogXHUyNTAwXHUyNTAwIFRvZ2dsZSByZW1wbGlzc2FnZSBhdXRvIGF1IGNoYXJnZW1lbnQgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG4gIGNvbnN0IHRvZ2dsZUF1dG9maWxsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RvZ2dsZS1hdXRvZmlsbCcpO1xuICBjb25zdCB0b2dnbGVBdXRvZmlsbFRyYWNrID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RvZ2dsZS1hdXRvZmlsbC10cmFjaycpO1xuICBjb25zdCB0b2dnbGVBdXRvZmlsbFRodW1iID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RvZ2dsZS1hdXRvZmlsbC10aHVtYicpO1xuXG4gIGZ1bmN0aW9uIHVwZGF0ZUF1dG9maWxsVG9nZ2xlVUkoZW5hYmxlZCkge1xuICAgIGlmICghdG9nZ2xlQXV0b2ZpbGwgfHwgIXRvZ2dsZUF1dG9maWxsVHJhY2sgfHwgIXRvZ2dsZUF1dG9maWxsVGh1bWIpIHJldHVybjtcbiAgICB0b2dnbGVBdXRvZmlsbC5jaGVja2VkID0gZW5hYmxlZDtcbiAgICB0b2dnbGVBdXRvZmlsbFRyYWNrLnN0eWxlLmJhY2tncm91bmQgPSBlbmFibGVkID8gJyMyNTYzZWInIDogJyNkMWQ1ZGInO1xuICAgIHRvZ2dsZUF1dG9maWxsVGh1bWIuc3R5bGUudHJhbnNmb3JtID0gZW5hYmxlZCA/ICd0cmFuc2xhdGVYKDIwcHgpJyA6ICd0cmFuc2xhdGVYKDApJztcbiAgfVxuXG4gIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbJ2F1ZGlib3Rfc2V0dGluZ3MnXSwgKHJlc3VsdCkgPT4ge1xuICAgIHZhciBzZXR0aW5ncyA9IHJlc3VsdC5hdWRpYm90X3NldHRpbmdzIHx8IHt9O1xuICAgIC8qIFBhciBkXHUwMEU5ZmF1dCBhY3Rpdlx1MDBFOSAodHJ1ZSkgKi9cbiAgICB2YXIgZW5hYmxlZCA9IHNldHRpbmdzLmF1dG9maWxsT25Mb2FkICE9PSBmYWxzZTtcbiAgICB1cGRhdGVBdXRvZmlsbFRvZ2dsZVVJKGVuYWJsZWQpO1xuICB9KTtcblxuICBpZiAodG9nZ2xlQXV0b2ZpbGwpIHtcbiAgICB0b2dnbGVBdXRvZmlsbC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoWydhdWRpYm90X3NldHRpbmdzJ10sIChyZXN1bHQpID0+IHtcbiAgICAgICAgdmFyIHNldHRpbmdzID0gcmVzdWx0LmF1ZGlib3Rfc2V0dGluZ3MgfHwge307XG4gICAgICAgIHNldHRpbmdzLmF1dG9maWxsT25Mb2FkID0gdG9nZ2xlQXV0b2ZpbGwuY2hlY2tlZDtcbiAgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHsgYXVkaWJvdF9zZXR0aW5nczogc2V0dGluZ3MgfSk7XG4gICAgICAgIHVwZGF0ZUF1dG9maWxsVG9nZ2xlVUkodG9nZ2xlQXV0b2ZpbGwuY2hlY2tlZCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qIFx1MjUwMFx1MjUwMCBUb2dnbGUgZFx1MDBFOXRlY3Rpb24gYXV0b21hdGlxdWUgZGVzIHJlamV0cyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cbiAgY29uc3QgdG9nZ2xlUmVqZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9nZ2xlLXJlamV0Jyk7XG4gIGNvbnN0IHRvZ2dsZVJlamV0VHJhY2sgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9nZ2xlLXJlamV0LXRyYWNrJyk7XG4gIGNvbnN0IHRvZ2dsZVJlamV0VGh1bWIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9nZ2xlLXJlamV0LXRodW1iJyk7XG5cbiAgZnVuY3Rpb24gdXBkYXRlUmVqZXRUb2dnbGVVSShlbmFibGVkKSB7XG4gICAgaWYgKCF0b2dnbGVSZWpldCB8fCAhdG9nZ2xlUmVqZXRUcmFjayB8fCAhdG9nZ2xlUmVqZXRUaHVtYikgcmV0dXJuO1xuICAgIHRvZ2dsZVJlamV0LmNoZWNrZWQgPSBlbmFibGVkO1xuICAgIHRvZ2dsZVJlamV0VHJhY2suc3R5bGUuYmFja2dyb3VuZCA9IGVuYWJsZWQgPyAnIzI1NjNlYicgOiAnI2QxZDVkYic7XG4gICAgdG9nZ2xlUmVqZXRUaHVtYi5zdHlsZS50cmFuc2Zvcm0gPSBlbmFibGVkID8gJ3RyYW5zbGF0ZVgoMjBweCknIDogJ3RyYW5zbGF0ZVgoMCknO1xuICB9XG5cbiAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFsnYXVkaWJvdF9yZWpldF9jb25zZW50J10sIChyZXN1bHQpID0+IHtcbiAgICBjb25zdCBlbmFibGVkID0gcmVzdWx0LmF1ZGlib3RfcmVqZXRfY29uc2VudCA9PT0gdHJ1ZTtcbiAgICB1cGRhdGVSZWpldFRvZ2dsZVVJKGVuYWJsZWQpO1xuICB9KTtcblxuICBpZiAodG9nZ2xlUmVqZXQpIHtcbiAgICB0b2dnbGVSZWpldC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICBjb25zdCBlbmFibGVkID0gdG9nZ2xlUmVqZXQuY2hlY2tlZDtcbiAgICAgIC8qIGF1ZGlib3RfcmVqZXRfY29uc2VudCA9IGNvbnNlbnRlbWVudCBleHBsaWNpdGUgZGUgbCd1dGlsaXNhdGV1ciAqL1xuICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHtcbiAgICAgICAgYXVkaWJvdF9yZWpldF9jb25zZW50OiBlbmFibGVkLFxuICAgICAgICBhdWRpYm90X3JlamV0X2VuYWJsZWQ6IGVuYWJsZWRcbiAgICAgIH0pO1xuICAgICAgdXBkYXRlUmVqZXRUb2dnbGVVSShlbmFibGVkKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qIFYzOiBQcmV2aWV3IGJlZm9yZSBmaWxsIHRvZ2dsZSAqL1xuICBjb25zdCB0b2dnbGVQcmV2aWV3ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RvZ2dsZS1wcmV2aWV3Jyk7XG4gIGNvbnN0IHRvZ2dsZVByZXZpZXdUcmFjayA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2dnbGUtcHJldmlldy10cmFjaycpO1xuICBjb25zdCB0b2dnbGVQcmV2aWV3VGh1bWIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9nZ2xlLXByZXZpZXctdGh1bWInKTtcblxuICBmdW5jdGlvbiB1cGRhdGVQcmV2aWV3VG9nZ2xlVUkoZW5hYmxlZCkge1xuICAgIGlmICghdG9nZ2xlUHJldmlldyB8fCAhdG9nZ2xlUHJldmlld1RyYWNrIHx8ICF0b2dnbGVQcmV2aWV3VGh1bWIpIHJldHVybjtcbiAgICB0b2dnbGVQcmV2aWV3LmNoZWNrZWQgPSBlbmFibGVkO1xuICAgIHRvZ2dsZVByZXZpZXdUcmFjay5zdHlsZS5iYWNrZ3JvdW5kID0gZW5hYmxlZCA/ICcjMjU2M2ViJyA6ICcjZDFkNWRiJztcbiAgICB0b2dnbGVQcmV2aWV3VGh1bWIuc3R5bGUudHJhbnNmb3JtID0gZW5hYmxlZCA/ICd0cmFuc2xhdGVYKDIwcHgpJyA6ICd0cmFuc2xhdGVYKDApJztcbiAgfVxuXG4gIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbJ2F1ZGlib3Rfc2V0dGluZ3MnXSwgKHJlc3VsdCkgPT4ge1xuICAgIHZhciBzZXR0aW5ncyA9IHJlc3VsdC5hdWRpYm90X3NldHRpbmdzIHx8IHt9O1xuICAgIHVwZGF0ZVByZXZpZXdUb2dnbGVVSShzZXR0aW5ncy5wcmV2aWV3QmVmb3JlRmlsbCB8fCBmYWxzZSk7XG4gIH0pO1xuXG4gIGlmICh0b2dnbGVQcmV2aWV3KSB7XG4gICAgdG9nZ2xlUHJldmlldy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoWydhdWRpYm90X3NldHRpbmdzJ10sIChyZXN1bHQpID0+IHtcbiAgICAgICAgdmFyIHNldHRpbmdzID0gcmVzdWx0LmF1ZGlib3Rfc2V0dGluZ3MgfHwge307XG4gICAgICAgIHNldHRpbmdzLnByZXZpZXdCZWZvcmVGaWxsID0gdG9nZ2xlUHJldmlldy5jaGVja2VkO1xuICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoeyBhdWRpYm90X3NldHRpbmdzOiBzZXR0aW5ncyB9KTtcbiAgICAgICAgdXBkYXRlUHJldmlld1RvZ2dsZVVJKHRvZ2dsZVByZXZpZXcuY2hlY2tlZCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qIFYzLTY6IFRQIFN0YXR1cyBUcmFja2VyICovXG4gIGZ1bmN0aW9uIGxvYWRUUFRyYWNrZXIoKSB7XG4gICAgdmFyIGNhcmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhcmQtdHAtdHJhY2tlclwiKTtcbiAgICB2YXIgbGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidHAtdHJhY2tlci1saXN0XCIpO1xuICAgIGlmICghY2FyZCB8fCAhbGlzdCkgcmV0dXJuO1xuXG4gICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFtcImF1ZGlib3RfdHBfaGlzdG9yeVwiLCBcImF1ZGlib3RfYXV0aFwiXSwgZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICB2YXIgYXV0aCA9IHJlc3VsdC5hdWRpYm90X2F1dGggfHwge307XG4gICAgICBpZiAoIWF1dGguc3luY1Rva2VuKSB7IGNhcmQuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiOyByZXR1cm47IH1cblxuICAgICAgY2FyZC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuXG4gICAgICAvKiBGZXRjaCBUUCBzdGF0dXMgZnJvbSBiYWNrZW5kICovXG4gICAgICBmZXRjaChcImh0dHBzOi8vYXVkaWJvdC5mci9hcGkvZXh0ZW5zaW9uL3RwLXN0YXR1c1wiLCB7XG4gICAgICAgIGhlYWRlcnM6IHsgXCJBdXRob3JpemF0aW9uXCI6IFwiQmVhcmVyIFwiICsgYXV0aC5zeW5jVG9rZW4gfVxuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHIpIHsgcmV0dXJuIHIuanNvbigpOyB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgZG9zc2llcnMgPSBkYXRhLmRvc3NpZXJzIHx8IFtdO1xuICAgICAgICBpZiAoZG9zc2llcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgbGlzdC50ZXh0Q29udGVudCA9IFwiQXVjdW4gZG9zc2llciBUUCBlbiBjb3Vycy5cIjtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGlzdC5pbm5lckhUTUwgPSBcIlwiO1xuICAgICAgICB2YXIgc3RhdHVzSWNvbnMgPSB7IGFjY2VwdGVkOiBcIlxcdTI3MDVcIiwgcGVuZGluZzogXCJcXHUyM0YzXCIsIHJlamVjdGVkOiBcIlxcdTI3NENcIiB9O1xuICAgICAgICB2YXIgc3RhdHVzQ29sb3JzID0geyBhY2NlcHRlZDogXCIjMDU5NjY5XCIsIHBlbmRpbmc6IFwiI2Q5NzcwNlwiLCByZWplY3RlZDogXCIjZGMyNjI2XCIgfTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkb3NzaWVycy5sZW5ndGggJiYgaSA8IDEwOyBpKyspIHtcbiAgICAgICAgICB2YXIgZCA9IGRvc3NpZXJzW2ldO1xuICAgICAgICAgIHZhciByb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICAgIHJvdy5zdHlsZS5jc3NUZXh0ID0gXCJkaXNwbGF5OmZsZXg7anVzdGlmeS1jb250ZW50OnNwYWNlLWJldHdlZW47YWxpZ24taXRlbXM6Y2VudGVyO3BhZGRpbmc6NnB4IDA7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgI2YzZjRmNjtcIjtcbiAgICAgICAgICByb3cuaW5uZXJIVE1MID0gJzxzcGFuPicgKyBlc2MoZC5kYXRlIHx8IFwiXCIpICsgJyBcXHUyMDE0ICcgKyBlc2MoZC5vcmdhbmlzbWUgfHwgXCJcIikuc3Vic3RyaW5nKDAsIDIwKSArICc8L3NwYW4+JyArXG4gICAgICAgICAgICAnPHNwYW4gc3R5bGU9XCJkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo0cHg7XCI+JyArXG4gICAgICAgICAgICAnPHNwYW4gc3R5bGU9XCJmb250LXNpemU6MTJweDtcIj4nICsgZXNjKGQubW9udGFudCB8fCBcIlwiKSArICc8L3NwYW4+JyArXG4gICAgICAgICAgICAnPHNwYW4gc3R5bGU9XCJjb2xvcjonICsgKHN0YXR1c0NvbG9yc1tkLnN0YXR1c10gfHwgXCIjNmI3MjgwXCIpICsgJztmb250LXNpemU6MTFweDtmb250LXdlaWdodDo2MDA7XCI+JyArIChzdGF0dXNJY29uc1tkLnN0YXR1c10gfHwgXCI/XCIpICsgJyAnICsgZXNjKGQuc3RhdHVzIHx8IFwiaW5jb25udVwiKSArICc8L3NwYW4+JyArXG4gICAgICAgICAgICAnPC9zcGFuPic7XG4gICAgICAgICAgbGlzdC5hcHBlbmRDaGlsZChyb3cpO1xuICAgICAgICB9XG4gICAgICAgIC8qIFNhdmUgbG9jYWxseSBmb3Igb2ZmbGluZSAqL1xuICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoeyBhdWRpYm90X3RwX2hpc3Rvcnk6IHsgZG9zc2llcnM6IGRvc3NpZXJzLCB0czogRGF0ZS5ub3coKSB9IH0pO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgLyogRmFsbGJhY2sgdG8gY2FjaGVkICovXG4gICAgICAgIHZhciBjYWNoZWQgPSByZXN1bHQuYXVkaWJvdF90cF9oaXN0b3J5O1xuICAgICAgICBpZiAoY2FjaGVkICYmIGNhY2hlZC5kb3NzaWVycykge1xuICAgICAgICAgIGxpc3QudGV4dENvbnRlbnQgPSBjYWNoZWQuZG9zc2llcnMubGVuZ3RoICsgXCIgZG9zc2llcnMgKGNhY2hlKVwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxpc3QudGV4dENvbnRlbnQgPSBcIkltcG9zc2libGUgZGUgY2hhcmdlciBsZXMgZG9zc2llcnMuXCI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS53YXJuKFwiW0F1ZGlCb3RdIFRQIHRyYWNrZXIgZmV0Y2ggZmFpbGVkOlwiLCBlcnIpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICB2YXIgcmVmcmVzaFRQQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJidG4tcmVmcmVzaC10cFwiKTtcbiAgaWYgKHJlZnJlc2hUUEJ0bikgcmVmcmVzaFRQQnRuLm9uY2xpY2sgPSBsb2FkVFBUcmFja2VyO1xuICBsb2FkVFBUcmFja2VyKCk7XG5cbiAgLyogVjMtNzogUmVqZWN0aW9uIFJvb3QgQ2F1c2UgQW5hbHlzaXMgKi9cbiAgZnVuY3Rpb24gbG9hZFJlamVjdGlvbkRldGFpbHMoKSB7XG4gICAgdmFyIGNhcmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhcmQtcmVqZWN0aW9uc1wiKTtcbiAgICB2YXIgbGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVqZXQtZGV0YWlscy1saXN0XCIpO1xuICAgIHZhciBjb3VudEJhZGdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZWpldC1jb3VudFwiKTtcbiAgICBpZiAoIWNhcmQgfHwgIWxpc3QpIHJldHVybjtcblxuICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbXCJhdWRpYm90X2F1dGhcIl0sIGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgdmFyIGF1dGggPSByZXN1bHQuYXVkaWJvdF9hdXRoIHx8IHt9O1xuICAgICAgaWYgKCFhdXRoLnN5bmNUb2tlbikgcmV0dXJuO1xuXG4gICAgICBmZXRjaChcImh0dHBzOi8vYXVkaWJvdC5mci9hcGkvZXh0ZW5zaW9uL3JlamVjdGlvbnNcIiwge1xuICAgICAgICBoZWFkZXJzOiB7IFwiQXV0aG9yaXphdGlvblwiOiBcIkJlYXJlciBcIiArIGF1dGguc3luY1Rva2VuIH1cbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbihyKSB7IHJldHVybiByLmpzb24oKTsgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHJlamVjdGlvbnMgPSBkYXRhLnJlamVjdGlvbnMgfHwgW107XG4gICAgICAgIGlmIChyZWplY3Rpb25zLmxlbmd0aCA9PT0gMCkgeyBjYXJkLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjsgcmV0dXJuOyB9XG5cbiAgICAgICAgY2FyZC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgICAgICBpZiAoY291bnRCYWRnZSkgY291bnRCYWRnZS50ZXh0Q29udGVudCA9IHJlamVjdGlvbnMubGVuZ3RoICsgXCIgcmVqZXQocylcIjtcbiAgICAgICAgbGlzdC5pbm5lckhUTUwgPSBcIlwiO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVqZWN0aW9ucy5sZW5ndGggJiYgaSA8IDU7IGkrKykge1xuICAgICAgICAgIHZhciByID0gcmVqZWN0aW9uc1tpXTtcbiAgICAgICAgICB2YXIgaXRlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgaXRlbS5zdHlsZS5jc3NUZXh0ID0gXCJwYWRkaW5nOjhweDttYXJnaW4tYm90dG9tOjZweDtiYWNrZ3JvdW5kOiNmZWYyZjI7Ym9yZGVyLXJhZGl1czo4cHg7Ym9yZGVyLWxlZnQ6M3B4IHNvbGlkICNkYzI2MjY7XCI7XG5cbiAgICAgICAgICB2YXIgaGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgICBoZWFkZXIuc3R5bGUuY3NzVGV4dCA9IFwiZGlzcGxheTpmbGV4O2p1c3RpZnktY29udGVudDpzcGFjZS1iZXR3ZWVuO2ZvbnQtc2l6ZToxMnB4O2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjojOTkxYjFiO21hcmdpbi1ib3R0b206NHB4O1wiO1xuICAgICAgICAgIGhlYWRlci50ZXh0Q29udGVudCA9IGVzYyhyLnBvcnRhaWwgfHwgXCJQb3J0YWlsXCIpICsgXCIgXFx1MjAxNCBcIiArIGVzYyhyLmRhdGUgfHwgXCJcIik7XG4gICAgICAgICAgaXRlbS5hcHBlbmRDaGlsZChoZWFkZXIpO1xuXG4gICAgICAgICAgaWYgKHIucmVhc29uKSB7XG4gICAgICAgICAgICB2YXIgcmVhc29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgICAgIHJlYXNvbi5zdHlsZS5jc3NUZXh0ID0gXCJmb250LXNpemU6MTFweDtjb2xvcjojN2YxZDFkO21hcmdpbi1ib3R0b206NHB4O1wiO1xuICAgICAgICAgICAgcmVhc29uLnRleHRDb250ZW50ID0gXCJSYWlzb24gOiBcIiArIGVzYyhyLnJlYXNvbik7XG4gICAgICAgICAgICBpdGVtLmFwcGVuZENoaWxkKHJlYXNvbik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHIuc3VnZ2VzdGlvbikge1xuICAgICAgICAgICAgdmFyIHN1Z2cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICAgICAgc3VnZy5zdHlsZS5jc3NUZXh0ID0gXCJmb250LXNpemU6MTFweDtjb2xvcjojMDY1ZjQ2O2JhY2tncm91bmQ6I2VjZmRmNTtwYWRkaW5nOjRweCA4cHg7Ym9yZGVyLXJhZGl1czo0cHg7XCI7XG4gICAgICAgICAgICBzdWdnLnRleHRDb250ZW50ID0gXCJBY3Rpb24gOiBcIiArIGVzYyhyLnN1Z2dlc3Rpb24pO1xuICAgICAgICAgICAgaXRlbS5hcHBlbmRDaGlsZChzdWdnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsaXN0LmFwcGVuZENoaWxkKGl0ZW0pO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycikgeyBjb25zb2xlLndhcm4oXCJbQXVkaUJvdF0gcmVqZWN0aW9uIGRldGFpbHMgZmV0Y2ggZmFpbGVkOlwiLCBlcnIpOyB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGxvYWRSZWplY3Rpb25EZXRhaWxzKCk7XG5cbiAgLyogVjMtMTE6IFRlYW0gRGFzaGJvYXJkICovXG4gIGZ1bmN0aW9uIGxvYWRUZWFtRGFzaGJvYXJkKHBsYW4pIHtcbiAgICB2YXIgY2FyZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FyZC10ZWFtXCIpO1xuICAgIHZhciBzdGF0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGVhbS1zdGF0c1wiKTtcbiAgICBpZiAoIWNhcmQgfHwgIXN0YXRzKSByZXR1cm47XG4gICAgaWYgKHBsYW4gIT09IFwiRVFVSVBFXCIgJiYgcGxhbiAhPT0gXCJlcXVpcGVcIikgcmV0dXJuO1xuXG4gICAgY2FyZC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuXG4gICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFtcImF1ZGlib3RfYXV0aFwiXSwgZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICB2YXIgYXV0aCA9IHJlc3VsdC5hdWRpYm90X2F1dGggfHwge307XG4gICAgICBpZiAoIWF1dGguc3luY1Rva2VuKSByZXR1cm47XG5cbiAgICAgIGZldGNoKFwiaHR0cHM6Ly9hdWRpYm90LmZyL2FwaS9leHRlbnNpb24vdGVhbS1hY3Rpdml0eVwiLCB7XG4gICAgICAgIGhlYWRlcnM6IHsgXCJBdXRob3JpemF0aW9uXCI6IFwiQmVhcmVyIFwiICsgYXV0aC5zeW5jVG9rZW4gfVxuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHIpIHsgcmV0dXJuIHIuanNvbigpOyB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgYWN0aXZpdHkgPSBkYXRhLmFjdGl2aXR5IHx8IHt9O1xuICAgICAgICBzdGF0cy5pbm5lckhUTUwgPVxuICAgICAgICAgICc8ZGl2IHN0eWxlPVwiZGlzcGxheTpncmlkO2dyaWQtdGVtcGxhdGUtY29sdW1uczoxZnIgMWZyO2dhcDo4cHg7XCI+JyArXG4gICAgICAgICAgJzxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOmNlbnRlcjtwYWRkaW5nOjhweDtiYWNrZ3JvdW5kOiNmMGY5ZmY7Ym9yZGVyLXJhZGl1czo4cHg7XCI+PGRpdiBzdHlsZT1cImZvbnQtc2l6ZToyMHB4O2ZvbnQtd2VpZ2h0OjcwMDtjb2xvcjojMjU2M2ViO1wiPicgKyBlc2MoU3RyaW5nKGFjdGl2aXR5LmZpbGxzVG9kYXkgfHwgMCkpICsgJzwvZGl2PjxkaXYgc3R5bGU9XCJmb250LXNpemU6MTBweDtjb2xvcjojNmI3MjgwO1wiPkZpbGxzIGF1am91cmRcXCdodWk8L2Rpdj48L2Rpdj4nICtcbiAgICAgICAgICAnPGRpdiBzdHlsZT1cInRleHQtYWxpZ246Y2VudGVyO3BhZGRpbmc6OHB4O2JhY2tncm91bmQ6I2ZlZjJmMjtib3JkZXItcmFkaXVzOjhweDtcIj48ZGl2IHN0eWxlPVwiZm9udC1zaXplOjIwcHg7Zm9udC13ZWlnaHQ6NzAwO2NvbG9yOiNkYzI2MjY7XCI+JyArIGVzYyhTdHJpbmcoYWN0aXZpdHkucmVqZWN0c1RvZGF5IHx8IDApKSArICc8L2Rpdj48ZGl2IHN0eWxlPVwiZm9udC1zaXplOjEwcHg7Y29sb3I6IzZiNzI4MDtcIj5SZWpldHM8L2Rpdj48L2Rpdj4nICtcbiAgICAgICAgICAnPGRpdiBzdHlsZT1cInRleHQtYWxpZ246Y2VudGVyO3BhZGRpbmc6OHB4O2JhY2tncm91bmQ6I2YwZmRmNDtib3JkZXItcmFkaXVzOjhweDtcIj48ZGl2IHN0eWxlPVwiZm9udC1zaXplOjIwcHg7Zm9udC13ZWlnaHQ6NzAwO2NvbG9yOiMwNTk2Njk7XCI+JyArIGVzYyhTdHJpbmcoYWN0aXZpdHkuYWNjZXB0YW5jZVJhdGUgfHwgXCJcXHUyMDE0XCIpKSArICc8L2Rpdj48ZGl2IHN0eWxlPVwiZm9udC1zaXplOjEwcHg7Y29sb3I6IzZiNzI4MDtcIj5UYXV4IGFjY2VwdGF0aW9uPC9kaXY+PC9kaXY+JyArXG4gICAgICAgICAgJzxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOmNlbnRlcjtwYWRkaW5nOjhweDtiYWNrZ3JvdW5kOiNmYWY1ZmY7Ym9yZGVyLXJhZGl1czo4cHg7XCI+PGRpdiBzdHlsZT1cImZvbnQtc2l6ZToyMHB4O2ZvbnQtd2VpZ2h0OjcwMDtjb2xvcjojN2MzYWVkO1wiPicgKyBlc2MoU3RyaW5nKGFjdGl2aXR5LmFjdGl2ZU1lbWJlcnMgfHwgMCkpICsgJzwvZGl2PjxkaXYgc3R5bGU9XCJmb250LXNpemU6MTBweDtjb2xvcjojNmI3MjgwO1wiPk1lbWJyZXMgYWN0aWZzPC9kaXY+PC9kaXY+JyArXG4gICAgICAgICAgJzwvZGl2Pic7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgICAgICBzdGF0cy50ZXh0Q29udGVudCA9IFwiSW1wb3NzaWJsZSBkZSBjaGFyZ2VyIGxlcyBkb25uZWVzIGVxdWlwZS5cIjtcbiAgICAgICAgY29uc29sZS53YXJuKFwiW0F1ZGlCb3RdIHRlYW0gZGFzaGJvYXJkIGZldGNoIGZhaWxlZDpcIiwgZXJyKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgbG9hZFRlYW1EYXNoYm9hcmQoY3VycmVudFBsYW4pO1xuXG4gIH0gLyogZW5kIGluaXRQb3B1cCAqL1xuICB9IC8qIGVuZCBzdGFydFBvcHVwICovXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7OztBQU9BLFdBQVMsaUJBQWlCLG9CQUFvQixXQUFXO0FBQ3ZELGFBQVMsaUJBQWlCLHNCQUFzQixFQUFFLFFBQVEsU0FBUyxTQUFTO0FBQzFFLGNBQVEsaUJBQWlCLFNBQVMsV0FBVztBQUMzQyxZQUFJLFlBQVksS0FBSyxHQUFHLFFBQVEsWUFBWSxVQUFVO0FBQ3RELFlBQUksVUFBVSxTQUFTLGVBQWUsU0FBUztBQUMvQyxZQUFJLENBQUMsUUFBUztBQUNkLFlBQUksU0FBUyxRQUFRLFVBQVUsU0FBUyxNQUFNO0FBQzlDLGdCQUFRLFVBQVUsT0FBTyxRQUFRLENBQUMsTUFBTTtBQUN4QyxhQUFLLFVBQVUsT0FBTyxRQUFRLENBQUMsTUFBTTtBQUFBLE1BQ3ZDLENBQUM7QUFBQSxJQUNILENBQUM7QUFFRCxhQUFTLFdBQVcsWUFBWSxTQUFTLFNBQVM7QUFDaEQsVUFBSSxLQUFLLFNBQVMsZUFBZSxVQUFVO0FBQzNDLFVBQUksUUFBUSxTQUFTLGVBQWUsT0FBTztBQUMzQyxVQUFJLFFBQVEsU0FBUyxlQUFlLE9BQU87QUFDM0MsVUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTztBQUM3QixlQUFTLFNBQVM7QUFDaEIsY0FBTSxNQUFNLGFBQWEsR0FBRyxVQUFVLFlBQVk7QUFDbEQsY0FBTSxNQUFNLFlBQVksR0FBRyxVQUFVLHFCQUFxQjtBQUFBLE1BQzVEO0FBQ0EsU0FBRyxpQkFBaUIsVUFBVSxNQUFNO0FBQ3BDLGFBQU87QUFBQSxJQUNUO0FBQ0EsZUFBVyxrQkFBa0IsZ0JBQWdCLGNBQWM7QUFDM0QsZUFBVyxtQkFBbUIseUJBQXlCLHVCQUF1QjtBQUM5RSxlQUFXLGdCQUFnQixzQkFBc0Isb0JBQW9CO0FBQ3JFLGVBQVcsa0JBQWtCLHdCQUF3QixzQkFBc0I7QUFBQSxFQUM3RSxDQUFDO0FBRUQsV0FBUyxpQkFBaUIsb0JBQW9CLE1BQU07QUFDbEQsVUFBTSxnQkFBZ0IsU0FBUyxlQUFlLGdCQUFnQjtBQUM5RCxRQUFJLGFBQWE7QUFHakIsYUFBUyxJQUFJLEtBQUs7QUFDaEIsVUFBSSxRQUFRLFFBQVEsUUFBUSxPQUFXLFFBQU87QUFDOUMsYUFBTyxPQUFPLEdBQUcsRUFDZCxRQUFRLE1BQU0sT0FBTyxFQUNyQixRQUFRLE1BQU0sTUFBTSxFQUNwQixRQUFRLE1BQU0sTUFBTSxFQUNwQixRQUFRLE1BQU0sUUFBUSxFQUN0QixRQUFRLE1BQU0sUUFBUTtBQUFBLElBQzNCO0FBRUEsVUFBTSxjQUFjLEVBQUUsTUFBTSxRQUFRLFdBQVcsYUFBYSxLQUFLLE9BQU8sUUFBUSxTQUFTO0FBQ3pGLFVBQU0scUJBQXFCO0FBRzNCLGFBQVMsWUFBWTtBQUNuQixhQUFPLFFBQVEsTUFBTSxJQUFJLEVBQUUsY0FBYyxFQUFFLFFBQVEsS0FBSyxJQUFJLElBQUkscUJBQXFCLEtBQUssSUFBSyxFQUFFLENBQUM7QUFFbEcsYUFBTyxRQUFRLFlBQVksRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQUEsSUFDM0Q7QUFDQSxhQUFTLGlCQUFpQixTQUFTLFNBQVM7QUFDNUMsYUFBUyxpQkFBaUIsV0FBVyxTQUFTO0FBRTlDLGFBQVMsV0FBVyxTQUFTO0FBQzNCLFVBQUksT0FBTyxTQUFTLEtBQUssY0FBYyxZQUFZO0FBQ25ELFVBQUksQ0FBQyxLQUFNLFFBQU8sU0FBUztBQUMzQixXQUFLLFlBQVksNE5BR3FDLFdBQVcsZ0NBQW1DO0FBR3BHLFVBQUksTUFBTSxTQUFTLGVBQWUsWUFBWTtBQUM5QyxVQUFJLElBQUssS0FBSSxpQkFBaUIsU0FBUyxhQUFhO0FBQUEsSUFDdEQ7QUFFQSxhQUFTLGtCQUFrQixPQUFPO0FBQ2hDLFVBQUksWUFBWSxTQUFTLEtBQUssY0FBYyxZQUFZO0FBQ3hELFVBQUksQ0FBQyxVQUFXLGFBQVksU0FBUztBQUNyQyxnQkFBVSxZQUFZLDBRQUdvRCxRQUFRO0FBQUEsSUFHcEY7QUFFQSxhQUFTLGdCQUFnQjtBQUN2QixhQUFPLFFBQVEsTUFBTSxJQUFJLENBQUMsY0FBYyxHQUFHLFNBQVMsUUFBUTtBQUMxRCxZQUFJLE9BQU8sT0FBTyxnQkFBZ0IsQ0FBQztBQUNuQyxZQUFJLFFBQVEsS0FBSztBQUNqQixZQUFJLENBQUMsT0FBTztBQUNWLDRCQUFrQiwwREFBMEQ7QUFDNUU7QUFBQSxRQUNGO0FBQ0EsY0FBTSwyQ0FBMkMsRUFBRSxTQUFTLEVBQUUsaUJBQWlCLFlBQVksTUFBTSxFQUFFLENBQUMsRUFDakcsS0FBSyxTQUFTLEdBQUc7QUFBRSxpQkFBTyxFQUFFLEtBQUs7QUFBQSxRQUFHLENBQUMsRUFDckMsS0FBSyxTQUFTLE1BQU07QUFDbkIsY0FBSSxLQUFLLElBQUk7QUFDWCxzQkFBVTtBQUNWLHFCQUFTLE9BQU87QUFBQSxVQUNsQixPQUFPO0FBQ0wsOEJBQWtCLEtBQUssU0FBUyx5Q0FBMkM7QUFBQSxVQUM3RTtBQUFBLFFBQ0YsQ0FBQyxFQUNBLE1BQU0sV0FBVztBQUNoQiw0QkFBa0IscURBQXlEO0FBQUEsUUFDN0UsQ0FBQztBQUFBLE1BQ0wsQ0FBQztBQUFBLElBQ0g7QUFHQSxXQUFPLFFBQVEsTUFBTSxJQUFJLENBQUMsY0FBYyxHQUFHLFNBQVMsUUFBUTtBQUMxRCxVQUFJLFdBQVcsT0FBTyxnQkFBZ0IsQ0FBQztBQUN2QyxVQUFJLFNBQVMsU0FBUyxVQUFVO0FBQ2hDLFVBQUksU0FBUyxLQUFLLEtBQUssSUFBSSxJQUFJLFFBQVE7QUFDckMsbUJBQVcsZ0RBQXNEO0FBQ2pFO0FBQUEsTUFDRjtBQUVBLGdCQUFVO0FBQ1YsaUJBQVc7QUFBQSxJQUNiLENBQUM7QUFFRCxhQUFTLGFBQWE7QUFFdEIscUJBQWUsZ0JBQWdCO0FBQzdCLGVBQU8sSUFBSSxRQUFRLENBQUMsWUFBWTtBQUM5QixpQkFBTyxRQUFRLE1BQU0sSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLFdBQVc7QUFDckQsa0JBQU0sT0FBTyxPQUFPLGdCQUFnQixDQUFDO0FBQ3JDLGtCQUFNLFFBQVEsS0FBSyxhQUFhO0FBQ2hDLGtCQUFNLFlBQVksS0FBSyxpQkFBaUI7QUFFeEMsZ0JBQUksQ0FBQyxPQUFPO0FBQ1Ysc0JBQVEsRUFBRSxJQUFJLE9BQU8sT0FBTywyREFBMkQsQ0FBQztBQUN4RjtBQUFBLFlBQ0Y7QUFHQSxnQkFBSSxhQUFhLEtBQUssSUFBSSxJQUFJLFdBQVc7QUFDdkMsc0JBQVEsRUFBRSxJQUFJLE9BQU8sT0FBTyx3REFBMEQsQ0FBQztBQUN2RjtBQUFBLFlBQ0Y7QUFFQSxrQkFBTSwyQ0FBMkMsRUFBRSxTQUFTLEVBQUUsaUJBQWlCLFlBQVksTUFBTSxFQUFFLENBQUMsRUFDakcsS0FBSyxTQUFTLEdBQUc7QUFBRSxxQkFBTyxFQUFFLEtBQUs7QUFBQSxZQUFHLENBQUMsRUFDckMsS0FBSyxTQUFTLE1BQU07QUFBRSxzQkFBUSxJQUFJO0FBQUEsWUFBRyxDQUFDLEVBQ3RDLE1BQU0sV0FBVztBQUFFLHNCQUFRLEVBQUUsSUFBSSxPQUFPLE9BQU8sc0RBQTBELENBQUM7QUFBQSxZQUFHLENBQUM7QUFBQSxVQUNuSCxDQUFDO0FBQUEsUUFDSCxDQUFDO0FBQUEsTUFDSDtBQUVBLGVBQVMsWUFBWSxPQUFPO0FBQzFCLFlBQUksWUFBWSxTQUFTLGVBQWUsZ0JBQWdCO0FBQ3hELGtCQUFVLGNBQWMsWUFBWSwwUUFHc0MsUUFBUTtBQUFBLE1BR3BGO0FBRUEsZUFBUyxrQkFBa0IsTUFBTSxXQUFXO0FBQzFDLFlBQUksUUFBUSxZQUFZLElBQUksS0FBSztBQUNqQyxZQUFJLFFBQVEsU0FBUyxjQUFjLEtBQUs7QUFDeEMsY0FBTSxNQUFNLFVBQVU7QUFDdEIsY0FBTSxjQUFjLFlBQVksUUFBUTtBQUN4QyxZQUFJLEtBQUssU0FBUyxjQUFjLElBQUk7QUFDcEMsWUFBSSxHQUFJLElBQUcsY0FBYyxhQUFhLE9BQU8sR0FBRyxXQUFXO0FBRzNELFlBQUksV0FBVztBQUNiLGNBQUksWUFBWSxZQUFZLEtBQUssSUFBSTtBQUNyQyxjQUFJLFlBQVksS0FBSyxZQUFZLEtBQUssS0FBSyxLQUFNO0FBQy9DLGdCQUFJLFFBQVEsS0FBSyxLQUFLLGFBQWEsS0FBSyxLQUFLLElBQUs7QUFDbEQsZ0JBQUksVUFBVSxTQUFTLGNBQWMsS0FBSztBQUMxQyxvQkFBUSxNQUFNLFVBQVU7QUFDeEIsb0JBQVEsY0FBYyx1Q0FBdUMsUUFBUSxJQUFJLFFBQVEsTUFBTSxzQkFBc0I7QUFDN0csZ0JBQUksR0FBSSxJQUFHLGNBQWMsYUFBYSxTQUFTLE1BQU0sV0FBVztBQUFBLFVBQ2xFO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFFQSxvQkFBYyxZQUFZO0FBRTFCLG9CQUFjLEVBQUUsS0FBSyxTQUFTLFFBQVE7QUFDcEMsWUFBSSxDQUFDLE9BQU8sSUFBSTtBQUNkLHNCQUFZLE9BQU8sS0FBSztBQUN4QjtBQUFBLFFBQ0Y7QUFFQSxlQUFPLFFBQVEsTUFBTSxJQUFJLENBQUMsY0FBYyxHQUFHLFNBQVMsWUFBWTtBQUM5RCxjQUFJLE9BQU8sV0FBVyxnQkFBZ0IsQ0FBQztBQUN2Qyw0QkFBa0IsT0FBTyxNQUFNLEtBQUssYUFBYTtBQUFBLFFBQ25ELENBQUM7QUFDRCxzQkFBYyxZQUFZO0FBQzFCLGtCQUFVLE9BQU8sSUFBSTtBQUFBLE1BQ3ZCLENBQUM7QUFFRCxlQUFTLFVBQVUsYUFBYTtBQUdoQyxpQkFBUyxTQUFTLEtBQUssTUFBTTtBQUMzQixpQkFBTyxLQUFLLE1BQU0sR0FBRyxFQUFFLE9BQU8sQ0FBQyxLQUFLLFNBQVMsT0FBTyxJQUFJLElBQUksR0FBRyxHQUFHLEtBQUs7QUFBQSxRQUN6RTtBQUdBLGlCQUFTLFNBQVMsS0FBSyxNQUFNLE9BQU87QUFDbEMsZ0JBQU0sUUFBUSxLQUFLLE1BQU0sR0FBRztBQUM1QixjQUFJLFVBQVU7QUFDZCxtQkFBUyxJQUFJLEdBQUcsSUFBSSxNQUFNLFNBQVMsR0FBRyxLQUFLO0FBQ3pDLGtCQUFNLE9BQU8sTUFBTSxDQUFDO0FBQ3BCLGdCQUFJLENBQUMsUUFBUSxJQUFJLEVBQUcsU0FBUSxJQUFJLElBQUksQ0FBQztBQUNyQyxzQkFBVSxRQUFRLElBQUk7QUFBQSxVQUN4QjtBQUNBLGtCQUFRLE1BQU0sTUFBTSxTQUFTLENBQUMsQ0FBQyxJQUFJO0FBQUEsUUFDckM7QUFFQSx1QkFBZSxhQUFhO0FBQzFCLGNBQUksUUFBUSxNQUFNLG1CQUFtQjtBQUNyQyxjQUFJLENBQUMsTUFBTyxTQUFRLENBQUM7QUFDckIsY0FBSSxxQkFBcUIsTUFBTSxJQUFJLFFBQVEsU0FBUyxTQUFTO0FBQzNELG1CQUFPLFFBQVEsTUFBTSxJQUFJLENBQUMsY0FBYyxHQUFHLFNBQVMsR0FBRztBQUFFLHNCQUFRLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztBQUFBLFlBQUcsQ0FBQztBQUFBLFVBQzNGLENBQUM7QUFDRCxjQUFJLE9BQU8sTUFBTTtBQUVmLGNBQUksQ0FBQyxNQUFNO0FBQ1QsMEJBQWMsWUFBWTtBQUMxQjtBQUFBLFVBQ0Y7QUFFQSx3QkFBYyxZQUFZO0FBRTFCO0FBQ0Usa0JBQU0sTUFBTTtBQUNaLGtCQUFNLFlBQVksZUFBZTtBQUNqQyxrQkFBTSxPQUFPLFNBQVMsY0FBYyxLQUFLO0FBQ3pDLGlCQUFLLFlBQVk7QUFFakIsa0JBQU0sWUFBWSxLQUFLLFlBQVksSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFLG1CQUFtQixJQUFJO0FBRW5GLGtCQUFNLFdBQVc7QUFBQSxjQUNmO0FBQUEsZ0JBQ0UsT0FBTztBQUFBLGdCQUNQLFFBQVE7QUFBQSxrQkFDTixFQUFFLElBQUksT0FBTyxPQUFPLE1BQU07QUFBQSxrQkFDMUIsRUFBRSxJQUFJLFVBQVUsT0FBTyxZQUFjO0FBQUEsa0JBQ3JDLEVBQUUsSUFBSSxPQUFPLE9BQU8sY0FBZ0I7QUFBQSxrQkFDcEMsRUFBRSxJQUFJLE9BQU8sT0FBTyxNQUFNO0FBQUEsa0JBQzFCLEVBQUUsSUFBSSxTQUFTLE9BQU8sU0FBVztBQUFBLGtCQUNqQyxFQUFFLElBQUksU0FBUyxPQUFPLFFBQVE7QUFBQSxrQkFDOUIsRUFBRSxJQUFJLFdBQVcsT0FBTyxVQUFVO0FBQUEsa0JBQ2xDLEVBQUUsSUFBSSxXQUFXLE9BQU8sS0FBSztBQUFBLGtCQUM3QixFQUFFLElBQUksUUFBUSxPQUFPLFFBQVE7QUFBQSxnQkFDL0I7QUFBQSxjQUNGO0FBQUEsY0FDQTtBQUFBLGdCQUNFLE9BQU87QUFBQSxnQkFDUCxTQUFTLFdBQVc7QUFDbEIsc0JBQUksU0FBUyxTQUFTLE1BQU0sNkJBQTZCLEtBQUssU0FBUyxNQUFNLDhCQUE4QjtBQUMzRyxzQkFBSSxRQUFRO0FBQ1YsMkJBQU87QUFBQSxzQkFDTCxFQUFFLElBQUksK0JBQStCLE9BQU8sT0FBTztBQUFBLHNCQUNuRCxFQUFFLElBQUksK0JBQStCLE9BQU8sV0FBVztBQUFBLHNCQUN2RCxFQUFFLElBQUksNkJBQTZCLE9BQU8sWUFBWTtBQUFBLHNCQUN0RCxFQUFFLElBQUksaUNBQWlDLE9BQU8sS0FBSztBQUFBLHNCQUNuRCxFQUFFLElBQUksZ0NBQWdDLE9BQU8sU0FBUztBQUFBLHNCQUN0RCxFQUFFLElBQUksa0NBQWtDLE9BQU8sU0FBUztBQUFBLHNCQUN4RCxFQUFFLElBQUksNkJBQTZCLE9BQU8sU0FBUztBQUFBLHNCQUNuRCxFQUFFLElBQUksa0NBQWtDLE9BQU8sU0FBUztBQUFBLHNCQUN4RCxFQUFFLElBQUksZ0NBQWdDLE9BQU8sU0FBUztBQUFBLHNCQUN0RCxFQUFFLElBQUksa0NBQWtDLE9BQU8sU0FBUztBQUFBLHNCQUN4RCxFQUFFLElBQUksNkJBQTZCLE9BQU8sU0FBUztBQUFBLHNCQUNuRCxFQUFFLElBQUksa0NBQWtDLE9BQU8sU0FBUztBQUFBLHNCQUN4RCxFQUFFLElBQUksd0NBQXdDLE9BQU8sUUFBUTtBQUFBLHNCQUM3RCxFQUFFLElBQUksbUNBQW1DLE9BQU8sU0FBUztBQUFBLHNCQUN6RCxFQUFFLElBQUksd0NBQXdDLE9BQU8sUUFBUTtBQUFBLHNCQUM3RCxFQUFFLElBQUksbUNBQW1DLE9BQU8sU0FBUztBQUFBLHNCQUN6RCxFQUFFLElBQUksd0JBQXdCLE9BQU8sWUFBWTtBQUFBLG9CQUNuRDtBQUFBLGtCQUNGO0FBQ0EseUJBQU87QUFBQSxvQkFDTCxFQUFFLElBQUksNkJBQTZCLE9BQU8sZUFBZTtBQUFBLG9CQUN6RCxFQUFFLElBQUkscUJBQXFCLE9BQU8sT0FBTztBQUFBLG9CQUN6QyxFQUFFLElBQUksMkJBQTJCLE9BQU8sU0FBUztBQUFBLG9CQUNqRCxFQUFFLElBQUksaUNBQWlDLE9BQU8sT0FBTztBQUFBLG9CQUNyRCxFQUFFLElBQUksMEJBQTBCLE9BQU8sU0FBUztBQUFBLG9CQUNoRCxFQUFFLElBQUksNEJBQTRCLE9BQU8sU0FBUztBQUFBLG9CQUNsRCxFQUFFLElBQUksdUJBQXVCLE9BQU8sU0FBUztBQUFBLG9CQUM3QyxFQUFFLElBQUksNEJBQTRCLE9BQU8sU0FBUztBQUFBLG9CQUNsRCxFQUFFLElBQUksMEJBQTBCLE9BQU8sU0FBUztBQUFBLG9CQUNoRCxFQUFFLElBQUksNEJBQTRCLE9BQU8sU0FBUztBQUFBLG9CQUNsRCxFQUFFLElBQUksdUJBQXVCLE9BQU8sU0FBUztBQUFBLG9CQUM3QyxFQUFFLElBQUksNEJBQTRCLE9BQU8sU0FBUztBQUFBLG9CQUNsRCxFQUFFLElBQUksbUNBQW1DLE9BQU8sY0FBYztBQUFBLG9CQUM5RCxFQUFFLElBQUkscUNBQXFDLE9BQU8sY0FBYztBQUFBLG9CQUNoRSxFQUFFLElBQUksbUNBQW1DLE9BQU8sY0FBYztBQUFBLG9CQUM5RCxFQUFFLElBQUkscUNBQXFDLE9BQU8sY0FBYztBQUFBLGtCQUNsRTtBQUFBLGdCQUNGLEdBQUc7QUFBQSxjQUNMO0FBQUEsWUFDRjtBQUVBLGdCQUFJLE9BQU87QUFBQTtBQUFBLG9CQUVDLFlBQVksaUJBQWlCLGlCQUFtQixJQUFJLEtBQUssVUFBVSxFQUFFLENBQUMsSUFBSSxJQUFJLEtBQUssT0FBTyxRQUFRLENBQUMsRUFBRTtBQUFBO0FBQUEsZ0JBRXpHLFlBQVk7QUFBQSxxREFDeUIsR0FBRztBQUFBO0FBQUEsa0JBRXRDO0FBQUE7QUFBQSxxREFFbUMsR0FBRztBQUFBLHNEQUNGLEdBQUc7QUFBQSxlQUMxQztBQUFBO0FBQUE7QUFBQSw4Q0FHaUMsU0FBUztBQUFBO0FBQUE7QUFJakQscUJBQVMsUUFBUSxhQUFXO0FBQzFCLG9CQUFNLFVBQVUsUUFBUSxPQUFPLEtBQUssT0FBSyxTQUFTLE1BQU0sRUFBRSxFQUFFLENBQUM7QUFFN0Qsa0JBQUksYUFBYSxTQUFTO0FBQ3hCLHdCQUFRLGdKQUFnSixJQUFJLFFBQVEsS0FBSyxDQUFDO0FBRTFLLHdCQUFRLE9BQU8sUUFBUSxXQUFTO0FBQzlCLHdCQUFNLE1BQU0sU0FBUyxNQUFNLE1BQU0sRUFBRTtBQUNuQyxzQkFBSSxXQUFXO0FBQ2IsNEJBQVE7QUFBQTtBQUFBLCtDQUV1QixNQUFNLEtBQUs7QUFBQSx3RUFDYyxNQUFNLEVBQUUsWUFBWSxJQUFJLEdBQUcsQ0FBQztBQUFBO0FBQUE7QUFBQSxrQkFHdEYsV0FBVyxLQUFLO0FBQ2QsNEJBQVE7QUFBQTtBQUFBLCtDQUV1QixNQUFNLEtBQUs7QUFBQSwrQ0FDWCxJQUFJLEdBQUcsQ0FBQztBQUFBO0FBQUE7QUFBQSxrQkFHekM7QUFBQSxnQkFDRixDQUFDO0FBQUEsY0FDSDtBQUFBLFlBQ0YsQ0FBQztBQUVELG9CQUFRO0FBR1IsZ0JBQUksS0FBSyxXQUFXLFdBQVc7QUFDN0Isa0JBQUksS0FBSyxLQUFLLFdBQVcsQ0FBQztBQUMxQixzQkFBUTtBQUVSLGtCQUFJLGVBQWU7QUFBQSxnQkFDakIsRUFBRSxNQUFNLGtCQUFxQyxPQUFPLEtBQUs7QUFBQSxnQkFDekQsRUFBRSxNQUFNLHNCQUFxQyxPQUFPLFdBQVc7QUFBQSxnQkFDL0QsRUFBRSxNQUFNLG1CQUFxQyxPQUFPLE1BQU07QUFBQSxnQkFDMUQsRUFBRSxNQUFNLDhCQUFxQyxPQUFPLG9CQUF3QjtBQUFBLGdCQUM1RSxFQUFFLE1BQU0sNkJBQXFDLE9BQU8sZ0JBQWtCO0FBQUEsZ0JBQ3RFLEVBQUUsTUFBTSxzQ0FBcUMsT0FBTyxzQkFBNEI7QUFBQSxnQkFDaEYsRUFBRSxNQUFNLDhCQUFxQyxPQUFPLGFBQWE7QUFBQSxnQkFDakUsRUFBRSxNQUFNLG1CQUFxQyxPQUFPLE1BQU07QUFBQSxnQkFDMUQsRUFBRSxNQUFNLDhCQUFxQyxPQUFPLHNCQUEwQjtBQUFBLGNBQ2hGO0FBRUEsMkJBQWEsUUFBUSxTQUFTLEdBQUc7QUFDL0Isb0JBQUksTUFBTSxTQUFTLE1BQU0sRUFBRSxJQUFJLEtBQUs7QUFDcEMsb0JBQUksV0FBVztBQUNiLDBCQUFRLDJEQUEyRCxJQUFJLEVBQUUsS0FBSyxDQUFDLDREQUE0RCxFQUFFLElBQUksWUFBWSxJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFBQSxnQkFDL0ssV0FBVyxLQUFLO0FBQ2QsMEJBQVEsbURBQW1ELElBQUksRUFBRSxLQUFLLENBQUMsbUNBQW1DLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQztBQUFBLGdCQUM1SDtBQUFBLGNBQ0YsQ0FBQztBQUFBLFlBQ0g7QUFHQSxnQkFBSSxLQUFLLGVBQWUsS0FBSyxZQUFZLFNBQVMsR0FBRztBQUNuRCxzQkFBUSxnS0FBa0ssS0FBSyxZQUFZLE1BQU07QUFFak0sbUJBQUssWUFBWSxRQUFRLFNBQVMsSUFBSSxLQUFLO0FBQ3pDLG9CQUFJLFVBQVcsR0FBRyxXQUFXLE1BQU0sY0FBYyxpQkFBaUIsR0FBRyxTQUFTO0FBQzlFLHdCQUFRLHVDQUF1QyxHQUFHO0FBQ2xELHdCQUFRLGlEQUFpRCxPQUFPLFdBQVcsSUFBSSxHQUFHLFFBQVEsVUFBVSxDQUFDLElBQUksR0FBRyxTQUFTLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxNQUFNLEVBQUUsMkRBQTJELEdBQUcsa0JBQWtCLEdBQUcsMEZBQTBGLEdBQUcsa0JBQWtCLEdBQUc7QUFFelYsb0JBQUksR0FBRyxZQUFZO0FBQ2pCLDBCQUFRLDhCQUE4QixJQUFJLEdBQUcsVUFBVSxDQUFDO0FBQUEsZ0JBQzFEO0FBRUEsb0JBQUksR0FBRyxVQUFVLEdBQUcsT0FBTyxTQUFTLEdBQUc7QUFDckMscUJBQUcsT0FBTyxRQUFRLFNBQVMsR0FBRyxJQUFJO0FBQ2hDLHdCQUFJLFlBQVksRUFBRSxTQUFTLFlBQVksWUFBWSxFQUFFLFNBQVMsVUFBVSxXQUFXLEVBQUUsT0FBTyxZQUFZLEVBQUU7QUFDMUcsd0JBQUksTUFBTSxRQUFRLE1BQU0sUUFBUSxLQUFLO0FBQ3JDLDRCQUFRO0FBQ1IsNEJBQVEsOERBQThELElBQUksU0FBUyxDQUFDO0FBRXBGLHdCQUFJLGNBQWMsRUFBRSxTQUFTLGdCQUFnQixDQUFDLEVBQUU7QUFDaEQsd0JBQUksU0FBUztBQUFBLHNCQUNYLEVBQUUsS0FBSyxlQUFlLE9BQU8sV0FBVyxLQUFLLEVBQUUsYUFBYSxLQUFLLElBQUksT0FBTyxrQkFBa0I7QUFBQSxzQkFDOUYsRUFBRSxLQUFLLFdBQVcsT0FBTyxZQUFZLEtBQUssY0FBYyx3QkFBVSxFQUFFLFdBQVcsSUFBSyxLQUFLLFVBQVUsTUFBTSxDQUFDLENBQUMsRUFBRSxXQUFXLGFBQWEsT0FBTyxjQUFjLG1DQUFtQyxJQUFJLE9BQU8sY0FBYyw2RUFBcUUsR0FBRztBQUFBLHNCQUM5UixFQUFFLEtBQUssVUFBVSxPQUFPLFVBQVUsS0FBSyxFQUFFLFVBQVUsSUFBSSxLQUFLLElBQUksTUFBTSxDQUFDLENBQUMsRUFBRSxPQUFPO0FBQUEsc0JBQ2pGLEVBQUUsS0FBSyxZQUFZLE9BQU8sYUFBYSxLQUFLLEVBQUUsU0FBUyxRQUFRLENBQUMsR0FBRyxLQUFLLElBQUksUUFBUSxVQUFVO0FBQUEsc0JBQzlGLEVBQUUsS0FBSyxVQUFVLE9BQU8sVUFBVSxLQUFLLEVBQUUsT0FBTyxRQUFRLENBQUMsR0FBRyxLQUFLLElBQUksUUFBUSxXQUFXLE1BQU0sRUFBRSxTQUFTLEVBQUU7QUFBQSxzQkFDM0csRUFBRSxLQUFLLFdBQVcsT0FBTyxZQUFZLEtBQUssRUFBRSxRQUFRLFFBQVEsQ0FBQyxHQUFHLEtBQUssV0FBVyxRQUFRLFVBQVU7QUFBQSxzQkFDbEcsRUFBRSxLQUFLLE1BQU0sT0FBTyxNQUFNLEtBQUssRUFBRSxHQUFHLFFBQVEsQ0FBQyxHQUFHLEtBQUssSUFBSSxRQUFRLFVBQVU7QUFBQSxzQkFDM0UsRUFBRSxLQUFLLE9BQU8sT0FBTyxNQUFNLEtBQUssRUFBRSxJQUFJLFFBQVEsQ0FBQyxHQUFHLEtBQUssSUFBSSxRQUFRLFVBQVU7QUFBQSxzQkFDN0UsRUFBRSxLQUFLLE9BQU8sT0FBTyxPQUFPLEtBQUssRUFBRSxJQUFJLFFBQVEsQ0FBQyxHQUFHLEtBQUssVUFBVSxRQUFRLFVBQVU7QUFBQSxvQkFDdEY7QUFFQSwyQkFBTyxRQUFRLFNBQVMsR0FBRztBQUN6QiwwQkFBSSxFQUFFLFNBQVMsTUFBTztBQUN0QiwwQkFBSSxXQUFXO0FBQ2IsZ0NBQVEsMkRBQTJELElBQUksRUFBRSxLQUFLLENBQUMsNEVBQTRFLEdBQUcsb0JBQW9CLEVBQUUscUJBQXFCLEVBQUUsR0FBRyxZQUFZLElBQUksT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQUEsc0JBQzlPLE9BQU87QUFDTCxnQ0FBUSxtREFBbUQsSUFBSSxFQUFFLEtBQUssQ0FBQyxrQ0FBa0MsRUFBRSxHQUFHLEtBQUssRUFBRSxRQUFRLFlBQVksRUFBRSxRQUFRLE1BQU0sRUFBRSxJQUFJLEVBQUUsUUFBUSxZQUFZLEVBQUUsUUFBUSxNQUFNLEVBQUUsSUFBSSxJQUFJLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsVUFBVSxFQUFFO0FBQUEsc0JBQ2hQO0FBQUEsb0JBQ0YsQ0FBQztBQUVELDRCQUFRO0FBQUEsa0JBQ1YsQ0FBQztBQUFBLGdCQUNIO0FBRUEsb0JBQUksR0FBRyxVQUFVLEdBQUcsT0FBTyxLQUFLO0FBQzlCLDBCQUFRLHNEQUFzRCxHQUFHLE9BQU8sSUFBSSxRQUFRLENBQUMsQ0FBQyx1QkFBdUIsR0FBRyxPQUFPLEdBQUcsUUFBUSxDQUFDLENBQUMsZ0JBQWdCLEdBQUcsT0FBTyxJQUFJLFFBQVEsQ0FBQyxDQUFDLHNDQUFzQyxHQUFHLE9BQU8sSUFBSSxRQUFRLENBQUMsQ0FBQztBQUFBLGdCQUM1TztBQUVBLHdCQUFRO0FBQUEsY0FDVixDQUFDO0FBRUQsa0JBQUksS0FBSyxrQkFBa0I7QUFDekIsd0JBQVEsK0lBQStJLEtBQUssaUJBQWlCLFFBQVEsQ0FBQyxDQUFDLHVDQUF1QyxLQUFLLGtCQUFrQixHQUFHLFFBQVEsQ0FBQyxDQUFDO0FBQUEsY0FDcFE7QUFBQSxZQUNGO0FBRUEsaUJBQUssWUFBWTtBQUNqQiwwQkFBYyxZQUFZLElBQUk7QUFBQSxVQUNoQztBQUdBLFdBQUMsaUJBQWlCO0FBQ2hCLGdCQUFJO0FBQ0Ysa0JBQUksWUFBWSxNQUFNLGFBQWE7QUFDbkMsa0JBQUksQ0FBQyxVQUFXO0FBR2hCLHFCQUFPLEtBQUssTUFBTSxFQUFFLFFBQVEsTUFBTSxlQUFlLEtBQUssR0FBRyxlQUFlLE1BQU07QUFDNUUsb0JBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFLO0FBQ3ZDLG9CQUFJLFNBQVMsS0FBSyxDQUFDLEVBQUU7QUFDckIsb0JBQUksUUFBUSxLQUFLLENBQUMsRUFBRTtBQUNwQixvQkFBSSxpQkFBaUI7QUFDckIsb0JBQUk7QUFDRixtQ0FBaUIsSUFBSSxJQUFJLE1BQU0sRUFBRSxTQUFTLFFBQVEsVUFBVSxFQUFFO0FBQUEsZ0JBQ2hFLFNBQVEsR0FBRztBQUFFO0FBQUEsZ0JBQVE7QUFDckIsb0JBQUksQ0FBQyxlQUFnQjtBQUVyQixvQkFBSTtBQUNGLHNCQUFJLE1BQU0sTUFBTSxNQUFNLHdEQUF3RCxtQkFBbUIsY0FBYyxHQUFHLEVBQUUsU0FBUyxFQUFFLGlCQUFpQixZQUFZLFVBQVUsRUFBRSxDQUFDO0FBQ3pLLHNCQUFJLENBQUMsSUFBSSxHQUFJO0FBQ2Isc0JBQUksVUFBVSxNQUFNLElBQUksS0FBSztBQUM3QixzQkFBSSxlQUFlLFFBQVEsWUFBWSxDQUFDO0FBQ3hDLHNCQUFJLGFBQWEsV0FBVyxFQUFHO0FBRy9CLHNCQUFJLFlBQVksU0FBUyxlQUFlLGdCQUFnQjtBQUN4RCxzQkFBSSxDQUFDLFVBQVc7QUFFaEIsc0JBQUksT0FBTyxTQUFTLGNBQWMsS0FBSztBQUN2Qyx1QkFBSyxNQUFNLFVBQVU7QUFFckIsc0JBQUksUUFBUSxTQUFTLGNBQWMsS0FBSztBQUN4Qyx3QkFBTSxNQUFNLFVBQVU7QUFDdEIsd0JBQU0sY0FBYztBQUNwQix1QkFBSyxZQUFZLEtBQUs7QUFFdEIsK0JBQWEsUUFBUSxTQUFTLEdBQUc7QUFDL0Isd0JBQUksTUFBTSxTQUFTLGNBQWMsS0FBSztBQUN0Qyx3QkFBSSxNQUFNLFVBQVU7QUFFcEIsd0JBQUksUUFBUSxTQUFTLGNBQWMsTUFBTTtBQUN6QywwQkFBTSxNQUFNLFVBQVU7QUFDdEIsMEJBQU0sY0FBYyxFQUFFO0FBRXRCLHdCQUFJLFlBQVksU0FBUyxjQUFjLFFBQVE7QUFDL0MsOEJBQVUsY0FBYztBQUN4Qiw4QkFBVSxNQUFNLFVBQVU7QUFDMUIsOEJBQVUsaUJBQWlCLFNBQVMsV0FBVztBQUM3QywwQkFBSSxDQUFDLE1BQU87QUFDWiw2QkFBTyxLQUFLLFlBQVksT0FBTyxFQUFFLE1BQU0sMkJBQTJCLFlBQVksRUFBRSxHQUFHLENBQUM7QUFDcEYsNkJBQU8sTUFBTTtBQUFBLG9CQUNmLENBQUM7QUFFRCx3QkFBSSxZQUFZLEtBQUs7QUFDckIsd0JBQUksWUFBWSxTQUFTO0FBQ3pCLHlCQUFLLFlBQVksR0FBRztBQUFBLGtCQUN0QixDQUFDO0FBRUQsNEJBQVUsYUFBYSxNQUFNLFVBQVUsVUFBVTtBQUFBLGdCQUNuRCxTQUFRLEdBQUc7QUFBQSxnQkFBQztBQUFBLGNBQ2QsQ0FBQztBQUFBLFlBQ0gsU0FBUSxHQUFHO0FBQUEsWUFBQztBQUFBLFVBQ2QsR0FBRztBQUdILG1CQUFTLGlCQUFpQixXQUFXLEVBQUUsUUFBUSxTQUFPO0FBQ3BELGdCQUFJLGlCQUFpQixTQUFTLE1BQU07QUFDbEMsMkJBQWE7QUFDYix5QkFBVztBQUFBLFlBQ2IsQ0FBQztBQUFBLFVBQ0gsQ0FBQztBQUVELG1CQUFTLGlCQUFpQixhQUFhLEVBQUUsUUFBUSxTQUFPO0FBQ3RELGdCQUFJLGlCQUFpQixTQUFTLE1BQU07QUFDbEMsMkJBQWE7QUFDYix5QkFBVztBQUFBLFlBQ2IsQ0FBQztBQUFBLFVBQ0gsQ0FBQztBQUVELG1CQUFTLGlCQUFpQixXQUFXLEVBQUUsUUFBUSxTQUFPO0FBQ3BELGdCQUFJLGlCQUFpQixTQUFTLE1BQU07QUFDbEMsMEJBQVk7QUFBQSxZQUNkLENBQUM7QUFBQSxVQUNILENBQUM7QUFFRCxtQkFBUyxpQkFBaUIsWUFBWSxFQUFFLFFBQVEsU0FBTztBQUNyRCxnQkFBSSxpQkFBaUIsU0FBUyxNQUFNO0FBQ2xDLDBCQUFZO0FBQUEsWUFDZCxDQUFDO0FBQUEsVUFDSCxDQUFDO0FBRUQsbUJBQVMsaUJBQWlCLFlBQVksRUFBRSxRQUFRLFNBQU87QUFDckQsZ0JBQUksaUJBQWlCLFNBQVMsQ0FBQyxNQUFNO0FBQ25DLG9CQUFNLFFBQVEsU0FBUyxFQUFFLE9BQU8sYUFBYSxhQUFhLEdBQUcsRUFBRTtBQUMvRCwrQkFBaUIsS0FBSztBQUFBLFlBQ3hCLENBQUM7QUFBQSxVQUNILENBQUM7QUFFRCxtQkFBUyxpQkFBaUIsY0FBYyxFQUFFLFFBQVEsU0FBTztBQUN2RCxnQkFBSSxpQkFBaUIsU0FBUyxNQUFNO0FBQ2xDLDJCQUFhO0FBQ2IseUJBQVc7QUFBQSxZQUNiLENBQUM7QUFBQSxVQUNILENBQUM7QUFHRCxjQUFJLFVBQVUsU0FBUyxlQUFlLHNCQUFzQjtBQUM1RCxjQUFJLFNBQVM7QUFDWCxvQkFBUSxVQUFVLFdBQVc7QUFDM0Isa0JBQUksWUFBWSxTQUFTLGVBQWUsc0JBQXNCO0FBQzlELGtCQUFJLENBQUMsVUFBVztBQUNoQixrQkFBSSxTQUFTO0FBQUEsZ0JBQ1gsRUFBRSxLQUFLLE9BQU8sT0FBTyxNQUFNO0FBQUEsZ0JBQzNCLEVBQUUsS0FBSyxVQUFVLE9BQU8sU0FBUztBQUFBLGdCQUNqQyxFQUFFLEtBQUssT0FBTyxPQUFPLE1BQU07QUFBQSxnQkFDM0IsRUFBRSxLQUFLLE9BQU8sT0FBTyxjQUFjO0FBQUEsZ0JBQ25DLEVBQUUsS0FBSyxTQUFTLE9BQU8sWUFBWTtBQUFBLGdCQUNuQyxFQUFFLEtBQUssbUJBQW1CLE9BQU8sV0FBVztBQUFBLGdCQUM1QyxFQUFFLEtBQUssOEJBQThCLE9BQU8sYUFBYTtBQUFBLGNBQzNEO0FBQ0Esd0JBQVUsWUFBWTtBQUN0Qix1QkFBUyxJQUFJLEdBQUcsSUFBSSxPQUFPLFFBQVEsS0FBSztBQUN0QyxvQkFBSSxNQUFNLFNBQVMsY0FBYyxLQUFLO0FBQ3RDLG9CQUFJLE1BQU0sVUFBVTtBQUNwQixvQkFBSSxNQUFNLFNBQVMsY0FBYyxPQUFPO0FBQ3hDLG9CQUFJLE1BQU0sVUFBVTtBQUNwQixvQkFBSSxjQUFjLE9BQU8sQ0FBQyxFQUFFO0FBQzVCLG9CQUFJLE1BQU0sU0FBUyxjQUFjLE9BQU87QUFDeEMsb0JBQUksT0FBTztBQUNYLG9CQUFJLFFBQVEsUUFBUSxPQUFPLENBQUMsRUFBRTtBQUM5QixvQkFBSSxRQUFRLFNBQVMsTUFBTSxPQUFPLENBQUMsRUFBRSxHQUFHLEtBQUs7QUFDN0Msb0JBQUksTUFBTSxVQUFVO0FBQ3BCLG9CQUFJLFlBQVksR0FBRztBQUNuQixvQkFBSSxZQUFZLEdBQUc7QUFDbkIsMEJBQVUsWUFBWSxHQUFHO0FBQUEsY0FDM0I7QUFDQSxrQkFBSSxTQUFTLFNBQVMsY0FBYyxLQUFLO0FBQ3pDLHFCQUFPLE1BQU0sVUFBVTtBQUN2QixrQkFBSSxVQUFVLFNBQVMsY0FBYyxRQUFRO0FBQzdDLHNCQUFRLGNBQWM7QUFDdEIsc0JBQVEsTUFBTSxVQUFVO0FBQ3hCLHNCQUFRLFVBQVUsaUJBQWlCO0FBQ2pDLG9CQUFJLFNBQVMsVUFBVSxpQkFBaUIsbUJBQW1CO0FBQzNELG9CQUFJLFdBQVcsTUFBTSxtQkFBbUIsS0FBSyxDQUFDO0FBQzlDLG9CQUFJLENBQUMsU0FBUyxRQUFTLFVBQVMsVUFBVSxDQUFDO0FBQzNDLHlCQUFTLElBQUksR0FBRyxJQUFJLE9BQU8sUUFBUSxLQUFLO0FBQ3RDLHNCQUFJLE1BQU0sT0FBTyxDQUFDLEVBQUUsUUFBUTtBQUM1QiwyQkFBUyxTQUFTLFNBQVMsS0FBSyxPQUFPLENBQUMsRUFBRSxLQUFLO0FBQUEsZ0JBQ2pEO0FBQ0EseUJBQVMsUUFBUSxZQUFZLEtBQUssSUFBSTtBQUN0QyxzQkFBTSxvQkFBb0IsUUFBUTtBQUNsQyx5QkFBUyxPQUFPO0FBQUEsY0FDbEI7QUFDQSxrQkFBSSxZQUFZLFNBQVMsY0FBYyxRQUFRO0FBQy9DLHdCQUFVLGNBQWM7QUFDeEIsd0JBQVUsTUFBTSxVQUFVO0FBQzFCLHdCQUFVLFVBQVUsV0FBVztBQUFFLHlCQUFTLE9BQU87QUFBQSxjQUFHO0FBQ3BELHFCQUFPLFlBQVksU0FBUztBQUM1QixxQkFBTyxZQUFZLE9BQU87QUFDMUIsd0JBQVUsWUFBWSxNQUFNO0FBQUEsWUFDOUI7QUFBQSxVQUNGO0FBQUEsUUFDSjtBQUVBLHVCQUFlLGNBQWM7QUFDM0IsZ0JBQU0sU0FBUyxTQUFTLGlCQUFpQixhQUFhO0FBQ3RELGNBQUksUUFBUSxNQUFNLG1CQUFtQjtBQUNyQyxjQUFJLENBQUMsTUFBTyxTQUFRLENBQUM7QUFFckIsY0FBSSxNQUFNLFNBQVM7QUFDakIsa0JBQU0sY0FBYyxLQUFLLE1BQU0sS0FBSyxVQUFVLE1BQU0sT0FBTyxDQUFDO0FBRTVELG1CQUFPLFFBQVEsV0FBUztBQUN0QixvQkFBTSxPQUFPLE1BQU0sYUFBYSxZQUFZO0FBQzVDLGtCQUFJLE1BQU07QUFDUix5QkFBUyxhQUFhLE1BQU0sTUFBTSxLQUFLO0FBQ3ZDO0FBQUEsY0FDRjtBQUVBLG9CQUFNLFFBQVEsTUFBTSxhQUFhLGFBQWE7QUFDOUMsb0JBQU0sVUFBVSxNQUFNLGFBQWEsZUFBZTtBQUNsRCxvQkFBTSxXQUFXLE1BQU0sYUFBYSxnQkFBZ0I7QUFDcEQsa0JBQUksVUFBVSxRQUFRLFlBQVksUUFBUSxZQUFZLFlBQVksYUFBYTtBQUM3RSxvQkFBSSxLQUFLLFNBQVMsT0FBTyxFQUFFO0FBQzNCLG9CQUFJLEtBQUssU0FBUyxTQUFTLEVBQUU7QUFDN0Isb0JBQUksWUFBWSxZQUFZLEVBQUUsS0FBSyxZQUFZLFlBQVksRUFBRSxFQUFFLE9BQU8sRUFBRSxHQUFHO0FBQ3pFLHNCQUFJLE1BQU0sTUFBTTtBQUNoQixzQkFBSSxDQUFDLFlBQVksVUFBVSxXQUFXLE1BQU0sT0FBTyxLQUFLLEVBQUUsUUFBUSxRQUFRLE1BQU0sSUFBSTtBQUNsRiwwQkFBTSxXQUFXLElBQUksUUFBUSxLQUFLLEdBQUcsQ0FBQyxLQUFLO0FBQUEsa0JBQzdDO0FBQ0EsOEJBQVksWUFBWSxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUUsUUFBUSxJQUFJO0FBQUEsZ0JBQ3JEO0FBQUEsY0FDRjtBQUFBLFlBQ0YsQ0FBQztBQUVELHdCQUFZLFlBQVksS0FBSyxJQUFJO0FBRWpDLGtCQUFNLG9CQUFvQixFQUFFLFNBQVMsWUFBWSxDQUFDO0FBQ2xELHlCQUFhO0FBQ2IsdUJBQVc7QUFBQSxVQUNiO0FBQUEsUUFDRjtBQUVBLHVCQUFlLGNBQWM7QUFDM0IsZ0JBQU0sb0JBQW9CLENBQUMsQ0FBQztBQUM1Qix1QkFBYTtBQUNiLHFCQUFXO0FBQUEsUUFDYjtBQUVBLHVCQUFlLGlCQUFpQixPQUFPO0FBQ3JDLGNBQUksUUFBUSxNQUFNLG1CQUFtQjtBQUNyQyxjQUFJLENBQUMsTUFBTyxTQUFRLENBQUM7QUFDckIsY0FBSSxNQUFNLFdBQVcsTUFBTSxRQUFRLGFBQWE7QUFDOUMsa0JBQU0sUUFBUSxZQUFZLE9BQU8sT0FBTyxDQUFDO0FBQ3pDLGtCQUFNLFFBQVEsWUFBWSxLQUFLLElBQUk7QUFDbkMsa0JBQU0sb0JBQW9CLEtBQUs7QUFDL0IsdUJBQVc7QUFBQSxVQUNiO0FBQUEsUUFDRjtBQUVBLHVCQUFlLHNCQUFzQjtBQUNuQyxnQkFBTUEsYUFBWSxTQUFTLGVBQWUsWUFBWTtBQUN0RCxjQUFJO0FBQ0Ysa0JBQU0sT0FBTyxNQUFNLFVBQVUsVUFBVSxTQUFTO0FBQ2hELGtCQUFNLE9BQU8sS0FBSyxNQUFNLElBQUk7QUFDNUIsZ0JBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQyxLQUFLLEdBQUc7QUFDdEIsa0JBQUlBLFlBQVc7QUFBRSxnQkFBQUEsV0FBVSxZQUFZO0FBQXdCLDJCQUFXLE1BQU07QUFBRSxrQkFBQUEsV0FBVSxZQUFZO0FBQUEsZ0JBQTJCLEdBQUcsR0FBSTtBQUFBLGNBQUc7QUFDN0k7QUFBQSxZQUNGO0FBRUEsa0JBQU0sSUFBSSxLQUFLLEtBQUssQ0FBQztBQUNyQixrQkFBTSxJQUFJLEtBQUssS0FBSyxDQUFDO0FBRXJCLGtCQUFNLG9CQUFvQjtBQUFBLGNBQ3hCLFNBQVM7QUFBQSxnQkFDUCxHQUFHO0FBQUEsZ0JBQ0gsWUFBWSxLQUFLLENBQUM7QUFBQSxnQkFDbEIsV0FBVyxLQUFLLElBQUk7QUFBQSxjQUN0QjtBQUFBLFlBQ0YsQ0FBQztBQUVELGdCQUFJQSxZQUFXO0FBQUUsY0FBQUEsV0FBVSxZQUFZO0FBQWtCLHlCQUFXLE1BQU07QUFBRSxnQkFBQUEsV0FBVSxZQUFZO0FBQUEsY0FBMkIsR0FBRyxHQUFJO0FBQUEsWUFBRztBQUN2SSx1QkFBVztBQUFBLFVBQ2IsU0FBUSxHQUFHO0FBQ1QsZ0JBQUlBLFlBQVc7QUFBRSxjQUFBQSxXQUFVLFlBQVk7QUFBVSx5QkFBVyxNQUFNO0FBQUUsZ0JBQUFBLFdBQVUsWUFBWTtBQUFBLGNBQTJCLEdBQUcsR0FBSTtBQUFBLFlBQUc7QUFBQSxVQUNqSTtBQUFBLFFBQ0Y7QUFHQSxjQUFNLFlBQVksU0FBUyxjQUFjLFFBQVE7QUFDakQsa0JBQVUsS0FBSztBQUNmLGtCQUFVLFlBQVk7QUFDdEIsa0JBQVUsTUFBTSxVQUFVO0FBQzFCLGtCQUFVLGlCQUFpQixTQUFTLG1CQUFtQjtBQUN2RCxzQkFBYyxjQUFjLGFBQWEsV0FBVyxhQUFhO0FBR2pFLFlBQUksa0JBQWtCLFNBQVMsY0FBYyxLQUFLO0FBQ2xELHdCQUFnQixNQUFNLFVBQVU7QUFFaEMsWUFBSSxnQkFBZ0IsU0FBUyxjQUFjLEtBQUs7QUFDaEQsc0JBQWMsTUFBTSxVQUFVO0FBQzlCLHNCQUFjLGNBQWM7QUFFNUIsWUFBSSxZQUFZLFNBQVMsY0FBYyxRQUFRO0FBQy9DLGtCQUFVLEtBQUs7QUFDZixrQkFBVSxjQUFjO0FBQ3hCLGtCQUFVLE1BQU0sVUFBVTtBQUUxQixZQUFJLFVBQVUsU0FBUyxjQUFjLFFBQVE7QUFDN0MsZ0JBQVEsS0FBSztBQUNiLGdCQUFRLGNBQWM7QUFDdEIsZ0JBQVEsTUFBTSxVQUFVO0FBRXhCLFlBQUksaUJBQWlCLFNBQVMsY0FBYyxLQUFLO0FBQ2pELHVCQUFlLEtBQUs7QUFDcEIsdUJBQWUsTUFBTSxVQUFVO0FBRS9CLGtCQUFVLGlCQUFpQixTQUFTLFdBQVc7QUFDN0MsaUJBQU8sS0FBSyxNQUFNLEVBQUUsUUFBUSxNQUFNLGVBQWUsS0FBSyxHQUFHLFNBQVMsTUFBTTtBQUN0RSxnQkFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLENBQUMsRUFBRSxJQUFJO0FBQ3pCLHFCQUFPLEtBQUssWUFBWSxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUN0RSx3QkFBVSxNQUFNLFVBQVU7QUFDMUIsc0JBQVEsTUFBTSxVQUFVO0FBQ3hCLDZCQUFlLGNBQWM7QUFBQSxZQUMvQjtBQUFBLFVBQ0YsQ0FBQztBQUFBLFFBQ0gsQ0FBQztBQUVELGdCQUFRLGlCQUFpQixTQUFTLFdBQVc7QUFDM0MsaUJBQU8sS0FBSyxNQUFNLEVBQUUsUUFBUSxNQUFNLGVBQWUsS0FBSyxHQUFHLFNBQVMsTUFBTTtBQUN0RSxnQkFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLENBQUMsRUFBRSxJQUFJO0FBQ3pCLHFCQUFPLEtBQUssWUFBWSxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNyRSx3QkFBVSxNQUFNLFVBQVU7QUFDMUIsc0JBQVEsTUFBTSxVQUFVO0FBQ3hCLDZCQUFlLGNBQWM7QUFBQSxZQUMvQjtBQUFBLFVBQ0YsQ0FBQztBQUFBLFFBQ0gsQ0FBQztBQUVELHdCQUFnQixZQUFZLGFBQWE7QUFDekMsd0JBQWdCLFlBQVksU0FBUztBQUNyQyx3QkFBZ0IsWUFBWSxPQUFPO0FBQ25DLHdCQUFnQixZQUFZLGNBQWM7QUFDMUMsc0JBQWMsY0FBYyxhQUFhLGlCQUFpQixhQUFhO0FBR3ZFLGVBQU8sUUFBUSxNQUFNLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxTQUFTLFFBQVE7QUFDOUQsY0FBSSxRQUFRLE9BQU87QUFDbkIsY0FBSSxTQUFTLE1BQU0sUUFBUTtBQUN6QixzQkFBVSxNQUFNLFVBQVU7QUFDMUIsb0JBQVEsTUFBTSxVQUFVO0FBQ3hCLDJCQUFlLGNBQWMsNkJBQW1CLE1BQU0sU0FBUyxNQUFNLE9BQU8sU0FBUyxLQUFLO0FBQUEsVUFDNUY7QUFBQSxRQUNGLENBQUM7QUFHRCxtQkFBVztBQUdYLGVBQU8sUUFBUSxVQUFVLFlBQVksU0FBUyxTQUFTLE1BQU07QUFDM0QsY0FBSSxTQUFTLFdBQVcsUUFBUSxlQUFlO0FBQzdDLHVCQUFXO0FBQUEsVUFDYjtBQUFBLFFBQ0YsQ0FBQztBQUdELGNBQU0saUJBQWlCLFNBQVMsZUFBZSxnQkFBZ0I7QUFDL0QsY0FBTSxjQUFjLFNBQVMsZUFBZSxjQUFjO0FBQzFELGNBQU0sY0FBYyxTQUFTLGVBQWUsY0FBYztBQUUxRCxpQkFBUyxlQUFlLFNBQVM7QUFDL0IsY0FBSSxDQUFDLGtCQUFrQixDQUFDLGVBQWUsQ0FBQyxZQUFhO0FBQ3JELHlCQUFlLFVBQVU7QUFDekIsc0JBQVksTUFBTSxhQUFhLFVBQVUsWUFBWTtBQUNyRCxzQkFBWSxNQUFNLFlBQVksVUFBVSxxQkFBcUI7QUFBQSxRQUMvRDtBQUVBLGVBQU8sUUFBUSxNQUFNLElBQUksQ0FBQyx5QkFBeUIsR0FBRyxDQUFDLFdBQVc7QUFDaEUsZ0JBQU0sVUFBVSxPQUFPLDRCQUE0QjtBQUNuRCx5QkFBZSxPQUFPO0FBQUEsUUFDeEIsQ0FBQztBQUVELFlBQUksZ0JBQWdCO0FBQ2xCLHlCQUFlLGlCQUFpQixVQUFVLE1BQU07QUFDOUMsa0JBQU0sVUFBVSxlQUFlO0FBQy9CLG1CQUFPLFFBQVEsTUFBTSxJQUFJLEVBQUUseUJBQXlCLFFBQVEsQ0FBQztBQUM3RCwyQkFBZSxPQUFPO0FBRXRCLG1CQUFPLEtBQUssTUFBTSxFQUFFLFFBQVEsTUFBTSxlQUFlLEtBQUssR0FBRyxDQUFDLFNBQVM7QUFDakUsa0JBQUksS0FBSyxDQUFDLEdBQUcsSUFBSTtBQUNmLHVCQUFPLEtBQUssWUFBWSxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSwwQkFBMEIsUUFBUSxDQUFDO0FBQUEsY0FDakY7QUFBQSxZQUNGLENBQUM7QUFBQSxVQUNILENBQUM7QUFBQSxRQUNIO0FBR0EsY0FBTSxpQkFBaUIsU0FBUyxlQUFlLGlCQUFpQjtBQUNoRSxjQUFNLHNCQUFzQixTQUFTLGVBQWUsdUJBQXVCO0FBQzNFLGNBQU0sc0JBQXNCLFNBQVMsZUFBZSx1QkFBdUI7QUFFM0UsaUJBQVMsdUJBQXVCLFNBQVM7QUFDdkMsY0FBSSxDQUFDLGtCQUFrQixDQUFDLHVCQUF1QixDQUFDLG9CQUFxQjtBQUNyRSx5QkFBZSxVQUFVO0FBQ3pCLDhCQUFvQixNQUFNLGFBQWEsVUFBVSxZQUFZO0FBQzdELDhCQUFvQixNQUFNLFlBQVksVUFBVSxxQkFBcUI7QUFBQSxRQUN2RTtBQUVBLGVBQU8sUUFBUSxNQUFNLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLFdBQVc7QUFDekQsY0FBSSxXQUFXLE9BQU8sb0JBQW9CLENBQUM7QUFFM0MsY0FBSSxVQUFVLFNBQVMsbUJBQW1CO0FBQzFDLGlDQUF1QixPQUFPO0FBQUEsUUFDaEMsQ0FBQztBQUVELFlBQUksZ0JBQWdCO0FBQ2xCLHlCQUFlLGlCQUFpQixVQUFVLE1BQU07QUFDOUMsbUJBQU8sUUFBUSxNQUFNLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLFdBQVc7QUFDekQsa0JBQUksV0FBVyxPQUFPLG9CQUFvQixDQUFDO0FBQzNDLHVCQUFTLGlCQUFpQixlQUFlO0FBQ3pDLHFCQUFPLFFBQVEsTUFBTSxJQUFJLEVBQUUsa0JBQWtCLFNBQVMsQ0FBQztBQUN2RCxxQ0FBdUIsZUFBZSxPQUFPO0FBQUEsWUFDL0MsQ0FBQztBQUFBLFVBQ0gsQ0FBQztBQUFBLFFBQ0g7QUFHQSxjQUFNLGNBQWMsU0FBUyxlQUFlLGNBQWM7QUFDMUQsY0FBTSxtQkFBbUIsU0FBUyxlQUFlLG9CQUFvQjtBQUNyRSxjQUFNLG1CQUFtQixTQUFTLGVBQWUsb0JBQW9CO0FBRXJFLGlCQUFTLG9CQUFvQixTQUFTO0FBQ3BDLGNBQUksQ0FBQyxlQUFlLENBQUMsb0JBQW9CLENBQUMsaUJBQWtCO0FBQzVELHNCQUFZLFVBQVU7QUFDdEIsMkJBQWlCLE1BQU0sYUFBYSxVQUFVLFlBQVk7QUFDMUQsMkJBQWlCLE1BQU0sWUFBWSxVQUFVLHFCQUFxQjtBQUFBLFFBQ3BFO0FBRUEsZUFBTyxRQUFRLE1BQU0sSUFBSSxDQUFDLHVCQUF1QixHQUFHLENBQUMsV0FBVztBQUM5RCxnQkFBTSxVQUFVLE9BQU8sMEJBQTBCO0FBQ2pELDhCQUFvQixPQUFPO0FBQUEsUUFDN0IsQ0FBQztBQUVELFlBQUksYUFBYTtBQUNmLHNCQUFZLGlCQUFpQixVQUFVLE1BQU07QUFDM0Msa0JBQU0sVUFBVSxZQUFZO0FBRTVCLG1CQUFPLFFBQVEsTUFBTSxJQUFJO0FBQUEsY0FDdkIsdUJBQXVCO0FBQUEsY0FDdkIsdUJBQXVCO0FBQUEsWUFDekIsQ0FBQztBQUNELGdDQUFvQixPQUFPO0FBQUEsVUFDN0IsQ0FBQztBQUFBLFFBQ0g7QUFHQSxjQUFNLGdCQUFnQixTQUFTLGVBQWUsZ0JBQWdCO0FBQzlELGNBQU0scUJBQXFCLFNBQVMsZUFBZSxzQkFBc0I7QUFDekUsY0FBTSxxQkFBcUIsU0FBUyxlQUFlLHNCQUFzQjtBQUV6RSxpQkFBUyxzQkFBc0IsU0FBUztBQUN0QyxjQUFJLENBQUMsaUJBQWlCLENBQUMsc0JBQXNCLENBQUMsbUJBQW9CO0FBQ2xFLHdCQUFjLFVBQVU7QUFDeEIsNkJBQW1CLE1BQU0sYUFBYSxVQUFVLFlBQVk7QUFDNUQsNkJBQW1CLE1BQU0sWUFBWSxVQUFVLHFCQUFxQjtBQUFBLFFBQ3RFO0FBRUEsZUFBTyxRQUFRLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsV0FBVztBQUN6RCxjQUFJLFdBQVcsT0FBTyxvQkFBb0IsQ0FBQztBQUMzQyxnQ0FBc0IsU0FBUyxxQkFBcUIsS0FBSztBQUFBLFFBQzNELENBQUM7QUFFRCxZQUFJLGVBQWU7QUFDakIsd0JBQWMsaUJBQWlCLFVBQVUsTUFBTTtBQUM3QyxtQkFBTyxRQUFRLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsV0FBVztBQUN6RCxrQkFBSSxXQUFXLE9BQU8sb0JBQW9CLENBQUM7QUFDM0MsdUJBQVMsb0JBQW9CLGNBQWM7QUFDM0MscUJBQU8sUUFBUSxNQUFNLElBQUksRUFBRSxrQkFBa0IsU0FBUyxDQUFDO0FBQ3ZELG9DQUFzQixjQUFjLE9BQU87QUFBQSxZQUM3QyxDQUFDO0FBQUEsVUFDSCxDQUFDO0FBQUEsUUFDSDtBQUdBLGlCQUFTLGdCQUFnQjtBQUN2QixjQUFJLE9BQU8sU0FBUyxlQUFlLGlCQUFpQjtBQUNwRCxjQUFJLE9BQU8sU0FBUyxlQUFlLGlCQUFpQjtBQUNwRCxjQUFJLENBQUMsUUFBUSxDQUFDLEtBQU07QUFFcEIsaUJBQU8sUUFBUSxNQUFNLElBQUksQ0FBQyxzQkFBc0IsY0FBYyxHQUFHLFNBQVMsUUFBUTtBQUNoRixnQkFBSSxPQUFPLE9BQU8sZ0JBQWdCLENBQUM7QUFDbkMsZ0JBQUksQ0FBQyxLQUFLLFdBQVc7QUFBRSxtQkFBSyxNQUFNLFVBQVU7QUFBUTtBQUFBLFlBQVE7QUFFNUQsaUJBQUssTUFBTSxVQUFVO0FBR3JCLGtCQUFNLDhDQUE4QztBQUFBLGNBQ2xELFNBQVMsRUFBRSxpQkFBaUIsWUFBWSxLQUFLLFVBQVU7QUFBQSxZQUN6RCxDQUFDLEVBQ0EsS0FBSyxTQUFTLEdBQUc7QUFBRSxxQkFBTyxFQUFFLEtBQUs7QUFBQSxZQUFHLENBQUMsRUFDckMsS0FBSyxTQUFTLE1BQU07QUFDbkIsa0JBQUksV0FBVyxLQUFLLFlBQVksQ0FBQztBQUNqQyxrQkFBSSxTQUFTLFdBQVcsR0FBRztBQUN6QixxQkFBSyxjQUFjO0FBQ25CO0FBQUEsY0FDRjtBQUNBLG1CQUFLLFlBQVk7QUFDakIsa0JBQUksY0FBYyxFQUFFLFVBQVUsVUFBVSxTQUFTLFVBQVUsVUFBVSxTQUFTO0FBQzlFLGtCQUFJLGVBQWUsRUFBRSxVQUFVLFdBQVcsU0FBUyxXQUFXLFVBQVUsVUFBVTtBQUNsRix1QkFBUyxJQUFJLEdBQUcsSUFBSSxTQUFTLFVBQVUsSUFBSSxJQUFJLEtBQUs7QUFDbEQsb0JBQUksSUFBSSxTQUFTLENBQUM7QUFDbEIsb0JBQUksTUFBTSxTQUFTLGNBQWMsS0FBSztBQUN0QyxvQkFBSSxNQUFNLFVBQVU7QUFDcEIsb0JBQUksWUFBWSxXQUFXLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxhQUFhLElBQUksRUFBRSxhQUFhLEVBQUUsRUFBRSxVQUFVLEdBQUcsRUFBRSxJQUFJLGlHQUVqRSxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksZ0NBQ2pDLGFBQWEsRUFBRSxNQUFNLEtBQUssYUFBYSx3Q0FBd0MsWUFBWSxFQUFFLE1BQU0sS0FBSyxPQUFPLE1BQU0sSUFBSSxFQUFFLFVBQVUsU0FBUyxJQUFJO0FBRTdLLHFCQUFLLFlBQVksR0FBRztBQUFBLGNBQ3RCO0FBRUEscUJBQU8sUUFBUSxNQUFNLElBQUksRUFBRSxvQkFBb0IsRUFBRSxVQUFvQixJQUFJLEtBQUssSUFBSSxFQUFFLEVBQUUsQ0FBQztBQUFBLFlBQ3pGLENBQUMsRUFDQSxNQUFNLFNBQVMsS0FBSztBQUVuQixrQkFBSSxTQUFTLE9BQU87QUFDcEIsa0JBQUksVUFBVSxPQUFPLFVBQVU7QUFDN0IscUJBQUssY0FBYyxPQUFPLFNBQVMsU0FBUztBQUFBLGNBQzlDLE9BQU87QUFDTCxxQkFBSyxjQUFjO0FBQUEsY0FDckI7QUFDQSxzQkFBUSxLQUFLLHNDQUFzQyxHQUFHO0FBQUEsWUFDeEQsQ0FBQztBQUFBLFVBQ0gsQ0FBQztBQUFBLFFBQ0g7QUFFQSxZQUFJLGVBQWUsU0FBUyxlQUFlLGdCQUFnQjtBQUMzRCxZQUFJLGFBQWMsY0FBYSxVQUFVO0FBQ3pDLHNCQUFjO0FBR2QsaUJBQVMsdUJBQXVCO0FBQzlCLGNBQUksT0FBTyxTQUFTLGVBQWUsaUJBQWlCO0FBQ3BELGNBQUksT0FBTyxTQUFTLGVBQWUsb0JBQW9CO0FBQ3ZELGNBQUksYUFBYSxTQUFTLGVBQWUsYUFBYTtBQUN0RCxjQUFJLENBQUMsUUFBUSxDQUFDLEtBQU07QUFFcEIsaUJBQU8sUUFBUSxNQUFNLElBQUksQ0FBQyxjQUFjLEdBQUcsU0FBUyxRQUFRO0FBQzFELGdCQUFJLE9BQU8sT0FBTyxnQkFBZ0IsQ0FBQztBQUNuQyxnQkFBSSxDQUFDLEtBQUssVUFBVztBQUVyQixrQkFBTSwrQ0FBK0M7QUFBQSxjQUNuRCxTQUFTLEVBQUUsaUJBQWlCLFlBQVksS0FBSyxVQUFVO0FBQUEsWUFDekQsQ0FBQyxFQUNBLEtBQUssU0FBUyxHQUFHO0FBQUUscUJBQU8sRUFBRSxLQUFLO0FBQUEsWUFBRyxDQUFDLEVBQ3JDLEtBQUssU0FBUyxNQUFNO0FBQ25CLGtCQUFJLGFBQWEsS0FBSyxjQUFjLENBQUM7QUFDckMsa0JBQUksV0FBVyxXQUFXLEdBQUc7QUFBRSxxQkFBSyxNQUFNLFVBQVU7QUFBUTtBQUFBLGNBQVE7QUFFcEUsbUJBQUssTUFBTSxVQUFVO0FBQ3JCLGtCQUFJLFdBQVksWUFBVyxjQUFjLFdBQVcsU0FBUztBQUM3RCxtQkFBSyxZQUFZO0FBRWpCLHVCQUFTLElBQUksR0FBRyxJQUFJLFdBQVcsVUFBVSxJQUFJLEdBQUcsS0FBSztBQUNuRCxvQkFBSSxJQUFJLFdBQVcsQ0FBQztBQUNwQixvQkFBSSxPQUFPLFNBQVMsY0FBYyxLQUFLO0FBQ3ZDLHFCQUFLLE1BQU0sVUFBVTtBQUVyQixvQkFBSSxTQUFTLFNBQVMsY0FBYyxLQUFLO0FBQ3pDLHVCQUFPLE1BQU0sVUFBVTtBQUN2Qix1QkFBTyxjQUFjLElBQUksRUFBRSxXQUFXLFNBQVMsSUFBSSxhQUFhLElBQUksRUFBRSxRQUFRLEVBQUU7QUFDaEYscUJBQUssWUFBWSxNQUFNO0FBRXZCLG9CQUFJLEVBQUUsUUFBUTtBQUNaLHNCQUFJLFNBQVMsU0FBUyxjQUFjLEtBQUs7QUFDekMseUJBQU8sTUFBTSxVQUFVO0FBQ3ZCLHlCQUFPLGNBQWMsY0FBYyxJQUFJLEVBQUUsTUFBTTtBQUMvQyx1QkFBSyxZQUFZLE1BQU07QUFBQSxnQkFDekI7QUFFQSxvQkFBSSxFQUFFLFlBQVk7QUFDaEIsc0JBQUksT0FBTyxTQUFTLGNBQWMsS0FBSztBQUN2Qyx1QkFBSyxNQUFNLFVBQVU7QUFDckIsdUJBQUssY0FBYyxjQUFjLElBQUksRUFBRSxVQUFVO0FBQ2pELHVCQUFLLFlBQVksSUFBSTtBQUFBLGdCQUN2QjtBQUVBLHFCQUFLLFlBQVksSUFBSTtBQUFBLGNBQ3ZCO0FBQUEsWUFDRixDQUFDLEVBQ0EsTUFBTSxTQUFTLEtBQUs7QUFBRSxzQkFBUSxLQUFLLDZDQUE2QyxHQUFHO0FBQUEsWUFBRyxDQUFDO0FBQUEsVUFDMUYsQ0FBQztBQUFBLFFBQ0g7QUFFQSw2QkFBcUI7QUFHckIsaUJBQVMsa0JBQWtCLE1BQU07QUFDL0IsY0FBSSxPQUFPLFNBQVMsZUFBZSxXQUFXO0FBQzlDLGNBQUksUUFBUSxTQUFTLGVBQWUsWUFBWTtBQUNoRCxjQUFJLENBQUMsUUFBUSxDQUFDLE1BQU87QUFDckIsY0FBSSxTQUFTLFlBQVksU0FBUyxTQUFVO0FBRTVDLGVBQUssTUFBTSxVQUFVO0FBRXJCLGlCQUFPLFFBQVEsTUFBTSxJQUFJLENBQUMsY0FBYyxHQUFHLFNBQVMsUUFBUTtBQUMxRCxnQkFBSSxPQUFPLE9BQU8sZ0JBQWdCLENBQUM7QUFDbkMsZ0JBQUksQ0FBQyxLQUFLLFVBQVc7QUFFckIsa0JBQU0sa0RBQWtEO0FBQUEsY0FDdEQsU0FBUyxFQUFFLGlCQUFpQixZQUFZLEtBQUssVUFBVTtBQUFBLFlBQ3pELENBQUMsRUFDQSxLQUFLLFNBQVMsR0FBRztBQUFFLHFCQUFPLEVBQUUsS0FBSztBQUFBLFlBQUcsQ0FBQyxFQUNyQyxLQUFLLFNBQVMsTUFBTTtBQUNuQixrQkFBSSxXQUFXLEtBQUssWUFBWSxDQUFDO0FBQ2pDLG9CQUFNLFlBQ0osa05BQ2lKLElBQUksT0FBTyxTQUFTLGNBQWMsQ0FBQyxDQUFDLElBQUksK05BQ3hDLElBQUksT0FBTyxTQUFTLGdCQUFnQixDQUFDLENBQUMsSUFBSSxvTkFDMUMsSUFBSSxPQUFPLFNBQVMsa0JBQWtCLFFBQVEsQ0FBQyxJQUFJLDhOQUNuRCxJQUFJLE9BQU8sU0FBUyxpQkFBaUIsQ0FBQyxDQUFDLElBQUk7QUFBQSxZQUVoTSxDQUFDLEVBQ0EsTUFBTSxTQUFTLEtBQUs7QUFDbkIsb0JBQU0sY0FBYztBQUNwQixzQkFBUSxLQUFLLDBDQUEwQyxHQUFHO0FBQUEsWUFDNUQsQ0FBQztBQUFBLFVBQ0gsQ0FBQztBQUFBLFFBQ0g7QUFFQSwwQkFBa0IsV0FBVztBQUFBLE1BRTdCO0FBQUEsSUFDQTtBQUFBLEVBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFsiaW1wb3J0QnRuIl0KfQo=
