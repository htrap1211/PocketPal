import { MOODS } from "../constants.js";

export default function MoodPicker({ value, onChange }) {
  return (
    <fieldset className="border-none p-0 m-0">
      <legend className="sr-only">Rate your mood today</legend>
      <div className="grid grid-cols-5 gap-[8px] sm:gap-[12px]">
        {MOODS.map((m) => {
          const active = value === m.score;
          return (
            <button
              key={m.score}
              type="button"
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(8);
                onChange(m.score);
              }}
              aria-pressed={active}
              aria-label={`${m.label} — mood ${m.score} out of 5`}
              className={`group flex min-h-[92px] flex-col items-center justify-center gap-[10px] rounded-[14px] transition-all duration-200 ${
                active
                  ? "bg-[#d9ebfa] text-[#26313b] shadow-[inset_-5px_-5px_12px_rgba(255,255,255,0.86),inset_5px_5px_12px_rgba(145,162,176,0.22)]"
                  : "bg-[#edf3f7]/75 text-[#6f7f8c] shadow-[-5px_-5px_14px_rgba(255,255,255,0.78),5px_5px_14px_rgba(145,162,176,0.16)] hover:text-[#26313b]"
              }`}
            >
              <span
                key={active ? `${m.score}-on` : m.score}
                className={`flex h-[34px] w-[34px] items-center justify-center rounded-[12px] text-[18px] font-bold leading-none ${
                  active ? "animate-bounce-in bg-white/42" : "bg-white/35"
                }`}
              >
                {m.score}
              </span>
              <span
                className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.04em]"
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
