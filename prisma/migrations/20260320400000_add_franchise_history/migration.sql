-- AlterTable: add reseau and nbMagasins to FranchiseLead
ALTER TABLE "FranchiseLead" ADD COLUMN IF NOT EXISTS "reseau" TEXT;
ALTER TABLE "FranchiseLead" ADD COLUMN IF NOT EXISTS "nbMagasins" TEXT;

-- CreateTable: FranchiseLeadStatusHistory
CREATE TABLE IF NOT EXISTS "FranchiseLeadStatusHistory" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "oldStatus" TEXT NOT NULL,
    "newStatus" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FranchiseLeadStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "FranchiseLeadStatusHistory_leadId_idx" ON "FranchiseLeadStatusHistory"("leadId");

-- AddForeignKey
ALTER TABLE "FranchiseLeadStatusHistory"
    ADD CONSTRAINT "FranchiseLeadStatusHistory_leadId_fkey"
    FOREIGN KEY ("leadId") REFERENCES "FranchiseLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
