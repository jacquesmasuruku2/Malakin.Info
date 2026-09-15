ALTER TABLE IF EXISTS "Tag" SET (schema_locked = false);
ALTER TABLE IF EXISTS "ArticleTag" SET (schema_locked = false);

CREATE TABLE IF NOT EXISTS "Tag" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "slug" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

ALTER TABLE IF EXISTS "Tag" SET (schema_locked = false);

CREATE UNIQUE INDEX IF NOT EXISTS "Tag_slug_key" ON "Tag"("slug");
CREATE INDEX IF NOT EXISTS "Tag_name_idx" ON "Tag"("name");

CREATE TABLE IF NOT EXISTS "ArticleTag" (
    "articleId" STRING NOT NULL,
    "tagId" STRING NOT NULL,
    CONSTRAINT "ArticleTag_pkey" PRIMARY KEY ("articleId", "tagId")
);

ALTER TABLE IF EXISTS "ArticleTag" SET (schema_locked = false);

CREATE INDEX IF NOT EXISTS "ArticleTag_tagId_idx" ON "ArticleTag"("tagId");
CREATE INDEX IF NOT EXISTS "ArticleTag_articleId_idx" ON "ArticleTag"("articleId");

ALTER TABLE "ArticleTag" ADD CONSTRAINT IF NOT EXISTS "ArticleTag_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ArticleTag" ADD CONSTRAINT IF NOT EXISTS "ArticleTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE IF EXISTS "Tag" SET (schema_locked = true);
ALTER TABLE IF EXISTS "ArticleTag" SET (schema_locked = true);
