/* ── Selector Cache per portal ──────────────────────────────────────────── */

export let _selectorCache = {};
var _selectorCacheDirty = false;
var _selectorCacheLastSave = 0;

var SELECTOR_CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

export function getCachedSelector(hostname, fieldName) {
  if (!_selectorCache[hostname]) return null;
  var entry = _selectorCache[hostname][fieldName];
  if (!entry) return null;
  /* Backward compat : anciens caches sans timestamp */
  if (typeof entry === "string") return entry;
  /* TTL check */
  if (Date.now() - entry.ts > SELECTOR_CACHE_TTL) {
    delete _selectorCache[hostname][fieldName];
    _selectorCacheDirty = true;
    return null;
  }
  return entry.selector;
}

export function setCachedSelector(hostname, fieldName, selector) {
  if (!_selectorCache[hostname]) _selectorCache[hostname] = {};
  _selectorCache[hostname][fieldName] = { selector: selector, ts: Date.now() };
  _selectorCacheDirty = true;
  var now = Date.now();
  if (now - _selectorCacheLastSave > 10000) {
    saveSelectorCache();
  }
}

export function cleanSelectorCache() {
  var now = Date.now();
  var changed = false;
  Object.keys(_selectorCache).forEach(function(hostname) {
    Object.keys(_selectorCache[hostname]).forEach(function(fieldName) {
      var entry = _selectorCache[hostname][fieldName];
      if (typeof entry === "object" && entry.ts && now - entry.ts > SELECTOR_CACHE_TTL) {
        delete _selectorCache[hostname][fieldName];
        changed = true;
      }
    });
    if (Object.keys(_selectorCache[hostname]).length === 0) {
      delete _selectorCache[hostname];
    }
  });
  if (changed) _selectorCacheDirty = true;
}

export function loadSelectorCache() {
  chrome.storage.local.get(["optibot_selector_cache"], function(result) {
    _selectorCache = result.optibot_selector_cache || {};
    cleanSelectorCache();
  });
}

export function saveSelectorCache() {
  if (!_selectorCacheDirty) return;
  _selectorCacheDirty = false;
  _selectorCacheLastSave = Date.now();
  chrome.storage.local.set({ optibot_selector_cache: _selectorCache });
}
