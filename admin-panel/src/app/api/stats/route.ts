import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [
      articlesCount,
      authorsCount,
      categoriesCount,
      totalViews,
      featuredArticlesCount,
      publishedThisMonth,
      livesCount,
      activeLivesCount,
    ] = await Promise.all([
      prisma.article.count(),
      prisma.author.count(),
      prisma.category.count(),
      prisma.article.aggregate({ _sum: { views: true } }),
      prisma.article.count({ where: { featured: true } }),
      prisma.article.count({
        where: {
          publishedAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
        },
      }),
      prisma.liveEvent.count(),
      prisma.liveEvent.count({ where: { status: 'LIVE' } }),
    ]);

    return NextResponse.json({
      articles: articlesCount,
      authors: authorsCount,
      categories: categoriesCount,
      totalViews: Number(totalViews._sum.views || 0),
      featuredArticles: featuredArticlesCount,
      publishedThisMonth,
      lives: livesCount,
      activeLives: activeLivesCount,
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
