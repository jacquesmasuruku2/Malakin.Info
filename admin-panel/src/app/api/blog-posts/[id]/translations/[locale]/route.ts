import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-session';
import { revalidatePublicArticle } from '@/lib/revalidate-site';

function jsonInput(value: unknown): Prisma.InputJsonValue {
  if (value === null || value === undefined) throw new Error('Blog translation content is required.');
  const result = jsonValue(value);
  if (result === null) throw new Error('Blog translation content is required.');
  return result;
}

function jsonValue(value: unknown): Prisma.InputJsonValue | null {
  if (value === null) return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.map(jsonValue);
  if (!value || typeof value !== 'object') throw new Error('Blog translation content must be valid JSON.');
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .map(([key, item]) => [key, jsonValue(item)]),
  ) as Prisma.InputJsonObject;
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
  if (!['fr', 'en', 'es', 'sw', 'ln', 'rw'].includes(locale)) {
    return NextResponse.json({ error: 'Unsupported locale.' }, { status: 400 });
  }
  if (!title || !excerpt || !status || body.content == null) {
    return NextResponse.json({ error: 'Title, excerpt, content and a valid status are required.' }, { status: 400 });
  }

  try {
    const post = await prisma.blogPost.findUnique({
      where: { id },
      select: { id: true, defaultLocale: true, translationSourceUpdatedAt: true, slug: true },
    });
    if (!post) return NextResponse.json({ error: 'Blog post not found.' }, { status: 404 });
    if (post.defaultLocale === locale) {
      return NextResponse.json({ error: 'Cannot translate a blog post into its source language.' }, { status: 400 });
    }

    const translation = await prisma.blogPostTranslation.upsert({
      where: { blogPostId_locale: { blogPostId: id, locale } },
      update: {
        title,
        excerpt,
        content: jsonInput(body.content),
        mainImageAlt: typeof body.mainImageAlt === 'string' ? body.mainImageAlt : null,
        seoTitle: typeof body.seoTitle === 'string' ? body.seoTitle : null,
        seoDescription: typeof body.seoDescription === 'string' ? body.seoDescription : null,
        status,
        sourceUpdatedAt: post.translationSourceUpdatedAt,
      },
      create: {
        blogPostId: id,
        locale,
        title,
        excerpt,
        content: jsonInput(body.content),
        mainImageAlt: typeof body.mainImageAlt === 'string' ? body.mainImageAlt : null,
        seoTitle: typeof body.seoTitle === 'string' ? body.seoTitle : null,
        seoDescription: typeof body.seoDescription === 'string' ? body.seoDescription : null,
        status,
        sourceUpdatedAt: post.translationSourceUpdatedAt,
      },
    });

    if (status === 'published') {
      await prisma.blogPostTranslationJob.updateMany({
        where: { blogPostId: id, locale, status: { in: ['queued', 'failed'] } },
        data: { status: 'completed', lastError: null, finishedAt: new Date() },
      });
    }
    await revalidatePublicArticle({
      slug: post.slug,
      paths: ['/sitemap.xml', '/fr/blog', '/en/blog', `/fr/blog/${post.slug}`, `/en/blog/${post.slug}`],
    });
    return NextResponse.json({ translation });
  } catch (error) {
    console.error('[blog post translation PUT]', error);
    return NextResponse.json({ error: 'Failed to save blog translation.' }, { status: 500 });
  }
}
