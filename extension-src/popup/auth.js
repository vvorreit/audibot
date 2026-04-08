/* ── Auth / Lock / Verification logic for popup ──────────────────────── */

export const PLAN_LABELS = { FREE: 'Free', ESSENTIEL: 'Essentiel', PRO: 'Pro', EQUIPE: 'Equipe' };
export const INACTIVITY_MINUTES = 15;

/* ── Lock d'inactivite ─────────────────────────────── */
export function renewLock() {
  chrome.storage.local.set({ audibot_lock: { lockAt: Date.now() + INACTIVITY_MINUTES * 60 * 1000 } });
  /* Renouveler l'alarme dans le background */
  chrome.runtime.sendMessage({ type: 'AUDIBOT_RENEW_LOCK' });
}

export function showLocked(message) {
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

export function showBlockedGlobal(error) {
  var container = document.body.querySelector('.container');
  if (!container) container = document.body;
  container.innerHTML = '<div style="padding: 20px; text-align: center;">'
    + '<div style="font-size: 32px; margin-bottom: 12px;">&#128274;</div>'
    + '<p style="font-weight: bold; color: #dc2626; margin: 0 0 8px 0;">Compte requis</p>'
    + '<p style="font-size: 12px; color: #6b7280; margin-bottom: 16px;">' + error + '</p>'
    + '<a href="https://audibot.fr/dashboard" target="_blank" style="display:inline-block; padding: 10px 20px; background: #2563eb; color: white; border-radius: 8px; font-weight: bold; text-decoration: none; font-size: 13px;">'
    + 'Ouvrir AudiBot &rarr;</a></div>';
}

export function attemptUnlock() {
  chrome.storage.local.get(['audibot_auth'], function(result) {
    var auth = result.audibot_auth || {};
    var token = auth.syncToken;
    if (!token) {
      showBlockedGlobal("Connectez-vous sur audibot.fr pour utiliser l'extension.");
      return;
    }
    var controller = new AbortController();
    var timer = setTimeout(function() { controller.abort(); }, 10000);
    fetch('https://audibot.fr/api/extension/verify', { headers: { "Authorization": "Bearer " + token }, signal: controller.signal })
      .then(function(r) { clearTimeout(timer); if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function(data) {
        if (data.ok) {
          renewLock();
          location.reload();
        } else {
          showBlockedGlobal(data.error || "Impossible de v\u00e9rifier votre compte.");
        }
      })
      .catch(function() {
        clearTimeout(timer);
        showBlockedGlobal("Impossible de v\u00e9rifier votre compte (r\u00e9seau).");
      });
  });
}

export async function verifyAccount() {
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

      var ctrl = new AbortController();
      var t = setTimeout(function() { ctrl.abort(); }, 10000);
      fetch('https://audibot.fr/api/extension/verify', { headers: { "Authorization": "Bearer " + token }, signal: ctrl.signal })
        .then(function(r) { clearTimeout(t); if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
        .then(function(data) { resolve(data); })
        .catch(function() { clearTimeout(t); resolve({ ok: false, error: "Impossible de v\u00e9rifier votre compte (r\u00e9seau)." }); });
    });
  });
}

export function showBlocked(error) {
  var container = document.getElementById('data-container');
  container.parentElement.innerHTML = '<div style="padding: 20px; text-align: center;">'
    + '<div style="font-size: 32px; margin-bottom: 12px;">&#128274;</div>'
    + '<p style="font-weight: bold; color: #dc2626; margin: 0 0 8px 0;">Compte requis</p>'
    + '<p style="font-size: 12px; color: #6b7280; margin-bottom: 16px;">' + error + '</p>'
    + '<a href="https://audibot.fr/dashboard" target="_blank" style="display:inline-block; padding: 10px 20px; background: #2563eb; color: white; border-radius: 8px; font-weight: bold; text-decoration: none; font-size: 13px;">'
    + 'Ouvrir AudiBot &rarr;</a></div>';
}

export function showVerifiedBadge(plan, expiresAt) {
  var label = PLAN_LABELS[plan] || plan;
  var badge = document.createElement('div');
  badge.style.cssText = 'font-size:10px; padding: 4px 8px; background: #dcfce7; color: #166534; border-radius: 12px; font-weight: 700; display: inline-block; margin-bottom: 8px;';
  badge.textContent = '\u2713 ' + label + ' connect\u00e9';
  var h2 = document.querySelector('h2');
  if (h2 && h2.parentElement) h2.parentElement.insertBefore(badge, h2.nextSibling);

  /* Warning si token expire dans moins de 1h */
  if (expiresAt && h2 && h2.parentElement) {
    var remaining = expiresAt - Date.now();
    if (remaining > 0 && remaining < 60 * 60 * 1000) {
      var hours = Math.ceil(remaining / (60 * 60 * 1000));
      var warning = document.createElement('div');
      warning.style.cssText = 'font-size:10px; padding: 6px 10px; background: #fef3c7; color: #92400e; border-radius: 8px; margin-bottom: 8px; border: 1px solid #fde68a;';
      warning.textContent = '\u26a0\ufe0f Session expire dans ' + (hours > 0 ? hours + 'h' : 'quelques minutes') + ' \u2014 ouvrez le dashboard pour renouveler automatiquement.';
      h2.parentElement.insertBefore(warning, badge.nextSibling);
    }
  }
}

export function showStats(stats) {
  var h2 = document.querySelector('h2');
  if (!h2) return;
  var statsDiv = document.createElement('div');
  statsDiv.id = 'audibot-stats-bar';
  statsDiv.style.cssText = 'display:flex;gap:8px;margin-bottom:8px;';

  var minSaved = stats.minutesSaved || 0;
  var dossiersEnAttente = stats.dossiersEnAttente || 0;

  /* #16 — Utiliser textContent au lieu de innerHTML pour éviter l'injection XSS */
  var statMin = document.createElement('div');
  statMin.style.cssText = 'flex:1;padding:6px 8px;background:#f0f9ff;border:1px solid #bfdbfe;border-radius:8px;text-align:center;';
  var statMinVal = document.createElement('div');
  statMinVal.style.cssText = 'font-size:13px;font-weight:800;color:#1d4ed8;';
  statMinVal.textContent = String(minSaved);
  var statMinLabel = document.createElement('div');
  statMinLabel.style.cssText = 'font-size:9px;color:#6b7280;font-weight:600;';
  statMinLabel.textContent = '\u23f1 min \u00e9conomis\u00e9es';
  statMin.appendChild(statMinVal);
  statMin.appendChild(statMinLabel);

  var statDossiers = document.createElement('div');
  statDossiers.style.cssText = 'flex:1;padding:6px 8px;background:' + (dossiersEnAttente > 0 ? '#fff7ed' : '#f0fdf4') + ';border:1px solid ' + (dossiersEnAttente > 0 ? '#fed7aa' : '#bbf7d0') + ';border-radius:8px;text-align:center;';
  var statDosVal = document.createElement('div');
  statDosVal.style.cssText = 'font-size:13px;font-weight:800;color:' + (dossiersEnAttente > 0 ? '#c2410c' : '#059669') + ';';
  statDosVal.textContent = String(dossiersEnAttente);
  var statDosLabel = document.createElement('div');
  statDosLabel.style.cssText = 'font-size:9px;color:#6b7280;font-weight:600;';
  statDosLabel.textContent = '\ud83d\udccb dossiers en attente';
  statDossiers.appendChild(statDosVal);
  statDossiers.appendChild(statDosLabel);

  statsDiv.appendChild(statMin);
  statsDiv.appendChild(statDossiers);

  /* Ins\u00e9rer apr\u00e8s le badge de plan */
  var badge = h2.parentElement.querySelector('[style*="dcfce7"]');
  if (badge && badge.nextSibling) {
    h2.parentElement.insertBefore(statsDiv, badge.nextSibling);
  } else if (h2) {
    h2.parentElement.insertBefore(statsDiv, h2.nextSibling);
  }
}

/**
 * Check lock state and call startPopup() if unlocked.
 * @param {() => void} startPopup - callback to run when lock is OK
 */
export function checkLockAndStart(startPopup) {
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
}
