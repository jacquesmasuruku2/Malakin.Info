import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveCurrentUserId } from '@/lib/current-user';

export async function POST(request: NextRequest) {
  try {
    const userId = await resolveCurrentUserId(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const articleId = typeof body.articleId === 'string' ? body.articleId : '';

    if (!articleId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        articleId_userId: {
          articleId,
          userId,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });

      const likeCount = await prisma.like.count({
        where: { articleId },
      });

      return NextResponse.json({
        liked: false,
        likeCount,
      });
    }

    await prisma.like.create({
      data: {
        articleId,
        userId,
      },
    });

    const likeCount = await prisma.like.count({
      where: { articleId },
    });

    return NextResponse.json({
      liked: true,
      likeCount,
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const articleId = searchParams.get('articleId');

    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    const likeCount = await prisma.like.count({
      where: { articleId },
    });

    const userId = await resolveCurrentUserId(request);
    let isLiked = false;

    if (userId) {
      const existingLike = await prisma.like.findUnique({
        where: {
          articleId_userId: {
            articleId,
            userId,
          },
        },
      });
      isLiked = !!existingLike;
    }

    return NextResponse.json({
      likeCount,
      isLiked,
    });
  } catch (error) {
    console.error('Error fetching like status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch like status' },
      { status: 500 }
    );
  }
}
