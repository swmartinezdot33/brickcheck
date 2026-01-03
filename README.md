# BrickCheck - LEGO Collection Value Tracker

A production-ready MVP for tracking LEGO collection market values over time, similar to a stock tracker for LEGO sets.

## Features

- **Collection Management**: Track sealed and used LEGO sets with detailed metadata
- **Barcode Scanning**: Scan LEGO box barcodes to quickly identify and add sets
- **Price Tracking**: Real-time market value tracking with historical price charts
- **Price Alerts**: Get notified when set values cross thresholds or change significantly
- **Dashboard**: View total collection value, trends, and biggest movers

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui, React Query
- **Backend**: Next.js API Routes, Supabase (Postgres, Auth, Storage)
- **Background Jobs**: Vercel Cron
- **Charts**: Recharts
- **Barcode Scanning**: @zxing/library

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- (Optional) Brickset API key
- (Optional) BrickLink API credentials

## Setup

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Supabase**:
   - Create a new Supabase project
   - Run the migrations in `supabase/migrations/` in order:
     - `001_initial_schema.sql`
     - `002_rls_policies.sql`
     - `003_indexes.sql`

3. **Configure environment variables**:
   Create a `.env.local` file:
   ```bash
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # APIs (REQUIRED - no mock data)
   # App aggregates data from ALL configured sources for best results
   # Minimum: 1 catalog API + 1 price API
   # Optimal: Configure ALL APIs for comprehensive data
   BRICKECONOMY_API_KEY=  # Provides both catalog and pricing (recommended)
   BRICKSET_API_KEY=  # Additional catalog source (optional but recommended)
   BRICKLINK_CONSUMER_KEY=  # Additional price source (optional but recommended)
   BRICKLINK_CONSUMER_SECRET=
   BRICKLINK_TOKEN=
   BRICKLINK_TOKEN_SECRET=

   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   # Production: https://www.brickcheck.app
   VERCEL_CRON_SECRET=your_random_secret_for_cron_auth

   # Optional
   SENTRY_DSN=
   ```

4. **Seed the database** (optional, for local development):
   ```bash
   npx tsx scripts/seed.ts
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser.

## Database Schema

The application uses the following main tables:

- `sets`: Canonical LEGO sets catalog
- `set_identifiers`: GTIN/barcode to set mapping
- `user_collection_items`: User's collection items
- `price_snapshots`: Raw price data from APIs
- `alerts`: User price alerts
- `alert_events`: Triggered alert history

See `supabase/migrations/` for the complete schema.

## API Routes

### Public
- `GET /api/searchSets?q={query}` - Search for sets

### Authenticated
- `GET /api/scanLookup?gtin={gtin}` - Lookup set by barcode
- `GET /api/set/[setId]` - Get set details with pricing
- `GET /api/collection` - Get user's collection
- `POST /api/collection` - Add item to collection
- `PATCH /api/collection/[id]` - Update collection item
- `DELETE /api/collection/[id]` - Remove from collection
- `GET /api/collection/stats` - Dashboard statistics
- `GET /api/alerts` - Get user's alerts
- `POST /api/alerts` - Create alert
- `PATCH /api/alerts/[id]` - Update alert
- `DELETE /api/alerts/[id]` - Delete alert

### Cron (secured)
- `POST /api/price/refresh?setId={id}` - Refresh price for a set
- `POST /api/cron/nightly-refresh` - Nightly refresh job (Vercel cron)

## Pricing Engine

The pricing engine calculates estimated values using:

1. **Median Price**: Middle value of all price points
2. **Trimmed Mean**: Average after dropping top/bottom 10%
3. **Confidence Score**: Based on sample size and variance
4. **Final Estimate**: Weighted blend of median (60%) and trimmed mean (40%)

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add all environment variables in Vercel dashboard
4. Configure the cron job in `vercel.json` (already set up for 2 AM daily)

The cron job will automatically refresh prices for all sets in user collections.

## Development Milestones

- ✅ **Milestone A**: Project scaffolding + Auth + Base UI
- ✅ **Milestone B**: Set search + Add to collection
- ✅ **Milestone C**: Barcode scan flow
- ✅ **Milestone D**: Brickset API integration (API key configured, waiting on userHash)
- ✅ **Milestone E**: BrickLink API integration (fully operational with real data)
- ✅ **Milestone F**: Pricing engine + Charts
- ✅ **Milestone G**: Alerts + Cron refresh
- ⏳ **Milestone H**: Mobile packaging (Future phase - web app is PWA-ready)

## Phase Roadmap

### MVP (Current)
- Web app with Brickset + BrickLink integration structure
- Core collection management
- Price tracking and alerts
- Barcode scanning

### v1 Mobile
- Capacitor or Expo wrapper
- Native camera for scanning
- Push notifications for alerts
- Offline mode basics

### v2 Marketplace Integrations
- StockX integration (if API access)
- eBay comps (if official API)
- Multiple source price blending
- Advanced analytics

## License

MIT
