import { useState, useEffect } from "react";

// ============================================================
// MINDSET HUB — Personal Motivation Hub  (Editorial / light theme)
// Visual language inspired by Creative Leaders Circle + Cereen:
//   off-white canvas, sage accent, oversized headlines, pill chips
//   with superscript counts, card-on-card layout, circular arrow
//   icon-buttons, inline highlighted words.
//
// Content seeded STRICTLY from the "2026 and Beyond" Notion folder:
//   Revision Motivation · Me, Myself I · The Process ·
//   Moving On · The Beginning · Summer
//
// Artifacts run sandboxed (no API keys / MCP), so live Anthropic +
// Notion calls can't fire at runtime. Every line below is real
// content from those 6 pages. To go live outside the sandbox,
// swap pickFrom(...) for a fetch() to claude-sonnet-4-6.
// ============================================================

// Editorial palette (sage + warm neutrals, like the references)
const SAGE = "#7FB686";
const SAGE_SOFT = "#E6F0E5";
const BLUE_SOFT = "#D9E6F5";
const CREAM = "#F2E9DC";
const INK = "#16181C";
const CANVAS = "#E9E9E6";
const CARD = "#FCFCFB";

const SOURCES = [
  "Revision Motivation", "Me, Myself I", "The Process",
  "Moving On", "The Beginning", "Summer",
];

// --- QUOTES: real lines from the 6 pages, tagged with source ---
const QUOTES = [
  { t: "Every action you take is a vote for the person you want to become.", s: "The Beginning" },
  { t: "Motivation follows action, and builds momentum.", s: "The Beginning" },
  { t: "My feelings don't dictate my actions. Consistency wins.", s: "The Beginning" },
  { t: "I'm the CEO of my life. I lead it.", s: "The Beginning" },
  { t: "When life knocks you down, you choose whether to get back up. I'll get back up and fight.", s: "The Beginning" },
  { t: "Don't focus on the marks — focus on the effort, and the process.", s: "The Process" },
  { t: "Mistakes are data to learn from, not defeat.", s: "The Process" },
  { t: "Consistency over intensity.", s: "The Process" },
  { t: "Success takes time, but once you hit it, it's exponential.", s: "The Process" },
  { t: "Treat a difficult problem like a bug in code — you don't get sad at a bug, you debug it.", s: "The Process" },
  { t: "Understanding first, practicing second, active recall last.", s: "Revision Motivation" },
  { t: "Train like I've never won, compete like I've never lost.", s: "Revision Motivation" },
  { t: "Progress over perfection.", s: "Revision Motivation" },
  { t: "You become the average of the room you're in.", s: "Summer" },
  { t: "You never get a second chance at a first impression.", s: "Summer" },
  { t: "Long-term vision, short-term focus — what can I do today?", s: "Summer" },
  { t: "Anger is energy. Use that spark to initiate, not to simmer inward.", s: "Me, Myself I" },
  { t: "Invest time in making myself better, and in what benefits me most.", s: "Moving On" },
  { t: "Shift from comparing yourself to others toward learning from them.", s: "Moving On" },
];

// Pick the single highlighted word per quote (the cream-marker effect)
const HIGHLIGHT = {
  "Every action you take is a vote for the person you want to become.": "vote",
  "Motivation follows action, and builds momentum.": "action",
  "My feelings don't dictate my actions. Consistency wins.": "Consistency",
  "I'm the CEO of my life. I lead it.": "CEO",
  "When life knocks you down, you choose whether to get back up. I'll get back up and fight.": "fight",
  "Don't focus on the marks — focus on the effort, and the process.": "process",
  "Mistakes are data to learn from, not defeat.": "data",
  "Consistency over intensity.": "Consistency",
  "Success takes time, but once you hit it, it's exponential.": "exponential",
  "Treat a difficult problem like a bug in code — you don't get sad at a bug, you debug it.": "debug",
  "Understanding first, practicing second, active recall last.": "Understanding",
  "Train like I've never won, compete like I've never lost.": "compete",
  "Progress over perfection.": "Progress",
  "You become the average of the room you're in.": "average",
  "You never get a second chance at a first impression.": "impression",
  "Long-term vision, short-term focus — what can I do today?": "today",
  "Anger is energy. Use that spark to initiate, not to simmer inward.": "initiate",
  "Invest time in making myself better, and in what benefits me most.": "better",
  "Shift from comparing yourself to others toward learning from them.": "learning",
};

const REMINDERS = [
  { n: "01", title: "The Process", body: "Don't focus on the marks — focus on the effort. Consistency over intensity.", tint: SAGE_SOFT },
  { n: "02", title: "Revision Motivation", body: "Understand → practice → active recall. Cheatsheet weekly, 80/20 always.", tint: BLUE_SOFT },
  { n: "03", title: "Me, Myself I", body: "Anger comes from comparison. Redirect it into one small act of connection.", tint: CREAM },
  { n: "04", title: "Moving On", body: "Anchor every action to a goal. Curiosity over judgment — learn from others.", tint: SAGE_SOFT },
  { n: "05", title: "Summer", body: "Get closer to smarter people. Small bold actions outside your comfort zone.", tint: BLUE_SOFT },
  { n: "06", title: "The Beginning", body: "You're the CEO of your life. Win today. Every action is a vote.", tint: CREAM },
];

const MOOD_RESPONSES = {
  "Fired Up": [
    "This is flow — win today, focus today, small wins build up. Say yes to ONE priority and no to everything else. Train like you've never won. Go.",
    "Good energy — now point it. Ask the question from The Process: am I doing the thing that gets me closer to my goals? Take that action and nothing else.",
  ],
  Focused: [
    "Locked in. Empty your mind and focus — you understand everything best with a clear mind. Phone on flight mode, protect this session. Great things take time.",
    "Scientist mode. Don't watch the clock — watch how much you explored. Single-task the priority; when distracted, redirect calmly. Consistency wins.",
  ],
  Neutral: [
    "Neutral is fine — motivation follows action, not the reverse. Do the smallest first rep: solve one question, learn one concept. Momentum builds from there.",
    "Flat is normal; your feelings don't dictate your actions. Pick your 3 words for today — focused, patient, bold — and let one small win start the chain.",
  ],
  Struggling: [
    "You've debugged harder than this. Treat the difficult thing like a bug — find the logic gap, don't get sad at it. Take a 10-min power nap or a walk, then change ONE variable. Mistakes are data.",
    "Struggling is where learning starts — embrace the struggle. Be kind to yourself, don't beat yourself up for every mistake. Break it into baby steps and do the next one.",
  ],
  "In Crisis": [
    "Breathe first: in 4 seconds through the nose, out through the mouth — 'I'm safe.' When life knocks you down, you choose whether to get back up. Don't fix everything — just don't quit today. You came this far.",
    "Slow down. A calm brain beats a stressed brain seeking escape. You're the CEO of your life and you showed up here — that counts. Lower the bar to the next single action. It may feel like the end, but that's where you start learning.",
  ],
};

const IGNITE_BLASTS = [
  "STOP negotiating with yourself. Motivation follows action — so MOVE. Win today. One rep, right now. Every action is a vote for who you're becoming.",
  "Treat this like a bug, not a tragedy. Find the logic gap, hit it, move on. Mistakes are DATA, not defeat. You're the CEO of your life — decide and execute. TODAY.",
  "Train like you've never won. Compete like you've never lost. Uncomfortable things make you grow, so run toward the hard thing. Consistency over intensity.",
  "Empty your mind. Flight mode on. Yes to ONE thing, no to everything else. Great things take time, but once you hit success it's exponential. IGNITE.",
];

const MOODS = [
  { label: "Fired Up", emoji: "🔥", c: "#E98A4B" },
  { label: "Focused", emoji: "🎯", c: SAGE },
  { label: "Neutral", emoji: "😐", c: "#9AA0A6" },
  { label: "Struggling", emoji: "😮‍💨", c: "#7FA7D9" },
  { label: "In Crisis", emoji: "🆘", c: "#D98B8B" },
];

function Arrow({ size = 16, color = INK }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7M9 7h8v8" />
    </svg>
  );
}

function pickFrom(arr, exclude) {
  if (arr.length === 1) return arr[0];
  let v;
  do { v = arr[Math.floor(Math.random() * arr.length)]; } while (v === exclude);
  return v;
}

// Render a quote with its highlighted word wrapped in the cream marker
function HighlightedQuote({ q }) {
  const word = HIGHLIGHT[q.t];
  if (!word) return <>{q.t}</>;
  const idx = q.t.indexOf(word);
  if (idx < 0) return <>{q.t}</>;
  return (
    <>
      {q.t.slice(0, idx)}
      <span style={S.mark}>{word}</span>
      {q.t.slice(idx + word.length)}
    </>
  );
}

export default function MindsetHub() {
  const [quote, setQuote] = useState(QUOTES[0]);
  const [mood, setMood] = useState(null);
  const [moodMsg, setMoodMsg] = useState("");
  const [moodLoading, setMoodLoading] = useState(false);
  const [blast, setBlast] = useState("");
  const [pulsing, setPulsing] = useState(false);
  const [igniteLoading, setIgniteLoading] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showedUp, setShowedUp] = useState(false);
  const [doneReminders, setDoneReminders] = useState({});

  const [todayReminders] = useState(() =>
    [...REMINDERS].sort(() => Math.random() - 0.5).slice(0, 3)
  );

  const refreshQuote = () => setQuote((q) => pickFrom(QUOTES, q));

  const selectMood = (m) => {
    setMood(m.label);
    setMoodLoading(true);
    setMoodMsg("");
    setTimeout(() => { setMoodMsg(pickFrom(MOOD_RESPONSES[m.label])); setMoodLoading(false); }, 600);
  };

  const ignite = () => {
    setPulsing(true); setIgniteLoading(true); setBlast("");
    setTimeout(() => { setBlast(pickFrom(IGNITE_BLASTS, blast)); setIgniteLoading(false); }, 550);
    setTimeout(() => setPulsing(false), 850);
  };

  const showUp = () => { if (!showedUp) { setStreak((s) => s + 1); setShowedUp(true); } };

  return (
    <div style={S.root}>
      <style>{CSS}</style>

      {/* NAV BAR — pill chips with superscript counts */}
      <div style={S.nav}>
        <div style={S.brand}><span style={S.brandMark}>✸</span> Mindset <span style={S.brandSub}>hub</span></div>
        <div style={S.navChips}>
          <span style={S.chip}>Quotes <sup style={S.sup}>{QUOTES.length}</sup></span>
          <span style={S.chip}>Reminders <sup style={S.sup}>{REMINDERS.length}</sup></span>
          <span style={S.chip}>Sources <sup style={S.sup}>{SOURCES.length}</sup></span>
        </div>
      </div>

      {/* HERO — oversized editorial headline + spark card */}
      <div className="mh-hero" style={S.hero}>
        <div style={S.heroLeft}>
          <div style={S.tagTiny}>01 / today's spark</div>
          <h1 style={S.headline}>
            <HighlightedQuote q={quote} />
          </h1>
          <div style={S.heroFootRow}>
            <span style={S.sourceChip}>from <b>{quote.s}</b></span>
            <button style={S.circleBtn} onClick={refreshQuote} title="New spark">
              <Arrow color="#fff" />
            </button>
            <span style={S.refreshLabel}>refresh</span>
          </div>
        </div>
        <div style={S.heroCard}>
          <div style={S.heroCardTop}>
            <span style={S.miniChip}>showing up</span>
            <span style={{ ...S.miniChip, background: SAGE, color: "#fff" }}>day {streak}</span>
          </div>
          <div style={S.heroCardBig}>{streak}</div>
          <div style={S.heroCardLabel}>days of showing up</div>
          <button onClick={showUp} disabled={showedUp}
            style={{ ...S.pillBtn, background: showedUp ? "#E2E2DE" : INK, color: showedUp ? "#8a8a86" : "#fff" }}>
            {showedUp ? "logged today ✓" : "I showed up today"} {!showedUp && <Arrow size={14} color="#fff" />}
          </button>
        </div>
      </div>

      {/* GRID — Mood (left) + Reminders (right) */}
      <div className="mh-grid" style={S.grid}>
        {/* MOOD */}
        <div style={S.panel}>
          <div style={S.panelHead}>
            <h2 style={S.panelTitle}>How are you<br />showing up?</h2>
            <span style={S.tagTiny}>02 / mood</span>
          </div>
          <div style={S.moodRow}>
            {MOODS.map((m) => (
              <button key={m.label} onClick={() => selectMood(m)}
                style={{ ...S.moodChip,
                  background: mood === m.label ? m.c : "#fff",
                  color: mood === m.label ? "#fff" : INK,
                  borderColor: mood === m.label ? m.c : "#E0E0DB" }}>
                <span style={{ fontSize: 16 }}>{m.emoji}</span> {m.label}
              </button>
            ))}
          </div>
          {(moodLoading || moodMsg) && (
            <div style={{ ...S.moodMsg, animation: "fade .45s ease" }}>
              {moodLoading ? <span style={S.muted}>reading your notes…</span> : moodMsg}
            </div>
          )}
        </div>

        {/* REMINDERS */}
        <div style={S.panel}>
          <div style={S.panelHead}>
            <h2 style={S.panelTitle}>Daily<br />reminders</h2>
            <span style={S.tagTiny}>03 / values</span>
          </div>
          <div style={S.remCol}>
            {todayReminders.map((r) => {
              const done = doneReminders[r.title];
              return (
                <div key={r.title} style={{ ...S.remCard, background: done ? "#F0F0EC" : r.tint, opacity: done ? 0.55 : 1 }}>
                  <div style={S.remNum}>{r.n}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ ...S.remTitle, textDecoration: done ? "line-through" : "none" }}>{r.title}</div>
                    <div style={S.remBody}>{r.body}</div>
                  </div>
                  <label style={S.remCheck}>
                    <input type="checkbox" checked={!!done}
                      onChange={() => setDoneReminders((d) => ({ ...d, [r.title]: !d[r.title] }))}
                      style={{ accentColor: INK, width: 17, height: 17, cursor: "pointer" }} />
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* IGNITE — emergency boost banner */}
      <div className="mh-ignite" style={S.igniteBand}>
        <div style={S.igniteText}>
          <span style={S.tagTiny}>04 / emergency boost</span>
          <div style={S.igniteHeadline}>Need a jolt? Hit the button.</div>
        </div>
        <button onClick={ignite}
          style={{ ...S.igniteBtn, animation: pulsing ? "pulse .85s ease" : "none" }}>
          IGNITE ME 🔥
        </button>
      </div>
      {(igniteLoading || blast) && (
        <div style={{ ...S.blastBanner, animation: "fade .45s ease" }}>
          {igniteLoading ? <span style={S.muted}>charging up…</span> : blast}
        </div>
      )}

      <div style={S.footer}>
        Seeded strictly from your "2026 and Beyond" folder:&nbsp;
        {SOURCES.map((s, i) => <span key={s} style={S.footChip}>{s}</span>)}
      </div>
    </div>
  );
}

const CSS = `
@keyframes pulse { 0% { transform: scale(1);} 30% { transform: scale(1.06); box-shadow: 0 0 0 8px ${SAGE}33;} 100% { transform: scale(1);} }
@keyframes fade { from { opacity: 0; transform: translateY(8px);} to { opacity: 1; transform: translateY(0);} }
* { box-sizing: border-box; }
sup { font-size: 9px; }

/* ---- Responsive: phones (iPhone 15 Pro ~393px & up) ---- */
@media (max-width: 760px) {
  .mh-hero, .mh-grid { grid-template-columns: 1fr !important; }
  .mh-ignite { flex-direction: column !important; align-items: stretch !important; text-align: left; }
  .mh-ignite button { width: 100%; }
}
@media (max-width: 460px) {
  .mh-hero > div, .mh-grid > div { padding: 22px 18px !important; }
  .mh-hero h1 { font-size: 30px !important; letter-spacing: -0.8px !important; }
}
`;

const S = {
  root: { background: CANVAS, minHeight: "100vh", color: INK, fontFamily: "'Inter', system-ui, sans-serif", padding: "20px 18px 36px", maxWidth: 1120, margin: "0 auto" },

  nav: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 },
  brand: { fontWeight: 800, fontSize: 20, letterSpacing: -0.5, display: "flex", alignItems: "center", gap: 6 },
  brandMark: { color: SAGE, fontSize: 18 },
  brandSub: { fontSize: 11, color: "#9a9a95", fontWeight: 600, marginLeft: 2 },
  navChips: { display: "flex", gap: 8, flexWrap: "wrap" },
  chip: { background: CARD, border: "1px solid #E0E0DB", borderRadius: 999, padding: "7px 14px", fontSize: 13, fontWeight: 600 },
  sup: { color: SAGE, fontWeight: 800, marginLeft: 1 },

  hero: { display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 16, marginBottom: 16 },
  heroLeft: { background: CARD, borderRadius: 22, padding: "30px 30px 24px" },
  tagTiny: { fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#a6a6a0", fontWeight: 700 },
  headline: { fontSize: "clamp(28px, 4.2vw, 46px)", lineHeight: 1.08, fontWeight: 800, letterSpacing: -1.2, margin: "14px 0 22px" },
  mark: { background: CREAM, padding: "0 6px", borderRadius: 4, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" },
  heroFootRow: { display: "flex", alignItems: "center", gap: 12 },
  sourceChip: { background: SAGE_SOFT, borderRadius: 999, padding: "7px 14px", fontSize: 13, fontWeight: 500 },
  circleBtn: { width: 44, height: 44, borderRadius: "50%", background: INK, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  refreshLabel: { fontSize: 12, color: "#9a9a95", fontWeight: 600 },

  heroCard: { background: SAGE, color: "#fff", borderRadius: 22, padding: 24, display: "flex", flexDirection: "column" },
  heroCardTop: { display: "flex", gap: 8, marginBottom: "auto" },
  miniChip: { background: "rgba(255,255,255,.25)", borderRadius: 999, padding: "5px 11px", fontSize: 12, fontWeight: 600 },
  heroCardBig: { fontSize: 72, fontWeight: 800, lineHeight: 1, marginTop: 18 },
  heroCardLabel: { fontSize: 14, opacity: 0.9, marginBottom: 18 },
  pillBtn: { border: "none", borderRadius: 999, padding: "12px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },

  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 },
  panel: { background: CARD, borderRadius: 22, padding: "26px 26px 28px" },
  panelHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  panelTitle: { fontSize: 26, fontWeight: 800, letterSpacing: -0.8, lineHeight: 1.05, margin: 0 },

  moodRow: { display: "flex", flexWrap: "wrap", gap: 8 },
  moodChip: { display: "flex", alignItems: "center", gap: 6, border: "1.5px solid", borderRadius: 999, padding: "9px 15px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", transition: "all .2s" },
  moodMsg: { marginTop: 18, padding: 18, background: SAGE_SOFT, borderRadius: 16, fontSize: 14.5, lineHeight: 1.55 },
  muted: { color: "#9a9a95" },

  remCol: { display: "flex", flexDirection: "column", gap: 10 },
  remCard: { display: "flex", gap: 14, alignItems: "flex-start", padding: 16, borderRadius: 16, transition: "all .25s" },
  remNum: { fontSize: 12, fontWeight: 800, color: INK, opacity: 0.5, marginTop: 2 },
  remTitle: { fontWeight: 800, fontSize: 14.5, marginBottom: 4 },
  remBody: { fontSize: 13, color: "#5a5a55", lineHeight: 1.45 },
  remCheck: { display: "flex", alignItems: "center" },

  igniteBand: { background: INK, color: "#fff", borderRadius: 22, padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" },
  igniteText: { display: "flex", flexDirection: "column", gap: 6 },
  igniteHeadline: { fontSize: 24, fontWeight: 800, letterSpacing: -0.6 },
  igniteBtn: { background: SAGE, color: "#fff", border: "none", borderRadius: 999, padding: "16px 32px", fontSize: 18, fontWeight: 800, cursor: "pointer", letterSpacing: 0.3 },
  blastBanner: { marginTop: 12, background: CREAM, borderRadius: 18, padding: "20px 24px", fontSize: 16.5, fontWeight: 600, lineHeight: 1.5 },

  footer: { marginTop: 24, fontSize: 11.5, color: "#9a9a95", display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" },
  footChip: { background: CARD, border: "1px solid #E0E0DB", borderRadius: 999, padding: "3px 9px", fontWeight: 600, color: "#6a6a65" },
};
