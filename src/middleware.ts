import { NextResponse, type NextRequest } from 'next/server'

// Pages that don't require login
const PUBLIC_PATHS = ['/login', '/auth/callback', '/auth/invite', '/auth/setup', '/auth/me', '/unauthorised', '/feedback', '/privacy', '/unsubscribe']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow public pages through
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Check for a Supabase session cookie — set by the browser client on login
  const cookies = request.cookies.getAll()
  const hasSession = cookies.some(
    c => c.name.startsWith('sb-') && c.name.includes('auth-token')
  )

  // No session cookie → send to login
  if (!hasSession) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.json|offline\\.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json)$).*)',
  ],
}
