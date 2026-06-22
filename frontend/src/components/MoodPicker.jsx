import { MOODS } from "../constants.js";

// Emoji 1-5 scale. Selected mood gets the violet hairline ring (only accent).
export default function MoodPicker({ value, onChange }) {
  return (
    <div className="flex justify-between gap-2">
      {MOODS.map((m) => {
        const active = value === m.score;
        return (
          <button
            key={m.score}
            type="button"
            onClick={() => onChange(m.score)}
            aria-pressed={active}
            aria-label={m.label}
            className={`flex flex-1 flex-col items-center gap-2 rounded-[30px] py-4 transition ${
              active
                ? "border border-hims-violet shadow-[0px_8px_30px_0px_rgba(0,0,0,0.06)]"
                : "border border-transparent hover:border-linen"
            }`}
          >
            <span className="text-[34px] leading-none">{m.emoji}</span>
            <span
              className={`text-[14px] tracking-body ${
                active ? "text-hims-violet" : "text-stone"
              }`}
            >
              {m.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
