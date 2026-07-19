// Temporarily disabled to fix redirect loop
// import createMiddleware from 'next-intl/middleware';

export default function middleware(request: Request) {
  // Disabled middleware to prevent redirect loop
  return;
}

// export default createMiddleware({
//   // A list of all locales that are supported
//   locales: ['fr', 'en'],

//   // Used when no locale matches
//   defaultLocale: 'fr'
// });

export const config = {
  // Match only internationalized pathnames
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
