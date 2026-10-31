ALTER TABLE "BlogPost"
  ADD COLUMN IF NOT EXISTS "defaultLocale" STRING NOT NULL DEFAULT 'fr',
  ADD COLUMN IF NOT EXISTS "translationSourceUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS "BlogPostTranslation" (
  "id" STRING NOT NULL,
  "blogPostId" STRING NOT NULL,
  "locale" STRING NOT NULL,
  "title" STRING NOT NULL,
  "excerpt" STRING NOT NULL,
  "content" JSONB NOT NULL,
  "mainImageAlt" STRING,
  "seoTitle" STRING,
  "seoDescription" STRING,
  "status" STRING NOT NULL DEFAULT 'draft',
  "sourceUpdatedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BlogPostTranslation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BlogPostTranslation_blogPostId_fkey"
    FOREIGN KEY ("blogPostId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "BlogPostTranslation_blogPostId_locale_key"
  ON "BlogPostTranslation" ("blogPostId", "locale");
CREATE INDEX IF NOT EXISTS "BlogPostTranslation_blogPostId_idx"
  ON "BlogPostTranslation" ("blogPostId");
CREATE INDEX IF NOT EXISTS "BlogPostTranslation_locale_idx"
  ON "BlogPostTranslation" ("locale");
CREATE INDEX IF NOT EXISTS "BlogPostTranslation_status_locale_idx"
  ON "BlogPostTranslation" ("status", "locale");

CREATE TABLE IF NOT EXISTS "BlogPostTranslationJob" (
  "id" STRING NOT NULL,
  "blogPostId" STRING NOT NULL,
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
  CONSTRAINT "BlogPostTranslationJob_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BlogPostTranslationJob_blogPostId_fkey"
    FOREIGN KEY ("blogPostId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "BlogPostTranslationJob_blogPostId_locale_key"
  ON "BlogPostTranslationJob" ("blogPostId", "locale");
CREATE INDEX IF NOT EXISTS "BlogPostTranslationJob_status_queuedAt_idx"
  ON "BlogPostTranslationJob" ("status", "queuedAt");
