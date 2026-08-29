import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Users } from 'lucide-react';

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Revenue & Booking Analytics</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Detailed breakdown of theatre performance, occupancy rates, and peak hours
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-card border border-border/60 space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span>Top Performing Movies</span>
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span>1. Dune: Part Two</span>
              <span className="font-bold text-foreground">₹2,84,000 (58%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>2. Oppenheimer</span>
              <span className="font-bold text-foreground">₹1,42,000 (29%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>3. Spider-Man: Across the Spider-Verse</span>
              <span className="font-bold text-foreground">₹56,450 (13%)</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border/60 space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-emerald-400" />
            <span>Theatre Occupancy Rates</span>
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span>Forum Rex Walk (IMAX)</span>
              <span className="font-bold text-emerald-400">92.4%</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Nexus Koramangala</span>
              <span className="font-bold text-emerald-400">81.7%</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Vega City Mall</span>
              <span className="font-bold text-emerald-400">76.2%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
