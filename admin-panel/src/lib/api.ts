export function getApiUrl(path: string): string {
  if (!path) return path;

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (typeof window !== 'undefined') {
    return `${window.location.origin}${normalizedPath}`;
  }

  const configuredBaseUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || process.env.NEXT_PUBLIC_MAIN_SITE_URL;

  if (configuredBaseUrl) {
    return `${configuredBaseUrl.replace(/\/$/, '')}${normalizedPath}`;
  }

  return normalizedPath;
}
