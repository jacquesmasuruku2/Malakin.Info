import { prisma } from './prisma';
import { translationCache, withCache } from './translationCache';

export interface TranslationContent {
  title: string;
  excerpt: string;
  content: any;
}

export interface ArticleWithTranslation {
  id: string;
  title: string;
  excerpt: string;
  content: any;
  defaultLocale: string;
  translations: {
    locale: string;
    title: string;
    excerpt: string;
    content: any;
  }[];
}

export interface CategoryWithTranslation {
  id: string;
  title: string;
  description: string | null;
  defaultLocale: string;
  translations: {
    locale: string;
    title: string;
    description: string | null;
  }[];
}

/**
 * Get article content in the requested locale (uncached)
 * Falls back to default locale if translation not available
 */
async function getArticleTranslationUncached(
  articleId: string,
  locale: string
): Promise<TranslationContent> {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: {
      translations: {
        where: { locale }
      }
    }
  });

  if (!article) {
    throw new Error('Article not found');
  }

  // If translation exists for requested locale, use it
  if (article.translations.length > 0) {
    const translation = article.translations[0];
    return {
      title: translation.title,
      excerpt: translation.excerpt,
      content: translation.content
    };
  }

  // If no translation, check if default locale matches requested locale
  if (article.defaultLocale === locale) {
    return {
      title: article.title,
      excerpt: article.excerpt,
      content: article.content
    };
  }

  // Fall back to default locale content
  return {
    title: article.title,
    excerpt: article.excerpt,
    content: article.content
  };
}

/**
 * Get article content in the requested locale (with cache)
 * Falls back to default locale if translation not available
 */
export const getArticleTranslation = withCache(
  'article',
  getArticleTranslationUncached,
  1000 * 60 * 30 // 30 minutes TTL
);

/**
 * Get category content in the requested locale (uncached)
 * Falls back to default locale if translation not available
 */
async function getCategoryTranslationUncached(
  categoryId: string,
  locale: string
): Promise<{ title: string; description: string | null }> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      translations: {
        where: { locale }
      }
    }
  });

  if (!category) {
    throw new Error('Category not found');
  }

  // If translation exists for requested locale, use it
  if (category.translations.length > 0) {
    const translation = category.translations[0];
    return {
      title: translation.title,
      description: translation.description
    };
  }

  // If no translation, check if default locale matches requested locale
  if (category.defaultLocale === locale) {
    return {
      title: category.title,
      description: category.description
    };
  }

  // Fall back to default locale content
  return {
    title: category.title,
    description: category.description
  };
}

/**
 * Get category content in the requested locale (with cache)
 * Falls back to default locale if translation not available
 */
export const getCategoryTranslation = withCache(
  'category',
  getCategoryTranslationUncached,
  1000 * 60 * 60 // 1 hour TTL
);

/**
 * Save article translation
 */
export async function saveArticleTranslation(
  articleId: string,
  locale: string,
  translation: TranslationContent
): Promise<void> {
  await prisma.articleTranslation.upsert({
    where: {
      articleId_locale: {
        articleId,
        locale
      }
    },
    update: {
      title: translation.title,
      excerpt: translation.excerpt,
      content: translation.content
    },
    create: {
      articleId,
      locale,
      title: translation.title,
      excerpt: translation.excerpt,
      content: translation.content
    }
  });

  // Clear cache for this article
  translationCache.delete('article', articleId, locale);
}

/**
 * Save category translation
 */
export async function saveCategoryTranslation(
  categoryId: string,
  locale: string,
  translation: { title: string; description: string | null }
): Promise<void> {
  await prisma.categoryTranslation.upsert({
    where: {
      categoryId_locale: {
        categoryId,
        locale
      }
    },
    update: {
      title: translation.title,
      description: translation.description
    },
    create: {
      categoryId,
      locale,
      title: translation.title,
      description: translation.description
    }
  });

  // Clear cache for this category
  translationCache.delete('category', categoryId, locale);
}

/**
 * Get all available translations for an article
 */
export async function getArticleTranslations(articleId: string) {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: {
      translations: true
    }
  });

  if (!article) {
    throw new Error('Article not found');
  }

  return {
    defaultLocale: article.defaultLocale,
    translations: article.translations.map(t => ({
      locale: t.locale,
      title: t.title,
      excerpt: t.excerpt
    }))
  };
}

/**
 * Get all available translations for a category
 */
export async function getCategoryTranslations(categoryId: string) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      translations: true
    }
  });

  if (!category) {
    throw new Error('Category not found');
  }

  return {
    defaultLocale: category.defaultLocale,
    translations: category.translations.map(t => ({
      locale: t.locale,
      title: t.title,
      description: t.description
    }))
  };
}