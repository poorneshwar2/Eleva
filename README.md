# Mindset Hub

A personal motivation hub seeded from your "2026 and Beyond" Notion notes.
Static React + Vite app — no backend, no API keys, free to host.

## Run locally

```bash
cd mindset-hub
npm install
npm run dev
```

Open the URL it prints (usually http://localhost:5173).

## Deploy live (free) — choose ONE

### Vercel (easiest)
1. Push this `mindset-hub` folder to a GitHub repo.
2. Go to vercel.com → **Add New → Project** → import the repo.
3. Vercel auto-detects Vite. Click **Deploy**. You get a live `*.vercel.app` URL.

### Netlify
1. Push to GitHub.
2. netlify.com → **Add new site → Import an existing project** → pick the repo.
3. Build command: `npm run build` · Publish directory: `dist` → **Deploy**.

### No GitHub? Drag-and-drop (Netlify Drop)
1. Run `npm run build` locally — this creates a `dist/` folder.
2. Go to app.netlify.com/drop and drag the `dist` folder in. Instant live URL.

## Notes
- Mobile-responsive (tested down to iPhone 15 Pro width).
- The streak counter resets on refresh (in-memory by design).
- AI text (quotes, mood responses, ignite blasts) is pre-seeded from your real
  Notion content. To make it call Claude live, you'd add a serverless function
  to hold the API key — ask and it can be wired up.
