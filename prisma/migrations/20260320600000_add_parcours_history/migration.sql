-- Migration: add_parcours_history
-- Ajoute le champ history (JSON) sur ParcoursRPA pour le versionning des parcours
ALTER TABLE "ParcoursRPA" ADD COLUMN IF NOT EXISTS "history" JSONB NOT NULL DEFAULT '[]';
