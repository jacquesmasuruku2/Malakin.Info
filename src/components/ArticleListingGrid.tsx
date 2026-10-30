import Link from 'next/link';
import SmartImage from '@/components/SmartImage';
import { getDateLocale } from '@/lib/copy';

export type ListingArticle = {
  id: string;
  slug: string;
  title: string;
  publishedAt?: string | Date | null;
  dateLabel?: string | null;
  mainImageUrl?: string | null;
  mainImageAlt?: string | null;
  category?: { title?: string | null } | null;
  categoryTitle?: string | null;
};

export default function ArticleListingGrid({
  articles,
  locale,
  hrefFor,
}: {
  articles: ListingArticle[];
  locale: string;
  hrefFor?: (article: ListingArticle) => string;
}) {
  return (
    <div className="grid w-full max-w-full grid-cols-1 gap-x-6 gap-y-10 overflow-hidden sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((item, index) => {
        const href = hrefFor ? hrefFor(item) : `/${locale}/${item.slug}`;
        const categoryTitle = item.categoryTitle || item.category?.title || null;
        const publishedAt = item.publishedAt ? new Date(item.publishedAt) : null;

        return (
          <article key={item.id} className="tag-story min-w-0 max-w-full overflow-hidden">
            <Link href={href} prefetch className="group block min-w-0 w-full overflow-hidden">
              {item.mainImageUrl ? (
                <div className="mb-3 bg-white p-[5px]">
                  <div className="article-preview-frame relative aspect-[16/10] w-full overflow-hidden">
                    <SmartImage
                      src={item.mainImageUrl}
                      alt={item.mainImageAlt || item.title}
                      fill
                      priority={index < 3}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-opacity duration-200 group-hover:opacity-90"
                    />
                  </div>
                </div>
              ) : null}
              {categoryTitle ? (
                <span className="mb-1.5 inline-block bg-primary px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                  {categoryTitle}
                </span>
              ) : null}
              {publishedAt ? (
                <time
                  dateTime={publishedAt.toISOString()}
                  className="mb-1 block text-xs text-muted-foreground"
                >
                  {publishedAt.toLocaleDateString(getDateLocale(locale), {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </time>
              ) : item.dateLabel ? (
                <span className="mb-1 block text-xs text-muted-foreground">{item.dateLabel}</span>
              ) : null}
              <h2 className="line-clamp-3 overflow-wrap-anywhere break-words text-[1.05rem] font-bold leading-snug text-foreground group-hover:text-primary">
                {item.title}
              </h2>
            </Link>
          </article>
        );
      })}
    </div>
  );
}
