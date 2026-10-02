import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Authenticate user via Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isUserRoute =
    pathname.startsWith('/profile') ||
    pathname.startsWith('/bookings') ||
    pathname.startsWith('/wallet');
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/dashboard');

  const role = (user?.user_metadata?.role || user?.app_metadata?.role || 'USER').toString().toUpperCase();

  // If already authenticated and accessing login/register, redirect home or dashboard
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL(role === 'ADMIN' ? '/admin/dashboard' : '/', request.url));
  }

  // Protected User Routes (Require authentication)
  if (isUserRoute && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protected Admin Routes (Require authentication + ADMIN role)
  if (isAdminRoute) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      loginUrl.searchParams.set('role', 'admin');
      return NextResponse.redirect(loginUrl);
    }

    if (role !== 'ADMIN') {
      // Forbidden: authenticated user is not an admin
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/bookings/:path*',
    '/wallet/:path*',
    '/admin/:path*',
    '/dashboard/:path*',
    '/login',
    '/register',
  ],
};
