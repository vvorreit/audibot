ALTER TABLE "InjectionLog" ADD COLUMN IF NOT EXISTS "mode" TEXT NOT NULL DEFAULT 'smartfill';
CREATE INDEX IF NOT EXISTS "InjectionLog_mode_idx" ON "InjectionLog"("mode");
