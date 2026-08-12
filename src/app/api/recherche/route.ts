import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function buildTerms(query: string) {
  return query
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function buildArticleFilters(term: string) {
  return {
    OR: [
      { title: { contains: term, mode: 'insensitive' as const } },
      { excerpt: { contains: term, mode: 'insensitive' as const } },
      { category: { title: { contains: term, mode: 'insensitive' as const } } },
      { author: { name: { contains: term, mode: 'insensitive' as const } } },
    ],
  };
}

function buildAuthorFilters(term: string) {
  return {
    OR: [
      { name: { contains: term, mode: 'insensitive' as const } },
      { bio: { contains: term, mode: 'insensitive' as const } },
    ],
  };
}

function buildMediaFilters(term: string) {
  return {
    OR: [
      { title: { contains: term, mode: 'insensitive' as const } },
      { description: { contains: term, mode: 'insensitive' as const } },
    ],
  };
}

function buildLiveFilters(term: string) {
  return {
    OR: [
      { title: { contains: term, mode: 'insensitive' as const } },
      { description: { contains: term, mode: 'insensitive' as const } },
      { category: { title: { contains: term, mode: 'insensitive' as const } } },
    ],
  };
}

function buildCategoryFilters(term: string) {
  return {
    title: { contains: term, mode: 'insensitive' as const },
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';

    if (!query) {
      return NextResponse.json([]);
    }

    const terms = buildTerms(query);

    const [articles, authors, medias, lives, categories] = await Promise.all([
      prisma.article.findMany({
        where: {
          AND: terms.map(buildArticleFilters),
        },
        include: {
          category: true,
        },
        orderBy: {
          publishedAt: 'desc',
        },
        take: 50,
      }),
      prisma.author.findMany({
        where: {
          AND: terms.map(buildAuthorFilters),
        },
        orderBy: {
          name: 'asc',
        },
        take: 20,
      }),
      prisma.media.findMany({
        where: {
          AND: terms.map(buildMediaFilters),
        },
        orderBy: {
          publishedAt: 'desc',
        },
        take: 50,
      }),
      prisma.liveEvent.findMany({
        where: {
          AND: terms.map(buildLiveFilters),
        },
        include: {
          category: true,
        },
        orderBy: {
          startTime: 'desc',
        },
        take: 50,
      }),
      prisma.category.findMany({
        where: {
          AND: terms.map(buildCategoryFilters),
        },
        orderBy: {
          title: 'asc',
        },
        take: 20,
      }),
    ]);

    const results = [
      ...articles.map((article) => ({
        id: article.id,
        type: 'article' as const,
        title: article.title,
        excerpt: article.excerpt,
        slug: article.slug,
        category: article.category?.title || '',
        categorySlug: article.category?.slug || '',
        date: article.publishedAt ? article.publishedAt.toISOString() : '',
        readTime: article.readTime || '',
        path: `/articles/${article.slug}`,
      })),
      ...authors.map((author) => ({
        id: author.id,
        type: 'author' as const,
        title: author.name,
        excerpt: author.bio || '',
        slug: author.slug,
        path: `/auteurs/${author.slug}`,
      })),
      ...medias.map((media) => ({
        id: media.id,
        type: 'media' as const,
        title: media.title,
        excerpt: media.description || '',
        path: `/medias/${media.id}`,
      })),
      ...lives.map((live) => ({
        id: live.id,
        type: 'live' as const,
        title: live.title,
        excerpt: live.description || '',
        category: live.category?.title || '',
        date: live.startTime.toISOString(),
        path: `/medias/live/${live.id}`,
      })),
      ...categories.map((category) => ({
        id: category.id,
        type: 'category' as const,
        title: category.title,
        excerpt: category.description || '',
        path: `/${category.slug}`,
      })),
    ];

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 });
  }
}
