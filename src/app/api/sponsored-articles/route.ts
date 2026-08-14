import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');

    const sponsors = await prisma.sponsoredArticle.findMany({
      where: articleId ? { articleId, isActive: true } : { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(sponsors);
  } catch (error) {
    console.error('Error fetching sponsored articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sponsored articles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const sponsor = await prisma.sponsoredArticle.create({
      data: {
        articleId: body.articleId || null,
        title: body.title,
        imageUrl: body.imageUrl,
        targetUrl: body.targetUrl,
        sponsorName: body.sponsorName,
        categoryBadge: body.categoryBadge || 'Publicité',
        isActive: body.isActive ?? true,
        sortOrder: Number(body.sortOrder ?? 0),
      },
    });

    return NextResponse.json(sponsor, { status: 201 });
  } catch (error) {
    console.error('Error creating sponsored article:', error);
    return NextResponse.json(
      { error: 'Failed to create sponsored article' },
      { status: 500 }
    );
  }
}
