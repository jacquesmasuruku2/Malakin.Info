import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncArticleTags, tagsFromArticle } from '@/lib/tags';
import { ensureArticlePublicImages } from '@/lib/r2';
import { revalidatePublicArticle } from '@/lib/revalidate-site';

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      include: {
        category: true,
        author: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Convert BigInt to number for JSON serialization
    const serializedArticles = articles.map(article => ({
      ...article,
      views: Number(article.views),
    }));
    
    return NextResponse.json(serializedArticles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch articles',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const body = await ensureArticlePublicImages(rawBody);
    const article = await prisma.article.create({
      data: {
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt,
        content: body.content,
        categoryId: body.categoryId,
        authorId: body.authorId || null,
        defaultLocale: body.defaultLocale || 'fr',
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date(),
        featured: body.featured || false,
        isPremium: body.isPremium || false,
        premiumPrice: body.premiumPrice ? parseFloat(body.premiumPrice) : null,
        readTime: body.readTime,
        mainImageUrl: body.mainImageUrl,
        mainImageAlt: body.mainImageAlt || null,
        externalLink: body.externalLink || null,
        additionalImages: body.additionalImages || [],
        additionalImageDescriptions: body.additionalImageDescriptions || [],
      },
      include: {
        category: true,
        author: true,
        articleTags: { include: { tag: true } },
      },
    });
    await syncArticleTags(article.id, body.tags, body.content);
    const withTags = await prisma.article.findUnique({
      where: { id: article.id },
      include: {
        category: true,
        author: true,
        articleTags: { include: { tag: true } },
      },
    });
    const saved = withTags || article;
    await revalidatePublicArticle({
      slug: saved.slug,
      categorySlug: saved.category?.slug,
    });
    return NextResponse.json({
      ...saved,
      views: Number(saved.views),
      tags: tagsFromArticle(saved),
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json({ 
      error: 'Failed to create article',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
