import Link from 'next/link';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { getCategoryArticles } from '@/lib/get-category-articles';
import { applyArticleLocales } from '@/lib/translation';

type CategoryArticlesListProps = {
  locale: string;
  slugs: string[];
  title: string;
  description: string;
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
  const isFrench = locale === 'fr';

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {backHref && (
            <Link href={backHref} className="text-gray-300 hover:text-white mb-4 inline-block">
              ← {backLabel || (isFrench ? "Retour à l'accueil" : 'Back to home')}
            </Link>
          )}
          <h1 className="font-heading text-4xl font-bold mb-4">{title}</h1>
          <p className="text-xl text-gray-200">{description}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {articles.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
            <p className="text-lg font-medium text-foreground">
              {isFrench
                ? 'Aucun article n’est encore publié dans cette rubrique.'
                : 'No articles have been published in this section yet.'}
            </p>
            <p className="mt-2 text-muted-foreground">
              {isFrench
                ? 'Revenez bientôt ou parcourez les dernières actualités.'
                : 'Please check back soon or browse the latest news.'}
            </p>
            <Link
              href={`/${locale}/actualites`}
              className="mt-6 inline-flex items-center text-primary hover:text-primary/80 font-medium"
            >
              {isFrench ? 'Voir les actualités' : 'See the news'}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((item) => (
              <article
                key={item.id}
                className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {item.mainImageUrl && (
                  <div className="relative h-48">
                    <Link href={`/${locale}/${item.slug}`}>
                      <img
                        src={item.mainImageUrl}
                        alt={item.mainImageAlt || item.title}
                        className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                      />
                    </Link>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(item.publishedAt).toLocaleDateString(isFrench ? 'fr-FR' : 'en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    {item.readTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {item.readTime}
                      </span>
                    )}
                  </div>
                  <h2 className="font-heading text-xl font-semibold text-foreground mb-2 line-clamp-2">
                    {item.title}
                  </h2>
                  <p className="text-muted-foreground line-clamp-2 mb-4">{item.excerpt}</p>
                  <Link
                    href={`/${locale}/${item.slug}`}
                    className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
                  >
                    {isFrench ? 'Lire la suite' : 'Read more'}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
