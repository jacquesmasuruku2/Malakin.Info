import { after, NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-session';
import { processBlogPostTranslationJob } from '@/lib/translation/jobs';

export const maxDuration = 180;

const locales = ['fr', 'en', 'es', 'sw', 'ln', 'rw'];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const locale = request.nextUrl.searchParams.get('locale');
  if (!locale || !locales.includes(locale)) {
    return NextResponse.json({ error: 'A supported locale is required.' }, { status: 400 });
  }

  try {
    const [post, translation, job] = await Promise.all([
      prisma.blogPost.findUnique({
        where: { id },
        select: { id: true, defaultLocale: true, translationSourceUpdatedAt: true },
      }),
      prisma.blogPostTranslation.findUnique({
        where: { blogPostId_locale: { blogPostId: id, locale } },
      }),
      prisma.blogPostTranslationJob.findUnique({
        where: { blogPostId_locale: { blogPostId: id, locale } },
      }),
    ]);
    if (!post) return NextResponse.json({ error: 'Blog post not found.' }, { status: 404 });

    return NextResponse.json({
      translation,
      job,
      sourceUpdatedAt: post.translationSourceUpdatedAt,
    });
  } catch (error) {
    console.error('[blog post translations GET]', error);
    return NextResponse.json({ error: 'Failed to load blog translation.' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  let body: { locale?: unknown; force?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const locale = typeof body.locale === 'string' ? body.locale.toLowerCase() : '';
  if (!locales.includes(locale)) {
    return NextResponse.json({ error: 'Unsupported target locale.' }, { status: 400 });
  }

  try {
    const post = await prisma.blogPost.findUnique({
      where: { id },
      select: { id: true, defaultLocale: true, translationSourceUpdatedAt: true },
    });
    if (!post) return NextResponse.json({ error: 'Blog post not found.' }, { status: 404 });
    if (post.defaultLocale === locale) {
      return NextResponse.json({ error: 'Target locale matches the source language.' }, { status: 400 });
    }

    const [existingTranslation, existingJob] = await Promise.all([
      prisma.blogPostTranslation.findUnique({
        where: { blogPostId_locale: { blogPostId: id, locale } },
        select: { status: true, sourceUpdatedAt: true },
      }),
      prisma.blogPostTranslationJob.findUnique({
        where: { blogPostId_locale: { blogPostId: id, locale } },
        select: { status: true, startedAt: true },
      }),
    ]);

    if (
      existingJob?.status === 'processing'
      && (!existingJob.startedAt || Date.now() - existingJob.startedAt.getTime() < 5 * 60 * 1000)
    ) {
      return NextResponse.json({ error: 'A translation task is already running.' }, { status: 409 });
    }
    if (
      existingTranslation?.status === 'published'
      && existingTranslation.sourceUpdatedAt?.getTime() === post.translationSourceUpdatedAt.getTime()
      && body.force !== true
    ) {
      return NextResponse.json({ error: 'A current published translation already exists.' }, { status: 409 });
    }

    const job = await prisma.blogPostTranslationJob.upsert({
      where: { blogPostId_locale: { blogPostId: id, locale } },
      update: {
        status: 'queued',
        lastError: null,
        sourceUpdatedAt: post.translationSourceUpdatedAt,
        queuedAt: new Date(),
        startedAt: null,
        finishedAt: null,
      },
      create: {
        blogPostId: id,
        locale,
        status: 'queued',
        sourceUpdatedAt: post.translationSourceUpdatedAt,
      },
    });

    after(async () => processBlogPostTranslationJob(job.id));
    return NextResponse.json({ jobId: job.id, status: 'queued' }, { status: 202 });
  } catch (error) {
    console.error('[blog post translations POST]', error);
    return NextResponse.json({ error: 'Failed to queue blog translation.' }, { status: 500 });
  }
}
