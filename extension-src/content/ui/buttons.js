/* ── Visibilite des boutons (toggle depuis popup) ───────────────────────── */

export function setButtonsVisibility(visible) {
  var ids = ['optibot-fill-btn', 'optibot-sync-btn', 'optibot-sync-tp-btn'];
  for (var i = 0; i < ids.length; i++) {
    var el = document.getElementById(ids[i]);
    if (el) el.style.display = visible ? 'block' : 'none';
  }
}

/* Au chargement, appliquer la preference sauvegardee */
export function applyButtonsPreference() {
  chrome.storage.local.get(['optibot_buttons_visible'], function(result) {
    var visible = result.optibot_buttons_visible !== false;
    setButtonsVisibility(visible);
  });
}
