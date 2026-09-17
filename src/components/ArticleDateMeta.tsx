import {
  articleModifiedLabel,
  formatArticleDate,
  wasArticleModified,
} from '@/lib/article-dates';

export default function ArticleDateMeta({
  locale,
  publishedAt,
  updatedAt,
  className = '',
}: {
  locale: string;
  publishedAt: Date | string | null | undefined;
  updatedAt?: Date | string | null;
  className?: string;
}) {
  const published = formatArticleDate(publishedAt, locale);
  if (!published) return null;

  const showModified = wasArticleModified(publishedAt, updatedAt);
  const modified = showModified ? formatArticleDate(updatedAt, locale) : '';

  return (
    <span className={className}>
      <time dateTime={publishedAt ? new Date(publishedAt).toISOString() : undefined}>
        {published}
      </time>
      {showModified && modified ? (
        <>
          <span aria-hidden className="mx-1.5 text-muted-foreground/50">
            ·
          </span>
          <time dateTime={updatedAt ? new Date(updatedAt).toISOString() : undefined}>
            {articleModifiedLabel(locale)} {modified}
          </time>
        </>
      ) : null}
    </span>
  );
}
