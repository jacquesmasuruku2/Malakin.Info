import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedUser = session.user.id
      ? await prisma.user.findUnique({
          where: { id: session.user.id },
        })
      : null;

    const fallbackUser = !resolvedUser && session.user.email
      ? await prisma.user.findUnique({
          where: { email: session.user.email.toLowerCase() },
        })
      : null;

    const currentUser = resolvedUser ?? fallbackUser;

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const comments = await prisma.comment.findMany({
      where: { userId: currentUser.id },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const articleIds = [...new Set(comments.map((comment) => comment.articleId))];
    const articles = articleIds.length
      ? await prisma.article.findMany({
          where: { id: { in: articleIds } },
          include: { category: true },
        } as any)
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
