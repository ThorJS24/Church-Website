import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

  // Add performance headers. API routes carry a mix of public and
  // per-user/authenticated data (admin panel, member dashboard, privacy
  // exports) — this used to set `public, s-maxage=300` on ALL of them,
  // which told any shared/CDN cache in front of the app it could serve one
  // caller's response to the next request for the same URL regardless of
  // who's asking. Default API responses to no-store.
  //
  // Verified live (not assumed): a Cache-Control set here in middleware
  // wins over the same header set later by the route handler's own
  // NextResponse — a route can't "override" this default just by setting
  // its own header, the path has to be excluded from every branch below
  // entirely. /api/tts is the one route that wants caching (its synthesized
  // audio is safe to cache: not per-user, not authenticated), so it keeps
  // full control of its own Cache-Control by skipping this block outright.
  if (request.nextUrl.pathname === '/api/tts') {
    // no-op: let the route's own Cache-Control stand untouched.
  } else if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-store');
  } else if (request.nextUrl.pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else {
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  }

  response.headers.set('Vary', 'Accept-Encoding');
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};