'use client';

import React from 'react';
import Link from 'next/link';
import { Ticket, Calendar, MapPin, QrCode, CheckCircle2 } from 'lucide-react';

const mockBookings = [
  {
    id: 'b_101',
    bookingCode: 'CNX-89412',
    movieTitle: 'Dune: Part Two',
    theatre: 'PVR INOX: Forum Rex Walk',
    showDate: 'Today, 06:45 PM',
    seats: ['D6', 'D7'],
    amount: '₹991',
    status: 'CONFIRMED',
  },
];

export default function UserBookingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Bookings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          View your upcoming cinema tickets and past booking history
        </p>
      </div>

      <div className="space-y-4">
        {mockBookings.map((b) => (
          <div
            key={b.id}
            className="p-6 rounded-2xl bg-card border border-border/60 shadow-sm flex flex-col md:flex-row justify-between gap-6"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
                  {b.status}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  Code: <strong className="text-foreground">{b.bookingCode}</strong>
                </span>
              </div>

              <h2 className="text-lg font-bold text-foreground">{b.movieTitle}</h2>

              <div className="space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span>{b.theatre}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <span>{b.showDate}</span>
                </p>
              </div>

              <p className="text-xs font-semibold text-foreground">
                Seats: <span className="text-primary">{b.seats.join(', ')}</span> • Total Paid:{' '}
                <span>{b.amount}</span>
              </p>
            </div>

            <div className="flex flex-col justify-between items-start md:items-end gap-3 pt-2 md:pt-0">
              <Link
                href="/wallet"
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 flex items-center gap-2 shadow-sm"
              >
                <QrCode className="h-4 w-4" />
                <span>Show QR Pass</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
