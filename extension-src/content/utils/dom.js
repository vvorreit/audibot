/* ── DOM Utility Functions ──────────────────────────────────────────────── */

export function querySelectorAllDeep(selector, root, depth) {
  root = root || document;
  depth = depth || 0;
  if (depth > 5) return [];
  var results = Array.from(root.querySelectorAll(selector));

  // Shadow roots
  var all = root.querySelectorAll("*");
  for (var i = 0; i < all.length; i++) {
    if (all[i].shadowRoot) {
      results = results.concat(querySelectorAllDeep(selector, all[i].shadowRoot, depth + 1));
    }
  }

  // Same-origin iframes (only from document root, not inside shadow)
  if (root === document && depth === 0) {
    var iframes = document.querySelectorAll("iframe");
    for (var fi = 0; fi < iframes.length; fi++) {
      try {
        var iDoc = iframes[fi].contentDocument || (iframes[fi].contentWindow && iframes[fi].contentWindow.document);
        if (iDoc) results = results.concat(querySelectorAllDeep(selector, iDoc, depth + 1));
      } catch(e) { /* cross-origin */ }
    }
  }

  return results;
}

export function findElement(selector) {
  if (!selector) return null;
  var el = document.querySelector(selector);
  if (el) return el;
  var iframes = document.querySelectorAll("iframe");
  for (var i = 0; i < iframes.length; i++) {
    try {
      var iDoc = iframes[i].contentDocument;
      if (iDoc) { el = iDoc.querySelector(selector); if (el) return el; }
    } catch(e) {}
  }
  return findInShadowRoots(selector, document);
}

export function findInShadowRoots(selector, root, depth) {
  if ((depth || 0) > 5) return null;
  /* Early exit : vérifier si des enfants directs ont un shadowRoot */
  var children = Array.from(root.children || []);
  var hasShadowChild = children.some(function(c) { return !!c.shadowRoot; });
  if (!hasShadowChild) {
    /* Vérifier aussi les descendants proches (max 2 niveaux) sans querySelectorAll("*") */
    var hasDeepShadow = children.some(function(c) {
      return Array.from(c.children || []).some(function(gc) { return !!gc.shadowRoot; });
    });
    if (!hasDeepShadow) return null;
  }
  var all = root.querySelectorAll("*");
  for (var i = 0; i < all.length; i++) {
    if (all[i].shadowRoot) {
      var found = all[i].shadowRoot.querySelector(selector);
      if (found) return found;
      found = findInShadowRoots(selector, all[i].shadowRoot, (depth || 0) + 1);
      if (found) return found;
    }
  }
  return null;
}

/* waitForElement — MutationObserver au lieu du polling pour réagir immédiatement */
export function waitForElement(selector, timeoutMs) {
  return new Promise(function(resolve) {
    /* Vérification immédiate document + iframes */
    var el = findElement(selector);
    if (el) { resolve(el); return; }

    var resolved = false;
    var observer = null;
    var timer = null;

    function cleanup() {
      if (resolved) return;
      resolved = true;
      if (observer) observer.disconnect();
      if (timer) clearTimeout(timer);
    }

    function check() {
      if (resolved) return;
      var found = findElement(selector);
      if (found) {
        cleanup();
        resolve(found);
      }
    }

    /* MutationObserver pour réagir dès qu'un nœud est ajouté */
    try {
      observer = new MutationObserver(function() { check(); });
      observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["id", "name", "class", "style", "hidden", "disabled"],
      });
    } catch(e) {
      /* Fallback polling si MutationObserver échoue */
      var pollInterval = setInterval(function() {
        check();
        if (resolved) clearInterval(pollInterval);
      }, 150);
      timer = setTimeout(function() {
        clearInterval(pollInterval);
        if (!resolved) { resolved = true; resolve(null); }
      }, timeoutMs || 5000);
      return;
    }

    /* Polling de secours toutes les 300ms (les iframes ne déclenchent pas le MutationObserver) */
    var iframePoll = setInterval(function() { check(); }, 300);

    /* Timeout */
    timer = setTimeout(function() {
      clearInterval(iframePoll);
      cleanup();
      resolve(null);
    }, timeoutMs || 5000);
  });
}
