# Vitality — Base Model

A clean, forkable starting point for your own Vitality-style life dashboard. It ships
the front page, the sign-in flow, the animated tile dashboard, the full **workout
logger** and **progress-photos** modules, and the **build-your-own-tile** platform —
wired to Supabase and ready to deploy on Vercel.

Fork it, point it at your own free Supabase project, and build from there.

---

## What's inside

**Working out of the box**
- **Landing page** — the full editorial hero (WebGL crystal, aurora, the lot).
- **Auth** — email + password and Google sign-in, via Supabase.
- **Dashboard** — the animated tile grid over a themeable "world" backdrop.
- **Workout logger** — day tabs, set pills, swap / history / tune, and the gold PR
  celebration. Pick your split in the one-time setup, then log.
- **Progress** — weigh-ins with a 7-day rolling average, plus progress photos with
  before/after compare.
- **Tile platform** — build or paste your own sealed HTML tiles into the grid; they
  run sandboxed and persist per user.

**Placeholders you replace**
- The other five core tiles (Fuel, Vitals, Peak, Brand, Finance) and the Vee tile ship
  as posters — the look is set, the content is yours. Build a tile to take their place.

**Deliberately left out** (add them back if you want): wearables, finance/nutrition
modules, Stripe billing, the hosted MCP server, Sentry, and cron jobs.

---

## Deploy in 5 minutes

### 1. Create a Supabase project
Go to [supabase.com](https://supabase.com) → **New project** (the free tier is plenty).

### 2. Run the migrations
In the Supabase dashboard → **SQL Editor**, run these two files in order (paste and Run):
1. [`supabase/migrations/0001_base_schema.sql`](supabase/migrations/0001_base_schema.sql)
2. [`supabase/migrations/0002_auth_bootstrap.sql`](supabase/migrations/0002_auth_bootstrap.sql)

That creates every table (all row-level-security scoped to the signed-in user) and a
trigger that gives each new signup a profile row automatically.

### 3. (Optional) Turn on Google sign-in
Supabase dashboard → **Authentication → Providers → Google**. Email + password works
without this.

### 4. Deploy to Vercel
Click the button, connect your fork, and paste the four environment variables when asked
(get the Supabase values from **Project Settings → API**):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=REPLACE_WITH_YOUR_GITHUB_REPO_URL&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,NEXT_PUBLIC_APP_URL)

| Variable | Where it comes from |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → `anon` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → `service_role` key (server-only) |
| `NEXT_PUBLIC_APP_URL` | your deployment URL, e.g. `https://your-app.vercel.app` |

> After deploying, add your Vercel URL to Supabase → **Authentication → URL Configuration**
> (Site URL + Redirect URLs → `https://your-app.vercel.app/auth/callback`).

---

## Run it locally

```bash
git clone <your-fork-url>
cd vitality-base
npm install
cp .env.example .env.local   # then fill in the four values
npm run dev                  # → http://localhost:3000
```

Requires **Node 20+** (see `.nvmrc`). Follow the migration + Supabase steps above against
the same project you point local dev at.

---

## Make it yours

- **Colours & type** live in [`app/globals.css`](app/globals.css) (mint `#6EE7B7` on black,
  Instrument Serif). Vanilla CSS — no Tailwind.
- **The tile roster** is [`lib/tiles/coreTiles.tsx`](lib/tiles/coreTiles.tsx). Add, rename,
  or re-point tiles there.
- **Build a tile**: open the **Library** on the dashboard (the ＋ shelf), then build a new
  sealed HTML widget or paste one in. A tile is a single self-contained HTML file that can
  call `Vitality.save()` / `Vitality.load()` to persist its own data.

---

## Tech

Next.js 14 (App Router) · Supabase (auth + Postgres, RLS) · vanilla CSS · deployed on
Vercel. Every database query is scoped to the signed-in user — multi-user from the ground up.
