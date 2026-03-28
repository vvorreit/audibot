-- Add A/B test variant to EmailTracking
ALTER TABLE "EmailTracking" ADD COLUMN IF NOT EXISTS "variant" TEXT;

-- Add subjectB for A/B test on EmailCampaign
ALTER TABLE "EmailCampaign" ADD COLUMN IF NOT EXISTS "subjectB" TEXT;
