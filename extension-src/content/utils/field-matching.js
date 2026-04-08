/* ── Field Matching Utility Functions ───────────────────────────────────── */

import { SMART_FILL_ALIASES, SMART_FILL_BLACKLIST } from "./data.js";

/* ── Learned weights for score recalibration (V3-3) ────────────────────── */
var _learnedWeights = null;

export function loadLearnedWeights() {
  var hostname = window.location.hostname;
  chrome.storage.local.get(["audibot_learned_weights"], function(result) {
    var cached = result.audibot_learned_weights;
    if (cached && cached.ts && Date.now() - cached.ts < 3600000) {
      _learnedWeights = cached.weights || {};
      return;
    }
    /* Fetch fresh weights from backend */
    if (typeof getSyncToken === "function") {
      getSyncToken().then(function(token) {
        if (!token) return;
        fetch("https://audibot.fr/api/extension/smart-fill/weights?hostname=" + encodeURIComponent(hostname), {
          headers: { "Authorization": "Bearer " + token }
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
          _learnedWeights = data.weights || {};
          chrome.storage.local.set({ audibot_learned_weights: { weights: _learnedWeights, ts: Date.now() } });
        })
        .catch(function(err) { console.warn("[AudiBot] learned weights fetch failed:", err); });
      });
    }
  });
}

/* ── Pre-cached label map (populated by preCacheLabelMap) ──────────────── */
var _labelMap = null;

export function preCacheLabelMap() {
  _labelMap = {};
  var labels = document.querySelectorAll("label[for]");
  for (var i = 0; i < labels.length; i++) {
    var forId = labels[i].getAttribute("for");
    if (forId) _labelMap[forId] = labels[i].textContent.trim();
  }
}

/* ── Levenshtein distance (with memoization) ───────────────────────────── */
var _levenshteinCache = {};

export function clearMatchingCache() {
  _levenshteinCache = {};
  _labelMap = null;
}

export function levenshtein(a, b) {
  var key = a + "\0" + b;
  if (_levenshteinCache[key] !== undefined) return _levenshteinCache[key];
  if (!a) { _levenshteinCache[key] = (b || "").length; return _levenshteinCache[key]; }
  if (!b) { _levenshteinCache[key] = a.length; return _levenshteinCache[key]; }
  var m = a.length, n = b.length;
  var dp = [];
  for (var i = 0; i <= m; i++) {
    dp[i] = [i];
    for (var j = 1; j <= n; j++) {
      dp[i][j] = i === 0 ? j : 0;
    }
  }
  for (var i2 = 1; i2 <= m; i2++) {
    for (var j2 = 1; j2 <= n; j2++) {
      if (a[i2 - 1] === b[j2 - 1]) {
        dp[i2][j2] = dp[i2 - 1][j2 - 1];
      } else {
        dp[i2][j2] = 1 + Math.min(dp[i2 - 1][j2], dp[i2][j2 - 1], dp[i2 - 1][j2 - 1]);
      }
    }
  }
  _levenshteinCache[key] = dp[m][n];
  return dp[m][n];
}

/* ── Label extraction ───────────────────────────────────────────────────── */
export function getFieldLabel(el) {
  if (!el) return "";
  /* Use pre-cached label map if available */
  if (_labelMap && el.id && _labelMap[el.id]) return _labelMap[el.id];
  var rootNode = el.getRootNode ? el.getRootNode() : document;
  if (el.id) {
    var lbl = rootNode.querySelector('label[for="' + el.id + '"]');
    if (lbl && lbl.textContent.trim()) return lbl.textContent.trim();
  }
  var ariaLabel = el.getAttribute("aria-label");
  if (ariaLabel) return ariaLabel.trim();
  var ariaLabelledby = el.getAttribute("aria-labelledby");
  if (ariaLabelledby) {
    var refEl = rootNode.getElementById ? rootNode.getElementById(ariaLabelledby) : document.getElementById(ariaLabelledby);
    if (refEl && refEl.textContent.trim()) return refEl.textContent.trim();
  }
  if (el.placeholder) return el.placeholder.trim();
  if (el.closest) {
    var group = el.closest(".form-group, .field, .form-field, .mat-form-field, mat-form-field");
    if (group) {
      var groupLabel = group.querySelector("label, mat-label, .mat-label, legend");
      if (groupLabel && groupLabel.textContent.trim()) return groupLabel.textContent.trim();
    }
  }
  var parent = el.parentElement;
  if (parent && parent.tagName === "TD") {
    var prevTd = parent.previousElementSibling;
    if (prevTd && prevTd.tagName === "TD" && prevTd.textContent.trim()) return prevTd.textContent.trim();
  }
  return "";
}

export function normalizeLabel(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

/* Normalise un string pour la comparaison : minuscules, sans accents, sans espaces/tirets */
export function normalizeAlias(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    /* Supprimer les marqueurs obligatoires (*), ponctuation et parenthèses */
    .replace(/[*:()\[\]{}#°'"!?]/g, "")
    .replace(/[\s\-_\.\/]/g, "");
}

/* ── Score-based field matching ─────────────────────────────────────────── */
export function scoreFieldMatch(el, aliasKey, aliases) {
  var elId = normalizeAlias(el.id || "");
  var elName = normalizeAlias(el.name || "");
  var elLabel = normalizeAlias(getFieldLabel(el));
  var elPlaceholder = normalizeAlias(el.placeholder || "");
  var elTestId = normalizeAlias(el.getAttribute("data-testid") || el.getAttribute("data-cy") || el.getAttribute("data-qa") || "");
  var maxScore = 0;
  for (var i = 0; i < aliases.length; i++) {
    var alias = normalizeAlias(aliases[i]);
    if (!alias) continue;
    if (elId && elId === alias) return 100;
    if (elName && elName === alias) { maxScore = Math.max(maxScore, 90); continue; }
    if (elLabel && elLabel === alias) { maxScore = Math.max(maxScore, 85); continue; }
    if (elTestId && elTestId === alias) { maxScore = Math.max(maxScore, 85); continue; }
    if (elId && elId.indexOf(alias) !== -1) { maxScore = Math.max(maxScore, 70); }
    if (elName && elName.indexOf(alias) !== -1) { maxScore = Math.max(maxScore, 65); }
    if (elLabel && elLabel.indexOf(alias) !== -1) { maxScore = Math.max(maxScore, 60); }
    if (elTestId && elTestId.indexOf(alias) !== -1) { maxScore = Math.max(maxScore, 60); }
    if (elPlaceholder && elPlaceholder.indexOf(alias) !== -1) { maxScore = Math.max(maxScore, 55); }
    if (elId && levenshtein(elId, alias) <= 2) { maxScore = Math.max(maxScore, 50); }
    if (elName && levenshtein(elName, alias) <= 2) { maxScore = Math.max(maxScore, 45); }
    if (elLabel && levenshtein(elLabel, alias) <= 2) { maxScore = Math.max(maxScore, 40); }
  }
  /* V3-3: apply learned weight adjustment */
  if (_learnedWeights && _learnedWeights[aliasKey]) {
    maxScore = Math.round(maxScore * (_learnedWeights[aliasKey].multiplier || 1));
  }
  return maxScore;
}

export function matchSmartField(el) {
  /* ── Blacklist — jamais remplir ces champs ── */
  var fcnRaw = el.getAttribute("formcontrolname") || el.getAttribute("ng-reflect-name") || el.name || "";
  if (fcnRaw && SMART_FILL_BLACKLIST.indexOf(fcnRaw.toLowerCase()) !== -1) return null;

  /* ── Collecte des sources de signal ── */
  var attrs = [
    el.name,
    el.id,
    el.placeholder,
    el.getAttribute("aria-label"),
    el.getAttribute("data-field"),
    el.getAttribute("data-name"),
    el.getAttribute("data-label"),
    el.getAttribute("data-testid"),
    el.getAttribute("data-cy"),
    /* Angular Material / Reactive Forms */
    el.getAttribute("formcontrolname"),
    el.getAttribute("ng-reflect-name"),
    el.getAttribute("ng-reflect-placeholder"),
    el.getAttribute("data-mat-input"),
    /* Vue */
    el.getAttribute("v-model"),
    el.getAttribute(":name"),
    /* Classes CSS — filtrer les classes framework sans valeur sémantique */
    ...(el.className || "").split(/\s+/).filter(function(cls) {
      if (!cls) return false;
      /* Exclure classes Bootstrap, Angular Material, Tailwind, ng-*, mat-* */
      if (/^(form-control|input-|col-|row|ng-|mat-|mdc-|v-|vue-|ant-|el-|p-|btn|badge|text-|bg-|border-|shadow-|rounded|flex|grid|hidden|block|inline|container|wrapper|field|group|control|dirty|pristine|valid|invalid|touched|untouched|required|disabled|readonly)/.test(cls)) return false;
      /* Garder seulement les classes qui ressemblent à des noms de champs */
      return cls.length > 2 && cls.length < 40;
    }),
  ];

  /* ── Label via for= ── */
  var labelEl = el.id ? document.querySelector('label[for="' + CSS.escape(el.id) + '"]') : null;

  /* ── aria-labelledby (peut pointer vers plusieurs ids) ── */
  if (!labelEl) {
    var labelledby = el.getAttribute("aria-labelledby");
    if (labelledby) {
      var labelText = labelledby.split(/\s+/).map(function(id) {
        var ref = document.getElementById(id);
        return ref ? ref.textContent.trim() : "";
      }).filter(Boolean).join(" ");
      if (labelText) attrs.push(labelText);
    }
  }

  /* ── Angular Material mat-form-field ── */
  if (!labelEl && el.closest) {
    var matField = el.closest("mat-form-field, .mat-form-field, .mat-mdc-form-field");
    if (matField) {
      var matLabel = matField.querySelector("mat-label, label, .mat-label, .mat-mdc-floating-label");
      if (matLabel) labelEl = matLabel;
    }
  }

  /* ── Label parent direct ou sibling précédent ── */
  if (!labelEl && el.closest) {
    labelEl = el.closest("label");
    if (!labelEl && el.parentElement) {
      labelEl = el.parentElement.querySelector("label");
    }
  }

  /* ── Sibling précédent (label/span/div adjacent dans le DOM) ── */
  if (!labelEl) {
    var prev = el.previousElementSibling;
    if (prev && /^(label|span|div|p|th|td|dt|legend)$/i.test(prev.tagName) && prev.textContent.trim().length < 60) {
      attrs.push(prev.textContent.trim());
    }
  }

  /* ── Cellule de tableau précédente (vieux portails type Almerys/Viamedis) ── */
  if (!labelEl) {
    var td = el.closest("td");
    if (td) {
      var prevTd = td.previousElementSibling;
      if (prevTd) attrs.push(prevTd.textContent.trim());
    }
  }

  /* ── <legend> du fieldset parent ── */
  if (!labelEl && el.closest) {
    var fieldset = el.closest("fieldset");
    if (fieldset) {
      var legend = fieldset.querySelector("legend");
      if (legend) attrs.push(legend.textContent.trim());
    }
  }

  /* ── <th> de la ligne (tableaux de formulaires) ── */
  if (!labelEl) {
    var tr = el.closest && el.closest("tr");
    if (tr) {
      var th = tr.querySelector("th");
      if (th) attrs.push(th.textContent.trim());
    }
  }

  if (labelEl) attrs.push(labelEl.textContent.trim());

  /* ── Matching ── */
  var attrValues = attrs.filter(Boolean);
  var normalizedAll = attrValues.map(normalizeAlias).join(" ");
  if (!normalizedAll.trim()) return null;

  for (var field in SMART_FILL_ALIASES) {
    var aliases = SMART_FILL_ALIASES[field];
    for (var i = 0; i < aliases.length; i++) {
      var alias = normalizeAlias(aliases[i]);
      if (!alias) continue;
      /* Exact match sur un attribut individuel */
      var exactMatch = attrValues.some(function(a) { return normalizeAlias(a) === alias; });
      /* Partial match délimité (évite "nom" dans "prenom") */
      var partialMatch = false;
      if (!exactMatch) {
        var re = new RegExp("(^|[\\s_\\-])" + alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([\\s_\\-]|$)");
        partialMatch = re.test(normalizedAll);
      }
      if (exactMatch) return { field: field, confidence: "certain" };
      if (partialMatch) return { field: field, confidence: "probable" };
    }
  }
  return null;
}
