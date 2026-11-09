export function getArticleUrl(
  locale: string,
  slug: string,
  publishedAt?: Date | string | null,
) {
  const date = publishedAt ? new Date(publishedAt) : null;
  const dateSegment = date && !Number.isNaN(date.getTime())
    ? date.toISOString().slice(0, 10)
    : null;

  return `/${locale}/${dateSegment ? `${dateSegment}/` : ''}${slug}`;
}