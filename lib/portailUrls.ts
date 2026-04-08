/** Mapping portail AudiBot → URL de soumission du portail mutuelle. */
export const PORTAIL_URLS: Record<string, string> = {
  ALMERYS: "https://www.be-almerys.com/espace-professionnels",
  VIAMEDIS: "https://pro.viamedis.net",
  WEMIND: "https://pro.wemind.io/p/accueil",
  ITELIS: "https://pro.ism-tp.fr",
  GENERATION: "https://www.generation.fr",
  SP_SANTE: "https://www.sp-sante.fr",
  SANTECLAIR: "https://www.santeclair.fr",
  KALIXIA: "https://www.kalixia.fr",
  CARTE_BLANCHE: "https://www.carte-blanche.com",
  OXANTIS: "https://www.oxantis.fr",
  SOLIMUT: "https://www.solimut.fr",
  KORELIO: "https://www.korelio.fr",
  SEVEANE: "https://www.seveane.fr",
};

/** Champs du formulaire → label lisible pour le bandeau de correction. */
export const FIELD_LABELS: Record<string, string> = {
  nss: "Numéro de sécurité sociale",
  rpps: "Numéro RPPS du prescripteur",
  dateOrdonnance: "Date de l'ordonnance",
  montant: "Montant",
  codeActe: "Code LPP / Code acte",
  numeroAdherent: "Numéro d'adhérent",
  dateNaissance: "Date de naissance",
  nom: "Nom du patient",
  prenom: "Prénom du patient",
};
