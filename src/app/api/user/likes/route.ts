import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

async function resolveCurrentUserId(request: NextRequest) {
  // Try NextAuth session first (for Google OAuth users)
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    return session.user.id;
  }
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (user) {
      return user.id;
    }
  }

  // Then try Authorization header (from localStorage)
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const customSession = await prisma.session.findUnique({
      where: { token },
    });
    if (customSession) {
      return customSession.userId;
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

  return customSession?.userId ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await resolveCurrentUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const likes = await prisma.like.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const articleIds = [...new Set(likes.map((like) => like.articleId))];
    const articles = articleIds.length
      ? await prisma.article.findMany({
          where: { id: { in: articleIds } },
          include: { category: true },
        } as any)
      : [];

    const articleMap = new Map(articles.map((article) => [article.id, article]));

    return NextResponse.json(
      likes.map((like) => ({
        ...like,
        article: articleMap.get(like.articleId) ?? null,
      })),
    );
  } catch (error) {
    console.error('Error fetching likes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
