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
