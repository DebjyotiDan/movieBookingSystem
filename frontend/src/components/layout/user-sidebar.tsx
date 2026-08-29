'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Ticket, Wallet, User as UserIcon, LogOut } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth.store';
import { cn } from '@/lib/utils';

const links = [
  { href: '/bookings', label: 'My Bookings', icon: Ticket },
  { href: '/wallet', label: 'Ticket Wallet (QR)', icon: Wallet },
  { href: '/profile', label: 'Profile Settings', icon: UserIcon },
];

export function UserSidebar() {
  const pathname = usePathname();
  const { logout } = useAuthStore();

  return (
    <aside className="w-full md:w-64 space-y-1">
      <div className="p-3 bg-card/60 border border-border/50 rounded-xl space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{link.label}</span>
            </Link>
          );
        })}

        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors mt-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
