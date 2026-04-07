/* ── Page Context & Visible Fields Detection ───────────────────────────── */
/* Exports: detectPageContext, getVisibleFields. ~35 lignes */

/* ── Page context detection ─────────────────────────────────────────────── */
export function detectPageContext() {
  var text = (window.location.href + " " + document.title + " " + ((document.querySelector("h1,h2")||{}).textContent||"")).toLowerCase();
  if (/login|connexion|signin|mot.de.passe/.test(text)) return "login";
  if (/recherche|search/.test(text)) return "search";
  if (/beneficiaire|adherent/.test(text)) return "beneficiaire";
  if (/prise.en.charge|pec|demande/.test(text)) return "pec";
  if (/devis|cotation/.test(text)) return "devis";
  return "unknown";
}

/* ── Visible fields detection ───────────────────────────────────────────── */
export function getVisibleFields() {
  var selector = "input:not([type=hidden]), select, textarea";
  var fields = Array.from(document.querySelectorAll(selector));
  /* Inclure les champs dans les iframes accessibles */
  var iframes = document.querySelectorAll("iframe");
  for (var i = 0; i < iframes.length; i++) {
    try {
      var iDoc = iframes[i].contentDocument || (iframes[i].contentWindow && iframes[i].contentWindow.document);
      if (iDoc) fields = fields.concat(Array.from(iDoc.querySelectorAll(selector)));
    } catch(e) {}
  }
  return fields.filter(function(el) {
    try {
      var cs = (el.ownerDocument.defaultView || window).getComputedStyle(el);
      return cs.display !== "none" && cs.visibility !== "hidden" && cs.opacity !== "0"
        && !el.disabled && !el.readOnly && el.getBoundingClientRect().height > 0;
    } catch(e) { return false; }
  });
}
