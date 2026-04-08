/* ── US-8 : Feedback Loop — Signalement de champ mal rempli ─────────────── */
/* Clic droit sur un champ → "Signaler ce champ"                               */
/* Envoie sélecteur DOM + URL portail au serveur (anonymisé, sans donnée patient) */

var _feedbackMenuEl = null;
var _feedbackTargetEl = null;

function initFieldFeedback() {
  /* Injecter le menu contextuel custom */
  document.addEventListener('contextmenu', function(e) {
    var target = e.target;
    if (!target) return;

    /* Vérifier si c'est un input/select/textarea potentiellement rempli par AudiBot */
    var isFormField = target.matches('input, select, textarea, [contenteditable="true"]');
    if (!isFormField) return;

    /* Afficher notre menu après le menu contextuel natif */
    setTimeout(function() { showFeedbackMenu(e.clientX, e.clientY, target); }, 100);
  });

  /* Fermer le menu si clic ailleurs */
  document.addEventListener('click', function(e) {
    if (_feedbackMenuEl && !_feedbackMenuEl.contains(e.target)) {
      hideFeedbackMenu();
    }
  });
}

function showFeedbackMenu(x, y, targetEl) {
  hideFeedbackMenu();
  _feedbackTargetEl = targetEl;

  var menu = document.createElement('div');
  menu.id = 'audibot-feedback-menu';
  menu.style.cssText = [
    'position:fixed',
    'z-index:2147483647',
    'background:#1e293b',
    'color:white',
    'border-radius:8px',
    'box-shadow:0 4px 16px rgba(0,0,0,0.3)',
    'padding:4px',
    'min-width:200px',
    'font-family:system-ui,sans-serif',
    'font-size:13px',
    'left:' + Math.min(x, window.innerWidth - 220) + 'px',
    'top:' + Math.min(y, window.innerHeight - 80) + 'px'
  ].join(';');

  var btn = document.createElement('button');
  btn.style.cssText = 'display:flex;align-items:center;gap:8px;width:100%;padding:8px 12px;background:none;border:none;color:white;cursor:pointer;border-radius:6px;text-align:left;';
  btn.innerHTML = '<span style="font-size:16px">🐛</span><span>Signaler ce champ à AudiBot</span>';
  btn.addEventListener('mouseenter', function() { btn.style.background = '#334155'; });
  btn.addEventListener('mouseleave', function() { btn.style.background = 'none'; });
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    sendFieldFeedback(targetEl);
    hideFeedbackMenu();
  });

  menu.appendChild(btn);
  document.body.appendChild(menu);
  _feedbackMenuEl = menu;
}

function hideFeedbackMenu() {
  if (_feedbackMenuEl) {
    _feedbackMenuEl.remove();
    _feedbackMenuEl = null;
  }
  _feedbackTargetEl = null;
}

function buildSelector(el) {
  /* Construire un sélecteur CSS stable pour le champ */
  if (el.id) return '#' + el.id;
  if (el.name) return el.tagName.toLowerCase() + '[name="' + el.name + '"]';
  if (el.getAttribute('data-field')) return '[data-field="' + el.getAttribute('data-field') + '"]';
  if (el.className) {
    var classes = Array.from(el.classList).slice(0, 2).join('.');
    if (classes) return el.tagName.toLowerCase() + '.' + classes;
  }
  /* Fallback : position dans le DOM */
  var parent = el.parentElement;
  if (parent) {
    var siblings = Array.from(parent.children);
    var idx = siblings.indexOf(el) + 1;
    return el.tagName.toLowerCase() + ':nth-child(' + idx + ')';
  }
  return el.tagName.toLowerCase();
}

function inferFieldType(el) {
  /* Deviner le type de champ attendu */
  var hints = [
    el.id, el.name, el.placeholder,
    el.getAttribute('aria-label'), el.getAttribute('data-field')
  ].filter(Boolean).join(' ').toLowerCase();

  if (/nom|lastname|family/i.test(hints)) return 'nom';
  if (/prenom|firstname/i.test(hints)) return 'prenom';
  if (/nss|secu|insee/i.test(hints)) return 'nss';
  if (/date|naissance|birth/i.test(hints)) return 'date';
  if (/mutuelle|regime|rc1/i.test(hints)) return 'mutuelle';
  if (/sph[eè]re|sphere/i.test(hints)) return 'sphere';
  if (/cylindre|cyl/i.test(hints)) return 'cylindre';
  if (/axe/i.test(hints)) return 'axe';
  return 'unknown';
}

function sendFieldFeedback(el) {
  var selector = buildSelector(el);
  var fieldType = inferFieldType(el);
  var portalHostname = window.location.hostname.replace(/^www\./, '');
  var portalUrl = window.location.href.split('?')[0]; /* sans query params — anonymisé */

  var payload = {
    selector: selector,
    fieldType: fieldType,
    portal: portalHostname,
    url: portalUrl,
    ts: Date.now()
  };

  /* Toast de confirmation immédiate */
  showFeedbackToast('⏳ Signalement envoyé à AudiBot…');

  /* Envoyer via background (évite les restrictions CORS du content script) */
  chrome.runtime.sendMessage({
    type: 'AUDIBOT_FIELD_FEEDBACK',
    payload: payload
  }, function(response) {
    if (response && response.ok) {
      showFeedbackToast('🙏 Merci, on améliore ça !');
    } else {
      showFeedbackToast('⚠️ Envoi échoué — réessaie plus tard');
    }
  });
}

function showFeedbackToast(message) {
  var existing = document.getElementById('audibot-feedback-toast');
  if (existing) existing.remove();

  var toast = document.createElement('div');
  toast.id = 'audibot-feedback-toast';
  toast.style.cssText = [
    'position:fixed',
    'bottom:24px',
    'right:24px',
    'z-index:2147483647',
    'background:#1e293b',
    'color:white',
    'padding:10px 16px',
    'border-radius:10px',
    'font-family:system-ui,sans-serif',
    'font-size:13px',
    'font-weight:600',
    'box-shadow:0 4px 16px rgba(0,0,0,0.25)',
    'transition:opacity 0.3s'
  ].join(';');
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(function() {
    toast.style.opacity = '0';
    setTimeout(function() { toast.remove(); }, 300);
  }, 3000);
}

/* Expose */
globalThis.initFieldFeedback = initFieldFeedback;
