CREATE TABLE IF NOT EXISTS "RejetGuidance" (
    "id" TEXT NOT NULL,
    "portail" TEXT NOT NULL,
    "codeErreur" TEXT,
    "motifPattern" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "actionType" TEXT NOT NULL DEFAULT 'info',
    "actionUrl" TEXT,
    "priorite" INTEGER NOT NULL DEFAULT 0,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RejetGuidance_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "RejetGuidance_portail_idx" ON "RejetGuidance"("portail");
CREATE INDEX IF NOT EXISTS "RejetGuidance_actif_idx" ON "RejetGuidance"("actif");

-- Seed: common rejection patterns with corrective guidance
INSERT INTO "RejetGuidance" ("id", "portail", "motifPattern", "titre", "description", "actionType", "priorite", "actif", "createdAt", "updatedAt")
VALUES
  ('rg_adherent_alm', 'ALMERYS', 'numero adherent', 'Numero d''adherent invalide', 'Le numero d''adherent saisi ne correspond pas aux donnees de la mutuelle. Rescannez la carte mutuelle du patient pour corriger automatiquement le numero.', 'rescan', 10, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('rg_adherent_via', 'VIAMEDIS', 'numero adherent', 'Numero d''adherent invalide', 'Le numero d''adherent saisi ne correspond pas aux donnees de la mutuelle. Rescannez la carte mutuelle du patient pour corriger automatiquement le numero.', 'rescan', 10, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('rg_adherent_ite', 'ITELIS', 'numero adherent', 'Numero d''adherent invalide', 'Le numero d''adherent saisi ne correspond pas aux donnees de la mutuelle. Rescannez la carte mutuelle du patient pour corriger automatiquement le numero.', 'rescan', 10, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('rg_adherent_kal', 'KALIXIA', 'numero adherent', 'Numero d''adherent invalide', 'Le numero d''adherent saisi ne correspond pas aux donnees de la mutuelle. Rescannez la carte mutuelle du patient pour corriger automatiquement le numero.', 'rescan', 10, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('rg_droits_alm', 'ALMERYS', 'droits', 'Droits du beneficiaire expires ou invalides', 'Les droits du beneficiaire ne sont plus actifs aupres de la mutuelle. Contactez la mutuelle pour verifier le statut des droits avant de renvoyer le dossier.', 'contact', 9, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('rg_droits_via', 'VIAMEDIS', 'droits', 'Droits du beneficiaire expires ou invalides', 'Les droits du beneficiaire ne sont plus actifs aupres de la mutuelle. Contactez la mutuelle pour verifier le statut des droits avant de renvoyer le dossier.', 'contact', 9, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('rg_doublon_alm', 'ALMERYS', 'doublon', 'Dossier en doublon', 'Ce dossier semble avoir deja ete soumis. Verifiez dans votre historique de dossiers si un envoi precedent existe pour ce patient et cette prestation.', 'info', 5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('rg_doublon_via', 'VIAMEDIS', 'doublon', 'Dossier en doublon', 'Ce dossier semble avoir deja ete soumis. Verifiez dans votre historique de dossiers si un envoi precedent existe pour ce patient et cette prestation.', 'info', 5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('rg_piece_alm', 'ALMERYS', 'piece manquante', 'Piece justificative manquante', 'La mutuelle demande un document complementaire (ordonnance, devis, etc.). Verifiez que l''ordonnance et toutes les pieces jointes ont bien ete transmises.', 'edit', 8, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('rg_piece_via', 'VIAMEDIS', 'piece manquante', 'Piece justificative manquante', 'La mutuelle demande un document complementaire (ordonnance, devis, etc.). Verifiez que l''ordonnance et toutes les pieces jointes ont bien ete transmises.', 'edit', 8, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('rg_delai_alm', 'ALMERYS', 'delai', 'Delai de transmission depasse', 'Le dossier a ete transmis apres le delai reglementaire. Vous pouvez contester ce rejet en generant une lettre de contestation depuis le module Litiges.', 'contact', 7, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('rg_delai_via', 'VIAMEDIS', 'delai', 'Delai de transmission depasse', 'Le dossier a ete transmis apres le delai reglementaire. Vous pouvez contester ce rejet en generant une lettre de contestation depuis le module Litiges.', 'contact', 7, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('rg_codif_alm', 'ALMERYS', 'codification', 'Erreur de codification LPP', 'Le code LPP ou la codification de l''equipement est incorrecte. Verifiez les codes LPP saisis et corrigez-les dans le dossier avant de le renvoyer.', 'edit', 8, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('rg_codif_via', 'VIAMEDIS', 'codification', 'Erreur de codification LPP', 'Le code LPP ou la codification de l''equipement est incorrecte. Verifiez les codes LPP saisis et corrigez-les dans le dossier avant de le renvoyer.', 'edit', 8, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('rg_nss_alm', 'ALMERYS', 'securite sociale', 'Numero de securite sociale invalide', 'Le numero de securite sociale ne correspond pas. Rescannez la carte mutuelle ou verifiez manuellement le NSS du patient.', 'rescan', 9, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('rg_nss_via', 'VIAMEDIS', 'securite sociale', 'Numero de securite sociale invalide', 'Le numero de securite sociale ne correspond pas. Rescannez la carte mutuelle ou verifiez manuellement le NSS du patient.', 'rescan', 9, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
