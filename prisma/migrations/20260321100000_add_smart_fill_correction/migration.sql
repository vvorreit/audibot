-- Migration: add_smart_fill_correction
-- Table de feedback Smart Fill — apprentissage des corrections utilisateur

CREATE TABLE IF NOT EXISTS "SmartFillCorrection" (
    "id"          TEXT NOT NULL,
    "hostname"    TEXT NOT NULL,
    "selector"    TEXT NOT NULL,
    "label"       TEXT NOT NULL,
    "oldVariable" TEXT NOT NULL,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SmartFillCorrection_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SmartFillCorrection_hostname_label_idx" ON "SmartFillCorrection"("hostname", "label");
CREATE INDEX IF NOT EXISTS "SmartFillCorrection_createdAt_idx"      ON "SmartFillCorrection"("createdAt");
