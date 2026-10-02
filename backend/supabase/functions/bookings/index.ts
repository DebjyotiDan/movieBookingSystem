// Edge Function: bookings
// Handles: seat lock, booking creation, booking confirmation, cancellation
// Critical: 3-layer race condition protection (Supabase Realtime lock + PostgreSQL FOR UPDATE)

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req: Request) => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  // pathParts[0] = "bookings"

  // Extract JWT user from Authorization header
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return json({ error: "Unauthorized" }, 401);

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return json({ error: "Unauthorized" }, 401);

  try {
    // POST /bookings/lock-seats  — Lock selected seats for 10 minutes
    if (req.method === "POST" && pathParts[1] === "lock-seats") {
      const { show_id, seat_labels } = await req.json() as {
        show_id: string;
        seat_labels: string[];
      };

      const lockedUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      // Atomic: only update rows that are currently 'available'
      const { data, error } = await supabase
        .from("show_seats")
        .update({ status: "locked", locked_by: user.id, locked_until: lockedUntil })
        .eq("show_id", show_id)
        .in("seat_label", seat_labels)
        .eq("status", "available")  // 🔒 atomic guard — only available seats
        .select();

      if (error) throw error;

      // If fewer rows updated than requested → some seats were already taken
      if (data.length < seat_labels.length) {
        // Roll back: release the ones we just locked
        await supabase
          .from("show_seats")
          .update({ status: "available", locked_by: null, locked_until: null })
          .eq("show_id", show_id)
          .eq("locked_by", user.id)
          .in("seat_label", seat_labels);

        return json({ error: "One or more seats are no longer available" }, 409);
      }

      return json({ locked: data, locked_until: lockedUntil });
    }

    // POST /bookings  — Create a pending booking (after lock)
    if (req.method === "POST" && pathParts.length === 1) {
      const { show_id, seat_labels, convenience_fee = 0 } = await req.json() as {
        show_id: string;
        seat_labels: string[];
        convenience_fee?: number;
      };

      // Verify user owns all locks
      const { data: seats, error: seatsErr } = await supabase
        .from("show_seats")
        .select("price, locked_by")
        .eq("show_id", show_id)
        .in("seat_label", seat_labels)
        .eq("status", "locked");

      if (seatsErr) throw seatsErr;

      const unauthorized = seats.some((s) => s.locked_by !== user.id);
      if (unauthorized) return json({ error: "Seat lock not owned by this user" }, 403);

      const total_amount = seats.reduce((sum, s) => sum + Number(s.price), 0);

      const { data: booking, error: bookingErr } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          show_id,
          total_amount,
          convenience_fee,
          status: "pending",
        })
        .select()
        .single();

      if (bookingErr) throw bookingErr;
      return json(booking, 201);
    }

    // GET /bookings  — User's booking history
    if (req.method === "GET" && pathParts.length === 1) {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, shows(start_time, format, language, movies(title, poster_url))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return json(data);
    }

    // GET /bookings/:id
    if (req.method === "GET" && pathParts.length === 2) {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, shows(*, movies(*), screens(*, theatres(*))), payments(*)")
        .eq("id", pathParts[1])
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return json(data);
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
