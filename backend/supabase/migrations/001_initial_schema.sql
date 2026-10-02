-- ============================================================
--  CineMax Database Schema — Supabase (PostgreSQL 16)
--  Auth is handled by Supabase Auth (auth.users table).
--  All tables live in the `public` schema.
--  RLS is enabled on every table.
-- ============================================================

-- ─── EXTENSIONS ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";           -- pgvector for recommendations

-- ─── ENUM TYPES ─────────────────────────────────────────────
CREATE TYPE user_role         AS ENUM ('user', 'admin', 'theatre_owner');
CREATE TYPE movie_status      AS ENUM ('upcoming', 'now_showing', 'ended');
CREATE TYPE screen_type       AS ENUM ('standard', 'imax', '4dx', 'dolby');
CREATE TYPE show_format       AS ENUM ('2D', '3D', 'IMAX', '4DX');
CREATE TYPE show_status       AS ENUM ('active', 'cancelled', 'houseful');
CREATE TYPE seat_status       AS ENUM ('available', 'locked', 'booked');
CREATE TYPE booking_status    AS ENUM ('pending', 'confirmed', 'failed', 'cancelled', 'refunded');
CREATE TYPE payment_status    AS ENUM ('created', 'authorized', 'captured', 'failed', 'refunded');

-- ─── PROFILES (extends auth.users) ──────────────────────────
-- Supabase Auth handles passwords, OAuth, JWT — we store extra fields here.
CREATE TABLE profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT UNIQUE NOT NULL,
  phone        TEXT UNIQUE,
  name         TEXT NOT NULL DEFAULT '',
  role         user_role  DEFAULT 'user',
  city         TEXT,
  avatar_url   TEXT,
  is_verified  BOOLEAN DEFAULT false,
  preferred_genres   TEXT[],
  preferred_languages TEXT[],
  cine_coins   INTEGER DEFAULT 0,
  birthday     DATE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin full access on profiles" ON profiles USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- trigger: auto-create profile on user signup (supports Form signup and Google OAuth)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, phone, role, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'phone',
    COALESCE((LOWER(NEW.raw_user_meta_data->>'role'))::user_role, 'user'::user_role),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = NOW();
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── MOVIES ──────────────────────────────────────────────────
CREATE TABLE movies (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            TEXT NOT NULL,
  tmdb_id          INTEGER UNIQUE,
  synopsis         TEXT,
  genres           TEXT[],
  languages        TEXT[],
  duration_minutes INTEGER,
  certification    TEXT,           -- 'U', 'UA', 'A'
  release_date     DATE,
  poster_url       TEXT,
  backdrop_url     TEXT,
  trailer_url      TEXT,
  cast_crew        JSONB,          -- [{name, role, photo_url}]
  avg_rating       NUMERIC(3,1) DEFAULT 0,
  total_ratings    INTEGER DEFAULT 0,
  status           movie_status DEFAULT 'upcoming',
  -- pgvector embedding for recommendations (Phase 2)
  embedding        vector(1536),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read movies" ON movies FOR SELECT USING (true);
CREATE POLICY "Admin can manage movies" ON movies USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ─── THEATRES ────────────────────────────────────────────────
CREATE TABLE theatres (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  owner_id   UUID REFERENCES profiles(id),
  address    TEXT NOT NULL,
  city       TEXT NOT NULL,
  state      TEXT,
  lat        NUMERIC(9,6),
  lng        NUMERIC(9,6),
  amenities  TEXT[],              -- ['Parking', 'Food Court', 'IMAX']
  is_active  BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE theatres ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active theatres" ON theatres FOR SELECT USING (is_active = true);
CREATE POLICY "Admin/owner can manage theatres" ON theatres USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'theatre_owner'))
);

-- ─── SCREENS ─────────────────────────────────────────────────
CREATE TABLE screens (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  theatre_id   UUID REFERENCES theatres(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,         -- 'Screen 1', 'IMAX Hall'
  screen_type  screen_type DEFAULT 'standard',
  total_seats  INTEGER NOT NULL,
  seat_layout  JSONB NOT NULL,        -- {"rows": [{"row":"A","seats":[1..10]}]}
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE screens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read screens" ON screens FOR SELECT USING (true);
CREATE POLICY "Admin/owner can manage screens" ON screens USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'theatre_owner'))
);

-- ─── SEAT CATEGORIES ─────────────────────────────────────────
CREATE TABLE seat_categories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  screen_id  UUID REFERENCES screens(id) ON DELETE CASCADE,
  name       TEXT,                    -- 'Recliner', 'Gold', 'Silver'
  base_price NUMERIC(10,2) NOT NULL,
  row_range  TEXT[]                   -- ['A','B'] = Recliner rows
);
ALTER TABLE seat_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read seat categories" ON seat_categories FOR SELECT USING (true);
CREATE POLICY "Admin/owner can manage seat categories" ON seat_categories USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'theatre_owner'))
);

-- ─── SHOWS ───────────────────────────────────────────────────
CREATE TABLE shows (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  movie_id   UUID REFERENCES movies(id),
  screen_id  UUID REFERENCES screens(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time   TIMESTAMPTZ NOT NULL,
  language   TEXT,
  format     show_format DEFAULT '2D',
  status     show_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE shows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read shows" ON shows FOR SELECT USING (true);
CREATE POLICY "Admin can manage shows" ON shows USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ─── SHOW SEATS ──────────────────────────────────────────────
-- Pre-populated on show creation (one row per physical seat per show)
CREATE TABLE show_seats (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  show_id      UUID REFERENCES shows(id) ON DELETE CASCADE,
  seat_label   TEXT NOT NULL,          -- 'A1', 'B5'
  category_id  UUID REFERENCES seat_categories(id),
  price        NUMERIC(10,2) NOT NULL,
  status       seat_status DEFAULT 'available',
  locked_by    UUID REFERENCES profiles(id),
  locked_until TIMESTAMPTZ,
  booking_id   UUID,                   -- FK added after bookings table (see below)
  UNIQUE(show_id, seat_label)
);
ALTER TABLE show_seats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read show seats" ON show_seats FOR SELECT USING (true);
CREATE POLICY "Authenticated users can lock/book seats" ON show_seats FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- ─── BOOKINGS ────────────────────────────────────────────────
CREATE TABLE bookings (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID REFERENCES profiles(id),
  show_id          UUID REFERENCES shows(id),
  total_amount     NUMERIC(10,2) NOT NULL,
  convenience_fee  NUMERIC(10,2) DEFAULT 0,
  status           booking_status DEFAULT 'pending',
  payment_id       UUID,               -- set after payment confirmed
  qr_code_url      TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at     TIMESTAMPTZ
);
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings"   ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin can view all bookings" ON bookings FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- circular FK resolution: booking_id on show_seats references bookings
ALTER TABLE show_seats ADD CONSTRAINT fk_show_seat_booking
  FOREIGN KEY (booking_id) REFERENCES bookings(id);

-- ─── PAYMENTS ────────────────────────────────────────────────
CREATE TABLE payments (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id           UUID REFERENCES bookings(id),
  razorpay_order_id    TEXT UNIQUE NOT NULL,
  razorpay_payment_id  TEXT UNIQUE,      -- UNIQUE prevents double-payment processing
  razorpay_signature   TEXT,
  amount               NUMERIC(10,2) NOT NULL,
  currency             TEXT DEFAULT 'INR',
  status               payment_status DEFAULT 'created',
  method               TEXT,             -- 'upi', 'card', 'netbanking'
  failure_reason       TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payments" ON payments FOR SELECT
  USING (EXISTS (SELECT 1 FROM bookings WHERE id = booking_id AND user_id = auth.uid()));
CREATE POLICY "Edge functions can manage payments" ON payments USING (true);

-- FK from bookings.payment_id → payments
ALTER TABLE bookings ADD CONSTRAINT fk_booking_payment
  FOREIGN KEY (payment_id) REFERENCES payments(id);

-- ─── REVIEWS ─────────────────────────────────────────────────
CREATE TABLE reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES profiles(id),
  movie_id    UUID REFERENCES movies(id),
  booking_id  UUID REFERENCES bookings(id), -- only verified bookers can review
  rating      SMALLINT CHECK (rating BETWEEN 1 AND 10),
  review_text TEXT,
  is_visible  BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read visible reviews" ON reviews FOR SELECT USING (is_visible = true);
CREATE POLICY "Verified bookers can post reviews" ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM bookings WHERE id = booking_id AND user_id = auth.uid() AND status = 'confirmed'));

-- ─── WATCH HISTORY ───────────────────────────────────────────
CREATE TABLE watch_history (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES profiles(id),
  movie_id     UUID REFERENCES movies(id),
  booking_id   UUID REFERENCES bookings(id) UNIQUE,
  watched_at   TIMESTAMPTZ DEFAULT NOW(),
  rating_given SMALLINT
);
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own watch history" ON watch_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert watch history"  ON watch_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── CINE COINS / LOYALTY ────────────────────────────────────
CREATE TABLE cine_coin_transactions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES profiles(id),
  booking_id  UUID REFERENCES bookings(id),
  amount      INTEGER NOT NULL,          -- positive = earned, negative = redeemed
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE cine_coin_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own coin transactions" ON cine_coin_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- ─── DISCOUNT CODES ──────────────────────────────────────────
CREATE TABLE discount_codes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            TEXT UNIQUE NOT NULL,
  discount_pct    NUMERIC(5,2),          -- 10.00 = 10%
  discount_flat   NUMERIC(10,2),         -- flat amount off
  max_uses        INTEGER,
  used_count      INTEGER DEFAULT 0,
  valid_from      TIMESTAMPTZ,
  valid_until     TIMESTAMPTZ,
  min_amount      NUMERIC(10,2),
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active codes" ON discount_codes FOR SELECT USING (is_active = true);
CREATE POLICY "Admin can manage codes" ON discount_codes USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ─── INDEXES ─────────────────────────────────────────────────
CREATE INDEX idx_shows_movie_id      ON shows(movie_id);
CREATE INDEX idx_shows_screen_id     ON shows(screen_id);
CREATE INDEX idx_shows_start_time    ON shows(start_time);
CREATE INDEX idx_show_seats_show_id  ON show_seats(show_id);
CREATE INDEX idx_show_seats_status   ON show_seats(status);
CREATE INDEX idx_bookings_user_id    ON bookings(user_id);
CREATE INDEX idx_bookings_show_id    ON bookings(show_id);
CREATE INDEX idx_watch_history_user  ON watch_history(user_id);
CREATE INDEX idx_movies_status       ON movies(status);
CREATE INDEX idx_movies_tmdb_id      ON movies(tmdb_id);
-- pgvector index for ANN search (enable when embedding column is populated)
-- CREATE INDEX idx_movies_embedding ON movies USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
