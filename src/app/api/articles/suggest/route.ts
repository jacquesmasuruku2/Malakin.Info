import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const categoryId = request.nextUrl.searchParams.get('categoryId');
    const excludeId = request.nextUrl.searchParams.get('excludeId');

    if (!categoryId) {
      return NextResponse.json({ error: 'Category ID required' }, { status: 400 });
    }

    const articles = await prisma.article.findMany({
      where: {
        categoryId,
        ...(excludeId ? { id: { not: excludeId } } : {}),
        publishedAt: { lte: new Date() },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        mainImageUrl: true,
        category: {
          select: { title: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: 8,
    });

    if (articles.length === 0) {
      return NextResponse.json({ article: null });
    }

    const picked = articles[Math.floor(Math.random() * articles.length)];

    return NextResponse.json({
      article: {
        id: picked.id,
        title: picked.title,
        slug: picked.slug,
        excerpt: picked.excerpt,
        mainImageUrl: picked.mainImageUrl,
        categoryTitle: picked.category?.title ?? null,
      },
    });
  } catch (error) {
    console.error('Error suggesting article:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
