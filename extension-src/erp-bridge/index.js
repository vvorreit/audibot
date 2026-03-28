/* ── OptiBot — ERP Bridge ─────────────────────────────────────────────── */
/* Injecte dynamiquement sur l'URL ERP configuree par l'utilisateur.      */
/* Auto-detecte l'ERP et active l'adaptateur correspondant.               */
/*                                                                         */
/* ERP supportes : Cosium, I-Optics (Cegid), PVO (Ginkoia),              */
/*   IDM Optic (Axess), MyEasyOptic, WinOptics, Optimum (CIT),           */
/*   Osmose (Amonis), Acuitas 3 (Ocuco), Archimed                        */
/*   + adaptateur generique pour tout ERP non reconnu.                    */

import { detectAdapter } from "./adapters.js";
import { initBridge } from "./core.js";

/* ── Demarrage ─────────────────────────────────────────────────────────── */
var hostname = window.location.hostname.replace("www.", "");
var adapter = detectAdapter(hostname, document);

console.info("[OptiBot] ERP Bridge actif — adaptateur : " + adapter.displayName + " (" + adapter.name + ")");

initBridge(adapter);
