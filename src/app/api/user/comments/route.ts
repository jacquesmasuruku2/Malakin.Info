import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

async function resolveCurrentUser(request: NextRequest) {
  // Try NextAuth session first (for Google OAuth users)
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    return prisma.user.findUnique({ where: { id: session.user.id } });
  }

  // Then try Authorization header (from localStorage)
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const customSession = await prisma.session.findUnique({
      where: { token },
    });
    if (customSession) {
      return prisma.user.findUnique({ where: { id: customSession.userId } });
    }
  }

  // Finally try session token cookie
  const sessionToken = request.cookies.get('session_token')?.value;
  if (!sessionToken) {
    return null;
  }

  const customSession = await prisma.session.findUnique({
    where: { token: sessionToken },
  });

  if (!customSession) {
    return null;
  }

  return prisma.user.findUnique({ where: { id: customSession.userId } });
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await resolveCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
