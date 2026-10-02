// Edge Function: movies
// Handles: GET /movies, GET /movies/:id, TMDB sync
// Deployed as: supabase functions deploy movies

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY")!;
const TMDB_BASE = "https://api.themoviedb.org/3";

serve(async (req: Request) => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  // pathParts = ["movies"] or ["movies", ":id"] or ["movies", "sync-tmdb"]

  try {
    // GET /movies?city=&genre=&language=&status=
    if (req.method === "GET" && pathParts.length === 1) {
      const status = url.searchParams.get("status") ?? "now_showing";
      const genre  = url.searchParams.get("genre");
      const lang   = url.searchParams.get("language");

      let query = supabase.from("movies").select("*").eq("status", status);
      if (genre) query = query.contains("genres", [genre]);
      if (lang)  query = query.contains("languages", [lang]);

      const { data, error } = await query.order("release_date", { ascending: false });
      if (error) throw error;
      return json(data);
    }

    // GET /movies/:id
    if (req.method === "GET" && pathParts.length === 2 && pathParts[1] !== "sync-tmdb") {
      const { data, error } = await supabase
        .from("movies")
        .select("*, reviews(rating, review_text, profiles(name, avatar_url))")
        .eq("id", pathParts[1])
        .single();
      if (error) throw error;
      return json(data);
    }

    // POST /movies/sync-tmdb (admin only — syncs TMDB movie into our DB)
    if (req.method === "POST" && pathParts[1] === "sync-tmdb") {
      const { tmdb_id } = await req.json();
      const tmdbRes = await fetch(
        `${TMDB_BASE}/movie/${tmdb_id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`
      );
      const tmdb = await tmdbRes.json();

      const movieData = {
        tmdb_id:          tmdb.id,
        title:            tmdb.title,
        synopsis:         tmdb.overview,
        genres:           tmdb.genres?.map((g: { name: string }) => g.name) ?? [],
        languages:        [tmdb.original_language],
        duration_minutes: tmdb.runtime,
        release_date:     tmdb.release_date,
        poster_url:       tmdb.poster_path
          ? `https://image.tmdb.org/t/p/w500${tmdb.poster_path}`
          : null,
        backdrop_url: tmdb.backdrop_path
          ? `https://image.tmdb.org/t/p/original${tmdb.backdrop_path}`
          : null,
        trailer_url: tmdb.videos?.results?.find(
          (v: { type: string; site: string }) => v.type === "Trailer" && v.site === "YouTube"
        )?.key
          ? `https://www.youtube.com/watch?v=${tmdb.videos.results.find(
              (v: { type: string; site: string }) => v.type === "Trailer" && v.site === "YouTube"
            ).key}`
          : null,
        cast_crew: tmdb.credits?.cast?.slice(0, 10).map(
          (c: { name: string; character: string; profile_path: string | null }) => ({
            name:      c.name,
            role:      c.character,
            photo_url: c.profile_path
              ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
              : null,
          })
        ) ?? [],
        avg_rating: tmdb.vote_average ? Math.round(tmdb.vote_average) / 2 : 0,
        status: "upcoming",
      };

      const { data, error } = await supabase
        .from("movies")
        .upsert(movieData, { onConflict: "tmdb_id" })
        .select()
        .single();
      if (error) throw error;
      return json(data, 201);
    }

    return json({ error: "Not found" }, 404);
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}
