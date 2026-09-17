import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { withRetry } from '@/lib/database';
import { applyArticleLocales } from '@/lib/translation';
import { getDateLocale, t, pickCopy } from '@/lib/copy';
import { getArchiveYears, isValidArchiveYear, yearRange } from '@/lib/archives';
import ArticleListingGrid from '@/components/ArticleListingGrid';

function actualitesHref(locale: string, options: { page?: number; year?: number | null }) {
  const params = new URLSearchParams();
  if (options.year) {
    params.set('year', String(options.year));
  }
  if (options.page && options.page > 1) {
    params.set('page', String(options.page));
  }
  const query = params.toString();
  return `/${locale}/actualites${query ? `?${query}` : ''}`;
}

function YearFilter({
  locale,
  years,
  selectedYear,
  className,
}: {
  locale: string;
  years: number[];
  selectedYear: number | null;
  className?: string;
}) {
  if (years.length === 0) {
    return null;
  }

  return (
    <nav className={className} aria-label={locale === 'fr' ? 'Filtrer par année' : 'Filter by year'}>
      {selectedYear ? (
        <Link href={actualitesHref(locale, {})} className="rounded-lg bg-muted px-4 py-2 transition-colors hover:bg-muted/80">
          {t(locale, 'all')}
        </Link>
      ) : (
        <span aria-current="page" className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">
          {t(locale, 'all')}
        </span>
      )}
      {years.map((year) => (
        year === selectedYear ? (
          <span key={year} aria-current="page" className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">{year}</span>
        ) : (
          <Link key={year} href={actualitesHref(locale, { year })} className="rounded-lg bg-muted px-4 py-2 transition-colors hover:bg-muted/80">
            {year}
          </Link>
        )
      ))}
    </nav>
  );
}

export const revalidate = 60;

export default async function ActualitesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams?: Promise<{ page?: string; year?: string }>
}) {
  const { locale } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const requestedPage = Number.parseInt(resolvedSearchParams.page || '1', 10);
  const currentPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const requestedYear = Number.parseInt(resolvedSearchParams.year || '', 10);
  const selectedYear = isValidArchiveYear(requestedYear) ? requestedYear : null;
  const pageSize = 12;
  const publishedWhere = selectedYear ? { publishedAt: yearRange(selectedYear) } : undefined;

  const [articlesResult, totalArticlesResult, actualitesCategory, archiveYears] = await Promise.all([
    withRetry(() => prisma.article.findMany({
      where: publishedWhere,
      include: {
        category: true,
        author: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    } as any)),
    withRetry(() => prisma.article.count({ where: publishedWhere })),
    withRetry(() => prisma.category.findUnique({
      where: { slug: 'actualites' }
    })),
    getArchiveYears(),
  ]);

  const articles = await applyArticleLocales(articlesResult || [], locale);
  const totalArticles = totalArticlesResult || 0;
  const totalPages = Math.max(1, Math.ceil(totalArticles / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  if (currentPage !== safeCurrentPage) {
    redirect(actualitesHref(locale, { page: safeCurrentPage, year: selectedYear }));
  }

  const liveEvents = actualitesCategory ? await withRetry(() => prisma.liveEvent.findMany({
    where: {
      categoryId: actualitesCategory.id,
      OR: [
        { status: 'LIVE' },
        { status: 'SCHEDULED' }
      ]
    },
    orderBy: {
      startTime: 'desc'
    },
  })) || [] : [];

  return (
    <div className="tag-page bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pt-14">
        <Link
          href={`/${locale}`}
          className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← {t(locale, 'backHome')}
        </Link>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3 sm:mb-4">
          {t(locale, 'news')}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-3xl">
          {pickCopy(locale, {
            fr: "Suivez l'actualité africaine et internationale en temps réel",
            en: 'Follow African and international news in real time',
            es: 'Sigue la actualidad africana e internacional en tiempo real',
            sw: 'Fuata habari za Afrika na za kimataifa kwa wakati halisi',
            ln: 'Landá sango ya Afrique mpe ya mokili na tango yango',
            rw: 'Kurikira amakuru y’Afurika n’ay’isi mu gihe nyacyo',
          })}
        </p>

        {liveEvents.length > 0 && (
          <section className="mb-12">
            <div className="mb-6">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
                {t(locale, 'liveEvents')}
              </h2>
              <p className="text-muted-foreground">{t(locale, 'followLives')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveEvents.map((live: any) => (
                <Link
                  key={live.id}
                  href={`/${locale}/medias/live/${live.id}`}
                  className="group block"
                >
                  {live.thumbnail && (
                    <div className="relative mb-3 aspect-[16/10] overflow-hidden bg-muted">
                      <img
                        src={live.thumbnail}
                        alt={live.title}
                        className="h-full w-full object-cover transition-opacity duration-200 group-hover:opacity-90"
                      />
                      <span className={`absolute top-3 left-3 px-2 py-0.5 text-white text-[11px] font-bold uppercase tracking-wide ${
                        live.status === 'LIVE' ? 'bg-red-600 animate-pulse' : 'bg-blue-600'
                      }`}>
                        {live.status === 'LIVE' ? t(locale, 'live') : t(locale, 'scheduled')}
                      </span>
                    </div>
                  )}
                  <h3 className="text-[1.05rem] font-bold leading-snug text-foreground group-hover:text-primary line-clamp-2">
                    {live.title}
                  </h3>
                  {live.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {live.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{new Date(live.startTime).toLocaleDateString(getDateLocale(locale), {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                    {live.viewerCount > 0 && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        {live.viewerCount} {t(locale, 'viewers')}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {articles.length > 0 ? (
          <>
            <div className="mb-8">
              <h2 className="font-heading text-2xl font-bold text-foreground">
                {selectedYear
                  ? `${t(locale, 'news')} ${selectedYear}`
                  : t(locale, 'latestStories')}
              </h2>
            </div>

            <ArticleListingGrid articles={articles} locale={locale} />

            {totalPages > 1 && (
              <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label={locale === 'fr' ? 'Pagination des actualités' : 'News pagination'}>
                {safeCurrentPage > 1 ? (
                  <Link href={actualitesHref(locale, { page: safeCurrentPage - 1, year: selectedYear })} className="rounded-lg bg-muted px-4 py-2 transition-colors hover:bg-muted/80">
                    {t(locale, 'previous')}
                  </Link>
                ) : (
                  <span className="cursor-not-allowed rounded-lg bg-muted px-4 py-2 text-muted-foreground/50">{locale === 'fr' ? 'Précédent' : 'Previous'}</span>
                )}

                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  page === safeCurrentPage ? (
                    <span key={page} aria-current="page" className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">{page}</span>
                  ) : (
                    <Link key={page} href={actualitesHref(locale, { page, year: selectedYear })} className="rounded-lg bg-muted px-4 py-2 transition-colors hover:bg-muted/80">
                      {page}
                    </Link>
                  )
                ))}

                {safeCurrentPage < totalPages ? (
                  <Link href={actualitesHref(locale, { page: safeCurrentPage + 1, year: selectedYear })} className="rounded-lg bg-muted px-4 py-2 transition-colors hover:bg-muted/80">
                    {t(locale, 'next')}
                  </Link>
                ) : (
                  <span className="cursor-not-allowed rounded-lg bg-muted px-4 py-2 text-muted-foreground/50">{locale === 'fr' ? 'Suivant' : 'Next'}</span>
                )}
              </nav>
            )}

            {archiveYears.length > 0 && (
              <YearFilter
                locale={locale}
                years={archiveYears}
                selectedYear={selectedYear}
                className="mt-4 flex flex-wrap items-center justify-center gap-2"
              />
            )}
          </>
        ) : (
          <div className="py-10 text-center">
            <p className="text-muted-foreground text-lg">
              {selectedYear
                ? pickCopy(locale, {
                    fr: `Aucune actualité pour ${selectedYear}.`,
                    en: `No articles for ${selectedYear}.`,
                    es: `No hay artículos de ${selectedYear}.`,
                    sw: `Hakuna makala ya ${selectedYear}.`,
                    ln: `Article ezali te mpo na ${selectedYear}.`,
                    rw: `Nta nkuru za ${selectedYear}.`,
                  })
                : t(locale, 'noArticles')}
            </p>
            <YearFilter
              locale={locale}
              years={archiveYears}
              selectedYear={selectedYear}
              className="mt-6 flex flex-wrap items-center justify-center gap-2"
            />
          </div>
        )}
      </div>
    </div>
  );
}
