/** Format a Date/ISO string for `<input type="datetime-local" />` in local timezone. */
export function toDatetimeLocalValue(value: string | Date | null | undefined): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Parse admin publishedAt values.
 * - `datetime-local` → exact local date/time
 * - `YYYY-MM-DD` only → same calendar day with *current* clock time (avoids 00:00)
 */
export function parseArticlePublishedAt(value: string | null | undefined): Date | undefined {
  if (!value?.trim()) return undefined;
  const trimmed = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split('-').map(Number);
    const now = new Date();
    return new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds());
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}
