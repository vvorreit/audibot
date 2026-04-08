/* ── OptiBot — ERP Bridge: Field matching ────────────────────────────── */
/* Matches DOM elements against alias dictionaries.                       */

import { normalizeAlias, collectSignals } from "./dom.js";

/* ══════════════════════════════════════════════════════════════════════
 *  FIELD MATCHING
 * ══════════════════════════════════════════════════════════════════════ */

export function matchFieldAgainst(el, aliasDict) {
  var signals = collectSignals(el);
  var normalizedSignals = signals.map(normalizeAlias).join(" ");

  var bestField = null;
  var bestScore = 0;

  for (var field in aliasDict) {
    var aliases = aliasDict[field];
    for (var a = 0; a < aliases.length; a++) {
      var norm = normalizeAlias(aliases[a]);
      if (normalizedSignals.indexOf(norm) !== -1) {
        var score = norm.length;
        if (score > bestScore) {
          bestScore = score;
          bestField = field;
        }
      }
    }
  }

  return bestField;
}
