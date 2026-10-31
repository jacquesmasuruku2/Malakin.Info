import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { getArchiveYears } from '@/lib/archives'
import { SITE_URL } from '@/lib/site-legal'

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date()
  const locales = ['fr', 'en'] as const

  const staticPaths = [
    '',
    '/actualites',
    '/blog',
    '/politique',
    '/economie',
    '/societe',
    '/sante',
    '/securite',
    '/environnement',
    '/culture',
    '/sport',
    '/religion',
    '/science-tech',
    '/emploi',
    '/contact',
    '/a-propos',
    '/mission',
    '/equipe',
    '/charte',
    '/mentions-legales',
    '/politique-confidentialite',
    '/cookies',
    '/conditions-utilisation',
    '/nous-soutenir',
    '/partenariats',
    '/archives',
  ]

  const staticPages: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified: currentDate,
      changeFrequency: path === '' || path === '/actualites' ? 'daily' : 'weekly',
      priority: path === '' ? 1 : 0.7,
    }))
  )

  try {
    const articles = await prisma.article.findMany({
      select: {
        slug: true,
        categoryId: true,
        updatedAt: true,
        translationSourceUpdatedAt: true,
        defaultLocale: true,
        translations: {
          where: { locale: { in: [...locales] }, status: 'published' },
          select: { locale: true, sourceUpdatedAt: true, updatedAt: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: 1000,
    })
    const categoryIds = [...new Set(articles.map((article) => article.categoryId))]
    const [categories, categoryTranslations] = await Promise.all([
      prisma.category.findMany({
        where: { id: { in: categoryIds } },
        select: { id: true, defaultLocale: true },
      }),
      prisma.categoryTranslation.findMany({
        where: { categoryId: { in: categoryIds }, locale: { in: [...locales] } },
        select: { categoryId: true, locale: true },
      }),
    ])
    const categoryLocales = new Map(categories.map((category) => [category.id, category.defaultLocale]))
    const translatedCategoryKeys = new Set(
      categoryTranslations.map((translation) => `${translation.categoryId}:${translation.locale}`),
    )

    const articlePages: MetadataRoute.Sitemap = articles.flatMap((article) => {
      const translations = new Map(
        article.translations.map((translation) => [translation.locale, translation]),
      );

      return locales.flatMap((locale) => {
        const categoryLocale = categoryLocales.get(article.categoryId)
        if (
          categoryLocale !== locale
          && !translatedCategoryKeys.has(`${article.categoryId}:${locale}`)
        ) return []

        if (locale !== article.defaultLocale) {
          const translation = translations.get(locale);
          if (!translation) return [];
          if (
            translation.sourceUpdatedAt
            && translation.sourceUpdatedAt.getTime() !== article.translationSourceUpdatedAt.getTime()
          ) return [];
        }

        return [{
        url: `${SITE_URL}/${locale}/${article.slug}`,
        lastModified: locale === article.defaultLocale
          ? article.translationSourceUpdatedAt
          : translations.get(locale)?.updatedAt || article.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        }];
      });
    });

    const blogPosts = await prisma.blogPost.findMany({
      where: { publishedAt: { lte: currentDate } },
      select: {
        slug: true,
        defaultLocale: true,
        updatedAt: true,
        translationSourceUpdatedAt: true,
        translations: {
          where: { locale: { in: [...locales] }, status: 'published' },
          select: { locale: true, sourceUpdatedAt: true, updatedAt: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: 1000,
    });
    const blogPages: MetadataRoute.Sitemap = blogPosts.flatMap((post) =>
      locales.flatMap((locale) => {
        if (locale !== post.defaultLocale) {
          const translation = post.translations.find((item) => item.locale === locale);
          if (!translation) return [];
          if (
            !translation.sourceUpdatedAt
            || translation.sourceUpdatedAt.getTime() !== post.translationSourceUpdatedAt.getTime()
          ) return [];
          return [{
            url: `${SITE_URL}/${locale}/blog/${post.slug}`,
            lastModified: translation.updatedAt,
            changeFrequency: 'weekly' as const,
            priority: 0.6,
          }];
        }
        return [{
          url: `${SITE_URL}/${locale}/blog/${post.slug}`,
          lastModified: post.translationSourceUpdatedAt || post.updatedAt,
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }];
      }),
    );

    const archiveYears = await getArchiveYears()
    const archiveYearPages: MetadataRoute.Sitemap = archiveYears.flatMap((year) =>
      locales.map((locale) => ({
        url: `${SITE_URL}/${locale}/archives/${year}`,
        lastModified: currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      }))
    )

    const tags = await prisma.tag.findMany({
      where: { articles: { some: {} } },
      select: { slug: true, updatedAt: true },
    })

    const tagPages: MetadataRoute.Sitemap = tags.flatMap((tag) =>
      locales.map((locale) => ({
        url: `${SITE_URL}/${locale}/tag/${tag.slug}`,
        lastModified: tag.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
    )

    return [...staticPages, ...articlePages, ...blogPages, ...archiveYearPages, ...tagPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
}
