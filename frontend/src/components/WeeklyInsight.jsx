const TREND_ICON = { up: "↑", down: "↓", stable: "→" };

export default function WeeklyInsight({ insight, trend = "stable", loading }) {
  if (loading) {
    return (
      <div className="mb-[40px] sm:mb-[48px] bg-[#0d0c14] px-[20px] sm:px-[40px] py-[40px] sm:py-[48px]">
        <div className="mb-[16px] h-[11px] w-[80px] animate-pulse bg-paper-white/10" />
        <div className="h-[28px] w-full animate-pulse bg-paper-white/10" />
        <div className="mt-[12px] h-[28px] w-3/4 animate-pulse bg-paper-white/10" />
      </div>
    );
  }

  if (!insight) return null;

  return (
    <div className="mb-[40px] sm:mb-[48px] animate-fade-in bg-[#0d0c14] px-[20px] sm:px-[40px] py-[40px] sm:py-[48px]">
      <p className="text-[11px] font-normal uppercase tracking-widest text-smoke">
        ✦ &nbsp;this week's pattern
      </p>
      <p className="mt-[24px] sm:mt-[28px] text-[22px] sm:text-[28px] md:text-[30px] font-light leading-[1.3] text-paper-white">
        {insight}
      </p>
      <p className="mt-[24px] sm:mt-[28px] text-[12px] font-normal text-smoke/70">
        {TREND_ICON[trend]}&nbsp;&nbsp;
        {{ up: "mood trending up", down: "mood trending down", stable: "holding steady" }[trend]}
      </p>
    </div>
  );
}
