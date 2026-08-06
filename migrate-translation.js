const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateTranslations() {
  try {
    console.log('Starting translation migration...');

    // Add defaultLocale to Article table
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "defaultLocale" STRING DEFAULT 'fr'
    `);
    console.log('✓ Added defaultLocale to Article table');

    // Add defaultLocale to Category table
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "defaultLocale" STRING DEFAULT 'fr'
    `);
    console.log('✓ Added defaultLocale to Category table');

    // Create ArticleTranslation table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ArticleTranslation" (
        "id" STRING NOT NULL,
        "articleId" STRING NOT NULL,
        "locale" STRING NOT NULL,
        "title" STRING NOT NULL,
        "excerpt" STRING NOT NULL,
        "content" JSONB NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ArticleTranslation_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "ArticleTranslation_articleId_locale_key" UNIQUE ("articleId", "locale"),
        CONSTRAINT "ArticleTranslation_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    console.log('✓ Created ArticleTranslation table');

    // Create CategoryTranslation table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "CategoryTranslation" (
        "id" STRING NOT NULL,
        "categoryId" STRING NOT NULL,
        "locale" STRING NOT NULL,
        "title" STRING NOT NULL,
        "description" STRING,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "CategoryTranslation_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "CategoryTranslation_categoryId_locale_key" UNIQUE ("categoryId", "locale"),
        CONSTRAINT "CategoryTranslation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    console.log('✓ Created CategoryTranslation table');

    // Create indexes for ArticleTranslation
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ArticleTranslation_articleId_idx" ON "ArticleTranslation"("articleId")
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ArticleTranslation_locale_idx" ON "ArticleTranslation"("locale")
    `);
    console.log('✓ Created indexes for ArticleTranslation');

    // Create indexes for CategoryTranslation
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "CategoryTranslation_categoryId_idx" ON "CategoryTranslation"("categoryId")
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "CategoryTranslation_locale_idx" ON "CategoryTranslation"("locale")
    `);
    console.log('✓ Created indexes for CategoryTranslation');

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateTranslations()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));