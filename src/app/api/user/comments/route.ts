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
        })
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
