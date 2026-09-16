import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { applyArticleLocales } from '@/lib/translation';
import { pickCopy, t } from '@/lib/copy';
import { getMessages } from '@/lib/i18n';
import ArticleListingGrid from '@/components/ArticleListingGrid';

export const dynamic = 'force-dynamic';

export default async function EducationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = getMessages(locale);
  let articles: any[] = [];

  try {
    const category = await prisma.category.findUnique({
      where: { slug: 'education-et-enseignement' },
    });

    if (category) {
      articles = await prisma.article.findMany({
        where: { categoryId: category.id },
        include: { category: true, author: true },
        orderBy: { publishedAt: 'desc' },
        take: 24,
      } as any);
      articles = await applyArticleLocales(articles, locale);
    }
  } catch (error) {
    console.error('Education page database error:', error);
  }

  const title = messages.nav.education;
  const description = pickCopy(locale, {
    fr: 'Actualités éducatives, enseignement, formations et innovations pédagogiques en Afrique et dans le monde.',
    en: 'Educational news, teaching, training and pedagogical innovations in Africa and around the world.',
    es: 'Actualidad educativa, enseñanza, formación e innovaciones pedagógicas en África y el mundo.',
    sw: 'Habari za elimu, ufundishaji, mafunzo na uvumbuzi wa kielimu Afrika na duniani.',
    ln: 'Sango ya éducation, enseignement, ba formation mpe ba innovation pédagogique na Afrique.',
    rw: 'Amakuru y’uburezi, kwigisha, amahugurwa n’udushya mu Afurika no ku isi.',
  });
  const emptyMessage = pickCopy(locale, {
    fr: 'Aucun article éducatif disponible pour le moment.',
    en: 'No educational articles available at the moment.',
    es: 'Todavía no hay artículos educativos.',
    sw: 'Bado hakuna makala ya elimu.',
    ln: 'Article ya éducation ezali naino te.',
    rw: 'Nta nkuru z’uburezi zirimo.',
  });

  return (
    <div className="tag-page bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pt-14">
        <Link
          href={`/${locale}/actualites`}
          className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← {t(locale, 'allNews')}
        </Link>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3 sm:mb-4">
          {title}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-3xl">
          {description}
        </p>

        {articles.length > 0 ? (
          <ArticleListingGrid articles={articles} locale={locale} />
        ) : (
          <div className="py-10 text-muted-foreground">
            <p className="text-lg font-medium text-foreground mb-2">{emptyMessage}</p>
            <p>{t(locale, 'checkBackSoon')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
