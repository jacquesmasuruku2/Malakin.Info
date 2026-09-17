ALTER TABLE "JobApplication" ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE "JobApplication" ADD COLUMN IF NOT EXISTS "adminMessage" TEXT;
ALTER TABLE "JobApplication" ADD COLUMN IF NOT EXISTS "respondedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "JobApplication_jobOfferId_idx" ON "JobApplication"("jobOfferId");
CREATE INDEX IF NOT EXISTS "JobApplication_userId_idx" ON "JobApplication"("userId");
CREATE INDEX IF NOT EXISTS "JobApplication_email_idx" ON "JobApplication"("email");
CREATE INDEX IF NOT EXISTS "JobApplication_status_idx" ON "JobApplication"("status");

UPDATE "JobApplication" AS ja
SET "userId" = u.id
FROM "User" u
WHERE ja."userId" IS NULL
  AND lower(ja.email) = lower(u.email);
