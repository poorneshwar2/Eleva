# Journal → Notion setup

The journal section saves entries to a Notion page via a Vercel serverless
function (`api/journal.js`). The Notion secret stays server-side — never in the
browser. Follow these one-time steps.

## 1. Create a Notion integration (get the token)

1. Go to **notion.so/my-integrations** → **New integration**.
2. Name it `Eleva Journal`, associate it with your workspace, submit.
3. Copy the **Internal Integration Secret** (starts with `ntn_...`). This is your `NOTION_TOKEN`.

## 2. Share the Journal page with the integration

The integration can only write to pages you explicitly share with it.

1. Open the **Journal** page in Notion (inside "2026 and Beyond").
2. Top-right **•••** → **Connections** → add **Eleva Journal**.

Journal page ID (already created): `37ef9db5-cd3c-8105-89b5-e585e93f3f66`

## 3. Add the env vars in Vercel

1. Vercel → your **eleva** project → **Settings → Environment Variables**.
2. Add two (Production + Preview + Development):
   - `NOTION_TOKEN` = the `ntn_...` secret from step 1
   - `NOTION_JOURNAL_PAGE_ID` = `37ef9db5-cd3c-8105-89b5-e585e93f3f66`
3. **Redeploy** (Deployments → ⋯ → Redeploy) so the function picks up the vars.

## 4. Test

Open your live site, write an entry, click **Save entry**. You should see
"Saved to your Notion journal ✓", and a new dated block appears on the Notion
Journal page.

## Notes
- Locally (`npm run dev`) the `/api` function does NOT run — Vite alone doesn't
  serve serverless functions. To test the API locally, install the Vercel CLI
  (`npm i -g vercel`) and run `vercel dev` instead of `npm run dev`.
- Entries append with a date/time heading and your current mood (if selected).
- Max entry length 4000 chars.
