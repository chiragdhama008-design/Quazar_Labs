# 🌌 QUAZAR LABS — IMMERSIVE SPACE-THEMED LEARNING PLATFORM

> **"Your Next Mission Starts Here."**  
> Explore the universe. Unlock knowledge. Build the future.

Quazar Labs is an educational platform and hands-on coding academy combining the structured curriculum rigor of an NPTEL-style portal with a cinematic, futuristic space-exploration interface.

---

## 🚀 Key Features

### 1. Immersive Creative Direction & Sci-Fi Aesthetic
- **4-Stage Cosmic Sequence:** "Entering the Quazar Universe" loader featuring The Void, Quazar Ignition, Warp Drive, and Universe Revealed (polite, non-blocking on revisit, with manual skip).
- **Interactive Multi-Layered Starfield Canvas:** 3D parallax depth responding to cursor movement, procedural dust particles, and hyperspace acceleration lines.
- **Procedural SVG Planetary Worlds:** Distinct visual identities for each technology domain (Planet C++, Binary Nebula, Cyber Orbit, AI Galaxy, Webverse, Quantum Frontier) featuring atmospheric rim glows, swirling gas giant bands, and orbiting moonlets.
- **Web Audio API Ambient Synthesizer:** An optional cosmic ambient drone (off by default) synthesizing chord pads and telemetry clicks with zero external audio asset overhead.
- **Interactive Orbital Learning Journey:** Interactive checkpoints visualizing the spacecraft's progression from bare-metal compilation to autonomous artificial intelligence.

### 2. NPTEL-Style Structured Learning Experience
- **Hierarchical Curriculum:** `Learning Path` → `Workshop` → `Weeks` → `Sessions` → `Resources`.
- **Responsive 16:9 Video Player:** Embedded YouTube playback supporting standard `watch`, `youtu.be`, `embed`, and `shorts` URLs with `youtube-nocookie` framing.
- **Rich Lesson Notes:** Sanitized Markdown rendering supporting tables, code syntax styling, and lists.
- **Resource Downloads:** External links, GitHub repositories, PDF cheat sheets, and lecture slides.
- **Session Navigation:** Previous and Next session navigation buttons with titles and breadcrumb routing.
- **Collapsible Curriculum:** Sticky desktop sidebar and mobile bottom drawer for curriculum access across viewports (tested on 360px, 390px, 768px, 1024px, 1440px).

### 3. Mission Control CMS Portal (`/dharma`)
- **Unadvertised Admin Route:** Dedicated content management interface located at `/dharma` (hidden from public navigation and sitemap).
- **Hardened Authentication:** Server-side sessions backed by HTTP-only, secure, `SameSite=lax` cookies with database invalidation upon logout.
- **Brute-Force Rate Limiting:** Login attempts are strictly rate-limited (max 10 attempts per 15 minutes per IP).
- **Constant-Time Comparison:** Timing attack mitigation via `crypto.timingSafeEqual`.
- **Live Metrics Dashboard:** Real counts of published paths, workshops, weeks, sessions, resources, and drafts awaiting publication.
- **Full Content CRUD:**
  - Create, edit, reorder, feature, and safely delete learning paths.
  - Create, edit, reorder, draft/publish, duplicate, and delete workshops.
  - Add and reorder weekly milestones.
  - Publish recorded YouTube sessions with automatic video ID extraction and live video preview.
  - Manage session resources and configure global public site settings.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Lucide Icons |
| **Backend** | Node.js, Express 5, TypeScript, Zod Schema Validation, Helmet, CORS |
| **Database** | PostgreSQL (Render Managed PostgreSQL in production; WebAssembly PGlite for zero-config local development) |
| **ORM** | Prisma ORM 6.19 (with driver adapters & connection pooling) |
| **Testing** | Vitest, Supertest (15/15 unit and integration test coverage) |
| **Deployment** | Render Web Service + Render PostgreSQL (`render.yaml` Blueprint) |

---

## 📁 Repository Structure

```
Quazar_Labs/
├── client/
│   ├── public/                 # Static assets and favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         # Navbar, Footer
│   │   │   └── space/          # StarfieldCanvas, PlanetVisual, CosmicLoader, SoundManager
│   │   ├── pages/
│   │   │   ├── HomePage.tsx            # Cinematic hero, exploration zones, journey, about
│   │   │   ├── ExplorePage.tsx         # Search, path pills, difficulty filters, sort
│   │   │   ├── PathDetailPage.tsx      # Planet hero, objectives, workshop roster
│   │   │   ├── WorkshopDetailPage.tsx  # NPTEL week-by-week curriculum, video, notes
│   │   │   └── AdminPage.tsx           # /dharma mission control CMS
│   │   ├── services/           # REST API client
│   │   ├── types/              # TypeScript definitions
│   │   ├── utils/              # YouTube extractors and formatters
│   │   ├── App.tsx             # Root router & layout
│   │   ├── index.css           # Design tokens, glass HUD styles, scrollbars
│   │   └── main.tsx            # React DOM mounting
│   ├── index.html              # SEO meta tags, Google Fonts
│   └── vite.config.ts          # Vite build config with API proxy
├── server/
│   └── src/
│       ├── middleware/         # Auth verification, cookies
│       ├── routes/             # Public, Auth, and Admin routes
│       ├── utils/              # Zod validation schemas, YouTube URL parser
│       ├── app.ts              # Express application configuration & SPA fallback
│       ├── db.ts               # Database connection manager (PGlite + PostgreSQL)
│       └── index.ts            # Entrypoint listening on 0.0.0.0
├── prisma/
│   ├── schema.prisma           # Database schema & indexes
│   └── seed.ts                 # Database seed script with sample workshops & videos
├── tests/
│   └── server.test.ts          # Vitest & Supertest integration suite
├── render.yaml                 # Render Blueprint configuration
├── tsconfig.server.json        # TypeScript configuration for backend
├── tsconfig.client.json        # TypeScript configuration for frontend
├── package.json
└── README.md
```

---

## 💻 Local Development Workflow

### Prerequisites
- Node.js >= 18.x (tested on Node v24.20.0)
- npm >= 9.x

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/chiragdhama008-design/Quazar_Labs.git
cd Quazar_Labs
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Default local `.env`:
```env
PORT=5000
NODE_ENV=development
ADMIN_USERNAME=quazar_commander
ADMIN_PASSWORD=MissionControl2026!DeepSpace
SESSION_SECRET=c38e9182a47291bb2094921f008432ef1729048a609d571829e0839a7384
DATABASE_URL=
CLIENT_URL=http://localhost:5173
```
*(Note: Leaving `DATABASE_URL` unset locally activates the embedded persistent WebAssembly PostgreSQL engine in `./data/postgres`, allowing zero-friction startup without installing a local PostgreSQL service).*

### 3. Seed Database
Populate high-quality sample learning paths, workshops, and YouTube sessions:
```bash
npm run db:seed
```

### 4. Run Development Servers
Launch concurrent Vite client (port 5173) and Express server (port 5000):
```bash
npm run dev
```

Visit:
- **Public Learning Platform:** `http://localhost:5173`
- **Mission Control Admin Portal:** `http://localhost:5173/dharma`
- **Backend API Gateway:** `http://localhost:5000/api/public/health`

---

## 🧪 Running Automated Tests

Run the test suite verifying authentication, rate limiting, draft/published filtering, YouTube normalizers, and production SPA routing:
```bash
npm test
```

Test Results Summary:
```
 ✓ tests/server.test.ts (15 tests)
   ✓ GET /api/public/health returns status healthy
   ✓ GET /api/public/site-settings returns valid configuration
   ✓ GET /api/public/learning-paths returns published paths only
   ✓ GET /api/public/workshops returns published workshops with filters
   ✓ GET /api/unknown-route returns JSON 404, not HTML
   ✓ serves SPA index.html for root and nested frontend routes
   ✓ extracts YouTube video IDs across watch, youtu.be, embed, and shorts formats
   ✓ rejects unauthenticated requests to /api/admin/dashboard with 401
   ✓ rejects incorrect credentials
   ✓ permits login with correct environment credentials and sets secure cookie
   ✓ invalidates session upon logout
```

---

## 🚀 Render Deployment Guide

The application is architected for deployment on **Render** as a single Node.js Web Service + Render PostgreSQL database.

### Option A: Automatic Blueprint Deployment (Recommended)
1. Push the code to your GitHub repository.
2. In the [Render Dashboard](https://dashboard.render.com), click **New +** → **Blueprint**.
3. Select this repository. Render will automatically parse `render.yaml`:
   - Provisions a **Managed PostgreSQL database** (`quazar-db`).
   - Provisions a **Node.js Web Service** (`quazar-labs`).
   - Automatically connects `DATABASE_URL`.
   - Generates a secure random `SESSION_SECRET`.
4. In the Render Dashboard, set your administrative credentials under **Environment Variables**:
   - `ADMIN_USERNAME`: your secret administrator username
   - `ADMIN_PASSWORD`: your secure administrator password
5. Click **Apply Blueprint**.

### Option B: Manual Web Service Setup
1. Create a **PostgreSQL Database** on Render named `quazar-db`. Copy its internal `DATABASE_URL`.
2. Create a **Web Service** on Render:
   - **Environment:** `Node`
   - **Build Command:** `npm install --legacy-peer-deps && npm run build`
   - **Pre-Deploy Command:** `npx tsx prisma/seed.ts`
   - **Start Command:** `npm start`
3. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `DATABASE_URL`: `postgresql://...` (your Render PostgreSQL connection string)
   - `ADMIN_USERNAME`: `quazar_commander`
   - `ADMIN_PASSWORD`: `<strong_password>`
   - `SESSION_SECRET`: `<64_character_random_hex>`
4. Deploy the service.

The Express server handles both API requests under `/api/*` and serves the production React build from `dist/client/`, ensuring deep links such as `/workshops/deep-space-cpp` and `/dharma` refresh seamlessly without 404 errors.

---

## 🔒 Security Summary
- **No Client Credentials:** Administrator credentials and database URLs are strictly contained on the server.
- **Server-Managed Cookie Sessions:** Secure, HTTP-only, `SameSite=lax` session cookies stored with cryptographic tokens in PostgreSQL.
- **Timing Safe Comparisons:** Password verification uses `crypto.timingSafeEqual` to thwart timing attacks.
- **No Data Leaks:** Unpublished draft content and parent-unpublished children are strictly filtered out of public API queries.
- **Content Sanitization:** Markdown notes rendered in the curriculum view are sanitized with DOMPurify against XSS.

---

## 🛰️ License
Crafted with pride by the **Quazar Labs** Engineering & Creative Team. All rights reserved.
