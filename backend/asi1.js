// ASI1 (Fetch.ai ASI-1) integration. OpenAI-compatible chat completions API.
// Called ONLY from the backend so the API key never reaches the browser.
//
// GUARDRAILS (enforced via system prompt + post-processing):
//  - This is a wellness/journaling tool, NOT a diagnostic or crisis tool.
//  - The model must never diagnose, label conditions, or give medical advice.
//  - Output is short, warm, peer-toned, and specific to what the student wrote.

const SENTIMENTS = ["stressed", "low", "okay", "good", "great"];

const SYSTEM_PROMPT = `You are PocketPal, a warm, casual peer-style companion inside a daily mental-health check-in app for teenagers. A student just did a 30-second check-in.

Your job, based ONLY on what they actually shared:
1. acknowledgment: 1-2 sentences gently acknowledging what they shared. Reflect their specific words/situation, not a generic platitude. Talk like a supportive friend, not a clinician.
2. tip: ONE short, specific, doable thing — a grounding technique, a tiny journaling prompt, or an encouraging reflection — that fits what they wrote. Keep it concrete and small.
3. sentiment: classify their overall state as exactly one of: "stressed", "low", "okay", "good", "great".

HARD RULES:
- Never diagnose, name, or hint at any mental-health condition.
- Never give medical advice or claim to be a therapist or crisis service.
- Never be alarming. Stay calm and kind even if the note sounds rough.
- Keep acknowledgment + tip combined under ~60 words total.
- Respond with ONLY a valid JSON object, no markdown, no extra text:
{"acknowledgment": "...", "tip": "...", "sentiment": "okay"}`;

function moodLabel(mood) {
  return (
    { 1: "very low", 2: "low", 3: "okay", 4: "good", 5: "great" }[mood] ||
    "unspecified"
  );
}

// Local fallback so the demo never hard-fails if the API is unreachable.
function fallback(mood) {
  const sentiment = mood <= 2 ? "low" : mood === 3 ? "okay" : "good";
  return {
    acknowledgment:
      "Thanks for checking in today — showing up for yourself counts.",
    tip: "Take three slow breaths, in for 4 and out for 6. Notice one thing around you that feels steady.",
    sentiment,
    _fallback: true,
  };
}

function coerce(parsed, mood) {
  const out = fallback(mood);
  if (parsed && typeof parsed === "object") {
    if (typeof parsed.acknowledgment === "string")
      out.acknowledgment = parsed.acknowledgment.trim();
    if (typeof parsed.tip === "string") out.tip = parsed.tip.trim();
    if (SENTIMENTS.includes(parsed.sentiment)) out.sentiment = parsed.sentiment;
    delete out._fallback;
  }
  return out;
}

export async function analyzeCheckin({ mood, note }) {
  const apiKey = process.env.ASI1_API_KEY;
  const baseUrl = process.env.ASI1_BASE_URL || "https://api.asi1.ai/v1";
  const model = process.env.ASI1_MODEL || "asi1-mini";

  if (!apiKey) {
    console.warn("[asi1] no ASI1_API_KEY set — using local fallback.");
    return fallback(mood);
  }

  const userMsg = `Mood (1-5 emoji scale): ${mood} (${moodLabel(mood)}).
Note from the student: ${note?.trim() ? note.trim() : "(they didn't write anything today)"}`;

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMsg },
        ],
        temperature: 0.6,
        max_tokens: 300,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[asi1] ${res.status} ${res.statusText}: ${body}`);
      return fallback(mood);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content ?? "";
    // Strip stray code fences / prose around the JSON if the model adds any.
    const match = content.match(/\{[\s\S]*\}/);
    let parsed = null;
    try {
      parsed = JSON.parse(match ? match[0] : content);
    } catch {
      console.error("[asi1] could not parse JSON from model:", content);
    }
    return coerce(parsed, mood);
  } catch (err) {
    console.error("[asi1] request failed:", err.message);
    return fallback(mood);
  }
}

const WEEK_SYSTEM_PROMPT = `You are PocketPal, a warm peer-style companion for teenagers. You have been given a student's last 7 days of daily check-ins.

Write 1-2 warm, specific sentences surfacing a pattern you notice across the week. Reference actual words or topics they wrote. Never be generic. Never diagnose anything.

Return ONLY valid JSON, no markdown:
{"insight": "...", "trend": "up"|"down"|"stable"}

trend: "up" if mood generally improved over the week, "down" if it declined, "stable" if roughly flat.`;

export async function analyzeWeek(checkins) {
  const apiKey = process.env.ASI1_API_KEY;
  const baseUrl = process.env.ASI1_BASE_URL || "https://api.asi1.ai/v1";
  const model = process.env.ASI1_MODEL || "asi1-mini";

  if (!apiKey) return { insight: null };

  const lines = checkins
    .map(
      (c) =>
        `${c.date.slice(0, 10)} | mood ${c.mood}/5 | ${c.sentiment} | ${c.note?.trim() || "(no note)"}`,
    )
    .join("\n");

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: WEEK_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Student's last 7 days of check-ins (newest first):\n${lines}`,
          },
        ],
        temperature: 0.5,
        max_tokens: 200,
      }),
    });

    if (!res.ok) return { insight: null };

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content ?? "";
    const match = content.match(/\{[\s\S]*\}/);
    let parsed = null;
    try {
      parsed = JSON.parse(match ? match[0] : content);
    } catch {
      return { insight: null };
    }

    if (parsed?.insight && typeof parsed.insight === "string") {
      return {
        insight: parsed.insight.trim(),
        trend: ["up", "down", "stable"].includes(parsed.trend)
          ? parsed.trend
          : "stable",
      };
    }
    return { insight: null };
  } catch {
    return { insight: null };
  }
}

export { SENTIMENTS };
