-- Add scheduled sending, drip sequence, and report fields to EmailCampaign
ALTER TABLE "EmailCampaign" ADD COLUMN IF NOT EXISTS "scheduledAt" TIMESTAMP(3);
ALTER TABLE "EmailCampaign" ADD COLUMN IF NOT EXISTS "drip_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "EmailCampaign" ADD COLUMN IF NOT EXISTS "drip_delay_days" INTEGER NOT NULL DEFAULT 3;
ALTER TABLE "EmailCampaign" ADD COLUMN IF NOT EXISTS "drip_subject" TEXT;
ALTER TABLE "EmailCampaign" ADD COLUMN IF NOT EXISTS "drip_html_body" TEXT;
ALTER TABLE "EmailCampaign" ADD COLUMN IF NOT EXISTS "drip_sent_at" TIMESTAMP(3);
ALTER TABLE "EmailCampaign" ADD COLUMN IF NOT EXISTS "reportSentAt" TIMESTAMP(3);
