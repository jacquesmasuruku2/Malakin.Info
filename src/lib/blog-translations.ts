import 'server-only';
import { prisma } from '@/lib/prisma';

const publicLocales = ['fr', 'en'] as const;

export async function getLocalizedBlogPost(slug: string, locale: string) {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      author: { select: { name: true } },
      translations: {
        where: { locale, status: 'published' },
        select: {
          title: true,
          excerpt: true,
          content: true,
          mainImageAlt: true,
          seoTitle: true,
          seoDescription: true,
          sourceUpdatedAt: true,
        },
        take: 1,
      },
    },
  });
  if (!post || post.publishedAt > new Date()) return null;

  const translated = post.translations[0];
  const translationIsCurrent = translated?.sourceUpdatedAt
    && translated.sourceUpdatedAt.getTime() === post.translationSourceUpdatedAt.getTime();

  if (post.defaultLocale !== locale && !translationIsCurrent) return null;
  const content = post.defaultLocale === locale
    ? {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        mainImageAlt: post.mainImageAlt,
        seoTitle: null,
        seoDescription: null,
      }
    : translated;
  if (!content) return null;

  const availableTranslations = await prisma.blogPostTranslation.findMany({
    where: {
      blogPostId: post.id,
      locale: { in: [...publicLocales] },
      status: 'published',
      sourceUpdatedAt: post.translationSourceUpdatedAt,
    },
    select: { locale: true },
  });

  return {
    ...post,
    title: content.title,
    excerpt: content.excerpt,
    content: content.content,
    mainImageAlt: content.mainImageAlt,
    seoTitle: content.seoTitle,
    seoDescription: content.seoDescription,
    availableLocales: [...new Set([post.defaultLocale, ...availableTranslations.map((item) => item.locale)])],
  };
}

export async function getLocalizedBlogPosts(locale: string) {
  const posts = await prisma.blogPost.findMany({
    where: { publishedAt: { lte: new Date() } },
    include: {
      author: { select: { name: true } },
      translations: {
        where: { locale, status: 'published' },
        select: {
          title: true,
          excerpt: true,
          mainImageAlt: true,
          sourceUpdatedAt: true,
        },
        take: 1,
      },
    },
    orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
  });

  return posts.flatMap((post) => {
    const translated = post.translations[0];
    const isSourceLocale = post.defaultLocale === locale;
    const translationIsCurrent = translated?.sourceUpdatedAt
      && translated.sourceUpdatedAt.getTime() === post.translationSourceUpdatedAt.getTime();
    if (!isSourceLocale && !translationIsCurrent) return [];

    return [{
      ...post,
      title: isSourceLocale ? post.title : translated.title,
      excerpt: isSourceLocale ? post.excerpt : translated.excerpt,
      mainImageAlt: isSourceLocale ? post.mainImageAlt : translated.mainImageAlt,
    }];
  });
}
