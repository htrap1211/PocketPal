// ASI1 (Fetch.ai ASI-1) integration. OpenAI-compatible chat completions API.
// Called ONLY from the backend so the API key never reaches the browser.
//
// GUARDRAILS:
//  - Wellness/journaling tool ONLY — never diagnose, never infer conditions.
//  - Memory context references topic categories only, never raw user quotes.

const SENTIMENTS = ["stressed", "low", "okay", "good", "great"];

const CHECKIN_SYSTEM_PROMPT = `You are PocketPal, a warm, casual peer-style companion inside a daily mental-health check-in app for teenagers. A student just did a 30-second check-in.

Your job, based ONLY on what they actually shared:
1. acknowledgment: 1-2 sentences gently acknowledging what they shared. Reflect their specific words/situation. Talk like a supportive friend, not a clinician. If recent context is provided, you may reference recurring topics naturally — never in a clinical way.
2. tip: ONE short, specific, doable thing — a grounding technique, a tiny journaling prompt, or an encouraging reflection — that fits what they wrote.
3. sentiment: classify their overall state as exactly one of: "stressed", "low", "okay", "good", "great".

HARD RULES:
- Never diagnose, name, or hint at any mental-health condition.
- Never give medical advice or claim to be a therapist or crisis service.
- Never be alarming. Stay calm and kind even if the note sounds rough.
- Keep acknowledgment + tip combined under ~70 words total.
- Respond with ONLY a valid JSON object, no markdown, no extra text:
{"acknowledgment": "...", "tip": "...", "sentiment": "okay"}`;

const WEEK_SYSTEM_PROMPT = `You are PocketPal, a warm peer-style companion for teenagers. You have been given a student's last 7 days of daily check-ins.

Write 1-2 warm, specific sentences surfacing a pattern you notice across the week. Reference actual words or topics they wrote. Never be generic. Never diagnose anything.

Return ONLY valid JSON, no markdown:
{"insight": "...", "trend": "up"|"down"|"stable"}

trend: "up" if mood generally improved over the week, "down" if it declined, "stable" if roughly flat.`;

const MONTHLY_SYSTEM_PROMPT = `You are PocketPal, a warm peer-style companion for teenagers. You are writing a monthly reflection for a student based on their check-in data.

Write a short, warm, supportive monthly reflection. Be specific to the data provided. Be reflective and encouraging, not clinical. Under 120 words. No diagnosis. No medical advice.

Return ONLY valid JSON, no markdown:
{"summary": "..."}`;

function moodLabel(m) {
  return { 1: "very low", 2: "low", 3: "okay", 4: "good", 5: "great" }[m] || "unspecified";
}

function fallback(mood) {
  const sentiment = mood <= 2 ? "low" : mood === 3 ? "okay" : "good";
  return {
    acknowledgment: "Thanks for checking in today — showing up for yourself counts.",
    tip: "Take three slow breaths, in for 4 and out for 6. Notice one thing around you that feels steady.",
    sentiment,
    _fallback: true,
  };
}

function coerce(parsed, mood) {
  const out = fallback(mood);
  if (parsed && typeof parsed === "object") {
    if (typeof parsed.acknowledgment === "string") out.acknowledgment = parsed.acknowledgment.trim();
    if (typeof parsed.tip === "string") out.tip = parsed.tip.trim();
    if (SENTIMENTS.includes(parsed.sentiment)) out.sentiment = parsed.sentiment;
    delete out._fallback;
  }
  return out;
}

async function callASI1(messages, maxTokens = 300, temperature = 0.6) {
  const apiKey = process.env.ASI1_API_KEY;
  const baseUrl = process.env.ASI1_BASE_URL || "https://api.asi1.ai/v1";
  const model = process.env.ASI1_MODEL || "asi1-mini";

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`[asi1] ${res.status}: ${body}`);
    return null;
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content ?? "";
  const match = content.match(/\{[\s\S]*\}/);
  try {
    return JSON.parse(match ? match[0] : content);
  } catch {
    console.error("[asi1] JSON parse failed:", content);
    return null;
  }
}

// Feature 1: per-check-in analysis with optional memory context.
export async function analyzeCheckin({ mood, note, memoryContext = null }) {
  if (!process.env.ASI1_API_KEY) {
    console.warn("[asi1] no key — fallback");
    return fallback(mood);
  }

  const contextLine = memoryContext ? `\nContext: ${memoryContext}` : "";
  const userMsg = `Mood (1-5): ${mood} (${moodLabel(mood)}).
Note: ${note?.trim() || "(no note today)"}${contextLine}`;

  try {
    const parsed = await callASI1(
      [{ role: "system", content: CHECKIN_SYSTEM_PROMPT }, { role: "user", content: userMsg }],
      350, 0.6,
    );
    return coerce(parsed, mood);
  } catch (err) {
    console.error("[asi1] analyzeCheckin failed:", err.message);
    return fallback(mood);
  }
}

// Weekly pattern summary.
export async function analyzeWeek(checkins) {
  if (!process.env.ASI1_API_KEY) return { insight: null };

  const lines = checkins
    .map((c) => `${c.date.slice(0, 10)} | mood ${c.mood}/5 | ${c.sentiment} | ${c.note?.trim() || "(no note)"}`)
    .join("\n");

  try {
    const parsed = await callASI1(
      [
        { role: "system", content: WEEK_SYSTEM_PROMPT },
        { role: "user", content: `Student's last 7 check-ins (newest first):\n${lines}` },
      ],
      200, 0.5,
    );
    if (parsed?.insight && typeof parsed.insight === "string") {
      return {
        insight: parsed.insight.trim(),
        trend: ["up", "down", "stable"].includes(parsed.trend) ? parsed.trend : "stable",
      };
    }
    return { insight: null };
  } catch {
    return { insight: null };
  }
}

// Monthly reflection — supportive summary, non-clinical, <120 words.
export async function generateMonthlyReflection({ checkins, averageMood, longestStreak, topTheme, topPositiveFactor }) {
  if (!process.env.ASI1_API_KEY) return { summary: null };

  const userMsg = `Student's month: ${checkins} check-ins, average mood ${averageMood}/5, longest streak ${longestStreak} days, most common topic: ${topTheme || "varied"}, top positive activity: ${topPositiveFactor || "not identified"}.`;

  try {
    const parsed = await callASI1(
      [
        { role: "system", content: MONTHLY_SYSTEM_PROMPT },
        { role: "user", content: userMsg },
      ],
      220, 0.55,
    );
    return { summary: typeof parsed?.summary === "string" ? parsed.summary.trim() : null };
  } catch {
    return { summary: null };
  }
}

export { SENTIMENTS };
