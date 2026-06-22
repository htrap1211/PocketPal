import { MOODS } from "../constants.js";

export default function MoodPicker({ value, onChange }) {
  return (
    <div className="flex gap-[12px]">
      {MOODS.map((m) => {
        const active = value === m.score;
        return (
          <button
            key={m.score}
            type="button"
            onClick={() => onChange(m.score)}
            aria-pressed={active}
            aria-label={m.label}
            className={`group flex flex-1 flex-col items-center gap-[12px] py-[28px] transition-all duration-200 ${
              active
                ? "bg-ink-black"
                : "bg-paper-white border border-ash/30 hover:border-ash"
            }`}
          >
            <span
              key={active ? `${m.score}-on` : m.score}
              className={`text-[32px] leading-none ${active ? "animate-bounce-in" : ""}`}
            >
              {m.emoji}
            </span>
            <span
              className={`text-[11px] font-normal uppercase tracking-widest ${
                active ? "text-paper-white" : "text-ash group-hover:text-carbon"
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
