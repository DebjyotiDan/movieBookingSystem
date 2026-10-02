// Edge Function: theatres
// Handles: theatre listing with geo-location (OpenStreetMap/Nominatim), theatre detail

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

serve(async (req: Request) => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);

  try {
    // GET /theatres?city=&lat=&lng=&radius_km=
    if (req.method === "GET" && pathParts.length === 1) {
      const city      = url.searchParams.get("city");
      const lat       = url.searchParams.get("lat");
      const lng       = url.searchParams.get("lng");
      const radiusKm  = parseFloat(url.searchParams.get("radius_km") ?? "15");

      let query = supabase
        .from("theatres")
        .select("*")
        .eq("is_active", true);

      if (city)       query = query.ilike("city", `%${city}%`);

      // Bounding-box filter when coordinates are provided (OSM-style proximity)
      if (lat && lng) {
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        const latDelta = radiusKm / 111.0;
        const lngDelta = radiusKm / (111.0 * Math.cos((latNum * Math.PI) / 180));
        query = query
          .gte("lat", latNum - latDelta)
          .lte("lat", latNum + latDelta)
          .gte("lng", lngNum - lngDelta)
          .lte("lng", lngNum + lngDelta);
      }

      const { data, error } = await query.order("name");
      if (error) throw error;
      return json(data);
    }

    // GET /theatres/:id
    if (req.method === "GET" && pathParts.length === 2) {
      const { data, error } = await supabase
        .from("theatres")
        .select("*, screens(*, seat_categories(*))")
        .eq("id", pathParts[1])
        .single();
      if (error) throw error;
      return json(data);
    }

    // POST /theatres  — Admin: create theatre, auto-geocode via Nominatim
    if (req.method === "POST" && pathParts.length === 1) {
      const body = await req.json() as {
        name: string;
        address: string;
        city: string;
        state?: string;
        amenities?: string[];
        owner_id?: string;
      };

      // Auto-geocode address using OpenStreetMap Nominatim
      let lat: number | null = null;
      let lng: number | null = null;
      try {
        const geoRes = await fetch(
          `${NOMINATIM_BASE}/search?q=${encodeURIComponent(`${body.address}, ${body.city}`)}&format=json&limit=1`,
          { headers: { "User-Agent": "CineMax/1.0 (contact@cinemax.in)" } }
        );
        const geoData = await geoRes.json();
        if (geoData.length > 0) {
          lat = parseFloat(geoData[0].lat);
          lng = parseFloat(geoData[0].lon);
        }
      } catch {
        // Geocoding failure is non-fatal
      }

      const { data, error } = await supabase
        .from("theatres")
        .insert({ ...body, lat, lng })
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
