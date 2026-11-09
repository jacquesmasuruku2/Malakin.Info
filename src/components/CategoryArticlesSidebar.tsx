import Link from 'next/link';
import type { ListingArticle } from '@/components/ArticleListingGrid';
import SmartImage from '@/components/SmartImage';
import { getDateLocale } from '@/lib/copy';
import { getArticleUrl } from '@/lib/article-url';

export default function CategoryArticlesSidebar({
  articles,
  locale,
  categoryTitle,
}: {
  articles: ListingArticle[];
  locale: string;
  categoryTitle?: string;
}) {
  const isEnglish = locale === 'en';
  const defaultHeading = isEnglish ? 'More in this section' : 'À lire aussi dans cette rubrique';
  const headingPrefix = isEnglish ? 'More in' : 'À lire aussi :';
  const heading = categoryTitle ? `${headingPrefix} ${categoryTitle}` : defaultHeading;

  return (
    <section aria-labelledby="category-articles-title" className="w-full">
      <h2 id="category-articles-title" className="mb-4 font-heading text-lg font-bold text-foreground">
        {heading}
      </h2>
      {articles.length ? (
        <ol className="divide-y divide-border">
          {articles.map((article) => {
            const publishedAt = article.publishedAt ? new Date(article.publishedAt) : null;

            return (
              <li key={article.id} className="py-3 first:pt-0 last:pb-0">
                <Link
                  href={getArticleUrl(locale, article.slug, article.publishedAt)}
                  className="group flex gap-3"
                >
                  {article.mainImageUrl ? (
                    <span className="relative h-16 w-20 shrink-0 overflow-hidden rounded-sm">
                      <SmartImage
                        src={article.mainImageUrl}
                        alt={article.mainImageAlt || article.title}
                        fill
                        sizes="80px"
                        className="object-cover transition-opacity group-hover:opacity-90"
                      />
                    </span>
                  ) : (
                    <span aria-hidden="true" className="h-16 w-20 shrink-0 rounded-sm bg-muted" />
                  )}
                  <span className="min-w-0">
                    <span className="line-clamp-3 text-sm font-semibold leading-5 text-foreground transition-colors group-hover:text-primary">
                      {article.title}
                    </span>
                    {publishedAt && (
                      <time
                        dateTime={publishedAt.toISOString()}
                        className="mt-1 block text-xs text-muted-foreground"
                      >
                        {publishedAt.toLocaleDateString(getDateLocale(locale), {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </time>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="text-sm text-muted-foreground">
          {isEnglish ? 'No other articles in this section yet.' : 'Aucun autre article dans cette rubrique pour le moment.'}
        </p>
      )}
    </section>
  );
}
