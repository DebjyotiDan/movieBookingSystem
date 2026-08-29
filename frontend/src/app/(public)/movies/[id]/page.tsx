'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Clock, Star, Calendar, MapPin, Film, ArrowLeft } from 'lucide-react';

const mockMovie = {
  id: '1',
  title: 'Dune: Part Two',
  synopsis:
    'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.',
  genres: ['Sci-Fi', 'Adventure', 'Action'],
  duration: '2h 46m',
  rating: 8.8,
  director: 'Denis Villeneuve',
  cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem'],
  posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
};

const mockTheatres = [
  {
    id: 'th_1',
    name: 'PVR INOX: Forum Rex Walk, Brigade Rd',
    city: 'Bengaluru',
    shows: [
      { id: 'show_101', time: '10:30 AM', format: 'IMAX 2D', price: '₹450' },
      { id: 'show_102', time: '02:15 PM', format: 'IMAX 2D', price: '₹550' },
      { id: 'show_103', time: '06:45 PM', format: '4DX 2D', price: '₹600' },
      { id: 'show_104', time: '10:15 PM', format: '2D Dolby', price: '₹350' },
    ],
  },
  {
    id: 'th_2',
    name: 'Cinepolis: Nexus Mall, Koramangala',
    city: 'Bengaluru',
    shows: [
      { id: 'show_201', time: '11:00 AM', format: '4DX', price: '₹500' },
      { id: 'show_202', time: '03:30 PM', format: 'Macro 2D', price: '₹380' },
      { id: 'show_203', time: '07:30 PM', format: 'Macro 2D', price: '₹420' },
    ],
  },
];

export default function MovieDetailPage() {
  const params = useParams();
  const movieId = params.id as string;

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
      <Link
        href="/movies"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to movies</span>
      </Link>

      {/* Movie Details Hero Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 p-6 rounded-2xl bg-card border border-border/50">
        <div className="md:col-span-1 rounded-xl overflow-hidden aspect-[3/4] bg-muted shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mockMovie.posterUrl}
            alt={mockMovie.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="md:col-span-3 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {mockMovie.genres.map((g) => (
                <span
                  key={g}
                  className="px-2.5 py-0.5 rounded-md bg-secondary text-[11px] font-medium text-foreground"
                >
                  {g}
                </span>
              ))}
            </div>

            <h1 className="text-3xl font-black tracking-tight">{mockMovie.title}</h1>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 font-bold text-amber-400">
                <Star className="h-4 w-4 fill-amber-400" />
                {mockMovie.rating}/10
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {mockMovie.duration}
              </span>
              <span>•</span>
              <span>Director: {mockMovie.director}</span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed pt-2">
              {mockMovie.synopsis}
            </p>
          </div>

          <div className="pt-4 border-t border-border/40 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Starring:</span>{' '}
            {mockMovie.cast.join(', ')}
          </div>
        </div>
      </div>

      {/* Showtimes Selection Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span>Available Shows & Theatres</span>
          </h2>
          <span className="text-xs text-muted-foreground">Today, {new Date().toLocaleDateString()}</span>
        </div>

        <div className="space-y-4">
          {mockTheatres.map((theatre) => (
            <div
              key={theatre.id}
              className="p-5 rounded-xl bg-card/60 border border-border/50 space-y-4"
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-sm text-foreground">{theatre.name}</h3>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {theatre.shows.map((show) => (
                  <Link
                    key={show.id}
                    href={`/movies/${movieId}/shows/${show.id}/seats`}
                    className="group p-3 rounded-lg bg-secondary/70 hover:bg-primary border border-border/60 hover:border-primary transition-all text-center min-w-[110px]"
                  >
                    <p className="text-xs font-bold text-foreground group-hover:text-primary-foreground">
                      {show.time}
                    </p>
                    <p className="text-[10px] text-muted-foreground group-hover:text-primary-foreground/90 mt-0.5">
                      {show.format}
                    </p>
                    <p className="text-[10px] font-semibold text-primary group-hover:text-primary-foreground mt-1">
                      {show.price}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
