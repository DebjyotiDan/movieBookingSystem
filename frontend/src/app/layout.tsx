import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './global.css';
import { QueryProvider } from '@/providers/query-provider';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'CineMax — Next-Gen Movie Ticket Booking',
    template: '%s | CineMax',
  },
  description:
    'Experience seamless movie ticket booking with real-time seat locking, instant QR tickets, and personalized movie recommendations.',
  keywords: ['movie tickets', 'cinema booking', 'theatre tickets', 'CineMax', 'online booking'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans flex flex-col">
        <QueryProvider>
          {children}
          <Toaster richColors position="top-right" theme="dark" />
        </QueryProvider>
      </body>
    </html>
  );
}
