import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const post = await prisma.blogPost.update({
      where: { id },
      data: { views: { increment: 1 } },
      select: { views: true },
    });
    return NextResponse.json({ success: true, views: Number(post.views) });
  } catch (error) {
    console.error('[blog view increment]', error);
    return NextResponse.json({ error: 'Failed to increment blog views.' }, { status: 500 });
  }
}
