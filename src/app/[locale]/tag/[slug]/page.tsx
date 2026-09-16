import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Calendar, Clock, ArrowRight, Hash } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { withRetry } from '@/lib/database';
import { applyArticleLocales } from '@/lib/translation';
import { getDateLocale, t } from '@/lib/copy';
import { foldTagKey, slugifyTag } from '@/lib/tags';

export const dynamic = 'force-dynamic';

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

  return {
    title: data.tag.name,
    description: `${t(locale, 'taggedArticles')} : ${data.tag.name}`,
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
  const countLabel =
    locale === 'fr'
      ? `${articles.length} article${articles.length > 1 ? 's' : ''} tagué${articles.length > 1 ? 's' : ''}`
      : `${articles.length} tagged article${articles.length > 1 ? 's' : ''}`;

  return (
    <div className="flex flex-col">
      <section className="tag-page-hero text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href={`/${locale}`} className="block text-white/70 hover:text-white mb-8 w-fit">
            ← {t(locale, 'backHome')}
          </Link>
          <div className="tag-page-hero-mark" aria-hidden="true">
            <Hash className="w-8 h-8" />
          </div>
          <p className="uppercase tracking-[0.22em] text-sm text-secondary mb-3">{t(locale, 'tags')}</p>
          <h1 className="tag-page-title font-heading text-4xl md:text-5xl font-bold">
            {data.tag.name}
            <span className="tag-page-underline" />
          </h1>
          <p className="text-xl text-white/80 mt-5">
            {t(locale, 'taggedArticles')} · {countLabel}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {articles.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((item, index) => (
              <article
                key={item.id}
                className="tag-listing-card bg-card rounded-lg overflow-hidden shadow-sm border border-border"
                style={{ ['--i' as string]: index }}
              >
                {item.mainImageUrl && (
                  <div className="relative h-48 overflow-hidden">
                    <Link href={`/${locale}/${item.slug}`}>
                      <img
                        src={item.mainImageUrl}
                        alt={item.mainImageAlt || item.title}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(item.publishedAt).toLocaleDateString(getDateLocale(locale), {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    {item.readTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {item.readTime}
                      </span>
                    )}
                  </div>
                  {item.category?.title && (
                    <span className="inline-block mb-3 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                      {item.category.title}
                    </span>
                  )}
                  <h2 className="font-heading text-xl font-semibold text-foreground mb-2 line-clamp-2">
                    <Link href={`/${locale}/${item.slug}`} className="hover:text-primary">
                      {item.title}
                    </Link>
                  </h2>
                  <p className="text-muted-foreground line-clamp-2">{item.excerpt}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
