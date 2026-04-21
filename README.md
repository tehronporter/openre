# OpenRE

OpenRE is a seller-first real estate marketplace MVP where property owners list directly, share a public listing link, receive offers, compare them transparently, and choose the best outcome.

## MVP Focus

- Seller activation: address, details, photos, publish, Offer Command Center.
- Public shareable listing links for early offer liquidity.
- Buyer offer submission with normalized price, offer type, financing, and closing days.
- Seller Offer Command Center with side-by-side comparison and simple highlights.
- Lightweight text messaging attached to listings and offers.

Out of scope for now: MLS integrations, agent CRM, service provider marketplace, auction mode, AI insights, payments, escrow, e-sign, map-heavy features, and advanced messaging.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth, Postgres, Storage, Realtime

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a Supabase project and fill in `.env`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. Run the SQL migration in Supabase:

```bash
supabase/migrations/20260421000000_initial_schema.sql
```

The migration creates tables, enums, indexes, RLS policies, a public `listing-images` storage bucket, and a profile trigger for new auth users.

4. Start the app:

```bash
npm run dev
```

## Key Routes

- `/` seller-first homepage
- `/sell` seller activation entry
- `/listings` public marketplace
- `/listings/[slug]` public shareable listing detail
- `/dashboard/listings/new` create listing
- `/dashboard/listings/[id]/offers` Offer Command Center
- `/dashboard/offers` buyer submitted offers
- `/dashboard/messages` lightweight conversations

## Verification

```bash
npm run lint
npm run typecheck
npm run build
```

Manual QA should cover:

- Seller signs up, creates listing, uploads photos, publishes, lands in Offer Command Center.
- Seller copies and shares the public listing link.
- Buyer opens listing, submits an offer, and sees status in dashboard.
- Duplicate active buyer offer is blocked.
- Seller cannot submit an offer on their own listing.
- Seller compares, accepts, and rejects offers with confirmation.
- Buyer and seller can exchange text messages around a listing or offer.
- Draft listings, private offers, and messages are protected by RLS.
