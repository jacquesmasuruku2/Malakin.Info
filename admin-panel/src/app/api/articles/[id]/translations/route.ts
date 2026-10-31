import { after, NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-session';
import { processTranslationJob } from '@/lib/translation/jobs';

export const maxDuration = 180;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const locale = request.nextUrl.searchParams.get('locale');
  if (!locale) {
    return NextResponse.json({ error: 'Locale is required.' }, { status: 400 });
  }

  try {
    const [article, translation, job] = await Promise.all([
      prisma.article.findUnique({
        where: { id },
        select: { id: true, defaultLocale: true, translationSourceUpdatedAt: true },
      }),
      prisma.articleTranslation.findUnique({
        where: { articleId_locale: { articleId: id, locale } },
      }),
      prisma.translationJob.findUnique({
        where: { articleId_locale: { articleId: id, locale } },
      }),
    ]);

    if (!article) return NextResponse.json({ error: 'Article not found.' }, { status: 404 });

    const categoryTranslation = await prisma.article.findUnique({
      where: { id },
      select: {
        category: {
          select: {
            id: true,
            title: true,
            description: true,
            defaultLocale: true,
            translations: {
              where: { locale },
              select: { title: true, description: true },
              take: 1,
            },
          },
        },
      },
    });

    return NextResponse.json({
      translation,
      job,
      sourceUpdatedAt: article.translationSourceUpdatedAt,
      category: categoryTranslation?.category
        ? {
            id: categoryTranslation.category.id,
            ...(
              categoryTranslation.category.translations[0]
              ?? (categoryTranslation.category.defaultLocale === locale
                ? {
                    title: categoryTranslation.category.title,
                    description: categoryTranslation.category.description,
                  }
                : { title: '', description: '' })
            ),
          }
        : null,
    });
  } catch (error) {
    console.error('[article translations GET]', error);
    return NextResponse.json({ error: 'Failed to load translations.' }, { status: 500 });
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
  if (!['fr', 'en', 'es', 'sw', 'ln', 'rw'].includes(locale)) {
    return NextResponse.json({ error: 'Unsupported target locale.' }, { status: 400 });
  }

  try {
    const article = await prisma.article.findUnique({
      where: { id },
      select: { id: true, defaultLocale: true, translationSourceUpdatedAt: true },
    });
    if (!article) return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
    if (article.defaultLocale === locale) {
      return NextResponse.json({ error: 'The target locale is already the source language.' }, { status: 400 });
    }

    const [existingTranslation, existingJob] = await Promise.all([
      prisma.articleTranslation.findUnique({
        where: { articleId_locale: { articleId: id, locale } },
        select: { status: true, sourceUpdatedAt: true },
      }),
      prisma.translationJob.findUnique({
        where: { articleId_locale: { articleId: id, locale } },
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
      && existingTranslation.sourceUpdatedAt?.getTime() === article.translationSourceUpdatedAt.getTime()
      && body.force !== true
    ) {
      return NextResponse.json({ error: 'A current published translation already exists.' }, { status: 409 });
    }

    const job = await prisma.translationJob.upsert({
      where: { articleId_locale: { articleId: id, locale } },
      update: {
        status: 'queued',
        lastError: null,
        sourceUpdatedAt: article.translationSourceUpdatedAt,
        queuedAt: new Date(),
        startedAt: null,
        finishedAt: null,
      },
      create: {
        articleId: id,
        locale,
        status: 'queued',
        sourceUpdatedAt: article.translationSourceUpdatedAt,
      },
    });

    after(async () => {
      await processTranslationJob(job.id);
    });

    return NextResponse.json({ jobId: job.id, status: 'queued' }, { status: 202 });
  } catch (error) {
    console.error('[article translations POST]', error);
    return NextResponse.json({ error: 'Failed to queue translation.' }, { status: 500 });
  }
}
