import { useEffect, useRef, useState } from "react";

const THEME_EMOJI = {
  school: "📚", friends: "👥", family: "🏠", sports: "⚽",
  sleep: "😴", health: "💊", hobbies: "🎨",
};

function CountUp({ end, decimals = 0, duration = 1400 }) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (!end && end !== 0) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(+(end * eased).toFixed(decimals));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [end, decimals, duration]);

  return <>{val}</>;
}

export default function MonthlyWrapped({ data, loading }) {
  if (loading) {
    return (
      <div className="bg-[#0d0c14] px-[20px] sm:px-[32px] md:px-[48px] lg:px-[80px] py-[48px] sm:py-[64px]">
        <p className="mb-[36px] sm:mb-[40px] text-[11px] font-normal uppercase tracking-widest text-smoke">
          this month
        </p>
        <div className="grid grid-cols-2 gap-[32px] sm:gap-[40px] md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="mb-[8px] h-[48px] sm:h-[54px] w-[80px] animate-pulse bg-paper-white/10" />
              <div className="h-[11px] w-[60px] animate-pulse bg-paper-white/10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.checkins === 0) return null;

  return (
    <div className="animate-fade-in bg-[#0d0c14] px-[20px] sm:px-[32px] md:px-[48px] lg:px-[80px] py-[48px] sm:py-[64px]">
      <p className="mb-[40px] sm:mb-[48px] text-[11px] font-normal uppercase tracking-widest text-smoke">
        this month
      </p>

      {/* Stats grid */}
      <div className="mb-[48px] sm:mb-[64px] grid grid-cols-2 gap-x-[24px] sm:gap-x-[40px] gap-y-[40px] sm:gap-y-[48px] md:grid-cols-4">
        <div>
          <p className="text-[44px] sm:text-[54px] font-light leading-none text-paper-white">
            <CountUp end={data.checkins} />
          </p>
          <p className="mt-[8px] text-[11px] font-normal uppercase tracking-widest text-smoke">
            check-ins
          </p>
        </div>
        <div>
          <p className="text-[44px] sm:text-[54px] font-light leading-none text-paper-white">
            <CountUp end={data.averageMood} decimals={1} />
          </p>
          <p className="mt-[8px] text-[11px] font-normal uppercase tracking-widest text-smoke">
            avg mood
          </p>
        </div>
        <div>
          <p className="text-[44px] sm:text-[54px] font-light leading-none text-paper-white">
            <CountUp end={data.longestStreak} />
          </p>
          <p className="mt-[8px] text-[11px] font-normal uppercase tracking-widest text-smoke">
            day streak
          </p>
        </div>
        <div>
          <p className="text-[44px] sm:text-[54px] font-light leading-none text-paper-white">
            {data.topTheme ? (THEME_EMOJI[data.topTheme] || "✦") : "—"}
          </p>
          <p className="mt-[8px] text-[11px] font-normal uppercase tracking-widest text-smoke">
            {data.topTheme || "top theme"}
          </p>
        </div>
      </div>

      {/* AI reflection */}
      {data.summary && (
        <div className="max-w-[640px] border-t border-paper-white/10 pt-[36px] sm:pt-[40px]">
          <p className="mb-[20px] text-[11px] font-normal uppercase tracking-widest text-smoke">
            monthly reflection
          </p>
          <p className="text-[16px] sm:text-[18px] font-light leading-[1.5] text-paper-white">
            {data.summary}
          </p>
        </div>
      )}
    </div>
  );
}
