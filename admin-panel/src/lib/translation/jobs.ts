import 'server-only';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { translateArticleContent, translateText } from '@/lib/translation/translator';

export async function processNextTranslationJob(): Promise<{
  jobId: string | null;
  contentType?: 'article' | 'blog';
  status: string;
  attempts?: number;
  lastError?: string | null;
}> {
  const staleBefore = new Date(Date.now() - 5 * 60 * 1000);
  const staleJobFilter = {
    status: 'processing',
    OR: [{ startedAt: null }, { startedAt: { lt: staleBefore } }],
  };
  const requeueMessage = 'The previous worker stopped before this task completed; it has been requeued.';
  await Promise.all([
    prisma.translationJob.updateMany({
      where: staleJobFilter,
      data: { status: 'queued', startedAt: null, finishedAt: null, lastError: requeueMessage },
    }),
    prisma.blogPostTranslationJob.updateMany({
      where: staleJobFilter,
      data: { status: 'queued', startedAt: null, finishedAt: null, lastError: requeueMessage },
    }),
  ]);

  const [nextArticleJob, nextBlogJob] = await Promise.all([
    prisma.translationJob.findFirst({
      where: { status: 'queued' },
      orderBy: [{ queuedAt: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, queuedAt: true },
    }),
    prisma.blogPostTranslationJob.findFirst({
      where: { status: 'queued' },
      orderBy: [{ queuedAt: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, queuedAt: true },
    }),
  ]);
  if (!nextArticleJob && !nextBlogJob) return { jobId: null, status: 'idle' };

  const isBlogJob = !nextArticleJob
    || Boolean(nextBlogJob && nextBlogJob.queuedAt < nextArticleJob.queuedAt);
  const nextJob = isBlogJob ? nextBlogJob! : nextArticleJob!;
  if (isBlogJob) {
    await processBlogPostTranslationJob(nextJob.id);
  } else {
    await processTranslationJob(nextJob.id);
  }
  const completedJob = isBlogJob
    ? await prisma.blogPostTranslationJob.findUnique({
        where: { id: nextJob.id },
        select: { status: true, attempts: true, lastError: true },
      })
    : await prisma.translationJob.findUnique({
        where: { id: nextJob.id },
        select: { status: true, attempts: true, lastError: true },
      });

  return {
    jobId: nextJob.id,
    contentType: isBlogJob ? 'blog' : 'article',
    status: completedJob?.status || 'missing',
    attempts: completedJob?.attempts,
    lastError: completedJob?.lastError,
  };
}

export async function processBlogPostTranslationJob(jobId: string): Promise<void> {
  const job = await prisma.blogPostTranslationJob.findUnique({
    where: { id: jobId },
    include: { blogPost: true },
  });
  if (!job || job.status !== 'queued') return;

  const claimed = await prisma.blogPostTranslationJob.updateMany({
    where: { id: job.id, status: 'queued' },
    data: {
      status: 'processing',
      attempts: { increment: 1 },
      startedAt: new Date(),
      finishedAt: null,
      lastError: null,
    },
  });
  if (claimed.count !== 1) return;

  try {
    const blogPost = job.blogPost;
    if (
      job.sourceUpdatedAt
      && job.sourceUpdatedAt.getTime() !== blogPost.translationSourceUpdatedAt.getTime()
    ) {
      await prisma.blogPostTranslationJob.update({
        where: { id: job.id },
        data: {
          status: 'failed',
          lastError: 'The source blog post changed after this translation task was queued.',
          finishedAt: new Date(),
        },
      });
      return;
    }

    const [title, excerpt, content, mainImageAlt] = await Promise.all([
      translateText(blogPost.title, blogPost.defaultLocale, job.locale),
      translateText(blogPost.excerpt, blogPost.defaultLocale, job.locale),
      translateArticleContent(blogPost.content, blogPost.defaultLocale, job.locale),
      blogPost.mainImageAlt
        ? translateText(blogPost.mainImageAlt, blogPost.defaultLocale, job.locale)
        : Promise.resolve(null),
    ]);

    const latestBlogPost = await prisma.blogPost.findUnique({
      where: { id: blogPost.id },
      select: { translationSourceUpdatedAt: true },
    });
    if (
      !latestBlogPost
      || latestBlogPost.translationSourceUpdatedAt.getTime() !== blogPost.translationSourceUpdatedAt.getTime()
    ) {
      throw new Error('The source blog post changed while this translation task was running.');
    }

    const translatedContent = content === null ? Prisma.JsonNull : content as Prisma.InputJsonValue;
    await prisma.blogPostTranslation.upsert({
      where: { blogPostId_locale: { blogPostId: blogPost.id, locale: job.locale } },
      update: {
        title,
        excerpt,
        content: translatedContent,
        mainImageAlt,
        seoTitle: title,
        seoDescription: excerpt,
        status: 'draft',
        sourceUpdatedAt: blogPost.translationSourceUpdatedAt,
      },
      create: {
        blogPostId: blogPost.id,
        locale: job.locale,
        title,
        excerpt,
        content: translatedContent,
        mainImageAlt,
        seoTitle: title,
        seoDescription: excerpt,
        status: 'draft',
        sourceUpdatedAt: blogPost.translationSourceUpdatedAt,
      },
    });

    await prisma.blogPostTranslationJob.update({
      where: { id: job.id },
      data: { status: 'completed', finishedAt: new Date(), lastError: null },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown blog translation error';
    console.error(`[blog translation job ${jobId}]`, message);
    await prisma.blogPostTranslationJob.update({
      where: { id: jobId },
      data: { status: 'failed', lastError: message, finishedAt: new Date() },
    });
  }
}

export async function processTranslationJob(jobId: string): Promise<void> {
  const job = await prisma.translationJob.findUnique({
    where: { id: jobId },
    include: {
      article: {
        include: { category: true },
      },
    },
  });

  if (!job || job.status !== 'queued') return;

  const claimed = await prisma.translationJob.updateMany({
    where: { id: job.id, status: 'queued' },
    data: {
      status: 'processing',
      attempts: { increment: 1 },
      startedAt: new Date(),
      finishedAt: null,
      lastError: null,
    },
  });
  if (claimed.count !== 1) return;

  try {
    const article = job.article;
    if (
      job.sourceUpdatedAt
      && job.sourceUpdatedAt.getTime() !== article.translationSourceUpdatedAt.getTime()
    ) {
      await prisma.translationJob.update({
        where: { id: job.id },
        data: {
          status: 'failed',
          lastError: 'The source article changed after this translation task was queued.',
          finishedAt: new Date(),
        },
      });
      return;
    }

    const sourceLocale = article.defaultLocale || 'fr';
    const [title, excerpt, content, mainImageAlt, additionalImageDescriptions, categoryTranslation] = await Promise.all([
      translateText(article.title, sourceLocale, job.locale),
      translateText(article.excerpt, sourceLocale, job.locale),
      translateArticleContent(article.content, sourceLocale, job.locale),
      article.mainImageAlt
        ? translateText(article.mainImageAlt, sourceLocale, job.locale)
        : Promise.resolve(null),
      Array.isArray(article.additionalImageDescriptions)
        ? Promise.all(article.additionalImageDescriptions.map((description) =>
            typeof description === 'string'
              ? translateText(description, sourceLocale, job.locale)
              : Promise.resolve(description),
          ))
        : Promise.resolve(article.additionalImageDescriptions),
      prisma.categoryTranslation.findUnique({
        where: {
          categoryId_locale: {
            categoryId: article.categoryId,
            locale: job.locale,
          },
        },
      }),
    ]);

    if (!categoryTranslation && article.category.defaultLocale !== job.locale) {
      const [categoryTitle, categoryDescription] = await Promise.all([
        translateText(article.category.title, article.category.defaultLocale || 'fr', job.locale),
        article.category.description
          ? translateText(article.category.description, article.category.defaultLocale || 'fr', job.locale)
          : Promise.resolve(null),
      ]);
      await prisma.categoryTranslation.upsert({
        where: {
          categoryId_locale: {
            categoryId: article.categoryId,
            locale: job.locale,
          },
        },
        update: { title: categoryTitle, description: categoryDescription },
        create: {
          categoryId: article.categoryId,
          locale: job.locale,
          title: categoryTitle,
          description: categoryDescription,
        },
      });
    }

    const latestArticle = await prisma.article.findUnique({
      where: { id: article.id },
      select: { translationSourceUpdatedAt: true },
    });
    if (
      !latestArticle
      || latestArticle.translationSourceUpdatedAt.getTime() !== article.translationSourceUpdatedAt.getTime()
    ) {
      throw new Error('The source article changed while this translation task was running.');
    }

    await prisma.articleTranslation.upsert({
      where: {
        articleId_locale: {
          articleId: article.id,
          locale: job.locale,
        },
      },
      update: {
        title,
        excerpt,
        content: content === null ? Prisma.JsonNull : content as Prisma.InputJsonValue,
        mainImageAlt,
        additionalImageDescriptions: additionalImageDescriptions === null
          ? Prisma.DbNull
          : additionalImageDescriptions as Prisma.InputJsonValue,
        seoTitle: title,
        seoDescription: excerpt,
        status: 'draft',
        sourceUpdatedAt: article.translationSourceUpdatedAt,
      },
      create: {
        articleId: article.id,
        locale: job.locale,
        title,
        excerpt,
        content: content === null ? Prisma.JsonNull : content as Prisma.InputJsonValue,
        mainImageAlt,
        additionalImageDescriptions: additionalImageDescriptions === null
          ? Prisma.DbNull
          : additionalImageDescriptions as Prisma.InputJsonValue,
        seoTitle: title,
        seoDescription: excerpt,
        status: 'draft',
        sourceUpdatedAt: article.translationSourceUpdatedAt,
      },
    });

    await prisma.translationJob.update({
      where: { id: job.id },
      data: { status: 'completed', finishedAt: new Date(), lastError: null },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown translation error';
    console.error(`[translation job ${jobId}]`, message);
    await prisma.translationJob.update({
      where: { id: jobId },
      data: { status: 'failed', lastError: message, finishedAt: new Date() },
    });
  }
}
