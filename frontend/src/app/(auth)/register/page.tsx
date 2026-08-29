'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User as UserIcon, Phone, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth.store';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const mockUser = {
        id: 'u_' + Date.now(),
        name,
        email,
        phone,
        role: 'USER' as const,
        createdAt: new Date().toISOString(),
      };
      setAuth(mockUser, 'mock_jwt_token');
      document.cookie = 'cinemax_token=mock_jwt_token; path=/;';
      toast.success('Account created successfully!');
      router.push('/');
    } catch {
      toast.error('Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 rounded-2xl bg-card border border-border/60 shadow-2xl space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
        <p className="text-xs text-muted-foreground">
          Join CineMax for fast checkout, saved seats, and reward perks
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Full Name</label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-secondary/50 border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-secondary/50 border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              required
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-secondary/50 border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create strong password"
              required
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-secondary/50 border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20"
        >
          <span>{loading ? 'Creating...' : 'Register'}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <div className="text-center text-xs text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-semibold hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
