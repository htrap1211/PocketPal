import "dotenv/config";
import express from "express";
import cors from "cors";
import { analyzeCheckin, analyzeWeek } from "./asi1.js";
import { addCheckin, getCheckins } from "./storage.js";

const app = express();
const PORT = process.env.PORT || 8787;

app.use(cors());
app.use(express.json());

// Sentiments that count as "needs a gentle nudge" for soft escalation.
const LOW_SENTIMENTS = new Set(["stressed", "low"]);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, model: process.env.ASI1_MODEL || "asi1-mini" });
});

// POST /api/checkin  { mood: 1-5, note?: string }
// Sends to ASI1, saves result, returns the AI response + escalation flag.
app.post("/api/checkin", async (req, res) => {
  try {
    const mood = Number(req.body?.mood);
    const note = typeof req.body?.note === "string" ? req.body.note : "";

    if (!Number.isInteger(mood) || mood < 1 || mood > 5) {
      return res.status(400).json({ error: "mood must be an integer 1-5" });
    }

    const ai = await analyzeCheckin({ mood, note });
    const saved = await addCheckin({
      mood,
      note,
      sentiment: ai.sentiment,
      acknowledgment: ai.acknowledgment,
      tip: ai.tip,
    });

    res.json({ checkin: saved, escalate: await shouldEscalate() });
  } catch (err) {
    console.error("[checkin] error:", err);
    res.status(500).json({ error: "something went wrong saving your check-in" });
  }
});

// GET /api/checkins -> { checkins: [...], escalate: bool }
app.get("/api/checkins", async (_req, res) => {
  try {
    const checkins = await getCheckins();
    res.json({ checkins, escalate: await shouldEscalate() });
  } catch (err) {
    console.error("[checkins] error:", err);
    res.status(500).json({ error: "could not load check-ins" });
  }
});

// GET /api/weekly-summary -> { insight: string|null, trend: 'up'|'down'|'stable' }
app.get("/api/weekly-summary", async (_req, res) => {
  try {
    const checkins = await getCheckins();
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent = checkins.filter(
      (c) => new Date(c.date).getTime() >= weekAgo,
    );
    if (recent.length < 2) return res.json({ insight: null });
    const result = await analyzeWeek(recent);
    res.json(result);
  } catch (err) {
    console.error("[weekly-summary] error:", err);
    res.json({ insight: null });
  }
});

// Soft escalation: 3+ check-ins in the last 7 days flagged stressed/low.
async function shouldEscalate() {
  const checkins = await getCheckins();
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentLow = checkins.filter(
    (c) => new Date(c.date).getTime() >= weekAgo && LOW_SENTIMENTS.has(c.sentiment),
  );
  return recentLow.length >= 3;
}

app.listen(PORT, () => {
  console.log(`PocketPal backend running on http://localhost:${PORT}`);
});
