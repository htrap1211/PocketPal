import { useEffect, useRef, useState } from "react";

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
      <div className="neo-section">
        <div className="neo-container">
        <p className="neo-label mb-[36px] uppercase">
          this month
        </p>
        <div className="grid grid-cols-2 gap-[32px] sm:gap-[40px] md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="neo-card p-[18px]">
              <div className="mb-[8px] h-[48px] w-[80px] animate-pulse rounded-[14px] bg-[#6f7f8c]/12 sm:h-[54px]" />
              <div className="h-[11px] w-[60px] animate-pulse rounded-[14px] bg-[#6f7f8c]/12" />
            </div>
          ))}
        </div>
        </div>
      </div>
    );
  }

  if (!data || data.checkins === 0) return null;

  return (
    <div className="neo-section animate-fade-in">
      <div className="neo-container neo-card-warm p-[24px] sm:p-[34px]">
      <p className="neo-label mb-[34px] uppercase">
        this month
      </p>

      {/* Stats grid */}
      <div className="mb-[38px] grid grid-cols-2 gap-[14px] md:grid-cols-4">
        <div className="neo-inset p-[18px]">
          <p className="text-[44px] sm:text-[54px] font-bold leading-none text-[#26313b]">
            <CountUp end={data.checkins} />
          </p>
          <p className="neo-label mt-[8px] uppercase">
            check-ins
          </p>
        </div>
        <div className="neo-inset p-[18px]">
          <p className="text-[44px] sm:text-[54px] font-bold leading-none text-[#26313b]">
            <CountUp end={data.averageMood} decimals={1} />
          </p>
          <p className="neo-label mt-[8px] uppercase">
            avg mood
          </p>
        </div>
        <div className="neo-inset p-[18px]">
          <p className="text-[44px] sm:text-[54px] font-bold leading-none text-[#26313b]">
            <CountUp end={data.longestStreak} />
          </p>
          <p className="neo-label mt-[8px] uppercase">
            day streak
          </p>
        </div>
        <div className="neo-inset p-[18px]">
          <p className="text-[44px] sm:text-[54px] font-bold uppercase leading-none text-[#26313b]">
            {data.topTheme ? data.topTheme.slice(0, 2) : "--"}
          </p>
          <p className="neo-label mt-[8px] uppercase">
            {data.topTheme || "top theme"}
          </p>
        </div>
      </div>

      {/* AI reflection */}
      {data.summary && (
        <div className="neo-inset max-w-[720px] p-[22px] sm:p-[26px]">
          <p className="neo-label mb-[16px] uppercase">
            monthly reflection
          </p>
          <p className="text-[16px] sm:text-[18px] font-normal leading-[1.6] text-[#26313b]">
            {data.summary}
          </p>
        </div>
      )}
      </div>
    </div>
  );
}
