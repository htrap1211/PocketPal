function FactorPill({ theme, variant }) {
  return (
    <span
      className={`inline-flex items-center gap-[8px] rounded-[14px] px-[14px] py-[9px] text-[12px] font-semibold ${
        variant === "positive"
          ? "bg-[#d9ebfa] text-[#26313b] shadow-[inset_-4px_-4px_10px_rgba(255,255,255,0.85),inset_4px_4px_10px_rgba(145,162,176,0.18)]"
          : "bg-[#edf3f7] text-[#6f7f8c] shadow-[-5px_-5px_14px_rgba(255,255,255,0.78),5px_5px_14px_rgba(145,162,176,0.16)]"
      }`}
    >
      <span className="uppercase">{theme.slice(0, 2)}</span>
      {theme}
    </span>
  );
}

export default function WellnessProfile({ profile, loading }) {
  if (loading) {
    return (
      <div className="mb-[40px] sm:mb-[64px] md:mb-[80px]">
        <div className="grid gap-[32px] sm:gap-[40px] md:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="neo-card p-[22px]">
              <div className="mb-[20px] h-[11px] w-[100px] animate-pulse rounded-[14px] bg-[#6f7f8c]/20" />
              <div className="flex flex-wrap gap-[8px]">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-[36px] w-[100px] animate-pulse rounded-[14px] bg-[#6f7f8c]/12" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasPositive = profile?.positiveFactors?.length > 0;
  const hasStress = profile?.stressFactors?.length > 0;

  if (!hasPositive && !hasStress) {
    return (
      <p className="mb-[40px] sm:mb-[80px] text-[15px] sm:text-[16px] font-normal text-[#6f7f8c]">
        Check in a few more times to see your wellness profile.
      </p>
    );
  }

  return (
    <div className="mb-[40px] sm:mb-[64px] md:mb-[80px]">
      <div className="grid gap-[40px] sm:gap-[48px] md:grid-cols-2">
        <div className="neo-card p-[24px]">
          <p className="neo-label mb-[20px] uppercase">
            lifts your mood
          </p>
          {hasPositive ? (
            <div className="flex flex-wrap gap-[8px]">
              {profile.positiveFactors.map((t) => (
                <FactorPill key={t} theme={t} variant="positive" />
              ))}
            </div>
          ) : (
            <p className="text-[14px] font-normal text-[#6f7f8c]">not enough data yet</p>
          )}
        </div>
        <div className="neo-card p-[24px]">
          <p className="neo-label mb-[20px] uppercase">
            tends to weigh on you
          </p>
          {hasStress ? (
            <div className="flex flex-wrap gap-[8px]">
              {profile.stressFactors.map((t) => (
                <FactorPill key={t} theme={t} variant="stress" />
              ))}
            </div>
          ) : (
            <p className="text-[14px] font-normal text-[#6f7f8c]">nothing flagged yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
