import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { withRetry } from '@/lib/database';
import ArticleAuthorLink from '@/components/ArticleAuthorLink';
import { applyArticleLocales, applyCategoryLocales } from '@/lib/translation';
import { getDateLocale, t, pickCopy } from '@/lib/copy';
import { getArchiveYears, isValidArchiveYear, yearRange } from '@/lib/archives';

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

export const dynamic = 'force-dynamic';

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

  const [articlesResult, totalArticlesResult, categoriesResult, articleCountsResult, actualitesCategory, archiveYears] = await Promise.all([
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
    withRetry(() => prisma.category.findMany()),
    withRetry(() => prisma.article.groupBy({
      by: ['categoryId'],
      _count: {
        categoryId: true,
      },
    })),
    withRetry(() => prisma.category.findUnique({
      where: { slug: 'actualites' }
    })),
    getArchiveYears(),
  ]);

  const articles = await applyArticleLocales(articlesResult || [], locale);
  const categories = await applyCategoryLocales(categoriesResult || [], locale);
  const totalArticles = totalArticlesResult || 0;
  const totalPages = Math.max(1, Math.ceil(totalArticles / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  if (currentPage !== safeCurrentPage) {
    redirect(actualitesHref(locale, { page: safeCurrentPage, year: selectedYear }));
  }

  const articleCounts = articleCountsResult || [];
  const articleCountMap = new Map(
    articleCounts.map((item) => [item.categoryId, item._count.categoryId])
  );

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

  // Format categories for display
  const categoryList: { name: string; href: string; count: number }[] = categories.map((cat: any) => ({
    name: cat.title,
    href: `/${locale}/${cat.slug}`,
    count: articleCountMap.get(cat.id) ?? 0,
  }));

  // Format articles for display
  const news: { id: string; category: string; categorySlug: string; title: string; excerpt: string; image: string | null; date: string; readTime: string; slug: string; author: any }[] = articles.map((article: any) => ({
    id: article.id,
    category: article.category?.title || t(locale, 'news'),
    categorySlug: article.category?.slug || 'actualites',
    title: article.title,
    excerpt: article.excerpt,
    image: article.mainImageUrl,
    date: article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(getDateLocale(locale), { day: 'numeric', month: 'long', year: 'numeric' }) : '',
    readTime: article.readTime || '5 min',
    slug: article.slug,
    author: article.author,
  }));

  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold mb-4">{t(locale, 'news')}</h1>
          <p className="text-xl text-gray-200">
            {pickCopy(locale, {
              fr: "Suivez l'actualité africaine et internationale en temps réel",
              en: 'Follow African and international news in real time',
              es: 'Sigue la actualidad africana e internacional en tiempo real',
              sw: 'Fuata habari za Afrika na za kimataifa kwa wakati halisi',
              ln: 'Landá sango ya Afrique mpe ya mokili na tango yango',
              rw: 'Kurikira amakuru y’Afurika n’ay’isi mu gihe nyacyo',
            })}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Live Events Section */}
        {liveEvents.length > 0 && (
          <section className="mb-12">
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                {t(locale, 'liveEvents')}
              </h2>
              <p className="text-red-100">{t(locale, 'followLives')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveEvents.map((live: any) => (
                <Link
                  key={live.id}
                  href={`/${locale}/medias/live/${live.id}`}
                  className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {live.thumbnail && (
                    <div className="relative h-48">
                      <img
                        src={live.thumbnail}
                        alt={live.title}
                        className="w-full h-full object-cover"
                      />
                      <span className={`absolute top-4 left-4 px-3 py-1 text-white text-xs font-medium rounded-full ${
                        live.status === 'LIVE' ? 'bg-red-600 animate-pulse' : 'bg-blue-600'
                      }`}>
                        {live.status === 'LIVE' ? t(locale, 'live') : t(locale, 'scheduled')}
                      </span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-2 line-clamp-2">
                      {live.title}
                    </h3>
                    {live.description && (
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                        {live.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
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
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 gap-8">
          <div>
            {news.length > 0 ? (
              <>
                <div className="mb-8 border-b border-border pb-6">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-heading text-2xl font-black uppercase tracking-[0.06em] text-foreground">
                      {selectedYear
                        ? `${t(locale, 'news')} ${selectedYear}`
                        : t(locale, 'latestStories')}
                    </h2>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary">
                      {t(locale, 'localEdition')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {news.map((item) => (
                    <article
                      key={item.id}
                      className="group overflow-hidden border border-border bg-card text-card-foreground transition-all duration-200 hover:-translate-y-1 hover:border-secondary"
                    >
                      {item.image && (
                        <Link href={`/${locale}/${item.slug}`} className="relative block h-52 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <span className="absolute bottom-3 left-3 inline-flex items-center bg-foreground px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-background">
                            {item.category}
                          </span>
                        </Link>
                      )}
                      <div className="p-5">
                        <div className="mb-3 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          <span>{item.date}</span>
                          <span className="text-secondary">•</span>
                          <span>{item.readTime}</span>
                        </div>
                        <ArticleAuthorLink author={item.author} locale={locale} className="text-xs text-muted-foreground" />
                        <h3 className="font-heading text-[1.5rem] font-black leading-tight tracking-[-0.03em] text-foreground transition-colors group-hover:text-secondary line-clamp-3">
                          <Link href={`/${locale}/${item.slug}`}>
                            {item.title}
                          </Link>
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                          {item.excerpt}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>

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
              <div className="bg-card rounded-lg p-12 text-center">
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
      </div>
    </div>
  );
}
