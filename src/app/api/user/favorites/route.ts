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

    const articleId = request.nextUrl.searchParams.get('articleId');

    if (articleId) {
      const favorite = await prisma.userFavorite.findUnique({
        where: {
          userId_articleId: {
            userId,
            articleId,
          },
        },
      });

      return NextResponse.json({ favorited: !!favorite });
    }

    const favorites = await prisma.userFavorite.findMany({
      where: { userId },
      include: {
        article: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await resolveCurrentUserId(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { articleId } = body;

    if (!articleId) {
      return NextResponse.json({ error: 'Article ID required' }, { status: 400 });
    }

    const existing = await prisma.userFavorite.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });

    if (existing) {
      await prisma.userFavorite.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ favorited: false });
    }

    const favorite = await prisma.userFavorite.create({
      data: {
        userId,
        articleId,
      },
    });

    return NextResponse.json({ favorited: true, favorite });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
