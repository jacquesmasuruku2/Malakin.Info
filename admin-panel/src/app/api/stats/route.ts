import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const trendStart = new Date(now);
    trendStart.setUTCHours(0, 0, 0, 0);
    trendStart.setUTCDate(trendStart.getUTCDate() - 6);

    const [
      articlesCount,
      authorsCount,
      categoriesCount,
      totalViews,
      featuredArticlesCount,
      publishedThisMonth,
      livesCount,
      activeLivesCount,
      recentPublications,
      categoriesWithCounts,
    ] = await Promise.all([
      prisma.article.count(),
      prisma.author.count(),
      prisma.category.count(),
      prisma.article.aggregate({ _sum: { views: true } }),
      prisma.article.count({ where: { featured: true } }),
      prisma.article.count({
        where: {
          publishedAt: {
            gte: monthStart,
            lte: now,
          },
        },
      }),
      prisma.liveEvent.count(),
      prisma.liveEvent.count({ where: { status: 'LIVE' } }),
      prisma.article.findMany({
        where: {
          publishedAt: {
            gte: trendStart,
            lte: now,
          },
        },
        select: { publishedAt: true },
      }),
      prisma.category.findMany({
        select: {
          title: true,
          _count: { select: { articles: true } },
        },
      }),
    ]);

    const publicationsByDate = new Map<string, number>();
    for (const article of recentPublications) {
      const date = article.publishedAt.toISOString().slice(0, 10);
      publicationsByDate.set(date, (publicationsByDate.get(date) || 0) + 1);
    }

    const publicationTrend = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(trendStart);
      date.setUTCDate(date.getUTCDate() + index);
      const dateKey = date.toISOString().slice(0, 10);
      return { date: dateKey, count: publicationsByDate.get(dateKey) || 0 };
    });

    const sortedCategories = categoriesWithCounts.sort(
      (first, second) => second._count.articles - first._count.articles,
    );
    const categoryDistribution = sortedCategories.slice(0, 5).map((category) => ({
      name: category.title,
      count: category._count.articles,
    }));
    const otherCategoryCount = sortedCategories
      .slice(5)
      .reduce((total, category) => total + category._count.articles, 0);
    if (otherCategoryCount > 0) {
      categoryDistribution.push({ name: 'Autres', count: otherCategoryCount });
    }

    return NextResponse.json({
      articles: articlesCount,
      authors: authorsCount,
      categories: categoriesCount,
      totalViews: Number(totalViews._sum.views || 0),
      featuredArticles: featuredArticlesCount,
      publishedThisMonth,
      lives: livesCount,
      activeLives: activeLivesCount,
      publicationTrend,
      categoryDistribution,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch statistics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
