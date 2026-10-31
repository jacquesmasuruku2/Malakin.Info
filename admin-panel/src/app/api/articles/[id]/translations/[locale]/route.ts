import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-session';
import { revalidatePublicArticle } from '@/lib/revalidate-site';

function toJsonInput(value: unknown): Prisma.InputJsonValue {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (Array.isArray(value)) return value.map(toJsonInput);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, toJsonInput(item)]),
    );
  }
  throw new Error('Article translation content must be valid JSON.');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; locale: string }> },
) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id, locale } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const excerpt = typeof body.excerpt === 'string' ? body.excerpt.trim() : '';
  const status = body.status === 'published' ? 'published' : body.status === 'draft' ? 'draft' : null;
  if (!title || !excerpt || !status || body.content === undefined || body.content === null) {
    return NextResponse.json({ error: 'Title, excerpt, content and a valid status are required.' }, { status: 400 });
  }
  if (!['fr', 'en', 'es', 'sw', 'ln', 'rw'].includes(locale)) {
    return NextResponse.json({ error: 'Unsupported locale.' }, { status: 400 });
  }

  try {
    const article = await prisma.article.findUnique({
      where: { id },
      select: {
        id: true,
        defaultLocale: true,
        translationSourceUpdatedAt: true,
        slug: true,
        categoryId: true,
      },
    });
    if (!article) return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
    if (article.defaultLocale === locale) {
      return NextResponse.json({ error: 'Cannot translate an article into its source language.' }, { status: 400 });
    }

    const categoryTitle = typeof body.categoryTitle === 'string' ? body.categoryTitle.trim() : '';
    if (!categoryTitle) {
      return NextResponse.json({ error: 'Translated category title is required.' }, { status: 400 });
    }

    const [translation, , category] = await prisma.$transaction([
      prisma.articleTranslation.upsert({
        where: { articleId_locale: { articleId: id, locale } },
        update: {
          title,
          excerpt,
          content: toJsonInput(body.content),
          mainImageAlt: typeof body.mainImageAlt === 'string' ? body.mainImageAlt : null,
          additionalImageDescriptions: body.additionalImageDescriptions === undefined
            ? undefined
            : body.additionalImageDescriptions === null
              ? Prisma.DbNull
              : toJsonInput(body.additionalImageDescriptions),
          seoTitle: typeof body.seoTitle === 'string' ? body.seoTitle : null,
          seoDescription: typeof body.seoDescription === 'string' ? body.seoDescription : null,
          status,
          sourceUpdatedAt: article.translationSourceUpdatedAt,
        },
        create: {
          articleId: id,
          locale,
          title,
          excerpt,
          content: toJsonInput(body.content),
          mainImageAlt: typeof body.mainImageAlt === 'string' ? body.mainImageAlt : null,
          additionalImageDescriptions: body.additionalImageDescriptions === undefined
            ? undefined
            : body.additionalImageDescriptions === null
              ? Prisma.DbNull
              : toJsonInput(body.additionalImageDescriptions),
          seoTitle: typeof body.seoTitle === 'string' ? body.seoTitle : null,
          seoDescription: typeof body.seoDescription === 'string' ? body.seoDescription : null,
          status,
          sourceUpdatedAt: article.translationSourceUpdatedAt,
        },
      }),
      prisma.categoryTranslation.upsert({
        where: { categoryId_locale: { categoryId: article.categoryId, locale } },
        update: {
          title: categoryTitle,
          description: typeof body.categoryDescription === 'string' ? body.categoryDescription : null,
        },
        create: {
          categoryId: article.categoryId,
          locale,
          title: categoryTitle,
          description: typeof body.categoryDescription === 'string' ? body.categoryDescription : null,
        },
      }),
      prisma.category.findUnique({
        where: { id: article.categoryId },
        select: { slug: true },
      }),
    ]);

    await prisma.translationJob.updateMany({
      where: { articleId: id, locale, status: { in: ['queued', 'failed'] } },
      data: { status: 'completed', lastError: null, finishedAt: new Date() },
    });

    if (status === 'published') {
      await revalidatePublicArticle({
        slug: article.slug,
        categorySlug: category?.slug,
        paths: ['/sitemap.xml'],
      });
    }

    return NextResponse.json({ translation });
  } catch (error) {
    console.error('[article translation PUT]', error);
    return NextResponse.json({ error: 'Failed to save article translation.' }, { status: 500 });
  }
}
