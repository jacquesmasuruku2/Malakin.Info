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

export function isArticlePathname(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length < 3 || !/^\d{4}-\d{2}-\d{2}$/.test(segments[1])) return false;

  const date = new Date(`${segments[1]}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === segments[1];
}