// Edge Function: recommendations
// Phase 1: PostgreSQL-based (trending, genre-match, recency)
// Phase 2: pgvector cosine similarity (embedding column on movies)

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req: Request) => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);

  const token = req.headers.get("Authorization")?.replace("Bearer ", "");

  try {
    // GET /recommendations  — Personalized (requires auth) or trending (anonymous)
    if (req.method === "GET" && pathParts.length === 1) {
      let userId: string | null = null;
      if (token) {
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id ?? null;
      }

      if (userId) {
        // Count user bookings to decide strategy (cold-start vs personalized)
        const { count } = await supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("status", "confirmed");

        if ((count ?? 0) < 3) {
          // Cold-start: trending + user's preferred genres
          return json(await getTrending(supabase, userId));
        }

        // Phase 1: Content-based via watch history genres
        return json(await getGenreBasedRecs(supabase, userId));
        // Phase 2 (pgvector): return json(await getVectorRecs(supabase, userId));
      }

      // Anonymous: return trending
      return json(await getTrending(supabase, null));
    }

    // GET /recommendations/similar/:movieId  — Similar movies
    if (req.method === "GET" && pathParts[1] === "similar" && pathParts[2]) {
      const movieId = pathParts[2];
      const { data: movie } = await supabase
        .from("movies")
        .select("genres")
        .eq("id", movieId)
        .single();

      if (!movie) return json({ error: "Movie not found" }, 404);

      // Phase 1: genre overlap similarity
      const { data, error } = await supabase
        .from("movies")
        .select("id, title, poster_url, avg_rating, genres, status")
        .overlaps("genres", movie.genres)
        .neq("id", movieId)
        .in("status", ["now_showing", "upcoming"])
        .order("avg_rating", { ascending: false })
        .limit(12);

      if (error) throw error;
      return json(data);
    }

    return json({ error: "Not found" }, 404);
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});

async function getTrending(supabase: ReturnType<typeof createClient>, userId: string | null) {
  // Trending = most booked in last 7 days
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Get top movie_ids from recent bookings
  const { data: topBookings } = await supabase
    .from("watch_history")
    .select("movie_id")
    .gte("watched_at", weekAgo);

  const movieIdCounts: Record<string, number> = {};
  for (const b of topBookings ?? []) {
    movieIdCounts[b.movie_id] = (movieIdCounts[b.movie_id] ?? 0) + 1;
  }

  const sortedIds = Object.entries(movieIdCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([id]) => id);

  let query = supabase
    .from("movies")
    .select("id, title, poster_url, avg_rating, genres, status, duration_minutes")
    .in("status", ["now_showing", "upcoming"]);

  // Boost with user's preferred genres if logged in
  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("preferred_genres")
      .eq("id", userId)
      .single();
    if (profile?.preferred_genres?.length) {
      query = query.overlaps("genres", profile.preferred_genres);
    }
  }

  if (sortedIds.length > 0) {
    query = query.in("id", sortedIds);
  }

  const { data } = await query.order("avg_rating", { ascending: false }).limit(12);
  return data ?? [];
}

async function getGenreBasedRecs(supabase: ReturnType<typeof createClient>, userId: string) {
  // Build a genre affinity list from watch history
  const { data: history } = await supabase
    .from("watch_history")
    .select("movies(genres)")
    .eq("user_id", userId)
    .order("watched_at", { ascending: false })
    .limit(20);

  const genreCount: Record<string, number> = {};
  for (const h of history ?? []) {
    for (const g of (h.movies as unknown as { genres: string[] } | null)?.genres ?? []) {
      genreCount[g] = (genreCount[g] ?? 0) + 1;
    }
  }
  const topGenres = Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([g]) => g);

  // Already-watched movie IDs to exclude
  const { data: watched } = await supabase
    .from("watch_history")
    .select("movie_id")
    .eq("user_id", userId);

  const watchedIds = (watched ?? []).map((w) => w.movie_id);

  let query = supabase
    .from("movies")
    .select("id, title, poster_url, avg_rating, genres, status")
    .in("status", ["now_showing", "upcoming"])
    .order("avg_rating", { ascending: false })
    .limit(12);

  if (topGenres.length > 0) query = query.overlaps("genres", topGenres);
  if (watchedIds.length > 0) query = query.not("id", "in", `(${watchedIds.join(",")})`);

  const { data } = await query;
  return data ?? [];
}

// Phase 2 placeholder — uncomment when embeddings are populated
// async function getVectorRecs(supabase, userId: string) {
//   const { data } = await supabase.rpc('match_movies_by_user_history', { user_id: userId, limit: 12 });
//   return data ?? [];
// }

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}
