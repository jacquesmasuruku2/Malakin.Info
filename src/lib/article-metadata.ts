import 'server-only';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { getArticleTranslation, getArticleTranslations, getCategoryTranslation } from '@/lib/translation';
import { SITE_URL } from '@/lib/site-legal';

export async function getLocalizedArticleMetadata(locale: string, slug: string): Promise<Metadata> {
  try {
    const article = await prisma.article.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        excerpt: true,
        defaultLocale: true,
        translationSourceUpdatedAt: true,
        mainImageUrl: true,
        publishedAt: true,
        updatedAt: true,
        author: { select: { name: true } },
        category: { select: { id: true } },
      },
    });

    if (!article) {
      return {
        title: locale === 'en' ? 'Article unavailable | MalakInfo' : 'Article indisponible | MalakInfo',
        robots: { index: false, follow: true },
      };
    }

    const [content, category, available] = await Promise.all([
      getArticleTranslation(article.id, locale),
      getCategoryTranslation(article.category.id, locale),
      getArticleTranslations(article.id),
    ]);

    const canonical = `${SITE_URL}/${locale}/${slug}`;
    const image = article.mainImageUrl
      ? (article.mainImageUrl.startsWith('http') ? article.mainImageUrl : `${SITE_URL}${article.mainImageUrl}`)
      : undefined;
    const languages = Object.fromEntries(
      [...new Set([article.defaultLocale, ...available.translations.map((item) => item.locale)])]
        .filter((item) => item === 'fr' || item === 'en')
        .map((item) => [item === 'fr' ? 'fr-FR' : 'en-US', `${SITE_URL}/${item}/${slug}`]),
    );
    const title = content.seoTitle || content.title;
    const description = content.seoDescription || content.excerpt;

    return {
      title,
      description,
      authors: article.author ? [{ name: article.author.name }] : [{ name: 'MalakInfo' }],
      alternates: { canonical, languages },
      openGraph: {
        type: 'article',
        locale: locale === 'fr' ? 'fr_FR' : 'en_US',
        url: canonical,
        title,
        description,
        siteName: 'MalakInfo',
        publishedTime: article.publishedAt.toISOString(),
        modifiedTime: article.updatedAt.toISOString(),
        section: category.title,
        images: image ? [{ url: image, alt: content.mainImageAlt || content.title }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: image ? [image] : [],
      },
    };
  } catch (error) {
    console.error(`[article metadata ${locale}/${slug}]`, error);
    return {
      title: locale === 'en' ? 'Article unavailable | MalakInfo' : 'Article indisponible | MalakInfo',
      robots: { index: false, follow: true },
    };
  }
}
