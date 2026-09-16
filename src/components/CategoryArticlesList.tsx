import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getCategoryArticles } from '@/lib/get-category-articles';
import { applyArticleLocales } from '@/lib/translation';
import { t } from '@/lib/copy';
import ArticleListingGrid from '@/components/ArticleListingGrid';

type CategoryArticlesListProps = {
  locale: string;
  slugs: string[];
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
};

export default async function CategoryArticlesList({
  locale,
  slugs,
  title,
  description,
  backHref,
  backLabel,
}: CategoryArticlesListProps) {
  const { articles: rawArticles } = await getCategoryArticles(slugs);
  const articles = await applyArticleLocales(rawArticles, locale);

  return (
    <div className="tag-page bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pt-14">
        {backHref ? (
          <Link
            href={backHref}
            className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground"
          >
            ← {backLabel || t(locale, 'backHome')}
          </Link>
        ) : null}
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3 sm:mb-4">
          {title}
        </h1>
        {description ? (
          <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-3xl">
            {description}
          </p>
        ) : (
          <div className="mb-8 sm:mb-10" />
        )}

        {articles.length === 0 ? (
          <div className="py-10">
            <p className="text-lg font-medium text-foreground">
              {t(locale, 'noArticlesInSection')}
            </p>
            <p className="mt-2 text-muted-foreground">{t(locale, 'checkBackSoon')}</p>
            <Link
              href={`/${locale}/actualites`}
              className="mt-6 inline-flex items-center text-primary hover:text-primary/80 font-medium"
            >
              {t(locale, 'seeNews')}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        ) : (
          <ArticleListingGrid articles={articles} locale={locale} />
        )}
      </div>
    </div>
  );
}
