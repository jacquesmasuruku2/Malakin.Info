ALTER TABLE "ArticleTranslation"
  ADD COLUMN IF NOT EXISTS "seoTitle" STRING,
  ADD COLUMN IF NOT EXISTS "seoDescription" STRING,
  ADD COLUMN IF NOT EXISTS "mainImageAlt" STRING,
  ADD COLUMN IF NOT EXISTS "additionalImageDescriptions" JSONB,
  ADD COLUMN IF NOT EXISTS "status" STRING NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS "sourceUpdatedAt" TIMESTAMP(3);

ALTER TABLE "Article"
  ADD COLUMN IF NOT EXISTS "translationSourceUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "ArticleTranslation_status_locale_idx"
  ON "ArticleTranslation" ("status", "locale");

CREATE TABLE IF NOT EXISTS "TranslationJob" (
  "id" STRING NOT NULL,
  "articleId" STRING NOT NULL,
  "locale" STRING NOT NULL,
  "status" STRING NOT NULL DEFAULT 'queued',
  "attempts" INT4 NOT NULL DEFAULT 0,
  "lastError" STRING,
  "sourceUpdatedAt" TIMESTAMP(3),
  "queuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "startedAt" TIMESTAMP(3),
  "finishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TranslationJob_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TranslationJob_articleId_fkey"
    FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "TranslationJob_articleId_locale_key"
  ON "TranslationJob" ("articleId", "locale");
CREATE INDEX IF NOT EXISTS "TranslationJob_status_queuedAt_idx"
  ON "TranslationJob" ("status", "queuedAt");
