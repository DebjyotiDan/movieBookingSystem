import React from 'react';
import { Film, Building2, Ticket, TrendingUp, Users, DollarSign } from 'lucide-react';

const stats = [
  { label: 'Total Revenue', value: '₹4,82,450', change: '+18.2%', icon: DollarSign },
  { label: 'Active Shows Today', value: '38 Shows', change: '+4 shows', icon: Film },
  { label: 'Tickets Sold (Today)', value: '1,420 Tickets', change: '+12.5%', icon: Ticket },
  { label: 'Active Theatres', value: '6 Cinemas', change: 'Stable', icon: Building2 },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Real-time metrics on revenue, bookings, theatres, and scheduling
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-foreground">{item.value}</p>
                <p className="text-[11px] text-emerald-400 font-medium mt-1">{item.change} from yesterday</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-6 rounded-2xl bg-card border border-border/60 space-y-4">
        <h2 className="text-base font-bold">Recent System Activities</h2>
        <div className="space-y-3 text-xs text-muted-foreground">
          <p>• Show #104 (Dune 2 @ Forum Rex Walk) reached 94% seat capacity.</p>
          <p>• Redis Lock Engine processed 4,812 concurrent seat status updates with 0 collisions.</p>
          <p>• Automated payment reconciliation completed successfully for all Razorpay capture webhooks.</p>
        </div>
      </div>
    </div>
  );
}
