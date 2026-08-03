import { NextRequest, NextResponse } from 'next/server'

const cookieName = 'NEXT_LOCALE'

const cookieOptions = {
  path: '/',
  maxAge: 60 * 60 * 24 * 365,
  sameSite: 'lax' as const,
}

// Uploads are served by Payload's REST route, which is `force-dynamic`, so Next
// stamps the browser-facing response with `no-store`. Setting the header here
// still matters: the image optimiser fetches the upload internally, sees a
// cacheable upstream, and gives the optimised variant a long-lived cache — which
// is how the vast majority of images on the site are delivered. Upload filenames
// are stable per file, so the bytes behind a URL never change.
const UPLOAD_PATH = '/api/media/file/'
const UPLOAD_CACHE_CONTROL = 'public, max-age=31536000, immutable'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith(UPLOAD_PATH)) {
    const response = NextResponse.next()
    response.headers.set('Cache-Control', UPLOAD_CACHE_CONTROL)
    return response
  }

  // Skip Payload admin, API, and static assets
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Redirect legacy /pt URLs to the unprefixed version (Portuguese is the default)
  if (pathname.startsWith('/pt/') || pathname === '/pt') {
    const rest = pathname.slice(3)
    const newUrl = new URL(rest || '/', request.url)
    newUrl.search = request.nextUrl.search
    const response = NextResponse.redirect(newUrl, 301)
    response.cookies.set(cookieName, 'pt', cookieOptions)
    return response
  }

  // /en/* — serve English, pass through
  if (pathname.startsWith('/en/') || pathname === '/en') {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-locale', 'en')
    const response = NextResponse.next({ request: { headers: requestHeaders } })
    response.cookies.set(cookieName, 'en', cookieOptions)
    return response
  }

  // No locale prefix — serve Portuguese (default, no redirect)
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-locale', 'pt')
  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.cookies.set(cookieName, 'pt', cookieOptions)
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|block-previews|images).*)'],
}
