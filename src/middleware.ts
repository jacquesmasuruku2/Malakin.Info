import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { defaultLocale, isSupportedLocale, supportedLocales } from '@/lib/i18n';

const PAGE_ALIASES: Record<string, string> = {
  about: 'a-propos',
  news: 'actualites',
  privacy: 'politique-confidentialite',
  'privacy-policy': 'politique-confidentialite',
  terms: 'conditions-utilisation',
  legal: 'mentions-legales',
  'test-authors': 'equipe',
};

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname === '/rss.xml' || pathname.startsWith('/rss.xml')) {
    return NextResponse.next();
  }

  const pathnameIsMissingLocale = supportedLocales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const cookieLocale = request.cookies.get('app-locale')?.value;
    const locale = isSupportedLocale(cookieLocale) ? cookieLocale : defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length >= 2) {
    const [locale, slug] = segments;
    if (
      slug === 'blog' &&
      supportedLocales.includes(locale as (typeof supportedLocales)[number])
    ) {
      return NextResponse.redirect(new URL(`/${locale}/actualites`, request.url), 308);
    }
    if (
      slug === 'nous-soutenir' &&
      segments[2] === 'faire-un-don' &&
      supportedLocales.includes(locale as (typeof supportedLocales)[number])
    ) {
      return NextResponse.redirect(new URL(`/${locale}/nous-soutenir`, request.url), 308);
    }
    const alias = PAGE_ALIASES[slug];
    if (alias && supportedLocales.includes(locale as (typeof supportedLocales)[number])) {
      const rest = segments.slice(2).join('/');
      const nextPath = `/${locale}/${alias}${rest ? `/${rest}` : ''}`;
      return NextResponse.redirect(new URL(nextPath, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|images|favicon.ico|ads.txt|robots.txt|sitemap.xml|rss.xml).*)'],
};
