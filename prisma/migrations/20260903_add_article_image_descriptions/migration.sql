ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "additionalImageDescriptions" JSONB DEFAULT '[]';
