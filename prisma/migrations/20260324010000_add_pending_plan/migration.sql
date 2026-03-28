-- Add pendingPlan field to User for deferred downgrades
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "pendingPlan" TEXT;
