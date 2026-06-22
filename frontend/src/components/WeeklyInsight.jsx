const TREND_ICON = { up: "↑", down: "↓", stable: "→" };

export default function WeeklyInsight({ insight, trend = "stable", loading }) {
  if (loading) {
    return (
      <div className="mb-[48px] bg-ink-black px-[40px] py-[48px]">
        <div className="mb-[16px] h-[11px] w-[80px] animate-pulse bg-carbon/60" />
        <div className="h-[28px] w-full animate-pulse bg-carbon/60" />
        <div className="mt-[12px] h-[28px] w-3/4 animate-pulse bg-carbon/60" />
      </div>
    );
  }

  if (!insight) return null;

  return (
    <div className="mb-[48px] animate-fade-in bg-ink-black px-[40px] py-[48px]">
      <p className="text-[11px] font-normal uppercase tracking-widest text-smoke">
        this week's pattern
      </p>
      <p className="mt-[28px] text-[30px] font-light leading-[1.25] text-paper-white">
        {insight}
      </p>
      <p className="mt-[28px] text-[12px] font-normal text-ash">
        {TREND_ICON[trend]}&nbsp;&nbsp;
        {{ up: "mood trending up", down: "mood trending down", stable: "holding steady" }[trend]}
      </p>
    </div>
  );
}
