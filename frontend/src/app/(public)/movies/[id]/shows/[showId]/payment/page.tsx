'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ShieldCheck, ArrowLeft, CreditCard, CheckCircle2, Ticket } from 'lucide-react';
import { useBookingStore } from '@/lib/store/booking.store';
import { toast } from 'sonner';

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const movieId = params.id as string;
  const showId = params.showId as string;

  const {
    selectedSeats,
    getTicketSubtotal,
    getConvenienceFee,
    getTaxAmount,
    getTotalAmount,
    resetBooking,
  } = useBookingStore();

  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePay = () => {
    setProcessing(true);
    // Simulate Razorpay transaction
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      toast.success('Payment completed successfully! QR ticket generated.');
    }, 1500);
  };

  if (success) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-16 text-center space-y-6">
        <div className="h-16 w-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black">Booking Confirmed!</h1>
          <p className="text-xs text-muted-foreground">
            Booking ID: <span className="font-mono text-foreground font-semibold">CNX-89412</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Seats: {selectedSeats.map((s) => s.seatLabel).join(', ')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/bookings"
            onClick={() => resetBooking()}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-md shadow-primary/20 flex items-center justify-center gap-2"
          >
            <Ticket className="h-4 w-4" />
            <span>View in Ticket Wallet</span>
          </Link>
          <Link
            href="/"
            onClick={() => resetBooking()}
            className="px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 sm:px-6 py-8 space-y-8">
      <Link
        href={`/movies/${movieId}/shows/${showId}/seats`}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Seat Map</span>
      </Link>

      <div className="p-6 rounded-2xl bg-card border border-border/60 shadow-xl space-y-6">
        <div>
          <h1 className="text-xl font-bold">Checkout & Summary</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review your seats and finalize payment
          </p>
        </div>

        {/* Order Breakdown */}
        <div className="space-y-3 p-4 rounded-xl bg-secondary/40 border border-border/40 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Seats ({selectedSeats.length > 0 ? selectedSeats.map((s) => s.seatLabel).join(', ') : 'None'})</span>
            <span className="font-semibold text-foreground">₹{getTicketSubtotal()}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Convenience Fee</span>
            <span className="font-semibold text-foreground">₹{getConvenienceFee()}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Integrated GST (18%)</span>
            <span className="font-semibold text-foreground">₹{getTaxAmount()}</span>
          </div>
          <div className="border-t border-border/50 pt-2 flex justify-between font-bold text-sm text-foreground">
            <span>Grand Total</span>
            <span className="text-primary font-black">₹{getTotalAmount()}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>Encrypted Payment with Razorpay Gateway & HMAC Signature Guarantee</span>
          </div>

          <button
            onClick={handlePay}
            disabled={processing}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50"
          >
            <CreditCard className="h-4 w-4" />
            <span>{processing ? 'Processing Payment...' : `Pay ₹${getTotalAmount()}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
