-- ============================================
-- SCHÉMA COMPLET DE BASE DE DONNÉES POUR MALAKINFO.COM
-- Compatible PostgreSQL/CockroachDB
-- ============================================

-- ============================================
-- TABLES PRINCIPALES
-- ============================================

-- Table Category
CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Category_slug_key" UNIQUE ("slug")
);

-- Table Author
CREATE TABLE IF NOT EXISTS "Author" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bio" TEXT,
    "role" TEXT,
    "email" TEXT,
    "imageUrl" TEXT,
    "imageAlt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Author_slug_key" UNIQUE ("slug")
);

-- Table Article
CREATE TABLE IF NOT EXISTS "Article" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "categoryId" TEXT NOT NULL,
    "authorId" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "mainImageUrl" TEXT,
    "mainImageAlt" TEXT,
    "readTime" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Article_slug_key" UNIQUE ("slug"),
    CONSTRAINT "Article_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- ============================================
-- TABLES UTILISATEURS ET AUTHENTIFICATION
-- ============================================

-- Table User
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'reader',
    "avatarUrl" TEXT,
    "bio" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "User_email_key" UNIQUE ("email")
);

-- Table Session (pour la gestion des sessions)
CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Session_token_key" UNIQUE ("token"),
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================
-- TABLES INTERACTION ET ENGAGEMENT
-- ============================================

-- Table Comment
CREATE TABLE IF NOT EXISTS "Comment" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentId" TEXT,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Comment_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table Like
CREATE TABLE IF NOT EXISTS "Like" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Like_articleId_userId_key" UNIQUE ("articleId", "userId"),
    CONSTRAINT "Like_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================
-- TABLES CONTACT ET FORMULAIRES
-- ============================================

-- Table ContactMessage
CREATE TABLE IF NOT EXISTS "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- Table NewsletterSubscription
CREATE TABLE IF NOT EXISTS "NewsletterSubscription" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unsubscribedAt" TIMESTAMP(3),

    CONSTRAINT "NewsletterSubscription_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "NewsletterSubscription_email_key" UNIQUE ("email")
);

-- ============================================
-- TABLES MÉDIAS
-- ============================================

-- Table Media
CREATE TABLE IF NOT EXISTS "Media" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "duration" INTEGER,
    "categoryId" TEXT,
    "authorId" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Media_slug_key" UNIQUE ("slug"),
    CONSTRAINT "Media_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Media_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- ============================================
-- TABLES DONS ET SOUTIEN
-- ============================================

-- Table Donation
CREATE TABLE IF NOT EXISTS "Donation" (
    "id" TEXT NOT NULL,
    "donorName" TEXT,
    "donorEmail" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "paymentMethod" TEXT,
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Donation_transactionId_key" UNIQUE ("transactionId")
);

-- Table Partnership
CREATE TABLE IF NOT EXISTS "Partnership" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partnership_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- TABLES COMMUNIQUÉS
-- ============================================

-- Table PressRelease
CREATE TABLE IF NOT EXISTS "PressRelease" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "source" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "mainImageUrl" TEXT,
    "mainImageAlt" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PressRelease_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PressRelease_slug_key" UNIQUE ("slug")
);

-- ============================================
-- TABLES EMPLOI
-- ============================================

-- Table JobOffer
CREATE TABLE IF NOT EXISTS "JobOffer" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "location" TEXT,
    "type" TEXT NOT NULL,
    "salary" TEXT,
    "companyId" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "deadline" TIMESTAMP(3),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobOffer_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "JobOffer_slug_key" UNIQUE ("slug")
);

-- Table JobApplication
CREATE TABLE IF NOT EXISTS "JobApplication" (
    "id" TEXT NOT NULL,
    "jobOfferId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "coverLetter" TEXT,
    "resumeUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "JobApplication_jobOfferId_fkey" FOREIGN KEY ("jobOfferId") REFERENCES "JobOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================
-- TABLES BLOG
-- ============================================

-- Table BlogPost
CREATE TABLE IF NOT EXISTS "BlogPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "type" TEXT NOT NULL,
    "authorId" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "mainImageUrl" TEXT,
    "mainImageAlt" TEXT,
    "readTime" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "BlogPost_slug_key" UNIQUE ("slug"),
    CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- ============================================
-- INDEX POUR OPTIMISATION
-- ============================================

-- Index pour Article
CREATE INDEX IF NOT EXISTS "Article_categoryId_idx" ON "Article"("categoryId");
CREATE INDEX IF NOT EXISTS "Article_authorId_idx" ON "Article"("authorId");
CREATE INDEX IF NOT EXISTS "Article_publishedAt_idx" ON "Article"("publishedAt" DESC);
CREATE INDEX IF NOT EXISTS "Article_featured_idx" ON "Article"("featured");
CREATE INDEX IF NOT EXISTS "Article_views_idx" ON "Article"("views" DESC);

-- Index pour User
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");

-- Index pour Comment
CREATE INDEX IF NOT EXISTS "Comment_articleId_idx" ON "Comment"("articleId");
CREATE INDEX IF NOT EXISTS "Comment_userId_idx" ON "Comment"("userId");
CREATE INDEX IF NOT EXISTS "Comment_status_idx" ON "Comment"("status");

-- Index pour Like
CREATE INDEX IF NOT EXISTS "Like_articleId_idx" ON "Like"("articleId");
CREATE INDEX IF NOT EXISTS "Like_userId_idx" ON "Like"("userId");

-- Index pour ContactMessage
CREATE INDEX IF NOT EXISTS "ContactMessage_status_idx" ON "ContactMessage"("status");
CREATE INDEX IF NOT EXISTS "ContactMessage_createdAt_idx" ON "ContactMessage"("createdAt" DESC);

-- Index pour Media
CREATE INDEX IF NOT EXISTS "Media_type_idx" ON "Media"("type");
CREATE INDEX IF NOT EXISTS "Media_categoryId_idx" ON "Media"("categoryId");
CREATE INDEX IF NOT EXISTS "Media_publishedAt_idx" ON "Media"("publishedAt" DESC);
CREATE INDEX IF NOT EXISTS "Media_featured_idx" ON "Media"("featured");

-- Index pour Donation
CREATE INDEX IF NOT EXISTS "Donation_status_idx" ON "Donation"("status");
CREATE INDEX IF NOT EXISTS "Donation_createdAt_idx" ON "Donation"("createdAt" DESC);

-- Index pour Partnership
CREATE INDEX IF NOT EXISTS "Partnership_status_idx" ON "Partnership"("status");
CREATE INDEX IF NOT EXISTS "Partnership_type_idx" ON "Partnership"("type");

-- Index pour PressRelease
CREATE INDEX IF NOT EXISTS "PressRelease_type_idx" ON "PressRelease"("type");
CREATE INDEX IF NOT EXISTS "PressRelease_publishedAt_idx" ON "PressRelease"("publishedAt" DESC);
CREATE INDEX IF NOT EXISTS "PressRelease_featured_idx" ON "PressRelease"("featured");

-- Index pour JobOffer
CREATE INDEX IF NOT EXISTS "JobOffer_type_idx" ON "JobOffer"("type");
CREATE INDEX IF NOT EXISTS "JobOffer_publishedAt_idx" ON "JobOffer"("publishedAt" DESC);
CREATE INDEX IF NOT EXISTS "JobOffer_featured_idx" ON "JobOffer"("featured");
CREATE INDEX IF NOT EXISTS "JobOffer_deadline_idx" ON "JobOffer"("deadline");

-- Index pour BlogPost
CREATE INDEX IF NOT EXISTS "BlogPost_type_idx" ON "BlogPost"("type");
CREATE INDEX IF NOT EXISTS "BlogPost_publishedAt_idx" ON "BlogPost"("publishedAt" DESC);
CREATE INDEX IF NOT EXISTS "BlogPost_featured_idx" ON "BlogPost"("featured");
CREATE INDEX IF NOT EXISTS "BlogPost_views_idx" ON "BlogPost"("views" DESC);

-- ============================================
-- DONNÉES INITIALES
-- ============================================

-- Insertion des catégories
INSERT INTO "Category" ("id", "title", "slug", "description", "color", "icon") VALUES
('clh1', 'Actualités', 'actualites', 'Les dernières actualités du monde', '#E63946', 'TrendingUp'),
('clh2', 'Politique', 'politique', 'Actualités politiques et gouvernementales', '#1D3557', 'Building2'),
('clh3', 'Économie', 'economie', 'Nouvelles économiques et financières', '#457B9D', 'DollarSign'),
('clh4', 'Société', 'societe', 'Faits de société et communautaire', '#A8DADC', 'Users'),
('clh5', 'Santé', 'sante', 'Actualités santé et bien-être', '#E63946', 'Heart'),
('clh6', 'Sécurité', 'securite', 'Sécurité et défense', '#1D3557', 'Shield'),
('clh7', 'Environnement', 'environnement', 'Écologie et développement durable', '#2A9D8F', 'Leaf'),
('clh8', 'Culture', 'culture', 'Arts, musique et culture', '#F4A261', 'Music'),
('clh9', 'Sport', 'sport', 'Nouvelles sportives', '#2A9D8F', 'Trophy'),
('clh10', 'Science & Tech', 'science-tech', 'Innovations et découvertes', '#264653', 'Cpu'),
('clh11', 'Religion', 'religion', 'Actualités religieuses', '#E9C46A', 'Church')
ON CONFLICT ("slug") DO NOTHING;

-- Insertion des auteurs
INSERT INTO "Author" ("id", "name", "slug", "bio", "role", "email") VALUES
('alh1', 'Jean Dupont', 'jean-dupont', 'Journaliste avec 10 ans d''expérience dans le domaine politique', 'Rédacteur en chef', 'jean@malakinfo.com'),
('alh2', 'Marie Curie', 'marie-curie', 'Spécialiste en science et technologie', 'Journaliste scientifique', 'marie@malakinfo.com'),
('alh3', 'Paul Mbemba', 'paul-mbemba', 'Expert en économie africaine', 'Économiste', 'paul@malakinfo.com'),
('alh4', 'Sophie Nkosi', 'sophie-nkosi', 'Correspondante sportive', 'Journaliste sportive', 'sophie@malakinfo.com')
ON CONFLICT ("slug") DO NOTHING;

-- Insertion d'un utilisateur admin par défaut
INSERT INTO "User" ("id", "email", "name", "passwordHash", "role", "emailVerified") VALUES
('ulh1', 'admin@malakinfo.com', 'Administrateur', '$2b$10$placeholder_hash_change_me', 'admin', true)
ON CONFLICT ("email") DO NOTHING;
