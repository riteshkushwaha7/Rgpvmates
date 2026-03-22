# Flirmo

Flirmo is a production-ready Next.js dating and social platform for adults 18+ in India. It uses Supabase for auth, database, storage, and realtime updates, plus Razorpay for memberships.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth / Postgres / Storage / Realtime
- Razorpay

## Required environment variables

Create `.env.local` from `.env.local.example` and fill in:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_RAZORPAY_KEY_ID=

SUPABASE_SERVICE_ROLE_KEY=
MESSAGE_ENCRYPTION_KEY=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create the Supabase schema:

- Apply `supabase/migrations/0001_flirmo.sql`
- Create a public storage bucket named `profile-media`
- Enable Google auth in Supabase

3. Start the app:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
npm run start
```

## Production notes

- Google login is the only authentication method.
- Flirmo is 18+ only.
- Membership pricing is `Rs 49` monthly and `Rs 399` yearly.
- No refunds are provided under any circumstances.
- Messages are stored encrypted at rest before persistence.
- Admin access should be granted by marking `profiles.is_admin = true` for approved operators.
