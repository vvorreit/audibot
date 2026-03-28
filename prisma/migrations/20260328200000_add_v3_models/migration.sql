-- V3 Extension Models

CREATE TABLE IF NOT EXISTS "SelectorRepairRequest" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "hostname" TEXT NOT NULL,
  "skipRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "failedFields" JSONB NOT NULL DEFAULT '{}',
  "snapshot" JSONB NOT NULL DEFAULT '[]',
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "SelectorRepairRequest_hostname_idx" ON "SelectorRepairRequest"("hostname");
CREATE INDEX IF NOT EXISTS "SelectorRepairRequest_status_idx" ON "SelectorRepairRequest"("status");
CREATE INDEX IF NOT EXISTS "SelectorRepairRequest_createdAt_idx" ON "SelectorRepairRequest"("createdAt");

CREATE TABLE IF NOT EXISTS "SmartFillWeight" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "hostname" TEXT NOT NULL,
  "field" TEXT NOT NULL,
  "multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  "sampleSize" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "SmartFillWeight_hostname_field_key" ON "SmartFillWeight"("hostname", "field");
CREATE INDEX IF NOT EXISTS "SmartFillWeight_hostname_idx" ON "SmartFillWeight"("hostname");

CREATE TABLE IF NOT EXISTS "TPDossier" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "date" TEXT,
  "fse" TEXT,
  "organisme" TEXT,
  "montant" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "rejetMotif" TEXT,
  "portail" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "TPDossier_userId_idx" ON "TPDossier"("userId");
CREATE INDEX IF NOT EXISTS "TPDossier_status_idx" ON "TPDossier"("status");
CREATE INDEX IF NOT EXISTS "TPDossier_createdAt_idx" ON "TPDossier"("createdAt");

CREATE TABLE IF NOT EXISTS "DevisCaptured" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "hostname" TEXT NOT NULL,
  "url" TEXT,
  "devis" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "DevisCaptured_userId_idx" ON "DevisCaptured"("userId");
CREATE INDEX IF NOT EXISTS "DevisCaptured_hostname_idx" ON "DevisCaptured"("hostname");
CREATE INDEX IF NOT EXISTS "DevisCaptured_createdAt_idx" ON "DevisCaptured"("createdAt");

CREATE TABLE IF NOT EXISTS "RejectionRule" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "hostname" TEXT,
  "type" TEXT NOT NULL,
  "threshold" DOUBLE PRECISION,
  "organisms" JSONB,
  "codes" JSONB,
  "weight" INTEGER NOT NULL DEFAULT 10,
  "reason" TEXT NOT NULL,
  "suggestion" TEXT,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "RejectionRule_hostname_idx" ON "RejectionRule"("hostname");
CREATE INDEX IF NOT EXISTS "RejectionRule_enabled_idx" ON "RejectionRule"("enabled");

CREATE TABLE IF NOT EXISTS "FieldFeedback" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT,
  "selector" TEXT NOT NULL,
  "fieldType" TEXT NOT NULL,
  "portal" TEXT NOT NULL,
  "url" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "FieldFeedback_portal_idx" ON "FieldFeedback"("portal");
CREATE INDEX IF NOT EXISTS "FieldFeedback_status_idx" ON "FieldFeedback"("status");
CREATE INDEX IF NOT EXISTS "FieldFeedback_fieldType_idx" ON "FieldFeedback"("fieldType");

CREATE TABLE IF NOT EXISTS "PortalMapping" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "source" TEXT NOT NULL UNIQUE,
  "urlPattern" TEXT NOT NULL,
  "fields" JSONB NOT NULL DEFAULT '{}',
  "version" INTEGER NOT NULL DEFAULT 1,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "PortalMapping_enabled_idx" ON "PortalMapping"("enabled");

-- Colonnes manquantes sur User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "onboardingCompletedEmailSentAt" TIMESTAMP(3);
