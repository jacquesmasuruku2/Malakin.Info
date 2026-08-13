import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const comments = await prisma.comment.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const articleIds = [...new Set(comments.map((comment) => comment.articleId))];
    const articles = articleIds.length
      ? await prisma.article.findMany({
          where: { id: { in: articleIds } },
          include: { category: true },
        })
      : [];

    const articleMap = new Map(articles.map((article) => [article.id, article]));

    return NextResponse.json(
      comments.map((comment) => ({
        ...comment,
        article: articleMap.get(comment.articleId) ?? null,
      })),
    );
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
