import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('cinemax_token')?.value;

  // Protected User Routes
  const isUserRoute =
    pathname.startsWith('/profile') ||
    pathname.startsWith('/bookings') ||
    pathname.startsWith('/wallet');

  // Protected Admin Routes
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/dashboard');

  if (isUserRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    loginUrl.searchParams.set('role', 'admin');
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/bookings/:path*',
    '/wallet/:path*',
    '/admin/:path*',
    '/dashboard/:path*',
  ],
};
