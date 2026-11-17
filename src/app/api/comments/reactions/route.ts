import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveCurrentUserId } from '@/lib/current-user';

const reactionTypes = new Set(['like', 'love', 'haha', 'wow', 'sad', 'angry']);

export async function POST(request: NextRequest) {
  try {
    const userId = await resolveCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const commentId = typeof body.commentId === 'string' ? body.commentId : '';
    const type = typeof body.type === 'string' ? body.type : '';

    if (!commentId || !reactionTypes.has(type)) {
      return NextResponse.json({ error: 'Invalid reaction' }, { status: 400 });
    }

    const comment = await prisma.comment.findFirst({
      where: { id: commentId, status: 'approved' },
      select: { id: true },
    });
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const existing = await prisma.commentReaction.findUnique({
      where: {
        commentId_userId: { commentId, userId },
      },
    });

    if (existing) {
      if (existing.type === type) {
        await prisma.commentReaction.delete({
          where: { id: existing.id },
        });
      } else {
        await prisma.commentReaction.update({
          where: { id: existing.id },
          data: { type },
        });
      }
    } else {
      await prisma.commentReaction.create({
        data: { commentId, userId, type },
      });
    }

    const reactions = await prisma.commentReaction.findMany({
      where: { commentId },
      select: { type: true, userId: true },
    });

    return NextResponse.json({ reactions });
  } catch (error) {
    console.error('Error updating comment reaction:', error);
    return NextResponse.json({ error: 'Failed to update reaction' }, { status: 500 });
  }
}
