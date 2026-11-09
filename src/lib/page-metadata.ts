import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/site-legal';

export function getLocalizedPageMetadata(
  locale: string,
  pathname: string,
  title: string,
  description: string,
  alternateLocales: readonly string[] = ['fr', 'en'],
): Metadata {
  const localizedPath = `/${locale}${pathname}`;
  const canonical = `${SITE_URL}${localizedPath}`;
  const languages = Object.fromEntries(
    alternateLocales.map((alternateLocale) => [
      alternateLocale === 'fr' ? 'fr-FR' : 'en-US',
      `${SITE_URL}/${alternateLocale}${pathname}`,
    ]),
  );

  return {
    title,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      type: 'website',
      locale: locale === 'en' ? 'en_US' : 'fr_FR',
      url: canonical,
      title,
      description,
      siteName: SITE_NAME,
      images: [{ url: `${SITE_URL}/images/logo.png`, alt: SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/images/logo.png`],
    },
  };
}