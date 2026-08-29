import React from 'react';
import Link from 'next/link';
import { Film, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-card/40 mt-auto">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                <Film className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-red-500 to-rose-400 bg-clip-text text-transparent">
                CineMax
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The next-generation online cinema ticketing experience with real-time seat locking,
              instant QR verification, and intelligent recommendations.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/movies" className="hover:text-foreground transition-colors">
                  Now Showing
                </Link>
              </li>
              <li>
                <Link href="/movies?status=upcoming" className="hover:text-foreground transition-colors">
                  Upcoming Releases
                </Link>
              </li>
              <li>
                <Link href="/theatres" className="hover:text-foreground transition-colors">
                  Cinemas & Theatres
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-foreground transition-colors">
                  Search & Explore
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
              Account & Support
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/bookings" className="hover:text-foreground transition-colors">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link href="/wallet" className="hover:text-foreground transition-colors">
                  Ticket Wallet
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-foreground transition-colors">
                  Profile Settings
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground/60">24/7 Customer Help</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
              Security & Guarantee
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              100% secure payments powered by Razorpay. Zero double-booking guarantee.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
              <span>●</span> SSL Encrypted & PCI-DSS Compliant
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} CineMax Inc. All rights reserved.</p>
          <div className="flex items-center gap-1 text-xs">
            <span>Built with precision & passion</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
