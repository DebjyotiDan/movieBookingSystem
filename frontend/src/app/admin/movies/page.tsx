import React from 'react';
import { Plus, Film, Edit, Trash2 } from 'lucide-react';

export default function AdminMoviesPage() {
  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Movie Catalog Management</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add, update, or archive movies and sync metadata with TMDB
          </p>
        </div>

        <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 flex items-center gap-1.5 shadow-md shadow-primary/20">
          <Plus className="h-4 w-4" />
          <span>Add New Movie</span>
        </button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-secondary/50 border-b border-border text-muted-foreground font-semibold">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Duration</th>
              <th className="p-4">Rating</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            <tr>
              <td className="p-4 font-bold text-foreground">Dune: Part Two</td>
              <td className="p-4 text-muted-foreground">2h 46m</td>
              <td className="p-4 text-amber-400 font-bold">8.8</td>
              <td className="p-4">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                  NOW SHOWING
                </span>
              </td>
              <td className="p-4 text-right space-x-2">
                <button className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground">
                  <Edit className="h-3.5 w-3.5" />
                </button>
              </td>
            </tr>
            <tr>
              <td className="p-4 font-bold text-foreground">Oppenheimer</td>
              <td className="p-4 text-muted-foreground">3h 00m</td>
              <td className="p-4 text-amber-400 font-bold">8.9</td>
              <td className="p-4">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                  NOW SHOWING
                </span>
              </td>
              <td className="p-4 text-right space-x-2">
                <button className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground">
                  <Edit className="h-3.5 w-3.5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
