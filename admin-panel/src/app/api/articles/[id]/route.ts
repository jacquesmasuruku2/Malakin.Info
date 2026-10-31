import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncArticleTags, tagsFromArticle } from '@/lib/tags';
import { tagNamesFromContent } from '@/lib/tag-name';
import { ensureArticlePublicImages } from '@/lib/r2';
import { revalidatePublicArticle } from '@/lib/revalidate-site';
import { parseArticlePublishedAt } from '@/lib/datetime-local';
import { buildArticleSlug } from '@/lib/article-slug';

export const maxDuration = 60;

function parseJsonContent(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
    if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    return NextResponse.json({
      ...article,
      views: Number(article.views),
      tags: tagsFromArticle(article),
    });
  } catch (error) {
    console.error('[articles GET]', error);
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const body = await ensureArticlePublicImages(rawBody);
    const publishedAt = parseArticlePublishedAt(body.publishedAt) || new Date();
    const generatedSlug = buildArticleSlug(body.title, publishedAt);
    const finalSlug = body.slug && /^\d{8}-/.test(String(body.slug)) ? body.slug : generatedSlug;

    const article = await prisma.article.create({
      data: {
        title: body.title,
        slug: finalSlug,
        excerpt: body.excerpt,
        content: body.content,
        categoryId: body.categoryId,
        authorId: body.authorId || null,
        defaultLocale: body.defaultLocale || 'fr',
        publishedAt,
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
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const rawBody = await request.json();
    const body = await ensureArticlePublicImages(rawBody);
    const previous = await prisma.article.findUnique({
      where: { id },
      select: {
        title: true,
        excerpt: true,
        content: true,
        mainImageAlt: true,
        additionalImageDescriptions: true,
        categoryId: true,
        defaultLocale: true,
      },
    });
    if (!previous) return NextResponse.json({ error: 'Article not found' }, { status: 404 });

    const sourceChanged = previous.title !== body.title
      || previous.excerpt !== body.excerpt
      || previous.categoryId !== body.categoryId
      || previous.defaultLocale !== (body.defaultLocale || 'fr')
      || previous.mainImageAlt !== (body.mainImageAlt || null)
      || stableJson(parseJsonContent(previous.additionalImageDescriptions))
        !== stableJson(parseJsonContent(body.additionalImageDescriptions || []))
      || stableJson(parseJsonContent(previous.content)) !== stableJson(parseJsonContent(body.content));
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
        ...(sourceChanged ? { translationSourceUpdatedAt: new Date() } : {}),
      },
      include: {
        category: true,
        author: true,
        articleTags: { include: { tag: true } },
      },
    });

    if (sourceChanged) {
      await Promise.all([
        prisma.articleTranslation.updateMany({
          where: { articleId: id },
          data: { status: 'outdated' },
        }),
        prisma.translationJob.updateMany({
          where: { articleId: id, status: { in: ['queued', 'processing'] } },
          data: {
            status: 'failed',
            lastError: 'The source article changed before translation completed.',
            finishedAt: new Date(),
          },
        }),
      ]);
    }

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
    await revalidatePublicArticle({
      slug: saved.slug,
      categorySlug: saved.category?.slug,
      paths: ['/sitemap.xml'],
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
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const existing = await prisma.article.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!existing) return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    await prisma.article.delete({ where: { id } });
    await revalidatePublicArticle({
      slug: existing.slug,
      categorySlug: existing.category?.slug,
      paths: ['/sitemap.xml'],
    });
    return NextResponse.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('[articles DELETE]', error);
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}
