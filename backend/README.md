# CineMax Backend — Supabase Edge Functions

> **Previous stack**: NestJS + Prisma + Redis  
> **New stack**: Supabase (Auth · PostgreSQL · RLS · Realtime · Edge Functions)

---

## Project Structure

```
backend/
├── supabase/
│   ├── config.toml                    # Supabase local dev config
│   ├── migrations/
│   │   └── 001_initial_schema.sql     # Full DB schema (users, movies, theatres, shows, bookings, payments...)
│   └── functions/
│       ├── movies/index.ts            # GET /movies, GET /movies/:id, POST /movies/sync-tmdb
│       ├── shows/index.ts             # GET /shows, GET /shows/:id, POST /shows (with conflict detection)
│       ├── theatres/index.ts          # GET /theatres (with OSM geo-search), POST /theatres (auto-geocode)
│       ├── bookings/index.ts          # Seat locking, booking creation, booking history
│       ├── payments/index.ts          # Razorpay order creation + HMAC-SHA256 verification
│       ├── seat-lock-expiry/index.ts  # pg_cron scheduled — releases expired locks via Realtime
│       └── recommendations/index.ts  # Phase 1: genre-based · Phase 2: pgvector
└── package.json                       # Supabase CLI dev scripts
```

---

## What Was Removed (and Why)

| Removed | Replaced By |
|---------|-------------|
| NestJS framework | Supabase Edge Functions (Deno) |
| Prisma ORM | Supabase JS client + raw SQL migrations |
| Redis (ioredis) | PostgreSQL conditional UPDATE (atomic seat locking) |
| BullMQ job queues | `pg_cron` scheduled Edge Functions |
| passport-jwt / bcrypt | Supabase Auth (handles JWT, OAuth, passwords) |
| Google OAuth passport strategy | Supabase Auth built-in Google provider |
| Local PostgreSQL container | Supabase cloud PostgreSQL |
| Python FastAPI recommendation service | PostgreSQL Phase 1 → pgvector Phase 2 |
| Docker Compose (postgres + redis) | `supabase start` (Supabase CLI local dev) |

---

## How Seat Locking Works (Redis → PostgreSQL)

The old stack used `Redis SETNX` for atomic seat locking. The new stack uses a **conditional PostgreSQL UPDATE**:

```sql
-- Only succeeds if status = 'available' — atomic, no race condition possible
UPDATE show_seats
SET status = 'locked', locked_by = $userId, locked_until = NOW() + INTERVAL '10 minutes'
WHERE show_id = $showId
  AND seat_label = ANY($seatLabels)
  AND status = 'available';
-- Check: rows_affected == requested_seats_count
-- If not → rollback all, return 409
```

Expired locks are released every minute by the `seat-lock-expiry` Edge Function via `pg_cron`.

---

## Realtime (WebSockets → Supabase Realtime)

The old stack used Socket.io WebSocket gateway. The new stack uses **Supabase Realtime**:

```ts
// Frontend: subscribe to a show's seat channel
const channel = supabase.channel(`show:${showId}`)
  .on('broadcast', { event: 'seat:released' }, ({ payload }) => {
    // Update seat map UI
  })
  .subscribe();

// Backend (Edge Function): broadcast when lock expires
await supabase.channel(`show:${showId}`).send({
  type: 'broadcast',
  event: 'seat:released',
  payload: { show_id, seat_labels },
});
```

---

## Local Development Setup

```bash
# 1. Install Supabase CLI
npm install -g supabase

# 2. Start local Supabase (PostgreSQL + Auth + Studio)
cd backend
supabase start

# 3. Apply migrations
supabase db push

# 4. Serve Edge Functions locally
supabase functions serve

# 5. Generate TypeScript types from schema
supabase gen types typescript --local > ../frontend/src/types/supabase.ts
```

Supabase Studio (local) will be available at: http://localhost:54323

---

## Deployment

```bash
# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# Push schema to production
supabase db push

# Deploy all Edge Functions
supabase functions deploy --all
```

---

## Environment Variables

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
TMDB_API_KEY=your-tmdb-api-key
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=http://localhost:3000
```

---

## Edge Functions Reference

| Function | Route | Method | Auth Required |
|----------|--------|--------|--------------|
| `movies` | `/movies` | GET | No |
| `movies` | `/movies/:id` | GET | No |
| `movies` | `/movies/sync-tmdb` | POST | Admin |
| `theatres` | `/theatres` | GET | No |
| `theatres` | `/theatres/:id` | GET | No |
| `theatres` | `/theatres` | POST | Admin |
| `shows` | `/shows` | GET | No |
| `shows` | `/shows/:id` | GET | No |
| `shows` | `/shows` | POST | Admin |
| `bookings` | `/bookings/lock-seats` | POST | User |
| `bookings` | `/bookings` | POST | User |
| `bookings` | `/bookings` | GET | User |
| `bookings` | `/bookings/:id` | GET | User |
| `payments` | `/payments/create-order` | POST | User |
| `payments` | `/payments/verify` | POST | User |
| `recommendations` | `/recommendations` | GET | Optional |
| `recommendations` | `/recommendations/similar/:id` | GET | No |
| `seat-lock-expiry` | (pg_cron scheduled) | — | Service role |
