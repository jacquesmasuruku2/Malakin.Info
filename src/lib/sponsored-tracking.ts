export function buildSponsoredTrackingUrl(targetUrl: string, origin: string = 'https://malakinfo.com') {
  if (!targetUrl) return targetUrl;

  try {
    const url = new URL(targetUrl, origin);
    url.searchParams.set('utm_source', 'malakinfo');
    url.searchParams.set('utm_medium', 'sponsor');
    url.searchParams.set('utm_campaign', 'article_sponsor');
    return url.toString();
  } catch {
    const separator = targetUrl.includes('?') ? '&' : '?';
    return `${targetUrl}${separator}utm_source=malakinfo&utm_medium=sponsor&utm_campaign=article_sponsor`;
  }
}
