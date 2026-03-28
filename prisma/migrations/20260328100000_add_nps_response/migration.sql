-- CreateTable
CREATE TABLE "NpsResponse" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT,
    "score" INTEGER NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NpsResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NpsResponse_userId_idx" ON "NpsResponse"("userId");

-- CreateIndex
CREATE INDEX "NpsResponse_createdAt_idx" ON "NpsResponse"("createdAt");

-- CreateIndex
CREATE INDEX "NpsResponse_score_idx" ON "NpsResponse"("score");
