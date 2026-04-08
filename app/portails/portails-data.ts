/* ── Portails data ── */

export function getFaviconUrl(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

/* ── Types ── */
export type RecorderStatus = "Disponible" | "Enregistrez-le" | "Enregistr\u00e9";

export interface Portail {
  name: string;
  url: string;
  favicon: string;
  recorder: RecorderStatus;
}

/* ── Mutuelles ── */
export const mutuelles: Portail[] = [
  /* ── Hardcod\u00e9es ── */
  {
    name: "Almerys",
    url: "mutuelle-almerys.com",
    favicon: getFaviconUrl("mutuelle-almerys.com"),
    recorder: "Disponible",
  },
  {
    name: "Wemind",
    url: "pro.wemind.io",
    favicon: getFaviconUrl("wemind.io"),
    recorder: "Disponible",
  },
  {
    name: "G\u00e9n\u00e9ration",
    url: "professionnel.generation.fr",
    favicon: getFaviconUrl("generation.fr"),
    recorder: "Disponible",
  },
  {
    name: "Oxantis",
    url: "oxantis.net",
    favicon: getFaviconUrl("oxantis.net"),
    recorder: "Disponible",
  },
  {
    name: "TP Plus / Santeclair",
    url: "optique-tpplus.ffl-promoteur.com",
    favicon: getFaviconUrl("santeclair.fr"),
    recorder: "Disponible",
  },
  {
    name: "Viamedis",
    url: "pro.viamedis.net",
    favicon: getFaviconUrl("viamedis.net"),
    recorder: "Disponible",
  },
  {
    name: "Itelis",
    url: "pro.ism-tp.fr",
    favicon: getFaviconUrl("ism-tp.fr"),
    recorder: "Disponible",
  },
  {
    name: "SP Sant\u00e9",
    url: "spsante.fr",
    favicon: getFaviconUrl("spsante.fr"),
    recorder: "Disponible",
  },
  {
    name: "Solimut",
    url: "solimut.fr",
    favicon: getFaviconUrl("solimut.fr"),
    recorder: "Disponible",
  },
  {
    name: "APGIS",
    url: "espaceprofessionnel.apgis.com",
    favicon: getFaviconUrl("apgis.com"),
    recorder: "Disponible",
  },
  {
    name: "Actil (Kalixia)",
    url: "actil.com",
    favicon: getFaviconUrl("actil.com"),
    recorder: "Disponible",
  },
  {
    name: "Mercer",
    url: "mercernet.fr",
    favicon: getFaviconUrl("mercernet.fr"),
    recorder: "Disponible",
  },
  {
    name: "Ameli (CPAM)",
    url: "ameli.fr",
    favicon: getFaviconUrl("ameli.fr"),
    recorder: "Disponible",
  },
  /* ── Top mutuelles FR \u2014 Smart Fill + Recorder ── */
  {
    name: "Harmonie Mutuelle",
    url: "harmonie-mutuelle.fr",
    favicon: getFaviconUrl("harmonie-mutuelle.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "MGEN",
    url: "mgen.fr",
    favicon: getFaviconUrl("mgen.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Malakoff Humanis",
    url: "malakoffhumanis.com",
    favicon: getFaviconUrl("malakoffhumanis.com"),
    recorder: "Enregistrez-le",
  },
  {
    name: "AG2R La Mondiale",
    url: "ag2rlamondiale.fr",
    favicon: getFaviconUrl("ag2rlamondiale.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Groupama Sant\u00e9",
    url: "groupama.fr",
    favicon: getFaviconUrl("groupama.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Swiss Life",
    url: "swisslife.fr",
    favicon: getFaviconUrl("swisslife.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Carte Blanche Partenaires",
    url: "carte-blanche-partenaires.fr",
    favicon: getFaviconUrl("carte-blanche-partenaires.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Mutex",
    url: "mutex.fr",
    favicon: getFaviconUrl("mutex.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Apivia",
    url: "apivia.fr",
    favicon: getFaviconUrl("apivia.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Int\u00e9riale",
    url: "interiale.fr",
    favicon: getFaviconUrl("interiale.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "MAAF Sant\u00e9",
    url: "maaf.fr",
    favicon: getFaviconUrl("maaf.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "GMF",
    url: "gmf.fr",
    favicon: getFaviconUrl("gmf.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Mutuelle Nationale Territoriale",
    url: "mnt.fr",
    favicon: getFaviconUrl("mnt.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Mutuelle G\u00e9n\u00e9rale",
    url: "mutuellegenerale.fr",
    favicon: getFaviconUrl("mutuellegenerale.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Alptis",
    url: "alptis.org",
    favicon: getFaviconUrl("alptis.org"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Neoliane",
    url: "neoliane.fr",
    favicon: getFaviconUrl("neoliane.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "April Sant\u00e9",
    url: "april.fr",
    favicon: getFaviconUrl("april.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Eovi-MCD",
    url: "eovi-mcd.fr",
    favicon: getFaviconUrl("eovi-mcd.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Ociane Matmut",
    url: "ociane.fr",
    favicon: getFaviconUrl("ociane.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Henner",
    url: "henner.com",
    favicon: getFaviconUrl("henner.com"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Previfrance",
    url: "previfrance.fr",
    favicon: getFaviconUrl("previfrance.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Unipr\u00e9voyance",
    url: "uniprevoyance.fr",
    favicon: getFaviconUrl("uniprevoyance.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Coverlife",
    url: "coverlife.fr",
    favicon: getFaviconUrl("coverlife.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Vyv",
    url: "vyv.fr",
    favicon: getFaviconUrl("vyv.fr"),
    recorder: "Enregistrez-le",
  },
];

/* ── ERP Audio ── */
export const erps: Portail[] = [
  {
    name: "Auditdata (Manage/Measure)",
    url: "auditdata.com",
    favicon: getFaviconUrl("auditdata.com"),
    recorder: "Disponible",
  },
  {
    name: "Ameli Pro (SCOR)",
    url: "amelipro.ameli.fr",
    favicon: getFaviconUrl("ameli.fr"),
    recorder: "Disponible",
  },
  {
    name: "Noah System (HIMSA)",
    url: "himsa.com",
    favicon: getFaviconUrl("himsa.com"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Otosuite (Natus)",
    url: "natus.com",
    favicon: getFaviconUrl("natus.com"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Easyaudio",
    url: "easyaudio.fr",
    favicon: getFaviconUrl("easyaudio.fr"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Phonak Target",
    url: "phonak.com",
    favicon: getFaviconUrl("phonak.com"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Signia Connexx",
    url: "signia-pro.com",
    favicon: getFaviconUrl("signia-pro.com"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Oticon Genie 2",
    url: "oticon.com",
    favicon: getFaviconUrl("oticon.com"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Widex Compass GPS",
    url: "widex.pro",
    favicon: getFaviconUrl("widex.pro"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Starkey Inspire",
    url: "starkey.com",
    favicon: getFaviconUrl("starkey.com"),
    recorder: "Enregistrez-le",
  },
  {
    name: "ReSound Smart Fit",
    url: "resound.com",
    favicon: getFaviconUrl("resound.com"),
    recorder: "Enregistrez-le",
  },
  {
    name: "Unitron TrueFit",
    url: "unitron.com",
    favicon: getFaviconUrl("unitron.com"),
    recorder: "Enregistrez-le",
  },
];
