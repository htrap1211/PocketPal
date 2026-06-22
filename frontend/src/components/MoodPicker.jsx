import { MOODS } from "../constants.js";

export default function MoodPicker({ value, onChange }) {
  return (
    <fieldset className="border-none p-0 m-0">
      <legend className="sr-only">Rate your mood today</legend>
      <div className="flex gap-[6px] sm:gap-[12px]">
        {MOODS.map((m) => {
          const active = value === m.score;
          return (
            <button
              key={m.score}
              type="button"
              onClick={() => onChange(m.score)}
              aria-pressed={active}
              aria-label={`${m.label} — mood ${m.score} out of 5`}
              className={`group flex flex-1 flex-col items-center gap-[8px] sm:gap-[12px] py-[16px] sm:py-[24px] min-h-[88px] transition-all duration-200 ${
                active
                  ? "bg-[#1e1b2e] ring-1 ring-paper-white/20 scale-[1.02]"
                  : "bg-paper-white border border-ash/30 hover:border-ash hover:scale-[1.04]"
              }`}
            >
              <span
                key={active ? `${m.score}-on` : m.score}
                className={`text-[24px] sm:text-[30px] leading-none ${active ? "animate-bounce-in" : ""}`}
              >
                {m.emoji}
              </span>
              <span
                className={`text-[9px] sm:text-[11px] font-normal uppercase tracking-widest ${
                  active ? "text-paper-white" : "text-ash group-hover:text-carbon"
                }`}
              >
                {m.label}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
