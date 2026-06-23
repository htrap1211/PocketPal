// Thin API client.
// Dev: Vite proxy forwards /api → localhost:8787 (see vite.config.js).
// Prod: VITE_API_URL env var points to Railway backend; empty string = same origin.

const BASE = import.meta.env.VITE_API_URL ?? "";

export async function submitCheckin({ mood, note }) {
  const res = await fetch(`${BASE}/api/checkin`, {
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
  const res = await fetch(`${BASE}/api/checkins`);
  if (!res.ok) throw new Error("Could not load your check-ins.");
  return res.json();
}

export async function fetchWeeklySummary() {
  const res = await fetch(`${BASE}/api/weekly-summary`);
  if (!res.ok) return { insight: null };
  return res.json();
}

export async function fetchProfile() {
  const res = await fetch(`${BASE}/api/profile`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchInsights() {
  const res = await fetch(`${BASE}/api/insights`);
  if (!res.ok) return { themeStats: [] };
  return res.json();
}

export async function fetchMonthlyReflection() {
  const res = await fetch(`${BASE}/api/monthly-reflection`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchChapter() {
  const res = await fetch(`${BASE}/api/chapter`);
  if (!res.ok) return { chapter: null };
  return res.json();
}

export async function fetchCoreMemories() {
  const res = await fetch(`${BASE}/api/core-memories`);
  if (!res.ok) return { memories: [] };
  return res.json();
}

export async function submitFutureMe({ message, unlockDays }) {
  const res = await fetch(`${BASE}/api/future-me`, {
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
  const res = await fetch(`${BASE}/api/future-me`);
  if (!res.ok) return { messages: [] };
  return res.json();
}

export async function fetchMovieRecap() {
  const res = await fetch(`${BASE}/api/movie-recap`);
  if (!res.ok) return { recap: null };
  return res.json();
}

export async function fetchWrapped() {
  const res = await fetch(`${BASE}/api/wrapped`);
  if (!res.ok) return { wrapped: null };
  return res.json();
}

export async function generateDemo() {
  const res = await fetch(`${BASE}/api/demo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Could not generate demo data.");
  }
  return res.json();
}
