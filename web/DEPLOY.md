# InGauge Web — Vercel Deployment Guide

## Prerequisites

1. **Vercel Account** — Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI** (optional) — `npm i -g vercel`
3. **Supabase Project** — With the `shared_reports` table created

---

## Quick Deploy (Vercel Dashboard)

### 1. Connect Repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub/GitLab repository
3. Set **Root Directory** to `web`
4. Framework Preset: **Next.js** (auto-detected)

### 2. Configure Environment Variables

Add these in Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (e.g., `https://xyz.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key from Supabase dashboard (Settings → API) |

⚠️ **Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client!** It's only used server-side.

### 3. Deploy

Click **Deploy**. Vercel handles the rest.

---

## CLI Deployment

```bash
# Navigate to web folder
cd web

# Install dependencies
npm install

# Link to Vercel (first time)
vercel link

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## Local Development

```bash
cd web

# Copy environment template
cp .env.local.example .env.local

# Edit .env.local with your Supabase credentials
nano .env.local

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Domain Setup

### Custom Domain (e.g., `reports.getingauge.com`)

1. Vercel Dashboard → Project → Settings → Domains
2. Add `reports.getingauge.com`
3. Configure DNS:
   - **CNAME**: `reports` → `cname.vercel-dns.com`
   - Or use Vercel's nameservers

### Share Link Format

After deployment, share links will look like:
- `https://reports.getingauge.com/share/abc123`
- Short form: `https://reports.getingauge.com/r/abc123`

---

## Build Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |

---

## Vercel Configuration

The `vercel.json` includes:

- **Security headers** — X-Frame-Options, noindex for reports
- **URL rewrites** — `/r/:code` → `/share/:code` for shorter URLs
- **Region** — `iad1` (US East, closest to many Supabase regions)

---

## Troubleshooting

### Build Fails: Missing Environment Variables

Ensure both env vars are set in Vercel:
```bash
vercel env ls
```

### Reports Not Loading

1. Check Supabase RLS policies allow the service role
2. Verify the `shared_reports` table exists
3. Check Vercel function logs for errors

### Type Errors

Run locally to see detailed errors:
```bash
npm run typecheck
```

---

## Security Notes

1. **Service Role Key** — Only used server-side in Next.js Server Components
2. **Report Links** — Include `noindex` meta tag to prevent search indexing
3. **Access Logging** — All report views are logged with IP and user agent
4. **Expiration** — Links automatically expire based on `expires_at`

---

## Updates

To deploy updates:

```bash
git add .
git commit -m "Update web app"
git push origin main
```

Vercel auto-deploys on push to main branch.
