import React from 'react';
import Link from 'next/link';
import { Film } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background via-background/95 to-card/50 p-4">
      {/* Brand Header */}
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform">
            <Film className="h-6 w-6" />
          </div>
          <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-red-500 via-rose-400 to-amber-400 bg-clip-text text-transparent">
            CineMax
          </span>
        </Link>
      </div>

      {/* Centered Auth Card Container */}
      <div className="w-full max-w-md">{children}</div>

      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p> • Protected by CineMax Security </p>
      </div>
    </div>
  );
}
