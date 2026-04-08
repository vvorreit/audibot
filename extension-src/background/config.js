/* AudiBot — Config : domaines actifs + icone dynamique */

export var ACTIVE_DOMAINS = [
  /* Portails mutuelles TP (25) */
  "livebyoptimum.com",
  "almerys.com",
  "be-almerys.com",
  "viamedis.net",
  "ism-tp.fr",
  "actil.com",
  "mutuelle-optique.fr",
  "wemind.io",
  "apgis.com",
  "ameli.fr",
  "solimut.fr",
  "ffl-promoteur.com",
  "spsante.fr",
  "services-fm.net",
  "mercernet.fr",
  "oxantis.net",
  "santeclair.fr",
  "generation.fr",
  "carteblanchepartenaires.fr",
  "kalixia.fr",
  "kalixia-partenaires.fr",
  "optistya.fr",
  "groupama.com",
  "korelio.com",
  "seveane.com",
  "tp-harmonie.net",
  "tp-isante.fr",
  "tp-eovi-mcd.net",
  "mysanteclair.fr",
  "tpcomplementaire.fr",
  /* ERP opticiens */
  "igestion.fr",
  "optiflex.fr",
  "winoptics.fr",
  "irium-software.fr",
  "lyra-optique.fr",
];

export var INACTIVITY_MINUTES = 15;
export var API_BASE = "https://audibot.fr";

export function isActiveDomain(url) {
  try {
    var hostname = new URL(url).hostname;
    return ACTIVE_DOMAINS.some(function (d) { return hostname === d || hostname.endsWith("." + d); });
  } catch (e) {
    return false;
  }
}

export function drawIcon(size, color, callback) {
  var canvas = new OffscreenCanvas(size, size);
  var ctx = canvas.getContext("2d");

  /* Fond arrondi */
  var r = size * 0.2;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  /* Lettre O */
  ctx.fillStyle = "white";
  ctx.font = "bold " + Math.round(size * 0.55) + "px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("O", size / 2, size / 2 + size * 0.03);

  var imageData = ctx.getImageData(0, 0, size, size);
  callback(imageData);
}

export function updateIcon(tabId, url) {
  var active = isActiveDomain(url || "");
  var color = active ? "#2563eb" : "#94a3b8";

  var imageDataMap = {};
  var sizes = [16, 32];
  var done = 0;

  sizes.forEach(function (size) {
    drawIcon(size, color, function (imageData) {
      imageDataMap[size] = imageData;
      done++;
      if (done === sizes.length) {
        chrome.action.setIcon({ tabId: tabId, imageData: imageDataMap });
      }
    });
  });
}
