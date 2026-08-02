import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['fr', 'en']
const defaultLocale = 'fr'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    // Redirect to default locale
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname}`, request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  // Matcher ignoring `/_next/`, `/api/`, and static files
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|ads.txt|robots.txt|sitemap.xml).*)'],
}
