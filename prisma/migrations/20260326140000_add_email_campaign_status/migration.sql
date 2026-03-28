-- Add sending status fields to EmailCampaign
ALTER TABLE "EmailCampaign" ADD COLUMN IF NOT EXISTS "sendingAt" TIMESTAMP(3);
ALTER TABLE "EmailCampaign" ADD COLUMN IF NOT EXISTS "sentAt" TIMESTAMP(3);

-- Add status tracking fields to EmailTracking
ALTER TABLE "EmailTracking" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "EmailTracking" ADD COLUMN IF NOT EXISTS "errorReason" TEXT;
ALTER TABLE "EmailTracking" ADD COLUMN IF NOT EXISTS "errorAt" TIMESTAMP(3);

-- Backfill: mark already-sent emails as "sent"
UPDATE "EmailTracking" SET "status" = 'sent' WHERE "sentAt" IS NOT NULL AND "status" = 'pending';
