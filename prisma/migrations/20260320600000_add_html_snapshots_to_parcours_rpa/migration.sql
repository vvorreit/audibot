-- Migration: add_html_snapshots_to_parcours_rpa
-- Stockage séparé des snapshots HTML par étape pour dry-run

ALTER TABLE "ParcoursRPA" ADD COLUMN IF NOT EXISTS "htmlSnapshots" JSONB;
