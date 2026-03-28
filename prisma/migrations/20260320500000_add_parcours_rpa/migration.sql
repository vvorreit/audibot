-- Migration: add_parcours_rpa
-- Parcours RPA dynamiques — les étapes ne contiennent jamais de données patient

CREATE TABLE IF NOT EXISTS "ParcoursRPA" (
    "id"        TEXT NOT NULL,
    "hostname"  TEXT NOT NULL,
    "nom"       TEXT NOT NULL,
    "etapes"    JSONB NOT NULL DEFAULT '[]',
    "valide"    BOOLEAN NOT NULL DEFAULT false,
    "version"   INTEGER NOT NULL DEFAULT 1,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ParcoursRPA_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ParcoursRPA_hostname_idx" ON "ParcoursRPA"("hostname");
CREATE INDEX IF NOT EXISTS "ParcoursRPA_valide_idx"   ON "ParcoursRPA"("valide");
