import { createClient } from './client';
import { useAuthStore } from '@/lib/store/auth.store';

/**
 * Initiates Google OAuth Sign-In flow via Supabase.
 * Redirects user to Google consent screen, then back to the specified callback URL.
 */
export async function signInWithGoogle(redirectTo?: string) {
  const supabase = createClient();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const redirectTarget = redirectTo || `${origin}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTarget,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Sign in with email and password.
 */
export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Sign up with email, password, and custom metadata.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  metadata?: { name?: string; phone?: string; role?: 'USER' | 'ADMIN' }
) {
  const supabase = createClient();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        name: metadata?.name,
        full_name: metadata?.name,
        phone: metadata?.phone,
        role: metadata?.role || 'USER',
      },
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Signs out from Supabase and clears local state and cookies.
 */
export async function signOutUser() {
  const supabase = createClient();
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.error('Error during Supabase signOut:', err);
  } finally {
    useAuthStore.getState().logout();
  }
}

/**
 * Get current session.
 */
export async function getSession() {
  const supabase = createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

/**
 * Get current user.
 */
export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}
