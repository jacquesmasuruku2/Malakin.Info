export function getApiUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://malakinfo.com';
  return `${baseUrl}${path}`;
}
