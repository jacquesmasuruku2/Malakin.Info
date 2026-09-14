import { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { withRetry } from '@/lib/database';
import { getArchiveYears, isValidArchiveYear, yearRange } from '@/lib/archives';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>;
}): Promise<Metadata> {
  const { year } = await params;
  return {
    title: `Archives ${year} - Malakinfo.com`,
    description: `Les articles publiés par MalakInfo en ${year}.`,
  };
}

export default async function ArchiveYearPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; year: string }>;
  searchParams?: Promise<{ page?: string }>;
}) {
  const { locale, year: yearParam } = await params;
  const year = Number(yearParam);
  const isFrench = locale === 'fr';

  if (!isValidArchiveYear(year)) {
    notFound();
  }

  const years = await getArchiveYears();
  if (years.length > 0 && !years.includes(year)) {
    notFound();
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const requestedPage = Number.parseInt(resolvedSearchParams.page || '1', 10);
  const currentPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const pageSize = 12;
  const range = yearRange(year);

  const [articles, totalArticles] = await Promise.all([
    withRetry(() =>
      prisma.article.findMany({
        where: { publishedAt: range },
        include: { category: true, author: true },
        orderBy: { publishedAt: 'desc' },
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
      })
    ),
    withRetry(() => prisma.article.count({ where: { publishedAt: range } })),
  ]);

  const publishedArticles = articles || [];
  const publishedCount = totalArticles || 0;
  const totalPages = Math.max(1, Math.ceil(publishedCount / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  if (currentPage !== safeCurrentPage) {
    const query = safeCurrentPage === 1 ? '' : `?page=${safeCurrentPage}`;
    redirect(`/${locale}/archives/${year}${query}`);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href={`/${locale}/archives`} className="text-sm text-primary hover:underline">
          {isFrench ? '← Toutes les années' : '← All years'}
        </Link>

        <h1 className="font-heading text-4xl font-bold text-foreground mt-6 mb-3">
          {isFrench ? `Archives ${year}` : `${year} archives`}
        </h1>
        <p className="text-muted-foreground mb-8">
          {publishedCount}{' '}
          {isFrench
            ? publishedCount > 1
              ? 'articles publiés cette année.'
              : 'article publié cette année.'
            : publishedCount === 1
              ? 'article published this year.'
              : 'articles published this year.'}
        </p>

        {years.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {years.map((item) => (
              <Link
                key={item}
                href={`/${locale}/archives/${item}`}
                className={`inline-flex min-w-[4.5rem] items-center justify-center rounded-full border px-4 py-2 text-sm transition-colors ${
                  item === year
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-foreground hover:border-primary hover:text-primary'
                }`}
              >
                {item}
              </Link>
            ))}
          </div>
        )}

        {publishedArticles.length === 0 ? (
          <p className="text-muted-foreground">
            {isFrench ? 'Aucun article pour cette année.' : 'No articles for this year.'}
          </p>
        ) : (
          <ul className="space-y-4">
            {publishedArticles.map((article) => (
              <li key={article.id}>
                <Link
                  href={`/${locale}/${article.slug}`}
                  className="group flex flex-col gap-4 border border-border rounded-xl overflow-hidden bg-card sm:flex-row hover:border-primary/40 transition-colors"
                >
                  <div className="h-40 w-full shrink-0 bg-muted sm:h-auto sm:w-48">
                    {article.mainImageUrl && (
                      <img src={article.mainImageUrl} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 p-4 sm:py-5 sm:pr-5">
                    {article.category?.title && (
                      <p className="text-xs uppercase tracking-wide text-primary">{article.category.title}</p>
                    )}
                    <h2 className="mt-1 font-heading text-xl font-bold text-foreground group-hover:text-primary">
                      {article.title}
                    </h2>
                    {article.excerpt && (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{article.excerpt}</p>
                    )}
                    <p className="mt-3 text-xs text-muted-foreground">
                      {new Date(article.publishedAt).toLocaleDateString(isFrench ? 'fr-FR' : 'en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label={isFrench ? 'Pagination des archives' : 'Archives pagination'}>
            {safeCurrentPage > 1 ? (
              <Link
                href={`/${locale}/archives/${year}?page=${safeCurrentPage - 1}`}
                className="rounded-lg bg-muted px-4 py-2 hover:bg-muted/80"
              >
                {isFrench ? 'Précédent' : 'Previous'}
              </Link>
            ) : null}
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) =>
              page === safeCurrentPage ? (
                <span key={page} className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">
                  {page}
                </span>
              ) : (
                <Link
                  key={page}
                  href={`/${locale}/archives/${year}?page=${page}`}
                  className="rounded-lg bg-muted px-4 py-2 hover:bg-muted/80"
                >
                  {page}
                </Link>
              )
            )}
            {safeCurrentPage < totalPages ? (
              <Link
                href={`/${locale}/archives/${year}?page=${safeCurrentPage + 1}`}
                className="rounded-lg bg-muted px-4 py-2 hover:bg-muted/80"
              >
                {isFrench ? 'Suivant' : 'Next'}
              </Link>
            ) : null}
          </nav>
        )}
      </div>
    </div>
  );
}
