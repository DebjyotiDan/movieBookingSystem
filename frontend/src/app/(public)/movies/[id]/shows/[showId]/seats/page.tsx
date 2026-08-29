'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ShieldCheck, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useBookingStore } from '@/lib/store/booking.store';
import { Seat } from '@/types';
import { toast } from 'sonner';

const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const seatsPerRow = 12;

export default function SeatSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const movieId = params.id as string;
  const showId = params.showId as string;

  const { selectedSeats, toggleSeat, getTotalAmount, clearSeats } = useBookingStore();
  const [lockedMockSeats] = useState<string[]>(['C4', 'C5', 'F8', 'F9']);

  const isSeatSelected = (label: string) => selectedSeats.some((s) => s.seatLabel === label);
  const isSeatBooked = (label: string) => lockedMockSeats.includes(label);

  const handleSeatClick = (row: string, num: number) => {
    const label = `${row}${num}`;
    if (isSeatBooked(label)) {
      toast.error(`Seat ${label} is already reserved by another user.`);
      return;
    }

    const tier = row === 'A' || row === 'B' ? 'VIP' : row <= 'E' ? 'PREMIUM' : 'STANDARD';
    const price = tier === 'VIP' ? 550 : tier === 'PREMIUM' ? 420 : 320;

    const seat: Seat = {
      id: `seat_${showId}_${label}`,
      showId,
      row,
      number: num,
      seatLabel: label,
      tier,
      price,
      status: 'AVAILABLE',
    };

    toggleSeat(seat);
  };

  const handleProceedToPayment = () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least 1 seat to proceed.');
      return;
    }
    router.push(`/movies/${movieId}/shows/${showId}/payment`);
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <Link
          href={`/movies/${movieId}`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Change Showtime</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Redis Live Seat Lock Active</span>
          </div>
        </div>
      </div>

      {/* Screen Curved Indicator */}
      <div className="flex flex-col items-center space-y-2 py-4">
        <div className="w-full max-w-2xl h-2 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full shadow-[0_0_20px_rgba(220,38,38,0.6)]" />
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
          All Eyes This Way • Cinema Screen
        </p>
      </div>

      {/* Interactive Seat Grid */}
      <div className="overflow-x-auto py-6 flex flex-col items-center">
        <div className="space-y-3 min-w-[580px]">
          {rows.map((row) => (
            <div key={row} className="flex items-center justify-center gap-2">
              <span className="w-6 text-center text-xs font-bold text-muted-foreground">{row}</span>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: seatsPerRow }, (_, i) => i + 1).map((num) => {
                  const label = `${row}${num}`;
                  const selected = isSeatSelected(label);
                  const booked = isSeatBooked(label);

                  return (
                    <button
                      key={label}
                      onClick={() => handleSeatClick(row, num)}
                      disabled={booked}
                      className={`h-7 w-7 rounded-t-lg text-[10px] font-semibold transition-all ${
                        booked
                          ? 'bg-muted/40 text-muted-foreground/30 border border-border/20 cursor-not-allowed'
                          : selected
                          ? 'bg-primary text-primary-foreground scale-110 shadow-md shadow-primary/30'
                          : 'bg-secondary/80 hover:bg-secondary border border-border/60 hover:border-primary text-foreground'
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
              <span className="w-6 text-center text-xs font-bold text-muted-foreground">{row}</span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground mt-8 pt-4 border-t border-border/40">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-t bg-secondary border border-border" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-t bg-primary" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-t bg-muted/40 border border-border/20" />
            <span>Reserved</span>
          </div>
        </div>
      </div>

      {/* Floating Bottom Action Bar */}
      <div className="sticky bottom-4 z-40 p-4 rounded-2xl bg-card/95 backdrop-blur-md border border-border/70 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
        <div>
          <p className="text-xs text-muted-foreground">
            Selected Seats ({selectedSeats.length}):{' '}
            <span className="font-bold text-foreground">
              {selectedSeats.length > 0
                ? selectedSeats.map((s) => s.seatLabel).join(', ')
                : 'None'}
            </span>
          </p>
          <p className="text-lg font-black text-foreground">
            Total: <span className="text-primary">₹{getTotalAmount()}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {selectedSeats.length > 0 && (
            <button
              onClick={clearSeats}
              className="px-4 py-2.5 rounded-xl bg-secondary text-muted-foreground hover:text-foreground text-xs font-semibold"
            >
              Clear
            </button>
          )}
          <button
            onClick={handleProceedToPayment}
            disabled={selectedSeats.length === 0}
            className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            <span>Proceed to Payment</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
