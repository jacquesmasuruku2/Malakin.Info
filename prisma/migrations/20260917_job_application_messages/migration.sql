CREATE TABLE IF NOT EXISTS "JobApplicationMessage" (
  "id" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "senderType" TEXT NOT NULL,
  "senderName" TEXT,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "readAt" TIMESTAMP(3),
  CONSTRAINT "JobApplicationMessage_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "JobApplicationMessage_applicationId_fkey"
    FOREIGN KEY ("applicationId") REFERENCES "JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "JobApplicationMessage_applicationId_createdAt_idx"
  ON "JobApplicationMessage"("applicationId", "createdAt");
CREATE INDEX IF NOT EXISTS "JobApplicationMessage_senderType_idx"
  ON "JobApplicationMessage"("senderType");

INSERT INTO "JobApplicationMessage" ("id", "applicationId", "senderType", "senderName", "body", "createdAt")
SELECT
  concat('mig_', ja.id),
  ja.id,
  'recruiter',
  'MalakInfo Recrutement',
  ja."adminMessage",
  COALESCE(ja."respondedAt", ja."updatedAt", ja."createdAt")
FROM "JobApplication" ja
WHERE ja."adminMessage" IS NOT NULL
  AND length(trim(ja."adminMessage")) > 0
  AND NOT EXISTS (
    SELECT 1 FROM "JobApplicationMessage" m WHERE m."applicationId" = ja.id AND m."senderType" = 'recruiter'
  );
