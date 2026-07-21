import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, userId } = body;

    if (!articleId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // For development: create user if doesn't exist
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          email: `${userId}@test.local`,
          name: 'Utilisateur Test',
          passwordHash: 'test',
        },
      });
    }

    // Check if user already liked the article
    const existingLike = await prisma.like.findUnique({
      where: {
        articleId_userId: {
          articleId,
          userId,
        },
      },
    });

    if (existingLike) {
      // Unlike: remove the like
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
    } else {
      // Like: create a new like
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
    }
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
    const userId = searchParams.get('userId');

    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    const likeCount = await prisma.like.count({
      where: { articleId },
    });

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
