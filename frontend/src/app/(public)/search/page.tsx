'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search as SearchIcon, Film, Building2, Star } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');

  return (
    <div className="container mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Global Search</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Search for movies, genres, cinemas, actors, or show formats
        </p>
      </div>

      <div className="relative">
        <SearchIcon className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type movie name, theatre, genre (e.g., Dune, IMAX, Sci-Fi)..."
          className="w-full pl-12 pr-4 py-3 text-sm rounded-xl bg-card border border-border/80 focus:outline-none focus:ring-2 focus:ring-primary text-foreground shadow-lg"
          autoFocus
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Popular Searches
        </h3>
        <div className="flex flex-wrap gap-2">
          {['Dune: Part Two', 'IMAX Bengaluru', 'Oppenheimer', 'Dolby Atmos', 'Christopher Nolan'].map(
            (tag) => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className="px-3 py-1.5 rounded-lg bg-secondary/80 hover:bg-secondary border border-border text-xs text-foreground transition-colors"
              >
                {tag}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
