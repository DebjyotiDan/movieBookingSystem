// Edge Function: payments
// Handles: Razorpay order creation + HMAC-SHA256 webhook verification + booking confirmation
// CRITICAL: Verify signature BEFORE any DB mutation

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { hmac } from "https://deno.land/x/hmac@v2.0.1/mod.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID")!;
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;
const RAZORPAY_BASE = "https://api.razorpay.com/v1";

const razorpayHeaders = {
  Authorization: `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`,
  "Content-Type": "application/json",
};

serve(async (req: Request) => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);

  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return json({ error: "Unauthorized" }, 401);
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return json({ error: "Unauthorized" }, 401);

  try {
    // POST /payments/create-order  — Create Razorpay order for a booking
    if (req.method === "POST" && pathParts[1] === "create-order") {
      const { booking_id } = await req.json() as { booking_id: string };

      const { data: booking, error: bookingErr } = await supabase
        .from("bookings")
        .select("total_amount, convenience_fee, user_id")
        .eq("id", booking_id)
        .single();

      if (bookingErr) throw bookingErr;
      if (booking.user_id !== user.id) return json({ error: "Forbidden" }, 403);

      const amountPaise = Math.round(
        (Number(booking.total_amount) + Number(booking.convenience_fee)) * 100
      );

      const rzRes = await fetch(`${RAZORPAY_BASE}/orders`, {
        method: "POST",
        headers: razorpayHeaders,
        body: JSON.stringify({
          amount: amountPaise,
          currency: "INR",
          receipt: booking_id,
        }),
      });
      const rzOrder = await rzRes.json();

      // Store payment record with order_id
      const { data: payment, error: payErr } = await supabase
        .from("payments")
        .insert({
          booking_id,
          razorpay_order_id: rzOrder.id,
          amount: booking.total_amount,
          status: "created",
        })
        .select()
        .single();

      if (payErr) throw payErr;
      return json({ razorpay_order_id: rzOrder.id, payment_id: payment.id, amount_paise: amountPaise });
    }

    // POST /payments/verify  — Verify HMAC signature and confirm booking
    // ⚠️ CRITICAL: Signature verification happens FIRST — no DB write before this
    if (req.method === "POST" && pathParts[1] === "verify") {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        booking_id,
      } = await req.json() as {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
        booking_id: string;
      };

      // Step 1: Verify HMAC-SHA256 signature
      const expectedSig = hmac(
        "sha256",
        RAZORPAY_KEY_SECRET,
        `${razorpay_order_id}|${razorpay_payment_id}`,
        "utf8",
        "hex"
      );
      if (expectedSig !== razorpay_signature) {
        return json({ error: "Invalid payment signature" }, 400);
      }

      // Step 2: Check idempotency — payment_id already processed?
      const { data: existing } = await supabase
        .from("payments")
        .select("id")
        .eq("razorpay_payment_id", razorpay_payment_id)
        .maybeSingle();

      if (existing) return json({ message: "Already processed", idempotent: true });

      // Step 3: Update payment record
      const { data: payment, error: payErr } = await supabase
        .from("payments")
        .update({
          razorpay_payment_id,
          razorpay_signature,
          status: "captured",
          updated_at: new Date().toISOString(),
        })
        .eq("razorpay_order_id", razorpay_order_id)
        .select()
        .single();

      if (payErr) throw payErr;

      // Step 4: Confirm booking
      const { error: bookErr } = await supabase
        .from("bookings")
        .update({
          status: "confirmed",
          payment_id: payment.id,
          confirmed_at: new Date().toISOString(),
        })
        .eq("id", booking_id);

      if (bookErr) throw bookErr;

      // Step 5: Mark show_seats as booked
      await supabase
        .from("show_seats")
        .update({ status: "booked", locked_by: null, locked_until: null, booking_id })
        .eq("booking_id", null) // only un-confirmed seats for this booking
        .eq("show_id", (await supabase.from("bookings").select("show_id").eq("id", booking_id).single()).data?.show_id)
        .eq("locked_by", user.id);

      // Step 6: Record watch history entry (will be used for recommendations)
      const { data: bk } = await supabase.from("bookings").select("show_id").eq("id", booking_id).single();
      const { data: show } = bk
        ? await supabase.from("shows").select("movie_id").eq("id", bk.show_id).single()
        : { data: null };

      if (show) {
        await supabase.from("watch_history").upsert({
          user_id: user.id,
          movie_id: show.movie_id,
          booking_id,
        }, { onConflict: "booking_id" });
      }

      // TODO: Trigger Supabase Realtime broadcast to release seat UI
      // TODO: Generate QR code (via Edge Function: qr-generator)
      // TODO: Send email confirmation (via Resend / Supabase Edge Function)

      return json({ success: true, booking_id });
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
