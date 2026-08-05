import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function to add CORS headers
function cors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return cors(response);
}

export async function GET() {
  try {
    // Get counts from database
    const [
      articlesCount,
      authorsCount,
      categoriesCount,
      totalViews,
      featuredArticlesCount,
      publishedThisMonth,
      livesCount,
      activeLivesCount
    ] = await Promise.all([
      prisma.article.count(),
      prisma.author.count(),
      prisma.category.count(),
      prisma.article.aggregate({
        _sum: {
          views: true
        }
      }),
      prisma.article.count({
        where: {
          featured: true
        }
      }),
      prisma.article.count({
        where: {
          publishedAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30))
          }
        }
      }),
      prisma.liveEvent.count(),
      prisma.liveEvent.count({
        where: {
          status: 'LIVE'
        }
      })
    ]);

    const stats = {
      articles: articlesCount,
      authors: authorsCount,
      categories: categoriesCount,
      totalViews: Number(totalViews._sum.views || 0),
      featuredArticles: featuredArticlesCount,
      publishedThisMonth: publishedThisMonth,
      lives: livesCount,
      activeLives: activeLivesCount
    };

    return cors(NextResponse.json(stats));
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return cors(NextResponse.json({ 
      error: 'Failed to fetch statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 }));
  }
}
