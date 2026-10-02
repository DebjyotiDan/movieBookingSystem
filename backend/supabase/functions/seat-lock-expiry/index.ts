// Edge Function: seat-lock-expiry
// Scheduled via Supabase pg_cron (runs every minute)
// Releases expired seat locks and broadcasts via Supabase Realtime
// pg_cron setup (run in SQL editor):
//   SELECT cron.schedule('release-expired-locks', '* * * * *',
//     $$SELECT net.http_post(url := '<SUPABASE_URL>/functions/v1/seat-lock-expiry',
//       headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>"}')$$);

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (_req: Request) => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Find all seats where lock has expired
  const { data: expiredSeats, error } = await supabase
    .from("show_seats")
    .select("id, show_id, seat_label, locked_by")
    .eq("status", "locked")
    .lt("locked_until", new Date().toISOString());

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  if (!expiredSeats || expiredSeats.length === 0) {
    return new Response(JSON.stringify({ released: 0 }), { status: 200 });
  }

  // Release the expired locks
  const { error: releaseErr } = await supabase
    .from("show_seats")
    .update({ status: "available", locked_by: null, locked_until: null })
    .in("id", expiredSeats.map((s) => s.id));

  if (releaseErr) {
    return new Response(JSON.stringify({ error: releaseErr.message }), { status: 500 });
  }

  // Broadcast via Supabase Realtime so frontend clients update their seat maps
  const showGroups: Record<string, string[]> = {};
  for (const seat of expiredSeats) {
    if (!showGroups[seat.show_id]) showGroups[seat.show_id] = [];
    showGroups[seat.show_id].push(seat.seat_label);
  }

  // Supabase Realtime broadcast (using the Broadcast channel per show)
  for (const [show_id, seat_labels] of Object.entries(showGroups)) {
    await supabase.channel(`show:${show_id}`).send({
      type: "broadcast",
      event: "seat:released",
      payload: { show_id, seat_labels },
    });
  }

  return new Response(
    JSON.stringify({ released: expiredSeats.length, shows: Object.keys(showGroups) }),
    { status: 200 }
  );
});
