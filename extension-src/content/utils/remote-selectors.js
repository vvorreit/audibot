/* ── Remote Selector Overrides ──────────────────────────────────────────────── */
/* Charge les overrides de selecteurs depuis chrome.storage.local              */
/* (alimente par le background toutes les 30 min via /api/extension/selectors) */

var _remoteOverrides = null;
var _remoteOverridesLoaded = false;

/**
 * Charge les overrides depuis le storage local.
 * Appele une seule fois au demarrage du content script.
 */
function loadRemoteSelectors(callback) {
  chrome.storage.local.get(["optibot_selector_overrides"], function(result) {
    var data = result.optibot_selector_overrides;
    if (data && data.overrides) {
      _remoteOverrides = data.overrides;
    } else {
      _remoteOverrides = {};
    }
    _remoteOverridesLoaded = true;
    if (typeof callback === "function") callback();
  });
}

/**
 * Retourne le selecteur override pour un portail/champ donne,
 * ou le fallback hardcode si aucun override n'existe.
 *
 * @param {string} portal     - cle du portail (ex: "mutuelle-almerys.com")
 * @param {string} name       - nom logique du selecteur (ex: "nom_beneficiaire")
 * @param {string} fallback   - selecteur CSS hardcode par defaut
 * @returns {string} le selecteur CSS a utiliser
 */
function getOverride(portal, name, fallback) {
  if (!_remoteOverridesLoaded || !_remoteOverrides) return fallback;
  var portalOverrides = _remoteOverrides[portal];
  if (!portalOverrides) return fallback;
  var override = portalOverrides[name];
  return (override && typeof override === "string") ? override : fallback;
}

/**
 * Variante de findElement qui utilise les overrides.
 * Essaie d'abord l'override, puis le fallback si l'override echoue.
 *
 * @param {string} portal     - cle du portail
 * @param {string} name       - nom logique du selecteur
 * @param {string} fallback   - selecteur CSS hardcode
 * @returns {Element|null}
 */
function findElementWithOverride(portal, name, fallback) {
  var overrideSelector = getOverride(portal, name, null);
  if (overrideSelector && overrideSelector !== fallback) {
    var el = findElement(overrideSelector);
    if (el) return el;
    /* Override n'a pas marche, essayer le fallback */
  }
  return findElement(fallback);
}

/* Expose pour l'import depuis content/index.js */
globalThis.loadRemoteSelectors = loadRemoteSelectors;
globalThis.getOverride = getOverride;
globalThis.findElementWithOverride = findElementWithOverride;
