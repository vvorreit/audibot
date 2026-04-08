/* ── Visibilite des boutons (toggle depuis popup) ───────────────────────── */

export function setButtonsVisibility(visible) {
  var ids = ['audibot-fill-btn', 'audibot-sync-btn', 'audibot-sync-tp-btn'];
  for (var i = 0; i < ids.length; i++) {
    var el = document.getElementById(ids[i]);
    if (el) el.style.display = visible ? 'block' : 'none';
  }
}

/* Au chargement, appliquer la preference sauvegardee */
export function applyButtonsPreference() {
  chrome.storage.local.get(['audibot_buttons_visible'], function(result) {
    var visible = result.audibot_buttons_visible !== false;
    setButtonsVisibility(visible);
  });
}
