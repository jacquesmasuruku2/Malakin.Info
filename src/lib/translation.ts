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
  const [article, translation] = await Promise.all([
    prisma.article.findUnique({
      where: { id: articleId }
    }),
    prisma.articleTranslation.findFirst({
      where: { articleId, locale }
    })
  ]);

  if (!article) {
    throw new Error('Article not found');
  }

  // If translation exists for requested locale, use it
  if (translation) {
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
  const [category, translation] = await Promise.all([
    prisma.category.findUnique({
      where: { id: categoryId }
    }),
    prisma.categoryTranslation.findFirst({
      where: { categoryId, locale }
    })
  ]);

  if (!category) {
    throw new Error('Category not found');
  }

  // If translation exists for requested locale, use it
  if (translation) {
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
  const [article, translations] = await Promise.all([
    prisma.article.findUnique({
      where: { id: articleId }
    }),
    prisma.articleTranslation.findMany({
      where: { articleId }
    })
  ]);

  if (!article) {
    throw new Error('Article not found');
  }

  return {
    defaultLocale: article.defaultLocale,
    translations: translations.map(t => ({
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
  const [category, translations] = await Promise.all([
    prisma.category.findUnique({
      where: { id: categoryId }
    }),
    prisma.categoryTranslation.findMany({
      where: { categoryId }
    })
  ]);

  if (!category) {
    throw new Error('Category not found');
  }

  return {
    defaultLocale: category.defaultLocale,
    translations: translations.map(t => ({
      locale: t.locale,
      title: t.title,
      description: t.description
    }))
  };
}

export async function applyCategoryLocales<T extends { id: string; title: string }>(
  categories: T[],
  locale: string
): Promise<T[]> {
  if (!categories.length || locale === 'fr') {
    return categories;
  }

  const translations = await prisma.categoryTranslation.findMany({
    where: {
      locale,
      categoryId: { in: categories.map((category) => category.id) },
    },
    select: { categoryId: true, title: true },
  });

  if (translations.length === 0) {
    return categories;
  }

  const translated = new Map(translations.map((item) => [item.categoryId, item.title]));
  return categories.map((category) => {
    const title = translated.get(category.id);
    return title ? { ...category, title } : category;
  });
}

export async function applyArticleLocales<
  T extends {
    id: string;
    title: string;
    excerpt: string;
    category?: { id?: string; title?: string } | null;
  },
>(articles: T[], locale: string): Promise<T[]> {
  if (!articles.length || locale === 'fr') {
    return articles;
  }

  const [translations, categoryTranslations] = await Promise.all([
    prisma.articleTranslation.findMany({
      where: {
        locale,
        articleId: { in: articles.map((article) => article.id) },
      },
      select: { articleId: true, title: true, excerpt: true },
    }),
    prisma.categoryTranslation.findMany({
      where: {
        locale,
        categoryId: {
          in: articles
            .map((article) => article.category?.id)
            .filter((id): id is string => Boolean(id)),
        },
      },
      select: { categoryId: true, title: true },
    }),
  ]);

  const translated = new Map(translations.map((item) => [item.articleId, item]));
  const translatedCategories = new Map(categoryTranslations.map((item) => [item.categoryId, item.title]));

  return articles.map((article) => {
    const match = translated.get(article.id);
    const categoryTitle = article.category?.id ? translatedCategories.get(article.category.id) : undefined;
    return {
      ...article,
      ...(match ? { title: match.title, excerpt: match.excerpt } : {}),
      ...(article.category && categoryTitle
        ? { category: { ...article.category, title: categoryTitle } }
        : {}),
    };
  });
}