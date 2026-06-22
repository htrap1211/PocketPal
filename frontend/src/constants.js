export const MOODS = [
  { score: 1, emoji: "😣", label: "Rough" },
  { score: 2, emoji: "🙁", label: "Low" },
  { score: 3, emoji: "😐", label: "Okay" },
  { score: 4, emoji: "🙂", label: "Good" },
  { score: 5, emoji: "😄", label: "Great" },
];

export const SENTIMENT_META = {
  stressed: { label: "stressed", color: "#9a9a9a" },
  low:      { label: "low",      color: "#9a9a9a" },
  okay:     { label: "okay",     color: "#6d6d6d" },
  good:     { label: "good",     color: "#181818" },
  great:    { label: "great",    color: "#181818" },
};

export function moodMeta(score) {
  return MOODS.find((m) => m.score === score) || MOODS[2];
}
