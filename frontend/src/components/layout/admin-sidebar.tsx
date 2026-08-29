'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Film, Building2, CalendarDays, BarChart3, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const adminLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/movies', label: 'Movie Management', icon: Film },
  { href: '/admin/theatres', label: 'Theatres & Screens', icon: Building2 },
  { href: '/admin/shows', label: 'Show Scheduling', icon: CalendarDays },
  { href: '/admin/analytics', label: 'Analytics & Revenue', icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border/50 bg-card/50 flex flex-col justify-between p-4 min-h-screen">
      <div className="space-y-6">
        <div className="flex items-center gap-2 px-2">
          <div className="h-7 w-7 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-xs">
            A
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">CineMax Admin</h2>
            <p className="text-[10px] text-muted-foreground">Management Console</p>
          </div>
        </div>

        <nav className="space-y-1">
          {adminLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-border/40">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Exit to Public Site</span>
        </Link>
      </div>
    </aside>
  );
}
