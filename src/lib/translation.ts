import 'server-only';
import { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import { translationCache, withCache } from './translationCache';

export interface TranslationContent {
  title: string;
  excerpt: string;
  content: unknown;
  seoTitle?: string | null;
  seoDescription?: string | null;
  mainImageAlt?: string | null;
  additionalImageDescriptions?: unknown;
}

export interface ArticleWithTranslation {
  id: string;
  title: string;
  excerpt: string;
  content: unknown;
  defaultLocale: string;
  translations: {
    locale: string;
    title: string;
    excerpt: string;
    content: unknown;
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
 * Only returns a published translation or content authored in the requested locale.
 */
async function getArticleTranslationUncached(
  articleId: string,
  locale: string
): Promise<TranslationContent> {
  const [article, translation] = await Promise.all([
    prisma.article.findUnique({
      where: { id: articleId },
      select: {
        id: true,
        title: true,
        excerpt: true,
        content: true,
        mainImageAlt: true,
        additionalImageDescriptions: true,
        defaultLocale: true,
        translationSourceUpdatedAt: true,
      },
    }),
    prisma.articleTranslation.findFirst({
      where: { articleId, locale, status: 'published' },
      select: {
        title: true,
        excerpt: true,
        content: true,
        seoTitle: true,
        seoDescription: true,
        mainImageAlt: true,
        additionalImageDescriptions: true,
        sourceUpdatedAt: true,
      },
    })
  ]);

  if (!article) {
    throw new Error('Article not found');
  }

  if (
    translation
    && (!translation.sourceUpdatedAt
      || translation.sourceUpdatedAt.getTime() === article.translationSourceUpdatedAt.getTime())
  ) {
    return {
      title: translation.title,
      excerpt: translation.excerpt,
      content: translation.content,
      seoTitle: translation.seoTitle,
      seoDescription: translation.seoDescription,
      mainImageAlt: translation.mainImageAlt,
      additionalImageDescriptions: translation.additionalImageDescriptions,
    };
  }

  if (article.defaultLocale === locale) {
    return {
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      mainImageAlt: article.mainImageAlt,
      additionalImageDescriptions: article.additionalImageDescriptions,
    };
  }

  throw new Error(`Published ${locale} translation is unavailable for article ${articleId}`);
}

/**
 * Get article content in the requested locale (with cache)
 * Uses the process-local cache for already persisted translations.
 */
export const getArticleTranslation = withCache(
  'article',
  getArticleTranslationUncached,
  1000 * 60
);

/**
 * Get category content in the requested locale (uncached)
 * Only returns a category translation or content authored in the requested locale.
 */
async function getCategoryTranslationUncached(
  categoryId: string,
  locale: string
): Promise<{ title: string; description: string | null }> {
  const [category, translation] = await Promise.all([
    prisma.category.findUnique({
      where: { id: categoryId },
      select: { title: true, description: true, defaultLocale: true },
    }),
    prisma.categoryTranslation.findFirst({
      where: { categoryId, locale },
      select: { title: true, description: true },
    })
  ]);

  if (!category) {
    throw new Error('Category not found');
  }

  if (translation) {
    return {
      title: translation.title,
      description: translation.description
    };
  }

  if (category.defaultLocale === locale) {
    return {
      title: category.title,
      description: category.description
    };
  }

  throw new Error(`Published ${locale} category translation is unavailable for category ${categoryId}`);
}

/**
 * Get category content in the requested locale (with cache)
 * Falls back to default locale if translation not available
 */
export const getCategoryTranslation = withCache(
  'category',
  getCategoryTranslationUncached,
  1000 * 60
);

/**
 * Save article translation
 */
export async function saveArticleTranslation(
  articleId: string,
  locale: string,
  translation: TranslationContent
): Promise<void> {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { translationSourceUpdatedAt: true },
  });
  if (!article) throw new Error('Article not found');

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
      content: translation.content as Prisma.InputJsonValue,
      status: 'draft',
      sourceUpdatedAt: article.translationSourceUpdatedAt,
    },
    create: {
      articleId,
      locale,
      title: translation.title,
      excerpt: translation.excerpt,
      content: translation.content as Prisma.InputJsonValue,
      status: 'draft',
      sourceUpdatedAt: article.translationSourceUpdatedAt,
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
      where: { id: articleId },
      select: {
        defaultLocale: true,
        translationSourceUpdatedAt: true,
        category: {
          select: { id: true, defaultLocale: true },
        },
      },
    }),
    prisma.articleTranslation.findMany({
      where: { articleId, status: 'published' },
      select: { locale: true, sourceUpdatedAt: true },
    }),
  ]);

  if (!article) throw new Error('Article not found');

  const categoryTranslations = await prisma.categoryTranslation.findMany({
    where: { categoryId: article.category.id },
    select: { locale: true },
  });
  const availableCategoryLocales = new Set(categoryTranslations.map((item) => item.locale));

  return {
    defaultLocale: article.defaultLocale,
    translations: translations
      .filter((translation) =>
        !translation.sourceUpdatedAt
        || translation.sourceUpdatedAt.getTime() === article.translationSourceUpdatedAt.getTime()
      )
      .filter((translation) =>
        article.category.defaultLocale === translation.locale
        || availableCategoryLocales.has(translation.locale)
      )
      .map(t => ({
        locale: t.locale,
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
  if (!categories.length) return categories;

  const [sources, translations] = await Promise.all([
    prisma.category.findMany({
      where: { id: { in: categories.map((category) => category.id) } },
      select: { id: true, defaultLocale: true },
    }),
    prisma.categoryTranslation.findMany({
      where: {
        locale,
        categoryId: { in: categories.map((category) => category.id) },
      },
      select: { categoryId: true, title: true },
    }),
  ]);

  const translated = new Map(translations.map((item) => [item.categoryId, item.title]));
  const sourceLocales = new Map(sources.map((item) => [item.id, item.defaultLocale]));
  return categories.flatMap((category) => {
    if (sourceLocales.get(category.id) === locale) return [category];
    const title = translated.get(category.id);
    return title ? [{ ...category, title }] : [];
  });
}

export async function applyArticleLocales<
  T extends {
    id: string;
    title: string;
    excerpt: string;
    categoryId?: string;
    category?: { id?: string; title?: string } | null;
  },
>(articles: T[], locale: string): Promise<T[]> {
  if (!articles.length) return articles;

  const categoryIds = articles
    .map((article) => article.category?.id)
    .filter((id): id is string => Boolean(id));
  const [translations, categoryTranslations, sourceArticles, sourceCategories] = await Promise.all([
    prisma.articleTranslation.findMany({
      where: {
        locale,
        articleId: { in: articles.map((article) => article.id) },
        status: 'published',
      },
      select: { articleId: true, title: true, excerpt: true, sourceUpdatedAt: true },
    }),
    prisma.categoryTranslation.findMany({
      where: {
        locale,
        categoryId: { in: categoryIds },
      },
      select: { categoryId: true, title: true },
    }),
    prisma.article.findMany({
      where: { id: { in: articles.map((article) => article.id) } },
      select: { id: true, defaultLocale: true, translationSourceUpdatedAt: true },
    }),
    prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, defaultLocale: true },
    }),
  ]);

  const translated = new Map(translations.map((item) => [item.articleId, item]));
  const translatedCategories = new Map(categoryTranslations.map((item) => [item.categoryId, item.title]));
  const sourceById = new Map(sourceArticles.map((item) => [item.id, item]));
  const categoryLocaleById = new Map(sourceCategories.map((item) => [item.id, item.defaultLocale]));

  return articles.flatMap((article) => {
    const source = sourceById.get(article.id);
    const match = translated.get(article.id);
    const isSourceLocale = source?.defaultLocale === locale;
    if (!isSourceLocale && (!match || (
      match.sourceUpdatedAt
      && match.sourceUpdatedAt.getTime() !== source?.translationSourceUpdatedAt.getTime()
    ))) {
      return [];
    }

    const categoryTitle = article.category?.id ? translatedCategories.get(article.category.id) : undefined;
    const categoryIsSourceLocale = article.category?.id
      ? categoryLocaleById.get(article.category.id) === locale
      : true;
    if (!categoryIsSourceLocale && !categoryTitle) return [];

    return [{
      ...article,
      ...(!isSourceLocale && match ? { title: match.title, excerpt: match.excerpt } : {}),
      ...(article.category && categoryIsSourceLocale === false && categoryTitle
        ? { category: { ...article.category, title: categoryTitle } }
        : {}),
    }];
  });
}