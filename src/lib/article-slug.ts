export function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildArticleSlug(title: string, publishedAt?: string | Date | null): string {
  const safeDate = publishedAt ? new Date(publishedAt) : new Date();
  const validDate = Number.isNaN(safeDate.getTime()) ? new Date() : safeDate;
  const datePart = validDate.toISOString().slice(0, 10).replace(/-/g, '');
  const slugBase = normalizeSlug(title) || 'article';

  return `${datePart}-${slugBase}`.replace(/-+/g, '-').replace(/^-|-$/g, '');
}

export function stripDatePrefix(slug: string): string {
  return slug.replace(/^\d{8}-/, '');
}

export function getArticleSlugCandidates(slug: string): string[] {
  const cleaned = slug.trim();
  if (!cleaned) return [];

  const stripped = stripDatePrefix(cleaned);
  return Array.from(new Set([cleaned, stripped].filter(Boolean)));
}

export function isDatePrefixedSlug(slug: string): boolean {
  return /^\d{8}-/.test(slug);
}
