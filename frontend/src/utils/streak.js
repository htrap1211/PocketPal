// Returns the current consecutive-day check-in streak.
// checkins must be sorted newest-first (backend already does this).
export function calcStreak(checkins) {
  if (!checkins.length) return 0;

  const toDay = (iso) => {
    const d = new Date(iso);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  };

  const days = [...new Set(checkins.map((c) => toDay(c.date)))].sort(
    (a, b) => b - a,
  );

  const MS_DAY = 86400000;
  const today = toDay(new Date().toISOString());

  // Streak only counts if the student checked in today or yesterday.
  if (days[0] < today - MS_DAY) return 0;

  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    if (days[i - 1] - days[i] === MS_DAY) streak++;
    else break;
  }
  return streak;
}
