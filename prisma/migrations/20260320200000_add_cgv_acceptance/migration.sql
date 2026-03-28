-- Migration: add CGV acceptance fields to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "needsCgvAcceptance" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "cgvVersion" TEXT;
