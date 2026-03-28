-- CreateTable
CREATE TABLE "FranchiseLead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "stores" TEXT NOT NULL,
    "seats" TEXT,
    "erp" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FranchiseLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FranchiseLead_status_idx" ON "FranchiseLead"("status");
CREATE INDEX "FranchiseLead_createdAt_idx" ON "FranchiseLead"("createdAt");
