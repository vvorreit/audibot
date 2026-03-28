/* Pure functions extracted from extension modules for testing (no DOM/Chrome deps) */

export function normalizeAlias(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s\-_\.\/]/g, "");
}

export function levenshtein(a, b) {
  if (!a) return (b || "").length;
  if (!b) return a.length;
  var m = a.length, n = b.length;
  var dp = [];
  for (var i = 0; i <= m; i++) {
    dp[i] = [i];
    for (var j = 1; j <= n; j++) {
      dp[i][j] = i === 0 ? j : 0;
    }
  }
  for (var i = 1; i <= m; i++) {
    for (var j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

export function matchFieldAgainst(signals, aliasDict) {
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
  return { field: bestField, score: bestScore };
}
