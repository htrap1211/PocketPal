const THEME_EMOJI = {
  school: "📚", friends: "👥", family: "🏠", sports: "⚽",
  sleep: "😴", health: "💊", hobbies: "🎨",
};

function FactorPill({ theme, variant }) {
  return (
    <span
      className={`inline-flex items-center gap-[8px] rounded-[75px] border px-[16px] py-[8px] text-[12px] font-normal ${
        variant === "positive"
          ? "border-carbon text-carbon"
          : "border-ash text-ash"
      }`}
    >
      <span>{THEME_EMOJI[theme] || "✦"}</span>
      {theme}
    </span>
  );
}

export default function WellnessProfile({ profile, loading }) {
  if (loading) {
    return (
      <div className="mb-[80px]">
        <div className="grid gap-[40px] md:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i}>
              <div className="mb-[20px] h-[11px] w-[100px] animate-pulse bg-smoke/30" />
              <div className="flex flex-wrap gap-[8px]">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-[36px] w-[100px] animate-pulse rounded-[75px] bg-smoke/20" />
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
      <p className="mb-[80px] text-[16px] font-normal text-ash">
        Check in a few more times to see your wellness profile.
      </p>
    );
  }

  return (
    <div className="mb-[80px]">
      <div className="grid gap-[48px] md:grid-cols-2">
        <div>
          <p className="mb-[20px] text-[11px] font-normal uppercase tracking-widest text-ash">
            lifts your mood
          </p>
          {hasPositive ? (
            <div className="flex flex-wrap gap-[8px]">
              {profile.positiveFactors.map((t) => (
                <FactorPill key={t} theme={t} variant="positive" />
              ))}
            </div>
          ) : (
            <p className="text-[14px] font-normal text-smoke">not enough data yet</p>
          )}
        </div>
        <div>
          <p className="mb-[20px] text-[11px] font-normal uppercase tracking-widest text-ash">
            tends to weigh on you
          </p>
          {hasStress ? (
            <div className="flex flex-wrap gap-[8px]">
              {profile.stressFactors.map((t) => (
                <FactorPill key={t} theme={t} variant="stress" />
              ))}
            </div>
          ) : (
            <p className="text-[14px] font-normal text-smoke">nothing flagged — nice</p>
          )}
        </div>
      </div>
    </div>
  );
}
