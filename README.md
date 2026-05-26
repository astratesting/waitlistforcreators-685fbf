# WaitlistForCreators

Production MVP for creator waitlist launches. Built with Next.js App Router, Supabase tables, Clerk auth, and FastAPI support API.

## Features

- Creator-specific landing page with email capture
- Unique referral codes and share links
- Referral milestone progress bar
- Clerk email/password and Google OAuth pages
- Protected founder dashboard at `/dashboard`
- Founder metrics: total signups, referral conversions, conversion rate, growth rate
- Supabase client integration for `users` and `referrals`
- FastAPI backend with auth, waitlist, referrals, analytics routes

## Supabase schema

```sql
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  referral_code text unique not null,
  waitlist_position integer not null,
  created_at timestamptz default now()
);

create table referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid references users(id) on delete cascade,
  referred_email text not null,
  reward_tier text not null,
  created_at timestamptz default now()
);
```

## Setup

```bash
cp .env.example .env
cd frontend
npm install
npm run dev
```

Run backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## Environment variables

Set these in local `.env` and Vercel project settings:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## Deploy to Vercel

1. Create Supabase project and run schema above.
2. Create Clerk app, enable email/password and Google OAuth.
3. Import `frontend` as Vercel project root.
4. Add environment variables from `.env.example`.
5. Deploy.

## API routes

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me/{user_id}`
- `POST /api/waitlist?ref=CODE`
- `GET /api/waitlist`
- `GET /api/referrals`
- `POST /api/referrals`
- `GET /api/referrals/{code}`
- `GET /api/analytics`
