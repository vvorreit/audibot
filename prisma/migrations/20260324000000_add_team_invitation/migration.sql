-- Migration: Ajout des tables Team et Invitation, colonnes teamId et teamRole sur User
-- Cette migration crée les tables Team et Invitation manquantes en production

-- CreateTable Team
CREATE TABLE IF NOT EXISTS "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable Invitation
CREATE TABLE IF NOT EXISTS "Invitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "expires" TIMESTAMP(3) NOT NULL,
    "teamId" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- Add columns to User (IF NOT EXISTS safe)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "teamId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "teamRole" TEXT DEFAULT 'MEMBER';

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Team_stripeCustomerId_key" ON "Team"("stripeCustomerId");
CREATE UNIQUE INDEX IF NOT EXISTS "Team_stripeSubscriptionId_key" ON "Team"("stripeSubscriptionId");
CREATE INDEX IF NOT EXISTS "Team_ownerId_idx" ON "Team"("ownerId");
CREATE UNIQUE INDEX IF NOT EXISTS "Invitation_token_key" ON "Invitation"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "Invitation_teamId_email_key" ON "Invitation"("teamId", "email");
CREATE INDEX IF NOT EXISTS "User_teamId_idx" ON "User"("teamId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
