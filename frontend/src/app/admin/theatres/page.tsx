import React from 'react';
import { Plus, Building2, MapPin } from 'lucide-react';

export default function AdminTheatresPage() {
  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Theatres & Screens</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure partner cinemas, screen layouts, and seating capacities
          </p>
        </div>

        <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 flex items-center gap-1.5 shadow-md shadow-primary/20">
          <Plus className="h-4 w-4" />
          <span>Add Theatre</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">PVR INOX: Forum Rex Walk</h3>
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">
              6 Screens
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Brigade Road, Bengaluru</p>
          <div className="text-[11px] text-muted-foreground flex gap-3 pt-2 border-t border-border/40">
            <span>Total Seats: 980</span>
            <span>•</span>
            <span>IMAX, 4DX, Dolby</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">Cinepolis: Nexus Koramangala</h3>
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">
              11 Screens
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Hosur Rd, Koramangala, Bengaluru</p>
          <div className="text-[11px] text-muted-foreground flex gap-3 pt-2 border-t border-border/40">
            <span>Total Seats: 1,640</span>
            <span>•</span>
            <span>Macro XE, 4DX</span>
          </div>
        </div>
      </div>
    </div>
  );
}
