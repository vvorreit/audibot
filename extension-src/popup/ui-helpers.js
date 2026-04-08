/* ── UI helpers for popup: collapsible sections, toggles, offline banner ── */

/* ── Collapsible sections + toggle init (moved from inline script for CSP) ── */
export function initCollapsiblesAndToggles() {
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
}

/* ── Indicateur offline ──────────────────────────────────────── */
export function showOfflineBanner() {
  var existing = document.getElementById('audibot-offline-banner');
  if (existing) return;
  var banner = document.createElement('div');
  banner.id = 'audibot-offline-banner';
  banner.style.cssText = 'display:flex;align-items:center;gap:6px;padding:6px 10px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;margin-bottom:8px;font-size:11px;color:#dc2626;font-weight:600;';
  banner.innerHTML = '\uD83D\uDD34 Hors ligne \u2014 mode cache';
  var container = document.body.querySelector('.container') || document.body;
  container.insertBefore(banner, container.firstChild);
}

export function hideOfflineBanner() {
  var banner = document.getElementById('audibot-offline-banner');
  if (banner) banner.remove();
}

export function initOfflineBanner() {
  if (!navigator.onLine) {
    showOfflineBanner();
  }
  window.addEventListener('online', function() { hideOfflineBanner(); });
  window.addEventListener('offline', function() { showOfflineBanner(); });
}

/* ── Toggle boutons flottants ─────────────────────────────────── */
export function initToggleButtons() {
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
}

/* ── Toggle remplissage auto au chargement ──────────────────── */
export function initToggleAutofill() {
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
    /* Par d\u00e9faut activ\u00e9 (true) */
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
}

/* ── Toggle d\u00e9tection automatique des rejets ──────────────────── */
export function initToggleRejet() {
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
}

/* V3: Preview before fill toggle */
export function initTogglePreview() {
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
}

/** Initialize all toggle sections at once */
export function initAllToggles() {
  initToggleButtons();
  initToggleAutofill();
  initToggleRejet();
  initTogglePreview();
}
