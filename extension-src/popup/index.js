/* ── Feature Flags — V1 pilot ──────────────────────────────────────────── */
const FEATURES = {
  smartFill: true,
  remoteConfig: true
};

/* ── Collapsible sections + toggle init (moved from inline script for CSP) ── */
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.collapsible-trigger').forEach(function(trigger) {
    trigger.addEventListener('click', function() {
      var contentId = this.id.replace('-trigger', '-content');
      var content = document.getElementById(contentId);
      if (!content) return;
      var isOpen = content.classList.contains('open');
      content.classList.toggle('open', !isOpen);
      this.classList.toggle('open', !isOpen);
    });
  });

  function initToggle(checkboxId, trackId, thumbId) {
    var cb = document.getElementById(checkboxId);
    var track = document.getElementById(trackId);
    var thumb = document.getElementById(thumbId);
    if (!cb || !track || !thumb) return;
    function update() {
      track.style.background = cb.checked ? '#2563eb' : '#d1d5db';
      thumb.style.transform = cb.checked ? 'translateX(18px)' : 'translateX(0)';
    }
    cb.addEventListener('change', update);
    update();
  }
  initToggle('toggle-buttons', 'toggle-track', 'toggle-thumb');
  initToggle('toggle-autofill', 'toggle-autofill-track', 'toggle-autofill-thumb');
  initToggle('toggle-rejet', 'toggle-rejet-track', 'toggle-rejet-thumb');
  initToggle('toggle-preview', 'toggle-preview-track', 'toggle-preview-thumb');
});

document.addEventListener('DOMContentLoaded', () => {
  const dataContainer = document.getElementById('data-container');
  let editingKey = null;

  /* Echapper les valeurs patient avant injection dans innerHTML — anti-XSS */
  function esc(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  const PLAN_LABELS = { FREE: 'Free', ESSENTIEL: 'Essentiel', PRO: 'Pro', EQUIPE: 'Equipe' };
  const INACTIVITY_MINUTES = 15;

  /* ── Lock d'inactivite ─────────────────────────────── */
  function renewLock() {
    chrome.storage.local.set({ audibot_lock: { lockAt: Date.now() + INACTIVITY_MINUTES * 60 * 1000 } });
    /* Renouveler l'alarme dans le background */
    chrome.runtime.sendMessage({ type: 'AUDIBOT_RENEW_LOCK' });
  }
  document.addEventListener('click', renewLock);
  document.addEventListener('keydown', renewLock);

  function showLocked(message) {
    var body = document.body.querySelector('.container');
    if (!body) body = document.body;
    body.innerHTML = '<div style="padding: 20px; text-align: center;">'
      + '<div style="font-size: 32px; margin-bottom: 12px;">&#128274;</div>'
      + '<p style="font-weight: bold;">Session verrouill\u00e9e</p>'
      + '<p style="font-size: 12px; color: #6b7280;">' + (message || '15 minutes d\'inactivit\u00e9') + '</p>'
      + '<button id="unlock-btn" style="margin-top: 12px; padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">'
      + 'D\u00e9verrouiller</button></div>';
    var btn = document.getElementById('unlock-btn');
    if (btn) btn.addEventListener('click', attemptUnlock);
  }

  function showBlockedGlobal(error) {
    var container = document.body.querySelector('.container');
    if (!container) container = document.body;
    container.innerHTML = '<div style="padding: 20px; text-align: center;">'
      + '<div style="font-size: 32px; margin-bottom: 12px;">&#128274;</div>'
      + '<p style="font-weight: bold; color: #dc2626; margin: 0 0 8px 0;">Compte requis</p>'
      + '<p style="font-size: 12px; color: #6b7280; margin-bottom: 16px;">' + error + '</p>'
      + '<a href="https://audibot.fr/dashboard" target="_blank" style="display:inline-block; padding: 10px 20px; background: #2563eb; color: white; border-radius: 8px; font-weight: bold; text-decoration: none; font-size: 13px;">'
      + 'Ouvrir AudiBot &rarr;</a></div>';
  }

  function attemptUnlock() {
    chrome.storage.local.get(['audibot_auth'], function(result) {
      var auth = result.audibot_auth || {};
      var token = auth.syncToken;
      if (!token) {
        showBlockedGlobal("Connectez-vous sur audibot.fr pour utiliser l'extension.");
        return;
      }
      fetch('https://audibot.fr/api/extension/verify', { headers: { "Authorization": "Bearer " + token } })
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data.ok) {
            renewLock();
            location.reload();
          } else {
            showBlockedGlobal(data.error || "Impossible de v\u00e9rifier votre compte.");
          }
        })
        .catch(function() {
          showBlockedGlobal("Impossible de v\u00e9rifier votre compte (r\u00e9seau).");
        });
    });
  }

  /* ── Verifier le lock AVANT tout ─────────────────── */
  chrome.storage.local.get(['audibot_lock'], function(result) {
    var lockData = result.audibot_lock || {};
    var lockAt = lockData.lockAt || 0;
    if (lockAt > 0 && Date.now() > lockAt) {
      showLocked("Session verrouill\u00e9e apr\u00e8s inactivit\u00e9.");
      return;
    }
    /* Lock OK — continuer le chargement normal */
    renewLock();
    startPopup();
  });

  function startPopup() {

  async function verifyAccount() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['audibot_auth'], (result) => {
        const auth = result.audibot_auth || {};
        const token = auth.syncToken || null;
        const expiresAt = auth.authExpiresAt || 0;

        if (!token) {
          resolve({ ok: false, error: "Connectez-vous sur audibot.fr pour utiliser l'extension." });
          return;
        }

        /* Verifier expiration locale (20h) avant d'appeler l'API */
        if (expiresAt && Date.now() > expiresAt) {
          resolve({ ok: false, error: "Session expir\u00e9e. Ouvrez audibot.fr pour continuer." });
          return;
        }

        fetch('https://audibot.fr/api/extension/verify', { headers: { "Authorization": "Bearer " + token } })
          .then(function(r) { return r.json(); })
          .then(function(data) { resolve(data); })
          .catch(function() { resolve({ ok: false, error: "Impossible de v\u00e9rifier votre compte (r\u00e9seau)." }); });
      });
    });
  }

  function showBlocked(error) {
    var container = document.getElementById('data-container');
    container.parentElement.innerHTML = '<div style="padding: 20px; text-align: center;">'
      + '<div style="font-size: 32px; margin-bottom: 12px;">&#128274;</div>'
      + '<p style="font-weight: bold; color: #dc2626; margin: 0 0 8px 0;">Compte requis</p>'
      + '<p style="font-size: 12px; color: #6b7280; margin-bottom: 16px;">' + error + '</p>'
      + '<a href="https://audibot.fr/dashboard" target="_blank" style="display:inline-block; padding: 10px 20px; background: #2563eb; color: white; border-radius: 8px; font-weight: bold; text-decoration: none; font-size: 13px;">'
      + 'Ouvrir AudiBot &rarr;</a></div>';
  }

  function showVerifiedBadge(plan, expiresAt) {
    var label = PLAN_LABELS[plan] || plan;
    var badge = document.createElement('div');
    badge.style.cssText = 'font-size:10px; padding: 4px 8px; background: #dcfce7; color: #166534; border-radius: 12px; font-weight: 700; display: inline-block; margin-bottom: 8px;';
    badge.textContent = '\u2713 ' + label + ' connect\u00e9';
    var h2 = document.querySelector('h2');
    if (h2) h2.parentElement.insertBefore(badge, h2.nextSibling);

    /* Warning si token expire dans moins de 1h */
    if (expiresAt) {
      var remaining = expiresAt - Date.now();
      if (remaining > 0 && remaining < 60 * 60 * 1000) {
        var hours = Math.ceil(remaining / (60 * 60 * 1000));
        var warning = document.createElement('div');
        warning.style.cssText = 'font-size:10px; padding: 6px 10px; background: #fef3c7; color: #92400e; border-radius: 8px; margin-bottom: 8px; border: 1px solid #fde68a;';
        warning.textContent = '\u26a0\ufe0f Session expire dans ' + (hours > 0 ? hours + 'h' : 'quelques minutes') + ' \u2014 ouvrez le dashboard pour renouveler automatiquement.';
        if (h2) h2.parentElement.insertBefore(warning, badge.nextSibling);
      }
    }
  }

  dataContainer.innerHTML = '<div class="no-data" style="text-align:center;padding:20px;">V\u00e9rification du compte...</div>';

  verifyAccount().then(function(result) {
    if (!result.ok) {
      showBlocked(result.error);
      return;
    }
    /* Lire expiresAt pour l'affichage du warning */
    chrome.storage.local.get(['audibot_auth'], function(authResult) {
      var auth = authResult.audibot_auth || {};
      showVerifiedBadge(result.plan, auth.authExpiresAt);
    });
    dataContainer.innerHTML = '<div class="no-data">Chargement des donn\u00e9es...</div>';
    initPopup(result.plan);
  });

  function initPopup(currentPlan) {

  /* Helper pour lire une valeur imbriquee (ex: "ordonnance.lunettesOD.sphere") */
  function getValue(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj) || '';
  }

  /* Helper pour ecrire une valeur imbriquee */
  function setValue(obj, path, value) {
    const parts = path.split('.');
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
      chrome.storage.local.get(['audibot_auth'], function(r) { resolve(r.audibot_auth || {}); });
    });
    var data = cache.current;

      if (!data) {
        dataContainer.innerHTML = '<div class="card no-data">Aucune donn\u00e9e en cache.</div>';
        return;
      }

      dataContainer.innerHTML = '';

      {
        const key = 'current';
        const isEditing = editingKey === key;
        const card = document.createElement('div');
        card.className = 'card';

        const updatedAt = data.updatedAt ? new Date(data.updatedAt).toLocaleTimeString() : 'Inconnue';

        const sections = [
          {
            title: "\u00c9tat Civil",
            fields: [
              { id: 'nom', label: 'Nom' },
              { id: 'prenom', label: 'Pr\u00e9nom' },
              { id: 'dob', label: 'N\u00e9(e) le' },
              { id: 'nss', label: 'NSS' },
              { id: 'phone', label: 'T\u00e9l' },
              { id: 'email', label: 'Email' },
              { id: 'address', label: 'Adresse' },
              { id: 'zipCode', label: 'CP' },
              { id: 'city', label: 'Ville' }
            ]
          },
          {
            title: "Ordonnance",
            fields: (function() {
              var hasOcr = getValue(data, 'ordonnance.nomOphtalmologue') || getValue(data, 'ordonnance.lunettesOD.sphere');
              if (hasOcr) {
                return [
                  { id: 'ordonnance.typePrescription', label: 'Type' },
                  { id: 'ordonnance.nomOphtalmologue', label: 'Ophtalmo' },
                  { id: 'ordonnance.dateOrdonnance', label: 'Date Ord.' },
                  { id: 'ordonnance.distancePupillaire', label: 'DP' },
                  { id: 'ordonnance.lunettesOD.sphere', label: 'OD Sph' },
                  { id: 'ordonnance.lunettesOD.cylindre', label: 'OD Cyl' },
                  { id: 'ordonnance.lunettesOD.axe', label: 'OD Axe' },
                  { id: 'ordonnance.lunettesOD.addition', label: 'OD Add' },
                  { id: 'ordonnance.lunettesOG.sphere', label: 'OG Sph' },
                  { id: 'ordonnance.lunettesOG.cylindre', label: 'OG Cyl' },
                  { id: 'ordonnance.lunettesOG.axe', label: 'OG Axe' },
                  { id: 'ordonnance.lunettesOG.addition', label: 'OG Add' },
                  { id: 'ordonnance.lentillesOD.rayonCourbure', label: 'OD RC' },
                  { id: 'ordonnance.lentillesOD.diametre', label: 'OD Dia' },
                  { id: 'ordonnance.lentillesOG.rayonCourbure', label: 'OG RC' },
                  { id: 'ordonnance.lentillesOG.diametre', label: 'OG Dia' },
                  { id: 'ordonnance.remarques', label: 'Remarques' }
                ];
              }
              return [
                { id: 'prescription.prescripteur', label: 'Prescripteur' },
                { id: 'prescription.rpps', label: 'RPPS' },
                { id: 'prescription.typeVision', label: 'Vision' },
                { id: 'prescription.datePrescription', label: 'Date' },
                { id: 'prescription.od.sphere', label: 'OD Sph' },
                { id: 'prescription.od.cylindre', label: 'OD Cyl' },
                { id: 'prescription.od.axe', label: 'OD Axe' },
                { id: 'prescription.od.addition', label: 'OD Add' },
                { id: 'prescription.og.sphere', label: 'OG Sph' },
                { id: 'prescription.og.cylindre', label: 'OG Cyl' },
                { id: 'prescription.og.axe', label: 'OG Axe' },
                { id: 'prescription.og.addition', label: 'OG Add' },
                { id: 'prescription.lentillesOD.sphere', label: 'Lent OD Sph' },
                { id: 'prescription.lentillesOD.cylindre', label: 'Lent OD Cyl' },
                { id: 'prescription.lentillesOG.sphere', label: 'Lent OG Sph' },
                { id: 'prescription.lentillesOG.cylindre', label: 'Lent OG Cyl' },
              ];
            })()
          }
        ];

        let html = `
          <div class="section-title">
            <span>${isEditing ? 'Modification' : `Donn\u00e9es de ${esc(data.prenom || '')} ${esc(data.nom || 'Client')}`}</span>
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
          <div class="tag">Mise \u00e0 jour : ${updatedAt}</div>
          <div id="audibot-patient-data" class="data-list">
        `;

        sections.forEach(section => {
          const hasData = section.fields.some(f => getValue(data, f.id));

          if (isEditing || hasData) {
            html += `<div style="margin: 8px 0 4px 0; font-weight: bold; font-size: 11px; color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 2px;">${esc(section.title)}</div>`;

            section.fields.forEach(field => {
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

        /* Section Regimes — éditable en mode modification */
        if (data.regimes || isEditing) {
          var rg = data.regimes || {};
          html += `<div style="margin: 8px 0 4px 0; font-weight: bold; font-size: 11px; color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 2px;">R\u00e9gimes</div>`;

          var regimeFields = [
            { path: 'regimes.ro.nom',                    label: 'RO' },
            { path: 'regimes.ro.tauxPEC',                label: 'Taux PEC' },
            { path: 'regimes.rc1.nom',                   label: 'RC1' },
            { path: 'regimes.rc1.numeroAdherent',        label: 'N\u00b0 adh\u00e9rent' },
            { path: 'regimes.rc1.numeroContrat',         label: 'N\u00b0 contrat' },
            { path: 'regimes.rc1.numeroTeletransmission',label: 'N\u00b0 t\u00e9l\u00e9tr.' },
            { path: 'regimes.rc1.codeConvention',        label: 'Convention' },
            { path: 'regimes.rc2.nom',                   label: 'RC2' },
            { path: 'regimes.rc2.numeroAdherent',        label: 'N\u00b0 adh\u00e9rent 2' },
          ];

          regimeFields.forEach(function(f) {
            var val = getValue(data, f.path) || '';
            if (isEditing) {
              html += `<div class="data-item editing"><span class="data-label">${esc(f.label)}</span><input type="text" class="edit-input" data-field="${f.path}" value="${esc(String(val))}"></div>`;
            } else if (val) {
              html += `<div class="data-item"><span class="data-label">${esc(f.label)}</span><span class="data-value">${esc(String(val))}</span></div>`;
            }
          });
        }

        /* Section Equipements (scrapes depuis LBO) */
        if (data.equipements && data.equipements.length > 0) {
          html += `<div style="margin: 8px 0 4px 0; font-weight: bold; font-size: 11px; color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 2px;">\u00c9quipements (${data.equipements.length})</div>`;

          data.equipements.forEach(function(eq, idx) {
            var eqLabel = (eq.numero === '1' ? 'Principal' : 'Secondaire ' + (eq.numero - 1));
            html += `<div class="eq-card" data-eq-index="${idx}">`;
            html += `<div class="eq-header"><span class="eq-title">${eqLabel} \u2014 ${esc(eq.type || 'Lunettes')} ${eq.vision ? '(' + esc(eq.vision) + ')' : ''}</span><div><button class="eq-edit-btn" data-cache-key="${key}" data-eq-idx="${idx}" style="margin-right:4px;">Modifier</button><button class="eq-delete" data-cache-key="${key}" data-eq-idx="${idx}">Supprimer</button></div></div>`;

            if (eq.correction) {
              html += `<div class="eq-correction">${esc(eq.correction)}</div>`;
            }

            if (eq.lignes && eq.lignes.length > 0) {
              eq.lignes.forEach(function(l, li) {
                var typeLabel = l.type === 'monture' ? 'Monture' : l.type === 'verre' ? 'Verre ' + l.oeil : 'Suppl. ' + l.oeil;
                var pfx = 'eq_' + idx + '_l_' + li + '_';
                html += `<div class="eq-line" style="flex-direction:column;gap:2px;">`;
                html += `<div style="font-size:11px;font-weight:700;color:#1e293b;">${esc(typeLabel)}</div>`;

                var lppManquant = l.type !== "supplement" && !l.codeLPP;
                var fields = [
                  { key: 'designation', label: 'Article', val: l.designation, cls: '', style: 'font-size:10px;' },
                  { key: 'codeLPP', label: 'Code LPP', val: lppManquant ? '— ⚠️' : (l.codeLPP || ''), cls: 'eq-lpp', show: !!l.codeLPP || lppManquant, style: lppManquant ? 'color:#dc2626;font-weight:700;' : '', title: lppManquant ? 'Code LPP manquant — le RPA ne pourra pas compléter cette section' : '' },
                  { key: 'classe', label: 'Classe', val: l.classe || '', cls: '', show: !!l.classe },
                  { key: 'prixBrut', label: 'Prix brut', val: l.prixBrut.toFixed(2), cls: '', suffix: ' \u20ac' },
                  { key: 'remise', label: 'Remise', val: l.remise.toFixed(2), cls: '', suffix: ' \u20ac', show: l.remise > 0 },
                  { key: 'prixNet', label: 'Prix net', val: l.prixNet.toFixed(2), cls: 'eq-prix', suffix: ' \u20ac' },
                  { key: 'ro', label: 'RO', val: l.ro.toFixed(2), cls: '', suffix: ' \u20ac' },
                  { key: 'rc1', label: 'RC', val: l.rc1.toFixed(2), cls: '', suffix: ' \u20ac' },
                  { key: 'rac', label: 'RAC', val: l.rac.toFixed(2), cls: 'eq-rac', suffix: ' \u20ac' },
                ];

                fields.forEach(function(f) {
                  if (f.show === false) return;
                  if (isEditing) {
                    html += `<div class="data-item editing"><span class="data-label">${esc(f.label)}</span><input type="text" class="edit-input eq-field-input" data-eq-idx="${idx}" data-line-idx="${li}" data-field-key="${f.key}" value="${esc(String(f.val))}"></div>`;
                  } else {
                    html += `<div class="data-item"><span class="data-label">${esc(f.label)}</span><span class="data-value ${f.cls}" ${f.style ? 'style="' + f.style + '"' : ''} ${f.title ? 'title="' + f.title + '"' : ''}>${esc(String(f.val))}${f.suffix || ''}</span></div>`;
                  }
                });

                html += `</div>`;
              });
            }

            if (eq.totaux && eq.totaux.net) {
              html += `<div class="eq-total">Total: <span class="eq-prix">${eq.totaux.net.toFixed(2)}\u20ac</span> | RO: ${eq.totaux.ro.toFixed(2)}\u20ac | RC: ${eq.totaux.rc1.toFixed(2)}\u20ac | RAC: <span class="eq-rac">${eq.totaux.rac.toFixed(2)}\u20ac</span></div>`;
            }

            html += `</div>`;
          });

          if (data.totalProposition) {
            html += `<div style="font-size:11px;font-weight:800;color:#2563eb;margin-top:6px;padding:4px 6px;background:#eff6ff;border-radius:6px;">Proposition: ${data.totalProposition.toFixed(2)}\u20ac | RAC: <span class="eq-rac">${(data.racProposition || 0).toFixed(2)}\u20ac</span></div>`;
          }
        }

        card.innerHTML = html;
        dataContainer.appendChild(card);
      }

      /* Parcours RPA Dynamiques — affichage dans la popup */
      (async function() {
        try {
          var syncToken = await getSyncToken();
          if (!syncToken) return;

          /* Récupérer l'onglet actif pour obtenir le hostname */
          chrome.tabs.query({ active: true, currentWindow: true }, async function(tabs) {
            if (!tabs || !tabs[0] || !tabs[0].url) return;
            var tabUrl = tabs[0].url;
            var tabId = tabs[0].id;
            var parsedHostname = "";
            try {
              parsedHostname = new URL(tabUrl).hostname.replace(/^www\./, "");
            } catch(e) { return; }
            if (!parsedHostname) return;

            try {
              var res = await fetch("https://audibot.fr/api/extension/parcours?hostname=" + encodeURIComponent(parsedHostname), { headers: { "Authorization": "Bearer " + syncToken } });
              if (!res.ok) return;
              var resData = await res.json();
              var parcoursList = resData.parcours || [];
              if (parcoursList.length === 0) return;

              /* Insérer le bloc parcours en haut du data-container */
              var container = document.getElementById("data-container");
              if (!container) return;

              var bloc = document.createElement("div");
              bloc.style.cssText = "margin-bottom:10px;padding:10px;background:#f0f7ff;border-radius:10px;border:1px solid #bfdbfe;";

              var title = document.createElement("div");
              title.style.cssText = "font-size:11px;font-weight:700;color:#1d4ed8;margin-bottom:8px;";
              title.textContent = "\uD83E\uDD16 Parcours disponibles";
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
            } catch(e) {}
          });
        } catch(e) {}
      })();

      /* Event Listeners */
      document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          editingKey = 'current';
          renderData();
        });
      });

      document.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          editingKey = null;
          renderData();
        });
      });

      document.querySelectorAll('.save-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          saveChanges();
        });
      });

      document.querySelectorAll('.clear-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          deleteEntry();
        });
      });

      document.querySelectorAll('.eq-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const eqIdx = parseInt(e.target.getAttribute('data-eq-idx'), 10);
          deleteEquipement(eqIdx);
        });
      });

      document.querySelectorAll('.eq-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          editingKey = 'current';
          renderData();
        });
      });

      /* V3-4: Edit patient data */
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
            { key: "regimes.rc1.numeroAdherent", label: "N adherent" },
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
            location.reload(); /* Refresh popup */
          };
          var cancelBtn = document.createElement("button");
          cancelBtn.textContent = "Annuler";
          cancelBtn.style.cssText = "flex:1;padding:6px;border:1px solid #d1d5db;border-radius:6px;background:white;color:#374151;font-size:12px;cursor:pointer;";
          cancelBtn.onclick = function() { location.reload(); };
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

      inputs.forEach(input => {
        const path = input.getAttribute('data-field');
        if (path) {
          setValue(updatedData, path, input.value);
          return;
        }

        const eqIdx = input.getAttribute('data-eq-idx');
        const lineIdx = input.getAttribute('data-line-idx');
        const fieldKey = input.getAttribute('data-field-key');
        if (eqIdx !== null && lineIdx !== null && fieldKey && updatedData.equipements) {
          var ei = parseInt(eqIdx, 10);
          var li = parseInt(lineIdx, 10);
          if (updatedData.equipements[ei] && updatedData.equipements[ei].lignes[li]) {
            var val = input.value;
            if (['prixBrut', 'remise', 'prixNet', 'ro', 'rc1', 'rac'].indexOf(fieldKey) !== -1) {
              val = parseFloat(val.replace(',', '.')) || 0;
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
    const importBtn = document.getElementById('import-btn');
    try {
      const text = await navigator.clipboard.readText();
      const data = JSON.parse(text);
      if (!data.m && !data.o) {
        if (importBtn) { importBtn.innerText = 'Rien \u00e0 importer'; setTimeout(() => { importBtn.innerText = 'Importer depuis AudiBot'; }, 2000); }
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

      if (importBtn) { importBtn.innerText = 'Import\u00e9 !'; setTimeout(() => { importBtn.innerText = 'Importer depuis AudiBot'; }, 2000); }
      renderData();
    } catch(e) {
      if (importBtn) { importBtn.innerText = 'Erreur'; setTimeout(() => { importBtn.innerText = 'Importer depuis AudiBot'; }, 2000); }
    }
  }

  /* Bouton d'import en haut de la popup */
  const importBtn = document.createElement('button');
  importBtn.id = 'import-btn';
  importBtn.innerText = 'Importer depuis AudiBot';
  importBtn.style.cssText = 'width:100%;padding:10px;margin-bottom:12px;background:#2563eb;color:white;border:none;border-radius:12px;font-weight:bold;cursor:pointer;font-size:13px;';
  importBtn.addEventListener('click', importFromClipboard);
  dataContainer.parentElement.insertBefore(importBtn, dataContainer);

  /* ── Boutons Record ── */
  var recorderSection = document.createElement("div");
  recorderSection.style.cssText = "margin-bottom:12px;padding:10px;background:#fef2f2;border:1px solid #fecaca;border-radius:12px;";

  var recorderTitle = document.createElement("div");
  recorderTitle.style.cssText = "font-size:11px;font-weight:700;color:#7f1d1d;margin-bottom:8px;";
  recorderTitle.textContent = "⏺ Enregistrer un parcours";

  var btnRecord = document.createElement("button");
  btnRecord.id = "audibot-btn-record";
  btnRecord.textContent = "⏺ Démarrer l'enregistrement";
  btnRecord.style.cssText = "width:100%;padding:8px;background:#ef4444;color:white;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;margin-bottom:4px;";

  var btnStop = document.createElement("button");
  btnStop.id = "audibot-btn-stop";
  btnStop.textContent = "⏹ Arrêter et sauvegarder";
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
        recorderStatus.textContent = "Parcours sauvegardé — en attente de validation admin";
      }
    });
  });

  recorderSection.appendChild(recorderTitle);
  recorderSection.appendChild(btnRecord);
  recorderSection.appendChild(btnStop);
  recorderSection.appendChild(recorderStatus);
  dataContainer.parentElement.insertBefore(recorderSection, dataContainer);

  /* Vérifier l'état du recorder depuis le storage (survit aux navigations) */
  chrome.storage.local.get(["audibot_recorder"], function(result) {
    var saved = result.audibot_recorder;
    if (saved && saved.active) {
      btnRecord.style.display = "none";
      btnStop.style.display = "block";
      recorderStatus.textContent = "⏺ En cours — " + (saved.etapes ? saved.etapes.length : 0) + " étapes enregistrées";
    }
  });
  /* ── Fin Boutons Record ── */

  renderData();

  /* ── Auto-refresh quand le cache change (ex: clic Mémoriser sur la page) ── */
  chrome.storage.onChanged.addListener(function(changes, area) {
    if (area === 'local' && changes.audibot_cache) {
      renderData();
    }
  });

  /* ── Toggle boutons flottants ─────────────────────────────────── */
  const toggleCheckbox = document.getElementById('toggle-buttons');
  const toggleTrack = document.getElementById('toggle-track');
  const toggleThumb = document.getElementById('toggle-thumb');

  function updateToggleUI(visible) {
    if (!toggleCheckbox || !toggleTrack || !toggleThumb) return;
    toggleCheckbox.checked = visible;
    toggleTrack.style.background = visible ? '#2563eb' : '#d1d5db';
    toggleThumb.style.transform = visible ? 'translateX(20px)' : 'translateX(0)';
  }

  chrome.storage.local.get(['audibot_buttons_visible'], (result) => {
    const visible = result.audibot_buttons_visible !== false;
    updateToggleUI(visible);
  });

  if (toggleCheckbox) {
    toggleCheckbox.addEventListener('change', () => {
      const visible = toggleCheckbox.checked;
      chrome.storage.local.set({ audibot_buttons_visible: visible });
      updateToggleUI(visible);

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'AUDIBOT_TOGGLE_BUTTONS', visible });
        }
      });
    });
  }

  /* ── Toggle remplissage auto au chargement ──────────────────── */
  const toggleAutofill = document.getElementById('toggle-autofill');
  const toggleAutofillTrack = document.getElementById('toggle-autofill-track');
  const toggleAutofillThumb = document.getElementById('toggle-autofill-thumb');

  function updateAutofillToggleUI(enabled) {
    if (!toggleAutofill || !toggleAutofillTrack || !toggleAutofillThumb) return;
    toggleAutofill.checked = enabled;
    toggleAutofillTrack.style.background = enabled ? '#2563eb' : '#d1d5db';
    toggleAutofillThumb.style.transform = enabled ? 'translateX(20px)' : 'translateX(0)';
  }

  chrome.storage.local.get(['audibot_settings'], (result) => {
    var settings = result.audibot_settings || {};
    /* Par défaut activé (true) */
    var enabled = settings.autofillOnLoad !== false;
    updateAutofillToggleUI(enabled);
  });

  if (toggleAutofill) {
    toggleAutofill.addEventListener('change', () => {
      chrome.storage.local.get(['audibot_settings'], (result) => {
        var settings = result.audibot_settings || {};
        settings.autofillOnLoad = toggleAutofill.checked;
        chrome.storage.local.set({ audibot_settings: settings });
        updateAutofillToggleUI(toggleAutofill.checked);
      });
    });
  }

  /* ── Toggle détection automatique des rejets ──────────────────── */
  const toggleRejet = document.getElementById('toggle-rejet');
  const toggleRejetTrack = document.getElementById('toggle-rejet-track');
  const toggleRejetThumb = document.getElementById('toggle-rejet-thumb');

  function updateRejetToggleUI(enabled) {
    if (!toggleRejet || !toggleRejetTrack || !toggleRejetThumb) return;
    toggleRejet.checked = enabled;
    toggleRejetTrack.style.background = enabled ? '#2563eb' : '#d1d5db';
    toggleRejetThumb.style.transform = enabled ? 'translateX(20px)' : 'translateX(0)';
  }

  chrome.storage.local.get(['audibot_rejet_consent'], (result) => {
    const enabled = result.audibot_rejet_consent === true;
    updateRejetToggleUI(enabled);
  });

  if (toggleRejet) {
    toggleRejet.addEventListener('change', () => {
      const enabled = toggleRejet.checked;
      /* audibot_rejet_consent = consentement explicite de l'utilisateur */
      chrome.storage.local.set({
        audibot_rejet_consent: enabled,
        audibot_rejet_enabled: enabled
      });
      updateRejetToggleUI(enabled);
    });
  }

  /* V3: Preview before fill toggle */
  const togglePreview = document.getElementById('toggle-preview');
  const togglePreviewTrack = document.getElementById('toggle-preview-track');
  const togglePreviewThumb = document.getElementById('toggle-preview-thumb');

  function updatePreviewToggleUI(enabled) {
    if (!togglePreview || !togglePreviewTrack || !togglePreviewThumb) return;
    togglePreview.checked = enabled;
    togglePreviewTrack.style.background = enabled ? '#2563eb' : '#d1d5db';
    togglePreviewThumb.style.transform = enabled ? 'translateX(20px)' : 'translateX(0)';
  }

  chrome.storage.local.get(['audibot_settings'], (result) => {
    var settings = result.audibot_settings || {};
    updatePreviewToggleUI(settings.previewBeforeFill || false);
  });

  if (togglePreview) {
    togglePreview.addEventListener('change', () => {
      chrome.storage.local.get(['audibot_settings'], (result) => {
        var settings = result.audibot_settings || {};
        settings.previewBeforeFill = togglePreview.checked;
        chrome.storage.local.set({ audibot_settings: settings });
        updatePreviewToggleUI(togglePreview.checked);
      });
    });
  }

  /* V3-6: TP Status Tracker */
  function loadTPTracker() {
    var card = document.getElementById("card-tp-tracker");
    var list = document.getElementById("tp-tracker-list");
    if (!card || !list) return;

    chrome.storage.local.get(["audibot_tp_history", "audibot_auth"], function(result) {
      var auth = result.audibot_auth || {};
      if (!auth.syncToken) { card.style.display = "none"; return; }

      card.style.display = "block";

      /* Fetch TP status from backend */
      fetch("https://audibot.fr/api/extension/tp-status", {
        headers: { "Authorization": "Bearer " + auth.syncToken }
      })
      .then(function(r) { return r.json(); })
      .then(function(data) {
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
          row.innerHTML = '<span>' + esc(d.date || "") + ' \u2014 ' + esc(d.organisme || "").substring(0, 20) + '</span>' +
            '<span style="display:flex;align-items:center;gap:4px;">' +
            '<span style="font-size:12px;">' + esc(d.montant || "") + '</span>' +
            '<span style="color:' + (statusColors[d.status] || "#6b7280") + ';font-size:11px;font-weight:600;">' + (statusIcons[d.status] || "?") + ' ' + esc(d.status || "inconnu") + '</span>' +
            '</span>';
          list.appendChild(row);
        }
        /* Save locally for offline */
        chrome.storage.local.set({ audibot_tp_history: { dossiers: dossiers, ts: Date.now() } });
      })
      .catch(function(err) {
        /* Fallback to cached */
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

  /* V3-7: Rejection Root Cause Analysis */
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
      })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var rejections = data.rejections || [];
        if (rejections.length === 0) { card.style.display = "none"; return; }

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
      })
      .catch(function(err) { console.warn("[AudiBot] rejection details fetch failed:", err); });
    });
  }

  loadRejectionDetails();

  /* V3-11: Team Dashboard */
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
      })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var activity = data.activity || {};
        stats.innerHTML =
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
          '<div style="text-align:center;padding:8px;background:#f0f9ff;border-radius:8px;"><div style="font-size:20px;font-weight:700;color:#2563eb;">' + esc(String(activity.fillsToday || 0)) + '</div><div style="font-size:10px;color:#6b7280;">Fills aujourd\'hui</div></div>' +
          '<div style="text-align:center;padding:8px;background:#fef2f2;border-radius:8px;"><div style="font-size:20px;font-weight:700;color:#dc2626;">' + esc(String(activity.rejectsToday || 0)) + '</div><div style="font-size:10px;color:#6b7280;">Rejets</div></div>' +
          '<div style="text-align:center;padding:8px;background:#f0fdf4;border-radius:8px;"><div style="font-size:20px;font-weight:700;color:#059669;">' + esc(String(activity.acceptanceRate || "\u2014")) + '</div><div style="font-size:10px;color:#6b7280;">Taux acceptation</div></div>' +
          '<div style="text-align:center;padding:8px;background:#faf5ff;border-radius:8px;"><div style="font-size:20px;font-weight:700;color:#7c3aed;">' + esc(String(activity.activeMembers || 0)) + '</div><div style="font-size:10px;color:#6b7280;">Membres actifs</div></div>' +
          '</div>';
      })
      .catch(function(err) {
        stats.textContent = "Impossible de charger les donnees equipe.";
        console.warn("[AudiBot] team dashboard fetch failed:", err);
      });
    });
  }

  loadTeamDashboard(currentPlan);

  } /* end initPopup */
  } /* end startPopup */
});
