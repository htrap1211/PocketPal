const TREND_ICON = { up: "↑", down: "↓", stable: "→" };

export default function WeeklyInsight({ insight, trend = "stable", loading }) {
  if (loading) {
    return (
      <div className="neo-card mb-[40px] p-[24px] sm:mb-[48px] sm:p-[34px]">
        <div className="mb-[16px] h-[11px] w-[80px] animate-pulse rounded-[14px] bg-[#6f7f8c]/12" />
        <div className="h-[28px] w-full animate-pulse rounded-[14px] bg-[#6f7f8c]/12" />
        <div className="mt-[12px] h-[28px] w-3/4 animate-pulse rounded-[14px] bg-[#6f7f8c]/12" />
      </div>
    );
  }

  if (!insight) return null;

  return (
    <div className="neo-card mb-[40px] animate-fade-in p-[24px] sm:mb-[48px] sm:p-[34px]">
      <p className="neo-label uppercase">
        this week's pattern
      </p>
      <p className="mt-[24px] text-[22px] font-bold leading-[1.35] text-[#26313b] sm:text-[28px] md:text-[30px]">
        {insight}
      </p>
      <p className="mt-[24px] text-[12px] font-semibold text-[#6f96b8]">
        {TREND_ICON[trend]}&nbsp;&nbsp;
        {{ up: "mood trending up", down: "mood trending down", stable: "holding steady" }[trend]}
      </p>
    </div>
  );
}
