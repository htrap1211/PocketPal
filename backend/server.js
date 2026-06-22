import "dotenv/config";
import express from "express";
import cors from "cors";
import { analyzeCheckin, analyzeWeek, generateMonthlyReflection } from "./asi1.js";
import { addCheckin, getCheckins } from "./storage.js";
import {
  buildMemoryContext,
  computeThemeStats,
  computeProfile,
  calcLongestStreak,
} from "./themes.js";

const app = express();
const PORT = process.env.PORT || 8787;

app.use(cors());
app.use(express.json());

const LOW_SENTIMENTS = new Set(["stressed", "low"]);

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, model: process.env.ASI1_MODEL || "asi1-mini" });
});

// ── Check-in (Feature 1: memory context injected) ─────────────────────────────
app.post("/api/checkin", async (req, res) => {
  try {
    const mood = Number(req.body?.mood);
    const note = typeof req.body?.note === "string" ? req.body.note : "";

    if (!Number.isInteger(mood) || mood < 1 || mood > 5)
      return res.status(400).json({ error: "mood must be an integer 1-5" });

    // Build memory context from last 7 check-ins (themes only, never raw quotes).
    const allCheckins = await getCheckins();
    const recent7 = allCheckins.slice(0, 7);
    const memoryContext = buildMemoryContext(recent7);

    const ai = await analyzeCheckin({ mood, note, memoryContext });
    const saved = await addCheckin({
      mood,
      note,
      sentiment: ai.sentiment,
      acknowledgment: ai.acknowledgment,
      tip: ai.tip,
    });

    res.json({ checkin: saved, escalate: shouldEscalate(allCheckins) });
  } catch (err) {
    console.error("[checkin] error:", err);
    res.status(500).json({ error: "something went wrong saving your check-in" });
  }
});

// ── Check-ins list ────────────────────────────────────────────────────────────
app.get("/api/checkins", async (_req, res) => {
  try {
    const checkins = await getCheckins();
    res.json({ checkins, escalate: shouldEscalate(checkins) });
  } catch (err) {
    console.error("[checkins] error:", err);
    res.status(500).json({ error: "could not load check-ins" });
  }
});

// ── Weekly summary ────────────────────────────────────────────────────────────
app.get("/api/weekly-summary", async (_req, res) => {
  try {
    const checkins = await getCheckins();
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent = checkins.filter((c) => new Date(c.date).getTime() >= weekAgo);
    if (recent.length < 2) return res.json({ insight: null });
    res.json(await analyzeWeek(recent));
  } catch (err) {
    console.error("[weekly-summary] error:", err);
    res.json({ insight: null });
  }
});

// ── Feature 2: Wellness profile ───────────────────────────────────────────────
app.get("/api/profile", async (_req, res) => {
  try {
    const checkins = await getCheckins();
    res.json(computeProfile(checkins));
  } catch (err) {
    console.error("[profile] error:", err);
    res.status(500).json({ error: "could not compute profile" });
  }
});

// ── Feature 4: Theme correlation stats ───────────────────────────────────────
app.get("/api/insights", async (_req, res) => {
  try {
    const checkins = await getCheckins();
    res.json({ themeStats: computeThemeStats(checkins) });
  } catch (err) {
    console.error("[insights] error:", err);
    res.status(500).json({ error: "could not compute insights" });
  }
});

// ── Feature 3: Monthly reflection / wrapped ───────────────────────────────────
app.get("/api/monthly-reflection", async (_req, res) => {
  try {
    const checkins = await getCheckins();
    const now = new Date();
    const monthly = checkins.filter((c) => {
      const d = new Date(c.date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });

    if (!monthly.length) return res.json({ summary: null, checkins: 0 });

    const averageMood = +(monthly.reduce((s, c) => s + c.mood, 0) / monthly.length).toFixed(1);
    const longestStreak = calcLongestStreak(monthly);
    const themeStats = computeThemeStats(monthly);
    const profile = computeProfile(monthly);

    const topTheme = themeStats[0]?.theme || null;
    const topPositiveFactor = profile.positiveFactors[0] || null;

    const { summary } = await generateMonthlyReflection({
      checkins: monthly.length,
      averageMood,
      longestStreak,
      topTheme,
      topPositiveFactor,
    });

    res.json({
      checkins: monthly.length,
      averageMood,
      longestStreak,
      topTheme,
      topPositiveFactor,
      summary,
      profile,
      themeStats,
    });
  } catch (err) {
    console.error("[monthly-reflection] error:", err);
    res.status(500).json({ error: "could not generate reflection" });
  }
});

// ── Soft escalation ───────────────────────────────────────────────────────────
function shouldEscalate(checkins) {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return checkins.filter(
    (c) => new Date(c.date).getTime() >= weekAgo && LOW_SENTIMENTS.has(c.sentiment),
  ).length >= 3;
}

app.listen(PORT, () => {
  console.log(`PocketPal backend running on http://localhost:${PORT}`);
});
