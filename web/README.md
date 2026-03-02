# InGauge Share (Next.js)

Public share route for therapist/provider reports. Deploy this (e.g. at getingauge.com) so “Share with Provider” links open here.

## Setup

1. Copy `.env.local.example` to `.env.local`.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (service role bypasses RLS so the share page can read the report and the user’s mood/conversation/journal data).
3. Run the `shared_reports` SQL migration in Supabase if you haven’t already.

## Run

- `npm install`
- `npm run dev` — dev server (e.g. http://localhost:3000)
- Share URL format: `https://your-domain.com/share/[shortCode]` or `...?t=[token]` for optional token verification.

## App config

In the Expo app, set `EXPO_PUBLIC_APP_URL` to this site’s URL (e.g. `https://getingauge.com`) so “Copy link” uses the correct share domain.
