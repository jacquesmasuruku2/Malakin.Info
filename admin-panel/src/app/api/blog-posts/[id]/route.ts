import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-session';
import { parseArticlePublishedAt } from '@/lib/datetime-local';
import { revalidatePublicArticle } from '@/lib/revalidate-site';

function jsonInput(value: unknown): Prisma.InputJsonValue {
  if (value === null || value === undefined) throw new Error('Blog post content is required.');
  const result = jsonValue(value);
  if (result === null) throw new Error('Blog post content is required.');
  return result;
}

function jsonValue(value: unknown): Prisma.InputJsonValue | null {
  if (value === null) return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.map(jsonValue);
  if (!value || typeof value !== 'object') throw new Error('Blog post content must be valid JSON.');
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .map(([key, item]) => [key, jsonValue(item)]),
  ) as Prisma.InputJsonObject;
}

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

function blogPaths(slug?: string | null) {
  return [
    '/sitemap.xml',
    '/fr/blog',
    '/en/blog',
    ...(slug ? [`/fr/blog/${slug}`, `/en/blog/${slug}`] : []),
  ];
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { id } = await params;
    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true } } },
    });
    if (!post) return NextResponse.json({ error: 'Blog post not found.' }, { status: 404 });
    return NextResponse.json({ ...post, views: Number(post.views) });
  } catch (error) {
    console.error('[blog post GET]', error);
    return NextResponse.json({ error: 'Failed to load blog post.' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
  const excerpt = typeof body.excerpt === 'string' ? body.excerpt.trim() : '';
  const type = typeof body.type === 'string' ? body.type.trim() : '';
  const defaultLocale = typeof body.defaultLocale === 'string' ? body.defaultLocale : 'fr';
  const publishedAt = parseArticlePublishedAt(
    typeof body.publishedAt === 'string' ? body.publishedAt : undefined,
  );
  if (!title || !slug || !excerpt || !type || body.content == null || !publishedAt) {
    return NextResponse.json(
      { error: 'Title, slug, excerpt, content, type and publication date are required.' },
      { status: 400 },
    );
  }
  if (!['fr', 'en', 'es', 'sw', 'ln', 'rw'].includes(defaultLocale)) {
    return NextResponse.json({ error: 'Unsupported source locale.' }, { status: 400 });
  }

  try {
    const previous = await prisma.blogPost.findUnique({
      where: { id },
      select: {
        slug: true,
        title: true,
        excerpt: true,
        content: true,
        mainImageAlt: true,
        defaultLocale: true,
      },
    });
    if (!previous) return NextResponse.json({ error: 'Blog post not found.' }, { status: 404 });

    const sourceChanged = previous.title !== title
      || previous.excerpt !== excerpt
      || previous.defaultLocale !== defaultLocale
      || previous.mainImageAlt !== (typeof body.mainImageAlt === 'string' && body.mainImageAlt
        ? body.mainImageAlt
        : null)
      || stableJson(parseJsonContent(previous.content)) !== stableJson(parseJsonContent(body.content));

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        title,
        slug,
        excerpt,
        content: jsonInput(body.content),
        type,
        authorId: typeof body.authorId === 'string' && body.authorId ? body.authorId : null,
        publishedAt,
        mainImageUrl: typeof body.mainImageUrl === 'string' && body.mainImageUrl
          ? body.mainImageUrl
          : null,
        mainImageAlt: typeof body.mainImageAlt === 'string' && body.mainImageAlt
          ? body.mainImageAlt
          : null,
        readTime: typeof body.readTime === 'string' && body.readTime ? body.readTime : null,
        featured: body.featured === true,
        defaultLocale,
        ...(sourceChanged ? { translationSourceUpdatedAt: new Date() } : {}),
      },
      select: { id: true, slug: true, translationSourceUpdatedAt: true },
    });

    if (sourceChanged) {
      await Promise.all([
        prisma.blogPostTranslation.updateMany({
          where: { blogPostId: id },
          data: { status: 'outdated' },
        }),
        prisma.blogPostTranslationJob.updateMany({
          where: { blogPostId: id, status: { in: ['queued', 'processing'] } },
          data: {
            status: 'failed',
            lastError: 'The source blog post changed before translation completed.',
            finishedAt: new Date(),
          },
        }),
      ]);
    }

    await revalidatePublicArticle({
      slug: post.slug,
      paths: [...new Set([...blogPaths(post.slug), ...blogPaths(previous.slug)])],
    });
    return NextResponse.json(post);
  } catch (error) {
    console.error('[blog post PUT]', error);
    return NextResponse.json({ error: 'Failed to update blog post.' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { id } = await params;
    const post = await prisma.blogPost.findUnique({ where: { id }, select: { slug: true } });
    if (!post) return NextResponse.json({ error: 'Blog post not found.' }, { status: 404 });
    await prisma.blogPost.delete({ where: { id } });
    await revalidatePublicArticle({ paths: blogPaths(post.slug) });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[blog post DELETE]', error);
    return NextResponse.json({ error: 'Failed to delete blog post.' }, { status: 500 });
  }
}
