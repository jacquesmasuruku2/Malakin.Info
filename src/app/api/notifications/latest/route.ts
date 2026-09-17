import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sinceParam = searchParams.get('since');
    const since = sinceParam ? new Date(sinceParam) : null;
    const validSince = since && !Number.isNaN(since.getTime()) ? since : null;
    const now = new Date();

    const articles = await prisma.article.findMany({
      where: {
        publishedAt: {
          lte: now,
          ...(validSince ? { gt: validSince } : {}),
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        mainImageUrl: true,
        publishedAt: true,
        category: { select: { title: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: validSince ? 8 : 3,
    });

    const jobOffers = await prisma.jobOffer.findMany({
      where: {
        publishedAt: {
          lte: now,
          ...(validSince ? { gt: validSince } : {}),
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        imageUrl: true,
        type: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: 3,
    });

    const publications = [
      ...articles.map((article) => ({
        id: article.id,
        kind: 'article' as const,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        imageUrl: article.mainImageUrl,
        publishedAt: article.publishedAt,
        label: article.category?.title || 'Article',
      })),
      ...jobOffers.map((offer) => ({
        id: offer.id,
        kind: 'job' as const,
        title: offer.title,
        slug: offer.slug,
        excerpt: offer.type,
        imageUrl: offer.imageUrl,
        publishedAt: offer.publishedAt,
        label: 'Emploi',
      })),
    ]
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 8);

    return NextResponse.json({
      publications,
      latestPublishedAt: publications[0]?.publishedAt || null,
      count: publications.length,
    });
  } catch (error) {
    console.error('Error fetching latest publications:', error);
    return NextResponse.json({ publications: [], count: 0, latestPublishedAt: null }, { status: 500 });
  }
}
