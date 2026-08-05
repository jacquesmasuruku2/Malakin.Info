export function getApiUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'http://localhost:3000';
  return `${baseUrl}${path}`;
}
