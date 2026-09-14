import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveCurrentUser } from '@/lib/current-user';
import { sendTelegramMessage } from '@/lib/telegram';

export async function POST(request: NextRequest) {
  try {
    const user = await resolveCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const articleId = typeof body.articleId === 'string' ? body.articleId : '';
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    const parentId = typeof body.parentId === 'string' ? body.parentId : null;

    if (!articleId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        articleId,
        userId: user.id,
        content,
        parentId,
        status: 'approved',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    const telegramResult = await sendTelegramMessage(
      `Nouveau commentaire sur l'article ${articleId} de ${comment.user?.name || user.email} :\n${content}`
    );
    console.log('Telegram notification result (comment):', telegramResult);

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
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

    const comments = await prisma.comment.findMany({
      where: {
        articleId,
        status: 'approved',
        parentId: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const replies = await prisma.comment.findMany({
      where: {
        articleId,
        status: 'approved',
        parentId: { not: null },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const commentsWithReplies = comments.map((comment) => ({
      ...comment,
      replies: replies.filter((reply) => reply.parentId === comment.id),
    }));

    return NextResponse.json(commentsWithReplies);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}
