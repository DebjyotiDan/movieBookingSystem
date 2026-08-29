'use client';

import React from 'react';
import { useAuthStore } from '@/lib/store/auth.store';
import { User, Mail, Phone, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage your personal info and security preferences
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-card border border-border/60 space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground font-black text-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold">{user?.name || 'User Account'}</h2>
            <p className="text-xs text-muted-foreground">{user?.email || 'user@example.com'}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-secondary text-primary">
              Role: {user?.role || 'USER'}
            </span>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-border/40">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/50 border border-border text-xs">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{user?.name || 'Not provided'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/50 border border-border text-xs">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{user?.email || 'Not provided'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Account Security</label>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/50 border border-border text-xs text-emerald-400">
              <Shield className="h-4 w-4" />
              <span>Standard Password Protection Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
