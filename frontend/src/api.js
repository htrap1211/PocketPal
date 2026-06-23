// Thin API client. Uses the Vite dev proxy (/api -> backend). The ASI1 key
// lives only on the backend; the browser never sees it.

export async function submitCheckin({ mood, note }) {
  const res = await fetch("/api/checkin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mood, note }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Could not save your check-in.");
  }
  return res.json();
}

export async function fetchCheckins() {
  const res = await fetch("/api/checkins");
  if (!res.ok) throw new Error("Could not load your check-ins.");
  return res.json();
}

export async function fetchWeeklySummary() {
  const res = await fetch("/api/weekly-summary");
  if (!res.ok) return { insight: null };
  return res.json();
}

export async function fetchProfile() {
  const res = await fetch("/api/profile");
  if (!res.ok) return null;
  return res.json();
}

export async function fetchInsights() {
  const res = await fetch("/api/insights");
  if (!res.ok) return { themeStats: [] };
  return res.json();
}

export async function fetchMonthlyReflection() {
  const res = await fetch("/api/monthly-reflection");
  if (!res.ok) return null;
  return res.json();
}

export async function fetchChapter() {
  const res = await fetch("/api/chapter");
  if (!res.ok) return { chapter: null };
  return res.json();
}

export async function fetchCoreMemories() {
  const res = await fetch("/api/core-memories");
  if (!res.ok) return { memories: [] };
  return res.json();
}

export async function submitFutureMe({ message, unlockDays }) {
  const res = await fetch("/api/future-me", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, unlockDays }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Could not save your message.");
  }
  return res.json();
}

export async function fetchFutureMe() {
  const res = await fetch("/api/future-me");
  if (!res.ok) return { messages: [] };
  return res.json();
}

export async function fetchMovieRecap() {
  const res = await fetch("/api/movie-recap");
  if (!res.ok) return { recap: null };
  return res.json();
}

export async function fetchWrapped() {
  const res = await fetch("/api/wrapped");
  if (!res.ok) return { wrapped: null };
  return res.json();
}

export async function generateDemo() {
  const res = await fetch("/api/demo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Could not generate demo data.");
  }
  return res.json();
}
