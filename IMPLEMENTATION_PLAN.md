# 🎬 CineMax — Online Movie Ticket Booking System
## Implementation Plan & High-Level System Design

> **Project Goal**: Build a production-grade movie ticket booking platform — inspired by BookMyShow but with superior architecture, unique features, and a world-class user experience. Stack is already partially set up: **NestJS** (backend), **Next.js 16** (frontend), with a dedicated **Python** recommendation microservice.

---

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack & Justifications](#technology-stack--justifications)
3. [High-Level System Architecture](#high-level-system-architecture)
4. [Database Schema Design](#database-schema-design)
5. [Core Feature Modules](#core-feature-modules)
6. [Extra / Unique Features](#extra--unique-features)
7. [Critical Problem Handling](#critical-problem-handling)
8. [Proposed Changes](#proposed-changes)
9. [Phased Execution Plan](#phased-execution-plan)
10. [Verification Plan](#verification-plan)

---

## 1. System Overview

CineMax is a **full-stack, microservice-influenced** movie ticket booking system. It has three major sides:

| Side | Description |
|------|-------------|
| **User Portal** | Search movies, browse showtimes, select seats, make payments, view history, get recommendations |
| **Admin Portal** | Manage theatres, screens, movies, pricing, showtimes, analytics |
| **Recommendation Engine** | Python microservice that learns from user watch/booking history and surfaces personalized suggestions |

---

## 2. Technology Stack & Justifications

### 🖥️ Frontend: **Next.js 16 + React 19 + TypeScript**
Already set up in `/frontend`. 

**Why Next.js over plain React/Vite?**
- **SSR (Server-Side Rendering)** — Movie listings and showtimes need to be SEO-indexed. Next.js renders them server-side, making Google crawl them. A plain SPA like Vite would render an empty shell.
- **App Router** — File-system routing is ideal for nested routes like `/movies/[id]/shows/[showId]/seats`.
- **Image Optimization** — Built-in `<Image>` component with lazy loading and WebP conversion for movie posters.
- **Server Components** — Static pages like movie details can be streamed directly without client JS overhead.
- **Why not Vue/Angular?** React has the largest ecosystem and the team is already using it.

**UI Libraries**:
- **Tailwind CSS v4** — Already in project. Utility-first CSS with zero runtime overhead.
- **Framer Motion** — Premium animations (seat selection, booking flow). Cannot be achieved with CSS alone.
- **shadcn/ui** — Headless, accessible components (dialogs, toasts, dropdowns) that we fully style ourselves.
- **Zustand** — Lightweight global state manager. Redux would be overkill; Context API has performance issues at scale.
- **React Query (TanStack Query)** — Server state management (caching, background refetch, optimistic updates for seats).

---

### ⚙️ Backend: **NestJS 11 + TypeScript**
Already set up in `/backend`.

**Why NestJS over Express/Fastify?**
- **Modular Architecture** — NestJS enforces a module-based structure (Movies, Auth, Bookings, etc.) that scales cleanly.
- **Built-in DI (Dependency Injection)** — No need for manual wiring. Services, repositories, guards auto-inject.
- **Decorators + Guards** — `@Roles('admin')`, `@UseGuards(JwtAuthGuard)` make auth trivially clean.
- **WebSocket Support** — `@nestjs/websockets` with Socket.io for real-time seat locking — a critical feature.
- **Why not Go/Rust?** TypeScript shares the type definitions with the frontend (shared DTOs). No language context switching.
- **Why not Python for backend?** Python (FastAPI) would be great but we already have NestJS; Python is better used for the ML recommendation service.

---

### 🗄️ Primary Database: **PostgreSQL 16**
**Why PostgreSQL over MongoDB/MySQL?**
- **ACID Transactions** — Seat booking is a financial transaction. If two users try to book seat A5 simultaneously, PostgreSQL's row-level locking + serializable transactions guarantee only one succeeds. MongoDB cannot guarantee this without complex workarounds.
- **Complex Joins** — Bookings JOIN seats JOIN shows JOIN theatres JOIN movies. Relational data is a perfect fit.
- **JSON Columns** — For storing dynamic seat layout schemas per screen, PostgreSQL's `JSONB` is ideal.
- **FOR UPDATE SKIP LOCKED** — Native SQL clause perfect for queue-style processing (payment retries).
- **Why not MySQL?** PostgreSQL has superior JSON support, more advanced window functions, and better concurrency control.

---

### ⚡ Cache + Real-time Locks: **Redis 7**
**Why Redis over Memcached/in-memory?**
- **SETNX (SET if Not Exists) + TTL** — The perfect primitive for seat locking. `SETNX seat:showId:seatId userId 300` atomically locks a seat for 300s.
- **Pub/Sub** — Broadcast seat status changes to all connected WebSocket clients instantly.
- **Session Storage** — JWT refresh tokens stored here for instant revocation.
- **Rate Limiting** — Protect payment endpoints with sliding window counters.
- **Persistent AOF** — Unlike Memcached, Redis can be configured to persist data across restarts.
- **Why not just PostgreSQL for locking?** DB row locks are held inside transactions. Redis TTL-based locks are self-expiring — perfect for "payment timeout" scenarios.

---

### 🐍 Recommendation Service: **Python + FastAPI + TensorFlow/Surprise**
Lives in `/recommendationService`.

**Why Python over Node.js for ML?**
- **Ecosystem** — TensorFlow, PyTorch, Scikit-learn, Surprise (collaborative filtering) — none have mature Node.js equivalents.
- **FastAPI** — Async Python framework, OpenAPI auto-docs, Pydantic validation. As fast as Node.js for I/O bound work.
- **Why Surprise/TF over just rules?** Pure rule-based ("watch action, recommend action") is shallow. Collaborative filtering ("users like you also watched...") and content-based filtering (genre vectors) yield genuinely useful recommendations.

**Algorithms Used**:
1. **Collaborative Filtering** (SVD via Surprise library) — Find similar users and recommend what they liked.
2. **Content-Based Filtering** (TF-IDF on genre/cast/synopsis) — If you liked Inception, recommend other Christopher Nolan sci-fi.
3. **Hybrid Ensemble** — Weighted combination for cold-start and warm users.

---

### 📨 Message Queue: **BullMQ (Redis-backed)**
**Why a queue over direct API calls?**
- **Payment webhooks** from Razorpay are async. They must be processed reliably — a queue with retry logic handles this.
- **Email/SMS notifications** after booking should not block the HTTP response.
- **Seat lock expiry events** — When a lock expires, a job notifies the system to free the seat.
- **Why BullMQ over RabbitMQ/Kafka?** BullMQ is Redis-based (we already have Redis), has a beautiful NestJS integration (`@nestjs/bull`), and is perfect for this scale. RabbitMQ/Kafka add operational complexity without benefit at our scale.

---

### 💳 Payment Gateway: **Razorpay**
**Why Razorpay?**
- Native Indian payment gateway with UPI, NetBanking, Wallets, Cards — covers 99% of Indian users.
- Excellent webhook system for async payment confirmation.
- Test mode for development.
- Official Node.js SDK available.

---

### 🐳 Containerization: **Docker + Docker Compose**
- Every service (NestJS, Next.js, PostgreSQL, Redis, Python FastAPI) runs in isolated containers.
- `docker-compose.yml` orchestrates local dev. Kubernetes-ready for production scaling.

---

### 🔐 Authentication: **JWT + Refresh Tokens + Google OAuth**
- Short-lived access tokens (15 min) + long-lived refresh tokens stored in Redis.
- Google OAuth for one-click login.
- `passport-jwt` + `passport-google-oauth20` via `@nestjs/passport`.

---

## 3. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                      │
│  ┌──────────────────────┐       ┌────────────────────────────────────┐  │
│  │  User Portal          │       │  Admin Portal                      │  │
│  │  (Next.js 16 / SSR)  │       │  (Next.js — /admin route group)    │  │
│  └──────────┬───────────┘       └────────────────┬───────────────────┘  │
└─────────────┼────────────────────────────────────┼─────────────────────┘
              │ HTTPS                               │ HTTPS
              ▼                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY / NGINX                               │
│   Rate Limiting · SSL Termination · Load Balancing · Route Proxying      │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
         ┌───────────────────┼────────────────────────┐
         ▼                   ▼                        ▼
┌─────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐
│  NestJS Backend │  │  Python FastAPI   │  │  WebSocket Server        │
│  (Port 7000)    │  │  Recommendation  │  │  (Socket.io via NestJS   │
│                 │  │  Service          │  │   Gateway)               │
│  Modules:       │  │  (Port 8000)     │  │                          │
│  • Auth         │  │                  │  │  Events:                 │
│  • Users        │  │  Endpoints:      │  │  • seat:locked           │
│  • Movies       │  │  • /recommend    │  │  • seat:released         │
│  • Theatres     │  │  • /train        │  │  • seat:booked           │
│  • Shows        │  │  • /similar      │  │  • payment:timeout       │
│  • Seats        │  └────────┬─────────┘  └──────────────────────────┘
│  • Bookings     │           │
│  • Payments     │           │ Internal HTTP
│  • Reviews      │           │
│  • Notifications│  ┌────────▼─────────┐
│  • Admin        │  │  ML Models       │
└────────┬────────┘  │  (stored on disk │
         │           │   / S3)          │
         │           └──────────────────┘
         │
    ┌────┴──────────────────────────────────────┐
    │           DATA LAYER                       │
    │                                            │
    │  ┌─────────────────┐  ┌─────────────────┐ │
    │  │  PostgreSQL 16   │  │   Redis 7        │ │
    │  │  (Primary DB)    │  │  • Seat Locks    │ │
    │  │                  │  │  • Sessions      │ │
    │  │  Tables:         │  │  • Cache         │ │
    │  │  • users         │  │  • BullMQ jobs   │ │
    │  │  • movies        │  │  • Pub/Sub       │ │
    │  │  • theatres      │  │  • Rate limits   │ │
    │  │  • screens       │  └─────────────────┘ │
    │  │  • shows         │                       │
    │  │  • seats         │  ┌─────────────────┐ │
    │  │  • bookings      │  │  AWS S3 /        │ │
    │  │  • tickets       │  │  Cloudinary      │ │
    │  │  • payments      │  │  (Movie posters, │ │
    │  │  • reviews       │  │   ML models)     │ │
    │  │  • watchHistory  │  └─────────────────┘ │
    │  └─────────────────┘                       │
    └────────────────────────────────────────────┘
         │
    ┌────▼──────────────────────────────────────┐
    │         ASYNC WORKERS (BullMQ)             │
    │  • payment-processor                       │
    │  • email-sender (Nodemailer/SendGrid)       │
    │  • sms-sender (Twilio/Fast2SMS)            │
    │  • seat-lock-expiry                        │
    │  • recommendation-trainer (nightly)        │
    └────────────────────────────────────────────┘
         │
    ┌────▼──────────────────────────────────────┐
    │         EXTERNAL SERVICES                  │
    │  • Razorpay (Payments)                     │
    │  • TMDB API (Movie metadata enrichment)    │
    │  • Google OAuth (Authentication)           │
    │  • SendGrid (Transactional emails)         │
    │  • Fast2SMS / Twilio (SMS OTP)             │
    └────────────────────────────────────────────┘
```

---

## 4. Database Schema Design

### Key Tables

```sql
-- users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(15) UNIQUE,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255),
  google_id VARCHAR(255),
  role ENUM('user', 'admin', 'theatre_owner') DEFAULT 'user',
  city VARCHAR(100),
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- movies
CREATE TABLE movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  tmdb_id INTEGER,
  synopsis TEXT,
  genre TEXT[], -- PostgreSQL array
  language VARCHAR(100)[],
  duration_minutes INTEGER,
  certification VARCHAR(10), -- 'U', 'UA', 'A'
  release_date DATE,
  poster_url TEXT,
  trailer_url TEXT,
  cast_crew JSONB, -- [{name, role, photo}]
  avg_rating NUMERIC(3,1) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  status ENUM('upcoming', 'now_showing', 'ended') DEFAULT 'upcoming'
);

-- theatres
CREATE TABLE theatres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  owner_id UUID REFERENCES users(id),
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  lat NUMERIC(9,6),
  lng NUMERIC(9,6),
  amenities TEXT[], -- ['Parking', 'Food Court', 'IMAX']
  is_active BOOLEAN DEFAULT true
);

-- screens (each theatre has multiple screens)
CREATE TABLE screens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theatre_id UUID REFERENCES theatres(id),
  name VARCHAR(50) NOT NULL, -- 'Screen 1', 'IMAX Hall'
  screen_type ENUM('standard', 'imax', '4dx', 'dolby') DEFAULT 'standard',
  total_seats INTEGER NOT NULL,
  seat_layout JSONB NOT NULL -- {"rows": [{"row": "A", "seats": [1..10]}]}
);

-- seat_categories (per screen)
CREATE TABLE seat_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_id UUID REFERENCES screens(id),
  name VARCHAR(50), -- 'Recliner', 'Gold', 'Silver'
  base_price NUMERIC(10,2) NOT NULL,
  row_range VARCHAR(10)[] -- ['A','B'] for Recliner rows
);

-- shows
CREATE TABLE shows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID REFERENCES movies(id),
  screen_id UUID REFERENCES screens(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  language VARCHAR(50),
  format ENUM('2D', '3D', 'IMAX', '4DX') DEFAULT '2D',
  status ENUM('active', 'cancelled', 'houseful') DEFAULT 'active'
);

-- seats (one row per physical seat, per show — allows per-show status)
CREATE TABLE show_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  show_id UUID REFERENCES shows(id),
  seat_label VARCHAR(10) NOT NULL, -- 'A1', 'B5'
  category_id UUID REFERENCES seat_categories(id),
  price NUMERIC(10,2) NOT NULL, -- computed from category + dynamic pricing
  status ENUM('available', 'locked', 'booked') DEFAULT 'available',
  locked_by UUID REFERENCES users(id),
  locked_until TIMESTAMPTZ, -- NULL unless locked
  booking_id UUID -- FK to bookings, set when booked
);

-- bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  show_id UUID REFERENCES shows(id),
  seats TEXT[], -- ['A1', 'A2']
  total_amount NUMERIC(10,2) NOT NULL,
  convenience_fee NUMERIC(10,2) DEFAULT 0,
  status ENUM('pending', 'confirmed', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
  payment_id UUID,
  qr_code_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

-- payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  razorpay_order_id VARCHAR(255) UNIQUE,
  razorpay_payment_id VARCHAR(255),
  razorpay_signature VARCHAR(255),
  amount NUMERIC(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  status ENUM('created', 'authorized', 'captured', 'failed', 'refunded') DEFAULT 'created',
  method VARCHAR(50), -- 'upi', 'card', 'netbanking'
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  movie_id UUID REFERENCES movies(id),
  rating SMALLINT CHECK (rating BETWEEN 1 AND 10),
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, movie_id) -- one review per user per movie
);

-- watch_history (drives recommendation engine)
CREATE TABLE watch_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  movie_id UUID REFERENCES movies(id),
  booking_id UUID REFERENCES bookings(id),
  watched_at TIMESTAMPTZ DEFAULT NOW(),
  rating_given SMALLINT -- NULL if not rated
);
```

---

## 5. Core Feature Modules

### 🔐 Module 1: Authentication & Authorization
- **User Registration** — Email/phone + password, OTP verification via SMS
- **Google OAuth 2.0** — One-click social login
- **JWT Strategy** — Access token (15 min) + Refresh token (7 days, stored in Redis)
- **Role-Based Access** — `user`, `admin`, `theatre_owner` roles with NestJS guards
- **OTP via SMS** — Fast2SMS integration for phone verification

### 🎬 Module 2: Movies
- **TMDB API Integration** — Fetch movie metadata (cast, synopsis, ratings, trailer) automatically
- **Movie CRUD** — Admin can add/edit/remove movies
- **Certification filtering** — Child-safe filters
- **Search & Filters** — By genre, language, city, format (IMAX/2D/3D)
- **Now Showing / Upcoming** — Separate views

### 🏟️ Module 3: Theatres & Screens
- **Theatre Management** — Admin adds theatres with geo-location
- **Screen Configuration** — Define seat layout via JSON (rows, categories, total seats)
- **Dynamic Pricing** — Price per seat category adjustable per show
- **Amenities tagging** — IMAX, Dolby, Parking, Wheelchair access

### 📅 Module 4: Shows
- **Show Scheduling** — Admin maps movie → screen → time slot
- **Conflict Detection** — Prevent overlapping shows on same screen
- **Multi-format/language** — Tamil dubbed IMAX, Hindi 3D, etc.

### 💺 Module 5: Seat Selection (Real-time)
- **Interactive Seat Map** — Visual grid rendered from `seat_layout` JSONB
- **Color coding** — Available (green), Locked (yellow), Booked (red)
- **Real-time updates** — WebSocket events push seat status to all clients
- **Multi-seat selection** — Select up to 10 seats
- **Seat lock on selection** — Redis TTL lock (10 minutes) when user enters payment

### 💳 Module 6: Booking & Payment
- **Booking Flow**: Select seats → Lock in Redis → Create Razorpay order → Complete payment → Confirm booking → Release Redis lock → Update DB → Send confirmation
- **Razorpay integration** — Create orders via API, verify signature on webhook
- **Booking confirmation** — QR code generated (using `qrcode` npm package)
- **Email confirmation** — HTML email with booking details and QR
- **Ticket download** — PDF ticket (using `pdfkit`)

### ⭐ Module 7: Reviews & Ratings
- **Post-watch review** — Only verified bookers can review a movie
- **Rating system** — 1-10 scale, stored and averaged in movies table
- **Review moderation** — Admin can hide inappropriate reviews

### 🤖 Module 8: Recommendation Engine
- **Triggered nightly** by BullMQ cron job → calls Python service `/train`
- **On user login** → fetch personalized `/recommend?userId=...`
- **Homepage widget** — "Recommended for You" section
- **Similar movies** → `/similar?movieId=...` used on movie detail page

### 👤 Module 9: User Profile
- **Booking history** — All past bookings with status
- **Watch history** — Timeline of watched movies
- **Saved cards** — Via Razorpay tokenization
- **Preferences** — Preferred language, genre, city
- **Notifications** — Toggle email/SMS preferences

### 🛠️ Module 10: Admin Dashboard
- **Analytics** — Revenue charts, occupancy rates, popular movies
- **Movie management** — CRUD with TMDB auto-fill
- **Theatre management** — Add/edit theatres and screens
- **Show scheduling** — Calendar-style show management
- **Dynamic pricing** — Adjust seat prices per show or time-of-day
- **Offer management** — Create discount codes, combo offers

---

## 6. Extra / Unique Features (Beyond BookMyShow)

| Feature | Description |
|---------|-------------|
| 🤖 **AI Recommendations** | Hybrid collaborative + content-based ML model. BookMyShow uses basic rules. |
| 🔒 **Smart Seat Locking** | Visual feedback with countdown timer showing when a locked seat will be released |
| 📊 **Price Surge Indicator** | Show demand-based price increase transparently ("20% surge due to high demand") |
| 🎟️ **Group Booking** | Book for friends who pay their share via UPI split (Razorpay payment links) |
| 🏷️ **Dynamic Pricing Engine** | Auto-increase prices for peak-hour shows; auto-decrease for nearly-empty shows |
| 📱 **QR Wallet** | All tickets in a QR wallet in the app — no paper, no email search |
| 🌟 **CineCoins (Loyalty)** — | Earn points per booking, redeem for discounts |
| 🎂 **Birthday Offers** | Auto-generate discount coupon 7 days before user's birthday |
| 🗺️ **Theatre Map** | Google Maps integration showing nearby theatres |
| 🎭 **Mood-based Discovery** | "I'm feeling thrilling tonight" → curated thriller picks |
| ♿ **Accessibility Seats** | Mark and filter wheelchair-accessible seats |
| 📡 **Live Occupancy** | Real-time seat fill percentage ("83% seats filled — book fast!") |
| 🔔 **Price Drop Alerts** | Notify user when a watched movie's prices drop |

---

## 7. Critical Problem Handling

### 7.1 Race Condition — Concurrent Seat Booking
**Problem**: User A and User B both see seat A5 as available and both click it simultaneously.

**Solution (3-layer defense)**:
```
Layer 1 (Redis): SETNX seat:{showId}:{seatLabel} {userId} EX 600
  → Atomic lock. Only ONE user can get a lock. The other gets an error immediately.

Layer 2 (PostgreSQL): On payment confirmation, use:
  UPDATE show_seats SET status = 'booked', booking_id = $1
  WHERE show_id = $2 AND seat_label = $3 AND status = 'locked' AND locked_by = $4
  → Even if Redis lock fails, DB update is conditional. Two users can never both succeed.

Layer 3 (WebSocket): On seat lock, broadcast to all clients:
  emit('seat:locked', { showId, seatLabel, userId })
  → Other clients' UIs immediately grey out the seat.
```

### 7.2 Payment Abandonment
**Problem**: User locks seats, starts payment, closes browser or network fails.

**Solution**:
```
1. Redis key has TTL = 10 minutes (configurable).
2. A BullMQ "delayed job" is scheduled for 10 minutes when lock is created.
3. Job checks: is payment still in 'created' state?
4. If yes → cancel Razorpay order, release Redis lock, update show_seats to 'available',
   broadcast seat:released via WebSocket.
5. If payment was completed between lock and job execution → job is a no-op.
```

### 7.3 Payment Webhook Failure
**Problem**: Payment succeeds at Razorpay but webhook never reaches our server (server down, network issue).

**Solution**:
```
1. After Razorpay payment on client-side, client hits our /payments/verify endpoint with signature.
2. We verify Razorpay signature cryptographically (HMAC-SHA256).
3. Additionally, BullMQ "payment-reconciliation" job runs every 5 minutes and queries
   Razorpay API for payments in 'authorized' state that haven't been captured/confirmed in our DB.
4. Any discrepancy triggers an alert and auto-reconciliation.
```

### 7.4 Double Payment
**Problem**: User pays twice due to network retry.

**Solution**:
```
1. Razorpay order ID is unique per booking — re-using the same order prevents double charge.
2. Our DB has UNIQUE constraint on razorpay_payment_id.
3. Idempotency check: before processing webhook, check if payment_id already exists in DB.
```

### 7.5 Server Crash During Booking
**Problem**: Server crashes after payment is captured but before booking is confirmed.

**Solution**:
```
1. Payment confirmation logic is wrapped in a BullMQ job, not a direct DB call.
2. Jobs are persisted in Redis. On server restart, jobs resume.
3. The job is idempotent: it checks booking status before updating.
```

### 7.6 Theatre Overbooking
**Problem**: Admin creates more shows than physical seats allow.

**Solution**:
```
1. show_seats table is pre-populated when a show is created — one row per physical seat.
2. Total rows = screen.total_seats. Cannot exceed this.
3. Admin UI shows seat inventory before allowing show creation.
```

### 7.7 DDoS / Abuse
**Problem**: Bot spamming seat lock endpoints.

**Solution**:
```
1. Rate limiting via Redis sliding window (throttle: 30 requests/minute per IP/user).
2. NestJS ThrottlerGuard on all booking endpoints.
3. CAPTCHA on registration.
4. IP blocking via Nginx if abuse detected.
```

---

## 8. Proposed Changes

### Component 1: Backend (NestJS)

#### [MODIFY] [`backend/src/main.ts`](file:///d:/MovieTicketBooking%20System/backend/src/main.ts)
- Add CORS, Helmet, global validation pipe, swagger setup, versioned API prefix

#### [MODIFY] [`backend/package.json`](file:///d:/MovieTicketBooking%20System/backend/package.json)
- Add: `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `passport-google-oauth20`, `@nestjs/websockets`, `socket.io`, `@nestjs/bull`, `bullmq`, `ioredis`, `@prisma/client`, `prisma`, `razorpay`, `nodemailer`, `qrcode`, `pdfkit`, `class-validator`, `class-transformer`, `@nestjs/swagger`, `helmet`, `@nestjs/throttler`, `axios`

#### [NEW] `backend/prisma/schema.prisma`
- Full Prisma ORM schema with all tables (users, movies, theatres, screens, shows, show_seats, bookings, payments, reviews, watch_history)

#### [NEW] `backend/src/modules/` — Module structure:
```
src/
├── modules/
│   ├── auth/           (auth.module, auth.service, auth.controller, jwt.strategy, google.strategy)
│   ├── users/          (users.module, users.service, users.controller)
│   ├── movies/         (movies.module, movies.service, movies.controller)
│   ├── theatres/       (theatres.module, theatres.service, theatres.controller)
│   ├── screens/        (screens.module, screens.service, screens.controller)
│   ├── shows/          (shows.module, shows.service, shows.controller)
│   ├── seats/          (seats.module, seats.service, seats.controller, seat-lock.service)
│   ├── bookings/       (bookings.module, bookings.service, bookings.controller)
│   ├── payments/       (payments.module, payments.service, payments.controller)
│   ├── reviews/        (reviews.module, reviews.service, reviews.controller)
│   ├── recommendations/(recommendations.module, recommendations.service)
│   ├── notifications/  (notifications.module, email.service, sms.service)
│   ├── admin/          (admin.module, admin.service, admin.controller)
│   └── websocket/      (websocket.gateway, websocket.module)
├── common/
│   ├── guards/         (jwt-auth.guard, roles.guard)
│   ├── decorators/     (@Roles, @CurrentUser)
│   ├── filters/        (global-exception.filter)
│   ├── interceptors/   (logging.interceptor, transform.interceptor)
│   └── pipes/          (validation.pipe)
└── config/             (database.config, redis.config, jwt.config)
```

---

### Component 2: Frontend (Next.js)

#### [NEW] `frontend/src/app/` — App Router pages:
```
src/
├── app/
│   ├── (public)/
│   │   ├── page.tsx              (Homepage — hero, trending, recommendations)
│   │   ├── movies/
│   │   │   ├── page.tsx          (Movie listing with filters)
│   │   │   └── [id]/
│   │   │       ├── page.tsx      (Movie detail — cast, reviews, shows)
│   │   │       └── shows/
│   │   │           └── [showId]/
│   │   │               ├── seats/page.tsx   (Interactive seat map)
│   │   │               └── payment/page.tsx (Payment + summary)
│   │   ├── theatres/page.tsx     (Theatre listing with map)
│   │   └── search/page.tsx       (Global search)
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (user)/
│   │   ├── profile/page.tsx
│   │   ├── bookings/page.tsx
│   │   └── wallet/page.tsx       (QR ticket wallet)
│   └── (admin)/
│       ├── dashboard/page.tsx
│       ├── movies/page.tsx
│       ├── theatres/page.tsx
│       ├── shows/page.tsx
│       └── analytics/page.tsx
├── components/
│   ├── ui/                       (shadcn-based components)
│   ├── movie/                    (MovieCard, MovieCarousel, MovieFilter)
│   ├── seat/                     (SeatMap, SeatLegend, SeatTimer)
│   ├── booking/                  (BookingFlow, BookingSummary)
│   ├── payment/                  (RazorpayButton, PaymentStatus)
│   └── layout/                   (Navbar, Footer, Sidebar)
└── lib/
    ├── api/                      (axios client, API hooks)
    ├── store/                    (Zustand stores — auth, booking, seat)
    └── socket/                   (Socket.io client setup)
```

---

### Component 3: Recommendation Service (Python)

#### [NEW] `recommendationService/` — FastAPI Python service:
```
recommendationService/
├── main.py               (FastAPI app, routes)
├── models/
│   ├── collaborative.py  (SVD collaborative filtering)
│   ├── content.py        (TF-IDF content-based)
│   └── hybrid.py         (Weighted ensemble)
├── data/
│   └── preprocess.py     (Data fetching from PostgreSQL)
├── requirements.txt
└── Dockerfile
```

---

### Component 4: Infrastructure

#### [MODIFY] [`docker-compose.yml`](file:///d:/MovieTicketBooking%20System/docker-compose.yml)
```yaml
services:
  postgres:   PostgreSQL 16
  redis:      Redis 7 Alpine
  backend:    NestJS (builds from ./backend)
  frontend:   Next.js (builds from ./frontend)
  recommend:  Python FastAPI (builds from ./recommendationService)
  nginx:      Nginx reverse proxy
```

---

## 9. Phased Execution Plan

### Phase 1 — Foundation (Week 1-2)
- [ ] Docker Compose with PostgreSQL + Redis
- [ ] Prisma schema + migrations
- [ ] NestJS: Auth module (JWT + Google OAuth + OTP)
- [ ] NestJS: User module (profile CRUD)
- [ ] Next.js: Auth pages (login/register)
- [ ] Next.js: Global layout (Navbar, Footer)

### Phase 2 — Core Inventory (Week 3-4)
- [ ] NestJS: Movies module + TMDB API integration
- [ ] NestJS: Theatres + Screens module
- [ ] NestJS: Shows module (scheduling + conflict detection)
- [ ] Next.js: Movie listing + detail pages
- [ ] Next.js: Theatre listing + map
- [ ] Admin: Movie/Theatre/Show CRUD UI

### Phase 3 — Booking Engine (Week 5-6) ⭐ Critical
- [ ] NestJS: show_seats pre-population on show creation
- [ ] NestJS: WebSocket gateway (seat:locked, seat:released, seat:booked)
- [ ] NestJS: Seat lock service (Redis SETNX + TTL + BullMQ expiry job)
- [ ] NestJS: Booking module (create, confirm, cancel)
- [ ] NestJS: Payment module (Razorpay order creation + webhook + verification)
- [ ] Next.js: Interactive seat map (real-time WebSocket updates)
- [ ] Next.js: Payment flow with Razorpay.js
- [ ] QR code + PDF ticket generation

### Phase 4 — Post-booking & Communication (Week 7)
- [ ] Email service (booking confirmation, cancellation)
- [ ] SMS service (OTP, booking confirmation)
- [ ] Review & rating module
- [ ] User booking history + QR wallet
- [ ] Cancellation + refund flow

### Phase 5 — Recommendation Engine (Week 8)
- [ ] Python FastAPI setup + Dockerfile
- [ ] Data pipeline from PostgreSQL
- [ ] SVD collaborative filtering model
- [ ] Content-based TF-IDF model
- [ ] Hybrid ensemble + `/recommend` endpoint
- [ ] NestJS recommendation module (proxy to Python service)
- [ ] Frontend "Recommended for You" section

### Phase 6 — Unique Features (Week 9-10)
- [ ] Dynamic pricing engine
- [ ] CineCoins loyalty system
- [ ] Mood-based discovery
- [ ] Group booking + UPI split
- [ ] Price drop alerts
- [ ] Birthday offers cron
- [ ] Admin analytics dashboard (Chart.js/Recharts)

### Phase 7 — Hardening (Week 11)
- [ ] Rate limiting (ThrottlerGuard + Redis)
- [ ] Payment reconciliation job
- [ ] Global exception filter
- [ ] Logging (Winston + structured logs)
- [ ] Unit tests (Jest) for critical paths
- [ ] E2E tests for booking flow (Playwright)
- [ ] Performance optimization (React Query caching, DB indices)

---

## 10. Verification Plan

### Automated Tests
```bash
# Backend unit + integration tests
cd backend && npm run test

# Backend E2E tests
cd backend && npm run test:e2e

# Frontend component tests
cd frontend && npm run test

# E2E booking flow
npx playwright test
```

### Critical Manual Verification
1. **Race condition test** — Open the same show in two browsers, both click seat A5 simultaneously → only one succeeds
2. **Payment abandonment** — Lock seats, do not pay, wait 10 minutes → seats auto-release
3. **Webhook failure simulation** — Block webhook endpoint, complete payment → reconciliation job fixes it
4. **Admin pricing** — Change seat price from Admin → verify it reflects on user side
5. **Recommendation** — Book 5 action movies → recommendations should shift toward action genre

### Performance Benchmarks
- Seat selection page loads in < 1.5s
- WebSocket seat update propagation < 100ms
- Payment flow completes in < 30s (including Razorpay redirect)
- Recommendation API response < 500ms (cached)

---

> [!IMPORTANT]
> **Approval Required**: Please review and approve this plan before I start coding. Once approved, I'll begin with Phase 1 (Foundation) and work through each phase systematically.

> [!NOTE]
> **Existing Setup**: Your project already has NestJS (backend) and Next.js (frontend) bootstrapped. I'll build on top of the existing structure without breaking what's there. The `recommendationService` directory is empty and will be set up fresh with Python/FastAPI.

> [!TIP]
> **Recommendation**: Use the `/owl` command if you'd like me to go even deeper on any specific architectural decision (e.g., the seat locking algorithm or the recommendation model design) before we start coding.
