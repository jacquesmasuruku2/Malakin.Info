import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Pas de redirection i18n pour l'admin-panel
  // L'admin-panel n'utilise pas l'i18n
  return NextResponse.next()
}

export const config = {
  // Matcher pour toutes les routes sauf les fichiers statiques et API
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
