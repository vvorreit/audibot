/* AudiBot Command Center — Mini dashboard flottant sur les portails */
/* Injecte via Shadow DOM pour isolation CSS complete */

var CC_STORAGE_KEY = "audibot_cc_state";

function createCommandCenter() {
  if (document.getElementById("audibot-command-center")) return;

  var host = document.createElement("div");
  host.id = "audibot-command-center";
  host.style.cssText = "position:fixed;z-index:2147483647;";
  document.body.appendChild(host);

  var shadow = host.attachShadow({ mode: "closed" });

  var style = document.createElement("style");
  style.textContent = getCommandCenterCSS();
  shadow.appendChild(style);

  var container = document.createElement("div");
  container.className = "cc-container";
  shadow.appendChild(container);

  /* Charger la position et le mode sauvegardes */
  chrome.storage.local.get([CC_STORAGE_KEY], function(result) {
    var state = result[CC_STORAGE_KEY] || {};
    var x = state.x != null ? state.x : window.innerWidth - 360;
    var y = state.y != null ? state.y : 80;
    host.style.left = Math.max(0, Math.min(x, window.innerWidth - 50)) + "px";
    host.style.top = Math.max(0, Math.min(y, window.innerHeight - 50)) + "px";

    /* mode: "minimized", "collapsed", "expanded" */
    var mode = state.mode || "collapsed";
    renderCommandCenter(shadow, container, host, mode);
  });

  /* SSE Event Listener — re-render on cache update from background */
  chrome.runtime.onMessage.addListener(function(message) {
    if (message && message.type === "AUDIBOT_SSE_EVENT") {
      readEncryptedCache().then(function() {
        /* Determine current mode from storage before re-rendering */
        chrome.storage.local.get([CC_STORAGE_KEY], function(result) {
          var state = result[CC_STORAGE_KEY] || {};
          var mode = state.mode || "collapsed";
          renderCommandCenter(shadow, container, host, mode);

          /* Flash the status dot green briefly */
          flashStatusDot(shadow);
        });
      });
    }
  });
}

function flashStatusDot(shadow) {
  var dot = shadow.querySelector(".cc-status-dot");
  if (!dot) {
    dot = shadow.querySelector(".cc-mini-dot");
  }
  if (dot) {
    dot.style.background = "#10b981";
    dot.style.boxShadow = "0 0 8px #10b981";
    dot.classList.add("cc-dot-flash");
    setTimeout(function() {
      dot.classList.remove("cc-dot-flash");
      dot.style.boxShadow = "";
    }, 1500);
  }
}

function getStatusColor(data) {
  if (!data || !data.nom) return "#ef4444";
  var hasNss = !!(data.nss || data.numeroSecuriteSociale);
  if (data.nom && hasNss) return "#10b981";
  return "#f59e0b";
}

function renderCommandCenter(shadow, container, host, mode) {
  readEncryptedCache().then(function(cache) {
    var data = cache && cache.current ? cache.current : null;
    var statusColor = getStatusColor(data);
    container.innerHTML = "";

    if (mode === "minimized") {
      renderMiniButton(shadow, container, host, statusColor);
      return;
    }

    var collapsed = (mode === "collapsed");

    /* Header */
    var header = document.createElement("div");
    header.className = "cc-header";

    var logoWrap = document.createElement("span");
    logoWrap.className = "cc-logo-wrap";

    var logoText = document.createElement("span");
    logoText.className = "cc-logo";
    logoText.textContent = "AudiBot";
    logoWrap.appendChild(logoText);

    /* Status dot */
    var statusDot = document.createElement("span");
    statusDot.className = "cc-status-dot";
    if (statusColor === "#10b981") {
      statusDot.classList.add("cc-dot-pulse");
    }
    statusDot.style.background = statusColor;
    logoWrap.appendChild(statusDot);

    header.appendChild(logoWrap);

    /* Drag handle */
    makeDraggable(host, header);

    /* Header buttons wrapper */
    var headerBtns = document.createElement("span");
    headerBtns.className = "cc-header-btns";

    /* Minimize button */
    var minBtn = document.createElement("button");
    minBtn.className = "cc-btn-toggle cc-btn-minimize";
    minBtn.innerHTML = "&#x2500;";
    minBtn.title = "Minimiser";
    minBtn.onclick = function(e) {
      e.stopPropagation();
      saveState(host, "minimized");
      renderCommandCenter(shadow, container, host, "minimized");
    };
    headerBtns.appendChild(minBtn);

    /* Toggle button */
    var toggleBtn = document.createElement("button");
    toggleBtn.className = "cc-btn-toggle";
    toggleBtn.innerHTML = collapsed ? "&#x25BC;" : "&#x25B2;";
    toggleBtn.title = collapsed ? "Ouvrir" : "Reduire";
    toggleBtn.onclick = function(e) {
      e.stopPropagation();
      var newMode = collapsed ? "expanded" : "collapsed";
      saveState(host, newMode);
      renderCommandCenter(shadow, container, host, newMode);
    };
    headerBtns.appendChild(toggleBtn);

    header.appendChild(headerBtns);
    container.appendChild(header);

    if (collapsed) return;

    if (!data || !data.nom) {
      var empty = document.createElement("div");
      empty.className = "cc-empty";
      empty.textContent = "Aucune donnee patient. Scannez un document depuis le dashboard AudiBot.";
      container.appendChild(empty);
      return;
    }

    /* Etat Civil */
    addSection(container, "Etat Civil", [
      { label: "Nom", value: (data.nom || "").toUpperCase() },
      { label: "Prenom", value: data.prenom || "" },
      { label: "Date naissance", value: data.dateNaissance || data.dob || "" },
      { label: "NSS", value: data.numeroSecuriteSociale || data.nss || "" },
    ]);

    /* Mutuelle */
    addSection(container, "Mutuelle", [
      { label: "Organisme", value: data.organisme || "" },
      { label: "N. Adherent", value: data.numeroAdherent || "" },
      { label: "N. AMC", value: data.numeroAMC || "" },
      { label: "N. Teletrans.", value: data.numeroTeletransmission || "" },
      { label: "Type Conv.", value: data.typeConv || "" },
      { label: "Validite", value: (data.dateDebutValidite || "") + (data.dateFinValidite ? " - " + data.dateFinValidite : "") },
    ]);

    /* Ordonnance */
    var o = data.ordonnance || {};
    if (o.lunettesOD || o.lunettesOG || o.dateOrdonnance) {
      var ordoFields = [
        { label: "Date ordo.", value: o.dateOrdonnance || "" },
        { label: "DP", value: o.distancePupillaire || "" },
      ];
      if (o.lunettesOD) {
        var od = o.lunettesOD;
        ordoFields.push({ label: "OD", value: formatCorrection(od) });
      }
      if (o.lunettesOG) {
        var og = o.lunettesOG;
        ordoFields.push({ label: "OG", value: formatCorrection(og) });
      }
      if (o.lunettesOD && o.lunettesOD.addition) {
        ordoFields.push({ label: "Addition", value: o.lunettesOD.addition });
      }
      addSection(container, "Ordonnance", ordoFields);
    }

    /* Action buttons */
    var actions = document.createElement("div");
    actions.className = "cc-actions";

    var fillBtn = document.createElement("button");
    fillBtn.className = "cc-btn cc-btn-fill";
    fillBtn.textContent = "Remplir";
    fillBtn.onclick = function() {
      var pageBtn = document.getElementById("audibot-fill-btn");
      if (pageBtn) pageBtn.click();
    };
    actions.appendChild(fillBtn);

    var scanBtn = document.createElement("button");
    scanBtn.className = "cc-btn cc-btn-scan";
    scanBtn.textContent = "Rescanner";
    scanBtn.onclick = function() {
      chrome.runtime.sendMessage({ type: "AUDIBOT_OPEN_TAB", url: "https://audibot.fr/dashboard" });
    };
    actions.appendChild(scanBtn);

    container.appendChild(actions);
  }).catch(function() {
    container.innerHTML = '<div class="cc-empty">Erreur de lecture du cache.</div>';
  });
}

function renderMiniButton(shadow, container, host, statusColor) {
  container.className = "cc-container cc-minimized";

  var miniBtn = document.createElement("div");
  miniBtn.className = "cc-mini-btn";

  var miniLetter = document.createElement("span");
  miniLetter.className = "cc-mini-letter";
  miniLetter.textContent = "O";
  miniBtn.appendChild(miniLetter);

  /* Status badge on mini button */
  var miniBadge = document.createElement("span");
  miniBadge.className = "cc-mini-dot";
  if (statusColor === "#10b981") {
    miniBadge.classList.add("cc-dot-pulse");
  }
  miniBadge.style.background = statusColor;
  miniBtn.appendChild(miniBadge);

  /* Drag handle on mini button */
  makeDraggable(host, miniBtn);

  /* Click to expand to collapsed */
  miniBtn.addEventListener("click", function(e) {
    /* Ignore if this was a drag */
    if (miniBtn._wasDragged) {
      miniBtn._wasDragged = false;
      return;
    }
    e.stopPropagation();
    container.className = "cc-container";
    saveState(host, "collapsed");
    renderCommandCenter(shadow, container, host, "collapsed");
  });

  container.appendChild(miniBtn);
}

function addSection(container, title, fields) {
  var filteredFields = fields.filter(function(f) { return f.value; });
  if (filteredFields.length === 0) return;

  var section = document.createElement("div");
  section.className = "cc-section";

  var sTitle = document.createElement("div");
  sTitle.className = "cc-section-title";
  sTitle.textContent = title;
  section.appendChild(sTitle);

  filteredFields.forEach(function(field) {
    var row = document.createElement("div");
    row.className = "cc-field";

    var label = document.createElement("span");
    label.className = "cc-label";
    label.textContent = field.label;
    row.appendChild(label);

    var value = document.createElement("span");
    value.className = "cc-value";
    value.textContent = field.value;
    row.appendChild(value);

    var copyBtn = document.createElement("button");
    copyBtn.className = "cc-btn-copy";
    copyBtn.innerHTML = "&#x2398;";
    copyBtn.title = "Copier";
    copyBtn.onclick = function(e) {
      e.stopPropagation();
      navigator.clipboard.writeText(field.value).then(function() {
        copyBtn.innerHTML = "&#x2713;";
        copyBtn.style.color = "#10b981";
        setTimeout(function() {
          copyBtn.innerHTML = "&#x2398;";
          copyBtn.style.color = "";
        }, 1500);
      });
    };
    row.appendChild(copyBtn);

    section.appendChild(row);
  });

  container.appendChild(section);
}

function formatCorrection(c) {
  if (!c) return "";
  var parts = [];
  if (c.sphere) parts.push("Sph " + c.sphere);
  if (c.cylindre && c.cylindre !== "0" && c.cylindre !== "0.00") parts.push("Cyl " + c.cylindre);
  if (c.axe && c.axe !== "0") parts.push("Axe " + c.axe);
  if (c.addition) parts.push("Add " + c.addition);
  return parts.join("  ");
}

function makeDraggable(host, handle) {
  var startX, startY, origX, origY, dragging;
  handle.style.cursor = "grab";

  handle.addEventListener("mousedown", function(e) {
    e.preventDefault();
    startX = e.clientX;
    startY = e.clientY;
    origX = parseInt(host.style.left) || 0;
    origY = parseInt(host.style.top) || 0;
    dragging = false;
    handle.style.cursor = "grabbing";

    function onMove(e2) {
      var dx = e2.clientX - startX;
      var dy = e2.clientY - startY;
      if (!dragging && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
        dragging = true;
      }
      host.style.left = (origX + dx) + "px";
      host.style.top = (origY + dy) + "px";
    }

    function onUp() {
      handle.style.cursor = "grab";
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      if (dragging) {
        handle._wasDragged = true;
        saveState(host, null);
      }
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });
}

function saveState(host, mode) {
  var state = {
    x: parseInt(host.style.left) || 0,
    y: parseInt(host.style.top) || 0,
  };
  if (mode !== null) state.mode = mode;

  chrome.storage.local.get([CC_STORAGE_KEY], function(result) {
    var prev = result[CC_STORAGE_KEY] || {};
    var merged = Object.assign({}, prev, state);
    var obj = {};
    obj[CC_STORAGE_KEY] = merged;
    chrome.storage.local.set(obj);
  });
}

function getCommandCenterCSS() {
  return [
    /* Animations */
    "@keyframes audibotPulse {",
    "  0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }",
    "  70% { box-shadow: 0 0 0 6px rgba(16,185,129,0); }",
    "  100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }",
    "}",
    "@keyframes audibotFadeIn {",
    "  from { opacity: 0; transform: translateY(8px); }",
    "  to { opacity: 1; transform: translateY(0); }",
    "}",
    "@keyframes audibotDotFlash {",
    "  0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.7); }",
    "  50% { box-shadow: 0 0 12px 4px rgba(16,185,129,0.5); }",
    "  100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }",
    "}",

    /* Container */
    ".cc-container {",
    "  width: 320px;",
    "  background: #fff;",
    "  border: 1px solid #e2e8f0;",
    "  border-radius: 16px;",
    "  box-shadow: 0 8px 30px rgba(0,0,0,0.12);",
    "  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;",
    "  font-size: 12px;",
    "  color: #1e293b;",
    "  overflow: hidden;",
    "  user-select: none;",
    "  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);",
    "  animation: audibotFadeIn 0.3s ease-out;",
    "}",

    /* Minimized container */
    ".cc-container.cc-minimized {",
    "  width: 40px;",
    "  height: 40px;",
    "  border: none;",
    "  border-radius: 50%;",
    "  background: transparent;",
    "  box-shadow: none;",
    "  overflow: visible;",
    "}",

    /* Mini button */
    ".cc-mini-btn {",
    "  position: relative;",
    "  width: 40px;",
    "  height: 40px;",
    "  border-radius: 50%;",
    "  background: #2563eb;",
    "  display: flex;",
    "  align-items: center;",
    "  justify-content: center;",
    "  cursor: pointer;",
    "  box-shadow: 0 4px 14px rgba(37,99,235,0.4);",
    "  transition: box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);",
    "  animation: audibotFadeIn 0.3s ease-out;",
    "}",
    ".cc-mini-btn:hover {",
    "  box-shadow: 0 6px 20px rgba(37,99,235,0.55);",
    "  transform: scale(1.08);",
    "}",
    ".cc-mini-letter {",
    "  color: #fff;",
    "  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;",
    "  font-size: 18px;",
    "  font-weight: 800;",
    "  line-height: 1;",
    "  pointer-events: none;",
    "}",
    ".cc-mini-dot {",
    "  position: absolute;",
    "  top: -1px;",
    "  right: -1px;",
    "  width: 10px;",
    "  height: 10px;",
    "  border-radius: 50%;",
    "  border: 2px solid #fff;",
    "  pointer-events: none;",
    "}",

    /* Header */
    ".cc-header {",
    "  display: flex;",
    "  align-items: center;",
    "  justify-content: space-between;",
    "  padding: 10px 14px;",
    "  background: #1e293b;",
    "  color: #fff;",
    "}",
    ".cc-logo-wrap {",
    "  display: flex;",
    "  align-items: center;",
    "  gap: 8px;",
    "}",
    ".cc-logo {",
    "  font-weight: 800;",
    "  font-size: 13px;",
    "  letter-spacing: -0.3px;",
    "}",

    /* Status dot */
    ".cc-status-dot {",
    "  width: 8px;",
    "  height: 8px;",
    "  border-radius: 50%;",
    "  flex-shrink: 0;",
    "}",
    ".cc-dot-pulse {",
    "  animation: audibotPulse 2s infinite;",
    "}",
    ".cc-dot-flash {",
    "  animation: audibotDotFlash 1.5s ease-out !important;",
    "}",

    /* Header buttons */
    ".cc-header-btns {",
    "  display: flex;",
    "  align-items: center;",
    "  gap: 2px;",
    "}",
    ".cc-btn-toggle {",
    "  background: none;",
    "  border: none;",
    "  color: #94a3b8;",
    "  cursor: pointer;",
    "  font-size: 11px;",
    "  padding: 4px 8px;",
    "  border-radius: 6px;",
    "  transition: background 0.15s, color 0.15s;",
    "}",
    ".cc-btn-toggle:hover { background: rgba(255,255,255,0.1); color: #fff; }",
    ".cc-btn-minimize {",
    "  font-size: 14px;",
    "  line-height: 1;",
    "  padding: 4px 6px;",
    "}",

    /* Sections */
    ".cc-section { padding: 8px 14px; border-bottom: 1px solid #f1f5f9; }",
    ".cc-section-title {",
    "  font-size: 10px;",
    "  font-weight: 800;",
    "  text-transform: uppercase;",
    "  letter-spacing: 0.5px;",
    "  color: #94a3b8;",
    "  margin-bottom: 6px;",
    "}",
    ".cc-field {",
    "  display: flex;",
    "  align-items: center;",
    "  gap: 6px;",
    "  padding: 3px 0;",
    "}",
    ".cc-label {",
    "  font-size: 11px;",
    "  font-weight: 600;",
    "  color: #64748b;",
    "  min-width: 80px;",
    "  flex-shrink: 0;",
    "}",
    ".cc-value {",
    "  font-size: 12px;",
    "  font-weight: 700;",
    "  color: #1e293b;",
    "  flex: 1;",
    "  overflow: hidden;",
    "  text-overflow: ellipsis;",
    "  white-space: nowrap;",
    "}",
    ".cc-btn-copy {",
    "  background: none;",
    "  border: none;",
    "  cursor: pointer;",
    "  font-size: 13px;",
    "  color: #94a3b8;",
    "  padding: 2px 4px;",
    "  border-radius: 4px;",
    "  flex-shrink: 0;",
    "  transition: background 0.15s, color 0.15s;",
    "}",
    ".cc-btn-copy:hover { background: #f1f5f9; color: #3b82f6; }",

    /* Actions */
    ".cc-actions {",
    "  display: flex;",
    "  gap: 8px;",
    "  padding: 10px 14px;",
    "}",
    ".cc-btn {",
    "  flex: 1;",
    "  padding: 8px 12px;",
    "  border: none;",
    "  border-radius: 10px;",
    "  font-size: 12px;",
    "  font-weight: 700;",
    "  cursor: pointer;",
    "  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);",
    "}",
    ".cc-btn:hover {",
    "  transform: scale(1.03);",
    "  box-shadow: 0 4px 12px rgba(0,0,0,0.15);",
    "}",
    ".cc-btn-fill { background: #2563eb; color: #fff; }",
    ".cc-btn-fill:hover { background: #1d4ed8; }",
    ".cc-btn-scan { background: #f1f5f9; color: #475569; }",
    ".cc-btn-scan:hover { background: #e2e8f0; }",
    ".cc-empty {",
    "  padding: 20px 14px;",
    "  text-align: center;",
    "  color: #94a3b8;",
    "  font-size: 12px;",
    "  font-weight: 500;",
    "  line-height: 1.5;",
    "}",
  ].join("\n");
}

/* Expose pour l'import depuis content/index.js */
globalThis.createCommandCenter = createCommandCenter;
