/* ── Selector Generation & Lookup Utility Functions ────────────────────── */

/* Génère une liste ordonnée de sélecteurs CSS stables pour un élément.
   Priorité : id > name > aria-label > data-cy/testid > placeholder > label-for > role+type > nth-child */
export function generateSelectors(el) {
  var selectors = [];
  var tag = el.tagName.toLowerCase();

  /* 1. ID stable (pas de préfixe numérique, pas généré dynamiquement) */
  if (el.id && !el.id.match(/^[0-9]/) && !el.id.match(/^(ember|react|vue|ng|mat-input-|cdk-)/i) && el.id.length < 80) {
    selectors.push('#' + CSS.escape(el.id));
  }

  /* 2. Attribut name (très stable sur les formulaires) */
  if (el.name) {
    selectors.push(tag + '[name="' + el.name + '"]');
  }

  /* 3. aria-label (accessible et stable) */
  var ariaLabel = el.getAttribute("aria-label");
  if (ariaLabel && ariaLabel.length < 60) {
    selectors.push(tag + '[aria-label="' + ariaLabel.replace(/"/g, '\\"') + '"]');
  }

  /* 4. data-cy / data-testid (test selectors, très stables) */
  if (el.getAttribute('data-cy')) selectors.push('[data-cy="' + el.getAttribute('data-cy') + '"]');
  if (el.getAttribute('data-testid')) selectors.push('[data-testid="' + el.getAttribute('data-testid') + '"]');

  /* 5. Placeholder (stable pour les champs de saisie) */
  if (el.placeholder && el.placeholder.length < 60) {
    selectors.push(tag + '[placeholder="' + el.placeholder.replace(/"/g, '\\"') + '"]');
  }

  /* 6. Label associé via for= (sélecteur basé sur le label visible) */
  var lbl = el.id ? document.querySelector('label[for="' + CSS.escape(el.id) + '"]') : null;
  if (!lbl && el.closest) {
    lbl = el.closest("label");
  }
  if (lbl && lbl.textContent) {
    var lblText = lbl.textContent.trim().slice(0, 40);
    if (lblText && el.id) {
      selectors.push(tag + '#' + CSS.escape(el.id));
    }
  }

  /* 7. role + type (pour les boutons et contrôles) */
  var role = el.getAttribute("role");
  if (role && el.type) {
    selectors.push(tag + '[role="' + role + '"][type="' + el.type + '"]');
  } else if (el.type && el.type !== "text") {
    selectors.push(tag + '[type="' + el.type + '"]');
  }

  /* 8. Suffixe d'ID (utile quand l'ID est généré mais a un suffixe stable) */
  if (el.id && el.id.length >= 8) {
    selectors.push(tag + '[id$="' + el.id.slice(-8) + '"]');
  }

  /* 9. Combinaison form + name (si dans un formulaire nommé) */
  var form = el.closest ? el.closest("form") : null;
  if (form && el.name) {
    if (form.id) {
      selectors.push('#' + CSS.escape(form.id) + ' ' + tag + '[name="' + el.name + '"]');
    } else if (form.getAttribute("action")) {
      selectors.push('form[action="' + form.getAttribute("action") + '"] ' + tag + '[name="' + el.name + '"]');
    }
  }

  /* 10. Fallback nth-child */
  var parent = el.parentElement;
  if (parent) {
    var siblings = Array.from(parent.children).filter(function(c) { return c.tagName === el.tagName; });
    if (siblings.length === 1) {
      selectors.push(_getParentSelector(parent) + ' > ' + tag);
    } else {
      var idx = siblings.indexOf(el) + 1;
      selectors.push(tag + ':nth-of-type(' + idx + ')');
    }
  }

  if (selectors.length === 0) selectors.push(tag);
  /* Dédupliquer */
  return selectors.filter(function(s, i, arr) { return arr.indexOf(s) === i; });
}

/* Helper : sélecteur court pour le parent (contexte du fallback nth-child) */
function _getParentSelector(parent) {
  if (parent.id) return '#' + CSS.escape(parent.id);
  if (parent.className && typeof parent.className === 'string') {
    var cls = parent.className.trim().split(/\s+/).filter(function(c) {
      return c.length > 2 && c.length < 30 && !c.match(/^(ng-|mat-|v-|cdk-|css-)/);
    });
    if (cls.length > 0) return parent.tagName.toLowerCase() + '.' + cls[0];
  }
  return parent.tagName.toLowerCase();
}

/* Trouve un élément en essayant les sélecteurs dans l'ordre, avec fallback iframes + shadow DOM */
export async function findElementBySelectors(selectors, timeout) {
  var selectorList = Array.isArray(selectors) ? selectors : [selectors];

  /* Premier pass rapide : essayer tous les sélecteurs immédiatement */
  for (var i = 0; i < selectorList.length; i++) {
    var el = findElement(selectorList[i]);
    if (el) return el;
  }

  /* Deuxième pass : attendre avec MutationObserver pour le premier sélecteur */
  var found = await waitForElement(selectorList[0], timeout);
  if (found) return found;

  /* Troisième pass : attendre brièvement les autres sélecteurs */
  for (var j = 1; j < selectorList.length; j++) {
    var el2 = await waitForElement(selectorList[j], 500);
    if (el2) return el2;
  }

  return null;
}
