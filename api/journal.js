// Vercel serverless function — appends a journal entry to a Notion page.
// The Notion secret lives ONLY here (server-side env var), never in the browser.
//
// Required Vercel environment variables:
//   NOTION_TOKEN     — your Notion internal integration secret (starts with "ntn_" or "secret_")
//   NOTION_JOURNAL_PAGE_ID — 37ef9db5-cd3c-8105-89b5-e585e93f3f66

const NOTION_VERSION = "2022-06-28";

export default async function handler(req, res) {
  // CORS (so the deployed front-end can call it; same-origin on Vercel anyway)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.NOTION_TOKEN;
  const pageId = process.env.NOTION_JOURNAL_PAGE_ID;
  if (!token || !pageId) {
    return res.status(500).json({ error: "Server not configured (missing NOTION_TOKEN or NOTION_JOURNAL_PAGE_ID)." });
  }

  // Body may arrive as string on some runtimes
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const text = (body && body.text ? String(body.text) : "").trim();
  const mood = body && body.mood ? String(body.mood) : "";

  if (!text) return res.status(400).json({ error: "Entry text is required." });
  if (text.length > 4000) return res.status(400).json({ error: "Entry too long (max 4000 chars)." });

  // Date heading like "Sat, 14 Jun 2026 · 4:32 PM"
  const now = new Date();
  const stamp = now.toLocaleString("en-SG", {
    weekday: "short", day: "2-digit", month: "short", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
  const heading = mood ? `${stamp}  ·  ${mood}` : stamp;

  // Split entry into paragraphs on blank lines
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  const children = [
    { object: "block", type: "heading_3", heading_3: { rich_text: [{ type: "text", text: { content: heading } }] } },
    ...paragraphs.map((p) => ({
      object: "block",
      type: "paragraph",
      paragraph: { rich_text: [{ type: "text", text: { content: p.slice(0, 2000) } }] },
    })),
    { object: "block", type: "divider", divider: {} },
  ];

  try {
    const r = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ children }),
    });

    if (!r.ok) {
      const detail = await r.text();
      return res.status(502).json({ error: "Notion rejected the write.", detail });
    }
    return res.status(200).json({ ok: true, savedAt: heading });
  } catch (e) {
    return res.status(500).json({ error: "Failed to reach Notion.", detail: String(e) });
  }
}
