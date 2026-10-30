export function buildSponsoredTrackingUrl(targetUrl: string, origin: string = 'https://malakinfo.com') {
  if (!targetUrl) return targetUrl;

  const raw = targetUrl.trim();

  if (!raw) return raw;

  const hasProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(raw);

  if (raw.startsWith('/')) {
    return raw;
  }

  let finalUrl: URL;

  if (!hasProtocol) {
    if (raw.startsWith('//')) {
      finalUrl = new URL(`https:${raw}`);
    } else if (/^(?:www\.)?[a-z0-9.-]+\.[a-z]{2,}(?:[/?#]|$)/i.test(raw)) {
      finalUrl = new URL(`https://${raw}`);
    } else {
      finalUrl = new URL(raw, origin);
    }
  } else {
    finalUrl = new URL(raw);
  }

  finalUrl.searchParams.set('utm_source', 'malakinfo');
  finalUrl.searchParams.set('utm_medium', 'sponsor');
  finalUrl.searchParams.set('utm_campaign', 'article_sponsor');

  return finalUrl.toString();
}
