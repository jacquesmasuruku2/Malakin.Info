import { after } from 'next/server';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-session';
import { parseArticlePublishedAt } from '@/lib/datetime-local';
import { processBlogPostTranslationJob } from '@/lib/translation/jobs';
import { revalidatePublicArticle } from '@/lib/revalidate-site';

export const maxDuration = 180;

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

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const posts = await prisma.blogPost.findMany({
      include: { author: { select: { id: true, name: true } } },
      orderBy: { publishedAt: 'desc' },
    });
    return NextResponse.json(posts.map((post) => ({ ...post, views: Number(post.views) })));
  } catch (error) {
    console.error('[blog posts GET]', error);
    return NextResponse.json({ error: 'Failed to load blog posts.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

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
  const translationLocale = typeof body.translationTargetLocale === 'string'
    ? body.translationTargetLocale
    : null;
  if (
    translationLocale
    && (!['fr', 'en', 'es', 'sw', 'ln', 'rw'].includes(translationLocale)
      || translationLocale === defaultLocale)
  ) {
    return NextResponse.json({ error: 'Unsupported translation target locale.' }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (transaction) => {
      const post = await transaction.blogPost.create({
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
        },
      });
      const job = translationLocale
        ? await transaction.blogPostTranslationJob.create({
            data: {
              blogPostId: post.id,
              locale: translationLocale,
              status: 'queued',
              sourceUpdatedAt: post.translationSourceUpdatedAt,
            },
          })
        : null;
      return { post, job };
    });
    if (result.job) {
      const jobId = result.job.id;
      after(async () => processBlogPostTranslationJob(jobId));
    }
    await revalidatePublicArticle({
      slug,
      paths: ['/sitemap.xml', '/fr/blog', '/en/blog', `/fr/blog/${slug}`, `/en/blog/${slug}`],
    });
    return NextResponse.json({
      ...result.post,
      views: Number(result.post.views),
      translationJobId: result.job?.id ?? null,
    }, { status: 201 });
  } catch (error) {
    console.error('[blog posts POST]', error);
    return NextResponse.json({ error: 'Failed to create blog post.' }, { status: 500 });
  }
}
