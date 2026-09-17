const DATE_LOCALES: Record<string, string> = {
  fr: 'fr-FR',
  en: 'en-US',
  es: 'es-ES',
  sw: 'sw-KE',
  ln: 'fr-FR',
  rw: 'fr-FR',
};

export function formatArticleDate(
  value: Date | string | null | undefined,
  locale: string,
): string {
  if (!value) return '';
  return new Date(value).toLocaleString(DATE_LOCALES[locale] || 'fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/** True when the article was edited after publication (ignore tiny clock skew). */
export function wasArticleModified(
  publishedAt: Date | string | null | undefined,
  updatedAt: Date | string | null | undefined,
): boolean {
  if (!publishedAt || !updatedAt) return false;
  const published = new Date(publishedAt).getTime();
  const updated = new Date(updatedAt).getTime();
  if (Number.isNaN(published) || Number.isNaN(updated)) return false;
  return updated - published > 60_000;
}

export function articleModifiedLabel(locale: string): string {
  return locale === 'fr' ? 'Modifié le' : 'Updated';
}
