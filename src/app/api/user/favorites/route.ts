import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveCurrentUserId } from '@/lib/current-user';

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
