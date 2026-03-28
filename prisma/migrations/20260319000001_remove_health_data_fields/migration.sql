-- Migration RGPD : suppression des champs données de santé côté serveur
-- Principe "zéro donnée santé serveur" — décision stratégique OptiBot 2026-03-19

-- 1. OcrFeedback : supprimer rawText (texte brut OCR pouvant contenir données patient)
ALTER TABLE "OcrFeedback" DROP COLUMN IF EXISTS "rawText";

-- 2. AlerteExpiration : supprimer clientNom (nom du patient — donnée identifiante santé)
ALTER TABLE "AlerteExpiration" DROP COLUMN IF EXISTS "clientNom";

-- 3. RejetAutoDetecte : supprimer rawData (données brutes scrapées portails mutuelles)
ALTER TABLE "RejetAutoDetecte" DROP COLUMN IF EXISTS "rawData";
