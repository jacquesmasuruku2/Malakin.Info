import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveCurrentUser } from '@/lib/current-user';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await resolveCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const comments = await prisma.comment.findMany({
      where: { userId: currentUser.id },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
            mainImageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await resolveCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const commentId = typeof body.commentId === 'string' ? body.commentId : '';
    const content = typeof body.content === 'string' ? body.content.trim() : '';

    if (!commentId || !content) {
      return NextResponse.json({ error: 'Comment ID and content are required' }, { status: 400 });
    }

    const comment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        userId: currentUser.id,
      },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: comment.id },
      data: { content },
    });

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
