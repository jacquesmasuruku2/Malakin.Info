import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncArticleTags, tagsFromArticle } from '@/lib/tags';
import { tagNamesFromContent } from '@/lib/tag-name';
import { ensureArticlePublicImages } from '@/lib/r2';
import { revalidatePublicArticle } from '@/lib/revalidate-site';
import { parseArticlePublishedAt } from '@/lib/datetime-local';

export const maxDuration = 60;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        category: true,
        author: true,
        articleTags: { include: { tag: true } },
      },
    });
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    return NextResponse.json({
      ...article,
      views: Number(article.views),
      tags: tagsFromArticle(article),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rawBody = await request.json();
    const body = await ensureArticlePublicImages(rawBody);
    const publishedAt = parseArticlePublishedAt(body.publishedAt);
    const article = await prisma.article.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt,
        content: body.content,
        categoryId: body.categoryId,
        authorId: body.authorId || null,
        defaultLocale: body.defaultLocale || 'fr',
        ...(publishedAt ? { publishedAt } : {}),
        featured: body.featured,
        isPremium: body.isPremium,
        premiumPrice: body.premiumPrice ? parseFloat(body.premiumPrice) : null,
        readTime: body.readTime ? String(body.readTime) : null,
        mainImageUrl: body.mainImageUrl || null,
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
    if (body.tags !== undefined) {
      await syncArticleTags(id, body.tags, body.content);
    } else {
      const extracted = tagNamesFromContent(body.content);
      if (extracted.length) {
        await syncArticleTags(id, [...tagsFromArticle(article), ...extracted], body.content);
      }
    }
    const withTags = await prisma.article.findUnique({
      where: { id },
      include: {
        category: true,
        author: true,
        articleTags: { include: { tag: true } },
      },
    });
    const saved = withTags || article;
    // Bounded wait: never hang the save if the public site is slow/unreachable.
    await revalidatePublicArticle({
      slug: saved.slug,
      categorySlug: saved.category?.slug,
    });
    return NextResponse.json({
      ...saved,
      views: Number(saved.views),
      tags: tagsFromArticle(saved),
    });
  } catch (error) {
    console.error('[articles PUT]', error);
    return NextResponse.json(
      {
        error: 'Failed to update article',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.article.findUnique({
      where: { id },
      include: { category: true },
    });
    await prisma.article.delete({
      where: { id },
    });
    await revalidatePublicArticle({
      slug: existing?.slug,
      categorySlug: existing?.category?.slug,
    });
    return NextResponse.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('[articles DELETE]', error);
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}
