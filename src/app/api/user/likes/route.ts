import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveCurrentUserId } from '@/lib/current-user';

export async function GET(request: NextRequest) {
  try {
    const userId = await resolveCurrentUserId(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const likes = await prisma.like.findMany({
      where: { userId },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
            mainImageUrl: true,
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(likes);
  } catch (error) {
    console.error('Error fetching likes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
