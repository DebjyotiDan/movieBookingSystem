'use client';

import React from 'react';
import { QrCode, Ticket, ShieldCheck } from 'lucide-react';

export default function WalletPage() {
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ticket Wallet (QR Pass)</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Scan this digital pass directly at the cinema gate for instant contactless entry
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-card border border-border/70 shadow-2xl text-center space-y-6">
        <div className="p-6 rounded-xl bg-white text-black flex flex-col items-center justify-center mx-auto max-w-[260px] shadow-inner space-y-2">
          <QrCode className="h-44 w-44 text-black" />
          <span className="font-mono text-xs tracking-widest font-bold">CNX-89412-PASS</span>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold">Dune: Part Two (IMAX 2D)</h2>
          <p className="text-xs text-muted-foreground">PVR INOX: Forum Rex Walk • Screen 1</p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs">
            <Ticket className="h-3.5 w-3.5" />
            <span>Seats: D6, D7</span>
          </div>
        </div>

        <div className="pt-4 border-t border-border/40 flex items-center justify-center gap-1.5 text-xs text-emerald-400">
          <ShieldCheck className="h-4 w-4" />
          <span>Verified Valid Ticket</span>
        </div>
      </div>
    </div>
  );
}
