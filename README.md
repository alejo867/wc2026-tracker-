# ⚽ World Cup 2026 · Seattle Tracker

A mobile-first PWA for tracking all 104 FIFA World Cup 2026 matches — predictions, watch party planning, Google OAuth, and cross-device sync via Supabase.

**Stack:** Vanilla HTML/JS · Supabase (Postgres + Auth) · Vercel · GitHub

---

## Setup guide (20 minutes)

### Step 1 — GitHub repo

1. Go to [github.com/new](https://github.com/new)
2. Name it `wc2026-tracker` (or anything you like), set to **Public** or **Private**
3. Click **Create repository**
4. In your terminal:
```bash
cd path/to/this/folder
git init
git add .
git commit -m "Initial commit — WC2026 tracker"
git remote add origin https://github.com/YOUR_USERNAME/wc2026-tracker.git
git push -u origin main
```

---

### Step 2 — Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Name: `wc2026-tracker`, choose a region (US West for Seattle)
3. Wait for it to provision (~60 seconds)
4. Go to **SQL Editor** → **New query**
5. Paste the entire contents of `supabase-schema.sql` and click **Run**
6. You should see: `profiles`, `predictions`, `events`, `favorites`, `shared_snapshots` tables created

**Get your API keys:**
- Go to **Settings → API**
- Copy **Project URL** → this is your `SUPABASE_URL`
- Copy **anon public** key → this is your `SUPABASE_ANON_KEY`

**Enable Google OAuth:**
1. Go to **Authentication → Providers → Google**
2. Toggle **Enable**
3. You need a Google OAuth client — go to [console.cloud.google.com](https://console.cloud.google.com)
4. Create a project → **APIs & Services → Credentials → Create OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs: add `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
7. Copy the **Client ID** and **Client Secret** back into Supabase → Google provider settings
8. Save

---

### Step 3 — Vercel deployment

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your `wc2026-tracker` GitHub repo
3. Framework: **Other** (no framework)
4. **Before deploying**, go to **Environment Variables** and add:

| Name | Value |
|------|-------|
| `SUPABASE_URL` | `https://yourref.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJ...your anon key...` |

5. Click **Deploy**

**Add your Vercel URL to Supabase:**
- After deploy, copy your URL (e.g. `https://wc2026-tracker.vercel.app`)
- In Supabase → **Authentication → URL Configuration**:
  - Site URL: `https://wc2026-tracker.vercel.app`
  - Redirect URLs: add `https://wc2026-tracker.vercel.app/**`

**Add to Google OAuth allowed origins:**
- In Google Cloud Console → your OAuth client
- Add `https://wc2026-tracker.vercel.app` to **Authorized JavaScript origins**
- Add `https://wc2026-tracker.vercel.app/**` to **Authorized redirect URIs** (in addition to the Supabase callback)

---

### Step 4 — Go live

Push any future change and Vercel auto-deploys:
```bash
git add .
git commit -m "Update predictions"
git push
```

---

## Local development

```bash
# Serve locally (no build step needed)
npx serve .

# Or with Python
python3 -m http.server 3000
```

Create `.env.local` (not committed) and update `config.js` manually for local testing:
```js
window.__WC_CONFIG__ = {
  supabaseUrl: 'https://yourref.supabase.co',
  supabaseKey: 'your-anon-key',
};
```

---

## File structure

```
wc2026-tracker/
├── index.html          # Full app (HTML + CSS + JS)
├── db.js               # Supabase client + all data operations
├── config.js           # Env vars injected at build time
├── build.js            # Vercel build script (writes config.js)
├── sw.js               # Service worker (PWA offline)
├── manifest.json       # PWA manifest
├── icon.svg            # App icon
├── vercel.json         # Vercel routing + build config
├── supabase-schema.sql # Run once in Supabase SQL editor
├── .env.example        # Env var template
└── .gitignore
```

---

## Features

- **Schedule** — all 104 matches, Pacific Time, searchable + filterable
- **Calendar** — month view with color-coded match pips; click day for details; Google Calendar export
- **Predictions** — score + winner per match; animated completion ring; per-stage progress bars
- **My plan** — Watch Party / At Home / Skip planner with donut chart; share links for friends
- **Google OAuth** — sign in to sync all data across every device and browser
- **Offline / localStorage** — works without internet; syncs when back online
- **Dark mode** — automatic via `prefers-color-scheme`
- **PWA** — installable to home screen on iOS/Android
- **Seattle themed** — Verdana green, ocean teal, and coffee brown from the official WC2026 Seattle host city palette

---

## Seattle host city colors

| Name | Hex | Use |
|------|-----|-----|
| Verdana green | `#2D6A4F` | Primary, header, progress |
| Ocean teal | `#1B6CA8` | Secondary, calendar R32 |
| Coffee brown | `#7B4F2E` | Accent, QF stage |
| Gold | `#C9981A` | Stars, R16 stage |
