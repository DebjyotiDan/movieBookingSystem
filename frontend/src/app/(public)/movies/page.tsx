import React from 'react';
import Link from 'next/link';
import { Film, Star, Clock } from 'lucide-react';

const mockMovies = [
  {
    id: '1',
    title: 'Dune: Part Two',
    genre: 'Sci-Fi • Adventure',
    rating: 8.8,
    duration: '2h 46m',
    language: 'English, Hindi',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '2',
    title: 'Oppenheimer',
    genre: 'Biography • Drama',
    rating: 8.9,
    duration: '3h 00m',
    language: 'English, Hindi',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '3',
    title: 'Spider-Man: Across the Spider-Verse',
    genre: 'Animation • Action',
    rating: 8.7,
    duration: '2h 20m',
    language: 'English, Hindi, Tamil',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '4',
    title: 'Interstellar (Re-Release)',
    genre: 'Sci-Fi • Adventure',
    rating: 8.9,
    duration: '2h 49m',
    language: 'English (IMAX)',
    image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=800&auto=format&fit=crop',
  },
];

export default function MoviesPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Explore Movies</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Browse current blockbusters and upcoming theatrical releases
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-semibold">
            All Genres
          </span>
          <span className="px-3 py-1.5 rounded-full bg-secondary text-muted-foreground hover:text-foreground cursor-pointer">
            Action
          </span>
          <span className="px-3 py-1.5 rounded-full bg-secondary text-muted-foreground hover:text-foreground cursor-pointer">
            Sci-Fi
          </span>
          <span className="px-3 py-1.5 rounded-full bg-secondary text-muted-foreground hover:text-foreground cursor-pointer">
            Drama
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockMovies.map((movie) => (
          <div
            key={movie.id}
            className="group rounded-xl border border-border/50 bg-card overflow-hidden hover:border-primary/50 transition-all flex flex-col justify-between"
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={movie.image}
                alt={movie.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-amber-400 text-xs font-bold border border-white/10">
                <Star className="h-3 w-3 fill-amber-400" />
                <span>{movie.rating}</span>
              </div>
            </div>

            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm leading-snug group-hover:text-primary transition-colors">
                  {movie.title}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1">{movie.genre}</p>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {movie.duration}
                  </span>
                  <span>•</span>
                  <span>{movie.language}</span>
                </div>
              </div>

              <Link
                href={`/movies/${movie.id}`}
                className="w-full py-2 text-center rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Film className="h-3.5 w-3.5" />
                <span>Select Shows</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
