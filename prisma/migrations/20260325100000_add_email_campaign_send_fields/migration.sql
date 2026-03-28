-- AlterTable EmailCampaign — add subject + htmlBody for campaign content
ALTER TABLE "EmailCampaign" ADD COLUMN IF NOT EXISTS "subject" TEXT;
ALTER TABLE "EmailCampaign" ADD COLUMN IF NOT EXISTS "htmlBody" TEXT;

-- AlterTable EmailTracking — add sentAt + firstName + lastName
ALTER TABLE "EmailTracking" ADD COLUMN IF NOT EXISTS "sentAt" TIMESTAMP(3);
ALTER TABLE "EmailTracking" ADD COLUMN IF NOT EXISTS "firstName" TEXT;
ALTER TABLE "EmailTracking" ADD COLUMN IF NOT EXISTS "lastName" TEXT;
