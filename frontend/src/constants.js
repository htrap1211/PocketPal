// Shared mood + sentiment metadata used across check-in and dashboard.

export const MOODS = [
  { score: 1, emoji: "😣", label: "Rough" },
  { score: 2, emoji: "🙁", label: "Low" },
  { score: 3, emoji: "😐", label: "Okay" },
  { score: 4, emoji: "🙂", label: "Good" },
  { score: 5, emoji: "😄", label: "Great" },
];

// Sentiment -> display chip. Violet stays the only chromatic accent (per design);
// sentiment uses neutral grays + the mint/iris decorative accents sparingly.
export const SENTIMENT_META = {
  stressed: { label: "stressed", color: "#8f8f8f" },
  low: { label: "low", color: "#8f8f8f" },
  okay: { label: "okay", color: "#2e2e2e" },
  good: { label: "good", color: "#5d48db" },
  great: { label: "great", color: "#5d48db" },
};

export function moodMeta(score) {
  return MOODS.find((m) => m.score === score) || MOODS[2];
}
