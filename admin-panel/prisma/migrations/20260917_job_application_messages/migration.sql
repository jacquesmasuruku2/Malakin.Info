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
