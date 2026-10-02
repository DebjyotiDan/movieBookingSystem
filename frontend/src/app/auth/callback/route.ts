import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.session) {
      const response = NextResponse.redirect(`${origin}${next}`);
      // Also set the cinemax_token cookie so non-supabase parts of the app can read it immediately
      response.cookies.set('cinemax_token', data.session.access_token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
      });
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}
