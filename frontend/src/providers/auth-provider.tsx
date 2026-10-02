'use client';

import React, { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/store/auth.store';
import { User } from '@/types';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, logout } = useAuthStore();
  const supabase = createClient();

  useEffect(() => {
    // 1. Initial session check on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        const mappedUser: User = {
          id: u.id,
          name:
            u.user_metadata?.full_name ||
            u.user_metadata?.name ||
            u.email?.split('@')[0] ||
            'User',
          email: u.email || '',
          phone: u.user_metadata?.phone,
          role: (u.user_metadata?.role as 'ADMIN' | 'USER') || 'USER',
          createdAt: u.created_at,
        };
        setAuth(mappedUser, session.access_token);
        document.cookie = `cinemax_token=${session.access_token}; path=/; max-age=604800; SameSite=Lax`;
      }
    });

    // 2. Reactive subscription to Supabase Auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') && session?.user) {
        const u = session.user;
        const mappedUser: User = {
          id: u.id,
          name:
            u.user_metadata?.full_name ||
            u.user_metadata?.name ||
            u.email?.split('@')[0] ||
            'User',
          email: u.email || '',
          phone: u.user_metadata?.phone,
          role: (u.user_metadata?.role as 'ADMIN' | 'USER') || 'USER',
          createdAt: u.created_at,
        };
        setAuth(mappedUser, session.access_token);
        document.cookie = `cinemax_token=${session.access_token}; path=/; max-age=604800; SameSite=Lax`;
      } else if (event === 'SIGNED_OUT') {
        logout();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setAuth, logout, supabase]);

  return <>{children}</>;
}
