'use client';

import React from 'react';
import Link from 'next/link';
import { Film, Search, Ticket, User, MapPin } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth.store';

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <Film className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-red-500 via-rose-400 to-amber-400 bg-clip-text text-transparent">
              CineMax
            </span>
          </Link>

          {/* Main Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/movies"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Movies
            </Link>
            <Link
              href="/theatres"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Theatres
            </Link>
          </nav>
        </div>

        {/* Search & Location Bar */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span>Bengaluru</span>
          </div>

          <Link
            href="/search"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-secondary/60 hover:bg-secondary border border-border/50 text-xs text-muted-foreground hover:text-foreground transition-all"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search movies, theatres...</span>
          </Link>

          {/* User Auth / Profile Actions */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              {user.role === 'ADMIN' && (
                <Link
                  href="/admin/dashboard"
                  className="text-xs px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold hover:bg-amber-500/20 transition-colors"
                >
                  Admin Panel
                </Link>
              )}
              <Link
                href="/bookings"
                className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Ticket className="h-4 w-4 text-primary" />
                <span>My Tickets</span>
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-xs font-medium transition-colors"
              >
                <User className="h-3.5 w-3.5" />
                <span>{user.name?.split(' ')[0] || 'Account'}</span>
              </Link>
              <button
                onClick={() => logout()}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors ml-1"
                title="Sign out"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-md shadow-primary/20 transition-all hover:scale-[1.02]"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
