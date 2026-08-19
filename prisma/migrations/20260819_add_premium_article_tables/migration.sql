-- Keep the production database aligned with the premium article Prisma schema.
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "isPremium" BOOL NOT NULL DEFAULT false;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "premiumPrice" DECIMAL(10,2);

CREATE TABLE IF NOT EXISTS "ArticlePurchase" (
  "id" STRING NOT NULL,
  "userId" STRING NOT NULL,
  "articleId" STRING NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "currency" STRING NOT NULL DEFAULT 'USD',
  "status" STRING NOT NULL DEFAULT 'completed',
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "ArticlePurchase_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ArticlePurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "ArticlePurchase_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Subscription" (
  "id" STRING NOT NULL,
  "userId" STRING NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "currency" STRING NOT NULL DEFAULT 'USD',
  "status" STRING NOT NULL DEFAULT 'active',
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "ArticlePurchase_userId_idx" ON "ArticlePurchase" ("userId");
CREATE INDEX IF NOT EXISTS "ArticlePurchase_articleId_idx" ON "ArticlePurchase" ("articleId");
CREATE INDEX IF NOT EXISTS "ArticlePurchase_expiresAt_idx" ON "ArticlePurchase" ("expiresAt");
CREATE INDEX IF NOT EXISTS "ArticlePurchase_status_idx" ON "ArticlePurchase" ("status");
CREATE INDEX IF NOT EXISTS "Subscription_userId_idx" ON "Subscription" ("userId");
CREATE INDEX IF NOT EXISTS "Subscription_expiresAt_idx" ON "Subscription" ("expiresAt");
CREATE INDEX IF NOT EXISTS "Subscription_status_idx" ON "Subscription" ("status");
