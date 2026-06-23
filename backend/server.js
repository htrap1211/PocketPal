import "dotenv/config";
import express from "express";
import cors from "cors";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { analyzeCheckin, analyzeWeek, generateMonthlyReflection, generateChapter, generateMovieRecap } from "./asi1.js";
import { addCheckin, getCheckins } from "./storage.js";
import {
  buildMemoryContext,
  computeThemeStats,
  computeProfile,
  calcLongestStreak,
  THEME_EMOJI,
} from "./themes.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FUTURE_ME_PATH = join(__dirname, "data", "future-me.json");

async function readFutureMe() {
  if (!existsSync(FUTURE_ME_PATH)) return [];
  try {
    const raw = await readFile(FUTURE_ME_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeFutureMe(list) {
  await mkdir(join(__dirname, "data"), { recursive: true });
  await writeFile(FUTURE_ME_PATH, JSON.stringify(list, null, 2), "utf8");
}

const app = express();
const PORT = process.env.PORT || 8787;

// Allow Netlify frontend + localhost dev. Set ALLOWED_ORIGIN in Railway env vars.
const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
app.use(cors({ origin: allowedOrigin }));
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

// ── Chapter ───────────────────────────────────────────────────────────────────
app.get("/api/chapter", async (_req, res) => {
  try {
    const checkins = await getCheckins();
    const now = new Date();
    const monthly = checkins.filter((c) => {
      const d = new Date(c.date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });

    if (monthly.length < 3) return res.json({ chapter: null });

    const averageMood = +(monthly.reduce((s, c) => s + c.mood, 0) / monthly.length).toFixed(1);
    const longestStreak = calcLongestStreak(monthly);
    const themeStats = computeThemeStats(monthly);
    const profile = computeProfile(monthly);

    const themes = themeStats.map((t) => t.theme);
    const topPositiveFactor = profile.positiveFactors[0] || null;

    const sorted = [...monthly].sort((a, b) => new Date(a.date) - new Date(b.date));
    const dateRange = `${sorted[0].date.slice(0, 10)} to ${sorted[sorted.length - 1].date.slice(0, 10)}`;

    const chapter = await generateChapter({
      checkins: monthly.length,
      averageMood,
      themes,
      longestStreak,
      dateRange,
      topPositiveFactor,
    });

    res.json({ chapter });
  } catch (err) {
    console.error("[chapter] error:", err);
    res.status(500).json({ error: "could not generate chapter" });
  }
});

// ── Core memories ─────────────────────────────────────────────────────────────
app.get("/api/core-memories", async (_req, res) => {
  try {
    const checkins = await getCheckins();
    if (!checkins.length) return res.json({ memories: [] });

    const sorted = [...checkins].sort((a, b) => new Date(a.date) - new Date(b.date));
    const memories = [];

    // 1. first_five — first check-in with mood=5
    const firstFive = sorted.find((c) => c.mood === 5);
    if (firstFive) {
      memories.push({
        id: "first_five",
        title: "First Great Day",
        date: firstFive.date,
        description: "The first time you marked your mood as 5 — a great day worth remembering.",
        type: "milestone",
        emoji: "⭐",
      });
    }

    // 2. longest_streak — if streak >= 3
    const MS = 86_400_000;
    const toDay = (iso) => {
      const d = new Date(iso);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    };
    const days = [...new Set(sorted.map((c) => toDay(c.date)))].sort((a, b) => a - b);
    let maxStreak = 1, curStreak = 1, streakEnd = days[0];
    for (let i = 1; i < days.length; i++) {
      if (days[i] - days[i - 1] === MS) {
        curStreak++;
        if (curStreak > maxStreak) { maxStreak = curStreak; streakEnd = days[i]; }
      } else {
        curStreak = 1;
      }
    }
    if (maxStreak >= 3) {
      const streakEndDate = new Date(streakEnd).toISOString();
      memories.push({
        id: "longest_streak",
        title: "On A Roll",
        date: streakEndDate,
        description: `You checked in ${maxStreak} days in a row — that kind of consistency is rare and worth celebrating.`,
        type: "streak",
        emoji: "🔥",
      });
    }

    // 3. best_improvement — largest single mood jump (diff >= 2)
    let bestJump = 0, bestJumpDate = null;
    for (let i = 1; i < sorted.length; i++) {
      const diff = sorted[i].mood - sorted[i - 1].mood;
      if (diff > bestJump) { bestJump = diff; bestJumpDate = sorted[i].date; }
    }
    if (bestJump >= 2) {
      memories.push({
        id: "best_improvement",
        title: "Turning It Around",
        date: bestJumpDate,
        description: `Your mood jumped ${bestJump} point${bestJump > 1 ? "s" : ""} in a single day. That kind of turnaround takes real resilience.`,
        type: "growth",
        emoji: "📈",
      });
    }

    // 4. most_consistent_week — 7-day window with most entries (>= 5)
    let bestWindow = 0, bestWindowEnd = null;
    for (let i = 0; i < sorted.length; i++) {
      const windowStart = new Date(sorted[i].date).getTime();
      const windowEnd = windowStart + 7 * MS;
      const count = sorted.filter((c) => {
        const t = new Date(c.date).getTime();
        return t >= windowStart && t < windowEnd;
      }).length;
      if (count > bestWindow) { bestWindow = count; bestWindowEnd = sorted[i].date; }
    }
    if (bestWindow >= 5) {
      memories.push({
        id: "most_consistent_week",
        title: "A Week of Showing Up",
        date: bestWindowEnd,
        description: `You checked in ${bestWindow} times in a single week. Showing up for yourself that consistently? That matters.`,
        type: "consistency",
        emoji: "📅",
      });
    }

    // 5. top_positive_theme — theme with highest avg mood >= 4.0
    const themeStats = computeThemeStats(checkins);
    const topPositive = themeStats.filter((t) => t.averageMood >= 4.0)
      .sort((a, b) => b.averageMood - a.averageMood)[0];
    if (topPositive) {
      const emoji = THEME_EMOJI[topPositive.theme] || "✦";
      memories.push({
        id: "top_positive_theme",
        title: `${topPositive.theme.charAt(0).toUpperCase() + topPositive.theme.slice(1)} Lifts You Up`,
        date: checkins[0].date,
        description: `On days you mentioned ${topPositive.theme}, your average mood was ${topPositive.averageMood}/5. That's a pattern worth noticing.`,
        type: "theme",
        emoji,
      });
    }

    res.json({ memories });
  } catch (err) {
    console.error("[core-memories] error:", err);
    res.status(500).json({ error: "could not compute core memories" });
  }
});

// ── Future Me — POST ──────────────────────────────────────────────────────────
app.post("/api/future-me", async (req, res) => {
  try {
    const { message, unlockDays } = req.body || {};

    if (typeof message !== "string" || message.trim().length < 1 || message.length > 1000)
      return res.status(400).json({ error: "message must be between 1 and 1000 characters" });

    if (![30, 90, 365].includes(Number(unlockDays)))
      return res.status(400).json({ error: "unlockDays must be 30, 90, or 365" });

    const createdAt = new Date().toISOString();
    const unlockDate = new Date(Date.now() + Number(unlockDays) * 86400000).toISOString();

    const entry = {
      id: randomUUID(),
      message: message.trim(),
      createdAt,
      unlockDate,
    };

    const list = await readFutureMe();
    list.push(entry);
    await writeFutureMe(list);

    // Return WITHOUT message field
    const { message: _msg, ...publicEntry } = entry;
    res.json(publicEntry);
  } catch (err) {
    console.error("[future-me POST] error:", err);
    res.status(500).json({ error: "could not save your message" });
  }
});

// ── Future Me — GET ───────────────────────────────────────────────────────────
app.get("/api/future-me", async (_req, res) => {
  try {
    const list = await readFutureMe();
    const now = Date.now();

    const messages = list.map((entry) => {
      const unlockTime = new Date(entry.unlockDate).getTime();
      if (now >= unlockTime) {
        return { ...entry, unlocked: true };
      } else {
        const { message: _msg, ...rest } = entry;
        return {
          ...rest,
          unlocked: false,
          daysLeft: Math.ceil((unlockTime - now) / 86400000),
        };
      }
    });

    res.json({ messages });
  } catch (err) {
    console.error("[future-me GET] error:", err);
    res.status(500).json({ error: "could not load future messages" });
  }
});

// ── Movie Recap ───────────────────────────────────────────────────────────────
app.get("/api/movie-recap", async (_req, res) => {
  try {
    const checkins = await getCheckins();
    const now = new Date();
    const monthly = checkins.filter((c) => {
      const d = new Date(c.date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });

    if (monthly.length < 3) return res.json({ recap: null });

    const averageMood = +(monthly.reduce((s, c) => s + c.mood, 0) / monthly.length).toFixed(1);
    const longestStreak = calcLongestStreak(monthly);
    const themeStats = computeThemeStats(monthly);
    const profile = computeProfile(monthly);
    const themes = themeStats.map((t) => t.theme);
    const topPositiveFactor = profile.positiveFactors[0] || null;

    const sorted = [...monthly].sort((a, b) => new Date(a.date) - new Date(b.date));
    const dateRange = `${sorted[0].date.slice(0, 10)} to ${sorted[sorted.length - 1].date.slice(0, 10)}`;

    const recap = await generateMovieRecap({
      checkins: monthly.length,
      averageMood,
      themes,
      longestStreak,
      dateRange,
      topPositiveFactor,
    });

    res.json({ recap });
  } catch (err) {
    console.error("[movie-recap] error:", err);
    res.status(500).json({ error: "could not generate movie recap" });
  }
});

// ── Wrapped ───────────────────────────────────────────────────────────────────
app.get("/api/wrapped", async (_req, res) => {
  try {
    const checkins = await getCheckins();
    const now = new Date();
    const monthly = checkins.filter((c) => {
      const d = new Date(c.date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });

    if (!monthly.length) return res.json({ wrapped: null });

    const averageMood = +(monthly.reduce((s, c) => s + c.mood, 0) / monthly.length).toFixed(1);
    const longestStreak = calcLongestStreak(monthly);
    const themeStats = computeThemeStats(monthly);
    const profile = computeProfile(monthly);

    const topTheme = themeStats[0]?.theme || null;
    const topPositiveFactor = profile.positiveFactors[0] || null;

    // bestDay: date of highest mood entry
    const bestEntry = monthly.reduce((best, c) => (!best || c.mood > best.mood) ? c : best, null);
    const bestDay = bestEntry?.date || null;

    const { summary: reflection } = await generateMonthlyReflection({
      checkins: monthly.length,
      averageMood,
      longestStreak,
      topTheme,
      topPositiveFactor,
    });

    res.json({
      wrapped: {
        averageMood,
        bestDay,
        topTheme,
        longestStreak,
        checkinCount: monthly.length,
        reflection,
        themeStats,
        profile,
      },
    });
  } catch (err) {
    console.error("[wrapped] error:", err);
    res.status(500).json({ error: "could not generate wrapped" });
  }
});

// ── Demo data generator ───────────────────────────────────────────────────────
app.post("/api/demo", async (req, res) => {
  try {
    const TEEN_NOTES = [
      "had soccer practice today, so tired but it was actually fun",
      "test tomorrow and i haven't studied enough",
      "studied all night, feel like i'm gonna fail",
      "think i did okay on the exam actually",
      "hanging out with friends this weekend, needed that",
      "mom and i had a fight about my grades",
      "just really tired. nothing bad just drained",
      "proud of myself today, finished all my homework early",
      "can't sleep. keep thinking about stuff",
      "good day. lunch was fun, people were being nice",
      "soccer game went really well, scored a goal!",
      "stressed about the history essay due friday",
      "watched a movie with my family, actually nice",
      "i don't know why but i just feel kind of blah",
      "finals are coming up and i'm freaking out",
      "finally done with exams!! feeling so relieved",
      "been reading a lot lately, it actually helps",
      "friend drama today. don't really want to talk about it",
      "stayed up too late gaming, definitely gonna regret it",
      "had a really good talk with my best friend",
      "so much homework i don't know where to start",
      "weekend vibes, feel way more relaxed",
      "teacher was actually really kind today",
      "running late on everything this week",
      "art class is the one thing i actually look forward to",
      "",
      "",
      "didn't do much today",
      "okay day i guess",
      "feeling a bit better than yesterday",
    ];

    const now = new Date();
    const entries = [];

    for (let i = 89; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat

      // Realistic mood arc: starts ~3, dips during exam weeks, good weekends
      // Exam weeks: roughly days 10-20 and 55-65 back from today
      let baseMood;
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isExamWeek = (i >= 10 && i <= 20) || (i >= 55 && i <= 65);
      const isPostExam = i === 9 || i === 54;

      if (isExamWeek) baseMood = 2;
      else if (isPostExam) baseMood = 4;
      else if (isWeekend) baseMood = 4;
      else if (i > 70) baseMood = 3; // start of period — getting going
      else baseMood = 3;

      // Add noise
      const noise = Math.random() < 0.3 ? (Math.random() < 0.5 ? 1 : -1) : 0;
      const mood = Math.min(5, Math.max(1, baseMood + noise));

      const note = TEEN_NOTES[Math.floor(Math.random() * TEEN_NOTES.length)];

      // Sentiment based on mood
      const sentimentMap = { 1: "low", 2: "stressed", 3: "okay", 4: "good", 5: "great" };
      const sentiment = sentimentMap[mood] || "okay";

      entries.push({ date: date.toISOString(), mood, note, sentiment,
        acknowledgment: "Thanks for checking in today.", tip: "Take a breath." });
    }

    // Use addCheckin-like approach but batch write
    const { readFile: rf, writeFile: wf, mkdir: mkd } = await import("node:fs/promises");
    const { dirname: dn, join: jn } = await import("node:path");
    const { fileURLToPath: ftu } = await import("node:url");
    const dir = jn(dn(ftu(import.meta.url)), "data");
    const dbPath = jn(dir, "checkins.json");

    let existing = [];
    try {
      const raw = await rf(dbPath, "utf8");
      existing = JSON.parse(raw);
    } catch {}

    let added = 0;
    for (const entry of entries) {
      const record = {
        id: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ...entry,
      };
      existing.push(record);
      added++;
    }

    await mkd(dir, { recursive: true });
    await wf(dbPath, JSON.stringify(existing, null, 2), "utf8");

    res.json({ added });
  } catch (err) {
    console.error("[demo] error:", err);
    res.status(500).json({ error: "could not generate demo data" });
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
