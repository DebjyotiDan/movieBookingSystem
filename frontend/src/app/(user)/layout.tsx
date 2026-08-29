import React from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { UserSidebar } from '@/components/layout/user-sidebar';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <UserSidebar />
          <section className="flex-1 min-w-0">{children}</section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
