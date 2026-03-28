import type { EtapeRPA } from "@/types/parcours";

const VARIABLE_MAP: Record<string, string> = {
  "{{nss}}": "nss",
  "{{nom}}": "nom",
  "{{prenom}}": "capitalize(prenom)",
  "{{dateNaissance}}": "dob",
  "{{dateOrdonnance}}": "o.dateOrdonnance || ''",
  "{{numeroAdherent}}": "numAdherent",
  "{{organisme}}": "m.organisme || ''",
  "{{sphere_od}}": "(o.lunettesOD && o.lunettesOD.sphere) || ''",
  "{{sphere_og}}": "(o.lunettesOG && o.lunettesOG.sphere) || ''",
  "{{cylindre_od}}": "(o.lunettesOD && o.lunettesOD.cylindre) || ''",
  "{{cylindre_og}}": "(o.lunettesOG && o.lunettesOG.cylindre) || ''",
  "{{axe_od}}": "(o.lunettesOD && o.lunettesOD.axe) || ''",
  "{{axe_og}}": "(o.lunettesOG && o.lunettesOG.axe) || ''",
  "{{addition}}": "(o.lunettesOD && o.lunettesOD.addition) || ''",
};

function variableToExpr(variable: string): string {
  return VARIABLE_MAP[variable] || "''";
}

function selectorList(etape: EtapeRPA): string {
  /* Rétrocompatibilité : selectors[] ou selector string */
  const selectors: string[] =
    Array.isArray((etape as any).selectors) && (etape as any).selectors.length > 0
      ? (etape as any).selectors
      : [etape.selector].filter(Boolean) as string[];
  return selectors.map((s) => JSON.stringify(s)).join(", ");
}

export function generateHandler(parcours: {
  hostname: string;
  nom: string;
  etapes: EtapeRPA[];
}): string {
  const lines: string[] = [];

  for (const etape of parcours.etapes) {
    if (
      !etape.selector &&
      !(Array.isArray((etape as any).selectors) && (etape as any).selectors.length)
    )
      continue;

    const sel = selectorList(etape);

    if (etape.action === "fill" || etape.action === "select") {
      const valExpr = etape.variable ? variableToExpr(etape.variable) : "''";
      lines.push(`  ultraFill(findElement(${sel}), ${valExpr});`);
    } else if (etape.action === "click") {
      const idx = lines.length;
      lines.push(
        `  var _el_${idx} = findElement(${sel}); if (_el_${idx}) _el_${idx}.click();`,
      );
    } else if (etape.action === "wait") {
      const ms = (etape as any).timeout || 1000;
      lines.push(
        `  await new Promise(function(r) { setTimeout(r, ${ms}); });`,
      );
    }
  }

  const hostname = JSON.stringify(parcours.hostname);
  const nom = JSON.stringify(parcours.nom || parcours.hostname);

  return `  ${JSON.stringify(parcours.hostname)}: {
    name: ${nom},
    isMatch: function() { return window.location.hostname.includes(${hostname}); },
    actions: {
      formulaire: function(data) {
        var m = data.m || {};
        var o = data.o || {};
        var c = data.cached || {};
        var personnes = m.personnes || [];
        var p0 = personnes.length > 0 ? personnes[0] : {};
        var nom = ((m.nom || (p0 && p0.nom) || o.nomPatient || c.nom || "")).toUpperCase();
        var prenom = m.prenom || (p0 && p0.prenom) || o.prenomPatient || "";
        var nss = getOuvrantDroitNSS(m.numeroSecuriteSociale || "", m.dateNaissance || "", personnes);
        var dob = m.dateNaissance || (p0 && p0.dateNaissance) || o.dateNaissancePatient || c.dob || "";
        var numAdherent = m.numeroAdherent || "";
        var filled = false;
${lines.map((l) => "  " + l).join("\n")}
        return filled || ${lines.length > 0};
      },
      synchroniser: async function() { return false; }
    }
  }`;
}
