import React from 'react';
import { Plus, Calendar, Clock } from 'lucide-react';

export default function AdminShowsPage() {
  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Show Scheduling</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Schedule movie shows, assign screen layouts, and configure pricing tiers
          </p>
        </div>

        <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 flex items-center gap-1.5 shadow-md shadow-primary/20">
          <Plus className="h-4 w-4" />
          <span>Schedule Show</span>
        </button>
      </div>

      <div className="p-6 rounded-2xl border border-border/60 bg-card space-y-4">
        <h3 className="font-bold text-sm">Scheduled Shows (Today)</h3>
        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-lg bg-secondary/50 border border-border flex justify-between items-center">
            <div>
              <p className="font-bold text-foreground">Dune: Part Two • Screen 1 (IMAX)</p>
              <p className="text-[11px] text-muted-foreground">10:30 AM - 01:16 PM</p>
            </div>
            <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px]">
              Ready
            </span>
          </div>

          <div className="p-3 rounded-lg bg-secondary/50 border border-border flex justify-between items-center">
            <div>
              <p className="font-bold text-foreground">Dune: Part Two • Screen 1 (IMAX)</p>
              <p className="text-[11px] text-muted-foreground">02:15 PM - 05:01 PM</p>
            </div>
            <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px]">
              Ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
