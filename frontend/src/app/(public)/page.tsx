'use client';

import React from 'react';
import Link from 'next/link';
import { Film, Sparkles, ShieldCheck, Zap, Ticket, Clock, Star, Play } from 'lucide-react';

const mockTrendingMovies = [
  {
    id: '1',
    title: 'Dune: Part Two',
    genre: 'Sci-Fi • Adventure',
    rating: 8.8,
    duration: '2h 46m',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
    tag: 'Trending #1',
  },
  {
    id: '2',
    title: 'Oppenheimer',
    genre: 'Biography • Drama',
    rating: 8.9,
    duration: '3h 00m',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop',
    tag: 'Must Watch',
  },
  {
    id: '3',
    title: 'Spider-Man: Across the Spider-Verse',
    genre: 'Animation • Action',
    rating: 8.7,
    duration: '2h 20m',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop',
    tag: 'Popular',
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-card/80 via-background to-background pt-16 pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(220,38,38,0.15),rgba(255,255,255,0))]" />
        
        <div className="container relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Real-Time Seat Locking & Smart Recommendations</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1]">
              Cinematic Experiences,{' '}
              <span className="bg-gradient-to-r from-red-500 via-rose-400 to-amber-400 bg-clip-text text-transparent">
                Instantly Booked.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Skip queues with interactive real-time seat reservation, seamless checkout,
              and AI-driven recommendations tailored to your movie tastes.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/movies"
                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all hover:scale-105 flex items-center gap-2 text-sm"
              >
                <Film className="h-4 w-4" />
                <span>Explore Movies</span>
              </Link>
              <Link
                href="/theatres"
                className="px-6 py-3 rounded-xl bg-secondary/80 hover:bg-secondary border border-border text-foreground font-semibold transition-all text-sm"
              >
                Find Cinemas Near You
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-card/50 border border-border/50 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Zero-Collision Seat Locks</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Redis-backed live locking ensures no two users can double-book identical seats during checkout.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card/50 border border-border/50 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Ticket className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Instant QR Ticket Wallet</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Direct access to scannable digital tickets and automated confirmation emails within seconds.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card/50 border border-border/50 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Secure Payments</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Integrated with Razorpay test mode, automated retry handling, and HMAC signature validation.
            </p>
          </div>
        </div>
      </section>

      {/* Trending Movies Section */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Now Showing</h2>
            <p className="text-xs text-muted-foreground">Book tickets for today and upcoming days</p>
          </div>
          <Link
            href="/movies"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockTrendingMovies.map((movie) => (
            <div
              key={movie.id}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card transition-all hover:shadow-xl hover:border-primary/50 flex flex-col"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={movie.image}
                  alt={movie.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-[11px] font-semibold text-white border border-white/10">
                  {movie.tag}
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/90 text-black text-xs font-bold">
                  <Star className="h-3 w-3 fill-black" />
                  <span>{movie.rating}</span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                    {movie.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>{movie.genre}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {movie.duration}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Link
                    href={`/movies/${movie.id}`}
                    className="flex-1 text-center py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    Book Tickets
                  </Link>
                  <button
                    className="p-2.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                    title="Watch Trailer"
                  >
                    <Play className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
