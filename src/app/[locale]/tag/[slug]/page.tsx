import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { withRetry } from '@/lib/database';
import { applyArticleLocales } from '@/lib/translation';
import { t } from '@/lib/copy';
import { foldTagKey, slugifyTag } from '@/lib/tags';
import ArticleListingGrid from '@/components/ArticleListingGrid';

export const revalidate = 60;

function decodeTagSlug(rawSlug: string) {
  try {
    return decodeURIComponent(rawSlug);
  } catch {
    return rawSlug;
  }
}

function titleFromSlug(slug: string) {
  const name = decodeTagSlug(slug).replace(/-/g, ' ').trim();
  if (!name) return slug;
  return name.replace(/(^|\s)\S/g, (chunk) => chunk.toUpperCase());
}

function displayTagName(name: string) {
  return name === name.toLowerCase() ? titleFromSlug(name) : name;
}

function likeNeedle(value: string) {
  const cleaned = value.replace(/[\\%_]/g, '').trim();
  if (!cleaned) return '';
  return `%/tag/${cleaned}%`;
}

async function findArticlesMentioningTag(slug: string, folded: string) {
  const needles = [...new Set([likeNeedle(slug), likeNeedle(folded)])].filter(Boolean);
  const ids = new Set<string>();

  for (const needle of needles) {
    try {
      const rows = await withRetry(() => prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Article"
        WHERE CAST("content" AS STRING) ILIKE ${needle}
        UNION
        SELECT "articleId" AS id FROM "ArticleTranslation"
        WHERE CAST("content" AS STRING) ILIKE ${needle}
      `);
      for (const row of rows || []) ids.add(row.id);
    } catch {
      try {
        const rows = await withRetry(() => prisma.$queryRaw<{ id: string }[]>`
          SELECT id FROM "Article"
          WHERE CAST("content" AS TEXT) ILIKE ${needle}
        `);
        for (const row of rows || []) ids.add(row.id);
      } catch {
        // Content is JSON; skip this fallback if the database rejects the cast.
      }
    }
  }

  if (!ids.size) return [];

  return (
    (await withRetry(() =>
      prisma.article.findMany({
        where: { id: { in: [...ids] } },
        include: {
          category: true,
          author: true,
        },
      })
    )) || []
  );
}

async function getTaggedArticles(rawSlug: string) {
  const slug = decodeTagSlug(rawSlug);
  const folded = foldTagKey(slug);

  let tag = await withRetry(() =>
    prisma.tag.findFirst({
      where: {
        OR: [{ slug }, { slug: folded }, { slug: slugifyTag(slug) }],
      },
    })
  );

  if (!tag) {
    const tags = await withRetry(() => prisma.tag.findMany());
    tag =
      (tags || []).find(
        (item) => foldTagKey(item.slug) === folded || foldTagKey(item.name) === folded
      ) || null;
  }

  const linked = tag
    ? await withRetry(() =>
        prisma.articleTag.findMany({
          where: { tagId: tag.id },
          include: {
            article: {
              include: {
                category: true,
                author: true,
              },
            },
          },
        })
      )
    : [];

  const byRelation = (linked || []).map((link) => link.article).filter(Boolean);
  const byContent = await findArticlesMentioningTag(slug, folded);
  const seen = new Set<string>();
  const articles = [...byRelation, ...byContent]
    .filter((article) => {
      if (!article?.id || seen.has(article.id)) return false;
      seen.add(article.id);
      return true;
    })
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));

  if (!tag && !articles.length) return null;

  return {
    tag: tag || {
      id: `virtual-${folded || slug}`,
      name: titleFromSlug(slug),
      slug: slugifyTag(slug) || folded || slug,
    },
    articles,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const data = await getTaggedArticles(slug);

  if (!data) {
    return { title: 'Tag | Malakinfo' };
  }

  const tagTitle = displayTagName(data.tag.name);

  return {
    title: tagTitle,
    description: `${t(locale, 'taggedArticles')} : ${tagTitle}`,
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const data = await getTaggedArticles(slug);

  if (!data) {
    notFound();
  }

  const articles = await applyArticleLocales(data.articles, locale);

  return (
    <div className="tag-page bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pt-14">
        <Link
          href={`/${locale}`}
          className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← {t(locale, 'backHome')}
        </Link>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-8 sm:mb-10">
          {displayTagName(data.tag.name)}
        </h1>

        {articles.length === 0 ? (
          <div className="py-10">
            <p className="text-lg font-medium text-foreground">{t(locale, 'noTaggedArticles')}</p>
            <p className="mt-2 text-muted-foreground">{t(locale, 'checkBackSoon')}</p>
            <Link
              href={`/${locale}/actualites`}
              className="mt-6 inline-flex items-center text-primary hover:text-primary/80 font-medium"
            >
              {t(locale, 'seeNews')}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        ) : (
          <ArticleListingGrid articles={articles} locale={locale} />
        )}
      </div>
    </div>
  );
}
