/** Fuseau éditorial MalakInfo : UTC+2 (RDC Est). */
export const SITE_TIMEZONE = 'Africa/Lubumbashi';

const pad = (n: number | string) => String(n).padStart(2, '0');

/** Format a Date/ISO string for `<input type="datetime-local" />` in SITE_TIMEZONE. */
export function toDatetimeLocalValue(value: string | Date | null | undefined): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: SITE_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value || '00';

  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

/**
 * Parse admin publishedAt values as SITE_TIMEZONE (UTC+2), not server UTC.
 * - `datetime-local` / `YYYY-MM-DDTHH:mm` → that clock time in Africa/Lubumbashi
 * - `YYYY-MM-DD` only → same calendar day with *current* SITE_TIMEZONE clock (avoids 00:00)
 */
export function parseArticlePublishedAt(value: string | null | undefined): Date | undefined {
  if (!value?.trim()) return undefined;
  const trimmed = value.trim();

  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/.exec(trimmed);
  if (!match) {
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  let hour = match[4] !== undefined ? Number(match[4]) : undefined;
  let minute = match[5] !== undefined ? Number(match[5]) : 0;
  let second = match[6] !== undefined ? Number(match[6]) : 0;

  if (hour === undefined) {
    const nowParts = new Intl.DateTimeFormat('en-GB', {
      timeZone: SITE_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date());
    const get = (type: Intl.DateTimeFormatPartTypes) =>
      Number(nowParts.find((part) => part.type === type)?.value || 0);
    hour = get('hour');
    minute = get('minute');
    second = get('second');
  }

  // Convert "wall clock in UTC+2" → absolute UTC instant.
  return new Date(Date.UTC(year, month - 1, day, hour - 2, minute, second));
}
