/* ── Format Utility Functions & Constants ───────────────────────────────── */

export function capitalize(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/* Normalise un numéro de téléphone en 10 chiffres français :
   +33612345678 → 0612345678 | 0033612345678 → 0612345678
   Supprime tout ce qui dépasse 10 chiffres. Retourne "" si < 10 chiffres. */
export function normalizePhone(raw) {
  if (!raw) return "";
  var s = String(raw).replace(/[\s.\-()]/g, "");
  if (s.startsWith("+33")) s = "0" + s.slice(3);
  else if (s.startsWith("0033")) s = "0" + s.slice(4);
  s = s.replace(/\D/g, "");
  if (s.length > 10) s = s.slice(0, 10);
  return s.length === 10 ? s : "";
}

export function detectOpticalFormat(el) {
  var ph = (el.placeholder || "").trim();
  if (/,/.test(ph)) return "comma";
  if (/^\d/.test(ph)) return "no_plus";
  return "default";
}

export function formatOpticalValue(value, el) {
  var fmt = detectOpticalFormat(el);
  if (OPTICAL_FORMATTERS[fmt]) return OPTICAL_FORMATTERS[fmt](String(value));
  return String(value);
}

/* ── Value Normalizers — formatage adapté au champ cible ──────────────── */
export var VALUE_NORMALIZERS = {
  numeroSecuriteSociale: function(v, el) {
    var raw = v.replace(/\D/g, "");
    var maxlen = parseInt(el.getAttribute("maxlength") || "15");
    var ph = (el.placeholder || "");
    if (maxlen >= 19 || /\d\s\d/.test(ph)) {
      var d = raw;
      return (d[0]||"")+" "+(d.slice(1,3)||"")+" "+(d.slice(3,5)||"")+" "+(d.slice(5,7)||"")+" "+(d.slice(7,10)||"")+" "+(d.slice(10,13)||"")+(raw.length>=15?" "+d.slice(13,15):"");
    }
    if (maxlen === 13) return raw.slice(0,13);
    return raw.slice(0,15);
  },
  telephone: function(v, el) {
    var raw = v.replace(/\D/g, "");
    var ph = el.placeholder || "";
    if (/\d{2}\s/.test(ph)) return raw.slice(0,2)+" "+raw.slice(2,4)+" "+raw.slice(4,6)+" "+raw.slice(6,8)+" "+raw.slice(8,10);
    return raw.slice(0,10);
  }
};

/* ── OPTICAL_FORMATTERS — corrections optiques ─────────────────────────── */
export var OPTICAL_FORMATTERS = {
  comma: function(v) { return v.replace(".", ","); },
  no_plus: function(v) { return v.replace(/^\+/, ""); },
  absolute: function(v) { return v.replace(/^[+-]/, ""); }
};

/* Champs optiques à formatter */
export var OPTICAL_FIELD_KEYS = [
  "lunettesOD.sphere", "lunettesOD.cylindre", "lunettesOD.axe", "lunettesOD.addition",
  "lunettesOG.sphere", "lunettesOG.cylindre", "lunettesOG.axe", "lunettesOG.addition",
  "lentillesOD.sphere", "lentillesOD.cylindre", "lentillesOD.axe", "lentillesOD.addition",
  "lentillesOG.sphere", "lentillesOG.cylindre", "lentillesOG.axe", "lentillesOG.addition"
];

/* Normalise une date vers DD/MM/YYYY (pour affichage) et YYYY-MM-DD (pour input[type=date]) */
export function normalizeDateValue(raw) {
  if (!raw) return { display: raw, iso: raw };
  var d = String(raw).replace(/\D/g, "");
  var dd, mm, yyyy;
  /* Priorité 1 : déjà DD/MM/YYYY → ne pas re-parser */
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
    var p2 = raw.split("/"); dd = p2[0]; mm = p2[1]; yyyy = p2[2];
  /* Priorité 2 : ISO YYYY-MM-DD */
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    var p = raw.split("-"); yyyy = p[0]; mm = p[1]; dd = p[2];
  /* Priorité 3 : 8 chiffres bruts */
  } else if (d.length === 8) {
    if (parseInt(d.slice(0, 4)) > 1900) {
      yyyy = d.slice(0, 4); mm = d.slice(4, 6); dd = d.slice(6, 8);
    } else {
      dd = d.slice(0, 2); mm = d.slice(2, 4); yyyy = d.slice(4, 8);
    }
  } else {
    return { display: raw, iso: raw };
  }
  return {
    display: dd + "/" + mm + "/" + yyyy,
    iso: yyyy + "-" + mm + "-" + dd,
    dd: dd, mm: mm, yyyy: yyyy
  };
}

/* Vérifie si un champ a été rempli avec succès */
export function fieldHasValue(el, expected) {
  var val = String(el.value || "").trim();
  var exp = String(expected || "").trim();
  return val !== "" && (val === exp || val.replace(/\D/g, "") === exp.replace(/\D/g, ""));
}
