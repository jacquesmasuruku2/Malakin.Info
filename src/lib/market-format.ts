function getNumberLocale(locale: string) {
  switch (locale) {
    case 'fr':
      return 'fr-FR';
    case 'es':
      return 'es-ES';
    case 'sw':
      return 'sw-KE';
    case 'rw':
      return 'rw-RW';
    default:
      return 'en-US';
  }
}

export function convertMarketValue(
  valueUsd: number,
  exchangeRates: Record<string, number>,
  currency: string,
) {
  const rate = exchangeRates[currency];
  if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
    throw new Error(`Exchange rate is unavailable for ${currency}.`);
  }
  return valueUsd * rate;
}

export function formatMarketPrice(value: number, locale: string, currency = 'USD') {
  return new Intl.NumberFormat(getNumberLocale(locale), {
    style: 'currency',
    currency,
    maximumSignificantDigits: 7,
  }).format(value);
}

export function formatMarketPairPrice(value: number, locale: string, quoteCurrency: string) {
  const number = new Intl.NumberFormat(getNumberLocale(locale), {
    maximumSignificantDigits: 7,
  }).format(value);
  return `${number} ${quoteCurrency}`;
}

export function formatMarketPercent(value: number | null, locale: string) {
  if (value === null) return '—';

  return `${new Intl.NumberFormat(getNumberLocale(locale), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}%`;
}

export function formatMarketCompactCurrency(value: number | null, locale: string, currency = 'USD') {
  if (value === null) return '—';

  return new Intl.NumberFormat(getNumberLocale(locale), {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatMarketTime(value: string, locale: string) {
  return new Intl.DateTimeFormat(getNumberLocale(locale), {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Kinshasa',
  }).format(new Date(value));
}
