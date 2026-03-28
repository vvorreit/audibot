/* ── Learning signal ────────────────────────────────────────────────────── */

export function markFilledByOptiBot(el, variable) {
  el.setAttribute("data-optibot-filled", variable);
  el.setAttribute("data-optibot-value", el.value);
}

export async function sendLearningSignal(signal) {
  var syncToken = await getSyncToken();
  if (!syncToken) return;
  fetch("https://optibot.fr/api/extension/smart-fill/learn", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ syncToken: syncToken, hostname: signal.hostname, selector: signal.selector, label: signal.label, oldVariable: signal.oldVariable, correctVariable: signal.correctVariable })
  }).catch(function(err) { console.warn("[OptiBot] learning signal failed:", err); });
}
