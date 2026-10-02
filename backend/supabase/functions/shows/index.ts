// Edge Function: shows
// Handles: show listings by movie+city, show detail with seat availability

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req: Request) => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);

  try {
    // GET /shows?movie_id=&city=&date=
    if (req.method === "GET" && pathParts.length === 1) {
      const movie_id = url.searchParams.get("movie_id");
      const city     = url.searchParams.get("city");
      const date     = url.searchParams.get("date") ?? new Date().toISOString().split("T")[0];

      const dayStart = `${date}T00:00:00Z`;
      const dayEnd   = `${date}T23:59:59Z`;

      let query = supabase
        .from("shows")
        .select(`
          id, start_time, end_time, language, format, status,
          screens(name, screen_type, theatres(id, name, address, city, lat, lng, amenities))
        `)
        .eq("status", "active")
        .gte("start_time", dayStart)
        .lte("start_time", dayEnd);

      if (movie_id) query = query.eq("movie_id", movie_id);
      if (city)     query = query.eq("screens.theatres.city", city);

      const { data, error } = await query.order("start_time");
      if (error) throw error;
      return json(data);
    }

    // GET /shows/:id  — show detail with real-time seat availability
    if (req.method === "GET" && pathParts.length === 2) {
      const { data: show, error: showErr } = await supabase
        .from("shows")
        .select(`
          *,
          movies(title, duration_minutes, certification),
          screens(name, screen_type, seat_layout, seat_categories(*), theatres(name, address))
        `)
        .eq("id", pathParts[1])
        .single();

      if (showErr) throw showErr;

      const { data: seats, error: seatsErr } = await supabase
        .from("show_seats")
        .select("seat_label, status, price, category_id")
        .eq("show_id", pathParts[1]);

      if (seatsErr) throw seatsErr;

      return json({ ...show, seats });
    }

    // POST /shows  — Admin: create show (with conflict detection)
    if (req.method === "POST" && pathParts.length === 1) {
      const { movie_id, screen_id, start_time, language, format } = await req.json() as {
        movie_id: string;
        screen_id: string;
        start_time: string;
        language: string;
        format: string;
      };

      // Fetch movie duration to calculate end_time
      const { data: movie } = await supabase
        .from("movies")
        .select("duration_minutes")
        .eq("id", movie_id)
        .single();

      const endTime = new Date(
        new Date(start_time).getTime() + (movie?.duration_minutes ?? 120) * 60000
      ).toISOString();

      // Conflict detection: no overlapping shows on same screen
      const { data: conflicts } = await supabase
        .from("shows")
        .select("id")
        .eq("screen_id", screen_id)
        .eq("status", "active")
        .lt("start_time", endTime)
        .gt("end_time", start_time);

      if (conflicts && conflicts.length > 0) {
        return json({ error: "Screen has a conflicting show in this time slot" }, 409);
      }

      const { data: show, error: showErr } = await supabase
        .from("shows")
        .insert({ movie_id, screen_id, start_time, end_time: endTime, language, format })
        .select()
        .single();

      if (showErr) throw showErr;

      // Pre-populate show_seats from screen seat_layout
      const { data: screen } = await supabase
        .from("screens")
        .select("seat_layout, seat_categories(*)")
        .eq("id", screen_id)
        .single();

      if (screen?.seat_layout) {
        const layout = screen.seat_layout as { rows: Array<{ row: string; seats: number[] }> };
        const seatRows = layout.rows.flatMap((r) =>
          r.seats.map((seatNum) => {
            const label = `${r.row}${seatNum}`;
            const category = (screen.seat_categories as Array<{ id: string; row_range: string[]; base_price: number }>)
              .find((cat) => cat.row_range?.includes(r.row));
            return {
              show_id:     show.id,
              seat_label:  label,
              category_id: category?.id ?? null,
              price:       category?.base_price ?? 200,
              status:      "available",
            };
          })
        );

        await supabase.from("show_seats").insert(seatRows);
      }

      return json(show, 201);
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
